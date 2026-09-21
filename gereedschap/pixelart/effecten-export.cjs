// De spreukeffecten (effecten.cjs) naar het spel: vellen in beelden/effecten/, en een
// beschrijving als script (beelden/effecten/effecten.js) die index.html laadt, zodat het ook
// vanaf file:// werkt. Om te bekijken komen er bewegende PNG's in uit/effecten/.
//
//   node gereedschap/pixelart/effecten-export.cjs
//
// Een vel is een raster van cellen: een rij per variant (een richting, een maat, gespiegeld),
// een kolom per beeld. Het anker is het punt in de cel dat het spel op de plek van het effect legt.
//
// Daarnaast meet dit script twee dingen op de vellen van de figuren zelf (beelden/figuren/),
// zodat een spreuk uit de bol op de staf komt en een zucht uit het hoofd, in elke richting en in
// elk beeld van de houding: waar de vuurpixels van de bol zitten (houding spreuk en staan), en
// waar het gezicht zit (houding staan). Verandert een figuur, draai dit dan opnieuw. Een figuur
// die er (nog) niet is, zoals de meester, krijgt vanzelf zijn plek zodra zijn vellen er zijn.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const K = require('./kern.cjs');
const E = require('./effecten.cjs');
const { apng } = require('./apng.cjs');

const WORTEL = path.join(__dirname, '..', '..');
const DOEL = path.join(WORTEL, 'beelden', 'effecten');
const UIT = path.join(__dirname, 'uit', 'effecten');
fs.mkdirSync(DOEL, { recursive: true });
fs.mkdirSync(UIT, { recursive: true });

const reeks = (n, f) => Array.from({ length: n }, (_, i) => f(i));

// ---------------------------------------------------------------- de vellen

// rijen: een lijst rijen van even grote platen. Geeft het vel.
function vel(rijen) {
  const b = rijen[0][0].b;
  const h = rijen[0][0].h;
  const kol = Math.max(...rijen.map((r) => r.length));
  const p = new K.Plaat(b * kol, h * rijen.length);
  rijen.forEach((rij, j) => rij.forEach((q, i) => p.plak(q, i * b, j * h)));
  return p;
}

const beschrijving = { vellen: {}, bronnen: {}, hoofden: {}, rampen: {} };
const bekijk = []; // [naam, platen, fps] voor uit/effecten/

function schrijf(naam, rijen, o) {
  const bestand = `${naam}.png`;
  fs.writeFileSync(path.join(DOEL, bestand), K.png(vel(rijen), 1));
  beschrijving.vellen[naam] = {
    bestand,
    cel: [rijen[0][0].b, rijen[0][0].h],
    anker: o.anker,
    beelden: rijen[0].length,
    fps: o.fps,
    ...(o.rijen ? { rijen: o.rijen } : {}),
    ...(o.ankers ? { ankers: o.ankers } : {}),
  };
  bekijk.push([naam, rijen[0], o.fps]);
}

// De kop van de vuurschicht, in zestien richtingen.
schrijf('vuurkop', reeks(E.VUURKOP.richtingen, (r) => reeks(E.VUURKOP.beelden, (i) => E.vuurkop(r, i))), {
  anker: E.VUURKOP.anker, fps: 16,
});
schrijf('vuuropbouw', [reeks(E.VUUROPBOUW.beelden, (i) => E.vuuropbouw(i))], { anker: E.VUUROPBOUW.anker, fps: 20 });
schrijf('loslaten', [reeks(E.LOSLATEN.beelden, (i) => E.loslaten(i))], { anker: E.LOSLATEN.anker, fps: 20 });
schrijf('inslag', [reeks(E.INSLAG.beelden, (i) => E.inslag(i))], { anker: E.INSLAG.anker, fps: 22 });
schrijf('vlammetje', [reeks(E.VLAMMETJE.beelden, (i) => E.vlammetje(i))], { anker: E.VLAMMETJE.anker, fps: 10 });

// Het dwaallicht: rij 0 het licht zelf, rij 1 het bolletje dat in de staf ontstaat.
const opbouwMaten = [0.3, 0.5, 0.7, 0.85];
schrijf('dwaallicht', [
  reeks(E.DWAALLICHT.beelden, (i) => E.dwaallicht(i)),
  reeks(E.DWAALLICHT.beelden, (i) => (i < opbouwMaten.length ? E.dwaallicht(0, opbouwMaten[i]) : new K.Plaat(E.DWAALLICHT.b, E.DWAALLICHT.h))),
], { anker: E.DWAALLICHT.anker, fps: 10, rijen: ['licht', 'opbouw'] });

// De zucht in drie maten. Per maat vier rijen: twee varianten, elk ook gespiegeld, zodat hij met
// de wind mee kan krullen. Gespiegeld verschuift het anker mee.
for (const maat of Object.keys(E.ZUCHT)) {
  const z = E.ZUCHT[maat];
  const rijen = [];
  const ankers = [];
  for (const variant of [0, 1]) {
    const recht = reeks(z.beelden, (i) => E.zucht(maat, i, variant));
    rijen.push(recht, recht.map(E.gespiegeld));
    ankers.push(z.oorsprong, [z.b - 1 - z.oorsprong[0], z.oorsprong[1]]);
  }
  schrijf(`zucht-${maat}`, rijen, {
    anker: z.oorsprong, fps: z.fps, ankers,
    rijen: ['a', 'a-gespiegeld', 'b', 'b-gespiegeld'],
  });
}

schrijf('stofje', [0, 1].map((v) => reeks(E.STOFJE.beelden, (i) => E.stofje(i, v))), { anker: E.STOFJE.anker, fps: 10 });
schrijf('blad', ['blad', 'herfst'].map((r) => reeks(E.BLAD.beelden, (i) => E.blad(r, i))), {
  anker: E.BLAD.anker, fps: 10, rijen: ['blad', 'herfst'],
});

// Licht op de vloer: de flits van een inslag (drie sterktes), en het schijnsel van een dwaallicht.
schrijf('lichtpoel-vuur', [reeks(3, (s) => E.lichtpoel('vuur', 5, 40, 20, s))], { anker: [40, 20], fps: 12 });
schrijf('lichtpoel-water', [reeks(2, (s) => E.lichtpoel('water', 6, 26, 13, s))], { anker: [26, 13], fps: 6 });

// De rampen die het spel voor losse pixels gebruikt (vonken, slierten, stof, de sluier van
// ouderdom, de flits van een klap), uit hetzelfde palet.
for (const r of ['vuur', 'baard', 'water', 'zand', 'blad', 'herfst', 'rood']) beschrijving.rampen[r] = K.RAMPEN[r].slice();

// ---------------------------------------------------------------- meten op de figuren

// Een PNG lezen (8 bits RGBA, zoals kern.png ze schrijft), met alle vijf de filters.
function leesPng(bestand) {
  const buf = fs.readFileSync(bestand);
  let pos = 8;
  let b = 0;
  let h = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      b = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6) throw new Error(`${bestand}: alleen 8 bits RGBA`);
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const rij = b * 4;
  const px = Buffer.alloc(b * h * 4);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (rij + 1)];
    for (let x = 0; x < rij; x++) {
      const r = raw[y * (rij + 1) + 1 + x];
      const a = x >= 4 ? px[y * rij + x - 4] : 0;
      const u = y > 0 ? px[(y - 1) * rij + x] : 0;
      const c = x >= 4 && y > 0 ? px[(y - 1) * rij + x - 4] : 0;
      let v = r;
      if (f === 1) v = r + a;
      else if (f === 2) v = r + u;
      else if (f === 3) v = r + ((a + u) >> 1);
      else if (f === 4) {
        const p = a + u - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - u);
        const pc = Math.abs(p - c);
        v = r + (pa <= pb && pa <= pc ? a : pb <= pc ? u : c);
      }
      px[y * rij + x] = v & 255;
    }
  }
  return { b, h, px };
}

const kleurSleutel = (r, g, b) => (r << 16) | (g << 8) | b;
const rampKleuren = (naam, vanaf = 0) => new Set(K.RAMP_RGB[K.RAMP[naam]].slice(vanaf).map(([r, g, b]) => kleurSleutel(r, g, b)));
const VUUR = rampKleuren('vuur', 2); // de bol op de staf; zonder de donkerste randtinten
const HUID = rampKleuren('huid');

// Het zwaartepunt van de pixels in `kleuren`, binnen één cel, als [dx, dy] vanaf het anker; of
// null als er te weinig zijn (de bol achter het lijf, of een figuur zonder bol). `strook`: alleen
// de bovenste zoveel pixelrijen van die kleur tellen mee — de bovenste huid is het gezicht, niet
// de hand die de staf vasthoudt.
function zwaartepunt(beeld, cx, cy, cel, anker, kleuren, strook) {
  const punten = [];
  for (let y = 0; y < cel[1]; y++) {
    for (let x = 0; x < cel[0]; x++) {
      const i = ((cy + y) * beeld.b + cx + x) * 4;
      if (beeld.px[i + 3] === 0) continue;
      if (kleuren.has(kleurSleutel(beeld.px[i], beeld.px[i + 1], beeld.px[i + 2]))) punten.push([x, y]);
    }
  }
  const top = punten.length ? punten[0][1] : 0;
  const tel = strook ? punten.filter(([, y]) => y <= top + strook) : punten;
  if (tel.length < 3) return null;
  const sx = tel.reduce((s, p) => s + p[0], 0) / tel.length;
  const sy = tel.reduce((s, p) => s + p[1], 0) / tel.length;
  return [Math.round(sx - anker[0]), Math.round(sy - anker[1])];
}

// Voor elke figuur en houding: per richting, per beeld, waar de kleuren zitten.
function meet(figuur, houding, kleuren, strook) {
  const f = figuur.gegevens;
  const h = f.houdingen[houding];
  if (!h) return null;
  const bestand = path.join(WORTEL, 'beelden', 'figuren', h.bestand);
  if (!fs.existsSync(bestand)) return null;
  const beeld = leesPng(bestand);
  const cel = h.cel || f.cel;
  const anker = h.anker || f.anker;
  const uit = {};
  let gevonden = 0;
  f.richtingen.forEach((richting, rij) => {
    uit[richting] = reeks(h.beelden, (k) => {
      const p = zwaartepunt(beeld, k * cel[0], rij * cel[1], cel, anker, kleuren, strook);
      if (p) gevonden++;
      return p;
    });
  });
  return gevonden ? uit : null;
}

globalThis.Toren = globalThis.Toren || {};
require(path.join(WORTEL, 'beelden', 'beschrijving.js'));
const figuren = (globalThis.Toren.BEELDEN && globalThis.Toren.BEELDEN.figuren) || {};
for (const [naam, gegevens] of Object.entries(figuren)) {
  const figuur = { naam, gegevens };
  // Een bol op de staf heeft alleen wie tovert: een figuur met de houding spreuk.
  if (gegevens.houdingen.spreuk) {
    const bron = {};
    for (const houding of ['spreuk', 'staan']) {
      const m = meet(figuur, houding, VUUR, 0);
      if (m) bron[houding] = m;
    }
    if (Object.keys(bron).length) beschrijving.bronnen[naam] = bron;
  }
  // Het gezicht: de bovenste huid. Van achteren is er geen; dan het gemiddelde van de twee
  // richtingen ernaast, want het hoofd zit er wel.
  const hoofd = meet(figuur, 'staan', HUID, 8);
  if (hoofd) {
    const r = gegevens.richtingen;
    const plek = {};
    for (const richting of r) plek[richting] = hoofd[richting].find(Boolean) || null;
    for (const [i, richting] of r.entries()) {
      if (plek[richting]) continue;
      const buren = [plek[r[(i + 1) % r.length]], plek[r[(i + r.length - 1) % r.length]]].filter(Boolean);
      if (buren.length) plek[richting] = [0, 1].map((k) => Math.round(buren.reduce((s, p) => s + p[k], 0) / buren.length));
    }
    beschrijving.hoofden[naam] = plek;
  }
}

// ---------------------------------------------------------------- wegschrijven

const kop = '// Gemaakt door gereedschap/pixelart/effecten-export.cjs — niet met de hand bijwerken.\n' +
  '// De vellen van de spreukeffecten, en waar op een figuur de bol van zijn staf en zijn hoofd zitten.\n';
fs.writeFileSync(
  path.join(DOEL, 'effecten.js'),
  `${kop}(function (T) {\n  T.EFFECTEN = ${JSON.stringify(beschrijving)};\n})(globalThis.Toren = globalThis.Toren || {});\n`,
);

for (const [naam, platen, fps] of bekijk) {
  fs.writeFileSync(path.join(UIT, `${naam}.png`), apng(platen, { fps, schaal: 4, achtergrond: '#1c1626' }));
}

const vellen = Object.entries(beschrijving.vellen).map(([n, v]) => `${n} ${v.cel[0]}×${v.cel[1]}×${v.beelden}`);
console.log(`beelden/effecten/: ${vellen.join(', ')}`);
console.log(`bronnen: ${Object.keys(beschrijving.bronnen).join(', ') || 'geen'}; hoofden: ${Object.keys(beschrijving.hoofden).join(', ') || 'geen'}`);
