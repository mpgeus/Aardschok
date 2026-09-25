'use strict';
// Schrijft de loop- en staan-animaties van de dorpelingen weg, op dezelfde manier als
// bosvijanden-anim.cjs: per figuur per houding één vel (rijen zijn de acht richtingen
// Z ZW W NW N NO O ZO, kolommen de beelden) en een JSON met de maten en de loopsnelheid.
// Fase A (ontwerp/werklijst.md, punt 2): alleen de smid en twee gewone dorpelingen (dorpeling0 =
// man, dorpeling1 = vrouw). Fase B2a voegt de andere elf genoemde dorpelingen toe (herbergierster,
// boer en dorpsoudste uit dorpelingen.cjs; de acht uit dorpelingen2.cjs), met dezelfde manier (zie
// dorpelingen.cjs, "lopen en staan"). De zeven vaklieden en meer gewone varianten volgen in B2b.
// Het huis van de heer (heer.cjs, 24 sep 2026): de heer, de soldaat en de inner, op dezelfde manier.
//   uit/dorpelingen/animaties/<naam>.json          { naam, cel, anker, snelheid, richtingen, houdingen }
//   uit/dorpelingen/animaties/<naam>-<houding>.png de vellen die naar-spel.cjs kopieert
//   uit/dorpelingen/lopen-proef.png                 de proefplaat om te beoordelen: de drie naast
//                                                    Wim, in Z en ZO, een paar loopbeelden op een rij
//   uit/dorpelingen/lopen-proef-b2a.png             de proefplaat van fase B2a: de elf nieuwe, in
//                                                    ZO, vier loopbeelden elk, in twee kolommen
//   uit/dorpelingen/huis-van-de-heer.png            de heer, de soldaat en de inner naast de boer,
//                                                    in Z en ZO, staand en twee loopbeelden elk
//   uit/dorpelingen/karakters-ronde1.png            de acht karakters van ronde 1 naast de gewone
//                                                    boer en boerin, op 1× (karakters.cjs)
//   uit/dorpelingen/karakters-ronde2.png            de tien van ronde 2, net zo
//   uit/dorpelingen/karakters-alle.png              alle achttien op een rij, staand in ZO
//
//   node gereedschap/pixelart/dorpelingen-anim.cjs                      (alle figuren)
//   node gereedschap/pixelart/dorpelingen-anim.cjs heer soldaat inner   (alleen deze)
//
// Met namen erachter rendert het alleen die figuren (een figuur is zo'n minuut werk), en
// maakt het alleen de proefplaten waarvan alle figuren in deze ronde meegingen.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const {
  smid, SMID_SNELHEID, SMID_FPS,
  herbergierster, HERBERGIERSTER_SNELHEID, HERBERGIERSTER_FPS,
  boer, BOER_SNELHEID, BOER_FPS,
  dorpsoudste, DORPSOUDSTE_SNELHEID, DORPSOUDSTE_FPS,
} = require('./dorpelingen.cjs');
const { dorpeling, DORPELING_SNELHEID } = require('./dorpelingen3.cjs');
const {
  jongen, JONGEN_SNELHEID, JONGEN_FPS,
  meisje, MEISJE_SNELHEID, MEISJE_FPS,
  kleuter, KLEUTER_SNELHEID, KLEUTER_FPS,
  smidsvrouw, SMIDSVROUW_SNELHEID, SMIDSVROUW_FPS,
  boerin, BOERIN_SNELHEID, BOERIN_FPS,
  bruidegom, BRUIDEGOM_SNELHEID, BRUIDEGOM_FPS,
  bruid, BRUID_SNELHEID, BRUID_FPS,
  oudeMan, OUDEMAN_SNELHEID, OUDEMAN_FPS,
} = require('./dorpelingen2.cjs');
const {
  heer, HEER_SNELHEID, HEER_FPS,
  soldaat, SOLDAAT_SNELHEID, SOLDAAT_FPS,
  inner, INNER_SNELHEID, INNER_FPS,
} = require('./heer.cjs');
const { KARAKTERS } = require('./karakters.cjs');
const F = require('./figuren2.cjs'); // Wim, alleen voor de proefplaat hieronder

const UIT = path.join(__dirname, 'uit', 'dorpelingen');
const UIT_ANIM = path.join(UIT, 'animaties');
fs.mkdirSync(UIT_ANIM, { recursive: true });

const CEL = 112;
const HOOG = 124;
const ANKER = [56, 110];

// Fase A: drie figuren (smid, dorpeling0/1), telkens dezelfde manier (dorpelingen.cjs).
// dorpeling0/1 zijn de eerste twee van de "aantal gerenderde varianten" waar js/sprites.js straks
// zaad % aantal op doet. Fase B2a: de andere elf genoemde dorpelingen, elk met zijn eigen
// loopmaat (snelheid moet gelijk zijn aan T.WEZENS.<naam>.snelheid in js/wereld.js, anders gaan
// de voeten glijden — zie de uitleg bij DORPSOUDSTE_FPS in dorpelingen.cjs). fps is voor bijna
// iedereen 10: alleen de snelheid maakt een figuur trager. De uitzondering is de heer, die op zijn
// korte beentjes trippelt (HEER_FPS, heer.cjs): de fps van een figuur gaat daarom mee in zijn
// loopvel, en `stap` wordt ermee uitgerekend, zodat zijn voeten toch niet glijden. Voor wie op 10
// staat, verandert daardoor niets.
const FIGUREN = [
  { naam: 'smid', snelheid: SMID_SNELHEID, fps: SMID_FPS, maak: (stand) => smid(stand) },
  { naam: 'dorpeling0', snelheid: DORPELING_SNELHEID, maak: (stand) => dorpeling(0, { geslacht: 'man' }, stand) },
  { naam: 'dorpeling1', snelheid: DORPELING_SNELHEID, maak: (stand) => dorpeling(1, { geslacht: 'vrouw' }, stand) },
  { naam: 'herbergierster', snelheid: HERBERGIERSTER_SNELHEID, fps: HERBERGIERSTER_FPS, maak: (stand) => herbergierster(stand) },
  { naam: 'boer', snelheid: BOER_SNELHEID, fps: BOER_FPS, maak: (stand) => boer(stand) },
  { naam: 'dorpsoudste', snelheid: DORPSOUDSTE_SNELHEID, fps: DORPSOUDSTE_FPS, maak: (stand) => dorpsoudste(stand) },
  { naam: 'jongen', snelheid: JONGEN_SNELHEID, fps: JONGEN_FPS, maak: (stand) => jongen(stand) },
  { naam: 'meisje', snelheid: MEISJE_SNELHEID, fps: MEISJE_FPS, maak: (stand) => meisje(stand) },
  { naam: 'kleuter', snelheid: KLEUTER_SNELHEID, fps: KLEUTER_FPS, maak: (stand) => kleuter(stand) },
  { naam: 'smidsvrouw', snelheid: SMIDSVROUW_SNELHEID, fps: SMIDSVROUW_FPS, maak: (stand) => smidsvrouw(stand) },
  { naam: 'boerin', snelheid: BOERIN_SNELHEID, fps: BOERIN_FPS, maak: (stand) => boerin(stand) },
  { naam: 'bruidegom', snelheid: BRUIDEGOM_SNELHEID, fps: BRUIDEGOM_FPS, maak: (stand) => bruidegom(stand) },
  { naam: 'bruid', snelheid: BRUID_SNELHEID, fps: BRUID_FPS, maak: (stand) => bruid(stand) },
  { naam: 'oudeman', snelheid: OUDEMAN_SNELHEID, fps: OUDEMAN_FPS, maak: (stand) => oudeMan(stand) },
  // het huis van de heer (heer.cjs); de snelheden zijn die van T.MENSEN in js/mensen.js
  { naam: 'heer', snelheid: HEER_SNELHEID, fps: HEER_FPS, maak: (stand) => heer(stand) },
  { naam: 'soldaat', snelheid: SOLDAAT_SNELHEID, fps: SOLDAAT_FPS, maak: (stand) => soldaat(stand) },
  { naam: 'inner', snelheid: INNER_SNELHEID, fps: INNER_FPS, maak: (stand) => inner(stand) },
  // Een gezicht per karakter (karakters.cjs, ontwerp/beeld.md, 25 sep 2026): een boer met zijn
  // karakter, op het lijf van de boer of van de boerin, met de snelheid en fps van dat lijf (een
  // boer loopt even hard, welk karakter hij ook loot). Ronde 1: de vijf van de vaste verdeling.
  { naam: 'boer-zanger', snelheid: BOER_SNELHEID, fps: BOER_FPS, maak: (stand) => boer(stand, KARAKTERS.zanger.boer) },
  { naam: 'boerin-zanger', snelheid: BOERIN_SNELHEID, fps: BOERIN_FPS, maak: (stand) => boerin(stand, KARAKTERS.zanger.boerin) },
  { naam: 'boer-woekeraar', snelheid: BOER_SNELHEID, fps: BOER_FPS, maak: (stand) => boer(stand, KARAKTERS.woekeraar.boer) },
  { naam: 'boerin-woekeraar', snelheid: BOERIN_SNELHEID, fps: BOERIN_FPS, maak: (stand) => boerin(stand, KARAKTERS.woekeraar.boerin) },
  { naam: 'boer-heethoofd', snelheid: BOER_SNELHEID, fps: BOER_FPS, maak: (stand) => boer(stand, KARAKTERS.heethoofd.boer) },
  { naam: 'boerin-heethoofd', snelheid: BOERIN_SNELHEID, fps: BOERIN_FPS, maak: (stand) => boerin(stand, KARAKTERS.heethoofd.boerin) },
  { naam: 'boerin-weduwe', snelheid: BOERIN_SNELHEID, fps: BOERIN_FPS, maak: (stand) => boerin(stand, KARAKTERS.weduwe.boerin) },
  { naam: 'boerin-vroedvrouw', snelheid: BOERIN_SNELHEID, fps: BOERIN_FPS, maak: (stand) => boerin(stand, KARAKTERS.vroedvrouw.boerin) },
  // Ronde 2: de andere vijf, op beide lijven. Ook de oudste loopt zo hard als zijn lijf: de
  // loopsnelheid in het spel hangt aan de boer, niet aan zijn karakter.
  ...['vrome', 'roddelaar', 'grijsaard', 'nieuwkomer', 'drinker'].flatMap((k) => [
    { naam: `boer-${k}`, snelheid: BOER_SNELHEID, fps: BOER_FPS, maak: (stand) => boer(stand, KARAKTERS[k].boer) },
    { naam: `boerin-${k}`, snelheid: BOERIN_SNELHEID, fps: BOERIN_FPS, maak: (stand) => boerin(stand, KARAKTERS[k].boerin) },
  ]),
];
// Alleen de figuren die op de opdrachtregel staan, of anders allemaal.
const GEVRAAGD = process.argv.slice(2);
const onbekend = GEVRAAGD.filter((n) => !FIGUREN.some((f) => f.naam === n));
if (onbekend.length) {
  console.error(`Onbekende figuur: ${onbekend.join(', ')}. Kies uit: ${FIGUREN.map((f) => f.naam).join(', ')}.`);
  process.exit(1);
}
const TE_RENDEREN = GEVRAAGD.length ? FIGUREN.filter((f) => GEVRAAGD.includes(f.naam)) : FIGUREN;
const HOUDINGEN = [
  { naam: 'staan', beelden: 4, fps: 4, herhaal: true },
  { naam: 'lopen', beelden: 8, fps: 10, herhaal: true },
];

// de rand van wat er in een cel staat, om te zien of een beeld tegen de cel aan komt
function kader(p) {
  let x0 = p.b, x1 = -1, y0 = p.h, y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { x0, x1, y0, y1 };
}

let klem = false;
const gerendered = {}; // naam -> { staan: Plaat[8*4-per-kant...], lopen: {...} } — voor de proefplaat
for (const fig of TE_RENDEREN) {
  const houdingen = {};
  gerendered[fig.naam] = {};
  for (const H of HOUDINGEN) {
    const vel = new K.Plaat(CEL * H.beelden, HOOG * K.KANTEN.length);
    const perKant = {}; // richting -> Plaat[beelden], voor de proefplaat (alleen Z/ZO gebruikt)
    for (let i = 0; i < H.beelden; i++) {
      const fase = i / H.beelden;
      const m = fig.maak({ houding: H.naam, fase });
      K.KANTEN.forEach((kant, r) => {
        const p = K.losRenderen(m, { b: CEL, h: HOOG, anker: ANKER, richting: kant });
        vel.plak(p, i * CEL, r * HOOG);
        (perKant[kant] || (perKant[kant] = [])).push(p);
        const k = kader(p);
        if (k.x1 >= 0 && (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= CEL - 1 || k.y1 >= HOOG - 1)) {
          console.log(`  RAND ${fig.naam} ${H.naam} beeld ${i} ${kant}: ${k.x0}..${k.x1}, ${k.y0}..${k.y1} in ${CEL}×${HOOG}`);
          klem = true;
        }
      });
    }
    gerendered[fig.naam][H.naam] = perKant;
    const bestand = `${fig.naam}-${H.naam}.png`;
    fs.writeFileSync(path.join(UIT_ANIM, bestand), K.png(vel, 1));
    // lopen: de fps van de figuur zelf (zie FIGUREN hierboven), want daarmee is zijn pas gemaakt
    const fps = H.naam === 'lopen' && fig.fps ? fig.fps : H.fps;
    const regel = { bestand, beelden: H.beelden, fps, herhaal: H.herhaal };
    if (H.naam === 'lopen') {
      regel.snelheid = fig.snelheid;
      regel.stap = +((fig.snelheid * (H.beelden / fps)) / 2).toFixed(3); // tegels per pas
    }
    houdingen[H.naam] = regel;
  }
  const beschrijving = { naam: fig.naam, cel: [CEL, HOOG], anker: ANKER, snelheid: fig.snelheid, richtingen: K.KANTEN, houdingen };
  fs.writeFileSync(path.join(UIT_ANIM, `${fig.naam}.json`), JSON.stringify(beschrijving, null, 2) + '\n');
  console.log(`${fig.naam}: ${Object.keys(houdingen).length} houdingen, ${fig.snelheid} tegels/s`);
}
if (klem) process.exitCode = 1;

// ---------------------------------------------------------------- de proefplaat

// Wim erbij, met zijn eigen bouwfunctie: zo staat een bekende loop naast de nieuwe, om op te
// vergelijken. Alle acht beelden, in Z en ZO (knie: fase B1, 22 sep 2026 — voorheen de helft).
// Alleen als de smid en de twee gewone dorpelingen in deze ronde meegingen.
function proefplaatA() {
  const FASEN = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => i / 8);
  const wimPerKant = { Z: [], ZO: [] };
  for (const fase of FASEN) {
    const m = F.wim({ houding: 'lopen', fase });
    for (const kant of ['Z', 'ZO']) wimPerKant[kant].push(K.losRenderen(m, { b: CEL, h: HOOG, anker: ANKER, richting: kant }));
  }
  const kiesFasen = (perKant) => ({
    Z: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => perKant.Z[i]),
    ZO: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => perKant.ZO[i]),
  });
  const REGELS = [
    { naam: 'wim', kant: wimPerKant },
    { naam: 'smid', kant: kiesFasen(gerendered.smid.lopen) },
    { naam: 'dorpeling0 (man)', kant: kiesFasen(gerendered.dorpeling0.lopen) },
    { naam: 'dorpeling1 (vrouw)', kant: kiesFasen(gerendered.dorpeling1.lopen) },
  ];

  // Bijsnijden op wat er echt staat (zoals dorpelingen-export.cjs voor zijn overzicht doet): een
  // cel is 112×124, een lopende figuur beslaat maar een deel daarvan. Eén gedeelde rand voor alle
  // beelden, zodat de voeten overal op dezelfde hoogte blijven staan.
  let x0 = CEL, x1 = -1, y0 = HOOG, y1 = -1;
  for (const r of REGELS) {
    for (const kant of ['Z', 'ZO']) {
      for (const p of r.kant[kant]) {
        const k = kader(p);
        if (k.x1 < 0) continue;
        x0 = Math.min(x0, k.x0);
        x1 = Math.max(x1, k.x1);
        y0 = Math.min(y0, k.y0);
        y1 = Math.max(y1, k.y1);
      }
    }
  }
  const RAND = 2;
  x0 = Math.max(0, x0 - RAND);
  y0 = Math.max(0, y0 - RAND);
  const BREED = Math.min(CEL, x1 + RAND - x0 + 1);
  const HOOG_UIT = Math.min(HOOG, y1 + RAND - y0 + 1);
  const GAT = 8; // tussen Z en ZO
  const RIJGAT = 4;

  // schaal: twee keer vergroot, tenzij dat de 1400×900 zou overschrijden (dan zo groot als past)
  const breedtePlat = FASEN.length * BREED + GAT + FASEN.length * BREED;
  const hoogtePlat = REGELS.length * HOOG_UIT + (REGELS.length - 1) * RIJGAT;
  const SCHAAL = Math.min(2, Math.floor(Math.min(1400 / breedtePlat, 900 / hoogtePlat) * 100) / 100);

  const vel = new K.Plaat(breedtePlat, hoogtePlat);
  REGELS.forEach((r, rij) => {
    let x = 0;
    const y = rij * (HOOG_UIT + RIJGAT);
    for (const kant of ['Z', 'ZO']) {
      for (const p of r.kant[kant]) {
        vel.plak(p.uitsnede(x0, y0, BREED, HOOG_UIT), x, y);
        x += BREED;
      }
      x += GAT;
    }
  });
  const proef = K.png(vel, SCHAAL, '#2a2236');
  fs.writeFileSync(path.join(UIT, 'lopen-proef.png'), proef);
  console.log(`lopen-proef.png: ${vel.b * SCHAAL}×${vel.h * SCHAAL} (schaal ${SCHAAL})`);
}
if (['smid', 'dorpeling0', 'dorpeling1'].every((n) => gerendered[n])) proefplaatA();

// ---------------------------------------------------------------- fase B2a: proefplaat van de elf

// De elf dorpelingen van deze stap (ontwerp/werklijst.md, punt 2, fase B2a), in ZO, vier van de
// acht loopbeelden elk (om en om, zodat de hele pas te zien is: neerzetten, zwaaien, het andere
// been neerzetten, zwaaien), in twee kolommen zodat de plaat binnen 1400×900 blijft. Los van
// lopen-proef.png hierboven, dat de fase A-vergelijking met Wim blijft.
// Alleen als alle elf in deze ronde meegingen.
const NAMEN_B2A = [
  'herbergierster', 'boer', 'dorpsoudste', 'jongen', 'meisje', 'kleuter',
  'smidsvrouw', 'boerin', 'bruidegom', 'bruid', 'oudeman',
];
function proefplaatB2a() {
  const FRAMES_B2A = [0, 2, 4, 6];
  let bx0 = CEL, bx1 = -1, by0 = HOOG, by1 = -1;
  const platenB2a = {};
  for (const naam of NAMEN_B2A) {
    const rijZO = gerendered[naam].lopen.ZO;
    platenB2a[naam] = FRAMES_B2A.map((i) => rijZO[i]);
    for (const p of platenB2a[naam]) {
      const k = kader(p);
      if (k.x1 < 0) continue;
      bx0 = Math.min(bx0, k.x0);
      bx1 = Math.max(bx1, k.x1);
      by0 = Math.min(by0, k.y0);
      by1 = Math.max(by1, k.y1);
    }
  }
  const RANDB = 2;
  bx0 = Math.max(0, bx0 - RANDB);
  by0 = Math.max(0, by0 - RANDB);
  const BREEDB = Math.min(CEL, bx1 + RANDB - bx0 + 1);
  const HOOGB = Math.min(HOOG, by1 + RANDB - by0 + 1);
  const RIJGATB = 4;
  const KOLGAT = 16;
  const KOLOM = Math.ceil(NAMEN_B2A.length / 2); // rijen per kolom (6, dan 5)
  const breedteB2a = 2 * FRAMES_B2A.length * BREEDB + KOLGAT;
  const hoogteB2a = KOLOM * HOOGB + (KOLOM - 1) * RIJGATB;
  const SCHAALB = Math.min(2, Math.floor(Math.min(1400 / breedteB2a, 900 / hoogteB2a) * 100) / 100);

  const velB2a = new K.Plaat(breedteB2a, hoogteB2a);
  NAMEN_B2A.forEach((naam, idx) => {
    const kol = Math.floor(idx / KOLOM);
    const rij = idx % KOLOM;
    const x = kol * (FRAMES_B2A.length * BREEDB + KOLGAT);
    const y = rij * (HOOGB + RIJGATB);
    platenB2a[naam].forEach((p, i) => velB2a.plak(p.uitsnede(bx0, by0, BREEDB, HOOGB), x + i * BREEDB, y));
  });
  const proefB2a = K.png(velB2a, SCHAALB, '#2a2236');
  fs.writeFileSync(path.join(UIT, 'lopen-proef-b2a.png'), proefB2a);
  console.log(`lopen-proef-b2a.png: ${velB2a.b * SCHAALB}×${velB2a.h * SCHAALB} (schaal ${SCHAALB})`);
}
if (NAMEN_B2A.every((n) => gerendered[n])) proefplaatB2a();

// ---------------------------------------------------------------- het huis van de heer: proefplaat

// De heer, de soldaat en de inner naast de boer, zodat de maat te zien is (ontwerp/beeld.md, "Het
// huis van de heer draagt rood en geel"). Een rij per richting (Z en ZO): eerst de vier staand,
// dan van elk van de drie twee loopbeelden (beeld 0: beide voeten op de grond, het ene been voor;
// beeld 2: het andere been zwaait erlangs). Elke kolom is zo breed als wat erin staat, en alle
// rijen staan op dezelfde voetlijn. Zo groot als binnen 900×400 past, hooguit twee keer (zoals de
// proefplaten hierboven, dus soms met een schaal als 1,75).
// Alleen als de drie in deze ronde meegingen; de boer rendert hier zelf als hij niet meeging.
const HUIS = ['heer', 'soldaat', 'inner'];
function proefplaatHuis() {
  const KANTEN_H = ['Z', 'ZO'];
  const boerStaan = (kant) =>
    gerendered.boer ? gerendered.boer.staan[kant][0] : K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: CEL, h: HOOG, anker: ANKER, richting: kant });
  const groepen = [
    [{ plaat: boerStaan }, ...HUIS.map((naam) => ({ plaat: (kant) => gerendered[naam].staan[kant][0] }))],
    ...HUIS.map((naam) => [0, 2].map((i) => ({ plaat: (kant) => gerendered[naam].lopen[kant][i] }))),
  ];
  // per kolom de platen van beide rijen, en de rand van wat erin staat
  let y0 = HOOG;
  let y1 = -1;
  for (const groep of groepen) {
    for (const kol of groep) {
      kol.platen = KANTEN_H.map((kant) => kol.plaat(kant));
      kol.x0 = CEL;
      kol.x1 = -1;
      for (const p of kol.platen) {
        const k = kader(p);
        if (k.x1 < 0) continue;
        kol.x0 = Math.min(kol.x0, k.x0);
        kol.x1 = Math.max(kol.x1, k.x1);
        y0 = Math.min(y0, k.y0);
        y1 = Math.max(y1, k.y1);
      }
      kol.x0 = Math.max(0, kol.x0 - 3);
      kol.breed = Math.min(CEL - kol.x0, kol.x1 + 3 - kol.x0 + 1);
    }
  }
  y0 = Math.max(0, y0 - 2);
  const hoog = Math.min(HOOG - y0, y1 + 2 - y0 + 1);
  const GROEPGAT = 10;
  const RIJGAT_H = 6;
  const breed = groepen.reduce((som, groep) => som + groep.reduce((s, kol) => s + kol.breed, 0), 0) + GROEPGAT * (groepen.length - 1);
  const plaatHoog = KANTEN_H.length * hoog + (KANTEN_H.length - 1) * RIJGAT_H;
  const schaal = Math.min(2, Math.floor(Math.min(900 / breed, 400 / plaatHoog) * 100) / 100);
  const vel = new K.Plaat(breed, plaatHoog);
  KANTEN_H.forEach((kant, rij) => {
    let x = 0;
    for (const groep of groepen) {
      for (const kol of groep) {
        vel.plak(kol.platen[rij].uitsnede(kol.x0, y0, kol.breed, hoog), x, rij * (hoog + RIJGAT_H));
        x += kol.breed;
      }
      x += GROEPGAT;
    }
  });
  fs.writeFileSync(path.join(UIT, 'huis-van-de-heer.png'), K.png(vel, schaal, '#2a2236'));
  console.log(`huis-van-de-heer.png: ${vel.b * schaal}×${vel.h * schaal} (schaal ${schaal})`);
}
if (HUIS.every((n) => gerendered[n])) proefplaatHuis();

// ---------------------------------------------------------------- een gezicht per karakter: proefplaten

// De karakters (karakters.cjs, ontwerp/beeld.md, "Een gezicht per karakter") naast de gewone boer en
// boerin: boven het lijf van de boer, onder dat van de boerin, elk een rij per kant (Z en ZO). Per
// figuur staand en twee loopbeelden (0 en 2, zoals proefplaatHuis), elke kolom zo breed als wat erin
// staat, en binnen een blok alle rijen op dezelfde voetlijn. Op 1x, zoals in het spel, want daar moet
// je ze van een eindje weg uit elkaar houden (hooguit 1000x400).
//   karakters-ronde1.png  de acht van ronde 1
//   karakters-ronde2.png  de tien van ronde 2
//   karakters-alle.png    alle achttien op een rij, alleen staand in ZO (hooguit 1000x300): eerst
//                         wie het lijf van de boer heeft, dan de boerin
// Een plaat komt er als er in deze ronde een van zijn karakters meeging; wat niet meeging (ook de
// gewone boer en boerin), rendert hier zelf, alleen de beelden die op de plaat komen.
const KARAKTERS_RONDE1 = [
  ['boer', 'boer-zanger', 'boer-woekeraar', 'boer-heethoofd'],
  ['boerin', 'boerin-zanger', 'boerin-weduwe', 'boerin-woekeraar', 'boerin-vroedvrouw', 'boerin-heethoofd'],
];
const RONDE2 = ['vrome', 'roddelaar', 'grijsaard', 'nieuwkomer', 'drinker'];
const KARAKTERS_RONDE2 = [['boer', ...RONDE2.map((k) => `boer-${k}`)], ['boerin', ...RONDE2.map((k) => `boerin-${k}`)]];
const KARAKTERS_ALLE = [[...KARAKTERS_RONDE1[0], ...KARAKTERS_RONDE2[0], ...KARAKTERS_RONDE1[1], ...KARAKTERS_RONDE2[1]].filter((n) => n !== 'boer' && n !== 'boerin')];
function proefplaatKarakters(bestand, blokken, o = {}) {
  const { kanten = ['Z', 'ZO'], beelden = [['staan', 0], ['lopen', 0], ['lopen', 2]], max = [1000, 400] } = o;
  const plaatVan = (naam, houding, i, kant) => {
    if (gerendered[naam]) return gerendered[naam][houding][kant][i];
    const fig = FIGUREN.find((f) => f.naam === naam);
    const H = HOUDINGEN.find((h) => h.naam === houding);
    return K.losRenderen(fig.maak({ houding, fase: i / H.beelden }), { b: CEL, h: HOOG, anker: ANKER, richting: kant });
  };
  const GROEPGAT = 8;
  const RIJGAT_K = 4;
  const BLOKGAT = 10;
  const platen = blokken.map((namen) => {
    let y0 = HOOG;
    let y1 = -1;
    const groepen = namen.map((naam) =>
      beelden.map(([houding, i]) => {
        const kol = { platen: kanten.map((kant) => plaatVan(naam, houding, i, kant)), x0: CEL, x1: -1 };
        for (const p of kol.platen) {
          const k = kader(p);
          if (k.x1 < 0) continue;
          kol.x0 = Math.min(kol.x0, k.x0);
          kol.x1 = Math.max(kol.x1, k.x1);
          y0 = Math.min(y0, k.y0);
          y1 = Math.max(y1, k.y1);
        }
        kol.x0 = Math.max(0, kol.x0 - 2);
        kol.breed = Math.min(CEL - kol.x0, kol.x1 + 2 - kol.x0 + 1);
        return kol;
      }),
    );
    y0 = Math.max(0, y0 - 2);
    const hoog = Math.min(HOOG - y0, y1 + 2 - y0 + 1);
    const breed = groepen.reduce((som, g) => som + g.reduce((s, kol) => s + kol.breed, 0), 0) + GROEPGAT * (groepen.length - 1);
    return { groepen, y0, hoog, breed };
  });
  const breed = Math.max(...platen.map((b) => b.breed));
  const hoog = platen.reduce((som, b) => som + kanten.length * b.hoog + (kanten.length - 1) * RIJGAT_K, 0) + BLOKGAT * (platen.length - 1);
  const vel = new K.Plaat(breed, hoog);
  let y = 0;
  for (const b of platen) {
    kanten.forEach((kant, rij) => {
      let x = 0;
      for (const groep of b.groepen) {
        for (const kol of groep) {
          vel.plak(kol.platen[rij].uitsnede(kol.x0, b.y0, kol.breed, b.hoog), x, y);
          x += kol.breed;
        }
        x += GROEPGAT;
      }
      y += b.hoog + RIJGAT_K;
    });
    y += BLOKGAT - RIJGAT_K;
  }
  if (breed > max[0] || hoog > max[1]) console.log(`  let op: ${bestand} is ${breed}×${hoog}, groter dan ${max[0]}×${max[1]}`);
  fs.writeFileSync(path.join(UIT, bestand), K.png(vel, 1, '#5e6a44'));
  console.log(`${bestand}: ${breed}×${hoog} (schaal 1)`);
}
const gingMee = (blokken) => blokken.some((namen) => namen.some((n) => n !== 'boer' && n !== 'boerin' && gerendered[n]));
if (gingMee(KARAKTERS_RONDE1)) proefplaatKarakters('karakters-ronde1.png', KARAKTERS_RONDE1);
if (gingMee(KARAKTERS_RONDE2)) proefplaatKarakters('karakters-ronde2.png', KARAKTERS_RONDE2);
if (gingMee(KARAKTERS_ALLE)) proefplaatKarakters('karakters-alle.png', KARAKTERS_ALLE, { kanten: ['ZO'], beelden: [['staan', 0]], max: [1000, 300] });
