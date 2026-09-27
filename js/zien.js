// Het zichtveld en de getuigen (werklijst punt 3, vraag 40; ontwerp/spel.md, "Een zichtveld voor
// iedereen"). Marcels idee (26 sep): "In de nacht kun je dus ook activiteiten organiseren om te
// verstoppen. [...] Ze hebben een zichtveld. Dan kun je dus in een donker steegje iets doen zonder dat
// iemand het weet."
//
// Stuk 1 (27 sep; Marcel: "A ja B ja C ja D ja"):
//   - wie buiten is, ziet de schout als hij dichtbij genoeg is en er niets tussen staat
//     (T.getuigenVan). Hoe ver, hangt af van het licht waar de schout staat (T.zichtOp): overdag ver,
//     's nachts bijna niet, en in het licht van een lantaarn of van de herberg weer verder;
//   - het licht in het dorp (T.lichtBronnen): de herberg (T.herbergLicht, js/herberg.js), en elke
//     lantaarn op de kaart, die 's avonds brandt (D). js/tekenen.js tekent er de gloed van;
//   - zet de schout iets weg of haalt hij iets terug terwijl iemand hem ziet (alleen die handeling, B),
//     dan is die een getuige (T.werdGezien): de plek onthoudt het, en je ziet het meteen, een oogje
//     boven zijn hoofd en een bericht (A).
// Wie er zelf woont, telt niet als getuige: het is zijn kelder, en of hij meedoet, zegt zijn karakter
// al (js/verstoppen.js). Wat een getuige met wat hij zag doet, is stuk 2.
(function (T) {
  'use strict';

  T.ZIEN_INSTELLINGEN = {
    // Hoe ver je iemand ziet, in tegels (hemelsbreed): overdag, en 's nachts. In de schemering zit het
    // ertussen, naar hoe ver het naar de nacht is (T.lichtVan(dag).nacht, js/dag.js).
    dag: 8,
    nacht: 2,
    // Wie in het licht van een lantaarn of van de herberg staat, zie je ook in het donker zo ver.
    bijLicht: 6,
    // Een lantaarn op de kaart brandt 's avonds, zo ver (tegels) en zo fel (0 tot 1, voor de gloed in
    // js/tekenen.js).
    lantaarnStraal: 3,
    lantaarnSterkte: 0.45,
    // Zo lang staat het oogje boven een getuige, in seconden op het scherm.
    oogjeTijd: 5,
  };
  const IN = () => T.ZIEN_INSTELLINGEN;

  // Het licht in het dorp: de herberg, met zijn eigen lantaarn en zijn ramen (T.herbergLicht), en elke
  // andere lantaarn op de kaart, die 's avonds brandt. Wie ze aansteekt, komt later (de koster; spel.md,
  // "lichtbronnen in het dorp"). Geeft een lijst { x, y, straal, sterkte } (tegels, 0 tot 1), bij de
  // herberg ook met ramenVan en schimmen.
  T.lichtBronnen = function (S) {
    const w = S.wereld;
    const herberg = T.herbergLicht ? T.herbergLicht(S) : [];
    if (!w || !S.kalender || !T.dagdeelVan) return herberg;
    if (T.dagdeelVan(S.kalender.dag, T.isOogstDag && T.isOogstDag(S.kalender.dag)) !== 'avond') return herberg;
    // De lantaarn naast de deur van de herberg is het licht van de herberg al.
    const vanDeHerberg = (v) => herberg.some((h) => T.afstand(h, v) <= 1);
    const lantaarns = w.voorwerpen
      .filter((v) => v.soort === 'lantaarn' && !vanDeHerberg(v))
      .map((v) => ({ x: v.x, y: v.y, straal: IN().lantaarnStraal, sterkte: IN().lantaarnSterkte }));
    return herberg.concat(lantaarns);
  };

  // Hoe ver je iemand ziet die op deze tegel staat: naar het licht van de dag, en verder als hij in het
  // licht van een lantaarn of de herberg staat.
  T.zichtOp = function (S, plek) {
    const I = IN();
    const nacht = S.kalender && T.lichtVan ? T.lichtVan(S.kalender.dag).nacht : 0;
    let ver = I.dag + (I.nacht - I.dag) * nacht;
    for (const b of T.lichtBronnen(S)) {
      const dx = plek.x - b.x;
      const dy = plek.y - b.y;
      if (dx * dx + dy * dy <= b.straal * b.straal) ver = Math.max(ver, I.bijLicht);
    }
    return ver;
  };

  // Kijkt dit wezen? Een mens die buiten is: niet de schout zelf, geen dier en geen monster, en niet
  // dood. Wie binnen is of slaapt, ziet niets.
  function kijkt(S, e) {
    return e !== S.schout && !e.dood && !e.binnen && e.kant !== 'monster' && !(T.VEE && T.VEE[e.soort]);
  }

  // Hoe het bericht hem noemt: een bewoner bij zijn naam, een bezoeker zoals T.MENSEN hem noemt.
  function naamVan(S, e) {
    const p = T.bewonerVan ? T.bewonerVan(S, e) : null;
    if (p && T.naamVanBewoner) return T.naamVanBewoner(p);
    if (e.wie && T.naamVanMens) return T.naamVanMens(e.wie);
    return 'een dorpeling';
  }

  // Wie ziet de schout nu, waar hij staat? Wie buiten is, dichtbij genoeg voor het licht daar
  // (T.zichtOp), en met niets ertussen (T.zietTegel, js/wereld.js). Behalve wie in `g` woont: het is
  // zijn kelder. Geeft de wezens.
  T.getuigenVan = function (S, g) {
    const w = S.wereld;
    const h = S.schout;
    if (!w || !h) return [];
    const doel = T.tegelVan(h);
    const ver = T.zichtOp(S, doel);
    return w.wezens.filter((e) => {
      if (!kijkt(S, e)) return false;
      const p = g && T.bewonerVan ? T.bewonerVan(S, e) : null;
      if (p && p.huis === g) return false;
      return T.zietTegel(w, T.tegelVan(e), doel, ver);
    });
  };

  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || '');

  // Wie je nu ziet, voor het venster van de plek (js/hud.js): "Niemand ziet je." of "Trijn en Otto zien
  // je." Zo weet je het vóór je iets doet.
  T.kijkersTekst = function (S, g) {
    const wie = T.getuigenVan(S, g).map((e) => naamVan(S, e));
    if (!wie.length) return 'Niemand ziet je.';
    return `${T.hoofdletter(opsomming(wie))} ${wie.length > 1 ? 'zien' : 'ziet'} je.`;
  };

  // De schout zette iets weg (handeling 'weg') of haalde iets terug ('terug') bij `g`, en wie hem nu
  // ziet, is getuige: de plek onthoudt het (g.getuigen, voor stuk 2: wat een getuige ermee doet), en elke
  // getuige krijgt het oogje (e.oogje, tot die schermtijd; js/tekenen.js). Geeft { getuigen, bericht }.
  T.werdGezien = function (S, g, handeling, wat, n) {
    const wie = T.getuigenVan(S, g);
    const dag = S.kalender ? Math.floor(S.kalender.dag) : 0;
    for (const e of wie) {
      e.oogje = (S.tijd || 0) + IN().oogjeTijd;
      (g.getuigen || (g.getuigen = [])).push({ dag, naam: naamVan(S, e), bewoner: T.bewonerVan ? T.bewonerVan(S, e) : null, handeling, wat, n });
    }
    if (!wie.length) return { getuigen: wie, bericht: 'Niemand zag het.' };
    const plek = T.verstopPlekVan ? T.verstopPlekVan(S, g) : null;
    const waar = plek ? plek.naam : 'daar';
    const hoeveel = `${Math.floor(n)} ${wat}`;
    const deed = handeling === 'weg' ? `${hoeveel} in ${waar} zetten` : `${hoeveel} uit ${waar} halen`;
    const namen = opsomming(wie.map((e) => naamVan(S, e)));
    return { getuigen: wie, bericht: `${T.hoofdletter(namen)} ${wie.length > 1 ? 'zagen' : 'zag'} je ${deed}.` };
  };
})(globalThis.Spel = globalThis.Spel || {});
