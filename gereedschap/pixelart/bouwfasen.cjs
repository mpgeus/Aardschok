// Een gebouw in aanbouw: vijf fases tussen "net begonnen" en de bestaande, afgewerkte tekening in
// tegels/gebouwen.tsx (ontwerp/werklijst.md, punt 2b; ontwerp/spel.md "Gebouwen"). Marcel: "eerst
// zie je een paar stenen, dan wat hout erbij en gaandeweg steeds meer van het gebouw tot het
// klaar is." Dit bestand tekent niet zelf: het HERGEBRUIKT de bouwfunctie van elk gebouw
// (dorpshuis/schuur/houtschuur/kippenhok, allemaal een dun laagje over `huis()` in dorp.cjs) en
// laat er telkens een ander deel van zien:
//
//   1. fundering       — geen bestaand onderdeel: een eigen, lage ring van stenen (één, twee
//                         lagen hoog) RONDOM de hele omtrek van de voet (`funderingRing`), met een
//                         stapel hout (houtstapel) en steen (puin) ernaast — allebei een maat
//                         groter dan hun gewone plaatje, zodat meteen duidelijk is dat hier
//                         gebouwd gaat worden.
//   2. geraamte        — ook geen bestaand onderdeel: een houten skelet dat alleen uit de voet en
//                         de muurhoogte volgt (`geraamteVormen`) — hoekstijlen, tussenstijlen langs
//                         alle vier de muren, en twee balklagen rondom (op de fundering en
//                         bovenaan), met lucht ertussen. De plint (sokkel) staat er wél al echt
//                         bij, die is af.
//   3. muren-steigers  — de muren zijn hier weer nieuwe geometrie (`muurSchilVormen`): een dunne
//                         schil (de echte wandtextuur uit huis(), niet meer als massief blok) tot
//                         twee derde hoogte, RONDOM alle vier de kanten, met een donker binnenste
//                         erachter, en steigerpalen én -planken ertegenaan (`steigerVormen`, met
//                         palen die boven de muur uitsteken zodat de steiger ook als steiger
//                         leesbaar is). Sokkel en stoep blijven echt.
//   4. dakgebinte      — muren, sokkel en stoep zijn nu heel en echt. Het dak niet: dat knippen we
//                         in losse spanten (`dakgebinteVormen`) — dezelfde dakvlakken als het
//                         echte dak, maar in repen langs de helling met lucht ertussen, kaal hout
//                         — plus de ongesneden nokkap als nokbalk. Weer steigers ertegenaan.
//   5. half-gedekt     — het dak: de onderste helft in zijn eigen bedekking, de bovenste helft
//                         nog kaal hout; de helft minder steigers.
//   Klaar (fase 6, niet hier) is gewoon de bestaande tekening in tegels/gebouwen.tsx.
//
//   Fundering/geraamte/muren-steigers staan RONDOM (alle vier de kanten), niet alleen de twee
//   die je bij het AFGEWERKTE huis ooit ziet (de zuid- en oostwand, zie de toelichting bij
//   `funderingRing` hieronder): zonder dak erop kijk je bij deze drie fases over de lage
//   voor-wanden heen zó naar binnen, en dan moeten de achterste twee wanden er ook staan — anders
//   oogt het huis als een decorstuk van twee wanden in plaats van een gebouw in aanbouw.
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
// Voor fundering/geraamte/muren-steigers/dakgebinte is zeven en snijden niet genoeg: een half
// afgebouwde muur is geen kleiner stuk van de afgewerkte muur, maar iets dat als vorm nooit heeft
// bestaan (een geraamte, een holle schil, losse spanten). Die vier bouwen daarom NIEUWE vormen —
// nog steeds convex, nog steeds met `blok` — afgeleid van alleen de voet (`g.voet`) en de hoogtes
// van muur en nok, niet van het huismodel zelf. Zie `funderingRing`, `geraamteVormen`,
// `muurSchilVormen`, `steigerVormen` en `dakgebinteVormen` verderop.
//
// De huizen van de huizenbouwer (huizen.cjs, ronde 4b) staan onderaan BUILDINGEN, maar hun fases
// komen niet uit dit zeven en snijden: die bouwer tekent met afstandsvelden, en renderHuisFasen in
// huizen.cjs snijdt ze uit het huis zelf (een schil van de muren, het dak in latten).
//
// Waarom niet gewoon `huis()` met een lagere `muurH` aanroepen? Omdat elk gebouw hier zijn EIGEN
// voet (`g.voet`) en achterste voethoek (`hoek`, hieronder net als in naar-tiled.cjs "meetGebouw")
// gebruikt om zijn anker vast te leggen. Dat anker mag nooit verschuiven tussen de vijf fases —
// anders "springt" het gebouw op het scherm terwijl het groeit. Door telkens dezelfde `maak()`
// (dezelfde b/d/zaad/… als in naar-tiled.cjs se gebouwenLijst) te bellen en alleen `g.vormen` te
// zeven, blijft `g.voet` exact gelijk, en dus ook het anker.
//
//   node gereedschap/pixelart/bouwfasen.cjs            alle gebouwen hieronder (BUILDINGEN)
//   node gereedschap/pixelart/bouwfasen.cjs kippenhok   alleen kippenhok (snel proberen: alleen de
//                                                        proefplaat, het spelvel blijft staan)
//
// Uitvoer:
//   gereedschap/pixelart/uit/bouwfasen/<tekening>.png   per gebouw, de vijf fases naast elkaar
//   gereedschap/pixelart/uit/bouwfasen/overzicht.png    alle gebouwen onder elkaar
//   (geen van deze twee in git — net als de rest van uit/, zie CLAUDE.md)
//   tegels/bouwfasen.png + .json + .js                  het vel voor het spel (.js is dezelfde
//                                                        inhoud als .json, als script voor file://
//                                                        — zie de toelichting bij `schrijfSpelVel`).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');
const P = require('./dorp2.cjs');
const VW = require('./voorwerpen.cjs');
const F = require('./figuren.cjs');
const HZ = require('./huizen.cjs');
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
  // ── de huizen van de huizenbouwer (huizen.cjs, ronde 4b): die snijden hun fases uit het huis zelf
  // (renderHuisFasen), niet uit de vormen van dorp.cjs. Niet voor een huis dat niemand bouwt (fasen:
  // false, het huis van de schout) ──
  ...Object.keys(HZ.HUIZEN).filter((n) => HZ.HUIZEN[n].fasen !== false).map((n) => ({ id: HZ.HUIZEN[n].gebouw, tekening: n, huis: n })),
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
// Dezelfde soort egale tint, maar in veldsteen — voor de lage ring van fase 1 (fundering): geen
// echte gemetselde voegen (dat is `veldsteenPixel` in dorp.cjs, met zijn eigen rijhoogtes en
// hoekstenen), gewoon genoeg ruis om niet als één vlak te ogen.
function heleSteen(stapBasis) {
  return (vlak, X, Y, Z) => {
    UIT.ramp = RAMP.veldsteen;
    UIT.stap = stapBasis + ((Math.floor(X * 0.4) + Math.floor(Y * 0.4) + (vlak === 'z' ? 2 : 0)) % 3 === 0 ? 1 : 0);
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

// Hoogte van de plint (deel sokkel), in pixels — het hoogste punt van wat er al staat. De echte
// plint (zie `zetGebouw`/huis()); niet te verwarren met de eigen, lage ring van `funderingRing`
// hierbeneden. Gebruikt om het geraamte (fase 2) er precies bovenop te laten beginnen.
function sokkelHoogtePx(g) {
  const sokkels = g.vormen.filter((v) => v.deel === DEEL.sokkel && v.doos);
  if (!sokkels.length) return 0;
  return Math.max(...sokkels.map((v) => v.doos[5])) * PXH;
}

// Zeeft g.vormen op `deelHoogtes` ({deel: hoogste pixel die nog mag, of Infinity voor "heel
// laten"}); een deel dat er niet in staat, valt weg. `halfDeel`: deze delen in tweeën knippen op
// hun eigen halve hoogte, onderste helft in zijn eigen textuur (bedekt), bovenste in kale
// houttint (fase 5) — zie de toelichting bij `fasesVan`.
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

// De vijf fases. Sokkel/muur/stoep/dak/kap die hier INF krijgen (of helemaal niet genoemd worden)
// gaan via `zeefVormen` gewoon uit `g` (de echte tekening, zie hierboven); wat een fase zelf moet
// LATEN GROEIEN (de ring, het geraamte, de muurschil met steigers, de spanten) komt er na afloop
// bij via `gz.vormen = gz.vormen.concat(...)` — nieuwe vormen, hieronder gebouwd uit `g0` (voet en
// hoogtes, zie de koptekst), niet uit de gezeefde `g`.
function fasesVan(g0) {
  const muurTop = g0.lagen[g0.lagen.length - 1].h1; // pixels, zoals muurH
  const sokkelTop = sokkelHoogtePx(g0);
  const wallCut = Math.min(muurTop, Math.max(sokkelTop + 10, Math.round((muurTop * 2) / 3)));
  const INF = Infinity;
  return [
    {
      naam: 'fundering',
      zeef: (g) => { const gz = zeefVormen(g, {}); gz.vormen = funderingRing(g0); return gz; },
      stapel: true,
    },
    {
      naam: 'geraamte',
      zeef: (g) => { const gz = zeefVormen(g, { [DEEL.sokkel]: INF }); gz.vormen = gz.vormen.concat(geraamteVormen(g0)); return gz; },
    },
    {
      naam: 'muren-steigers',
      zeef: (g) => {
        const gz = zeefVormen(g, { [DEEL.sokkel]: INF, [DEEL.stoep]: INF });
        gz.vormen = gz.vormen.concat(muurSchilVormen(g0, wallCut), steigerVormen(g0, wallCut, ['Z', 'O']));
        return gz;
      },
    },
    {
      naam: 'dakgebinte',
      zeef: (g) => {
        const gz = zeefVormen(g, { [DEEL.sokkel]: INF, [DEEL.muur]: INF, [DEEL.stoep]: INF });
        gz.vormen = gz.vormen.concat(dakgebinteVormen(g), steigerVormen(g0, muurTop, ['Z', 'O']));
        return gz;
      },
    },
    {
      naam: 'half-gedekt',
      zeef: (g) => {
        const gz = zeefVormen(g, { [DEEL.sokkel]: INF, [DEEL.muur]: INF, [DEEL.stoep]: INF, [DEEL.dak]: INF, [DEEL.kap]: INF }, { halfDeel: [DEEL.dak, DEEL.kap] });
        gz.vormen = gz.vormen.concat(steigerVormen(g0, muurTop, ['Z']));
        return gz;
      },
    },
  ];
}

// De bouwstapel (fase 1 "fundering"): een stapel hout en een hoop steen, schuin voor de voet —
// verder ongewijzigd sinds de eerdere versie van dit bestand, alleen losgemaakt van de steigers
// (die zijn nu vormen, zie `steigerVormen`, niet meer een D.schoorpaal-modelletje per zijde).
function extraModellen(g, fase, zaad) {
  if (!fase.stapel) return [];
  const [x0, , , y1] = g.voet;
  // Een maat groter dan het gewone plaatje (F.geschaald, hetzelfde recept als D.kar/D.hooibaal
  // e.a.): zo val je meteen op als "hier wordt gebouwd" naast een fundering die zelf nog maar een
  // lage ring is. De offsets hieronder schalen mee, anders kruipen de twee grotere hopen in elkaar.
  const s = 1.4;
  // Twee losse hopen, niet twee die elkaar overlappen: in dit isometrische aanzicht liggen twee
  // punten die in de wereld een eind uit elkaar staan op het scherm soms bijna op elkaar (X en Y
  // wegen allebei half mee in de schermbreedte) — vandaar de ruime, ongelijke afstand hieronder.
  return [
    { model: F.geschaald(D.houtstapel(zaad), s), gx: x0 / TEGEL - 0.3 * s, gy: y1 / TEGEL + 0.6 * s, richting: 'Z', z: 0 },
    { model: F.geschaald(VW.puin(zaad + 5, 7), s), gx: x0 / TEGEL - 1.9 * s, gy: y1 / TEGEL + 0.6 * s, richting: 'Z', z: 0 },
  ];
}

// ---------------------------------------------------------------- nieuwe geometrie per fase
// De vier functies hieronder tekenen GEEN deel van het echte huis: ze bouwen zelf `blok`-vormen
// (dozen, convex — zie dorp.cjs "convexe vormen") uit alleen `g0.voet` ([x0,y0,x1,y1], wereld-
// pixels) en de hoogtes uit `g0.lagen`. Zichtbaar in dit isometrische aanzicht zijn altijd maar
// twee van de vier wanden VAN EEN MASSIEVE DOOS (de zuidwand op y1, de oostwand op x1 — dezelfde
// twee als `laag.wanden` in huis(): een massieve doos toont nooit zijn eigen achterkant, welke
// kant dat ook is). Bij het AFGEWERKTE huis is dat dus terecht: de noord- en westwand liggen
// binnen in de doos verscholen en krijgen in huis() geen textuur. Deze vier fases zijn echter geen
// massieve dozen — een lage ring, een los geraamte, een dunne schil — en zonder dak erop kijk je
// er zo overheen naar binnen. Dan wordt zichtbaar wat er nog ONTBREEKT als je alleen de zuid- en
// oostkant zou tekenen: een decorstuk van twee wanden in plaats van een gebouw met vier. Daarom
// bouwen `funderingRing`, `geraamteVormen` en `muurSchilVormen` hun vormen RONDOM (alle vier de
// kanten) — de noord- en westkant met dezelfde soort dunne strook, maar dan tegen de ACHTERKANT
// van de voet aan (bij x0/y0 in plaats van x1/y1). Zo'n strook heeft zelf ook maar twee zichtbare
// vlakken (nooit zijn buitenkant, die wijst weg van de camera) — maar dat ene zichtbare binnenvlak
// is precies het vlak dat je van bovenaf, door het open dak heen, hoort te zien.

// Fase 1, fundering: een lage ring (één, twee lagen steen) rondom de hele omtrek van de voet.
function funderingRing(g0) {
  const [x0, y0, x1, y1] = g0.voet;
  const dik = 8; // wereld-pixels dik, over de rand van de voet heen
  const hoog = 12; // wereld-pixels — bewust laag, dit is nog geen muur
  const tex = heleSteen(4);
  return [
    D.blok(x0 / TEGEL, (y1 - dik / 2) / TEGEL, x1 / TEGEL, (y1 + dik / 2) / TEGEL, 0, hoog, tex, { deel: DEEL.sokkel }), // zuid
    D.blok((x1 - dik / 2) / TEGEL, y0 / TEGEL, (x1 + dik / 2) / TEGEL, y1 / TEGEL, 0, hoog, tex, { deel: DEEL.sokkel }), // oost
    D.blok(x0 / TEGEL, (y0 - dik / 2) / TEGEL, x1 / TEGEL, (y0 + dik / 2) / TEGEL, 0, hoog, tex, { deel: DEEL.sokkel }), // noord (van binnen zichtbaar)
    D.blok((x0 - dik / 2) / TEGEL, y0 / TEGEL, (x0 + dik / 2) / TEGEL, y1 / TEGEL, 0, hoog, tex, { deel: DEEL.sokkel }), // west (van binnen zichtbaar)
  ];
}

// Fase 2, geraamte: hoekstijlen en tussenstijlen langs alle vier de muren, met twee balklagen
// rondom (op de fundering en bovenaan) — losse dunne balken, met lucht ertussen.
// `sokkelHoogtePx(g0)` (hierboven gedefinieerd) is het echte, al gebouwde plint; de stijlen
// beginnen daar bovenop. De hoekstijlen tellen al als alle vier de hoeken (ze staan op
// [x0,y0]/[x1,y0]/[x0,y1]/[x1,y1]); de tussenstijlen en balklagen hieronder gaan nu ook rondom, zie
// de toelichting bij `funderingRing`.
function geraamteVormen(g0) {
  const [x0, y0, x1, y1] = g0.voet;
  const sokkelTop = sokkelHoogtePx(g0);
  const muurTop = g0.lagen[g0.lagen.length - 1].h1;
  const dik = 6;
  const tex = heleHout(4);
  const vormen = [];
  const stijl = (px, py) => vormen.push(D.blok((px - dik / 2) / TEGEL, (py - dik / 2) / TEGEL, (px + dik / 2) / TEGEL, (py + dik / 2) / TEGEL, sokkelTop, muurTop, tex, { deel: DEEL.muur }));
  for (const [px, py] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) stijl(px, py);
  const nZ = Math.max(0, Math.round((x1 - x0) / 55) - 1); // tussenstijlen langs zuid- én noordwand
  for (let i = 1; i <= nZ; i++) {
    const px = x0 + ((x1 - x0) * i) / (nZ + 1);
    stijl(px, y1);
    stijl(px, y0);
  }
  const nO = Math.max(0, Math.round((y1 - y0) / 55) - 1); // en langs oost- én westwand
  for (let i = 1; i <= nO; i++) {
    const py = y0 + ((y1 - y0) * i) / (nO + 1);
    stijl(x1, py);
    stijl(x0, py);
  }
  for (const h of [sokkelTop + dik / 2, muurTop - dik / 2]) { // onderregel en bovenregel, rondom
    vormen.push(D.blok(x0 / TEGEL, (y1 - dik) / TEGEL, x1 / TEGEL, y1 / TEGEL, h - dik / 2, h + dik / 2, tex, { deel: DEEL.muur })); // zuid
    vormen.push(D.blok((x1 - dik) / TEGEL, y0 / TEGEL, x1 / TEGEL, y1 / TEGEL, h - dik / 2, h + dik / 2, tex, { deel: DEEL.muur })); // oost
    vormen.push(D.blok(x0 / TEGEL, y0 / TEGEL, x1 / TEGEL, (y0 + dik) / TEGEL, h - dik / 2, h + dik / 2, tex, { deel: DEEL.muur })); // noord
    vormen.push(D.blok(x0 / TEGEL, y0 / TEGEL, (x0 + dik) / TEGEL, y1 / TEGEL, h - dik / 2, h + dik / 2, tex, { deel: DEEL.muur })); // west
  }
  return vormen;
}

// Fase 3, muren-steigers: een DUNNE schil (de echte wandtextuur van `g0.lagen[i].tex`, dus met
// ramen en deuren erin — huis() rekent zelf al met wereld-X/Y, een dunnere doos verandert daar
// niets aan) tot `cutPx` — dat IS "buitenvorm min binnenvorm", alleen als een dunne rand in plaats
// van een echte aftrekking (die kan hier niet: één `vorm` is altijd convex, een holle doos niet,
// zie dorp.cjs "convexe vormen"). Het binnenste laten we LEEG (de donkere achtergrond doet dienst
// als schaduw) in plaats van er een plat, donker vlak in te zetten: dit beeld staat schuin van
// boven, dus een vlak dat het hele grondvlak beslaat oogt — hoe laag ook — altijd als een dicht
// dak, nooit als een gat waar je in kijkt. Precies de fout die deze fase moest oplossen, alleen
// donker geverfd. Een dun randje mag dat wel (`funderingRing` hierboven, of de bovenkant van de
// schil hier): dat beslaat maar een fractie van het grondvlak.
function muurSchilVormen(g0, cutPx) {
  const [x0, y0] = g0.voet; // de achterste hoek: die verschuift nooit, ook niet met uitkraging
  const dik = 9;
  const vormen = [];
  for (const laag of g0.lagen) {
    const top = Math.min(laag.h1, cutPx);
    if (top <= laag.h0) continue;
    // laag.x1/y1, niet g0.voet[2]/[3]: bij een overstekende verdieping (de herberg) staat de
    // bovenste laag verder naar voren dan de onderste, en dat is precies wat laag.x1/y1 al weet.
    const { x1, y1 } = laag;
    vormen.push(D.blok(x0 / TEGEL, (y1 - dik) / TEGEL, x1 / TEGEL, y1 / TEGEL, laag.h0, top, laag.tex, { deel: DEEL.muur })); // zuid
    vormen.push(D.blok((x1 - dik) / TEGEL, y0 / TEGEL, x1 / TEGEL, y1 / TEGEL, laag.h0, top, laag.tex, { deel: DEEL.muur })); // oost
    // Noord en west: dezelfde dunne schil, maar tegen de ACHTERKANT van de voet (bij x0/y0) — het
    // vlak dat laag.tex hier tekent (D.blok se 'y'/'x'-vlak, de BINNENkant van deze strook) is
    // precies het vlak dat je van bovenaf, door het open dak heen, naar binnen ziet, zie de
    // toelichting bij `funderingRing` hierboven. Dezelfde echte wandtextuur als zuid/oost (ramen
    // en al): huis() heeft nooit een eigen gevelontwerp voor de achterkant, dus is dit de
    // dichtstbijzijnde echte muurtextuur.
    vormen.push(D.blok(x0 / TEGEL, y0 / TEGEL, x1 / TEGEL, (y0 + dik) / TEGEL, laag.h0, top, laag.tex, { deel: DEEL.muur })); // noord
    vormen.push(D.blok(x0 / TEGEL, y0 / TEGEL, (x0 + dik) / TEGEL, y1 / TEGEL, laag.h0, top, laag.tex, { deel: DEEL.muur })); // west
  }
  return vormen;
}

// Steigerpalen (rechtop, dun, om de ~45px langs de wand — nu tot ruim boven de muur, zodat de
// steiger ook als steiger leesbaar is en niet als een tweede, dunnere muur) én -planken (twee
// liggers, op 40% en 80% van `hoogte`), een stukje los van de gevel. `zijden`: welke van de twee
// zichtbare wanden ('Z' zuid/y, 'O' oost/x) — fase 5 (half-gedekt) krijgt alleen 'Z', de helft
// minder dan fase 3/4.
function steigerVormen(g0, hoogte, zijden) {
  const [x0, y0, x1, y1] = g0.voet;
  const paalDik = 5;
  const plankDik = 4;
  const uit = 8; // hoe ver de steiger los van de gevel staat
  const uitsteek = 16; // hoeveel de palen boven `hoogte` (de muur, op dat moment) uitsteken
  const paalTop = hoogte + uitsteek;
  const tex = heleHout(3);
  const vormen = [];
  const liggerHoogtes = [Math.round(hoogte * 0.4), Math.round(hoogte * 0.8)];
  if (zijden.includes('Z')) {
    const n = Math.max(2, Math.round((x1 - x0) / 45));
    for (let i = 0; i <= n; i++) {
      const px = x0 + ((x1 - x0) * i) / n;
      vormen.push(D.blok((px - paalDik / 2) / TEGEL, (y1 + uit) / TEGEL, (px + paalDik / 2) / TEGEL, (y1 + uit + paalDik) / TEGEL, 0, paalTop, tex, { deel: DEEL.muur }));
    }
    for (const h of liggerHoogtes) vormen.push(D.blok(x0 / TEGEL, (y1 + uit) / TEGEL, x1 / TEGEL, (y1 + uit + plankDik) / TEGEL, h, h + 5, tex, { deel: DEEL.muur }));
  }
  if (zijden.includes('O')) {
    const n = Math.max(2, Math.round((y1 - y0) / 45));
    for (let i = 0; i <= n; i++) {
      const py = y0 + ((y1 - y0) * i) / n;
      vormen.push(D.blok((x1 + uit) / TEGEL, (py - paalDik / 2) / TEGEL, (x1 + uit + paalDik) / TEGEL, (py + paalDik / 2) / TEGEL, 0, paalTop, tex, { deel: DEEL.muur }));
    }
    for (const h of liggerHoogtes) vormen.push(D.blok((x1 + uit) / TEGEL, y0 / TEGEL, (x1 + uit + plankDik) / TEGEL, y1 / TEGEL, h, h + 5, tex, { deel: DEEL.muur }));
  }
  return vormen;
}

// Fase 4, dakgebinte: de twee dakvlakken (deel "dak") uit de ONGEZEEFDE `g` (dus nog met hun
// echte vlakken — dak/goot/nok/kant/onder, zie dakVoor/dakAchter in huis()) in repen knippen langs
// de nok, met lucht ertussen: twee extra vlakken per reep (`snijVorm`, zie de koptekst), precies
// zoals `magHoogte` dat voor een hoogtesnede doet, hier voor twee zij-sneden. Welke wereldas "langs
// de nok" is, lezen we af aan de eigen `doos` van het dakvlak (dat is altijd veel langer dan
// breed — de nok, plus overstek aan beide kanten — dan de halve diepte van ÉÉN dakschild) in
// plaats van dat we nokX/a0/a1/... uit huis() overnemen. De nokkap (deel "kap") blijft heel: één
// doorlopende nokbalk, geen losse stukken.
function dakgebinteVormen(g) {
  const spantB = 9; // wereld-pixels breed
  const gat = 13; // wereld-pixels lucht ertussen
  const periode = spantB + gat;
  const repen = [];
  for (const v of g.vormen.filter((vo) => vo.deel === DEEL.dak)) {
    if (!v.doos) continue;
    const [bx0, by0, , bx1, by1] = v.doos;
    const asX = bx1 - bx0 >= by1 - by0; // de langste kant van het dakvlak is altijd "langs de nok"
    const start = asX ? bx0 : by0;
    const eind = asX ? bx1 : by1;
    const n = Math.max(3, Math.floor((eind - start) / periode));
    const stap = (eind - start) / n;
    for (let i = 0; i < n; i++) {
      const s0 = start + i * stap;
      const s1 = Math.min(eind, s0 + spantB);
      const nMin = asX ? [-1, 0, 0] : [0, -1, 0];
      const nMax = asX ? [1, 0, 0] : [0, 1, 0];
      let reep = snijVorm(v, nMin, -s0, 'spant-links');
      reep = snijVorm(reep, nMax, s1, 'spant-rechts');
      reep.tex = heleHout(4);
      if (reep.doos) {
        const nd = reep.doos.slice();
        if (asX) { nd[0] = Math.max(nd[0], s0); nd[3] = Math.min(nd[3], s1); } else { nd[1] = Math.max(nd[1], s0); nd[4] = Math.min(nd[4], s1); }
        reep.doos = nd;
      }
      repen.push(reep);
    }
  }
  const nokbalk = g.vormen.filter((v) => v.deel === DEEL.kap).map((v) => ({ ...v, tex: heleHout(4) }));
  return repen.concat(nokbalk);
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
  if (spec.huis) return HZ.renderHuisFasen(spec.huis);
  const g0 = spec.maak();
  const fasen = fasesVan(g0);
  // extraModellen (de bouwstapel) hoort er al bij VOOR het meten: meetGebouw scant de getekende
  // plaat, en telt dus alleen mee wat er bij het meten al aan g.modellen hangt. Eerder werd de
  // stapel er pas bij het renderen bijgezet — dan lag de cel er al, te krap, en viel de steenhoop
  // (verder van het huis dan de houtstapel) buiten beeld.
  const gAlle = fasen.map((f, i) => {
    const g = f.zeef(spec.maak());
    g.modellen = extraModellen(g0, f, 1000 + i);
    return g;
  });
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
  const platen = fasen.map((f, i) => gebouwLos(gAlle[i], cb, ch, ankerX, ankerY, metingen[i].hoek));
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
// Een gebouw is een strook van vijf cellen naast elkaar; de stroken liggen in rijen naast elkaar, tot
// MAX_BREED (geen gedeeld Tiled-raster nodig, zie hierboven). Eerst stond elk gebouw op een eigen rij,
// en met de huizen van ronde 4b werd het vel 15.593 pixels hoog: boven 16.384 laadt een videokaart
// een beeld niet meer als één geheel.
const MAX_BREED = 8192;
function schrijfSpelVel(resultaten) {
  const plek = [];
  let x = 0;
  let y = 0;
  let rijH = 0;
  let breedte = 0;
  for (const r of resultaten) {
    const b = r.cb * r.platen.length;
    if (x > 0 && x + b > MAX_BREED) {
      y += rijH;
      x = 0;
      rijH = 0;
    }
    plek.push([x, y]);
    x += b;
    rijH = Math.max(rijH, r.ch);
    breedte = Math.max(breedte, x);
  }
  const hoogte = y + rijH;
  const vel = new K.Plaat(breedte, hoogte);
  const fasenJson = {};
  resultaten.forEach((r, k) => {
    const [x0, y0] = plek[k];
    const lijst = [];
    r.platen.forEach((p, i) => {
      vel.plak(p, x0 + i * r.cb, y0);
      lijst.push({ x: x0 + i * r.cb, y: y0, b: r.cb, h: r.ch, anker: [r.ankerX, r.ankerY + 16], naam: r.fasenNamen[i] });
    });
    fasenJson[r.tekening] = { gebouw: r.id, beslaat: r.beslaat, fasen: lijst };
  });
  fs.mkdirSync(TEGELS, { recursive: true });
  schrijfPng(path.join(TEGELS, 'bouwfasen.png'), vel, null);
  const data = {
    _lees_dit: 'Vijf bouwfases per gebouw uit tegels/gebouwen.tsx en tegels/huizen.tsx, gemaakt door '
      + 'gereedschap/pixelart/bouwfasen.cjs — niet met de hand bijwerken. Sleutel is de '
      + 'tekeningnaam (T.GEBOUWEN.<soort>.tekening, na "gebouwen/" of "huizen/"). Per fase (0..4, oplopend '
      + 'in afbouw): x/y/b/h snijdt de cel uit bouwfasen.png, anker is het punt in die cel dat op '
      + 'T.naarScherm(x, y) van de aangeklikte tegel komt — dezelfde achterste-voethoek-afspraak '
      + 'als tegels.json ("anker" bij de tsx-vellen), en beslaat is dezelfde tegelmaat als in '
      + 'gebouwen.tsx of huizen.tsx voor dezelfde tekening. Fase 5 (klaar) staat niet hier: dat is gewoon de '
      + 'bestaande tegel in tegels/gebouwen.png of tegels/huizen.png.',
    breedte: vel.b, hoogte: vel.h, bestand: 'bouwfasen.png',
    fasen: fasenJson,
  };
  // bouwfasen.json is de bron, bouwfasen.js dezelfde inhoud als gewoon script (zelfde recept als
  // tegels.js/naar-tiled.cjs), zodat file:// hem ook kan lezen — het spel opent index.html soms
  // rechtstreeks vanaf schijf, zonder server, en dan werkt fetch() niet (CLAUDE.md, "Draaien en
  // testen"; js/sprites.js leest T.BOUWFASEN vandaar, niet via fetch).
  const json = JSON.stringify(data, null, 1);
  fs.writeFileSync(path.join(TEGELS, 'bouwfasen.json'), json + '\n');
  fs.writeFileSync(
    path.join(TEGELS, 'bouwfasen.js'),
    '// Gemaakt door gereedschap/pixelart/bouwfasen.cjs — niet met de hand bijwerken.\n'
      + '// Dezelfde inhoud als bouwfasen.json, als script, zodat file:// het ook kan lezen (zie js/sprites.js).\n'
      + '(function (T) {\n  T.BOUWFASEN = '
      + json.replace(/\n/g, '\n  ')
      + ';\n})(globalThis.Spel = globalThis.Spel || {});\n',
  );
  return { breedte: vel.b, hoogte: vel.h };
}

// ---------------------------------------------------------------- hoofdprogramma

async function main() {
  const GEVRAAGD = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const indices = BUILDINGEN
    .map((b, i) => i)
    .filter((i) => !GEVRAAGD.length || GEVRAAGD.includes(BUILDINGEN[i].id) || GEVRAAGD.includes(BUILDINGEN[i].tekening));
  if (!indices.length) { console.error('geen gebouw gevonden voor:', GEVRAAGD.join(' ')); process.exit(1); }
  const draden = Math.max(1, Math.min(6, os.cpus().length - 1, indices.length));
  console.log(`bouwfasen: ${indices.length} gebouw(en), ${draden} draad/draden`);
  const t0 = Date.now();
  const resultaten = await renderAlleGebouwen(indices, draden);
  for (const r of resultaten) schrijfProefPlaat(r);
  schrijfOverzicht(resultaten);
  console.log(`klaar in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`  proefplaten: gereedschap/pixelart/uit/bouwfasen/ (${resultaten.length} + overzicht.png, niet in git)`);
  // Het spelvel alleen met alle gebouwen: het vel wordt in zijn geheel opnieuw geschreven, en met één
  // gebouw erop zouden de fases van alle andere uit het spel verdwijnen.
  if (GEVRAAGD.length) {
    console.log('  spelvel niet geschreven: dat gebeurt alleen als alle gebouwen gerenderd zijn (zonder namen)');
    return;
  }
  const { breedte, hoogte } = schrijfSpelVel(resultaten);
  console.log(`  spelvel: tegels/bouwfasen.png (${breedte}×${hoogte}) + tegels/bouwfasen.json + .js`);
}

if (isMainThread && require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { BUILDINGEN, fasesVan, renderGebouw };
