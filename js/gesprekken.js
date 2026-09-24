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
//     situaties: [...],     // alleen voor de schrijver; het spel leest ze nooit (zie hieronder)
//     knopen: { <knoop-id>: { tekst: [...], keuzes: [...] }, ... },
//   }
//
// 'situaties' is van gereedschap/gesprekken.html en van niemand anders. Een gesprek dat over vijf
// momenten in het verhaal gaat, staat hier als één hoop regels met voorwaarden ernaast, en dat is
// niet te lezen — dus kijkt de schrijver door één situatie tegelijk en tekent hij het gesprek
// zoals het dán loopt. Een situatie is een toestand, opgeschreven in dezelfde woorden als een
// voorwaarde, zodat er maar één woordenlijst is:
//
//   situaties: [{ naam: 'Na zijn dood', als: { vlag: 'meesterDood' } }]
//
// Wat hier ontkent (nietVlag, nietHeeft, nietQuest) hoeft niets te doen: de toestand begint leeg.
// De fasen van een quest staan er vanzelf bij bij wie hem geeft, en staan daarom niet in deze
// lijst.
//
// Een knoop heeft:
//   tekst  — een lijstje regels. De eerste regel waarvan de voorwaarde (als) klopt, wint. Een
//            regel zonder 'als' klopt altijd, en hoort daarom onderaan als vangnet.
//   keuzes — een lijstje antwoorden. Een keuze zonder 'als' is altijd te zien, met 'als' alleen
//            als die voorwaarde klopt. Een keuze heeft 'naar' (de volgende knoop) óf
//            'sluit: true' (het gesprek stopt); 'doe' mag erbij, voor een gevolg.
//
// Een voorwaarde (als) mag hebben:
//   vlag: 'naam'              — waar als die vlag gezet is (of een lijstje: dan allemaal)
//   nietVlag: 'naam'          — waar als die vlag NIET gezet is (of een lijstje: dan geen ervan)
//   heeft: 'ding'              — waar als je dat in je inventaris hebt (of een lijstje: allemaal)
//   nietHeeft: 'ding'          — waar als je dat niet hebt (of een lijstje: geen ervan)
//   ouderDan: 88               — waar als je ouder bent dan dat, in hele jaren
//   jongerDan: 88              — waar als je jonger bent dan dat, in hele jaren
//   ouderGewordenSinds: 12     — waar als je zoveel maanden of meer ouder bent geworden sinds je
//                                 deze persoon voor het laatst sprak (bij de allereerste keer
//                                 geldt hij nooit: er is dan nog geen "vorige keer")
//   quest: 'bakker'            — waar als die quest loopt; met fase: 'zoeken' (of een lijstje
//                                 fasen) alleen in die fase, met weg: 'marskramer' alleen als je
//                                 hem zo oploste
//   nietQuest: 'bakker'        — waar als die quest nog niet begonnen is
//   questAf: 'bakker'          — waar als die quest af is
//   goud: 10                   — waar als je er minstens tien hebt
//
// Een gevolg (doe) mag hebben: zetVlag en/of wisVlag (één naam, of een lijstje), geef en/of neem
// (een voorwerp in je tas of eruit), goud: 20 of goud: -15, en quest: 'bakker' met fase: 'zoeken'
// of weg: 'marskramer' (quest zonder allebei begint hem). Zie js/quests.js voor de quests zelf.
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
      situaties: [
        { naam: 'Na zijn dood', als: { vlag: 'meesterDood' } },
        { naam: 'De beurs gehad', als: { vlag: ['meesterDood', 'beursVanDeMeester'] } },
        { naam: 'Sleutel in de hand', als: { vlag: 'meesterDood', heeft: 'sleutel' } },
        { naam: 'Onderweg naar boven', als: { vlag: ['meesterDood', 'sleutelGebruikt'] } },
        { naam: 'Een jaar weggeweest', als: { vlag: 'meesterDood', ouderGewordenSinds: 12 } },
        { naam: 'De fontein is leeg', als: { vlag: ['meesterDood', 'fonteinLeeg'] } },
      ],
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
            { zeg: 'Heeft hij nog iets nagelaten?', naar: 'beurs', als: { vlag: 'meesterDood', nietVlag: 'beursVanDeMeester' } },
            { zeg: 'Wat is er vannacht gebeurd?', naar: 'aardschok', als: { vlag: 'meesterDood', nietVlag: 'sleutelGebruikt', nietHeeft: 'sleutel' } },
            { zeg: 'Waar is de sleutel van het trappenhuis?', naar: 'sleutel', als: { vlag: 'meesterDood', nietVlag: 'sleutelGebruikt', nietHeeft: 'sleutel' } },
            { zeg: 'Werkt de fontein nog?', naar: 'fontein', als: { vlag: 'meesterDood', nietVlag: 'sleutelGebruikt', nietHeeft: 'sleutel' } },
            { zeg: 'En de meester?', naar: 'deMeester', als: { vlag: 'meesterDood', nietVlag: 'sleutelGebruikt', nietHeeft: 'sleutel' } },
            { zeg: 'Ik ga naar boven, Wim.', sluit: true, als: { vlag: 'meesterDood', nietVlag: 'sleutelGebruikt', nietHeeft: 'sleutel' } },
          ],
        },
        // Zolang de meester leeft: de slijmkruiper die de tutorial je leert ontlopen.
        voorraad: {
          tekst: [
            { zeg: 'Iets wat er gisteren nog niet zat. Het kwam vannacht de trap af, na die schok, en nu zit het vlak achter de deur. Ik ga er niet meer in.' },
          ],
          keuzes: [
            { zeg: 'Tot straks, Wim.', sluit: true },
          ],
        },
        meer: {
          tekst: [
            { zeg: 'Wat wilt u nog weten, meester?' },
          ],
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
          tekst: [
            { zeg: 'Vannacht schudde het hele huis, en boven kraakte iets, heel lang. De meester zei dat het huis oud was, net als wij. Hij heeft daarboven ooit iets opgesloten, meester. Wat, dat wist hij zelf niet meer.' },
          ],
          keuzes: [
            { zeg: 'Wat kwam er de trap af?', naar: 'monsters' },
            { zeg: 'Nog iets anders.', naar: 'meer' },
          ],
        },
        monsters: {
          tekst: [
            { zeg: 'Die slijmkruiper, in de voorraadkamer. En bij de trap staat er nog zo een als dat van vanmiddag. Het staat daar maar, alsof het op iemand wacht. Ik heb de deur op slot gedaan.' },
          ],
          keuzes: [
            { zeg: 'Nog iets anders.', naar: 'meer' },
          ],
        },
        sleutel: {
          tekst: [
            { zeg: 'In de voorraadkamer. Ik liet hem vallen toen ik wegrende. Ik ben ook niet meer de jongste, meester. Maar dat bent u al helemaal niet meer.' },
          ],
          keuzes: [
            { zeg: 'Nog iets anders.', naar: 'meer' },
          ],
        },
        fontein: {
          tekst: [
            { als: { vlag: 'fonteinLeeg' }, zeg: 'Die staat droog, meester. De laatste slok heeft u zelf genomen.' },
            { zeg: 'Er zit nog één slok in. Eén. Hij maakt u een paar jaar jonger, maar daarna staat hij droog. Bewaar hem voor als het echt moet.' },
          ],
          keuzes: [
            { zeg: 'Nog iets anders.', naar: 'meer' },
          ],
        },
        deMeester: {
          tekst: [
            { zeg: 'Ik begraaf hem bij zijn bonen. Daar wilde hij liggen, zei hij altijd. Al wist je bij hem nooit of hij een grapje maakte.' },
          ],
          keuzes: [
            { zeg: 'Nog iets anders.', naar: 'meer' },
          ],
        },
        // De beurs van de meester: je eerste goud, en expres te weinig (ontwerp/toren.md). Acht
        // munten tegen de vijftien die de marskramer vraagt -- zo ligt die weg open en kun je hem
        // net niet nemen, en dat is pijnlijker en beter dan een deur die dicht zit zonder reden.
        // Weigeren zet geen vlag: dan blijft het aanbod staan, precies zoals Wim zegt.
        beurs: {
          tekst: [
            { zeg: 'In de la bij zijn bed lag een beursje. Acht munten, meester. Hij zei altijd dat een tovenaar geen geld nodig heeft. Nou, daar had hij dan gelijk in, want meer was het niet.' },
          ],
          keuzes: [
            { zeg: 'Geef maar hier, Wim.', naar: 'beursGekregen', doe: { zetVlag: 'beursVanDeMeester', goud: 8 } },
            { zeg: 'Houd jij het maar.', naar: 'beursGeweigerd' },
          ],
        },
        beursGekregen: {
          tekst: [
            { zeg: 'Acht. Ik heb ze twee keer geteld, want ik geloofde het zelf niet.' },
          ],
          keuzes: [
            { zeg: 'Dank je, Wim.', sluit: true },
          ],
        },
        beursGeweigerd: {
          tekst: [
            { zeg: 'Dat doe ik niet, meester. Ik leg het terug in de la. Dan ligt het er als u van gedachten verandert.' },
          ],
          keuzes: [
            { zeg: 'Goed, Wim.', sluit: true },
          ],
        },
      },
    },
    // De oude meester, in de tutorial (js/tutorial.js): wat hij zegt als je hem aanspreekt
    // tussen de scènes door, namelijk waar hij je voor nodig heeft. De scènes zelf staan hieronder,
    // in T.TUTORIAL_TEKST.
    meester: {
      naam: 'de oude meester',
      start: 'nu',
      situaties: [
        { naam: 'Om de boodschap gevraagd', als: { vlag: 'boodschapGevraagd' } },
        { naam: 'Water gehaald', als: { vlag: 'boodschapGevraagd', heeft: 'kom' } },
        { naam: 'Zaaigoed gehaald', als: { vlag: 'boodschapGevraagd', heeft: 'zak' } },
        { naam: 'Om de ton gevraagd', als: { vlag: 'tonGevraagd' } },
      ],
      knopen: {
        nu: {
          tekst: [
            { als: { vlag: 'tonGevraagd' }, zeg: 'Die andere ton, jongen. Met je staf. Dat kost niets.' },
            { als: { heeft: 'kom', nietHeeft: 'zak' }, zeg: 'Water, mooi. En mijn zaaigoed? Dat staat in de voorraadkamer.' },
            { als: { heeft: 'zak', nietHeeft: 'kom' }, zeg: 'Zaaigoed, mooi. En mijn water? De fontein staat in de hal.' },
            { als: { vlag: 'boodschapGevraagd' }, zeg: 'Een kom water uit de fontein, en een zak zaaigoed uit de voorraadkamer. Ik ben hier. Waar zou ik anders zijn.' },
            { zeg: 'Kom eens hier, jongen.' },
          ],
          keuzes: [
            { zeg: 'Ja, meester.', sluit: true },
          ],
        },
      },
    },
    // ── Het dorp: De koude oven (js/quests.js) ──
    // De bakker geeft de quest. Sinds de aardschok is zijn schoorsteen gespleten en blijft de
    // rook binnen. Hij klaagt graag en deelt uit; dat is dezelfde man.
    bakker: {
      naam: 'de bakker',
      start: 'welkom',
      situaties: [
        { naam: 'Met magie gebakken', als: { vlag: 'ovenMetMagie', questAf: 'bakker' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'ovenMetMagie' }, zeg: 'Ik heb het aan niemand verteld, hoor. Maar de koster kijkt sinds gisteren wel heel lang naar mijn schoorsteen.' },
            { als: { questAf: 'bakker' }, zeg: 'Hij trekt weer. Hoort u dat? Dat is lucht die de goede kant op gaat.' },
            { als: { quest: 'bakker', fase: 'terug' }, zeg: 'U hebt iets bij u. Ik ruik het aan uw handen: klei.' },
            { als: { quest: 'bakker', fase: 'zoeken' }, zeg: 'Nog niets? Geeft niet. Hij is nu toch al koud.' },
            { zeg: 'Koud. Al negen dagen koud. Ik heb het deeg maar aan de varkens gegeven, en dat is zonde van het deeg én een belediging voor de varkens.' },
          ],
          keuzes: [
            { zeg: 'Wat is er met uw oven?', naar: 'scheur', als: { nietQuest: 'bakker' } },
            { zeg: 'Waar zou ik zoiets vinden?', naar: 'waar', als: { quest: 'bakker', fase: 'zoeken' } },
            { zeg: 'Hier. Voor de scheur.', naar: 'gedankt', als: { quest: 'bakker', fase: 'terug' }, doe: { quest: 'bakker', weg: 'afgeven' } },
            { zeg: 'Sterkte, bakker.', sluit: true },
          ],
        },
        scheur: {
          tekst: [
            { zeg: 'De schok heeft de schoorsteen gespleten, van boven tot onder. De rook blijft binnen en het vuur wil niet trekken. Er moet leem in die scheur, of iets wat op leem lijkt en tegen hitte kan.' },
          ],
          keuzes: [
            { zeg: 'Ik zoek wel iets voor u.', naar: 'waar', doe: { quest: 'bakker' } },
            { zeg: 'Dat is dan pech, bakker.', sluit: true },
          ],
        },
        // De drie wegen, verteld zoals een bakker ze vertelt. De vierde noemt hij niet: dat je
        // er een vuurschicht in kunt gooien, moet de speler zelf bedenken.
        waar: {
          tekst: [
            { zeg: 'Bij de beek is een leemkuil. Alleen huist daar sinds die nacht iets, en ik ben bakker, geen held. De marskramer heeft vuurklei, maar die vraagt er een prijs voor waar ik hard voor moet kneden. En de vrouw van de smid heeft nog oude vuurstenen liggen, geloof ik.' },
          ],
          keuzes: [
            { zeg: 'Ik kijk wat ik kan doen.', sluit: true },
          ],
        },
        gedankt: {
          tekst: [
            { zeg: 'Kijk. Kijk nou toch. — Neem brood mee. Nee, u neemt brood mee. Dat is geen vraag.' },
          ],
          keuzes: [
            { zeg: 'Dank u, bakker.', sluit: true },
          ],
        },
      },
    },
    // De marskramer trekt van dorp tot dorp en koopt ook. De sleutel die hij vorige week kocht
    // (ontwerp/wereld.md) blijft hier een losse draad: die pakken we later op.
    marskramer: {
      naam: 'de marskramer',
      start: 'welkom',
      situaties: [
        { naam: 'De bakker zoekt leem', als: { quest: 'bakker', fase: 'zoeken' } },
        { naam: '…en je hebt het geld', als: { quest: 'bakker', goud: 15, fase: 'zoeken' } },
        { naam: 'De oven is weer warm', als: { vlag: 'ovenWarm' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'ovenWarm' }, zeg: 'De bakker bakt weer, hoor ik. Jammer. Ik had nog een mooie zak vuurklei.' },
            { als: { quest: 'bakker', fase: 'zoeken' }, zeg: 'Een tovenaar! Dan heb ik iets voor u. Nee, wacht — ú hebt iets voor mij. Dat voel ik.' },
            { zeg: 'Alles wat in een kar past, en een paar dingen die er niet in passen. Kijkt u gerust.' },
          ],
          keuzes: [
            { zeg: 'Hebt u iets voor een gescheurde schoorsteen?', naar: 'vuurklei', als: { quest: 'bakker', fase: 'zoeken' } },
            { zeg: 'Wat verkoopt u zoal?', naar: 'waren' },
            { zeg: 'Een andere keer.', sluit: true },
          ],
        },
        vuurklei: {
          tekst: [
            { als: { goud: 15 }, zeg: 'Vuurklei. Een hele zak. Vijftien, en dan zeg ik er niet bij dat de bakker er twintig voor zou geven.' },
            { zeg: 'Vuurklei. Een hele zak. Vijftien. — U kijkt alsof u er acht hebt. Zo kijken ze hier allemaal.' },
          ],
          keuzes: [
            { zeg: 'Vijftien. Hier.', naar: 'gekocht', als: { quest: 'bakker', goud: 15, fase: 'zoeken' }, doe: { quest: 'bakker', weg: 'kramer' } },
            { zeg: 'Ik kom terug.', naar: 'welkom' },
          ],
        },
        gekocht: {
          tekst: [
            { zeg: 'Voorzichtig, hij is zwaarder dan hij eruitziet. Net als de meeste dingen die vijftien kosten.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
        waren: {
          tekst: [
            { zeg: 'Lint, zout, spijkers, een spiegel die niet helemaal recht is. En soms iets waarvan ik zelf niet goed weet wat het is. Vorige week kocht ik nog een sleutel van iemand die zei dat hij hem bij uw toren had gevonden.' },
          ],
          keuzes: [
            { zeg: 'Bij mijn toren?', naar: 'sleutel' },
            { zeg: 'Een andere keer.', sluit: true },
          ],
        },
        sleutel: {
          tekst: [
            { zeg: 'Dat zei hij. Ik vraag nooit door, dat is slecht voor de handel. — Nee, ik heb hem niet meer. Verkocht, twee dorpen terug.' },
          ],
          keuzes: [
            { zeg: 'Hm.', sluit: true },
          ],
        },
      },
    },
    // De smidsvrouw doet de handel van de smidse en voert iedereen die stil blijft staan
    // (ontwerp/wereld.md). Zij geeft de vuurstenen meteen en vraagt er de eerste grondstof uit
    // de toren voor terug: een schuld die vandaag niets kost en straks precies datgene wat het
    // duurst is (Marcel, 22 sep 2026; zie ontwerp/toren.md).
    smidsvrouw: {
      naam: 'de smidsvrouw',
      start: 'welkom',
      situaties: [
        { naam: 'De bakker zoekt leem', als: { quest: 'bakker', fase: 'zoeken' } },
        { naam: 'Je staat bij haar in het krijt', als: { vlag: 'schuldSmidsvrouw' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schuldSmidsvrouw' }, zeg: 'Daar bent u. Eet eerst. — En ik ben niets vergeten, hoor, van wat u me nog komt laten zien uit dat huis van u.' },
            { als: { quest: 'bakker', fase: 'zoeken' }, zeg: 'U staat stil. Wie stilstaat, eet. Gaat u zitten.' },
            { zeg: 'Eet u wel genoeg? U bent zo mager als een spijker, en die maken we hier zelf.' },
          ],
          keuzes: [
            { zeg: 'Hebt u nog vuurstenen van de smidse?', naar: 'vuurstenen', als: { quest: 'bakker', fase: 'zoeken' } },
            { zeg: 'Ik eet straks.', sluit: true },
          ],
        },
        vuurstenen: {
          tekst: [
            { zeg: 'Een hele kist vol, en mijn man gebruikt ze toch niet meer. Neemt u mee. — Maar dan wil ik er iets voor terug, en niet in goud. Het eerste wat u uit die toren haalt dat glimt zoals hier niets glimt, dat brengt u eerst bij mij. Kijken mag toch.' },
          ],
          keuzes: [
            { zeg: 'Afgesproken.', naar: 'afgesproken', doe: { quest: 'bakker', weg: 'smidsvrouw' } },
            { zeg: 'Dat beloof ik liever niet.', naar: 'geweigerd' },
          ],
        },
        afgesproken: {
          tekst: [
            { zeg: 'Dan is dat dat. — En nu eet u wél iets, want afspraken maak ik niet met mensen die omvallen.' },
          ],
          keuzes: [
            { zeg: 'Dank u.', sluit: true },
          ],
        },
        geweigerd: {
          tekst: [
            { zeg: 'Verstandig. De meeste mensen beloven te snel. Ze liggen hier nog, als u zich bedenkt.' },
          ],
          keuzes: [
            { zeg: 'Ik denk erover.', sluit: true },
          ],
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
      "Zie je die ouwe ton? Daar zitten de hele dag kraaien op, en 's avonds zitten ze in mijn kool.",
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

    // ── Als je vastzit ──
    //
    // Het vak linksboven dat je vertelde welke knop je moest indrukken, is er op 22 sep uit
    // gegaan (Marcel: "veel te cringe"). ontwerp/verhaal.md zegt waarom: iemand die stilstaat en
    // uitlegt is een tutorial. Wat ervoor in de plaats komt is een mens: sta je een poos stil op
    // hetzelfde moment, dan zegt Wim er iets over als hij in de buurt is, en anders de meester.
    //
    // Zolang hieronder niets staat, zegt er ook niemand iets. Dat is met opzet: beter stil dan
    // een uitlegger. Wat er komt te staan, hoort te klinken als iemand die zich ermee bemoeit —
    // niet als een aanwijzing. ("Hij staat daar. Bij zijn bonen." zegt hetzelfde als "Loop naar de
    // meester", maar het is iemand die het zegt.)
    //
    // Te bewerken in gereedschap/gesprekken.html, onder "De tutorial".

    // Je bent de toren uit en de meester roept je, maar je blijft staan.
    vastMeester: [],
    // Hij vroeg om water uit de fontein, en je hebt de kom nog niet.
    vastKom: [],
    // De kom heb je; de zak zaaigoed uit de voorraadkamer nog niet. Daar zit de slijmkruiper.
    vastZak: [],
    // Je hebt allebei, maar je brengt ze hem niet.
    vastBrengen: [],
    // De slijmkruiper heeft je gezien en je staat stil in het gevecht. (Een stap terug, de deur
    // dicht — dat zei hij zelf al bij de boodschap, dus dit is de herinnering, niet de uitleg.)
    vastGezien: [],
    // Hij heeft één ton kapotgeslagen en wacht tot jij de andere doet.
    vastSlaan: [],
  };
})(globalThis.Toren = globalThis.Toren || {});
