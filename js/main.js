// Opstarten, de spellus en de invoer. Elk beeld: animaties bijwerken, bij het rondlopen de
// monsters laten dwalen en uitkijken, de camera laten meeglijden, en tekenen.
(function (T) {
  'use strict';

  const canvas = document.getElementById('scherm');
  const ctx = canvas.getContext('2d');
  let bw = 0;
  let bh = 0;
  const S = (T.S = { tijd: 0 });

  // Hoe hoog iets boven zijn tegel uitsteekt, om erop te kunnen klikken.
  const WEZEN_HOOGTE = { wim: 48, slijm: 28, skelet: 52 };
  const VOORWERP_HOOGTE = { fontein: 32, kist: 36, trap: 46, sleutel: 28 };

  T.nieuwSpel = function (toonPlek) {
    const w = T.maakWereld();
    const held = w.wezens.find((e) => e.soort === 'held');
    Object.assign(S, {
      wereld: w,
      held,
      modus: 'verkennen',
      gevecht: null,
      overgang: null,
      bezig: false,
      actie: 'slaan',
      inventaris: new Set(),
      sleutelGebruikt: false,
      fonteinLeeg: false,
      sluipen: false,
      bezocht: new Set(['hal']),
      effecten: [],
      wachters: [],
      rasterAlpha: 0,
      rasterTegels: [],
      rasterStart: 0,
      rasterVan: null,
      bereik: null,
      hover: null,
      handeling: null,
      naLopen: null,
    });
    const p = T.naarScherm(held.x, held.y);
    S.camera = { x: p.x, y: p.y - 24 };
    T.ui.reset(S);
    T.ui.bericht('Je staat in de hal van de toren. Misschien weet de conciërge meer.');
    if (toonPlek) T.ui.plek('De hal');
  };

  // Het beeld zoomt mee met het venster: op een groot scherm wordt de toren groter, op een
  // klein scherm nooit kleiner dan ware grootte.
  function formaat() {
    const dpr = window.devicePixelRatio || 1;
    bw = window.innerWidth;
    bh = window.innerHeight;
    canvas.width = Math.round(bw * dpr);
    canvas.height = Math.round(bh * dpr);
    canvas.style.width = bw + 'px';
    canvas.style.height = bh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S.zoom = Math.max(1, Math.min(2, Math.min(bw / 900, bh / 540)));
  }

  // Van schermpixels naar de isometrische vlakte waarop getekend wordt, en terug. Precies
  // dezelfde afronding als in tekenScene, anders wijst de muis net naast de tegel.
  const naarVlak = (mx, my) => ({
    x: (mx - Math.round(bw / 2)) / S.zoom + Math.round(S.camera.x),
    y: (my - Math.round(bh / 2)) / S.zoom + Math.round(S.camera.y),
  });
  const vanVlak = (sx, sy) => ({
    x: (sx - Math.round(S.camera.x)) * S.zoom + Math.round(bw / 2),
    y: (sy - Math.round(S.camera.y)) * S.zoom + Math.round(bh / 2),
  });

  const heldAanDeBeurt = () => !!S.gevecht && S.gevecht.volgorde[S.gevecht.beurt] === S.held;

  // Wat ligt er onder de muis? Wezens en voorwerpen steken boven hun tegel uit, dus die
  // worden eerst gezocht, van voor naar achter. Anders is het de tegel zelf.
  function zoekDoel(mx, my) {
    const w = S.wereld;
    const { x: sx, y: sy } = naarVlak(mx, my);
    const kandidaten = [];
    for (const e of w.wezens) {
      if (e.dood || e === S.held || !T.isZichtbaar(w, e.tx, e.ty)) continue;
      const p = T.naarScherm(e.x, e.y);
      const hoog = WEZEN_HOOGTE[e.soort] || 48;
      if (sx > p.x - 17 && sx < p.x + 17 && sy > p.y - hoog && sy < p.y + 9) {
        kandidaten.push({ d: e.x + e.y + 0.01, wezen: e, x: e.tx, y: e.ty });
      }
    }
    for (const v of w.voorwerpen) {
      const hoog = VOORWERP_HOOGTE[v.soort];
      if (!hoog || !T.isZichtbaar(w, v.x, v.y)) continue;
      const p = T.naarScherm(v.x, v.y);
      if (sx > p.x - 20 && sx < p.x + 20 && sy > p.y - hoog && sy < p.y + 10) {
        kandidaten.push({ d: v.x + v.y, voorwerp: v, x: v.x, y: v.y });
      }
    }
    if (kandidaten.length) {
      kandidaten.sort((a, b) => b.d - a.d);
      return kandidaten[0];
    }
    const f = T.naarWereld(sx, sy);
    const x = Math.round(f.x);
    const y = Math.round(f.y);
    if (x < 0 || y < 0 || x >= w.b || y >= w.h) return null;
    return { x, y };
  }

  // De muis wordt elk beeld opnieuw bekeken, want onder een stilstaande muis kan intussen
  // een monster doorlopen. Tekst bij de muis, pad op de vloer en de actiepunten zeggen
  // alle drie wat een klik zou doen.
  function werkHoverBij() {
    const actief = S.modus === 'verkennen' || (S.modus === 'gevecht' && !S.bezig && heldAanDeBeurt());
    if (!S.muis || !actief) {
      S.hover = null;
      S.handeling = null;
      T.ui.verbergTooltip();
      canvas.style.cursor = 'default';
      if (S.modus === 'gevecht' && heldAanDeBeurt()) T.ui.toonAp(S.held.ap, S.held.maxAp, 0, true);
      return;
    }
    S.hover = zoekDoel(S.muis.x, S.muis.y);
    const h = S.modus === 'verkennen' ? T.handelingVerkennen(S, S.hover) : T.handelingGevecht(S, S.hover);
    S.handeling = h;
    if (S.modus === 'gevecht') {
      T.ui.toonAp(S.held.ap, S.held.maxAp, h ? h.kosten || 0 : 0, !h || h.kan !== false);
      if (h) T.ui.tooltip(h.tekst + (h.kosten ? ` · ${h.kosten} AP` : ''), S.muis.x, S.muis.y, h.kan === false);
      else T.ui.verbergTooltip();
    } else if (h && h.tekst) {
      T.ui.tooltip(h.tekst, S.muis.x, S.muis.y, !!h.fout);
    } else {
      T.ui.verbergTooltip();
    }
    canvas.style.cursor = h ? 'pointer' : 'default';
  }

  // Bij het rondlopen volgt de camera de held; in een gevecht zoekt hij het midden tussen
  // iedereen die meedoet, zodat het hele slagveld in beeld schuift.
  function cameraDoel() {
    const lijst = S.gevecht ? [S.held, ...S.gevecht.monsters.filter((m) => !m.dood)] : [S.held];
    let x = 0;
    let y = 0;
    for (const e of lijst) {
      const p = T.naarScherm(e.x, e.y);
      x += p.x;
      y += p.y;
    }
    return { x: x / lijst.length, y: y / lijst.length - 24 };
  }

  function werkBij(dt) {
    // Een resize-gebeurtenis komt niet altijd (een tabblad dat verborgen opstartte, heeft
    // eerst geen maat), dus kijkt de lus zelf of het venster veranderd is.
    if (window.innerWidth !== bw || window.innerHeight !== bh) formaat();
    S.tijd += dt;
    T.werkAnimatiesBij(S, dt);
    if (S.modus === 'verkennen') {
      T.laatDwalen(S, dt);
      const m = T.zoekOntdekking(S);
      if (m) T.startGevecht(S, m, false);
    }
    if (S.modus === 'overgang' && S.wereld.wezens.every((e) => !e.pad.length)) T.beginGevecht(S);
    const doelAlpha = S.modus === 'gevecht' ? 1 : 0;
    S.rasterAlpha += (doelAlpha - S.rasterAlpha) * Math.min(1, dt * 5);
    const doel = cameraDoel();
    const k = 1 - Math.exp(-dt * 5);
    S.camera.x += (doel.x - S.camera.x) * k;
    S.camera.y += (doel.y - S.camera.y) * k;
    werkHoverBij();
  }

  let vorige = 0;
  function lus(nu) {
    const dt = vorige ? Math.min(0.05, (nu - vorige) / 1000) : 0;
    vorige = nu;
    werkBij(dt);
    T.tekenScene(ctx, S, bw, bh);
    requestAnimationFrame(lus);
  }

  canvas.addEventListener('mousemove', (ev) => {
    S.muis = { x: ev.clientX, y: ev.clientY };
  });
  canvas.addEventListener('mouseleave', () => {
    S.muis = null;
  });
  canvas.addEventListener('click', (ev) => {
    S.muis = { x: ev.clientX, y: ev.clientY };
    werkHoverBij();
    const h = S.handeling;
    if (!h || !h.doe || h.kan === false) return;
    h.doe();
  });
  canvas.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    if (S.gevecht) T.kiesActie(S, 'slaan');
  });
  window.addEventListener('keydown', (ev) => {
    if (S.modus === 'dialoog') {
      const n = parseInt(ev.key, 10);
      if (n >= 1 && n <= 9) T.ui.kiesKeuze(n - 1);
      if (ev.key === 'Escape') T.sluitDialoog(S);
      return;
    }
    if (S.modus === 'verkennen' && (ev.key === 's' || ev.key === 'S')) {
      T.wisselSluipen(S);
      return;
    }
    if (S.modus !== 'gevecht') return;
    if (ev.key === '1') T.kiesActie(S, 'slaan');
    else if (ev.key === '2') T.kiesActie(S, 'vuurschicht');
    else if (ev.key === '3') T.deurDicht(S);
    else if (ev.key === 'Escape') T.kiesActie(S, 'slaan');
    else if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      T.eindeBeurt(S);
    }
  });
  document.getElementById('knoppen').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || b.disabled) return;
    b.blur(); // anders drukt de spatiebalk straks ook deze knop nog eens in
    if (b.dataset.actie === 'einde') T.eindeBeurt(S);
    else if (b.dataset.actie === 'deur') T.deurDicht(S);
    else T.kiesActie(S, b.dataset.actie);
  });
  document.getElementById('sluip-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    T.wisselSluipen(S);
  });
  window.addEventListener('resize', formaat);

  // Voor het testen.
  T.debug = {
    // Waar staat tegel (x, y) nu op het scherm, in css-pixels? Voor echte klikken.
    naarBeeld(x, y) {
      const p = T.naarScherm(x, y);
      return vanVlak(p.x, p.y);
    },
    // Laat het spel `seconden` verder lopen zonder op beelden van de browser te wachten.
    // Een verborgen tabblad tekent maar af en toe een beeld, en dan loopt alles in slow
    // motion. Na elk beeld krijgen de beloftes (loop, wacht, uitval) de kans om door te gaan.
    async stap(seconden) {
      const n = Math.round(seconden * 60);
      for (let i = 0; i < n; i++) {
        werkBij(1 / 60);
        for (let k = 0; k < 8; k++) await null;
      }
      T.tekenScene(ctx, S, bw, bh);
    },
  };

  formaat();
  T.nieuwSpel(false);
  S.modus = 'titel';
  T.ui.toonOverlay(
    'Aardschok',
    '<p>Een proefje: rondlopen in een isometrische toren, en vechten in beurten op dezelfde vloer, zonder apart gevechtsscherm.</p>' +
      '<p>Klik om te lopen, te praten of iets te gebruiken. Begin maar bij Wim, de conciërge.</p>',
    'Beginnen',
    () => {
      S.modus = 'verkennen';
      T.ui.plek('De hal');
    },
  );
  requestAnimationFrame(lus);
})(globalThis.Toren = globalThis.Toren || {});
