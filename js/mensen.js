// De mensen van het dorp: wie ze zijn, op één plek.
//
// Waarom dit bestaat (Marcel, 22 sep 2026): "Hoe houden we alle poppetjes uit elkaar? Het kunnen
// er wel 100 worden." Een mens stond tot nu toe op vier plekken verdeeld — zijn uiterlijk en zijn
// stats in T.WEZENS, zijn tekst in T.GESPREKKEN, zijn quest als `gever` in T.QUESTS, en zijn plek
// op de kaart. Bij achttien kun je dat onthouden; bij honderd niet, en niets verbond ze: je kon
// dezelfde bakker op twee plekken neerzetten zonder dat iets klaagde.
//
// Nu is één mens één regel hier, en zegt de kaart alleen nog wáár hij staat:
//
//   kaarten/<naam>.betekenis.json:  { "x": 17, "y": 14, "wie": "boer1", "straal": 3 }
//
// Wie geen naam hoeft te hebben, staat er niet in. Dat is de menigte: `{ x, y, zaad: 7 }` zet een
// gewone dorpeling neer die niets zegt en nergens bij hoort. Zie ontwerp/wereld.md, "Een flink
// dorp": achttien mensen met een karakter en een haakje voor een quest, en daarnaast zoveel
// figuranten als het dorp druk moet doen aanvoelen. Alleen die eerste groep hoef je uit elkaar te
// houden.
//
// ── Vorm van één mens ──
//
//   T.MENSEN.<id> = {
//     naam:     'Klaas',       // wat er boven zijn hoofd staat; mag weg als `wezen` het al zegt
//     vel:      'boer',        // het vel dat hij leent zolang het zijne nog niet getekend is
//     zaad:     4,             // óf: hij ís zolang een gewone dorpeling, met dit zaad
//     wezen:    'wolf',        // óf: hij leent een hele ingang uit T.WEZENS (tot 25 sep deden Wim
//                              //     en de meester dat; nu niemand)
//     straal:   3,             // hoe ver hij van zijn plek af dwaalt (de kaart mag het overrulen)
//     snelheid: 1.3,           // alleen als hij anders loopt dan zijn wezen of een dorpeling
//     gesprek:  'heer',        // welk gesprek hij voert; zonder dit is het zijn eigen id
//     karakter: 'zanger',      // alleen de boeren: wie hij is als er niet geloot wordt (T.KARAKTERS
//                              // hieronder, js/boeren.js). Zijn gesprek is dan dat van zijn
//                              // karakter, en alleen wie een karakter heeft, kan aan de schandpaal.
//     geslacht: 'vrouw',       // alleen de boeren: een weduwe of vroedvrouw wordt altijd een boerin
//     aanzien:  'geliefd',     // alleen de boeren: hoe het dorp hem ziet als er niet geloot wordt en
//                              // zijn karakter het niet vastlegt (js/boeren.js)
//   }
//
// Zonder `wezen` en zonder `zaad` is hij zichzelf: zijn id is de naam van zijn vel. De veertien
// dorpelingen stonden tot 22 sep als eigen ingang in T.WEZENS, met veertien keer dezelfde regel
// `kant: 'neutraal', leven: 10, ap: 0, initiatief: 0`. Die tabel gaat over wat een wezen ís — wat
// vecht, wat in code wordt neergezet — en een dorpeling is dat niet; hier staat hij in één regel.
(function (T) {
  'use strict';

  T.MENSEN = {
    // Het dorp, zoals ontwerp/wereld.md het opschrijft. Ze stonden op de oude kaart
    // (kaarten/wereld.tmj), die op 25 sep wegging met het oude spel; hun vellen en hun loopmaat
    // blijven hier, voor als het gehucht een dorp wordt (werklijst punt 14). `snelheid` moet gelijk
    // zijn aan de SNELHEID-constante van zijn animatie (de dorpelingen*.cjs in gereedschap/pixelart),
    // anders gaan zijn voeten over de grond glijden.
    smid: { naam: 'de smid', snelheid: 1.5, straal: 3 },
    smidsvrouw: { naam: 'de smidsvrouw', snelheid: 1.45, straal: 3 },
    herbergierster: { naam: 'de herbergierster', snelheid: 1.4, straal: 3 },
    boer: { naam: 'de boer', snelheid: 1.5, straal: 3 },
    boerin: { naam: 'de boerin', snelheid: 1.4, straal: 3 },
    dorpsoudste: { naam: 'de dorpsoudste', snelheid: 1, straal: 3 },
    oudeman: { naam: 'de oude man', snelheid: 1, straal: 3 },
    bruid: { naam: 'de bruid', snelheid: 1.3, straal: 3 },
    bruidegom: { naam: 'de bruidegom', snelheid: 1.5, straal: 3 },
    jongen: { naam: 'de jongen', snelheid: 1.3, straal: 3 },
    meisje: { naam: 'het meisje', snelheid: 1.25, straal: 3 },
    kleuter: { naam: 'de kleuter', snelheid: 0.85, straal: 3 },

    // De marskramer loopt sinds 25 sep op zijn eigen vel, klein en krom onder zijn rek
    // (gereedschap/pixelart/dorpelingen3.cjs; ontwerp/beeld.md, "De marskramer loopt"), en dat is
    // op deze snelheid gemaakt. Hij komt over de weg en staat op geen kaart (`bezoeker`, zie de heer
    // hieronder): tot 25 sep stond hij ook in het dorp van het oude spel.
    marskramer: { naam: 'de marskramer', snelheid: 1.4, straal: 2, bezoeker: true },

    // De heer en zijn soldaten (js/heer.js): ze komen op Sint-Maarten over de weg, en niet op een
    // kaart. Sinds 24 sep hebben ze hun eigen vellen, in rood en geel, het huis van de heer
    // (gereedschap/pixelart/heer.cjs, ontwerp/beeld.md): de heer klein en dik onder een veel te
    // grote hoed, de soldaten groot en zwaar met een hellebaard. De koets is nog tekenwerk. Twee
    // soldaten zijn twee keer dezelfde mens; dat mag, want ze staan op geen kaart.
    // `bezoeker`: hij komt over de weg en staat op geen kaart, dus de controle in
    // gereedschap/wereld.html vraagt niet waar hij staat.
    // Hun loopvellen (heer.cjs) zijn op deze snelheden gemaakt. Glijden doen hun voeten nooit (het
    // spel telt de pas uit de afgelegde weg, js/sprites.js), maar met een andere snelheid stappen
    // ze vlugger of trager dan bedoeld: render de vellen dan opnieuw.
    heer: { naam: 'de heer', snelheid: 1.55, straal: 1, vel: 'heer', bezoeker: true },
    soldaat: { naam: 'een soldaat', snelheid: 1.5, straal: 2, vel: 'soldaat', bezoeker: true },
    // De inner (js/inner.js): de man van de heer die in oogstmaand komt tellen. Mager en sober in
    // het donker, met een rekenboek onder de arm; alleen zijn hozen dragen de livrei.
    inner: { naam: 'de inner', snelheid: 1.5, straal: 1, vel: 'inner', bezoeker: true },

    // En de vaklieden die wel een haakje hebben in wereld.md maar nog geen tekening: zij zijn
    // zolang een gewone dorpeling, want die vellen bestaan al (zie de werklijst, fase B2b).
    molenaar: { naam: 'de molenaar', zaad: 11, straal: 3 },
    kruidenvrouw: { naam: 'de kruidenvrouw', zaad: 12, straal: 2 },
    jager: { naam: 'de jager', zaad: 13, straal: 4 },
    koster: { naam: 'de koster', zaad: 14, straal: 3 },
    wachter: { naam: 'de wachter', zaad: 15, straal: 2 },

    // De vijf boerengezinnen van het gehucht (kaarten/gehucht.betekenis.json, ontwerp/spel.md,
    // "Het eerste proefje"), elk met zijn eigen akker (`huis` op de kaart koppelt hem aan zijn
    // akker(s), js/kaart.js/js/akkers.js). Vijf eigen ingangen in plaats van steeds "boer"/
    // "boerin" hierboven, want één mens kan van T.keurKaart maar op één plek staan (gereedschap/
    // keuring.js) — dit zijn wél vijf keer hetzelfde geleende vel, en dat mag: ze lenen het van wie
    // het al heeft, om en om "boer" en "boerin" voor wat variatie.
    //
    // Sinds Sint-Maarten (24 sep, js/heer.js) hebben ze een naam, want wie de heer te weinig geeft,
    // zet iemand aan de schandpaal, en dan moet je ze uit elkaar kunnen houden. Wie ze zijn en wat
    // ze kunnen, wordt bij elk spel geloot (Marcel, 24 sep; js/boeren.js): de naam hoort bij de
    // boer, het karakter niet. Wat hier als karakter staat, is wie ze zijn als er niet geloot wordt:
    // zoals ze eerst geschreven waren.
    boer1: { naam: 'Klaas', vel: 'boer', geslacht: 'man', snelheid: 1.5, straal: 3, karakter: 'zanger', aanzien: 'geliefd' },
    boer2: { naam: 'Aaltje', vel: 'boerin', geslacht: 'vrouw', snelheid: 1.4, straal: 3, karakter: 'weduwe' },
    boer3: { naam: 'Gerrit', vel: 'boer', geslacht: 'man', snelheid: 1.5, straal: 3, karakter: 'woekeraar' },
    boer4: { naam: 'Trijn', vel: 'boerin', geslacht: 'vrouw', snelheid: 1.4, straal: 3, karakter: 'vroedvrouw' },
    boer5: { naam: 'Wouter', vel: 'boer', geslacht: 'man', snelheid: 1.5, straal: 3, karakter: 'heethoofd' },
  };

  // De stapel karakters waaruit de boeren trekken (js/boeren.js, T.lootBoeren): wie een boer is,
  // in één woord (kort, bij de muis) en in een paar (lang, boven zijn gesprek en bij de
  // schandpaal). Elk karakter voert zijn eigen gesprek in js/gesprekken.js, onder dezelfde naam.
  // `geslacht` alleen waar het karakter het vastlegt; `aanzien` alleen waar het dorp er vanzelf
  // iets van vindt (js/boeren.js, T.BOEREN_INSTELLINGEN.aanzien). De teksten zeggen
  // geen hij of zij, want dezelfde zanger kan een boer of een boerin zijn.
  T.KARAKTERS = {
    zanger: { kort: 'zanger', lang: "zingt 's avonds in de schuur, en de hele buurt zingt mee" },
    weduwe: { kort: 'weduwe', lang: 'weduwe, met drie kleine kinderen', geslacht: 'vrouw', aanzien: 'geliefd' },
    woekeraar: { kort: 'woekeraar', lang: 'leent graan uit tegen woeker', aanzien: 'gehaat' },
    vroedvrouw: { kort: 'vroedvrouw', lang: 'de vroedvrouw: de halve buurt heeft ze ter wereld geholpen', geslacht: 'vrouw', aanzien: 'geliefd' },
    heethoofd: { kort: 'heethoofd', lang: 'een heethoofd; sloeg eens een knecht van de heer' },
    vrome: { kort: 'vroom', lang: 'bidt drie keer per dag, en één keer voor de heer' },
    roddelaar: { kort: 'roddelaar', lang: 'weet alles van iedereen, en vertelt het ook' },
    grijsaard: { kort: 'de oudste', lang: 'de oudste van het gehucht; zag drie heren komen en gaan' },
    nieuwkomer: { kort: 'nieuwkomer', lang: 'kwam vorig jaar uit het buurdorp, en niemand weet waarom' },
    drinker: { kort: 'drinker', lang: 'drinkt meer bier dan er ooit gebrouwen werd' },
  };

  // Hoe heet deze mens? Zijn eigen naam, anders die van het wezen dat hij leent (Wim, de
  // meester), anders zijn id.
  T.naamVanMens = function (id) {
    const m = T.MENSEN[id];
    if (!m) return id;
    if (m.naam) return m.naam;
    const w = m.wezen && T.WEZENS ? T.WEZENS[m.wezen] : null;
    return (w && w.naam) || id;
  };

  // Welk gesprek voert hij? Zijn eigen id, tenzij er iets anders staat — zo kunnen de bruid en de
  // bruidegom desnoods hetzelfde gesprek delen zonder dat het een ongelukje lijkt.
  // Een boer voert het gesprek van zijn karakter (js/boeren.js zet het geloote op zijn poppetje).
  T.gesprekVanMens = (id) => (T.MENSEN[id] && (T.MENSEN[id].gesprek || T.MENSEN[id].karakter)) || id;

  // Een gewone dorpeling: geen gevecht, geen levensbalk, hij staat en kijkt en dwaalt wat rond.
  // Dezelfde vorm als maakWezen in wereld.js, maar zonder een ingang in T.WEZENS — want die
  // tabel gaat over wat een wezen ís, en er komen er honderd van deze. Het zaad bepaalt zijn
  // uiterlijk (S.dorpelingVariant in js/sprites.js), en `gesprek` welke tekst hij voert.
  T.maakDorpeling = function (zaad, x, y, straal, gesprek) {
    return {
      soort: 'dorpeling', naam: 'dorpeling', kant: 'neutraal', zaad, gesprek: gesprek || null,
      x, y, tx: x, ty: y, pad: [], onderweg: false, opKlaar: null,
      leven: 0, maxLeven: 0, ap: 0, maxAp: 0, initiatief: 0, snelheid: 1.2, zicht: 0,
      // Waar hij hoort en hoe ver hij daarvandaan loopt: de smid bij de smidse, de boerin bij de
      // akker. Zonder straal blijft hij staan waar hij staat. Hij begint nooit een gevecht (hij is
      // neutraal) en telt niet mee in de beurtvolgorde.
      thuis: { x, y }, straal: straal || 0, dwaalt: straal > 0, aanval: null,
      vel: null,
      dwaalTijd: 1 + Math.random() * 2, fase: Math.random() * 6.28,
      dood: false, sterfTijd: 0, uitval: null, flits: 0, alarm: 0,
    };
  };

  // Een mens neerzetten als wezen in de wereld.
  //
  // Welk vel hij krijgt volgt uit wat er over hem bekend is (js/sprites.js, S.houding):
  //   `wezen`  — hij leent een hele ingang uit T.WEZENS: Wim, de meester.
  //   `zaad`   — hij is zolang een gewone dorpeling, met dat zaad als uiterlijk.
  //   geen van beide — hij is zichzelf: zijn id is de naam van zijn vel, en `vel` is het vel dat
  //                    hij leent zolang het zijne nog niet getekend is.
  T.maakMens = function (id, x, y, straal) {
    const m = T.MENSEN[id];
    if (!m) throw new Error(`onbekende mens "${id}"`);
    const ver = straal != null && straal > 0 ? straal : m.straal || 0;
    let e;
    if (m.wezen) {
      e = T.maakWezen(m.wezen, x, y);
    } else {
      e = T.maakDorpeling(m.zaad != null ? m.zaad : 0, x, y, ver);
      if (m.zaad == null) {
        e.soort = id; // zijn eigen vel, onder zijn eigen naam
        e.zaad = null;
      }
      if (m.vel) e.vel = m.vel;
      // Een mens is geen naamloze figurant: hij heeft, net als Wim en de meester, levenspunten.
      e.leven = e.maxLeven = 10;
    }
    e.wie = id;
    e.naam = T.naamVanMens(id);
    e.gesprek = T.gesprekVanMens(id);
    if (m.snelheid) e.snelheid = m.snelheid;
    if (ver > 0) {
      e.thuis = { x, y };
      e.straal = ver;
      e.dwaalt = true;
    }
    return e;
  };
})(globalThis.Spel = globalThis.Spel || {});
