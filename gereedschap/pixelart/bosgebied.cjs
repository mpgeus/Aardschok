// Het bos tussen het dorp en de toren: een stuk waar je doorheen loopt. Een pad slingert van de
// ene hoek naar de andere, het bos gaat dicht en open, en onderweg zijn er plekken om te stoppen:
// de beek met een omgevallen boom eroverheen, het vuur van een kolenbrander, en de grenssteen bij
// het keiblok. Aan de randen staat het bos dicht, zodat de grond nergens ophoudt in een lijn.
//
// Licht als in het dorp: de lage avondzon (dezelfde richting), lange schaduwen naar achteren,
// warme kruinen en koele schaduw eronder.
//
// De plaatsing gaat in schermtegels, net als in wereld.cjs: u telt naar rechts (32 pixels per
// stap), d naar beneden de diepte in (16 pixels per stap). Zo is de compositie te lezen als een
// tekening: alles met een kleine d staat achteraan.
'use strict';
const K = require('./kern.cjs');
const { sdf, klem, mix, hash, rnd, ruis2, ruis3, RAMP, UIT, VLAG, TEGEL, PXH } = K;
const Bm = require('./bomen.cjs');
const { model } = require('./figuren.cjs');

// schermtegels naar wereldtegels en terug
const tg = (u, d) => [(d + u) / 2, (d - u) / 2];
const ud = (gx, gy) => [gx - gy, gx + gy];

// dezelfde avondzon als het dorp: dezelfde kant als het hoofdlicht, maar lager, dus lange schaduwen
const norm3 = (v) => {
  const l = Math.hypot(...v);
  return v.map((a) => a / l);
};
const AVONDZON = norm3([-0.3, 0.6, 0.5]);

// ---------------------------------------------------------------- omgevallen boom

// Een omgevallen stam over de beek: schors met mos aan de bovenkant, een kluit wortels aan het
// afgebroken eind, een paar stompe takken en zwammen aan de zijkant. Ligt langs de x-as, dus de
// richting waarin je hem zet bepaalt waar hij overheen valt.
function omgevallenStam(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 131);
  const L = o.lengte ?? 168;
  const r0 = o.straal ?? 13;
  const M = { schors: 0, hout: 1, zwam: 2, aarde: 3 };
  const mat = [];
  mat[M.schors] = {
    ...Bm.schorsMat({ zaad, lo: 0.8, hi: 5.2 }),
    // mos op wat naar boven kijkt, met een rafelige rand
    // mos in plekken op de bovenkant, niet als een groene streep over de hele stam
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const vlek = ruis2(x * 0.055, y * 0.1 + z * 0.1, zaad + 11);
      const mos = nz * (0.1 + 1.7 * vlek) + (ruis3(x * 0.2, y * 0.3, z * 0.3, zaad + 5) - 0.5) * 0.55;
      if (mos > 0.8) return { ramp: 'mos', plus: -1 + (mos > 1.15 ? 0.6 : 0) };
      const n = ruis3(x * 0.07, y * 0.3, z * 0.3, zaad);
      if (Math.abs(n - 0.5) < 0.05) return -1.4;
      return n > 0.68 ? 0.5 : 0;
    },
  };
  mat[M.hout] = {
    ramp: 'hout',
    lo: 2.6,
    hi: 6.8,
    // de jaarringen op het afgebroken eind, met een donkere spleet erdoor
    patroon: (x, y, z) => {
      const rr = Math.hypot(y, (z - r0) / 0.95) + ruis3(y * 0.25, z * 0.25, 3, zaad) * 2.2;
      if (rr > r0 - 1.4) return -2.6;
      if (Math.abs(y * 0.7 - (z - r0) * 0.5) < 0.9 && rr < r0 * 0.7) return -2.2;
      const ring = rr / 2 - Math.floor(rr / 2);
      return ring < 0.32 ? -1.1 : rr < 2 ? 0.8 : 0;
    },
  };
  // zwammen als plankjes tegen de stam: bovenop bleek, eronder donker
  mat[M.zwam] = { ramp: 'perkament', lo: 2, hi: 6.6, detail: true, omslag: 0.4, patroon: (x, y, z, nx, ny, nz) => (nz < -0.1 ? -2 : 0) };
  mat[M.aarde] = {
    ramp: 'aarde',
    lo: 1,
    hi: 5,
    patroon: (x, y, z) => (ruis3(x * 0.5, y * 0.5, z * 0.5, zaad + 13) > 0.66 ? -1 : 0),
  };
  const delen = [];
  // de stam zelf, met een flauwe knik
  const punten = [];
  const stralen = [];
  const n = 5;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    punten.push([mix(-L / 2, L / 2, t), Math.sin(t * 2.4) * 4 * (R(1) - 0.5), r0 * (1 - 0.1 * t) + Math.sin(t * 3) * 1.5]);
    stralen.push(r0 * (1 - 0.22 * t));
  }
  // De stam is aan het eind recht afgebroken: daar ligt de snede met de jaarringen open. Die kant
  // ligt op +x, dus in richting 'Z' naar het licht toe: vers hout vangt de avondzon.
  const x1 = punten[n][0];
  const stam = Bm.tak(punten, stralen, M.schors, 1, 2);
  stam.m = (x) => (x > x1 - 1.2 ? M.hout : M.schors);
  delen.push(stam);
  delen.push({ f: (x) => x1 - x, uit: true });
  // de kluit wortels aan het andere eind: korte stompe wortels die alle kanten op steken
  const eind = punten[0];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R(10 + i);
    const l = 18 + R(20 + i) * 20;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    delen.push(
      Bm.tak(
        Bm.bocht(eind, [eind[0] - 10, eind[1] + ca * l * 0.5, eind[2] + sa * l * 0.5], [eind[0] - 14 - R(30 + i) * 10, eind[1] + ca * l, Math.max(0.5, eind[2] + sa * l)], 3),
        [7, 5, 3.2, 1.6],
        M.schors,
        3,
        1.5,
      ),
    );
  }
  // de kluit aarde tussen de wortels
  delen.push({
    f: (x, y, z) => Math.max(sdf.ellipsoide(x - eind[0] + 6, y - eind[1], z - r0 * 0.9, 9, r0 * 1.5, r0 * 1.4), -z),
    g: [eind[0] - 6, eind[1], r0 * 0.9, r0 * 1.6],
    m: M.aarde,
    deel: 4,
    k: 2,
  });
  // stompe afgebroken takken en zwammen op de schaduwkant
  for (let i = 0; i < 3; i++) {
    const x = mix(-L * 0.3, L * 0.35, R(40 + i));
    const a = 0.6 + R(50 + i) * 1.6;
    delen.push(Bm.tak([[x, 0, r0 * 0.6], [x + 6 * (R(60 + i) - 0.5), Math.cos(a) * (r0 + 12), r0 * 0.6 + Math.sin(a) * 14]], [4.5, 2.2], M.schors, 4, 1));
  }
  for (let i = 0; i < 5; i++) {
    const x = mix(-L * 0.4, L * 0.4, R(70 + i));
    const zz = r0 * (0.5 + R(80 + i) * 0.5);
    const s = 4 + R(90 + i) * 3;
    delen.push({
      f: (px, py, pz) => sdf.ellipsoide(px - x, py - (r0 * 0.75 + s * 0.4), pz - zz, s * 0.8, s, s * 0.35),
      g: [x, r0 * 0.75 + s * 0.4, zz, s + 1],
      m: M.zwam,
      deel: 5 + i,
    });
  }
  delen.push(Bm.onderGrond);
  return model(delen, mat, Bm.omhul(delen));
}

// ---------------------------------------------------------------- het vuur van de kolenbrander

// Een vuurkuil: een kring stenen, as, verkoolde stukken hout en gloeiende kolen. Geeft licht, dus
// in de scène kleurt hij het gras en de stammen eromheen warm.
function vuurkuil(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 137);
  const M = { steen: 0, as: 1, kool: 2, gloed: 3, hout: 4 };
  const mat = [];
  mat[M.steen] = {
    ramp: 'steen',
    lo: 1.4,
    hi: 6.2,
    patroon: (x, y, z) => (ruis3(x * 0.3, y * 0.3, z * 0.3, zaad) > 0.72 ? -0.8 : 0),
  };
  mat[M.as] = { ramp: 'steen', lo: 3.4, hi: 7, patroon: (x, y) => (ruis2(x * 0.4, y * 0.4, zaad + 3) > 0.62 ? 0.8 : -0.4) };
  mat[M.kool] = {
    ramp: 'inkt',
    lo: 0.4,
    hi: 2.6,
    // hier en daar gloeit een barst in het kool op
    patroon: (x, y, z) => (ruis3(x * 0.6, y * 0.6, z * 0.6, zaad + 7) > 0.74 ? { ramp: 'vuur', stap: 3.4 } : 0),
  };
  mat[M.gloed] = { ramp: 'vuur', gloei: (x, y, z, kijk) => klem(3.4 + 2.6 * kijk + (z > 4 ? 0.6 : 0), 2.5, 7) };
  mat[M.hout] = Bm.schorsMat({ zaad, lo: 0.6, hi: 4.2 });
  const delen = [];
  const Rk = o.straal ?? 21;
  // de kring stenen
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + R(i) * 0.3;
    const s = 6 + R(10 + i) * 3.5;
    const c = [Math.cos(a) * Rk, Math.sin(a) * Rk, s * 0.5];
    delen.push({
      f: (x, y, z) => sdf.doos(x - c[0], y - c[1], z - c[2], s * 0.9, s * 0.75, s * 0.6, s * 0.35),
      g: [...c, s + 1],
      m: M.steen,
      deel: 1,
    });
  }
  // as in de kuil
  delen.push({
    f: (x, y, z) => Math.max(sdf.cilinder(x, y, z, Rk - 2, -2, 1.6), -z - 1),
    g: [0, 0, 0, Rk + 1],
    m: M.as,
    deel: 2,
  });
  // verkoolde stukken hout, kris kras over het vuur
  for (let i = 0; i < 4; i++) {
    const a = R(30 + i) * Math.PI;
    const l = Rk * (0.8 + R(40 + i) * 0.5);
    const h = 2.5 + R(50 + i) * 3;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    delen.push(Bm.tak([[-ca * l, -sa * l, 1.5], [ca * l * 0.9, sa * l * 0.9, h]], [3, 2.2], i < 2 ? M.kool : M.hout, 3 + i, 0));
  }
  // de gloeiende kern tussen het hout: een bed kolen met een paar hete plekken erin
  delen.push({
    f: (x, y, z) => Math.max(sdf.ellipsoide(x, y, z - 1, Rk - 5, Rk - 5, 3.4), -z - 0.5),
    g: [0, 0, 1, Rk],
    m: M.gloed,
    deel: 9,
  });
  for (let i = 0; i < 4; i++) {
    const a = R(60 + i) * Math.PI * 2;
    const r = R(70 + i) * Rk * 0.45;
    delen.push({
      f: (x, y, z) => sdf.ellipsoide(x - Math.cos(a) * r, y - Math.sin(a) * r, z - 3.4, 4.2, 4.2, 2.6),
      g: [Math.cos(a) * r, Math.sin(a) * r, 3.4, 6],
      m: M.gloed,
      deel: 9,
    });
  }
  delen.push(Bm.onderGrond);
  return model(delen, mat, { ...Bm.omhul(delen), lichten: [{ pos: [0, 0, 6], r: 150, sterk: 3.2, warm: 1, val: 1.3, zacht: 0.55 }] });
}

// Een stapel gekloofd hout naast het vuur: rijen stammetjes met de kop naar de kijker, tussen
// twee staken.
function houtstapel(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 139);
  const M = { schors: 0, staak: 1 };
  const mat = [];
  mat[M.schors] = Bm.schorsMat({ zaad, lo: 0.9, hi: 5, rek: 0.3 });
  mat[M.staak] = Bm.schorsMat({ zaad: zaad + 2, lo: 1, hi: 5.4, rek: 0.1 });
  // elk stammetje krijgt zijn eigen kopmateriaal: de jaarringen moeten om zijn eigen hart lopen
  const kopMat = (cx, cz, rr) =>
    mat.push({
      ramp: 'hout',
      lo: 2.8,
      hi: 6.8,
      patroon: (x, y, z) => {
        const d = Math.hypot(x - cx, z - cz) + ruis3(x * 0.4, z * 0.4, 5, zaad) * 1.2;
        if (d > rr - 1) return -2.4;
        if (Math.abs((x - cx) * 0.8 - (z - cz) * 0.4) < 0.8 && d < rr * 0.7) return -2;
        const ring = d / 1.7 - Math.floor(d / 1.7);
        return ring < 0.34 ? -1.1 : d < 1.6 ? 0.8 : 0;
      },
    }) - 1;
  const delen = [];
  const rijen = o.rijen ?? 4;
  const breed = o.breed ?? 52;
  let deel = 1;
  for (let j = 0; j < rijen; j++) {
    const aantal = 5 - Math.floor(j / 2);
    for (let i = 0; i < aantal; i++) {
      const rr = 5.5 + R(j * 10 + i) * 1.6;
      const x = -breed / 2 + 4 + ((i + (j % 2) * 0.5) * (breed - 8)) / 5 + (R(j * 10 + i + 50) - 0.5) * 2;
      const z = rr + j * 10.5;
      const d = breed * 0.42 + R(j * 10 + i + 70) * 6;
      const kop = kopMat(x, z, rr);
      const stok = Bm.tak([[x, -d, z], [x, d, z]], [rr, rr], M.schors, deel, 0);
      // het stammetje is recht afgezaagd; de kop kijkt naar de kijker, daar de jaarringen
      const f0 = stok.f;
      stok.f = (px, py, pz) => Math.max(f0(px, py, pz), py - d);
      stok.m = (px, py) => (py > d - 1.2 ? kop : M.schors);
      delen.push(stok);
      deel += 1;
    }
  }
  for (const s of [-1, 1]) delen.push(Bm.tak([[(s * breed) / 2, -2, -2], [(s * breed) / 2 + s * 3, 0, rijen * 10.5 + 10]], [3.2, 2.6], M.staak, 90, 0));
  delen.push(Bm.onderGrond);
  return model(delen, mat, Bm.omhul(delen));
}

// ---------------------------------------------------------------- de grenssteen

// Een grenssteen: een scheve staande steen met een ingehakt teken, mos aan de schaduwkant, en een
// hoopje kiezels aan de voet. Hij staat er al lang.
function grenssteen(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 149);
  const M = { steen: 0, teken: 1, kiezel: 2 };
  const mat = [];
  const h = o.hoogte ?? 72;
  const scheef = ((R(1) - 0.5) * 9 * Math.PI) / 180;
  mat[M.steen] = {
    ramp: 'steen',
    lo: 1.2,
    hi: 6.4,
    patroon: (x, y, z, nx, ny, nz) => {
      // mos aan de voet en op de noordkant (van de kijker af)
      const mos = (1 - klem(z / 26, 0, 1)) * 0.6 - ny * 0.5 + (ruis3(x * 0.3, y * 0.3, z * 0.3, zaad + 4) - 0.5) * 0.9;
      if (mos > 0.35) return { ramp: 'mos', plus: -1 };
      const n = ruis3(x * 0.25, y * 0.25, z * 0.18, zaad);
      if (Math.abs(n - 0.5) < 0.035) return -1.5;
      return n > 0.7 ? 0.5 : 0;
    },
  };
  mat[M.teken] = { ramp: 'steen', lo: 0.4, hi: 2.4, detail: true };
  mat[M.kiezel] = { ramp: 'steen', lo: 1.6, hi: 6, patroon: (x, y, z) => (ruis3(x * 0.5, y * 0.5, z * 0.5, zaad + 6) > 0.7 ? -0.8 : 0) };
  const delen = [];
  const b = 15 + R(2) * 3;
  const d = 7 + R(3) * 2;
  delen.push({
    f: (x, y, z) => {
      const ca = Math.cos(scheef);
      const sa = Math.sin(scheef);
      const X = x * ca - z * sa;
      const Z = x * sa + z * ca;
      const t = klem(Z / h, 0, 1);
      // naar boven toe smaller en met een scheve kop
      const bb = b * (1 - 0.25 * t);
      const dd = d * (1 - 0.2 * t);
      const top = h - Math.abs(X) * 0.35 - 3 * Math.sin(y * 0.4);
      return Math.max(sdf.doos(X, y, Z - h / 2, bb, dd, h / 2, 2.5), Z - top);
    },
    g: [0, 0, h / 2, h * 0.62 + b],
    m: M.steen,
    deel: 1,
  });
  // het teken: een gekerfde streep met twee dwarsstreepjes, uitgehakt in de kant naar de kijker
  delen.push({
    f: (x, y, z) => {
      const dz = z - h * 0.62;
      const staaf = sdf.doos(x, y - d, dz, 1.6, 4, 16, 0.4);
      const dwars1 = sdf.doos(x, y - d, dz - 7, 7, 4, 1.6, 0.4);
      const dwars2 = sdf.doos(x, y - d, dz + 4, 5, 4, 1.6, 0.4);
      return Math.min(staaf, dwars1, dwars2);
    },
    g: [0, d, h * 0.62, 20],
    m: M.teken,
    deel: 2,
    uit: true,
  });
  // kiezels aan de voet
  for (let i = 0; i < 7; i++) {
    const a = R(10 + i) * Math.PI * 2;
    const r = b + 2 + R(20 + i) * 12;
    const s = 2.6 + R(30 + i) * 2.4;
    delen.push({
      f: (x, y, z) => sdf.ellipsoide(x - Math.cos(a) * r, y - Math.sin(a) * r, z - s * 0.4, s, s * 0.85, s * 0.6),
      g: [Math.cos(a) * r, Math.sin(a) * r, s * 0.4, s + 1],
      m: M.kiezel,
      deel: 3,
    });
  }
  delen.push(Bm.onderGrond);
  return model(delen, mat, Bm.omhul(delen));
}

// ---------------------------------------------------------------- sprites

// Een boom zo vaak renderen als hij in het bos staat is zonde werk: hij ziet er elke keer
// hetzelfde uit. Daarom renderen we elk model één keer in een eigen beeldje en zetten we dat
// daarna als sprite neer. De diepte schuift met de verplaatsing mee, dus alles staat nog steeds
// netjes voor en achter elkaar; licht en schaduw komen daarna over de hele scène.

// waar het midden van een model op het scherm valt, ten opzichte van zijn voet
function middenOpScherm(model, richting) {
  const graden = typeof richting === 'number' ? richting : K.RICHTING[richting];
  const a = (graden * Math.PI) / 180;
  const fx = Math.cos(a);
  const fy = Math.sin(a);
  const [mx, my, mz] = model.midden;
  const wx = -mx * fy + my * fx;
  const wy = mx * fx + my * fy;
  return [wx * K.EX[0] + wy * K.EX[1], wx * K.EY[0] + wy * K.EY[1] + mz * K.EY[2]];
}

// het wereldpunt op z = 0 dat op schermpunt (ax, ay) valt, gemeten vanaf de oorsprong van het beeld
const wereldVan = (ax, ay) => [Math.SQRT2 * (ax / 2 + ay), Math.SQRT2 * (ay - ax / 2)];

function maakSprite(model, richting = 'Z') {
  const [dx, dy] = middenOpScherm(model, richting);
  const R = Math.ceil(model.straal) + 3;
  const b = 2 * R + 2;
  const h = 2 * R + 2;
  const ax = Math.round(R + 1 - dx);
  const ay = Math.round(R + 1 - dy);
  const B = new K.Beeld(b, h, ax, ay);
  K.tekenModel(B, model, { richting });
  let x0 = b;
  let x1 = -1;
  let y0 = h;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      if (B.ramp[y * b + x] < 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < x0) return null;
  const sb = x1 - x0 + 1;
  const sh = y1 - y0 + 1;
  const sp = {
    b: sb,
    h: sh,
    ax: ax - x0,
    ay: ay - y0,
    ramp: new Int16Array(sb * sh).fill(-1),
    stap: new Float32Array(sb * sh),
    diep: new Float32Array(sb * sh),
    deel: new Int16Array(sb * sh),
    vlag: new Uint8Array(sb * sh),
    nrm: new Float32Array(sb * sh * 3),
    model,
    richting,
    lichten: model.lichten || [],
  };
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sb; x++) {
      const s = (y + y0) * b + (x + x0);
      const t = y * sb + x;
      sp.ramp[t] = B.ramp[s];
      sp.stap[t] = B.stap[s];
      sp.diep[t] = B.diep[s];
      sp.deel[t] = B.deel[s];
      sp.vlag[t] = B.vlag[s];
      for (let k = 0; k < 3; k++) sp.nrm[t * 3 + k] = B.nrm[s * 3 + k];
    }
  }
  return sp;
}

// Een sprite neerzetten met zijn voet op wereldpunt (X, Y, 0). De plek wordt op hele pixels
// afgerond; de wereldplek die daarbij hoort bepaalt hoeveel de diepte opschuift.
function zetSprite(B, sp, X, Y) {
  const [fx0, fy0] = K.naarScherm(B, X, Y, 0);
  const sx = Math.round(fx0);
  const sy = Math.round(fy0);
  const [WX, WY] = wereldVan(sx - B.OX, sy - B.OY);
  const dd = (WX + WY) * Math.SQRT1_2 * PXH;
  const obj = B.volgendObj++;
  const V = K.V;
  for (let j = 0; j < sp.h; j++) {
    const ty = sy - sp.ay + j;
    if (ty < 0 || ty >= B.h) continue;
    for (let i = 0; i < sp.b; i++) {
      const s = j * sp.b + i;
      if (sp.ramp[s] < 0) continue;
      const tx = sx - sp.ax + i;
      if (tx < 0 || tx >= B.b) continue;
      const d = sp.diep[s] + dd;
      const t = ty * B.b + tx;
      if (d <= B.diep[t]) continue;
      B.ramp[t] = sp.ramp[s];
      B.stap[t] = sp.stap[s];
      B.diep[t] = d;
      B.deel[t] = sp.deel[s];
      B.vlag[t] = sp.vlag[s];
      B.obj[t] = obj;
      const px = tx + 0.5 - B.OX;
      const py = ty + 0.5 - B.OY;
      B.pos[t * 3] = px * K.EX[0] + py * K.EY[0] - V[0] * d;
      B.pos[t * 3 + 1] = px * K.EX[1] + py * K.EY[1] - V[1] * d;
      B.pos[t * 3 + 2] = px * K.EX[2] + py * K.EY[2] - V[2] * d;
      B.nrm[t * 3] = sp.nrm[s * 3];
      B.nrm[t * 3 + 1] = sp.nrm[s * 3 + 1];
      B.nrm[t * 3 + 2] = sp.nrm[s * 3 + 2];
    }
  }
  for (const l of sp.lichten) {
    const graden = typeof sp.richting === 'number' ? sp.richting : K.RICHTING[sp.richting];
    const a = (graden * Math.PI) / 180;
    const cf = Math.cos(a);
    const sf = Math.sin(a);
    B.lichten.push({ ...l, pos: [WX + -l.pos[0] * sf + l.pos[1] * cf, WY + l.pos[0] * cf + l.pos[1] * sf, l.pos[2]], obj });
  }
  return { obj, sx, sy, WX, WY, sp };
}

// ---------------------------------------------------------------- schaduw van de avondzon

// Het schaduwmasker van een model op de vlakke grond: één keer per soort uitrekenen, want op
// vlakke grond schuift de schaduw gewoon mee met het model. Het masker staat in schermpixels,
// met hetzelfde anker als de sprite.
function maakSchaduwMasker(model, richting = 'Z', zon = AVONDZON) {
  const graden = typeof richting === 'number' ? richting : K.RICHTING[richting];
  const a = (graden * Math.PI) / 180;
  const fx = Math.cos(a);
  const fy = Math.sin(a);
  const rx = -fy;
  const ry = fx;
  const L = [zon[0] * rx + zon[1] * ry, zon[0] * fx + zon[1] * fy, zon[2]];
  const [mx, my, mz] = model.midden;
  const R = model.straal;
  // de schaduw van de grensbol op z = 0, in modelassen, en hoe ver die reikt
  const t = mz / L[2];
  const cx = mx - L[0] * t;
  const cy = my - L[1] * t;
  const r = R / L[2] + 4;
  // het vak in schermpixels om dat gebied
  const hoeken = [];
  for (const [ddx, ddy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const wx = (cx + ddx) * rx + (cy + ddy) * fx;
    const wy = (cx + ddx) * ry + (cy + ddy) * fy;
    hoeken.push([wx * K.EX[0] + wy * K.EX[1], wx * K.EY[0] + wy * K.EY[1]]);
  }
  const x0 = Math.floor(Math.min(...hoeken.map((p) => p[0])));
  const x1 = Math.ceil(Math.max(...hoeken.map((p) => p[0])));
  const y0 = Math.floor(Math.min(...hoeken.map((p) => p[1])));
  const y1 = Math.ceil(Math.max(...hoeken.map((p) => p[1])));
  const b = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const masker = new Uint8Array(b * h);
  const f = model.sdf;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < b; i++) {
      const [WX, WY] = wereldVan(x0 + i + 0.5, y0 + j + 0.5);
      // wereld naar modelassen
      const x = WX * rx + WY * ry;
      const y = WX * fx + WY * fy;
      const ox = x - mx;
      const oy = y - my;
      const oz = -mz;
      const bb = ox * L[0] + oy * L[1] + oz * L[2];
      const cc = ox * ox + oy * oy + oz * oz - R * R;
      const disc = bb * bb - cc;
      if (disc < 0) continue;
      const w = Math.sqrt(disc);
      let s = Math.max(0.5, -bb - w);
      const eind = -bb + w;
      for (let k = 0; k < 140 && s < eind; k++) {
        const d = f(x + L[0] * s, y + L[1] * s, L[2] * s);
        if (d < 0.2) {
          masker[j * b + i] = 1;
          break;
        }
        s += Math.max(d * 0.85, 0.5);
      }
    }
  }
  return { b, h, ax: -x0, ay: -y0, masker };
}

// De schaduwen van alles bij elkaar, op de grond. Per pixel worden twee werpers onthouden: een
// model staat niet in zijn eigen schaduw (dat doet tekenModel al van binnenuit), maar wel in die
// van de boom ernaast.
function nieuwSchaduwveld(B) {
  return { b: B.b, h: B.h, a: new Int32Array(B.b * B.h), bb: new Int32Array(B.b * B.h) };
}
function stempelSchaduw(veld, m, sx, sy, obj) {
  for (let j = 0; j < m.h; j++) {
    const ty = sy - m.ay + j;
    if (ty < 0 || ty >= veld.h) continue;
    for (let i = 0; i < m.b; i++) {
      if (!m.masker[j * m.b + i]) continue;
      const tx = sx - m.ax + i;
      if (tx < 0 || tx >= veld.b) continue;
      const t = ty * veld.b + tx;
      if (!veld.a[t]) veld.a[t] = obj;
      else if (!veld.bb[t] && veld.a[t] !== obj) veld.bb[t] = obj;
    }
  }
}

// Het veld over de scène leggen: elke pixel die naar de zon kijkt stuurt (denkbeeldig) een straal
// naar de zon; het veld zegt of daar iets voor staat. Zo krijgen grond, struiken en dieren de
// lange schaduwen van de bomen. Zet B.zon en B.schaduw, voor het avondlicht erna.
function zonSchaduw(B, veld, o = {}) {
  const L = o.zon || AVONDZON;
  const kracht = o.kracht ?? 2;
  const n = B.b * B.h;
  const schaduw = new Uint8Array(n);
  const zon = new Float32Array(n);
  for (let py = 0; py < B.h; py++) {
    for (let px = 0; px < B.b; px++) {
      const i = py * B.b + px;
      if (B.ramp[i] < 0 || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST)) continue;
      const nL = B.nrm[i * 3] * L[0] + B.nrm[i * 3 + 1] * L[1] + B.nrm[i * 3 + 2] * L[2];
      if (nL <= 0.05) continue;
      zon[i] = nL;
      // het punt op de grond waar de zonnestraal door deze pixel vandaan komt
      const Z = B.pos[i * 3 + 2];
      const GX = B.pos[i * 3] - (L[0] * Z) / L[2];
      const GY = B.pos[i * 3 + 1] - (L[1] * Z) / L[2];
      const gx = Math.round(B.OX + GX * K.EX[0] + GY * K.EX[1]);
      const gy = Math.round(B.OY + GX * K.EY[0] + GY * K.EY[1]);
      if (gx < 0 || gy < 0 || gx >= veld.b || gy >= veld.h) continue;
      const t = gy * veld.b + gx;
      const obj = B.obj[i];
      const a = veld.a[t];
      const b = veld.bb[t];
      if (!((a && a !== obj) || (b && b !== obj))) continue;
      schaduw[i] = 1;
      zon[i] = 0;
      B.stap[i] -= Math.abs(B.nrm[i * 3 + 2]) < 0.3 ? kracht / 2 : kracht;
      B.vlag[i] |= VLAG.GLAD;
    }
  }
  B.schaduw = schaduw;
  B.zon = zon;
}

// Avondlicht, zoals in het dorp: warm waar de zon valt, koel in de schaduw. Steen in de zon gaat
// naar het warme grijsbeige van 'bot', loof in de zon naar het gelere 'gras', gras en loof in de
// schaduw naar het blauwere groen van 'den'. Steeds naar de tint met dezelfde lichtheid, dus de
// vormen blijven gelijk. Na belicht(), voor omlijn().
const NAAR_WARM = { steen: ['bot', [0, 0, 1, 2, 3, 3, 4, 5, 6]], blad: ['gras', [0, 1, 2, 3, 4, 5, 6, 7]], schors: ['hout', [0, 1, 2, 3, 4, 5, 6]] };
const NAAR_KOEL = { gras: ['den', [1, 2, 3, 4, 5, 6, 6, 6]], blad: ['den', [0, 1, 2, 3, 4, 5, 6, 6]], mos: ['den', [1, 2, 3, 4, 5, 6]] };
function avondlicht(B, o = {}) {
  if (!B.zon) return;
  const warm = new Map(Object.entries(o.warm ?? NAAR_WARM).map(([van, [naar, tabel]]) => [RAMP[van], [RAMP[naar], tabel]]));
  const koel = new Map(Object.entries(o.koel ?? NAAR_KOEL).map(([van, [naar, tabel]]) => [RAMP[van], [RAMP[naar], tabel]]));
  const drempel = o.drempel ?? 0.3;
  for (let i = 0; i < B.b * B.h; i++) {
    const r = B.ramp[i];
    if (r < 0 || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST)) continue;
    const kaart = B.zon[i] > drempel ? warm.get(r) : B.schaduw[i] ? koel.get(r) : null;
    if (!kaart) continue;
    const s = B.stap[i];
    const heel = klem(Math.round(s), 0, kaart[1].length - 1);
    B.ramp[i] = kaart[0];
    B.stap[i] = kaart[1][heel] + (s - Math.round(s));
  }
}

module.exports = {
  tg,
  ud,
  AVONDZON,
  omgevallenStam,
  vuurkuil,
  houtstapel,
  grenssteen,
  maakSprite,
  zetSprite,
  maakSchaduwMasker,
  nieuwSchaduwveld,
  stempelSchaduw,
  zonSchaduw,
  avondlicht,
  wereldVan,
  middenOpScherm,
};
