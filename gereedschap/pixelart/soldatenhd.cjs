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
  speerman: (stand, extra = {}) => HR.soldaat(stand, { livrei: 'dorp', wapen: 'speer', schild: true, kraag: true, ...extra }),
};
// De gewrichten in een stand: die van het staan, met de benen zoals het model ze in deze stand bouwt (heer.cjs
// o.gewrichten); het bovenlijf deint maar een beetje, dat blijft staand.
function gewrichtenIn(naam, stand) {
  const g = {};
  POPPETJES[naam](stand, { gewrichten: g });
  const uit = GEWRICHTEN_SOLDAAT.map((p) => [...p]);
  if (g.benen) {
    [[1, 8], [0, 11]].forEach(([been, eerste]) => {
      const b = g.benen[been];
      uit[eerste] = b.heup; uit[eerste + 1] = b.knie; uit[eerste + 2] = b.enkel;
    });
  }
  return uit;
}

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
// ronde 5 (Marcel: "We hadden toch ook dat sdxl model met pixel art checkpoint?"; hij downloadde het, 20 okt): precies
// ronde 4 (zijn plaat als stijl op 0,6), alleen met het checkpoint 【SDXL】 Pixel Art Base (huisstijl.cjs CHECKPOINTS).
CONCEPTEN[5] = {
  ...CONCEPTEN[4],
  checkpoint: require('../ai/huisstijl.cjs').CHECKPOINTS.pixelartbase,
  ipSterktes: [0.6],
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
    checkpoint: C.checkpoint,
  });
  if (ronde === '5') vergelijkRondes(naam, '4', '5', 'FaeTastic', 'Pixel Art Base');
}
// Twee rondes naast elkaar (dezelfde zaden op stijl 0,6): groot (een derde) en op de HD-maat (2×, maal 2).
function vergelijkRondes(naam, a, b, naamA, naamB) {
  const A = require('../ai/beeld-ai.cjs');
  const E = require('../ai/etiket.cjs');
  const lees = (r, z) => A.leesPng(fs.readFileSync(path.join(UIT, 'concept', `${naam}-${r}`, `zaad-${z}-ip0.6.png`)));
  const zaden = CONCEPTEN[b].zaden;
  const groot = (r, n) => zaden.map((z) => E.met(H.verklein(lees(r, z), 3, 'naast'), `${n} · zaad ${z}`));
  const klein = (r, n) => zaden.map((z) => { const s = H.verklein(lees(r, z), 5, 'gem'); return E.met(H.snij(s, { x0: 0, y0: 0, b: s.b, h: s.h }, 2), `${n} · HD-maat, maal 2`); });
  E.bewaar(path.join(UIT, `concept-${naam}-${a}-${b}.png`), [groot(a, naamA), groot(b, naamB), klein(a, naamA), klein(b, naamB)], `${naamA} en ${naamB} naast elkaar`, `Dezelfde zin, jouw plaat als stijl (0,6), onze diepte, dezelfde zaden; alleen het checkpoint anders. Rij 1 en 2 een derde van het doek, rij 3 en 4 op de HD-maat (2×), maal 2.`);
  console.log(`uit/soldatenhd/concept-${naam}-${a}-${b}.png`);
}

// De pixelart-LoRA op de gekozen speerman (Marcel: "En misschien met de pixel art addon?"): zaad 106 met de instellingen
// van ronde 4, met PixelArtRedmond (huisstijl.cjs LORA) op twee sterktes. Op de kar gaf hij over onze render grove blokken;
// vrij kan het anders uitpakken.
async function pixelLora(naam = 'speerman') {
  const V = require('../ai/vrij.cjs');
  const E = require('../ai/etiket.cjs');
  const A = require('../ai/beeld-ai.cjs');
  const HU = require('../ai/huisstijl.cjs');
  const C = CONCEPTEN[4];
  const R = render(POPPETJES[naam](STAND), 'ZW', C.fijn);
  const basis = A.leesPng(fs.readFileSync(path.join(UIT, 'concept', 'speerman-4', 'zaad-106-ip0.6.png')));
  const rij = [{ beeld: basis, etiket: 'zonder LoRA (zaad 106)' }];
  for (const kracht of [0.5, 0.9]) {
    const [v] = await V.vrijeRonde(R, {
      naam: `${naam}-lora${kracht}`,
      map: path.join(UIT, 'concept', `${naam}-lora${kracht}`),
      positief: C.positief,
      negatief: C.negatief,
      stijl: path.join(VOORBEELDEN, C.stijl),
      ipSterktes: [0.6],
      zaden: [106],
      instellingen: C.instellingen,
      lora: { ...HU.LORA, kracht },
    });
    rij.push({ beeld: v.beeld, etiket: `PixelArtRedmond ${String(kracht).replace('.', ',')}` });
  }
  // groot (gehalveerd) en op de HD-maat (2×, maal 2)
  const groot = rij.map((v) => E.met(H.verklein(v.beeld, 2, 'naast'), v.etiket));
  const klein = rij.map((v) => { const s = H.verklein(v.beeld, 5, 'gem'); return E.met(H.snij(s, { x0: 0, y0: 0, b: s.b, h: s.h }, 2), 'HD-maat, maal 2'); });
  E.bewaar(path.join(UIT, `lora-${naam}.png`), [groot, klein], 'De pixelart-LoRA op de speerman', 'Zaad 106 met de instellingen van ronde 4 (jouw plaat als stijl op 0,6), zonder en met PixelArtRedmond. Rij 1 gehalveerd, rij 2 op de HD-maat maal 2.');
  console.log(`uit/soldatenhd/lora-${naam}.png`);
}

// ---------------------------------------------------------------- het skelet voor OpenPose

// De gewrichten van de soldaat (heer.cjs soldaat, staand; x naar zijn rechterhand, y naar voren, z omhoog), in de volgorde
// van OpenPose (18 punten). Verandert de bouw van de soldaat, dan deze ook.
const GEWRICHTEN_SOLDAAT = [
  [0, 11.2, 70.6], // 0 neus
  [0, 0.6, 61], // 1 nek (tussen de schouders)
  [13.4, 0.4, 60.6], [18.4, -1.6, 50.6], [17, 6.6, 43.8], // 2-4 rechterschouder, -elleboog, -pols (om de schacht)
  [-13.4, 0.4, 60.6], [-17.6, 1.6, 49.4], [-16.4, 10.4, 45.2], // 5-7 links (het schild)
  [5.4, 0.2, 36], [5.3, 1, 21], [5.2, 0.8, 6.2], // 8-10 rechterheup, -knie, -enkel
  [-5.4, 0.2, 36], [-5.3, 1, 21], [-5.2, 0.8, 6.2], // 11-13 links
  [2.8, 9.8, 73.1], [-2.8, 9.8, 73.1], // 14-15 rechteroog, linkeroog
  [7.3, 4, 72.2], [-7.3, 4, 72.2], // 16-17 rechteroor, linkeroor
];
// De kleuren en de ledematen van OpenPose (zoals controlnet_aux ze tekent), de punten vanaf 0.
const OP_KLEUR = [[255, 0, 0], [255, 85, 0], [255, 170, 0], [255, 255, 0], [170, 255, 0], [85, 255, 0], [0, 255, 0], [0, 255, 85], [0, 255, 170], [0, 255, 255], [0, 170, 255], [0, 85, 255], [0, 0, 255], [85, 0, 255], [170, 0, 255], [255, 0, 255], [255, 0, 170], [255, 0, 85]];
const OP_LEDEN = [[1, 2], [1, 5], [2, 3], [3, 4], [5, 6], [6, 7], [1, 8], [8, 9], [9, 10], [1, 11], [11, 12], [12, 13], [1, 0], [0, 14], [14, 16], [0, 15], [15, 17]];
// Het skelet in een richting, op de maat van render(..., kant, fijn): de punten zoals kern.cjs tekenModel ze neerzet. Wat
// van het hoofd van ons af kijkt (neus en ogen van achteren, het verre oor), laat OpenPose weg: zo weet SDXL of het de rug
// ziet.
function poseBeeld(kant, fijn, gewrichten = GEWRICHTEN_SOLDAAT) {
  const B = new K.Beeld(CEL[0] * fijn, CEL[1] * fijn, ANKER[0] * fijn, ANKER[1] * fijn);
  const hoek = (K.RICHTING[kant] * Math.PI) / 180;
  const fx = Math.cos(hoek), fy = Math.sin(hoek), rx = -fy, ry = fx;
  const wereld = ([x, y, z]) => [x * rx + y * fx, x * ry + y * fy, z];
  const scherm = (p) => {
    const [X, Y, Z] = wereld(p);
    return [B.OX + (X * K.EX[0] + Y * K.EX[1] + Z * K.EX[2]) * fijn, B.OY + (X * K.EY[0] + Y * K.EY[1] + Z * K.EY[2]) * fijn];
  };
  // naar de kijker: een richting in het model die tegen de kijkrichting in wijst (1 recht naar ons, -1 van ons af)
  const naarKijker = (lokaal) => {
    const [X, Y] = wereld([lokaal[0], lokaal[1], 0]);
    return -(X * K.V[0] + Y * K.V[1]) / Math.hypot(K.V[0], K.V[1]) / Math.hypot(lokaal[0], lokaal[1]);
  };
  const ziet = (i) => {
    if (i === 0) return naarKijker([0, 1]) > -0.2;
    if (i === 14 || i === 15) return naarKijker([i === 14 ? 0.5 : -0.5, 0.87]) > 0;
    if (i === 16 || i === 17) return naarKijker([i === 16 ? 1 : -1, -0.2]) > -0.3;
    return true;
  };
  const P = gewrichten.map(scherm);
  const uit = { b: B.b, h: B.h, rgba: Buffer.alloc(B.b * B.h * 4) };
  for (let i = 0; i < B.b * B.h; i++) uit.rgba[i * 4 + 3] = 255;
  const dik = 0.72 * fijn;
  const zet = (x, y, k, a) => {
    if (x < 0 || y < 0 || x >= B.b || y >= B.h) return;
    const o = (y * B.b + x) * 4;
    for (let c = 0; c < 3; c++) uit.rgba[o + c] = Math.round(uit.rgba[o + c] * (1 - a) + k[c] * a);
  };
  OP_LEDEN.forEach(([a, b], li) => {
    if (!ziet(a) || !ziet(b)) return;
    const [x0, y0] = P[a];
    const [x1, y1] = P[b];
    const lx = x1 - x0, ly = y1 - y0, l2 = lx * lx + ly * ly || 1;
    for (let y = Math.floor(Math.min(y0, y1) - dik); y <= Math.max(y0, y1) + dik; y++) {
      for (let x = Math.floor(Math.min(x0, x1) - dik); x <= Math.max(x0, x1) + dik; x++) {
        const t = Math.max(0, Math.min(1, ((x - x0) * lx + (y - y0) * ly) / l2));
        if (Math.hypot(x - x0 - t * lx, y - y0 - t * ly) <= dik) zet(x, y, OP_KLEUR[li], 0.6);
      }
    }
  });
  P.forEach(([px, py], i) => {
    if (!ziet(i)) return;
    for (let y = Math.floor(py - dik); y <= py + dik; y++) {
      for (let x = Math.floor(px - dik); x <= px + dik; x++) if (Math.hypot(x - px, y - py) <= dik) zet(x, y, OP_KLEUR[i], 1);
    }
  });
  return uit;
}

// De gekozen speerman in acht richtingen (Marcel koos zaad 106 op stijl 0,6 uit ronde 4): hij zelf als referentie via de
// IP-Adapter ('linear': ook de inhoud, zodat het dezelfde man blijft), en per richting de diepte van ons model, iets
// sterker dan in de vrije ronde, zodat het beeld op het model ligt (voor de projectie en de loopbeelden daarna); hetzelfde
// zaad. Eerst kijken of hij in elke richting dezelfde blijft.
// Ronde 2 (de eerste: van achteren tekende SDXL toch een gezicht, en twee keer een sokkel): per richting een eigen zin, voor
// de rug gezicht en baard in de negatieve zin, de sokkel ook, en de diepte iets sterker.
const RICHTINGEN = {
  basis: path.join('concept', 'speerman-4', 'zaad-106-ip0.6.png'),
  zaad: 106,
  ip: 0.7,
  instellingen: { ...VRIJ, diepte: 0.7, cnEind: 0.8 },
  ronde: 2,
  zin: {
    Z: 'front view, facing the viewer',
    ZW: 'three-quarter front view, facing down and to the left',
    W: 'side view, profile facing left',
    NW: 'three-quarter back view, seen from behind, facing up and to the left, back of the head and back of the tabard, no face visible',
    N: 'back view, seen from behind, facing away from the viewer, back of the head and back of the tabard, no face visible',
    NO: 'three-quarter back view, seen from behind, facing up and to the right, back of the head and back of the tabard, no face visible',
    O: 'side view, profile facing right',
    ZO: 'three-quarter front view, facing down and to the right',
  },
  rug: 'face, eyes, nose, beard, mouth, front view, facing the viewer',
  nooit: 'pedestal, base, platform, round base, floor tiles, stand',
};
// Ronde 3 (Marcel: "Controlnet toevoegen?" en "En misschien met de pixel art addon?"): erbij het skelet uit onze eigen
// gewrichten (OpenPose, 0,8) en de buitenlijn van ons silhouet (lijnen, 0,4); twee rijen, zonder en met de pixelart-LoRA
// (0,5, met pluim en veer in de negatieve zin: die zette hij op de helm).
RICHTINGEN.ronde = 3;
RICHTINGEN.instellingen = { ...RICHTINGEN.instellingen, pose: 0.8, poseEind: 0.8, lijn: 0.4 };
RICHTINGEN.varianten = [{ naam: 'zonder LoRA' }, { naam: 'pixelart 0,5', lora: 0.5, negatief: 'plume, feather, crest, pointed helmet' }];
// Ronde 4 (Marcel koos Pixel Art Base, 20 okt): hetzelfde, met Pixel Art Base, zaad 106 uit ronde 5 als referentie, en
// pluim en veer in de negatieve zin (die zette hij in ronde 5 op de helm); geen LoRA.
RICHTINGEN.ronde = 4;
RICHTINGEN.basis = path.join('concept', 'speerman-5', 'zaad-106-ip0.6.png');
RICHTINGEN.checkpoint = require('../ai/huisstijl.cjs').CHECKPOINTS.pixelartbase;
RICHTINGEN.varianten = [{ naam: 'Pixel Art Base', negatief: 'plume, feather, crest, pointed helmet, pennant, flag' }];
async function richtingen(naam = 'speerman') {
  const V = require('../ai/vrij.cjs');
  const E = require('../ai/etiket.cjs');
  const HU = require('../ai/huisstijl.cjs');
  const C = CONCEPTEN[4];
  const rijen = [];
  for (const vr of RICHTINGEN.varianten || [{ naam: '' }]) {
    const uit = [];
    for (const kant of K.KANTEN) {
      const [v] = await V.vrijeRonde(render(POPPETJES[naam](STAND), kant, C.fijn), {
        naam: `${naam}-${kant}`,
        map: path.join(UIT, 'richtingen', `${naam}-${RICHTINGEN.ronde}${vr.lora ? `-lora${vr.lora}` : ''}`, kant),
        positief: `${RICHTINGEN.zin[kant]}, ${C.positief}`,
        negatief: [C.negatief, RICHTINGEN.nooit, kant[0] === 'N' && RICHTINGEN.rug, vr.negatief].filter(Boolean).join(', '),
        stijl: path.join(UIT, RICHTINGEN.basis),
        ipSoort: 'linear',
        ipSterktes: [RICHTINGEN.ip],
        zaden: [RICHTINGEN.zaad],
        instellingen: RICHTINGEN.instellingen,
        pose: RICHTINGEN.instellingen.pose ? poseBeeld(kant, C.fijn) : null,
        omtrek: RICHTINGEN.instellingen.lijn > 0,
        lora: vr.lora ? { ...HU.LORA, kracht: vr.lora } : null,
        checkpoint: RICHTINGEN.checkpoint,
      });
      uit.push(E.met(H.verklein(v.beeld, 3, 'naast'), `${kant}${vr.naam ? ` · ${vr.naam}` : ''}`));
    }
    rijen.push(uit);
  }
  const A = require('../ai/beeld-ai.cjs');
  const basis = A.leesPng(fs.readFileSync(path.join(UIT, RICHTINGEN.basis)));
  E.bewaar(path.join(UIT, `richtingen-${naam}-${RICHTINGEN.ronde}.png`), [[E.met(H.verklein(basis, 3, 'naast'), `de basis: ${RICHTINGEN.basis}`)], ...rijen], `De ${naam} in acht richtingen`, `SDXL vrij, de basis (zaad 106, stijl 0,6) als referentie (IP-Adapter, linear, ${String(RICHTINGEN.ip).replace('.', ',')}), per richting de diepte van ons model (${String(RICHTINGEN.instellingen.diepte).replace('.', ',')}, tot ${Math.round(RICHTINGEN.instellingen.cnEind * 100)}%)${RICHTINGEN.instellingen.pose ? `, ons skelet (OpenPose ${String(RICHTINGEN.instellingen.pose).replace('.', ',')}) en onze buitenlijn (${String(RICHTINGEN.instellingen.lijn).replace('.', ',')})` : ''} en een eigen zin, zaad ${RICHTINGEN.zaad}. Een derde van het doek.`);
  console.log(`uit/soldatenhd/richtingen-${naam}-${RICHTINGEN.ronde}.png`);
}

// ---------------------------------------------------------------- van de acht beelden naar de sprites

// De acht richtingen van de AI (ronde 3, zonder LoRA) op het model (bakken.cjs projectie: per punt van het model de kleur
// van de eerste richting die het zag, in de volgorde van VOORKEUR), en daaruit de sprites van 2× met ons handschrift (H4):
// staand in acht richtingen en lopend. Daarnaast de beelden van de AI zelf, verkleind en op ons silhouet geknipt, om te
// vergelijken: zo zou het staan eruitzien zonder het model ertussen.
const VOORKEUR = ['Z', 'ZW', 'ZO', 'W', 'O', 'NW', 'NO', 'N'];
function aiBeeld(naam, kant, ronde = RICHTINGEN.ronde) {
  const A = require('../ai/beeld-ai.cjs');
  return A.leesPng(fs.readFileSync(path.join(UIT, 'richtingen', `${naam}-${ronde}`, kant, `zaad-${RICHTINGEN.zaad}-ip${RICHTINGEN.ip}.png`)));
}
// De achtergrond van een beeld van de AI: de middelste kleur van de vier hoeken; wat daar dichtbij ligt, telt niet.
function achtergrond(ai) {
  const hoeken = [[2, 2], [ai.b - 3, 2], [2, ai.h - 3], [ai.b - 3, ai.h - 3]].map(([x, y]) => [0, 1, 2].map((c) => ai.rgba[(y * ai.b + x) * 4 + c]));
  return [0, 1, 2].map((c) => hoeken.map((k) => k[c]).sort((p, q) => p - q)[1]);
}
function metAI(naam) {
  const BK = require('./bakken.cjs');
  const KH = require('./karhd.cjs');
  const V = require('../ai/vrij.cjs');
  const fijn = CONCEPTEN[4].fijn;
  const prs = VOORKEUR.map((kant) => {
    const BR = bakRender(naam, kant, fijn);
    const ai = aiBeeld(naam, kant);
    const { ox, oy } = V.doekVan(render(POPPETJES[naam](STAND), kant, fijn));
    const beeld = KH.opRender(BR.R, ai, ox, oy);
    const ag = achtergrond(ai);
    return BK.projectie(BR.R, beeld, {
      sleutel: (v) => BR.m.delen[Math.round(v)].deel,
      binnen: (X, Y) => beeld.rgba[(Y * beeld.b + X) * 4 + 3] >= 128,
      soort: (k) => Math.hypot(k[0] - ag[0], k[1] - ag[1], k[2] - ag[2]) > 28,
    });
  });
  const spiegelX = (p) => [-p[0], p[1], p[2]];
  return (m) => ({ ...m, mat: m.mat.map((x) => x && BK.projectieMateriaal(x, prs, { kopieen: [spiegelX], sleutelVan: (d) => d.deel, zacht: KH.ZACHT })) });
}
// Het beeld van de AI zelf als sprite: op ons silhouet geknipt (de render op dezelfde maat) en verkleind tot 2×.
function aiSprite(naam, kant) {
  const fijn = CONCEPTEN[4].fijn;
  return geknipt(aiBeeld(naam, kant), render(POPPETJES[naam](STAND), kant, fijn), fijn);
}
// Een beeld van de AI (op het doek van vrij.cjs doekVan om render R) op het silhouet van R, verkleind tot 2× en omlijnd.
function geknipt(ai, R, fijn) {
  const V = require('../ai/vrij.cjs');
  const { ox, oy } = V.doekVan(R);
  const op = { b: R.b, h: R.h, rgba: Buffer.alloc(R.b * R.h * 4) };
  for (let Y = 0; Y < R.h; Y++) for (let X = 0; X < R.b; X++) {
    if (R.ramp[Y * R.b + X] < 0) continue;
    const x = X - ox, y = Y - oy;
    if (x < 0 || y < 0 || x >= ai.b || y >= ai.h) continue;
    const j = (y * ai.b + x) * 4;
    op.rgba.set([ai.rgba[j], ai.rgba[j + 1], ai.rgba[j + 2], 255], (Y * R.b + X) * 4);
  }
  return H.omlijnBeeld(H.verklein(op, fijn / 2, 'gem'));
}
async function sprites(naam = 'speerman') {
  const E = require('../ai/etiket.cjs');
  const t0 = Date.now();
  const kleur = metAI(naam);
  console.log(`projectie in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  const maak = POPPETJES[naam];
  const staan = K.KANTEN.map((kant) => sprite(kleur(maak(STAND)), kant));
  const lopen = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => sprite(kleur(maak({ houding: 'lopen', fase: i / 8 })), 'ZW'));
  const direct = K.KANTEN.map((kant) => aiSprite(naam, kant));
  console.log(`sprites in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  const map = path.join(UIT, 'sprites', naam);
  fs.mkdirSync(map, { recursive: true });
  K.KANTEN.forEach((kant, i) => { H.bewaar(path.join(map, `staan-${kant}.png`), staan[i]); H.bewaar(path.join(map, `ai-${kant}.png`), direct[i]); });
  lopen.forEach((r, i) => H.bewaar(path.join(map, `lopen-ZW-${i}.png`), r));
  const groot = (r) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, 2);
  const rij = (beelden, etiket) => {
    const u = H.uitsnede(beelden, 3);
    return beelden.map((r, i) => E.met(groot(H.alfaSnijMetGrond(H.alfaSnij(r, u))), etiket(i)));
  };
  const nu = [celVanNu('boer-u7', 'staan', 'ZW'), celVanNu('soldaat', 'staan', 'ZW')].map((r) => H.snij(H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 3))), { x0: 0, y0: 0, b: r.b + 6, h: r.h + 6 }, 4));
  E.bewaar(path.join(UIT, `sprites-${naam}.png`), [
    rij(direct, (i) => (i ? K.KANTEN[i] : `de AI direct · ${K.KANTEN[i]}`)),
    rij(staan, (i) => (i ? K.KANTEN[i] : `via het model · ${K.KANTEN[i]}`)),
    rij(lopen, (i) => (i ? `${i}` : 'lopen via het model · 0')),
    [E.met(nu[0], 'nu: een dorpeling (1×, maal 4)'), E.met(nu[1], 'nu: de soldaat van de heer (1×, maal 4)')],
  ], `De ${naam}: de sprites`, 'Op de HD-maat (2×), maal 2. Rij 1: de acht beelden van de AI zelf, op ons silhouet geknipt en verkleind. Rij 2 en 3: die acht beelden op het model gezet, en zo door onze renderer getekend met ons handschrift (H4): staand en lopend. Rij 4: de speerman en de soldaat van nu.');
  console.log(`uit/soldatenhd/sprites-${naam}.png`);
}

// De schilderbeurt over het model (Marcel koos: "Schilderbeurt over het model", 20 okt): het beeld via het model (de acht
// richtingen van de AI erop, metAI) is het begin, op 10×; SDXL schildert er licht overheen binnen ons silhouet (denoise
// BEURT.denoise), met het beeld van de AI van die richting als referentie, onze diepte en buitenlijn, en hetzelfde zaad.
// Elk loopbeeld heeft zo een vast begin, en krijgt toch het schilderwerk van de AI. De proef: lopen naar zuidwest en de rug.
const BEURT = { denoise: 0.4, ip: 0.6, instellingen: { ...VRIJ, denoise: 0.4, diepte: 0.6, cnEind: 0.8, lijn: 0.4 } };
// Marcel: "Ernie ook nog een keer proberen?": ERNIE als schilder van de beurt (hij heeft geen ControlNet, maar het begin
// houdt de vorm vast), op twee beelden (de rug en lopen 0), denoise 0,5; zo'n 12 minuten per beeld.
const BEURT_ERNIE = { denoise: 0.5, welke: [0, 1] };
// Lopen van de AI zelf (na de schilderbeurt over het model: het begin was te fel en de benen bleven vlekken): per loopbeeld
// het staande beeld van de AI van die richting als begin, de benen in die stap via OpenPose (gewrichtenIn) en onze diepte,
// en SDXL (Pixel Art Base) schildert binnen het silhouet van die stap, met hetzelfde beeld als referentie; twee denoises.
const LOPEN = { kant: 'ZW', denoises: [0.5, 0.7], ip: 0.6 };
async function lopenAI(naam = 'speerman') {
  const V = require('../ai/vrij.cjs');
  const E = require('../ai/etiket.cjs');
  const C = CONCEPTEN[4];
  const fijn = C.fijn;
  const kant = LOPEN.kant;
  const staandPad = path.join(UIT, 'richtingen', `${naam}-${RICHTINGEN.ronde}`, kant, `zaad-${RICHTINGEN.zaad}-ip${RICHTINGEN.ip}.png`);
  const A = require('../ai/beeld-ai.cjs');
  const staand = A.leesPng(fs.readFileSync(staandPad));
  const Rs = render(POPPETJES[naam](STAND), kant, fijn);
  const ds = V.doekVan(Rs);
  // het staande beeld op de maat van de render (de voeten staan in elke stand op hetzelfde anker)
  const begin = { b: Rs.b, h: Rs.h, rgba: Buffer.alloc(Rs.b * Rs.h * 4) };
  for (let y = 0; y < staand.h; y++) for (let x = 0; x < staand.b; x++) {
    const X = x + ds.ox, Y = y + ds.oy;
    if (X < 0 || Y < 0 || X >= Rs.b || Y >= Rs.h) continue;
    staand.rgba.copy(begin.rgba, (Y * Rs.b + X) * 4, (y * staand.b + x) * 4, (y * staand.b + x) * 4 + 4);
  }
  const rijen = [];
  for (const dn of LOPEN.denoises) {
    const rij = [];
    for (let i = 0; i < 8; i++) {
      const stand = { houding: 'lopen', fase: i / 8 };
      const R = render(POPPETJES[naam](stand), kant, fijn);
      const [v] = await V.vrijeRonde(R, {
        naam: `${naam}-lopen-${i}`,
        map: path.join(UIT, 'lopen', `${naam}-${kant}-${dn}`, String(i)),
        positief: `${RICHTINGEN.zin[kant]}, walking, ${C.positief}`,
        negatief: [C.negatief, RICHTINGEN.nooit, RICHTINGEN.varianten[0].negatief].filter(Boolean).join(', '),
        stijl: staandPad,
        ipSoort: 'linear',
        ipSterktes: [LOPEN.ip],
        zaden: [RICHTINGEN.zaad],
        instellingen: { ...RICHTINGEN.instellingen, denoise: dn },
        pose: poseBeeld(kant, fijn, gewrichtenIn(naam, stand)),
        omtrek: true,
        init: begin,
        masker: 'silhouet',
        checkpoint: RICHTINGEN.checkpoint,
      });
      rij.push(geknipt(v.beeld, R, fijn));
    }
    rijen.push(rij);
  }
  const groot = (r) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, 2);
  const u = H.uitsnede(rijen.flat(), 3);
  E.bewaar(path.join(UIT, `lopen-${naam}.png`), rijen.map((rij, k) => rij.map((r, i) => E.met(groot(H.alfaSnijMetGrond(H.alfaSnij(r, u))), i ? `${i}` : `denoise ${String(LOPEN.denoises[k]).replace('.', ',')} · 0`))),
    `De ${naam} loopt (${kant}), van de AI`, 'Pixel Art Base. Per loopbeeld het staande beeld van de AI als begin, de benen in die stap via OpenPose uit onze gewrichten, onze diepte en buitenlijn; het staande beeld als referentie. Op de HD-maat (2×), maal 2.');
  // en als bewegend beeld, om het flikkeren te zien
  const { apng } = require('./apng.cjs');
  rijen.forEach((rij, k) => {
    const platen = rij.map((r) => { const vak = H.alfaSnij(r, u); return { b: vak.b, h: vak.h, rgba: () => vak.rgba }; });
    fs.writeFileSync(path.join(UIT, `lopen-${naam}-${LOPEN.denoises[k]}.png`), apng(platen, { schaal: 2, fps: 10 }));
  });
  console.log(`uit/soldatenhd/lopen-${naam}.png`);
}

// Alleen de benen (Marcel koos het, 21 okt; na lopen van de AI flikkerde het bovenlijf in de details): de soldaat loopt met
// zijn bovenlijf stil (het schild en de speer gaan met de romp mee), dus is elk loopbeeld het staande beeld van de AI, en
// schildert SDXL alleen waar de benen zijn (de hozen en laarzen van ons model, staand en in die stap, met een rand), op een
// hoge denoise, met de benen van ons model in die stap als begin en het skelet van die stap. Daarna in pixels: buiten de
// benen precies het staande beeld (daar flikkert niets), binnen de benen het nieuwe.
const BENEN = { denoise: 0.85, rand: 8, delen: [HR.SOLDAAT_D.benen, HR.SOLDAAT_D.laars] };
function benenVan(R, model) {
  const uit = new Uint8Array(R.b * R.h);
  for (let i = 0; i < R.b * R.h; i++) {
    if (R.ramp[i] < 0 || Number.isNaN(R.rust[i * 4])) continue;
    const d = model.delen[Math.round(R.rust[i * 4 + 3])];
    if (d && BENEN.delen.includes(d.deel)) uit[i] = 1;
  }
  return uit;
}
function ruimer(m, b, h, r) {
  const uit = new Uint8Array(b * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    if (!m[y * b + x]) continue;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < b && Y < h && dx * dx + dy * dy <= r * r) uit[Y * b + X] = 1;
    }
  }
  return uit;
}
async function lopenBenen(naam = 'speerman') {
  const V = require('../ai/vrij.cjs');
  const E = require('../ai/etiket.cjs');
  const A = require('../ai/beeld-ai.cjs');
  const C = CONCEPTEN[4];
  const fijn = C.fijn;
  const kant = LOPEN.kant;
  const staandPad = path.join(UIT, 'richtingen', `${naam}-${RICHTINGEN.ronde}`, kant, `zaad-${RICHTINGEN.zaad}-ip${RICHTINGEN.ip}.png`);
  const staand = A.leesPng(fs.readFileSync(staandPad));
  const ms = POPPETJES[naam](STAND);
  const Rs = render(ms, kant, fijn);
  const ds = V.doekVan(Rs);
  const N = Rs.b * Rs.h;
  // het staande beeld op de maat van de render (de voeten staan in elke stand op hetzelfde anker)
  const begin = { b: Rs.b, h: Rs.h, rgba: Buffer.alloc(N * 4) };
  for (let y = 0; y < staand.h; y++) for (let x = 0; x < staand.b; x++) {
    const X = x + ds.ox, Y = y + ds.oy;
    if (X < 0 || Y < 0 || X >= Rs.b || Y >= Rs.h) continue;
    staand.rgba.copy(begin.rgba, (Y * Rs.b + X) * 4, (y * staand.b + x) * 4, (y * staand.b + x) * 4 + 4);
  }
  const benenStaand = benenVan(Rs, ms);
  const beelden = [];
  for (let i = 0; i < 8; i++) {
    const stand = { houding: 'lopen', fase: i / 8 };
    const m = POPPETJES[naam](stand);
    const R = render(m, kant, fijn);
    const benen = benenVan(R, m);
    const zone = ruimer(benen.map((v, k) => v || benenStaand[k]), R.b, R.h, BENEN.rand);
    // het begin: het staande beeld, en in de zone de benen van ons model in deze stap (elders in de zone grijs)
    const init = { b: R.b, h: R.h, rgba: Buffer.from(begin.rgba) };
    const masker = { b: R.b, h: R.h, rgba: Buffer.alloc(N * 4) };
    for (let k = 0; k < N; k++) {
      if (!zone[k]) continue;
      masker.rgba.set([255, 255, 255, 255], k * 4);
      if (benen[k]) R.zl.rgba.copy(init.rgba, k * 4, k * 4, k * 4 + 4);
      else if (!(R.ramp[k] >= 0)) init.rgba.set([170, 170, 170, 255], k * 4);
      init.rgba[k * 4 + 3] = 255;
    }
    const [v] = await V.vrijeRonde(R, {
      naam: `${naam}-benen-${i}`,
      map: path.join(UIT, 'lopen', `${naam}-${kant}-benen`, String(i)),
      positief: `${RICHTINGEN.zin[kant]}, walking, brown leather boots, dark blue hose, ${C.positief}`,
      negatief: [C.negatief, RICHTINGEN.nooit, RICHTINGEN.varianten[0].negatief].filter(Boolean).join(', '),
      stijl: staandPad,
      ipSoort: 'linear',
      ipSterktes: [LOPEN.ip],
      zaden: [RICHTINGEN.zaad],
      instellingen: { ...RICHTINGEN.instellingen, denoise: BENEN.denoise },
      pose: poseBeeld(kant, fijn, gewrichtenIn(naam, stand)),
      omtrek: true,
      init,
      initOveral: true,
      masker,
      checkpoint: RICHTINGEN.checkpoint,
    });
    // in pixels: buiten de zone het staande beeld met het staande silhouet, binnen de zone het nieuwe met dat van deze stap
    const { ox, oy } = V.doekVan(R);
    const uit = { b: R.b, h: R.h, rgba: Buffer.alloc(N * 4) };
    for (let Y = 0; Y < R.h; Y++) for (let X = 0; X < R.b; X++) {
      const k = Y * R.b + X;
      if (zone[k]) {
        if (!(R.ramp[k] >= 0)) continue;
        const x = X - ox, y = Y - oy;
        if (x < 0 || y < 0 || x >= v.beeld.b || y >= v.beeld.h) continue;
        const j = (y * v.beeld.b + x) * 4;
        uit.rgba.set([v.beeld.rgba[j], v.beeld.rgba[j + 1], v.beeld.rgba[j + 2], 255], k * 4);
      } else if (Rs.ramp[k] >= 0) {
        uit.rgba.set([begin.rgba[k * 4], begin.rgba[k * 4 + 1], begin.rgba[k * 4 + 2], 255], k * 4);
      }
    }
    beelden.push(H.omlijnBeeld(H.verklein(uit, fijn / 2, 'gem')));
  }
  const groot = (r) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, 2);
  const u = H.uitsnede(beelden, 3);
  E.bewaar(path.join(UIT, `lopen-${naam}-benen.png`), [beelden.map((r, i) => E.met(groot(H.alfaSnijMetGrond(H.alfaSnij(r, u))), i ? `${i}` : 'alleen de benen · 0'))],
    `De ${naam} loopt (${kant}): alleen de benen`, `Pixel Art Base. Elk beeld is het staande beeld van de AI; alleen waar de benen zijn (ons model, staand en in die stap) schildert SDXL opnieuw (denoise ${String(BENEN.denoise).replace('.', ',')}), met de benen van ons model als begin en het skelet van die stap. Op de HD-maat (2×), maal 2.`);
  const { apng } = require('./apng.cjs');
  const platen = beelden.map((r) => { const vak = H.alfaSnij(r, u); return { b: vak.b, h: vak.h, rgba: () => vak.rgba }; });
  fs.writeFileSync(path.join(UIT, `lopen-${naam}-benen-bewegend.png`), apng(platen, { schaal: 2, fps: 10 }));
  console.log(`uit/soldatenhd/lopen-${naam}-benen.png`);
}

async function schilderbeurt(naam = 'speerman', schilder = 'sdxl') {
  const ernie = schilder === 'ernie';
  const V = require('../ai/vrij.cjs');
  const E = require('../ai/etiket.cjs');
  const C = CONCEPTEN[4];
  const fijn = C.fijn;
  const t0 = Date.now();
  const kleur = metAI(naam);
  console.log(`projectie in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  const maak = POPPETJES[naam];
  const lijst = [
    { stand: STAND, kant: 'N', etiket: 'N, staan' },
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ stand: { houding: 'lopen', fase: i / 8 }, kant: 'ZW', etiket: `lopen ${i}` })),
  ];
  const voor = [];
  const na = [];
  const sdxl = [];
  for (const [n, it] of lijst.entries()) {
    if (ernie && !BEURT_ERNIE.welke.includes(n)) continue;
    const R = render(kleur(maak(it.stand)), it.kant, fijn);
    const [v] = await V.vrijeRonde(R, {
      naam: `${naam}-beurt-${n}`,
      map: path.join(UIT, 'beurt', ernie ? `${naam}-ernie` : naam, `${n}-${it.kant}`),
      positief: `${RICHTINGEN.zin[it.kant]}, ${C.positief}`,
      negatief: [C.negatief, RICHTINGEN.nooit, it.kant[0] === 'N' && RICHTINGEN.rug, RICHTINGEN.varianten[0].negatief].filter(Boolean).join(', '),
      stijl: path.join(UIT, 'richtingen', `${naam}-${RICHTINGEN.ronde}`, it.kant, `zaad-${RICHTINGEN.zaad}-ip${RICHTINGEN.ip}.png`),
      ipSoort: 'linear',
      ipSterktes: [BEURT.ip],
      zaden: [RICHTINGEN.zaad],
      instellingen: ernie ? { ...BEURT.instellingen, denoise: BEURT_ERNIE.denoise } : BEURT.instellingen,
      omtrek: true,
      init: R.zl,
      masker: 'silhouet',
      checkpoint: RICHTINGEN.checkpoint,
      schilder: ernie ? 'ernie' : null,
    });
    if (ernie) {
      const A = require('../ai/beeld-ai.cjs');
      sdxl.push(geknipt(A.leesPng(fs.readFileSync(path.join(UIT, 'beurt', naam, `${n}-${it.kant}`, `zaad-${RICHTINGEN.zaad}-ip${BEURT.ip}.png`))), R, fijn));
    }
    const zonder = { b: R.b, h: R.h, rgba: Buffer.from(R.zl.rgba) };
    for (let i = 0; i < R.b * R.h; i++) if (R.ramp[i] < 0) zonder.rgba[i * 4 + 3] = 0;
    voor.push(H.omlijnBeeld(H.verklein(zonder, fijn / 2, 'gem')));
    na.push(geknipt(v.beeld, R, fijn));
  }
  console.log(`klaar in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (ernie) {
    const E2 = require('../ai/etiket.cjs');
    const groot2 = (r) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, 2);
    const items = BEURT_ERNIE.welke.map((n) => lijst[n].etiket);
    const rij2 = (beelden, wie) => {
      const u = H.uitsnede([...voor, ...sdxl, ...na], 3);
      return beelden.map((r, i) => E2.met(groot2(H.alfaSnijMetGrond(H.alfaSnij(r, u))), `${wie} · ${items[i]}`));
    };
    E2.bewaar(path.join(UIT, `beurt-${naam}-ernie.png`), [[...rij2(voor, 'via het model'), ...rij2(sdxl, 'SDXL 0,4'), ...rij2(na, `ERNIE ${String(BEURT_ERNIE.denoise).replace('.', ',')}`)]], `De ${naam}: de schilderbeurt met ERNIE`, 'Het begin (via het model), de beurt met SDXL (Pixel Art Base, denoise 0,4, de richting als referentie) en de beurt met ERNIE-Image-Turbo (denoise 0,5, zonder ControlNet en referentie). Op de HD-maat (2×), maal 2.');
    console.log(`uit/soldatenhd/beurt-${naam}-ernie.png`);
    return;
  }
  const map = path.join(UIT, 'sprites', `${naam}-beurt`);
  fs.mkdirSync(map, { recursive: true });
  na.forEach((r, i) => H.bewaar(path.join(map, `${i}.png`), r));
  const groot = (r) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, 2);
  const rij = (beelden, etiket) => {
    const u = H.uitsnede(beelden, 3);
    return beelden.map((r, i) => E.met(groot(H.alfaSnijMetGrond(H.alfaSnij(r, u))), etiket(i)));
  };
  E.bewaar(path.join(UIT, `beurt-${naam}.png`), [
    rij(voor, (i) => `via het model · ${lijst[i].etiket}`),
    rij(na, (i) => `met de beurt · ${lijst[i].etiket}`),
  ], `De ${naam}: de schilderbeurt over het model`, `Pixel Art Base. Rij 1: het beeld via het model (de acht richtingen van de AI erop), het begin. Rij 2: SDXL schildert er licht overheen (denoise ${String(BEURT.denoise).replace('.', ',')}), met het beeld van die richting als referentie. Op de HD-maat (2×), maal 2.`);
  console.log(`uit/soldatenhd/beurt-${naam}.png`);
}

if (require.main === module) {
  const [opdracht, ...rest] = process.argv.slice(2);
  if (opdracht === 'kijk') kijk(...rest);
  else if (opdracht === 'proef') proef(...rest).catch((e) => { console.error(e); process.exit(1); });
  else if (opdracht === 'concept') concept(...rest).catch((e) => { console.error(e); process.exit(1); });
  else if (opdracht === 'benen') lopenBenen(...rest).catch((e) => { console.error(e); process.exit(1); });
  else if (opdracht === 'lopen') lopenAI(...rest).catch((e) => { console.error(e); process.exit(1); });
  else if (opdracht === 'beurt') schilderbeurt(...rest).catch((e) => { console.error(e); process.exit(1); });
  else if (opdracht === 'sprites') sprites(...rest).catch((e) => { console.error(e); process.exit(1); });
  else if (opdracht === 'lora') pixelLora(...rest).catch((e) => { console.error(e); process.exit(1); });
  else if (opdracht === 'richtingen') richtingen(...rest).catch((e) => { console.error(e); process.exit(1); });
  else console.log('node gereedschap/pixelart/soldatenhd.cjs kijk | proef | concept');
}

module.exports = { POPPETJES, render, poseBeeld, gewrichtenIn, CEL, ANKER };
