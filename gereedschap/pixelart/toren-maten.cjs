'use strict';
// Proef voor Marcel: hoe breed moet de toren zijn? (ontwerp/wereld.md, "De toren moet om zijn
// eigen hal passen" ging uit van de hal erbinnen — verkeerde volgorde. Eerst kiezen hoe breed hij
// op het scherm mag staan.)
//
// Zet de krakkemikkige toren op drie breedtes naast elkaar: ongeveer 13 tegels (de huidige maat,
// ongewijzigd), ongeveer 10 en ongeveer 8. Ernaast, op eigen grond, de tovenaar (84) en een
// gewoon huis (6×8 tegels, dorp.cjs) voor de menselijke maat.
//
// Raakt toren.cjs niet aan: leest de broncode in en vervangt alleen R0 (de romp-straal aan de
// voet) in een geheugenkopie op schijf; R1 (top) en R_SOK (plint) schuiven in dezelfde
// verhouding mee, precies zoals de code zelf al zegt ("dezelfde taps toelopende verhouding").
// Alles wat op de romp zit — ramen, deur, klimop, scheuren, de aanbouw — hangt in toren.cjs al
// aan hoeken (phi) en de schaalfactoren U_SCHAAL/H_SCHAAL vast, die op hun beurt van R0 afhangen;
// door dezelfde code te draaien in plaats van iets na te bouwen, schuift dat vanzelf mee. De
// tijdelijke kopieën worden na het renderen weer opgeruimd.
//
//   node gereedschap/pixelart/toren-maten.cjs
//   → uit/toren/toren-maten.png (van links naar rechts: 13, 10, 8 tegels)
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = require('./figuren.cjs');
const D = require('./dorp.cjs');

const DIR = __dirname;
const TEGEL = K.TEGEL; // 64/√2 eenheden per tegel — zie kern.cjs

// ---------------------------------------------------------------- de toren, op een andere breedte

const BRON_TOREN = fs.readFileSync(path.join(DIR, 'toren.cjs'), 'utf8');
const tijdelijk = [];

function laadTorenMet(r0) {
  if (r0 === 250) return require('./toren.cjs'); // de echte, ongewijzigde toren
  const r1 = Math.round((228 * r0) / 250);
  const rsok = Math.round((264 * r0) / 250);
  const vervang = (bron, van, naar) => {
    if (!bron.includes(van)) throw new Error(`toren-maten: "${van}" niet gevonden in toren.cjs — is het bestand veranderd?`);
    return bron.replace(van, naar);
  };
  let bron = BRON_TOREN;
  bron = vervang(bron, 'const R0 = 250;', `const R0 = ${r0};`);
  bron = vervang(bron, 'const R1 = 228;', `const R1 = ${r1};`);
  bron = vervang(bron, 'const R_SOK = 264;', `const R_SOK = ${rsok};`);
  const bestand = path.join(DIR, `_tmp-toren-maten-${r0}.cjs`);
  fs.writeFileSync(bestand, bron);
  tijdelijk.push(bestand);
  return require(bestand);
}

// De dekkende (ondoorzichtige) rechthoek van één plaat, of van de vereniging van een paar lagen.
function gebied(platen) {
  const lijst = Array.isArray(platen) ? platen : [platen];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const { b, h } = lijst[0];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      if (lijst.some((p) => p.lees(x, y))) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  return x1 >= x0 ? { x0, y0, x1, y1 } : { x0: 0, y0: 0, x1: 0, y1: 0 };
}

function snoei(plaat, geb, rand = 50) {
  const x0 = Math.max(0, geb.x0 - rand);
  const y0 = Math.max(0, geb.y0 - rand);
  const x1 = Math.min(plaat.b - 1, geb.x1 + rand);
  const y1 = Math.min(plaat.h - 1, geb.y1 + rand);
  return plaat.uitsnede(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
}

// Rendert de krakkemikkige toren bij straal r0, en meet hoe breed alleen de tóren zelf (zonder de
// grote grondlap eronder, die het hele doek vult) op het scherm komt — met {lagen:true} snijdt
// toren.cjs de grond er zelf al uit (VOLGORDE in toren-lagen.cjs: grond, los, toren, aanbouw,
// steiger), dus die meting is schoon.
function renderToren(r0) {
  const t0 = Date.now();
  const T = laadTorenMet(r0);
  const { heel, lagen } = T.toren('krakkemikkig', { lagen: true });
  const structuur = Object.keys(lagen)
    .filter((naam) => naam !== 'grond')
    .map((naam) => lagen[naam]);
  const geb = gebied(structuur);
  const breedTegels = Math.round(((geb.x1 - geb.x0 + 1) / TEGEL) * 10) / 10;
  const r1 = Math.round((228 * r0) / 250);
  console.log(`  R0=${r0}, R1=${r1} -> ${breedTegels} tegels breed  [${Date.now() - t0} ms]`);
  return { plaat: snoei(heel, geb), breedTegels, r0 };
}

let A, B, C;
try {
  console.log('Torens renderen (drie breedtes)...');
  A = renderToren(250); // wat hij nu is
  B = renderToren(Math.round(250 * (10 / A.breedTegels)));
  C = renderToren(Math.round(250 * (8 / A.breedTegels)));
} finally {
  for (const bestand of tijdelijk) {
    try {
      fs.unlinkSync(bestand);
    } catch {
      /* al weg */
    }
  }
}

// ---------------------------------------------------------------- de tovenaar en een gewoon huis

console.log('Tovenaar en huis renderen (één keer, voor bij elke toren)...');
function renderReferentie() {
  const beeld = new K.Beeld(900, 700, 360, 400);
  const kaart = D.grondKaart({ zaad: 7 });
  K.tekenDozen(beeld, [K.doos(-1, -5, 9, 8, -16, 0, D.grondTex(kaart))]);
  const gebouw = D.dorpshuis(0, 0, 3, { maat: [6, 8] }); // een gewoon huis, 6×8 tegels
  D.zetGebouw(beeld, gebouw);
  D.zetModel(beeld, F.tovenaar(84), 7, -3, 'ZO'); // de tovenaar, voor de menselijke maat
  D.grasPollen(beeld, kaart, { dicht: 0.8 });
  D.zonSchaduw(beeld, gebouw.vormen, { zon: D.AVONDZON, kracht: 2.6 });
  D.voetSchaduw(beeld, [gebouw]);
  K.belicht(beeld, { omgeving: () => 0.2 });
  D.avondlicht(beeld);
  K.verwarm(beeld, 1.8);
  K.omlijn(beeld);
  const plaat = K.Plaat.van(K.kwantiseer(beeld));
  return snoei(plaat, gebied(plaat), 20);
}
const REF = renderReferentie();
console.log(`  huis + tovenaar: ${REF.b}x${REF.h}`);

// ---------------------------------------------------------------- de vergelijkingsplaat

const GAT = 24; // tussen toren en huis/tovenaar, binnen één paneel
const PANEELGAT = 70; // tussen de drie panelen
const RAND = 24; // buitenrand

const varianten = [A, B, C];
const paneelBreedtes = varianten.map((v) => v.plaat.b + GAT + REF.b);
const breedTotaal = paneelBreedtes.reduce((s, b) => s + b, 0) + PANEELGAT * (varianten.length - 1) + RAND * 2;
const hoogTotaal = Math.max(...varianten.map((v) => v.plaat.h), REF.h) + RAND * 2;
const basislijn = hoogTotaal - RAND; // de rij waar alles "op de grond" staat

const vel = new K.Plaat(breedTotaal, hoogTotaal);
let x = RAND;
for (const v of varianten) {
  vel.plak(v.plaat, x, basislijn - v.plaat.h);
  vel.plak(REF, x + v.plaat.b + GAT, basislijn - REF.h);
  x += v.plaat.b + GAT + REF.b + PANEELGAT;
}

const UIT = path.join(DIR, 'uit', 'toren');
fs.mkdirSync(UIT, { recursive: true });
fs.writeFileSync(path.join(UIT, 'toren-maten.png'), K.png(vel, 1));

console.log(`\nuit/toren/toren-maten.png  ${vel.b}x${vel.h}`);
console.log('Van links naar rechts, telkens toren + tovenaar + huis op eigen grond:');
varianten.forEach((v, i) => console.log(`  ${i + 1}. R0=${v.r0} -> ${v.breedTegels} tegels breed`));
