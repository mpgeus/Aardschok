// De gesprekken, als gewone gegevens. Dit bestand is bedoeld om in te schrijven zonder te
// programmeren: nieuwe tekst, een nieuwe keuze of een nieuwe knoop erbij, in dezelfde vorm als
// wat er al staat. De regels die hierover beslissen (welke regel geldt, welke keuzes je ziet)
// staan in gesprek.js.
//
// Vorm van één gesprek:
//   T.GESPREKKEN.<id> = {
//     naam: 'Wim',          // boven het gesprek
//     portret: 'wim',       // bestandsnaam van het portret; weg laten als die er nog niet is
//     start: 'welkom',      // met welke knoop het gesprek begint
//     knopen: { <knoop-id>: { tekst: [...], keuzes: [...] }, ... },
//   }
//
// Een knoop heeft:
//   tekst  — een lijstje regels. De eerste regel waarvan de voorwaarde (als) klopt, wint. Een
//            regel zonder 'als' klopt altijd, en hoort daarom onderaan als vangnet.
//   keuzes — een lijstje antwoorden. Een keuze zonder 'als' is altijd te zien, met 'als' alleen
//            als die voorwaarde klopt. Een keuze heeft 'naar' (de volgende knoop) óf
//            'sluit: true' (het gesprek stopt); 'doe' mag erbij, voor een gevolg.
//
// Een voorwaarde (als) mag hebben:
//   vlag: 'naam'              — waar als die vlag gezet is
//   nietVlag: 'naam'          — waar als die vlag NIET gezet is
//   heeft: 'ding'              — waar als je dat in je inventaris hebt
//   nietHeeft: 'ding'          — waar als je dat niet hebt
//   ouderDan: 88               — waar als je ouder bent dan dat, in hele jaren
//   jongerDan: 88              — waar als je jonger bent dan dat, in hele jaren
//   ouderGewordenSinds: 12     — waar als je zoveel maanden of meer ouder bent geworden sinds je
//                                 deze persoon voor het laatst sprak (bij de allereerste keer
//                                 geldt hij nooit: er is dan nog geen "vorige keer")
//
// Een gevolg (doe) mag hebben: zetVlag: 'naam' en/of wisVlag: 'naam' (één naam, of een lijstje).
// Goud en quests bestaan nog niet; daar is later ruimte voor, maar dat verzinnen we hier nog niet.
(function (T) {
  'use strict';

  T.GESPREKKEN = {
    // Wim is de knecht van de meester (ontwerp/verhaal.md, Personen). Hij heeft zijn hele leven
    // voor hem gewerkt, en je erft hem samen met de toren. Zolang de meester leeft (de tutorial,
    // js/tutorial.js), zegt Wim "meester" tegen hém en "u" tegen jou. Na de dood (vlag
    // meesterDood) zegt hij het, aarzelend, tegen jou.
    wim: {
      naam: 'Wim',
      portret: 'wim',
      start: 'welkom',
      knopen: {
        welkom: {
          tekst: [
            { als: { nietVlag: 'meesterDood' }, zeg: 'De meester? Die is buiten, bij zijn bonen. Waar anders.' },
            { als: { vlag: 'sleutelGebruikt' }, zeg: 'Ga maar, meester. Ik veeg de trap nog één keer, voor het geval dat.' },
            { als: { heeft: 'sleutel' }, zeg: 'U hebt de sleutel. Wees voorzichtig daarboven, meester. Eén meester begraven is genoeg voor een knecht.' },
            // Het bewijs dat het dorp je ouder ziet worden (ontwerp/spreuken.md, "Het dorp ziet
            // je ouder worden"): terughoudend, geen grap over wat er met honderd jaar gebeurt.
            { als: { ouderGewordenSinds: 12 }, zeg: 'U bent weer terug, meester — en een jaar ouder dan toen u wegging. Ik zal er verder niets over zeggen.' },
            { zeg: 'Meester. Zo moet ik u nu noemen, hè. Het went wel. Denk ik.' },
          ],
          keuzes: [
            // Zolang de meester leeft.
            { zeg: 'Wat zit er in de voorraadkamer?', naar: 'voorraad', als: { nietVlag: 'meesterDood' } },
            { zeg: 'Tot straks, Wim.', sluit: true, als: { nietVlag: 'meesterDood' } },
            // Daarna.
            { zeg: 'Dank je, Wim.', sluit: true, als: { vlag: 'sleutelGebruikt' } },
            { zeg: 'Wat staat er bij de trap?', naar: 'monsters', als: { vlag: 'meesterDood', heeft: 'sleutel' } },
            { zeg: 'Ik ga, Wim.', sluit: true, als: { vlag: 'meesterDood', heeft: 'sleutel' } },
            { zeg: 'Wat is er vannacht gebeurd?', naar: 'aardschok', als: { vlag: 'meesterDood', nietHeeft: 'sleutel', nietVlag: 'sleutelGebruikt' } },
            { zeg: 'Waar is de sleutel van het trappenhuis?', naar: 'sleutel', als: { vlag: 'meesterDood', nietHeeft: 'sleutel', nietVlag: 'sleutelGebruikt' } },
            { zeg: 'Werkt de fontein nog?', naar: 'fontein', als: { vlag: 'meesterDood', nietHeeft: 'sleutel', nietVlag: 'sleutelGebruikt' } },
            { zeg: 'En de meester?', naar: 'deMeester', als: { vlag: 'meesterDood', nietHeeft: 'sleutel', nietVlag: 'sleutelGebruikt' } },
            { zeg: 'Ik ga naar boven, Wim.', sluit: true, als: { vlag: 'meesterDood', nietHeeft: 'sleutel', nietVlag: 'sleutelGebruikt' } },
          ],
        },
        // Zolang de meester leeft: de slijmkruiper die de tutorial je leert ontlopen.
        voorraad: {
          tekst: [{ zeg: 'Iets wat er gisteren nog niet zat. Het kwam vannacht de trap af, na die schok, en nu zit het vlak achter de deur. Ik ga er niet meer in.' }],
          keuzes: [{ zeg: 'Tot straks, Wim.', sluit: true }],
        },
        meer: {
          tekst: [{ zeg: 'Wat wilt u nog weten, meester?' }],
          keuzes: [
            { zeg: 'Wat is er vannacht gebeurd?', naar: 'aardschok' },
            { zeg: 'Waar is de sleutel van het trappenhuis?', naar: 'sleutel' },
            { zeg: 'Werkt de fontein nog?', naar: 'fontein' },
            { zeg: 'En de meester?', naar: 'deMeester' },
            { zeg: 'Ik ga naar boven, Wim.', sluit: true },
          ],
        },
        // De meester sloot het op en vergat het (ontwerp/verhaal.md, "Wat er boven zit").
        aardschok: {
          tekst: [{ zeg: 'Vannacht schudde het hele huis, en boven kraakte iets, heel lang. De meester zei dat het huis oud was, net als wij. Hij heeft daarboven ooit iets opgesloten, meester. Wat, dat wist hij zelf niet meer.' }],
          keuzes: [
            { zeg: 'Wat kwam er de trap af?', naar: 'monsters' },
            { zeg: 'Nog iets anders.', naar: 'meer' },
          ],
        },
        monsters: {
          tekst: [{ zeg: 'Die slijmkruiper, in de voorraadkamer. En bij de trap staat er nog zo een als dat van vanmiddag. Het staat daar maar, alsof het op iemand wacht. Ik heb de deur op slot gedaan.' }],
          keuzes: [{ zeg: 'Nog iets anders.', naar: 'meer' }],
        },
        sleutel: {
          tekst: [{ zeg: 'In de voorraadkamer. Ik liet hem vallen toen ik wegrende. Ik ben ook niet meer de jongste, meester. Maar dat bent u al helemaal niet meer.' }],
          keuzes: [{ zeg: 'Nog iets anders.', naar: 'meer' }],
        },
        fontein: {
          tekst: [
            { als: { vlag: 'fonteinLeeg' }, zeg: 'Die staat droog, meester. De laatste slok heeft u zelf genomen.' },
            { zeg: 'Er zit nog één slok in. Eén. Hij maakt u een paar jaar jonger, maar daarna staat hij droog. Bewaar hem voor als het echt moet.' },
          ],
          keuzes: [{ zeg: 'Nog iets anders.', naar: 'meer' }],
        },
        deMeester: {
          tekst: [{ zeg: 'Ik begraaf hem bij zijn bonen. Daar wilde hij liggen, zei hij altijd. Al wist je bij hem nooit of hij een grapje maakte.' }],
          keuzes: [{ zeg: 'Nog iets anders.', naar: 'meer' }],
        },
      },
    },

    // De oude meester, in de tutorial (js/tutorial.js): wat hij zegt als je hem aanspreekt
    // tussen de scènes door, namelijk waar hij je voor nodig heeft. De scènes zelf staan hieronder,
    // in T.TUTORIAL_TEKST.
    meester: {
      naam: 'de oude meester',
      start: 'nu',
      knopen: {
        nu: {
          tekst: [
            { als: { vlag: 'tonGevraagd' }, zeg: 'Die andere ton, jongen. Met je staf. Dat kost niets.' },
            { als: { heeft: 'kom', nietHeeft: 'zak' }, zeg: 'Water, mooi. En mijn zaaigoed? Dat staat in de voorraadkamer.' },
            { als: { heeft: 'zak', nietHeeft: 'kom' }, zeg: 'Zaaigoed, mooi. En mijn water? De fontein staat in de hal.' },
            { als: { vlag: 'boodschapGevraagd' }, zeg: 'Een kom water uit de fontein, en een zak zaaigoed uit de voorraadkamer. Ik ben hier. Waar zou ik anders zijn.' },
            { zeg: 'Kom eens hier, jongen.' },
          ],
          keuzes: [{ zeg: 'Ja, meester.', sluit: true }],
        },
      },
    },
  };

  // De tutorial: wat de meester en Wim zeggen in de scènes van js/tutorial.js, in de volgorde
  // waarin het gebeurt. Elke regel is één keer "Verder". Wie er praat, staat bij de naam van het
  // stuk; de meester zegt "jongen" tegen je, al ben je vierentachtig. Eerste, ruwe versie
  // (22 sep 2026): om te polijsten. De toon: weemoedig met een knipoog, nooit grappig ten koste
  // van de ernst (ontwerp/verhaal.md).
  T.TUTORIAL_TEKST = {
    // De meester, als het spel begint: hij staat in zijn moestuin en ziet je de toren uit komen.
    roepen: ['Daar ben je. Kom eens hier, jongen. Ik roep niet meer zo hard als vroeger.'],
    // De meester, bij de oude ton (in het ontwerp een kraai op zijn kool; die is er nog niet).
    tonVoor: [
      'Zie je die ouwe ton? Daar zitten de hele dag kraaien op, en \'s avonds zitten ze in mijn kool.',
      'Let op.',
    ],
    // Na de vuurschicht: zevenennegentig werd achtennegentig, en hij lacht erom.
    tonNa: ['Ha! Achtennegentig. Een heel jaar, voor een ton. En hij staat er nog ook.'],
    boodschap: [
      'Weet je wat? Haal eens een kom water uit de fontein voor me. En een zak zaaigoed uit de voorraadkamer; de wintergroente moet erin voor het gaat vriezen.',
      'Wim zegt dat er sinds vannacht iets in de voorraadkamer zit. Loop gebukt, dan ziet het je pas als je er vlak bij bent.',
      'En ziet het je toch: een stap terug, en de deur dicht. Die beesten doen geen deuren open. Dat heeft niemand ze ooit geleerd.',
    ],
    // Wim, als je voor het eerst de hal in komt.
    wimBinnen: [
      'O, u bent het. Ik dacht even dat het de meester was.',
      'Water uit de fontein? Voor hem? Er zit bijna niets meer in, en dat weet hij best.',
    ],
    // Wim, als je de kom hebt geschept. Er blijft één slok over: de laatste, en die is van jou.
    wimSchep: ['Nu zit er nog één slok in. De laatste. Als hij er later om verlegen zit: ik heb het gezegd.'],
    // Wim, als de slijmkruiper je gezien heeft en jij de deur hebt dichtgegooid.
    terugkruipen: ['Hij kruipt weer naar achteren, hoor ik. Nu gebukt erin, dan hoort hij u niet.'],
    // De meester, als je hem zijn water en zaaigoed brengt.
    drinkenVoor: ['Ah. Water.'],
    // Na het water: achtennegentig werd zesennegentig.
    drinkenNa: ['Zie je wel? Zesennegentig. Het is maar een getal.'],
    // Na de klap met zijn staf.
    staf: ['En dit kost niets. Een goeie klap met je staf. Het enige in dit vak dat niets kost.'],
    jij: ['Daar staat er nog een. Jij.'],
    // Als jij de tweede ton kapot hebt geslagen.
    goedzo: ['Zo. Niets gekost. Onthoud dat, als je ooit denkt dat je moet toveren.'],
    bonen: ['Nu de bonen nog.'],
    // Wim, die de toren uit komt rennen.
    wimOnraad: ['Meester! Meester! Er komt iets de trap af!'],
    // De meester, tussen jou en de toren.
    blijfAchter: ['Blijf achter me, jongen.'],
    taai: ['Taai ding.'],
    // Voor de laatste spreuk: hij staat op negenennegentig, en weet wat de volgende kost.
    laatste: ['Negenennegentig.', 'Had ik die ton maar laten staan.', 'Nog één, jongen. Kijk goed.'],
    // Wim, bij de meester.
    rouw: ['Meester?', 'Meester.', 'Hij had zijn bonen nog niet gedaan.'],
    // Wim, bij de meester, als je te lang weg was en hem dood terugvindt. De eerste regel tegen jou,
    // de rest tegen hem. Wat er gebeurd is, vertelt hij niet.
    rouwLaat: ['U was er niet.', 'Hij had zijn bonen nog niet gedaan.'],
    // Wim, tegen jou.
    overnemen: ['...Meester?', 'Ik ga de trap vegen. Dat deed ik altijd, als ik niet wist wat ik moest doen.'],
  };
})(globalThis.Toren = globalThis.Toren || {});
