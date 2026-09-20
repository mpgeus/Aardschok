// Schrijft de toren per staat in lagen voor de spelmotor, in uit/toren/lagen: de grond (een
// vloerplaatje, onder alle figuren), de toren zelf, de aanbouw, de steiger en losse dingen, elk
// op hetzelfde doek en met hetzelfde anker als de hele toren. Bij elke laag staat in lagen.json
// waar hij de grond raakt (in tegels vanaf het midden van de voet): daarop sorteert de motor hem
// tussen de figuren. Tot slot een controle: de lagen op elkaar geven precies het hele beeld.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const T = require('./toren.cjs');

const UIT = path.join(__dirname, 'uit', 'toren', 'lagen');
fs.mkdirSync(UIT, { recursive: true });
const VOLGORDE = ['grond', 'los', 'toren', 'aanbouw', 'steiger'];

const json = {
  anker: T.ANKER,
  cel: [T.BREED, T.HOOG],
  tegel: [64, 32],
  uitleg:
    'Elke laag heeft hetzelfde doek en anker als de hele toren. grond is een vloerplaatje (onder alle figuren). ' +
    'De andere lagen sorteer je als voorwerpen op hun voet: [gx0, gy0, gx1, gy1] in tegels vanaf het midden van de torenvoet.',
  staten: {},
};
for (const staat of Object.keys(T.STATEN)) {
  const { heel, lagen, voet } = T.toren(staat, { lagen: true });
  json.staten[staat] = {};
  const opElkaar = new K.Plaat(heel.b, heel.h);
  for (const laag of VOLGORDE) {
    if (!lagen[laag]) continue;
    const bestand = `${staat}-${laag}.png`;
    fs.writeFileSync(path.join(UIT, bestand), K.png(lagen[laag], 1));
    json.staten[staat][laag] = { bestand, voet: voet[laag] };
    opElkaar.plak(lagen[laag], 0, 0);
  }
  let verschil = 0;
  for (let i = 0; i < heel.px.length; i++) if (heel.px[i] !== opElkaar.px[i]) verschil++;
  console.log(`${staat.padEnd(13)} lagen: ${Object.keys(json.staten[staat]).join(', ')}  (verschil met het hele beeld: ${verschil})`);
  for (const [laag, v] of Object.entries(json.staten[staat])) console.log(`   ${laag.padEnd(8)} voet ${JSON.stringify(v.voet)}`);
}
fs.writeFileSync(path.join(UIT, 'lagen.json'), JSON.stringify(json, null, 2));
