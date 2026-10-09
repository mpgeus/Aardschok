// De proefplaat van het groen in het jaar en de nieuwe soorten (werklijst vraag 148, stap 1; Marcel, 9 okt: "a. Ja goed
// idee b. Ja vegetatie en bomen met seizoenen mee. Ook vruchten etc.", en "Sneeuw moet ook nog op bomen, huizen etc.").
// Rij voor rij: de eik in zijn vormen, de eik in het jaar (met sneeuw, en de kerstboom), de appelboom, de berk en de wilg in het jaar, de
// nieuwe soorten in de zomer, en de nieuwe soorten in een ander seizoen. Alles uit bomen.cjs; elke rij in een eigen
// proces, want een boom renderen kost een paar seconden.
//
//   node gereedschap/pixelart/groen-proef.cjs          de plaat, in gereedschap/pixelart/uit/groen/proef.png (niet in git)
//   node gereedschap/pixelart/groen-proef.cjs 2        alleen rij 2 (als proef-2.png)
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const K = require('./kern.cjs');
const Bm = require('./bomen.cjs');

const UIT = path.join(__dirname, 'uit', 'groen');
const CEL = [288, 372];
const ANKER = [144, 342];
const KOP = 26;

// [opschrift, soort, zaad, opties, sneeuw]
const RIJEN = [
  ['De eik in zijn vormen', [
    ['eik', 'eik', 1, {}],
    ['breed', 'eik', 2, { vorm: 'breed' }],
    ['hoog', 'eik', 3, { vorm: 'hoog' }],
    ['scheef', 'eik', 4, { vorm: 'scheef' }],
    ['twee stammen', 'eik', 5, { vorm: 'tweestam' }],
    ['oud', 'eik', 6, { vorm: 'oud' }],
  ]],
  ['De eik in het jaar', [
    ['lente', 'eik', 1, { seizoen: 'lente' }],
    ['zomer', 'eik', 1, { seizoen: 'zomer' }],
    ['herfst', 'eik', 1, { seizoen: 'herfst' }],
    ['winter', 'eik', 1, { seizoen: 'winter' }],
    ['winter, sneeuw', 'eik', 1, { seizoen: 'winter' }, true],
    ['den, sneeuw', 'den', 1, {}, true],
    ['kerstboom', 'kerstboom', 1, {}],
    ['kerstboom, sneeuw', 'kerstboom', 1, {}, true],
  ]],
  ['Appel, berk en wilg in het jaar', [
    ['appel lente', 'appelboom', 1, { seizoen: 'lente' }],
    ['appel zomer', 'appelboom', 1, { seizoen: 'zomer' }],
    ['appel herfst', 'appelboom', 1, { seizoen: 'herfst' }],
    ['appel winter', 'appelboom', 1, { seizoen: 'winter' }],
    ['berk herfst', 'berk', 2, { seizoen: 'herfst' }],
    ['berk winter', 'berk', 2, { seizoen: 'winter' }],
    ['wilg herfst', 'wilg', 1, { seizoen: 'herfst' }],
    ['wilg winter', 'wilg', 1, { seizoen: 'winter' }],
  ]],
  ['Nieuwe soorten, zomer', [
    ['beuk', 'beuk', 1, {}],
    ['linde', 'linde', 1, {}],
    ['els', 'els', 1, {}],
    ['populier', 'populier', 1, {}],
    ['knotwilg', 'knotwilg', 1, {}],
    ['meidoorn', 'meidoorn', 1, {}],
    ['hazelaar', 'hazelaar', 1, {}],
  ]],
  ['Nieuwe soorten, het jaar rond', [
    ['beuk herfst', 'beuk', 1, { seizoen: 'herfst' }],
    ['linde herfst', 'linde', 1, { seizoen: 'herfst' }],
    ['els winter', 'els', 1, { seizoen: 'winter' }],
    ['populier herfst', 'populier', 1, { seizoen: 'herfst' }],
    ['knotwilg winter', 'knotwilg', 1, { seizoen: 'winter' }],
    ['meidoorn lente', 'meidoorn', 1, { seizoen: 'lente' }],
    ['meidoorn herfst', 'meidoorn', 1, { seizoen: 'herfst' }],
    ['hazelaar lente', 'hazelaar', 1, { seizoen: 'lente' }],
    ['hazelaar herfst', 'hazelaar', 1, { seizoen: 'herfst' }],
  ]],
];

// Eén rij: de bomen naast elkaar, met hun anker op één lijn, in een eigen plaat (ruw, als JSON met de pixels).
function rij(i) {
  const [, bomen] = RIJEN[i];
  const plaat = new K.Plaat(CEL[0] * bomen.length, CEL[1]);
  bomen.forEach(([naam, soort, zaad, o, wit], j) => {
    const t0 = Date.now();
    let mdl = Bm[soort](zaad, o);
    if (wit) mdl = Bm.sneeuw(mdl, { zaad });
    const p = K.losRenderen(mdl, { b: CEL[0], h: CEL[1], anker: ANKER, richting: 'Z' });
    Bm.ontspikkel(p, ['blad', 'den', 'herfst', 'gras', 'mos', 'goud', 'riet', 'lente', 'bloesem', 'stro']);
    plaat.plak(p, j * CEL[0], 0);
    console.log(`rij ${i + 1}: ${naam} ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  });
  return plaat;
}

function samen(platen) {
  const { schrijf } = require('./huis-sdf-export.cjs');
  const breed = Math.max(...platen.map((p) => p.b));
  const plaat = new K.Plaat(breed, platen.reduce((s, p) => s + p.h + KOP, 0));
  let y = 0;
  platen.forEach((p, i) => {
    const [kop, bomen] = RIJEN[i];
    schrijf(plaat, kop, 8, y + 6, 2);
    bomen.forEach(([naam], j) => schrijf(plaat, naam, j * CEL[0] + 8, y + KOP + CEL[1] - 18, 1));
    plaat.plak(p, 0, y + KOP);
    y += p.h + KOP;
  });
  return plaat;
}

if (require.main === module) {
  fs.mkdirSync(UIT, { recursive: true });
  const welke = process.argv[2];
  if (process.argv[3] === '--rij') {
    // een kind: rendert één rij en schrijft hem als ruwe plaat
    const p = rij(Number(welke));
    fs.writeFileSync(path.join(UIT, `rij-${welke}.bin`), Buffer.concat([Buffer.from(new Int32Array([p.b, p.h]).buffer), Buffer.from(p.px.buffer)]));
  } else {
    const t0 = Date.now();
    const rijen = welke ? [Number(welke) - 1] : RIJEN.map((_, i) => i);
    Promise.all(
      rijen.map(
        (i) =>
          new Promise((klaar, mis) => {
            const k = spawn(process.execPath, [__filename, String(i), '--rij'], { stdio: 'inherit' });
            k.on('exit', (c) => (c ? mis(new Error(`rij ${i + 1} faalde`)) : klaar()));
          }),
      ),
    ).then(() => {
      const platen = rijen.map((i) => {
        const buf = fs.readFileSync(path.join(UIT, `rij-${i}.bin`));
        const [b, h] = new Int32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + 8));
        const p = new K.Plaat(b, h);
        p.px = new Int16Array(buf.buffer.slice(buf.byteOffset + 8, buf.byteOffset + 8 + b * h * 4));
        return p;
      });
      // samen() kent de rijen op hun nummer: geef een enkele rij zijn eigen kop
      const plaat = welke ? (RIJEN.splice(0, RIJEN.length, RIJEN[rijen[0]]), samen(platen)) : samen(platen);
      const naam = welke ? `proef-${welke}.png` : 'proef.png';
      fs.writeFileSync(path.join(UIT, naam), K.png(plaat, 1, '#5a6e3a'));
      for (const i of rijen) fs.unlinkSync(path.join(UIT, `rij-${i}.bin`));
      console.log(`${naam}: ${plaat.b}×${plaat.h}, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    });
  }
}

module.exports = { RIJEN };
