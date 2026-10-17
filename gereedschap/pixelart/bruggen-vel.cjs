// De bruggen van het eiland op een vel voor het spel (bruggen.cjs; ontwerp/werklijst.md, vraag 170, stap 6a2; Marcel, 17
// okt: "Goed zo, zet ze in het spel"). Het spel legt een brug van elke lengte (js/eiland.js, legBruggen), dus komt hij hier
// in stukken van één tegel, in drie lagen: het dek (het wegdek, de zijkant, de bogen en de pijlers), wat erachter boven het
// wegdek uitsteekt (de borstwering aan de overkant), en wat ervóór (de borstwering of de leuning aan de kant van de
// kijker). js/tekenen.js legt het dek als grond onder wie erop staat (Marcel, 17 okt: "de ossenkar lijkt nog in de brug te
// zakken"), de overkant vóór hem en de kant van de kijker erna, zoals het graan.
//
// Een stuk wordt niet los gerenderd: dan had de omlijning een naad op elke tegelrand. Er wordt een hele brug gerenderd (een
// monster), en elke pixel gaat naar de tegel en de laag van de plek die hij toont (B.pos). De stenen brug heeft bogen van
// twee tegels en in het midden soms één van drie (bruggen.cjs, bogen), dus het spel zet een lange brug in elkaar uit
// eenheden van één boog: het begin (een landhoofd en de eerste boog), bogen ertussen en het eind; elk komt uit een monster,
// en een naad tussen twee eenheden valt midden op een pijler. Monsters: L1, L2 en L3 heel, L5 (het begin met een boog van
// drie) en L9 (begin, een boog van drie, een van twee, eind). De jukbrug: L3 (begin, twee jukken, het laatste stuk zonder
// juk, eind). De houten boogbrug buigt over zijn hele lengte: L1 tot L6 elk heel. Schuin (zn en wo, vier rijen; Marcel, 17
// okt: "De bruggen moeten in 8 richtingen", "r2, zet maar in het spel") heeft de stenen brug een boog per stap: L1 en L3
// (begin, een stap ertussen, eind); de jukbrug L3, de boogbrug L1 tot L4.
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

// Waar een monster ligt: langs x en y met zijn eerste tegel water op 1 en zijn middelste rij op 2; schuin zo dat langs en
// dwars in de tekening positief zijn (de texturen tellen hun stenen vanaf 0; bruggen.cjs, raam).
const PLEK = { x: { ga: 1, gc: 2 }, y: { ga: 1, gc: 2 }, zn: { gx: 3, gy: 8 }, wo: { gx: 10, gy: 4 } };
const ASSEN = ['x', 'y', 'zn', 'wo'];
// Welke monsters er zijn, per soort brug: langs x en y, en schuin (daar een boog per stap, dus L1 en L3 voor steen; de
// boogbrug tot zes tegels is schuin vier stappen).
const MONSTERS = {
  steen: [1, 2, 3, 5, 9],
  juk: [3],
  boog: [1, 2, 3, 4, 5, 6],
};
const SCHUINE_MONSTERS = { steen: [1, 3], juk: [3], boog: [1, 2, 3, 4] };
const STENEN = { veldsteen: 41, zandsteen: 45, baksteen: 47 }; // de steen en zijn zaad, zoals op de proefplaat
const SOORTEN = [...Object.keys(STENEN).map((s) => ['steen', s]), ['juk', null], ['boog', null]];
const VEL_BREED = 1024;

// De opgave van een monster: een hele brug van deze soort langs deze as.
const opgave = (soort, steen, as, L) => ({ as, ...PLEK[as], L, steen, zaad: steen ? STENEN[steen] : soort === 'juk' ? 53 : 59 });
function brug(soort, o) {
  return soort === 'steen' ? Br.steenBrug(o) : soort === 'juk' ? Br.jukBrug(o) : Br.houtBoogBrug(o);
}

// Het vak op het scherm waar de brug in valt, met wat ruimte: alle tegels van de brug en een tegel eromheen (de
// pijlerkoppen), tot boven de leuning.
function vakVan(F, L) {
  const punten = [];
  for (let i = -2; i <= L + 1; i++) {
    for (let k = -1; k <= F.R; k++) {
      const [tx, ty] = F.tegel(i, k);
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const [X, Y] = [(tx + dx) * T, (ty + dy) * T];
        for (const z of [-2, 80]) punten.push([X * K.EX[0] + Y * K.EX[1], X * K.EY[0] + Y * K.EY[1] + (z / PXH) * K.EY[2]]);
      }
    }
  }
  const x0 = Math.floor(Math.min(...punten.map((p) => p[0]))) - 3;
  const y0 = Math.floor(Math.min(...punten.map((p) => p[1]))) - 3;
  const x1 = Math.ceil(Math.max(...punten.map((p) => p[0]))) + 3;
  const y1 = Math.ceil(Math.max(...punten.map((p) => p[1]))) + 3;
  return { b: x1 - x0, h: y1 - y0, OX: -x0, OY: -y0 };
}

// Een monster renderen en in stukken knippen: { i, k, laag, plaat, anker } per stuk, met i langs (-1 tot L, vanaf de
// eerste stap water), k de rij (0 tot 2, schuin 3) en de laag: 0 het dek (het wegdek en alles wat niet boven het wegdek
// uitsteekt: de zijkant, de bogen, de pijlers), 1 wat boven het wegdek uitsteekt vóór het midden van de tegel (de
// borstwering of de leuning aan de kant van de kijker), 2 wat erboven uitsteekt erachter (die aan de overkant).
function monster(soort, steen, as, L) {
  const o = opgave(soort, steen, as, L);
  const F = Br.raam(o);
  const vak = vakVan(F, L);
  const B = new K.Beeld(vak.b, vak.h, vak.OX, vak.OY);
  const vormen = Br.zetBrug(B, brug(soort, o));
  D.zonSchaduw(B, vormen, { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  const voor = Int16Array.from(B.ramp); // wat er vóór de omlijning was
  K.omlijn(B);
  const q = K.kwantiseer(B);
  const n = B.b * B.h;
  // Bij welk stuk een punt hoort: de tegel eronder als die van de brug is, anders het dichtste stuk (langs en dwars in
  // het raam, met de rij om en om een halve stap verschoven).
  const plek = new Map();
  for (let i = -1; i <= L; i++) for (let k = 0; k < F.R; k++) plek.set(F.tegel(i, k).join(','), [i, k]);
  const [t0x, t0y] = F.tegel(0, 0);
  const c0 = F.dwars((t0x + 0.5) * T, (t0y + 0.5) * T);
  const rij = F.schuin ? T * Math.SQRT1_2 : T;
  const midden = (k) => (F.schuin ? 0.25 + 0.5 * (k % 2) : 0.5); // waar het midden van een tegel in zijn stap ligt
  const stukVan = (X, Y) => {
    const p = plek.get(`${Math.floor(X / T)},${Math.floor(Y / T)}`);
    if (p) return p;
    const k = klem(Math.round((F.dwars(X, Y) - c0) / rij), 0, F.R - 1);
    return [klem(Math.round((F.langs(X, Y) - F.aW) / F.S - midden(k)), -1, L), k];
  };
  // per pixel het stuk: (i + 1) * 12 + k * 3 + laag, of -1
  const stuk = new Int32Array(n).fill(-1);
  for (let p = 0; p < n; p++) {
    if (voor[p] < 0) continue;
    const [X, Y] = [B.pos[p * 3], B.pos[p * 3 + 1]];
    const h = B.pos[p * 3 + 2] * PXH;
    if (h < -0.25) continue; // onder water
    const [i, k] = stukVan(X, Y);
    // vóór wie er staat: boven het wegdek, en dichter bij de kijker dan het midden van zijn tegel
    const [tx, ty] = F.tegel(i, k);
    const diepte = X / T - (tx + 0.5) + (Y / T - (ty + 0.5));
    const dek = Br.dekOp(soort, L, (F.langs(X, Y) - F.aW) / F.S, F.stap) + (soort === 'steen' ? Br.BRUG.bol : 0);
    stuk[p] = (i + 1) * 12 + k * 3 + (h <= dek + 1 ? 0 : diepte > 0 ? 1 : 2);
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
    const i = Math.floor(s / 12) - 1;
    const k = Math.floor((s % 12) / 3);
    const laag = s % 3;
    // het anker: het midden van de tegel op het maaiveld
    const [tx, ty] = F.tegel(i, k);
    const [ax, ay] = K.tegelNaarScherm(B, tx + 0.5, ty + 0.5);
    const voeten = laag === 0 ? voetenVan(B, stuk, voor, q, s, kd) : '';
    uit.push({ i, k, laag, plaat, anker: [Math.round(ax - kd.x0), Math.round(ay - kd.y0)], voeten });
  }
  return uit;
}

// De voeten van stuk s in het dek (vraag 174, stap b3; Marcel, 17 okt: "Toch B2: de brug op de oevers, met de pijlers in
// code verlengd"): per kolom waarvan de onderste pixel het water raakt (een pixel van de vorm daar, of tot twee rijen
// erboven en een kolom ernaast, ligt hooguit VOET pixels boven het water), de rij die js/tekenen.js omlaag trekt (ys: de
// steen of het hout boven de omlijning, of de omlijning zelf aan de zijkant van een pijler) en vanaf waar (yd: de
// onderste pixel). Zo komt een pijler, een juk of de zijkant van een landhoofd tot het water als de brug op de heuvels
// hoger ligt dan het water. Kolommen naast elkaar met dezelfde rijen gaan samen: 'x,b,ys,yd' met ';' ertussen, binnen
// het stuk.
const VOET = 2;
function voetenVan(B, stuk, voor, q, s, kd) {
  const van = (x, y) => x >= 0 && y >= 0 && x < B.b && y < B.h && stuk[y * B.b + x] === s && q.px[(y * B.b + x) * 2] >= 0;
  const vorm = (x, y) => van(x, y) && voor[y * B.b + x] >= 0;
  const hoogte = (x, y) => B.pos[(y * B.b + x) * 3 + 2] * PXH;
  const kolommen = [];
  for (let x = kd.x0; x <= kd.x1; x++) {
    let y = kd.y1;
    while (y >= kd.y0 && !van(x, y)) y--;
    if (y < kd.y0) continue;
    let raakt = false;
    for (let dy = 0; dy <= 2 && !raakt; dy++) for (const dx of [-1, 0, 1]) if (vorm(x + dx, y - dy) && hoogte(x + dx, y - dy) <= VOET) raakt = true;
    if (!raakt) continue;
    const ys = !vorm(x, y) && vorm(x, y - 1) ? y - 1 : y;
    kolommen.push([x - kd.x0, ys - kd.y0, y - kd.y0]);
  }
  const runs = [];
  for (const [x, ys, yd] of kolommen) {
    const vorige = runs[runs.length - 1];
    if (vorige && vorige[0] + vorige[1] === x && vorige[2] === ys && vorige[3] === yd) vorige[1]++;
    else runs.push([x, 1, ys, yd]);
  }
  return runs.map((r) => r.join(',')).join(';');
}

// Alle stukken op één vel, in planken van boven naar beneden (de hoogste eerst), en de beschrijving: per soort ('steen-
// veldsteen', 'juk', ...), per as en per monster ('L9') een lijst 'i k laag sx sy b h ax ay', in het dek met de voeten
// erachter (voetenVan; een regel per stuk, zodat de beschrijving niet een regel per getal krijgt).
function vel() {
  const alle = [];
  for (const [soort, steen] of SOORTEN) {
    const naam = steen ? `${soort}-${steen}` : soort;
    for (const as of ASSEN) {
      for (const L of (as === 'zn' || as === 'wo' ? SCHUINE_MONSTERS : MONSTERS)[soort]) {
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
    const regel = [s.i, s.k, s.laag, s.sx, s.sy, s.plaat.b, s.plaat.h, s.anker[0], s.anker[1]];
    if (s.voeten) regel.push(s.voeten);
    (per[s.monster] = per[s.monster] || []).push(regel.join(' '));
  }
  return { plaat, stukken };
}

// Wat in beelden/beschrijving.json komt: het bestand, de maten van het wegdek (voor wie erop loopt, js/sprites.js:
// S.brugDek) en de stukken.
function beschrijving(bestand, stukken) {
  const { BRUG, HOUT } = Br;
  return {
    bestand,
    maten: { aanloop: BRUG.aanloop, dek: { steen: BRUG.dek, juk: HOUT.dek, boog: HOUT.dek }, bult: HOUT.bult, schuinRijen: BRUG.schuinBreed },
    stukken,
  };
}

// In het spel ligt het water op het maaiveld.
Br.BRUG.waterVlak = 0;

module.exports = { vel, beschrijving, MONSTERS, SCHUINE_MONSTERS };

if (require.main === module) {
  console.time('bruggen-vel');
  const { plaat } = vel();
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'bruggen-vel.png'), K.png(plaat, 1));
  console.timeEnd('bruggen-vel');
  console.log(`uit/bruggen-vel.png (${plaat.b}×${plaat.h})`);
}
