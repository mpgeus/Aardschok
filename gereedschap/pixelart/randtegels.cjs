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
// HEIDE is geen soort uit dorp.cjs (die kent alleen GRAS/PAD/KASSEI/AKKER/WATER) maar een eigen
// getal, lokaal aan dit vel — dezelfde reden als de ramp 'modderwater' verderop: we raken
// dorp.cjs niet aan. Zonder een eigen grondTex zou D.grondTex zo'n tegel niet herkennen en
// gewoon als gras tekenen; zie heideGrondTex bij "de heide" hieronder.
const HEIDE = 5;
const SOORTEN = {
  gras: { s: D.GRAS, kleur: '#507826' },
  zandpad: { s: D.PAD, kleur: '#9a7856' },
  kasseien: { s: D.KASSEI, kleur: '#8f8290' },
  water: { s: D.WATER, kleur: '#2e76b6' },
  heide: { s: HEIDE, kleur: '#6e6a3e' },
};
// De grond van het eiland (werklijst vraag 117, B van 2a; Marcel, 8 okt: "dan gaan we de eigen tegels maken"): de zee,
// het strand (ook voor de duinen en het stuifzand), het veen en het broek, elk een eigen getal zoals HEIDE. Ze staan op
// een eigen vel (tegels/kust.png, bouwKust onderaan), zodat rand.png letter voor letter blijft wat het was.
const ZEE = 6;
const STRAND = 7;
const VEEN = 8;
const BROEK = 9;
SOORTEN.zee = { s: ZEE, kleur: '#3d5b6e' };
SOORTEN.strand = { s: STRAND, kleur: '#d3ad78' };
SOORTEN.veen = { s: VEEN, kleur: '#40311e' };
SOORTEN.broek = { s: BROEK, kleur: '#385e36' };
const KUST = { zee: true, strand: true, veen: true, broek: true };
const VLAKKEN = ['gras', 'zandpad', 'kasseien', 'water'];
// Heide kwam er op 25 sep 2026 bij (de meent, ontwerp/spel.md), maar ACHTERAAN in bouw() — na de
// brug, in een eigen stap — zodat geen bestaand tegelnummer verschuift: kaarten/wereld.tmj wijst
// er met de hand naar. meetPlekken() meet 'm wel gewoon mee met VLAKKEN, zie daar. Zie
// ontwerp/beeld.md, "De heide".
const VLAKKEN_ACHTERAAN = ['heide'];
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
// Ook achteraan (zie VLAKKEN_ACHTERAAN hierboven): heide komt over gras, zoals een schaapsweide
// de rand van het dorpsgras opeet.
const PAREN_ACHTERAAN = [{ naam: 'Heide over gras', a: 'gras', b: 'heide' }];

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

function meetPlekken(soorten = [...VLAKKEN, ...VLAKKEN_ACHTERAAN]) {
  KEUS.kand = plekken(KANDIDATEN);
  KEUS.vrij = KEUS.kand.map(() => true);
  for (const naam of soorten) {
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

// Weet deze hoekcombinatie de rijrichting van een pad? Alleen als twee NABURIGE hoeken dezelfde
// soort dragen (boven+rechts tegenover onder+links, of rechts+onder tegenover links+boven) snijdt
// de grens de tegel als één rechte lijn, en staat de as loodrecht daarop vast. Bij één afwijkende
// hoek (een bocht) of twee hoeken kruislings (boven+onder tegenover rechts+links, de dubbelzinnige
// zadelvorm) golft de grens door de tegel en is er geen as te noemen. Dan zetten we geen sporen,
// net zomin als op een open vlakte (zie de sporen-tak van randKaart hieronder).
function duidelijkeDoorgang([boven, rechts, onder, links]) {
  return (boven === rechts && onder === links && boven !== onder)
    || (rechts === onder && links === boven && rechts !== links);
}

// hoeken: [boven, rechts, onder, links] van de ruit, 0 = soort a, 1 = soort b. Dat zijn tegelijk
// de roosterpunten (gx0, gy0), (gx0+1, gy0), (gx0+1, gy0+1) en (gx0, gy0+1).
function randKaart(aNaam, bNaam, hoeken, gx0, gy0) {
  const a = SOORTEN[aNaam];
  const b = SOORTEN[bNaam];
  const [hBoven, hRechts, hOnder, hLinks] = hoeken.map((h) => (h ? 1 : -1));
  const heeftKassei = aNaam === 'kasseien' || bNaam === 'kasseien';
  const kust = !!(KUST[aNaam] || KUST[bNaam]);
  // aan zee golft de grens net zo, maar midden in de zee niet: daar is het overal even diep (de branding volgt de diepte)
  const zeeKust = aNaam === 'zee' || bNaam === 'zee';
  const spoorAs = duidelijkeDoorgang(hoeken);
  // soort() geeft steeds hetzelfde object terug, precies als grondKaart in dorp.cjs: wie er twee
  // achter elkaar aanroept, moet de waarden eerst in eigen variabelen overschrijven.
  const U = { s: D.GRAS, d: 9, dwars: 0, rand: 9, randS: D.GRAS, langs: 0, diep: 0, vijver: null, akker: null, zee: false };
  function soort(gx, gy) {
    const u = gx - gx0;
    const v = gy - gy0;
    // bilineair: op een ribbe hangt dit alleen van de twee hoeken van die ribbe af, dus buren zijn
    // het daar altijd eens. Buiten de tegel loopt het gewoon door, zodat het water dat achter de
    // oever wegzakt (waterTreffer kijkt een kwart tegel terug) niet ineens land wordt.
    const bil = (1 - u) * ((1 - v) * hBoven + v * hLinks) + u * ((1 - v) * hRechts + v * hOnder);
    const ruw = (ruis2(gx * 2.4, gy * 2.4, 1) - 0.5) * 1.7 + (ruis2(gx * 6.6, gy * 6.6, 8) - 0.5) * 0.8;
    const f = bil + demp(u) * demp(v) * ruw * (zeeKust ? 1 - Math.abs(bil) : 1);
    // Het veld loopt over een tegel van −1 naar +1, dus een halve eenheid is een kwart tegel.
    const af = Math.min(Math.abs(f) / 2, 0.5);
    // Voor de sporen willen we dezelfde afstand, maar zónder de ruw-term: die golft de grens
    // mooi natuurlijk, maar zou een spoor (dat verder van de rand ligt, midden in demp se piek)
    // in stukken breken. Een wagenwiel houdt een rechte lijn, het gras aan de kant niet.
    const afSchoon = Math.min(Math.abs(bil) / 2, 0.5);
    const win = f > 0 ? b : a;
    const verlies = f > 0 ? a : b;
    U.dwars = 0;
    U.akker = null;
    U.vijver = null;
    U.zee = false;
    if (win.s === D.GRAS) {
      // gras is de achtergrond: d telt hoe ver het van de dichtstbijzijnde andere soort af ligt.
      U.s = D.GRAS;
      U.d = af;
      U.rand = af;
      // naar het strand toe dunt het gras uit zoals naar een zandpad (grasPixel kent het strand niet)
      U.randS = kust && verlies.s === STRAND ? D.PAD : verlies.s;
    } else if (win.s === ZEE) {
      // De zee is water zoals in dorp.cjs (waterDiepte, waterPixel), maar ondiep aan het strand: geen oeverwand van
      // een beek, maar een paar pixels zand. Welke kleur, zegt kustGrondTex (U.zee).
      U.s = D.WATER;
      U.d = -Math.min(af, ZEE_MAX);
      U.rand = 0;
      U.randS = verlies.s;
      U.vijver = GEEN_STENEN;
      U.diep = ZEE_DIEP;
      U.langs = (gx + gy) * 0.5;
      U.zee = true;
    } else {
      U.s = win.s;
      U.d = -af;
      U.rand = 0;
      U.randS = kust ? verlies.s : D.GRAS;
      if (win.s === D.PAD) {
        // karrensporen: alleen zetten waar de hoekcombinatie de rijrichting kent (spoorAs), anders
        // op 0 laten staan — dan tekent padPixel gewoon los zand zonder sporen, wat ook klopt bij
        // een bocht of een open plek. afSchoon (0..0,5 tegel vanaf de rand) wordt zo 0..1 over de
        // volle breedte die padPixel voor een spoor verwacht.
        U.dwars = spoorAs ? Math.min(afSchoon * 2, 1) : 0;
      } else if (win.s === D.WATER) {
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
  return { soort, paden: [], pleinen: heeftKassei ? [{}] : [], akkers: [], beken: [], vijvers: [], zee: aNaam === 'zee' || bNaam === 'zee' };
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

// ---------------------------------------------------------------- modderig water
//
// dorp.cjs (waterPixel) tekent water met de gedeelde 'water'-ramp uit kern.cjs: helder
// korenbloemblauw, met een fonkeling die tot bijna wit oploopt. De rest van de wereld is naar
// olijf en gedempt gegaan — zie de 'veldsteen'-ramp die dorp.cjs zelf al naast 'steen' bijschreef,
// om dezelfde reden (die te paars was). We raken dorp.cjs niet aan, dus doen we hetzelfde hier: een
// eigen ramp, alleen voor dit vel. waterPixel blijft gewoon zijn diepte en rimpels uitrekenen (de
// 'stap' van donker naar licht); wij zetten na afloop alleen de ramp om.
if (K.RAMP.modderwater === undefined) {
  // Modderig, maar het moet wel water blijven: de donkerste stap lag eerst op bijna zwart, en dan
  // leest een beek als teer. Nu grijsgroen met een bruine inslag, van diep maar leesbaar tot een
  // gedempte weerschijn van de lucht.
  const hexen = ['#1f2622', '#2b342c', '#3a4536', '#4a5742', '#5c6a51', '#707e62', '#899677', '#a5b093'];
  const rgb = hexen.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  K.RAMPEN.modderwater = hexen;
  K.RAMP.modderwater = K.RAMP_NAMEN.length;
  K.RAMP_NAMEN.push('modderwater');
  K.RAMP_RGB.push(rgb);
  K.RAMP_LEN.push(hexen.length);
}
const MODDERWATER = K.RAMP.modderwater;

// Om elke grondtextuur heen: laat dorp.cjs zijn werk doen, en waar dat de blauwe waterramp
// neerzette, zet 'm om naar de modderige. De lichtste stap (7) is bij dorp.cjs de fonkeling —
// bijna wit; die temperen we één stap terug, zodat er nog wel iets fonkelt, maar spaarzaam en
// gedempt in plaats van wit en fel. Een gouden vonk (af en toe, zie waterPixel) laten we staan.
function modderig(tex) {
  return (vlak, X, Y, Z) => {
    tex(vlak, X, Y, Z);
    if (UIT.ramp === RAMP.water) {
      UIT.ramp = MODDERWATER;
      if (UIT.stap > 6) UIT.stap = 6;
    }
  };
}

function tegelBeeld(gx0, gy0) {
  return new K.Beeld(64, 32, 32 - (gx0 - gy0) * 32, -(gx0 + gy0) * 16);
}

// dozen: alles wat er op deze tegel staat (de grond zelf hoort er als eerste bij).
function rasterTegel(kaart, gx0, gy0, o = {}) {
  const B = tegelBeeld(gx0, gy0);
  K.tekenDozen(B, [K.doos(gx0, gy0, gx0 + 1, gy0 + 1, -DIKTE, 0, modderig(o.grondTex || D.grondTex(kaart)))]);
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
  return rasterTegel(kaart, gx0, gy0, {
    grondTex: KUST[naam] ? kustGrondTex(kaart) : naam === 'heide' ? heideGrondTex(kaart) : undefined,
    pollen: naam === 'gras',
  });
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

// ---------------------------------------------------------------- de kantlaag van het kasseiplein
//
// Los tot aan de rand oogt een kasseiplein als gemorst. Een echt plein heeft een kantlaag van
// grotere, rechtere stenen die het vlak omlijst, en pas daarbinnen de kleine kasseien van
// kasseiPixel (dorp.cjs). Zelfde recept als kasseiCel/kasseiPixel daar — Voronoi-cellen als kei,
// een lichte rand linksboven en een donkere rechtsonder, een voeg ertussen — maar grover, met een
// eigen zaad (anders vallen de twee roosters samen) en zonder de kleur-variatie van de kleine
// keien: een kantlaag ligt gelijkmatiger.
const KANT_BREED = 0.4; // tegels vanaf de rand van het plein waar de grotere stenen liggen
const KAS_KANT = 15.5; // celgrootte van de kantstenen; kasseiPixel se KAS is 8,4

function kantCel(X, Y) {
  const j0 = Math.floor(Y / (KAS_KANT * 0.87));
  let d1 = Infinity;
  let d2 = Infinity;
  let c1 = null;
  let c2 = null;
  for (let j = j0 - 1; j <= j0 + 1; j++) {
    const off = (j & 1) * 0.5;
    const i0 = Math.floor(X / KAS_KANT - off);
    for (let i = i0 - 1; i <= i0 + 1; i++) {
      const h = hash(i, j, 561);
      const cx = (i + off + 0.5 + ((h & 255) / 255 - 0.5) * 0.3) * KAS_KANT;
      const cy = (j + 0.5 + (((h >>> 8) & 255) / 255 - 0.5) * 0.28) * KAS_KANT * 0.87;
      const d = (X - cx) ** 2 + (Y - cy) ** 2;
      if (d < d1) {
        d2 = d1;
        c2 = c1;
        d1 = d;
        c1 = [cx, cy, h];
      } else if (d < d2) {
        d2 = d;
        c2 = [cx, cy, h];
      }
    }
  }
  const ex = c2[0] - c1[0];
  const ey = c2[1] - c1[1];
  const el = Math.hypot(ex, ey);
  const grens = (d2 - d1) / (2 * el);
  const nx = ex / el;
  const ny = ey / el;
  const opScherm = Math.hypot((nx - ny) * SQ, (nx + ny) * 0.5 * SQ);
  return { cx: c1[0], cy: c1[1], h: c1[2], voegPx: grens * opScherm };
}

function kantsteenPixel(X, Y, qx, qy) {
  const c = kantCel(X, Y);
  if (c.voegPx < 1.1) {
    UIT.ramp = RAMP.aarde;
    UIT.stap = 1;
    return;
  }
  // 'steen' trekt naar paars (zie de veldsteen-ramp hierboven bij oeverTex): voor een nette
  // kantlaag, "in dezelfde geest" als het gedempte water, gebruiken we diezelfde grijze ramp.
  UIT.ramp = RAMP.veldsteen;
  let s = 5;
  const var_ = (c.h >>> 20) % 7;
  if (var_ === 0) s -= 1;
  else if (var_ === 1) s += 1;
  // bol, zoals kasseiPixel: licht linksboven langs de voeg, donker rechtsonder.
  const dsx = (X - c.cx - (Y - c.cy)) * SQ;
  const dsy = (X - c.cx + (Y - c.cy)) * 0.5 * SQ;
  const r = KAS_KANT * 0.5;
  const hoog = (-dsx * 0.5 - dsy * 1.5) / r;
  if (hoog > 0.25 && c.voegPx < 3) s += 1;
  else if (hoog < -0.2 && c.voegPx < 2.4) s -= 1;
  if (hash(qx, qy, 563) % 37 === 0) s -= 1;
  UIT.stap = klem(s, 1, 8);
}

// Om de grondtextuur heen: binnen KANT_BREED van de rand van het plein (kaart.soort geeft dat via
// k.d, negatief en aflopend naar 0 aan de rand) de grotere kantsteen, verder naar binnen — waar een
// grote vlakke tegel het plein vult, staat k.d daar vast op zo'n 0,5 — gewoon kasseiPixel.
function pleinKantTex(kaart) {
  const basis = D.grondTex(kaart);
  return (vlak, X, Y, Z) => {
    if (vlak === 'z') {
      const gx = X / TEGEL;
      const gy = Y / TEGEL;
      const k = kaart.soort(gx, gy);
      if (k.s === D.KASSEI && -k.d < KANT_BREED) {
        kantsteenPixel(X, Y, rasterX(X, Y), rasterY(X, Y));
        return;
      }
    }
    basis(vlak, X, Y, Z);
  };
}

// ---------------------------------------------------------------- de heide
//
// Lage, dichte struikheide, het hele jaar door — dus geen felle paarse bloei, augustus is maar
// één maand. Eén eigen ramp, olijfbruin in de schaduw en gedempt grijsgroen in het licht (dezelfde
// truc als 'gras' en 'aarde': de kleurdrift zit IN de ramp, niet in een harde grens tussen twee
// ramen — dat laatste stond eerst en gaf grote, hard omlijnde bruine en groene vlekken, precies
// het "flikkeren op een groot vlak" dat we niet willen). Klontjes komen uit hetzelfde
// verspringende rooster als de grasplukjes (plukOp hierboven), met HEIDE_BOL in plaats van PLUK:
// kleinere, rondere vormen, want heide is een bos twijgjes, geen los blad. Een deel van de lichte
// koppen valt zelf al in de 'mos'-ramp (grijsgroen tussen het olijfbruin door, geen aparte grote
// vlek), en heel af en toe steekt er de 'steen'-ramp doorheen: verspreide, gedempte paarsgrijze
// toppen — die ramp trekt toch al naar paars (zie "modderig water" hierboven, waar dat meestal
// niet de bedoeling was; hier is het dat wél). Daarnaast een enkele kale plek wit-geel zand of een
// schapenpaadje. Alles hangt aan gx/gy of aan het wereldrooster qx/qy, dus de naad met de
// buurtegel is niet te zien.
if (K.RAMP.heide === undefined) {
  const hexen = ['#1a1712', '#2a2417', '#3c3720', '#4c4a2a', '#585c38', '#697048', '#7c8558'];
  const rgb = hexen.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  K.RAMPEN.heide = hexen;
  K.RAMP.heide = K.RAMP_NAMEN.length;
  K.RAMP_NAMEN.push('heide');
  K.RAMP_RGB.push(rgb);
  K.RAMP_LEN.push(hexen.length);
}

// Vormen voor heideBolOp: net als PLUK bij plukOp, maar kleiner en ronder. toon 0 = geen klontje,
// 1 = een lichte kop, 2 = een lichte kop die toch al naar grijsgroen neigt (twee van de vijf,
// heideBolOp hieronder), -1 = een donker holletje ernaast.
const HEIDE_BOL = [
  [[0, 0, 1], [0, 1, -1]],
  [[0, 0, 1], [1, 0, 1], [0, 1, -1]],
  [[0, 0, -1], [0, -1, 1]],
  [[0, 0, 1]],
  [[-1, 0, -1], [0, 0, 1], [1, 0, -1]],
];
function heideBolOp(qx, qy) {
  const rj = Math.floor(qy / 3);
  for (let j = rj; j <= rj + 1; j++) {
    const verspring = (j & 1) * 2;
    const ri = Math.floor((qx - verspring) / 4);
    for (let i = ri - 1; i <= ri + 1; i++) {
      const h = hash(i, j, 415);
      if (h % 5 < 2) continue; // hier en daar geen klontje: blijft rustig
      const ax = i * 4 + verspring + ((h >>> 4) % 3);
      const ay = j * 3 + ((h >>> 7) % 2);
      const vorm = HEIDE_BOL[(h >>> 9) % HEIDE_BOL.length];
      for (const [dx, dy, toon] of vorm) {
        if (ax + dx !== qx || ay + dy !== qy) continue;
        return toon === 1 && (h >>> 13) % 5 < 2 ? 2 : toon;
      }
    }
  }
  return 0;
}

// Zelfde ritme als grasToon hierboven (dezelfde twee ruisschalen, dezelfde drie stappen): dat
// blijkt hier belangrijk, niet alleen mooi — een lagere frequentie of meer stappen liet de ruis
// zelf als lange diagonale strepen zien (het isometrische aanzicht trekt de rasterrichting van
// ruis2 recht), en dat verdween met dit ritme, hetzelfde als grasPixel al jaren gebruikt. Om
// dezelfde reden lopen de plekken hieronder (paars, gras, zand) allemaal op de hogere frequentie
// van HEIDE_BOL of op een dubbele ruisschaal, nooit op één lage.
//
// En gedraaid (25 sep, Claude): op 1,05 lagen de roosterpunten van ruis2 (waarde-ruis op hele
// getallen) vrijwel op de hoeken van de tegels, en de tegels zijn uit hele wereldplekken gesneden.
// Elke tegel liet daardoor hetzelfde glooiende vlekje tussen vier roosterpunten zien, en op het
// scherm werd dat een lichte ruit per tegel: de lappendeken die "waar we in de ruis snijden" juist
// wil voorkomen. Een draaiing van 37 graden en een schaal die niet op de tegels past, halen het
// rooster van de ruis los van dat van de tegels, zonder de strepen van een lage frequentie.
const HEIDE_COS = 0.8;
const HEIDE_SIN = 0.6;
function heideRuis(gx, gy, schaal, zaad) {
  const u = (gx * HEIDE_COS - gy * HEIDE_SIN) * schaal + 17.3;
  const v = (gx * HEIDE_SIN + gy * HEIDE_COS) * schaal + 5.1;
  return ruis2(u, v, zaad);
}
// En de grove vlekken klein gehouden: elke tegel is uit een andere plek van de ruis gesneden, dus
// een vlek zo groot als een tegel houdt op aan zijn rand, en dan zie je een dambord van lichte en
// donkere tegels. De fijne ruis doet het werk; de grove geeft alleen nog een zweem.
function heideToon(gx, gy) {
  const v = heideRuis(gx, gy, 1.37, 423) * 0.2 + heideRuis(gx, gy, 3.3, 424) * 0.45 + heideRuis(gx, gy, 7.9, 426) * 0.35;
  return v < 0.43 ? 3 : v > 0.6 ? 5 : 4;
}

function heidePixel(gx, gy, qx, qy) {
  UIT.ramp = RAMP.heide;
  let s = heideToon(gx, gy);
  const bol = heideBolOp(qx, qy);
  if (bol === 1 || bol === 2) {
    s += 1;
    if (bol === 2) UIT.ramp = RAMP.mos; // gedempt grijsgroen, op zo'n twee van de vijf koppen
  } else if (bol === -1) {
    s -= 1;
  }
  // gedempte paarsgrijze plukjes: bloeiende heide, zeldzaam en op een lichte klontkop, nooit fel
  const plek = heideRuis(gx, gy, 1.53, 425) * 0.7 + heideRuis(gx, gy, 3.7, 430) * 0.3;
  if (plek > 0.82 && bol === 1) {
    UIT.ramp = RAMP.steen;
    UIT.stap = 5;
    return;
  }
  // wit-geel zand of een schapenpaadje: een enkele, zachtomrande kale plek, met de lichte
  // stappen van de zand-ramp (die begint zelf al bij donkerbruin, zie kern.cjs)
  const zand = heideRuis(gx, gy, 0.83, 427) * 0.7 + heideRuis(gx, gy, 2.7, 432) * 0.3;
  if (zand > 0.9) {
    UIT.ramp = hash(qx, qy, 428) % 4 === 0 ? RAMP.aarde : RAMP.zand;
    UIT.stap = UIT.ramp === RAMP.aarde ? 4 : 6 + (hash(qx, qy, 429) % 2);
    return;
  }
  UIT.stap = klem(s, 1, 6);
}

// Zelfde vorm als oeverTex/pleinKantTex hierboven: D.grondTex kent HEIDE niet (het is geen soort
// uit dorp.cjs) en zou zo'n tegel zonder deze omweg gewoon als gras tekenen.
function heideGrondTex(kaart) {
  const basis = D.grondTex(kaart);
  return (vlak, X, Y, Z) => {
    if (vlak === 'z') {
      const gx = X / TEGEL;
      const gy = Y / TEGEL;
      const k = kaart.soort(gx, gy);
      if (k.s === HEIDE) {
        heidePixel(gx, gy, rasterX(X, Y), rasterY(X, Y));
        return;
      }
    }
    basis(vlak, X, Y, Z);
  };
}

// ---------------------------------------------------------------- de grond van het eiland
//
// De zee, het strand, het veen en het broek (werklijst vraag 117, B van 2a). Elk volgt het recept van de heide hierboven:
// een eigen ramp waar de kleur in zit, de fijne ruis (heideRuis, gedraaid, op hoge frequentie) voor de toon, en kleine
// vormen op het verspringende rooster van de wereld voor wat erop groeit; alles hangt aan gx/gy of qx/qy, dus de naad met
// de buurtegel is niet te zien.
function nieuweRamp(naam, hexen) {
  if (K.RAMP[naam] !== undefined) return;
  K.RAMPEN[naam] = hexen;
  K.RAMP[naam] = K.RAMP_NAMEN.length;
  K.RAMP_NAMEN.push(naam);
  K.RAMP_RGB.push(hexen.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]));
  K.RAMP_LEN.push(hexen.length);
}
// De zee is blauwer en kouder dan het modderige water in het dorp (Marcel, 8 okt: "Ja hoor, geen probleem"), maar nog
// gedempt: grijsblauw, van diep tot het schuim.
nieuweRamp('zee', ['#101a24', '#172634', '#1f3446', '#294458', '#35566a', '#4a6c7e', '#6c8c98', '#d6e0dc']);
// Het veen: donkerbruin, nat, naar olijf aan de lichte kant.
nieuweRamp('veen', ['#140f09', '#1f170e', '#2c2114', '#3a2c1b', '#4a3a22', '#5b4a2c', '#6e5c38']);
// Het broek: nat gras, donkerder en blauwer dan het gras van het dorp.
nieuweRamp('broek', ['#14200f', '#1e3018', '#2a4422', '#36582c', '#446c36', '#568042', '#6e9652', '#90b068']);

const ZEE_DIEP = 3; // pixels dat de zee onder het strand ligt: geen beekoever, een vlakke kust
const ZEE_MAX = 0.45; // tegels van de kant af waar de zee diep is: de branding krijgt de ruimte (een beek: WATER_MAX)
const NAT_ZEE = 0.16; // tegels nat zand aan de zee
const SCHUIM = 0.05; // tegels schuim op de waterlijn

// Een verspringend rooster van plekjes, zoals heideBolOp: per plekje een hash, of null. `elke` op de zoveel plekken
// iets, `zaad` om de roosters van verschillende dingen los van elkaar te houden. Geeft { ax, ay, h } van het plekje
// waar (qx, qy) bij hoort als het binnen `straal` pixels van zijn anker ligt.
function plekjeOp(qx, qy, elke, zaad, breed = 4, hoog = 3, straal = 1) {
  const rj = Math.floor(qy / hoog);
  for (let j = rj - 1; j <= rj + 1; j++) {
    const verspring = (j & 1) * (breed >> 1);
    const ri = Math.floor((qx - verspring) / breed);
    for (let i = ri - 1; i <= ri + 1; i++) {
      const h = hash(i, j, zaad);
      if (h % elke !== 0) continue;
      const ax = i * breed + verspring + ((h >>> 5) % breed);
      const ay = j * hoog + ((h >>> 9) % hoog);
      if (Math.abs(qx - ax) <= straal && Math.abs(qy - ay) <= straal) return { ax, ay, h };
    }
  }
  return null;
}

// Het strand: droog, licht zand uit de zand-ramp (lichter en geler dan het zandpad, dat uit de aarde-ramp komt), fijn
// gekorreld en zacht golvend, met hier en daar een schelpje of een donkere korrel; naar de zee toe nat en donkerder; en
// verder van het water (het stuifzand en de duinen) af en toe een pol helm.
function strandPixel(gx, gy, qx, qy, k) {
  UIT.ramp = RAMP.zand;
  const toon = heideRuis(gx, gy, 3.1, 612) * 0.3 + heideRuis(gx, gy, 7.7, 613) * 0.7;
  let s = toon < 0.3 ? 5 : toon > 0.7 ? 7 : 6;
  const af = -k.d; // tegels van de rand af
  if (k.randS === ZEE && af < NAT_ZEE) {
    // nat zand: donkerder, en op de vloedlijn een rij aangespoeld wier
    s = af < NAT_ZEE * 0.55 ? 4 : 5;
    const lijn = Math.abs(af - NAT_ZEE * 0.78) < 0.012 + (heideRuis(gx, gy, 9.7, 614) - 0.5) * 0.02;
    if (lijn && hash(qx, qy, 615) % 5 === 0) {
      UIT.ramp = RAMP.veen;
      UIT.stap = 4;
      return;
    }
  }
  const korrel = hash(qx, qy, 611);
  if (korrel % 29 === 0) s -= 1;
  else if (korrel % 37 === 0 && s >= 6) s = 8; // een schelpje
  // helm: lichte, grijsgroene pollen, alleen ver van het water
  if (k.randS !== ZEE || af > 0.3) {
    const pol = plekjeOp(qx, qy, 23, 616, 6, 4, 1);
    if (pol) {
      const dx = qx - pol.ax;
      const dy = qy - pol.ay;
      if (dy === 1 && dx === 0) {
        UIT.ramp = RAMP.zand;
        UIT.stap = 4; // de schaduw onder de pol
        return;
      }
      if (dy <= 0 && Math.abs(dx) + (dy === -1 ? 1 : 0) <= 1) {
        UIT.ramp = RAMP.mos;
        UIT.stap = (pol.h >>> 13) % 3 === 0 ? 5 : 4;
        return;
      }
    }
  }
  UIT.stap = klem(s, 3, 8);
}

// Het veen: donkerbruin en nat, met pollen pijpenstrootje (licht olijf, uit de riet-ramp) en hier en daar een plas.
function veenPixel(gx, gy, qx, qy) {
  UIT.ramp = RAMP.veen;
  const toon = heideRuis(gx, gy, 1.9, 621) * 0.3 + heideRuis(gx, gy, 4.7, 622) * 0.4 + heideRuis(gx, gy, 9.1, 623) * 0.3;
  let s = toon < 0.42 ? 2 : toon > 0.6 ? 4 : 3;
  // een plas: donker water met een lichte rand, op een dubbele ruisschaal (nooit één lage: dan strepen)
  const nat = heideRuis(gx, gy, 1.6, 624) * 0.6 + heideRuis(gx, gy, 3.9, 625) * 0.4;
  if (nat > 0.74) {
    UIT.ramp = RAMP.zee;
    UIT.stap = nat > 0.765 ? (hash(qx, qy, 626) % 17 === 0 ? 3 : 1) : 0;
    return;
  }
  const pol = plekjeOp(qx, qy, 3, 627, 4, 3, 1);
  if (pol) {
    const dx = qx - pol.ax;
    const dy = qy - pol.ay;
    if (dy === 1) s -= 1; // de schaduw eronder
    else if (Math.abs(dx) + Math.max(0, dy) <= 1) {
      UIT.ramp = RAMP.riet;
      UIT.stap = dy < 0 ? 3 : 2;
      return;
    }
  }
  UIT.stap = klem(s, 1, 5);
}

// Het broek: nat, donker gras (de broek-ramp), met biezen in pollen (donkere halmen met een lichte punt) en hier en daar
// een plas.
function broekPixel(gx, gy, qx, qy) {
  UIT.ramp = RAMP.broek;
  const toon = heideRuis(gx, gy, 1.7, 631) * 0.25 + heideRuis(gx, gy, 4.3, 632) * 0.4 + heideRuis(gx, gy, 8.7, 633) * 0.35;
  let s = toon < 0.4 ? 3 : toon > 0.66 ? 5 : 4;
  if ((qx + qy * 2) % 3 === 0 && hash(qx, qy, 634) % 3 === 0) s += 1; // gras dat glanst
  const nat = heideRuis(gx, gy, 1.5, 635) * 0.6 + heideRuis(gx, gy, 3.6, 636) * 0.4;
  if (nat > 0.8) {
    UIT.ramp = RAMP.zee;
    UIT.stap = nat > 0.83 ? (hash(qx, qy, 637) % 7 === 0 ? 5 : 3) : 2;
    return;
  }
  // biezen: een pol van drie of vier halmen, elk een paar pixels hoog
  const bies = plekjeOp(qx, qy, 3, 638, 5, 4, 2);
  if (bies) {
    const dx = qx - bies.ax;
    const dy = qy - bies.ay;
    const hoog = 2 + ((bies.h >>> 11) % 2);
    if ((dx === -1 || dx === 1 || (dx === 0 && (bies.h >>> 14) % 2)) && dy <= 0 && dy >= -hoog) {
      UIT.ramp = RAMP.broek;
      UIT.stap = dy === -hoog ? 6 : 2;
      return;
    }
    if (dy === 1 && Math.abs(dx) <= 1) s -= 1;
  }
  UIT.stap = klem(s, 2, 7);
}

// Heide op zand groeit in pollen, met het zand ertussen, en dunner naar de rand van het zand toe: zo loopt het in elkaar
// over in plaats van als een vlek op het zand te liggen. `af` is hoe ver de pixel van het zand af ligt, in tegels. Geeft
// true als hier zand ligt (dan staat het al in UIT), anders tekent heidePixel de heide.
function heideOpZand(gx, gy, qx, qy, af) {
  const pol = heideRuis(gx, gy, 6.7, 653) * 0.65 + heideRuis(gx, gy, 13.1, 654) * 0.35;
  const drempel = 0.34 + Math.max(0, 0.32 - af) * 1.1;
  if (pol >= drempel) return false;
  UIT.ramp = RAMP.zand;
  // vlak onder een pol de schaduw, verder het lichte zand
  UIT.stap = pol > drempel - 0.035 ? 4 : hash(qx, qy, 655) % 11 === 0 ? 5 : 6;
  return true;
}

// Na dorp.cjs, op een tegel aan zee: het water krijgt de zee-ramp, met golflijnen en schuim op de waterlijn; de bodem die
// in het ondiepe doorschemert en het randje onder het strand zijn zand.
function zeeNa(vlak, X, Y, k) {
  const gx = X / TEGEL;
  const gy = Y / TEGEL;
  const qx = rasterX(X, Y);
  const qy = rasterY(X, Y);
  if (vlak !== 'z') {
    // de kant onder het strand: nat zand
    if (UIT.ramp !== RAMP.water) {
      UIT.ramp = RAMP.zand;
      UIT.stap = hash(qx, qy, 641) % 4 === 0 ? 3 : 4;
    }
    return;
  }
  if (!k.zee) return;
  const diepte = -k.d;
  // schuim op de waterlijn, gebroken, ook waar de bodem doorschemert
  const breuk = heideRuis(gx, gy, 7.3, 642);
  if (diepte < SCHUIM + (breuk - 0.5) * 0.04) {
    UIT.ramp = RAMP.zee;
    UIT.stap = breuk > 0.4 ? 7 : 6;
    return;
  }
  if (UIT.ramp === RAMP.aarde) {
    UIT.ramp = RAMP.zand; // de bodem in het ondiepe
    UIT.stap = 5;
    return;
  }
  if (UIT.ramp !== RAMP.water) {
    // de gouden vonk van waterPixel hoort bij een beek in de zon, niet op zee
    UIT.ramp = RAMP.zee;
    UIT.stap = 4;
    return;
  }
  UIT.ramp = RAMP.zee;
  // de branding: drie gebroken lijnen schuim die de kust volgen, verder van het strand flauwer
  for (const [op, sterk] of [[0.11, 7], [0.2, 6], [0.3, 5]]) {
    const golf = op + (heideRuis(gx, gy, 3.7, 646 + op * 100) - 0.5) * 0.05;
    if (Math.abs(diepte - golf) < 0.026 && heideRuis(gx, gy, 5.9, 650 + op * 100) > 0.36) {
      UIT.stap = sterk;
      return;
    }
  }
  // diep en donker, lichter naar de kust
  let s = diepte < 0.09 ? 5 : diepte < 0.24 ? 4 : 3;
  // golven: lange lijnen dwars op de kijker (langs gx + gy), die breken waar de ruis het wil
  const golf = Math.sin((gx + gy) * 4.1 + heideRuis(gx, gy, 1.2, 643) * 4) * 0.5 + 0.5;
  if (golf > 0.93 && heideRuis(gx, gy, 3.1, 644) > 0.45) s += 1;
  else if (golf < 0.08) s -= 1;
  if (hash(qx, qy, 645) % 701 === 0) s = 5; // een glinstering, spaarzaam
  UIT.stap = klem(s, 1, 6);
}

// Zoals heideGrondTex: dorp.cjs kent deze soorten niet en zou ze als gras tekenen. De heide gaat via heideGrondTex
// (voor "Heide over strand").
function kustGrondTex(kaart) {
  const basis = heideGrondTex(kaart);
  return (vlak, X, Y, Z) => {
    const k = kaart.soort(X / TEGEL, Y / TEGEL);
    if (vlak === 'z') {
      const gx = X / TEGEL;
      const gy = Y / TEGEL;
      if (k.s === STRAND) return strandPixel(gx, gy, rasterX(X, Y), rasterY(X, Y), k);
      if (k.s === HEIDE && k.randS === STRAND && heideOpZand(gx, gy, rasterX(X, Y), rasterY(X, Y), -k.d)) return;
      if (k.s === VEEN) return veenPixel(gx, gy, rasterX(X, Y), rasterY(X, Y));
      if (k.s === BROEK) return broekPixel(gx, gy, rasterX(X, Y), rasterY(X, Y));
    }
    const zee = k.zee;
    const d = k.d;
    basis(vlak, X, Y, Z);
    if (kaart.zee) zeeNa(vlak, X, Y, { zee, d });
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

// Een vel in opbouw: de platen, wat de .tsx per tegel zegt, en de terreinsets, met de vlakke tegels per grondsoort.
function nieuwVel() {
  const v = { platen: [], tiles: [], sets: [], vlakId: {} };
  // de vlakke tegels, gedeeld door alle terreinsets die deze grondsoort kennen
  v.voegVlakToe = (naam) => {
    v.vlakId[naam] = [];
    for (let i = 0; i < VARIANTEN_VLAK; i++) {
      const [gx0, gy0] = neemPlek([naam]);
      v.platen.push(vlakTegel(naam, gx0, gy0));
      v.vlakId[naam].push(v.tiles.length);
      v.tiles.push({ naam, vast: naam === 'water' || naam === 'zee', groep: 'vlak' });
    }
  };
  // de randen, per paar veertien hoekcombinaties
  v.voegPaarToe = (paar) => {
    const set = {
      naam: paar.naam,
      kleuren: [
        { naam: paar.a, kleur: SOORTEN[paar.a].kleur },
        { naam: paar.b, kleur: SOORTEN[paar.b].kleur },
      ],
      tegels: [],
    };
    for (const id of v.vlakId[paar.a]) set.tegels.push({ id, wangid: wangId([0, 0, 0, 0]) });
    for (const id of v.vlakId[paar.b]) set.tegels.push({ id, wangid: wangId([1, 1, 1, 1]) });
    const water = paar.a === 'water';
    const nat = water || paar.a === 'zee';
    const kassei = paar.a === 'kasseien' || paar.b === 'kasseien';
    const heide = paar.a === 'heide' || paar.b === 'heide';
    const kust = KUST[paar.a] || KUST[paar.b];
    for (let m = 1; m <= 14; m++) {
      const hoeken = maskerHoeken(m);
      const tel = telBits(m);
      const kort = HOEK_NAAM.filter((_, i) => hoeken[i]).join('+');
      for (let i = 0; i < VARIANTEN_RAND; i++) {
        const [gx0, gy0] = neemPlek([paar.a, paar.b]);
        const kaart = randKaart(paar.a, paar.b, hoeken, gx0, gy0);
        v.platen.push(rasterTegel(kaart, gx0, gy0, {
          grondTex: kust ? kustGrondTex(kaart) : water ? oeverTex(kaart) : kassei ? pleinKantTex(kaart) : heide ? heideGrondTex(kaart) : null,
          pollen: paar.b === 'gras' || paar.a === 'gras',
        }));
        set.tegels.push({ id: v.tiles.length, wangid: wangId(hoeken) });
        v.tiles.push({
          // De naam die het spel ziet: welke soort de tegel in hoofdzaak is.
          naam: tel > 2 ? paar.b : tel < 2 ? paar.a : nat ? paar.a : paar.b,
          // Half water loopt niet: vanaf twee waterhoeken staat het midden van de tegel in de beek (of de zee).
          vast: nat && tel <= 2,
          groep: `${paar.b} over ${paar.a}: ${kort}`,
        });
      }
    }
    v.sets.push(set);
  };
  return v;
}

// Het vel als plaat, acht tegels breed; met `naam` ook naar tegels/<naam>.png en .tsx.
function legVel(v, naam, notitie) {
  const kolommen = 8;
  const rijen = Math.ceil(v.platen.length / kolommen);
  const vel = new K.Plaat(64 * kolommen, 32 * rijen);
  v.platen.forEach((p, i) => vel.plak(p, (i % kolommen) * 64, Math.floor(i / kolommen) * 32));
  if (naam) {
    fs.writeFileSync(path.join(TEGELS, `${naam}.png`), K.png(vel, 1));
    schrijfTsx({ naam, bestand: `${naam}.png`, breedte: vel.b, hoogte: vel.h, kolommen, notitie, tiles: v.tiles, sets: v.sets });
  }
  return { vel, kolommen, tiles: v.tiles, sets: v.sets };
}

function bouw() {
  fs.mkdirSync(TEGELS, { recursive: true });
  meetPlekken();
  const v = nieuwVel();

  // 1. de vlakke tegels
  for (const naam of VLAKKEN) v.voegVlakToe(naam);

  // 2. de randen
  for (const paar of PAREN) v.voegPaarToe(paar);

  // 3. de brug
  for (const richting of ['x', 'y']) {
    for (const st of BRUG_STUKKEN) {
      v.platen.push(brugTegel(richting, st));
      v.tiles.push({ naam: 'brug', vast: false, groep: `brug ${richting} ${st.stuk}` });
    }
  }

  // 4. heide: erbij op 25 sep 2026 (de meent, ontwerp/spel.md — de schapen grazen op de heide).
  // ACHTERAAN, na de brug: kaarten/wereld.tmj wijst met de hand naar tegelnummers, en die mogen
  // niet verschuiven. Zie ontwerp/beeld.md, "De heide".
  for (const naam of VLAKKEN_ACHTERAAN) v.voegVlakToe(naam);
  for (const paar of PAREN_ACHTERAAN) v.voegPaarToe(paar);

  // 5. het vel
  const uit = legVel(v, 'rand', 'Randtegels, oevers, een brug en heide. Kies in het paneel Terreinen een terreinset ("Gras over zand", '
      + '"Gras over kasseien", "Zand over kasseien", "Gras aan water" of "Heide over gras") en schilder met de '
      + 'bovenste kleur over de onderste: Tiled kiest zelf de hoektegel. Vul een vlak met de onderste kleur van '
      + 'dezelfde set, niet met de stempel uit grond.tsx, dan sluit alles aan. De zes brugtegels staan na de vier '
      + 'oudste terreinsets en horen niet bij een terreinset: leg begin, dan zoveel midden als je beek breed is, '
      + 'dan eind.');

  console.log(`rand.png  ${uit.vel.b}×${uit.vel.h}  (${v.platen.length} tegels)`);
  console.log(`  vlakken     ${VLAKKEN.length} × ${VARIANTEN_VLAK}`);
  for (const p of PAREN) console.log(`  ${p.naam.padEnd(20)} 14 × ${VARIANTEN_RAND} randen`);
  console.log(`  brug        2 × ${BRUG_STUKKEN.length}`);
  console.log(`  vlakken erbij ${VLAKKEN_ACHTERAAN.length} × ${VARIANTEN_VLAK}  (achteraan, zie "4. heide")`);
  for (const p of PAREN_ACHTERAAN) console.log(`  ${p.naam.padEnd(20)} 14 × ${VARIANTEN_RAND} randen  (achteraan)`);
  // tiles en sets gaan mee terug, zodat randtegels-proef.cjs de tegels kan kiezen zoals Tiled dat
  // doet — op wangid uit de terreinset — in plaats van tegelnummers na te rekenen.
  return uit;
}

// ---------------------------------------------------------------- het vel van het eiland
//
// De zee, het strand, het veen en het broek met hun overgangen (werklijst vraag 117, B van 2a; Marcel, 8 okt: "A. Ja,
// lijkt mij goed"): een eigen vel, tegels/kust.png, zodat geen tegelnummer van rand.png verschuift. Het gras en de heide
// staan er zelf ook op, want een terreinset in Tiled kent alleen de tegels van zijn eigen vel.
const VLAKKEN_KUST = ['zee', 'strand', 'veen', 'broek', 'gras', 'heide'];
const PAREN_KUST = [
  { naam: 'Strand aan zee', a: 'zee', b: 'strand' },
  { naam: 'Gras over strand', a: 'strand', b: 'gras' },
  { naam: 'Heide over strand', a: 'strand', b: 'heide' },
  { naam: 'Veen over gras', a: 'gras', b: 'veen' },
  { naam: 'Broek over gras', a: 'gras', b: 'broek' },
];

// Met `schrijf` naar tegels/kust.png en kust.tsx; zonder alleen de plaat (voor de proefplaat).
function bouwKust(o = {}) {
  meetPlekken(VLAKKEN_KUST);
  const v = nieuwVel();
  for (const naam of VLAKKEN_KUST) v.voegVlakToe(naam);
  for (const paar of PAREN_KUST) v.voegPaarToe(paar);
  const uit = legVel(v, o.schrijf ? 'kust' : null, 'De grond van het eiland: de zee, het strand (ook voor de duinen en het '
    + 'stuifzand), het veen en het broek, met het gras en de heide. Kies in het paneel Terreinen een terreinset ("Strand '
    + 'aan zee", "Gras over strand", "Heide over strand", "Veen over gras" of "Broek over gras") en schilder met de '
    + 'bovenste kleur over de onderste.');
  console.log(`kust  ${uit.vel.b}×${uit.vel.h}  (${v.platen.length} tegels: ${VLAKKEN_KUST.length} × ${VARIANTEN_VLAK} vlak, `
    + `${PAREN_KUST.length} × 14 × ${VARIANTEN_RAND} randen)`);
  return uit;
}

if (require.main === module) {
  if (process.argv[2] === 'kust') bouwKust({ schrijf: true });
  else bouw();
}
module.exports = { bouw, bouwKust, randKaart, rasterTegel, plekken };
