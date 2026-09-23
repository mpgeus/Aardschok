// Proefplaten van het graan: de akker in vijf stadia, om te beoordelen vóórdat er iets in het
// spel of in beelden/ komt (werklijst punt 1a; ontwerp/spel.md, "Het eerste proefje").
//
//   node gereedschap/pixelart/graan-proef.cjs   ->  gereedschap/pixelart/uit/graan/*.png
//
// Wat erop staat, één bestand per vraag uit de opdracht:
//   stadia.png            de vijf stadia naast elkaar op gras, plus het rijpe veld met de boer
//   boer-in-graan.png     een 600×400 uitsnede daarvan
//   varianten.png         drie zaden per stadium, zodat een veld niet als behang leest
//   lagen-*-achter.png    het rijpe en het groene graan als twee lagen (achter/voor de figuur)
//   lagen-*-voor.png
//   wind-*.png            acht beelden van één heen-en-weerzwaai, groen en rijp, op een rij
//   golf-rijp.png         een bewegende PNG: een rijp veld van 8×6 tegels waar de wind overheen rolt
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const G = require('./graan.cjs');
const People = require('./dorpelingen.cjs');
const { apng } = require('./apng.cjs');

const UIT = path.join(__dirname, 'uit', 'graan');
fs.mkdirSync(UIT, { recursive: true });
const t0 = Date.now();
let totaalBytes = 0;
function schrijf(naam, buf) {
  fs.writeFileSync(path.join(UIT, naam), buf);
  totaalBytes += buf.length;
  console.log(' ', naam, `${(buf.length / 1024).toFixed(0)} kB`);
}
function grasAchtergrond(breed, hoog, stap = 4) {
  const p = new K.Plaat(breed, hoog);
  for (let y = 0; y < hoog; y++) for (let x = 0; x < breed; x++) p.zet(x, y, 'gras', stap);
  return p;
}
// plakt platen op een rij, onderkant gelijk, met GAT pixels ertussen; geeft de plaat terug
function opEenRij(platen, gat, randX = 20, randBoven = 20, randOnder = 16) {
  const breed = platen.reduce((s, p) => s + p.b, 0) + gat * (platen.length - 1) + randX * 2;
  const hoog = Math.max(...platen.map((p) => p.h)) + randBoven + randOnder;
  const plaat = grasAchtergrond(breed, hoog);
  let x = randX;
  for (const p of platen) {
    plaat.plak(p, x, hoog - p.h - randOnder);
    x += p.b + gat;
  }
  return plaat;
}

console.log('Graan — proefplaten (' + new Date().toISOString() + ')');

// ---------------------------------------------------------------- 1) de vijf stadia + de boer

const STADIA = ['geploegd', 'kiemend', 'groen', 'rijp', 'gemaaid'];
const stadiaVelden = STADIA.map((s) => G.renderVeld(4, 3, s, { zaad: 11 }));
const boerModel = People.boer();
const BOER_B = 9;
const BOER_D = 7;
const BOER_GX = 4.6;
const BOER_GY = 3.3;
const boerVeld = G.renderVeld(BOER_B, BOER_D, 'rijp', {
  zaad: 21,
  marge: 1.25,
  figuur: { model: boerModel, gx: BOER_GX, gy: BOER_GY, richting: 'Z' },
});
schrijf('stadia.png', K.png(opEenRij([...stadiaVelden, boerVeld], 28)));

// ---------------------------------------------------------------- 2) uitsnede van de boer

// Dezelfde plek als veldAfmeting (graan.cjs) voor dit veld uitrekent, om de boer te vinden op de
// plaat die renderVeld() net teruggaf.
{
  const maxHoog = 90;
  const { OX, OY } = G.veldAfmeting(BOER_B, BOER_D, 1.25, maxHoog);
  const voetX = OX + (BOER_GX - BOER_GY) * 32;
  const voetY = OY + (BOER_GX + BOER_GY) * 16;
  const snee = boerVeld.uitsnede(Math.round(voetX - 300), Math.round(voetY - 330), 600, 400);
  schrijf('boer-in-graan.png', K.png(snee));
}

// ---------------------------------------------------------------- 3) varianten per stadium

{
  const rijen = STADIA.map((s) => [1, 2, 3].map((zaad) => G.renderVeld(2, 2, s, { zaad: zaad * 7 + 1, marge: 0.5 })));
  const kol = 3;
  const gat = 14;
  const breedKol = Math.max(...rijen.flat().map((p) => p.b));
  const hoogRij = rijen.map((r) => Math.max(...r.map((p) => p.h)));
  const breed = kol * breedKol + (kol + 1) * gat;
  const hoog = hoogRij.reduce((s, h) => s + h, 0) + (rijen.length + 1) * gat;
  const plaat = grasAchtergrond(breed, hoog);
  let y = gat;
  rijen.forEach((rij, i) => {
    let x = gat;
    for (const p of rij) {
      plaat.plak(p, x + Math.floor((breedKol - p.b) / 2), y + (hoogRij[i] - p.h));
      x += breedKol + gat;
    }
    y += hoogRij[i] + gat;
  });
  schrijf('varianten.png', K.png(plaat));
}

// ---------------------------------------------------------------- 4) twee lagen: achter/voor

for (const stadium of ['groen', 'rijp']) {
  const { achter, voor } = G.tegelLagen(stadium, { zaad: 3 });
  schrijf(`lagen-${stadium}-achter.png`, K.png(achter, 2));
  schrijf(`lagen-${stadium}-voor.png`, K.png(voor, 2));
}

// ---------------------------------------------------------------- 5) wind: 8 beelden per tegel

for (const stadium of ['groen', 'rijp']) {
  const maxHoog = G.MAX_HOOG[stadium];
  const { OX, OY, BREED, HOOG } = G.veldAfmeting(1, 1, 0, maxHoog);
  const beelden = [];
  for (let f = 0; f < 8; f++) {
    const B = new K.Beeld(BREED, HOOG, OX, OY);
    G.halmenOverAkker(B, 1, 1, stadium, { zaad: 3, fase: f / 8 });
    beelden.push(K.Plaat.van(K.kwantiseer(B)));
  }
  schrijf(`wind-${stadium}.png`, K.png(opEenRij(beelden, 6, 6, 6, 6)));
}

// ---------------------------------------------------------------- 6) de golf over het veld

{
  const B_ = 8;
  const D_ = 6;
  // beeld = (tijd + gx·golfA + gy·golfB) mod 1 (hier als cyclus 0..1 i.p.v. 0..8 zoals het spel
  // straks met gehele beeldnummers doet — zelfde formule, alleen de eenheid verschilt).
  const golfA = 1 / 8;
  const golfB = 0;
  const beelden = [];
  for (let f = 0; f < 8; f++) {
    beelden.push(G.renderVeld(B_, D_, 'rijp', { zaad: 21, marge: 0.75, fase: f / 8, golfA, golfB }));
  }
  const b = Math.max(...beelden.map((p) => p.b));
  const h = Math.max(...beelden.map((p) => p.h));
  const gelijk = beelden.map((p) => {
    const q = new K.Plaat(b, h);
    q.plak(p, 0, h - p.h);
    return q;
  });
  schrijf('golf-rijp.png', apng(gelijk, { fps: 6 }));
}

const duur = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`klaar in ${duur}s, ${(totaalBytes / 1024).toFixed(0)} kB totaal, in ${UIT}`);
