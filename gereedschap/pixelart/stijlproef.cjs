'use strict';
// De stijlproef (17 okt 2026, werklijst vraag 177; ontwerp/beeld.md, "De nieuwe stijl: de nabewerkte herberg als maat"):
// de huizen naar de nabewerkte herberg (ontwerp/voorbeelden/herberg-stijl-doel.webp), zonder één huis opnieuw te
// tekenen en zonder een filter over het plaatje. Geïsoleerd: dit bestand verandert geen bestand van de bouwer en geen
// tekening van het spel. Het laadt toren.cjs en huis-sdf.cjs met een paar haken erbij, alleen in het geheugen (HAKEN
// hieronder; dat zijn precies de regels die er later in komen), en zet de nieuwe stijl aan met de knop `stijl`.
//
// Drie lagen, elk op de gegevens die de tekenaar per pixel al heeft (materiaal, plek in de wereld, normaal, zon, diepte):
//   1. het materiaal: nieuwe patronen voor riet, nok, pleister, hout, veldsteen en glas, in de maten van de wereld,
//      zodat een huis van alle vier de kanten dezelfde textuur heeft;
//   2. het licht: een zachte schaduw van de zon uit de afstandsvelden van het huis (de rand van een schaduw verloopt),
//      een lichtere diepste hoek, en een zachtere baan onder de dakrand;
//   3. de kleur: elke ramp met tussentinten in OKLab (STIJL_INSTELLINGEN.fijn), zodat licht verloopt in plaats van in
//      banden te springen, en een tint per steen, balk en plek, zodat een materiaal niet uit één ramp lijkt te komen.
//
//   node gereedschap/pixelart/stijlproef.cjs                 de plaat: zes gebouwen voor en na, twee van vier kanten
//   node gereedschap/pixelart/stijlproef.cjs uitsnede [naam] een stuk van een huis, voor en na, vergroot (snel kijken)
//   node gereedschap/pixelart/stijlproef.cjs huis <naam> ... losse huizen, voor en na
//   node gereedschap/pixelart/stijlproef.cjs materialen [naam] een plaat per materiaal zonder doel (leien, pannen, ...)
// Alles naar gereedschap/pixelart/uit/stijlproef/ (niet in git).
const fs = require('fs');
const path = require('path');
const Module = require('module');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// ---------------------------------------------------------------- de instellingen

const STIJL_INSTELLINGEN = {
  // het licht
  zachtK: 6, // hoe zacht de rand van een slagschaduw (de grond om een huis gebruikt 9; kleiner is zachter)
  vloer: 0.42, // het licht in de diepste hoek (met de diepte van vraag 144: 0,3)
  randHard: 0.3, // de baan onder de dakrand: zoveel van zijn harde deel blijft
  randZacht: 1.6, // en zoveel langer verloopt hij
  // de kleur
  fijn: 3, // tussentinten per stap van een ramp
  tint: { a: 0.006, b: 0.018 }, // een tint van 1 schuift zoveel in OKLab (a: naar rood, b: naar geel)
  // het riet: bossen van een paar pixels breed in plaats van halmen van één, lagen met een duidelijke zoom
  riet: { laag: 0.62, trede: 0.55, golf: 0.35, bos: 2.6, lang: 11, toon: 1.3, naad: 0.6, tandB: 5.6, punt: 6.2, schaduw: 2.8, top: -2.1, tand: 1.7, spleet: -1.7, basis: 0.65, verloop: 1.3, tint: 0.5 },
  // het pleister: zacht en warm gevlekt, in de maten van de wereld
  pleister: { grof: 0.6, fijn: 0.3, tint: 0.9 },
  // de veldsteen: een donkere voeg, bolle stenen, elk zijn eigen tint
  steen: { maat: 0.7, voeg: -2.4, onder: -3.1, bol: 1.4, tint: 0.8 },
  // het hout: wat lichter en warmer dan het donkere houtwerk van vraag 144
  hout: { plus: 0.55, tint: 0.5 },
  // leien: elke lei een eigen toon en een koele tint (blauw tot paarsgrijs), licht aan de onderrand, donkerder naar boven
  lei: { basis: -0.55, toon: 0.24, verloop: 0.9, tint: -0.35, tintB: 0.9, rand: 0.8, lijn: -2.1, naad: -1.6 },
  // spanen: elke spaan een eigen toon en tint (vers warm, verweerd grijs), een nerf langs de helling
  spaan: { basis: 0, toon: 0.13, verloop: 0.7, tint: -0.1, tintB: 0.9, nerf: 0.75, rand: 0.6, lijn: -2.2, naad: -2 },
  // ronde pannen: elke pan een eigen tint, roder of zoals hij was (nooit geler: dan wordt terracotta bleek)
  pan: { tint: 0, tintB: 0.5 },
  // planken: elke plank een eigen toon en tint, een rustige nerf in de lengte, een donkere kier
  plank: { toon: 0.18, tintB: 1.2, nerf: 0.6, kier: -2.3 },
  // baksteen: elke steen een eigen tint (rood tot oranje) en toon, vlak, met een schuine rand; de voeg van kalk
  baksteen: { toon: 0.35, tintB: 1.2, klinker: -1.1, voeg: 1.4, voegOnder: -0.6 },
  // leem: zacht gevlekt in twee maten, warm of grauwer, met vegen van de hand
  leem: { grof: 0.7, fijn: 0.25, veeg: 0.3, tint: 0.9 },
  // het glas: blauw met de lucht erin, niet zwart
  glas: { plus: 1.9, lucht: 1.2 },
};
const S = STIJL_INSTELLINGEN;

// Het palet van de doelherberg, gemeten op ontwerp/voorbeelden/herberg-stijl-doel.webp (de riet- en kalkkleuren
// liggen dicht bij de onze; het verschil zit in de rust van de textuur en het licht). Elke ramp evenveel tinten als de
// ramp die hij vervangt, zodat een stap hetzelfde blijft betekenen.
const PALET = {
  rietRos: ['#2a1a0c', '#46301a', '#664626', '#845c2e', '#a06e38', '#b88446', '#cc9c5c'],
  riet: ['#241a10', '#3c2c18', '#5a4224', '#785a30', '#94723e', '#ad8a52', '#c4a46a'],
};

// ---------------------------------------------------------------- de haken

// Een bestand van de bouwer laden met regels erbij: elke vervanging moet er precies één keer passen, anders stopt het
// (dan is de bouwer veranderd en moet de haak mee). Het komt in require.cache onder zijn eigen naam, zodat wie het daarna
// vraagt (huizen.cjs, huis-sdf.cjs) de versie met haken krijgt.
function laadMetHaken(naam, vervangingen) {
  const bestand = path.join(__dirname, naam);
  let bron = fs.readFileSync(bestand, 'utf8');
  for (const [oud, nieuw] of vervangingen) {
    const n = bron.split(oud).length - 1;
    if (n !== 1) throw new Error(`haak in ${naam}: "${oud.slice(0, 60)}" staat er ${n} keer`);
    bron = bron.replace(oud, () => nieuw);
  }
  const m = new Module(bestand, module);
  m.filename = bestand;
  m.paths = Module._nodeModulePaths(__dirname);
  require.cache[bestand] = m;
  m._compile(bron, bestand);
  m.loaded = true;
  return m.exports;
}

const HAKEN = {
  'toren.cjs': [
    // het licht: een zachte schaduw in plaats van zon of geen zon
    [
      'if (licht > 0 && mat.schaduw !== false && inSchaduw(x + nx * 0.6, y + ny * 0.6, z + nz * 0.6)) {',
      'if (W.stijl && licht > 0 && mat.schaduw !== false) {\n' +
        '          const zv = zacht(x + nx * 0.6, y + ny * 0.6, z + nz * 0.6, W.stijl.S.zachtK);\n' +
        '          const sk = mat.schaduwKracht ?? 0.35;\n' +
        '          licht *= sk + (1 - sk) * zv;\n' +
        '          zon *= zv;\n' +
        '        } else if (licht > 0 && mat.schaduw !== false && inSchaduw(x + nx * 0.6, y + ny * 0.6, z + nz * 0.6)) {',
    ],
    ['const vloer = W.diepte ? W.diepte.vloer : 0.45;', 'const vloer = W.stijl ? W.stijl.S.vloer : W.diepte ? W.diepte.vloer : 0.45;'],
    // een patroon zonder H (het hout, het glas) vindt de stijl in C
    ['const C = { dxv: [0, 0, 0], dyv: [0, 0, 0] };', 'const C = { dxv: [0, 0, 0], dyv: [0, 0, 0], stijl: W.stijl || null };'],
  ],
  'huis-sdf.cjs': [
    [
      'H.laagL = (sp ? 30 : 20) * (H.kn.ruig ? 1.85 : H.kn.grof ? 1.5 : 1);',
      'H.laagL = (sp ? 30 : 20) * (H.kn.ruig ? 1.85 : H.kn.grof ? 1.5 : 1) * (H.kn.stijl ? H.kn.stijl.S.riet.laag : 1);',
    ],
    [
      'H.laagH = pak ? (H.kn.ruig ? 4.2 : H.kn.grof ? 3.4 : 1.6) : 0;',
      'H.laagH = (pak ? (H.kn.ruig ? 4.2 : H.kn.grof ? 3.4 : 1.6) : 0) * (H.kn.stijl ? H.kn.stijl.S.riet.trede : 1);',
    ],
    [
      'V.laagGolf = (a) => sch * (1.6 * Math.sin(a * 0.043 + lgF1) + 0.9 * Math.sin(a * 0.12 + lgF2));',
      'V.laagGolf = (a) => sch * (H.kn.stijl ? H.kn.stijl.S.riet.golf : 1) * (1.6 * Math.sin(a * 0.043 + lgF1) + 0.9 * Math.sin(a * 0.12 + lgF2));',
    ],
    ['function ruigRiet(H, P, V) {', 'function ruigRiet(H, P, V) {\n  if (H.kn.stijl) return H.kn.stijl.riet(H, P, V);'],
    ['    // ruig: dunne stengels dwars over de worst', '    if (H.kn.stijl) return H.kn.stijl.nok(H, C, V, a);\n    // ruig: dunne stengels dwars over de worst'],
    ['function pleisterPatroon(H, C) {', 'function pleisterPatroon(H, C) {\n  if (H.kn.stijl) return H.kn.stijl.pleister(H, C);'],
    ['function balkPatroon(C, oud = false) {', 'function balkPatroon(C, oud = false) {\n  if (C.stijl && C.deel.lok) return C.stijl.balk(C, oud);'],
    ['function veldkeiPatroon(H, C, U, Hp, zaad) {', 'function veldkeiPatroon(H, C, U, Hp, zaad) {\n  if (H.kn.stijl) return H.kn.stijl.veldkei(H, C, U, Hp, zaad);'],
    [
      'const baan = (afstand, hard, zacht) => (afstand < hard ? 1 : klem(1 - (afstand - hard) / zacht, 0, 1));',
      'const baan = H.kn.stijl ? H.kn.stijl.baan : (afstand, hard, zacht) => (afstand < hard ? 1 : klem(1 - (afstand - hard) / zacht, 0, 1));',
    ],
    ['function schubPatroon(H, C, P, V, fase, dirA, D = H.D, dak = H.dak) {', 'function schubPatroon(H, C, P, V, fase, dirA, D = H.D, dak = H.dak) {\n  if (H.kn.stijl) return H.kn.stijl.schub(H, C, P, V, fase, dirA, D, dak);'],
    ['function beverPatroon(H, C, P, V, D) {', 'function beverPatroon(H, C, P, V, D) {\n  if (H.kn.stijl) return H.kn.stijl.bever(H, C, P, V, D, beverPlek);'],
    ['function plankPatroon(H, C) {', 'function plankPatroon(H, C) {\n  if (H.kn.stijl) return H.kn.stijl.plank(H, C, { opMuur, plankenVan, plintOp });'],
    ['function baksteenPatroon(H, C) {', 'function baksteenPatroon(H, C) {\n  if (H.kn.stijl && !(H.torendak === \'zadel\' && C.z > H.zDak + 2 && C.nz > 0.3) && !(H.plat && (H.banden || []).some((zb) => Math.abs(C.z - zb) < E(2.9)))) return H.kn.stijl.baksteen(H, C);'],
    ['function leemPatroon(H, C) {', 'function leemPatroon(H, C) {\n  if (H.kn.stijl) return H.kn.stijl.leem(H, C, { opMuur, vlechtwerk });'],
    ['function schouwPatroon(H, C) {', 'function schouwPatroon(H, C) {\n  if (H.kn.stijl) return H.kn.stijl.schouw(H, C);'],
    ['function glasPatroon(C) {', 'function glasPatroon(C) {\n  if (C.stijl && C.deel.op && !C.deel.op.boog) return C.stijl.glas(C);'],
  ],
};

const K = require('./kern.cjs');
const Tr = laadMetHaken('toren.cjs', HAKEN['toren.cjs']);
const HS = laadMetHaken('huis-sdf.cjs', HAKEN['huis-sdf.cjs']);
const Hz = require('./huizen.cjs');
const D = require('./dorp.cjs');
const { hash, klem, ruis2, ruis3, RAMP, RAMP_NAMEN, RAMP_LEN } = K;
const UIT = path.join(__dirname, 'uit', 'stijlproef');

// ---------------------------------------------------------------- 1. het materiaal

// Een tint per pixel (warmer of koeler, -1 tot 1), voor laag 3. Een patroon zet hem op het beeld dat nu getekend wordt;
// riet en pleister geven een getal terug (het verweren in huis-sdf.cjs wikkelt ze), dus de tint gaat langs deze weg.
let BEELD = null;
const tint = (C, t) => {
  if (BEELD) BEELD.tint[C.py * BEELD.b + C.px] = t;
};
const r01 = (a, b, c) => (hash(a, b, c) % 1000) / 1000;

// Het riet (Marcels herberg): in elke laag bossen van zo'n drie pixels breed en tien lang, elk een eigen toon en aan zijn
// onderkant, waar de gesneden stengels het licht vangen, wat lichter; bovenin de laag de punten van de laag erboven als
// lichte tanden over een donkere zoom, en daaronder wordt de laag naar zijn eigen punten toe lichter. Rustiger dan het
// ruige riet (halmen van één pixel), met het contrast tussen de lagen in plaats van tussen de halmen.
function riet(H, P, V) {
  const R = S.riet;
  const L = H.laagL;
  const fase = (P.hE + V.laagGolf(P.a)) / L;
  const k = Math.floor(fase);
  const fu = (fase - k) * L; // vanaf de onderrand van de laag omhoog
  const onder = L - fu; // vanaf de bovenrand omlaag
  const zk = H.zaad + V.i * 31;
  // onderaan de laag, op zijn rand: de punten van de stengels als lichte tanden, elk zijn eigen lengte en smaller naar
  // zijn punt, met een donkere spleet ertussen
  const ta = P.a / R.tandB + 0.4 * Math.sin(P.a * 0.11 + k);
  const tand = Math.floor(ta);
  const ft = ta - tand;
  if (fu < R.punt) {
    // een tand is onderaan rond: hoe verder van zijn midden, hoe korter
    const rond = Math.sqrt(Math.max(0, 1 - ((ft - 0.5) * 2.1) ** 2));
    const lengte = R.punt * (0.25 + 0.75 * rond) * (0.8 + 0.2 * r01(tand, k, zk + 41));
    const tot = fu - (R.punt - lengte); // hoe ver boven de onderkant van de tand
    if (tot > 0) return R.tand + 0.3 * r01(tand, k, zk + 45) - (tot < 1.1 ? 0.9 : 0) - (ft < 0.1 || ft > 0.9 ? 0.6 : 0);
    return R.spleet;
  }
  // bovenaan de laag: de schaduw van de rand van de laag erboven, smal en donker, en dan snel licht
  const t2 = Math.floor(P.a / R.tandB + 0.4 * Math.sin(P.a * 0.11 + k + 1));
  const zoom = R.schaduw * (0.7 + 0.6 * r01(t2, k + 1, zk + 43));
  if (onder < zoom) return R.top + (R.basis - R.top) * (onder / zoom) ** 1.5;
  // de bossen: een kolom langs de nok, in stukken langs de helling, elk stuk een eigen toon
  const ka = P.a / R.bos + 0.3 * Math.sin(P.sE * 0.04 + k * 1.7);
  const kol = Math.floor(ka);
  const lang = R.lang * (0.7 + 0.6 * r01(kol, k, zk + 5));
  const sf = P.sE / lang + r01(kol, 0, zk + 2);
  const stuk = Math.floor(sf);
  const binnen = sf - stuk; // 0 aan de onderkant van het bos, 1 bovenaan
  let s = R.basis + (r01(kol, stuk, zk + 1) - 0.5) * R.toon;
  if (binnen < 0.2) s += 0.2;
  // tussen twee bossen soms een smalle donkere naad
  if (ka - kol < 0.24 && r01(kol, stuk, zk + 7) < R.naad) s -= 0.75;
  // de laag wordt naar zijn eigen punten toe lichter
  return s + R.verloop * (klem((onder - zoom) / (L - zoom), 0, 1) - 0.5);
}
// de tint van het riet: grote, zachte plekken wat goudener of wat groener, uit de plek in de wereld
function rietTint(H, C) {
  tint(C, (ruis3(C.x * 0.02, C.y * 0.02, C.z * 0.03, H.zaad + 801) - 0.5) * 2 * S.riet.tint);
}

// de nok: een worst van riet in bundels met een binding ertussen, elke bundel bol (in het midden lichter), de stengels
// dwars erover, rustig
function nok(H, C, V, a) {
  const band = (((a + 400 + H.zaad * 7) % 34) + 34) % 34;
  rietTint(H, C);
  if (band < 2.4) return -1.7 + (band < 1.2 ? -0.3 : 0.3);
  const kol = Math.floor(a / 2.2);
  const h = r01(kol, Math.floor(C.z / 7), H.zaad + 3 + V.i * 31);
  return (h - 0.5) * 0.7 + Math.sin(((band - 2.4) / 31.6) * Math.PI) * 0.6 - 0.2 + (C.nz < -0.1 ? 0.6 : 0);
}

// het pleister: zachte vlekken in twee maten, warm of grijzer, in de maten van de wereld
function pleister(H, C) {
  const { x, y, z } = C;
  const g = ruis3(x * 0.045, y * 0.045, z * 0.05, H.zaad + 811);
  const f = ruis3(x * 0.2, y * 0.2, z * 0.22, H.zaad + 813);
  tint(C, (ruis3(x * 0.025, y * 0.025, z * 0.03, H.zaad + 815) - 0.5) * 2 * S.pleister.tint);
  return (g - 0.5) * S.pleister.grof + (f - 0.5) * S.pleister.fijn;
}

// hout op balken en luiken: een nerf in lange, dunne strepen langs de balk, elke balk een eigen toon en tint, de koppen
// donkerder, en de ijzeren nagels zoals ze waren
function balk(C, oud) {
  const p = C.deel;
  const [u, w] = p.lok(C.x, C.y, C.z);
  if (p.naad && p.naad - Math.abs(w) < 0.9) return w > 0 ? -1.8 : 0.5;
  const z0 = (p.zaad || 0) * 17.3;
  let s = (p.toon ?? 0) * 0.8 + S.hout.plus;
  const nerf = ruis2(u * 0.035 + z0, w * 0.75, 829);
  s += (nerf - 0.5) * 1.1;
  if (nerf < 0.22) s -= 0.5;
  if (Math.abs(u) > p.L / 2 - 1.6) s -= 0.6;
  if (oud && ruis2(u * 0.08 + z0, w * 0.3, 13) > 0.7) s -= 0.7;
  if (Math.abs(Math.abs(u) - (p.L / 2 - 3.2)) < 0.8 && Math.abs(w) < 0.8) return { ramp: 'ijzer', stap: oud ? 1.4 : 2.6 };
  tint(C, S.hout.tint + (r01(Math.floor(z0), 3, 831) - 0.5) * 1.2);
  return s;
}

// G, de ronde veldsteen, zoals veldkeiPatroon in huis-sdf.cjs, met drie verschillen naar de herberg: de voeg donker in
// plaats van licht (dan lees je elke steen), een steen boller (licht boven en links, schaduw onder en rechts), en elke
// steen een eigen tint, warm of koel.
const VELDKEI = { b: 27, h: 18, rek: 1.4, voeg: 1.35, zak: 3.4, rand: 5.5 };
function veldkei(H, C, U, Hp, zaad) {
  const { rek } = VELDKEI;
  const b = VELDKEI.b * S.steen.maat;
  const h = VELDKEI.h * S.steen.maat;
  const rij = Math.floor(Hp / h);
  let f1 = 1e9;
  let f2 = 1e9;
  let f3 = 1e9;
  let id = 0;
  let du1 = 0;
  let dh1 = 0;
  let s1 = 1;
  for (let r = rij - 1; r <= rij + 1; r++) {
    const schuif = ((hash(r, 11, zaad) % 100) / 100) * b;
    const k0 = Math.floor((U - schuif) / b);
    for (let k = k0 - 1; k <= k0 + 1; k++) {
      const hk = hash(k, r, zaad + 71);
      const cu = schuif + (k + 0.5 + ((hk % 61) / 60 - 0.5) * 0.5) * b;
      const ch = (r + 0.5 + (((hk >> 6) % 61) / 60 - 0.5) * 0.35) * h;
      const s = 0.82 + ((hk >> 12) % 37) / 100;
      const du = (U - cu) / rek;
      const dh = Hp - ch;
      const d = Math.hypot(du, dh) / s;
      if (d < f1) {
        f3 = f2;
        f2 = f1;
        f1 = d;
        id = hk;
        du1 = du;
        dh1 = dh;
        s1 = s;
      } else if (d < f2) {
        f3 = f2;
        f2 = d;
      } else if (d < f3) f3 = d;
    }
  }
  const e = ((f2 - f1) / 2) * s1;
  if (e < VELDKEI.voeg || (f3 - f1) * s1 < VELDKEI.zak) {
    const onder = dh1 < 0 && -dh1 > Math.abs(du1) * 0.6;
    return { stap: C.stap + (onder ? S.steen.onder : S.steen.voeg) };
  }
  const l = Math.hypot(du1, dh1) || 1;
  const licht = (dh1 / l) * 0.8 + (du1 / l) * 0.45;
  const t = klem(1 - e / (VELDKEI.rand * S.steen.maat), 0, 1);
  let g = C.stap + ((id >> 18) % 7 - 3) * 0.2 + licht * (0.35 + S.steen.bol * t * t);
  if (e < 2.4 && licht < -0.3) g -= 0.9;
  tint(C, (((id >> 9) % 100) / 100 - 0.3) * 1.4 * S.steen.tint);
  if (id % 3 === 0) return { ramp: 'bot', stap: (g * (RAMP_LEN[RAMP.bot] - 1)) / (RAMP_LEN[RAMP.veldsteen] - 1) };
  return { stap: g };
}

// de baan onder de dakrand: een kort hard stuk, en dan een lang verloop
const baan = (afstand, hard, zacht) => {
  const h = hard * S.randHard;
  return afstand < h ? 1 : klem(1 - (afstand - h) / (zacht * S.randZacht + hard - h), 0, 1) ** 1.3;
};

// glas: de lucht spiegelt erin, bovenin het lichtst, met een schuine lichte streep per vak; tussen de vakken het kozijn
function glas(C) {
  const p = C.deel;
  const [a, v] = p.op.lok(C.x, C.y, C.z);
  const ka = a / p.op.hb;
  const kv = v / p.op.hh;
  const la = ka < 0 ? ka + 0.5 : ka - 0.5;
  const lv = kv < 0 ? kv + 0.5 : kv - 0.5;
  const streep = la * 1.2 + lv * -1.4;
  let s = S.glas.plus + S.glas.lucht * klem(lv + 0.5, 0, 1);
  if (streep > -0.6 && streep < -0.3 && lv > -0.1) s += 1.4;
  tint(C, -1);
  return s;
}

// Leien en spanen (schubPatroon in huis-sdf.cjs): stukken van ongelijke breedte in rijen. Zoals het riet van de herberg:
// rust binnen een stuk, het contrast in de randen. Elk stuk een eigen toon en tint, aan zijn onderrand licht, naar boven
// donkerder (daar ligt de rij erboven overheen), eronder een schaduwlijn, links een naad; een spaan heeft een nerf.
const { steenOp } = Tr.hulp;
function schub(H, C, P, V, fase, dirA, D, dak) {
  const lei = dak === 'leien';
  const R = lei ? S.lei : S.spaan;
  const U = -P.a * dirA;
  const zr = H.zaad * 17 + V.i * 5 + (lei ? 3 : 7);
  const Hh = fase * D.rij;
  const scheef = (st) => {
    const mid = (st.u0 + st.u1) / 2;
    const half = (st.u1 - st.u0) / 2;
    return H.sch * ((((st.id >> 5) % 7) - 3) * (lei ? 0.3 : 0.42) + (((st.id >> 9) % 5) - 2) * 0.22 * ((U - mid) / half));
  };
  const st = steenOp(U, Hh, 1, 1, zr, D.rij, D.lang, D.spreiding);
  const pb = st.pb - scheef(st);
  if (st.pt < 1.3) {
    const bo = steenOp(U, Hh + st.pt + 0.05, 1, 1, zr, D.rij, D.lang, D.spreiding);
    const ob = scheef(bo);
    if (ob < -st.pt) return -ob - st.pt < 1 ? R.lijn : R.rand;
  }
  if (pb < 0) return R.lijn;
  const id = st.id;
  tint(C, R.tint + (r01(id, 1, zr) - 0.5) * R.tintB);
  let s = R.basis + (r01(id, 2, zr) - 0.5) * 4 * R.toon;
  if (pb < 1) return s + R.lijn;
  if (pb < 2.2) s += R.rand;
  // een stuk is naar boven donkerder, waar het onder de rij erboven verdwijnt
  s += R.verloop * (0.5 - klem(pb / D.rij, 0, 1));
  if (st.pl < 1) return s + R.naad;
  if (st.pl < 2) s += 0.3;
  else if (st.pr < 1.2) s -= 0.5;
  if (lei) {
    if (id % 13 === 0) s -= 0.7;
    if (id % 97 === 6) return { ramp: 'bot', plus: s - 0.6 };
    if (id % 71 === 11 && P.hE < 70 && pb > 2) return { ramp: 'den', stap: klem(1 + C.stap * 0.3, 1, 3) };
    return s;
  }
  // de nerf van een spaan: smalle strepen langs de helling, per spaan anders
  const nerf = ruis2((U - st.u0) * 0.9 + (id % 97), pb * 0.06, zr + 1);
  s += (nerf - 0.5) * 2 * R.nerf;
  if (id % 89 === 5) return { ramp: 'hout', plus: s + (H.dakHout === 'schors' ? -1.4 : 0.7) };
  if (P.hE < 55 && pb < D.rij * 0.45 && ruis2(P.a * 0.09, P.hE * 0.1, zr + 2) > 0.76) return { ramp: 'den', stap: klem(0.8 + C.stap * 0.3, 1, 3) };
  return s;
}

// De ronde pannen zoals beverPatroon in huis-sdf.cjs, met elke pan een eigen tint: roder of bruiner, zoals pannen uit
// verschillende ovens.
function bever(H, C, P, V, D, beverPlek) {
  const b = beverPlek(V, P.a, P.hE, D);
  const id = hash(b.k, b.j, H.zaad * 3 + V.i + 11);
  tint(C, S.pan.tint + (r01(id, 5, 7) - 0.5) * S.pan.tintB);
  let s = ((id % 5) - 2) * 0.28;
  if (id % 9 === 0) s -= 0.8;
  else if (id % 17 === 1) s += 0.5;
  if (b.onder) return s - (b.rand < 1.3 ? 2.4 : 1.5);
  if (b.rand < 1.1) return s - 2.1;
  if (b.rand < 2.4) s += 0.8;
  s += 0.5 - 1.1 * klem(b.rand / D.rij, 0, 1);
  if (Math.min(b.pu, 1 - b.pu) * D.pan < 0.9) s -= 1.4;
  return s;
}

// Planken (plankPatroon in huis-sdf.cjs): elke plank een eigen toon en tint (vers warm, verweerd grijs), een rustige nerf
// in de lengte in plaats van losse streepjes, een donkere kier en een lichte rand in de zon; de kwasten, de spijkers, de
// kopse kanten onderaan en een vervangen plank zoals ze waren.
function plank(H, C, { opMuur, plankenVan, plintOp }) {
  const R = S.plank;
  const m = opMuur(H, C.x, C.y, C.z);
  if (!m) return (ruis3(C.x * 0.3, C.y * 0.3, C.z * 0.05, H.zaad + 841) - 0.5) * 0.6;
  const { P, u, h } = m;
  const { randen, kant } = plankenVan(H, P);
  const rand = (i) => randen[i] + kant[i] * (h - 60);
  let i = 0;
  while (i + 2 < randen.length && randen[i + 1] <= u) i++;
  while (i > 0 && u < rand(i)) i--;
  while (i + 2 < randen.length && u >= rand(i + 1)) i++;
  const w = rand(i + 1) - rand(i);
  const x = u - rand(i);
  const hh = hash(i, P.idx, H.zaad + 64);
  const plint = plintOp(H, P, u);
  const eind = plint + ((hh >> 5) % 4);
  if (h < eind + 1.2) return -2;
  if (h < plint + 9 && hash(Math.floor(u), Math.floor(h), H.zaad + 65) % 5 === 0) return { ramp: 'mos', stap: 2 };
  tint(C, (r01(hh, 1, 843) - 0.5) * R.tintB);
  let s = (r01(hh, 2, 845) - 0.5) * 4 * R.toon;
  if (x < 1) return s + R.kier;
  if (x < 2) s += 0.5;
  else if (w - x < 1.3) s -= 0.55;
  // de nerf: lange, smalle strepen in de lengte van de plank
  const nerf = ruis2(x * 0.75 + i * 7.3, h * 0.025, H.zaad + 847);
  s += (nerf - 0.5) * 2 * R.nerf;
  const kh = 30 + ((hh >> 8) % 90);
  if ((hh >> 3) % 3 === 0 && Math.abs(h - kh) < 1.6 && Math.abs(x - w * 0.45) < 1.3) s -= 1.3;
  const X = P.X;
  const regels = [plint + 14, X.plaatH - 16];
  if (X.lagen !== 1) regels.push((plint + X.plaatH) / 2);
  for (const hr of regels) if (Math.abs(h - hr - (hh % 3) * 0.4) < 0.7 && Math.abs(x - w / 2) < 0.7) return { ramp: 'ijzer', stap: 2 };
  if (hh % 13 === 5) return { ramp: 'hout', plus: s + (H.hout === 'schors' ? -0.4 : 0.8) };
  return s;
}

// Baksteen (baksteenPatroon in huis-sdf.cjs, de muur zelf; de lijsten en de afdekking blijven): elke steen een eigen tint,
// van rood tot oranje, en een eigen toon, een enkele donkere klinker; binnen een steen rustig, met een lichte bovenrand en
// linkerkant en een donkerder onderkant; de voeg van kalk licht, maar onder een steen in zijn schaduw.
function baksteen(H, C) {
  const R = S.baksteen;
  const { x, y, z, nx, ny } = C;
  const SQ = Math.SQRT1_2;
  const U = (Math.abs(ny) >= Math.abs(nx) ? (ny >= 0 ? -x : x) : nx >= 0 ? y : -y) * SQ;
  const rij = H.sp ? 7 : 6;
  const lang = H.sp ? 17 : 14;
  const Hp = z * K.PXH + H.sch * 0.8 * Math.sin(U * 0.031 + H.zaad);
  const r = Math.floor(Hp / rij);
  const dh = Hp - r * rij;
  const Uv = U + ((r & 1) * lang) / 2 + H.sch * ((hash(r, 3, H.zaad + 331) % 5) - 2) * 0.4;
  const k = Math.floor(Uv / lang);
  const du = Uv - k * lang;
  if (dh < 1.15 || du > lang - 1.15) {
    const onder = dh < 1.15 && dh > 0.35;
    return { ramp: 'veldsteen', stap: klem(C.stap * 0.75 + R.voeg + (onder ? R.voegOnder : 0), 1.2, 6.2) };
  }
  const id = hash(k, r, H.zaad + 333);
  tint(C, (r01(id, 1, 851) - 0.5) * R.tintB);
  let s = C.stap + (r01(id, 2, 853) - 0.5) * 2 * R.toon;
  if (id % 9 === 0) s += R.klinker;
  if (dh > rij - 1.8) s += 0.45;
  else if (dh < 2.1) s -= 0.3;
  if (du < 1.6) s += 0.3;
  s += (ruis2(U * 0.5, Hp * 0.5, H.zaad + 855) - 0.5) * 0.25;
  return { stap: s };
}

// Leem (leemPatroon in huis-sdf.cjs): het leem zacht gevlekt in twee maten, warm of grauwer, met lange vegen van de hand
// in plaats van losse streepjes en spikkels; waar het vlechtwerk bloot ligt, het vlechtwerk zoals het was, en de rand van
// het leem eromheen dik, met een schaduw eronder.
function leem(H, C, { opMuur, vlechtwerk }) {
  const R = S.leem;
  const m = opMuur(H, C.x, C.y, C.z);
  const u = m ? m.u : (C.x - C.y) * Math.SQRT1_2;
  const h = m ? m.h : C.z * K.PXH;
  const zk = H.zaad * 5 + (m ? m.P.idx * 17 : 0);
  const gat = ruis2(u * 0.04, h * 0.055, zk + 71) * 0.72 + ruis2(u * 0.11, h * 0.14, zk + 72) * 0.28 + 0.1 * klem((110 - h) / 50, 0, 1);
  if (gat > 0.55) return vlechtwerk(H, u, h, zk);
  if (gat > 0.515) return gat > 0.535 ? -1.2 : 0.7;
  tint(C, (ruis2(u * 0.02, h * 0.025, zk + 861) - 0.5) * 2 * R.tint);
  let s = (ruis2(u * 0.05, h * 0.06, zk + 73) - 0.5) * 2 * R.grof + (ruis2(u * 0.22, h * 0.25, zk + 863) - 0.5) * 2 * R.fijn;
  // vegen: liggende strepen van een hand breed, die golven
  const veeg = ruis2(u * 0.035, h * 0.4 + 2 * Math.sin(u * 0.05), zk + 865);
  s += (veeg - 0.5) * 2 * R.veeg;
  return s;
}
// de schoorsteen van leem: zacht gevlekt, en naar boven zwart van het roet, in een verloop
function schouw(H, C) {
  const n = ruis2(C.x * 0.07, C.z * 0.07, H.zaad * 5 + 91);
  const f = ruis2(C.x * 0.25 + C.y * 0.25, C.z * 0.25, H.zaad * 5 + 93);
  tint(C, (n - 0.5) * 1.2);
  let s = (n - 0.5) * 1.2 + (f - 0.5) * 0.4;
  const Sc = H.schoorsteen;
  if (Sc) s -= klem((C.z - (Sc.V.nokZ(Sc.a) + H.dik)) / (Sc.hoog * 0.9), 0, 1) ** 1.3 * 2.2;
  return s;
}

const STIJL = { S, riet, nok, pleister, balk, veldkei, baan, glas, schub, bever, plank, baksteen, leem, schouw };

// ---------------------------------------------------------------- 3. de kleur

const linNaar = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const naarSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function naarLab(hex) {
  const r = linNaar(parseInt(hex.slice(1, 3), 16) / 255);
  const g = linNaar(parseInt(hex.slice(3, 5), 16) / 255);
  const b = linNaar(parseInt(hex.slice(5, 7), 16) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function vanLab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [r, g, b].map((c) => Math.round(klem(naarSrgb(klem(c, 0, 1)), 0, 1) * 255));
}
// een ramp als lijn door OKLab, op elke plek t (0 tot 1)
const RAMP_LAB = new Map();
function rampLab(r) {
  if (!RAMP_LAB.has(r)) {
    const naam = RAMP_NAMEN[r];
    RAMP_LAB.set(r, (PALET[naam] || K.RAMPEN[naam]).map(naarLab));
  }
  return RAMP_LAB.get(r);
}
function opRamp(r, t) {
  const L = rampLab(r);
  const f = klem(t, 0, 1) * (L.length - 1);
  const i = Math.min(L.length - 2, Math.floor(f));
  const u = f - i;
  return [0, 1, 2].map((c) => L[i][c] + (L[i + 1][c] - L[i][c]) * u);
}
// Van stap naar kleur: een omlijning (wat omlijn() zette) blijft de tint die hij was; al het andere komt op een van de
// tussentinten van zijn ramp, met zijn tint erbij in halve stappen. Zo blijft het pixel art (een vast palet per ramp, nu
// fijner), en is er geen dambord van dithering nodig om licht te laten verlopen.
const KLEUREN = new Map();
function kleurVan(r, q, n, t) {
  const sl = (r * 4096 + q) * 16 + t + 8;
  let c = KLEUREN.get(sl);
  if (!c) {
    const lab = opRamp(r, q / (n - 1));
    lab[1] += (t / 2) * S.tint.a;
    lab[2] += (t / 2) * S.tint.b;
    c = vanLab(lab);
    KLEUREN.set(sl, c);
  }
  return c;
}
function kleur(B, lijn) {
  const rgba = Buffer.alloc(B.b * B.h * 4);
  for (let i = 0; i < B.b * B.h; i++) {
    const r = B.ramp[i];
    if (r < 0) continue;
    const len = RAMP_LEN[r];
    let c;
    if (lijn[i]) c = K.RAMP_RGB[r][klem(Math.round(B.stap[i]), 0, len - 1)];
    else {
      const n = (len - 1) * S.fijn + 1;
      const q = klem(Math.round((B.stap[i] / (len - 1)) * (n - 1)), 0, n - 1);
      c = kleurVan(r, q, n, klem(Math.round(B.tint[i] * 2), -4, 4));
    }
    rgba[i * 4] = c[0];
    rgba[i * 4 + 1] = c[1];
    rgba[i * 4 + 2] = c[2];
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}

// ---------------------------------------------------------------- renderen

// de knop stijl op een opgave, ook op de delen van een gebouw uit delen (de kapel)
function metStijl(spec) {
  if (spec.delen) return { ...spec, delen: spec.delen.map((d) => (d.spec.erfmuur || d.spec.tuin ? d : { ...d, spec: metStijl(d.spec) })) };
  return { ...spec, knoppen: { ...(spec.knoppen || {}), stijl: STIJL } };
}

// Eén huis, zoals renderHuis in huizen.cjs (hetzelfde kader, licht en omlijning), oud of in de nieuwe stijl. uitsnede: [x,
// y, b, h] in het volle beeld vóór het strak snijden, om snel een stuk te bekijken. Geeft { b, h, rgba, dx, dy, ms }: de
// strak gesneden tekening, en waar die in het volle beeld begon.
function render(naam, stijl, uitsnede = null) {
  const t0 = Date.now();
  const spec0 = Hz.HUIZEN[naam];
  if (!spec0) throw new Error(`geen huis "${naam}"`);
  const spec = stijl ? metStijl(spec0) : spec0;
  const draai = spec.draai || 0;
  const W = Hz.wereldVan(spec);
  if (stijl) W.stijl = STIJL;
  const kd = W.delen ? HS.kaderSamen(W, draai) : HS.kaderVan(W.H, [], draai);
  const RAND = 12;
  let b = Math.ceil(kd.b + RAND * 2);
  let h = Math.ceil(kd.h + RAND * 2);
  let OX = Math.round(RAND - kd.x0);
  let OY = Math.round(RAND - kd.y0);
  if (uitsnede) {
    OX -= uitsnede[0];
    OY -= uitsnede[1];
    b = uitsnede[2];
    h = uitsnede[3];
  }
  const B = new K.Beeld(b, h, OX, OY);
  B.tint = new Float32Array(b * h);
  BEELD = stijl ? B : null;
  Tr.tekenWereld(B, W, { draai });
  BEELD = null;
  B.lichten.push(...Tr.lichtenNaar(draai, W.lichten));
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: HS.WARM });
  K.verwarm(B, 1.8);
  // wat de omlijning zet, herkennen we aan wat er verandert
  const ramp0 = Int16Array.from(B.ramp);
  const stap0 = Float32Array.from(B.stap);
  K.omlijn(B);
  const lijn = new Uint8Array(b * h);
  for (let i = 0; i < b * h; i++) lijn[i] = B.ramp[i] !== ramp0[i] || B.stap[i] !== stap0[i] ? 1 : 0;
  const rgba = stijl ? kleur(B, lijn) : K.Plaat.van(K.kwantiseer(B)).rgba();
  if (uitsnede) return { b, h, rgba, dx: 0, dy: 0, ms: Date.now() - t0 };
  return { ...strak({ b, h, rgba }), ms: Date.now() - t0 };
}
function strak(im) {
  let [xa, ya, x1, y1] = [im.b, im.h, -1, -1];
  for (let y = 0; y < im.h; y++) {
    for (let x = 0; x < im.b; x++) {
      if (!im.rgba[(y * im.b + x) * 4 + 3]) continue;
      if (x < xa) xa = x;
      if (x > x1) x1 = x;
      if (y < ya) ya = y;
      if (y > y1) y1 = y;
    }
  }
  return { ...snij(im, xa, ya, x1 - xa + 1, y1 - ya + 1), dx: xa, dy: ya };
}
function snij(im, x0, y0, b, h) {
  const rgba = Buffer.alloc(b * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = y + y0;
    if (sy < 0 || sy >= im.h) continue;
    for (let x = 0; x < b; x++) {
      const sx = x + x0;
      if (sx < 0 || sx >= im.b) continue;
      im.rgba.copy(rgba, (y * b + x) * 4, (sy * im.b + sx) * 4, (sy * im.b + sx) * 4 + 4);
    }
  }
  return { b, h, rgba };
}

// in draden: elk huis in een eigen werker, oud en nieuw
const DRADEN = () => Math.max(1, Math.min(Number(process.env.DRADEN) || 6, require('os').cpus().length));
function renderVeel(taken) {
  return new Promise((klaar, fout) => {
    const uit = new Array(taken.length);
    let volgende = 0;
    let gedaan = 0;
    const werkers = [];
    const geef = (w) => {
      if (volgende < taken.length) {
        const i = volgende++;
        w.postMessage({ i, ...taken[i] });
      }
    };
    for (let n = 0; n < Math.min(DRADEN(), taken.length); n++) {
      const w = new Worker(__filename, { workerData: 'stijl' });
      w.on('error', fout);
      w.on('message', (m) => {
        uit[m.i] = { ...taken[m.i], b: m.b, h: m.h, rgba: Buffer.from(m.rgba), dx: m.dx, dy: m.dy, ms: m.ms };
        console.log(`  ${taken[m.i].naam.padEnd(26)} ${taken[m.i].stijl ? 'nieuw' : 'oud  '} ${m.b}×${m.h}  ${(m.ms / 1000).toFixed(1)} s`);
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
if (!isMainThread && workerData === 'stijl') {
  parentPort.on('message', ({ i, naam, stijl, uitsnede }) => {
    const r = render(naam, stijl, uitsnede);
    parentPort.postMessage({ i, b: r.b, h: r.h, rgba: r.rgba, dx: r.dx, dy: r.dy, ms: r.ms });
  });
}

// ---------------------------------------------------------------- de plaat

const HSE = require('./huis-sdf-export.cjs');
// een opschrift als RGBA, in de letters van de proefplaten
function opschrift(tekst, s = 2) {
  const p = new K.Plaat(tekst.length * 6 * s + 2, 8 * s);
  HSE.schrijf(p, tekst, 1, 0, s);
  return { b: p.b, h: p.h, rgba: p.rgba() };
}
function vel(b, h, kleur = [24, 22, 28]) {
  const rgba = Buffer.alloc(b * h * 4);
  for (let i = 0; i < b * h; i++) {
    rgba[i * 4] = kleur[0];
    rgba[i * 4 + 1] = kleur[1];
    rgba[i * 4 + 2] = kleur[2];
    rgba[i * 4 + 3] = 255;
  }
  return { b, h, rgba };
}
function plak(V, im, x0, y0, schaal = 1) {
  for (let y = 0; y < im.h * schaal; y++) {
    for (let x = 0; x < im.b * schaal; x++) {
      const tx = x0 + x;
      const ty = y0 + y;
      if (tx < 0 || ty < 0 || tx >= V.b || ty >= V.h) continue;
      const k = (Math.floor(y / schaal) * im.b + Math.floor(x / schaal)) * 4;
      const a = im.rgba[k + 3] / 255;
      if (!a) continue;
      const o = (ty * V.b + tx) * 4;
      for (let c = 0; c < 3; c++) V.rgba[o + c] = Math.round(im.rgba[k + c] * a + V.rgba[o + c] * (1 - a));
    }
  }
}
// verkleinen door te middelen (alleen voor het doel, dat 1,5 keer zo groot is als onze huizen)
function verklein(im, f) {
  const b = Math.round(im.b * f);
  const h = Math.round(im.h * f);
  const rgba = Buffer.alloc(b * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      const sx0 = x / f;
      const sy0 = y / f;
      const sum = [0, 0, 0, 0];
      let n = 0;
      for (let sy = Math.floor(sy0); sy < Math.ceil(sy0 + 1 / f); sy++) {
        for (let sx = Math.floor(sx0); sx < Math.ceil(sx0 + 1 / f); sx++) {
          if (sx >= im.b || sy >= im.h) continue;
          const k = (sy * im.b + sx) * 4;
          for (let c = 0; c < 4; c++) sum[c] += im.rgba[k + c];
          n++;
        }
      }
      for (let c = 0; c < 4; c++) rgba[(y * b + x) * 4 + c] = Math.round(sum[c] / n);
    }
  }
  return { b, h, rgba };
}
const schrijfPng = (bestand, im) => {
  fs.mkdirSync(path.dirname(bestand), { recursive: true });
  fs.writeFileSync(bestand, K.pngVanBeeld(im));
};

module.exports = { STIJL_INSTELLINGEN, PALET, HAKEN, render, renderVeel, kleur, metStijl, vel, plak, opschrift, verklein, snij, schrijfPng };

// ---------------------------------------------------------------- vanaf de opdrachtregel

// de zes gebouwen van de proef, elk een ander materiaal en een andere dakvorm, en de twee die van vier kanten komen
const ZES = [
  ['herberg1', 'de herberg: vakwerk, riet, T'],
  ['wit-hut1-riet-z', 'de hut: vlechtwerk en leem, riet'],
  ['oker-huis2-leien-z', 'oker vakwerk onder leien'],
  ['wit-steen6-pannen-z', 'veldsteen onder pannen, T'],
  ['planken-huis7-spanen-z', 'planken onder spanen'],
  ['wit-kapel-baksteen-z', 'de kapel: baksteen, toren'],
];
const VIER = ['wit-herberg1-riet', 'wit-steen6-pannen'];
const KANTEN = ['z', 'o', 'n', 'w'];

// De materialen zonder doel (Marcel, 17 okt: "Do the other materials next, one by one on a proof plate"): per materiaal een
// plaat met een stuk oud en nieuw, twee keer vergroot, en het hele huis oud en nieuw eronder. Het stuk is [x, y, b, h] in
// de strak gesneden tekening.
const MATERIALEN = [
  ['leien', 'oker-huis2-leien-z', [30, 10, 330, 260], 'LEIEN: ELKE LEI EEN EIGEN TOON EN EEN KOELE TINT, LICHT AAN DE ONDERRAND'],
  ['pannen', 'wit-steen6-pannen-z', [50, 10, 330, 260], 'PANNEN: ELKE PAN EEN EIGEN TOON EN TINT'],
  ['spanen', 'planken-huis7-spanen-z', [70, 10, 330, 260], 'SPANEN: RUSTIG BINNEN EEN SPAAN, EEN NERF, VERS OF VERWEERD'],
  ['planken', 'planken-huis7-spanen-z', [140, 330, 330, 300], 'PLANKEN: EEN RUSTIGE NERF, ELKE PLANK EEN EIGEN TOON EN TINT'],
  ['baksteen', 'wit-steen1-baksteen-z', [30, 280, 330, 230], 'BAKSTEEN: ELKE STEEN EEN EIGEN TINT, EEN SCHUINE RAND'],
  ['leem', 'wit-hut1-riet-z', [20, 210, 330, 200], 'LEEM EN VLECHTWERK: ZACHT GEVLEKT, VEGEN VAN DE HAND'],
];
async function maakMaterialen(alleen = null) {
  const lijst = MATERIALEN.filter(([m]) => !alleen || alleen.includes(m));
  const namen = [...new Set(lijst.map(([, naam]) => naam))];
  const r = await renderVeel(namen.map((naam) => ({ naam, stijl: true })));
  const nieuw = new Map(r.map((x) => [x.naam, x]));
  for (const [m, naam, [x, y, b, h], kop] of lijst) {
    const oud = K.leesPng(path.join(__dirname, '..', '..', 'tegels', 'huizen', `${naam}.png`));
    const nw = nieuw.get(naam);
    schrijfPng(path.join(UIT, 'los', `${naam}-nieuw.png`), nw);
    const M = 24;
    const V = vel(Math.max(b * 4 + M * 3, oud.b + nw.b + M * 3), 34 + 26 + h * 2 + M + 26 + Math.max(oud.h, nw.h) + M * 2);
    plak(V, opschrift(kop, 3), M, M);
    let yy = M + 34;
    plak(V, opschrift('OUD', 2), M, yy);
    plak(V, opschrift('NIEUW', 2), M * 2 + b * 2, yy);
    yy += 26;
    plak(V, snij(oud, x, y, b, h), M, yy, 2);
    plak(V, snij(nw, x, y, b, h), M * 2 + b * 2, yy, 2);
    yy += h * 2 + M;
    plak(V, opschrift(`${naam.toUpperCase()}: OUD EN NIEUW, WARE GROOTTE`, 2), M, yy);
    yy += 26;
    plak(V, oud, M, yy);
    plak(V, nw, M * 2 + oud.b, yy);
    schrijfPng(path.join(UIT, `materiaal-${m}.png`), V);
    console.log(`uit/stijlproef/materiaal-${m}.png`);
  }
}

// De plaat: bovenaan de herberg oud, nieuw en het doel op de maat van het spel; dan de andere vijf, oud en nieuw; dan de
// twee gebouwen van vier kanten in de nieuwe stijl. Het oude is de tekening die het spel nu heeft (tegels/huizen/), die
// precies is wat render() zonder stijl geeft; ter controle rendert de proef de herberg ook oud, en meet hij de tijd.
async function maakPlaat() {
  const taken = [{ naam: 'herberg1', stijl: false }];
  for (const [naam] of ZES) taken.push({ naam, stijl: true });
  for (const v of VIER) for (const k of KANTEN) if (!ZES.some(([n]) => n === `${v}-${k}`)) taken.push({ naam: `${v}-${k}`, stijl: true });
  const r = await renderVeel(taken);
  const nieuw = new Map(r.filter((x) => x.stijl).map((x) => [x.naam, x]));
  const oud = (naam) => K.leesPng(path.join(__dirname, '..', '..', 'tegels', 'huizen', `${naam}.png`));
  // controle: oud gerenderd is de tekening van het spel
  const o = r.find((x) => !x.stijl);
  const a = oud('herberg1');
  const gelijk = o.b === a.b && o.h === a.h && o.rgba.equals(Buffer.from(a.rgba));
  const tijden = r.map((x) => ({ naam: x.naam, stijl: x.stijl, s: +(x.ms / 1000).toFixed(1), b: x.b, h: x.h }));
  fs.mkdirSync(UIT, { recursive: true });
  fs.writeFileSync(path.join(UIT, 'tijden.json'), JSON.stringify({ gelijk, draden: DRADEN(), tijden }, null, 1));
  for (const [naam, x] of nieuw) schrijfPng(path.join(UIT, 'los', `${naam}-nieuw.png`), x);
  console.log(`  oud gerenderd = tegels/huizen/herberg1.png: ${gelijk}`);

  const doel = verklein(K.leesPng(path.join(__dirname, 'uit', 'schermen', 'herberg-stijl-doel.png')), 0.66);
  const doelHuis = snij(doel, 0, 0, 655, 632);
  // rijen van groepen: een groep heeft een kop boven zijn vakken, een vak een opschrift boven zijn beeld
  const rijen = [];
  rijen.push([{ kop: 'DE HERBERG: OUD, NIEUW, EN HET DOEL OP DE MAAT VAN HET SPEL (0,66)', vakken: [['OUD', oud('herberg1')], ['NIEUW', nieuw.get('herberg1')], ['DOEL', doelHuis]] }]);
  for (let i = 1; i < ZES.length; i += 2) {
    rijen.push(ZES.slice(i, i + 2).map(([naam, wat]) => ({ kop: wat.toUpperCase(), vakken: [['OUD', oud(naam)], ['NIEUW', nieuw.get(naam)]] })));
  }
  for (const v of VIER) rijen.push([{ kop: `${v.toUpperCase()}: NIEUW, VAN VIER KANTEN`, vakken: KANTEN.map((k) => [k.toUpperCase(), nieuw.get(`${v}-${k}`)]) }]);
  const M = 24;
  const KOP = 34;
  const LAB = 26;
  let B = 0;
  let H = M;
  for (const rij of rijen) {
    let b = M;
    let h = 0;
    for (const g of rij) {
      g.b = g.vakken.reduce((s, [, im]) => s + im.b + M, 0);
      b += g.b + M;
      h = Math.max(h, KOP + LAB + Math.max(...g.vakken.map(([, im]) => im.h)) + M);
    }
    rij.h = h;
    B = Math.max(B, b);
    H += h;
  }
  const V = vel(B, H);
  let y = M;
  for (const rij of rijen) {
    let x = M;
    const hoog = rij.h - KOP - LAB - M;
    for (const g of rij) {
      plak(V, opschrift(g.kop, 3), x, y);
      let xv = x;
      for (const [lab, im] of g.vakken) {
        plak(V, opschrift(lab, 2), xv, y + KOP);
        plak(V, im, xv, y + KOP + LAB + hoog - im.h);
        xv += im.b + M;
      }
      x += g.b + M * 2;
    }
    y += rij.h;
  }
  schrijfPng(path.join(UIT, 'plaat.png'), V);
  console.log(`uit/stijlproef/plaat.png  ${V.b}×${V.h}`);
}

if (isMainThread && require.main === module) {
  const [wat = 'plaat', ...rest] = process.argv.slice(2);
  const t0 = Date.now();
  if (wat === 'uitsnede') {
    // een stuk van de herberg (of een ander huis), oud en nieuw naast elkaar, drie keer vergroot; bij de herberg
    // rechts hetzelfde stuk van het doel, op de maat van het spel (0,66: de schoorsteen en de breedte van het huis)
    const naam = rest[0] || 'herberg1';
    const label = rest[2] ? `-${rest[2]}` : '';
    const u = rest[1] ? rest[1].split(',').map(Number) : [190, 115, 300, 330];
    const doel = naam === 'herberg1' ? verklein(K.leesPng(path.join(__dirname, 'uit', 'schermen', 'herberg-stijl-doel.png')), 0.66) : null;
    renderVeel([{ naam, stijl: false, uitsnede: u }, { naam, stijl: true, uitsnede: u }]).then(([a, b]) => {
      const n = doel ? 3 : 2;
      const V = vel(a.b * 3 * n + 10 * (n + 1), a.h * 3 + 20);
      plak(V, a, 10, 10, 3);
      plak(V, b, a.b * 3 + 20, 10, 3);
      if (doel) plak(V, snij(doel, u[0] + 60, u[1] - 35, u[2], u[3]), a.b * 6 + 30, 10, 3);
      schrijfPng(path.join(UIT, `uitsnede-${naam}${label}.png`), V);
      schrijfPng(path.join(UIT, 'los', `uitsnede-${naam}${label}-oud.png`), a);
      schrijfPng(path.join(UIT, 'los', `uitsnede-${naam}${label}-nieuw.png`), b);
      if (doel) schrijfPng(path.join(UIT, 'los', `uitsnede-${naam}${label}-doel.png`), snij(doel, u[0] + 60, u[1] - 35, u[2], u[3]));
      console.log(`uit/stijlproef/uitsnede-${naam}${label}.png  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    });
  } else if (wat === 'materialen') {
    maakMaterialen(rest.length ? rest : null).then(() => console.log(`${((Date.now() - t0) / 1000).toFixed(0)} s`));
  } else if (wat === 'huis') {
    const taken = rest.flatMap((naam) => [{ naam, stijl: false }, { naam, stijl: true }]);
    renderVeel(taken).then((r) => {
      for (let i = 0; i < r.length; i += 2) {
        const [a, b] = [r[i], r[i + 1]];
        const V = vel(a.b + b.b + 30, Math.max(a.h, b.h) + 20);
        plak(V, a, 10, 10);
        plak(V, b, a.b + 20, 10);
        schrijfPng(path.join(UIT, `${a.naam}.png`), V);
        schrijfPng(path.join(UIT, 'los', `${a.naam}-nieuw.png`), b);
      }
      console.log(`${((Date.now() - t0) / 1000).toFixed(0)} s`);
    });
  } else {
    maakPlaat().then(() => console.log(`${((Date.now() - t0) / 1000).toFixed(0)} s`));
  }
}
