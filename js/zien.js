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
    // Een huis waar 's avonds (en 's morgens vroeg) iemand thuis is, heeft zijn ramen aan (werklijst vraag 108, d): een
    // klein licht bij de deur, zo ver en zo fel.
    huisStraal: 1.5,
    huisSterkte: 0.22,
    // De lantaarn van de schout (werklijst vraag 125, C; Marcel, 4 okt: "ook spel. Voegt leuke elementen toe"): buiten,
    // vanaf zo donker (T.lichtVan(dag).nacht), brandt hij, zo ver en zo fel. Wie in zijn eigen licht staat, zie je van
    // bijLicht tegels (`zichtbaar`; de spelregel "De lantaarn van de schout" zet het uit, dan is het alleen beeld).
    // Sluipen dooft hem (T.wisselSluipen in js/verkennen.js).
    lantaarn: { vanaf: 0.4, straal: 3, sterkte: 0.5, zichtbaar: true },
    // Zo lang staat het oogje boven een getuige, in seconden op het scherm.
    oogjeTijd: 5,
    // Zie je meteen wie je ziet (het venster, het oogje en het bericht), of hoor je het pas later, als het
    // rondverteld is? Een keuze in de spelregels (Marcel, vraag 40, A).
    meteen: true,
  };
  const IN = () => T.ZIEN_INSTELLINGEN;

  // Het licht in het dorp: de herberg, met zijn eigen lantaarn en zijn ramen (T.herbergLicht), elke
  // andere lantaarn op de kaart, die 's avonds brandt, en op een feest het plein (T.feestLicht, js/feesten.js). Wie ze aansteekt, komt later (de koster; spel.md,
  // "lichtbronnen in het dorp"). En de lantaarn van de schout, als hij er een draagt (T.draagtLantaarn, vraag 125, C).
  // Geeft een lijst { x, y, straal, sterkte, soort } (tegels, 0 tot 1; soort is 'herberg', 'lantaarn', 'feest', 'huis'
  // of 'schout', voor de kleur in js/tekenen.js), bij de herberg en de huizen ook met ramenVan en schimmen.
  T.lichtBronnen = function (D) {
    const w = D.wereld;
    const herberg = T.herbergLicht(D).map((b) => ({ ...b, soort: 'herberg' }));
    // De schout, en in het donker de bode en wie meegaat (js/bode.js), met een lantaarn.
    const schout = schoutLicht(D).concat(T.bodeLicht(D));
    if (!w || !D.kalender || !T.dagdeelVan) return herberg.concat(schout);
    const deel = T.dagdeelVan(D.kalender.dag, T.isOogstDag(D.kalender.dag));
    const huizen = huizenLicht(D, deel);
    const brand = T.brandLicht(D); // wat brandt, geeft ook overdag licht (js/brand.js)
    if (deel !== 'avond') return herberg.concat(huizen, brand, schout);
    // De lantaarn naast de deur van de herberg is het licht van de herberg al.
    const vanDeHerberg = (v) => herberg.some((h) => T.afstand(h, v) <= 1);
    const lantaarns = w.voorwerpen
      .filter((v) => v.soort === 'lantaarn' && !vanDeHerberg(v))
      .map((v) => ({ x: v.x, y: v.y, straal: IN().lantaarnStraal, sterkte: IN().lantaarnSterkte, soort: 'lantaarn' }));
    // En op een feest het licht op het plein (js/feesten.js).
    const feest = T.feestLicht(D).map((b) => ({ ...b, soort: 'feest' }));
    return herberg.concat(lantaarns, feest, huizen, brand, schout);
  };

  // Draagt de schout van dit dorp nu een brandende lantaarn? Buiten, op de kaart van zijn dorp, als het donker genoeg
  // is, en niet als hij hem doofde (sluipen, e.lantaarnUit).
  T.draagtLantaarn = function (D) {
    const h = D.schout;
    if (!h || h.dood || h.binnen || h.lantaarnUit || !D.kalender || T.schoutIsWeg(D)) return false;
    return T.lichtVan(D.kalender.dag).nacht >= IN().lantaarn.vanaf;
  };
  // Zijn licht gaat met hem mee, op zijn plek zoals hij loopt (niet per tegel), met soort 'schout'.
  function schoutLicht(D) {
    if (!T.draagtLantaarn(D)) return [];
    const L = IN().lantaarn;
    return [{ x: D.schout.x, y: D.schout.y, straal: L.straal, sterkte: L.sterkte, soort: 'schout' }];
  }

  // De ramen van de huizen (werklijst vraag 108, d; Marcel, 3 okt: "Lantaarns voor in de avond etc."): 's avonds en 's
  // morgens vroeg brandt er licht in een huis waar iemand thuis is, binnen of op zijn erf, en niet als ze allemaal in de
  // herberg zitten, op het feest zijn of weg. Met de ramen van de tekening (ramenVan; js/tekenen.js tekent ze, zoals die
  // van de herberg) en een klein licht bij de deur. De herberg heeft zijn eigen licht (T.herbergLicht), en een huis dat
  // nog gebouwd wordt, heeft nog geen ramen.
  function huizenLicht(D, deel) {
    if ((deel !== 'avond' && deel !== 'ochtend') || !D.bewoners) return [];
    return T.huizenMetIemandThuis(D).map(({ g, deur }) => ({ x: deur.x, y: deur.y, straal: IN().huisStraal, sterkte: IN().huisSterkte, ramenVan: g, schimmen: 0, soort: 'huis' }));
  }

  // De huizen waar iemand thuis is, binnen of op zijn erf: [{ g, deur }]. Niet de herberg, niet wat nog gebouwd wordt of
  // brandt. Voor het licht in de ramen (hierboven) en de rook uit de schoorsteen (js/tekenen.js; vraag 145, 3).
  T.huizenMetIemandThuis = function (D) {
    if (!D.bewoners) return [];
    const w = D.wereld;
    const herbergen = new Set(T.herbergenVan(D));
    const straal = T.DAG_INSTELLINGEN.erfStraal + 2;
    const deuren = new Map();
    const uit = [];
    for (const p of D.bewoners.mensen) {
      const g = p.huis;
      const e = p.wezen;
      if (!g || g.klaar === false || herbergen.has(g) || p.weg || !e || e.dood || (g.voorwerp && g.voorwerp.brand)) continue;
      if (deuren.has(g) && deuren.get(g).aan) continue;
      if (!deuren.has(g)) deuren.set(g, { deur: T.deurVan(w, g), aan: false });
      const huis = deuren.get(g);
      const deur = huis.deur;
      const thuis = e.binnen
        ? !!(e.deur && e.deur.x === deur.x && e.deur.y === deur.y)
        : T.afstand({ x: e.tx, y: e.ty }, deur) <= straal;
      if (!thuis) continue;
      huis.aan = true;
      uit.push({ g, deur });
    }
    return uit;
  };

  // Hoe ver je iemand ziet die op deze tegel staat: naar het licht van de dag, en verder als hij in het
  // licht van een lantaarn of de herberg staat.
  T.zichtOp = function (D, plek) {
    const I = IN();
    const nacht = D.kalender ? T.lichtVan(D.kalender.dag).nacht : 0;
    let ver = I.dag + (I.nacht - I.dag) * nacht;
    for (const b of T.lichtBronnen(D)) {
      if (b.soort === 'schout' && !I.lantaarn.zichtbaar) continue; // alleen beeld (de spelregel)
      const dx = plek.x - b.x;
      const dy = plek.y - b.y;
      if (dx * dx + dy * dy <= b.straal * b.straal) ver = Math.max(ver, I.bijLicht);
    }
    return ver;
  };

  // Kijkt dit wezen? Een mens die buiten is: niet de schout zelf, geen dier en geen monster, en niet
  // dood. Wie binnen is of slaapt, ziet niets.
  function kijkt(D, e) {
    return e !== D.schout && !e.dood && !e.binnen && e.kant !== 'monster' && !e.beest && !(T.VEE && T.VEE[e.soort]);
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
