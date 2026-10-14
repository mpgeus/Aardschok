// Het venster Raadsman (werklijst vraag 67; Marcel, 30 sep: "B"), onder R en met een knop in de balk: de boeren waaruit
// je je raadsman kiest, elk een kaart met wie hij is en wat hij kan (twee vaardigheden, goed in groen, slecht in
// rood), en een knop om hem te kiezen; later kies je hier een ander. Onderaan
// wat hij besloot. De regels staan in js/raadsman.js. Zolang het venster open is, staat de tijd stil. Een eigen
// bestand, zoals het menu Wetten (js/wettenmenu.js), want js/hud.js is al groot genoeg (vraag 25, C).
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const naam = (p) => T.hoofdletter(T.naamVanBewoner(p));

  // Eén boer: wie hij is, wat hij kan, en de knop.
  function kaart(S, p, nu) {
    const kan = Object.entries(T.vaardighedenVan(S.dorp, p)).map(([soort, niveau]) => {
      const v = T.VAARDIGHEDEN[soort];
      return `<li class="${niveau === 'goed' ? 'goed' : 'kost'}">${niveau === 'goed' ? '+' : '−'} ${veilig(v[niveau])} <span>(${veilig(v.waarop)})</span></li>`;
    });
    const gekozen = p === nu;
    const knop = gekozen
      ? `<span class="rs-knop gekozen">${T.t('Your advisor')}</span>`
      : `<button class="rs-knop" data-wie="${p.id}">${T.t('Choose {naam}', { naam: veilig(naam(p)) })}</button>`;
    return (
      `<div class="rs-kaart${gekozen ? ' gekozen' : ''}">` +
      `<div class="rs-kop"><span class="rs-naam">${veilig(naam(p))}</span>${knop}</div>` +
      (kan.length ? `<ul class="rs-kan">${kan.join('')}</ul>` : `<p class="rs-neiging">${T.t('Has no particular skills.')}</p>`) +
      '</div>'
    );
  }

  function inhoud(S) {
    const dag = S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '';
    const nu = T.raadsmanVan(S.dorp);
    const kandidaten = T.raadsmanKandidaten(S.dorp);
    // Wie je eerder koos (ook buiten deze drie, met Spel.debug.raadsman), staat er ook bij.
    if (nu && !kandidaten.includes(nu)) kandidaten.unshift(nu);
    // Wanneer hij beslist (werklijst vraag 68): als je weg bent, en met de spelregel ook als je niet op tijd spreekt.
    // Vier hele zinnen, zodat een vertaler ze heel ziet.
    const ook = T.RAADSMAN_INSTELLINGEN.nietGesproken;
    const metNaam = { naam: nu ? veilig(naam(nu)) : '' };
    let staat;
    if (!T.RAADSMAN_INSTELLINGEN.aan) staat = T.t('The "Advisor" rule is off: whatever you miss, passes.');
    else if (nu && ook) staat = T.t('Your advisor is <b>{naam}</b>. If you are away, or do not speak in time to someone who is looking for you, {naam} decides. Whoever is advisor reaps more slowly.', metNaam);
    else if (nu) staat = T.t('Your advisor is <b>{naam}</b>. If you are not in the village when someone comes looking for you, {naam} decides. Whoever is advisor reaps more slowly.', metNaam);
    else if (ook) staat = T.t('You have no advisor yet. If you are away, or do not speak in time to someone who is looking for you, it passes. Choose one of these farmers; whoever is advisor reaps more slowly.');
    else staat = T.t('You have no advisor yet. If you are not in the village when someone comes looking for you, it passes. Choose one of these farmers; whoever is advisor reaps more slowly.');
    const besluiten = ((S.dorp.raadsman && S.dorp.raadsman.besluiten) || []).slice(-5).reverse();
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('Advisor')}</span><span class="venster-wanneer">${dag}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<p class="venster-staat">${staat}</p>` +
      (kandidaten.length ? kandidaten.map((p) => kaart(S, p, nu)).join('') : `<p class="venster-staat">${T.t('No farmers live here.')}</p>`) +
      (besluiten.length
        ? `<div class="rs-besluiten"><div class="rs-besluiten-kop">${T.t('Decisions')}</div><ul>` +
          besluiten.map((b) => {
            const woorden = {
              dag: veilig(T.datumVanDag(b.dag).tekst), door: veilig(b.door || ''), antwoord: veilig(b.antwoord),
              titel: veilig(T.VOORVALLEN[b.id] ? T.VOORVALLEN[b.id].titel : b.id),
            };
            return `<li>${T.t('{dag}, {door} on {titel}: "{antwoord}"', woorden)}${b.prijs ? ` <span>(${veilig(b.prijs)})</span>` : ''}</li>`;
          }).join('') +
          '</ul></div>'
        : '') +
      `<p class="venster-voet">${T.t('While this is open, time stands still. <kbd>Esc</kbd> or <kbd>R</kbd> closes it.')}</p>`
    );
  }

  // Opnieuw tekenen, op de plek waar je was.
  function toon(S) {
    const box = $('raadsman');
    const waar = box.scrollTop;
    box.innerHTML = inhoud(S);
    box.scrollTop = waar;
  }

  // Openen en sluiten zoals elk venster (js/ui.js, T.ui.openVenster).
  T.ui.openRaadsman = function (S) {
    if (T.ui.openVenster(S, 'raadsman')) toon(S);
  };

  T.ui.sluitRaadsman = function (S) {
    T.ui.sluitVenster(S, 'raadsman');
  };

  T.ui.meldVenster('raadsman', {
    el: 'raadsman', toets: 'r', open: (S) => T.ui.openRaadsman(S), sluit: (S) => T.ui.sluitRaadsman(S),
  });

  $('raadsman').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitRaadsman(S);
      return;
    }
    if (!b.dataset.wie) return;
    const p = S.dorp.bewoners && S.dorp.bewoners.mensen.find((x) => String(x.id) === b.dataset.wie);
    const r = p ? T.kiesRaadsman(S.dorp, p) : { kan: false, reden: T.t('That farmer is no longer here.') };
    if (!r.kan) T.ui.bericht(r.reden, 'gevaar');
    toon(S);
  });
})(globalThis.Spel = globalThis.Spel || {});
