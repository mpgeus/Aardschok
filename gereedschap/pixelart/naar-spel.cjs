// Zet de HD-pixel art klaar voor het spel: alleen wat het spel echt tekent, in `beelden/`.
// De rest van uit/ (overzichtsplaten, portretten, proefjes) blijft buiten git.
//
//   node gereedschap/pixelart/naar-spel.cjs      (of: npm run pixelart:spel)
//   node gereedschap/pixelart/naar-spel.cjs --alleen heer,soldaat,inner
//   node gereedschap/pixelart/naar-spel.cjs --alleen schandpaal
//
// Met --alleen werkt het alleen de genoemde figuren bij: het leest de bestaande
// beelden/beschrijving.json, zet die figuren erin (erbij, of in de plaats van wat er stond),
// kopieert hun vellen en schrijft .json en .js allebei terug. Muren, trap, graan, vloeren en
// voorwerpen blijven zoals ze zijn en worden niet opnieuw gerenderd. Dat is nodig omdat uit/ niet
// in git staat: in een verse kopie is het (bijna) leeg, en zonder --alleen bouwt dit script de
// beschrijving opnieuw op uit wat daar staat — dan verdwijnen alle andere figuren uit het spel.
// Een los vel dat hier zelf gerenderd wordt en niets uit uit/ nodig heeft (LOSSE_VELLEN: de
// schandpaal) kan ook met --alleen: dan wordt alleen dat vel gerenderd en alleen zijn ingang gezet.
//
// Twee soorten werk:
//  - kopiëren: de animatievellen van de figuren en hun JSON, de vloeren en de voorwerpen.
//    Die komen uit `npm run pixelart` en `npm run pixelart:animaties`.
//  - renderen: de muurstukken en de spiraaltrap. Die van hd-muren.png hebben een strook zandvloer voor zich,
//    en dat zou over de vloer van het spel heen liggen. Hier komen ze zonder vloer, in beide
//    richtingen (noord- en westmuur), met een deur open, dicht en op slot, en met een laag
//    muurtje voor de weggesneden voorrand.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Kamers = require('./kamers.cjs');
const Trap = require('./trap.cjs');
const Graan = require('./graan-vel.cjs');
const Schandpaal = require('./schandpaal.cjs');

const UIT = path.join(__dirname, 'uit');
const BEELDEN = path.join(__dirname, '..', '..', 'beelden');
const FIGUREN = path.join(BEELDEN, 'figuren');

// ---------------------------------------------------------------- muurstukken

// Eén cel past om beide richtingen heen: een noordmuur steekt naar rechts uit het anker, een
// westmuur naar links, en beide 128 pixels omhoog. Het anker is het midden van de tegel die
// vóór de muur ligt, op vloerhoogte — precies wat T.naarScherm in het spel teruggeeft.
const CEL = [100, 160];
const ANKER = [50, 156];

const DECOS = {
  muur: () => null,
  deur: () => Kamers.deurDeco(false),
  slot: () => Kamers.deurDeco(true),
  doorgang: (west) => Kamers.doorgangDeco(west),
  raam: () => Kamers.raamDeco(),
  wandkleed: () => Kamers.wandkleedDeco(),
  scheur: () => Kamers.scheurDeco([[9, 127], [11, 116], [8, 106], [12, 96], [9, 86], [13, 76]], 2),
  lamp: () => null,
  rek: () => null,
};
const KOLOMMEN = Object.keys(DECOS);
const RIJEN = ['noord', 'west'];

// Een muurstuk van één tegel breed, zonder vloer eronder: het spel tekent de vloer zelf.
function muurstuk(soort, west, zaad) {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  const deco = DECOS[soort](west);
  const tex = Kamers.muurTex({ deco: deco ? (west ? { x: { 0: deco } } : { y: { 0: deco } }) : null, zaad });
  const doos = west
    ? K.doos(-1, -0.5, -0.5, 0.5, 0, Kamers.MUUR_H, tex)
    : K.doos(-0.5, -1, 0.5, -0.5, 0, Kamers.MUUR_H, tex);
  K.tekenDozen(B, [doos]);
  // De lamp en het rek hangen aan de muur: modellen, geen textuur.
  const V = require('./voorwerpen.cjs');
  // Een noordmuur kijkt naar het zuidwesten, een westmuur naar het zuidoosten: daar hangt
  // wat eraan hangt ook naar toe.
  const kant = west ? { gx: -0.5, gy: 0, richting: 'ZO' } : { gx: 0, gy: -0.5, richting: 'ZW' };
  if (soort === 'lamp') K.tekenModel(B, V.wandlamp(), kant);
  if (soort === 'rek') K.tekenModel(B, V.wandrek(1), kant);
  K.belicht(B, { omgeving: () => -0.4 });
  K.verwarm(B, 2);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// Het lage muurtje van de weggesneden voorrand: een hele tegel breed, 22 pixels hoog.
function laagstuk() {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  K.tekenDozen(B, [K.doos(-0.5, -0.5, 0.5, 0.5, 0, Kamers.LAAG_H, Kamers.muurTex({ zaad: 8, buiten: true }))]);
  K.belicht(B, { omgeving: () => -0.4 });
  K.verwarm(B, 2);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

function muren() {
  const vel = new K.Plaat(CEL[0] * KOLOMMEN.length, CEL[1] * (RIJEN.length + 1));
  RIJEN.forEach((rij, r) => {
    KOLOMMEN.forEach((soort, k) => {
      vel.plak(muurstuk(soort, rij === 'west', 5 + k), k * CEL[0], r * CEL[1]);
    });
  });
  vel.plak(laagstuk(), 0, RIJEN.length * CEL[1]);
  schrijf('muren.png', vel);
  return {
    bestand: 'muren.png',
    cel: CEL,
    anker: ANKER,
    kolommen: KOLOMMEN,
    rijen: [...RIJEN, 'laag'],
    laagHoogte: Kamers.LAAG_H,
    hoogte: Kamers.MUUR_H,
  };
}

// ---------------------------------------------------------------- de spiraaltrap

// Een rij per soort (de trap omhoog en het gat in de vloer), een kolom per staat. Zie
// trap.cjs voor de maten: de trap beslaat drie bij drie tegels, met zijn voorste hoek op de
// tegel waar het voorwerp staat — daar valt ook het anker.
function trap() {
  schrijf('trap.png', Trap.vel());
  return {
    bestand: 'trap.png',
    cel: Trap.CEL,
    anker: Trap.ANKER,
    tegels: Trap.TEGELS,
    soorten: Object.keys(Trap.SOORTEN),
    staten: Trap.STATEN,
  };
}

// ---------------------------------------------------------------- het graan
//
// Het akkervel zelf komt uit graan-vel.cjs (geploegd/kiemend/gemaaid als losse tegel per variant,
// groen/rijp als achter/voorlaag per variant en windbeeld); hier alleen wegschrijven, zoals
// muren() en trap() hierboven. js/akkers.js kiest per tegel het stadium, de variant en het
// windbeeld; js/sprites.js (S.graanTegel/S.graanLaag) zoekt het plaatje er hiermee bij op.
function graan() {
  const { plaat, stadia } = Graan.vel();
  schrijf('graan.png', plaat);
  return { bestand: 'graan.png', varianten: Graan.VARIANTEN, stadia };
}

// ---------------------------------------------------------------- de schandpaal
//
// Eén rij: de paal leeg, de paal bezet, en het halsijzer dat over wie eraan staat heen komt
// (schandpaal.cjs, ontwerp/beeld.md). js/sprites.js zoekt ze op met S.schandpaal(deel) en weet met
// S.nekHoogte waar het halsijzer komt; js/tekenen.js tekent ze.
function schandpaal() {
  schrijf('schandpaal.png', Schandpaal.vel());
  return Schandpaal.beschrijving('schandpaal.png');
}

// Losse vellen die --alleen ook kent, naast de figuren: ze worden hier gerenderd, niet gekopieerd
// uit uit/, en geven hun ingang in de beschrijving terug.
const LOSSE_VELLEN = { schandpaal };

// ---------------------------------------------------------------- kopiëren

function kopieer(vanaf, naar) {
  if (!fs.existsSync(vanaf)) {
    console.error(`ontbreekt: ${path.relative(process.cwd(), vanaf)} — draai eerst npm run pixelart(:animaties)`);
    process.exitCode = 1;
    return false;
  }
  fs.copyFileSync(vanaf, naar);
  return true;
}

function schrijf(naam, plaat) {
  fs.writeFileSync(path.join(BEELDEN, naam), K.png(plaat, 1));
}

// Van elke figuur alleen de houdingen die het spel gebruikt; de losse -zo-plaatjes en de
// overzichtsstroken blijven in uit/. `map` zegt waar de vellen vandaan komen: de bosvijanden
// worden door een eigen script gerenderd (bosvijanden-anim.cjs) en staan dus ergens anders.
const FIGUURLIJST = {
  tovenaar: { houdingen: ['staan', 'lopen-84', 'lopen-92', 'lopen-99', 'slaan', 'spreuk', 'geraakt', 'sterven'] },
  wim: { houdingen: ['staan', 'lopen', 'praten', 'vegen'] },
  skelet: { houdingen: ['staan', 'lopen', 'aanval', 'geraakt', 'sterven'] },
  slijm: { houdingen: ['staan', 'lopen', 'aanval', 'geraakt', 'sterven'] },
  // De oude meester, bij zijn moestuin op het erf (T.WEZENS.meester, js/wereld.js).
  meester: { houdingen: ['staan', 'lopen', 'slaan', 'spreuk', 'geraakt', 'sterven'] },
  // Buiten, op het erf en in het bos. Alles wat Marcel in Tiled kan neerzetten, moet het spel ook
  // kunnen tekenen; deze drie staan in T.WEZENS (js/wereld.js) onder dezelfde naam als hier, want
  // js/sprites.js zoekt het figuur op de soort van het wezen op.
  wolf: { map: ['vijanden', 'animaties'], houdingen: ['staan', 'lopen', 'aanval', 'geraakt', 'sterven'], bron: 'bosvijanden-anim.cjs' },
  reuzenspin: { map: ['vijanden', 'animaties'], houdingen: ['staan', 'lopen', 'aanval', 'geraakt', 'sterven'], bron: 'bosvijanden-anim.cjs' },
  kobold: { map: ['vijanden', 'animaties'], houdingen: ['staan', 'lopen', 'aanval', 'geraakt', 'sterven'], bron: 'bosvijanden-anim.cjs' },
  // De smid, en de eerste twee vellen van de gewone dorpeling(zaad) (fase A, ontwerp/werklijst.md
  // punt 2): T.WEZENS.smid (js/wereld.js) staat op "smid", en een dorpeling kiest tussen
  // "dorpeling0" en "dorpeling1" met zijn zaad (js/sprites.js, S.dorpelingVariant). Fase B2a
  // rendert er elf meer met dezelfde manier (dorpelingen.cjs, "lopen en staan"), elk met een
  // eigen T.WEZENS-ingang zoals smid; de zeven vaklieden en meer gewone varianten volgen in B2b.
  smid: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  dorpeling0: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  dorpeling1: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  herbergierster: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  boer: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  dorpsoudste: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  jongen: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  meisje: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  kleuter: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  smidsvrouw: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  boerin: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  bruidegom: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  bruid: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  oudeman: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs' },
  // De boer met de zeis, in de oogsttijd (T.werkOogstBij, js/akkers.js): één houding, "maaien",
  // die een boer of boerin zolang leent voor hij weer zichzelf is (js/sprites.js, S.houding).
  maaier: { map: ['maaier', 'animaties'], houdingen: ['maaien'], bron: 'maaier-anim.cjs' },
  // Het huis van de heer (heer.cjs, ontwerp/beeld.md): ze komen over de weg (js/heer.js,
  // js/inner.js) en staan in T.MENSEN (js/mensen.js) onder dezelfde naam als hier.
  heer: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs heer soldaat inner' },
  soldaat: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs heer soldaat inner' },
  inner: { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs heer soldaat inner' },
  // Een gezicht per karakter (karakters.cjs, ontwerp/beeld.md): een boer met zijn karakter, op het
  // lijf van de boer of de boerin. js/sprites.js kiest <vel>-<karakter> als dat vel er is, en anders
  // het gewone boer- of boerinvel. Ronde 1: de vijf van de vaste verdeling; ronde 2: de andere vijf.
  'boer-zanger': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boer-zanger' },
  'boerin-zanger': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-zanger' },
  'boer-woekeraar': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boer-woekeraar' },
  'boerin-woekeraar': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-woekeraar' },
  'boer-heethoofd': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boer-heethoofd' },
  'boerin-heethoofd': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-heethoofd' },
  'boerin-weduwe': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-weduwe' },
  'boerin-vroedvrouw': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-vroedvrouw' },
  'boer-vrome': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boer-vrome' },
  'boerin-vrome': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-vrome' },
  'boer-roddelaar': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boer-roddelaar' },
  'boerin-roddelaar': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-roddelaar' },
  'boer-grijsaard': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boer-grijsaard' },
  'boerin-grijsaard': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-grijsaard' },
  'boer-nieuwkomer': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boer-nieuwkomer' },
  'boerin-nieuwkomer': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-nieuwkomer' },
  'boer-drinker': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boer-drinker' },
  'boerin-drinker': { map: ['dorpelingen', 'animaties'], houdingen: ['staan', 'lopen'], bron: 'dorpelingen-anim.cjs boerin-drinker' },
};

// Eén figuur: zijn vellen naar beelden/figuren/ en zijn beschrijving terug (of null als hij er
// in uit/ niet is).
function figuur(naam, opzet) {
  const map = path.join(UIT, ...(opzet.map || ['animaties']));
  const bron = path.join(map, `${naam}.json`);
  if (!fs.existsSync(bron)) {
    console.error(`ontbreekt: ${naam}.json — draai eerst ${opzet.bron ? `node gereedschap/pixelart/${opzet.bron}` : 'npm run pixelart:animaties'}`);
    process.exitCode = 1;
    return null;
  }
  const beschrijving = JSON.parse(fs.readFileSync(bron, 'utf8'));
  const gekozen = {};
  for (const h of opzet.houdingen) {
    const o = beschrijving.houdingen[h];
    if (!o) continue;
    if (!kopieer(path.join(map, o.bestand), path.join(FIGUREN, o.bestand))) continue;
    // `stap` (hoeveel tegels één pas is) houdt de voeten op de grond: js/sprites.js leidt de
    // fase van de loopcyclus af uit de afgelegde afstand, niet uit de klok. Niet elk script
    // schrijft hem, dus reken hem hier uit de snelheid waarvoor de cyclus gemaakt is: twee
    // passen per cyclus.
    if (h === 'lopen' && o.stap == null && beschrijving.snelheid) {
      gekozen[h] = { ...o, stap: Math.round((beschrijving.snelheid * (o.beelden / o.fps)) / 2 * 100) / 100 };
      continue;
    }
    gekozen[h] = o;
  }
  beschrijving.houdingen = gekozen;
  return beschrijving;
}

function figuren(namen = Object.keys(FIGUURLIJST)) {
  const uit = {};
  for (const naam of namen) {
    const b = figuur(naam, FIGUURLIJST[naam]);
    if (b) uit[naam] = b;
  }
  return uit;
}

// beschrijving.json, en hetzelfde als script (beschrijving.js)
function schrijfBeschrijving(beschrijving) {
  const json = JSON.stringify(beschrijving, null, 1);
  fs.writeFileSync(path.join(BEELDEN, 'beschrijving.json'), json + '\n');
  // Dezelfde gegevens als gewoon script, want fetch mag niet vanaf file://. Zo werkt
  // index.html los openen ook met sprites erin.
  fs.writeFileSync(
    path.join(BEELDEN, 'beschrijving.js'),
    '// Gemaakt door gereedschap/pixelart/naar-spel.cjs — niet met de hand bijwerken.\n' +
      '// Dezelfde inhoud als beschrijving.json, als script, zodat file:// het ook kan lezen.\n' +
      '(function (T) {\n  T.BEELDEN = ' +
      json.replace(/\n/g, '\n  ') +
      ';\n})(globalThis.Toren = globalThis.Toren || {});\n',
  );
}

// --alleen a,b,c (of --alleen=a,b,c): alleen deze figuren of losse vellen bijwerken, zie bovenaan
function alleenGevraagd() {
  const i = process.argv.findIndex((a) => a === '--alleen' || a.startsWith('--alleen='));
  if (i < 0) return null;
  const a = process.argv[i];
  const lijst = a.includes('=') ? a.slice(a.indexOf('=') + 1) : process.argv[i + 1] || '';
  return lijst.split(',').map((n) => n.trim()).filter(Boolean);
}

// Alleen de genoemde figuren en losse vellen in de bestaande beschrijving zetten. De volgorde van
// de figuren blijft die van FIGUURLIJST, zoals een volledige ronde hem ook zou schrijven; een los
// vel krijgt zijn eigen ingang (erbij, of in de plaats van wat er stond). Wat er stond en niet
// genoemd is, blijft letterlijk staan.
function alleenBijwerken(namen) {
  const onbekend = namen.filter((n) => !FIGUURLIJST[n] && !LOSSE_VELLEN[n]);
  if (!namen.length || onbekend.length) {
    console.error(`--alleen: ${namen.length ? `onbekend: ${onbekend.join(', ')}` : 'niets genoemd'}. Kies uit: ${[...Object.keys(FIGUURLIJST), ...Object.keys(LOSSE_VELLEN)].join(', ')}.`);
    process.exitCode = 1;
    return;
  }
  const pad = path.join(BEELDEN, 'beschrijving.json');
  if (!fs.existsSync(pad)) {
    console.error('--alleen: beelden/beschrijving.json ontbreekt, draai eerst zonder --alleen');
    process.exitCode = 1;
    return;
  }
  const beschrijving = JSON.parse(fs.readFileSync(pad, 'utf8'));
  const figuurNamen = namen.filter((n) => FIGUURLIJST[n]);
  if (figuurNamen.length) {
    const nieuw = figuren(figuurNamen);
    const mist = figuurNamen.filter((n) => !nieuw[n]);
    if (mist.length) {
      console.error(`--alleen: niets geschreven, want ${mist.join(', ')} ontbreekt in uit/`);
      process.exitCode = 1;
      return;
    }
    const oud = beschrijving.figuren || {};
    const samen = {};
    for (const naam of Object.keys(FIGUURLIJST)) {
      if (nieuw[naam]) samen[naam] = nieuw[naam];
      else if (oud[naam]) samen[naam] = oud[naam];
    }
    for (const [naam, f] of Object.entries(oud)) if (!samen[naam]) samen[naam] = f;
    beschrijving.figuren = samen;
  }
  for (const naam of namen.filter((n) => LOSSE_VELLEN[n])) beschrijving[naam] = LOSSE_VELLEN[naam]();
  schrijfBeschrijving(beschrijving);
  console.log(`bijgewerkt: ${namen.join(', ')}`);
}

// ---------------------------------------------------------------- opbouwen

fs.mkdirSync(FIGUREN, { recursive: true });

const ALLEEN = alleenGevraagd();
if (ALLEEN) alleenBijwerken(ALLEEN);
else alles();

// Alles opnieuw: figuren, muren, trap, graan, vloeren, voorwerpen en de losse vellen.
function alles() {
  const beschrijving = {
    // Alles is gerenderd in dezelfde projectie als het spel: een tegel is 64×32 en het anker
    // van een cel is het midden van zijn tegel, op vloerhoogte.
    tegel: [64, 32],
    figuren: figuren(),
    muren: muren(),
    trap: trap(),
    graan: graan(),
    vloeren: {
      bestand: 'vloeren.png',
      // Elke cel is een lap van twee bij twee tegels; het anker is het midden van tegel (0, 0).
      cel: [144, 88],
      anker: [72, 22],
      soorten: { zand: 0, hout: 1 },
    },
    voorwerpen: {
      bestand: 'voorwerpen.png',
      cel: [88, 112],
      anker: [44, 90],
      namen: ['tafel', 'fontein', 'kist', 'ton', 'zak', 'puin', 'sleutel', 'vuurschicht'],
    },
  };
  for (const [naam, maak] of Object.entries(LOSSE_VELLEN)) beschrijving[naam] = maak();
  kopieer(path.join(UIT, 'hd-vloeren.png'), path.join(BEELDEN, 'vloeren.png'));
  kopieer(path.join(UIT, 'hd-voorwerpen.png'), path.join(BEELDEN, 'voorwerpen.png'));
  schrijfBeschrijving(beschrijving);
}

// (na een fout bij --alleen is er niets geschreven, en dus ook niets klaar)
if (!ALLEEN || !process.exitCode) {
  let totaal = 0;
  for (const map of [BEELDEN, FIGUREN]) {
    for (const f of fs.readdirSync(map)) {
      const p = path.join(map, f);
      if (fs.statSync(p).isDirectory()) continue;
      totaal += fs.statSync(p).size;
    }
  }
  console.log(`beelden/ klaar: ${Math.round(totaal / 1024)} kB`);
}
