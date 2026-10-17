// Boeren uit het niets (werklijst vraag 152, 1e; Marcel, 11 okt: "Je kiest dan agrariër of wijnboer. Zoals bij Knights
// and Merchants", en op het plan: "A2", "Inderdaad met b2", "Ja dat is goed. De bouwers pakken het op", en "De karakters
// zetten we even opzij"). In het lege begin (js/begin.js) is een boer wie er op een boerderij woont, niet een van de vijf
// boeren van de kaart. Er zijn twee soorten boerderij (T.isBoerderij): de boerderij, met akkers, en de wijnboerderij, met
// wijngaarden (Marcel, 12 okt, vraag 155: "ik wil tóch een apart wijnboerderij gebouw"; tot dan bepaalde het eerste veld
// wat de boerderij was). Voor beide:
//   - een boerderij is een thuis voor één gezin: een gezin uit het kamp trekt erin zoals in een hut (T.verhuisUitHetKamp,
//     js/begin.js), en is het kamp al leeg, dan verhuist er een gezin uit een hut heen (b2), want een nieuw gezin over de
//     weg komt niet zolang er weinig graan is;
//   - het hoofd van dat gezin is de boer (T.boerVan, T.isBoer), zonder karakter of eigenschappen (het lot is weg sinds
//     ronde 2 van het snoeien); een wijnboer is ook een boer. Hij werkt de akkers van zijn boerderij (`e.werkAkkers`, zoals
//     de boeren van de kaart, js/kaart.js), en zijn vrouw en kinderen helpen zoals op elke boerderij (js/veldwerk.js);
//   - de velden leg jij (T.legVeld): een akker bij een boerderij, een wijngaard bij een wijnboerderij (`veld` in
//     T.GEBOUWEN), als rechthoek; de bouwers rooien en ploegen of planten hem (js/bouwen.js), en is hij af, dan is het land
//     (D.wereld.akkers, of D.wereld.wijngaarden met de ranken van js/wijngaard.js).
// Een boerderij zonder akker wil geen handen (T.boerderijZonderAkker, in T.verdeelHanden): haar boer werkt elders of bouwt
// mee. De wijnboerderij vraagt nooit handen (`handen: 0`): haar gezin plukt in wijnmaand (js/wijngaard.js) en werkt het
// jaar door elders of bouwt mee.
// Regels zonder scherm, dus te toetsen (test/boerderij.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.BOERDERIJ_INSTELLINGEN = {
    // Een veld is minstens en hooguit zoveel tegels groot, en elke kant minstens `veldSmal` tegels (Marcel, 11 okt: "Ja
    // dat is goed" op 12 tot 40). Twee akkers van 30 tegels voeden met het zaaigraan uit de kar zo'n twintig mensen de
    // eerste winter door (js/begin.js).
    veldMin: 12,
    veldMax: 40,
    veldSmal: 2,
    // Zo ver ligt een veld hooguit van zijn boerderij, in tegels ertussen (zoals de maker de akkers bij een boerderij legt).
    veldAfstand: 8,
  };
  const IN = () => T.BOERDERIJ_INSTELLINGEN;

  // Een boerderij met akkers, of een wijnboerderij met wijngaarden: allebei een thuis voor één gezin met een boer.
  T.isBoerderij = (g) => !!g && (g.soort === 'boerderij' || g.soort === 'wijnboerderij');
  const wonenIn = (D, g) => ((D.bewoners && D.bewoners.mensen) || []).filter((p) => p.huis === g);

  // Is dit een veld dat je legt (`veld` in T.GEBOUWEN: de akker en de wijngaard), geen gebouw? Zijn `veld` zegt bij welke
  // boerderij hij hoort: 'boerderij' of 'wijnboerderij'.
  T.isVeldSoort = (soort) => !!(T.GEBOUWEN[soort] && T.GEBOUWEN[soort].veld);

  // De boer van een boerderij (ook de wijnboer van een wijnboerderij): het hoofd van het (eerste) gezin dat er woont, of
  // anders een volwassene; null als er niemand woont.
  T.boerVan = function (D, g) {
    const hier = wonenIn(D, g);
    return hier.filter((p) => !p.hoofd).sort((a, b) => a.gezin - b.gezin)[0] || hier.find((p) => p.leeftijd === 'volwassen') || null;
  };

  // Is deze bewoner een boer: de boer van de boerderij waar hij woont (T.boerVan)? Tot 12 okt was een boer wie een karakter uit het lot had (de vijf
  // boeren van de kaart); het lot en de karakters zijn weg sinds ronde 2 van het snoeien, stap 4 (Marcel: "Ja, nu mee").
  T.isBoer = (D, p) => !!p && T.isBoerderij(p.huis) && T.boerVan(D, p.huis) === p;

  // De akkers van een boerderij die jij legde (T.legVeld).
  T.akkersVanBoerderij = (D, g) => ((D.wereld && D.wereld.akkers) || []).filter((a) => a.boerderij === g);
  // De velden (akkers en weides) van dorp D op zijn kaart: een veld draagt zijn dorp mee (`a.dorp`, als het af is,
  // hieronder), zoals een wezen (T.hoortBij, js/wereld.js), want op één kaart kunnen meer dorpen leven (werklijst vraag
  // 170, stap 6a).
  T.veldenVan = (D) => ((D.wereld && D.wereld.akkers) || []).filter((a) => T.hoortBij(D, a));

  // Wil deze boerderij geen handen, omdat ze geen akker heeft (T.verdeelHanden, js/gebouwen.js)? Alleen in het lege
  // begin: de boer van een boerderij die nog geen akker heeft, werkt elders of bouwt mee. (Een wijnboerderij vraagt zelf
  // al geen handen.)
  T.boerderijZonderAkker = (D, g) => !!D.begin && !!g && g.soort === 'boerderij' && !T.akkersVanBoerderij(D, g).length;

  // ---------------------------------------------------------------------------------------------
  // De boer en zijn velden
  // ---------------------------------------------------------------------------------------------

  // De boer werkt de akkers van zijn boerderij: zijn poppetje krijgt ze (`e.werkAkkers`, waar js/akkers.js en
  // js/veldwerk.js naar kijken), en wie geen boer meer is, verliest ze. Elke nacht, na het verhuizen en de velden die af
  // zijn (T.tikBoerderijenDag). Alleen in het lege begin: in het gehucht dat er al was, legt de kaart de akkers aan de
  // boeren (js/kaart.js).
  T.werkDeBoerenBij = function (D) {
    const w = D.wereld;
    if (!D.begin || !w || !D.bewoners) return;
    const akkersVan = new Map();
    for (const g of D.gebouwen) {
      const boer = g.soort === 'boerderij' && T.boerVan(D, g);
      if (boer && boer.wezen) akkersVan.set(boer.wezen, T.akkersVanBoerderij(D, g));
    }
    for (const e of w.wezens || []) {
      if (!T.hoortBij(D, e)) continue; // de boeren van een ander dorp
      const akkers = akkersVan.get(e);
      if (!akkers) {
        if (e.werkAkkers) delete e.werkAkkers;
        continue;
      }
      const zelfde = e.werkAkkers && e.werkAkkers.length === akkers.length && akkers.every((a) => e.werkAkkers.includes(a));
      if (!zelfde) e.werkAkkers = akkers;
    }
  };

  // Elke nacht (T.tikGebouwenDag, na de gebouwen die klaarkomen en het kamp): een veld dat af is, wordt land; een lege
  // boerderij krijgt een gezin uit een hut als het kamp al leeg is (b2); en de boeren krijgen hun akkers.
  T.tikBoerderijenDag = function (D, dag) {
    if (!D.begin) return;
    for (const v of D.gebouwen.slice()) if (T.isVeldSoort(v.soort) && v.klaar) veldIsAf(D, v, dag);
    bemanDeBoerderijen(D);
    T.werkDeBoerenBij(D);
  };

  // b2: een boerderij die af is en waar niemand woont, krijgt een gezin uit een hut of huis, zolang er niemand meer in het
  // kamp woont (anders trekt dat gezin erin, T.verhuisUitHetKamp). Het gezin met de minste mensen die al werk hebben, gaat:
  // de settlers worden wat jij bouwt, en een gezin dat in een werkplaats werkt, blijft liever. Hun hut is dan vrij voor wie
  // er over de weg komt.
  function bemanDeBoerderijen(D) {
    if (!D.bewoners || T.kampTenten(D).length) return;
    for (const g of D.gebouwen) {
      if (!T.isBoerderij(g) || !g.klaar || wonenIn(D, g).length) continue;
      const gezin = gezinUitEenHut(D);
      if (!gezin) return;
      const huis = gezin[0].huis;
      T.verhuis(D, gezin, g);
      const boer = T.boerVan(D, g);
      T.zeg(D, T.t('{wie} and family move from their {huis} to the {boerderij}: {wie} is the farmer now.', {
        wie: T.naamVanBewoner(boer), huis: T.GEBOUWEN[huis.soort].naam, boerderij: T.GEBOUWEN[g.soort].naam,
      }));
    }
  }
  function gezinUitEenHut(D) {
    const gezinnen = new Map();
    for (const p of D.bewoners.mensen) {
      const soort = p.huis && T.GEBOUWEN[p.huis.soort];
      if (!soort || !soort.woning) continue;
      if (!gezinnen.has(p.gezin)) gezinnen.set(p.gezin, []);
      gezinnen.get(p.gezin).push(p);
    }
    const kan = [...gezinnen.values()].filter((l) => !l.some((p) => p.aanvoerder || p.weg || (p.hoofd && p.hoofd.aanvoerder)));
    const werk = (l) => l.filter((p) => p.werk).length;
    kan.sort((a, b) => werk(a) - werk(b) || a[0].gezin - b[0].gezin);
    return kan[0] || null;
  }

  // ---------------------------------------------------------------------------------------------
  // Een veld leggen (Marcel: "akkers leg jij bij een boerderij (zoals Manor Lords)", en A2: "1 boerderij, en het veld
  // bepaald")
  // ---------------------------------------------------------------------------------------------

  // De rechthoek tussen twee hoeken (de eerste klik en de muis), met de hoeken erin.
  T.veldRechthoek = (a, b) => ({
    x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), b: Math.abs(a.x - b.x) + 1, h: Math.abs(a.y - b.y) + 1,
  });

  // Hoeveel tegels er tussen twee rechthoeken liggen (0 als ze elkaar raken of overlappen).
  function tussen(r, q) {
    const dx = Math.max(q.x - (r.x + r.b), r.x - (q.x + q.b), 0);
    const dy = Math.max(q.y - (r.y + r.h), r.y - (q.y + q.h), 0);
    return Math.max(dx, dy);
  }

  // Bij welke boerderij hoort een veld van deze soort op r: de dichtste van zijn soort (`veld` in T.GEBOUWEN: de akker bij
  // een boerderij, de wijngaard bij een wijnboerderij) binnen veldAfstand, ook een die nog gebouwd wordt. { boerderij } of
  // { reden }.
  T.boerderijVoorVeld = function (D, soort, r) {
    const boerderij = T.GEBOUWEN[soort].veld;
    const dichtbij = (D.gebouwen || [])
      .filter((g) => g.soort === boerderij)
      .map((g) => ({ g, d: tussen(r, T.voetVanGebouw(g)) }))
      .filter((x) => x.d <= IN().veldAfstand)
      .sort((a, b) => a.d - b.d)[0];
    if (dichtbij) return { boerderij: dichtbij.g };
    return { reden: T.t('{veld} lies next to {boerderij}: within {n} tiles of it.', {
      veld: T.hoofdletter(T.eenNaam(T.GEBOUWEN[soort].naam)), boerderij: T.eenNaam(T.GEBOUWEN[boerderij].naam), n: IN().veldAfstand,
    }) };
  };

  // Kan er een veld van deze soort op r? Hij is groot genoeg en niet te groot, ligt binnen het bouwbereik, niet op het
  // plein, een pad, een ander veld of iets vasts (een boom of een struik rooien de bouwers), houdt een tegel vrij rond
  // elk gebouw (zijn looppad), is niet te steil, en ligt bij een boerderij die hem kan nemen (een akker bij een boerderij,
  // een wijngaard bij een wijnboerderij). De reden, of null; dezelfde
  // vraag voor de muis (js/main.js) en de klik (T.legVeld).
  T.waaromPastVeldNiet = function (D, soort, r) {
    const I = IN();
    const w = D.wereld;
    if (!w) return T.t('A field does not fit there.');
    if (r.b * r.h < I.veldMin) return T.t('A field is at least {n} tiles.', { n: I.veldMin });
    if (r.b * r.h > I.veldMax) return T.t('A field is at most {n} tiles.', { n: I.veldMax });
    if (Math.min(r.b, r.h) < I.veldSmal) return T.t('A field is at least {n} tiles wide.', { n: I.veldSmal });
    return T.waaromBuitenBouwBereik(D, r) || T.waaromOnbekendLand(D, r) || waaromNietOpDezeTegels(D, r) || (T.teSteil(w, r) ? T.t('It is too steep there for a field.') : null)
      || T.boerderijVoorVeld(D, soort, r).reden || null;
  };
  function waaromNietOpDezeTegels(D, r) {
    const w = D.wereld;
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.b; x++) {
        if (T.opHetPlein(w, x, y)) return T.t('No fields on the square.');
        if (T.isVast(w, x, y) && !T.ontginWerkOp(w, x, y)) return T.t('A field does not fit there.');
        const reden = T.waaromNietOpDezeGrond(D, x, y);
        if (reden) return reden;
      }
    }
    for (const g of D.gebouwen || []) {
      if (tussen(r, T.voetVanGebouw(g)) < 1) return T.t('A field keeps one tile free around a building.');
    }
    return null;
  }

  // Een veld leggen (de tweede klik, js/main.js): een bouwplaats in D.gebouwen, zoals een gebouw, die de bouwers rooien
  // en ploegen of planten (js/bouwen.js); hij kost alleen werk. Hij hoort bij zijn boerderij (`boerderij`: een akker bij
  // een boerderij, een wijngaard bij een wijnboerderij). Geeft { gelukt, instantie, bericht } of { gelukt: false, reden }.
  T.legVeld = function (D, soort, r) {
    if (!T.isVeldSoort(soort) || !T.magGebouwd(D, soort)) return { gelukt: false, reden: T.t('A field does not fit there.') };
    const reden = T.waaromPastVeldNiet(D, soort, r);
    if (reden) return { gelukt: false, reden };
    const boerderij = T.boerderijVoorVeld(D, soort, r).boerderij;
    const veld = { soort, x: r.x, y: r.y, voet: { b: r.b, h: r.h }, tekening: null, klaar: false, klaarOp: null, handen: 0, voorwerp: null, boerderij };
    const kavel = { x: r.x, y: r.y, b: r.b, h: r.h };
    const wat = T.teRooienOp(D, kavel).length ? T.rooiWoordenOp(D, kavel) : null;
    T.zetBouwplaats(D, veld, kavel);
    D.gebouwen.push(veld);
    T.nieuweBouwplaats(D, veld);
    const naam = T.hoofdletter(T.GEBOUWEN[soort].naam);
    const werk = veld.bouw.werk;
    return { gelukt: true, instantie: veld, bericht: wat
      ? T.t('{veld}: the builders first clear it ({wat}), then work it ({werk} workdays).', { veld: naam, wat, werk })
      : T.t('{veld}: {werk} workdays, for whoever has no other work.', { veld: naam, werk }) };
  };

  // Een veld dat af is (de bouwers ploegden of plantten het), wordt land: een akker van zijn boerderij, die de boer
  // nog dit voorjaar inzaait als het nazaaitijd is (T.zaaiNa, js/akkers.js) en anders in de lente, of een wijngaard met
  // ranken in rijen (T.zetRanken, js/wijngaard.js).
  function veldIsAf(D, v, dag) {
    const w = D.wereld;
    D.gebouwen.splice(D.gebouwen.indexOf(v), 1);
    const r = { x: v.x, y: v.y, b: v.voet.b, h: v.voet.h };
    T.ruimLaagOp(w, r); // wat er nog laag groeide, is omgeploegd
    if (v.soort === 'wijngaard') {
      (w.wijngaarden || (w.wijngaarden = [])).push({ ...r, boerderij: v.boerderij, dorp: D });
      T.zetRanken(D, v.boerderij, r);
      T.zeg(D, T.t('The vineyard is planted: the grapes are picked in wine month.'), 'goed');
      return;
    }
    if (!w.akkers) w.akkers = [];
    const akker = {
      naam: `akker${w.akkers.length + 1}`, ...r, huis: null, bestemming: 'akker', plan: 'akker',
      vruchtbaarheid: T.VELDEN_INSTELLINGEN.beginVruchtbaarheid, boerderij: v.boerderij, dorp: D,
      ongezaaid: new Set(T.akkerTegels(r).map((t) => `${t.x},${t.y}`)),
    };
    w.akkers.push(akker);
    T.kaartVeranderd(w, { x1: r.x, y1: r.y, x2: r.x + r.b - 1, y2: r.y + r.h - 1 });
    T.zeg(D, T.isNazaaitijd(dag)
      ? T.t('The field is ploughed: it is sown as soon as there is grain for it.')
      : T.t('The field is ploughed: it is sown in spring.'), 'goed');
  }
})(globalThis.Spel = globalThis.Spel || {});
