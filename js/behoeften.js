// De behoeften van het dorp: eten, brandhout in de winter en een kerk, en de tevredenheid die
// daaruit volgt — als regels zonder scherm (net als js/akkers.js), dus te toetsen in
// test/behoeften.test.cjs. Zie ontwerp/werklijst.md, punt 3 ("Behoeften en de winter") en
// ontwerp/spel.md, "Het dorp in leven houden". Alleen voor het nieuwe spel (?kaart=gehucht); in
// het oude spel blijft S.bevolking altijd 0, dus blijft dit hele bestand een stille no-op (zie
// de opmerking bij T.tikBehoeftenDag hieronder).
//
// T.tikGebouwenDag (js/gebouwen.js) roept T.tikBehoeftenDag hier als eerste stap aan, één keer
// per verstreken kalenderdag. Wat hier per dag gebeurt:
//   1. Eten: elk mens eet zoveel als T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag graan, en sinds 13 okt (vraag 154, de
//      maaltijd) eet het dorp dat in gelijke delen van elke soort die er ligt (T.eetVandaag hieronder; gebouwen.js roept
//      het aan in stap 3). Hoeveel soorten er op tafel kwamen, is de afwisseling, en die bepaalt hoe hard er gewerkt
//      wordt (T.werkVanAfwisseling). Hier kijken of het eten genoeg is. Vis en vlees bederven, tenzij ze gezouten zijn
//      (pasBederfToe; zout komt van de marskramer).
//   2. Brandhout: hout of turf, per huishouden per dag, maar alleen gestookt in de winter.
//   3. Een kerk: heeft het dorp een klare kapel (T.GEBOUWEN.kapel.kerk)?
//   4. Daaruit volgt S.behoeften.tevredenheid (0..1) en S.behoeften.mist (wat het dorp mist, voor
//      de balk, js/hud.js). Wie deze week in de herberg was, maakt het dorp wat tevredener (js/herberg.js).
//   5. Wat tevredenheid doet: hoe hard er gewerkt wordt (js/gebouwen.js, stap 6), of er een gezin
//      bijkomt (js/gebouwen.js, stap 4) of juist wegtrekt (hieronder), en of een huis doorgroeit.
//   6. De winter: een tekort aan brandhout of eten kost mensen — geen apart scherm, alleen een
//      melding en de bevolking die zakt. De melding zegt waaraan: de kou of de honger.
//   7. De winter zien aankomen (sinds 28 sep, vraag 44): op 1 herfstmaand en 1 slachtmaand zegt het
//      dorp of het hout en het eten de winter halen, en in de winter één keer wanneer het op is
//      (T.houtVoorDeWinter en T.etenVoorDeWinter, onderaan).
(function (T) {
  'use strict';

  // Alle getallen in één blok (CLAUDE.md, "Zuinig werken met agents"; ontwerp-opdracht punt 5),
  // zodat Marcel ze kan bijstellen. Bijna allemaal een eerste gok, nog niet door hem bekeken —
  // zie ook de opmerking bij T.WIND_GOLF_Y in js/akkers.js voor hoe dat eerder ging.
  T.BEHOEFTEN_INSTELLINGEN = {
    // De afwisseling (vraag 154; Marcel, 11 okt: "Wijn wordt ook eten. Afwisseling wordt de kern. Mensen worden anders
    // minder productief", en 13 okt: "A1, B1, C1"). Het dorp eet zijn maaltijd in gelijke delen van elke soort die er ligt
    // (T.SOORTEN_ETEN, T.eetVandaag). Een soort telt als hij vandaag minstens afwisselingDeel van de maaltijd was, zodat
    // een kruimel geen gedekte tafel is, en een soort met het dorp moet meegroeien. Het werk (T.werkVanAfwisseling): met
    // één soort werkBijEenSoort, en elke soort erbij werkPerSoortErbij meer, tot het volle werk (1: 4 soorten).
    afwisselingDeel: 0.1,
    werkBijEenSoort: 0.6,
    werkPerSoortErbij: 0.15,
    // Brandhout: hout of turf (eerst turf — dat stoken is toch al zijn enige nut, hout kan de
    // zagerij nog gebruiken), per huishouden (T.GEBOUWEN_INSTELLINGEN.gezinGrootte leent de
    // maat van een gezin, dezelfde als bij groei) per dag, alleen in wintermaand, louwmaand en
    // sprokkelmaand (T.MAANDEN: seizoen "winter").
    brandhoutPerHuishoudenPerDag: 0.15,
    // Sprokkelen (werklijst vraag 74, stap 2; Marcel, 30 sep: "zelf sprokkelen, maar lost niet volledig op.
    // Houthakker is nodig"): elk huishouden raapt elke dag zoveel dood hout in het bos, het hele jaar. Een jaar
    // sprokkelen is zo'n 40% van wat een huishouden in de winter stookt (360 × 0,015 tegen 90 × 0,15): zonder
    // houthakker haalt het dorp de winter niet. Of er gesprokkeld wordt: de spelregel "Het seizoen" (uit: niemand
    // sprokkelt, zoals vóór 30 sep).
    sprokkelen: true,
    sprokkelPerHuishoudenPerDag: 0.015,
    // Hoe de drie hierboven optellen tot S.behoeften.tevredenheid (0..1); de drie gewichten samen
    // zijn 1. kerkBasis is de tevredenheid-bijdrage van "kerk" zónder kerk: een gemis, geen ramp.
    gewichtEten: 0.5,
    gewichtBrandhout: 0.3,
    gewichtKerk: 0.2,
    kerkBasis: 0.6,
    // Wat tevredenheid doet. werkBasis is hoeveel productie er nog overblijft bij 0% tevreden
    // (1 = geen effect; js/gebouwen.js, T.tikGebouwenDag stap 6). groeiDrempel: minstens dit, anders
    // komt er geen nieuw gezin bij op een groeidag (js/gebouwen.js stap 4). vertrekDrempel:
    // hoogstens dit, dan trekt op diezelfde soort dag juist een gezin weg (hieronder).
    werkBasis: 0.5,
    groeiDrempel: 0.55,
    vertrekDrempel: 0.25,
    // De winter: fractie van de bevolking die een volledig tekortdag kost (brandhout én eten op,
    // allebei tellen mee naar rato — T.berekenTevredenheid). Opgebouwd in
    // S.behoeften.winterVerliesRest in plaats van met de dobbelstenen, zodat twee spellen met
    // dezelfde voorraad ook altijd hetzelfde verlies geven (net als T.akkerVariant in akkers.js).
    winterVerliesFactor: 0.01,
    // De winter zien aankomen (Marcel, 27 sep, vraag 44): op deze dagen zegt het dorp of het hout en
    // het eten de winter halen (drie maanden en een maand vooraf), en in de winter zelf één keer, als
    // het binnen zoveel dagen op is (zoals het hooi: T.VEE_INSTELLINGEN.hooiWaarschuwing).
    winterVooraf: [{ maand: 'herfstmaand', dag: 1 }, { maand: 'slachtmaand', dag: 1 }],
    opraakWaarschuwing: 15,
    // Vanaf zoveel dagen vóór de winter kijkt het dorp of het hout en het eten hem halen (90: vanaf 1 herfstmaand, de
    // eerste dag hierboven). Dan zeggen de raad (js/raad.js) en het rapport (js/ochtendrapport.js) het, en haalt het hem
    // niet, dan komt er geen gezin (T.waaromGeenGezin in js/gebouwen.js; werklijst vraag 59, B). Eén getal voor alle
    // drie, zodat ze niet uit elkaar lopen.
    winterVoorafDagen: 90,
    // Honger buiten de winter (een optie in de Spelregels, js/opties.js; Marcel, 24 sep):
    // 'tevredenheid' (alleen dat, zoals het tot 24 sep was), 'wegtrekken' (op een groeidag trekt
    // een gezin weg zolang er geen eten genoeg is), of 'sterven' (net als in de winter kost een
    // tekort aan eten mensen, met dezelfde winterVerliesFactor, maar dan het hele jaar).
    hongerBuitenWinter: 'tevredenheid',
    // Een huis groeit door (T.GEBOUWEN[x].wordt) als het dit veel dagen op rij minstens zo
    // tevreden was; hoger dan groeiDrempel, want een huis groeien is meer dan net rondkomen.
    huisGroeiDagen: 30,
    huisGroeiDrempel: 0.7,
    // Wie doorgroeit, rijst op in de laatste bouwfasen van zijn nieuwe tekening, vanaf deze (0 de fundering, 2 de muren
    // met steigers, 4 half gedekt), over de bouwtijd van zijn nieuwe soort, en blijft erin wonen (werklijst vraag 114, G;
    // Marcel, 4 okt: "G ja"). Alleen het beeld: de regels zien het nieuwe huis meteen.
    groeiVanafFase: 2,
    // Zout (Marcel, 24 sep 2026; spel.md, "Handel"): vis en vlees bederven, tenzij ze gezouten zijn.
    // Eén zout houdt zoveel vis of vlees goed (zoutHoudtGoed); van wat het zout niet dekt, bederft
    // elke dag een deel (bederfPerDag). Wie gezouten vis eet, eet het zout mee op. Zout komt van de
    // marskramer (js/handel.js). Wie eet, eet eerst wat ongezouten is (8 okt, vraag 132, B): tot dan at elke vis die een
    // huis at, ook een verse in de zomer, zijn zout mee, en was het zout op voordat de winter kwam.
    bederfelijk: ['vis', 'vlees'],
    zoutHoudtGoed: 10,
    bederfPerDag: 0.1,
    // Vlees vult een maag (Marcel, 25 sep: "Ja vlees moet ook eten zijn. Maar dan verlies je dus wel
    // veel wat duur is."), zodat slachten in slachtmaand de winter helpt. Eén vlees vult zoveel als
    // vleesAlsGraan graan. Wat het zout niet goed houdt, bederft toch, dus dat eet het dorp eerst,
    // vóór het graan; gezouten vlees bewaart het, net als kaas, tot het graan en de kaas op zijn. Wie
    // het liever aan de marskramer verkoopt (het brengt meer op dan graan), moet het dus zouten. Een
    // optie in de spelregels: vult een maag, of alleen tevredenheid (zoals tot 25 sep).
    vleesIsEten: true,
    vleesAlsGraan: 1,
    // Vis net zo (Marcel, 8 okt: "Vis mag een maag vullen, zoals vlees"): tot dan at het dorp bij honger alleen vlees, en
    // bedierf de vis die de huizen niet aten (in de speeltest vingen vier vissers 8 vis per dag, voor 2,2 die de huizen
    // aten). De spelregel "Vis"; een vis vult zoveel als visAlsGraan hieronder.
    visIsEten: true,
    // Wat een huis aan brood, vis en vlees krijgt voor zijn wensen (js/wensen.js, T.gebruikGoederen), eet het: zoveel
    // graan vult één brood of één vis (Marcel, 2 okt, werklijst vraag 92, a: "A ja"), en het vlees zoveel als hierboven.
    // Daarvoor kwam het brood bovenop wat een ambachtsman at, en maalde de molen er graan voor dat het dorp niet had: in de
    // speeltest at het dorp in de tweede winter zijn zaaigraan op.
    broodAlsGraan: 1,
    visAlsGraan: 1,
    // Wijn vult een maag (Marcel, 11 okt, bij de boeren van 1e: "Wijn wordt ook eten. Afwisseling wordt de kern"), zodat een
    // wijnboer het dorp voedt zoals een akkerbouwer: één wijn vult zoveel als wijnAlsGraan graan (0: geen eten). Zo voedt
    // een tegel wijngaard evenveel als een tegel akker: een rank om de rij geeft 7,5 wijn per tegel (js/wijngaard.js), een
    // akker 4 graan, min 1 zaaigraan (js/akkers.js).
    wijnAlsGraan: 0.4,
    // Groente en eieren vullen een kleine maag (Marcel, 13 okt, vraag 154: "A1"): een moestuin of een kippenhok maakt er
    // één per dag, en met 0,25 voedt hij zo'n 5 mensen (0,05 graan per mens). Met 1 voedde een moestuin van 2 hout er 20.
    groenteAlsGraan: 0.25,
    eierenAlsGraan: 0.25,
  };

  // De soorten eten (vraag 154, A1): elk een eigen soort in de maaltijd, met hoeveel graan één stuk vult (`als`, een getal
  // uit het blok hierboven; zonder is het 1). Kaas is ook de melk van vandaag (js/vee.js), die eerst opgaat, want melk
  // houdt niet. Vlees en vis alleen als ze een maag vullen (`alleenAls`: de spelregels "Vlees" en "Vis"). Wat geen eten is
  // (bier, laken), staat er niet in. Hoe een soort heet: T.waarNaam (js/voorraad.js).
  T.SOORTEN_ETEN = {
    graan: {},
    brood: { als: 'broodAlsGraan' },
    vlees: { als: 'vleesAlsGraan', alleenAls: 'vleesIsEten' },
    vis: { als: 'visAlsGraan', alleenAls: 'visIsEten' },
    wijn: { als: 'wijnAlsGraan' },
    kaas: {},
    groente: { als: 'groenteAlsGraan' },
    eieren: { als: 'eierenAlsGraan' },
  };

  // `gezegd`: wat het dorp deze winter al zei dat op raakte (het hout, het eten; zegDeWinter onderaan).
  T.nieuweBehoeften = function () {
    return { tevredenheid: 1, mist: [], last: [], blij: [], winterVerliesRest: 0, gezegd: {} };
  };


  // Brandhout is hout of turf (eerst turf: pasBrandhoutToe), en het dorp stookt per huishouden, met de
  // maat van een gezin (T.GEBOUWEN_INSTELLINGEN.gezinGrootte, dezelfde als bij groei).
  const BRANDHOUT = ['turf', 'hout'];
  const brandhoutVan = (D) => BRANDHOUT.reduce((n, wat) => n + ((D.voorraad && D.voorraad[wat]) || 0), 0);
  // Het brandhout voor de winter: met de ossenkar (js/kar.js; werklijst C, stap 2) ook wat op de stapels ligt (dat komt
  // nog binnen), maar niet wat de bouwplaatsen nog vragen (dat brengt de kar daarheen).
  const brandhoutVoorDeWinter = (D) => Math.max(0, brandhoutVan(D) + T.opDeStapels(D, 'hout') - T.nogTeBrengen(D, 'hout'));
  const huishoudensVan = (D) => Math.ceil((D.bevolking || 0) / T.GEBOUWEN_INSTELLINGEN.gezinGrootte);

  // Hoeveel vis en vlees er ligt, en hoeveel daarvan het zout goed houdt. Puur; ook voor de balk
  // (js/hud.js), die bij het zout zegt wat het dekt.
  T.zoutDekking = function (D) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const v = D.voorraad || {};
    const totaal = IN.bederfelijk.reduce((n, wat) => n + (v[wat] || 0), 0);
    const gezouten = Math.min(totaal, (v.zout || 0) * IN.zoutHoudtGoed);
    return { totaal, gezouten, onbeschermd: totaal - gezouten };
  };

  // Wat één mens per dag eet, in graan: het getal uit js/gebouwen.js, maal het rantsoen (js/wetten.js). Eén plek,
  // zodat het eten, de balk, de heer en de marskramer met hetzelfde rantsoen rekenen. De soldaten van de heer eten
  // hun eigen rantsoen (js/heer.js), en wat een koe geeft, hangt er ook niet van af (js/vee.js).
  T.etenPerMens = (D) => T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag * T.wetFactor(D, 'eten');

  T.heeftKerk = function (D) {
    return (D.gebouwen || []).some((g) => g.klaar && T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].kerk);
  };

  // Puur: de tevredenheid en wat het dorp mist, voor de toestand van S op deze dag — geen
  // bijwerkingen (niets uit de voorraad, geen bevolking die verandert), dus in één klap te
  // toetsen zonder eerst dagen te hoeven draaien (net als T.akkerStadium in js/akkers.js).
  // T.tikBehoeftenDag hieronder past het antwoord toe.
  T.berekenTevredenheid = function (D, dag) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const datum = T.datumVanDag(dag);
    const inWinter = datum.seizoen === 'winter';
    const bevolking = D.bevolking || 0;
    const v = D.voorraad || {};

    // Wat er vandaag te eten is: de melk van vandaag (js/vee.js, T.tikVeeDag), het graan, de kaas, en de andere soorten
    // (T.etenNaastGraan). Tot 28 sep telde het vlees hier niet, terwijl het dorp het wel at (T.eetVandaag): met alleen
    // vlees in de schuur stierven er in de winter mensen van de honger. Tot 13 okt maakten groente, vis en vlees erbij
    // ook tevredener (de afwisseling van vóór vraag 154); nu maakt de afwisseling dat er harder gewerkt wordt
    // (T.werkVanAfwisseling), en telt hier alleen of het genoeg is.
    const voedselBenodigd = bevolking * T.etenPerMens(D);
    const voedsel = ((D.vee && D.vee.melk) || 0) + (v.graan || 0) + (v.kaas || 0) + T.etenNaastGraan(D);
    const voedselDekking = voedselBenodigd > 0 ? Math.min(1, voedsel / voedselBenodigd) : 1;

    const huishoudens = huishoudensVan(D);
    const brandhoutBenodigd = huishoudens * IN.brandhoutPerHuishoudenPerDag;
    const brandhoutVoorraad = brandhoutVan(D);
    const brandhoutDekking = brandhoutBenodigd > 0 ? Math.min(1, brandhoutVoorraad / brandhoutBenodigd) : 1;
    // Geen straf buiten de winter (niemand stookt in de zomer), maar T.tikBehoeftenDag laat het
    // gemis in D.behoeften.mist wél altijd zien — dat is nu juist het plannen vóór de winter.
    const brandhoutFactor = inWinter ? brandhoutDekking : 1;

    const heeftKerk = T.heeftKerk(D);
    const kerkFactor = heeftKerk ? 1 : IN.kerkBasis;

    // Wat de heer bracht (js/heer.js): soldaten in huis, en wie jij aan de schandpaal zette. Dat
    // mist het dorp niet, daar heeft het last van; het gaat eraf, tot niet onder nul.
    const heer = T.heerOntevredenheid(D, dag);

    // De herberg (js/herberg.js, sinds 27 sep): wie er deze week was, is tevredener. Dat komt erbij,
    // tot niet boven de één; zonder herberg is het nul.
    const gezelligheid = T.herbergGezelligheid(D, dag);

    // De wetten (js/wetten.js, sinds 29 sep): een krap rantsoen of de belasting gaat eraf, een ruim rantsoen
    // komt erbij.
    const wetten = T.wettenTevredenheid(D);

    // De voorvallen (js/voorvallen.js, sinds 29 sep): wat het dorp je antwoorden nadraagt, en dat slijt weg.
    const voorvallen = T.voorvalStemming(D, dag);

    const erbij = gezelligheid + wetten.erbij + voorvallen.erbij - heer.minder;

    // De wensen per huis (js/wensen.js, sinds 1 okt; werklijst vraag 80 en 85): elk huis zijn eigen tevredenheid uit wat
    // zijn stand wil, en het dorp het gemiddelde, naar mensen. De afwisseling van groente, vis en vlees ging daarin op
    // (vlees of vis voor de dorpelingen), net als de kerk (een kapel in de buurt). Zonder (de spelregel "Wensen" op het
    // dorp als geheel, of een dorp zonder bewoners) rekent het zoals vóór 1 okt.
    const wensen = T.WENSEN_INSTELLINGEN.perHuis ? T.berekenWensen(D, dag, { eten: voedselDekking, brandhout: brandhoutFactor, erbij }) : null;
    const tevredenheid = wensen
      ? wensen.tevredenheid
      : Math.min(1, Math.max(0, IN.gewichtEten * voedselDekking + IN.gewichtBrandhout * brandhoutFactor + IN.gewichtKerk * kerkFactor + erbij));

    // Het brandhout mist het dorp ook als het de winter niet haalt (T.houtVoorDeWinter), niet pas als
    // het vandaag op is: dan zegt de balk het op tijd, net als het rode hout ernaast (js/hud.js).
    const mist = [];
    // Wat de speler ziet, en tegelijk waar js/voorvallen.js en de balk (js/balk.js) op letten: dezelfde zin.
    if (voedselDekking < 1) mist.push(T.t('food'));
    if (brandhoutDekking < 1 || !T.houtVoorDeWinter(D, dag).haalt) mist.push(T.t('firewood for the winter'));
    if (wensen) {
      for (const m of wensen.gemist) mist.push(m.naam);
    } else {
      if (!heeftKerk) mist.push(T.t('a church'));
      if (T.herbergDroog(D)) mist.push(T.t('ale'));
    }

    return {
      tevredenheid, mist, last: heer.waarom.concat(wetten.last, voorvallen.last), blij: wetten.blij.concat(voorvallen.blij), inWinter,
      voedselDekking,
      brandhoutDekking, brandhoutBenodigd, brandhoutVoorraad, brandhoutFactor,
      huishoudens, heeftKerk, kerkFactor, gezelligheid, wensen,
    };
  };

  // De balk zegt de tevredenheid meteen zoals ze nu is, niet pas morgen: na een wet die je aannam (js/wetten.js) of
  // een antwoord op een voorval (js/voorvallen.js). Zonder dat er al een dag getikt is, wacht het op die dag.
  T.tevredenheidOpnieuw = function (D) {
    if (!D.behoeften || !D.kalender) return;
    const b = T.berekenTevredenheid(D, Math.floor(D.kalender.dag));
    Object.assign(D.behoeften, { tevredenheid: b.tevredenheid, mist: b.mist, last: b.last, blij: b.blij });
    Object.assign(D.behoeften, { standen: b.wensen ? b.wensen.standen : null, gemist: b.wensen ? b.wensen.gemist : null });
    T.onthoudWensen(D, b.wensen);
    if (T.ui && T.ui.toonTevredenheid) T.ui.toonTevredenheid(D);
  };

  // De vijf "pas ... toe"-functies hieronder passen wat T.berekenTevredenheid uitrekende ook
  // echt toe op S: bederven, stoken, de winter zijn tol laten eisen, een gezin laten vertrekken,
  // een huis laten doorgroeien. Los van elkaar, zodat T.tikBehoeftenDag zelf leest als de lijst
  // hierboven.

  // Wat vandaag van vis en vlees gegeten is, neemt zijn zout mee, voor zover het gezouten was: eerst is wat ongezouten lag
  // gegeten (vraag 132, B). Van wat daarna nog ongezouten ligt, bederft een deel. Naar rato verdeeld over vis en vlees.
  function pasBederfToe(D, gegeten) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const v = D.voorraad;
    if (gegeten > 0 && (v.zout || 0) > 0) {
      const ervoor = T.zoutDekking(D).totaal + gegeten;
      const ongezouten = Math.max(0, ervoor - v.zout * IN.zoutHoudtGoed);
      const gezouten = Math.max(0, gegeten - ongezouten);
      if (gezouten > 0) T.wijzigVoorraad(D, 'zout', -Math.min(v.zout, gezouten / IN.zoutHoudtGoed));
    }
    const d = T.zoutDekking(D);
    if (d.onbeschermd <= 0) return;
    for (const wat of IN.bederfelijk) {
      const deel = (v[wat] || 0) / d.totaal;
      if (deel > 0) T.wijzigVoorraad(D, wat, -d.onbeschermd * deel * IN.bederfPerDag);
    }
  }

  function pasBrandhoutToe(D, b) {
    if (!b.inWinter || b.brandhoutBenodigd <= 0) return;
    const nodig = Math.min(b.brandhoutBenodigd, b.brandhoutVoorraad);
    const uitTurf = Math.min(nodig, D.voorraad.turf || 0);
    if (uitTurf > 0) T.wijzigVoorraad(D, 'turf', -uitTurf);
    const uitHout = Math.min(nodig - uitTurf, D.voorraad.hout || 0);
    if (uitHout > 0) T.wijzigVoorraad(D, 'hout', -uitHout);
  }

  // In de winter kost een tekort aan brandhout of eten mensen; met de optie hongerBuitenWinter
  // 'sterven' ook een tekort aan eten in de rest van het jaar.
  function pasWinterVerliesToe(D, b) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const hongerDoodt = IN.hongerBuitenWinter === 'sterven';
    if (!b.inWinter && !hongerDoodt) {
      D.behoeften.winterVerliesRest = 0; // een nieuwe winter begint weer vers
      return;
    }
    const tekort = b.inWinter ? 1 - Math.min(b.brandhoutDekking, b.voedselDekking) : 1 - b.voedselDekking;
    if (tekort <= 0 || D.bevolking <= 0) return;
    D.behoeften.winterVerliesRest += D.bevolking * tekort * IN.winterVerliesFactor;
    const verlies = Math.floor(D.behoeften.winterVerliesRest);
    if (verlies <= 0) return;
    D.behoeften.winterVerliesRest -= verlies;
    // Waaraan (Marcel, 27 sep, vraag 44): tot 28 sep zei het bericht alleen "De winter is hard".
    const koud = b.inWinter && b.brandhoutDekking < 1;
    const honger = b.voedselDekking < 1;
    const wat = koud && honger ? T.t('The winter is harsh, for the logs and the food have run out')
      : koud ? T.t('The cold is harsh, for the logs have run out')
      : T.t('The hunger is harsh, for the food has run out');
    // Met bewoners zegt het bericht wie het zijn (T.bewonersVolgen, js/bewoners.js); zonder (een toets
    // met een eigen, kleine wereld) alleen hoeveel.
    T.wijzigBevolking(D, -verlies, 'winter', wat);
    if (!D.bewoners) {
      T.zeg(D, verlies === 1 ? T.t('{wat}: the village loses one villager.', { wat }) : T.t('{wat}: the village loses {n} villagers.', { wat, n: verlies }), 'gevaar');
    }
  }

  // Ver onder de groeidrempel trekt op een groeidag een heel gezin juist weg, in plaats van dat
  // er (js/gebouwen.js, stap 4) een bij komt. Met de optie hongerBuitenWinter 'wegtrekken' ook als
  // er buiten de winter geen eten genoeg is.
  //
  // Met de wensen per huis (js/wensen.js; werklijst vraag 85, c: zacht, zoals in Anno 1602) komt wie wegtrekt uit een huis
  // onder de vertrekdrempel, het nieuwste gezin eerst, zoals voor het hele dorp; dat gebeurt alleen als het eten of het
  // brandhout mist (of de heer of een wet het huis er zo ver onder drukt). Wat een huis verder mist, houdt het alleen
  // tegen om door te groeien.
  function pasVertrekToe(D, b, dag) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    if (dag <= 0 || dag % T.GEBOUWEN_INSTELLINGEN.gezinDagen !== 0) return;
    if (D.bevolking <= 0) return;
    const honger = IN.hongerBuitenWinter === 'wegtrekken' && !b.inWinter && b.voedselDekking < 1;
    const ontevreden = b.wensen ? b.wensen.huizen.filter((h) => h.tevredenheid < IN.vertrekDrempel) : null;
    if (!honger && (ontevreden ? !ontevreden.length : b.tevredenheid >= IN.vertrekDrempel)) return;
    let verlies = Math.min(D.bevolking, T.GEBOUWEN_INSTELLINGEN.gezinGrootte);
    let waarom = honger ? T.t('there is no food') : T.t('the village is not content enough');
    let wie;
    if (ontevreden && !honger) {
      wie = T.wieGaatEerst(D, 'vertrek').filter((p) => ontevreden.some((h) => h.g === p.huis));
      verlies = Math.min(verlies, wie.length);
      if (!verlies) return;
      // Onder de drempel zakt een huis alleen zonder eten of brandhout (of door de heer of een wet): dat zegt het bericht.
      const h = ontevreden.find((x) => x.g === wie[0].huis);
      const geen = ['eten', 'brandhout'].filter((id) => h.heeft[id] < 1 - 1e-9).map((id) => T.t('no {wens}', { wens: T.WENSEN[id].naam }));
      waarom = geen.length ? T.t('they have {geen}', { geen: T.opsomming(geen) }) : T.t('they are not content enough');
    }
    // Met bewoners zegt het bericht wie het zijn en lopen ze de weg af (js/bewoners.js).
    T.wijzigBevolking(D, -verlies, 'vertrek', waarom, wie);
    if (!D.bewoners && T.ui && T.ui.bericht) T.zeg(D, T.t('A family is leaving: {waarom}. (-{verlies})', { waarom, verlies }), 'gevaar');
  }


  // Achteruitgaan streng (de spelregel "Achteruitgaan", werklijst vraag 80, C): mist een huis missenDagen op rij iets, dan
  // trekt zijn gezin weg; hooguit één huis per dag, het huis dat het langst mist. Hoelang een huis al iets mist, telt het
  // altijd (g.missenDagen), ook zacht: dat kan een venster zeggen.
  function pasStrengToe(D, wensen) {
    const WI = T.WENSEN_INSTELLINGEN;
    let langst = null;
    for (const h of wensen.huizen) {
      h.g.missenDagen = h.alles ? 0 : (h.g.missenDagen || 0) + 1;
      if (WI.achteruit !== 'streng' || h.g.missenDagen < WI.missenDagen) continue;
      if (!langst || h.g.missenDagen > langst.g.missenDagen) langst = h;
    }
    if (!langst) return;
    langst.g.missenDagen = 0;
    const wie = T.wieGaatEerst(D, 'vertrek').filter((p) => p.huis === langst.g);
    const verlies = Math.min(T.GEBOUWEN_INSTELLINGEN.gezinGrootte, wie.length);
    const mist = Object.keys(langst.heeft).filter((id) => langst.heeft[id] < 1 - 1e-9).map((id) => T.WENSEN[id].naam);
    if (verlies) T.wijzigBevolking(D, -verlies, 'vertrek', T.t('their house has lacked {mist} for a month', { mist: T.opsomming(mist) }), wie);
  }

  // Ruilt het voorwerp van een gebouw voor zijn "wordt"-soort: dezelfde tekening-ingang als
  // T.plaatsGebouw zet (js/gebouwen.js, zetGebouwVoorwerp), dus er komt er geen tweede bij. Geeft
  // true als het lukte; false (zonder iets te veranderen) als de uitbreiding nergens past — dan
  // probeert T.tikBehoeftenDag het de volgende dag gewoon weer.
  //
  // Oud en nieuw delen dezelfde linkerbovenhoek (instantie.x, instantie.y), maar niet altijd
  // dezelfde vorm: "hut" staat in tegels/gebouwen.tsx smal en diep, "huis" juist breed en ondiep.
  // Dus niet zomaar de hele nieuwe voet vastzetten: wat ván de oude voet buiten de nieuwe valt,
  // moet ook weer los — anders blijft daar een onzichtbare muur staan (T.isVast zonder tekening
  // erboven). 'vloer' is de gewone lege vloer (zoals een verse wereld begint, js/wereld.js); de
  // echte grasplaat komt uit een andere laag (js/tekenen.js, S.grond) en verandert dus niet mee.
  //
  // Groeit een gebouw binnen zijn soort (`nieuw` is zijn eigen soort: de herberg die in een dorp groot wordt), dan
  // blijft de kant van zijn deur staan waar hij stond, en schuift de hoek (groeiSchuif): de deur blijft aan het plein.
  function groeiGebouw(D, instantie, soort, nieuw = soort.wordt) {
    const nieuweSoort = T.GEBOUWEN[nieuw];
    if (!nieuweSoort) return false;
    const w = D.wereld;
    const oudeVoet = instantie.voet || T.gebouwVoet(instantie.soort, instantie.tekening) || { b: 1, h: 1 };
    const keus = kiesGroei(D, instantie, nieuw, oudeVoet);
    if (!keus) return false; // geen ruimte: morgen weer
    const { tekening, voet: nieuweVoet, schuif } = keus;
    const [oudX, oudY] = [instantie.x, instantie.y];
    instantie.x += schuif.x;
    instantie.y += schuif.y;
    instantie.voorwerp.x = instantie.x;
    instantie.voorwerp.y = instantie.y;
    const inNieuw = (dx, dy) => dx - schuif.x >= 0 && dy - schuif.y >= 0 && dx - schuif.x < nieuweVoet.b && dy - schuif.y < nieuweVoet.h;
    if (T.vormVan(tekening) === T.vormVan(T.volgendeTekening(D, nieuw))) T.neemTekening(D, nieuw);
    instantie.soort = nieuw;
    instantie.tekening = tekening;
    instantie.voet = nieuweVoet;
    instantie.groeiDagen = 0;
    const opz = tekening && T.opzoekTegelNaam(tekening);
    const naam = 'gebouw:' + nieuw;
    T.registreerGebouwSoort(naam);
    instantie.voorwerp.soort = naam;
    instantie.voorwerp.vel = opz ? opz.vel : null;
    instantie.voorwerp.id = opz ? opz.id : null;
    instantie.voorwerp.beslaat = [nieuweVoet.b, nieuweVoet.h];
    instantie.voorwerp.tekeningNaam = tekening ? tekening.split('/').pop() : null;
    // een nieuw huis is jong (T.maakJong, js/gebouwen.js)
    instantie.voorwerp.gebouwdOp = Math.floor(D.kalender.dag);
    for (let dy = 0; dy < nieuweVoet.h; dy++) {
      for (let dx = 0; dx < nieuweVoet.b; dx++) {
        const yy = instantie.y + dy;
        const xx = instantie.x + dx;
        T.zetTegel(w, xx, yy, 'muur');
      }
    }
    for (let dy = 0; dy < oudeVoet.h; dy++) {
      for (let dx = 0; dx < oudeVoet.b; dx++) {
        if (inNieuw(dx, dy)) continue; // blijft vast: hoort nu bij de nieuwe voet
        const yy = oudY + dy;
        const xx = oudX + dx;
        T.zetTegel(w, xx, yy, 'vloer');
      }
    }
    // op een land met hoogte: de grond onder de nieuwe voet vlak, op de hoogte waar het huis al stond (js/hoogte.js)
    if (w.hoogte) T.egaliseer(w, { x: instantie.x, y: instantie.y, b: nieuweVoet.b, h: nieuweVoet.h }, { x: oudX, y: oudY });
    // een andere soort en een andere voet: de lijst per tegel en de eilanden (js/wereld.js), op de oude en de nieuwe voet
    const [x1, y1] = [Math.min(instantie.x, oudX), Math.min(instantie.y, oudY)];
    T.kaartVeranderd(w, { x1, y1, x2: Math.max(instantie.x + nieuweVoet.b, oudX + oudeVoet.b) - 1, y2: Math.max(instantie.y + nieuweVoet.h, oudY + oudeVoet.h) - 1 });
    // Het nieuwe huis rijst op in de laatste bouwfasen over de bouwtijd van zijn soort (groeiVanafFase; G), en wie erin
    // woont, blijft erin wonen: alleen het voorwerp is in aanbouw, het gebouw is klaar. Een tekening zonder bouwfasen
    // groeit in één nacht, zoals altijd. T.tikGebouwenDag (js/gebouwen.js) zet hem klaar.
    const fasen = T.BOUWFASEN && T.BOUWFASEN.fasen[instantie.voorwerp.tekeningNaam];
    if (fasen && nieuweSoort.bouwtijd > 0) {
      Object.assign(instantie.voorwerp, {
        inAanbouw: true,
        klaarOp: Math.floor(D.kalender.dag) + nieuweSoort.bouwtijd,
        bouwtijd: nieuweSoort.bouwtijd,
        vanFase: T.BEHOEFTEN_INSTELLINGEN.groeiVanafFase,
      });
    }
    // Wie er woont, gaat voortaan naar de deur van de nieuwe tekening (js/bewoners.js).
    T.huisVeranderd(D, instantie);
    return true;
  }

  // Welke tekening een huis krijgt als het doorgroeit, en zijn nieuwe voet: het stenen broertje van zijn huis (`broertjes` op de
  // nieuwe soort: dezelfde voet, dus er is altijd plaats; werklijst vraag 85, d), of de volgende van zijn nieuwe soort
  // (T.volgendeTekening, js/gebouwen.js), en past die niet, een andere die wel past. Null als er geen past.
  //
  // Een huis van een bouwstijl (js/bouwstijl.js) houdt de kant van zijn deur, en krijgt het dak en de steen van nu (Marcel, 4 okt:
  // het dak "Alleen als het doorgroeit of gebouwd wordt daarna"): zijn stenen broertje, de volgende vorm van zijn nieuwe soort, of een andere die past.
  function kiesGroei(D, instantie, nieuw, oudeVoet) {
    const vorm = groeiVormen(D, instantie, nieuw, oudeVoet).find((v) => !v.inDeWeg.length);
    return vorm ? { tekening: vorm.tekening, voet: vorm.voet, schuif: vorm.schuif } : null;
  }
  // Hoe ver de hoek schuift als een gebouw binnen zijn soort groeit: de kant van zijn deur blijft liggen (een deur naar
  // het zuiden houdt zijn onderkant, naar het oosten zijn rechterkant; naar het noorden en het westen ligt die kant al
  // aan de hoek). Een huis dat een andere soort wordt, groeit vanuit zijn hoek.
  function groeiSchuif(instantie, nieuw, oudeVoet, voet) {
    const kant = instantie.soort === nieuw ? T.deurKantVan(instantie.tekening) : null;
    return { x: kant === 'o' ? oudeVoet.b - voet.b : 0, y: kant === 'z' ? oudeVoet.h - voet.h : 0 };
  }
  // De vormen waar dit huis in kan groeien, in de volgorde waarin het ze probeert (hierboven), elk met wat er in de weg
  // staat: [{ tekening, voet, inDeWeg }].
  // Zonder `kiezen` slaat het de volgende tekening van de nieuwe soort over: T.volgendeTekening loot er een als die er nog
  // niet is, en dan liep het spel anders naar waar de muis stond (het briefje vraagt het elk beeld; gezien door de derde
  // versie van vraag 130). Die vorm zit ook tussen de andere, dus wat kan, verandert niet. Alleen de groei zelf kiest.
  function groeiVormen(D, instantie, nieuw, oudeVoet, kiezen = true) {
    const soort = T.GEBOUWEN[nieuw];
    const kandidaten = [];
    const kant = T.deurKantVan(instantie.tekening);
    if (kant) {
      kandidaten.push(T.zoalsNu(D, instantie.tekening, nieuw));
      if (kiezen) kandidaten.push(T.metDeurNaar(T.volgendeTekening(D, nieuw), kant));
      kandidaten.push(...T.andereVormen(D, instantie.tekening, nieuw));
      kandidaten.splice(0, kandidaten.length, ...kandidaten.filter(Boolean));
    } else {
      const broertje = soort.broertjes && soort.broertjes[instantie.tekening];
      if (broertje) kandidaten.push(broertje);
      if (kiezen) kandidaten.push(T.volgendeTekening(D, nieuw));
      for (const t of soort.tekeningen || []) if (!kandidaten.includes(t)) kandidaten.push(t);
    }
    return kandidaten.filter((t, i, a) => a.indexOf(t) === i).map((tekening) => {
      const voet = T.gebouwVoet(nieuw, tekening) || oudeVoet;
      const schuif = groeiSchuif(instantie, nieuw, oudeVoet, voet);
      return { tekening, voet, schuif, inDeWeg: watStaatInDeWeg(D, instantie, oudeVoet, voet, schuif) };
    });
  }

  // Wat staat er in de weg waar de nieuwe voet buiten de oude valt: [{ x, y, wat }], leeg als hij past. `wat` is 'rooien'
  // (een boom, een stronk, een struik, een boompje: het gezin kan het rooien, js/bos.js; werklijst vraag 130), 'appel' (zijn
  // eigen appelboom: die kapt het gezin ook, maar alleen als het niet anders kan, a2; T.isEigenBoom), 'iemand'
  // (die staat er, morgen weer), 'deur' (van een ander gebouw: werklijst vraag 88, in de nulmeting groeide een hut over
  // twee mensen heen, die er tot het eind ingemetseld stonden), 'meegroei' (waar de herberg straks groter wordt), of 'vast'
  // (een muur, een gebouw, een rots).
  function watStaatInDeWeg(D, instantie, oudeVoet, voet, schuif = { x: 0, y: 0 }) {
    const w = D.wereld;
    const uit = [];
    for (let dy = schuif.y; dy < schuif.y + voet.h; dy++) {
      for (let dx = schuif.x; dx < schuif.x + voet.b; dx++) {
        if (dx >= 0 && dy >= 0 && dx < oudeVoet.b && dy < oudeVoet.h) continue; // eigen grond: was toch al van dit huis
        const x = instantie.x + dx;
        const y = instantie.y + dy;
        const r = { x, y, b: 1, h: 1 };
        let wat = null;
        if (T.meegroeiGrondOp(D, x, y, instantie)) wat = 'meegroei';
        else if (T.ontginWerkOp(w, x, y)) wat = 'rooien';
        else if (T.isEigenBoom(T.voorwerpOp(w, x, y))) wat = 'appel';
        else if (T.isVast(w, x, y)) wat = 'vast';
        else if (T.deurOpRechthoek(D, r, instantie)) wat = 'deur';
        else if (T.wieStaatOp(w, r)) wat = 'iemand';
        if (wat) uit.push({ x, y, wat });
      }
    }
    return uit;
  }

  // Heeft dit huis plaats om door te groeien: 'past' (er staat niets in de weg, of alleen iemand die morgen weg is),
  // 'rooien' (alleen na het rooien, T.groeiRooiPlan), of null (er staat iets wat het gezin niet kan rooien).
  function groeiRuimte(D, g, soort) {
    const oudeVoet = g.voet || T.gebouwVoet(g.soort, g.tekening) || { b: 1, h: 1 };
    if (groeiVormen(D, g, soort.wordt, oudeVoet).some((v) => v.inDeWeg.every((t) => t.wat === 'iemand'))) return 'past';
    return T.groeiRooiPlan(D, g) ? 'rooien' : null;
  }

  // Kan dit huis (met mensen, dat een maand alles had) niet doorgroeien, maar wel als zijn gezin eerst rooit wat er staat
  // (werklijst vraag 130; Marcel, 6 okt: "Ok")? Dan het stuk dat vrij moet ({ x, y, b, h }: de nieuwe voet), van de vorm
  // met het minste te rooien, en met de eigen appelboom alleen als geen vorm zonder hem kan (a2; Marcel, in de derde versie:
  // "A"); anders null. Wie er alleen staat, telt niet: die is morgen weg. Zonder `kiezen` loot het niet (groeiVormen).
  const teRooien = (t) => t.wat === 'rooien' || t.wat === 'appel';
  T.groeiRooiPlan = function (D, g, kiezen = true) {
    const soort = T.GEBOUWEN[g.soort];
    if (!soort || !soort.wordt || !T.GEBOUWEN[soort.wordt] || !g.voorwerp) return null;
    const oudeVoet = g.voet || T.gebouwVoet(g.soort, g.tekening) || { b: 1, h: 1 };
    const vormen = groeiVormen(D, g, soort.wordt, oudeVoet, kiezen);
    if (vormen.some((v) => v.inDeWeg.every((t) => t.wat === 'iemand'))) return null; // hij past al
    let beste = null;
    for (const v of vormen) {
      const rooien = v.inDeWeg.filter(teRooien).length;
      if (!rooien || v.inDeWeg.some((t) => !teRooien(t) && t.wat !== 'iemand')) continue;
      const appels = v.inDeWeg.filter((t) => t.wat === 'appel').length;
      if (!beste || appels < beste.appels || (appels === beste.appels && rooien < beste.rooien)) beste = { appels, rooien, voet: v.voet };
    }
    return beste ? { x: g.x, y: g.y, b: beste.voet.b, h: beste.voet.h } : null;
  };

  // Waarom dit huis niet doorgroeit, terwijl het alles heeft en de bouwstof er is (het briefje, js/huisbriefje.js;
  // werklijst vraag 130, c), of null: het gezin rooit eerst, of er staat iets wat het niet kan rooien.
  T.waaromGroeitHetNiet = function (D, g) {
    const soort = T.GEBOUWEN[g.soort];
    if (soort && soort.groeitMee) return g.wachtOpPlaats ? waaromGeenPlaats(D, g, g.soort) : null;
    if (!soort || !soort.wordt || !T.GEBOUWEN[soort.wordt] || !g.voorwerp) return null;
    if (g.groeitNaRooien) return T.t('the family first clears {wat} where it is to grow', { wat: T.rooiWoordenOp(D, g.kavel).replace(/ \(.*\)$/, '') });
    if (!((g.groeiDagen || 0) >= T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen)) return null;
    return waaromGeenPlaats(D, g, soort.wordt);
  };
  // Wat er staat waar dit gebouw als `nieuw` groter moet worden en wat het gezin niet kan rooien, in woorden, of null.
  function waaromGeenPlaats(D, g, nieuw) {
    const oudeVoet = g.voet || T.gebouwVoet(g.soort, g.tekening) || { b: 1, h: 1 };
    const vormen = groeiVormen(D, g, nieuw, oudeVoet, false); // het briefje vraagt het elk beeld: niet loten
    if (!vormen.length || vormen.some((v) => v.inDeWeg.every((t) => t.wat === 'iemand' || teRooien(t)))) return null;
    // De vorm waar het minste in de weg staat, en daarvan wat het gezin niet kan rooien.
    const beste = vormen.slice().sort((a, b) => a.inDeWeg.length - b.inDeWeg.length)[0];
    const t = beste.inDeWeg.find((x) => x.wat !== 'iemand' && !teRooien(x));
    if (t.wat === 'meegroei') return T.t('the {gebouw} will grow there later', { gebouw: T.GEBOUWEN[T.meegroeiGrondOp(D, t.x, t.y, g).soort].naam });
    if (t.wat === 'deur') return T.t('the door of another house is in the way');
    const v = T.voorwerpOp(D.wereld, t.x, t.y);
    const g2 = v && (D.gebouwen || []).find((h) => h.voorwerp === v);
    const naam = g2 ? T.eenNaam(T.GEBOUWEN[g2.soort].naam) : v && T.VOORWERPEN[v.soort] && T.VOORWERPEN[v.soort].naam ? T.VOORWERPEN[v.soort].naam
      : v ? NAMEN[v.soort] || T.t('something') : T.t('a wall');
    return T.t('there is {wat} where it has to grow', { wat: naam });
  }
  // Wat er van de natuur in de weg kan staan en niet te rooien is (een appelboom rooit het gezin zelf: vraag 130, a2).
  const NAMEN = { rots: T.t('a rock'), kleineRots: T.t('a rock') };

  // "the hut of Walter" (het hoofd van het gezin dat er woont), of "a hut" als er niemand woont: voor de raad en de
  // kring van de wensen (werklijst vraag 130, c2 en d).
  T.huisVan = function (D, g) {
    const naam = T.GEBOUWEN[g.soort].naam;
    // Waar de schout woont, is jouw huis (niet "the reeve's house of the reeve").
    if (g.huis === 'schout') return g.soort === 'schout' ? T.t('your house') : T.t('your {gebouw}', { gebouw: naam });
    const mensen = ((D.bewoners && D.bewoners.mensen) || []).filter((p) => p.huis === g);
    const p = mensen.find((m) => !m.hoofd) || mensen[0];
    return p ? T.t('the {gebouw} of {wie}', { gebouw: naam, wie: T.naamVanBewoner(p) }) : T.eenNaam(naam);
  };

  // Waar een gebouw dat met het dorp meegroeit (de herberg, `groeitMee`) straks groter wordt: per gebouw dat nog de vorm
  // van het gehucht heeft, de rechthoek van elke vorm van een dorp (T.dorpsVormen, js/bouwstijl.js), met zijn deur waar
  // hij stond (groeiSchuif). Daar komt niets anders: geen gebouw, geen kraam, geen akker (T.waaromNietOpDezeGrond,
  // js/gebouwen.js), en geen huis dat doorgroeit (watStaatInDeWeg). Werklijst vraag 114, stap 3 (Marcel, 8 okt:
  // "Beiden"): in de speeltest van 7 okt bleef de herberg op 62707 klein, omdat er later iets op zijn grond kwam.
  // [{ g, x, y, b, h }]; uit de gebouwen, dus één keer per stand van het dorp.
  const MEEGROEIGROND = new WeakMap(); // dorp → { sleutel, grond }
  T.meegroeiGrond = function (D) {
    const gebouwen = D.gebouwen || [];
    let sleutel = `${gebouwen.length}`;
    for (const g of gebouwen) if (T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].groeitMee) sleutel += `:${g.tekening},${g.x},${g.y}`;
    const oud = MEEGROEIGROND.get(D);
    if (oud && oud.sleutel === sleutel) return oud.grond;
    const grond = [];
    for (const g of gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      if (!soort || !soort.groeitMee || !g.voorwerp) continue;
      const oudeVoet = g.voet || T.gebouwVoet(g.soort, g.tekening) || { b: 1, h: 1 };
      for (const t of T.dorpsVormen(g.tekening)) {
        const voet = T.gebouwVoet(g.soort, t);
        const schuif = groeiSchuif(g, g.soort, oudeVoet, voet);
        grond.push({ g, x: g.x + schuif.x, y: g.y + schuif.y, b: voet.b, h: voet.h });
      }
    }
    MEEGROEIGROND.set(D, { sleutel, grond });
    return grond;
  };
  // Ligt (x, y) waar een gebouw straks meegroeit (T.meegroeiGrond)? Het gebouw zelf, of null. `behalve`: dat gebouw zelf.
  T.meegroeiGrondOp = function (D, x, y, behalve = null) {
    for (const r of T.meegroeiGrond(D)) {
      if (r.g !== behalve && x >= r.x && x < r.x + r.b && y >= r.y && y < r.y + r.h) return r.g;
    }
    return null;
  };

  const kostenTekst = (kosten) => T.opsomming(Object.keys(kosten).map((wat) => T.hoeveel(kosten[wat], wat)));

  // Het dorp als geheel (de spelregel "Wensen", zoals vóór 1 okt): is het dorp huisGroeiDagen op rij tevreden genoeg,
  // dan groeit elk huis door, zonder bouwstof.
  function pasHuisGroeiToe(D, b) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    if (b.wensen) return pasHuisGroeiPerHuisToe(D, b.wensen);
    const tevredenGenoeg = b.tevredenheid >= IN.huisGroeiDrempel;
    for (const instantie of D.gebouwen) {
      const soort = T.GEBOUWEN[instantie.soort];
      // Alleen een gebouw met een voorwerp groeit mee: een huis dat de speler of een gezin bouwde.
      if (!instantie.klaar || !instantie.voorwerp || !soort || !soort.wordt || !magDoorgroeien(D, soort)) continue;
      instantie.groeiDagen = tevredenGenoeg ? (instantie.groeiDagen || 0) + 1 : 0;
      if (instantie.groeiDagen >= IN.huisGroeiDagen && groeiGebouw(D, instantie, soort)) {
        T.zeg(D, T.t('{van} has grown into {naar}.', { van: T.hoofdletter(T.eenNaam(soort.naam)), naar: T.eenNaam(T.GEBOUWEN[soort.wordt].naam) }), 'goed');
      }
    }
  }

  // Een stenen huis wordt pas een woontoren met marktrecht (`wordtVanaf` op de soort; vraag 114, stap 3).
  const magDoorgroeien = (D, soort) => !soort.wordtVanaf || T.tredeMinstens(D, soort.wordtVanaf);

  // Een gebouw dat meegroeit met het dorp (`groeitMee` op de soort: de herberg; werklijst vraag 114, stap 3, Marcel, 7
  // okt, "A; ja goed idee"): is zijn vorm er een die op deze trede niet meer gebouwd wordt (de kleine herberg van het
  // gehucht, in een dorp), dan groeit het door tot de vorm van nu, met zijn deur waar hij stond, als de bouwstof er is
  // (T.WENSEN_INSTELLINGEN.bouwstof) en er plaats is; anders morgen weer. Alleen in een land met een bouwstijl: daar
  // zijn de vormen per trede (js/bouwstijl.js).
  function laatMeegroeien(D) {
    for (const g of D.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      if (!soort || !soort.groeitMee || !g.klaar || !g.voorwerp || g.voorwerp.inAanbouw) continue;
      const nu = T.stijlTekeningen(D, g.soort);
      if (!nu || !T.deurKantVan(g.tekening) || nu.some((t) => T.vormVan(t) === T.vormVan(g.tekening))) continue;
      const kosten = T.WENSEN_INSTELLINGEN.bouwstof[g.soort] || {};
      if (!T.kanBetalen(D, kosten)) {
        if (!g.wachtOpBouwstof) T.zeg(D, T.t('The {gebouw} can grow with the village, but that takes {kosten}.', { gebouw: soort.naam, kosten: kostenTekst(kosten) }));
        g.wachtOpBouwstof = true;
        continue;
      }
      rooiVoorDeGroei(D, g);
      // Geen plaats, of er stond iemand: morgen weer. Staat er iets wat niet weggaat, dan zegt het dorp het één keer, en
      // het briefje zolang het duurt (T.waaromGroeitHetNiet).
      if (!groeiGebouw(D, g, soort, g.soort)) {
        const waarom = waaromGeenPlaats(D, g, g.soort);
        if (waarom && !g.wachtOpPlaats) T.zeg(D, T.t('The {gebouw} cannot grow with the village: {waarom}.', { gebouw: soort.naam, waarom }));
        if (waarom) g.wachtOpPlaats = true;
        continue;
      }
      delete g.wachtOpBouwstof;
      delete g.wachtOpPlaats;
      T.betaalKosten(D, kosten);
      const woorden = { gebouw: soort.naam, kosten: kostenTekst(kosten) };
      T.zeg(D, Object.keys(kosten).length ? T.t('The {gebouw} grows with the village, for {kosten}.', woorden) : T.t('The {gebouw} grows with the village.', woorden), 'goed');
    }
  }

  // Staat er waar een gebouw meegroeit alleen wat te rooien is (een struik, een boom: T.ontginWerkOp, js/bos.js), dan
  // gaat dat eruit met de bouw mee, het hout van een boom naar de schuur; een appelboom van iemand blijft staan. Er is geen
  // gezin dat het eerst rooit, zoals bij een huis (T.rooiOmTeGroeien): de herberg staat klaar zodra de bouwstof er is.
  function rooiVoorDeGroei(D, g) {
    const oudeVoet = g.voet || T.gebouwVoet(g.soort, g.tekening) || { b: 1, h: 1 };
    const vormen = groeiVormen(D, g, g.soort, oudeVoet, false);
    if (vormen.some((v) => v.inDeWeg.every((t) => t.wat === 'iemand'))) return;
    const vorm = vormen.find((v) => v.inDeWeg.every((t) => t.wat === 'rooien' || t.wat === 'iemand'));
    if (!vorm) return;
    for (const t of vorm.inDeWeg) {
      for (let n = 0; n < 3 && T.ontginWerkOp(D.wereld, t.x, t.y); n++) {
        if (T.ontginWerkOp(D.wereld, t.x, t.y) === 'hakken') T.hakBoom(D, t.x, t.y, g);
        else T.rooi(D, t.x, t.y);
      }
    }
  }

  // Per huis (js/wensen.js; werklijst vraag 80, C, en 85): heeft een huis huisGroeiDagen op rij alles wat zijn stand wil,
  // dan groeit het door naar de volgende stand, als de bouwstof er is (T.WENSEN_INSTELLINGEN.bouwstof: een huis hout, een
  // stenen huis steen). Zonder bouwstof wacht het, en zegt het dorp het één keer.
  function pasHuisGroeiPerHuisToe(D, wensen) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    // Een huis waar niemand meer woont, begint opnieuw te tellen als er weer iemand komt.
    const bewoond = new Set(wensen.huizen.map((h) => h.g));
    for (const g of D.gebouwen) {
      if (bewoond.has(g)) continue;
      delete g.groeiDagen;
      delete g.missenDagen;
      delete g.wachtOpBouwstof;
    }
    for (const h of wensen.huizen) {
      const g = h.g;
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !g.voorwerp || !soort.wordt || !magDoorgroeien(D, soort)) continue;
      g.groeiDagen = h.alles ? (g.groeiDagen || 0) + 1 : 0;
      if (!h.alles) delete g.wachtOpBouwstof;
      if (g.groeiDagen < IN.huisGroeiDagen) continue;
      if (g.groeitNaRooien) continue; // het gezin rooit nog wat in de weg staat (js/bos.js)
      // Is er geen plaats, ook niet na het rooien, dan wacht het op plaats, niet op bouwstof: het briefje zegt waarom
      // (T.waaromGroeitHetNiet; werklijst vraag 130). In de speeltest van 6 okt was het hout één keer op, en bleef een hut
      // die door een erf niet kon groeien, drie jaar "wachten op 8 hout".
      const ruimte = groeiRuimte(D, g, soort);
      if (!ruimte) {
        delete g.wachtOpBouwstof;
        continue;
      }
      const nieuw = T.GEBOUWEN[soort.wordt];
      const kosten = T.WENSEN_INSTELLINGEN.bouwstof[soort.wordt] || {};
      if (!T.kanBetalen(D, kosten)) {
        if (!g.wachtOpBouwstof) T.zeg(D, T.t('{van} can become {naar}, but that takes {kosten}.', { van: T.hoofdletter(T.eenNaam(soort.naam)), naar: T.eenNaam(nieuw.naam), kosten: kostenTekst(kosten) }));
        g.wachtOpBouwstof = true;
        continue;
      }
      delete g.wachtOpBouwstof;
      // Staat er alleen iets wat het gezin kan rooien, dan rooit het dat eerst (werklijst vraag 130).
      if (ruimte === 'rooien') {
        T.rooiOmTeGroeien(D, g, T.groeiRooiPlan(D, g));
        continue;
      }
      if (!groeiGebouw(D, g, soort)) continue; // er stond iemand: morgen weer
      T.betaalKosten(D, kosten);
      const woorden = { van: T.hoofdletter(T.eenNaam(soort.naam)), naar: T.eenNaam(nieuw.naam), kosten: kostenTekst(kosten), stand: T.STANDEN[T.standVan(g)].naam };
      T.zeg(D, Object.keys(kosten).length ? T.t('{van} has grown into {naar}, for {kosten}: whoever lives there now belongs with the {stand}.', woorden)
        : T.t('{van} has grown into {naar}: whoever lives there now belongs with the {stand}.', woorden), 'goed');
      // Voor het rapport van de raadsman (js/ochtendrapport.js; vraag 87): "The hut of Gerard has become a house".
      const p = ((D.bewoners && D.bewoners.mensen) || []).find((m) => m.huis === g);
      T.schrijfOp(D, 'huis', { wie: p ? p.naam : null, van: soort.naam, naar: nieuw.naam, stand: T.standVan(g) });
    }
  }

  // De maaltijd, één dag (vraag 154; Marcel, 13 okt: "A1, B1, C1, D1"; gameloop.md, "Besloten"). Het dorp eet in gelijke
  // delen van elke soort die er ligt (T.SOORTEN_ETEN): wie minder heeft dan zijn deel, geeft wat hij heeft, en de
  // andere vullen aan. Alles in graan gerekend. Binnen een soort gaat eerst op wat bederft: de melk van vandaag vóór de
  // kaas (wat van de melk overblijft, wordt kaas, T.VEE_INSTELLINGEN.melkNaarKaas), en de vis en het vlees die het zout
  // niet goed houdt vóór wat gezouten is (vraag 132, B; wie gezouten eet, eet het zout mee op). Het zaaigraan eet het
  // dorp pas als er niets anders meer is (T.zaaigraanApart, js/akkers.js; vraag 81). Tot 13 okt at het in een vaste
  // volgorde (de melk, wat bederft, het graan, de kaas, de wijn, wat gezouten is), en met genoeg graan at het alleen graan.
  // T.tikGebouwenDag (js/gebouwen.js, stap 3) roept dit aan. Wat de huizen vandaag al aten voor hun wensen (`alGegeten`,
  // per soort in graan; T.gebruikGoederen in js/wensen.js, vraag 92, a), hoeft het dorp niet meer te eten, en het telt
  // mee in de afwisseling: de soorten die vandaag minstens afwisselingDeel van de maaltijd waren (D.behoeften.afwisseling,
  // voor T.werkVanAfwisseling). Geeft wat er van elke soort gegeten is (in stuks; `graan` met het zaaigraan, `kaas`
  // zonder de melk), en { nodig, melk, zaaigraan, kaasErbij, tekort, afwisseling }.
  T.eetVandaag = function (D, dag = D.kalender ? Math.floor(D.kalender.dag) : 0, alGegeten = {}) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const maaltijd = (D.bevolking || 0) * T.etenPerMens(D);
    const nodig = Math.max(0, maaltijd - Object.values(alGegeten).reduce((n, x) => n + x, 0));
    const v = D.voorraad;
    const melkVandaag = (D.vee && D.vee.melk) || 0;
    // Wat er van elke soort ligt, in graan. Het zaaigraan blijft apart (vraag 132).
    const apart = Math.min(v.graan || 0, T.zaaigraanApart(D, dag));
    const ligt = {};
    for (const wat of Object.keys(T.SOORTEN_ETEN)) {
      const stuks = wat === 'graan' ? (v.graan || 0) - apart : (v[wat] || 0) + (wat === 'kaas' ? melkVandaag : 0);
      if (stuks > 0 && T.voedtAlsGraan(wat) > 0) ligt[wat] = stuks * T.voedtAlsGraan(wat);
    }
    const deel = gelijkeDelen(ligt, nodig);
    // Het zout dekt vis en vlees samen (T.zoutDekking), dus van elk hetzelfde deel: kijk vóór het eten wat ongezouten is.
    const d = T.zoutDekking(D);
    const deelOngezouten = d.totaal > 0 ? d.onbeschermd / d.totaal : 1;
    const r = { nodig, melk: 0, zaaigraan: 0, kaasErbij: 0, tekort: 0 };
    let zoutGegeten = 0;
    for (const wat of Object.keys(T.SOORTEN_ETEN)) {
      const stuks = (deel[wat] || 0) / (T.voedtAlsGraan(wat) || 1);
      r[wat] = stuks;
      if (stuks <= 0) continue;
      if (wat === 'kaas') r.melk = Math.min(stuks, melkVandaag);
      if (IN.bederfelijk.includes(wat)) zoutGegeten += Math.max(0, stuks - v[wat] * deelOngezouten);
      const uitVoorraad = wat === 'kaas' ? stuks - r.melk : stuks;
      if (wat === 'kaas') r.kaas = uitVoorraad;
      if (uitVoorraad > 0) T.wijzigVoorraad(D, wat, -uitVoorraad);
    }
    if (zoutGegeten > 0 && (v.zout || 0) > 0) T.wijzigVoorraad(D, 'zout', -Math.min(v.zout, zoutGegeten / IN.zoutHoudtGoed));
    // Is er niet genoeg, dan het zaaigraan, liever dan dat er mensen sterven.
    const rest = nodig - Object.values(deel).reduce((n, x) => n + x, 0);
    if (rest > 1e-9 && apart > 0) {
      r.zaaigraan = Math.min(rest, apart);
      if (r.zaaigraan > 0) T.wijzigVoorraad(D, 'graan', -r.zaaigraan);
    }
    zegHetZaaigraan(D, r.zaaigraan, apart);
    r.graan += r.zaaigraan;
    r.tekort = Math.max(0, rest - r.zaaigraan);
    r.kaasErbij = (melkVandaag - r.melk) * (T.VEE_INSTELLINGEN ? T.VEE_INSTELLINGEN.melkNaarKaas : 0);
    if (r.kaasErbij > 0) T.wijzigVoorraad(D, 'kaas', r.kaasErbij);
    if (D.vee) D.vee.melk = 0;
    // De afwisseling: wat de huizen aten en wat het dorp at, per soort.
    const genoeg = maaltijd * IN.afwisselingDeel;
    const gegeten = (wat) => (alGegeten[wat] || 0) + (deel[wat] || 0) + (wat === 'graan' ? r.zaaigraan : 0);
    r.afwisseling = Object.keys(T.SOORTEN_ETEN).filter((wat) => maaltijd > 0 && gegeten(wat) >= genoeg - 1e-9);
    (D.behoeften || (D.behoeften = T.nieuweBehoeften())).afwisseling = r.afwisseling;
    return r;
  };

  // Hoeveel stuks van een soort het dorp per dag eet zolang hij er ligt: zijn gelijke deel van de maaltijd, naast de
  // soorten die er nu liggen. Voor wie een jaar vooruitkijkt: de wijn na de pluk (js/wijngaard.js).
  T.maaltijdDeel = function (D, soort) {
    const per = T.voedtAlsGraan(soort);
    if (per <= 0) return 0;
    const v = D.voorraad || {};
    const n = Object.keys(T.SOORTEN_ETEN).filter((wat) => wat === soort || (T.voedtAlsGraan(wat) > 0 && (v[wat] || 0) > 0)).length;
    return (D.bevolking || 0) * T.etenPerMens(D) / n / per;
  };

  // Verdeel `nodig` in gelijke delen over wat er `ligt` ({ soort: hoeveel }): wie minder heeft dan zijn deel, geeft alles,
  // en de rest delen de anderen weer gelijk. Geeft { soort: hoeveel eruit }.
  function gelijkeDelen(ligt, nodig) {
    const soorten = Object.keys(ligt).sort((a, b) => ligt[a] - ligt[b]);
    const uit = {};
    let open = nodig;
    soorten.forEach((wat, i) => {
      uit[wat] = Math.min(ligt[wat], open / (soorten.length - i));
      open -= uit[wat];
    });
    return uit;
  }

  // Hoe hard er gewerkt wordt naar de afwisseling van de laatste maaltijd (vraag 154, B1: al het werk): met één soort
  // werkBijEenSoort, met elke soort erbij werkPerSoortErbij meer, tot 1. Zonder maaltijd (nog geen dag gegeten, of niemand
  // die eet) volle kracht; wat honger doet, regelt de tevredenheid en de winter.
  T.werkVanAfwisseling = function (D) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const soorten = D.behoeften && D.behoeften.afwisseling;
    if (!soorten || !soorten.length) return 1;
    return Math.min(1, IN.werkBijEenSoort + (soorten.length - 1) * IN.werkPerSoortErbij);
  };

  // Eet het dorp van het zaaigraan, dan zegt het dat één keer per winter, en schrijft het het op voor het rapport
  // (js/ochtendrapport.js). Wordt er niets achtergehouden (na het zaaien), dan mag het de volgende keer weer.
  function zegHetZaaigraan(D, gegeten, apart) {
    if (apart <= 0) {
      if (D.behoeften) D.behoeften.zaaigraanGegeten = false;
      return;
    }
    if (gegeten <= 0 || (D.behoeften && D.behoeften.zaaigraanGegeten)) return;
    (D.behoeften || (D.behoeften = T.nieuweBehoeften())).zaaigraanGegeten = true;
    const zin = T.t('The hunger is great: the village is eating the seed grain. What is eaten now cannot go into the ground in spring.');
    T.zeg(D, zin, 'gevaar');
    T.schrijfOp(D, 'boeren', { tekst: T.t('The farmers gave up some of the seed grain, for there was nothing else left to eat.') });
  }

  // Hoeveel graan één stuk van een soort vult (T.SOORTEN_ETEN), of 0 als het geen eten is (bier, laken): voor de maaltijd,
  // en voor wat een huis eet voor zijn wensen (T.gebruikGoederen, js/wensen.js; vraag 92, a).
  T.voedtAlsGraan = function (soort) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const s = T.SOORTEN_ETEN[soort];
    if (!s || (s.alleenAls && !IN[s.alleenAls])) return 0;
    return s.als ? IN[s.als] || 0 : 1;
  };

  // Hoeveel de soorten naast het graan en de kaas in de voorraad het dorp nog voeden, in graan: voor het venster van de
  // heer (js/heer.js, T.heerVooruitzicht) en of het eten de winter haalt.
  // Het eten dat op de stapels ligt (js/kar.js; werklijst C, stap 3), in graan: het komt nog binnen, dus het dorp rekent
  // ermee als het kijkt of het eten de winter haalt, maar het eet het pas als de ossenkar het bracht.
  const etenOpDeStapels = (D) => Object.keys(T.SOORTEN_ETEN).reduce((n, wat) => n + T.opDeStapels(D, wat) * T.voedtAlsGraan(wat), 0);

  T.etenNaastGraan = function (D) {
    const v = D.voorraad || {};
    return Object.keys(T.SOORTEN_ETEN).filter((wat) => wat !== 'graan' && wat !== 'kaas')
      .reduce((n, wat) => n + (v[wat] || 0) * T.voedtAlsGraan(wat), 0);
  };

  // ---------------------------------------------------------------------------------------------
  // De winter zien aankomen (Marcel, 27 sep, vraag 44)
  // ---------------------------------------------------------------------------------------------
  //
  // In de speeltest van 27 sep stierf bijna de helft van het gehucht aan de kou, en de speler wist
  // niet waarom: niets zei het vooraf. Nu zegt het dorp op de dagen van winterVooraf of het hout en het
  // eten de winter halen, en in de winter zelf één keer wanneer het op is, zoals het hooi van het vee
  // (js/vee.js). In de balk staat het hout in het rood als het de winter niet haalt (js/hud.js).

  // De winter van het dorp: de maanden met seizoen "winter" (T.MAANDEN: wintermaand tot en met
  // sprokkelmaand), want dan stookt het. Het vee eet langer hooi: van slachtmaand tot en met lentemaand
  // (T.winterDagen, js/vee.js).
  const isWinter = (dag) => T.datumVanDag(dag).seizoen === 'winter';
  // Hoeveel dagen het vanaf `dag` nog duurt tot die winter (0 als hij al loopt). Voor wie niet meer wil weten
  // (de raad, js/raad.js), want het eten van de hele winter uitrekenen kost meer.
  T.dagenTotDeWinter = (dag) => T.periodeVanaf(dag, isWinter).tot;
  // Is de winter in zicht: binnen winterVoorafDagen, of al begonnen? Dan kijkt het dorp of het hout en het eten hem halen.
  T.winterInZicht = (dag) => T.dagenTotDeWinter(dag) <= T.BEHOEFTEN_INSTELLINGEN.winterVoorafDagen;

  const dagenTekst = (n) => T.t('{n|one day|# days}', { n });
  const MAANDEN_TEKST = ['', T.t('a month'), T.t('two months'), T.t('three months'), T.t('four months'), T.t('five months'), T.t('six months')];

  // Of een voorraad de winter haalt: één regel voor het hout en het eten van het dorp, en het hooi van
  // het vee (js/vee.js). `voorraad` ligt er nu; tot de winter komt er `voorWinter` bij (of gaat er af:
  // het dorp eet ook vóór de winter); in de winter gaat er per dag `perWinterdag` af, met wat erbij
  // komt er al vanaf. Geeft { dagen, winter, haalt }: voor hoeveel van de `winter` dagen het genoeg is.
  T.haaltDeWinter = function ({ voorraad, voorWinter = 0, perWinterdag, winter }) {
    const begin = voorraad + voorWinter;
    let dagen = winter;
    if (perWinterdag > 0) dagen = begin <= 0 ? 0 : Math.min(winter, Math.floor(begin / perWinterdag + 1e-9));
    return { dagen, winter, haalt: dagen >= winter };
  };

  // Raakt het op binnen `binnen` dagen, en haalt het de winter niet? Dan de zin die het dorp zegt: "The wood will run
  // out in 12 days, and the winter lasts 40 more days." Anders null. Voor het hout en het eten (hieronder) en het hooi
  // (js/vee.js); `wat` is de naam met zijn lidwoord ("the wood", "the hay"). Wie hem zegt, zegt hem één keer per winter.
  T.raaktOp = function (wat, v, binnen) {
    if (v.haalt || v.dagen > binnen) return null;
    const woorden = { wat: T.hoofdletter(wat), dagen: dagenTekst(v.dagen), rest: T.t('{n|one more day|# more days}', { n: v.winter }) };
    return v.dagen < 1 ? T.t('{wat} has run out, and the winter lasts {rest}.', woorden) : T.t('{wat} will run out in {dagen}, and the winter lasts {rest}.', woorden);
  };

  // Wat de mensen per dag sprokkelen (sprokkelPerHuishoudenPerDag): hout erbij, elke dag (T.tikBehoeftenDag).
  T.sprokkelHout = (D) => (T.BEHOEFTEN_INSTELLINGEN.sprokkelen ? huishoudensVan(D) * T.BEHOEFTEN_INSTELLINGEN.sprokkelPerHuishoudenPerDag : 0);

  // Wat er per dag aan brandhout bijkomt: wat de mensen sprokkelen (T.sprokkelHout), en wat de werkplaatsen de
  // laatste dag maakten (g.werkte, js/gebouwen.js, stap 6), min wat ze ervan gebruikten. In het gehucht hakt alleen de
  // houthakker.
  T.brandhoutErbij = function (D) {
    let erbij = T.sprokkelHout(D);
    for (const g of D.gebouwen || []) {
      const m = T.GEBOUWEN[g.soort].maakt;
      if (!m || !g.werkte) continue;
      const uit = T.maaktUit(D, T.GEBOUWEN[g.soort]);
      for (const wat of BRANDHOUT) erbij += (((uit && uit[wat]) || 0) - ((m.in && m.in[wat]) || 0)) * g.werkte;
    }
    return erbij;
  };

  // Of het hout de winter haalt: wat er ligt, en wat er per dag bijkomt, tegen wat het dorp in de
  // winter stookt. Vanaf `dag`, met die dag. Geeft wat T.haaltDeWinter geeft, en `tot` (dagen tot de
  // winter, 0 in de winter zelf), `stook` (per winterdag) en `erbij` (per dag).
  T.houtVoorDeWinter = function (D, dag) {
    const { tot, duur } = T.periodeVanaf(dag, isWinter);
    const stook = huishoudensVan(D) * T.BEHOEFTEN_INSTELLINGEN.brandhoutPerHuishoudenPerDag;
    const erbij = T.brandhoutErbij(D);
    const v = T.haaltDeWinter({ voorraad: brandhoutVoorDeWinter(D), voorWinter: erbij * tot, perWinterdag: stook - erbij, winter: duur });
    return Object.assign(v, { tot, stook, erbij });
  };

  // Of het eten de winter haalt: het graan, de kaas en het vlees (als dat een maag vult), met de melk
  // die de koeien nog geven (js/vee.js), tegen wat het dorp eet, het hele jaar door, en de soldaten van
  // de heer zolang ze er zijn (js/heer.js). Alles in graan, zoals het dorp eet (T.eetVandaag). Vanaf
  // `dag`, met die dag. Geeft wat T.haaltDeWinter geeft, en `tot` en `eet` (per dag).
  T.etenVoorDeWinter = function (D, dag) {
    const { tot, duur } = T.periodeVanaf(dag, isWinter);
    const v = D.voorraad || {};
    const eet = (D.bevolking || 0) * T.etenPerMens(D) + T.soldatenEten(D, dag);
    const van = Math.floor(dag);
    const melkVoor = T.verwachteMelk(D, van, van + tot);
    const melkIn = duur > 0 ? T.verwachteMelk(D, van + tot, van + tot + duur) / duur : 0;
    // Het zaaigraan telt niet mee: dat eet het dorp pas bij nood (T.zaaigraanApart, js/akkers.js).
    // Wat er nog als schoven op het veld staat, komt binnen (js/akkers.js, vraag 140).
    const graan = Math.max(0, (v.graan || 0) + T.graanOpHetVeld(D) - T.zaaigraanApart(D, van));
    const r = T.haaltDeWinter({
      voorraad: graan + (v.kaas || 0) + T.etenNaastGraan(D) + etenOpDeStapels(D),
      voorWinter: melkVoor - eet * tot,
      perWinterdag: eet - melkIn,
      winter: duur,
    });
    return Object.assign(r, { tot, eet });
  };

  // Of vis en vlees de winter halen voor de huizen die ze willen (vraag 132, B; Marcel, 8 okt: "A en B samen"). In de
  // winter ligt de beek dicht (T.GEBOUWEN.visser.stilIn), dus wat de huizen dan eten, ligt er al, en gezouten, want
  // ongezouten bederft het (bederfPerDag). Vanaf `dag`, zolang de winter in zicht is en nog niet begon; null als geen huis
  // vis of vlees wil. Geeft { nodig (wat de huizen in de winter willen), ligt (vis en vlees nu), dan (wat er ligt als de
  // winter begint: met wat de vissers vangen, min wat de huizen eten), gezouten
  // (wat het zout nu goed houdt), zout (hoeveel zout er nog bij moet voor wat er dan ligt, tot wat nodig is), tekort (wat
  // er dan nog mist), tot (dagen tot de winter), winter (zijn duur) }.
  T.visEnVleesVoorDeWinter = function (D, dag) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    if (!T.winterInZicht(dag)) return null;
    const { tot, duur } = T.periodeVanaf(dag, isWinter);
    if (tot <= 0) return null;
    const st = D.behoeften && D.behoeften.standen;
    let perDag = 0;
    for (const s of Object.keys(st || {})) {
      if (T.wensenVanStand(s).includes('vleesOfVis')) perDag += st[s].mensen * T.WENSEN_INSTELLINGEN.perMens.vleesOfVis;
    }
    if (perDag <= 0) return null;
    // Wat de vissers op een dag vangen. Wat de jagers schieten, telt niet mee: in de speeltest van 8 okt rekende het dorp
    // met vijf jagers op genoeg vlees voor de winter, kocht het geen zout, en was de vis na twee weken winter op.
    let vis = 0;
    for (const g of D.gebouwen || []) if (g.klaar && g.soort === 'visser') vis += T.GEBOUWEN.visser.maakt.uit.vis;
    const v = D.voorraad || {};
    const ligt = IN.bederfelijk.reduce((n, wat) => n + (v[wat] || 0), 0);
    const nodig = perDag * duur;
    const dan = Math.max(0, ligt + (vis - perDag) * tot);
    const gezouten = Math.min(ligt, (v.zout || 0) * IN.zoutHoudtGoed);
    const zout = Math.max(0, Math.ceil(Math.min(dan, nodig) / IN.zoutHoudtGoed - (v.zout || 0) - 1e-9));
    return { nodig, ligt, dan, gezouten, zout, tekort: Math.max(0, nodig - dan), tot, winter: duur };
  };

  // Wat de winter niet haalt, nu hij in zicht is (T.winterInZicht): ['hout'], ['eten'], allebei, of niets (ook als de
  // winter nog ver is). De groei vraagt het (T.waaromGeenGezin, js/gebouwen.js): wie de winter niet haalt, krijgt er
  // geen gezin bij.
  T.watDeWinterNietHaalt = function (D, dag) {
    if (!T.winterInZicht(dag)) return [];
    const niet = [];
    if (!T.houtVoorDeWinter(D, dag).haalt) niet.push('hout');
    if (!T.etenVoorDeWinter(D, dag).haalt) niet.push('eten');
    return niet;
  };

  // Wat helpt als het hout de winter niet haalt: een houthakker, of nog een.
  function houtHelpt(D) {
    const woorden = { hakker: T.GEBOUWEN.houthakker.naam, per: T.hoeveel(T.maaktUit(D, T.GEBOUWEN.houthakker).hout, 'hout') };
    return (D.gebouwen || []).some((g) => g.soort === 'houthakker')
      ? T.t('another {hakker} cuts {per} more a day', woorden)
      : T.t('{hakker} cuts {per} a day', { ...woorden, hakker: T.eenNaam(woorden.hakker) });
  }

  // En als het eten de winter niet haalt: de oogst is binnen, maar een jager schiet vlees, als dat een
  // maag vult.
  function etenHelpt(D, eten) {
    const woorden = { dagen: eten.dagen, winter: eten.winter, jager: T.eenNaam(T.GEBOUWEN.jager.naam), vlees: T.hoeveel(T.GEBOUWEN.jager.maakt.uit.vlees, 'vlees') };
    if (!T.BEHOEFTEN_INSTELLINGEN.vleesIsEten) return T.t('The food lasts {dagen} of the {winter} days.', woorden);
    return T.t('The food lasts {dagen} of the {winter} days: {jager} shoots {vlees} a day, and meat fills the belly.', woorden);
  }

  // Het bericht vooraf: "In a month it will be winter. The wood lasts 52 of the 90 days, even with what the people
  // gather: a woodcutter cuts 2 wood a day. The food lasts the winter."
  function zegDeWinterVooraf(D, dag) {
    const hout = T.houtVoorDeWinter(D, dag);
    const eten = T.etenVoorDeWinter(D, dag);
    const wanneer = hout.tot > 0 ? T.t('In {wanneer} it will be winter.', { wanneer: MAANDEN_TEKST[hout.tot / T.DAGEN_PER_MAAND] || dagenTekst(hout.tot) }) : T.t('It is winter.');
    const zinnen = [wanneer];
    if (hout.haalt && eten.haalt) zinnen.push(T.t('The logs and the food last the winter.'));
    else {
      // Sprokkelen de mensen (vraag 74, stap 2), dan zegt het dat dat niet genoeg is.
      if (hout.haalt) zinnen.push(T.t('The logs last the winter.'));
      else {
        const woorden = { dagen: hout.dagen, winter: hout.winter, hulp: houtHelpt(D) };
        zinnen.push(T.sprokkelHout(D) > 0 ? T.t('The logs last {dagen} of the {winter} days, even with what the people gather: {hulp}.', woorden)
          : T.t('The logs last {dagen} of the {winter} days: {hulp}.', woorden));
      }
      zinnen.push(eten.haalt ? T.t('The food lasts the winter.') : etenHelpt(D, eten));
      // Een gezin wacht op de winter (js/gebouwen.js, T.waaromGeenGezin): dat zegt het dorp erbij.
      if (T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter && T.winterInZicht(dag)) zinnen.push(T.t('Until there is enough, no new family will come.'));
    }
    T.zeg(D, zinnen.join(' '), hout.haalt && eten.haalt ? 'goed' : 'gevaar');
  }

  // Wat het dorp over de winter zegt, één keer per dag (T.tikBehoeftenDag, vóór het stoken en het eten
  // van vandaag, want de dagen tellen met vandaag): op de dagen van winterVooraf het bericht vooraf, en
  // in de winter één keer wanneer het hout of het eten op is.
  function zegDeWinter(D, dag) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const B = D.behoeften;
    if (!(D.bevolking > 0)) return;
    const d = T.datumVanDag(dag);
    if (IN.winterVooraf.some((w) => w.maand === T.MAANDEN[d.maand].naam && w.dag === d.dagVanMaand)) zegDeWinterVooraf(D, dag);
    if (!isWinter(dag)) {
      B.gezegd = {}; // een nieuwe winter mag weer waarschuwen
      return;
    }
    const gezegd = B.gezegd || (B.gezegd = {});
    // De sleutels staan in het spel (B.gezegd); wat de speler leest, is de tweede.
    const nu = [['het hout', T.t('the firewood'), T.houtVoorDeWinter(D, dag)], ['het eten', T.t('the food'), T.etenVoorDeWinter(D, dag)]]; // geen tekst: de sleutels staan in het spel
    for (const [sleutel, wat, v] of nu) {
      const tekst = !gezegd[sleutel] && T.raaktOp(wat, v, IN.opraakWaarschuwing);
      if (!tekst) continue;
      gezegd[sleutel] = true;
      T.zeg(D, tekst, 'gevaar');
    }
  }

  // Eén dag bijwerken: wordt aangeroepen vanuit T.tikGebouwenDag (js/gebouwen.js, stap 0), dus
  // één keer per verstreken kalenderdag, vóór woonruimte/eten/groei/handen/productie van die dag.
  // Losstaand aanroepbaar (net als T.tikGebouwenDag zelf), zodat een toets ook één dag in één keer
  // kan proberen. In het oude spel (De laatste klim) blijft S.bevolking altijd 0: dan is
  // T.berekenTevredenheid hierboven een paar sommen met nul, verandert er niets aan de bevolking
  // (die guards hierboven allemaal op S.bevolking > 0), en is dit bestand dus een stille no-op.
  T.tikBehoeftenDag = function (D, dag) {
    if (!D.behoeften) D.behoeften = T.nieuweBehoeften();
    const b = T.berekenTevredenheid(D, dag);
    D.behoeften.tevredenheid = b.tevredenheid;
    D.behoeften.voedselDekking = b.voedselDekking; // voor de status hongersnood (T.OORZAKEN, js/voorvallen.js)
    D.behoeften.mist = b.mist;
    D.behoeften.last = b.last;
    D.behoeften.blij = b.blij;
    D.behoeften.gezelligheid = b.gezelligheid;
    // Per stand en wat er gemist wordt, voor de balk (js/hud.js); wat elk huis wil en heeft, op het huis (js/wensen.js).
    D.behoeften.standen = b.wensen ? b.wensen.standen : null;
    D.behoeften.gemist = b.wensen ? b.wensen.gemist : null;
    T.onthoudWensen(D, b.wensen);

    // Of het hout en het eten de winter halen, vóór het stoken en het eten van vandaag.
    zegDeWinter(D, dag);

    // De huizen nemen wat hun stand gebruikt (js/wensen.js), vóór het eten (stap 3 in T.tikGebouwenDag).
    const goederen = b.wensen ? T.gebruikGoederen(D, b.wensen) : { bederfelijk: 0, gegeten: {} };

    pasBederfToe(D, goederen.bederfelijk);
    pasBrandhoutToe(D, b);
    const sprokkel = T.sprokkelHout(D); // het dode hout van vandaag, voor de winter
    if (sprokkel > 0) T.wijzigVoorraad(D, 'hout', sprokkel);
    pasWinterVerliesToe(D, b);
    pasVertrekToe(D, b, dag);
    if (b.wensen) pasStrengToe(D, b.wensen);
    pasHuisGroeiToe(D, b);
    laatMeegroeien(D);

    if (T.ui && T.ui.toonTevredenheid) T.ui.toonTevredenheid(D);
    // Wat de huizen aan brood, vis, vlees en wijn aten, per soort in graan: dat eet het dorp vandaag minder, en het telt
    // mee in de afwisseling (T.eetVandaag; vraag 92, a, en 154).
    return goederen.gegeten;
  };
})(globalThis.Spel = globalThis.Spel || {});
