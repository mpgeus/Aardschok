// Het rovershol: hoofdstuk 2 van de campagne (werklijst K, 2c; Marcel, 27 okt: "A1, B1, C1, D2, E1", en het plan van stap
// 4: "Prima"; ontwerp/scenario.md, 6). De heer schrijft dat er rovers in het bos zitten die "zijn" graan eten, en wil ze
// weg vóór Sint-Maarten.
//
// Het lege begin, zoals elk spel (B1: van niets, met de huifkar); wat dit level anders maakt, staat hieronder:
//   - de wacht van hoofdstuk 1 (twee speermannen en een kruisboogschutter), zodat je de eerste overval aankunt; het
//     wachthuis en de wapenmaker zijn open;
//   - het hol (A1; T.maakHol, js/rovers.js): het dichtste roverskamp binnen de rand, met 10 man in vijf tenten, een
//     palissade, en al buit (60 graan en 20 goud, een grote hoop);
//   - de overvallen op het gewone rooster (twee keer per jaar, het eerste jaar met twee man), uit het dichtste kamp;
//   - na de eerste overval wijst het doel naar het hol (D2: ze lieten een spoor), met een ring op de minikaart;
//   - valt de laatste rover van het hol, dan is het gewonnen (E1); staat het op Sint-Maarten nog, dan is het mislukt (C1).
//
// Het is gegevens, geen functie (de woorden: js/scenario.js); de zinnen leest npm run teksten (gereedschap/teksten.cjs).
(function (T) {
  'use strict';

  T.LEVELS = T.LEVELS || {};
  T.LEVELS.rovershol = {
    inleiding: 'There are robbers in the woods there, eating Our grain. Our grain! Rid Us of them before Martinmas, or We shall find someone who can.',
    dorpen: [{
      wacht: ['speerman', 'speerman', 'kruisboogschutter'],
      hol: { bende: 10, palissade: true, buit: { graan: 60, goud: 20 } },
    }],
    triggers: [
      { id: 'begin', dan: [{ doel: { id: 'hol', tekst: "Destroy the robbers' den before Martinmas.", hoofd: true } }] },
      // Na de eerste overval die op je land kwam (D2).
      {
        id: 'spoor',
        als: [{ overval: 1 }],
        dan: [
          { bericht: { tekst: 'The robbers left a trail. It leads into the woods, to their den.', toon: 'gevaar', gebied: 'hol' } },
          { doel: { id: 'hol', gebied: 'hol' } },
        ],
      },
      {
        id: 'verslagen',
        als: [{ hol: 'verslagen' }],
        dan: [
          { doel: { id: 'hol', stand: 'af' } },
          { einde: { gewonnen: true, kop: 'The woods are quiet', tekst: 'The last robber has fallen. The lord will hear of it, and will tell everyone it was his idea.' } },
        ],
      },
      // Sint-Maarten: de heer komt, en het hol staat er nog (C1).
      {
        id: 'sintMaarten',
        als: [{ heer: 'komt' }, { hol: 'staat' }],
        dan: [
          { doel: { id: 'hol', stand: 'mislukt' } },
          { einde: { gewonnen: false, kop: 'The robbers still hold the woods', tekst: 'Martinmas came, and so did the lord. The robbers are still in his woods, eating his grain. He finds you a new post, far from anything he owns.' } },
        ],
      },
    ],
  };
})(globalThis.Spel = globalThis.Spel || {});
