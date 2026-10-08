// Een proefplaat van het vel van het eiland (randtegels.cjs, bouwKust): een stuk kust, neergelegd met dezelfde regels die
// Tiled toepast, zoals randtegels-proef.cjs dat doet voor rand.png (werklijst vraag 117, B van 2a).
//
//   node gereedschap/pixelart/kusttegels-proef.cjs   ->  gereedschap/pixelart/uit/kust/proef.png (en proef-2x.png)
//
// Wat erop staat: bovenin de zee, met een strand dat in een bocht langs het land loopt; achter het strand het gras, met
// een stuk stuifzand waar heide op groeit, een stuk veen met plassen, en een stuk broek met biezen. De tegels worden
// niet met de hand aangewezen: per roosterpunt een grondsoort, en per tegel de terreinset van zijn vier punten.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const R = require('./randtegels.cjs');

const BREED = 1100;
const HOOG = 640;
const OX = 550; // waar het wereldpunt (0, 0) op de plaat valt
const OY = -40;

// ---------------------------------------------------------------- de scène in wereldcoördinaten

const rond = (u, v, cu, cv, r, ru = 1, rv = 1) => Math.hypot((u - cu) / ru, (v - cv) / rv) < r;
// de kustlijn: waar u + v kleiner is, is het zee; ze golft langs u − v
const kust = (u, v) => 9 + Math.sin((u - v) * 0.33) * 1.6 + Math.sin((u - v) * 0.11 + 1) * 1.2;

function terreinOp(u, v) {
  const lijn = kust(u, v);
  if (u + v < lijn) return 'zee';
  if (u + v < lijn + 3.2) return 'strand';
  // het stuifzand, met heide erop
  if (rond(u, v, 14, 6, 1.6, 1.3, 1)) return 'heide';
  if (rond(u, v, 14, 6, 3.4, 1.3, 1)) return 'strand';
  if (rond(u, v, 8.5, 17.5, 2.6, 1.2, 0.9)) return 'veen';
  if (rond(u, v, 19, 13, 2.8, 0.9, 1.3)) return 'broek';
  return 'gras';
}

// ---------------------------------------------------------------- het vel uitlezen

const { vel, kolommen, tiles, sets } = R.bouwKust();
const snij = (id) => vel.uitsnede((id % kolommen) * 64, Math.floor(id / kolommen) * 32, 64, 32);
const VLAK = {};
tiles.forEach((t, id) => {
  if (t.groep === 'vlak') (VLAK[t.naam] = VLAK[t.naam] || []).push(id);
});
const SETS = {};
for (const set of sets) {
  const a = set.kleuren[0].naam;
  const b = set.kleuren[1].naam;
  const opWangid = {};
  for (const wt of set.tegels) (opWangid[wt.wangid] = opWangid[wt.wangid] || []).push(wt.id);
  SETS[`${a}|${b}`] = { a, b, opWangid };
  SETS[`${b}|${a}`] = { a, b, opWangid };
}
const HOEK_INDEX = { boven: 7, rechts: 1, onder: 3, links: 5 };
function wangId(kleuren) {
  const w = [0, 0, 0, 0, 0, 0, 0, 0];
  w[HOEK_INDEX.boven] = kleuren[0];
  w[HOEK_INDEX.rechts] = kleuren[1];
  w[HOEK_INDEX.onder] = kleuren[2];
  w[HOEK_INDEX.links] = kleuren[3];
  return w.join(',');
}

function tegelVoor(tx, ty) {
  const hoeken = [terreinOp(tx, ty), terreinOp(tx + 1, ty), terreinOp(tx + 1, ty + 1), terreinOp(tx, ty + 1)];
  const uniek = [...new Set(hoeken)];
  const kies = (lijst) => lijst[K.hash(tx, ty, 77) % lijst.length];
  if (uniek.length === 1) return kies(VLAK[uniek[0]]);
  const set = uniek.length === 2 && SETS[`${uniek[0]}|${uniek[1]}`];
  if (!set) throw new Error(`geen terreinset voor ${uniek.join(' en ')} op tegel ${tx},${ty}`);
  const lijst = set.opWangid[wangId(hoeken.map((h) => (h === set.a ? 1 : 2)))];
  if (!lijst) throw new Error(`geen tegel voor ${hoeken.join(',')} in ${set.a}/${set.b}`);
  return kies(lijst);
}

// ---------------------------------------------------------------- neerleggen

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

const UIT = path.join(__dirname, 'uit', 'kust');
fs.mkdirSync(UIT, { recursive: true });
fs.writeFileSync(path.join(UIT, 'proef.png'), K.png(plaat, 1));
// een uitsnede op twee keer de maat: de kust en het stuifzand
fs.writeFileSync(path.join(UIT, 'proef-2x.png'), K.png(plaat.uitsnede(380, 40, 480, 260), 2));
fs.writeFileSync(path.join(UIT, 'vel.png'), K.png(vel, 1));
console.log(`proef.png  ${BREED}×${HOOG}  (${aantal} tegels neergelegd)`);
