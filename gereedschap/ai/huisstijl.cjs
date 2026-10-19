// De huisstijl van de eigen pijplijn (Marcel, 19 okt: "Ik wil dat wij onze eigen art maken met onze eigen pipeline";
// ontwerp/beeld.md, "Onze eigen art, met onze eigen pijplijn"; gereedschap/ai/ai-afwerking.md). Wat één keer vastligt voor
// het hele spel, zodat er per ding niets anders nodig is dan het model in code: het checkpoint, één zin voor de huisstijl,
// één zin per materiaal (de naam van het materiaal in zijn model), en de instellingen. Geen stijlplaat, geen referentie.
//
//   HUISSTIJL                     het checkpoint, de zin, de negatieve zin, de instellingen (afwerking.cjs werkstroom), en
//                                 de pixelart-LoRA (LORA, met zijn woorden)
//   zinVoor(naam, kleur)          de zin voor een materiaal; kleur [r, g, b]: voor een vacht het woord voor zijn kleur
//   groepVoor(naam)               de groep van een materiaal (acht groepen en het wapen), en GROEPZIN de zin per groep: elk
//                                 gebied kost SDXL een eigen rekenslag per stap (14 gebieden: 714 s in plaats van 83)
//   kleurWoord([r, g, b])         een kleur in een woord (cream, brown, black, ...)
'use strict';

const HUISSTIJL = {
  checkpoint: 'civitai-faetastic\\SDXLFaetastic_v24.safetensors',
  zin: 'HD pixel art game sprite, isometric medieval strategy game asset, rich hand-painted detail, warm light from the ' +
    'top left, crisp dark outlines, clean pixel clusters',
  negatief: 'blurry, smooth gradients, photo, 3d render, plastic, deformed, text, watermark, signature, ground, grass, ' +
    'shadow on the ground, background objects, frame, border, bread, loaf, buns, pastry',
  instellingen: { denoise: 0.65, ip: 0, lijn: 0.8, diepte: 0.6, cnEind: 0.85, steps: 32, cfg: 5.5, sampler: 'dpmpp_2m', scheduler: 'karras', seed: 180 },
  // de gekozen weg (Marcel, 19 okt: "Ok, laten we de w5 gebruiken"; ai-afwerking.md, "Rijker schilderwerk"): het rijke begin
  // (stoffen.cjs), de schilderwoorden met cfg 7 (SCHILDER), ons handschrift H3 erover, met plaatselijk contrast 1,0
  pijplijn: { rijk: true, schilder: true, handschrift: 'h3', contrast: 1.0 },
};
// De pixelart-LoRA (Marcel, 19 okt: "LoRA's is ook goed, ik wil het maximale eruit halen met mijn hardware"):
// PixelArtRedmond Lite 64 van artificialguybr (Civitai 144684, versie 160844; beelden verkopen mag: allowCommercialUse
// Image), met zijn woorden voor de prompt.
// Rijker schilderwerk (Marcel, 19 okt: "Kunnen wij aan 'rijker' schilderwerk komen?"): woorden voor geschilderd werk, en
// wat er niet in mag (glad, plastic), met een sterkere prompt (cfg).
const SCHILDER = {
  zin: 'painterly hand-painted game art, visible brush strokes, strong highlights and deep shadows, rich texture detail',
  negatief: 'smooth, plastic, cgi, airbrushed, flat shading, waxy',
  cfg: 7,
};
const LORA = { naam: 'civitai-pixelartredmond\\PixelArtRedmond-Lite64.safetensors', kracht: 0.8, woorden: 'Pixel Art, PixArFK' };

// Eén zin per materiaal, voor alle dingen. Een vacht krijgt zijn kleur uit het model (kleurWoord), dus een zwarte koe en
// een romige os hebben dezelfde zin.
const VACHT = (kleur) => `${kleurWoord(kleur)} animal with short smooth fur, soft fur texture`;
const MATERIALEN = {
  // hout en wat ervan gemaakt is
  hout: () => 'dark weathered oak wood with visible grain',
  wiel: () => 'oak wood cart wheel with wood grain',
  kist: () => 'wooden chest with dark oak planks',
  ton: () => 'wooden barrel with oak staves',
  verf: () => 'red painted wooden planks, worn red paint with wood grain',
  schors: () => 'tree log with rough brown bark',
  nerf: () => 'sawn wood end grain with growth rings',
  juk: () => 'polished wooden yoke',
  // metaal
  ijzer: () => 'dark forged iron with rivets',
  ketel: () => 'black iron cauldron',
  messing: () => 'polished brass',
  bies: () => 'polished golden yellow trim',
  goud: () => 'pile of shiny gold coins',
  embleem: () => 'golden heraldic lion rampant emblem painted on red wood',
  // stof en touw
  zak: () => 'burlap sack, coarse jute fabric with folds',
  linnen: () => 'off-white canvas cloth',
  deken: () => 'rolled woollen blanket',
  touw: () => 'rough hemp rope',
  vaanG: () => 'yellow cloth banner',
  vaanR: () => 'red cloth banner',
  riem: () => 'leather harness strap with brass studs',
  steen: () => 'grey field stones',
  // dieren
  lijf: VACHT,
  kop: VACHT,
  poot: VACHT,
  staart: VACHT,
  oor: VACHT,
  snuit: () => 'grey pink animal muzzle',
  oog: () => 'dark glossy animal eye',
  neusgat: () => 'dark nostril',
  hoorn: () => 'pale curved horns',
  hoef: () => 'dark hooves',
  kwast: () => 'tail tuft of hair',
  uier: () => 'pink udder',
};
const zinVoor = (naam, kleur) => (MATERIALEN[naam] ? MATERIALEN[naam](kleur) : null);

// De groepen: zes en het wapen. Een vacht krijgt de kleur van het lijf.
const GROEP = {
  hout: 'hout', wiel: 'hout', kist: 'hout', ton: 'hout', nerf: 'hout', juk: 'hout',
  schors: 'schors',
  verf: 'verf', vaanR: 'verf',
  bies: 'bies', vaanG: 'bies',
  ijzer: 'metaal', ketel: 'metaal', messing: 'metaal',
  zak: 'stof', linnen: 'stof', deken: 'stof', touw: 'stof', steen: 'stof',
  goud: 'goud',
  embleem: 'embleem',
  lijf: 'dier', kop: 'dier', poot: 'dier', staart: 'dier', oor: 'dier', snuit: 'dier', oog: 'dier', neusgat: 'dier',
  hoorn: 'dier', hoef: 'dier', kwast: 'dier', uier: 'dier', riem: 'dier',
};
// De zin per groep (Marcel, 19 okt: "kunnen we betere zinnen maken voor het materiaal?"): een oppervlak, geen lijst van
// dingen (in het hout stonden planken, wielen, duigen en een stam tegelijk: SDXL weet niet welke pixel wat is); in de
// volgorde kleur (uit het model: het hoofdmateriaal van het gebied), oppervlak, hoe het licht vangt, slijtage. kleur
// [r, g, b]; info { soort (wat het dier is, uit het model), namen (de materialen in het gebied) }.
const GROEPZIN = {
  hout: (k) => `warm ${kleurWoord(k)} oak wood, clear dark grain lines and small knots, lighter worn edges, matte`,
  schors: (k) => `${kleurWoord(k)} tree bark with deep vertical cracks and rough ridges, matte`,
  verf: (k) => `deep ${kleurWoord(k)} paint on wooden boards, chipped and worn at the edges showing bare wood, dark grooves between the boards`,
  bies: () => 'bright golden yellow painted trim, smooth paint with soft highlights',
  metaal: () => 'blackened hammered iron with round rivet heads, bright steel-grey highlights on the edges, polished brass caps',
  stof: (k) => `rough ${kleurWoord(k)} burlap grain sack, coarse woven jute with visible criss-cross threads, lumpy and tied at the neck with twine, soft folds, matte`,
  goud: () => 'heap of small round gold coins, bright yellow highlights and warm orange shadows',
  embleem: () => 'golden heraldic lion rampant emblem painted on red wood',
  dier: (k, i = {}) => `${kleurWoord(k)} ${i.soort || 'animal'} hide, short coarse fur painted in small strokes along the body, warm grey shadows in the folds, matte` +
    `${i.namen && i.namen.has('hoorn') ? ', pale curved horns' : ''}${i.namen && i.namen.has('hoef') ? ', dark hooves' : ''}${i.namen && i.namen.has('riem') ? ', leather harness strap' : ''}`,
};
const groepVoor = (naam) => GROEP[naam] || null;

// Een kleur in een woord: de lichtheid, en voor wat verzadigd is de tint.
function kleurWoord([r, g, b]) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const s = mx === mn ? 0 : (mx - mn) / (l < 128 ? mx + mn : 510 - mx - mn);
  if (l < 50) return 'black';
  if (s < 0.15) return l > 200 ? 'white' : l > 130 ? 'light grey' : 'dark grey';
  let h = 0;
  if (mx === r) h = ((g - b) / (mx - mn)) * 60;
  else if (mx === g) h = (2 + (b - r) / (mx - mn)) * 60;
  else h = (4 + (r - g) / (mx - mn)) * 60;
  h = (h + 360) % 360;
  if (h < 15 || h >= 340) return l > 150 ? 'pink' : 'red';
  if (h < 45) return l > 170 ? 'cream' : l > 110 ? 'tan' : 'brown';
  if (h < 70) return l > 160 ? 'pale yellow' : 'ochre';
  if (h < 170) return 'green';
  if (h < 260) return 'blue';
  return 'purple';
}

module.exports = { HUISSTIJL, SCHILDER, LORA, MATERIALEN, zinVoor, GROEP, GROEPZIN, groepVoor, kleurWoord };
