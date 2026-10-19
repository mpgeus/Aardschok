// De stijlproef met het wagenwiel (werklijst vraag 180; Marcels zesde opdracht in gereedschap/ai/opdracht-comfyui.md, het
// verslag in gereedschap/ai/hd-stijl.md): van een nette 3D-render naar pixel art zoals het ChatGPT-wiel. Variant C van de
// HD-proef (hdproef.cjs: de betere geometrie en de AI-materialen), op de productiestandaard (Marcel, 18 okt: 4× intern,
// een sprite van 2×), met de stijlafwerking (stijl.cjs) op de doelmaat. Dezelfde geometrie, afwikkeling, camera, stand en
// schaal in elke variant; alleen wat er na de render gebeurt, verschilt:
//
//   A  zoals nu: de render op 4×, met box verkleind tot 2×, 64 kleuren, een omlijning van één pixel (hdresolutie.cjs);
//   B  kleuren en licht: per materiaal een kleurreeks (koel in de schaduw, warm in het licht; stijl.cjs `reeks`, met de
//      maten van het doel), even ver uit elkaar op het licht;
//   C  B met de nerf, de variatie, het metaal en de clusters;
//   D  alles (ook contactschaduw, lichte randen, binnenlijnen, slijtage, omlijning in kleur), met de tonen en de verdeling
//      van licht, middel en donker van het doel zelf.
//
// En een ladder van B naar D, bij elke trede één stap, om te zien wat wat doet.
//
//   node gereedschap/pixelart/hdstijl.cjs ijk              de ijking: het doel ontleden, de stijlen en drempels (ijk.json)
//   node gereedschap/pixelart/hdstijl.cjs proef            zuidwest, stand 0: de varianten en de ladder (om af te stellen)
//   node gereedschap/pixelart/hdstijl.cjs render <kant>    een richting, acht standen en een volle slag (dat doet alles)
//   node gereedschap/pixelart/hdstijl.cjs platen           de platen en de metingen uit wat er gerenderd is
//   node gereedschap/pixelart/hdstijl.cjs alles            ijk, de acht richtingen tegelijk, en de platen
'use strict';
const fs = require('fs');
const path = require('path');
const v8 = require('v8');
const { execFile } = require('child_process');
const K = require('./kern.cjs');
const H = require('./hdproef.cjs');
const S = require('./stijl.cjs');
const SM = require('./stijlmaat.cjs');
const TX = require('./textuur.cjs');
const E = require('../ai/etiket.cjs');
const { apng } = require('./apng.cjs');

const UIT = path.join(__dirname, 'uit', 'hdstijl');
const FIJN = 4; // de interne resolutie
const DOEL = 2; // de sprite
const STANDEN = H.STANDEN; // acht standen en een volle slag
// De ijking op de kant van het doel (zuidwest), in twee standen: zo klopt de verdeling waar het doel hem laat zien; de
// andere kanten zijn lichter of donkerder zoals de zon het wil.
const IJK = [['ZW', 0], ['ZW', 4]];
const TONEN = { hout: 7, ijzer: 6 };
const VARIANT = H.VARIANTEN.C;
const PALET_A = 64;
const BRON = path.join(__dirname, 'uit', 'ai', 'hand', 'wagen-zw.png.png'); // niet in git

// ---------------------------------------------------------------- render: op 4×, met de G-buffer

// Eén beeld: de buffers die stijl.cjs gbuffer leest, en de render zelf zonder omlijning (voor A). Met cache bewaard (het
// afstellen rendert dan niet opnieuw; 31 MB per beeld, dus alleen voor de ijking en de proef).
// forser: de maten binnenin zoals op de ChatGPT-wagen (hdproef.cjs wielC); alleen voor een kijkje buiten de opdracht.
function render(kant, s, cache = false, forser = false) {
  const pad = path.join(UIT, 'cache', `${kant}-${s}${forser ? '-forser' : ''}.bin`);
  if (cache && fs.existsSync(pad)) return v8.deserialize(fs.readFileSync(pad));
  const B = new K.Beeld(H.CEL[0] * FIJN, H.CEL[1] * FIJN, H.CEL[2] * FIJN, H.CEL[3] * FIJN);
  const model = H.wielModel(forser ? { ...VARIANT, forser } : VARIANT, STANDEN[s].hoek);
  const t0 = process.hrtime.bigint();
  K.tekenModel(B, model, { richting: kant, rust: true, gbuffer: true, fijn: FIJN });
  K.belicht(B);
  const zl = K.kleurBeeld(B);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  // de nagels: de onderdelen zonder afwikkeling (onderdelen.cjs nagel en nagelKring)
  const nagels = model.delen.map((d, i) => (TX.uvVan(d) ? -1 : i)).filter((i) => i >= 0);
  const uit = { b: B.b, h: B.h, ramp: B.ramp, stap: B.stap, diep: B.diep, deel: B.deel, nrm: B.nrm, rust: B.rust, albedo: B.albedo, g: B.g, kleur: B.kleur, zl, ms, nagels };
  if (cache) {
    fs.mkdirSync(path.dirname(pad), { recursive: true });
    fs.writeFileSync(pad, v8.serialize(uit));
  }
  return uit;
}

// A: zoals de resolutieproef het aanbeval (box, het palet, een omlijning op de doelmaat).
const afmaken = (r, P) => H.naarPalet(H.omlijnBeeld(H.naarPalet(r, P)), P);
const variantA = (R, P) => afmaken(H.verklein(R.zl, FIJN / DOEL, 'filter'), P);

// ---------------------------------------------------------------- het doel op dezelfde grootte

// Het ChatGPT-wiel, alleen het wiel: buiten de ellips van het wiel, het magenta (ook de randjes) en het rood van de bak
// tussen de spaken doorzichtig, en daarna wat niet aan het wiel vastzit (losse stukjes bak). (hdproef.cjs refWiel met
// alleenWiel gooide ook veel oranje hout weg: R > 1,7 G haalt een fel stuk hout ook weg.)
function doelWiel() {
  const A = require('../ai/beeld-ai.cjs');
  const s = H.refWiel(A.leesPng(fs.readFileSync(BRON)), false);
  const { b, h } = s;
  // de ellips van het wiel (met de hand gepast), en per graad rondom hoe ver de band (grijs) naar buiten komt: wat
  // daarbuiten ligt (de balk van de bak linksboven) is geen wiel; de donkere lijn om de band (zo'n vijf pixels) wel
  const ell = (x, y) => [(x - 172) / 168, (y - 220) / 213];
  const verst = new Float32Array(360);
  for (let i = 0; i < b * h; i++) {
    const [R, G, B] = [s.rgba[i * 4], s.rgba[i * 4 + 1], s.rgba[i * 4 + 2]];
    const mx = Math.max(R, G, B);
    if (s.rgba[i * 4 + 3] < 128 || mx < 50 || (mx - Math.min(R, G, B)) / mx >= 0.2) continue;
    const [ex, ey] = ell(i % b, Math.floor(i / b));
    const q = Math.hypot(ex, ey);
    if (q < 0.75) continue;
    const g = Math.floor(((Math.atan2(ey, ex) * 180) / Math.PI + 360) % 360);
    verst[g] = Math.max(verst[g], q);
  }
  // de mediaan over twaalf graden: een paar grijze pixels in de balk tellen niet
  const grens = Array.from(verst, (_, g) => {
    const a = [];
    for (let d = -6; d <= 6; d++) a.push(verst[(g + d + 360) % 360]);
    a.sort((p, q) => p - q);
    return (a[6] || 1) + 0.03;
  });
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const i = y * b + x;
    const [R, G, B] = [s.rgba[i * 4], s.rgba[i * 4 + 1], s.rgba[i * 4 + 2]];
    const [ex, ey] = ell(x, y);
    const q = Math.hypot(ex, ey);
    const g = Math.floor(((Math.atan2(ey, ex) * 180) / Math.PI + 360) % 360);
    const magenta = R > 90 && B > 90 && G < 0.6 * Math.min(R, B);
    const rood = R > 50 && R > 2.4 * G && R > 2.0 * B;
    if (q > 1 || q > grens[g] || magenta || rood) s.rgba[i * 4 + 3] = 0;
  }
  // het grootste stuk dat aan elkaar zit (acht buren), en verder niets
  const stuk = new Int32Array(b * h).fill(-1);
  const groottes = [];
  for (let s0 = 0; s0 < b * h; s0++) {
    if (s.rgba[s0 * 4 + 3] < 128 || stuk[s0] >= 0) continue;
    const n = groottes.length;
    const stapel = [s0];
    stuk[s0] = n;
    let g = 0;
    while (stapel.length) {
      const i = stapel.pop();
      g++;
      const x = i % b;
      const y = (i - x) / b;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= b || yy >= h) continue;
        const j = yy * b + xx;
        if (stuk[j] < 0 && s.rgba[j * 4 + 3] >= 128) {
          stuk[j] = n;
          stapel.push(j);
        }
      }
    }
    groottes.push(g);
  }
  const grootste = groottes.indexOf(Math.max(...groottes));
  for (let i = 0; i < b * h; i++) if (stuk[i] !== grootste) s.rgba[i * 4 + 3] = 0;
  return s;
}
// Het doel op een wielhoogte van `hoogte` pixels: per pixel de kleur in het midden (geen nieuwe kleuren, zoals het
// getekend is).
function doelOpMaat(hoogte) {
  if (!fs.existsSync(BRON)) return null;
  const w = doelWiel();
  const f = H.REF_HOOGTE / hoogte;
  const b = Math.floor(w.b / f);
  const h = Math.floor(w.h / f);
  const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const s = (Math.floor((y + 0.5) * f) * w.b + Math.floor((x + 0.5) * f)) * 4;
    w.rgba.copy(uit.rgba, (y * b + x) * 4, s, s + 4);
  }
  return uit;
}
// De hoogte van wat dekt.
function hoogteVan(r) {
  let y0 = Infinity;
  let y1 = -1;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.b; x++) if (r.rgba[(y * r.b + x) * 4 + 3] >= 128) {
    y0 = Math.min(y0, y);
    y1 = y;
  }
  return y1 - y0 + 1;
}

// ---------------------------------------------------------------- ontleden: wat is waar op het wiel

// De ellips van een wiel: de momenten van wat dekt, met de gaten tussen de spaken dicht (wat niet van buiten bereikbaar
// is, telt mee). Het midden (cx, cy) en de covariantie (xx, xy, yy): de rand van de ellips ligt op twee standaardafwijkingen.
function ellipsVan(r) {
  const { b, h } = r;
  const dekt = (i) => r.rgba[i * 4 + 3] >= 128;
  const buiten = new Uint8Array(b * h);
  const stapel = [];
  for (let x = 0; x < b; x++) for (const y of [0, h - 1]) stapel.push(y * b + x);
  for (let y = 0; y < h; y++) for (const x of [0, b - 1]) stapel.push(y * b + x);
  while (stapel.length) {
    const i = stapel.pop();
    if (buiten[i] || dekt(i)) continue;
    buiten[i] = 1;
    const x = i % b;
    const y = (i - x) / b;
    if (x > 0) stapel.push(i - 1);
    if (x < b - 1) stapel.push(i + 1);
    if (y > 0) stapel.push(i - b);
    if (y < h - 1) stapel.push(i + b);
  }
  let n = 0, sx = 0, sy = 0;
  for (let i = 0; i < b * h; i++) if (!buiten[i]) { n++; sx += i % b; sy += Math.floor(i / b); }
  const cx = sx / n, cy = sy / n;
  let xx = 0, xy = 0, yy = 0;
  for (let i = 0; i < b * h; i++) if (!buiten[i]) {
    const dx = (i % b) - cx, dy = Math.floor(i / b) - cy;
    xx += dx * dx; xy += dx * dy; yy += dy * dy;
  }
  return { cx, cy, xx: xx / n, xy: xy / n, yy: yy / n };
}

// Het wiel als ellips (ellipsVan): per pixel de straal (0 in het midden, 1 op de rand) en de hoek op het scherm. Daarmee:
// de spaken (hout tussen 0,28 en 0,6), de velg (hout tussen 0,6 en de binnenkant van de band), de band (ijzer daarbuiten).
function wielMaten(r) {
  const { b, h } = r;
  const dekt = (i) => r.rgba[i * 4 + 3] >= 128;
  const { cx, cy, xx, xy, yy } = ellipsVan(r);
  const det = xx * yy - xy * xy;
  const straal = (x, y) => {
    const dx = x - cx, dy = y - cy;
    return Math.sqrt(((yy * dx * dx - 2 * xy * dx * dy + xx * dy * dy) / det) / 4);
  };
  const L = (i) => 0.299 * r.rgba[i * 4] + 0.587 * r.rgba[i * 4 + 1] + 0.114 * r.rgba[i * 4 + 2];
  const soort = (i) => SM.soortVan(r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2]);
  const ijzerR = [];
  for (let i = 0; i < b * h; i++) if (dekt(i) && soort(i) === 'ijzer') {
    const q = straal(i % b, Math.floor(i / b));
    if (q > 0.6) ijzerR.push(q);
  }
  ijzerR.sort((a, c) => a - c);
  const bandBinnen = ijzerR.length ? ijzerR[Math.floor(ijzerR.length * 0.1)] : 0.9;
  const spaak = [], velg = [], band = [], hout = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const i = y * b + x;
    if (!dekt(i)) continue;
    const q = straal(x, y);
    const s = soort(i);
    const hoek = Math.atan2(y - cy, x - cx);
    if (s === 'hout') {
      hout.push(i);
      if (q > 0.28 && q < 0.6) spaak.push([i, hoek]);
      else if (q >= 0.6 && q < bandBinnen) velg.push([i, hoek]);
    } else if (s === 'ijzer' && q >= bandBinnen) band.push([i, hoek]);
  }
  const std = (a) => {
    const m = a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);
    return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(1, a.length));
  };
  const sectoren = (lijst, n, f) => {
    const bak = Array.from({ length: n }, () => []);
    for (const [i, hoek] of lijst) bak[Math.floor(((hoek + Math.PI) / (2 * Math.PI)) * n) % n].push(f(i));
    return bak.map((a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null));
  };
  // de spaken: het contrast (de spreiding en p95 - p5) en hoe druk (het gemiddelde verschil met een buur in de spaak)
  const spaakSet = new Set(spaak.map(([i]) => i));
  let buur = 0, nb = 0;
  for (const i of spaakSet) for (const j of [i + 1, i + b]) if (spaakSet.has(j)) { buur += Math.abs(L(i) - L(j)); nb++; }
  const sl = spaak.map(([i]) => L(i)).sort((a, c) => a - c);
  // de velg en de spaken in twaalf (en acht) vakken rondom: hoe verschillend de vakken zijn in helderheid en tint
  const tintVan = (i) => SM.tint([r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2]]);
  const velgL = sectoren(velg, 12, L).filter((v) => v !== null);
  const velgT = sectoren(velg, 12, tintVan).filter((v) => v !== null);
  const spaakL = sectoren(spaak, 8, L).filter((v) => v !== null);
  // het licht: de band in twaalf vakken; waar hij het lichtst is (graden op het scherm: 0 rechts, 90 onder, 180 links,
  // 270 boven), en de verhouding lichtst / donkerst
  const bandL = sectoren(band, 12, L);
  let best = 0;
  bandL.forEach((v, k) => { if (v !== null && v > bandL[best]) best = k; });
  const geldig = bandL.filter((v) => v !== null);
  // contactschaduw: hout naast ijzer of een lijn, tegen het andere hout
  let naast = 0, nn = 0, rest = 0, nr = 0;
  for (const i of hout) {
    const x = i % b, y = (i - x) / b;
    let raak = false;
    for (let dy = -1; dy <= 1 && !raak; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx2 = x + dx, yy2 = y + dy;
      if (xx2 < 0 || yy2 < 0 || xx2 >= b || yy2 >= h) continue;
      const j = yy2 * b + xx2;
      if (dekt(j) && (soort(j) === 'ijzer' || soort(j) === 'lijn')) { raak = true; break; }
    }
    if (raak) { naast += L(i); nn++; } else { rest += L(i); nr++; }
  }
  // de ellips: de hoek van de lange as (graden; 90 is rechtop) en de verhouding korte / lange as
  const l1 = (xx + yy) / 2 + Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy);
  const l2 = (xx + yy) / 2 - Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy);
  return {
    ellips: { hoek: Math.round((((0.5 * Math.atan2(2 * xy, xx - yy) * 180) / Math.PI) + 180) % 180), verhouding: +Math.sqrt(l2 / l1).toFixed(2) },
    spaken: { pixels: spaak.length, spreiding: +std(sl).toFixed(1), p95minp5: Math.round((sl[Math.floor(sl.length * 0.95)] || 0) - (sl[Math.floor(sl.length * 0.05)] || 0)), buurVerschil: +(buur / Math.max(1, nb)).toFixed(1), vakkenSpreiding: +std(spaakL).toFixed(1) },
    velg: { pixels: velg.length, vakkenHelderheid: +std(velgL).toFixed(1), vakkenTint: +std(velgT).toFixed(1) },
    licht: { lichtsteVak: Math.round(((best + 0.5) / 12) * 360 - 180 + 360) % 360, lichtTegenDonker: +(Math.max(...geldig) / Math.max(1, Math.min(...geldig))).toFixed(2) },
    contact: { houtNaastIjzerOfLijn: +((naast / Math.max(1, nn)) / Math.max(1, rest / Math.max(1, nr))).toFixed(2) },
  };
}
const ontleedWiel = (r) => ({ ...SM.ontleed(r), wiel: wielMaten(r) });

// Een ontleding in een paar regels.
function kort(naam, o) {
  const m = (s) => {
    const x = o.materiaal[s];
    if (!x) return `${s}: -`;
    return `${s} ${Math.round(o.aandeel[s] * 100)}%: gem ${x.gem} tint ${x.tint} verz ${x.verzadiging} L ${x.helderheid.p5}/${x.helderheid.p50}/${x.helderheid.p95} dml ${x.donkerMiddelLicht} schaduw ${x.schaduw.tint}°/${x.schaduw.roodMinBlauw} licht ${x.licht.tint}°/${x.licht.roodMinBlauw} tonen ${x.tonen.map((t) => `${Math.round(0.299 * t.k[0] + 0.587 * t.k[1] + 0.114 * t.k[2])}:${Math.round(t.deel * 100)}`).join(' ')}`;
  };
  return [`${naam}: ${o.pixels} px, lijn ${Math.round((o.aandeel.lijn || 0) * 100)}%, anders ${Math.round((o.aandeel.anders || 0) * 100)}%`, '  ' + m('hout'), '  ' + m('ijzer'),
    `  clusters ${JSON.stringify(o.clusters)} randen ${JSON.stringify(o.randen)}`, `  stijl ${JSON.stringify(o.stijl)}`, `  wiel ${JSON.stringify(o.wiel)}`].join('\n');
}

// ---------------------------------------------------------------- de stijlen

// Een stijl per variant: per materiaal (de naam van de ramp in kern.cjs) de kleurreeks en wat de stappen doen. De drempels
// en ref komen uit de ijking.
function stijlVan(doel, metDoelTonen) {
  const D = doel.materiaal;
  // De lijn: de donkerste toon van het doel, nog wat donkerder (op het doel is een lijn bruinzwart, niet zwart).
  const lijnVan = (t) => t[0].k.map((c) => Math.round(c * 0.5));
  const kunst = (s, n) => {
    // de reeks uit stijl.cjs, met de maten van het doel: de gemiddelde kleur, de helderheid van de donkerste en de
    // lichtste toon, en hoeveel de tint verschuift
    const t = D[s].tonen;
    const L = (k) => S.naarLch(k)[0];
    const h = (k) => S.naarLch(k)[2];
    const hg = h(D[s].gem);
    const verschuif = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
    return S.reeks(D[s].gem, n, { donker: L(t[0].k), licht: L(t[t.length - 1].k), koel: Math.max(8, verschuif(h(t[0].k), hg)), warm: Math.max(8, verschuif(h(t[t.length - 1].k), hg)), verzadiging: 1.1 });
  };
  const tonenVan = (s, n) => (metDoelTonen ? SM.tonen(doel.kleuren[s], n).map((t) => t.k) : kunst(s, n));
  return {
    materialen: {
      hout: {
        reeks: tonenVan('hout', TONEN.hout),
        // B en C: de standaardverdeling van stijl.cjs; D: die van het doel (de ijking), met de lichtste toon alleen voor
        // de lichte randen
        verdeling: S.verdeling(TONEN.hout),
        topVoorAccent: metDoelTonen,
        lijn: lijnVan(D.hout.tonen),
        textuur: 0.7,
        glans: 0,
        nerf: { afstand: 1.6, breedte: 0.42, lengte: 3.2, gat: 0.45, golf: 0.3, drempel: 0.4, stap: -2 },
        variatie: { stuk: 0.08, ruis: 0.08, schaal: 3 },
        contact: { holte: 0.6, voor: 0.8, stap: 1 },
        accent: { nL: 0.35, stap: 1 },
        slijt: { vanaf: 0.5, gat: 0.45, stuk: 0.8, stap: 1 },
      },
      ijzer: {
        reeks: tonenVan('ijzer', TONEN.ijzer),
        verdeling: S.verdeling(TONEN.ijzer),
        topVoorAccent: metDoelTonen,
        lijn: lijnVan(D.ijzer.tonen),
        textuur: 0.35,
        glans: 0.6,
        metaal: { glimlicht: 0.14, bol: 0.5 },
        variatie: { stuk: 0.03, ruis: 0.05, schaal: 2 },
        contact: { holte: 0.5, voor: 0.8, stap: 1 },
        accent: { nL: 0.3, stap: 1 },
        slijt: { vanaf: 0.4, gat: 0.3, stuk: 0.6, stap: 1 },
      },
    },
    clusters: { glad: 2 },
    binnenlijnen: { voor: 1.2 },
  };
}
const ALLES = { reeksen: true, nerf: true, variatie: true, metaal: true, clusters: true, contact: true, accent: true, binnenlijnen: true, slijt: true, selOmlijning: true };
const VARIANTEN = {
  B: { naam: 'B: kleuren en licht', stijl: 'kunst', st: { reeksen: true } },
  C: { naam: 'C: materiaalgericht', stijl: 'kunst', st: { reeksen: true, nerf: true, variatie: true, metaal: true, clusters: true } },
  D: { naam: 'D: volledige stijl', stijl: 'doel', st: ALLES },
};
const C_ST = VARIANTEN.C.st;
const LADDER = [
  { naam: 'B: kleurreeksen', stijl: 'kunst', st: { reeksen: true } },
  { naam: '+ nerf', stijl: 'kunst', st: { reeksen: true, nerf: true } },
  { naam: '+ variatie', stijl: 'kunst', st: { reeksen: true, nerf: true, variatie: true } },
  { naam: '+ metaal', stijl: 'kunst', st: { reeksen: true, nerf: true, variatie: true, metaal: true } },
  { naam: '+ clusters = C', stijl: 'kunst', st: C_ST },
  { naam: '+ contactschaduw', stijl: 'kunst', st: { ...C_ST, contact: true } },
  { naam: '+ lichte randen', stijl: 'kunst', st: { ...C_ST, contact: true, accent: true } },
  { naam: '+ binnenlijnen', stijl: 'kunst', st: { ...C_ST, contact: true, accent: true, binnenlijnen: true } },
  { naam: '+ slijtage', stijl: 'kunst', st: { ...C_ST, contact: true, accent: true, binnenlijnen: true, slijt: true } },
  { naam: '+ omlijning in kleur', stijl: 'kunst', st: ALLES },
  { naam: '+ tonen van het doel = D', stijl: 'doel', st: ALLES },
];

// ---------------------------------------------------------------- de ijking

// Eens per ding: het doel ontleden (op de grootte van ons wiel op 2×), de stijlen maken, en de drempels uit zuidwest in
// twee standen (IJK; vast voor alle beelden). B en C met de standaardverdeling; D zo dat elke toon in het eindbeeld even
// vaak voorkomt als op het doel. En het palet van A (64 kleuren, uit dezelfde beelden).
function ijk() {
  fs.mkdirSync(UIT, { recursive: true });
  const R = IJK.map(([k, s]) => render(k, s, true));
  const Gs = R.map((r) => S.gbuffer(r, FIJN / DOEL));
  const A0 = R.map((r) => H.verklein(r.zl, FIJN / DOEL, 'filter'));
  const paletA = H.paletVan(A0, PALET_A);
  const hoogte = hoogteVan(A0[0]);
  const doelBeeld = doelOpMaat(hoogte);
  if (!doelBeeld) throw new Error(`het doel ontbreekt: ${BRON}`);
  const doel = ontleedWiel(doelBeeld);
  // de kleuren van het doel per materiaal (voor zijn tonen)
  doel.kleuren = { hout: [], ijzer: [] };
  for (let i = 0; i < doelBeeld.b * doelBeeld.h; i++) {
    if (doelBeeld.rgba[i * 4 + 3] < 128) continue;
    const k = [doelBeeld.rgba[i * 4], doelBeeld.rgba[i * 4 + 1], doelBeeld.rgba[i * 4 + 2]];
    const s = SM.soortVan(...k);
    if (doel.kleuren[s]) doel.kleuren[s].push(k);
  }
  const stijlen = { kunst: stijlVan(doel, false), doel: stijlVan(doel, true) };
  // de nerf telt mee in gbuffer: opnieuw, nu met de stijl
  const Gst = R.map((r) => S.gbuffer(r, FIJN / DOEL, stijlen.kunst));
  S.kalibreer(Gst, stijlen.kunst);
  const verdeling = {};
  for (const s of ['hout', 'ijzer']) verdeling[s] = SM.tonen(doel.kleuren[s], TONEN[s]).map((t) => t.deel);
  S.kalibreer(Gst, { ...stijlen.doel, details: new Set(R[0].nagels) }, verdeling, VARIANTEN.D.st);
  const kleuren = doel.kleuren;
  delete doel.kleuren;
  fs.writeFileSync(path.join(UIT, 'ijk.json'), JSON.stringify({ hoogte, doel, verdeling, stijlen, paletA }, null, 1));
  console.log(`ijk: wiel ${hoogte} px hoog op 2×; doel ${doelBeeld.b}×${doelBeeld.h}`);
  return { hoogte, doel, stijlen, paletA, doelBeeld, kleuren, Gs };
}
const leesIjk = () => JSON.parse(fs.readFileSync(path.join(UIT, 'ijk.json')));

// ---------------------------------------------------------------- de varianten van één beeld

function varianten(R, ijkt, lijst = VARIANTEN) {
  const G = S.gbuffer(R, FIJN / DOEL, ijkt.stijlen.kunst);
  const uit = { A: { b: 0, h: 0, rgba: null, ms: 0 } };
  let t0 = process.hrtime.bigint();
  const a = variantA(R, ijkt.paletA);
  uit.A = { ...a, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
  for (const [k, v] of Object.entries(lijst)) {
    t0 = process.hrtime.bigint();
    const r = S.stileer(G, { ...ijkt.stijlen[v.stijl], details: new Set(R.nagels) }, v.st);
    uit[k] = { ...r, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
  }
  return { G, beelden: uit };
}

// ---------------------------------------------------------------- proef: zuidwest, stand 0

function proef() {
  const ij = fs.existsSync(path.join(UIT, 'ijk.json')) && !process.argv.includes('--opnieuw') ? leesIjk() : (ijk(), leesIjk());
  const R = render('ZW', 0, true);
  const { beelden } = varianten(R, ij);
  const ladder = varianten(R, ij, Object.fromEntries(LADDER.map((v, i) => [`L${i}`, v]))).beelden;
  const u = H.uitsnede([beelden.A], 3);
  const groot = (r, n) => H.snij(r, u, n);
  const doel = doelOpMaat(ij.hoogte);
  const ud = H.uitsnede([doel], 3);
  const rij = [E.met(H.snij(doel, ud, 4), 'doel (ChatGPT)'), ...['A', 'B', 'C', 'D'].map((k) => E.met(groot(beelden[k], 4), k === 'A' ? 'A: variant C nu' : VARIANTEN[k].naam))];
  const lad = LADDER.map((v, i) => E.met(groot(ladder[`L${i}`], 3), `${i}. ${v.naam}`));
  E.bewaar(path.join(UIT, 'proef.png'), [rij, lad.slice(0, 6), lad.slice(6)], 'De stijlproef: zuidwest, stand 0', 'Bovenaan het doel en A tot D (maal 4), daaronder de ladder van B naar D (maal 3).');
  E.bewaar(path.join(UIT, 'ladder.png'), [[E.met(groot(beelden.A, 3), 'A: variant C nu'), ...lad.slice(0, 5)], lad.slice(5)], 'De ladder van B naar D: bij elke trede één stap',
    'Zuidwest, stand 0, de sprite van 2× maal 3. B tot en met trede 9 met de kleurreeksen uit stijl.cjs (reeks, op de maten van het doel) en de standaardverdeling; de laatste trede met de tonen en de verdeling van het doel zelf.');
  // buiten de opdracht: D op de forsere maten (hdproef.cjs wielC forser), om te zien wat de geometrie nog doet
  const F = render('ZW', 0, true, true);
  H.bewaar(path.join(UIT, 'D-forser.png'), varianten(F, ij, { D: VARIANTEN.D }).beelden.D);
  // de helft van het wiel van dichtbij (maal 7): linksboven, waar het licht valt
  const half = (r, uu) => H.snij(r, { x0: uu.x0, y0: uu.y0, b: Math.ceil(uu.b * 0.62), h: Math.ceil(uu.h * 0.55) }, 7);
  E.bewaar(path.join(UIT, 'proef-dichtbij.png'), [[E.met(half(doel, ud), 'doel'), E.met(half(beelden.A, u), 'A')], [E.met(half(beelden.C, u), 'C'), E.met(half(beelden.D, u), 'D')]], 'Van dichtbij', 'Maal 7.');
  console.log(kort('doel', ontleedWiel(doel)));
  for (const k of ['A', 'B', 'C', 'D']) console.log(kort(k, ontleedWiel(beelden[k])));
  console.log('uit/hdstijl/proef.png');
}

// ---------------------------------------------------------------- render: een richting, acht standen en een volle slag

const SLEUTELS = ['A', 'B', 'C', 'D'];
const helder = (r, i) => 0.299 * r.rgba[i * 4] + 0.587 * r.rgba[i * 4 + 1] + 0.114 * r.rgba[i * 4 + 2];
const dektR = (r, i) => r.rgba[i * 4 + 3] >= 128;

function renderKant(kant) {
  const ij = leesIjk();
  const lijst = [];
  const tijd = { render: [], gbuffer: [], A: [], B: [], C: [], D: [] };
  let piek = 0;
  for (let s = 0; s < STANDEN.length; s++) {
    const R = render(kant, s);
    tijd.render.push(R.ms);
    const t0 = process.hrtime.bigint();
    S.gbuffer(R, FIJN / DOEL, ij.stijlen.kunst);
    tijd.gbuffer.push(Number(process.hrtime.bigint() - t0) / 1e6);
    const { G, beelden } = varianten(R, ij);
    for (const k of SLEUTELS) {
      tijd[k].push(beelden[k].ms);
      H.bewaar(path.join(UIT, k, `${kant}-${s}.png`), beelden[k]);
    }
    // de nagels op 4×: hoeveel koppen (stukken van ten minste drie pixels) er te zien zijn
    lijst.push({ G, beelden, nagels4: nagelKoppen4(R), nagels: new Set(R.nagels) });
    piek = Math.max(piek, process.memoryUsage().rss);
  }
  const gem = (a) => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  const uit = { kant, ms: Object.fromEntries(Object.entries(tijd).map(([k, a]) => [k, gem(a)])), piekMB: Math.round(piek / 1e6), varianten: {} };
  for (const k of SLEUTELS) uit.varianten[k] = meet(lijst, k, ij, kant);
  uit.nerven = nervenVast(lijst, ij, kant);
  fs.writeFileSync(path.join(UIT, `meting-${kant}.json`), JSON.stringify(uit, null, 1));
  console.log(`${kant}: render ${uit.ms.render} ms, gbuffer ${uit.ms.gbuffer} ms, ${SLEUTELS.map((k) => `${k} ${uit.ms[k]} ms`).join(', ')}; ${SLEUTELS.map((k) => `${k} flikkeren ${uit.varianten[k].flikkeren.deel}`).join(', ')}`);
}

// De koppen van de nagels op 4× (stukken van ten minste drie pixels, vier buren): wat er op de render te zien is.
function nagelKoppen4(R) {
  const nag = new Set(R.nagels);
  const st = new Int16Array(R.b * R.h).fill(-1);
  for (let i = 0; i < R.b * R.h; i++) if (R.ramp[i] >= 0 && nag.has(R.rust[i * 4 + 3])) st[i] = R.rust[i * 4 + 3];
  return SM.stukGroottes(st, R.b, R.h).filter((g) => g >= 3).length;
}

// De metingen van één variant over de acht standen van een richting (Marcels opdracht 4):
// - flikkeren: op de zijvlakken van het wiel (de normaal langs de as: die staat bij het draaien even ver van de zon) per plek op het wiel
//   (het onderdeel en de plek in rust, op een halve pixel) de kleur in elke stand, het gemiddelde verschil met het gemiddelde
//   van die plek, gedeeld door de spreiding van alle kleuren: 0 is vast, 1 is willekeurig (zoals hdproef.cjs vastzitten);
// - glimlichtWissel, lijnWissel: hoe vaak een plek in een stand iets anders is (een glimlicht: bij de lichtste 8% van deze
//   variant in deze richting; een lijn: helderheid onder 45) dan in de meeste standen: 0 is vast;
// - lijnen: het aantal lijnpixels per stand (met de omlijning), en hoeveel dat tussen de standen schommelt (spreiding /
//   gemiddelde);
// - nagels: het deel van de nagelkoppen op 4× dat op 2× nog te zien is (een kop met een pixel die 25 lichter of donkerder
//   is dan het ijzer eromheen);
// - volleSlag: hoeveel van het beeld na een volle slag gelijk is aan het begin; verspringen: het gemiddelde kleurverschil
//   tussen twee standen.
// De as van het wiel in de wereld: het model is per richting gedraaid (kern.cjs tekenModel), de x-as van het model wordt
// (-sin h, cos h, 0).
const asVan = (kant) => {
  const h = (K.RICHTING[kant] * Math.PI) / 180;
  return [-Math.sin(h), Math.cos(h)];
};
const zijvlak = (G, o, as) => Math.abs(G.nrm[o * 3] * as[0] + G.nrm[o * 3 + 1] * as[1]) >= 0.9;
function meet(lijst, k, ij, kant) {
  const as = asVan(kant);
  const acht = lijst.slice(0, 8);
  const plekken = new Map();
  const alle = [];
  for (const { G, beelden } of acht) for (let o = 0; o < G.b * G.h; o++) {
    const r = beelden[k];
    if (!G.dek[o] || !dektR(r, o)) continue;
    alle.push(helder(r, o));
  }
  alle.sort((a, b) => a - b);
  const glimGrens = alle[Math.floor(alle.length * 0.92)];
  acht.forEach(({ G, beelden }) => {
    const r = beelden[k];
    for (let o = 0; o < G.b * G.h; o++) {
      if (!G.dek[o] || !zijvlak(G, o, as)) continue;
      const x = o % G.b;
      const y = (o - x) / G.b;
      if (x === 0 || y === 0 || x === G.b - 1 || y === G.h - 1 || !G.dek[o - 1] || !G.dek[o + 1] || !G.dek[o - G.b] || !G.dek[o + G.b]) continue;
      const q = 4;
      const sleutel = `${G.stuk[o]}|${Math.round(G.rust[o * 3] * q)}|${Math.round(G.rust[o * 3 + 1] * q)}|${Math.round(G.rust[o * 3 + 2] * q)}`;
      const L = helder(r, o);
      (plekken.get(sleutel) || plekken.set(sleutel, []).get(sleutel)).push({ k: [r.rgba[o * 4], r.rgba[o * 4 + 1], r.rgba[o * 4 + 2]], glim: L >= glimGrens, lijn: L < 45 });
    }
  });
  let som = 0, n = 0;
  let glimMis = 0, lijnMis = 0, nGl = 0;
  const kleuren = [];
  for (const lijstP of plekken.values()) {
    if (lijstP.length < 3) continue;
    const m = [0, 1, 2].map((c) => lijstP.reduce((t, p) => t + p.k[c], 0) / lijstP.length);
    for (const p of lijstP) {
      som += Math.hypot(p.k[0] - m[0], p.k[1] - m[1], p.k[2] - m[2]);
      n++;
      kleuren.push(p.k);
    }
    const meest = (veld) => lijstP.filter((p) => p[veld]).length * 2 >= lijstP.length;
    const gl = meest('glim');
    const li = meest('lijn');
    for (const p of lijstP) {
      if (p.glim !== gl) glimMis++;
      if (p.lijn !== li) lijnMis++;
      nGl++;
    }
  }
  const g = [0, 1, 2].map((c) => kleuren.reduce((t, x) => t + x[c], 0) / Math.max(1, kleuren.length));
  const spreiding = kleuren.reduce((t, x) => t + Math.hypot(x[0] - g[0], x[1] - g[1], x[2] - g[2]), 0) / Math.max(1, kleuren.length);
  const lijnen = acht.map(({ beelden }) => {
    const r = beelden[k];
    let t = 0;
    for (let i = 0; i < r.b * r.h; i++) if (dektR(r, i) && helder(r, i) < 45) t++;
    return t;
  });
  const lg = lijnen.reduce((a, b) => a + b, 0) / lijnen.length;
  const ls = Math.sqrt(lijnen.reduce((a, b) => a + (b - lg) ** 2, 0) / lijnen.length);
  // de nagels op 2×
  let zichtbaar = 0, op4 = 0;
  for (const { G, beelden, nagels4, nagels } of acht) {
    op4 += nagels4;
    const r = beelden[k];
    let zichtbaarHier = 0;
    const st = new Int16Array(G.b * G.h).fill(-1);
    for (let o = 0; o < G.b * G.h; o++) if (G.dek[o] && nagels.has(G.stuk[o])) st[o] = G.stuk[o];
    const gezien = new Uint8Array(G.b * G.h);
    for (let s0 = 0; s0 < G.b * G.h; s0++) {
      if (st[s0] < 0 || gezien[s0]) continue;
      const kop = [s0];
      gezien[s0] = 1;
      for (let j = 0; j < kop.length; j++) {
        const i = kop[j];
        const x = i % G.b;
        for (const d of [1, -1, G.b, -G.b]) {
          const t = i + d;
          if (t < 0 || t >= G.b * G.h || (d === 1 && x === G.b - 1) || (d === -1 && x === 0)) continue;
          if (!gezien[t] && st[t] === st[s0]) {
            gezien[t] = 1;
            kop.push(t);
          }
        }
      }
      const rond = [];
      for (const i of kop) for (const d of [1, -1, G.b, -G.b]) {
        const t = i + d;
        if (t >= 0 && t < G.b * G.h && G.dek[t] && st[t] < 0 && dektR(r, t)) rond.push(helder(r, t));
      }
      const mr = rond.length ? rond.reduce((a, b) => a + b, 0) / rond.length : null;
      if (mr !== null && kop.some((i) => dektR(r, i) && Math.abs(helder(r, i) - mr) >= 25)) zichtbaarHier++;
    }
    // een kop kan op 2× in twee stukken vallen: niet meer dan er op 4× zijn
    zichtbaar += Math.min(zichtbaarHier, nagels4);
  }
  const gelijk = (a, b) => {
    let z = 0, t = 0;
    for (let i = 0; i < a.b * a.h; i++) {
      if (!dektR(a, i) && !dektR(b, i)) continue;
      t++;
      if (dektR(a, i) === dektR(b, i) && Math.abs(a.rgba[i * 4] - b.rgba[i * 4]) + Math.abs(a.rgba[i * 4 + 1] - b.rgba[i * 4 + 1]) + Math.abs(a.rgba[i * 4 + 2] - b.rgba[i * 4 + 2]) < 3) z++;
    }
    return +((z / Math.max(1, t)) * 100).toFixed(2);
  };
  let sp = 0, nsp = 0;
  for (let s = 1; s < 8; s++) {
    const a = acht[s - 1].beelden[k], b = acht[s].beelden[k];
    for (let i = 0; i < a.b * a.h; i++) {
      if (!dektR(a, i) || !dektR(b, i)) continue;
      sp += Math.hypot(a.rgba[i * 4] - b.rgba[i * 4], a.rgba[i * 4 + 1] - b.rgba[i * 4 + 1], a.rgba[i * 4 + 2] - b.rgba[i * 4 + 2]);
      nsp++;
    }
  }
  return {
    flikkeren: { verschil: +(som / Math.max(1, n)).toFixed(2), spreiding: +spreiding.toFixed(2), deel: +(som / Math.max(1, n) / Math.max(1e-9, spreiding)).toFixed(3), n },
    glimlichtWissel: +(glimMis / Math.max(1, nGl)).toFixed(3),
    lijnWissel: +(lijnMis / Math.max(1, nGl)).toFixed(3),
    lijnen: { gemiddeld: Math.round(lg), schommeling: +(ls / Math.max(1, lg)).toFixed(3) },
    nagels: { op2: zichtbaar, op4, deel: +(zichtbaar / Math.max(1, op4)).toFixed(2) },
    volleSlag: gelijk(lijst[0].beelden[k], lijst[8].beelden[k]),
    verspringen: +(sp / Math.max(1, nsp)).toFixed(2),
  };
}
// Schuiven de nerven? Per plek op het hout (zoals boven) of hij in een stand op een nerf ligt (G.nerf boven de drempel), tegen
// wat hij in de meeste standen is: 0 is vast. Ter vergelijking: hoe vaak een plek op een nerf ligt.
function nervenVast(lijst, ij, kant) {
  const as = asVan(kant);
  const def = ij.stijlen.kunst.materialen.hout;
  const m = K.RAMP.hout;
  const plekken = new Map();
  for (const { G } of lijst.slice(0, 8)) for (let o = 0; o < G.b * G.h; o++) {
    if (!G.dek[o] || G.mat[o] !== m || !zijvlak(G, o, as)) continue;
    const sleutel = `${G.stuk[o]}|${Math.round(G.rust[o * 3] * 4)}|${Math.round(G.rust[o * 3 + 1] * 4)}|${Math.round(G.rust[o * 3 + 2] * 4)}`;
    (plekken.get(sleutel) || plekken.set(sleutel, []).get(sleutel)).push(G.nerf[o] >= def.nerf.drempel);
  }
  let mis = 0, n = 0, op = 0;
  for (const a of plekken.values()) {
    if (a.length < 3) continue;
    const meest = a.filter(Boolean).length * 2 >= a.length;
    for (const x of a) {
      if (x !== meest) mis++;
      if (x) op++;
      n++;
    }
  }
  return { wissel: +(mis / Math.max(1, n)).toFixed(3), opNerf: +(op / Math.max(1, n)).toFixed(3), n };
}

// ---------------------------------------------------------------- de platen

const GROND = [70, 82, 56];
const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
const lees = (k, kant, s) => H.lees(path.join(UIT, k, `${kant}-${s}.png`));
// Een balk met de tonen van een materiaal: elke kleur zo breed als hij vaak voorkomt.
function tonenBalk(tonen, b = 200, h = 14) {
  const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
  let x = 0;
  const som = tonen.reduce((s, t) => s + t.deel, 0) || 1;
  tonen.forEach((t, j) => {
    const w = j === tonen.length - 1 ? b - x : Math.round((t.deel / som) * b);
    for (let xx = x; xx < Math.min(b, x + w); xx++) for (let y = 0; y < h; y++) uit.rgba.set([...t.k, 255], (y * b + xx) * 4);
    x += w;
  });
  return uit;
}
// Waar welk materiaal is (op kleur, zoals stijlmaat.cjs het meet): hout oranje, ijzer blauw, lijn zwart.
function soortKaart(r) {
  const KL = { hout: [205, 125, 45], ijzer: [90, 130, 220], lijn: [10, 10, 10], anders: [230, 60, 230] };
  const uit = { b: r.b, h: r.h, rgba: Buffer.alloc(r.b * r.h * 4) };
  for (let i = 0; i < r.b * r.h; i++) if (dektR(r, i)) uit.rgba.set([...KL[SM.soortVan(r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2])], 255], i * 4);
  return uit;
}

function platen() {
  const ij = leesIjk();
  const NAAM = { doel: 'doel (ChatGPT)', A: 'A: variant C nu', B: 'B: kleuren en licht', C: 'C: materiaalgericht', D: 'D: volledige stijl' };
  // de uitsnede per richting, over alle varianten en standen
  const uCache = {};
  const uVan = (kant) => uCache[kant] || (uCache[kant] = H.uitsnede(SLEUTELS.flatMap((k) => STANDEN.map((_, s) => lees(k, kant, s))), 3));
  const snij = (k, kant, s) => H.alfaSnij(lees(k, kant, s), uVan(kant));
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const doel100 = doelOpMaat(ij.hoogte);
  const ud = H.uitsnede([doel100], 3);
  const doelSnij = H.alfaSnij(doel100, ud);
  // 0. de ontleding: het doel en A tot D op dezelfde grootte (maal 4), waar welk materiaal is, en de tonen
  const ontleding = { doel: ontleedWiel(doel100) };
  for (const k of SLEUTELS) ontleding[k] = ontleedWiel(lees(k, 'ZW', 0));
  const kolommen = ['doel', ...SLEUTELS];
  const beeldVan = (k) => (k === 'doel' ? doelSnij : snij(k, 'ZW', 0));
  E.bewaar(path.join(UIT, '0-ontleding.png'), [
    kolommen.map((k) => E.met(groot(opGrond(beeldVan(k)), 4), NAAM[k])),
    kolommen.map((k) => E.met(groot(H.snij(soortKaart(beeldVan(k)), { x0: 0, y0: 0, b: beeldVan(k).b, h: beeldVan(k).h }, 1, [200, 200, 200]), 4), `${k}: hout, ijzer, lijn`)),
    kolommen.map((k) => E.met(tonenBalk(ontleding[k].materiaal.hout.tonen, 4 * beeldVan(k).b, 26), `${k}: tonen van het hout`)),
    kolommen.map((k) => E.met(tonenBalk(ontleding[k].materiaal.ijzer.tonen, 4 * beeldVan(k).b, 26), `${k}: tonen van het ijzer`)),
  ], 'Opdracht 1: het doel en A tot D ontleed, op dezelfde grootte', 'Zuidwest, stand 0, het wiel 100 pixels hoog (maal 4). Rij 2: waar het materiaal op kleur hout (oranje), ijzer (blauw) of een lijn (zwart) is. Rij 3 en 4: de acht tonen van elk materiaal (k-means), zo breed als ze vaak voorkomen.');
  // 1. de vergelijking op dezelfde zichtbare grootte (het wiel 400 pixels hoog): het doel herbemonsterd, onze sprites van
  // 2× maal 4 (nearest neighbour, geen vervorming); en buiten de opdracht D op de forsere maten
  const doel400 = doelOpMaat(ij.hoogte * 4);
  const rij1 = [E.met(opGrond(H.alfaSnij(doel400, H.uitsnede([doel400], 12))), NAAM.doel), ...SLEUTELS.map((k) => E.met(groot(opGrond(snij(k, 'ZW', 0)), 4), NAAM[k]))];
  const forsPad = path.join(UIT, 'D-forser.png');
  if (fs.existsSync(forsPad)) {
    const f = H.lees(forsPad);
    rij1.push(E.met(groot(opGrond(H.alfaSnij(f, H.uitsnede([f], 3))), 4), 'extra: D, forsere maten'));
  }
  E.bewaar(path.join(UIT, '1-vergelijking.png'), [rij1], 'Het doel en A tot D op dezelfde zichtbare grootte',
    'Zuidwest, stand 0. Onze sprites zijn 2× (de productiestandaard: 4× gerenderd, 2× sprite), hier maal 4 vergroot met nearest neighbour; het doel op dezelfde wielhoogte. Rechts, buiten de opdracht: D op de forsere maten van de ChatGPT-wagen (hdproef.cjs).');
  // 2. spelmaat op 1920×1080: een sprite van 2× staat er één op één; het doel op dezelfde wielhoogte
  const rij2 = [E.met(opGrond(doelSnij), 'doel'), ...SLEUTELS.map((k) => E.met(opGrond(snij(k, 'ZW', 0)), k))];
  E.bewaar(path.join(UIT, '2-spelmaat-1080p.png'), [rij2], 'Op 1920×1080, even groot als in het spel', 'Eén spritepixel is één schermpixel.');
  E.bewaar(path.join(UIT, '2-spelmaat-1080p-vergroot.png'), [rij2.map((x, i) => E.met(groot(i ? opGrond(snij(SLEUTELS[i - 1], 'ZW', 0)) : opGrond(doelSnij), 3), i ? NAAM[SLEUTELS[i - 1]] : NAAM.doel))],
    'Op 1920×1080, maal 3 om de pixels te zien', 'Zuidwest, stand 0; de sprite van 2× zoals het spel hem toont, hier maal 3 vergroot.');
  // 3. acht richtingen, stand 0, op spelmaat maal 2
  E.bewaar(path.join(UIT, '3-richtingen.png'), SLEUTELS.map((k) => K.KANTEN.map((kant) => E.met(groot(opGrond(snij(k, kant, 0)), 2), `${k} · ${kant}`))),
    'Acht richtingen, stand 0', 'Per rij een variant; maal 2 vergroot.');
  // 4. het draaien: A tot D naast elkaar, acht standen, naar zuidwest en naar noord (maal 3)
  for (const kant of ['ZW', 'N']) {
    const frames = [];
    for (let s = 0; s < 8; s++) frames.push(H.naastElkaar(SLEUTELS.map((k) => groot(opGrond(snij(k, kant, s)), 3)), 4));
    fs.writeFileSync(path.join(UIT, `4-draaien-${kant}.png`), apng(frames.map((r) => ({ b: r.b, h: r.h, rgba: () => r.rgba })), { fps: 6 }));
  }
  // 5. de ladder (uit de proef)
  if (fs.existsSync(path.join(UIT, 'ladder.png'))) fs.copyFileSync(path.join(UIT, 'ladder.png'), path.join(UIT, '5-ladder.png'));
  // de metingen bij elkaar: per variant het gemiddelde over de acht richtingen (flikkeren gewogen naar het aantal plekken)
  const per = K.KANTEN.map((kant) => JSON.parse(fs.readFileSync(path.join(UIT, `meting-${kant}.json`))));
  const samen = {};
  for (const k of SLEUTELS) {
    const v = per.map((p) => p.varianten[k]);
    const gem = (f) => +(v.reduce((s, x) => s + f(x), 0) / v.length).toFixed(3);
    const nTot = v.reduce((s, x) => s + x.flikkeren.n, 0);
    samen[k] = {
      flikkeren: +(v.reduce((s, x) => s + x.flikkeren.deel * x.flikkeren.n, 0) / nTot).toFixed(3),
      glimlichtWissel: gem((x) => x.glimlichtWissel),
      lijnWissel: gem((x) => x.lijnWissel),
      lijnSchommeling: gem((x) => x.lijnen.schommeling),
      nagelsZichtbaar: +(v.reduce((s, x) => s + x.nagels.op2, 0) / Math.max(1, v.reduce((s, x) => s + x.nagels.op4, 0))).toFixed(2),
      volleSlag: gem((x) => x.volleSlag),
      verspringen: gem((x) => x.verspringen),
      msPerBeeld: +(per.reduce((s, p) => s + p.ms[k], 0) / per.length).toFixed(1),
    };
  }
  const tijden = { renderMs: +(per.reduce((s, p) => s + p.ms.render, 0) / per.length).toFixed(0), gbufferMs: +(per.reduce((s, p) => s + p.ms.gbuffer, 0) / per.length).toFixed(0), piekMB: Math.max(...per.map((p) => p.piekMB)) };
  const nerven = { wissel: +(per.reduce((s, p) => s + p.nerven.wissel * p.nerven.n, 0) / per.reduce((s, p) => s + p.nerven.n, 0)).toFixed(3), opNerf: +(per.reduce((s, p) => s + p.nerven.opNerf * p.nerven.n, 0) / per.reduce((s, p) => s + p.nerven.n, 0)).toFixed(3) };
  fs.writeFileSync(path.join(UIT, 'metingen.json'), JSON.stringify({ samen, nerven, tijden, ontleding, perRichting: per }, null, 1));
  for (const k of ['doel', ...SLEUTELS]) console.log(kort(k, ontleding[k]));
  for (const [k, m] of Object.entries(samen)) console.log(`${k}: ${JSON.stringify(m)}`);
  console.log(`nerven: ${JSON.stringify(nerven)}; tijden: ${JSON.stringify(tijden)}`);
}

// ---------------------------------------------------------------- alles, parallel

async function alles() {
  ijk();
  proef();
  const t0 = Date.now();
  await Promise.all(K.KANTEN.map((kant) => new Promise((ok, mis) => execFile(process.execPath, [__filename, 'render', kant], { maxBuffer: 1e7 }, (e, uit, fout) => {
    process.stdout.write(uit);
    if (e) return mis(new Error(fout || e.message));
    ok();
  }))));
  console.log(`gerenderd in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  platen();
}

const [wat, a1] = require.main === module ? process.argv.slice(2) : ['geladen'];
if (wat === 'geladen');
else if (wat === 'ijk') {
  const r = ijk();
  console.log(kort('doel', r.doel));
} else if (wat === 'proef') proef();
else if (wat === 'render') renderKant(a1);
else if (wat === 'platen') platen();
else if (wat === 'alles') alles().catch((e) => { console.error(e.message); process.exit(1); });
else console.log('node gereedschap/pixelart/hdstijl.cjs ijk | proef | render <kant> | platen | alles');

module.exports = { render, ijk, leesIjk, varianten, doelWiel, doelOpMaat, ontleedWiel, ellipsVan, wielMaten, stijlVan, meet, nagelKoppen4, VARIANTEN, LADDER, UIT };
