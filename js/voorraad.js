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
  T.wijzigVoorraad = function (D, wat, delta) {
    const v = D.voorraad;
    v[wat] = Math.max(0, (v[wat] || 0) + delta);
    // Wat je ooit gehad hebt: de balk (js/hud.js) laat ijzer, zout en gereedschap pas zien als ze er
    // eens geweest zijn, en daarna altijd, zodat hij niet heen en weer springt.
    if (v[wat] > 0) (D.gehad || (D.gehad = {}))[wat] = true;
    // Goud had al een naam van vóór de voorraad bestond, D.goud (van de quests, tot 23 okt); die loopt hier
    // gewoon in de pas mee (js/ui.js en js/grillen.js lezen hem).
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

  // De waren zoals de speler ze ziet (vraag 147; Marcel, 11 okt: alles in het Engels; ontwerp/engels.md). In de code
  // heten ze zoals altijd ('graan'); op het scherm T.waarNaam('graan') → 'grain', en met een aantal T.hoeveel(3, 'graan')
  // → '3 grain' of T.hoeveel(1, 'gereedschap') → '1 tool'. Elke zin met een waar erin neemt hem hier; een waar die hier
  // niet staat, heet zoals in de code.
  const WAREN = {
    bier: () => T.t('ale'), brood: () => T.t('bread'), eieren: () => T.t('eggs'), gereedschap: () => T.t('tools'),
    goud: () => T.t('gold'), graan: () => T.t('grain'), groente: () => T.t('vegetables'), hooi: () => T.t('hay'),
    hout: () => T.t('logs'), huiden: () => T.t('hides'), ijzer: () => T.t('iron'), kaas: () => T.t('cheese'),
    kalk: () => T.t('lime'), klei: () => T.t('clay'), laken: () => T.t('cloth'), leer: () => T.t('leather'),
    meel: () => T.t('flour'), melk: () => T.t('milk'), mest: () => T.t('dung'), planken: () => T.t('planks'),
    riet: () => T.t('reed'), steen: () => T.t('stone'), turf: () => T.t('peat'), vaten: () => T.t('barrels'),
    vis: () => T.t('fish'), vlees: () => T.t('meat'), wijn: () => T.t('wine'),
    wol: () => T.t('wool'), zaaigraan: () => T.t('seed grain'), zout: () => T.t('salt'),
    // de stukken van de wapenmaker, voor de soldaten (js/soldaten.js)
    speren: () => T.t('spears'), pieken: () => T.t('pikes'), zwaarden: () => T.t('swords'), schilden: () => T.t('shields'),
    bogen: () => T.t('bows'), kruisbogen: () => T.t('crossbows'), harnassen: () => T.t('leather armour'),
  };
  // Wat je telt, heeft een enkelvoud; de rest is een hoeveelheid ("3 grain").
  const TELBAAR = {
    brood: (n) => T.t('{n|# loaf|# loaves}', { n }), eieren: (n) => T.t('{n|# egg|# eggs}', { n }),
    gereedschap: (n) => T.t('{n|# tool|# tools}', { n }), huiden: (n) => T.t('{n|# hide|# hides}', { n }),
    hout: (n) => T.t('{n|# log|# logs}', { n }),
    planken: (n) => T.t('{n|# plank|# planks}', { n }), vaten: (n) => T.t('{n|# barrel|# barrels}', { n }),
    speren: (n) => T.t('{n|# spear|# spears}', { n }), pieken: (n) => T.t('{n|# pike|# pikes}', { n }),
    zwaarden: (n) => T.t('{n|# sword|# swords}', { n }), schilden: (n) => T.t('{n|# shield|# shields}', { n }),
    bogen: (n) => T.t('{n|# bow|# bows}', { n }), kruisbogen: (n) => T.t('{n|# crossbow|# crossbows}', { n }),
    harnassen: (n) => T.t('{n|# leather armour|# leather armours}', { n }),
  };
  T.waarNaam = (wat) => (WAREN[wat] ? WAREN[wat]() : wat);
  T.hoeveel = (n, wat) => (TELBAAR[wat] ? TELBAAR[wat](n) : T.t('{n} {waar}', { n, waar: T.waarNaam(wat) }));
})(globalThis.Spel = globalThis.Spel || {});
