// Het venster Raadsman (werklijst vraag 67; Marcel, 30 sep: "B"), onder R en met een knop in de balk: de boeren waaruit
// je je raadsman kiest, elk een kaart met wie hij is, hoe hij beslist (zijn karakter) en wat hij kan (twee
// vaardigheden, goed in groen, slecht in rood), en een knop om hem te kiezen; later kies je hier een ander. Onderaan
// wat hij besloot. De regels staan in js/raadsman.js. Zolang het venster open is, staat de tijd stil. Een eigen
// bestand, zoals het menu Wetten (js/wettenmenu.js), want js/hud.js is al groot genoeg (vraag 25, C).
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const naam = (p) => T.hoofdletter(T.naamVanBewoner(p));

  // Eén boer: wie hij is, hoe hij beslist, wat hij kan, en de knop.
  function kaart(S, p, nu) {
    const e = p.wezen;
    const over = T.overBoer(e) || { kort: '', lang: '', eigenschappen: [] };
    const eigenschappen = over.eigenschappen.filter((t) => t !== 'je raadsman');
    const wie = [T.hoofdletter(over.lang || over.kort || '')].concat(eigenschappen).filter(Boolean).join(' · ');
    const neiging = T.RAADSMAN_NEIGINGEN[e.karakter];
    const kan = Object.entries(T.vaardighedenVan(S, p)).map(([soort, niveau]) => {
      const v = T.VAARDIGHEDEN[soort];
      return `<li class="${niveau === 'goed' ? 'goed' : 'kost'}">${niveau === 'goed' ? '+' : '−'} ${veilig(v[niveau])} <span>(${veilig(v.waarop)})</span></li>`;
    });
    const gekozen = p === nu;
    const knop = gekozen
      ? '<span class="rs-knop gekozen">Je raadsman</span>'
      : `<button class="rs-knop" data-wie="${veilig(p.wie)}">Kies ${veilig(naam(p))}</button>`;
    return (
      `<div class="rs-kaart${gekozen ? ' gekozen' : ''}">` +
      `<div class="rs-kop"><span class="rs-naam">${veilig(naam(p))}</span>${knop}</div>` +
      `<p class="rs-wie">${veilig(wie)}</p>` +
      (neiging ? `<p class="rs-neiging">Beslist ${veilig(neiging)}.</p>` : '') +
      (kan.length ? `<ul class="rs-kan">${kan.join('')}</ul>` : '<p class="rs-neiging">Kan niets bijzonders.</p>') +
      '</div>'
    );
  }

  function inhoud(S) {
    const dag = S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '';
    const nu = T.raadsmanVan(S);
    const kandidaten = T.raadsmanKandidaten(S);
    // Wie je eerder koos (ook buiten deze drie, met Spel.debug.raadsman), staat er ook bij.
    if (nu && !kandidaten.includes(nu)) kandidaten.unshift(nu);
    const staat = !T.RAADSMAN_INSTELLINGEN.aan
      ? 'De spelregel "Raadsman" staat uit: wat je mist, gaat voorbij.'
      : nu
        ? `Je raadsman is <b>${veilig(naam(nu))}</b>. Ben je er niet als iemand je met een voorval zoekt, dan beslist ${veilig(naam(nu))}. Wie raadsman is, maait trager.`
        : 'Je hebt nog geen raadsman. Ben je er niet als iemand je met een voorval zoekt, dan gaat het voorbij. Kies er een uit deze boeren; wie raadsman is, maait trager.';
    const besluiten = ((S.raadsman && S.raadsman.besluiten) || []).slice(-5).reverse();
    return (
      `<div class="venster-kop"><span class="venster-titel">Raadsman</span><span class="venster-wanneer">${dag}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<p class="venster-staat">${staat}</p>` +
      (kandidaten.length ? kandidaten.map((p) => kaart(S, p, nu)).join('') : '<p class="venster-staat">Hier wonen geen boeren.</p>') +
      (besluiten.length
        ? '<div class="rs-besluiten"><div class="rs-besluiten-kop">Wat hij besloot</div><ul>' +
          besluiten.map((b) => `<li>${veilig(T.datumVanDag(b.dag).tekst)}, ${veilig(b.door || '')} over ${veilig(T.VOORVALLEN[b.id] ? T.VOORVALLEN[b.id].titel : b.id)}: "${veilig(b.antwoord)}"${b.prijs ? ` <span>(${veilig(b.prijs)})</span>` : ''}</li>`).join('') +
          '</ul></div>'
        : '') +
      '<p class="venster-voet">Zolang dit open is, staat de tijd stil. <kbd>Esc</kbd> of <kbd>R</kbd> sluit.</p>'
    );
  }

  // Opnieuw tekenen, op de plek waar je was.
  function toon(S) {
    const box = $('raadsman');
    const waar = box.scrollTop;
    box.innerHTML = inhoud(S);
    box.scrollTop = waar;
  }

  T.ui.raadsmanOpen = () => !$('raadsman').classList.contains('verborgen');

  T.ui.openRaadsman = function (S) {
    S.modus = 'raadsman';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    if (T.ui.briefOpen()) T.ui.sluitBrief(S);
    T.ui.verbergTooltip();
    T.houdTijdStil(S, 'raadsman');
    $('raadsman').classList.remove('verborgen');
    toon(S);
    $('raadsman-knop').classList.add('actief');
  };

  T.ui.sluitRaadsman = function (S) {
    $('raadsman').classList.add('verborgen');
    $('raadsman-knop').classList.remove('actief');
    if (S.modus === 'raadsman') S.modus = 'verkennen';
    T.laatTijdGaan(S, 'raadsman');
  };

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
    const p = S.bewoners && S.bewoners.mensen.find((x) => x.wie === b.dataset.wie);
    const r = p ? T.kiesRaadsman(S, p) : { kan: false, reden: 'Die is er niet meer.' };
    if (!r.kan) T.ui.bericht(r.reden, 'gevaar');
    toon(S);
  });

  $('raadsman-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    const S = T.S;
    if (!S) return;
    if (T.ui.raadsmanOpen()) {
      T.ui.sluitRaadsman(S);
      return;
    }
    // Van de spelregels, de velden of de wetten meteen hierheen, zonder eerst het ene venster dicht te hoeven doen.
    if (T.ui.spelregelsOpen()) T.ui.sluitSpelregels(S);
    if (T.ui.veldenOpen()) T.ui.sluitVelden(S);
    if (T.ui.wettenOpen()) T.ui.sluitWetten(S);
    if (S.modus === 'verkennen') T.ui.openRaadsman(S);
  });
})(globalThis.Spel = globalThis.Spel || {});
