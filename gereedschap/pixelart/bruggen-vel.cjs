// De bruggen van het eiland op een vel voor het spel (bruggen.cjs; ontwerp/werklijst.md, vraag 170, stap 6a2; Marcel, 17
// okt: "Goed zo, zet ze in het spel"). Het spel legt een brug van elke lengte (js/eiland.js, legBruggen), dus komt hij hier
// in stukken van één tegel, in twee lagen: wat achter wie erop loopt ligt (het dek, de borstwering aan de overkant, de
// zijkant, de bogen en de pijlers) en wat ervóór (de borstwering of de leuning aan de kant van de kijker). js/tekenen.js legt
// de achterlaag vóór een wezen op die tegel en de voorlaag erna, zoals het graan.
//
// Een stuk wordt niet los gerenderd: dan had de omlijning een naad op elke tegelrand. Er wordt een hele brug gerenderd (een
// monster), en elke pixel gaat naar de tegel en de laag van de plek die hij toont (B.pos). De stenen brug heeft bogen van
// twee tegels en in het midden soms één van drie (bruggen.cjs, bogen), dus het spel zet een lange brug in elkaar uit
// eenheden van één boog: het begin (een landhoofd en de eerste boog), bogen ertussen en het eind; elk komt uit een monster,
// en een naad tussen twee eenheden valt midden op een pijler. Monsters: L1, L2 en L3 heel, L5 (het begin met een boog van
// drie) en L9 (begin, een boog van drie, een van twee, eind). De jukbrug: L3 (begin, twee jukken, het laatste stuk zonder
// juk, eind). De houten boogbrug buigt over zijn hele lengte: L1 tot L6 elk heel.
//
// Wat onder het water ligt, valt weg: in het spel is het water het maaiveld (BRUG.waterVlak 0), en de grond tekent het.
//
//   node gereedschap/pixelart/naar-spel.cjs --alleen bruggen    (beelden/bruggen.png en de beschrijving)
//   node gereedschap/pixelart/bruggen-vel.cjs                   (alleen uit/bruggen-vel.png, om te bekijken)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');
const Br = require('./bruggen.cjs');

const { TEGEL, PXH, klem } = K;
const T = TEGEL;

// Het monster ligt met zijn eerste tegel water op GA en zijn middelste rij op GC (in tegels van de tekening).
const GA = 1;
const GC = 2;
// Welke monsters er zijn, per soort brug.
const MONSTERS = {
  steen: [1, 2, 3, 5, 9],
  juk: [3],
  boog: [1, 2, 3, 4, 5, 6],
};
const STENEN = { veldsteen: 41, zandsteen: 45, baksteen: 47 }; // de steen en zijn zaad, zoals op de proefplaat
const SOORTEN = [...Object.keys(STENEN).map((s) => ['steen', s]), ['juk', null], ['boog', null]];
const VEL_BREED = 1024;

// Een hele brug van deze soort, als stukken (bruggen.cjs).
function brug(soort, steen, as, L) {
  const o = { as, ga: GA, gc: GC, L, steen, zaad: steen ? STENEN[steen] : soort === 'juk' ? 53 : 59 };
  return soort === 'steen' ? Br.steenBrug(o) : soort === 'juk' ? Br.jukBrug(o) : Br.houtBoogBrug(o);
}

// Het vak op het scherm waar de brug in valt, met wat ruimte: langs van het eerste tot het laatste landhoofd, dwars met de
// pijlerkoppen erbij, en tot boven de leuning.
function vakVan(as, L) {
  const hoeken = [];
  for (const a of [GA - 1, GA + L + 1]) {
    for (const c of [GC - 1.6, GC + 2]) {
      for (const z of [-2, 80]) {
        const [X, Y] = as === 'x' ? [a * T, c * T] : [c * T, a * T];
        hoeken.push([X * K.EX[0] + Y * K.EX[1], X * K.EY[0] + Y * K.EY[1] + (z / PXH) * K.EY[2]]);
      }
    }
  }
  const x0 = Math.floor(Math.min(...hoeken.map((h) => h[0]))) - 3;
  const y0 = Math.floor(Math.min(...hoeken.map((h) => h[1]))) - 3;
  const x1 = Math.ceil(Math.max(...hoeken.map((h) => h[0]))) + 3;
  const y1 = Math.ceil(Math.max(...hoeken.map((h) => h[1]))) + 3;
  return { b: x1 - x0, h: y1 - y0, OX: -x0, OY: -y0 };
}

// Een monster renderen en in stukken knippen: { i, k, laag, plaat, anker } per stuk, met i langs (-1 tot L, vanaf de
// eerste tegel water), k dwars (0 tot 2) en laag 0 (achter) of 1 (voor).
function monster(soort, steen, as, L) {
  const vak = vakVan(as, L);
  const B = new K.Beeld(vak.b, vak.h, vak.OX, vak.OY);
  const vormen = Br.zetBrug(B, brug(soort, steen, as, L));
  D.zonSchaduw(B, vormen, { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  const voor = Int16Array.from(B.ramp); // wat er vóór de omlijning was
  K.omlijn(B);
  const q = K.kwantiseer(B);
  const n = B.b * B.h;
  // per pixel het stuk: (i + 1) * 6 + k * 2 + laag, of -1
  const stuk = new Int32Array(n).fill(-1);
  for (let p = 0; p < n; p++) {
    if (voor[p] < 0) continue;
    const X = B.pos[p * 3] / T;
    const Y = B.pos[p * 3 + 1] / T;
    const h = B.pos[p * 3 + 2] * PXH;
    if (h < -0.25) continue; // onder water
    const langs = as === 'x' ? X : Y;
    const i = klem(Math.floor(langs) - GA, -1, L);
    const k = klem(Math.floor(as === 'x' ? Y : X) - (GC - 1), 0, 2);
    // vóór wie er staat: boven het wegdek, en dichter bij de kijker dan het midden van zijn tegel
    const [tx, ty] = as === 'x' ? [GA + i, GC - 1 + k] : [GC - 1 + k, GA + i];
    const diepte = X - (tx + 0.5) + (Y - (ty + 0.5));
    const dek = Br.dekOp(soort, L, langs - GA) + (soort === 'steen' ? Br.BRUG.bol : 0);
    stuk[p] = (i + 1) * 6 + k * 2 + (diepte > 0 && h > dek + 1 ? 1 : 0);
  }
  // de omlijning hoort bij het stuk ernaast dat het verst naar voren ligt
  for (let p = 0; p < n; p++) {
    if (voor[p] >= 0 || B.ramp[p] < 0) continue;
    const x = p % B.b;
    const y = (p - x) / B.b;
    let beste = -1;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const j = (y + dy) * B.b + x + dx;
      if (x + dx < 0 || y + dy < 0 || x + dx >= B.b || y + dy >= B.h || stuk[j] < 0) continue;
      if (beste < 0 || B.diep[j] > B.diep[beste]) beste = j;
    }
    if (beste >= 0) stuk[p] = stuk[beste];
  }
  // knippen
  const kaders = new Map();
  for (let p = 0; p < n; p++) {
    const s = stuk[p];
    if (s < 0 || q.px[p * 2] < 0) continue;
    const x = p % B.b;
    const y = (p - x) / B.b;
    const kd = kaders.get(s) || { x0: x, y0: y, x1: x, y1: y };
    kaders.set(s, { x0: Math.min(kd.x0, x), y0: Math.min(kd.y0, y), x1: Math.max(kd.x1, x), y1: Math.max(kd.y1, y) });
  }
  const uit = [];
  for (const [s, kd] of [...kaders].sort((a, b) => a[0] - b[0])) {
    const plaat = new K.Plaat(kd.x1 - kd.x0 + 1, kd.y1 - kd.y0 + 1);
    for (let y = kd.y0; y <= kd.y1; y++) {
      for (let x = kd.x0; x <= kd.x1; x++) {
        const p = y * B.b + x;
        if (stuk[p] === s && q.px[p * 2] >= 0) plaat.zet(x - kd.x0, y - kd.y0, q.px[p * 2], q.px[p * 2 + 1]);
      }
    }
    const i = Math.floor(s / 6) - 1;
    const k = Math.floor((s % 6) / 2);
    const laag = s % 2;
    // het anker: het midden van de tegel op het maaiveld
    const [tx, ty] = as === 'x' ? [GA + i, GC - 1 + k] : [GC - 1 + k, GA + i];
    const [ax, ay] = K.tegelNaarScherm(B, tx + 0.5, ty + 0.5);
    uit.push({ i, k, laag, plaat, anker: [Math.round(ax - kd.x0), Math.round(ay - kd.y0)] });
  }
  return uit;
}

// Alle stukken op één vel, in planken van boven naar beneden (de hoogste eerst), en de beschrijving: per soort ('steen-
// veldsteen', 'juk', ...), per as en per monster ('L9') een lijst 'i k laag sx sy b h ax ay' (een regel per stuk, zodat
// de beschrijving niet een regel per getal krijgt).
function vel() {
  const alle = [];
  for (const [soort, steen] of SOORTEN) {
    const naam = steen ? `${soort}-${steen}` : soort;
    for (const as of ['x', 'y']) {
      for (const L of MONSTERS[soort]) {
        const t0 = Date.now();
        for (const s of monster(soort, steen, as, L)) alle.push({ naam, as, monster: `L${L}`, ...s });
        if (process.env.PRAAT) console.log(naam, as, `L${L}`, Date.now() - t0, 'ms');
      }
    }
  }
  const volgorde = alle.slice().sort((a, b) => b.plaat.h - a.plaat.h || b.plaat.b - a.plaat.b);
  let x = 0;
  let y = 0;
  let plank = 0;
  for (const s of volgorde) {
    if (x + s.plaat.b > VEL_BREED) {
      x = 0;
      y += plank;
      plank = 0;
    }
    s.sx = x;
    s.sy = y;
    x += s.plaat.b;
    plank = Math.max(plank, s.plaat.h);
  }
  const plaat = new K.Plaat(VEL_BREED, y + plank);
  for (const s of alle) plaat.plak(s.plaat, s.sx, s.sy);
  const stukken = {};
  for (const s of alle) {
    const per = ((stukken[s.naam] = stukken[s.naam] || {})[s.as] = stukken[s.naam][s.as] || {});
    (per[s.monster] = per[s.monster] || []).push([s.i, s.k, s.laag, s.sx, s.sy, s.plaat.b, s.plaat.h, s.anker[0], s.anker[1]].join(' '));
  }
  return { plaat, stukken };
}

// Wat in beelden/beschrijving.json komt: het bestand, de maten van het wegdek (voor wie erop loopt, js/sprites.js:
// S.brugDek) en de stukken.
function beschrijving(bestand, stukken) {
  const { BRUG, HOUT } = Br;
  return {
    bestand,
    maten: { aanloop: BRUG.aanloop, dek: { steen: BRUG.dek, juk: HOUT.dek, boog: HOUT.dek }, bult: HOUT.bult },
    stukken,
  };
}

// In het spel ligt het water op het maaiveld.
Br.BRUG.waterVlak = 0;

module.exports = { vel, beschrijving, MONSTERS };

if (require.main === module) {
  console.time('bruggen-vel');
  const { plaat } = vel();
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'bruggen-vel.png'), K.png(plaat, 1));
  console.timeEnd('bruggen-vel');
  console.log(`uit/bruggen-vel.png (${plaat.b}×${plaat.h})`);
}
