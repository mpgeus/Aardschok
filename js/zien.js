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
// al (js/verstoppen.js).
//
// Stuk 2 (27 sep; Marcel: "Doorzetten"): wat een getuige met wat hij zag doet, naar zijn karakter. Wie
// het in de herberg vertelt (de roddelaar, T.vertelInDeHerberg in js/verstoppen.js), doet dat de
// eerstvolgende avond dat hij er zit (T.getuigenVertellen, vanuit T.tikHerbergDag in js/herberg.js):
// dan weet het dorp wat er op die plek ligt, en vinden de soldaten het er makkelijker (g.verteld en
// g.verteldDoor, js/verstoppen.js). De herbergierster vertelt het je de volgende dag. De rest zwijgt,
// tot de inner het vraagt (werklijst punt 4). En of je meteen ziet wie je zag, of pas later, is een
// keuze in de spelregels (A; `meteen` hieronder, js/opties.js).
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
    // Zie je meteen wie je ziet (het venster, het oogje en het bericht), of hoor je het pas later, als het
    // rondverteld is? Een keuze in de spelregels (Marcel, vraag 40, A).
    meteen: true,
  };
  const IN = () => T.ZIEN_INSTELLINGEN;

  // Het licht in het dorp: de herberg, met zijn eigen lantaarn en zijn ramen (T.herbergLicht), elke
  // andere lantaarn op de kaart, die 's avonds brandt, en op een feest het plein (T.feestLicht, js/feesten.js). Wie ze aansteekt, komt later (de koster; spel.md,
  // "lichtbronnen in het dorp"). Geeft een lijst { x, y, straal, sterkte } (tegels, 0 tot 1), bij de
  // herberg ook met ramenVan en schimmen.
  T.lichtBronnen = function (D) {
    const w = D.wereld;
    const herberg = T.herbergLicht(D);
    if (!w || !D.kalender || !T.dagdeelVan) return herberg;
    if (T.dagdeelVan(D.kalender.dag, T.isOogstDag(D.kalender.dag)) !== 'avond') return herberg;
    // De lantaarn naast de deur van de herberg is het licht van de herberg al.
    const vanDeHerberg = (v) => herberg.some((h) => T.afstand(h, v) <= 1);
    const lantaarns = w.voorwerpen
      .filter((v) => v.soort === 'lantaarn' && !vanDeHerberg(v))
      .map((v) => ({ x: v.x, y: v.y, straal: IN().lantaarnStraal, sterkte: IN().lantaarnSterkte }));
    // En op een feest het licht op het plein (js/feesten.js).
    return herberg.concat(lantaarns, T.feestLicht(D));
  };

  // Hoe ver je iemand ziet die op deze tegel staat: naar het licht van de dag, en verder als hij in het
  // licht van een lantaarn of de herberg staat.
  T.zichtOp = function (D, plek) {
    const I = IN();
    const nacht = D.kalender ? T.lichtVan(D.kalender.dag).nacht : 0;
    let ver = I.dag + (I.nacht - I.dag) * nacht;
    for (const b of T.lichtBronnen(D)) {
      const dx = plek.x - b.x;
      const dy = plek.y - b.y;
      if (dx * dx + dy * dy <= b.straal * b.straal) ver = Math.max(ver, I.bijLicht);
    }
    return ver;
  };

  // Kijkt dit wezen? Een mens die buiten is: niet de schout zelf, geen dier en geen monster, en niet
  // dood. Wie binnen is of slaapt, ziet niets.
  function kijkt(D, e) {
    return e !== D.schout && !e.dood && !e.binnen && e.kant !== 'monster' && !(T.VEE && T.VEE[e.soort]);
  }

  // Hoe het bericht hem noemt: een bewoner bij zijn naam, een bezoeker zoals T.MENSEN hem noemt.
  function naamVan(D, e) {
    const p = T.bewonerVan(D, e);
    if (p && T.naamVanBewoner) return T.naamVanBewoner(p);
    if (e.wie && T.naamVanMens) return T.naamVanMens(e.wie);
    return 'een dorpeling';
  }

  // Wie ziet de schout nu, waar hij staat? Wie buiten is, dichtbij genoeg voor het licht daar
  // (T.zichtOp), en met niets ertussen (T.zietTegel, js/wereld.js). Behalve wie in `g` woont: het is
  // zijn kelder. Geeft de wezens.
  T.getuigenVan = function (D, g) {
    const w = D.wereld;
    const h = D.schout;
    if (!w || !h) return [];
    const doel = T.tegelVan(h);
    const ver = T.zichtOp(D, doel);
    return w.wezens.filter((e) => {
      if (!kijkt(D, e)) return false;
      const p = g && T.bewonerVan(D, e);
      if (p && p.huis === g) return false;
      return T.zietTegel(w, T.tegelVan(e), doel, ver);
    });
  };

  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || '');

  // Wie je nu ziet, voor het venster van de plek (js/hud.js): "Niemand ziet je." of "Trijn en Otto zien
  // je." Zo weet je het vóór je iets doet.
  T.kijkersTekst = function (D, g) {
    const wie = T.getuigenVan(D, g).map((e) => naamVan(D, e));
    if (!wie.length) return 'Niemand ziet je.';
    return `${T.hoofdletter(opsomming(wie))} ${wie.length > 1 ? 'zien' : 'ziet'} je.`;
  };

  // Wat de schout deed, in woorden: "10 graan in de kelder van Gerrit zetten" (`vorm` 'zetten'), of "…
  // zette" ('zette'). Vanuit de schout (`vanUit` 'schout') heet zijn eigen kelder "je eigen kelder",
  // vanuit een ander "zijn eigen kelder".
  function watDeed(D, g, handeling, wat, n, vorm, vanUit) {
    const plek = T.verstopPlekVan(D, g);
    const waar = !plek ? 'daar' : plek.vanSchout && vanUit !== 'schout' ? 'zijn eigen kelder' : plek.naam;
    const hoeveel = `${Math.floor(n)} ${wat}`;
    if (handeling === 'weg') return `${hoeveel} in ${waar} ${vorm === 'zette' ? 'zette' : 'zetten'}`;
    return `${hoeveel} uit ${waar} ${vorm === 'zette' ? 'haalde' : 'halen'}`;
  }

  // De schout zette iets weg (handeling 'weg') of haalde iets terug ('terug') bij `g`, en wie hem nu
  // ziet, is getuige: de plek onthoudt het (g.getuigen: wanneer, wie, wat; voor T.getuigenVertellen), en
  // als je het meteen ziet (`meteen`), krijgt elke getuige het oogje (e.oogje, tot die schermtijd;
  // js/tekenen.js). Geeft { getuigen, bericht }; het bericht zegt ook wie het rondvertelt.
  T.werdGezien = function (S, D, g, handeling, wat, n) {
    const wie = T.getuigenVan(D, g);
    const tijd = D.kalender ? D.kalender.dag : 0;
    for (const e of wie) {
      if (IN().meteen) e.oogje = (S.tijd || 0) + IN().oogjeTijd;
      (g.getuigen || (g.getuigen = [])).push({ dag: Math.floor(tijd), tijd, naam: naamVan(D, e), bewoner: T.bewonerVan(D, e), handeling, wat, n });
    }
    if (!wie.length) return { getuigen: wie, bericht: 'Niemand zag het.' };
    const namen = opsomming(wie.map((e) => naamVan(D, e)));
    let bericht = `${T.hoofdletter(namen)} ${wie.length > 1 ? 'zagen' : 'zag'} je ${watDeed(D, g, handeling, wat, n, 'zetten', 'schout')}.`;
    // Wie het in de herberg vertelt, staat erbij: dan weet je wat je te wachten staat.
    for (const e of wie) {
      const p = T.bewonerVan(D, e);
      if (p && T.vertelInDeHerberg(p)) bericht += ` ${naamVan(D, e)} weet alles van iedereen, en vertelt het ook.`;
    }
    return { getuigen: wie, bericht };
  };

  // Stuk 2: in de herberg vertelt een getuige wat hij zag (vanuit T.tikHerbergDag, js/herberg.js, voor de
  // avond van `dag`). Wie er die avond zat (`gasten`) en het rondvertelt (T.vertelInDeHerberg), vertelt
  // alles wat hij zag en nog niet vertelde, als het vóór bedtijd gebeurde en er nog iets ligt: dan weet het
  // dorp het (g.verteld, g.verteldDoor), en vinden de soldaten het er makkelijker (js/verstoppen.js). Wat
  // hij vertelde, vertelt hij niet nog eens. Geeft wat er verteld is, voor de herbergierster:
  // [{ door, wat }] ("Klaas", "10 graan in de kelder van Gerrit zette").
  T.getuigenVertellen = function (D, gasten, dag) {
    const tot = dag + T.dagindeling(dag).slapen / 24;
    const verteld = [];
    for (const g of D.gebouwen || []) {
      for (const z of g.getuigen || []) {
        if (z.verteld != null || !z.bewoner || !gasten.includes(z.bewoner)) continue;
        if (!T.vertelInDeHerberg(z.bewoner) || !(z.tijd < tot)) continue;
        z.verteld = dag;
        if (!T.inhoudTekst(g.verstopt || {})) continue; // er ligt niets meer: niets te vinden
        g.verteld = dag;
        g.verteldDoor = z.naam;
        verteld.push({ door: z.naam, wat: watDeed(D, g, z.handeling, z.wat, z.n, 'zette') });
      }
    }
    return verteld;
  };

  // Wat de herbergierster invult (js/gesprekken.js): wie het vertelde, en wat de schout deed.
  const gisteren = (D) => (D.herberg && D.herberg.gisteravond && D.herberg.gisteravond.gezien) || [];
  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  T.GESPREK_WOORDEN.getuige = (D) => opsomming([...new Set(gisteren(D).map((v) => v.door))]) || 'iemand';
  T.GESPREK_WOORDEN.gezien = (D) => opsomming(gisteren(D).map((v) => v.wat)) || 'iets wegzette';
})(globalThis.Spel = globalThis.Spel || {});
