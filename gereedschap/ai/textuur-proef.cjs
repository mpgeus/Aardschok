// De AI-laag van de methodeproef (vraag 192, gereedschap/blender/stijl/proef/): SDXL schildert alleen binnen ons silhouet over één render per aanzicht, met onze
// diepte en lijnen als ControlNet. Het resultaat gaat terug op het oppervlak (projecteer.py), dus de AI tekent geen animatiebeelden: één oppervlak, voor alle beelden.
// De plaat gaat alleen als stijl mee (IP-Adapter). De werkstroom is die van afwerking.cjs.
//
//   node gereedschap/ai/textuur-proef.cjs <invoermap> <uitmap> <houding> [richtingen=Z,ZW,...] [denoise=0.5] [ckpt=...] [ip=0.5] [seed=192]
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./beeld-ai.cjs');
const AF = require('./afwerking.cjs');

const POSITIEF = 'hand-painted stylized game art, chunky medieval spearman character, painterly game texture, The same design: steel kettle helmet with rivets, tabard quartered royal blue and golden yellow, ' +
  'quilted brown leather gambeson sleeves with diamond stitching, brown leather belt with steel buckle and pouch, leather gloves, leather boots, dark beard, calm friendly expression, small dark eyes. ' +
  'rich material variation, worn leather edges, scratched hammered steel, dyed linen cloth with subtle folds, hand-painted brush strokes, soft warm light from the top left, soft shading, high quality stylized RTS game asset';
const NEGATIEF = 'photo, realistic skin, blurry, plastic, glossy, chrome, neon, extra limbs, extra fingers, extra pouch, extra objects, weapon, text, watermark, signature, background objects, ground, frame, border, deformed face, angry, blue eyes, white eyes, noise, jpeg artifacts';

const SPEER = 'hand-painted stylized game art, long wooden spear, orange-brown ash wood shaft with strong dark red wood grain streaks and warm highlights, hammered steel leaf-shaped spear head with scratches and sharp highlights, steel ferrules, painterly game texture, high quality stylized RTS game asset';

async function main() {
  const [invoer, uit, houding, ...rest] = process.argv.slice(2);
  const o = { ...AF.START, steps: 28, cfg: 5.0, denoise: 0.5, ip: 0.5, ipSoort: 'style transfer', diepte: 0.65, lijn: 0.5, cnEind: 0.9, seed: 192, checkpoint: 'civitai-faetastic\\SDXLFaetastic_v24.safetensors' };
  let richtingen = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',');
  let stijlbron = path.join(__dirname, '..', '..', 'docs', 'art', 'referentie', 'aardschok-speerman-acht.png');
  for (const a of rest) {
    const [k, v] = a.split('=');
    if (k === 'richtingen') richtingen = v.split(',');
    else if (k === 'stijl') stijlbron = v;
    else if (k === 'ckpt') o.checkpoint = v;
    else if (k === 'zin') o.zin = v;
    else o[k] = Number(v);
  }
  fs.mkdirSync(uit, { recursive: true });
  const D = require('./doek.cjs').maak(832, 1216);
  const stijl = await A.upload('aardschok-methode-stijl.png', fs.readFileSync(stijlbron), 'image/png');
  const verslag = { instellingen: o, positief: POSITIEF, negatief: NEGATIEF, beelden: {} };
  for (const r of richtingen) {
    const naam = `${houding}-${r}-00`;
    const n = { positief: o.zin === 'speer' ? SPEER : POSITIEF, negatief: NEGATIEF.replace('weapon, ', ''), stijl };
    for (const k of ['init', 'masker', 'lijnen', 'diepte']) {
      n[k] = await A.upload(`aardschok-methode-${r}-${k}.png`, fs.readFileSync(path.join(invoer, `${naam}-${k}.png`)), 'image/png');
    }
    const t0 = Date.now();
    const png = await D.voerUit(AF.werkstroom(n, o));
    fs.writeFileSync(path.join(uit, `${naam}.png`), png);
    const s = (Date.now() - t0) / 1000;
    const stats = await (await A.comfy('system_stats')).json();
    const gpu = (stats.devices || [])[0] || {};
    verslag.beelden[r] = { seconden: +s.toFixed(1), vram_vrij_mb: Math.round((gpu.vram_free || 0) / 2 ** 20), vram_totaal_mb: Math.round((gpu.vram_total || 0) / 2 ** 20) };
    console.log('AI', r, s.toFixed(1), 's', verslag.beelden[r].vram_vrij_mb, 'MB vrij');
  }
  fs.writeFileSync(path.join(uit, 'verslag.json'), JSON.stringify(verslag, null, 1));
  console.log('KLAAR');
}

main().catch((e) => { console.error(e); process.exit(1); });
