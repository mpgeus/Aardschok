// Settings (vraag 172; Marcel, 16 okt: "We hebben een volledig menu nodig geen a.i slop"): wat van jou is en niet van het
// spel. Het beeld (de opties met `instelling: true` in js/opties.js: ze raken de wereld niet, dus mag ieder ze anders
// hebben, ook samen), het hele scherm, de taal (tot 16 okt op het titelscherm), en welke toets wat doet. Altijd te
// veranderen, en de browser onthoudt het (T.zetOptie). Een venster zoals elk ander (js/ui.js), dat opent vanuit het
// titelscherm en het menu onder Esc (js/menu.js); dicht is weer het menu. Een rij ziet eruit als in de spelregels
// (T.ui.optieRij, js/hud.js). Geen schuif voor het geluid: er is nog geen geluid, en een knop die niets doet, komt er niet.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const kbd = (toets) => `<kbd>${toets}</kbd>`;
  const ESC = kbd('Esc'); // geen tekst
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Welke toets wat doet, zoals js/main.js, js/hud.js en de vensters ze kennen (js/ui.js, `toets`). Alleen om te lezen.
  function toetsen() {
    const rijen = [
      [T.t('Left click'), T.t('Choose someone or a building; place what you build')],
      [T.t('Right click'), T.t('Send whoever you chose there')],
      [T.t('Drag'), T.t('Choose everyone in the frame')],
      [T.t('Double click'), T.t('Everyone of that kind in view')],
      [`${kbd('←')} ${kbd('↑')} ${kbd('↓')} ${kbd('→')}`, T.t('Move the view; so does the mouse at the edge')],
      [T.t('Wheel'), T.t('Zoom')],
      [kbd('Tab'), T.t('Choose the commander and look at him')],
      [`${kbd('1')} … ${kbd('9')}`, T.t('Choose a group; twice looks at it')],
      [`${kbd('Shift')} + ${kbd('1')} … ${kbd('9')}`, T.t('Make a group of whoever you chose')],
      [kbd('Space'), T.t('Look at the last message with a place')],
      [kbd('B'), T.t('Build')],
      [kbd('V'), T.t('The fields')],
      [kbd('W'), T.t('Laws')],
      [kbd('O'), T.t('Game rules')],
      [kbd('P'), T.t('Pause, and on again')],
      [`${kbd('−')} ${kbd('+')}`, T.t('Slower, faster')],
      [kbd('H'), T.t('Photo mode; there Enter saves a picture')],
      [ESC, T.t('Close, put away, or the menu')],
    ];
    if (T.DEBUG_INSTELLINGEN.aan) rijen.push([kbd('D'), T.t('Debug, until the Steam version')]);
    return rijen.map(([toets, wat]) => `<div class="toets-rij"><span class="toets">${toets}</span><span>${wat}</span></div>`).join('');
  }

  // Het hele scherm: in de browser en in Electron dezelfde vraag aan het document (in Electron doet F11 het ook, js/main.js
  // van de schil in gereedschap/proefversie/maak.cjs).
  const heelScherm = () => !!document.fullscreenElement;
  function zetHeelScherm(aan) {
    if (aan && !heelScherm()) document.documentElement.requestFullscreen().catch(() => {});
    if (!aan && heelScherm()) document.exitFullscreen().catch(() => {});
  }

  // Een rij zoals T.ui.optieRij, voor wat geen optie is (het scherm, de taal): `keuzes` is [{ id, naam, gekozen }].
  function rij(naam, uitleg, soort, keuzes) {
    const knoppen = keuzes
      .map((k) => `<button class="regel-keuze${k.gekozen ? ' gekozen' : ''}" data-${soort}="${k.id}">${veilig(k.naam)}</button>`)
      .join('');
    return `<div class="regel"><div class="regel-naam">${naam}<small>${uitleg}</small></div><div class="regel-keuzes">${knoppen}</div></div>`;
  }

  function inhoud() {
    const beeld = T.OPTIES.filter((o) => o.instelling).map((o) => T.ui.optieRij(o)).join('');
    const scherm = rij(T.t('Fullscreen'), T.t('The game on the whole screen, without the browser around it.'), 'scherm', [
      { id: 'aan', naam: T.t('On'), gekozen: heelScherm() },
      { id: 'uit', naam: T.t('Off'), gekozen: !heelScherm() },
    ]);
    // Elke taal in zijn eigen naam, want wie de taal van nu niet leest, moet de zijne toch vinden.
    const taal = rij(T.t('Language'), T.t('The game reloads in the language you choose.'), 'taal',
      T.talen().map((t) => ({ id: t.code, naam: t.eigen ? `${t.naam} (${T.t('your own translation')})` : t.naam, gekozen: t.code === T.taalNu() })));
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('Settings')}</span><span class="venster-wanneer">${T.t("yours, not the game's")}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<p class="venster-staat">${T.t('How you see the game. It changes nothing in the world, so you can change it at any time, also when playing together; the browser remembers it.')}</p>` +
      `<div class="kop">${T.t('The picture')}</div>${scherm}${beeld}` +
      `<div class="kop">${T.t('Language')}</div>${taal}` +
      `<div class="kop">${T.t('Keys and mouse')}</div><div class="toetsen">${toetsen()}</div>` +
      `<div class="regels-voet"><span>${T.t('{esc} closes.', { esc: ESC })}</span></div>`
    );
  }

  // Opnieuw tekenen, op de plek waar je was.
  function toon() {
    const box = $('instellingen');
    const waar = box.scrollTop;
    box.innerHTML = inhoud();
    box.scrollTop = waar;
  }

  T.ui.openInstellingen = function (S) {
    if (T.ui.openVenster(S, 'instellingen')) toon();
  };
  T.ui.sluitInstellingen = function (S) {
    T.ui.sluitVenster(S, 'instellingen');
  };
  T.ui.meldVenster('instellingen', {
    el: 'instellingen', open: (S) => T.ui.openInstellingen(S), sluit: (S) => T.ui.sluitInstellingen(S),
  });

  $('instellingen').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') return T.ui.sluitInstellingen(S);
    if (b.dataset.optie) T.zetOptie(b.dataset.optie, b.dataset.keuze, S);
    else if (b.dataset.scherm) zetHeelScherm(b.dataset.scherm === 'aan');
    else if (b.dataset.taal && b.dataset.taal !== T.taalNu()) return T.kiesTaal(b.dataset.taal); // de bladzijde herlaadt
    toon();
  });
  // Ook als het hele scherm op een andere manier aan- of uitgaat (Esc van de browser, F11).
  document.addEventListener('fullscreenchange', () => {
    if (T.ui.vensterOpen() === 'instellingen') toon();
  });
})(globalThis.Spel = globalThis.Spel || {});
