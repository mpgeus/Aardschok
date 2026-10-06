// De markt op het plein (werklijst vraag 110, d; Marcel, 5 okt: "Voor nu a1, b tot e ja"), en sinds vraag 127 een levende
// markt die meegroeit met de stad (Marcel, 6 okt: "Grotere stad = grotere markt"; "A ja, B ja, C c1 en c2, D ja, E
// marktdag"). In de speeltest van vier jaar kwam er in geen spel een markt: een eigen gebouw van 6 bij 6 vroeg 12 bij 12
// open grond, en die was op toen er goud was. Zo hield een dorp ook markt: op het plein, met kramen.
//
// - Hoe hij komt (110, d, a1): zoals elk gebouw, een inwoner vraagt het je (js/verzoeken.js), of jij hangt een oproep op.
//   Alleen de plek is het plein, niet een eigen stuk grond: T.plekVoor, T.waaromPastHetNiet en T.plaatsGebouw vragen het
//   hier. Kramen zijn geen huis (`kosten` hieronder, in de werkbank); T.GEBOUWEN.markt.kosten zegt het, naar de spelregel
//   "De markt" ("Op het plein", de standaard, of "Een eigen gebouw", zoals vóór 6 okt).
// - Het marktblok (127, B): twee rijen kramen tegenover elkaar, langs een as van de kaart, met twee tegels looppad ertussen
//   en een mand of kist naast elke kraam (T.marktBlok). Het spel zoekt het grootste open stuk plein buiten de kring van het
//   feest (T.feestMidden, js/feesten.js) en weg van de heer en zijn schandpaal (js/heer.js), waar het niemand de weg
//   verspert. Het blok ligt vast zodra de markt komt (`g.blok`), en vult zich kraam voor kraam.
// - Meegroeien (127, C): een kraam per `perMensen` mensen, minstens `begin` (T.kramenNodig), elke nacht hooguit één erbij
//   (T.tikMarktDag, vanuit T.tikGebouwenDag). Is het blok vol, dan komen de volgende langs de weg vanaf het plein, met hun
//   toonbank naar de weg: de marktstraat (c2, T.straatPlek). Een groter plein in de maker is c1 (js/maker.js).
// - Vol of leeg (127, A): elke kraam heeft zijn waar (KRAAMWAREN in gereedschap/pixelart/dorp.cjs; `volgorde` hieronder),
//   en ligt vol als het dorp die waar heeft (`waren`: de broodkraam brood, de viskraam vis of vlees), anders staat hij leeg,
//   met de luifel opgerold. Zo zie je op de markt hoe het dorp ervoor staat.
// - De markt staat als gebouw in D.gebouwen (`opHetPlein`, met `kramen`, `manden` en `blok`), zodat de wens van de stenen
//   huizen hem telt (T.plekkenVan, js/wensen.js), maar zonder voet: zijn plek is het midden van het plein.
// Nog niet (127, stap 3): de kooplui achter de kramen, de boodschappen (D) en de marktdag (E). En later de handel met de
// buren (vraag 72): "De markt wordt essentieel voor de handel" (Marcel, 5 okt).
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.MARKT_INSTELLINGEN = {
    // De spelregel "De markt": true, op het plein; false, een eigen gebouw van 6 bij 6 (T.GEBOUWEN.markt).
    opHetPlein: true,
    // Wat de kramen kosten. Een eigen gebouw kost wat T.GEBOUWEN.markt zegt (16 hout, 14 goud).
    kosten: { hout: 8, goud: 6 },
    // Zoveel kramen bij het begin, en daarna een per zoveel mensen in het dorp (vraag 127, C).
    begin: 4,
    perMensen: 15,
    // Zoveel kramen in een rij van het blok, en zoveel tegels tussen de twee rijen (de rij ertegenover inbegrepen: bij 3
    // ligt er een looppad van twee tegels tussen).
    perRij: 6,
    tussenRijen: 3,
    // Een kraam staat buiten de kring van het feest (T.FEESTEN_INSTELLINGEN.kring, om T.feestMidden), en nog zoveel
    // tegels verder.
    vanHetFeest: 0,
    // Zo ver blijft een kraam van de plek van de heer (en de marskramer), in tegels.
    vanDeHeer: 3,
    // De marktstraat: zo ver langs de weg vanaf het plein komen er kramen, en zo ver uit elkaar.
    straatTot: 30,
    straatAfstand: 2,
    // Welke waar de kramen hebben, in de volgorde waarin ze komen (de vijfde kraam heeft weer groente), en wat het dorp
    // in zijn voorraad moet hebben om ze vol te leggen.
    volgorde: ['groente', 'brood', 'vis', 'laken', 'potten'],
    waren: {
      groente: ['groente', 'eieren', 'kaas', 'graan'],
      brood: ['brood'],
      vis: ['vis', 'vlees'],
      laken: ['laken', 'wol'],
      potten: ['klei', 'vaten', 'gereedschap'],
    },
  };
  const IN = () => T.MARKT_INSTELLINGEN;

  // Wat naast een kraam op de grond staat, per waar, vol of leeg (gereedschap/pixelart/marktkraam.cjs, MANDEN).
  const MANDEN = {
    groente: ['mand appels', 'mand kolen'],
    brood: ['krat brood', 'zak'],
    vis: ['ton graan', 'ton leeg'],
    laken: ['krat wol', 'zak'],
    potten: ['zak', 'ton leeg'],
  };
  const LEGE_MAND = { vis: 'ton leeg', potten: 'ton leeg' };

  // Wat de markt kost, naar de spelregel: de kramen, of een eigen gebouw. Eén plek, zodat elke regel die
  // T.GEBOUWEN.markt.kosten vraagt (het bouwen, het verzoek, de raad, de inner) hetzelfde hoort.
  const eigenKosten = T.GEBOUWEN.markt.kosten;
  Object.defineProperty(T.GEBOUWEN.markt, 'kosten', { enumerable: true, get: () => (IN().opHetPlein ? IN().kosten : eigenKosten) });

  // Komt de markt hier op het plein? Naar de spelregel, en alleen op een kaart met een plein.
  T.marktOpHetPlein = (D) => !!IN().opHetPlein && T.pleinTegels(D.wereld).length > 0;

  const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  const sleutel = (x, y) => `${x},${y}`;
  // De kant waarheen een kraam kijkt, in de richtingen van het beeld (js/sprites.js, T.sprites.richtingVan): +x is ZO, +y
  // is ZW.
  const richtingNaar = (dx, dy) => (dx > 0 ? 'ZO' : dx < 0 ? 'NW' : dy > 0 ? 'ZW' : 'NO');

  // Het midden van het plein: de tegel van het plein het dichtst bij zijn zwaartepunt, waar het ook staat. Daar is de
  // markt als gebouw (zijn "deur", T.deurVan), en daarvandaan rekent een kring (de spelregel "De herberg en de markt").
  T.marktMidden = function (w) {
    const tegels = T.pleinTegels(w);
    if (!tegels.length) return null;
    const m = zwaartepunt(tegels);
    let beste = null;
    for (const t of tegels) {
      const a = Math.hypot(t.x - m.x, t.y - m.y);
      if (!beste || a < beste.a) beste = { x: t.x, y: t.y, a };
    }
    return { x: beste.x, y: beste.y };
  };
  function zwaartepunt(tegels) {
    return { x: tegels.reduce((s, t) => s + t.x, 0) / tegels.length, y: tegels.reduce((s, t) => s + t.y, 0) / tegels.length };
  }

  // Welke tegels je vanaf `van` bereikt, stap voor stap recht (niet schuin: strenger dan het lopen, js/pad.js), met de
  // tegels in `dicht` als muur. Zo houdt een kraam niemand tegen: wat je eerst bereikte, bereik je nog.
  function bereik(w, van, dicht) {
    const gezien = new Set([sleutel(van.x, van.y)]);
    const rij = [van];
    while (rij.length) {
      const t = rij.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = t.x + dx;
        const y = t.y + dy;
        const k = sleutel(x, y);
        if (gezien.has(k) || dicht.has(k) || !T.isBegaanbaar(w, x, y)) continue;
        gezien.add(k);
        rij.push({ x, y });
      }
    }
    return gezien;
  }
  // Houden deze tegels (dicht erbij, naast wat al dicht is) iemand tegen?
  function houdtTegen(w, van, al, erbij) {
    const voor = bereik(w, van, al);
    const dicht = new Set([...al, ...erbij]);
    const na = bereik(w, van, dicht);
    for (const k of voor) if (!dicht.has(k) && !na.has(k)) return true;
    return false;
  }

  // Wat een kraam in de weg zou staan: een deur, de heer en zijn schandpaal, het feest. `opPlein`: op het plein (het blok)
  // of ernaast (de straat).
  function regels(D) {
    const w = D.wereld;
    const tegels = T.pleinTegels(w);
    const midden = T.feestMidden(w) || zwaartepunt(tegels);
    const heer = w.heer || w.marskramer || null;
    const paal = (w.voorwerpen || []).find((v) => v.soort === 'schandpaal') || (heer ? T.plekVoorDeSchandpaal(D) : null);
    const weg = new Set(paal ? [sleutel(paal.x, paal.y), sleutel(paal.x + 1, paal.y + 1)] : []);
    const deuren = (D.gebouwen || []).filter((g) => !g.opHetPlein).map((g) => T.deurVan(w, g));
    const open = (x, y) => T.isBegaanbaar(w, x, y) && !T.voorwerpOp(w, x, y) && !T.bijDeur(w, x, y)
      && !weg.has(sleutel(x, y)) && !deuren.some((d) => cheb({ x, y }, d) <= 1);
    const feest = T.FEESTEN_INSTELLINGEN.kring + IN().vanHetFeest;
    const kraamMag = (x, y) => open(x, y) && cheb({ x, y }, midden) > feest && (!heer || cheb({ x, y }, heer) > IN().vanDeHeer);
    return { w, midden, open, kraamMag };
  }

  // Het marktblok (vraag 127, B): [{ x, y, richting, mand }], de plekken van de kramen in de volgorde waarin ze komen,
  // twee aan twee tegenover elkaar, vanaf het begin van de rij; `mand` is de tegel ernaast voor een mand of kist, of null.
  // Twee rijen langs een as van de kaart, op het plein, met `tussenRijen - 1` tegels looppad ertussen en een tegel tussen
  // twee kramen in een rij. Het grootste blok dat past en niemand tegenhoudt; bij gelijkspel het verst van het midden van
  // het feest. Puur: zet niets neer.
  T.marktBlok = function (D) {
    const R = regels(D);
    const w = R.w;
    const opPlein = (x, y) => T.opHetPlein(w, x, y);
    const open = (x, y) => opPlein(x, y) && R.open(x, y);
    const kraam = (x, y) => opPlein(x, y) && R.kraamMag(x, y);
    const n = IN().tussenRijen;
    const kandidaten = [];
    for (const [ax, ay] of [[1, 0], [0, 1]]) {
      for (const kant of [1, -1]) {
        const [px, py] = ax ? [0, kant] : [kant, 0];
        for (const t of T.pleinTegels(w)) {
          const plekken = [];
          for (let k = 0; k < IN().perRij; k++) {
            const a = { x: t.x + ax * 2 * k, y: t.y + ay * 2 * k };
            const b = { x: a.x + px * n, y: a.y + py * n };
            let pad = true;
            for (let i = 1; i < n; i++) if (!open(a.x + px * i, a.y + py * i)) pad = false;
            if (!pad || !kraam(a.x, a.y) || !kraam(b.x, b.y)) break;
            const mand = (p) => (k < IN().perRij - 1 && open(p.x + ax, p.y + ay) ? { x: p.x + ax, y: p.y + ay } : null);
            plekken.push({ ...a, richting: richtingNaar(px, py), mand: mand(a) });
            plekken.push({ ...b, richting: richtingNaar(-px, -py), mand: mand(b) });
          }
          if (plekken.length < 2) continue;
          const ver = plekken.reduce((s, p) => s + Math.hypot(p.x - R.midden.x, p.y - R.midden.y), 0) / plekken.length;
          kandidaten.push({ plekken, ver });
        }
      }
    }
    kandidaten.sort((a, b) => b.plekken.length - a.plekken.length || b.ver - a.ver);
    const al = new Set();
    for (const k of kandidaten.slice(0, 40)) {
      const dicht = k.plekken.flatMap((p) => [sleutel(p.x, p.y), ...(p.mand ? [sleutel(p.mand.x, p.mand.y)] : [])]);
      if (!houdtTegen(w, R.midden, al, dicht)) return k.plekken;
    }
    return [];
  };

  // De volgende plek in de marktstraat (vraag 127, c2): naast de weg die van het plein af loopt, met de toonbank naar de
  // weg, het dichtst bij het plein, niet op een veld, een erf of een pad, en niet te dicht bij een andere kraam. `bezet`:
  // de tegels die al dicht zijn (de kramen en manden die er staan, of nog komen). { x, y, richting, mand } of null.
  T.straatPlek = function (D, bezet = new Set(), kramen = []) {
    const R = regels(D);
    const w = R.w;
    const naast = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    // de weg, vanaf het plein: stap voor stap langs de tegels van het pad
    const start = [];
    for (const t of T.pleinTegels(w)) {
      for (const [dx, dy] of naast) if (T.opPad(w, t.x + dx, t.y + dy) && !T.opHetPlein(w, t.x + dx, t.y + dy)) start.push({ x: t.x + dx, y: t.y + dy, d: 1 });
    }
    const gezien = new Set(start.map((t) => sleutel(t.x, t.y)));
    const rij = [...start];
    const kan = (x, y) => !T.opHetPlein(w, x, y) && !bezet.has(sleutel(x, y)) && R.open(x, y) && !T.waaromNietOpDezeGrond(D, x, y);
    for (let i = 0; i < rij.length; i++) {
      const p = rij[i];
      for (const [dx, dy] of naast) {
        const x = p.x + dx;
        const y = p.y + dy;
        if (!kan(x, y) || kramen.some((k) => cheb(k, { x, y }) < IN().straatAfstand)) continue;
        // de mand ernaast, langs de weg
        const [mx, my] = [x + dy, y + dx];
        const mand = kan(mx, my) && !T.opPad(w, mx, my) ? { x: mx, y: my } : null;
        const dicht = [sleutel(x, y), ...(mand ? [sleutel(mand.x, mand.y)] : [])];
        if (houdtTegen(w, R.midden, bezet, dicht)) continue;
        return { x, y, richting: richtingNaar(-dx, -dy), mand };
      }
      if (p.d >= IN().straatTot) continue;
      for (const [dx, dy] of naast) {
        const x = p.x + dx;
        const y = p.y + dy;
        if (gezien.has(sleutel(x, y)) || !T.opPad(w, x, y) || T.opHetPlein(w, x, y)) continue;
        gezien.add(sleutel(x, y));
        rij.push({ x, y, d: p.d + 1 });
      }
    }
    return null;
  };

  // Hoeveel kramen het dorp nu wil: een per `perMensen` mensen, minstens `begin`.
  T.kramenNodig = (D) => Math.max(IN().begin, Math.floor((D.bevolking || 0) / IN().perMensen));

  // Heeft het dorp deze waar? Dan ligt zijn kraam vol.
  T.heeftWaar = (D, waar) => (IN().waren[waar] || []).some((wat) => (D.voorraad[wat] || 0) > 0);

  // De plekken voor de eerste kramen, zoals de markt ze zou zetten als hij nu kwam: uit het blok, en past het daar niet,
  // langs de straat. Voor het verzoek (de plekken in goud op de grond) en de vraag of hij kan komen.
  T.kraamPlekken = function (D, aantal = IN().begin) {
    const plekken = T.marktBlok(D).slice(0, aantal);
    const bezet = new Set(plekken.flatMap((p) => [sleutel(p.x, p.y), ...(p.mand ? [sleutel(p.mand.x, p.mand.y)] : [])]));
    while (plekken.length < aantal) {
      const p = T.straatPlek(D, bezet, plekken);
      if (!p) break;
      plekken.push(p);
      bezet.add(sleutel(p.x, p.y));
      if (p.mand) bezet.add(sleutel(p.mand.x, p.mand.y));
    }
    return plekken;
  };

  // Waarom de markt hier niet op het plein kan, of null: er staat er al een, of de kramen passen niet.
  T.waaromGeenMarktOpHetPlein = function (D) {
    if ((D.gebouwen || []).some((g) => g.soort === 'markt' && g.opHetPlein)) return 'Op het plein staat al een markt.';
    if (T.kraamPlekken(D).length < IN().begin) return 'Op het plein is geen plaats voor de kramen.';
    return null;
  };

  // Waar de markt komt, voor een verzoek (T.plekVoor, js/verzoeken.js): het midden van het plein, met de kramen erbij, of
  // null als hij er niet kan komen.
  T.marktPlek = function (D) {
    if (T.waaromGeenMarktOpHetPlein(D)) return null;
    return { ...T.marktMidden(D.wereld), kramen: T.kraamPlekken(D) };
  };

  // Een kraam neerzetten op zijn plek, met zijn mand ernaast: de waar naar zijn nummer (`volgorde`), vol of leeg naar de
  // voorraad. Wie er staat, stapt opzij.
  function zetKraam(D, g, plek) {
    const w = D.wereld;
    const i = g.kramen.length;
    const waar = IN().volgorde[i % IN().volgorde.length];
    const leeg = !T.heeftWaar(D, waar);
    const kraam = T.zetVoorwerp(w, { soort: 'kraam', x: plek.x, y: plek.y, richting: plek.richting, waar, leeg, inAanbouw: !g.klaar });
    g.kramen.push(kraam);
    T.stapEraf(D, { x: plek.x, y: plek.y, b: 1, h: 1 });
    if (plek.mand) {
      const mand = T.zetVoorwerp(w, { soort: 'mand', x: plek.mand.x, y: plek.mand.y, waar, nr: i, wat: mandVan(waar, i, leeg) });
      g.manden.push(mand);
      T.stapEraf(D, { x: plek.mand.x, y: plek.mand.y, b: 1, h: 1 });
    }
  }
  const mandVan = (waar, nr, leeg) => (leeg ? LEGE_MAND[waar] || 'mand leeg' : MANDEN[waar][Math.floor(nr / IN().volgorde.length) % MANDEN[waar].length]);

  // De markt op het plein zetten (T.plaatsGebouw, js/gebouwen.js): betalen, het blok vastleggen, en de eerste kramen, in
  // aanbouw tot de markt klaar is (T.tikGebouwenDag). Zelfde antwoord als T.plaatsGebouw: { gelukt, reden, instantie,
  // bericht }.
  T.zetMarktOpHetPlein = function (D) {
    const g = T.GEBOUWEN.markt;
    const reden = T.waaromGeenMarktOpHetPlein(D);
    if (reden) return { gelukt: false, reden };
    if (!T.kanBetalen(D, g.kosten)) return { gelukt: false, reden: 'Daar is de voorraad niet groot genoeg voor.' };
    const eerste = T.kraamPlekken(D);
    const blok = T.marktBlok(D);
    T.betaalKosten(D, g.kosten);
    const dag = D.kalender ? Math.floor(D.kalender.dag) : 0;
    const midden = T.marktMidden(D.wereld);
    const klaar = g.bouwtijd <= 0;
    const instantie = { soort: 'markt', x: midden.x, y: midden.y, voet: { b: 1, h: 1 }, tekening: null, klaar, klaarOp: dag + g.bouwtijd, handen: 0, voorwerp: null, opHetPlein: true, kramen: [], manden: [], blok };
    for (const plek of eerste) zetKraam(D, instantie, plek);
    D.gebouwen.push(instantie);
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(D);
    return { gelukt: true, instantie, bericht: `De kramen van de markt komen op het plein (${g.bouwtijd} dag${g.bouwtijd === 1 ? '' : 'en'}).` };
  };

  // Elke nacht (T.tikGebouwenDag): wil het dorp meer kramen, dan komt er één bij, eerst in het blok, dan langs de straat;
  // en elke kraam ligt vol of staat leeg, naar wat het dorp heeft.
  T.tikMarktDag = function (D) {
    const g = (D.gebouwen || []).find((x) => x.soort === 'markt' && x.opHetPlein);
    if (!g) return;
    if (!g.manden) g.manden = []; // een markt van vóór vraag 127
    if (!g.blok) g.blok = [];
    if (g.klaar && g.kramen.length < T.kramenNodig(D)) {
      const w = D.wereld;
      const bezet = new Set([...g.kramen, ...g.manden].map((v) => sleutel(v.x, v.y)));
      const plek = g.blok.find((p) => !bezet.has(sleutel(p.x, p.y)) && T.isBegaanbaar(w, p.x, p.y) && !T.voorwerpOp(w, p.x, p.y))
        || T.straatPlek(D, bezet, g.kramen);
      if (plek) {
        if (plek.mand && (bezet.has(sleutel(plek.mand.x, plek.mand.y)) || !T.isBegaanbaar(w, plek.mand.x, plek.mand.y) || T.voorwerpOp(w, plek.mand.x, plek.mand.y))) plek.mand = null;
        zetKraam(D, g, plek);
      }
    }
    for (const k of g.kramen) {
      k.waar = k.waar || 'groente';
      k.leeg = !T.heeftWaar(D, k.waar);
    }
    for (const m of g.manden) {
      const k = g.kramen[m.nr];
      if (k) m.wat = mandVan(k.waar, m.nr, k.leeg);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
