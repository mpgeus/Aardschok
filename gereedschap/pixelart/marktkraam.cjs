// De kraam van de markt op het plein (ontwerp/werklijst.md, vraag 110, d en e; js/markt.js): het model uit dorp.cjs
// (`marktkraam`: een toonbank met planken, vier palen, een gestreepte luifel met een geschulpte rand, en appels, kolen,
// broden en een kruik), nu ook in het spel. Een kraam kijkt naar het midden van het plein, dus van vier kanten: één cel
// per kant, in de volgorde van RICHTINGEN (de klantenkant, lokaal +y, kijkt die kant op; ZO is +x op de kaart, ZW +y).
//
// Eén vel, beelden/marktkraam.png (naar-spel.cjs --alleen marktkraam), zoals de meiboom (meiboom.cjs). Het anker is het
// midden van de tegel, op de grond. De luifel werpt zijn schaduw op de toonbank; de schaduw op de grond en het licht van
// het uur tekent het spel zelf (vraag 125).
//
//   node gereedschap/pixelart/marktkraam.cjs    (de proefplaat: uit/marktkraam-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');

// ---------------------------------------------------------------- maten

// Een kraam staat op één tegel (64 pixels breed): een iets kleinere schaal dan op het dorpsplein van dorp.cjs (1,5),
// zodat de toonbank op zijn tegel past en de luifel er maar een beetje overheen steekt.
const SCHAAL = 1.1;
const CEL = [96, 96];
const ANKER = [48, 74];
const RICHTINGEN = ['ZO', 'ZW', 'NW', 'NO'];
// Zo tekent het spel de figuren (dorpelingen-anim.cjs), voor de proefplaat.
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

// ---------------------------------------------------------------- tekenen

function kraamCel(richting) {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  D.zetModel(B, D.marktkraam(SCHAAL), 0, 0, richting);
  D.zonSchaduw(B, []);
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// ---------------------------------------------------------------- het vel

function vel() {
  const uit = new K.Plaat(CEL[0] * RICHTINGEN.length, CEL[1]);
  RICHTINGEN.forEach((r, i) => uit.plak(kraamCel(r), i * CEL[0], 0));
  return uit;
}

// Wat in beelden/beschrijving.json komt (naar-spel.cjs): het bestand, de maat van een cel, het anker en de richtingen.
function beschrijving(bestand) {
  return { bestand, cel: CEL, anker: ANKER, richtingen: RICHTINGEN };
}

// ---------------------------------------------------------------- de proefplaat

// Hoeveel pixels een tekening van de rand van zijn cel afblijft, om te zien of hij nog past.
function ruimte(p) {
  let x0 = p.b;
  let x1 = -1;
  let y0 = p.h;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { boven: y0, links: x0, rechts: p.b - 1 - x1, onder: p.h - 1 - y1 };
}

function vergroot(p, n) {
  const uit = new K.Plaat(p.b * n, p.h * n);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (!k) continue;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) uit.zet(x * n + i, y * n + j, k[0], k[1]);
    }
  }
  return uit;
}

// Een stuk plein met de vier kramen, elk naar het midden, en drie boeren ertussen, samengesteld zoals het spel het doet
// (van achter naar voor, elk met zijn anker op het midden van zijn tegel), twee keer vergroot.
function proef() {
  const cellen = Object.fromEntries(RICHTINGEN.map((r) => [r, kraamCel(r)]));
  const { boer } = require('./dorpelingen.cjs');
  const figuur = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' });
  const B = 420;
  const H = 300;
  const plein = new K.Plaat(B, H);
  // [gx, gy, wat]: de kramen op de vier kanten van een plein van zeven bij zeven, de boeren ertussen
  const stukken = [
    [3, 0, 'ZW'], [0, 3, 'ZO'], [6, 3, 'NW'], [3, 6, 'NO'],
    [3, 1, 'boer'], [2, 4, 'boer'], [4, 3, 'boer'],
  ].sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  for (const [gx, gy, wat] of stukken) {
    const p = wat === 'boer' ? figuur : cellen[wat];
    const anker = wat === 'boer' ? FIG_ANKER : ANKER;
    plein.plak(p, 210 + (gx - gy) * 32 - anker[0], 60 + (gx + gy) * 16 - anker[1] + 40);
  }
  const plaat = vergroot(plein, 2);
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'marktkraam-proef.png'), K.png(plaat, 1, '#7d7462'));
  for (const r of RICHTINGEN) {
    const ru = ruimte(cellen[r]);
    console.log(`${r}: ruimte ${JSON.stringify(ru)}`);
    if (Math.min(ru.boven, ru.links, ru.rechts, ru.onder) < 1) console.log(`LET OP: ${r} raakt de rand van zijn cel`);
  }
  console.log(`uit/marktkraam-proef.png (${plaat.b}×${plaat.h}); cel ${CEL.join('×')}, anker ${ANKER.join(',')}`);
  return plaat;
}

if (require.main === module) proef();

module.exports = { vel, beschrijving, proef, kraamCel, CEL, ANKER, RICHTINGEN };
