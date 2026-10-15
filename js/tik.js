// De tik van de wereld (werklijst vraag 170, stap 0; Marcel, 15 okt: live samen spelen al in de demo, in lockstep, zoals
// Age of Empires: "A1, B1, C1, D1, E1, F1").
//
// In lockstep rekent elke computer de hele wereld zelf, en gaan alleen de opdrachten van de spelers over de lijn. Dat
// kan alleen als de wereld op elke computer precies zo loopt: in dezelfde stappen, met hetzelfde lot. Daarom loopt de
// wereld in vaste tikken, zestig per seconde echte tijd, los van hoeveel beelden een computer tekent: een tik is altijd
// even lang (T.TIK), en de wereld schuift per tik zoveel op als de snelheid zegt (T.wereldFactor, js/tijd.js). Tot 15 okt
// liep de wereld per beeld, met de tijd van dat beeld: een snelle computer rekende in andere stapjes dan een trage.
//
// T.wereldTik is de ene tik. Het spel (js/main.js) tikt zo vaak als er tijd verstreek, en Spel.debug.stap, de
// speeltest, de toetsen en de meting van `npm run grootte` tikken hem net zo: zo rekenen ze allemaal dezelfde wereld,
// zonder een eigen lijstje. Wat alleen scherm is (de camera, de muis, de briefjes, de zwevende teksten), staat er niet
// in: dat werkt js/main.js elk beeld bij.
//
// Zonder scherm, en dus getoetst (test/tik.test.cjs).
(function (T) {
  'use strict';

  T.TIK_INSTELLINGEN = {
    // Zoveel tikken per seconde echte tijd. Zestig is wat Spel.debug.stap al deed (1/60), dus de speeltest speelt
    // dezelfde wereld als ervoor.
    perSeconde: 60,
    // Hooguit zoveel tikken in één beeld: een computer die het niet bijhoudt, laat de wereld dan langzamer lopen, in
    // plaats van steeds verder achter te raken (tot 15 okt hield js/main.js een beeld op hooguit 0,05 seconde, net zo).
    meestPerBeeld: 3,
  };
  // Hoe lang een tik duurt, in seconden echte tijd.
  T.TIK = 1 / T.TIK_INSTELLINGEN.perSeconde;

  // Eén tik van de wereld: de kalender, elk dorp, wie er loopt, en waar de schout is het maaien, het veldwerk, het wild,
  // het dwalen en wie hem ziet. `dt` is de tik in echte seconden (waarop een uitval of een flits loopt); de wereld schuift
  // dt maal de snelheid op (`dtWereld`). `meet(naam, f)`, als het er is, doet f en meet hoe lang een deel duurt (de
  // meting van `npm run grootte`, gereedschap/grootte/harnas.cjs).
  const zonderMeten = (naam, f) => f();
  T.wereldTik = function (S, dt = T.TIK, meet = zonderMeten) {
    const dtWereld = dt * T.wereldFactor(S);
    S.tik = (S.tik || 0) + 1;
    voerOpdrachtenUit(S); // wat de spelers vroegen, voor deze tik (hieronder)
    // De klok van het scherm (S.tijd: een animatie, de wind, wanneer een koe gaat liggen) tikt hier ook, zodat hij op
    // elke computer gelijk loopt: hij gaat mee in wat bewaard wordt, en een paar regels lezen hem (T.rustVanDier,
    // js/vee.js; wanneer een deur openging). Hij loopt altijd, ook op pauze.
    S.tijd += dt;
    S.wereldTijd = (S.wereldTijd || 0) + dtWereld;
    T.tikKalender(S, dt);
    T.werkDagBij(S); // wakker worden na het slapen (js/dag.js)
    // Elk dorp leeft (js/dorp.js; werklijst, vraag 71, A): zijn dag, zijn bezoekers, zijn mensen, zijn rovers en zijn
    // voorvallen. Waar de schout is, lopen, maaien en dwalen ze hieronder; een dorp waar hij niet is, doet dat in
    // T.werkDorpBij zelf.
    meet('dorpen', () => {
      for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtWereld);
    });
    T.werkLandBij(S); // op reis de volgende provincie, en over de weg het gehucht uit (js/land.js)
    meet('lopen', () => T.beweegWezens(S, S.wereld, dt, dtWereld)); // wie loopt, waar de schout is (js/anim.js)
    // Een overgang naar een ander gebied wordt hier opgepakt, en niet daar waar hij ontstaat (T.bijAankomst): de lijst
    // wezens van de wereld verandert erdoor, en daar loopt het lopen net doorheen.
    if (S.naarGebied) T.gaNaarGebied(S, S.naarGebied);
    // Quests gaan vanzelf verder (js/quest.js): heb je wat een quest vraagt, dan schuift de fase op, nog vóór er iets
    // dwaalt of iemand je ziet.
    T.werkQuestsBij(S);
    // Ook op reis (js/land.js, de kaart van het land) gaat het dorp zijn gang: er wordt gemaaid en gedwaald.
    if (S.modus === 'verkennen' || S.modus === 'land') {
      // Vóór T.laatDwalen: wie hier een pad krijgt, aan het maaien slaat (T.werkOogstBij, js/akkers.js) of op zijn land
      // werkt (T.werkVeldwerkBij, js/veldwerk.js), staat voor T.laatDwalen al "bezig" (m.pad.length, m.maait of m.werkt)
      // en dwaalt deze tik niet ook nog weg.
      const hier = T.dorpHier(S);
      if (hier) {
        meet('oogst', () => T.werkOogstBij(S, hier, dtWereld));
        meet('veldwerk', () => T.werkVeldwerkBij(S, hier));
        meet('beesten', () => T.werkBeestenBij(S, hier)); // de wolven en de herten in het bos (js/beesten.js)
      }
      meet('dwalen', () => T.laatDwalen(S, dtWereld));
      const m = S.modus === 'verkennen' && T.zoekOntdekking(S);
      if (m) T.startGevecht(S, m, false);
    }
    if (S.modus === 'overgang' && S.wereld.wezens.every((e) => !e.pad.length)) T.beginGevecht(S);
  };

  // ── De opdrachten van de spelers ──
  //
  // Wat een speler doet en de wereld verandert (bouwen, een weg, een veld, afbreken, een soldaat erbij), gaat niet
  // rechtstreeks van de klik naar de regel: de klik geeft een opdracht, als gegevens (`{ soort, ... }`: namen, plekken en
  // nummers, geen dingen), en die gaat in bij een tik (T.geefOpdracht). In lockstep gaat precies die opdracht over de lijn,
  // en voert elke computer hem uit bij dezelfde tik; wie alleen speelt, bij de volgende tik, een zestigste van een seconde
  // later. Wat er gebeurde, zegt de regel tegen het dorp (T.zeg, js/dorp.js): wie de opdracht gaf, hoort het; in een
  // ander dorp blijft het bij dat dorp. Het scherm vraagt vooraf hetzelfde (of een gebouw past, wat een klik afbreekt),
  // zodat het zelden misgaat; gebeurde er in die tik toch iets, dan zegt de regel waarom niet.
  //
  // Per soort: wat de opdracht doet in dorp D. `o` heeft wat de klik meegaf.
  const meld = (D, r) => T.zeg(D, r.gelukt ? r.bericht : r.reden, r.gelukt ? 'goed' : 'gevaar');
  T.OPDRACHTEN = {
    // Een gebouw neerzetten (het bouwmenu, js/hud.js): { gebouw: soort, x, y }.
    bouw: (S, D, o) => meld(D, T.plaatsGebouw(D, o.gebouw, o.x, o.y)),
    // Een weg leggen (js/wegen.js): { van: { x, y }, tot: { x, y } }.
    weg: (S, D, o) => meld(D, T.legWeg(D, o.van, o.tot)),
    // Een akker of een wijngaard leggen (js/boerderij.js): { veld: soort, rechthoek: { x, y, b, h } }.
    veld: (S, D, o) => meld(D, T.legVeld(D, o.veld, o.rechthoek)),
    // Afbreken op een tegel (js/afbreken.js): { x, y }. Dezelfde vraag als de muis (T.handelingAfbreken).
    afbreken: (S, D, o) => {
      const h = T.handelingAfbreken(D, o.x, o.y);
      if (h && h.kan) h.doe();
      else if (h) T.zeg(D, h.tekst, 'gevaar');
    },
    // Een soldaat erbij of eraf bij een wachthuis (js/soldaten.js): { x, y, soldaat: soort, verschil: 1 of -1 }, met de
    // plek van het wachthuis (een gebouw heeft geen nummer, wel een vaste plek: g.x, g.y).
    soldaten: (S, D, o) => {
      const g = D.gebouwen.find((x) => x.soort === 'wachthuis' && x.x === o.x && x.y === o.y);
      if (g) T.zetSoldaten(D, g, o.soldaat, o.verschil);
    },
  };

  // Een speler geeft een opdracht (een klik, een knop). `opdracht.dorp`: het nummer van het dorp in S.dorpen (zonder: je
  // eigen dorp). Ze gaat in bij de volgende tik, en staat tot dan in S.opdrachten (die gaat mee in wat bewaard wordt).
  T.geefOpdracht = function (S, opdracht) {
    if (!T.OPDRACHTEN[opdracht.soort]) throw new Error(`Een opdracht die niet bestaat: ${opdracht.soort}`); // geen tekst
    const o = Object.assign({}, opdracht, {
      dorp: opdracht.dorp != null ? opdracht.dorp : S.dorpen.indexOf(S.dorp),
      tik: (S.tik || 0) + 1,
    });
    (S.opdrachten || (S.opdrachten = [])).push(o);
    return o;
  };
  function voerOpdrachtenUit(S) {
    if (!S.opdrachten || !S.opdrachten.length) return;
    const nu = S.opdrachten.filter((o) => o.tik <= S.tik);
    if (!nu.length) return;
    S.opdrachten = S.opdrachten.filter((o) => o.tik > S.tik);
    for (const o of nu) {
      const D = S.dorpen[o.dorp];
      if (D) T.OPDRACHTEN[o.soort](S, D, o);
    }
  }

  // Tik de wereld bij voor `dt` seconden echte tijd die verstreken (een beeld van js/main.js). Wat nog geen hele tik is,
  // blijft liggen tot het volgende beeld (`klok.rest`, alleen scherm: elke computer heeft zijn eigen beelden). Een tik
  // gaat al als er een halve klaarligt: dan valt bij zestig beelden per seconde elke tik in een eigen beeld, ook als een
  // beeld wat vroeger of later komt, en loopt het lopen niet met horten (de wereld loopt op den duur toch even snel als
  // de klok, want er gaat steeds een hele tik af). Geeft het aantal tikken.
  T.tikBij = function (S, klok, dt) {
    klok.rest = (klok.rest || 0) + dt;
    let n = 0;
    while (klok.rest >= T.TIK / 2 && n < T.TIK_INSTELLINGEN.meestPerBeeld) {
      T.wereldTik(S);
      klok.rest -= T.TIK;
      n++;
    }
    // Kon de computer het niet bijhouden, dan vergeet hij wat er nog lag: de wereld loopt dan langzamer.
    if (klok.rest > T.TIK) klok.rest = 0;
    return n;
  };
})(globalThis.Spel = globalThis.Spel || {});
