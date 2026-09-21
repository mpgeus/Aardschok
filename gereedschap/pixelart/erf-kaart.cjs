// Maakt kaarten/erf.tmj: het erf van de toren als speelbare kaart, uit de plaatsing die al in
// erf-scene.cjs staat. Niemand hoeft het erf dus met de hand in Tiled na te tekenen, en het blijft
// kloppen zodra daar iets verschuift.
//
//   node gereedschap/pixelart/erf-kaart.cjs      (of: npm run kaart:erf)
//
// De keten (zie ontwerp/wereld.md § "De kaarten tekenen we in een editor"):
//   erf-scene.cjs (de plaat)  ──> npm run tiled  ──> tegels/*.png + *.tsx + tegels.js
//        │ dezelfde plaatsing
//        └───────────────────> dit script       ──> kaarten/erf.tmj ──> npm run kaarten
//                                                                        ──> kaarten/kaarten.js
//   T.laadKaart(T.KAARTEN.erf) maakt er een wereld van, zoals T.maakWereld() dat voor de toren doet.
//
// Wat er op de kaart komt:
//  - een grondlaag van gras, met de twee paden als zandpad erdoorheen. De grond gaat per stempel
//    van vier bij vier tegels uit hetzelfde ruisveld (zie naar-tiled.cjs), zodat er geen zichtbaar
//    raster ontstaat: tegel (x, y) pakt vakje (x mod 4, y mod 4) van de stempel, dus de ruis loopt
//    binnen elk blok van vier gewoon door.
//  - de toren, het schuurtje, de put, de houtstapel, de waslijn, de moestuin, de bank en de
//    lantaarn, elk op de tegels die erf-scene.cjs ervoor opgeeft (ERF_TEGELS).
//  - elke boom, struik en graspol uit dezelfde scène, plus een bosrand eromheen die het erf
//    afsluit: buiten die rand ligt geen grond, dus daar kun je niet komen.
//  - één wolf, de oude meester bij zijn moestuin, en de overgang bij de deur van de toren.
'use strict';
const fs = require('fs');
const path = require('path');
const Es = require('./erf-scene.cjs');

const WORTEL = path.join(__dirname, '..', '..');
const TEGELS = path.join(WORTEL, 'tegels');
const KAARTEN = path.join(WORTEL, 'kaarten');

const vellen = JSON.parse(fs.readFileSync(path.join(TEGELS, 'tegels.json'), 'utf8'));

// ---------------------------------------------------------------- de tegelvellen en hun gids

// De volgorde waarin de vellen in de .tmj staan; elk vel krijgt zijn eigen blok gids. js/kaart.js
// zoekt een gid op binnen firstgid .. firstgid + aantal − 1, dus zolang deze lijst en de lengtes
// kloppen, klopt de kaart ook als een vel er later een tegel bij krijgt (dan opnieuw draaien).
const VOLGORDE = ['grond', 'bomen', 'begroeiing', 'gebouwen', 'toren', 'erf'];
const gebruikt = VOLGORDE.filter((n) => vellen[n]);
const firstgid = {};
{
  let g = 1;
  for (const naam of gebruikt) {
    firstgid[naam] = g;
    g += vellen[naam].tiles.length;
  }
}

// In welk vel zit een tegel met deze naam, en welke gid heeft hij?
const velVan = new Map();
for (const naam of gebruikt) {
  vellen[naam].tiles.forEach((t, i) => {
    if (!velVan.has(t.naam)) velVan.set(t.naam, { vel: naam, id: i, tegel: t });
  });
}
function gidVan(naam) {
  const v = velVan.get(naam);
  if (!v) return null;
  return { gid: firstgid[v.vel] + v.id, vel: vellen[v.vel], tegel: v.tegel };
}

// De stempel van een grondsoort: de zestien tegels van vier bij vier, op volgorde (rij na rij).
function stempelVan(soort) {
  const ids = [];
  vellen.grond.tiles.forEach((t, i) => {
    if (t.naam === soort && t.groep === 'stempel') ids.push(firstgid.grond + i);
  });
  if (!ids.length) throw new Error(`geen stempel voor grondsoort "${soort}"`);
  return ids;
}
const STEMPEL_MAAT = 4; // moet gelijk zijn aan STEMPEL in naar-tiled.cjs
const GRAS = stempelVan('gras');
const ZANDPAD = stempelVan('zandpad');
const stempel = (ids, x, y) => ids[(((y % STEMPEL_MAAT) + STEMPEL_MAAT) % STEMPEL_MAAT) * STEMPEL_MAAT + (((x % STEMPEL_MAAT) + STEMPEL_MAAT) % STEMPEL_MAAT)];

// ---------------------------------------------------------------- de maat van de kaart

// Het erf zelf is de open plek uit erf-scene.cjs (VELD), en daar komt een bosrand van BAND tegels
// omheen: die staat vol bomen, dus daar loop je niet. Zo is het erf zo'n dertig bij twintig tegels
// vrij lopen — ruim drie keer de hal.
//
// Waarom die rand vijf tegels diep is: op een scherm van 1920×1080 kijk je op de hoek van het
// beeld zestien tegels ver, dus je ziet altijd voorbij de rand van de kaart. Dat ondervangen we
// niet met nóg meer bomen (die kosten tekentijd) maar met een doffe rand: js/tekenen.js laat de
// buitenste tegels naar het donker toe wegdoven, zoals nevel() in erf-scene.cjs dat op de plaat
// doet. Vandaar ook dat de buitenste twee ringen leeg blijven: daar is het toch al zwart.
// BAND: hoeveel ringen bos er om het erf heen liggen. Op een scherm van 1920×1080 kijk je op de
// hoek van het beeld zestien tegels ver, dus een speler kijkt altijd voorbij de rand van de kaart.
// Daarom ligt er een brede band bos omheen die naar buiten toe wegdooft in het donker (js/tekenen.js
// leest `doof` van de kaart). Alleen de binnenste ringen krijgen bomen: verderop is het toch al
// bijna zwart, en een boom die je niet ziet kost alleen tekentijd. Op MUUR ligt het bos dicht, en
// daar kom je dus niet langs.
const BAND = 10;
const MUUR = 6; // op deze diepte vanaf de rand staat het bos gesloten
// per diepte vanaf de rand van de kaart: hoeveel kans op een boom
const BOSDICHT = { 6: 1, 7: 0.6, 8: 0.4, 9: 0.25 };
// En het erf zelf is ruimer dan de plaat: de toren wordt om zijn eigen hal heen gebouwd (elf à
// twaalf tegels doorsnede, zie ontwerp/wereld.md), en dan blijft er van de open plek uit de plaat
// te weinig grond over om omheen te lopen en te vechten. De bomen die om de open plek heen staan,
// schuiven mee naar buiten (zie `ruimer` hieronder), zodat de compositie dezelfde blijft.
const RUIM = 7;
const MIDX = (Es.VELD.x0 + Es.VELD.x1) / 2;
const MIDY = (Es.VELD.y0 + Es.VELD.y1) / 2;
const HALFX = (Es.VELD.x1 - Es.VELD.x0) / 2;
const HALFY = (Es.VELD.y1 - Es.VELD.y0) / 2;
const ruimer = (gx, gy) => [MIDX + (gx - MIDX) * ((HALFX + RUIM) / HALFX), MIDY + (gy - MIDY) * ((HALFY + RUIM) / HALFY)];

const X0 = Math.floor(Es.VELD.x0) - RUIM - BAND;
const X1 = Math.ceil(Es.VELD.x1) + RUIM + BAND;
const Y0 = Math.floor(Es.VELD.y0) - RUIM - BAND;
const Y1 = Math.ceil(Es.VELD.y1) + RUIM + BAND;
const B = X1 - X0 + 1;
const H = Y1 - Y0 + 1;
const OX = -X0;
const OY = -Y0;
const naarKaart = (wx, wy) => [Math.round(wx) + OX, Math.round(wy) + OY];
const opKaart = (mx, my) => mx >= 0 && my >= 0 && mx < B && my < H;
// hoe diep ligt deze tegel in de bosrand? 0 = de buitenste ring, BAND−1 = de binnenste
const randDiepte = (mx, my) => Math.min(mx, my, B - 1 - mx, H - 1 - my);

// ---------------------------------------------------------------- de paden

// afstand (in tegels) van een punt tot een gebroken lijn — dezelfde som als totLijn() in
// erf-scene.cjs, waar de paden vandaan komen.
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
// De paden lopen in de plaat tot de rand van de open plek; op de kaart ligt daar nog een brede
// band bos omheen, dus trekken we de laatste richting door tot ze het bos in verdwijnen. Daar
// blijft dan ook een gat in de bosmuur: zo zie je waar het straks doorloopt naar het dorp en het
// bos, in plaats van een pad dat midden op het gras ophoudt.
function doorgetrokken(punten) {
  const uit = punten.map(([x, y]) => ruimer(x, y));
  const [ax, ay] = uit[uit.length - 2];
  const [bx, by] = uit[uit.length - 1];
  const lang = Math.hypot(bx - ax, by - ay) || 1;
  uit.push([bx + ((bx - ax) / lang) * 40, by + ((by - ay) / lang) * 40]);
  return uit;
}
const dDorp = totLijn(doorgetrokken(Es.PAD_DORP));
const dBos = totLijn(doorgetrokken(Es.PAD_BOS));
// Het dorpspad is een kar breed, het bospaadje niet meer dan een spoor. Waar een pad de bosrand
// uitloopt blijft het open: daar gaat het straks naar het dorp en het bos, en nu zie je alvast
// waar het heen wil.
const opPad = (wx, wy) => dDorp(wx, wy) < 0.62 || dBos(wx, wy) < 0.42;
const bijPad = (wx, wy) => dDorp(wx, wy) < 1.1 || dBos(wx, wy) < 0.9;

// ---------------------------------------------------------------- de grondlaag

// Er ligt overal grond, tot aan de rand van de kaart toe: het spel tekent die naar buiten toe
// steeds donkerder, en bij de rand is hij niet meer van de achtergrond te onderscheiden. Zo houdt
// de wereld nergens op met een zichtbare lijn.
const grondLaag = new Array(B * H).fill(0);
for (let my = 0; my < H; my++) {
  for (let mx = 0; mx < B; mx++) {
    const wx = mx - OX;
    const wy = my - OY;
    grondLaag[my * B + mx] = stempel(opPad(wx, wy) ? ZANDPAD : GRAS, mx, my);
  }
}

// ---------------------------------------------------------------- de objecten

const objecten = [];
// `bezet`: hier komt niets (meer) te staan — dat is ook zo voor de tegels die we vrijhouden voor
// de deur. `dicht`: hier stáát iets waar je niet doorheen komt. Die twee zijn niet hetzelfde, en
// alleen de tweede zegt iets over lopen.
const bezet = new Set();
const dicht = new Set();
const sleutel = (mx, my) => mx + ',' + my;
let volgendId = 1;

function zetTegel(naam, mx, my) {
  const g = gidVan(naam);
  if (!g) {
    console.warn(`  overgeslagen: geen tegel "${naam}" in tegels/ — draai npm run tiled`);
    return false;
  }
  if (!opKaart(mx, my) || bezet.has(sleutel(mx, my))) return false;
  const [vb, vd] = g.tegel.beslaat || [1, 1];
  for (let dy = 0; dy < vd; dy++) {
    for (let dx = 0; dx < vb; dx++) {
      bezet.add(sleutel(mx + dx, my + dy));
      if (g.tegel.vast) dicht.add(sleutel(mx + dx, my + dy));
    }
  }
  objecten.push({
    id: volgendId++, visible: true, rotation: 0, name: naam, gid: g.gid,
    // Op een isometrische kaart is de (x, y) van een object gewoon de tegel maal de tegelhoogte,
    // voor x én y (Tiled, isometricrenderer.cpp) — niet de ruit-projectie. Zie js/kaart.js.
    x: mx * 32, y: my * 32, width: g.vel.tegelB, height: g.vel.tegelH, properties: [],
  });
  return true;
}

function zetPunt(naam, mx, my, eigenschappen) {
  objecten.push({
    id: volgendId++, visible: true, rotation: 0, name: naam, point: true,
    x: mx * 32, y: my * 32, width: 0, height: 0,
    properties: Object.entries(eigenschappen).map(([name, value]) => ({ name, type: 'string', value })),
  });
}

// 1. de toren en wat er op het erf staat. Wáár ze staan, draagt de tegel zelf: naar-tiled.cjs
// schrijft er `staat` bij ("x,y" in tegels vanaf de voet van de toren), uit dezelfde plaatsing als
// de plaat. Voor de toren is die voet opgemeten en niet opgeschreven, want hij is om zijn eigen
// hal heen gebouwd (zie ontwerp/wereld.md); dan klopt deze kaart vanzelf mee.
//
// Maar: de plaat is gezet toen de toren nog smal was, dus het schuurtje, de put en de houtstapel
// staan nu ín zijn voet. In plaats van die plekken hier over te schrijven (dan staan ze op twee
// plekken en lopen ze uit de pas), duwen we ze recht naar buiten tot ze de voet van de toren vrij
// hebben — over dezelfde lijn vanaf het midden, dus de compositie blijft staan. Wordt de toren
// weer anders, dan schuift alles vanzelf mee.
const torenTegel = velVan.get('toren');
const TOREN_VOET = (() => {
  if (!torenTegel || !torenTegel.tegel.staat) return [0, 0, 1, 1];
  const [x, y] = torenTegel.tegel.staat.split(',').map(Number);
  const [b, d] = torenTegel.tegel.beslaat || [1, 1];
  return [x, y, b, d];
})();
const RUIMTE_OM_TOREN = 1; // tegels tussen de toren en wat ernaast staat
function botst(x, y, b, d) {
  const [tx, ty, tb, td] = TOREN_VOET;
  return x < tx + tb + RUIMTE_OM_TOREN && x + b > tx - RUIMTE_OM_TOREN && y < ty + td + RUIMTE_OM_TOREN && y + d > ty - RUIMTE_OM_TOREN;
}
function weggeduwd(x, y, b, d) {
  const mx = TOREN_VOET[0] + (TOREN_VOET[2] - 1) / 2;
  const my = TOREN_VOET[1] + (TOREN_VOET[3] - 1) / 2;
  const cx = x + (b - 1) / 2 - mx;
  const cy = y + (d - 1) / 2 - my;
  const lang = Math.hypot(cx, cy) || 1;
  // ook langs wat er al staat heen: twee dingen die dezelfde kant op geduwd worden, komen anders
  // op elkaar terecht (de bank boven op de houtstapel)
  const vrij = (nx, ny) => {
    for (let dy = 0; dy < d; dy++) {
      for (let dx = 0; dx < b; dx++) {
        const [kx, ky] = naarKaart(nx + dx, ny + dy);
        if (!opKaart(kx, ky) || bezet.has(sleutel(kx, ky))) return false;
      }
    }
    return true;
  };
  for (let t = 0; t < 40; t += 0.5) {
    const nx = Math.round(x + (cx / lang) * t);
    const ny = Math.round(y + (cy / lang) * t);
    if (!botst(nx, ny, b, d) && vrij(nx, ny)) return [nx, ny];
  }
  return [x, y];
}

// Waar elk ding uiteindelijk staat (in wereldtegels, ná het eventuele opschuiven rond de toren):
// zo kan sectie 4b de meester naast zijn moestuin zetten zonder haar plek een tweede keer uit te
// rekenen — dat zou op den duur uit de pas gaan lopen met wat hier werkelijk neergezet is.
const geplaatstOp = new Map();
for (const d of [...Es.TOREN_TEGELS, ...Es.ERF_TEGELS]) {
  const v = velVan.get(d.naam);
  if (!v || !v.tegel.staat) {
    console.warn(`  overgeslagen: ${d.naam} staat niet in tegels/ — draai npm run tiled`);
    continue;
  }
  let [wx, wy] = v.tegel.staat.split(',').map(Number);
  const [vb, vd] = v.tegel.beslaat || [1, 1];
  if (d.naam !== 'toren' && botst(wx, wy, vb, vd)) {
    const [nx, ny] = weggeduwd(wx, wy, vb, vd);
    if (nx !== wx || ny !== wy) console.log(`  ${d.naam} stond in de voet van de toren; opgeschoven van (${wx}, ${wy}) naar (${nx}, ${ny})`);
    wx = nx;
    wy = ny;
  }
  const [mx, my] = naarKaart(wx, wy);
  if (!zetTegel(d.naam, mx, my)) console.warn(`  ${d.naam} kon niet op (${mx}, ${my})`);
  else geplaatstOp.set(d.naam, [wx, wy, vb, vd]);
}

// 1b. de deur van de toren. Welke tegel dat is, hangt af van hoe dik de toren is, en die wordt om
// zijn eigen hal heen gebouwd — dus lopen we vanaf het midden van zijn voet de kant op waar de
// deur kijkt (Es.DEURKANT) tot we de voet uit zijn. Dáár sta je voor de deur, en de tegel daar
// weer achter is waar je landt als je naar buiten loopt.
function deurTegels() {
  const toren = velVan.get('toren');
  const [tx, ty] = toren.tegel.staat.split(',').map(Number);
  const [tb, td] = toren.tegel.beslaat;
  const mx0 = tx + (tb - 1) / 2;
  const my0 = ty + (td - 1) / 2;
  const lang = Math.hypot(Es.DEURKANT[0], Es.DEURKANT[1]);
  const ux = Es.DEURKANT[0] / lang;
  const uy = Es.DEURKANT[1] / lang;
  const inVoet = (x, y) => x >= tx && x < tx + tb && y >= ty && y < ty + td;
  let deur = null;
  for (let t = 0.5; t < 40 && !deur; t += 0.25) {
    const x = Math.round(mx0 + ux * t);
    const y = Math.round(my0 + uy * t);
    if (!inVoet(x, y)) deur = [x, y];
  }
  if (!deur) deur = [tx, ty + td];
  // één stap verder van de deur af, recht de kant op waar de deur kijkt
  const stap = Math.abs(uy) >= Math.abs(ux) ? [0, Math.sign(uy) || 1] : [Math.sign(ux) || 1, 0];
  return { deur, komt: [deur[0] + stap[0], deur[1] + stap[1]] };
}
const DEUR = deurTegels();

// vrijhouden: de tegel voor de deur, waar je landt, en wat eromheen ligt. Daar kom je naar buiten,
// en daar mag geen struik staan.
for (const [dx, dy] of [[0, 0], [0, 1], [-1, 0], [1, 0], [0, 2], [1, 1], [-1, 1], [1, 2], [-1, 2]]) {
  const [mx, my] = naarKaart(DEUR.deur[0] + dx, DEUR.deur[1] + dy);
  if (opKaart(mx, my)) bezet.add(sleutel(mx, my));
}

// 2. de bomen en struiken uit dezelfde scène. Alleen wat vast staat: op een tegel waar je kunt
// lopen hoort niets te staan. Een varen, een graspol of een bloemperk waar je dwars doorheen
// loopt, maakt het erf vol zonder dat het iets betekent — en het gras van de stempels heeft zijn
// plukjes en bloemen toch al ingebakken (zie grasPollen in naar-tiled.cjs). Wat er staat, staat
// dus in de weg, en dat is ook wat je tijdens een gevecht wilt weten.
//
// Wat op een tegel valt die al bezet is (of op een pad), laten we staan: in de plaat mogen twee
// dingen elkaar overlappen, op een raster niet.
let overgeslagen = 0;
for (const [naam, , gx0, gy0] of [...Es.BOMEN, ...Es.KLEIN, ...Es.RAND]) {
  const [gx, gy] = ruimer(gx0, gy0);
  const [mx, my] = naarKaart(gx, gy);
  const v = velVan.get(naam);
  if (!v) continue;
  if (!v.tegel.vast || opPad(mx - OX, my - OY)) {
    overgeslagen++;
    continue;
  }
  if (!zetTegel(naam, mx, my)) overgeslagen++;
}

// 3. de bosrand: op MUUR staat het bos gesloten (daar kom je niet langs) en naar het erf toe dunt
// het uit, zodat de rand rafelig is en geen heg. Verder naar buiten staat niets meer: daar is het
// al bijna zwart. Waar een pad de kaart verlaat blijft een gat: daar loopt het straks door naar
// het dorp en het bos.
const BOSBOMEN = ['den', 'eik', 'berk', 'herfstEik', 'den', 'dodeBoom'];
const hash = (x, y) => {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
for (let my = 0; my < H; my++) {
  for (let mx = 0; mx < B; mx++) {
    const diep = randDiepte(mx, my);
    if (diep >= BAND) continue;
    const wx = mx - OX;
    const wy = my - OY;
    // Langs een pad blijft het bos open, zodat je ziet waar het heen wil — maar niet in de ring
    // waar het bos sluit: daarachter ligt nog geen gebied, en een gat daar is een gat waar je in
    // het donker uit de wereld loopt. Het pad houdt dus op bij de bosrand, zoals een pad dat doet
    // waar nog niemand geweest is.
    if (diep !== MUUR && bijPad(wx, wy)) continue;
    const kans = BOSDICHT[diep] || 0;
    const h = hash(mx, my);
    if (h > kans) continue;
    zetTegel(BOSBOMEN[Math.floor(hash(mx + 7, my + 11) * BOSBOMEN.length)], mx, my);
  }
}

// 4. één wolf, ver genoeg van de deur van de toren dat je hem eerst ziet: buiten zie je ver, en
// wie sluipt ziet hem twee tegels eerder dan hij jou (T.SLUIP_ZICHT).
function vrijeTegel(wx, wy) {
  for (let r = 0; r < 6; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const [mx, my] = naarKaart(wx + dx, wy + dy);
        if (opKaart(mx, my) && !bezet.has(sleutel(mx, my)) && randDiepte(mx, my) >= BAND) return [mx, my];
      }
    }
  }
  return naarKaart(wx, wy);
}
// `straal`: hoe ver hij van die plek af scharrelt. Zonder straal zou hij binnen "zijn kamer"
// blijven, en dat is buiten de hele kaart — dan wandelt hij het erf af en vind je hem nooit meer.
zetPunt('wolf', ...vrijeTegel(-12, -12), { wezen: 'wolf', straal: '7' });

// 4b. de oude meester, vlak bij zijn moestuin (ontwerp/verhaal.md, "Hij doet zijn moestuin, tot
// hij sterft"): zijn thuis is de eerste vrije tegel naast de tuin — vrijeTegel begint zoeken op
// het midden van de tuin en slaat de tuin zelf vanzelf over, want die staat al in `bezet` — met
// een kleine straal, zodat hij er wat rondscharrelt in plaats van stil te staan.
const tuin = geplaatstOp.get('moestuin');
if (tuin) {
  const [tx, ty, tb, td] = tuin;
  zetPunt('meester', ...vrijeTegel(tx + (tb - 1) / 2, ty + (td - 1) / 2), { wezen: 'meester', straal: '2' });
} else {
  console.warn('  meester overgeslagen: de moestuin staat niet op de kaart');
}

// 5. de deur van de toren: hier ga je naar binnen, en hier kom je buiten te staan als je van
// binnen naar buiten loopt (zie js/gebied.js). "komt" is de tegel waar je landt, één stap van de
// deur af, zodat je niet meteen weer terugstapt.
{
  const [dx, dy] = naarKaart(DEUR.deur[0], DEUR.deur[1]);
  const [kx, ky] = naarKaart(DEUR.komt[0], DEUR.komt[1]);
  zetPunt('deur van de toren', dx, dy, { overgang: 'toren', komt: `${kx},${ky}` });
}

// 6. het bospaadje: waar het achter de toren het bos in verdwijnt (zie het opschrift bovenaan),
// staat een overgang naar "proefbos" — het bos zelf staat nog niet in code (Beeld: het bos als
// reisgebied, half af en geparkeerd), dus proefbos is de tijdelijke bestemming, zoals
// T.GEBIEDEN dat voor elke kaart zonder eigen regels al doet. Vaste tegel op de kaart, op dezelfde
// plek als vóór deze editie van het gebouwenvel (die schoof alleen de gid's van gebouwen erna op).
zetPunt('pad het bos in', 8, 33, { overgang: 'proefbos', komt: '9,33' });

// 6b. het pad naar het dorp: aan het eind van Es.PAD_DORP, aan de rand van het erf, een overgang
// naar "dorp" — Marcels eigen kaart, met de hand getekend (kaarten/dorp.tmj, niet hier gemaakt).
// Die kaart heeft zelf al een uitgang terug naar het erf op haar tegel (1, 20) met komt: 2,20; dit
// is de andere kant van diezelfde deur. "komt" hier ligt één stap terug het erf op, in de as
// waarin het pad het laatst liep — dezelfde soort som als bij de deur van de toren hierboven.
{
  const pad = Es.PAD_DORP;
  const [wx, wy] = pad[pad.length - 1];
  const [pwx, pwy] = pad[pad.length - 2];
  const ux = wx - pwx;
  const uy = wy - pwy;
  const stap = Math.abs(uy) >= Math.abs(ux) ? [0, -(Math.sign(uy) || 1)] : [-(Math.sign(ux) || 1), 0];
  const [dx, dy] = naarKaart(wx, wy);
  const [kx, ky] = naarKaart(wx + stap[0], wy + stap[1]);
  zetPunt('pad naar het dorp', dx, dy, { overgang: 'dorp', komt: `${kx},${ky}` });
}

// ---------------------------------------------------------------- de .tmj schrijven

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
    { name: 'naam', type: 'string', value: 'Het erf' },
    // over hoeveel ringen vanaf de rand van de kaart het bos wegdooft in het donker (js/tekenen.js)
    { name: 'doof', type: 'int', value: BAND },
    { name: 'gemaakt', type: 'string', value: 'gereedschap/pixelart/erf-kaart.cjs uit erf-scene.cjs — niet met de hand bijwerken' },
  ],
  tilesets: gebruikt.map((naam) => ({ firstgid: firstgid[naam], source: `../tegels/${naam}.tsx` })),
  layers: [
    { type: 'tilelayer', id: 1, name: 'grond', x: 0, y: 0, width: B, height: H, visible: true, opacity: 1, data: grondLaag },
    { type: 'objectgroup', id: 2, name: 'objecten', visible: true, opacity: 1, draworder: 'topdown', objects: objecten },
  ],
};

// Nakijken vóór we schrijven: zonder een deur die werkt, is het erf een val. De tegel waar je
// voor de deur staat en de tegel waar je landt, moeten allebei vrij zijn en er moet een `komt`
// bij staan. Gaat dat mis, dan klagen we hoorbaar en eindigt het script met een foutcode.
{
  const uitgangen = objecten.filter((o) => (o.properties || []).some((p) => p.name === 'overgang'));
  const fouten = [];
  if (!uitgangen.length) fouten.push('er staat geen enkele overgang op de kaart');
  for (const o of uitgangen) {
    const eig = Object.fromEntries(o.properties.map((p) => [p.name, p.value]));
    const [ox, oy] = [o.x / 32, o.y / 32];
    if (!eig.komt) fouten.push(`de overgang op (${ox}, ${oy}) heeft geen "komt"`);
    const vrij = (x, y) => opKaart(x, y) && !!grondLaag[y * B + x] && !dicht.has(sleutel(x, y));
    if (!vrij(ox, oy)) fouten.push(`de tegel vóór de deur (${ox}, ${oy}) is niet begaanbaar`);
    if (eig.komt) {
      const [kx, ky] = eig.komt.split(',').map(Number);
      if (!vrij(kx, ky)) fouten.push(`de tegel waar je landt (${kx}, ${ky}) is niet begaanbaar`);
      if (kx === ox && ky === oy) fouten.push('"komt" wijst naar de overgangstegel zelf: daar kaats je op heen en weer');
    }
  }
  if (fouten.length) {
    console.error('erf.tmj deugt niet:');
    for (const f of fouten) console.error(`  - ${f}`);
    process.exitCode = 1;
  }
}

fs.mkdirSync(KAARTEN, { recursive: true });
fs.writeFileSync(path.join(KAARTEN, 'erf.tmj'), JSON.stringify(kaart, null, 1) + '\n');
const bomen = objecten.filter((o) => o.gid).length;
console.log(`erf.tmj klaar: ${B}×${H} tegels, ${bomen} dingen op de grond (${overgeslagen} overgeslagen), toren op (${OX}, ${OY})`);

// Meteen bundelen, want zonder kaarten/kaarten.js ziet het spel de kaart niet (fetch mag niet
// vanaf file://).
require('./naar-kaarten.cjs');
