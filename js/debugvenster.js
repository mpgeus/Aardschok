// Het debugvenster (werklijst 169; Marcel, 15 okt: "misschien letter "D" en dan debug menu op laten komen. +50 voor
// bouwmaterialen etc.", en "dan kunnen we gewoon het daadwerkelijke groeien testen"), onder D bij het rondlopen (in een
// gevecht sluit D een deur, js/gevecht.js). Vier knoppen, elk met een regel die er al is: +50 stammen, planken, steen en
// goud (T.wijzigVoorraad), een gezin (T.gezinKomt, zoals op een groeidag: zonder plaats zegt het spel dat), de
// bouwplaatsen meteen af (T.proefdorp.bouwAf en T.komtKlaar, js/begin.js en js/gebouwen.js; wie erin trekt, volgt de
// nacht erna, zoals bij elk gebouw), en de marskramer nu (Spel.debug.marskramer, js/main.js). Sinds vraag 172 (16 okt)
// ook de spelregels en de werkbank, om midden in een spel te proberen: in het menu lees je ze alleen. Sinds 20 okt ook het
// slot van de demo aan of uit (het wachthuis en de wapenmaker; werklijst Q, vraag 181, e), en de maat van de gebouwen, om te
// kijken (werklijst R, vraag 183, 2a1). Zolang het open is, staat de tijd stil, zoals bij elk venster.
//
// Aan tot de Steam-versie (Marcel, 15 okt), ook in de proefversie voor een tester; voor Steam zet het verpakken `aan` op
// false (ontwerp/verpakken.md), en dan doet D bij het rondlopen niets.
(function (T) {
  'use strict';

  T.DEBUG_INSTELLINGEN = {
    aan: true, // false voor de Steam-versie
    erbij: 50, // zoveel van elk, per klik
    waren: ['hout', 'planken', 'steen', 'goud'],
    gebouwMaten: [1, 0.8, 0.65], // de proef van vraag 183, 2a1 (T.TEKENEN_INSTELLINGEN.gebouwMaat, js/tekenen.js)
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
      knop('marskramer', T.t('The merchant comes now')) +
      knop('slot', T.demoSlot() ? T.t('Demo lock on: {gebouwen}', { gebouwen: dichtNamen() }) : T.t('Demo lock off: {gebouwen}', { gebouwen: dichtNamen() })) +
      knop('maat', T.t('Buildings drawn at {p}% (a test)', { p: Math.round(T.TEKENEN_INSTELLINGEN.gebouwMaat * 100) })) +
      knop('regels', T.t('Game rules and the workbench')) +
      '</div>' +
      (gedaan ? `<p class="venster-staat">${gedaan}</p>` : '') +
      `<p class="venster-voet">${T.t('While this is open, time stands still. <kbd>Esc</kbd> or <kbd>D</kbd> closes it.')}</p>`
    );
  }

  // Wat in de demo op slot is (T.DEMO_INSTELLINGEN.dicht, js/einde.js), in woorden.
  const dichtNamen = () => T.opsomming(T.DEMO_INSTELLINGEN.dicht.map((soort) => T.GEBOUWEN[soort].naam));

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
      return T.t('The merchant is on his way.');
    }
    // Het slot van de demo aan of uit, om te proberen (werklijst Q, vraag 181, e; Marcel, 20 okt): in het bouwmenu op
    // slot, of te bouwen. Voor de demo gaat het debugvenster eruit (ontwerp/verpakken.md).
    if (actie === 'slot') {
      T.DEMO_INSTELLINGEN.slot = !T.demoSlot();
      return T.demoSlot() ? T.t('Locked, as in the demo.') : T.t('Unlocked, as in the full game.');
    }
    // De maat van de gebouwen, om te kijken (werklijst R, vraag 183, 2a1; Marcel, 20 okt): 100, 80 en 65 procent, alleen
    // voor het oog (tekenOpMaat in js/tekenen.js).
    if (actie === 'maat') {
      const maten = IN().gebouwMaten;
      const f = maten[(maten.indexOf(T.TEKENEN_INSTELLINGEN.gebouwMaat) + 1) % maten.length];
      T.TEKENEN_INSTELLINGEN.gebouwMaat = f;
      return T.t('Buildings are drawn at {p}%, only for the eye: the ground they stand on stays the same.', { p: Math.round(f * 100) });
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
    // De spelregels om te proberen, midden in het spel, met de werkbank (vraag 172, js/hud.js): een eigen venster.
    if (b.dataset.actie === 'regels') {
      T.ui.openSpelregels(S, 'debug');
      return;
    }
    gedaan = doe(S, b.dataset.actie);
    toon(S);
  });
})(globalThis.Spel = globalThis.Spel || {});
