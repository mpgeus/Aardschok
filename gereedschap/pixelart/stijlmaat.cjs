// Stijlmaten: een paar getallen over een sprite, om hem naast een voorbeeld te leggen (de HD-proef, werklijst vraag 180;
// gereedschap/ai/hd-wielproef.md). Geen oordeel over mooi: wel of het licht warm is, de schaduw diep, het contrast groot,
// hoeveel kleuren er zijn, en hoe druk het beeld is. Een drukker beeld is niet beter (Marcel, 18 okt: "Beschouw meer
// hoogfrequente pixelverschillen niet automatisch als hogere artistieke kwaliteit"); het getal zegt alleen hoe druk.
//
// stijlmaat({ b, h, rgba }) → { kleuren, licht, schaduw, contrast, warmte, verzadiging, druk, lijn }
//   kleuren      verschillende kleuren in wat dekt
//   licht        de helderheid (0 tot 255) waar de lichtste 5% begint, schaduw waar de donkerste 5% ophoudt; contrast het verschil
//   warmte       rood min blauw in de lichtste 15% (warm licht is positief)
//   verzadiging  gemiddeld (max - min) / max van de kleur
//   druk         het deel van de pixels binnenin dat meer dan 24 in helderheid van een buur verschilt
//   lijn         het deel van de pixels dat donker (onder 40) is en aan de rand of een donkere naad ligt
'use strict';

const helder = (r, i) => 0.299 * r.rgba[i * 4] + 0.587 * r.rgba[i * 4 + 1] + 0.114 * r.rgba[i * 4 + 2];
const dekt = (r, i) => r.rgba[i * 4 + 3] >= 128;

function stijlmaat(r) {
  const L = [];
  const kleuren = new Set();
  let verz = 0;
  let druk = 0;
  let binnen = 0;
  let lijn = 0;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.b; x++) {
    const i = y * r.b + x;
    if (!dekt(r, i)) continue;
    const k = [r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2]];
    kleuren.add((k[0] << 16) | (k[1] << 8) | k[2]);
    const l = helder(r, i);
    L.push([l, k[0] - k[2]]);
    const mx = Math.max(...k);
    verz += mx ? (mx - Math.min(...k)) / mx : 0;
    const buren = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => (x + dx < 0 || y + dy < 0 || x + dx >= r.b || y + dy >= r.h ? -1 : (y + dy) * r.b + x + dx));
    const rand = buren.some((j) => j < 0 || !dekt(r, j));
    if (l < 40) lijn++;
    if (rand) continue;
    binnen++;
    if (buren.some((j) => Math.abs(helder(r, j) - l) > 24)) druk++;
  }
  const n = L.length || 1;
  const gesorteerd = L.map((a) => a[0]).sort((a, b) => a - b);
  const p = (q) => gesorteerd[Math.min(gesorteerd.length - 1, Math.floor(q * gesorteerd.length))] || 0;
  const drempel = p(0.85);
  const licht15 = L.filter((a) => a[0] >= drempel);
  return {
    kleuren: kleuren.size,
    licht: Math.round(p(0.95)),
    schaduw: Math.round(p(0.05)),
    contrast: Math.round(p(0.95) - p(0.05)),
    warmte: Math.round(licht15.reduce((s, a) => s + a[1], 0) / Math.max(1, licht15.length)),
    verzadiging: +(verz / n).toFixed(2),
    druk: +(druk / Math.max(1, binnen)).toFixed(2),
    lijn: +(lijn / n).toFixed(2),
  };
}

// ---------------------------------------------------------------- ontleden (de stijlproef, Marcels zesde opdracht)
//
// Een sprite en een voorbeeld op dezelfde manier uit elkaar halen, op kleur (zo meet je een AI-beeld en een render met
// dezelfde maat; gereedschap/ai/hd-stijl.md): per materiaal de kleuren, de tonen, licht, middel en donker, en de
// verschuiving van de tint tussen schaduw en licht; de clusters van pixels; de randen en de lijnen binnenin.

// Het materiaal van een kleur: lijn (heel donker), ijzer (grijs of blauwig), hout (oranje tot bruin), anders.
function soortVan(r, g, b) {
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  if (l < 38) return 'lijn';
  const mx = Math.max(r, g, b);
  const verz = mx ? (mx - Math.min(r, g, b)) / mx : 0;
  if (verz < 0.25 || b >= r - 5) return 'ijzer';
  if (r > b + 20) return 'hout';
  return 'anders';
}
const lum = (k) => 0.299 * k[0] + 0.587 * k[1] + 0.114 * k[2];
// De tint in graden (0 rood, 30 oranje, 60 geel, 220 blauw).
function tint(k) {
  const [r, g, b] = k.map((c) => c / 255);
  const mx = Math.max(r, g, b);
  const d = mx - Math.min(r, g, b);
  if (d < 1e-6) return 0;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}
// De tonen van een stel kleuren: k-means (begonnen bij een mediaansnede), van donker naar licht, met hun aandeel.
function tonen(kleuren, k) {
  if (!kleuren.length) return [];
  const { palet } = require('./textuur.cjs');
  let c = palet(kleuren, k);
  let tel = [];
  for (let ronde = 0; ronde < 12; ronde++) {
    const som = c.map(() => [0, 0, 0]);
    tel = c.map(() => 0);
    for (const q of kleuren) {
      let beste = 0;
      let bd = Infinity;
      c.forEach((p, j) => {
        const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
        if (d < bd) [bd, beste] = [d, j];
      });
      tel[beste]++;
      for (let j = 0; j < 3; j++) som[beste][j] += q[j];
    }
    c = c.map((p, j) => (tel[j] ? som[j].map((s) => Math.round(s / tel[j])) : p));
  }
  return c.map((p, j) => ({ k: p, deel: +(tel[j] / kleuren.length).toFixed(3) })).filter((t) => t.deel > 0).sort((a, b) => lum(a.k) - lum(b.k));
}
const kwantiel = (a, q) => (a.length ? a[Math.min(a.length - 1, Math.floor(q * a.length))] : 0);
const gemKleur = (lijst) => [0, 1, 2].map((j) => Math.round(lijst.reduce((s, k) => s + k[j], 0) / Math.max(1, lijst.length)));

// ontleed(r, o) → per materiaal, de clusters en de randen. o.soort(i, k): een eigen indeling (anders soortVan); o.tonen:
// hoeveel tonen per materiaal (8). Licht, middel en donker op vaste grenzen van de helderheid (75 en 145), zodat twee
// beelden te vergelijken zijn.
function ontleed(r, o = {}) {
  const soort = new Array(r.b * r.h).fill(null);
  const kl = (i) => [r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2]];
  const per = {};
  let n = 0;
  for (let i = 0; i < r.b * r.h; i++) {
    if (!dekt(r, i)) continue;
    const k = kl(i);
    soort[i] = o.soort ? o.soort(i, k) : soortVan(...k);
    (per[soort[i]] || (per[soort[i]] = [])).push(k);
    n++;
  }
  const uit = { pixels: n, aandeel: {}, materiaal: {} };
  for (const [s, lijst] of Object.entries(per)) uit.aandeel[s] = +(lijst.length / n).toFixed(3);
  for (const s of ['hout', 'ijzer']) {
    const lijst = per[s] || [];
    if (!lijst.length) continue;
    const L = lijst.map(lum).sort((a, b) => a - b);
    const opL = [...lijst].sort((a, b) => lum(a) - lum(b));
    const donker20 = opL.slice(0, Math.max(1, Math.floor(opL.length * 0.2)));
    const licht20 = opL.slice(Math.floor(opL.length * 0.8));
    const gd = gemKleur(donker20);
    const gl = gemKleur(licht20);
    uit.materiaal[s] = {
      gem: gemKleur(lijst),
      tint: tint(gemKleur(lijst)),
      verzadiging: +(lijst.reduce((t, k) => t + (Math.max(...k) ? (Math.max(...k) - Math.min(...k)) / Math.max(...k) : 0), 0) / lijst.length).toFixed(2),
      helderheid: { p5: Math.round(kwantiel(L, 0.05)), p50: Math.round(kwantiel(L, 0.5)), p95: Math.round(kwantiel(L, 0.95)) },
      donkerMiddelLicht: [L.filter((l) => l < 75).length, L.filter((l) => l >= 75 && l < 145).length, L.filter((l) => l >= 145).length].map((x) => +(x / L.length).toFixed(2)),
      // de schaduw en het licht: de gemiddelde kleur van de donkerste en de lichtste 20%, hun tint, en rood min blauw
      schaduw: { k: gd, tint: tint(gd), roodMinBlauw: gd[0] - gd[2] },
      licht: { k: gl, tint: tint(gl), roodMinBlauw: gl[0] - gl[2] },
      tonen: tonen(lijst, o.tonen || 8),
    };
  }
  // de clusters: het beeld naar 16 kleuren (zijn eigen tonen), dan stukken van één kleur die aan elkaar grenzen (vier
  // buren); hoeveel pixels in stukken van 1, 2 à 3, 4 tot 9, en 10 of meer
  const alle = [];
  for (let i = 0; i < r.b * r.h; i++) if (soort[i]) alle.push(kl(i));
  const P = tonen(alle, 16).map((t) => t.k);
  const idx = new Int16Array(r.b * r.h).fill(-1);
  for (let i = 0; i < r.b * r.h; i++) {
    if (!soort[i]) continue;
    const k = kl(i);
    let beste = 0;
    let bd = Infinity;
    P.forEach((p, j) => {
      const d = (p[0] - k[0]) ** 2 + (p[1] - k[1]) ** 2 + (p[2] - k[2]) ** 2;
      if (d < bd) [bd, beste] = [d, j];
    });
    idx[i] = beste;
  }
  const stukken = stukGroottes(idx, r.b, r.h);
  const bak = [0, 0, 0, 0];
  for (const g of stukken) bak[g === 1 ? 0 : g <= 3 ? 1 : g <= 9 ? 2 : 3] += g;
  uit.clusters = {
    stukken: stukken.length,
    gemiddeld: +(n / Math.max(1, stukken.length)).toFixed(1),
    pixelsIn: { '1': +(bak[0] / n).toFixed(2), '2-3': +(bak[1] / n).toFixed(2), '4-9': +(bak[2] / n).toFixed(2), '10+': +(bak[3] / n).toFixed(2) },
  };
  // de randen: van de pixels aan de buitenrand het deel dat donker is (onder 55), hoe dik die donkere rand naar binnen is,
  // en binnenin (twee pixels van de rand af) het deel dat donker is: de lijnen binnenin
  let rand = 0;
  let donkerRand = 0;
  let dikte = 0;
  let binnen = 0;
  let binnenDonker = 0;
  const L = (i) => lum(kl(i));
  const dekI = (x, y) => x >= 0 && y >= 0 && x < r.b && y < r.h && soort[y * r.b + x] !== null;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.b; x++) {
    const i = y * r.b + x;
    if (soort[i] === null) continue;
    const buiten = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dy]) => !dekI(x + dx, y + dy));
    if (buiten) {
      rand++;
      if (L(i) < 55) {
        donkerRand++;
        let d = 0;
        let xx = x;
        let yy = y;
        while (d < 6 && dekI(xx, yy) && L(yy * r.b + xx) < 55) {
          d++;
          xx -= buiten[0];
          yy -= buiten[1];
        }
        dikte += d;
      }
      continue;
    }
    let dichtBijRand = false;
    for (let dy = -2; dy <= 2 && !dichtBijRand; dy++) for (let dx = -2; dx <= 2; dx++) if (!dekI(x + dx, y + dy)) { dichtBijRand = true; break; }
    if (dichtBijRand) continue;
    binnen++;
    if (L(i) < 45) binnenDonker++;
  }
  uit.randen = {
    donkereRand: +(donkerRand / Math.max(1, rand)).toFixed(2),
    dikte: +(dikte / Math.max(1, donkerRand)).toFixed(2),
    lijnenBinnenin: +(binnenDonker / Math.max(1, binnen)).toFixed(3),
  };
  uit.stijl = stijlmaat(r);
  return uit;
}
// De groottes van de stukken van één waarde die aan elkaar grenzen (vier buren); -1 doet niet mee.
function stukGroottes(idx, b, h) {
  const gezien = new Uint8Array(b * h);
  const uit = [];
  const stapel = [];
  for (let s = 0; s < b * h; s++) {
    if (idx[s] < 0 || gezien[s]) continue;
    let g = 0;
    stapel.push(s);
    gezien[s] = 1;
    while (stapel.length) {
      const i = stapel.pop();
      g++;
      const x = i % b;
      const y = (i - x) / b;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= b || yy >= h) continue;
        const j = yy * b + xx;
        if (!gezien[j] && idx[j] === idx[s]) {
          gezien[j] = 1;
          stapel.push(j);
        }
      }
    }
    uit.push(g);
  }
  return uit;
}

module.exports = { stijlmaat, ontleed, soortVan, tonen, tint, stukGroottes };
