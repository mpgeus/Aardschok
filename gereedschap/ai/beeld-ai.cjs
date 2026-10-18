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
const LEIDRAAD_RAND = 6; // zoveel pixels ruimte om het ding in de leidraad
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

// Een PNG lezen zoals een beeld-AI of ChatGPT hem geeft: 8 bits per kanaal, grijs, RGB, palet of met alfa, zonder
// interlace (K.leesPng kent alleen RGBA, wat de tekenstraat zelf schrijft). Geeft { b, h, rgba }.
function leesPng(buf) {
  const zlib = require('zlib');
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('Geen PNG (sla het beeld op als PNG).');
  let p = 8, b = 0, h = 0, diepte = 0, soort = 0, interlace = 0, palet = null, trns = null;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      b = d.readUInt32BE(0); h = d.readUInt32BE(4); diepte = d[8]; soort = d[9]; interlace = d[12];
    } else if (type === 'PLTE') palet = d;
    else if (type === 'tRNS') trns = d;
    else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (diepte !== 8 || interlace) throw new Error(`Deze PNG kan ik niet lezen (${diepte} bits, interlace ${interlace}).`);
  const kanalen = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[soort];
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const rij = b * kanalen;
  const pix = Buffer.alloc(rij * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (rij + 1)];
    for (let x = 0; x < rij; x++) {
      const a = x >= kanalen ? pix[y * rij + x - kanalen] : 0;
      const c = y > 0 ? pix[(y - 1) * rij + x] : 0;
      const ac = y > 0 && x >= kanalen ? pix[(y - 1) * rij + x - kanalen] : 0;
      let v = raw[y * (rij + 1) + 1 + x];
      if (f === 1) v += a;
      else if (f === 2) v += c;
      else if (f === 3) v += (a + c) >> 1;
      else if (f === 4) {
        const pp = a + c - ac;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - c), pc = Math.abs(pp - ac);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? c : ac;
      }
      pix[y * rij + x] = v & 255;
    }
  }
  const rgba = Buffer.alloc(b * h * 4);
  for (let i = 0; i < b * h; i++) {
    const s = i * kanalen;
    let k;
    if (soort === 6) k = [pix[s], pix[s + 1], pix[s + 2], pix[s + 3]];
    else if (soort === 2) k = [pix[s], pix[s + 1], pix[s + 2], 255];
    else if (soort === 4) k = [pix[s], pix[s], pix[s], pix[s + 1]];
    else if (soort === 0) k = [pix[s], pix[s], pix[s], 255];
    else k = [palet[pix[s] * 3], palet[pix[s] * 3 + 1], palet[pix[s] * 3 + 2], trns && pix[s] < trns.length ? trns[pix[s]] : 255];
    rgba.set(k, i * 4);
  }
  return { b, h, rgba };
}

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
  const { b, h, rgba } = leesPng(png);
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
  return kleurEnRand({ b: nb, h: nh, rgba: uit }, kleurLijst, kleuren);
}

// De kleuren tot `kleuren` (median cut), en een donkere omlijning om het geheel (zoals K.omlijn bij onze eigen modellen).
function kleurEnRand(beeld, kleurLijst, kleuren) {
  const { b: nb, h: nh, rgba: uit } = beeld;
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

// Het beeld van de AI terug naar pixels met de omtrek van onze eigen render (`plaat`, en zijn kader `k`): voor wat precies
// over de leidraad ligt (ComfyUI tekent op dezelfde verhouding; ChatGPT niet altijd, dat gaat met naarPixels). Verkleind tot
// de maat van de leidraad (het kader met LEIDRAAD_RAND eromheen), de rand eraf, en alleen waar onze render iets heeft (een
// pixel ruimer gaf een roze randje van de achtergrond): zo hangt er geen achtergrond aan, ook niet tussen de spaken. Dezelfde kleuren en omlijning als naarPixels.
function naarPixelsMetVorm(png, plaat, k, { kleuren = 48 } = {}) {
  const ai = leesPng(png);
  const kb = k.x1 - k.x0 + 1, kh = k.y1 - k.y0 + 1;
  const R = LEIDRAAD_RAND;
  const klein = verklein(ai, kb + 2 * R, kh + 2 * R);
  const ons = plaat.rgba(null);
  const heeft = (x, y) => x >= 0 && y >= 0 && x < plaat.b && y < plaat.h && ons[(y * plaat.b + x) * 4 + 3] >= 128;
  const uit = Buffer.alloc(kb * kh * 4);
  const kleurLijst = [];
  for (let y = 0; y < kh; y++) for (let x = 0; x < kb; x++) {
    const px = k.x0 + x, py = k.y0 + y;
    if (!heeft(px, py)) continue;
    const s = ((y + R) * klein.b + x + R) * 4;
    const kl = [klein.rgba[s], klein.rgba[s + 1], klein.rgba[s + 2]];
    uit.set([...kl, 255], (y * kb + x) * 4);
    kleurLijst.push(kl);
  }
  return kleurEnRand({ b: kb, h: kh, rgba: uit }, kleurLijst, kleuren);
}

// ---------------------------------------------------------------- de leidraden: onze eigen renders

// Een plaat van de tekenstraat op een vlakke achtergrond, LEIDRAAD_MAAL keer vergroot (de AI wil groot), als PNG; en de
// maat van het ding zelf, waar het beeld van de AI straks weer naartoe gaat.
function leidraad(plaat) {
  const k = O.kader(plaat);
  const rand = LEIDRAAD_RAND;
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

// ---------------------------------------------------------------- de proef met de hand (zonder sleutel)

// Marcel sleept de leidraden met zijn plaat in ChatGPT, en zet de antwoorden als PNG in uit/ai/hand/, met de naam van hun
// leidraad (wagen-zw.png, lopen-zw-0.png, ...; werklijst vraag 180). Dit maakt er pixel art van, op de plek en in de maat
// van onze render, en zet alles naast elkaar: uit/ai/hand-proef.png (onze render, het antwoord, de pixels), en van de
// loopbeelden uit/ai/hand-lopen.png en uit/ai/hand-lopen-onze.png (bewegend, om te zien of het flikkert).
const leeg = (b, h) => ({ b, h, rgba: Buffer.alloc(b * h * 4) });
function plakOp(doel, bron, ox, oy) {
  for (let y = 0; y < bron.h; y++) for (let x = 0; x < bron.b; x++) {
    const s = (y * bron.b + x) * 4;
    const dx = ox + x, dy = oy + y;
    if (bron.rgba[s + 3] < 128 || dx < 0 || dy < 0 || dx >= doel.b || dy >= doel.h) continue;
    bron.rgba.copy(doel.rgba, (dy * doel.b + dx) * 4, s, s + 4);
  }
}
function vergroot(bron, Z) {
  const uit = leeg(bron.b * Z, bron.h * Z);
  for (let y = 0; y < uit.h; y++) for (let x = 0; x < uit.b; x++) {
    const s = (Math.floor(y / Z) * bron.b + Math.floor(x / Z)) * 4;
    bron.rgba.copy(uit.rgba, (y * uit.b + x) * 4, s, s + 4);
  }
  return uit;
}
// Verkleinen om te bekijken (het antwoord van de AI is groot): elke pixel het gemiddelde van wat eronder valt.
function verklein(bron, nb, nh) {
  const uit = leeg(nb, nh);
  for (let y = 0; y < nh; y++) for (let x = 0; x < nb; x++) {
    const s = [0, 0, 0, 0];
    let n = 0;
    for (let sy = Math.floor((y * bron.h) / nh); sy < Math.max(Math.floor((y * bron.h) / nh) + 1, Math.floor(((y + 1) * bron.h) / nh)); sy++) {
      for (let sx = Math.floor((x * bron.b) / nb); sx < Math.max(Math.floor((x * bron.b) / nb) + 1, Math.floor(((x + 1) * bron.b) / nb)); sx++) {
        for (let j = 0; j < 4; j++) s[j] += bron.rgba[(sy * bron.b + sx) * 4 + j];
        n++;
      }
    }
    uit.rgba.set(s.map((v) => Math.round(v / n)), (y * nb + x) * 4);
  }
  return uit;
}
// Onze render van een naam (wagen-zw, lopen-zw-4): dezelfde plaat als zijn leidraad.
function renderVan(naam) {
  const m = /^(wagen|lopen)-(zw|no)(?:-(\d))?$/.exec(naam);
  if (!m) return null;
  return wagen(m[2].toUpperCase(), m[1] === 'lopen' ? { houding: 'lopen', fase: Number(m[3]) / 8 } : {});
}

function hand(map = process.env.HAND_MAP || path.join(UIT, 'hand'), voor = 'hand', metVorm = false) { // HAND_MAP: om het gereedschap zelf te toetsen
  // Windows verbergt de extensie, dus heet een download soms wagen-zw.png.png: de naam is wat ervoor staat.
  const bestanden = fs.existsSync(map) ? fs.readdirSync(map).filter((f) => /\.png$/i.test(f)) : [];
  const bestandVan = new Map(bestanden.map((f) => [f.replace(/(\.png)+$/i, ''), f]));
  const namen = [...bestandVan.keys()].sort();
  if (!namen.length) throw new Error(`Nog niets in ${map}: zet daar de antwoorden van ChatGPT, als wagen-zw.png, lopen-zw-0.png, ...`);
  const rijen = [];
  const lopen = [];
  for (const naam of namen) {
    const plaat = renderVan(naam);
    if (!plaat) {
      console.log(`${naam}: geen leidraad met die naam, overgeslagen`);
      continue;
    }
    const k = O.kader(plaat);
    const kb = k.x1 - k.x0 + 1, kh = k.y1 - k.y0 + 1;
    const png = fs.readFileSync(path.join(map, bestandVan.get(naam)));
    const p = metVorm ? naarPixelsMetVorm(png, plaat, k) : naarPixels(png, { breed: kb, hoog: kh });
    // Op de plek van onze render: onderaan in het midden van zijn kader, in een cel zo groot als de plaat.
    const cel = leeg(plaat.b, plaat.h);
    plakOp(cel, p, k.x0 + Math.floor((kb - p.b) / 2), k.y1 + 1 - p.h);
    const onze = { b: plaat.b, h: plaat.h, rgba: plaat.rgba(null) };
    const ai = leesPng(png);
    const toon = verklein(ai, Math.round((ai.b * 260) / ai.h), 260);
    const snij = (bron) => {
      const s = leeg(kb + 8, kh + 8);
      for (let y = 0; y < s.h; y++) for (let x = 0; x < s.b; x++) {
        const sx = k.x0 - 4 + x, sy = k.y0 - 4 + y;
        if (sx >= 0 && sy >= 0 && sx < bron.b && sy < bron.h) bron.rgba.copy(s.rgba, (y * s.b + x) * 4, (sy * bron.b + sx) * 4, (sy * bron.b + sx) * 4 + 4);
      }
      return vergroot(s, 2);
    };
    rijen.push(Object.assign([snij(onze), toon, snij(cel)], { naam }));
    if (naam.startsWith('lopen')) lopen.push({ cel, onze });
    console.log(`${naam}: ${p.b}×${p.h} (onze render ${kb}×${kh})`);
  }
  // De plaat: per beeld een rij (onze render, het antwoord, de pixels), met opschriften (Marcel, 18 okt: "graag even
  // markeren"): wie het maakte, en per vakje wat het is.
  const MAKER = { hand: 'ChatGPT (met de hand)', lokaal: 'SDXL lokaal (sd_xl_base_1.0, ControlNet union, IP-Adapter Plus)' };
  const wie = MAKER[voor] || voor;
  const E = require('./etiket.cjs');
  E.bewaar(path.join(UIT, `${voor}-proef.png`), rijen.map((r, i) => [E.met(r[0], `${r.naam} · onze render`), E.met(r[1], wie), E.met(r[2], 'in de maat van het spel')]),
    `${wie}: de wagen van de heer`, 'Per rij: onze render, het antwoord van de AI, en terug in de maat van het spel (twee keer vergroot).');
  // De loopbeelden bewegend, ons en dat van de AI (vier van de acht: op de helft van de snelheid van de os).
  if (lopen.length > 1) {
    const { apng } = require('../pixelart/apng.cjs');
    const alsPlaat = (r) => ({ b: r.b, h: r.h, rgba: () => r.rgba });
    const fps = require('../pixelart/vee.cjs').LOOP_FPS.os / 2;
    fs.writeFileSync(path.join(UIT, `${voor}-lopen.png`), apng(lopen.map((l) => alsPlaat(l.cel)), { fps, schaal: 2, achtergrond: '#465238' }));
    fs.writeFileSync(path.join(UIT, `${voor}-lopen-onze.png`), apng(lopen.map((l) => alsPlaat(l.onze)), { fps, schaal: 2, achtergrond: '#465238' }));
  }
  console.log(`Klaar: uit/ai/${voor}-proef.png${lopen.length > 1 ? `, ${voor}-lopen.png en ${voor}-lopen-onze.png` : ''}`);
}

// ---------------------------------------------------------------- lokaal, met ComfyUI (vraag 180, fase 1)

// ComfyUI draait op Marcels eigen pc (C:\ComfyUI, `run_nvidia_gpu.bat`), op 127.0.0.1:8188: geen sleutel, niets gaat het
// huis uit. Per beeld: onze render is het begin (img2img, `ruis` bepaalt hoeveel de AI mag veranderen), ControlNet (union,
// canny) houdt de randen van onze render vast, en IP-Adapter neemt de stijl van Marcels plaat over. De modellen en hun
// namen staan in C:\ComfyUI\...\models (werklijst vraag 180). Het antwoord gaat door dezelfde weg terug naar pixels als de
// proef met de hand: uit/ai/lokaal/<naam>.png, en de plaat uit/ai/lokaal-proef.png.
const COMFY = process.env.COMFY || 'http://127.0.0.1:8188';
const LOKAAL = {
  model: 'sd_xl_base_1.0.safetensors',
  controlnet: 'controlnet-union-sdxl-promax.safetensors',
  ipadapter: 'ip-adapter-plus_sdxl_vit-h.safetensors',
  clipVision: 'CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors',
  breed: 1024, // de kant waarop de AI tekent (SDXL tekent het best rond 1024)
  stappen: 28,
  cfg: 6,
  ruis: 0.75, // img2img: 0 is onze render, 1 is alles opnieuw
  vorm: 0.55, // hoe sterk ControlNet de randen vasthoudt (te sterk, en de os blijft zo blokkig als ons model)
  vormTot: 0.6, // tot hoever in het tekenen ControlNet meedoet; daarna mag de AI de vorm verfijnen
  stijl: 1.0, // hoe sterk IP-Adapter de stijl van de plaat neemt
  stijlSoort: 'strong style transfer',
  // Het stuk van Marcels plaat (1211 bij 1299) waar de stijl vandaan komt: de wagen van zuidwest, zonder de paarden en de
  // soldaten eromheen.
  uitsnede: { x: 40, y: 330, b: 580, h: 360 },
  zaad: 180,
};
const POSITIEF = 'highly detailed HD pixel art sprite for an isometric medieval strategy game, a white ox pulling a two-wheeled ' +
  'red painted wooden cart loaded with tan sacks of grain, a barrel, brown logs and an open chest of gold coins, yellow trim and a ' +
  'golden heraldic lion on the red panels, red and yellow pennant, leather harness with brass fittings, rich texture, wood ' +
  'grain, iron fittings, realistic anatomy, strong contrast, dark outlines, warm light from the top left, plain magenta background';
const NEGATIEF = 'blurry, photo, 3d render, smooth plastic, text, watermark, signature, ground, grass, shadow on the ground, ' +
  'extra animals, extra wheels, cropped, frame, border';

async function comfy(pad, init) {
  const r = await fetch(`${COMFY}/${pad}`, init);
  if (!r.ok) throw new Error(`ComfyUI ${r.status} bij ${pad}: ${(await r.text()).slice(0, 400)}`);
  return r;
}
async function upload(naam, data, type) {
  const fd = new FormData();
  fd.append('image', new Blob([data], { type }), naam);
  fd.append('overwrite', 'true');
  return (await (await comfy('upload/image', { method: 'POST', body: fd })).json()).name;
}

// De werkstroom (de API-vorm van ComfyUI: knopen met hun invoer). Breed en hoog: veelvouden van 8.
function werkstroom(leidraad, stijl, b, h, o = LOKAAL) {
  return {
    1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: o.model } },
    2: { class_type: 'LoadImage', inputs: { image: leidraad } },
    3: { class_type: 'ImageScale', inputs: { image: ['2', 0], upscale_method: 'nearest-exact', width: b, height: h, crop: 'disabled' } },
    4: { class_type: 'VAEEncode', inputs: { pixels: ['3', 0], vae: ['1', 2] } },
    5: { class_type: 'CLIPTextEncode', inputs: { text: POSITIEF, clip: ['1', 1] } },
    6: { class_type: 'CLIPTextEncode', inputs: { text: NEGATIEF, clip: ['1', 1] } },
    7: { class_type: 'Canny', inputs: { image: ['3', 0], low_threshold: 0.2, high_threshold: 0.5 } },
    8: { class_type: 'ControlNetLoader', inputs: { control_net_name: o.controlnet } },
    9: { class_type: 'SetUnionControlNetType', inputs: { control_net: ['8', 0], type: 'canny/lineart/anime_lineart/mlsd' } },
    10: { class_type: 'ControlNetApplyAdvanced', inputs: { positive: ['5', 0], negative: ['6', 0], control_net: ['9', 0], image: ['7', 0], strength: o.vorm, start_percent: 0, end_percent: o.vormTot, vae: ['1', 2] } },
    11: { class_type: 'LoadImage', inputs: { image: stijl } },
    18: { class_type: 'ImageCrop', inputs: { image: ['11', 0], width: o.uitsnede.b, height: o.uitsnede.h, x: o.uitsnede.x, y: o.uitsnede.y } },
    12: { class_type: 'IPAdapterModelLoader', inputs: { ipadapter_file: o.ipadapter } },
    13: { class_type: 'CLIPVisionLoader', inputs: { clip_name: o.clipVision } },
    14: { class_type: 'IPAdapterAdvanced', inputs: { model: ['1', 0], ipadapter: ['12', 0], image: ['18', 0], clip_vision: ['13', 0], weight: o.stijl, weight_type: o.stijlSoort, combine_embeds: 'concat', start_at: 0, end_at: 1, embeds_scaling: 'V only' } },
    15: { class_type: 'KSampler', inputs: { model: ['14', 0], positive: ['10', 0], negative: ['10', 1], latent_image: ['4', 0], seed: o.zaad, steps: o.stappen, cfg: o.cfg, sampler_name: 'dpmpp_2m', scheduler: 'karras', denoise: o.ruis } },
    16: { class_type: 'VAEDecode', inputs: { samples: ['15', 0], vae: ['1', 2] } },
    17: { class_type: 'SaveImage', inputs: { images: ['16', 0], filename_prefix: 'tithebreaker' } },
  };
}

async function tekenLokaal(leidraadPng, stijlNaam, b, h) {
  const leidraad = await upload('leidraad.png', leidraadPng, 'image/png');
  const { prompt_id: id } = await (await comfy('prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: werkstroom(leidraad, stijlNaam, b, h) }) })).json();
  for (;;) {
    await new Promise((r) => setTimeout(r, 2000));
    const geschiedenis = await (await comfy(`history/${id}`)).json();
    const g = geschiedenis[id];
    if (!g) continue;
    if (g.status && g.status.status_str === 'error') throw new Error(`ComfyUI: ${JSON.stringify(g.status.messages).slice(0, 600)}`);
    const beeld = Object.values(g.outputs || {}).flatMap((o) => o.images || [])[0];
    if (!beeld) continue;
    const q = new URLSearchParams({ filename: beeld.filename, subfolder: beeld.subfolder || '', type: beeld.type || 'output' });
    return Buffer.from(await (await comfy(`view?${q}`)).arrayBuffer());
  }
}

async function lokaal() {
  const map = path.join(UIT, 'lokaal');
  fs.mkdirSync(map, { recursive: true });
  const stijl = await upload('heerstoet-doel.webp', fs.readFileSync(STIJL), 'image/webp');
  const namen = (process.argv[3] || 'wagen-zw,wagen-no,lopen-zw-0,lopen-zw-2,lopen-zw-4').split(',');
  for (const naam of namen) {
    const l = leidraad(renderVan(naam));
    const { b, h } = leesPng(l.png);
    const B = LOKAAL.breed;
    const H = Math.round((B * h) / b / 8) * 8;
    const t0 = Date.now();
    const png = await tekenLokaal(l.png, stijl, B, H);
    fs.writeFileSync(path.join(map, `${naam}.png`), png);
    console.log(`${naam}: ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  hand(map, 'lokaal', true);
}

async function main() {
  const wat = process.argv[2];
  if (wat === 'modellen') console.log((await beeldModellen()).join('\n'));
  else if (wat === 'droog') await proef(true);
  else if (wat === 'proef') await proef(false);
  else if (wat === 'hand') hand(...(process.argv[3] === 'lokaal' ? [path.join(UIT, 'lokaal'), 'lokaal', true] : [])); // `hand lokaal`: de plaat van de SDXL-proef opnieuw
  else if (wat === 'lokaal') await lokaal();
  else console.log('node gereedschap/ai/beeld-ai.cjs modellen | droog | proef | hand | lokaal [namen]');
}

if (require.main === module) main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

module.exports = { naarPixels, naarPixelsMetVorm, leidraad, bewerk, kiesModel, beeldModellen, leesPng, verklein, vergroot, plakOp, leeg, renderVan, comfy, upload, wagen, STIJL, UIT };
