// Ronde 8, experiment C (Marcel, 29 okt: "onderzoeken of lokale AI de hoogwaardige schilderachtige afwerking van de
// oorspronkelijke speerman beter kan reproduceren"; "De AI mag uitsluitend de visuele afwerking verbeteren"). De
// werkstroom van afwerking.cjs (SDXL img2img alleen binnen ons silhouet, ControlNet union met onze lijnen en onze diepte,
// IP-Adapter Plus met een stijlbeeld), hier op de soldaat: de invoer komt van gereedschap/blender/basismens/ronde8.py voor
// (init, masker, lijnen, diepte, stijl: de ChatGPT-speerman), het antwoord gaat terug met ronde8.py na (de alfa van onze
// render). Een vaste seed; per denoise het beeld, de instellingen, de werkstroom en de tijd naast elkaar.
//
//   node gereedschap/ai/soldaat-ai.cjs <map met de invoer> [denoise ...]
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./beeld-ai.cjs');
const AF = require('./afwerking.cjs');
const D = require('./doek.cjs').maak(832, 1216);

const INSTELLINGEN = {
  steps: 30, cfg: 5.5, sampler: 'dpmpp_2m', scheduler: 'karras', seed: 180,
  lijn: 0.6, diepte: 0.5, cnEind: 0.8, ip: 0.7, ipSoort: 'style transfer',
};
const POSITIEF = 'hand-painted medieval spearman game character, steel kettle hat with rivets, light grey chainmail coif ' +
  'over the shoulders, quilted brown gambeson sleeves, quartered blue and yellow tabard, brown leather belt, pouch, leather ' +
  'gloves and boots, wooden spear, worn scratched matte steel, distressed fabric with subtle wear, rich material texture, ' +
  'warm light from the top left, soft painterly shading, high detail';
const NEGATIEF = 'photo, blurry, plastic, glossy, chrome, extra limbs, extra fingers, extra weapon, second spear, deformed hands, ' +
  'deformed face, text, watermark, signature, background objects, ground, shadow on the ground, frame, border';

async function main() {
  const map = process.argv[2];
  const ruis = process.argv.slice(3).map(Number);
  const namen = { positief: POSITIEF, negatief: NEGATIEF };
  for (const k of ['init', 'masker', 'lijnen', 'diepte', 'stijl']) {
    namen[k] = await A.upload(`aardschok-r8-${path.basename(map)}-${k}.png`, fs.readFileSync(path.join(map, `${k}.png`)), 'image/png');
  }
  for (const denoise of ruis.length ? ruis : [0.15, 0.25, 0.35]) {
    const o = { ...AF.START, ...INSTELLINGEN, denoise };
    const stroom = AF.werkstroom(namen, o);
    const t0 = Date.now();
    const png = await D.voerUit(stroom);
    const seconden = (Date.now() - t0) / 1000;
    const stats = await (await A.comfy('system_stats')).json();
    const dev = stats.devices[0];
    fs.writeFileSync(path.join(map, `ai-${denoise}.png`), png);
    fs.writeFileSync(path.join(map, `ai-${denoise}.json`), JSON.stringify({
      denoise, instellingen: o, modellen: AF.MODELLEN, positief: POSITIEF, negatief: NEGATIEF, doek: '832×1216',
      stijlbron: 'gereedschap/pixelart/bron/soldaten/gpt/met-speer.webp (de ChatGPT-speerman)', seconden,
      comfyui: stats.system.comfyui_version, pytorch: stats.system.pytorch_version, gpu: dev.name,
      vram_vrij_mb: Math.round(dev.vram_free / 2 ** 20), vram_totaal_mb: Math.round(dev.vram_total / 2 ** 20), werkstroom: stroom,
    }, null, 1));
    console.log(`AI ${path.basename(map)} denoise ${denoise}: ${seconden.toFixed(0)} s`);
  }
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
