// De spreukeffecten als pixel art: de kop van een vuurschicht, de inslag, het dwaallicht, een
// vlammetje, stofjes en blad voor de windstoot, lichtpoelen op de vloer, en de zucht — het grijs
// dat van een tovenaar afgaat als een spreuk hem tijd kost.
//
// Alles hier is plat getekend, pixel voor pixel, maar met dezelfde regels als de rest van de kunst
// (kern.cjs): vaste kleurrampen, licht van linksboven, en alleen een dambord in een smalle strook
// waar het licht van tint verandert. Vuur en licht gloeien uit zichzelf: daar komt de stap uit
// de hitte, niet uit het licht. Een wolkje (de zucht, stof) is een klontje bollen dat van
// linksboven wordt belicht, met de donkerste tint aan de schaduwkant als rand.
//
// Wat vervliegt, lost op in de vaste volgorde van een 4×4-dambord (Bayer): nooit half doorzichtig,
// altijd hele pixels die wegvallen. Dat is hoe pixel art rook laat verdwijnen.
//
// De beelden worden vooraf gerenderd (effecten-export.cjs). Wat van de plek in het spel afhangt —
// de staart van een schicht, vonken, slierten wind, de bewegende stofjes — tekent het spel zelf,
// als losse pixels in dezelfde rampen (js/tekenen.js).
'use strict';
const K = require('./kern.cjs');
const { Plaat, RAMPEN, rnd, ruis2, klem } = K;

const bayer = (x, y) => K.BAYER4[((y & 3) << 2) | (x & 3)];

// Een zwevende stap naar een hele, zoals kern.kwantiseer: alleen in een smalle strook rond de
// grens tussen twee stappen een dambord.
function heel(s, x, y, smal = 0.08) {
  const fl = Math.floor(s);
  const fr = s - fl;
  if (fr < 0.5 - smal) return fl;
  if (fr > 0.5 + smal) return fl + 1;
  return fl + ((x + y) & 1 ? 0 : 1);
}

// Een beeld uit een veld: veld(x, y) krijgt het midden van een pixel en geeft [ramp, stap]
// (de stap mag zweven) of null.
function uitVeld(b, h, veld) {
  const p = new Plaat(b, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      const v = veld(x + 0.5, y + 0.5, x, y);
      if (v) p.zet(x, y, v[0], heel(v[1], x, y));
    }
  }
  return p;
}

function gespiegeld(p) {
  const q = new Plaat(p.b, p.h);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(p.b - 1 - x, y);
      if (k) q.zet(x, y, k[0], k[1]);
    }
  }
  return q;
}

// ---------------------------------------------------------------- vuur

// De kop van een vuurschicht, vliegend in één van zestien richtingen op het scherm (0 is naar
// rechts, dan met de klok mee in stappen van 22,5°). Voorop een witheete kern, erachter een lijf
// van vlammen dat naar de staart toe smaller en roder wordt en heen en weer tongt. De rest van de
// staart zijn losse vonken die het spel achterlaat.
const VUURKOP = { b: 27, h: 27, anker: [13, 13], beelden: 4, richtingen: 16 };
function vuurkop(richting, beeld) {
  const hoek = (richting * Math.PI) / 8;
  const ca = Math.cos(hoek);
  const sa = Math.sin(hoek);
  const [ax, ay] = VUURKOP.anker;
  return uitVeld(VUURKOP.b, VUURKOP.h, (x, y) => {
    const px = x - (ax + 0.5);
    const py = y - (ay + 0.5);
    const u = px * ca + py * sa; // langs de vlucht, voorop is +u
    const v = -px * sa + py * ca; // dwars erop
    const staart = 12.5;
    const t = klem(-u / staart, 0, 1);
    const tong = (ruis2(-u * 0.3 + beeld * 1.9, 2.5 + richting * 0.1, 11) - 0.5) * 3 * t;
    const breed = 5.2 * (1 - 0.62 * t);
    const kern = 1 - Math.hypot(u * 1.15, v) / 5;
    const lijf = u > 1.5 || -u > staart ? -1 : 1 - Math.abs(v - tong) / breed - t * 0.42;
    const ruis = ruis2(u * 0.5 + beeld * 2.3, v * 0.5 + 7, 5) - 0.5;
    const heet = Math.max(kern * 1.35, lijf) * 7 + ruis * 1.8 * (0.35 + t);
    if (heet < 1) return null;
    return ['vuur', Math.min(7, heet)];
  });
}

// Het opbouwen in de bol van de staf: een bolletje vuur dat groeit tot het de kop van de schicht
// is. Rond, want het vliegt nog niet.
const VUUROPBOUW = { b: 17, h: 17, anker: [8, 8], beelden: 6 };
function vuuropbouw(beeld) {
  const r = 1.3 + beeld * 0.85;
  const [ax, ay] = VUUROPBOUW.anker;
  return uitVeld(VUUROPBOUW.b, VUUROPBOUW.h, (x, y) => {
    const px = x - (ax + 0.5);
    const py = y - (ay + 0.5);
    const d = Math.hypot(px, py);
    const hoek = Math.atan2(py, px);
    // de rand likt omhoog: boven wat verder uit dan onder
    const rand = r * (1 + 0.18 * -Math.sin(hoek)) + (ruis2(hoek * 2 + beeld * 3.1, beeld, 21) - 0.5) * 1.3;
    if (d > rand + 0.3) return null;
    return ['vuur', klem(7.4 - (d / Math.max(1, rand)) * 5.4, 1, 7)];
  });
}

// Het loslaten: een ster van licht in de bol, dan een ring die wegvalt.
const LOSLATEN = { b: 21, h: 21, anker: [10, 10], beelden: 3 };
function loslaten(beeld) {
  const [ax, ay] = LOSLATEN.anker;
  return uitVeld(LOSLATEN.b, LOSLATEN.h, (x, y, ix, iy) => {
    const px = x - (ax + 0.5);
    const py = y - (ay + 0.5);
    const d = Math.hypot(px, py);
    if (beeld === 0) {
      if (d < 2.6) return ['vuur', 7];
      const recht = (Math.abs(px) < 0.6 && Math.abs(py) < 9) || (Math.abs(py) < 0.6 && Math.abs(px) < 9);
      const schuin = Math.abs(Math.abs(px) - Math.abs(py)) < 0.6 && d < 5.5;
      if (recht) return ['vuur', d < 5 ? 6 : 5];
      if (schuin) return ['vuur', 5];
      return null;
    }
    const r = beeld === 1 ? 5.5 : 7.6;
    if (Math.abs(d - r) > 0.55) return beeld === 1 && d < 1.6 ? ['vuur', 6] : null;
    const heel = rnd(ix, iy, 40 + beeld) < (beeld === 1 ? 0.8 : 0.45);
    return heel ? ['vuur', beeld === 1 ? 5 : 3] : null;
  });
}

// De inslag: een witte flits, een bal vuur die opzwelt, openbreekt, stijgt en als roet uiteenvalt.
const INSLAG = { b: 52, h: 52, anker: [26, 30], beelden: 8 };
function inslag(beeld) {
  const [ax, ay] = INSLAG.anker;
  if (beeld === 0) {
    return uitVeld(INSLAG.b, INSLAG.h, (x, y) => {
      const px = x - (ax + 0.5);
      const py = y - (ay + 0.5);
      const d = Math.hypot(px, py);
      if (d < 4.2) return ['vuur', 7];
      if (d < 5.4) return ['vuur', 6];
      const recht = (Math.abs(px) < 0.6 && Math.abs(py) < 12) || (Math.abs(py) < 0.6 && Math.abs(px) < 14);
      const schuin = Math.abs(Math.abs(px) - Math.abs(py)) < 0.6 && d < 9;
      if (recht) return ['vuur', d < 8 ? 6 : 5];
      if (schuin) return ['vuur', d < 6.5 ? 6 : 4];
      return null;
    });
  }
  const R = [0, 9, 12.5, 14.5, 15.5, 16, 16, 15.5][beeld];
  const koel = [0, 0, 0.9, 2, 3, 3.8, 4.4, 4.9][beeld];
  const op = [0, 0, 0.6, 1.6, 3, 4.6, 6.2, 8][beeld];
  // uiteenvallen: de drempel stijgt, het eerst waar de ruis hoog is (zie wolk hieronder)
  const scheur = [0, 0, 0, 0, 0.5, 1.4, 2.4, 3.3][beeld];
  return uitVeld(INSLAG.b, INSLAG.h, (x, y, ix, iy) => {
    const px = x - (ax + 0.5);
    let py = y - (ay + 0.5) + op;
    // vlammen stijgen: boven rekt het vuur uit, onder blijft het rond
    if (py < 0) py /= 1 + 0.07 * beeld;
    const d = Math.hypot(px, py) / R;
    if (d > 1.25) return null;
    const ruis = ruis2(px * 0.28 + beeld * 1.7, py * 0.28 - beeld * 0.9, 31) - 0.5;
    const fijn = ruis2(px * 0.7, py * 0.7 + beeld * 2.3, 37) - 0.5;
    // roet wordt van linksboven belicht; het vuur zelf gloeit
    const licht = beeld >= 5 ? ((-px - py) / R) * 0.8 : 0;
    const heet = 7.6 * (1 - d * d) - koel * (1 - 0.35 * d) + ruis * 3 + fijn * 1.2 + licht;
    const drempel = 0.9 + scheur * (0.35 + ruis2(px * 0.22 + 3, py * 0.22 - beeld * 0.6, 39));
    if (heet < drempel) return null;
    if (scheur && heet < drempel + 0.35 && (ix + iy) & 1) return null; // de rafelrand
    return ['vuur', Math.min(7, heet)];
  });
}

// Een vlammetje dat nabrandt op een geraakt monster: onderin heet, bovenin een rode punt die
// heen en weer tongt. Vier beelden die herhalen.
const VLAMMETJE = { b: 11, h: 16, anker: [5, 15], beelden: 4 };
function vlammetje(beeld) {
  const [ax, ay] = VLAMMETJE.anker;
  return uitVeld(VLAMMETJE.b, VLAMMETJE.h, (x, y) => {
    const u = ay + 1 - y; // hoogte boven de voet
    const hoog = 13.5 + (ruis2(beeld * 1.9, 3, 51) - 0.5) * 3;
    if (u < 0 || u > hoog) return null;
    const t = u / hoog;
    const tong = (ruis2(u * 0.28 + beeld * 1.6, 1.5, 53) - 0.5) * 3.6 * t;
    const breed = 3.9 * Math.pow(1 - t, 0.75) + 0.3;
    const d = Math.abs(x - (ax + 0.5) - tong) / breed;
    if (d > 1) return null;
    const heet = 7.2 * (1 - d * 0.8) - t * 4.6 + (ruis2(x * 0.6, u * 0.6 - beeld * 2, 57) - 0.5) * 1.4;
    if (heet < 1) return null;
    return ['vuur', Math.min(7, heet)];
  });
}

// ---------------------------------------------------------------- licht op de vloer

// Een poel licht op de vloer, als plat ovaal (twee keer zo breed als diep, zoals een tegel). Licht
// op pixels is een dambord in de kleur van het licht: dicht in het midden, ijler naar de rand. Het
// is de plek waar het licht van tint verandert, dus hier hoort het dambord juist.
function lichtpoel(ramp, hoog, rx, ry, sterkte) {
  const b = rx * 2 + 1;
  const h = ry * 2 + 1;
  const dichtheden = [
    [0.5, 0.25, 0.125],
    [0.25, 0.125, 0.0625],
    [0.125, 0.0625, 0],
  ][sterkte];
  return uitVeld(b, h, (x, y, ix, iy) => {
    const q = Math.hypot((x - (rx + 0.5)) / rx, (y - (ry + 0.5)) / ry);
    if (q > 1) return null;
    const zone = q < 0.42 ? 0 : q < 0.72 ? 1 : 2;
    if (bayer(ix, iy) >= dichtheden[zone]) return null;
    return [ramp, hoog - zone];
  });
}

// ---------------------------------------------------------------- het dwaallicht

// Een zwevend lichtje: een witte kern, een lichtblauwe mantel, en daaromheen een vlammetje van
// licht dat omhoog likt en flakkert, zoals een dwaallicht boven een veen. Twee van de acht
// beelden zijn een dipje, en om de rand springen een paar losse glinsteringen. `maat` onder 1:
// het bolletje dat in de staf ontstaat.
const DWAALLICHT = { b: 21, h: 23, anker: [10, 13], beelden: 8 };
function dwaallicht(beeld, maat = 1) {
  const [ax, ay] = DWAALLICHT.anker;
  const dip = maat === 1 && (beeld === 3 || beeld === 6);
  const mantel = (dip ? 3.7 : 4.4) * maat;
  const glinster = [];
  if (maat === 1) {
    for (let k = 0; k < 2; k++) {
      const a = rnd(beeld, k, 61) * Math.PI * 2;
      const r = 6.4 + rnd(beeld, k, 63) * 2.4;
      glinster.push([Math.round(ax + Math.cos(a) * r), Math.round(ay + Math.sin(a) * r)]);
    }
  }
  const lik = (ruis2(beeld * 1.3, 4, 69) - 0.5) * 2.6; // de punt zwaait heen en weer
  return uitVeld(DWAALLICHT.b, DWAALLICHT.h, (x, y, ix, iy) => {
    if (glinster.some(([gx, gy]) => gx === ix && gy === iy)) return ['water', dip ? 6 : 7];
    let px = x - (ax + 0.5);
    const py = y - (ay + 0.5);
    if (py < 0) px -= lik * Math.min(1, -py / (mantel * 1.8)); // boven buigt het mee
    const d = Math.hypot(px, py);
    const hoek = Math.atan2(py, px);
    const omhoog = Math.max(0, -Math.sin(hoek)); // 1 recht boven, 0 opzij en onder
    const rand = mantel * (1 + 0.65 * omhoog * omhoog) + (ruis2(hoek * 0.9 + beeld * 2.1, beeld * 0.8, 67) - 0.5) * 1.6 * maat;
    if (d > rand + 1.1) return null;
    if (d > rand) return (ix + iy) & 1 ? null : ['water', 4]; // de gloed eromheen: een dambord
    const kern = dip ? 6.5 : 7.4;
    const binnen = Math.hypot(px, py * 1.15);
    return ['water', klem(kern - (binnen / Math.max(0.8, mantel)) * 2.2, 4.6, 7)];
  });
}

// ---------------------------------------------------------------- wolkjes: zucht en stof

// Een wolkje als klontje bollen, zoals rook in pixel art: elke bol is een bolletje met zijn eigen
// licht van linksboven, en waar ze over elkaar liggen wint de bovenste. Zo krijgt de rand bulten
// en elke bult een eigen glans, in plaats van één gladde worst. Een randpixel aan de
// schaduwkant (rechts, onder) krijgt de donkerste stap, als de omlijning van de rest.
//
// `weg` (0..1) laat het wolkje vervliegen. Dat gaat niet met een regelmatig raster van gaten,
// maar zoals rook: de bollen worden dunner, en waar de ruis hoog is scheuren ze het eerst open,
// zodat er plukken overblijven die kleiner worden. Alleen de smalle strook langs de nieuwe rand
// krijgt een dambord.
const LICHT = (() => {
  const l = [-0.62, -0.68, 0.62];
  const n = Math.hypot(...l);
  return l.map((c) => c / n);
})();
function wolk(b, h, bollen, o) {
  const { ramp, lo, hi, weg = 0, zaad = 0 } = o;
  const H = new Float32Array(b * h).fill(-1); // hoogte van de bovenste bol, of -1
  const L = new Float32Array(b * h); // het licht op die plek
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      const scheur = weg > 0 ? weg * (0.15 + 0.95 * ruis2(x * 0.3, y * 0.3, 91 + zaad)) : 0;
      let beste = -1;
      for (const c of bollen) {
        const dx = (x + 0.5 - c.x) / c.r;
        const dy = (y + 0.5 - c.y) / c.r;
        const d2 = dx * dx + dy * dy;
        if (d2 >= 1) continue;
        const z = Math.sqrt(1 - d2);
        const hoogte = z * (c.w ?? 1) - scheur;
        if (hoogte <= 0 || hoogte <= beste) continue;
        beste = hoogte;
        L[y * b + x] = klem(dx * LICHT[0] + dy * LICHT[1] + z * LICHT[2], 0, 1);
      }
      H[y * b + x] = beste;
    }
  }
  const binnen = (x, y) => x >= 0 && y >= 0 && x < b && y < h && H[y * b + x] > 0;
  const p = new Plaat(b, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      if (!binnen(x, y)) continue;
      // de rafelrand van wat vervliegt: een smalle strook dambord
      if (weg > 0 && H[y * b + x] < 0.12 && (x + y) & 1) continue;
      let stap = lo + 1 + (hi - lo - 1) * Math.pow(L[y * b + x], 1.2);
      if (!binnen(x + 1, y) || !binnen(x, y + 1)) stap = lo;
      p.zet(x, y, ramp, heel(stap, x, y));
    }
  }
  return p;
}

// De zucht: wat er grijs van een tovenaar afgaat als een spreuk hem tijd kost. Een adem die uit
// hem opstijgt als een zuil, opkrult, loskomt, in plukken uiteenvalt en vervliegt. Hoe groter de
// prijs, hoe groter de zucht: klein voor een maand (een dwaallicht), middel voor een paar maanden
// (een windstoot), groot voor een jaar (een vuurschicht). Grijs uit de ramp van zijn baard: de
// kleur van ouderdom. Het beginpunt (oorsprong) is waar de adem hem verlaat; het spel legt dat
// bij zijn hoofd.
//
// Elke bol volgt hetzelfde pad, alleen later geboren: zo tekenen ze samen een stroom die bij de
// mond begint en boven omkrult. Is de adem op, dan laat de onderkant los en stijgt alles mee.
const ZUCHT = {
  klein: { b: 34, h: 50, oorsprong: [14, 44], stijg: 26, beelden: 8, fps: 10, bollen: 7, r: 4.6, krul: 3.2 },
  middel: { b: 48, h: 72, oorsprong: [20, 64], stijg: 40, beelden: 11, fps: 10, bollen: 10, r: 6.2, krul: 5 },
  groot: { b: 66, h: 102, oorsprong: [27, 93], stijg: 58, beelden: 14, fps: 10, bollen: 13, r: 8.2, krul: 7.5 },
};
function zucht(maat, beeld, variant = 0) {
  const z = ZUCHT[maat];
  const f = beeld / (z.beelden - 1);
  const bollen = [];
  const adem = 0.5; // zo lang komt er nog adem bij
  for (let j = 0; j < z.bollen; j++) {
    const geboren = (j / (z.bollen - 1)) * adem;
    const a = (f - geboren) / (1 - geboren);
    if (a < 0) continue;
    // bijna gelijkmatig stijgen: dan sluiten de bollen bij de mond op elkaar aan
    const stijg = z.stijg * Math.pow(a, 1.1);
    // eerst een S, en boven een krul naar opzij; elke bol bolt wat uit naar een eigen kant
    const golf = Math.sin(a * Math.PI * 1.6 + variant * 0.8) * Math.min(1, a * 2.5);
    const uit = (rnd(j, variant, 3) - 0.5) * z.r * 0.7;
    const x = z.oorsprong[0] + z.krul * (golf + 1.3 * a * a) + uit;
    const y = z.oorsprong[1] - stijg + (rnd(j, variant, 5) - 0.5) * 2;
    const r = z.r * (0.4 + 0.75 * Math.pow(a, 0.8)) * (0.7 + 0.6 * rnd(j, variant, 9));
    bollen.push({ x, y, r, w: 1 - 0.45 * a });
  }
  // grijs: eerst lichter (een adem), dan donkerder naarmate hij vervliegt
  const hi = f < 0.4 ? 5 : f < 0.7 ? 4 : 3;
  const weg = 1.25 * Math.pow(klem((f - 0.34) / 0.66, 0, 1), 1.15);
  return wolk(z.b, z.h, bollen, { ramp: 'baard', lo: 1, hi, weg, zaad: variant });
}

// Een stofje dat de windstoot van de vloer opjaagt: groeit even op en vervliegt.
const STOFJE = { b: 15, h: 13, anker: [7, 10], beelden: 6 };
function stofje(beeld, variant = 0) {
  const f = beeld / (STOFJE.beelden - 1);
  const bollen = [];
  for (let j = 0; j < 3; j++) {
    const a = rnd(j, variant, 81) * Math.PI * 2;
    const r = (1.6 + 2.6 * Math.sqrt(f)) * (0.75 + 0.5 * rnd(j, variant, 83));
    bollen.push({
      x: STOFJE.anker[0] + 0.5 + Math.cos(a) * 2.2 * (0.4 + f),
      y: STOFJE.anker[1] + 0.5 - 2 - f * 3 + Math.sin(a) * 1.4,
      r,
    });
  }
  return wolk(STOFJE.b, STOFJE.h, bollen, { ramp: 'zand', lo: 3, hi: 8, weg: 1.5 * klem((f - 0.3) / 0.7, 0, 1), zaad: variant });
}

// Een blaadje dat meewaait: vier standen van een ronddraaiend blad, van linksboven belicht.
const BLAD = { b: 7, h: 7, anker: [3, 3], beelden: 4 };
function blad(ramp, beeld) {
  const hoek = (beeld * Math.PI) / 4;
  const ca = Math.cos(hoek);
  const sa = Math.sin(hoek);
  const lang = 2.7 - Math.abs(Math.sin(hoek * 2)) * 0.5;
  const hi = RAMPEN[ramp].length - 1;
  return uitVeld(BLAD.b, BLAD.h, (x, y) => {
    const px = x - 3.5;
    const py = y - 3.5;
    const u = px * ca + py * sa;
    const v = -px * sa + py * ca;
    if ((u / lang) ** 2 + (v / 1.25) ** 2 > 1) return null;
    return [ramp, px + py < 0 ? hi - 1 : hi - 3];
  });
}

module.exports = {
  heel, uitVeld, gespiegeld, wolk, bayer,
  VUURKOP, vuurkop, VUUROPBOUW, vuuropbouw, LOSLATEN, loslaten, INSLAG, inslag, VLAMMETJE, vlammetje,
  lichtpoel, DWAALLICHT, dwaallicht, ZUCHT, zucht, STOFJE, stofje, BLAD, blad,
};
