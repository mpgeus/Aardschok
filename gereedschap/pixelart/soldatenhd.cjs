// De soldaten van het dorp en de poppetjes in HD, met de eigen pijplijn (werklijst Q, f; ontwerp/beeld.md, "De soldaten van
// het dorp en de poppetjes met SDXL"; Marcel, 20 okt: "wil je eens een aantal nieuwe poppetjes maken voor het spel? en SDXL
// gebruiken? Ik heb ook een set soldaten nodig", en "Pracht en praal betekent hier, gewoon goed, hd, passend en exact wat ik
// zoek"). Dezelfde weg als de kar (karhd.cjs, gereedschap/ai/ai-afwerking.md):
//   1. het poppetje in code (vorm, botten, houdingen, acht richtingen);
//   2. SDXL schildert een meesterbeeld van voren (zuidwest) en een van achteren (noordoost) op onze render van 6×, binnen
//      ons silhouet, met ControlNet op onze lijnen en diepte en een zin per gebied (huisstijl.cjs);
//   3. die verf gaat terug op het model (bakken.cjs projectie, voor en achter), zodat het in elke richting en elk loopbeeld
//      hetzelfde poppetje blijft;
//   4. ons handschrift naar de stijlspecificatie (karhd.cjs handschrift, H4) maakt er de sprite van 2× van.
//
//   node gereedschap/pixelart/soldatenhd.cjs kijk     het model zonder AI: acht richtingen op spelmaat en zuidwest op 4×,
//                                                     uit/soldatenhd/kijk.png
//   node gereedschap/pixelart/soldatenhd.cjs proef    de proefplaat (ComfyUI moet draaien): de meesterbeelden van SDXL (en
//                                                     één van ERNIE ernaast), en de sprite in acht richtingen en lopend,
//                                                     naast de speerman en de soldaat van nu: uit/soldatenhd/proef.png.
//                                                     Een meesterbeeld van eerder wordt hergebruikt (OPNIEUW=1: opnieuw).
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const H = require('./hdproef.cjs');
const HR = require('./heer.cjs');

const UIT = path.join(__dirname, 'uit', 'soldatenhd');
// de stijlplaten: uitsneden uit Marcels plaat (ontwerp/voorbeelden/heerstoet-doel.webp), naast die plaat
const VOORBEELDEN = path.join(__dirname, '..', '..', 'ontwerp', 'voorbeelden');
// de cel van een figuur (dorpelingen-anim.cjs): 112 bij 124, het anker op (56, 110)
const CEL = [112, 124];
const ANKER = [56, 110];
const FIJN = 4; // de render van de sprite (karhd.cjs: 4× gerenderd, een sprite van 2×)
const STAND = { houding: 'staan', fase: 0 };

// De poppetjes van de proef: de speerman (de bouw van de soldaat van de heer, in de kleuren van het dorp).
const POPPETJES = {
  speerman: (stand) => HR.soldaat(stand, { livrei: 'dorp', wapen: 'speer', schild: true, kraag: true }),
};

// De naam van elk materiaal van de soldaat voor de zinnen per gebied (huisstijl.cjs GROEP); het blauw op het schild is
// geschilderd hout, op de wapenrok wol.
const NAAM_SOLDAAT = {
  huid: 'gezicht', oog: 'gezicht', mond: 'gezicht', baard: 'haar', wambuis: 'wambuis', rood: 'wapenrok', geel: 'schoof',
  hoos: 'hozen', laars: 'laars', riem: 'gordel', gesp: 'helm', helm: 'helm', hout: 'schacht', ijzer: 'helm',
  handschoen: 'handschoen', malie: 'malie',
};
const NAAM_M = Object.fromEntries(Object.entries(HR.SOLDAAT_M).map(([n, i]) => [i, n]));
function naamVan(d, mi) {
  if (d.deel === HR.SOLDAAT_D.schild && mi === HR.SOLDAAT_M.rood) return 'schildverf';
  return NAAM_SOLDAAT[NAAM_M[mi]] || null;
}

// Een poppetje in één richting, op `fijn` keer de spelmaat, met de G-buffer (zoals karhd.cjs render).
function render(model, kant, fijn = 1) {
  const B = new K.Beeld(CEL[0] * fijn, CEL[1] * fijn, ANKER[0] * fijn, ANKER[1] * fijn);
  K.tekenModel(B, model, { richting: kant, rust: true, gbuffer: true, fijn });
  K.belicht(B);
  const zl = K.kleurBeeld(B);
  return { b: B.b, h: B.h, ramp: B.ramp, stap: B.stap, diep: B.diep, deel: B.deel, nrm: B.nrm, rust: B.rust, albedo: B.albedo, g: B.g, kleur: B.kleur, zl, nagels: [] };
}

// Het model zonder AI: acht richtingen op spelmaat (drie keer vergroot om te zien) en zuidwest op 4×.
function kijk(naam = 'speerman') {
  fs.mkdirSync(UIT, { recursive: true });
  const klein = K.KANTEN.map((kant) => render(POPPETJES[naam](STAND), kant, 1).zl);
  const u = H.uitsnede(klein, 2);
  const rij1 = klein.map((r) => H.snij(r, u, 3));
  const groot = render(POPPETJES[naam](STAND), 'ZW', 4).zl;
  const ug = H.uitsnede([groot], 4);
  H.bewaar(path.join(UIT, 'kijk.png'), H.naastElkaar([...rij1, H.snij(groot, ug, 1)], 9));
  console.log('uit/soldatenhd/kijk.png');
}

// ---------------------------------------------------------------- het meesterbeeld

// De render waaruit geprojecteerd wordt (karhd.cjs bakRender): dezelfde materialen zonder beeld, en per pixel het onderdeel.
function bakRender(naam, kant, fijn) {
  const BK = require('./bakken.cjs');
  const KH = require('./karhd.cjs');
  const m = POPPETJES[naam](STAND);
  const R = render({ ...m, mat: m.mat.map((x) => x && BK.projectieMateriaal(x, null, { zacht: KH.ZACHT })) }, kant, fijn);
  return { R, m, onderdeel: (v) => m.delen[Math.round(v)] };
}

// De gebieden voor de zinnen (karhd.cjs gebiedenVan, voor één poppetje): per groep de pixels van het doek.
function gebiedenVan(BR, ox, oy, b, h) {
  const HU = require('../ai/huisstijl.cjs');
  const { R } = BR;
  const per = new Map();
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const X = x + ox, Y = y + oy;
    if (X >= R.b || Y >= R.h) continue;
    const i = Y * R.b + X;
    if (R.ramp[i] < 0 || Number.isNaN(R.rust[i * 4])) continue;
    const d = BR.onderdeel(R.rust[i * 4 + 3]);
    const mi = typeof d.m === 'function' ? d.m(R.rust[i * 4], R.rust[i * 4 + 1], R.rust[i * 4 + 2]) : d.m;
    const groep = HU.groepVoor(naamVan(d, mi));
    if (!groep) continue;
    const g = per.get(groep) || per.set(groep, { pixels: [], tel: new Map() }).get(groep);
    g.pixels.push(y * b + x);
    g.tel.set(mi, (g.tel.get(mi) || 0) + 1);
  }
  const uit = [];
  for (const [groep, g] of per) {
    if (g.pixels.length < b * h * 0.002) continue; // een oog, een gesp: die doet de rest
    const hoofd = [...g.tel].sort((p, q) => q[1] - p[1])[0][0];
    const tekst = HU.GROEPZIN[groep](rampKleur(BR.m.mat[hoofd]), {});
    if (tekst) uit.push({ groep, tekst, pixels: g.pixels });
  }
  return uit;
}
function rampKleur(mat) {
  const r = mat && K.RAMP_RGB[K.RAMP[mat.ramp]];
  return r ? r[Math.floor(r.length * 0.6)] : [128, 128, 128];
}

// Een meesterbeeld: SDXL (de huisstijl, met de schilderwoorden) of ERNIE schildert het poppetje op onze render van 6×.
// Van eerder als het er al is (OPNIEUW=1 om opnieuw te schilderen).
async function meester(naam, kant, schilder = 'sdxl') {
  const AF = require('../ai/afwerking.cjs');
  const A = require('../ai/beeld-ai.cjs');
  const DK = require('../ai/doek.cjs');
  const HU = require('../ai/huisstijl.cjs');
  const S = require('./stijl.cjs');
  const KH = require('./karhd.cjs');
  const BR = bakRender(naam, kant, KH.FMEESTER);
  const R = BR.R;
  const map = path.join(UIT, 'meester', `${naam}-${schilder}`);
  fs.mkdirSync(map, { recursive: true });
  const instPad = path.join(map, `${kant}-instellingen.json`);
  if (!process.env.OPNIEUW && fs.existsSync(instPad)) {
    const inst = JSON.parse(fs.readFileSync(instPad));
    const ai = A.leesPng(fs.readFileSync(path.join(map, `${kant}-ai.png`)));
    console.log(`${naam} ${schilder} ${kant}: van eerder`);
    return { BR, beeld: KH.opRender(R, ai, inst.plek[0], inst.plek[1]), ai, tijd: inst.seconden };
  }
  // de uitsnede: wat dekt, met een rand, op veelvouden van 64 (SDXL)
  let x0 = R.b, x1 = 0, y0 = R.h, y1 = 0;
  for (let i = 0; i < R.b * R.h; i++) if (R.ramp[i] >= 0) {
    const x = i % R.b;
    const y = (i - x) / R.b;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const b = Math.ceil((x1 - x0 + 1 + 32) / 64) * 64;
  const h = Math.ceil((y1 - y0 + 1 + 32) / 64) * 64;
  const ox = Math.max(0, Math.floor((x0 + x1 - b) / 2));
  const oy = Math.max(0, Math.floor((y0 + y1 - h) / 2));
  const dekt = (X, Y) => X >= 0 && Y >= 0 && X < R.b && Y < R.h && R.ramp[Y * R.b + X] >= 0;
  const knip = (r, leeg) => {
    const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const X = x + ox, Y = y + oy;
      const i = (y * b + x) * 4;
      if (X < 0 || Y < 0 || X >= R.b || Y >= R.h) { uit.rgba.set([...leeg, 255], i); continue; }
      r.rgba.copy(uit.rgba, i, (Y * R.b + X) * 4, (Y * R.b + X) * 4 + 4);
      uit.rgba[i + 3] = 255;
    }
    return uit;
  };
  const init = knip(R.zl, [255, 0, 255]);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) if (!dekt(x + ox, y + oy)) init.rgba.set([255, 0, 255, 255], (y * b + x) * 4);
  // het masker: het silhouet, vier pixels ruimer
  const masker = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    let in4 = false;
    for (let dy = -4; dy <= 4 && !in4; dy++) for (let dx = -4; dx <= 4 && !in4; dx++) in4 = dekt(x + ox + dx, y + oy + dy);
    masker.rgba.set(in4 ? [255, 255, 255, 255] : [0, 0, 0, 255], (y * b + x) * 4);
  }
  const lijnen = knip(S.lijnenVan(R), [0, 0, 0]);
  const diepte = knip(S.diepteVan(R), [0, 0, 0]);
  const namen = {
    positief: `HD pixel art game sprite of a medieval village spearman, ${HU.HUISSTIJL.zin}, ${HU.SCHILDER.zin}`,
    negatief: `${HU.HUISSTIJL.negatief}, ${HU.SCHILDER.negatief}`,
  };
  for (const [k, r] of Object.entries({ init, masker, lijnen, diepte })) {
    const data = K.pngVanBeeld(r);
    fs.writeFileSync(path.join(map, `${kant}-${k}.png`), data);
    namen[k] = await A.upload(`aardschok-soldaat-${naam}-${kant}-${k}.png`, data, 'image/png');
  }
  const gebieden = gebiedenVan(BR, ox, oy, b, h);
  namen.gebieden = [];
  for (const [k, g] of gebieden.entries()) {
    const mk = { b, h, rgba: Buffer.alloc(b * h * 4) };
    for (let i = 0; i < b * h; i++) mk.rgba.set([0, 0, 0, 255], i * 4);
    for (const p of g.pixels) mk.rgba.set([255, 255, 255, 255], p * 4);
    namen.gebieden.push({ masker: await A.upload(`aardschok-soldaat-${naam}-${kant}-gebied-${k}.png`, K.pngVanBeeld(mk), 'image/png'), tekst: g.tekst });
  }
  const o = { ...AF.START, ...HU.HUISSTIJL.instellingen, checkpoint: HU.HUISSTIJL.checkpoint, cfg: HU.SCHILDER.cfg };
  const stroom = schilder === 'ernie' ? AF.werkstroomErnie(namen, {}) : AF.werkstroom(namen, o);
  const t0 = Date.now();
  const png = await DK.maak(b, h).voerUit(stroom);
  const tijd = (Date.now() - t0) / 1000;
  fs.writeFileSync(path.join(map, `${kant}-ai.png`), png);
  fs.writeFileSync(instPad, JSON.stringify({ naam, kant, schilder, fijn: KH.FMEESTER, doek: [b, h], plek: [ox, oy], instellingen: schilder === 'ernie' ? 'afwerking.cjs ERNIE.start' : o, positief: namen.positief, negatief: namen.negatief, gebieden: gebieden.map((g) => ({ groep: g.groep, tekst: g.tekst, pixels: g.pixels.length })), seconden: +tijd.toFixed(1), wanneer: new Date().toISOString() }, null, 1));
  const ai = A.leesPng(png);
  console.log(`${naam} ${schilder} ${kant}: ${tijd.toFixed(0)} s, doek ${b}×${h}`);
  return { BR, beeld: KH.opRender(R, ai, ox, oy), ai, tijd };
}

// De meesterbeelden op het model: voor en achter (de eerste die een punt zag, wint), en anders gespiegeld.
function projecteer(meesters) {
  const BK = require('./bakken.cjs');
  const KH = require('./karhd.cjs');
  const paars = (k) => k[2] > k[1] + 40 && k[0] > k[1] + 40; // het magenta van de achtergrond
  const sleutel = (v) => meesters[0].BR.m.delen[Math.round(v)].deel;
  const prs = meesters.map((ms) => BK.projectie(ms.BR.R, ms.beeld, { sleutel, binnen: (X, Y) => ms.beeld.rgba[(Y * ms.beeld.b + X) * 4 + 3] >= 128, soort: (k) => !paars(k) }));
  const spiegelX = (p) => [-p[0], p[1], p[2]];
  const sleutelVan = (d) => d.deel;
  return (m) => ({ ...m, mat: m.mat.map((x) => x && BK.projectieMateriaal(x, prs, { kopieen: [spiegelX], sleutelVan, zacht: KH.ZACHT })) });
}

// Een sprite van 2× met ons handschrift (H4, de stijlspecificatie).
function sprite(model, kant) {
  const KH = require('./karhd.cjs');
  const HU = require('../ai/huisstijl.cjs');
  const R = render(model, kant, FIJN);
  return KH.handschrift(R, KH.handschriftStijl(), { spec: HU.HUISSTIJL.spec }).h4;
}

// Een cel uit een vel van het spel (beelden/figuren), voor de vergelijking.
function celVanNu(naam, houding, kant, beeld = 0) {
  const besch = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'beelden', 'beschrijving.json'))).figuren[naam];
  const hd = besch.houdingen[houding];
  const vel = H.lees(path.join(__dirname, '..', '..', 'beelden', 'figuren', hd.bestand));
  const [cb, ch] = hd.cel;
  const r = besch.richtingen.indexOf(kant);
  return H.alfaSnij(vel, { x0: beeld * cb, y0: r * ch, b: cb, h: ch });
}

async function proef(naam = 'speerman') {
  const E = require('../ai/etiket.cjs');
  fs.mkdirSync(UIT, { recursive: true });
  const zw = await meester(naam, 'ZW');
  const no = await meester(naam, 'NO');
  const ernie = await meester(naam, 'ZW', 'ernie');
  const metSdxl = projecteer([zw, no]);
  const metErnie = projecteer([ernie, no]);
  const maak = POPPETJES[naam];
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r, rand = 3) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], rand)));
  // gelijke vakjes per rij: één uitsnede over alle beelden van de rij
  const rij = (beelden, n) => {
    const u = H.uitsnede(beelden, 3);
    return beelden.map((r) => groot(H.alfaSnijMetGrond(H.alfaSnij(r, u)), n));
  };
  const t0 = Date.now();
  const kanten = K.KANTEN.map((kant) => sprite(metSdxl(maak(STAND)), kant));
  const lopen = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => sprite(metSdxl(maak({ houding: 'lopen', fase: i / 8 })), 'ZW'));
  const ernieZW = sprite(metErnie(maak(STAND)), 'ZW');
  const zonder = sprite(maak(STAND), 'ZW');
  console.log(`sprites in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  for (const [i, r] of kanten.entries()) H.bewaar(path.join(UIT, `${naam}-staan-${K.KANTEN[i]}.png`), r);
  // de vergelijking op spelmaat: de speerman van nu is een dorpeling (boer-u7), de soldaat van de heer heeft een eigen vel;
  // die zijn 1×, dus twee keer zo groot om naast de sprite van 2× te staan
  const nu = [celVanNu('boer-u7', 'staan', 'ZW'), celVanNu('soldaat', 'staan', 'ZW')].map((r) => groot(r, 2));
  const vak = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 3)));
  const verklein = (r) => H.verklein(r, 2, 'naast');
  E.bewaar(path.join(UIT, 'proef.png'), [
    [E.met(verklein(zw.ai), `SDXL zuidwest (${zw.tijd.toFixed(0)} s)`), E.met(verklein(no.ai), `SDXL noordoost (${no.tijd.toFixed(0)} s)`), E.met(verklein(ernie.ai), `ERNIE zuidwest (${ernie.tijd.toFixed(0)} s)`)],
    rij(kanten, 2).map((r, i) => E.met(r, i ? K.KANTEN[i] : `SDXL · ${K.KANTEN[i]}`)),
    rij(lopen, 2).map((r, i) => E.met(r, i ? `${i}` : 'lopen · 0')),
    [E.met(vak(nu[0]), 'nu: een dorpeling'), E.met(vak(nu[1]), 'nu: de soldaat van de heer'), E.met(groot(vak(zonder), 1), 'ons model, zonder AI'), E.met(groot(vak(kanten[1]), 1), 'met SDXL'), E.met(groot(vak(ernieZW), 1), 'met ERNIE')],
  ], 'De speerman van het dorp', 'Rij 1: de meesterbeelden op onze render van 6× (gehalveerd). Rij 2 en 3: de sprite van 2× (de HD-maat), maal 2. Rij 4: op de HD-maat naast de speerman en de soldaat van nu (die op 1×, maal 2).');
  console.log('uit/soldatenhd/proef.png');
}

// ---------------------------------------------------------------- eerst een mooi poppetje van de AI

// Marcel, 20 okt, na het eerste meesterbeeld (SDXL over onze render: een groene helm, paarse maliën, een esdoornblad):
// "Maar, kun je niet met ai een mooi poppetje genereren en dat als basis gebruiken voor een schilderbeurt? Want dingen uit
// code worden gewoon niet zo mooi". Dus andersom: SDXL maakt het poppetje vrij (denoise 1, niets van onze kleuren of
// lijnen), en van ons model gaat alleen de diepte zacht mee (de houding, de hoek van de camera, de maat), zodat het beeld
// later nog op het model past. Een paar zaden naast elkaar; Marcel kiest. Per ronde een eigen zin (`concept speerman 2`).
const { VRIJ } = require('../ai/vrij.cjs');
const CONCEPTEN = {};
// ronde 1: mooi, maar "wheat sheaf" werd een losse korenaar boven het hoofd, het schild goud, en de borst zonder wapen
CONCEPTEN[1] = {
  fijn: 10,
  positief: 'full body medieval village spearman standing, seen from above at a three-quarter angle, steel kettle hat, ' +
    'chainmail coif, quilted brown gambeson, deep blue tabard with a golden wheat sheaf emblem on the chest, heater shield ' +
    'painted deep blue with a golden wheat sheaf, long spear with a leaf-shaped iron head, brown leather boots, ' +
    'high-definition hand-painted pixel art game sprite, premium medieval strategy game asset, stylized realism, rich ' +
    'tactile materials, warm directional light from the upper left, crisp silhouette, plain light grey background',
  negatief: 'photo, photorealism, 3d render, plastic, blurry, deformed, extra limbs, extra weapons, two spears, text, ' +
    'watermark, signature, frame, border, ground, grass, scenery, multiple people, cropped, purple, magenta',
  instellingen: VRIJ,
  zaden: [11, 22, 33, 44],
};
// ronde 2 (Marcel koos zaad 44 als richting, en "Eerst meer concepten"): wat 44 heeft in de zin (de gewatteerde wapenrok,
// maliën op de schouders, een bruine kap met sjaal), de schoof als wapen geschilderd op het schild in plaats van als
// voorwerp, het schild blauw, en de losse aren en een gouden schild in de negatieve zin
CONCEPTEN[2] = {
  ...CONCEPTEN[1],
  positief: 'full body medieval village spearman standing, seen from above at a three-quarter angle, steel kettle hat with ' +
    'rivets, brown wool hood and scarf, chainmail shoulders, deep blue quilted padded tabard with a leather belt, a deep blue ' +
    'heater shield with an iron rim and a golden wheat-ear coat of arms painted on it, long spear with a leaf-shaped iron ' +
    'head, brown leather boots, high-definition hand-painted pixel art game sprite, premium medieval strategy game asset, ' +
    'stylized realism, rich tactile materials, warm directional light from the upper left, crisp silhouette, plain light ' +
    'grey background',
  negatief: `${CONCEPTEN[1].negatief}, floating wheat, wheat stalks above the head, plants, feathers, golden shield, gold shield, orange shield`,
  zaden: [101, 102, 103, 104, 105, 106, 107, 108],
};
// ronde 3 (Marcel: "Kun je niet de plaat die onze lat is gebruiken om sdxl te voeden"): dezelfde zin, met de soldaten van
// zijn plaat (ontwerp/voorbeelden/heerstoet-doel.webp, de middelste soldaten, uitgeknipt: stijlplaat-soldaten.png) als stijl via de
// IP-Adapter, in twee sterktes; de stijl, niet de inhoud (zijn rood en geel moeten er niet in)
CONCEPTEN[3] = {
  ...CONCEPTEN[2],
  stijl: 'stijlplaat-soldaten.png',
  ipSterktes: [0.5, 0.8],
  zaden: [101, 105, 106, 107],
};
// ronde 4: in ronde 3 kwam zijn rood en geel mee (gele en rode wapenrokken, rode sjaals, ook op 0,5). Dus de stijlplaat
// omgekleurd: het verzadigde rood van zijn livrei wordt blauw, het goud blijft (blauw en goud: de kleuren van ons wapen);
// gezichten, laarzen en schachten blijven. En rood in de negatieve zin. Het wapen (de schoof) zetten we er later zelf op.
CONCEPTEN[4] = {
  ...CONCEPTEN[3],
  stijl: 'stijlplaat-soldaten-blauw.png',
  negatief: `${CONCEPTEN[3].negatief}, red clothes, red tabard, red scarf, red hood`,
  ipSterktes: [0.6, 0.8],
};
async function concept(naam = 'speerman', ronde = '1') {
  const V = require('../ai/vrij.cjs');
  const C = CONCEPTEN[ronde];
  const deel = ronde === '1' ? naam : `${naam}-${ronde}`;
  await V.vrijeRonde(render(POPPETJES[naam](STAND), 'ZW', C.fijn), {
    naam,
    map: path.join(UIT, 'concept', deel),
    plaat: path.join(UIT, `concept-${deel}.png`),
    titel: `Het poppetje eerst van de AI: ${naam}, ronde ${ronde}`,
    positief: C.positief,
    negatief: C.negatief,
    stijl: C.stijl && path.join(VOORBEELDEN, C.stijl),
    ipSterktes: C.ipSterktes,
    zaden: C.zaden,
    instellingen: C.instellingen,
  });
}

if (require.main === module) {
  const [opdracht, ...rest] = process.argv.slice(2);
  if (opdracht === 'kijk') kijk(...rest);
  else if (opdracht === 'proef') proef(...rest).catch((e) => { console.error(e); process.exit(1); });
  else if (opdracht === 'concept') concept(...rest).catch((e) => { console.error(e); process.exit(1); });
  else console.log('node gereedschap/pixelart/soldatenhd.cjs kijk | proef | concept');
}

module.exports = { POPPETJES, render, CEL, ANKER };
