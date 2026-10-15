// De balk onderaan (werklijst vraag 164; Marcel, 14 okt: "De oude ui balk aan de onderkant moet leeg. En we hebben een
// minimale nodig", en op drie vragen: kaartjes in de hoeken, de voorraad toont wat je hebt, en de velden, het wetboek, de
// raadsman, de lantaarn, de kaars en de tekeningen van de tafel eraf). Tot dan lag hier de tafel van de schout (vraag
// 146, c), met het rekenboek en de dingen erop; git bewaart haar.
//
// Onderaan kaartjes in de hoeken, even breed (--kaart in stijl.css): linksonder de voorraad (elke waar waarvan er iets
// is, met een pictogram en het getal), in het midden Build (B), en de brief, het rapport en de bode zolang ze er zijn,
// rechtsonder de minikaart (js/minikaart.js; vraag 165, "zoals bij age of Empires"). Bovenaan een dunne balk (vraag 166;
// Marcel: "Bovenaan een dunne ui balk met goud, aantal inwoners, happiness jaar en tijd", en "zo leeg mogelijk zonder
// info te missen"): het dorp (de kas, de inwoners, de tevredenheid), de datum en het uur, de snelheid, de twee bazen
// (js/bazen.js) en Menu. De velden (V), het wetboek (W), de raadsman (R), sluipen (S) en slapen (Z) hebben alleen nog hun
// toets. Wat een ding of getal is, wat het nu zegt en zijn toets, staat op het briefje bij de muis (#wenk), niet op het
// ding; zo ook het seizoen en het weer, bij de datum.
//
// Alle maten zijn pixels van de kunst: pasSchaal zet de zoom (--ui-zoom: op 1080 één, op 4K twee), en hoe hoog de
// kaartjes linksonder en rechtsonder zijn (--onder-links, --onder-rechts), zodat wat erboven ligt (de berichten, de
// meter) er niet over valt.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // De pictogrammen van de voorraad: klein, met de hand getekend, in de kleuren van stijl.css; op het papier in inkt
  // (stijl.css, #voorraad .icoon).
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
  // Van de wapenmaker (T.wapensInHetDorp, js/rovers.js): een zwaard, schuin, met een houten gevest.
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
  // De herberg (js/herberg.js): een aarden kan, met schuim, zoals de waard hem tapt.
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
  // Een maand zoals de speler hem ziet (js/tijd.js, T.MAANDEN[i].toon), uit de naam waar de regels op letten.
  const maandToon = (naam) => (T.MAANDEN.find((m) => m.naam === naam) || { toon: naam }).toon;
  const GRONDSTOF_UITLEG = {
    goud: T.t('Gold. What the lord likes best to see.'),
    graan: T.t('Grain. From the fields: food, seed grain, and rent at Martinmas.'),
    wol: T.t('Wool. From the sheep on the common.'),
    hout: T.t("Logs. From the lord's forest."),
    ijzer: T.t('Iron. From the merchant; the smithy makes tools from it.'),
    zout: T.t('Salt. From the merchant: it keeps fish and meat good.'),
    gereedschap: T.t('Tools. From the smithy: whoever has them works harder. They wear out.'),
    kaas: T.t('Cheese. From the milk the village does not drink the same day: cheese keeps well, and is only eaten when the grain runs out.'),
    hooi: T.t('Hay. Mown from the meadows in {maaien}: the livestock eat it from {van} to {tot}.', {
      maaien: maandToon('hooimaand'), van: maandToon('slachtmaand'), tot: maandToon('lentemaand'),
    }),
    mest: T.t('Dung. From the sheepfold: put it on a field in the fields window (V) and the field becomes more fertile.'),
    planken: T.t('Planks. The sawmill saws them from logs: a village is built of planks.'),
    steen: T.t('Stone. From the quarry.'),
    vlees: T.t('Meat. From the slaughter: it fills a stomach. What you do not salt spoils, so the village eats that first; salted meat keeps until the grain runs out.'),
    huiden: T.t('Hides. From the slaughter.'),
    bier: T.t('Ale. The innkeeper brews it from grain, and whoever sits in the inn in the evening drinks it. Whoever was there this week is more content.'),
    wapens: T.t('Weapons. From the weaponsmith: a militiaman who has one hits harder when the robbers come.'),
    wijn: T.t('Wine. From the vineyard farm, picked in {maand}: the craftsmen want it alongside their ale, and it does not spoil.', { maand: maandToon('wijnmaand') }),
  };
  // Het aantal mensen, en hoeveel woonruimte er is (js/gebouwen.js): dezelfde stijl als een
  // grondstof, maar met "/" in plaats van een los getal, dus geen eigen icoon uit GRONDSTOF_ICOON.
  const BEVOLKING_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<circle cx="9" cy="7" r="3" fill="#c9972f"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="none" stroke="#c9972f" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="17" cy="8.5" r="2.4" fill="#e2b64a"/><path d="M13.3 19c.3-2.7 2.2-4.8 4.7-4.8 2.6 0 4.7 2.3 5 5" fill="none" stroke="#e2b64a" stroke-width="1.4" stroke-linecap="round"/>' +
    '</svg>';
  // De tevredenheid van het dorp (js/behoeften.js): een gezichtje, in dezelfde stijl als hierboven.
  const TEVREDENHEID_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="8.6" fill="none" stroke="#e2b64a" stroke-width="1.5"/>' +
    '<circle cx="8.7" cy="10.2" r="1.1" fill="#e2b64a"/><circle cx="15.3" cy="10.2" r="1.1" fill="#e2b64a"/>' +
    '<path d="M8 14.6c1.1 1.3 2.5 1.9 4 1.9s2.9-.6 4-1.9" fill="none" stroke="#e2b64a" stroke-width="1.4" stroke-linecap="round"/>' +
    '</svg>';



  // Pictogrammen voor de waren van de ketens, in dezelfde stijl (vraag 164: de voorraad toont alles wat je hebt).
  const svg = (binnen) => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${binnen}</svg>`;
  const PLANKEN_ICOON = svg('<rect x="3" y="6" width="18" height="3.4" rx=".6" fill="#c89a5a" stroke="#8a5a2c" stroke-width="1"/>' +
    '<rect x="3" y="10.6" width="18" height="3.4" rx=".6" fill="#b88a4a" stroke="#8a5a2c" stroke-width="1"/>' +
    '<rect x="3" y="15.2" width="18" height="3.4" rx=".6" fill="#a87a3a" stroke="#8a5a2c" stroke-width="1"/>');
  const STEEN_ICOON = svg('<path d="M3 19l2.5-6 5-1.5 3 3.5-1 4z" fill="#9a958c" stroke="#6a655c" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M11.5 19l2-5.5 4.5-1.5 3 4-1 3z" fill="#aaa59c" stroke="#6a655c" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M7 11l2-5 5-1 2.5 4-3 3.5-4.5 0z" fill="#b5b0a6" stroke="#6a655c" stroke-width="1.1" stroke-linejoin="round"/>');
  const GROENTE_ICOON = svg('<circle cx="12" cy="13" r="7" fill="#86c46f" stroke="#4e7a3a" stroke-width="1.2"/>' +
    '<path d="M12 6.5c-2 2.5-2 9 0 13M12 6.5c2 2.5 2 9 0 13M6 11c3 1 9 1 12 0" fill="none" stroke="#4e7a3a" stroke-width="1"/>');
  const EIEREN_ICOON = svg('<ellipse cx="9" cy="13.5" rx="4.2" ry="5.4" fill="#efe6d2" stroke="#b5a78c" stroke-width="1.1"/>' +
    '<ellipse cx="15.5" cy="14.5" rx="4" ry="5.1" fill="#e9dcc0" stroke="#b5a78c" stroke-width="1.1"/>');
  const VIS_ICOON = svg('<path d="M3 12c3-4.5 9-5 13 0-4 5-10 4.5-13 0z" fill="#9fb4c8" stroke="#5a7088" stroke-width="1.1"/>' +
    '<path d="M16 12l5-4v8z" fill="#9fb4c8" stroke="#5a7088" stroke-width="1.1" stroke-linejoin="round"/><circle cx="7" cy="11.3" r=".9" fill="#2c1d12"/>');
  const BROOD_ICOON = svg('<path d="M3.5 16c0-5 3.8-8 8.5-8s8.5 3 8.5 8v1.5h-17z" fill="#d9a83c" stroke="#8a5a2c" stroke-width="1.1"/>' +
    '<path d="M8 10.5l1.5 3M12 9.5v3.5M16 10.5l-1.5 3" stroke="#8a5a2c" stroke-width="1" stroke-linecap="round"/>');
  const ZAK_ICOON = svg('<path d="M8 5h8l-1.5 3c4 1.5 5.5 5 5 9-.4 2.5-2.5 3.5-7.5 3.5S4.9 19.5 4.5 17c-.5-4 1-7.5 5-9z" fill="#e9e2d2" stroke="#b5a78c" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M9.5 8h5" stroke="#8a5a2c" stroke-width="1.3"/>');
  const RIET_ICOON = svg('<path d="M8 21L9 4M11 21l.5-18M14 21l-.5-17M17 21l-2-15" stroke="#c9b48c" stroke-width="1.3" stroke-linecap="round"/>' +
    '<path d="M8 14h9" stroke="#8a5a2c" stroke-width="1.8" stroke-linecap="round"/>');
  const TURF_ICOON = svg('<rect x="3.5" y="13" width="8" height="5.5" fill="#6a4a2c" stroke="#3a2414" stroke-width="1"/>' +
    '<rect x="12.5" y="13" width="8" height="5.5" fill="#5a3a22" stroke="#3a2414" stroke-width="1"/>' +
    '<rect x="8" y="7" width="8" height="5.5" fill="#7a5a3c" stroke="#3a2414" stroke-width="1"/>');
  const LAKEN_ICOON = svg('<path d="M4 8h16v3H4zM4 11h16v3H4zM4 14h16v3H4z" fill="#c9d6ea" stroke="#5a7088" stroke-width="1"/>' +
    '<path d="M20 8c1.5 1.5 1.5 7.5 0 9" fill="none" stroke="#5a7088" stroke-width="1"/>');
  const VATEN_ICOON = svg('<path d="M7 4h10c1.6 2.5 2.4 5.2 2.4 8s-.8 5.5-2.4 8H7c-1.6-2.5-2.4-5.2-2.4-8S5.4 6.5 7 4z" fill="#a87a3a" stroke="#6a4a2c" stroke-width="1.1"/>' +
    '<path d="M5 8.5h14M5 15.5h14" stroke="#3a2414" stroke-width="1.3"/>');
  const MELK_ICOON = svg('<path d="M8 4h7v3l2 3v9.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 19.5V10l2-3z" fill="#efe6d2" stroke="#b5a78c" stroke-width="1.1" stroke-linejoin="round"/>');
  const KLEI_ICOON = svg('<path d="M4 17c0-4 3-7 8-7s8 3 8 7c0 1.5-1 2-3 2H7c-2 0-3-.5-3-2z" fill="#b5653c" stroke="#7a3a1c" stroke-width="1.1"/>');
  Object.assign(GRONDSTOF_ICOON, {
    planken: PLANKEN_ICOON, steen: STEEN_ICOON, groente: GROENTE_ICOON, eieren: EIEREN_ICOON, vis: VIS_ICOON,
    brood: BROOD_ICOON, meel: ZAK_ICOON, kalk: ZAK_ICOON, riet: RIET_ICOON, turf: TURF_ICOON, laken: LAKEN_ICOON,
    vaten: VATEN_ICOON, melk: MELK_ICOON, klei: KLEI_ICOON, leer: GRONDSTOF_ICOON.huiden,
  });
  // De volgorde in de voorraad: eerst wat je bouwt, dan het eten, dan de rest; een waar die hier niet staat, komt
  // achteraan, met een zak als pictogram.
  const VOLGORDE = ['hout', 'planken', 'steen', 'graan', 'brood', 'meel', 'vlees', 'vis', 'kaas', 'groente', 'eieren',
    'wijn', 'bier', 'melk', 'hooi', 'wol', 'laken', 'huiden', 'leer', 'ijzer', 'gereedschap', 'wapens', 'zout', 'klei',
    'riet', 'turf', 'kalk', 'vaten', 'mest'];

  // ── De voorraad, linksonder, en het dorp in de balk bovenaan ──
  // Linksonder elke waar waarvan er minstens één is; bovenaan het dorp (de kas, de inwoners en de woonruimte, de
  // tevredenheid).
  // Elk getal is een post met een pictogram en het getal; de naam en wat het nu zegt, staan op het briefje bij de muis
  // (data-naam, data-uitleg). Een post blijft staan zolang zijn waar er is, zodat het briefje bij de muis blijft kloppen.
  const NAAM = { goud: T.t('Treasury'), bevolking: T.t('People'), tevredenheid: T.t('Content') };
  const naamVan = (wat) => NAAM[wat] || T.hoofdletter(T.waarNaam(wat));
  function post(box, wat, icoon) {
    let el = box.querySelector(`[data-wat="${wat}"]`);
    if (!el) {
      el = document.createElement('div');
      el.className = 'post'; // geen tekst
      el.dataset.wat = wat;
      el.dataset.naam = naamVan(wat);
      el.innerHTML = `<span class="icoon">${icoon || ZAK_ICOON}</span><span class="aantal"></span>`;
      box.appendChild(el);
    }
    return el;
  }
  const zet = (el, getal, uitleg) => {
    const tekst = String(getal);
    const aantal = el.querySelector('.aantal');
    if (aantal.textContent !== tekst) aantal.textContent = tekst;
    el.dataset.uitleg = uitleg || '';
  };

  // Het dorp staat in de balk bovenaan (vraag 166): de kas, de inwoners en de tevredenheid.
  function dorpPosten() {
    const box = $('bovenbalk').querySelector('.balk-dorp');
    if (!box.children.length) {
      post(box, 'goud', GOUD_ICOON);
      post(box, 'bevolking', BEVOLKING_ICOON);
      post(box, 'tevredenheid', TEVREDENHEID_ICOON);
    }
    return box;
  }

  // De twee bazen (js/bazen.js; werklijst vraag 106, d): de gunst van de heer en het vertrouwen van het dorp, in de balk
  // bovenaan naast de snelheid, rood als hij boos is, en bij de muis waarom. Zonder de spelregel "Twee bazen" staan ze er niet.
  T.ui.toonBazen = function (D) {
    const S = T.S;
    if (!S || D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const nu = T.bazenNu(D);
    $('bazen').classList.toggle('verborgen', !nu);
    if (!nu) return;
    for (const welk of ['gunst', 'vertrouwen']) {
      const el = $('bazen').querySelector(`[data-ding="${welk}"]`);
      const n = Math.round(nu[welk]);
      el.querySelector('.getal').textContent = String(n);
      el.classList.toggle('hoog', T.bazenStemming(n) === 'boos');
    }
  };

  T.ui.toonVoorraad = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const v = S.dorp.voorraad;
    zet(post(dorpPosten(), 'goud', GOUD_ICOON), Math.floor(v.goud || 0), GRONDSTOF_UITLEG.goud);
    // Wat het nu zegt, bij de muis: het zaaigraan, het zout, het gereedschap, de kaas, het hooi en het hout rekenen het
    // uit (hieronder); de rest zegt wat het is.
    const uitleg = { ...GRONDSTOF_UITLEG };
    const lager = new Set();
    const dag = S.kalender ? Math.floor(S.kalender.dag) : 0;
    // Het zaaigraan dat de boeren achterhouden (js/akkers.js, T.zaaigraanApart).
    const zaai = Math.min(Math.floor(v.graan || 0), Math.ceil(T.zaaigraanApart(S.dorp, dag)));
    if (zaai > 0) uitleg.graan += ` ${T.t('Of that, {n} is seed grain kept for spring: the village only eats it when nothing else is left.', { n: zaai })}`;
    // Hoeveel vis en vlees het zout goed houdt, en hoeveel handen het gereedschap dekt (js/behoeften.js, js/gebouwen.js).
    const zout = T.zoutDekking(S.dorp);
    if (zout.totaal >= 1) {
      uitleg.zout = T.t('Salt. One measure of salt preserves {n} fish or meat; the rest spoils. Salted now: {gezouten} of the {totaal}.', {
        n: T.BEHOEFTEN_INSTELLINGEN.zoutHoudtGoed, gezouten: Math.floor(zout.gezouten), totaal: Math.floor(zout.totaal),
      });
    }
    const gereedschap = T.gereedschapDekking(S.dorp);
    if (gereedschap.handen) {
      uitleg.gereedschap = T.t('Tools. Enough for {n} of the {handen} hands at work: work goes {procent}% faster. They wear out.', {
        n: Math.min(gereedschap.handen, Math.floor(gereedschap.heeft)), handen: gereedschap.handen, procent: Math.round((gereedschap.factor - 1) * 100),
      });
    }
    // Bij de kaas: voor hoeveel dagen eten hij is, en hoeveel melk de koeien nu geven (js/vee.js, T.melkVanDag), want
    // daar komt hij van. Beide in graan gerekend, zoals het dorp ze eet.
    const perMens = T.etenPerMens(S.dorp);
    if (perMens > 0) {
      const perDag = (S.dorp.bevolking || 0) * perMens;
      const kaas = v.kaas || 0;
      const dagen = perDag > 0 ? Math.floor(kaas / perDag) : 0;
      const voor = kaas >= 1 && perDag > 0 ? ` ${T.t('Enough for {n|# day|# days} of food.', { n: dagen })}` : '';
      const mensen = Math.round((S.kalender ? T.melkVanDag(S.dorp, dag) : 0) / perMens);
      const melk = mensen > 0 ? ` ${T.t('The cows now give milk for {n|# person|# people} every day; what the village does not drink becomes cheese.', { n: mensen })}` : '';
      uitleg.kaas = GRONDSTOF_UITLEG.kaas + voor + melk;
    }
    // Bij het hooi: hoe lang het de kudde van nu voedt (js/vee.js, T.hooiPerWinterdag), en hoeveel winter er nog is.
    // Buiten de winter telt ook het hooi dat nog op de weides staat (js/akkers.js, T.verwachtHooi). Haalt het de winter
    // niet, dan staat het getal in het rood.
    if (S.kalender) {
      const perDag = T.hooiPerWinterdag(S.dorp, dag);
      const winterNu = T.isVeeWinter(dag);
      const nogTeMaaien = winterNu ? 0 : T.verwachtHooi(S.dorp);
      const hooi = (v.hooi || 0) + nogTeMaaien;
      const winter = T.winterDagen(dag);
      const dagen = perDag > 0 ? Math.floor(hooi / perDag) : Infinity;
      const perDagTekst = Math.round(perDag * 10) / 10;
      let over = '';
      if (perDag > 0) {
        if (winterNu) {
          over = T.t('The herd eats {perDag} a day: enough for {n|# day|# days}, and winter lasts another {winter|# day|# days}.', { perDag: perDagTekst, n: dagen, winter });
        } else if (nogTeMaaien >= 1) {
          over = T.t('The herd as it is now eats {perDag} per winter day, counting the hay still standing in the meadows (about {erbij}): enough for {n} of the {winter} days of winter.',
            { perDag: perDagTekst, erbij: Math.round(nogTeMaaien), n: Math.min(dagen, winter), winter });
        } else {
          over = T.t('The herd as it is now eats {perDag} per winter day: enough for {n} of the {winter} days of winter.', { perDag: perDagTekst, n: Math.min(dagen, winter), winter });
        }
      }
      if (over) uitleg.hooi = `${GRONDSTOF_UITLEG.hooi} ${over}`;
      if (dagen < winter) lager.add('hooi');
    }
    // Bij het hout: voor hoeveel van de winterdagen het genoeg is, met wat er nu per dag bijkomt (js/behoeften.js,
    // T.houtVoorDeWinter). Haalt het de winter niet, dan staat het getal in het rood (Marcel, 27 sep, vraag 44).
    if (S.kalender && S.dorp.bevolking > 0) {
      const h = T.houtVoorDeWinter(S.dorp, dag);
      const perDag = (x) => String(Math.round(x * 100) / 100);
      const woorden = { stook: perDag(h.stook), erbij: perDag(h.erbij), dagen: h.dagen, winter: h.winter };
      const erbij = h.erbij > 0.005;
      const stookt = h.tot > 0
        ? (erbij ? T.t('In winter the village burns {stook} a day, and {erbij} a day comes in.', woorden) : T.t('In winter the village burns {stook} a day.', woorden))
        : (erbij ? T.t('The village burns {stook} a day, and {erbij} a day comes in.', woorden) : T.t('The village burns {stook} a day.', woorden));
      const genoeg = h.tot > 0
        ? (h.haalt ? T.t('That is enough for the whole winter.') : T.t('That is enough for {dagen} of the {winter} days of winter.', woorden))
        : (h.haalt ? T.t('That is enough for the rest of the winter.') : T.t('That is enough for {dagen|# day|# days}, and winter lasts another {winter|# day|# days}.', woorden));
      uitleg.hout = `${GRONDSTOF_UITLEG.hout} ${stookt} ${genoeg}`;
      if (!h.haalt) lager.add('hout');
    }
    // Wat je hebt: elke waar waarvan er minstens één is, in de volgorde van VOLGORDE (goud staat bij het dorp).
    const box = $('voorraad').querySelector('.voorraad-waren');
    const waren = Object.keys(v).filter((wat) => wat !== 'goud' && Math.floor(v[wat] || 0) >= 1)
      .sort((a, b) => (VOLGORDE.includes(a) ? VOLGORDE.indexOf(a) : 99) - (VOLGORDE.includes(b) ? VOLGORDE.indexOf(b) : 99));
    for (const el of [...box.children]) if (!waren.includes(el.dataset.wat)) el.remove();
    waren.forEach((wat, i) => {
      const el = post(box, wat, GRONDSTOF_ICOON[wat]);
      if (box.children[i] !== el) box.insertBefore(el, box.children[i]);
      zet(el, Math.floor(v[wat]), uitleg[wat] || `${naamVan(wat)}.`);
      el.classList.toggle('laag', lager.has(wat));
    });
    $('voorraad').classList.toggle('verborgen', !waren.length);
    // De twee bazen (js/bazen.js) staan in de balk bovenaan, ook meteen bij een nieuw of geladen spel.
    T.ui.toonBazen(D);
  };

  // Het aantal mensen en de woonruimte (js/gebouwen.js, T.werkGebouwenBij): een eigen functie, want die twee veranderen
  // niet via T.wijzigVoorraad en dus niet vanzelf mee met toonVoorraad.
  T.ui.toonBevolking = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    zet(post(dorpPosten(), 'bevolking', BEVOLKING_ICOON), `${Math.floor(S.dorp.bevolking)}/${Math.floor(S.dorp.woonruimte)}`,
      T.t('People in the village, and how many can live there: every house gives room.'));
  };

  // De tevredenheid (js/behoeften.js, T.tikBehoeftenDag) en, bij de muis, wat het dorp mist: dezelfde vraag als
  // T.ui.toonBevolking hierboven, met een eigen functie om dezelfde reden.
  T.ui.toonTevredenheid = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    T.ui.toonBazen(D);
    const B = S.dorp.behoeften;
    if (!B) return;
    const pct = Math.round(B.tevredenheid * 100);
    const last = B.last && B.last.length ? ` ${T.t('It suffers from {last}.', { last: T.opsomming(B.last) })}` : '';
    const blij = B.blij && B.blij.length ? ` ${T.t('It is pleased with {blij}.', { blij: T.opsomming(B.blij) })}` : '';
    // Met de wensen per huis (js/wensen.js): hoe tevreden elke stand is, en in hoeveel huizen iets gemist wordt.
    const st = B.standen;
    const perStand = st
      ? ` ${T.hoofdletter(T.opsomming(Object.keys(T.STANDEN).filter((s) => st[s])
        .map((s) => T.t('{stand} {procent}%', { stand: T.STANDEN[s].naam, procent: Math.round(st[s].tevredenheid * 100) }))))}.`
      : '';
    const gemist = B.gemist || [];
    const mist = B.mist.map((m) => {
      const g = gemist.find((x) => x.naam === m);
      return g ? T.t('{wat} ({n|# house|# houses})', { wat: m, n: g.huizen }) : m;
    });
    const kop = T.t('Contentment: {pct}%.', { pct });
    const el = post(dorpPosten(), 'tevredenheid', TEVREDENHEID_ICOON);
    zet(el, `${pct}%`, mist.length
      ? `${kop}${perStand} ${T.t('The village is short of {mist}.', { mist: T.opsomming(mist) })}${last}${blij}`
      : `${kop}${perStand} ${T.t('The village has what it needs.')}${last}${blij}`);
    el.classList.toggle('laag', B.tevredenheid < T.BEHOEFTEN_INSTELLINGEN.vertrekDrempel);
  };

  // ── De dingen ──
  // Wat elk ding is (naam), wat het nu zegt (uitleg, uit de regels) en zijn toets, voor het briefje bij de muis. Wat een
  // ding doet als je erop klikt, doet de knop die het was (zijn id: js/hud.js, js/brieven.js).
  const DINGEN = {
    voorraad: { naam: T.t('Stores'), uitleg: () => T.t('What the village has. Point at a number to see what it says.') },
    bouwen: {
      naam: T.t('Build'),
      uitleg: () => `${T.t('Build: choose what, and point to where.')} ${T.t('A right click puts back what you are holding.')}`,
      toets: 'B',
    },
    brief: { naam: T.t('A letter from the lord'), uitleg: () => T.t('It is waiting for your answer.') },
    rapport: { naam: T.t('The morning report'), uitleg: () => T.t('From your advisor, this morning. You have not read it yet.') },
    bode: {
      naam: T.t('A messenger'),
      uitleg: (S) => {
        const k = T.kanBodeSturen(S.dorp);
        return `${T.t('A messenger to the merchant, in hard times: you write what you want and choose who goes along.')}${k.kan ? '' : ` ${k.reden}`}`;
      },
    },
    gunst: { naam: T.t("The lord's favour"), uitleg: (S) => T.bazenTekst(S.dorp, 'gunst') },
    vertrouwen: { naam: T.t("The village's trust"), uitleg: (S) => T.bazenTekst(S.dorp, 'vertrouwen') },
    // Bovenaan (vraag 146, d): het lipje Menu en de datum, met het weer.
    menu: {
      naam: T.t('The menu'),
      uitleg: () => T.t('Save, load, the game rules, photo mode, and back to the title screen.'),
      toets: T.t('Esc (O for the game rules, H for photo mode)'),
    },
    // De datum in de balk: het seizoen en het weer van vandaag staan hier, bij de muis (vraag 166).
    datum: {
      naam: T.t('Today'),
      uitleg: (S) => {
        const seizoen = T.hoofdletter(T.SEIZOEN_TOON[T.datumVanDag(S.kalender.dag).seizoen]);
        const W = S.dorp && T.weerVan(S.dorp);
        if (!W) return `${seizoen}.`;
        const droog = W.droog <= 0 ? T.t('It is raining today.')
          : W.droog === 1 ? T.t('It has not rained since yesterday.') : T.t('It has not rained for {n} days.', { n: T.telwoord(W.droog) });
        return `${seizoen}, ${T.WEER_NAMEN[W.vandaag]}. ${droog}`;
      },
    },
  };

  // Wat in index.html geen tekst heeft (vraag 147): de knoppen in het midden, de bazen en de lat van de snelheden. De
  // tekst staat hier, zodat een vertaling erbij kan.
  const KNOPPEN = { bouwen: T.t('Build'), brief: T.t('Letter'), rapport: T.t('Report'), bode: T.t('Messenger') };
  for (const b of document.querySelectorAll('#middenonder [data-ding]')) b.textContent = KNOPPEN[b.dataset.ding];
  $('bazen').querySelector('[data-ding="gunst"] .naam').textContent = T.t('Lord'); // geen tekst
  $('bazen').querySelector('[data-ding="vertrouwen"] .naam').textContent = T.t('Village'); // geen tekst
  const SNELHEDEN = {
    0: { tekst: T.t('pause'), naam: T.t('Paused'), uitleg: T.t('Time stands still.') },
    1: { tekst: '1×', naam: T.t('Normal'), uitleg: T.t('A day lasts five minutes.') },
    3: { tekst: '3×', naam: T.t('Three times as fast'), uitleg: T.t('A year lasts ten hours.') },
    10: { tekst: '10×', naam: T.t('Ten times as fast'), uitleg: T.t('A year lasts three hours.') },
    30: { tekst: '30×', naam: T.t('Thirty times as fast'), uitleg: T.t('A year lasts an hour.') },
  };
  $('kalender-knoppen').setAttribute('aria-label', T.t('How fast time goes'));
  for (const b of document.querySelectorAll('#kalender-knoppen button')) {
    const s = SNELHEDEN[b.dataset.snelheid];
    b.textContent = s.tekst;
    b.dataset.naam = s.naam;
    b.dataset.uitleg = s.uitleg;
  }

  // Wat met de tijd verandert: de lat (de snelheid van nu). Vanuit T.ui.toonKalender, elk half uur en als de snelheid
  // verandert.
  T.ui.werkBalkBij = function (S) {
    for (const b of document.querySelectorAll('#kalender-knoppen button')) {
      b.classList.toggle('actief', Number(b.dataset.snelheid) === T.snelheidNu(S));
    }
  };

  // ── Het briefje bij de muis ──
  // Op papier bij het ding dat de muis aanwijst: zijn naam, wat het nu zegt, en de toets. Bij wat onderaan ligt erboven
  // (bij een getal uit de voorraad boven het kaartje), bij wat bovenaan ligt (het menu, de datum, een status; vraag 146,
  // d) eronder. Het schaalt mee met de rest (--ui-zoom), dus de plek is schermpixels gedeeld door de zoom.
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
    const onder = !!el.closest('.hoek-onder');
    const r = el.getBoundingClientRect();
    const boven = (el.closest('#voorraad') ? $('voorraad') : el).getBoundingClientRect().top;
    const breed = box.offsetWidth * zoom;
    const hoog = box.offsetHeight * zoom;
    const links = Math.max(8, Math.min(window.innerWidth - breed - 8, (r.left + r.right) / 2 - breed / 2));
    box.style.left = `${links / zoom}px`;
    box.style.top = `${(onder ? boven - hoog - 10 : r.bottom + 10) / zoom}px`;
  }

  function verbergWenk() {
    $('wenk').classList.add('verborgen');
  }

  // "P, and - and +" wordt "or press P, and - and +", met elke toets in een toetsje.
  function toetsTekst(toets) {
    return T.t('or press {toets}', { toets: toets.replace(/(^|[ ,(])([A-Z]|Esc|-|\+)(?=$|[ ,)])/g, (_, voor, k) => `${voor}<kbd>${k}</kbd>`) });
  }

  const AANWIJSBAAR = '[data-ding], .post, #kalender-knoppen button, #statussen .status'; // geen tekst
  for (const plek of document.querySelectorAll('.hoek-onder, #hud-gehucht')) {
    plek.addEventListener('mouseover', (ev) => {
      const el = ev.target.closest(AANWIJSBAAR);
      if (el) toonWenk(el);
    });
    plek.addEventListener('mouseout', (ev) => {
      const el = ev.target.closest(AANWIJSBAAR);
      if (el && !el.contains(ev.relatedTarget)) verbergWenk();
    });
  }

  // ── De minikaart, in de hoek rechtsonder (js/minikaart.js; vraag 165) ──
  // Het hele eiland als een ruit die ligt zoals het beeld: het beeld van het eiland (T.maakMinikaart, in stukjes van een
  // paar ms per beeld; de zee vervaagt naar doorzichtig, dus er blijft een eiland over en geen ruit), daarover een donkere
  // tint over wat je niet kent (T.minikaartGekend, opnieuw als de mist verandert, T.mistVersie), je gebouwen, de schout,
  // de plekken die je kent (het kasteel, de stad, de dorpen), en het kader waar de camera kijkt. Een klik of slepen kijkt daar (T.kijkNaar, js/main.js: het overzicht, Tab).
  const MINI = {
    alle: 0.1, // zo vaak (seconden) wordt de ruit opnieuw getekend
  };
  // De breedte van de ruit in pixels van de kunst: die van het kaartje (--kaart, stijl.css), want er is geen rand omheen.
  const miniBreed = () => $('minikaart').querySelector('canvas').clientWidth || 380;
  const mini = { E: null, w: null, beeld: null, mist: null, omtrek: null, klaar: -1, versie: -1, getekend: -Infinity, slepen: false };
  const nieuwDoek = (n) => Object.assign(document.createElement('canvas'), { width: n, height: n });

  T.ui.werkMinikaartBij = function (S) {
    const box = $('minikaart');
    const w = S.wereld;
    const aan = !!w && T.opEiland(w) && !!S.dorp;
    box.classList.toggle('verborgen', !aan);
    if (!aan) return;
    const IN = T.MINIKAART_INSTELLINGEN;
    const E = T.eilandVan(w.eiland.zaad);
    const m = T.minikaartBeeld(E);
    if (mini.E !== E) Object.assign(mini, { E, beeld: nieuwDoek(m.n), mist: nieuwDoek(m.n), omtrek: null, klaar: -1, versie: -1 });
    // Het beeld verder maken, zolang het niet af is: zo lang per beeld van het spel.
    const t0 = performance.now();
    while (m.klaar < m.n && performance.now() - t0 < IN.msPerBeeld) T.maakMinikaart(E, IN.rijenPerKeer);
    if (mini.klaar !== m.klaar) {
      mini.beeld.getContext('2d').putImageData(new ImageData(m.rgba, m.n, m.n), 0, 0);
      mini.klaar = m.klaar;
    }
    // Wat je niet kent, donker; alleen als de mist veranderde (of de kaart).
    if (mini.w !== w || mini.versie !== T.mistVersie(w)) {
      mini.w = w;
      mini.versie = T.mistVersie(w);
      const gekend = T.minikaartGekend(w);
      const rgba = new Uint8ClampedArray(m.n * m.n * 4);
      const a = Math.round(255 * IN.onbekend);
      for (let i = 0; i < gekend.length; i++) {
        if (gekend[i]) continue;
        rgba[i * 4] = IN.nevel[0];
        rgba[i * 4 + 1] = IN.nevel[1];
        rgba[i * 4 + 2] = IN.nevel[2];
        rgba[i * 4 + 3] = a;
      }
      mini.mist.getContext('2d').putImageData(new ImageData(rgba, m.n, m.n), 0, 0);
      mini.getekend = -Infinity;
    }
    if (S.tijd - mini.getekend < MINI.alle) return;
    mini.getekend = S.tijd;
    tekenMinikaart(S, w, E, m.n);
  };

  function tekenMinikaart(S, w, E, n) {
    const doek = $('minikaart').querySelector('canvas');
    const B = miniBreed();
    const H = B / 2;
    // Op ware pixels: de ruit is B pixels van de kunst breed, en die zijn zoom maal dpr pixels van het scherm.
    const k = zoom * (window.devicePixelRatio || 1);
    const pb = Math.round(B * k);
    const ph = Math.round(H * k);
    if (doek.width !== pb || doek.height !== ph) Object.assign(doek, { width: pb, height: ph });
    const c = doek.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, pb, ph);
    c.imageSmoothingEnabled = false;
    // Een pixel van het beeld is vak (i, j), de tegels i * stap tot (i + 1) * stap: zo ligt het als het beeld.
    const s = (B / (2 * T.EILAND_INSTELLINGEN.maat)) * T.MINIKAART_INSTELLINGEN.stap * k;
    const ligt = [s, s / 2, -s, s / 2, (B / 2) * k, 0];
    c.setTransform(...ligt);
    c.drawImage(mini.beeld, 0, 0);
    // Het donker over wat je niet kent, alleen waar het eiland is (niet waar de zee al doorzichtig is).
    c.globalCompositeOperation = 'source-atop';
    c.drawImage(mini.mist, 0, 0);
    c.globalCompositeOperation = 'source-over';
    // De lijn om het eiland (één keer per maat uitgerekend, want de vorm verandert niet; pas als het beeld af is).
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (mini.klaar >= n) c.drawImage(omtrekVan(pb, ph, ligt, k), 0, 0);
    c.setTransform(k, 0, 0, k, 0, 0);
    const stip = (x, y, maat, kleur) => {
      const p = T.minikaartPunt(x, y, B);
      c.fillStyle = kleur;
      c.fillRect(Math.round(p.x * k - (maat * k) / 2) / k, Math.round(p.y * k - (maat * k) / 2) / k, maat, maat);
    };
    // De plekken die je kent (het kasteel, de stad, de dorpen), dan je gebouwen, en de schout.
    for (const p of E.plekken || []) if (T.kentTegel(w, p.x, p.y)) stip(p.x, p.y, 4, '#2c1d12');
    for (const g of S.dorp.gebouwen) {
      const r = T.voetVanGebouw(g);
      stip(r.x + r.b / 2, r.y + r.h / 2, 2, '#f3e3b8');
    }
    if (S.schout) stip(S.schout.x, S.schout.y, 3, '#c0392b');
    // Het kader: wat de camera nu ziet (T.tekenMaat, gedeeld door de zoom van het beeld), in pixels van de wereld.
    const maat = T.tekenMaat();
    const midden = T.naarWereld(S.camera.x, S.camera.y);
    const p = T.minikaartPunt(midden.x, midden.y, B);
    const f = B / (2 * T.EILAND_INSTELLINGEN.maat) / T.HB; // van pixels van de wereld naar pixels van de minikaart
    const kb = (maat.b / S.zoom) * f;
    const kh = (maat.h / S.zoom) * f;
    c.strokeStyle = '#f3e3b8';
    c.lineWidth = 1 / k;
    c.strokeRect(p.x - kb / 2, p.y - kh / 2, kb, kh);
  }

  // De lijn om het eiland, op de maat van het doek (pb bij ph, de ruit gelegd met `ligt`): de rand van wat binnen de lijn
  // ligt (m.binnen, js/minikaart.js), een pixel van de kunst breed (`k` pixels van het scherm). Uit een doek dat alleen uit
  // ImageData komt (geen plaatje), dus het lezen ervan werkt ook vanaf file://.
  function omtrekVan(pb, ph, ligt, k) {
    const o = mini.omtrek;
    if (o && o.width === pb && o.height === ph) return o;
    const IN = T.MINIKAART_INSTELLINGEN;
    const m = T.minikaartBeeld(mini.E);
    const masker = new ImageData(m.n, m.n);
    for (let i = 0; i < m.n * m.n; i++) masker.data[i * 4 + 3] = m.binnen[i] ? 255 : 0;
    const bron = nieuwDoek(m.n);
    bron.getContext('2d').putImageData(masker, 0, 0);
    const vorm = Object.assign(document.createElement('canvas'), { width: pb, height: ph });
    const v = vorm.getContext('2d');
    v.setTransform(...ligt);
    v.drawImage(bron, 0, 0);
    const a = v.getImageData(0, 0, pb, ph).data;
    const binnen = (x, y) => x >= 0 && y >= 0 && x < pb && y < ph && a[(y * pb + x) * 4 + 3] >= 128;
    const dik = Math.max(1, Math.round(k));
    const uit = new ImageData(pb, ph);
    const [r, g, b, alfa] = IN.omtrek;
    for (let y = 0; y < ph; y++) {
      for (let x = 0; x < pb; x++) {
        if (!binnen(x, y)) continue;
        // op de rand: binnen, met een buur (zo ver als de lijn dik is) buiten
        let rand = false;
        for (let d = 1; d <= dik && !rand; d++) rand = !binnen(x - d, y) || !binnen(x + d, y) || !binnen(x, y - d) || !binnen(x, y + d);
        if (!rand) continue;
        const p = (y * pb + x) * 4;
        uit.data[p] = r;
        uit.data[p + 1] = g;
        uit.data[p + 2] = b;
        uit.data[p + 3] = Math.round(255 * alfa);
      }
    }
    const lijn = Object.assign(document.createElement('canvas'), { width: pb, height: ph });
    lijn.getContext('2d').putImageData(uit, 0, 0);
    mini.omtrek = lijn;
    return lijn;
  }

  // Een klik of slepen op de minikaart: kijk daar (het overzicht, js/main.js).
  function kijkOpMinikaart(ev) {
    const r = ev.currentTarget.getBoundingClientRect();
    const B = miniBreed();
    const t = T.minikaartTegel(((ev.clientX - r.left) / r.width) * B, ((ev.clientY - r.top) / r.height) * (B / 2), B);
    const p = T.naarScherm(t.x, t.y);
    T.kijkNaar(p.x, p.y);
    mini.getekend = -Infinity;
  }
  const miniDoek = $('minikaart').querySelector('canvas');
  miniDoek.addEventListener('mousedown', (ev) => {
    if (ev.button !== 0) return;
    mini.slepen = true;
    kijkOpMinikaart(ev);
  });
  miniDoek.addEventListener('mousemove', (ev) => {
    if (mini.slepen) kijkOpMinikaart(ev);
  });
  window.addEventListener('mouseup', () => {
    mini.slepen = false;
  });

  // ── De schaal ──
  // Een pixel van de kunst is een hele pixel van het scherm: op 1080 één, op 4K twee, ook met de schaal van Windows
  // ertussen (150% op een scherm van 1080 is een zoom van 2/3, en elke pixel van de kunst weer één van het scherm). Is
  // het scherm smaller dan minsteBreedte pixels van de kunst, dan wordt alles zo klein dat het past, niet meer op ware
  // pixels. De zoom staat in --ui-zoom, voor alles bovenaan en onderaan (stijl.css).
  const BALK_INSTELLINGEN = {
    minsteBreedte: 1800, // zoveel pixels van de kunst is het scherm minstens breed (zoals de tafel van ervoor)
  };
  let zoom = 1;
  function pasSchaal() {
    const dpr = window.devicePixelRatio || 1;
    const n = Math.max(1, Math.round((window.innerHeight * dpr) / 1080));
    zoom = Math.min(n / dpr, window.innerWidth / BALK_INSTELLINGEN.minsteBreedte);
    document.documentElement.style.setProperty('--ui-zoom', String(zoom));
  }
  window.addEventListener('resize', pasSchaal);
  pasSchaal();
  // Hoe hoog de hoeken onderaan zijn, in pixels van de kunst, voor wat erboven ligt: de berichten boven de voorraad, de
  // meter en "opgeslagen" boven de minikaart (stijl.css, --onder-links en --onder-rechts).
  const hoogte = new ResizeObserver(() => {
    for (const [id, naam] of [['linksonder', '--onder-links'], ['rechtsonder', '--onder-rechts']]) {
      document.documentElement.style.setProperty(naam, `${Math.ceil($(id).getBoundingClientRect().height / zoom) + 12}px`);
    }
  });
  hoogte.observe($('linksonder'));
  hoogte.observe($('rechtsonder'));
})(globalThis.Spel = globalThis.Spel || {});
