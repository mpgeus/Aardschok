// De behoeften van het dorp: eten, brandhout in de winter en een kerk, en de tevredenheid die
// daaruit volgt — als regels zonder scherm (net als js/akkers.js), dus te toetsen in
// test/behoeften.test.cjs. Zie ontwerp/werklijst.md, punt 3 ("Behoeften en de winter") en
// ontwerp/spel.md, "Het dorp in leven houden". Alleen voor het nieuwe spel (?kaart=gehucht); in
// het oude spel blijft S.bevolking altijd 0, dus blijft dit hele bestand een stille no-op (zie
// de opmerking bij T.tikBehoeftenDag hieronder).
//
// T.tikGebouwenDag (js/gebouwen.js) roept T.tikBehoeftenDag hier als eerste stap aan, één keer
// per verstreken kalenderdag. Wat hier per dag gebeurt:
//   1. Eten: graan is de basis en blijft precies zoals het was (T.GEBOUWEN_INSTELLINGEN.eten-
//      PerMensPerDag trekt het af, in gebouwen.js) — hier alleen kijken of het genoeg is, en of er
//      ook groente, vis of vlees is. Meer soorten maakt tevredener, en wordt ook echt opgegeten.
//      Vis en vlees bederven, tenzij ze gezouten zijn (pasBederfToe; zout komt van de marskramer).
//   2. Brandhout: hout of turf, per huishouden per dag, maar alleen gestookt in de winter.
//   3. Een kerk: heeft het dorp een klare kapel (T.GEBOUWEN.kapel.kerk)?
//   4. Daaruit volgt S.behoeften.tevredenheid (0..1) en S.behoeften.mist (wat het dorp mist, voor
//      de balk, js/hud.js).
//   5. Wat tevredenheid doet: hoe hard er gewerkt wordt (js/gebouwen.js, stap 6), of er een gezin
//      bijkomt (js/gebouwen.js, stap 4) of juist wegtrekt (hieronder), en of een huis doorgroeit.
//   6. De winter: een tekort aan brandhout of eten kost mensen — geen apart scherm, alleen een
//      melding en de bevolking die zakt.
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
  };

  T.nieuweBehoeften = function () {
    return { tevredenheid: 1, mist: [], last: [], winterVerliesRest: 0 };
  };

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

    const voedselBenodigd = bevolking * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
    const voedselDekking = voedselBenodigd > 0 ? Math.min(1, (v.graan || 0) / voedselBenodigd) : 1;
    const extraSoorten = ['groente', 'vis', 'vlees'].filter((wat) => (v[wat] || 0) >= IN.extraVoedselDrempel);
    const voedselFactor = voedselDekking * (0.5 + 0.5 * (extraSoorten.length / 3));

    const huishoudens = Math.ceil(bevolking / T.GEBOUWEN_INSTELLINGEN.gezinGrootte);
    const brandhoutBenodigd = huishoudens * IN.brandhoutPerHuishoudenPerDag;
    const brandhoutVoorraad = (v.turf || 0) + (v.hout || 0);
    const brandhoutDekking = brandhoutBenodigd > 0 ? Math.min(1, brandhoutVoorraad / brandhoutBenodigd) : 1;
    // Geen straf buiten de winter (niemand stookt in de zomer), maar T.tikBehoeftenDag laat het
    // gemis in S.behoeften.mist wél altijd zien — dat is nu juist het plannen vóór de winter.
    const brandhoutFactor = inWinter ? brandhoutDekking : 1;

    const heeftKerk = T.heeftKerk(S);
    const kerkFactor = heeftKerk ? 1 : IN.kerkBasis;

    // Wat de heer bracht (js/heer.js): soldaten in huis, en wie jij aan de schandpaal zette. Dat
    // mist het dorp niet, daar heeft het last van; het gaat eraf, tot niet onder nul.
    const heer = T.heerOntevredenheid ? T.heerOntevredenheid(S, dag) : { minder: 0, waarom: [] };

    const tevredenheid = Math.max(0, IN.gewichtEten * voedselFactor + IN.gewichtBrandhout * brandhoutFactor + IN.gewichtKerk * kerkFactor - heer.minder);

    const mist = [];
    if (voedselDekking < 1) mist.push('eten');
    if (brandhoutDekking < 1) mist.push('brandhout voor de winter');
    if (!heeftKerk) mist.push('een kerk');

    return {
      tevredenheid, mist, last: heer.waarom, inWinter,
      voedselDekking, extraSoorten, voedselFactor,
      brandhoutDekking, brandhoutBenodigd, brandhoutVoorraad, brandhoutFactor,
      huishoudens, heeftKerk, kerkFactor,
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
    S.bevolking = Math.max(0, S.bevolking - verlies);
    if (T.ui && T.ui.bericht) {
      const wat = b.inWinter ? 'De winter is hard' : 'De honger is hard';
      T.ui.bericht(
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
    S.bevolking -= verlies;
    if (T.ui && T.ui.bericht) {
      T.ui.bericht(honger ? `Een gezin trekt weg: er is geen eten. (-${verlies})` : `Een gezin trekt weg: het dorp is niet tevreden genoeg. (-${verlies})`, 'gevaar');
    }
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
    const oudeVoet = T.gebouwVoet(instantie.soort) || { b: 1, h: 1 };
    const nieuweVoet = T.gebouwVoet(soort.wordt) || oudeVoet;
    const inOud = (dx, dy) => dx < oudeVoet.b && dy < oudeVoet.h;
    const inNieuw = (dx, dy) => dx < nieuweVoet.b && dy < nieuweVoet.h;
    for (let dy = 0; dy < nieuweVoet.h; dy++) {
      for (let dx = 0; dx < nieuweVoet.b; dx++) {
        if (inOud(dx, dy)) continue; // eigen grond: was toch al van dit huis
        if (T.isVast(w, instantie.x + dx, instantie.y + dy)) return false; // geen ruimte: morgen weer
      }
    }
    const oudeNaam = soort.naam;
    instantie.soort = soort.wordt;
    instantie.groeiDagen = 0;
    const opz = nieuweSoort.tekening && T.opzoekTegelNaam ? T.opzoekTegelNaam(nieuweSoort.tekening) : null;
    const naam = 'gebouw:' + soort.wordt;
    T.registreerGebouwSoort(naam);
    instantie.voorwerp.soort = naam;
    instantie.voorwerp.vel = opz ? opz.vel : null;
    instantie.voorwerp.id = opz ? opz.id : null;
    instantie.voorwerp.beslaat = [nieuweVoet.b, nieuweVoet.h];
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
})(globalThis.Toren = globalThis.Toren || {});
