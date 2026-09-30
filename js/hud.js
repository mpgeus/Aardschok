// Het scherm van het gehuchtspel: de kalender (dag, seizoen, jaar) en de voorraad (goud, graan,
// wol, hout) -- in de stijl en de plek van js/ui.js, maar in een eigen bestand, want het hoort
// bij het nieuwe spel en niet bij De laatste klim. Sinds de kaarten van het oude spel weg zijn
// (25 sep, ontwerp/werklijst.md punt 7c) staat het altijd aan; T.NIEUWE_HUD blijft bestaan omdat
// een paar plekken er nog naar vragen. Het oude scherm linksboven (sluipen, goud en spullen) staat
// nog in index.html, maar verborgen: sluipen en de spullen hebben in dit scherm nog geen plek.
(function (T) {
  'use strict';

  T.NIEUWE_HUD = true;
  document.body.classList.toggle('nieuwe-hud', T.NIEUWE_HUD);

  const $ = (id) => document.getElementById(id);

  // Dezelfde tekenstijl als de spullen in js/ui.js (ICONEN): kleine, met de hand getekende
  // pictogrammen in de kleuren van stijl.css, in plaats van nieuwe pixel art -- er staat toch
  // geen goud, graan, wol of hout tussen de cellen van beelden/voorwerpen.png (js/sprites.js).
  const GOUD_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<ellipse cx="12" cy="17" rx="7" ry="2.6" fill="#c9972f" stroke="#e2b64a" stroke-width="1.1"/>' +
    '<ellipse cx="12" cy="13.5" rx="7" ry="2.6" fill="#d9a83c" stroke="#e2b64a" stroke-width="1.1"/>' +
    '<ellipse cx="12" cy="10" rx="7" ry="2.6" fill="#e2b64a" stroke="#f0cc72" stroke-width="1.1"/>' +
    '</svg>';
  const GRAAN_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M12 21V9M12 9L6.5 4M12 9l5.5-5M12 9L8.5 3M12 9l3.5-6" stroke="#c9972f" stroke-width="1.3" stroke-linecap="round" fill="none"/>' +
    '<circle cx="6.5" cy="4" r="1.15" fill="#e2b64a"/><circle cx="17.5" cy="4" r="1.15" fill="#e2b64a"/><circle cx="12" cy="2.6" r="1.15" fill="#e2b64a"/>' +
    '<path d="M8.5 14.5h7" stroke="#8a5a2c" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>';
  const WOL_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M6 14a3.4 3.4 0 0 1 .3-6.7 4 4 0 0 1 7.6-1.6 3.6 3.6 0 0 1 5 3.4 3.3 3.3 0 0 1-1 6.4H7.5A3 3 0 0 1 6 14z" fill="#e9e2d2" stroke="#c9bfa4" stroke-width="1.1"/>' +
    '</svg>';
  const HOUT_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<circle cx="8" cy="14.5" r="4.3" fill="#8a5a2c" stroke="#c89a5a" stroke-width="1.2"/>' +
    '<circle cx="16" cy="14.5" r="4.3" fill="#7d4f27" stroke="#c89a5a" stroke-width="1.2"/>' +
    '<circle cx="8" cy="14.5" r="1.6" fill="none" stroke="#c89a5a" stroke-width="0.9"/>' +
    '<circle cx="16" cy="14.5" r="1.6" fill="none" stroke="#c89a5a" stroke-width="0.9"/>' +
    '</svg>';
  // Wat de marskramer brengt en de smidse ervan maakt (js/handel.js; spel.md, "Handel"): een staaf
  // ijzer, een zakje zout, en een hamer.
  const IJZER_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M4 15.5l4-5h12l-4 5z" fill="#8f949a" stroke="#c3c7cc" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M4 15.5h12v2.6H4z" fill="#6c7176" stroke="#c3c7cc" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M16 15.5l4-5v2.6l-4 5z" fill="#5a5f64" stroke="#c3c7cc" stroke-width="1.1" stroke-linejoin="round"/>' +
    '</svg>';
  const ZOUT_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M8.5 7.5c-1.8 2.2-3 5.2-3 8 0 2.6 2.9 4 6.5 4s6.5-1.4 6.5-4c0-2.8-1.2-5.8-3-8z" fill="#cdb48a" stroke="#e6d3ad" stroke-width="1.1"/>' +
    '<path d="M8.2 7.5c1.2-.9 2.4-1.3 3.8-1.3s2.6.4 3.8 1.3M9.5 5.2l2.5 1 2.5-1" fill="none" stroke="#8a6a3c" stroke-width="1.3" stroke-linecap="round"/>' +
    '<circle cx="10" cy="14" r="1" fill="#f4efe6"/><circle cx="13.5" cy="12.5" r="1" fill="#f4efe6"/><circle cx="12.5" cy="16" r="1" fill="#f4efe6"/>' +
    '</svg>';
  const GEREEDSCHAP_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M11 10.5l8.5 8.5" stroke="#8a5a2c" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M4.5 8.5l5-5 2.2 2.2-1.5 1.5 2.6 2.6-2.2 2.2-2.6-2.6-1.3 1.3z" fill="#8f949a" stroke="#c3c7cc" stroke-width="1.1" stroke-linejoin="round"/>' +
    '</svg>';
  // Van de melk die het dorp niet dezelfde dag drinkt (js/behoeften.js, T.eetVandaag): een punt
  // kaas, met de korst aan de dikke kant en twee gaatjes in het snijvlak.
  const KAAS_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M3 12l12 3 6-6z" fill="#f0cc72" stroke="#f5dc93" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M3 12l12 3v5L3 17z" fill="#e2b64a" stroke="#f0cc72" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M15 15l6-6v5l-6 6z" fill="#c9972f" stroke="#e2b64a" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<circle cx="7.4" cy="15.3" r="1" fill="#c9972f"/><circle cx="11.4" cy="17.3" r="1.15" fill="#c9972f"/>' +
    '</svg>';
  // Het vee in de winter (js/vee.js; spel.md, "Marcel koos voor stap 2"): een hooiopper zoals hij
  // op de weide te drogen staat, een mesthoop uit de schaapskooi, een stuk vlees aan het bot, en een
  // gespannen huid.
  const HOOI_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M3.5 19.5c0-6.5 3.8-11.5 8.5-11.5s8.5 5 8.5 11.5z" fill="#c8b457" stroke="#e0cf7a" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M8 19c.4-3.5 1.6-6.5 3-8.3M12.5 19c0-3.4.4-6.3 1.2-8.2M16.5 19c-.2-2.8-1-5.2-2-7" fill="none" stroke="#9c8a3a" stroke-width="1" stroke-linecap="round"/>' +
    '<path d="M12 8V3.5" stroke="#8a5a2c" stroke-width="1.5" stroke-linecap="round"/>' +
    '</svg>';
  const MEST_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M2.5 19.5c1.6-4.3 5.2-7 9.5-7s7.9 2.7 9.5 7z" fill="#6b4a2a" stroke="#8a6a44" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M7 17l2-1.2M13 16.6l2.2.6M10.5 18.6l1.8-.5" stroke="#c8b457" stroke-width="1" stroke-linecap="round"/>' +
    '<path d="M9 10.5c-1-1.2 1-2 0-3.2M13 10c-1-1.2 1-2 0-3.2" fill="none" stroke="#9a8f80" stroke-width="1" stroke-linecap="round"/>' +
    '</svg>';
  const VLEES_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M8.6 13.2c-2.8-3-2-7.3 1.4-8.7 3.5-1.5 8.2.6 9.3 4.1 1 3.3-1.6 6.4-5.1 6.8-2.2.2-4.1-.6-5.6-2.2z" fill="#b8483a" stroke="#d9776a" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M13 9.5c1.5-.6 3-.2 3.8.8" fill="none" stroke="#efe6d6" stroke-width="1" stroke-linecap="round"/>' +
    '<path d="M8.8 14.2l-4 4" stroke="#efe6d6" stroke-width="2.3" stroke-linecap="round"/>' +
    '<circle cx="4.2" cy="17.6" r="1.4" fill="#efe6d6"/><circle cx="5.9" cy="19.6" r="1.4" fill="#efe6d6"/>' +
    '</svg>';
  const HUIDEN_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M5 4.5c2.3 1.2 4.5 1.2 7 0s4.7-1.2 7 0c-1.2 3.2-1.2 6.3 0 9.3s1.2 4 0 5.7c-2.3-1.2-4.5-1.2-7 0s-4.7 1.2-7 0c1.2-2.2 1.2-4.4 0-7.2s-1.2-5.4 0-7.8z" fill="#a0784a" stroke="#c89a5a" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<circle cx="10" cy="10" r="1.3" fill="#7d5a34"/><circle cx="14.5" cy="13.5" r="1.1" fill="#7d5a34"/><circle cx="11" cy="15.5" r="0.9" fill="#7d5a34"/>' +
    '</svg>';
  // De herberg (js/herberg.js): een aarden kan, met schuim, zoals de herbergierster hem tapt.
  const BIER_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M5.5 8.5h10v11c0 .8-.7 1.5-1.5 1.5H7c-.8 0-1.5-.7-1.5-1.5z" fill="#c9972f" stroke="#e2b64a" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M15.5 11h2.2c1 0 1.8.8 1.8 1.8v2.4c0 1-.8 1.8-1.8 1.8h-2.2" fill="none" stroke="#e2b64a" stroke-width="1.5"/>' +
    '<path d="M5 8.8c-.9-1.8.4-3.8 2.3-3.5.6-1.4 2.5-1.8 3.6-.8 1-1 2.9-.7 3.4.7 1.8-.2 2.8 1.9 1.7 3.6z" fill="#f5eedc" stroke="#e6dcc3" stroke-width="1" stroke-linejoin="round"/>' +
    '<path d="M8.5 12v6M12.5 12v6" stroke="#9c7424" stroke-width="1.1" stroke-linecap="round"/>' +
    '</svg>';
  const GRONDSTOF_ICOON = {
    goud: GOUD_ICOON, graan: GRAAN_ICOON, wol: WOL_ICOON, hout: HOUT_ICOON,
    ijzer: IJZER_ICOON, zout: ZOUT_ICOON, gereedschap: GEREEDSCHAP_ICOON, kaas: KAAS_ICOON,
    hooi: HOOI_ICOON, mest: MEST_ICOON, vlees: VLEES_ICOON, huiden: HUIDEN_ICOON, bier: BIER_ICOON,
  };
  const GRONDSTOF_UITLEG = {
    goud: 'Goud. Wat de heer het liefst ziet.',
    graan: 'Graan. Van de akkers: eten, zaaigoed, en pacht op Sint-Maarten.',
    wol: 'Wol. Van de schapen op de meent.',
    hout: 'Hout. Uit het bos van de heer.',
    ijzer: 'IJzer. Van de marskramer; de smidse maakt er gereedschap van.',
    zout: 'Zout. Van de marskramer: het houdt vis en vlees goed.',
    gereedschap: 'Gereedschap. Van de smidse: wie het heeft, werkt harder. Het slijt.',
    kaas: 'Kaas. Van de melk die het dorp niet dezelfde dag drinkt: kaas houdt goed, en wordt pas gegeten als het graan op is.',
    hooi: 'Hooi. In hooimaand van de weides gemaaid: het vee eet het van slachtmaand tot en met lentemaand.',
    mest: 'Mest. Uit de schaapskooi: leg hem in het veldenvenster (V) op een akker, dan wordt die vruchtbaarder.',
    vlees: 'Vlees. Van het slachten: het vult een maag. Wat je niet zout, bederft, dus dat eet het dorp eerst op; gezouten vlees bewaart het tot het graan op is.',
    huiden: 'Huiden. Van het slachten.',
    bier: 'Bier. De herbergierster brouwt het van graan, en wie \'s avonds in de herberg zit, drinkt het. Wie er deze week was, is tevredener.',
  };
  // Deze staan pas in de balk als het dorp ze eens gehad heeft (S.gehad, js/voorraad.js): in het
  // begin blijft de balk kort. Kaas, hooi, vlees en bier staan naast het graan, want het is allemaal
  // eten en drinken, voor mens of dier; de rest achteraan.
  const BALK_LATER = ['kaas', 'hooi', 'vlees', 'bier', 'ijzer', 'zout', 'gereedschap', 'mest', 'huiden'];
  const NAAST_GRAAN = ['kaas', 'hooi', 'vlees', 'bier'];
  const BALK = T.GRONDSTOFFEN.flatMap((wat) => (wat === 'graan' ? ['graan', ...NAAST_GRAAN] : [wat]))
    .concat(BALK_LATER.filter((wat) => !NAAST_GRAAN.includes(wat)));
  // Het aantal mensen, en hoeveel woonruimte er is (js/gebouwen.js): dezelfde stijl als een
  // grondstof, maar met "/" in plaats van een los getal, dus geen eigen icoon uit GRONDSTOF_ICOON.
  const BEVOLKING_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<circle cx="9" cy="7" r="3" fill="#c9972f"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="none" stroke="#c9972f" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="17" cy="8.5" r="2.4" fill="#e2b64a"/><path d="M13.3 19c.3-2.7 2.2-4.8 4.7-4.8 2.6 0 4.7 2.3 5 5" fill="none" stroke="#e2b64a" stroke-width="1.4" stroke-linecap="round"/>' +
    '</svg>';
  // De argwaan van de inner (js/inner.js): een oog, in dezelfde stijl.
  const ARGWAAN_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M2.5 12c2.4-4 5.7-6 9.5-6s7.1 2 9.5 6c-2.4 4-5.7 6-9.5 6s-7.1-2-9.5-6z" fill="none" stroke="#e2b64a" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<circle cx="12" cy="12" r="3.2" fill="#c9972f"/><circle cx="12" cy="12" r="1.2" fill="#1b1510"/>' +
    '</svg>';
  // De tevredenheid van het dorp (js/behoeften.js): een gezichtje, in dezelfde stijl als hierboven.
  const TEVREDENHEID_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="8.6" fill="none" stroke="#e2b64a" stroke-width="1.5"/>' +
    '<circle cx="8.7" cy="10.2" r="1.1" fill="#e2b64a"/><circle cx="15.3" cy="10.2" r="1.1" fill="#e2b64a"/>' +
    '<path d="M8 14.6c1.1 1.3 2.5 1.9 4 1.9s2.9-.6 4-1.9" fill="none" stroke="#e2b64a" stroke-width="1.4" stroke-linecap="round"/>' +
    '</svg>';

  // De voorraadbalk wordt één keer gemaakt; daarna verandert alleen het getal per grondstof, en
  // het getal bij de mensen.
  function bouwVoorraadbalk(box) {
    box.innerHTML = BALK.map(
      (wat) =>
        `<div class="grondstof${BALK_LATER.includes(wat) ? ' verborgen' : ''}" data-wat="${wat}" title="${GRONDSTOF_UITLEG[wat]}">` +
        `<span class="icoon">${GRONDSTOF_ICOON[wat]}</span><span class="aantal">0</span><span class="verstopt"></span></div>`,
    ).join('') +
      `<div class="grondstof" data-wat="bevolking" title="Mensen in het dorp, en hoeveel er wonen kunnen (js/gebouwen.js: elk huis geeft woonruimte).">` +
      `<span class="icoon">${BEVOLKING_ICOON}</span><span class="aantal">0/0</span></div>` +
      `<div class="grondstof" data-wat="tevredenheid" title="Tevredenheid.">` +
      `<span class="icoon">${TEVREDENHEID_ICOON}</span><span class="aantal">100%</span></div>` +
      `<div class="grondstof verborgen" data-wat="argwaan" title="De argwaan van de inner.">` +
      `<span class="icoon">${ARGWAAN_ICOON}</span><span class="aantal">0%</span></div>`;
  }

  T.ui = T.ui || {};

  // De datum, en eronder het seizoen met het uur en het deel van de dag ("Lente · half acht,
  // ochtend"; js/dag.js). Ververst elk half uur (T.tikKalender).
  T.ui.toonKalender = function () {
    const S = T.S; // de kalender is die van het spel, ook als een dorp de tijd stilzet (js/tijd.js)
    const d = T.datumVanDag(S.kalender.dag);
    const datumEl = $('kalender-datum');
    datumEl.textContent = d.tekst;
    datumEl.classList.toggle('sint-maarten', d.sintMaarten);
    const uur = T.uurTekst(S.kalender.dag) + ', ' + T.dagdeelVan(S.kalender.dag);
    $('kalender-seizoen').textContent = T.hoofdletter(d.seizoen) + ' · ' + uur + (d.sintMaarten ? ' · Sint-Maarten: de heer int' : '');
    for (const b of document.querySelectorAll('#kalender-knoppen button')) {
      b.classList.toggle('actief', Number(b.dataset.snelheid) === T.snelheidNu(S));
    }
    T.ui.werkBriefKnopBij(S);
    werkSlaapKnopBij(S);
  };

  // Slapen kan 's avonds en 's nachts, bij je eigen huis (js/dag.js, T.magSlapen). De knop staat er
  // alleen dan; wie slaapt, ziet hem niet (hij wordt vanzelf wakker, of door een klik of een toets).
  function werkSlaapKnopBij(S) {
    const knop = $('slaap-knop');
    if (knop) knop.classList.toggle('verborgen', !T.magSlapen(S));
  }
  T.ui.werkSlaapKnopBij = werkSlaapKnopBij;

  T.ui.toonVoorraad = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const box = $('voorraadbalk');
    if (!box.children.length) bouwVoorraadbalk(box);
    for (const wat of BALK) {
      const cel = box.querySelector(`[data-wat="${wat}"]`);
      cel.querySelector('.aantal').textContent = Math.floor(S.dorp.voorraad[wat] || 0);
      if (BALK_LATER.includes(wat)) cel.classList.toggle('verborgen', !(S.dorp.gehad && S.dorp.gehad[wat]));
    }
    // Wat er verstopt ligt (js/verstoppen.js), klein naast het graan en het goud, en bij de muis
    // waar: het dorp eet het niet, en de inner telt het niet.
    if (T.verstoptTotaal) {
      const v = T.verstoptTotaal(S.dorp);
      const plekken = T.verstopPlekken(S.dorp).filter((p) => p.gebouw.verstopt && (p.gebouw.verstopt.graan >= 1 || p.gebouw.verstopt.goud >= 1));
      const waar = plekken.map((p) => `${T.inhoudTekst(p.gebouw.verstopt)} in ${p.naam}`);
      for (const wat of ['graan', 'goud']) {
        const cel = box.querySelector(`[data-wat="${wat}"]`);
        const n = Math.floor(v[wat]);
        cel.querySelector('.verstopt').textContent = n >= 1 ? `+${n}` : '';
        cel.title = GRONDSTOF_UITLEG[wat] + (waar.length ? ` Verstopt: ${waar.join('; ')}. Dat eet het dorp niet, en de inner telt het niet.` : '');
      }
    }
    // Wat zout en gereedschap nu doen, bij de muis: hoeveel vis en vlees het zout goed houdt, en
    // hoeveel handen het gereedschap dekt (js/behoeften.js, js/gebouwen.js).
    if (T.zoutDekking) {
      const d = T.zoutDekking(S.dorp);
      box.querySelector('[data-wat="zout"]').title = d.totaal >= 1
        ? `Zout. Eén zout houdt ${T.BEHOEFTEN_INSTELLINGEN.zoutHoudtGoed} vis of vlees goed; de rest bederft. Nu gezouten: ${Math.floor(d.gezouten)} van de ${Math.floor(d.totaal)}.`
        : GRONDSTOF_UITLEG.zout;
    }
    if (T.gereedschapDekking) {
      const d = T.gereedschapDekking(S.dorp);
      box.querySelector('[data-wat="gereedschap"]').title = d.handen
        ? `Gereedschap. Genoeg voor ${Math.min(d.handen, Math.floor(d.heeft))} van de ${d.handen} handen aan het werk: er wordt ${Math.round((d.factor - 1) * 100)}% harder gewerkt. Het slijt.`
        : GRONDSTOF_UITLEG.gereedschap;
    }
    // Bij de kaas: voor hoeveel dagen eten hij is, en hoeveel melk de koeien nu geven (js/vee.js,
    // T.melkVanDag), want daar komt hij van. Beide in graan gerekend, zoals het dorp ze eet.
    const perMens = T.etenPerMens(S.dorp);
    if (perMens > 0) {
      const perDag = (S.dorp.bevolking || 0) * perMens;
      const kaas = S.dorp.voorraad.kaas || 0;
      const dagen = perDag > 0 ? Math.floor(kaas / perDag) : 0;
      const voor = kaas >= 1 && perDag > 0 ? ` Genoeg voor ${dagen} dag${dagen === 1 ? '' : 'en'} eten.` : '';
      const melkNu = T.melkVanDag && S.kalender ? T.melkVanDag(S.dorp, Math.floor(S.kalender.dag)) : 0;
      const mensen = Math.round(melkNu / perMens);
      const melk = mensen > 0 ? ` De koeien geven nu elke dag melk voor ${mensen} mensen; wat het dorp niet drinkt, wordt kaas.` : '';
      box.querySelector('[data-wat="kaas"]').title = GRONDSTOF_UITLEG.kaas + voor + melk;
    }
    // Bij het hooi: hoe lang het de kudde van nu voedt (js/vee.js, T.hooiPerWinterdag), en hoeveel
    // winter er nog is. Buiten de winter telt ook het hooi dat nog op de weides staat
    // (js/akkers.js, T.verwachtHooi). Haalt het de winter niet, dan staat het getal in het rood.
    if (T.hooiPerWinterdag && S.kalender) {
      const cel = box.querySelector('[data-wat="hooi"]');
      const dag = Math.floor(S.kalender.dag);
      const perDag = T.hooiPerWinterdag(S.dorp, dag);
      const winterNu = T.isVeeWinter(dag);
      const nogTeMaaien = winterNu ? 0 : T.verwachtHooi(S.dorp);
      const hooi = (S.dorp.voorraad.hooi || 0) + nogTeMaaien;
      const winter = T.winterDagen(dag);
      const dagen = perDag > 0 ? Math.floor(hooi / perDag) : Infinity;
      const perDagTekst = Math.round(perDag * 10) / 10;
      let over = '';
      if (perDag > 0) {
        const erbij = nogTeMaaien >= 1 ? `, met wat er nog op de weides staat (zo'n ${Math.round(nogTeMaaien)})` : '';
        over = winterNu
          ? ` De kudde eet ${perDagTekst} per dag: genoeg voor ${dagen} dag${dagen === 1 ? '' : 'en'}, en de winter duurt nog ${winter} dagen.`
          : ` De kudde van nu eet ${perDagTekst} per winterdag${erbij}: genoeg voor ${Math.min(dagen, winter)} van de ${winter} dagen winter.`;
      }
      cel.title = GRONDSTOF_UITLEG.hooi + over;
      cel.classList.toggle('laag', dagen < winter);
    }
    // Bij het hout: voor hoeveel van de winterdagen het genoeg is, met wat er nu per dag bijkomt
    // (js/behoeften.js, T.houtVoorDeWinter). Haalt het de winter niet, dan staat het getal in het rood
    // (Marcel, 27 sep, vraag 44).
    if (S.kalender && S.dorp.bevolking > 0) {
      const cel = box.querySelector('[data-wat="hout"]');
      const v = T.houtVoorDeWinter(S.dorp, Math.floor(S.kalender.dag));
      const perDag = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
      const erbij = v.erbij > 0.005 ? `, en er komt ${perDag(v.erbij)} per dag bij` : '';
      const genoeg = v.tot > 0
        ? (v.haalt ? 'genoeg voor de hele winter' : `genoeg voor ${v.dagen} van de ${v.winter} dagen winter`)
        : (v.haalt ? 'genoeg voor de rest van de winter' : `genoeg voor ${v.dagen} dag${v.dagen === 1 ? '' : 'en'}, en de winter duurt nog ${v.winter} dagen`);
      const stookt = v.tot > 0 ? 'In de winter stookt het dorp' : 'Het dorp stookt';
      cel.title = `${GRONDSTOF_UITLEG.hout} ${stookt} er ${perDag(v.stook)} per dag van${erbij}: ${genoeg}.`;
      cel.classList.toggle('laag', !v.haalt);
    }
  };

  // Het aantal mensen en de woonruimte (js/gebouwen.js, T.werkGebouwenBij): een eigen functie,
  // want die twee veranderen niet via T.wijzigVoorraad en dus niet vanzelf mee met toonVoorraad.
  T.ui.toonBevolking = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const box = $('voorraadbalk');
    if (!box.children.length) bouwVoorraadbalk(box);
    const el = box.querySelector('[data-wat="bevolking"] .aantal');
    if (el) el.textContent = `${Math.floor(S.dorp.bevolking)}/${Math.floor(S.dorp.woonruimte)}`;
  };

  // De tevredenheid (js/behoeften.js, T.tikBehoeftenDag) en, op hover, wat het dorp mist — dezelfde
  // vraag als T.ui.toonBevolking hierboven, met een eigen functie om dezelfde reden: tevredenheid
  // verandert niet via T.wijzigVoorraad.
  T.ui.toonTevredenheid = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const box = $('voorraadbalk');
    if (!box.children.length) bouwVoorraadbalk(box);
    const cel = box.querySelector('[data-wat="tevredenheid"]');
    if (!cel || !S.dorp.behoeften) return;
    const pct = Math.round(S.dorp.behoeften.tevredenheid * 100);
    cel.querySelector('.aantal').textContent = `${pct}%`;
    cel.classList.toggle('laag', S.dorp.behoeften.tevredenheid < T.BEHOEFTEN_INSTELLINGEN.vertrekDrempel);
    const last = S.dorp.behoeften.last && S.dorp.behoeften.last.length ? ` Het heeft last van ${S.dorp.behoeften.last.join(' en ')}.` : '';
    const blij = S.dorp.behoeften.blij && S.dorp.behoeften.blij.length ? ` Het is blij met ${S.dorp.behoeften.blij.join(' en ')}.` : '';
    cel.title = S.dorp.behoeften.mist.length
      ? `Tevredenheid: ${pct}%. Het dorp mist: ${S.dorp.behoeften.mist.join(', ')}.${last}${blij}`
      : `Tevredenheid: ${pct}%. Het dorp heeft wat het nodig heeft.${last}${blij}`;
  };

  // De argwaan van de inner (js/inner.js), en op hover waarom en wat ze doet. Pas in de balk als hij
  // er eens geweest is, of als er argwaan is: in het begin blijft de balk kort.
  T.ui.toonArgwaan = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const box = $('voorraadbalk');
    if (!box.children.length) bouwVoorraadbalk(box);
    const cel = box.querySelector('[data-wat="argwaan"]');
    const I = S.dorp.inner;
    const IN = T.INNER_INSTELLINGEN;
    if (!cel || !IN) return;
    const zichtbaar = !!(I && (I.argwaan > 0 || I.rapport || I.bezoek));
    cel.classList.toggle('verborgen', !zichtbaar);
    if (!zichtbaar) return;
    const pct = (x) => `${Math.round(x * 100)}%`;
    cel.querySelector('.aantal').textContent = pct(I.argwaan);
    cel.classList.toggle('hoog', I.argwaan >= IN.doorzoekenVanaf);
    const waarom = I.waarom.length ? ` Waarom: ${I.waarom.join('; ')}.` : '';
    const nu = I.argwaan > 0 && IN.toeslag > 0 ? ` Nu vraagt de heer ${pct(I.argwaan * IN.toeslag)} meer.` : '';
    // Wat je hem dit jaar gaf (js/inner.js, T.koopInnerOm), en wat hij daarom minder opschrijft.
    const geschenk = I.geschenken > 0 ? ` Je gaf hem dit jaar ${I.geschenken} goud: hij schrijft ${pct(T.innerKorting(S.dorp))} minder op.` : '';
    cel.title =
      `Argwaan van de inner: ${pct(I.argwaan)}.${waarom}${nu}${geschenk} ` +
      `Vanaf ${pct(IN.terugkomenVanaf)} komt hij onverwacht terug, vanaf ${pct(IN.doorzoekenVanaf)} doorzoeken de soldaten op Sint-Maarten het dorp, ` +
      `en vanaf ${pct(IN.rapportTeltNietVanaf)} gelooft de heer zijn rapport niet meer en vraagt hij naar alles. Na Sint-Maarten zakt ze.`;
  };

  // Het bouwmenu: de soorten van de huidige trede, met hun kosten en wat ze doen (ontwerp/spel.md,
  // "Gebouwen"). Welke erin staan, zegt T.inBouwmenu (js/gebouwen.js): bouwt het dorp zelf, dan het erf
  // en geen woningen. Een klik op een rij geeft T.S.bouwSoort dat gebouw mee — daarna richt de muis
  // een spookbeeld (js/main.js, js/tekenen.js) tot een klik op de kaart hem neerzet.
  function bouwmenuInhoud(S) {
    const rijen = Object.keys(T.GEBOUWEN)
      .filter((id) => T.inBouwmenu(S.dorp, id))
      .map((id) => {
        const g = T.GEBOUWEN[id];
        if (g.erf) return erfRij(S, id, g);
        const kosten = Object.entries(g.kosten).map(([wat, n]) => `${n} ${wat}`).join(', ');
        // Wat de heer er elk jaar voor wil (js/heer.js): zo weet je bij elk gebouw wat het je op
        // Sint-Maarten kost, want wat je bouwt, is wat hij ziet.
        const heer = g.heer ? Object.entries(g.heer).map(([wat, n]) => `${n} ${wat}`).join(', ') : '';
        const heerTekst = heer ? `Op Sint-Maarten wil de heer er ${heer} voor.` : 'De heer vraagt er niets voor.';
        return (
          `<button data-soort="${id}">` +
          `<span class="bouw-naam">${T.hoofdletter(g.naam)}</span>` +
          `<span class="bouw-kosten">${kosten} · ${g.bouwtijd} dag${g.bouwtijd === 1 ? '' : 'en'}</span>` +
          `<span class="bouw-uitleg">${g.beschrijving}</span>` +
          (g.heer ? `<span class="bouw-heer">${heerTekst}</span>` : '') +
          `</button>`
        );
      })
      .join('');
    return `<div class="kop">Bouwen — het ${S.dorp.trede}</div>${rijen || '<p class="bouw-leeg">Hier valt nu niets te bouwen.</p>'}`;
  }

  // De rij van het erf (js/erven.js): wat het kost is niets, maar er staat bij hoeveel er vrij zijn, en
  // wat een gezin erop nodig heeft.
  function erfRij(S, id, g) {
    const maat = T.erfMaat();
    const vrij = T.vrijeErven(S.dorp).length;
    const hout = T.GEBOUWEN.hut.kosten.hout;
    return (
      `<button data-soort="${id}">` +
      `<span class="bouw-naam">${T.hoofdletter(g.naam)}</span>` +
      `<span class="bouw-kosten">${maat.b} bij ${maat.h} tegels · ${vrij ? `${vrij} vrij` : 'geen vrij'}</span>` +
      `<span class="bouw-uitleg">${g.beschrijving}: ${hout} hout per hut. Klik op een vrij erf om het weer weg te halen.</span>` +
      `</button>`
    );
  }

  T.ui.toonBouwmenu = function (S) {
    const box = $('bouwmenu');
    box.classList.toggle('verborgen', !S.bouwMenuOpen);
    if (S.bouwMenuOpen) box.innerHTML = bouwmenuInhoud(S);
    $('bouwmenu-knop').classList.toggle('actief', S.bouwMenuOpen || !!S.bouwSoort);
  };

  $('bouwmenu').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || !T.S) return;
    T.S.bouwSoort = b.dataset.soort;
    T.S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(T.S);
  });

  $('bouwmenu-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    const S = T.S;
    if (!S) return;
    // Bouwen en de velden (of de wetten, js/wettenmenu.js) tegelijk kan niet: bouwen richt de muis op de
    // kaart, en die ligt stil zolang zo'n venster open is.
    if (T.ui.veldenOpen && T.ui.veldenOpen()) T.ui.sluitVelden(S);
    if (T.ui.wettenOpen && T.ui.wettenOpen()) T.ui.sluitWetten(S);
    if (T.ui.raadsmanOpen && T.ui.raadsmanOpen()) T.ui.sluitRaadsman(S);
    if (S.bouwSoort || S.bouwMenuOpen) {
      S.bouwSoort = null;
      S.bouwMenuOpen = false;
    } else {
      S.bouwMenuOpen = true;
    }
    T.ui.toonBouwmenu(S);
  });

  // ── Handelen met de marskramer (js/handel.js; spel.md, "Handel") ──
  // Je opent het venster vanuit zijn gesprek (doe: { handel: true }). Zolang het open is, staat de
  // kalender stil en ligt de rest van de invoer stil (S.modus 'handel', js/main.js): je staat bij
  // zijn uitgestalde waar. Elke knop stelt dezelfde vraag als de klik (T.kanKopen,
  // T.kanVerkopen), dus een knop die niet kan, zegt bij de muis waarom.
  const PRIJS_TAAL = {
    koopt: { duur: 'hij betaalt nu goed', goedkoop: 'hij betaalt nu weinig' },
    verkoopt: { duur: 'nu duur', goedkoop: 'nu goedkoop' },
  };

  // Of dit de duurste of goedkoopste keer van het jaar is, als regeltje onder de prijs.
  function prijsMerk(S, wat, kant) {
    const hoe = T.prijsVanHetJaar(S.dorp, wat, kant);
    return hoe ? `<span class="handel-merk ${hoe}">${PRIJS_TAAL[kant][hoe]}</span>` : '';
  }

  function handelKnop(actie, wat, n, tekst, k) {
    const titel = k.kan ? '' : ` title="${k.reden.replace(/"/g, '&quot;')}"`;
    return `<button data-actie="${actie}" data-wat="${wat}" data-n="${n}"${k.kan ? '' : ' disabled'}${titel}>${tekst}</button>`;
  }

  function handelInhoud(S) {
    const m = S.dorp.marskramer;
    const H = T.HANDEL_INSTELLINGEN;
    const v = S.dorp.voorraad;
    const heb = (wat) => Math.floor(v[wat] || 0);
    const verkoopt = Object.keys(H.verkoopt).map((wat) => {
      const k = T.kanKopen(S.dorp, wat, 1);
      return (
        `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter(wat)} <small>je hebt ${heb(wat)}</small></span>` +
        `<span class="handel-prijs">${k.prijs} goud per stuk<small>${prijsMerk(S, wat, 'verkoopt')}hij heeft er nog ${m.heeft[wat] || 0}</small></span>` +
        `<span class="handel-knoppen">${handelKnop('koop', wat, 1, 'Koop 1', k)}${handelKnop('koop', wat, 5, 'Koop 5', T.kanKopen(S.dorp, wat, 5))}</span></div>`
      );
    });
    // Wat hij koopt, voor zover je er iets van hebt. Bij het graan staat hoeveel dagen het dorp
    // ervan kan eten, zodat je niet per ongeluk je wintereten verkoopt.
    const etenPerDag = (S.dorp.bevolking || 0) * T.etenPerMens(S.dorp);
    const koopt = Object.keys(H.koopt).filter((wat) => heb(wat) > 0).map((wat) => {
      const k = T.kanVerkopen(S.dorp, wat, 1);
      const eten = wat === 'graan' && etenPerDag > 0 ? ` · eten voor ${Math.floor((v.graan || 0) / etenPerDag)} dagen` : '';
      return (
        `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter(wat)} <small>je hebt ${heb(wat)}${eten}</small></span>` +
        `<span class="handel-prijs">${k.per} voor ${k.prijs} goud<small>${prijsMerk(S, wat, 'koopt')}</small></span>` +
        `<span class="handel-knoppen">${handelKnop('verkoop', wat, 1, `Verkoop ${k.per}`, k)}${handelKnop('verkoop', wat, 5, `Verkoop ${k.per * 5}`, T.kanVerkopen(S.dorp, wat, 5))}</span></div>`
      );
    });
    const maand = H.bezoeken[m.bezoek].maand;
    return (
      `<div class="handel-kop"><span class="handel-titel">De marskramer</span><span class="handel-wanneer">${maand}</span>` +
      `<button class="handel-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<p class="handel-staat">Hij heeft <b>${m.beurs} goud</b> bij zich en plaats voor <b>${m.plaats} pak${m.plaats === 1 ? '' : 'ken'}</b>. ` +
      `Jij hebt <b>${heb('goud')} goud</b>.</p>` +
      `<div class="kop">Hij verkoopt</div>${verkoopt.join('')}` +
      `<div class="kop">Hij koopt</div>${koopt.join('') || '<p class="handel-leeg">Je hebt niets wat hij wil.</p>'}` +
      `<p class="handel-voet">Zolang je handelt, staat de tijd stil. <kbd>Esc</kbd> sluit.</p>`
    );
  }

  function toonHandel(S) {
    const box = $('handel');
    box.innerHTML = handelInhoud(S);
    box.classList.remove('verborgen');
  }

  T.ui.openHandel = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    if (!T.kanHandelen || !T.kanHandelen(S.dorp)) return;
    S.modus = 'handel';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    // Zolang je handelt, staat de tijd stil (js/tijd.js); bij het sluiten loopt hij weer zoals je koos.
    T.houdTijdStil(S, 'handel');
    toonHandel(S);
  };

  T.ui.sluitHandel = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    $('handel').classList.add('verborgen');
    if (S.modus === 'handel') S.modus = 'verkennen';
    T.laatTijdGaan(S, 'handel');
  };

  $('handel').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitHandel(S.dorp);
      return;
    }
    const n = Number(b.dataset.n);
    const r = b.dataset.actie === 'koop' ? T.koop(S.dorp, b.dataset.wat, n) : T.verkoop(S.dorp, b.dataset.wat, n);
    if (!r.kan && T.ui.bericht) T.ui.bericht(r.reden);
    if (T.kanHandelen(S.dorp)) toonHandel(S);
    else T.ui.sluitHandel(S.dorp);
  });

  // ── De heer (js/heer.js; spel.md, "Sint-Maarten") ──
  // Het betalen op Sint-Maarten, in de stijl van het venster van de marskramer (vanuit zijn gesprek,
  // doe: { heer: true }), met daarin de schandpaal als die erbij hoort. Zijn brieven staan in
  // js/brieven.js. Het einde (je ambt kwijt) gebruikt het scherm over alles heen uit js/ui.js
  // (T.ui.toonOverlay).
  const hebNu = (S, wat) => Math.floor((S.dorp.voorraad && S.dorp.voorraad[wat]) || 0);
  // Een naam kan de speler zelf geven (js/opties.js), dus die gaat nooit rauw in de html.
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || 'niets');
  const eisInTaal = (eis) => opsomming(eis.volgorde.map((wat) => `${eis.per[wat]} ${wat}`));

  // Wat de schout de heer geeft, per goed, zoals het in het venster staat. Het begint op alles wat
  // hij vraagt, voor zover je het hebt; wie minder wil geven, schuift naar beneden.
  let geef = null;

  function heerRijen(S, eis) {
    return eis.volgorde.map((wat) => {
      // Goud mag meer zijn dan hij vraagt: dat neemt hij in de plaats van wat er verder ontbreekt.
      const max = wat === 'goud' ? hebNu(S, 'goud') : Math.min(eis.per[wat], hebNu(S, wat));
      const waarom = eis.regels.filter((r) => r.wat === wat).map((r) => `${r.aantal} voor ${r.waarom}`).join(' · ');
      const nu = Math.min(geef[wat] || 0, max);
      return (
        `<div class="heer-rij">` +
        `<span class="heer-naam">${T.hoofdletter(wat)} <small>hij vraagt ${eis.per[wat]} · je hebt ${hebNu(S, wat)}</small>` +
        `<small class="heer-waarom">${waarom}</small></span>` +
        `<input type="range" min="0" max="${max}" step="1" value="${nu}" data-wat="${wat}"${max ? '' : ' disabled'}>` +
        `<span class="heer-geef" data-geef="${wat}">${nu}</span>` +
        `</div>`
      );
    }).join('');
  }

  // Het deel dat met de schuiven meeverandert: hoeveel je geeft, wat dat kost, en of je graan het
  // haalt tot de oogst. Dezelfde vraag als de knop (T.gevolgVanBetaling).
  function heerSamenvatting(S, eis) {
    const g = T.gevolgVanBetaling(S.dorp, geef, eis);
    const v = T.heerVooruitzicht(S.dorp, g);
    const pct = Math.floor(g.deel * 100 + 1e-9);
    const soort = g.ambtKwijt || g.schandpaal ? 'zwaar' : g.boete ? 'boete' : 'goed';
    const goudExtra = g.neemt.goud > (eis.per.goud || 0) ? ` Van je goud neemt hij ${g.neemt.goud}, ook in de plaats van wat er verder ontbreekt.` : '';
    const soldaten = v.soldaten ? `, zijn soldaten ${Math.round(v.soldaten)}` : '';
    // Het vee (js/vee.js; T.heerVooruitzicht): de melk drinkt het dorp vóór het graan, dus die staat
    // al van het eten af; en wie graan tekortkomt, eet daarna de kaas. Honger is dus pas een tekort
    // dat groter is dan de kaas.
    // Sinds 25 sep vult ook vlees een maag (js/behoeften.js): kaas en vlees samen zijn de achtervang.
    const melk = Math.round(v.melk || 0);
    const kaas = Math.floor(v.kaas || 0);
    const vlees = Math.floor(v.vlees || 0);
    const achter = kaas + vlees;
    const achterNaam = kaas && vlees ? 'de kaas en het vlees' : kaas ? 'de kaas' : 'het vlees';
    const vangt = kaas && vlees ? 'vangen' : 'vangt';
    const melkTekst = melk > 0 ? `, naast zo'n ${melk} aan melk van de koeien` : '';
    const rest = Math.round(v.over);
    const achterOver = Math.round(v.over + achter);
    const uitkomst = rest >= 0
      ? `er blijft ${rest} over${achter ? `, en ${achterNaam} houd je achter de hand` : ''}`
      : achter && achterOver >= 0
        ? `je komt ${-rest} graan tekort, maar ${achterNaam} ${vangt} dat op: daarna is er nog ${achterOver} over`
        : achter
          ? `je komt ${-rest} graan tekort, en ook met ${achterNaam} erbij nog ${-achterOver}: dat is honger vóór de oogst`
          : `je komt ${-rest} graan tekort, en dat is honger vóór de oogst`;
    const heb = [`${Math.round(v.na)} graan`].concat(kaas ? [`${kaas} kaas`] : [], vlees ? [`${vlees} vlees`] : []);
    return (
      `<p class="heer-deel ${soort}">Je geeft hem ${pct}% van wat hij vraagt. ${g.tekst}${goudExtra}</p>` +
      `<p class="heer-vooruit">Daarna heb je ${heb.length > 1 ? `${heb.slice(0, -1).join(', ')} en ${heb[heb.length - 1]}` : heb[0]}. ` +
      `Tot de oogst eet het dorp er zo'n ${Math.round(v.eten)}${melkTekst}${soldaten}, ` +
      `en zaaien in lentemaand kost ${Math.round(v.zaaien)}: ${uitkomst}.</p>` +
      `<div class="heer-knoppen"><button data-actie="alles">Alles wat hij vraagt</button>` +
      `<button class="heer-geef-knop" data-actie="betaal"${g.kan ? '' : ` disabled title="${g.reden}"`}>Geef het hem</button></div>`
    );
  }

  function schandpaalInhoud(S) {
    const rijen = T.schandpaalKeuzes(S.dorp).map((k) => {
      const prijs = k.wie === 'schout'
        ? `Het dorp neemt het je niet kwalijk. De heer lacht, en zet er ${k.boete} goud bij.`
        : `Het dorp is ${Math.round(k.kost * 100)}% minder tevreden, en vergeet het pas na maanden.`;
      return (
        `<button class="paal-keuze" data-wie="${k.wie}"><span class="paal-naam">${veilig(k.naam)}</span>` +
        `<span class="paal-wie">${veilig(k.eigenschap)}</span><span class="paal-prijs">${prijs}</span></button>`
      );
    }).join('');
    return (
      `<div class="venster-kop"><span class="venster-titel">De schandpaal</span><span class="venster-wanneer">Sint-Maarten</span></div>` +
      `<p class="venster-staat">"Iemand moet dit voelen, schout. U mag kiezen wie." Wie staat er drie dagen aan de paal op het plein?</p>` +
      rijen
    );
  }

  // Ligt er nog iets verstopt (js/verstoppen.js), dan zegt het venster dat: zolang de heer in het
  // dorp is, kun je er niet bij, dus wie zijn goud te laat terughaalt, komt tekort.
  function verstoptBijDeHeer(S) {
    const v = T.verstoptTotaal(S.dorp);
    const wat = v ? T.inhoudTekst(v) : '';
    return wat ? `<p class="venster-staat">Er ligt nog ${wat} verstopt. Zolang de heer in het dorp is, kun je er niet bij.</p>` : '';
  }

  function toonHeer(S) {
    const box = $('heer');
    const b = S.dorp.heer && S.dorp.heer.bezoek;
    if (b && b.schandpaal) {
      box.innerHTML = schandpaalInhoud(S);
    } else {
      const eis = T.eisVanDeHeer(S.dorp);
      if (!geef) {
        geef = {};
        for (const wat of eis.volgorde) geef[wat] = Math.min(eis.per[wat], hebNu(S, wat));
      }
      box.innerHTML =
        `<div class="venster-kop"><span class="venster-titel">Sint-Maarten</span><span class="venster-wanneer">de heer telt</span>` +
        `<button class="venster-sluit" data-actie="sluit" title="Nog niet (Esc)">✕</button></div>` +
        `<p class="venster-staat">Hij vraagt ${eisInTaal(eis)}. Wat je hem geeft, schuif je hieronder. Goud neemt hij altijd, ook in de plaats van iets anders.</p>` +
        verstoptBijDeHeer(S) +
        heerRijen(S, eis) +
        `<div class="heer-samen">${heerSamenvatting(S, eis)}</div>` +
        `<p class="venster-voet">Zolang je bij hem staat, staat de tijd stil. <kbd>Esc</kbd>: nog niet (hij wacht).</p>`;
    }
    box.classList.remove('verborgen');
  }

  T.ui.openHeer = function (S) {
    const b = S.dorp.heer && S.dorp.heer.bezoek;
    if (!T.heerWacht(S.dorp) && !(b && b.schandpaal)) return;
    S.modus = 'heer';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    if (T.ui.briefOpen()) T.ui.sluitBrief(S);
    geef = null;
    T.houdTijdStil(S, 'heer');
    toonHeer(S);
  };

  // Dicht. Bij de schandpaal kan dat niet: daar moet je kiezen. De tijd loopt weer op de snelheid
  // die de speler koos (js/tijd.js, T.laatTijdGaan).
  T.ui.sluitHeer = function (S) {
    const b = S.dorp.heer && S.dorp.heer.bezoek;
    if (b && b.schandpaal) return;
    $('heer').classList.add('verborgen');
    if (S.modus === 'heer') S.modus = 'verkennen';
    geef = null;
    T.laatTijdGaan(S, 'heer');
    T.ui.werkBriefKnopBij(S);
  };

  $('heer').addEventListener('input', (ev) => {
    const r = ev.target.closest('input[type="range"]');
    const S = T.S;
    if (!r || !S || !geef) return;
    geef[r.dataset.wat] = Number(r.value);
    $('heer').querySelector(`[data-geef="${r.dataset.wat}"]`).textContent = r.value;
    $('heer').querySelector('.heer-samen').innerHTML = heerSamenvatting(S, T.eisVanDeHeer(S.dorp));
  });

  $('heer').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitHeer(S);
    } else if (b.dataset.actie === 'alles') {
      geef = null;
      toonHeer(S);
    } else if (b.dataset.actie === 'betaal') {
      const g = T.betaalHeer(S.dorp, geef);
      if (!g.kan) {
        T.ui.bericht(g.reden);
        return;
      }
      if (S.dorp.einde) return; // het einde staat al in beeld (T.ui.toonEinde)
      if (S.dorp.heer.bezoek && S.dorp.heer.bezoek.schandpaal) toonHeer(S);
      else T.ui.sluitHeer(S);
    } else if (b.dataset.wie) {
      T.zetAanDeSchandpaal(S.dorp, b.dataset.wie);
      T.ui.sluitHeer(S);
    }
  });

  // Je ambt kwijt: het spel is uit. Het scherm over alles heen, met wat er elk jaar gebeurde.
  T.ui.toonEinde = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    S.modus = 'einde';
    $('heer').classList.add('verborgen');
    if (T.ui.briefOpen()) $('brief').classList.add('verborgen');
    const jaren = ((S.dorp.heer && S.dorp.heer.jaren) || [])
      .map((j) => `${j.jaar}: ${Math.floor(j.deel * 100 + 1e-9)}%${j.straf ? `, ${j.straf}` : ''}`)
      .join(' · ');
    T.ui.toonOverlay(
      'Je ambt kwijt',
      `<p>Twee keer achter elkaar gaf je de heer veel te weinig. Hij heeft een nieuwe schout benoemd: zijn neef, die ook niet kan tellen.</p>` +
        `<p>Jij bent weer een gewone dorpeling, en je buren weten nog precies wat je deed.</p>` +
        (jaren ? `<p class="einde-jaren">Wat de heer kreeg: ${jaren}</p>` : ''),
      'Naar het titelscherm', // daar begin je opnieuw, of laad je een bewaard spel (js/menu.js)
      () => T.naarTitelscherm(),
    );
  };

  // ── Het slachten (js/vee.js, T.slacht; spel.md, "Marcel koos voor stap 2") ──
  // Op 1 slachtmaand opent dit vanzelf: de winter begint, en het hooi zegt hoeveel vee je houdt. Je
  // kunt het ook zelf openen, onderaan het veldenvenster. Per groep (koeien, kalveren, schapen,
  // lammeren) schuif je hoeveel er naar de slager gaan, het oudste eerst. Het venster rekent mee of
  // het hooi de winter dan haalt, en wat het vlees en de huiden zijn. Het begint op het voorstel
  // (T.slachtVoorstel): zo weinig als kan, zodat het hooi het haalt. Zolang het open is, staat de
  // tijd stil (T.houdTijdStil) en is Esc niemand slachten (S.modus 'slachten', js/main.js).
  let slacht = null; // per groep (T.kuddeGroepen): hoeveel er gaan

  const dagNu = (S) => Math.floor((S.kalender && S.kalender.dag) || 0);
  const gekozen = (groepen) => groepen.flatMap((g, i) => g.dieren.slice(0, (slacht && slacht[i]) || 0));

  function slachtRijen(S, groepen) {
    const dag = dagNu(S);
    return groepen.map((g, i) => {
      const n = g.dieren.length;
      const eet = T.hooiVanDier(g.dieren[0], dag);
      const hooi = eet > 0 ? `eet ${eet === 1 ? 'één hooi' : `${String(eet).replace('.', ',')} hooi`} per winterdag` : 'eet geen hooi';
      return (
        `<div class="heer-rij">` +
        `<span class="heer-naam">${T.hoofdletter(n === 1 ? g.naam : g.meervoud)} <small>je hebt er ${n} · ${hooi}</small></span>` +
        `<input type="range" min="0" max="${n}" step="1" value="${slacht[i] || 0}" data-groep="${i}">` +
        `<span class="heer-geef" data-slacht="${i}">${slacht[i] || 0}</span>` +
        `</div>`
      );
    }).join('');
  }

  // Het deel dat met de schuiven meeverandert: haalt het hooi de winter, en wat geeft het slachten.
  function slachtSamenvatting(S, groepen) {
    const dag = dagNu(S);
    const weg = gekozen(groepen);
    const blijft = T.veeVan(S.dorp).filter((e) => !weg.includes(e));
    const perDag = T.hooiPerWinterdag(S.dorp, dag, blijft);
    const hooi = T.hooiVoorDeWinter(S.dorp, dag);
    const winter = T.winterDagen(dag);
    const dagen = perDag > 0 ? Math.floor(hooi / perDag) : Infinity;
    const haalt = dagen >= winter;
    let winterTekst = '';
    if (T.VEE_INSTELLINGEN.winterzorg) {
      winterTekst = perDag <= 0
        ? 'Wie overblijft, eet geen hooi.'
        : haalt
          ? `Wie overblijft, eet ${Math.round(perDag * 10) / 10} hooi per dag: het hooi haalt de winter, met ${Math.floor(hooi - perDag * winter)} over.`
          : `Wie overblijft, eet ${Math.round(perDag * 10) / 10} hooi per dag: het hooi is na ${dagen} van de ${winter} dagen op, en dan sterft het vee van honger.`;
    }
    const o = T.slachtOpbrengst(weg, dag);
    let opbrengst = weg.length
      ? `Het slachten geeft ${Math.round(o.vlees)} vlees en ${o.huiden} ${o.huiden === 1 ? 'huid' : 'huiden'}.`
      : 'Je slacht niemand.';
    if (o.vlees > 0 && T.zoutDekking) {
      const z = T.zoutDekking(S.dorp);
      const vrij = Math.max(0, Math.floor((S.dorp.voorraad.zout || 0) * T.BEHOEFTEN_INSTELLINGEN.zoutHoudtGoed - z.totaal));
      opbrengst += vrij >= o.vlees
        ? ' Je zout houdt het vlees goed.'
        : vrij > 0
          ? ` Vlees bederft zonder zout, en je zout houdt er nog ${vrij} goed: de rest is binnen een paar weken weg.`
          : ' Vlees bederft zonder zout, en je hebt geen zout over: het is binnen een paar weken weg.';
    }
    return (
      `<p class="heer-deel ${!T.VEE_INSTELLINGEN.winterzorg || haalt ? 'goed' : 'zwaar'}">${winterTekst} ${opbrengst}</p>` +
      `<div class="heer-knoppen"><button data-actie="voorstel" title="Zo weinig als kan, zodat het hooi de winter haalt">Voorstel</button>` +
      `<button class="heer-geef-knop" data-actie="slacht"${weg.length ? '' : ' disabled title="Schuif eerst wie er gaan"'}>Slachten</button></div>`
    );
  }

  function toonSlachten(S) {
    const box = $('slachten');
    const dag = dagNu(S);
    const groepen = T.kuddeGroepen(S.dorp, dag);
    if (!slacht) {
      const voorstel = T.slachtVoorstel(S.dorp, dag).dieren;
      slacht = groepen.map((g) => g.dieren.filter((e) => voorstel.includes(e)).length);
    }
    const hooi = Math.floor(T.hooiVoorDeWinter(S.dorp, dag));
    const winter = T.winterDagen(dag);
    const inleiding = T.VEE_INSTELLINGEN.winterzorg
      ? (T.isVeeWinter(dag)
        ? `Het is winter: nog ${winter === 1 ? 'één dag' : `${winter} dagen`} tot het gras terug is. Zolang eet het vee hooi, en je hebt er ${hooi}.`
        : `De volgende winter duurt ${winter} dagen, en dan eet het vee hooi. Je hebt er ${hooi}, met wat er nog op de weides staat.`) +
        ' Wat het hooi niet de winter door helpt, gaat naar de slager, of het sterft. Uit elke groep gaan de oudste.'
      : 'Wie gaat er naar de slager? Uit elke groep gaan de oudste.';
    box.innerHTML =
      `<div class="venster-kop"><span class="venster-titel">Het slachten</span><span class="venster-wanneer">${T.datumVanDag(dag).tekst}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Niemand slachten (Esc)">✕</button></div>` +
      `<p class="venster-staat">${inleiding}</p>` +
      (groepen.length ? slachtRijen(S, groepen) : '<p class="venster-staat">Er is geen vee.</p>') +
      `<div class="heer-samen">${slachtSamenvatting(S, groepen)}</div>` +
      `<p class="venster-voet">Zolang dit open is, staat de tijd stil. <kbd>Esc</kbd>: niemand slachten.</p>`;
    box.classList.remove('verborgen');
  }

  T.ui.slachtenOpen = () => !$('slachten').classList.contains('verborgen');

  T.ui.openSlachten = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    // Het venster opent zodra je rondloopt, niet midden in een gesprek of een ander venster; tot dan blijft de
    // vraag staan (js/vee.js, T.tikVeeDag vraagt het elke dag).
    if (S.modus && S.modus !== 'verkennen') return;
    if (!T.kuddeGroepen || !T.veeVan(S.dorp).length) {
      if (S.dorp.vee) S.dorp.vee.slachtVraag = false;
      return;
    }
    if (T.ui.veldenOpen()) T.ui.sluitVelden(S);
    if (T.ui.briefOpen()) T.ui.sluitBrief(S);
    S.modus = 'slachten';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    T.ui.verbergTooltip();
    slacht = null;
    T.houdTijdStil(S, 'slachten');
    toonSlachten(S);
  };

  T.ui.sluitSlachten = function (S) {
    $('slachten').classList.add('verborgen');
    if (S.modus === 'slachten') S.modus = 'verkennen';
    if (S.dorp.vee) S.dorp.vee.slachtVraag = false;
    slacht = null;
    T.laatTijdGaan(S, 'slachten');
  };

  $('slachten').addEventListener('input', (ev) => {
    const r = ev.target.closest('input[type="range"]');
    const S = T.S;
    if (!r || !S || !slacht) return;
    slacht[Number(r.dataset.groep)] = Number(r.value);
    $('slachten').querySelector(`[data-slacht="${r.dataset.groep}"]`).textContent = r.value;
    $('slachten').querySelector('.heer-samen').innerHTML = slachtSamenvatting(S, T.kuddeGroepen(S.dorp, dagNu(S)));
  });

  $('slachten').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitSlachten(S);
    } else if (b.dataset.actie === 'voorstel') {
      slacht = null;
      toonSlachten(S);
    } else if (b.dataset.actie === 'slacht') {
      const weg = gekozen(T.kuddeGroepen(S.dorp, dagNu(S)));
      if (weg.length) T.slacht(S.dorp, weg, dagNu(S));
      T.ui.sluitSlachten(S);
    }
  });

  // ── Verstoppen (js/verstoppen.js; spel.md, "Marcel koos voor stap 2") ──
  // In de kelder van een huis of een boerderij, of in de kapel. De schout loopt erheen
  // (js/verkennen.js), en dan gaat dit venster open. Per goed (graan, goud) zie je wat je hebt, wat
  // hier ligt en wat er nog past, en zet je iets weg of haal je het terug. Elke knop stelt dezelfde
  // vraag als de regels (T.kanVerstoppen, T.kanTerughalen), dus een knop die niet kan, zegt bij de
  // muis waarom. Zolang het open is, staat de tijd stil (T.houdTijdStil) en sluit Esc het
  // (S.modus 'verstoppen', js/main.js).
  let verstopGebouw = null;
  const VERSTOP_WAAR = { graan: 'in de schuur', goud: 'in de kist' };

  function verstopKnop(actie, wat, n, tekst, k) {
    const titel = k.kan ? '' : ` title="${veilig(k.reden)}"`;
    return `<button data-actie="${actie}" data-wat="${wat}" data-n="${n}"${k.kan ? '' : ' disabled'}${titel}>${tekst}</button>`;
  }

  function verstopRij(S, g, p, wat) {
    const ligt = (g.verstopt && g.verstopt[wat]) || 0;
    const stap = wat === 'graan' ? 10 : 5;
    // Alles wat kan: bij graan de kelder vol (of wat je hebt), bij goud alles.
    const max = T.hoeveelVerstoppen(S.dorp, g, wat);
    const alles = max > 0 ? T.kanVerstoppen(S.dorp, g, wat, max) : T.kanVerstoppen(S.dorp, g, wat, Math.max(1, hebNu(S, wat)));
    const vul = wat === 'graan' ? `Vul hem${max > 0 ? ` (${max})` : ''}` : `Alles weg${max > 0 ? ` (${max})` : ''}`;
    const past = wat === 'graan' ? `er past nog ${Math.max(0, Math.floor(p.plaats - ligt))} bij` : 'past altijd, in een pot onder de vloer';
    return (
      `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter(wat)} <small>je hebt ${hebNu(S, wat)} ${VERSTOP_WAAR[wat]}</small></span>` +
      `<span class="handel-prijs">hier ${Math.floor(ligt)}<small>${past}</small></span>` +
      `<span class="handel-knoppen">` +
      verstopKnop('weg', wat, stap, `Zet ${stap} weg`, T.kanVerstoppen(S.dorp, g, wat, stap)) +
      verstopKnop('weg', wat, max, vul, alles) +
      verstopKnop('terug', wat, stap, `Haal ${stap} terug`, T.kanTerughalen(S.dorp, g, wat, stap)) +
      verstopKnop('terug', wat, ligt, 'Alles terug', T.kanTerughalen(S.dorp, g, wat, ligt)) +
      `</span></div>`
    );
  }

  // Wie je nu ziet (js/zien.js, T.kijkersTekst): zo weet je het vóór je iets wegzet (Marcel, vraag 40,
  // A). Kijkt er iemand, dan in het rood. Met "pas later" in de spelregels zie je het niet.
  function verstopKijkers(S, g) {
    if (!T.ZIEN_INSTELLINGEN.meteen) return '';
    const t = T.kijkersTekst(S.dorp, g);
    const iemand = T.getuigenVan(S.dorp, g).length > 0;
    return `<p class="verstop-kijkers${iemand ? ' gezien' : ''}">${veilig(t)}</p>`;
  }

  // Wat de soldaten hier doen, en wat het kost, in één alinea.
  function verstopRisico(p) {
    let t = `Doorzoeken de soldaten het dorp, dan vinden ze het hier ${T.vindKansTekst(p.vinden)}.`;
    if (p.verteldDoor) t += ` ${T.hoofdletter(p.verteldDoor)} vertelde in de herberg wat je hier deed.`;
    if (p.vanSchout) t += ' Bij de schout kijken ze het eerst.';
    if (p.gebouw.soort === 'kapel') t += ' Het is gewijde grond.';
    if (p.houdt > 0 && p.wieHoudt === 'de kapelaan') t += ` De kapelaan houdt ${T.deelTekst(p.houdt)} van wat je hier neerzet.`;
    return t;
  }

  // Wie er woont, klein naast de titel: met zijn karakter als dat telt.
  function verstopWie(p) {
    if (p.vanSchout) return 'de schout';
    if (!p.bewoner) return '';
    const k = T.VERSTOP_INSTELLINGEN.karakters && T.KARAKTERS && T.KARAKTERS[p.karakter];
    return k ? `${p.bewoner.naam}, ${k.kort}` : p.bewoner.naam;
  }

  function toonVerstoppen(S) {
    const g = verstopGebouw;
    const p = g && T.verstopPlekVan(S.dorp, g);
    if (!p) {
      T.ui.sluitVerstoppen(S);
      return;
    }
    const over = T.overKelderTekst(p);
    const wie = verstopWie(p);
    $('verstoppen').innerHTML =
      `<div class="venster-kop"><span class="venster-titel">${veilig(T.hoofdletter(p.naam))}</span>` +
      `<span class="venster-wanneer">${veilig(wie)}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      (over ? `<p class="verstop-bewoner">${veilig(over)}</p>` : '') +
      `<p class="venster-staat">${verstopRisico(p)}</p>` +
      verstopKijkers(S, g) +
      verstopRij(S, g, p, 'graan') +
      verstopRij(S, g, p, 'goud') +
      `<p class="venster-voet">Wat hier ligt, telt de inner niet, en het dorp eet het niet tot je het terughaalt. ` +
      `Zolang je hier staat, staat de tijd stil. <kbd>Esc</kbd> sluit.</p>`;
    $('verstoppen').classList.remove('verborgen');
  }


  T.ui.verstoppenOpen = () => !$('verstoppen').classList.contains('verborgen');

  T.ui.openVerstoppen = function (S, g) {
    if (!T.verstopPlekVan || !T.verstopPlekVan(S.dorp, g)) return;
    if (T.ui.veldenOpen()) T.ui.sluitVelden(S);
    if (T.ui.briefOpen()) T.ui.sluitBrief(S);
    S.modus = 'verstoppen';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    T.ui.verbergTooltip();
    verstopGebouw = g;
    T.houdTijdStil(S, 'verstoppen');
    toonVerstoppen(S);
  };

  T.ui.sluitVerstoppen = function (S) {
    $('verstoppen').classList.add('verborgen');
    if (S.modus === 'verstoppen') S.modus = 'verkennen';
    verstopGebouw = null;
    T.laatTijdGaan(S, 'verstoppen');
  };

  $('verstoppen').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S || !verstopGebouw) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitVerstoppen(S);
      return;
    }
    const n = Number(b.dataset.n);
    const r = b.dataset.actie === 'weg' ? T.verstop(S.dorp, verstopGebouw, b.dataset.wat, n) : T.haalTerug(S.dorp, verstopGebouw, b.dataset.wat, n);
    if (!r.kan && T.ui.bericht) T.ui.bericht(r.reden);
    // Wie het zag, is getuige (js/zien.js): een oogje boven zijn hoofd, en het bericht zegt wie; met "pas
    // later" in de spelregels hoor je het pas als het rondverteld is.
    if (r.kan && T.werdGezien) {
      const z = T.werdGezien(S, S.dorp, verstopGebouw, b.dataset.actie, b.dataset.wat, n);
      if (T.ZIEN_INSTELLINGEN.meteen && T.ui.bericht) T.ui.bericht(z.bericht);
    }
    toonVerstoppen(S);
  });

  // ── De velden (js/akkers.js, "Velden"; spel.md, "Weides met koeien en schapen") ──
  // Zoals het veldenscherm van Lords of the Realm 2 (Marcel, 25 sep): alle velden onder elkaar, met
  // van wie ze zijn, hoe groot en hoe vruchtbaar, wat ze nu zijn, en drie knoppen voor wat ze
  // volgend jaar worden. Elke knop stelt dezelfde vraag als de klik (T.kanBestemming), dus wat niet
  // kan, staat uit en zegt waarom. Het plan gaat pas in op 1 lentemaand (T.wisselVelden). Zolang het
  // venster open is, staat de tijd stil (T.houdTijdStil) en ligt de rest van de invoer stil
  // (S.modus 'velden', js/main.js), net als bij de spelregels. De regel bij de muis op een veld
  // (T.veldTekst) en de stukjes tekst die beide delen, staan in js/verkennen.js.
  const BESTEMMING_NAAM = { akker: 'Akker', weide: 'Weide', braak: 'Braak' };
  const GRAAN_TAAL = {
    geploegd: 'net geploegd en gezaaid', kiemend: 'het graan kiemt', groen: 'het graan staat groen',
    rijp: 'het graan is rijp', gemaaid: 'gemaaid',
  };

  // Over hoeveel dagen de volgende wissel valt (de dag van "geploegd" in T.AKKER_STADIA), of null.
  function dagenTotWissel(S) {
    const g = T.AKKER_STADIA && T.AKKER_STADIA.find((s) => s.stadium === 'geploegd');
    if (!g || !S.kalender) return null;
    const nu = Math.floor(S.kalender.dag);
    for (let d = nu + 1; d <= nu + T.DAGEN_PER_JAAR; d++) {
      const x = T.datumVanDag(d);
      if (x.maand === g.maand && x.dagVanMaand === g.dag) return d - nu;
    }
    return null;
  }

  // Wat een veld nu is, met wat erbij hoort: het graan op een akker, de kudde op een weide.
  function veldNu(S, veld) {
    const bestemming = T.bestemmingVan(veld);
    const dieren = T.dierenOp(S.dorp, veld);
    let over = '';
    let zorg = false;
    // Samen met een veld ernaast één weide (js/vee.js, T.weideGroepen): dan gaan de kudde en de
    // plaats over allebei.
    const samen = bestemming === 'weide' ? T.samenMetTekst(S.dorp, veld) : '';
    if (dieren.length) {
      const st = T.weideStand(S.dorp, veld);
      const bezet = `${st.nodig} van de ${st.tegels} tegels`;
      const kleinste = Math.min(...Object.values(T.VEE_INSTELLINGEN.plaats));
      zorg = st.vrij < 0;
      over = `${T.kuddeTekst(dieren)} · ` + (samen ? `${samen} · ` : '') + (st.vrij < 0
        ? `te vol: ze hebben ${st.nodig} tegels nodig en er zijn er ${st.tegels}, dus de koeien geven ${Math.round(st.vol * 100)}% melk en er komen geen jongen`
        : st.vrij < kleinste ? `vol (${bezet}): geen plaats voor jongen` : `${bezet}: plaats voor jongen`);
    } else if (bestemming === 'weide') {
      over = 'nog geen vee' + (samen ? ` · ${samen}` : '');
    } else if (bestemming === 'braak') {
      over = 'het land rust';
    } else {
      const datum = T.datumVanDag(S.kalender.dag);
      const stadium = T.akkerStadium(datum.maand, datum.dagVanMaand);
      const zonder = veld.ongezaaid ? veld.ongezaaid.size : 0;
      over = zonder >= veld.b * veld.h ? 'dit jaar niet gezaaid' : GRAAN_TAAL[stadium] || '';
      if (zonder && zonder < veld.b * veld.h) over += ` · ${zonder} tegels niet gezaaid`;
      zorg = zonder > 0;
    }
    return `<span class="veld-bestemming ${bestemming}">${BESTEMMING_NAAM[bestemming]}</span> <small${zorg ? ' class="zorg"' : ''}>${over}</small>`;
  }

  function veldRij(S, veld, i) {
    const boer = T.boerVanVeld(S.dorp, veld);
    const bestemming = T.bestemmingVan(veld);
    const plan = T.planVan(veld);
    const pct = Math.round(T.vruchtbaarheidVan(veld) * 100);
    const redenen = [];
    const knoppen = T.BESTEMMINGEN.map((b) => {
      if (b === plan) return `<button class="veld-keuze gekozen" data-veld="${i}" data-bestemming="${b}" title="Dit wordt het volgend jaar">${BESTEMMING_NAAM[b]}</button>`;
      const k = T.kanBestemming(S.dorp, veld, b);
      if (!k.kan && !redenen.includes(k.reden)) redenen.push(k.reden);
      const titel = veilig(k.kan ? `Volgend jaar ${b}` : k.reden);
      return `<button class="veld-keuze" data-veld="${i}" data-bestemming="${b}" title="${titel}"${k.kan ? '' : ' disabled'}>${BESTEMMING_NAAM[b]}</button>`;
    }).join('');
    // Mest erop (js/akkers.js, T.zetMest): een knop die aan en uit gaat, naast de drie keuzes. Alleen
    // op wat volgend jaar akker is; wat niet kan, staat uit en zegt waarom.
    let mestKnop = '';
    if (T.kanMest && !T.VELDEN_INSTELLINGEN.mestVanzelf && T.VELDEN_INSTELLINGEN.vruchtbaarheid) {
      const km = T.kanMest(S.dorp, veld);
      const karren = Math.round(T.mestVoorVeld(veld) * 10) / 10;
      const pct = Math.round(T.VELDEN_INSTELLINGEN.mestErbij * 100);
      const titel = veld.mest
        ? `Mest erop op ${T.veldWisselTekst()}: ${karren} karren, +${pct}% vruchtbaar. Klik om hem eraf te halen.`
        : km.kan ? `Mest erop op ${T.veldWisselTekst()}: ${karren} karren, +${pct}% vruchtbaar, elk jaar tot je hem eraf haalt.` : km.reden;
      mestKnop = `<button class="veld-keuze veld-mest${veld.mest ? ' gekozen' : ''}" data-mest="${i}" title="${veilig(titel)}"${veld.mest || km.kan ? '' : ' disabled'}>Mest</button>`;
    }
    const wanneer = plan !== bestemming || veld.mest
      ? `<small class="veld-wanneer">${plan !== bestemming ? `wordt ${plan}` : 'krijgt mest'}${plan !== bestemming && veld.mest ? ', met mest,' : ''} op ${T.veldWisselTekst()}</small>`
      : '';
    return (
      `<div class="veld-rij${plan !== bestemming || veld.mest ? ' verandert' : ''}">` +
      `<div class="veld-wie" title="${veld.b} bij ${veld.h} tegels"><span class="veld-naam">${boer ? veilig(boer.naam) : 'Zonder boer'}</span> ` +
      `<small>${veld.b * veld.h} tegels</small></div>` +
      `<div class="veld-vrucht" title="Vruchtbaar: een akker geeft zijn graan maal dit getal."><span class="veld-balk"><i style="width:${pct}%"></i></span> <small>${pct}%</small></div>` +
      `<div class="veld-nu">${veldNu(S, veld)}</div>` +
      `<div class="veld-plan"><div class="veld-keuzes">${knoppen}${mestKnop}</div>${wanneer}</div>` +
      (redenen.length ? `<p class="veld-reden">${redenen.map(veilig).join(' ')}</p>` : '') +
      `</div>`
    );
  }

  // Het hooi van de weides van volgend jaar (js/vee.js, "De winter"), en hoeveel koeien dat de
  // winter door helpt: dat, en niet het gras in de zomer, beslist hoeveel vee je houdt. Leeg zonder
  // winterzorg.
  function hooiVooruit(S, weides) {
    const VI = T.VEE_INSTELLINGEN;
    if (!VI.winterzorg || !weides.length) return '';
    const hooi = weides.reduce((n, v) => n + v.b * v.h * T.hooiPerTegel(v, T.boerVanVeld(S.dorp, v)), 0);
    const koeien = Math.floor(hooi / (T.winterLengte() * (VI.hooiPerDag.koe || 1)));
    const nu = T.veeVan(S.dorp).filter((e) => e.dier === 'koe').length;
    return ` Die ${weides.length === 1 ? 'weide geeft' : 'weides geven'} in ${VI.hooien} zo'n ${Math.round(hooi)} hooi: ` +
      `genoeg voor ${koeien} ${koeien === 1 ? 'koe' : 'koeien'} de winter door (een kalf telt half), en je hebt er nu ${nu}.`;
  }

  // De mest van volgend jaar (js/akkers.js, T.mestPlan): wat je hebt, en wat de akkers met mest
  // vragen. Leeg als er geen mest is en er ook niemand om vraagt.
  function mestVooruit(S) {
    if (!T.mestPlan || !T.VELDEN_INSTELLINGEN.vruchtbaarheid) return '';
    const mp = T.mestPlan(S.dorp);
    const heb = Math.floor((S.dorp.voorraad && S.dorp.voorraad.mest) || 0);
    if (!mp.velden.length && !heb) return '';
    if (T.VELDEN_INSTELLINGEN.mestVanzelf) {
      return ` De mest gaat vanzelf over alle akkers: je hebt ${heb} karren, en een volle beurt vraagt er ${Math.round(mp.nodig)}.`;
    }
    const n = mp.velden.length;
    return ` Mest: je hebt ${heb} karren` +
      (n ? `, en ${n === 1 ? 'de akker' : `de ${n} akkers`} met mest ${n === 1 ? 'vraagt' : 'vragen'} er ${Math.round(mp.nodig)}.` : ', en nog geen akker met mest erop.');
  }

  // De hele kudde in één regel, met de knop om te slachten (het venster hierboven).
  function kuddeRegel(S) {
    const kudde = T.veeVan(S.dorp);
    if (!kudde.length || !T.dierenTekst) return '';
    const meent = T.meentVan(S.wereld);
    return `<p class="veld-kudde">De kudde: ${T.dierenTekst(kudde, dagNu(S))}. ` +
      `<button class="veld-keuze" data-actie="slachten" title="Wie gaat er naar de slager?">Slachten…</button></p>` +
      (meent && T.meentTekst ? `<p class="veld-kudde">${veilig(T.meentTekst(S.dorp, meent))}.</p>` : '');
  }

  function veldenInhoud(S) {
    const velden = (S.wereld && S.wereld.akkers) || [];
    const IN = T.VELDEN_INSTELLINGEN;
    const wissel = T.veldWisselTekst();
    const dagen = dagenTotWissel(S);
    const over = dagen == null ? '' : ` (over ${dagen} dag${dagen === 1 ? '' : 'en'})`;
    const pc = (x) => `${Math.round(x * 100)}%`;
    const land = IN.vruchtbaarheid
      ? `Een akker put het land uit (−${pc(IN.akkerPutUit)} per jaar), een braak rust (+${pc(IN.braakRust)}) en een weide wordt door het vee gemest (+${pc(IN.weideMest)}). ` +
        `Mest uit de schaapskooi maakt een akker ${pc(IN.mestErbij)} vruchtbaarder.`
      : 'Het land put niet uit: dat staat uit in de spelregels.';
    // Wat het volgend jaar wordt, bij elkaar: hoeveel akkers er te zaaien zijn, en wat dat kost.
    const tel = (b) => velden.filter((v) => T.planVan(v) === b);
    const akkers = tel('akker');
    const tegels = akkers.reduce((n, v) => n + v.b * v.h, 0);
    const zaai = Math.round(tegels * (T.ZAAIGRAAN_PER_TEGEL || 0));
    const weides = tel('weide').length;
    const braak = tel('braak').length;
    const volgend =
      `Volgend jaar: ${akkers.length} ${akkers.length === 1 ? 'akker' : 'akkers'} (${tegels} tegels: zaaien kost ${zaai} graan, en je hebt er nu ${hebNu(S, 'graan')}), ` +
      `${weides ? `${weides} ${weides === 1 ? 'weide' : 'weides'}` : 'geen weide'} en ` +
      `${braak ? `${braak} ${braak === 1 ? 'veld' : 'velden'} braak` : 'geen braak'}.` + hooiVooruit(S, tel('weide')) + mestVooruit(S);
    return (
      `<div class="venster-kop"><span class="venster-titel">De velden</span><span class="venster-wanneer">de wissel op ${wissel}${over}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<p class="venster-staat">Elk veld is akker, weide of braak. Wat je hier kiest, gaat in op <b>${wissel}</b>, als de boeren ploegen: ` +
      `staand graan vertrap je niet. ${land}</p>` +
      `<div class="veld-rij veld-kop"><span>Veld</span><span title="Een akker geeft zijn graan maal zijn vruchtbaarheid.">Vruchtbaar</span>` +
      `<span>Nu</span><span>Volgend jaar</span></div>` +
      (velden.map((v, i) => veldRij(S, v, i)).join('') || '<p class="venster-staat">Hier zijn geen velden.</p>') +
      `<p class="veld-samen">${volgend}</p>` + kuddeRegel(S) +
      `<p class="venster-voet">Zolang dit open is, staat de tijd stil. <kbd>Esc</kbd> of <kbd>V</kbd> sluit.</p>`
    );
  }

  // Opnieuw tekenen, op de plek waar je was.
  function toonVelden(S) {
    const box = $('velden');
    const waar = box.scrollTop;
    box.innerHTML = veldenInhoud(S);
    box.scrollTop = waar;
  }

  T.ui.veldenOpen = () => !$('velden').classList.contains('verborgen');

  T.ui.openVelden = function (S) {
    if (!S.wereld || !S.wereld.akkers || !T.kanBestemming) return;
    S.modus = 'velden';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    if (T.ui.briefOpen()) T.ui.sluitBrief(S);
    T.ui.verbergTooltip();
    T.houdTijdStil(S, 'velden');
    $('velden').classList.remove('verborgen');
    toonVelden(S);
    $('velden-knop').classList.add('actief');
  };

  T.ui.sluitVelden = function (S) {
    $('velden').classList.add('verborgen');
    $('velden-knop').classList.remove('actief');
    if (S.modus === 'velden') S.modus = 'verkennen';
    T.laatTijdGaan(S, 'velden');
  };

  $('velden').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitVelden(S);
      return;
    }
    if (b.dataset.actie === 'slachten') {
      T.ui.sluitVelden(S);
      T.ui.openSlachten(S.dorp);
      return;
    }
    if (b.dataset.mest !== undefined) {
      const v = S.wereld.akkers[Number(b.dataset.mest)];
      const r = T.zetMest(S.dorp, v, !v.mest);
      if (!r.kan) T.ui.bericht(r.reden, 'gevaar');
      toonVelden(S);
      return;
    }
    const veld = S.wereld.akkers[Number(b.dataset.veld)];
    if (!veld || !b.dataset.bestemming || T.planVan(veld) === b.dataset.bestemming) return;
    const r = T.zetPlan(S.dorp, veld, b.dataset.bestemming);
    if (!r.kan) T.ui.bericht(r.reden, 'gevaar');
    toonVelden(S);
  });

  $('velden-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    const S = T.S;
    if (!S) return;
    if (T.ui.veldenOpen()) {
      T.ui.sluitVelden(S);
      return;
    }
    // Van de spelregels (of de wetten, of de raadsman) meteen naar de velden, zonder eerst het ene venster dicht te
    // hoeven doen.
    if (T.ui.spelregelsOpen()) T.ui.sluitSpelregels(S);
    if (T.ui.wettenOpen()) T.ui.sluitWetten(S);
    if (T.ui.raadsmanOpen()) T.ui.sluitRaadsman(S);
    if (S.modus === 'verkennen') T.ui.openVelden(S);
  });

  // ── De spelregels (js/opties.js; spel.md, "Instelbaar") ──
  // Eén venster in drie delen: de keuzes, de namen, en de werkbank met alle getallen. Wat je
  // verandert, geldt meteen, en de browser onthoudt het. Zolang het open is, staat de tijd stil.
  // Namen typt de speler zelf, dus alles wat van hem komt, gaat door veilig() (bij de heer, hierboven).
  const alsGetal = (x) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 1000) / 1000).replace('.', ','));

  function regelsInhoud() {
    const keuzes = T.OPTIES.map((o) => {
      const nu = T.optieKeuze(o.id);
      const gekozen = o.keuzes.find((k) => k.id === nu);
      const knoppen = o.keuzes
        .map((k) => `<button class="regel-keuze${k.id === nu ? ' gekozen' : ''}" data-optie="${o.id}" data-keuze="${k.id}" title="${veilig(k.uitleg)}">${k.naam}${k.id === o.standaard ? '<small>standaard</small>' : ''}</button>`)
        .join('');
      return (
        `<div class="regel"><div class="regel-naam">${o.naam}<small>${o.uitleg}</small></div>` +
        `<div class="regel-keuzes">${knoppen}</div><p class="regel-uitleg">${gekozen ? gekozen.uitleg : ''}</p></div>`
      );
    }).join('');
    const namen = T.NAAM_OPTIES.map((id) => {
      // Wie een boer nu is en wat hij kan (js/boeren.js), zoals het poppetje het in dit spel heeft.
      const e = T.S && T.S.wereld && T.S.wereld.wezens.find((x) => x.wie === id);
      const over = e ? T.overBoerTekst(e) : '';
      const wie = id === 'heer' ? 'de heer, die standaard geen naam heeft' : over;
      const leeg = id === 'heer' ? 'de heer' : T.standaardNaam(id);
      return (
        `<label class="naam-rij"><input type="text" maxlength="30" data-naam="${id}" value="${veilig(T.OPTIES_NU.namen[id] || '')}" placeholder="${veilig(leeg)}">` +
        `<span>${veilig(wie)}</span></label>`
      );
    }).join('');
    const werkbank = T.WERKBANK.map((deel, i) => {
      const rijen = T.werkbankGetallen(deel).map((g) => {
        const b = T.werkbankBereik(g.standaard);
        const door = g.doorOptie ? `<small>via ${veilig(g.doorOptie)}</small>` : '';
        return (
          `<div class="werk-rij${g.eigen ? ' eigen' : ''}" data-rij="${g.pad}"><span class="werk-naam">${veilig(g.label)}${door}</span>` +
          `<input type="range" min="${b.min}" max="${Math.max(b.max, g.waarde)}" step="${b.stap}" value="${g.waarde}" data-pad="${g.pad}">` +
          `<input type="number" step="${b.stap}" value="${g.waarde}" data-pad="${g.pad}">` +
          `<button class="werk-terug" data-terug="${g.pad}" title="Terug naar ${alsGetal(g.standaard)}"${g.eigen ? '' : ' disabled'}>↺</button></div>`
        );
      }).join('');
      return `<details class="werk-deel" data-deel="${i}"><summary>${deel.naam}</summary>${rijen}</details>`;
    }).join('');
    return (
      `<div class="venster-kop"><span class="venster-titel">Spelregels</span><span class="venster-wanneer">wat je zelf instelt</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<p class="venster-staat">Wat je verandert, geldt meteen, ook midden in een spel, en de browser onthoudt het. De standaard is wat Marcel koos.</p>` +
      `<div class="kop">De regels</div>${keuzes}` +
      `<div class="kop">Namen, en wie de boeren zijn</div><div class="namen">${namen}</div>` +
      (T.lootBoeren && T.BOEREN_INSTELLINGEN && T.BOEREN_INSTELLINGEN.loten
        ? `<div class="regels-voet"><button data-actie="loot">Loot de boeren opnieuw</button><span>Een ander karakter en andere eigenschappen, nu meteen.</span></div>`
        : '') +
      `<div class="kop">Werkbank: alle getallen</div>` +
      `<p class="venster-staat">Elk getal uit de regels. Wat je hier zet, gaat vóór wat een regel hierboven zet; ↺ zet het terug.</p>${werkbank}` +
      `<div class="regels-voet"><button data-actie="terug">Alles terug naar de standaard</button>` +
      `<span>Zolang dit open is, staat de tijd stil. <kbd>Esc</kbd> sluit.</span></div>`
    );
  }

  // Opnieuw tekenen, maar met de open delen van de werkbank en de plek waar je was.
  function toonSpelregels() {
    const box = $('spelregels');
    const open = [...box.querySelectorAll('details[open]')].map((d) => d.dataset.deel);
    const waar = box.scrollTop;
    box.innerHTML = regelsInhoud();
    for (const d of box.querySelectorAll('details')) if (open.includes(d.dataset.deel)) d.open = true;
    box.scrollTop = waar;
  }

  T.ui.spelregelsOpen = () => !$('spelregels').classList.contains('verborgen');

  T.ui.openSpelregels = function (S) {
    S.modus = 'spelregels';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    if (T.ui.briefOpen()) T.ui.sluitBrief(S);
    T.houdTijdStil(S, 'spelregels');
    $('spelregels').classList.remove('verborgen');
    toonSpelregels();
    $('spelregels-knop').classList.add('actief');
  };

  T.ui.sluitSpelregels = function (S) {
    $('spelregels').classList.add('verborgen');
    $('spelregels-knop').classList.remove('actief');
    if (S.modus === 'spelregels') S.modus = 'verkennen';
    T.laatTijdGaan(S, 'spelregels');
    // Wat een regel verandert, kan de balk raken (de snelheid van een dag, wat de heer vraagt).
    T.ui.toonVoorraad(S.dorp);
    T.ui.toonKalender(S);
  };

  $('spelregels-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    const S = T.S;
    if (!S) return;
    if (T.ui.spelregelsOpen()) {
      T.ui.sluitSpelregels(S);
      return;
    }
    if (T.ui.veldenOpen()) T.ui.sluitVelden(S);
    if (T.ui.wettenOpen()) T.ui.sluitWetten(S);
    if (T.ui.raadsmanOpen()) T.ui.sluitRaadsman(S);
    if (S.modus === 'verkennen') T.ui.openSpelregels(S);
  });

  // Eén getal van de werkbank bijwerken zonder het hele venster opnieuw te tekenen: anders valt
  // de schuif uit je hand terwijl je sleept.
  function werkRijBij(pad) {
    const rij = $('spelregels').querySelector(`[data-rij="${pad}"]`);
    if (!rij) return;
    const g = T.WERKBANK.flatMap((deel) => T.werkbankGetallen(deel)).find((x) => x.pad === pad);
    if (!g) return;
    for (const i of rij.querySelectorAll('input')) if (document.activeElement !== i) i.value = g.waarde;
    rij.classList.toggle('eigen', g.eigen);
    const terug = rij.querySelector('.werk-terug');
    terug.disabled = !g.eigen;
    terug.title = `Terug naar ${alsGetal(g.standaard)}`;
  }

  $('spelregels').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitSpelregels(S);
    } else if (b.dataset.actie === 'terug') {
      T.optiesTerug(S);
      toonSpelregels();
    } else if (b.dataset.actie === 'loot') {
      T.lootBoeren(S.dorp);
      toonSpelregels();
    } else if (b.dataset.optie) {
      T.zetOptie(b.dataset.optie, b.dataset.keuze, S);
      toonSpelregels();
    } else if (b.dataset.terug) {
      T.zetGetal(b.dataset.terug, null, S);
      werkRijBij(b.dataset.terug);
    }
  });

  $('spelregels').addEventListener('input', (ev) => {
    const el = ev.target;
    const S = T.S;
    if (!S) return;
    if (el.dataset.naam) {
      T.zetNaam(el.dataset.naam, el.value, S);
    } else if (el.dataset.pad && el.value !== '' && Number.isFinite(Number(el.value))) {
      T.zetGetal(el.dataset.pad, Number(el.value), S);
      werkRijBij(el.dataset.pad);
    }
  });

  // Eén stand trager of sneller, langs T.SNELHEDEN (js/tijd.js: pauze, 1×, 3×, 10×, 30×).
  // T.zetSnelheid onthoudt de laatste snelheid, zodat P na een stapje terug weer daar hervat. Wie
  // slaapt en zelf aan de tijd komt, is wakker (js/dag.js).
  function stapSnelheid(delta) {
    const S = T.S;
    if (!S || !S.kalender) return;
    if (S.slaap && T.wordWakker) T.wordWakker(S);
    const standen = T.SNELHEDEN || [0, 1, 3];
    let i = standen.indexOf(S.kalender.snelheid);
    if (i < 0) i = standen.findIndex((v) => v > S.kalender.snelheid) - 1;
    if (i < 0) i = standen.length - 1;
    T.zetSnelheid(S, standen[Math.max(0, Math.min(standen.length - 1, i + delta))]);
  }

  $('kalender-knoppen').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || !T.S) return;
    b.blur();
    if (T.S.slaap && T.wordWakker) T.wordWakker(T.S);
    T.zetSnelheid(T.S, Number(b.dataset.snelheid));
  });

  $('slaap-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (T.S && T.gaSlapen) T.gaSlapen(T.S);
  });

  // P, Z, - en = botsen nergens mee: de spatie en 1-4 zijn van het gevecht (CLAUDE.md). Z is slapen
  // tot de ochtend, of wakker worden (js/dag.js).
  window.addEventListener('keydown', (ev) => {
    if (!T.NIEUWE_HUD || !T.S || !T.S.kalender) return;
    // Niet terwijl je een naam typt, en niet in de spelregels of de velden (daar staat de tijd
    // bewust stil).
    if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
    if (T.S.modus === 'spelregels' || T.S.modus === 'velden') return;
    if (ev.key === 'p' || ev.key === 'P') {
      const k = T.S.kalender;
      if (T.S.slaap && T.wordWakker) T.wordWakker(T.S);
      T.zetSnelheid(T.S, k.snelheid > 0 ? 0 : k.laatsteSnelheid || 1);
    } else if ((ev.key === 'z' || ev.key === 'Z') && T.gaSlapen) {
      if (T.S.slaap) T.wordWakker(T.S);
      else T.gaSlapen(T.S);
    } else if (ev.key === '-' || ev.key === '_') {
      stapSnelheid(-1);
    } else if (ev.key === '=' || ev.key === '+') {
      stapSnelheid(1);
    }
  });
})(globalThis.Spel = globalThis.Spel || {});
