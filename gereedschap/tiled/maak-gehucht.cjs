// Bouwt kaarten/gehucht.tmj en kaarten/gehucht.betekenis.json: het eerste proefje uit
// ontwerp/spel.md, "Het eerste proefje: een dorp met akkers, en de sfeer" (Marcel, 23 sep 2026:
// "maak maar een klein dorpje", "simpel houden", "de sfeer is belangrijk"). Zie
// ontwerp/werklijst.md, punt 1b.
//
// Tweede versie (Marcel, 23 sep 2026, bij het bekijken van de eerste): "nieuwe kale map
// gebruiken met een dorpje en akkers". Drie dingen anders dan de eerste versie:
// - een kale, open kaart: vooral gras, weinig rommel, een klein dorpje in het midden;
// - de akkers niet meer als vijf losse, verspreide stroken tegen de rand van de kaart aan, maar
//   als één grote es naast het dorp — lange smalle stroken naast elkaar, één blok, goed te zien
//   als open land — plus een paar kleinere akkers erbij. **Nergens raakt een akker de rand van de
//   kaart of de bosrand**: rondom blijft een marge gras en losse bomen over.
// - alleen groene bomen (zie BOSBOMEN hieronder): geen herfstEik in een kaart waar de kalender
//   lente zegt (ontwerp/werklijst.md).
//
// Derde versie (Marcel, 26 sep 2026, toen de mensen poppetjes werden: "We hebben meer afwisseling
// nodig in de huizen en hutten. Ze staan ook te dicht op elkaar"; en al op 25 sep: een plein met het
// huis van de schout eraan). 60 bij 60 in plaats van 50 bij 50, een plein vóór het huis van de
// schout, vijf boerderijtekeningen drie tot vijf tegels uit elkaar, en de es vóór het plein. De regel
// erachter: een dak dekt in ons beeld tot zo'n acht tegels erachter af, dus wat je wilt zien (het
// plein, de erven, de weg) ligt aan de kant van de camera, vóór de huizen. Akkers, weide en heide
// bleven even groot.
//
// Naar het voorbeeld van maak-wereld.cjs (de grond via de terreinsets van tegels/rand.tsx, de
// tegelnummers op naam opgezocht in plaats van hard gecodeerd), maar zelfstandig: dit gehucht
// hangt nog aan geen enkele andere kaart vast.
//
//   node gereedschap/tiled/maak-gehucht.cjs [--overschrijf]
//
// Wat erin komt (derde versie, 26 sep): vijf boerderijen (riet) rond een plein met een put, een
// grote eik en het iets betere stenen huis van de schout, een zandweg die het gehucht in en uit loopt, een beek
// met een bruggetje en wilgen op de oevers, een bosrand aan de noordkant, wat tuintjes, en de
// akkers als één es met vijf lange stroken plus twee kleinere stukken — zolang er nog geen
// graantegels zijn (een andere agent maakt die in gereedschap/pixelart/graan*.cjs) is een akker
// gewoon zandpad-grond. Welke akker van welk huis is, staat in het betekenisbestand, niet in de
// .tmj: zie ontwerp/kaarten.md, "Tiled tekent alleen nog de grond".
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

// ==================================================================================================
// DE MAAT EN DE ZONES
// ==================================================================================================
const B = 60;
const H = 60;
const BOS_DIEP = 7; // y < BOS_DIEP: de bosrand aan de noordkant
const BOSDICHT = [0.85, 0.7, 0.55, 0.4, 0.28, 0.16, 0.08]; // per rij, dunner naar het gehucht toe
const BEEK_X0 = 5;
const BEEK_X1 = 7; // de beek, drie tegels breed, ruim ten westen van het dorp
const WEG_Y = 32; // de zandweg, oost-west, langs het plein, het gehucht in en uit

// De es: één blok naast het dorp (ten zuidoosten), lange smalle stroken naast elkaar — "zo lagen
// middeleeuwse akkers" (ontwerp/wereld.md) — met daaronder nog twee kleinere stukken. x, y is de
// linkerbovenhoek (net als een gebouw), b/h de maat in tegels: b (breed, 2-3) staat dwars op de
// stroken, h (lang, hier 14) is hun lengte. Rondom blijft ruim marge gras over tot de rand van de
// kaart (B-1 hier is 59, de verste strook eindigt op 46, de onderste rij velden op 54).
//
// Sinds 26 sep (derde versie, Marcel: "Ze staan ook te dicht op elkaar") ligt de es vóór het plein,
// aan de kant van de camera: akkers zijn plat, dus ze dekken het plein niet af. Maten en onderlinge
// ligging zijn dezelfde als in de tweede versie, alleen twaalf rijen lager, zodat de oogst gelijk
// blijft en de twee blokken onder de es nog altijd samen één weide kunnen zijn.
const AKKERS = [
  { akker: 'akker1', x: 36, y: 34, b: 2, h: 14, huis: 'boer1' },
  { akker: 'akker2', x: 38, y: 34, b: 2, h: 14, huis: 'boer2' },
  { akker: 'akker3', x: 40, y: 34, b: 3, h: 14, huis: 'boer3' },
  { akker: 'akker4', x: 43, y: 34, b: 2, h: 14, huis: 'boer4' },
  { akker: 'akker5', x: 45, y: 34, b: 2, h: 14, huis: 'boer5' },
  // de twee kleinere stukken, onder de es, van dezelfde twee boeren; het blok van Klaas (boer1)
  // begint als weide, met de beginkudde erop (ontwerp/spel.md, "Weides met koeien en schapen")
  { akker: 'akker6', x: 36, y: 49, b: 5, h: 6, huis: 'boer1', bestemming: 'weide' },
  { akker: 'akker7', x: 42, y: 49, b: 5, h: 5, huis: 'boer3' },
];
function inAkker(x, y) {
  return AKKERS.some((a) => x >= a.x && x < a.x + a.b && y >= a.y && y < a.y + a.h);
}

// De meent: de heide in het zuidwesten, tussen het gehucht en de beek, waar de schapen van het dorp
// samen grazen (Marcel koos het op 25 sep, uit een voorstel van Claude: de akkers op de es, de
// weide, de schapen op de heide; ontwerp/spel.md, "Marcel koos voor stap 2"). De schaapskooi staat
// aan de noordrand ervan, naast de boerderij van boer 5, met zijn voorkant naar de heide: zo staan
// de schapen vóór de kooi en niet erachter (eerst stond hij aan de oostrand, en dan graasde de
// halve kudde achter zijn dak). De onderste drie rijen van de kaart blijven gras: daar valt het bos
// om de kaart heen overheen. De meent is voor het spel een rechthoek (js/kaart.js, "meent"); de
// grond erop is heide.
const MEENT = { meent: 'heide', x: 9, y: 45, b: 23, h: 8 };
const KOOI = { tegel: 'schuurBlokhut', x: 26, y: 37, b: 5, d: 7 };

// Het plein (Marcel, 25 sep: "Dorpen worden vaak rond een plein gebouwd waar ook het huis van de
// schout staat. Daar de schandpaal of blok zetten."): kale zandgrond, met de put, en daarop staan
// de marskramer, de heer op Sint-Maarten en de schandpaal. Het ligt vóór het huis van de schout, aan
// de kant van de camera, en er staat niets hoogs vóór: een dak dekt in ons beeld tot zo'n acht
// tegels erachter af (ontwerp/beeld.md, "Doorkijk"), en tot 26 sep lag het plein achter twee daken.
const PLEIN = { x: 26, y: 24, b: 10, h: 8 };
const inPlein = (x, y) => x >= PLEIN.x && x < PLEIN.x + PLEIN.b && y >= PLEIN.y && y < PLEIN.y + PLEIN.h;
const PLEIN_MIDDEN = { x: PLEIN.x + 5, y: PLEIN.y + 4 };

// De weg: een rechte lijn dwars over de kaart (dezelfde "afstand tot lijn"-truc als
// maak-wereld.cjs en erf-kaart.cjs).
function totLijn(punten) {
  return (x, y) => {
    let d = 1e9;
    for (let i = 0; i + 1 < punten.length; i++) {
      const [ax, ay] = punten[i];
      const [bx, by] = punten[i + 1];
      const vx = bx - ax;
      const vy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
      d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t));
    }
    return d;
  };
}
const dWeg = totLijn([[0, WEG_Y], [B - 1, WEG_Y]]);
const opWeg = (x, y) => dWeg(x, y) < 0.62;

// Eén grondsoort per roosterpunt: water wint van de weg (een brug ligt er overheen, apart
// neergezet), de weg en een akker zijn allebei kale zandgrond (dezelfde terreinset), de rest is
// gras. Zo kruist de weg een akker vanzelf goed (ontwerp: "zijn de akkers kale grond").
// De heide op de meent (MEENT hierboven): op de buitenste rij hoekpunten beslist het lot of het nog
// heide is, zodat hij niet als een liniaal ophoudt. De schapen grazen op de rechthoek zelf.
function opHeide(x, y) {
  const x0 = MEENT.x;
  const x1 = MEENT.x + MEENT.b;
  const y0 = MEENT.y;
  const y1 = MEENT.y + MEENT.h;
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const rand = x === x0 || x === x1 || y === y0 || y === y1;
  return !rand || hash(x, y, 91) < 0.5;
}

function soortOp(x, y) {
  if (x >= BEEK_X0 && x <= BEEK_X1) return 'water';
  // Vlak naast de beek nooit zandpad: er bestaat geen terreinset "zandpad over water", en het
  // bruggetje (hieronder, apart neergezet) tekent de oversteek toch al zelf.
  if (opWeg(x, y) && (x < BEEK_X0 - 1 || x > BEEK_X1 + 1)) return 'zandpad';
  if (inAkker(x, y) && (x < BEEK_X0 - 1 || x > BEEK_X1 + 1)) return 'zandpad';
  if (inPlein(x, y)) return 'zandpad';
  if (opHeide(x, y)) return 'heide';
  return 'gras';
}

// ==================================================================================================
// DE GRONDLAAG
// ==================================================================================================
const grondLaag = new Array(B * H).fill(0);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < B; x++) grondLaag[y * B + x] = terreinGid(soortOp, x, y, 63);
}
// Het bruggetje waar de weg de beek kruist: drie tegels naast elkaar (begin, midden, eind — de
// beek is drie tegels breed), dwars over de weg heen (oost-west, dus de "x"-brug).
grondLaag[WEG_Y * B + BEEK_X0] = firstgid.rand + BRUG['x-begin'];
grondLaag[WEG_Y * B + (BEEK_X0 + 1)] = firstgid.rand + BRUG['x-midden'];
grondLaag[WEG_Y * B + BEEK_X1] = firstgid.rand + BRUG['x-eind'];

// ==================================================================================================
// DE OBJECTEN
// ==================================================================================================
const objecten = [];
const bezet = new Set();
let volgendId = 1;
const sleutel = (x, y) => x + ',' + y;

function zetTegel(naam, mx, my) {
  const g = gidVan(naam);
  if (!g) {
    console.warn(`  overgeslagen: geen tegel "${naam}" in tegels/ — draai npm run tiled`);
    return false;
  }
  const [vb, vd] = g.tegel.beslaat || [1, 1];
  for (let dy = 0; dy < vd; dy++) {
    for (let dx = 0; dx < vb; dx++) {
      const mxx = mx + dx;
      const myy = my + dy;
      if (mxx < 0 || myy < 0 || mxx >= B || myy >= H) {
        console.warn(`  "${naam}" op (${mx},${my}) valt buiten de kaart`);
        return false;
      }
      if (bezet.has(sleutel(mxx, myy))) {
        console.warn(`  "${naam}" op (${mx},${my}) botst op (${mxx},${myy})`);
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

// ---- de vijf boerderijen (riet) en het stenen huis van de schout ----
// Sinds 26 sep (Marcel: "We hebben meer afwisseling nodig in de huizen en hutten. Ze staan ook te
// dicht op elkaar"): vijf tekeningen van een echte boerderij, groter dan een gewoon huis, zodat je ze
// ook niet verwart met wat je zelf bouwt; drie tot vijf tegels uit elkaar, elk met zijn voorkant (de
// deur, midden aan de zuidkant) naar de camera, zodat het erf in zicht ligt. Het huis van de schout
// staat aan de noordkant van het plein, met zijn deur erop.
const HUIZEN = {
  boer1: { tegel: 'dorpGroot1', x: 14, y: 11, b: 7, d: 9, zaad: 21 },
  boer2: { tegel: 'dorpGewoonVleugel', x: 34, y: 8, b: 9, d: 8, zaad: 22 },
  boer3: { tegel: 'dorpGewoonAanbouw', x: 45, y: 14, b: 6, d: 9, zaad: 23 },
  boer4: { tegel: 'dorpGewoon4', x: 10, y: 24, b: 6, d: 8, zaad: 24 },
  boer5: { tegel: 'schuur', x: 17, y: 35, b: 6, d: 9, zaad: 25 },
};
const SCHOUT_HUIS = { tegel: 'stenenHuis', x: 26, y: 15, b: 6, d: 8 };

for (const [id, h] of Object.entries(HUIZEN)) zetTegel(h.tegel, h.x, h.y);
zetTegel(SCHOUT_HUIS.tegel, SCHOUT_HUIS.x, SCHOUT_HUIS.y);
// De schaapskooi aan de rand van de heide (MEENT hierboven): het gehucht begint met één, en dus met
// de schapen op de heide in plaats van op de weide. Voorlopig in de tekening van de blokhutschuur,
// net als in het bouwmenu (js/gebouwen.js, T.GEBOUWEN.schaapskooi).
zetTegel(KOOI.tegel, KOOI.x, KOOI.y);

// ---- het plein: de put erop, achteraan (aan de kant van het huis van de schout, zodat hij niets
// afdekt), en een grote eik met een bankje ernaast, aan de westkant ----
zetTegel('put', PLEIN.x + 1, PLEIN.y + 1);
zetTegel('eik', PLEIN.x - 2, PLEIN.y + 2);
zetTegel('bank', PLEIN.x - 1, PLEIN.y + 3);

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
    if (soortOp(x, y) === 'water' || inAkker(x, y)) continue;
    if (bezet.has(sleutel(x, y))) continue;
    if (hash(x, y, 17) > kans) continue;
    zetTegel(BOSBOMEN[Math.floor(hash(x + 5, y + 9, 18) * BOSBOMEN.length)], x, y);
  }
}

// ---- wilgen (geknot) op de oevers van de beek, met een gat bij het bruggetje ----
for (let y = BOS_DIEP; y < H; y++) {
  if (Math.abs(y - WEG_Y) <= 1) continue; // niet vlak bij het bruggetje
  if (hash(y, 31, 19) < 0.45) zetTegel('wilg', BEEK_X0 - 1, y);
  if (hash(y, 37, 20) < 0.45) zetTegel('wilg', BEEK_X1 + 1, y);
}

// ---- tuintjes: een paar losse stukken bij elk huis (kaarten.md: "los rond een huis"), en bij
// de schout een klein stukje hek met een hekje erin voor zijn huis, naast de deur, in plankenstijl
// (iets beter dan het vlechtwerk van de boeren).
const TUIN_LOS = ['kruidenbed', 'kool', 'prei', 'bonen', 'regenton'];
let tuinZaad = 51;
for (const [id, h] of Object.entries(HUIZEN)) {
  // Eén tegel net onder de voorkant van het huis, en één ernaast; alleen zetten als de tegel nog
  // vrij is (bij een paar huizen ligt de akker of het bruggetje daar al zo dichtbij dat er geen
  // ruimte over is, en dan slaan we het gewoon over).
  const stuk1 = TUIN_LOS[Math.floor(hash(h.x, h.y, 22) * TUIN_LOS.length)];
  const stuk2 = TUIN_LOS[Math.floor(hash(h.x + 3, h.y + 1, 23) * TUIN_LOS.length)];
  zetTegel(stuk1, h.x - 1, h.y + h.d - 1);
  zetTegel(stuk2, h.x + h.b, h.y + 1);
}
// het hekje van de schout: drie stukken plankenhek met een opening in het midden, op de rij voor
// zijn huis, links van zijn deur (die blijft vrij: x + b/2).
{
  const y = SCHOUT_HUIS.y + SCHOUT_HUIS.d;
  const x0 = SCHOUT_HUIS.x;
  zetTegel('hek-lat-x', x0, y);
  zetTegel('hekje-lat-x', x0 + 1, y);
  zetTegel('hek-lat-x', x0 + 2, y);
  zetTegel('regenton', SCHOUT_HUIS.x - 1, SCHOUT_HUIS.y + SCHOUT_HUIS.d - 1);
}

// ---------------------------------------------------------------- nakijken vóór we schrijven
const fouten = [];
{
  const vrij = (x, y) => x >= 0 && y >= 0 && x < B && y < H && !!grondLaag[y * B + x];
  if (!vrij(B - 1, WEG_Y)) fouten.push('de tegel bij de uitgang (rechts) is niet begaanbaar');
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
// DE BETEKENIS: de schout, de vijf boeren, de akkers, en de enige uitgang
// ==================================================================================================
const dingen = [];
// De schout begint bij zijn eigen huis (js/gebied.js, T.beginOpKaart zet hem daarna in het vel
// van een gewone dorpeling, want de schout is geen tovenaar — zie ontwerp/werklijst.md).
dingen.push({ x: SCHOUT_HUIS.x + Math.floor(SCHOUT_HUIS.b / 2), y: SCHOUT_HUIS.y + SCHOUT_HUIS.d, wezen: 'schout' });
// De vijf boeren, elk bij zijn eigen huis, dwalend (T.laatDwalen, js/verkennen.js) en in het
// groeiseizoen op en rond hun eigen akker (T.wandelAnker, js/akkers.js). "wie" is hier gelijk aan
// "huis" (T.MENSEN.boer1..boer5, js/mensen.js, lenen om en om het boer/boerin-vel): vijf eigen
// ingangen, want T.keurKaart (gereedschap/keuring.js) staat niet toe dat dezelfde mens twee keer
// op de kaart staat, en "huis" koppelt hem aan zijn akker(s) hierboven (js/kaart.js).
for (const [id, h] of Object.entries(HUIZEN)) {
  dingen.push({ x: h.x + Math.floor(h.b / 2), y: h.y + h.d, wie: id, straal: 3, huis: id });
}
// De huizen zelf, als gebouw (js/gebouwen.js, T.zetBestaandeGebouwen): hun tekening staat al op
// de kaart (hierboven, zetTegel), dit is alleen de betekenis erbij, zodat het dorp niet leeg
// begint (ontwerp/werklijst.md, punt 2). De vijf boerenhuizen tellen als "boerderij", het stenen
// huis van de schout als "huis". "huis" zegt wie er woont, net als bij een akker: de boer met
// dezelfde id, of de schout. Dat telt voor zijn kelder (js/verstoppen.js).
for (const [id, h] of Object.entries(HUIZEN)) dingen.push({ gebouw: 'boerderij', x: h.x, y: h.y, b: h.b, h: h.d, huis: id });
dingen.push({ gebouw: 'huis', x: SCHOUT_HUIS.x, y: SCHOUT_HUIS.y, b: SCHOUT_HUIS.b, h: SCHOUT_HUIS.d, huis: 'schout' });
dingen.push({ gebouw: 'schaapskooi', x: KOOI.x, y: KOOI.y, b: KOOI.b, h: KOOI.d });
// De akkers: wie ze niet nodig heeft (js/tekenen.js tekent nu alleen de kale zandgrond), leest
// ze straks voor het graan (js/kaart.js, "WAT EEN DING BETEKENT").
for (const a of AKKERS) dingen.push(a);
// De meent: de heide, waar de schapen grazen (js/vee.js, "Waar een dier graast").
dingen.push(MEENT);
// De enige uitgang: het gehucht hangt nog aan geen andere kaart vast (ontwerp/werklijst.md,
// "Wacht op Marcel"). Zonder "komt" kiest het spel zelf een tegel (js/kaart.js); "proef": true
// hieronder laat de keuring met rust dat "wereld" niet terugwijst (gereedschap/keuring.js,
// T.keurDekking: "een aansluiting heeft twee kanten" — dat geldt pas zodra dit gehucht echt op
// de kaart van de wereld komt te liggen).
dingen.push({ x: B - 1, y: WEG_Y, overgang: 'wereld', tekst: 'De weg de wereld in' });

const betekenis = {
  versie: 1,
  proef: true,
  uitleg: 'De betekenis van kaarten/gehucht.tmj: de schout, de vijf boeren en hun akkers. Zie ontwerp/kaarten.md, "Tiled tekent alleen nog de grond". "proef": true omdat dit gehucht nog aan geen andere kaart vasthangt (ontwerp/werklijst.md); zodra er een echte aansluiting naar "wereld" komt, mag dat weer weg.',
  // Een klein beginvoorraadje, zodat er meteen iets te bouwen valt (js/gebouwen.js, T.plaatsGebouw
  // via het bouwmenu) zonder eerst te hoeven wachten op de eerste opbrengst. Het hooi is wat er van
  // vorige winter over is: het spel begint op 1 lentemaand, en dan eet het vee nog een maand hooi
  // (js/vee.js, T.voerHooi): drie koeien, dertig dagen.
  beginVoorraad: { hout: 40, goud: 20, graan: 60, hooi: 100 },
  // Waar de marskramer zijn waar uitstalt (js/handel.js): midden op het plein, waar ook de heer op
  // Sint-Maarten staat (js/heer.js). Hij komt over de weg binnen (de uitgang hieronder) en gaat daar
  // ook weer heen.
  marskramer: { x: PLEIN_MIDDEN.x, y: PLEIN_MIDDEN.y },
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
    const akkerTegels = AKKERS.reduce((n, a) => n + a.b * a.h, 0);
    console.log(`gehucht.tmj klaar: ${B}×${H} tegels, ${objecten.length} objecten, akkers ${akkerTegels}/${B * H} (${Math.round((100 * akkerTegels) / (B * H))}%)`);
    require('../pixelart/naar-kaarten.cjs');
  }
}

module.exports = { B, H, AKKERS, HUIZEN, SCHOUT_HUIS, MEENT, KOOI, kaart, betekenis };
