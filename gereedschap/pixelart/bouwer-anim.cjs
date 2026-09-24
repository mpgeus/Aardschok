'use strict';
// Schrijft de drie houdingen van de bouwer weg als spelvellen: staan en lopen zoals
// dorpelingen-anim.cjs dat voor de andere dorpelingen doet, en timmeren zoals maaier-anim.cjs dat
// voor de maaislag doet. Anders dan bij die dorpelingen delen alle drie houdingen hier wél één
// vel/cel/anker (beelden/beschrijving.json kent maar één cel per figuur, niet één per houding) —
// en de hamerzwaai van timmeren reikt verder dan de vaste 112×124-cel van de andere dorpelingen.
// Daarom wordt hier, net als bij de maaier, eerst in een ruime cel gerenderd en dan één gedeelde,
// krappe cel om alle drie de houdingen samen gepast (doosVan/reikVan/samen, letterlijk uit
// maaier-anim.cjs overgenomen).
//
// Raakt bouwer.cjs en naar-spel.cjs niet aan.
//
//   node gereedschap/pixelart/bouwer-anim.cjs
//   -> gereedschap/pixelart/uit/bouwer/animaties/bouwer-staan.png     de drie vellen
//   -> gereedschap/pixelart/uit/bouwer/animaties/bouwer-lopen.png
//   -> gereedschap/pixelart/uit/bouwer/animaties/bouwer-timmeren.png
//   -> gereedschap/pixelart/uit/bouwer/animaties/bouwer.json          naam, cel, anker, houdingen
//   -> gereedschap/pixelart/uit/bouwer/bouwer-timmeren-zo.png         bewegende proef, richting ZO
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Bo = require('./bouwer.cjs');
const { apng } = require('./apng.cjs');

const UIT = path.join(__dirname, 'uit', 'bouwer');
const UIT_ANIM = path.join(UIT, 'animaties');
fs.mkdirSync(UIT_ANIM, { recursive: true });

// Ruime, ongesneden cel om in te renderen (vergelijk RUIM in maaier-anim.cjs). Breder dan een
// gewone dorpeling vanwege de hamer die bij het timmeren opzij en naar voren zwaait.
const RUIM = { b: 200, h: 230, anker: [100, 165] };
const RICHTINGEN = K.KANTEN; // ['Z','ZW','W','NW','N','NO','O','ZO'] — altijd alle acht
const MARGE = 3; // lucht tussen de figuur en de rand van zijn cel, zoals bij de maaier en de dorpelingen

const HOUDINGEN = [
  { naam: 'staan', beelden: 4, fps: 4, herhaal: true, maak: (fase) => Bo.bouwer({ houding: 'staan', fase }) },
  { naam: 'lopen', beelden: 8, fps: 10, herhaal: true, maak: (fase) => Bo.bouwer({ houding: 'lopen', fase }) },
  {
    naam: 'timmeren', beelden: Bo.BOUWER_TIMMEREN_BEELDEN, fps: Bo.BOUWER_TIMMEREN_FPS, herhaal: true,
    maak: (fase) => Bo.bouwer({ houding: 'timmeren', fase }),
  },
];

// de krappe doos om alles wat er op de plaat staat (zelfde als doosVan in maaier-anim.cjs)
function doosVan(plaat) {
  let x0 = plaat.b, x1 = 0, y0 = plaat.h, y1 = 0;
  for (let y = 0; y < plaat.h; y++) {
    for (let x = 0; x < plaat.b; x++) {
      if (plaat.px[(y * plaat.b + x) * 2] < 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < x0 ? { x0: 0, y0: 0, b: 1, h: 1 } : { x0, y0, b: x1 - x0 + 1, h: y1 - y0 + 1 };
}
const reikVan = (d, anker) => ({ l: anker[0] - d.x0, r: d.x0 + d.b - anker[0], b: anker[1] - d.y0, o: d.y0 + d.h - anker[1] });
const samen = (a, b) => ({ l: Math.max(a.l, b.l), r: Math.max(a.r, b.r), b: Math.max(a.b, b.b), o: Math.max(a.o, b.o) });

console.log('Bouwer — spelvellen (' + new Date().toISOString() + ')');
const t0 = Date.now();

// alle houdingen × 8 richtingen × zijn beelden renderen in de ruime cel, meteen krap uitsnijden en
// de reik tot nu toe bijhouden, zodat er straks één cel voor alle drie de houdingen samen gekozen
// kan worden (zoals maaier-anim.cjs dat voor zijn ene houding doet).
let reik = { l: 1, r: 1, b: 1, o: 1 };
let klem = false;
const stukkenPerHouding = {}; // houding -> richting -> [{ plaat, dx, dy }]
for (const H of HOUDINGEN) {
  const stukkenPerKant = {};
  for (const kant of RICHTINGEN) {
    const stukken = [];
    for (let i = 0; i < H.beelden; i++) {
      const fase = i / H.beelden;
      const p = K.losRenderen(H.maak(fase), { b: RUIM.b, h: RUIM.h, anker: RUIM.anker, richting: kant });
      const d = doosVan(p);
      if (d.x0 <= 0 || d.y0 <= 0 || d.x0 + d.b >= RUIM.b - 1 || d.y0 + d.h >= RUIM.h - 1) {
        console.log(`  RAND bouwer ${H.naam} beeld ${i} ${kant}: ${d.x0}..${d.x0 + d.b - 1}, ${d.y0}..${d.y0 + d.h - 1} in ${RUIM.b}×${RUIM.h}`);
        klem = true;
      }
      reik = samen(reik, reikVan(d, RUIM.anker));
      stukken.push({ plaat: p.uitsnede(d.x0, d.y0, d.b, d.h), dx: d.x0 - RUIM.anker[0], dy: d.y0 - RUIM.anker[1] });
    }
    stukkenPerKant[kant] = stukken;
  }
  stukkenPerHouding[H.naam] = stukkenPerKant;
  console.log(`  ${H.naam}: ${RICHTINGEN.length} richtingen × ${H.beelden} beelden gerenderd`);
}
const renderDuur = (Date.now() - t0) / 1000;
console.log(`  (gerenderd in ${renderDuur.toFixed(1)}s)`);

// één gedeelde cel voor alle drie de houdingen, met het anker op dezelfde relatieve plek overal
const CEL = [reik.l + reik.r + 2 * MARGE, reik.b + reik.o + 2 * MARGE];
const ANKER = [reik.l + MARGE, reik.b + MARGE];
console.log(`  gedeelde cel ${CEL[0]}×${CEL[1]}, anker ${ANKER.join(',')}`);

function naarCel(s) {
  const p = new K.Plaat(CEL[0], CEL[1]);
  p.plak(s.plaat, ANKER[0] + s.dx, ANKER[1] + s.dy);
  return p;
}

const houdingenJson = {};
const cellenTimmerenZO = [];
for (const H of HOUDINGEN) {
  const vel = new K.Plaat(CEL[0] * H.beelden, CEL[1] * RICHTINGEN.length);
  RICHTINGEN.forEach((kant, r) => {
    stukkenPerHouding[H.naam][kant].forEach((s, i) => {
      const p = naarCel(s);
      vel.plak(p, i * CEL[0], r * CEL[1]);
      if (H.naam === 'timmeren' && kant === 'ZO') cellenTimmerenZO.push(p);
    });
  });
  const bestand = `bouwer-${H.naam}.png`;
  fs.writeFileSync(path.join(UIT_ANIM, bestand), K.png(vel, 1));
  const regel = { bestand, beelden: H.beelden, fps: H.fps, herhaal: H.herhaal };
  if (H.naam === 'lopen') {
    regel.snelheid = Bo.BOUWER_SNELHEID;
    regel.stap = +((Bo.BOUWER_SNELHEID * (H.beelden / H.fps)) / 2).toFixed(3); // tegels per pas
  }
  houdingenJson[H.naam] = regel;
  console.log(`  ${bestand}: ${vel.b}×${vel.h}`);
}

const beschrijving = {
  naam: 'bouwer',
  cel: CEL,
  anker: ANKER,
  snelheid: Bo.BOUWER_SNELHEID, // geldt voor 'lopen'; 'staan' en 'timmeren' lopen niet
  richtingen: RICHTINGEN,
  houdingen: houdingenJson,
};
fs.writeFileSync(path.join(UIT_ANIM, 'bouwer.json'), JSON.stringify(beschrijving, null, 2) + '\n');
console.log('  bouwer.json geschreven');

// ter controle: een bewegende PNG van de hamerslag, richting ZO
const apngBuf = apng(cellenTimmerenZO, { fps: Bo.BOUWER_TIMMEREN_FPS, schaal: 3, herhaal: 0 });
fs.writeFileSync(path.join(UIT, 'bouwer-timmeren-zo.png'), apngBuf);
console.log(`  bouwer-timmeren-zo.png: ${(apngBuf.length / 1024).toFixed(0)} kB`);

console.log(`klaar in ${((Date.now() - t0) / 1000).toFixed(1)}s, in ${UIT}`);
if (klem) process.exitCode = 1;
