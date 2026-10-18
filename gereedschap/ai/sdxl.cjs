// De SDXL-werkstroom (gereedschap/ai/opdracht-comfyui.md, "Vervolg"; werklijst vraag 180; Marcel, 18 okt: "Maak een
// aparte SDXL-workflow. Behoud de huidige SD 1.5-workflow volledig."). Zoals sd15.cjs, met wat ze delen uit doek.cjs,
// maar op 1024 × 768, met SDXL 1.0, ControlNet union (type lineart, onze eigen lijnen), en als stijl via IP-Adapter Plus
// SDXL de goedgekeurde sprite van de os en de wagen (de wagen die ChatGPT maakte, uit/ai/hand/). Startinstellingen binnen
// de opdracht: 32 stappen, CFG 5,5, denoise 0,50, vaste seed.
//
// Op de GTX 1080 Ti getoetst (18 okt): ComfyUI v0.41.0 met PyTorch cu126 (de versie voor de 10-serie), SDXL in fp16 met de
// VAE in fp32, ControlNet union promax, IP-Adapter Plus SDXL met CLIP ViT-H: alles laadt in 11 GB, zo'n minuut per beeld.
//
//   node gereedschap/ai/sdxl.cjs een [naam]      één beeld (DENOISE, CN, IP, MEESTER in de omgeving overschrijven)
//   node gereedschap/ai/sdxl.cjs vergelijk [naam] SD 1.5 en SDXL naast elkaar, met het detail en de vorm gemeten
//   node gereedschap/ai/sdxl.cjs werkstroom       alleen gereedschap/ai/werkstroom-sdxl.json schrijven
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const A = require('./beeld-ai.cjs');
const E = require('./etiket.cjs');
const { MAGENTA } = require('./doek.cjs');

const W = 1024;
const H = 768;
const D = require('./doek.cjs').maak(W, H);
const UIT = path.join(A.UIT, 'sdxl');
const MEESTER = process.env.MEESTER || path.join(A.UIT, 'hand', 'wagen-zw.png.png');
const MODELLEN = {
  checkpoint: 'sd_xl_base_1.0.safetensors',
  controlnet: 'controlnet-union-sdxl-promax.safetensors',
  ipadapter: 'ip-adapter-plus_sdxl_vit-h.safetensors',
  clipVision: 'CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors',
};
const START = { steps: 32, cfg: 5.5, sampler: 'dpmpp_2m', scheduler: 'karras', denoise: 0.5, cn: 0.85, cnStart: 0, cnEnd: 1, ip: 0.9, ipSoort: 'style transfer', seed: 180 };
const POSITIEF = 'highly detailed isometric HD pixel art sprite, medieval strategy game, a white ox with realistic anatomy and ' +
  'muscles in a leather harness with brass fittings, pulling a red painted two-wheeled wooden cart with gold trim and golden ' +
  'heraldic lions, rich wood grain, iron fittings with metal reflections, sacks of grain, barrel, logs, open chest of gold ' +
  'coins, strong light and shadow contrast, warm light from the top left, dark outlines';
const NEGATIEF = 'blurry, photo, 3d render, smooth plastic, text, watermark, signature, ground, grass, shadow on the ground, ' +
  'extra objects, extra animals, extra wheels, cropped, frame, border';
const komma = (x) => x.toFixed(2).replace('.', ',');

function werkstroom(beelden, o = START) {
  return {
    1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: MODELLEN.checkpoint }, _meta: { title: 'Load Checkpoint (SDXL)' } },
    3: { class_type: 'LoadImage', inputs: { image: beelden.render }, _meta: { title: 'Load Image: ruwe 3D-render (1024 x 768, #FF00FF)' } },
    4: { class_type: 'VAEEncode', inputs: { pixels: ['3', 0], vae: ['1', 2] }, _meta: { title: 'VAE Encode' } },
    5: { class_type: 'LoadImage', inputs: { image: beelden.stijl }, _meta: { title: 'Load Image: goedgekeurde sprite (stijl)' } },
    7: { class_type: 'IPAdapterModelLoader', inputs: { ipadapter_file: MODELLEN.ipadapter }, _meta: { title: 'IP-Adapter Plus SDXL' } },
    8: { class_type: 'CLIPVisionLoader', inputs: { clip_name: MODELLEN.clipVision }, _meta: { title: 'CLIP Vision ViT-H' } },
    9: { class_type: 'IPAdapterAdvanced', inputs: { model: ['1', 0], ipadapter: ['7', 0], image: ['5', 0], clip_vision: ['8', 0], weight: o.ip, weight_type: o.ipSoort, combine_embeds: 'concat', start_at: 0, end_at: 1, embeds_scaling: 'V only' }, _meta: { title: 'IP-Adapter (stijl)' } },
    10: { class_type: 'LoadImage', inputs: { image: beelden.lijnen }, _meta: { title: 'Load Image: lijnen uit ons 3D-model' } },
    11: { class_type: 'ControlNetLoader', inputs: { control_net_name: MODELLEN.controlnet }, _meta: { title: 'Load ControlNet (union)' } },
    19: { class_type: 'SetUnionControlNetType', inputs: { control_net: ['11', 0], type: 'canny/lineart/anime_lineart/mlsd' }, _meta: { title: 'Union: lineart' } },
    12: { class_type: 'CLIPTextEncode', inputs: { text: POSITIEF, clip: ['1', 1] }, _meta: { title: 'Positief' } },
    13: { class_type: 'CLIPTextEncode', inputs: { text: NEGATIEF, clip: ['1', 1] }, _meta: { title: 'Negatief' } },
    14: { class_type: 'ControlNetApplyAdvanced', inputs: { positive: ['12', 0], negative: ['13', 0], control_net: ['19', 0], image: ['10', 0], strength: o.cn, start_percent: o.cnStart, end_percent: o.cnEnd, vae: ['1', 2] }, _meta: { title: 'Apply ControlNet' } },
    15: { class_type: 'KSampler', inputs: { model: ['9', 0], positive: ['14', 0], negative: ['14', 1], latent_image: ['4', 0], seed: o.seed, steps: o.steps, cfg: o.cfg, sampler_name: o.sampler, scheduler: o.scheduler, denoise: o.denoise }, _meta: { title: 'KSampler' } },
    16: { class_type: 'VAEDecode', inputs: { samples: ['15', 0], vae: ['1', 2] }, _meta: { title: 'VAE Decode' } },
    17: { class_type: 'SaveImage', inputs: { images: ['16', 0], filename_prefix: 'aardschok-sdxl' }, _meta: { title: 'Save Image' } },
  };
}

async function eenBeeld(naam, o, stijlNaam) {
  const st = D.stukVan(naam);
  const V = D.vlakVan(st.k);
  const { doek, masker } = D.renderOpDoek(st, V);
  const lijnen = D.lijnenOpDoek(st, V);
  const soort = o.ipSoort === START.ipSoort ? '' : `-${o.ipSoort.replace(/ /g, '')}`;
  const tag = `lineart-meester-d${o.denoise.toFixed(2)}-c${o.cn.toFixed(2)}-ip${o.ip.toFixed(2)}${soort}-s${o.seed}`;
  const map = path.join(UIT, naam, tag);
  fs.mkdirSync(map, { recursive: true });
  const renderPng = K.pngVanBeeld(doek);
  const lijnenPng = K.pngVanBeeld(lijnen);
  fs.writeFileSync(path.join(map, 'render.png'), renderPng);
  fs.writeFileSync(path.join(map, 'lijnen.png'), lijnenPng);
  const stroom = werkstroom({
    render: await A.upload(`aardschok-xl-${naam}-render.png`, renderPng, 'image/png'),
    lijnen: await A.upload(`aardschok-xl-${naam}-lijnen.png`, lijnenPng, 'image/png'),
    stijl: stijlNaam,
  }, o);
  fs.writeFileSync(path.join(map, 'werkstroom.json'), JSON.stringify(stroom, null, 2));
  const t0 = Date.now();
  const aiPng = await D.voerUit(stroom);
  const tijd = (Date.now() - t0) / 1000;
  fs.writeFileSync(path.join(map, 'ai.png'), aiPng);
  const v = D.verwerk(aiPng, st, V, masker);
  fs.writeFileSync(path.join(map, 'sprite.png'), K.pngVanBeeld(v.sprite));
  fs.writeFileSync(path.join(map, 'pixels.png'), K.pngVanBeeld(v.pixels));
  const onze = { b: st.plaat.b, h: st.plaat.h, rgba: st.plaat.rgba(null) };
  const half = (x) => A.verklein(x, W / 2, H / 2);
  const c = v.controle;
  E.bewaar(path.join(map, 'vergelijking.png'), [[E.met(half(doek), 'onze render'), E.met(half(lijnen), 'onze lijnen'), E.met(half(v.sprite), 'SDXL'), E.met(A.vergroot(onze, 2), 'onze render, maat van het spel'), E.met(A.vergroot(v.pixels, 2), 'SDXL, maat van het spel')]],
    `SDXL 1.0 · ${naam} · stijl: goedgekeurde sprite (ChatGPT) · denoise ${komma(o.denoise)} · ControlNet ${komma(o.cn)} · IP ${komma(o.ip)} (${o.ipSoort})`,
    `${tijd.toFixed(0)} s · overlap met ons silhouet ${c.silhouet.overlap}% · achtergrond ${c.achtergrondExact ? 'exact #FF00FF' : 'NIET exact'}`);
  fs.writeFileSync(path.join(map, 'instellingen.json'), JSON.stringify({ naam, tag, stijlbron: MEESTER, modellen: MODELLEN, instellingen: o, resolutie: `${W}×${H}`, positief: POSITIEF, negatief: NEGATIEF, seconden: +tijd.toFixed(1), controle: c, wanneer: new Date().toISOString() }, null, 2));
  console.log(`${naam} ${tag}: ${tijd.toFixed(0)} s, overlap ${c.silhouet.overlap}%, gaten ${c.silhouet.gatenBinnen}%, erbuiten ${c.silhouet.getekendErbuiten}%, doek ${c.doekGoed ? 'goed' : c.doek}, achtergrond ${c.achtergrondExact ? 'exact' : 'NIET exact'}`);
  return { map, tag };
}

// ---------------------------------------------------------------- de vergelijking met SD 1.5

// Hoeveel detail: het gemiddelde verschil in helderheid tussen buren, binnen het ding (niet op de achtergrond). Op
// dezelfde maat gemeten (de sprite verkleind tot 512 × 384, en de pixels in de maat van het spel), zodat de 768 × 576 van
// SD 1.5 en de 1024 × 768 van SDXL eerlijk naast elkaar staan.
function detail(beeld) {
  const { b, h, rgba } = beeld;
  const L = (i) => 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
  const ding = (i) => rgba[i * 4 + 3] >= 128 && !(rgba[i * 4] === MAGENTA[0] && rgba[i * 4 + 1] === MAGENTA[1] && rgba[i * 4 + 2] === MAGENTA[2]);
  let som = 0, n = 0;
  for (let y = 0; y + 1 < h; y++) for (let x = 0; x + 1 < b; x++) {
    const i = y * b + x;
    if (!ding(i) || !ding(i + 1) || !ding(i + b)) continue;
    som += Math.abs(L(i + 1) - L(i)) + Math.abs(L(i + b) - L(i));
    n++;
  }
  return +(som / Math.max(1, n)).toFixed(1);
}

function vergelijk(naam) {
  const sd = path.join(A.UIT, 'sd15', naam);
  const kies = (map, ...tags) => tags.map((t) => path.join(map, t)).find((p) => fs.existsSync(path.join(p, 'sprite.png')));
  const varianten = [
    { titel: 'SD 1.5 · stijl: plaat · d 0,40', map: kies(sd, 'lineart-plaat-d0.40-c0.85-ip0.65-s180', 'lineart-d0.40-c0.85-s180') },
    { titel: 'SD 1.5 · meesterbeeld · d 0,60', map: kies(sd, 'lineart-meester-d0.60-c0.85-ip1.00-s180') },
  ].filter((v) => v.map);
  // Elke SDXL-poging van dit ding, op volgorde van denoise.
  const xl = path.join(UIT, naam);
  for (const tag of (fs.existsSync(xl) ? fs.readdirSync(xl) : []).sort()) {
    const p = path.join(xl, tag);
    if (!fs.existsSync(path.join(p, 'instellingen.json'))) continue;
    const i = JSON.parse(fs.readFileSync(path.join(p, 'instellingen.json'), 'utf8')).instellingen;
    varianten.push({ titel: `SDXL · ${i.ipSoort} ${komma(i.ip)} · d ${komma(i.denoise)}`, map: p });
  }
  const lees = (map, f) => A.leesPng(fs.readFileSync(path.join(map, f)));
  const st = D.stukVan(naam);
  const onze = { b: st.plaat.b, h: st.plaat.h, rgba: st.plaat.rgba(null) };
  const eersteRender = A.verklein(lees(varianten[0].map, 'render.png'), 512, 384);
  const metingen = [];
  const rij1 = [E.met(eersteRender, 'onze render')];
  const rij2 = [E.met(A.vergroot(onze, 2), 'onze render, maat van het spel')];
  for (const v of varianten) {
    const sprite = A.verklein(lees(v.map, 'sprite.png'), 512, 384);
    const pixels = lees(v.map, 'pixels.png');
    const ctl = JSON.parse(fs.readFileSync(path.join(v.map, 'instellingen.json'), 'utf8'));
    const m = { variant: v.titel, detailSprite: detail(sprite), detailSpel: detail(pixels), overlap: ctl.controle.silhouet.overlap, seconden: ctl.seconden };
    metingen.push(m);
    rij1.push(E.met(sprite, `${v.titel} · detail ${String(m.detailSprite).replace('.', ',')} · vorm ${String(m.overlap).replace('.', ',')}%`));
    rij2.push(E.met(A.vergroot(pixels, 2), `${v.titel.split(' · ')[0]}, maat van het spel · detail ${String(m.detailSpel).replace('.', ',')}`));
  }
  metingen.unshift({ variant: 'onze render', detailSprite: detail(eersteRender), detailSpel: detail(onze) });
  rij1[0].etiket = `onze render · detail ${String(metingen[0].detailSprite).replace('.', ',')}`;
  const pad = path.join(UIT, `${naam}-vergelijking.png`);
  E.bewaar(pad, [rij1, rij2], `SD 1.5 tegen SDXL · ${naam}`, 'Detail: het gemiddelde verschil in helderheid tussen buren, binnen het ding (hoger is meer detail). Vorm: overlap met ons silhouet.');
  fs.writeFileSync(path.join(UIT, `${naam}-vergelijking.json`), JSON.stringify(metingen, null, 2));
  for (const m of metingen) console.log(`${m.variant}: detail ${m.detailSprite} (sprite), ${m.detailSpel} (maat van het spel)${m.overlap != null ? `, vorm ${m.overlap}%, ${m.seconden} s` : ''}`);
  console.log(`Plaat: ${path.relative(process.cwd(), pad)}`);
}

async function main() {
  const [wat = 'een', naam = 'wagen-zw'] = process.argv.slice(2);
  fs.mkdirSync(UIT, { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'werkstroom-sdxl.json'), JSON.stringify(werkstroom({ render: 'aardschok-render.png', lijnen: 'aardschok-lijnen.png', stijl: 'aardschok-meester.png' }), null, 2));
  if (wat === 'werkstroom') return console.log('gereedschap/ai/werkstroom-sdxl.json');
  if (wat === 'vergelijk') return vergelijk(naam);
  const o = { ...START };
  for (const [k, e] of [['denoise', 'DENOISE'], ['cn', 'CN'], ['ip', 'IP']]) if (process.env[e]) o[k] = Number(process.env[e]);
  if (process.env.IPSOORT) o.ipSoort = process.env.IPSOORT; // 'style transfer', 'strong style transfer', 'linear', ...
  const stijl = await A.upload('aardschok-meester.png', fs.readFileSync(MEESTER), 'image/png');
  if (wat === 'een') {
    await eenBeeld(naam, o, stijl);
    return;
  }
  console.log('node gereedschap/ai/sdxl.cjs een | vergelijk | werkstroom [naam]');
}

if (require.main === module) main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

module.exports = { werkstroom, START, MODELLEN };
