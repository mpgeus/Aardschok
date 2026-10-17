// De bruggen van het eiland (ontwerp/werklijst.md, vraag 170, stap 6a2, L1; Marcel, 17 okt: "bruggen moeten ook oud
// zijn, en we hebben nieuwe stenen bruggen nodig, met boogje etc", "Wat bij de plek past", "S1", en op de eerste
// proefplaat: "Ook hout mag met boogje, afwisselend. Gewoon mooie bruggen. Dit ziet er te slap uit. Bruggen moeten
// breder. Er moeten ook soldaten pelotons overheen. Niemand bouwt een brug voor 1 persoon"). Elke brug is drie tegels
// breed, zo breed als de weg, en komt in stukken van één tegel langs, zodat het spel er een brug van elke lengte mee legt.
//
// De stenen boogbrug: veldsteen, zandsteen of baksteen (de steen van het land), bogen van twee tegels (bij een oneven
// lengte in het midden één van drie, over één tegel een klein boogje), pijlers met een spitse kop, een lijst onder een
// stevige borstwering, een bol wegdek van kinderkopjes, en aan beide kanten een landhoofd waar de weg op klimt. Oud: mos
// en varens in de voegen, korstmos, waterstrepen, een steen die eruit is, een donkere natte rand, klimop.
//
// De houten jukbrug (een lange oversteek): een dek van dikke planken op langsliggers, gedragen door jukken van vier palen
// met een kesp erop, en een leuning van palen en twee regels. De houten boogbrug (een korte oversteek, tot vier tegels):
// een gebogen dek op twee boogribben met stijltjes ertussen, en een leuning met andreaskruisen. Oud: grijs hout, hier en
// daar nog bruin, mos aan de voet van de palen.
//
// In het spel komt een brug per tegel in twee lagen (wat achter wie erop loopt, en wat ervóór), en wie erop loopt, gaat met
// het wegdek mee omhoog (hoogteOp).
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
  dek: 20, // de bovenkant van het wegdek boven het maaiveld: zo hoog gaat wie erop loopt mee omhoog
  dikte: 8, // het dek onder de kinderkopjes, boven de kruin van een boog
  bol: 2.5, // hoeveel het midden van het wegdek dwars hoger ligt dan de randen
  borst: 12, // de borstwering boven het wegdek (kniehoog)
  borstB: 8, // en zo dik (eenheden)
  breed: 3, // de brug dwars, in tegels: de middelste is gc, en één aan elke kant
  inzet: 0.05, // zoveel tegel blijft er aan weerszijden vrij
  pijler: 0.16, // een halve pijler tussen twee bogen, in tegels langs de brug
  water: 7, // zo diep ligt het water onder het maaiveld (de beek van dorp.cjs)
  aanloop: 2, // het wegdek aan de buitenkant van een landhoofd, boven het maaiveld
};
// De dwarse maat van een brug met gc als middelste tegel: van c0 tot c1, in eenheden.
const dwarsVan = (gc) => [(gc - (BRUG.breed - 1) / 2 + BRUG.inzet) * TEGEL, (gc + (BRUG.breed + 1) / 2 - BRUG.inzet) * TEGEL];

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
  const [c0, c1] = dwarsVan(o.gc);
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
    // de lijst: een band van gehakte steen net onder het wegdek, met een schaduwlijn eronder
    const dek = hoog(langs);
    if (zij && h > dek - 4 && h <= dek) {
      UIT.ramp = steen === 'zandsteen' ? RAMP.zandsteen : RAMP.veldsteen;
      UIT.stap = h < dek - 3 ? 1.8 : 4.6 + (Math.floor(u / 11) % 2) * 0.4;
      return;
    }
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
    const p = BRUG.pijler * T * 1.25;
    const neus = 0.3 * T;
    const zTop = E(kruin - 1);
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

// ---------------------------------------------------------------- de houten bruggen

const HOUT = {
  dek: 10, // de bovenkant van het dek van de jukbrug, en van de boogbrug aan zijn uiteinden (px boven het maaiveld)
  dekD: 3, // de planken
  ligger: 5, // de langsligger eronder
  paal: 7, // een paal van een juk, in het vierkant (eenheden)
  palen: 4, // zoveel palen per juk, dwars
  kesp: 4, // de kesp op de palen (px)
  leuning: 13, // de leuning boven het dek (px)
  stijl: 4, // een leuningpaal, in het vierkant (eenheden)
  regel: 3, // een regel van de leuning, dik (eenheden en px)
  planken: 7, // planken per tegel
  bult: [3, 2.5], // de boogbrug: zoveel hoger in het midden, vast en per tegel water
};

// Hout: de nerf langs `nerf`, grijs verweerd en hier en daar nog bruin. Een textuur voor D.vorm; o.planken: het
// bovenvlak is een plankdek (de planken dwars op de brug), o.weg(u, h): wat er niet is.
function houtTex(o) {
  return (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const langs = o.langsX ? X : Y;
    const dwars = o.langsX ? Y : X;
    const u = langs * SQ;
    const v = dwars * SQ;
    if (o.weg && o.weg(langs / TEGEL, h, vlak)) {
      UIT.weg = true;
      return;
    }
    if (vlak === 'z' && o.planken) {
      const t = (langs / TEGEL) * HOUT.planken;
      const k = Math.floor(t);
      const f = t - k;
      const hk = hash(k, 3, o.zaad);
      UIT.ramp = hk % 4 === 0 ? RAMP.houtOud : RAMP.schors;
      let st = 3.6 + (hk % 3) * 0.4;
      if (f < 0.1 || f > 0.93) st -= 2; // de naad
      else if (f < 0.2) st += 0.7; // de kant van de plank vangt licht
      if (hk % 7 === 0 && Math.abs(((v / 9) % 1) - 0.5) < 0.05) st -= 1.5; // een barst
      if (hash(k, Math.floor(v / 14), o.zaad + 1) % 9 === 0) st -= 0.8; // een vlek
      UIT.stap = st;
      return;
    }
    // balken en palen: de nerf in de lengte, donkerder aan de onderkant
    const lang = vlak === 'z' ? v : o.staand ? h : u;
    UIT.ramp = hash(Math.floor(lang / 40), Math.floor((o.staand ? u : h) / 5), o.zaad + 3) % 3 === 0 ? RAMP.houtOud : RAMP.schors;
    let st = vlak === 'z' ? 4.4 : vlak === o.zijNaam ? 3.4 : 2.6;
    if (hash(Math.round(lang), Math.round((o.staand ? u : h) * 2), o.zaad + 5) % 6 === 0) st -= 0.8; // de nerf
    UIT.stap = st;
    // mos aan de voet van een paal, bij het water
    if (h < -BRUG.water + 6 && ruis2(u * 0.3, h * 0.3, o.zaad + 7) > 0.45) {
      UIT.ramp = RAMP.mos;
      UIT.stap = 1.5;
    }
  };
}

// Een blok hout langs de brug: van a0 tot a1 (langs), k0 tot k1 (dwars), van z0 (px) tot een bovenkant die van h0 (bij
// a0) naar h1 (bij a1) loopt. Zijn kanten naar de kijker heten 'x' en 'y', zodat de textuur ze kent.
function blokLangs(langsX, a0, a1, k0, k1, z0, h0, h1, tex, deel, o = {}) {
  const E = (px) => px / PXH;
  const w = (na, nc, nz) => (langsX ? [na, nc, nz] : [nc, na, nz]);
  const helling = (E(h1) - E(h0)) / (a1 - a0);
  const doos = langsX ? [a0, k0, E(z0), a1, k1, E(Math.max(h0, h1))] : [k0, a0, E(z0), k1, a1, E(Math.max(h0, h1))];
  return D.vorm(
    [
      { n: w(-helling, 0, 1), d: E(h0) - helling * a0, naam: 'z' },
      { n: w(0, 0, -1), d: -E(z0), naam: '-' },
      { n: w(1, 0, 0), d: a1, naam: o.kop === false ? '-' : langsX ? 'x' : 'y' },
      { n: w(-1, 0, 0), d: -a0, naam: '-' },
      { n: w(0, 1, 0), d: k1, naam: langsX ? 'y' : 'x' },
      { n: w(0, -1, 0), d: -k0, naam: '-' },
    ],
    tex,
    { deel, doos },
  );
}

// Het landhoofd van een houten brug: veldsteen, met de helling van de aanloop tot het dek, en daarop de eerste planken.
function houtLandhoofd(o, dek) {
  const langsX = o.as === 'x';
  const T = TEGEL;
  const a0 = o.ga * T;
  const a1 = a0 + T;
  const [c0, c1] = dwarsVan(o.gc);
  const op = o.stuk === 'begin';
  const h0 = op ? BRUG.aanloop : dek;
  const h1 = op ? dek : BRUG.aanloop;
  const zaad = o.zaad ?? 53;
  const steenTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const u = (langsX ? X : Y) * SQ;
    if (vlak === 'z') {
      houtTex({ langsX, planken: true, zaad })(vlak, X, Y, Z);
      return;
    }
    steenPixel('veldsteen', u, h + 20, 3.8, zaad);
    verweer(u, h, zaad, { klimop: true });
  };
  return [blokLangs(langsX, a0, a1, c0, c1, -3, h0, h1, steenTex, 70, { kop: !op })];
}

// De leuning langs een stuk van één tegel: palen op elke halve tegel en twee regels, aan beide kanten, op een dek dat van
// h0 naar h1 loopt. o.kruis: andreaskruisen tussen de palen (de boogbrug), anders een middenregel (de jukbrug). Een stuk
// van de onderregel is soms weg (o.oud).
function leuning(o, a0, a1, h0, h1, deel) {
  const langsX = o.as === 'x';
  const [c0, c1] = dwarsVan(o.gc);
  const zaad = o.zaad ?? 53;
  const vormen = [];
  const dekOp = (a) => h0 + ((a - a0) / (a1 - a0)) * (h1 - h0);
  for (const [k0, k1] of [[c0, c0 + HOUT.regel], [c1 - HOUT.regel, c1]]) {
    const tex = houtTex({ langsX, zaad, zijNaam: langsX ? 'y' : 'x' });
    // de bovenregel en de palen als één paneel: wat er niet is, valt weg
    const T = TEGEL;
    const paneelTex = houtTex({
      langsX,
      zaad,
      zijNaam: langsX ? 'y' : 'x',
      weg: (u, h) => {
        const a = u * T;
        const top = dekOp(a) + HOUT.leuning;
        if (h > top - HOUT.regel) return false; // de bovenregel
        const fp = ((u * 2) % 1 + 1) % 1; // de palen op elke halve tegel
        if (fp < 0.09) return false;
        const onder = dekOp(a);
        if (o.kruis) {
          // een andreaskruis tussen twee palen
          const t = fp;
          const r = (h - onder) / (HOUT.leuning - HOUT.regel);
          return !(Math.abs(t - r) < 0.11 || Math.abs(t - (1 - r)) < 0.11);
        }
        // een middenregel; hier en daar is een stuk weg
        if (Math.abs(h - (onder + HOUT.leuning * 0.45)) < 1.4) return o.oud !== false && hash(Math.floor(u * 2), k0 > c0 ? 1 : 0, zaad + 11) % 7 === 0 && fp > 0.3;
        return true;
      },
    });
    void tex;
    vormen.push(blokLangs(langsX, a0, a1, k0, k1, Math.min(h0, h1), h0 + HOUT.leuning, h1 + HOUT.leuning, paneelTex, deel, { kop: false }));
  }
  return vormen;
}

// De jukbrug: een stuk van één tegel. o: as, ga, gc, stuk ('begin', 'water', 'eind'), en bij 'water' juk: of er aan het
// eind van deze tegel een juk staat (op de grens met de volgende tegel water).
function jukStuk(o) {
  const langsX = o.as === 'x';
  const T = TEGEL;
  const a0 = o.ga * T;
  const a1 = a0 + T;
  const [c0, c1] = dwarsVan(o.gc);
  const zaad = o.zaad ?? 53;
  const zijNaam = langsX ? 'y' : 'x';
  const vormen = [];
  if (o.stuk !== 'water') {
    vormen.push(...houtLandhoofd(o, HOUT.dek));
    const op = o.stuk === 'begin';
    vormen.push(...leuning(o, a0, a1, op ? BRUG.aanloop : HOUT.dek, op ? HOUT.dek : BRUG.aanloop, 72));
    return { vormen, modellen: [], lichten: [], bloembakken: [] };
  }
  const onderDek = HOUT.dek - HOUT.dekD;
  // het dek en de langsliggers eronder (de buitenste zie je)
  vormen.push(blokLangs(langsX, a0, a1, c0, c1, onderDek, HOUT.dek, HOUT.dek, houtTex({ langsX, planken: true, zaad, zijNaam }), 71, { kop: false }));
  for (const k of [c0 + 4, (c0 + c1) / 2 - 3, c1 - 10]) vormen.push(blokLangs(langsX, a0, a1, k, k + 6, onderDek - HOUT.ligger, onderDek, onderDek, houtTex({ langsX, zaad, zijNaam }), 73, { kop: false }));
  // een juk op de grens met de volgende tegel: vier palen en een kesp
  if (o.juk) {
    const p = HOUT.paal / 2;
    const kespOnder = onderDek - HOUT.ligger - HOUT.kesp;
    vormen.push(blokLangs(langsX, a1 - p - 1, a1 + p + 1, c0 + 1, c1 - 1, kespOnder, onderDek - HOUT.ligger, onderDek - HOUT.ligger, houtTex({ langsX, zaad, zijNaam }), 74));
    for (let i = 0; i < HOUT.palen; i++) {
      const k = c0 + ((i + 0.5) / HOUT.palen) * (c1 - c0);
      vormen.push(blokLangs(langsX, a1 - p, a1 + p, k - p, k + p, -BRUG.water - 6, kespOnder, kespOnder, houtTex({ langsX, zaad: zaad + i, zijNaam, staand: true }), 75));
    }
  }
  vormen.push(...leuning(o, a0, a1, HOUT.dek, HOUT.dek, 72));
  return { vormen, modellen: [], lichten: [], bloembakken: [] };
}

// Een hele jukbrug over L tegels water: een juk op elke grens tussen twee tegels water.
function jukBrug(o) {
  const stukken = [jukStuk({ ...o, ga: o.ga - 1, stuk: 'begin' })];
  for (let i = 0; i < o.L; i++) stukken.push(jukStuk({ ...o, ga: o.ga + i, stuk: 'water', juk: i < o.L - 1 }));
  stukken.push(jukStuk({ ...o, ga: o.ga + o.L, stuk: 'eind' }));
  return stukken;
}

// De houten boogbrug (tot vier tegels water): het dek loopt in een boog van HOUT.dek aan de oevers tot bult hoger in het
// midden, gedragen door twee boogribben met stijltjes ertussen. o: as, ga, gc, L (tegels water), zaad. Elke tegel water in
// twee helften, zodat de boog niet hoekig wordt.
function houtBoogBrug(o) {
  const langsX = o.as === 'x';
  const T = TEGEL;
  const zaad = o.zaad ?? 59;
  const [c0, c1] = dwarsVan(o.gc);
  const zijNaam = langsX ? 'y' : 'x';
  const bult = HOUT.bult[0] + HOUT.bult[1] * o.L;
  const dekOp = (u) => HOUT.dek + bult * Math.sin((Math.PI * klem(u, 0, o.L)) / o.L); // u in tegels vanaf de eerste tegel water
  const voet = -BRUG.water + 1;
  const stukken = [];
  for (const stuk of ['begin', 'eind']) {
    const ga = stuk === 'begin' ? o.ga - 1 : o.ga + o.L;
    const p = { ...o, ga, stuk };
    const a0 = ga * T;
    const op = stuk === 'begin';
    stukken.push({ vormen: [...houtLandhoofd(p, HOUT.dek), ...leuning({ ...p, kruis: true }, a0, a0 + T, op ? BRUG.aanloop : HOUT.dek, op ? HOUT.dek : BRUG.aanloop, 72)], modellen: [], lichten: [], bloembakken: [] });
  }
  for (let i = 0; i < o.L; i++) {
    const vormen = [];
    for (const half of [0, 0.5]) {
      const u0 = i + half;
      const u1 = u0 + 0.5;
      const a0 = (o.ga + u0) * T;
      const a1 = (o.ga + u1) * T;
      const h0 = dekOp(u0);
      const h1 = dekOp(u1);
      // het dek
      vormen.push(blokLangs(langsX, a0, a1, c0, c1, Math.min(h0, h1) - HOUT.dekD, h0, h1, houtTex({ langsX, planken: true, zaad, zijNaam }), 71, { kop: false }));
      // de twee boogribben met hun stijltjes, als een paneel onder het dek: wat geen rib of stijl is, valt weg
      const kruin = dekOp(o.L / 2) - HOUT.dekD - 2;
      const ribTex = houtTex({
        langsX,
        zaad: zaad + 2,
        zijNaam,
        weg: (u, h) => {
          const uu = u - o.ga;
          const top = voet + (kruin - voet) * Math.sin((Math.PI * klem(uu, 0, o.L)) / o.L);
          if (h <= top && h > top - 5) return false; // de rib
          if (h > top && h < dekOp(uu) - HOUT.dekD && ((uu * 4) % 1 + 1) % 1 < 0.12) return false; // een stijltje
          return true;
        },
      });
      for (const [k0, k1] of [[c0 + 2, c0 + 8], [c1 - 8, c1 - 2]]) vormen.push(blokLangs(langsX, a0, a1, k0, k1, voet - 2, h0 - HOUT.dekD, h1 - HOUT.dekD, ribTex, 76, { kop: false }));
      vormen.push(...leuning({ ...o, kruis: true }, a0, a1, h0, h1, 72));
    }
    stukken.push({ vormen, modellen: [], lichten: [], bloembakken: [] });
  }
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

module.exports = { BRUG, HOUT, bogen, dwarsVan, steenStuk, steenBrug, jukStuk, jukBrug, houtBoogBrug, zetBrug };

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
  const { soldaat } = require('./heer.cjs');
  const Bm = require('./bomen.cjs');
  const kamp = require('./kamp.cjs');
  const man = () => boer({ houding: 'staan', fase: 0 });
  const E = (px) => px / PXH;
  const stenenDek = E(BRUG.dek + BRUG.bol);
  console.time('bruggen');
  // 1. Een brede rivier met een stenen brug van zeven tegels (veldsteen) en een peloton erop, een beek met de houten
  // boogbrug, en het kampje van de rovers aan een paadje, met de tent T1.
  const peloton = [];
  for (const [dx, dy] of [[-0.5, -1], [-0.5, 0], [-0.5, 1], [0.6, -1], [0.6, 0], [0.6, 1]]) peloton.push({ model: soldaat({ houding: 'staan', fase: 0 }), x: 11.5 + dx, y: 9.5 + dy, richting: 'O', z: stenenDek });
  const een = scene({
    b: 1500, h: 920, OX: 700, OY: 40, kader: [-2, -4, 26, 26],
    beken: [
      { punten: [[11.5, -6], [11.5, 30]], breed: 7, diep: BRUG.water },
      { punten: [[15, 17.5], [30, 17.5]], breed: 3, diep: BRUG.water },
    ],
    paden: [
      { punten: [[-2, 9.5], [8, 9.5]], breed: 2.6 },
      { punten: [[15, 9.5], [26, 9.5]], breed: 2.6 },
      { punten: [[20.5, 9.5], [20.5, 16]], breed: 2.6 },
      { punten: [[20.5, 19], [20.5, 27]], breed: 2.6 },
      { punten: [[4.5, 11], [4.2, 13], [3.4, 15.2]], breed: 0.55, ruw: 0.6 },
    ],
    bruggen: [
      steenBrug({ as: 'x', ga: 8, gc: 9, L: 7, steen: 'veldsteen', zaad: 41 }),
      houtBoogBrug({ as: 'y', ga: 16, gc: 20, L: 3, zaad: 59 }),
    ],
    dingen: [
      ...peloton,
      { model: man(), x: 20.4, y: 17.5, richting: 'ZW', z: E(HOUT.dek + HOUT.bult[0] + HOUT.bult[1] * 3) },
      { model: man(), x: 18.5, y: 9.6, richting: 'ZW' },
      { model: kamp.tent({ rover: true, zaad: 5 }), x: 1.5, y: 16.6, richting: 'ZO' },
      { model: kamp.tent({ rover: true, zaad: 6 }), x: 5.3, y: 18, richting: 'ZW' },
      { model: kamp.afdak(), x: 2.2, y: 20.4, richting: 'NO' },
      { model: kamp.kampvuur({ stand: 'brandt', fase: 0.3 }), x: 3.6, y: 18.8 },
      { model: Bm.den(2), x: -0.8, y: 13.4 },
      { model: Bm.den(4), x: 7.6, y: 14.6 },
      { model: Bm.eik(3), x: -1.2, y: 22 },
      { model: Bm.den(6), x: 7.2, y: 22.4 },
    ],
  });
  // 2. Een rivier van vier tegels de andere kant op, met een stenen brug van zandsteen, een van baksteen, en een houten
  // jukbrug.
  const twee = scene({
    b: 1500, h: 600, OX: 640, OY: -60, kader: [-2, 0, 28, 14],
    beken: [{ punten: [[-4, 7], [32, 7]], breed: 4, diep: BRUG.water }],
    paden: [3.5, 12.5, 21.5].flatMap((x) => [{ punten: [[x, 0], [x, 4]], breed: 2.6 }, { punten: [[x, 10], [x, 14]], breed: 2.6 }]),
    bruggen: [
      steenBrug({ as: 'y', ga: 5, gc: 3, L: 4, steen: 'zandsteen', zaad: 45 }),
      steenBrug({ as: 'y', ga: 5, gc: 12, L: 4, steen: 'baksteen', zaad: 47 }),
      jukBrug({ as: 'y', ga: 5, gc: 21, L: 4, zaad: 53 }),
    ],
    dingen: [
      { model: man(), x: 12.4, y: 7, richting: 'ZO', z: stenenDek },
      { model: man(), x: 21.4, y: 7.2, richting: 'ZO', z: E(HOUT.dek) },
    ],
  });
  const plaat = new K.Plaat(1500, een.h + twee.h);
  plaat.plak(een, 0, 0);
  plaat.plak(twee, 0, een.h);
  fs.writeFileSync(path.join(UIT_MAP, 'bruggen-proef.png'), K.png(plaat, 1));
  console.timeEnd('bruggen');
  console.log(`uit/bruggen-proef.png (${plaat.b}×${plaat.h})`);
}
