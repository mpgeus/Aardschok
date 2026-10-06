'use strict';
// Schrijft de bomen en de begroeiing weg als PNG op ware grootte (1 pixel = 1 pixel), op een
// doorzichtige achtergrond, in vaste cellen op één rij, plus de proefscène van de bosrand. Naast
// elke strook een klein JSON-bestand met de celmaat, het ankerpunt (het midden van de tegel, waar
// de voet staat) en de namen op volgorde, zodat het spel de cellen kan uitsnijden.
//
// `node export-bomen.cjs jong` maakt alleen de proefplaat van de jonge bomen (vraag 115, f):
// uit/buiten/jonge-bomen-proef.png.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Bm = require('./bomen.cjs');
const { bosRand } = require('./proef-bos.cjs');

const UIT = path.join(__dirname, 'uit', 'buiten');
fs.mkdirSync(UIT, { recursive: true });

const STROKEN = {
  bomen: {
    cel: [224, 320],
    anker: [112, 292],
    lijst: [['eik', 1], ['eik', 2], ['herfstEik', 2], ['den', 1], ['den', 2], ['berk', 2], ['berk', 3], ['dodeBoom', 1], ['dodeBoom', 4], ['wilg', 1], ['appelboom', 1]],
  },
  begroeiing: {
    cel: [96, 96],
    anker: [48, 72],
    lijst: [
      ['struik', 1],
      ['struik', 2],
      ['bessenStruik', 2],
      ['varen', 1],
      ['varen', 2],
      ['grasPol', 1],
      ['grasPol', 2],
      ['hoogGras', 1],
      ['bloemen', 1],
      ['bloemen', 2],
      ['bloemen', 3],
      ['paddenstoelen', 1],
      ['paddenstoelen', 2],
      ['boomstronk', 1],
      ['rots', 1],
      ['rots', 2],
      ['kleineRots', 1],
      ['kleineRots', 2],
    ],
  },
};

function alles() {
  for (const [naam, { cel, anker, lijst }] of Object.entries(STROKEN)) {
    const [b, h] = cel;
    const vel = new K.Plaat(b * lijst.length, h);
    lijst.forEach(([soort, zaad], i) => {
      const t0 = Date.now();
      const p = K.losRenderen(Bm[soort](zaad), { b, h, anker, richting: 'Z' });
      Bm.ontspikkel(p);
      vel.plak(p, i * b, 0);
      console.log(`${naam} ${i}: ${soort}(${zaad}) ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    });
    fs.writeFileSync(path.join(UIT, `${naam}.png`), K.png(vel, 1));
    const cellen = lijst.map(([soort, zaad], i) => ({ x: i * b, soort, zaad }));
    fs.writeFileSync(path.join(UIT, `${naam}.json`), JSON.stringify({ cel, anker, richting: 'Z', cellen }, null, 1) + '\n');
  }

  const t0 = Date.now();
  fs.writeFileSync(path.join(UIT, 'bos-proef.png'), K.png(bosRand(), 1));
  console.log(`bos-proef ${((Date.now() - t0) / 1000).toFixed(1)} s`);

  for (const f of fs.readdirSync(UIT).filter((f) => f.endsWith('.png'))) {
    const buf = fs.readFileSync(path.join(UIT, f));
    console.log(f, buf.readUInt32BE(16) + '×' + buf.readUInt32BE(20), buf.length, 'bytes');
  }
}

// ---------------------------------------------------------------- de jonge bomen

// Zo tekent het spel een figuur (dorpelingen-anim.cjs; zoals de proefplaat in meiboom.cjs).
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

// Wat er op een plaat getekend is: [x0, y0, x1, y1], of null.
function getekend(p) {
  let x0 = p.b;
  let y0 = p.h;
  let x1 = -1;
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
  return x1 < 0 ? null : [x0, y0, x1, y1];
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

// Per soort een rij op één grondlijn: het boompje, de jonge boom en de volwassen boom, elk met een
// boer ernaast voor de maat, twee keer vergroot. In de console hoe hoog elk is.
function jong() {
  const cel = [224, 320];
  const anker = [112, 292];
  const { boer } = require('./dorpelingen.cjs');
  const figuur = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' });
  const fig = getekend(figuur);
  const render = (soort) => {
    const p = K.losRenderen(Bm[soort](1), { b: cel[0], h: cel[1], anker, richting: 'Z' });
    Bm.ontspikkel(p);
    const d = getekend(p);
    console.log(`${soort}: ${anker[1] - d[1]} px hoog, ${d[2] + 1 - d[0]} breed (een boer is ${FIG_ANKER[1] - fig[1]} hoog)`);
    return { p, d };
  };
  const boompje = render('boompje');
  const rijen = [['jongeEik', 'eik'], ['jongeDen', 'den'], ['jongeBerk', 'berk']].map((r) => [boompje, ...r.map(render)]);
  const tussen = 24;
  const breed = Math.max(...rijen.map((r) => r.reduce((som, { d }) => som + d[2] + 1 - d[0] + fig[2] + 1 - fig[0] + 2 * tussen, tussen)));
  const hoog = rijen.map((r) => Math.max(...r.map(({ d }) => anker[1] - d[1])) + 40);
  const plaat = new K.Plaat(breed, hoog.reduce((a, b) => a + b, 0) + 8);
  let grond = 0;
  rijen.forEach((rij, i) => {
    grond += hoog[i];
    let x = tussen;
    for (const { p, d } of rij) {
      x += anker[0] - d[0];
      plaat.plak(p, x - anker[0], grond - anker[1]);
      x += d[2] + 1 - anker[0] + tussen;
      // de boer rechts ernaast, een halve tegel naar voren
      x += FIG_ANKER[0] - fig[0];
      plaat.plak(figuur, x - FIG_ANKER[0], grond + 8 - FIG_ANKER[1]);
      x += fig[2] + 1 - FIG_ANKER[0] + tussen;
    }
  });
  fs.writeFileSync(path.join(UIT, 'jonge-bomen-proef.png'), K.png(vergroot(plaat, 2), 1, '#5e6a44'));
  console.log(`uit/buiten/jonge-bomen-proef.png (${plaat.b * 2}×${plaat.h * 2})`);
}

if (process.argv[2] === 'jong') jong();
else alles();
