// Het debugvenster (werklijst 169; Marcel, 15 okt: "misschien letter "D" en dan debug menu op laten komen. +50 voor
// bouwmaterialen etc.", en "dan kunnen we gewoon het daadwerkelijke groeien testen"), onder D bij het rondlopen (in een
// gevecht sluit D een deur, js/gevecht.js). Vier knoppen, elk met een regel die er al is: +50 stammen, planken, steen en
// goud (T.wijzigVoorraad), een gezin (T.gezinKomt, zoals op een groeidag: zonder plaats zegt het spel dat), de
// bouwplaatsen meteen af (T.proefdorp.bouwAf en T.komtKlaar, js/begin.js en js/gebouwen.js; wie erin trekt, volgt de
// nacht erna, zoals bij elk gebouw), en de marskramer nu (Spel.debug.marskramer, js/main.js). Zolang het open is, staat
// de tijd stil, zoals bij elk venster.
//
// Aan tot de Steam-versie (Marcel, 15 okt), ook in de proefversie voor een tester; voor Steam zet het verpakken `aan` op
// false (ontwerp/verpakken.md), en dan doet D bij het rondlopen niets.
(function (T) {
  'use strict';

  T.DEBUG_INSTELLINGEN = {
    aan: true, // false voor de Steam-versie
    erbij: 50, // zoveel van elk, per klik
    waren: ['hout', 'planken', 'steen', 'goud'],
  };
  const IN = () => T.DEBUG_INSTELLINGEN;
  if (!IN().aan) return;

  const $ = (id) => document.getElementById(id);
  let gedaan = ''; // wat de laatste klik deed, onder de knoppen (alleen scherm)

  function inhoud(S) {
    const dag = S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '';
    const knop = (actie, tekst) => `<button class="db-knop" data-actie="${actie}">${tekst}</button>`;
    const waren = T.opsomming(IN().waren.map((wat) => T.waarNaam(wat)));
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('Debug')}</span><span class="venster-wanneer">${dag}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<p class="venster-staat">${T.t('For testing, until the Steam version.')}</p>` +
      '<div class="db-knoppen">' +
      knop('erbij', T.t('+{n} each of {waren}', { n: IN().erbij, waren })) +
      knop('gezin', T.t('A family comes')) +
      knop('af', T.t('Finish all building sites')) +
      knop('marskramer', T.t('The peddler comes now')) +
      '</div>' +
      (gedaan ? `<p class="venster-staat">${gedaan}</p>` : '') +
      `<p class="venster-voet">${T.t('While this is open, time stands still. <kbd>Esc</kbd> or <kbd>D</kbd> closes it.')}</p>`
    );
  }

  function toon(S) {
    $('debug').innerHTML = inhoud(S);
  }

  // Wat een knop doet, en wat er dan onder de knoppen staat.
  function doe(S, actie) {
    const D = S.dorp;
    const dag = Math.floor(S.kalender.dag);
    if (actie === 'erbij') {
      for (const wat of IN().waren) T.wijzigVoorraad(D, wat, IN().erbij);
      return T.t('Added.');
    }
    if (actie === 'gezin') {
      const plaats = T.plaatsVoorEenGezin(D);
      T.gezinKomt(D); // zonder plaats zegt het spel dat zelf, zoals op een groeidag
      return plaats ? T.t('A family is on its way, over the road.') : T.t('There is no room: build a hut or a house first.');
    }
    if (actie === 'af') {
      const plaatsen = D.gebouwen.filter((g) => g.bouw && !g.klaar);
      for (const g of plaatsen) {
        T.proefdorp.bouwAf(D, g, dag);
        T.komtKlaar(D, g, dag);
      }
      return T.t('{n|# building site is|# building sites are} finished; who moves in, comes tonight.', { n: plaatsen.length });
    }
    if (actie === 'marskramer') {
      T.debug.marskramer();
      return T.t('The peddler is on his way.');
    }
    return '';
  }

  // Openen en sluiten zoals elk venster (js/ui.js, T.ui.openVenster).
  T.ui.openDebug = function (S) {
    gedaan = '';
    if (T.ui.openVenster(S, 'debug')) toon(S);
  };

  T.ui.sluitDebug = function (S) {
    T.ui.sluitVenster(S, 'debug');
  };

  T.ui.meldVenster('debug', {
    el: 'debug', toets: 'd', open: (S) => T.ui.openDebug(S), sluit: (S) => T.ui.sluitDebug(S),
  });

  $('debug').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitDebug(S);
      return;
    }
    gedaan = doe(S, b.dataset.actie);
    toon(S);
  });
})(globalThis.Spel = globalThis.Spel || {});
