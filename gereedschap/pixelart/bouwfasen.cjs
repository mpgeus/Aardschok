// Een gebouw in aanbouw: vijf fases tussen "net begonnen" en de bestaande, afgewerkte tekening in
// tegels/gebouwen.tsx (ontwerp/werklijst.md, punt 2b; ontwerp/spel.md "Gebouwen"). Marcel: "eerst
// zie je een paar stenen, dan wat hout erbij en gaandeweg steeds meer van het gebouw tot het
// klaar is." Dit bestand tekent niet zelf: het HERGEBRUIKT de bouwfunctie van elk gebouw
// (dorpshuis/schuur/houtschuur/kippenhok, allemaal een dun laagje over `huis()` in dorp.cjs) en
// laat er telkens een ander deel van zien:
//
//   1. fundering       — alleen de plint (deel "sokkel") op de omtrek van de voet, met een
//                         stapel hout (houtstapel) en steen (puin) ernaast.
//   2. geraamte        — de muren tot kniehoogte (bij veldsteen) of tot boven (bij vakwerk,
//                         planken, blokhut — daar IS de wand al een geraamte, zie CLAUDE.md).
//   3. muren-steigers  — de muren helemaal af, met steigerpalen (schoorpaal) ertegenaan.
//   4. dakgebinte      — ook het dak erbij, maar in kaal hout getekend (geen riet/pannen/leien):
//                         dezelfde vorm als het echte dak, geen echte spanten (dat is een grovere
//                         geometrie dan dit bestand zich veroorlooft — zie de toelichting bij
//                         `heleHout`).
//   5. half-gedekt     — het dak: de onderste helft in zijn eigen bedekking, de bovenste helft
//                         nog kaal hout; de helft minder steigers.
//   Klaar (fase 6, niet hier) is gewoon de bestaande tekening in tegels/gebouwen.tsx.
//
// Hoe dat "een ander deel laten zien" werkt: elke vorm die huis() tekent (een muur, het dak, de
// nokkap, de schoorsteen, de plint, het stoepje …) draagt een `deel`-getal (D in huis(), hier
// dezelfde tabel als DEEL — dat bestand exporteert 'm niet, dus dit is een eigen kopie; verschuift
// die tabel daar ooit, dan moet DEEL hieronder mee). We selecteren op `deel`, en snijden een vorm
// zo nodig af op wereldhoogte door er ÉÉN vlak bij te zetten (`snijVorm`): elke vorm hier is de
// doorsnede van halve ruimtes (zie dorp.cjs, "convexe vormen"), en één vlak erbij is voor zo'n
// doorsnede altijd een geldige nieuwe snede — geen aparte meetkunde per gebouw nodig. Eén valkuil
// daarbij (zie `magHoogte`): een vorm die van nature al bóven de snede begint (bijv. de geveltop,
// die pas bij de noklijn begint) levert dan een flinterdunne plak van zijn VOLLE breedte op, en
// die vecht in de dieptetoets met wat eronder al staat (het vlakke dak van de muurdoos zelf) en
// flikkert. Onder een kleine marge laten we zo'n vorm daarom helemaal weg.
//
// Waarom niet gewoon `huis()` met een lagere `muurH` aanroepen? Omdat elk gebouw hier zijn EIGEN
// voet (`g.voet`) en achterste voethoek (`hoek`, hieronder net als in naar-tiled.cjs "meetGebouw")
// gebruikt om zijn anker vast te leggen. Dat anker mag nooit verschuiven tussen de vijf fases —
// anders "springt" het gebouw op het scherm terwijl het groeit. Door telkens dezelfde `maak()`
// (dezelfde b/d/zaad/… als in naar-tiled.cjs se gebouwenLijst) te bellen en alleen `g.vormen` te
// zeven, blijft `g.voet` exact gelijk, en dus ook het anker.
//
//   node gereedschap/pixelart/bouwfasen.cjs            alle gebouwen hieronder (BUILDINGEN)
//   node gereedschap/pixelart/bouwfasen.cjs kippenhok   alleen kippenhok (snel proberen)
//
// Uitvoer:
//   gereedschap/pixelart/uit/bouwfasen/<tekening>.png   per gebouw, de vijf fases naast elkaar
//   gereedschap/pixelart/uit/bouwfasen/overzicht.png    alle gebouwen onder elkaar
//   (geen van deze twee in git — net als de rest van uit/, zie CLAUDE.md)
//   tegels/bouwfasen.png + tegels/bouwfasen.json        het vel voor het spel, zie de toelichting
//                                                        onderaan bij `schrijfSpelVel`.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');
const P = require('./dorp2.cjs');
const VW = require('./voorwerpen.cjs');
const { RAMP, UIT, PXH, TEGEL } = K;

const PIXELART = __dirname;
const UITDIR = path.join(PIXELART, 'uit', 'bouwfasen');
const TEGELS = path.join(PIXELART, '..', '..', 'tegels');

// ---------------------------------------------------------------- de gebouwen

// Dezelfde aanroepen als gebouwenLijst() in naar-tiled.cjs. `tekening` is de naam zoals die in
// tegels/gebouwen.tsx staat (T.GEBOUWEN.<id>.tekening is "gebouwen/<tekening>"); `id` is het
// GEBOUWEN-soort dat 'm leent waar ik die kende (gebouwen:js/gebouwen.js) — puur om de proefplaat
// een leesbare naam te geven, verder ongebruikt.
//
// Eerst het gehucht (T.GEBOUW_TREDEN[0]) — waar dit voor gevraagd is, en grondig bekeken (zie het
// terugmeldbericht). Daarna, uit dezelfde `huis()` in dorp.cjs en dus op dezelfde manier getoetst,
// de rest van gebouwenLijst() die een kale D.dorpshuis(...)/D.<naam>(...) is: geen eigen aanbouw of
// bijzonder werktuig erbij (dat scheelt risico dat zo'n extra vorm een `deel` gebruikt die de vijf
// fases hierboven niet kennen). Bewust nog NIET gedaan, en dus ook nog niet bekeken: aanbouwhuis/
// vleugelhuis (eigen aanbouw-geometrie), kapel/watermolen/bakkerij/kruidenhut/jagershut/oudstehuis
// (elk met een eigen bijgebouwd werktuig of object — molenrad, oven, …) en kerkhof (geen huis()).
// moestuin/put lenen een tekening uit het ERF-vel (erf-scene.cjs, geen huis()) en akker/
// verstopplek hebben er expres geen — geen van vieren past in dit stramien, zie de koptekst.
const BUILDINGEN = [
  // ── gehucht ──
  { id: 'hut', tekening: 'dorpKlein2', maak: () => D.dorpshuis(0, 0, 102, { maat: [5, 7], muur: 'planken', dak: 'leien', rook: false }) },
  { id: 'huis', tekening: 'dorpshuis1', maak: () => D.dorpshuis(0, 0, 1, { maat: [7, 5], rook: false }) },
  { id: 'boerderij', tekening: 'schuur', maak: () => P.schuur(0, 0) },
  { id: 'houthakker', tekening: 'houtschuur', maak: () => P.houtschuur(0, 0) },
  { id: 'schaapskooi', tekening: 'schuurBlokhut', maak: () => P.schuur(0, 0, { b: 5, d: 7, muur: 'blokhut', dakMos: 0.7, zaad: 77 }) },
  { id: 'kippenhok', tekening: 'kippenhok', maak: () => P.kippenhok(0, 0) },
  // ── dorp en verder: zelfde recept (D.huis of D.dorpshuis), nog niet aan een GEBOUWEN-soort
  // gekoppeld voor wie dat nog niet was (id blijft dan gelijk aan de tekeningnaam) ──
  { id: 'vakwerkhuis', tekening: 'vakwerkhuis', maak: () => D.vakwerkhuis(0, 0) },
  { id: 'stenenHuis', tekening: 'stenenHuis', maak: () => D.stenenHuis(0, 0) },
  { id: 'herberg', tekening: 'herberg', maak: () => D.herberg(0, 0, { rook: false }) },
  { id: 'smidse', tekening: 'smidse', maak: () => D.smidse(0, 0) },
  { id: 'timmerman', tekening: 'dorpshuis3', maak: () => D.dorpshuis(0, 0, 3, { maat: [6, 8], rook: false }) },
  { id: 'brouwerij', tekening: 'dorpshuis5', maak: () => D.dorpshuis(0, 0, 5, { maat: [5, 7], rook: false, muur: 'blokhut' }) },
  { id: 'dorpKlein1', tekening: 'dorpKlein1', maak: () => D.dorpshuis(0, 0, 101, { maat: [5, 7], muur: 'vlecht', dak: 'riet', rook: false }) },
  { id: 'dorpKlein3', tekening: 'dorpKlein3', maak: () => D.dorpshuis(0, 0, 103, { maat: [5, 7], muur: 'blokhut', dak: 'riet', rook: false }) },
  { id: 'dorpGewoon3', tekening: 'dorpGewoon3', maak: () => D.dorpshuis(0, 0, 106, { maat: [6, 8], muur: 'veldsteen', dak: 'leien', rook: false }) },
  { id: 'dorpGewoon4', tekening: 'dorpGewoon4', maak: () => D.dorpshuis(0, 0, 107, { maat: [6, 8], muur: 'planken', dak: 'riet', rook: false }) },
  { id: 'dorpGroot1', tekening: 'dorpGroot1', maak: () => D.dorpshuis(0, 0, 108, { maat: [7, 9], muur: 'vlecht', dak: 'riet', rook: false }) },
  { id: 'dorpGroot2', tekening: 'dorpGroot2', maak: () => D.dorpshuis(0, 0, 109, { maat: [7, 9], muur: 'planken', dak: 'pannen', rook: false }) },
];

// ---------------------------------------------------------------- vormen zeven en snijden

// Zelfde tabel als de lokale `D` in huis() (dorp.cjs); niet geëxporteerd vandaar, dus hier
// gekopieerd — zie de toelichting bovenaan.
const DEEL = { muur: 1, dak: 2, kap: 3, schoorsteen: 4, sokkel: 5, stoep: 6, bak: 7, bord: 9 };

// Een simpele, egale houttint — voor het dakgebinte (kale sporen, nog geen riet/pannen/leien) en
// voor de rand die een snede blootlegt. Geen echte plankentekening (dat zou vragen om dezelfde
// balken/spantenmeetkunde als het echte dak, en dat is precies de meetkunde die dit bestand
// vermijdt door bestaande vormen te hergebruiken) — een vlakke tint met een klein beetje ruis zodat
// hij niet als één dode kleurvlek oogt.
function heleHout(stapBasis) {
  return (vlak, X, Y, Z) => {
    UIT.ramp = RAMP.hout;
    UIT.stap = stapBasis + ((Math.floor(X * 0.35) + Math.floor(Y * 0.35) + Math.floor(Z * 0.35)) % 3 === 0 ? 1 : 0);
  };
}
// Tekent het nieuwe snijvlak zelf (met `ramp`/`stap`, vlak van naam 'snede'); elk ander vlak van
// de vorm gaat gewoon naar zijn eigen textuur. Zonder dit zou dat vlak de laatst gezette UIT.ramp/
// UIT.stap van een ANDER pixel hergebruiken (kern.cjs se tekenVormen zet ze niet terug tussen twee
// pixels) — een willekeurig ogende gloed op precies de rand die je net zichtbaar maakte.
function metSnede(tex, ramp, stap) {
  return (vlak, X, Y, Z, px, py, v, p) => {
    if (vlak === 'snede') { UIT.ramp = ramp; UIT.stap = stap; return; }
    return tex(vlak, X, Y, Z, px, py, v, p);
  };
}
// Eén vlak (halve ruimte n·p <= d) aan een vorm toevoegen is voor een convexe vorm altijd een
// geldige nieuwe snede (dorp.cjs, "convexe vormen"): meer vlakken mag altijd, welke vorm het ook
// is (een blok, een schuin dakschild, de geveltop). `doos` (het schermkader, alleen een
// snelheidstruc — zie tekenVormen) schuiven we mee zodat we niet meer pixels beproeven dan nodig.
function snijVorm(v, n, d, naam, tex) {
  const nieuw = { ...v, vlakken: [...v.vlakken, { n, d, naam }] };
  if (tex) nieuw.tex = tex;
  if (v.doos) {
    const doos = v.doos.slice();
    if (n[2] === 1) doos[5] = Math.min(doos[5], d);
    else if (n[2] === -1) doos[2] = Math.max(doos[2], -d);
    nieuw.doos = doos;
  }
  return nieuw;
}
// Snijdt vorm `v` af op wereldhoogte `maxHoogtePixels` (dezelfde pixel-eenheden als muurH/
// sokkelH — huis() zet ze zelf om naar wereld-Z door /PXH, hier dus ook). MARGE: begint de vorm
// zelf al zo dicht bij (of boven) de snede, dan zou er alleen een flinterdunne plak van zijn volle
// x/y-omvang overblijven (de geveltop is bijvoorbeeld geen platte schijf maar de hele kapruimte,
// aan zijn voet al net zo breed als de muur) — die vecht in de dieptetoets met het vlakke dak van
// de muurdoos zelf en flikkert. Zo'n vorm laten we dan helemaal weg (null; de aanroeper filtert).
const MARGE = 0.5; // wereld-eenheden, ruim een halve pixel
function magHoogte(v, maxHoogtePixels) {
  if (!v.doos) return v;
  const maxZ = maxHoogtePixels / PXH;
  if (v.doos[5] <= maxZ + 1e-6) return v;
  if (v.doos[2] >= maxZ - MARGE) return null;
  return snijVorm(v, [0, 0, 1], maxZ, 'snede', metSnede(v.tex, RAMP.hout, 4));
}

// Hoogte van de plint (deel sokkel), in pixels — het hoogste punt van wat er al staat. Bepaalt hoe
// laag "kniehoogte" (fase 2, steen) minstens moet liggen: lager dan de plint zelf zou niets nieuws
// laten zien (die staat er toch al, iets naar voren, overheen).
function sokkelHoogtePx(g) {
  const sokkels = g.vormen.filter((v) => v.deel === DEEL.sokkel && v.doos);
  if (!sokkels.length) return 0;
  return Math.max(...sokkels.map((v) => v.doos[5])) * PXH;
}

// Zeeft g.vormen op `deelHoogtes` ({deel: hoogste pixel die nog mag, of Infinity voor "heel
// laten"}); een deel dat er niet in staat, valt weg. `woudDeel`: deze delen altijd in kale hout-
// tint (fase 4). `halfDeel`: deze delen in tweeën knippen op hun eigen halve hoogte, onderste helft
// in zijn eigen textuur (bedekt), bovenste in kale houttint (fase 5) — zie de toelichting bij
// `fasesVan`.
function zeefVormen(g, deelHoogtes, o = {}) {
  let vormen = g.vormen.filter((v) => deelHoogtes[v.deel] !== undefined);
  if (o.halfDeel) {
    const eruit = [];
    vormen = vormen.filter((v) => {
      if (!o.halfDeel.includes(v.deel) || !v.doos) return true;
      const mid = (v.doos[2] + v.doos[5]) / 2;
      eruit.push(snijVorm(v, [0, 0, -1], -mid, 'snede-boven', heleHout(4))); // boven: kaal hout
      eruit.push(snijVorm(v, [0, 0, 1], mid, 'snede-onder', metSnede(v.tex, RAMP.hout, 4))); // onder: bedekt
      return false;
    });
    vormen = vormen.concat(eruit);
  }
  vormen = vormen.map((v) => {
    if (o.woudDeel && o.woudDeel.includes(v.deel)) return { ...v, tex: heleHout(4) };
    const maxPx = deelHoogtes[v.deel];
    return maxPx === Infinity ? v : magHoogte(v, maxPx);
  }).filter(Boolean);
  // bloembakken (bloempixels bij een raam) en lichten (raamgloed) horen bij het AFGEWERKTE gebouw
  // — geen deel dat hier ooit meedoet (bak zit in geen enkele fase hierboven), maar het zijn eigen
  // lijstjes naast g.vormen (zetGebouw tekent ze los) die anders gewoon waren blijven staan: zonder
  // muur eronder zweven ze dan los in de lucht (vooral zichtbaar in fase 1-2). Dus altijd leeg.
  return { ...g, vormen, bloembakken: [], lichten: [] };
}

// ---------------------------------------------------------------- de vijf fases

// steen: is de bovenste (=zichtbare) wandlaag veldsteen? Bepaalt of fase 2 "geraamte" betekent
// (vakwerk/planken/blokhut: de wand IS al een geraamte, dus heel laten — CLAUDE.md) of "tot
// kniehoogte" (veldsteen: een volle stenen muur zou geen geraamte meer lijken).
function fasesVan(g0) {
  const muurTop = g0.lagen[g0.lagen.length - 1].h1; // pixels, zoals muurH
  const steen = g0.lagen[g0.lagen.length - 1].muur === 'veldsteen';
  const knieH = Math.min(muurTop, Math.max(sokkelHoogtePx(g0) + 10, Math.round(muurTop * 0.4)));
  const INF = Infinity;
  return [
    {
      naam: 'fundering',
      zeef: (g) => zeefVormen(g, { [DEEL.sokkel]: INF }),
      steigers: 0,
      stapel: true,
    },
    {
      naam: 'geraamte',
      zeef: (g) => zeefVormen(g, { [DEEL.sokkel]: INF, [DEEL.muur]: steen ? knieH : muurTop }),
      steigers: 0,
      stapel: true,
    },
    {
      naam: 'muren-steigers',
      zeef: (g) => zeefVormen(g, { [DEEL.sokkel]: INF, [DEEL.muur]: muurTop, [DEEL.stoep]: INF }),
      steigers: 4,
      stapel: false,
    },
    {
      naam: 'dakgebinte',
      zeef: (g) => zeefVormen(g, { [DEEL.sokkel]: INF, [DEEL.muur]: INF, [DEEL.stoep]: INF, [DEEL.dak]: INF, [DEEL.kap]: INF }, { woudDeel: [DEEL.dak, DEEL.kap] }),
      steigers: 4,
      stapel: false,
    },
    {
      naam: 'half-gedekt',
      zeef: (g) => zeefVormen(g, { [DEEL.sokkel]: INF, [DEEL.muur]: INF, [DEEL.stoep]: INF, [DEEL.dak]: INF, [DEEL.kap]: INF }, { halfDeel: [DEEL.dak, DEEL.kap] }),
      steigers: 2,
      stapel: false,
    },
  ];
}

// Plek voor een steigerpaal (schoorpaal, D.schoorpaal — leunt al op één been, precies het beeld
// van een stut tegen de gevel) of de bouwstapel, rondom de voet. `uit`: hoeveel de paal buiten de
// voet komt te staan.
function rondVoet(voet, zijde, uit) {
  const [x0, y0, x1, y1] = voet;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  if (zijde === 'Z') return { gx: mx / TEGEL, gy: (y1 + uit) / TEGEL, richting: 'Z' };
  if (zijde === 'N') return { gx: mx / TEGEL, gy: (y0 - uit) / TEGEL, richting: 'N' };
  if (zijde === 'O') return { gx: (x1 + uit) / TEGEL, gy: my / TEGEL, richting: 'O' };
  return { gx: (x0 - uit) / TEGEL, gy: my / TEGEL, richting: 'W' };
}

function extraModellen(g, fase, zaad) {
  const modellen = [];
  if (fase.stapel) {
    const [x0, , , y1] = g.voet;
    modellen.push({ model: D.houtstapel(zaad), gx: x0 / TEGEL - 0.3, gy: y1 / TEGEL + 0.55, richting: 'Z', z: 0 });
    modellen.push({ model: VW.puin(zaad + 5, 7), gx: x0 / TEGEL - 0.75, gy: y1 / TEGEL + 0.15, richting: 'Z', z: 0 });
  }
  if (fase.steigers > 0) {
    const zijden = ['Z', 'O', 'N', 'W'].slice(0, fase.steigers);
    for (const zijde of zijden) modellen.push({ model: D.schoorpaal(zaad + 11), ...rondVoet(g.voet, zijde, 6), z: 0 });
  }
  return modellen;
}

// ---------------------------------------------------------------- meten en renderen
// Zelfde recept als meetGebouw/gebouwLos in naar-tiled.cjs (niet hergebruikt: dat bestand rendert
// bij het inladen meteen het hele tegels/-vel, dat wil je hier niet aanzwengelen). Anders dan daar
// delen we de cel NIET met alle 27 gebouwen (dat zou voor een kippenhok een enorme, vrijwel lege
// cel geven) — elk gebouw krijgt hier zijn eigen cel, precies groot genoeg voor zijn eigen vijf
// fases. Het anker (de achterste voethoek, +16 voor het midden van de tegel — zie tegels.json
// "anker" in naar-tiled.cjs) blijft zo wél voor alle vijf fases van HETZELFDE gebouw gelijk, want
// `hoek` hangt alleen af van g.voet, en dat verandert nooit tussen fases (zie de koptekst).
function meetGebouw(g) {
  const OX = 450, OY = 550;
  const B = new K.Beeld(900, 900, OX, OY);
  D.zetGebouw(B, g);
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] < 0) continue;
    const x = i % B.b, y = (i / B.b) | 0;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const voet = g.voet || [0, 0, 0, 0];
  const [hsx, hsy] = K.naarScherm(B, voet[0], voet[1], 0);
  const hoek = [hsx - OX, hsy - OY];
  if (x1 < 0) return { links: 20, rechts: 20, boven: 20, onder: 20, hoek };
  return { links: hsx - x0 + 1, rechts: x1 - hsx + 1, boven: hsy - y0 + 1, onder: y1 - hsy + 1, hoek };
}

function gebouwLos(g, cb, ch, ankerX, ankerY, hoek) {
  const B = new K.Beeld(cb, ch, ankerX - hoek[0], ankerY - hoek[1]);
  D.zetGebouw(B, g);
  D.zonSchaduw(B, g.vormen, { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  D.avondlicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// Alles voor één gebouw: meet zijn vijf fases (dezelfde `maak()` als de tekening in gebouwen.tsx,
// zie BUILDINGEN), bepaalt de gedeelde cel/anker, en rendert. Zwaar (5×meetGebouw + 5×renderen) —
// dit is het werk dat elke werker hieronder per taak (één gebouw) uitvoert.
function renderGebouw(spec) {
  const g0 = spec.maak();
  const fasen = fasesVan(g0);
  const gAlle = fasen.map((f) => f.zeef(spec.maak()));
  const metingen = gAlle.map((g) => meetGebouw(g));
  const RAND = 5;
  const links = Math.max(...metingen.map((m) => m.links)) + RAND;
  const rechts = Math.max(...metingen.map((m) => m.rechts)) + RAND;
  const boven = Math.max(...metingen.map((m) => m.boven)) + RAND;
  const onder = Math.max(...metingen.map((m) => m.onder)) + RAND;
  const cb = Math.ceil(links + rechts);
  const ch = Math.ceil(boven + onder);
  const ankerX = Math.round(links);
  const ankerY = Math.round(boven);
  const platen = fasen.map((f, i) => {
    const g = { ...gAlle[i], modellen: extraModellen(g0, f, 1000 + i) };
    return gebouwLos(g, cb, ch, ankerX, ankerY, metingen[i].hoek);
  });
  return {
    id: spec.id, tekening: spec.tekening, cb, ch, ankerX, ankerY,
    beslaat: [Math.max(1, Math.round((g0.voet[2] - g0.voet[0]) / TEGEL)), Math.max(1, Math.round((g0.voet[3] - g0.voet[1]) / TEGEL))],
    fasenNamen: fasen.map((f) => f.naam),
    platen,
  };
}

// ---------------------------------------------------------------- werkers (worker_threads)
// Eén gebouw (vijf fases, meten + renderen) is het werk per taak — kleiner opknippen (per fase)
// zou vijf keer hetzelfde meetGebouw-voorwerk dubbel doen. Zie CLAUDE.md, "rendertijd": dit is
// dezelfde opzet als huis-sdf-export.cjs (een pull-gestuurde wachtrij, taken > draden).

if (!isMainThread && workerData === 'bouwfasen') {
  parentPort.on('message', ({ i, idx }) => {
    const t0 = Date.now();
    // Nooit de hele batch laten vallen om één gebouw (net als naar-tiled.cjs se `veilig`): een
    // fout gaat terug als gewoon bericht (geen worker-crash), de hoofddraad meldt 'm en gaat door.
    try {
      const r = renderGebouw(BUILDINGEN[idx]);
      const platen = r.platen.map((p) => ({ b: p.b, h: p.h, px: p.px }));
      parentPort.postMessage({
        i, id: r.id, tekening: r.tekening, cb: r.cb, ch: r.ch, ankerX: r.ankerX, ankerY: r.ankerY,
        beslaat: r.beslaat, fasenNamen: r.fasenNamen, platen, ms: Date.now() - t0,
      });
    } catch (e) {
      parentPort.postMessage({ i, id: BUILDINGEN[idx].id, fout: e.message, ms: Date.now() - t0 });
    }
  });
}

function renderAlleGebouwen(indices, draden) {
  return new Promise((klaar, fout) => {
    const uit = new Array(indices.length);
    let volgende = 0, gedaan = 0;
    const werkers = [];
    const geef = (w) => {
      if (volgende >= indices.length) return;
      const i = volgende++;
      w.postMessage({ i, idx: indices[i] });
    };
    for (let n = 0; n < Math.min(draden, indices.length); n++) {
      const w = new Worker(__filename, { workerData: 'bouwfasen' });
      w.on('error', fout);
      w.on('message', (m) => {
        if (m.fout) {
          console.warn(`  overgeslagen: ${m.id} (${m.fout})`);
        } else {
          const platen = m.platen.map((p) => { const plaat = new K.Plaat(p.b, p.h); plaat.px = p.px; return plaat; });
          uit[m.i] = { ...m, platen };
          console.log(`  ${m.id.padEnd(14)} (${m.tekening})`.padEnd(34), `${(m.ms / 1000).toFixed(1)} s`);
        }
        if (++gedaan === indices.length) { for (const x of werkers) x.terminate(); klaar(uit.filter(Boolean)); } else geef(w);
      });
      werkers.push(w);
      geef(w);
    }
  });
}

// ---------------------------------------------------------------- uitvoer

function schrijfPng(bestand, plaat, achtergrond) {
  fs.writeFileSync(bestand, K.png(plaat, 1, achtergrond));
}

// Eén plaat per gebouw: de vijf fases op een rij (oplopend: fundering, geraamte, muren-steigers,
// dakgebinte, half-gedekt — klaar is de bestaande tekening in tegels/gebouwen.png, niet hier).
// Alleen om te bekijken — gaat naar uit/, niet in git (CLAUDE.md); de bestandsnaam zegt om welk
// gebouw het gaat, geen opschrift nodig op de plaat zelf.
function schrijfProefPlaat(r) {
  const vel = new K.Plaat(r.cb * r.platen.length, r.ch);
  r.platen.forEach((p, i) => vel.plak(p, i * r.cb, 0));
  fs.mkdirSync(UITDIR, { recursive: true });
  schrijfPng(path.join(UITDIR, `${r.tekening}.png`), vel, '#20202a');
}

function schrijfOverzicht(resultaten) {
  const cb = Math.max(...resultaten.map((r) => r.cb));
  const ch = Math.max(...resultaten.map((r) => r.ch));
  const vel = new K.Plaat(cb * 5, ch * resultaten.length);
  resultaten.forEach((r, rij) => {
    r.platen.forEach((p, i) => vel.plak(p, i * cb + Math.round((cb - r.cb) / 2), rij * ch));
  });
  fs.mkdirSync(UITDIR, { recursive: true });
  schrijfPng(path.join(UITDIR, 'overzicht.png'), vel, '#20202a');
}

// Het vel voor het spel: elk gebouw krijgt zijn eigen, krap uitgesneden cel (niet de gedeelde,
// royale cel van bouwfasen zelf — die is voor alle vijf fases van ÉÉN gebouw gelijk gehouden zodat
// het anker niet verschuift, maar tussen gebouwen onderling hoeft dat niet, en een kippenhok hoeft
// geen cel zo groot als een schuur). Per fase dus een eigen (x, y, b, h) in het vel, plus een eigen
// `anker` (het punt in DIE cel dat op T.naarScherm(x, y) van de aangeklikte tegel komt — dezelfde
// afspraak als tegels.json "anker": de achterste voethoek van de voet, een halve tegel (16 px)
// boven het midden van die tegel). Dat ankerpunt is voor alle vijf fases van hetzelfde gebouw
// hetzelfde WERELDPUNT als voor de kant-en-klare tekening in gebouwen.tsx (zie de koptekst: `hoek`
// hangt alleen van g.voet af, dat verandert nooit) — alleen de pixel-COÖRDINAAT ervan verschuift
// mee met de krappere cel hier, want dit is een eigen vel, geen gedeeld Tiled-raster met gebouwen.tsx
// se eigen (veel grotere) cel. `beslaat` is letterlijk hetzelfde getal als in gebouwen.tsx voor
// diezelfde tekening (allebei uit g.voet/TEGEL) — dat wordt dus nooit gecontroleerd, dat IS gelijk.
//
// Voor het spel: zoek de tekeningnaam op (T.GEBOUWEN.<soort>.tekening is "gebouwen/<naam>"; gebruik
// <naam> hier), lees `fasen[naam][faseIndex]` (0..4; fase 5 = de bestaande tekening in
// tegels/gebouwen.tsx zelf), teken `bouwfasen.png` uitgesneden op (x, y, b, h), met (ankerX, ankerY)
// van die cel op dezelfde schermplek als anders het anker van gebouwen.tsx (T.sprites.teken doet
// dat al zo voor de vlakken/losse sprites, zie CLAUDE.md "js/sprites.js").
function schrijfSpelVel(resultaten) {
  // eenvoudig stapelen: rij per gebouw, cellen van dat gebouw naast elkaar (geen gedeeld
  // Tiled-raster nodig, zie hierboven) — dus geen ingewikkelde bin-packing nodig.
  const breedte = Math.max(...resultaten.map((r) => r.cb * r.platen.length));
  const hoogte = resultaten.reduce((som, r) => som + r.ch, 0);
  const vel = new K.Plaat(breedte, hoogte);
  const fasenJson = {};
  let y = 0;
  for (const r of resultaten) {
    const lijst = [];
    r.platen.forEach((p, i) => {
      vel.plak(p, i * r.cb, y);
      lijst.push({ x: i * r.cb, y, b: r.cb, h: r.ch, anker: [r.ankerX, r.ankerY + 16], naam: r.fasenNamen[i] });
    });
    fasenJson[r.tekening] = { gebouw: r.id, beslaat: r.beslaat, fasen: lijst };
    y += r.ch;
  }
  fs.mkdirSync(TEGELS, { recursive: true });
  schrijfPng(path.join(TEGELS, 'bouwfasen.png'), vel, null);
  const json = {
    _lees_dit: 'Vijf bouwfases per gebouw uit tegels/gebouwen.tsx, gemaakt door '
      + 'gereedschap/pixelart/bouwfasen.cjs — niet met de hand bijwerken. Sleutel is de '
      + 'tekeningnaam (T.GEBOUWEN.<soort>.tekening, na "gebouwen/"). Per fase (0..4, oplopend '
      + 'in afbouw): x/y/b/h snijdt de cel uit bouwfasen.png, anker is het punt in die cel dat op '
      + 'T.naarScherm(x, y) van de aangeklikte tegel komt — dezelfde achterste-voethoek-afspraak '
      + 'als tegels.json ("anker" bij de tsx-vellen), en beslaat is dezelfde tegelmaat als in '
      + 'gebouwen.tsx voor dezelfde tekening. Fase 5 (klaar) staat niet hier: dat is gewoon de '
      + 'bestaande tegel in tegels/gebouwen.png.',
    breedte: vel.b, hoogte: vel.h, bestand: 'bouwfasen.png',
    fasen: fasenJson,
  };
  fs.writeFileSync(path.join(TEGELS, 'bouwfasen.json'), JSON.stringify(json, null, 1) + '\n');
  return { breedte: vel.b, hoogte: vel.h };
}

// ---------------------------------------------------------------- hoofdprogramma

async function main() {
  const GEVRAAGD = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const indices = BUILDINGEN
    .map((b, i) => i)
    .filter((i) => !GEVRAAGD.length || GEVRAAGD.includes(BUILDINGEN[i].id) || GEVRAAGD.includes(BUILDINGEN[i].tekening));
  if (!indices.length) { console.error('geen gebouw gevonden voor:', GEVRAAGD.join(' ')); process.exit(1); }
  const draden = Math.max(1, Math.min(6, os.cpus().length - 2, indices.length));
  console.log(`bouwfasen: ${indices.length} gebouw(en), ${draden} draad/draden`);
  const t0 = Date.now();
  const resultaten = await renderAlleGebouwen(indices, draden);
  for (const r of resultaten) schrijfProefPlaat(r);
  schrijfOverzicht(resultaten);
  const { breedte, hoogte } = schrijfSpelVel(resultaten);
  console.log(`klaar in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`  proefplaten: gereedschap/pixelart/uit/bouwfasen/ (${resultaten.length} + overzicht.png, niet in git)`);
  console.log(`  spelvel: tegels/bouwfasen.png (${breedte}×${hoogte}) + tegels/bouwfasen.json`);
}

if (isMainThread && require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { BUILDINGEN, fasesVan, renderGebouw };
