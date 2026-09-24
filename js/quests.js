// De quests, als gewone gegevens. Net als gesprekken.js is dit bestand bedoeld om in te
// schrijven zonder te programmeren: een fase erbij, een weg erbij, in dezelfde vorm als wat er
// al staat. De regels die erover beslissen (welke fase, welke weg, wat een beloning doet) staan
// in quest.js, en het ontwerp in ontwerp/toren.md, "Quests: waar het goud vandaan komt".
//
// ── Vorm van één quest ──
//
//   T.QUESTS.<id> = {
//     naam: 'De koude oven',   // in het vak linksboven, boven het doel
//     gever: 'bakker',         // wie hem geeft
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

  // Leeg sinds 24 sep 2026: De koude oven, de eerste quest, hoorde bij De laatste klim (de toren,
  // de vuurschicht) en ging er met punt 7 van de werklijst uit. Hij staat nog in `git log` als
  // voorbeeld. De quests van het nieuwe spel komen hier, in dezelfde vorm (zie hierboven).
  T.QUESTS = {
  };

  // Een raakpunt is een ding dat een spreuk kan raken; zonder spreuken is er geen. Het blok blijft
  // staan, want gereedschap/quests-tool.js schrijft alleen terug als beide blokken er zijn.
  T.RAAKPUNTEN = {
  };
})(globalThis.Toren = globalThis.Toren || {});
