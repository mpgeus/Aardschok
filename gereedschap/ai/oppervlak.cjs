// De AI op het oppervlak (werklijst vraag 180; Marcels keus na de zevende opdracht: "Ai on surface"; het verslag in
// gereedschap/ai/ai-afwerking.md, "De AI op het oppervlak"). SDXL beschildert een wiel één keer (afwerking.cjs, Route A),
// en die beschildering wordt op het oppervlak van ons model gebakken (pixelart/bakken.cjs): per onderdeel, of per groep
// gelijke onderdelen, de kleur van het oppervlak op zijn afwikkeling, zonder (de helft van) ons licht. Daarna rendert onze
// renderer het wiel met die kleur in elke stand en richting, met zijn eigen licht: wat SDXL schilderde, draait mee.
//
// Twee wielen (--wiel): `c`, wiel C van de stijlproef (19 okt, de eerste keer; met box naar 2× en een gedeeld palet van 48
// kleuren), en `doel`, het wiel naar het doel (hdproef.cjs wielDoel; met detailbehoudend verkleinen en een palet per
// materiaal, doelwiel.cjs: Marcel, 19 okt, "i feel like the filter destroys detail when we scale down"). Gebakken uit de
// SDXL-beelden naar zuidwest stand 0 (de buitenkant) en noordoost stand 0 (de binnenkant), denoise 0,65.
//
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] sdxl          de SDXL-beelden (zuidwest en noordoost) die er nog niet zijn
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] bak           de bak uit de SDXL-beelden
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] render <kant> een richting, acht standen en een volle slag, met de metingen
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] platen        de platen en de metingen samen
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] alles         bak, de acht richtingen tegelijk, platen
//
// En `--wiel gpt` (Marcel, 19 okt: "Je kunt de pixels letterlijk kopieren toch? En daar vandaan gewoon verder werken?"):
// geen SDXL, maar de pixels van het ChatGPT-wiel zelf, op onze render van zuidwest gelegd en gebakken, en in volle kleur
// verkleind (geen palet, geen reeksen); op de platen naast het wiel zoals nu (stijl D met het handschrift) en naast de
// gebakken kleur met het handschrift erover.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const K = require('../pixelart/kern.cjs');
const O = require('../pixelart/ossenkar.cjs');
const H = require('../pixelart/hdproef.cjs');
const HS = require('../pixelart/hdstijl.cjs');
const S = require('../pixelart/stijl.cjs');
const TX = require('../pixelart/textuur.cjs');
const BK = require('../pixelart/bakken.cjs');
const DW = require('../pixelart/doelwiel.cjs');
const AF = require('./afwerking.cjs');
const A = require('./beeld-ai.cjs');
const E = require('./etiket.cjs');
const { apng } = require('../pixelart/apng.cjs');

const INSTELLING = { ...AF.START, denoise: 0.65 };
const WIELEN = {
  c: { naam: 'wiel C', variant: H.VARIANTEN.C, bron: AF.tagVan(INSTELLING), afwerkingBron: undefined, uit: 'oppervlak', verklein: 'box', lichtMacht: 0.5, ijk: false },
  // het licht er helemaal uit en dan de helderheid per materiaal op die van ons materiaal (bakken.cjs o.ijk): met de helft
  // eruit werd de grote velg in de zon geel
  doel: { naam: 'het wiel naar het doel', variant: H.DOELWIEL, bron: `doel-${AF.tagVan(INSTELLING)}`, afwerkingBron: DW.BRON, uit: 'oppervlak-doel', verklein: 'detail', lichtMacht: 1, ijk: true },
  // de pixels van ChatGPT: zonder ijking (de kleur van ChatGPT zelf), en verkleind met de naaste pixel, zonder palet ('vol')
  gpt: { naam: 'de pixels van ChatGPT', variant: H.DOELWIEL, bron: 'chatgpt', afwerkingBron: DW.BRON, uit: 'oppervlak-gpt', verklein: 'vol', lichtMacht: 1, ijk: false, gpt: true },
};
const wielNaam = process.argv.includes('--wiel') ? process.argv[process.argv.indexOf('--wiel') + 1] : 'c';
const W = WIELEN[wielNaam];
if (!W) throw new Error(`geen wiel ${wielNaam} (wel: ${Object.keys(WIELEN).join(', ')})`);
const UIT = path.join(A.UIT, W.uit);
const BAKKANTEN = ['ZW', 'NO'];
const MIDDEN = [-O.WIEL.x, 0, O.WIEL.r]; // het linkerwiel (hdproef.cjs ZIJ = -1)
const AS = [1, 0, 0];
const STANDEN = H.STANDEN;
const PALET = 48;
// Hoeveel van ons licht er bij het bakken uit gaat (bakken.cjs lichtMacht): SDXL schildert een vlak in de schaduw al
// donker; alles eruit halen maakte wiel C in de zon fel oranje (19 okt: de helft eruit was beter); per wiel (W.lichtMacht).
const LICHTMACHT = Number(process.env.LICHTMACHT || W.lichtMacht);
const Z = AF.Z;

// Het model in een stand, genummerd (bakken.cjs).
const modelIn = (s) => BK.nummer(H.wielModel(W.variant, STANDEN[s].hoek));
// De groepen: uit het model in rust. Een onderdeel zonder kopieën vouwt rondom: de band om de 90° (zoals de stukken velg),
// alles om de naaf om de 45° (zoals de spaken).
const groepVan = BK.groepen(modelIn(0), { as: AS, midden: MIDDEN, vouwAlleen: (d) => (d.deel === 30 ? 4 : 8) });
const basis = H.materialen(W.variant.st);
// De materialen: hout, ijzer en koper lezen de bak (zonder bak: dezelfde afwerking, voor de render waaruit gebakken wordt).
function materialen(bk) {
  const m = basis.slice();
  for (const i of [O.M.wiel, O.M.ijzer, O.M.goud]) if (m[i] && m[i].textuur) m[i] = W.gpt && bk ? BK.projectieMateriaal(basis[i], bk, { kopieen: KOPIEEN }) : BK.bakMateriaal(basis[i], bk, groepVan);
  return m;
}
// Een render met de G-buffer, zoals hdstijl.cjs render (de buffers die stijl.cjs gbuffer leest).
function render(kant, s, mat, fijn = 4, vak = null) {
  const m = modelIn(s);
  m.mat = mat;
  const B = vak ? new K.Beeld(vak.b, vak.h, vak.OX, vak.OY) : new K.Beeld(H.CEL[0] * fijn, H.CEL[1] * fijn, H.CEL[2] * fijn, H.CEL[3] * fijn);
  const t0 = process.hrtime.bigint();
  K.tekenModel(B, m, { richting: kant, rust: true, gbuffer: true, fijn });
  K.belicht(B);
  const zl = K.kleurBeeld(B);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { b: B.b, h: B.h, ramp: B.ramp, stap: B.stap, diep: B.diep, deel: B.deel, nrm: B.nrm, rust: B.rust, albedo: B.albedo, g: B.g, kleur: B.kleur, zl, ms, model: m, nagels: m.delen.map((d, i) => (TX.uvVan(d) ? -1 : i)).filter((i) => i >= 0) };
}

// ---------------------------------------------------------------- de SDXL-beelden en het bakken

const bronMap = (kant) => path.join(AF.UIT, W.bron, `${kant}-0`);
async function sdxl() {
  const stijl = await AF.stijlUpload(INSTELLING);
  for (const kant of BAKKANTEN) if (!fs.existsSync(path.join(bronMap(kant), 'ai.png'))) await AF.eenBeeld(kant, 0, INSTELLING, stijl, W.bron, W.afwerkingBron);
}
function bakken() {
  fs.mkdirSync(UIT, { recursive: true });
  if (W.gpt) return bakGpt();
  const zonder = materialen(null);
  const delen = [];
  for (const kant of BAKKANTEN) {
    const m = bronMap(kant);
    if (!fs.existsSync(path.join(m, 'ai.png'))) {
      console.log(`${kant}: geen SDXL-beeld (node gereedschap/ai/oppervlak.cjs --wiel ${wielNaam} sdxl)`);
      continue;
    }
    const inst = JSON.parse(fs.readFileSync(path.join(m, 'instellingen.json')));
    const [ox, oy] = inst.plek;
    const u = inst.uitsnede;
    // de render op de maat van het doek: 16× (een spritepixel van 2× is 8 doekpixels), alleen het vak van het wiel
    const vak = { b: u.b * Z, h: u.h * Z, OX: H.CEL[2] * 16 - u.x0 * Z, OY: H.CEL[3] * 16 - u.y0 * Z };
    const t0 = Date.now();
    const R = render(kant, 0, zonder, 16, vak);
    const ai = A.leesPng(fs.readFileSync(path.join(m, 'ai.png')));
    const binnen = AF.invoer(kant, 0, W.afwerkingBron).binnen;
    const bk = BK.bak(R, ai, R.model, groepVan, { dx: ox, dy: oy, lichtMacht: LICHTMACHT, ijk: W.ijk, binnen: (X, Y) => binnen[Y * ai.b + X] === 1 });
    delen.push(bk);
    console.log(`${kant}: ${bk.kaart.size} texels in ${((Date.now() - t0) / 1000).toFixed(1)} s${bk.factor ? `; helderheid maal ${JSON.stringify(Object.fromEntries(Object.entries(bk.factor).map(([m, f]) => [m, +f.toFixed(2)])))}` : ''}`);
  }
  const bk = BK.voegSamen(delen);
  fs.writeFileSync(path.join(UIT, 'bak.json'), JSON.stringify({ wiel: wielNaam, bron: W.bron, kanten: BAKKANTEN, lichtMacht: LICHTMACHT, dicht: bk.dicht, kaart: [...bk.kaart].map(([s, k]) => [s, k.map((v) => Math.round(v))]) }));
  console.log(`bak: ${bk.kaart.size} texels, ${path.relative(process.cwd(), path.join(UIT, 'bak.json'))}`);
}
// ---------------------------------------------------------------- de pixels van ChatGPT

// Het ChatGPT-wiel (hdstijl.cjs doelWiel) op onze render van zuidwest, stand 0, op 8× (ons wiel dan ongeveer zo groot als
// het hare, 420 pixels hoog). De ellips van het onze gaat naar een cirkel en de cirkel naar de ellips van het hare
// (ellipsVan: het midden en de wortel van de covariantie); daartussen de draaiing (en eventueel spiegeling), en een kleine
// schaal en verschuiving, waarbij wat dekt het best samenvalt: de spaken op de spaken. Elke pixel van ons neemt dan de pixel
// van ChatGPT waar hij op valt (de naaste, geen mengkleur), en dat wordt geprojecteerd (bakken.cjs projectie; via (u, v)
// bakken zoals een SDXL-beeld gaf strepen).
const FGPT = 8;
// de wortel van een symmetrische 2×2-matrix [xx, xy, yy], maal 2 (de rand van de ellips ligt op twee standaardafwijkingen)
function wortel2(xx, xy, yy) {
  const s = Math.sqrt(xx * yy - xy * xy);
  const t = Math.sqrt(xx + yy + 2 * s);
  return [((xx + s) / t) * 2, (xy / t) * 2, ((yy + s) / t) * 2];
}
// De buiging van de spaken: in de ruimte van ons wiel (de ellips als cirkel, na de draaiing) per straal tussen naaf en velg
// de hoeken van de spaken, bij ons (de onderdelen spaak en beslag) en bij ChatGPT (wat dekt: tussen de spaken is het
// doorzichtig). Elke spaak van ons met een spaak van ChatGPT ernaast (binnen 20°, niet veel breder: dan zijn er twee
// samengesmolten) geeft per rand hoeveel graden erbij; per spaak het gemiddelde over de stralen (per straal apart gaf
// knikken in de spaken: op elke straal werden net andere spaken gevonden), en daartussen lineair. Naar de naaf en de velg
// toe wordt de buiging nul, zodat band, velg en naaf blijven liggen. f(r, hoek) → de hoek erbij (radialen).
const BUIG = { stralen: [0.38, 0.44, 0.5, 0.56], band: 0.025, binnen: 0.28, vol: [0.34, 0.6], buiten: 0.68, zoek: 20, minBreed: 8 };
function buigSpaken(R, gpt, ru, p) {
  const { eo, inv, eg, Mg } = ru;
  const det = Mg[0] * Mg[2] - Mg[1] * Mg[1];
  const ig = [Mg[2] / det, -Mg[1] / det, Mg[0] / det];
  const graad = (x, y) => ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const leeg = () => BUIG.stralen.map(() => ({ ja: new Float32Array(360), n: new Float32Array(360) }));
  const ons = leeg();
  const hun = leeg();
  const tel = (prof, r, g, ja) => BUIG.stralen.forEach((s, k) => {
    if (Math.abs(r - s) > BUIG.band) return;
    prof[k].n[Math.floor(g)]++;
    if (ja) prof[k].ja[Math.floor(g)]++;
  });
  const SPAAK = new Set([32, 34]);
  for (let y = 0; y < R.h; y++) for (let x = 0; x < R.b; x++) {
    const dx = x - eo.cx;
    const dy = y - eo.cy;
    const qx = inv[0] * dx + inv[1] * dy;
    const qy = (inv[1] * dx + inv[2] * dy) * (p.spiegel ? -1 : 1);
    const i = y * R.b + x;
    tel(ons, Math.hypot(qx, qy), graad(qx, qy), R.ramp[i] >= 0 && !Number.isNaN(R.rust[i * 4]) && SPAAK.has(R.model.delen[R.rust[i * 4 + 3]].deel));
  }
  // ChatGPT terug naar onze ruimte: de verschuiving, de ellips als cirkel, schaal en draaiing eraf (en de spiegeling)
  const c = Math.cos(-p.hoek) / p.schaal;
  const z = Math.sin(-p.hoek) / p.schaal;
  for (let Y = 0; Y < gpt.h; Y++) for (let X = 0; X < gpt.b; X++) {
    const dx = X - eg.cx - p.tx;
    const dy = Y - eg.cy - p.ty;
    const gx = ig[0] * dx + ig[1] * dy;
    const gy = ig[1] * dx + ig[2] * dy;
    const qx = c * gx - z * gy;
    const qy = z * gx + c * gy;
    tel(hun, Math.hypot(qx, qy), graad(qx, qy), gpt.rgba[(Y * gpt.b + X) * 4 + 3] >= 128);
  }
  const stukken = (pr) => {
    const v = Array.from(pr.ja, (j, g) => pr.n[g] > 0 && j / pr.n[g] >= 0.5);
    const start = v.findIndex((a, g) => !a && v[(g + 1) % 360]);
    const uit = [];
    if (start < 0) return uit;
    for (let k = 1; k <= 360; k++) {
      const g = (start + k) % 360;
      if (v[g] && !v[(g + 359) % 360]) uit.push({ van: g, tot: g + 1 });
      else if (v[g] && uit.length) uit[uit.length - 1].tot = g + 1;
    }
    return uit.map((u) => {
      const breed = (u.tot - u.van + 360) % 360;
      return { van: u.van, breed, mid: (u.van + breed / 2) % 360 };
    }).filter((u) => u.breed >= BUIG.minBreed);
  };
  const verschil = (a, b) => ((a - b + 540) % 360) - 180; // a - b, tussen -180 en 180
  const verslag = [];
  // de spaken van ons op de straal met de meeste: de lijst waar de andere stralen naar kijken
  const per = BUIG.stralen.map((_, k) => ({ a: stukken(ons[k]), b: stukken(hun[k]) }));
  const ref = per.reduce((x, y) => (y.a.length > x.a.length ? y : x)).a;
  const som = ref.map(() => ({ van: 0, tot: 0, n: 0 }));
  per.forEach(({ a, b }, k) => {
    let n = 0;
    for (const u of a) {
      const w = b.filter((x) => Math.abs(verschil(x.mid, u.mid)) <= BUIG.zoek && x.breed <= u.breed * 1.6 + 4).sort((x, y) => Math.abs(verschil(x.mid, u.mid)) - Math.abs(verschil(y.mid, u.mid)))[0];
      const r = ref.map((q, j) => [Math.abs(verschil(q.mid, u.mid)), j]).sort((x, y) => x[0] - y[0])[0];
      if (!w || !r || r[0] > BUIG.zoek) continue;
      som[r[1]].van += verschil(w.van, u.van);
      som[r[1]].tot += verschil((w.van + w.breed) % 360, (u.van + u.breed) % 360);
      som[r[1]].n++;
      n++;
    }
    verslag.push({ straal: BUIG.stralen[k], spaken: n });
  });
  // per spaak twee paren [hoek bij ons, graden erbij], rondom gesorteerd
  const pp = [];
  ref.forEach((q, j) => {
    if (!som[j].n) return;
    pp.push([q.van, som[j].van / som[j].n], [(q.van + q.breed) % 360, som[j].tot / som[j].n]);
  });
  pp.sort((x, y) => x[0] - y[0]);
  verslag.push({ spaken: pp.length / 2, grootst: +Math.max(0, ...pp.map((x) => Math.abs(x[1]))).toFixed(1) });
  // lineair tussen de paren (rondom)
  const opHoek = (g) => {
    if (!pp.length) return 0;
    let i = pp.findIndex((x) => x[0] > g);
    if (i < 0) i = 0;
    const na = pp[i];
    const voor = pp[(i - 1 + pp.length) % pp.length];
    const span = (na[0] - voor[0] + 360) % 360 || 360;
    const t = ((g - voor[0] + 360) % 360) / span;
    return voor[1] + (na[1] - voor[1]) * t;
  };
  const f = (r, hoek) => {
    if (r <= BUIG.binnen || r >= BUIG.buiten) return 0;
    const w = r < BUIG.vol[0] ? (r - BUIG.binnen) / (BUIG.vol[0] - BUIG.binnen) : r > BUIG.vol[1] ? (BUIG.buiten - r) / (BUIG.buiten - BUIG.vol[1]) : 1;
    return (opHoek(((hoek * 180) / Math.PI + 360) % 360) * w * Math.PI) / 180;
  };
  return { f, verslag };
}
function legGpt(R) {
  const gpt = HS.doelWiel();
  const eo = HS.ellipsVan(R.zl);
  const eg = HS.ellipsVan(gpt);
  const [a, b, d] = wortel2(eo.xx, eo.xy, eo.yy);
  const det = a * d - b * b;
  const inv = [d / det, -b / det, a / det];
  const Mg = wortel2(eg.xx, eg.xy, eg.yy);
  const naar = (x, y, p, buig = null) => {
    const dx = x - eo.cx;
    const dy = y - eo.cy;
    let qx = inv[0] * dx + inv[1] * dy;
    let qy = (inv[1] * dx + inv[2] * dy) * (p.spiegel ? -1 : 1);
    if (buig) {
      const r = Math.hypot(qx, qy);
      const f = Math.atan2(qy, qx) + buig(r, Math.atan2(qy, qx));
      qx = r * Math.cos(f);
      qy = r * Math.sin(f);
    }
    const c = Math.cos(p.hoek) * p.schaal;
    const z = Math.sin(p.hoek) * p.schaal;
    const rx = c * qx - z * qy;
    const ry = z * qx + c * qy;
    return [eg.cx + Mg[0] * rx + Mg[1] * ry + p.tx, eg.cy + Mg[1] * rx + Mg[2] * ry + p.ty];
  };
  const dektG = (X, Y) => {
    const xi = Math.round(X);
    const yi = Math.round(Y);
    return xi >= 0 && yi >= 0 && xi < gpt.b && yi < gpt.h && gpt.rgba[(yi * gpt.b + xi) * 4 + 3] >= 128;
  };
  // onze pixels rond het wiel (om de twee), met of ze dekken
  const ons = [];
  for (let y = 0; y < R.zl.h; y += 2) for (let x = 0; x < R.zl.b; x += 2) {
    const dx = x - eo.cx;
    const dy = y - eo.cy;
    if (Math.hypot(inv[0] * dx + inv[1] * dy, inv[1] * dx + inv[2] * dy) > 1.15) continue;
    ons.push([x, y, R.zl.rgba[(y * R.zl.b + x) * 4 + 3] >= 128]);
  }
  // hoe goed het valt: wat allebei dekt, gedeeld door wat een van beide dekt
  const score = (p) => {
    let beide = 0;
    let een = 0;
    for (const [x, y, o] of ons) {
      const g = dektG(...naar(x, y, p));
      if (o || g) {
        een++;
        if (o && g) beide++;
      }
    }
    return beide / een;
  };
  let best = null;
  for (const spiegel of [false, true]) for (let g = 0; g < 360; g++) {
    const p = { spiegel, hoek: (g * Math.PI) / 180, schaal: 1, tx: 0, ty: 0 };
    const sc = score(p);
    if (!best || sc > best.sc) best = { p, sc };
  }
  // fijner: om beurten de hoek, de schaal en de verschuiving
  const stappen = { hoek: [0.25, 0.05].map((g) => (g * Math.PI) / 180), schaal: [0.01, 0.003], tx: [2, 1], ty: [2, 1] };
  for (let ronde = 0; ronde < 3; ronde++) for (const [k, ds] of Object.entries(stappen)) for (const dd of ds) {
    for (const r of [-1, 1]) {
      for (;;) {
        const p = { ...best.p, [k]: best.p[k] + r * dd };
        const sc = score(p);
        if (sc <= best.sc) break;
        best = { p, sc };
      }
    }
  }
  // de spaken van ChatGPT liggen niet om de 45° (tot 12° ernaast) en zijn wat breder: per spaak de hoek bijbuigen, zodat
  // zijn randen op de onze vallen
  const buig = buigSpaken(R, gpt, { eo, inv, eg, Mg }, best.p);
  // het beeld op onze render: per pixel die dekt de pixel van ChatGPT eronder
  const beeld = { b: R.b, h: R.h, rgba: Buffer.alloc(R.b * R.h * 4) };
  for (let y = 0; y < R.h; y++) for (let x = 0; x < R.b; x++) {
    if (R.ramp[y * R.b + x] < 0) continue;
    const [X, Y] = naar(x, y, best.p, buig.f);
    if (!dektG(X, Y)) continue;
    const s0 = (Math.round(Y) * gpt.b + Math.round(X)) * 4;
    gpt.rgba.copy(beeld.rgba, (y * R.b + x) * 4, s0, s0 + 4);
  }
  return { beeld, p: best.p, samen: best.sc, naar: (x, y) => naar(x, y, best.p, buig.f), gpt, buig: buig.verslag };
}
// het wiel is rondom gelijk om de 45° (spaken, stukken velg, beslag, nagels) en voor en achter gelijk: wat ChatGPT niet liet
// zien, neemt de kleur van een gedraaide kopie, en de binnenkant die van de buitenkant (gespiegeld)
const draai = (k) => (p) => {
  const a = (k * Math.PI) / 4;
  const dy = p[1] - MIDDEN[1];
  const dz = p[2] - MIDDEN[2];
  return [p[0], MIDDEN[1] + Math.cos(a) * dy - Math.sin(a) * dz, MIDDEN[2] + Math.sin(a) * dy + Math.cos(a) * dz];
};
const spiegel = (p) => [2 * MIDDEN[0] - p[0], p[1], p[2]];
const KOPIEEN = [1, 2, 3, 4, 5, 6, 7].map(draai).concat([0, 1, 2, 3, 4, 5, 6, 7].map((k) => (p) => draai(k)(spiegel(p))));
let bronGptMemo = null;
function bronGpt() {
  if (bronGptMemo) return bronGptMemo;
  const R = render('ZW', 0, materialen(null), FGPT);
  bronGptMemo = { R, ...legGpt(R) };
  return bronGptMemo;
}
// de projectie (bakken.cjs): het albedo per pixel van de render op 8×. Een paarse pixel van ChatGPT (een randje van de rode
// bak of het magenta tussen de spaken: rood en blauw allebei boven groen) telt niet, en ook niet wat geen hout, ijzer of lijn
// is. Een strenger filter (alles wat roder is dan oranje, en niets meer dan ruim twee keer lichter) gooide ook de
// roodbruine schaduw op de spaken weg: die werden olijfkleurig (uit/ai/oppervlak-gpt/filter.png; Marcel, 19 okt, over de
// eerste versie: "deze kwam heel dichtbij die van gpt").
function projectieGpt() {
  const { R, beeld } = bronGpt();
  const SM = require('../pixelart/stijlmaat.cjs');
  const paars = (k) => k[2] > k[1] + 8 && k[0] > k[1] + 8;
  return BK.projectie(R, beeld, {
    lichtMacht: LICHTMACHT,
    binnen: (X, Y) => beeld.rgba[(Y * beeld.b + X) * 4 + 3] >= 128,
    soort: (k) => SM.soortVan(k[0], k[1], k[2]) !== 'anders' && !paars(k),
    matVan: (st) => R.model.delen[st].m,
  });
}
function bakGpt() {
  const t0 = Date.now();
  const { R, beeld, p, samen } = bronGpt();
  // ter controle: de gelegde pixels, en half over onze render
  H.bewaar(path.join(UIT, 'gelegd.png'), beeld);
  const half = { b: R.b, h: R.h, rgba: Buffer.from(R.zl.rgba) };
  for (let i = 0; i < R.b * R.h; i++) if (beeld.rgba[i * 4 + 3]) for (let c = 0; c < 3; c++) half.rgba[i * 4 + c] = (half.rgba[i * 4 + c] + beeld.rgba[i * 4 + c]) >> 1;
  H.bewaar(path.join(UIT, 'gelegd-half.png'), half);
  const ligging = { spiegel: p.spiegel, hoek: +((p.hoek * 180) / Math.PI).toFixed(2), schaal: +p.schaal.toFixed(3), tx: p.tx, ty: p.ty, samen: +samen.toFixed(3) };
  console.log(`ChatGPT gelegd: ${JSON.stringify(ligging)} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  fs.writeFileSync(path.join(UIT, 'ligging.json'), JSON.stringify(ligging));
}

// De stijl van het wiel zoals nu (doelwiel.cjs: stijl D met het handschrift), één keer geijkt; en dezelfde met de gebakken
// kleur in plaats van de reeksen (stijl.cjs renderKleur), zodat alleen het handschrift (de lijnen) erover komt.
function stijlenGpt() {
  const pad = path.join(UIT, 'stijl-H.json');
  if (!fs.existsSync(pad)) fs.writeFileSync(pad, JSON.stringify(DW.stijlVoor([render('ZW', 0, basis), render('ZW', 4, basis)], true)));
  const H0 = JSON.parse(fs.readFileSync(pad));
  const Kst = JSON.parse(JSON.stringify(H0));
  for (const m of ['hout', 'ijzer', 'goud']) if (Kst.materialen[m]) Kst.materialen[m].renderKleur = true;
  return { H: H0, K: Kst };
}

function leesBak() {
  if (W.gpt) return projectieGpt();
  const j = JSON.parse(fs.readFileSync(path.join(UIT, 'bak.json')));
  return { dicht: j.dicht, kaart: new Map(j.kaart) };
}

// ---------------------------------------------------------------- de sprite

// Het vaste palet per soort beeld ('B' gebakken, 'U' zonder bak), uit zuidwest en noordoost in stand 0. Wiel C: 48 kleuren
// gedeeld; het wiel naar het doel: een palet per materiaal (doelwiel.cjs).
function paletVan(soort, mat) {
  if (W.verklein === 'vol') return null;
  const pad = path.join(UIT, `palet-${soort}.json`);
  if (W.verklein === 'detail') return DW.paletVast(pad, (k, s) => render(k, s, mat));
  if (fs.existsSync(pad)) return JSON.parse(fs.readFileSync(pad));
  const P = H.paletVan(BAKKANTEN.map((k) => H.verklein(render(k, 0, mat).zl, 2, 'filter')), PALET);
  fs.writeFileSync(pad, JSON.stringify(P));
  return P;
}
// 'vol': de naaste pixel (letterlijk, zoals het doel op maat gezet is), omlijnd, zonder palet (alle kleuren van de render);
// box en detailbehoudend verkleinen waren even modderig (uit/ai/oppervlak-gpt/verkleinen.png)
const spriteVan = (R, G, P) => {
  if (W.verklein === 'vol') return H.omlijnBeeld(H.verklein(R.zl, 2, 'naast'));
  return W.verklein === 'detail' ? DW.spriteVan(R, G, P) : H.naarPalet(H.omlijnBeeld(H.naarPalet(H.verklein(R.zl, 2, 'filter'), P)), P);
};
// waar elke soort sprite staat: B gebakken, U zonder bak, H zoals nu (het handschrift), K gebakken met het handschrift
const MAPPEN = { B: 'gebakken', U: 'zonder', H: 'handschrift', K: 'gebakken-handschrift' };

// ---------------------------------------------------------------- render: een richting

// Acht standen en een volle slag, gebakken (B) en zonder bak (U), met hun metingen (flikkeren enz., hdstijl.cjs meet) op
// de G-buffer van dezelfde geometrie. Voor wiel C ook D van de stijlproef en, naar zuidwest, SDXL per beeld (X).
function renderKant(kant) {
  const ij = HS.leesIjk();
  const matB = materialen(leesBak());
  const matU = basis;
  const PB = paletVan('B', matB);
  const PU = paletVan('U', matU);
  const stijlen = W.gpt ? stijlenGpt() : null;
  const tijden = [];
  const lijst = [];
  for (let s = 0; s < STANDEN.length; s++) {
    const RB = render(kant, s, matB);
    const RU = render(kant, s, matU);
    tijden.push(RB.ms);
    const G = S.gbuffer(RU, 2);
    const GB = S.gbuffer(RB, 2);
    const beelden = { B: spriteVan(RB, GB, PB), U: spriteVan(RU, G, PU) };
    if (stijlen) {
      beelden.H = DW.gestileerd(RU, stijlen.H);
      beelden.K = DW.gestileerd(RB, stijlen.K);
    }
    for (const [k, r] of Object.entries(beelden)) {
      if (!MAPPEN[k]) continue;
      fs.mkdirSync(path.join(UIT, MAPPEN[k]), { recursive: true });
      H.bewaar(path.join(UIT, MAPPEN[k], `${kant}-${s}.png`), r);
    }
    if (wielNaam === 'c') {
      beelden.D = H.lees(path.join(HS.UIT, 'D', `${kant}-${s}.png`));
      if (kant === 'ZW') beelden.X = H.lees(s === 8 ? path.join(AF.UIT, `${W.bron}-opnieuw`, 'ZW-0', 'sprite-detail.png') : path.join(AF.UIT, W.bron, `ZW-${s}`, 'sprite-detail.png'));
    }
    lijst.push({ G, beelden, nagels4: HS.nagelKoppen4(RU), nagels: new Set(RU.nagels) });
  }
  const metingen = Object.fromEntries(Object.keys(lijst[0].beelden).map((k) => [k, HS.meet(lijst, k, ij, kant)]));
  // naar zuidwest ook de maten van stand 0 (tegen het doel)
  const zw = kant === 'ZW' ? Object.fromEntries(Object.entries(lijst[0].beelden).map(([k, r]) => [k, AF.spriteMaten(r, lijst[0].G, lijst[0].nagels)])) : null;
  fs.writeFileSync(path.join(UIT, `meting-${kant}.json`), JSON.stringify({ msPerBeeld: Math.round(tijden.reduce((a, b) => a + b, 0) / tijden.length), metingen, zw }, null, 1));
  console.log(`${kant}: ${Math.round(tijden.reduce((a, b) => a + b, 0) / tijden.length)} ms per beeld; ${Object.entries(metingen).map(([k, m]) => `${k} flikkeren ${m.flikkeren.deel} (${m.flikkeren.n})`).join(', ')}`);
}

// ---------------------------------------------------------------- de platen en de metingen samen

function platen() {
  const ij = HS.leesIjk();
  const lees = (p) => K.leesPng(fs.readFileSync(p));
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const van = (soort, kant, s) => {
    if (MAPPEN[soort]) return lees(path.join(UIT, MAPPEN[soort], `${kant}-${s}.png`));
    if (soort === 'D') return lees(path.join(HS.UIT, 'D', `${kant}-${s}.png`));
    return lees(path.join(AF.UIT, WIELEN.c.bron, `ZW-${s}`, 'sprite-detail.png'));
  };
  const uVan = {};
  const toon = W.gpt ? ['H', 'B', 'K'] : wielNaam === 'c' ? ['D', 'X', 'B'] : ['D', 'U', 'B'];
  const uitsnede = (kant) => uVan[kant] || (uVan[kant] = H.uitsnede([0, 1, 2, 3, 4, 5, 6, 7].flatMap((s) => (W.gpt ? toon : ['B', 'U', 'D']).map((k) => van(k, kant, s))), 4));
  const knip = (r, kant) => H.alfaSnij(r, uitsnede(kant));
  const per = K.KANTEN.map((kant) => ({ kant, ...JSON.parse(fs.readFileSync(path.join(UIT, `meting-${kant}.json`))) }));
  const soorten = Object.keys(per[0].metingen);
  const samen = {};
  for (const k of soorten) {
    const v = per.map((p) => p.metingen[k]).filter(Boolean);
    const n = v.reduce((t, m) => t + m.flikkeren.n, 0);
    samen[k] = { flikkeren: +(v.reduce((t, m) => t + m.flikkeren.deel * m.flikkeren.n, 0) / n).toFixed(3), glimlichtWissel: +(v.reduce((t, m) => t + m.glimlichtWissel, 0) / v.length).toFixed(3), lijnWissel: +(v.reduce((t, m) => t + m.lijnWissel, 0) / v.length).toFixed(3), volleSlag: +(v.reduce((t, m) => t + m.volleSlag, 0) / v.length).toFixed(2), richtingen: v.length };
  }
  // zuidwest, stand 0, tegen het doel
  const doel = HS.doelOpMaat(ij.hoogte);
  const doelK = H.alfaSnij(doel, H.uitsnede([doel], 4));
  const doel4 = HS.doelOpMaat(ij.hoogte * 4);
  const doel4K = H.alfaSnij(doel4, H.uitsnede([doel4], 16));
  const doelOnt = HS.ontleedWiel(doel);
  const zw = per.find((p) => p.kant === 'ZW').zw;
  const beeld = (k) => van(k, 'ZW', 0);
  const NAAM = W.gpt
    ? { H: 'zoals nu (stijl D met het handschrift)', B: 'de pixels van ChatGPT, gebakken, in volle kleur', K: 'de pixels van ChatGPT, gebakken, met het handschrift' }
    : { D: 'D van de stijlproef (wiel C)', X: 'SDXL per beeld (wiel C)', U: `${W.naam}, zonder bak`, B: `${W.naam}, SDXL gebakken` };
  const ont = {};
  for (const k of toon) {
    const o = HS.ontleedWiel(knip(beeld(k), 'ZW'));
    ont[k] = { kleur: Object.fromEntries(['hout', 'ijzer'].map((m) => [m, AF.deltaE(o.materiaal[m].gem, doelOnt.materiaal[m].gem)])), contrast: o.stijl.contrast, lijn: Math.round(o.aandeel.lijn * 100), ...(zw[k] || {}) };
  }
  E.bewaar(path.join(UIT, 'vergelijking.png'), [
    [E.met(opGrond(doel4K), 'doel: het ChatGPT-wiel'), ...toon.map((k) => E.met(groot(opGrond(knip(beeld(k), 'ZW')), 4), NAAM[k]))],
    [E.met(opGrond(doelK), 'doel'), ...toon.map((k) => E.met(opGrond(knip(beeld(k), 'ZW')), k))],
    [E.met(groot(opGrond(doelK), 3), 'doel, maal 3'), ...toon.map((k) => E.met(groot(opGrond(knip(beeld(k), 'ZW')), 3), `${NAAM[k]}, maal 3`))],
  ], W.gpt ? 'De pixels van ChatGPT op het wiel' : `De AI op het oppervlak: ${W.naam}`, W.gpt
    ? 'Zuidwest, stand 0. Rij 1 op dezelfde zichtbare grootte (onze sprites van 2× maal 4), rij 2 op 1920×1080, rij 3 dat maal 3. Gebakken: de pixels van het ChatGPT-wiel, op onze render van zuidwest gelegd, op het oppervlak (zonder ons licht), door onze renderer opnieuw belicht; met de naaste pixel verkleind, zonder palet.'
    : `Zuidwest, stand 0. Rij 1 op dezelfde zichtbare grootte (onze sprites van 2× maal 4), rij 2 op 1920×1080, rij 3 dat maal 3. Gebakken: de beschildering van SDXL (zuidwest en noordoost, denoise 0,65) op het oppervlak, door onze renderer opnieuw belicht; ${W.verklein === 'detail' ? 'detailbehoudend verkleind, een palet per materiaal' : 'box, 48 kleuren'}.`);
  const KORT = { B: 'gebakken', U: 'zonder bak', D: 'D', H: 'zoals nu', K: 'gebakken, handschrift' };
  const rijen = (W.gpt ? toon : wielNaam === 'c' ? ['D', 'B'] : ['U', 'B']).map((k) => K.KANTEN.map((kant) => E.met(groot(opGrond(knip(van(k, kant, 0), kant)), 2), `${KORT[k]} · ${kant}`)));
  E.bewaar(path.join(UIT, 'richtingen.png'), rijen, `Acht richtingen, stand 0: ${W.naam}`, W.gpt ? 'Maal 2. Geprojecteerd uit het ChatGPT-wiel (alleen de buitenkant, naar zuidwest); wat ChatGPT niet liet zien, neemt de kleur van een gedraaide of gespiegelde kopie, en anders onze eigen textuur.' : 'Maal 2. Gebakken uit zuidwest (buitenkant) en noordoost (binnenkant).');
  const frames = [0, 1, 2, 3, 4, 5, 6, 7].map((s) => H.naastElkaar(toon.map((k) => groot(opGrond(knip(van(k, 'ZW', s), 'ZW')), 3)), toon.length));
  fs.writeFileSync(path.join(UIT, 'draaien.png'), apng(frames.map((r) => ({ b: r.b, h: r.h, rgba: () => r.rgba })), { fps: 6 }));
  const tijden = per.map((p) => p.msPerBeeld);
  fs.writeFileSync(path.join(UIT, 'metingen.json'), JSON.stringify({ wiel: wielNaam, bron: W.bron, samen, perRichting: per, zuidwest: ont, doelDetail: AF.detailVan(doelK), msPerBeeld: tijden }, null, 1));
  for (const [k, m] of Object.entries(samen)) console.log(k, JSON.stringify(m));
  for (const [k, m] of Object.entries(ont)) console.log(k, 'kleur', JSON.stringify(m.kleur), 'contrast', m.contrast, 'lijn', `${m.lijn}%`, m.detail !== undefined ? `detail ${m.detail} nagels ${m.nagels.zichtbaar}/${m.nagels.koppen}` : '');
  console.log('render ms per beeld', tijden.join(' '));
  console.log(`${path.relative(process.cwd(), UIT)}: vergelijking.png, richtingen.png, draaien.png, metingen.json`);
}

async function alles() {
  bakken();
  for (const f of ['palet-B.json', 'palet-U.json', 'stijl-H.json']) if (fs.existsSync(path.join(UIT, f))) fs.unlinkSync(path.join(UIT, f));
  paletVan('B', materialen(leesBak()));
  paletVan('U', basis);
  if (W.gpt) stijlenGpt();
  await Promise.all(K.KANTEN.map((kant) => new Promise((ok, mis) => execFile(process.execPath, [__filename, '--wiel', wielNaam, 'render', kant], { maxBuffer: 1e7 }, (e, uit, fout) => {
    process.stdout.write(uit);
    if (e) return mis(new Error(fout || e.message));
    ok();
  }))));
  platen();
}

async function main() {
  const args = process.argv.slice(2).filter((a, i, l) => a !== '--wiel' && l[i - 1] !== '--wiel');
  const [wat, a1] = args;
  if (wat === 'sdxl') return sdxl();
  if (wat === 'bak') return bakken();
  if (wat === 'render') return renderKant(a1);
  if (wat === 'platen') return platen();
  if (wat === 'alles') return alles();
  console.log('node gereedschap/ai/oppervlak.cjs [--wiel c|doel] sdxl | bak | render <kant> | platen | alles');
}

module.exports = { bakken, leesBak, materialen, render, spriteVan, paletVan, groepVan, bronGpt, KOPIEEN, UIT, WIELEN };

if (require.main === module) main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
