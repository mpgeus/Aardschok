// De voorvallen: het dorp spreekt je aan (werklijst vraag 65, A; Marcel, 29 sep: "A ja"). Om de paar dagen gebeurt
// er iets: iemand met een naam komt naar de schout met een vraag, een ruzie of een ramp, en jij kiest uit twee of
// drie antwoorden, elk met een prijs die je vooraf ziet. In de winter vaker, zodat ook die tijd iets vraagt, en
// sommige komen terug. Regels zonder scherm; toetsen in test/voorvallen.test.cjs.
//
// Een voorval is een gesprek dat de ander begint. Wat er gezegd wordt, staat in js/gesprekken.js onder dezelfde naam
// als hier (T.GESPREKKEN.diefstal hoort bij T.VOORVALLEN.diefstal), zodat je het in de gespreksschrijver schrijft en
// naleest zoals elk gesprek. In een zin vult het spel in: {wie}, wie het je komt zeggen, en {ander}, over wie het
// gaat. Wat een antwoord doet, staat in zijn gevolg (doe), en het venster zegt het vooraf (T.prijsVanKeuze). Naast
// wat elk gesprek kan (goud, een vlag):
//   graan: -20        uit de voorraad of erbij (WAREN hieronder, via T.wijzigVoorraad); het moet er wel zijn
//   tevreden: 5       het dorp is 5% tevredener (of minder), en dat slijt in stemmingDagen weg
//   argwaan: 3        de inner wordt 3% argwanender (of minder: -3)
//   verban: 'ander'   die moet weg ('wie' of 'ander'); wie wegtrekt, gaat het bos in en komt terug als rover
//   sterfkans: 30     met 30% kans sterft er iemand: over wie het gaat (ander), of anders de zwakste
//   gezin: 1          er komt een gezin bij, als er plaats is (T.gezinKomt, js/gebouwen.js)
//   schaap: -2        van het vee (T.VEE, js/vee.js) gaan er twee, het jongste eerst
//   voorval: 'x'      later komt voorval x, over dezelfde mensen. Een lijstje: een ervan, geloot; 'niets' in dat
//                     lijstje is: niets. Dat zegt het venster niet: wie je liet gaan, kan terugkomen.
//
// Wanneer er een komt en welke, zegt dit bestand (T.VOORVALLEN hieronder). Wie je zoekt, loopt naar de schout en
// spreekt hem aan zodra hij stilstaat; de tijd staat stil tot je antwoordt (js/dialoog.js). Sluit je het gesprek
// zonder antwoord, dan wacht hij, met een uitroepteken, tot je hem aanspreekt. 's Avonds gaat hij naar huis, en de
// volgende ochtend komt hij terug. Is de schout niet in het dorp, dan beslist de raadsman (js/raadsman.js; vraag 66);
// sprak hij hem in het dorp niet binnen zoektDagen, dan gaat het voorbij (vraag 68, B), en zonder raadsman ook. Dat
// neemt het dorp je kwalijk.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js). Een eerste
  // voorstel van Claude (29 sep): met de voorvallen erbij vraagt een speeljaar een keuze per één à twee minuten op
  // 30× (vraag 65, "Klaar als").
  T.VOORVALLEN_INSTELLINGEN = {
    aan: true,
    // Om de hoeveel dagen er een voorval komt, gemiddeld: buiten de winter, en in de winter vaker. Het echte aantal
    // ligt tussen de helft en anderhalf keer (spreiding).
    dagenTussen: 10,
    dagenTussenWinter: 6,
    spreiding: 0.5,
    // Het eerste komt niet vóór deze dag: eerst de brief van de heer, en een paar dagen rondkijken.
    eersteNa: 4,
    // Hetzelfde voorval komt niet binnen zoveel dagen terug.
    pauze: 90,
    // Een vervolg (voorval: 'x' in een antwoord) komt na zoveel dagen, tussen van en tot; een voorval kan zijn eigen
    // tijd hebben (na, in T.VOORVALLEN).
    vervolgVan: 8,
    vervolgTot: 25,
    // Wie je zoekt, begint op een uur tussen deze twee, en zoekt tot de avond; na zoektDagen gaat het voorbij.
    zoektVanaf: 9,
    zoektTot: 14,
    zoektDagen: 2,
    // Zo lang draagt het dorp een stemming na (tevreden: 5 in een antwoord); dan is hij weggesleten.
    stemmingDagen: 30,
    // Wie je niet vond, neemt je dat kwalijk: zoveel procent minder tevreden.
    nietGevonden: -2,
  };
  const IN = () => T.VOORVALLEN_INSTELLINGEN;

  // Wat een antwoord uit de voorraad neemt of erin legt (T.wijzigVoorraad). Goud gaat zoals in elk gesprek
  // (js/quest.js), en het vee staat in T.VEE.
  const WAREN = ['graan', 'hout', 'wol', 'bier', 'ijzer', 'zout', 'vlees', 'vis', 'kaas', 'hooi'];

  // De voorvallen. Per voorval:
  //   soort    'recht' (rechtspraak), 'verzoek', 'ramp', 'kans', 'feest' of 'heer' (de grillen van de heer)
  //   titel    waar het over gaat, voor de balk: "Het is blij met je antwoord op de diefstal"
  //   woorden  { blij, last }: wat de balk dan zegt, als het anders moet ("Het is blij met de bruiloft")
  //   wie      wie het je komt zeggen; ander: over wie het gaat (zonder: niemand). Een vraag, of een lijstje vragen
  //            waarvan de eerste die iemand oplevert telt: { geslacht, leeftijd (zonder: volwassen), boer (true of
  //            false), karakter (de boer met dat karakter, js/boeren.js), werk (hij werkt in zo'n gebouw) }. In een
  //            vervolg: 'wie' of 'ander' van de eerste keer (zonder: dezelfde als toen).
  //   als      wanneer het kan: { maanden, seizoen, gebouw, nietGebouw, voorraad: { graan: 40 }, vee: { schaap: 3 },
  //            trede, en wat een gesprek ook kent (vlag, goud) }
  //   gewicht  hoe vaak, naast de andere die kunnen (zonder: 1); winter: het gewicht in de winter
  //   pauze    niet binnen zoveel dagen terug (zonder: de pauze uit het blok hierboven)
  //   vervolg  true: komt alleen als vervolg op een ander voorval; na: [van, tot], na zoveel dagen
  //   roep     het bericht als hij je gaat zoeken (zonder: "{wie} zoekt je.")
  //   sterft   wie er sterft, zegt het bericht zo: "De koorts: ..." (zonder: de titel)
  const MAN = { geslacht: 'man', leeftijd: ['jong', 'volwassen'] };
  T.VOORVALLEN = {
    // Rechtspraak (de vierde van 23 sep, spel.md): streng houdt de orde, mild houdt vrienden, en wie je
    // veroordeelde, vergeet het niet.
    diefstal: {
      soort: 'recht', titel: 'de diefstal',
      wie: { geslacht: 'vrouw', leeftijd: ['volwassen', 'oud'] }, ander: { ...MAN, boer: false },
    },
    diefstalWeer: { soort: 'recht', titel: 'de dief', vervolg: true, wie: { leeftijd: ['volwassen', 'oud'] } },
    diefstalWrok: { soort: 'recht', titel: 'de dief', vervolg: true, wie: { leeftijd: ['volwassen', 'oud'] } },
    diefDank: { soort: 'kans', titel: 'de dief', vervolg: true, wie: 'ander', ander: 'wie' },
    vechtpartij: {
      soort: 'recht', titel: 'de vechtpartij', als: { gebouw: 'herberg' },
      wie: MAN, ander: [{ karakter: 'heethoofd', geslacht: 'man' }, { karakter: 'drinker', geslacht: 'man' }, MAN],
    },
    akkergrens: { soort: 'recht', titel: 'de akkergrens', wie: { boer: true }, ander: { boer: true } },
    akkergrensWraak: { soort: 'recht', titel: 'de akkergrens', vervolg: true },
    stroper: {
      soort: 'recht', titel: 'de stroper',
      wie: { geslacht: 'man', leeftijd: ['volwassen', 'oud'] }, ander: { ...MAN, boer: false },
    },
    heks: {
      soort: 'recht', titel: 'de heks', woorden: { blij: 'je vonnis over de heks', last: 'je vonnis over de heks' }, pauze: 180,
      wie: {}, ander: { geslacht: 'vrouw', leeftijd: 'oud', boer: false },
    },
    woeker: { soort: 'recht', titel: 'de schuld bij de woekeraar', wie: { boer: false }, ander: { karakter: 'woekeraar' } },
    woekerWraak: { soort: 'recht', titel: 'de woekeraar', vervolg: true, wie: 'ander', ander: 'wie' },
    // Verzoeken
    lening: { soort: 'verzoek', titel: 'de lening', wie: { boer: false } },
    leningTerug: { soort: 'verzoek', titel: 'de lening', vervolg: true },
    leningUitstel: { soort: 'verzoek', titel: 'de lening', vervolg: true },
    vreemdeling: { soort: 'verzoek', titel: 'de vreemdelingen', wie: { leeftijd: ['volwassen', 'oud'] } },
    smid: { soort: 'kans', titel: 'de smid uit de stad', pauze: 360, wie: { leeftijd: ['volwassen', 'oud'] } },
    zaaigraan: { soort: 'verzoek', titel: 'het zaaigraan', als: { maanden: ['lentemaand', 'grasmaand'] }, wie: { boer: true } },
    zaaigraanTerug: { soort: 'verzoek', titel: 'het zaaigraan', vervolg: true, na: [120, 150] },
    weduweDak: { soort: 'verzoek', titel: 'het dak van de weduwe', als: { seizoen: ['herfst', 'winter'] }, wie: { karakter: 'weduwe' } },
    // Rampen: iets doen kost iets, niets doen ook.
    brand: {
      soort: 'ramp', titel: 'de brand', winter: 3, roep: 'Brand! {wie} komt je halen.',
      wie: { leeftijd: ['jong', 'volwassen'] }, ander: { boer: false },
    },
    ziekte: { soort: 'ramp', titel: 'de koorts', winter: 2, sterft: 'De koorts', wie: { geslacht: 'vrouw' } },
    wolven: {
      soort: 'ramp', titel: 'de wolven', als: { seizoen: 'winter', vee: { schaap: 3 } }, winter: 3, sterft: 'De jacht op de wolven',
      roep: 'Wolven! {wie} komt je halen.', wie: [{ werk: 'schaapskooi' }, MAN], ander: MAN,
    },
    storm: {
      soort: 'ramp', titel: 'de storm', als: { maanden: ['herfstmaand', 'wijnmaand', 'slachtmaand', 'sprokkelmaand'], voorraad: { graan: 40 } },
    },
    muizen: { soort: 'ramp', titel: 'de muizen', als: { voorraad: { graan: 60 } } },
    // Kansen
    heler: { soort: 'kans', titel: 'het ijzer van de heer', wie: MAN },
    vondst: { soort: 'kans', titel: 'de vondst', wie: { leeftijd: ['kind', 'jong'] } },
    zwerver: { soort: 'kans', titel: 'de zwerver' },
    wijsheid: { soort: 'kans', titel: 'de raad van de oude', wie: { karakter: 'grijsaard' } },
    // Feesten: graan op en een tevreden dorp, en wat op is, telt de inner niet (Lords of the Realm, idee 4).
    bruiloft: {
      soort: 'feest', titel: 'de bruiloft', woorden: { blij: 'de bruiloft', last: 'de bruiloft zonder feest' },
      wie: { leeftijd: ['volwassen', 'oud'] }, ander: { geslacht: 'man', leeftijd: 'jong' },
    },
    oogstfeest: {
      soort: 'feest', titel: 'het oogstfeest', woorden: { blij: 'het oogstfeest', last: 'het oogstfeest dat er niet was' },
      als: { maanden: ['oogstmaand', 'herfstmaand'], voorraad: { graan: 80 } }, pauze: 200, gewicht: 3, wie: { boer: true },
    },
    klok: { soort: 'verzoek', titel: 'de klok voor de kapel', als: { gebouw: 'kapel' }, pauze: 360, wie: { karakter: 'vrome' } },
    lied: { soort: 'feest', titel: 'het lied over de heer', als: { gebouw: 'herberg' }, wie: { karakter: 'zanger' } },
    // De grillen van de heer (een idee van 23 sep): wat zijn bode kwam zeggen.
    standbeeld: { soort: 'heer', titel: 'het standbeeld', pauze: 360, wie: [{ werk: 'herberg' }, {}] },
    jacht: { soort: 'heer', titel: 'de jacht van de heer', als: { maanden: ['herfstmaand', 'wijnmaand'] }, pauze: 360 },
    ramen: { soort: 'heer', titel: 'de belasting op ramen', pauze: 360 },
  };

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  // Een getal 0..1, vast per spel, per dag en per vraag `n` (zoals in js/rovers.js), zodat een speeltest met hetzelfde
  // zaad hetzelfde jaar speelt.
  const lot = (D, dag, n) => T.dobbelsteen(((D.lot && D.lot.zaad) || 1) * 43 + Math.floor(dag) * 7919 + n)();
  const bericht = (tekst, soort) => {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  };
  const elk = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const naam = (p) => T.naamVanBewoner(p);
  const inWinter = (dag) => T.datumVanDag(dag).seizoen === 'winter';

  // S.voorvallen:
  //   volgende   de dag waarop het volgende voorval op zijn vroegst komt
  //   lopend     het voorval van nu: { id, wie, ander, dag, vanaf, tot, gemeld, aangesproken }, of null. Wie (een
  //              bewoner, js/bewoners.js) zoekt je vanaf `vanaf` (een dag, met het uur achter de komma), tot `tot`.
  //   wacht      de vervolgen die nog komen: [{ id, op, wie, ander }]
  //   geweest    per voorval de laatste dag dat het er was
  //   stemming   wat het dorp nadraagt: [{ waarde, dag, woorden }] (T.voorvalStemming)
  //   aantal, beantwoord, doorRaadsman   hoeveel er waren, hoeveel je er beantwoordde, en hoeveel de raadsman
  //   laatstVoorbij   de dag dat er het laatst een voorbijging zonder dat iemand besliste (js/raad.js)
  T.nieuweVoorvallen = () => ({ volgende: null, lopend: null, wacht: [], geweest: {}, stemming: [], aantal: 0, beantwoord: 0, doorRaadsman: 0 });

  // ---------------------------------------------------------------------------------------------
  // Wie het je komt zeggen, en over wie het gaat
  // ---------------------------------------------------------------------------------------------

  // Kan het over hem gaan? Hij woont hier, is er (niet weg, niet onderweg hierheen), en hoort niet bij de schout.
  function kanHetBetreffen(D, p) {
    return !!(p && D.bewoners && D.bewoners.mensen.includes(p)) && !p.schout && !(p.hoofd && p.hoofd.schout) && !p.weg && !p.komt;
  }
  // Kan hij het je komen zeggen? En niets anders heeft hem nu: hij trekt niet weg, loopt niet met de militie mee
  // (js/rovers.js), en staat niet aan de schandpaal (js/heer.js).
  function kanKomen(D, p) {
    const e = p && p.wezen;
    return kanHetBetreffen(D, p) && !!e && !e.dood && !e.vertrekt && !e.opgeroepen && !e.moetNaar;
  }
  const isBoer = (p) => T.isBoer(p.wezen);

  // Past hij bij een vraag (zie T.VOORVALLEN)? Een karakter is altijd een boer, van elke leeftijd.
  function past(p, vraag) {
    if (vraag.geslacht && p.geslacht !== vraag.geslacht) return false;
    if (vraag.karakter) return isBoer(p) && !!p.wezen && p.wezen.karakter === vraag.karakter;
    if (!elk(vraag.leeftijd || 'volwassen').includes(p.leeftijd)) return false;
    if (vraag.boer != null && isBoer(p) !== vraag.boer) return false;
    if (vraag.werk && !(p.werk && p.werk.soort === vraag.werk)) return false;
    return true;
  }

  // Wie het is: de eerste vraag uit een lijstje die iemand oplevert (zo gaat de heethoofd voor, en anders een man),
  // geloot uit wie past. Niet wie het al is, en niet uit zijn gezin.
  function kies(D, vragen, dag, n, kan, naast) {
    for (const vraag of elk(vragen)) {
      const lijst = D.bewoners.mensen.filter((p) => kan(D, p) && past(p, vraag) && !(naast && (p === naast || p.gezin === naast.gezin)));
      if (lijst.length) return lijst[Math.floor(lot(D, dag, n) * lijst.length)];
    }
    return null;
  }

  // ---------------------------------------------------------------------------------------------
  // Welk voorval, en wanneer
  // ---------------------------------------------------------------------------------------------

  const heeftGebouw = (D, soort) => (D.gebouwen || []).some((g) => g.soort === soort && g.klaar);

  // Is het er de tijd voor (als, in T.VOORVALLEN)?
  function tijdVoor(D, als, dag) {
    const d = T.datumVanDag(dag);
    if (als.maanden && !elk(als.maanden).includes(T.MAANDEN[d.maand].naam)) return false;
    if (als.seizoen && !elk(als.seizoen).includes(d.seizoen)) return false;
    if (als.trede && !T.tredeMinstens(D, als.trede)) return false;
    if (!elk(als.gebouw).every((s) => heeftGebouw(D, s))) return false;
    if (elk(als.nietGebouw).some((s) => heeftGebouw(D, s))) return false;
    for (const [wat, n] of Object.entries(als.voorraad || {})) if (((D.voorraad && D.voorraad[wat]) || 0) < n) return false;
    for (const [soort, n] of Object.entries(als.vee || {})) if (T.veeVan(D).filter((e) => e.dier === soort).length < n) return false;
    return T.voorwaardeGeldt(null, D, null, als);
  }

  // Kan dit voorval nu komen? Het is er de tijd voor, het was er niet te kort geleden, en er is iemand die het je komt
  // zeggen (en over wie het gaat). Geeft { wie, ander } of null. Een vervolg komt alleen na zijn eerste keer.
  T.voorvalKan = function (D, id, dag) {
    const v = T.VOORVALLEN[id];
    if (!v || v.vervolg || !T.GESPREKKEN[id] || !D.bewoners) return null;
    const V = D.voorvallen || T.nieuweVoorvallen();
    const vorige = V.geweest[id];
    if (vorige != null && dag - vorige < (v.pauze != null ? v.pauze : IN().pauze)) return null;
    if (!tijdVoor(D, v.als || {}, dag)) return null;
    const wie = kies(D, v.wie || {}, dag, 11, kanKomen, null);
    const ander = wie && v.ander ? kies(D, v.ander, dag, 13, kanHetBetreffen, wie) : null;
    if (!wie || (v.ander && !ander)) return null;
    return { wie, ander };
  };

  // Welk voorval er vandaag komt: geloot naar gewicht, uit wat er nu kan. Geeft { id, wie, ander } of null.
  T.kiesVoorval = function (D, dag) {
    const winter = inWinter(dag);
    const kan = [];
    let som = 0;
    for (const id of Object.keys(T.VOORVALLEN)) {
      const v = T.VOORVALLEN[id];
      const gewicht = winter && v.winter != null ? v.winter : v.gewicht != null ? v.gewicht : 1;
      const mensen = gewicht > 0 && T.voorvalKan(D, id, dag);
      if (!mensen) continue;
      kan.push({ id, gewicht, wie: mensen.wie, ander: mensen.ander });
      som += gewicht;
    }
    let r = lot(D, dag, 7) * som;
    for (const k of kan) if ((r -= k.gewicht) < 0) return k;
    return null;
  };

  // Om de hoeveel dagen het volgende komt: in de winter vaker, en nooit precies even vaak.
  function tussen(D, dag) {
    const basis = inWinter(dag) ? IN().dagenTussenWinter : IN().dagenTussen;
    const s = IN().spreiding;
    return Math.max(1, Math.round(basis * (1 - s + 2 * s * lot(D, dag, 19))));
  }

  // Een voorval begint: wie het zegt, gaat je vandaag zoeken, vanaf een uur tussen zoektVanaf en zoektTot.
  T.beginVoorval = function (D, id, wie, ander, dag) {
    const V = D.voorvallen || (D.voorvallen = T.nieuweVoorvallen());
    const d = Math.floor(dag);
    const uur = IN().zoektVanaf + lot(D, d, 17) * (IN().zoektTot - IN().zoektVanaf);
    V.lopend = { id, wie, ander: ander || null, dag: d, vanaf: d + uur / 24, tot: d + IN().zoektDagen, gemeld: false, aangesproken: false };
    V.geweest[id] = d;
    V.aantal++;
    return V.lopend;
  };

  // Wie een vervolg zegt en over wie het gaat: dezelfde mensen als de eerste keer, of wat het vervolg vraagt ('ander':
  // hij komt het nu zelf zeggen; een vraag: iemand anders). Geeft { wie, ander }, of null als dat niet meer kan.
  function mensenVanVervolg(D, w, dag) {
    const v = T.VOORVALLEN[w.id];
    const toen = { wie: w.wie, ander: w.ander };
    const wie = typeof v.wie === 'string' ? toen[v.wie] : v.wie ? kies(D, v.wie, dag, 31, kanKomen, w.ander) : w.wie;
    const ander = typeof v.ander === 'string' ? toen[v.ander] : w.ander;
    if (!wie || !kanKomen(D, wie) || (ander && !kanHetBetreffen(D, ander))) return null;
    return { wie, ander };
  }

  // Het dorp neemt je iets kwalijk, of is je dankbaar: dat komt bij de tevredenheid (T.voorvalStemming), en slijt weg.
  // Besliste de raadsman (js/raadsman.js), dan heet het naar hem.
  function stemming(D, procent, v, dag, door) {
    const waarde = procent / 100;
    const eigen = waarde > 0 ? v.woorden && v.woorden.blij : v.woorden && v.woorden.last;
    const woorden = eigen || (door ? `wat ${naam(door)} besliste over ${v.titel}` : `je antwoord op ${v.titel}`);
    D.voorvallen.stemming.push({ waarde, dag, woorden });
    T.tevredenheidOpnieuw(D);
  }

  // Wie je zocht, gaat weer zijns weegs: het dagritme neemt hem terug (T.dagAnker, js/dag.js).
  function laatLos(e) {
    if (!e || !e.zoektSchout) return;
    e.zoektSchout = false;
    e.pad = e.onderweg && e.pad.length ? [e.pad[0]] : [];
  }

  // Het voorval is om, zonder dat iets het afmaakt: wie het zei, is weg of dood, of de spelregel staat uit.
  function stop(D) {
    const L = D.voorvallen.lopend;
    if (L && L.wie) laatLos(L.wie.wezen);
    D.voorvallen.lopend = null;
  }

  // Hij vond je niet, of je sprak hem niet aan: dan beslist de raadsman (js/raadsman.js). Is er geen, dan gaat het
  // voorbij, en neemt het dorp het je kwalijk.
  // Zijn tijd is om, en je sprak hem niet. Ben je weg (een ander gebied), dan beslist je raadsman; ben je in het dorp,
  // dan gaat het voorbij, ook met een raadsman (werklijst vraag 68, Marcel: "Ja B inderdaad"), tenzij de spelregel
  // "Raadsman" hem ook dan laat beslissen (nietGesproken, js/raadsman.js). Had een raadsman hier beslist, en is er geen,
  // dan zegt de raad onder het doel het een tijd (js/raad.js): kies een raadsman.
  function voorbij(D, dag) {
    const weg = T.schoutIsWeg(D);
    const raadsmanMag = weg || T.RAADSMAN_INSTELLINGEN.nietGesproken;
    if (raadsmanMag && T.raadsmanBeslist(D)) return;
    const L = D.voorvallen.lopend;
    if (raadsmanMag) D.voorvallen.laatstVoorbij = Math.floor(dag);
    bericht(`${T.hoofdletter(naam(L.wie))} heeft je niet gesproken, en gaat weer aan het werk.`);
    stemming(D, IN().nietGevonden, { woorden: { last: weg ? 'een schout die er niet was' : 'een schout die geen tijd had' } }, dag);
    stop(D);
  }

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js): loopt er een voorval, dan komt wie het zei morgen terug, tot zijn
  // tijd om is; anders eerst een vervolg dat nu komt, en dan, als het de dag is, een nieuw voorval.
  T.tikVoorvallenDag = function (D, dag) {
    const V = D.voorvallen || (D.voorvallen = T.nieuweVoorvallen());
    V.stemming = V.stemming.filter((s) => dag - s.dag < IN().stemmingDagen);
    const L = V.lopend;
    if (!IN().aan || !D.bewoners) {
      if (L) stop(D);
      return;
    }
    if (L) {
      if (!kanKomen(D, L.wie) || (L.ander && !kanHetBetreffen(D, L.ander))) stop(D);
      else if (dag >= L.tot) voorbij(D, dag);
      else L.aangesproken = false;
      return;
    }
    const i = V.wacht.findIndex((w) => w.op <= dag);
    if (i >= 0) {
      const w = V.wacht.splice(i, 1)[0];
      const mensen = mensenVanVervolg(D, w, dag);
      if (mensen) {
        T.beginVoorval(D, w.id, mensen.wie, mensen.ander, dag);
        return;
      }
    }
    if (V.volgende == null) V.volgende = IN().eersteNa;
    if (dag < V.volgende) return;
    const k = T.kiesVoorval(D, dag);
    if (!k) {
      V.volgende = dag + 1;
      return;
    }
    T.beginVoorval(D, k.id, k.wie, k.ander, dag);
    V.volgende = dag + tussen(D, dag);
  };

  // ---------------------------------------------------------------------------------------------
  // Hij zoekt je: elk beeld
  // ---------------------------------------------------------------------------------------------

  // Het voorval waarvoor dit wezen je zoekt, of null. Voor de klik (js/verkennen.js) en het uitroepteken
  // (js/tekenen.js).
  T.voorvalVan = function (D, e) {
    const L = D.voorvallen && D.voorvallen.lopend;
    return L && e && e.zoektSchout && L.wie.wezen === e ? L : null;
  };

  // Elk beeld (js/main.js): overdag, vanaf zijn uur, zoekt hij de schout. Hij loopt naar hem toe (T.loopNaastDeSchout,
  // js/inner.js, zoals de inner), en staat hij naast een schout die stilstaat, dan spreekt hij hem aan. Daarna wacht
  // hij, tot je hem aanspreekt. 's Avonds, of als de schout in een ander gebied is, gaat hij zijns weegs.
  T.werkVoorvallenBij = function (S, D) {
    const L = D.voorvallen && D.voorvallen.lopend;
    if (!L || !D.kalender || !D.bewoners) return;
    if (!IN().aan || !kanKomen(D, L.wie)) {
      stop(D);
      return;
    }
    const e = L.wie.wezen;
    const w = D.bewoners.wereld;
    const nu = D.kalender.dag;
    const deel = T.dagdeelVan(nu);
    // Is de schout niet in het dorp als wie hem zoekt, gaat zoeken (T.schoutIsWeg, js/land.js: op reis, of in een
    // ander gebied), dan beslist de raadsman meteen.
    const weg = T.schoutIsWeg(D);
    if (nu >= L.vanaf && weg && T.raadsmanBeslist(D)) return;
    if (nu < L.vanaf || deel === 'avond' || deel === 'nacht' || weg) {
      laatLos(e);
      return;
    }
    if (!e.zoektSchout) {
      e.zoektSchout = true;
      e.pad = e.onderweg && e.pad.length ? [e.pad[0]] : [];
      if (!L.gemeld) {
        L.gemeld = true;
        const roep = T.VOORVALLEN[L.id].roep || '{wie} zoekt je.';
        bericht(T.hoofdletter(roep.replace('{wie}', naam(L.wie))), T.VOORVALLEN[L.id].soort === 'ramp' ? 'gevaar' : undefined);
      }
    }
    if (S.modus !== 'verkennen' || S.slaap) return;
    // Wie binnen was, komt naar buiten, zodra er niemand in zijn deur staat (zoals in T.laatDwalen).
    if (e.binnen) {
      if (T.wezenOp(w, e.tx, e.ty, e)) return;
      e.binnen = false;
      e.deurSinds = S.tijd;
    }
    if (L.aangesproken) return;
    const h = D.schout;
    if (T.afstand({ x: h.tx, y: h.ty }, { x: e.tx, y: e.ty }) <= 1 && !h.onderweg && !e.onderweg) {
      L.aangesproken = true;
      if (T.ui && T.ui.spreekAan) T.ui.spreekAan(S, e, L.id);
      return;
    }
    if (!e.onderweg) T.loopNaastDeSchout(D, e);
  };

  // Je koos een antwoord dat het gesprek sluit (js/dialoog.js), of de raadsman deed het (`door`, js/raadsman.js): het
  // voorval is af, en wie het zei, gaat zijns weegs.
  T.voorvalBeantwoord = function (D, id, door) {
    const V = D.voorvallen;
    if (!V || !V.lopend || V.lopend.id !== id) return;
    laatLos(V.lopend.wie.wezen);
    V.lopend = null;
    if (door) V.doorRaadsman = (V.doorRaadsman || 0) + 1;
    else V.beantwoord = (V.beantwoord || 0) + 1;
  };

  // ---------------------------------------------------------------------------------------------
  // Wat een antwoord doet, en wat het kost
  // ---------------------------------------------------------------------------------------------

  // Een gevolg (doe) van een antwoord, naast wat elk gesprek doet (T.doeGevolg, js/gesprek.js). Wie en ander zijn die
  // van het voorval van nu.
  T.voorvalGevolg = function (D, doe) {
    const V = D.voorvallen || (D.voorvallen = T.nieuweVoorvallen());
    const L = V.lopend || {};
    const v = T.VOORVALLEN[L.id] || { titel: 'wat er gebeurde' };
    const dag = dagNu(D);
    for (const wat of WAREN) if (doe[wat]) T.wijzigVoorraad(D, wat, doe[wat]);
    for (const soort of Object.keys(T.VEE)) if (doe[soort] < 0) T.verliesVee(D, soort, -doe[soort]);
    if (doe.tevreden) stemming(D, doe.tevreden, v, dag, L.door);
    if (doe.argwaan) T.zetArgwaan(D, doe.argwaan / 100, v.titel);
    for (let i = 0; i < (doe.gezin || 0); i++) T.gezinKomt(D);
    const verbannen = doe.verban && L[doe.verban];
    if (verbannen && kanHetBetreffen(D, verbannen)) T.wijzigBevolking(D, -1, 'vertrek', 'verbannen door de schout', [verbannen]);
    if (doe.sterfkans && lot(D, dag, 37 + V.aantal) < doe.sterfkans / 100) {
      const wie = L.ander && kanHetBetreffen(D, L.ander) ? [L.ander] : undefined;
      T.wijzigBevolking(D, -1, 'ziekte', v.sterft || T.hoofdletter(v.titel), wie);
    }
    if (doe.voorval && L.wie) {
      const lijst = elk(doe.voorval);
      const id = lijst[Math.floor(lot(D, dag, 41 + V.aantal) * lijst.length)];
      const na = (T.VOORVALLEN[id] && T.VOORVALLEN[id].na) || [IN().vervolgVan, IN().vervolgTot];
      if (T.VOORVALLEN[id]) V.wacht.push({ id, op: dag + na[0] + Math.floor(lot(D, dag, 43) * (na[1] - na[0] + 1)), wie: L.wie, ander: L.ander });
    }
  };

  // Wat een antwoord kost of oplevert, voor het venster: { tekst, kan, waarom }. Wat eraf gaat, moet er zijn; wat
  // erbij komt, is er altijd. Een vervolg zegt het niet: dat is de verrassing.
  T.prijsVanKeuze = function (D, doe) {
    const uit = { tekst: '', kan: true, waarom: '' };
    if (!doe) return uit;
    const L = (D.voorvallen && D.voorvallen.lopend) || {};
    const delen = [];
    const teken = (n) => (n > 0 ? '+' : '−');
    for (const wat of ['goud', ...WAREN]) {
      const n = doe[wat] || 0;
      if (!n) continue;
      delen.push(`${teken(n)}${Math.abs(n)} ${wat}`);
      const heeft = Math.floor((D.voorraad ? D.voorraad[wat] : wat === 'goud' ? D.goud : 0) || 0);
      if (n < 0 && heeft < -n && uit.kan) Object.assign(uit, { kan: false, waarom: `je hebt ${heeft} ${wat}` });
    }
    for (const soort of Object.keys(T.VEE)) {
      const n = doe[soort] || 0;
      if (n < 0) delen.push(`−${-n} ${-n === 1 ? T.VEE[soort].naam : T.VEE[soort].meervoud}`);
    }
    if (doe.tevreden) delen.push(`tevredenheid ${teken(doe.tevreden)}${Math.abs(doe.tevreden)}%`);
    if (doe.argwaan) delen.push(`argwaan ${teken(doe.argwaan)}${Math.abs(doe.argwaan)}%`);
    // Wie verbannen wordt, gaat het bos in, en wie het bos in gaat, kan als rover terugkomen (js/rovers.js).
    if (doe.verban && L[doe.verban]) delen.push(`${naam(L[doe.verban])} moet het bos in`);
    if (doe.gezin) {
      delen.push(doe.gezin === 1 ? 'een gezin erbij' : `${doe.gezin} gezinnen erbij`);
      if (!T.plaatsVoorEenGezin(D) && uit.kan) Object.assign(uit, { kan: false, waarom: 'er is geen plaats: wijs een erf aan (B)' });
    }
    if (doe.sterfkans) delen.push(`${doe.sterfkans}% kans op een dode`);
    uit.tekst = delen.join(', ');
    return uit;
  };

  // Wat de voorvallen aan de tevredenheid doen (T.berekenTevredenheid, js/behoeften.js): { erbij, last, blij }, zoals de
  // wetten (js/wetten.js). Een stemming slijt in stemmingDagen weg, zoals de wrok van de schandpaal (js/heer.js).
  T.voorvalStemming = function (D, dag) {
    const r = { erbij: 0, last: [], blij: [] };
    for (const s of (D.voorvallen && D.voorvallen.stemming) || []) {
      const w = s.waarde * Math.max(0, 1 - (dag - s.dag) / IN().stemmingDagen);
      if (!w) continue;
      r.erbij += w;
      const lijst = w < 0 ? r.last : r.blij;
      if (!lijst.includes(s.woorden)) lijst.push(s.woorden);
    }
    return r;
  };

  // Wat het spel in een zin invult (js/gesprek.js, T.vulWoordenIn): wie het je komt zeggen, en over wie het gaat.
  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  T.GESPREK_WOORDEN.wie = (D) => {
    const L = D.voorvallen && D.voorvallen.lopend;
    return L ? naam(L.wie) : 'iemand';
  };
  T.GESPREK_WOORDEN.ander = (D) => {
    const L = D.voorvallen && D.voorvallen.lopend;
    return L && L.ander ? naam(L.ander) : 'iemand';
  };
})(globalThis.Spel = globalThis.Spel || {});
