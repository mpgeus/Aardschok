// De plekken van het dorp: de kapel met zijn klokkentorentje, het kerkhof met de tombe van de oude
// meester, de watermolen aan de beek, de bakkerij, het prikbord waar de opdrachten hangen, de
// kruidenhut aan de bosrand, de jagershut, en het huis van de dorpsoudste. Ook de brug over de
// beek. Het water zelf zit in dorp.cjs, bij de grond.
//
// Alles staat op dezelfde leest als dorp.cjs: gebouwen zijn convexe vormen met een textuur per
// pixel (D.huis), losse dingen zijn kleine 3D-modellen, en het licht is de late middagzon.
'use strict';
const K = require('./kern.cjs');
const { TEGEL, PXH, RAMP, UIT, VLAG, hash, rnd, ruis2, ruis3, klem, mix, sdf } = K;
const F = require('./figuren.cjs');
const VW = require('./voorwerpen.cjs');
const D = require('./dorp.cjs');

const SQ = Math.SQRT1_2;

// ---------------------------------------------------------------- gebrandschilderd glas

// De kleuren van het glas: elke ruit een eigen tint, allemaal met licht erachter.
const GLAS = ['gewaad', 'water', 'rood', 'goud', 'slijm', 'magie'];
// Een ruit glas in lood op zijn punt. rand: de ruit raakt de omlijsting, die krijgt de
// randkleur. kleuren = [rand, veld, accent1, accent2].
function glasRuit(u, h, zaad, kleuren, rand) {
  const a = Math.floor((u + h) / 4.4);
  const b = Math.floor((u - h) / 4.4);
  const lood = (u + h) / 4.4 - a < 0.17 || (u - h) / 4.4 - b < 0.17;
  if (lood) return null;
  if (rand) return kleuren[0];
  const hk = hash(a, b, zaad) % 12;
  return hk < 2 ? kleuren[2] : hk === 2 ? kleuren[3] : kleuren[1];
}

// Een spitsboograam met glas in lood. De boog is een gelijkzijdige spitsboog: twee cirkels met de
// breedte van het raam als straal. o.b is de breedte, o.hoog de hoogte tot waar de boog begint.
function glasraamElement(o) {
  const el = { soort: 'raam', u: o.u, b: o.b ?? 16, h: o.h ?? 40, hoog: o.hoog ?? 30, ...o };
  const w = el.b;
  const top = el.hoog + w * 0.866; // de punt van de boog
  const binnen = (du, dh) => {
    if (du < 0 || du >= w) return false;
    if (dh < 0) return false;
    if (dh <= el.hoog) return true;
    const dz = dh - el.hoog;
    return (du + w / 2) ** 2 + dz * dz <= w * w && (du - w * 1.5) ** 2 + dz * dz <= w * w;
  };
  el.hoogTotaal = top;
  el.teken = (u, h, basis) => {
    const du = u - el.u;
    const dh = h - el.h;
    // omlijsting van gehouwen steen, twee pixels breed
    const kader = binnen(du, dh) ? 0 : binnen(du + 2, dh) || binnen(du - 2, dh) || binnen(du, dh - 2) || binnen(du, dh + 2) ? 1 : -1;
    if (kader < 0) {
      // dorpel
      if (dh >= -3 && dh < 0 && du >= -3 && du < w + 3) {
        UIT.ramp = RAMP.steen;
        UIT.stap = Math.round(dh) === -1 ? basis + 2 : basis;
        return true;
      }
      return false;
    }
    if (kader === 1) {
      UIT.ramp = RAMP.steen;
      UIT.stap = basis + (du < 1 || dh > top - 2 ? 1.5 : -0.5);
      UIT.stap = Math.round(UIT.stap);
      return true;
    }
    // een middenstijl van steen bij een breed raam
    if (w > 18 && Math.abs(du - (w - 1) / 2) < 1.2 && dh < el.hoog + w * 0.4) {
      UIT.ramp = RAMP.steen;
      UIT.stap = basis;
      return true;
    }
    const rand = !binnen(du + 3, dh) || !binnen(du - 3, dh) || !binnen(du, dh + 3) || dh < 3;
    const kleur = glasRuit(du, dh, (el.zaad ?? 3) + 40, el.kleuren || ['gewaad', 'water', 'rood', 'goud'], rand);
    if (!kleur) {
      UIT.ramp = RAMP.ijzer;
      UIT.stap = 1;
      UIT.vlag = VLAG.VAST;
      return true;
    }
    UIT.ramp = RAMP[kleur];
    // hoger in het raam valt meer licht naar buiten
    const licht = 3.6 + (dh / top) * 1.6 + (hash(Math.floor(du / 3), Math.floor(dh / 3), 41) % 3) * 0.3;
    UIT.stap = klem(licht, 1, K.RAMP_LEN[RAMP[kleur]] - 1);
    UIT.vlag = VLAG.GLOEI | VLAG.GLAD;
    return true;
  };
  return el;
}

// Een roosvenster: een rond raam met spaken van steen, glas in lood ertussen en een ster in het
// hart. Op de gevel van de kapel.
function roosvensterElement(o) {
  const el = { soort: 'raam', u: o.u, b: (o.r ?? 10) * 2, h: o.h ?? 90, hoog: (o.r ?? 10) * 2, ...o };
  const r = o.r ?? 10;
  el.teken = (u, h, basis) => {
    const du = u - el.u - r;
    const dh = h - el.h - r;
    const af = Math.hypot(du, dh);
    if (af > r + 2.5) return false;
    if (af > r) {
      UIT.ramp = RAMP.steen;
      UIT.stap = Math.round(basis + (dh > 0 ? 1.5 : -0.5));
      return true;
    }
    const hoek = Math.atan2(dh, du);
    // acht spaken en een ring halverwege
    const spaak = Math.abs(((hoek / (Math.PI / 4) + 8.5) % 1) - 0.5) < 0.13 && af > r * 0.3;
    if (spaak || Math.abs(af - r * 0.62) < 1 || af < r * 0.3) {
      if (af < r * 0.3) {
        // de ster in het midden
        const punt = r * (0.11 + 0.19 * Math.pow(Math.abs(Math.cos((hoek + 1.571) * 2.5)), 2.4));
        if (af < punt) {
          UIT.ramp = RAMP.goud;
          UIT.stap = 5.5 + (af < punt * 0.5 ? 1 : 0);
          UIT.vlag = VLAG.GLOEI | VLAG.GLAD;
          return true;
        }
      }
      UIT.ramp = RAMP.steen;
      UIT.stap = basis - 1;
      return true;
    }
    const sector = Math.floor((hoek + Math.PI) / (Math.PI / 4));
    const ring = af > r * 0.62 ? 1 : 0;
    const kleur = GLAS[hash(sector, ring, (el.zaad ?? 3) + 44) % GLAS.length];
    UIT.ramp = RAMP[kleur];
    UIT.stap = klem(4 + (dh < 0 ? 0.8 : 0), 1, K.RAMP_LEN[RAMP[kleur]] - 1);
    UIT.vlag = VLAG.GLOEI | VLAG.GLAD;
    return true;
  };
  return el;
}

// Een deur onder een rondboog van gehouwen steen: donkere eiken planken met ijzeren banden.
function boogdeurElement(o) {
  const el = { soort: 'deur', u: o.u, b: o.b ?? 22, h: o.h ?? 0, hoog: o.hoog ?? 62, ...o };
  const w = el.b;
  const recht = el.hoog - w / 2; // tot waar de deur recht is
  const binnen = (du, dh) => {
    if (du < 0 || du >= w || dh < 0) return false;
    if (dh <= recht) return true;
    return (du - (w - 1) / 2) ** 2 + (dh - recht) ** 2 <= (w / 2) ** 2;
  };
  el.teken = (u, h, basis) => {
    const du = u - el.u;
    const dh = h - el.h;
    const kader = binnen(du, dh) ? 0 : binnen(du + 3, dh) || binnen(du - 3, dh) || binnen(du, dh - 3) ? 1 : -1;
    if (kader < 0) return false;
    if (kader === 1) {
      // de omlijsting: wigvormige stenen om de boog
      UIT.ramp = RAMP.steen;
      const hoek = Math.atan2(dh - recht, du - (w - 1) / 2);
      const wig = dh > recht ? Math.abs(((hoek / 0.42 + 20) % 1) - 0.5) < 0.12 : Math.floor(dh) % 9 === 0;
      UIT.stap = Math.round(basis + (wig ? -2 : 1.5));
      return true;
    }
    const dui = Math.floor(du);
    const dhi = Math.floor(dh);
    // dagkant links en bovenin
    if (dui < 2 || !binnen(du, dh + 2)) {
      UIT.ramp = RAMP.steen;
      UIT.stap = Math.round(basis - 2.5);
      return true;
    }
    const plank = Math.floor((dui - 2) / 5);
    const inPlank = (dui - 2) % 5;
    UIT.ramp = RAMP.hout;
    let s = 1.8 + (plank % 2 ? -0.3 : 0.3);
    if (inPlank === 0) s = 0.8;
    else if (inPlank === 1) s += 0.6;
    if (hash(dui, Math.floor(dh / 6), 47) % 7 === 0) s -= 0.5;
    // ijzeren banden met nagels, en een ring
    for (const hb of [10, Math.round(recht * 0.72)]) {
      if (dhi >= hb && dhi < hb + 3) {
        UIT.ramp = RAMP.ijzer;
        s = dhi === hb + 2 ? 4.4 : 2.6;
        if (dui % 6 === 3) s = 5.4;
      }
    }
    const rh = Math.hypot(du - (w - 6), dh - recht * 0.55);
    if (rh > 2.2 && rh < 3.4) {
      UIT.ramp = RAMP.ijzer;
      s = dh < recht * 0.55 ? 4.6 : 3;
    }
    UIT.stap = Math.round(s);
    return true;
  };
  return el;
}

// ---------------------------------------------------------------- de kapel

// Het klokkentorentje op de nok: een houten koker met galmgaten waarachter de klok hangt, een
// leien spits en een gouden ster erop. c = [X, Y] in eenheden, zVoet = de voet in pixels.
function klokkentoren(c, zVoet, o = {}) {
  const T = TEGEL;
  const r = o.r ?? 11; // halve breedte in eenheden
  const hoog = o.hoog ?? 30; // hoogte van de koker in pixels
  const spits = o.spits ?? 30; // hoogte van de spits in pixels
  const zTop = zVoet + hoog;
  const vormen = [];
  // de koker met galmgaten
  const kokerTex = (vlak, X, Y, Z) => {
    const h = Z * PXH - zVoet;
    const u = vlak === 'y' ? (X - (c[0] - r)) * SQ : ((c[1] + r) - Y) * SQ;
    const w = r * 2 * SQ;
    if (vlak === 'z') {
      UIT.ramp = RAMP.hout;
      UIT.stap = 3;
      return;
    }
    // het galmgat: een hoge opening met een ronde bovenkant
    const gu = u - w / 2;
    const gw = w * 0.31;
    const go = 6;
    const gh = hoog - 11;
    const inGat = Math.abs(gu) < gw && h > go && (h < gh || gu * gu + (h - gh) ** 2 < gw * gw);
    if (inGat) {
      const donker = vlak === 'y' ? 1 : 0;
      // de klok hangt in het donker: een gouden silhouet
      const bu = gu;
      const bh = h - go - 4;
      const bel = Math.abs(bu) < gw * 0.62 - bh * 0.07 && bh > 0 && bh < 11;
      if (bel && bh < 10) {
        UIT.ramp = RAMP.goud;
        UIT.stap = bh < 2 ? 2 : bu < -gw * 0.15 ? 4.5 : 3;
        return;
      }
      if (Math.abs(bu) < 1 && bh >= 10 && bh < 13) {
        UIT.ramp = RAMP.hout;
        UIT.stap = 2;
        return;
      }
      UIT.ramp = RAMP.inkt;
      UIT.stap = donker ? 1 : 0;
      UIT.vlag = VLAG.VAST;
      return;
    }
    // houten koker: verticale planken met een lijst onder en boven
    const plank = Math.floor(u / 4.5);
    UIT.ramp = RAMP.hout;
    let s = (vlak === 'y' ? 3.4 : 2.2) + (plank % 2 ? 0.3 : -0.3);
    if (u - plank * 4.5 < 0.8) s -= 1.4;
    if (h < 3 || h > hoog - 4) s = vlak === 'y' ? 2 : 1.4;
    UIT.stap = Math.round(s);
  };
  vormen.push(D.blok((c[0] - r) / T, (c[1] - r) / T, (c[0] + r) / T, (c[1] + r) / T, zVoet - 26, zTop, kokerTex, { deel: 20 }));
  // de spits: vier schuine vlakken naar één punt, met leien
  const zPunt = zTop + spits;
  const t = spits / PXH / r; // helling
  const spitsTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const langs = vlak === 'sx' ? (c[1] - Y) * SQ : (X - c[0]) * SQ;
    D.leienPixel(zTop + spits - h, langs * 1.4, vlak === 'sy' ? 4 : 3, 51);
    UIT.stap = Math.round(UIT.stap);
  };
  vormen.push(
    D.vorm(
      [
        { n: [t, 0, 1], d: zPunt / PXH + t * c[0], naam: 'sx' },
        { n: [-t, 0, 1], d: zPunt / PXH - t * c[0], naam: '-' },
        { n: [0, t, 1], d: zPunt / PXH + t * c[1], naam: 'sy' },
        { n: [0, -t, 1], d: zPunt / PXH - t * c[1], naam: '-' },
        { n: [0, 0, -1], d: -(zTop - 2) / PXH, naam: '-' },
      ],
      spitsTex,
      { deel: 21, doos: [c[0] - r - 2, c[1] - r - 2, (zTop - 2) / PXH, c[0] + r + 2, c[1] + r + 2, zPunt / PXH] },
    ),
  );
  return { vormen, ster: { gx: c[0] / T, gy: c[1] / T, z: zPunt / PXH } };
}

// Een gouden ster op een staafje, voor op de spits van de kapel.
function sterSpits(o = {}) {
  const R = o.R ?? 6;
  const mat = [
    { ramp: 'ijzer', lo: 1, hi: 5 },
    { ramp: 'goud', lo: 2.6, hi: 6.8, glans: 1.6, glansMacht: 10 },
  ];
  const d = [F.capsule([0, 0, 0], [0, 0, 9], 0.7, 0, 1)];
  d.push({
    // een platte ster in het vlak x-z, dun in y
    f: (x, y, z) => {
      const dx = x;
      const dz = z - (9 + R * 0.8);
      const a = Math.atan2(dz, dx);
      const r = Math.hypot(dx, dz);
      const punt = R * (0.4 + 0.6 * Math.pow(Math.abs(Math.cos(a * 2.5)), 2.2));
      return Math.max(r - punt, Math.abs(y) - 0.9) * 0.6;
    },
    g: [0, 0, 9 + R * 0.8, R + 1.5],
    m: 1,
    deel: 2,
  });
  return F.model(d, mat, { midden: [0, 0, 9], straal: R + 11 });
}

// De kapel: veldsteen onder leien, spitsboogramen met glas in lood waarachter kaarsen branden,
// een roosvenster boven de deur, en een klokkentorentje op de nok. 2 × 3 tegels, nok langs y:
// de gevel met de deur kijkt naar linksvoor.
function kapel(gx, gy, o = {}) {
  const g = D.huis({
    gx, gy, b: 5, d: 10, nok: 'y', muurH: 152, sokkelH: 20, muur: 'veldsteen', dak: 'leien', zaad: o.zaad ?? 13,
    overstek: 4,
    gevel: {
      y: [boogdeurElement({ u: 54, b: 52, hoog: 104 }), roosvensterElement({ u: 52, h: 176, r: 28 })],
      x: [
        glasraamElement({ u: 30, b: 24, h: 62, hoog: 54 }),
        glasraamElement({ u: 88, b: 24, h: 62, hoog: 54 }),
        glasraamElement({ u: 146, b: 24, h: 62, hoog: 54 }),
        glasraamElement({ u: 204, b: 24, h: 62, hoog: 54 }),
        glasraamElement({ u: 262, b: 24, h: 62, hoog: 54 }),
      ],
    },
    ...o,
  });
  // het torentje staat op de nok, vlak achter de gevel
  const T = TEGEL;
  const nokY = (gy + 0.5) * T;
  const nokX = (gx + o.b0 ?? gx + 0.5) * T;
  const kt = klokkentoren([(gx + 2) * T, nokY], g.hoog - 6, {});
  void nokX;
  g.vormen.push(...kt.vormen);
  g.modellen.push({ model: sterSpits(), gx: kt.ster.gx, gy: kt.ster.gy, z: kt.ster.z, richting: 'ZO' });
  return g;
}


// ---------------------------------------------------------------- het kerkhof

// Steen die verweerd is en mos vangt: onderaan en aan de schaduwkant het meest. Met een
// ingebeitelde tekst op de voorkant (streepjes: de letters zijn niet meer te lezen) en soms een
// ster erboven.
function grafsteenMat(zaad, o = {}) {
  const w = o.w ?? 7;
  const tekstTop = o.tekstTop ?? 22;
  return {
    ramp: 'steen',
    lo: 1.6,
    hi: 6.4,
    patroon: (x, y, z, nx, ny, nz) => {
      const mos = ruis3(x * 0.22, y * 0.22, z * 0.15, zaad + 3) + (z < 7 ? 0.22 : 0) + (ny < -0.4 ? 0.12 : 0) - (nz > 0.7 ? 0.1 : 0);
      if (mos > 0.76) return { ramp: 'mos', stap: mos > 0.88 ? 3 : 2 };
      if (ny > 0.6 && o.tekst !== false) {
        // de ster boven de tekst
        if (o.ster && z > tekstTop + 4 && z < tekstTop + 12) {
          const dz = z - (tekstTop + 8);
          const a = Math.atan2(dz, x);
          const r = Math.hypot(x, dz);
          if (r < 3.4 * (0.4 + 0.6 * Math.pow(Math.abs(Math.cos(a * 2.5)), 2.2))) return { ramp: 'steen', stap: r < 2 ? 2 : 6 };
        }
        const rij = Math.floor((tekstTop - z) / 3.4);
        if (rij >= 0 && rij < 4 && (tekstTop - z) % 3.4 < 1.5 && Math.abs(x) < w * 0.62) {
          if (hash(Math.floor(x * 0.9), rij, zaad + 7) % 4 !== 0) return { ramp: 'steen', stap: 1.6 };
        }
      }
      return ruis3(x * 0.6, y * 0.6, z * 0.5, zaad + 5) > 0.74 ? -0.8 : 0;
    },
  };
}

// Een grafsteen: 'rond' (afgeronde kop), 'punt' (spits), 'ster' (met een ster), 'zuil' (een
// afgebroken zuil) of 'plat' (een liggende zerk). o.scheef kantelt hem zoveel graden: de
// aardschok heeft de helft scheef gezet.
function grafsteen(zaad = 1, o = {}) {
  const soort = o.soort || ['rond', 'punt', 'ster', 'rond', 'zuil', 'punt', 'plat'][zaad % 7];
  const R = (i) => rnd(zaad, i, 71);
  const w = 6.5 + R(1) * 2.5;
  const t = 2.2 + R(2) * 0.8;
  const h = soort === 'plat' ? 3 : 20 + R(3) * 11;
  const mat = [grafsteenMat(zaad, { w, tekstTop: h - (soort === 'zuil' ? 14 : 9), ster: soort === 'ster', tekst: soort !== 'zuil' })];
  const d = [];
  if (soort === 'plat') {
    d.push(F.blok([0, 0, 1.4], [w * 1.2, w * 1.7, 1.4], 0.7, 0, 1));
  } else if (soort === 'zuil') {
    const rz = w * 0.55;
    const breuk = h * (0.55 + R(4) * 0.25);
    d.push({
      f: (x, y, z) => {
        const cil = sdf.cilinder(x, y, z, rz, 0, breuk);
        const vlak = (z - breuk + x * 0.35 + y * 0.2 + ruis3(x * 0.5, y * 0.5, 0, zaad) * 1.6) * 0.8;
        return Math.max(cil, vlak);
      },
      g: [0, 0, breuk / 2, rz + breuk],
      m: 0,
      deel: 1,
    });
    d.push(F.blok([0, 0, 1.6], [rz + 1.8, rz + 1.8, 1.6], 0.5, 0, 1));
  } else {
    const kop = soort === 'rond' ? w : 0;
    d.push({
      f: (x, y, z) => {
        if (soort === 'rond') return sdf.doos(x, y, z - (h - kop) / 2, w, t, (h - kop) / 2, 0.6);
        const punt = (Math.abs(x) * 1.15 + z - (h - w * 0.75)) * 0.65;
        return Math.max(sdf.doos(x, y, z - h / 2, w, t, h / 2, 0.6), punt);
      },
      g: [0, 0, h / 2, Math.hypot(w, h / 2) + 1],
      m: 0,
      deel: 1,
    });
    if (soort === 'rond') d.push(F.capsule([0, -t + 0.7, h - kop], [0, t - 0.7, h - kop], w, 0, 1, 0.4));
    // een barst van de aardschok
    if (zaad % 3 === 0) {
      const bz = h * (0.35 + R(5) * 0.3);
      const hel = 0.3 + R(6) * 0.4;
      d.push({
        f: (x, y, z) => {
          const lijn = Math.abs(z - bz - x * hel - Math.sin(x * 0.8) * 0.8) - 0.5;
          return Math.max(lijn, Math.abs(y) - t - 1.4, Math.abs(x) - w - 1);
        },
        g: [0, 0, bz, w + h * 0.4],
        m: 0,
        deel: 1,
        uit: true,
      });
    }
  }
  let m = F.model(d, mat, { midden: [0, 0, h / 2], straal: Math.hypot(w * 1.7, h) + 2 });
  if (o.scheef) m = F.gekanteld(m, [Math.cos(o.scheefHoek ?? 0.4), Math.sin(o.scheefHoek ?? 0.4), 0], o.scheef, [0, 0, 0]);
  return m;
}

// De tombe van de oude meester: een zerk op twee treden, met op het deksel een gehouwen toren met
// een gouden ster erop. In de zijkanten een rij nissen, en mos in de voegen.
function tombe(zaad = 9) {
  const M = { steen: 0, toren: 1, goud: 2 };
  const mat = [];
  mat[M.steen] = {
    ramp: 'steen',
    lo: 1.8,
    hi: 6.8,
    patroon: (x, y, z, nx, ny, nz) => {
      const mos = ruis3(x * 0.2, y * 0.2, z * 0.14, zaad) + (z < 6 ? 0.25 : 0);
      if (mos > 0.79) return { ramp: 'mos', stap: 2.5 };
      if (Math.abs(ny) > 0.6 && z > 10 && z < 24) {
        const n = (((x + 60) % 11) + 11) % 11 - 5.5;
        if (Math.abs(n) < 3.4 && z < 22) return -1.8 + (n < -1.5 ? 0.8 : 0);
      }
      if (Math.abs(nx) > 0.6 && z > 10 && z < 24) {
        const n = (((y + 60) % 11) + 11) % 11 - 5.5;
        if (Math.abs(n) < 3.4 && z < 22) return -1.8 + (n < -1.5 ? 0.8 : 0);
      }
      return ruis3(x * 0.5, y * 0.5, z * 0.5, zaad + 2) > 0.76 ? -0.8 : 0;
    },
  };
  mat[M.toren] = {
    ramp: 'steen',
    lo: 2.4,
    hi: 7.2,
    patroon: (x, y, z, nx, ny, nz) => {
      if (nz > 0.6) return 0;
      const a = (Math.atan2(y, x) / (Math.PI * 2)) * 9;
      const rij = Math.floor((z - 27) / 3.2);
      const f = a + (rij % 2) * 0.5;
      if (z > 32 && z < 52 && y > 0 && Math.abs(x) < 1.5 && z < 44 && z > 38) return { ramp: 'inkt', stap: 1 };
      if (f - Math.floor(f) < 0.1 || (z - 27) % 3.2 < 0.5) return -1.6;
      return 0;
    },
  };
  mat[M.goud] = { ramp: 'goud', lo: 2.6, hi: 6.8, glans: 1.8, glansMacht: 10 };
  const d = [];
  d.push(F.blok([0, 0, 2.2], [26, 17, 2.2], 0.8, M.steen, 1));
  d.push(F.blok([0, 0, 6], [22.5, 14, 3.8], 0.8, M.steen, 1));
  d.push(F.blok([0, 0, 17], [19, 11.5, 7.5], 1, M.steen, 2));
  d.push(F.blok([0, 0, 25.5], [20.5, 13, 1.6], 0.8, M.steen, 2));
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 6.5, 27, 53), g: [0, 0, 40, 28], m: M.toren, deel: 3 });
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 7.6, 51, 53.5), g: [0, 0, 52, 9], m: M.toren, deel: 3 });
  d.push(F.kegel([0, 0, 53.5], [0, 0, 65], 7.4, 0.6, M.steen, 3));
  d.push(F.capsule([0, 0, 64], [0, 0, 70], 0.6, M.goud, 4));
  d.push({
    f: (x, y, z) => {
      const dz = z - 74.5;
      const a = Math.atan2(dz, x);
      const r = Math.hypot(x, dz);
      const punt = 5.6 * (0.4 + 0.6 * Math.pow(Math.abs(Math.cos(a * 2.5)), 2.2));
      return Math.max(r - punt, Math.abs(y) - 0.9) * 0.6;
    },
    g: [0, 0, 74.5, 7],
    m: M.goud,
    deel: 4,
  });
  return F.model(d, mat, { midden: [0, 0, 32], straal: 54 });
}

// Het smeedijzeren hek in de poort: spijlen met speerpunten tussen twee stijlen; de rechter
// vleugel staat op een kier.
function kerkhofhek(o = {}) {
  const mat = [{ ramp: 'ijzer', lo: 0.8, hi: 5, glans: 0.8 }];
  const d = [];
  const H = o.hoog ?? 30;
  const halfB = (o.breed ?? 34) / 2;
  const vleugel = (x0, x1, hoek) => {
    const ca = Math.cos(hoek);
    const sa = Math.sin(hoek);
    const p = (x) => [x0 + (x - x0) * ca, (x - x0) * sa];
    const n = Math.max(2, Math.round(Math.abs(x1 - x0) / 4.6));
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const [px, py] = p(x);
      const dik = i === 0 || i === n ? 1.3 : 0.75;
      const h = H - (i === 0 || i === n ? 0 : 3);
      d.push(F.capsule([px, py, 1], [px, py, h], dik, 0, 1));
      d.push(F.kegel([px, py, h], [px, py, h + 3.4], dik, 0.2, 0, 1));
    }
    for (const z of [7, H - 6]) {
      const [ax, ay] = p(x0);
      const [bx, by] = p(x1);
      d.push(F.capsule([ax, ay, z], [bx, by, z], 0.7, 0, 1));
    }
  };
  vleugel(-halfB, -0.5, 0);
  vleugel(halfB, 0.5, -(o.kier ?? 0.55));
  return F.model(d, mat, { midden: [0, 5, H / 2], straal: halfB + H });
}

// Het kerkhof: een laag muurtje van veldsteen met dekstenen om een stuk gras, een poort met twee
// pijlers, en daarbinnen de graven, met de tombe van de oude meester het verst van de poort.
function kerkhof(gx, gy, o = {}) {
  const T = TEGEL;
  const b = o.b ?? 4;
  const d = o.d ?? 3;
  const x0 = (gx - 0.5) * T;
  const x1 = (gx + b - 0.5) * T;
  const y0 = (gy - 0.5) * T;
  const y1 = (gy + d - 0.5) * T;
  const zaad = o.zaad ?? 17;
  const H = o.muurH ?? 17;
  const dik = 5;
  const vormen = [];
  const modellen = [];
  const muurTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    if (vlak === 'z') {
      const u = (((X - Y) * SQ) % 9 + 9) % 9;
      UIT.ramp = RAMP.steen;
      UIT.stap = u < 0.9 ? 3 : 6.5;
      return;
    }
    const u = vlak === 'y' ? (X - x0) * SQ : (y1 - Y) * SQ;
    D.veldsteenPixel(u, h + 40, 9999, vlak === 'y' ? 5 : 3.5, zaad + 11, false);
    if (h < 5 && ruis2(u * 0.12, h * 0.2, zaad) > 0.55) {
      UIT.ramp = RAMP.mos;
      UIT.stap = 2;
    }
  };
  const poortU = (o.poort ?? 0.5) * (x1 - x0);
  const poortB = 22;
  for (const [a, e] of [[x0, x0 + poortU - poortB / 2], [x0 + poortU + poortB / 2, x1]]) {
    if (e - a > 2) vormen.push(D.blok(a / T, (y1 - dik) / T, e / T, y1 / T, 0, H, muurTex, { deel: 30 }));
  }
  vormen.push(D.blok(x0 / T, y0 / T, x1 / T, (y0 + dik) / T, 0, H, muurTex, { deel: 30 }));
  vormen.push(D.blok(x0 / T, y0 / T, (x0 + dik) / T, y1 / T, 0, H, muurTex, { deel: 30 }));
  vormen.push(D.blok((x1 - dik) / T, y0 / T, x1 / T, y1 / T, 0, H, muurTex, { deel: 30 }));
  const pijlerTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    if (vlak === 'z') {
      UIT.ramp = RAMP.steen;
      UIT.stap = 7;
      return;
    }
    const u = vlak === 'y' ? X * SQ : -Y * SQ;
    if (h > H + 9) {
      UIT.ramp = RAMP.steen;
      UIT.stap = vlak === 'y' ? 6.5 : 5;
      return;
    }
    D.veldsteenPixel(u, h + 90, 9999, vlak === 'y' ? 5.5 : 4, zaad + 13, false);
  };
  for (const px of [x0 + poortU - poortB / 2 - 4, x0 + poortU + poortB / 2 + 4]) {
    vormen.push(D.blok((px - 5) / T, (y1 - dik - 1) / T, (px + 5) / T, (y1 + 1) / T, 0, H + 13, pijlerTex, { deel: 31 }));
  }
  modellen.push({ model: kerkhofhek({ breed: poortB + 8, hoog: H + 8 }), gx: (x0 + poortU) / T, gy: (y1 - dik / 2) / T, richting: 'ZW', z: 0 });
  // de graven: een rooster met speling; het pad vanaf de poort blijft vrij
  const nx = o.rijen ?? 3;
  const ny = o.kol ?? 3;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const h = hash(i, j, zaad + 19);
      const X = x0 + 18 + ((x1 - x0 - 36) * i) / Math.max(1, nx - 1) + ((h % 100) / 100 - 0.5) * 9;
      const Y = y0 + 20 + ((y1 - y0 - 40) * j) / Math.max(1, ny - 1) + (((h >>> 8) % 100) / 100 - 0.5) * 9;
      if (Math.abs(X - (x0 + poortU)) < 14 && j >= ny - 1) continue;
      if (o.tombe !== false && i === 0 && j === 0) continue;
      const scheef = (h >>> 16) % 4 === 0;
      modellen.push({
        model: grafsteen(h % 97, { scheef: scheef ? 7 + ((h >>> 20) % 9) : 0, scheefHoek: ((h >>> 24) % 100) / 16 }),
        gx: X / T,
        gy: Y / T,
        richting: (h >>> 12) % 7 === 0 ? 'Z' : 'ZO',
        z: 0,
      });
    }
  }
  if (o.tombe !== false) modellen.push({ model: tombe(zaad), gx: (x0 + 26) / T, gy: (y0 + 22) / T, richting: 'ZO', z: 0 });
  return { vormen, modellen, lichten: [], bloembakken: [], voet: [x0, y0, x1, y1], hoog: H };
}


// ---------------------------------------------------------------- hulpjes

// een liggende cilinder langs de y-as (een as, een naaf, een rol)
function yCilinder(c, r, half, m, deel) {
  return {
    f: (x, y, z) => {
      const dr = Math.hypot(x - c[0], z - c[2]) - r;
      const dy = Math.abs(y - c[1]) - half;
      return Math.min(Math.max(dr, dy), 0) + Math.hypot(Math.max(dr, 0), Math.max(dy, 0));
    },
    g: [c[0], c[1], c[2], Math.hypot(r, half) + 0.5],
    m,
    deel,
  };
}

// Klimop tegen een muur: dichte blaadjes onderaan, rafelig naar boven, met ranken ertussen.
function klimopElement(o) {
  const el = { soort: 'klimop', u: o.u, b: o.b ?? 30, h: o.h ?? 0, hoog: o.hoog ?? 60, zaad: o.zaad ?? 1, ...o };
  el.teken = (u, h) => {
    const du = u - el.u;
    const dh = h - el.h;
    if (du < -1 || du >= el.b + 1 || dh < 0 || dh >= el.hoog) return false;
    const rand = Math.min(du + 1, el.b - du, 3) / 3;
    const dicht = (1 - dh / el.hoog) * 0.8 + ruis2(du * 0.18, dh * 0.18, el.zaad + 61) * 0.75 + rand * 0.35 - 0.62;
    const blad = ruis2(du * 0.7, dh * 0.7, el.zaad + 63);
    if (dicht + blad * 0.45 > 0.55) {
      UIT.ramp = RAMP.blad;
      const hb = hash(Math.floor(du), Math.floor(dh), el.zaad + 65) % 9;
      UIT.stap = hb === 0 ? 2 : hb < 3 ? 5 : hb < 6 ? 4 : 3;
      return true;
    }
    // een enkele rank die verder omhoog kruipt
    if (dicht > 0.1 && Math.abs(Math.sin(dh * 0.5 + el.zaad) * 3 + el.b / 2 - du) < 0.7) {
      UIT.ramp = RAMP.blad;
      UIT.stap = 2;
      return true;
    }
    return false;
  };
  return el;
}

// ---------------------------------------------------------------- de watermolen

// Het rad: twee velgen met spaken, een naaf en twaalf schoepen. De as ligt langs de lokale y, dus
// met richting 'ZO' draait het rad in het vlak van de wand die naar +x kijkt. Alles onder het
// water is weggesneden (o.waterZ, in pixels onder de grond).
function molenrad(o = {}) {
  const R = o.R ?? 30;
  const br = o.breed ?? 15;
  const cz = o.cz ?? R - 6; // het hart van het rad boven de grond
  const M = { hout: 0, ijzer: 1 };
  const mat = [];
  const nat = (z) => z < 12; // onderin nat en groen van het slijm
  mat[M.hout] = {
    ramp: 'hout',
    lo: 1,
    hi: 5.4,
    patroon: (x, y, z) => {
      if (nat(z) && ruis3(x * 0.2, y * 0.2, z * 0.2, 5) > 0.5) return { ramp: 'mos', stap: 2.5 };
      return Math.sin((x + y) * 0.4 + ruis3(x * 0.2, y * 0.2, z * 0.5, 7) * 5) > 0.8 ? -0.8 : 0;
    },
  };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 0.8, hi: 5, glans: 0.8 };
  const d = [];
  const velg = (y0) => {
    d.push({
      f: (x, y, z) => sdf.torus(x, z - cz, y - y0, R, 1.7),
      g: [0, y0, cz, R + 3],
      m: M.hout,
      deel: 1,
    });
    d.push({
      f: (x, y, z) => sdf.torus(x, z - cz, y - y0, R - 6.5, 1.3),
      g: [0, y0, cz, R + 3],
      m: M.hout,
      deel: 1,
    });
  };
  velg(-br / 2 + 1);
  velg(br / 2 - 1);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.2;
    for (const y0 of [-br / 2 + 1, br / 2 - 1]) d.push(F.capsule([0, y0, cz], [Math.cos(a) * (R - 1), y0, cz + Math.sin(a) * (R - 1)], 1.1, M.hout, 1));
  }
  d.push(yCilinder([0, 0, cz], 4.2, br / 2 + 1, M.hout, 2));
  d.push(yCilinder([0, 0, cz], 1.8, br / 2 + 14, M.ijzer, 2));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    d.push({
      f: (x, y, z) => {
        const dz = z - cz;
        const rx = x * ca + dz * sa;
        const rz = -x * sa + dz * ca;
        return sdf.doos(rx - (R - 3.6), y, rz, 4.4, br / 2 - 0.4, 1.1, 0.4);
      },
      g: [ca * (R - 3.6), 0, cz + sa * (R - 3.6), 8 + br / 2],
      m: M.hout,
      deel: 3,
    });
  }
  // alles onder de waterlijn weg
  if (o.waterZ !== undefined) d.push({ f: (x, y, z) => z - o.waterZ, m: M.hout, deel: 1, uit: true });
  return F.model(d, mat, { midden: [0, 0, cz], straal: R + 8 });
}

// De molensteen die bij de aardschok in tweeën brak: de ene helft ligt plat, de andere leunt
// ertegenaan. Op het loopvlak de kerven die het koren malen.
function molensteen(zaad = 3) {
  const R = 18;
  const dik = 5.5;
  const cz = R * 0.52; // het hart van de staande helft
  const lean = 0.2;
  const mat = [
    {
      ramp: 'steen',
      lo: 1.6,
      hi: 6.6,
      patroon: (x, y, z, nx, ny, nz) => {
        // de kerven op het loopvlak: stralen vanuit het hart, met een lichte rand
        let a = null;
        let r = null;
        if (nz > 0.6) {
          const dy = y - 9;
          a = Math.atan2(dy, x) + Math.hypot(x, dy) * 0.035;
          r = Math.hypot(x, dy);
        } else if (Math.abs(ny) > 0.6) {
          const dz = (z - cz) / Math.cos(lean);
          a = Math.atan2(dz, x) + Math.hypot(x, dz) * 0.035;
          r = Math.hypot(x, dz);
        }
        if (a !== null && r > 5.5) {
          const k = (((a / (Math.PI * 2)) * 14) % 1 + 1) % 1;
          if (k < 0.16) return -1.8;
          if (k < 0.28) return 0.7;
        }
        const mos = ruis3(x * 0.18, y * 0.18, z * 0.18, zaad) + (z < 4 ? 0.2 : 0);
        if (mos > 0.82) return { ramp: 'mos', stap: 2.5 };
        return ruis3(x * 0.5, y * 0.5, z * 0.5, zaad + 2) > 0.74 ? -0.8 : 0;
      },
    },
  ];
  const d = [];
  // de helft die plat ligt: een halve schijf met het vierkante gat, de breuk grillig
  d.push({
    f: (x, y, z) => {
      const dy = y - 9;
      const schijf = sdf.cilinder(x, dy, z, R, 0, dik);
      const gat = -Math.max(Math.abs(x) - 3.6, Math.abs(dy) - 3.6);
      const breuk = -(dy + 1.5) + Math.sin(x * 0.32) * 1.3 + ruis2(x * 0.3, 0, zaad) * 1.4;
      return Math.max(schijf, gat, breuk * 0.8);
    },
    g: [0, 9, dik / 2, R + 4],
    m: 0,
    deel: 1,
  });
  // de andere helft staat rechtop, iets achterover, met de breuk naar beneden
  d.push({
    f: (x, y, z) => {
      const dy = y + 7;
      const dz = z + 1;
      const ry = dy * Math.cos(lean) - dz * Math.sin(lean);
      const rz = dy * Math.sin(lean) + dz * Math.cos(lean);
      const schijf = Math.max(Math.hypot(x, rz - cz) - R, Math.abs(ry) - dik / 2);
      const gat = -Math.max(Math.abs(x) - 3.6, Math.abs(rz - cz) - 3.6);
      const breuk = -(rz - 1) + Math.sin(x * 0.32 + 1) * 1.3;
      return Math.max(schijf, gat, breuk * 0.8) * 0.9;
    },
    g: [0, -7, cz, R + 6],
    m: 0,
    deel: 2,
  });
  return F.model(d, mat, { midden: [0, 1, cz * 0.7], straal: R + 16 });
}

// De watermolen aan de beek: een stenen onderbouw met een vakwerk bovenverdieping, een hijsluik
// met een balk onder een kapje, en het rad aan de kant van het water. o.radVlak: 'x' (het rad
// tegen de wand die naar +x kijkt) of 'y'.
function watermolen(gx, gy, o = {}) {
  const T = TEGEL;
  const radVlak = o.radVlak || 'x';
  const g = D.huis({
    gx, gy, b: 6, d: 8, nok: 'y', dak: 'spanen', sokkelH: 18, zaad: o.zaad ?? 23,
    verdiepingen: [
      {
        muur: 'veldsteen', hoog: 104,
        gevel: {
          y: [D.raamElement({ u: 36, b: 24, h: 48, hoog: 30, lijst: 'hout', dorpel: 'steen', donker: true }), D.raamElement({ u: 122, b: 24, h: 48, hoog: 30, lijst: 'hout', dorpel: 'steen', donker: true })],
          x: [
            D.deurElement({ u: 44, b: 46, hoog: 94, ramp: 'hout' }),
            D.raamElement({ u: 128, b: 24, h: 48, hoog: 30, lijst: 'hout', dorpel: 'steen' }),
            D.raamElement({ u: 196, b: 24, h: 48, hoog: 30, lijst: 'hout', dorpel: 'steen', leeg: true }),
          ],
        },
      },
      {
        muur: 'vakwerk', pleister: 'bot', hoog: 88,
        gevel: {
          y: [D.raamElement({ u: 34, b: 22, h: 132, hoog: 26 }), D.raamElement({ u: 122, b: 22, h: 132, hoog: 26 })],
          x: [D.raamElement({ u: 40, b: 22, h: 132, hoog: 26, luiken: 'hout' }), D.raamElement({ u: 122, b: 22, h: 132, hoog: 26, luiken: 'hout' }), D.raamElement({ u: 200, b: 22, h: 132, hoog: 26, luiken: 'hout', leeg: true })],
        },
      },
    ],
    dakkapellen: [{ t: 0.5, b: 40, hoog: 40, element: D.deurElement({ u: 8, b: 24, h: 2, hoog: 32, ramp: 'hout', stoep: false }) }],
    schoorsteen: { t: 0.84, c: -4, hoog: 26, r: 10, rook: o.rook !== false },
    bord: { vlak: 'x', u: 92, h: 104, verdieping: 0, teken: 'schoof', bordRamp: 'jas' },
    ...o,
  });
  // het rad tegen de gekozen wand, half in het water
  const x1 = (gx + 5.5) * T;
  const y1 = (gy + 7.5) * T;
  const waterZ = -(o.diep ?? 7) / PXH;
  const rad = molenrad({ waterZ, R: o.R ?? 44, breed: 20 });
  if (radVlak === 'x') g.modellen.push({ model: rad, gx: (x1 + 12) / T, gy: gy + 4.6, richting: 'ZO', z: 0 });
  else g.modellen.push({ model: rad, gx: gx + 2.6, gy: (y1 + 12) / T, richting: 'ZW', z: 0 });
  if (o.molensteen !== false) g.modellen.push({ model: molensteen(3), gx: gx + (radVlak === 'x' ? -1.6 : 7), gy: gy + (radVlak === 'x' ? 7 : -1.6), richting: 'ZO', z: 0 });
  g.rad = radVlak === 'x' ? { x: (x1 + 12) / T, y: gy + 4.6 } : { x: gx + 2.6, y: (y1 + 12) / T };
  return g;
}

// De schuur: geen klein huisje maar een half ingegraven loods. De muren zijn maar een steek
// hoog, het rieten dak zakt tot vlak boven de grond, en in de gevel zit een gemetselde boogdeur.
// 6 × 9 tegels, nok langs y: de boogdeur kijkt naar de kijker.
function schuur(gx, gy, o = {}) {
  const b = o.b ?? 6;
  const d = o.d ?? 9;
  return D.huis({
    gx, gy, b, d, nok: 'y', muurH: o.muurH ?? 54, sokkelH: o.sokkelH ?? 40,
    muur: o.muur ?? 'veldsteen', dak: o.dak ?? 'riet', dakOud: o.dakOud ?? true, dakMos: o.dakMos ?? 0.5,
    windveer: o.windveer ?? true, overstek: o.overstek ?? 26, zaad: o.zaad ?? 61,
    gevel: {
      y: [
        boogdeurElement({ u: Math.round((b * 32 - 60) / 2), b: 60, hoog: 46 }),
        D.raamElement({ u: 12, b: 18, h: 96, hoog: 20, kol: 2, rijen: 1, leeg: true }),
      ],
      x: [D.raamElement({ u: Math.round(d * 16 - 10), b: 20, h: 22, hoog: 18, kol: 2, rijen: 1, leeg: true })],
    },
    ...o,
  });
}

// ---------------------------------------------------------------- de bakkerij

// Een toonbank onder het luik: het luik klapt naar beneden en daar ligt het brood.
function broodplank(zaad = 1) {
  const M = { hout: 0, brood: 1, korf: 2 };
  const mat = [];
  mat[M.hout] = { ramp: 'hout', lo: 1.2, hi: 5.4, patroon: (x, y, z) => (((x + 40) % 5) < 0.6 ? -1.4 : 0) };
  mat[M.brood] = {
    ramp: 'zand',
    lo: 2.2,
    hi: 7.4,
    patroon: (x, y, z, nx, ny, nz) => (nz > 0.5 && Math.abs(Math.sin(x * 1.3 + y * 0.6)) < 0.22 ? -1.4 : 0),
  };
  mat[M.korf] = { ramp: 'stro', lo: 1.6, hi: 5.6, patroon: (x, y, z) => (Math.sin(Math.atan2(y, x) * 9) > 0.4 ? -0.8 : 0) };
  const d = [];
  d.push(F.blok([0, 3, 1], [17, 6, 1], 0.4, M.hout, 1));
  // een mand met broden en twee losse broden
  d.push({ f: (x, y, z) => Math.max(sdf.cilinder(x + 8, y - 2, z - 2, 6.5, 0, 4.5), -sdf.cilinder(x + 8, y - 2, z - 1, 5.2, 0, 9)), g: [-8, 2, 4, 9], m: M.korf, deel: 2 });
  for (const [x, y, a] of [[-9, 1, 0.3], [-6.5, 3.5, -0.4], [7, 2, 0.2], [11.5, 4, -0.6]]) {
    d.push({
      f: (px, py, pz) => {
        const dx = px - x;
        const dy = py - y;
        return sdf.ellipsoide(dx * Math.cos(a) + dy * Math.sin(a), -dx * Math.sin(a) + dy * Math.cos(a), pz - 5, 4.6, 2.6, 2.4);
      },
      g: [x, y, 5, 6],
      m: M.brood,
      deel: 3,
    });
  }
  return F.model(d, mat, { midden: [0, 3, 3], straal: 22 });
}

// De bakkerij: vakwerk met een pannendak, een brede bakoven tegen de zijgevel met een gloeiende
// ovenmond, een uitklapluik met brood eronder, en een krakeling aan het uithangbord.
function bakkerij(gx, gy, o = {}) {
  const T = TEGEL;
  const g = D.huis({
    gx, gy, b: 8, d: 6, nok: 'x', muurH: 118, sokkelH: 16, muur: 'planken', hout: 'hout', dak: 'spanen', zaad: o.zaad ?? 29,
    gevel: {
      y: [
        D.raamElement({ u: 28, b: 44, h: 58, hoog: 30, kol: 4, lijst: 'pleister' }),
        D.deurElement({ u: 110, b: 48, hoog: 96, ramp: 'hout', raampje: true }),
        D.raamElement({ u: 190, b: 26, h: 58, hoog: 30, luiken: 'rood', bloembak: true }),
      ],
      x: [
        D.raamElement({ u: 40, b: 24, h: 58, hoog: 28, luiken: 'rood' }),
        D.raamElement({ u: 116, b: 24, h: 58, hoog: 28, leeg: true }),
        D.raamElement({ u: 84, b: 20, h: 148, hoog: 22, rijen: 1 }),
      ],
    },
    schoorsteen: { t: 0.25, c: -3, hoog: 24, r: 10, rook: false },
    bord: { vlak: 'y', u: 88, h: 112, teken: 'krakeling', bordRamp: 'jas' },
    ...o,
  });
  // de bakoven tegen de zijgevel (de wand die naar +x kijkt)
  const x1 = (gx + 7.5) * T;
  const y0 = (gy - 0.5) * T;
  const y1 = (gy + 5.5) * T;
  const oy0 = y0 + 46;
  const oy1 = y0 + 100;
  const ovenTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    if (vlak === 'z') {
      UIT.ramp = RAMP.steen;
      UIT.stap = 4;
      return;
    }
    const u = vlak === 'y' ? X * SQ : (oy1 - Y) * SQ;
    // de ovenmond in de kant die naar de straat kijkt
    if (vlak === 'y' && h < 34) {
      const du = u - (x1 + 8) * SQ;
      const boog = Math.abs(du) < 7 && h > 4 && (h < 20 || du * du + (h - 20) ** 2 < 49);
      if (boog) {
        const diep = Math.abs(du) > 5 || h < 6;
        UIT.ramp = diep ? RAMP.inkt : RAMP.vuur;
        UIT.stap = diep ? 1 : klem(2 + (20 - h) * 0.18 + (hash(Math.floor(du), Math.floor(h), 67) % 3) * 0.5, 1, 6);
        UIT.vlag = diep ? VLAG.VAST : VLAG.GLOEI | VLAG.GLAD;
        return;
      }
    }
    D.baksteenPixel(u, h, vlak === 'y' ? 4.5 : 3, 'rood');
  };
  g.vormen.push(D.blok(x1 / T, oy0 / T, (x1 + 22) / T, oy1 / T, 0, 56, ovenTex, { deel: 40 }));
  g.vormen.push(D.blok((x1 + 1) / T, (oy0 + 9) / T, (x1 + 16) / T, (oy1 - 9) / T, 56, 158, ovenTex, { deel: 40 }));
  g.vormen.push(
    D.blok((x1 - 0.5) / T, (oy0 + 7.5) / T, (x1 + 17.5) / T, (oy1 - 7.5) / T, 158, 162, (vlak) => {
      UIT.ramp = RAMP.steen;
      UIT.stap = vlak === 'z' ? 6.5 : vlak === 'y' ? 6 : 4;
    }, { deel: 40 }),
  );
  g.lichten.push({ pos: [x1 + 24, (oy0 + oy1) / 2, 18 / PXH], r: 110, sterk: 2.4, warm: 1, val: 1.3, zacht: 0.5 });
  if (o.rook !== false) g.modellen.push({ model: D.rook(31), gx: (x1 + 8) / T, gy: (oy0 + oy1) / 2 / T, richting: 'N', z: 166 / PXH, omlijn: false, schaduw: false });
  // het uitklapluik met brood, onder het brede raam
  g.modellen.push({ model: broodplank(), gx: gx - 0.5 + 50 / 32, gy: y1 / T + 0.12, richting: 'ZW', z: 56 / PXH });
  return g;
}

// ---------------------------------------------------------------- het prikbord

// Het prikbord op het plein: twee palen, een bord van planken onder een afdakje, en daarop de
// briefjes met de opdrachten: perkament met krabbels, een enkele met een rood zegel.
function prikbord(zaad = 5) {
  const M = { paal: 0, bord: 1, dak: 2, brief: 3, zegel: 4, spijker: 5 };
  const mat = [];
  mat[M.paal] = { ramp: 'hout', lo: 1, hi: 5, patroon: (x, y, z) => (Math.sin(z * 0.5 + x) > 0.85 ? -0.7 : 0) };
  mat[M.bord] = { ramp: 'hout', lo: 1.4, hi: 5.6, patroon: (x, y, z) => (((x + 30) % 7) < 0.7 ? -1.6 : 0) };
  mat[M.dak] = { ramp: 'hout', lo: 1.2, hi: 5.2, patroon: (x, y, z) => (((x + 30) % 5) < 0.6 ? -1.4 : 0) };
  mat[M.brief] = {
    ramp: 'perkament',
    lo: 2.6,
    hi: 6.8,
    patroon: (x, y, z, nx, ny, nz) => {
      if (ny < 0.5) return 0;
      // regels krabbels
      const rij = Math.floor((z + 60) / 2.6);
      if ((z + 60) % 2.6 < 1 && hash(Math.floor(x * 1.2), rij, zaad) % 4 !== 0) return -2.2;
      return 0;
    },
  };
  mat[M.zegel] = { ramp: 'rood', lo: 2, hi: 6, glans: 1 };
  mat[M.spijker] = { ramp: 'ijzer', lo: 2, hi: 5.6, glans: 1.4 };
  const d = [];
  for (const sx of [-15, 15]) d.push(F.blok([sx, 0, 22], [2.2, 2.2, 22], 0.5, M.paal, 1));
  d.push(F.blok([0, 0, 40], [17, 1.6, 15], 0.5, M.bord, 2));
  // het afdakje
  d.push(D.kantelBlok([0, -3.4, 58.5], [19, 6, 1], 22, 0.4, M.dak, 3));
  d.push(D.kantelBlok([0, 3.4, 58.5], [19, 6, 1], -22, 0.4, M.dak, 3));
  // de briefjes
  const brieven = [
    [-8.5, 46, 6.5, 8, 0.1],
    [2, 48, 5.5, 7, -0.16],
    [9, 38, 5, 6.5, 0.2],
    [-5, 33, 4.5, 5.5, -0.08],
  ];
  brieven.forEach(([x, z, w, hh, a], i) => {
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    d.push({
      f: (px, py, pz) => {
        const dx = px - x;
        const dz = pz - z;
        return sdf.doos(dx * ca + dz * sa, py - 1.9, -dx * sa + dz * ca, w, 0.4, hh, 0.2);
      },
      g: [x, 1.9, z, Math.hypot(w, hh) + 1],
      m: M.brief,
      deel: 4 + i,
    });
    d.push(F.bol([x + (i % 2 ? 1.5 : -1.5), 2.5, z + hh - 1.4], 0.8, M.spijker, 4 + i));
    if (i === 1) d.push(F.bol([x + 2.5, 2.6, z - hh + 2], 1.5, M.zegel, 4 + i));
  });
  return F.model(d, mat, { midden: [0, 0, 40], straal: 34 });
}

// ---------------------------------------------------------------- de kruidenhut

// Een ketel op drie poten boven een vuurtje, met een groen brouwsel dat licht geeft.
function ketel(zaad = 1) {
  const M = { ijzer: 0, brouw: 1, vuur: 2, hout: 3 };
  const mat = [];
  mat[M.ijzer] = { ramp: 'ijzer', lo: 0.6, hi: 4.4, glans: 1 };
  mat[M.brouw] = {
    ramp: 'slijm',
    gloei: (x, y, z, kijk) => klem(4 + 2.4 * kijk + ruis3(x * 0.5, y * 0.5, z, zaad) * 1.4, 3, 7),
  };
  mat[M.vuur] = { ramp: 'vuur', gloei: (x, y, z, kijk) => klem(3.6 + 2.6 * kijk, 2, 7) };
  mat[M.hout] = { ramp: 'hout', lo: 1, hi: 4 };
  const d = [];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    d.push(F.capsule([Math.cos(a) * 6, Math.sin(a) * 6, 0], [Math.cos(a) * 4.5, Math.sin(a) * 4.5, 9], 1.1, M.ijzer, 1));
  }
  // het vuurtje eronder
  for (const [x, y, a] of [[-3, 1, 0.4], [2, -2, 1.9], [1, 2.5, 2.8]]) d.push(F.capsule([x, y, 1.4], [x + Math.cos(a) * 5, y + Math.sin(a) * 5, 1.4], 1.2, M.hout, 2));
  d.push(F.ellips([0, 0, 3.4], [4.2, 4.2, 3], M.vuur, 2));
  // de buik van de ketel
  d.push({
    f: (x, y, z) => Math.max(sdf.ellipsoide(x, y, z - 15.5, 10, 10, 8.5), -(z - 15)),
    g: [0, 0, 15.5, 14],
    m: M.ijzer,
    deel: 3,
  });
  d.push({ f: (x, y, z) => Math.max(sdf.cilinder(x, y, z, 8.6, 14, 24), -(z - 21.6)), g: [0, 0, 20, 12], m: M.brouw, deel: 4 });
  d.push({ f: (x, y, z) => sdf.torus(x, y, z - 22.6, 9.4, 1.1), g: [0, 0, 22.6, 11], m: M.ijzer, deel: 3 });
  // de beugel
  for (const s of [-1, 1]) d.push(F.capsule([s * 9.6, 0, 22], [s * 7, 0, 31], 0.7, M.ijzer, 5));
  d.push(F.capsule([-7, 0, 31], [7, 0, 31], 0.7, M.ijzer, 5));
  return F.model(d, mat, { midden: [0, 0, 16], straal: 26, lichten: [{ pos: [0, 0, 24], r: 85, sterk: 2, warm: 0.15, val: 1.4, zacht: 0.6 }] });
}

// Een rek waaraan kruiden te drogen hangen: bundels blad en bloem aan een dwarslat.
function kruidenrek(zaad = 1) {
  const M = { hout: 0, kruid: 1, bloem: 2, touw: 3 };
  const mat = [];
  mat[M.hout] = { ramp: 'hout', lo: 1, hi: 4.8 };
  mat[M.kruid] = {
    ramp: 'mos',
    lo: 1.4,
    hi: 5.4,
    patroon: (x, y, z) => (ruis3(x * 0.8, y * 0.8, z * 0.8, zaad) > 0.62 ? 0.9 : ruis3(x, y, z, zaad + 3) < 0.3 ? -0.8 : 0),
  };
  mat[M.bloem] = { ramp: 'magie', lo: 2, hi: 5.6 };
  mat[M.touw] = { ramp: 'stro', lo: 2, hi: 5 };
  const d = [];
  for (const sx of [-16, 16]) d.push(F.blok([sx, 0, 17], [1.6, 1.6, 17], 0.4, M.hout, 1));
  d.push(F.capsule([-17, 0, 33], [17, 0, 33], 1.2, M.hout, 1));
  const bundels = [-12, -6, 0.5, 7, 13];
  bundels.forEach((x, i) => {
    const hs = hash(i, zaad, 73);
    const lang = 8 + (hs % 5);
    d.push(F.capsule([x, 0, 33], [x + ((hs >>> 3) % 3) - 1, 0, 33 - lang - 3], 0.5, M.touw, 2 + i));
    d.push(F.ellips([x, 0, 33 - lang - 3], [4.2, 3, 5.6], hs % 4 === 0 ? M.bloem : M.kruid, 2 + i));
  });
  return F.model(d, mat, { midden: [0, 0, 22], straal: 26 });
}

// De kruidenhut aan de bosrand: laag, scheef en overwoekerd. Het dak is riet dat helemaal onder
// het mos zit, de schoorsteen staat scheef, er hangen kruiden te drogen en de ketel pruttelt.
function kruidenhut(gx, gy, o = {}) {
  const T = TEGEL;
  const g = D.huis({
    gx, gy, b: 6, d: 5, nok: 'x', muurH: 112, sokkelH: 22, muur: 'vlecht', hout: 'schors', dak: 'riet', dakOud: true, dakMos: 0.8, windveer: true, zaad: o.zaad ?? 37,
    overstek: 13,
    dakMos: 0.24,
    gevel: {
      y: [
        D.deurElement({ u: 28, b: 44, hoog: 88, ramp: 'hout' }),
        D.raamElement({ u: 102, b: 22, h: 44, hoog: 24, luiken: 'mos', kol: 2, rijen: 1 }),
        klimopElement({ u: 148, b: 34, h: 0, hoog: 88, zaad: 3 }),
      ],
      x: [D.raamElement({ u: 56, b: 20, h: 44, hoog: 22, kol: 2, rijen: 1, donker: true }), klimopElement({ u: 0, b: 26, h: 0, hoog: 76, zaad: 5 })],
    },
    ...o,
  });
  // een scheve schoorsteen van veldsteen: de planken staan schuin
  const cx = (gx + 1.2) * T;
  const cy = (gy - 0.1) * T;
  const scheef = 0.16;
  const schTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    if (vlak === 'z') {
      UIT.ramp = RAMP.inkt;
      UIT.stap = 1;
      return;
    }
    const u = vlak === 'y' ? X * SQ : -Y * SQ;
    D.veldsteenPixel(u + 500, h, 9999, vlak === 'y' ? 5 : 3.5, 41, false);
  };
  const hoekVlak = (n, d, naam) => ({ n, d, naam });
  const zVoet = 30 / PXH;
  const zTop = 118 / PXH;
  const r = 7;
  g.vormen.push(
    D.vorm(
      [
        hoekVlak([1, 0, scheef], cx + r + scheef * zVoet, 'x'),
        hoekVlak([-1, 0, -scheef], -(cx - r) - scheef * zVoet, '-'),
        hoekVlak([0, 1, scheef * 0.6], cy + r + scheef * 0.6 * zVoet, 'y'),
        hoekVlak([0, -1, -scheef * 0.6], -(cy - r) - scheef * 0.6 * zVoet, '-'),
        hoekVlak([0, 0, 1], zTop, 'z'),
        hoekVlak([0, 0, -1], -zVoet, '-'),
      ],
      schTex,
      { deel: 41, doos: [cx - r - 20, cy - r - 20, zVoet, cx + r + 20, cy + r + 20, zTop] },
    ),
  );
  if (o.rook !== false) g.modellen.push({ model: D.rook(43), gx: (cx - scheef * zTop * 0.8) / T, gy: cy / T, richting: 'N', z: zTop + 3, omlijn: false, schaduw: false });
  // kruiden aan de gevel, de ketel ervoor
  const y1 = (gy + 1.5) * T;
  g.modellen.push({ model: kruidenrek(2), gx: gx + 1.75, gy: (y1 + 20) / T, richting: 'ZW', z: 0 });
  g.modellen.push({ model: ketel(1), gx: gx - 0.2, gy: (y1 + 24) / T, richting: 'ZO', z: 0 });
  g.lichten.push({ pos: [(gx - 0.2) * T, y1 + 24, 24], r: 85, sterk: 1.6, warm: 0.2, val: 1.4, zacht: 0.6 });
  return g;
}

// ---------------------------------------------------------------- de jagershut

// Een gewei op een plank, boven de deur.
function gewei(zaad = 1) {
  const M = { bot: 0, hout: 1 };
  const mat = [];
  mat[M.bot] = { ramp: 'bot', lo: 1.6, hi: 6.4, patroon: (x, y, z) => (ruis3(x * 0.6, y * 0.6, z * 0.6, zaad) > 0.7 ? -0.7 : 0) };
  mat[M.hout] = { ramp: 'hout', lo: 1.2, hi: 4.6 };
  const d = [F.blok([0, 0.8, 0], [9, 1, 3.5], 0.6, M.hout, 1)];
  for (const s of [-1, 1]) {
    const tak = (p0, p1, r0, r1) => d.push(F.kegel(p0, p1, r0, r1, M.bot, 2));
    tak([s * 2, 1.6, 2], [s * 6, 3, 9], 1.5, 1.1);
    tak([s * 6, 3, 9], [s * 11, 4, 15], 1.1, 0.8);
    tak([s * 7.5, 3.4, 11], [s * 6, 4.5, 17], 0.7, 0.4);
    tak([s * 9.5, 3.8, 13.4], [s * 10, 5, 19], 0.6, 0.35);
    tak([s * 11, 4, 15], [s * 15, 4.6, 18], 0.7, 0.35);
  }
  return F.model(d, mat, { midden: [0, 3, 10], straal: 22 });
}

// Een rek met huiden die te drogen hangen, opgespannen met touwtjes.
function huidenrek(zaad = 1) {
  const M = { hout: 0, huid: 1, touw: 2 };
  const mat = [];
  mat[M.hout] = { ramp: 'hout', lo: 1, hi: 5 };
  mat[M.huid] = {
    ramp: 'leer',
    lo: 2.6,
    hi: 6.6,
    patroon: (x, y, z, nx, ny, nz) => {
      if (Math.abs(ny) < 0.5) return -1;
      const vlek = ruis3(x * 0.25, z * 0.25, 0, zaad);
      if (vlek > 0.72) return { ramp: 'vacht', stap: 4 };
      return vlek < 0.34 ? -0.8 : 0;
    },
  };
  mat[M.touw] = { ramp: 'stro', lo: 2, hi: 5 };
  const d = [];
  for (const sx of [-18, 18]) {
    d.push(F.blok([sx, 0, 20], [2, 2, 20], 0.5, M.hout, 1));
    d.push(F.capsule([sx, 0, 40], [sx + (sx > 0 ? -4 : 4), 6, 34], 1.2, M.hout, 1));
  }
  d.push(F.capsule([-19, 0, 39], [19, 0, 39], 1.4, M.hout, 1));
  // twee huiden, opgespannen
  const huid = (cx, w, hh, zaad2) => {
    d.push({
      f: (x, y, z) => {
        const dx = x - cx;
        const dz = z - (39 - hh / 2 - 3);
        const bol = Math.hypot(dx / w, dz / (hh / 2));
        const rand = 1 + Math.sin(Math.atan2(dz, dx) * 5 + zaad2) * 0.08;
        return Math.max((bol - rand) * w * 0.7, Math.abs(y) - 0.8);
      },
      g: [cx, 0, 39 - hh / 2 - 3, Math.max(w, hh) + 2],
      m: M.huid,
      deel: 2,
    });
    for (const s of [-1, 1]) d.push(F.capsule([cx + s * w * 0.8, 0, 39 - 1], [cx + s * w * 0.95, 0, 39], 0.4, M.touw, 2));
  };
  huid(-8, 9, 22, 1);
  huid(9, 7.5, 18, 2.2);
  return F.model(d, mat, { midden: [0, 0, 24], straal: 32 });
}

// De jagershut: een blokhut van stammen onder houten spanen, met een gewei boven de deur, een
// huidenrek ernaast en een stapel brandhout.
function jagershut(gx, gy, o = {}) {
  const T = TEGEL;
  const g = D.huis({
    gx, gy, b: 7, d: 6, nok: 'x', muurH: 100, sokkelH: 14, muur: 'blokhut', dak: 'spanen', zaad: o.zaad ?? 47,
    overstek: 8,
    gevel: {
      y: [
        D.raamElement({ u: 30, b: 24, h: 52, hoog: 26, luiken: 'hout', kol: 2, rijen: 1 }),
        D.deurElement({ u: 96, b: 46, hoog: 94, ramp: 'hout' }),
        D.raamElement({ u: 172, b: 24, h: 52, hoog: 26, luiken: 'hout', kol: 2, rijen: 1, leeg: true }),
      ],
      x: [D.raamElement({ u: 46, b: 22, h: 52, hoog: 24, donker: true, kol: 2, rijen: 1 }), D.raamElement({ u: 124, b: 22, h: 52, hoog: 24, donker: true, kol: 2, rijen: 1 })],
    },
    schoorsteen: { t: 0.2, c: -6, hoog: 26, r: 10, steen: true, rook: o.rook !== false },
    ...o,
  });
  const y1 = (gy + 1.5) * T;
  g.modellen.push({ model: gewei(1), gx: gx - 0.5 + 52 / 32, gy: (y1 + 1) / T, richting: 'ZW', z: 60 / PXH });
  g.modellen.push({ model: huidenrek(1), gx: gx + 2.95, gy: (y1 + 32) / T, richting: 'ZW', z: 0 });
  return g;
}

// ---------------------------------------------------------------- het huis van de dorpsoudste

// Het huis van de dorpsoudste: klein en goed onderhouden, pleister met vakwerk onder pannen, een
// bank naast de deur, klimop tegen de gevel en een bloembed ervoor (dat zet de scène zelf neer
// met akkers: { soort: 'bloemen' }).
function oudstehuis(gx, gy, o = {}) {
  const T = TEGEL;
  const g = D.huis({
    gx, gy, b: 7, d: 5, nok: 'x', muurH: 126, sokkelH: 22, muur: 'vlecht', hout: 'hout', dak: 'riet', dakOud: true, dakMos: 0.6, windveer: true, zaad: o.zaad ?? 53,
    gevel: {
      y: [
        D.raamElement({ u: 26, b: 24, h: 56, hoog: 30, luiken: 'water', bloembak: true }),
        D.deurElement({ u: 88, b: 48, hoog: 96, ramp: 'water', raampje: true }),
        D.raamElement({ u: 160, b: 24, h: 56, hoog: 30, luiken: 'water', bloembak: true }),
        klimopElement({ u: 200, b: 24, h: 0, hoog: 104, zaad: 7 }),
      ],
      x: [D.raamElement({ u: 34, b: 24, h: 56, hoog: 30, luiken: 'water', bloembak: true }), D.raamElement({ u: 104, b: 22, h: 56, hoog: 28, luiken: 'water' }), D.raamElement({ u: 70, b: 20, h: 128, hoog: 24, kol: 2, rijen: 1 })],
    },
    schoorsteen: { t: 0.24, c: -4, hoog: 28, r: 10, steen: true, rook: o.rook !== false },
    ...o,
  });
  const y1 = (gy + 1.5) * T;
  g.modellen.push({ model: D.bankje(), gx: gx - 0.5 + 60 / 32, gy: (y1 + 13) / T, richting: 'ZW', z: 0 });
  return g;
}

// ---------------------------------------------------------------- de brug

// Een stenen boogbrug over de beek, met een ezelsrug en twee leuningen. Omdat de bolling van het
// wegdek uit twee schuine vlakken bestaat, is de brug in twee helften gebouwd: elk stuk is dan
// convex. o.langs: 'y' (de brug loopt in de y-richting, de beek dus in de x-richting) of 'x'.
// cx, cy = het midden in tegels; lang en breed in tegels; bult = hoeveel hoger het midden ligt.
function brug(cx, cy, o = {}) {
  const T = TEGEL;
  const langsY = (o.langs || 'y') === 'y';
  const lang = (o.lang ?? 2.4) * T;
  const breed = (o.breed ?? 0.9) * T;
  const diep = o.diep ?? 9; // hoe ver de brug onder het maaiveld doorloopt
  const bult = o.bult ?? 13; // hoeveel hoger het midden ligt (pixels)
  const waterH = o.waterH ?? 6; // hoe diep het water ligt (pixels)
  const zaad = o.zaad ?? 59;
  const X = cx * T;
  const Y = cy * T;
  const a0 = (langsY ? Y : X) - lang / 2;
  const a1 = (langsY ? Y : X) + lang / 2;
  const am = (a0 + a1) / 2;
  const c0 = (langsY ? X : Y) - breed / 2;
  const c1 = (langsY ? X : Y) + breed / 2;
  const w = (na, nc, nz) => (langsY ? [nc, na, nz] : [na, nc, nz]);
  const doosW = (aa, ab, ca, cb, z0, z1) => (langsY ? [ca, aa, z0, cb, ab, z1] : [aa, ca, z0, ab, cb, z1]);
  const zDek = bult / PXH;
  const t = zDek / (lang / 2); // de helling van het wegdek
  const boogR = o.boogR ?? bult + waterH - 3;
  const leunH = o.leunH ?? 11;
  const leunB = 6;
  const vormen = [];

  // de zijkant: veldsteen met een boog waar je het water doorheen ziet
  const zijTex = (vlak, X2, Y2, Z) => {
    const h = Z * PXH;
    const langsU = langsY ? Y2 : X2;
    const dwarsU = langsY ? X2 : Y2;
    if (vlak === 'z') {
      const rand = Math.min(dwarsU - c0, c1 - dwarsU);
      UIT.ramp = RAMP.steen;
      if (rand < 2.5) {
        UIT.stap = 6.5;
        return;
      }
      const u = (((langsU * SQ) % 7) + 7) % 7;
      const v = (((dwarsU * SQ) % 6) + 6) % 6;
      UIT.stap = u < 0.8 || v < 0.8 ? 3 : 5.5 + (hash(Math.floor(langsU / 7), Math.floor(dwarsU / 6), zaad) % 3 === 0 ? -0.8 : 0);
      return;
    }
    // de boog: een halve cirkel vanaf de waterlijn
    const du = (langsU - am) * SQ;
    const dh = h + waterH;
    if (dh > -1.5 && Math.hypot(du, Math.max(0, dh - boogR * 0.3)) < boogR) {
      UIT.weg = true;
      return;
    }
    const u = langsU * SQ;
    D.veldsteenPixel(u + 700, h + 30, 9999, vlak === 'y' ? 5 : 3.5, zaad, false);
    // de natte voet van de brug is groen van het mos
    if (h < waterH + 3 && ruis2(u * 0.12, h * 0.3, zaad + 2) > 0.45) {
      UIT.ramp = RAMP.mos;
      UIT.stap = 2;
    }
  };
  const leunTex = (vlak, X2, Y2, Z) => {
    const h = Z * PXH;
    const langsU = langsY ? Y2 : X2;
    if (vlak === 'z') {
      UIT.ramp = RAMP.steen;
      const u = (((langsU * SQ) % 8) + 8) % 8;
      UIT.stap = u < 0.9 ? 4 : 7;
      return;
    }
    D.veldsteenPixel(langsU * SQ + 300, h + 60, 9999, vlak === 'y' ? 5.5 : 4, zaad + 3, false);
  };

  // per helft: het dek en de twee leuningen. s = +1 is de helft met de grote a.
  for (const s of [-1, 1]) {
    const aEind = s < 0 ? a0 : a1;
    // het dek: onder het schuine bovenvlak, tussen het midden en het uiteinde
    vormen.push(
      D.vorm(
        [
          { n: w(s * t, 0, 1), d: zDek + s * t * am, naam: 'z' },
          { n: w(-s, 0, 0), d: -s * am, naam: '-' },
          { n: w(s, 0, 0), d: s * aEind, naam: langsY ? 'y' : 'x' },
          { n: w(0, 1, 0), d: c1, naam: langsY ? 'x' : 'y' },
          { n: w(0, -1, 0), d: -c0, naam: '-' },
          { n: [0, 0, -1], d: diep / PXH, naam: '-' },
        ],
        zijTex,
        { deel: 50, doos: doosW(Math.min(am, aEind), Math.max(am, aEind), c0, c1, -diep / PXH, zDek) },
      ),
    );
    for (const zij of [-1, 1]) {
      const k0 = zij < 0 ? c0 : c1 - leunB;
      const k1 = zij < 0 ? c0 + leunB : c1;
      vormen.push(
        D.vorm(
          [
            { n: w(s * t, 0, 1), d: zDek + leunH / PXH + s * t * am, naam: 'z' },
            { n: w(-s * t, 0, -1), d: -(zDek + s * t * am) + 0.3, naam: '-' },
            { n: w(-s, 0, 0), d: -s * am, naam: '-' },
            { n: w(s, 0, 0), d: s * (aEind - s * 2), naam: langsY ? 'y' : 'x' },
            { n: w(0, 1, 0), d: k1, naam: langsY ? 'x' : 'y' },
            { n: w(0, -1, 0), d: -k0, naam: '-' },
          ],
          leunTex,
          { deel: 51, doos: doosW(Math.min(am, aEind), Math.max(am, aEind), k0, k1, -2, zDek + (leunH + 2) / PXH) },
        ),
      );
    }
  }
  return { vormen, modellen: [], lichten: [], bloembakken: [], voet: langsY ? [c0, a0, c1, a1] : [a0, c0, a1, c1] };
}


// ---------------------------------------------------------------- de proef bij de beek

// De tweede proef: de kapel met het kerkhof aan de ene kant van de beek, de watermolen erlangs,
// een stenen boogbrug, en in de hoek een vijver met riet, lelies en iets dat glinstert.
// o.fase (0..1) schuift de rimpels in het water op: zo zijn er later beeldjes van te maken.
function beekProef(o = {}) {
  const Bm = require('./bomen.cjs');
  const B = new K.Beeld(o.b ?? 1600, o.h ?? 1000, o.OX ?? 740, o.OY ?? 350);
  const fase = o.fase || 0;
  const radX = 15.6;
  const radY = 10.77;
  const kaart = D.grondKaart({
    zaad: 5,
    beken: [{ punten: [[23, 6.4], [20, 7.8], [17.6, 10.8], [9.5, 10.8], [5, 12.6], [0, 14.2], [-3, 15]], breed: 1.5, diep: 7 }],
    vijvers: [{ x: 10.5, y: 16.2, rx: 2.6, ry: 1.6, diep: 9 }],
    paden: [
      { punten: [[8.4, 8.6], [6, 9.4], [4.6, 10.4]], breed: 0.8, ruw: 0.6 },
      { punten: [[4.6, 11.4], [4.2, 13.4], [3, 15.4], [2.2, 16.4]], breed: 0.95 },
      { punten: [[4.8, 12.2], [7.4, 13.6], [9.4, 14.6]], breed: 0.7, ruw: 0.6 },
      { punten: [[2.5, 4.5], [4.5, 5.5], [8.6, 6.4]], breed: 0.7, ruw: 0.6 },
    ],
  });
  const grond = D.grondTex(kaart, { fase, dor: true, schuim: [{ x: radX, y: radY, r: 34 }] });
  K.tekenDozen(B, [K.doos(-2, -2, 21, 20, -16, 0, grond)]);
  D.waterDiepte(B, kaart);
  const gebouwen = [
    kapel(5, -1),
    watermolen(12, 3, { radVlak: 'y', molensteen: true }),
    kerkhof(-0.5, 16.2, { b: 6, d: 4, poort: 0.55, rijen: 4, kol: 3, zaad: 17 }),
    brug(4.6, 10.8, { langs: 'y', lang: 2.5, breed: 0.9, waterH: 7 }),
  ];
  for (const g of gebouwen) D.zetGebouw(B, g);
  // bomen: een donkere den en een dode boom bij het kerkhof, struiken langs het water
  D.zetModel(B, Bm.den(2), 12.4, -1.6, 'Z');
  D.zetModel(B, Bm.dodeBoom(2), -2.2, 14.6, 'Z');
  for (const [x, y, z] of [[8.4, 12.4, 1], [18.5, 8.6, 3], [5.4, 16.4, 1], [13.4, 13.6, 2], [0.4, 10.4, 2]]) D.zetModel(B, Bm.struik(z), x, y, 'Z');
  D.zetModel(B, Bm.grasPol(3, { hoog: true }), 11.6, 11.6, 'Z');
  D.zetModel(B, Bm.grasPol(5, { hoog: true }), 12.8, 15.4, 'Z');
  D.zetModel(B, Bm.paddenstoelen(2), 1.4, 12.2, 'Z');
  D.zetModel(B, D.houtstapel(3), 10.4, 8.4, 'ZO');
  D.zetModel(B, D.mesthoop(4), 17.4, 4.4, 'ZO');
  // de tovenaar op het pad, voor de maat
  if (o.tovenaar !== false) D.zetModel(B, F.tovenaar(o.leeftijd ?? 84), 4.2, 12.2, 'ZO');
  D.grasPollen(B, kaart);
  const vormen = gebouwen.flatMap((g) => g.vormen);
  D.zonSchaduw(B, vormen, { zon: D.AVONDZON });
  D.voetSchaduw(B, gebouwen.filter((g) => g.voet && g.hoog !== 17));
  K.belicht(B, { omgeving: () => 0.15 });
  D.avondlicht(B);
  K.verwarm(B, 1.8);
  D.nevel(B, { van: 8, tot: -8, mid: 3.4, sterkte: 0.4 });
  K.omlijn(B);
  const p = K.Plaat.van(K.kwantiseer(B));
  // iets glinstert in de vijver
  const [gx, gy] = K.tegelNaarScherm(B, 10.8, 16.4);
  D.glinstering(p, gx, gy + 3);
  return p;
}

module.exports = {
  GLAS, glasraamElement, roosvensterElement, boogdeurElement, klimopElement, klokkentoren, sterSpits, kapel,
  grafsteen, tombe, kerkhofhek, kerkhof, molenrad, molensteen, watermolen, broodplank, bakkerij, schuur,
  prikbord, ketel, kruidenrek, kruidenhut, gewei, huidenrek, jagershut, oudstehuis, brug, yCilinder, beekProef,
};
