// De voorraad van het gehucht: goud, graan, wol en hout. Eén plek waarlangs hij verandert
// (T.wijzigVoorraad), zoals T.verouder dat voor jaren doet (js/gevecht.js), zodat het scherm
// altijd bijblijft en niets zelf aan S.voorraad hoeft te zitten.
(function (T) {
  'use strict';

  T.GRONDSTOFFEN = ['goud', 'graan', 'wol', 'hout'];

  T.nieuweVoorraad = function () {
    return { goud: 0, graan: 0, wol: 0, hout: 0 };
  };

  // delta mag negatief zijn (uitgeven, verkopen, opeten); de voorraad zakt nooit onder nul.
  T.wijzigVoorraad = function (S, wat, delta) {
    const v = S.voorraad;
    v[wat] = Math.max(0, (v[wat] || 0) + delta);
    // Wat je ooit gehad hebt: de balk (js/hud.js) laat ijzer, zout en gereedschap pas zien als ze er
    // eens geweest zijn, en daarna altijd, zodat hij niet heen en weer springt.
    if (v[wat] > 0) (S.gehad || (S.gehad = {}))[wat] = true;
    // Goud had al een naam van vóór de voorraad bestond, S.goud (js/quest.js); die loopt hier
    // gewoon in de pas mee, zodat het oude gereedschap en de bestaande toetsen blijven werken.
    if (wat === 'goud') {
      S.goud = v.goud;
      if (v.goud > 0) S.goudGehad = true;
    }
    if (T.ui && T.ui.toonVoorraad) T.ui.toonVoorraad(S);
    return v[wat];
  };

  // Een aantal recht neerzetten in plaats van erbij op te tellen, voor gereedschap en toetsen
  // (zoals Toren.debug.meesterschap dat voor een spreuk doet).
  T.zetVoorraad = function (S, wat, aantal) {
    return T.wijzigVoorraad(S, wat, Math.max(0, aantal) - (S.voorraad[wat] || 0));
  };
})(globalThis.Toren = globalThis.Toren || {});
