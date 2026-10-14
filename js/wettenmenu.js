// Het menu Wetten (werklijst vraag 54; Marcel, 29 sep: "Het wordt gewoon een menu zoals in diplomacy 3, waar je
// weten kunt aannemen etc."), onder W en met een knop in de balk. Elke wet is een kaart: zijn naam, één zin, wat
// hij doet in groen en rood, en een knop om hem aan te nemen of af te schaffen; het rantsoen heeft een knop per
// stand. De regels staan in js/wetten.js, en wat een kaart zegt, komt uit dezelfde getallen (T.watDeWetDoet).
// Zolang het menu open is, staat de tijd stil. Een eigen bestand, want js/hud.js is al groot genoeg (vraag 25, C).
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Wat een wet in een stand doet, als lijstje in groen (+) en rood (−), met de stand erboven als het er meer dan
  // één is (het rantsoen: krap en ruim).
  function doet(S, id, stand, kop) {
    const regels = T.watDeWetDoet(S.dorp, id, stand);
    if (!regels.length) return '';
    return (
      `<ul class="wet-doet">${kop ? `<li class="wet-stand">${veilig(kop)}</li>` : ''}` +
      regels.map((r) => `<li class="${r.goed ? 'goed' : 'kost'}">${r.goed ? '+' : '−'} ${veilig(r.tekst)}</li>`).join('') +
      '</ul>'
    );
  }

  function kaart(S, id) {
    const wet = T.WETTEN[id];
    const stand = T.standVanWet(S.dorp, id);
    const aanUit = T.wetIsAanUit(id);
    let knoppen;
    let wat;
    if (aanUit) {
      const aan = stand === 'aangenomen';
      knoppen = `<button class="wet-knop${aan ? ' aan' : ''}" data-wet="${id}" data-stand="${aan ? 'afgeschaft' : 'aangenomen'}">${aan ? T.t('Repeal') : T.t('Pass')}</button>`;
      wat = doet(S, id, 'aangenomen');
    } else {
      knoppen = wet.standen
        .map((s) => `<button class="wet-knop${s === stand ? ' gekozen' : ''}" data-wet="${id}" data-stand="${s}">${T.hoofdletter(wet.toon[s])}</button>`)
        .join('');
      wat = wet.standen.filter((s) => s !== wet.standaard).map((s) => doet(S, id, s, T.hoofdletter(wet.toon[s]))).join('');
    }
    const anders = stand !== wet.standaard;
    const staat = !anders ? '' : aanUit ? ` <b>${T.t('Passed.')}</b>` : ` <b>${T.t('Now: {stand}.', { stand: wet.toon[stand] })}</b>`;
    return (
      `<div class="wet${anders ? ' aangenomen' : ''}">` +
      `<div class="wet-kop"><span class="wet-naam">${veilig(wet.naam)}</span><span class="wet-knoppen">${knoppen}</span></div>` +
      `<p class="wet-uitleg">${veilig(wet.uitleg)}${staat}</p>` +
      wat +
      '</div>'
    );
  }

  function inhoud(S) {
    const dag = S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '';
    const pct = Math.round((S.dorp.behoeften ? S.dorp.behoeften.tevredenheid : 1) * 100);
    const drempel = Math.round(T.BEHOEFTEN_INSTELLINGEN.groeiDrempel * 100);
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('Laws')}</span><span class="venster-wanneer">${dag}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<p class="venster-staat">${T.t('A law applies from today. The village is now <b>{pct}%</b> content; at {drempel}% or more, new families come.', { pct, drempel })}</p>` +
      T.wettenVanNu(S.dorp).map((id) => kaart(S, id)).join('') +
      `<p class="venster-voet">${T.t('While this is open, time stands still. <kbd>Esc</kbd> or <kbd>W</kbd> closes it.')}</p>`
    );
  }

  // Opnieuw tekenen, op de plek waar je was.
  function toon(S) {
    const box = $('wetten');
    const waar = box.scrollTop;
    box.innerHTML = inhoud(S);
    box.scrollTop = waar;
  }

  // Openen en sluiten zoals elk venster (js/ui.js, T.ui.openVenster).
  T.ui.openWetten = function (S) {
    if (T.ui.openVenster(S, 'wetten')) toon(S);
  };

  T.ui.sluitWetten = function (S) {
    T.ui.sluitVenster(S, 'wetten');
  };

  T.ui.meldVenster('wetten', {
    el: 'wetten', toets: 'w', open: (S) => T.ui.openWetten(S), sluit: (S) => T.ui.sluitWetten(S),
  });

  $('wetten').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitWetten(S);
      return;
    }
    if (!b.dataset.wet) return;
    const r = T.zetWet(S.dorp, b.dataset.wet, b.dataset.stand);
    if (!r.kan) T.ui.bericht(r.reden, 'gevaar');
    toon(S);
  });
})(globalThis.Spel = globalThis.Spel || {});
