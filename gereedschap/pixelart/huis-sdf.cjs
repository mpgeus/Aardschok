// Een proefhuis uit afstandsfuncties: kunnen we bij de boerderij met de watermolen komen?
// (ontwerp/beeld.md, "Niets is waterpas" en "De leidende referentie"). Nog geen vervanging van
// huis(o) in dorp.cjs, alleen het bewijs dat het kan.
//
// huis(o) bouwt uit dozen en vlakken, en een doos is per definitie recht. Hier is alles een
// afstandsveld, zoals de figuren en de toren, en het gaat door de tekenaar van toren.cjs
// (tekenWereld): die kan grote dingen aan en legt één zon over alles, dus het riet werpt zijn
// schaduw op de muur en de schoorsteen op het dak. Drie knoppen, standaard alle drie aan:
//
//   scheef     Niets is waterpas. Een nok die in het midden doorzakt, een dakrand die golft,
//              muren die een fractie hellen en uitpuilen, balken van ongelijke dikte, ramen en
//              deur net niet recht of op gelijke hoogte, een leunende schoorsteen, een gelapt
//              stuk riet in een andere tint. Per zaad anders, en vast.
//   pak        Het dak is een dik, bol pak riet dat over de muren zakt en rond omkrult aan de
//              rand, met lagen die je ziet liggen en een worst als nok. Zonder: twee platen.
//   speelgoed  Speelgoedverhoudingen en harder contrast: dikke balken, grote ramen, deur en
//              stenen, minder maar grotere details; donkere randen, diepe schaduw onder de
//              overstek, fel zonlicht op het riet.
//
// proefhuis(zaad, { knoppen: { pak: false } }) zet er één uit, om te zien wat hij doet.
//
// Assen als in kern.cjs: +x rechtsonder in beeld, +y linksonder, z omhoog, in eenheden (een tegel
// is 45,25; één eenheid hoog is 0,866 pixel). De oorsprong is het midden van de plattegrond. De
// nok loopt langs x: dan kijkt het grote dakschild naar linksvoor, de zon in, en staat de gevel
// rechtsvoor in de schaduw. Hoogtes die "px" heten zijn schermpixels boven de grond.
'use strict';
const K = require('./kern.cjs');
require('./dorp.cjs'); // meldt de veldsteen-ramp aan bij kern.cjs
const T = require('./toren.cjs');
const { TEGEL, PXH, RAMP, RAMP_LEN, hash, rnd, ruis2, klem, mix, glad, sdf } = K;
const { Wereld, voeg } = T;
const { E, GRAAD, balk, steenOp, steenStap, houtTex } = T.hulp;
const SQ = Math.SQRT1_2;
// de dakhelling: bij 51° lopen de halmen op het scherm schoon 1:2; per zaad een paar graden anders
const HELLING = 51;

// ---------------------------------------------------------------- vormen

// afstand tot een rechthoek in 2D met halve maten hx, hy
function rechthoek(a, v, hx, hy) {
  const qa = Math.abs(a) - hx;
  const qv = Math.abs(v) - hy;
  return qa > 0 || qv > 0 ? Math.hypot(Math.max(qa, 0), Math.max(qv, 0)) : Math.max(qa, qv);
}
// een 2D-vorm (afstand d) als laag van n0 tot n1 langs de normaal
function laag(d, n, n0, n1) {
  const dn = Math.max(n0 - n, n - n1);
  return d > 0 || dn > 0 ? Math.hypot(Math.max(d, 0), Math.max(dn, 0)) : Math.max(d, dn);
}

// Gekopieerd uit toren.cjs (steenKleur wordt daar niet geëxporteerd): één steen op de zeven
// warm, van de rest één op de elf koel, zodat de muur gemengd oogt in plaats van egaal grijs.
function steenKleur(st) {
  if (st.pb < 1 || st.pr < 1) return null;
  if (st.id % 7 === 0) return 'bot';
  if (st.id % 11 === 0) return 'pet';
  return null;
}

// ---------------------------------------------------------------- de maten per zaad

function maten(zaad = 1, o = {}) {
  const kn = { scheef: true, pak: true, speelgoed: true, ...(o.knoppen || {}) };
  const r = (k) => rnd(zaad * 7919 + 101, k);
  const rs = (k) => r(k) * 2 - 1;
  const sch = kn.scheef ? 1 : 0;
  const sp = kn.speelgoed;
  const pak = kn.pak;
  const b = o.b ?? 8;
  const d = o.d ?? 6;
  const H = { zaad, kn, r, rs, sch, sp, pak, b, d, Wy: b * 32, Wx: d * 32 };
  H.HX = (b * TEGEL) / 2;
  H.HY = (d * TEGEL) / 2;

  // --- muren: ze hellen een fractie en puilen in het midden wat uit
  H.muurH = 176; // de bovenkant van de muur, verstopt in het riet
  H.zM = E(H.muurH);
  H.hellY = sch * (0.016 + 0.014 * r(2)) * (r(3) < 0.7 ? 1 : -1);
  H.hellX = sch * (0.013 + 0.013 * r(4)) * (r(5) < 0.5 ? 1 : -1);
  H.bolY = sch * (1.8 + 1.6 * r(6));
  H.bolX = sch * (1.4 + 1.3 * r(7));
  // steen onder, hout boven; de lijn ertussen ligt niet waterpas
  H.hS = 60 + Math.round(sch * rs(8) * 8);
  H.hSx = sch * rs(9) * 6;
  H.hSy = sch * rs(10) * 4;
  // het hout: warm eiken of grijs verweerd
  H.hout = sch && r(35) < 0.34 ? 'schors' : 'hout';

  // --- het dak: de middellijn van het rietpak loopt van de nok naar de voet
  H.dik = pak ? 15 : 12; // halve dikte
  H.hoekig = !pak; // zonder pak: platen met scherpe randen, zoals nu
  H.voetDik = pak ? 0.22 : 0; // de voet is een dikke rol
  H.bol = pak ? 6 : 0; // het schild puilt halverwege uit
  H.ov = 22;
  H.ovg = pak ? 20 : 12;
  H.kopR = pak ? 8 : 1;
  // De voet zo hoog dat de rand van het riet (die naar voren steekt, en die je dus vóór de muur
  // ziet hangen) de deur en de ramen nog vrijlaat.
  H.voetZ = E(166);
  H.qE = H.HY + H.ov;
  H.helling = (HELLING + sch * rs(34) * 3) * GRAAD;
  H.zN = H.voetZ + H.qE * Math.tan(H.helling);
  H.XR = H.HX + H.ovg;
  // de nok zakt in het midden door, tien tot zestien pixels
  const zak = sch * E(10 + 6 * r(11));
  const nokF = r(12) * 6.3;
  const nokScheef = sch * rs(36) * E(5); // en de ene kant hangt lager dan de andere
  H.nokZ = (x) => H.zN - zak * (1 - klem((x / H.XR) ** 2, 0, 1)) + nokScheef * (x / H.XR) + sch * E(1.3) * Math.sin(x * 0.034 + nokF);
  // de dakrand golft (drie à vier pixels) en de hoeken hangen wat
  const golfA = sch * E(2.8 + 1.6 * r(13));
  const golfK = 0.021 + 0.012 * r(14);
  const golfF = r(15) * 6.3;
  const golfF2 = r(17) * 6.3;
  const hoekZak = sch * E(2.5 + 3 * r(16));
  H.voetZ_ = (x) => H.voetZ + golfA * Math.sin(x * golfK + golfF) + sch * E(1.3) * Math.sin(x * 0.09 + golfF2) - hoekZak * (x / H.XR) ** 4;
  const uitF = r(18) * 6.3;
  H.voetQ = (x) => H.qE + sch * 3.2 * Math.sin(x * 0.019 + uitF);
  // lagen riet: een zaagtand van de voet naar de nok, die niet recht loopt
  H.laagL = sp ? 30 : 20;
  H.laagH = pak ? 1.6 : 0;
  const lgF1 = r(19) * 6.3;
  const lgF2 = r(20) * 6.3;
  H.laagGolf = (x) => sch * (1.6 * Math.sin(x * 0.043 + lgF1) + 0.9 * Math.sin(x * 0.12 + lgF2));
  // een gelapt stuk, vers of juist ouder dan de rest
  if (sch) {
    const k0 = 2 + Math.floor(r(22) * 4);
    H.lap = { x: rs(21) * H.HX * 0.5, k0, k1: k0 + 1 + Math.floor(r(23) * 2), hw: 30 + 16 * r(24), vers: r(25) < 0.55 };
  } else H.lap = null;
  H.worstR = pak ? 18 : 0;

  // --- de schoorsteen: op het voorste schild vlak onder de nok, en hij leunt
  const kant = r(26) < 0.5 ? -1 : 1;
  H.schoorsteen = {
    x: kant * H.HX * (0.3 + 0.32 * r(27)),
    y: 16 + 14 * r(28),
    s: sp ? 11 : 8,
    lx: sch * (0.05 + 0.05 * r(29)) * (r(30) < 0.5 ? -1 : 1),
    ly: sch * (0.03 + 0.04 * r(31)) * (r(32) < 0.5 ? -1 : 1),
    hoog: E(36 + 14 * r(33)),
  };

  // --- de lange muur (y, linksvoor, in de zon): een deur met een raam aan weerskanten
  const raamB = sp ? 36 : 24;
  const raamH = sp ? 42 : 30;
  H.deur = {
    u: Math.round(H.Wy * (0.4 + 0.2 * r(40))),
    b: sp ? 50 : 42,
    h: sp ? 102 : 94,
    hoek: sch * rs(41) * 1.1 * GRAAD, // het gat in de muur
    blad: sch * rs(42) * 2.4 * GRAAD, // de deur zelf past er niet helemaal in
  };
  H.ramen = [];
  const dL = H.deur.u - H.deur.b / 2;
  const dR = H.deur.u + H.deur.b / 2;
  const zones = [[16, dL - 26], [dR + 26, H.Wy - 18]];
  let k = 50;
  for (const [z0, z1] of zones) {
    if (z1 - z0 < raamB + 10) continue;
    const u = (z0 + z1) / 2 + sch * rs(k++) * Math.min(10, (z1 - z0 - raamB) / 3);
    const h0 = steenLijnU(H, 'y', u) + (sp ? 14 : 10) + sch * rs(k++) * 3.5;
    H.ramen.push({ wand: 'y', u, h0, b: raamB + (sch ? Math.round(rs(k++) * 2) : 0), h: raamH + (sch ? Math.round(rs(k++) * 3) : 0), hoek: sch * rs(k++) * 2 * GRAAD, warm: false });
  }
  // --- de gevel (x, rechtsvoor, in de schaduw): een raam beneden, een in de top
  H.ramen.push({ wand: 'x', u: H.Wx / 2 + sch * rs(60) * 10, h0: steenLijnU(H, 'x', H.Wx / 2) + (sp ? 16 : 12) + sch * rs(61) * 3, b: raamB - 2, h: raamH - 2, hoek: sch * rs(62) * 2.2 * GRAAD, warm: r(63) < 0.6 });
  H.ramen.push({ wand: 'x', u: H.Wx / 2 + sch * rs(64) * 8, h0: 196 + sch * rs(65) * 4, b: raamB - 6, h: raamH - 4, hoek: sch * rs(66) * 2.5 * GRAAD, warm: r(67) < 0.4 });
  // een schoor tegen de gevel, bij een oud huis
  H.schoor = sch && r(68) < 0.5 ? { u: 150 + 26 * r(69), uit: 44 + 16 * r(70), h: 118 + 20 * r(71) } : null;

  // --- de openingen in de muur (om uit te snijden)
  H.openingen = [];
  H.openingen.push(opening(H, 'y', H.deur.u, 0, H.deur.b, H.deur.h, H.deur.hoek, 7, 'donker'));
  for (const w of H.ramen) {
    w.op = opening(H, w.wand, w.u, w.h0, w.b, w.h, w.hoek, sp ? 7 : 5, w.warm ? 'glasWarm' : 'glas');
    H.openingen.push(w.op);
  }
  return H;
}

// de bovenkant van de steen, in px, als een schuin vlak over het huis
const steenLijn = (H, x, y) => H.hS + H.hSx * (x / H.HX) - H.hSy * (y / H.HY);
function steenLijnU(H, wand, u) {
  return wand === 'y' ? steenLijn(H, -H.HX + u / SQ, H.HY) : steenLijn(H, H.HX, H.HY - u / SQ);
}

// de muren puilen in het midden uit (xs, ys: al terug van de helling)
const bolY = (H, xs, z) => H.bolY * Math.max(0, 1 - (xs / H.HX) ** 2) * Math.sin(Math.PI * klem(z / H.zM, 0, 1));
const bolX = (H, ys, z) => H.bolX * Math.max(0, 1 - (ys / H.HY) ** 2) * Math.sin(Math.PI * klem(z / H.zN, 0, 1));

// Een punt op een muur. wand 'y' is de lange muur linksvoor (u loopt in beeld van links naar
// rechts, van de achterhoek naar de voorhoek), 'x' de gevel rechtsvoor (u van de voorhoek naar
// rechts). h in px boven de grond, uit in eenheden voor het oppervlak.
function muurPunt(H, wand, u, h, uit = 0) {
  const z = h / PXH;
  if (wand === 'y') {
    const xs = -H.HX + u / SQ;
    return [xs + H.hellX * z, H.HY + H.hellY * z + bolY(H, xs, z) + uit, z];
  }
  const ys = H.HY - u / SQ;
  return [H.HX + H.hellX * z + bolX(H, ys, z) + uit, ys + H.hellY * z, z];
}

// Een opening in een muur: een deur of raam, gedraaid in het vlak van de muur. lok geeft
// (a langs de muur, v omhoog, n uit de muur) in eenheden, gedraaid met de opening mee.
function opening(H, wand, u, h0, b, h, hoek, diep, binnen) {
  const hb = b / 2 / SQ;
  const hh = h / 2 / PXH;
  const zc = (h0 + h / 2) / PXH;
  const co = Math.cos(hoek);
  const si = Math.sin(hoek);
  let lok;
  if (wand === 'y') {
    const xc = -H.HX + u / SQ;
    lok = (x, y, z) => {
      const xs = x - H.hellX * z;
      const a0 = xs - xc;
      const v0 = z - zc;
      return [a0 * co + v0 * si, -a0 * si + v0 * co, y - H.HY - H.hellY * z - bolY(H, xs, z)];
    };
  } else {
    const yc = H.HY - u / SQ;
    lok = (x, y, z) => {
      const ys = y - H.hellY * z;
      const a0 = yc - ys;
      const v0 = z - zc;
      return [a0 * co + v0 * si, -a0 * si + v0 * co, x - H.HX - H.hellX * z - bolX(H, ys, z)];
    };
  }
  return { wand, u, h0, b, h, hb, hh, zc, hoek, diep, binnen, lok };
}

// ---------------------------------------------------------------- het dak

// Plek op het dak: de middellijn loopt in het vlak (q = |y|, z) van de nok (0, nokZ) naar de
// voet (voetQ, voetZ). langs: afstand vanaf de nok langs de helling, dw: boven de middellijn,
// t: 0 bij de nok, 1 bij de voet, sE: afstand vanaf de voet omhoog.
function dakPlek(H, x, y, z) {
  const q = Math.abs(y);
  const z0 = H.nokZ(x);
  const q1 = H.voetQ(x);
  const z1 = H.voetZ_(x);
  const dz = z1 - z0;
  const L = Math.hypot(q1, dz);
  const ux = q1 / L;
  const uz = dz / L;
  const pz = z - z0;
  const langs = q * ux + pz * uz;
  const dw = -q * uz + pz * ux;
  return { q, z0, L, ux, uz, langs, dw, t: klem(langs / L, 0, 1), sE: L - langs };
}

// Ligt (x, sE) in de lap? Negatief is erin; alleen op het voorste schild. Een lap volgt de lagen:
// twee of drie banen nieuw riet, elk een eind anders breed, zoals iemand het gat heeft gedicht.
function lapWaarde(H, x, sE, y) {
  if (!H.lap || y < 0) return 1;
  const k = Math.floor((sE + H.laagGolf(x)) / H.laagL);
  if (k < H.lap.k0 || k > H.lap.k1) return 1;
  const hw = H.lap.hw * (0.7 + 0.6 * rnd(H.zaad, k, 77));
  const xc = H.lap.x + (rnd(H.zaad, k, 78) - 0.5) * 22;
  return (Math.abs(x - xc) - hw) / 20;
}

// Het reliëf van één laag: bij de stoot (f = 0, de onderkant) snel omhoog, dan langzaam af.
function laagReliëf(H, x, sE) {
  if (!H.laagH) return 0;
  const fase = (sE + H.laagGolf(x)) / H.laagL;
  const f = fase - Math.floor(fase);
  const a = 0.2;
  return H.laagH * (f < a ? glad(0, 1, f / a) : 1 - (0.75 * (f - a)) / (1 - a));
}

function dakVeld(H) {
  return (x, y, z) => {
    const P = dakPlek(H, x, y, z);
    let dw = P.dw - H.bol * 4 * P.t * (1 - P.t);
    if (H.laagH && P.langs > 0) dw -= laagReliëf(H, x, P.sE);
    if (H.lap) {
      const lw = lapWaarde(H, x, P.sE, y);
      if (lw < 0.2) dw -= 1.6 * glad(0.2, -0.1, lw);
    }
    const rT = H.dik * (1 + H.voetDik * P.t * P.t);
    let d;
    if (H.hoekig) {
      // twee platen met rechte kanten; bij de nok lopen ze in elkaar door
      d = Math.max(Math.abs(dw) - rT, P.langs - P.L, -P.langs - rT);
    } else if (P.langs < 0) d = Math.hypot(P.langs, dw) - rT;
    else if (P.langs > P.L) d = Math.hypot(P.langs - P.L, dw) - rT;
    else d = Math.abs(dw) - rT;
    // de kopse kanten bij de gevels, afgerond afgesneden
    const rr = H.kopR;
    const a = d + rr;
    const bq = Math.abs(x) - (H.XR - rr);
    return Math.min(Math.max(a, bq), 0) + Math.hypot(Math.max(a, 0), Math.max(bq, 0)) - rr;
  };
}

// Onder het dak: hoe ver een punt boven de onderkant van het rietpak ligt. De muur en de gevel
// houden daar op, ruim binnen het riet.
function onderDak(H, x, y, z) {
  const P = dakPlek(H, x, y, z);
  return P.dw + H.dik * 0.45;
}

// ---------------------------------------------------------------- de patronen

// Diepe schaduw onder de overstek. De slagschaduw van de rand valt in deze hoek grotendeels achter
// de rand zelf, dus dat is niet genoeg: onder het riet komt ook minder hemellicht. Hoeveel
// stappen een muur daar donkerder wordt, oplopend naar de onderkant van het riet.
function randSchaduw(H, C) {
  if (C.nz > 0.5) return 0;
  const { x, y, z } = C;
  let d = 0;
  // Langs de lange muren: gemeten vanaf de lijn waar de rand van het riet de muur in beeld
  // afdekt (de rand steekt naar voren, dus die lijn ligt lager dan de rand zelf).
  // Een harde baan vlak onder de rand, en daaronder een zachte overgang.
  const baan = (afstand, hard, zacht) => (afstand < hard ? 1 : klem(1 - (afstand - hard) / zacht, 0, 1));
  if (Math.abs(y) > H.HY - 24) {
    // de rol aan de voet raakt de kijkstraal 1,3 straal onder zijn midden
    const zLijn = H.voetZ_(x) - 1.3 * H.dik * (1 + H.voetDik) - 0.82 * (H.voetQ(x) - H.HY);
    d = Math.max(d, H.sp ? baan(zLijn - z, E(9), E(14)) : baan(zLijn - z, 0, E(10)));
  }
  // langs de gevel: onder het rietpak dat er schuin overheen steekt
  if (Math.abs(x) > H.HX - 24) {
    const P = dakPlek(H, x, y, z);
    const zc = P.z0 + (P.uz / P.ux) * P.q;
    const zLijn = zc - H.dik / P.ux - 0.82 * H.ovg;
    d = Math.max(d, H.sp ? baan(zLijn - z, E(7), E(12)) : baan(zLijn - z, 0, E(9)));
  }
  return d * (H.sp ? 2.6 : 1);
}
// een patroon voor een muur of wat erop zit, met die schaduw eronder
function metRand(H, f) {
  return (C) => {
    const dk = randSchaduw(H, C);
    if (!dk) return f(C);
    C.stap -= dk;
    const r = f(C);
    if (typeof r === 'number') return r - dk;
    if (!r) return -dk;
    if (r.stap === undefined) return { ...r, plus: (r.plus || 0) - dk };
    return r;
  };
}

// Riet: lagen die je ziet liggen (onder elke laag een rafelige donkere lijn, naar boven toe
// lichter, zoals op de referentie), en daarin halmen langs de helling: kolommen van één pixel
// breed, in stukjes van vijf tot tien, om en om lichter en donkerder.
function rietPatroon(H, C) {
  const { x, y, z } = C;
  const P = dakPlek(H, x, y, z);
  // de kopse kant bij de gevel: stoppels
  if (Math.abs(C.nx) > 0.6 && P.langs > 0) {
    const h = hash(C.px, C.py, H.zaad + 5) % 9;
    return (h < 2 ? -1.4 : h > 6 ? 0.6 : 0) - 0.3;
  }
  const lw = lapWaarde(H, x, P.sE, y);
  const inLap = lw < 0;
  // De zijranden van de lap, precies één pixel: de nieuwe halmen liggen er bovenop, dus de kant
  // naar de zon vangt licht en aan de andere kant zit een schaduwlijn.
  if (H.lap && Math.abs(lw) < 0.2) {
    const buur = (dx, dy, dz) => {
      const Q = dakPlek(H, x + dx, y + dy, z + dz);
      return lapWaarde(H, x + dx, Q.sE, y + dy) < 0;
    };
    const rechts = buur(C.dxv[0], C.dxv[1], C.dxv[2]);
    const links = buur(-C.dxv[0], -C.dxv[1], -C.dxv[2]);
    if (!inLap && links) return -2.2; // net rechts van de lap: zijn schaduw
    if (inLap && !links) return 1.2; // de linkerrand in de zon
    if (inLap && !rechts) return -1;
  }
  const fase = (P.sE + H.laagGolf(x)) / H.laagL;
  const k = Math.floor(fase);
  const f = fase - k;
  // halmen: vaste kolommen langs x (een kolom is op het scherm één pixel breed)
  const kol = Math.floor(x / 1.414 + 0.4 * Math.sin(P.sE * 0.07 + k));
  const spring = hash(kol, 0, H.zaad + 2) % 11;
  const stukL = 4 + (hash(kol, 1, H.zaad) % 6);
  const stuk = Math.floor((P.sE + spring) / stukL);
  const halm = hash(kol, stuk, H.zaad + (inLap ? 17 : 1)) % 12;
  let s = halm < 3 ? -1.4 : halm > 8 ? 1.1 : 0;
  if (H.laagH) {
    // onderaan elke laag een donkere zoom, rafelig: elke halm houdt ergens anders op
    const fu = f * H.laagL;
    const eind = (hash(kol, k, H.zaad + 9) % 6) * 0.9;
    if (fu < 1.6 + eind * 0.5) s = -2.4;
    else if (fu < 1.6 + eind) s = -1.6;
    else s += mix(-0.8, 0.7, klem((fu - 1.6) / (H.laagL - 1.6), 0, 1));
  } else {
    // zonder pak: de lagen van rietPixel, alleen als tekening
    if (f < 0.1) s = -2;
    else if (f > 0.88 && halm > 4) s += 1;
  }
  if (inLap) {
    // vers riet is lichter en geler, oud riet grauwer
    return H.lap.vers ? { plus: s + 0.7 } : { ramp: 'riet', plus: s + 0.6 };
  }
  return s;
}

// de nok: een worst van riet met om de zoveel een binding
function nokPatroon(H, C) {
  const x = C.x;
  const band = (((x + 400 + H.zaad * 7) % 46) + 46) % 46;
  if (band < 2) return -1.4;
  const kol = Math.floor(x / 1.414);
  const halm = hash(kol, Math.floor(C.z / 5), H.zaad + 3) % 10;
  return halm < 2 ? -1.1 : halm > 7 ? 0.9 : 0;
}

// Stenen, groot en niet waterpas: de rijen golven een pixel of twee en lopen iets schuin.
function steenPatroon(H, C, maat) {
  const { x, y, z, nx, ny } = C;
  let U;
  let zaad;
  if (Math.abs(ny) >= Math.abs(nx)) {
    U = (ny >= 0 ? -x : x) * SQ;
    zaad = H.zaad * 13 + 1;
  } else {
    U = (nx >= 0 ? y : -y) * SQ;
    zaad = H.zaad * 13 + 2;
  }
  const Hp = z * PXH + H.sch * (1.6 * Math.sin(U * 0.043 + H.zaad) + U * 0.012);
  const st = steenOp(U, Hp, 1, 1, zaad, maat[0], maat[1], maat[2]);
  const s = steenStap(st, C.stap, C.px, C.py, { voeg: 2.6, zaad: H.zaad });
  const kl = steenKleur(st);
  if (kl) return { ramp: kl, stap: (s * (RAMP_LEN[RAMP[kl]] - 1)) / (RAMP_LEN[RAMP.veldsteen] - 1) };
  return { stap: s };
}

// pleister: vlekkerig, en onderaan wat vuiler
function pleisterPatroon(H, C) {
  const n = ruis2(C.px * 0.16, C.py * 0.16, H.zaad + 7);
  let s = n > 0.7 ? -0.6 : n < 0.22 ? 0.4 : 0;
  if (hash(C.px, C.py, H.zaad + 8) % 31 === 0) s -= 0.8;
  return s;
}

// kozijnen: nerf langs de lengte van elk stuk
function kozijnPatroon(C) {
  const p = C.deel;
  if (!p.raam) return 0;
  const [a, v] = p.raam.op.lok(C.x, C.y, C.z);
  const staand = Math.abs(a) > p.raam.op.hb && Math.abs(v) < p.raam.op.hh + 2;
  const w = staand ? a : v;
  const l = staand ? v : a;
  const nerf = Math.sin(w * 2.1 + Math.sin(l * 0.12 + p.raam.u) * 2);
  return nerf > 0.8 ? -0.8 : nerf < -0.9 ? 0.5 : 0;
}

// De deur: verticale planken met een naad van één pixel, twee klampen, ijzeren hengsels.
function deurPatroon(H, C) {
  const p = C.deel;
  const [a, v, n] = p.lok(C.x, C.y, C.z);
  if (n < -1) return 0;
  const hb = p.hb;
  const hh = p.hh;
  const plankB = (H.sp ? 9 : 7) / SQ;
  const pa = (a + hb) / plankB;
  const i = Math.floor(pa);
  const fr = (pa - i) * plankB;
  if (fr < 1.414 && i > 0) return -2.2;
  let s = ((hash(i, 3, H.zaad) % 3) - 1) * 0.45;
  // hengsels op de klampen, van de scharnierkant tot ruim over het midden
  for (const vk of [0.52, -0.55]) {
    const dv = v - vk * hh;
    if (Math.abs(dv) < E(2.5) && a < hb * 0.45 - Math.abs(dv) * 1.5) return { ramp: 'ijzer', stap: 2.4 + (dv > 0.8 ? 1 : 0) };
    if (Math.abs(dv) < E(5)) s += dv > E(3.5) ? 0.8 : dv < -E(3.5) ? -1.4 : 0.4;
  }
  // de ring
  const dr = Math.hypot(a - hb * 0.62, v + hh * 0.02);
  if (Math.abs(dr - 3.2) < 0.9) return { ramp: 'ijzer', stap: 3 };
  const nerf = Math.sin(a * 1.9 + Math.sin(v * 0.1 + i) * 2.2 + i * 1.7);
  if (nerf > 0.85) s -= 0.7;
  return s;
}

// glas: donker, met een lichte streep van de lucht linksboven in elk vak
function glasPatroon(C) {
  const p = C.deel;
  if (!p.op) return 0;
  const [a, v] = p.op.lok(C.x, C.y, C.z);
  const ka = a / p.op.hb;
  const kv = v / p.op.hh;
  const la = ka < 0 ? ka + 0.5 : ka - 0.5; // midden van het vak
  const lv = kv < 0 ? kv + 0.5 : kv - 0.5;
  const streep = la * 1.2 + lv * -1.4;
  if (streep > -0.55 && streep < -0.35 && lv > 0) return 2;
  return 0;
}

// ---------------------------------------------------------------- het huis

function proefhuis(zaad = 1, o = {}) {
  const H = maten(zaad, o);
  const { sp, sch, r, rs } = H;
  const W = new Wereld();
  W.H = H;

  // --- materialen. Speelgoed: meer licht op het riet, diepere schaduw overal.
  const diepe = sp ? 0.12 : 0.35;
  const houtHi = (sp ? 6.6 : 5.8) - (H.hout === 'schors' ? 0.8 : 0); // schors heeft een tint minder
  W.mat = {
    // het riet in de zon komt op stap 4 à 5 uit, zodat er boven nog licht en onder nog schaduw past
    riet: { ramp: 'stro', lo: sp ? 0.2 : 1.2, hi: sp ? 4.9 : 5.3, schaduwKracht: sp ? 0.18 : 0.35, patroon: (C) => rietPatroon(H, C) },
    nok: { ramp: 'stro', lo: 0.2, hi: sp ? 4.3 : 4.8, schaduwKracht: diepe, patroon: (C) => nokPatroon(H, C) },
    steen: { ramp: 'veldsteen', lo: sp ? 0.8 : 1.6, hi: sp ? 7.8 : 7, schaduwKracht: diepe, patroon: metRand(H, (C) => steenPatroon(H, C, sp ? [13, 22, 16] : [9, 13, 9])) },
    schoorsteen: { ramp: 'veldsteen', lo: 1, hi: sp ? 7.6 : 7, schaduwKracht: diepe, patroon: (C) => steenPatroon(H, C, sp ? [9, 14, 8] : [7, 10, 6]) },
    drempel: { ramp: 'veldsteen', lo: 1.4, hi: 7, schaduwKracht: diepe },
    pleister: { ramp: 'pleister', lo: sp ? 0.7 : 1.5, hi: sp ? 6.2 : 5.8, schaduwKracht: diepe, patroon: metRand(H, (C) => pleisterPatroon(H, C)) },
    hout: { ramp: H.hout, lo: 0.5, hi: houtHi, schaduwKracht: diepe, patroon: metRand(H, (C) => houtTex(C, false)) },
    kozijn: { ramp: H.hout, lo: 0.8, hi: houtHi + 0.2, schaduwKracht: diepe, patroon: metRand(H, kozijnPatroon) },
    deur: { ramp: H.hout, lo: 0.3, hi: sp ? 4.6 : 4.2, schaduwKracht: diepe, patroon: metRand(H, (C) => deurPatroon(H, C)) },
    windveer: { ramp: H.hout, lo: 0.5, hi: houtHi, schaduwKracht: diepe, patroon: (C) => houtTex(C, false) },
    glas: { ramp: 'pet', lo: 0.4, hi: 2.4, schaduw: false, patroon: metRand(H, glasPatroon) },
    glasWarm: { ramp: 'goud', gloei: (C) => 2.6 + (hash(C.px >> 1, C.py >> 1, 5) % 3) * 0.35 },
    donker: { ramp: 'inkt', lo: 0, hi: 1, schaduw: false },
  };

  // --- het lichaam: muren en gevel, hellend, uitpuilend, met de openingen eruit
  const romp = W.groep('romp');
  const zTop = H.zN + 30;
  voeg(romp, {
    f: (x, y, z) => {
      const xs = x - H.hellX * z;
      const ys = y - H.hellY * z;
      const by = bolY(H, xs, z);
      const bx = bolX(H, ys, z);
      let d = sdf.doos(xs, ys, z - zTop / 2 + 1, H.HX + bx, H.HY + by, zTop / 2 + 1, 1.5);
      d = Math.max(d, onderDak(H, x, y, z));
      if (d > 12) return d;
      for (const op of H.openingen) {
        const [a, v, n] = op.lok(x, y, z);
        const gat = laag(rechthoek(a, v, op.hb, op.hh), n, -op.diep, 60);
        if (-gat > d) d = -gat;
      }
      return d;
    },
    grens: [0, 0, Math.hypot(H.HX, H.HY) + 12, -3, zTop + 5],
    m: (x, y, z) => {
      for (const op of H.openingen) {
        const [a, v, n] = op.lok(x, y, z);
        if (n < -op.diep + 1.2 && rechthoek(a, v, op.hb, op.hh) < 1) return op.binnen;
      }
      return z * PXH < steenLijn(H, x - H.hellX * z, y - H.hellY * z) ? 'steen' : 'pleister';
    },
    deel: 1,
  });
  // de drempel: een platte steen voor de deur, niet recht gelegd
  {
    const [dx, dy] = muurPunt(H, 'y', H.deur.u, 0);
    const hoek = sch * rs(80) * 5 * GRAAD;
    const c = Math.cos(hoek);
    const s = Math.sin(hoek);
    const hx = (H.deur.b / 2 + 6) / SQ;
    voeg(romp, {
      f: (x, y, z) => {
        const px = x - dx;
        const py = y - (dy + 7);
        return sdf.doos(px * c + py * s, -px * s + py * c, z - 1.2, hx, 9, 2.6, 1.2);
      },
      g: [dx, dy + 7, 1.2, hx + 12],
      m: 'drempel',
      deel: 9,
    });
  }

  // --- het riet
  const riet = W.groep('riet');
  voeg(riet, {
    f: dakVeld(H),
    grens: [0, 0, Math.hypot(H.XR + 4, H.qE + H.dik * 2 + 8), H.voetZ - H.dik * 2 - 12, H.zN + H.dik + 14],
    m: 'riet',
    deel: 2,
  });
  // de nok: een worst die met de nok meezakt
  if (H.worstR) {
    const nok = W.groep('nok');
    const xEind = H.XR - 17;
    const wF = r(81) * 6.3;
    voeg(nok, {
      f: (x, y, z) => {
        const xc = klem(x, -xEind, xEind);
        const zc = H.nokZ(xc) + H.dik * 0.75;
        const rr = H.worstR * (1 + 0.04 * sch * Math.sin(x * 0.07 + wF));
        return Math.hypot(x - xc, y, z - zc) - rr;
      },
      grens: [0, 0, H.XR + 4, H.zN - H.worstR - 20, H.zN + H.dik + H.worstR + 6],
      m: 'nok',
      deel: 3,
    });
  }

  // --- de schoorsteen
  {
    const S = H.schoorsteen;
    const P = dakPlek(H, S.x, S.y, 0);
    const zDak = P.z0 + (P.uz / P.ux) * S.y;
    const z0 = zDak - H.dik * 1.5;
    const z1 = H.nokZ(S.x) + H.dik + S.hoog;
    const hz = (z1 - z0) / 2;
    const sch_ = W.groep('schoorsteen');
    const lok = (x, y, z) => {
      const t = z - z0;
      return [x - (S.x + S.lx * t), y - (S.y + S.ly * t)];
    };
    voeg(sch_, {
      f: (x, y, z) => {
        const [xs, ys] = lok(x, y, z);
        let d = sdf.doos(xs, ys, z - (z0 + hz), S.s, S.s, hz, 1.2);
        d = Math.min(d, sdf.doos(xs, ys, z - (z1 + 2.6), S.s + 2.6, S.s + 2.6, 2.6, 0.8));
        return Math.max(d, -sdf.doos(xs, ys, z - (z1 + 7), S.s - 3.4, S.s - 3.4, 5, 0.5));
      },
      g: [S.x + S.lx * hz, S.y + S.ly * hz, z0 + hz + 3, Math.hypot(S.s + 4, S.s + 4, hz + 6) + Math.abs(S.lx * hz) + Math.abs(S.ly * hz) + 2],
      m: (x, y, z) => {
        const [xs, ys] = lok(x, y, z);
        return z > z1 + 3 && Math.max(Math.abs(xs), Math.abs(ys)) < S.s - 2.8 ? 'donker' : 'schoorsteen';
      },
      deel: 4,
    });
  }

  // --- het vakwerk: liggers en stijlen apart, zodat ze elkaar een lijn geven
  const liggers = W.groep('liggers');
  const stijlen = W.groep('stijlen');
  let kb = 200;
  const dik = (basis) => basis * (sch ? 0.78 + 0.5 * r(kb++) : 1);
  const wiebel = (m = 2.2) => (sch ? rs(kb++) * m : 0);
  // een balk op de muur van (u0, h0) naar (u1, h1), breed in px, uit eenheden voor de muur
  const wandBalk = (groep, wand, u0, h0, u1, h1, breed, uit, deel) => {
    const nc = (uit - 2.5) / 2;
    const a = muurPunt(H, wand, u0, h0, nc);
    const b = muurPunt(H, wand, u1, h1, nc);
    const du = Math.abs(u1 - u0);
    const dh = Math.abs(h1 - h0);
    const l = Math.hypot(du, dh) || 1;
    const hb = (breed / 2) * (du / l / PXH + dh / l / SQ);
    const p = balk(a, b, hb, (uit + 2.5) / 2, wand === 'y' ? [0, 1, 0] : [1, 0, 0], sp ? 1.6 : 0.8);
    p.m = 'hout';
    p.deel = deel;
    p.zaad = kb * 3.1;
    p.toon = sch ? rs(kb++) * 0.6 : 0;
    return voeg(groep, p);
  };
  // een hoekstijl die op twee muren tegelijk staat
  const hoekStijl = (x, y, h0, h1, breed, deel) => {
    const half = breed / 2 / SQ;
    const uit = 3;
    const z0 = h0 / PXH;
    const z1 = h1 / PXH;
    const sx = Math.sign(x);
    const sy = Math.sign(y);
    const c = (z) => [x + H.hellX * z - sx * (half - uit), y + H.hellY * z - sy * (half - uit), z];
    const p = balk(c(z0), c(z1), half, half, [1, 0, 0], sp ? 1.6 : 0.8);
    p.m = 'hout';
    p.deel = deel;
    p.zaad = kb * 3.1;
    p.toon = sch ? rs(kb++) * 0.6 : 0;
    kb++;
    return voeg(stijlen, p);
  };
  const balkH = sp ? 12 : 7;
  const stijlB = sp ? 13 : 7;
  const schoorB = sp ? 10 : 6;
  const top = H.muurH;
  const sl = (wand, u) => steenLijnU(H, wand, u);
  let deel = 10;

  // de lange muur
  const Wy = H.Wy;
  const dL = H.deur.u - H.deur.b / 2;
  const dR = H.deur.u + H.deur.b / 2;
  const jamb = sp ? 12 : 7;
  const latei = H.deur.h + (sp ? 7 : 4);
  // de onderregel op de steen, links en rechts van de deur
  wandBalk(liggers, 'y', -2, sl('y', 0) + balkH / 2, dL - jamb, sl('y', dL - jamb) + balkH / 2, dik(balkH), 5, deel++);
  wandBalk(liggers, 'y', dR + jamb, sl('y', dR + jamb) + balkH / 2, Wy + 2, sl('y', Wy) + balkH / 2, dik(balkH), 5, deel++);
  // het deurkozijn, van de grond tot de latei, en de latei die er ruim overheen steekt
  const jH = latei + wiebel(1.5);
  wandBalk(stijlen, 'y', dL - jamb / 2 + wiebel(1), 0, dL - jamb / 2 + wiebel(1.5), jH, dik(jamb), 4, deel++);
  wandBalk(stijlen, 'y', dR + jamb / 2 + wiebel(1), 0, dR + jamb / 2 + wiebel(1.5), jH, dik(jamb), 4, deel++);
  wandBalk(liggers, 'y', dL - jamb - 8, latei + balkH / 2 + wiebel(2), dR + jamb + 8, latei + balkH / 2 + wiebel(2), dik(balkH + 2), 5.5, deel++);
  // hoekstijlen en de bovenregel
  hoekStijl(H.HX, H.HY, sl('y', Wy) + balkH - 2, top, dik(stijlB + 2), deel++);
  wandBalk(stijlen, 'y', stijlB / 2 + 1, sl('y', 0) + balkH - 2, stijlB / 2 + 1 + wiebel(), top, dik(stijlB), 3.5, deel++);
  const plaatH = 130; // de bovenregel, net onder de rand van het riet
  wandBalk(liggers, 'y', -2, plaatH + wiebel(3), Wy + 2, plaatH + wiebel(3), dik(balkH), 4.5, deel++);
  // stijlen naast de ramen, en schoren in de vakken zonder raam
  for (const w of H.ramen.filter((w) => w.wand === 'y')) {
    const links = w.u - w.b / 2 - (sp ? 10 : 7);
    const rechts = w.u + w.b / 2 + (sp ? 10 : 7);
    for (const u of [links, rechts]) {
      if (u < 20 || u > Wy - 20 || (u > dL - jamb - 12 && u < dR + jamb + 12)) continue;
      wandBalk(stijlen, 'y', u, sl('y', u) + balkH - 2, u + wiebel(), top - 30, dik(stijlB - 2), 3.5, deel++);
    }
  }
  // een schoor links, van de onderregel naar de hoekstijl
  {
    const u0 = 30 + wiebel(4);
    wandBalk(stijlen, 'y', u0, sl('y', u0) + balkH - 1, 10, plaatH - 6 + wiebel(4), dik(schoorB), 3, deel++);
  }

  // de gevel
  const Wx = H.Wx;
  wandBalk(liggers, 'x', -2, sl('x', 0) + balkH / 2, Wx + 2, sl('x', Wx) + balkH / 2, dik(balkH), 5, deel++);
  const trekH = 150 + wiebel(3);
  const trekH2 = 150 + wiebel(3);
  wandBalk(liggers, 'x', -2, trekH, Wx + 2, trekH2, dik(balkH + 2), 5.5, deel++);
  hoekStijl(H.HX, -H.HY, sl('x', Wx) + balkH - 2, trekH2 + 4, dik(stijlB + 2), deel++);
  // stijlen onder de trekbalk, weerszijden van het benedenraam
  const wb = H.ramen.find((w) => w.wand === 'x' && w.h0 < 120);
  const wt = H.ramen.find((w) => w.wand === 'x' && w.h0 >= 120);
  for (const u of [wb.u - wb.b / 2 - (sp ? 10 : 7), wb.u + wb.b / 2 + (sp ? 10 : 7)]) {
    wandBalk(stijlen, 'x', u + wiebel(1), sl('x', u) + balkH - 2, u + wiebel(), trekH, dik(stijlB - 1), 3.5, deel++);
  }
  // schoren in de buitenste vakken
  wandBalk(stijlen, 'x', 12, trekH - 8, 34 + wiebel(3), sl('x', 34) + balkH, dik(schoorB), 3, deel++);
  wandBalk(stijlen, 'x', Wx - 12, trekH2 - 8, Wx - 34 + wiebel(3), sl('x', Wx - 34) + balkH, dik(schoorB), 3, deel++);
  // de top: stijlen langs het bovenraam tot onder het riet, en een hanenbalk erboven
  const nokHpx = (u) => {
    const [x, y] = muurPunt(H, 'x', u, 0);
    const P = dakPlek(H, x, y, 0);
    return (P.z0 + (P.uz / P.ux) * P.q) * PXH;
  };
  for (const u of [wt.u - wt.b / 2 - (sp ? 9 : 6), wt.u + wt.b / 2 + (sp ? 9 : 6)]) {
    wandBalk(stijlen, 'x', u, trekH + 4, u + wiebel(2), nokHpx(u) - 10, dik(stijlB - 2), 3.5, deel++);
  }
  wandBalk(liggers, 'x', wt.u - 52, wt.h0 + wt.h + (sp ? 12 : 8) + wiebel(2), wt.u + 52, wt.h0 + wt.h + (sp ? 12 : 8) + wiebel(2), dik(balkH - 2), 4.5, deel++);
  // een schoor tegen de gevel: iemand heeft de muur overeind gehouden
  if (H.schoor) {
    const [bx, by, bz] = muurPunt(H, 'x', H.schoor.u, H.schoor.h, 1);
    const voet = [bx + H.schoor.uit, by + 6, -2];
    const p = T.hulp.stok(voet, [bx, by, bz], sp ? 5.5 : 3.5);
    p.m = 'hout';
    p.deel = deel++;
    voeg(stijlen, p);
  }

  // --- de windveren: dikke gebogen planken over de kopse kant van het riet, met een knop in de top
  {
    const wv = W.groep('windveer');
    const x = H.XR + 1.5;
    for (const kant of [1, -1]) {
      const pts = [];
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const t = -0.07 + (1.13 * i) / n;
        const tt = klem(t, 0, 1);
        const xx = x + (sch ? Math.sin(t * 5 + kant) * 1.2 : 0);
        const P = dakPlek(H, xx, H.voetQ(xx) * t, 0);
        const z0 = H.nokZ(xx);
        const q = H.voetQ(xx) * t;
        const zl = z0 + (H.voetZ_(xx) - z0) * t;
        // op het riet: net onder de bovenkant van het pak
        const uit = H.dik * (1 + H.voetDik * tt * tt) - 3 + H.bol * 4 * tt * (1 - tt);
        pts.push([xx, kant * (q + -P.uz * uit), zl + P.ux * uit]);
      }
      const r0 = sp ? 6 : 3.5;
      for (let i = 0; i < n; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const ra = r0 * (1 + 0.25 * (i / n));
        const rb = r0 * (1 + 0.25 * ((i + 1) / n));
        const p = {
          f: (px, py, pz) => sdf.rondeKegel(px, py, pz, a[0], a[1], a[2], b[0], b[1], b[2], ra, rb),
          g: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2 + rb + 1],
          m: 'windveer',
          deel: 60 + (kant > 0 ? 0 : 1),
          k: i ? 1.2 : undefined,
        };
        // voor de nerf: langs de veer
        const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
        p.lok = (px, py, pz) => {
          const dx = px - (a[0] + b[0]) / 2;
          const dy = py - (a[1] + b[1]) / 2;
          const dz = pz - (a[2] + b[2]) / 2;
          const l = dx * u[0] + dy * u[1] + dz * u[2];
          return [l, dx - l * u[0] + (dz - l * u[2]), 0];
        };
        p.L = L;
        p.zaad = i + kant * 5;
        p.toon = 0;
        voeg(wv, p);
      }
    }
    const zk = H.nokZ(x) + H.dik + (H.worstR ? H.worstR * 0.9 : 3);
    voeg(wv, { f: (px, py, pz) => sdf.bol(px - x, py, pz - zk, sp ? 7 : 4.5), g: [x, 0, zk, (sp ? 7 : 4.5) + 1], m: 'windveer', deel: 62 });
  }

  // --- ramen: kozijn met een kruis en een vensterbank, en het glas achterin het gat
  const ramen = W.groep('ramen');
  for (const w of H.ramen) {
    const op = w.op;
    const rw = (sp ? 5 : 3) / SQ; // kozijn, breed
    const rk = (sp ? 3 : 2) / SQ; // kruis
    const bankH = E(sp ? 5 : 3);
    const [cx, cy, cz] = muurPunt(H, w.wand, w.u, w.h0 + w.h / 2);
    const p = {
      f: (x, y, z) => {
        const [a, v, n] = op.lok(x, y, z);
        const buiten = rechthoek(a, v, op.hb + rw, op.hh + rw * 0.8);
        const binnen = rechthoek(a, v, op.hb, op.hh);
        let d = laag(Math.max(buiten, -binnen), n, -2.5, sp ? 3.2 : 2);
        // het kruis, iets terug in het gat
        const kruis = Math.min(rechthoek(a, v, rk, op.hh + 0.5), rechthoek(a, v - op.hh * 0.18, op.hb + 0.5, rk * 0.85));
        d = Math.min(d, laag(kruis, n, -op.diep + 0.5, -op.diep + 3.5));
        // de vensterbank
        const bank = rechthoek(a, v + op.hh + rw * 0.8 + bankH / 2, op.hb + rw + 3, bankH / 2 + 0.5);
        return Math.min(d, laag(bank, n, -2, sp ? 7 : 4.5));
      },
      g: [cx, cy, cz, Math.hypot(op.hb + rw + 5, op.hh + rw + bankH + 3) + 8],
      m: 'kozijn',
      deel: 40 + H.ramen.indexOf(w),
    };
    p.raam = w;
    voeg(ramen, p);
  }
  // Het glas hoort bij de romp (de achterkant van het gat); glasPatroon wil weten welk raam.
  // Daarom krijgt elk glas een eigen dun deel, net voor die achterkant.
  const glas = W.groep('glas');
  for (const w of H.ramen) {
    const op = w.op;
    const [cx, cy, cz] = muurPunt(H, w.wand, w.u, w.h0 + w.h / 2);
    voeg(glas, {
      f: (x, y, z) => {
        const [a, v, n] = op.lok(x, y, z);
        return laag(rechthoek(a, v, op.hb + 0.6, op.hh + 0.6), n, -op.diep, -op.diep + 0.8);
      },
      g: [cx, cy, cz, Math.hypot(op.hb, op.hh) + op.diep + 4],
      m: w.warm ? 'glasWarm' : 'glas',
      deel: 50 + H.ramen.indexOf(w),
      op,
    });
    if (w.warm) {
      const [lx, ly, lz] = muurPunt(H, w.wand, w.u, w.h0 + w.h / 2, 6);
      W.lichten.push({ pos: [lx, ly, lz], r: 28, sterk: 0.9, warm: 1, val: 1.6, zacht: 0.5 });
    }
  }

  // --- de deur, die er net niet recht in hangt
  {
    const op = H.openingen[0];
    const dg = W.groep('deur');
    const hoek = H.deur.blad;
    const co = Math.cos(hoek);
    const si = Math.sin(hoek);
    const hb = op.hb - 1.8;
    const hh = op.hh - 1.2;
    const lok = (x, y, z) => {
      const [a, v, n] = op.lok(x, y, z);
      const vv = v + 0.8;
      return [a * co + vv * si, -a * si + vv * co, n + op.diep - 1.5];
    };
    const [cx, cy, cz] = muurPunt(H, 'y', H.deur.u, H.deur.h / 2);
    voeg(dg, {
      f: (x, y, z) => {
        const [a, v, n] = lok(x, y, z);
        return laag(rechthoek(a, v, hb, hh), n, -1.5, 1.2);
      },
      g: [cx, cy, cz, Math.hypot(hb, hh) + 10],
      m: 'deur',
      deel: 30,
      lok,
      hb,
      hh,
    });
  }
  return W;
}

module.exports = { proefhuis, maten, dakPlek };
