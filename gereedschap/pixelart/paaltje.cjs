// Het paaltje (ontwerp/werklijst.md, vraag 52, stap 1, "het dorp bouwt zelf"): de landmeterspaal op de
// hoeken van een vrij erf, zodat je ook zonder bouwmenu ziet dat er plaats is. Een dunne, licht
// verweerde houten paal tot de knie van een dorpeling, schuin afgezaagd, met een reepje doek eromheen,
// net niet recht en in een hoopje omgewoelde aarde.
//
// Eén tekening, geen delen, op beelden/paaltje.png (naar-spel.cjs --alleen paaltje). Een voorwerp draait
// niet mee: één kijkrichting, zoals de schandpaal. Het model kijkt naar Z: lokaal +y is naar de camera,
// +x is links in beeld, z omhoog. Het anker is het midden van de tegel, op de grond. Zelfde licht en
// dezelfde rampen als de schandpaal (schandpaal.cjs), maar klein en eenvoudig.
//
//   node gereedschap/pixelart/paaltje.cjs    (de proefplaat: uit/paaltje-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, klem, ruis3 } = K;
const { model } = require('./figuren.cjs');

// ---------------------------------------------------------------- maten

// Eén cel, zo klein als past. Het anker is het midden van de tegel op de grond: het midden van de
// cel, met onder het anker nog plaats voor de hoop aarde en de voorste hoek van de paal.
const CEL = [20, 31];
const ANKER = [10, 25];
// Zo tekent het spel de figuren (dorpelingen-anim.cjs), voor de proefplaat.
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

const S2 = Math.SQRT1_2;

// ---------------------------------------------------------------- materialen

const M = { hout: 0, doek: 1, aarde: 2, kei: 3 };

const materialen = () => {
  const mat = [];
  // Licht verweerd hout: grijsbruin zoals de schandpaal, met een paar fijne draden in de lengte en
  // onderaan, waar het nat blijft, donkerder en met een plekje mos. Het snijvlak bovenop is blanker.
  mat[M.hout] = {
    ramp: 'schors',
    lo: 2.3,
    hi: 7.0,
    patroon: (x, y, z, nx, ny, nz) => {
      if (nz > 0.6) return { ramp: 'zand', plus: -1 };
      let p = 0;
      // draad: alleen een enkele donkere lijn per kant, want de paal is maar een paar pixels breed
      const as = paalAs(z);
      const dx = x - as[0];
      const dy = y - as[1];
      const u = Math.abs(nx + ny) > Math.abs(ny - nx) ? dy - dx : dx + dy;
      if (Math.sin(u * 2.3 + ruis3(u * 0.4, z * 0.08, 1, 4) * 3) > 0.82) p -= 0.8;
      if (z < 6) p -= (6 - z) * 0.1;
      if (z < 2.5 + ruis3(x * 0.5, y * 0.5, 2, 7) * 2.5 && ruis3(x * 0.6, y * 0.6, z * 0.4, 3) > 0.55) return { ramp: 'mos', plus: 0.2 };
      return p;
    },
  };
  // Het doek: ongebleekt linnen, met een omslag zodat de kant die van het licht af staat ook nog licht is.
  mat[M.doek] = {
    ramp: 'perkament',
    lo: 1.8,
    hi: 4.9,
    omslag: 0.5,
    patroon: (x, y, z) => (z < DOEK.z - DOEK.hoog - 3 ? -0.5 : 0),
  };
  mat[M.aarde] = {
    ramp: 'aarde',
    lo: 2.0,
    hi: 5.8,
    patroon: (x, y, z) => (ruis3(x * 0.7, y * 0.7, z * 0.6, 21) > 0.62 ? -0.8 : 0),
  };
  mat[M.kei] = { ramp: 'bot', lo: 1.4, hi: 4.6 };
  return mat;
};

// ---------------------------------------------------------------- de paal

// Een balkje met zijn kanten langs de kaart (een ruit in beeld, zoals de schandpaal), dat naar
// rechts leunt en een fractie doorbuigt: net niet recht. Bovenaan schuin afgezaagd, van rechts achter
// (hoog) naar links voor (laag), zodat het snijvlak het licht en de camera opvangt. `helling` is de
// hoek van het snijvlak met het horizontale vlak, `kant` de kant waarheen het afloopt (0 = links in
// beeld, 90 = naar de camera).
const PAAL = { top: 23, half: 1.4, afronding: 0.6, helling: 34, kant: 40, leunX: -1.5, leunY: 0.5, buik: 0.4 };
function paalAs(z) {
  const t = klem(z / PAAL.top, 0, 1.2);
  return [PAAL.leunX * t + PAAL.buik * Math.sin(Math.PI * t), PAAL.leunY * t, z];
}
function paalDeel() {
  const hoek = (PAAL.helling * Math.PI) / 180;
  const kant = (PAAL.kant * Math.PI) / 180;
  const n = [Math.sin(hoek) * Math.cos(kant), Math.sin(hoek) * Math.sin(kant), Math.cos(hoek)];
  const boven = paalAs(PAAL.top);
  return {
    f: (x, y, z) => {
      const as = paalAs(z);
      const dx = x - as[0];
      const dy = y - as[1];
      // langs de kaart: een kwartslag gedraaid ten opzichte van lokaal. De doos is hoog genoeg om
      // alleen de vier zijkanten te geven (een afgerond vierkant in het vlak).
      const zij = sdf.doos((dx - dy) * S2, (dx + dy) * S2, 0, PAAL.half, PAAL.half, 1e3, PAAL.afronding);
      // het snijvlak: de afstand tot een vlak door de top, met een normaal die omhoog en naar links voor wijst
      const snede = n[0] * (x - boven[0]) + n[1] * (y - boven[1]) + n[2] * (z - PAAL.top);
      return Math.max(zij, snede, -z - 2) * 0.9;
    },
    g: [PAAL.leunX / 2, PAAL.leunY / 2, PAAL.top / 2, PAAL.top / 2 + 5],
    m: M.hout,
    deel: 1,
  };
}

// ---------------------------------------------------------------- het doek

// Een reepje doek om de paal, een hand onder de top, een beetje scheef geknoopt, met een stuk dat
// eronder hangt (de staart). Zo zie je de paal ook in hoog gras.
const DOEK = { z: 17.5, hoog: 0.9, dik: 0.4, scheef: 0.3, staart: 5 };
function doekBand() {
  const h = PAAL.half + DOEK.dik;
  return {
    f: (x, y, z) => {
      const as = paalAs(z);
      const dx = x - as[0];
      const dy = y - as[1];
      const zc = DOEK.z - DOEK.scheef * dx;
      return sdf.doos((dx - dy) * S2, (dx + dy) * S2, z - zc, h, h, DOEK.hoog, 0.6) * 0.9;
    },
    g: [PAAL.leunX * (DOEK.z / PAAL.top), 0, DOEK.z, 7],
    m: M.doek,
    deel: 2,
  };
}
function doekStaart() {
  const zBoven = DOEK.z - DOEK.hoog + 0.4;
  const zEind = zBoven - DOEK.staart;
  return {
    f: (x, y, z) => {
      const s = klem((zBoven - z) / DOEK.staart, 0, 1);
      const as = paalAs(z);
      const dx = x - as[0];
      const dy = y - as[1];
      const a = (dx - dy) * S2;
      const b = (dx + dy) * S2;
      // hangt tegen de rechterkant van de paal (a = -half), met een lichte bocht en een zwaai naar buiten
      const ca = -PAAL.half - DOEK.dik - 0.15 - 1.9 * s * s;
      const cb = 0.2 + 0.5 * Math.sin(s * 3);
      // een plat reepje dat naar onderen smaller wordt, iets langer dan nodig
      const breed = 1 - 0.45 * s;
      const plat = sdf.doos(a - ca, (b - cb) / breed, z - (zBoven + zEind - 1) / 2, 0.3, 1.3, (DOEK.staart + 1) / 2, 0.25);
      // en onderaan schuin afgesneden
      const snede = (zEind + 0.5 * (b - cb) - z) / Math.hypot(1, 0.5);
      return Math.max(plat * breed, snede) * 0.85;
    },
    g: [PAAL.leunX * (DOEK.z / PAAL.top) - 1, 0, DOEK.z - DOEK.staart / 2, DOEK.staart / 2 + 5],
    m: M.doek,
    deel: 3,
  };
}

// ---------------------------------------------------------------- de aarde

// Omgewoelde aarde rond de voet, waar de paal in de grond is geslagen, met twee keitjes. De onderkant
// is op de grond afgekapt: de hoop ligt op de tegel en steekt er niet doorheen.
function hoop() {
  const delen = [];
  delen.push({
    f: (x, y, z) => {
      const d = sdf.ellipsoide(x, y - 0.3, z + 0.4, 5.4, 4.7, 2.4) + (ruis3(x * 0.55, y * 0.55, z * 0.5, 9) - 0.5) * 1.1;
      return Math.max(d, -z - 0.2);
    },
    g: [0, 0, 1, 8],
    m: M.aarde,
    deel: 4,
  });
  for (const [cx, cy, s] of [[4.2, 2.2, 0.9], [-3.4, 3.3, 0.8]]) {
    delen.push({ f: (x, y, z) => sdf.ellipsoide(x - cx, y - cy, z - s * 0.3, s * 1.3, s * 1.1, s * 0.8), g: [cx, cy, s * 0.3, s * 1.6], m: M.kei, deel: 5 });
  }
  return delen;
}

// ---------------------------------------------------------------- het model

function paaltje() {
  const delen = [paalDeel(), doekBand(), doekStaart(), ...hoop()];
  return model(delen, materialen(), { midden: [-1, 0, 13], straal: 20 });
}

// ---------------------------------------------------------------- tekenen

function paaltjeCel() {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  K.tekenModel(B, paaltje(), { richting: 'Z' });
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// ---------------------------------------------------------------- het vel

function vel() {
  return paaltjeCel();
}

// Wat in beelden/beschrijving.json komt (naar-spel.cjs): het bestand, de maat van de cel en het anker.
function beschrijving(bestand) {
  return { bestand, cel: CEL, anker: ANKER };
}

// ---------------------------------------------------------------- de proefplaat

// Hoeveel pixels een tekening van de rand van zijn cel afblijft, om te zien of hij nog past.
function ruimte(p) {
  let x0 = p.b;
  let x1 = -1;
  let y0 = p.h;
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
  return { boven: y0, links: x0, rechts: p.b - 1 - x1, onder: p.h - 1 - y1 };
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

// Een stuk erf van drie bij drie tegels met een paaltje op elke hoek en een boer in het midden,
// samengesteld zoals het spel het doet (van achter naar voor, elk met zijn anker op het midden van
// zijn tegel), drie keer vergroot; ernaast het paaltje alleen, acht keer.
function proef() {
  const cel = paaltjeCel();
  const { boer } = require('./dorpelingen.cjs');
  const figuur = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' });
  const B = 160;
  const H = 112;
  const erf = new K.Plaat(B, H);
  const legOp = (p, anker, gx, gy) => erf.plak(p, 80 + (gx - gy) * 32 - anker[0], 40 + (gx + gy) * 16 - anker[1]);
  legOp(cel, ANKER, 0, 0);
  legOp(cel, ANKER, 0, 2);
  legOp(cel, ANKER, 2, 0);
  legOp(figuur, FIG_ANKER, 1, 1);
  legOp(cel, ANKER, 2, 2);
  const groot = vergroot(cel, 8);
  const links = vergroot(erf, 3);
  const plaat = new K.Plaat(links.b + 24 + groot.b + 12, links.h);
  plaat.plak(links, 0, 0);
  plaat.plak(groot, links.b + 24, links.h - groot.h - 12);
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'paaltje-proef.png'), K.png(plaat, 1, '#5e6a44'));
  const r = ruimte(cel);
  console.log(`uit/paaltje-proef.png (${plaat.b}×${plaat.h}); cel ${CEL.join('×')}, anker ${ANKER.join(',')}, ruimte ${JSON.stringify(r)}`);
  if (Math.min(r.boven, r.links, r.rechts, r.onder) < 1) console.log('LET OP: de tekening raakt de rand van zijn cel');
  return { plaat, ruimte: r };
}

module.exports = { paaltje, paaltjeCel, vel, beschrijving, proef, CEL, ANKER };

if (require.main === module) proef();
