// De voorvallen: het dorp spreekt je aan (werklijst vraag 65, A; Marcel, 29 sep: "A ja"). Om de paar dagen gebeurt
// er iets: iemand met een naam komt naar de schout met een vraag, een ruzie of een ramp, en jij kiest uit twee of
// drie antwoorden, elk met een prijs die je vooraf ziet. In de winter vaker, zodat ook die tijd iets vraagt, en
// sommige komen terug. Sinds 30 sep (vraag 74, B) komt een probleem uit iets wat je had kunnen zien: diefstal van
// honger, de koorts van kou en een vol dorp (T.OORZAKEN), en het bericht zegt waarom. Regels zonder scherm; toetsen in
// test/voorvallen.test.cjs.
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
//   feest: 'dag'      het dorp viert dit voorval op het plein (js/feesten.js): 'dag' is morgen de hele dag, en niemand
//                     werkt; 'avond' is 's avonds, vanavond nog als het kan
// Een voorval komt geloot, of op een vaste dag (op: { maand, dag }, de meiboom).
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
    // Een voorval met een vaste dag (op, de meiboom) dat dan niet kan beginnen omdat er een ander loopt, komt nog tot
    // zoveel dagen later.
    vastMarge: 3,
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
    // Voorvallen met een oorzaak (werklijst vraag 74, B; Marcel, 30 sep: "a ja"): een probleem met een oorzaak
    // (diefstal, de koorts, de brand, ...; T.OORZAKEN hieronder) komt zoveel keer zo vaak als die oorzaak speelt, en
    // zoveel keer zo vaak als hij niet speelt. Allebei 1: zoals vóór 30 sep, uit de lucht.
    metOorzaak: 3,
    zonderOorzaak: 0.25,
    // Onder deze tevredenheid is het dorp ontevreden (de oorzaak onvrede).
    onvrede: 0.5,
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
  //   oorzaak  waar het van komt (T.OORZAKEN hieronder): speelt er een, dan komt het vaker, anders zelden
  //            (metOorzaak, zonderOorzaak), en het bericht zegt waarom
  //   pauze    niet binnen zoveel dagen terug (zonder: de pauze uit het blok hierboven)
  //   vervolg  true: komt alleen als vervolg op een ander voorval; na: [van, tot], na zoveel dagen
  //   zelf     true: wordt niet geloot; een ander deel van het spel begint het (het bouwverzoek, js/verzoeken.js).
  //            'beesten': zo zolang er beesten in het bos leven (de spelregel "Beesten"): de wolven namen dan echt een
  //            schaap (js/beesten.js); zonder beesten wordt het geloot, zoals voor 7 okt
  //   roep     het bericht als hij je gaat zoeken (zonder: "{wie} zoekt je."), met de woorden van een gesprek (js/gesprek.js)
  //   sterft   wie er sterft, zegt het bericht zo: "De koorts: ..." (zonder: de titel)
  const MAN = { geslacht: 'man', leeftijd: ['jong', 'volwassen'] };
  T.VOORVALLEN = {
    // Rechtspraak (de vierde van 23 sep, spel.md): streng houdt de orde, mild houdt vrienden, en wie je
    // veroordeelde, vergeet het niet.
    diefstal: {
      soort: 'recht', titel: 'de diefstal', oorzaak: 'honger',
      wie: { geslacht: 'vrouw', leeftijd: ['volwassen', 'oud'] }, ander: { ...MAN, boer: false },
    },
    diefstalWeer: { soort: 'recht', titel: 'de dief', vervolg: true, wie: { leeftijd: ['volwassen', 'oud'] } },
    diefstalWrok: { soort: 'recht', titel: 'de dief', vervolg: true, wie: { leeftijd: ['volwassen', 'oud'] } },
    diefDank: { soort: 'kans', titel: 'de dief', vervolg: true, wie: 'ander', ander: 'wie' },
    // De verdwenen graanzak (js/zaak.js; werklijst vraag 128): de boer komt je zeggen wie hij verdenkt, en later is de
    // zitting op het plein (L.plein: wie erbij hoort, staat daar, en komt de schout erbij, dan begint ze). Wie het
    // vervolg zegt en over wie het gaat, zet js/zaak.js.
    graanzak: { soort: 'recht', titel: 'de graanzak', zelf: true, wie: { boer: true }, ander: { ...MAN, boer: false }, roep: '{wie} zoekt je: er is een zak graan uit de schuur verdwenen.' },
    zitting: { soort: 'recht', titel: 'de zitting over de graanzak', zelf: true, wie: { boer: true }, ander: { ...MAN, boer: false }, roep: 'De zitting over de graanzak begint: {wie} en {ander} staan op het plein.' },
    zaakWrok: { soort: 'recht', titel: 'de graanzak', vervolg: true },
    zaakWeer: { soort: 'recht', titel: 'de graanzak', vervolg: true },
    zaakKind: { soort: 'recht', titel: 'de graanzak', vervolg: true },
    zaakDank: { soort: 'kans', titel: 'de graanzak', vervolg: true },
    vechtpartij: {
      soort: 'recht', titel: 'de vechtpartij', als: { gebouw: 'herberg' }, oorzaak: 'onvrede',
      wie: MAN, ander: [{ karakter: 'heethoofd', geslacht: 'man' }, { karakter: 'drinker', geslacht: 'man' }, MAN],
    },
    akkergrens: { soort: 'recht', titel: 'de akkergrens', wie: { boer: true }, ander: { boer: true } },
    akkergrensWraak: { soort: 'recht', titel: 'de akkergrens', vervolg: true },
    stroper: {
      soort: 'recht', titel: 'de stroper', oorzaak: 'honger',
      wie: { geslacht: 'man', leeftijd: ['volwassen', 'oud'] }, ander: { ...MAN, boer: false },
    },
    heks: {
      soort: 'recht', titel: 'de heks', woorden: { blij: 'je vonnis over de heks', last: 'je vonnis over de heks' }, pauze: 180,
      wie: {}, ander: { geslacht: 'vrouw', leeftijd: 'oud', boer: false },
    },
    woeker: { soort: 'recht', titel: 'de schuld bij de woekeraar', oorzaak: 'honger', wie: { boer: false }, ander: { karakter: 'woekeraar' } },
    woekerWraak: { soort: 'recht', titel: 'de woekeraar', vervolg: true, wie: 'ander', ander: 'wie' },
    // Verzoeken
    lening: { soort: 'verzoek', titel: 'de lening', oorzaak: 'honger', wie: { boer: false } },
    leningTerug: { soort: 'verzoek', titel: 'de lening', vervolg: true },
    leningUitstel: { soort: 'verzoek', titel: 'de lening', vervolg: true },
    vreemdeling: { soort: 'verzoek', titel: 'de vreemdelingen', wie: { leeftijd: ['volwassen', 'oud'] } },
    smid: { soort: 'kans', titel: 'de smid uit de stad', pauze: 360, wie: { leeftijd: ['volwassen', 'oud'] } },
    zaaigraan: { soort: 'verzoek', titel: 'het zaaigraan', als: { maanden: ['lentemaand', 'grasmaand'] }, wie: { boer: true } },
    zaaigraanTerug: { soort: 'verzoek', titel: 'het zaaigraan', vervolg: true, na: [120, 150] },
    weduweDak: { soort: 'verzoek', titel: 'het dak van de weduwe', als: { seizoen: ['herfst', 'winter'] }, wie: { karakter: 'weduwe' } },
    // Rampen: iets doen kost iets, niets doen ook.
    brand: {
      soort: 'ramp', titel: 'de brand', winter: 3, oorzaak: 'vol', roep: 'Brand! {wie} komt je halen.',
      wie: { leeftijd: ['jong', 'volwassen'] }, ander: { boer: false },
    },
    ziekte: { soort: 'ramp', titel: 'de koorts', winter: 2, oorzaak: ['kou', 'vol'], sterft: 'De koorts', wie: { geslacht: 'vrouw' } },
    wolven: {
      soort: 'ramp', titel: 'de wolven', als: { seizoen: 'winter', vee: { schaap: 3 } }, winter: 3, sterft: 'De jacht op de wolven', zelf: 'beesten', oorzaak: 'wolven',
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
    // Een inwoner wil iets bouwen wat het dorp mist (js/verzoeken.js; werklijst vraag 103): wie, wat en waar zet dat
    // bestand op het voorval (L.bouw), en de woorden ervan ook.
    bouwverzoek: { soort: 'verzoek', titel: 'een verzoek om te bouwen', zelf: true, roep: '{wie} wil {gebouw} bouwen, en zoekt je.' },
    // Een ondernemer wil wapens maken, uit zichzelf (js/ondernemers.js; werklijst vraag 104). Zoals het bouwverzoek, met
    // zijn eigen woorden.
    wapenverzoek: { soort: 'verzoek', titel: 'de wapens', zelf: true, roep: '{wie} wil je onder vier ogen spreken.' },
    // En een ondernemer die een tweede herberg wil beginnen; de herbergierster heeft daar een mening over.
    herbergverzoek: { soort: 'verzoek', titel: 'de tweede herberg', zelf: true, roep: '{wie} wil een herberg beginnen, en zoekt je.' },
    // Een boer wil land ontginnen, als het dorp graan tekortkomt: een stuk heide, een stuk bos, of allebei om uit te kiezen
    // (js/ontginnen.js; werklijst vraag 107).
    ontginverzoek: { soort: 'verzoek', titel: 'het ontginnen', zelf: true, roep: '{wie} wil land ontginnen, en zoekt je.' },
    lied: { soort: 'feest', titel: 'het lied over de heer', als: { gebouw: 'herberg' }, wie: { karakter: 'zanger' } },
    // De meiboom (werklijst vraag 97; Marcel, 3 okt: "De meiboom"): niet geloot, maar elk jaar op 30 grasmaand, zodat hij
    // op 1 bloeimaand op het plein staat (js/feesten.js). De jongeren komen het vragen.
    meiboom: {
      soort: 'feest', titel: 'de meiboom', woorden: { blij: 'de meiboom', last: 'de meiboom die er niet kwam' },
      op: { maand: 'grasmaand', dag: 30 }, pauze: 300, wie: [{ leeftijd: 'jong' }, {}],
    },
    // De grillen van de heer (een idee van 23 sep): wat zijn bode kwam zeggen.
    standbeeld: { soort: 'heer', titel: 'het standbeeld', pauze: 360, wie: [{ werk: 'herberg' }, {}] },
    jacht: { soort: 'heer', titel: 'de jacht van de heer', als: { maanden: ['herfstmaand', 'wijnmaand'] }, pauze: 360 },
    ramen: { soort: 'heer', titel: 'de belasting op ramen', pauze: 360 },
  };

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  // Een getal 0..1, vast per spel, per dag en per vraag `n` (zoals in js/rovers.js), zodat een speeltest met hetzelfde
  // zaad hetzelfde jaar speelt.
  const lot = (D, dag, n) => T.dobbelsteen(((D.lot && D.lot.zaad) || 1) * 43 + Math.floor(dag) * 7919 + n)();
  T.lotVanDeDag = lot; // ook voor de verzoeken (js/verzoeken.js)
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
  T.kanJeKomenZoeken = kanKomen; // ook voor wie een verzoek doet (js/verzoeken.js)
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
  // Waar het van komt (werklijst vraag 74, B)
  // ---------------------------------------------------------------------------------------------

  const mist = (D, wat) => !!(D.behoeften && D.behoeften.mist && D.behoeften.mist.includes(wat));
  const brandhout = (D) => ((D.voorraad && D.voorraad.hout) || 0) + ((D.voorraad && D.voorraad.turf) || 0);

  // Wat in het dorp speelt en een probleem uitlokt: iets wat je kunt zien (de balk zegt het, of de raad) en zelf kunt
  // veranderen. Zo komt een ramp niet uit de lucht, maar uit iets wat je had kunnen zien (het concept,
  // ontwerp/concept.md: "problemen hebben oorzaken"). Per oorzaak: wat er dan is (kop), en of hij nu speelt (speelt:
  // geeft waarom, het stuk zin na "want", of '' als er niets bij hoeft; null als hij niet speelt). Voor het rapport van
  // de raadsman (js/ochtendrapport.js; werklijst vraag 76) ook hoe je zegt dat hij blijft (nog) en dat hij over is
  // (voorbij).
  T.OORZAKEN = {
    honger: {
      kop: 'Er is honger',
      nog: 'Er is nog steeds honger',
      voorbij: 'De honger is voorbij',
      speelt: (D) => (T.standVanWet(D, 'rantsoen') === 'krap' ? 'het rantsoen is krap' : mist(D, 'eten') ? 'er is niet genoeg eten' : null),
    },
    kou: {
      kop: 'Het is koud in de huizen',
      nog: 'Het is nog steeds koud in de huizen',
      voorbij: 'Het is niet koud meer in de huizen',
      speelt: (D, dag) => (!inWinter(dag) || !mist(D, 'brandhout voor de winter') ? null : brandhout(D) < 1 ? 'het brandhout is op' : 'het hout haalt de winter niet'),
    },
    vol: {
      kop: 'De huizen zitten vol',
      nog: 'De huizen zitten nog steeds vol',
      voorbij: 'Er is weer plaats in de huizen',
      speelt: (D) => ((D.bevolking || 0) > 0 && D.bevolking >= T.telWoonruimte(D) ? '' : null),
    },
    // De wolven (js/beesten.js; werklijst vraag 116, stap 2b): de laatste dagen kwamen ze bij het dorp (wie werkte, zag
    // ze; ze namen een schaap; ze vielen iemand aan).
    wolven: {
      kop: 'Er zijn wolven bij het dorp',
      nog: 'Er zijn nog steeds wolven bij het dorp',
      voorbij: 'De wolven blijven weer in het bos',
      speelt: (D, dag) => (T.wolvenBijHetDorp ? T.wolvenBijHetDorp(D, dag) : null), // wereld.html laadt de beesten niet
    },
    onvrede: {
      kop: 'Het dorp is ontevreden',
      nog: 'Het dorp is nog steeds ontevreden',
      voorbij: 'Het dorp is niet ontevreden meer',
      speelt: (D) => {
        const b = D.behoeften;
        if (!b || b.tevredenheid >= IN().onvrede) return null;
        if (b.last && b.last.length) return `het heeft last van ${b.last.join(' en ')}`;
        return b.mist && b.mist.length ? `het mist ${b.mist.join(' en ')}` : '';
      },
    },
  };

  // Speelt oorzaak `o` nu? Dan { id, zin, waarom }, met de zin die het bericht erbij zegt: "Er is honger, want het
  // rantsoen is krap." Anders null.
  function oorzaakNu(D, o, dag) {
    const O = T.OORZAKEN[o];
    const waarom = O.speelt(D, dag);
    return waarom == null ? null : { id: o, zin: `${O.kop}${waarom ? `, want ${waarom}` : ''}.`, waarom };
  }

  // Welke oorzaak van dit voorval nu speelt: de eerste die speelt, in de volgorde van het voorval, als { id, zin }, of
  // null.
  T.oorzaakVan = function (D, id, dag) {
    const v = T.VOORVALLEN[id];
    for (const o of elk(v && v.oorzaak)) {
      const nu = oorzaakNu(D, o, dag);
      if (nu) return nu;
    }
    return null;
  };

  // Welke oorzaken er nu spelen, in de volgorde van T.OORZAKEN, als [{ id, zin }]: voor het rapport van de raadsman
  // (js/ochtendrapport.js) en Spel.debug.voorval().
  T.oorzakenNu = (D, dag) => Object.keys(T.OORZAKEN).map((o) => oorzaakNu(D, o, dag)).filter(Boolean);

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
    if (!v || v.vervolg || zelfBegonnen(v) || !T.GESPREKKEN[id] || !D.bewoners) return null;
    const V = D.voorvallen || T.nieuweVoorvallen();
    const vorige = V.geweest[id];
    if (vorige != null && dag - vorige < (v.pauze != null ? v.pauze : IN().pauze)) return null;
    if (!tijdVoor(D, v.als || {}, dag)) return null;
    return T.wieZegtHet(D, id, dag);
  };

  // Of een ander deel van het spel dit voorval begint (zelf): dan wordt het niet geloot. gereedschap/wereld.html laadt de
  // beesten niet.
  const zelfBegonnen = (v) => v.zelf === true || (v.zelf === 'beesten' && !!T.BEESTEN_INSTELLINGEN && T.BEESTEN_INSTELLINGEN.aan);

  // Wie een voorval komt zeggen en over wie het gaat (zijn wie en ander), zonder te vragen of het nu kan: ook voor een
  // deel van het spel dat het zelf begint (js/beesten.js). Geeft { wie, ander } of null.
  T.wieZegtHet = function (D, id, dag) {
    const v = T.VOORVALLEN[id];
    if (!v || !D.bewoners) return null;
    const wie = kies(D, v.wie || {}, dag, 11, kanKomen, null);
    const ander = wie && v.ander ? kies(D, v.ander, dag, 13, kanHetBetreffen, wie) : null;
    if (!wie || (v.ander && !ander)) return null;
    return { wie, ander };
  };

  // Hoe vaak het komt, naast de andere die kunnen: zijn gewicht (in de winter zijn wintergewicht), en heeft het een
  // oorzaak, dan vaker als die speelt en zelden als hij niet speelt (metOorzaak en zonderOorzaak).
  T.gewichtVanVoorval = function (D, id, dag) {
    const v = T.VOORVALLEN[id];
    if (v.op) return 0; // een vaste dag wordt niet geloot (vastVoorval hieronder)
    const gewicht = inWinter(dag) && v.winter != null ? v.winter : v.gewicht != null ? v.gewicht : 1;
    if (!v.oorzaak) return gewicht;
    return gewicht * (T.oorzaakVan(D, id, dag) ? IN().metOorzaak : IN().zonderOorzaak);
  };

  // Welk voorval er vandaag komt: geloot naar gewicht, uit wat er nu kan. Geeft { id, wie, ander } of null.
  T.kiesVoorval = function (D, dag) {
    const kan = [];
    let som = 0;
    for (const id of Object.keys(T.VOORVALLEN)) {
      const gewicht = T.gewichtVanVoorval(D, id, dag);
      const mensen = gewicht > 0 && T.voorvalKan(D, id, dag);
      if (!mensen) continue;
      kan.push({ id, gewicht, wie: mensen.wie, ander: mensen.ander });
      som += gewicht;
    }
    let r = lot(D, dag, 7) * som;
    for (const k of kan) if ((r -= k.gewicht) < 0) return k;
    return null;
  };

  // Een voorval met een vaste dag (op, in T.VOORVALLEN: de meiboom) dat vandaag kan: op die dag, of als er toen een ander
  // liep, tot vastMarge dagen later. Geeft { id, wie, ander } of null.
  function vastVoorval(D, dag) {
    const jaarDag = T.dagVanJaar(dag);
    for (const id of Object.keys(T.VOORVALLEN)) {
      const op = T.VOORVALLEN[id].op;
      if (!op) continue;
      const opDag = T.MAANDEN.findIndex((m) => m.naam === op.maand) * T.DAGEN_PER_MAAND + op.dag - 1;
      if ((jaarDag - opDag + T.DAGEN_PER_JAAR) % T.DAGEN_PER_JAAR > IN().vastMarge) continue;
      const mensen = T.voorvalKan(D, id, dag);
      if (mensen) return { id, ...mensen };
    }
    return null;
  }

  // Om de hoeveel dagen het volgende komt: in de winter vaker, en nooit precies even vaak.
  function tussen(D, dag) {
    const basis = inWinter(dag) ? IN().dagenTussenWinter : IN().dagenTussen;
    const s = IN().spreiding;
    return Math.max(1, Math.round(basis * (1 - s + 2 * s * lot(D, dag, 19))));
  }

  // Een voorval begint: wie het zegt, gaat je vandaag zoeken, vanaf een uur tussen zoektVanaf en zoektTot. Speelt er
  // een oorzaak (T.oorzaakVan), dan onthoudt het die, zodat het bericht zegt waarom.
  T.beginVoorval = function (D, id, wie, ander, dag) {
    const V = D.voorvallen || (D.voorvallen = T.nieuweVoorvallen());
    const d = Math.floor(dag);
    const uur = IN().zoektVanaf + lot(D, d, 17) * (IN().zoektTot - IN().zoektVanaf);
    V.lopend = {
      id, wie, ander: ander || null, dag: d, vanaf: d + uur / 24, tot: d + IN().zoektDagen, gemeld: false, aangesproken: false,
      oorzaak: T.oorzaakVan(D, id, d),
    };
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

  // Een voorval kan vlaggen zetten zolang het loopt (L.vlaggen; js/gesprek.js): welke antwoorden er kunnen, zoals bij het
  // ontginnen (js/ontginnen.js). Als het om is, gaan ze weg.
  function wisVlaggen(D, L) {
    for (const v of (L && L.vlaggen) || []) T.wisVlag(D, v);
  }

  // Het voorval is om, zonder dat iets het afmaakt: wie het zei, is weg of dood, of de spelregel staat uit.
  function stop(D) {
    const L = D.voorvallen.lopend;
    if (L && L.wie) laatLos(L.wie.wezen);
    wisVlaggen(D, L);
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
    T.zeg(D, `${T.hoofdletter(naam(L.wie))} heeft je niet gesproken, en gaat weer aan het werk.`);
    T.schrijfOp(D, 'voorbij', { wie: naam(L.wie), titel: T.VOORVALLEN[L.id].titel }); // voor het rapport (js/ochtendrapport.js)
    stemming(D, IN().nietGevonden, { woorden: { last: weg ? 'een schout die er niet was' : 'een schout die geen tijd had' } }, dag);
    T.wijzigVertrouwen(D, T.BAZEN_INSTELLINGEN.nietGevonden, weg ? 'je was er niet' : 'je had geen tijd');
    stop(D);
  }

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js): loopt er een voorval, dan komt wie het zei morgen terug, tot zijn
  // tijd om is; anders eerst een voorval met een vaste dag, dan een vervolg dat nu komt, en dan, als het de dag is, een
  // nieuw voorval.
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
    const vast = vastVoorval(D, dag);
    if (vast) {
      T.beginVoorval(D, vast.id, vast.wie, vast.ander, dag);
      return;
    }
    const i = V.wacht.findIndex((w) => w.op <= dag);
    if (i >= 0) {
      const w = V.wacht.splice(i, 1)[0];
      const mensen = mensenVanVervolg(D, w, dag);
      if (mensen) {
        const L = T.beginVoorval(D, w.id, mensen.wie, mensen.ander, dag);
        // Wat wachtte, kan vlaggen meebrengen, zoals een voorval dat nu begint (L.vlaggen; js/beesten.js).
        if (w.vlaggen) {
          L.vlaggen = w.vlaggen;
          for (const vlag of w.vlaggen) T.zetVlag(D, vlag);
        }
        return;
      }
    }
    // Wil een boer heide ontginnen omdat het graan tekortkomt (js/ontginnen.js; vraag 107), of iemand iets bouwen wat het
    // dorp mist (js/verzoeken.js; werklijst vraag 103), dan gaat dat voor.
    if (T.beginOntginverzoek(D, dag)) return;
    if (T.beginBouwverzoek(D, dag)) return;
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
    if (!L || !e || L.wie.wezen !== e) return null;
    // Een zitting op het plein (js/zaak.js): wie aanklaagt, zoekt je niet, maar staat er vanaf zijn uur.
    if (L.plein) return D.kalender && D.kalender.dag >= L.vanaf ? L : null;
    return e.zoektSchout ? L : null;
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
    // Is de schout niet in het dorp als wie hem zoekt, gaat zoeken (T.schoutIsWeg, js/dorp.js: op reis, of in een
    // ander gebied), dan beslist de raadsman meteen. In een ander dorp dan het jouwe ook: daar zoekt niemand jou, en
    // beslist zijn raadsman als het er een heeft, tot zijn schout in code kiest (werklijst, vraag 72 en stap 1b).
    const weg = T.schoutIsWeg(D) || !!D.ander;
    if (nu >= L.vanaf && weg && T.raadsmanBeslist(D)) return;
    if (L.plein) {
      zittingBij(S, D, L, nu);
      return;
    }
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
        const waarom = L.oorzaak ? ` ${L.oorzaak.zin}` : '';
        T.zeg(D, T.hoofdletter(T.vulWoordenIn(D, roep)) + waarom, T.VOORVALLEN[L.id].soort === 'ramp' ? 'gevaar' : undefined);
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

  // Een zitting op het plein (js/zaak.js): wie erbij hoort, staat er van zichzelf (T.zaakAnker); vanaf zijn uur zegt
  // het bericht het één keer, en komt de schout bij het midden van het plein, dan begint ze.
  function zittingBij(S, D, L, nu) {
    if (nu < L.vanaf || T.schoutIsWeg(D)) return;
    if (!L.gemeld) {
      L.gemeld = true;
      T.zeg(D, T.hoofdletter(T.vulWoordenIn(D, T.VOORVALLEN[L.id].roep)));
    }
    if (L.aangesproken || S.modus !== 'verkennen' || S.slaap || !T.schoutBijDeZitting(D) || D.schout.onderweg) return;
    L.aangesproken = true;
    if (T.ui && T.ui.spreekAan) T.ui.spreekAan(S, L.wie.wezen, L.id);
  }

  // Je koos een antwoord dat het gesprek sluit (js/dialoog.js), of de raadsman deed het (`door`, js/raadsman.js): het
  // voorval is af, en wie het zei, gaat zijns weegs.
  T.voorvalBeantwoord = function (D, id, door) {
    const V = D.voorvallen;
    if (!V || !V.lopend || V.lopend.id !== id) return;
    laatLos(V.lopend.wie.wezen);
    wisVlaggen(D, V.lopend);
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
    // Twee bazen (js/bazen.js): wat het dorp van jóú vindt, naar hoe tevreden het het dorp maakt (een verzoek om te bouwen
    // niet: dat is je werk); en een antwoord kan de heer of het dorp ook rechtstreeks raken (doe.gunst, doe.vertrouwen).
    if (doe.tevreden && !L.bouw) T.vertrouwenNaVoorval(D, doe.tevreden, v.titel, !!L.door);
    if (doe.gunst) T.wijzigGunst(D, doe.gunst, v.titel);
    if (doe.vertrouwen) T.wijzigVertrouwen(D, doe.vertrouwen, v.titel);
    if (doe.argwaan) T.zetArgwaan(D, doe.argwaan / 100, v.titel);
    for (let i = 0; i < (doe.gezin || 0); i++) T.gezinKomt(D);
    const verbannen = doe.verban && L[doe.verban];
    if (verbannen && kanHetBetreffen(D, verbannen)) T.wijzigBevolking(D, -1, 'vertrek', 'verbannen door de schout', [verbannen]);
    if (doe.sterfkans && lot(D, dag, 37 + V.aantal) < doe.sterfkans / 100) {
      const wie = L.ander && kanHetBetreffen(D, L.ander) ? [L.ander] : undefined;
      T.wijzigBevolking(D, -1, 'ziekte', v.sterft || T.hoofdletter(v.titel), wie);
    }
    // Een feest (js/feesten.js): het dorp viert dit voorval op het plein, morgen de hele dag of 's avonds.
    if (doe.feest && L.id) T.zetFeest(D, L.id, doe.feest, D.kalender ? D.kalender.dag : dag);
    // Een bouwverzoek (js/verzoeken.js): ja, en het gebouw komt er; nee, en hij onthoudt het.
    if (doe.bouw && L.bouw) T.verzoekToegestaan(D, L);
    if (doe.weiger && L.bouw) T.verzoekGeweigerd(D, L);
    // Ontginnen (js/ontginnen.js): ja, de heide of het bos (gemeld of stiekem), en het wordt een veld van zijn boerderij.
    if (doe.ontgin && L.ontgin) T.ontginToegestaan(D, L, doe.ontgin === true ? 'heide' : doe.ontgin);
    // De wolven (js/beesten.js): een jacht neemt de roedel die het schaap nam wolven af, en een hek houdt ze bij de
    // schapen weg. gereedschap/wereld.html laadt de beesten niet.
    if (doe.wolven < 0 && T.jaagOpDeWolven) T.jaagOpDeWolven(D, -doe.wolven);
    if (doe.hek && T.hekOmDeSchapen) T.hekOmDeSchapen(D);
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
    // Wat een bouwverzoek het dorp kost (js/verzoeken.js): de kosten van het gebouw, zoals T.plaatsGebouw ze betaalt.
    const kosten = doe.bouw && L.bouw ? T.kostenVanVerzoek(L.bouw) : {};
    for (const [wat, n] of Object.entries(kosten)) {
      delen.push(`−${n} ${wat}`);
      const heeft = Math.floor((D.voorraad && D.voorraad[wat]) || 0);
      if (heeft < n && uit.kan) Object.assign(uit, { kan: false, waarom: `je hebt ${heeft} ${wat}` });
    }
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
    // Twee bazen (js/bazen.js): wat de heer en het dorp van je vinden, als de spelregel aan staat.
    if (doe.gunst && T.BAZEN_INSTELLINGEN.aan) delen.push(`gunst van de heer ${teken(doe.gunst)}${Math.abs(doe.gunst)}`);
    // Een werkplaats in het bos van de heer (js/verzoeken.js, js/bos.js; werklijst vraag 110, e): dat kost zijn gunst.
    if (doe.bouw && L.bouw && L.bouw.bos && T.BAZEN_INSTELLINGEN.aan) delen.push(`gunst van de heer −${T.ONTGINNEN_INSTELLINGEN.gunst}`);
    if (doe.vertrouwen && T.BAZEN_INSTELLINGEN.aan) delen.push(`vertrouwen van het dorp ${teken(doe.vertrouwen)}${Math.abs(doe.vertrouwen)}`);
    // Ontginnen (js/ontginnen.js): de heide kost vertrouwen, meer naarmate de meent kleiner wordt; het bos de gunst van de
    // heer, of stiekem het risico; en wat er niet meer is, kan niet.
    if (doe.ontgin && L.ontgin) {
      const p = T.ontginPrijs(D, L, doe.ontgin === true ? 'heide' : doe.ontgin);
      delen.push(...p.delen);
      if (!p.kan && uit.kan) Object.assign(uit, { kan: false, waarom: p.waarom });
    }
    // Wie verbannen wordt, gaat het bos in, en wie het bos in gaat, kan als rover terugkomen (js/rovers.js).
    if (doe.verban && L[doe.verban]) delen.push(`${naam(L[doe.verban])} moet het bos in`);
    if (doe.gezin) {
      delen.push(doe.gezin === 1 ? 'een gezin erbij' : `${doe.gezin} gezinnen erbij`);
      if (!T.plaatsVoorEenGezin(D) && uit.kan) Object.assign(uit, { kan: false, waarom: 'er is geen plaats: wijs een erf aan (B)' });
    }
    if (doe.sterfkans) delen.push(`${doe.sterfkans}% kans op een dode`);
    if (doe.wolven < 0) delen.push(`${T.telwoord(-doe.wolven)} wolven minder`);
    if (doe.hek) delen.push('een hek om de schapen');
    // De graanzak (js/zaak.js): wat een vonnis verder doet.
    if (doe.zaak && T.zaakPrijs) delen.push(...T.zaakPrijs(D, doe.zaak));
    if (doe.feest && T.feestPrijs(doe.feest)) delen.push(T.feestPrijs(doe.feest));
    // Een ondernemer (js/ondernemers.js): nee, en hij neemt het je kwalijk of trekt weg; en wat de herbergierster ervan
    // vindt.
    if (L.bouw && L.bouw.eigen) delen.push(...T.eigenPrijs(D, L, doe));
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

  // Wat het spel in een zin invult (js/gesprek.js, T.vulWoordenIn): wie het je komt zeggen, over wie het gaat, en
  // waar het van komt (een hele zin, "Er is honger, want het rantsoen is krap.", of niets als het uit de lucht kwam;
  // zet hem dus aan het eind van een zin).
  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  T.GESPREK_WOORDEN.oorzaak = (D) => {
    const L = D.voorvallen && D.voorvallen.lopend;
    return L && L.oorzaak ? L.oorzaak.zin : '';
  };
  T.GESPREK_WOORDEN.wie = (D) => {
    const L = D.voorvallen && D.voorvallen.lopend;
    return L ? naam(L.wie) : 'iemand';
  };
  T.GESPREK_WOORDEN.ander = (D) => {
    const L = D.voorvallen && D.voorvallen.lopend;
    return L && L.ander ? naam(L.ander) : 'iemand';
  };
})(globalThis.Spel = globalThis.Spel || {});
