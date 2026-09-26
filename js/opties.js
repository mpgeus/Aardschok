// De spelregels: wat de speler zelf instelt, en Marcel om te proberen, op één plek (Marcel, 24 sep
// 2026: "Dit moeten allemaal opties worden die instelbaar zijn"; ontwerp/spel.md, "Instelbaar").
// Drie soorten:
//   - T.OPTIES: ontwerpvragen met meer dan één goed antwoord, als keuzes. Een keuze zet alleen
//     waarden in de instellingenblokken die er al zijn (T.HEER_INSTELLINGEN, …), zodat elk getal
//     één plek houdt. De standaard is wat Marcel koos, en dat zijn ook de waarden in de bestanden
//     zelf (test/opties.test.cjs bewaakt dat).
//   - T.NAAM_OPTIES: de namen van de heer en de vijf boeren.
//   - T.WERKBANK: alle getallen uit de instellingenblokken, elk apart te verzetten. Wat je daar
//     zet, gaat vóór wat een keuze zet.
// T.pasOptiesToe zet eerst alles terug op de bestanden, dan de keuzes, dan de werkbank, dan de
// namen. De browser onthoudt wat je instelt (localStorage). Het venster staat in js/hud.js
// (T.ui.openSpelregels). Dit bestand komt ná alle regels en gesprekken (index.html), want het
// neemt hun waarden als standaard. Het gereedschap laadt het bewust niet: een naam die je in het
// spel geeft, mag nooit via de gespreksschrijver in js/gesprekken.js terechtkomen.
(function (T) {
  'use strict';

  // De straffen van "hij telt slecht" (de standaard, zoals in js/heer.js) en "hij telt precies".
  const TELT_SLECHT = [
    { vanaf: 0.9, straf: null },
    { vanaf: 2 / 3, straf: 'boete' },
    { vanaf: 0.5, straf: 'soldaten' },
    { vanaf: 0, straf: 'schandpaal' },
  ];
  const TELT_PRECIES = [
    { vanaf: 1, straf: null },
    { vanaf: 2 / 3, straf: 'boete' },
    { vanaf: 1 / 3, straf: 'soldaten' },
    { vanaf: 0, straf: 'schandpaal' },
  ];

  // ── Vorm van één optie ──
  //   { id, naam, uitleg, standaard: '<keuze-id>', keuzes: [{ id, naam, uitleg, zet: { pad: waarde } }] }
  // Een pad wijst in T: 'GRAAN_PER_TEGEL', of 'HEER_INSTELLINGEN.betalenIn'.
  T.OPTIES = [
    {
      id: 'graan', naam: 'Graan', standaard: 'honger',
      uitleg: 'Hoe krap een gewoon jaar is als je de heer alles in graan geeft.',
      keuzes: [
        { id: 'ruim', naam: 'Ruim', zet: { GRAAN_PER_TEGEL: 5 },
          uitleg: 'Wie alles betaalt, houdt genoeg over om te groeien. Een akkertegel geeft 5 graan.' },
        { id: 'netRond', naam: 'Net rond', zet: { GRAAN_PER_TEGEL: 4 },
          uitleg: 'Wie alles betaalt, komt het jaar door met een klein overschot, maar groeit niet. Een akkertegel geeft 4 graan.' },
        { id: 'honger', naam: 'Honger', zet: { GRAAN_PER_TEGEL: 3.5 },
          uitleg: 'Wie alles betaalt, komt elk jaar graan tekort: de heer bedriegen is nood. Een akkertegel geeft 3,5 graan.' },
      ],
    },
    {
      id: 'betalenIn', naam: 'Waarin de heer betaald wil worden', standaard: 'watHijZiet',
      uitleg: 'Wat hij op Sint-Maarten vraagt voor wat hij ziet. Goud neemt hij altijd, ook in de plaats van iets anders.',
      keuzes: [
        { id: 'watHijZiet', naam: 'Naar wat hij ziet', zet: { 'HEER_INSTELLINGEN.betalenIn': 'watHijZiet' },
          uitleg: 'Graan voor de akkers, wol voor schapen, eieren voor kippen, hout voor zijn bos, en de rest in goud.' },
        { id: 'graanEnGoud', naam: 'Graan en goud', zet: { 'HEER_INSTELLINGEN.betalenIn': 'graanEnGoud' },
          uitleg: 'De pacht in graan, en al het andere omgerekend naar goud.' },
        { id: 'alleenGoud', naam: 'Alleen goud', zet: { 'HEER_INSTELLINGEN.betalenIn': 'alleenGoud' },
          uitleg: 'Alles in goud, ook de pacht. Dan moet je eerst verkopen aan de marskramer.' },
      ],
    },
    {
      id: 'telt', naam: 'Hoe de heer telt', standaard: 'slecht',
      uitleg: 'Wat hij doet als je hem te weinig geeft.',
      keuzes: [
        {
          id: 'slecht', naam: 'Slecht',
          zet: { 'HEER_INSTELLINGEN.telWijze': 'hoeveel', 'HEER_INSTELLINGEN.straffen': TELT_SLECHT, 'HEER_INSTELLINGEN.veelTeWeinig': 0.5, 'HEER_INSTELLINGEN.ambtKwijtNa': 2 },
          uitleg: 'Tot een tiende te weinig merkt hij niet. Tot twee derde een boete, tot de helft ook soldaten, minder ook de schandpaal. Twee keer achter elkaar minder dan de helft: je ambt kwijt.',
        },
        {
          id: 'precies', naam: 'Precies',
          zet: { 'HEER_INSTELLINGEN.telWijze': 'hoeveel', 'HEER_INSTELLINGEN.straffen': TELT_PRECIES, 'HEER_INSTELLINGEN.veelTeWeinig': 1 / 3, 'HEER_INSTELLINGEN.ambtKwijtNa': 2 },
          uitleg: 'Elk tekort telt. Tot een derde te weinig een boete, tot twee derde ook soldaten, meer ook de schandpaal. Twee keer achter elkaar meer dan twee derde te weinig: je ambt kwijt.',
        },
        {
          id: 'steedsZwaarder', naam: 'Steeds zwaarder',
          zet: { 'HEER_INSTELLINGEN.telWijze': 'hoeVaak', 'HEER_INSTELLINGEN.ambtKwijtNa': 4 },
          uitleg: 'Niet hoeveel telt, maar hoe vaak achter elkaar: de eerste keer een boete, de tweede ook soldaten, de derde ook de schandpaal, de vierde je ambt.',
        },
      ],
    },
    {
      id: 'schoutAanDePaal', naam: 'De schout aan de schandpaal', standaard: 'mag',
      uitleg: 'Of je jezelf mag aanwijzen als er iemand aan de schandpaal moet.',
      keuzes: [
        { id: 'mag', naam: 'Mag', zet: { 'HEER_INSTELLINGEN.schoutMagZelf': true },
          uitleg: 'Het dorp neemt het je dan niet kwalijk, maar de heer vindt het lachwekkend en verhoogt de boete.' },
        { id: 'magNiet', naam: 'Mag niet', zet: { 'HEER_INSTELLINGEN.schoutMagZelf': false },
          uitleg: 'Je wijst altijd een ander aan. Het blijft vuil werk.' },
      ],
    },
    {
      id: 'boeren', naam: 'Wie de boeren zijn', standaard: 'geloot',
      uitleg: 'Hun karakter en wat ze kunnen: hoe snel ze maaien, hoeveel hun akker geeft, hoe zuinig ze zaaien, en hoe het dorp ze ziet.',
      keuzes: [
        { id: 'geloot', naam: 'Geloot', zet: { 'BOEREN_INSTELLINGEN.loten': true },
          uitleg: 'Bij elk nieuw spel anders: de een maait sneller dan de ander, en wie de weduwe is, weet je vooraf niet.' },
        { id: 'vast', naam: 'Vast', zet: { 'BOEREN_INSTELLINGEN.loten': false },
          uitleg: 'Zoals ze eerst geschreven waren (Klaas zingt, Aaltje is weduwe, …), en allemaal even goed.' },
      ],
    },
    {
      id: 'rekening', naam: 'Waar de heer de rekening op maakt', standaard: 'inner',
      uitleg: 'Of het uitmaakt wat zijn inner in oogstmaand zag.',
      keuzes: [
        { id: 'inner', naam: 'Wat de inner zag', zet: { 'HEER_INSTELLINGEN.rekening': 'rapport' },
          uitleg: 'Zijn rapport is de rekening: wat hij niet zag, betaal je dat jaar niet. Maar klopt wat hij ziet niet, dan groeit zijn argwaan.' },
        { id: 'alles', naam: 'Alles, zonder inner', zet: { 'HEER_INSTELLINGEN.rekening': 'alles' },
          uitleg: 'Er komt geen inner, en de heer ziet alles zelf. Arm lijken kan dan niet.' },
      ],
    },
    {
      id: 'graanVoorDeHeer', naam: 'Wat de heer van het graan vraagt', standaard: 'deel',
      uitleg: 'Het graan op zijn rekening.',
      keuzes: [
        { id: 'deel', naam: 'Een deel van wat hij telde', zet: { 'HEER_INSTELLINGEN.graan': 'deel' },
          uitleg: 'Een deel van het graan dat de inner zag, in de schuren en nog op de velden. Wie graan wegzet voor hij komt, betaalt minder.' },
        { id: 'pacht', naam: 'Pacht per akker', zet: { 'HEER_INSTELLINGEN.graan': 'pacht' },
          uitleg: 'Een vast deel per akkertegel die hij zag, hoe de oogst ook uitviel.' },
      ],
    },
    {
      id: 'hongerBuitenWinter', naam: 'Honger buiten de winter', standaard: 'tevredenheid',
      uitleg: 'Wat er gebeurt als het graan op is in de lente, de zomer of de herfst. In de winter kost honger altijd mensen.',
      keuzes: [
        { id: 'tevredenheid', naam: 'Alleen ontevreden', zet: { 'BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter': 'tevredenheid' },
          uitleg: 'Wie honger heeft, werkt minder hard en krijgt geen kinderen, maar niemand gaat weg of sterft.' },
        { id: 'wegtrekken', naam: 'Gezinnen trekken weg', zet: { 'BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter': 'wegtrekken' },
          uitleg: 'Zolang er geen eten genoeg is, trekt om de twintig dagen een gezin weg.' },
        { id: 'sterven', naam: 'Mensen sterven', zet: { 'BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter': 'sterven' },
          uitleg: 'Net als in de winter kost honger mensen, het hele jaar door.' },
      ],
    },
    // De weides (Marcel, 25 sep; ontwerp/spel.md, "Weides met koeien en schapen"): wat hij niet
    // koos, wordt een keuze. "Vee alleen kopen" komt erbij met stap 3, als de marskramer vee
    // verkoopt.
    {
      id: 'vruchtbaarheid', naam: 'Vruchtbaarheid', standaard: 'putUit',
      uitleg: 'Of een akker het land uitput, zodat je velden moet laten rusten.',
      keuzes: [
        { id: 'putUit', naam: 'Het land put uit', zet: { 'VELDEN_INSTELLINGEN.vruchtbaarheid': true },
          uitleg: 'Een akker geeft elk jaar wat minder. Een braak rust, en een weide met vee maakt het land sneller weer vruchtbaar.' },
        { id: 'blijftGoed', naam: 'Het land blijft goed', zet: { 'VELDEN_INSTELLINGEN.vruchtbaarheid': false },
          uitleg: 'Een akker geeft elk jaar zijn volle graan, hoe vaak hij ook akker was. Een weide is dan alleen voor het vee.' },
      ],
    },
    {
      id: 'veeGroeit', naam: 'Het vee', standaard: 'groeit',
      uitleg: 'Of de kudde vanzelf groter wordt.',
      keuzes: [
        { id: 'groeit', naam: 'Groeit in de lente', zet: { 'VEE_INSTELLINGEN.groeit': true },
          uitleg: 'In grasmaand werpen koeien kalveren en schapen lammeren, zolang er plaats is op hun weide.' },
        { id: 'groeitNiet', naam: 'Groeit niet', zet: { 'VEE_INSTELLINGEN.groeit': false },
          uitleg: 'Er komen geen jongen bij: de kudde blijft zo groot als hij begon.' },
      ],
    },
    // Stap 2 van de weides (Marcel, 25 sep; spel.md, "Marcel koos voor stap 2").
    {
      id: 'winterzorg', naam: 'Het vee in de winter', standaard: 'hooi',
      uitleg: 'Of het vee in de winter hooi nodig heeft: dat beslist hoeveel vee je houdt.',
      keuzes: [
        { id: 'hooi', naam: 'Eet hooi', zet: { 'VEE_INSTELLINGEN.winterzorg': true },
          uitleg: 'In hooimaand maaien de boeren hun weide. Van slachtmaand tot en met lentemaand eet het vee dat hooi, en wat het hooi niet de winter door helpt, slacht je of sterft.' },
        { id: 'geenZorg', naam: 'Graast het hele jaar', zet: { 'VEE_INSTELLINGEN.winterzorg': false },
          uitleg: 'Geen hooi en geen honger: een koe kost alleen haar plaats op de weide, en slachten doe je alleen voor het vlees.' },
      ],
    },
    {
      id: 'schapenHooi', naam: 'Wat de schapen \'s winters eten', standaard: 'heide',
      uitleg: 'De schapen grazen op de heide. Eten ze daar ook in de winter, of eten ze hooi?',
      keuzes: [
        { id: 'heide', naam: 'Heide', zet: { 'VEE_INSTELLINGEN.hooiPerDag.schaap': 0 },
          uitleg: 'Ze eten het hele jaar heide, zoals in de Drentse esdorpen: een schaap kost geen hooi.' },
        { id: 'ookHooi', naam: 'Ook hooi', zet: { 'VEE_INSTELLINGEN.hooiPerDag.schaap': 0.2 },
          uitleg: 'In de winter eet een schaap een vijfde van wat een koe eet. Het hooi wordt krapper.' },
      ],
    },
    {
      id: 'mest', naam: 'De mest uit de schaapskooi', standaard: 'perVeld',
      uitleg: 'Waar de mest heen gaat die de schapen in de kooi maken.',
      keuzes: [
        { id: 'perVeld', naam: 'Jij kiest per veld', zet: { 'VELDEN_INSTELLINGEN.mestVanzelf': false },
          uitleg: 'In het veldenvenster leg je hem op een akker. Een akker met genoeg mest kan elk jaar akker blijven.' },
        { id: 'vanzelf', naam: 'Vanzelf over alle akkers', zet: { 'VELDEN_INSTELLINGEN.mestVanzelf': true },
          uitleg: 'Op 1 lentemaand gaat alle mest naar verhouding over de akkers van dat jaar. Je hoeft niets te doen.' },
      ],
    },
    // Marcel, 25 sep (een vraag uit de proef van stap 2 van de weides): "Ja vlees moet ook eten zijn."
    {
      id: 'vlees', naam: 'Vlees', standaard: 'eten',
      uitleg: 'Of vlees ook eten is, zodat slachten in slachtmaand de winter helpt.',
      keuzes: [
        { id: 'eten', naam: 'Vult een maag', zet: { 'BEHOEFTEN_INSTELLINGEN.vleesIsEten': true },
          uitleg: 'Wat het zout niet goed houdt, eet het dorp eerst op, want het bederft toch. Gezouten vlees bewaart het tot het graan op is.' },
        { id: 'tevredenheid', naam: 'Alleen tevredener', zet: { 'BEHOEFTEN_INSTELLINGEN.vleesIsEten': false },
          uitleg: 'Het dorp eet vlees erbij voor de afwisseling, maar tegen de honger helpt het niet.' },
      ],
    },
    // Stap 2 van de inner, de verstopplekken (Marcel, 25 sep; spel.md, "Marcel koos voor stap 2").
    {
      id: 'sporen', naam: 'Sporen', standaard: 'alles',
      uitleg: 'Wat je verstopt, laat sporen na. Klopt een spoor niet met wat de inner telde, dan groeit zijn argwaan.',
      keuzes: [
        { id: 'alles', naam: 'Alles laat sporen na', zet: { 'INNER_INSTELLINGEN.sporen': 'alles' },
          uitleg: 'Het graan in de schuur tegen de velden die hij zag, en het goud in de kist tegen wat de marskramer hem vertelt dat hij je betaalde.' },
        { id: 'graan', naam: 'Alleen het graan', zet: { 'INNER_INSTELLINGEN.sporen': 'graan' },
          uitleg: 'Alleen het graan in de schuur tegen de velden. Goud verstoppen valt niet op.' },
      ],
    },
    {
      id: 'kist', naam: 'Het goud in de kist', standaard: 'telt',
      uitleg: 'Of de heer ook een deel wil van het goud dat de inner in de dorpskist telt.',
      keuzes: [
        { id: 'telt', naam: 'Hij wil een deel', zet: { 'HEER_INSTELLINGEN.kist': true },
          uitleg: 'De heer ziet alleen geld. Van wat de inner in de kist telt, vraagt hij een deel: zo heeft goud verstoppen zin.' },
        { id: 'teltNiet', naam: 'De kist telt niet', zet: { 'HEER_INSTELLINGEN.kist': false },
          uitleg: 'De heer vraagt naar mensen, gebouwen en graan, niet naar wat er in de kist ligt.' },
      ],
    },
    {
      id: 'bewoners', naam: 'Wie er in een kelder woont', standaard: 'telt',
      uitleg: 'Of het karakter van een boer uitmaakt als je iets in zijn kelder verstopt.',
      keuzes: [
        { id: 'telt', naam: 'Het karakter telt', zet: { 'VERSTOP_INSTELLINGEN.karakters': true },
          uitleg: 'De roddelaar vertelt het rond, de vrome weigert, de woekeraar houdt zijn deel, en de oudste kent een oude plek.' },
        { id: 'teltNiet', naam: 'Elke kelder is gelijk', zet: { 'VERSTOP_INSTELLINGEN.karakters': false },
          uitleg: 'In de kelder van elke boer past evenveel, en de soldaten vinden het er even vaak.' },
      ],
    },
  ];

  // De namen die je zelf geeft (js/mensen.js). De heer heeft standaard geen naam: dan heet hij
  // "de heer", en tekent hij zijn brief zonder naam.
  T.NAAM_OPTIES = ['heer', 'boer1', 'boer2', 'boer3', 'boer4', 'boer5'];

  // De werkbank: alle getallen uit deze blokken (T.<blok>), en een paar losse getallen in T.
  T.WERKBANK = [
    {
      naam: 'Graan en tijd',
      losse: {
        GRAAN_PER_TEGEL: 'graan per akkertegel',
        ZAAIGRAAN_PER_TEGEL: 'zaaigraan per akkertegel',
        DAG_LENGTE: 'seconden per dag, op 1×',
        OOGST_UREN_PER_TEGEL: 'uren maaien per akkertegel',
      },
    },
    { naam: 'De dag', blok: 'DAG_INSTELLINGEN' },
    { naam: 'Gebouwen en bevolking', blok: 'GEBOUWEN_INSTELLINGEN' },
    { naam: 'Behoeften en de winter', blok: 'BEHOEFTEN_INSTELLINGEN' },
    { naam: 'De marskramer', blok: 'HANDEL_INSTELLINGEN' },
    { naam: 'De heer', blok: 'HEER_INSTELLINGEN' },
    { naam: 'De inner', blok: 'INNER_INSTELLINGEN' },
    { naam: 'De verstopplekken', blok: 'VERSTOP_INSTELLINGEN' },
    { naam: 'De boeren', blok: 'BOEREN_INSTELLINGEN' },
    { naam: 'De velden', blok: 'VELDEN_INSTELLINGEN' },
    { naam: 'Het vee', blok: 'VEE_INSTELLINGEN' },
  ];

  // ---------------------------------------------------------------------------------------------
  // Paden in T, en de standaard: de waarden zoals de bestanden ze zetten
  // ---------------------------------------------------------------------------------------------

  const kloon = (w) => (w === undefined ? undefined : JSON.parse(JSON.stringify(w)));
  const delen = (pad) => pad.split('.');

  T.leesPad = function (pad) {
    let o = T;
    for (const d of delen(pad)) {
      if (o == null) return undefined;
      o = o[d];
    }
    return o;
  };

  T.zetPad = function (pad, waarde) {
    const d = delen(pad);
    let o = T;
    for (let i = 0; i < d.length - 1; i++) {
      if (o[d[i]] == null) return false;
      o = o[d[i]];
    }
    o[d[d.length - 1]] = waarde;
    return true;
  };

  let standaard = null;
  function neemStandaard() {
    standaard = { blokken: {}, losse: {}, namen: {} };
    for (const deel of T.WERKBANK) {
      if (deel.blok) standaard.blokken[deel.blok] = kloon(T[deel.blok]);
      for (const k of Object.keys(deel.losse || {})) standaard.losse[k] = T[k];
    }
    for (const id of T.NAAM_OPTIES) standaard.namen[id] = T.MENSEN && T.MENSEN[id] ? T.MENSEN[id].naam : id;
  }

  // Wat nu is ingesteld, voor zover het van de standaard afwijkt.
  T.OPTIES_NU = { keuzes: {}, namen: {}, getallen: {} };

  T.optieKeuze = function (id) {
    const o = T.OPTIES.find((x) => x.id === id);
    return (T.OPTIES_NU.keuzes && T.OPTIES_NU.keuzes[id]) || (o && o.standaard);
  };

  // Een mens een naam geven, overal waar die naam staat: zijn regel in T.MENSEN, zijn gesprek, en
  // zijn poppetje als het er al staat.
  T.zetNaamVanMens = function (id, naam, S) {
    if (!T.MENSEN || !T.MENSEN[id]) return;
    T.MENSEN[id].naam = naam;
    if (T.GESPREKKEN && T.GESPREKKEN[id]) T.GESPREKKEN[id].naam = naam;
    const w = S && S.wereld;
    if (w) for (const e of w.wezens || []) if (e.wie === id) e.naam = naam;
  };

  // De naam die in het bestand staat (js/mensen.js), zonder wat je zelf invulde.
  T.standaardNaam = (id) => (standaard ? standaard.namen[id] : T.naamVanMens(id));

  // De naam van de heer, als je hem een naam gaf; anders null.
  T.naamVanDeHeer = function () {
    const naam = T.MENSEN && T.MENSEN.heer && T.MENSEN.heer.naam;
    return naam && standaard && naam !== standaard.namen.heer ? naam : null;
  };

  // Alles toepassen: terug naar de bestanden, dan de keuzes, dan de werkbank, dan de namen.
  // `instelling` is { keuzes, namen, getallen } (wat van de standaard afwijkt); S is optioneel,
  // alleen om de namen van poppetjes die er al staan bij te werken.
  T.pasOptiesToe = function (instelling, S) {
    if (!standaard) neemStandaard();
    const i = instelling || {};
    const nu = { keuzes: {}, namen: {}, getallen: {} };
    for (const blok in standaard.blokken) T[blok] = kloon(standaard.blokken[blok]);
    for (const k in standaard.losse) T[k] = standaard.losse[k];
    for (const o of T.OPTIES) {
      const gekozen = (i.keuzes && i.keuzes[o.id]) || o.standaard;
      const keuze = o.keuzes.find((k) => k.id === gekozen) || o.keuzes.find((k) => k.id === o.standaard);
      for (const pad in keuze.zet) T.zetPad(pad, kloon(keuze.zet[pad]));
      if (keuze.id !== o.standaard) nu.keuzes[o.id] = keuze.id;
    }
    for (const pad in i.getallen || {}) {
      const w = Number(i.getallen[pad]);
      if (typeof T.leesPad(pad) === 'number' && Number.isFinite(w)) {
        T.zetPad(pad, w);
        nu.getallen[pad] = w;
      }
    }
    for (const id of T.NAAM_OPTIES) {
      const eigen = ((i.namen && i.namen[id]) || '').trim();
      T.zetNaamVanMens(id, eigen || standaard.namen[id], S);
      if (eigen && eigen !== standaard.namen[id]) nu.namen[id] = eigen;
    }
    T.OPTIES_NU = nu;
    // Geloot of vast (js/boeren.js): de poppetjes die er al staan, meteen bijwerken.
    if (S && T.pasLotToe) T.pasLotToe(S);
    return nu;
  };

  // Eén ding veranderen, alles opnieuw toepassen, en onthouden.
  function verander(fn, S) {
    const i = kloon(T.OPTIES_NU);
    fn(i);
    T.pasOptiesToe(i, S);
    T.bewaarOpties();
  }
  T.zetOptie = (id, keuzeId, S) => verander((i) => { i.keuzes[id] = keuzeId; }, S);
  T.zetGetal = (pad, waarde, S) => verander((i) => {
    if (waarde == null || waarde === '') delete i.getallen[pad];
    else i.getallen[pad] = Number(waarde);
  }, S);
  T.zetNaam = (id, naam, S) => verander((i) => { i.namen[id] = naam; }, S);
  T.optiesTerug = (S) => verander((i) => {
    i.keuzes = {};
    i.namen = {};
    i.getallen = {};
  }, S);

  // ---------------------------------------------------------------------------------------------
  // De werkbank: alle getallen, met een leesbare naam en een bereik voor de schuif
  // ---------------------------------------------------------------------------------------------

  // "brandhoutPerHuishoudenPerDag" wordt "brandhout per huishouden per dag".
  const inWoorden = (s) => s.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

  // Hoe heet plek `i` in een rij: de naam van het ding als het er een heeft (een bezoek van de
  // marskramer, een straf), bij een prijs het bezoek waar hij bij hoort, en anders zijn nummer.
  function plekNaam(ouderSleutel, rij, i) {
    const x = rij[i];
    if (x && typeof x === 'object') {
      if (typeof x.naam === 'string') return x.naam;
      if ('straf' in x) return x.straf || 'geen straf';
    }
    const bezoeken = T.HANDEL_INSTELLINGEN && T.HANDEL_INSTELLINGEN.bezoeken;
    if (ouderSleutel === 'prijs' && bezoeken && bezoeken[i]) return bezoeken[i].naam;
    return String(i + 1);
  }

  // Welke keuze zet dit pad (of een pad erboven)? De naam van de optie, of null.
  function doorOptie(pad) {
    for (const o of T.OPTIES) {
      const keuze = o.keuzes.find((k) => k.id === T.optieKeuze(o.id));
      if (keuze && Object.keys(keuze.zet).some((p) => pad === p || pad.startsWith(p + '.'))) return o.naam;
    }
    return null;
  }

  // Een bereik voor de schuif, naar de standaard: een fractie tussen 0 en 1 (of wat ruimer als hij
  // klein is), een heel getal tot drie keer zo groot. Het getalveld ernaast kent geen grenzen.
  T.werkbankBereik = function (st) {
    if (!(st > 0)) return { min: 0, max: 1, stap: 0.01 };
    if (Number.isInteger(st)) return { min: 0, max: Math.max(3, st * 3), stap: 1 };
    if (st < 1) return { min: 0, max: Math.min(1, Math.max(0.1, Math.ceil(st * 400) / 100)), stap: st < 0.1 ? 0.001 : 0.01 };
    return { min: 0, max: Math.ceil(st * 3), stap: 0.1 };
  };

  // Alle getallen van één deel van de werkbank: [{ pad, label, waarde, standaard, eigen, doorOptie }].
  // `standaard` is wat er staat zonder werkbank (dus met de keuzes van nu), `eigen` of je hem zelf
  // verzette.
  T.werkbankGetallen = function (deel) {
    if (!standaard) neemStandaard();
    const lijst = [];
    const eigen = T.OPTIES_NU.getallen || {};
    const metKeuzes = {}; // de waarden met de keuzes van nu, zonder de werkbank
    const voeg = (pad, label, waarde) => {
      lijst.push({ pad, label, waarde, standaard: pad in eigen ? metKeuzes[pad] : waarde, eigen: pad in eigen, doorOptie: doorOptie(pad) });
    };
    // Wat de keuzes zetten, zonder de werkbank: even uitrekenen op een kopie.
    const zonderWerkbank = (pad) => {
      for (const o of T.OPTIES) {
        const keuze = o.keuzes.find((k) => k.id === T.optieKeuze(o.id));
        for (const p in keuze.zet) {
          if (pad === p) return keuze.zet[p];
          if (pad.startsWith(p + '.')) {
            let v = keuze.zet[p];
            for (const d of delen(pad.slice(p.length + 1))) v = v == null ? undefined : v[d];
            return v;
          }
        }
      }
      const d = delen(pad);
      if (d.length === 1) return standaard.losse[pad];
      let v = standaard.blokken[d[0]];
      for (const x of d.slice(1)) v = v == null ? undefined : v[x];
      return v;
    };
    for (const k of Object.keys(deel.losse || {})) {
      metKeuzes[k] = zonderWerkbank(k);
      voeg(k, deel.losse[k], T[k]);
    }
    if (deel.blok) {
      const loop = (waarde, pad, labels) => {
        if (typeof waarde === 'number') {
          metKeuzes[pad] = zonderWerkbank(pad);
          voeg(pad, labels.join(' · '), waarde);
        } else if (Array.isArray(waarde)) {
          const ouder = delen(pad).pop();
          waarde.forEach((x, i) => loop(x, `${pad}.${i}`, labels.concat(plekNaam(ouder, waarde, i))));
        } else if (waarde && typeof waarde === 'object') {
          for (const s of Object.keys(waarde)) loop(waarde[s], `${pad}.${s}`, labels.concat(inWoorden(s)));
        }
      };
      loop(T[deel.blok], deel.blok, []);
    }
    return lijst;
  };

  // ---------------------------------------------------------------------------------------------
  // Onthouden, in de browser (localStorage). Kan dat niet (een toets, een privévenster), dan
  // gewoon niet: het spel werkt dan met de standaard.
  // ---------------------------------------------------------------------------------------------

  const SLEUTEL = 'aardschok.spelregels';
  function opslag() {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch (e) {
      return null;
    }
  }

  T.bewaarOpties = function (waar) {
    const o = waar || opslag();
    try {
      if (o) o.setItem(SLEUTEL, JSON.stringify(T.OPTIES_NU));
    } catch (e) {
      /* vol, of geblokkeerd: dan onthoudt de browser het niet */
    }
  };

  T.laadOpties = function (waar) {
    const o = waar || opslag();
    try {
      const tekst = o && o.getItem(SLEUTEL);
      const i = tekst ? JSON.parse(tekst) : null;
      return i && typeof i === 'object' ? i : null;
    } catch (e) {
      return null;
    }
  };

  // Bij het laden: de standaard vastleggen, en wat de browser onthield meteen toepassen, zodat de
  // wereld en de poppetjes al met de juiste namen en getallen beginnen.
  neemStandaard();
  T.pasOptiesToe(T.laadOpties());
})(globalThis.Spel = globalThis.Spel || {});
