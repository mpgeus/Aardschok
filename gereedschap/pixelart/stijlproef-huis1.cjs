'use strict';
// De stijlproef op huis1 (17 okt 2026, werklijst vraag 177; ontwerp/beeld.md, "De nieuwe stijl"): het tweede doel naast
// de herberg. Marcel, 17 okt: "Neem de plaat als tweede doel voor de stijlproef van vraag 177, naast de herberg, en maak
// eerst een proefplaat van huis1 en huis1-oud". Het doel is ontwerp/voorbeelden/huis1-stijl-doel.webp: vier vakken op
// zwart, boven het huis schoon, onder verweerd, links "Origineel" en rechts "Verbeterd"; we nemen de rechter twee. Node
// leest geen webp, dus de proef leest dezelfde plaat als PNG uit uit/schermen/huis1-stijl-doel.png, zoals de herberg.
//
// Dit bestand tekent zelf niets: het neemt render() en de plaatjes uit stijlproef.cjs, zodat de stijl één plek houdt. Het
// meet wel wat een tekening in de nieuwe stijl moet houden: hetzelfde silhouet als de tekening van het spel, pixel voor
// pixel, jong en oud. Dan liggen de voet, het anker, de deur en de ramen waar ze lagen.
//
//   node gereedschap/pixelart/stijlproef-huis1.cjs      de plaat en de meting naar uit/stijlproef/huis1/ (niet in git)
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const P = require('./stijlproef.cjs');

const UIT = path.join(__dirname, 'uit', 'stijlproef', 'huis1');
const PLAAT = path.join(__dirname, 'uit', 'schermen', 'huis1-stijl-doel.png');
const TEGELS = path.join(__dirname, '..', '..', 'tegels', 'huizen');

// De rechter vakken van de plaat (1536 bij 1024, met een streep van 2 pixels ertussen), zonder het opschrift linksboven:
// het huis staat in x 190 tot 660 van een vak. Het huis op de plaat is kleiner dan het onze, 0,96 in de breedte en 0,89 in
// de hoogte (gemeten op het silhouet), en staat hier op zijn eigen maat. pas: waar een pixel van onze tekening op het vak
// ligt (x' = sx x + tx, y' = sy y + ty), de beste pas van het silhouet; alleen om hetzelfde stuk uit te snijden.
const DOEL = {
  schoon: { vak: [770 + 185, 0, 480, 511], pas: { sx: 0.959, sy: 0.886, tx: 194.1 - 185, ty: 9.9 } },
  verweerd: { vak: [770 + 185, 513, 480, 511], pas: { sx: 0.956, sy: 0.886, tx: 196.3 - 185, ty: 9.0 } },
};
// het stuk dat vergroot naast elkaar komt: de voorgevel met de deur, het raam, de plint en de dakvoet (pixels van huis1)
const STUK = [20, 300, 290, 258];

// het zwart rond het huis doorzichtig: alles wat vanaf de rand van het vak donker bereikbaar is
function uitgesneden(im, drempel = 16) {
  const { b, h } = im;
  const rgba = Buffer.from(im.rgba);
  const donker = (i) => Math.max(rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]) <= drempel;
  const weg = new Uint8Array(b * h);
  const rij = [];
  for (let x = 0; x < b; x++) rij.push(x, (h - 1) * b + x);
  for (let y = 0; y < h; y++) rij.push(y * b, y * b + b - 1);
  while (rij.length) {
    const i = rij.pop();
    if (weg[i] || !donker(i)) continue;
    weg[i] = 1;
    const x = i % b;
    if (x > 0) rij.push(i - 1);
    if (x < b - 1) rij.push(i + 1);
    if (i >= b) rij.push(i - b);
    if (i < (h - 1) * b) rij.push(i + b);
  }
  for (let i = 0; i < b * h; i++) if (weg[i]) rgba[i * 4 + 3] = 0;
  return { b, h, rgba };
}

const dekt = (im, x, y) => x >= 0 && y >= 0 && x < im.b && y < im.h && im.rgba[(y * im.b + x) * 4 + 3] > 0;
// hoeveel pixels van het silhouet verschillen, in het volle beeld (dx, dy: waar het strak gesneden beeld begon)
function silhouetVerschil(a, b) {
  const x0 = Math.min(a.dx, b.dx);
  const y0 = Math.min(a.dy, b.dy);
  const x1 = Math.max(a.dx + a.b, b.dx + b.b);
  const y1 = Math.max(a.dy + a.h, b.dy + b.h);
  let n = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (dekt(a, x - a.dx, y - a.dy) !== dekt(b, x - b.dx, y - b.dy)) n++;
  return n;
}
function kleuren(im) {
  const s = new Set();
  for (let i = 0; i < im.b * im.h; i++) if (im.rgba[i * 4 + 3]) s.add(im.rgba.readUIntBE(i * 4, 3));
  return s.size;
}

// rijen van vakken onder elkaar, elk vak [opschrift, beeld, vergroting]
function maakVel(kop, rijen) {
  const M = 24;
  const KOP = 34;
  const LAB = 26;
  const maat = (v) => [v[1].b * (v[2] || 1), v[1].h * (v[2] || 1)];
  const B = Math.max(...rijen.map((r) => r.reduce((s, v) => s + maat(v)[0] + M, M)));
  const H = M + KOP + rijen.reduce((s, r) => s + LAB + Math.max(...r.map((v) => maat(v)[1])) + M, 0);
  const V = P.vel(B, H);
  P.plak(V, P.opschrift(kop, 3), M, M);
  let y = M + KOP;
  for (const r of rijen) {
    const hoog = Math.max(...r.map((v) => maat(v)[1]));
    let x = M;
    for (const v of r) {
      const [b, h] = maat(v);
      P.plak(V, P.opschrift(v[0], 2), x, y);
      P.plak(V, v[1], x, y + LAB + hoog - h, v[2] || 1);
      x += b + M;
    }
    y += LAB + hoog + M;
  }
  return V;
}

async function main() {
  const t0 = Date.now();
  const r = await P.renderVeel([
    { naam: 'huis1', stijl: false },
    { naam: 'huis1', stijl: true },
    { naam: 'huis1-oud', stijl: false },
    { naam: 'huis1-oud', stijl: true },
  ]);
  const [jongOud, jongNieuw, oudOud, oudNieuw] = r;
  const plaat = K.leesPng(PLAAT);
  const doel = {};
  for (const [wat, d] of Object.entries(DOEL)) doel[wat] = uitgesneden(P.snij(plaat, ...d.vak));
  const stukVan = (im) => P.snij(im, ...STUK);
  const stukDoel = (wat) => {
    const { sx, sy, tx, ty } = DOEL[wat].pas;
    const [x, y, b, h] = STUK;
    return P.snij(doel[wat], Math.round(sx * x + tx), Math.round(sy * y + ty), Math.round(sx * b), Math.round(sy * h));
  };

  // de meting: is de tekening van het spel wat render() zonder stijl geeft, en houdt de nieuwe stijl het silhouet
  const tegel = (naam) => K.leesPng(path.join(TEGELS, `${naam}.png`));
  const gelijk = (a, t) => a.b === t.b && a.h === t.h && a.rgba.equals(Buffer.from(t.rgba));
  const meting = {
    'huis1 oud gerenderd = tegels/huizen/huis1.png': gelijk(jongOud, tegel('huis1')),
    'huis1-oud oud gerenderd = tegels/huizen/huis1-oud.png': gelijk(oudOud, tegel('huis1-oud')),
    'silhouet huis1: spel tegen nieuw (pixels)': silhouetVerschil(jongOud, jongNieuw),
    'silhouet huis1-oud: spel tegen nieuw (pixels)': silhouetVerschil(oudOud, oudNieuw),
    'silhouet nieuw: huis1 tegen huis1-oud (pixels)': silhouetVerschil(jongNieuw, oudNieuw),
    maten: { spel: [jongOud.b, jongOud.h], nieuw: [jongNieuw.b, jongNieuw.h], nieuwOud: [oudNieuw.b, oudNieuw.h] },
    kleuren: { spel: kleuren(jongOud), nieuw: kleuren(jongNieuw), spelOud: kleuren(oudOud), nieuwOud: kleuren(oudNieuw), doel: kleuren(doel.schoon), doelVerweerd: kleuren(doel.verweerd) },
    seconden: r.map((x) => +(x.ms / 1000).toFixed(1)),
  };
  fs.mkdirSync(UIT, { recursive: true });
  fs.writeFileSync(path.join(UIT, 'meting.json'), JSON.stringify(meting, null, 1));
  P.schrijfPng(path.join(UIT, 'huis1-nieuw.png'), jongNieuw);
  P.schrijfPng(path.join(UIT, 'huis1-oud-nieuw.png'), oudNieuw);

  const V = maakVel('HUIS1: HET SPEL, DE STIJLPROEF, EN HET DOEL OP ZIJN EIGEN MAAT (0,92)', [
    [['SCHOON: SPEL', jongOud], ['SCHOON: NIEUW', jongNieuw], ['SCHOON: DOEL', doel.schoon]],
    [['VERWEERD: SPEL', oudOud], ['VERWEERD: NIEUW', oudNieuw], ['VERWEERD: DOEL', doel.verweerd]],
    [['SPEL X2', stukVan(jongOud), 2], ['NIEUW X2', stukVan(jongNieuw), 2], ['DOEL X2', stukDoel('schoon'), 2]],
    [['SPEL X2', stukVan(oudOud), 2], ['NIEUW X2', stukVan(oudNieuw), 2], ['DOEL X2', stukDoel('verweerd'), 2]],
  ]);
  P.schrijfPng(path.join(UIT, 'plaat.png'), V);
  console.log(JSON.stringify(meting, null, 1));
  console.log(`uit/stijlproef/huis1/plaat.png  ${V.b}×${V.h}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

if (require.main === module) main();
