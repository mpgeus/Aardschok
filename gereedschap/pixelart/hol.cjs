// Het wolvenhol (ontwerp/werklijst.md, vraag 116, f en stap 3b; Marcel: "het hol is een plek op de kaart (een kuil onder
// een omgevallen boom, met botten ervoor) die de schout kan vinden, en waar de jacht heen gaat"): diep in het bos ligt een
// boom omgevallen, met zijn wortelkluit als een bord omhoog, en onder de stam heeft de roedel een kuil uitgegraven. Voor de
// opening ligt losse aarde met botten van wat ze vingen, en een schedel van een hert.
//
// Eén tekening, geen delen, op beelden/hol.png (naar-spel.cjs --alleen hol), zoals de meiboom (meiboom.cjs): een voorwerp
// draait niet mee. Het model kijkt naar Z: lokaal +y is naar de camera, +x is links in beeld, z omhoog. Het anker is het
// midden van de tegel, op de grond. De stam steekt links wat over de rand van de tegel.
//
//   node gereedschap/pixelart/hol.cjs    (de proefplaat: uit/hol-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, klem, ruis3 } = K;
const { model } = require('./figuren.cjs');

// ---------------------------------------------------------------- maten

// Eén cel: breed en laag, met het anker op het midden van de grond.
const CEL = [76, 62];
const ANKER = [38, 42];
// Zo tekent het spel de figuren (dorpelingen-anim.cjs), voor de proefplaat.
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

// De stam ligt van de wortelkluit (rechts in beeld) naar zijn kruin (links), schuin omhoog bij de kluit, en een eind boven
// de kuil. De kuil kijkt naar de kijker.
const STAM = { a: [-19, -11, 10.5], b: [26, -13, 5.4], r1: 8, r2: 5.4 };
const KLUIT = { x: -23, y: -11, z: 14, a: 5.5, b: 12, c: 14 };
const KUIL = { x: 0, y: 4, z: 2, a: 11, b: 9, c: 7 };

// ---------------------------------------------------------------- materialen

const M = { stam: 0, mos: 1, kluit: 2, wortel: 3, aarde: 4, kuil: 5, bot: 6, kei: 7, hout: 8 };

// Waar ligt een punt langs de stam (0 bij de kluit, 1 bij de kruin), en hoe ver van zijn as.
function langsStam(x, y, z) {
  const [ax, ay, az] = STAM.a;
  const bx = STAM.b[0] - ax;
  const by = STAM.b[1] - ay;
  const bz = STAM.b[2] - az;
  const t = klem(((x - ax) * bx + (y - ay) * by + (z - az) * bz) / (bx * bx + by * by + bz * bz), 0, 1);
  return { t, afstand: Math.hypot(x - ax - bx * t, y - ay - by * t, z - az - bz * t) };
}

const materialen = () => {
  const mat = [];
  // Oude schors, grijs en doorgroefd; het bovenste deel van de stam is begroeid met mos.
  mat[M.stam] = {
    ramp: 'schors',
    lo: 0.9,
    hi: 5.2,
    omslag: 0.15,
    patroon: (x, y, z) => {
      const n = ruis3(x * 0.3, y * 0.3, z * 0.3, 11);
      if (Math.abs(n - 0.5) < 0.05) return -1.4;
      return n > 0.66 ? 0.6 : 0;
    },
  };
  mat[M.mos] = { ramp: 'mos', lo: 0.8, hi: 4.4, omslag: 0.4, patroon: (x, y, z) => (ruis3(x * 0.5, y * 0.5, z * 0.5, 4) > 0.62 ? 0.8 : 0) };
  // De wortelkluit: aarde die tussen de wortels is blijven zitten, met een rand van hout.
  mat[M.kluit] = { ramp: 'aarde', lo: 0.6, hi: 4.2, patroon: (x, y, z) => (ruis3(x * 0.6, y * 0.6, z * 0.6, 8) > 0.6 ? -1 : 0) };
  mat[M.wortel] = { ramp: 'schors', lo: 1, hi: 5, omslag: 0.2, patroon: (x, y, z) => (ruis3(x * 0.6, y * 0.6, z * 0.6, 3) > 0.62 ? -0.8 : 0) };
  // De losse aarde voor de opening: donker en vochtig, hier en daar een plukje mos.
  mat[M.aarde] = {
    ramp: 'aarde',
    lo: 0.6,
    hi: 4.6,
    patroon: (x, y, z) => {
      const v = ruis3(x * 0.55, y * 0.55, z * 0.5, 21);
      if (v > 0.74) return { ramp: 'mos', plus: -0.4 };
      return v < 0.28 ? -0.9 : 0;
    },
  };
  // De kuil zelf: bijna zwart, met alleen aan de rand nog een beetje aarde.
  mat[M.kuil] = { ramp: 'inkt', lo: 0, hi: 1.8, rand: 0 };
  mat[M.bot] = { ramp: 'bot', lo: 1.8, hi: 5.4, omslag: 0.3 };
  mat[M.kei] = { ramp: 'steen', lo: 1.2, hi: 4.2, patroon: (x, y, z) => (ruis3(x * 0.8, y * 0.8, z * 0.8, 6) > 0.6 ? { ramp: 'mos', plus: -1 } : 0) };
  // Het hout waar de stam gebroken is.
  mat[M.hout] = { ramp: 'hout', lo: 2, hi: 6, omslag: 0.2 };
  return mat;
};

// ---------------------------------------------------------------- hulpjes

const zachtMin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

// Een ellips als deel, met zijn grensbol.
const ellips = (c, s, m, deel, k, ruisSterkte = 0, zaad = 1) => ({
  f: (x, y, z) => {
    const d = sdf.ellipsoide(x - c[0], y - c[1], z - c[2], s[0], s[1], s[2]);
    return ruisSterkte ? d + (ruis3(x * 0.5, y * 0.5, z * 0.5, zaad) - 0.5) * ruisSterkte : d;
  },
  g: [c[0], c[1], c[2], Math.max(...s) + 1.5],
  m,
  deel,
  k,
});

// Een kegel tussen twee punten.
const kegel = (a, b, r1, r2, m, deel, k) => ({
  f: (x, y, z) => sdf.rondeKegel(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], r1, r2),
  g: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 2 + Math.max(r1, r2) + 1.5],
  m,
  deel,
  k,
});

// ---------------------------------------------------------------- de stam

// De stam: een dikke kegel met een rafelig einde bij de kruin, mos op de bovenkant en twee stompjes van afgebroken takken.
function stam() {
  const delen = [];
  delen.push({
    f: (x, y, z) => {
      const l = langsStam(x, y, z);
      const r = STAM.r1 + (STAM.r2 - STAM.r1) * l.t;
      // de schors is niet rond maar een beetje bochtig
      const bult = (ruis3(x * 0.22, y * 0.22, z * 0.22, 13) - 0.5) * 2.2;
      return sdf.rondeKegel(x, y, z, ...STAM.a, ...STAM.b, STAM.r1, STAM.r2) + bult - (r > 0 ? 0 : 0);
    },
    g: [4, -6, 8, 34],
    // mos op de bovenkant en aan de kant van de kijker die van de zon af ligt
    m: (x, y, z) => {
      const l = langsStam(x, y, z);
      const r = STAM.r1 + (STAM.r2 - STAM.r1) * l.t;
      const as = STAM.a[2] + (STAM.b[2] - STAM.a[2]) * l.t;
      const boven = (z - as) / Math.max(r, 1);
      const n = ruis3(x * 0.2, y * 0.2, z * 0.3, 17);
      if (boven > 0.65 - n * 0.6 && l.t > 0.22) return M.mos;
      if (n > 0.74 && l.t > 0.25) return M.mos;
      return M.stam;
    },
    deel: 1,
  });
  // twee stompjes van takken die bij het vallen braken
  for (const [t, hoek, lengte] of [[0.45, 0.4, 6]]) {
    const as = [0, 1, 2].map((i) => STAM.a[i] + (STAM.b[i] - STAM.a[i]) * t);
    const r = STAM.r1 + (STAM.r2 - STAM.r1) * t;
    const b = [as[0] + Math.sin(hoek) * 3, as[1] + Math.cos(hoek) * 1 - lengte * 0.2, as[2] + r * 0.8 + lengte * 0.6];
    delen.push(kegel([as[0], as[1], as[2] + r * 0.4], b, 2.2, 1.4, M.stam, 2, 1.5));
  }
  return delen;
}

// ---------------------------------------------------------------- de wortelkluit

// Een bord van aarde en wortels, rechtop aan het begin van de stam: een schijf met een ruwe rand, en wortels die er
// stekelig uit steken en aan de onderkant naar beneden hangen.
function kluit() {
  const delen = [];
  delen.push({
    f: (x, y, z) => {
      const d = sdf.ellipsoide(x - KLUIT.x, y - KLUIT.y, z - KLUIT.z, KLUIT.a, KLUIT.b, KLUIT.c);
      // een ruwe, rafelige rand
      return d + (ruis3(x * 0.45, y * 0.45, z * 0.45, 29) - 0.5) * 3.4;
    },
    g: [KLUIT.x, KLUIT.y, KLUIT.z, KLUIT.c + 5],
    // de buitenste rand is wortel, het midden aarde
    m: (x, y, z) => {
      const rr = Math.hypot((y - KLUIT.y) / KLUIT.b, (z - KLUIT.z) / KLUIT.c);
      const n = ruis3(x * 0.4, y * 0.4, z * 0.4, 5);
      return rr > 0.82 + (n - 0.5) * 0.4 || n > 0.8 ? M.wortel : M.kluit;
    },
    deel: 3,
  });
  // wortels: stekels langs de rand van het bord, en een paar die naar de grond hangen
  const wortels = [
    [[-1, 4, 26], [-3, 8, 33], 1.2, 0.4],
    [[-1, -8, 25], [-4, -12, 31], 1.1, 0.4],
    [[-1, 12, 18], [-4, 19, 22], 1.2, 0.4],
    [[-1, -12, 16], [-4, -19, 19], 1.2, 0.4],
    [[-1, 11, 6], [-4, 17, 1], 1.4, 0.4],
    [[-1, -7, 2], [-4, -12, -1], 1.3, 0.4],
  ];
  wortels.forEach(([van, naar, r1, r2], i) => {
    const a = [KLUIT.x + van[0], KLUIT.y + van[1], van[2]];
    const b = [KLUIT.x + naar[0], KLUIT.y + naar[1], naar[2]];
    delen.push(kegel(a, b, r1, r2, M.wortel, 4, 1.2));
  });
  return delen;
}

// ---------------------------------------------------------------- de kuil en de aarde

// De kuil: een bult aarde onder de stam, met een gat dat naar de kijker kijkt. Het gat is een ellips die van alles
// afgehaald wordt (uit), en die zelf het donkere materiaal geeft.
function kuil() {
  const delen = [];
  // een vlek kaal geschraapte bosgrond rond de opening, plat
  delen.push(ellips([1, 3, 0], [28, 22, 1.7], M.aarde, 5, 2, 1.4, 9));
  // de bult waar de kuil in zit: de aarde die ze eruit groeven, opgeworpen, met de stam er schuin bovenop
  delen.push(ellips([0, -3, 0], [19, 14, 9], M.aarde, 6, 2, 1.8, 15));
  // een uitgetrapte drempel voor de opening
  delen.push(ellips([1, 13, 0], [11, 5, 2], M.aarde, 7, 1.5, 1.2, 3));
  // losse kluiten, die uit het gat gekrabd zijn
  for (const [x, y, s] of [[-6, 14, 1.8], [7, 13.5, 1.5], [12, 10, 1.7], [-12, 9, 1.4], [2, 18, 1.2], [-3, 20, 1]]) {
    delen.push(ellips([x, y, s * 0.25], [s * 1.5, s * 1.2, s], M.aarde, 8, 0.8, 0.8, Math.round(x * 3 + y)));
  }
  // het gat
  delen.push({
    f: (x, y, z) => sdf.ellipsoide(x - KUIL.x, y - KUIL.y, z - KUIL.z, KUIL.a, KUIL.b, KUIL.c) + (ruis3(x * 0.4, y * 0.4, z * 0.4, 33) - 0.5) * 1.6,
    g: [KUIL.x, KUIL.y, KUIL.z, Math.max(KUIL.a, KUIL.b) + 3],
    m: M.kuil,
    deel: 9,
    uit: true,
  });
  return delen;
}

// ---------------------------------------------------------------- de botten

// Een bot: een staafje met een knobbel aan elk eind.
function bot(a, b, r, deel) {
  const knop = r * 1.65;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  // de knobbels staan een beetje naast elkaar, zoals bij een echte pijpbeen
  const zij = [(-dy / l) * knop * 0.45, (dx / l) * knop * 0.45];
  const knoppen = [
    [a[0] + zij[0], a[1] + zij[1], a[2]],
    [a[0] - zij[0], a[1] - zij[1], a[2]],
    [b[0] + zij[0], b[1] + zij[1], b[2]],
    [b[0] - zij[0], b[1] - zij[1], b[2]],
  ];
  return {
    f: (x, y, z) => {
      let d = sdf.capsule(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], r);
      for (const k of knoppen) d = zachtMin(d, sdf.bol(x - k[0], y - k[1], z - k[2], knop * 0.8), 0.8);
      return d;
    },
    g: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, l / 2 + knop * 2 + 1],
    m: M.bot,
    deel,
  };
}

// De botten voor de opening: twee pijpbenen kruislings, een rib, wat wervels, en de schedel van een hert.
function botten() {
  const delen = [];
  const z = 2.1;
  delen.push(bot([-13, 15, z + 0.3], [-3, 21, z + 0.5], 0.85, 20));
  delen.push(bot([10, 18.5, z + 0.4], [2, 23.5, z + 0.4], 0.75, 21));
  delen.push(bot([13, 17, 1.1], [17, 20.5, 1.1], 0.7, 22));
  // een rib: een boog van drie stukjes, half in de aarde
  const rib = [[-20, 14, 0.6], [-19, 17, 1.8], [-16.6, 19.4, 2.1], [-13.5, 20.4, 1.2]];
  for (let i = 0; i < rib.length - 1; i++) {
    const a = rib[i];
    const b = rib[i + 1];
    delen.push({
      f: (x, y, zz) => sdf.capsule(x, y, zz, a[0], a[1], a[2], b[0], b[1], b[2], 0.65),
      g: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, 5],
      m: M.bot,
      deel: 23,
      k: 0.6,
    });
  }
  // wat wervels
  for (const [x, y, s] of [[6, 24.5, 1.1], [8.6, 23, 0.9], [0, 26.5, 0.8]]) delen.push(ellips([x, y, s * 0.5], [s * 1.2, s, s * 0.8], M.bot, 24, 0));
  // de schedel van een hert: een hersenpan, een snuit, en twee holle oogkassen
  const sx = 14;
  const sy = 12;
  delen.push(ellips([sx, sy, 3], [3.9, 3.3, 2.8], M.bot, 25, 0));
  delen.push({
    f: (x, y, zz) => sdf.capsule(x, y, zz, sx + 1, sy + 1.5, 2.6, sx + 5.6, sy + 5.4, 1.7, 1.5),
    g: [sx + 3.3, sy + 3.4, 2.2, 6],
    m: M.bot,
    deel: 25,
    k: 1.2,
  });
  // een afgebroken geweitak, schuin omhoog
  delen.push({
    f: (x, y, zz) => sdf.rondeKegel(x, y, zz, sx - 1.5, sy - 0.5, 4.5, sx - 3.5, sy - 2.5, 8.2, 0.8, 0.45),
    g: [sx - 2.5, sy - 1.5, 6.3, 5],
    m: M.bot,
    deel: 25,
    k: 0.8,
  });
  for (const dy of [-1.2, 1.2]) {
    delen.push({
      f: (x, y, zz) => sdf.bol(x - (sx + 2.7), y - (sy + 1.2 + dy * 1.1), zz - 3.1, 0.95),
      g: [sx + 2.7, sy + 1.2 + dy * 1.1, 3.1, 2],
      m: M.kuil,
      deel: 26,
      uit: true,
    });
  }
  // twee stenen
  delen.push(ellips([-16, 12, 1.1], [2.6, 2.2, 1.7], M.kei, 27, 0, 1, 2));
  delen.push(ellips([15, 6, 1], [2, 1.7, 1.4], M.kei, 27, 0, 1, 7));
  return delen;
}

// ---------------------------------------------------------------- het model

function hol() {
  const delen = [...kuil(), ...stam(), ...kluit(), ...botten(), { f: (x, y, z) => z + 0.2, uit: true }];
  return model(delen, materialen(), { midden: [2, 4, 12], straal: 48 });
}

// ---------------------------------------------------------------- tekenen

function holCel() {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  K.tekenModel(B, hol(), { richting: 'Z' });
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// ---------------------------------------------------------------- het vel

function vel() {
  return holCel();
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

// Een stuk bos van vijf bij vijf tegels met het hol in het midden en een boer ernaast (voor de maat), samengesteld zoals
// het spel het doet (van achter naar voor, elk met zijn anker op het midden van zijn tegel), twee keer vergroot; ernaast
// het hol alleen, drie keer.
function proef() {
  const cel = holCel();
  const { boer } = require('./dorpelingen.cjs');
  const figuur = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' });
  const B = 320;
  const H = 260;
  const plein = new K.Plaat(B, H);
  const legOp = (p, anker, gx, gy) => plein.plak(p, 160 + (gx - gy) * 32 - anker[0], 120 + (gx + gy) * 16 - anker[1]);
  legOp(cel, ANKER, 1, 1);
  legOp(figuur, FIG_ANKER, 0, 2);
  const groot = vergroot(cel, 3);
  const links = vergroot(plein, 2);
  const plaat = new K.Plaat(links.b + 24 + groot.b + 12, Math.max(links.h, groot.h + 24));
  plaat.plak(links, 0, 0);
  plaat.plak(groot, links.b + 24, 12);
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'hol-proef.png'), K.png(plaat, 1, '#3e4a30'));
  const r = ruimte(cel);
  console.log(`uit/hol-proef.png (${plaat.b}×${plaat.h}); cel ${CEL.join('×')}, anker ${ANKER.join(',')}, ruimte ${JSON.stringify(r)}`);
  if (Math.min(r.boven, r.links, r.rechts, r.onder) < 1) console.log('LET OP: de tekening raakt de rand van zijn cel');
  return { plaat, ruimte: r };
}

module.exports = { hol, holCel, vel, beschrijving, proef, CEL, ANKER };

if (require.main === module) proef();
