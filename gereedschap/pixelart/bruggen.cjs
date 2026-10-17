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
// met een kesp erop, en een leuning van palen en twee regels. De houten boogbrug (een korte oversteek, tot zes tegels):
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
  dek: 33, // de bovenkant van het wegdek boven het maaiveld: zo hoog gaat wie erop loopt mee omhoog. In het spel ligt het
  // water op het maaiveld; zo houden de bogen hun maat van de proefplaat (daar lag het dek 26 boven de oever en 33 boven
  // het water)
  dikte: 8, // het dek onder de kinderkopjes, boven de kruin van een boog
  bol: 2.5, // hoeveel het midden van het wegdek dwars hoger ligt dan de randen
  borst: 12, // de borstwering boven het wegdek (kniehoog)
  borstB: 8, // en zo dik (eenheden)
  breed: 3, // de brug dwars, in tegels: de middelste is gc, en één aan elke kant
  schuinBreed: 4, // een schuine brug, in rijen (Marcel koos tussen 3 en 4): vier rijen zijn 2,8 tegel breed
  inzet: 0.05, // zoveel tegel blijft er aan weerszijden vrij
  pijler: 0.16, // een halve pijler tussen twee bogen, in tegels langs de brug
  water: 7, // zo diep ligt het water onder het maaiveld (de beek van dorp.cjs)
  waterVlak: -7, // het water onder de brug (px): in de proefplaat de beek, in het spel het maaiveld (bruggen-vel.cjs)
  aanloop: 2, // het wegdek aan de buitenkant van een landhoofd, boven het maaiveld
};
// De dwarse maat van een brug met gc als middelste tegel: van c0 tot c1, in eenheden.
const dwarsVan = (gc) => [(gc - (BRUG.breed - 1) / 2 + BRUG.inzet) * TEGEL, (gc + (BRUG.breed + 1) / 2 - BRUG.inzet) * TEGEL];

// De vier assen waarlangs een brug ligt, zoals de poppetjes lopen (Marcel, 17 okt: "De bruggen moeten in 8 richtingen",
// "Zoals hoe de poppetjes lopen"; een brug is van beide kanten dezelfde): langs x (op het scherm naar rechtsonder), langs
// y (naar linksonder), en schuin: zn (recht omhoog op het scherm) en wo (recht opzij). U wijst langs de brug, V dwars,
// naar de kijker toe (bij zn kijkt de kijker over de brug: dan zie je beide kanten).
const S2 = Math.SQRT1_2;
const ASSEN = {
  x: { U: [1, 0], V: [0, 1], schuin: false },
  y: { U: [0, 1], V: [1, 0], schuin: false },
  zn: { U: [S2, S2], V: [-S2, S2], schuin: true },
  wo: { U: [S2, -S2], V: [S2, S2], schuin: true },
};

// Let op: de texturen tellen hun stenen vanaf 0 langs en dwars (wegdekPixel, blokPixel, D.veldsteenPixel), dus een brug
// ligt in de tekening waar langs en dwars positief zijn (schuin langs zn: gy > gx; langs wo: gx > gy, of genoeg marge).
// Het raam van een brug, waarin al zijn stukken getekend worden: langs (a) en dwars (c) in eenheden, en de stappen langs
// de brug. o.as; langs x en y o.ga (de eerste tegel water) en o.gc (de middelste rij), drie rijen; schuin o.gx en o.gy (de
// eerste tegel water van de eerste rij) en o.rijen rijen (BRUG.schuinBreed). Een stap is een tegel, schuin √2 tegel (een
// tegel verder langs x en y samen); schuin liggen de rijen om en om een halve stap verschoven, zoals de tegels op een
// schuine lijn. Geeft { as, schuin, S (een stap, eenheden), aW (waar het water begint, langs), c0, c1, R (rijen), gc (een
// nummer voor het lot), langs(X, Y), dwars(X, Y), w(na, nc, nz) (een normaal van het raam naar de wereld), doos(aa, ab,
// ca, cb, z0, z1), tegel(i, k): de tegel van stap i in rij k, en stap: S in tegels }.
function raam(o) {
  const A = ASSEN[o.as];
  const T = TEGEL;
  const langs = (X, Y) => X * A.U[0] + Y * A.U[1];
  const dwars = (X, Y) => X * A.V[0] + Y * A.V[1];
  let S, aW, c0, c1, R, tegel, gc;
  if (!A.schuin) {
    S = T;
    R = BRUG.breed;
    aW = o.ga * T;
    [c0, c1] = dwarsVan(o.gc);
    tegel = o.as === 'x' ? (i, k) => [o.ga + i, o.gc - 1 + k] : (i, k) => [o.gc - 1 + k, o.ga + i];
    gc = o.gc;
  } else {
    S = T * Math.SQRT2;
    R = o.rijen ?? BRUG.schuinBreed;
    tegel = o.as === 'zn' ? (i, k) => [o.gx + i + ((k % 2) - k) / 2, o.gy + i + ((k % 2) + k) / 2] : (i, k) => [o.gx + i + (k + (k % 2)) / 2, o.gy - i + (k - (k % 2)) / 2];
    const [mx, my] = [(o.gx + 0.5) * T, (o.gy + 0.5) * T]; // het midden van de eerste tegel water van rij 0
    const rij = T * S2; // van rij tot rij, dwars
    aW = langs(mx, my) - S / 4;
    c0 = dwars(mx, my) - rij / 2 + BRUG.inzet * T;
    c1 = dwars(mx, my) + (R - 0.5) * rij - BRUG.inzet * T;
    gc = o.gx + o.gy;
  }
  const w = (na, nc, nz) => [na * A.U[0] + nc * A.V[0], na * A.U[1] + nc * A.V[1], nz];
  const doos = (aa, ab, ca, cb, z0, z1) => {
    const xs = [];
    const ys = [];
    for (const a of [aa, ab]) {
      for (const c of [ca, cb]) {
        xs.push(a * A.U[0] + c * A.V[0]);
        ys.push(a * A.U[1] + c * A.V[1]);
      }
    }
    return [Math.min(...xs), Math.min(...ys), z0, Math.max(...xs), Math.max(...ys), z1];
  };
  return { as: o.as, schuin: A.schuin, S, aW, c0, c1, R, gc, langs, dwars, w, doos, tegel, stap: S / T };
}

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

// Het wegdek op een landhoofd loopt van de aanloop op de oever tot het dek in een S-bocht, vlak aan beide uiteinden
// (Marcel, 17 okt: "de knak in de brug mag er niet zijn", "moet natuurlijk overlopen"); getekend in PLAKKEN vlakke plakken.
const sBocht = (t) => t * t * (3 - 2 * t);
const PLAKKEN = 8;

// De bogen van een brug in dit raam: langs x en y zoals hierboven, schuin één boog per stap (een stap is √2 tegel).
const bogenVan = (F, L) => (F.schuin ? Array.from({ length: L }, (_, i) => [i, i + 1]) : bogen(L));

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
// Het grijs van de veldsteen: dat van de huizen (huis-sdf.cjs), warm, en niet het koele grijs van dorp.cjs (Marcel, 17 okt:
// "de ramp op de grijze stenen is ook te verschillend met de rest").
const GRIJS = RAMP.veldsteenWarm;
function steenPixel(soort, u, h, basis, zaad) {
  if (soort === 'zandsteen') blokPixel(u, h, basis, zaad);
  else if (soort === 'baksteen') D.baksteenPixel(u, h, basis, 'baksteen');
  else {
    D.veldsteenPixel(u + 700, h + 30, 9999, basis, zaad, false);
    // geen blauwe steen: in de zon leest hij als een ruitje
    if (UIT.ramp === RAMP.pet) UIT.stap -= 1.5;
    if (UIT.ramp === RAMP.veldsteen || UIT.ramp === RAMP.pet) UIT.ramp = GRIJS;
  }
}

// Het wegdek: grote kinderkopjes (Marcel, 17 okt: "deze zijn te fijn", die van baksteen "lijken wel dakpannen", en "de
// stenen moeten echter, het lijken nu platte platen"), in rijen dwars op de brug. Elke steen is bol: de kant naar het
// licht is lichter, de andere kant donkerder, met een glimlicht en wat korrel; de hoeken zijn rond, en waar vier stenen
// samenkomen, is de voeg breder, met hier en daar zand of mos. Veldsteen, met af en toe een warmere. u langs en v dwars in
// pixels, q dwars van 0 tot 1, licht de richting van het licht langs en dwars (een eenheidsvector).
const KOP = { rij: 8, lang: [8, 6] }; // een rij langs de brug, en een steen dwars: 8 tot 13 pixels
function wegdekPixel(u, v, q, steen, zaad, licht) {
  const r = Math.floor(u / KOP.rij);
  const fr = u - r * KOP.rij;
  const lengte = (k) => KOP.lang[0] + (hash(r, k, zaad + 27) % KOP.lang[1]);
  let a = -(hash(r, 1, zaad + 25) % 9);
  let k = 0;
  while (a + lengte(k) <= v) a += lengte(k++);
  const hs = hash(r, k, zaad + 29);
  const l = lengte(k);
  // waar in de steen, van -1 tot 1, met het midden wat scheef
  const nu = (fr - KOP.rij / 2 - (((hs >> 3) % 3) - 1) * 0.4) / (KOP.rij / 2 - 0.7);
  const nv = (v - a - l / 2 - ((hs % 3) - 1) * 0.4) / (l / 2 - 0.7);
  const e = Math.abs(nu) ** 3 + Math.abs(nv) ** 3;
  if (e > 1) {
    // de voeg
    const zand = hash(Math.round(u), Math.round(v), zaad + 33) % 4 === 0;
    UIT.ramp = zand ? RAMP.aarde : GRIJS;
    UIT.stap = zand ? 2 : 1;
    if ((q < 0.15 || q > 0.85) && ruis2(u * 0.1, v * 0.1, zaad + 23) > 0.45) {
      UIT.ramp = RAMP.mos;
      UIT.stap = 2.5;
    }
    return;
  }
  const warm = steen !== 'zandsteen' && hs % 9 === 0;
  UIT.ramp = steen === 'zandsteen' || warm ? RAMP.zandsteen : GRIJS;
  const naarLicht = nu * licht[0] + nv * licht[1];
  let s = 3.4 + (hs % 3) * 0.45 - (warm ? 0.8 : 0);
  s += naarLicht * (0.4 + 0.9 * Math.min(1, e)) * 1.2; // bol: aan de rand schuiner
  if (e > 0.6 && naarLicht < -0.2) s -= 0.5; // de schaduwkant
  const gu = nu - 0.35 * licht[0];
  const gv = nv - 0.35 * licht[1];
  if (gu * gu + gv * gv < 0.07) s += 0.8; // het glimlicht
  s += ((hash(Math.round(u * 2), Math.round(v * 2), zaad + 31) % 5) - 2) * 0.15; // korrel
  UIT.stap = s; // geen sleets looppad in het midden (Marcel, 17 okt: "op een brug kan geen looppaadje ontstaan")
}

// Het wegdek is van de steen van de brug (Marcel, 17 okt: "je moet altijd het materiaal waarvan de brug gemaakt is zien
// bij het pad"): kinderkopjes van veldsteen (wegdekPixel), gehakte blokken zandsteen in rijen, of klinkers in visgraat.
// Een blok heeft een afgeschuinde rand: lichter naar het licht, donkerder ervan af, en een donkere voeg.
function blokRand(fu, fv, bu, bv, licht, hs, ramp) {
  // fu, fv: waar in het blok (pixels), bu, bv: hoe groot
  const rand = Math.min(fu, bu - fu, fv, bv - fv);
  UIT.ramp = ramp;
  if (rand < 0.8) {
    UIT.stap = 1.2; // de voeg
    return;
  }
  let s = 3.6 + (hs % 3) * 0.4;
  if (rand < 1.8) {
    // de schuine rand: naar welke kant kijkt hij?
    const nu = fu < 1.8 ? -1 : bu - fu < 1.8 ? 1 : 0;
    const nv = fv < 1.8 ? -1 : bv - fv < 1.8 ? 1 : 0;
    s += (nu * licht[0] + nv * licht[1]) * 1.1;
  }
  UIT.stap = s;
}
function wegdekVan(steen, u, v, q, zaad, licht) {
  if (steen === 'baksteen') {
    // klinkers in visgraat: liggend om en om staand, in schuine banden (een klinker is 2 bij 1 cel)
    const S = 4;
    const a = Math.floor(u / S);
    const b = Math.floor(v / S);
    const d = (((a - b) % 4) + 4) % 4;
    const [ka, kb, lang] = d === 0 ? [a, b, true] : d === 1 ? [a - 1, b, true] : d === 3 ? [a, b, false] : [a, b - 1, false];
    const hs = hash(ka, kb, zaad + 41);
    blokRand(u - ka * S, v - kb * S, lang ? 2 * S : S, lang ? S : 2 * S, licht, hs, RAMP.baksteen);
    if (hs % 11 === 0) UIT.stap -= 0.8; // een donkere klinker
    return;
  }
  if (steen === 'zandsteen') {
    // gehakte blokken in rijen dwars op de brug, de voegen verspringend
    const r = Math.floor(u / 9);
    let a = -(hash(r, 2, zaad + 43) % 11);
    let k = 0;
    const lengte = (k) => 11 + (hash(r, k, zaad + 45) % 7);
    while (a + lengte(k) <= v) a += lengte(k++);
    const hs = hash(r, k, zaad + 47);
    blokRand(u - r * 9, v - a, 9, lengte(k), licht, hs, RAMP.zandsteen);
    if (UIT.stap > 2 && ruis2(u * 0.15, v * 0.15, zaad + 49) > 0.7) UIT.stap -= 0.6; // vlekken
    return;
  }
  wegdekPixel(u, v, q, steen, zaad, licht);
}

// Wat de jaren doen (o.oud): mos aan de natte voet en in de voegen, korstmos, een donkere natte rand bij het water.
function verweer(u, h, zaad, o) {
  const voeg = UIT.stap;
  if (h < BRUG.waterVlak + 3) UIT.stap -= 1.5; // de natte rand
  if (h < BRUG.waterVlak + 7 && ruis2(u * 0.13, h * 0.35, zaad + 2) > 0.58) {
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

// Een stuk van één stap. o:
//   raam      het raam van de brug (raam(o))
//   i         de stap: -1 en L zijn de landhoofden, 0 tot L - 1 boven het water
//   stuk      'begin' of 'eind' (een landhoofd, op de oever), of 'water'
//   boog      bij 'water': [van, tot] in stappen, de boog waar deze stap in ligt
//   steen     'veldsteen', 'zandsteen' of 'baksteen'
//   zaad      voor de steen en het verweren
function steenStuk(o) {
  const F = o.raam;
  const T = F.S; // een stap langs de brug
  const a0 = F.aW + o.i * T;
  const a1 = a0 + T;
  const { c0, c1, w } = F;
  const cm = (c0 + c1) / 2;
  const doosW = F.doos;
  const zaad = o.zaad ?? 41;
  const steen = o.steen || 'veldsteen';
  const E = (px) => px / PXH; // pixels naar eenheden
  const zDek = E(BRUG.dek);
  const zBodem = E(BRUG.waterVlak - 6);
  // het wegdek: bij een landhoofd een helling van de aanloop tot het dek, boven het water vlak
  const hoog = (a) => {
    const t = klem((a - a0) / T, 0, 1);
    if (o.stuk === 'begin') return BRUG.aanloop + sBocht(t) * (BRUG.dek - BRUG.aanloop);
    if (o.stuk === 'eind') return BRUG.aanloop + sBocht(1 - t) * (BRUG.dek - BRUG.aanloop);
    return BRUG.dek;
  };
  // de opening van de boog op deze tegel: langs (in tegels vanaf de eerste tegel water) en hoogte (px)
  const boog = o.boog;
  const kruin = BRUG.dek - BRUG.dikte - 1;
  const voet = BRUG.waterVlak + 1;
  const pijler = (BRUG.pijler * TEGEL) / T; // in stappen
  function inBoog(u, h) {
    if (!boog) return 0;
    const s0 = boog[0] + pijler;
    const s1 = boog[1] - pijler;
    const m = (s0 + s1) / 2;
    const hw = (s1 - s0) / 2;
    const t = (u - m) / hw;
    if (Math.abs(t) >= 1 || h < voet - 2) return 0;
    const top = voet + (kruin - voet) * Math.sqrt(1 - t * t);
    if (h > top + 4.5) return 0;
    if (h > top) {
      // de boogstenen: een ring om de boog, met voegen naar het midden toe
      const hoek = Math.atan2(h - voet, (u - m) * 40 * F.stap);
      return Math.floor(hoek / (Math.PI / (6 + 2 * hw))) % 2 ? 3 : 4;
    }
    return top - h < 2.2 ? 2 : 1; // 2: de rand van het gewelf (donker), 1: open
  }
  const lokaal = (X, Y) => (F.langs(X, Y) - F.aW) / T; // u in stappen vanaf het water

  // de zijkant (en de kop van een landhoofd): steen, met de boog waar je het water doorheen ziet
  const zijTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const langs = F.langs(X, Y);
    const u = langs * SQ;
    if (vlak === 'z') {
      const dwars = F.dwars(X, Y);
      wegdekVan(steen, u, dwars * SQ, (dwars - c0) / (c1 - c0), zaad, zijTex.licht);
      return;
    }
    const zij = vlak === 'zij';
    const g = inBoog(lokaal(X, Y), h);
    if (zij && g === 1) {
      UIT.weg = true;
      return;
    }
    steenPixel(steen, u, h, zij ? 3.8 : 3, zaad);
    // de lijst: een band van gehakte steen net onder het wegdek, met een schaduwlijn eronder
    const dek = hoog(langs);
    if (zij && h > dek - 4 && h <= dek) {
      UIT.ramp = steen === 'zandsteen' ? RAMP.zandsteen : GRIJS;
      UIT.stap = h < dek - 3 ? 1.8 : 4.6 + (Math.floor(u / 11) % 2) * 0.4;
      return;
    }
    // waterstrepen: donkere banen van onder het wegdek omlaag, waar de regen van het dek afloopt
    if (zij && o.oud !== false && ruis2(u * 0.3, 0.5, zaad + 17) > 0.6) UIT.stap -= 0.9 * klem((BRUG.dek - 3 - h) / 10, 0, 1);
    if (g === 2) UIT.stap = Math.min(UIT.stap, 1.6); // het gewelf, in het donker
    else if (zij && g >= 3) {
      // de boogsteen: iets lichter, en een voeg waar de ene in de andere overgaat
      UIT.ramp = steen === 'baksteen' ? RAMP.baksteen : steen === 'zandsteen' ? RAMP.zandsteen : GRIJS;
      UIT.stap = g === 3 ? 5.6 : 4.8;
    }
    if (o.oud !== false) verweer(u, h, zaad, { klimop: o.stuk !== 'water' && zij });
  };
  // de borstwering: dezelfde steen, met een dekzerk van platte stenen; oud: hier en daar een steen eruit
  const borstTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const langs = F.langs(X, Y);
    const u = langs * SQ;
    const top = hoog(langs) + BRUG.borst;
    // een steen die eruit is: een hapje uit de bovenkant
    if (o.oud !== false) {
      const k = Math.floor(u / 9);
      if (hash(k, F.gc, zaad + 31) % 9 === 0 && h > top - 4 && (u / 9 - k) > 0.25 && (u / 9 - k) < 0.85) {
        UIT.weg = true;
        return;
      }
    }
    if (vlak === 'z') {
      UIT.ramp = steen === 'zandsteen' ? RAMP.zandsteen : GRIJS;
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
      UIT.ramp = steen === 'zandsteen' ? RAMP.zandsteen : GRIJS;
      UIT.stap = 4.5;
      return;
    }
    steenPixel(steen, u + 300, h + 60, vlak === 'zij' ? 4.2 : 3.2, zaad + 3);
    if (o.oud !== false && ruis2(u * 0.2, h * 0.3, zaad + 37) > 0.72 && hash(Math.round(u), Math.round(h), zaad + 39) % 2) {
      UIT.ramp = RAMP.olijf;
      UIT.stap = 4; // korstmos: vaal geelgroen, in vlekjes
    }
  };

  const vormen = [];
  const kopA = o.stuk === 'begin' ? -1 : o.stuk === 'eind' ? 1 : 0; // waar de kop van een landhoofd zit
  const licht = (() => {
    const lu = F.langs(K.LICHT[0], K.LICHT[1]);
    const lv = F.dwars(K.LICHT[0], K.LICHT[1]);
    const n = Math.hypot(lu, lv);
    return [lu / n, lv / n];
  })();
  zijTex.licht = licht;
  // in plakken: boven het water één, op een landhoofd PLAKKEN, elk met een vlak bovenvlak door de S-bocht
  const plakken = o.stuk === 'water' ? 1 : PLAKKEN;
  for (let j = 0; j < plakken; j++) {
    const p0 = a0 + (j / plakken) * T;
    const p1 = a0 + ((j + 1) / plakken) * T;
    const helling = E(hoog(p1) - hoog(p0)) / (p1 - p0);
    // het bovenvlak door (p0, hoog(p0)): z = hoog(p0) + helling * (a - p0), als vlak n·p = d
    const bovenVlak = (extra) => ({ n: w(-helling, 0, 1), d: E(hoog(p0) + extra) - helling * p0, naam: 'z' });
    const kop = kopA === 1 && j === plakken - 1 ? 'kop' : '-'; // de buitenkant van het laatste landhoofd
    plak(p0, p1, helling, bovenVlak, kop);
  }
  function plak(a0, a1, helling, bovenVlak, kop) {
  // het lijf: van onder het water tot het wegdek
  vormen.push(
    D.vorm(
      [
        bovenVlak(0),
        { n: w(0, 0, -1), d: -(o.stuk === 'water' ? zBodem : E(-3)), naam: '-' },
        { n: w(1, 0, 0), d: a1, naam: kop },
        { n: w(-1, 0, 0), d: -a0, naam: '-' },
        { n: w(0, 1, 0), d: c1, naam: 'zij' },
        { n: w(0, -1, 0), d: -c0, naam: 'zij' },
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
          { n: w(1, 0, 0), d: a1, naam: kop },
          { n: w(-1, 0, 0), d: -a0, naam: '-' },
          { n: w(0, 1, 0), d: k1, naam: 'zij' },
          { n: w(0, -1, 0), d: -k0, naam: 'zij' },
        ],
        borstTex,
        { deel: 61 + (zij > 0 ? 1 : 0), doos: doosW(a0, a1, k0, k1, E(Math.min(hoog(a0), hoog(a1)) - 2), E(Math.max(hoog(a0), hoog(a1)) + BRUG.borst + 1)) },
      ),
    );
  }
  }
  // een pijlerkop: de spitse voet van een pijler tussen twee bogen, aan de kant van de kijker (schuin langs zn aan beide
  // kanten: daar zie je ze allebei), tot net onder de kruin. Hij staat op de grens van twee stappen; elke stap heeft zijn
  // helft (o.kopBegin aan zijn begin, o.kopEind aan zijn eind). σ is de kant: 1 bij c1, -1 bij c0.
  for (const [kant, grens] of [['begin', o.kopBegin], ['eind', o.kopEind]]) {
    if (!grens) continue;
    for (const σ of F.as === 'zn' ? [-1, 1] : [1]) {
      const ce = σ > 0 ? c1 : c0;
      const ab = kant === 'begin' ? a0 : a1;
      const p = BRUG.pijler * TEGEL * 1.25;
      const neus = 0.3 * TEGEL;
      const zTop = E(kruin - 1);
      const val = E(4) / neus; // de kap loopt naar de neus toe af
      const z0 = zBodem;
      // de twee schuine kanten: door (ab -+ p, ce) en (ab, ce + σ neus)
      const zijL = { n: w(-neus, σ * p, 0), d: -neus * (ab - p) + σ * p * ce, naam: 'zij' };
      const zijR = { n: w(neus, σ * p, 0), d: neus * (ab + p) + σ * p * ce, naam: 'zij' };
      vormen.push(
        D.vorm(
          [
            zijL,
            zijR,
            { n: w(0, -σ, 0), d: -σ * ce + 1, naam: '-' },
            { n: w(0, σ * val, 1), d: zTop + σ * val * ce, naam: 'kap' },
            { n: w(0, 0, -1), d: -z0, naam: '-' },
            kant === 'begin' ? { n: w(-1, 0, 0), d: -ab, naam: '-' } : { n: w(1, 0, 0), d: ab, naam: '-' },
          ],
          (vlak, X, Y, Z) => {
            const h = Z * PXH;
            const u = (F.langs(X, Y) + F.dwars(X, Y)) * SQ;
            if (vlak === 'kap') {
              UIT.ramp = steen === 'zandsteen' ? RAMP.zandsteen : GRIJS;
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
          { deel: 63, doos: doosW(ab - p, ab + p, Math.min(ce - σ, ce + σ * neus), Math.max(ce - σ, ce + σ * neus), z0, zTop + 1) },
        ),
      );
    }
  }
  return { vormen, modellen: [], lichten: [], bloembakken: [] };
}

// Een hele stenen brug over L stappen water, als stukken: de landhoofden op de oevers en de stukken boven het water. o: as,
// en waar hij ligt (raam), L, steen, zaad. Geeft de stukken, elk zoals steenStuk.
function steenBrug(o) {
  const F = raam(o);
  const stukken = [];
  const bg = bogenVan(F, o.L);
  stukken.push(steenStuk({ ...o, raam: F, i: -1, stuk: 'begin' }));
  // de grenzen tussen twee bogen: daar staat een pijler, met zijn kop
  const pijlers = new Set(bg.slice(0, -1).map(([, t]) => t));
  for (let i = 0; i < o.L; i++) {
    const boog = bg.find(([v, t]) => i >= v && i < t);
    stukken.push(steenStuk({ ...o, raam: F, i, stuk: 'water', boog, kopBegin: pijlers.has(i), kopEind: pijlers.has(i + 1) }));
  }
  stukken.push(steenStuk({ ...o, raam: F, i: o.L, stuk: 'eind' }));
  return stukken;
}

// ---------------------------------------------------------------- de houten bruggen

const HOUT = {
  dek: 22, // de bovenkant van het dek van de jukbrug, en van de boogbrug aan zijn uiteinden (px boven het maaiveld): in het
  // spel ligt het water op het maaiveld, en zo blijven de palen in zicht (op de proefplaat lag het dek 15 boven de oever)
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
    const langs = o.raam.langs(X, Y);
    const dwars = o.raam.dwars(X, Y);
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
    let st = vlak === 'z' ? 4.4 : vlak === 'zij' ? 3.4 : 2.6;
    if (hash(Math.round(lang), Math.round((o.staand ? u : h) * 2), o.zaad + 5) % 6 === 0) st -= 0.8; // de nerf
    UIT.stap = st;
    // mos aan de voet van een paal, bij het water
    if (h < BRUG.waterVlak + 6 && ruis2(u * 0.3, h * 0.3, o.zaad + 7) > 0.45) {
      UIT.ramp = RAMP.mos;
      UIT.stap = 1.5;
    }
  };
}

// Een blok hout langs de brug, in raam F: van a0 tot a1 (langs), k0 tot k1 (dwars), van z0 (px) tot een bovenkant die van
// h0 (bij a0) naar h1 (bij a1) loopt. Zijn kanten heten 'kop' en 'zij', zodat de textuur ze kent.
function blokLangs(F, a0, a1, k0, k1, z0, h0, h1, tex, deel, o = {}) {
  const E = (px) => px / PXH;
  const w = F.w;
  const helling = (E(h1) - E(h0)) / (a1 - a0);
  return D.vorm(
    [
      { n: w(-helling, 0, 1), d: E(h0) - helling * a0, naam: 'z' },
      { n: w(0, 0, -1), d: -E(z0), naam: '-' },
      { n: w(1, 0, 0), d: a1, naam: o.kop === false ? '-' : 'kop' },
      { n: w(-1, 0, 0), d: -a0, naam: '-' },
      { n: w(0, 1, 0), d: k1, naam: 'zij' },
      { n: w(0, -1, 0), d: -k0, naam: 'zij' },
    ],
    tex,
    { deel, doos: F.doos(a0, a1, k0, k1, E(z0), E(Math.max(h0, h1))) },
  );
}

// Het landhoofd van een houten brug: veldsteen, met de S-bocht van de aanloop tot het dek, daarop de eerste planken, en
// de leuning (o.kruis: met andreaskruisen). In PLAKKEN plakken, zoals de stenen brug.
function houtLandhoofd(o, dek) {
  const F = o.raam;
  const a0 = F.aW + o.i * F.S;
  const { c0, c1 } = F;
  const op = o.stuk === 'begin';
  const hoog = (a) => BRUG.aanloop + sBocht(op ? (a - a0) / F.S : 1 - (a - a0) / F.S) * (dek - BRUG.aanloop);
  const zaad = o.zaad ?? 53;
  const steenTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const u = F.langs(X, Y) * SQ;
    if (vlak === 'z') {
      houtTex({ raam: F, planken: true, zaad })(vlak, X, Y, Z);
      return;
    }
    steenPixel('veldsteen', u, h + 20, 3.8, zaad);
    verweer(u, h, zaad, { klimop: true });
  };
  const vormen = [];
  for (let j = 0; j < PLAKKEN; j++) {
    const p0 = a0 + (j / PLAKKEN) * F.S;
    const p1 = a0 + ((j + 1) / PLAKKEN) * F.S;
    vormen.push(blokLangs(F, p0, p1, c0, c1, -3, hoog(p0), hoog(p1), steenTex, 70, { kop: !op && j === PLAKKEN - 1 }));
    vormen.push(...leuning(o, p0, p1, hoog(p0), hoog(p1), 72));
  }
  return vormen;
}

// De leuning langs een stuk van één tegel: palen op elke halve tegel en twee regels, aan beide kanten, op een dek dat van
// h0 naar h1 loopt. o.kruis: andreaskruisen tussen de palen (de boogbrug), anders een middenregel (de jukbrug). Een stuk
// van de onderregel is soms weg (o.oud).
function leuning(o, a0, a1, h0, h1, deel) {
  const F = o.raam;
  const { c0, c1 } = F;
  const zaad = o.zaad ?? 53;
  const vormen = [];
  const dekOp = (a) => h0 + ((a - a0) / (a1 - a0)) * (h1 - h0);
  for (const [k0, k1] of [[c0, c0 + HOUT.regel], [c1 - HOUT.regel, c1]]) {
    // de bovenregel en de palen als één paneel: wat er niet is, valt weg
    const T = TEGEL;
    const paneelTex = houtTex({
      raam: F,
      zaad,
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
    vormen.push(blokLangs(F, a0, a1, k0, k1, Math.min(h0, h1), h0 + HOUT.leuning, h1 + HOUT.leuning, paneelTex, deel, { kop: false }));
  }
  return vormen;
}

// De jukbrug: een stuk van één stap. o: raam, i, stuk ('begin', 'water', 'eind'), en bij 'water' juk: of er aan het eind
// van deze stap een juk staat (op de grens met de volgende stap water).
function jukStuk(o) {
  const F = o.raam;
  const a0 = F.aW + o.i * F.S;
  const a1 = a0 + F.S;
  const { c0, c1 } = F;
  const zaad = o.zaad ?? 53;
  const vormen = [];
  if (o.stuk !== 'water') return { vormen: houtLandhoofd(o, HOUT.dek), modellen: [], lichten: [], bloembakken: [] };
  const onderDek = HOUT.dek - HOUT.dekD;
  // het dek en de langsliggers eronder (de buitenste zie je)
  vormen.push(blokLangs(F, a0, a1, c0, c1, onderDek, HOUT.dek, HOUT.dek, houtTex({ raam: F, planken: true, zaad }), 71, { kop: false }));
  for (const k of [c0 + 4, (c0 + c1) / 2 - 3, c1 - 10]) vormen.push(blokLangs(F, a0, a1, k, k + 6, onderDek - HOUT.ligger, onderDek, onderDek, houtTex({ raam: F, zaad }), 73, { kop: false }));
  // een juk op de grens met de volgende tegel: vier palen en een kesp
  if (o.juk) {
    const p = HOUT.paal / 2;
    const kespOnder = onderDek - HOUT.ligger - HOUT.kesp;
    vormen.push(blokLangs(F, a1 - p - 1, a1 + p + 1, c0 + 1, c1 - 1, kespOnder, onderDek - HOUT.ligger, onderDek - HOUT.ligger, houtTex({ raam: F, zaad }), 74));
    for (let i = 0; i < HOUT.palen; i++) {
      const k = c0 + ((i + 0.5) / HOUT.palen) * (c1 - c0);
      vormen.push(blokLangs(F, a1 - p, a1 + p, k - p, k + p, BRUG.waterVlak - 6, kespOnder, kespOnder, houtTex({ raam: F, zaad: zaad + i, staand: true }), 75));
    }
  }
  vormen.push(...leuning(o, a0, a1, HOUT.dek, HOUT.dek, 72));
  return { vormen, modellen: [], lichten: [], bloembakken: [] };
}

// Een hele jukbrug over L stappen water: een juk op elke grens tussen twee stappen water.
function jukBrug(o) {
  const F = raam(o);
  const stukken = [jukStuk({ ...o, raam: F, i: -1, stuk: 'begin' })];
  for (let i = 0; i < o.L; i++) stukken.push(jukStuk({ ...o, raam: F, i, stuk: 'water', juk: i < o.L - 1 }));
  stukken.push(jukStuk({ ...o, raam: F, i: o.L, stuk: 'eind' }));
  return stukken;
}

// De houten boogbrug (tot zes tegels water, js/eiland.js: brugBoog): het dek loopt in een boog van HOUT.dek aan de
// oevers tot bult hoger in het midden, gedragen door twee boogribben met stijltjes ertussen. o: as, ga, gc, L (tegels
// water), zaad. Elke tegel water in twee helften, zodat de boog niet hoekig wordt.
function houtBoogBrug(o) {
  const F = raam(o);
  const T = F.S;
  const zaad = o.zaad ?? 59;
  const { c0, c1 } = F;
  const bult = HOUT.bult[0] + HOUT.bult[1] * o.L * F.stap;
  const dekOp = (u) => HOUT.dek + bult * Math.sin((Math.PI * klem(u, 0, o.L)) / o.L) ** 2; // u in stappen vanaf het water; zonder knik
  const voet = BRUG.waterVlak + 1;
  const stukken = [];
  for (const stuk of ['begin', 'eind']) {
    stukken.push({ vormen: houtLandhoofd({ ...o, raam: F, i: stuk === 'begin' ? -1 : o.L, stuk, kruis: true }, HOUT.dek), modellen: [], lichten: [], bloembakken: [] });
  }
  for (let i = 0; i < o.L; i++) {
    const vormen = [];
    for (const half of [0, 0.5]) {
      const u0 = i + half;
      const u1 = u0 + 0.5;
      const a0 = F.aW + u0 * T;
      const a1 = F.aW + u1 * T;
      const h0 = dekOp(u0);
      const h1 = dekOp(u1);
      // het dek
      vormen.push(blokLangs(F, a0, a1, c0, c1, Math.min(h0, h1) - HOUT.dekD, h0, h1, houtTex({ raam: F, planken: true, zaad }), 71, { kop: false }));
      // de twee boogribben met hun stijltjes, als een paneel onder het dek: wat geen rib of stijl is, valt weg
      const kruin = dekOp(o.L / 2) - HOUT.dekD - 2;
      const ribTex = houtTex({
        raam: F,
        zaad: zaad + 2,
        weg: (u, h) => {
          const uu = (u * TEGEL - F.aW) / T;
          const top = voet + (kruin - voet) * Math.sin((Math.PI * klem(uu, 0, o.L)) / o.L);
          if (h <= top && h > top - 5) return false; // de rib
          if (h > top && h < dekOp(uu) - HOUT.dekD && ((uu * 4) % 1 + 1) % 1 < 0.12) return false; // een stijltje
          return true;
        },
      });
      for (const [k0, k1] of [[c0 + 2, c0 + 8], [c1 - 8, c1 - 2]]) vormen.push(blokLangs(F, a0, a1, k0, k1, voet - 2, h0 - HOUT.dekD, h1 - HOUT.dekD, ribTex, 76, { kop: false }));
      vormen.push(...leuning({ ...o, raam: F, kruis: true }, a0, a1, h0, h1, 72));
    }
    stukken.push({ vormen, modellen: [], lichten: [], bloembakken: [] });
  }
  return stukken;
}

// Hoe hoog het wegdek ligt (px boven het maaiveld, zonder de bolling) op a stappen langs de brug vanaf zijn eerste stap
// water: van -1 (de buitenkant van het eerste landhoofd) tot L + 1. Zo hoog gaat wie erop loopt mee omhoog; het spel rekent
// hetzelfde uit met de maten uit de beschrijving (bruggen-vel.cjs, js/sprites.js: S.brugDek).
function dekOp(soort, L, a, stap = 1) {
  const dek = soort === 'steen' ? BRUG.dek : HOUT.dek;
  if (a < 0) return BRUG.aanloop + (dek - BRUG.aanloop) * sBocht(klem(a + 1, 0, 1));
  if (a > L) return BRUG.aanloop + (dek - BRUG.aanloop) * sBocht(klem(L + 1 - a, 0, 1));
  if (soort !== 'boog') return dek;
  return dek + (HOUT.bult[0] + HOUT.bult[1] * L * stap) * Math.sin((Math.PI * a) / L) ** 2;
}

// Zet een brug neer als één ding: dan tekent de omlijning geen naad tussen twee stukken.
function zetBrug(B, stukken) {
  const obj = B.volgendObj++;
  const vormen = stukken.flatMap((s) => s.vormen);
  for (const v of vormen) v.obj = obj;
  D.tekenVormen(B, vormen, { omlijn: true });
  return vormen;
}

module.exports = { BRUG, HOUT, ASSEN, raam, bogen, dwarsVan, steenStuk, steenBrug, jukStuk, jukBrug, houtBoogBrug, dekOp, zetBrug };

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

// Een punt op een brug, a stappen langs (vanaf het water) en q dwars (0 tot 1), in tegels van de tekening.
function opBrug(o, a, q) {
  const F = raam(o);
  const A = ASSEN[o.as];
  const la = F.aW + a * F.S;
  const lc = F.c0 + q * (F.c1 - F.c0);
  return [(la * A.U[0] + lc * A.V[0]) / TEGEL, (la * A.U[1] + lc * A.V[1]) / TEGEL];
}

// De proefplaat van de schuine bruggen (vraag R; Marcel, 17 okt: "De bruggen moeten in 8 richtingen", "Zoals hoe de
// poppetjes lopen"): een rivier recht omlaag op het scherm met twee bruggen recht opzij (wo: veldsteen met een peloton,
// en de houten boogbrug), en een rivier recht opzij met drie bruggen recht omhoog (zn: zandsteen, de jukbrug, en baksteen
// in drie rijen in plaats van vier, om te vergelijken). Het water ligt zoals in het spel bijna op het maaiveld.
function schuinePlaat(UIT_MAP) {
  const { soldaat } = require('./heer.cjs');
  const { boer } = require('./dorpelingen.cjs');
  const E = (px) => px / PXH;
  BRUG.waterVlak = -1;
  const dek = E(BRUG.dek + BRUG.bol);
  const langsUit = (o, verder) => [opBrug(o, -1 - verder, 0.5), opBrug(o, o.L + 1 + verder, 0.5)];
  // 1. de rivier recht omlaag, de bruggen recht opzij
  const steen = { as: 'wo', gx: 4, gy: 9, L: 3, steen: 'veldsteen', zaad: 41 };
  const hout = { as: 'wo', gx: 13, gy: 18, L: 3, zaad: 59 };
  const m1 = opBrug(steen, 1.5, 0.5);
  const m2 = opBrug(hout, 1.5, 0.5);
  const peloton = [];
  for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) peloton.push({ model: soldaat({ houding: 'lopen', fase: (r + k) / 4 }), xy: opBrug(steen, 0.3 + r * 0.75, 0.3 + k * 0.4), richting: 'O', z: dek });
  const een = scene({
    b: 1500, h: 900, OX: 860, OY: 60, kader: [-6, -6, 30, 30],
    beken: [{ punten: [[m1[0] - 14, m1[1] - 14], m1, m2, [m2[0] + 14, m2[1] + 14]], breed: 3.6, diep: 1 }],
    paden: [steen, hout].flatMap((o) => langsUit(o, 0).map((p, i) => ({ punten: [p, langsUit(o, 6)[i]], breed: 2.8 }))),
    bruggen: [steenBrug(steen), houtBoogBrug(hout)],
    dingen: [
      ...peloton.map((d) => ({ ...d, x: d.xy[0], y: d.xy[1] })),
      { model: boer({ houding: 'staan', fase: 0 }), x: opBrug(hout, 1.5, 0.4)[0], y: opBrug(hout, 1.5, 0.4)[1], richting: 'W', z: E(dekOp('boog', 3, 1.5, Math.SQRT2)) },
    ],
  });
  // 2. de rivier recht opzij, de bruggen recht omhoog
  const zand = { as: 'zn', gx: 2, gy: 31, L: 3, steen: 'zandsteen', zaad: 45 };
  const juk = { as: 'zn', gx: 9, gy: 24, L: 3, zaad: 53 };
  const bak = { as: 'zn', gx: 16, gy: 17, L: 3, steen: 'baksteen', zaad: 47, rijen: 3 };
  const ms = [zand, juk, bak].map((o) => opBrug(o, 1.5, 0.5));
  const twee = scene({
    b: 1500, h: 700, OX: 1250, OY: -250, kader: [-8, 4, 34, 50],
    beken: [{ punten: [[ms[0][0] - 12, ms[0][1] + 12], ...ms, [ms[2][0] + 12, ms[2][1] - 12]], breed: 3.6, diep: 1 }],
    paden: [zand, juk, bak].flatMap((o) => langsUit(o, 0).map((p, i) => ({ punten: [p, langsUit(o, 5)[i]], breed: o.rijen === 3 ? 2.1 : 2.8 }))),
    bruggen: [steenBrug(zand), jukBrug(juk), steenBrug(bak)],
    dingen: [
      { model: boer({ houding: 'staan', fase: 0 }), x: opBrug(zand, 2.4, 0.2)[0], y: opBrug(zand, 2.4, 0.2)[1], richting: 'Z', z: dek },
      { model: soldaat({ houding: 'staan', fase: 0 }), x: opBrug(juk, 2.4, 0.2)[0], y: opBrug(juk, 2.4, 0.2)[1], richting: 'N', z: E(HOUT.dek) },
      { model: soldaat({ houding: 'staan', fase: 0 }), x: opBrug(bak, 2.4, 0.25)[0], y: opBrug(bak, 2.4, 0.25)[1], richting: 'Z', z: dek },
    ],
  });
  const plaat = new K.Plaat(1500, een.h + twee.h);
  plaat.plak(een, 0, 0);
  plaat.plak(twee, 0, een.h);
  fs.writeFileSync(path.join(UIT_MAP, 'bruggen-schuin.png'), K.png(plaat, 1));
  console.log(`uit/bruggen-schuin.png (${plaat.b}×${plaat.h})`);
}

if (require.main === module && process.argv[2] === 'schuin') {
  const UIT_MAP = path.join(__dirname, 'uit');
  fs.mkdirSync(UIT_MAP, { recursive: true });
  console.time('schuin');
  schuinePlaat(UIT_MAP);
  console.timeEnd('schuin');
} else if (require.main === module) {
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
