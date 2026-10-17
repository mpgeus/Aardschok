// De scène van de renderproef (gereedschap/pixiproef; ontwerp/snelheid.md, E): een vast dorp uit de echte kunst van het
// spel, dat js/gl.js en PixiJS allebei tekenen, uit dezelfde lijst. Alles in wereldpixels: het midden van tegel (x, y)
// ligt op ((x - y) * 32, (x + y) * 16), zoals T.naarScherm in js/iso.js.
//
// Wat erin staat: zo'n 150 gebouwen op kavels in een raster (huizen en gebouwen tot 6 bij 6 tegels), bos eromheen en wat
// bomen in het dorp, begroeiing, 300 inwoners die heen en weer over de straten lopen, en rook uit een derde van de
// gebouwen (zacht doorzichtig). Alles uit een vast zaad, zonder Math.random, zodat elke keer hetzelfde dorp staat.
(function (P) {
  'use strict';
  const T = globalThis.Spel;
  const WORTEL = '../../';
  const N = 170; // de kaart, in tegels
  const DORP = { x0: 14, y0: 12, kavel: 10, straat: 3, kolommen: 11, rijen: 14, leeg: [[5, 6], [5, 7], [0, 13], [10, 0]] }; // 154 kavels van 10 bij 10 tegels (150 met een gebouw), met een straat van 3
  const INWONERS = 300;
  // De zon: zoveel opzij en omhoog per pixel hoogte van een plaatje (sx en sy van beginSchaduw in js/gl.js), en de
  // schaduw zoals T.LICHT_INSTELLINGEN.schaduw in js/tekenen.js.
  P.ZON = { rx: -0.55, ry: -0.24 };
  P.SCHADUW = { sterkte: 0.42, kleur: [18 / 255, 22 / 255, 44 / 255] };
  P.AVOND = [1, 0.84, 0.7]; // het licht (het filter): de wereld maal deze kleur
  P.DOORZICHTIG = { straal: 520, alpha: 0.3 }; // modus 'doorzichtig': gebouwen zo dicht bij het midden van het beeld
  P.N = N;

  const naarScherm = (x, y) => ({ x: (x - y) * 32, y: (x + y) * 16 });
  P.naarScherm = naarScherm;

  function lot(zaad) {
    let s = zaad >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const kies = (r, lijst) => lijst[Math.floor(r() * lijst.length)];

  // ---------------------------------------------------------------- de plaatjes
  const beelden = new Map(); // pad → Image (of een doek)
  function beeld(pad) {
    let b = beelden.get(pad);
    if (!b) {
      b = new Image();
      b.decoding = 'async';
      b.pad = pad;
      beelden.set(pad, b);
    }
    return b;
  }
  // Laadt wat nog niet geladen is; geeft een belofte die klaar is als alles er is.
  P.laad = function (paden) {
    return Promise.all(paden.map((p) => {
      const b = beeld(p);
      if (b.complete && b.naturalWidth) return Promise.resolve(b);
      if (!b.src) b.src = WORTEL + p;
      return b.decode().then(() => b, () => new Promise((klaar, mis) => {
        if (b.complete && b.naturalWidth) klaar(b);
        else { b.onload = () => klaar(b); b.onerror = () => mis(new Error('kan niet laden: ' + p)); }
      }));
    }));
  };

  // De rook: een zachte vlek, één keer getekend (een doek met versie 1: js/gl.js zet hem op een blad).
  function rookDoek() {
    const d = document.createElement('canvas');
    d.width = d.height = 64;
    const c = d.getContext('2d');
    const g = c.createRadialGradient(32, 32, 2, 32, 32, 31);
    g.addColorStop(0, 'rgba(236,232,226,0.95)');
    g.addColorStop(0.55, 'rgba(206,202,198,0.55)');
    g.addColorStop(1, 'rgba(190,188,186,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
    d.versie = 1;
    return d;
  }

  // ---------------------------------------------------------------- het dorp
  P.maakScene = function (zaad) {
    const r = lot(zaad || 20261017);
    const TG = T.TEGELS;
    const PLAT = (T.PLAT && T.PLAT.platten) || {};
    const dingen = [];
    const bezet = new Uint8Array(N * N); // 1 gebouw, 2 straat, 3 iets anders
    const zet = (x, y, w) => { if (x >= 0 && y >= 0 && x < N && y < N) bezet[y * N + x] = w; };
    const vrij = (x, y) => x >= 0 && y >= 0 && x < N && y < N && !bezet[y * N + x];

    // Een ding: een plaatje uit een vel met een anker, op een plek. Elk ding heeft dezelfde vorm (dezelfde velden in
    // dezelfde volgorde): wat de sortering in Chromium snel houdt (code.md bij js/tekenen.js).
    const ding = (soort, pad, cel, anker, x, y, d, extra) => {
      const p = naarScherm(x, y);
      const o = {
        soort, pad, img: null, sx: cel[0], sy: cel[1], sw: cel[2], sh: cel[3], ax: anker[0], ay: anker[1], schaal: 1,
        wx: Math.round(p.x), wy: Math.round(p.y), d, alpha: 1, schaduw: soort !== 'begroeiing' && soort !== 'rook',
        plat: null, naam: '', beweegt: false, x, y, pad0: null, kader: null, nr: dingen.length,
      };
      if (extra) Object.assign(o, extra);
      dingen.push(o);
      return o;
    };

    // De gebouwen: huizen (de jonge tekeningen) en gebouwen tot 6 bij 6 tegels, elk een eigen bestand.
    const pool = [];
    for (const vel of ['huizen', 'gebouwen']) {
      for (const t of TG[vel].tiles) {
        if (!t.cel || !t.bestand || !t.beslaat || /-oud$/.test(t.naam)) continue;
        if (t.beslaat[0] > 6 || t.beslaat[1] > 6 || t.beslaat[0] < 2 || t.beslaat[1] < 2) continue;
        pool.push(t);
      }
    }
    // Alle 65 tekeningen die passen: een dorp heeft er een paar tientallen verschillende (en elk is een eigen textuur).
    const keus = pool;
    const isLeeg = (i, j) => DORP.leeg.some(([a, b]) => a === i && b === j);
    for (let j = 0; j < DORP.rijen; j++) {
      for (let i = 0; i < DORP.kolommen; i++) {
        const kx = DORP.x0 + i * DORP.kavel;
        const ky = DORP.y0 + j * DORP.kavel;
        // De straten: de laatste twee rijen van elke kavel, in beide richtingen.
        for (let a = 0; a < DORP.kavel; a++) for (let b = DORP.kavel - DORP.straat; b < DORP.kavel; b++) { zet(kx + a, ky + b, 2); zet(kx + b, ky + a, 2); }
        if (isLeeg(i, j)) continue;
        const t = kies(r, keus);
        const [b, h] = t.beslaat;
        const x = kx + Math.floor(r() * (DORP.kavel - DORP.straat - b + 1));
        const y = ky + Math.floor(r() * (DORP.kavel - DORP.straat - h + 1));
        for (let a = 0; a < b; a++) for (let c = 0; c < h; c++) zet(x + a, y + c, 1);
        const pl = PLAT[t.naam];
        // De volgorde: het midden van de voet. Met een straat tussen elk gebouw en de rest klopt dat hier (het spel heeft
        // er een eigen regel voor, tekenVolgorde in js/tekenen.js; die is voor beide tekenaars hetzelfde werk).
        const g = ding('gebouw', t.bestand, t.cel, t.anker, x, y, x + y + (b + h - 2) / 2, {
          naam: t.naam,
          plat: pl ? { pad: 'tegels/' + pl.bestand, cel: [0, 0, pl.b, pl.h], anker: pl.anker } : null,
          voet: [b, h],
        });
        // Rook uit een derde van de gebouwen: drie wolkjes die opstijgen en vervagen (stand, hieronder).
        if (r() < 0.34) {
          const nok = t.nok || [0, -Math.round(t.anker[1] * 0.7)];
          for (let k = 0; k < 3; k++) {
            ding('rook', null, [0, 0, 64, 64], [32, 32], x, y, g.d + 0.01 + k * 0.001, {
              van: { x: g.wx + nok[0], y: g.wy + nok[1] }, fase: k / 3 + r() * 0.1, schaduw: false, beweegt: true,
            });
          }
        }
      }
    }

    // Het bos: buiten het dorp vol, met open plekken, en hier en daar een boom in het dorp; dan de begroeiing.
    const boomTegels = TG.bomen.tiles.map((t, id) => ({ t, id })).filter(({ t }) => t.cel && t.naam && t.naam !== 'dodeBoom');
    const groenTegels = TG.begroeiing.tiles.map((t, id) => ({ t, id })).filter(({ t }) => t.cel && t.naam);
    const inDorp = (x, y) => x >= DORP.x0 - 1 && y >= DORP.y0 - 1 && x < DORP.x0 + DORP.kolommen * DORP.kavel && y < DORP.y0 + DORP.rijen * DORP.kavel;
    const golf = (x, y) => Math.sin(x * 0.21) + Math.sin(y * 0.17 + 1.3) + Math.sin((x + y) * 0.11);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (!vrij(x, y)) continue;
        const kans = inDorp(x, y) ? 0.05 : golf(x, y) > -0.6 ? 0.42 : 0.05;
        if (r() < kans) {
          const { t } = kies(r, boomTegels);
          ding('boom', 'tegels/bomen.png', t.cel, t.anker, x, y, x + y, { naam: t.naam });
          zet(x, y, 3);
        } else if (r() < (inDorp(x, y) ? 0.08 : 0.22)) {
          const { t } = kies(r, groenTegels);
          ding('begroeiing', 'tegels/begroeiing.png', t.cel, t.anker, x, y, x + y - 0.2, { naam: t.naam });
          zet(x, y, 3);
        }
      }
    }

    // De inwoners: elk een figuur uit het spel, heen en weer over een stuk straat, op de klok van de proef.
    const F = T.BEELDEN.figuren;
    const soorten = ['boer', 'boerin', 'jongen', 'meisje', 'oudeman', 'smid', 'dorpeling0', 'dorpeling1', 'herbergierster',
      'soldaat', 'drager', 'hakker', 'boer-u3', 'boerin-u5', 'maaier', 'zager'].filter((n) => F[n] && F[n].houdingen.lopen);
    const xStraten = [];
    const yStraten = [];
    for (let j = 0; j < DORP.rijen; j++) xStraten.push(DORP.y0 + j * DORP.kavel + DORP.kavel - 1 - Math.floor(DORP.straat / 2));
    for (let i = 0; i < DORP.kolommen; i++) yStraten.push(DORP.x0 + i * DORP.kavel + DORP.kavel - 1 - Math.floor(DORP.straat / 2));
    const lengteX = DORP.kolommen * DORP.kavel;
    const lengteY = DORP.rijen * DORP.kavel;
    for (let i = 0; i < INWONERS; i++) {
      const naam = kies(r, soorten);
      const f = F[naam];
      const h = f.houdingen.lopen;
      const langsX = r() < 0.5;
      const lengte = 6 + Math.floor(r() * 18);
      const start = Math.floor(r() * ((langsX ? lengteX : lengteY) - lengte));
      const pad0 = langsX
        ? { x: DORP.x0 + start, y: kies(r, xStraten) + (r() < 0.5 ? 0 : 0.5), dx: 1, dy: 0 }
        : { x: kies(r, yStraten) + (r() < 0.5 ? 0 : 0.5), y: DORP.y0 + start, dx: 0, dy: 1 };
      Object.assign(pad0, { lengte, snelheid: (f.snelheid || 1.5) * 0.9, fase: r() * lengte * 2, richtingen: f.richtingen });
      const cel = h.cel || f.cel;
      ding('inwoner', 'beelden/figuren/' + h.bestand, [0, 0, cel[0], cel[1]], h.anker || f.anker, pad0.x, pad0.y, pad0.x + pad0.y + 0.1, {
        naam, beweegt: true, pad0, kader: { beelden: h.beelden, fps: h.fps, b: cel[0], h: cel[1], fase: r() },
      });
    }

    const paden = [...new Set(dingen.filter((d) => d.pad).map((d) => d.pad))];
    const midden = naarScherm(DORP.x0 + (DORP.kolommen * DORP.kavel) / 2, DORP.y0 + (DORP.rijen * DORP.kavel) / 2);
    const tel = {};
    for (const d of dingen) tel[d.soort] = (tel[d.soort] || 0) + 1;
    return { dingen, paden, midden, tel, rook: null, bezet, N, platPaden: [...new Set(dingen.filter((d) => d.plat).map((d) => d.plat.pad))] };
  };

  // Na het laden: elk ding zijn plaatje.
  P.koppel = function (sc) {
    sc.rook = rookDoek();
    for (const d of sc.dingen) {
      d.img = d.soort === 'rook' ? sc.rook : beelden.get(d.pad);
      if (d.plat) d.plat.img = beelden.get(d.plat.pad) || null;
    }
  };
  P.beeldVan = (pad) => beelden.get(pad);

  // ---------------------------------------------------------------- de stand op tijd t (seconden)
  // Wat beweegt: de inwoners lopen heen en weer (plek, richting, beeld van de animatie, volgorde), de rook stijgt en
  // vervaagt. Dit is de simulatie: voor beide tekenaars dezelfde, en niet in hun tijd meegeteld.
  P.stand = function (sc, t) {
    for (const d of sc.dingen) {
      if (!d.beweegt) continue;
      if (d.soort === 'inwoner') {
        const p = d.pad0;
        const s = (t * p.snelheid + p.fase) % (p.lengte * 2);
        const terug = s > p.lengte;
        const u = terug ? p.lengte * 2 - s : s;
        const x = p.x + p.dx * u;
        const y = p.y + p.dy * u;
        // +x is op het scherm rechtsonder (ZO), -x linksboven (NW), +y linksonder (ZW), -y rechtsboven (NO).
        const richting = p.dx ? (terug ? 'NW' : 'ZO') : terug ? 'NO' : 'ZW';
        const rij = Math.max(0, p.richtingen.indexOf(richting));
        const k = d.kader;
        const kol = Math.floor((t * k.fps + k.fase * k.beelden)) % k.beelden;
        d.sx = kol * k.b;
        d.sy = rij * k.h;
        const q = naarScherm(x, y);
        d.wx = Math.round(q.x);
        d.wy = Math.round(q.y);
        d.x = x;
        d.y = y;
        d.d = x + y + 0.1;
      } else if (d.soort === 'rook') {
        const a = (t * 0.22 + d.fase) % 1;
        d.schaal = 0.45 + a * 0.9;
        d.wx = Math.round(d.van.x + a * 34);
        d.wy = Math.round(d.van.y - a * 70);
        d.alpha = 0.7 * (1 - a) * Math.min(1, a * 6);
      }
    }
  };

  // ---------------------------------------------------------------- wat een tekenaar per ding vraagt
  // Het vak in beeld, in wereldpixels, met een rand voor de schaduwen.
  P.vak = function (cam, b, h) {
    const w = b / cam.zoom;
    const v = h / cam.zoom;
    const rand = 260;
    return { x0: cam.x - w / 2 - rand, y0: cam.y - v / 2 - rand, x1: cam.x + w / 2 + rand, y1: cam.y + v / 2 + rand, cx: cam.x, cy: cam.y };
  };
  // Hoe een ding er in deze weergave uitziet: { img, sx, sy, sw, sh, ax, ay, alpha, schaduw }, of null (niet tekenen).
  // Elk ding houdt zijn eigen antwoord (o.nu), zodat er per beeld niets nieuws ontstaat.
  P.weergave = function (d, inst, v) {
    const o = d.nu || (d.nu = { img: null, sx: 0, sy: 0, sw: 0, sh: 0, ax: 0, ay: 0, alpha: 1, schaduw: false, schaal: 1, plat: false });
    o.img = d.img; o.sx = d.sx; o.sy = d.sy; o.sw = d.sw; o.sh = d.sh; o.ax = d.ax; o.ay = d.ay;
    o.alpha = d.alpha; o.schaduw = d.schaduw && inst.schaduw; o.schaal = d.schaal; o.plat = false;
    if (d.soort === 'gebouw' && inst.modus !== 'gewoon') {
      if (inst.modus === 'verborgen') return null;
      if (inst.modus === 'plat' && d.plat && d.plat.img && d.plat.img.naturalWidth) {
        const p = d.plat;
        o.img = p.img; o.sx = p.cel[0]; o.sy = p.cel[1]; o.sw = p.cel[2]; o.sh = p.cel[3]; o.ax = p.anker[0]; o.ay = p.anker[1];
        o.schaduw = false;
        o.plat = true;
      } else if (inst.modus === 'doorzichtig' || inst.modus === 'plat') {
        const dx = d.wx - v.cx;
        const dy = d.wy - 60 - v.cy;
        if (inst.modus === 'plat' || dx * dx + dy * dy < P.DOORZICHTIG.straal * P.DOORZICHTIG.straal) o.alpha = P.DOORZICHTIG.alpha;
      }
    }
    if (!o.img || !(o.img.naturalWidth || o.img.width)) return null;
    return o;
  };
  // Staat een ding (met zijn schaduw) in het vak?
  P.inVak = function (d, o, v) {
    const x0 = d.wx - o.ax * o.schaal;
    const y0 = d.wy - o.ay * o.schaal;
    return x0 < v.x1 && y0 < v.y1 && x0 + o.sw * o.schaal > v.x0 && y0 + o.sh * o.schaal > v.y0;
  };

  // ---------------------------------------------------------------- de grond
  // Zoals in het spel (werkStukkenBij in js/tekenen.js): stukken van 512 pixels op de maat van het scherm, die aan de
  // wereld vastzitten; een stuk wordt één keer getekend (in 2D, uit tegels/grond.png) en daarna als plaatje gebruikt.
  // Per zoom eigen stukken, want ver uitgezoomd liggen ze op de maat van het scherm.
  const STUK = 512;
  const stukken = new Map(); // zoom → Map(sleutel → stuk)
  function grondTegel(sc, x, y) {
    const w = sc.bezet[y * N + x];
    const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    const lijst = w === 2 ? P.grondNummers.zandpad : P.grondNummers.gras;
    return lijst[h % lijst.length];
  }
  function bakStuk(sc, zoom, i, j) {
    const d = document.createElement('canvas');
    d.width = d.height = STUK;
    const c = d.getContext('2d');
    c.imageSmoothingEnabled = false;
    const S = STUK / zoom; // wereldpixels per stuk
    const wx0 = i * S;
    const wy0 = j * S;
    c.fillStyle = '#26301e';
    c.fillRect(0, 0, STUK, STUK);
    c.setTransform(zoom, 0, 0, zoom, -wx0 * zoom, -wy0 * zoom);
    const grond = beelden.get('tegels/grond.png');
    const G = T.TEGELS.grond;
    // De tegels die dit stuk raken: de ruit van (x, y) ligt rond ((x - y) * 32, (x + y) * 16).
    const s0 = Math.floor((wy0 - 32) / 16);
    const s1 = Math.ceil((wy0 + S + 32) / 16);
    for (let s = Math.max(0, s0); s <= Math.min(2 * N - 2, s1); s++) {
      const v0 = Math.floor((wx0 - 64) / 32);
      const v1 = Math.ceil((wx0 + S + 64) / 32);
      for (let vv = v0; vv <= v1; vv++) {
        if ((s + vv) & 1) continue;
        const x = (s + vv) / 2;
        const y = (s - vv) / 2;
        if (x < 0 || y < 0 || x >= N || y >= N) continue;
        const nr = grondTegel(sc, x, y);
        const kol = nr % G.kolommen;
        const rij = Math.floor(nr / G.kolommen);
        c.drawImage(grond, kol * 64, rij * 32, 64, 32, (x - y) * 32 - 32, (x + y) * 16 - 16, 64, 32);
      }
    }
    d.versie = 1; // js/gl.js: een vaste buffer, één keer naar de kaart
    return { doek: d, x: wx0, y: wy0, S, i, j, zoom, pixi: null };
  }
  // De stukken in beeld bij deze camera (en maak wat er nog niet is).
  P.grondStukken = function (sc, cam, b, h, uit) {
    let m = stukken.get(cam.zoom);
    if (!m) stukken.set(cam.zoom, (m = new Map()));
    const S = STUK / cam.zoom;
    const w = b / cam.zoom;
    const v = h / cam.zoom;
    const i0 = Math.floor((cam.x - w / 2) / S);
    const i1 = Math.floor((cam.x + w / 2) / S);
    const j0 = Math.floor((cam.y - v / 2) / S);
    const j1 = Math.floor((cam.y + v / 2) / S);
    uit.length = 0;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const k = i * 4096 + j;
        let s = m.get(k);
        if (!s) m.set(k, (s = bakStuk(sc, cam.zoom, i, j)));
        uit.push(s);
      }
    }
    return uit;
  };
  P.grondNummers = (function () {
    const uit = { gras: [], zandpad: [] };
    const tiles = T.TEGELS.grond.tiles;
    // Alleen de gewone stempels (de eerste van elke soort zijn heel; de rest zijn randen naar een buur).
    tiles.forEach((t, i) => { if (t.naam === 'gras' && uit.gras.length < 4) uit.gras.push(i); });
    tiles.forEach((t, i) => { if (t.naam === 'kasseien' && uit.zandpad.length < 1) uit.zandpad.push(i); });
    return uit;
  })();
})(globalThis.Proef = globalThis.Proef || {});
