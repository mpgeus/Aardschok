'use strict';
// De platte tekening van een huis, voor de zichtproef (vraag 176; ontwerp/beeld.md, "Zicht in een dicht dorp"): het huis
// zoals de huizenbouwer het tekent, maar zonder dak en met lage muren, zoals de functionele weergave van Stronghold
// (spatie). Alleen een proef: het spel en zijn tekeningen blijven zoals ze zijn, en alles staat in deze map.
//
//   node gereedschap/zichtproef/plat.cjs [namen]     bijvoorbeeld planken-hut1-spanen-z; zonder namen: die van de proef
//
// Hoe: dezelfde snede als de bouwfasen (fasenVanHuis in gereedschap/pixelart/huizen.cjs): van elk huis blijft wat bij
// de muren hoort (BIJ_DE_MUREN), afgesneden als een doorsnede (hoogteVan: de muren aan de kant van de camera tot de
// heup, die aan de achterkant vlak boven de grond), met de romp als een schil, zodat je in het huis kijkt. Eerst stonden
// alle muren tot de heup, maar dan verborgen ze nog de eerste rij tegels erachter: de straat en de deuren eraan. Erbij komen een vloer van planken en, bovenop de muren, een randje in het eigen dak van het huis, zodat je
// het huis aan zijn dak blijft herkennen (riet, spanen, leien, pannen). Gerenderd in hetzelfde kader als het hele huis
// en net zo uitgesneden als zijn tekening in tegels/huizen/ (dezelfde maat en hetzelfde anker), zodat de proef het
// plaatje in het spel kan verwisselen zonder dat het huis verschuift.
//
// Uit: plat/<naam>.png, en plat/naast-elkaar.png (de echte tekening links, de platte rechts).
const fs = require('node:fs');
const path = require('node:path');

const PX = path.join(__dirname, '..', 'pixelart');
const K = require(path.join(PX, 'kern.cjs'));
const D = require(path.join(PX, 'dorp.cjs'));
const Tr = require(path.join(PX, 'toren.cjs'));
const HS = require(path.join(PX, 'huis-sdf.cjs'));
const Hz = require(path.join(PX, 'huizen.cjs'));
const { TEGEL, EX, EY } = K;
const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'plat');

// In eenheden van de huizenbouwer (een tegel is er 45, een poppetje zo'n 88 hoog, een hut heeft muren van 145).
const PLAT = {
  voor: 44, // zo hoog staan de muren aan de kant van de camera nog (zuid en oost op het scherm): tot de heup, onder de ramen
  achter: 8, // en zo hoog die aan de achterkant (noord en west), zodat ze niets verbergen van wat erachter staat
  overgang: 0.2, // op het laatste stuk van de achterste muur (een deel van de voet) loopt hij op naar de voorste
  schil: 9, // zo dik is de muur (FASE.schil in huizen.cjs)
  schilZ: 25, // op die hoogte meet de schil hoe diep een punt in het huis ligt (FASE.schilZ)
  kap: 3, // zo dik is het randje in de kleur van het dak, bovenop de muur
  vloer: 2, // en zo dik de vloer
};
// Zoals in huizen.cjs (die exporteert ze niet).
const BIJ_DE_MUREN = new Set(['romp', 'liggers', 'stijlen', 'blokhoek', 'aanbouwhout', 'aanbouwstijlen', 'deur', 'ramen', 'glas', 'palen']);
const HET_DAK = new Set(['riet', 'dak']);

// Hoe hoog de muur staat op punt (x, y) van het huis: de achterste muren laag, de voorste op heuphoogte, zoals een
// doorsnede. Gerekend in de stand zoals het huis in het beeld ligt (de voet m van meetHuis, in tegels): u loopt van de
// westkant (0) naar de oostkant (1), v van de noordkant (0) naar de zuidkant (1).
function hoogteVan(m, draai) {
  const naar = (x, y) => (draai ? Tr.draaiNaar(draai, [x, y]) : [x, y]);
  const [ux, vx] = naar(1, 0);
  const [uy, vy] = naar(0, 1);
  return (x, y) => {
    const u = ((ux * x + uy * y) / TEGEL - m.hoek[0]) / m.voet[0];
    const v = ((vx * x + vy * y) / TEGEL - m.hoek[1]) / m.voet[1];
    const t = Math.min(1, Math.max(0, (Math.max(u, v) - (1 - PLAT.overgang)) / PLAT.overgang));
    return PLAT.achter + (PLAT.voor - PLAT.achter) * t;
  };
}

function platteWereld(W, zc) {
  const N = new Tr.Wereld();
  // de vloer en het randje in de kleur van het dak: de ramp van het dak, met een eigen zacht patroon (dat van het dak
  // zelf rekent met de helling, en wordt op een vlakke vloer donker)
  const bron = W.mat.dak || W.mat.riet;
  N.mat = { ...W.mat, platDak: { ramp: bron.ramp, lo: bron.lo, hi: bron.hi, schaduwKracht: 0.3, patroon: (C) => ((Math.floor(C.x / 11) + Math.floor(C.y / 11)) % 2 ? -0.35 : 0.35) } };
  N.lichten = [];
  N.H = W.H;
  const groepen = W.groepen.filter((g) => g.delen.length);
  const dak = groepen.filter((g) => HET_DAK.has(g.naam)).flatMap((g) => g.delen)[0];
  for (const g of groepen) {
    if (!BIJ_DE_MUREN.has(g.naam)) continue;
    const G = N.groep(g.naam);
    for (const p of g.delen) {
      if (g.naam === 'romp' && p.deel === 1) {
        const schil = (x, y) => -p.f(x, y, PLAT.schilZ) - PLAT.schil;
        Tr.voeg(G, { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), schil(x, y), z - zc(x, y)) });
        Tr.voeg(N.groep('vloer'), { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), z - PLAT.vloer), m: 'platDak', deel: 994 });
        if (dak) Tr.voeg(N.groep('kap'), { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), schil(x, y), z - zc(x, y) - PLAT.kap, zc(x, y) - z), m: 'platDak', deel: 995 });
      } else {
        Tr.voeg(G, { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), z - zc(x, y)) });
      }
    }
  }
  return N;
}

// De tekening van het spel: maat en anker (tegels/tegels.js).
function tegelVan(naam) {
  if (!globalThis.Spel) globalThis.Spel = {};
  if (!globalThis.Spel.TEGELS) require(path.join(WORTEL, 'tegels', 'tegels.js'));
  const t = globalThis.Spel.TEGELS.huizen.tiles.find((x) => x && x.naam === naam);
  if (!t) throw new Error(`geen tekening ${naam}`);
  return t;
}

function renderPlat(naam) {
  const t0 = Date.now();
  const spec = Hz.HUIZEN[naam];
  if (!spec) throw new Error(`geen huis ${naam}`);
  if (spec.delen) throw new Error(`${naam} is een gebouw uit delen: dat kan de proef niet`);
  const draai = spec.draai || 0;
  const W = Hz.wereldVan(spec);
  const m = Hz.meetHuis(W, draai);
  // hetzelfde kader als renderHuis in huizen.cjs
  const kd = HS.kaderVan(W.H, [], draai);
  const RAND = 12;
  const b = Math.ceil(kd.b + RAND * 2);
  const h = Math.ceil(kd.h + RAND * 2);
  const OX = Math.round(RAND - kd.x0);
  const OY = Math.round(RAND - kd.y0);
  const B = new K.Beeld(b, h, OX, OY);
  Tr.tekenWereld(B, platteWereld(W, hoogteVan(m, draai)), { draai });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: HS.WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  const plaat = K.Plaat.van(K.kwantiseer(B));
  // de achterste hoek van de voet op het scherm, en daaromheen de uitsnede van de tekening in het spel
  const X = m.hoek[0] * TEGEL;
  const Y = m.hoek[1] * TEGEL;
  const ax = Math.round(OX + X * EX[0] + Y * EX[1]);
  const ay = Math.round(OY + X * EY[0] + Y * EY[1]);
  const t = tegelVan(naam);
  const [, , cb, ch] = t.cel;
  // het spel legt het anker 16 pixels lager dan de render (naar-tiled.cjs: ankerY + 16)
  const [xa, ya] = [ax - t.anker[0], ay - (t.anker[1] - 16)];
  if (xa < 0 || ya < 0 || xa + cb > b || ya + ch > h) throw new Error(`${naam}: de uitsnede valt buiten het kader`);
  return { naam, plaat: plaat.uitsnede(xa, ya, cb, ch), ms: Date.now() - t0 };
}

// De echte en de platte naast elkaar, voor het oog.
function naastElkaar(namen) {
  const paren = namen.map((n) => [K.leesPng(fs.readFileSync(path.join(WORTEL, 'tegels', 'huizen', `${n}.png`))), K.leesPng(fs.readFileSync(path.join(UIT, `${n}.png`)))]);
  const b = paren.reduce((s, [a, p]) => s + a.b + p.b + 24, 0);
  const h = Math.max(...paren.map(([a]) => a.h));
  const rgba = Buffer.alloc(b * h * 4);
  for (let i = 0; i < b * h; i++) rgba.set([238, 230, 214, 255], i * 4);
  let x = 0;
  for (const beeld of paren.flat()) {
    for (let y = 0; y < beeld.h; y++) {
      for (let c = 0; c < beeld.b; c++) {
        const j = (y * beeld.b + c) * 4;
        if (beeld.rgba[j + 3] < 128) continue;
        beeld.rgba.copy(rgba, ((y + h - beeld.h) * b + x + c) * 4, j, j + 4);
      }
    }
    x += beeld.b + 12;
  }
  fs.writeFileSync(path.join(UIT, 'naast-elkaar.png'), K.pngVanBeeld({ b, h, rgba }));
}

module.exports = { PLAT, renderPlat };

if (require.main === module) {
  const namen = process.argv.slice(2);
  if (!namen.length) namen.push(...require('./dorp.cjs').tekeningen());
  fs.mkdirSync(UIT, { recursive: true });
  for (const n of namen) {
    const r = renderPlat(n);
    fs.writeFileSync(path.join(UIT, `${n}.png`), K.png(r.plaat, 1));
    console.log(`${n}: ${r.plaat.b}×${r.plaat.h}, ${(r.ms / 1000).toFixed(1)} s`);
  }
  naastElkaar(namen);
}
