// Ronde 14 (Marcel, 29 okt: "HYBRIDE 3D + AI SPRITE PIPELINE"; "Gebruik per experiment vaste parameters"; "Gebruik
// dezelfde instellingen voor pose A en pose B"): de proeven T1 (SDXL img2img), T2 (met ControlNet union: eerst alleen
// diepte, dan ook onze lijnen) en T3 (daarbovenop IP-Adapter Plus met de ChatGPT-speerman als stijl), elk op de twee
// contactstanden met dezelfde seed. De werkstroom is die van afwerking.cjs (img2img alleen binnen ons silhouet); de
// invoer komt van gereedschap/blender/humgen/loop14.py voor, het antwoord gaat terug met loop14.py na.
// Per proef en stand: het beeld, en in parameters.json de instellingen, de werkstroom, de tijd en het geheugen.
//
//   node gereedschap/ai/loop14.cjs <proef> ...      (de proeven uit PROEVEN; zonder: allemaal)
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./beeld-ai.cjs');
const AF = require('./afwerking.cjs');

const WORTEL = path.join(__dirname, '..', '..');
const AI = path.join(WORTEL, 'gereedschap', 'pixelart', 'uit', 'basismens', 'humgen14', 'ai');
// het ontwerp van de speerman (Marcel: "Matte grijsstalen kettle hat ... Eén rechte houten speer met één bladvormige
// ijzeren speerpunt"); geen baard: onze man heeft stoppels, en de AI mag het gezicht niet veranderen
const POSITIEF = 'hand-painted medieval spearman game character walking, matte grey steel kettle hat with a wide brim and a raised ridge, ' +
  'compact grey chainmail coif, quilted brown padded gambeson with quilted brown sleeves, quartered blue and yellow tabard, ' +
  'brown leather belt with a pouch, brown leather gloves, sturdy brown leather boots, one straight wooden spear with one ' +
  'leaf-shaped iron spearhead held in both hands, worn matte materials, distressed fabric, rich material texture, warm light ' +
  'from the top left, soft painterly shading, high detail';
const NEGATIEF = 'photo, blurry, plastic, glossy, chrome, neon, extra limbs, extra legs, extra fingers, extra weapon, second spear, ' +
  'shield, sword, deformed hands, deformed face, beard, text, watermark, signature, background objects, ground, shadow on the ground, frame, border';
const BASIS = { steps: 30, cfg: 5.5, sampler: 'dpmpp_2m', scheduler: 'karras', seed: 180, lijn: 0, diepte: 0, cnEind: 0.85, ip: 0, ipSoort: 'style transfer' };
const PROEVEN = {
  T1a: { ...BASIS, denoise: 0.35 },
  T1b: { ...BASIS, denoise: 0.55 },
  T2a: { ...BASIS, denoise: 0.55, diepte: 0.6 },
  T2b: { ...BASIS, denoise: 0.55, diepte: 0.6, lijn: 0.5 },
  T3a: { ...BASIS, denoise: 0.55, diepte: 0.6, lijn: 0.5, ip: 0.6 },
  T3b: { ...BASIS, denoise: 0.7, diepte: 0.6, lijn: 0.5, ip: 0.6 },
  // T4: beide standen in één beeld van 1024 (loop14.py samen), zodat het model ze samen ziet; de instellingen van T2a en T3b
  T4a: { ...BASIS, denoise: 0.55, diepte: 0.6, samen: true },
  T4b: { ...BASIS, denoise: 0.7, diepte: 0.6, lijn: 0.5, ip: 0.6, samen: true },
};
const SAMEN = 'character sheet, the same spearman twice side by side in two walking poses, identical outfit in both, ';

async function main() {
  const D = require('./doek.cjs').maak(832, 1216);
  const maat = process.env.MAAT || '832x1216';
  const welke = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROEVEN);
  for (const naam of welke) {
    const o = { ...AF.START, ...PROEVEN[naam] };
    const map = path.join(AI, maat === '832x1216' ? naam : `${naam}-${maat}`);
    fs.mkdirSync(map, { recursive: true });
    const positief = o.samen ? SAMEN + POSITIEF : POSITIEF;
    const verslag = { proef: naam, maat: o.samen ? 'samen 1024x1024' : maat, instellingen: o, positief, negatief: NEGATIEF, standen: {} };
    for (const p of o.samen ? ['samen'] : ['A', 'B']) {
      const bron = o.samen ? path.join(AI, 'samen') : path.join(AI, maat, p);
      const namen = { positief, negatief: NEGATIEF };
      for (const k of ['init', 'masker', 'lijnen', 'diepte', 'stijl']) {
        namen[k] = await A.upload(`aardschok-r14-${o.samen ? 'samen' : maat}-${p}-${k}.png`, fs.readFileSync(path.join(bron, `${k}.png`)), 'image/png');
      }
      const stroom = AF.werkstroom(namen, o);
      const t0 = Date.now();
      const png = await D.voerUit(stroom);
      const seconden = (Date.now() - t0) / 1000;
      const stats = await (await A.comfy('system_stats')).json();
      fs.writeFileSync(path.join(map, `${p}.png`), png);
      const gpu = (stats.devices || [])[0] || {};
      verslag.standen[p] = { seconden, vram_vrij_mb: Math.round((gpu.vram_free || 0) / 2 ** 20), vram_totaal_mb: Math.round((gpu.vram_total || 0) / 2 ** 20) };
      if (p === 'A' || p === 'samen') verslag.werkstroom = stroom;
      console.log('PROEF', naam, p, seconden.toFixed(1), 's');
    }
    fs.writeFileSync(path.join(map, 'parameters.json'), JSON.stringify(verslag, null, 1));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
