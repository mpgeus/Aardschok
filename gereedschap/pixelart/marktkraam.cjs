// De kraam van de markt op het plein (ontwerp/werklijst.md, vraag 110, d en e; js/markt.js): het model uit dorp.cjs
// (`marktkraam`: een toonbank met planken, vier palen, een gestreepte luifel met een geschulpte rand, en appels, kolen,
// broden en een kruik), nu ook in het spel. Een kraam kijkt naar het midden van het plein, dus van vier kanten: één cel
// per kant, in de volgorde van RICHTINGEN (de klantenkant, lokaal +y, kijkt die kant op; ZO is +x op de kaart, ZW +y).
//
// Eén vel, beelden/marktkraam.png (naar-spel.cjs --alleen marktkraam), zoals de meiboom (meiboom.cjs). Het anker is het
// midden van de tegel, op de grond. De luifel werpt zijn schaduw op de toonbank; de schaduw op de grond en het licht van
// het uur tekent het spel zelf (vraag 125).
//
//   node gereedschap/pixelart/marktkraam.cjs    (de proefplaat: uit/marktkraam-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');
const F = require('./figuren.cjs');

// ---------------------------------------------------------------- maten

// Een kraam staat op één tegel (64 pixels breed): een iets kleinere schaal dan op het dorpsplein van dorp.cjs (1,5),
// zodat de toonbank op zijn tegel past en de luifel er maar een beetje overheen steekt.
const SCHAAL = 1.1;
const CEL = [96, 96];
const ANKER = [48, 74];
const RICHTINGEN = ['ZO', 'ZW', 'NW', 'NO'];
// De soorten waar (dorp.cjs, KRAAMWAREN), elk met een lege kraam ernaast: een dorp zonder brood heeft een lege
// broodkraam (vraag 127, A).
const SOORTEN = Object.keys(D.KRAAMWAREN);
// Wat er naast een kraam op de grond staat (dorp.cjs, marktmand): elk op zijn eigen tegel, kleiner dan een kraam.
const MAND_CEL = [64, 64];
const MAND_ANKER = [32, 46];
const MANDEN = [
  ['mand appels', { soort: 'mand', vol: 'appels' }],
  ['mand kolen', { soort: 'mand', vol: 'kolen' }],
  ['mand leeg', { soort: 'mand' }],
  ['krat brood', { soort: 'krat', vol: 'brood' }],
  ['krat wol', { soort: 'krat', vol: 'wol' }],
  ['zak', { soort: 'zak' }],
  ['ton graan', { soort: 'ton', vol: 'graan' }],
  ['ton leeg', { soort: 'ton' }],
];
// Zo tekent het spel de figuren (dorpelingen-anim.cjs), voor de proefplaat.
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

// ---------------------------------------------------------------- tekenen

// Een kraam van `o.lengte` tegels staat met zijn eerste tegel op het anker, en loopt langs de rij verder: bij ZW en NO
// (de toonbank naar +y of -y) langs x, bij ZO en NW langs y (vraag 127, a).
const LANG_CEL = [224, 136];
const LANG_ANKER = [112, 74];
function kraamCel(richting, o = {}) {
  const L = o.lengte || 1;
  const [b, h, ax, ay] = L > 1 || o.lang ? [...LANG_CEL, ...LANG_ANKER] : [...CEL, ...ANKER];
  const B = new K.Beeld(b, h, ax, ay);
  const langsX = richting === 'ZW' || richting === 'NO';
  D.zetModel(B, D.marktkraam(SCHAAL, o), langsX ? (L - 1) / 2 : 0, langsX ? 0 : (L - 1) / 2, richting);
  D.zonSchaduw(B, []);
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

function mandCel(o) {
  const B = new K.Beeld(MAND_CEL[0], MAND_CEL[1], MAND_ANKER[0], MAND_ANKER[1]);
  D.zetModel(B, F.geschaald(D.marktmand(o), 1.1), 0, 0, 'ZO');
  D.zonSchaduw(B, []);
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// ---------------------------------------------------------------- het vel

// Per soort waar vier richtingen, en daarachter dezelfde soort leeg (nog eens vier), en daarna de manden: één rij
// cellen, zoals de tekens (papieren.cjs). Welke cel waar staat, zegt de beschrijving hieronder.
function vel() {
  const cellen = [];
  for (const soort of SOORTEN) for (const leeg of [false, true]) for (const r of RICHTINGEN) cellen.push(kraamCel(r, { waar: soort, leeg }));
  const uit = new K.Plaat(CEL[0] * cellen.length, CEL[1]);
  cellen.forEach((p, i) => uit.plak(p, i * CEL[0], 0));
  return uit;
}

function mandenVel() {
  const uit = new K.Plaat(MAND_CEL[0] * MANDEN.length, MAND_CEL[1]);
  MANDEN.forEach(([, o], i) => uit.plak(mandCel(o), i * MAND_CEL[0], 0));
  return uit;
}

// Wat in beelden/beschrijving.json komt (naar-spel.cjs): het bestand, de maat van een cel, het anker, en in welke
// volgorde de cellen staan. Een cel zoekt het spel op met soort, leeg en richting (js/sprites.js, S.kraam).
function beschrijving(bestand, mandenBestand) {
  return {
    bestand,
    cel: CEL,
    anker: ANKER,
    richtingen: RICHTINGEN,
    soorten: SOORTEN,
    manden: { bestand: mandenBestand, cel: MAND_CEL, anker: MAND_ANKER, namen: MANDEN.map(([n]) => n) },
  };
}

// ---------------------------------------------------------------- de proefplaat

// Hoeveel pixels een tekening van de rand van zijn cel afblijft, om te zien of hij nog past.
function ruimte(p) {
  let x0 = p.b;
  let x1 = -1;
  let y0 = p.h;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { boven: y0, links: x0, rechts: p.b - 1 - x1, onder: p.h - 1 - y1 };
}

function vergroot(p, n) {
  const uit = new K.Plaat(p.b * n, p.h * n);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (!k) continue;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) uit.zet(x * n + i, y * n + j, k[0], k[1]);
    }
  }
  return uit;
}

// Een stuk markt zoals het spel het zet: een rij kramen met hun waar, manden en kisten ertussen, en wat volk ervoor,
// van achter naar voor met elk zijn anker op het midden van zijn tegel (vraag 127, stap 1: de proefplaat die Marcel
// keurt). Daaronder dezelfde kramen leeg, zoals een dorp ze heeft dat die waar niet maakt.
function proef() {
  const vol = {};
  const leeg = {};
  for (const soort of SOORTEN) {
    vol[soort] = { ZW: kraamCel('ZW', { waar: soort }), NO: kraamCel('NO', { waar: soort }) };
    leeg[soort] = kraamCel('ZW', { waar: soort, leeg: true });
  }
  const manden = Object.fromEntries(MANDEN.map(([n, o]) => [n, mandCel(o)]));
  const { boer, herbergierster, dorpsoudste } = require('./dorpelingen.cjs');
  // ze staan voor de kramen: wie bij de voorste rij staat kijkt ervandaan (Z), wie bij de achterste rij staat ernaartoe (N)
  const fig = (maak, richting) => K.losRenderen(maak({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting });
  const B = 560;
  const H = 450;
  const plaat = new K.Plaat(B, H);
  const legOp = (p, anker, gx, gy, OX, OY) => plaat.plak(p, OX + (gx - gy) * 32 - anker[0], OY + (gx + gy) * 16 - anker[1]);

  // Boven: het marktblok zoals het in het spel komt (vraag 127, B): twee rijen kramen tegenover elkaar met een looppad
  // ertussen, manden en kisten ernaast, en volk dat boodschappen doet (D).
  const blok = [];
  SOORTEN.slice(0, 3).forEach((s, i) => blok.push([i * 2, 0, vol[s].ZW, ANKER]));
  SOORTEN.slice(3).forEach((s, i) => blok.push([i * 2 + 1, 5, vol[s].NO, ANKER]));
  [['mand appels', 1, 1], ['krat brood', 3, 1], ['ton graan', 0, 4], ['zak', 4, 4], ['mand kolen', 4, 0]].forEach(([n, gx, gy]) => blok.push([gx, gy, manden[n], MAND_ANKER]));
  blok.push([1, 2, fig(boer, 'N'), FIG_ANKER]);
  blok.push([3, 3, fig(herbergierster, 'Z'), FIG_ANKER]);
  blok.push([4, 2, fig(dorpsoudste, 'N'), FIG_ANKER]);
  blok.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  for (const [gx, gy, p, anker] of blok) legOp(p, anker, gx, gy, 230, 70);

  // Onder: dezelfde vijf kramen leeg, zoals een dorp ze heeft dat die waar niet maakt, en daaronder alles wat ernaast
  // op de grond staat.
  SOORTEN.forEach((s, i) => plaat.plak(leeg[s], 10 + i * 108, 228));
  MANDEN.forEach(([n], i) => plaat.plak(manden[n], 18 + i * 66, 360));

  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'marktkraam-proef.png'), K.png(plaat, 2, '#6e7558'));
  for (const s of SOORTEN) {
    const ru = ruimte(vol[s].ZW);
    if (Math.min(ru.boven, ru.links, ru.rechts, ru.onder) < 1) console.log(`LET OP: ${s} raakt de rand van zijn cel`);
  }
  console.log(`kramen: ${SOORTEN.join(', ')}; grond: ${MANDEN.map(([n]) => n).join(', ')}`);
  console.log(`uit/marktkraam-proef.png (${plaat.b * 2}×${plaat.h * 2}); cel ${CEL.join('×')}, anker ${ANKER.join(',')}`);
  return plaat;
}

// De kramen in hun vormen en lengtes (vraag 127, stap 2b): per rij een vorm (de luifel, het puntdak, het zeil, de kar),
// van links naar rechts één, twee en drie tegels lang, en dan dezelfde kraam leeg; elk met een andere waar, en een boer
// ervoor voor de maat.
function proefVormen() {
  const { boer } = require('./dorpelingen.cjs');
  const figuur = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'N' });
  const waren = { luifel: ['groente', 'vis', 'laken'], puntdak: ['brood', 'laken', 'vis'], zeil: ['potten', 'vis', 'laken'], kar: ['groente', 'groente', 'brood'] };
  const KOL = 240;
  const RIJ = 150;
  const plaat = new K.Plaat(KOL * 4, RIJ * D.KRAAMVORMEN.length);
  D.KRAAMVORMEN.forEach((vorm, r) => {
    [1, 2, 3].forEach((L, k) => {
      const cel = kraamCel('ZW', { waar: waren[vorm][k], vorm, lengte: L, lang: true });
      plaat.plak(cel, k * KOL + KOL / 2 - LANG_ANKER[0], r * RIJ + 4);
      if (k === 0) plaat.plak(figuur, k * KOL + KOL / 2 - FIG_ANKER[0] - 6 + 32, r * RIJ + 4 + LANG_ANKER[1] + 32 - FIG_ANKER[1]);
    });
    const leeg = kraamCel('ZW', { waar: waren[vorm][1], vorm, lengte: 2, leeg: true, lang: true });
    plaat.plak(leeg, 3 * KOL + KOL / 2 - LANG_ANKER[0], r * RIJ + 4);
  });
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'marktkraam-vormen.png'), K.png(plaat, 1, '#6e7558'));
  console.log(`uit/marktkraam-vormen.png (${plaat.b}×${plaat.h})`);
  return plaat;
}

if (require.main === module) (process.argv.includes('vormen') ? proefVormen : proef)();

module.exports = { vel, mandenVel, beschrijving, proef, proefVormen, kraamCel, mandCel, CEL, ANKER, RICHTINGEN, SOORTEN, MANDEN };
