// Een AI-afwerking op onze sprites (werklijst vraag 180; Marcels zevende opdracht in gereedschap/ai/opdracht-comfyui.md,
// het verslag in gereedschap/ai/ai-afwerking.md). Onze renderer bepaalt de geometrie, het perspectief en de maat; een
// beeldmodel in ComfyUI (127.0.0.1:8188) alleen de afwerking, met het ChatGPT-wiel als stijlvoorbeeld. Optioneel: de
// sprites van de renderer blijven zoals ze zijn, dit is een stap erna.
//
// Route A (SDXL), op wiel D van de stijlproef (hdstijl.cjs):
//   - het doek: 1024 × 1024, onze sprite van 2× maal 8 (nearest neighbour), op #FF00FF, in het midden;
//   - image-to-image vanaf die sprite (denoise instelbaar), alleen binnen het wiel (SetLatentNoiseMask met ons silhouet,
//     iets ruimer): de achtergrond verandert niet;
//   - ControlNet union twee keer: onze eigen lijnen (lineart) en onze eigen diepte, uit de render op 4× (stijl.cjs
//     lijnenVan, diepteVan), op dezelfde plek: de vorm komt van ons;
//   - IP-Adapter Plus SDXL met het ChatGPT-wiel: de stijl komt van het voorbeeld;
//   - een vaste seed; alles wat erin ging (prompts, seed, modellen, instellingen, de werkstroom) naast het beeld;
//   - terug naar 2×: per spritepixel het gemiddelde van zijn 8 × 8 (in lineair licht, zonder wat de AI als achtergrond
//     liet), de alfa exact die van onze sprite, de omlijning van onze sprite, en een palet uit het resultaat
//     (sprite.png); en een tweede keer detailbehoudend: een lijn of glimlicht in het blok wint (sprite-detail.png).
//
//   node gereedschap/ai/afwerking.cjs passen            de render passes van wiel D (zuidwest, stand 0) als plaat
//   node gereedschap/ai/afwerking.cjs matrix            zuidwest stand 0 met een reeks instellingen (om te kiezen)
//   node gereedschap/ai/afwerking.cjs een [kant] [stand] één beeld (DENOISE, IP, IPSOORT, LIJN, DIEPTE, SEED in de omgeving)
//   node gereedschap/ai/afwerking.cjs standen [tag]     de acht standen naar zuidwest, en stand 0 nog eens na het legen
//                                                        van ComfyUI (is het reproduceerbaar?)
//   node gereedschap/ai/afwerking.cjs terug [tag]       de sprites opnieuw uit ai.png (box en detail), zonder de AI
//   node gereedschap/ai/afwerking.cjs platen            het vergelijkingsvel, de matrix, het draaien en de metingen
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const H = require('../pixelart/hdproef.cjs');
const HS = require('../pixelart/hdstijl.cjs');
const S = require('../pixelart/stijl.cjs');
const SM = require('../pixelart/stijlmaat.cjs');
const A = require('./beeld-ai.cjs');
const E = require('./etiket.cjs');
const { apng } = require('../pixelart/apng.cjs');

const W = 1024;
const DOEK = require('./doek.cjs').maak(W, W);
const UIT = path.join(A.UIT, 'afwerking');
const ZWIEL = 8; // doekpixels per spritepixel voor het wiel (de sprite is 2×, de render 4×: maal 4); een bron kan een eigen z hebben
const Z = ZWIEL;
const MAGENTA = [255, 0, 255];
const MODELLEN = {
  checkpoint: 'sd_xl_base_1.0.safetensors',
  controlnet: 'controlnet-union-sdxl-promax.safetensors',
  ipadapter: 'ip-adapter-plus_sdxl_vit-h.safetensors',
  clipVision: 'CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors',
};
// De startinstellingen. lijn, diepte: de kracht van de twee ControlNets (0: niet), tot cnEind van de stappen; rand: zoveel
// doekpixels mag de AI buiten ons silhouet tekenen (dat wordt daarna toch weer doorzichtig); palet: kleuren in de sprite;
// voorbeeld: 'wiel' (het voorste wiel uit het ChatGPT-beeld geknipt, de rest #FF00FF) of 'heel' (het ChatGPT-beeld zelf,
// onbewerkt: Marcel, 18 okt, "Gebruik de chatgpt bron als referentie").
const START = { steps: 32, cfg: 5.5, sampler: 'dpmpp_2m', scheduler: 'karras', denoise: 0.5, lijn: 0.8, diepte: 0.6, cnEind: 0.85, ip: 1.0, ipSoort: 'strong style transfer', seed: 180, rand: 4, palet: 32, voorbeeld: 'wiel' };
const BRON = path.join(A.UIT, 'hand', 'wagen-zw.png.png'); // het ChatGPT-beeld (niet in git)
const POSITIEF = 'HD pixel art game sprite of a single medieval wooden cart wheel, strategy game asset, eight thick wooden ' +
  'spokes, wooden rim, iron tyre with rivets, iron hub, rich hand-painted wood grain, warm light from the top left, ' +
  'crisp dark outlines, clean pixel clusters, limited palette';
const NEGATIEF = 'blurry, smooth gradients, photo, 3d render, plastic, extra spokes, missing spokes, broken wheel, deformed, ' +
  'text, watermark, signature, ground, grass, shadow on the ground, background objects, cart, frame, border';
const komma = (x) => String(x).replace('.', ',');

// ---------------------------------------------------------------- de invoer: wiel D en zijn passes op het doek

const lees = (p) => K.leesPng(fs.readFileSync(p));
// De uitsnede om het wiel in een richting: over de acht standen van D (hdstijl.cjs), met een rand.
function uitsnedeVan(kant) {
  return H.uitsnede([0, 1, 2, 3, 4, 5, 6, 7].map((s) => lees(path.join(HS.UIT, 'D', `${kant}-${s}.png`))), 4);
}
const dekt = (r, i) => r.rgba[i * 4 + 3] >= 128;

// De bron: welk wiel, en welke sprite van 2× op het doek gaat. Standaard wiel D van de stijlproef; een andere bron (zoals
// het wiel naar het doel, doelwiel.cjs BRON) geeft { naam, render(kant, s) → R (met de G-buffer), sprite(R, kant, s) →
// { G, D }, uitsnede(kant) → u }.
const BRON_D = {
  naam: 'wiel D van de stijlproef (hdstijl.cjs, ijk.json), de render op 4×',
  render: (kant, s) => HS.render(kant, s, true),
  sprite: (R) => {
    const { G, beelden } = HS.varianten(R, HS.leesIjk(), { D: HS.VARIANTEN.D });
    return { G, D: beelden.D };
  },
  uitsnede: (kant) => uitsnedeVan(kant),
};
function invoer(kant, s, bron = BRON_D) {
  const ij = HS.leesIjk();
  const R = bron.render(kant, s);
  const { G, D } = bron.sprite(R, kant, s);
  const u = bron.uitsnede(kant);
  // doekpixels per spritepixel: 8 voor een wiel, minder voor wat groter is (de hele ossenkar: 3), zodat het op het doek past
  const Z = bron.z || ZWIEL;
  if (u.b * Z > W || u.h * Z > W) throw new Error(`het wiel past niet op het doek: ${u.b}×${u.h} maal ${Z}`);
  const ox = Math.floor((W - u.b * Z) / 2);
  const oy = Math.floor((W - u.h * Z) / 2);
  // van het doek naar de sprite (volle cel van 2×) en terug
  const naarSprite = (X, Y) => [u.x0 + Math.floor((X - ox) / Z), u.y0 + Math.floor((Y - oy) / Z)];
  const doek = () => {
    const r = A.leeg(W, W);
    for (let i = 0; i < W * W; i++) r.rgba.set([...MAGENTA, 255], i * 4);
    return r;
  };
  const init = doek();
  const masker = A.leeg(W, W);
  const binnen = new Uint8Array(W * W); // ons silhouet op het doek (met de omlijning van D)
  for (let Y = 0; Y < W; Y++) for (let X = 0; X < W; X++) {
    const [x, y] = naarSprite(X, Y);
    if (X < ox || Y < oy || x >= u.x0 + u.b || y >= u.y0 + u.h) continue;
    const i = y * D.b + x;
    if (x < 0 || y < 0 || x >= D.b || y >= D.h || !dekt(D, i)) continue;
    init.rgba.set([D.rgba[i * 4], D.rgba[i * 4 + 1], D.rgba[i * 4 + 2], 255], (Y * W + X) * 4);
    binnen[Y * W + X] = 1;
  }
  // het masker voor de AI: het silhouet, rand doekpixels ruimer (een vierkant om elke pixel; dat is genoeg)
  const ruim = new Uint8Array(W * W);
  const rand = START.rand;
  for (let Y = 0; Y < W; Y++) for (let X = 0; X < W; X++) {
    if (!binnen[Y * W + X]) continue;
    if (binnen[Y * W + X - 1] && binnen[Y * W + X + 1] && binnen[(Y - 1) * W + X] && binnen[(Y + 1) * W + X]) {
      ruim[Y * W + X] = 1;
      continue;
    }
    for (let dy = -rand; dy <= rand; dy++) for (let dx = -rand; dx <= rand; dx++) {
      const XX = X + dx, YY = Y + dy;
      if (XX >= 0 && YY >= 0 && XX < W && YY < W) ruim[YY * W + XX] = 1;
    }
  }
  for (let i = 0; i < W * W; i++) masker.rgba.set(ruim[i] ? [255, 255, 255, 255] : [0, 0, 0, 255], i * 4);
  // de lijnen en de diepte uit de render op 4× (maal 4 op het doek: dezelfde plek als de sprite maal 8)
  const opDoek = (bron) => {
    const r = A.leeg(W, W);
    for (let i = 0; i < W * W; i++) r.rgba.set([0, 0, 0, 255], i * 4);
    for (let Y = oy; Y < oy + u.h * Z; Y++) for (let X = ox; X < ox + u.b * Z; X++) {
      const x4 = u.x0 * 2 + Math.floor((X - ox) / (Z / 2));
      const y4 = u.y0 * 2 + Math.floor((Y - oy) / (Z / 2));
      if (x4 < 0 || y4 < 0 || x4 >= bron.b || y4 >= bron.h) continue;
      bron.rgba.copy(r.rgba, (Y * W + X) * 4, (y4 * bron.b + x4) * 4, (y4 * bron.b + x4) * 4 + 4);
    }
    return r;
  };
  const lijnen = opDoek(S.lijnenVan(R));
  const diepte = opDoek(S.diepteVan(R));
  return { kant, s, ij, R, G, D, u, ox, oy, init, masker, binnen, lijnen, diepte, Z };
}

// Het ChatGPT-wiel, vierkant op #FF00FF (voor IP-Adapter: CLIP knipt anders een vierkant uit het midden).
function voorbeeld() {
  const w = HS.doelWiel();
  const n = Math.max(w.b, w.h) + 40;
  const uit = A.leeg(n, n);
  for (let i = 0; i < n * n; i++) uit.rgba.set([...MAGENTA, 255], i * 4);
  const ox = Math.floor((n - w.b) / 2);
  const oy = Math.floor((n - w.h) / 2);
  for (let y = 0; y < w.h; y++) for (let x = 0; x < w.b; x++) {
    const i = y * w.b + x;
    if (dekt(w, i)) uit.rgba.set([w.rgba[i * 4], w.rgba[i * 4 + 1], w.rgba[i * 4 + 2], 255], ((oy + y) * n + ox + x) * 4);
  }
  return uit;
}

// ---------------------------------------------------------------- de werkstroom (Route A)

function werkstroom(n, o = START) {
  const st = {
    1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: MODELLEN.checkpoint }, _meta: { title: 'SDXL 1.0 base' } },
    3: { class_type: 'LoadImage', inputs: { image: n.init }, _meta: { title: 'onze sprite (wiel D) maal 8, op #FF00FF' } },
    4: { class_type: 'VAEEncode', inputs: { pixels: ['3', 0], vae: ['1', 2] } },
    30: { class_type: 'LoadImage', inputs: { image: n.masker }, _meta: { title: 'ons silhouet, iets ruimer' } },
    31: { class_type: 'ImageToMask', inputs: { image: ['30', 0], channel: 'red' } },
    32: { class_type: 'SetLatentNoiseMask', inputs: { samples: ['4', 0], mask: ['31', 0] }, _meta: { title: 'alleen binnen het wiel' } },
    5: { class_type: 'LoadImage', inputs: { image: n.stijl }, _meta: { title: 'het ChatGPT-wiel (stijl)' } },
    7: { class_type: 'IPAdapterModelLoader', inputs: { ipadapter_file: MODELLEN.ipadapter } },
    8: { class_type: 'CLIPVisionLoader', inputs: { clip_name: MODELLEN.clipVision } },
    9: { class_type: 'IPAdapterAdvanced', inputs: { model: ['1', 0], ipadapter: ['7', 0], image: ['5', 0], clip_vision: ['8', 0], weight: o.ip, weight_type: o.ipSoort, combine_embeds: 'concat', start_at: 0, end_at: 1, embeds_scaling: 'V only' }, _meta: { title: 'IP-Adapter (stijl)' } },
    11: { class_type: 'ControlNetLoader', inputs: { control_net_name: MODELLEN.controlnet } },
    12: { class_type: 'CLIPTextEncode', inputs: { text: n.positief || POSITIEF, clip: ['1', 1] }, _meta: { title: 'Positief' } },
    13: { class_type: 'CLIPTextEncode', inputs: { text: n.negatief || NEGATIEF, clip: ['1', 1] }, _meta: { title: 'Negatief' } },
  };
  let pos = ['12', 0];
  let neg = ['13', 0];
  if (o.lijn > 0) {
    Object.assign(st, {
      10: { class_type: 'LoadImage', inputs: { image: n.lijnen }, _meta: { title: 'onze lijnen (uit de render op 4×)' } },
      19: { class_type: 'SetUnionControlNetType', inputs: { control_net: ['11', 0], type: 'canny/lineart/anime_lineart/mlsd' } },
      14: { class_type: 'ControlNetApplyAdvanced', inputs: { positive: pos, negative: neg, control_net: ['19', 0], image: ['10', 0], strength: o.lijn, start_percent: 0, end_percent: o.cnEind, vae: ['1', 2] }, _meta: { title: 'ControlNet: lijnen' } },
    });
    pos = ['14', 0];
    neg = ['14', 1];
  }
  if (o.diepte > 0) {
    Object.assign(st, {
      20: { class_type: 'LoadImage', inputs: { image: n.diepte }, _meta: { title: 'onze diepte (uit de render op 4×)' } },
      21: { class_type: 'SetUnionControlNetType', inputs: { control_net: ['11', 0], type: 'depth' } },
      22: { class_type: 'ControlNetApplyAdvanced', inputs: { positive: pos, negative: neg, control_net: ['21', 0], image: ['20', 0], strength: o.diepte, start_percent: 0, end_percent: o.cnEind, vae: ['1', 2] }, _meta: { title: 'ControlNet: diepte' } },
    });
    pos = ['22', 0];
    neg = ['22', 1];
  }
  Object.assign(st, {
    15: { class_type: 'KSampler', inputs: { model: ['9', 0], positive: pos, negative: neg, latent_image: ['32', 0], seed: o.seed, steps: o.steps, cfg: o.cfg, sampler_name: o.sampler, scheduler: o.scheduler, denoise: o.denoise } },
    16: { class_type: 'VAEDecode', inputs: { samples: ['15', 0], vae: ['1', 2] } },
    17: { class_type: 'SaveImage', inputs: { images: ['16', 0], filename_prefix: 'aardschok-afwerking' } },
  });
  return st;
}
const tagVan = (o) => `d${o.denoise.toFixed(2)}-ip${o.ip.toFixed(2)}${o.ipSoort.replace(/ /g, '')}-l${o.lijn.toFixed(2)}-z${o.diepte.toFixed(2)}-s${o.seed}${o.voorbeeld === 'heel' ? '-heel' : ''}`;

// ---------------------------------------------------------------- terug naar de sprite

const lijktMagenta = (r, g, b) => r > 140 && b > 140 && g < 120 && Math.abs(r - b) < 100;
function terug(ai, inv, o = START) {
  const { D, G, u, ox, oy, binnen, Z } = inv;
  const sprite = { b: D.b, h: D.h, rgba: Buffer.from(D.rgba) };
  let geenAi = 0;
  for (let y = u.y0; y < u.y0 + u.h; y++) for (let x = u.x0; x < u.x0 + u.b; x++) {
    const i = y * D.b + x;
    if (x < 0 || y < 0 || x >= D.b || y >= D.h || !dekt(D, i)) continue;
    // de omlijning van D (een pixel buiten de geometrie) blijft van D: het silhouet en zijn rand zijn van ons
    if (!G.dek[i]) continue;
    const blok = [];
    for (let j = 0; j < Z; j++) for (let k = 0; k < Z; k++) {
      const X = ox + (x - u.x0) * Z + k, Y = oy + (y - u.y0) * Z + j;
      const a = (Y * W + X) * 4;
      if (lijktMagenta(ai.rgba[a], ai.rgba[a + 1], ai.rgba[a + 2])) continue;
      blok.push([ai.rgba[a], ai.rgba[a + 1], ai.rgba[a + 2]]);
    }
    if (!blok.length) { geenAi++; continue; }
    // o.verklein 'box': het gemiddelde in lineair licht. 'detail': zoals een pixelaar verkleint: ligt er een lijn door
    // het blok (een derde of meer duidelijk donkerder dan het gemiddelde), dan wordt de pixel die lijn; een glimlicht of
    // nagelkop (een vijfde of meer duidelijk lichter), dan dat licht; anders het gemiddelde. De AI tekent zijn details
    // fijner dan een spritepixel, en box middelt ze weg.
    let kies = blok;
    if (o.verklein === 'detail') {
      const L = (p) => 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
      const m = blok.reduce((t, p) => t + L(p), 0) / blok.length;
      const donker = blok.filter((p) => L(p) < m - 28);
      const licht = blok.filter((p) => L(p) > m + 35);
      if (donker.length >= 0.3 * blok.length) kies = donker;
      else if (licht.length >= 0.2 * blok.length) kies = licht;
    }
    const som = [0, 0, 0];
    for (const p of kies) for (let c = 0; c < 3; c++) som[c] += S.lin(p[c]);
    sprite.rgba.set([S.srgb(som[0] / kies.length), S.srgb(som[1] / kies.length), S.srgb(som[2] / kies.length), 255], i * 4);
  }
  // een palet uit het resultaat zelf (de omlijning van D telt mee)
  const P = o.palet ? H.paletVan([H.alfaSnij(sprite, u)], o.palet) : null;
  const uit = P ? H.naarPalet(sprite, P) : sprite;
  // de controle op het doek: wat de AI tekende tegen ons silhouet, binnen het vak van het wiel
  let bin = 0, gat = 0, erbuiten = 0;
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1, sx = 0, sy = 0, nt = 0;
  let ox0 = Infinity, oy0 = Infinity, ox1 = -1, oy1 = -1, osx = 0, osy = 0, no = 0;
  for (let Y = oy - 24; Y < oy + u.h * Z + 24; Y++) for (let X = ox - 24; X < ox + u.b * Z + 24; X++) {
    if (X < 0 || Y < 0 || X >= W || Y >= W) continue;
    const a = (Y * W + X) * 4;
    const tekent = !lijktMagenta(ai.rgba[a], ai.rgba[a + 1], ai.rgba[a + 2]);
    const b0 = binnen[Y * W + X];
    if (b0) { bin++; if (!tekent) gat++; ox0 = Math.min(ox0, X); ox1 = Math.max(ox1, X); oy0 = Math.min(oy0, Y); oy1 = Math.max(oy1, Y); osx += X; osy += Y; no++; }
    else if (tekent) erbuiten++;
    if (tekent) { x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); sx += X; sy += Y; nt++; }
  }
  const px = (v) => +(v / Z).toFixed(2); // in spritepixels
  const controle = {
    silhouet: { overlap: +(((bin - gat) / (bin + erbuiten)) * 100).toFixed(1), gatenBinnen: +((gat / bin) * 100).toFixed(2), getekendErbuiten: +((erbuiten / bin) * 100).toFixed(2) },
    maat: { breedte: px((x1 - x0) - (ox1 - ox0)), hoogte: px((y1 - y0) - (oy1 - oy0)), midden: [px(sx / nt - osx / no), px(sy / nt - osy / no)] },
    spaken: { ons: spakenTel(inv, null), ai: spakenTel(inv, ai) },
    geenAi,
  };
  return { sprite: uit, palet: P, controle };
}

// Hoeveel spaken: op een ellips tussen naaf en velg (de ellips uit de momenten van ons gevulde wiel, op 45 en 55% van de
// straal) de stukken die getekend zijn, rondom. Op ons doek (ai null) en op wat de AI tekende (vóór het masker).
function spakenTel(inv, ai) {
  const { binnen, ox, oy, u, Z } = inv;
  // ons wiel gevuld (de gaten tussen de spaken dicht), en zijn momenten
  const vak = { x0: ox, y0: oy, x1: ox + u.b * Z, y1: oy + u.h * Z };
  const b = vak.x1 - vak.x0, h = vak.y1 - vak.y0;
  const buiten = new Uint8Array(b * h);
  const stapel = [];
  for (let x = 0; x < b; x++) stapel.push(x, (h - 1) * b + x);
  for (let y = 0; y < h; y++) stapel.push(y * b, y * b + b - 1);
  while (stapel.length) {
    const i = stapel.pop();
    if (buiten[i] || binnen[(vak.y0 + Math.floor(i / b)) * W + vak.x0 + (i % b)]) continue;
    buiten[i] = 1;
    const x = i % b;
    if (x > 0) stapel.push(i - 1);
    if (x < b - 1) stapel.push(i + 1);
    if (i >= b) stapel.push(i - b);
    if (i < b * (h - 1)) stapel.push(i + b);
  }
  let n = 0, cx = 0, cy = 0;
  for (let i = 0; i < b * h; i++) if (!buiten[i]) { n++; cx += i % b; cy += Math.floor(i / b); }
  cx /= n; cy /= n;
  let xx = 0, xy = 0, yy = 0;
  for (let i = 0; i < b * h; i++) if (!buiten[i]) { const dx = (i % b) - cx, dy = Math.floor(i / b) - cy; xx += dx * dx; xy += dx * dy; yy += dy * dy; }
  [xx, xy, yy] = [xx / n, xy / n, yy / n];
  // de ellips: punten p met pᵀ Σ⁻¹ p = 4 r²; langs een hoek t: p = 2 r (Σ^½ (cos t, sin t))
  const l1 = (xx + yy) / 2 + Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy);
  const l2 = (xx + yy) / 2 - Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy);
  const th = 0.5 * Math.atan2(2 * xy, xx - yy);
  const tel = (r) => {
    const getekend = [];
    for (let k = 0; k < 1440; k++) {
      const t = (k / 1440) * 2 * Math.PI;
      const a = 2 * r * Math.sqrt(l1) * Math.cos(t), c = 2 * r * Math.sqrt(l2) * Math.sin(t);
      const X = Math.round(vak.x0 + cx + a * Math.cos(th) - c * Math.sin(th));
      const Y = Math.round(vak.y0 + cy + a * Math.sin(th) + c * Math.cos(th));
      const i = Y * W + X;
      getekend.push(ai ? !lijktMagenta(ai.rgba[i * 4], ai.rgba[i * 4 + 1], ai.rgba[i * 4 + 2]) : binnen[i] === 1);
    }
    // de stukken rondom, en hun lengte (in stappen van een kwart graad); een stuk korter dan een spritepixel is een
    // spikkel, geen spaak
    const n0 = getekend.length;
    const begin = getekend.findIndex((g, k) => !g && getekend[(k + 1) % n0]);
    if (begin < 0) return { spaken: getekend[0] ? 1 : 0, spikkels: 0 };
    let spaken = 0, spikkels = 0, lengte = 0;
    for (let k = 1; k <= n0; k++) {
      const g = getekend[(begin + k) % n0];
      if (g) lengte++;
      else if (lengte) {
        // de lengte van dit stuk op het doek, ruwweg: de omtrek van de ellips maal het deel
        const doekPx = (lengte / n0) * 2 * Math.PI * 2 * r * Math.sqrt((l1 + l2) / 2);
        if (doekPx >= Z) spaken++;
        else spikkels++;
        lengte = 0;
      }
    }
    return { spaken, spikkels };
  };
  const t45 = tel(0.45), t55 = tel(0.55);
  return { spaken: [t45.spaken, t55.spaken], spikkels: t45.spikkels + t55.spikkels };
}

// ---------------------------------------------------------------- één beeld

async function eenBeeld(kant, s, o, stijlNaam, tag = tagVan(o), bron = BRON_D) {
  const inv = invoer(kant, s, bron);
  const map = path.join(UIT, tag, `${kant}-${s}`);
  fs.mkdirSync(map, { recursive: true });
  const png = (r) => K.pngVanBeeld(r);
  const bestanden = { init: inv.init, masker: inv.masker, lijnen: inv.lijnen, diepte: inv.diepte };
  const namen = { stijl: stijlNaam, positief: bron.positief, negatief: bron.negatief };
  for (const [k, r] of Object.entries(bestanden)) {
    const data = png(r);
    fs.writeFileSync(path.join(map, `${k}.png`), data);
    namen[k] = await A.upload(`aardschok-afw-${kant}-${s}-${k}.png`, data, 'image/png');
  }
  const stroom = werkstroom(namen, o);
  fs.writeFileSync(path.join(map, 'werkstroom.json'), JSON.stringify(stroom, null, 2));
  const t0 = Date.now();
  const aiPng = await DOEK.voerUit(stroom);
  const tijd = (Date.now() - t0) / 1000;
  fs.writeFileSync(path.join(map, 'ai.png'), aiPng);
  const t1 = Date.now();
  const ai = A.leesPng(aiPng);
  const { sprite, palet, controle } = terug(ai, inv, { ...o, verklein: 'box' });
  const naTijd = (Date.now() - t1) / 1000;
  fs.writeFileSync(path.join(map, 'sprite.png'), png(sprite));
  fs.writeFileSync(path.join(map, 'sprite-detail.png'), png(terug(ai, inv, { ...o, verklein: 'detail' }).sprite));
  const stats = await (await A.comfy('system_stats')).json();
  fs.writeFileSync(path.join(map, 'instellingen.json'), JSON.stringify({
    kant, stand: s, tag, stijlbron: `gereedschap/pixelart/uit/ai/hand/wagen-zw.png.png (${o.voorbeeld === 'heel' ? 'het hele beeld, onbewerkt' : 'alleen het voorste wiel: hdstijl.cjs doelWiel, de rest #FF00FF'})`,
    bron: bron.naam, modellen: MODELLEN, instellingen: o,
    positief: bron.positief || POSITIEF, negatief: bron.negatief || NEGATIEF, doek: `${W}×${W}`, maal: inv.Z, uitsnede: inv.u, plek: [inv.ox, inv.oy],
    comfyui: stats.system.comfyui_version, pytorch: stats.system.pytorch_version, gpu: stats.devices[0].name,
    seconden: +tijd.toFixed(1), terugSeconden: +naTijd.toFixed(2), palet, controle, wanneer: new Date().toISOString(),
  }, null, 2));
  console.log(`${tag} ${kant}-${s}: ${tijd.toFixed(0)} s, overlap ${controle.silhouet.overlap}%, gaten ${controle.silhouet.gatenBinnen}%, erbuiten ${controle.silhouet.getekendErbuiten}%, spaken ${controle.spaken.ai.spaken} (ons ${controle.spaken.ons.spaken}), spikkels ${controle.spaken.ai.spikkels}`);
  return { map, tijd, sprite, controle };
}

// ---------------------------------------------------------------- de matrix en de standen

const MATRIX = [
  { denoise: 0.35 },
  { denoise: 0.5 },
  { denoise: 0.65 },
  { denoise: 0.5, ipSoort: 'style transfer', ip: 0.9 },
  { denoise: 0.65, ipSoort: 'style transfer precise', ip: 1.0 },
  { denoise: 0.65, lijn: 0.6, diepte: 0.4 },
  { denoise: 0.5, voorbeeld: 'heel' },
];
async function stijlUpload(o = START) {
  if (o.voorbeeld === 'heel') return A.upload('aardschok-afw-chatgpt.png', fs.readFileSync(BRON), 'image/png');
  return A.upload('aardschok-afw-voorbeeld.png', K.pngVanBeeld(voorbeeld()), 'image/png');
}
async function matrix() {
  for (const m of MATRIX) {
    const o = { ...START, ...m };
    await eenBeeld('ZW', 0, o, await stijlUpload(o));
  }
}
function uitOmgeving() {
  const o = { ...START };
  for (const [k, e] of [['denoise', 'DENOISE'], ['ip', 'IP'], ['lijn', 'LIJN'], ['diepte', 'DIEPTE'], ['seed', 'SEED'], ['cnEind', 'CNEIND']]) if (process.env[e]) o[k] = Number(process.env[e]);
  if (process.env.IPSOORT) o.ipSoort = process.env.IPSOORT;
  if (process.env.VOORBEELD) o.voorbeeld = process.env.VOORBEELD;
  return o;
}
// De acht standen met één instelling, en stand 0 nog eens nadat ComfyUI zijn cache en modellen heeft losgelaten (anders
// geeft hij voor dezelfde werkstroom het oude antwoord terug zonder te rekenen).
async function standen(o) {
  const stijl = await stijlUpload(o);
  const tag = tagVan(o);
  for (let s = 0; s < 8; s++) await eenBeeld('ZW', s, o, stijl, tag);
  await A.comfy('free', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unload_models: true, free_memory: true }) });
  await new Promise((r) => setTimeout(r, 3000));
  await eenBeeld('ZW', 0, o, stijl, `${tag}-opnieuw`);
}

// De sprites van een tag opnieuw uit ai.png (box en detail), zonder de AI opnieuw te draaien: na een wijziging aan de weg
// terug.
function opnieuwTerug(tag) {
  for (const t of tag ? [tag, `${tag}-opnieuw`] : fs.readdirSync(UIT)) {
    if (!fs.existsSync(path.join(UIT, t)) || !fs.statSync(path.join(UIT, t)).isDirectory()) continue;
    for (const d of fs.readdirSync(path.join(UIT, t))) {
      const m = path.join(UIT, t, d);
      if (!fs.existsSync(path.join(m, 'ai.png'))) continue;
      const [kant, s] = d.split('-');
      const i = JSON.parse(fs.readFileSync(path.join(m, 'instellingen.json')));
      const inv = invoer(kant, Number(s));
      const ai = A.leesPng(fs.readFileSync(path.join(m, 'ai.png')));
      const box = terug(ai, inv, { ...i.instellingen, verklein: 'box' });
      fs.writeFileSync(path.join(m, 'sprite.png'), K.pngVanBeeld(box.sprite));
      fs.writeFileSync(path.join(m, 'sprite-detail.png'), K.pngVanBeeld(terug(ai, inv, { ...i.instellingen, verklein: 'detail' }).sprite));
      i.controle = box.controle;
      i.palet = box.palet;
      fs.writeFileSync(path.join(m, 'instellingen.json'), JSON.stringify(i, null, 2));
      console.log(`${t}/${d}`);
    }
  }
}

async function main() {
  const [wat = 'passen', a1, a2] = process.argv.slice(2);
  fs.mkdirSync(UIT, { recursive: true });
  if (wat === 'passen') return passenPlaat();
  if (wat === 'matrix') return matrix();
  if (wat === 'een') {
    const o = uitOmgeving();
    return eenBeeld(a1 || 'ZW', Number(a2 || 0), o, await stijlUpload(o));
  }
  if (wat === 'standen') return standen(uitOmgeving());
  if (wat === 'platen') return platen();
  if (wat === 'terug') return opnieuwTerug(a1);
  console.log('node gereedschap/ai/afwerking.cjs passen | matrix | een [kant] [stand] | standen | platen [tag]');
}

// ---------------------------------------------------------------- de platen

function passenPlaat() {
  const inv = invoer('ZW', 0);
  const P = S.passen(inv.G, { basis: { hout: [156, 94, 50], ijzer: [84, 88, 100] } });
  const u = inv.u;
  const snij = (r, n = 4) => H.snij(r, u, n, [40, 40, 44]);
  const half = (r) => A.verklein(r, W / 2, W / 2);
  E.bewaar(path.join(UIT, 'passen.png'), [
    [E.met(snij(inv.D), 'wiel D (de sprite)'), E.met(snij(P.silhouet), 'silhouet (alfa)'), E.met(snij(P.materiaal), 'materiaal: hout, ijzer'), E.met(snij(P.onderdelen), 'onderdelen')],
    [E.met(snij(P.basis), 'basis, zonder textuur'), E.met(snij(P.licht), 'licht'), E.met(snij(P.schaduw), 'schaduw (zon)'), E.met(snij(P.diepte), 'diepte')],
    [E.met(half(inv.init), 'op het doek: D maal 8'), E.met(half(inv.masker), 'masker voor de AI'), E.met(half(inv.lijnen), 'lijnen (4×, ControlNet)'), E.met(half(inv.diepte), 'diepte (4×, ControlNet)')],
  ], 'De render passes van wiel D', 'Zuidwest, stand 0. Rij 1 en 2 op de maat van de sprite (2×, maal 4), op dezelfde plek; rij 3 het doek van 1024 × 1024 voor ComfyUI (hier op de helft).');
  console.log('uit/ai/afwerking/passen.png');
}

// ---------------------------------------------------------------- de metingen en de platen

// De metingen van één sprite (op 2×, de volle cel, uitgelijnd met G): wat er van het materiaal te herkennen is (op kleur,
// stijlmaat.cjs soortVan, tegen ons materiaal per pixel), het detail (het gemiddelde verschil in helderheid tussen buren,
// binnen het wiel), en hoeveel nagelkoppen te zien zijn.
function spriteMaten(r, G, nagels) {
  const tel = { hout: [0, 0, 0], ijzer: [0, 0, 0] }; // goed, lijn, anders
  let som = 0, n = 0;
  const L = (i) => 0.299 * r.rgba[i * 4] + 0.587 * r.rgba[i * 4 + 1] + 0.114 * r.rgba[i * 4 + 2];
  for (let i = 0; i < G.b * G.h; i++) {
    if (!G.dek[i]) continue;
    const naam = K.RAMP_NAMEN[G.mat[i]];
    if (tel[naam]) {
      const s = SM.soortVan(r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2]);
      tel[naam][s === naam ? 0 : s === 'lijn' ? 1 : 2]++;
    }
    const x = i % G.b;
    if (x + 1 < G.b && G.dek[i + 1] && i + G.b < G.b * G.h && G.dek[i + G.b]) {
      som += Math.abs(L(i + 1) - L(i)) + Math.abs(L(i + G.b) - L(i));
      n++;
    }
  }
  const herkend = {};
  for (const [k, [g, l, a]] of Object.entries(tel)) herkend[k] = { goed: +((g / Math.max(1, g + a)) * 100).toFixed(1), lijn: +((l / Math.max(1, g + l + a)) * 100).toFixed(1) };
  // de nagels: een kop (een stuk van een nageldeel) is te zien als een pixel ervan 25 lichter of donkerder is dan wat
  // eromheen ligt
  const st = new Int16Array(G.b * G.h).fill(-1);
  for (let i = 0; i < G.b * G.h; i++) if (G.dek[i] && nagels.has(G.stuk[i])) st[i] = G.stuk[i];
  const gezien = new Uint8Array(G.b * G.h);
  let koppen = 0, zichtbaar = 0;
  for (let s0 = 0; s0 < G.b * G.h; s0++) {
    if (st[s0] < 0 || gezien[s0]) continue;
    const kop = [s0];
    gezien[s0] = 1;
    for (let j = 0; j < kop.length; j++) for (const d of [1, -1, G.b, -G.b]) {
      const t = kop[j] + d;
      if (t >= 0 && t < G.b * G.h && !gezien[t] && st[t] === st[s0]) { gezien[t] = 1; kop.push(t); }
    }
    koppen++;
    const rond = [];
    for (const i of kop) for (const d of [1, -1, G.b, -G.b]) { const t = i + d; if (t >= 0 && t < G.b * G.h && G.dek[t] && st[t] < 0) rond.push(L(t)); }
    const m = rond.length ? rond.reduce((a, b) => a + b, 0) / rond.length : null;
    if (m !== null && kop.some((i) => Math.abs(L(i) - m) >= 25)) zichtbaar++;
  }
  return { herkend, detail: +(som / Math.max(1, n)).toFixed(1), nagels: { koppen, zichtbaar } };
}
// Het detail van een los beeld (het doel): zoals hierboven, binnen wat dekt.
function detailVan(r) {
  const L = (i) => 0.299 * r.rgba[i * 4] + 0.587 * r.rgba[i * 4 + 1] + 0.114 * r.rgba[i * 4 + 2];
  let som = 0, n = 0;
  for (let i = 0; i + r.b + 1 < r.b * r.h; i++) {
    if (!dekt(r, i) || !dekt(r, i + 1) || !dekt(r, i + r.b)) continue;
    som += Math.abs(L(i + 1) - L(i)) + Math.abs(L(i + r.b) - L(i));
    n++;
  }
  return +(som / Math.max(1, n)).toFixed(1);
}
// Het kleurverschil tussen twee kleuren in OKLab (maal 100: zo'n 2 is net te zien, 10 duidelijk).
function deltaE(a, b) {
  const lab = (k) => { const [L, C, h] = S.naarLch(k); return [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)]; };
  const p = lab(a), q = lab(b);
  return +(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) * 100).toFixed(1);
}
function gelijkheid(a, b) {
  let zelfde = 0, max = 0;
  for (let i = 0; i < a.b * a.h; i++) {
    const d = Math.max(Math.abs(a.rgba[i * 4] - b.rgba[i * 4]), Math.abs(a.rgba[i * 4 + 1] - b.rgba[i * 4 + 1]), Math.abs(a.rgba[i * 4 + 2] - b.rgba[i * 4 + 2]));
    if (d === 0) zelfde++;
    max = Math.max(max, d);
  }
  return { zelfde: +((zelfde / (a.b * a.h)) * 100).toFixed(3), grootsteVerschil: max };
}

// Het vergelijkingsvel, de matrix, het draaien en de metingen. De reeksen: elke tag met acht standen naar zuidwest (en
// stand 0 opnieuw, `<tag>-opnieuw`); van elke reeks twee sprites: box en detail (de weg terug).
function platen() {
  const ij = HS.leesIjk();
  const kant = 'ZW';
  const u = uitsnedeVan(kant);
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const knip = (r) => H.alfaSnij(r, u);
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const bestand = (t, s, soort) => path.join(UIT, t, `${kant}-${s}`, soort === 'detail' ? 'sprite-detail.png' : 'sprite.png');
  const Dvan = (s) => lees(path.join(HS.UIT, 'D', `${kant}-${s}.png`));
  const leesAi = (p) => A.leesPng(fs.readFileSync(p));
  const alleTags = fs.readdirSync(UIT).filter((t) => !t.endsWith('-opnieuw') && fs.existsSync(bestand(t, 0, 'box'))).sort();
  const reeksen = alleTags.filter((t) => [0, 1, 2, 3, 4, 5, 6, 7].every((s) => fs.existsSync(bestand(t, s, 'box'))));
  const kort = (t) => `d${JSON.parse(fs.readFileSync(path.join(UIT, t, `${kant}-0`, 'instellingen.json'))).instellingen.denoise.toFixed(2).replace('.', ',')}`;
  // de varianten: D, en per reeks box en detail
  const varianten = [{ k: 'D', naam: 'A: procedureel (wiel D)', van: (s) => Dvan(s) }];
  for (const t of reeksen) for (const soort of ['box', 'detail']) {
    varianten.push({ k: `${t}|${soort}`, naam: `B: SDXL ${kort(t)}, ${soort === 'box' ? 'box' : 'detailbehoudend'}`, van: (s) => lees(s === 8 ? bestand(`${t}-opnieuw`, 0, soort) : bestand(t, s, soort)), t, soort });
  }
  const lijst = [];
  const metNegen = reeksen.every((t) => fs.existsSync(bestand(`${t}-opnieuw`, 0, 'box')));
  for (const s of reeksen.length ? [0, 1, 2, 3, 4, 5, 6, 7, ...(metNegen ? [8] : [])] : [0]) {
    const R = HS.render(kant, s, s === 0 || s === 4);
    const G = S.gbuffer(R, 2, ij.stijlen.kunst);
    const beelden = {};
    for (const v of varianten) beelden[v.k] = v.van(s);
    lijst.push({ G, beelden, nagels4: HS.nagelKoppen4(R), nagels: new Set(R.nagels) });
  }
  const { G, nagels } = lijst[0];
  const doel = HS.doelOpMaat(ij.hoogte);
  const doelK = H.alfaSnij(doel, H.uitsnede([doel], 4));
  const doel4 = HS.doelOpMaat(ij.hoogte * 4);
  const doel4K = H.alfaSnij(doel4, H.uitsnede([doel4], 16));
  const eerste = (k) => lijst[0].beelden[k];
  // het doek van de AI: het vak van het wiel, op de helft (zo is het wiel zo'n 400 pixels hoog, net als de rest)
  const aiDoek = (t) => {
    const m = path.join(UIT, t, `${kant}-0`);
    const [ox, oy] = JSON.parse(fs.readFileSync(path.join(m, 'instellingen.json'))).plek;
    return A.verklein(H.snij(leesAi(path.join(m, 'ai.png')), { x0: ox, y0: oy, b: u.b * Z, h: u.h * Z }, 1, [40, 40, 44]), (u.b * Z) / 2, (u.h * Z) / 2);
  };
  // 1. het vergelijkingsvel
  const detailVarianten = varianten.filter((v) => v.soort === 'detail');
  const rij1 = [E.met(opGrond(doel4K), 'doel: het ChatGPT-wiel'), E.met(groot(opGrond(knip(eerste('D'))), 4), varianten[0].naam),
    ...detailVarianten.map((v) => E.met(groot(opGrond(knip(eerste(v.k))), 4), v.naam)),
    ...reeksen.slice(-1).map((t) => E.met(aiDoek(t), `B: wat SDXL ${kort(t)} tekende (het doek, op de helft)`))];
  const rij2 = [E.met(opGrond(doelK), 'doel'), ...varianten.map((v) => E.met(opGrond(knip(eerste(v.k))), v.k === 'D' ? 'A' : `B ${kort(v.t)} ${v.soort}`))];
  const rij3 = [E.met(groot(opGrond(doelK), 3), 'doel'), ...varianten.map((v) => E.met(groot(opGrond(knip(eerste(v.k))), 3), v.k === 'D' ? 'A: wiel D' : `B: SDXL ${kort(v.t)}, ${v.soort === 'box' ? 'box' : 'detail'}`))];
  E.bewaar(path.join(UIT, 'vergelijking.png'), [rij1, rij2, rij3], 'De AI-afwerking: het doel, wiel D en SDXL',
    'Zuidwest, stand 0. Rij 1 op dezelfde zichtbare grootte (het wiel 400 pixels hoog; onze sprites van 2× maal 4). Rij 2 op 1920×1080 (één spritepixel is één schermpixel), rij 3 dat maal 3. Box: per spritepixel het gemiddelde van zijn 8 × 8; detail: een lijn of glimlicht in het blok wint. C (FLUX Kontext) is niet gedraaid: zie het verslag.');
  // 2. de matrix: elke instelling naar zuidwest, stand 0
  const matrixMaten = {};
  const rijen = [];
  for (const t of alleTags) {
    const i = JSON.parse(fs.readFileSync(path.join(UIT, t, `${kant}-0`, 'instellingen.json')));
    const o = i.instellingen;
    const box = lees(bestand(t, 0, 'box'));
    const det = fs.existsSync(bestand(t, 0, 'detail')) ? lees(bestand(t, 0, 'detail')) : box;
    matrixMaten[t] = { instellingen: o, seconden: i.seconden, controle: i.controle, box: spriteMaten(box, G, nagels), detail: spriteMaten(det, G, nagels) };
    const titel = `denoise ${komma(o.denoise)} · IP ${komma(o.ip)} ${o.ipSoort}${o.voorbeeld === 'heel' ? ' · het hele ChatGPT-beeld' : ''} · lijnen ${komma(o.lijn)} · diepte ${komma(o.diepte)}`;
    rijen.push([E.met(aiDoek(t), titel), E.met(groot(opGrond(knip(box)), 4), `box · vorm ${komma(i.controle.silhouet.overlap)}% · spaken ${i.controle.spaken.ai.spaken.join('/')}`), E.met(groot(opGrond(knip(det)), 4), 'detailbehoudend')]);
  }
  E.bewaar(path.join(UIT, 'matrix.png'), rijen, 'SDXL: de instellingen naast elkaar', 'Zuidwest, stand 0, seed 180. Links wat SDXL tekende (op de helft), dan de sprite op 2× (maal 4), met box en detailbehoudend verkleind.');
  // 3. het draaien: D en de detailbehoudende reeksen naast elkaar, acht standen (maal 3)
  if (lijst.length >= 8) {
    const frames = lijst.slice(0, 8).map((x) => H.naastElkaar([groot(opGrond(knip(x.beelden.D)), 3), ...detailVarianten.map((v) => groot(opGrond(knip(x.beelden[v.k])), 3))], 1 + detailVarianten.length));
    fs.writeFileSync(path.join(UIT, 'draaien.png'), apng(frames.map((r) => ({ b: r.b, h: r.h, rgba: () => r.rgba })), { fps: 6 }));
  }
  // 4. de metingen
  const negen = lijst.length === 9 ? lijst : null;
  const per = {};
  for (const v of varianten) {
    const r = eerste(v.k);
    const ont = HS.ontleedWiel(knip(r));
    per[v.k] = {
      naam: v.naam,
      ontleding: ont,
      kleurVerschilTegenDoel: null,
      ...spriteMaten(r, G, nagels),
      beweging: negen ? HS.meet(negen, v.k, ij, kant) : null,
    };
  }
  const doelOnt = HS.ontleedWiel(doel);
  for (const v of varianten) per[v.k].kleurVerschilTegenDoel = Object.fromEntries(['hout', 'ijzer'].map((m) => [m, deltaE(per[v.k].ontleding.materiaal[m].gem, doelOnt.materiaal[m].gem)]));
  const reeksMaten = {};
  for (const t of reeksen) {
    const p = [0, 1, 2, 3, 4, 5, 6, 7].map((s) => JSON.parse(fs.readFileSync(path.join(UIT, t, `${kant}-${s}`, 'instellingen.json'))));
    reeksMaten[t] = {
      seconden: p.map((x) => x.seconden),
      controles: p.map((x) => x.controle),
      reproduceerbaar: metNegen ? {
        ai: gelijkheid(leesAi(path.join(UIT, t, `${kant}-0`, 'ai.png')), leesAi(path.join(UIT, `${t}-opnieuw`, `${kant}-0`, 'ai.png'))),
        sprite: gelijkheid(lees(bestand(t, 0, 'box')), lees(bestand(`${t}-opnieuw`, 0, 'box'))),
        seconden: JSON.parse(fs.readFileSync(path.join(UIT, `${t}-opnieuw`, `${kant}-0`, 'instellingen.json'))).seconden,
      } : null,
    };
  }
  const uit = { doel: { ontleding: doelOnt, detail: detailVan(doelK) }, varianten: per, reeksen: reeksMaten, matrix: matrixMaten };
  fs.writeFileSync(path.join(UIT, 'metingen.json'), JSON.stringify(uit, null, 1));
  console.log(`doel: detail ${uit.doel.detail}`);
  for (const [k, m] of Object.entries(per)) {
    const b = m.beweging;
    console.log(`${k}: kleur ${JSON.stringify(m.kleurVerschilTegenDoel)} herkend ${JSON.stringify(m.herkend)} detail ${m.detail} nagels ${m.nagels.zichtbaar}/${m.nagels.koppen}${b ? ` | flikkeren ${b.flikkeren.deel} glim ${b.glimlichtWissel} lijn ${b.lijnWissel} volle slag ${b.volleSlag}% verspringen ${b.verspringen}` : ''}`);
  }
  for (const [t, m] of Object.entries(reeksMaten)) console.log(t, JSON.stringify(m.reproduceerbaar), 's', m.seconden.join(' '), 'vorm', m.controles.map((c) => c.silhouet.overlap).join(' '), 'spaken', m.controles.map((c) => c.spaken.ai.spaken.join('/')).join(' '));
  for (const [t, m] of Object.entries(matrixMaten)) console.log(t, m.seconden, 's', JSON.stringify(m.controle.silhouet), m.controle.spaken.ai.spaken.join('/'), 'spikkels', m.controle.spaken.ai.spikkels, '| box detail', m.box.detail, 'nagels', `${m.box.nagels.zichtbaar}/${m.box.nagels.koppen}`, '| detail detail', m.detail.detail, 'nagels', `${m.detail.nagels.zichtbaar}/${m.detail.nagels.koppen}`);
  console.log('uit/ai/afwerking/vergelijking.png, matrix.png, draaien.png, metingen.json');
}

module.exports = { werkstroom, invoer, terug, spakenTel, eenBeeld, stijlUpload, uitsnedeVan, gelijkheid, deltaE, spriteMaten, detailVan, START, MODELLEN, POSITIEF, NEGATIEF, UIT, Z, tagVan };

if (require.main === module) main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
