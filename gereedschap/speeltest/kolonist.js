// De kolonist (werklijst B, 1f; Marcel, 12 okt: "a1, b1, c1, d ja"): een speler in code die het lege begin (js/begin.js)
// speelt zoals een mens, met de handelingen van het bouwmenu: T.plaatsGebouw voor een gebouw, en T.legVeld voor een veld
// (de twee klikken, js/main.js). De speeltest (speler.js, de speler `kolonist`) en de toets (test/begin.test.cjs) laden
// allebei dit bestand, zodat ze dezelfde keuzes maken (a1). Elke dag één keer T.kolonistDag(D, dag): hij loopt zijn
// regels af, op volgorde, en doet wat er nu kan (d ja):
//   1. het huis van de schout, bij het kampvuur;
//   2. een boerderij, en zolang de akkers nog gezaaid worden (T.isNazaaitijd) akkers erbij, tot al het zaaigraan uit de
//      kar erop past;
//   3. een houthakker, als het hout laag wordt (onder `houtLaag`, of het haalt de winter niet);
//   4. hutten, tot elk gezin in het kamp een woning heeft, af of in aanbouw (een boerderij is ook een woning);
//   5. een jager, als het spel zegt dat het eten niet haalt: het haalt de winter niet (het bericht dat het spel dan geeft,
//      raadt zelf een jager aan), of er is honger (de status in de balk); hooguit één per `jagerNa` dagen (Marcel, 12 okt:
//      "a ja");
//   6. na de oogst (van `naDeOogst` tot `naDePluk`): haalt het eten de winter niet, dan een tweede veld. Een akker wordt
//      pas in de lente gezaaid, dus een wijngaard, die het gezin nog in wijnmaand plukt; en omdat een boerderij bij de
//      soort van haar eerste veld blijft, op een tweede boerderij.
// Wat hij deed, geeft hij terug: [{ soort, gelukt, reden, tekst, instantie }], zonder scherm, dus ook in een toets; en wat
// hij wil maar nog niet kan betalen, met `wacht` (dan morgen weer). Hij rekent niet vooruit en wacht niet op het juiste
// moment; hij doet wat er vandaag kan, zoals een speler die elke ochtend kijkt wat er nodig is.
(function (T) {
  'use strict';

  const IN = {
    houtLaag: 20, // onder zoveel hout een houthakker
    // Van 1 herfstmaand (na de oogst) tot 1 slachtmaand (na de pluk) kijkt hij of het eten de winter haalt; daarna
    // draagt een wijngaard pas volgend jaar.
    naDeOogst: 180,
    naDePluk: 240,
    jagerNa: 30, // een nieuwe jager pas zoveel dagen nadat de vorige af was
    waaromNa: 30, // waarom er geen plek is, zoekt hij zo vaak opnieuw uit
    // De maten die hij voor een veld probeert, de grootste eerst (T.BOERDERIJ_INSTELLINGEN: 12 tot 40 tegels).
    veldMaten: [[8, 5], [5, 8], [6, 6], [7, 5], [5, 7], [6, 5], [5, 6], [8, 4], [4, 8], [7, 4], [4, 7], [6, 4], [4, 6], [5, 4], [4, 5], [4, 4], [6, 2], [4, 3], [3, 4]],
  };
  T.KOLONIST = IN;

  const isWoning = (g) => !!(T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].woning) || g.soort === 'boerderij';
  const inHuis = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g);
  const boerderijen = (D) => D.gebouwen.filter((g) => g.soort === 'boerderij');
  // Het hart van zijn dorp: het kampvuur op het plein (het blijft een plek, ook als het uit is).
  const hart = (D) => D.wereld.kamp.vuur;

  // Een gebouw neerzetten zoals de speler het met het bouwmenu doet: waar het past, zo dicht mogelijk bij `bij`, op open
  // grond of anders waar het minst te rooien is (T.plekVoor, js/bouwen.js; zo zocht de bouwer van de speeltest ook).
  function bouw(D, soort, bij, waarom) {
    if (!T.inBouwmenu(D, soort)) return { soort, gelukt: false, reden: 'niet in het bouwmenu', tekst: `wil een ${soort} bouwen (${waarom}), maar hij staat niet in het bouwmenu` };
    const kosten = T.GEBOUWEN[soort].kosten;
    if (!T.kanBetalen(D, kosten)) {
      const mist = Object.keys(kosten).filter((wat) => (D.voorraad[wat] || 0) < kosten[wat]);
      return { soort, gelukt: false, wacht: true, reden: `wacht op ${mist.join(' en ')}`, tekst: `wil een ${soort} bouwen (${waarom}), maar wacht op ${mist.join(' en ')}` };
    }
    const plek = T.plekVoor(D, soort, bij);
    if (!plek) {
      const waaromNiet = waaromGeenPlek(D, soort);
      return { soort, gelukt: false, reden: `geen plek (${waaromNiet})`, tekst: `vindt geen plek voor een ${soort} (${waarom}): ${waaromNiet}` };
    }
    const u = T.plaatsGebouw(D, soort, plek.x, plek.y, plek.rooien || null);
    return { soort, gelukt: u.gelukt, reden: u.reden || null, instantie: u.instantie || null,
      tekst: u.gelukt ? `bouwt een ${soort} (${waarom})${plek.rooien ? ', waar eerst gerooid wordt' : ''}` : `wil een ${soort} bouwen (${waarom}), maar: ${u.reden}` };
  }

  // Waarom er binnen het bouwbereik nergens een `soort` past: de twee redenen die het spel het vaakst geeft (zoals de muis
  // ze zegt, T.waaromPastHetNiet), over elke plek in het vak van het bereik, met rooien en zonder wie er staat. Een keer per
  // `waaromNa` dagen per soort, want het kost een halve seconde; het is voor de speeltest, die zo zelf zegt wat er klemt.
  const WAAROM = new WeakMap();
  function waaromGeenPlek(D, soort) {
    const dag = Math.floor(D.kalender ? D.kalender.dag : 0);
    const bij = WAAROM.get(D) || {};
    WAAROM.set(D, bij);
    if (bij[soort] && dag - bij[soort].dag < IN.waaromNa) return bij[soort].tekst;
    const B = T.bouwBereikVan(D);
    const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || T.GEBOUWEN[soort].voet;
    const tel = new Map();
    for (let y = B.y0; y < B.y0 + B.h; y++) {
      for (let x = B.x0; x < B.x0 + B.b; x++) {
        if (!T.inBouwBereik(D, x, y)) continue;
        const r = T.waaromPastHetNiet(D, soort, x, y, null, T.kavelVan(D, x, y, voet), false) || 'past';
        tel.set(r, (tel.get(r) || 0) + 1);
      }
    }
    const tekst = [...tel].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([r, n]) => `${n}× "${r}"`).join(', ');
    bij[soort] = { dag, tekst };
    return tekst;
  }

  // Een veld bij boerderij `g`, zoals de speler het trekt: de grootste maat die past en niet groter is dan `tegels`, waar
  // het minst te rooien is, en dan het dichtst bij de boerderij. Geeft de rechthoek, of null.
  function veldPlek(D, soort, g, tegels) {
    const I = T.BOERDERIJ_INSTELLINGEN;
    const voet = T.voetVanGebouw(g);
    const ver = I.veldAfstand;
    const midden = { x: voet.x + voet.b / 2, y: voet.y + voet.h / 2 };
    const tot = Math.min(I.veldMax, Math.max(I.veldMin, tegels));
    for (const [b, h] of IN.veldMaten) {
      if (b * h > tot) continue;
      let beste = null;
      for (let y = voet.y - ver - h; y <= voet.y + voet.h + ver; y++) {
        for (let x = voet.x - ver - b; x <= voet.x + voet.b + ver; x++) {
          const r = { x, y, b, h };
          if (T.waaromPastVeldNiet(D, soort, r) || T.boerderijVoorVeld(D, soort, r).boerderij !== g) continue;
          const rooien = T.teRooienOp(D, r).length;
          const d = Math.hypot(x + b / 2 - midden.x, y + h / 2 - midden.y);
          if (!beste || rooien < beste.rooien || (rooien === beste.rooien && d < beste.d)) beste = { r, rooien, d };
        }
      }
      if (beste) return beste.r;
    }
    return null;
  }

  function legVeld(D, soort, g, tegels, waarom) {
    const r = veldPlek(D, soort, g, tegels);
    if (!r) return { soort, gelukt: false, reden: 'geen plek', tekst: `vindt geen plek voor een ${soort} bij de boerderij (${waarom})` };
    const u = T.legVeld(D, soort, r);
    return { soort, gelukt: u.gelukt, reden: u.reden || null, instantie: u.instantie || null,
      tekst: u.gelukt ? `legt een ${soort} van ${r.b} bij ${r.h} (${waarom})` : `wil een ${soort} leggen (${waarom}), maar: ${u.reden}` };
  }

  // Hoeveel akkertegels er zijn, of komen (in aanleg).
  function akkerTegels(D) {
    let n = 0;
    for (const a of D.wereld.akkers || []) if (a.boerderij) n += a.b * a.h;
    for (const v of D.gebouwen) if (v.soort === 'akker') n += v.voet.b * v.voet.h;
    return n;
  }

  // De gezinnen in het kamp die nog geen woning hebben: wie in een tent woont, min de woningen waar nog niemand woont (af,
  // of in aanbouw); in elk daarvan trekt een gezin (T.verhuisUitHetKamp, js/begin.js).
  function zonderWoning(D) {
    const inHetKamp = T.kampTenten(D).filter((t) => inHuis(D, t).length).length;
    const leeg = D.gebouwen.filter((g) => isWoning(g) && !inHuis(D, g).length).length;
    return inHetKamp - leeg;
  }

  T.kolonistDag = function (D, dag) {
    if (!D.begin || D.begin.kamp === 'onderweg') return [];
    const daden = [];
    const doe = (u) => daden.push(u);
    const heeft = (soort) => D.gebouwen.some((g) => g.soort === soort);

    // 1. Het huis van de schout: de eerste opslag, met zijn eigen bouwbereik.
    if (!heeft('schout')) doe(bouw(D, 'schout', hart(D), 'je huis en de eerste opslag'));

    // 2. Een boerderij, en akkers tot al het zaaigraan uit de kar erop past, zolang ze dit voorjaar nog gezaaid worden.
    if (!boerderijen(D).length) doe(bouw(D, 'boerderij', hart(D), 'het eten'));
    const eerste = boerderijen(D)[0];
    const zaaigraan = T.BEGIN_INSTELLINGEN.kar.zaaigraan / T.ZAAIGRAAN_PER_TEGEL;
    if (eerste && T.veldVan(eerste) !== 'wijngaard' && T.isNazaaitijd(dag)) {
      const nog = zaaigraan - akkerTegels(D);
      if (nog >= T.BOERDERIJ_INSTELLINGEN.veldMin) doe(legVeld(D, 'akker', eerste, nog, `voor ${zaaigraan} zaaigraan`));
    }

    // 3. Een houthakker, als het hout laag wordt.
    if (!heeft('houthakker') && ((D.voorraad.hout || 0) < IN.houtLaag || !T.houtVoorDeWinter(D, dag).haalt)) {
      doe(bouw(D, 'houthakker', hart(D), 'het hout wordt laag'));
    }

    // 4. Hutten, tot elk gezin in het kamp een woning heeft.
    for (let n = zonderWoning(D); n > 0; n--) {
      const u = bouw(D, 'hut', hart(D), 'voor een gezin in het kamp');
      doe(u);
      if (!u.gelukt) break;
    }

    // 5. Een jager, als het spel zegt dat het eten niet haalt; hooguit één per `jagerNa` dagen.
    const etenHaaltNiet = T.watDeWinterNietHaalt(D, dag).includes('eten') || !!T.OORZAKEN.honger.speelt(D, dag);
    const jagers = D.gebouwen.filter((g) => g.soort === 'jager');
    if (etenHaaltNiet && jagers.every((g) => g.klaar && g.klaarOp <= dag - IN.jagerNa)) doe(bouw(D, 'jager', hart(D), 'het eten haalt het niet'));

    // 6. Na de oogst: haalt het eten de winter niet, dan een wijngaard, op een boerderij die nog geen veld heeft.
    const inJaar = dag % T.DAGEN_PER_JAAR;
    if (inJaar >= IN.naDeOogst && inJaar < IN.naDePluk && !T.etenVoorDeWinter(D, dag).haalt) {
      const vrij = boerderijen(D).find((g) => !T.veldVan(g));
      if (vrij) doe(legVeld(D, 'wijngaard', vrij, T.BOERDERIJ_INSTELLINGEN.veldMax, 'het eten haalt de winter niet'));
      else if (!boerderijen(D).some((g) => T.veldVan(g) === 'wijngaard')) doe(bouw(D, 'boerderij', hart(D), 'voor een wijngaard: het eten haalt de winter niet'));
    }
    return daden;
  };
})(globalThis.Spel = globalThis.Spel || {});
