// Het detail van een beeld-AI over onze eigen modellen (werklijst vraag 180, W2; Marcel, 18 okt: "DAT is wat ik wil voor
// alles", en "Via internet (OpenAI)"). Onze 3D-modellen (gereedschap/pixelart) blijven het skelet: de vorm, de kant en de
// houding, beeld voor beeld. De beeld-AI krijgt per beeld onze render als leidraad en Marcels plaat
// (ontwerp/voorbeelden/heerstoet-doel.webp) als stijl, en tekent het detail; daarna brengt `naarPixels` het terug naar de
// maat van het spel, met een vaste set kleuren en een donkere omlijning, zodat het pixel art in één stijl wordt.
//
// De sleutel staat buiten de opslag: in de omgeving als OPENAI_API_KEY, of in het bestand .openai-sleutel in de thuismap
// (werklijst, vraag 180). Dit script leest hem alleen om hem naar api.openai.com te sturen, en zet hem nergens neer.
//
//   node gereedschap/ai/beeld-ai.cjs modellen   welke beeldmodellen de sleutel mag gebruiken
//   node gereedschap/ai/beeld-ai.cjs droog      de proef zonder de AI: de leidraden en de weg terug naar pixels
//   node gereedschap/ai/beeld-ai.cjs proef      de proef: de wagen van de heer van twee kanten, en acht loopbeelden
//
// Alles komt in gereedschap/pixelart/uit/ai/ (niet in git).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const O = require('../pixelart/ossenkar.cjs');
const { windVoor } = require('../pixelart/heerstoet.cjs');

const UIT = path.join(__dirname, '..', 'pixelart', 'uit', 'ai');
const STIJL = path.join(__dirname, '..', '..', 'ontwerp', 'voorbeelden', 'heerstoet-doel.webp');
// De modellen in volgorde van voorkeur; `modellen` zegt welke de sleutel echt heeft. De namen verschillen per bron
// (18 okt 2026: gpt-image-2, en in de nieuwste gids van OpenAI gpt-image-2.5-...), dus het script kiest wat er is.
const VOORKEUR = ['gpt-image-2.5-sunburst', 'gpt-image-2.5-flare', 'gpt-image-2', 'gpt-image-1.5', 'gpt-image-1'];
const LEIDRAAD_MAAL = 4; // onze render zo vaak vergroot (de AI wil groot, onze beelden zijn klein)
const ACHTERGROND = [255, 0, 255]; // een vlakke kleur om weg te halen, als het model geen doorzichtige achtergrond geeft

// ---------------------------------------------------------------- de sleutel en de aanroep

function sleutel() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim();
  const bestand = path.join(os.homedir(), '.openai-sleutel');
  if (fs.existsSync(bestand)) return fs.readFileSync(bestand, 'utf8').trim();
  throw new Error(`Geen sleutel: zet hem in ${bestand}, of in de omgeving als OPENAI_API_KEY.`);
}

async function api(pad, init = {}) {
  const r = await fetch(`https://api.openai.com/v1/${pad}`, { ...init, headers: { Authorization: `Bearer ${sleutel()}`, ...(init.headers || {}) } });
  const tekst = await r.text();
  let json = null;
  try {
    json = JSON.parse(tekst);
  } catch (e) {
    // geen json: dan zegt de tekst het
  }
  if (!r.ok) {
    const fout = new Error(`OpenAI ${r.status}: ${(json && json.error && json.error.message) || tekst.slice(0, 300)}`);
    fout.status = r.status;
    throw fout;
  }
  return json;
}

async function beeldModellen() {
  const lijst = await api('models');
  return lijst.data.map((m) => m.id).filter((id) => /image/.test(id)).sort();
}

async function kiesModel() {
  const er = await beeldModellen();
  const m = process.env.BEELD_MODEL || VOORKEUR.find((v) => er.includes(v)) || er.find((id) => /^gpt-image/.test(id));
  if (!m) throw new Error(`Geen beeldmodel voor deze sleutel (wel: ${er.join(', ') || 'niets'}).`);
  return m;
}

// Een bewerking: de beelden (het eerste houdt de AI het best vast: onze render), een opdracht, en wat er terugkomt als PNG.
// Een model dat een optie niet kent (de doorzichtige achtergrond, input_fidelity), probeert het nog eens zonder.
async function bewerk(model, beelden, opdracht, opties = {}) {
  let o = { size: 'auto', quality: 'high', background: 'transparent', output_format: 'png', ...opties };
  if (/^gpt-image-1/.test(model)) o.input_fidelity = 'high';
  for (let poging = 0; poging < 3; poging++) {
    const fd = new FormData();
    fd.append('model', model);
    fd.append('prompt', o.background === 'transparent' ? opdracht : `${opdracht} The background is one flat colour, pure magenta #FF00FF, with nothing on it.`);
    for (const k of Object.keys(o)) fd.append(k, String(o[k]));
    for (const b of beelden) fd.append('image[]', new Blob([b.data], { type: b.type }), b.naam);
    try {
      const uit = await api('images/edits', { method: 'POST', body: fd });
      return Buffer.from(uit.data[0].b64_json, 'base64');
    } catch (e) {
      const weg = Object.keys(o).find((k) => e.status === 400 && new RegExp(`\\b${k}\\b|${o[k]}`).test(e.message) && k !== 'size' && k !== 'output_format');
      if (!weg) throw e;
      console.log(`  ${model} kent ${weg}=${o[weg]} niet; opnieuw zonder`);
      o = { ...o };
      delete o[weg];
    }
  }
  throw new Error('Drie keer geweigerd.');
}

// ---------------------------------------------------------------- terug naar pixels

// Van een RGBA-beeld: alles wat geen achtergrond is (doorzichtig, of de vlakke kleur vanaf de hoeken), als masker.
function vrijstaand(b, h, rgba) {
  const masker = new Uint8Array(b * h);
  let doorzichtig = 0;
  for (let i = 0; i < b * h; i++) if (rgba[i * 4 + 3] < 128) doorzichtig++;
  if (doorzichtig > b * h * 0.05) {
    for (let i = 0; i < b * h; i++) masker[i] = rgba[i * 4 + 3] >= 128 ? 1 : 0;
    return masker;
  }
  // Geen doorzichtigheid: vul vanaf de rand wat op de kleur van de hoeken lijkt.
  const hoek = [0, b - 1, (h - 1) * b, h * b - 1].map((i) => [rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]]);
  const ref = hoek.reduce((a, c) => a.map((v, j) => v + c[j] / 4), [0, 0, 0]);
  const lijkt = (i) => Math.abs(rgba[i * 4] - ref[0]) + Math.abs(rgba[i * 4 + 1] - ref[1]) + Math.abs(rgba[i * 4 + 2] - ref[2]) < 90;
  masker.fill(1);
  const stapel = [];
  for (let x = 0; x < b; x++) stapel.push(x, (h - 1) * b + x);
  for (let y = 0; y < h; y++) stapel.push(y * b, y * b + b - 1);
  while (stapel.length) {
    const i = stapel.pop();
    if (!masker[i] || !lijkt(i)) continue;
    masker[i] = 0;
    const x = i % b;
    const y = (i - x) / b;
    if (x > 0) stapel.push(i - 1);
    if (x < b - 1) stapel.push(i + 1);
    if (y > 0) stapel.push(i - b);
    if (y < h - 1) stapel.push(i + b);
  }
  // Is de achtergrond onze vlakke kleur (magenta, die nergens in het spel zit), dan is hij overal weg, ook tussen de
  // spaken van een wiel, waar het vullen vanaf de rand niet komt.
  if (Math.abs(ref[0] - ACHTERGROND[0]) + Math.abs(ref[1] - ACHTERGROND[1]) + Math.abs(ref[2] - ACHTERGROND[2]) < 120) {
    for (let i = 0; i < b * h; i++) if (lijkt(i)) masker[i] = 0;
  }
  return masker;
}

// Kleuren tot `n` met median cut (vast, zonder toeval): elke doos wordt gedeeld langs zijn langste as.
function palet(kleuren, n) {
  let dozen = [kleuren];
  while (dozen.length < n) {
    dozen.sort((a, c) => c.length - a.length);
    const d = dozen.shift();
    if (d.length < 2) {
      dozen.push(d);
      break;
    }
    const as = [0, 1, 2].map((j) => Math.max(...d.map((k) => k[j])) - Math.min(...d.map((k) => k[j])));
    const j = as.indexOf(Math.max(...as));
    d.sort((a, c) => a[j] - c[j]);
    dozen.push(d.slice(0, d.length >> 1), d.slice(d.length >> 1));
  }
  return dozen.filter((d) => d.length).map((d) => [0, 1, 2].map((j) => Math.round(d.reduce((s, k) => s + k[j], 0) / d.length)));
}

// Het beeld van de AI terug naar de maat van het spel: uitsnijden, verkleinen tot het in `breed` × `hoog` past (elke pixel
// het gemiddelde van wat eronder valt), de kleuren tot `kleuren` (median cut), en een donkere omlijning om het geheel.
function naarPixels(png, { breed, hoog, kleuren = 48 }) {
  const { b, h, rgba } = K.leesPng(png);
  const masker = vrijstaand(b, h, rgba);
  let x0 = b, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) if (masker[y * b + x]) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  if (x1 < 0) throw new Error('Er staat niets op het beeld.');
  const schaal = Math.min(breed / (x1 - x0 + 1), hoog / (y1 - y0 + 1));
  const nb = Math.max(1, Math.round((x1 - x0 + 1) * schaal));
  const nh = Math.max(1, Math.round((y1 - y0 + 1) * schaal));
  const uit = Buffer.alloc(nb * nh * 4);
  const kleurLijst = [];
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nb; x++) {
      const sx0 = x0 + Math.floor(x / schaal), sx1 = Math.max(sx0 + 1, x0 + Math.floor((x + 1) / schaal));
      const sy0 = y0 + Math.floor(y / schaal), sy1 = Math.max(sy0 + 1, y0 + Math.floor((y + 1) / schaal));
      let r = 0, g = 0, bl = 0, n = 0, alle = 0;
      for (let sy = sy0; sy < Math.min(sy1, h); sy++) for (let sx = sx0; sx < Math.min(sx1, b); sx++) {
        alle++;
        const i = sy * b + sx;
        if (!masker[i]) continue;
        r += rgba[i * 4]; g += rgba[i * 4 + 1]; bl += rgba[i * 4 + 2]; n++;
      }
      if (n * 2 < alle) continue; // meer achtergrond dan ding: doorzichtig
      const k = [r / n, g / n, bl / n];
      uit.set([k[0], k[1], k[2], 255], (y * nb + x) * 4);
      kleurLijst.push(k);
    }
  }
  const P = palet(kleurLijst, kleuren);
  for (let i = 0; i < nb * nh; i++) {
    if (!uit[i * 4 + 3]) continue;
    let beste = P[0], afstand = Infinity;
    for (const p of P) {
      const d = (p[0] - uit[i * 4]) ** 2 + (p[1] - uit[i * 4 + 1]) ** 2 + (p[2] - uit[i * 4 + 2]) ** 2;
      if (d < afstand) { afstand = d; beste = p; }
    }
    uit.set(beste, i * 4);
  }
  // De omlijning: elke pixel aan de rand van het ding een stuk donkerder (zoals K.omlijn bij onze eigen modellen).
  const rand = [];
  for (let y = 0; y < nh; y++) for (let x = 0; x < nb; x++) {
    const i = y * nb + x;
    if (!uit[i * 4 + 3]) continue;
    const leeg = (xx, yy) => xx < 0 || yy < 0 || xx >= nb || yy >= nh || !uit[(yy * nb + xx) * 4 + 3];
    if (leeg(x - 1, y) || leeg(x + 1, y) || leeg(x, y - 1) || leeg(x, y + 1)) rand.push(i);
  }
  for (const i of rand) for (let j = 0; j < 3; j++) uit[i * 4 + j] = Math.round(uit[i * 4 + j] * 0.35);
  return { b: nb, h: nh, rgba: uit };
}

// ---------------------------------------------------------------- de leidraden: onze eigen renders

// Een plaat van de tekenstraat op een vlakke achtergrond, LEIDRAAD_MAAL keer vergroot (de AI wil groot), als PNG; en de
// maat van het ding zelf, waar het beeld van de AI straks weer naartoe gaat.
function leidraad(plaat) {
  const k = O.kader(plaat);
  const rand = 6;
  const b = k.x1 - k.x0 + 1 + 2 * rand;
  const h = k.y1 - k.y0 + 1 + 2 * rand;
  const bron = plaat.rgba(`#${ACHTERGROND.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
  const Z = LEIDRAAD_MAAL;
  const groot = Buffer.alloc(b * Z * h * Z * 4);
  for (let y = 0; y < h * Z; y++) for (let x = 0; x < b * Z; x++) {
    const sx = Math.min(plaat.b - 1, Math.max(0, k.x0 - rand + Math.floor(x / Z)));
    const sy = Math.min(plaat.h - 1, Math.max(0, k.y0 - rand + Math.floor(y / Z)));
    const s = (sy * plaat.b + sx) * 4;
    groot.set(bron.subarray(s, s + 4), (y * b * Z + x) * 4);
  }
  return { png: K.pngVanBeeld({ b: b * Z, h: h * Z, rgba: groot }), breed: k.x1 - k.x0 + 1, hoog: k.y1 - k.y0 + 1 };
}

const wagen = (kant, o = {}) => O.beeld({ lading: 'buit', bak: 'heer', wind: windVoor(kant), blink: 0, ...o }, kant);

const OPDRACHT = 'Image 1 is a rough 3D render of one sprite for an isometric medieval strategy game: an ox pulling a ' +
  "two-wheeled wooden cart loaded with loot (sacks of grain, a barrel, logs, an open chest of gold), the cart painted red " +
  'with a yellow trim, with a small red and yellow pennant on a pole. Repaint image 1 in the exact art style of image 2: ' +
  'highly detailed HD pixel art with rich texture (wood grain, iron fittings, rope, cloth, the hide and muscles of the ox), ' +
  'realistic anatomy, strong contrast, dark outlines, warm light from the top left, and the golden lion of image 2 on the ' +
  'red panels. Keep exactly the object, silhouette, proportions, position, orientation, camera angle and pose of image 1: ' +
  'do not move, rotate, crop or add anything, and draw no ground.';

// ---------------------------------------------------------------- de proef

async function proef(droog) {
  fs.mkdirSync(UIT, { recursive: true });
  const stijl = { naam: 'stijl.webp', type: 'image/webp', data: fs.readFileSync(STIJL) };
  const model = droog ? '(droog)' : await kiesModel();
  console.log(`model: ${model}`);
  const stukken = [
    ...['ZW', 'NO'].map((kant) => ({ naam: `wagen-${kant.toLowerCase()}`, plaat: wagen(kant) })),
    ...Array.from({ length: 8 }, (_, i) => ({ naam: `lopen-zw-${i}`, plaat: wagen('ZW', { houding: 'lopen', fase: i / 8 }) })),
  ];
  let eerste = null; // het eerste loopbeeld van de AI: de volgende krijgen het mee, voor dezelfde os
  for (const s of stukken) {
    const l = leidraad(s.plaat);
    fs.writeFileSync(path.join(UIT, `${s.naam}-leidraad.png`), l.png);
    let ai = l.png; // droog: onze eigen render, om de weg terug naar pixels te zien
    if (!droog) {
      const beelden = [{ naam: 'leidraad.png', type: 'image/png', data: l.png }, stijl];
      if (eerste && s.naam.startsWith('lopen')) beelden.push({ naam: 'eerder.png', type: 'image/png', data: eerste });
      const opdracht = OPDRACHT + (beelden.length > 2 ? ' Image 3 is the same ox and cart already repainted: match it exactly, only the pose differs.' : '');
      console.log(`${s.naam}: naar ${model}…`);
      ai = await bewerk(model, beelden, opdracht);
      if (s.naam === 'lopen-zw-0') eerste = ai;
    }
    fs.writeFileSync(path.join(UIT, `${s.naam}-ai.png`), ai);
    const p = naarPixels(ai, { breed: l.breed, hoog: l.hoog });
    fs.writeFileSync(path.join(UIT, `${s.naam}-pixels.png`), K.pngVanBeeld(p));
    console.log(`${s.naam}: ${p.b}×${p.h} (onze render ${l.breed}×${l.hoog})`);
  }
  console.log(`Klaar: ${path.relative(process.cwd(), UIT)}`);
}

async function main() {
  const wat = process.argv[2];
  if (wat === 'modellen') console.log((await beeldModellen()).join('\n'));
  else if (wat === 'droog') await proef(true);
  else if (wat === 'proef') await proef(false);
  else console.log('node gereedschap/ai/beeld-ai.cjs modellen | droog | proef');
}

if (require.main === module) main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

module.exports = { naarPixels, leidraad, bewerk, kiesModel, beeldModellen };
