// De losse tuinstukken van de huizenbouwer (ontwerp/beeld.md, "De huizenbouwer op ronde vormen":
// "een tuintje erbij, maar in losse stukken, niet vast aan het huis"). Elk stuk staat op één
// tegel, zodat Marcel ze los in Tiled neerzet en de dieptesortering klopt: wie voor of achter een
// hek langs loopt, loopt voor of achter die ene tegel langs. Een tuin die in het huis gebakken zit,
// zou juist daar misgaan.
//
//   hek-tenen-x, hek-tenen-y  gevlochten wilgentenen tussen dunne staken (recht, langs x of y)
//   hek-lat-x, hek-lat-y      een paar latten op palen (recht, langs x of y)
//   hek-<soort>-hoek-boven/onder/links/rechts   een hoek (boven: de achterste hoek van een tuin)
//   hek-<soort>-eind+x,-x,+y,-y   het eind van een hek, bijvoorbeeld tegen een muur
//   hekje-<soort>-x, hekje-<soort>-y   een hekje tussen twee palen, dat op een kier staat
//   kool, prei, bonen         rijen groente op een bed van omgespitte aarde
//   kruidenbed                een bed met een rand van stenen, vol kruiden
//   bloemen-x, bloemen-y      stokrozen en lage bloemen langs een muur (de muur achter de tegel)
//   bankje-x, bankje-y        een bank van planken op twee stompen
//   regenton                  een ton met hoepels, vol water
//
// Twee soorten hek (Marcel, 22 sep 2026): het eerste hek (ronde 3) was een dicht staketsel van
// planken, en las op ware grootte als een palissade om een fort. 'tenen' (gevlochten wilgentenen
// tussen paaltjes) en 'lat' (een paar latten op palen) zijn allebei laag en open — ruim de knie
// van de tovenaar (1,75 m), niet zijn schouder — en zien er verschillend uit, zodat niet elke tuin
// hetzelfde hek heeft.
//
// tuinstuk(naam, zaad) geeft een Wereld (toren.cjs, tekenWereld) met het stuk rond de oorsprong:
// het midden van zijn tegel. Het hout en de knoppen komen uit huis-sdf.cjs (balkPatroon,
// knoppenVan), zodat een hek hetzelfde hout heeft als de huizen.
//
// Ook hier is niets waterpas: een hekpaal staat scheef en zijn regels of tenen lopen er schuin
// naar toe, staken zijn ongelijk lang en hellen, een rij kool loopt net niet recht, de ton staat
// een tikje scheef op zijn stenen. Per zaad anders, en vast. Een hek sluit toch aan: waar het de
// rand van de tegel raakt, ligt het altijd op dezelfde hoogte (REGELS), daartussen mag het zakken
// of golven.
'use strict';
const K = require('./kern.cjs');
const T = require('./toren.cjs');
const HS = require('./huis-sdf.cjs');
const { TEGEL, hash, rnd, ruis2, ruis3, klem, mix, sdf } = K;
const { Wereld, voeg, stelsel } = T;
const { GRAAD, balk, stok, draaiZ } = T.hulp;

const M = 56.6; // eenheden per meter, zoals op het erf
const HALF = TEGEL / 2; // van het midden van een tegel tot zijn rand
const HEK_HOOG = M * 0.4; // de bovenkant van het hek: ruim de knie van de tovenaar, niet zijn schouder
const REGELS = [HEK_HOOG * 0.32, HEK_HOOG * 0.62, HEK_HOOG * 0.92]; // waar het hek de rand van de tegel
// raakt: 'hek-lat' gebruikt de eerste en de laatste (twee latten), 'hek-tenen' alle drie

// ---------------------------------------------------------------- materialen

// omgespitte aarde: kluiten, met hier en daar een steentje
function aardePatroon(H, C) {
  const n = ruis2(C.x * 0.35, C.y * 0.35, H.zaad + 3);
  let s = n > 0.66 ? 0.7 : n < 0.3 ? -0.7 : 0;
  if (C.nz < 0.55) s -= 0.5;
  const h = hash(C.px, C.py, H.zaad + 4);
  if (h % 29 === 0) return { ramp: 'veldsteen', stap: klem(C.stap, 2, 5) };
  if (h % 11 === 0) s -= 0.8;
  return s;
}
// blad: nerven en lichte randjes, per pixel
const bladPatroon = (C) => (hash(C.px, C.py, 41) % 5 === 0 ? -0.9 : hash(C.px, C.py, 42) % 7 === 0 ? 0.7 : 0);
// een kool: nerven vanuit het hart
function koolPatroon(C) {
  const c = C.deel.kool;
  if (!c) return bladPatroon(C);
  const a = Math.atan2(C.y - c[1], C.x - c[0]);
  const s = Math.sin(a * 7 + (C.z - c[2]) * 0.3);
  return s > 0.8 ? 0.9 : s < -0.85 ? -0.8 : 0;
}
// de duigen van een ton: een naad om de zoveel graden, en elke duig een eigen toon
function tonPatroon(H, C) {
  const t = C.deel.ton;
  if (!t) return 0;
  if (C.nz > 0.7) return -0.4; // de bovenrand
  const a = Math.atan2(C.y - t[1], C.x - t[0]) + Math.PI;
  const f = (a / (2 * Math.PI)) * t[2];
  const i = Math.floor(f);
  const fr = f - i;
  if (fr < 0.09) return -1.8;
  let s = ((hash(i, 5, H.zaad) % 5) - 2) * 0.3;
  if (fr < 0.2) s += 0.4;
  const nerf = Math.sin(fr * 14 + Math.sin(C.z * 0.1 + i) * 2);
  if (nerf > 0.86) s -= 0.6;
  return s;
}
// de kopse kant van een stomp: jaarringen; de zijkant: schors met groeven
function stompPatroon(C) {
  const s = C.deel.stam;
  if (!s) return 0;
  if (C.nz > 0.6) {
    const rr = Math.hypot(C.x - s[0], C.y - s[1]);
    return { ramp: 'hout', stap: C.stap - 0.3 + (Math.floor(rr / 1.9) % 2 ? -0.7 : 0) };
  }
  const groef = Math.sin(Math.atan2(C.y - s[1], C.x - s[0]) * 11 + ruis2(C.z * 0.2, 1, 9) * 3);
  return groef > 0.7 ? -0.9 : groef < -0.85 ? 0.5 : 0;
}

function tuinMaterialen(W, H) {
  const sp = H.sp;
  const houtHi = (sp ? 6.6 : 5.8) - (H.hout === 'schors' ? 0.8 : 0);
  const zacht = 0.4;
  // het hout van de huizen (huis-sdf.cjs, balkPatroon), vers en verweerd
  W.mat.hout = { ramp: H.hout, lo: 0.6, hi: houtHi, schaduwKracht: zacht, patroon: (C) => HS.balkPatroon(C, false) };
  W.mat.houtOud = { ramp: 'schors', lo: 0.8, hi: 5.8, schaduwKracht: zacht, patroon: (C) => HS.balkPatroon(C, true) };
  W.mat.stomp = { ramp: 'schors', lo: 1, hi: 5.8, schaduwKracht: zacht, patroon: stompPatroon };
  W.mat.ton = { ramp: H.hout, lo: 0.7, hi: houtHi, schaduwKracht: zacht, patroon: (C) => tonPatroon(H, C) };
  W.mat.ijzer = { ramp: 'ijzer', lo: 0.8, hi: 4.6, schaduwKracht: zacht };
  W.mat.water = { ramp: 'pet', lo: 0.3, hi: 2.4, schaduw: false, patroon: (C) => (hash(C.px >> 1, C.py, 7) % 13 === 0 ? 1.6 : 0) };
  W.mat.aarde = { ramp: 'aarde', lo: 0.7, hi: 5.2, schaduwKracht: zacht, patroon: (C) => aardePatroon(H, C) };
  W.mat.steen = { ramp: 'veldsteen', lo: 1.4, hi: 6.8, schaduwKracht: zacht, patroon: (C) => (hash(C.px, C.py, 44) % 9 === 0 ? -0.8 : 0) };
  W.mat.kool = { ramp: 'den', lo: 2.4, hi: 7, rand: 1.8, schaduwKracht: zacht, patroon: koolPatroon };
  W.mat.blad = { ramp: 'blad', lo: 1.4, hi: 6.6, schaduwKracht: 0.45, patroon: bladPatroon };
  W.mat.prei = { ramp: 'den', lo: 2, hi: 6.8, schaduwKracht: 0.45, patroon: bladPatroon };
  W.mat.salie = { ramp: 'olijf', lo: 1.8, hi: 6.6, schaduwKracht: 0.45, patroon: bladPatroon };
  W.mat.wit = { ramp: 'perkament', lo: 2.4, hi: 6.4, schaduwKracht: 0.5 };
  for (const kl of ['rood', 'goud', 'magie', 'baard', 'herfst', 'gewaad']) {
    W.mat['bloem_' + kl] = { ramp: kl, lo: 2.4, hi: 6.8, schaduwKracht: 0.55, patroon: (C) => (hash(C.px, C.py, 43) % 4 === 0 ? 0.8 : 0) };
  }
}

// ---------------------------------------------------------------- hulpjes

const bolDeel = (c, r) => ({ f: (x, y, z) => sdf.bol(x - c[0], y - c[1], z - c[2], r), g: [c[0], c[1], c[2], r + 0.5] });
// een blob blad of een bloem die een beetje bobbelt
const bobbel = (c, r, zaad) => ({
  f: (x, y, z) => (sdf.bol(x - c[0], y - c[1], z - c[2], r) - ruis3((x - c[0]) * 0.4, (y - c[1]) * 0.4, (z - c[2]) * 0.4, zaad) * r * 0.35) * 0.85,
  g: [c[0], c[1], c[2], r * 1.4 + 0.5],
});
// een plank of lat met een puntige bovenkant (een spijl): van voet a naar top b
function spijl(a, b, hb, hd, op) {
  const p = balk(a, b, hb, hd, op, 0.3);
  const f0 = p.f;
  const L = p.L;
  p.f = (x, y, z) => {
    const [l, w] = p.lok(x, y, z);
    return Math.max(f0(x, y, z), (l + Math.abs(w) * 1.3 - L / 2) * 0.62);
  };
  return p;
}

// ---------------------------------------------------------------- het hek

// Een stuk hek: een paal in het midden van de tegel, en naar elke arm (een rand van de tegel: [1,
// 0] is +x, [0, -1] is -y) het vlechtwerk ('tenen') of de latten ('lat'). `paal` false: geen paal
// in het midden (het hekje zet er zelf twee neer). `soort`: 'tenen' | 'lat'.
function hek(W, H, armen, soort, o = {}) {
  const g = W.groep('hek');
  const { sch, sp } = H;
  const R = (k) => H.r(100 + k);
  const RS = (k) => H.rs(100 + k);
  const paalH = HEK_HOOG * (0.94 + 0.12 * R(1)) * (soort === 'tenen' ? 1.03 : 1); // een staak steekt iets boven het vlechtwerk uit
  const hel = sch * (2 + 3 * R(2)) * GRAAD;
  const helR = R(3) * Math.PI * 2;
  const top = [Math.sin(hel) * Math.cos(helR) * paalH, Math.sin(hel) * Math.sin(helR) * paalH, paalH];
  const opPaal = (h) => [(top[0] * h) / paalH, (top[1] * h) / paalH, h];
  const dik = soort === 'tenen' ? (sp ? 1.9 : 1.6) : sp ? 2.4 : 2;
  if (o.paal !== false) voeg(g, { ...spijl([0, 0, -5], top, dik, dik, [1, 0, 0]), m: 'hout', deel: 10, zaad: 3.3, toon: RS(4) * 0.5 });
  let k = 0;
  for (const [dx, dy] of armen) {
    const n = [dy === 0 ? 0 : 1, dy === 0 ? 1 : 0]; // de kant van de staken/spijlen
    const van = o.van ?? 0; // waar de arm begint (een hekje heeft zijn eigen palen)
    if (soort === 'tenen') hekArmTenen(g, H, dx, dy, n, van, k);
    else hekArmLat(g, H, dx, dy, n, van, opPaal, k, R, RS);
    k++;
  }
  return g;
}

// 'lat': twee vlakke latten van de paal naar de rand van de tegel, ongelijk en een fractie
// doorgezakt — dezelfde opzet als de oude regels, maar breder en zonder spijlen.
function hekArmLat(g, H, dx, dy, n, van, opPaal, k, R, RS) {
  const { sch } = H;
  [REGELS[0], REGELS[2]].forEach((hR, j) => {
    const a = van ? [dx * van, dy * van, hR + RS(10 + j + k * 3) * 1.4] : opPaal(hR + 1.4 + RS(10 + j + k * 3) * 2);
    const b = [dx * (HALF + 0.3), dy * (HALF + 0.3), hR];
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2 - sch * (0.5 + R(20 + j + k * 3))];
    for (const [p0, p1, i] of [[a, m, 0], [m, b, 1]]) voeg(g, { ...balk(p0, p1, 1.1, 3.2, [0, 0, 1], 0.5), m: 'hout', deel: 20 + k * 4 + j * 2 + i, zaad: 5.1 + j + k, toon: RS(30 + j + k * 3) * 0.5 });
  });
}

// 'tenen': een paar dunne staken tussen de paal en de rand van de tegel, met drie hoogtes
// wilgenteen die er in korte stukjes overheen golven — geen echte over-en-onder vlechting (te
// klein op ware grootte), maar de zigzag en de vele dunne staken lezen als vlechtwerk.
function hekArmTenen(g, H, dx, dy, n, van, k) {
  const { sch, sp } = H;
  const eind = HALF + 0.3;
  const tussen = 7.6; // ruimte tussen de staken
  const aantal = Math.max(1, Math.round((eind - van) / tussen));
  const staken = [van];
  for (let i = 1; i <= aantal; i++) staken.push(van + ((eind - van) * i) / aantal);
  // de tussenstaken zelf: dun, ongelijk, een puntige top die boven de tenen uitsteekt. Geen staak
  // precies op de rand (i === staken.length - 1): de tenen halen die toch, en anders verdubbelt
  // hij met de staak van de buurtegel.
  for (let i = 1; i < staken.length - 1; i++) {
    const s = staken[i];
    const id = hash(i, k, H.zaad + 15);
    const hoog = REGELS[2] + (1.5 + 3 * rnd(i, k, H.zaad + 16)) * (sch && id % 13 === 4 ? 0.5 : 1);
    const lean = sch * (rnd(i, k, H.zaad + 17) - 0.5) * 6;
    const bx = dx * s + n[0] * 1.4;
    const by = dy * s + n[1] * 1.4;
    const topS = [bx + n[0] * lean * 0.4, by + n[1] * lean * 0.4, hoog];
    voeg(g, { ...spijl([bx, by, -4], topS, sp ? 1.6 : 1.3, sp ? 1.6 : 1.3, [n[0], n[1], 0]), m: 'houtOud', deel: 40 + k * 6 + i, zaad: i * 3.1 + k, toon: (rnd(i, k, H.zaad + 18) - 0.5) * 0.9 });
  }
  // de tenen: per hoogte een ketting van dunne stokjes tussen paal, staken en rand, die om en om
  // een fractie op en neer golft
  REGELS.forEach((hR, j) => {
    for (let i = 0; i < staken.length - 1; i++) {
      const p0 = staken[i];
      const p1 = staken[i + 1];
      const zig = (i % 2 ? 1 : -1) * (1.1 + H.rs(160 + i + j * 5 + k * 20) * 0.8);
      const a = [dx * p0, dy * p0, hR + zig];
      const b = [dx * p1, dy * p1, hR - zig];
      voeg(g, { ...stok(a, b, sp ? 1.25 : 1.05), m: 'houtOud', deel: 60 + k * 10 + j * 4 + i, zaad: i + j });
    }
  });
}

// Een hekje in een recht stuk hek (langs x of langs y): twee palen, en een deurtje van drie
// planken met klampen en een schoor, dat aan de ene paal hangt en een eindje open staat. Zelfde
// deurtje voor beide soorten (een gehangen deurtje is altijd van plank, ook in een wilgentenenhek).
function hekje(W, H, langs, soort) {
  const { sch, sp } = H;
  const R = (k) => H.r(200 + k);
  const d = langs === 'x' ? [1, 0] : [0, 1];
  const n = langs === 'x' ? [0, 1] : [1, 0];
  const g = W.groep('hekje');
  const pw = 12.5; // de palen staan zo ver van het midden
  const paalH = HEK_HOOG * 1.08; // het hekje mag een fractie boven het hek uitkomen
  const dik = soort === 'tenen' ? (sp ? 2 : 1.7) : sp ? 2.7 : 2.3;
  for (const s of [-1, 1]) {
    const lean = sch * (R(1 + s) - 0.5) * 3;
    voeg(g, { ...spijl([s * pw * d[0], s * pw * d[1], -5], [s * pw * d[0] + n[0] * lean, s * pw * d[1] + n[1] * lean, paalH], dik, dik, [n[0], n[1], 0]), m: 'hout', deel: 1 + (s > 0 ? 1 : 0), zaad: 7 + s, toon: 0.2 });
  }
  // de rest van het hek, van de palen naar de randen
  hek(W, H, langs === 'x' ? [[1, 0], [-1, 0]] : [[0, 1], [0, -1]], soort, { paal: false, van: pw });
  // het deurtje hangt aan de paal bij -pw en staat naar +n open
  const open = (14 + 16 * R(4)) * GRAAD * (langs === 'x' ? 1 : -1);
  const scharnier = [-pw * d[0], -pw * d[1], 0];
  const hoek = Math.atan2(d[1], d[0]) + open;
  const D = stelsel(scharnier, draaiZ(hoek / GRAAD));
  const breed = 2 * pw - 5;
  const hoog = paalH * 0.75; // ongeveer de lengte van een plank in het deurtje
  const zak = sch * (1.2 + 1.6 * R(5)); // het deurtje hangt wat door aan de loze kant
  let deel = 60;
  for (let i = 0; i < 3; i++) {
    const u = 2.5 + ((breed - 3) * (i + 0.5)) / 3;
    const z0 = hoog * 0.14 - (zak * u) / breed;
    voeg(g, { ...spijl(D.wereld(u, 0, z0), D.wereld(u, 0, z0 + hoog - 4 * (i % 2)), (breed - 3) / 6 - 0.2, 0.9, D.wereld(0, 1, 0).map((v, j) => v - scharnier[j])), m: 'houtOud', deel: deel++, zaad: 11 + i, toon: (R(6 + i) - 0.5) * 0.8 });
  }
  const klamp = (u0, z0, u1, z1) => voeg(g, { ...balk(D.wereld(u0, 1.6, z0), D.wereld(u1, 1.6, z1), 1.9, 0.9, D.wereld(0, 1, 0).map((v, j) => v - scharnier[j]), 0.3), m: 'hout', deel: deel++, zaad: 21 + u0, toon: 0.1 });
  klamp(1, hoog * 0.29 - zak * 0.1, breed, hoog * 0.29 - zak);
  klamp(1, hoog * 0.88 - zak * 0.1, breed, hoog * 0.88 - zak);
  klamp(3, hoog * 0.35 - zak * 0.1, breed - 2, hoog * 0.82 - zak);
  return g;
}

// ---------------------------------------------------------------- groente

// een bed van omgespitte aarde op de tegel, iets bol, met ruggen langs de rijen
function bed(W, H, rijen, langs, o = {}) {
  const g = W.groep('bed');
  const hx = o.hx ?? HALF - 4;
  const hy = o.hy ?? HALF - 4;
  voeg(g, {
    f: (x, y, z) => {
      const q = langs === 'x' ? y : x;
      const rug = rijen.reduce((m, r) => Math.max(m, Math.max(0, 1 - ((q - r) / 5.5) ** 2)), 0);
      const b = sdf.doos(x, y, z + 1.2, hx, hy, 2.6 + 1.6 * rug, 2.4);
      return b - ruis2(x * 0.3, y * 0.3, H.zaad + 5) * 0.6;
    },
    g: [0, 0, 0, Math.hypot(hx, hy) + 4],
    m: 'aarde',
    deel: 1,
  });
  return g;
}

// de rij loopt net niet recht: een golfje dwars op de rij, en elke plant een eindje ernaast
const rij = (H, k) => (t) => H.sch * (1.6 * Math.sin(t * 0.09 + H.r(300 + k) * 6.3) + 0.8 * (H.r(310 + k) - 0.5));

function kool(W, H) {
  const RIJEN = [-9, 9];
  bed(W, H, RIJEN, 'x');
  const g = W.groep('kool');
  let deel = 10;
  RIJEN.forEach((ry, j) => {
    const golf = rij(H, j);
    for (let i = 0; i < 3; i++) {
      const x = -12.5 + i * 12.5 + H.rs(320 + i + j * 3) * 1.8;
      const y = ry + golf(x);
      const r = 5.6 + 1.6 * H.r(330 + i + j * 3);
      const c = [x, y, 4 + r * 0.55];
      const zaad = 80 + i + j * 3 + H.zaad;
      voeg(g, {
        f: (px, py, pz) => (sdf.ellipsoide(px - c[0], py - c[1], pz - c[2], r, r, r * 0.86) - ruis3((px - c[0]) * 0.25, (py - c[1]) * 0.25, (pz - c[2]) * 0.25, zaad) * 2.6 + 1.2) * 0.72,
        g: [c[0], c[1], c[2], r + 4],
        m: 'kool',
        deel: deel++,
        kool: c,
      });
      // buitenbladen die opzij hangen
      for (let b = 0; b < 4; b++) {
        const a = H.r(340 + b + i * 4 + j * 12) * Math.PI * 2;
        const bc = [x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95, 3.4];
        voeg(g, { ...T.hulp.blokDeel(bc, [r * 0.6, r * 0.42, 0.9], (a / GRAAD) % 360, 26, (a / GRAAD + 90) % 360, 0.9), m: 'kool', deel: deel++, kool: c, k: 1.2 });
      }
    }
  });
}

function prei(W, H) {
  const RIJEN = [-11, 0, 11];
  bed(W, H, RIJEN, 'y');
  const g = W.groep('prei');
  let deel = 10;
  RIJEN.forEach((rx, j) => {
    const golf = rij(H, j + 4);
    for (let i = 0; i < 4; i++) {
      if (H.sch && hash(i, j, H.zaad + 12) % 11 === 0) continue; // een gat in de rij
      const y = -13 + i * 8.7 + H.rs(350 + i + j * 4) * 1.4;
      const x = rx + golf(y);
      const c = [x, y, 3];
      const hoog = 17 + 7 * H.r(360 + i + j * 4);
      voeg(g, { ...stok([x, y, 1], [x, y, 8], 1.8), m: 'wit', deel: deel++ });
      for (let b = 0; b < 4; b++) {
        const a = H.r(370 + b + i * 4 + j * 16) * Math.PI * 2;
        const w = 3.5 + 3 * H.r(380 + b + i * 4 + j * 16);
        voeg(g, { ...stok([x, y, 7], [c[0] + Math.cos(a) * w, c[1] + Math.sin(a) * w, hoog - b * 2.2], 1.3), m: 'prei', deel: deel++, k: 1 });
      }
    }
  });
}

function bonen(W, H) {
  bed(W, H, [0], 'x', { hy: 12 });
  const g = W.groep('bonen');
  const top = M * 1.25;
  let deel = 10;
  // twee staken aan elke kant die bovenin kruisen, en een lat erover
  const kruis = [];
  for (let i = 0; i < 3; i++) {
    const x = -15 + i * 15 + H.rs(390 + i) * 2;
    const tz = top - H.r(393 + i) * 6;
    for (const s of [-1, 1]) voeg(g, { ...stok([x + s * 0.6, s * 8.5, -3], [x - s * 0.5, -s * 2, tz], 1.2), m: 'hout', deel: deel++ });
    kruis.push([x, 0, tz - 5]);
  }
  voeg(g, { ...stok([kruis[0][0] - 5, 0, kruis[0][2] + 1], [kruis[2][0] + 5, 0, kruis[2][2] + 1], 1.1), m: 'hout', deel: deel++ });
  // de ranken met blad, dichter onderaan
  for (let i = 0; i < 44; i++) {
    const t = Math.pow(H.r(400 + i), 0.8);
    const x = -18 + 36 * H.r(460 + i);
    const s = H.r(520 + i) < 0.5 ? -1 : 1;
    const z = 4 + t * (top - 10);
    const y = s * 8.5 * (1 - z / top) + H.rs(580 + i) * 2;
    voeg(g, { ...bobbel([x, y, z], 2.6 + 1.2 * H.r(640 + i), H.zaad + i), m: 'blad', deel: 40 + (i % 6), k: 1.4 });
    if (H.r(700 + i) < 0.18) voeg(g, { ...bolDeel([x + 1.5, y + 1.5 * s, z - 2], 1.4), m: 'bloem_rood', deel: 50 });
  }
}

// ---------------------------------------------------------------- kruiden en bloemen

function kruidenbed(W, H) {
  const g = W.groep('kruiden');
  const h = HALF - 5;
  // de rand van stenen, niet op een lijn gelegd
  let deel = 1;
  voeg(g, { f: (x, y, z) => sdf.doos(x, y, z + 1, h - 1, h - 1, 3.2, 2), g: [0, 0, 0, h * 1.45], m: 'aarde', deel: deel++ });
  let i = 0;
  for (const [ax, ay, bx, by] of [[-h, -h, h, -h], [h, -h, h, h], [h, h, -h, h], [-h, h, -h, -h]]) {
    for (let t = 0; t < 1; t += 0.2) {
      const r = 3 + 1.3 * H.r(800 + i);
      const c = [mix(ax, bx, t) + H.rs(810 + i) * 1.2, mix(ay, by, t) + H.rs(820 + i) * 1.2, r * 0.45];
      voeg(g, { f: (x, y, z) => (sdf.ellipsoide(x - c[0], y - c[1], z - c[2], r * 1.2, r, r * 0.75) - ruis3(x * 0.4, y * 0.4, z * 0.4, i) * 0.8) * 0.85, g: [c[0], c[1], c[2], r * 1.5], m: 'steen', deel: 10 + (i % 8) });
      i++;
    }
  }
  const k = W.groep('kruid');
  // lavendel: een bol grijsgroen blad met paarse aren
  const lav = [-6, -6];
  voeg(k, { ...bobbel([lav[0], lav[1], 5], 7, H.zaad + 1), m: 'salie', deel: 30 });
  for (let j = 0; j < 12; j++) {
    const a = H.r(830 + j) * Math.PI * 2;
    const r = 2 + 4 * H.r(840 + j);
    const b = [lav[0] + Math.cos(a) * r, lav[1] + Math.sin(a) * r, 8];
    const t = [b[0] + Math.cos(a) * 3, b[1] + Math.sin(a) * 3, 17 + 5 * H.r(850 + j)];
    voeg(k, { ...stok(b, t, 0.6), m: 'salie', deel: 31 });
    voeg(k, { ...stok([mix(b[0], t[0], 0.6), mix(b[1], t[1], 0.6), mix(b[2], t[2], 0.6)], t, 1.3), m: 'bloem_magie', deel: 32 });
  }
  // salie: grijsgroene bollen
  for (let j = 0; j < 4; j++) voeg(k, { ...bobbel([7 + H.rs(860 + j) * 3, -6 + H.rs(870 + j) * 3, 4 + 2 * H.r(880 + j)], 3.4, H.zaad + 10 + j), m: 'salie', deel: 33, k: 1.5 });
  // tijm: een lage mat met paarse puntjes
  for (let j = 0; j < 7; j++) voeg(k, { ...bobbel([-7 + H.rs(890 + j) * 4, 7 + H.rs(900 + j) * 4, 2.4], 2.6, H.zaad + 20 + j), m: 'kool', deel: 34, k: 1.5 });
  for (let j = 0; j < 8; j++) voeg(k, { ...bolDeel([-7 + H.rs(910 + j) * 5, 7 + H.rs(920 + j) * 5, 4.5], 0.9), m: 'bloem_magie', deel: 35 });
  // bieslook met paarse bolletjes, en goudsbloemen
  for (let j = 0; j < 9; j++) {
    const b = [6 + H.rs(930 + j) * 2.5, 6 + H.rs(940 + j) * 2.5, 1];
    const t = [b[0] + H.rs(950 + j) * 2, b[1] + H.rs(960 + j) * 2, 12 + 4 * H.r(970 + j)];
    voeg(k, { ...stok(b, t, 0.7), m: 'prei', deel: 36 });
    if (j % 3 === 0) voeg(k, { ...bolDeel(t, 1.8), m: 'bloem_magie', deel: 37 });
  }
  voeg(k, { ...bobbel([0, 1, 4], 3.2, H.zaad + 40), m: 'blad', deel: 38 });
  for (let j = 0; j < 4; j++) voeg(k, { ...bolDeel([H.rs(980 + j) * 3, 1 + H.rs(990 + j) * 3, 7], 1.7), m: 'bloem_herfst', deel: 39 });
}

// Bloemen langs een muur: stokrozen achteraan (de muur staat achter de tegel), en lage bloemen
// ervoor. langs 'x': de muur loopt langs x aan de -y-kant; 'y': langs y aan de -x-kant.
function bloemen(W, H, langs) {
  const g = W.groep('bloemen');
  const P = (u, v, z) => (langs === 'x' ? [u, v, z] : [v, u, z]);
  const kleuren = [['rood', 'baard', 'magie'], ['magie', 'rood', 'baard'], ['baard', 'rood', 'rood']][Math.floor(H.r(1000) * 3)];
  let deel = 1;
  // de voet: een strook aarde met blad
  voeg(g, { f: (x, y, z) => { const [u, v] = langs === 'x' ? [x, y] : [y, x]; return sdf.doos(u, v + 12, z + 1, HALF - 3, 7, 2.2, 1.8); }, g: [...P(0, -12, 0), HALF + 4], m: 'aarde', deel: deel++ });
  for (let i = 0; i < 3; i++) {
    const u = -13 + i * 13 + H.rs(1010 + i) * 3;
    const v = -14 + H.rs(1020 + i) * 2;
    const hoog = 58 + 22 * H.r(1030 + i);
    const lean = H.sch * H.rs(1040 + i) * 4;
    const top = P(u + lean, v + Math.abs(lean) * 0.4, hoog);
    voeg(g, { ...stok(P(u, v, 0), top, 1.1), m: 'blad', deel: deel++ });
    // blad onderaan, bloemen langs het bovenste deel van de stengel
    for (let j = 0; j < 4; j++) voeg(g, { ...bobbel(P(u + H.rs(1050 + i * 4 + j) * 4, v + 2 + H.rs(1060 + i * 4 + j) * 3, 5 + j * 6), 3.8 - j * 0.5, H.zaad + i * 4 + j), m: 'blad', deel: 10 + i, k: 1.4 });
    const kl = 'bloem_' + kleuren[i];
    for (let j = 0; j < 8; j++) {
      const t = 0.42 + 0.56 * (j / 7);
      const zij = j % 2 ? 1 : -1;
      const c = [mix(P(u, v, 0)[0], top[0], t), mix(P(u, v, 0)[1], top[1], t), hoog * t];
      const o = P(zij * 1.6, 1.4, 0);
      voeg(g, { ...bolDeel([c[0] + o[0], c[1] + o[1], c[2]], 2.9 - 1.4 * t), m: kl, deel: 20 + i });
    }
  }
  // lage bloemen ervoor
  const laag = [['goud', 'blad'], ['baard', 'blad'], ['goud', 'blad']];
  for (let i = 0; i < 5; i++) {
    const u = -16 + i * 8 + H.rs(1100 + i) * 2;
    const v = -6 + H.rs(1110 + i) * 2;
    voeg(g, { ...bobbel(P(u, v, 3), 3.4, H.zaad + 50 + i), m: 'blad', deel: 30, k: 1.4 });
    const kl = 'bloem_' + laag[i % 3][0];
    for (let j = 0; j < 3; j++) voeg(g, { ...bolDeel(P(u + H.rs(1120 + i * 3 + j) * 2.6, v + H.rs(1130 + i * 3 + j) * 2.4, 6 + H.r(1140 + i * 3 + j) * 2), 1.5), m: kl, deel: 31 });
  }
}

// ---------------------------------------------------------------- bank en ton

// een bank van twee planken op twee stompen, langs x of langs y
function bankje(W, H, langs) {
  const g = W.groep('bank');
  const d = langs === 'x' ? [1, 0] : [0, 1];
  const n = langs === 'x' ? [0, 1] : [1, 0];
  const zit = M * 0.44;
  let deel = 1;
  for (const s of [-1, 1]) {
    const c = [s * 13 * d[0] + H.rs(1200 + s) * n[0], s * 13 * d[1] + H.rs(1200 + s) * n[1]];
    const r = 5.2 + 0.8 * H.r(1202 + s);
    const h = zit - 2.6 - H.r(1204 + s) * 1.4;
    voeg(g, { f: (x, y, z) => sdf.cilinder(x - c[0], y - c[1], z, r, -3, h), g: [c[0], c[1], h / 2, h / 2 + r + 1], m: 'stomp', deel: deel++, stam: c });
  }
  for (const s of [-1, 1]) {
    const o = s * 3.8 + H.rs(1210 + s) * 0.8;
    const zz = zit - 1.2 + H.rs(1212 + s) * 0.8;
    const a = [-19 * d[0] + o * n[0] + H.rs(1214 + s), -19 * d[1] + o * n[1], zz];
    const b = [19 * d[0] + o * n[0], 19 * d[1] + o * n[1] + H.rs(1216 + s), zz + H.rs(1218 + s) * 0.9];
    voeg(g, { ...balk(a, b, 3.5, 1.3, [0, 0, 1], 0.4), m: 'houtOud', deel: deel++, zaad: 30 + s, toon: H.rs(1220 + s) * 0.6, naad: 3.5 });
  }
}

// een regenton: duigen die in het midden uitbuiken, drie ijzeren hoepels, en water tot net onder
// de rand; hij staat een tikje scheef op twee platte stenen
function regenton(W, H) {
  const g = W.groep('ton');
  const hoog = M * 0.85;
  const r0 = 15;
  const bol = 1.8;
  const scheef = H.sch * (1.5 + 2 * H.r(1300)) * GRAAD;
  const naar = H.r(1301) * Math.PI * 2;
  const B = stelsel([0, 0, 3], T.helMatrix(scheef / GRAAD, (naar / GRAAD) % 360));
  const straal = (z) => r0 + bol * Math.sin(Math.PI * klem(z / hoog, 0, 1));
  const c = [0, 0];
  voeg(g, {
    f: B.veld((x, y, z) => {
      const rr = Math.hypot(x, y);
      const d = Math.max(rr - straal(z), -z, z - hoog) * 0.95;
      // hol van boven
      return Math.max(d, -Math.max(rr - (straal(z) - 1.8), hoog - 13 - z));
    }),
    g: [0, 0, hoog / 2 + 3, Math.hypot(r0 + bol, hoog / 2) + 2],
    m: 'ton',
    deel: 1,
    ton: [c[0], c[1], 15],
  });
  voeg(g, { f: B.veld((x, y, z) => Math.max(Math.hypot(x, y) - (straal(hoog - 7) - 1.5), Math.abs(z - (hoog - 7)) - 0.6)), g: [0, 0, hoog - 4, r0 + 4], m: 'water', deel: 2 });
  [0.12, 0.5, 0.88].forEach((t, i) => {
    const z = hoog * t;
    voeg(g, { f: B.veld((x, y, zz) => sdf.torus(x, y, zz - z, straal(z) + 0.2, 1.1)), g: [0, 0, z + 3, r0 + bol + 3], m: 'ijzer', deel: 3 + i });
  });
  for (const s of [-1, 1]) {
    const cs = [s * 7 + H.rs(1310 + s) * 2, H.rs(1312 + s) * 3, 1.2];
    voeg(g, { ...T.hulp.blokDeel(cs, [7, 9, 2.4], H.r(1314 + s) * 40, 3, 0, 1), m: 'steen', deel: 8 + s });
  }
}

// ---------------------------------------------------------------- de stukken

// Elke richting bestaat één keer per soort hek (HEK_SOORTEN): hek-tenen-x, hek-lat-x, enz. Zo
// kiest Marcel in Tiled per tuin welk hek hij neerzet.
const HEK_RICHTINGEN = {
  x: [[1, 0], [-1, 0]],
  y: [[0, 1], [0, -1]],
  'hoek-boven': [[1, 0], [0, 1]],
  'hoek-onder': [[-1, 0], [0, -1]],
  'hoek-links': [[1, 0], [0, -1]],
  'hoek-rechts': [[-1, 0], [0, 1]],
  'eind+x': [[1, 0]],
  'eind-x': [[-1, 0]],
  'eind+y': [[0, 1]],
  'eind-y': [[0, -1]],
};
const HEK_SOORTEN = ['tenen', 'lat'];
const HEKKEN = {};
for (const soort of HEK_SOORTEN) for (const [vorm, armen] of Object.entries(HEK_RICHTINGEN)) HEKKEN[`hek-${soort}-${vorm}`] = { soort, armen };
const HEKJE_NAAM = /^hekje-(tenen|lat)-([xy])$/;
const STUKKEN = [
  ...Object.keys(HEKKEN),
  ...HEK_SOORTEN.flatMap((soort) => [`hekje-${soort}-x`, `hekje-${soort}-y`]),
  'kool',
  'prei',
  'bonen',
  'kruidenbed',
  'bloemen-x',
  'bloemen-y',
  'bankje-x',
  'bankje-y',
  'regenton',
];

// Het hout van een tuin is meestal grijs verweerd; het zaad kiest, zoals bij de huizen.
function knoppen(zaad) {
  const H = HS.knoppenVan(zaad, {});
  H.hout = HS.meng(zaad, 11) < 0.7 ? 'schors' : 'hout';
  return H;
}

function tuinstuk(naam, zaad = 1) {
  const W = new Wereld();
  const H = knoppen(zaad);
  W.H = H;
  tuinMaterialen(W, H);
  const hekjeM = naam.match(HEKJE_NAAM);
  if (HEKKEN[naam]) hek(W, H, HEKKEN[naam].armen, HEKKEN[naam].soort);
  else if (hekjeM) hekje(W, H, hekjeM[2], hekjeM[1]);
  else if (naam === 'kool') kool(W, H);
  else if (naam === 'prei') prei(W, H);
  else if (naam === 'bonen') bonen(W, H);
  else if (naam === 'kruidenbed') kruidenbed(W, H);
  else if (naam === 'bloemen-x' || naam === 'bloemen-y') bloemen(W, H, naam.slice(-1));
  else if (naam === 'bankje-x' || naam === 'bankje-y') bankje(W, H, naam.slice(-1));
  else if (naam === 'regenton') regenton(W, H);
  else throw new Error(`onbekend tuinstuk: ${naam} (kies uit ${STUKKEN.join(', ')})`);
  return W;
}

module.exports = { tuinstuk, STUKKEN, HEKKEN, HEK_SOORTEN, REGELS, HALF, HEK_HOOG };
