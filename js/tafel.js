// De tafel van de schout, onderin over de hele breedte (ontwerp/werklijst.md, vraag 146, c; Marcel, 9 okt: "Ik denk dat
// het nu ook tijd is om een fatsoenlijke UI te maken", en op de plaat "De schrijftafel van de schout": "Ja dit ziet er
// goed uit voor nu!"). Links het rekenboek (de voorraad, en het dorp: de kas, de mensen, de tevredenheid en de argwaan);
// in het midden de dingen die een venster openen (het bouwplan, de velden, het wetboek, de bel van de raadsman, en de
// brief, het rapport, de zaak en de inktpot van de bode zolang ze er zijn); rechts de lantaarn (sluipen), de kaars
// (slapen), de zandloper met de lat van de snelheden, en het zegel van de heer en de hoed van het dorp (js/bazen.js).
// Geen ding draagt een letter: wat het is, wat het nu zegt en zijn toets staan op het briefje bij de muis (#wenk).
//
// De kunst komt uit gereedschap/pixelart/tafel.cjs (beelden/tafel/), op ware pixels: een pixel van de kunst is een
// hele pixel van het scherm, op 1080 één, op 4K twee (pasSchaal). Elk ding houdt het id van de knop die het was
// (#bouwmenu-knop, #velden-knop, ...), zodat wat hem opent, niet veranderde: een venster opent nog altijd langs
// T.ui.wisselVenster (js/ui.js).
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // De pictogrammen van het rekenboek: klein, met de hand getekend, in de kleuren van stijl.css; op het papier van het
  // boek in inkt (stijl.css, #rekenboek .icoon).
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
  // Van de wapenmaker (js/ondernemers.js): een zwaard, schuin, met een houten gevest.
  const WAPENS_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M18.5 4.5l1 1-9.6 9.6-1-1z" fill="#c3c7cc" stroke="#8f949a" stroke-width="1" stroke-linejoin="round"/>' +
    '<path d="M6.8 13.2l4 4" stroke="#8a5a2c" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M7.3 17.7l-2.6 2.6" stroke="#8a5a2c" stroke-width="2.2" stroke-linecap="round"/>' +
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
  // De wijnboerderij (werklijst vraag 136): een kruik met een tros druiven ervoor.
  const WIJN_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M9 3.5h5v3c2.4 1.2 3.8 3.6 3.8 6.6 0 4.1-2.8 7.4-6.3 7.4s-6.3-3.3-6.3-7.4c0-3 1.4-5.4 3.8-6.6z" fill="#7a2e3b" stroke="#a2495a" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M8.6 3.5h5.8" stroke="#c9a46a" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="8.2" cy="15.2" r="1.6" fill="#4b2f6b"/><circle cx="10.6" cy="15.6" r="1.6" fill="#55367a"/><circle cx="9.3" cy="17.8" r="1.6" fill="#4b2f6b"/>' +
    '<path d="M9.4 13.4c.4-1 1.2-1.6 2.2-1.8" fill="none" stroke="#6f8f3a" stroke-width="1.1" stroke-linecap="round"/>' +
    '</svg>';
  const GRONDSTOF_ICOON = {
    goud: GOUD_ICOON, graan: GRAAN_ICOON, wol: WOL_ICOON, hout: HOUT_ICOON,
    ijzer: IJZER_ICOON, zout: ZOUT_ICOON, gereedschap: GEREEDSCHAP_ICOON, kaas: KAAS_ICOON,
    hooi: HOOI_ICOON, mest: MEST_ICOON, vlees: VLEES_ICOON, huiden: HUIDEN_ICOON, bier: BIER_ICOON, wijn: WIJN_ICOON,
    wapens: WAPENS_ICOON,
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
    wapens: 'Wapens. Van de wapenmaker: wie van de militie er een heeft, slaat harder als de rovers komen.',
    wijn: 'Wijn. Van de wijnboerderij, geplukt in wijnmaand: drank, zoals bier, en het bederft niet.',
  };
  // Deze staan pas in het rekenboek als het dorp ze eens gehad heeft (S.gehad, js/voorraad.js): in het
  // begin blijft het kort. Kaas, hooi, vlees en bier staan naast het graan, want het is allemaal
  // eten en drinken, voor mens of dier; de rest achteraan.
  const BALK_LATER = ['kaas', 'hooi', 'vlees', 'bier', 'wijn', 'ijzer', 'zout', 'gereedschap', 'wapens', 'mest', 'huiden'];
  const NAAST_GRAAN = ['kaas', 'hooi', 'vlees', 'bier', 'wijn'];
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


  // ── Het rekenboek ──
  // Links de voorraad, rechts het dorp. Elk getal is een post met een pictogram, een naam en het getal; bij de muis staat
  // wat het is en wat het nu zegt (data-uitleg, voor het briefje). Het wordt één keer gemaakt; daarna verandert alleen
  // het getal per post.
  const NAAM = {
    goud: 'De kas', graan: 'Graan', kaas: 'Kaas', hooi: 'Hooi', vlees: 'Vlees', bier: 'Bier', wijn: 'Wijn', wol: 'Wol',
    hout: 'Hout', ijzer: 'IJzer', zout: 'Zout', gereedschap: 'Gereedschap', wapens: 'Wapens', mest: 'Mest',
    huiden: 'Huiden', bevolking: 'Mensen', tevredenheid: 'Tevreden', argwaan: 'Argwaan',
  };
  // Zoveel posten passen er onder elkaar op een bladzijde; staan er meer, dan gaan de namen eraf (stijl.css, .kort).
  const POSTEN_PER_KOLOM = 6;
  const post = (wat, icoon, getal, uitleg, later) =>
    `<div class="post${later ? ' verborgen' : ''}" data-wat="${wat}" data-naam="${NAAM[wat]}" data-uitleg="${uitleg}">` +
    `<span class="icoon">${icoon}</span><span class="naam">${NAAM[wat]}</span>` +
    `<span class="aantal">${getal}</span><span class="verstopt"></span></div>`;

  function bouwRekenboek(box) {
    box.querySelector('.blad.links .posten').innerHTML = BALK.filter((wat) => wat !== 'goud')
      .map((wat) => post(wat, GRONDSTOF_ICOON[wat], 0, GRONDSTOF_UITLEG[wat], BALK_LATER.includes(wat))).join('');
    box.querySelector('.blad.rechts .posten').innerHTML =
      post('goud', GRONDSTOF_ICOON.goud, 0, GRONDSTOF_UITLEG.goud) +
      post('bevolking', BEVOLKING_ICOON, '0/0', 'Mensen in het dorp, en hoeveel er wonen kunnen: elk huis geeft woonruimte.') +
      post('tevredenheid', TEVREDENHEID_ICOON, '100%', 'Tevredenheid.') +
      post('argwaan', ARGWAAN_ICOON, '0%', 'De argwaan van de inner.', true);
    box.dataset.gebouwd = '1';
  }

  // De twee bazen (js/bazen.js; werklijst vraag 106, d): het zegel van de heer en de hoed van het dorp, rechts op tafel,
  // met het getal eronder, rood als hij boos is, en bij de muis waarom. Zonder de spelregel "Twee bazen" liggen ze er niet.
  T.ui.toonBazen = function (D) {
    const S = T.S;
    if (!S || D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const nu = T.bazenNu(D);
    for (const welk of ['gunst', 'vertrouwen']) {
      const el = document.querySelector(`#tafel [data-ding="${welk}"]`);
      el.classList.toggle('verborgen', !nu);
      if (!nu) continue;
      const n = Math.round(nu[welk]);
      el.querySelector('.getal').textContent = String(n);
      el.classList.toggle('hoog', T.bazenStemming(n) === 'boos');
    }
  };

  T.ui.toonVoorraad = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const box = $('rekenboek');
    if (!box.dataset.gebouwd) bouwRekenboek(box);
    for (const wat of BALK) {
      const cel = box.querySelector(`[data-wat="${wat}"]`);
      cel.querySelector('.aantal').textContent = Math.floor(S.dorp.voorraad[wat] || 0);
      if (BALK_LATER.includes(wat)) cel.classList.toggle('verborgen', !(S.dorp.gehad && S.dorp.gehad[wat]));
    }
    // Past de voorraad niet in één kolom, dan zonder namen (die staan dan op het briefje bij de muis).
    const blad = box.querySelector('.blad.links');
    blad.classList.toggle('kort', blad.querySelectorAll('.post:not(.verborgen)').length > POSTEN_PER_KOLOM);
    // De twee bazen (js/bazen.js) liggen op dezelfde tafel, ook meteen bij een nieuw of geladen spel.
    T.ui.toonBazen(D);
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
        cel.dataset.uitleg = GRONDSTOF_UITLEG[wat] + (waar.length ? ` Verstopt: ${waar.join('; ')}. Dat eet het dorp niet, en de inner telt het niet.` : '');
      }
      // Het zaaigraan dat de boeren achterhouden (js/akkers.js, T.zaaigraanApart): bij de muis, bij het graan.
      const zaai = Math.min(Math.floor(S.dorp.voorraad.graan || 0), Math.ceil(T.zaaigraanApart(S.dorp, Math.floor(S.kalender.dag))));
      if (zaai > 0) box.querySelector('[data-wat="graan"]').dataset.uitleg += ` Daarvan is ${zaai} zaaigraan voor de lente: dat eet het dorp pas als er niets anders meer is.`;
    }
    // Wat zout en gereedschap nu doen, bij de muis: hoeveel vis en vlees het zout goed houdt, en
    // hoeveel handen het gereedschap dekt (js/behoeften.js, js/gebouwen.js).
    if (T.zoutDekking) {
      const d = T.zoutDekking(S.dorp);
      box.querySelector('[data-wat="zout"]').dataset.uitleg = d.totaal >= 1
        ? `Zout. Eén zout houdt ${T.BEHOEFTEN_INSTELLINGEN.zoutHoudtGoed} vis of vlees goed; de rest bederft. Nu gezouten: ${Math.floor(d.gezouten)} van de ${Math.floor(d.totaal)}.`
        : GRONDSTOF_UITLEG.zout;
    }
    if (T.gereedschapDekking) {
      const d = T.gereedschapDekking(S.dorp);
      box.querySelector('[data-wat="gereedschap"]').dataset.uitleg = d.handen
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
      box.querySelector('[data-wat="kaas"]').dataset.uitleg = GRONDSTOF_UITLEG.kaas + voor + melk;
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
      cel.dataset.uitleg = GRONDSTOF_UITLEG.hooi + over;
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
      cel.dataset.uitleg = `${GRONDSTOF_UITLEG.hout} ${stookt} er ${perDag(v.stook)} per dag van${erbij}: ${genoeg}.`;
      cel.classList.toggle('laag', !v.haalt);
    }
  };

  // Het aantal mensen en de woonruimte (js/gebouwen.js, T.werkGebouwenBij): een eigen functie,
  // want die twee veranderen niet via T.wijzigVoorraad en dus niet vanzelf mee met toonVoorraad.
  T.ui.toonBevolking = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const box = $('rekenboek');
    if (!box.dataset.gebouwd) bouwRekenboek(box);
    const el = box.querySelector('[data-wat="bevolking"] .aantal');
    if (el) el.textContent = `${Math.floor(S.dorp.bevolking)}/${Math.floor(S.dorp.woonruimte)}`;
  };

  // De tevredenheid (js/behoeften.js, T.tikBehoeftenDag) en, op hover, wat het dorp mist — dezelfde
  // vraag als T.ui.toonBevolking hierboven, met een eigen functie om dezelfde reden: tevredenheid
  // verandert niet via T.wijzigVoorraad.
  T.ui.toonTevredenheid = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const box = $('rekenboek');
    if (!box.dataset.gebouwd) bouwRekenboek(box);
    T.ui.toonBazen(D); // de twee bazen liggen ernaast (js/bazen.js)
    const cel = box.querySelector('[data-wat="tevredenheid"]');
    if (!cel || !S.dorp.behoeften) return;
    const pct = Math.round(S.dorp.behoeften.tevredenheid * 100);
    cel.querySelector('.aantal').textContent = `${pct}%`;
    cel.classList.toggle('laag', S.dorp.behoeften.tevredenheid < T.BEHOEFTEN_INSTELLINGEN.vertrekDrempel);
    const last = S.dorp.behoeften.last && S.dorp.behoeften.last.length ? ` Het heeft last van ${S.dorp.behoeften.last.join(' en ')}.` : '';
    const blij = S.dorp.behoeften.blij && S.dorp.behoeften.blij.length ? ` Het is blij met ${S.dorp.behoeften.blij.join(' en ')}.` : '';
    // Met de wensen per huis (js/wensen.js): hoe tevreden elke stand is, en in hoeveel huizen iets gemist wordt.
    const st = S.dorp.behoeften.standen;
    const perStand = st ? ` ${T.hoofdletter(Object.keys(T.STANDEN).filter((s) => st[s]).map((s) => `${T.STANDEN[s].naam} ${Math.round(st[s].tevredenheid * 100)}%`).join(', '))}.` : '';
    const gemist = S.dorp.behoeften.gemist || [];
    const mist = S.dorp.behoeften.mist.map((m) => {
      const g = gemist.find((x) => x.naam === m);
      return g ? `${m} (${g.huizen === 1 ? 'één huis' : `${g.huizen} huizen`})` : m;
    });
    cel.dataset.uitleg = mist.length
      ? `Tevredenheid: ${pct}%.${perStand} Het dorp mist: ${mist.join(', ')}.${last}${blij}`
      : `Tevredenheid: ${pct}%.${perStand} Het dorp heeft wat het nodig heeft.${last}${blij}`;
  };

  // De argwaan van de inner (js/inner.js), en op hover waarom en wat ze doet. Pas in de balk als hij
  // er eens geweest is, of als er argwaan is: in het begin blijft het rekenboek kort.
  T.ui.toonArgwaan = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const box = $('rekenboek');
    if (!box.dataset.gebouwd) bouwRekenboek(box);
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
    cel.dataset.uitleg =
      `Argwaan van de inner: ${pct(I.argwaan)}.${waarom}${nu}${geschenk} ` +
      `Vanaf ${pct(IN.terugkomenVanaf)} komt hij onverwacht terug, vanaf ${pct(IN.doorzoekenVanaf)} doorzoeken de soldaten op Sint-Maarten het dorp, ` +
      `en vanaf ${pct(IN.rapportTeltNietVanaf)} gelooft de heer zijn rapport niet meer en vraagt hij naar alles. Na Sint-Maarten zakt ze.`;
  };

  // ── De dingen op tafel ──
  // Wat elk ding is (naam), wat het nu zegt (uitleg, uit de regels) en zijn toets, voor het briefje bij de muis. Wat een
  // ding doet als je erop klikt, doet de knop die het was (zijn id); de zandloper staat hier.
  const DINGEN = {
    rekenboek: { naam: 'Het rekenboek', uitleg: () => 'Wat er ligt en hoe het dorp ervoor staat. Wijs een getal aan voor wat het zegt.' },
    bouwen: {
      naam: 'Het bouwplan',
      uitleg: () => (T.VERZOEKEN_INSTELLINGEN.mensen ? 'Een erf aanwijzen, en een oproep op het plein hangen.' : 'Bouwen: kies wat, en wijs aan waar.')
        + ' Een rechtsklik legt wat je in de hand hebt weer weg.',
      toets: 'B',
    },
    velden: { naam: 'De velden', uitleg: () => 'Wat elk veld is, wie het koos, en wat het volgend jaar wordt.', toets: 'V' },
    wetten: { naam: 'Het wetboek', uitleg: () => 'Wetten aannemen en afschaffen.', toets: 'W' },
    raadsman: { naam: 'De bel', uitleg: () => 'Je raadsman: wie beslist als je er niet bent, en wat hij besloot.', toets: 'R' },
    brief: { naam: 'Een brief van de heer', uitleg: () => 'Hij wacht op je antwoord.' },
    rapport: { naam: 'Het rapport', uitleg: () => 'Van je raadsman, vanochtend. Je las het nog niet.' },
    zaak: { naam: 'De zaak', uitleg: () => 'Wat je weet van de graanzak, en wanneer de zitting is.' },
    bode: {
      naam: 'De inktpot',
      uitleg: (S) => {
        const k = T.kanBodeSturen(S.dorp);
        return `Een bode naar de marskramer, in een moeilijke tijd: je schrijft wat je wilt, en wie er meegaat.${k.kan ? '' : ` ${k.reden}`}`;
      },
    },
    lantaarn: {
      naam: 'De lantaarn',
      uitleg: (S) => (S.sluipen
        ? 'Gedoofd: je sluipt. Trager, en in het donker ziet bijna niemand je. Steek hem aan om gewoon te lopen.'
        : 'Brandt als je buiten loopt in het donker. Doof hem om te sluipen: trager, maar je wordt later gezien.'),
      toets: 'S',
    },
    kaars: {
      naam: 'De kaars',
      uitleg: (S) => (S.slaap ? 'Je slaapt tot het eerste licht. Blaas hem uit om wakker te worden.'
        : T.magSlapen(S) ? 'Slapen tot de ochtend.'
          : 'Slapen kan \'s avonds en \'s nachts, bij je eigen huis.'),
      toets: 'Z',
    },
    zandloper: {
      naam: 'De zandloper',
      uitleg: () => 'De tijd stilzetten, of weer laten gaan. Op de lat kies je hoe snel: op 1× duurt een dag vijf minuten.',
      toets: 'P, en - en + voor trager en sneller',
    },
    gunst: { naam: 'Het zegel van de heer', uitleg: (S) => T.bazenTekst(S.dorp, 'gunst') },
    vertrouwen: { naam: 'De hoed van het dorp', uitleg: (S) => T.bazenTekst(S.dorp, 'vertrouwen') },
    // Bovenaan (vraag 146, d): het lipje Menu en de datum, met het weer.
    menu: { naam: 'Het menu', uitleg: () => 'Opslaan, laden, de spelregels, en terug naar het titelscherm.', toets: 'Esc, en O voor de spelregels' },
    datum: {
      naam: 'Vandaag',
      uitleg: (S) => {
        const W = S.dorp && T.weerVan(S.dorp);
        if (!W) return '';
        return W.droog > 0 ? `Het heeft ${W.droog === 1 ? 'sinds gisteren' : `al ${T.telwoord(W.droog)} dagen`} niet geregend.` : 'Het regent vandaag.';
      },
    },
  };

  // Wat met de tijd verandert: de lat (de snelheid van nu), de kaars (brandt als je kunt slapen of slaapt), en de
  // lantaarn (gloeit als hij in het donker brandt). Vanuit T.ui.toonKalender, elk half uur en als de snelheid verandert.
  T.ui.werkTafelBij = function (S) {
    for (const b of document.querySelectorAll('#kalender-knoppen button')) {
      b.classList.toggle('actief', Number(b.dataset.snelheid) === T.snelheidNu(S));
    }
    T.ui.werkSlaapKnopBij(S);
    $('sluip-knop').classList.toggle('brandt', !!S.dorp && T.draagtLantaarn(S.dorp));
  };

  // Slapen kan 's avonds en 's nachts, bij je eigen huis (js/dag.js, T.magSlapen): dan brandt de kaars, en ook zolang je
  // slaapt; anders staat hij er gedoofd en wat lichter.
  T.ui.werkSlaapKnopBij = function (S) {
    const aan = !!S.slaap || T.magSlapen(S);
    const knop = $('slaap-knop');
    knop.classList.toggle('uit', !aan);
    zetBeeld(knop, `kaars-${aan ? 'aan' : 'uit'}`);
  };

  // Een ding een ander plaatje geven (de lantaarn en de kaars), alleen als het anders is.
  function zetBeeld(knop, naam) {
    const img = knop.querySelector('img');
    const src = `beelden/tafel/${naam}.png`;
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
  }

  // Sluipen (js/verkennen.js, T.wisselSluipen): wie sluipt, dooft zijn lantaarn.
  T.ui.toonSluipen = function (aan) {
    $('sluip-knop').classList.toggle('gedoofd', aan);
    zetBeeld($('sluip-knop'), `lantaarn-${aan ? 'uit' : 'aan'}`);
  };

  // De zandloper: de tijd stil, of weer gaan (zoals P, js/hud.js).
  $('zandloper').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (T.S && T.S.kalender) T.ui.wisselPauze(T.S);
  });

  // ── Het briefje bij de muis ──
  // Op papier boven het ding dat de muis aanwijst: zijn naam, wat het nu zegt, en de toets. Bij een getal uit het
  // rekenboek staat het boven het boek, en bij een briefje bovenaan (het menu, de datum, een status; vraag 146, d) eronder.
  // Het briefje hoort bij de tafel (#wenk in #tafel), dus het schaalt mee.
  function wenkVan(el) {
    const S = T.S;
    const d = DINGEN[el.dataset.ding];
    if (d) return { naam: d.naam, uitleg: S ? d.uitleg(S) : '', toets: d.toets };
    return { naam: el.dataset.naam, uitleg: el.dataset.uitleg, toets: el.dataset.toets };
  }

  function toonWenk(el) {
    const w = wenkVan(el);
    const box = $('wenk');
    if (!w.naam) return verbergWenk();
    box.innerHTML = `<div class="wenk-naam">${w.naam}</div>` + (w.uitleg ? `<div class="wenk-uitleg">${w.uitleg}</div>` : '') +
      (w.toets ? `<div class="wenk-toets">${toetsTekst(w.toets)}</div>` : '');
    box.classList.remove('verborgen');
    // In de maat van de tafel: wat het scherm zegt, gedeeld door de zoom (pasSchaal). Bij een getal uit het rekenboek
    // boven het boek, aan zijn linkerkant; anders boven het ding, in het midden.
    const tafel = $('tafel');
    const t = tafel.getBoundingClientRect();
    const inBoek = el.classList.contains('post');
    const r = (inBoek ? $('rekenboek') : el).getBoundingClientRect();
    const breed = box.offsetWidth;
    const midden = inBoek ? (r.left - t.left) / zoom + breed / 2 : ((r.left + r.right) / 2 - t.left) / zoom;
    box.style.left = `${Math.max(8, Math.min(tafel.offsetWidth - breed - 8, midden - breed / 2))}px`;
    const onder = !tafel.contains(el);
    box.style.bottom = onder
      ? `${tafel.offsetHeight - (r.bottom - t.top) / zoom - 10 - box.offsetHeight}px`
      : `${tafel.offsetHeight - (r.top - t.top) / zoom + 10}px`;
  }

  function verbergWenk() {
    $('wenk').classList.add('verborgen');
  }

  // "P, en - en +" wordt "of de toets P, en - en +", met elke toets in een toetsje.
  function toetsTekst(toets) {
    return 'of de toets ' + toets.replace(/(^|[ ,])([A-Z]|Esc|-|\+)(?=$|[ ,])/g, (_, voor, k) => `${voor}<kbd>${k}</kbd>`);
  }

  const AANWIJSBAAR = '[data-ding], #rekenboek .post, #kalender-knoppen button, #statussen .status';
  for (const plek of [$('tafel'), $('hud-gehucht')]) {
    plek.addEventListener('mouseover', (ev) => {
      const el = ev.target.closest(AANWIJSBAAR);
      if (el) toonWenk(el);
    });
    plek.addEventListener('mouseout', (ev) => {
      const el = ev.target.closest(AANWIJSBAAR);
      if (el && !el.contains(ev.relatedTarget)) verbergWenk();
    });
  }
  // Een klik verandert wat het ding zegt (de lantaarn, de kaars): het briefje zegt het meteen.
  $('tafel').addEventListener('click', (ev) => {
    const el = ev.target.closest(AANWIJSBAAR);
    if (el && !$('wenk').classList.contains('verborgen')) setTimeout(() => toonWenk(el), 0);
  });

  // ── De schaal ──
  // Een pixel van de kunst is een hele pixel van het scherm: op 1080 één, op 4K twee, ook met de schaal van Windows
  // ertussen (150% op een scherm van 1080 is een zoom van 2/3, en elke pixel van de kunst weer één van het scherm). Past de
  // tafel dan niet in de breedte (een scherm kleiner dan 1080), dan wordt hij zo klein dat hij past, niet meer op ware
  // pixels. De zoom staat ook in --tafel-zoom, voor wat erboven ligt (de berichten, de actiebalk; stijl.css).
  const TAFEL_INSTELLINGEN = {
    hoogte: 150, // pixels van de kunst, op 1080 een zevende van het scherm
    minsteBreedte: 1800, // zoveel pixels van de kunst is hij minstens breed, met alle dingen erop
  };
  let zoom = 1;
  function pasSchaal() {
    const dpr = window.devicePixelRatio || 1;
    const n = Math.max(1, Math.round((window.innerHeight * dpr) / 1080));
    zoom = Math.min(n / dpr, window.innerWidth / TAFEL_INSTELLINGEN.minsteBreedte);
    const tafel = $('tafel');
    tafel.style.zoom = String(zoom);
    tafel.style.width = `${window.innerWidth / zoom}px`;
    tafel.style.height = `${TAFEL_INSTELLINGEN.hoogte}px`;
    document.documentElement.style.setProperty('--tafel-zoom', String(zoom));
  }
  window.addEventListener('resize', pasSchaal);
  pasSchaal();
})(globalThis.Spel = globalThis.Spel || {});
