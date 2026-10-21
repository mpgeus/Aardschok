// Van de generator naar het spel (werklijst Q, f; ontwerp/beelden-van-de-generator.md). Marcel, 21 okt: "Dan kunnen we de
// andere generator deze 1 voor 1 laten maken. Jij moet dan zorgen dat ze passend worden in het spel." Een vel van de
// generator (een rij poppetjes op een effen magenta achtergrond, `bron/<soort>/<naam>.webp` of .png) wordt hier:
//   1. van webp naar png (met de Python van ComfyUI, PIL; de bron blijft zoals hij is);
//   2. de achtergrond eruit (magenta, met de randjes die naar magenta trekken);
//   3. de poppetjes los: de stukken die aan elkaar hangen, en per stuk het beeld met het dichtste midden in de rij; een
//      klein los stukje bij het dichtste grote stuk; een stuk over meer middens (een speer die het buurbeeld raakt):
//      de dikke kernen (de lijven, zonder de dunne schachten) naar hun midden, `toewijzing` vooraf (rechthoeken in de bron,
//      eventueel alleen wat op een speer lijkt), en dan groeit elk beeld vanuit zijn kernen over wat eraan vastzit;
//   4. het anker: staan op het midden van de voeten van elk poppetje; een beweging op het midden van zijn vak in de rij en
//      één grondlijn, zodat de beweging blijft zoals de generator haar tekende;
//   5. verkleind naar de maat van het spel (gemiddeld per blok, met de doorzichtigheid erbij, en dan scherp);
//   6. de vellen zoals het spel ze leest (figuurvel.cjs: een rij per richting Z ZW W NW N NO O ZO, een kolom per beeld,
//      en <naam>.json met cel, anker, snelheid en houdingen), in uit/generator/animaties/, voor naar-spel.cjs.
// Een richting die de generator nog niet maakte, krijgt voorlopig het staande beeld van die richting (vast); dat staat
// in de proefplaat.
//
// De masterprompt (beelden-van-de-generator.md) levert genummerde vellen: `bron/<soort>/<naam>/01.webp` (staan, acht
// richtingen) en dan per beweging één vel per richting in de volgorde Z ZW W NW N NO O ZO (`genummerd`). Een nummer dat
// er nog niet is, komt uit de losse vellen van eerder (`vel`), en anders uit het staande beeld.
//
//   node gereedschap/pixelart/generator.cjs speerman      de vellen en uit/generator/speerman.png (de proefplaat), met
//                                                          de bewegingen als bewegend beeld
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const K = require('./kern.cjs');
const H = require('./hdproef.cjs');

const BRON = path.join(__dirname, 'bron');
const UIT = path.join(__dirname, 'uit', 'generator');
const PYTHON = process.env.PYTHON || 'C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe';
const KANTEN = K.KANTEN;

// De poppetjes. hoogte: van de bovenkant van het hoofd (de helm) tot de voeten in de bron, gemeten op het staande vel;
// doel: dezelfde maat in het spel (1×; de soldaat van de heer is 74 pixels tot de helm). Per houding het vel, de
// richting(en), het aantal beelden en de snelheid (zoals het spel ze nu heeft: beelden/beschrijving.json).
const FIGUREN = {
  speerman: {
    soort: 'soldaten',
    hoogte: 380,
    doel: 74,
    snelheid: 1.5,
    // de masterprompt: vel 1 staan, 2 tot 9 lopen, 10 tot 17 aanval, 18 tot 25 sterven
    genummerd: { map: 'speerman', staan: 1, lopen: 2, aanval: 10, sterven: 18 },
    houdingen: {
      staan: { vel: 'speerman-staan', richtingen: KANTEN, beelden: 1, fps: 4 },
      lopen: { vel: 'speerman-lopen-ZW', richtingen: ['ZW'], beelden: 8, fps: 10 },
      // de speer van beeld 5 steekt in het vak van beeld 4 (de punt), en die van 6 in dat van 5
      // de namen die het spel al kent (js/sprites.js S.houding): 'aanval' bij een klap (e.uitval), 'sterven' als hij valt
      aanval: { vel: 'speerman-aanvallen-ZW', richtingen: ['ZW'], beelden: 8, fps: 10, herhaal: false, toewijzing: [[899, 343, 1010, 372, 4, 'speer'], [1236, 350, 1300, 372, 5, 'speer']] },
      sterven: { vel: 'speerman-vallen-ZW', richtingen: ['ZW'], beelden: 7, fps: 8, herhaal: false },
    },
  },
};

// ---------------------------------------------------------------- de bron lezen

// Is er een bron met deze naam (png of webp)?
const heeftBron = (soort, naam) => ['png', 'webp'].some((x) => fs.existsSync(path.join(BRON, soort, `${naam}.${x}`)));
function leesBron(soort, naam) {
  const map = path.join(BRON, soort);
  const png = path.join(map, `${naam}.png`);
  if (fs.existsSync(png)) return H.lees(png);
  const webp = path.join(map, `${naam}.webp`);
  const tussen = path.join(UIT, 'bron', `${naam.replace(/[\\/]/g, '-')}.png`);
  fs.mkdirSync(path.dirname(tussen), { recursive: true });
  if (!fs.existsSync(tussen) || fs.statSync(tussen).mtimeMs < fs.statSync(webp).mtimeMs) {
    execFileSync(PYTHON, ['-I', '-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGBA").save(sys.argv[2])', webp, tussen]);
  }
  return H.lees(tussen);
}

// ---------------------------------------------------------------- uitknippen

// Wat voorgrond is: niet magenta. Magenta is waar rood en blauw allebei ver boven groen liggen; een randje dat naar
// magenta trekt (de overgang van de generator) telt ook als achtergrond.
const isAchter = (r, g, b) => Math.min(r, b) - g > 45;
function voorgrond(beeld) {
  const N = beeld.b * beeld.h;
  const fg = new Uint8Array(N);
  for (let i = 0; i < N; i++) fg[i] = isAchter(beeld.rgba[i * 4], beeld.rgba[i * 4 + 1], beeld.rgba[i * 4 + 2]) ? 0 : 1;
  return fg;
}
// De stukken die aan elkaar hangen (acht buren), met hun pixels.
function stukken(fg, b, h) {
  const lab = new Int32Array(b * h).fill(-1);
  const uit = [];
  for (let i = 0; i < b * h; i++) {
    if (!fg[i] || lab[i] >= 0) continue;
    const s = { pixels: [], x0: 1e9, x1: -1 };
    const stapel = [i];
    lab[i] = uit.length;
    while (stapel.length) {
      const p = stapel.pop();
      s.pixels.push(p);
      const x = p % b;
      const y = (p - x) / b;
      s.x0 = Math.min(s.x0, x);
      s.x1 = Math.max(s.x1, x);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Y = y + dy;
        if (X < 0 || Y < 0 || X >= b || Y >= h) continue;
        const q = Y * b + X;
        if (fg[q] && lab[q] < 0) {
          lab[q] = uit.length;
          stapel.push(q);
        }
      }
    }
    uit.push(s);
  }
  return uit;
}
// Lijkt deze kleur op een speer (grijs staal of een donkerbruine schacht), en niet op de wapenrok (geel, blauw)?
function speerKleur(r, g, b) {
  const geel = r > 170 && g > 120 && b < 100;
  const blauw = b > r + 30 && b > g + 15;
  return !geel && !blauw;
}
// De kern van de voorgrond: pixels waarvan het hele blok van (2r+1) bij (2r+1) voorgrond is (een integraalbeeld), zodat
// de dunne schachten wegvallen en de lijven blijven.
function kernVan(fg, b, h, r) {
  const I = new Int32Array((b + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let rij = 0;
    for (let x = 0; x < b; x++) {
      rij += fg[y * b + x];
      I[(y + 1) * (b + 1) + x + 1] = I[y * (b + 1) + x + 1] + rij;
    }
  }
  const kern = new Uint8Array(b * h);
  const vol = (2 * r + 1) ** 2;
  for (let y = r; y < h - r; y++) for (let x = r; x < b - r; x++) {
    const s = I[(y + r + 1) * (b + 1) + x + r + 1] - I[(y - r) * (b + 1) + x + r + 1] - I[(y + r + 1) * (b + 1) + x - r] + I[(y - r) * (b + 1) + x - r];
    if (s === vol) kern[y * b + x] = 1;
  }
  return kern;
}
// De beelden van een rij: per beeld zijn pixels (indexen in de bron), en het midden van zijn vak.
function beeldenVan(beeld, n, toewijzing = []) {
  const { b, h } = beeld;
  const fg = voorgrond(beeld);
  const alle = stukken(fg, b, h).filter((s) => s.pixels.length >= 30);
  const xa = Math.min(...alle.map((s) => s.x0));
  const xb = Math.max(...alle.map((s) => s.x1));
  const stap = (xb - xa + 1) / n;
  const midden = Array.from({ length: n }, (_, i) => xa + stap * (i + 0.5));
  const naaste = (x, uit = midden.map((_, i) => i)) => uit.reduce((best, i) => (Math.abs(x - midden[i]) < Math.abs(x - midden[best]) ? i : best), uit[0]);
  const van = new Int16Array(b * h).fill(-1); // welk beeld elke pixel krijgt
  // groot: een lijf (of meer); klein: een los stukje
  const maten = alle.map((s) => s.pixels.length).sort((p, q) => q - p);
  const drempel = 0.15 * maten[Math.min(n, maten.length) - 1];
  const groot = alle.filter((s) => s.pixels.length >= drempel);
  const klein = alle.filter((s) => s.pixels.length < drempel);
  let kern = null;
  for (const s of groot) {
    const over = midden.map((m, i) => i).filter((i) => midden[i] >= s.x0 && midden[i] <= s.x1);
    if (over.length <= 1) {
      const cx = s.pixels.reduce((t, p) => t + (p % b), 0) / s.pixels.length;
      const i = naaste(cx);
      for (const p of s.pixels) van[p] = i;
      continue;
    }
    // een stuk over meer middens: de toewijzing vooraf, de kernen naar hun midden, en dan groeien
    kern = kern || kernVan(fg, b, h, 5);
    const rij = [];
    for (const p of s.pixels) {
      const x = p % b;
      const y = (p - x) / b;
      const t = toewijzing.find(([x0, y0, x1, y1, , soort]) => x >= x0 && x <= x1 && y >= y0 && y <= y1 &&
        (soort !== 'speer' || speerKleur(beeld.rgba[p * 4], beeld.rgba[p * 4 + 1], beeld.rgba[p * 4 + 2])));
      if (t) {
        van[p] = t[4];
        rij.push(p);
      }
    }
    // de kernen: stukken van de kern binnen dit stuk; een kern van minstens 2% van het stuk gaat naar zijn midden
    const inStuk = new Uint8Array(b * h);
    for (const p of s.pixels) if (kern[p] && van[p] < 0) inStuk[p] = 1;
    for (const k of stukken(inStuk, b, h)) {
      if (k.pixels.length < s.pixels.length * 0.02) continue;
      const cx = k.pixels.reduce((t, p) => t + (p % b), 0) / k.pixels.length;
      const i = naaste(cx, over);
      for (const p of k.pixels) {
        van[p] = i;
        rij.push(p);
      }
    }
    // groeien (breedte eerst, acht buren) binnen het stuk
    const binnen = new Uint8Array(b * h);
    for (const p of s.pixels) binnen[p] = 1;
    for (let k = 0; k < rij.length; k++) {
      const p = rij[k];
      const x = p % b;
      const y = (p - x) / b;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Y = y + dy;
        if (X < 0 || Y < 0 || X >= b || Y >= h) continue;
        const q = Y * b + X;
        if (binnen[q] && van[q] < 0) {
          van[q] = van[p];
          rij.push(q);
        }
      }
    }
    for (const p of s.pixels) if (van[p] < 0) van[p] = naaste(p % b, over);
  }
  // een klein los stukje: bij het beeld van het dichtste grote stuk (de dichtste pixel, gemeten op een rooster)
  for (const s of klein) {
    const cx = s.pixels.reduce((t, p) => t + (p % b), 0) / s.pixels.length;
    const cy = s.pixels.reduce((t, p) => t + Math.floor(p / b), 0) / s.pixels.length;
    let beste = -1;
    let bd = Infinity;
    for (const g of groot) for (let k = 0; k < g.pixels.length; k += 7) {
      const p = g.pixels[k];
      const d = (p % b - cx) ** 2 + (Math.floor(p / b) - cy) ** 2;
      if (d < bd) {
        bd = d;
        beste = van[p];
      }
    }
    for (const p of s.pixels) van[p] = beste;
  }
  const per = midden.map(() => []);
  for (const s of alle) for (const p of s.pixels) if (van[p] >= 0) per[van[p]].push(p);
  return per.map((pixels, i) => ({ pixels, midden: midden[i] }));
}

// ---------------------------------------------------------------- verkleinen

// Een beeld (pixels uit de bron) rond zijn anker [ax, ay] in de bron verkleind met factor k, naar een plaatje met het
// anker op [AX, AY]: per doelpixel het gemiddelde van de bronpixels in zijn blok (met de doorzichtigheid), en dan scherp
// (meer dan de helft gedekt: zichtbaar, met de gemiddelde kleur van wat dekt).
function verkleind(beeld, pixels, [ax, ay], k) {
  const { b } = beeld;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const p of pixels) {
    const x = p % b;
    const y = (p - x) / b;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  // het doel rond het anker: van (x0 - ax) * k tot (x1 - ax) * k
  const L = Math.ceil((ax - x0) * k) + 1, R = Math.ceil((x1 - ax) * k) + 1;
  const T = Math.ceil((ay - y0) * k) + 1, O = Math.ceil((y1 - ay) * k) + 1;
  const B = L + R, Hh = T + O;
  const som = new Float64Array(B * Hh * 4);
  const tel = new Float64Array(B * Hh);
  for (const p of pixels) {
    const x = p % b;
    const y = (p - x) / b;
    const u = Math.floor((x + 0.5 - ax) * k) + L;
    const v = Math.floor((y + 0.5 - ay) * k) + T;
    if (u < 0 || v < 0 || u >= B || v >= Hh) continue;
    const o = v * B + u;
    for (let c = 0; c < 3; c++) som[o * 4 + c] += beeld.rgba[p * 4 + c];
    tel[o]++;
  }
  const blok = 1 / (k * k); // zoveel bronpixels per doelpixel
  const uit = { b: B, h: Hh, rgba: Buffer.alloc(B * Hh * 4), anker: [L, T] };
  for (let o = 0; o < B * Hh; o++) {
    if (tel[o] < blok * 0.5) continue;
    for (let c = 0; c < 3; c++) uit.rgba[o * 4 + c] = Math.round(som[o * 4 + c] / tel[o]);
    uit.rgba[o * 4 + 3] = 255;
  }
  return uit;
}

// ---------------------------------------------------------------- een figuur

function figuur(naam) {
  const F = FIGUREN[naam];
  const k = F.doel / F.hoogte;
  // per houding, per richting, per beeld: een verkleind plaatje met zijn anker
  const platen = {};
  // de bronnen per houding: een genummerd vel van de masterprompt (staan: één vel met acht richtingen; een beweging: één
  // vel per richting), anders het losse vel van eerder
  const bronnenVan = (houding, h) => {
    const G = F.genummerd;
    const nr = (i) => `${G.map}/${String(G[houding] + i).padStart(2, '0')}`;
    if (G && G[houding] != null && h.beelden === 1 && heeftBron(F.soort, nr(0))) return [{ naam: nr(0), richtingen: KANTEN }];
    if (G && G[houding] != null && h.beelden > 1) {
      const lijst = KANTEN.map((kant, i) => ({ naam: nr(i), richtingen: [kant] })).filter((b) => heeftBron(F.soort, b.naam));
      const oud = h.richtingen.filter((kant) => !lijst.some((b) => b.richtingen[0] === kant));
      if (lijst.length) return oud.length ? [...lijst, { naam: h.vel, richtingen: oud, toewijzing: h.toewijzing, uit: h.richtingen }] : lijst;
    }
    return [{ naam: h.vel, richtingen: h.richtingen, toewijzing: h.toewijzing }];
  };
  for (const [houding, h] of Object.entries(F.houdingen)) {
    platen[houding] = {};
    for (const b of bronnenVan(houding, h)) {
      const bron = leesBron(F.soort, b.naam);
      // een oud vel met meer richtingen dan we er nog van nodig hebben: alle richtingen knippen, de nodige houden
      const opVel = b.uit || b.richtingen;
      const rij = beeldenVan(bron, opVel.length * h.beelden, b.toewijzing);
      // de grondlijn van een beweging: de laagste voet over alle beelden
      const ys = (pix) => pix.map((p) => Math.floor(p / bron.b));
      const grond = Math.max(...rij.map((r) => Math.max(...ys(r.pixels))));
      opVel.forEach((kant, ri) => {
        if (!b.richtingen.includes(kant)) return;
        platen[houding][kant] = [];
        for (let i = 0; i < h.beelden; i++) {
          const r = rij[ri * h.beelden + i];
          let anker;
          if (h.beelden === 1) {
            // staan: het midden van de voeten (de onderste rijen) en de onderkant
            const onder = Math.max(...ys(r.pixels));
            const xs = r.pixels.filter((p) => Math.floor(p / bron.b) >= onder - 12).map((p) => p % bron.b);
            anker = [(Math.min(...xs) + Math.max(...xs)) / 2, onder];
          } else anker = [r.midden, grond];
          platen[houding][kant].push(verkleind(bron, r.pixels, anker, k));
        }
      });
    }
  }
  // de richtingen die er nog niet zijn: het staande beeld van die richting (voorlopig)
  const ontbreekt = {};
  for (const [houding, h] of Object.entries(F.houdingen)) {
    ontbreekt[houding] = KANTEN.filter((kant) => !platen[houding][kant]);
    for (const kant of ontbreekt[houding]) platen[houding][kant] = Array.from({ length: h.beelden }, () => platen.staan[kant][0]);
  }
  // één cel voor alles, met het anker overal op dezelfde plek (figuurvel.cjs)
  let reik = { l: 1, r: 1, b: 1, o: 1 };
  for (const per of Object.values(platen)) for (const lijst of Object.values(per)) for (const p of lijst) {
    reik = { l: Math.max(reik.l, p.anker[0]), r: Math.max(reik.r, p.b - p.anker[0]), b: Math.max(reik.b, p.anker[1]), o: Math.max(reik.o, p.h - p.anker[1]) };
  }
  const MARGE = 3;
  const CEL = [reik.l + reik.r + 2 * MARGE, reik.b + reik.o + 2 * MARGE];
  const ANKER = [reik.l + MARGE, reik.b + MARGE];
  const map = path.join(UIT, 'animaties');
  fs.mkdirSync(map, { recursive: true });
  const beschrijving = { naam, cel: CEL, anker: ANKER, snelheid: F.snelheid, richtingen: KANTEN, houdingen: {} };
  const inCel = (p) => {
    const c = { b: CEL[0], h: CEL[1], rgba: Buffer.alloc(CEL[0] * CEL[1] * 4) };
    const dx = ANKER[0] - p.anker[0], dy = ANKER[1] - p.anker[1];
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.b; x++) {
      const s = (y * p.b + x) * 4;
      if (p.rgba[s + 3] < 128) continue;
      p.rgba.copy(c.rgba, ((y + dy) * CEL[0] + x + dx) * 4, s, s + 4);
    }
    return c;
  };
  const cellen = {};
  for (const [houding, h] of Object.entries(F.houdingen)) {
    const vel = { b: CEL[0] * h.beelden, h: CEL[1] * KANTEN.length, rgba: Buffer.alloc(CEL[0] * h.beelden * CEL[1] * KANTEN.length * 4) };
    cellen[houding] = {};
    KANTEN.forEach((kant, r) => {
      cellen[houding][kant] = platen[houding][kant].map(inCel);
      cellen[houding][kant].forEach((c, i) => {
        for (let y = 0; y < CEL[1]; y++) c.rgba.copy(vel.rgba, ((r * CEL[1] + y) * vel.b + i * CEL[0]) * 4, y * CEL[0] * 4, (y + 1) * CEL[0] * 4);
      });
    });
    const bestand = `${naam}-${houding}.png`;
    fs.writeFileSync(path.join(map, bestand), K.pngVanBeeld(vel));
    const regel = { bestand, beelden: h.beelden, fps: h.fps, herhaal: h.herhaal !== false };
    if (houding === 'lopen') {
      regel.snelheid = F.snelheid;
      regel.stap = +((F.snelheid * (h.beelden / h.fps)) / 2).toFixed(3);
    }
    beschrijving.houdingen[houding] = regel;
  }
  fs.writeFileSync(path.join(map, `${naam}.json`), JSON.stringify(beschrijving, null, 1));
  return { beschrijving, cellen, ontbreekt };
}

// De proefplaat: staan in acht richtingen, en elke beweging in de richting die er is, op spelmaat (maal 3), naast de
// soldaat van het spel nu; en de bewegingen als bewegend beeld.
function proef(naam) {
  const E = require('../ai/etiket.cjs');
  const { apng } = require('./apng.cjs');
  const { beschrijving, cellen, ontbreekt } = figuur(naam);
  const groot = (c, n = 3) => H.snij(H.alfaSnijMetGrond(c), { x0: 0, y0: 0, b: c.b, h: c.h }, n);
  const rijen = [KANTEN.map((kant, i) => E.met(groot(cellen.staan[kant][0]), i ? kant : `staan · ${kant}`))];
  for (const [houding, h] of Object.entries(FIGUREN[naam].houdingen)) {
    if (houding === 'staan') continue;
    for (const kant of KANTEN.filter((kt) => !ontbreekt[houding].includes(kt))) {
      rijen.push(cellen[houding][kant].map((c, i) => E.met(groot(c), i ? `${i}` : `${houding} · ${kant} · 0`)));
      const platen = cellen[houding][kant].map((c) => ({ b: c.b, h: c.h, rgba: () => c.rgba }));
      fs.writeFileSync(path.join(UIT, `${naam}-${houding}-${kant}-bewegend.png`), apng(platen, { schaal: 3, fps: h.fps }));
    }
  }
  const zonder = Object.entries(ontbreekt).filter(([, l]) => l.length).map(([hd, l]) => `${hd}: ${l.join(', ')}`).join('; ');
  E.bewaar(path.join(UIT, `${naam}.png`), rijen, `De ${naam} van de generator, op spelmaat`, `Uitgeknipt, verkleind tot ${FIGUREN[naam].doel} pixels tot de helm (zoals de soldaat van de heer), maal 3. Cel ${beschrijving.cel.join(' bij ')}, anker ${beschrijving.anker.join(', ')}. Nog niet van de generator (voorlopig het staande beeld): ${zonder || 'niets'}.`);
  console.log(`uit/generator/${naam}.png, vellen in uit/generator/animaties/`);
}

if (require.main === module) {
  const [naam] = process.argv.slice(2);
  if (!FIGUREN[naam]) console.log(`node gereedschap/pixelart/generator.cjs <${Object.keys(FIGUREN).join(' | ')}>`);
  else proef(naam);
}

module.exports = { FIGUREN, figuur, beeldenVan, voorgrond, verkleind };
