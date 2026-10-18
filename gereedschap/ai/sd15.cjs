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
const A = require('./beeld-ai.cjs');
const E = require('./etiket.cjs');
const komma = (x) => x.toFixed(2).replace('.', ',');

const W = 768;
const H = 576;
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

const D = require('./doek.cjs').maak(W, H);
const { stukVan, vlakVan, opPlaat, renderOpDoek, lijnenOpDoek, voerUit, verwerk, naastElkaar } = D;

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

// ---------------------------------------------------------------- terug, en de controles

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
  const c = v.controle;
  E.bewaar(path.join(map, 'vergelijking.png'), [[E.met(half(doek), 'onze render'), E.met(half(lijnen), 'onze lijnen'), E.met(half(v.sprite), 'SD 1.5'), E.met(A.vergroot(onze, 2), 'onze render, maat van het spel'), E.met(A.vergroot(v.pixels, 2), 'SD 1.5, maat van het spel')]],
    `SD 1.5 (DreamShaper 8) · ${naam} · ${bron === 'meester' ? 'stijl: meesterbeeld (ChatGPT)' : 'stijl: Marcels plaat'} · denoise ${komma(o.denoise)} · ControlNet ${komma(o.cn)} · IP ${komma(o.ip)}`,
    `${tijd.toFixed(0)} s · overlap met ons silhouet ${c.silhouet.overlap}% · achtergrond ${c.achtergrondExact ? 'exact #FF00FF' : 'NIET exact'}`);
  const instellingen = { naam, tag, stijlbron: bron === 'meester' ? process.env.MEESTER : 'ontwerp/voorbeelden/heerstoet-doel.webp', modellen: { ...MODELLEN, controlnet: MODELLEN.controlnet[soort] }, instellingen: o, soort, resolutie: `${W}×${H}`, uitsnede: UITSNEDE, positief: POSITIEF, negatief: NEGATIEF, seconden: +tijd.toFixed(1), controle: v.controle, wanneer: new Date().toISOString() };
  fs.writeFileSync(path.join(map, 'instellingen.json'), JSON.stringify(instellingen, null, 2));
  console.log(`${naam} ${tag}: ${tijd.toFixed(0)} s, overlap ${v.controle.silhouet.overlap}%, gaten ${v.controle.silhouet.gatenBinnen}%, erbuiten ${v.controle.silhouet.getekendErbuiten}%, doek ${v.controle.doekGoed ? 'goed' : v.controle.doek}, achtergrond ${v.controle.achtergrondExact ? 'exact' : 'NIET exact'}`);
  return { ...v, render: doek, lijnen, tag };
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
      rij.push([E.met(A.verklein(r.sprite, W / 2, H / 2), `SD 1.5 · ${n}`), E.met(A.vergroot(r.pixels, 2), 'maat van het spel')]);
      const st = stukVan(n);
      const cel = A.leeg(st.plaat.b, st.plaat.h);
      A.plakOp(cel, r.pixels, st.k.x0, st.k.y0);
      cellen.push(cel);
      onze.push({ b: st.plaat.b, h: st.plaat.h, rgba: st.plaat.rgba(null) });
    }
    const tag = `${soort}-${process.env.MEESTER ? 'meester' : 'plaat'}-d${o.denoise.toFixed(2)}-ip${o.ip.toFixed(2)}`;
    E.bewaar(path.join(UIT, `reeks-${tag}.png`), rij, `SD 1.5 (DreamShaper 8) · loopbeelden · ${process.env.MEESTER ? 'stijl: meesterbeeld (ChatGPT)' : 'stijl: Marcels plaat'} · denoise ${komma(o.denoise)} · IP ${komma(o.ip)}`, 'Per rij een loopbeeld: de sprite, en in de maat van het spel.');
    const { apng } = require('../pixelart/apng.cjs');
    const alsPlaat = (r) => ({ b: r.b, h: r.h, rgba: () => r.rgba });
    const fps = require('../pixelart/vee.cjs').LOOP_FPS.os / 2;
    fs.writeFileSync(path.join(UIT, `reeks-${tag}-lopen.png`), apng(cellen.map(alsPlaat), { fps, schaal: 2 }));
    fs.writeFileSync(path.join(UIT, `reeks-${tag}-lopen-onze.png`), apng(onze.map(alsPlaat), { fps, schaal: 2 }));
    console.log(`Reeks: uit/ai/sd15/reeks-${tag}.png, en bewegend -lopen.png (naast -lopen-onze.png)`);
    return;
  }
  // De platen opnieuw uit wat er al in de mappen staat (zonder de AI), met opschriften: de matrix en de reeks van 18 okt.
  if (wat === 'platen') {
    const lees = (n, tag, f) => A.leesPng(fs.readFileSync(path.join(UIT, n, tag, f)));
    const map = (n, ...tags) => tags.find((t) => fs.existsSync(path.join(UIT, n, t)));
    const rijen = [];
    let kop = null;
    for (const d of [0.3, 0.4, 0.5]) {
      const rij = [];
      for (const cn of [0.75, 1.0]) {
        const tag = map('wagen-zw', `lineart-d${d.toFixed(2)}-c${cn.toFixed(2)}-s180`, `lineart-plaat-d${d.toFixed(2)}-c${cn.toFixed(2)}-ip0.65-s180`);
        if (!tag) continue;
        if (!kop) kop = tag;
        rij.push(E.met(A.verklein(lees('wagen-zw', tag, 'sprite.png'), W / 2, H / 2), `SD 1.5 · denoise ${komma(d)} · ControlNet ${komma(cn)}`), E.met(A.vergroot(lees('wagen-zw', tag, 'pixels.png'), 2), 'maat van het spel'));
      }
      if (rij.length) rijen.push(rij);
    }
    if (kop) {
      rijen.unshift([E.met(A.verklein(lees('wagen-zw', kop, 'render.png'), W / 2, H / 2), 'onze render'), E.met(A.verklein(lees('wagen-zw', kop, 'lijnen.png'), W / 2, H / 2), 'onze lijnen (ControlNet)')]);
      console.log(E.bewaar(path.join(UIT, 'wagen-zw-lineart-matrix.png'), rijen, 'SD 1.5 (DreamShaper 8) · testmatrix · wagen-zw · stijl: Marcels plaat · IP 0,65', 'Per rij een denoise; per rij eerst ControlNet 0,75, dan 1,00, elk de sprite en in de maat van het spel.'));
    }
    const tag = 'lineart-meester-d0.60-c0.85-ip1.00-s180';
    const reeks = ['lopen-zw-0', 'lopen-zw-2', 'lopen-zw-4', 'lopen-zw-6'].filter((n) => fs.existsSync(path.join(UIT, n, tag)))
      .map((n) => [E.met(A.verklein(lees(n, tag, 'sprite.png'), W / 2, H / 2), `SD 1.5 · ${n}`), E.met(A.vergroot(lees(n, tag, 'pixels.png'), 2), 'maat van het spel')]);
    if (reeks.length) console.log(E.bewaar(path.join(UIT, 'reeks-lineart-meester-d0.60-ip1.00.png'), reeks, 'SD 1.5 (DreamShaper 8) · loopbeelden · stijl: meesterbeeld (ChatGPT) · denoise 0,60 · IP 1,00', 'Per rij een loopbeeld: de sprite, en in de maat van het spel.'));
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
        rij.push(E.met(A.verklein(r.sprite, W / 2, H / 2), `SD 1.5 · denoise ${komma(d)} · ControlNet ${komma(cn)}`), E.met(A.vergroot(r.pixels, 2), 'maat van het spel'));
      }
      rijen.push(rij);
    }
    rijen.unshift([E.met(A.verklein(eerste.render, W / 2, H / 2), 'onze render'), E.met(A.verklein(eerste.lijnen, W / 2, H / 2), 'onze lijnen (ControlNet)')]);
    const plaat = path.join(UIT, `${naam}-${soort}-matrix.png`);
    E.bewaar(plaat, rijen, `SD 1.5 (DreamShaper 8) · testmatrix · ${naam} · stijl: Marcels plaat · IP ${komma(o.ip)}`, 'Per rij een denoise; per rij eerst ControlNet 0,75, dan 1,00, elk de sprite en in de maat van het spel.');
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
