// Bouwt kaarten/gehucht.tmj en kaarten/gehucht.betekenis.json: het gehucht waar het spel begint
// (ontwerp/spel.md, "Het eerste proefje: een dorp met akkers, en de sfeer"; Marcel, 23 sep 2026:
// "maak maar een klein dorpje", "simpel houden", "de sfeer is belangrijk").
//
// Tweede versie (Marcel, 23 sep 2026, bij het bekijken van de eerste): "nieuwe kale map
// gebruiken met een dorpje en akkers". Een kale, open kaart, vooral gras; de akkers niet meer als
// vijf losse stroken tegen de rand van de kaart aan, maar als lange smalle stroken bij het dorp.
// **Nergens raakt een akker de rand van de kaart of de bosrand**: rondom blijft een marge gras en
// losse bomen over. En alleen groene bomen (zie BOSBOMEN hieronder): geen herfstEik in een kaart
// waar de kalender lente zegt (ontwerp/werklijst.md).
//
// Derde versie (Marcel, 26 sep 2026, toen de mensen poppetjes werden: "We hebben meer afwisseling
// nodig in de huizen en hutten. Ze staan ook te dicht op elkaar"): 60 bij 60, een plein vóór het
// huis van de schout, en vijf boerderijtekeningen drie tot vijf tegels uit elkaar.
//
// Vierde versie (Marcel, 26 sep 2026, vraag 29 tot en met 31 in de werklijst): **het plein als
// hart.** "De brink is vaak het hart van een dorp. Zou een redelijk open ruimte zijn lijkt mij", en
// "Ook de vorm moet variëren, he? En niet alles dus strak en waterpas." Het plein ligt in het midden,
// groot en onregelmatig, met oude eiken en de put, en er wordt niet op gebouwd (js/gebouwen.js,
// T.gebouwPast). Eromheen staan het huis van de schout en gewone huizen ("Naast boerderijen zijn er
// ook 'gewone' huizen"), verder naar buiten de boerderijen, elk bij zijn velden, en de velden liggen
// om het dorp. De rand van het plein golft, de weg slingert en de beek kronkelt (ontwerp/beeld.md,
// "Ook de kaart is niet waterpas"). De indeling is die van de derde schets op de pagina "Het plein
// als hart" (https://claude.ai/artifact/NnMfi4QPWV8ct2ZtNjewud); Marcel keurde hem goed ("Indeling
// klopt"). Akkers, weide en heide zijn even groot gebleven, zodat de oogst en de balans niet
// verschuiven; ze liggen alleen anders. Een paar kleine dingen wijken af van de schets, omdat ze daar
// botsten: de heide ligt vijf tegels verder, want de beek liep erdoor; twee rijtjes kool en een
// appelboom stonden in een boerderij; het hekje van de schout stond op het pad naar de hut; en de
// weide ligt één tegel dichter bij de strook van Wouter, zodat ze samen één weide kunnen worden
// (AKKERS hieronder).
//
// De grond gaat via de terreinsets van tegels/rand.tsx, en de tegels worden op naam opgezocht in
// plaats van op nummer (net als maak-wereld.cjs). Welke akker van welke boer is, wie waar woont en
// waar het plein ligt, staat in het betekenisbestand, niet in de .tmj: zie ontwerp/kaarten.md, "Tiled
// tekent alleen nog de grond".
//
//   node gereedschap/tiled/maak-gehucht.cjs [--overschrijf]
'use strict';
const fs = require('fs');
const path = require('path');

const WORTEL = path.join(__dirname, '..', '..');
const TEGELS_DIR = path.join(WORTEL, 'tegels');
const KAARTEN = path.join(WORTEL, 'kaarten');
const UIT_TMJ = path.join(KAARTEN, 'gehucht.tmj');
const UIT_BETEKENIS = path.join(KAARTEN, 'gehucht.betekenis.json');

const vellen = JSON.parse(fs.readFileSync(path.join(TEGELS_DIR, 'tegels.json'), 'utf8'));

// ---------------------------------------------------------------- de tegelvellen en hun gids
const VOLGORDE = ['rand', 'bomen', 'begroeiing', 'gebouwen', 'erf', 'tuin'];
const gebruikt = VOLGORDE.filter((n) => vellen[n]);
const firstgid = {};
{
  let g = 1;
  for (const naam of gebruikt) {
    firstgid[naam] = g;
    g += vellen[naam].tiles.length;
  }
}
// naam -> eerste vel/id waarin die naam voorkomt (zie maak-wereld.cjs: dezelfde opzoeking).
const velVan = new Map();
for (const naam of gebruikt) {
  vellen[naam].tiles.forEach((t, i) => {
    if (t && t.naam && !velVan.has(t.naam)) velVan.set(t.naam, { vel: naam, id: i, tegel: t });
  });
}
function gidVan(naam) {
  const v = velVan.get(naam);
  if (!v) return null;
  return { gid: firstgid[v.vel] + v.id, vel: vellen[v.vel], tegel: v.tegel };
}

// ---------------------------------------------------------------- de randtegels (terreinsets)
// Zelfde aanpak als maak-wereld.cjs: de terreinsets uit tegels/rand.tsx zelf lezen (niet
// randtegels.cjs opnieuw laten bouwen, dat zou rand.png/rand.tsx herschrijven).
function leesWangsets(tsxTekst) {
  const sets = [];
  const setRe = /<wangset name="([^"]*)"[^>]*>([\s\S]*?)<\/wangset>/g;
  let m;
  while ((m = setRe.exec(tsxTekst))) {
    const kleuren = [...m[2].matchAll(/<wangcolor name="([^"]*)"/g)].map((x) => ({ naam: x[1] }));
    const tegels = [...m[2].matchAll(/<wangtile tileid="(\d+)" wangid="([^"]*)"/g)].map((x) => ({ id: Number(x[1]), wangid: x[2] }));
    sets.push({ naam: m[1], kleuren, tegels });
  }
  return sets;
}
const randTsxTekst = fs.readFileSync(path.join(TEGELS_DIR, 'rand.tsx'), 'utf8');
const randSets = leesWangsets(randTsxTekst);
const VLAK = {};
vellen.rand.tiles.forEach((t, id) => {
  if (t && t.groep === 'vlak') (VLAK[t.naam] = VLAK[t.naam] || []).push(id);
});
const TERREINSETS = {};
for (const set of randSets) {
  const a = set.kleuren[0].naam;
  const b = set.kleuren[1].naam;
  const opWangid = {};
  for (const wt of set.tegels) (opWangid[wt.wangid] = opWangid[wt.wangid] || []).push(wt.id);
  TERREINSETS[`${a}|${b}`] = { a, b, opWangid };
  TERREINSETS[`${b}|${a}`] = { a, b, opWangid };
}
const HOEK_INDEX = { boven: 7, rechts: 1, onder: 3, links: 5 };
function wangId(hoeken) {
  const w = [0, 0, 0, 0, 0, 0, 0, 0];
  w[HOEK_INDEX.boven] = hoeken[0];
  w[HOEK_INDEX.rechts] = hoeken[1];
  w[HOEK_INDEX.onder] = hoeken[2];
  w[HOEK_INDEX.links] = hoeken[3];
  return w.join(',');
}
function totTwee(hoeken) {
  const tel = {};
  for (const h of hoeken) tel[h] = (tel[h] || 0) + 1;
  const soorten = Object.keys(tel);
  if (soorten.length <= 2) return hoeken;
  soorten.sort((p, q) => tel[q] - tel[p]);
  const [eerste, tweede] = soorten;
  return hoeken.map((h) => (h === eerste || h === tweede ? h : eerste));
}
function hash(x, y, zout) {
  let h = (x * 374761393 + y * 668265263 + zout * 2654435761) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function terreinGid(soortOp, tx, ty, zout) {
  const hoeken = totTwee([soortOp(tx, ty), soortOp(tx + 1, ty), soortOp(tx + 1, ty + 1), soortOp(tx, ty + 1)]);
  const uniek = [...new Set(hoeken)];
  const kies = (lijst) => lijst[hash(tx, ty, zout) * 1e6 % lijst.length | 0];
  if (uniek.length === 1) return firstgid.rand + kies(VLAK[uniek[0]]);
  const set = TERREINSETS[`${uniek[0]}|${uniek[1]}`];
  if (!set) throw new Error(`geen terreinset voor ${uniek.join(' en ')} op (${tx},${ty})`);
  const id = wangId(hoeken.map((h) => (h === set.a ? 1 : 2)));
  const lijst = set.opWangid[id];
  if (!lijst) throw new Error(`geen tegel voor wangid ${id} in ${set.a}/${set.b}`);
  return firstgid.rand + kies(lijst);
}

// De zes brugtegels: niet op naam te vinden (ze heten alle zes "brug"), dus op hun "groep"
// gelezen — robuust voor als rand.tsx later groeit en de nummers opschuiven (ontwerp/kaarten.md,
// "Een tegelnummer verandert nooit").
function leesBrugTegels(tsxTekst) {
  const out = {};
  const tileRe = /<tile id="(\d+)">([\s\S]*?)<\/tile>/g;
  let m;
  while ((m = tileRe.exec(tsxTekst))) {
    const blok = m[2];
    if (!/name="naam" value="brug"/.test(blok)) continue;
    const g = blok.match(/name="groep" value="brug ([xy]) (begin|midden|eind)"/);
    if (g) out[`${g[1]}-${g[2]}`] = Number(m[1]);
  }
  return out;
}
const BRUG = leesBrugTegels(randTsxTekst);
for (const k of ['x-begin', 'x-midden', 'x-eind', 'y-begin', 'y-midden', 'y-eind']) {
  if (BRUG[k] === undefined) throw new Error(`geen brugtegel "${k}" gevonden in tegels/rand.tsx`);
}

// ---------------------------------------------------------------- lijnen en vlakken
// Een vloeiende lijn door steunpunten (Catmull-Rom), als veel korte rechte stukjes: zo slingert een
// weg zonder knikken, en blijft "afstand tot de lijn" (totLijn) gewoon werken.
function vloeiend(punten, stappen = 12) {
  const P = [punten[0], ...punten, punten[punten.length - 1]];
  const uit = [];
  for (let i = 1; i + 2 < P.length; i++) {
    for (let s = 0; s < stappen; s++) {
      const t = s / stappen;
      const f = (a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
      uit.push([f(P[i - 1][0], P[i][0], P[i + 1][0], P[i + 2][0]), f(P[i - 1][1], P[i][1], P[i + 1][1], P[i + 2][1])]);
    }
  }
  uit.push(punten[punten.length - 1]);
  return uit;
}
// De afstand van een punt tot een lijn van rechte stukjes (dezelfde truc als maak-wereld.cjs).
function totLijn(punten) {
  return (x, y) => {
    let d = 1e9;
    for (let i = 0; i + 1 < punten.length; i++) {
      const [ax, ay] = punten[i];
      const [bx, by] = punten[i + 1];
      const vx = bx - ax;
      const vy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1)));
      d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t));
    }
    return d;
  };
}
// Ligt een punt binnen een rand? Dezelfde vraag als het spel stelt (js/wereld.js, T.binnenRand), zodat
// het plein hier en in het spel precies dezelfde tegels heeft.
require('../../js/wereld.js');
const binnen = globalThis.Spel.binnenRand;

// ==================================================================================================
// DE MAAT EN DE ZONES
// ==================================================================================================
// Groter dan de derde versie (60 bij 60): "de kaart mag ook groter zijn, geen probleem" (Marcel,
// 26 sep), en het dorp groeit later naar buiten (ontwerp/kaarten.md, "De kaart groeit mee").
const B = 76;
const H = 76;
const BOS_DIEP = 7; // y < BOS_DIEP: de bosrand aan de noordkant
const BOSDICHT = [0.85, 0.7, 0.55, 0.4, 0.28, 0.16, 0.08]; // per rij, dunner naar het gehucht toe

// Het plein, in twee maten. De schets tekende het in (u, v) rond MIDDEN: u loopt in beeld naar
// rechts, v naar voren (naar de camera), zodat "voor de deur" gewoon een grotere v is. Hier staat
// het omgerekend naar tegels (x, y), op een tiende. PLEIN_RAND is de rand: een tegel ligt op het
// plein als zijn midden erbinnen valt. ZAND is het uitgesleten stuk voor de deur van de schout, waar
// de marskramer en de heer staan; de rest van het plein is gras, met oude eiken en de put.
const MIDDEN = { x: 38, y: 40 };
const naarTegels = (lijst) => lijst.map(([u, v]) => [
  Math.round((MIDDEN.x + (u + v) * Math.SQRT1_2) * 10) / 10,
  Math.round((MIDDEN.y + (v - u) * Math.SQRT1_2) * 10) / 10,
]);
const PLEIN_RAND = naarTegels([
  [-10.5, 0.5], [-9.5, -2.8], [-7, -4.6], [-3.5, -5.6], [0.5, -5.8], [4.2, -6.2], [8, -4.8], [10.4, -2],
  [11, 1], [9.2, 4], [5.2, 5.8], [1, 6.6], [-3.2, 6], [-7.4, 4.8], [-10, 3],
]);
const ZAND = naarTegels([[-3, -6.4], [1.5, -6.6], [4, -5.2], [3.4, -2.4], [0.5, -1.2], [-2.6, -2], [-4, -4]]);
const opPlein = (tx, ty) => binnen(PLEIN_RAND, tx + 0.5, ty + 0.5);
// Waar de marskramer uitstalt en de heer op Sint-Maarten staat: op het zand, drie stappen voor de
// deur van de schout.
const OP_HET_ZAND = { x: 35, y: 37 };

// De beek, links op de kaart. Hij kronkelt, maar loopt recht onder het bruggetje door: twee tegels
// van de brug af begint hij te slingeren, zes tegels ervan helemaal. Het water ligt 1,1 tegel naar
// weerszijden van zijn midden (op de hoekpunten), dus bij de brug drie hoekpunten breed, zoals
// vroeger.
const BRUG_Y = 41;
const BEEK_HALF = 1.1;
const beekMidden = (y) => 6 + (1.6 * Math.sin(y / 6.5) + 0.8 * Math.sin(y / 2.9 + 1)) * Math.min(1, Math.max(0, (Math.abs(y - BRUG_Y) - 2) / 4));
const inBeek = (x, y) => Math.abs(x - beekMidden(y)) <= BEEK_HALF;

// De zandweg: van de oostrand, waar hij het gehucht in en uit loopt, naar het plein, en aan de
// andere kant van het plein verder naar het westen, over het bruggetje. Een lijn door steunpunten,
// die slingert. De paden zijn smaller: van het plein naar de akker van Wouter (boer5), van het zand
// naar de hut ten westen, en van het plein naar de deur van Gerrit (boer3). Meer paden komen met
// "Straten en paden" (ontwerp/spel.md): die slijten waar gelopen wordt.
const WEG_OOST = vloeiend([[76, 50], [69, 49], [62.5, 49.5], [56.5, 48], [51, 44], [47.5, 38.5]]);
const WEG_WEST = vloeiend([[30.5, 44.5], [26.5, 41.8], [20, 42], [14, 41.5], [9, 41], [3, 41], [-1, 41.3]]);
const PADEN = [
  [[43.5, 44.5], [42, 47.5], [41, 50.5]],
  [[31.5, 34.5], [27.5, 36], [24, 40.5]],
  [[46.5, 37], [52.5, 34], [56, 33.5]],
].map((p) => vloeiend(p));
const WEG_BREED = 0.75; // een hoekpunt zo dicht bij de lijn is zandpad
const PAD_BREED = 0.55;
const dOost = totLijn(WEG_OOST);
const dWest = totLijn(WEG_WEST);
const dPaden = PADEN.map(totLijn);
const opWeg = (x, y) => dOost(x, y) < WEG_BREED || dWest(x, y) < WEG_BREED || dPaden.some((d) => d(x, y) < PAD_BREED);

// De akkers, om het dorp, elk bij de boerderij van zijn boer: achter Klaas (boer1) en Aaltje
// (boer2), rechts van Gerrit (boer3) en Trijn (boer4), en vooraan bij Wouter (boer5), met de weide
// van Klaas ernaast. x, y is de linkerbovenhoek (net als een gebouw), b en h de maat in tegels. Even
// groot als in de derde versie (samen 209 tegels, waarvan 30 weide), alleen anders gedraaid: een
// strook van 14 lang ligt nu ook dwars. De stroken van Gerrit en Trijn liggen tegen elkaar, als één
// blok; de weide begint met de beginkudde erop (ontwerp/spel.md, "Weides met koeien en schapen").
// Tussen de weide en de strook van Wouter ligt één tegel gras: wordt die strook ook weide, dan zijn
// ze samen één weide met één kudde, met de strook ertussen (js/vee.js, weideTussen; Marcel, 25 sep).
// De schets had er twee tegels tussen, en dan bleven het twee weides.
const AKKERS = [
  { akker: 'akker1', x: 10, y: 21, b: 14, h: 2, huis: 'boer1' },
  { akker: 'akker2', x: 40, y: 8, b: 14, h: 2, huis: 'boer2' },
  { akker: 'akker3', x: 63, y: 21, b: 3, h: 14, huis: 'boer3' },
  { akker: 'akker4', x: 66, y: 21, b: 2, h: 14, huis: 'boer4' },
  { akker: 'akker7', x: 64, y: 37, b: 5, h: 5, huis: 'boer3' },
  { akker: 'akker5', x: 40, y: 50, b: 2, h: 14, huis: 'boer5' },
  { akker: 'akker6', x: 43, y: 52, b: 5, h: 6, huis: 'boer1', bestemming: 'weide' },
];
const AKKER_TEGELS = 209; // wat de derde versie had; nagekeken hieronder, zodat de oogst gelijk blijft
function inAkker(x, y) {
  return AKKERS.some((a) => x >= a.x && x < a.x + a.b && y >= a.y && y < a.y + a.h);
}

// De meent: de heide linksvoor, waar de schapen van het dorp samen grazen (Marcel koos het op
// 25 sep; ontwerp/spel.md, "Weides met koeien en schapen"). Even groot als vroeger (23 bij 8). De
// schaapskooi staat aan de noordrand, met zijn voorkant naar de heide: zo staan de schapen vóór de
// kooi en niet erachter. De schets legde de heide vijf tegels verder naar links, maar daar liep de
// beek erdoorheen. De meent is voor het spel een rechthoek (js/kaart.js, "meent"); de grond erop is
// heide, en op de buitenste rij hoekpunten beslist het lot, zodat hij niet als een liniaal ophoudt.
const MEENT = { meent: 'heide', x: 8, y: 65, b: 23, h: 8 };
function opHeide(x, y) {
  const x0 = MEENT.x;
  const x1 = MEENT.x + MEENT.b;
  const y0 = MEENT.y;
  const y1 = MEENT.y + MEENT.h;
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const rand = x === x0 || x === x1 || y === y0 || y === y1;
  return !rand || hash(x, y, 91) < 0.5;
}

// Eén grondsoort per hoekpunt: water wint, dan zandpad (de weg, de paden, een akker en het zand
// voor de schout: allemaal kale grond, dezelfde terreinset), dan heide, en de rest is gras. Vlak
// naast water komt geen zandpad en geen heide: daar bestaat geen terreinset voor, en het bruggetje
// tekent de oversteek zelf.
function naastWater(x, y) {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inBeek(x + dx, y + dy)) return true;
  return false;
}
function soortOp(x, y) {
  if (inBeek(x, y)) return 'water';
  if (naastWater(x, y)) return 'gras';
  if (opWeg(x, y) || inAkker(x, y) || binnen(ZAND, x, y)) return 'zandpad';
  if (opHeide(x, y)) return 'heide';
  return 'gras';
}
// Is een tegel helemaal gras? (Voor wat los rond een huis staat: niet op de weg of een akker.)
const opGras = (x, y) => [[0, 0], [1, 0], [1, 1], [0, 1]].every(([dx, dy]) => soortOp(x + dx, y + dy) === 'gras');

// ==================================================================================================
// DE GRONDLAAG
// ==================================================================================================
const grondLaag = new Array(B * H).fill(0);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < B; x++) grondLaag[y * B + x] = terreinGid(soortOp, x, y, 63);
}
// Het bruggetje waar de weg de beek kruist, dwars over de weg heen (oost-west, dus de "x"-brug): begin,
// midden en eind, over elke tegel die water raakt, dus ook over de twee oevertegels die half in het
// water liggen. Een tegel met water is vast; in de derde versie lag de brug op drie van de vier, en
// hield de oevertegel links je tegen. Daar loopt de beek recht, dus de brug ligt onder zijn midden.
const BRUG_X0 = Math.ceil(beekMidden(BRUG_Y) - BEEK_HALF) - 1;
const BRUG_X1 = Math.floor(beekMidden(BRUG_Y) + BEEK_HALF);
for (let x = BRUG_X0; x <= BRUG_X1; x++) {
  grondLaag[BRUG_Y * B + x] = firstgid.rand + BRUG[x === BRUG_X0 ? 'x-begin' : x === BRUG_X1 ? 'x-eind' : 'x-midden'];
}

// ==================================================================================================
// DE OBJECTEN
// ==================================================================================================
const objecten = [];
const bezet = new Set();
let volgendId = 1;
const sleutel = (x, y) => x + ',' + y;
const fouten = [];

function zetTegel(naam, mx, my, moet) {
  const g = gidVan(naam);
  if (!g) {
    console.warn(`  overgeslagen: geen tegel "${naam}" in tegels/ — draai npm run tiled`);
    if (moet) fouten.push(`geen tegel "${naam}"`);
    return false;
  }
  const [vb, vd] = g.tegel.beslaat || [1, 1];
  for (let dy = 0; dy < vd; dy++) {
    for (let dx = 0; dx < vb; dx++) {
      const mxx = mx + dx;
      const myy = my + dy;
      if (mxx < 0 || myy < 0 || mxx >= B || myy >= H) {
        if (moet) fouten.push(`"${naam}" op (${mx},${my}) valt buiten de kaart`);
        return false;
      }
      if (bezet.has(sleutel(mxx, myy))) {
        if (moet) fouten.push(`"${naam}" op (${mx},${my}) botst op (${mxx},${myy})`);
        return false;
      }
    }
  }
  for (let dy = 0; dy < vd; dy++) for (let dx = 0; dx < vb; dx++) bezet.add(sleutel(mx + dx, my + dy));
  objecten.push({
    id: volgendId++, visible: true, rotation: 0, name: naam, gid: g.gid,
    x: mx * 32, y: my * 32, width: g.vel.tegelB, height: g.vel.tegelH, properties: [],
  });
  return true;
}

// ---- de vijf boerderijen, het huis van de schout, de gewone huizen en de schaapskooi ----
// De boerderijen staan verder naar buiten, elk bij zijn velden, en elk in een andere tekening, groter
// dan een gewoon huis. Trijn (boer4) en Wouter (boer5) staan vóór het plein, op de hoeken: tussen hen
// door kijk je het plein op. x, y is de linkerbovenhoek, b en d de maat van de tekening; de deur is het
// midden van de zuidkant (x + b/2, y + d), daar staat de boer bij het begin.
const HUIZEN = {
  boer1: { tegel: 'dorpGroot1', x: 10, y: 25, b: 7, d: 9 },
  boer2: { tegel: 'dorpGewoonVleugel', x: 43, y: 11, b: 9, d: 8 },
  boer3: { tegel: 'dorpGewoonAanbouw', x: 53, y: 24, b: 6, d: 9 },
  boer4: { tegel: 'dorpGewoon4', x: 56, y: 38, b: 6, d: 8 },
  boer5: { tegel: 'schuur', x: 29, y: 56, b: 6, d: 9 },
};
// Het stenen huis van de schout staat aan de noordkant van het plein, met zijn deur op het zand.
const SCHOUT_HUIS = { tegel: 'stenenHuis', x: 30, y: 26, b: 6, d: 8 };
// De gewone huizen om het plein (Marcel, 26 sep: "Naast boerderijen zijn er ook 'gewone' huizen"),
// met wie er bij het begin woont (Marcel koos het in de zesde sessie van 26 sep; js/bewoners.js,
// T.zetBeginBewoners): in het huis een jong gezin van dagloners, in de hut bij het plein een oud stel,
// en de hut verderop is leeg, voor het eerste gezin dat komt.
const GEWONE_HUIZEN = [
  { gebouw: 'huis', tegel: 'vakwerkhuis', x: 40, y: 25, b: 7, d: 5, bewoners: 'jongGezin' },
  { gebouw: 'hut', tegel: 'dorpKlein3', x: 21, y: 33, b: 5, d: 7, bewoners: 'oudStel' },
  { gebouw: 'hut', tegel: 'dorpKlein1', x: 24, y: 45, b: 5, d: 7 },
];
// De schaapskooi aan de rand van de heide: het gehucht begint met één, en dus met de schapen op de
// heide in plaats van op de weide. Voorlopig in de tekening van de blokhutschuur, net als in het
// bouwmenu (js/gebouwen.js, T.GEBOUWEN.schaapskooi).
const KOOI = { tegel: 'schuurBlokhut', x: 18, y: 56, b: 5, d: 7 };

for (const h of Object.values(HUIZEN)) zetTegel(h.tegel, h.x, h.y, true);
zetTegel(SCHOUT_HUIS.tegel, SCHOUT_HUIS.x, SCHOUT_HUIS.y, true);
for (const h of GEWONE_HUIZEN) zetTegel(h.tegel, h.x, h.y, true);
zetTegel(KOOI.tegel, KOOI.x, KOOI.y, true);

// ---- het plein: de put op het zand voor de deur van de schout, en vijf oude eiken, met een bank
// onder de grootste (waar later misschien recht gesproken wordt; ontwerp/opmerkingen.md) ----
zetTegel('put', 33, 35, true);
const PLEIN_BOMEN = [[38, 42], [31, 41], [43, 37], [34, 45], [40, 34]];
for (const [x, y] of PLEIN_BOMEN) zetTegel('eik', x, y, true);
zetTegel('bank', 39, 43, true);

// ---- losse bomen bij de huizen en op het land: appelbomen bij een erf, eiken verderop ----
const BOMEN = [
  [17, 30, 'appelboom'], [27, 31, 'appelboom'], [47, 22, 'eik'], [38, 22, 'appelboom'], [52, 36, 'eik'],
  [63, 44, 'appelboom'], [27, 53, 'appelboom'], [18, 50, 'eik'], [36, 57, 'eik'], [57, 20, 'eik'],
];
for (const [x, y, soort] of BOMEN) zetTegel(soort, x, y);

// ---- groente: een rijtje kool bij een huis, en een moestuin bij Gerrit (boer3) ----
// [x, y, b, h] in tegels: een rijtje van b bij h.
const KOOL = [[18, 38, 1, 3], [44, 30, 3, 1], [62, 40, 1, 3], [36, 64, 3, 1], [20, 47, 2, 1]];
for (const [x0, y0, b, h] of KOOL) for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + b; x++) zetTegel('kool', x, y);
{
  const RIJEN = ['kool', 'prei', 'bonen', 'kruidenbed'];
  for (let y = 22; y < 25; y++) {
    const rij = RIJEN[Math.floor(hash(50, y, 29) * RIJEN.length)];
    for (let x = 50; x < 53; x++) zetTegel(rij, x, y);
  }
}

// ---- de bosrand aan de noordkant ----
// Alleen groene bomen: geen herfstEik (de oranje-rode variant van de eik, zie
// gereedschap/pixelart/bomen.cjs) zolang de kalender in het gehucht lente zegt. Seizoenen die
// bomen echt laten verkleuren (ontwerp/werklijst.md) komen later en moeten dan hier, en in
// js/tekenen.js bij BOSRAND_SOORTEN, de kleur aan S.kalender gaan koppelen in plaats van de
// herfstvariant nu al te laten staan.
const BOSBOMEN = ['den', 'eik', 'berk', 'den', 'eik'];
for (let y = 0; y < BOS_DIEP; y++) {
  const kans = BOSDICHT[y] || 0;
  for (let x = 0; x < B; x++) {
    if (!opGras(x, y)) continue;
    if (bezet.has(sleutel(x, y))) continue;
    if (hash(x, y, 17) > kans) continue;
    zetTegel(BOSBOMEN[Math.floor(hash(x + 5, y + 9, 18) * BOSBOMEN.length)], x, y);
  }
}

// ---- wilgen (geknot) op de oevers van de beek, met een gat bij het bruggetje ----
// Links op de oever (de tegel die half in het water ligt, zoals vroeger), rechts op het eerste gras.
// Een wilg is hoog, en de camera kijkt van voren: een wilg tot zes rijen vóór het bruggetje stond
// er in beeld precies voor, en in de derde versie verdween de beek zo achter een haag van wilgen.
// Vandaar een ruimer gat bij de brug, en wat minder wilgen, zodat het water ertussen te zien is.
for (let y = BOS_DIEP; y < H; y++) {
  if (y >= BRUG_Y - 2 && y <= BRUG_Y + 6) continue;
  const water = [y, y + 1].flatMap((r) => [Math.ceil(beekMidden(r) - BEEK_HALF), Math.floor(beekMidden(r) + BEEK_HALF)]);
  if (hash(y, 31, 19) < 0.3) zetTegel('wilg', Math.min(...water) - 1, y);
  if (hash(y, 37, 20) < 0.3) zetTegel('wilg', Math.max(...water) + 1, y);
}

// ---- tuintjes: een paar losse stukken bij elke boerderij (kaarten.md: "los rond een huis") ----
// Eén tegel net onder de voorkant van het huis, en één ernaast; alleen op gras dat nog vrij is.
const TUIN_LOS = ['kruidenbed', 'kool', 'prei', 'bonen', 'regenton'];
for (const h of Object.values(HUIZEN)) {
  const stuk1 = TUIN_LOS[Math.floor(hash(h.x, h.y, 22) * TUIN_LOS.length)];
  const stuk2 = TUIN_LOS[Math.floor(hash(h.x + 3, h.y + 1, 23) * TUIN_LOS.length)];
  if (opGras(h.x - 1, h.y + h.d - 1)) zetTegel(stuk1, h.x - 1, h.y + h.d - 1);
  if (opGras(h.x + h.b, h.y + 1)) zetTegel(stuk2, h.x + h.b, h.y + 1);
}
// Bij de schout een regenton naast zijn huis. Zijn hekje van planken stond in de derde versie voor
// zijn huis, maar daar begint nu het pad naar de hut.
zetTegel('regenton', SCHOUT_HUIS.x - 1, SCHOUT_HUIS.y + SCHOUT_HUIS.d - 1);

// ---------------------------------------------------------------- de uitgang
// Waar de weg de kaart aan de oostkant verlaat: de tegel op de rand die het dichtst bij de weg ligt.
let UITGANG = null;
for (let y = 0; y < H; y++) {
  const d = dOost(B - 0.5, y + 0.5);
  if (!UITGANG || d < UITGANG.d) UITGANG = { x: B - 1, y, d };
}

// ---------------------------------------------------------------- nakijken vóór we schrijven
{
  const vrij = (x, y) => x >= 0 && y >= 0 && x < B && y < H && !!grondLaag[y * B + x] && soortOp(x, y) !== 'water';
  if (!vrij(UITGANG.x, UITGANG.y)) fouten.push('de tegel bij de uitgang (rechts) is niet begaanbaar');
  const akkerTegels = AKKERS.reduce((n, a) => n + a.b * a.h, 0);
  if (akkerTegels !== AKKER_TEGELS) fouten.push(`de akkers zijn samen ${akkerTegels} tegels in plaats van ${AKKER_TEGELS}: de oogst verschuift`);
  // Op het plein staat niets dan de put, de eiken en de bank, en geen akker.
  const magOpPlein = new Set(['put', 'eik', 'bank']);
  for (const o of objecten) {
    const [vb, vd] = gidVan(o.name).tegel.beslaat || [1, 1];
    const x0 = o.x / 32;
    const y0 = o.y / 32;
    for (let dy = 0; dy < vd; dy++) {
      for (let dx = 0; dx < vb; dx++) {
        if (opPlein(x0 + dx, y0 + dy) && !magOpPlein.has(o.name)) {
          fouten.push(`"${o.name}" op (${x0},${y0}) staat op het plein`);
          dy = vd;
          break;
        }
      }
    }
  }
  for (const a of AKKERS) {
    for (let y = a.y; y < a.y + a.h; y++) for (let x = a.x; x < a.x + a.b; x++) if (opPlein(x, y)) fouten.push(`${a.akker} ligt op het plein`);
  }
}

// ==================================================================================================
// DE .TMJ SCHRIJVEN
// ==================================================================================================
const kaart = {
  type: 'map',
  version: '1.10',
  tiledversion: '1.11.0',
  orientation: 'isometric',
  renderorder: 'right-down',
  width: B,
  height: H,
  tilewidth: 64,
  tileheight: 32,
  infinite: false,
  nextlayerid: 3,
  nextobjectid: volgendId,
  properties: [
    { name: 'naam', type: 'string', value: 'Het gehucht' },
    { name: 'doof', type: 'int', value: 6 },
  ],
  tilesets: gebruikt.map((naam) => ({ firstgid: firstgid[naam], source: `../tegels/${naam}.tsx` })),
  layers: [
    { type: 'tilelayer', id: 1, name: 'grond', x: 0, y: 0, width: B, height: H, visible: true, opacity: 1, data: grondLaag },
    { type: 'objectgroup', id: 2, name: 'objecten', visible: true, opacity: 1, draworder: 'topdown', objects: objecten },
  ],
};

// ==================================================================================================
// DE BETEKENIS: de schout, de vijf boeren, de huizen, de akkers, het plein en de enige uitgang
// ==================================================================================================
const deurVan = (h) => ({ x: h.x + Math.floor(h.b / 2), y: h.y + h.d });
const dingen = [];
// De schout begint voor zijn eigen deur (js/gebied.js, T.beginOpKaart zet hem daarna in het vel
// van een gewone dorpeling).
dingen.push({ ...deurVan(SCHOUT_HUIS), wezen: 'schout' });
// De vijf boeren, elk voor zijn eigen deur, dwalend (T.laatDwalen, js/verkennen.js) en in het
// groeiseizoen op en rond hun eigen akker (T.wandelAnker, js/akkers.js). "wie" is hier gelijk aan
// "huis" (T.MENSEN.boer1..boer5, js/mensen.js): vijf eigen ingangen, want T.keurKaart
// (gereedschap/keuring.js) staat niet toe dat dezelfde mens twee keer op de kaart staat, en "huis"
// koppelt hem aan zijn akker(s) hierboven (js/kaart.js).
for (const [id, h] of Object.entries(HUIZEN)) dingen.push({ ...deurVan(h), wie: id, straal: 3, huis: id });
// De huizen zelf, als gebouw (js/gebouwen.js, T.zetBestaandeGebouwen): hun tekening staat al op
// de kaart (hierboven, zetTegel), dit is alleen de betekenis erbij, zodat het dorp niet leeg begint.
// De vijf boerenhuizen tellen als "boerderij", het stenen huis van de schout als "huis". "huis" zegt
// wie er woont, net als bij een akker: de boer met dezelfde id, of de schout. Dat telt voor zijn
// kelder (js/verstoppen.js). Bij een gewoon huis zegt "bewoners" wie er bij het begin woont.
for (const [id, h] of Object.entries(HUIZEN)) dingen.push({ gebouw: 'boerderij', x: h.x, y: h.y, b: h.b, h: h.d, huis: id });
dingen.push({ gebouw: 'huis', x: SCHOUT_HUIS.x, y: SCHOUT_HUIS.y, b: SCHOUT_HUIS.b, h: SCHOUT_HUIS.d, huis: 'schout' });
for (const g of GEWONE_HUIZEN) {
  const d = { gebouw: g.gebouw, x: g.x, y: g.y, b: g.b, h: g.d };
  if (g.bewoners) d.bewoners = g.bewoners;
  dingen.push(d);
}
dingen.push({ gebouw: 'schaapskooi', x: KOOI.x, y: KOOI.y, b: KOOI.b, h: KOOI.d });
// De akkers (js/kaart.js, "WAT EEN DING BETEKENT"), en de meent: de heide, waar de schapen grazen
// (js/vee.js, "Waar een dier graast").
for (const a of AKKERS) dingen.push(a);
dingen.push(MEENT);
// De enige uitgang: het gehucht hangt nog aan geen andere kaart vast (ontwerp/werklijst.md,
// "Wacht op Marcel"). Zonder "komt" kiest het spel zelf een tegel (js/kaart.js); "proef": true
// hieronder laat de keuring met rust dat "wereld" niet terugwijst (gereedschap/keuring.js,
// T.keurDekking: "een aansluiting heeft twee kanten" — dat geldt pas zodra dit gehucht echt op
// de kaart van de wereld komt te liggen).
dingen.push({ x: UITGANG.x, y: UITGANG.y, overgang: 'wereld', tekst: 'De weg de wereld in' });

const betekenis = {
  versie: 1,
  proef: true,
  uitleg: 'De betekenis van kaarten/gehucht.tmj: de schout, de vijf boeren en hun akkers, de huizen en wie erin woont, en het plein. Zie ontwerp/kaarten.md, "Tiled tekent alleen nog de grond". "proef": true omdat dit gehucht nog aan geen andere kaart vasthangt (ontwerp/werklijst.md); zodra er een echte aansluiting naar "wereld" komt, mag dat weer weg.',
  // Een klein beginvoorraadje, zodat er meteen iets te bouwen valt (js/gebouwen.js, T.plaatsGebouw
  // via het bouwmenu) zonder eerst te hoeven wachten op de eerste opbrengst. Het hooi is wat er van
  // vorige winter over is: het spel begint op 1 lentemaand, en dan eet het vee nog een maand hooi
  // (js/vee.js, T.voerHooi): drie koeien, dertig dagen.
  beginVoorraad: { hout: 40, goud: 20, graan: 60, hooi: 100 },
  // Hoeveel mensen er bij het begin wonen: 25, zoals in de derde versie, ook al is er nu plaats voor
  // meer (Marcel koos C, 26 sep; js/gebouwen.js, T.zetBestaandeGebouwen).
  beginBevolking: 25,
  // Waar de marskramer zijn waar uitstalt (js/handel.js): op het zand voor de deur van de schout,
  // waar ook de heer op Sint-Maarten staat (js/heer.js). Hij komt over de weg binnen (de uitgang
  // hieronder) en gaat daar ook weer heen.
  marskramer: { x: OP_HET_ZAND.x, y: OP_HET_ZAND.y },
  // Het plein: de rand, in tegels. Een tegel ligt erop als zijn midden erbinnen valt. Daar spelen de
  // kinderen (js/bewoners.js, T.pleinVan), en daar wordt niet gebouwd (js/gebouwen.js, T.gebouwPast).
  plein: PLEIN_RAND,
  dingen,
};

if (require.main === module) {
  const overschrijf = process.argv.includes('--overschrijf');
  if (fs.existsSync(UIT_TMJ) && !overschrijf) {
    console.error('kaarten/gehucht.tmj bestaat al. Dit script overschrijft dat nooit zomaar, voor');
    console.error('het geval er intussen in Tiled in getekend is. Moet het toch opnieuw, draai dan:');
    console.error('node gereedschap/tiled/maak-gehucht.cjs --overschrijf');
    process.exitCode = 1;
  } else if (fouten.length) {
    console.error('gehucht.tmj deugt niet:');
    for (const f of fouten) console.error(`  - ${f}`);
    process.exitCode = 1;
  } else {
    fs.mkdirSync(KAARTEN, { recursive: true });
    fs.writeFileSync(UIT_TMJ, JSON.stringify(kaart, null, 1) + '\n');
    fs.writeFileSync(UIT_BETEKENIS, JSON.stringify(betekenis, null, 1) + '\n');
    let pleinTegels = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (opPlein(x, y)) pleinTegels++;
    console.log(`gehucht.tmj klaar: ${B}×${H} tegels, ${objecten.length} objecten, plein ${pleinTegels} tegels, akkers ${AKKER_TEGELS}, uitgang (${UITGANG.x},${UITGANG.y})`);
    require('../pixelart/naar-kaarten.cjs');
  }
}

module.exports = { B, H, AKKERS, HUIZEN, SCHOUT_HUIS, GEWONE_HUIZEN, MEENT, KOOI, PLEIN_RAND, ZAND, kaart, betekenis };
