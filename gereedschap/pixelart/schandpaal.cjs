// De schandpaal (ontwerp/beeld.md, "De schandpaal: een paal met een halsijzer"; Marcel, 24 sep
// 2026): een dikke eiken paal op een lage trede van ongelijke stenen, verweerd en net niet recht,
// met bovenop een bordje met het wapen van de heer, gevierendeeld in rood en geel zoals de wapenrok
// van zijn soldaten (heer.cjs: dezelfde rampen, rood en goud).
//
// Drie tekeningen, in één rij op beelden/schandpaal.png (naar-spel.cjs --alleen schandpaal):
//  - leeg: het halsijzer hangt open aan zijn ketting tegen de paal;
//  - bezet: zonder het halsijzer dat hangt; de ketting loopt naar voren, naar wie op de tegel ervóór
//    staat (js/heer.js: x+1, y+1, in beeld recht onder de paal, 32 pixels lager);
//  - halsijzer: de halsband om zijn nek, met het oog waar de ketting aan vastzit. Een eigen laag die
//    het spel ná het poppetje tekent (js/tekenen.js), op de hoogte van zijn nek (NEK hieronder).
//
// Wie eraan staat, kijkt naar voren, met zijn rug naar de paal. De camera kijkt van voren en van
// boven (30 graden), dus het laatste stuk ketting, van zijn nek naar achteren, zit achter zijn hoofd:
// je ziet de ketting van de paal tot boven zijn hoofd, en de halsband onder zijn kin. Daarom hoort
// de hele ketting bij de bezette paal, die vóór het poppetje getekend wordt en dus achter hem ligt,
// en draagt het halsijzer alleen wat vóór of naast zijn nek zit.
//
// Een voorwerp draait niet mee: één kijkrichting. Het model kijkt naar Z: lokaal +y is naar de
// camera en naar wie ervoor staat, +x is links in beeld, z omhoog.
//
//   node gereedschap/pixelart/schandpaal.cjs    (de proefplaat: uit/schandpaal-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, klem, rnd, ruis3, TEGEL } = K;
const { model, bol, kegel } = require('./figuren.cjs');

// ---------------------------------------------------------------- maten

// Eén cel voor alle drie de delen. Het anker van de paal is het midden van zijn tegel, op de grond.
const CEL = [60, 116];
const ANKER = [30, 102];
const DELEN = ['leeg', 'bezet', 'halsijzer'];
// Wie aan de paal staat, staat één tegel schuin ervoor: lokaal recht naar voren.
const VOOR = Math.hypot(TEGEL, TEGEL);
// Zo tekent het spel de figuren (dorpelingen-anim.cjs): de cel van een vel en het anker (de voeten).
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];
// In de cel van het halsijzer staan de voeten van wie het draagt op VOETEN; het anker van het
// halsijzer (HALS_ANKER) is het midden van de halsband, want dat legt het spel op zijn nek.
const VOETEN = [ANKER[0], ANKER[1] + 10];

const S2 = Math.SQRT1_2;

// ---------------------------------------------------------------- rekenhulpjes

const plus = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const min = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const maal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const punt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lengte = (a) => Math.hypot(a[0], a[1], a[2]);
const eenheid = (a) => maal(a, 1 / (lengte(a) || 1));
const tussen = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// een afgeronde rechthoek in het vlak (halve maten hx, hy, straal r)
function rechthoek(px, py, hx, hy, r) {
  const qx = Math.abs(px) - hx + r;
  const qy = Math.abs(py) - hy + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// Een assenstelsel: u, v, w als lokale richtingen, om een punt c. naar(p) geeft [u, v, w].
function stelsel(c, u, v) {
  const w = kruis(u, v);
  return (x, y, z) => {
    const d = [x - c[0], y - c[1], z - c[2]];
    return [punt(d, u), punt(d, v), punt(d, w)];
  };
}

// Draaien om de z-as (graden); een richting langs de kaart (x en y van de wereld) wordt lokaal
// een kwartslag gedraaid, want het model kijkt schuin naar Z.
const draaiZ = (a, g) => {
  const r = (g * Math.PI) / 180;
  return [a[0] * Math.cos(r) - a[1] * Math.sin(r), a[0] * Math.sin(r) + a[1] * Math.cos(r), a[2]];
};
const draaiOm = (a, as, g) => {
  // Rodrigues: a om de eenheidsas `as` over g graden
  const r = (g * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return plus(plus(maal(a, c), maal(kruis(as, a), s)), maal(as, punt(as, a) * (1 - c)));
};

// ---------------------------------------------------------------- materialen

const M = { eik: 0, steen: 1, steenDonker: 2, steenLicht: 3, ijzer: 4, verf: 5, band: 6 };

// Het wapen van de heer op het bord: u naar links in beeld, v omhoog, in het vlak van het bord.
// Een schild (plat van boven, onderaan in een punt) gevierendeeld: links boven en rechts onder
// rood, de andere twee geel, zoals de wapenrok van zijn soldaten (heer.cjs). Een rand van hout.
const SCHILD = { a: 9.6, boven: 10.4, rand: 1.4, deling: -1.8 };
function schildVorm(u, v) {
  const { a, boven } = SCHILD;
  // twee bogen met straal 2a die onderaan in een punt samenkomen
  return Math.max(v - boven, Math.abs(u) - a, Math.hypot(Math.abs(u) + a, Math.min(v, 0)) - 2 * a);
}

const materialen = (bordNaar) => {
  const mat = [];
  // Verweerd eiken: grijsbruin, met draad in de lengte, een paar diepe droogscheuren en, onderaan
  // waar het nat blijft, donkerder hout en mos.
  mat[M.eik] = {
    ramp: 'schors',
    lo: 1.6,
    hi: 6.4,
    patroon: (x, y, z, nx, ny, nz) => {
      const as = paalAs(z);
      const dx = x - as[0];
      const dy = y - as[1];
      if (nz > 0.8) return 0.3;
      // de kant van de balk waar dit punt op ligt: langs die kant loopt u
      const u = Math.abs(nx * S2 + ny * S2) > Math.abs(-nx * S2 + ny * S2) ? -dx * S2 + dy * S2 : dx * S2 + dy * S2;
      let p = 0;
      // draad: fijne donkere lijnen, een beetje golvend
      const draad = Math.sin(u * 2.1 + ruis3(u * 0.3, z * 0.05, 1, 4) * 4);
      if (draad > 0.86) p -= 0.9;
      // droogscheuren: een paar lange, net niet rechte spleten
      for (const [u0, z0, z1] of SCHEUREN) {
        if (z > z0 && z < z1 && Math.abs(u - u0 - 0.5 * Math.sin(z * 0.13 + u0)) < 0.5) p -= 2.2;
      }
      // onderaan nat en donker, met mos in de hoeken
      if (z < 16) p -= (16 - z) * 0.07;
      if (z < 9 + ruis3(x * 0.4, y * 0.4, 2, 7) * 6 && ruis3(x * 0.5, y * 0.5, z * 0.3, 3) > 0.52) return { ramp: 'mos', plus: 0.4 };
      return p;
    },
  };
  const steenPatroon = (x, y, z, nx, ny, nz) => {
    let p = ruis3(x * 0.5, y * 0.5, z * 0.5, 9) > 0.72 ? -0.7 : 0;
    // mos in de naden en op de onderkant, niet op de bovenkant waar gelopen wordt
    if (nz < 0.6 && z < 3.2 && ruis3(x * 0.6, y * 0.6, z, 5) > 0.55) return { ramp: 'mos', plus: 0.2 };
    if (nz > 0.8) p += 0.3;
    return p;
  };
  mat[M.steen] = { ramp: 'steen', lo: 1.8, hi: 6.2, patroon: steenPatroon };
  mat[M.steenDonker] = { ramp: 'steen', lo: 1.2, hi: 5.2, patroon: steenPatroon };
  mat[M.steenLicht] = { ramp: 'steen', lo: 2.4, hi: 6.8, patroon: steenPatroon };
  // Oud smeedijzer: donker, met een glans op de bollingen en hier en daar roest.
  mat[M.ijzer] = {
    ramp: 'ijzer',
    lo: 0.6,
    hi: 4.4,
    glans: 1.4,
    patroon: (x, y, z) => (ruis3(x * 0.6, y * 0.6, z * 0.6, 11) > 0.74 ? { ramp: 'aarde', plus: 0.6 } : 0),
  };
  // Het bord: de rand is kaal hout, binnen de rand het geschilderde wapen, met verf die hier en
  // daar is afgebladderd (verweerd, zoals de paal). Alles in één materiaal; de plek kiest de ramp.
  mat[M.verf] = {
    ramp: 'rood',
    lo: 2.6,
    hi: 6.6,
    omslag: 0.35,
    patroon: (x, y, z) => {
      const [u, v] = bordNaar(x, y, z);
      if (schildVorm(u, v) > -SCHILD.rand) return { ramp: 'hout', stap: 2.2 + ruis3(u * 0.8, v * 0.8, 1, 2) * 1.4 };
      if (ruis3(u * 0.7, v * 0.7, 3, 6) > 0.86) return { ramp: 'hout', plus: -1.4 };
      const rood = (u > 0) === (v > SCHILD.deling);
      return rood ? 0 : { ramp: 'goud', plus: 0.5 };
    },
  };
  // De halsband zelf is lichter en blanker gesleten dan de ketting: hij moet te zien zijn tegen
  // een donkere kiel of een rode halsdoek.
  mat[M.band] = { ...mat[M.ijzer], lo: 1.5, hi: 5.8, glans: 1.8 };
  return mat;
};

// ---------------------------------------------------------------- de paal

// De balk staat met zijn kanten langs de kaart (een ruit in beeld, zoals elk huis), leunt een
// paar pixels naar links achter en buigt onderweg een fractie door: net niet recht.
const PAAL = { top: 95, half: 6.1, afronding: 2 };
const SCHEUREN = [
  [1.8, 18, 78],
  [-2.6, 34, 92],
  [0.4, 50, 70],
];
function paalAs(z) {
  const t = klem(z / PAAL.top, 0, 1.2);
  return [1.9 * t + 0.7 * Math.sin(Math.PI * t), -1.3 * t, z];
}
function paalHalf(z) {
  // een beetje taps, en niet overal even dik
  return PAAL.half - 0.35 * (z / PAAL.top) + 0.3 * Math.sin(z * 0.06 + 1.2) + 0.2 * Math.sin(z * 0.17);
}
function paalDeel(deel) {
  return {
    f: (x, y, z) => {
      const as = paalAs(z);
      const dx = x - as[0];
      const dy = y - as[1];
      // langs de kaart: een kwartslag gedraaid ten opzichte van lokaal
      const a = (dx - dy) * S2;
      const b = (dx + dy) * S2;
      const h = paalHalf(z);
      const zij = rechthoek(a, b, h, h, PAAL.afronding);
      // de kop: schuin afgeschuind, zodat het water eraf loopt
      const kop = z - PAAL.top + 0.35 * Math.max(Math.abs(a), Math.abs(b));
      return Math.max(zij, kop, -z - 2) * 0.9;
    },
    g: [1.5, -0.7, PAAL.top / 2, PAAL.top / 2 + 12],
    m: M.eik,
    deel,
  };
}

// De trede: acht ongelijke stenen in een ring om de voet van de paal, langs de kaart gelegd, elk
// een eigen maat, hoogte en draai, en een paar kleine keien tegen de rand.
function trede() {
  const delen = [];
  let n = 0;
  const STENEN = [M.steen, M.steenDonker, M.steenLicht];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (!i && !j) continue;
      n++;
      const r = (k) => rnd(31, n, k);
      const hx = 4.9 + r(1) * 1.1;
      const hy = 4.9 + r(2) * 1.1;
      const hz = 2.3 + r(3) * 1.1 - (i && j ? 0.5 : 0);
      const hoek = 45 + (r(4) - 0.5) * 22;
      // midden langs de kaart (wereld x = i, wereld y = j), een beetje verschoven
      const wx = i * 10.6 + (r(5) - 0.5) * 1.6;
      const wy = j * 10.6 + (r(6) - 0.5) * 1.6;
      const c = [(wy - wx) * S2, (wx + wy) * S2, hz - 0.6];
      const kant = (r(7) - 0.5) * 0.12;
      const a = (hoek * Math.PI) / 180;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      delen.push({
        f: (x, y, z) => {
          const dx = x - c[0];
          const dy = y - c[1];
          const du = dx * ca + dy * sa;
          const dv = -dx * sa + dy * ca;
          // een steen is bol en niet vlak: de bovenkant helt een fractie
          return sdf.doos(du, dv, z - c[2] - du * kant, hx, hy, hz, 1.9) + ruis3(x * 0.45, y * 0.45, z * 0.45, n) * 0.35;
        },
        g: [c[0], c[1], c[2], Math.hypot(hx, hy, hz) + 1],
        m: STENEN[n % 3],
        deel: 1 + n,
      });
    }
  }
  // kleine keien los tegen de voorkant en de zijkant
  for (const [wx, wy, s] of [[17.5, 3, 1.8], [4.5, 17.2, 1.5], [-16.8, 9, 1.4]]) {
    const c = [(wy - wx) * S2, (wx + wy) * S2, s * 0.35];
    delen.push({ f: (x, y, z) => sdf.ellipsoide(x - c[0], y - c[1], z - c[2], s * 1.3, s * 1.1, s * 0.8), g: [...c, s * 1.4], m: M.steenDonker, deel: 12 });
  }
  return delen;
}

// ---------------------------------------------------------------- ijzerwerk

// Een schakel: een langgerekt oog om midden c, lang langs as a, plat in het vlak van a en b.
const SCHAKEL = { e: 0.95, R: 1.35, r: 0.62 };
const STEEK = 2 * (SCHAKEL.e + SCHAKEL.R - SCHAKEL.r);
function schakel(c, a, b, deel) {
  const n = kruis(a, b);
  const { e, R, r } = SCHAKEL;
  return {
    f: (x, y, z) => {
      const d = [x - c[0], y - c[1], z - c[2]];
      const q = Math.hypot(Math.max(Math.abs(punt(d, a)) - e, 0), punt(d, b));
      return Math.hypot(q - R, punt(d, n)) - r;
    },
    g: [c[0], c[1], c[2], e + R + r + 0.5],
    m: M.ijzer,
    deel,
  };
}

// Een ketting langs de kromme p(t), t van 0 tot 1: schakels op gelijke afstand, om en om plat en op
// hun kant. `van` en `tot` (0..1) kiezen een stuk ervan.
function ketting(p, o = {}) {
  const N = 300;
  const pts = [];
  const len = [0];
  for (let i = 0; i <= N; i++) pts.push(p(i / N));
  for (let i = 1; i <= N; i++) len.push(len[i - 1] + lengte(min(pts[i], pts[i - 1])));
  const L = len[N];
  const op = (s) => {
    s = klem(s, 0, L);
    let i = 1;
    while (i < N && len[i] < s) i++;
    return tussen(pts[i - 1], pts[i], (s - len[i - 1]) / (len[i] - len[i - 1] || 1));
  };
  const n = Math.max(1, Math.round(L / STEEK));
  const stap = L / n;
  const delen = [];
  for (let k = 0; k < n; k++) {
    if ((k + 0.5) / n < (o.van ?? 0) || (k + 0.5) / n > (o.tot ?? 1)) continue;
    const a0 = op(k * stap);
    const a1 = op((k + 1) * stap);
    const as = eenheid(min(a1, a0));
    let b0 = kruis(as, [0, 0, 1]);
    if (lengte(b0) < 0.3) b0 = kruis(as, [1, 0, 0]);
    b0 = eenheid(b0);
    const b1 = kruis(as, b0);
    delen.push(schakel(tussen(a0, a1, 0.5), as, k % 2 ? b1 : b0, 20 + (k % 2)));
  }
  return delen;
}

// De halsband: een ijzeren band om een as (eenheid `as`), met midden c, binnenstraal ri,
// buitenstraal ro en halve hoogte hh. `half`: alleen de kant met u >= 0 (of <= 0) van een
// stelsel (u, v) loodrecht op de as.
const BAND = { ri: 6.5, ro: 7.7, hh: 1.3 };
function bandAfstand(u, v, w) {
  // w langs de as
  const rm = (BAND.ri + BAND.ro) / 2;
  return rechthoek(Math.hypot(u, v) - rm, w, (BAND.ro - BAND.ri) / 2, BAND.hh, 0.5);
}

// De ring aan de paal, waar de ketting aan hangt: een ijzeren band om de balk met een oog voorop.
const RING = { z: 72.5 };
function ringAanDePaal() {
  const as = paalAs(RING.z);
  const delen = [];
  delen.push({
    f: (x, y, z) => {
      const dx = x - as[0];
      const dy = y - as[1];
      const a = (dx - dy) * S2;
      const b = (dx + dy) * S2;
      const h = paalHalf(RING.z) + 0.55;
      return Math.max(rechthoek(a, b, h, h, PAAL.afronding + 0.4), Math.abs(z - RING.z) - 1.5);
    },
    g: [as[0], as[1], RING.z, 11],
    m: M.ijzer,
    deel: 14,
  });
  // het oog: een ring voorop, plat naar de camera
  const voor = plus(as, [1.2, paalHalf(RING.z) * Math.SQRT2 + 1.1, -1.8]);
  delen.push({
    f: (x, y, z) => sdf.torus(x - voor[0], z - voor[2], y - voor[1], 1.75, 0.62),
    g: [...voor, 3],
    m: M.ijzer,
    deel: 15,
  });
  return { delen, oog: plus(voor, [0, 0, -1.6]) };
}

// Het open halsijzer dat aan zijn ketting tegen de paal hangt: twee halve banden die bovenaan aan
// een scharnier zitten en onderaan wijd open staan. Plat naar de camera, dus de as loopt lokaal
// langs y.
function openHalsijzer(scharnier) {
  const rm = (BAND.ri + BAND.ro) / 2;
  const midden = plus(scharnier, [0, 0, -rm]);
  const delen = [];
  for (const kant of [1, -1]) {
    const open = 21 * kant;
    delen.push({
      f: (x, y, z) => {
        // terugdraaien om het scharnier (as langs y), dan de onopen halve band
        const d = [x - scharnier[0], z - scharnier[2]];
        const r = (-open * Math.PI) / 180;
        const du = d[0] * Math.cos(r) - d[1] * Math.sin(r);
        const dv = d[0] * Math.sin(r) + d[1] * Math.cos(r);
        const u = du;
        const v = dv + rm;
        return Math.max(bandAfstand(u, v, y - midden[1]), -u * kant);
      },
      g: [midden[0], midden[1], midden[2], BAND.ro + 4],
      m: M.band,
      deel: 16,
    });
    // de lip met het gat voor de pen, aan het vrije eind (dat is met de halve band meegedraaid)
    const r = (open * Math.PI) / 180;
    const eind = [scharnier[0] + 2 * rm * Math.sin(r), scharnier[1], scharnier[2] - 2 * rm * Math.cos(r)];
    delen.push(bol(eind, 1.3, M.band, 17));
  }
  // het scharnier zelf
  delen.push(kegel(plus(scharnier, [0, -1.4, 0]), plus(scharnier, [0, 1.4, 0]), 1.2, 1.2, M.band, 17));
  return delen;
}

// De ketting als hij iemand vasthoudt: van het oog aan de paal naar het oog achter op de halsband,
// met een doorhang. Lokaal voor de paal; wie ervoor staat, staat op (0, VOOR).
function kettingNaarVoren(oog) {
  const achter = [0.8, VOOR + NEK_MODEL.midden[1] - BAND.ro - 0.9, NEK_MODEL.midden[2] + 0.4];
  const mid = tussen(oog, achter, 0.5);
  const doorhang = plus(mid, [0, 0, -9]);
  return (t) => {
    const a = tussen(oog, doorhang, t);
    const b = tussen(doorhang, achter, t);
    return tussen(a, b, t);
  };
}

// ---------------------------------------------------------------- het bord met het wapen

// Bovenop: het schild op een plankje, vóór de kop van de balk, een fractie naar het licht gedraaid,
// achterover en scheef — het is op het oog opgehangen.
const BORD = { c: [0.9, 7.9, 98], draai: 8, achterover: 6, scheef: -3, dik: 1.15 };
function bordStelsel() {
  let u = [1, 0, 0];
  let v = [0, 0, 1];
  // scheef om de kijkrichting, achterover om u, en een draai om z
  const n0 = [0, 1, 0];
  u = draaiOm(u, n0, BORD.scheef);
  v = draaiOm(v, n0, BORD.scheef);
  v = draaiOm(v, u, -BORD.achterover);
  u = draaiZ(u, BORD.draai);
  v = draaiZ(v, BORD.draai);
  return { u: eenheid(u), v: eenheid(v), naar: stelsel(BORD.c, eenheid(u), eenheid(v)) };
}
function bord() {
  const { naar } = bordStelsel();
  const delen = [];
  delen.push({
    f: (x, y, z) => {
      const [u, v, w] = naar(x, y, z);
      // een beetje kromgetrokken: het midden bolt naar voren
      const bolling = 0.35 * (1 - (u * u) / 80);
      return Math.max(schildVorm(u, v), Math.abs(w - bolling) - BORD.dik) - 0.15;
    },
    g: [...BORD.c, 22],
    m: M.verf,
    deel: 18,
  });
  // twee spijkers met een ijzeren beugel, waarmee het aan de balk zit
  return { delen, naar };
}

// ---------------------------------------------------------------- modellen

function paal(bezet) {
  const { delen: bordDelen, naar: bordNaar } = bord();
  const ring = ringAanDePaal();
  const delen = [paalDeel(1), ...trede(), ...ring.delen, ...bordDelen];
  if (bezet) delen.push(...ketting(kettingNaarVoren(ring.oog)));
  else {
    // de ketting hangt recht omlaag langs de voorkant, het open halsijzer eraan
    const van = ring.oog;
    const lang = 5 * STEEK;
    delen.push(...ketting((t) => plus(van, [0.15 * t, 0.5 * t, -lang * t])));
    delen.push(...openHalsijzer(plus(van, [0.15, 0.9, -lang - 1.4])));
  }
  const mat = materialen((x, y, z) => bordNaar(x, y, z));
  return model(delen, mat, { midden: [0, 3, 58], straal: 70 });
}

// De halsband om de nek, lokaal voor wie hem draagt (de voeten op de oorsprong, kijkend naar Z).
// Gemaakt op de boer (dorpelingen.cjs): zijn rode halsdoek zit op z 58,6 tot 62,2 om (0; 1,4).
const NEK_MODEL = { midden: [0, 1.4, 59.4] };
function halsband() {
  const c = NEK_MODEL.midden;
  const delen = [];
  delen.push({
    f: (x, y, z) => {
      // de band zit niet waterpas: voorop een fractie lager, op de sleutelbeenderen
      const w = z - c[2] - (y - c[1]) * 0.07 + (x - c[0]) * 0.03;
      return bandAfstand(x - c[0], y - c[1], w);
    },
    g: [c[0], c[1], c[2], BAND.ro + 2],
    m: M.band,
    deel: 16,
  });
  // het slot voorop, onder de kin: een lip met een pen
  delen.push(bol([c[0] + 0.3, c[1] + BAND.ro + 0.2, c[2] - 1.2], 1.35, M.band, 17));
  // het oog achterop, waar de ketting aan vastzit
  delen.push({
    f: (x, y, z) => sdf.torus(x - c[0] - 0.8, y - (c[1] - BAND.ro - 0.9), z - c[2] - 0.4, 1.5, 0.55),
    g: [c[0] + 0.8, c[1] - BAND.ro - 0.9, c[2] + 0.4, 3],
    m: M.band,
    deel: 17,
  });
  return model(delen, materialen(() => [0, 0, 0]), { midden: c, straal: 14 });
}

// ---------------------------------------------------------------- tekenen

function beeld(b, h, anker) {
  return new K.Beeld(b, h, anker[0], anker[1]);
}

function afmaken(B) {
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

function paalCel(bezet) {
  const B = beeld(CEL[0], CEL[1], ANKER);
  K.tekenModel(B, paal(bezet), { richting: 'Z' });
  return afmaken(B);
}

// Het halsijzer, met een poppetje als afdekking: wat achter zijn nek of hoofd zit, valt weg, en
// het poppetje zelf wordt daarna uit het beeld gehaald. Dan krijgt de band ook een omlijning
// waar hij over het poppetje ligt.
function halsijzerCel(maakFiguur) {
  const B = beeld(CEL[0], CEL[1], VOETEN);
  const figuur = maakFiguur ? maakFiguur() : boerModel();
  const obj = B.volgendObj;
  K.tekenModel(B, figuur, { richting: 'Z' });
  K.tekenModel(B, halsband(), { richting: 'Z' });
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.obj[i] !== obj) continue;
    B.ramp[i] = -1;
    B.obj[i] = -1;
    B.deel[i] = -1;
    B.diep[i] = -1e9;
    B.vlag[i] = 0;
  }
  return afmaken(B);
}

// Het midden van de halsband in beeld, in pixels boven de voeten (en het anker van zijn cel).
const NEK_BOER = Math.round(K.PXH * NEK_MODEL.midden[2] - 0.5 * NEK_MODEL.midden[1]);
const HALS_ANKER = [VOETEN[0], VOETEN[1] - NEK_BOER];

function boerModel(fase = 0) {
  const { boer } = require('./dorpelingen.cjs');
  return boer({ houding: 'staan', fase });
}

// ---------------------------------------------------------------- de nek van wie eraan kan

// Wie aan de schandpaal kan: de boeren (js/mensen.js, T.MENSEN.boer1..boer5), met het vel boer of
// boerin. Het halsijzer is op de boer gemaakt; bij een ander komt het even ver onder zijn kin.
const FIGUREN = {
  boer: () => boerModel(),
  boerin: () => require('./dorpelingen2.cjs').boerin({ houding: 'staan', fase: 0 }),
};

// Hoe hoog de kin zit, in pixels boven de voeten: de onderste rij huid die aan het gezicht vastzit,
// van voren gezien (staan, Z, het eerste beeld, zoals het vel het tekent).
function kinHoogte(m) {
  const p = K.losRenderen(m, { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' });
  const huid = K.RAMP.huid;
  const isHuid = (x, y) => {
    const k = p.lees(x, y);
    return !!k && k[0] === huid;
  };
  let start = null;
  for (let y = 0; y < p.h && !start; y++) {
    for (let x = 0; x < p.b; x++) {
      if (isHuid(x, y)) {
        start = [x, y];
        break;
      }
    }
  }
  if (!start) return null;
  const gezien = new Set([start.join()]);
  const rij = [start];
  let laagste = start[1];
  while (rij.length) {
    const [x, y] = rij.pop();
    laagste = Math.max(laagste, y);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const s = `${x + dx},${y + dy}`;
      if (gezien.has(s) || !isHuid(x + dx, y + dy)) continue;
      gezien.add(s);
      rij.push([x + dx, y + dy]);
    }
  }
  return FIG_ANKER[1] - laagste;
}

// Per vel: hoe hoog het midden van de halsband boven de voeten komt; `standaard` (die van de boer)
// voor wie er niet bij staat.
function nekken() {
  const kin = {};
  for (const [naam, maak] of Object.entries(FIGUREN)) kin[naam] = kinHoogte(maak());
  const uit = { standaard: NEK_BOER };
  for (const naam of Object.keys(FIGUREN)) uit[naam] = NEK_BOER + (kin[naam] - kin.boer);
  return uit;
}

// ---------------------------------------------------------------- het vel

function vel() {
  const p = new K.Plaat(CEL[0] * DELEN.length, CEL[1]);
  p.plak(paalCel(false), 0, 0);
  p.plak(paalCel(true), CEL[0], 0);
  p.plak(halsijzerCel(), CEL[0] * 2, 0);
  return p;
}

// Wat in beelden/beschrijving.json komt (naar-spel.cjs): cel en anker van de paal, de namen van de
// drie delen, het anker van het halsijzer (het midden van de band) en per vel de hoogte van de nek.
function beschrijving(bestand) {
  return {
    bestand,
    cel: CEL,
    anker: ANKER,
    delen: DELEN,
    halsAnker: HALS_ANKER,
    nek: nekken(),
  };
}

// ---------------------------------------------------------------- de proefplaat

// De lege paal, en de bezette met een boer en een boerin ervoor en het halsijzer om, samengesteld
// zoals het spel het doet: paal, dan het poppetje een tegel ervoor (32 pixels lager), dan het
// halsijzer op zijn nek. Twee keer vergroot.
function proef() {
  const nek = nekken();
  const B = 96;
  const H = 180;
  const plaat = new K.Plaat(B * 3, H);
  const paalLeeg = paalCel(false);
  const paalBezet = paalCel(true);
  const hals = halsijzerCel();
  const figuur = (naam) => K.losRenderen(FIGUREN[naam](), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' });
  const legOp = (p, anker, x, y) => plaat.plak(p, x - anker[0], y - anker[1]);
  const voet = [B / 2, 120];
  legOp(paalLeeg, ANKER, voet[0], voet[1]);
  for (const [i, naam] of [[1, 'boer'], [2, 'boerin']]) {
    const x = voet[0] + i * B;
    legOp(paalBezet, ANKER, x, voet[1]);
    legOp(figuur(naam), FIG_ANKER, x, voet[1] + 32);
    legOp(hals, HALS_ANKER, x, voet[1] + 32 - nek[naam]);
  }
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'schandpaal-proef.png'), K.png(plaat, 2, '#5e6a44'));
  console.log(`uit/schandpaal-proef.png (${B * 3 * 2}×${H * 2}); nek: ${JSON.stringify(nek)}`);
  return { plaat, nek };
}

module.exports = { paal, halsband, paalCel, halsijzerCel, vel, beschrijving, nekken, kinHoogte, proef, CEL, ANKER, HALS_ANKER, DELEN, NEK_BOER };

if (require.main === module) proef();
