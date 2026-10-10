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
      id: 'graan', naam: 'Graan', standaard: 'netRond',
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
          uitleg: 'Ze eten het hele jaar heide: een schaap kost geen hooi.' },
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
    // Het seizoen (Marcel, 30 sep, werklijst vraag 74: "Het zaaien wordt gewoon iets wat de boeren doen, zo ook het
    // oogsten en de winter. Jij moet als schout wel een oogje in het zeil houden"; js/akkers.js, js/vee.js en
    // js/behoeften.js).
    {
      id: 'seizoen', naam: 'Het seizoen', standaard: 'boeren',
      uitleg: 'Wie kiest wat de velden worden, wie het vee slacht voor de winter, en of er hout gesprokkeld wordt.',
      keuzes: [
        { id: 'boeren', naam: 'De boeren', zet: { 'VELDEN_INSTELLINGEN.boerenKiezen': true, 'VEE_INSTELLINGEN.boerenSlachten': true, 'BEHOEFTEN_INSTELLINGEN.sprokkelen': true },
          uitleg: 'Na de oogst kiest elke boer wat zijn velden volgend jaar worden: een uitgeput veld rust een jaar, of krijgt mest. Op 1 slachtmaand slachten ze wat het hooi niet haalt, en het hele jaar sprokkelen de mensen hout, al is dat niet genoeg voor de winter. Jij houdt een oogje in het zeil: in het veldenvenster zie je wat ze kozen, en verander je het.' },
        { id: 'jij', naam: 'Jij', zet: { 'VELDEN_INSTELLINGEN.boerenKiezen': false, 'VEE_INSTELLINGEN.boerenSlachten': false, 'BEHOEFTEN_INSTELLINGEN.sprokkelen': false },
          uitleg: 'Jij kiest in het veldenvenster wat de velden worden, op 1 slachtmaand vraagt het slachtvenster wie er naar de slager gaat, en niemand sprokkelt: al het hout komt van de houthakker.' },
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
    // Marcel, 8 okt (werklijst vraag 132): "Vis mag een maag vullen, zoals vlees".
    {
      id: 'vis', naam: 'Vis', standaard: 'eten',
      uitleg: 'Of het dorp bij honger ook vis eet, of alleen wat de huizen ervan willen.',
      keuzes: [
        { id: 'eten', naam: 'Vult een maag', zet: { 'BEHOEFTEN_INSTELLINGEN.visIsEten': true },
          uitleg: 'Wat het zout niet goed houdt, eet het dorp eerst op, want het bederft toch. Gezouten vis bewaart het tot het graan op is.' },
        { id: 'tevredenheid', naam: 'Alleen voor de wensen', zet: { 'BEHOEFTEN_INSTELLINGEN.visIsEten': false },
          uitleg: 'De huizen eten de vis die ze willen; wat over is, bederft. Zoals voor 8 okt.' },
      ],
    },
    // Marcel, 8 okt (werklijst vraag 140): "Dagloners is een goed idee", en "mensen in het dorp".
    {
      id: 'dagloners', naam: 'Dagloners', standaard: 'maaien',
      uitleg: 'Of wie in het dorp geen werk heeft, in de oogst de boeren helpt maaien, binden en dragen.',
      keuzes: [
        { id: 'maaien', naam: 'Maaien, binden en dragen', zet: { 'SCHOVEN_INSTELLINGEN.dagloners': true, 'SCHOVEN_INSTELLINGEN.daglonersMaaien': true },
          uitleg: 'Is de oogst rijp, dan helpt wie geen werk heeft de dichtste boerderij, tot drie per boerderij: eerst maaien, dan binden en dragen.' },
        { id: 'binden', naam: 'Binden en dragen', zet: { 'SCHOVEN_INSTELLINGEN.dagloners': true, 'SCHOVEN_INSTELLINGEN.daglonersMaaien': false },
          uitleg: 'De boer maait alleen; wie geen werk heeft, helpt binden en de schoven naar de schuur dragen.' },
        { id: 'uit', naam: 'Alleen het gezin', zet: { 'SCHOVEN_INSTELLINGEN.dagloners': false },
          uitleg: 'Alleen de boer, zijn boerin en de grote kinderen halen de oogst binnen. Zoals voor 8 okt.' },
      ],
    },
    // Marcel, 9 okt (werklijst vraag 77, stap 2): "1. Beiden 2. Ook in beeld 3. Ja kleine beekjes ook, goed idee!".
    {
      id: 'weer', naam: 'Het weer', standaard: 'aan',
      uitleg: 'Of het regent, sneeuwt en droog is, en of droogte de oogst en de beekjes kost.',
      keuzes: [
        { id: 'aan', naam: 'Met droogte', zet: { 'WEER_INSTELLINGEN.aan': true, 'WEER_INSTELLINGEN.droogte': true },
          uitleg: 'Elke dag zon, wolken, regen of sneeuw. Valt er in het groeiseizoen lang geen regen, dan is het droogte: de akkers geven minder en de kleine beekjes vallen droog.' },
        { id: 'zonder', naam: 'Zonder droogte', zet: { 'WEER_INSTELLINGEN.aan': true, 'WEER_INSTELLINGEN.droogte': false },
          uitleg: 'Het weer is er en je ziet het, maar het kost de oogst en de beekjes niets.' },
        { id: 'uit', naam: 'Altijd zon', zet: { 'WEER_INSTELLINGEN.aan': false },
          uitleg: 'Geen weer: elke dag is als de vorige. Zoals voor 9 okt.' },
      ],
    },
    // Marcel, 9 okt (werklijst vraag 143): "soort van brief sturen met een bode".
    {
      id: 'bode', naam: 'De bode', standaard: 'aan',
      uitleg: 'Of je in een moeilijke tijd een bode met een brief naar de marskramer kunt sturen.',
      keuzes: [
        { id: 'aan', naam: 'Ja', zet: { 'BODE_INSTELLINGEN.aan': true },
          uitleg: 'Bij honger, kou of droogte schrijf je bij je huis een brief; een dorpeling brengt hem, en na een paar dagen komt de marskramer met wat je vroeg, duurder dan anders.' },
        { id: 'uit', naam: 'Nee', zet: { 'BODE_INSTELLINGEN.aan': false },
          uitleg: 'De marskramer komt alleen op zijn drie vaste rondes. Zoals voor 9 okt.' },
      ],
    },
    // Marcel, 9 okt (werklijst vraag 144, 3): "Ziekte en brand als status is ook goed".
    {
      id: 'brand', naam: 'Brand', standaard: 'aan',
      uitleg: 'Of de brand echt een huis laat afbranden, en of er brandgevaar is in de droogte.',
      keuzes: [
        { id: 'aan', naam: 'Ja', zet: { 'BRAND_INSTELLINGEN.aan': true },
          uitleg: 'Het huis brandt; met de emmers blijft het meestal staan, anders brandt het af en bouwt het gezin het weer op. In de droogte is er brandgevaar, en brandt het vaker.' },
        { id: 'uit', naam: 'Nee', zet: { 'BRAND_INSTELLINGEN.aan': false },
          uitleg: 'De brand is alleen een vraag met een prijs, en er is geen brandgevaar. Zoals voor 9 okt.' },
      ],
    },
    {
      id: 'ouderWorden', naam: 'Ouder worden', standaard: 'aan',
      uitleg: 'Of de mensen ouder worden, kinderen krijgen en van ouderdom sterven.',
      keuzes: [
        { id: 'aan', naam: 'Ja', zet: { 'LEVEN_INSTELLINGEN.aan': true },
          uitleg: 'Een kleuter wordt een kind, een kind groeit op, en wie oud is, sterft na een paar jaar. Een gezin krijgt soms een kind, als er plaats is in het huis.' },
        { id: 'uit', naam: 'Nee', zet: { 'LEVEN_INSTELLINGEN.aan': false },
          uitleg: 'Iedereen blijft zo oud als hij kwam, en kinderen komen alleen met een nieuw gezin. Zoals voor 9 okt.' },
      ],
    },
    {
      id: 'kleren', naam: 'Kleren', standaard: 'laken',
      uitleg: 'Wie hoger staat, draagt duurdere kleren: in een hut arm en versleten, in een stenen huis deftig. Alleen beeld.',
      keuzes: [
        { id: 'laken', naam: 'Naar stand, deftig met laken', zet: { 'BEWONERS_INSTELLINGEN.klerenNaarStand': true, 'BEWONERS_INSTELLINGEN.lakenVoorDeftig': true },
          uitleg: 'Een stenen huis loopt pas deftig als het zijn laken krijgt: op straat zie je wat er mist.' },
        { id: 'stand', naam: 'Naar stand', zet: { 'BEWONERS_INSTELLINGEN.klerenNaarStand': true, 'BEWONERS_INSTELLINGEN.lakenVoorDeftig': false },
          uitleg: 'Wie in een stenen huis woont, loopt deftig, met of zonder laken.' },
        { id: 'uit', naam: 'Iedereen gewoon', zet: { 'BEWONERS_INSTELLINGEN.klerenNaarStand': false },
          uitleg: 'Iedereen in de kleren van een dorpeling, zoals voor 10 okt.' },
      ],
    },
    {
      id: 'kleinLeven', naam: 'Klein leven', standaard: 'aan',
      uitleg: 'Rook uit de schoorstenen, kippen, een hond, spelende kinderen en was aan de lijn. Alleen beeld.',
      keuzes: [
        { id: 'aan', naam: 'Ja', zet: { 'KLEIN_LEVEN_INSTELLINGEN.aan': true }, uitleg: 'Het dorp leeft: wie thuis is, stookt, en er scharrelt van alles rond.' },
        { id: 'uit', naam: 'Nee', zet: { 'KLEIN_LEVEN_INSTELLINGEN.aan': false }, uitleg: 'Zonder, zoals voor 9 okt.' },
      ],
    },
    {
      id: 'koorts', naam: 'Koorts', standaard: 'aan',
      uitleg: 'Of de koorts een tijd rondgaat, of alleen een kans op een dode is.',
      keuzes: [
        { id: 'aan', naam: 'Ja', zet: { 'KOORTS_INSTELLINGEN.aan': true },
          uitleg: 'Wie ziek is, ligt een week in bed en steekt soms een ander aan, vaker in de kou en in een vol dorp; een enkele keer sterft iemand. Wat je doet, maakt dat ze minder overgaat.' },
        { id: 'uit', naam: 'Nee', zet: { 'KOORTS_INSTELLINGEN.aan': false },
          uitleg: 'Het voorval kost alleen wat het kost, en er wordt niemand ziek.' },
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
    // Stuk 2 van de poppetjes (Marcel, 26 sep: "Uit de looptijd"; spel.md, "Stuk 2 uitgewerkt").
    {
      id: 'werkUren', naam: 'Werk telt in uren', standaard: 'deWegTelt',
      uitleg: 'Of de weg naar het werk telt: een werkplaats maakt naar de uren dat zijn mensen er echt zijn.',
      keuzes: [
        { id: 'deWegTelt', naam: 'De weg telt', zet: { 'BEWONERS_INSTELLINGEN.werkInUren': true },
          uitleg: 'Wie ver van zijn werk woont, is langer onderweg: de weg heen gaat van de werkuren af. Zo doet het ertoe waar een huis staat.' },
        { id: 'heleDag', naam: 'Een hele dag', zet: { 'BEWONERS_INSTELLINGEN.werkInUren': false },
          uitleg: 'Een hand werkt een hele dag, waar hij ook woont.' },
      ],
    },
    // De doorkijk (Marcel, 26 sep, vraag 34: "Ja dit is een goede optie" en "Raster ook als keuze";
    // ontwerp/beeld.md, "Doorkijk"; js/doorkijk.js).
    {
      id: 'doorkijk', naam: 'Door een huis heen kijken', standaard: 'venster',
      uitleg: 'Hoe je iemand ziet die achter een huis of een boom staat.',
      keuzes: [
        { id: 'venster', naam: 'Kijkvenster', zet: { 'DOORKIJK_INSTELLINGEN.manier': 'venster' },
          uitleg: 'Het huis blijft staan, en rond wie erachter staat gaat een zacht rond venster open, waarin je hem en de grond achter het huis ziet.' },
        { id: 'raster', naam: 'Raster', zet: { 'DOORKIJK_INSTELLINGEN.manier': 'raster' },
          uitleg: 'Het hele huis gaat om de andere pixel open, zoals in oude spellen: je ziet het huis en wat erachter staat door elkaar.' },
      ],
    },
    // Tekenen met de videokaart (werklijst vraag 123; js/gl.js): sneller, vooral op een groot scherm. Zonder is het
    // 2D-doek van de browser, voor een browser zonder WebGL en om te vergelijken.
    {
      id: 'tekenen', naam: 'Tekenen', standaard: 'met',
      uitleg: 'Hoe het spel het beeld tekent. Hetzelfde beeld; met de videokaart gaat het sneller.',
      keuzes: [
        { id: 'met', naam: 'Met de videokaart', zet: { 'TEKENEN_INSTELLINGEN.videokaart': true },
          uitleg: 'Het beeld gaat in een paar opdrachten naar de videokaart (WebGL). Zonder echte videokaart, of als je browser het niet kan, tekent het zonder.' },
        { id: 'zonder', naam: 'Zonder', zet: { 'TEKENEN_INSTELLINGEN.videokaart': false },
          uitleg: 'De browser tekent het beeld zelf, zoals vóór 4 okt 2026.' },
      ],
    },
    {
      id: 'doorkijkPlein', naam: 'Wie je door een huis heen ziet', standaard: 'ookHetPlein',
      uitleg: 'Altijd de schout, wie je spreekt, wie je zoekt, wie vecht, en de heer, de marskramer, de inner en de soldaten.',
      keuzes: [
        // De standaard houdt zijn naam (Marcel, 10 okt: op een feest niet), zodat een browser die hem onthield, meegaat.
        { id: 'ookHetPlein', naam: 'Ook het plein', zet: { 'DOORKIJK_INSTELLINGEN.plein': true, 'DOORKIJK_INSTELLINGEN.pleinOpEenFeest': false },
          uitleg: 'Ook iedereen die op het plein staat, zodat je het plein ziet, behalve op een feest: dan staat het hele dorp er, en zat een dak ervoor vol gaten. Door een boom heen niet, anders zitten de eiken vol gaten zolang de kinderen spelen.' },
        { id: 'ookOpEenFeest', naam: 'Het plein, ook op een feest', zet: { 'DOORKIJK_INSTELLINGEN.plein': true, 'DOORKIJK_INSTELLINGEN.pleinOpEenFeest': true },
          uitleg: 'Iedereen op het plein, altijd, zoals vóór 10 okt 2026: op een feest krijgt een dak ervoor een gat voor elk van hen.' },
        { id: 'wieErToeDoet', naam: 'Alleen wie ertoe doet', zet: { 'DOORKIJK_INSTELLINGEN.plein': false },
          uitleg: 'Wie op het plein speelt, verdwijnt achter een huis, net als overal in het dorp.' },
      ],
    },
    // Het zichtveld (27 sep; werklijst punt 3, vraag 40, A: "zie je meteen dat iemand je zag, of pas
    // later?"; js/zien.js).
    {
      id: 'getuigen', naam: 'Wie je ziet', standaard: 'meteen',
      uitleg: 'Of je weet wie er kijkt als je iets wegzet of terughaalt.',
      keuzes: [
        { id: 'meteen', naam: 'Meteen', zet: { 'ZIEN_INSTELLINGEN.meteen': true },
          uitleg: 'Het venster zegt wie je ziet, en wie het zag, krijgt een oogje boven zijn hoofd.' },
        { id: 'later', naam: 'Pas later', zet: { 'ZIEN_INSTELLINGEN.meteen': false },
          uitleg: 'Je weet niet wie er keek. Je hoort het pas als het rondverteld is: van de herbergierster, of als de soldaten het vinden.' },
      ],
    },
    // De schaduwen van de zon (Marcel, 4 okt, werklijst vraag 125, B: "B graag", en "A ja, B goed zo"; js/tekenen.js,
    // js/gl.js).
    {
      id: 'schaduwen', naam: 'Schaduwen', standaard: 'zon',
      uitleg: 'Of wat staat een schaduw over de grond werpt die met de zon meegaat. Alleen met de videokaart.',
      keuzes: [
        { id: 'zon', naam: 'Met de zon', zet: { 'LICHT_INSTELLINGEN.zonneschaduw': true },
          uitleg: "Wat staat, werpt zijn silhouet over de grond: 's ochtends lang naar rechtsboven, 's middags kort naar rechtsonder, 's avonds lang naar linksonder." },
        { id: 'uit', naam: 'Zonder', zet: { 'LICHT_INSTELLINGEN.zonneschaduw': false },
          uitleg: 'Alleen het schaduwtje onder de voeten van wie er loopt, zoals vóór 4 okt 2026.' },
      ],
    },
    // De hoogte van het land (Marcel, 7 okt, werklijst vraag 121: "ik doel ook meer op heuvels in het landschap"; js/hoogte.js).
    // Vlak tot de speeltest van stap 3 laat zien dat het spel er net zo goed mee loopt.
    {
      id: 'hoogte', naam: 'Hoogte', standaard: 'vlak',
      uitleg: 'Of een nieuw land heuvels heeft. Alleen voor een land van de maker; het ontworpen gehucht blijft vlak.',
      keuzes: [
        { id: 'vlak', naam: 'Vlak', zet: { 'HOOGTE_INSTELLINGEN.aan': false },
          uitleg: 'Het land is vlak, zoals vóór 7 okt 2026.' },
        { id: 'heuvels', naam: 'Heuvels', zet: { 'HOOGTE_INSTELLINGEN.aan': true },
          uitleg: 'Hoge heuvels in het wilde land, een zachte glooiing rond het dorp, en een richel met een rotswand bij de rotsen. Niemand loopt door een rotswand, op steile grond wordt niet gebouwd, en een heuvel houdt het zicht tegen en dekt af wat erachter staat.' },
      ],
    },
    // De lantaarn van de schout (Marcel, 4 okt, werklijst vraag 125, C: "ook spel. Voegt leuke elementen toe"; js/zien.js).
    {
      id: 'lantaarn', naam: 'De lantaarn van de schout', standaard: 'spel',
      uitleg: "'s Avonds en 's nachts draagt de schout buiten een lantaarn. Sluipen (S) dooft hem.",
      keuzes: [
        { id: 'spel', naam: 'Ook spel', zet: { 'ZIEN_INSTELLINGEN.lantaarn.zichtbaar': true },
          uitleg: 'Met je lantaarn aan zien ze je in het donker van ver. Wie iets wil verstoppen, sluipt.' },
        { id: 'beeld', naam: 'Alleen beeld', zet: { 'ZIEN_INSTELLINGEN.lantaarn.zichtbaar': false },
          uitleg: 'De lantaarn geeft licht, maar wie je ziet, hangt alleen af van de lantaarns en de herberg, zoals vóór 4 okt 2026.' },
      ],
    },
    // Het dorp bouwt zelf (Marcel, 28 sep, werklijst vraag 52: "C ja"; js/erven.js).
    {
      id: 'huizen', naam: 'Huizen', standaard: 'dorpBouwtZelf',
      uitleg: 'Wie de huizen neerzet.',
      keuzes: [
        { id: 'dorpBouwtZelf', naam: 'Het dorp bouwt zelf', zet: { 'ERVEN_INSTELLINGEN.dorpBouwtZelf': true },
          uitleg: 'Jij wijst erven aan, en een nieuw gezin zet er zelf een hut op, met hout uit de voorraad. De hut en het huis staan niet in het bouwmenu.' },
        { id: 'jij', naam: 'Jij zet ze neer', zet: { 'ERVEN_INSTELLINGEN.dorpBouwtZelf': false },
          uitleg: 'De hut en het huis staan in het bouwmenu, en een nieuw gezin komt alleen als er een huis met plaats is. Erven zijn er niet.' },
      ],
    },
    // Wie de rest bouwt (werklijst vraag 103; Marcel, 3 okt: "De inwoners bouwen zelf een weverij etc. Ze vragen alleen
    // toestemming om te bouwen", en "103 a b c ja d ook verzoek e ja"; js/verzoeken.js). Jij is het spel van vóór 3 okt.
    {
      id: 'wieBouwt', naam: 'Wie bouwt', standaard: 'mensen',
      uitleg: 'Wie de werkplaatsen, de put, de kapel en de markt neerzet.',
      keuzes: [
        { id: 'mensen', naam: 'De mensen vragen het', zet: { 'VERZOEKEN_INSTELLINGEN.mensen': true },
          uitleg: 'Wat het dorp mist, komt een inwoner je vragen, met de plek die hij koos en wat het kost. Jij zegt ja of nee, en wijst erven aan; ben je weg, dan beslist je raadsman.' },
        { id: 'jij', naam: 'Jij bouwt', zet: { 'VERZOEKEN_INSTELLINGEN.mensen': false },
          uitleg: 'Alles staat in het bouwmenu, en jij zet het neer waar je wilt.' },
      ],
    },
    // Twee bazen (werklijst vraag 106; Marcel, 3 okt: "106 a b c d ja"; js/bazen.js): de heer en het dorp kunnen je
    // allebei wegsturen. Uit is het spel van vóór 3 okt.
    {
      id: 'tweeBazen', naam: 'Twee bazen', standaard: 'aan',
      uitleg: 'Of de heer en het dorp je allebei kunnen wegsturen.',
      keuzes: [
        { id: 'aan', naam: 'De heer en het dorp', zet: { 'BAZEN_INSTELLINGEN.aan': true },
          uitleg: 'De gunst van de heer en het vertrouwen van het dorp staan in de balk. Onder 20 komt een waarschuwing, op 0 ben je weg: ontslagen, of weggejaagd.' },
        { id: 'uit', naam: 'Alleen de heer', zet: { 'BAZEN_INSTELLINGEN.aan': false },
          uitleg: 'Zoals vóór 3 okt: de heer ontslaat je pas als je hem twee jaar achter elkaar veel te weinig gaf, en het dorp stuurt je niet weg.' },
      ],
    },
    // Een slechte dag in het jaar dat je wint (werklijst vraag 102, d; Marcel, 3 okt: "102 a b c d e ja"; js/einde.js).
    {
      id: 'eind', naam: 'Het eind', standaard: 'week',
      uitleg: 'Wat een slechte dag doet met het jaar waarin iedereen gelukkig moet zijn.',
      keuzes: [
        { id: 'week', naam: 'Een week mag', zet: { 'EINDE_INSTELLINGEN.magMissen': 7 },
          uitleg: 'Mist een huis iets, dan staat de teller stil. Is het binnen een week weer goed, dan telt hij verder; anders begint hij opnieuw.' },
        { id: 'jaar', naam: 'Een jaar op rij', zet: { 'EINDE_INSTELLINGEN.magMissen': 0 },
          uitleg: 'Eén dag waarop een huis iets mist, en de teller begint opnieuw.' },
      ],
    },
    // De paadjes (werklijst vraag 108, b; js/paden.js): van elke deur een paadje naar de weg, en waar veel gelopen wordt,
    // slijt het gras (Marcel, 25 sep: "paden ontstaan vanzelf", en 3 okt: "108 a tab, b c d e ja").
    {
      id: 'paadjes', naam: 'Paadjes', standaard: 'lopen',
      uitleg: 'Waar de paadjes in het dorp vandaan komen.',
      keuzes: [
        { id: 'lopen', naam: 'Waar gelopen wordt', zet: { 'PADEN_INSTELLINGEN.paadjes': 'lopen' },
          uitleg: 'Van elke deur loopt een paadje naar de weg, en waar veel mensen lopen, slijt het gras tot een paadje. Waar niemand meer loopt, groeit het weer dicht.' },
        { id: 'deuren', naam: 'Alleen van de deuren', zet: { 'PADEN_INSTELLINGEN.paadjes': 'deuren' },
          uitleg: 'Van elke deur loopt een paadje naar de weg; verder blijft het gras.' },
        { id: 'uit', naam: 'Geen', zet: { 'PADEN_INSTELLINGEN.paadjes': 'uit' },
          uitleg: 'Alleen de weg van de kaart, zoals voor 3 okt.' },
      ],
    },
    // Ontginnen (werklijst vraag 107; Marcel, 5 okt: "107 a b c d e ja", met e: de spelregel "Ontginnen", en voor het bos
    // "A a2, ... G ok"; js/ontginnen.js).
    {
      id: 'ontginnen', naam: 'Ontginnen', standaard: 'aan',
      uitleg: 'Of een boer heide of bos mag komen vragen om te ontginnen als het dorp graan tekortkomt.',
      keuzes: [
        { id: 'aan', naam: 'De heide en het bos', zet: { 'ONTGINNEN_INSTELLINGEN.aan': true, 'ONTGINNEN_INSTELLINGEN.bos': true },
          uitleg: 'Komt het dorp graan tekort, dan vraagt een boer of zijn zoon je om dertig tegels te ontginnen, zo dicht bij zijn akker als het kan: een stuk heide of een stuk bos, en jij kiest. De heide kost vertrouwen van het dorp, want de meent is van iedereen, en elk volgend stuk meer; een maand plaggen steken. Het bos is van de heer: meld je het, dan kost het zijn gunst en telt de inner het; doe je het stiekem, dan ben je betrapt als de inner of zijn soldaten het vinden. Een winter bomen hakken, en het hout is voor het dorp. In het voorjaar wordt het gezaaid.' },
        { id: 'heide', naam: 'Alleen de heide', zet: { 'ONTGINNEN_INSTELLINGEN.aan': true, 'ONTGINNEN_INSTELLINGEN.bos': false },
          uitleg: 'Een boer vraagt alleen om heide, en ja kost vertrouwen van het dorp. Zoals de eerste dag van het ontginnen (5 okt).' },
        { id: 'uit', naam: 'Uit', zet: { 'ONTGINNEN_INSTELLINGEN.aan': false, 'ONTGINNEN_INSTELLINGEN.bos': false },
          uitleg: 'Het land blijft zoals het is. Zoals voor 5 okt.' },
      ],
    },
    // De houthakker (werklijst vraag 115; Marcel, 4 okt: "De houthakker hakt bomen om uiteindelijk en plant nieuwe boompjes
    // terug", en 6 okt: "A ja B ja C ja D zo"; js/bos.js).
    {
      id: 'houthakker', naam: 'De houthakker', standaard: 'hakt',
      uitleg: 'Of het hout van de houthakker uit de bomen om zijn schuur komt.',
      keuzes: [
        { id: 'hakt', naam: 'Hakt en plant', zet: { 'BOS_INSTELLINGEN.houthakkerHakt': true },
          uitleg: 'De houthakker hakt de bomen binnen tien tegels van zijn schuur om, de dichtste eerst: elke tien hout een boom. Naast de stronk plant hij twee boompjes, die in een jaar of twee weer bomen zijn, en de stronk vergaat. Zo wordt het bos om hem heen eerst dunner en daarna jonger en dichter; met twee houthakkers of de wet Houtkap wijkt het. Staat er geen boom meer, dan staat hij stil, en werkt zijn hand elders tot er weer een boom staat. Hij komt alleen bij minstens dertig bomen binnen tien tegels.' },
        { id: 'uitHetNiets', naam: 'Hout uit het niets', zet: { 'BOS_INSTELLINGEN.houthakkerHakt': false },
          uitleg: 'De houthakker maakt zijn hout zonder een boom om te hakken, en het bos blijft zoals het is. Zoals voor 6 okt.' },
      ],
    },
    // Een praatje (werklijst vraag 120; Marcel, 4 okt: "Het dorp moet echt levendig en realistisch aanvoelen", en "geen
    // praatjes forceren. Alleen als mensen een reden hebben en elkaar toevallig tegenkomen"; js/praatje.js).
    {
      id: 'praatjes', naam: 'Praatjes', standaard: 'aan',
      uitleg: 'Of wie even vrij is, blijft staan voor een praatje.',
      keuzes: [
        { id: 'aan', naam: 'Aan', zet: { 'PRAATJE_INSTELLINGEN.aan': true },
          uitleg: 'Wie vrij is en toevallig een buur of iemand van zijn werk tegenkomt, blijft soms staan voor een praatje van een kwartier tot een uur, en wie langskomt, schuift aan. Boven wie praat, staat een wolkje.' },
        { id: 'uit', naam: 'Uit', zet: { 'PRAATJE_INSTELLINGEN.aan': false },
          uitleg: 'Ieder gaat zijn eigen gang, zonder te blijven staan. Zoals voor 4 okt.' },
      ],
    },
    // De beesten in het bos (werklijst vraag 116; Marcel, 4 okt: "Ik wil dat er beesten kunnen rondlopen in het bos",
    // en "doden mag"; 7 okt: "a ja, b ja, c ja", en "i ja": aan, zonder doden of uit; js/beesten.js).
    {
      id: 'beesten', naam: 'Beesten', standaard: 'aan',
      uitleg: 'Of er wolven en herten in het bos leven, en wat de wolven doen als ze honger hebben.',
      keuzes: [
        { id: 'aan', naam: 'Aan', zet: { 'BEESTEN_INSTELLINGEN.aan': true, 'BEESTEN_INSTELLINGEN.doden': true },
          uitleg: 'Roedels wolven rusten overdag bij hun hol en lopen \'s nachts langs de bosrand, waar je hun ogen ziet oplichten; herten grazen in de schemering aan de rand. In de winter jagen de wolven op de herten, en zijn die op, dan komen ze met honger naar het dorp: ze nemen een schaap, en wie alleen in het donker loopt, kunnen ze aanvallen. Een enkele keer is hij dood.' },
        { id: 'zonderDoden', naam: 'Zonder doden', zet: { 'BEESTEN_INSTELLINGEN.aan': true, 'BEESTEN_INSTELLINGEN.doden': false },
          uitleg: 'Zoals aan, maar wie de wolven aanvallen, is gewond en ligt een paar dagen in bed; niemand gaat dood.' },
        { id: 'uit', naam: 'Uit', zet: { 'BEESTEN_INSTELLINGEN.aan': false },
          uitleg: 'Het bos is leeg. Zoals voor 7 okt.' },
      ],
    },
    // Wie betrapt wordt op verstoppen (werklijst vraag 106, c; Marcel koos niet tussen de twee, dus de laatste
    // waarschuwing als standaard tot hij kiest; js/bazen.js, T.betrapt).
    {
      id: 'betrapt', naam: 'Betrapt', standaard: 'waarschuwing',
      uitleg: 'Wat er gebeurt als de soldaten van de heer vinden wat je verstopte (met twee bazen).',
      keuzes: [
        { id: 'waarschuwing', naam: 'De laatste waarschuwing', zet: { 'BAZEN_INSTELLINGEN.betrapt': 'waarschuwing' },
          uitleg: 'Zijn gunst zakt tot 5, en hij schrijft je: nog één tegenvaller, en je bent je ambt kwijt.' },
        { id: 'weg', naam: 'Meteen weg', zet: { 'BAZEN_INSTELLINGEN.betrapt': 'weg' },
          uitleg: 'Wie betrapt wordt, is meteen zijn ambt kwijt. Verstoppen is dan alles of niets.' },
      ],
    },
    // Een gezin wacht op de winter (werklijst vraag 59, B; Marcel, 1 okt, vraag 78: "D dat is prima"; js/gebouwen.js,
    // T.waaromGeenGezin). Altijd is het spel van vóór 1 okt.
    {
      id: 'groei', naam: 'Groei', standaard: 'wacht',
      uitleg: 'Of er een gezin komt als het dorp de winter niet haalt.',
      keuzes: [
        { id: 'wacht', naam: 'Een gezin wacht op de winter', zet: { 'GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter': true },
          uitleg: 'Haalt het hout of het eten de winter niet, dan komt er vanaf 1 herfstmaand geen gezin, tot het genoeg is of de winter voorbij. Het dorp en de raad zeggen het.' },
        { id: 'altijd', naam: 'Altijd', zet: { 'GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter': false },
          uitleg: 'Er komt een gezin zolang er graan, plaats en tevredenheid is, ook als de winter het niet haalt. Wie dan groeit, verliest het in de winter.' },
      ],
    },
    // Het zaaigraan (werklijst vraag 81; Marcel, 1 okt: "zaaigraan wordt bij nood opgegeten, anders sterven er mensen";
    // js/akkers.js, T.zaaigraanApart). Als ander graan is het spel van vóór 1 okt.
    {
      id: 'zaaigraan', naam: 'Zaaigraan', standaard: 'bewaken',
      uitleg: 'Wanneer het dorp het zaaigraan voor volgend jaar opeet.',
      keuzes: [
        { id: 'bewaken', naam: 'Bewaken', zet: { 'VELDEN_INSTELLINGEN.zaaigraanApart': true, 'GRAANSCHUUR_INSTELLINGEN.bewaken': true },
          uitleg: 'Van de oogst tot het zaaien ligt het zaaigraan in de graanschuur. Komt de honger eraan, dan vraagt een boer je wat er moet gebeuren: zet je er mannen bij, een per twintig mensen, dan blijft het liggen, maar elke hongerdag kost vertrouwen. Zonder graanschuur eet het dorp het bij nood op (vraag 132, 8 okt).' },
        { id: 'nood', naam: 'Pas bij nood', zet: { 'VELDEN_INSTELLINGEN.zaaigraanApart': true, 'GRAANSCHUUR_INSTELLINGEN.bewaken': false },
          uitleg: 'Van de oogst tot het zaaien houden de boeren het zaaigraan achter. Het dorp eet het pas als er niets anders meer is, en de winter rekent het eten zonder.' },
        { id: 'gewoon', naam: 'Als ander graan', zet: { 'VELDEN_INSTELLINGEN.zaaigraanApart': false, 'GRAANSCHUUR_INSTELLINGEN.bewaken': false },
          uitleg: 'Het dorp eet het zaaigraan als elk ander graan. Wie in de winter alles opeet, heeft in de lente niets te zaaien.' },
      ],
    },
    // De wensen per stand (werklijst vraag 80 en 85; Marcel, 1 okt; js/wensen.js). Het dorp als geheel is het spel van
    // vóór 1 okt.
    {
      id: 'wensen', naam: 'Wensen', standaard: 'huis',
      uitleg: 'Waar de tevredenheid van het dorp vandaan komt.',
      keuzes: [
        { id: 'huis', naam: 'Per huis', zet: { 'WENSEN_INSTELLINGEN.perHuis': true },
          uitleg: 'Elk huis wil wat zijn stand wil: keuters in een hut eten, brandhout en een put; dorpelingen in een huis daarbij bier, vlees of vis, een kapel en de herberg; ambachtslieden in een stenen huis daarbij brood, laken en een markt. De hoogste stand neemt eerst. Het dorp is het gemiddelde.' },
        { id: 'dorp', naam: 'Het dorp als geheel', zet: { 'WENSEN_INSTELLINGEN.perHuis': false },
          uitleg: 'Eén getal voor het hele dorp: eten, met groente, vis of vlees erbij, brandhout in de winter, en een kapel. Is het dorp een maand tevreden genoeg, dan groeien alle huizen door, zonder bouwstof.' },
      ],
    },
    // De herberg en de markt (werklijst vraag 96, a; Marcel, 3 okt: "1 markt 1 herberg voor nu"; js/wensen.js). Alleen met
    // de wensen per huis.
    {
      id: 'herbergEnMarkt', naam: 'De herberg en de markt', standaard: 'heelDorp',
      uitleg: 'Of één herberg en één markt genoeg zijn voor het hele dorp, of dat een huis ze in de buurt wil.',
      keuzes: [
        { id: 'heelDorp', naam: 'Eén voor het hele dorp', zet: { 'WENSEN_INSTELLINGEN.kring.herberg': null, 'WENSEN_INSTELLINGEN.kring.markt': null },
          uitleg: 'Staat er een herberg en een markt in het dorp, dan heeft elk huis dat ze wil ze, waar het ook staat.' },
        { id: 'kring', naam: 'Binnen een kring', zet: { 'WENSEN_INSTELLINGEN.kring.herberg': 30, 'WENSEN_INSTELLINGEN.kring.markt': 30 },
          uitleg: 'Een huis wil de herberg en een markt binnen 30 tegels, zoals een put en een kapel in hun kring. Een dorp dat groeit, heeft er dan meer nodig, en daar is niet altijd plaats voor.' },
      ],
    },
    // De markt (werklijst vraag 110, d; Marcel, 5 okt: "Voor nu a1, b tot e ja"; js/markt.js).
    {
      id: 'markt', naam: 'De markt', standaard: 'plein',
      uitleg: 'Waar de markt komt: met kramen op het plein, of als een eigen gebouw op eigen grond.',
      keuzes: [
        { id: 'plein', naam: 'Op het plein', zet: { 'MARKT_INSTELLINGEN.opHetPlein': true },
          uitleg: 'Vier kramen aan de rand van het plein, waar je tussendoor loopt; het midden blijft vrij voor het feest en de heer. Kramen zijn geen huis: 8 hout en 6 goud.' },
        { id: 'gebouw', naam: 'Een eigen gebouw', zet: { 'MARKT_INSTELLINGEN.opHetPlein': false },
          uitleg: 'Een gebouw van 6 bij 6, met drie tegels vrij rondom, voor 16 hout en 14 goud. Zo was het vóór 6 okt.' },
      ],
    },
    // Achteruitgaan (werklijst vraag 85, c; Marcel, 1 okt: "c zacht"; js/behoeften.js). Alleen met de wensen per huis.
    {
      id: 'achteruit', naam: 'Achteruitgaan', standaard: 'zacht',
      uitleg: 'Wat er gebeurt als een huis iets mist van wat zijn stand wil.',
      keuzes: [
        { id: 'zacht', naam: 'Zacht', zet: { 'WENSEN_INSTELLINGEN.achteruit': 'zacht' },
          uitleg: 'Zoals in Anno 1602: een huis dat iets mist, groeit niet verder en is minder tevreden. Er trekt pas een gezin weg als het huis onder de vertrekdrempel zakt, en dat gebeurt alleen als het eten of het brandhout mist.' },
        { id: 'streng', naam: 'Streng', zet: { 'WENSEN_INSTELLINGEN.achteruit': 'streng' },
          uitleg: 'Mist een huis een maand lang iets, dan trekt zijn gezin weg, hooguit één huis per dag. Een huis dat net doorgroeide, wil meteen meer: zorg dat het er is.' },
      ],
    },
    // De treden (werklijst vraag 90, A; Marcel, 2 okt: "a ja"; js/treden.js). Zoals de proef is het spel van 28 sep tot
    // 2 okt (vraag 51).
    {
      id: 'treden', naam: 'Treden', standaard: 'standen',
      uitleg: 'Wanneer het gehucht een dorp wordt.',
      keuzes: [
        { id: 'standen', naam: 'Uit de standen', zet: { 'TREDEN_INSTELLINGEN.dorp': { stand: 'dorpelingen', mensen: 20, gebouwen: [] } },
          uitleg: 'Zoals in Anno 1602: een dorp bij 20 dorpelingen, wie in een huis woont (of in een stenen huis). Daarna marktrecht bij 20 ambachtslieden, in een stenen huis.' },
        { id: 'proef', naam: 'Zoals de proef van 28 sep', zet: { 'TREDEN_INSTELLINGEN.dorp': { mensen: 50, gebouwen: ['kapel', 'smidse'] } },
          uitleg: 'Een dorp bij 50 mensen, wie het ook zijn, met een kapel en een smidse klaar. Marktrecht blijft bij 20 ambachtslieden.' },
      ],
    },
    // De raad onder het doel (Marcel, 29 sep, werklijst vraag 58: "B onder het doel"; js/raad.js).
    {
      id: 'raad', naam: 'Raad', standaard: 'aan',
      uitleg: 'Een regel onder het doel linksboven.',
      keuzes: [
        { id: 'aan', naam: 'Aan', zet: { 'RAAD_INSTELLINGEN.aan': true },
          uitleg: 'Onder het doel staat wat nu tussen jou en een dorp staat: waarom er geen gezin komt, of wanneer het volgende komt, het hout voor de winter, wat je mist voor de kapel en de smidse en waar het vandaan komt, de inner, de rovers. Met de toets erbij.' },
        { id: 'uit', naam: 'Uit', zet: { 'RAAD_INSTELLINGEN.aan': false },
          uitleg: 'Alleen het doel. Wat het dorp je zegt, zie je in de berichten.' },
      ],
    },
    // De heervaart (Marcel, 29 sep, werklijst vraag 60: "A ja B ja"; js/heervaart.js).
    {
      id: 'heervaart', naam: 'Heervaart', standaard: 'aan',
      uitleg: 'Of de heer mannen vraagt voor zijn oorlog, als het gehucht een dorp is.',
      keuzes: [
        { id: 'aan', naam: 'Aan', zet: { 'HEERVAART_INSTELLINGEN.aan': true },
          uitleg: 'Op 1 hooimaand vraagt hij een man per tien zielen, of goud. Wie gaat, is terug na de oogst, als veteraan die meevecht tegen de rovers; niet iedereen komt terug. Wie betaalt, maakt hem argwanend.' },
        { id: 'uit', naam: 'Uit', zet: { 'HEERVAART_INSTELLINGEN.aan': false },
          uitleg: 'Hij vraagt alleen goud en graan, op Sint-Maarten.' },
      ],
    },
    // De voorvallen (Marcel, 29 sep, werklijst vraag 65: "A ja"; js/voorvallen.js).
    {
      id: 'voorvallen', naam: 'Voorvallen', standaard: 'gewoon',
      uitleg: 'Hoe vaak iemand uit het dorp je komt zoeken met een vraag, een ruzie of een ramp.',
      keuzes: [
        { id: 'vaak', naam: 'Vaak', zet: { 'VOORVALLEN_INSTELLINGEN.aan': true, 'VOORVALLEN_INSTELLINGEN.dagenTussen': 6, 'VOORVALLEN_INSTELLINGEN.dagenTussenWinter': 4 },
          uitleg: 'Om de zes dagen of zo, in de winter om de vier.' },
        { id: 'gewoon', naam: 'Gewoon', zet: { 'VOORVALLEN_INSTELLINGEN.aan': true, 'VOORVALLEN_INSTELLINGEN.dagenTussen': 10, 'VOORVALLEN_INSTELLINGEN.dagenTussenWinter': 6 },
          uitleg: 'Om de tien dagen of zo, in de winter om de zes. Elk antwoord zegt vooraf wat het kost.' },
        { id: 'zelden', naam: 'Zelden', zet: { 'VOORVALLEN_INSTELLINGEN.aan': true, 'VOORVALLEN_INSTELLINGEN.dagenTussen': 20, 'VOORVALLEN_INSTELLINGEN.dagenTussenWinter': 12 },
          uitleg: 'Om de twintig dagen of zo, in de winter om de twaalf.' },
        { id: 'uit', naam: 'Uit', zet: { 'VOORVALLEN_INSTELLINGEN.aan': false },
          uitleg: 'Niemand komt je zoeken. Het dorp gaat zijn gang.' },
      ],
    },
    // De feesten (Marcel, 3 okt, werklijst vraag 97: het oogstfeest "Ja, een hele dag vrij", en "De meiboom"; js/feesten.js).
    {
      id: 'feesten', naam: 'Feesten', standaard: 'vieren',
      uitleg: 'Wat er gebeurt als je ja zegt op een feest, zoals het oogstfeest of de meiboom.',
      keuzes: [
        { id: 'vieren', naam: 'Het dorp viert het', zet: { 'FEESTEN_INSTELLINGEN.vieren': true },
          uitleg: 'Het hele dorp staat op het plein, met licht en bier. Bij een groot feest werkt de dag erna niemand: dat kost een dag werk.' },
        { id: 'stemming', naam: 'Alleen de stemming', zet: { 'FEESTEN_INSTELLINGEN.vieren': false },
          uitleg: 'Een feest kost wat het antwoord zegt en maakt het dorp blij, maar je ziet er niets van. Zoals vóór 3 okt.' },
      ],
    },
    // De verdwenen graanzak (werklijst vraag 128; Marcel, 8 okt: "akkoord, bouwen maar"; js/zaak.js).
    {
      id: 'zaak', naam: 'De zaak', standaard: 'aan',
      uitleg: 'De verdwenen graanzak: één zaak in de eerste herfst, die je zelf uitzoekt en op het plein beslist.',
      keuzes: [
        { id: 'aan', naam: 'Aan', zet: { 'ZAAK_INSTELLINGEN.aan': true },
          uitleg: 'Er verdwijnt een zak graan. Je vraagt rond, volgt het spoor, en op de zitting beslis je. Wat je koos, komt later terug.' },
        { id: 'uit', naam: 'Uit', zet: { 'ZAAK_INSTELLINGEN.aan': false },
          uitleg: 'Er verdwijnt niets.' },
      ],
    },
    // De raadsman (Marcel, 30 sep, werklijst vraag 66: "c Nee, wordt automatisch als de schout er niet is"; en vraag 68:
    // "Ja B inderdaad", alleen als je echt weg bent; js/raadsman.js).
    {
      id: 'raadsman', naam: 'Raadsman', standaard: 'aan',
      uitleg: 'Wanneer je raadsman een voorval beslist.',
      keuzes: [
        { id: 'aan', naam: 'Als je weg bent', zet: { 'RAADSMAN_INSTELLINGEN.aan': true, 'RAADSMAN_INSTELLINGEN.nietGesproken': false },
          uitleg: 'Ben je niet in het dorp als iemand je met een voorval zoekt, dan beslist je raadsman, naar zijn karakter en wat hij kan. Ben je er wel en spreek je hem niet, dan gaat het voorbij. Wie raadsman is, maait wel trager.' },
        { id: 'ook', naam: 'Ook als je niet spreekt', zet: { 'RAADSMAN_INSTELLINGEN.aan': true, 'RAADSMAN_INSTELLINGEN.nietGesproken': true },
          uitleg: 'Hij beslist ook als je in het dorp bent en wie je zoekt niet op tijd spreekt: wie je wegstuurt, laat je aan hem over.' },
        { id: 'uit', naam: 'Uit', zet: { 'RAADSMAN_INSTELLINGEN.aan': false, 'RAADSMAN_INSTELLINGEN.nietGesproken': false },
          uitleg: 'Wat je mist, gaat voorbij, en dat neemt het dorp je kwalijk.' },
      ],
    },
    // Het rapport van de raadsman, 's ochtends (werklijst vraag 75, 3a; Marcel, 1 okt: "A Ja dat is goed";
    // js/ochtendrapport.js). Uit is het spel van vóór 1 okt.
    {
      id: 'rapport', naam: 'Het rapport', standaard: 'aan',
      uitleg: 'Of je raadsman je elke ochtend een rapport brengt.',
      keuzes: [
        { id: 'aan', naam: 'Aan', zet: { 'OCHTENDRAPPORT_INSTELLINGEN.aan': true },
          uitleg: "Heb je een raadsman, dan staat hij 's ochtends aan je deur met wat er gebeurde, hoe het graan en het hout gaan, of ze de winter halen, wat er speelt en wat er komt. Hoe goed zijn getallen kloppen, zegt zijn rekenen. Was je er niet, dan ligt het klaar onder de knop Rapport." },
        { id: 'uit', naam: 'Uit', zet: { 'OCHTENDRAPPORT_INSTELLINGEN.aan': false },
          uitleg: 'Geen rapport: wat er gebeurde, zie je in de berichten, en je gaat zelf rond.' },
      ],
    },
    // Het land (werklijst vraag 63 en 69; js/land.js): tot het buurdorp er is, staat het uit, en speelt de proef zoals
    // nu. Dan wordt het een keuze bij Nieuw spel: 0 of 1 tegenspeler.
    {
      id: 'land', naam: 'Land', standaard: 'uit',
      uitleg: 'Of je over de weg je gehucht uit kunt, het land in.',
      keuzes: [
        { id: 'uit', naam: 'Uit', zet: { 'LAND_INSTELLINGEN.aan': false },
          uitleg: 'Je gehucht is de hele wereld, zoals in de proef.' },
        { id: 'aan', naam: 'Aan', zet: { 'LAND_INSTELLINGEN.aan': true },
          uitleg: 'Loop over de weg je gehucht uit, en de kaart van het land opent: provincies waar je dagen reist, en wat je nog niet zag, is donker. Thuis gaat alles door zonder jou; wat er gebeurde, hoor je als je terug bent. Het buurdorp komt nog.' },
      ],
    },
    {
      // Vraag 70, C (Marcel, 30 sep: "c ja"): de maker (js/maker.js) mag ook je eigen gehucht leggen. Sinds 4 okt de
      // standaard (vraag 112, a; Marcel: "Eigenlijk een random map generator per nieuwe game"). Sinds 8 okt maakt elk nieuw
      // spel het eiland, met je gehucht erop (vraag 117, stap 2; Marcel: "Het eiland wordt gewoon altijd gegenereerd bij
      // een nieuw spel. Ergens op dat eiland staat je gehucht"): geen keuze voor wie speelt, dus niet in het venster
      // Spelregels (`voorProeven`). De andere keuzes zijn er nog voor de toetsen en de speeltest.
      id: 'gehucht', naam: 'Je gehucht', standaard: 'eiland', voorProeven: true,
      uitleg: 'Waar een nieuw spel begint. Geldt vanaf het volgende nieuwe spel.',
      keuzes: [
        { id: 'maker', naam: 'Elk spel een ander', zet: { 'MAKER_INSTELLINGEN.eigenGehucht': true, 'MAKER_INSTELLINGEN.opEiland': false },
          uitleg: 'De maker legt elk nieuw spel een ander land, uit dezelfde delen: het plein, de schout erachter, de boerderijen bij hun akkers, de heide, de beek, het bos, vijvers en rotsen, maar elke keer anders. Bij Nieuw spel zie je het nummer van het land: een land dat je mooi vond, speel je opnieuw door dat nummer in te typen.' },
        { id: 'ontworpen', naam: 'Het ontworpen gehucht', zet: { 'MAKER_INSTELLINGEN.eigenGehucht': false, 'MAKER_INSTELLINGEN.opEiland': false },
          uitleg: 'Elk spel hetzelfde gehucht, met de hand gelegd: het plein als hart, en Klaas, Aaltje, Gerrit, Trijn en Wouter bij hun velden.' },
        // Vraag 117, stap 2 (Marcel, 8 okt: "A ja B later C dorp dat er al was"): je land is het stuk van het eiland om je
        // dorp (js/eiland.js).
        { id: 'eiland', naam: 'Op het eiland', zet: { 'MAKER_INSTELLINGEN.eigenGehucht': true, 'MAKER_INSTELLINGEN.opEiland': true },
          uitleg: 'Elk nummer is een eiland, en je dorp ligt erop: aan de kust, aan een rivier, op de heide of aan de bosrand. Het water, het bos, de heide en de wegen van je land zijn die van het eiland, en de weg door je dorp gaat naar het kasteel van de heer. Het gehucht is een dorp dat er al was: wat het nodig heeft, is gerooid.' },
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
    { naam: 'Het weer', blok: 'WEER_INSTELLINGEN' },
    { naam: 'De bode', blok: 'BODE_INSTELLINGEN' },
    { naam: 'De brand', blok: 'BRAND_INSTELLINGEN' },
    { naam: 'De koorts', blok: 'KOORTS_INSTELLINGEN' },
    { naam: 'Ouder worden', blok: 'LEVEN_INSTELLINGEN' },
    { naam: 'Klein leven', blok: 'KLEIN_LEVEN_INSTELLINGEN' },
    { naam: 'Het licht', blok: 'LICHT_INSTELLINGEN' },
    { naam: 'Gebouwen en bevolking', blok: 'GEBOUWEN_INSTELLINGEN' },
    { naam: 'De bewoners', blok: 'BEWONERS_INSTELLINGEN' },
    { naam: 'Lopen', blok: 'LOPEN_INSTELLINGEN' },
    { naam: 'De paadjes', blok: 'PADEN_INSTELLINGEN' },
    { naam: 'De praatjes', blok: 'PRAATJE_INSTELLINGEN' },
    { naam: 'De erven', blok: 'ERVEN_INSTELLINGEN' },
    { naam: 'De treden', blok: 'TREDEN_INSTELLINGEN' },
    { naam: 'De wetten', blok: 'WETTEN_INSTELLINGEN' },
    { naam: 'De rovers', blok: 'ROVERS_INSTELLINGEN' },
    { naam: 'De raad', blok: 'RAAD_INSTELLINGEN' },
    { naam: 'De herberg', blok: 'HERBERG_INSTELLINGEN' },
    { naam: 'Behoeften en de winter', blok: 'BEHOEFTEN_INSTELLINGEN' },
    { naam: 'De wensen', blok: 'WENSEN_INSTELLINGEN' },
    { naam: 'De marskramer', blok: 'HANDEL_INSTELLINGEN' },
    { naam: 'De heer', blok: 'HEER_INSTELLINGEN' },
    { naam: 'De heervaart', blok: 'HEERVAART_INSTELLINGEN' },
    { naam: 'De voorvallen', blok: 'VOORVALLEN_INSTELLINGEN' },
    { naam: 'De feesten', blok: 'FEESTEN_INSTELLINGEN' },
    { naam: 'De graanzak', blok: 'ZAAK_INSTELLINGEN' },
    { naam: 'De markt', blok: 'MARKT_INSTELLINGEN' },
    { naam: 'Het eind', blok: 'EINDE_INSTELLINGEN' },
    { naam: 'De verzoeken', blok: 'VERZOEKEN_INSTELLINGEN' },
    { naam: 'De ondernemers', blok: 'ONDERNEMERS_INSTELLINGEN' },
    { naam: 'De twee bazen', blok: 'BAZEN_INSTELLINGEN' },
    { naam: 'De grillen van de heer', blok: 'GRILLEN_INSTELLINGEN' },
    { naam: 'De raadsman', blok: 'RAADSMAN_INSTELLINGEN' },
    { naam: 'Het rapport', blok: 'OCHTENDRAPPORT_INSTELLINGEN' },
    { naam: 'Het land', blok: 'LAND_INSTELLINGEN' },
    { naam: 'De maker', blok: 'MAKER_INSTELLINGEN' },
    { naam: 'De inner', blok: 'INNER_INSTELLINGEN' },
    { naam: 'De verstopplekken', blok: 'VERSTOP_INSTELLINGEN' },
    { naam: 'De boeren', blok: 'BOEREN_INSTELLINGEN' },
    { naam: 'De velden', blok: 'VELDEN_INSTELLINGEN' },
    { naam: 'Het veldwerk', blok: 'VELDWERK_INSTELLINGEN' },
    { naam: 'Ontginnen', blok: 'ONTGINNEN_INSTELLINGEN' },
    { naam: 'De beesten in het bos', blok: 'BEESTEN_INSTELLINGEN' },
    { naam: 'De graanschuur en het zaaigraan', blok: 'GRAANSCHUUR_INSTELLINGEN' },
    { naam: 'Het bos', blok: 'BOS_INSTELLINGEN' },
    { naam: 'Het vee', blok: 'VEE_INSTELLINGEN' },
    { naam: 'De doorkijk', blok: 'DOORKIJK_INSTELLINGEN' },
    { naam: 'Het zichtveld', blok: 'ZIEN_INSTELLINGEN' },
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
    if (S && S.dorp && T.pasLotToe) T.pasLotToe(S.dorp);
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
    if ((ouderSleutel === 'prijs' || ouderSleutel === 'heeft') && bezoeken && bezoeken[i]) return bezoeken[i].naam; // per bezoek (js/handel.js)
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
  // klein is), een heel getal tot drie keer zo groot. Het getalveld ernaast kent geen grenzen. Een getal onder
  // nul (wat een wet van de tevredenheid afhaalt, js/wetten.js) krijgt hetzelfde bereik in spiegelbeeld, tot nul.
  T.werkbankBereik = function (st) {
    if (st < 0) {
      const b = T.werkbankBereik(-st);
      return { min: -b.max, max: 0, stap: b.stap };
    }
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
  // Onthouden, in de browser: waar, zegt T.opslagPlek (js/opslaan.js), dezelfde plek als voor de
  // opgeslagen spellen. Kan dat niet (een toets, een privévenster), dan gewoon niet: het spel werkt
  // dan met de standaard.
  // ---------------------------------------------------------------------------------------------

  const SLEUTEL = T.OPSLAG_SLEUTEL + '.spelregels';
  const opslag = () => T.opslagPlek();

  T.bewaarOpties = function (waar) {
    const o = waar || opslag();
    try {
      if (o) o.setItem(SLEUTEL, JSON.stringify(T.OPTIES_NU));
    } catch (e) {
      /* vol, of geblokkeerd: dan onthoudt de browser het niet */
    }
  };

  // Een spelregel voor de proeven (`voorProeven`, zoals "Je gehucht") staat niet in het venster, dus wat de browser
  // ervan onthield, telt alleen als een proef het daar zette (de speeltest, met `proef`). Anders liet een keus van
  // vroeger, toen hij nog in het venster stond, een nieuw spel stil ergens anders beginnen dan op het eiland, zonder dat
  // je ziet waarom.
  T.laadOpties = function (waar) {
    const o = waar || opslag();
    try {
      const tekst = o && o.getItem(SLEUTEL);
      const i = tekst ? JSON.parse(tekst) : null;
      if (!i || typeof i !== 'object') return null;
      if (!i.proef && i.keuzes) for (const optie of T.OPTIES) if (optie.voorProeven) delete i.keuzes[optie.id];
      return i;
    } catch (e) {
      return null;
    }
  };

  // Bij het laden: de standaard vastleggen, en wat de browser onthield meteen toepassen, zodat de
  // wereld en de poppetjes al met de juiste namen en getallen beginnen.
  neemStandaard();
  T.pasOptiesToe(T.laadOpties());
})(globalThis.Spel = globalThis.Spel || {});
