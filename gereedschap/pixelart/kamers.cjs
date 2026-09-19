// De kamers van Aardschok in HD-pixel art: tegels van 64×32 en muren van 128 pixels hoog, in
// dezelfde isometrie als het spel. Muren en vloeren zijn dozen met een textuur per pixel; alles wat
// ervoor staat is een 3D-model. Daarna licht: lampen, een kaars, de bol op de staf, en de zon die
// door het glas-in-lood valt.
'use strict';
const K = require('./kern.cjs');
const { TEGEL, PXH, RAMP, UIT, VLAG, hash, rnd, ruis2, klem } = K;
const F = { ...require('./figuren.cjs'), ...require('./figuren2.cjs') };
const V = require('./voorwerpen.cjs');

const MUUR_H = 128;
const LAAG_H = 22;
const VLOER_D = 14;

// ---------------------------------------------------------------- stenen

const voegCache = new Map();
function voegen(zaad, rij) {
  const sleutel = zaad * 4096 + rij;
  let v = voegCache.get(sleutel);
  if (!v) {
    v = [];
    let u = -700 - (hash(zaad, rij, 1) % 26);
    while (u < 1200) {
      v.push(u);
      u += 19 + (hash(zaad, rij, u + 777) % 12);
    }
    voegCache.set(sleutel, v);
  }
  return v;
}

// Stap van een steen in de muur op plek (U langs de muur, H hoogte), beide in hele pixels.
// Stenen van 12 hoog en 19 tot 30 lang, met voegen, een lichte bovenrand, afgebrokkelde hoeken
// en putjes. Onderaan wat mos.
function steenPixel(U, H, zaad, basis, lichtKant) {
  const rij = Math.floor(H / 12);
  const dH = H - rij * 12;
  const v = voegen(zaad, rij);
  let lo = 0;
  let hi = v.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (v[m] <= U) lo = m;
    else hi = m;
  }
  const u0 = v[lo];
  const len = v[lo + 1] - u0;
  const du = U - u0;
  UIT.ramp = RAMP.steen;
  if (dH === 0 || du === 0) {
    UIT.stap = basis - 2.4;
    return;
  }
  const h = hash(zaad * 7 + rij, u0 & 0xffff, 13);
  let s = basis + (h % 100 < 15 ? -0.9 : h % 100 < 21 ? 0.8 : 0) + (h % 100 < 3 ? -1 : 0);
  if (dH === 11) s += 1;
  else if (dH === 1) s -= 0.8;
  if (lichtKant ? du === 1 : false) s += 0.6;
  if (du === len - 1) s -= 0.8;
  if (dH >= 10 && du <= 2 && (h >> 9) % 4 === 0) {
    UIT.stap = basis - 2;
    return;
  }
  const p = hash(U * 3 + zaad, H * 5, 77);
  if (p % 23 === 0) s -= 1;
  else if (p % 41 === 3) s += 0.8;
  // vocht en mos onderaan
  if (H < 14) {
    s -= 0.4;
    if (ruis2(U * 0.18, H * 0.3, zaad) > 0.72 && dH > 1) {
      UIT.ramp = RAMP.mos;
      s = 2 + (p % 3) * 0.5;
    }
  }
  UIT.stap = s;
}

// ---------------------------------------------------------------- muurversiering (u, H in pixels)

// Een boogvorm: u0..u1 breed, recht tot de boog begint op hoogte m, met straal (u1-u0)/2.
function inBoog(u, H, u0, u1, m, onder = 0, e = 0) {
  if (u < u0 - e || u >= u1 + e || H < onder) return false;
  const du = u + 0.5 - (u0 + u1) / 2;
  const dh = H + 0.5 - m;
  if (dh <= 0) return true;
  const r = (u1 - u0) / 2 + e;
  return du * du + dh * dh <= r * r;
}

// een omlijsting van gebogen stenen om een boog
function boogRand(u, H, u0, u1, m, dikte, basis) {
  const du = u + 0.5 - (u0 + u1) / 2;
  const dh = H + 0.5 - m;
  UIT.ramp = RAMP.steen;
  let s = basis + 1.3;
  if (dh > 0) {
    const a = (Math.atan2(dh, du) * 180) / Math.PI;
    if (Math.abs(a - 90) < 3.5 || Math.abs(a - 55) < 2.5 || Math.abs(a - 125) < 2.5 || Math.abs(a - 20) < 3 || Math.abs(a - 160) < 3) s = basis - 1.2;
    const r = Math.hypot(du, dh);
    if (r > (u1 - u0) / 2 + dikte - 1) s += 0.7;
  } else if ((H + 1) % 13 === 0) s = basis - 1.2;
  UIT.stap = s;
}

function deurDeco(opSlot) {
  const u0 = 5;
  const u1 = 27;
  const m = 85;
  return (u, H, basis) => {
    if (inBoog(u, H, u0, u1, m)) {
      const du = u + 0.5 - (u0 + u1) / 2;
      const dh = H + 0.5 - m;
      // de dagkant links, en schaduw onder de boog
      if (u < u0 + 3) {
        UIT.ramp = RAMP.steen;
        UIT.stap = basis - 1.8 + (u - u0) * 0.2;
        return true;
      }
      if (dh > 0 && Math.hypot(du, dh) > (u1 - u0) / 2 - 2) {
        UIT.ramp = RAMP.steen;
        UIT.stap = basis - 2.6;
        return true;
      }
      const lu = u - (u0 + 3);
      const plank = Math.floor(lu / 4.75);
      const inPlank = lu - plank * 4.75;
      UIT.ramp = RAMP.hout;
      let s = 3.1 + (plank % 2 ? -0.4 : 0.2);
      if (inPlank < 1) s = 1.2;
      else if (inPlank < 2) s += 0.8;
      if (hash(u, Math.floor(H / 4), 5) % 6 === 0) s -= 0.7;
      if (H > 76) s -= 0.6;
      // ijzeren banden met klinknagels
      for (const b of [16, 68]) {
        if (H >= b && H < b + 4) {
          UIT.ramp = RAMP.ijzer;
          s = H === b + 3 ? 4.6 : H === b ? 1.8 : 3.2;
          if (lu % 5 === 2 && (H === b + 1 || H === b + 2)) s = 5.6;
        }
      }
      // ringklink
      const rh = Math.hypot(u + 0.5 - (u1 - 5.5), H + 0.5 - 41);
      if (rh > 2.1 && rh < 3.3 && H < 42) {
        UIT.ramp = RAMP.ijzer;
        s = H > 39 ? 5 : 3.6;
      }
      if (u >= u1 - 7 && u < u1 - 4 && H >= 42 && H < 45) {
        UIT.ramp = RAMP.ijzer;
        s = 2.4;
      }
      // slot met sleutelgat
      if (opSlot && u >= u1 - 8 && u < u1 - 3 && H >= 48 && H < 57) {
        UIT.ramp = RAMP.goud;
        s = u === u1 - 8 || H === 56 ? 5.2 : 3.6;
        if (u === u1 - 6 && H >= 50 && H < 54) {
          UIT.ramp = RAMP.inkt;
          s = 0;
        }
      }
      if (H < 2) {
        UIT.ramp = RAMP.steen;
        s = basis + 1.2;
      }
      UIT.stap = s;
      return true;
    }
    if (inBoog(u, H, u0, u1, m, 0, 3)) {
      boogRand(u, H, u0, u1, m, 3, basis);
      return true;
    }
    return false;
  };
}

// Een doorgang naar het donker (de volgende kamer).
function doorgangDeco(dagkantRechts) {
  const u0 = 6;
  const u1 = 26;
  const m = 84;
  return (u, H, basis) => {
    if (inBoog(u, H, u0, u1, m)) {
      const dag = dagkantRechts ? u >= u1 - 3 : u < u0 + 3;
      UIT.ramp = dag ? RAMP.steen : RAMP.inkt;
      UIT.stap = dag ? basis - 1.4 : H < 5 ? 2 : H < 12 && (u + H) % 2 === 0 ? 1 : 0;
      UIT.vlag = dag ? 0 : VLAG.VAST;
      return true;
    }
    if (inBoog(u, H, u0, u1, m, 0, 3)) {
      boogRand(u, H, u0, u1, m, 3, basis);
      return true;
    }
    return false;
  };
}

// Het raam: glas-in-lood in avondlicht, met een middenstijl, een kalf en een vensterbank.
const RAAM = { u0: 6, u1: 26, onder: 40, m: 96 };
function inRaamOpening(u, H) {
  const { u0, u1, onder, m } = RAAM;
  if (!inBoog(u, H, u0 + 1, u1 - 1, m, onder + 1)) return 0;
  if (u >= 15 && u < 17) return 0;
  if (H >= 70 && H < 72) return 0;
  return 1;
}
function inRaamGlas(u, H) {
  const { u0, u1, onder, m } = RAAM;
  if (!inBoog(u, H, u0 + 1, u1 - 1, m, onder + 1)) return 0;
  if (u >= 15 && u < 17) return 0;
  if (H >= 70 && H < 72) return 0;
  const a = (u + H) % 6;
  const b = (((u - H) % 6) + 6) % 6;
  if (a === 0 || b === 0) return 0;
  return 1;
}
function raamDeco() {
  const { u0, u1, onder, m } = RAAM;
  return (u, H, basis) => {
    if (H >= onder - 4 && H < onder && u >= u0 - 3 && u < u1 + 3) {
      UIT.ramp = RAMP.steen;
      UIT.stap = H === onder - 1 ? basis + 2.6 : H === onder - 4 ? basis - 1.6 : basis + 0.6;
      return true;
    }
    if (inBoog(u, H, u0, u1, m, onder)) {
      if (u >= u1 - 2) {
        UIT.ramp = RAMP.steen;
        UIT.stap = basis - 1;
        return true;
      }
      if (inRaamGlas(u, H)) {
        UIT.ramp = RAMP.vuur;
        const ruit = hash(Math.floor((u + H) / 6), Math.floor((u - H + 60) / 6), 4) % 3;
        UIT.stap = (H > 88 ? 6.4 : H > 68 ? 5.6 : 4.8) + (ruit === 0 ? -0.6 : ruit === 1 ? 0.4 : 0);
        if (H < 56) {
          UIT.ramp = RAMP.goud;
          UIT.stap -= 0.4;
        }
        UIT.vlag = VLAG.GLOEI | VLAG.GLAD;
        return true;
      }
      const lood = (u >= 15 && u < 17) || (H >= 70 && H < 72);
      UIT.ramp = lood ? RAMP.steen : RAMP.ijzer;
      UIT.stap = lood ? basis + 1 : 1.2;
      UIT.vlag = VLAG.VAST;
      return true;
    }
    if (inBoog(u, H, u0, u1, m, onder, 2)) {
      boogRand(u, H, u0, u1, m, 2, basis);
      return true;
    }
    return false;
  };
}

// Wandkleed met het torenembleem, een roede erboven en franje onderaan.
function wandkleedDeco() {
  const toren = (u, H) => {
    const cu = u - 16;
    if (H >= 58 && H < 80 && cu >= -3 && cu < 3) {
      if (H >= 60 && H < 66 && cu >= -1 && cu < 1) return 'deur';
      if (H >= 70 && H < 74 && cu === 0) return 'raam';
      return 'goud';
    }
    if (H >= 80 && H < 83 && cu >= -4 && cu < 4) return 'goud';
    if (H >= 83 && H < 86 && cu >= -4 && cu < 4 && (cu + 4) % 3 !== 1) return 'goud';
    const sd = Math.abs(cu + 0.5) + Math.abs(H - 92.5);
    if (sd < 2.6 && (cu === 0 || cu === -1 || H === 92 || H === 93)) return 'ster';
    return null;
  };
  return (u, H, basis) => {
    if (H >= 104 && H < 107 && u >= 2 && u < 30) {
      UIT.ramp = u < 4 || u >= 28 ? RAMP.goud : RAMP.hout;
      UIT.stap = H === 106 ? 5 : H === 104 ? 1.6 : 3.4;
      return true;
    }
    const onderRand = 34 + Math.abs(u + 0.5 - 16) * 0.55;
    if (u >= 4 && u < 28 && H < 104 && H >= onderRand) {
      let s = 3.5 + Math.sin(u * 0.95 + 0.6) * 0.9;
      UIT.ramp = RAMP.rood;
      const rand = u < 6 || u >= 26 || H >= 100 || H < onderRand + 2;
      if (rand) {
        UIT.ramp = RAMP.goud;
        s = 3.6 + Math.sin(u * 0.95 + 0.6) * 0.8;
      } else if (u === 7 || u === 24 || H === 98 || H < onderRand + 4) {
        s -= 1.3;
      }
      const t = toren(u, H);
      if (t === 'goud' || t === 'ster') {
        UIT.ramp = RAMP.goud;
        s = (t === 'ster' ? 5.6 : 4.4) + Math.sin(u * 0.95 + 0.6) * 0.6;
      } else if (t === 'deur' || t === 'raam') {
        UIT.ramp = RAMP.rood;
        s = 1.2;
      }
      if (H > 100 - 3 && !rand) s -= 0.5;
      UIT.stap = s;
      return true;
    }
    if (u >= 5 && u < 27 && H < onderRand && H >= onderRand - 3 && (u + H) % 2 === 0) {
      UIT.ramp = RAMP.goud;
      UIT.stap = 4.2;
      return true;
    }
    // schaduw van het kleed op de muur, rechts ervan
    if (u >= 28 && u < 30 && H >= 38 && H < 104) return -1.2;
    return false;
  };
}

// een scheur: grillige donkere lijn met een lichte rand rechts ervan
function scheurDeco(punten, zaad = 1) {
  const donker = new Set();
  const lijn = (a, b) => {
    const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    for (let s = 0; s <= n; s++) {
      const u = Math.round(a[0] + ((b[0] - a[0]) * s) / n);
      const h = Math.round(a[1] + ((b[1] - a[1]) * s) / n);
      donker.add(`${u},${h}`);
    }
  };
  for (let i = 0; i + 1 < punten.length; i++) lijn(punten[i], punten[i + 1]);
  // een zijtakje
  if (punten.length > 3) {
    const p = punten[2];
    lijn(p, [p[0] + 5 + (zaad % 3), p[1] - 7]);
  }
  return (u, H, basis) => {
    if (donker.has(`${u},${H}`)) {
      UIT.ramp = RAMP.steen;
      UIT.stap = 0.2;
      return true;
    }
    if (donker.has(`${u - 1},${H}`)) {
      UIT.ramp = RAMP.steen;
      UIT.stap = basis + 1.6;
      return true;
    }
    return false;
  };
}

const samen = (...decos) => (u, H, basis, U) => {
  let donker = 0;
  for (const f of decos) {
    const r = f && f(u, H, basis, U);
    if (r === true) return true;
    if (typeof r === 'number') donker += r;
  }
  return donker || false;
};

// ---------------------------------------------------------------- muren en vloer als dozen

// Textuur voor muren. deco.y[tx] versiert de noordmuur (linkerwand), deco.x[ty] de westmuur.
function muurTex(o = {}) {
  return (vlak, X, Y, Z, px, py, doos) => {
    const H = Z * PXH;
    if (vlak === 'z') {
      muurTop(X, Y, doos);
      return;
    }
    let U;
    let u;
    let t;
    if (vlak === 'y') {
      const g = X / TEGEL;
      t = Math.round(g);
      U = X * Math.SQRT1_2;
      u = (g - (t - 0.5)) * 32;
    } else {
      const g = Y / TEGEL;
      t = Math.round(g);
      U = -Y * Math.SQRT1_2;
      u = (t + 0.5 - g) * 32;
    }
    const Ui = Math.floor(U + 1e-3);
    const Hi = Math.floor(H + 1e-3);
    const ui = Math.floor(u + 1e-3);
    const basis = (vlak === 'y' ? 4.3 : 3.3) + (o.buiten ? -0.4 : 0);
    UIT.vlag = 0;
    const deco = o.deco && o.deco[vlak] && o.deco[vlak][t];
    const r = deco ? deco(ui, Hi, basis, Ui) : false;
    if (r === true) return;
    steenPixel(Ui, Hi, (o.zaad || 1) + (vlak === 'y' ? 0 : 50), basis, vlak === 'y');
    if (typeof r === 'number') UIT.stap += r;
    // donkerder aan de voet van de muur en boven in de hoek
    if (Hi < 3 && !o.buiten) UIT.stap -= 0.8;
  };
}

// De bovenkant van een muur: afdekstenen met een lichte voorkant.
function muurTop(X, Y, doos) {
  const gx = X / TEGEL;
  const gy = Y / TEGEL;
  const lang = doos.x1 - doos.x0 > doos.y1 - doos.y0;
  const langs = lang ? gx : gy;
  const dwars0 = lang ? (Y - doos.y0) / TEGEL : (X - doos.x0) / TEGEL;
  const dwars1 = lang ? (doos.y1 - Y) / TEGEL : (doos.x1 - X) / TEGEL;
  const f = langs + 0.5 - Math.floor(langs + 0.5);
  UIT.ramp = RAMP.steen;
  let s = 5.6 + (hash(Math.floor(langs + 0.5), 3, 8) % 3 === 0 ? -0.5 : 0);
  if (dwars1 < 1 / 32) s = 7.2;
  else if (dwars0 < 1 / 32) s = 3.6;
  else if (f < 1 / 64 || f > 1 - 1 / 64) s = 3.4;
  else if (hash(Math.floor(gx * 64), Math.floor(gy * 64), 6) % 17 === 0) s -= 0.8;
  UIT.stap = s;
  UIT.vlag = 0;
}

// Zandstenen vloerplaten, één per tegel, met voeg, lichte bovenrand en slijtplekken.
function zandVloer(extra) {
  return (vlak, X, Y, Z, px, py) => {
    if (vlak !== 'z') {
      const H = Math.floor(Z * PXH + VLOER_D + 1e-3);
      const U = vlak === 'y' ? X * Math.SQRT1_2 : -Y * Math.SQRT1_2;
      steenPixel(Math.floor(U), H, 9, vlak === 'y' ? 2.8 : 2, false);
      UIT.stap -= 0.4;
      return;
    }
    const gx = X / TEGEL;
    const gy = Y / TEGEL;
    const i = Math.round(gx);
    const j = Math.round(gy);
    const a = gx - i;
    const b = gy - j;
    const h = hash(i + 50, j + 50, 3);
    let s = 3.8 + (h % 100 < 22 ? -0.7 : h % 100 < 34 ? 0.6 : 0);
    const r = 1 / 32;
    if (a < -0.5 + r || b < -0.5 + r) s = 1.3;
    else if (a < -0.5 + 2 * r || b < -0.5 + 2 * r) s += 1;
    else if (a > 0.5 - r || b > 0.5 - r) s -= 0.9;
    else {
      const p = hash(Math.floor(gx * 64), Math.floor(gy * 32), 9);
      if (p % 29 === 0) s -= 1;
      else if (p % 53 === 5) s += 0.8;
      if (ruis2(gx * 2.6 + 10, gy * 2.6, 4) > 0.78) s -= 1;
      // een barstje in sommige platen
      if (h % 7 === 0 && Math.abs(b - (a * 0.6 + 0.1) + Math.sin(a * 17) * 0.03) < 1 / 40 && a > -0.3 && a < 0.35) s = 1.4;
    }
    UIT.ramp = RAMP.zand;
    UIT.stap = s;
    UIT.vlag = 0;
    if (extra) extra(gx, gy, px, py, a, b);
  };
}

// Houten vloerplanken in de lengte van x, vier per tegel, met naden, nerf en spijkers.
function houtVloer(extra) {
  return (vlak, X, Y, Z, px, py) => {
    if (vlak !== 'z') {
      const H = Math.floor(Z * PXH + VLOER_D + 1e-3);
      const U = vlak === 'y' ? X * Math.SQRT1_2 : -Y * Math.SQRT1_2;
      steenPixel(Math.floor(U), H, 9, vlak === 'y' ? 2.8 : 2, false);
      UIT.stap -= 0.4;
      return;
    }
    const gx = X / TEGEL;
    const gy = Y / TEGEL;
    const pv = (gy + 0.5) * 4;
    const p = Math.floor(pv);
    const f = pv - p;
    const lengte = 1.5 + (hash(p, 7, 1) % 6) * 0.3;
    const lx = gx + 0.5 + ((hash(p, 9, 2) % 100) / 100) * lengte;
    const stuk = Math.floor(lx / lengte);
    const fx = lx - stuk * lengte;
    const h = hash(p + 30, stuk + 30, 3);
    let s = 3.3 + ((h % 3) - 1) * 0.45;
    if (f < 1 / 8) s = 1;
    else if (f < 2 / 8) s += 0.7;
    else if (f > 7 / 8) s -= 0.6;
    else {
      const nerf = Math.sin(pv * 26 + ruis2(gx * 2, pv * 3, p) * 7);
      if (nerf > 0.86) s -= 0.8;
      else if (nerf < -0.93) s += 0.5;
      if (h % 11 === 0) {
        const kx = (h % 97) / 97;
        if (Math.hypot((fx / lengte - kx) * lengte * 12, (f - 0.55) * 5) < 1) s -= 1.4;
      }
    }
    if (fx < 1 / 32) s = 1.1;
    else if (fx < 2 / 32 && f > 2 / 8 && f < 7 / 8 && Math.abs(f - 0.5) > 0.12) {
      UIT.ramp = RAMP.ijzer;
      UIT.stap = f > 0.5 ? 4.6 : 3.6;
      UIT.vlag = 0;
      if (extra) extra(gx, gy, px, py);
      return;
    }
    UIT.ramp = RAMP.hout;
    UIT.stap = s;
    UIT.vlag = 0;
    if (extra) extra(gx, gy, px, py);
  };
}

// De dozen van een kamer: vloer, noord- en westmuur hoog, zuid- en oostmuur laag (weggesneden),
// met een opening in de oostmuur.
function kamerDozen(o) {
  const { b, d, vloer, deco, zaad = 1, oostOpening = 3 } = o;
  const T = muurTex({ deco, zaad });
  const L = muurTex({ zaad: zaad + 3, buiten: true });
  const dozen = [
    K.doos(-1, -1, b + 0.5, d + 0.5, -VLOER_D, 0, vloer),
    K.doos(-1, -1, b + 0.5, -0.5, 0, MUUR_H, T),
    K.doos(-1, -0.5, -0.5, d + 0.5, 0, MUUR_H, T),
    K.doos(-0.5, d - 0.5, b + 0.5, d + 0.5, 0, LAAG_H, L),
  ];
  if (oostOpening != null) {
    dozen.push(K.doos(b - 0.5, -0.5, b + 0.5, oostOpening - 0.5, 0, LAAG_H, L));
    dozen.push(K.doos(b - 0.5, oostOpening + 0.5, b + 0.5, d - 0.5, 0, LAAG_H, L));
  } else dozen.push(K.doos(b - 0.5, -0.5, b + 0.5, d - 0.5, 0, LAAG_H, L));
  return dozen;
}

// ---------------------------------------------------------------- zonlicht door het raam

// Het raam zit in de westmuur (vlak x = -0,5) op tegel ty. De zon staat buiten, laag in het
// westen: het licht valt schuin naar binnen en naar beneden.
const ZON = (() => {
  const v = [1, 0.2, -0.55];
  const l = Math.hypot(...v);
  return v.map((a) => a / l);
})();
function doorRaam(ty, X, Y, Z) {
  // van punt P terug naar het raamvlak, tegen de lichtrichting in
  const Xw = -0.5 * TEGEL;
  const t = (X - Xw) / ZON[0];
  if (t <= 0) return 0;
  const Yw = Y - ZON[1] * t;
  const Zw = Z - ZON[2] * t;
  const u = Math.floor((ty + 0.5 - Yw / TEGEL) * 32);
  const H = Math.floor(Zw * PXH);
  return inRaamOpening(u, H);
}

function zonlicht(B, ty, o = {}) {
  const sterk = o.sterk ?? 2.8;
  const inVlek = new Uint8Array(B.b * B.h);
  // lichtvlek op alles wat de zon raakt (vloer, kleed, figuren)
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] < 0 || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST)) continue;
    const X = B.pos[i * 3];
    const Y = B.pos[i * 3 + 1];
    const Z = B.pos[i * 3 + 2];
    const n = B.nrm[i * 3] * -ZON[0] + B.nrm[i * 3 + 1] * -ZON[1] + B.nrm[i * 3 + 2] * -ZON[2];
    if (n <= 0.05) continue;
    if (X < -0.45 * TEGEL) continue;
    if (doorRaam(ty, X, Y, Z)) {
      B.stap[i] = Math.round(B.stap[i] + sterk * (0.7 + 0.3 * n));
      B.warm[i] += 2.5;
      B.vlag[i] |= VLAG.GLAD;
      inVlek[i] = 1;
    }
  }
  // de bundel in de lucht: langs elke kijkstraal tellen hoeveel ervan in het licht ligt
  const [x0, y0, x1, y1] = o.kader || [0, 0, B.b, B.h];
  const stofjes = [];
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const i = py * B.b + px;
      if (B.ramp[i] < 0 || B.vlag[i] & VLAG.GLOEI || inVlek[i]) continue;
      const ax = px + 0.5 - B.OX;
      const ay = py + 0.5 - B.OY;
      const PX = ax * K.EX[0] + ay * K.EY[0];
      const PY = ax * K.EX[1] + ay * K.EY[1];
      const PZ = ax * K.EX[2] + ay * K.EY[2];
      const tEind = -B.diep[i];
      let binnen = 0;
      let n = 0;
      for (let t = tEind - 260; t < tEind - 2; t += 3) {
        const X = PX + K.V[0] * t;
        const Y = PY + K.V[1] * t;
        const Z = PZ + K.V[2] * t;
        if (Z < 0 || Z > MUUR_H / PXH || X < -0.5 * TEGEL || Y < -0.5 * TEGEL) continue;
        n++;
        if (doorRaam(ty, X, Y, Z)) binnen++;
      }
      if (binnen > 2) {
        // kern massief, rand als dambord, daarbuiten niets: een bundel zoals je hem tekent
        const kern = binnen > 7;
        if (kern || (px + py) % 2 === 0) {
          B.stap[i] += kern ? 1.1 : 1;
          B.warm[i] += 1.5;
          B.vlag[i] |= VLAG.GLAD;
        }
        if (rnd(px, py, 31) < 0.0005 * binnen) stofjes.push([px, py]);
      }
    }
  }
  for (const [px, py] of stofjes) B.verf(px, py, 'goud', 6, VLAG.VAST | VLAG.GLAD);
}

// ---------------------------------------------------------------- de scène opbouwen

function scene(b, h, OX, OY) {
  const B = new K.Beeld(b, h, OX, OY);
  return B;
}

// Een model op een tegel zetten, met schaduw op de vloer als het een figuur is.
function zet(B, model, gx, gy, richting, o = {}) {
  K.tekenModel(B, model, { gx, gy, richting, z: o.z || 0 });
  if (o.schaduw) K.schaduwOpVloer(B, model, { gx, gy, richting, voet: o.voet || 14, sterkte: o.sterkte || 1 });
}

// ---------------------------------------------------------------- de hal

function hal(leeftijd = 84) {
  const B = scene(960, 540, 448, 216);
  // een barst van de deur de kamer in, en een kleed
  const barst = [[5, -0.47], [4.82, 0.1], [4.95, 0.55], [4.55, 1.05], [4.62, 1.5], [4.2, 1.9], [4.28, 2.2]].map(([x, y]) => K.tegelNaarScherm(B, x, y));
  const barstPix = new Set();
  const barstRand = new Set();
  for (let i = 0; i + 1 < barst.length; i++) {
    const [ax, ay] = barst[i];
    const [bx, by] = barst[i + 1];
    const n = Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)));
    for (let s = 0; s <= n; s++) {
      const x = Math.round(ax + ((bx - ax) * s) / n + Math.sin(s * 1.7 + i) * 0.6);
      const y = Math.round(ay + ((by - ay) * s) / n);
      barstPix.add(x + y * 960);
      if (s % 3 === 0) barstPix.add(x + 1 + y * 960);
      barstRand.add(x - 1 + (y + 1) * 960);
    }
  }
  const kleed = [1.55, 4.75, 2.55, 4.35];
  const vloer = zandVloer((gx, gy, px, py) => {
    const i = px + py * 960;
    if (barstPix.has(i)) {
      UIT.stap = 0.4;
      return;
    }
    if (barstRand.has(i)) UIT.stap += 1.2;
    const [ka, kb, kc, kd] = kleed;
    if (gx > ka && gx < kb && gy > kc && gy < kd) {
      const rx = Math.min(gx - ka, kb - gx);
      const ry = Math.min(gy - kc, kd - gy);
      const rr = Math.min(rx, ry);
      const weef = (px + py) % 2 ? 0.25 : -0.25;
      let ramp = RAMP.rood;
      let s = 3.6 + weef;
      if (rr < 0.05) s = 2.2;
      else if (rr < 0.2) {
        ramp = RAMP.goud;
        s = 3.2 + weef;
        const ruit = (Math.floor((gx + gy) * 10) + Math.floor((gx - gy) * 10)) % 2;
        if (rr > 0.08 && rr < 0.17 && ruit) {
          ramp = RAMP.rood;
          s = 2.6;
        }
      } else if (rr < 0.26) s = 2.4;
      const mx = (ka + kb) / 2;
      const my = (kc + kd) / 2;
      const ruitAfst = Math.abs(gx - mx) + Math.abs(gy - my) * 1.5;
      if (rr >= 0.26) {
        if (ruitAfst < 0.72 && ruitAfst > 0.6) {
          ramp = RAMP.goud;
          s = 3.8;
        } else if (ruitAfst < 0.3) {
          ramp = RAMP.goud;
          s = ruitAfst < 0.12 ? 5 : 3.6;
        } else if (ruitAfst < 0.6 && (Math.floor(gx * 12) + Math.floor(gy * 12)) % 3 === 0) s = 4.4;
      }
      UIT.ramp = ramp;
      UIT.stap = s;
      return;
    }
    // franje aan de korte kanten
    if (gy > kc + 0.04 && gy < kd - 0.04 && ((gx > ka - 0.07 && gx <= ka) || (gx >= kb && gx < kb + 0.07)) && (px + py) % 3 !== 0) {
      UIT.ramp = RAMP.perkament;
      UIT.stap = 3.4;
    }
  });

  const deco = {
    y: {
      1: wandkleedDeco(),
      5: samen(scheurDeco([[9, 127], [10, 118], [8, 110], [11, 104], [9, 98]], 2), deurDeco(true)),
      6: scheurDeco([[2, 60], [5, 52], [4, 45], [8, 38], [7, 30]], 3),
      7: scheurDeco([[20, 127], [18, 119], [21, 112], [19, 104], [22, 96], [20, 90]], 4),
    },
    x: {
      2: raamDeco(),
      3: scheurDeco([[25, 127], [22, 118], [24, 110], [20, 101], [22, 92]], 5),
      5: scheurDeco([[4, 30], [7, 24], [5, 16], [9, 9], [8, 0]], 6),
    },
  };
  K.tekenDozen(B, kamerDozen({ b: 8, d: 6, vloer, deco, zaad: 3, oostOpening: 3 }));

  // voorwerpen
  zet(B, V.wandlamp(), 3, -0.5, 'ZW');
  zet(B, V.tafel(), 1, 1.05, 'ZW');
  zet(B, V.fontein(), 6, 5, 'ZO');
  zet(B, V.puin(3, 8), 5.1, 0.2, 'ZO');
  zet(B, V.puin(7, 5), 6.3, 0.6, 'ZO');
  zet(B, V.kist(), 0.05, 4.15, 'ZO');
  zet(B, V.ton(), 0.1, 5.25, 'ZO');
  // figuren
  zet(B, F.wim(), 4, 2, 'W', { schaduw: true, voet: 13 });
  zet(B, F.tovenaar(leeftijd), 2, 4, 'O', { schaduw: true, voet: 15 });

  // licht
  B.lichten.push({ pos: [-0.3 * TEGEL, 2 * TEGEL, 90], r: 120, sterk: 0.8, warm: 1 });
  K.belicht(B, { omgeving: omgeving(B) });
  zonlicht(B, 2, { kader: [60, 40, 700, 460] });
  K.verwarm(B, 2);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// ---------------------------------------------------------------- het gevechtsraster

// Het raster ligt op de vloer, onder de figuren: gestippelde ruiten, het bereik van de held in
// blauw met een fijne stip, het doel in oranje met hoekjes, en de baan van de vuurschicht.
function gevechtsRaster(B, held, doel, bereik = 3) {
  const [dx, dy] = held;
  const baanA = K.tegelNaarScherm(B, held[0], held[1]);
  const baanB = K.tegelNaarScherm(B, doel[0], doel[1]);
  for (let py = 0; py < B.h; py++) {
    for (let px = 0; px < B.b; px++) {
      const i = py * B.b + px;
      if (!(B.vlag[i] & VLAG.VLOER) || B.obj[i] !== 0) continue;
      const gx = B.pos[i * 3] / TEGEL;
      const gy = B.pos[i * 3 + 1] / TEGEL;
      const tx = Math.round(gx);
      const ty = Math.round(gy);
      if (tx < 0 || ty < 0 || tx > 8 || ty > 6) continue;
      const a = gx - tx;
      const b = gy - ty;
      const inBereik = Math.max(Math.abs(tx - dx), Math.abs(ty - dy)) <= bereik;
      const isDoel = tx === doel[0] && ty === doel[1];
      const rand = 1 / 32;
      const opLijn = a < -0.5 + rand || b < -0.5 + rand;
      // ook de rechter- en onderrand van het doel en van het bereik tekenen
      const buurRand = (a > 0.5 - rand && (isDoel || inBereik)) || (b > 0.5 - rand && (isDoel || inBereik));
      if (isDoel) {
        const r2 = 2 / 32;
        const aan = a < -0.5 + r2 || b < -0.5 + r2 || a > 0.5 - r2 || b > 0.5 - r2;
        const hoek = (Math.abs(a) > 0.34 && Math.abs(b) > 0.34) || Math.abs(a) + Math.abs(b) > 0.9;
        if (aan && (hoek || (px >> 1) % 2 === 0)) {
          B.verf(px, py, 'vuur', hoek ? 6 : 5);
          continue;
        }
      }
      if (opLijn || buurRand) {
        if (Math.floor(px / 3) % 2 === 0) B.verf(px, py, inBereik ? 'gewaad' : 'hout', inBereik ? 5 : 5);
        continue;
      }
    }
  }
  // de baan: stippen van de held naar het doel
  const n = Math.hypot(baanB[0] - baanA[0], baanB[1] - baanA[1]);
  for (let s = 18; s < n - 14; s += 5) {
    const x = Math.round(baanA[0] + ((baanB[0] - baanA[0]) * s) / n);
    const y = Math.round(baanA[1] + ((baanB[1] - baanA[1]) * s) / n);
    for (const [ox, oy] of [[0, 0], [1, 0]]) {
      const i = (y + oy) * B.b + x + ox;
      if (B.vlag[i] & VLAG.VLOER && B.obj[i] === 0) B.verf(x + ox, y + oy, 'vuur', 4);
    }
  }
}

// een levensbalkje boven een monster, in het beeld zelf
function levensbalk(p, cx, top, deel) {
  const b = 30;
  const x0 = Math.round(cx - b / 2);
  for (let x = -1; x <= b; x++) {
    for (let y = -1; y <= 3; y++) {
      const rand = x === -1 || x === b || y === -1 || y === 3;
      if (rand) p.zet(x0 + x, top + y, 'inkt', 0);
      else if (x < b * deel) p.zet(x0 + x, top + y, 'slijm', y === 0 ? 7 : 5);
      else p.zet(x0 + x, top + y, 'rood', y === 0 ? 3 : 2);
    }
  }
}

// een glinstering: een klein sterretje van licht
function glinster(p, x, y) {
  p.zet(x, y, 'goud', 7);
  for (const [dx, dy, s] of [[-1, 0, 6], [1, 0, 6], [0, -1, 6], [0, 1, 6], [-2, 0, 5], [2, 0, 5], [0, -2, 5], [0, 2, 5]]) p.zet(x + dx, y + dy, 'goud', s);
}

// ---------------------------------------------------------------- de voorraadkamer, midden in een gevecht

function voorraadkamer(leeftijd = 85) {
  const B = scene(960, 540, 448, 216);
  const held = [2, 4];
  const doel = [6, 3];
  const deco = {
    y: {
      7: scheurDeco([[14, 127], [16, 120], [13, 112], [17, 103], [15, 95], [18, 88]], 7),
      0: scheurDeco([[26, 40], [23, 33], [25, 27], [21, 20], [23, 12]], 8),
    },
    x: {
      3: doorgangDeco(true),
      5: scheurDeco([[8, 127], [10, 118], [7, 110], [11, 100], [9, 92]], 9),
      1: scheurDeco([[20, 60], [17, 52], [19, 45], [15, 38]], 10),
    },
  };
  K.tekenDozen(B, kamerDozen({ b: 8, d: 6, vloer: houtVloer(), deco, zaad: 11, oostOpening: null }));

  zet(B, V.wandrek(1), 1, -0.5, 'ZW');
  zet(B, V.wandrek(2), 2.1, -0.5, 'ZW');
  zet(B, V.wandlamp(), 5, -0.5, 'ZW');
  zet(B, V.kist(), 3.4, 0.2, 'ZO');
  zet(B, V.kist(true), 3.45, 0.15, 'ZO', { z: 25 });
  zet(B, V.kist(), 4.55, 0.25, 'ZO');
  zet(B, V.ton(), 7.25, 0.2, 'ZO');
  zet(B, V.ton(), 8.1, 1.05, 'ZO');
  zet(B, V.ton(), 7.3, 1.15, 'ZO');
  zet(B, V.zak(1), 0.15, 4.65, 'ZO');
  zet(B, V.zak(2), 0.7, 5.15, 'ZO');
  zet(B, V.zak(4), 0.1, 5.5, 'ZO');
  zet(B, V.sleutel(), 7, 2.4, 'ZO');

  zet(B, F.slijm(), doel[0], doel[1], 'NW', { schaduw: true, voet: 22, sterkte: 1.2 });
  zet(B, F.tovenaar(leeftijd), held[0], held[1], 'ZO', { schaduw: true, voet: 15 });
  // de vuurschicht, iets meer dan halverwege
  const t = 0.56;
  const hoek = (Math.atan2(doel[1] - held[1], doel[0] - held[0]) * 180) / Math.PI;
  zet(B, V.vuurschicht(), held[0] + (doel[0] - held[0]) * t, held[1] + (doel[1] - held[1]) * t, hoek, { z: 62 });

  K.belicht(B, { omgeving: (X, Y, Z) => -1.35 - klem((Z * PXH - 40) / 100, 0, 1) * 0.7 });
  K.verwarm(B, 2.4);
  gevechtsRaster(B, held, doel);
  K.omlijn(B);
  const p = K.Plaat.van(K.kwantiseer(B));
  const [mx, my] = K.tegelNaarScherm(B, doel[0], doel[1]);
  levensbalk(p, mx, my - 50, 10 / 12);
  const [kx, ky] = K.tegelNaarScherm(B, 7, 2.4);
  glinster(p, kx + 5, ky - 4);
  return p;
}

// Hoe donker het is zonder lamp: de kamer wordt naar achteren en naar boven toe schemeriger.
function omgeving(B) {
  return (X, Y, Z) => {
    const hoog = klem((Z * PXH - 40) / 100, 0, 1);
    return -1.15 - hoog * 0.7;
  };
}

module.exports = { voorraadkamer, gevechtsRaster, levensbalk, glinster, hal, zonlicht, kamerDozen, muurTex, zandVloer, houtVloer, zet, scene, omgeving, deurDeco, raamDeco, wandkleedDeco, doorgangDeco, scheurDeco, samen, steenPixel, MUUR_H, LAAG_H };
