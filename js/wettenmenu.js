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
    const regels = T.watDeWetDoet(S, id, stand);
    if (!regels.length) return '';
    return (
      `<ul class="wet-doet">${kop ? `<li class="wet-stand">${veilig(kop)}</li>` : ''}` +
      regels.map((r) => `<li class="${r.goed ? 'goed' : 'kost'}">${r.goed ? '+' : '−'} ${veilig(r.tekst)}</li>`).join('') +
      '</ul>'
    );
  }

  function kaart(S, id) {
    const wet = T.WETTEN[id];
    const stand = T.standVanWet(S, id);
    const aanUit = T.wetIsAanUit(id);
    let knoppen;
    let wat;
    if (aanUit) {
      const aan = stand === 'aangenomen';
      knoppen = `<button class="wet-knop${aan ? ' aan' : ''}" data-wet="${id}" data-stand="${aan ? 'afgeschaft' : 'aangenomen'}">${aan ? 'Afschaffen' : 'Aannemen'}</button>`;
      wat = doet(S, id, 'aangenomen');
    } else {
      knoppen = wet.standen
        .map((s) => `<button class="wet-knop${s === stand ? ' gekozen' : ''}" data-wet="${id}" data-stand="${s}">${T.hoofdletter(s)}</button>`)
        .join('');
      wat = wet.standen.filter((s) => s !== wet.standaard).map((s) => doet(S, id, s, T.hoofdletter(s))).join('');
    }
    const anders = stand !== wet.standaard;
    const staat = !anders ? '' : aanUit ? ' <b>Aangenomen.</b>' : ` <b>Nu: ${stand}.</b>`;
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
    const pct = Math.round((S.behoeften ? S.behoeften.tevredenheid : 1) * 100);
    const drempel = Math.round(T.BEHOEFTEN_INSTELLINGEN.groeiDrempel * 100);
    return (
      `<div class="venster-kop"><span class="venster-titel">Wetten</span><span class="venster-wanneer">${dag}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<p class="venster-staat">Een wet geldt vanaf vandaag. Het dorp is nu <b>${pct}%</b> tevreden; bij ${drempel}% of meer komen er nieuwe gezinnen.</p>` +
      T.wettenVanNu(S).map((id) => kaart(S, id)).join('') +
      '<p class="venster-voet">Zolang dit open is, staat de tijd stil. <kbd>Esc</kbd> of <kbd>W</kbd> sluit.</p>'
    );
  }

  // Opnieuw tekenen, op de plek waar je was.
  function toon(S) {
    const box = $('wetten');
    const waar = box.scrollTop;
    box.innerHTML = inhoud(S);
    box.scrollTop = waar;
  }

  T.ui.wettenOpen = () => !$('wetten').classList.contains('verborgen');

  T.ui.openWetten = function (S) {
    S.modus = 'wetten';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    if (T.ui.briefOpen()) T.ui.sluitBrief(S);
    T.ui.verbergTooltip();
    T.houdTijdStil(S, 'wetten');
    $('wetten').classList.remove('verborgen');
    toon(S);
    $('wetten-knop').classList.add('actief');
  };

  T.ui.sluitWetten = function (S) {
    $('wetten').classList.add('verborgen');
    $('wetten-knop').classList.remove('actief');
    if (S.modus === 'wetten') S.modus = 'verkennen';
    T.laatTijdGaan(S, 'wetten');
  };

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
    const r = T.zetWet(S, b.dataset.wet, b.dataset.stand);
    if (!r.kan) T.ui.bericht(r.reden, 'gevaar');
    toon(S);
  });

  $('wetten-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    const S = T.S;
    if (!S) return;
    if (T.ui.wettenOpen()) {
      T.ui.sluitWetten(S);
      return;
    }
    // Van de spelregels of de velden meteen naar de wetten, zonder eerst het ene venster dicht te hoeven doen.
    if (T.ui.spelregelsOpen()) T.ui.sluitSpelregels(S);
    if (T.ui.veldenOpen()) T.ui.sluitVelden(S);
    if (S.modus === 'verkennen') T.ui.openWetten(S);
  });
})(globalThis.Spel = globalThis.Spel || {});
