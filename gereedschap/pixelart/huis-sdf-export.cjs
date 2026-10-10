'use strict';
// huis-sdf-export.cjs: platen van de huizenbouwer uit afstandsfuncties (huis-sdf.cjs).
//
//   node gereedschap/pixelart/huis-sdf-export.cjs materiaal uit/proefhuis/materiaal.png
//   node gereedschap/pixelart/huis-sdf-export.cjs vormen    uit/proefhuis/vormen.png
//   node gereedschap/pixelart/huis-sdf-export.cjs een <vorm> <lagen> <zaad> [nok] [sleutel=waarde ...]
//                                                          uit/proefhuis/een.png en een-x2.png
//   node gereedschap/pixelart/huis-sdf-export.cjs           uit/proefhuis/vergelijk.png
//   node gereedschap/pixelart/huis-sdf-export.cjs knoppen   ook uit/proefhuis/knoppen.png
//   node gereedschap/pixelart/huis-sdf-export.cjs uitbouwen uit/proefhuis/uitbouwen.png
//   node gereedschap/pixelart/huis-sdf-export.cjs ladder    uit/proefhuis/ladder.png (ronde 4b)
//   node gereedschap/pixelart/huis-sdf-export.cjs afwisseling  uit/proefhuis/afwisseling.png (vraag 114, 2b)
//   node gereedschap/pixelart/huis-sdf-export.cjs stijl wit    uit/proefhuis/stijl-wit.png (vraag 114, 2a: een bouwstijl)
//   node gereedschap/pixelart/huis-sdf-export.cjs verhouding   uit/proefhuis/verhouding.png (vraag 114, 2c)
//   node gereedschap/pixelart/huis-sdf-export.cjs steen        uit/proefhuis/steen.png (de steen van de torens)
//   node gereedschap/pixelart/huis-sdf-export.cjs rondom       uit/proefhuis/rondom.png (vraag 124, B: de draaibare huizen)
//   node gereedschap/pixelart/huis-sdf-export.cjs groot [stijl]  uit/proefhuis/groot.png (vraag 114, stap 3: de grote gebouwen)
//   node gereedschap/pixelart/huis-sdf-export.cjs voorbeeld [dak] uit/proefhuis/voorbeeld.png (vraag 144: het voorbeeldhuis)
//
// uitbouwen.png (ronde 3): de uitbouwen elk op een huis, de losse tuinstukken (tuin-sdf.cjs) naast
// elkaar met een tuintje daaruit, en zes huizen met willekeurige zaden, los van elkaar. De platen
// van ronde 1 en 2 zetten de uitbouwen uit (uit: false), zodat ze blijven zoals Marcel ze zag.
// Met 'een' vraagt uit=aanbouw,erker,kapellen:2,luiken:den ze op, en uit=false zet ze uit.
//
// materiaal.png (ronde 2): de wanden naast elkaar, de daken op een L, twee torens met een plat dak
// en de lap in het riet van dichtbij, en een dorp van zes willekeurige zaden in één beeld. Met
// een <vorm> ... dak=pannen wand=blokhut hout=schors kiest 'een' ook het materiaal.
//
// vormen.png: een raster van huizen, rechthoek, L en T (de rijen), elk in één, anderhalf en twee
// lagen (de kolommen), elk met een eigen zaad en de tovenaar ervoor voor de maat. De middelste
// kolom heeft de nok langs y (gespiegeld). De huizen renderen tegelijk, elk in een eigen draad.
//
// vergelijk.png: bovenaan op spelmaat een huis zoals het nu uit dorp.cjs komt (dorpshuis, zaad 3,
// 8 × 6 tegels met riet, dezelfde kant op als het proefhuis) en drie zaden van het proefhuis, elk
// met de tovenaar ervoor; onderaan hetzelfde huidige huis en het eerste proefhuis twee keer
// vergroot, om de details te beoordelen. knoppen.png: het eerste proefhuis met alle drie de
// knoppen aan, en telkens met één uit.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const K = require('./kern.cjs');
const F = require('./figuren.cjs');
const D = require('./dorp.cjs');
const T = require('./toren.cjs');
const HS = require('./huis-sdf.cjs');
const TU = require('./tuin-sdf.cjs');
const DL = require('./dorpelingen.cjs');
const P2 = require('./dorp2.cjs');
const { VLAG, RAMP, LICHT } = K;

const UIT = path.join(__dirname, 'uit', 'proefhuis');
fs.mkdirSync(UIT, { recursive: true });

// een paneel: het midden van de plattegrond op (OX, OY)
const PB = 580;
const PH = 620;
const OX = 290;
const OY = 480;
const MAAT = [8, 6];
const TOVENAAR = [1.4, 4.8]; // in tegels, voor de lange muur
const NU_ZAAD = 3;
const ZADEN = [1, 2, 3];

// Wie er voor de maat bij staat: de tovenaar (de platen van ronde 1 tot 4b), een boer van het spel
// ('boer'), of niemand (false).
function figuur(wie = 'tovenaar') {
  if (wie === 'boer') return DL.boer();
  return wie ? F.tovenaar(84) : null;
}

function grond(B) {
  const kaart = D.grondKaart({ zaad: 5 });
  K.tekenDozen(B, [K.doos(-40, -40, 44, 44, -16, 0, D.grondTex(kaart, { dor: true }))]);
  return kaart;
}

// Het huis zoals het nu is, precies zoals huizen-proef.cjs het tekent.
function paneelNu(zaad = NU_ZAAD) {
  const B = new K.Beeld(PB, PH, OX, OY);
  const kaart = grond(B);
  const t0 = Date.now();
  const [b, d] = MAAT;
  const g = D.dorpshuis(-b / 2 + 0.5, -d / 2 + 0.5, zaad, { maat: MAAT, dak: 'riet', rook: false });
  D.zetGebouw(B, g);
  const ms = Date.now() - t0;
  D.zetModel(B, F.tovenaar(84), TOVENAAR[0], TOVENAAR[1], 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  D.zonSchaduw(B, g.vormen, { zon: D.AVONDZON, kracht: 2.6 });
  D.voetSchaduw(B, [g]);
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B);
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms };
}

// De zon op de grond rond het proefhuis: een harde slagschaduw van het huis en de tovenaar (met
// dezelfde zon als waarmee tekenWereld het huis zelf schaduwt), en de grond langs de voet een
// tint donkerder. Zet ook B.schaduw en B.zon voor avondlicht(), zoals zonSchaduw in dorp.cjs.
function grondZon(B, R, o = {}) {
  const L = o.zon || LICHT;
  const kracht = o.kracht ?? 2.6;
  const modellen = (B.modellen || []).filter((m) => m.schaduw);
  const n = B.b * B.h;
  if (!B.zon) B.zon = new Float32Array(n);
  const schaduw = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (!(B.vlag[i] & VLAG.VLOER) || B.ramp[i] < 0 || B.obj[i] !== 0) continue;
    const X = B.pos[i * 3];
    const Y = B.pos[i * 3 + 1];
    const Z = B.pos[i * 3 + 2] + 0.3;
    let raak = false;
    let t = 0.5;
    for (let s = 0; s < 240 && t < 1000; s++) {
      const z = Z + L[2] * t;
      if (z > (o.tot ?? 480)) break; // o.tot: hoe hoog er iets kan staan dat schaduw werpt (een toren)
      const d = R.f(X + L[0] * t, Y + L[1] * t, z);
      if (d < 0.1) {
        raak = true;
        break;
      }
      t += Math.max(d * 0.85, 0.3);
    }
    if (!raak) {
      for (const m of modellen) {
        if (D.modelRaakt(m, [X, Y, Z], L)) {
          raak = true;
          break;
        }
      }
    }
    if (raak) {
      B.stap[i] -= kracht;
      schaduw[i] = 1;
      B.zon[i] = 0;
      B.vlag[i] |= VLAG.GLAD;
    } else B.zon[i] = L[2];
    const dv = R.f(X, Y, 3);
    if (dv < 12) B.stap[i] -= dv < 4 ? 1.8 : dv < 8 ? 1.2 : 0.6;
  }
  B.schaduw = schaduw;
}

// avondlicht zoals in dorp.cjs, maar de veldsteen blijft koel (HS.WARM, huis-sdf.cjs)
const WARM = HS.WARM;

function paneelProef(zaad, knoppen = {}) {
  const B = new K.Beeld(PB, PH, OX, OY);
  const kaart = grond(B);
  const t0 = Date.now();
  const W = HS.proefhuis(zaad, { knoppen, b: MAAT[0], d: MAAT[1] });
  const R = T.tekenWereld(B, W);
  const ms = Date.now() - t0;
  B.lichten.push(...W.lichten);
  D.zetModel(B, F.tovenaar(84), TOVENAAR[0], TOVENAAR[1], 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  grondZon(B, R, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms };
}

// ---------------------------------------------------------------- een huis naar keuze

// Het kader van een huis op het scherm (HS.kaderVan, ook voor het huizenvel van het spel), met de
// tovenaar voor de deur erbij. draai: het huis zoveel kwartslagen gedraaid (een stand van een stijl, vraag 124, B).
function kaderVan(H, draai = 0) {
  const [tx, ty] = T.draaiNaar(draai, HS.voorDeDeur(H, 1.25));
  const X = tx * K.TEGEL;
  const Y = ty * K.TEGEL;
  return HS.kaderVan(H, [[-34, 0], [34, 0], [0, 110]].map(([dx, dz]) => [X + dx * K.EX[0], Y + dx * K.EX[1], dz]), draai);
}

// Een huis op een stuk grond, met de tovenaar voor de deur. o.b, o.h: de maat van het paneel,
// o.onder: hoeveel ruimte er onder de voet van het huis blijft.
function paneelHuis(spec, o = {}) {
  const t0 = Date.now();
  const draai = spec.draai || 0;
  const H = HS.maten(spec.zaad, spec);
  const kd = kaderVan(H, draai);
  const b = o.b ?? Math.ceil(kd.b + 80);
  const h = o.h ?? Math.ceil(kd.h + 120);
  const onder = o.onder ?? 70;
  const OX = Math.round(b / 2 - (kd.x0 + kd.x1) / 2);
  const OY = Math.round(h - onder - kd.y1);
  const B = new K.Beeld(b, h, OX, OY);
  const kaart = grond(B);
  const W = HS.huis(spec.zaad, spec);
  const R = T.tekenWereld(B, W, { draai });
  const msHuis = Date.now() - t0;
  B.lichten.push(...T.lichtenNaar(draai, W.lichten));
  const [tx, ty] = T.draaiNaar(draai, HS.voorDeDeur(W.H, 1.25));
  // de figuur voor de deur, als die naar je toe kijkt (niet met de deur achter, of in een stand die hem van je af keert)
  const fig = W.H.deurKant === 'achter' || draai >= 2 ? null : figuur(o.figuur);
  if (fig) D.zetModel(B, fig, tx, ty, 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  grondZon(B, R, { kracht: 2.6, tot: o.zonTot });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms: msHuis, msTotaal: Date.now() - t0, kd };
}

// Een gebouw uit meer delen (HS.samen; vraag 114, 2c) op een stuk grond, zoals paneelHuis: de herberg met zijn stal, de
// kapel met haar toren. delen: [{ spec, plek: [x, y] }] (plek in tegels vanaf het midden van het eerste deel); de figuur
// staat voor de deur van het deel o.deurVan (standaard het eerste).
// o.draai: het geheel zoveel kwartslagen gedraaid (een stand; vraag 114, stap 3). Een deel met erfmuur in zijn opgave is
// een muur om een erf (HS.erfmuur).
const wereldVan = (spec) => (spec.tuin ? tuinWereld(spec) : spec.erfmuur ? HS.erfmuur(spec.zaad, spec) : HS.huis(spec.zaad, spec));
// een tuinstuk (tuin-sdf.cjs) als deel voor samen(): één tegel, en zo hoog als een mens, voor het kader
function tuinWereld(spec) {
  const W = require('./tuin-sdf.cjs').tuinstuk(spec.tuin, spec.zaad || 1);
  const h = K.TEGEL / 2;
  W.H = { ...W.H, vleugels: [], uitPunten: [[-h, -h, 0], [h, -h, 0], [-h, h, 0], [h, h, 0], [0, 0, 70]] };
  return W;
}
const samenVan = (delen) => HS.samen(delen.map((d) => ({ W: wereldVan(d.spec), plek: d.plek })));
function paneelSamen(delen, o = {}) {
  const t0 = Date.now();
  const draai = o.draai || 0;
  const W = samenVan(delen);
  const kd = HS.kaderSamen(W, draai);
  const b = o.b ?? Math.ceil(kd.b + 80);
  const h = o.h ?? Math.ceil(kd.h + 120);
  const onder = o.onder ?? 70;
  const OX = Math.round(b / 2 - (kd.x0 + kd.x1) / 2);
  const OY = Math.round(h - onder - kd.y1);
  const B = new K.Beeld(b, h, OX, OY);
  const kaart = grond(B);
  const R = T.tekenWereld(B, W, { draai });
  const msHuis = Date.now() - t0;
  B.lichten.push(...T.lichtenNaar(draai, W.lichten));
  const deel = W.delen[o.deurVan ?? 0];
  const [dx, dy] = HS.voorDeDeur(deel.H, 1.25);
  const [tx, ty] = T.draaiNaar(draai, [dx + deel.plek[0] / K.TEGEL, dy + deel.plek[1] / K.TEGEL]);
  const fig = deel.H.deurKant === 'achter' || draai >= 2 ? null : figuur(o.figuur);
  if (fig) D.zetModel(B, fig, tx, ty, 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  grondZon(B, R, { kracht: 2.6, tot: o.zonTot });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms: msHuis, msTotaal: Date.now() - t0, kd };
}

// Een gebouw van de oude bouwer (dorp.cjs, dorp2.cjs), zoals het nu in het spel staat, om mee te vergelijken. Zijn
// onderste pixel komt op o.onder boven de onderkant van het paneel, zoals bij paneelHuis de voorste hoek van de voet.
const OUDE_GEBOUWEN = { kapel: () => P2.kapel(0, 0) };
function meetOud(naam) {
  const B = new K.Beeld(1400, 1400, 700, 900);
  D.zetGebouw(B, OUDE_GEBOUWEN[naam]());
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] < 0) continue;
    const x = i % B.b;
    const y = (i / B.b) | 0;
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return { x0: x0 - 700, x1: x1 - 700, y0: y0 - 900, y1: y1 - 900, b: x1 - x0, h: y1 - y0 };
}
function paneelOud(naam, o = {}) {
  const t0 = Date.now();
  const kd = meetOud(naam);
  const b = o.b ?? Math.ceil(kd.b + 80);
  const h = o.h ?? Math.ceil(kd.h + 120);
  const onder = o.onder ?? 70;
  const B = new K.Beeld(b, h, Math.round(b / 2 - (kd.x0 + kd.x1) / 2), Math.round(h - onder - kd.y1));
  const kaart = grond(B);
  const g = OUDE_GEBOUWEN[naam]();
  D.zetGebouw(B, g);
  D.grasPollen(B, kaart, { dicht: 0.8 });
  D.zonSchaduw(B, g.vormen, { zon: D.AVONDZON, kracht: 2.6 });
  D.voetSchaduw(B, [g]);
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B);
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms: Date.now() - t0, msTotaal: Date.now() - t0, kd };
}

// De huizen op vormen.png: per rij een plattegrond, per kolom een aantal lagen. Maten in tegels
// (ontwerp/wereld.md: een gewoon huis is 6 × 8, een herberg met twee lagen 7 × 9).
const VORMEN = [
  { naam: 'rechthoek 8x6', vorm: 'rechthoek', lagen: 1, zaad: 1, b: 8, d: 6 },
  { naam: 'rechthoek 8x6', vorm: 'rechthoek', lagen: 1.5, zaad: 2, b: 8, d: 6, nok: 'y' },
  { naam: 'rechthoek 9x7', vorm: 'rechthoek', lagen: 2, zaad: 3, b: 9, d: 7 },
  { naam: 'L 10x10', vorm: 'L', lagen: 1, zaad: 4, b: 10, d: 6, b2: 6, d2: 10 },
  { naam: 'L 10x10 smal andersom', vorm: 'L', lagen: 1.5, zaad: 5, b: 10, d: 6, b2: 5, d2: 10, kant: 1, nok: 'y' },
  { naam: 'L 10x10', vorm: 'L', lagen: 2, zaad: 6, b: 10, d: 6, b2: 6, d2: 10 },
  { naam: 'T 11x10', vorm: 'T', lagen: 1, zaad: 7, b: 11, d: 6, b2: 5, p2: 4 },
  { naam: 'T 11x10 gelijk', vorm: 'T', lagen: 1.5, zaad: 8, b: 11, d: 6, b2: 6, p2: 4, nok: 'y' },
  { naam: 'T 12x10', vorm: 'T', lagen: 2, zaad: 9, b: 12, d: 6, b2: 5, p2: 4 },
].map((s) => ({ dak: 'riet', wand: 'vakwerk', uit: false, ...s })); // ronde 1: alles riet en vakwerk, zonder uitbouwen
const LAGEN = { 1: '1 laag', 1.5: '1,5 laag', 2: '2 lagen' };
const opschrift = (s) => `${s.naam}  ${LAGEN[s.lagen]}  nok ${s.nok || 'x'}  zaad ${s.zaad}`;

// ---------------------------------------------------------------- een dorp

// De voetafdruk van een huis in de wereld (eenheden, rond zijn eigen oorsprong), met het dak erbij.
function voetAfdruk(H) {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const V of H.vleugels) {
    for (const sa of [-1, 1]) {
      for (const sq of [-1, 1]) {
        const [x, y] = V.wereld(sa * V.XR, sq * V.Qe0);
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
  }
  return { x0, x1, y0, y1 };
}

// Een rij huizen op één stuk grond, elk met een eigen zaad en dus een eigen vorm, maat, lagen en
// materiaal (kiesHuis en maten), om en om een eind naar voren en naar achteren zoals huizen langs
// een weg, met een zandpad ervoor. Eén beeld, zodat je ziet of een dorp gevarieerd oogt; de
// tovenaar staat voor de deur van het tweede huis. o.ruimte: hoeveel tegels er minstens tussen twee
// huizen liggen (standaard 0,4).
function paneelDorp(zaden, o = {}) {
  const t0 = Date.now();
  const TG = K.TEGEL;
  const SQ = Math.SQRT1_2;
  // een zaad (kiesHuis kiest het huis), of een hele opgave ({ zaad, vorm, ... }, zoals in huizen.cjs)
  const huizen = zaden.map((z) => {
    const spec = typeof z === 'object' ? z : { ...HS.kiesHuis(z), ...(o.uit === false ? { uit: false } : {}) };
    const H = HS.maten(spec.zaad, spec);
    return { spec, H, kd: kaderVan(H), vo: voetAfdruk(H) };
  });
  // van links naar rechts in beeld: een stap Dx (px) naar rechts is (D, -D) / 2√½ in de wereld
  const botst = (a, X, Y, b, X2, Y2, m) => a.x0 + X < b.x1 + X2 + m && b.x0 + X2 < a.x1 + X + m && a.y0 + Y < b.y1 + Y2 + m && b.y0 + Y2 < a.y1 + Y + m;
  let Dx = 0;
  huizen.forEach((hu, i) => {
    const diep = (i % 2 ? 1.4 : -1.4) * TG;
    if (i) Dx += ((huizen[i - 1].kd.b + hu.kd.b) / 2) * 0.5;
    for (;;) {
      hu.X = Dx / (2 * SQ) + diep;
      hu.Y = -Dx / (2 * SQ) + diep;
      if (huizen.slice(0, i).every((h2) => !botst(hu.vo, hu.X, hu.Y, h2.vo, h2.X, h2.Y, TG * (o.ruimte ?? 0.4)))) break;
      Dx += 6;
    }
    hu.sx = Dx;
    hu.sy = diep * SQ;
  });
  // de rij rond de oorsprong, anders loopt hij van de grond af (die is 84 tegels breed)
  const mid = Dx / 2;
  for (const hu of huizen) {
    hu.X -= mid / (2 * SQ);
    hu.Y += mid / (2 * SQ);
    hu.sx -= mid;
  }
  const x0 = Math.min(...huizen.map((h) => h.sx + h.kd.x0));
  const x1 = Math.max(...huizen.map((h) => h.sx + h.kd.x1));
  const y0 = Math.min(...huizen.map((h) => h.sy + h.kd.y0));
  const y1 = Math.max(...huizen.map((h) => h.sy + h.kd.y1));
  const b = Math.ceil(x1 - x0 + 40);
  const h = Math.ceil(y1 - y0 + 130);
  const B = new K.Beeld(b, h, Math.round(20 - x0), Math.round(30 - y0));
  // het pad: een eind voor de voorste huizen langs
  const voor = Math.max(...huizen.map((hu) => (hu.vo.x1 + hu.X + hu.vo.y1 + hu.Y) / 2)) / TG + 0.9;
  const kaart = D_grond(B, { paden: [{ punten: [[voor - 30, voor + 30], [voor + 2, voor - 2], [voor + 30, voor - 30]], breed: 1.7 }] });
  const Rs = [];
  for (const hu of huizen) {
    const W = HS.huis(hu.spec.zaad, hu.spec);
    Rs.push(T.tekenWereld(B, W, { plek: [hu.X, hu.Y] }));
    for (const l of W.lichten) B.lichten.push({ ...l, pos: [l.pos[0] + hu.X, l.pos[1] + hu.Y, l.pos[2]] });
  }
  const msHuis = Date.now() - t0;
  const hu = huizen[Math.min(1, huizen.length - 1)];
  const [tx, ty] = HS.voorDeDeur(hu.H, 1.25);
  const fig = figuur(o.figuur);
  if (fig) D.zetModel(B, fig, tx + hu.X / TG, ty + hu.Y / TG, 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  grondZon(B, { f: (x, y, z) => Math.min(...Rs.map((R) => R.f(x, y, z))) }, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  const extra = huizen.map((hu) => ({ zaad: hu.spec.zaad, x: hu.sx + B.OX, vorm: hu.spec.vorm, lagen: hu.spec.lagen, dak: hu.H.dak, wand: hu.H.wandLagen.map((l) => l.join(' en ')).join(', '), hout: hu.H.hout }));
  return { p: K.Plaat.van(K.kwantiseer(B)), ms: msHuis, msTotaal: Date.now() - t0, extra };
}
// de grond, met paden erop
function D_grond(B, o = {}) {
  const kaart = D.grondKaart({ zaad: 5, ...o });
  K.tekenDozen(B, [K.doos(-40, -40, 44, 44, -16, 0, D.grondTex(kaart, { dor: true }))]);
  return kaart;
}

// ---------------------------------------------------------------- ronde 3: tuinstukken en een losse rij

// Eén tuinstuk op een stukje gras: het midden van zijn tegel op (b/2, h - onder).
function paneelTuin(naam, zaad, o = {}) {
  const t0 = Date.now();
  const b = o.b ?? 150;
  const h = o.h ?? 136;
  const B = new K.Beeld(b, h, Math.round(b / 2), h - (o.onder ?? 34));
  const kaart = grond(B);
  const W = TU.tuinstuk(naam, zaad);
  const R = T.tekenWereld(B, W);
  const ms = Date.now() - t0;
  D.grasPollen(B, kaart, { dicht: 0.5 });
  grondZon(B, R || { f: () => 1e9 }, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms, msTotaal: Date.now() - t0 };
}

// Een tuintje uit de losse stukken, zoals Marcel het in Tiled zou neerzetten: vijf bij vier tegels
// met een hek eromheen, een hekje aan de voorkant, groente en kruiden erin, en een ton en een
// bankje ernaast. Elk stuk rendert los (tekenWereld per stuk); de hekken sluiten aan omdat hun
// regels op de rand van elke tegel even hoog liggen. Hek van latten (ronde 4a); zie hekjes.png
// (`node gereedschap/pixelart/proef-hekjes.cjs`) voor de vergelijking met het wilgentenenhek.
const TUINTJE = [
  ['hek-lat-hoek-boven', 0, 0], ['hek-lat-x', 1, 0], ['hek-lat-x', 2, 0], ['hek-lat-x', 3, 0], ['hek-lat-hoek-rechts', 4, 0],
  ['hek-lat-y', 0, 1], ['hek-lat-y', 0, 2], ['hek-lat-hoek-links', 0, 3],
  ['hek-lat-y', 4, 1], ['hek-lat-y', 4, 2], ['hek-lat-hoek-onder', 4, 3],
  ['hek-lat-x', 1, 3], ['hekje-lat-x', 2, 3], ['hek-lat-x', 3, 3],
  ['kool', 1, 1], ['prei', 2, 1], ['bonen', 3, 1], ['kruidenbed', 1, 2], ['kool', 2, 2], ['prei', 3, 2],
  ['regenton', 5, 0.6], ['bankje-y', 5.3, 2.2],
];
function paneelTuintje(o = {}) {
  const t0 = Date.now();
  const TG = K.TEGEL;
  const b = o.b ?? 380;
  const h = o.h ?? 270;
  // het midden van de tuin (tegel 2, 1.5) in het midden van het paneel
  const B = new K.Beeld(b, h, Math.round(b / 2 - (2 - 1.5) * 32), Math.round(h / 2 + 40 - (2 + 1.5) * 16));
  const kaart = grond(B);
  const Rs = [];
  TUINTJE.forEach(([naam, tx, ty], i) => {
    const W = TU.tuinstuk(naam, 70 + i);
    const R = T.tekenWereld(B, W, { plek: [tx * TG, ty * TG] });
    if (R) Rs.push(R);
  });
  const ms = Date.now() - t0;
  D.zetModel(B, F.tovenaar(84), 0.9, 4.45, 'Z'); // links voor het hekje, niet ervoor
  D.grasPollen(B, kaart, { dicht: 0.5 });
  grondZon(B, { f: (x, y, z) => Math.min(...Rs.map((R) => R.f(x, y, z))) }, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms, msTotaal: Date.now() - t0 };
}

// Zes huizen met willekeurige zaden in één scène, in twee rijen van drie, en zo ver uit elkaar
// dat hun kaders op het scherm elkaar nergens raken: op materiaal.png stonden ze zo dicht dat de
// daken en muren van de een voor die van de ander vielen, tot iets wat nergens op aansloot. De
// tovenaar staat tussen de voorste twee.
function paneelZes(zaden, o = {}) {
  const t0 = Date.now();
  const TG = K.TEGEL;
  const SQ = Math.SQRT1_2;
  const gat = o.gat ?? 70;
  const huizen = zaden.map((z) => {
    const spec = HS.kiesHuis(z);
    const H = HS.maten(z, spec);
    return { spec, H, kd: kaderVan(H) };
  });
  // per rij van links naar rechts, de voeten op één lijn; de voorste rij onder de achterste
  const rijen = [huizen.slice(0, 3), huizen.slice(3)];
  let y = 0;
  for (const rij of rijen) {
    let x = 0;
    const boven = Math.max(...rij.map((hu) => -hu.kd.y0));
    for (const hu of rij) {
      hu.sx = x - hu.kd.x0;
      hu.sy = y + boven;
      x += hu.kd.b + gat;
    }
    const breed = x - gat;
    for (const hu of rij) hu.sx -= breed / 2;
    y = Math.max(...rij.map((hu) => hu.sy + hu.kd.y1)) + gat;
  }
  // het midden van de scène op de oorsprong, anders loopt hij van de grond af
  const mx = (Math.min(...huizen.map((h) => h.sx + h.kd.x0)) + Math.max(...huizen.map((h) => h.sx + h.kd.x1))) / 2;
  const my = (Math.min(...huizen.map((h) => h.sy + h.kd.y0)) + Math.max(...huizen.map((h) => h.sy + h.kd.y1))) / 2;
  for (const hu of huizen) {
    hu.sx -= mx;
    hu.sy -= my;
  }
  // van een plek op het scherm naar de grond in de wereld
  const naarWereld = (sx, sy) => [(sx / SQ + sy / (SQ / 2)) / 2, (sy / (SQ / 2) - sx / SQ) / 2];
  for (const hu of huizen) [hu.X, hu.Y] = naarWereld(hu.sx, hu.sy);
  const x0 = Math.min(...huizen.map((h) => h.sx + h.kd.x0));
  const x1 = Math.max(...huizen.map((h) => h.sx + h.kd.x1));
  const y0 = Math.min(...huizen.map((h) => h.sy + h.kd.y0));
  const y1 = Math.max(...huizen.map((h) => h.sy + h.kd.y1));
  const b = Math.ceil(x1 - x0 + 60);
  const h = Math.ceil(y1 - y0 + 60);
  const B = new K.Beeld(b, h, Math.round(30 - x0), Math.round(30 - y0));
  const kaart = grond(B);
  const Rs = [];
  for (const hu of huizen) {
    const W = HS.huis(hu.spec.zaad, hu.spec);
    Rs.push(T.tekenWereld(B, W, { plek: [hu.X, hu.Y] }));
    for (const l of W.lichten) B.lichten.push({ ...l, pos: [l.pos[0] + hu.X, l.pos[1] + hu.Y, l.pos[2]] });
  }
  const ms = Date.now() - t0;
  // de tovenaar in het gat tussen de eerste twee huizen van de voorste rij, op hun voetlijn
  const [a, c] = rijen[1];
  const [tx, ty] = naarWereld((a.sx + a.kd.x1 + c.sx + c.kd.x0) / 2, Math.max(a.sy, c.sy) - 30);
  D.zetModel(B, F.tovenaar(84), tx / TG, ty / TG, 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  // de schaduw op de grond: ver van een huis is de afstand tot zijn grensbol genoeg, dan hoeft
  // een straal naar de zon niet elk huis helemaal na te vragen (dat scheelt minuten)
  const bollen = Rs.map((R) => {
    const gs = R.groepen;
    const c = [0, 1].map((k) => gs.reduce((s, g) => s + (k ? g.cy : g.cx), 0) / gs.length);
    const cz = (Math.min(...gs.map((g) => g.z0)) + Math.max(...gs.map((g) => g.z1))) / 2;
    const r = Math.max(...gs.map((g) => Math.hypot(g.cx - c[0], g.cy - c[1]) + g.cr + Math.max(Math.abs(g.z0 - cz), Math.abs(g.z1 - cz))));
    return { R, x: c[0] + R.plek[0], y: c[1] + R.plek[1], z: cz, r };
  });
  const f = (x, y, z) => {
    let d = Infinity;
    for (const b of bollen) {
      const db = Math.hypot(x - b.x, y - b.y, z - b.z) - b.r;
      d = Math.min(d, db > 4 ? db : b.R.f(x, y, z));
    }
    return d;
  };
  grondZon(B, { f }, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  const extra = huizen.map((hu) => ({
    zaad: hu.spec.zaad,
    x: hu.sx + (hu.kd.x0 + hu.kd.x1) / 2 + B.OX,
    y: hu.sy + hu.kd.y0 + B.OY,
    tekst: `${hu.spec.vorm} ${hu.spec.lagen} ${hu.H.dak} ${hu.H.wandLagen.map((l) => l.join('/')).join(',')}`,
    uit: Object.entries(hu.H.uitbouw).filter(([, v]) => v).map(([k, v]) => (v === true ? k : `${k} ${v}`)).join(', ') || 'geen uitbouw',
  }));
  return { p: K.Plaat.van(K.kwantiseer(B)), ms, msTotaal: Date.now() - t0, extra };
}

// Een draad die panelen rendert: een huis ({ spec, o }), een gebouw uit delen ({ delen, o }), een oud gebouw ({ oud, o }),
// een dorp ({ dorp: zaden, o }), een
// tuinstuk ({ tuin: naam, zaad }), het tuintje ({ tuintje: true }) of de zes ({ zes: zaden }).
if (!isMainThread && workerData === 'huis') {
  parentPort.on('message', ({ i, spec, o, dorp, tuin, zaad, tuintje, zes, delen, oud, fasen }) => {
    const r = fasen ? paneelFasen(fasen) : oud ? paneelOud(oud, o) : delen ? paneelSamen(delen, o) : zes ? paneelZes(zes, o) : tuintje ? paneelTuintje(o) : tuin ? paneelTuin(tuin, zaad, o) : dorp ? paneelDorp(dorp, o) : paneelHuis(spec, o);
    parentPort.postMessage({ i, b: r.p.b, h: r.p.h, px: r.p.px, ms: r.ms, msTotaal: r.msTotaal, extra: r.extra });
  });
}

function renderAlle(taken, draden) {
  return new Promise((klaar, fout) => {
    const uit = new Array(taken.length);
    let volgende = 0;
    let gedaan = 0;
    const werkers = [];
    const geef = (w) => {
      if (volgende >= taken.length) return;
      const i = volgende++;
      w.postMessage({ i, ...taken[i] });
    };
    for (let n = 0; n < Math.min(draden, taken.length); n++) {
      const w = new Worker(__filename, { workerData: 'huis' });
      w.on('error', fout);
      w.on('message', (m) => {
        const p = new K.Plaat(m.b, m.h);
        p.px = m.px;
        uit[m.i] = { p, ms: m.ms, msTotaal: m.msTotaal, extra: m.extra };
        log(`${taken[m.i].naam || opschrift(taken[m.i].spec)}`.padEnd(52), `${(m.ms / 1000).toFixed(1)} s (paneel ${(m.msTotaal / 1000).toFixed(1)} s)`);
        if (++gedaan === taken.length) {
          for (const x of werkers) x.terminate();
          klaar(uit);
        } else geef(w);
      });
      werkers.push(w);
      geef(w);
    }
  });
}

async function vormen() {
  // eerst alle kaders, zodat elk paneel even groot is en elk huis op dezelfde voetlijn staat
  const kaders = VORMEN.map((s) => kaderVan(HS.maten(s.zaad, s)));
  const kolommen = 3;
  const cb = Math.ceil(Math.max(...kaders.map((k) => k.b)) + 24);
  const ch = Math.ceil(Math.max(...kaders.map((k) => k.h)) + 90);
  const taken = VORMEN.map((spec) => ({ spec, o: { b: cb, h: ch, onder: 44 } }));
  const draden = Math.max(2, Math.min(9, os.cpus().length - 2));
  const t0 = Date.now();
  const platen = await renderAlle(taken, draden);
  const rijen = Math.ceil(VORMEN.length / kolommen);
  const plaat = new K.Plaat(cb * kolommen, (STROOK + ch) * rijen);
  platen.forEach((q, i) => {
    const x = (i % kolommen) * cb;
    const y = Math.floor(i / kolommen) * (STROOK + ch);
    plaat.plak(q.p, x, y + STROOK);
    schrijf(plaat, opschrift(VORMEN[i]), x + 8, y + 6);
  });
  fs.writeFileSync(path.join(UIT, 'vormen.png'), K.png(plaat, 1, '#0e0a14'));
  const ms = platen.map((q) => q.ms);
  log(`vormen.png  ${plaat.b}×${plaat.h}, ${draden} draden, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  log(`een huis: ${(Math.min(...ms) / 1000).toFixed(1)} tot ${(Math.max(...ms) / 1000).toFixed(1)} s, gemiddeld ${(ms.reduce((a, b) => a + b, 0) / ms.length / 1000).toFixed(1)} s`);
}

// ---------------------------------------------------------------- materiaal.png

// Ronde 2: (a) de wanden naast elkaar, op hetzelfde huis met riet; (b) de daken op een L, zodat je
// de kil en de schild ziet; (c) twee torens met een plat dak, en de lap in het riet van dichtbij;
// (d) een rij van zes huizen met willekeurige zaden.
const WANDPLAAT = [
  ['vakwerk', { wand: 'vakwerk' }],
  ['vlechtwerk met leem', { wand: 'vlecht' }],
  ['planken grijs', { wand: 'planken', hout: 'schors' }],
  ['planken bruin', { wand: 'planken', hout: 'hout' }],
  ['blokhut', { wand: 'blokhut' }],
  ['veldsteen', { wand: 'veldsteen' }],
].map(([naam, w], i) => ({ naam, spec: { zaad: 31 + i, vorm: 'rechthoek', b: 7, d: 5, lagen: 1, dak: 'riet', uit: false, ...w } }));
const DAKPLAAT = ['riet', 'spanen', 'leien', 'pannen'].map((dak, i) => ({ naam: dak, spec: { zaad: 41 + i, vorm: 'L', b: 8, d: 5, b2: 4, d2: 7, lagen: 1, dak, wand: 'vakwerk', uit: false } }));
const TORENPLAAT = [
  { naam: 'wachttoren, kantelen', spec: { zaad: 51, dak: 'plat', lagen: 3, b: 4, d: 4 } },
  { naam: 'borstwering', spec: { zaad: 52, dak: 'plat', lagen: 2, b: 5, d: 4, kantelen: false } },
];
const DORPZADEN = [101, 102, 103, 104, 105, 106];

// waar het midden van de lap in het riet in beeld valt, vanaf de oorsprong van het huis
function lapOpScherm(H) {
  const L = H.lap;
  if (!L) return null;
  const V = L.V;
  const q = V.voetQ(L.a) - L.h * Math.cos(H.helling);
  const [x, y] = V.wereld(L.a, q);
  const z = V.voetZ(L.a) + L.h * Math.sin(H.helling) + H.dik;
  return [x * K.EX[0] + y * K.EX[1] + z * K.EX[2], x * K.EY[0] + y * K.EY[1] + z * K.EY[2]];
}

async function materiaal() {
  const t0 = Date.now();
  const maat = (lijst, extraB, extraH) => {
    const kd = lijst.map((t) => kaderVan(HS.maten(t.spec.zaad, t.spec)));
    return [Math.ceil(Math.max(...kd.map((k) => k.b)) + extraB), Math.ceil(Math.max(...kd.map((k) => k.h)) + extraH)];
  };
  const [wb, wh] = maat(WANDPLAAT, 16, 70);
  const [db, dh] = maat(DAKPLAAT, 16, 70);
  const [tb, th] = maat(TORENPLAAT, 30, 70);
  const taken = [
    ...WANDPLAAT.map((t) => ({ ...t, o: { b: wb, h: wh, onder: 36 } })),
    ...DAKPLAAT.map((t) => ({ ...t, o: { b: db, h: dh, onder: 36 } })),
    ...TORENPLAAT.map((t) => ({ ...t, o: { b: tb, h: th, onder: 36 } })),
    { naam: 'dorp, zaden ' + DORPZADEN.join(' '), dorp: DORPZADEN, o: { uit: false } },
  ];
  // het dorp duurt het langst (zes huizen achter elkaar): dat eerst
  const volgorde = [taken.length - 1, ...taken.slice(0, -1).map((_, i) => i)];
  const draden = Math.max(2, Math.min(13, os.cpus().length - 2));
  const r = await renderAlle(volgorde.map((i) => taken[i]), draden);
  const platen = [];
  volgorde.forEach((i, j) => (platen[i] = r[j]));
  const [wand, dak, toren, dorp] = [platen.slice(0, 6), platen.slice(6, 10), platen.slice(10, 12), platen[12]];

  // de lap van dichtbij: uit het paneel met riet, twee keer vergroot
  const rietT = DAKPLAAT[0];
  const Hr = HS.maten(rietT.spec.zaad, rietT.spec);
  const kd = kaderVan(Hr);
  const lap = lapOpScherm(Hr);
  const OX = Math.round(db / 2 - (kd.x0 + kd.x1) / 2);
  const OY = Math.round(dh - 36 - kd.y1);
  const lb = 2 * tb - 20;
  const lh = Math.round(lb * 0.5);
  const lapGroot = lap ? vergroot(dak[0].p.uitsnede(Math.round(OX + lap[0] - lb / 4), Math.round(OY + lap[1] - lh / 4), Math.round(lb / 2), Math.round(lh / 2)), 2) : null;

  // de plaat: bovenaan links de wanden (drie bij twee), rechts de torens en de lap; daaronder de
  // daken; onderaan het dorp
  const S = STROOK;
  const bovenB = 3 * wb + 2 * tb + 16;
  const bovenH = Math.max(2 * (S + wh), S + th + S + (lapGroot ? lapGroot.h : 0));
  const B = Math.max(bovenB, 4 * db, dorp.p.b);
  const Hh = S + bovenH + S + S + dh + S + S + dorp.p.h;
  const plaat = new K.Plaat(B, Hh);
  let y = 0;
  schrijf(plaat, 'a  wanden, zelfde huis met riet', 8, y + 6);
  schrijf(plaat, 'c  plat dak, alleen op steen', 3 * wb + 24, y + 6);
  y += S;
  wand.forEach((q, i) => {
    const x = (i % 3) * wb;
    const yy = y + Math.floor(i / 3) * (S + wh);
    plaat.plak(q.p, x, yy + S);
    schrijf(plaat, WANDPLAAT[i].naam, x + 8, yy + 6);
  });
  toren.forEach((q, i) => {
    const x = 3 * wb + 16 + i * tb;
    plaat.plak(q.p, x, y + S);
    schrijf(plaat, TORENPLAAT[i].naam, x + 8, y + 6);
  });
  if (lapGroot) {
    const x = 3 * wb + 16;
    const yy = y + S + th;
    schrijf(plaat, 'de lap in het riet, x2', x + 8, yy + 6);
    plaat.plak(lapGroot, x, yy + S);
  }
  y += bovenH + S;
  schrijf(plaat, 'b  daken, op een L met kil en schild', 8, y + 6);
  y += S;
  dak.forEach((q, i) => {
    plaat.plak(q.p, i * db, y + S);
    schrijf(plaat, DAKPLAAT[i].naam, i * db + 8, y + 6);
  });
  y += S + dh;
  schrijf(plaat, 'd  zes willekeurige zaden', 8, y + 6);
  y += S;
  plaat.plak(dorp.p, 0, y + S);
  for (const e of dorp.extra) schrijf(plaat, `zaad ${e.zaad}`, Math.round(e.x) - 40, y + 6);
  fs.writeFileSync(path.join(UIT, 'materiaal.png'), K.png(plaat, 1, '#0e0a14'));
  log(`materiaal.png  ${plaat.b}×${plaat.h}, ${draden} draden, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  for (const e of dorp.extra) log(`  zaad ${e.zaad}: ${e.vorm} ${e.lagen} laag, ${e.dak}, ${e.wand}, ${e.hout}`);
}

// ---------------------------------------------------------------- uitbouwen.png (ronde 3)

// (a) elke uitbouw op een huis; (b) de tuinstukken naast elkaar, en een tuintje daaruit; (c) zes
// huizen met willekeurige zaden, los van elkaar.
const UITPLAAT = [
  { naam: 'dakkapellen in het riet', spec: { zaad: 18, vorm: 'rechthoek', b: 10, d: 6, lagen: 1.5, dak: 'riet', wand: 'vakwerk', uit: { kapellen: 2 } } },
  { naam: 'dakkapellen op pannen', spec: { zaad: 30, vorm: 'rechthoek', b: 11, d: 6, lagen: 1.5, dak: 'pannen', wand: 'vakwerk', uit: { kapellen: 2 } } },
  { naam: 'dakkapel op leien, luiken', spec: { zaad: 21, vorm: 'rechthoek', b: 9, d: 6, lagen: 1.5, dak: 'leien', wand: 'veldsteen', uit: { kapellen: 1, luiken: 'pet' } } },
  { naam: 'aanbouw met eenzijdig dak', spec: { zaad: 9, vorm: 'rechthoek', b: 9, d: 6, lagen: 1, dak: 'riet', wand: 'vakwerk', uit: { aanbouw: true } } },
  { naam: 'erker, luiken, bloembakken', spec: { zaad: 3, vorm: 'rechthoek', b: 9, d: 7, lagen: 2, dak: 'riet', wand: 'vakwerk', uit: { erker: true, luiken: 'den', bakken: 2 } } },
  { naam: 'galerij op palen, dakkapel op spanen', spec: { zaad: 12, vorm: 'rechthoek', b: 9, d: 7, lagen: 2, dak: 'spanen', wand: 'planken', uit: { balkon: true, kapellen: 1 } } },
  { naam: 'buitentrap naar de opkamer', spec: { zaad: 33, vorm: 'rechthoek', b: 8, d: 6, lagen: 1, dak: 'riet', wand: 'veldsteen', uit: { trap: true, luiken: 'rood', bakken: 1 } } },
  { naam: 'schoorsteen op de gevel', spec: { zaad: 15, vorm: 'rechthoek', b: 8, d: 6, lagen: 1, dak: 'riet', wand: 'blokhut', uit: { gevelschoorsteen: true } } },
  { naam: 'L met aanbouw, luiken', spec: { zaad: 44, vorm: 'L', b: 12, d: 6, b2: 5, d2: 10, lagen: 1.5, dak: 'riet', wand: 'vlecht', uit: { aanbouw: true, luiken: 'rood', bakken: 1 } } },
];
const TUINZAAD = 5;
const ZES = [272, 273, 274, 275, 276, 277];

async function uitbouwen() {
  const t0 = Date.now();
  const S = STROOK;
  // de huizen in rijen van drie, elke kolom even breed, elke rij zo hoog als zijn hoogste huis
  const kaders = UITPLAAT.map((t) => kaderVan(HS.maten(t.spec.zaad, t.spec)));
  const per = 3;
  const kolB = Math.ceil(Math.max(...kaders.map((k) => k.b)) + 12);
  const rijH = [];
  for (let i = 0; i < UITPLAAT.length; i += per) rijH.push(Math.ceil(Math.max(...kaders.slice(i, i + per).map((k) => k.h)) + 60));
  const TB = 140;
  const TH = 136;
  const taken = [
    { naam: 'zes willekeurige zaden', zes: ZES, o: {} },
    ...UITPLAAT.map((t, i) => ({ naam: t.naam, spec: t.spec, o: { b: kolB, h: rijH[Math.floor(i / per)], onder: 40 } })),
    { naam: 'tuintje', tuintje: true, o: {} },
    ...TU.STUKKEN.map((n, i) => ({ naam: n, tuin: n, zaad: TUINZAAD + i, o: { b: TB, h: TH } })),
  ];
  const draden = Math.max(2, Math.min(14, os.cpus().length - 2));
  const r = await renderAlle(taken, draden);
  const zes = r[0];
  const huizen = r.slice(1, 1 + UITPLAAT.length);
  const tuintje = r[1 + UITPLAAT.length];
  const stukken = r.slice(2 + UITPLAAT.length);

  // de maat van de plaat
  const tuinKol = 11;
  const tuinB = tuinKol * TB;
  const tuinRijen = Math.ceil(stukken.length / tuinKol);
  // het tuintje twee keer vergroot, om te zien of de stukken op elkaar aansluiten
  const tuintjeGroot = vergroot(tuintje.p, 2);
  const blokB = tuinB + 16 + tuintjeGroot.b;
  const blokH = Math.max(tuinRijen * (S + TH), S + tuintjeGroot.h);
  const B = Math.max(per * kolB, blokB, zes.p.b);
  const Hh = S + rijH.reduce((s, h) => s + S + h, 0) + S + S + blokH + 2 * S + S + 3 * 14 + zes.p.h;
  const plaat = new K.Plaat(B, Hh);
  let y = 0;
  schrijf(plaat, 'a  uitbouwen, elk op een huis', 8, y + 6);
  y += S;
  huizen.forEach((q, i) => {
    const rij = Math.floor(i / per);
    const yy = y + rijH.slice(0, rij).reduce((s, h) => s + S + h, 0);
    const x = (i % per) * kolB;
    plaat.plak(q.p, x, yy + S);
    schrijf(plaat, UITPLAAT[i].naam, x + 8, yy + 6);
  });
  y += rijH.reduce((s, h) => s + S + h, 0) + S;
  schrijf(plaat, 'b  tuinstukken, elk op een tegel, en een tuintje daaruit', 8, y + 6);
  y += S;
  stukken.forEach((q, i) => {
    const x = (i % tuinKol) * TB;
    const yy = y + Math.floor(i / tuinKol) * (S + TH);
    plaat.plak(q.p, x, yy + S);
    schrijf(plaat, TU.STUKKEN[i], x + 6, yy + 10, 1);
  });
  plaat.plak(tuintjeGroot, tuinB + 16, y + S);
  schrijf(plaat, 'het tuintje, 5 bij 4 tegels, x2', tuinB + 24, y + 6);
  y += blokH + 2 * S;
  schrijf(plaat, 'c  zes willekeurige zaden, los van elkaar', 8, y + 6);
  y += S;
  // per huis: zaad, vorm en materiaal, en wat het zaad aan uitbouwen koos
  zes.extra.forEach((e, i) => {
    const regel = y + (i % 3) * 14;
    const x = 8 + (i < 3 ? 0 : Math.round(B / 2));
    schrijf(plaat, `zaad ${e.zaad}: ${e.tekst}  -  ${e.uit}`, x, regel, 1);
  });
  y += 3 * 14;
  plaat.plak(zes.p, Math.round((B - zes.p.b) / 2), y);
  fs.writeFileSync(path.join(UIT, 'uitbouwen.png'), K.png(plaat, 1, '#0e0a14'));
  log(`uitbouwen.png  ${plaat.b}×${plaat.h}, ${draden} draden, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  const ms = huizen.map((q) => q.ms);
  log(`een huis met uitbouwen: ${(Math.min(...ms) / 1000).toFixed(1)} tot ${(Math.max(...ms) / 1000).toFixed(1)} s, gemiddeld ${(ms.reduce((a, b) => a + b, 0) / ms.length / 1000).toFixed(1)} s`);
  const mt = stukken.map((q) => q.ms);
  log(`een tuinstuk: ${(Math.min(...mt) / 1000).toFixed(1)} tot ${(Math.max(...mt) / 1000).toFixed(1)} s; het tuintje ${(tuintje.ms / 1000).toFixed(1)} s; de zes ${(zes.ms / 1000).toFixed(1)} s`);
  for (const e of zes.extra) log(`  zaad ${e.zaad}: ${e.tekst}, ${e.uit}`);
}

// ---------------------------------------------------------------- letters

// Een klein lettertype van 5 × 7, alleen de letters die de opschriften nodig hebben.
const LETTERS = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '....#', '....#', '....#', '#...#', '#...#', '.###.'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ',': ['.....', '.....', '.....', '.....', '.....', '..#..', '.#...'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.....', '..#..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  ':': ['.....', '..#..', '.....', '.....', '.....', '..#..', '.....'],
};
function schrijf(p, tekst, x, y, s = 2) {
  for (const ch of tekst.toUpperCase()) {
    const g = LETTERS[ch] || LETTERS[' '];
    for (let j = 0; j < 7; j++) {
      for (let i = 0; i < 5; i++) {
        if (g[j][i] !== '#') continue;
        for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) p.zet(x + i * s + dx, y + j * s + dy, 'perkament', 5);
      }
    }
    x += 6 * s;
  }
}

function vergroot(p, s) {
  const q = new K.Plaat(p.b * s, p.h * s);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (!k) continue;
      for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) q.zet(x * s + dx, y * s + dy, k[0], k[1]);
    }
  }
  return q;
}

// ---------------------------------------------------------------- de platen

const STROOK = 26;
const log = (...a) => console.log(...a);

function vergelijk() {
  const panelen = [];
  const nu = paneelNu();
  log(`nu (dorp.cjs, zaad ${NU_ZAAD})`.padEnd(28), `${nu.ms} ms`);
  panelen.push({ ...nu, naam: 'nu' });
  for (const z of ZADEN) {
    const r = paneelProef(z);
    log(`proefhuis zaad ${z}`.padEnd(28), `${r.ms} ms`);
    panelen.push({ ...r, naam: `zaad ${z}` });
  }
  // onderaan: het huis zelf, twee keer vergroot (zonder de lege randen van het paneel)
  const snede = [14, 34, 558, 576];
  const groot = [panelen[0], panelen[1]].map((q) => vergroot(q.p.uitsnede(...snede), 2));
  const b = Math.max(PB * panelen.length, groot[0].b * 2 + 16);
  const h = STROOK + PH + STROOK + groot[0].h;
  const plaat = new K.Plaat(b, h);
  panelen.forEach((q, i) => {
    plaat.plak(q.p, i * PB, STROOK);
    schrijf(plaat, q.naam, i * PB + 8, 6);
  });
  const y2 = STROOK + PH + STROOK;
  plaat.plak(groot[0], 0, y2);
  schrijf(plaat, 'nu x2', 8, y2 - 20);
  plaat.plak(groot[1], groot[0].b + 16, y2);
  schrijf(plaat, 'zaad 1 x2', groot[0].b + 24, y2 - 20);
  fs.writeFileSync(path.join(UIT, 'vergelijk.png'), K.png(plaat, 1, '#0e0a14'));
  log(`vergelijk.png  ${plaat.b}×${plaat.h}`);
}

function knoppen() {
  const varianten = [
    ['alle drie', {}],
    ['zonder scheef', { scheef: false }],
    ['zonder pak', { pak: false }],
    ['zonder speelgoed', { speelgoed: false }],
  ];
  const plaat = new K.Plaat(PB * varianten.length, STROOK + PH);
  varianten.forEach(([naam, kn], i) => {
    const r = paneelProef(ZADEN[0], kn);
    log(naam.padEnd(28), `${r.ms} ms`);
    plaat.plak(r.p, i * PB, STROOK);
    schrijf(plaat, naam, i * PB + 8, 6);
  });
  fs.writeFileSync(path.join(UIT, 'knoppen.png'), K.png(plaat, 1, '#0e0a14'));
  log(`knoppen.png  ${plaat.b}×${plaat.h}`);
}

// ladder.png (ronde 4b): twee huizen, elk in de vijf treden van beter bouwen (ontwerp/spel.md,
// "Beter bouwen"): hetzelfde huis, met dezelfde vorm op dezelfde plek, in steeds duurder materiaal.
// In het spel komen nu alleen de eerste twee (en de schout in de derde; Marcel, 26 sep: "1 en 2 in
// spel, rest op plaat"); de rest is om te zien waar het heen gaat. Baksteen kent de bouwer nog niet:
// de vijfde trede is hier veldsteen.
const LADDER = [
  ['1 vlechtwerk, riet', { lagen: 1, laag: true, plint: 30, schoorsteen: false, wand: 'vlecht', dak: 'riet', hout: 'schors', uit: false }],
  ['2 vakwerk, riet', { lagen: 1, plint: 36, schoorsteen: 'leem', wand: 'vakwerk', dak: 'riet', uit: false }],
  ['3 half steen', { lagen: 1, wand: 'vakwerk', dak: 'riet', uit: { luiken: true } }],
  ['4 twee lagen, leien', { lagen: 2, wand: 'vakwerk', dak: 'leien', uit: { luiken: true, bakken: 2 } }],
  ['5 steen, pannen', { lagen: 2, wand: 'veldsteen', boven: 'veldsteen', dak: 'pannen', uit: { luiken: true, bakken: 2 } }],
];
const LADDER_HUIZEN = [
  { naam: 'een hut die groeit', zaad: 11, vorm: 'rechthoek', b: 5, d: 4, nok: 'x', schoor: false },
  { naam: 'een huis dat groeit', zaad: 21, vorm: 'rechthoek', b: 7, d: 5, nok: 'x', schoor: false },
];
async function ladder() {
  const taken = [];
  for (const h of LADDER_HUIZEN) for (const [naam, trede] of LADDER) taken.push({ naam: `${h.naam}: ${naam}`, spec: { ...h, ...trede } });
  const kd = taken.map((t) => kaderVan(HS.maten(t.spec.zaad, t.spec)));
  const cb = Math.ceil(Math.max(...kd.map((k) => k.b)) + 24);
  const ch = Math.ceil(Math.max(...kd.map((k) => k.h)) + 60);
  const draden = Math.max(2, Math.min(13, os.cpus().length - 1));
  const r = await renderAlle(taken.map((t) => ({ ...t, o: { b: cb, h: ch, onder: 44 } })), draden);
  const S = STROOK;
  const plaat = new K.Plaat(cb * LADDER.length, (2 * S + ch) * LADDER_HUIZEN.length);
  LADDER_HUIZEN.forEach((h, rij) => {
    const y = rij * (2 * S + ch);
    schrijf(plaat, h.naam, 8, y + 6);
    LADDER.forEach(([naam], kol) => {
      plaat.plak(r[rij * LADDER.length + kol].p, kol * cb, y + 2 * S);
      schrijf(plaat, naam, kol * cb + 8, y + S + 6);
    });
  });
  fs.writeFileSync(path.join(UIT, 'ladder.png'), K.png(plaat, 1, '#0e0a14'));
  log(`ladder.png  ${plaat.b}×${plaat.h}`);
}

// afwisseling.png (werklijst vraag 114, 2b; Marcel, 4 okt: "1 ja 2 ja"): meer tekeningen uit wat de bouwer al kan,
// op de vormen van de huizen van het spel (huizen.cjs). Bovenaan één huis in zijn vier standen: de deur linksvoor of
// rechtsvoor (op een muur die je ziet, de nok langs x of langs y), of achter (de deur aan de kant die je niet ziet), zodat
// elk huis zijn deur naar het plein of de weg kan keren. Daaronder drie straatjes: de daken volgen de treden (in het
// gehucht riet en spanen, in een dorp ook leien, met marktrecht pannen), de wanden, de kalk en de luiken wisselen per huis.
const VORM = (naam, extra = {}) => {
  const { gebouw, trede, fasen, ...v } = require('./huizen.cjs').HUIZEN[naam];
  return { ...v, ...extra };
};
const AFWISSELING = {
  standen: [
    ['deur linksvoor', VORM('huis1', { kalk: 'oker', uit: { luiken: 'den', bakken: 1 } })],
    ['deur rechtsvoor', VORM('huis1', { kalk: 'oker', nok: 'y', uit: { luiken: 'den', bakken: 1 } })],
    ['deur rechtsachter', VORM('huis1', { kalk: 'oker', deur: 'achter', uit: { luiken: 'den', bakken: 1 } })],
    ['deur linksachter', VORM('huis1', { kalk: 'oker', nok: 'y', deur: 'achter', uit: { luiken: 'den', bakken: 1 } })],
  ],
  straten: [
    {
      naam: 'het gehucht: riet en spanen',
      huizen: [
        ['hut, planken onder spanen', VORM('hut1', { wand: 'planken', dak: 'spanen', uit: { luiken: 'schors' } })],
        ['hut, vlechtwerk', VORM('hut4')],
        ['huis, oker kalk', VORM('huis1', { kalk: 'oker', uit: { luiken: 'den', bakken: 1 } })],
        ['huis, roze kalk', VORM('huis3', { kalk: 'roze', nok: 'y', uit: { aanbouw: true, luiken: 'rood' } })],
        ['huis, planken onder spanen', VORM('huis5', { wand: 'planken', dak: 'spanen', hout: 'schors', uit: { gevelschoorsteen: true, kapellen: 1, luiken: 'pet' } })],
        ['boerderij, witte kalk', VORM('boerderij2', { wand: 'vakwerk', uit: { luiken: 'hout' } })],
        ['huis, blokhut onder spanen', VORM('huis2', { wand: 'blokhut', dak: 'spanen', uit: { kapellen: 1, luiken: 'den' } })],
      ],
    },
    {
      naam: 'het dorp: ook leien',
      huizen: [
        ['huis, leien', VORM('huis2', { dak: 'leien', uit: { kapellen: 1, luiken: 'den' } })],
        ['stenen huis, riet', VORM('steen1', { uit: { luiken: 'rood', bakken: 1 } })],
        ['huis, oker kalk', VORM('huis6', { kalk: 'oker', uit: { bakken: 2, luiken: 'pet' } })],
        ['stenen huis, leien', VORM('steen3', { dak: 'leien', uit: { aanbouw: true, luiken: 'den' } })],
        ['huis, planken onder spanen', VORM('huis4', { wand: 'planken', dak: 'spanen', hout: 'schors', uit: { luiken: 'rood' } })],
        ['huis, roze kalk onder leien', VORM('huis1', { kalk: 'roze', nok: 'y', dak: 'leien', uit: { luiken: 'hout', bakken: 1 } })],
        ['hut, vlechtwerk', VORM('hut2')],
      ],
    },
    {
      naam: 'marktrecht: ook pannen',
      huizen: [
        ['stenen huis, pannen', VORM('steen2', { dak: 'pannen', kalk: 'roze', uit: { kapellen: 1, luiken: 'rood' } })],
        ['huis van twee lagen, pannen', VORM('huis3', { lagen: 2, kalk: 'oker', dak: 'pannen', uit: { luiken: 'den', bakken: 2 } })],
        ['stenen huis, leien', VORM('steen5', { dak: 'leien', uit: { gevelschoorsteen: true, kapellen: 1, luiken: 'pet' } })],
        ['stenen huis, pannen', VORM('steen6', { dak: 'pannen', uit: { bakken: 2, luiken: 'den' } })],
        ['huis, witte kalk onder pannen', VORM('huis1', { dak: 'pannen', nok: 'y', uit: { luiken: 'rood', bakken: 1 } })],
        ['stenen huis, leien', VORM('steen4', { dak: 'leien', uit: { luiken: 'hout' } })],
      ],
    },
  ],
};
async function afwisseling() {
  const A = AFWISSELING;
  const kd = A.standen.map(([, spec]) => kaderVan(HS.maten(spec.zaad, spec)));
  const cb = Math.ceil(Math.max(...kd.map((k) => k.b)) + 60);
  const ch = Math.ceil(Math.max(...kd.map((k) => k.h)) + 70);
  const taken = [
    ...A.standen.map(([naam, spec]) => ({ naam, spec, o: { b: cb, h: ch, onder: 44, figuur: 'boer' } })),
    ...A.straten.map((st) => ({ naam: st.naam, dorp: st.huizen.map(([, spec]) => spec), o: { figuur: 'boer', ruimte: 1.8 } })),
  ];
  const draden = Math.max(2, Math.min(13, os.cpus().length - 1));
  const r = await renderAlle(taken, draden);
  const S = STROOK;
  const straten = r.slice(A.standen.length);
  const breed = Math.max(cb * A.standen.length, ...straten.map((x) => x.p.b));
  const hoog = 2 * S + ch + straten.reduce((n, x) => n + 4 * S + x.p.h, 0);
  const plaat = new K.Plaat(breed, hoog);
  schrijf(plaat, 'een huis in zijn vier standen', 8, 6);
  A.standen.forEach(([naam], i) => {
    plaat.plak(r[i].p, i * cb, 2 * S);
    schrijf(plaat, naam, i * cb + 8, S + 6);
  });
  let y = 2 * S + ch;
  A.straten.forEach((st, i) => {
    const p = straten[i].p;
    schrijf(plaat, st.naam, 8, y + 6);
    // onder de naam van de straat, bij elk huis wat het is, om en om op twee regels
    straten[i].extra.forEach((e, j) => schrijf(plaat, st.huizen[j][0], Math.max(4, Math.round(e.x - 90)), y + (j % 2 ? 2 : 1) * S + 6));
    plaat.plak(p, 0, y + 4 * S);
    y += 4 * S + p.h;
  });
  fs.writeFileSync(path.join(UIT, 'afwisseling.png'), K.png(plaat, 1, '#0e0a14'));
  log(`afwisseling.png  ${plaat.b}×${plaat.h}`);
}

// verhouding.png (werklijst vraag 114, 2c; Marcel, 4 okt: "3 allebei 4 allebei"): de gebouwen in verhouding, per rij op
// één grondlijn (de voorste hoek van elk gebouw even hoog), met een boer voor de maat. Bovenaan wonen: de hut, het huis,
// het stenen huis en de boerderij van het spel, en de woontoren (vier lagen op 5 bij 5, met per laag een appartement)
// met kantelen en met een tentdak. Daaronder het dorp: een huis, de herberg zoals hij nu is en de nieuwe (twee lagen,
// 12 tegels, met een stal aan een binnenplaats en een uithangbord), en de kapel zoals ze nu is en de nieuwe, met een
// zadeldaktoren en met een naaldspits. De kapel en de woontoren zijn van baksteen (Marcel, 4 okt: "Torens zijn wel wat
// grijzig"), zoals de dorpskerken.
const KAPEL_SCHIP = (zaad) => ({ zaad, vorm: 'rechthoek', b: 9, d: 5, lagen: 1.5, nok: 'x', wand: 'veldsteen', steen: 'baksteen', dak: 'leien', deur: 'achter', schoorsteen: false, schoor: false, uit: false, ramen: 'kerk' });
const KAPEL_TOREN = (zaad, torendak, b) => ({ zaad, dak: 'plat', steen: 'baksteen', lagen: 4, b, d: b, torendak, ramen: 'kerk', deurZijde: 'a' });
const WOONTOREN = { dak: 'plat', steen: 'baksteen', lagen: 4, b: 5, d: 5, ramen: 'woon' };
const HERBERG = { zaad: 53, vorm: 'rechthoek', b: 12, d: 6, lagen: 2, nok: 'x', wand: 'vakwerk', dak: 'riet', schoorsteen: 'leem', schoor: false, bord: true, uit: { kapellen: 3, luiken: true, bakken: 2 } };
const STAL = { zaad: 57, vorm: 'rechthoek', b: 6, d: 4, lagen: 1, nok: 'y', wand: 'planken', dak: 'riet', hout: 'schors', schoorsteen: false, schoor: false, uit: false };
const VERHOUDING = [
  {
    naam: 'wonen',
    panelen: [
      ['hut', { spec: VORM('hut1') }],
      ['huis', { spec: VORM('huis1') }],
      ['stenen huis', { spec: VORM('steen1') }],
      ['boerderij', { spec: VORM('boerderij1') }],
      ['woontoren, kantelen', { spec: { ...WOONTOREN, zaad: 54, kantelen: true } }],
      ['woontoren, tentdak', { spec: { ...WOONTOREN, zaad: 52, torendak: 'tent', dekking: 'pannen' } }],
    ],
  },
  {
    naam: 'het dorp',
    panelen: [
      ['huis', { spec: VORM('huis1') }],
      ['herberg nu', { spec: VORM('herberg1') }],
      ['herberg nieuw', { delen: [{ spec: HERBERG }, { spec: STAL, plek: [-4.5, 8] }] }],
      ['kapel nu', { oud: 'kapel' }],
      ['kapel, zadeldaktoren', { delen: [{ spec: KAPEL_SCHIP(61) }, { spec: KAPEL_TOREN(62, 'zadel', 4), plek: [6.3, 0] }], deurVan: 1 }],
      ['kapel, naaldspits', { delen: [{ spec: KAPEL_SCHIP(63) }, { spec: KAPEL_TOREN(64, 'spits', 3), plek: [5.7, 0] }], deurVan: 1 }],
    ],
  },
];
function kaderVanPaneel(p) {
  if (p.oud) return meetOud(p.oud);
  if (p.delen) return HS.kaderSamen(samenVan(p.delen), p.draai || 0);
  return kaderVan(HS.maten(p.spec.zaad, p.spec), p.spec.draai || 0);
}
// steen.png (Marcel, 4 okt: "Torens zijn wel wat grijzig", en "Waren er in die tijd al bakstenen? Dit was eigenlijk
// natuurstenen blokken"): de kapel met haar zadeldaktoren en de woontoren met zijn tentdak, elk in veldsteen, in gehakte
// blokken zandsteen en in baksteen, om te kiezen.
const STEEN = ['veldsteen', 'zandsteen', 'baksteen'];
const STEEN_PLAAT = [
  {
    naam: 'de kapel',
    panelen: STEEN.map((steen) => [steen, { delen: [{ spec: { ...KAPEL_SCHIP(61), steen } }, { spec: { ...KAPEL_TOREN(62, 'zadel', 4), steen }, plek: [6.3, 0] }], deurVan: 1 }]),
  },
  {
    naam: 'de woontoren',
    panelen: STEEN.map((steen) => [steen, { spec: { ...WOONTOREN, zaad: 52, torendak: 'tent', dekking: 'pannen', steen } }]),
  },
];

// groot.png (werklijst vraag 114, stap 3; Marcel, 7 okt: "A; ja goed idee, B: Ja, C: Ja graag"): de grote gebouwen van
// elke stijl op een rij (huizen.cjs, grootGebouw): de kleine herberg van het gehucht, de grote waar hij in een dorp toe
// doorgroeit (twee lagen, met een stal aan een binnenplaats, een muur en een poort), de kapel met de toren van de stijl,
// de woontoren (vanaf marktrecht) en het huis van de schout; een huis van de stijl ernaast voor de maat. Daaronder de
// grote herberg van wit in zijn vier standen: hetzelfde gebouw, een kwartslag gedraaid.
function grootRijen() {
  const { STIJLEN, grootGebouw, stijlNaam } = require('./huizen.cjs');
  const rijen = Object.keys(STIJLEN).map((stijl) => ({
    naam: stijl,
    panelen: [
      ['huis', { spec: VORM(stijlNaam(stijl, STIJLEN[stijl].huis[0], STIJLEN[stijl].dak, 'z')) }],
      ['herberg, gehucht', grootGebouw(stijl, 'herbergKlein')],
      ['herberg, dorp', grootGebouw(stijl, 'herberg')],
      ['kapel', grootGebouw(stijl, 'kapel')],
      ['woontoren', grootGebouw(stijl, 'woontoren')],
      ['huis van de schout', grootGebouw(stijl, 'schout')],
    ],
  }));
  return rijen.concat(standenRij(grootGebouw));
}
const standenRij = (grootGebouw) => {
  const KANT = ['zuid', 'oost', 'noord', 'west'];
  const rijen = [];
  rijen.push({ naam: 'de herberg van wit, een kwartslag per stand', panelen: KANT.map((k, d) => [`deur ${k}`, { ...grootGebouw('wit', 'herberg', { draai: d }), draai: d }]) });
  return rijen;
};
// groot2.png (Marcel, 7 okt: "Is de kerk / kapel niet te klein", en "Stal misschien los naast de herberg? of aan de
// achterkant"): de herberg met de stal los ernaast en achter de herberg, elk van voren en van opzij, en de grotere kapel
// van wit en oker naast de kleine, met de herberg ernaast voor de maat.
function groot2Rijen() {
  const { grootGebouw } = require('./huizen.cjs');
  const twee = (naam, o) => [0, 1].map((d) => [`${naam}, deur ${d ? 'oost' : 'zuid'}`, { ...grootGebouw('wit', 'herberg', { ...o, draai: d }), draai: d }]);
  return [
    { naam: 'de herberg: de stal los ernaast', panelen: twee('stal naast', { stal: 'naast' }) },
    { naam: 'de herberg: de stal achter, met de binnenplaats en de poort opzij', panelen: twee('stal achter', { stal: 'achter' }) },
    {
      naam: 'de kapel, groter',
      panelen: [
        ['kapel nu (wit)', grootGebouw('wit', 'kapel', { groot: false })],
        ['kapel groter (wit)', grootGebouw('wit', 'kapel')],
        ['kapel groter (oker)', grootGebouw('oker', 'kapel')],
        ['herberg (wit), voor de maat', grootGebouw('wit', 'herberg', { stal: 'naast' })],
      ],
    },
  ];
}

// groot3.png (Marcel, 8 okt: "de woontoren en kerk vallen kwa stijl buiten de boot in vergelijk met de huizen", en op
// het voorstel "Ja goed"): per stijl een huis en een stenen huis naast de nieuwe kapel en woontoren, en in de laatste
// rij die van 7 okt ernaast, en de baksteen.
function groot3Rijen(alleen) {
  const { STIJLEN, grootGebouw, stijlNaam } = require('./huizen.cjs');
  const rijen = Object.keys(STIJLEN).filter((s) => !alleen || s === alleen).map((stijl) => {
    const S = STIJLEN[stijl];
    const steen = S.huis[0].replace('huis', 'steen');
    return {
      naam: stijl,
      panelen: [
        ['huis', { spec: VORM(stijlNaam(stijl, S.huis[0], 'leien', 'z')) }],
        ['stenen huis', { spec: VORM(stijlNaam(stijl, steen, 'pannen', 'z')) }],
        ['kapel', grootGebouw(stijl, 'kapel', { dak: stijl === 'planken' ? 'spanen' : 'leien' })],
        ['woontoren', grootGebouw(stijl, 'woontoren', { dak: 'pannen' })],
      ],
    };
  });
  if (!alleen) {
    rijen.push({
      naam: 'van 7 okt, en baksteen',
      panelen: [
        ['kapel 7 okt (wit)', grootGebouw('wit', 'kapel', { oud: true })],
        ['woontoren 7 okt (wit)', grootGebouw('wit', 'woontoren', { oud: true })],
        ['kapel baksteen (wit)', grootGebouw('wit', 'kapel', { steen: 'baksteen' })],
        ['woontoren baksteen (wit)', grootGebouw('wit', 'woontoren', { steen: 'baksteen', dak: 'pannen' })],
      ],
    });
  }
  return rijen;
}

// stijl-<naam>.png (werklijst vraag 114, stap 2a; Marcel, 4 okt: "A ja B ja C ik wil overal bouwfase voor"): een
// bouwstijl zoals het spel hem krijgt (huizen.cjs, STIJLEN): zijn vormen, een huis en een hut in de vier standen, de
// daken van de treden en de steen, en drie straatjes: het gehucht, een dorp (wat nieuw is of doorgroeit, krijgt leien)
// en marktrecht met een steenbakkerij.
function stijlRijen(stijl) {
  const { STIJLEN, stijlNaam, huttenVan } = require('./huizen.cjs');
  const S = STIJLEN[stijl];
  if (!S) throw new Error(`geen stijl "${stijl}" (huizen.cjs, STIJLEN: ${Object.keys(STIJLEN).join(', ')})`);
  const KANT = { z: 'zuid', o: 'oost', n: 'noord', w: 'west' };
  const leesbaar = (vorm) => vorm.replace(/(\D+)(\d+)/, (_, s, n) => `${s === 'steen' ? 'stenen huis' : s} ${n}`);
  // een hut kan uit een andere stijl komen (oker en roze nemen die van wit), onder het dak van die stijl
  const H = huttenVan(stijl);
  const p = (vorm, dak, stand, naam) => {
    const hut = vorm.startsWith('hut');
    const [st, dk] = hut ? [H.stijl, STIJLEN[H.stijl].dak] : [stijl, dak];
    return [naam || `${leesbaar(vorm)}, ${dk}`, { spec: VORM(stijlNaam(st, vorm, dk, stand)) }];
  };
  const [h1, h2, h3] = S.huis;
  const [s1, s2, s3] = S.huis.map((v) => v.replace('huis', 'steen'));
  const [t1, t2, t3] = H.hut;
  const [b1, b2] = S.boerderij;
  const d = S.dak;
  return [
    { naam: `de vormen van ${stijl}`, panelen: [...H.hut.map((v) => p(v, d, 'z')), ...S.huis.map((v) => p(v, d, 'z')), ...S.boerderij.map((v) => p(v, d, 'z'))] },
    { naam: 'in de vier standen: de deur naar zuid, oost, noord en west', panelen: [...['z', 'o', 'n', 'w'].map((k) => p(h3, d, k, `${leesbaar(h3)}, deur ${KANT[k]}`)), ...['z', 'o', 'n', 'w'].map((k) => p(t3, d, k, `${leesbaar(t3)}, deur ${KANT[k]}`))] },
    { naam: 'de daken van de treden, en de steen', panelen: [p(h1, d, 'z'), p(h1, 'leien', 'z'), p(h1, 'pannen', 'z'), p(s1, 'leien', 'z'), p(s1, 'pannen', 'z'), p(s1, 'baksteen', 'z')] },
    { naam: `het gehucht: ${d}`, panelen: [p(t2, d, 'o'), p(h1, d, 'z'), p(t3, d, 'w'), p(b2, d, 'z'), p(h2, d, 'n'), p(t1, d, 'z')] },
    { naam: 'een dorp: wat nieuw is of doorgroeit, krijgt leien', panelen: [p(h3, 'leien', 'o'), p(h1, d, 'z'), p(s2, 'leien', 'z'), p(t1, d, 'w'), p(b1, 'leien', 'z'), p(h2, 'leien', 'n')] },
    { naam: 'marktrecht, met een steenbakkerij: pannen, en baksteen', panelen: [p(s1, 'baksteen', 'z'), p(h2, 'pannen', 'o'), p(s3, 'pannen', 'n'), p(h1, 'leien', 'z'), p(s2, 'baksteen', 'w'), p(b2, 'pannen', 'z')] },
  ];
}

// Een plaat met rijen panelen, elke rij op één grondlijn (verhouding.png, steen.png).
async function rijenPlaat(RIJEN, bestand) {
  const plaat = await rijenBeeld(RIJEN);
  fs.writeFileSync(path.join(UIT, bestand), K.png(plaat, 1, '#0e0a14'));
  log(`${bestand}  ${plaat.b}×${plaat.h}`);
}
async function rijenBeeld(RIJEN) {
  const S = STROOK;
  const taken = [];
  const rijen = RIJEN.map((rij) => {
    const kd = rij.panelen.map(([, p]) => kaderVanPaneel(p));
    const h = Math.ceil(Math.max(...kd.map((k) => k.h)) + 110);
    const breedtes = kd.map((k) => Math.ceil(k.b + 70));
    rij.panelen.forEach(([naam, p], i) => {
      const o = { b: breedtes[i], h, onder: 50, figuur: 'boer', zonTot: 1800, deurVan: p.deurVan, draai: p.draai || 0 };
      taken.push({ naam: `${rij.naam}: ${naam}`, ...(p.oud ? { oud: p.oud } : p.delen ? { delen: p.delen } : { spec: p.spec }), o });
    });
    return { h, breedtes };
  });
  const draden = Math.max(2, Math.min(13, os.cpus().length - 1));
  const r = await renderAlle(taken, draden);
  const breed = Math.max(...rijen.map((rij) => rij.breedtes.reduce((a, b) => a + b, 0)));
  const plaat = new K.Plaat(breed, rijen.reduce((n, rij) => n + 2 * S + rij.h, 0));
  let y = 0;
  let k = 0;
  RIJEN.forEach((rij, j) => {
    schrijf(plaat, rij.naam, 8, y + 6);
    let x = 0;
    rij.panelen.forEach(([naam], i) => {
      plaat.plak(r[k++].p, x, y + 2 * S);
      schrijf(plaat, naam, x + 8, y + S + 6);
      x += rijen[j].breedtes[i];
    });
    y += 2 * S + rijen[j].h;
  });
  return plaat;
}

// voorbeeld.png (vraag 144, het voorbeeldhuis; ontwerp/beeld.md, "De huizen naar Marcels voorbeelden"; Marcel, 10 okt:
// "1 riet, 2 akkoord"): één vakwerkhuis van twee lagen onder riet, zoals de huizenbouwer het nu maakt en met elke stap
// erbij (A verweren, B diepte, C vorm, D het stukje grond), op ware grootte; voorbeeld-x2.png is dezelfde plaat twee keer
// vergroot. Met een dak erachter (node huis-sdf-export.cjs voorbeeld pannen) hetzelfde huis onder dat dak.
const VOORBEELD = { vorm: 'rechthoek', lagen: 2, zaad: 7, nok: 'x', wand: 'vakwerk', dak: 'riet', uit: { kapellen: 2, aanbouw: true, trap: true, gevelschoorsteen: true, luiken: 'den', bakken: 2 } };
// D, het stukje grond: voor de voordeur een stoepje van keien (twee tegels), ernaast tonnen met een krat, een bankje en
// een houtstapel (tuin-sdf.cjs), elk op een eigen tegel zoals ze straks in het spel staan (vraag 148, d).
function stukjeGrond(spec) {
  const H = HS.maten(spec.zaad, spec);
  const d = H.deur;
  const [ax, ay] = d.P.pos(d.u, 0, 0);
  const [bx, by] = d.P.pos(d.u + 10, 0, 0);
  const l = Math.hypot(bx - ax, by - ay);
  const langs = [(bx - ax) / l, (by - ay) / l];
  const N = [d.P.N[0], d.P.N[1]];
  const as = Math.abs(langs[0]) > Math.abs(langs[1]) ? 'x' : 'y';
  const [dx, dy] = HS.voorDeDeur(H, 0);
  const op = (a, n) => [dx + langs[0] * a + N[0] * n, dy + langs[1] * a + N[1] * n];
  return [
    { spec },
    { spec: { tuin: 'keien', zaad: 3 }, plek: op(0, 0.62) },
    { spec: { tuin: 'keien', zaad: 8 }, plek: op(0.1, 1.55) },
    { spec: { tuin: 'tonnen', zaad: 4 }, plek: op(1.45, 0.58) },
    { spec: { tuin: `bankje-${as}`, zaad: 5 }, plek: op(-1.5, 0.6) },
    { spec: { tuin: `houtstapel-${as}`, zaad: 6 }, plek: op(-2.75, 0.56) },
  ];
}

// C, de vorm: een steiler dak, de aanbouw eruit, een balkon op schoren (Marcel: "3"), een afdakje boven de deur als die
// niet onder het balkon zit, en de gevelschoorsteen naast die op het dak. Een balkon op palen leek een steiger en
// verstopte de deur; een dakkapel in het riet is gemaakt voor anderhalve laag, en tilde bij twee lagen de dakrand te ver
// op.
const VOORBEELD_VORM = { helling: 58, uit: { afdak: true, balkon: 'schoren', gevelschoorsteen: 'ook', luiken: 'den', bakken: 2 } };
const VOORBEELD_STAPPEN = [
  ['nu', {}],
  ['A verweren', { verweer: true }],
  ['B diepte', { verweer: true, diepte: true }],
  ['C vorm', { verweer: true, diepte: true }, VOORBEELD_VORM],
  ['D stukje grond', { verweer: true, diepte: true }, VOORBEELD_VORM, stukjeGrond],
  ['E grover', { verweer: true, diepte: true, grof: true, contrast: true }, VOORBEELD_VORM, stukjeGrond],
  // F (Marcel, 10 okt, bij een voorbeeld: "rossiger, rauwer, prikkeliger, en wat rieteriger"): een jong dak van ruig riet
  ['F ruig riet', { verweer: 0.3, diepte: true, grof: true, contrast: true, ruig: true }, VOORBEELD_VORM, stukjeGrond],
];
async function voorbeeld(dak, alleen) {
  const spec = (knoppen, extra) => ({ ...VOORBEELD, ...(extra || {}), ...(dak ? { dak } : {}), knoppen });
  const stappen = VOORBEELD_STAPPEN.filter(([naam]) => !alleen || alleen.split(',').some((a) => naam.startsWith(a)));
  const paneel = ([, kn, extra, delen]) => (delen ? { delen: delen(spec(kn, extra)) } : { spec: spec(kn, extra) });
  const rij = { naam: `het voorbeeldhuis${dak ? ` onder ${dak}` : ''}`, panelen: stappen.map((s) => [s[0], paneel(s)]) };
  const plaat = await rijenBeeld([rij]);
  const naam = `voorbeeld${dak ? `-${dak}` : ''}`;
  fs.writeFileSync(path.join(UIT, `${naam}.png`), K.png(plaat, 1, '#0e0a14'));
  fs.writeFileSync(path.join(UIT, `${naam}-x2.png`), K.png(plaat, 2, '#0e0a14'));
  log(`${naam}.png  ${plaat.b}×${plaat.h}`);
}

// De vijf bouwfasen van een huis van het vel (huizen.cjs) naast elkaar, op één anker.
function paneelFasen(naam) {
  const t0 = Date.now();
  const r = require('./huizen.cjs').renderHuisFasen(naam);
  const tussen = 16;
  const p = new K.Plaat(r.platen.length * (r.cb + tussen), r.ch);
  r.platen.forEach((q, i) => p.plak(q, i * (r.cb + tussen), 0));
  const ms = Date.now() - t0;
  return { p, ms, msTotaal: ms };
}

// rondom.png (werklijst vraag 124, B; Marcel, 4 okt: "124b Ja dan", en "A ja ... B ja C ja"): de draaibare huizen van
// de stijl wit, elk in zijn vier standen, en daaronder huis 1 in aanbouw in de vier standen. Een stand is hetzelfde huis,
// een kwartslag gedraaid (huis-sdf.cjs, rondom; huizen.cjs, STANDEN): elke muur zie je in twee standen, één keer in de zon
// en één keer in de schaduw, en in allebei met dezelfde ramen.
async function rondom() {
  const { stijlNaam } = require('./huizen.cjs');
  const STAND = ['z', 'o', 'n', 'w'];
  const KANT = { z: 'zuid', o: 'oost', n: 'noord', w: 'west' };
  const rij = (vorm, naam) => ({ naam, panelen: STAND.map((k) => [`deur ${KANT[k]}`, { spec: VORM(stijlNaam('wit', vorm, 'riet', k)) }]) });
  const huizen = await rijenBeeld([
    rij('huis1', 'huis 1, een kwartslag per stand: elke muur zie je twee keer, in de zon en in de schaduw'),
    rij('hut4', 'hut 4, een L: de deur in de gevel van de vleugel, die je van zuid en van oost ziet'),
    rij('huis6', 'huis 6, een T: de deur ook in de gevel van de vleugel'),
  ]);
  const fasen = await renderAlle(STAND.map((k) => ({ naam: `huis 1 in aanbouw, deur ${KANT[k]}`, fasen: stijlNaam('wit', 'huis1', 'riet', k) })), Math.max(2, Math.min(4, os.cpus().length)));
  const S = STROOK;
  const plaat = new K.Plaat(Math.max(huizen.b, ...fasen.map((r) => r.p.b)), huizen.h + fasen.reduce((n, r) => n + 2 * S + r.p.h, 0));
  plaat.plak(huizen, 0, 0);
  let y = huizen.h;
  fasen.forEach((r, i) => {
    schrijf(plaat, `huis 1 in aanbouw, deur ${KANT[STAND[i]]}: de steiger staat rondom`, 8, y + 6);
    plaat.plak(r.p, 0, y + 2 * S);
    y += 2 * S + r.p.h;
  });
  fs.writeFileSync(path.join(UIT, 'rondom.png'), K.png(plaat, 1, '#0e0a14'));
  log(`rondom.png  ${plaat.b}×${plaat.h}`);
}

if (isMainThread && require.main === module) {
  const t0 = Date.now();
  const wat = process.argv[2];
  if (wat === 'vormen') {
    vormen().then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'materiaal') {
    materiaal().then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'uitbouwen') {
    uitbouwen().then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'ladder') {
    ladder().then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'afwisseling') {
    afwisseling().then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'verhouding' || wat === 'steen') {
    rijenPlaat(wat === 'steen' ? STEEN_PLAAT : VERHOUDING, `${wat}.png`).then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'groot3') {
    // node huis-sdf-export.cjs groot3 [stijl]: de kapel en de woontoren in de stijl van de huizen (8 okt)
    const alleen = process.argv[3];
    rijenPlaat(groot3Rijen(alleen), `groot3${alleen ? `-${alleen}` : ''}.png`).then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'groot2') {
    rijenPlaat(groot2Rijen().filter((r) => !process.argv[3] || r.naam.includes(process.argv[3])), `groot2${process.argv[3] ? `-${process.argv[3]}` : ''}.png`).then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'groot') {
    // node huis-sdf-export.cjs groot [stijl]: de grote gebouwen van elke stijl (of één), en de herberg in vier standen
    const alleen = process.argv[3];
    const rijen = grootRijen().filter((r) => !alleen || r.naam === alleen || (alleen === 'standen' && r.naam.startsWith('de herberg')));
    rijenPlaat(rijen, `groot${alleen ? `-${alleen}` : ''}.png`).then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'rondom') {
    rondom().then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'voorbeeld') {
    // node huis-sdf-export.cjs voorbeeld [dak] [B,C]: alleen die stappen, om sneller te kijken
    voorbeeld(process.argv[3] === '-' ? null : process.argv[3], process.argv[4]).then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'stijl') {
    // node huis-sdf-export.cjs stijl wit: een bouwstijl van het spel (huizen.cjs, STIJLEN)
    const stijl = process.argv[3] || 'wit';
    rijenPlaat(stijlRijen(stijl), `stijl-${stijl}.png`).then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'een') {
    // één huis naar keuze: een <vorm> <lagen> <zaad> [nok] [sleutel=waarde ...]; schrijft het
    // paneel en het huis twee keer vergroot. snede=x,y,b,h kiest een uitsnede voor het vergrote.
    const [vorm = 'rechthoek', lagen = '1', zaad = '1', nok = 'x', ...rest] = process.argv.slice(3);
    const spec = { vorm, lagen: Number(lagen), zaad: Number(zaad), nok };
    let snede = null;
    // uit=false zet de uitbouwen uit; uit=aanbouw,erker,kapellen:2,luiken:den vraagt ze op
    const waarde = (v) => (v === 'false' ? false : v === 'true' ? true : Number.isNaN(Number(v)) ? v : Number(v));
    for (const kv of rest) {
      const [k, v] = kv.split('=');
      if (k === 'snede') snede = v.split(',').map(Number);
      else if (k === 'wand' && v.includes(',')) spec.wand = v.split(',');
      else if (k === 'uit') spec.uit = v === 'false' ? false : Object.fromEntries(v.split(',').map((n) => (n.includes(':') ? [n.split(':')[0], waarde(n.split(':')[1])] : [n, true])));
      else spec[k] = k === 'voor' || k === 'kantelen' ? v !== 'false' : waarde(v);
    }
    const r = paneelHuis(spec);
    fs.writeFileSync(path.join(UIT, 'een.png'), K.png(r.p, 1, '#0e0a14'));
    const s = snede ? r.p.uitsnede(...snede) : r.p;
    fs.writeFileSync(path.join(UIT, 'een-x2.png'), K.png(s, 2, '#0e0a14'));
    log(`${opschrift({ naam: vorm, ...spec })}: huis ${(r.ms / 1000).toFixed(1)} s, paneel ${(r.msTotaal / 1000).toFixed(1)} s, ${r.p.b}×${r.p.h}`);
  } else if (wat === 'alleen') {
    // één proefhuis, om snel te kijken: node huis-sdf-export.cjs alleen <zaad> [x y b h]
    // schrijft het paneel, en een uitsnede twee keer vergroot (standaard het hele huis)
    const z = Number(process.argv[3] || 1);
    const [sx, sy, sb, sh] = process.argv.slice(4, 8).map(Number);
    const r = paneelProef(z);
    fs.writeFileSync(path.join(UIT, `zaad-${z}.png`), K.png(r.p, 1, '#0e0a14'));
    const snede = sb ? r.p.uitsnede(sx, sy, sb, sh) : r.p;
    fs.writeFileSync(path.join(UIT, `zaad-${z}-x2.png`), K.png(snede, 2, '#0e0a14'));
    log(`zaad ${z}: ${r.ms} ms`);
  } else {
    vergelijk();
    if (wat === 'knoppen') knoppen();
  }
  if (!['vormen', 'materiaal', 'uitbouwen', 'ladder', 'afwisseling', 'verhouding', 'steen', 'stijl', 'rondom', 'groot', 'groot2', 'groot3', 'voorbeeld'].includes(wat)) log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

module.exports = { paneelNu, paneelProef, paneelHuis, paneelSamen, paneelTuin, paneelTuintje, paneelZes, kaderVan, grondZon, schrijf };
