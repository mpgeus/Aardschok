// De proefplaten van het groen (werklijst vraag 148; Marcel, 9 okt: "a. Ja goed idee b. Ja vegetatie en bomen met
// seizoenen mee. Ook vruchten etc.", en "Sneeuw moet ook nog op bomen, huizen etc.").
// De bomen (stap 1), rij voor rij: de eik in zijn vormen, de eik in het jaar (met sneeuw, en de kerstboom), de appelboom,
// de berk en de wilg in het jaar, de nieuwe soorten in de zomer, en de nieuwe soorten in een ander seizoen.
// Het groen eronder (stap 3; Marcel, 11 okt: "Akkoord. Start maar met proefplaat"): per soort een rij, eerst het jaar
// (lente, zomer, herfst, winter, en de winter met sneeuw), dan de andere vormen in de zomer, elk op de grond waar het
// straks staat, op 2× (op 1× zie je het zoals in het spel dichtbij). Alles uit bomen.cjs; elke rij in een eigen proces.
//
//   node gereedschap/pixelart/groen-proef.cjs            de bomen, in gereedschap/pixelart/uit/groen/proef.png (niet in git)
//   node gereedschap/pixelart/groen-proef.cjs 2          alleen rij 2 (als proef-2.png)
//   node gereedschap/pixelart/groen-proef.cjs onder      het groen eronder, in uit/groen/onder.png
//   node gereedschap/pixelart/groen-proef.cjs onder 3    alleen rij 3 (als onder-3.png)
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const K = require('./kern.cjs');
const Bm = require('./bomen.cjs');

const UIT = path.join(__dirname, 'uit', 'groen');
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

// Het groen eronder: per soort het jaar, de winter met sneeuw, en zijn andere vormen in de zomer. [opschrift, soort,
// zaad, opties, sneeuw, grond]
const JAAR = ['lente', 'zomer', 'herfst', 'winter'];
function jaarRij(kop, soort, vormen = [], grond = 'gras') {
  return [
    kop,
    [
      ...JAAR.map((s) => [s, soort, 1, { seizoen: s }, false, grond]),
      ['sneeuw', soort, 1, { seizoen: 'winter' }, true, 'sneeuw'],
      ...vormen.map(([naam, zaad, o]) => [naam, soort, zaad, o || {}, false, grond]),
    ],
  ];
}
const zaden = [['zaad 2', 2], ['zaad 3', 3]];
const ONDER = [
  jaarRij('Struik', 'struik', [['laag', 1, { vorm: 'laag' }], ['hoog', 1, { vorm: 'hoog' }], ['klein', 1, { vorm: 'klein' }]]),
  jaarRij('Bessenstruik', 'bessenStruik', [['laag', 1, { vorm: 'laag' }], ['hoog', 1, { vorm: 'hoog' }], ['klein', 1, { vorm: 'klein' }]]),
  jaarRij('Varen', 'varen', [['klein', 1, { vorm: 'klein' }], ['groot', 1, { vorm: 'groot' }]]),
  jaarRij('Graspol', 'grasPol', [['dun', 1, { vorm: 'dun' }], ['breed', 1, { vorm: 'breed' }]]),
  jaarRij('Hoog gras', 'hoogGras', [['dun', 1, { vorm: 'dun' }], ['breed', 1, { vorm: 'breed' }]]),
  jaarRij('Bloemen', 'bloemen', zaden),
  jaarRij('Paddenstoelen', 'paddenstoelen', zaden),
  [
    'Stronk en stenen: alleen sneeuw',
    [
      ['stronk', 'boomstronk', 1, {}, false, 'gras'],
      ['sneeuw', 'boomstronk', 1, {}, true, 'sneeuw'],
      ['rots', 'rots', 1, {}, false, 'gras'],
      ['sneeuw', 'rots', 1, {}, true, 'sneeuw'],
      ['steentje', 'kleineRots', 1, {}, false, 'gras'],
      ['sneeuw', 'kleineRots', 1, {}, true, 'sneeuw'],
    ],
  ],
  jaarRij('Nieuw: klaproos (langs de akkers)', 'klaproos', zaden),
  jaarRij('Nieuw: korenbloem (langs de akkers)', 'korenbloem', zaden),
  jaarRij('Nieuw: brandnetels (achter de huizen)', 'brandnetel', zaden),
  jaarRij('Nieuw: heide, bloeit in de zomer', 'heide', [['lang', 1, { vorm: 'lang' }], ['klein', 1, { vorm: 'klein' }]], 'heide'),
  jaarRij('Nieuw: brem (op de heide)', 'brem', zaden, 'heide'),
  jaarRij('Nieuw: distel (op de heide)', 'distel', zaden, 'heide'),
  jaarRij('Nieuw: lisdodde (aan het water)', 'lisdodde', zaden),
  jaarRij('Nieuw: waterlelie (op het water)', 'waterlelie', zaden, 'water'),
  jaarRij('Nieuw: braam (aan de bosrand)', 'braam', zaden),
];

// Wat de renderer ontspikkelt: de bomen zoals ze al waren; het groen eronder zoals het vel van zijn seizoen (de zomer zoals
// het vel van nu).
const SEIZOEN_RAMPEN = ['blad', 'den', 'herfst', 'gras', 'mos', 'goud', 'riet', 'lente', 'bloesem', 'stro'];
const PLATEN = {
  bomen: { naam: 'proef', rijen: RIJEN, cel: [288, 372], anker: [144, 342], schaal: 1, rampen: () => SEIZOEN_RAMPEN },
  onder: { naam: 'onder', rijen: ONDER, cel: [120, 100], anker: [60, 80], schaal: 2, rampen: (o, wit) => (wit || (o.seizoen && o.seizoen !== 'zomer') ? SEIZOEN_RAMPEN : undefined) },
};

// De grond onder een cel, zodat je ziet hoe het straks staat: gras, heide, sneeuw of water, met een fijne korrel.
const GRONDEN = { gras: ['gras', 3, 4], heide: ['olijf', 2, 3], sneeuw: ['baard', 5, 6], water: ['water', 2, 3] };
function legGrond(plaat, x0, b, h, grond) {
  const [ramp, a, c] = GRONDEN[grond];
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) plaat.zet(x0 + x, y, ramp, K.hash(x, y, 7) % 5 ? a : c);
}

// Eén rij: alles naast elkaar, met het anker op één lijn, in een eigen plaat (ruw, als JSON met de pixels).
function rij(P, i) {
  const [, dingen] = P.rijen[i];
  const plaat = new K.Plaat(P.cel[0] * dingen.length, P.cel[1]);
  dingen.forEach(([naam, soort, zaad, o, wit, grond], j) => {
    const t0 = Date.now();
    let mdl = Bm[soort](zaad, o);
    if (wit) mdl = Bm.sneeuw(mdl, { zaad });
    const p = K.losRenderen(mdl, { b: P.cel[0], h: P.cel[1], anker: P.anker, richting: 'Z' });
    Bm.ontspikkel(p, P.rampen(o, wit));
    if (grond) legGrond(plaat, j * P.cel[0], P.cel[0], P.cel[1], grond);
    plaat.plak(p, j * P.cel[0], 0);
    console.log(`rij ${i + 1}: ${naam} ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  });
  return plaat;
}

function samen(P, rijen, platen) {
  const { schrijf } = require('./huis-sdf-export.cjs');
  const breed = Math.max(...platen.map((p) => p.b));
  const plaat = new K.Plaat(breed, platen.reduce((s, p) => s + p.h + KOP, 0));
  let y = 0;
  platen.forEach((p, k) => {
    const [kop, dingen] = P.rijen[rijen[k]];
    schrijf(plaat, kop, 8, y + 6, 2);
    dingen.forEach(([naam], j) => schrijf(plaat, naam, j * P.cel[0] + 8, y + KOP + P.cel[1] - 18, 1));
    plaat.plak(p, 0, y + KOP);
    y += p.h + KOP;
  });
  return plaat;
}

if (require.main === module) {
  fs.mkdirSync(UIT, { recursive: true });
  const args = process.argv.slice(2);
  const sleutel = PLATEN[args[0]] ? [args.shift()] : [];
  const P = PLATEN[sleutel[0] || 'bomen'];
  const welke = args[0];
  if (args[1] === '--rij') {
    // een kind: rendert één rij en schrijft hem als ruwe plaat
    const p = rij(P, Number(welke));
    fs.writeFileSync(path.join(UIT, `${P.naam}-rij-${welke}.bin`), Buffer.concat([Buffer.from(new Int32Array([p.b, p.h]).buffer), Buffer.from(p.px.buffer)]));
  } else {
    const t0 = Date.now();
    const rijen = welke ? [Number(welke) - 1] : P.rijen.map((_, i) => i);
    Promise.all(
      rijen.map(
        (i) =>
          new Promise((klaar, mis) => {
            const k = spawn(process.execPath, [__filename, ...sleutel, String(i), '--rij'], { stdio: 'inherit' });
            k.on('exit', (c) => (c ? mis(new Error(`rij ${i + 1} faalde`)) : klaar()));
          }),
      ),
    ).then(() => {
      const platen = rijen.map((i) => {
        const buf = fs.readFileSync(path.join(UIT, `${P.naam}-rij-${i}.bin`));
        const [b, h] = new Int32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + 8));
        const p = new K.Plaat(b, h);
        p.px = new Int16Array(buf.buffer.slice(buf.byteOffset + 8, buf.byteOffset + 8 + b * h * 4));
        return p;
      });
      const plaat = samen(P, rijen, platen);
      const naam = welke ? `${P.naam}-${welke}.png` : `${P.naam}.png`;
      fs.writeFileSync(path.join(UIT, naam), K.png(plaat, P.schaal, '#5a6e3a'));
      for (const i of rijen) fs.unlinkSync(path.join(UIT, `${P.naam}-rij-${i}.bin`));
      console.log(`${naam}: ${plaat.b * P.schaal}×${plaat.h * P.schaal}, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    });
  }
}

module.exports = { RIJEN, ONDER };
