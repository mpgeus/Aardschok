// Opstarten, de spellus en de invoer. Elk beeld: animaties bijwerken, bij het rondlopen de
// monsters laten dwalen en uitkijken, de camera laten meeglijden, en tekenen.
(function (T) {
  'use strict';

  const canvas = document.getElementById('scherm');
  const ctx = canvas.getContext('2d');
  let bw = 0;
  let bh = 0;
  const S = (T.S = { tijd: 0, wind: 0 });

  // Eén windwaarde voor de hele wereld, ergens tussen -1 en 1: hoe hard en naar welke kant.
  // Twee golven op een verhouding die niet deelt (dus het herhaalt niet merkbaar) plus af en toe
  // een vlaag erbovenop, zodat het als weer leest en niet als een speeltje. js/sprites.js bakt
  // hierop de standen van een voorwerp, js/tekenen.js bepaalt per voorwerp een eigen moment op
  // deze golf (windVoorInstantie) zodat niet alles tegelijk beweegt. Zie ontwerp/beeld.md, "Eén
  // wind door alles heen".
  T.windWaarde = function (tijd) {
    const golf = Math.sin(tijd * 0.31) * 0.4 + Math.sin(tijd * 0.13 + 1.3) * 0.3;
    const vlaag = Math.max(0, Math.sin(tijd * 0.085 + 0.7)) ** 4 * 0.5;
    return Math.max(-1, Math.min(1, golf + vlaag));
  };

  // Hoe hoog iets boven zijn tegel uitsteekt, om erop te kunnen klikken. Met sprites zijn de
  // figuren groter dan de vlakken waren, dus vraagt het aanwijzen het aan de sprites zelf.
  const WEZEN_HOOGTE = { wim: 48, slijm: 28, skelet: 52 };
  const VOORWERP_HOOGTE = { fontein: 32, kist: 36, trap: 46, sleutel: 28 };
  const SPRITE_VOORWERP_HOOGTE = { fontein: 46, kist: 40, trap: 46, sleutel: 26 };
  const hoogteVan = (e) =>
    T.sprites.aan && !T.debug.vlakken ? T.sprites.hoogte(e.soort) : WEZEN_HOOGTE[e.soort] || 48;
  const voorwerpHoogte = (v) =>
    (T.sprites.aan && !T.debug.vlakken ? SPRITE_VOORWERP_HOOGTE : VOORWERP_HOOGTE)[v.soort];

  T.nieuwSpel = function (toonPlek) {
    S.gebieden = {}; // een nieuw spel begint met een schone toren en een schoon erf
    const w = T.gebied(S, 'toren');
    const held = w.wezens.find((e) => e.soort === 'held');
    Object.assign(S, {
      wereld: w,
      held,
      modus: 'verkennen',
      gevecht: null,
      overgang: null,
      bezig: false,
      spreuk: null,
      spreukBereik: null,
      lichten: [],
      inventaris: new Set(),
      sleutelGebruikt: false,
      fonteinLeeg: false,
      sluipen: false,
      bezocht: new Set(['hal']),
      naarGebied: null,
      netGeland: null, // de tegel waar de held zojuist is neergezet (js/gebied.js)
      grond: null, // de buffer waar de grond op staat (js/tekenen.js)
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
    T.ui.bericht('Je bent terug in de hal van je toren, na veertig jaar. Wim staat er nog.');
    if (toonPlek) T.ui.plek('De hal');
  };

  // Het beeld zoomt mee met het venster: op een groot scherm wordt de toren groter, op een
  // klein scherm nooit kleiner dan ware grootte.
  //
  // De buffer is hele css-pixels, niet devicePixelRatio maal zoveel. Op een scherm met ratio 1,5
  // tekende het spel op vol scherm 2880×1620 = 4,7 miljoen pixels per beeld, en dat levert voor
  // pixel art niets op: de sprites worden toch al met een hele factor vergroot, en de browser
  // schaalt de buffer daarna met image-rendering: pixelated na (zie stijl.css). Op een scherm met
  // een echte hele ratio (2, een retina) tekenen we wel op die ratio, want daar levert het wél
  // scherpere pixels op; een halve ratio ronden we naar beneden af.
  function formaat() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
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
      const hoog = hoogteVan(e);
      if (sx > p.x - 17 && sx < p.x + 17 && sy > p.y - hoog && sy < p.y + 9) {
        kandidaten.push({ d: e.x + e.y + 0.01, wezen: e, x: e.tx, y: e.ty });
      }
    }
    for (const v of w.voorwerpen) {
      const hoog = voorwerpHoogte(v);
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
  // Wat er bij de muis staat: wat een klik doet, wat het aan punten kost en wat het aan leven
  // kost. Alles uit hetzelfde antwoord, zodat het scherm niet iets anders belooft dan de klik.
  function tipTekst(h) {
    let t = h.tekst;
    if (h.kosten) t += ` · ${h.kosten} AP`;
    if (h.maanden) {
      t += ` · ${T.duurKort(h.maanden)}`;
      if (S.held.leeftijd + h.maanden >= T.EINDLEEFTIJD) t += ' · daarna ben je honderd';
    }
    return t;
  }

  function werkHoverBij() {
    const actief = S.modus === 'verkennen' || (S.modus === 'gevecht' && !S.bezig && heldAanDeBeurt());
    S.spreukBereik = actief && S.spreuk ? T.spreukBereik(S) : null;
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
    if (S.modus === 'gevecht') T.ui.toonAp(S.held.ap, S.held.maxAp, h ? h.kosten || 0 : 0, !h || h.kan !== false);
    if (h && h.tekst) T.ui.tooltip(tipTekst(h), S.muis.x, S.muis.y, !!h.fout || h.kan === false);
    else T.ui.verbergTooltip();
    // Met een spreuk in de hand richt je: een kruisje in plaats van een wijzende hand.
    canvas.style.cursor = h ? (S.spreuk ? 'crosshair' : 'pointer') : S.spreuk ? 'crosshair' : 'default';
  }

  // Bij het rondlopen volgt de camera de held; in een gevecht zoekt hij het midden tussen
  // iedereen die meedoet, zodat het hele slagveld in beeld schuift.
  //
  // Dat begint al bij de overgang, vóór het gevecht: het monster dat je ziet, komt meteen in
  // beeld, tegelijk met de melding. Buiten is dat het verschil tussen een gevecht dat begint en
  // aangevallen worden door iets wat je niet kunt zien.
  function cameraDoel() {
    const aanleiding = S.overgang && S.overgang.aanleiding;
    const lijst = S.gevecht
      ? [S.held, ...S.gevecht.monsters.filter((m) => !m.dood)]
      : aanleiding && !aanleiding.dood
        ? [S.held, aanleiding]
        : [S.held];
    let x = 0;
    let y = 0;
    for (const e of lijst) {
      const p = T.naarScherm(e.x, e.y);
      x += p.x;
      y += p.y;
    }
    return begrensCamera({ x: x / lijst.length, y: y / lijst.length - 24 });
  }

  const klem = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));

  // Buiten loopt de kaart ergens af, en daarachter staat niets getekend: een harde zwarte rand.
  // De camera mag daar dus nooit voorbij kijken. Wat de camera laat zien is in beeldpixels een
  // rechthoek, maar op de kaart (na de ruit-projectie) een scheefgetrokken vlak; in plaats van
  // die rechthoek zelf te knijpen, rekenen we het middelpunt terug naar een tegelpositie
  // (T.naarWereld) en houden dáár een marge aan tot de rand — de halve schermmaat, in tegels.
  function begrensCamera(doel) {
    const w = S.wereld;
    if (!w || !w.buiten) return doel;
    const marge = bw / 2 / S.zoom / (2 * T.HB) + bh / 2 / S.zoom / (2 * T.HH);
    const f = T.naarWereld(doel.x, doel.y);
    return T.naarScherm(klem(f.x, marge, w.b - 1 - marge), klem(f.y, marge, w.h - 1 - marge));
  }

  function werkBij(dt) {
    // Een resize-gebeurtenis komt niet altijd (een tabblad dat verborgen opstartte, heeft
    // eerst geen maat), dus kijkt de lus zelf of het venster veranderd is.
    if (window.innerWidth !== bw || window.innerHeight !== bh) formaat();
    S.tijd += dt;
    S.wind = T.windWaarde(S.tijd);
    T.werkAnimatiesBij(S, dt);
    // Een overgang naar een ander gebied wordt hier opgepakt, en niet daar waar hij ontstaat
    // (T.bijAankomst): de lijst wezens van de wereld verandert erdoor, en daar loopt de animatie
    // net doorheen.
    if (S.naarGebied) T.gaNaarGebied(S, S.naarGebied);
    T.werkLichtenBij(S, dt);
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
    T.ui.toonSpreuken(S);
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
    T.kiesSpreuk(S, null);
  });
  // De spreuktoetsen (2, 3, 4) werken binnen én buiten een gevecht, want een dwaallicht en een
  // windstoot horen juist bij het rondlopen. 1 en Escape leggen een spreuk weer weg.
  window.addEventListener('keydown', (ev) => {
    if (S.modus === 'dialoog') {
      const n = parseInt(ev.key, 10);
      if (n >= 1 && n <= 9) T.ui.kiesKeuze(n - 1);
      if (ev.key === 'Escape') T.sluitDialoog(S);
      return;
    }
    if (S.modus !== 'verkennen' && S.modus !== 'gevecht') return;
    const spreuk = T.SPREUK_VOLGORDE.find((id) => T.SPREUKEN[id].toets === ev.key);
    if (spreuk) {
      T.kiesSpreuk(S, spreuk);
      return;
    }
    if (ev.key === '1' || ev.key === 'Escape') {
      T.kiesSpreuk(S, null);
      return;
    }
    if (S.modus === 'verkennen') {
      if (ev.key === 's' || ev.key === 'S') T.wisselSluipen(S);
      return;
    }
    if (ev.key === 'd' || ev.key === 'D') T.deurDicht(S);
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
    else T.kiesSpreuk(S, null);
  });
  document.getElementById('spreukbalk').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    b.blur();
    T.kiesSpreuk(S, b.dataset.spreuk);
  });
  document.getElementById('sluip-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    T.wisselSluipen(S);
  });
  window.addEventListener('resize', formaat);

  // Voor het testen.
  T.debug = {
    // Toren.debug.vlakken = true tekent weer met vlakken in plaats van met de pixel art,
    // om te vergelijken en om te zien of er niets verdwenen is.
    vlakken: false,
    // Waar staat tegel (x, y) nu op het scherm, in css-pixels? Voor echte klikken.
    naarBeeld(x, y) {
      const p = T.naarScherm(x, y);
      return vanVlak(p.x, p.y);
    },
    // Zet hoe vaak een spreuk al raak was, om de treden te proberen zonder ze te verdienen:
    // Toren.debug.meesterschap('vuurschicht', 15) → 'Meesterlijk'.
    meesterschap(id, aantal) {
      if (!T.SPREUKEN[id]) return `Die spreuk ken ik niet: ${id}`;
      S.held.meesterschap[id] = Math.max(0, Math.floor(aantal));
      return T.TREDEN[T.trede(S.held, id)].naam;
    },
    // Hoeveel milliseconden kost één beeld? Toren.debug.meet() tekent n beelden achter elkaar en
    // geeft het gemiddelde, de mediaan en de slechtste terug. Een beeld hoort ruim onder de 16 ms
    // te blijven (zestig beelden per seconde), het liefst onder de 5, zodat er ruimte overblijft
    // voor een tragere machine.
    meet(n) {
      const aantal = n || 120;
      const tijden = [];
      for (let i = 0; i < aantal; i++) {
        const t0 = performance.now();
        T.tekenScene(ctx, S, bw, bh);
        tijden.push(performance.now() - t0);
      }
      tijden.sort((a, b) => a - b);
      const som = tijden.reduce((a, b) => a + b, 0);
      const af = (x) => Math.round(x * 100) / 100;
      return {
        venster: `${bw}×${bh}`, zoom: Math.round(S.zoom * 100) / 100, buffer: `${canvas.width}×${canvas.height}`,
        gemiddeld: af(som / aantal), mediaan: af(tijden[aantal >> 1]), slechtste: af(tijden[aantal - 1]),
      };
    },
    // Naar een ander gebied springen zonder ernaartoe te lopen: Toren.debug.gaNaar('erf').
    gaNaar(naam) {
      T.gaNaarGebied(S, naam);
      return S.wereld.gebied;
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
  // De pixel art gaat meteen laden; tot hij klaar is tekent het spel zijn vlakken. Bij het
  // titelscherm is dat nooit te zien.
  T.sprites.laad();
  T.nieuwSpel(false);
  S.modus = 'titel';
  T.ui.toonOverlay(
    'Aardschok',
    '<p>Veertig jaar geleden sloot je iets op, boven in je toren, en ging je weg. Vannacht schudde de aarde, en het zegel brak.</p>' +
      '<p>Je bent 84. Elke spreuk kost je tijd van je leven, een vuurschicht een heel jaar, en elke klap die je krijgt een paar maanden. Op je honderdste is het voorbij. Een gevecht dat je ontloopt, kost niets.</p>' +
      '<p>Klik om te lopen, te praten of iets te gebruiken. <kbd>S</kbd> om te sluipen, <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> voor je spreuken.</p>',
    'Naar binnen',
    () => {
      S.modus = 'verkennen';
      T.ui.plek('De hal');
    },
  );
  requestAnimationFrame(lus);
})(globalThis.Toren = globalThis.Toren || {});
