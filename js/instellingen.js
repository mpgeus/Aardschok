// Settings (vraag 172; Marcel, 16 okt: "We hebben een volledig menu nodig geen a.i slop", en daarna, 172b: "Zaken als
// resolutie etc hebben we nodig"): wat van jou is en niet van het spel. Vier tabbladen: Display (het venster en zijn
// formaat, hoeveel beelden per seconde, de meter, de helderheid), Graphics (hoe de wereld getekend wordt), Game (pauze als
// je wegklikt, vanzelf opslaan, de raad, de taal) en Controls (welke toets wat doet). Wat er te kiezen is, zijn de opties
// met `instelling` in js/opties.js (die noemt het tabblad): ze raken de wereld niet, dus mag ieder ze anders hebben, ook
// samen, en de browser onthoudt ze (T.zetOptie). Een venster zoals elk ander (js/ui.js), dat opent vanuit het titelscherm
// en het menu onder Esc (js/menu.js); dicht is weer het menu. Een rij ziet eruit als in de spelregels (T.ui.optieRij,
// js/hud.js). Geen schuif voor het geluid: er is nog geen geluid, en een knop die niets doet, komt er niet.
//
// Het venster: in de verpakte versie (Electron) is er een smalle brug, `window.schil` (de preload in
// gereedschap/proefversie/maak.cjs): het hele scherm, of een venster van het formaat dat je koos. Electron kan de
// resolutie van de monitor niet omzetten; het hele scherm is altijd zonder rand, op de resolutie van je scherm. In de
// browser is er alleen het hele scherm aan of uit (requestFullscreen), en dat onthoudt de browser niet: dat mag pas na
// een klik.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const kbd = (toets) => `<kbd>${toets}</kbd>`;
  const ESC = kbd('Esc'); // geen tekst
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Het tabblad dat open is (alleen scherm: het volgende venster opent weer daar).
  const TABS = () => [['beeld', T.t('Display')], ['tekening', T.t('Graphics')], ['spel', T.t('Game')], ['toetsen', T.t('Controls')]];
  let tab = 'beeld';

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
      [kbd('R'), T.t('Turn what you build; Shift turns it back')],
      [kbd('V'), T.t('The fields')],
      [kbd('W'), T.t('Laws')],
      [kbd('O'), T.t('Game rules')],
      [kbd('P'), T.t('Pause, and on again')],
      [`${kbd('−')} ${kbd('+')}`, T.t('Slower, faster')],
      [kbd('H'), T.t('Photo mode; there Enter saves a picture')],
      [kbd('F'), T.t('Buildings flat, to see what stands behind them')],
      [kbd('F2'), T.t('The meter')],
      [ESC, T.t('Close, put away, or the menu')],
    ];
    if (T.DEBUG_INSTELLINGEN.aan) rijen.push([kbd('D'), T.t('Debug, until the Steam version')]);
    return rijen.map(([toets, wat]) => `<div class="toets-rij"><span class="toets">${toets}</span><span>${wat}</span></div>`).join('');
  }

  // ── Het venster ──

  const schil = () => window.schil || null;
  const optie = (id) => T.OPTIES.find((o) => o.id === id);
  const VENSTER = ['venster', 'vensterMaat'];

  // In Electron: het venster zoals je het koos. Bij het begin (zodra alle scripts er zijn, ook js/opties.js), en na een
  // keuze; de schil laat het venster pas zien als het zijn stand kent.
  function pasVensterToe() {
    const s = schil();
    if (!s) return;
    const I = T.TEKENEN_INSTELLINGEN;
    s.venster(I.venster, I.vensterMaat[0], I.vensterMaat[1]);
  }
  document.addEventListener('DOMContentLoaded', pasVensterToe); // geen tekst

  // In de browser: het hele scherm, gevraagd aan het document (in Electron doet F11 het ook).
  const heelScherm = () => !!document.fullscreenElement;
  function zetHeelScherm(aan) {
    if (aan && !heelScherm()) document.documentElement.requestFullscreen().catch(() => {});
    if (!aan && heelScherm()) document.exitFullscreen().catch(() => {});
  }

  // Een rij zoals T.ui.optieRij, voor wat geen optie is (het scherm in de browser, de taal): `keuzes` is
  // [{ id, naam, gekozen }].
  function rij(naam, uitleg, soort, keuzes) {
    const knoppen = keuzes
      .map((k) => `<button class="regel-keuze${k.gekozen ? ' gekozen' : ''}" data-${soort}="${k.id}">${veilig(k.naam)}</button>`)
      .join('');
    return `<div class="regel"><div class="regel-naam">${naam}<small>${uitleg}</small></div><div class="regel-keuzes">${knoppen}</div></div>`;
  }

  function vensterRijen() {
    if (!schil()) {
      const o = optie('venster');
      return rij(o.naam, o.uitleg, 'scherm', [
        { id: 'aan', naam: T.t('Fullscreen'), gekozen: heelScherm() },
        { id: 'uit', naam: T.t('Window'), gekozen: !heelScherm() },
      ]);
    }
    // Een formaat dat groter is dan je scherm, kan niet (in de pixels van Windows: met een schaal van 150% is een scherm
    // van 1920 bij 1080 er 1280 bij 720).
    const past = (k) => {
      const [b, h] = k.zet['TEKENEN_INSTELLINGEN.vensterMaat']; // geen tekst
      return b <= screen.width && h <= screen.height;
    };
    return T.ui.optieRij(optie('venster')) + T.ui.optieRij(optie('vensterMaat'), true, past);
  }

  // ── Wat er te zien is ──

  const rijenVan = (soort) => T.OPTIES.filter((o) => o.instelling === soort && !VENSTER.includes(o.id)).map((o) => T.ui.optieRij(o)).join('');

  function tabInhoud() {
    if (tab === 'beeld') return vensterRijen() + rijenVan('beeld');
    if (tab === 'tekening') return rijenVan('tekening');
    if (tab === 'spel') {
      // Elke taal in zijn eigen naam, want wie de taal van nu niet leest, moet de zijne toch vinden.
      const taal = rij(T.t('Language'), T.t('The game reloads in the language you choose.'), 'taal',
        T.talen().map((t) => ({ id: t.code, naam: t.eigen ? `${t.naam} (${T.t('your own translation')})` : t.naam, gekozen: t.code === T.taalNu() })));
      return rijenVan('spel') + taal;
    }
    return `<div class="toetsen">${toetsen()}</div>`;
  }

  function inhoud() {
    const tabs = TABS().map(([id, naam]) => `<button class="tab${id === tab ? ' gekozen' : ''}" data-tab="${id}">${naam}</button>`).join('');
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('Settings')}</span><span class="venster-wanneer">${T.t("yours, not the game's")}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<div class="tabs">${tabs}</div>` +
      `<div class="tab-inhoud">${tabInhoud()}</div>` +
      `<div class="regels-voet"><span>${T.t('It changes nothing in the world, so you can change it at any time; the browser remembers it. {esc} closes.', { esc: ESC })}</span></div>`
    );
  }

  // Opnieuw tekenen, op de plek waar je was (een ander tabblad begint bovenaan).
  function toon(zelfdeTab = true) {
    const box = $('instellingen');
    const vak = box.querySelector('.tab-inhoud');
    const waar = zelfdeTab && vak ? vak.scrollTop : 0;
    box.innerHTML = inhoud();
    box.querySelector('.tab-inhoud').scrollTop = waar;
  }

  T.ui.openInstellingen = function (S) {
    if (T.ui.openVenster(S, 'instellingen')) toon(false);
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
    if (!b || b.disabled || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') return T.ui.sluitInstellingen(S);
    if (b.dataset.tab) {
      tab = b.dataset.tab;
      return toon(false);
    }
    if (b.dataset.optie) {
      T.zetOptie(b.dataset.optie, b.dataset.keuze, S);
      T.ui.pasBeeldToe(); // de meter, de helderheid (js/main.js)
      if (VENSTER.includes(b.dataset.optie)) pasVensterToe();
    } else if (b.dataset.scherm) zetHeelScherm(b.dataset.scherm === 'aan');
    else if (b.dataset.taal && b.dataset.taal !== T.taalNu()) return T.kiesTaal(b.dataset.taal); // de bladzijde herlaadt
    toon();
  });
  // Ook als het hele scherm op een andere manier aan- of uitgaat (Esc van de browser, F11).
  document.addEventListener('fullscreenchange', () => {
    if (T.ui.vensterOpen() === 'instellingen') toon();
  });
})(globalThis.Spel = globalThis.Spel || {});
