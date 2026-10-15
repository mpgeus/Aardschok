// Kijken, kiezen en sturen als een god (werklijst vraag 170, stap 1; Marcel, 15 okt: "we gaan toch als 'god' sturen en
// bouwen. Je speelt dus niet meer de schout zelf"). De camera volgt de schout niet meer (js/main.js), links kies je een
// man, rechts stuur je hem, en een groep onthoud je onder een cijfer. Hier staan de regels zonder scherm, getoetst in
// test/kiezen.test.cjs; het scherm (de muis, het kader, de ring onder de voeten) staat in js/main.js en js/tekenen.js.
(function (T) {
  'use strict';

  T.KIEZEN_INSTELLINGEN = {
    camera: {
      rand: 8, // zo dicht bij de rand van het scherm (in pixels) schuift de muis het beeld; 0 zet het uit
      snelheid: 900, // zoveel pixels van het beeld per seconde schuiven de pijltjes en de rand
    },
  };
})(globalThis.Spel = globalThis.Spel || {});
