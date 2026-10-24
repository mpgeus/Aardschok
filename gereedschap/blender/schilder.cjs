// De schilderbeurt met SDXL over het Blender-model (vraag 190; ontwerp/beeld.md, "Blender als basis?"). Marcel, 24 okt:
// "Is er een mogelijkheid om de basis 3d vorm te gebruiken en te verven met sdxl? Met de pixel lora?", en "ok, laten we
// sdxl met de pixel lora proberen". De render van speerman_hd.py is het begin (op #FF00FF), zijn lijnen en zijn diepte
// sturen de vorm (ControlNet union), vel 01 van de generator is het voorbeeld voor de stijl (IP-Adapter), en SDXL schildert
// alleen binnen ons silhouet. Dezelfde werkstroom als de rest (afwerking.cjs werkstroom), twee schilders: SDXL met de
// pixelart-LoRA (huisstijl.cjs LORA) en Pixel Art Base (huisstijl.cjs CHECKPOINTS), elk op drie sterktes.
//
//   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P gereedschap/blender/speerman_hd.py -- <render> stuur
//   node gereedschap/blender/schilder.cjs        (ComfyUI moet draaien) naar gereedschap/pixelart/uit/blender/sdxl/
//   node gereedschap/blender/schilder.cjs plaat  de plaat opnieuw uit de bewaarde beelden van SDXL
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const G = require('../pixelart/generator.cjs');
const AF = require('../ai/afwerking.cjs');
const A = require('../ai/beeld-ai.cjs');
const E = require('../ai/etiket.cjs');
const HU = require('../ai/huisstijl.cjs');
const S = require('../pixelart/soldatenhd.cjs');

const W = 832;
const H = 1216; // een staand formaat van SDXL
const DOEK = require('../ai/doek.cjs').maak(W, H);
const RENDER = path.join(__dirname, '..', 'pixelart', 'uit', 'blender', 'render');
const UIT = path.join(__dirname, '..', 'pixelart', 'uit', 'blender', 'sdxl');
const VEL01 = path.join(__dirname, '..', 'pixelart', 'uit', 'generator', 'bron', 'speerman-01.png');
const MAGENTA = [255, 0, 255];
const lees = (p) => K.leesPng(fs.readFileSync(p));

const POSITIEF = `${HU.LORA.woorden}, full body medieval village spearman standing, seen from the front, stocky ` +
  'broad-shouldered soldier, dull matte iron kettle hat with a ridge, short grey-black beard and moustache, chainmail coif ' +
  'and a round chainmail collar, deep blue tabard with a broad yellow vertical stripe down the middle, brown quilted gambeson ' +
  'sleeves, dark leather bracers, brown leather gloves, wide red-brown leather belt with a silver buckle, dark blue hose, ' +
  'short brown leather boots with turned-down cuffs, holding a long spear upright in his right hand, leaf-shaped iron spear ' +
  `head, ${HU.HUISSTIJL.zin}, matte worn surfaces, dull iron, matte wool and leather`;
const NEGATIEF = 'photo, photorealism, 3d render, cgi, plastic, blurry, deformed, extra limbs, extra weapons, two spears, ' +
  'text, watermark, signature, frame, border, ground, grass, scenery, multiple people, cropped, shiny, glossy, chrome, ' +
  'polished metal, plume, feather, pennant, flag, shield, red clothes, quartered tabard';

const VARIANTEN = [
  ...[0.35, 0.5, 0.65].map((denoise) => ({ naam: `lora-${denoise}`, label: `SDXL + pixel-LoRA, ${denoise}`, denoise, lora: HU.LORA })),
  ...[0.35, 0.5, 0.65].map((denoise) => ({ naam: `pab-${denoise}`, label: `Pixel Art Base, ${denoise}`, denoise, checkpoint: HU.CHECKPOINTS.pixelartbase })),
];
const INSTELLINGEN = { ...AF.START, lijn: 0.8, diepte: 0.6, cnEind: 0.85, ip: 0.5, ipSoort: 'style transfer', seed: 180 };

// Een beeld uit de render op het doek: het silhouet in een kader, verkleind (gemiddeld per blok) tot het past, onderaan.
function plaatsing(kleur) {
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (let y = 0; y < kleur.h; y++) for (let x = 0; x < kleur.b; x++) if (kleur.rgba[(y * kleur.b + x) * 4 + 3] > 8) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const m = 24, k = Math.min((W - 2 * m) / (x1 - x0 + 1), (H - 2 * m) / (y1 - y0 + 1));
  return { x0, y0, x1, y1, k, ox: (W - (x1 - x0 + 1) * k) / 2, oy: H - m - (y1 - y0 + 1) * k };
}
function opDoek(beeld, p, metAlfa) {
  const som = new Float64Array(W * H * 4), tel = new Float64Array(W * H);
  for (let y = p.y0; y <= p.y1; y++) for (let x = p.x0; x <= p.x1; x++) {
    const u = Math.floor(p.ox + (x - p.x0 + 0.5) * p.k), v = Math.floor(p.oy + (y - p.y0 + 0.5) * p.k);
    if (u < 0 || v < 0 || u >= W || v >= H) continue;
    const s = (y * beeld.b + x) * 4, d = v * W + u;
    for (let c = 0; c < 4; c++) som[d * 4 + c] += c < 3 && metAlfa ? beeld.rgba[s + c] * beeld.rgba[s + 3] / 255 : beeld.rgba[s + c];
    tel[d]++;
  }
  const uit = { b: W, h: H, rgba: Buffer.alloc(W * H * 4), alfa: new Float32Array(W * H) };
  for (let d = 0; d < W * H; d++) {
    const a = tel[d] ? som[d * 4 + 3] / tel[d] / 255 : 0;
    uit.alfa[d] = metAlfa ? a : 1;
    for (let c = 0; c < 3; c++) {
      const v = tel[d] ? som[d * 4 + c] / tel[d] : 0;
      uit.rgba[d * 4 + c] = Math.round(metAlfa ? v + MAGENTA[c] * (1 - a) : v);
    }
    uit.rgba[d * 4 + 3] = 255;
  }
  return uit;
}

function invoer() {
  const kleur = lees(path.join(RENDER, 'staan-Z-hd-mens.png'));
  const p = plaatsing(kleur);
  const init = opDoek(kleur, p, true);
  const lijnen = opDoek(lees(path.join(RENDER, 'stuur-lijnen.png')), p, false);
  const diepte = opDoek(lees(path.join(RENDER, 'stuur-diepte.png')), p, false);
  // het masker: ons silhouet, zes pixels ruimer (daar mag SDXL schilderen)
  const binnen = new Uint8Array(W * H);
  for (let d = 0; d < W * H; d++) binnen[d] = init.alfa[d] > 0.5 ? 1 : 0;
  const masker = { b: W, h: H, rgba: Buffer.alloc(W * H * 4) };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let aan = 0;
    for (let dy = -6; dy <= 6 && !aan; dy++) for (let dx = -6; dx <= 6 && !aan; dx++) {
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < W && Y < H && binnen[Y * W + X]) aan = 1;
    }
    masker.rgba.set(aan ? [255, 255, 255, 255] : [0, 0, 0, 255], (y * W + x) * 4);
  }
  // de diepte opgerekt binnen het silhouet (in Blender is het bereik ruim): dichtbij wit, ver 70, de rest zwart. Het bereik
  // van 2 tot 98 procent, zonder de rand (daar mengt de achtergrond mee en trekt het scheef)
  const kern = [];
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    const d = y * W + x;
    if (binnen[d] && binnen[d - 2] && binnen[d + 2] && binnen[d - 2 * W] && binnen[d + 2 * W]) kern.push(diepte.rgba[d * 4]);
  }
  kern.sort((a, b) => a - b);
  const lo = kern[Math.floor(kern.length * 0.02)], hi = kern[Math.floor(kern.length * 0.98)];
  for (let d = 0; d < W * H; d++) {
    const t = Math.max(0, Math.min(1, (diepte.rgba[d * 4] - lo) / Math.max(1, hi - lo)));
    const v = binnen[d] ? Math.round(70 + t * 185) : 0;
    diepte.rgba.set([v, v, v, 255], d * 4);
  }
  return { p, init, lijnen, diepte, masker, binnen };
}

// het voorbeeld voor de stijl: staan naar Z van vel 01, op magenta
function stijl() {
  const vel = lees(VEL01);
  const b = 300, h = 560, uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) vel.rgba.copy(uit.rgba, (y * b + x) * 4, ((100 + y) * vel.b + x) * 4, ((100 + y) * vel.b + x) * 4 + 4);
  for (let i = 0; i < b * h; i++) uit.rgba[i * 4 + 3] = 255;
  return uit;
}

// het beeld van SDXL terug: binnen ons silhouet, mat afgewerkt (soldatenhd.cjs matter, mat 3)
// (zonder de randpixels die nog magenta in zich hebben: in het begin mengt de rand van het silhouet met de achtergrond)
function terug(aiPng, inv) {
  const ai = A.leesPng(aiPng);
  const uit = { b: W, h: H, rgba: Buffer.alloc(W * H * 4) };
  const magentaAchtig = (r, g, b) => Math.min(r, b) - g > 30;
  for (let d = 0; d < W * H; d++) {
    if (!inv.binnen[d]) continue;
    const r = ai.rgba[d * 4], g = ai.rgba[d * 4 + 1], b = ai.rgba[d * 4 + 2];
    if (inv.init.alfa[d] < 0.9 && magentaAchtig(r, g, b)) continue;
    uit.rgba.set([r, g, b, 255], d * 4);
  }
  return S.matter(uit, S.MAT);
}

// op spelmaat: van de zolen tot de top van de helm even hoog als de speerman in het spel, met een donkere rand
function spelmaat(beeld, doel) {
  let t = -1, o = -1;
  for (let y = 0; y < beeld.h; y++) {
    let n = 0;
    for (let x = 0; x < beeld.b; x++) if (beeld.rgba[(y * beeld.b + x) * 4 + 3] >= 128) n++;
    if (n > beeld.b * 0.12 && t < 0) t = y;
    if (n) o = y;
  }
  const pix = [];
  let xs = 0, n = 0;
  for (let p = 0; p < beeld.b * beeld.h; p++) if (beeld.rgba[p * 4 + 3] >= 128) { pix.push(p); if (((p / beeld.b) | 0) > o - 30) { xs += p % beeld.b; n++; } }
  const klein = G.verkleind(beeld, pix, [xs / n, o], doel / (o - t + 1));
  const om = Buffer.from(klein.rgba);
  const dekt = (x, y) => x >= 0 && y >= 0 && x < klein.b && y < klein.h && klein.rgba[(y * klein.b + x) * 4 + 3] >= 128;
  for (let y = 0; y < klein.h; y++) for (let x = 0; x < klein.b; x++) {
    if (!dekt(x, y)) continue;
    const sch = !dekt(x + 1, y) || !dekt(x, y + 1), li = !dekt(x - 1, y) || !dekt(x, y - 1);
    if (!sch && !li) continue;
    const f = sch ? 0.38 : 0.55, d = (y * klein.b + x) * 4;
    for (let c = 0; c < 3; c++) om[d + c] = Math.round(klein.rgba[d + c] * f + [22, 14, 10][c] * (1 - f));
  }
  return { ...klein, rgba: om };
}

// een vakje op grond, met het anker op dezelfde plek, vergroot
function vak(beeld, b, h, ax, ay, grond, n) {
  const v = { b: b * n, h: h * n, rgba: Buffer.alloc(b * n * h * n * 4) };
  for (let i = 0; i < b * n * h * n; i++) v.rgba.set([...grond, 255], i * 4);
  for (let y = 0; y < beeld.h; y++) for (let x = 0; x < beeld.b; x++) {
    const s = (y * beeld.b + x) * 4;
    if (beeld.rgba[s + 3] < 128) continue;
    const X = ax - beeld.anker[0] + x, Y = ay - beeld.anker[1] + y;
    if (X < 0 || Y < 0 || X >= b || Y >= h) continue;
    for (let dy = 0; dy < n; dy++) for (let dx = 0; dx < n; dx++) beeld.rgba.copy(v.rgba, ((Y * n + dy) * b * n + X * n + dx) * 4, s, s + 4);
  }
  return v;
}

// een HD-beeld verkleind tot de hoogte h (voor de plaat), op grijs
function klein(beeld, h) {
  const pix = [];
  for (let p = 0; p < beeld.b * beeld.h; p++) if (beeld.rgba[p * 4 + 3] >= 128) pix.push(p);
  const k = h / beeld.h;
  const r = G.verkleind(beeld, pix, [beeld.b / 2, beeld.h], k);
  return vak(r, Math.round(beeld.b * k) + 2, h + 2, Math.round(beeld.b * k / 2) + 1, h + 1, [92, 96, 90], 1);
}

async function main() {
  fs.mkdirSync(UIT, { recursive: true });
  const inv = invoer();
  for (const [k, r] of Object.entries({ init: inv.init, lijnen: inv.lijnen, diepte: inv.diepte, masker: inv.masker, stijl: stijl() })) {
    fs.writeFileSync(path.join(UIT, `${k}.png`), K.pngVanBeeld(r));
  }
  const namen = { positief: POSITIEF, negatief: NEGATIEF };
  for (const k of ['init', 'lijnen', 'diepte', 'masker', 'stijl']) namen[k] = await A.upload(`aardschok-blender-${k}.png`, fs.readFileSync(path.join(UIT, `${k}.png`)), 'image/png');
  const uitkomst = [];
  for (const v of VARIANTEN) {
    const o = { ...INSTELLINGEN, denoise: v.denoise, lora: v.lora || null, checkpoint: v.checkpoint };
    const t0 = Date.now();
    const png = await DOEK.voerUit(AF.werkstroom(namen, o));
    fs.writeFileSync(path.join(UIT, `${v.naam}-ai.png`), png);
    const beeld = terug(png, inv);
    fs.writeFileSync(path.join(UIT, `${v.naam}.png`), K.pngVanBeeld(beeld));
    console.log(`${v.label}: ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    uitkomst.push({ ...v, beeld });
  }
  fs.writeFileSync(path.join(UIT, 'instellingen.json'), JSON.stringify({ positief: POSITIEF, negatief: NEGATIEF, instellingen: INSTELLINGEN, varianten: VARIANTEN, doek: [W, H] }, null, 2));
  plaat(inv, uitkomst);
}

function plaat(inv, uitkomst) {
  // de render van Blender en vel 01 op het doek, als beelden met doorzichtigheid
  const blender = { b: W, h: H, rgba: Buffer.alloc(W * H * 4) };
  for (let d = 0; d < W * H; d++) if (inv.binnen[d]) blender.rgba.set([inv.init.rgba[d * 4], inv.init.rgba[d * 4 + 1], inv.init.rgba[d * 4 + 2], 255], d * 4);
  const vel = lees(VEL01), fg = G.voorgrond(vel);
  const ref = { b: 300, h: 560, rgba: Buffer.alloc(300 * 560 * 4) };
  for (let y = 0; y < 560; y++) for (let x = 0; x < 300; x++) if (fg[(100 + y) * vel.b + x]) ref.rgba.set([...vel.rgba.subarray(((100 + y) * vel.b + x) * 4, ((100 + y) * vel.b + x) * 4 + 3), 255], (y * 300 + x) * 4);
  const besch = require('../../beelden/beschrijving.json').figuren.speerman.houdingen.staan;
  const spelVel = lees(path.join(__dirname, '..', '..', 'beelden', 'figuren', besch.bestand));
  const [cb, ch] = besch.cel;
  const spel = { b: cb, h: ch, rgba: Buffer.alloc(cb * ch * 4), anker: besch.anker };
  for (let y = 0; y < ch; y++) spelVel.rgba.copy(spel.rgba, y * cb * 4, y * spelVel.b * 4, (y * spelVel.b + cb) * 4);
  const doel = 74;
  const HOOG = 420;
  const groot = [E.met(klein(ref, HOOG), 'Vel 01'), E.met(klein(blender, HOOG), 'Blender'), ...uitkomst.map((u) => E.met(klein(u.beeld, HOOG), u.label))];
  const gras = [79, 104, 52];
  const op = (b) => vak(b, 80, 112, 40, 104, gras, 3);
  const spelrij = [E.met(op(spel), 'in het spel'), E.met(op(spelmaat(blender, doel)), 'Blender'), ...uitkomst.map((u) => E.met(op(spelmaat(u.beeld, doel)), u.label.replace('SDXL + pixel-LoRA', 'LoRA').replace('Pixel Art Base', 'PAB')))];
  E.bewaar(path.join(UIT, 'plaat.png'), [groot.slice(0, 5), [groot[0], groot[1], ...groot.slice(5)], spelrij.slice(0, 5), [spelrij[0], spelrij[1], ...spelrij.slice(5)]],
    'Vraag 190: SDXL schildert over het Blender-model (staan Z)',
    `Begin: de Blender-render; vorm: zijn lijnen en diepte (ControlNet union ${INSTELLINGEN.lijn} en ${INSTELLINGEN.diepte}); stijl: vel 01 (IP-Adapter ${INSTELLINGEN.ip}); zaad ${INSTELLINGEN.seed}; mat 3. Onder op spelmaat maal 3.`);
  console.log('uit/blender/sdxl/plaat.png');
}

// de plaat opnieuw uit de bewaarde beelden van SDXL (<naam>-ai.png), zonder opnieuw te schilderen
function plaatOpnieuw() {
  const inv = invoer();
  const uitkomst = VARIANTEN.filter((v) => fs.existsSync(path.join(UIT, `${v.naam}-ai.png`))).map((v) => {
    const beeld = terug(fs.readFileSync(path.join(UIT, `${v.naam}-ai.png`)), inv);
    fs.writeFileSync(path.join(UIT, `${v.naam}.png`), K.pngVanBeeld(beeld));
    return { ...v, beeld };
  });
  plaat(inv, uitkomst);
}

if (require.main === module) (process.argv[2] === 'plaat' ? Promise.resolve(plaatOpnieuw()) : main()).catch((e) => { console.error(e); process.exit(1); });
module.exports = { invoer, POSITIEF, NEGATIEF };
