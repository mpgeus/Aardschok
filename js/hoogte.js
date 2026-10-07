// De hoogte van het land (werklijst vraag 121, stap 1; Marcel, 7 okt: "ik doel ook meer op heuvels in het landschap",
// "Ja maak de plaat met beide", "a ja 32, b hoger, c ja", en "Ik wil dat de akkers mee bollen met de heuvel"; de
// proefplaat is gereedschap/pixelart/hoogte-proef.cjs).
//
// Eén model voor glooiende heuvels én terrassen: elke hoek van een tegel heeft een hoogte, in pixels op het scherm.
// Delen buren hun hoek, dan glooit het; verschillen ze, dan staat er een wand. Zo'n hoogte is de glooiing van het
// hoekpunt (`w.hoogte.glooiing`, een getal per hoekpunt) plus het niveau van de tegel maal een trede van 32 pixels
// (`w.hoogte.niveau`, alleen de tegels die niet 0 zijn). Een helling is een tegel met een eigen niveau per hoek
// (`w.hoogte.hellingen`), schuin tussen twee treden. Een kaart zonder `w.hoogte` is vlak, zoals altijd (het ontworpen
// gehucht, de proefkamers, en elk land met de spelregel "Hoogte" op vlak).
//
// Wat hier staat, verandert de regels nog niet (dat is stap 2: lopen, zien, bouwen): het zegt alleen hoe hoog iets
// ligt, voor het tekenen (js/tekenen.js) en de muis (js/main.js). De maker legt de hoogte (T.legHoogte).
(function (T) {
  'use strict';

  T.HOOGTE_INSTELLINGEN = {
    aan: false, // de spelregel "Hoogte": of de maker heuvels legt
    trede: 32, // een niveau hoger, in pixels (Marcel, 7 okt: "a ja 32")
    // de maker
    heuvels: [3, 5], // hoeveel hoge heuvels per land
    heuvelHoog: [90, 150], // hoe hoog, in pixels (Marcel: "b hoger"; zo'n drie tot vijf treden)
    heuvelStraal: [7, 11], // hoe breed de flank, in tegels
    wildVanaf: 3, // dichter bij een huis (met zijn looppad) of het plein dan dit, in tegels, komt geen hoge heuvel ...
    wildTot: 9, // ... en vanaf hier helemaal; de boerderijen liggen aan de buitenkant, dus veel verder is er weinig land
    golf: 16, // de zachte glooiing overal, in pixels
    vrijRond: 5, // in zoveel tegels loopt het van vlak (een huis, het plein, het water) naar vrij
    vrijRand: 4, // en net zo naar de rand van de kaart, waar het bos eromheen vlak ligt
    richel: [4.5, 6.5], // de richel bij de rotsen: hoe ver hij reikt
    hellingBreed: 2, // de helling de richel op, in tegels
  };
  const IN = () => T.HOOGTE_INSTELLINGEN;

  // De vier hoeken van tegel (x, y): noord, oost, zuid, west (op het scherm boven, rechts, onder, links).
  const HOEK = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
  T.HOOGTE_HOEKEN = HOEK;

  T.heeftHoogte = (w) => !!(w && w.hoogte);

  const sleutel = (x, y) => x + ',' + y;
  function niveauVan(hg, x, y) {
    return hg.niveau[sleutel(x, y)] || 0;
  }
  function glooiingOp(hg, vx, vy) {
    if (vx < 0 || vy < 0 || vx > hg.b || vy > hg.h) return 0;
    return hg.glooiing[vy * (hg.b + 1) + vx];
  }

  // De hoogte van hoek k (0 noord, 1 oost, 2 zuid, 3 west) van tegel (x, y), in pixels. Uit een lijst die eens per
  // hoogte wordt uitgerekend (het tekenen vraagt het elk beeld voor duizenden tegels); verandert de hoogte, dan krijgt
  // ze een nieuwe `versie`, en wordt de lijst opnieuw gemaakt.
  const lijsten = new WeakMap();
  function hoekenLijst(hg) {
    let l = lijsten.get(hg);
    if (l && l.versie === (hg.versie || 0)) return l.hoeken;
    const hoeken = new Float32Array(hg.b * hg.h * 4);
    for (let y = 0; y < hg.h; y++) for (let x = 0; x < hg.b; x++) for (let k = 0; k < 4; k++) hoeken[(y * hg.b + x) * 4 + k] = rekenHoek(hg, x, y, k);
    lijsten.set(hg, { versie: hg.versie || 0, hoeken });
    return hoeken;
  }
  T.hoekHoogte = function (w, x, y, k) {
    const hg = w && w.hoogte;
    if (!hg) return 0;
    if (x < 0 || y < 0 || x >= hg.b || y >= hg.h) return 0;
    return hoekenLijst(hg)[(y * hg.b + x) * 4 + k];
  };
  function rekenHoek(hg, x, y, k) {
    const vx = x + (k === 1 || k === 2 ? 1 : 0);
    const vy = y + (k >= 2 ? 1 : 0);
    const helling = hg.hellingen[sleutel(x, y)];
    const niveau = helling ? helling[k] : niveauVan(hg, x, y);
    return glooiingOp(hg, vx, vy) + niveau * hg.trede;
  }
  T.hoekHoogten = (w, x, y) => [T.hoekHoogte(w, x, y, 0), T.hoekHoogte(w, x, y, 1), T.hoekHoogte(w, x, y, 2), T.hoekHoogte(w, x, y, 3)];

  // De hoogte op een punt in de wereld (het midden van tegel (x, y) is (x, y)): tussen de vier hoeken van zijn tegel.
  T.hoogteOp = function (w, px, py) {
    if (!w || !w.hoogte) return 0;
    const x = Math.round(px);
    const y = Math.round(py);
    const u = px - (x - 0.5);
    const v = py - (y - 0.5);
    const [n, o, z, ws] = T.hoekHoogten(w, x, y);
    return n * (1 - u) * (1 - v) + o * u * (1 - v) + z * u * v + ws * (1 - u) * v;
  };

  // Is tegel (x, y) schuin (niet alle vier de hoeken even hoog)?
  T.isSchuin = function (w, x, y) {
    if (!w || !w.hoogte) return false;
    const hg = w.hoogte;
    if (x < 0 || y < 0 || x >= hg.b || y >= hg.h) return false;
    const l = hoekenLijst(hg);
    const i = (y * hg.b + x) * 4;
    return l[i] !== l[i + 1] || l[i + 1] !== l[i + 2] || l[i + 2] !== l[i + 3];
  };

  // Waar een punt op de grond op het scherm komt: zoals T.naarScherm, maar met de hoogte eraf.
  T.naarSchermOp = function (w, x, y) {
    const p = T.naarScherm(x, y);
    if (w && w.hoogte) p.y -= T.hoogteOp(w, x, y);
    return p;
  };

  // En terug, voor de muis: welke tegel ligt onder schermpunt (sx, sy)? Een tegel op een heuvel ligt hoger in beeld
  // dan T.naarWereld denkt, dus kijkt het van voor naar achter langs de tegels die daar kunnen liggen, en neemt de
  // voorste waarvan de schuine ruit het punt bevat. Geeft een punt in de wereld, zoals T.naarWereld.
  T.naarWereldOp = function (w, sx, sy) {
    const vlak = T.naarWereld(sx, sy);
    if (!w || !w.hoogte) return vlak;
    const hoogst = IN().heuvelHoog[1] + 4 * w.hoogte.trede;
    const stappen = Math.ceil(hoogst / 32) + 2; // een hoogte van 32 pixels is één tegel naar voren (x en y elk +1)
    let beste = null;
    for (let s = -1; s <= stappen; s++) {
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1]]) {
        const x = Math.round(vlak.x) + s + dx;
        const y = Math.round(vlak.y) + s + dy;
        if (x < 0 || y < 0 || x >= w.b || y >= w.h) continue;
        const raak = inRuit(w, x, y, sx, sy);
        if (raak && (!beste || x + y > beste.x + beste.y)) beste = { x, y, u: raak.u, v: raak.v };
      }
    }
    if (!beste) return vlak;
    return { x: beste.x - 0.5 + beste.u, y: beste.y - 0.5 + beste.v };
  };
  // Ligt schermpunt (sx, sy) in de schuine ruit van tegel (x, y)? Dan waar (u, v tussen 0 en 1), anders null.
  function inRuit(w, x, y, sx, sy) {
    const h = T.hoekHoogten(w, x, y);
    const p = HOEK.map(([dx, dy], k) => {
      const q = T.naarScherm(x + dx, y + dy);
      return [q.x, q.y - h[k]];
    });
    // twee driehoeken: noord-oost-zuid en noord-zuid-west, met (u, v) per hoek
    const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (const [a, b, c] of [[0, 1, 2], [0, 2, 3]]) {
      const l = bary(p[a], p[b], p[c], sx, sy);
      if (!l) continue;
      return { u: l[0] * uv[a][0] + l[1] * uv[b][0] + l[2] * uv[c][0], v: l[0] * uv[a][1] + l[1] * uv[b][1] + l[2] * uv[c][1] };
    }
    return null;
  }
  function bary(a, b, c, x, y) {
    const opp = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (Math.abs(opp) < 1e-9) return null;
    const l0 = ((b[0] - x) * (c[1] - y) - (b[1] - y) * (c[0] - x)) / opp;
    const l1 = ((c[0] - x) * (a[1] - y) - (c[1] - y) * (a[0] - x)) / opp;
    const l2 = 1 - l0 - l1;
    const E = -1e-6;
    return l0 >= E && l1 >= E && l2 >= E ? [l0, l1, l2] : null;
  }

  // Hoe licht een schuin vlak is: 1 als het vlak ligt, lichter naar de zon (linksboven op het scherm: in de wereld uit
  // het westen), donkerder ervan af. p, q, r zijn [x, y, hoogte in pixels].
  const ZON = (() => {
    const l = [-0.75, -0.15, 1];
    const n = Math.hypot(...l);
    return l.map((v) => v / n);
  })();
  T.helderheidVanVlak = function (p, q, r) {
    const a = [q[0] - p[0], q[1] - p[1], (q[2] - p[2]) / 32];
    const b = [r[0] - p[0], r[1] - p[1], (r[2] - p[2]) / 32];
    let n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    if (n[2] < 0) n = n.map((v) => -v);
    const d = (n[0] * ZON[0] + n[1] * ZON[1] + n[2] * ZON[2]) / Math.hypot(...n);
    const f = 1 + (d / ZON[2] - 1) * 1.6;
    return f < 0.5 ? 0.5 : f > 1.35 ? 1.35 : f;
  };

  // De wanden van tegel (x, y): aan zijn zuid- en oostkant (de kanten die je ziet), waar hij hoger ligt dan zijn buur.
  // Elk { kant, van: [x, y], tot: [x, y] (de rand in de wereld), boven: [h, h], onder: [h, h], soort }.
  // Een rotswand waar een richel stopt, een begroeide wal elders.
  T.wandenVan = function (w, x, y) {
    if (!w || !w.hoogte) return [];
    const uit = [];
    for (const kant of ['zuid', 'oost']) {
      const nx = kant === 'oost' ? x + 1 : x;
      const ny = kant === 'zuid' ? y + 1 : y;
      if (nx >= w.b || ny >= w.h) continue;
      const [k1, k2] = kant === 'zuid' ? [3, 2] : [1, 2];
      const [b1, b2] = kant === 'zuid' ? [0, 1] : [0, 3];
      const boven = [T.hoekHoogte(w, x, y, k1), T.hoekHoogte(w, x, y, k2)];
      const onder = [T.hoekHoogte(w, nx, ny, b1), T.hoekHoogte(w, nx, ny, b2)];
      if (boven[0] - onder[0] < 0.5 && boven[1] - onder[1] < 0.5) continue;
      const hg = w.hoogte;
      const rots = niveauVan(hg, x, y) > niveauVan(hg, nx, ny) && !hg.hellingen[sleutel(x, y)];
      uit.push({
        kant,
        van: [x + HOEK[k1][0], y + HOEK[k1][1]],
        tot: [x + HOEK[k2][0], y + HOEK[k2][1]],
        boven,
        onder,
        soort: rots ? 'rots' : 'wal',
      });
    }
    return uit;
  };

  // ---------------------------------------------------------------- de maker legt de hoogte

  // Uit het plan van de maker (js/maker.js): hoge heuvels in het wilde land, een zachte glooiing overal, vlak waar een
  // huis, het plein of het water ligt (en naar de rand van de kaart toe), en een richel met een rotswand bij de rotsen,
  // met een helling erop. Geeft wat in `w.hoogte` komt.
  T.legHoogte = function (plan) {
    const I = IN();
    const B = plan.b;
    const H = plan.h;
    const r = T.dobbelsteen((Math.imul(plan.zaad >>> 0, 2654435761) ^ 0x9e3779b9) >>> 0);
    const tussen = (a, b) => a + (b - a) * r();
    const glad = (a, b, x) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    // Wat vlak moet: de voet van een huis met zijn looppad, het plein, en het water met een rand.
    const vast = new Uint8Array((B + 1) * (H + 1));
    const zetVast = (x0, y0, x1, y1) => {
      // de hoekpunten van de tegels x0..x1, y0..y1
      for (let vy = Math.max(0, y0); vy <= Math.min(H, y1 + 1); vy++) for (let vx = Math.max(0, x0); vx <= Math.min(B, x1 + 1); vx++) vast[vy * (B + 1) + vx] = 1;
    };
    const lp = T.GEBOUWEN_INSTELLINGEN.looppad;
    for (const h of plan.huizen) zetVast(h.x - lp, h.y - lp, h.x + h.b - 1 + lp, h.y + h.d - 1 + lp);
    for (const [px, py] of plan.plein) zetVast(Math.round(px) - 1, Math.round(py) - 1, Math.round(px) + 1, Math.round(py) + 1);
    // Hoe ver het dorp is (de huizen en het plein, niet het water): daar ver vandaan is het wilde land, met de hoge heuvels.
    const dorp = afstandTot(vast.slice(), B + 1, H + 1, I.wildTot + 1);
    for (let vy = 0; vy <= H; vy++) {
      for (let vx = 0; vx <= B; vx++) {
        if (plan.grond[vy][vx] === 'w') zetVast(vx - 2, vy - 2, vx + 1, vy + 1);
      }
    }
    for (const p of plan.brug || []) zetVast(p.x - 1, p.y - 1, p.x + 1, p.y + 1);
    // Hoe ver elk hoekpunt van wat vlak moet ligt (in stappen, tot vrijRond).
    const afstand = afstandTot(vast, B + 1, H + 1, I.vrijRond + 1);

    // Het hart van het dorp: het midden van het plein (voor de helling de richel op).
    const cx = plan.plein.reduce((s, p) => s + p[0], 0) / plan.plein.length;
    const cy = plan.plein.reduce((s, p) => s + p[1], 0) / plan.plein.length;

    // De hoge heuvels, in het wilde land, en het liefst in het open: onder het bos zie je een heuvel niet.
    const heuvels = [];
    const aantal = Math.round(tussen(I.heuvels[0], I.heuvels[1] + 0.99) - 0.49);
    const bomen = new Uint16Array(B * H);
    for (const v of plan.voorwerpen) if (T.TEGELS && T.TEGELS.bomen && T.TEGELS.bomen.tiles.some((t) => t && t.naam === v.naam)) bomen[v.y * B + v.x]++;
    const bomenRond = (x, y, straal) => {
      let n = 0;
      for (let dy = -straal; dy <= straal; dy++) for (let dx = -straal; dx <= straal; dx++) {
        const tx = x + dx;
        const ty = y + dy;
        if (tx >= 0 && ty >= 0 && tx < B && ty < H) n += bomen[ty * B + tx];
      }
      return n;
    };
    const kandidaten = [];
    for (let y = 8; y < H - 8; y += 2) {
      for (let x = 8; x < B - 8; x += 2) {
        if (dorp[y * (B + 1) + x] < I.wildTot - 1) continue;
        kandidaten.push({ x: x + tussen(-1, 1), y: y + tussen(-1, 1), score: -bomenRond(x, y, 5) + tussen(0, 6) });
      }
    }
    kandidaten.sort((a, b) => b.score - a.score);
    for (const k of kandidaten) {
      if (heuvels.length >= aantal) break;
      if (heuvels.some((h) => Math.hypot(h.x - k.x, h.y - k.y) < 14)) continue;
      heuvels.push({ x: k.x, y: k.y, hoog: tussen(I.heuvelHoog[0], I.heuvelHoog[1]), straal: tussen(I.heuvelStraal[0], I.heuvelStraal[1]) });
    }
    const golfZaad = r() * 1000;

    const glooiing = new Array((B + 1) * (H + 1));
    for (let vy = 0; vy <= H; vy++) {
      for (let vx = 0; vx <= B; vx++) {
        let h = 0;
        for (const k of heuvels) {
          const d = Math.hypot(vx - k.x, vy - k.y);
          if (d < k.straal) h += k.hoog * (0.5 + 0.5 * Math.cos((Math.PI * d) / k.straal));
        }
        const wild = glad(I.wildVanaf, I.wildTot, dorp[vy * (B + 1) + vx]);
        h = h * wild + I.golf * golf(vx * 0.12 + golfZaad, vy * 0.12);
        const rand = Math.min(vx, vy, B - vx, H - vy);
        const vrij = glad(0, I.vrijRond, afstand[vy * (B + 1) + vx]) * glad(0, I.vrijRand, rand);
        glooiing[vy * (B + 1) + vx] = Math.round(h * vrij);
      }
    }

    // De richel bij de rotsen: niveau 1, met een helling naar het dorp toe.
    const niveau = {};
    const hellingen = {};
    const grootsteRotsen = (plan.rotsen || []).slice(0, 2);
    for (const k of grootsteRotsen) {
      const straal = tussen(I.richel[0], I.richel[1]);
      const fase = r() * Math.PI * 2;
      const tegels = [];
      for (let y = Math.floor(k.y - straal - 1); y <= Math.ceil(k.y + straal + 1); y++) {
        for (let x = Math.floor(k.x - straal - 1); x <= Math.ceil(k.x + straal + 1); x++) {
          if (x < 1 || y < 1 || x >= B - 1 || y >= H - 1) continue;
          const hoek = Math.atan2(y - k.y, x - k.x);
          const rr = straal * (0.85 + 0.15 * Math.sin(hoek * 3 + fase));
          if (Math.hypot(x - k.x, y - k.y) > rr) continue;
          // alleen waar het vrij is: alle vier de hoekpunten ver genoeg van wat vlak moet
          let vrij = true;
          for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (afstand[(y + dy) * (B + 1) + x + dx] < I.vrijRond) vrij = false;
          if (vrij) tegels.push([x, y]);
        }
      }
      if (tegels.length < 12) continue;
      const mag = new Set(tegels.map(([x, y]) => sleutel(x, y)));
      for (const t of mag) niveau[t] = 1;
      // twee keer gladstrijken: een uitsteeksel eraf en een inham dicht, zodat de wand niet rafelt
      for (let ronde = 0; ronde < 2; ronde++) {
        for (const t of mag) {
          const [x, y] = t.split(',').map(Number);
          const buren = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => niveau[sleutel(x + dx, y + dy)]).length;
          if (niveau[t] && buren <= 1) delete niveau[t];
          else if (!niveau[t] && buren >= 3) niveau[t] = 1;
        }
      }
      legHelling(niveau, hellingen, k, cx, cy, I.hellingBreed, B, H);
    }

    return { trede: I.trede, b: B, h: H, glooiing, niveau, hellingen };
  };

  // De helling de richel op: aan de zuid- of oostkant (de kant die je ziet), het dichtst bij het dorp. Een helling
  // ligt buiten de richel: zijn twee hoeken aan de kant van de richel liggen een trede hoger.
  function legHelling(niveau, hellingen, k, cx, cy, breed, B, H) {
    let beste = null;
    for (const s of Object.keys(niveau)) {
      const [x, y] = s.split(',').map(Number);
      for (const kant of ['zuid', 'oost']) {
        const bx = kant === 'oost' ? x + 1 : x;
        const by = kant === 'zuid' ? y + 1 : y;
        // de helling is `breed` tegels langs de rand; alle moeten naast de richel liggen, en zelf niet op de richel
        const langs = kant === 'zuid' ? [1, 0] : [0, 1];
        let past = true;
        for (let i = 0; i < breed; i++) {
          const hx = bx + langs[0] * i;
          const hy = by + langs[1] * i;
          const rx = x + langs[0] * i;
          const ry = y + langs[1] * i;
          if (hx >= B - 1 || hy >= H - 1 || niveau[hx + ',' + hy] || !niveau[rx + ',' + ry]) past = false;
        }
        if (!past) continue;
        const d = Math.hypot(bx - cx, by - cy);
        if (!beste || d < beste.d) beste = { bx, by, kant, langs, d };
      }
    }
    if (!beste) return;
    for (let i = 0; i < breed; i++) {
      const hx = beste.bx + beste.langs[0] * i;
      const hy = beste.by + beste.langs[1] * i;
      // noord, oost, zuid, west: de kant van de richel een trede hoger
      hellingen[hx + ',' + hy] = beste.kant === 'zuid' ? [1, 1, 0, 0] : [1, 0, 0, 1];
    }
  }

  // Hoeveel stappen (in acht richtingen) elk punt van een raster van een gezet punt ligt, tot `tot`.
  function afstandTot(gezet, b, h, tot) {
    const uit = new Float32Array(b * h).fill(tot);
    let rand = [];
    for (let i = 0; i < b * h; i++) if (gezet[i]) { uit[i] = 0; rand.push(i); }
    for (let d = 1; d < tot && rand.length; d++) {
      const volgende = [];
      for (const i of rand) {
        const x = i % b;
        const y = (i - x) / b;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= b || ny >= h) continue;
            const j = ny * b + nx;
            if (uit[j] > d) { uit[j] = d; volgende.push(j); }
          }
        }
      }
      rand = volgende;
    }
    return uit;
  }

  // Een zachte golving tussen -0,5 en 0,5 (twee lagen gladde ruis).
  function golf(x, y) {
    return ruis(x, y) * 0.7 + ruis(x * 2.1 + 17, y * 2.1 + 5) * 0.3 - 0.5;
  }
  function ruis(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = hasj(xi, yi);
    const b = hasj(xi + 1, yi);
    const c = hasj(xi, yi + 1);
    const d = hasj(xi + 1, yi + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function hasj(x, y) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
})(globalThis.Spel = globalThis.Spel || {});
