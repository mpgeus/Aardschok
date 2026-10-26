// Het debugvenster (werklijst 169; Marcel, 15 okt: "misschien letter "D" en dan debug menu op laten komen. +50 voor
// bouwmaterialen etc.", en "dan kunnen we gewoon het daadwerkelijke groeien testen"), onder D bij het rondlopen (in een
// gevecht sluit D een deur, js/gevecht.js). Sinds 23 okt met tabbladen, en alles om te testen is een knop (Marcel: "Ik kan
// al die losse dingen niet onthouden"): Village, Time, The lord, Danger, Demo en Look. Elke knop doet een regel die er
// al is (T.wijzigVoorraad, T.gezinKomt, T.heerKomt, ...), of een Spel.debug-opdracht uit js/main.js; bovenaan een
// tabblad staat hoe het ervoor staat, wat je anders in de console vroeg. Wat alleen voor het meten en de overzichten van
// Claude is (Spel.debug.meet, .paden, .vellen, ...), blijft in de console (ontwerp/gereedschap.md). Zolang het venster
// open is, staat de tijd stil, zoals bij elk venster.
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
    vee: 4, // zoveel koeien of schapen per klik
    gezin: 4, // zoveel trekken er weg
    rovers: 3, // zoveel rovers bij "Robbers now"
    uren: { ochtend: 8, avond: 20, nacht: 2 }, // de uren van de knoppen in Time
    dagen: [1, 10], // zoveel dagen verder per knop
  };
  const IN = () => T.DEBUG_INSTELLINGEN;
  if (!IN().aan) return;

  const $ = (id) => document.getElementById(id);
  // Wat de laatste klik deed, onder de knoppen, en het tabblad dat open is (alleen scherm: het venster opent weer daar).
  let gedaan = '';
  let tab = 'dorp';

  const dagNu = (S) => Math.floor(S.kalender.dag);
  // De datum en het uur op de klok (20:00), want het spel zegt het uur op twaalf ("eight o'clock", T.uurTekst).
  const klok = (dag) => {
    const u = T.uurVanDag(dag);
    return `${T.datumVanDag(dag).tekst}, ${Math.floor(u)}:${String(Math.floor((u % 1) * 60)).padStart(2, '0')}`; // geen tekst
  };
  // Het demojaar (levels/demojaar.js): wat er op slot is, in woorden, en zijn overval.
  const DEMO = () => T.LEVELS.demojaar;
  const demoDicht = () => DEMO().dorpen[0].dicht;
  const dichtNamen = () => T.opsomming(demoDicht().map((soort) => T.GEBOUWEN[soort].naam));
  const opSlot = (D) => demoDicht().some((soort) => T.isDicht(D, soort)); // een spel van vóór 24 okt heeft geen D.dicht
  const overvalVan = (triggers) => (triggers || []).find((t) => t.id === 'overval') || null;
  // De overval van de demo morgen (Danger): dezelfde als in het demojaar, met het bericht vooraf (T.roversKomen,
  // js/rovers.js). In het demojaar gaat zijn trigger dan uit, zodat hij niet nog eens komt. Niet als er al rovers op de kaart
  // zijn. Geeft of het lukte.
  function overvalMorgen(S, D) {
    const R = D.rovers || (D.rovers = T.nieuweRovers());
    if (R.aanval && R.aanval.fase !== 'wacht') return false;
    R.aanval = null;
    if (!T.roversKomen(D, overvalVan(DEMO().triggers).dan[0].rovers)) return false;
    const t = overvalVan(S.scenario && S.scenario.triggers);
    if (t) t.aan = false;
    return true;
  }

  // Springen in de tijd. De nachten ertussen tellen (T.werkGebouwenBij doet elke dag die voorbij is apart: wat de gebouwen
  // maken, wat het dorp eet, de brieven van de heer), maar overdag loopt er niemand: dragen, bouwen en oogsten wachten.
  function spring(S, dag) {
    S.kalender.dag = dag;
    T.ui.toonKalender(S);
    return T.t('It is now {wanneer}.', { wanneer: klok(dag) });
  }
  // Het eerstvolgende uur `u`: vandaag als het nog komt, anders morgen.
  function naarUur(S, u) {
    const nu = S.kalender.dag;
    const dag = Math.floor(nu) + u / 24;
    return spring(S, dag > nu ? dag : dag + 1);
  }
  // De ochtend van de dag vóór het eerstvolgende Sint-Maarten (is die al voorbij, dan die van volgend jaar).
  function naarSintMaarten(S) {
    for (let dag = dagNu(S) + 1; ; dag++) {
      const naar = dag - 1 + IN().uren.ochtend / 24;
      if (T.datumVanDag(dag).sintMaarten && naar > S.kalender.dag) return spring(S, naar);
    }
  }

  // Een nieuw spel op het land van nu, met een level (het demojaar, of de proef met een rand) of als vol spel (Demo): zoals
  // New game in het menu (js/menu.js), met het voorstel voor de naam en de brief van de heer. Het geldt voor dit spel; wat
  // New game in het menu begint, zegt T.DEMO_INSTELLINGEN.aan.
  function nieuwSpel(S, level) {
    T.ui.sluitDebug(S);
    T.nieuwSpel(S.wereld && S.wereld.maker ? S.wereld.maker.zaad : undefined, level);
    T.zetDorpsnaam(S.dorp, T.voorgesteldeDorpsnaam(S.dorp.lot && S.dorp.lot.zaad));
    T.ui.toonBrief(S.dorp, 'benoeming');
  }

  // De tabbladen. Elke knop: { id, tekst, doe(S, D, dag) → wat er onder de knoppen komt }; `staat(S, D)` geeft de regels
  // bovenaan het tabblad.
  const TABS = () => [
    {
      id: 'dorp',
      naam: T.t('Village'),
      knoppen: [
        { id: 'erbij', tekst: () => T.t('+{n} each of {waren}', { n: IN().erbij, waren: T.opsomming(IN().waren.map((wat) => T.waarNaam(wat))) }),
          doe: (S, D) => {
            for (const wat of IN().waren) T.wijzigVoorraad(D, wat, IN().erbij);
            return T.t('Added.');
          } },
        { id: 'gezin', tekst: () => T.t('A family comes'),
          doe: (S, D) => {
            const plaats = T.plaatsVoorEenGezin(D);
            T.gezinKomt(D); // zonder plaats zegt het spel dat zelf, zoals op een groeidag
            return plaats ? T.t('A family is on its way, over the road.') : T.t('There is no room: build a hut or a house first.');
          } },
        { id: 'weg', tekst: () => T.t('{n} people move away', { n: IN().gezin }),
          doe: (S, D) => {
            const weg = -T.wijzigBevolking(D, -IN().gezin, 'vertrek', T.t('the debug window sent them'));
            T.ui.toonBevolking(D);
            return T.t('{n|# person moves|# people move} away.', { n: weg });
          } },
        { id: 'af', tekst: () => T.t('Finish all building sites'),
          doe: (S, D, dag) => {
            const plaatsen = D.gebouwen.filter((g) => g.bouw && !g.klaar);
            for (const g of plaatsen) {
              T.proefdorp.bouwAf(D, g, dag);
              T.komtKlaar(D, g, dag);
            }
            return T.t('{n|# building site is|# building sites are} finished; who moves in, comes tonight.', { n: plaatsen.length });
          } },
        { id: 'trede', tekst: (S, D) => (T.volgendeTrede(D) ? T.t('Becomes {trede} now', { trede: T.tredeDoelNaam(T.volgendeTrede(D)) }) : T.t('There is no next standing')),
          doe: (S, D) => {
            const trede = T.volgendeTrede(D);
            if (!trede) return T.t('There is no next standing.');
            T.wordtTrede(D, trede);
            return T.t('Done: the lord writes.');
          } },
        { id: 'koeien', tekst: () => T.t('{n} cows', { n: IN().vee }),
          doe: () => {
            T.debug.vee('koe', IN().vee);
            return T.t('The cows stand on the meadow with the most room, or near the commander.');
          } },
        { id: 'schapen', tekst: () => T.t('{n} sheep', { n: IN().vee }),
          doe: () => {
            T.debug.vee('schaap', IN().vee);
            return T.t('The sheep stand on the heath or a meadow, or near the commander.');
          } },
        { id: 'marskramer', tekst: () => T.t('The merchant comes now'),
          doe: () => {
            T.debug.marskramer();
            return T.t('The merchant is on his way.');
          } },
      ],
    },
    {
      id: 'tijd',
      naam: T.t('Time'),
      staat: () => [T.t('The nights in between count (what buildings make, what people eat, the letters of the lord), but nobody walks: carrying, building and reaping wait.')],
      knoppen: [
        { id: 'ochtend', tekst: () => T.t('To the morning ({uur}:00)', { uur: IN().uren.ochtend }), doe: (S) => naarUur(S, IN().uren.ochtend) },
        { id: 'avond', tekst: () => T.t('To the evening ({uur}:00)', { uur: IN().uren.avond }), doe: (S) => naarUur(S, IN().uren.avond) },
        { id: 'nacht', tekst: () => T.t('To the night ({uur}:00)', { uur: IN().uren.nacht }), doe: (S) => naarUur(S, IN().uren.nacht) },
        ...IN().dagen.map((n) => ({ id: `dagen${n}`, tekst: () => T.t('{n|# day|# days} on', { n }), doe: (S) => spring(S, S.kalender.dag + n) })),
        { id: 'sintmaarten', tekst: () => T.t('To the day before Martinmas'), doe: (S) => naarSintMaarten(S) },
      ],
    },
    {
      id: 'heer',
      naam: T.t('The lord'),
      knoppen: [
        { id: 'heer', tekst: () => T.t('The lord comes now'),
          doe: () => {
            T.debug.heer();
            return T.t('The lord is on his way.');
          } },
        { id: 'brief', tekst: () => T.t('His letter now'),
          doe: (S, D, dag) => {
            T.stuurBrief(D, dag);
            return T.t('His letter has come.');
          } },
        { id: 'gril', tekst: () => T.t('A whim of the lord now'),
          doe: (S, D) => {
            if (!T.bazenTellen(D)) return T.t('The rule Two masters is off, or no lord comes here.');
            T.debug.gril(null);
            return T.t('His whim has come.');
          } },
        { id: 'heervaart', tekst: () => T.t('He asks for men now'),
          doe: (S, D, dag) => {
            const H = D.heervaart;
            if (H && (H.vraag || H.tocht)) return T.t('He has asked already.');
            T.vraagHeervaart(D, dag);
            return T.t('His letter has come.');
          } },
        { id: 'slachten', tekst: () => T.t('The slaughter window now'),
          doe: () => (T.debug.slachten() === 'open' ? '' : T.t('There are no animals to slaughter.')) },
      ],
    },
    {
      id: 'gevaar',
      naam: T.t('Danger'),
      knoppen: [
        { id: 'rovers', tekst: () => T.t('{n} robbers now', { n: IN().rovers }),
          doe: (S, D) => {
            if (D.rovers && D.rovers.aanval) return T.t('There are robbers already.');
            T.debug.rovers(IN().rovers);
            return T.t('They come for a field, or else for the largest pile left outside; with neither, they stay away.');
          } },
        { id: 'demoOverval', tekst: () => T.t('The demo raid tomorrow'),
          doe: (S, D) => (overvalMorgen(S, D) ? T.t('The warning comes now, the robbers tomorrow.') : T.t('Not now: there are robbers on the map already.')) },
        { id: 'brand', tekst: () => T.t('A fire now'),
          doe: () => (typeof T.debug.brand('nu') === 'string' ? T.t('There is no house that can burn.') : T.t('A fire has started.')) },
        { id: 'koorts', tekst: () => T.t('Fever now'),
          doe: (S, D, dag) => {
            if (D.koorts) return T.t('There is fever already.');
            T.beginKoorts(D, dag);
            return T.t('The fever has started.');
          } },
        { id: 'regen', tekst: () => T.t('Rain today'),
          doe: () => (T.WEER_INSTELLINGEN.aan ? (T.debug.weer('regen'), T.t('It rains today.')) : T.t('The rule The weather is set to always sun.')) },
        { id: 'droogte', tekst: () => T.t('A drought now'),
          doe: () => (T.WEER_INSTELLINGEN.aan ? (T.debug.weer('droogte'), T.t('A drought has started.')) : T.t('The rule The weather is set to always sun.')) },
        { id: 'val', tekst: () => T.t('The commander falls'),
          doe: (S, D) => {
            if (!D.aanvoerder) return T.t('There is no commander.');
            const p = T.opvolgerVan(D);
            T.valt(S, D, D.aanvoerder, null);
            return p ? T.t('The commander has fallen; {naam} takes over.', { naam: T.naamVanBewoner(p) }) : T.t('The commander has fallen, and nobody takes over.');
          } },
      ],
    },
    {
      id: 'demo',
      naam: T.t('Demo'),
      staat: (S, D) => {
        // De overval: gepland (de dag van de aanval), geweest (zijn trigger ging af), of nog de dag na het bericht uit het zaad.
        const A = D.rovers && D.rovers.aanval;
        const t = overvalVan(S.scenario && S.scenario.triggers);
        const demo = !!(S.scenario && S.scenario.demo);
        const overval = A && A.aangekondigd ? T.datumVanDag(A.dag).tekst
          : !t || t.gedaan ? T.t('it came') : T.datumVanDag(S.scenario.lot.overval + 1).tekst;
        const p = T.puntenVan(D);
        const beste = T.bestePunten();
        return [
          demo ? T.t('This game is the demo.') : T.t('This game is the full game.'),
          demo ? T.t('The raid: {wanneer}.', { wanneer: overval }) : T.t('The raid comes only in the demo.'),
          T.t('Score now: {totaal} ({verzameld} gathered, {ligt} in store). Best on this computer: {beste}.',
            { totaal: p.totaal, verzameld: p.verzameld, ligt: p.ligt, beste: beste == null ? T.t('none yet') : beste }),
        ];
      },
      knoppen: [
        { id: 'nieuwDemo', tekst: () => T.t('New game as the demo'), doe: (S) => nieuwSpel(S, T.demoLevel()) },
        { id: 'nieuwVol', tekst: () => T.t('New game, the full game'), doe: (S) => nieuwSpel(S, null) },
        // Een kaart met een rand, om te proberen (vraag 187, stap 2a): het land van nu, met de kleinste rand (T.randMinstens,
        // js/maker.js). Dat level staat alleen hier, want het debugvenster gaat niet mee naar Steam.
        { id: 'nieuwRand', tekst: () => T.t('New game with a border (a test)'),
          doe: (S) => nieuwSpel(S, { rand: { b: T.randMinstens(), h: T.randMinstens() } }) },
        { id: 'slot', tekst: (S, D) => (opSlot(D) ? T.t('Demo lock on: {gebouwen}', { gebouwen: dichtNamen() }) : T.t('Demo lock off: {gebouwen}', { gebouwen: dichtNamen() })),
          // Het slot van de demo aan of uit in dit spel, om te proberen (werklijst Q, vraag 181, e; Marcel, 20 okt): in het
          // bouwmenu op slot (D.dicht, T.isDicht in js/gebouwen.js), of te bouwen.
          doe: (S, D) => {
            D.dicht = opSlot(D) ? [] : [...demoDicht()];
            return opSlot(D) ? T.t('Locked, as in the demo.') : T.t('Unlocked, as in the full game.');
          } },
      ],
    },
    {
      id: 'kijk',
      naam: T.t('Look'),
      knoppen: [
        // De maat van de gebouwen, om te kijken (werklijst R, vraag 183, 2a1; Marcel, 20 okt): 100, 80 en 65 procent,
        // alleen voor het oog (tekenOpMaat in js/tekenen.js).
        { id: 'maat', tekst: () => T.t('Buildings drawn at {p}% (a test)', { p: Math.round(T.TEKENEN_INSTELLINGEN.gebouwMaat * 100) }),
          doe: () => {
            const maten = IN().gebouwMaten;
            const f = maten[(maten.indexOf(T.TEKENEN_INSTELLINGEN.gebouwMaat) + 1) % maten.length];
            T.TEKENEN_INSTELLINGEN.gebouwMaat = f;
            return T.t('Buildings are drawn at {p}%, only for the eye: the ground they stand on stays the same.', { p: Math.round(f * 100) });
          } },
        // De spelregels om te proberen, midden in het spel, met de werkbank (vraag 172, js/hud.js): een eigen venster.
        { id: 'regels', tekst: () => T.t('Game rules and the workbench'),
          doe: (S) => {
            T.ui.openSpelregels(S, 'debug');
            return '';
          } },
      ],
    },
  ];

  function inhoud(S) {
    const D = S.dorp;
    const dag = S.kalender ? klok(S.kalender.dag) : '';
    const tabs = TABS();
    const nu = tabs.find((t) => t.id === tab) || tabs[0];
    const knop = (k) => `<button class="db-knop" data-actie="${k.id}">${k.tekst(S, D)}</button>`;
    const staat = nu.staat ? nu.staat(S, D).map((r) => `<p class="db-staat">${r}</p>`).join('') : '';
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('Debug')}</span><span class="venster-wanneer">${dag}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<div class="tabs">${tabs.map((t) => `<button class="tab${t === nu ? ' gekozen' : ''}" data-tab="${t.id}">${t.naam}</button>`).join('')}</div>` +
      `<div class="db-inhoud">${staat}<div class="db-knoppen">${nu.knoppen.map(knop).join('')}</div>` +
      `${gedaan ? `<p class="venster-staat">${gedaan}</p>` : ''}</div>` +
      `<p class="venster-voet">${T.t('For testing, until the Steam version. While this is open, time stands still. <kbd>Esc</kbd> or <kbd>D</kbd> closes it.')}</p>`
    );
  }

  function toon(S) {
    $('debug').innerHTML = inhoud(S);
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
    if (b.dataset.tab) {
      tab = b.dataset.tab;
      gedaan = '';
      toon(S);
      return;
    }
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitDebug(S);
      return;
    }
    const k = TABS().flatMap((t) => t.knoppen).find((x) => x.id === b.dataset.actie);
    if (!k) return;
    gedaan = k.doe(S, S.dorp, dagNu(S)) || '';
    // Een knop die een ander venster opende (een brief, het slachten, de spelregels) of een nieuw spel begon, laat het
    // debugvenster dicht; anders staat er wat hij deed.
    if (T.ui.vensterOpen() === 'debug') toon(S);
  });
})(globalThis.Spel = globalThis.Spel || {});
