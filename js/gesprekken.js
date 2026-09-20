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
    // Wim was de leerling van de meester. Toen de meester veertig jaar geleden vertrok, bleef
    // hij, en veegde elke dag de trap, voor als de meester ooit terug zou komen. Vannacht schudde
    // de aarde, en wat boven opgesloten zat, kwam naar beneden.
    wim: {
      naam: 'Wim',
      portret: 'wim',
      start: 'welkom',
      knopen: {
        welkom: {
          tekst: [
            { als: { vlag: 'sleutelGebruikt' }, zeg: 'Ga maar, meester. Ik veeg de trap nog één keer, voor het geval dat.' },
            { als: { heeft: 'sleutel' }, zeg: 'U hebt de sleutel. Wees voorzichtig daarboven, meester. Ik heb veertig jaar gewacht; ik wil nog even niet om u rouwen.' },
            // Het bewijs dat het dorp je ouder ziet worden (ontwerp/spreuken.md, "Het dorp ziet
            // je ouder worden"): terughoudend, geen grap over wat er met honderd jaar gebeurt.
            { als: { ouderGewordenSinds: 12 }, zeg: 'U bent weer terug, meester — en een jaar ouder dan toen u wegging. Ik zal er verder niets over zeggen.' },
            { zeg: 'Meester? Meester! U leeft nog. Veertig jaar heb ik de trap geveegd, voor als u ooit terug zou komen. En nu, uitgerekend nu, na die aardschok van vannacht...' },
          ],
          keuzes: [
            { zeg: 'Dank je, Wim.', sluit: true, als: { vlag: 'sleutelGebruikt' } },
            { zeg: 'Wat staat er bij de trap?', naar: 'monsters', als: { heeft: 'sleutel' } },
            { zeg: 'Ik ga, Wim.', sluit: true, als: { heeft: 'sleutel' } },
            { zeg: 'Wat is er vannacht gebeurd?', naar: 'aardschok', als: { nietHeeft: 'sleutel', nietVlag: 'sleutelGebruikt' } },
            { zeg: 'Waar is de sleutel van het trappenhuis?', naar: 'sleutel', als: { nietHeeft: 'sleutel', nietVlag: 'sleutelGebruikt' } },
            { zeg: 'Werkt de fontein nog?', naar: 'fontein', als: { nietHeeft: 'sleutel', nietVlag: 'sleutelGebruikt' } },
            { zeg: 'Ik ga naar boven, Wim.', sluit: true, als: { nietHeeft: 'sleutel', nietVlag: 'sleutelGebruikt' } },
          ],
        },
        meer: {
          tekst: [{ zeg: 'Wat wilt u nog weten, meester?' }],
          keuzes: [
            { zeg: 'Wat is er vannacht gebeurd?', naar: 'aardschok' },
            { zeg: 'Waar is de sleutel van het trappenhuis?', naar: 'sleutel' },
            { zeg: 'Werkt de fontein nog?', naar: 'fontein' },
            { zeg: 'Ik ga naar boven, Wim.', sluit: true },
          ],
        },
        aardschok: {
          tekst: [{ zeg: 'Het hele huis schudde. Boven kraakte iets, heel lang, en toen kwam er gespuis de trap af. U weet wel wat u daar hebt opgesloten. Ik niet. Dat hebt u me nooit verteld.' }],
          keuzes: [
            { zeg: 'Wat voor gespuis?', naar: 'monsters' },
            { zeg: 'Nog iets anders.', naar: 'meer' },
          ],
        },
        monsters: {
          tekst: [{ zeg: 'Een slijmkruiper, in de voorraadkamer. En bij de trap staat iets met een zwaard. Het staat daar maar, alsof het op iemand wacht. Ik heb de deur op slot gedaan.' }],
          keuzes: [{ zeg: 'Nog iets anders.', naar: 'meer' }],
        },
        sleutel: {
          tekst: [{ zeg: 'In de voorraadkamer. Ik liet hem vallen toen ik wegrende. Ik ben ook niet meer de jongste, meester. Maar dat bent u al helemaal niet meer.' }],
          keuzes: [{ zeg: 'Nog iets anders.', naar: 'meer' }],
        },
        fontein: {
          tekst: [{ zeg: 'Er zit nog één slok in. Eén. Hij maakt u een paar jaar jonger, maar daarna staat hij droog. Bewaar hem voor als het echt moet.' }],
          keuzes: [{ zeg: 'Nog iets anders.', naar: 'meer' }],
        },
      },
    },
  };
})(globalThis.Toren = globalThis.Toren || {});
