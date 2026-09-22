// De quests, als gewone gegevens. Net als gesprekken.js is dit bestand bedoeld om in te
// schrijven zonder te programmeren: een fase erbij, een weg erbij, in dezelfde vorm als wat er
// al staat. De regels die erover beslissen (welke fase, welke weg, wat een beloning doet) staan
// in quest.js, en het ontwerp in ontwerp/toren.md, "Quests: waar het goud vandaan komt".
//
// ── Vorm van één quest ──
//
//   T.QUESTS.<id> = {
//     naam: 'De koude oven',   // in het vak linksboven, boven het doel
//     gever: 'bakker',         // wie hem geeft; ook wie "je" is bij ouderGewordenSinds
//     begin: 'zoeken',         // de fase waarin hij begint
//     fasen: { <fase-id>: { ... }, ... },
//   }
//
// Een fase heeft (alles mag weg blijven):
//   doel      — één regel: wat je nu moet doen. Die verschijnt linksboven, onder de naam.
//   melding   — wat er in beeld komt zodra je in deze fase komt.
//   beloning  — { goud: 20, geef: 'leem', vlag: 'ovenWarm' }. Wordt één keer uitgekeerd, ook
//               als je later nog eens in deze fase komt.
//   eind      — true op de fase waarin de quest af is. Elke quest heeft er minstens één.
//   wegen     — de manieren om uit deze fase te komen; zie hieronder.
//
// ── Een weg is een antwoord ──
//
// Een weg is één manier om verder te komen, en is het hart van de toets van drie antwoorden
// (ontwerp/toren.md): elke quest heeft er minstens drie die verschillend kosten. npm test kijkt
// dat na (T.keurQuests), dus een quest met maar één weg haalt de toetsen niet.
//
//   wegen: {
//     leemkuil: { kost: 'risico', naar: 'terug', klaarAls: { heeft: 'leem' } },
//   }
//   kost      — waar je voor betaalt: 'jaren', 'goud', 'gunst', 'risico' of 'niets'. 'niets' is
//               voor een stap die geen keuze is (het afgeven bij wie het vroeg) en telt niet mee
//               in de toets van drie antwoorden.
//   naar      — de fase waarin je terechtkomt.
//   klaarAls  — deze weg gaat vanzelf zodra die voorwaarde klopt; T.werkQuestsBij kijkt dat elk
//               beeld na, net als de tutorial. Zonder klaarAls loopt hij alleen via een gesprek.
//   doe       — een gevolg bij het nemen van deze weg (goud eraf, een voorwerp weg).
//
// Welke weg je nam blijft staan, zodat het dorp erop kan reageren: als: { quest: 'bakker',
// weg: 'marskramer' } in een gesprek van wie dan ook.
//
// ── Zo ziet het er straks uit (De koude oven, ontwerp/toren.md) ──
//
//   bakker: {
//     naam: 'De koude oven', gever: 'bakker', begin: 'zoeken',
//     fasen: {
//       zoeken: {
//         doel: 'Zoek leem voor de scheur in de schoorsteen van de bakker.',
//         wegen: {
//           leemkuil:   { kost: 'risico', naar: 'terug', klaarAls: { heeft: 'leem' } },
//           marskramer: { kost: 'goud',   naar: 'terug', doe: { goud: -15, geef: 'vuurklei' } },
//           smidsvrouw: { kost: 'gunst',  naar: 'terug' },
//           oven:       { kost: 'jaren',  naar: 'klaar', klaarAls: { vlag: 'ovenGebakken' } },
//         },
//       },
//       terug: {
//         doel: 'Breng het naar de bakker.',
//         wegen: { afgeven: { kost: 'niets', naar: 'klaar', doe: { neem: ['leem', 'vuurklei'] } } },
//       },
//       klaar: { eind: true, melding: 'Het dorp ruikt weer naar brood.',
//                beloning: { goud: 20, vlag: 'ovenWarm' } },
//     },
//   },
//
// ── Raakpunten: een spreuk mag ook een ding raken ──
//
// Een spreuk raakt anders alleen een wezen. Een raakpunt is een voorwerp dat juist om een spreuk
// vraagt: de scheur in de oven om een vuurschicht, een molen om een windstoot. In Tiled krijgt
// het voorwerp één eigenschap, raak="<naam>"; wat dat betekent staat hier, zodat de tekst bij de
// gegevens hoort en niet op de kaart. Het raakpunt verdwijnt zodra zijn vlag staat.
//
// Zet een raakpunt op een tegel waar je bij kunt (de mond van de oven), niet in een muur: de
// spreuk vraagt vrij zicht, en dwars door de muur die je wilt raken is er geen.
//
//   T.RAAKPUNTEN.<naam> = {
//     spreuk: 'vuurschicht',                      // welke spreuk erop werkt
//     tekst: 'De scheur in de schoorsteen dichtbakken',  // bij de muis; de prijs komt er zelf bij
//     melding: 'De klei sist en zet uit; de scheur trekt dicht.',
//     zetVlag: 'ovenGebakken',                    // en daarmee is het raakpunt op
//     als: { quest: 'bakker', fase: 'zoeken' },   // alleen zolang dit klopt (mag weg blijven)
//   }
(function (T) {
  'use strict';

  T.QUESTS = {
    // De koude oven, de eerste quest (Marcel en Claude, 22 sep 2026; ontwerp/toren.md). De
    // aardschok spleet de schoorsteen van de bakker, en de rook blijft binnen. Vier wegen, die
    // elk iets anders kosten -- dat is de toets van drie antwoorden, en T.keurQuests kijkt hem na.
    bakker: {
      naam: 'De koude oven', gever: 'bakker', begin: 'zoeken',
      fasen: {
        zoeken: {
          doel: 'Zoek iets om de scheur in de schoorsteen van de bakker mee te dichten.',
          wegen: {
            // De leemkuil bij de beek: daar huist sinds de schok iets. Vechten kost jaren,
            // sluipen kost niets -- en dat is precies het risico. De leem ligt er in Tiled met
            // quest="bakker:zoeken", dus pas als de bakker erom vroeg.
            kuil: { kost: 'risico', naar: 'terug', klaarAls: { heeft: 'leem' } },
            // De marskramer verkoopt vuurklei. Vijftien, en je erft er acht van de meester: de
            // weg ligt open en je kunt hem net niet nemen.
            kramer: { kost: 'goud', naar: 'terug', doe: { goud: -15, geef: 'vuurklei' } },
            // De smidsvrouw geeft de oude vuurstenen van de smidse meteen, en vraagt er de
            // eerste magische grondstof uit de toren voor terug (Marcel, 22 sep 2026). Vandaag
            // kost dat niets; straks precies datgene wat het duurst is, want een grondstof geef
            // je aan de toren of aan jezelf, nooit aan allebei. De schuld staat als vlag klaar
            // en wordt bij punt 5 van de werklijst verzilverd.
            smidsvrouw: { kost: 'gunst', naar: 'terug', doe: { geef: 'vuursteen', zetVlag: 'schuldSmidsvrouw' } },
            // De dure weg van de tovenaar: een vuurschicht in de oven bakt de scheur dicht. Dat
            // gaat langs T.RAAKPUNTEN hieronder en kost een jaar.
            oven: { kost: 'jaren', naar: 'gebakken', klaarAls: { vlag: 'ovenGebakken' } },
          },
        },
        terug: {
          doel: 'Breng het naar de bakker.',
          wegen: {
            afgeven: { kost: 'niets', naar: 'klaar', doe: { neem: ['leem', 'vuurklei', 'vuursteen'] } },
          },
        },
        // Twee einden, want hoe je het oploste hoort het dorp te merken. Wie het dichtbakte met
        // magie krijgt hetzelfde goud maar een andere vlag: sommigen vinden dat prachtig, en de
        // koster niet.
        gebakken: {
          eind: true,
          melding: 'De scheur trekt dicht. Morgen ruikt het dorp weer naar brood.',
          beloning: { goud: 20, vlag: ['ovenWarm', 'ovenMetMagie'] },
        },
        klaar: {
          eind: true,
          melding: 'De bakker smeert de scheur dicht. Morgen ruikt het dorp weer naar brood.',
          beloning: { goud: 20, vlag: 'ovenWarm' },
        },
      },
    },
  };

  T.RAAKPUNTEN = {
    // De mond van de oven, in Tiled een voorwerp met raak="oven" op een tegel waar je bij kunt.
    oven: {
      spreuk: 'vuurschicht',
      tekst: 'de scheur in de schoorsteen dichtbakken',
      melding: 'De klei sist en zet uit, en de scheur trekt dicht als een wond.',
      zetVlag: 'ovenGebakken',
      als: { quest: 'bakker', fase: 'zoeken' },
    },
  };
})(globalThis.Toren = globalThis.Toren || {});
