// De behoeften van het dorp: eten, brandhout in de winter en een kerk, en de tevredenheid die
// daaruit volgt — als regels zonder scherm (net als js/akkers.js), dus te toetsen in
// test/behoeften.test.cjs. Zie ontwerp/werklijst.md, punt 3 ("Behoeften en de winter") en
// ontwerp/spel.md, "Het dorp in leven houden". Alleen voor het nieuwe spel (?kaart=gehucht); in
// het oude spel blijft S.bevolking altijd 0, dus blijft dit hele bestand een stille no-op (zie
// de opmerking bij T.tikBehoeftenDag hieronder).
//
// T.tikGebouwenDag (js/gebouwen.js) roept T.tikBehoeftenDag hier als eerste stap aan, één keer
// per verstreken kalenderdag. Wat hier per dag gebeurt:
//   1. Eten: graan is de basis (T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag), en sinds het vee
//      (25 sep) eet het dorp eerst de melk van vandaag, dan het vlees dat anders bederft, dan graan,
//      en pas als het graan op is kaas en gezouten vlees (T.eetVandaag hieronder; gebouwen.js roept
//      het aan in stap 3). Hier kijken of dat samen
//      genoeg is, en of er ook groente, vis of vlees is. Meer soorten maakt tevredener, en wordt
//      ook echt opgegeten. Vis en vlees bederven, tenzij ze gezouten zijn (pasBederfToe; zout komt
//      van de marskramer).
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
    // Eten: hoeveel van elke extra soort (naast graan) er per mens per dag bij gegeten wordt, als
    // hij er is — klein, want het is variatie, geen tweede maaltijd. extraVoedselDrempel is hoeveel
    // er minstens moet liggen voordat een soort meetelt (anders "telt" een kruimel al als een
    // gedekte tafel).
    extraVoedselPerMensPerDag: 0.01,
    extraVoedselDrempel: 1,
    // Brandhout: hout of turf (eerst turf — dat stoken is toch al zijn enige nut, hout kan de
    // timmerman nog gebruiken), per huishouden (T.GEBOUWEN_INSTELLINGEN.gezinGrootte leent de
    // maat van een gezin, dezelfde als bij groei) per dag, alleen in wintermaand, louwmaand en
    // sprokkelmaand (T.MAANDEN: seizoen "winter").
    brandhoutPerHuishoudenPerDag: 0.15,
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
    // Honger buiten de winter (een optie in de Spelregels, js/opties.js; Marcel, 24 sep):
    // 'tevredenheid' (alleen dat, zoals het tot 24 sep was), 'wegtrekken' (op een groeidag trekt
    // een gezin weg zolang er geen eten genoeg is), of 'sterven' (net als in de winter kost een
    // tekort aan eten mensen, met dezelfde winterVerliesFactor, maar dan het hele jaar).
    hongerBuitenWinter: 'tevredenheid',
    // Een huis groeit door (T.GEBOUWEN[x].wordt) als het dit veel dagen op rij minstens zo
    // tevreden was; hoger dan groeiDrempel, want een huis groeien is meer dan net rondkomen.
    huisGroeiDagen: 30,
    huisGroeiDrempel: 0.7,
    // Zout (Marcel, 24 sep 2026; spel.md, "Handel"): vis en vlees bederven, tenzij ze gezouten zijn.
    // Eén zout houdt zoveel vis of vlees goed (zoutHoudtGoed); van wat het zout niet dekt, bederft
    // elke dag een deel (bederfPerDag). Wie gezouten vis eet, eet het zout mee op. Zout komt van de
    // marskramer (js/handel.js).
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
  };

  // `gezegd`: wat het dorp deze winter al zei dat op raakte (het hout, het eten; zegDeWinter onderaan).
  T.nieuweBehoeften = function () {
    return { tevredenheid: 1, mist: [], last: [], winterVerliesRest: 0, gezegd: {} };
  };

  function bericht(tekst, soort) {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  }

  // Brandhout is hout of turf (eerst turf: pasBrandhoutToe), en het dorp stookt per huishouden, met de
  // maat van een gezin (T.GEBOUWEN_INSTELLINGEN.gezinGrootte, dezelfde als bij groei).
  const BRANDHOUT = ['turf', 'hout'];
  const brandhoutVan = (S) => BRANDHOUT.reduce((n, wat) => n + ((S.voorraad && S.voorraad[wat]) || 0), 0);
  const huishoudensVan = (S) => Math.ceil((S.bevolking || 0) / T.GEBOUWEN_INSTELLINGEN.gezinGrootte);

  // Hoeveel vis en vlees er ligt, en hoeveel daarvan het zout goed houdt. Puur; ook voor de balk
  // (js/hud.js), die bij het zout zegt wat het dekt.
  T.zoutDekking = function (S) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const v = S.voorraad || {};
    const totaal = IN.bederfelijk.reduce((n, wat) => n + (v[wat] || 0), 0);
    const gezouten = Math.min(totaal, (v.zout || 0) * IN.zoutHoudtGoed);
    return { totaal, gezouten, onbeschermd: totaal - gezouten };
  };

  T.heeftKerk = function (S) {
    return (S.gebouwen || []).some((g) => g.klaar && T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].kerk);
  };

  // Puur: de tevredenheid en wat het dorp mist, voor de toestand van S op deze dag — geen
  // bijwerkingen (niets uit de voorraad, geen bevolking die verandert), dus in één klap te
  // toetsen zonder eerst dagen te hoeven draaien (net als T.akkerStadium in js/akkers.js).
  // T.tikBehoeftenDag hieronder past het antwoord toe.
  T.berekenTevredenheid = function (S, dag) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const datum = T.datumVanDag(dag);
    const inWinter = datum.seizoen === 'winter';
    const bevolking = S.bevolking || 0;
    const v = S.voorraad || {};

    // Wat er vandaag te eten is: de melk van vandaag (js/vee.js, T.tikVeeDag), het graan, de kaas, en
    // het vlees als dat een maag vult (T.vleesAlsEten). Tot 28 sep telde het vlees hier niet, terwijl
    // het dorp het wel at (T.eetVandaag): met alleen vlees in de schuur stierven er in de winter
    // mensen van de honger.
    const voedselBenodigd = bevolking * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
    const voedsel = ((S.vee && S.vee.melk) || 0) + (v.graan || 0) + (v.kaas || 0) + T.vleesAlsEten(S);
    const voedselDekking = voedselBenodigd > 0 ? Math.min(1, voedsel / voedselBenodigd) : 1;
    const extraSoorten = ['groente', 'vis', 'vlees'].filter((wat) => (v[wat] || 0) >= IN.extraVoedselDrempel);
    const voedselFactor = voedselDekking * (0.5 + 0.5 * (extraSoorten.length / 3));

    const huishoudens = huishoudensVan(S);
    const brandhoutBenodigd = huishoudens * IN.brandhoutPerHuishoudenPerDag;
    const brandhoutVoorraad = brandhoutVan(S);
    const brandhoutDekking = brandhoutBenodigd > 0 ? Math.min(1, brandhoutVoorraad / brandhoutBenodigd) : 1;
    // Geen straf buiten de winter (niemand stookt in de zomer), maar T.tikBehoeftenDag laat het
    // gemis in S.behoeften.mist wél altijd zien — dat is nu juist het plannen vóór de winter.
    const brandhoutFactor = inWinter ? brandhoutDekking : 1;

    const heeftKerk = T.heeftKerk(S);
    const kerkFactor = heeftKerk ? 1 : IN.kerkBasis;

    // Wat de heer bracht (js/heer.js): soldaten in huis, en wie jij aan de schandpaal zette. Dat
    // mist het dorp niet, daar heeft het last van; het gaat eraf, tot niet onder nul.
    const heer = T.heerOntevredenheid(S, dag);

    // De herberg (js/herberg.js, sinds 27 sep): wie er deze week was, is tevredener. Dat komt erbij,
    // tot niet boven de één; zonder herberg is het nul.
    const gezelligheid = T.herbergGezelligheid(S, dag);

    const tevredenheid = Math.min(1, Math.max(0, IN.gewichtEten * voedselFactor + IN.gewichtBrandhout * brandhoutFactor + IN.gewichtKerk * kerkFactor + gezelligheid - heer.minder));

    // Het brandhout mist het dorp ook als het de winter niet haalt (T.houtVoorDeWinter), niet pas als
    // het vandaag op is: dan zegt de balk het op tijd, net als het rode hout ernaast (js/hud.js).
    const mist = [];
    if (voedselDekking < 1) mist.push('eten');
    if (brandhoutDekking < 1 || !T.houtVoorDeWinter(S, dag).haalt) mist.push('brandhout voor de winter');
    if (!heeftKerk) mist.push('een kerk');
    if (T.herbergDroog(S)) mist.push('bier');

    return {
      tevredenheid, mist, last: heer.waarom, inWinter,
      voedselDekking, extraSoorten, voedselFactor,
      brandhoutDekking, brandhoutBenodigd, brandhoutVoorraad, brandhoutFactor,
      huishoudens, heeftKerk, kerkFactor, gezelligheid,
    };
  };

  // De vijf "pas ... toe"-functies hieronder passen wat T.berekenTevredenheid uitrekende ook
  // echt toe op S: bederven, stoken, de winter zijn tol laten eisen, een gezin laten vertrekken,
  // een huis laten doorgroeien. Los van elkaar, zodat T.tikBehoeftenDag zelf leest als de lijst
  // hierboven.

  // Wat vandaag van vis en vlees gegeten is, neemt zijn zout mee; van wat daarna nog ongezouten
  // ligt, bederft een deel. Naar rato verdeeld over vis en vlees.
  function pasBederfToe(S, gegeten) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const v = S.voorraad;
    if (gegeten > 0 && (v.zout || 0) > 0) T.wijzigVoorraad(S, 'zout', -Math.min(v.zout, gegeten / IN.zoutHoudtGoed));
    const d = T.zoutDekking(S);
    if (d.onbeschermd <= 0) return;
    for (const wat of IN.bederfelijk) {
      const deel = (v[wat] || 0) / d.totaal;
      if (deel > 0) T.wijzigVoorraad(S, wat, -d.onbeschermd * deel * IN.bederfPerDag);
    }
  }

  function pasBrandhoutToe(S, b) {
    if (!b.inWinter || b.brandhoutBenodigd <= 0) return;
    const nodig = Math.min(b.brandhoutBenodigd, b.brandhoutVoorraad);
    const uitTurf = Math.min(nodig, S.voorraad.turf || 0);
    if (uitTurf > 0) T.wijzigVoorraad(S, 'turf', -uitTurf);
    const uitHout = Math.min(nodig - uitTurf, S.voorraad.hout || 0);
    if (uitHout > 0) T.wijzigVoorraad(S, 'hout', -uitHout);
  }

  // In de winter kost een tekort aan brandhout of eten mensen; met de optie hongerBuitenWinter
  // 'sterven' ook een tekort aan eten in de rest van het jaar.
  function pasWinterVerliesToe(S, b) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const hongerDoodt = IN.hongerBuitenWinter === 'sterven';
    if (!b.inWinter && !hongerDoodt) {
      S.behoeften.winterVerliesRest = 0; // een nieuwe winter begint weer vers
      return;
    }
    const tekort = b.inWinter ? 1 - Math.min(b.brandhoutDekking, b.voedselDekking) : 1 - b.voedselDekking;
    if (tekort <= 0 || S.bevolking <= 0) return;
    S.behoeften.winterVerliesRest += S.bevolking * tekort * IN.winterVerliesFactor;
    const verlies = Math.floor(S.behoeften.winterVerliesRest);
    if (verlies <= 0) return;
    S.behoeften.winterVerliesRest -= verlies;
    // Waaraan (Marcel, 27 sep, vraag 44): tot 28 sep zei het bericht alleen "De winter is hard".
    const koud = b.inWinter && b.brandhoutDekking < 1;
    const honger = b.voedselDekking < 1;
    const wat = koud && honger ? 'De winter is hard, want het hout en het eten zijn op'
      : koud ? 'De kou is hard, want het hout is op'
      : 'De honger is hard, want het eten is op';
    // Met bewoners zegt het bericht wie het zijn (T.bewonersVolgen, js/bewoners.js); zonder (een toets
    // met een eigen, kleine wereld) alleen hoeveel.
    T.wijzigBevolking(S, -verlies, 'winter', wat);
    if (!S.bewoners) {
      bericht(
        verlies === 1 ? `${wat}: het dorp verliest een dorpeling.` : `${wat}: het dorp verliest ${verlies} dorpelingen.`,
        'gevaar',
      );
    }
  }

  // Ver onder de groeidrempel trekt op een groeidag een heel gezin juist weg, in plaats van dat
  // er (js/gebouwen.js, stap 4) een bij komt. Met de optie hongerBuitenWinter 'wegtrekken' ook als
  // er buiten de winter geen eten genoeg is.
  function pasVertrekToe(S, b, dag) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    if (dag <= 0 || dag % T.GEBOUWEN_INSTELLINGEN.gezinDagen !== 0) return;
    if (S.bevolking <= 0) return;
    const honger = IN.hongerBuitenWinter === 'wegtrekken' && !b.inWinter && b.voedselDekking < 1;
    if (b.tevredenheid >= IN.vertrekDrempel && !honger) return;
    const verlies = Math.min(S.bevolking, T.GEBOUWEN_INSTELLINGEN.gezinGrootte);
    const waarom = honger ? 'er is geen eten' : 'het dorp is niet tevreden genoeg';
    // Met bewoners zegt het bericht wie het zijn en lopen ze de weg af (js/bewoners.js).
    T.wijzigBevolking(S, -verlies, 'vertrek', waarom);
    if (!S.bewoners && T.ui && T.ui.bericht) T.ui.bericht(`Een gezin trekt weg: ${waarom}. (-${verlies})`, 'gevaar');
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
  function groeiGebouw(S, instantie, soort) {
    const nieuweSoort = T.GEBOUWEN[soort.wordt];
    if (!nieuweSoort) return false;
    const w = S.wereld;
    // Ook een huis dat doorgroeit, krijgt een van de tekeningen van zijn nieuwe soort
    // (T.volgendeTekening, js/gebouwen.js).
    const tekening = T.volgendeTekening(S, soort.wordt);
    const oudeVoet = instantie.voet || T.gebouwVoet(instantie.soort, instantie.tekening) || { b: 1, h: 1 };
    const nieuweVoet = T.gebouwVoet(soort.wordt, tekening) || oudeVoet;
    const inOud = (dx, dy) => dx < oudeVoet.b && dy < oudeVoet.h;
    const inNieuw = (dx, dy) => dx < nieuweVoet.b && dy < nieuweVoet.h;
    for (let dy = 0; dy < nieuweVoet.h; dy++) {
      for (let dx = 0; dx < nieuweVoet.b; dx++) {
        if (inOud(dx, dy)) continue; // eigen grond: was toch al van dit huis
        if (T.isVast(w, instantie.x + dx, instantie.y + dy)) return false; // geen ruimte: morgen weer
      }
    }
    const oudeNaam = soort.naam;
    T.neemTekening(S, soort.wordt);
    instantie.soort = soort.wordt;
    instantie.tekening = tekening;
    instantie.voet = nieuweVoet;
    instantie.groeiDagen = 0;
    const opz = tekening && T.opzoekTegelNaam(tekening);
    const naam = 'gebouw:' + soort.wordt;
    T.registreerGebouwSoort(naam);
    instantie.voorwerp.soort = naam;
    instantie.voorwerp.vel = opz ? opz.vel : null;
    instantie.voorwerp.id = opz ? opz.id : null;
    instantie.voorwerp.beslaat = [nieuweVoet.b, nieuweVoet.h];
    instantie.voorwerp.tekeningNaam = tekening ? tekening.split('/').pop() : null;
    for (let dy = 0; dy < nieuweVoet.h; dy++) {
      for (let dx = 0; dx < nieuweVoet.b; dx++) {
        const yy = instantie.y + dy;
        const xx = instantie.x + dx;
        if (w.tegels[yy] && w.tegels[yy][xx] !== undefined) w.tegels[yy][xx] = 'muur';
      }
    }
    for (let dy = 0; dy < oudeVoet.h; dy++) {
      for (let dx = 0; dx < oudeVoet.b; dx++) {
        if (inNieuw(dx, dy)) continue; // blijft vast: hoort nu bij de nieuwe voet
        const yy = instantie.y + dy;
        const xx = instantie.x + dx;
        if (w.tegels[yy] && w.tegels[yy][xx] !== undefined) w.tegels[yy][xx] = 'vloer';
      }
    }
    // Rijker ogen is niet alleen voor de speler: het is ook wat de heer straks ziet
    // (ontwerp/werklijst.md, punt 6, "Rijk worden en arm lijken" — de argwaan van de inner stijgt
    // als wat hij ziet niet bij het rekenboek past). Een dorp vol stenen huizen wekt dus andere
    // verwachtingen dan een dorp vol hutten; dat is nu nog geen regel, alleen deze opmerking.
    if (T.ui && T.ui.bericht) T.ui.bericht(`Een ${oudeNaam} is gegroeid tot een ${nieuweSoort.naam}.`, 'goed');
    return true;
  }

  function pasHuisGroeiToe(S, b) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const tevredenGenoeg = b.tevredenheid >= IN.huisGroeiDrempel;
    for (const instantie of S.gebouwen) {
      const soort = T.GEBOUWEN[instantie.soort];
      // Alleen gebouwen die de speler zelf neerzette groeien mee: wat al op de kaart stond
      // (T.zetBestaandeGebouwen, js/gebouwen.js) heeft geen eigen voorwerp om de tekening op te
      // wisselen, en blijft dus zoals het getekend is.
      if (!instantie.klaar || !instantie.voorwerp || !soort || !soort.wordt) continue;
      instantie.groeiDagen = tevredenGenoeg ? (instantie.groeiDagen || 0) + 1 : 0;
      if (instantie.groeiDagen >= IN.huisGroeiDagen) groeiGebouw(S, instantie, soort);
    }
  }

  // Eten, één dag (Marcel koos op 25 sep; ontwerp/spel.md, "Weides met koeien en schapen"): het
  // dorp eet eerst de melk van vandaag (js/vee.js, S.vee.melk), dan graan, en pas als het graan op
  // is kaas. Wat er van de melk over is, wordt kaas (T.VEE_INSTELLINGEN.melkNaarKaas), want melk
  // houdt niet en kaas wel. Zo helpt het vee tegen de honger in het voorjaar: de melk begint in
  // grasmaand, als het graan van vorig jaar opraakt, en de kaas van vorige zomer is er dan nog.
  // Alles in graan gerekend. T.tikGebouwenDag (js/gebouwen.js, stap 3) roept dit aan.
  // Geeft { nodig, melk, graan, kaas, kaasErbij, tekort }: wat er van elk gegeten is.
  // Sinds 25 sep telt ook vlees (vleesIsEten): wat het zout niet goed houdt, eet het dorp na de melk en
  // vóór het graan, want dat bederft anders toch; gezouten vlees pas als het graan en de kaas op zijn.
  // Geeft ook `vlees`: wat er van het vlees gegeten is (in vlees, niet in graan).
  T.eetVandaag = function (S) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const nodig = (S.bevolking || 0) * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
    const v = S.voorraad;
    const melkVandaag = (S.vee && S.vee.melk) || 0;
    const melk = Math.min(nodig, melkVandaag);
    const perVlees = IN.vleesIsEten ? IN.vleesAlsGraan || 0 : 0;
    const vleesNu = perVlees > 0 ? v.vlees || 0 : 0;
    const d = vleesNu > 0 ? T.zoutDekking(S) : null;
    const ongezouten = d && d.totaal > 0 ? vleesNu * (d.onbeschermd / d.totaal) : vleesNu;
    const vers = perVlees > 0 ? Math.max(0, Math.min((nodig - melk) / perVlees, ongezouten)) : 0;
    const graan = Math.max(0, Math.min(nodig - melk - vers * perVlees, v.graan || 0));
    const kaas = Math.max(0, Math.min(nodig - melk - vers * perVlees - graan, v.kaas || 0));
    const rest = nodig - melk - vers * perVlees - graan - kaas;
    const gezouten = perVlees > 0 ? Math.max(0, Math.min(rest / perVlees, vleesNu - vers)) : 0;
    const vlees = vers + gezouten;
    if (graan > 0) T.wijzigVoorraad(S, 'graan', -graan);
    if (kaas > 0) T.wijzigVoorraad(S, 'kaas', -kaas);
    if (vlees > 0) T.wijzigVoorraad(S, 'vlees', -vlees);
    // Wie gezouten vlees eet, eet het zout mee op, net als in pasBederfToe hieronder.
    if (gezouten > 0 && (v.zout || 0) > 0) T.wijzigVoorraad(S, 'zout', -Math.min(v.zout, gezouten / IN.zoutHoudtGoed));
    const kaasErbij = (melkVandaag - melk) * (T.VEE_INSTELLINGEN ? T.VEE_INSTELLINGEN.melkNaarKaas : 0);
    if (kaasErbij > 0) T.wijzigVoorraad(S, 'kaas', kaasErbij);
    if (S.vee) S.vee.melk = 0;
    return { nodig, melk, vlees, graan, kaas, kaasErbij, tekort: Math.max(0, rest - gezouten * perVlees) };
  };

  // Hoeveel het vlees in de voorraad het dorp nog voedt, in graan (0 als vlees geen eten is): voor
  // het venster van de heer (js/heer.js, T.heerVooruitzicht).
  T.vleesAlsEten = function (S) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    return IN.vleesIsEten ? ((S.voorraad && S.voorraad.vlees) || 0) * (IN.vleesAlsGraan || 0) : 0;
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

  const dagenTekst = (n) => (n === 1 ? 'één dag' : `${n} dagen`);
  const MAANDEN_TEKST = ['', 'een maand', 'twee maanden', 'drie maanden', 'vier maanden', 'vijf maanden', 'zes maanden'];

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

  // Raakt het op binnen `binnen` dagen, en haalt het de winter niet? Dan de zin die het dorp zegt: "Het
  // hout is over 12 dagen op, en de winter duurt nog 40 dagen." Anders null. Voor het hout en het eten
  // (hieronder) en het hooi (js/vee.js); wie hem zegt, zegt hem één keer per winter.
  T.raaktOp = function (wat, v, binnen) {
    if (v.haalt || v.dagen > binnen) return null;
    const op = v.dagen < 1 ? 'op' : `over ${dagenTekst(v.dagen)} op`;
    return `${T.hoofdletter(wat)} is ${op}, en de winter duurt nog ${dagenTekst(v.winter)}.`;
  };

  // Wat er per dag aan brandhout bijkomt: wat de werkplaatsen de laatste dag maakten (g.werkte,
  // js/gebouwen.js, stap 6), min wat ze ervan gebruikten. In het gehucht hakt alleen de houthakker.
  T.brandhoutErbij = function (S) {
    let erbij = 0;
    for (const g of S.gebouwen || []) {
      const m = T.GEBOUWEN[g.soort].maakt;
      if (!m || !g.werkte) continue;
      for (const wat of BRANDHOUT) erbij += (((m.uit && m.uit[wat]) || 0) - ((m.in && m.in[wat]) || 0)) * g.werkte;
    }
    return erbij;
  };

  // Of het hout de winter haalt: wat er ligt, en wat er per dag bijkomt, tegen wat het dorp in de
  // winter stookt. Vanaf `dag`, met die dag. Geeft wat T.haaltDeWinter geeft, en `tot` (dagen tot de
  // winter, 0 in de winter zelf), `stook` (per winterdag) en `erbij` (per dag).
  T.houtVoorDeWinter = function (S, dag) {
    const { tot, duur } = T.periodeVanaf(dag, isWinter);
    const stook = huishoudensVan(S) * T.BEHOEFTEN_INSTELLINGEN.brandhoutPerHuishoudenPerDag;
    const erbij = T.brandhoutErbij(S);
    const v = T.haaltDeWinter({ voorraad: brandhoutVan(S), voorWinter: erbij * tot, perWinterdag: stook - erbij, winter: duur });
    return Object.assign(v, { tot, stook, erbij });
  };

  // Of het eten de winter haalt: het graan, de kaas en het vlees (als dat een maag vult), met de melk
  // die de koeien nog geven (js/vee.js), tegen wat het dorp eet, het hele jaar door, en de soldaten van
  // de heer zolang ze er zijn (js/heer.js). Alles in graan, zoals het dorp eet (T.eetVandaag). Vanaf
  // `dag`, met die dag. Geeft wat T.haaltDeWinter geeft, en `tot` en `eet` (per dag).
  T.etenVoorDeWinter = function (S, dag) {
    const { tot, duur } = T.periodeVanaf(dag, isWinter);
    const v = S.voorraad || {};
    const eet = (S.bevolking || 0) * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag + T.soldatenEten(S, dag);
    const van = Math.floor(dag);
    const melkVoor = T.verwachteMelk(S, van, van + tot);
    const melkIn = duur > 0 ? T.verwachteMelk(S, van + tot, van + tot + duur) / duur : 0;
    const r = T.haaltDeWinter({
      voorraad: (v.graan || 0) + (v.kaas || 0) + T.vleesAlsEten(S),
      voorWinter: melkVoor - eet * tot,
      perWinterdag: eet - melkIn,
      winter: duur,
    });
    return Object.assign(r, { tot, eet });
  };

  // Wat helpt als het hout de winter niet haalt: een houthakker, of nog een.
  function houtHelpt(S) {
    const per = T.GEBOUWEN.houthakker.maakt.uit.hout;
    return (S.gebouwen || []).some((g) => g.soort === 'houthakker')
      ? `nog een houthakker hakt er ${per} per dag bij`
      : `een houthakker hakt ${per} hout per dag`;
  }

  // En als het eten de winter niet haalt: de oogst is binnen, maar een jager schiet vlees, als dat een
  // maag vult.
  function etenHelpt() {
    if (!T.BEHOEFTEN_INSTELLINGEN.vleesIsEten) return '';
    return `: een jager schiet ${T.GEBOUWEN.jager.maakt.uit.vlees} vlees per dag, en vlees vult een maag`;
  }

  // Het bericht vooraf: "Over een maand is het winter. Het hout haalt 38 van de 90 dagen: een
  // houthakker hakt 2 hout per dag. Het eten haalt de winter."
  function zegDeWinterVooraf(S, dag) {
    const hout = T.houtVoorDeWinter(S, dag);
    const eten = T.etenVoorDeWinter(S, dag);
    const wanneer = hout.tot > 0 ? `Over ${MAANDEN_TEKST[hout.tot / T.DAGEN_PER_MAAND] || dagenTekst(hout.tot)} is het winter.` : 'Het is winter.';
    const zinnen = [wanneer];
    if (hout.haalt && eten.haalt) zinnen.push('Het hout en het eten halen de winter.');
    else {
      zinnen.push(hout.haalt ? 'Het hout haalt de winter.' : `Het hout haalt ${hout.dagen} van de ${hout.winter} dagen: ${houtHelpt(S)}.`);
      zinnen.push(eten.haalt ? 'Het eten haalt de winter.' : `Het eten haalt ${eten.dagen} van de ${eten.winter} dagen${etenHelpt()}.`);
    }
    bericht(zinnen.join(' '), hout.haalt && eten.haalt ? 'goed' : 'gevaar');
  }

  // Wat het dorp over de winter zegt, één keer per dag (T.tikBehoeftenDag, vóór het stoken en het eten
  // van vandaag, want de dagen tellen met vandaag): op de dagen van winterVooraf het bericht vooraf, en
  // in de winter één keer wanneer het hout of het eten op is.
  function zegDeWinter(S, dag) {
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const B = S.behoeften;
    if (!(S.bevolking > 0)) return;
    const d = T.datumVanDag(dag);
    if (IN.winterVooraf.some((w) => w.maand === T.MAANDEN[d.maand].naam && w.dag === d.dagVanMaand)) zegDeWinterVooraf(S, dag);
    if (!isWinter(dag)) {
      B.gezegd = {}; // een nieuwe winter mag weer waarschuwen
      return;
    }
    const gezegd = B.gezegd || (B.gezegd = {});
    const nu = { 'het hout': T.houtVoorDeWinter(S, dag), 'het eten': T.etenVoorDeWinter(S, dag) };
    for (const wat in nu) {
      const tekst = !gezegd[wat] && T.raaktOp(wat, nu[wat], IN.opraakWaarschuwing);
      if (!tekst) continue;
      gezegd[wat] = true;
      bericht(tekst, 'gevaar');
    }
  }

  // Eén dag bijwerken: wordt aangeroepen vanuit T.tikGebouwenDag (js/gebouwen.js, stap 0), dus
  // één keer per verstreken kalenderdag, vóór woonruimte/eten/groei/handen/productie van die dag.
  // Losstaand aanroepbaar (net als T.tikGebouwenDag zelf), zodat een toets ook één dag in één keer
  // kan proberen. In het oude spel (De laatste klim) blijft S.bevolking altijd 0: dan is
  // T.berekenTevredenheid hierboven een paar sommen met nul, verandert er niets aan de bevolking
  // (die guards hierboven allemaal op S.bevolking > 0), en is dit bestand dus een stille no-op.
  T.tikBehoeftenDag = function (S, dag) {
    if (!S.behoeften) S.behoeften = T.nieuweBehoeften();
    const IN = T.BEHOEFTEN_INSTELLINGEN;
    const b = T.berekenTevredenheid(S, dag);
    S.behoeften.tevredenheid = b.tevredenheid;
    S.behoeften.mist = b.mist;
    S.behoeften.last = b.last;
    S.behoeften.gezelligheid = b.gezelligheid;

    // Of het hout en het eten de winter halen, vóór het stoken en het eten van vandaag.
    zegDeWinter(S, dag);

    // De extra soorten worden ook echt opgegeten, anders stapelt de moestuin zich oneindig op.
    let bederfelijkGegeten = 0;
    for (const wat of b.extraSoorten) {
      const hoeveel = Math.min(S.voorraad[wat] || 0, (S.bevolking || 0) * IN.extraVoedselPerMensPerDag);
      T.wijzigVoorraad(S, wat, -hoeveel);
      if (IN.bederfelijk.includes(wat)) bederfelijkGegeten += hoeveel;
    }

    pasBederfToe(S, bederfelijkGegeten);
    pasBrandhoutToe(S, b);
    pasWinterVerliesToe(S, b);
    pasVertrekToe(S, b, dag);
    pasHuisGroeiToe(S, b);

    if (T.ui && T.ui.toonTevredenheid) T.ui.toonTevredenheid(S);
  };
})(globalThis.Spel = globalThis.Spel || {});
