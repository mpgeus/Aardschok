// Het verbindweefsel van de wereld: randtegels tussen de grondsoorten, oevers waar water en land
// elkaar raken, en een brug die op het raster ligt. Schrijft tegels/rand.png en tegels/rand.tsx.
//
//   node gereedschap/pixelart/randtegels.cjs      (of: npm run randtegels)
//
// Waarom een eigen vel naast tegels/grond.png: grond.png geeft Marcel vlakken (stempels van 4×4
// tegels per grondsoort). Dit vel geeft hem de overgangen, en levert ze aan als terreinsets
// (Tiled: Terrain Sets, vroeger Wang-tegels) zodat Tiled zelf de goede hoektegel kiest. Marcel
// tekent gewoon gras over zand; de rand klopt vanzelf.
//
// ---------------------------------------------------------------- hoe een randtegel werkt
//
// Een terreinset van het soort "corner" kent aan elke HOEK van een tegel een grondsoort toe. Bij
// een isometrische kaart zijn dat de vier punten van de ruit: boven, rechts, onder en links. Twee
// grondsoorten geven dus zestien combinaties; veertien daarvan zijn echte randtegels (de twee
// andere zijn de vlakke tegels).
//
// De grens binnen de tegel komt uit een veld f(gx, gy):
//
//   f = bilineair tussen de vier hoekwaarden (−1 = soort A, +1 = soort B)
//       + demping(u, v) × ruis uit de wereld
//
// Dat bilineaire deel hangt op een RIBBE alleen af van de twee hoeken van díe ribbe, en die deelt
// de tegel met zijn buur. De demping is nul op de ribben. Daardoor snijdt de grens elke ribbe
// precies in het midden — hetzelfde punt voor beide buren — en golft hij daartussen vrij. Zo
// sluiten willekeurig neergelegde tegels altijd op elkaar aan, zonder dat de rand langs een
// liniaal loopt.
//
// De textuur zelf komt uit dorp.cjs (grondTex, grasPollen, het water met zijn oeverwand), op de
// echte wereld-gx/gy, net als grondLap in naar-tiled.cjs: zo past een randtegel bij het vlak
// ernaast in plaats van er een naad tegenaan te leggen. Elke tegel wordt op een eigen plek uit dat
// ene doorlopende ruisveld gesneden, en welke plek dat is, is niet willekeurig: zie "waar we in de
// ruis snijden" hieronder, voor het plukjesrooster van het gras en voor de grondtoon.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');

const { TEGEL, PXH, RAMP, UIT, hash, ruis2, klem } = K;
const SQ = Math.SQRT1_2;
const TEGELS = path.join(__dirname, '..', '..', 'tegels');

// het schermrooster, vast aan de wereld (net als roosterX/roosterY in dorp.cjs)
const rasterX = (X, Y) => Math.floor((X - Y) * SQ);
const rasterY = (X, Y) => Math.floor((X + Y) * 0.5 * SQ);

// ---------------------------------------------------------------- grondsoorten en paren

// kleur: alleen het vlaggetje waarmee Tiled de terreinsoort in zijn eigen paneel aanduidt.
const SOORTEN = {
  gras: { s: D.GRAS, kleur: '#507826' },
  zandpad: { s: D.PAD, kleur: '#9a7856' },
  kasseien: { s: D.KASSEI, kleur: '#8f8290' },
  water: { s: D.WATER, kleur: '#2e76b6' },
};
const VLAKKEN = ['gras', 'zandpad', 'kasseien', 'water'];
const VARIANTEN_VLAK = 8; // losse vlakke tegels per grondsoort, zodat een groot vlak niet herhaalt
// Vier vormen per hoekcombinatie: dezelfde ribben, een andere golf. Een rechte oever of een recht
// stuk pad gebruikt telkens dezelfde hoekcombinatie, dus met minder varianten zie je de stenen in
// de beek en de rietpollen op de kant in een keurig ritme terugkomen.
const VARIANTEN_RAND = 4;

// a is de ondergrond, b wordt eroverheen getekend. In Tiled is a kleur 1 en b kleur 2.
const PAREN = [
  { naam: 'Gras over zand', a: 'zandpad', b: 'gras' },
  { naam: 'Gras over kasseien', a: 'kasseien', b: 'gras' },
  { naam: 'Zand over kasseien', a: 'kasseien', b: 'zandpad' },
  { naam: 'Gras aan water', a: 'water', b: 'gras' },
];

const WATER_DIEP = 7; // pixels dat het water onder het maaiveld ligt (een beek, net als dorp.cjs)
// dorp.cjs strooit in stromend water stenen met schuim, en in stilstaand water lelies. Allebei
// mooi in één grote plaat, allebei dodelijk in een tegel: zo'n steen valt op, en een tegel die
// dertig keer in dezelfde beek ligt, legt hem dertig keer op dezelfde plek. Een merkteken in
// `vijver` slaat de stenen over, en de diepte blijft net onder de grens waarop lelies beginnen —
// dan is het water schoon en zet Marcel er zelf rotsen bij uit begroeiing.tsx, waar ze horen.
const GEEN_STENEN = { rand: true };
const WATER_MAX = 0.19; // tegels van de kant af; daarboven zouden de lelies komen

// ---------------------------------------------------------------- waar we in de ruis snijden
//
// Het gras heeft kleine plukjes op een rooster van 5 bij 3 schermpixels, vast aan de wereld. Wil
// dat rooster in twee tegels naast elkaar dezelfde fase hebben, dan moet de linkerbovenhoek van
// beide tegels op hetzelfde rasterpunt vallen: (gx−gy) deelbaar door 5 en (gx+gy) door 3. Die
// wereldplekken vormen zelf een rooster, opgespannen door (4, −1) en (3, 3). We lopen dat rooster
// van binnen naar buiten af, zodat de tegels uit een stuk wereld van hooguit een meter of twintig
// komen en dus dezelfde grondtoon houden.
function plekken(aantal) {
  const uit = [];
  const n = Math.ceil(Math.sqrt(aantal * 15)) + 4;
  for (let m = -n; m <= n; m++) {
    for (let p = -n; p <= n; p++) uit.push([m * 4 + p * 3, -m + p * 3]);
  }
  uit.sort((A, B) => (A[0] * A[0] + A[1] * A[1]) - (B[0] * B[0] + B[1] * B[1]));
  return uit.slice(0, aantal);
}

// Maar niet elke plek in de ruis is even goed. Het gras heeft grote vlekken (grasToon), een
// zandpad vochtige en droge plekken: dezelfde grondsoort is op de ene tegel merkbaar lichter dan
// op de andere. Leg je zulke tegels door elkaar, dan krijg je een lappendeken van lichte en
// donkere ruiten — precies het raster dat we wilden verbergen. Daarom kiezen we een plek niet
// zomaar, maar meten we hem: render daar de vlakke tegel, neem zijn gemiddelde helderheid, en
// houd de plekken die het dichtst bij de middelste helderheid liggen. Wat overblijft verschilt nog
// volop in plukjes, kiezels, bloemen en de vorm van de rand, maar niet meer in grondtoon.
const KANDIDATEN = 600;
const KEUS = { kand: [], score: {}, vrij: [] };

function helderheid(plaat) {
  const rgba = plaat.rgba();
  let som = 0;
  let n = 0;
  for (let i = 0; i < plaat.b * plaat.h; i++) {
    if (rgba[i * 4 + 3] < 128) continue;
    som += rgba[i * 4] * 0.3 + rgba[i * 4 + 1] * 0.59 + rgba[i * 4 + 2] * 0.11;
    n++;
  }
  return n ? som / n : 0;
}

function meetPlekken() {
  KEUS.kand = plekken(KANDIDATEN);
  KEUS.vrij = KEUS.kand.map(() => true);
  for (const naam of VLAKKEN) {
    const h = KEUS.kand.map(([gx, gy]) => helderheid(vlakTegel(naam, gx, gy)));
    const op = [...h].sort((a, b) => a - b);
    const mid = op[op.length >> 1];
    const spreid = Math.max(0.001, op[Math.floor(op.length * 0.8)] - op[Math.floor(op.length * 0.2)]);
    KEUS.score[naam] = h.map((v) => Math.abs(v - mid) / spreid);
  }
}

// De beste nog vrije plek voor een tegel die deze grondsoorten draagt.
function neemPlek(soorten) {
  let best = -1;
  let bestS = Infinity;
  for (let i = 0; i < KEUS.kand.length; i++) {
    if (!KEUS.vrij[i]) continue;
    let s = 0;
    for (const naam of soorten) s = Math.max(s, KEUS.score[naam][i]);
    if (s < bestS) {
      bestS = s;
      best = i;
    }
  }
  if (best < 0) throw new Error('te weinig plekken in de ruis: verhoog KANDIDATEN');
  KEUS.vrij[best] = false;
  return KEUS.kand[best];
}

// ---------------------------------------------------------------- de kaart van één randtegel

// Demping: nul op de ribben van de tegel, één in het midden. De wortelvorm laat hem snel opkomen,
// zodat de grens alleen vlak bij de ribben wordt rechtgetrokken.
const demp = (t) => (t <= 0 || t >= 1 ? 0 : Math.pow(4 * t * (1 - t), 0.45));

// hoeken: [boven, rechts, onder, links] van de ruit, 0 = soort a, 1 = soort b. Dat zijn tegelijk
// de roosterpunten (gx0, gy0), (gx0+1, gy0), (gx0+1, gy0+1) en (gx0, gy0+1).
function randKaart(aNaam, bNaam, hoeken, gx0, gy0) {
  const a = SOORTEN[aNaam];
  const b = SOORTEN[bNaam];
  const [hBoven, hRechts, hOnder, hLinks] = hoeken.map((h) => (h ? 1 : -1));
  const heeftKassei = aNaam === 'kasseien' || bNaam === 'kasseien';
  // soort() geeft steeds hetzelfde object terug, precies als grondKaart in dorp.cjs: wie er twee
  // achter elkaar aanroept, moet de waarden eerst in eigen variabelen overschrijven.
  const U = { s: D.GRAS, d: 9, dwars: 0, rand: 9, randS: D.GRAS, langs: 0, diep: 0, vijver: null, akker: null };
  function soort(gx, gy) {
    const u = gx - gx0;
    const v = gy - gy0;
    // bilineair: op een ribbe hangt dit alleen van de twee hoeken van die ribbe af, dus buren zijn
    // het daar altijd eens. Buiten de tegel loopt het gewoon door, zodat het water dat achter de
    // oever wegzakt (waterTreffer kijkt een kwart tegel terug) niet ineens land wordt.
    const bil = (1 - u) * ((1 - v) * hBoven + v * hLinks) + u * ((1 - v) * hRechts + v * hOnder);
    const ruw = (ruis2(gx * 2.4, gy * 2.4, 1) - 0.5) * 1.7 + (ruis2(gx * 6.6, gy * 6.6, 8) - 0.5) * 0.8;
    const f = bil + demp(u) * demp(v) * ruw;
    // Het veld loopt over een tegel van −1 naar +1, dus een halve eenheid is een kwart tegel.
    const af = Math.min(Math.abs(f) / 2, 0.5);
    const win = f > 0 ? b : a;
    const verlies = f > 0 ? a : b;
    U.dwars = 0;
    U.akker = null;
    U.vijver = null;
    if (win.s === D.GRAS) {
      // gras is de achtergrond: d telt hoe ver het van de dichtstbijzijnde andere soort af ligt.
      U.s = D.GRAS;
      U.d = af;
      U.rand = af;
      U.randS = verlies.s;
    } else {
      U.s = win.s;
      U.d = -af;
      U.rand = 0;
      U.randS = D.GRAS;
      if (win.s === D.WATER) {
        U.d = -Math.min(af, WATER_MAX);
        U.vijver = GEEN_STENEN;
        U.diep = WATER_DIEP;
        // rimpels langs lijnen van gelijke schermhoogte: op het scherm lopen ze horizontaal, zoals
        // het water in dorp.cjs.
        U.langs = (gx + gy) * 0.5;
      }
    }
    return U;
  }
  // grondTex kijkt naar pleinen.length om losse keien over de rand van de kasseien te laten
  // rollen; zonder een plein blijft die rand een gladde snee.
  return { soort, paden: [], pleinen: heeftKassei ? [{}] : [], akkers: [], beken: [], vijvers: [] };
}

// ---------------------------------------------------------------- één tegel renderen
//
// Hetzelfde recept als grondLap in naar-tiled.cjs, maar voor één tegel: dezelfde dikte, hetzelfde
// omgevingslicht en dezelfde kwantisering, anders past de rand niet bij het vlak ernaast.
const DIKTE = 0.3;

// Hoe hoog wordt wat grasPollen op een wortel zet? Een pol of een bloem blijft onder de zes
// pixels; die mag bovenin de ruit gerust net worden afgesneden, want daar is de ruit maar een paar
// pixels breed en zie je er niets van (grond.png doet aan de rand van zijn stempel hetzelfde). Een
// rietpol haalt dertien pixels, en díe zie je wel afknappen: vandaar deze grens.
const HOOG_RIET = 14;

function tegelBeeld(gx0, gy0) {
  return new K.Beeld(64, 32, 32 - (gx0 - gy0) * 32, -(gx0 + gy0) * 16);
}

// dozen: alles wat er op deze tegel staat (de grond zelf hoort er als eerste bij).
function rasterTegel(kaart, gx0, gy0, o = {}) {
  const B = tegelBeeld(gx0, gy0);
  K.tekenDozen(B, [K.doos(gx0, gy0, gx0 + 1, gy0 + 1, -DIKTE, 0, o.grondTex || D.grondTex(kaart))]);
  if (o.dozen) K.tekenDozen(B, o.dozen, 1);
  D.waterDiepte(B, kaart);
  if (o.pollen) {
    // Waar geen pol mag wortelen: op de natte strook aan het water, want die moet te zien blijven
    // in plaats van onder het riet te verdwijnen, en bovenin de ruit waar riet zou afknappen.
    for (let py = 0; py < B.h; py++) {
      for (let px = 0; px < B.b; px++) {
        const i = py * B.b + px;
        if (B.obj[i] !== 0) continue;
        const gx = B.pos[i * 3] / TEGEL;
        const gy = B.pos[i * 3 + 1] / TEGEL;
        const k = kaart.soort(gx, gy);
        if (k.s !== D.GRAS || k.randS !== D.WATER) continue;
        const rand = k.rand;
        if (rand < NAT_BREED && natteKant(kaart, gx, gy)) B.obj[i] = -1;
        else if (rand < 0.3 && py < HOOG_RIET) B.obj[i] = -1; // riet is dertien pixels hoog
      }
    }
    D.grasPollen(B, kaart, { dicht: 1, bloemen: 1 });
  }
  K.belicht(B, { omgeving: () => 0.15 });
  return K.Plaat.van(K.kwantiseer(B));
}

// Een vlakke tegel: alle vier de hoeken dezelfde grondsoort.
function vlakTegel(naam, gx0, gy0) {
  const kaart = randKaart(naam, naam, [1, 1, 1, 1], gx0, gy0);
  return rasterTegel(kaart, gx0, gy0, { pollen: naam === 'gras' });
}

// De kant van het water: een smalle strook natte aarde en nat zand waar de zode ophoudt. De
// overkant krijgt zijn wand al van dorp.cjs (oeverPixel, onder de graskant), maar de kant die naar
// de kijker toe ligt heeft die wand niet — daar zou het gras zomaar in het water lopen.
const NAT_BREED = 0.085; // hoe breed de natte strook is, in tegels

// Ligt het water vanaf hier naar de kijker toe gezien áchter deze grond? Het scherm loopt naar
// beneden met +x en +y, dus de kant die naar de kijker toe ligt heeft zijn water bovenlangs.
function natteKant(kaart, gx, gy) {
  return kaart.soort(gx - 0.12, gy - 0.12).s === D.WATER;
}

function oeverTex(kaart) {
  const basis = D.grondTex(kaart);
  return (vlak, X, Y, Z) => {
    basis(vlak, X, Y, Z);
    if (vlak !== 'z' || UIT.ramp === RAMP.water) return;
    const gx = X / TEGEL;
    const gy = Y / TEGEL;
    const k = kaart.soort(gx, gy);
    const rand = k.rand;
    if (k.s !== D.GRAS || k.randS !== D.WATER || rand > NAT_BREED) return;
    if (!natteKant(kaart, gx, gy)) return;
    const korrel = hash(rasterX(X, Y), rasterY(X, Y), 357) % 5;
    if (rand < NAT_BREED * 0.4) {
      UIT.ramp = RAMP.aarde; // de natte voet, donker
      UIT.stap = korrel === 0 ? 3 : 2;
    } else {
      UIT.ramp = korrel === 0 ? RAMP.aarde : RAMP.zand;
      UIT.stap = korrel === 0 ? 3 : 4 - (korrel === 1 ? 1 : 0);
    }
  };
}

// ---------------------------------------------------------------- de brug
//
// De vorige brug (dorp2.cjs) is een stenen boogbrug van 2,5 bij 0,9 tegel: prachtig in een plaat,
// maar geen heel aantal tegels, dus onbruikbaar op een raster. Deze brug is er wel een: een vlak
// plankdek met een landhoofd van veldsteen, als begin-, midden- en eindstuk, in allebei de
// richtingen. Marcel legt er zoveel middenstukken tussen als zijn beek breed is.
//
// Het dek ligt twee pixels boven het maaiveld en steekt drie pixels naar beneden; die drie pixels
// zijn de legger die je aan de kijkerskant ziet. Hoger kan niet: een tegel is precies 64×32 en de
// ruit vult hem helemaal, dus alles wat hoger reikt wordt afgesneden. Daarom een vlakke plankbrug
// en geen leuning — en daarom past hij wél op het raster.
const DEK_INSET = 0.15; // hoeveel tegel er aan weerszijden van het dek water blijft
const DEK_BOVEN = 2;
const DEK_ONDER = -3;
const PLANKEN = 7; // planken per tegel: een heel getal, dus het ritme loopt door over de tegelgrens

// De bovenkant van het landhoofd: vlakke veldsteen, afgesleten, met donkere voegen.
function landhoofdVlak(X, Y) {
  const qx = rasterX(X, Y);
  const qy = rasterY(X, Y);
  const i = Math.floor(qx / 7);
  const j = Math.floor(qy / 4);
  const h = hash(i, j, 331);
  UIT.ramp = RAMP.veldsteen;
  let s = 4 + (h % 3) - 1;
  if (qx - i * 7 === 0 || qy - j * 4 === 0) s -= 2; // de voeg
  if (hash(qx, qy, 333) % 7 === 0) s -= 1;
  if (ruis2(X * 0.07, Y * 0.07, 335) > 0.7) {
    UIT.ramp = RAMP.mos;
    s = 3;
  }
  UIT.stap = klem(s, 1, 7);
}

// Het plankdek: planken dwars op de loopricht, verweerd hout, sleets in het midden en mos langs de
// kant. langs 0..1 over de tegel, kant 0..1 dwars over het dek.
function plankVlak(X, Y, langs, kant) {
  const t = langs * PLANKEN;
  const idx = Math.floor(t);
  const f = t - idx;
  const h = hash(idx, 0, 341);
  UIT.ramp = RAMP.hout;
  let s = 4 + (h % 3) - 1;
  if (f < 0.1 || f > 0.92) s -= 2; // de naad tussen twee planken
  else if (f < 0.2) s += 1; // de opstaande kant van de plank vangt licht
  // nerf langs de plank, en een enkele spijkerkop
  if (hash(rasterX(X, Y), idx, 343) % 11 === 0) s -= 1;
  if (kant > 0.06 && kant < 0.12 && f > 0.35 && f < 0.6) {
    UIT.ramp = RAMP.ijzer;
    UIT.stap = 3;
    return;
  }
  if (kant < 0.1 || kant > 0.9) {
    s -= 1;
    if (ruis2(X * 0.09, Y * 0.09, 345) > 0.62) {
      UIT.ramp = RAMP.mos;
      UIT.stap = 3;
      return;
    }
  } else if (kant > 0.35 && kant < 0.65 && hash(rasterX(X, Y), rasterY(X, Y), 347) % 5 === 0) {
    s += 1; // uitgesleten looppad in het midden
  }
  UIT.stap = klem(s, 1, 6);
}

// De legger onder het dek (de kant die naar de kijker wijst) of de kopse muur van het landhoofd.
function leggerVlak(X, Y, Z, steen, licht) {
  const hpx = Z * PXH; // pixels boven het maaiveld
  if (steen) {
    D.veldsteenPixel((X + Y) * SQ, hpx * 3, 9999, licht ? 5 : 3, 351, false);
    if (hpx < DEK_ONDER + 1.2) UIT.stap = Math.max(1, UIT.stap - 1); // de natte voet
    return;
  }
  UIT.ramp = RAMP.hout;
  let s = licht ? 4 : 3;
  if (hpx > DEK_BOVEN - 1.2) s += 1; // de bovenrand van de legger vangt licht
  if (hpx < DEK_ONDER + 1) s -= 1; // en de onderkant staat in het donker boven het water
  if (hash(rasterX(X, Y), Math.round(hpx), 353) % 9 === 0) s -= 1;
  UIT.stap = klem(s, 1, 6);
}

// o: { richting: 'x'|'y', stuk: 'begin'|'midden'|'eind', gx0, gy0, van, tot }
function brugTex(o) {
  const loopVlak = o.richting === 'x' ? 'x' : 'y';
  return (vlak, X, Y, Z) => {
    const gx = X / TEGEL;
    const gy = Y / TEGEL;
    const langs = o.richting === 'x' ? gx - o.gx0 : gy - o.gy0;
    const dwars = o.richting === 'x' ? gy - o.gy0 : gx - o.gx0;
    const kant = (dwars - DEK_INSET) / (1 - 2 * DEK_INSET);
    const steen = (o.stuk === 'begin' && langs < 0.45) || (o.stuk === 'eind' && langs > 0.55);
    if (vlak === loopVlak) {
      // De kop in de looprichting valt precies op de tegelgrens; daar ligt het volgende brugstuk
      // tegenaan, dus die kant tekenen we niet. Alleen het eindstuk houdt zijn kopse muur.
      if (o.stuk !== 'eind') {
        UIT.weg = true;
        return;
      }
      leggerVlak(X, Y, Z, true, false);
      return;
    }
    if (vlak !== 'z') {
      leggerVlak(X, Y, Z, steen, true);
      return;
    }
    if (steen) landhoofdVlak(X, Y);
    else plankVlak(X, Y, langs, klem(kant, 0, 1));
  };
}

// De grond onder de brug: het gewone water/oever-recept, met de slagschaduw van het dek erop. Het
// licht komt uit (−0,3; +0,6), dus de schaduw valt naar +x en −y: bij een brug langs x op de
// strook water vóór het dek, bij een brug langs y op de strook erachter.
function brugGrondTex(kaart, o) {
  const basis = oeverTex(kaart);
  return (vlak, X, Y, Z) => {
    basis(vlak, X, Y, Z);
    if (vlak !== 'z' || UIT.ramp !== RAMP.water) return;
    const dwars = o.richting === 'x' ? Y / TEGEL - o.gy0 : X / TEGEL - o.gx0;
    const inSchaduw = o.richting === 'x'
      ? dwars > DEK_INSET - 0.085 && dwars < DEK_INSET
      : dwars > 1 - DEK_INSET && dwars < 1 - DEK_INSET + 0.085;
    if (inSchaduw) UIT.stap = Math.max(0, UIT.stap - 1);
  };
}

// De vier brugstukken per richting: welk deel van de tegel het dek beslaat, en welke hoeken van de
// ruit land zijn (bij begin en eind ligt de oever dwars op de brug).
const BRUG_STUKKEN = [
  { stuk: 'begin', van: 0.18, tot: 1, hoekenX: [1, 0, 0, 1], hoekenY: [1, 1, 0, 0] },
  { stuk: 'midden', van: 0, tot: 1, hoekenX: [0, 0, 0, 0], hoekenY: [0, 0, 0, 0] },
  { stuk: 'eind', van: 0, tot: 0.82, hoekenX: [0, 1, 1, 0], hoekenY: [0, 0, 1, 1] },
];

function brugTegel(richting, s) {
  const [gx0, gy0] = neemPlek(['gras', 'water']);
  const hoeken = richting === 'x' ? s.hoekenX : s.hoekenY;
  const kaart = randKaart('water', 'gras', hoeken, gx0, gy0);
  const o = { richting, stuk: s.stuk, gx0, gy0 };
  const dek = richting === 'x'
    ? K.doos(gx0 + s.van, gy0 + DEK_INSET, gx0 + s.tot, gy0 + 1 - DEK_INSET, DEK_ONDER, DEK_BOVEN, brugTex(o), { obj: 1 })
    : K.doos(gx0 + DEK_INSET, gy0 + s.van, gx0 + 1 - DEK_INSET, gy0 + s.tot, DEK_ONDER, DEK_BOVEN, brugTex(o), { obj: 1 });
  return rasterTegel(kaart, gx0, gy0, {
    grondTex: brugGrondTex(kaart, o),
    dozen: [dek],
    pollen: s.stuk !== 'midden',
  });
}

// ---------------------------------------------------------------- de .tsx
//
// De hoeken van een Tiled-wangid staan in de volgorde boven, rechtsboven, rechts, rechtsonder,
// onder, linksonder, links, linksboven; bij een hoekenset tellen alleen de vier schuine. Tiled
// noemt ze naar de hoeken van de RECHTHOEK van de tegel in roostercoördinaten: linksboven is
// roosterpunt (x, y). Op een isometrische kaart is dat de BOVENPUNT van de ruit, rechtsboven de
// rechterpunt, rechtsonder de onderpunt en linksonder de linkerpunt. Staat de rand in Tiled een
// kwartslag verkeerd, dan is dit de enige plek die verandert.
const HOEK_INDEX = { boven: 7, rechts: 1, onder: 3, links: 5 };

function wangId(hoeken) {
  const w = [0, 0, 0, 0, 0, 0, 0, 0];
  w[HOEK_INDEX.boven] = hoeken[0] + 1;
  w[HOEK_INDEX.rechts] = hoeken[1] + 1;
  w[HOEK_INDEX.onder] = hoeken[2] + 1;
  w[HOEK_INDEX.links] = hoeken[3] + 1;
  return w.join(',');
}

const XML_ESC = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function eigenschapXml(naam, waarde) {
  if (typeof waarde === 'boolean') return `    <property name="${naam}" type="bool" value="${waarde}"/>\n`;
  if (typeof waarde === 'number') return `    <property name="${naam}" type="int" value="${waarde}"/>\n`;
  return `    <property name="${naam}" value="${XML_ESC(waarde)}"/>\n`;
}

function schrijfTsx(vel) {
  let x = '<?xml version="1.0" encoding="UTF-8"?>\n';
  x += `<tileset version="1.10" tiledversion="1.11.0" name="${vel.naam}" tilewidth="64" tileheight="32" tilecount="${vel.tiles.length}" columns="${vel.kolommen}">\n`;
  // Met een isometrisch raster tekent Tiled de terreinhoeken op de punten van de ruit in plaats van
  // op de hoeken van de rechthoek: dan zie je in het tegelpaneel meteen wat je schildert.
  x += ' <grid orientation="isometric" width="64" height="32"/>\n';
  x += ` <properties>\n  ${eigenschapXml('notitie', vel.notitie).trim()}\n </properties>\n`;
  x += ` <image source="${vel.bestand}" width="${vel.breedte}" height="${vel.hoogte}"/>\n`;
  vel.tiles.forEach((t, id) => {
    x += ` <tile id="${id}">\n  <properties>\n`;
    x += eigenschapXml('naam', t.naam);
    x += eigenschapXml('vast', !!t.vast);
    x += eigenschapXml('groep', t.groep);
    x += '  </properties>\n </tile>\n';
  });
  x += ' <wangsets>\n';
  for (const set of vel.sets) {
    x += `  <wangset name="${XML_ESC(set.naam)}" type="corner" tile="-1">\n`;
    for (const kl of set.kleuren) x += `   <wangcolor name="${XML_ESC(kl.naam)}" color="${kl.kleur}" tile="-1" probability="1"/>\n`;
    for (const wt of set.tegels) x += `   <wangtile tileid="${wt.id}" wangid="${wt.wangid}"/>\n`;
    x += '  </wangset>\n';
  }
  x += ' </wangsets>\n';
  x += '</tileset>\n';
  fs.writeFileSync(path.join(TEGELS, `${vel.naam}.tsx`), x);
}

// ---------------------------------------------------------------- alles bouwen

const telBits = (m) => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1);
const maskerHoeken = (m) => [m & 1, (m >> 1) & 1, (m >> 2) & 1, (m >> 3) & 1];
const HOEK_NAAM = ['boven', 'rechts', 'onder', 'links'];

function bouw() {
  fs.mkdirSync(TEGELS, { recursive: true });
  meetPlekken();

  const platen = [];
  const tiles = [];
  const vlakId = {}; // grondsoort -> de tegel-ids van zijn vlakke tegels

  // 1. de vlakke tegels, gedeeld door alle terreinsets die deze grondsoort kennen
  for (const naam of VLAKKEN) {
    vlakId[naam] = [];
    for (let v = 0; v < VARIANTEN_VLAK; v++) {
      const [gx0, gy0] = neemPlek([naam]);
      platen.push(vlakTegel(naam, gx0, gy0));
      vlakId[naam].push(tiles.length);
      tiles.push({ naam, vast: naam === 'water', groep: 'vlak' });
    }
  }

  // 2. de randen, per paar veertien hoekcombinaties
  const sets = [];
  for (const paar of PAREN) {
    const set = {
      naam: paar.naam,
      kleuren: [
        { naam: paar.a, kleur: SOORTEN[paar.a].kleur },
        { naam: paar.b, kleur: SOORTEN[paar.b].kleur },
      ],
      tegels: [],
    };
    for (const id of vlakId[paar.a]) set.tegels.push({ id, wangid: wangId([0, 0, 0, 0]) });
    for (const id of vlakId[paar.b]) set.tegels.push({ id, wangid: wangId([1, 1, 1, 1]) });
    const water = paar.a === 'water';
    for (let m = 1; m <= 14; m++) {
      const hoeken = maskerHoeken(m);
      const tel = telBits(m);
      const kort = HOEK_NAAM.filter((_, i) => hoeken[i]).join('+');
      for (let v = 0; v < VARIANTEN_RAND; v++) {
        const [gx0, gy0] = neemPlek([paar.a, paar.b]);
        const kaart = randKaart(paar.a, paar.b, hoeken, gx0, gy0);
        platen.push(rasterTegel(kaart, gx0, gy0, {
          grondTex: water ? oeverTex(kaart) : null,
          pollen: paar.b === 'gras' || paar.a === 'gras',
        }));
        set.tegels.push({ id: tiles.length, wangid: wangId(hoeken) });
        tiles.push({
          // De naam die het spel ziet: welke soort de tegel in hoofdzaak is.
          naam: tel > 2 ? paar.b : tel < 2 ? paar.a : water ? 'water' : paar.b,
          // Half water loopt niet: vanaf twee waterhoeken staat het midden van de tegel in de beek.
          vast: water && tel <= 2,
          groep: `${paar.b} over ${paar.a}: ${kort}`,
        });
      }
    }
    sets.push(set);
  }

  // 3. de brug
  for (const richting of ['x', 'y']) {
    for (const s of BRUG_STUKKEN) {
      platen.push(brugTegel(richting, s));
      tiles.push({ naam: 'brug', vast: false, groep: `brug ${richting} ${s.stuk}` });
    }
  }

  // 4. het vel
  const kolommen = 8;
  const rijen = Math.ceil(platen.length / kolommen);
  const vel = new K.Plaat(64 * kolommen, 32 * rijen);
  platen.forEach((p, i) => vel.plak(p, (i % kolommen) * 64, Math.floor(i / kolommen) * 32));
  fs.writeFileSync(path.join(TEGELS, 'rand.png'), K.png(vel, 1));
  schrijfTsx({
    naam: 'rand',
    bestand: 'rand.png',
    breedte: vel.b,
    hoogte: vel.h,
    kolommen,
    notitie: 'Randtegels, oevers en een brug. Kies in het paneel Terreinen een terreinset ("Gras over zand", '
      + '"Gras over kasseien", "Zand over kasseien" of "Gras aan water") en schilder met de bovenste kleur '
      + 'over de onderste: Tiled kiest zelf de hoektegel. Vul een vlak met de onderste kleur van dezelfde set, '
      + 'niet met de stempel uit grond.tsx, dan sluit alles aan. De zes brugtegels staan onderaan en horen '
      + 'niet bij een terreinset: leg begin, dan zoveel midden als je beek breed is, dan eind.',
    tiles,
    sets,
  });

  console.log(`rand.png  ${vel.b}×${vel.h}  (${platen.length} tegels)`);
  console.log(`  vlakken     ${VLAKKEN.length} × ${VARIANTEN_VLAK}`);
  for (const p of PAREN) console.log(`  ${p.naam.padEnd(20)} 14 × ${VARIANTEN_RAND} randen`);
  console.log(`  brug        2 × ${BRUG_STUKKEN.length}`);
  // tiles en sets gaan mee terug, zodat randtegels-proef.cjs de tegels kan kiezen zoals Tiled dat
  // doet — op wangid uit de terreinset — in plaats van tegelnummers na te rekenen.
  return { vel, kolommen, tiles, sets };
}

if (require.main === module) bouw();
module.exports = { bouw, randKaart, rasterTegel, plekken };
