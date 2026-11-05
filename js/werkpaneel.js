// Het werkpaneel (Marcel, 4 nov: "1. A", één paneel voor het werk, en "w mag shortcut zijn, maar er moet ook een knop in de
// UI komen"): onder W en met de knop Work onderaan, naast Build. Een rij per soort werkplaats die er staat, met − en +,
// hoeveel er werken van hoeveel er kunnen, en wat het per dag oplevert, nu en met alle handen; bovenaan hoeveel er vrij
// zijn, want wie niet werkt, draagt en bouwt mee. De regels en de getallen staan in js/werk.js (T.werkRijen,
// T.werkTelling); een klik geeft de opdracht `inzet` (js/tik.js), die bij de volgende tik ingaat, ook als de tijd
// stilstaat, en het paneel tekent zichzelf dan opnieuw (T.ui.werkWerkpaneelBij, elk beeld). Alleen scherm.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const getal = (n) => (n < 10 ? Math.round(n * 10) / 10 : Math.round(n));

  // { waar: zoveel } als "4 logs and 2 hides".
  const waren = (per) => T.opsomming(Object.entries(per).map(([wat, n]) => T.hoeveel(getal(n), wat)));

  // Wat een rij zegt onder zijn naam: wat hij per dag maakt (en vol), of bij een boerderij haar oogst en akkers, en waarom
  // hij stilstaat.
  function maakt(r) {
    const regels = [];
    if (Object.keys(r.vol).length) {
      regels.push(r.bezet > 0
        ? T.t('Makes {nu} a day; with all hands {vol}.', { nu: waren(r.perDag), vol: waren(r.vol) })
        : T.t('Makes nothing now; with all hands {vol} a day.', { vol: waren(r.vol) }));
    }
    if (r.oogst) {
      const oogst = Object.keys(r.oogst).length ? waren(r.oogst) : T.t('nothing yet');
      regels.push(T.t('Harvest this year: {oogst}. Fields: {n}.', { oogst, n: r.akkers }));
    }
    if (r.bezet < r.n) regels.push(T.t('Only {n} at work: nobody else is free.', { n: r.bezet }));
    if (r.stil) regels.push(T.t('Standing still: {waarom}.', { waarom: r.stil }));
    return regels.map((t) => `<div class="werk-maakt">${veilig(t)}</div>`).join('');
  }

  function rij(r, klaar) {
    const S = T.GEBOUWEN[r.soort];
    // Hoeveel er van staan, als ×2 achter de naam (een werkplaats heeft geen meervoud in T.GEBOUWEN, alleen een woning).
    const naam = veilig(T.hoofdletter(S.naam)) + (klaar > 1 ? ` <small>×${klaar}</small>` : '');
    return (
      '<div class="werk-rij">' +
      `<div class="werk-kop"><span class="werk-naam">${naam}</span><span class="werk-knoppen">` +
      `<button class="werk-knop" data-gebouw="${r.soort}" data-n="${r.n - 1}"${r.n > 0 ? '' : ' disabled'} title="${T.t('One less')}">−</button>` +
      `<span class="werk-n">${T.t('{n} of {max}', { n: r.n, max: r.max })}</span>` +
      `<button class="werk-knop" data-gebouw="${r.soort}" data-n="${r.n + 1}"${r.n < r.max ? '' : ' disabled'} title="${T.t('One more')}">+</button>` +
      '</span></div>' +
      maakt(r) +
      '</div>'
    );
  }

  function inhoud(S) {
    const D = S.dorp;
    const dag = S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '';
    const tel = T.werkTelling(D);
    const rijen = T.werkRijen(D);
    const klaar = (soort) => D.gebouwen.filter((g) => g.soort === soort && g.klaar).length;
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('Work')}</span><span class="venster-wanneer">${dag}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<p class="venster-staat">${T.t('<b>{werken}</b> of {handen} people work in a workshop or on a farm; <b>{vrij}</b> are free, and carry and build.', tel)}</p>` +
      (rijen.length
        ? rijen.map((r) => rij(r, klaar(r.soort))).join('')
        : `<p class="werk-leeg">${T.t('No workshop stands yet.')}</p>`) +
      `<p class="venster-voet">${T.t('While this is open, time stands still. <kbd>Esc</kbd> or <kbd>W</kbd> closes it.')}</p>`
    );
  }

  // Opnieuw tekenen, op de plek waar je was, en alleen als er iets veranderde (elk beeld, hieronder).
  let laatste = '';
  function toon(S) {
    const box = $('werk');
    const html = inhoud(S);
    if (html === laatste) return;
    laatste = html;
    const waar = box.scrollTop;
    box.innerHTML = html;
    box.scrollTop = waar;
  }

  T.ui.openWerk = function (S) {
    laatste = '';
    if (T.ui.openVenster(S, 'werk')) toon(S);
  };

  T.ui.sluitWerk = function (S) {
    T.ui.sluitVenster(S, 'werk');
  };

  // Elk beeld (js/main.js): staat het paneel open, dan zie je wat een klik deed zodra de opdracht inging (meteen), en de
  // getallen van vandaag (vier keer per seconde: het paneel opmaken kost meer dan niets).
  let volgende = 0;
  T.ui.werkWerkpaneelBij = function (S) {
    if (T.ui.vensterOpen() !== 'werk' || !S.dorp) return;
    const nu = performance.now();
    if (nu < volgende) return;
    volgende = nu + 250;
    toon(S);
  };

  T.ui.meldVenster('werk', {
    el: 'werk', knop: 'werk-knop', toets: 'w', open: (S) => T.ui.openWerk(S), sluit: (S) => T.ui.sluitWerk(S),
  });

  $('werk-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (T.S) T.ui.wisselVenster(T.S, 'werk');
  });

  $('werk').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitWerk(S);
      return;
    }
    if (!b.dataset.gebouw) return;
    T.geefOpdracht(S, { soort: 'inzet', dorp: S.dorpen.indexOf(S.dorp), gebouw: b.dataset.gebouw, n: Number(b.dataset.n) });
    volgende = 0; // het volgende beeld, na de tik die hem uitvoert
  });
})(globalThis.Spel = globalThis.Spel || {});
