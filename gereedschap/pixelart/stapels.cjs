// De stapels bij de deuren (werklijst C, stap 1; js/kar.js, T.stapelsOp): wat een gebouw maakte en de ossenkar nog moet
// halen. Stap 1 is het hout: stammen op een hoop, met de gezaagde kant naar de kijker, zodat je de jaarringen ziet; in
// drie maten (klein, half, vol), zodat je ziet hoe vol een stapel is en waar het stokt.
//
// Een rij cellen per waar, een kolom per maat, op beelden/stapels.png (naar-spel.cjs --alleen stapels): een stapel
// draait niet mee. Het model kijkt naar Z: lokaal +y is naar de camera, +x is links in beeld, z omhoog. Het anker is het
// midden van de tegel, op de grond.
//
//   node gereedschap/pixelart/stapels.cjs    (de proefplaat: uit/stapels-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { ruis3 } = K;
const { model } = require('./figuren.cjs');

// ---------------------------------------------------------------- maten

const CEL = [80, 60];
const ANKER = [40, 44];
// Zo tekent het spel de figuren (dorpelingen-anim.cjs), voor de proefplaat.
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

const WAREN = ['hout'];
// Hoe een hoop eruitziet: hoeveel stammen per laag (van onder naar boven), en losse stammen erbij: `dwars` bovenop
// (dwars over de hoop) en `grond` (een stam die ernaast op de grond rolde). Marcel, 14 okt: "mag de houtstapel iets
// minder 'perfect'": geen nette piramide, maar een hoop zoals een ossenkar hem achterlaat.
const MATEN = [
  ['klein', { lagen: [2, 1], dwars: 0, grond: 0, zaad: 3 }],
  ['half', { lagen: [3, 2], dwars: 1, grond: 0, zaad: 7 }],
  ['vol', { lagen: [4, 3, 2], dwars: 1, grond: 1, zaad: 11 }],
];
// Een stam: zijn straal, zijn lengte (naar de kijker), en hoe dicht ze tegen elkaar liggen.
const STAM = { r: 4.2, lang: 28, tussen: 8.6 };

// ---------------------------------------------------------------- materialen

const M = { schors: 0, kop: 1, aarde: 2 };

// Een vaste reeks toeval per hoop, zodat elke maat elke keer dezelfde hoop is.
function lot(zaad) {
  let n = zaad * 7919 + 13;
  return () => (n = (n * 16807) % 2147483647) / 2147483647;
}

// De stammen van een hoop: { x, y, z, r, lang, a, t, smal } per stam. `a` draait hem om de hoogte (0 is naar de kijker),
// `t` kantelt hem (het ene eind hoger), en `smal` laat hem naar één kant dunner worden. Elke stam ligt een eind uit zijn
// rij, is dikker of dunner en langer of korter, en ligt scheef: zoals hout dat van een kar gegooid is.
function stammen(maat) {
  const r = lot(maat.zaad);
  const tussen = (a, b) => a + (b - a) * r();
  const uit = [];
  let z = 0;
  maat.lagen.forEach((n, laag) => {
    const opzij = laag ? tussen(-2.2, 2.2) : 0;
    for (let k = 0; k < n; k++) {
      const straal = STAM.r * tussen(0.78, 1.2);
      uit.push({
        x: (k - (n - 1) / 2) * STAM.tussen * tussen(0.95, 1.12) + opzij + tussen(-1, 1),
        y: tussen(-3.5, 3.5),
        z: (laag ? z : 0) + straal + tussen(-0.4, 0.6),
        r: straal,
        lang: STAM.lang * tussen(0.72, 1.15),
        a: tussen(-0.24, 0.24),
        t: tussen(-0.07, 0.07),
        smal: tussen(-0.12, 0.12),
      });
    }
    z = (laag + 1) * STAM.tussen * 0.82;
  });
  const top = uit.reduce((m, s) => Math.max(m, s.z + s.r), 0);
  for (let i = 0; i < maat.dwars; i++) {
    const straal = STAM.r * tussen(0.75, 0.95);
    uit.push({ x: tussen(-3, 3), y: tussen(-4, 2), z: top - straal * 0.5, r: straal, lang: STAM.lang * tussen(0.8, 1), a: Math.PI / 2 + tussen(-0.3, 0.3), t: tussen(-0.12, 0.12), smal: tussen(-0.1, 0.1) });
  }
  const breed = (maat.lagen[0] * STAM.tussen) / 2;
  for (let i = 0; i < maat.grond; i++) {
    const straal = STAM.r * tussen(0.8, 1);
    uit.push({ x: breed + straal + tussen(1, 3), y: tussen(2, 6), z: straal, r: straal, lang: STAM.lang * tussen(0.7, 0.9), a: tussen(0.5, 0.9), t: 0, smal: tussen(-0.1, 0.1) });
  }
  return uit;
}

// Een punt in de ruimte van stam s: { l } langs zijn as, en { x, z } eromheen.
function inStam(x, y, z, s) {
  const dx = x - s.x;
  const dy = y - s.y;
  const dz = z - s.z;
  const ca = Math.cos(s.a);
  const sa = Math.sin(s.a);
  const lx = ca * dx + sa * dy;
  const ly = -sa * dx + ca * dy;
  const ct = Math.cos(s.t);
  const st = Math.sin(s.t);
  return { x: lx, l: ct * ly + st * dz, z: -st * ly + ct * dz };
}
// Hoe ver een punt van stam s ligt (negatief erin), en hoe ver van de as, als deel van zijn straal daar.
function stamAfstand(x, y, z, s, korter = 0) {
  const p = inStam(x, y, z, s);
  const straal = s.r * (1 + (s.smal * p.l) / (s.lang / 2));
  const rond = Math.hypot(p.x, p.z) - straal;
  return { d: Math.max(rond, Math.abs(p.l) - (s.lang / 2 - korter)) * 0.85, as: Math.hypot(p.x, p.z) / straal, l: p.l };
}

const materialen = (lijst) => {
  const mat = [];
  // Schors: grijsbruin, met ribbels in de lengte.
  mat[M.schors] = {
    ramp: 'schors',
    lo: 2.2,
    hi: 6.4,
    patroon: (x, y, z) => (ruis3(x * 0.9, y * 0.25, z * 0.9, 61) > 0.6 ? -0.9 : 0),
  };
  // De gezaagde kop: licht hout, met jaarringen om het hart van de stam.
  mat[M.kop] = {
    ramp: 'stro',
    lo: 2.8,
    hi: 5.9,
    patroon: (x, y, z) => {
      // de stam waar dit punt het dichtst bij ligt, en hoe ver van zijn hart
      let beste = null;
      for (const s of lijst) {
        const a = stamAfstand(x, y, z, s);
        if (!beste || a.d < beste.d) beste = a;
      }
      const d = beste ? beste.as : 1;
      let p = Math.sin(d * 9) > 0.55 ? -0.7 : 0;
      if (d > 0.82) p -= 1.4; // de schors rond de kop
      if (d < 0.18) p -= 0.6; // het hart
      return p;
    },
  };
  mat[M.aarde] = { ramp: 'aarde', lo: 2.0, hi: 5.4 };
  return mat;
};

// ---------------------------------------------------------------- het model

function hoop(maat) {
  const lijst = stammen(maat);
  const breed = lijst.reduce((m, s) => Math.max(m, Math.abs(s.x) + s.lang / 2), 0);
  const diep = lijst.reduce((m, s) => Math.max(m, Math.abs(s.y) + s.lang / 2), 0);
  const hoog = lijst.reduce((m, s) => Math.max(m, s.z + s.r), 0);
  const straal = Math.hypot(breed, diep, hoog / 2) + 2;
  const delen = [];
  // De schors: alle stammen, iets korter dan de koppen, zodat de kop zijn eigen kleur houdt.
  delen.push({
    f: (x, y, z) => {
      let d = Infinity;
      for (const s of lijst) d = Math.min(d, stamAfstand(x, y, z, s, 0.6).d);
      return d;
    },
    g: [0, 0, hoog / 2, straal],
    m: M.schors,
    deel: 1,
  });
  // De koppen: de hele stam, maar alleen de schijven aan de uiteinden steken buiten de schors uit.
  delen.push({
    f: (x, y, z) => {
      let d = Infinity;
      for (const s of lijst) {
        const a = stamAfstand(x, y, z, s);
        d = Math.min(d, Math.max(a.d, (s.lang / 2 - 0.9 - Math.abs(a.l)) * 0.85));
      }
      return d;
    },
    g: [0, 0, hoog / 2, straal],
    m: M.kop,
    deel: 2,
  });
  // Wat schors en zaagsel op de grond eronder, niet helemaal rond.
  const vlek = (maat.lagen[0] * STAM.tussen) / 2 + 1;
  delen.push({
    f: (x, y, z) => Math.max(Math.hypot(x / vlek, y / (STAM.lang / 2)) - 1 + (ruis3(x * 0.2, y * 0.2, 0, 71) - 0.5) * 0.5, z - 0.4, -z - 0.6) * 2,
    g: [0, 0, 0, vlek + STAM.lang],
    m: M.aarde,
    deel: 3,
  });
  return model(delen, materialen(lijst), { midden: [0, 0, hoog / 2], straal });
}

// ---------------------------------------------------------------- het vel

function cel(maat) {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  K.tekenModel(B, hoop(maat), { richting: 'Z' });
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

function vel() {
  const uit = new K.Plaat(CEL[0] * MATEN.length, CEL[1] * WAREN.length);
  WAREN.forEach((wat, rij) => MATEN.forEach(([, maat], k) => uit.plak(cel(maat), k * CEL[0], rij * CEL[1])));
  return uit;
}

// Wat in beelden/beschrijving.json komt (naar-spel.cjs): het bestand, de maat van een cel, het anker, de waren (de rijen)
// en de maten (de kolommen).
function beschrijving(bestand) {
  return { bestand, cel: CEL, anker: ANKER, waren: WAREN, maten: MATEN.map(([naam]) => naam) };
}

// ---------------------------------------------------------------- de proefplaat

// De drie maten naast een boer, zoals het spel ze tekent, drie keer vergroot. Zegt ook hoeveel pixels de tekening van de
// rand van zijn cel afblijft.
function proef() {
  const { boer } = require('./dorpelingen.cjs');
  const figuur = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' });
  const stuk = new K.Plaat(300, 130);
  // naast elkaar, een tegel uit elkaar (op de kaart naar rechts: x + 1, y - 1)
  const legOp = (p, anker, i) => stuk.plak(p, 50 + i * 72 - anker[0], 112 - anker[1]);
  const cellen = MATEN.map(([, maat]) => cel(maat));
  legOp(figuur, FIG_ANKER, 0);
  cellen.forEach((c, i) => legOp(c, ANKER, i + 1));
  const vergroot = (p, n) => {
    const uit = new K.Plaat(p.b * n, p.h * n);
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.b; x++) {
        const k = p.lees(x, y);
        if (k) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) uit.zet(x * n + i, y * n + j, k[0], k[1]);
      }
    }
    return uit;
  };
  const plaat = vergroot(stuk, 3);
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'stapels-proef.png'), K.png(plaat, 1, '#5e6a44'));
  cellen.forEach((c, i) => {
    let [x0, x1, y0, y1] = [c.b, -1, c.h, -1];
    for (let y = 0; y < c.h; y++) {
      for (let x = 0; x < c.b; x++) {
        if (!c.lees(x, y)) continue;
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
    const r = { boven: y0, links: x0, rechts: c.b - 1 - x1, onder: c.h - 1 - y1 };
    console.log(`${MATEN[i][0]}: ruimte ${JSON.stringify(r)}`);
    if (Math.min(r.boven, r.links, r.rechts, r.onder) < 1) console.log('LET OP: de tekening raakt de rand van zijn cel');
  });
  console.log(`uit/stapels-proef.png (${plaat.b}×${plaat.h}); cel ${CEL.join('×')}, anker ${ANKER.join(',')}`);
}

module.exports = { hoop, vel, beschrijving, proef, CEL, ANKER, WAREN, MATEN };

if (require.main === module) proef();
