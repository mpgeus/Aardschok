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
  // uit de stijlspecificatie (ontwerp/stijlspecificatie.md, Marcel, 19 okt): de kern, het licht, de afwerking
  zin: 'high-definition isometric hand-painted pixel art game sprite, premium medieval strategy game asset, stylized ' +
    'realism, rich tactile materials, painterly pixel clusters, warm directional key light from the upper left, warm cream ' +
    'and golden highlights, cooler blue-grey shadows, crisp silhouettes, polished surface details',
  // en de negatieve lijst van de specificatie, met wat er al stond
  negatief: 'photorealism, photo, flat vector art, low-detail cartoon shading, generic 3d render, smooth plastic surfaces, ' +
    'random pixel noise, automatic pixelation filter, blurry texture overlay, inconsistent perspective, excessive ' +
    'microdetail, watercolor bleeding, thick uniform black outlines, excessive bloom, chrome reflections, procedural texture ' +
    'repetition, blurry, deformed, text, watermark, signature, ground, grass, shadow on the ground, background objects, ' +
    'frame, border, bread, loaf, buns, pastry',
  instellingen: { denoise: 0.65, ip: 0, lijn: 0.8, diepte: 0.6, cnEind: 0.85, steps: 32, cfg: 5.5, sampler: 'dpmpp_2m', scheduler: 'karras', seed: 180 },
  // de gekozen weg (Marcel, 19 okt: "Ok, laten we de w5 gebruiken"; ai-afwerking.md, "Rijker schilderwerk"): het rijke begin
  // (stoffen.cjs), de schilderwoorden met cfg 7 (SCHILDER), ons handschrift H3 erover, met plaatselijk contrast 1,0
  pijplijn: { rijk: true, schilder: true, handschrift: 'h3', contrast: 1.0 },
  // de afwerking naar de stijlspecificatie (H4, karhd.cjs handschrift o.spec): minder verscherping (geen overdreven
  // verscherping), warm licht en koelere schaduw uit ons eigen licht (de vermenigvuldiging per kanaal, licht 0,45 tot 1,05),
  // het donkerste opgetild (geen zwarte schaduw), en de binnenlijnen half naar de kleur eronder (dunner en zachter dan buiten)
  spec: { contrast: 0.6, warm: [1.07, 1.01, 0.88], koel: [0.9, 0.95, 1.08], licht: [0.45, 1.05], vloer: 16, binnenZacht: 0.5 },
};
// De pixelart-LoRA (Marcel, 19 okt: "LoRA's is ook goed, ik wil het maximale eruit halen met mijn hardware"):
// PixelArtRedmond Lite 64 van artificialguybr (Civitai 144684, versie 160844; beelden verkopen mag: allowCommercialUse
// Image), met zijn woorden voor de prompt.
// Rijker schilderwerk (Marcel, 19 okt: "Kunnen wij aan 'rijker' schilderwerk komen?"): woorden voor geschilderd werk, en
// wat er niet in mag (glad, plastic), met een sterkere prompt (cfg).
const SCHILDER = {
  // de specificatie, 2 en 3: geschilderde clusters, zacht verlopende schaduw die het volume beschrijft, kleine precieze
  // glimlichten op de randen (eerder: "strong highlights and deep shadows", en de specificatie wil geen zwarte schaduw)
  zin: 'carefully shaped hand-painted pixel clusters, broad softly graduated shading describing volume, small precise ' +
    'highlights along exposed edges, deep contact shadows in joints and crevices',
  negatief: 'smooth, plastic, cgi, airbrushed, flat shading, waxy',
  cfg: 7,
};
// De checkpoints die er zijn (ComfyUI/models/checkpoints/, SHA256 nagekeken tegen Civitai): FaeTastic (de huisstijl) en
// Cor Epica by Zovya V0 beta (Civitai 552880, versie 615266, voor "RPG and Concept art"; beelden verkopen mag:
// allowCommercialUse Image; Marcel downloadde hem zelf, 19 okt).
const CHECKPOINTS = {
  faetastic: 'civitai-faetastic\\SDXLFaetastic_v24.safetensors',
  corepica: 'civitai-corepica\\corEpicaByZovya_v0Beta.safetensors',
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
// Uit de stijlspecificatie (4, materialen; 5, palet): de kleurfamilie van elk materiaal staat in de zin zelf (de zinnen
// van daarvoor werden met "blackened", "deep" en "dark" te donker en koud). De rode verf houdt de kleur uit het model.
const GROEPZIN = {
  hout: () => 'rich honey-brown, amber and warm walnut wood, visible directional wood grain following each plank and beam, ' +
    'subtle fiber variation, small cracks, naturally worn edges, small warm highlights along exposed edges',
  schors: (k) => `${kleurWoord(k)} tree bark with vertical cracks and rough ridges, warm highlights on the ridges`,
  verf: (k) => `warm ${kleurWoord(k)} painted wood, paint worn at the edges showing honey-brown wood, dark seams between the ` +
    'planks, small warm highlights along the edges',
  bies: () => 'golden yellow painted trim with amber midtones, small precise highlights',
  metaal: () => 'dark charcoal and desaturated blue-grey forged iron, slightly uneven hammered surface, sharp narrow ' +
    'highlights along exposed edges, small individually shaded rivets, restrained reflectivity, warm brass caps',
  stof: () => 'woven matte burlap sack in warm earthy beige, subtle directional fiber pattern, soft irregular folds, ' +
    'shadows inside the folds, restrained highlights on the ridges, lumpy, tied at the neck with twine',
  goud: () => 'heap of small round gold coins, warm saturated golden-yellow highlights, amber midtones, rich orange-brown ' +
    'shadows, small precise specular highlights',
  embleem: () => 'golden heraldic lion rampant emblem painted on red wood, golden-yellow highlights, amber midtones',
  dier: (k, i = {}) => `soft layered ${kleurWoord(k)} ${i.soort || 'animal'} fur in small directional hand-painted strokes ` +
    'following the anatomy, warm ivory and cream highlights, muted beige and grey-brown shadows, broad shading describing ' +
    'the musculature' +
    `${i.namen && i.namen.has('hoorn') ? ', pale curved horns' : ''}${i.namen && i.namen.has('hoef') ? ', dark hooves' : ''}` +
    `${i.namen && i.namen.has('riem') ? ', thick warm chestnut leather harness' : ''}`,
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

module.exports = { HUISSTIJL, SCHILDER, CHECKPOINTS, LORA, MATERIALEN, zinVoor, GROEP, GROEPZIN, groepVoor, kleurWoord };
