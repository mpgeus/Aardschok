// Het demojaar: de demo voor Next Fest als level (vraag 187, stap 1b; ontwerp/scenario.md, 3). Een nieuw spel begint ermee
// als de demo aan staat (T.DEMO_INSTELLINGEN.aan en T.demoLevel, js/einde.js), of met Demo in het debugvenster
// (js/debugvenster.js); en het is hoofdstuk 1 van de campagne (levels/campagne.js), op het eiland van de campagne.
//
// Het lege begin op het eiland van je zaad, zoals elk spel; wat de demo anders maakt, staat hieronder:
//   - de wacht (werklijst Q, vraag 181, e; Marcel, 20 okt, S1: "2 speermannen en 1 kruisboogschutter"): soldaten die met de
//     huifkar meekomen, met hun eigen stukken, in een eigen tent en zonder wachthuis (js/begin.js, js/bewoners.js);
//   - wat dicht is (Marcel, 20 okt, W1 en L1): het staat in het bouwmenu, met "In the full game", maar je zet het niet neer
//     (T.isDicht, js/gebouwen.js);
//   - geen wilde rovers, maar één overval (vraag 185; Marcel, 20 okt: "zodat de speler de combat kan proberen en ervaren",
//     en 23 okt: "overdag, aankondiging ja"): op een dag uit het zaad zegt een bericht dat er rovers gezien zijn, met de
//     plek, en de dag erna komen ze, overdag (T.roversKomen, js/rovers.js);
//   - op Sint-Maarten (Marcel, 18 okt, D2): de punten, vóór de tiende (vraag 186, T.telPunten in js/einde.js), en betaal je,
//     dan rijdt hij weg met je waren, en is het uit (de scène van het betalen, js/regie.js en js/heer.js). Wie weigert,
//     krijgt zijn leger: dat is het eind van elk spel.
//
// Het is gegevens, geen functie (de woorden: js/scenario.js), zodat later de editor het terugschrijft (stap 4).
(function (T) {
  'use strict';

  T.LEVELS = T.LEVELS || {};
  T.LEVELS.demojaar = {
    dorpen: [{
      wacht: ['speerman', 'speerman', 'kruisboogschutter'],
      dicht: ['wachthuis', 'wapenmaker'],
      wildeRovers: false,
    }],
    triggers: [
      // De dag van het bericht ligt tussen dag 59 en 219, de overval een dag later (Sint-Maarten is dag 250).
      { id: 'overval', als: [{ dag: { tussen: [59, 219], lot: 'overval' } }], dan: [{ rovers: { aantal: 3, aangekondigd: true } }] },
      { id: 'sintMaarten', als: [{ heer: 'komt' }], dan: [{ punten: true }, { scene: 'betalen' }] },
    ],
  };
})(globalThis.Spel = globalThis.Spel || {});
