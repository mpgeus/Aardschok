// Het geld: de munten, de kas van het dorp en de beurs van de schout (werklijst vraag 141, stap 1; Marcel, 8 okt: "Ik denk
// dat we binnen in het dorp ook een economie nodig hebben", "schout heeft losse beurs en beheert de dorpskas / stadsgeld",
// "Loon voor de schout", "Omkopen uit eigen zak", en de munten "Ja": 1 goud = 10 zilver = 100 koper).
//
// Het goud van het dorp (`D.voorraad.goud`) is de kas: daaruit gaan de bouw, de heer en de marskramer, en daar komt de
// belasting in. In de code blijft het één getal in goud; op het scherm staat het in goud, zilver en koper (T.muntTekst),
// zodat een brood straks een paar koper kost en de heer in goud rekent. Daarnaast heeft de schout een eigen beurs
// (`D.geld.beurs`): op de eerste van de maand krijgt hij zijn loon uit de kas (T.tikGeldDag), en wat hij uit eigen zak
// geeft (de inner omkopen, en straks anderen helpen), gaat daaruit (T.betaalUitBeurs). De spelregel "Geld" op "Alles van
// het dorp" zet het terug: geen beurs, geen loon, en alles uit de kas, zoals vóór 8 okt.
(function (T) {
  'use strict';

  T.GELD_INSTELLINGEN = {
    // Heeft de schout een eigen beurs (de spelregel "Geld")? Zonder gaat alles uit de kas, en krijgt hij geen loon.
    beurzen: true,
    // Zoveel zilver is een goud, en zoveel koper een zilver.
    zilverPerGoud: 10,
    koperPerZilver: 10,
    // Het loon van de schout, in goud per maand, uit de kas op de eerste van de maand.
    loon: 1,
    // Zoveel goud heeft hij in zijn beurs als het spel begint.
    beginBeurs: 2,
    // Heeft elk huis een eigen beurs (vraag 141, stap 2; de spelregel "Geld" op "Een beurs per huis")? Dan koopt een huis
    // wat het nodig heeft en wil uit het pakhuis van het dorp, en gaat het geld naar wie het maakte.
    huizen: true,
    // Zoveel goud heeft een huis in zijn beurs als het er voor het eerst geld voor nodig heeft.
    beginHuisBeurs: 0.5,
    // Wat een stuk kost, in koper (1 goud = 100 koper). Wat hier niet staat, kost prijsAnders.
    prijzen: {
      graan: 1, meel: 1, brood: 2, bier: 1, wijn: 2, vlees: 2, vis: 2, kaas: 2, eieren: 1, groente: 1, melk: 1,
      hout: 1, turf: 1, steen: 2, klei: 1, riet: 1, planken: 2, wol: 1, laken: 6, huiden: 2, hooi: 1, mest: 1,
      ijzer: 4, gereedschap: 8, zout: 2, wapens: 10, vaten: 3,
    },
    prijsAnders: 1,
    // De belasting als een deel van wat een huis die maand verdiende (Marcel, 9 okt: "ja dat is akkoord"): een tiende als
    // de wet belasting is aangenomen (zoveel goud per mens, belastingIJk; meer per mens is naar verhouding meer).
    tiende: 0.1,
    belastingIJk: 0.05,
    // Staat er een markt, dan gaat zoveel van elke verkoop aan een huis naar de kas (het marktgeld).
    marktgeld: 0.1,
  };
  const IN = () => T.GELD_INSTELLINGEN;
  const koperPerGoud = () => IN().zilverPerGoud * IN().koperPerZilver;

  // Een bedrag in goud als munten: { goud, zilver, koper }, naar beneden afgerond op een koper.
  T.muntenVan = function (goud) {
    let koper = Math.floor((goud || 0) * koperPerGoud() + 1e-6);
    const g = Math.floor(koper / koperPerGoud());
    koper -= g * koperPerGoud();
    const z = Math.floor(koper / IN().koperPerZilver);
    return { goud: g, zilver: z, koper: koper - z * IN().koperPerZilver };
  };

  // Een bedrag als tekst: "3 goud, 2 zilver en 5 koper", of kort "3g 2z 5k"; wat nul is, staat er niet bij.
  T.muntTekst = function (goud, kort) {
    const m = T.muntenVan(goud);
    const delen = [['goud', 'g'], ['zilver', 'z'], ['koper', 'k']].filter(([w]) => m[w] > 0).map(([w, k]) => (kort ? `${m[w]}${k}` : `${m[w]} ${w}`));
    if (!delen.length) return kort ? '0' : 'niets';
    if (kort) return delen.join(' ');
    return delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0];
  };

  // Heeft de schout een eigen beurs (de spelregel)?
  T.metBeurzen = () => !!IN().beurzen;

  function geldVan(D) {
    if (!D.geld) D.geld = { beurs: IN().beginBeurs, loonGehad: null };
    return D.geld;
  }

  // Wat er in de beurs van de schout zit; zonder beurzen is dat de kas.
  T.beursVan = (D) => (T.metBeurzen() ? geldVan(D).beurs : (D.voorraad ? D.voorraad.goud : D.goud) || 0);
  T.kasVan = (D) => (D.voorraad ? D.voorraad.goud : D.goud) || 0;

  // Iets erbij of eraf in de beurs van de schout (zonder beurzen: in de kas). Nooit onder nul.
  T.wijzigBeurs = function (D, n) {
    if (!T.metBeurzen()) {
      T.geefGoud(D, n);
      return;
    }
    const G = geldVan(D);
    G.beurs = Math.max(0, G.beurs + n);
    if (T.ui && T.ui.toonVoorraad && D.voorraad) T.ui.toonVoorraad(D);
  };

  // Kan de schout dit uit eigen zak betalen? En betaal het dan: true als het lukte.
  T.kanUitBeurs = (D, n) => T.beursVan(D) + 1e-9 >= n;
  T.betaalUitBeurs = function (D, n) {
    if (!T.kanUitBeurs(D, n)) return false;
    T.wijzigBeurs(D, -n);
    return true;
  };

  // ---------------------------------------------------------------------------------------------
  // Stap 2: een beurs per huis, en van wie wat in het pakhuis ligt
  // ---------------------------------------------------------------------------------------------
  //
  // De voorraad blijft het pakhuis van het dorp, maar het dorp onthoudt per goed van wie het is (`D.geld.van[goed]`, een
  // Map van eigenaar naar hoeveel: een gebouw waar een gezin woont, of 'kas'). Wat een werkplaats maakt, is van de huizen
  // van wie er werkt; het graan van de boer zodra het in zijn schuur is; het sprokkelhout van de huizen zonder werk; wat de
  // kas kocht of er bij het begin lag, van de kas (T.wijzigVoorraad in js/voorraad.js boekt het, met `eigenaar`). Wie iets
  // uit het pakhuis neemt, betaalt de eigenaars naar wat hij van elk nam (T.betaalGenomen): een huis voor zijn eten en
  // zijn wensen, een werkplaats voor wat hij omzet, en de kas voor wat het dorp gebruikt (de bouw, de heer, de
  // marskramer; Marcel, 9 okt, "ja dat is akkoord", zodat het geld rondgaat). Wat bederft of gestolen wordt, betaalt
  // niemand. Een huis kiest zelf wat het met zijn geld koopt (T.berekenWensen in js/wensen.js): eerst zijn eten, dan in
  // de winter zijn brandhout, dan zijn wensen; wie te arm is, mist het (`g.wensen.teArm`), en wie zijn eten niet kan
  // betalen, lijdt honger in zijn huis (Marcel, 8 okt: "1. B").

  const metHuizen = () => !!(IN().beurzen && IN().huizen);
  T.metHuisbeurzen = metHuizen;

  // Wat een stuk van dit goed kost, in goud.
  T.prijsVan = (wat) => ((IN().prijzen[wat] != null ? IN().prijzen[wat] : IN().prijsAnders) || 0) / koperPerGoud();

  // De beurs van een huis (gebouw), zonder hem te maken: wat erin zit, of de beginbeurs als hij er nog geen had.
  T.huisBeurs = (g) => (g.beurs != null ? g.beurs : IN().beginHuisBeurs);

  function saldo(D, wie) {
    if (wie === 'kas') return T.kasVan(D);
    if (wie === 'schout') return T.beursVan(D);
    return T.huisBeurs(wie);
  }
  function wijzigSaldo(D, wie, n) {
    if (wie === 'kas') T.wijzigVoorraad(D, 'goud', n);
    else if (wie === 'schout') T.wijzigBeurs(D, n);
    else wie.beurs = Math.max(0, T.huisBeurs(wie) + n);
  }

  // Geld van de een naar de ander (een huis, 'kas' of 'schout'), zoveel als de betaler heeft. Wat een huis krijgt, telt
  // als verdiend (`g.verdiend`, voor de tiende). Geeft wat er betaald is.
  T.betaal = function (D, van, naar, goud) {
    if (!(goud > 0) || van === naar) return 0;
    const n = Math.min(goud, saldo(D, van));
    if (!(n > 0)) return 0;
    wijzigSaldo(D, van, -n);
    wijzigSaldo(D, naar, n);
    if (naar !== 'kas' && naar !== 'schout') naar.verdiend = (naar.verdiend || 0) + n;
    return n;
  };

  // Staat er een markt? Dan gaat het marktgeld van elke verkoop aan een huis naar de kas.
  const heeftMarkt = (D) => (D.gebouwen || []).some((g) => g.soort === 'markt' && g.klaar);

  // Wie iets uit het pakhuis nam (`genomen`: een Map van eigenaar naar hoeveel, T.genomen hieronder), betaalt de
  // eigenaars. `betaler` is een huis, 'kas' of 'schout'; wat van hemzelf was, betaalt hij niet. Een huis dat koopt, betaalt
  // het marktgeld aan de kas als er een markt staat.
  T.betaalGenomen = function (D, wat, genomen, betaler, deel = 1) {
    if (!metHuizen() || !genomen) return 0;
    let samen = 0;
    const markt = betaler !== 'kas' && heeftMarkt(D);
    for (const [eigenaar, n] of genomen) {
      if (eigenaar === betaler) continue;
      const bedrag = n * deel * T.prijsVan(wat);
      const naarDeKas = markt && eigenaar !== 'kas' ? bedrag * IN().marktgeld : 0;
      samen += T.betaal(D, betaler, 'kas', naarDeKas);
      samen += T.betaal(D, betaler, eigenaar, bedrag - naarDeKas);
    }
    return samen;
  };

  // De boekhouding van het pakhuis (vanuit T.wijzigVoorraad, js/voorraad.js): `echt` is wat er werkelijk bij of af ging,
  // `voor` wat er lag. Wat erbij komt, is van `eigenaar` (of de kas); wat eraf gaat, eerst van `eigenaar` als die er is,
  // en dan van iedereen naar wat hij had. Wat eraf ging, onthoudt T.genomen tot de volgende keer (niet in S: het is voor
  // de regel die het net nam).
  let laatstGenomen = null;
  T.genomen = () => laatstGenomen;
  T.boekPakhuis = function (D, wat, echt, eigenaar, voor) {
    laatstGenomen = null;
    if (!metHuizen() || wat === 'goud' || !echt) return;
    const G = geldVan(D);
    const van = G.van || (G.van = {});
    const m = van[wat] || (van[wat] = new Map());
    // Wat er lag, moet kloppen met de boeken (een oud spel, of iets dat buiten de boeken om veranderde): het verschil is
    // van de kas, of gaat er naar verhouding af.
    let som = 0;
    for (const [w, n] of m) {
      if (w !== 'kas' && !(D.gebouwen || []).includes(w)) {
        m.set('kas', (m.get('kas') || 0) + n);
        m.delete(w);
      }
      som += n;
    }
    if (som < voor - 1e-9) m.set('kas', (m.get('kas') || 0) + voor - som);
    else if (som > voor + 1e-9) for (const [w, n] of m) m.set(w, (n * voor) / som);
    if (echt > 0) {
      const w = eigenaar || 'kas';
      m.set(w, (m.get(w) || 0) + echt);
      return;
    }
    let rest = -echt;
    const genomen = new Map();
    if (eigenaar && m.has(eigenaar)) {
      const n = Math.min(rest, m.get(eigenaar));
      genomen.set(eigenaar, n);
      m.set(eigenaar, m.get(eigenaar) - n);
      rest -= n;
    }
    if (rest > 1e-12) {
      let totaal = 0;
      for (const n of m.values()) totaal += n;
      const deel = totaal > 0 ? Math.min(1, rest / totaal) : 0;
      for (const [w, n] of m) {
        const neem = n * deel;
        if (!(neem > 0)) continue;
        genomen.set(w, (genomen.get(w) || 0) + neem);
        m.set(w, n - neem);
      }
    }
    for (const [w, n] of m) if (n < 1e-9) m.delete(w);
    laatstGenomen = genomen;
  };

  // Van wie dit goed is: { eigenaar: hoeveel }, voor het venster en de toetsen.
  T.eigenaarsVan = (D, wat) => (D.geld && D.geld.van && D.geld.van[wat]) || new Map();

  // Wie betaalt voor wat er in dit huis gebruikt wordt: het huis zelf, of de schout uit zijn beurs voor zijn eigen huis.
  T.betalerVan = (g) => (g && g.huis === 'schout' ? 'schout' : g);

  // Betaal wat er net genomen is (T.genomen) door een paar betalers samen, elk zijn deel: [{ wie, deel }].
  T.betaalGenomenDoor = function (D, wat, genomen, betalers) {
    if (!genomen || !betalers || !betalers.length) return 0;
    let samen = 0;
    for (const b of betalers) if (b.deel > 0) samen += T.betaalGenomen(D, wat, genomen, b.wie, b.deel);
    return samen;
  };

  // Neem iets uit het pakhuis en betaal de eigenaars. `betaler` is een huis, 'kas' of 'schout', of een lijst
  // [{ wie, deel }] die samen betaalt. Wie alleen neemt, neemt eerst wat van hemzelf is. Geeft wat genomen is.
  T.neemEnBetaal = function (D, wat, n, betaler) {
    if (!(n > 0)) return 0;
    const voor = D.voorraad[wat] || 0;
    T.wijzigVoorraad(D, wat, -n, Array.isArray(betaler) ? undefined : betaler);
    const genomen = T.genomen();
    if (Array.isArray(betaler)) T.betaalGenomenDoor(D, wat, genomen, betaler);
    else T.betaalGenomen(D, wat, genomen, betaler);
    return voor - (D.voorraad[wat] || 0);
  };

  // Welk deel van zijn eten (`etenDeel`) of brandhout (`brandDeel`) een huis vandaag kon kopen (T.berekenWensen, js/wensen.js
  // zet het op het huis); een huis zonder wensen (het huis van de schout, de herberg) koopt alles.
  T.deelVanHuis = (g, veld) => (g.wensen && g.wensen[veld] != null ? g.wensen[veld] : 1);

  // Wie samen betaalt voor wat het dorp eet of stookt: elk huis waar iemand woont, naar `gewicht(g, mensen)` van `totaal`
  // (de schout uit zijn beurs voor zijn eigen huis). Wat op niemand valt (wie nog geen huis heeft), betaalt niemand.
  // Null zonder bewoners.
  T.wieBetaalt = function (D, gewicht, totaal) {
    if (!D.bewoners || !(totaal > 0)) return null;
    const tel = new Map();
    for (const p of D.bewoners.mensen) if (p.huis) tel.set(p.huis, (tel.get(p.huis) || 0) + 1);
    const lijst = [];
    for (const [g, n] of tel) {
      const w = gewicht(g, n);
      if (w > 0) lijst.push({ wie: T.betalerVan(g), deel: w / totaal });
    }
    return lijst;
  };

  // Wat het dorp zelf gebruikt, betaalt de kas aan wie het maakte (de bouw, de heer, de marskramer): `kosten` is
  // { goed: hoeveel }, zoals bij een gebouw; het goud gaat gewoon uit de kas.
  T.kasNeemt = function (D, kosten) {
    for (const wat in kosten) {
      if (wat === 'goud') T.wijzigVoorraad(D, 'goud', -kosten[wat]);
      else T.neemEnBetaal(D, wat, kosten[wat], 'kas');
    }
  };

  // Iets in het pakhuis voor een paar eigenaars samen (een werkplaats met mensen uit meer huizen, het sprokkelhout van de
  // huizen zonder werk), in gelijke delen; zonder eigenaars voor de kas.
  T.legInPakhuis = function (D, wat, n, eigenaars) {
    if (!(n > 0)) return;
    const lijst = (eigenaars || []).filter(Boolean);
    if (!metHuizen() || !lijst.length) {
      T.wijzigVoorraad(D, wat, n);
      return;
    }
    for (const w of lijst) T.wijzigVoorraad(D, wat, n / lijst.length, w);
  };

  // De huizen van wie in deze werkplaats werkt (een herberg waar de herbergierster woont, is van haar eigen huis).
  T.makersVan = function (D, g) {
    const huizen = [];
    for (const p of (D.bewoners && D.bewoners.mensen) || []) if (p.werk === g && p.huis && !huizen.includes(p.huis)) huizen.push(p.huis);
    return huizen;
  };

  // De huizen waar iemand woont die kan werken en geen werk heeft: zij rapen het sprokkelhout (Marcel, 9 okt).
  T.sprokkelaars = function (D) {
    const huizen = [];
    for (const p of (D.bewoners && D.bewoners.mensen) || []) {
      if (p.werk || !p.huis || huizen.includes(p.huis) || !T.kanWerken(p)) continue;
      if (p.leeftijd !== 'volwassen' && p.leeftijd !== 'jong') continue;
      huizen.push(p.huis);
    }
    return huizen;
  };

  // Elke dag, na het werk (T.tikGebouwenDag, js/gebouwen.js): op de eerste van de maand krijgt de schout zijn loon uit de
  // kas, zoveel als erin zit.
  T.tikGeldDag = function (D, dag) {
    if (!T.metBeurzen() || !D.voorraad) return;
    const G = geldVan(D);
    const maand = Math.floor(dag / T.DAGEN_PER_MAAND);
    if (T.datumVanDag(dag).dagVanMaand !== 1 || G.loonGehad === maand) return;
    G.loonGehad = maand;
    // Wat een huis verdiende, telt per maand (de tiende, T.tikWettenDag in js/wetten.js, nam er net zijn deel van): wat
    // het vorige maand verdiende, blijft staan voor het briefje van het huis.
    for (const g of D.gebouwen || []) {
      if (g.verdiend == null) continue;
      g.verdiendVorige = g.verdiend;
      g.verdiend = 0;
    }
    const loon = Math.min(IN().loon, T.kasVan(D));
    if (!(loon > 0)) {
      T.zeg(D, 'Je loon blijft uit: de kas is leeg.', 'gevaar');
      return;
    }
    T.wijzigVoorraad(D, 'goud', -loon);
    T.wijzigBeurs(D, loon);
    T.schrijfOp(D, 'geld', { tekst: `Je kreeg je loon uit de kas: ${T.muntTekst(loon)}.` });
  };
})(globalThis.Spel = globalThis.Spel || {});
