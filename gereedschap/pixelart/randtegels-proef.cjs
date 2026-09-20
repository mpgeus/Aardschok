// Een proefplaat van het randtegelvel: een samengestelde scène, neergelegd met dezelfde regels die
// Tiled toepast. Een vel van 246 losse ruiten zegt niets; dit laat zien wat Marcel straks krijgt.
//
//   node gereedschap/pixelart/randtegels-proef.cjs   ->  gereedschap/pixelart/uit/rand/proef.png
//
// Wat erop staat: een grasveld met een zandpad dat een bocht maakt en netjes eindigt, een beek die
// er schuin doorheen snijdt met oevers aan weerskanten, de brug erover met drie middenstukken, en
// rechtsonder een stuk kasseien waar het pad op uitkomt.
//
// De tegels worden niet met de hand aangewezen. Per roosterPUNT bepalen we de grondsoort (water,
// kasseien, zandpad of gras), en per tegel kijken we naar zijn vier punten — boven, rechts, onder,
// links — precies zoals een hoekenterreinset dat doet. Uit die vier maken we de wangid en zoeken we
// in de terreinset van rand.tsx op welke tegels daarbij horen; is er meer dan één, dan kiest een
// hash er een uit, net als Tiled se willekeur. Alleen de vijf brugtegels leggen we zelf neer, want
// die horen bij geen terreinset.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const R = require('./randtegels.cjs');

const BREED = 900;
const HOOG = 560;
// Waar wereldpunt (0, 0) op de plaat valt. Zo gekozen dat het pad, de brug en het plein samen
// midden in het venster staan; zie de maten onderaan.
const OX = 541;
const OY = -104;

// ---------------------------------------------------------------- de scène in wereldcoördinaten

const BEEK = {
  punten: [[4.5, -10], [6.2, 5], [7.5, 9], [7.5, 16], [9.6, 21], [12, 30], [15, 45]],
  halve: 2.0,
};
// Het pad naar de brug slingert door het veld en houdt daar ook op: die kop laat zien wat de
// terreinset met een doodlopend eind doet. Aan de overkant loopt het door naar het plein.
const PAD_NAAR = { punten: [[3.7, 12.4], [3.2, 10.6], [1.0, 9.4], [-2.5, 10.8]], halve: 0.7 };
const PAD_VAN = {
  punten: [[10.92, 13.08], [12.8, 9.33], [18.11, 9.64], [21.55, 13.0], [20.5, 16.0]],
  halve: 0.7,
};
const PLEIN = { x0: 18.5, y0: 14.5, x1: 23, y1: 18.5, r: 1.2 };

// De brug ligt langs x op rij v = 12. De beek loopt daar recht en is vier tegels breed, dus de
// oever valt precies op de punten die het begin- en het eindstuk verwachten: land op x = 5 en
// x = 10, water daartussen. Dat is ook wat Marcel moet doen: eerst het water, dan de brug erop.
const BRUG_RIJ = 12;
const BRUG = [
  [5, 'brug x begin'],
  [6, 'brug x midden'],
  [7, 'brug x midden'],
  [8, 'brug x midden'],
  [9, 'brug x eind'],
];

function totLijn(px, py, punten) {
  let min = Infinity;
  for (let i = 0; i + 1 < punten.length; i++) {
    const [ax, ay] = punten[i];
    const [bx, by] = punten[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    min = Math.min(min, Math.hypot(px - ax - dx * t, py - ay - dy * t));
  }
  return min;
}

function inPlein(u, v) {
  const qx = Math.abs(u - (PLEIN.x0 + PLEIN.x1) / 2) - ((PLEIN.x1 - PLEIN.x0) / 2 - PLEIN.r);
  const qy = Math.abs(v - (PLEIN.y0 + PLEIN.y1) / 2) - ((PLEIN.y1 - PLEIN.y0) / 2 - PLEIN.r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - PLEIN.r < 0;
}

function terreinOp(u, v) {
  if (totLijn(u, v, BEEK.punten) < BEEK.halve) return 'water';
  if (inPlein(u, v)) return 'kasseien';
  if (totLijn(u, v, PAD_NAAR.punten) < PAD_NAAR.halve) return 'zandpad';
  if (totLijn(u, v, PAD_VAN.punten) < PAD_VAN.halve) return 'zandpad';
  return 'gras';
}

// ---------------------------------------------------------------- het vel uitlezen

const { vel, kolommen, tiles, sets } = R.bouw();
const snij = (id) => vel.uitsnede((id % kolommen) * 64, Math.floor(id / kolommen) * 32, 64, 32);

// vlakke tegels per grondsoort
const VLAK = {};
tiles.forEach((t, id) => {
  if (t.groep !== 'vlak') return;
  (VLAK[t.naam] = VLAK[t.naam] || []).push(id);
});
// terreinsets: "soortA|soortB" -> { a, b, opWangid }
const SETS = {};
for (const set of sets) {
  const a = set.kleuren[0].naam;
  const b = set.kleuren[1].naam;
  const opWangid = {};
  for (const wt of set.tegels) (opWangid[wt.wangid] = opWangid[wt.wangid] || []).push(wt.id);
  SETS[`${a}|${b}`] = { a, b, opWangid };
  SETS[`${b}|${a}`] = { a, b, opWangid };
}
// de brugtegels op hun groepsnaam
const BRUG_ID = {};
tiles.forEach((t, id) => {
  if (t.groep.startsWith('brug ')) BRUG_ID[t.groep] = id;
});

// Dezelfde volgorde als in randtegels.cjs: boven, rechts, onder, links van de ruit.
const HOEK_INDEX = { boven: 7, rechts: 1, onder: 3, links: 5 };
function wangId(kleuren) {
  const w = [0, 0, 0, 0, 0, 0, 0, 0];
  w[HOEK_INDEX.boven] = kleuren[0];
  w[HOEK_INDEX.rechts] = kleuren[1];
  w[HOEK_INDEX.onder] = kleuren[2];
  w[HOEK_INDEX.links] = kleuren[3];
  return w.join(',');
}

// Een tegel kan er maar twee dragen. Komen er drie grondsoorten in één tegel samen (bij ons hooguit
// waar het pad het plein raakt), dan houden we de twee die het vaakst voorkomen; dat is ook wat
// Tiled met zijn beste-gok doet.
function totTwee(hoeken) {
  const tel = {};
  for (const h of hoeken) tel[h] = (tel[h] || 0) + 1;
  const soorten = Object.keys(tel);
  if (soorten.length <= 2) return hoeken;
  soorten.sort((p, q) => tel[q] - tel[p]);
  const [eerste, tweede] = soorten;
  return hoeken.map((h) => (h === eerste || h === tweede ? h : eerste));
}

function tegelVoor(tx, ty) {
  const brug = ty === BRUG_RIJ && BRUG.find(([u]) => u === tx);
  if (brug) return BRUG_ID[brug[1]];
  const hoeken = totTwee([
    terreinOp(tx, ty),
    terreinOp(tx + 1, ty),
    terreinOp(tx + 1, ty + 1),
    terreinOp(tx, ty + 1),
  ]);
  const uniek = [...new Set(hoeken)];
  const kies = (lijst) => lijst[K.hash(tx, ty, 77) % lijst.length];
  if (uniek.length === 1) return kies(VLAK[uniek[0]]);
  const set = SETS[`${uniek[0]}|${uniek[1]}`];
  if (!set) throw new Error(`geen terreinset voor ${uniek.join(' en ')} op tegel ${tx},${ty}`);
  const id = wangId(hoeken.map((h) => (h === set.a ? 1 : 2)));
  const lijst = set.opWangid[id];
  if (!lijst) throw new Error(`geen tegel voor wangid ${id} in ${set.a}/${set.b}`);
  return kies(lijst);
}

// ---------------------------------------------------------------- neerleggen
//
// Welke tegels raken het venster? Uit imgX = (tx−ty)·32 − 32 + OX en imgY = (tx+ty)·16 + OY volgt
// een bereik voor het verschil en de som; die lopen we af in plaats van een vierkant stuk kaart, zo
// is het venster gegarandeerd helemaal gevuld.
const plaat = new K.Plaat(BREED, HOOG);
const difVan = Math.floor((-64 - OX + 32) / 32) - 1;
const difTot = Math.ceil((BREED - OX + 32) / 32) + 1;
const somVan = Math.floor((-32 - OY) / 16) - 1;
const somTot = Math.ceil((HOOG - OY) / 16) + 1;
let aantal = 0;
for (let som = somVan; som <= somTot; som++) {
  for (let dif = difVan; dif <= difTot; dif++) {
    if (((som + dif) & 1) !== 0) continue;
    const tx = (som + dif) / 2;
    const ty = (som - dif) / 2;
    plaat.plak(snij(tegelVoor(tx, ty)), OX + dif * 32 - 32, OY + som * 16);
    aantal++;
  }
}

// controle: geen gat in het venster
let gaten = 0;
for (let i = 0; i < BREED * HOOG; i++) if (plaat.px[i * 2] < 0) gaten++;

const UIT = path.join(__dirname, 'uit', 'rand');
fs.mkdirSync(UIT, { recursive: true });
fs.writeFileSync(path.join(UIT, 'proef.png'), K.png(plaat, 1));
console.log(`proef.png  ${BREED}×${HOOG}  (${aantal} tegels neergelegd, ${gaten} lege pixels)`);
