// De gesprekken, als gewone gegevens. Dit bestand is bedoeld om in te schrijven zonder te
// programmeren: nieuwe tekst, een nieuwe keuze of een nieuwe knoop erbij, in dezelfde vorm als
// wat er al staat. De regels die hierover beslissen (welke regel geldt, welke keuzes je ziet)
// staan in gesprek.js.
//
// Vorm van één gesprek:
//   T.GESPREKKEN.<id> = {
//     naam: 'de koster',    // boven het gesprek
//     portret: 'koster',    // bestandsnaam van het portret; weg laten als die er nog niet is
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
//   situaties: [{ naam: 'Na de brief van de heer', als: { vlag: 'briefGelezen' } }]
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
})(globalThis.Toren = globalThis.Toren || {});
