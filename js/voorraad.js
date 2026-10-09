// De voorraad van het gehucht: goud, graan, wol en hout. Eén plek waarlangs hij verandert
// (T.wijzigVoorraad), zodat het scherm altijd bijblijft en niets zelf aan S.voorraad hoeft te
// zitten. (Zo liepen in het oude spel ook alle jaren via één functie, T.verouder.)
(function (T) {
  'use strict';

  T.GRONDSTOFFEN = ['goud', 'graan', 'wol', 'hout'];

  T.nieuweVoorraad = function () {
    return { goud: 0, graan: 0, wol: 0, hout: 0 };
  };

  // delta mag negatief zijn (uitgeven, verkopen, opeten); de voorraad zakt nooit onder nul.
  // Met `eigenaar` (een gebouw waar een gezin woont, of 'kas') zegt het van wie wat erbij komt, of van wie het eerst afgaat
  // (js/geld.js, T.boekPakhuis: een beurs per huis, vraag 141); zonder is wat erbij komt van de kas, en gaat wat eraf gaat
  // er bij iedereen naar verhouding af.
  T.wijzigVoorraad = function (D, wat, delta, eigenaar) {
    const v = D.voorraad;
    const voor = v[wat] || 0;
    v[wat] = Math.max(0, voor + delta);
    T.boekPakhuis(D, wat, v[wat] - voor, eigenaar, voor);
    // Wat je ooit gehad hebt: de balk (js/hud.js) laat ijzer, zout en gereedschap pas zien als ze er
    // eens geweest zijn, en daarna altijd, zodat hij niet heen en weer springt.
    if (v[wat] > 0) (D.gehad || (D.gehad = {}))[wat] = true;
    // Goud had al een naam van vóór de voorraad bestond, D.goud (js/quest.js); die loopt hier
    // gewoon in de pas mee, zodat het oude gereedschap en de bestaande toetsen blijven werken.
    if (wat === 'goud') {
      D.goud = v.goud;
      if (v.goud > 0) D.goudGehad = true;
    }
    if (T.ui && T.ui.toonVoorraad) T.ui.toonVoorraad(D);
    return v[wat];
  };

  // Een aantal recht neerzetten in plaats van erbij op te tellen, voor gereedschap en toetsen.
  T.zetVoorraad = function (D, wat, aantal) {
    return T.wijzigVoorraad(D, wat, Math.max(0, aantal) - (D.voorraad[wat] || 0));
  };
})(globalThis.Spel = globalThis.Spel || {});
