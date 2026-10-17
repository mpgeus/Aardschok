// De bruggen van het eiland (ontwerp/werklijst.md, vraag 170, stap 6a2, L1; Marcel, 17 okt: "bruggen moeten ook oud
// zijn, en we hebben nieuwe stenen bruggen nodig, met boogje etc", en "Wat bij de plek past", "S1"): de oude houten brug
// en de stenen boogbrug, elk in stukken van één tegel, zodat het spel er een brug van elke lengte mee kan leggen.
//
// De stenen boogbrug: veldsteen, zandsteen of baksteen (de steen van het land), bogen over het water van twee tegels (bij
// een oneven lengte in het midden één van drie, en over één tegel een klein boogje), een kniehoge borstwering aan
// weerszijden, een licht bol wegdek van kinderkopjes boven het water, en aan beide kanten een landhoofd waar de weg op
// klimt. Oud: mos en varens in de voegen, korstmos op de borstwering, stenen die eruit zijn, een donkere natte rand waar
// het water tegen de pijlers staat, en klimop op de landhoofden. In het spel komt hij per tegel in twee lagen (de verre
// borstwering en het dek achter wie erop loopt, de nabije borstwering en de boog ervóór), en wie erop loopt, gaat met het
// wegdek mee omhoog (BRUG.dek).
//
// De houten brug: een vlak plankdek op een landhoofd van veldsteen, zoals de brugtegels in randtegels.cjs, maar oud: grijs
// verweerd hout, gebarsten planken en hier en daar een die weg is (je ziet het water erdoor), een doorgezakte legger, mos
// langs de randen en op het landhoofd, waar een paar stenen uit liggen.
//
//   node gereedschap/pixelart/bruggen.cjs    (de proefplaat: uit/bruggen-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { TEGEL, PXH, RAMP, UIT, hash, ruis2, klem } = K;
const D = require('./dorp.cjs');
require('./huis-sdf.cjs'); // de rampen 'zandsteen', 'baksteen' en 'houtOud'
const SQ = D.SQ;

// ---------------------------------------------------------------- maten

// In pixels boven het maaiveld (z = 0), en in tegels dwars op de brug.
const BRUG = {
  dek: 16, // de bovenkant van het wegdek boven het maaiveld: zo hoog gaat wie erop loopt mee omhoog
  dikte: 6, // het dek onder de kinderkopjes, boven de kruin van een boog
  bol: 1.5, // hoeveel het midden van het wegdek dwars hoger ligt dan de randen
  borst: 10, // de borstwering boven het wegdek (kniehoog)
  borstB: 5, // en zo dik (eenheden)
  breed: 0.88, // de brug dwars, in tegels
  pijler: 0.11, // een halve pijler tussen twee bogen, in tegels langs de brug
  water: 7, // zo diep ligt het water onder het maaiveld (de beek van dorp.cjs)
  aanloop: 2, // het wegdek aan de buitenkant van een landhoofd, boven het maaiveld
};

// De bogen over L tegels water: [van, tot] in tegels vanaf de eerste tegel water. Twee tegels per boog; bij een oneven
// lengte in het midden één van drie; over één tegel een klein boogje.
function bogen(L) {
  if (L <= 1) return [[0, 1]];
  const uit = [];
  const drie = L % 2;
  const paren = (L - 3 * drie) / 2;
  let a = 0;
  for (let i = 0; i < Math.floor(paren / 2); i++, a += 2) uit.push([a, a + 2]);
  if (drie) uit.push([a, (a += 3)]);
  while (a < L) uit.push([a, (a += 2)]);
  return uit;
}

// ---------------------------------------------------------------- de steen

// De steen van het land: veldsteen (dorp.cjs), gehakte blokken zandsteen, of baksteen. u langs de wand en h omhoog, in
// pixels; basis is de stap in de ramp.
function blokPixel(u, h, basis, zaad) {
  const rij = Math.floor(h / 8);
  const f = h - rij * 8;
  const uu = u + (hash(rij, zaad, 61) % 9);
  let a = 0;
  let k = 0;
  while (true) {
    const l = 14 + (hash(rij, k, zaad + 63) % 9);
    if (a + l > uu) break;
    a += l;
    k++;
  }
  UIT.ramp = RAMP.zandsteen;
  if (f < 1 || uu - a < 1) {
    UIT.stap = basis - 2.5;
    return;
  }
  const hs = hash(rij, k, zaad + 65);
  UIT.stap = basis + (hs % 5 === 0 ? -0.8 : hs % 7 === 0 ? 0.6 : 0) + (f > 6 ? 0.4 : 0);
}
function steenPixel(soort, u, h, basis, zaad) {
  if (soort === 'zandsteen') blokPixel(u, h, basis, zaad);
  else if (soort === 'baksteen') D.baksteenPixel(u, h, basis, 'baksteen');
  else {
    D.veldsteenPixel(u + 700, h + 30, 9999, basis, zaad, false);
    // geen blauwe steen: in de zon leest hij als een ruitje
    if (UIT.ramp === RAMP.pet) {
      UIT.ramp = RAMP.veldsteen;
      UIT.stap -= 1.5;
    }
  }
}

// Wat de jaren doen (o.oud): mos aan de natte voet en in de voegen, korstmos, een donkere natte rand bij het water.
function verweer(u, h, zaad, o) {
  const voeg = UIT.stap;
  if (h < -BRUG.water + 3) UIT.stap -= 1.5; // de natte rand
  if (h < -BRUG.water + 7 && ruis2(u * 0.13, h * 0.35, zaad + 2) > 0.58) {
    UIT.ramp = RAMP.mos;
    UIT.stap = 1 + (ruis2(u * 0.4, h * 0.4, zaad + 3) > 0.6 ? 1 : 0);
    return;
  }
  // mos en varens in de voegen: hier en daar, donker
  if (voeg < 3 && ruis2(u * 0.09, h * 0.09, zaad + 5) > 0.62 && hash(Math.round(u), Math.round(h), zaad + 7) % 2 === 0) {
    UIT.ramp = RAMP.mos;
    UIT.stap = 1.5;
  }
  // klimop op een landhoofd: van de grond omhoog, in plukken
  if (o.klimop && ruis2(u * 0.06, h * 0.09, zaad + 11) > 0.6 + h * 0.012 && hash(Math.round(u / 2), Math.round(h / 2), zaad + 13) % 4 !== 0) {
    UIT.ramp = RAMP.blad;
    UIT.stap = 1.5 + (hash(Math.round(u / 2), Math.round(h / 2), zaad + 15) % 3) * 0.8;
  }
}

// ---------------------------------------------------------------- de stenen boogbrug

// Een stuk van één tegel. o:
//   as        'x' of 'y': waarlangs de brug loopt
//   ga, gc    de tegel: langs (ga) en dwars (gc)
//   stuk      'begin' of 'eind' (een landhoofd, op de oever), of 'water'
//   boog      bij 'water': [van, tot] in tegels langs, de boog waar deze tegel in ligt (relatief aan ga)
//   steen     'veldsteen', 'zandsteen' of 'baksteen'
//   zaad      voor de steen en het verweren
function steenStuk(o) {
  const langsX = o.as === 'x';
  const T = TEGEL;
  const a0 = o.ga * T;
  const a1 = a0 + T;
  const c0 = (o.gc + (1 - BRUG.breed) / 2) * T;
  const c1 = (o.gc + (1 + BRUG.breed) / 2) * T;
  const cm = (c0 + c1) / 2;
  const w = (na, nc, nz) => (langsX ? [na, nc, nz] : [nc, na, nz]);
  const doosW = (aa, ab, ca, cb, z0, z1) => (langsX ? [aa, ca, z0, ab, cb, z1] : [ca, aa, z0, cb, ab, z1]);
  const zaad = o.zaad ?? 41;
  const steen = o.steen || 'veldsteen';
  const E = (px) => px / PXH; // pixels naar eenheden
  const zDek = E(BRUG.dek);
  const zBodem = E(-BRUG.water - 6);
  // het wegdek: bij een landhoofd een helling van de aanloop tot het dek, boven het water vlak
  const hoog = (a) => {
    if (o.stuk === 'begin') return BRUG.aanloop + ((a - a0) / T) * (BRUG.dek - BRUG.aanloop);
    if (o.stuk === 'eind') return BRUG.dek - ((a - a0) / T) * (BRUG.dek - BRUG.aanloop);
    return BRUG.dek;
  };
  const helling = o.stuk === 'water' ? 0 : (o.stuk === 'begin' ? 1 : -1) * E(BRUG.dek - BRUG.aanloop) / T;
  // het bovenvlak door (a0, hoog(a0)): z = hoog(a0) + helling * (a - a0), als vlak n·p = d
  const bovenVlak = (extra) => ({ n: w(-helling, 0, 1), d: E(hoog(a0) + extra) - helling * a0, naam: 'z' });
  // de opening van de boog op deze tegel: langs (in tegels vanaf de eerste tegel water) en hoogte (px)
  const boog = o.boog;
  const kruin = BRUG.dek - BRUG.dikte - 1;
  const voet = -BRUG.water + 1;
  function inBoog(u, h) {
    if (!boog) return 0;
    const s0 = boog[0] + BRUG.pijler;
    const s1 = boog[1] - BRUG.pijler;
    const m = (s0 + s1) / 2;
    const hw = (s1 - s0) / 2;
    const t = (u - m) / hw;
    if (Math.abs(t) >= 1 || h < voet - 2) return 0;
    const top = voet + (kruin - voet) * Math.sqrt(1 - t * t);
    if (h > top + 4.5) return 0;
    if (h > top) {
      // de boogstenen: een ring om de boog, met voegen naar het midden toe
      const hoek = Math.atan2(h - voet, (u - m) * 40);
      return Math.floor(hoek / (Math.PI / (6 + 2 * hw))) % 2 ? 3 : 4;
    }
    return top - h < 2.2 ? 2 : 1; // 2: de rand van het gewelf (donker), 1: open
  }
  const lokaal = (X, Y) => ((langsX ? X : Y) - o.ga * T) / T + (o.relatief ?? 0); // u in tegels binnen de brug

  // de zijkant (en de kop van een landhoofd): steen, met de boog waar je het water doorheen ziet
  const zijTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const langs = langsX ? X : Y;
    const u = langs * SQ;
    if (vlak === 'z') {
      // het wegdek: kinderkopjes, sleets in het midden, mos langs de rand
      const dwars = langsX ? Y : X;
      const q = (dwars - c0) / (c1 - c0);
      const i = Math.floor((langs * SQ) / 5);
      const j = Math.floor((dwars * SQ) / 4 + (i % 2) * 0.5);
      const fu = (langs * SQ) / 5 - i;
      const fj = (dwars * SQ) / 4 + (i % 2) * 0.5 - j;
      UIT.ramp = steen === 'baksteen' ? RAMP.baksteen : steen === 'zandsteen' ? RAMP.zandsteen : RAMP.veldsteen;
      let s = 4 + (hash(i, j, zaad + 21) % 3) - 1;
      if (fu < 0.18 || fj < 0.2) s -= 2; // de voeg
      if (q > 0.3 && q < 0.7) s += 0.6; // het looppad blinkt
      UIT.stap = s;
      if ((q < 0.12 || q > 0.88) && ruis2(langs * 0.08, dwars * 0.08, zaad + 23) > 0.55) {
        UIT.ramp = RAMP.mos;
        UIT.stap = 3;
      }
      return;
    }
    const zij = vlak === (langsX ? 'y' : 'x');
    const g = inBoog(lokaal(X, Y), h);
    if (zij && g === 1) {
      UIT.weg = true;
      return;
    }
    steenPixel(steen, u, h, zij ? 3.8 : 3, zaad);
    // waterstrepen: donkere banen van onder het wegdek omlaag, waar de regen van het dek afloopt
    if (zij && o.oud !== false && ruis2(u * 0.3, 0.5, zaad + 17) > 0.6) UIT.stap -= 0.9 * klem((BRUG.dek - 3 - h) / 10, 0, 1);
    if (g === 2) UIT.stap = Math.min(UIT.stap, 1.6); // het gewelf, in het donker
    else if (zij && g >= 3) {
      // de boogsteen: iets lichter, en een voeg waar de ene in de andere overgaat
      UIT.ramp = steen === 'baksteen' ? RAMP.baksteen : steen === 'zandsteen' ? RAMP.zandsteen : RAMP.veldsteen;
      UIT.stap = g === 3 ? 5.6 : 4.8;
    }
    if (o.oud !== false) verweer(u, h, zaad, { klimop: o.stuk !== 'water' && zij });
  };
  // de borstwering: dezelfde steen, met een dekzerk van platte stenen; oud: hier en daar een steen eruit
  const borstTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const langs = langsX ? X : Y;
    const u = langs * SQ;
    const top = hoog(langs) + BRUG.borst;
    // een steen die eruit is: een hapje uit de bovenkant
    if (o.oud !== false) {
      const k = Math.floor(u / 9);
      if (hash(k, o.gc, zaad + 31) % 9 === 0 && h > top - 4 && (u / 9 - k) > 0.25 && (u / 9 - k) < 0.85) {
        UIT.weg = true;
        return;
      }
    }
    if (vlak === 'z') {
      UIT.ramp = steen === 'baksteen' ? RAMP.veldsteen : steen === 'zandsteen' ? RAMP.zandsteen : RAMP.veldsteen;
      const k = Math.floor(u / 9);
      UIT.stap = (u / 9 - k) < 0.12 ? 3 : 5 + (hash(k, 3, zaad + 33) % 2) * 0.6;
      if (o.oud !== false && ruis2(u * 0.11, k * 0.7, zaad + 35) > 0.7) {
        UIT.ramp = RAMP.mos;
        UIT.stap = 3;
      }
      return;
    }
    if (h > top - 2.5) {
      // de dekzerk, kopse kant
      UIT.ramp = steen === 'zandsteen' ? RAMP.zandsteen : RAMP.veldsteen;
      UIT.stap = 4.5;
      return;
    }
    steenPixel(steen, u + 300, h + 60, vlak === (langsX ? 'y' : 'x') ? 4.2 : 3.2, zaad + 3);
    if (o.oud !== false && ruis2(u * 0.2, h * 0.3, zaad + 37) > 0.72 && hash(Math.round(u), Math.round(h), zaad + 39) % 2) {
      UIT.ramp = RAMP.olijf;
      UIT.stap = 4; // korstmos: vaal geelgroen, in vlekjes
    }
  };

  const vormen = [];
  const kopA = o.stuk === 'begin' ? -1 : o.stuk === 'eind' ? 1 : 0; // waar de kop van een landhoofd zit
  const naamLangs = langsX ? 'x' : 'y';
  // het lijf: van onder het water tot het wegdek
  vormen.push(
    D.vorm(
      [
        bovenVlak(0),
        { n: w(0, 0, -1), d: -(o.stuk === 'water' ? zBodem : E(-3)), naam: '-' },
        { n: w(1, 0, 0), d: a1, naam: kopA === 1 ? naamLangs : '-' },
        { n: w(-1, 0, 0), d: -a0, naam: '-' },
        { n: w(0, 1, 0), d: c1, naam: langsX ? 'y' : 'x' },
        { n: w(0, -1, 0), d: -c0, naam: '-' },
      ],
      zijTex,
      { deel: 60, doos: doosW(a0, a1, c0, c1, o.stuk === 'water' ? zBodem : E(-3), E(Math.max(hoog(a0), hoog(a1)) + 1)) },
    ),
  );
  // het wegdek dwars licht bol: een dun dakje in het midden
  vormen.push(
    D.vorm(
      [
        { n: w(-helling, E(BRUG.bol) / ((c1 - c0) / 2), 1), d: E(hoog(a0) + BRUG.bol) - helling * a0 + (E(BRUG.bol) / ((c1 - c0) / 2)) * cm, naam: 'z' },
        { n: w(-helling, -E(BRUG.bol) / ((c1 - c0) / 2), 1), d: E(hoog(a0) + BRUG.bol) - helling * a0 - (E(BRUG.bol) / ((c1 - c0) / 2)) * cm, naam: 'z' },
        { n: w(helling, 0, -1), d: -(E(hoog(a0)) - helling * a0) + 0.01, naam: '-' },
        { n: w(1, 0, 0), d: a1, naam: '-' },
        { n: w(-1, 0, 0), d: -a0, naam: '-' },
        { n: w(0, 1, 0), d: c1 - BRUG.borstB, naam: '-' },
        { n: w(0, -1, 0), d: -(c0 + BRUG.borstB), naam: '-' },
      ],
      zijTex,
      { deel: 60, doos: doosW(a0, a1, c0, c1, E(Math.min(hoog(a0), hoog(a1)) - 1), E(Math.max(hoog(a0), hoog(a1)) + BRUG.bol + 1)) },
    ),
  );
  // de twee borstweringen
  for (const zij of [-1, 1]) {
    const k0 = zij < 0 ? c0 : c1 - BRUG.borstB;
    const k1 = zij < 0 ? c0 + BRUG.borstB : c1;
    // aan de buitenkant van een landhoofd een hogere pijler
    vormen.push(
      D.vorm(
        [
          bovenVlak(BRUG.borst),
          { n: w(0, 0, -1), d: -E(hoog(a0) - 1), naam: '-' },
          { n: w(1, 0, 0), d: a1, naam: kopA === 1 ? naamLangs : '-' },
          { n: w(-1, 0, 0), d: -a0, naam: kopA === -1 ? '-' : '-' },
          { n: w(0, 1, 0), d: k1, naam: langsX ? 'y' : 'x' },
          { n: w(0, -1, 0), d: -k0, naam: '-' },
        ],
        borstTex,
        { deel: 61 + (zij > 0 ? 1 : 0), doos: doosW(a0, a1, k0, k1, E(Math.min(hoog(a0), hoog(a1)) - 2), E(Math.max(hoog(a0), hoog(a1)) + BRUG.borst + 1)) },
      ),
    );
  }
  // een pijlerkop: de spitse voet van een pijler tussen twee bogen, aan de kant van de kijker, tot net onder de kruin. Hij
  // staat op de grens van twee tegels; elke tegel heeft zijn helft (o.kop: 'links' aan zijn begin, 'rechts' aan zijn eind).
  for (const [kant, grens] of [['begin', o.kopBegin], ['eind', o.kopEind]]) {
    if (!grens) continue;
    const ab = kant === 'begin' ? a0 : a1;
    const p = BRUG.pijler * T * 1.3;
    const neus = 0.16 * T;
    const zTop = E(kruin - 3);
    const val = E(4) / neus; // de kap loopt naar de neus toe af
    const z0 = zBodem;
    // de twee schuine kanten: door (ab -+ p, c1) en (ab, c1 + neus)
    const zijL = { n: w(-neus, p, 0), d: -neus * (ab - p) + p * c1, naam: langsX ? 'y' : 'x' };
    const zijR = { n: w(neus, p, 0), d: neus * (ab + p) + p * c1, naam: langsX ? 'y' : 'x' };
    vormen.push(
      D.vorm(
        [
          zijL,
          zijR,
          { n: w(0, -1, 0), d: -(c1 - 1), naam: '-' },
          { n: w(0, val, 1), d: zTop + val * c1, naam: 'kap' },
          { n: w(0, 0, -1), d: -z0, naam: '-' },
          kant === 'begin' ? { n: w(-1, 0, 0), d: -ab, naam: '-' } : { n: w(1, 0, 0), d: ab, naam: '-' },
        ],
        (vlak, X, Y, Z) => {
          const h = Z * PXH;
          const u = (langsX ? X : Y) * SQ + (langsX ? Y : X) * SQ;
          if (vlak === 'kap') {
            UIT.ramp = steen === 'baksteen' ? RAMP.veldsteen : steen === 'zandsteen' ? RAMP.zandsteen : RAMP.veldsteen;
            UIT.stap = 4.4;
            if (o.oud !== false && ruis2(u * 0.2, h * 0.2, zaad + 51) > 0.55) {
              UIT.ramp = RAMP.mos;
              UIT.stap = 2.5;
            }
            return;
          }
          steenPixel(steen, u, h, 4, zaad + 9);
          if (o.oud !== false) verweer(u, h, zaad, {});
        },
        { deel: 63, doos: doosW(ab - p, ab + p, c1 - 1, c1 + neus, z0, zTop + 1) },
      ),
    );
  }
  return { vormen, modellen: [], lichten: [], bloembakken: [], voet: langsX ? [a0, c0, a1, c1] : [c0, a0, c1, a1] };
}

// Een hele stenen brug over L tegels water, als stukken: de landhoofden op de oevers en de stukken boven het water. o: as,
// ga (de eerste tegel water langs), gc (de tegel dwars), L, steen, zaad. Geeft de stukken, elk zoals steenStuk.
function steenBrug(o) {
  const stukken = [];
  const bg = bogen(o.L);
  stukken.push(steenStuk({ ...o, ga: o.ga - 1, stuk: 'begin' }));
  // de grenzen tussen twee bogen: daar staat een pijler, met zijn kop
  const pijlers = new Set(bg.slice(0, -1).map(([, t]) => t));
  for (let i = 0; i < o.L; i++) {
    const boog = bg.find(([v, t]) => i >= v && i < t);
    stukken.push(steenStuk({ ...o, ga: o.ga + i, stuk: 'water', boog, relatief: i, kopBegin: pijlers.has(i), kopEind: pijlers.has(i + 1) }));
  }
  stukken.push(steenStuk({ ...o, ga: o.ga + o.L, stuk: 'eind' }));
  return stukken;
}

// ---------------------------------------------------------------- de oude houten brug

// Zoals de brugtegels van randtegels.cjs: een vlak plankdek, twee pixels boven het maaiveld en drie eronder (de legger),
// tussen twee stroken water, op een landhoofd van veldsteen. Oud: grijs hout, gebarsten planken, hier en daar een die weg
// is, mos langs de randen, en een dek dat in het midden een beetje doorzakt.
const HOUT = { boven: 2, onder: -3, inzet: 0.15, planken: 7, zak: 1.6 };

// Een stuk van één tegel, zoals steenStuk: as, ga, gc, stuk ('begin', 'water', 'eind'), en bij 'water' i en L (de
// hoeveelste tegel water, en hoeveel er zijn), voor het doorzakken.
function houtStuk(o) {
  const langsX = o.as === 'x';
  const T = TEGEL;
  const a0 = o.ga * T;
  const a1 = a0 + T;
  const c0 = (o.gc + HOUT.inzet) * T;
  const c1 = (o.gc + 1 - HOUT.inzet) * T;
  const w = (na, nc, nz) => (langsX ? [na, nc, nz] : [nc, na, nz]);
  const doosW = (aa, ab, ca, cb, z0, z1) => (langsX ? [aa, ca, z0, ab, cb, z1] : [ca, aa, z0, cb, ab, z1]);
  const zaad = o.zaad ?? 53;
  const E = (px) => px / PXH;
  // het dek zakt door: boven het water een boogje naar beneden, op de landhoofden niet
  const zak = (a) => (o.stuk === 'water' ? HOUT.zak * Math.sin((Math.PI * (o.i + (a - a0) / T)) / o.L) : 0);
  const top = (a) => HOUT.boven - zak(a);
  const helling = E(top(a1) - top(a0)) / T;
  const steen = o.stuk !== 'water';
  const tex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const langs = langsX ? X : Y;
    const dwars = langsX ? Y : X;
    const u = langs * SQ;
    const kant = (dwars - c0) / (c1 - c0);
    if (steen) {
      // het landhoofd: vlakke veldsteen, afgesleten, met mos en een paar stenen eruit
      const i = Math.floor(u / 7);
      const j = Math.floor((dwars * SQ) / 4);
      if (vlak === 'z') {
        UIT.ramp = RAMP.veldsteen;
        let st = 4 + (hash(i, j, zaad) % 3) - 1;
        if ((u / 7 - i) < 0.14 || ((dwars * SQ) / 4 - j) < 0.25) st -= 2;
        UIT.stap = st;
        if (hash(i, j, zaad + 1) % 13 === 0) UIT.stap = 1; // een steen die eruit is
        if (ruis2(u * 0.07, dwars * 0.07, zaad + 3) > 0.62) {
          UIT.ramp = RAMP.mos;
          UIT.stap = 2.5;
        }
        return;
      }
      steenPixel('veldsteen', u, h + 20, 4, zaad);
      verweer(u, h, zaad, {});
      return;
    }
    // de planken liggen dwars: een naad elke 1/planken tegel
    const t = ((langs / T) % 1) * HOUT.planken;
    const k = Math.floor(t + (o.ga % 1) * HOUT.planken) + o.ga * HOUT.planken;
    const f = t - Math.floor(t);
    if (vlak === 'z') {
      // een plank die weg is, of half weg
      const hk = hash(k, o.gc, zaad + 5);
      if (hk % 11 === 0 || (hk % 17 === 0 && kant > 0.55)) {
        UIT.weg = true;
        return;
      }
      UIT.ramp = hk % 4 === 0 ? RAMP.schors : RAMP.houtOud; // grijs verweerd, hier en daar nog bruin
      let st = 3.4 + (hk % 3) * 0.5 - 0.5;
      if (f < 0.12 || f > 0.92) st -= 2; // de naad
      else if (f < 0.22) st += 0.8; // de kant van de plank vangt licht
      if (hk % 7 === 0 && Math.abs(kant - (0.3 + (hk % 5) * 0.1)) < 0.03) st -= 2; // een barst
      if (kant < 0.1 || kant > 0.9) {
        st -= 0.8;
        if (ruis2(langs * 0.09, dwars * 0.09, zaad + 7) > 0.55) {
          UIT.ramp = RAMP.mos;
          UIT.stap = 2.5;
          return;
        }
      } else if (kant > 0.4 && kant < 0.6) st += 0.4; // uitgesleten in het midden
      UIT.stap = st;
      return;
    }
    // de legger, aan de kant van de kijker
    UIT.ramp = RAMP.houtOud;
    let st = 2.6;
    if (h > top(langs) - 1.2) st += 1;
    if (h < HOUT.onder + 1) st -= 1;
    if (hash(Math.round(u), Math.round(h), zaad + 9) % 9 === 0) st -= 1;
    UIT.stap = st;
    if (h < HOUT.onder + 2 && ruis2(u * 0.2, h, zaad + 11) > 0.5) {
      UIT.ramp = RAMP.mos;
      UIT.stap = 1.5;
    }
  };
  const onder = steen ? -3 : HOUT.onder;
  return {
    vormen: [
      D.vorm(
        [
          { n: w(-helling, 0, 1), d: E(top(a0)) - helling * a0, naam: 'z' },
          { n: w(0, 0, -1), d: -E(onder - zak(a0)), naam: '-' },
          { n: w(1, 0, 0), d: a1, naam: langsX ? 'x' : 'y' },
          { n: w(-1, 0, 0), d: -a0, naam: '-' },
          { n: w(0, 1, 0), d: c1, naam: langsX ? 'y' : 'x' },
          { n: w(0, -1, 0), d: -c0, naam: '-' },
        ],
        tex,
        { deel: 70, doos: doosW(a0, a1, c0, c1, E(onder - HOUT.zak - 1), E(HOUT.boven + 1)) },
      ),
    ],
    modellen: [],
    lichten: [],
    bloembakken: [],
  };
}

// Een hele houten brug over L tegels water, zoals steenBrug.
function houtBrug(o) {
  const stukken = [houtStuk({ ...o, ga: o.ga - 1, stuk: 'begin' })];
  for (let i = 0; i < o.L; i++) stukken.push(houtStuk({ ...o, ga: o.ga + i, stuk: 'water', i }));
  stukken.push(houtStuk({ ...o, ga: o.ga + o.L, stuk: 'eind' }));
  return stukken;
}

// Zet een brug neer als één ding: dan tekent de omlijning geen naad tussen twee stukken.
function zetBrug(B, stukken) {
  const obj = B.volgendObj++;
  const vormen = stukken.flatMap((s) => s.vormen);
  for (const v of vormen) v.obj = obj;
  D.tekenVormen(B, vormen, { omlijn: true });
  return vormen;
}

module.exports = { BRUG, HOUT, bogen, steenStuk, steenBrug, houtStuk, houtBrug, zetBrug };

// ---------------------------------------------------------------- de proefplaat

// Een scène: grond met beken en paden, bruggen, en wat erbij staat ({ model, x, y, richting, z }).
function scene(o) {
  const B = new K.Beeld(o.b, o.h, o.OX, o.OY);
  const kaart = D.grondKaart({ zaad: o.zaad || 7, beken: o.beken, paden: o.paden });
  K.tekenDozen(B, [K.doos(o.kader[0], o.kader[1], o.kader[2], o.kader[3], -16, 0, D.grondTex(kaart, { dor: true }))]);
  D.waterDiepte(B, kaart);
  const vormen = [];
  for (const brug of o.bruggen) vormen.push(...zetBrug(B, brug));
  for (const d of o.dingen || []) D.zetModel(B, d.model, d.x, d.y, d.richting || 'Z', { z: d.z || 0 });
  D.grasPollen(B, kaart);
  D.zonSchaduw(B, vormen, { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

if (require.main === module) {
  const UIT_MAP = path.join(__dirname, 'uit');
  fs.mkdirSync(UIT_MAP, { recursive: true });
  const { boer } = require('./dorpelingen.cjs');
  const Bm = require('./bomen.cjs');
  const kamp = require('./kamp.cjs');
  const man = () => boer({ houding: 'staan', fase: 0 });
  const E = (px) => px / PXH;
  console.time('bruggen');
  // 1. Een brede rivier met een stenen brug van zeven tegels (veldsteen), een beek met de oude houten brug van drie, en
  // het kampje van de rovers aan een paadje, met de tent T1.
  const een = scene({
    b: 1500, h: 900, OX: 700, OY: 40, kader: [-2, -4, 26, 26],
    beken: [
      { punten: [[11.5, -6], [11.5, 30]], breed: 7, diep: BRUG.water },
      { punten: [[15, 16.5], [30, 16.5]], breed: 3, diep: BRUG.water },
    ],
    paden: [
      { punten: [[-2, 9.5], [8, 9.5]], breed: 0.95 },
      { punten: [[15, 9.5], [26, 9.5]], breed: 0.95 },
      { punten: [[20.5, 9.5], [20.5, 15]], breed: 0.95 },
      { punten: [[20.5, 18], [20.5, 27]], breed: 0.95 },
      { punten: [[4.5, 10], [4.2, 12.5], [3.4, 15.2]], breed: 0.55, ruw: 0.6 },
    ],
    bruggen: [
      steenBrug({ as: 'x', ga: 8, gc: 9, L: 7, steen: 'veldsteen', zaad: 41 }),
      houtBrug({ as: 'y', ga: 15, gc: 20, L: 3, zaad: 53 }),
    ],
    dingen: [
      { model: man(), x: 11.5, y: 9.5, richting: 'ZO', z: E(BRUG.dek) },
      { model: man(), x: 20.5, y: 16.5, richting: 'ZW', z: E(HOUT.boven) },
      { model: man(), x: 17.5, y: 9.6, richting: 'ZW' },
      { model: kamp.tent({ rover: true, zaad: 5 }), x: 1.5, y: 16.2, richting: 'ZO' },
      { model: kamp.tent({ rover: true, zaad: 6 }), x: 5.3, y: 17.6, richting: 'ZW' },
      { model: kamp.afdak(), x: 2.2, y: 20.2, richting: 'NO' },
      { model: kamp.kampvuur({ stand: 'brandt', fase: 0.3 }), x: 3.6, y: 18.6 },
      { model: Bm.den(2), x: -0.8, y: 13.2 },
      { model: Bm.den(4), x: 7.4, y: 14.2 },
      { model: Bm.eik(3), x: -1.2, y: 22 },
      { model: Bm.den(6), x: 7.2, y: 22.4 },
    ],
  });
  // 2. Drie korte stenen bruggen van drie tegels, de andere kant op: veldsteen, zandsteen en baksteen.
  const twee = scene({
    b: 1500, h: 520, OX: 640, OY: -60, kader: [-2, 0, 26, 12],
    beken: [{ punten: [[-4, 6.5], [30, 6.5]], breed: 3, diep: BRUG.water }],
    paden: [3.5, 11.5, 19.5].flatMap((x) => [{ punten: [[x, 0], [x, 4]], breed: 0.95 }, { punten: [[x, 9], [x, 12]], breed: 0.95 }]),
    bruggen: [
      steenBrug({ as: 'y', ga: 5, gc: 3, L: 3, steen: 'veldsteen', zaad: 43 }),
      steenBrug({ as: 'y', ga: 5, gc: 11, L: 3, steen: 'zandsteen', zaad: 45 }),
      steenBrug({ as: 'y', ga: 5, gc: 19, L: 3, steen: 'baksteen', zaad: 47 }),
    ],
    dingen: [{ model: man(), x: 11.5, y: 6.5, richting: 'ZO', z: E(BRUG.dek) }],
  });
  const plaat = new K.Plaat(1500, een.h + twee.h);
  plaat.plak(een, 0, 0);
  plaat.plak(twee, 0, een.h);
  fs.writeFileSync(path.join(UIT_MAP, 'bruggen-proef.png'), K.png(plaat, 1));
  console.timeEnd('bruggen');
  console.log(`uit/bruggen-proef.png (${plaat.b}×${plaat.h})`);
}
