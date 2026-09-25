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
// En handel: true opent het handelsvenster van de marskramer (js/handel.js, js/hud.js), en
// heer: true het venster waarin je de heer betaalt op Sint-Maarten (js/heer.js, js/hud.js).
(function (T) {
  'use strict';

  T.GESPREKKEN = {
    // Wim is de knecht van de meester (ontwerp/verhaal.md, Personen). Hij heeft zijn hele leven
    // voor hem gewerkt, en je erft hem samen met de toren. Zolang de meester leeft (de tutorial van
    // het oude spel), zegt Wim "meester" tegen hém en "u" tegen jou. Na de dood (vlag
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
    // De oude meester, uit de tutorial van het oude spel: wat hij zegt als je hem aanspreekt,
    // namelijk waar hij je voor nodig heeft. De tutorial ging er op 25 sep uit; hij gaat weg met de
    // oude kaart (ontwerp/werklijst.md, punt 7c).
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
    // De marskramer trekt van dorp tot dorp en koopt ook. In het gehucht komt hij drie keer per jaar
    // langs, en daar handel je met hem (js/handel.js; spel.md, "Handel"). De vlaggen
    // marskramerOpBezoek, marskramerLente, -Zomer, -Herfst en marskramerVertrekt zet js/handel.js
    // zolang hij er is. De vuurklei en de sleutel zijn van het oude spel en gaan eruit met punt 7
    // van de werklijst; de sleutel die hij vorige week kocht (ontwerp/wereld.md) was daar een
    // losse draad.
    marskramer: {
      naam: 'de marskramer',
      start: 'welkom',
      situaties: [
        { naam: 'In het gehucht, grasmaand', als: { vlag: ['marskramerOpBezoek', 'marskramerLente'] } },
        { naam: 'In het gehucht, hooimaand', als: { vlag: ['marskramerOpBezoek', 'marskramerZomer'] } },
        { naam: 'In het gehucht, wijnmaand', als: { vlag: ['marskramerOpBezoek', 'marskramerHerfst'] } },
        { naam: 'In het gehucht, hij vertrekt', als: { vlag: ['marskramerOpBezoek', 'marskramerVertrekt'] } },
        { naam: 'De bakker zoekt leem', als: { quest: 'bakker', fase: 'zoeken' } },
        { naam: '…en je hebt het geld', als: { quest: 'bakker', goud: 15, fase: 'zoeken' } },
        { naam: 'De oven is weer warm', als: { vlag: 'ovenWarm' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'marskramerVertrekt' }, zeg: 'Mijn ezel staat al met zijn kop naar de weg, schout. Tot de volgende keer.' },
            { als: { vlag: 'marskramerLente' }, zeg: 'Grasmaand, en de wegen zijn weer te begaan. Wie nu nog graan heeft, is rijk: overal is het op. Ik betaal er goed voor.' },
            { als: { vlag: 'marskramerZomer' }, zeg: 'Hooimaand. Alles staat te groeien en niemand heeft een stuiver. En wol heb ik deze week genoeg gezien: iedereen heeft net geschoren.' },
            { als: { vlag: 'marskramerHerfst' }, zeg: 'Wijnmaand, mijn laatste ronde vóór de winter. Na Sint-Maarten zijn de wegen modder, straks ligt de beek dicht, en dan ziet u mij pas in grasmaand terug. Zout voor de vis, ijzer voor de smid: nu, of pas in de lente.' },
            { als: { vlag: 'ovenWarm' }, zeg: 'De bakker bakt weer, hoor ik. Jammer. Ik had nog een mooie zak vuurklei.' },
            { als: { quest: 'bakker', fase: 'zoeken' }, zeg: 'Een tovenaar! Dan heb ik iets voor u. Nee, wacht — ú hebt iets voor mij. Dat voel ik.' },
            { zeg: 'Alles wat in een kar past, en een paar dingen die er niet in passen. Kijkt u gerust.' },
          ],
          keuzes: [
            { zeg: 'Laat zien wat u bij u hebt.', sluit: true, als: { vlag: 'marskramerOpBezoek', nietVlag: 'marskramerVertrekt' }, doe: { handel: true } },
            { zeg: 'Wat is er nieuws?', naar: 'nieuws', als: { vlag: 'marskramerOpBezoek' } },
            { zeg: 'Hebt u iets voor een gescheurde schoorsteen?', naar: 'vuurklei', als: { quest: 'bakker', fase: 'zoeken' } },
            { zeg: 'Wat verkoopt u zoal?', naar: 'waren', als: { nietVlag: 'marskramerOpBezoek' } },
            { zeg: 'Een andere keer.', sluit: true },
          ],
        },
        // Hij komt ook op het kasteel (spel.md, "Handel", voor later): wat hij daar hoort, vertelt
        // hij hier. En omgekeerd, maar dat zegt hij niet.
        nieuws: {
          tekst: [
            { als: { vlag: 'marskramerLente' }, zeg: 'Uw heer heeft een spiegel van mij gekocht. Hij wilde zien hoe rijk hij eruitziet. Nu wil hij er nog een, voor de achterkant.' },
            { als: { vlag: 'marskramerZomer' }, zeg: 'Op het kasteel tellen ze de dagen tot Sint-Maarten. Ik hoorde de inner zeggen dat uw gehucht er welvarend uitziet. Hij bedoelde het niet als compliment.' },
            { als: { vlag: 'marskramerHerfst' }, zeg: 'Ze zeggen dat de heer dit jaar meer wil. Dat zeggen ze elk jaar. En elk jaar klopt het.' },
            { zeg: 'Niets wat u niet al weet, schout. En wat u niet weet, weet ik ook niet. Dat is gezonder.' },
          ],
          keuzes: [
            { zeg: 'Laat zien wat u bij u hebt.', sluit: true, als: { vlag: 'marskramerOpBezoek', nietVlag: 'marskramerVertrekt' }, doe: { handel: true } },
            { zeg: 'Tot de volgende keer.', sluit: true },
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
    // De heer (js/heer.js, ontwerp/spel.md "Sint-Maarten"): hij komt op Sint-Maarten zelf innen.
    // Hij is de grap: verward, ijdel, en hij telt slecht; hij spreekt over zichzelf als Wij. Zijn
    // soldaten zijn geen grap. heerOpBezoek, heerSchuld, heerBetaald en heerVertrekt zet js/heer.js.
    heer: {
      naam: 'de heer',
      start: 'welkom',
      situaties: [
        { naam: 'Sint-Maarten: hij wacht op zijn geld', als: { vlag: 'heerOpBezoek' } },
        { naam: '…en je bleef hem vorig jaar wat schuldig', als: { vlag: ['heerOpBezoek', 'heerSchuld'] } },
        { naam: 'Je hebt betaald', als: { vlag: ['heerOpBezoek', 'heerBetaald'] } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'heerBetaald' }, zeg: 'Wij hebben alles geteld. Twee keer zelfs, en het kwam er twee keer anders uit, dus het klopt vast. Tot volgend jaar, schout. Houd het gehucht netjes. En arm. Nee, rijk. Rijk is beter voor Ons.' },
            { als: { vlag: 'heerSchuld' }, zeg: 'Schout! Wij vergeten nooit iets. Behalve wat Wij vergeten, maar dit niet: u bent Ons nog wat schuldig van vorig jaar. Met de boete erbij. De boete is het mooiste deel.' },
            { zeg: 'Schout! Wat een... gehucht. Klein. Modderig. Het ruikt naar koe. Maar Wij zagen onderweg een nieuw dak, en een nieuw dak kost geld. Laten Wij eens kijken wat u voor Ons hebt.' },
          ],
          keuzes: [
            { zeg: 'Hier is wat het gehucht u verschuldigd is.', sluit: true, als: { vlag: 'heerOpBezoek', nietVlag: 'heerBetaald' }, doe: { heer: true } },
            { zeg: 'Hoe was de reis, heer?', naar: 'reis', als: { nietVlag: 'heerBetaald' } },
            { zeg: 'Goede reis terug, heer.', sluit: true, als: { vlag: 'heerBetaald' } },
            { zeg: 'Een ogenblik, heer.', sluit: true, als: { nietVlag: 'heerBetaald' } },
          ],
        },
        reis: {
          tekst: [
            { zeg: 'Afschuwelijk. Uw weg zit vol gaten. Wij hebben ze laten tellen: honderdzeven. Daar zullen Wij weggeld voor moeten heffen. Om ze te laten dichten, of om ze nog eens te laten tellen. Een van de twee.' },
          ],
          keuzes: [
            { zeg: 'Hier is wat het gehucht u verschuldigd is.', sluit: true, als: { vlag: 'heerOpBezoek', nietVlag: 'heerBetaald' }, doe: { heer: true } },
            { zeg: 'Een ogenblik, heer.', sluit: true },
          ],
        },
      },
    },
    // Zijn soldaten: twee, en wie te weinig geeft, houdt ze de winter over (soldatenInHuis).
    soldaat: {
      naam: 'een soldaat',
      start: 'welkom',
      situaties: [
        { naam: 'Met de heer mee', als: { vlag: 'heerOpBezoek' } },
        { naam: 'Ingekwartierd tot de lente', als: { vlag: 'soldatenInHuis' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'soldatenInHuis' }, zeg: 'We blijven tot de lente, zegt de heer. Wat eten we vanavond? En morgen? En de dag daarna?' },
            { zeg: 'Wij zijn hier alleen om te tellen, schout. En om wie verkeerd telt, te helpen tellen.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    // De inner (js/inner.js, ontwerp/spel.md "Rijk worden en arm lijken"): de man van de heer die in
    // oogstmaand komt tellen. Geen grap zoals zijn heer: hij telt goed, en hij weet het. Wat hij ziet,
    // komt in zijn rapport; wie met hem meeloopt, bepaalt wat hij ziet. innerOpBezoek en
    // innerOnverwacht zet js/inner.js. Praten, afleiden en omkopen komen later (werklijst punt 6).
    inner: {
      naam: 'de inner',
      start: 'welkom',
      situaties: [
        { naam: 'Oogstmaand: hij komt tellen', als: { vlag: 'innerOpBezoek' } },
        { naam: 'Hij komt onverwacht terug', als: { vlag: ['innerOpBezoek', 'innerOnverwacht'] } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'innerOnverwacht' }, zeg: 'Schout. Ik was toevallig in de buurt. Dat is niet waar: ik kwam speciaal. Zijne Genade vroeg zich af of ik wel goed geteld had. Ik tel altijd goed. Maar ik tel graag twee keer.' },
            { zeg: 'Goedendag, schout. Ik ben de inner van Zijne Genade, en ik kom tellen: de huizen, de schuren, de velden en de kist. Wat ik zie, schrijf ik op. Wat ik opschrijf, betaalt u op Sint-Maarten.' },
          ],
          keuzes: [
            { zeg: 'Loop maar met me mee. Ik laat u alles zien.', sluit: true },
            { zeg: 'Wat telt u precies?', naar: 'wat' },
            { zeg: 'Tel maar raak.', sluit: true },
          ],
        },
        wat: {
          tekst: [
            { zeg: 'Huizen, want daar wonen zielen, en zielen betalen hoofdgeld. Schuren, want daar ligt graan. Velden, want daar staat graan dat straks in de schuren ligt. En de kist, want Zijne Genade ziet graag goud. Ik weet wat een veld geeft, schout, en de marskramer vertelt me wat hij u betaalde. Ligt er minder in de schuur of in de kist dan ik weet, dan schrijf ik dat ook op.' },
          ],
          keuzes: [
            { zeg: 'En wat u niet ziet?', naar: 'nietGezien' },
            { zeg: 'Loop maar met me mee.', sluit: true },
          ],
        },
        nietGezien: {
          tekst: [
            { zeg: 'Wat ik niet zie, tel ik niet. Dat is geen gunst, schout, dat is boekhouden. Maar ik heb goede ogen, en nog meer geduld dan Zijne Genade. Ongeveer.' },
          ],
          keuzes: [
            { zeg: 'Loop maar met me mee.', sluit: true },
          ],
        },
      },
    },
    // De karakters van de boeren (T.KARAKTERS, js/mensen.js). Bij elk spel trekt elke boer er een
    // (js/boeren.js), en voert hij het gesprek van zijn karakter; de naam boven het gesprek is die
    // van de boer zelf (js/dialoog.js). Daarom zegt geen van deze zinnen hij of zij, tenzij het
    // karakter het vastlegt (de weduwe, de vroedvrouw). Ze onthouden wat Sint-Maarten bracht:
    // schandpaal<Karakter> als jij hem aanwees (js/heer.js, T.schandpaalVlag), schoutAanDeSchandpaal
    // als je er zelf stond, en briefVanDeHeer en soldatenInHuis zolang die er zijn.
    zanger: {
      naam: 'de zanger',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de zanger aan de schandpaal', als: { vlag: 'schandpaalZanger' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalZanger' }, zeg: 'Drie dagen aan de paal, en niemand die zong. Ik zing ook niet meer, schout. Niet voor jou.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf, aan die paal. Daar hebben we een lied over gemaakt, schout. Geen spotlied.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die twee soldaten zingen mee in de schuur. Vals. En ze eten voor zes.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Hoeveel wil hij dit jaar? Nee, zeg het maar niet. Ik zing liever nog even.' },
            { zeg: 'Kom vanavond naar de schuur, schout. We zingen tot de lamp op is.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    weduwe: {
      naam: 'de weduwe',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de weduwe aan de schandpaal', als: { vlag: 'schandpaalWeduwe' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalWeduwe' }, zeg: 'Mijn kinderen hebben drie dagen naar hun moeder aan de paal gekeken. Ze vragen of jij dat zo wilde. Wat moet ik ze zeggen?' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf, in plaats van een van ons. De kinderen hebben je brood gebracht. Dat mocht niet, dus deden ze het in het donker.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Er slaapt een soldaat in mijn hooi. Hij eet wat mijn kinderen hadden moeten eten, en hij bedankt er niet eens voor.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Er is een brief van de heer, hoor ik. Ik heb drie monden te voeden, schout. Vergeet dat niet als je gaat tellen.' },
            { zeg: 'Drie kinderen, één akker, en geen man meer. Het gaat, schout. Het moet.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    woekeraar: {
      naam: 'de woekeraar',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de woekeraar aan de schandpaal', als: { vlag: 'schandpaalWoekeraar' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalWoekeraar' }, zeg: 'Aan de paal. Ik. De enige hier die de pacht altijd op tijd heeft. Onthoud dit, schout: wie mij schuldig is, betaalt voortaan dubbel. En iedereen hier is mij schuldig.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. Dom. Je had mij kunnen aanwijzen. Ik had het je vergeven, tegen een kleine rente.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Twee soldaten, de hele winter. Ik verkoop ze graan. Aan wie anders, schout?' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'De brief is er. Komt het gehucht tekort, kom dan bij mij. Ik leen graag. Tegen een redelijke rente.' },
            { zeg: 'Graan nodig, schout? Ik leen het je. Tien zakken nu, twaalf na de oogst. Dat is geen woeker, dat is rekenen.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    vroedvrouw: {
      naam: 'de vroedvrouw',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de vroedvrouw aan de schandpaal', als: { vlag: 'schandpaalVroedvrouw' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalVroedvrouw' }, zeg: 'De halve buurt heb ik ter wereld geholpen, en de halve buurt keek toe hoe ik aan de paal stond. Zij keken weg, schout. Jij niet.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. Ik heb je polsen ingesmeerd, daarna. Dat doe ik niet voor elke schout.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die soldaten blijven tot de lente, zeggen ze. Ik tel de maanden. Dat is mijn vak.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief van de heer. Die man is zelf ook ooit geboren, schout. Ik weet niet wie dat op haar geweten heeft.' },
            { zeg: 'Twee kinderen deze maand, en allebei gezond. Nog een paar jaar, en dit gehucht is een dorp.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    heethoofd: {
      naam: 'het heethoofd',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette het heethoofd aan de schandpaal', als: { vlag: 'schandpaalHeethoofd' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalHeethoofd' }, zeg: 'Drie dagen aan de paal. Ik heb de gezichten onthouden, schout. Van de soldaten. En het jouwe.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf, en je keek hem recht aan. Als het ooit zover komt, schout, dan sta ik naast je. Niet achter je. Naast je.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Twee soldaten, met een zwaard en een grote mond. Het zwaard kan ik ze niet afpakken. Nog niet.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief. Hij schrijft, wij betalen. Ooit schrijven wij hem een brief, schout.' },
            { zeg: 'Die knecht van de heer? Die viel. Tegen mijn vuist. Dat kan gebeuren.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    vrome: {
      naam: 'de vrome',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de vrome aan de schandpaal', als: { vlag: 'schandpaalVrome' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalVrome' }, zeg: 'Drie dagen aan de paal, en ik heb gebeden voor wie mij daar zette. Dat is erger dan vloeken, schout. Denk daar maar eens over na.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf, als een heilige. Of als een dwaas. Bij heiligen weet je dat pas achteraf.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die soldaten vloeken aan mijn tafel. Ik bid voor ze. Hardop, zodat ze het horen.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief van de heer. Ik bid elke avond voor hem, schout: dat hij krijgt wat hij verdient.' },
            { zeg: 'God ziet alles, schout. Gelukkig is de heer niet God. Die ziet alleen geld.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    roddelaar: {
      naam: 'de roddelaar',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de roddelaar aan de schandpaal', als: { vlag: 'schandpaalRoddelaar' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalRoddelaar' }, zeg: 'Aan de paal! Ik! En weet je wat ik daar zag, schout? Alles. Wie lachte, wie wegkeek. Ik vergeet niets. Dat weet je.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. Het hele gehucht praat erover. Ik ook, natuurlijk. Maar ik zeg alleen goede dingen. Meestal.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die lange soldaat kijkt wel erg vaak naar ons graan. Nee, dat heb je niet van mij.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'De brief is er, hè? Ik weet al wat erin staat. Iedereen weet het. Behalve jij, zo te zien.' },
            { zeg: 'Heb je het al gehoord, schout? Nee? Dan vertel ik het je. Maar niet verder vertellen. Tenzij het iets oplevert.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    grijsaard: {
      naam: 'de oudste',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de oudste aan de schandpaal', als: { vlag: 'schandpaalGrijsaard' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalGrijsaard' }, zeg: 'Op mijn leeftijd, aan de paal. Ik heb drie heren overleefd, schout. Ik overleef jou ook.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. Dat heb ik maar één keer eerder gezien, en die schout werd later burgemeester. Of hij werd opgehangen. Ik haal ze door elkaar.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Soldaten in de winter. Onder de tweede heer ook. Toen aten ze de hond op. Houd je hond binnen, schout.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Weer een brief. De eerste heer schreef niet, die kwam gewoon. De tweede kon niet schrijven. Deze schrijft. Ik weet niet wat erger is.' },
            { zeg: 'Drie heren heb ik zien komen en gaan, schout. Ze worden steeds dikker, en het graan steeds dunner.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    nieuwkomer: {
      naam: 'de nieuwkomer',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de nieuwkomer aan de schandpaal', als: { vlag: 'schandpaalNieuwkomer' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalNieuwkomer' }, zeg: 'Een jaar hier, en al aan de paal. In het buurdorp duurde dat langer. Nee, vraag maar niet.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf. In het buurdorp deed de schout dat nooit. Daar deed de schout andere dingen. Daarom ben ik hier.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Soldaten. Die ken ik. In het buurdorp kende ik er een paar. Die kennen mij ook. Hopelijk niet deze.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief van de heer? Die in het buurdorp schreef ook brieven. Tot hij niet meer schreef. Nee, vraag maar niet.' },
            { zeg: 'Waarom ik uit het buurdorp kwam? Het gras is hier groener. En daar was ik niet meer welkom. Vooral dat laatste.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
    drinker: {
      naam: 'de drinker',
      start: 'welkom',
      situaties: [
        { naam: 'De brief van de heer is er', als: { vlag: 'briefVanDeHeer' } },
        { naam: 'Er zijn soldaten ingekwartierd', als: { vlag: 'soldatenInHuis' } },
        { naam: 'Jij zette de drinker aan de schandpaal', als: { vlag: 'schandpaalDrinker' } },
        { naam: 'Je stond er zelf', als: { vlag: 'schoutAanDeSchandpaal' } },
      ],
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'schandpaalDrinker' }, zeg: 'Drie dagen aan de paal, zonder één druppel. Weet je hoe lang drie dagen zijn zonder één druppel, schout? Ik wel.' },
            { als: { vlag: 'schoutAanDeSchandpaal' }, zeg: 'Je stond er zelf! Daar drink ik op. Op jou, schout. En op de paal. En op de heer, dat hij erin stikt.' },
            { als: { vlag: 'soldatenInHuis' }, zeg: 'Die soldaten drinken mijn bier. Ik weet niet wat erger is: dat ze het drinken, of dat ze het niet eens lekker vinden.' },
            { als: { vlag: 'briefVanDeHeer' }, zeg: 'Een brief. Lees jij hem maar, schout. Ik lees alleen de bodem van mijn kroes.' },
            { zeg: 'Ik drink niet meer dan een ander, schout. Ik drink alleen vaker.' },
          ],
          keuzes: [
            { zeg: 'Tot ziens.', sluit: true },
          ],
        },
      },
    },
  };
})(globalThis.Toren = globalThis.Toren || {});
