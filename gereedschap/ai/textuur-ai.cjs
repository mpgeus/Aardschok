// Materiaaltexturen met SDXL (werklijst vraag 180, de proef met het wiel; gereedschap/ai/hybride-voorstel.md, stap C2):
// een textuur uit een tekstopdracht in ComfyUI (lokaal, 127.0.0.1:8188), naadloos gemaakt, verkleind, en als PNG in
// gereedschap/pixelart/texturen/, waar textuur.cjs hem laadt. De afspraak (textuur.cjs): de nerf, de strepen, lopen
// horizontaal. Vlak licht, geen schaduw: het licht doet onze renderer.
//
//   node gereedschap/ai/textuur-ai.cjs [naam...]     hout, ijzer (zonder naam: allebei)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const A = require('./beeld-ai.cjs');
const D = require('./doek.cjs').maak(1024, 1024);

const MAP = path.join(__dirname, '..', 'pixelart', 'texturen');
const MAAT = 512; // zo groot komt de textuur in de opslag
const OPNIEUW = process.argv.includes('--opnieuw');
// Een eerste ronde (18 okt) met "hand-painted ... game texture" gaf versierde texturen: gesneden tekens in het hout,
// bloemen in het ijzer. Een foto-achtige opname van het echte materiaal werkt beter: de pixel art maakt onze renderer.
const GEMEEN = 'seamless tileable texture, fills the whole frame edge to edge, high resolution macro photograph of the material ' +
  'surface, flat even diffuse lighting, no shadows, orthographic top-down scan';
const TEXTUREN = {
  hout: {
    tekst: `${GEMEEN}, aged oak wood surface, long straight natural wood grain running horizontally from left to right, fine grain lines, subtle growth rings, a few tiny knots, warm medium brown with honey and dark brown tones, worn matte finish`,
    seed: 1811,
  },
  ijzer: {
    tekst: `${GEMEEN}, dark hand-forged wrought iron surface, small hammer dimples, fine horizontal forging streaks, subtle dark scale, a little brown rust in places, matte blue-grey metal`,
    seed: 1812,
  },
  // De HD-proef (Marcels vierde opdracht, `opdracht-comfyui.md`; `hd-wielproef.md`): hout met slijtage, en gesmeed ijzer
  // met hamerslagen, zodat ook het reliëf (de hoogte uit de helderheid, textuur.cjs) iets te vangen heeft.
  'hout-versleten': {
    tekst: `${GEMEEN}, weathered old oak planks from a farm cart, pronounced natural wood grain running horizontally from left to right, worn and scuffed surface, small dents and scratches, fine cracks along the grain, dark grime settled in the grain lines, lighter sun-bleached worn patches, warm reddish brown and honey tones`,
    seed: 1821,
  },
  // Grover: versleten hout gaf een fijne nerf die op de maat van het spel wegvalt (18 okt); hier brede strepen, knoesten en
  // scheuren, iets wat ook op één pixel per eenheid nog leesbaar is.
  'hout-grof': {
    tekst: `${GEMEEN}, rough weathered oak beam, coarse wide wood grain running horizontally from left to right, bold dark grain streaks, a few large knots, deep drying cracks along the grain, worn and dented surface, dark grime in the cracks, warm brown and honey tones with lighter worn areas`,
    seed: 1823,
  },
  'ijzer-gesmeed': {
    tekst: `${GEMEEN}, blacksmith hand-forged iron strap, hammered surface with many small hammer facets and dents, horizontal forging direction, dark charcoal grey metal with a faint blue sheen, brighter polished worn spots, fine scratches, a few small spots of brown rust`,
    seed: 1822,
  },
};
const NEGATIEF = 'ornament, decoration, pattern, symbols, glyphs, carving, flowers, tiles, bricks, planks with gaps, nails, rivets, ' +
  'object, perspective, horizon, frame, border, vignette, text, watermark, signature, shadow, cartoon, drawing';

function werkstroom(tekst, seed) {
  return {
    1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'sd_xl_base_1.0.safetensors' } },
    2: { class_type: 'EmptyLatentImage', inputs: { width: 1024, height: 1024, batch_size: 1 } },
    3: { class_type: 'CLIPTextEncode', inputs: { text: tekst, clip: ['1', 1] } },
    4: { class_type: 'CLIPTextEncode', inputs: { text: NEGATIEF, clip: ['1', 1] } },
    5: { class_type: 'KSampler', inputs: { model: ['1', 0], positive: ['3', 0], negative: ['4', 0], latent_image: ['2', 0], seed, steps: 32, cfg: 6, sampler_name: 'dpmpp_2m', scheduler: 'karras', denoise: 1 } },
    6: { class_type: 'VAEDecode', inputs: { samples: ['5', 0], vae: ['1', 2] } },
    7: { class_type: 'SaveImage', inputs: { images: ['6', 0], filename_prefix: 'aardschok-textuur' } },
  };
}

// Naadloos, per as apart: langs x het beeld gemengd met een kopie die een halve breedte verschoven is (aan de randen alleen
// de kopie, waarvan de randen uit het midden van het origineel komen en dus op elkaar aansluiten; in het midden alleen het
// origineel, precies waar de kopie zijn eigen naad heeft), daarna hetzelfde langs y. (Een eerste versie mengde beide assen
// tegelijk naar de afstand tot de rand; dan bleef de naad van de kopie half zichtbaar.)
function naadloos(beeld) {
  const meng = (bron, langsX) => {
    const { b, h, rgba } = bron;
    const uit = A.leeg(b, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const w = langsX ? 1 - Math.abs((2 * x) / (b - 1) - 1) : 1 - Math.abs((2 * y) / (h - 1) - 1);
      const i = (y * b + x) * 4;
      const j = langsX ? (y * b + ((x + b / 2) % b)) * 4 : ((((y + h / 2) % h) * b) + x) * 4;
      for (let c = 0; c < 3; c++) uit.rgba[i + c] = Math.round(rgba[i + c] * w + rgba[j + c] * (1 - w));
      uit.rgba[i + 3] = 255;
    }
    return uit;
  };
  return meng(meng(beeld, true), false);
}

// De nerf horizontaal (de afspraak in textuur.cjs): lopen de lijnen verticaal (de helderheid verandert langs x meer dan
// langs y), dan een kwartslag draaien. Geeft het beeld en of het gedraaid is.
function nerfHorizontaal(beeld) {
  const { b, h, rgba } = beeld;
  const L = (x, y) => { const i = (y * b + x) * 4; return 0.3 * rgba[i] + 0.59 * rgba[i + 1] + 0.11 * rgba[i + 2]; };
  let dx = 0, dy = 0;
  for (let y = 0; y + 1 < h; y += 2) for (let x = 0; x + 1 < b; x += 2) {
    dx += Math.abs(L(x + 1, y) - L(x, y));
    dy += Math.abs(L(x, y + 1) - L(x, y));
  }
  if (dx <= dy * 1.15) return { beeld, gedraaid: false };
  const uit = A.leeg(h, b);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) rgba.copy(uit.rgba, (x * h + (h - 1 - y)) * 4, (y * b + x) * 4, (y * b + x) * 4 + 4);
  return { beeld: uit, gedraaid: true };
}

// Twee bij twee naast elkaar: of de naden echt weg zijn.
function tegels(beeld) {
  const uit = A.leeg(beeld.b * 2, beeld.h * 2);
  for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++) A.plakOp(uit, beeld, tx * beeld.b, ty * beeld.h);
  return uit;
}

async function main() {
  const namen = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!namen.length) namen.push(...Object.keys(TEXTUREN));
  fs.mkdirSync(MAP, { recursive: true });
  for (const naam of namen) {
    const t = TEXTUREN[naam];
    if (!t) throw new Error(`Geen textuur ${naam} (wel: ${Object.keys(TEXTUREN).join(', ')}).`);
    const t0 = Date.now();
    // --opnieuw: het ruwe beeld van de vorige keer opnieuw verwerken, zonder SDXL.
    const ruwPad = path.join(A.UIT, `textuur-${naam}-ruw.png`);
    const png = OPNIEUW && fs.existsSync(ruwPad) ? fs.readFileSync(ruwPad) : await D.voerUit(werkstroom(t.tekst, t.seed));
    const { beeld: recht, gedraaid } = nerfHorizontaal(A.leesPng(png));
    const klein = A.verklein(naadloos(recht), MAAT, MAAT);
    for (let i = 0; i < MAAT * MAAT; i++) klein.rgba[i * 4 + 3] = 255;
    fs.writeFileSync(path.join(MAP, `${naam}.png`), K.pngVanBeeld(klein));
    fs.writeFileSync(path.join(A.UIT, `textuur-${naam}-ruw.png`), png);
    fs.writeFileSync(path.join(A.UIT, `textuur-${naam}-tegels.png`), K.pngVanBeeld(tegels(klein)));
    fs.writeFileSync(path.join(MAP, `${naam}.json`), JSON.stringify({ naam, model: 'sd_xl_base_1.0.safetensors', seed: t.seed, positief: t.tekst, negatief: NEGATIEF, maat: MAAT, naadloos: 'per as een half verschoven kopie, gemengd naar het midden', gedraaid, seconden: Math.round((Date.now() - t0) / 1000) }, null, 2));
    console.log(`${naam}: ${Math.round((Date.now() - t0) / 1000)} s${gedraaid ? ', een kwartslag gedraaid (de nerf liep verticaal)' : ''}, gereedschap/pixelart/texturen/${naam}.png (en uit/ai/textuur-${naam}-tegels.png)`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
