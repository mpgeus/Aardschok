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

// Hoe ver reikt wat er op een plaat getekend is vanaf zijn ankerpunt: [links, boven, rechts,
// onder]. Een cel is voor alle tegels van een vel even groot, maar een berk is smaller dan een
// eik en een bank kleiner dan een waslijn; het spel heeft de echte maat nodig om te weten of dit
// ding iemand verbergt (doorkijk, js/tekenen.js).
function krapDoos(plaat, ax, ay) {
  let x0 = plaat.b;
  let y0 = plaat.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < plaat.h; y++) {
    for (let x = 0; x < plaat.b; x++) {
      if (plaat.px[(y * plaat.b + x) * 2] < 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return [0, 0, 0, 0];
  return [ax - x0, ay - y0, x1 + 1 - ax, y1 + 1 - ay];
}

// ---------------------------------------------------------------- de .tsx zelf

const XML_ESC = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function eigenschapXml(naam, waarde) {
  if (typeof waarde === 'boolean') return `    <property name="${naam}" type="bool" value="${waarde}"/>\n`;
  if (typeof waarde === 'number') return `    <property name="${naam}" type="int" value="${waarde}"/>\n`;
  return `    <property name="${naam}" value="${XML_ESC(waarde)}"/>\n`;
}

// vel = { naam, bestand, breedte, hoogte, tegelB, tegelH, aantal, kolommen, notitie,
//         tileoffset: [x,y]|null, objectalignment: bool,
//         tiles: [{ naam, vast, beslaat: [b,d]|null, groep }] }
function schrijfTsx(vel) {
  let x = '<?xml version="1.0" encoding="UTF-8"?>\n';
  x += `<tileset version="1.10" tiledversion="1.11.0" name="${vel.naam}" tilewidth="${vel.tegelB}" tileheight="${vel.tegelH}" tilecount="${vel.aantal}" columns="${vel.kolommen || vel.aantal}"`;
  if (vel.objectalignment) x += ' objectalignment="bottom"';
  x += '>\n';
  if (vel.tileoffset) x += ` <tileoffset x="${vel.tileoffset[0]}" y="${vel.tileoffset[1]}"/>\n`;
  // Een korte notitie bij het hele vel (Tiled toont dit bij de eigenschappen van de tileset
  // zelf, niet van een tegel): hoe Marcel de tegels moet gebruiken, zie ook het verslag.
  if (vel.notitie) x += ` <properties>\n  ${eigenschapXml('notitie', vel.notitie).trim()}\n </properties>\n`;
  x += ` <image source="${vel.bestand}" width="${vel.breedte}" height="${vel.hoogte}"/>\n`;
  vel.tiles.forEach((t, id) => {
    x += ` <tile id="${id}">\n  <properties>\n`;
    x += eigenschapXml('naam', t.naam);
    x += eigenschapXml('vast', !!t.vast);
    if (t.beslaat) x += eigenschapXml('beslaat', `${t.beslaat[0]}x${t.beslaat[1]}`);
    if (t.groep) x += eigenschapXml('groep', t.groep);
    if (t.staat) x += eigenschapXml('staat_op_erf', t.staat);
    x += '  </properties>\n </tile>\n';
  });
  x += '</tileset>\n';
  fs.writeFileSync(path.join(TEGELS, `${vel.naam}.tsx`), x);
}

// ---------------------------------------------------------------- grond (64×32, geen speling)

// Eerst ging dit per tegel: dorp.grondTex() van precies 1×1 tegel renderen. Dat bleek in Tiled
// meteen te herhalen — elke "gras"-tegel is dan letterlijk dezelfde bitmap, dus de plukjes en
// het kasseienrooster vormen nette rijen zodra Marcel een stuk grond vult. In onze eigen platen
// (dorp-export.cjs) viel dat niet op, want die tekenen de ruis in één keer over een groot vlak.
//
// De oplossing: een lap van STEMPEL × STEMPEL tegels in één moeite door renderen (de ruis loopt
// dus gewoon door, op de echte wereld-gx/gy) en die achteraf in losse 64×32-tegels knippen
// (Plaat.uitsnede, hetzelfde stukje gereedschap als de sprites-agent gebruikte voor de vloeren
// binnen — zie naar-spel.cjs/beschrijving.json: vloeren.cel is ook een lap, 2×2 tegels, waar het
// spel zelf een ruit uit snijdt; hier snijden wij vooraf, want Tiled kent geen "knip een ruit uit
// een grotere plaat", alleen losse tegels). Marcel selecteert in Tiled de STEMPEL × STEMPEL-blok
// tegels van één grondsoort als één stempel (ze staan expres aaneengesloten in de tileset, zie
// "kolommen" hieronder) en herhaalt die over het veld: de herhaling valt dan om de vier tegels in
// plaats van om de één, en binnen een stempel sluiten de randen exact aan, want dat is één
// doorlopend bovenvlak. Erachteraan staan een paar LOSSE tegels (uit een ander stuk van diezelfde
// ruis, dus geen kopie van iets in de stempel) om tussen het stempelwerk te strooien met Tiled se
// eigen stempel-op-toeval; bij gras staat er ook net iets vaker een grasPol of bloem op.
const STEMPEL = 4; // 4×4 tegels: ver genoeg uit elkaar dat het oog de herhaling niet meer volgt
const DIKTE = 0.3; // net genoeg lager dan de vloer om de buitenrand van de lap heel te houden
// (kwantiseer mist een randpixel bij 0 dik door een rakende lichtstraal; interne sneden in de lap
// hebben dit niet nodig, want dat is geen rand van de doos maar gewoon het bovenvlak zelf).

const GROND = [
  ['gras', D.grondKaart({}), false],
  ['zandpad', D.grondKaart({ vast: D.PAD }), false],
  ['kasseien', D.grondKaart({ vast: D.KASSEI }), false],
];
// Losse tegels: telkens een flink stuk verderop in dezelfde ruis, zodat ze niet toevallig op een
// tegel uit de stempel lijken. Geen vaste betekenis (geen "altijd een kiezel op tegel 2"): het
// zijn gewoon andere plekken in hetzelfde grondtype, met bij gras een zwaardere grasPollen-hand.
const LOS_OFFSETS = [[9, 2], [3, 12], [15, 8]];

// Eén lap van tegelsB × tegelsH tegels, met de linkerbovenhoek op wereldtegel (gx0, gy0). Het
// canvas is precies zo groot als de lap (geen rand); die hoek valt op de bovenpunt van het
// canvas, net als bij (gx0, gy0) = (0, 0) op een gewoon canvas van 64×32.
function grondLap(kaart, tegelsB, tegelsH, gx0, gy0, dicht) {
  const b = tegelsB * 64;
  const h = tegelsH * 32;
  const OX = tegelsB * 32 - (gx0 - gy0) * 32;
  const OY = -(gx0 + gy0) * 16;
  const B = new K.Beeld(b, h, OX, OY);
  K.tekenDozen(B, [K.doos(gx0, gy0, gx0 + tegelsB, gy0 + tegelsH, -DIKTE, 0, D.grondTex(kaart))]);
  if (dicht) D.grasPollen(B, kaart, { dicht, bloemen: dicht });
  K.belicht(B, { omgeving: () => 0.15 });
  return K.Plaat.van(K.kwantiseer(B));
}

// Tegel (tx, ty), 0-based binnen de lap, uit de lap-plaat snijden.
function snijTegel(lapPlaat, tegelsB, tx, ty) {
  const OX = tegelsB * 32;
  return lapPlaat.uitsnede(OX + (tx - ty) * 32 - 32, (tx + ty) * 16, 64, 32);
}

function bouwGrondVel() {
  const soorten = [];
  for (const [naam, kaart, vast] of GROND) {
    const gelukt = veilig(naam, () => {
      const stempel = [];
      const lap = grondLap(kaart, STEMPEL, STEMPEL, 0, 0, naam === 'gras' ? 1 : 0);
      for (let ty = 0; ty < STEMPEL; ty++) for (let tx = 0; tx < STEMPEL; tx++) stempel.push(snijTegel(lap, STEMPEL, tx, ty));
      // een lap van 1×1 is al precies 64×32: grondLap zelf hoeft dan niet meer gesneden te worden.
      const los = LOS_OFFSETS.map(([gx0, gy0]) => grondLap(kaart, 1, 1, gx0, gy0, naam === 'gras' ? 7 : 0));
      return { naam, vast, stempel, los };
    });
    if (gelukt) soorten.push(gelukt);
  }
  // water blijft zoals het was: één tegel, geen stempel nodig voor iets wat toch overal
  // hetzelfde golft.
  const water = veilig('water', () => grondLap(D.grondKaart({ vast: D.WATER }), 1, 1, 0, 0, 0));

  const kolommen = STEMPEL;
  const tiles = [];
  const platen = [];
  for (const s of soorten) {
    for (const p of s.stempel) { tiles.push({ naam: s.naam, vast: s.vast, groep: 'stempel' }); platen.push(p); }
  }
  for (const s of soorten) {
    for (const p of s.los) { tiles.push({ naam: s.naam, vast: s.vast, groep: 'los' }); platen.push(p); }
  }
  if (water) { tiles.push({ naam: 'water', vast: true, groep: 'los' }); platen.push(water); }

  const rijen = Math.ceil(platen.length / kolommen);
  const vel = new K.Plaat(64 * kolommen, 32 * rijen);
  platen.forEach((p, i) => vel.plak(p, (i % kolommen) * 64, Math.floor(i / kolommen) * 32));
  schrijfPng('grond.png', vel);
  const namen = soorten.map((s) => s.naam).join('/');
  const beschrijving = {
    naam: 'grond', bestand: 'grond.png', breedte: vel.b, hoogte: vel.h,
    tegelB: 64, tegelH: 32, aantal: platen.length, kolommen, tileoffset: null, objectalignment: false,
    notitie: `Elke grondsoort (${namen}) staat eerst als stempel van ${STEMPEL}×${STEMPEL} tegels (groep "stempel"): sleep dat blok in de tileset in één keer op de kaart en herhaal het, dan valt de herhaling niet meer op. Daarna een paar losse tegels (groep "los", ook water): die mag je er individueel tussen strooien, bijvoorbeeld met Tiled se stempel-op-toeval.`,
    tiles,
  };
  schrijfTsx(beschrijving);
  console.log(`grond.png  ${vel.b}×${vel.h}  (${platen.length} tegels: ${soorten.map((s) => `${s.naam} ${s.stempel.length}+${s.los.length}`).join(', ')}${water ? ', water 1' : ''})`);
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
    if (p) {
      vel.plak(p, i * cb, 0);
      it.doos = krapDoos(p, ankerX, ankerY);
    }
  });
  schrijfPng(`${veldNaam}.png`, vel);
  const beschrijving = {
    naam: veldNaam, bestand: `${veldNaam}.png`, breedte: vel.b, hoogte: vel.h,
    tegelB: cb, tegelH: ch, aantal: items.length,
    // Het model zet zijn eigen voet altijd op (ankerX, ankerY); "bottom" is dus alleen goed met
    // deze correctie: Tiled schuift het plaatje cb/2−ankerX opzij en ch−ankerY omlaag terug.
    tileoffset: [Math.round(cb / 2) - ankerX, ch - ankerY],
    objectalignment: true,
    tiles: items.map((it) => ({ naam: it.naam, vast: vastVan(it.naam), doos: it.doos || null })),
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
    if (p) {
      vel.plak(p, i * cb, 0);
      // Het anker van een gebouw is zijn achterste voethoek; die ligt een halve tegel boven het
      // midden van zijn tegel, en het spel tekent op dat midden (zie `anker` onderaan).
      it.doos = krapDoos(p, ankerX, ankerY + 16);
    }
  });
  schrijfPng('gebouwen.png', vel);
  const beschrijving = {
    naam: 'gebouwen', bestand: 'gebouwen.png', breedte: vel.b, hoogte: vel.h,
    tegelB: cb, tegelH: ch, aantal: items.length,
    tileoffset: [Math.round(cb / 2) - ankerX, ch - ankerY],
    objectalignment: true,
    tiles: items.map((it) => ({ naam: it.naam, vast: true, beslaat: it.beslaat, doos: it.doos || null })),
  };
  schrijfTsx(beschrijving);
  console.log(`gebouwen.png  ${vel.b}×${vel.h}  (${items.length} tegels)`);
  items.forEach((it) => console.log(`  ${it.naam.padEnd(14)} beslaat ${it.beslaat[0]}x${it.beslaat[1]}`));
  return beschrijving;
}

// ---------------------------------------------------------------- het erf: de toren en wat er op
// staat (erf-scene.cjs)
//
// Het erf van de toren is geen verzameling losse modellen zoals de bomen, maar één scène: het
// schuurtje, de put, de houtstapel, de waslijn en de moestuin worden daar met dezelfde tekenaar
// gebouwd als de toren zelf (toren.cjs se Wereld/tekenWereld). Hier bouwen we per ding een
// wereldje met alleen dat ding erin, op precies de plek waar erf-scene.cjs het zet, en renderen
// dat los. Zo staat de plaatsing maar op één plek: verzet Marcel de put in erf-scene.cjs, dan
// verschuift hij mee in Tiled én in het spel (erf-kaart.cjs maakt kaarten/erf.tmj uit dezelfde
// lijst).
//
// voet: [x0, y0, breed, diep] in tegels vanaf de voet van de toren — welke tegels het ding
// inneemt. De tegel (x0, y0) is de tegel die je in Tiled aanklikt, en het ankerpunt van de cel
// is het midden van díe tegel (zie `anker` onderaan: het spel legt dat punt op T.naarScherm).
const Tr = require('./toren.cjs');
const Es = require('./erf-scene.cjs');

const ERF_STAAT = { oud: 1, onkruid: 1 };

// De wereld met alleen dit ene ding erin, op de plek waar erf-scene.cjs het zet.
function erfWereld(bouw) {
  const W = new Tr.Wereld();
  if (bouw) {
    Es.materialen(W, ERF_STAAT);
    bouw(W, ERF_STAAT);
  } else {
    // Zonder aanbouw (schuur: null), net als erf-scene.cjs: op het erf staat een eigen schuurtje,
    // en twee schuren tegen elkaar aan wordt rommelig.
    const Wt = Tr.bouwToren({ ...Tr.STATEN.krakkemikkig, schuur: null });
    W.groepen.push(...Wt.groepen);
    Object.assign(W.mat, Wt.mat);
    W.lichten.push(...Wt.lichten);
  }
  return W;
}

// De voetafdruk van een gebouwd ding opmeten in plaats van hem als getal op te schrijven: vanuit
// het midden naar binnen zoeken tot het afstandsveld iets raakt, net boven de grond, in tweeënzestig
// richtingen. Zo klopt de voet nog steeds zodra de toren dikker gemaakt wordt (hij moet om zijn
// eigen hal passen, zie ontwerp/wereld.md), zonder dat hier of in erf-kaart.cjs een getal staat.
// Geeft [x0, y0, breed, diep] in tegels, plus de hoogte van het model in eenheden.
function meetVoet(W) {
  const groepen = W.groepen.filter((g) => g.delen.length);
  // tekenWereld sluit de groepen (grenscilinders); op een vlak van 1×1 kost dat niets.
  Tr.tekenWereld(new K.Beeld(1, 1, 0, 0), W);
  const n = groepen.length;
  // Tien eenheden boven de grond: hoog genoeg om over het puin en de losse stenen om de voet heen
  // te kijken (daar loop je gewoon omheen, dat hoeft geen muur te zijn), laag genoeg om nog in de
  // plint te zitten en niet in het dak.
  const Z = 10;
  const MAXR = 900;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i < 62; i++) {
    const a = (i / 62) * Math.PI * 2;
    const cx = Math.cos(a);
    const cy = Math.sin(a);
    let r = MAXR;
    while (r > 0 && Tr.veld(groepen, n, cx * r, cy * r, Z) > 0) r -= 2;
    if (r <= 0) continue;
    x0 = Math.min(x0, cx * r);
    x1 = Math.max(x1, cx * r);
    y0 = Math.min(y0, cy * r);
    y1 = Math.max(y1, cy * r);
  }
  if (!Number.isFinite(x0)) return { voet: [0, 0, 1, 1], hoog: 100 };
  const tx0 = Math.round(x0 / K.TEGEL);
  const ty0 = Math.round(y0 / K.TEGEL);
  const hoog = Math.max(...groepen.map((g) => g.z1 || 0), 1);
  return { voet: [tx0, ty0, Math.max(1, Math.round(x1 / K.TEGEL) - tx0 + 1), Math.max(1, Math.round(y1 / K.TEGEL) - ty0 + 1)], hoog };
}

// Eén ding van het erf op een ruim vlak renderen. Het anker van het vlak komt op het midden van
// tegel (x0, y0) te liggen; daarna snijden we de plaat strak om wat er getekend is en schuift het
// anker mee. Zo is de cel niet groter dan nodig en weet het spel waar de voet ligt.
function erfDingLos(naam, opgegeven, bouw, vlak) {
  // Zonder opgegeven voet meten we hem op (de toren), en dan groeit ook het vlak mee.
  let voet = opgegeven;
  let hoog = 0;
  if (!voet) {
    const gemeten = meetVoet(erfWereld(bouw));
    voet = gemeten.voet;
    hoog = gemeten.hoog;
  }
  const [x0, y0, vb, vd] = voet;
  const breedPx = (vb + vd) * 32;
  const cb = (vlak && vlak[0]) || Math.ceil(breedPx * 1.6 + 200);
  const ch = (vlak && vlak[1]) || Math.ceil(hoog * K.PXH + breedPx / 2 + 320);
  // Het anker ruim genoeg van de rand: het meeste steekt naar boven uit (daken, de toren), dus het
  // ankerpunt ligt laag in het vlak. Eronder moet nog wel de rest van de voet passen: de tegel
  // (x0, y0) is de achterste hoek, en de voorste hoek ligt ((b−1)+(d−1)) halve tegelhoogtes lager,
  // plus wat het model zelf nog onder de grond heeft (palen, puin).
  const ax = Math.round(cb / 2);
  const ay = ch - (((vb - 1) + (vd - 1)) * 16 + 96);
  // B.OX/B.OY horen bij wereldpunt (0, 0, 0) = de voet van de toren; het anker moet op tegel
  // (x0, y0) vallen, dus schuift de oorsprong daar vandaan terug.
  const B = new K.Beeld(cb, ch, ax - (x0 - y0) * 32, ay - (x0 + y0) * 16);
  const W = erfWereld(bouw);
  Tr.tekenWereld(B, W);
  if (bouw) {
    K.belicht(B, { omgeving: () => 0.15 });
  } else {
    // De toren krijgt het licht van buiten dat toren.cjs zelf gebruikt; zonder de grondplaat van
    // toren(), want het spel tekent zijn eigen gras eronder.
    K.belicht(B, { omgeving: (X, Y, Z, px, py, i) => 0.05 + 0.25 * B.nrm[i * 3 + 2] });
    Tr.zonKleur(B, 6.2);
  }
  K.verwarm(B, 1.6);
  K.omlijn(B);
  const plaat = K.Plaat.van(K.kwantiseer(B));
  // strak snijden
  let x1 = -1;
  let y1 = -1;
  let xa = plaat.b;
  let ya = plaat.h;
  for (let y = 0; y < plaat.h; y++) {
    for (let x = 0; x < plaat.b; x++) {
      if (plaat.px[(y * plaat.b + x) * 2] < 0) continue;
      if (x < xa) xa = x;
      if (x > x1) x1 = x;
      if (y < ya) ya = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) throw new Error('niets getekend');
  if (xa === 0 || ya === 0 || x1 === plaat.b - 1 || y1 === plaat.h - 1) {
    console.warn(`  let op: ${naam} raakt de rand van zijn vlak (${cb}×${ch}) — maak het ruimer`);
  }
  return { plaat: plaat.uitsnede(xa, ya, x1 - xa + 1, y1 - ya + 1), anker: [ax - xa, ay - ya], voet };
}

function bouwErfVel(veldNaam, dingen, notitie) {
  const items = [];
  for (const { naam, voet, vast, bouw, vlak } of dingen) {
    const t0 = Date.now();
    const gelukt = veilig(naam, () => erfDingLos(naam, voet, bouw, vlak));
    if (!gelukt) continue;
    items.push({ naam, vast, ...gelukt });
    console.log(`  ${naam.padEnd(12)} ${gelukt.plaat.b}×${gelukt.plaat.h}  anker ${gelukt.anker.join(',')}  voet ${gelukt.voet.join(',')}  ${Date.now() - t0} ms`);
  }
  if (!items.length) return null;
  // Eén cel die om alles heen past: het anker op dezelfde plek in elke cel, zoals bij de andere
  // vellen, zodat Tiled er met één tileoffset mee uit de voeten kan.
  const links = Math.max(...items.map((i) => i.anker[0]));
  const rechts = Math.max(...items.map((i) => i.plaat.b - i.anker[0]));
  const boven = Math.max(...items.map((i) => i.anker[1]));
  const onder = Math.max(...items.map((i) => i.plaat.h - i.anker[1]));
  const cb = links + rechts;
  const ch = boven + onder;
  const vel = new K.Plaat(cb * items.length, ch);
  items.forEach((it, i) => vel.plak(it.plaat, i * cb + links - it.anker[0], boven - it.anker[1]));
  schrijfPng(`${veldNaam}.png`, vel);
  const beschrijving = {
    naam: veldNaam, bestand: `${veldNaam}.png`, breedte: vel.b, hoogte: vel.h,
    tegelB: cb, tegelH: ch, aantal: items.length,
    // Het anker ligt op het midden van de voettegel; Tiled se "bottom" zet het onderste midden van
    // de cel op de tegel, dus corrigeren we daarheen terug (net als bij de bomen en de gebouwen).
    tileoffset: [Math.round(cb / 2) - links, ch - boven],
    objectalignment: true,
    anker: [links, boven],
    notitie,
    // `staat`: op welke tegel dit ding hoort te staan, in tegels vanaf de voet van de toren. Zo
    // hoeft erf-kaart.cjs de plaatsing niet nog eens uit te rekenen, en klopt hij ook als de voet
    // van de toren opgemeten wordt in plaats van opgeschreven.
    // `doos`: hoe ver het beeld links, boven, rechts en onder het ankerpunt reikt. De cel is voor
    // alle tegels van een vel even groot (Tiled wil dat zo), maar een bank is geen waslijn; het
    // spel heeft de echte maat nodig om te weten of dit ding iemand verbergt (doorkijk).
    tiles: items.map((it) => ({
      naam: it.naam, vast: it.vast, beslaat: [it.voet[2], it.voet[3]], staat: `${it.voet[0]},${it.voet[1]}`,
      doos: [it.anker[0], it.anker[1], it.plaat.b - it.anker[0], it.plaat.h - it.anker[1]],
    })),
  };
  schrijfTsx(beschrijving);
  console.log(`${veldNaam}.png  ${vel.b}×${vel.h}  (${items.length} tegels)`);
  return beschrijving;
}

// ---------------------------------------------------------------- een vel dat elders gemaakt is
//
// De randtegels, oevers en de brug komen uit een eigen script (randtegels.cjs, npm run
// randtegels): die worden heel anders gebouwd dan de rest — per overgang tussen twee grondsoorten,
// met terreinsets (wangsets) erbij waaruit Tiled zelf de goede hoektegel kiest. Dat script
// schrijft tegels/rand.png en tegels/rand.tsx, maar niet tegels.json, en juist dat laatste is wat
// het spel leest (js/kaart.js, js/sprites.js).
//
// Daarom lezen we hier de .tsx in plaats van opnieuw te renderen. Dat heeft twee voordelen: de
// tekening staat maar op één plek, en `npm run tiled` hoeft geen minuten renderwerk over te doen
// voor een vel dat niet van hem is. Wat in de .tsx staat is precies wat tegels.json nodig heeft:
// de maten, en per tegel `naam`, `vast`, `groep` en eventueel `beslaat`.
function attr(tekst, naam) {
  const m = tekst.match(new RegExp(`${naam}="([^"]*)"`));
  return m ? m[1] : null;
}
const XML_UIT = (s) => String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

// De eigenschappen van één <tile>-blok, in dezelfde vorm als de tiles hierboven.
function tileUitXml(blok) {
  const t = { naam: null, vast: false };
  for (const m of blok.matchAll(/<property\s+([^>]*?)\/>/g)) {
    const naam = attr(m[1], 'name');
    const waarde = XML_UIT(attr(m[1], 'value') || '');
    if (naam === 'naam') t.naam = waarde;
    else if (naam === 'vast') t.vast = waarde === 'true';
    else if (naam === 'groep') t.groep = waarde;
    else if (naam === 'beslaat') t.beslaat = waarde.split('x').map(Number);
    else if (naam === 'staat_op_erf') t.staat = waarde;
  }
  return t;
}

function leesVelUitTsx(veldNaam) {
  const pad = path.join(TEGELS, `${veldNaam}.tsx`);
  if (!fs.existsSync(pad)) {
    console.warn(`  overgeslagen: ${veldNaam}.tsx bestaat nog niet — draai eerst npm run ${veldNaam === 'rand' ? 'randtegels' : veldNaam}`);
    return null;
  }
  const xml = fs.readFileSync(pad, 'utf8');
  const kop = xml.slice(xml.indexOf('<tileset'), xml.indexOf('>', xml.indexOf('<tileset')));
  const beeld = xml.slice(xml.indexOf('<image'), xml.indexOf('>', xml.indexOf('<image')));
  const offset = xml.includes('<tileoffset') ? xml.slice(xml.indexOf('<tileoffset'), xml.indexOf('>', xml.indexOf('<tileoffset'))) : null;
  const tiles = [];
  // De id's staan in de .tsx op volgorde en zonder gaten (zo schrijft elk van onze scripts ze),
  // maar we zetten elke tegel toch op zijn eigen id neer: een gat zou anders alles opschuiven.
  for (const m of xml.matchAll(/<tile\s+id="(\d+)"[^>]*>([\s\S]*?)<\/tile>/g)) {
    tiles[Number(m[1])] = tileUitXml(m[2]);
  }
  const aantal = Number(attr(kop, 'tilecount')) || tiles.length;
  for (let i = 0; i < aantal; i++) if (!tiles[i]) tiles[i] = { naam: veldNaam, vast: false };
  const vel = {
    naam: veldNaam,
    bestand: attr(beeld, 'source'),
    breedte: Number(attr(beeld, 'width')),
    hoogte: Number(attr(beeld, 'height')),
    tegelB: Number(attr(kop, 'tilewidth')),
    tegelH: Number(attr(kop, 'tileheight')),
    aantal,
    kolommen: Number(attr(kop, 'columns')) || aantal,
    tileoffset: offset ? [Number(attr(offset, 'x')), Number(attr(offset, 'y'))] : null,
    objectalignment: kop.includes('objectalignment="bottom"'),
    tiles,
  };
  console.log(`${veldNaam}.tsx  ${vel.breedte}×${vel.hoogte}  (${aantal} tegels, ingelezen — gemaakt door een eigen script)`);
  return vel;
}

// ---------------------------------------------------------------- alles samen, en het zijspoor
// voor js/kaart.js: welke eigenschappen elke tegel heeft, zonder dat het spel de .tsx (xml) hoeft
// te lezen. tegels.json is de bron, tegels.js dezelfde inhoud als gewoon script (zie
// beelden/beschrijving.js): dat werkt ook als index.html los open staat, want fetch mag dan niet.
//
// tegels.json draagt ook `anker`: het punt in een cel dat op het midden van de tegel hoort te
// liggen, in dezelfde vorm als beelden/beschrijving.json. Daarmee kan js/sprites.js de vellen
// tekenen zonder Tiled se tileoffset-rekenwerk na te doen. Voor grond is dat het midden van de
// ruit, voor een model zijn voetpunt, en voor een gebouw de achterste voethoek — die ligt een
// halve tegel hoger dan het midden van zijn tegel, vandaar de +16.

// Welke vellen maken we deze keer? Zonder argumenten allemaal; met `node naar-tiled.cjs erf` alleen
// dat vel, en dan blijft de rest van tegels.json staan. Dat scheelt minuten als er maar aan één
// ding gewerkt wordt.
const GEVRAAGD = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const wil = (naam) => !GEVRAAGD.length || GEVRAAGD.includes(naam);

const velden = [
  wil('grond') && bouwGrondVel(),
  // rand komt uit randtegels.cjs; hier wordt alleen zijn .tsx ingelezen (zie hierboven).
  wil('rand') && leesVelUitTsx('rand'),
  wil('bomen') && bouwModelVel('bomen', BOMEN, BOMEN_VAST),
  wil('begroeiing') && bouwModelVel('begroeiing', BEGROEIING, (n) => !!BEGROEIING_VAST[n]),
  wil('gebouwen') && bouwGebouwenVel(),
  wil('toren') && bouwErfVel('toren', Es.TOREN_TEGELS, 'De toren van de oude meester, zoals je hem erft. Zijn voet beslaat 3×3 tegels; zet hem neer op de tegel linksboven daarvan.'),
  wil('erf') && bouwErfVel('erf', Es.ERF_TEGELS, 'Wat er op het erf van de toren staat: het schuurtje, de put, de houtstapel, de waslijn, de moestuin, de bank en de lantaarn. Zet ze neer op de tegel linksboven van hun voet ("beslaat"); kaarten/erf.tmj doet dat al vanzelf uit erf-scene.cjs.'),
].filter(Boolean);

// Het bestaande tegels.json blijft staan voor de vellen die deze keer niet aan de beurt waren.
let TEGELS_JSON = {};
try {
  TEGELS_JSON = JSON.parse(fs.readFileSync(path.join(TEGELS, 'tegels.json'), 'utf8'));
} catch (e) {
  /* nog niets: dan bouwen we hem van voren af aan op */
}
for (const v of velden) {
  // Een gebouw hangt aan zijn achterste voethoek; die ligt een halve tegel (16 px) boven het
  // midden van zijn tegel, en het spel tekent op het midden.
  const anker = v.anker || (v.tileoffset
    ? [Math.round(v.tegelB / 2) - v.tileoffset[0], v.tegelH - v.tileoffset[1] + (v.naam === 'gebouwen' ? 16 : 0)]
    : [Math.round(v.tegelB / 2), Math.round(v.tegelH / 2)]);
  TEGELS_JSON[v.naam] = {
    tsx: `tegels/${v.naam}.tsx`,
    bestand: `tegels/${v.bestand}`,
    breedte: v.breedte,
    hoogte: v.hoogte,
    tegelB: v.tegelB,
    tegelH: v.tegelH,
    kolommen: v.kolommen || v.aantal,
    tileoffset: v.tileoffset,
    objectalignment: v.objectalignment,
    anker,
    // per lokaal tegel-id (0, 1, 2, …, zoals in de .tsx) dezelfde eigenschappen als daar.
    tiles: v.tiles.map((t) => ({ naam: t.naam, vast: t.vast, beslaat: t.beslaat || null, groep: t.groep || null, staat: t.staat || null, doos: t.doos || null })),
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
console.log(`tegels/ klaar: ${velden.length} vel(len) opnieuw, ${Math.round(totaal / 1024)} kB`);
