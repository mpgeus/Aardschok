// Zet de HD-pixel art om in tegelvellen die Tiled kan lezen: een .png per vel en een .tsx erbij,
// in tegels/ (wel in git, zie ontwerp/wereld.md § "De kaarten tekenen we in een editor"). Marcel
// tekent daarmee de wereld in Tiled; js/kaart.js leest wat hij tekent weer in.
//
//   node gereedschap/pixelart/naar-tiled.cjs      (of: npm run tiled)
//
// Dit script rendert rechtstreeks vanuit dorp.cjs, dorp2.cjs en bomen.cjs (net als
// dorp-export.cjs en dorp2-export.cjs al deden voor hun eigen platen) in plaats van bestaande
// platen te kopiëren: zo draait het gewoon opnieuw als daar iets aan verandert, ook terwijl er
// nog aan gebouwd wordt. Wat er nu niet (meer) bestaat, wordt overgeslagen met een melding op de
// console — dit script mag nooit vastlopen op een enkel voorwerp.
//
// Een tegelvel is één rij cellen van gelijke afmeting, met de bijbehorende platen op ware grootte
// (zie kern.cjs). Grond is precies 64×32: gewone tegels, geen speling. Bomen, begroeiing en
// gebouwen zijn hoger dan hun voettegel; die krijgen tileoffset + objectalignment="bottom" zodat
// Tiled ze vanzelf op hun voettegel zet (zie schrijfTsx). Voor gebouwen komt er ook `beslaat` bij:
// het aantal tegels dat de voet inneemt, gemeten aan het model zelf (net als dorp-export.cjs se
// meetGebouw). js/kaart.js gebruikt dat om de hele voet vast te zetten.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');
const P = require('./dorp2.cjs');
const Bm = require('./bomen.cjs');

const TEGELS = path.join(__dirname, '..', '..', 'tegels');
fs.mkdirSync(TEGELS, { recursive: true });

function schrijfPng(bestand, plaat) {
  fs.writeFileSync(path.join(TEGELS, bestand), K.png(plaat, 1));
}

// Iets proberen dat op dit moment kan mislukken (een andere agent werkt in dorp.cjs, dorp2.cjs en
// bomen.cjs): meld het en ga door met de rest van het vel.
function veilig(naam, f) {
  try {
    return f();
  } catch (e) {
    console.warn(`  overgeslagen: ${naam} (${e.message})`);
    return null;
  }
}

// ---------------------------------------------------------------- de .tsx zelf

const XML_ESC = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function eigenschapXml(naam, waarde) {
  if (typeof waarde === 'boolean') return `    <property name="${naam}" type="bool" value="${waarde}"/>\n`;
  if (typeof waarde === 'number') return `    <property name="${naam}" type="int" value="${waarde}"/>\n`;
  return `    <property name="${naam}" value="${XML_ESC(waarde)}"/>\n`;
}

// vel = { naam, bestand, breedte, hoogte, tegelB, tegelH, aantal, tileoffset: [x,y]|null,
//         objectalignment: bool, tiles: [{ naam, vast, beslaat: [b,d]|null }] }
function schrijfTsx(vel) {
  let x = '<?xml version="1.0" encoding="UTF-8"?>\n';
  x += `<tileset version="1.10" tiledversion="1.11.0" name="${vel.naam}" tilewidth="${vel.tegelB}" tileheight="${vel.tegelH}" tilecount="${vel.aantal}" columns="${vel.aantal}"`;
  if (vel.objectalignment) x += ' objectalignment="bottom"';
  x += '>\n';
  if (vel.tileoffset) x += ` <tileoffset x="${vel.tileoffset[0]}" y="${vel.tileoffset[1]}"/>\n`;
  x += ` <image source="${vel.bestand}" width="${vel.breedte}" height="${vel.hoogte}"/>\n`;
  vel.tiles.forEach((t, id) => {
    x += ` <tile id="${id}">\n  <properties>\n`;
    x += eigenschapXml('naam', t.naam);
    x += eigenschapXml('vast', !!t.vast);
    if (t.beslaat) x += eigenschapXml('beslaat', `${t.beslaat[0]}x${t.beslaat[1]}`);
    x += '  </properties>\n </tile>\n';
  });
  x += '</tileset>\n';
  fs.writeFileSync(path.join(TEGELS, `${vel.naam}.tsx`), x);
}

// ---------------------------------------------------------------- grond (64×32, geen speling)

// D.grondKaart({ vast: soort }) geeft overal dezelfde grondsoort terug (zie dorp.cjs): zo wordt
// een tegel één schoon materiaal in plaats van een lapje met een paadje erdoorheen, en tegelt hij
// naadloos. Eén pixel dikte (net onder het maaiveld) voorkomt een kier van één pixel aan de
// zuidoostrand van de ruit; helemaal plat (0 dik) mist net die randpixels.
const GROND = [
  ['gras', D.grondKaart({}), false],
  ['zandpad', D.grondKaart({ vast: D.PAD }), false],
  ['kasseien', D.grondKaart({ vast: D.KASSEI }), false],
  ['water', D.grondKaart({ vast: D.WATER }), true],
];

function grondTegel(kaart) {
  const B = new K.Beeld(64, 32, 32, 0);
  K.tekenDozen(B, [K.doos(0, 0, 1, 1, -1, 0, D.grondTex(kaart))]);
  K.belicht(B, { omgeving: () => 0.15 });
  return K.Plaat.van(K.kwantiseer(B));
}

function bouwGrondVel() {
  const items = GROND.map(([naam, kaart, vast]) => ({ naam, vast, plaat: veilig(naam, () => grondTegel(kaart)) })).filter((i) => i.plaat);
  const vel = new K.Plaat(64 * items.length, 32);
  items.forEach((it, i) => vel.plak(it.plaat, i * 64, 0));
  schrijfPng('grond.png', vel);
  const beschrijving = {
    naam: 'grond', bestand: 'grond.png', breedte: vel.b, hoogte: vel.h,
    tegelB: 64, tegelH: 32, aantal: items.length, tileoffset: null, objectalignment: false,
    tiles: items.map((it) => ({ naam: it.naam, vast: it.vast })),
  };
  schrijfTsx(beschrijving);
  console.log(`grond.png  ${vel.b}×${vel.h}  (${items.length} tegels)`);
  return beschrijving;
}

// ------------------------------------------------------- bomen & begroeiing (SDF-modellen)

// Eén boom of plant los renderen, net als gereedschap/pixelart/bosgebied-proef.cjs dat doet om een
// los onderdeel te bekijken: K.losRenderen geeft de tekening op een doorzichtig vlak, met het
// ankerpunt waar de voet de grond raakt. ontspikkel haalt losse pixels uit blad- en grastinten weg.
function meetModel(model) {
  const b = Math.ceil(model.straal * 2 + 30);
  const h = Math.ceil(model.straal * 1.7 + 40);
  return { b, h };
}
function renderModel(model, cb, ch, ankerY) {
  const p = K.losRenderen(model, { b: cb, h: ch, anker: [Math.round(cb / 2), ankerY], richting: 'Z' });
  Bm.ontspikkel(p);
  return p;
}

// naam: de sleutel in Bm (bomen.cjs), zaad: welk exemplaar (1 = het eerste).
function bouwModelVel(veldNaam, lijst, vastVan) {
  const RAND_ONDER = 26; // ruimte onder het ankerpunt, voor schaduw/anti-aliasing (zie bosgebied-proef.cjs)
  const items = [];
  for (const naam of lijst) {
    const gelukt = veilig(naam, () => {
      const model = Bm[naam](1);
      const { b, h } = meetModel(model);
      return { naam, model, b, h };
    });
    if (gelukt) items.push(gelukt);
  }
  if (!items.length) return null;
  const cb = Math.max(...items.map((i) => i.b));
  const ch = Math.max(...items.map((i) => i.h));
  const ankerX = Math.round(cb / 2);
  const ankerY = ch - RAND_ONDER;
  const vel = new K.Plaat(cb * items.length, ch);
  items.forEach((it, i) => {
    const p = veilig(it.naam, () => renderModel(it.model, cb, ch, ankerY));
    if (p) vel.plak(p, i * cb, 0);
  });
  schrijfPng(`${veldNaam}.png`, vel);
  const beschrijving = {
    naam: veldNaam, bestand: `${veldNaam}.png`, breedte: vel.b, hoogte: vel.h,
    tegelB: cb, tegelH: ch, aantal: items.length,
    // Het model zet zijn eigen voet altijd op (ankerX, ankerY); "bottom" is dus alleen goed met
    // deze correctie: Tiled schuift het plaatje cb/2−ankerX opzij en ch−ankerY omlaag terug.
    tileoffset: [Math.round(cb / 2) - ankerX, ch - ankerY],
    objectalignment: true,
    tiles: items.map((it) => ({ naam: it.naam, vast: vastVan(it.naam) })),
  };
  schrijfTsx(beschrijving);
  console.log(`${veldNaam}.png  ${vel.b}×${vel.h}  (${items.length} tegels)`);
  return beschrijving;
}

const BOMEN = ['eik', 'herfstEik', 'den', 'berk', 'dodeBoom', 'wilg', 'appelboom'];
const BOMEN_VAST = () => true; // een boom staat altijd in de weg

// Bm.BEGROEIING komt uit bomen.cjs zelf (zie module.exports daar): zo blijft dit script kloppen
// als daar later iets bij komt of verandert, zonder dat hier iets hoeft mee te veranderen.
const BEGROEIING = Bm.BEGROEIING || ['struik', 'bessenStruik', 'varen', 'grasPol', 'hoogGras', 'bloemen', 'paddenstoelen', 'boomstronk', 'rots', 'kleineRots'];
// Lage planten (varen, gras, bloemen, paddenstoelen, los steengruis) zijn geen obstakel; struiken
// en een stronk of rots wel. Een korte, expliciete lijst: makkelijker te lezen dan een regel.
const BEGROEIING_VAST = { struik: true, bessenStruik: true, boomstronk: true, rots: true };

// ---------------------------------------------------------------- gebouwen & plekken (vormen)

// Zelfde recept als gebouwLos/plekLos in dorp-export.cjs en dorp2-export.cjs: het gebouw zelf
// tekenen, de avondzon-schaduw van zijn eigen vormen erop, het avondlicht erover, dan omlijnen.
// hoek: waar (in schermpixels, gemeten vanaf hetzelfde punt als bij meetGebouw) de achterste
// voethoek van dit gebouw valt — dat punt komt op (anker[0], anker[1]) te staan, niet het
// wereldnulpunt van maak(0, 0). Zie de toelichting bij meetGebouw hieronder.
function gebouwLos(g, b, h, anker, hoek) {
  const B = new K.Beeld(b, h, anker[0] - hoek[0], anker[1] - hoek[1]);
  D.zetGebouw(B, g);
  D.zonSchaduw(B, g.vormen, { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  D.avondlicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}
// De rand van het model meten op een ruim schaduwblad, zoals dorp-export.cjs se maten() doet.
// Let op: maak(0, 0) zet zijn wereldnulpunt niet op de achterste voethoek maar een halve tegel
// erin (g.voet[0], g.voet[1] is net iets minder dan 0), dus meten we hier ook waar die hoek
// zelf op het scherm valt: de marges (links/rechts/boven/onder) en straks het ankerpunt gaan
// over díe hoek, zodat "beslaat" tegels ook precies vanaf de aangeklikte tegel beginnen.
function meetGebouw(g) {
  const OX = 450, OY = 550;
  const B = new K.Beeld(900, 900, OX, OY);
  D.zetGebouw(B, g);
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] < 0) continue;
    const x = i % B.b;
    const y = (i / B.b) | 0;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const voet = g.voet || [0, 0, 0, 0];
  const [hsx, hsy] = K.naarScherm(B, voet[0], voet[1], 0);
  const hoek = [hsx - OX, hsy - OY]; // de achterste voethoek, t.o.v. het wereldnulpunt
  return {
    links: hsx - x0 + 1, rechts: x1 - hsx + 1, boven: hsy - y0 + 1, onder: y1 - hsy + 1,
    hoek,
  };
}

// (naam, maakFn); maakFn bouwt het gebouw op (0, 0), zoals de bestaande -export.cjs-scripts doen.
function gebouwenLijst() {
  const lijst = [
    ['vakwerkhuis', () => D.vakwerkhuis(0, 0)],
    ['stenenHuis', () => D.stenenHuis(0, 0)],
    ['herberg', () => D.herberg(0, 0, { rook: false })],
  ];
  if (typeof D.smidse === 'function') lijst.push(['smidse', () => D.smidse(0, 0)]);
  if (typeof D.dorpshuis === 'function') {
    lijst.push(['dorpshuis1', () => D.dorpshuis(0, 0, 1, { maat: [7, 5], rook: false })]);
    lijst.push(['dorpshuis3', () => D.dorpshuis(0, 0, 3, { maat: [6, 8], rook: false })]);
    lijst.push(['dorpshuis5', () => D.dorpshuis(0, 0, 5, { maat: [5, 7], rook: false, muur: 'blokhut' })]);
  }
  if (typeof P.kapel === 'function') lijst.push(['kapel', () => P.kapel(0, 0)]);
  if (typeof P.kerkhof === 'function') lijst.push(['kerkhof', () => P.kerkhof(0, 0, { b: 6, d: 4, rijen: 4, kol: 3 })]);
  if (typeof P.watermolen === 'function') lijst.push(['watermolen', () => P.watermolen(0, 0, { radVlak: 'y', rook: false })]);
  if (typeof P.bakkerij === 'function') lijst.push(['bakkerij', () => P.bakkerij(0, 0, { rook: false })]);
  if (typeof P.kruidenhut === 'function') lijst.push(['kruidenhut', () => P.kruidenhut(0, 0, { rook: false })]);
  if (typeof P.jagershut === 'function') lijst.push(['jagershut', () => P.jagershut(0, 0, { rook: false })]);
  if (typeof P.oudstehuis === 'function') lijst.push(['oudstehuis', () => P.oudstehuis(0, 0, { rook: false })]);
  if (typeof P.schuur === 'function') lijst.push(['schuur', () => P.schuur(0, 0)]);
  // brug slaan we over: die is geen heel aantal tegels breed, en hoort dus niet in "beslaat".
  return lijst;
}

function bouwGebouwenVel() {
  const RAND = 6;
  const acht = (n) => Math.ceil(n / 8) * 8;
  const items = [];
  for (const [naam, maak] of gebouwenLijst()) {
    const gelukt = veilig(naam, () => {
      const g = maak();
      const m = meetGebouw(g);
      const v = g.voet || [0, 0, 0, 0];
      const beslaat = [Math.max(1, Math.round((v[2] - v[0]) / K.TEGEL)), Math.max(1, Math.round((v[3] - v[1]) / K.TEGEL))];
      return { naam, maak, m, beslaat };
    });
    if (gelukt) items.push(gelukt);
  }
  if (!items.length) return null;
  const links = Math.max(...items.map((i) => i.m.links)) + RAND;
  const rechts = Math.max(...items.map((i) => i.m.rechts)) + RAND;
  const boven = Math.max(...items.map((i) => i.m.boven)) + RAND;
  const onder = Math.max(...items.map((i) => i.m.onder)) + RAND;
  const cb = acht(links + rechts);
  const ch = acht(boven + onder);
  const ankerX = links + Math.floor((cb - links - rechts) / 2);
  const ankerY = boven + (ch - boven - onder);
  const vel = new K.Plaat(cb * items.length, ch);
  items.forEach((it, i) => {
    const p = veilig(it.naam, () => gebouwLos(it.maak(), cb, ch, [ankerX, ankerY], it.m.hoek));
    if (p) vel.plak(p, i * cb, 0);
  });
  schrijfPng('gebouwen.png', vel);
  const beschrijving = {
    naam: 'gebouwen', bestand: 'gebouwen.png', breedte: vel.b, hoogte: vel.h,
    tegelB: cb, tegelH: ch, aantal: items.length,
    tileoffset: [Math.round(cb / 2) - ankerX, ch - ankerY],
    objectalignment: true,
    tiles: items.map((it) => ({ naam: it.naam, vast: true, beslaat: it.beslaat })),
  };
  schrijfTsx(beschrijving);
  console.log(`gebouwen.png  ${vel.b}×${vel.h}  (${items.length} tegels)`);
  items.forEach((it) => console.log(`  ${it.naam.padEnd(14)} beslaat ${it.beslaat[0]}x${it.beslaat[1]}`));
  return beschrijving;
}

// ---------------------------------------------------------------- alles samen, en het zijspoor
// voor js/kaart.js: welke eigenschappen elke tegel heeft, zonder dat het spel de .tsx (xml) hoeft
// te lezen. tegels.json is de bron, tegels.js dezelfde inhoud als gewoon script (zie
// beelden/beschrijving.js): dat werkt ook als index.html los open staat, want fetch mag dan niet.

const velden = [bouwGrondVel(), bouwModelVel('bomen', BOMEN, BOMEN_VAST), bouwModelVel('begroeiing', BEGROEIING, (n) => !!BEGROEIING_VAST[n]), bouwGebouwenVel()].filter(Boolean);

const TEGELS_JSON = {};
for (const v of velden) {
  TEGELS_JSON[v.naam] = {
    tsx: `tegels/${v.naam}.tsx`,
    tegelB: v.tegelB,
    tegelH: v.tegelH,
    tileoffset: v.tileoffset,
    objectalignment: v.objectalignment,
    // per lokaal tegel-id (0, 1, 2, …, zoals in de .tsx) dezelfde eigenschappen als daar.
    tiles: v.tiles.map((t) => ({ naam: t.naam, vast: t.vast, beslaat: t.beslaat || null })),
  };
}
const json = JSON.stringify(TEGELS_JSON, null, 1);
fs.writeFileSync(path.join(TEGELS, 'tegels.json'), json + '\n');
fs.writeFileSync(
  path.join(TEGELS, 'tegels.js'),
  '// Gemaakt door gereedschap/pixelart/naar-tiled.cjs — niet met de hand bijwerken.\n' +
    '// Dezelfde inhoud als tegels.json, als script, zodat file:// het ook kan lezen (zie js/kaart.js).\n' +
    '(function (T) {\n  T.TEGELS = ' +
    json.replace(/\n/g, '\n  ') +
    ';\n})(globalThis.Toren = globalThis.Toren || {});\n',
);

let totaal = 0;
for (const f of fs.readdirSync(TEGELS)) {
  const p = path.join(TEGELS, f);
  if (fs.statSync(p).isDirectory()) continue;
  totaal += fs.statSync(p).size;
}
console.log(`tegels/ klaar: ${velden.length} vellen, ${Math.round(totaal / 1024)} kB`);
