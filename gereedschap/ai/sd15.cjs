// De werkstroom van Marcels opdracht (gereedschap/ai/opdracht-comfyui.md; werklijst vraag 180, fase 1): SD 1.5 in ComfyUI,
// image-to-image van onze ruwe render naar HD-pixel art, met weinig vrijheid (denoise 0,3 tot 0,5) en een strakke
// ControlNet, zodat de beelden van één ding (de kanten, de loopbeelden) gelijk blijven. Marcel koos (18 okt): de lijnen
// voor ControlNet maken we zelf uit ons 3D-model, niet met een voorbewerking van derden: dat zijn exact onze vormen, in
// elk beeld dezelfde.
//
// Per beeld: onze render en onze lijnen op 768 × 576 (geschaald met behoud van verhouding, aangevuld met #FF00FF), naar
// ComfyUI (op 127.0.0.1:8188, de eigen pc), en terug: het beeld van de AI, uitgesneden met de omtrek van onze render (een
// deterministisch masker: daarbuiten exact #FF00FF), en in de maat van het spel. Per beeld een map met de render, de
// lijnen, het antwoord, de sprite, de pixels, de instellingen (met de seed, de tijd en de controles), de werkstroom en een
// vergelijking. De controles: de maat van het doek, de achtergrond exact #FF00FF, en hoeveel de AI van ons silhouet afweek.
//
//   node gereedschap/ai/sd15.cjs een [naam] [lineart|softedge]      één beeld met de startinstellingen
//   node gereedschap/ai/sd15.cjs matrix [naam] [lineart|softedge]   denoise 0,30 / 0,40 / 0,50 maal ControlNet 0,75 / 1,00
//   node gereedschap/ai/sd15.cjs werkstroom                         alleen gereedschap/ai/werkstroom-sd15.json schrijven
//
// De naam is die van een leidraad (wagen-zw, wagen-no, lopen-zw-0 ...); alles komt in gereedschap/pixelart/uit/ai/sd15/.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const O = require('../pixelart/ossenkar.cjs');
const { windVoor } = require('../pixelart/heerstoet.cjs');
const A = require('./beeld-ai.cjs');

const W = 768;
const H = 576;
const MAGENTA = [255, 0, 255];
const RAND = 6; // zoveel pixels ruimte om het ding, zoals de leidraad van beeld-ai.cjs
const UIT = path.join(A.UIT, 'sd15');
const MODELLEN = {
  checkpoint: 'DreamShaper_8_pruned.safetensors',
  vae: 'vae-ft-mse-840000-ema-pruned.safetensors',
  controlnet: { lineart: 'control_v11p_sd15_lineart_fp16.safetensors', softedge: 'control_v11p_sd15_softedge_fp16.safetensors' },
  ipadapter: 'ip-adapter-plus_sd15.safetensors',
  clipVision: 'CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors',
};
// De startinstellingen van de opdracht. IP-Adapter: 'linear', want de soorten "style transfer" werken alleen op SDXL.
const START = { steps: 30, cfg: 6.5, sampler: 'dpmpp_2m', scheduler: 'karras', denoise: 0.4, cn: 0.85, cnStart: 0, cnEnd: 1, ip: 0.65, ipSoort: 'linear', seed: 180 };
const MATRIX = [0.3, 0.4, 0.5].flatMap((denoise) => [0.75, 1.0].map((cn) => ({ denoise, cn })));
// Het stuk van Marcels plaat (1211 bij 1299) waar de stijl vandaan komt: de wagen van zuidwest.
let UITSNEDE = { x: 40, y: 330, b: 580, h: 360 };
const POSITIEF = 'detailed HD pixel art, isometric medieval game sprite, white ox pulling a red painted wooden cart with gold trim, ' +
  'golden lion emblem, sacks of grain, barrel, logs, open chest of gold coins, leather harness, dark outlines, rich textures, warm light';
const NEGATIEF = 'blurry, photo, 3d render, text, watermark, signature, ground, grass, shadow, extra objects, extra animals, frame';

// ---------------------------------------------------------------- onze render, onze lijnen

const PATROON = /^(wagen|lopen)-(zw|no)(?:-(\d))?$/;
function stukVan(naam) {
  const m = PATROON.exec(naam);
  if (!m) throw new Error(`Geen leidraad met de naam ${naam} (wagen-zw, wagen-no, lopen-zw-0 ...).`);
  const kant = m[2].toUpperCase();
  const o = { lading: 'buit', bak: 'heer', wind: windVoor(kant), blink: 0, ...(m[1] === 'lopen' ? { houding: 'lopen', fase: Number(m[3]) / 8 } : {}) };
  // Het ruwe beeld (diepte, object, onderdeel, richting per pixel), voor de lijnen; en de plaat zoals het spel hem ziet.
  const B = new K.Beeld(O.CEL[0], O.CEL[1], O.ANKER[0], O.ANKER[1]);
  O.tekenOssenkar(B, o, kant);
  const plaat = O.beeld(o, kant);
  return { B, plaat, k: O.kader(plaat) };
}

// Hoe het kader (met RAND eromheen) op het doek van W × H valt: geschaald met behoud van verhouding, in het midden.
function vlakVan(k) {
  const bw = k.x1 - k.x0 + 1 + 2 * RAND;
  const bh = k.y1 - k.y0 + 1 + 2 * RAND;
  const s = Math.min(W / bw, H / bh);
  const sw = Math.round(bw * s);
  const sh = Math.round(bh * s);
  return { x0: k.x0 - RAND, y0: k.y0 - RAND, bw, bh, s, sw, sh, ox: Math.floor((W - sw) / 2), oy: Math.floor((H - sh) / 2) };
}
// Een pixel van het doek op de plaat: [x, y] in de plaat, of null in de aanvulling.
function opPlaat(V, X, Y) {
  if (X < V.ox || Y < V.oy || X >= V.ox + V.sw || Y >= V.oy + V.sh) return null;
  return [V.x0 + Math.min(V.bw - 1, Math.floor((X - V.ox) / V.s)), V.y0 + Math.min(V.bh - 1, Math.floor((Y - V.oy) / V.s))];
}

// Onze render op het doek (#FF00FF waar niets is), en het masker: waar onze render iets heeft.
function renderOpDoek(st, V) {
  const rgba = st.plaat.rgba(null);
  const doek = A.leeg(W, H);
  const masker = new Uint8Array(W * H);
  for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
    const p = opPlaat(V, X, Y);
    const s = p && p[0] >= 0 && p[1] >= 0 && p[0] < st.plaat.b && p[1] < st.plaat.h ? (p[1] * st.plaat.b + p[0]) * 4 : -1;
    const i = Y * W + X;
    if (s >= 0 && rgba[s + 3] >= 128) {
      doek.rgba.set([rgba[s], rgba[s + 1], rgba[s + 2], 255], i * 4);
      masker[i] = 1;
    } else doek.rgba.set([...MAGENTA, 255], i * 4);
  }
  return { doek, masker };
}

// De lijnen uit ons 3D-model: wit op zwart, zoals een lineart-voorbewerking ze geeft. Een lijn ligt tussen twee buren als
// er aan één kant niets is (de omtrek), of als ze bij een ander object of onderdeel horen, de diepte springt, of het vlak
// een knik maakt. Op het doek een lijn van zo'n twee pixels langs de grens tussen de twee.
function lijnenOpDoek(st, V) {
  const B = st.B;
  const leeg = (i) => B.ramp[i] < 0;
  const scheidt = (i, j) => {
    if (leeg(i) !== leeg(j)) return true;
    if (leeg(i)) return false;
    if (B.obj[i] !== B.obj[j] || B.deel[i] !== B.deel[j]) return true;
    if (Math.abs(B.diep[i] - B.diep[j]) > 3) return true;
    const d = B.nrm[i * 3] * B.nrm[j * 3] + B.nrm[i * 3 + 1] * B.nrm[j * 3 + 1] + B.nrm[i * 3 + 2] * B.nrm[j * 3 + 2];
    return d < 0.8;
  };
  const idx = (x, y) => (x < 0 || y < 0 || x >= B.b || y >= B.h ? -1 : y * B.b + x);
  const grens = (a, b) => {
    if (a < 0 && b < 0) return false;
    if (a < 0 || b < 0) return !leeg(a < 0 ? b : a);
    return scheidt(a, b);
  };
  const doek = A.leeg(W, H);
  const breed = 1.1 / V.s; // een halve lijn, in pixels van de plaat
  for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
    doek.rgba.set([0, 0, 0, 255], (Y * W + X) * 4);
    if (X < V.ox || Y < V.oy || X >= V.ox + V.sw || Y >= V.oy + V.sh) continue;
    const fx = (X - V.ox) / V.s + V.x0;
    const fy = (Y - V.oy) / V.s + V.y0;
    const cx = Math.floor(fx), cy = Math.floor(fy);
    const hier = idx(cx, cy);
    const lijn = (fx - cx < breed && grens(idx(cx - 1, cy), hier)) || (cx + 1 - fx < breed && grens(hier, idx(cx + 1, cy))) ||
      (fy - cy < breed && grens(idx(cx, cy - 1), hier)) || (cy + 1 - fy < breed && grens(hier, idx(cx, cy + 1)));
    if (lijn) doek.rgba.set([255, 255, 255, 255], (Y * W + X) * 4);
  }
  return doek;
}

// ---------------------------------------------------------------- de werkstroom (de API-vorm van ComfyUI)

function werkstroom(beelden, o = START, soort = 'lineart') {
  return {
    1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: MODELLEN.checkpoint }, _meta: { title: 'Load Checkpoint' } },
    2: { class_type: 'VAELoader', inputs: { vae_name: MODELLEN.vae }, _meta: { title: 'Load VAE' } },
    3: { class_type: 'LoadImage', inputs: { image: beelden.render }, _meta: { title: 'Load Image: ruwe 3D-render (768 x 576, #FF00FF)' } },
    4: { class_type: 'VAEEncode', inputs: { pixels: ['3', 0], vae: ['2', 0] }, _meta: { title: 'VAE Encode' } },
    5: { class_type: 'LoadImage', inputs: { image: beelden.stijl }, _meta: { title: 'Load Image: stijlreferentie (heerstoet-doel)' } },
    6: { class_type: 'ImageCrop', inputs: { image: ['5', 0], width: UITSNEDE.b, height: UITSNEDE.h, x: UITSNEDE.x, y: UITSNEDE.y }, _meta: { title: 'Uitsnede: de wagen' } },
    7: { class_type: 'IPAdapterModelLoader', inputs: { ipadapter_file: MODELLEN.ipadapter }, _meta: { title: 'IP-Adapter Plus SD 1.5' } },
    8: { class_type: 'CLIPVisionLoader', inputs: { clip_name: MODELLEN.clipVision }, _meta: { title: 'CLIP Vision ViT-H' } },
    9: { class_type: 'IPAdapterAdvanced', inputs: { model: ['1', 0], ipadapter: ['7', 0], image: ['6', 0], clip_vision: ['8', 0], weight: o.ip, weight_type: o.ipSoort, combine_embeds: 'concat', start_at: 0, end_at: 1, embeds_scaling: 'V only' }, _meta: { title: 'IP-Adapter (stijl)' } },
    10: { class_type: 'LoadImage', inputs: { image: beelden.lijnen }, _meta: { title: 'Load Image: lijnen uit ons 3D-model (de voorbewerking)' } },
    11: { class_type: 'ControlNetLoader', inputs: { control_net_name: MODELLEN.controlnet[soort] }, _meta: { title: `Load ControlNet (${soort})` } },
    12: { class_type: 'CLIPTextEncode', inputs: { text: POSITIEF, clip: ['1', 1] }, _meta: { title: 'Positief' } },
    13: { class_type: 'CLIPTextEncode', inputs: { text: NEGATIEF, clip: ['1', 1] }, _meta: { title: 'Negatief' } },
    14: { class_type: 'ControlNetApplyAdvanced', inputs: { positive: ['12', 0], negative: ['13', 0], control_net: ['11', 0], image: ['10', 0], strength: o.cn, start_percent: o.cnStart, end_percent: o.cnEnd, vae: ['2', 0] }, _meta: { title: 'Apply ControlNet' } },
    15: { class_type: 'KSampler', inputs: { model: ['9', 0], positive: ['14', 0], negative: ['14', 1], latent_image: ['4', 0], seed: o.seed, steps: o.steps, cfg: o.cfg, sampler_name: o.sampler, scheduler: o.scheduler, denoise: o.denoise }, _meta: { title: 'KSampler' } },
    16: { class_type: 'VAEDecode', inputs: { samples: ['15', 0], vae: ['2', 0] }, _meta: { title: 'VAE Decode' } },
    17: { class_type: 'SaveImage', inputs: { images: ['16', 0], filename_prefix: 'aardschok-sd15' }, _meta: { title: 'Save Image' } },
  };
}

async function voerUit(stroom) {
  const r = await A.comfy('prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: stroom }) });
  const { prompt_id: id, node_errors: fouten } = await r.json();
  if (fouten && Object.keys(fouten).length) throw new Error(`ComfyUI weigert de werkstroom: ${JSON.stringify(fouten).slice(0, 600)}`);
  for (;;) {
    await new Promise((res) => setTimeout(res, 1500));
    const g = (await (await A.comfy(`history/${id}`)).json())[id];
    if (!g) continue;
    if (g.status && g.status.status_str === 'error') throw new Error(`ComfyUI: ${JSON.stringify(g.status.messages).slice(0, 800)}`);
    const beeld = Object.values(g.outputs || {}).flatMap((x) => x.images || [])[0];
    if (!beeld) continue;
    const q = new URLSearchParams({ filename: beeld.filename, subfolder: beeld.subfolder || '', type: beeld.type || 'output' });
    return Buffer.from(await (await A.comfy(`view?${q}`)).arrayBuffer());
  }
}

// ---------------------------------------------------------------- terug, en de controles

// Is dit (in het antwoord van de AI) achtergrond: magenta-achtig?
const lijktMagenta = (r, g, b) => r > 140 && b > 140 && g < 120 && Math.abs(r - b) < 100;

function verwerk(aiPng, st, V, masker) {
  const ai = A.leesPng(aiPng);
  const controle = { doek: `${ai.b}×${ai.h}`, doekGoed: ai.b === W && ai.h === H };
  // Hoe de AI van ons silhouet afweek: wat hij binnen ons silhouet als achtergrond liet, en wat hij erbuiten tekende.
  let binnen = 0, gat = 0, erbuiten = 0, hijTekent = 0;
  for (let i = 0; i < W * H; i++) {
    const tekent = !lijktMagenta(ai.rgba[i * 4], ai.rgba[i * 4 + 1], ai.rgba[i * 4 + 2]);
    if (masker[i]) { binnen++; if (!tekent) gat++; }
    else if (tekent && opPlaat(V, i % W, Math.floor(i / W))) erbuiten++;
    if (tekent) hijTekent++;
  }
  controle.silhouet = {
    gatenBinnen: +(gat / binnen * 100).toFixed(1), // procent van ons silhouet dat de AI als achtergrond liet
    getekendErbuiten: +(erbuiten / binnen * 100).toFixed(1), // zoveel buiten ons silhouet, als procent van ons silhouet
    overlap: +(((binnen - gat) / (binnen + erbuiten)) * 100).toFixed(1), // doorsnede gedeeld door vereniging
  };
  // De sprite: het antwoord binnen ons silhouet, daarbuiten exact #FF00FF (deterministisch, niet via de prompt).
  const sprite = A.leeg(W, H);
  for (let i = 0; i < W * H; i++) {
    if (masker[i]) sprite.rgba.set([ai.rgba[i * 4], ai.rgba[i * 4 + 1], ai.rgba[i * 4 + 2], 255], i * 4);
    else sprite.rgba.set([...MAGENTA, 255], i * 4);
  }
  let fout = 0;
  for (let i = 0; i < W * H; i++) if (!masker[i] && (sprite.rgba[i * 4] !== 255 || sprite.rgba[i * 4 + 1] !== 0 || sprite.rgba[i * 4 + 2] !== 255)) fout++;
  controle.achtergrondExact = fout === 0;
  // In de maat van het spel: het deel van het doek waar het kader ligt, terug naar de plaat (zelfde omtrek, kleuren, rand).
  const vak = A.leeg(V.sw, V.sh);
  for (let y = 0; y < V.sh; y++) sprite.rgba.copy(vak.rgba, y * V.sw * 4, ((V.oy + y) * W + V.ox) * 4, ((V.oy + y) * W + V.ox + V.sw) * 4);
  const pixels = A.naarPixelsMetVorm(K.pngVanBeeld(vak), st.plaat, st.k);
  return { ai, sprite, pixels, controle };
}

// ---------------------------------------------------------------- één beeld, en de matrix

async function eenBeeld(naam, o, soort, stijlNaam, bron = 'plaat') {
  const st = stukVan(naam);
  const V = vlakVan(st.k);
  const { doek, masker } = renderOpDoek(st, V);
  const lijnen = lijnenOpDoek(st, V);
  const tag = `${soort}-${bron}-d${o.denoise.toFixed(2)}-c${o.cn.toFixed(2)}-ip${o.ip.toFixed(2)}-s${o.seed}`;
  const map = path.join(UIT, naam, tag);
  fs.mkdirSync(map, { recursive: true });
  const renderPng = K.pngVanBeeld(doek);
  const lijnenPng = K.pngVanBeeld(lijnen);
  fs.writeFileSync(path.join(map, 'render.png'), renderPng);
  fs.writeFileSync(path.join(map, 'lijnen.png'), lijnenPng);
  const beelden = {
    render: await A.upload(`aardschok-${naam}-render.png`, renderPng, 'image/png'),
    lijnen: await A.upload(`aardschok-${naam}-lijnen.png`, lijnenPng, 'image/png'),
    stijl: stijlNaam,
  };
  const stroom = werkstroom(beelden, o, soort);
  fs.writeFileSync(path.join(map, 'werkstroom.json'), JSON.stringify(stroom, null, 2));
  const t0 = Date.now();
  const aiPng = await voerUit(stroom);
  const tijd = (Date.now() - t0) / 1000;
  fs.writeFileSync(path.join(map, 'ai.png'), aiPng);
  const v = verwerk(aiPng, st, V, masker);
  fs.writeFileSync(path.join(map, 'sprite.png'), K.pngVanBeeld(v.sprite));
  fs.writeFileSync(path.join(map, 'pixels.png'), K.pngVanBeeld(v.pixels));
  // De vergelijking: onze render, de lijnen en de sprite (op de helft), en de pixels naast onze plaat (twee keer).
  const half = (x) => A.verklein(x, W / 2, H / 2);
  const onze = A.leeg(st.plaat.b, st.plaat.h);
  onze.rgba = st.plaat.rgba(null);
  const rij = [half(doek), half(lijnen), half(v.sprite), A.vergroot(onze, 2), A.vergroot(v.pixels, 2)];
  fs.writeFileSync(path.join(map, 'vergelijking.png'), K.pngVanBeeld(naastElkaar([rij])));
  const instellingen = { naam, tag, stijlbron: bron === 'meester' ? process.env.MEESTER : 'ontwerp/voorbeelden/heerstoet-doel.webp', modellen: { ...MODELLEN, controlnet: MODELLEN.controlnet[soort] }, instellingen: o, soort, resolutie: `${W}×${H}`, uitsnede: UITSNEDE, positief: POSITIEF, negatief: NEGATIEF, seconden: +tijd.toFixed(1), controle: v.controle, wanneer: new Date().toISOString() };
  fs.writeFileSync(path.join(map, 'instellingen.json'), JSON.stringify(instellingen, null, 2));
  console.log(`${naam} ${tag}: ${tijd.toFixed(0)} s, overlap ${v.controle.silhouet.overlap}%, gaten ${v.controle.silhouet.gatenBinnen}%, erbuiten ${v.controle.silhouet.getekendErbuiten}%, doek ${v.controle.doekGoed ? 'goed' : v.controle.doek}, achtergrond ${v.controle.achtergrondExact ? 'exact' : 'NIET exact'}`);
  return { ...v, render: doek, lijnen, tag };
}

// Rijen van beelden naast en onder elkaar, op een donkere grond.
function naastElkaar(rijen, gat = 10) {
  const breed = Math.max(...rijen.map((r) => r.reduce((s, x) => s + x.b + gat, gat)));
  const hoog = rijen.reduce((s, r) => s + Math.max(...r.map((x) => x.h)) + gat, gat);
  const doek = A.leeg(breed, hoog);
  for (let i = 0; i < breed * hoog; i++) doek.rgba.set([40, 44, 38, 255], i * 4);
  let y = gat;
  for (const r of rijen) {
    let x = gat;
    const rh = Math.max(...r.map((s) => s.h));
    for (const s of r) {
      A.plakOp(doek, s, x, y + rh - s.h);
      x += s.b + gat;
    }
    y += rh + gat;
  }
  return doek;
}

async function main() {
  const [wat = 'een', naam = 'wagen-zw', soort = 'lineart'] = process.argv.slice(2);
  fs.mkdirSync(UIT, { recursive: true });
  // De werkstroom om in ComfyUI te importeren (Workflow → Open, de API-vorm), met de startinstellingen.
  fs.writeFileSync(path.join(__dirname, 'werkstroom-sd15.json'), JSON.stringify(werkstroom({ render: 'aardschok-render.png', lijnen: 'aardschok-lijnen.png', stijl: 'heerstoet-doel.webp' }), null, 2));
  if (wat === 'werkstroom') return console.log('gereedschap/ai/werkstroom-sd15.json');
  // MEESTER: een goedgekeurd beeld van dit ding zelf in de gewenste stijl (een PNG, zoals de wagen van ChatGPT in
  // uit/ai/hand/) als stijl voor IP-Adapter, heel, in plaats van de uitsnede van Marcels plaat. DENOISE, CN en IP
  // overschrijven de startinstellingen voor `een`.
  let stijl;
  if (process.env.MEESTER) {
    const m = A.leesPng(fs.readFileSync(process.env.MEESTER));
    UITSNEDE = { x: 0, y: 0, b: m.b, h: m.h };
    stijl = await A.upload('aardschok-meester.png', fs.readFileSync(process.env.MEESTER), 'image/png');
  } else stijl = await A.upload('heerstoet-doel.webp', fs.readFileSync(A.STIJL), 'image/webp');
  const o = { ...START };
  for (const [k, e] of [['denoise', 'DENOISE'], ['cn', 'CN'], ['ip', 'IP']]) if (process.env[e]) o[k] = Number(process.env[e]);
  if (wat === 'een') {
    await eenBeeld(naam, o, soort, stijl, process.env.MEESTER ? 'meester' : 'plaat');
    return;
  }
  // Een reeks beelden van één ding (de loopbeelden) met dezelfde instellingen: is het in elk beeld hetzelfde ding? Een plaat
  // (per beeld de sprite en de pixels) en de pixels bewegend, op hun plek in de cel, naast ons eigen lopen.
  if (wat === 'reeks') {
    const namen = naam.split(',');
    const rij = [];
    const cellen = [];
    const onze = [];
    for (const n of namen) {
      const r = await eenBeeld(n, o, soort, stijl, process.env.MEESTER ? 'meester' : 'plaat');
      rij.push([A.verklein(r.sprite, W / 2, H / 2), A.vergroot(r.pixels, 2)]);
      const st = stukVan(n);
      const cel = A.leeg(st.plaat.b, st.plaat.h);
      A.plakOp(cel, r.pixels, st.k.x0, st.k.y0);
      cellen.push(cel);
      onze.push({ b: st.plaat.b, h: st.plaat.h, rgba: st.plaat.rgba(null) });
    }
    const tag = `${soort}-${process.env.MEESTER ? 'meester' : 'plaat'}-d${o.denoise.toFixed(2)}-ip${o.ip.toFixed(2)}`;
    fs.writeFileSync(path.join(UIT, `reeks-${tag}.png`), K.pngVanBeeld(naastElkaar(rij)));
    const { apng } = require('../pixelart/apng.cjs');
    const alsPlaat = (r) => ({ b: r.b, h: r.h, rgba: () => r.rgba });
    const fps = require('../pixelart/vee.cjs').LOOP_FPS.os / 2;
    fs.writeFileSync(path.join(UIT, `reeks-${tag}-lopen.png`), apng(cellen.map(alsPlaat), { fps, schaal: 2 }));
    fs.writeFileSync(path.join(UIT, `reeks-${tag}-lopen-onze.png`), apng(onze.map(alsPlaat), { fps, schaal: 2 }));
    console.log(`Reeks: uit/ai/sd15/reeks-${tag}.png, en bewegend -lopen.png (naast -lopen-onze.png)`);
    return;
  }
  if (wat === 'matrix') {
    const rijen = [];
    let eerste = null;
    for (const d of [0.3, 0.4, 0.5]) {
      const rij = [];
      for (const cn of [0.75, 1.0]) {
        const r = await eenBeeld(naam, { ...START, denoise: d, cn }, soort, stijl);
        if (!eerste) eerste = r;
        rij.push(A.verklein(r.sprite, W / 2, H / 2), A.vergroot(r.pixels, 2));
      }
      rijen.push(rij);
    }
    rijen.unshift([A.verklein(eerste.render, W / 2, H / 2), A.verklein(eerste.lijnen, W / 2, H / 2)]);
    const plaat = path.join(UIT, `${naam}-${soort}-matrix.png`);
    fs.writeFileSync(plaat, K.pngVanBeeld(naastElkaar(rijen)));
    console.log(`Matrix: ${path.relative(process.cwd(), plaat)} (bovenaan onze render en de lijnen; daarna per rij denoise 0,30, 0,40, 0,50; per rij ControlNet 0,75 en dan 1,00, elk de sprite en de pixels)`);
    return;
  }
  console.log('node gereedschap/ai/sd15.cjs een | matrix | werkstroom [naam] [lineart|softedge]');
}

if (require.main === module) main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

module.exports = { werkstroom, stukVan, vlakVan, lijnenOpDoek, renderOpDoek, START, MODELLEN };
