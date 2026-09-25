// Het vee: een koe en een schaap (ontwerp/beeld.md, "Het vee: een koe en een schaap", Marcel
// 25 sep 2026). Voor de weides (ontwerp/spel.md, "Weides met koeien en schapen"): eerst de dieren,
// de regels komen later.
//
// Gebouwd zoals de wolf in bosvijanden.cjs: een romp met een nek, een kop, vier poten van drie
// starre stukken en een staart, en per beeld een houding die ze neerzet. Lokale assen als bij alle
// figuren: x naar rechts, y naar voren (ook bij een viervoeter), z omhoog, de voeten op z = 0. Het
// midden van de tegel ligt onder het midden van de romp, tussen de voor- en de achterpoten.
//
// Vier houdingen, allemaal een lus:
//   grazen  de kop omlaag naar het gras, trekken en kauwen; dat doen ze het meest
//   staan   herkauwen, de staart zwiept, een oor draait weg
//   lopen   een stapgang: achter links, voor links, achter rechts, voor rechts, een kwart na elkaar
//   liggen  neergevlijd op de borst, de poten eronder gevouwen, herkauwen en rustig ademen
//
// Middeleeuws vee was klein. De boer is 82 eenheden hoog met zijn hoed, zo'n 1,70 meter. De koe is
// gebouwd met 56 eenheden in de schoft en daarna op 0,9 gezet (SCHAAL): 51 eenheden, zo'n 1,05
// meter, waar een koe van nu 1,45 is. Het schaap net zo, 29 eenheden met de wol (60 centimeter).
// Een tegel is 45,25 eenheden, zo'n 90 centimeter. Niets is gelijk: per soort drie kleuren, elk een eigen vel
// (koe0..2, schaap0..2), en ook de horens en de oren verschillen een beetje per kleur.
'use strict';
const { klem, mix, ruis3 } = require('./kern.cjs');
const { model, kegel, bol, ellips, plus, naarRamp, geschaald } = require('./figuren.cjs');
const BV = require('./bosvijanden.cjs');

const { bochtProfiel, platteKegel, plukken, ruig } = BV;
const { tfPunt, tfNa, tfKet, tfDraai, tfSchuif, tfInv, vast, pas, omhul } = BV.beweging;
// Eén poot van drie starre stukken naar zijn voet: die van de wolf, want een koe en een schaap
// staan op dezelfde manier op vier poten (buig2 brengt elleboog en knie naar de voet toe).
const poot = BV.rig.wolfPoot;

const TEGEL = 64 / Math.SQRT2; // eenheden per tegel

// ---------------------------------------------------------------- maten van het spel

// Loopsnelheid in tegels per seconde. Moet gelijk zijn aan T.VEE.<soort>.snelheid in js/vee.js,
// anders glijden de voeten (test/vee.test.cjs houdt ze gelijk). Een koe kuiert, een schaap
// trippelt iets vlotter.
const SNELHEID = { koe: 0.9, schaap: 1.1 };
// Hoe groot het dier in het spel staat, tegen de maten waarin het hieronder gebouwd is: kleiner
// maken kan zonder één vorm te veranderen (geschaald, figuren.cjs). De loopcyclus rekent ermee, zodat
// een staande voet ook na het verkleinen precies met het spel meeschuift.
const SCHAAL = { koe: 0.9, schaap: 0.9 };
// Beelden per seconde van de loopcyclus: één rondje is één pas van elke poot. Een koe doet een
// rondje per seconde (0,9 tegel), een schaap zet kortere, snellere stappen.
const LOOP_FPS = { koe: 8, schaap: 12 };

const HOUDINGEN = {
  grazen: { beelden: 8, fps: 5, herhaal: true },
  staan: { beelden: 8, fps: 5, herhaal: true },
  lopen: { beelden: 8, fps: 10, herhaal: true }, // de fps per soort staat in LOOP_FPS
  liggen: { beelden: 8, fps: 4, herhaal: true },
};
const faseVan = (houding, i) => i / HOUDINGEN[houding].beelden;
const fpsVan = (soort, houding) => (houding === 'lopen' ? LOOP_FPS[soort] : HOUDINGEN[houding].fps);

// Een cel is normaal 112×124 met de voeten op (56, 110). Een koe is van neus tot staart ruim twee
// tegels lang, en reikt van opzij (W en O) 59 pixels naar elke kant: ze krijgt een bredere cel,
// 128×108, met het anker nog steeds op het midden van de tegel. Een liggende koe die naar je toe
// kijkt (Z), steekt met haar kop 26 pixels onder haar tegel uit; vandaar het anker op 76. Het
// schaap past in de gewone cel, alleen zijn anker staat vier pixels hoger om dezelfde reden.
const CELLEN = {
  koe: [128, 108, 64, 76],
  schaap: [112, 124, 56, 106],
};
const celVan = (soort) => CELLEN[soort];

// ---------------------------------------------------------------- bouwstenen

// Een deel star verplaatsen, en onthouden hoe het terug naar zijn rustplek gaat (`terug`, zie
// kern.cjs): dan rekent het materiaal in de rusthouding, en schuiven vlekken en plukken mee met
// het lijf in plaats van eroverheen.
function beweeg(deel, T) {
  if (!T) return deel;
  const nieuw = vast(deel, T);
  const Ti = tfInv(T);
  const eerder = deel.terug;
  nieuw.terug = eerder ? (x, y, z) => eerder(...tfPunt(Ti, [x, y, z])) : (x, y, z) => tfPunt(Ti, [x, y, z]);
  return nieuw;
}

// Alles onder de grond weg: een liggend dier zakt een fractie in het gras, en wat eronder steekt,
// mag niet onder zijn tegel uit komen piepen.
const GROND = { f: (x, y, z) => z + 0.4, uit: true };

// ---------------------------------------------------------------- de koe

// Draaipunten en poten in rust. De poten zijn [schouder, elleboog, pols, voet] en [heup, knie, hak,
// voet]; de voorpoot is een rechte zuil, de achterpoot knikt vooruit bij de knie en terug bij de hak.
const KOE = {
  rolAs: [0, 0, 32],
  nekVoet: [0, 22, 44],
  poll: [0, 48, 50],
  kaakAs: [0, 49, 41.5],
  oor: (s) => [s * 6, 47.9, 48.6],
  staartWortel: [0, -36.5, 50.4],
  staartMidden: [0, -39.8, 33],
  voor: (s) => [[s * 8, 23, 40], [s * 7.6, 19.5, 26.5], [s * 7.3, 21, 11.5], [s * 7.3, 22, 1.8]],
  achter: (s) => [[s * 8.5, -24, 41], [s * 9.6, -16.5, 27.5], [s * 8.2, -29.5, 14.5], [s * 7.8, -26.5, 1.8]],
  // zo staat ze stil: niet netjes in het vierkant, een voorpoot een tikje vooruit
  stand: [[-7.3, 23.2, 1.8], [7.3, 20.6, 1.8], [-7.8, -27.4, 1.8], [7.8, -25.8, 1.8]],
  // lopen: de middens van de passen, hoe hoog een voet opkomt, en hoe lang hij staat
  gang: { y: [21.8, 21.8, -26.5, -26.5], til: [6, 4.8], duur: 0.65, schouder: [0.5, 6.5] },
  // liggen: hoe ver het lijf zakt, hoe ver het op zijn rechterzij hangt, en waar de staart ligt
  lig: { zak: 23.6, rol: 6, staart: { zwaai: 16, til: 10, knik: 8, knikTil: -51 } },
  anim: {
    staanNek: 0, staanDraai: 2.5, staanKop: 0, kauw: 7, zwiep: 22, oorFlap: 38,
    graasNek: -58, graasKop: 30, graasDraai: 6,
    loopNek: -9, loopKop: 4,
    ligNek: 6, ligKop: 4, ligDraai: -10,
  },
};

// De kleuren van de koe (Marcel: roodbruin, zwart en zwartbont). `vacht` is de grondkleur, `wit`
// zegt waar ze bont is (in de rusthouding, per deel: lijf, kop, poot, staart), en de rest is wat er
// op elke koe anders uitziet. `hoorn` is de vorm van de horens: [naar buiten, omhoog, naar voren].
const KOE_KLEUREN = [
  {
    naam: 'roodbruin',
    vacht: { ramp: 'dak', lo: 1.0, hi: 5.8 },
    // de hals, de schoft en de poten een tikje donkerder, zoals bij een rode koe
    tint: (deel, x, y, z) => (deel === 'poot' && z < 16 ? -1 : deel === 'lijf' && y > 12 && z > 44 && Math.abs(x) < 6 ? -0.5 : 0),
    snuit: { ramp: 'huid', lo: 1.6, hi: 5.0 },
    uier: { ramp: 'huid', lo: 2.2, hi: 5.6 },
    kwast: { ramp: 'dak', lo: 0.3, hi: 3.0 },
    oorBinnen: { ramp: 'huid', lo: 1.8, hi: 4.4 },
    hoorn: [6.8, 5.8, 3.6],
  },
  {
    naam: 'zwart',
    vacht: { ramp: 'vacht', lo: 0.1, hi: 2.9, glans: 1.2 },
    snuit: { ramp: 'vacht', lo: 0.5, hi: 2.9, glans: 1.2 },
    uier: { ramp: 'vacht', lo: 0.9, hi: 3.4 },
    kwast: { ramp: 'inkt', lo: 0.2, hi: 2.4 },
    oorBinnen: { ramp: 'vacht', lo: 0.6, hi: 2.6 },
    hoorn: [7.6, 3.2, 2.2],
  },
  {
    naam: 'zwartbont',
    vacht: { ramp: 'vacht', lo: 0.1, hi: 2.9, glans: 1.2 },
    // grote witte vlakken, witte sokken, een witte buik en een bles
    wit: { ramp: 'pleister', lo: 2.2, hi: 6.1 },
    bont: (deel, x, y, z) => {
      if (deel === 'poot') return z < 13 + 2.5 * ruis3(x * 0.3, y * 0.3, 1.5, 81);
      if (deel === 'staart') return z < 21;
      if (deel === 'kop') return Math.abs(x) < 1.8 + (y - 49.5) * 0.18 && y > 49 && z > 36;
      if (z < 30.5 && y < 18) return true; // de buik en het uier
      const n = ruis3(x * 0.05 + 4.3, y * 0.042 + 1.7, z * 0.055, 73);
      return n > 0.54;
    },
    snuit: { ramp: 'huid', lo: 1.4, hi: 4.6 },
    uier: { ramp: 'huid', lo: 2.2, hi: 5.6 },
    kwast: { ramp: 'pleister', lo: 2.4, hi: 5.8 },
    oorBinnen: { ramp: 'vacht', lo: 0.6, hi: 2.6 },
    hoorn: [6.2, 6.4, 1.6],
  },
];

// ---------------------------------------------------------------- het schaap

const SCHAAP = {
  rolAs: [0, 0, 18],
  nekVoet: [0, 12, 25.5],
  poll: [0, 25, 31],
  kaakAs: [0, 26, 27.4],
  oor: (s) => [s * 3.1, 25.2, 30.3],
  staartWortel: [0, -20.6, 26.6],
  staartMidden: [0, -22.4, 20],
  voor: (s) => [[s * 4.8, 12, 21.5], [s * 4.6, 9, 13.5], [s * 4.4, 12, 6.5], [s * 4.4, 12.5, 1.2]],
  achter: (s) => [[s * 5, -14, 22], [s * 5.5, -10, 14.5], [s * 4.8, -17, 7.5], [s * 4.6, -15.5, 1.2]],
  stand: [[-4.4, 13.2, 1.2], [4.4, 11.6, 1.2], [-4.6, -16.2, 1.2], [4.6, -14.8, 1.2]],
  gang: { y: [12.4, 12.4, -15.5, -15.5], til: [4, 3.4], duur: 0.6, schouder: [0.45, 3.8] },
  lig: { zak: 12.6, rol: -5, staart: { zwaai: -16, til: 14, knik: -8, knikTil: -14 } },
  anim: {
    staanNek: 4, staanDraai: 4, staanKop: -2, kauw: 9, zwiep: 16, oorFlap: 34,
    graasNek: -74, graasKop: 40, graasDraai: 7,
    loopNek: -6, loopKop: 2,
    ligNek: 10, ligKop: 0, ligDraai: 12,
  },
};

// De kleuren van het schaap (Marcel: vuilwit, bruin, en een met een zwarte kop). De wol is nooit
// schoon: onderaan en achteraan zit modder en mest, en hier en daar een vlek. `kop` is de kaalte
// van het gezicht en de onderpoten.
const SCHAAP_KLEUREN = [
  {
    naam: 'vuilwit',
    wol: { ramp: 'pleister', lo: 1.1, hi: 4.8 },
    vuil: { ramp: 'riet', lo: 1.2, hi: 4.9 },
    kop: { ramp: 'perkament', lo: 1.2, hi: 4.8 },
    snuit: { ramp: 'huid', lo: 1.2, hi: 3.6 },
    oor: [0, 0],
  },
  {
    naam: 'bruin',
    wol: { ramp: 'jas', lo: 0.9, hi: 4.9 },
    vuil: { ramp: 'aarde', lo: 0.6, hi: 3.6 },
    // een lichtere buik en spiegel, zoals bij het oude bruine schaap
    licht: { ramp: 'jas', lo: 2.4, hi: 5.9 },
    kop: { ramp: 'leer', lo: 0.9, hi: 4.4 },
    snuit: { ramp: 'leer', lo: 0.5, hi: 2.8 },
    oor: [-6, 4],
  },
  {
    naam: 'zwartkop',
    wol: { ramp: 'pleister', lo: 1.3, hi: 5.0 },
    vuil: { ramp: 'riet', lo: 1.2, hi: 4.9 },
    kop: { ramp: 'vacht', lo: 0.25, hi: 2.9 },
    snuit: { ramp: 'vacht', lo: 0.3, hi: 2.4 },
    oor: [5, -3],
  },
];

const MATEN = { koe: KOE, schaap: SCHAAP };

// ---------------------------------------------------------------- houdingen

// De houding als getallen. lijf: schuif (eenheden), kantel (neus omhoog, graden) en rol (op de
// rechterzij, graden). nek en kop: kantel (omhoog) en draai (naar links). kaak: open (graden) en
// zij (malen). oren: hoe ver elk oor naar achteren draait. staart: zwaai (opzij), til (naar
// achteren omhoog), en het onderste stuk: knik (opzij) en knikTil (naar voren). voeten: waar het midden van elke voet is en
// hoe ver hij omkrult; schouder: hoe ver het schouderblad de voorpoot meeneemt. ligt: de poten
// gevouwen in plaats van op hun voeten.
function basis(M) {
  return {
    lijf: { schuif: [0, 0, 0], kantel: 0, rol: 0 },
    nek: { kantel: 0, draai: 0 },
    kop: { kantel: 0, draai: 0 },
    kaak: 0,
    kaakZij: 0,
    oren: [0, 0],
    staart: { zwaai: 0, til: 0, knik: 0, knikTil: 0 },
    voeten: M.stand.map((p) => ({ p: p.slice(), buig: 0 })),
    schouder: [0, 0],
    voetLijf: 0,
    ligt: false,
  };
}

function houdingVan(soort, houding, fase) {
  const M = MATEN[soort];
  const A = M.anim;
  const B = basis(M);
  const a = 2 * Math.PI * fase;
  // herkauwen: twee keer per rondje dicht en open, en een beetje malen
  const kauw = (x) => {
    B.kaak = A.kauw * (0.5 + 0.5 * Math.sin(2 * a + x));
    B.kaakZij = 3 * Math.sin(2 * a + x + 1.2);
  };
  if (houding === 'staan') {
    B.lijf.schuif = [0, 0, 0.35 * Math.sin(a)];
    B.nek.kantel = A.staanNek + 1.2 * Math.sin(a + 0.6);
    B.nek.draai = A.staanDraai * Math.sin(a - 0.4);
    B.kop.kantel = A.staanKop;
    kauw(0);
    // de staart zwiept naar één kant en terug, het onderste stuk slaat na
    B.staart.zwaai = A.zwiep * Math.sin(a);
    B.staart.knik = A.zwiep * 0.9 * Math.sin(a - 1.1);
    B.staart.til = 4 + 4 * Math.max(0, Math.sin(a));
    // een vlieg: het rechteroor draait weg en komt terug
    if (fase >= 0.45 && fase < 0.7) B.oren = [0, A.oorFlap];
    else if (fase >= 0.7 && fase < 0.8) B.oren = [0, A.oorFlap * 0.4];
    return B;
  }
  if (houding === 'grazen') {
    // de kop omlaag naar het gras; twee keer per rondje een ruk aan een pluk, en ondertussen
    // zwaait de snuit langzaam heen en weer over de grond
    B.lijf.schuif = [0, 0.6, -0.5 + 0.2 * Math.sin(a)];
    B.lijf.kantel = -1.2;
    B.nek.kantel = A.graasNek + 1.8 * Math.max(0, Math.sin(2 * a));
    B.nek.draai = A.graasDraai * Math.sin(a);
    B.kop.kantel = A.graasKop - 3 * Math.max(0, Math.sin(2 * a - 0.5));
    kauw(1.2);
    B.kaak *= 0.7;
    B.staart.zwaai = A.zwiep * 0.45 * Math.sin(a + 0.8);
    B.staart.knik = A.zwiep * 0.4 * Math.sin(a - 0.3);
    B.oren = [10, 10];
    return B;
  }
  if (houding === 'lopen') {
    // Stapgang: achter links, voor links, achter rechts, voor rechts, een kwart na elkaar. Een
    // staande voet schuift in precies het tempo van het spel naar achteren (SNELHEID, LOOP_FPS).
    const G = M.gang;
    const v = (SNELHEID[soort] * TEGEL) / SCHAAL[soort]; // eenheden per seconde, in de maten van het model
    const rondje = HOUDINGEN.lopen.beelden / LOOP_FPS[soort]; // seconden
    const zwaai = v * G.duur * rondje;
    const land = [0.25, 0.75, 0, 0.5]; // voor links, voor rechts, achter links, achter rechts
    for (let i = 0; i < 4; i++) {
      const [dy, dz, s] = pas(fase - land[i], G.duur, zwaai, i < 2 ? G.til[0] : G.til[1]);
      const x = M.stand[i][0];
      B.voeten[i] = { p: [x, G.y[i] + dy, M.stand[i][2] + dz], buig: s < 0 ? 0 : (i < 2 ? -70 : -40) * Math.sin(Math.PI * s) };
      if (i < 2) B.schouder[i] = klem(dy * G.schouder[0], -G.schouder[1], G.schouder[1]);
    }
    // twee keer per rondje op en neer, een beetje wiegen van links naar rechts, en de kop knikt
    // als een voorvoet neerkomt
    B.lijf.schuif = [0, 0, -0.6 + 0.5 * Math.cos(4 * Math.PI * (fase - 0.1))];
    B.lijf.rol = 1.6 * Math.sin(a);
    B.nek.kantel = A.loopNek - 2.2 * Math.cos(4 * Math.PI * (fase - 0.25));
    B.nek.draai = 2 * Math.sin(a + 0.5);
    B.kop.kantel = A.loopKop;
    B.staart.zwaai = 7 * Math.sin(a + 1.4);
    B.staart.knik = 6 * Math.sin(a + 0.4);
    B.staart.til = 3;
    B.oren = [6, 6];
    return B;
  }
  if (houding === 'liggen') {
    // neergevlijd op de borst, een beetje op één zij; rustig ademen en herkauwen, de kop wat
    // opzij, en een keer een oor
    B.ligt = true;
    B.lijf.schuif = [0, 0, -M.lig.zak + 0.35 * Math.sin(a)];
    B.lijf.rol = M.lig.rol;
    B.nek.kantel = A.ligNek + 1 * Math.sin(a + 0.5);
    B.nek.draai = A.ligDraai;
    B.kop.kantel = A.ligKop;
    kauw(0.4);
    B.staart = { ...M.lig.staart };
    if (fase >= 0.2 && fase < 0.4) B.oren = [A.oorFlap * 0.8, 0];
    return B;
  }
  throw new Error('onbekende houding: ' + houding);
}

// De standen van de botten in houding P, met de draaipunten van soort M.
function standen(P, M) {
  const lijf = tfKet(tfSchuif(P.lijf.schuif), tfDraai([0, 1, 0], P.lijf.rol, M.rolAs), tfDraai([1, 0, 0], P.lijf.kantel, M.rolAs));
  const nek = tfKet(lijf, tfDraai([0, 0, 1], P.nek.draai, M.nekVoet), tfDraai([1, 0, 0], P.nek.kantel, M.nekVoet));
  const kop = tfKet(nek, tfDraai([0, 0, 1], P.kop.draai, M.poll), tfDraai([1, 0, 0], P.kop.kantel, M.poll));
  // een oor draait om zijn voet naar achteren (de as wijst omhoog, voor links en rechts gespiegeld)
  const oor = (s, graden) => tfNa(kop, tfDraai([0, 0.25 * s, -s], graden, M.oor(s)));
  const wortel = M.staartWortel;
  const staart1 = tfKet(lijf, tfDraai([0, 1, 0], P.staart.zwaai, wortel), tfDraai([1, 0, 0], -P.staart.til, wortel));
  return {
    lijf,
    nek,
    kop,
    kaak: tfKet(kop, tfDraai([0, 0, 1], P.kaakZij, M.kaakAs), tfDraai([1, 0, 0], -P.kaak, M.kaakAs)),
    oorL: oor(-1, P.oren[0]),
    oorR: oor(1, P.oren[1]),
    staart1,
    staart2: tfNa(staart1, tfKet(tfDraai([0, 1, 0], P.staart.knik, M.staartMidden), tfDraai([1, 0, 0], P.staart.knikTil, M.staartMidden))),
  };
}

// ---------------------------------------------------------------- materialen

// Een materiaal met de grondkleur van een dier, en de plekken waar het een andere kleur draagt:
// bont (wit), een lichtere buik, of een tikje donkerder. `deel` zegt welk stuk van het dier het is.
function vachtMat(kleur, deel) {
  const v = kleur.vacht;
  return {
    ramp: v.ramp,
    lo: v.lo,
    hi: v.hi,
    glans: v.glans,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      if (kleur.bont && kleur.bont(deel, x, y, z)) return naarRamp(kleur.wit.ramp, stap, [v.lo, v.hi], [kleur.wit.lo, kleur.wit.hi]);
      return kleur.tint ? kleur.tint(deel, x, y, z) : 0;
    },
  };
}

function koeMaterialen(kleur) {
  const M = { lijf: 0, kop: 1, poot: 2, staart: 3, snuit: 4, oog: 5, neusgat: 6, hoorn: 7, hoef: 8, uier: 9, kwast: 10, oor: 11 };
  const mat = [];
  mat[M.lijf] = vachtMat(kleur, 'lijf');
  mat[M.kop] = vachtMat(kleur, 'kop');
  mat[M.poot] = vachtMat(kleur, 'poot');
  mat[M.staart] = vachtMat(kleur, 'staart');
  mat[M.snuit] = { ...kleur.snuit, glans: 1.1, rand: 0.6 };
  mat[M.oog] = { ramp: 'inkt', lo: 0.2, hi: 2.2, glans: 2.2, detail: true, rand: 0 };
  mat[M.neusgat] = { ramp: 'inkt', lo: 0, hi: 1.2, detail: true, rand: 0, schaduw: false };
  // horens: licht bot, naar de punt toe donker
  const puntVan = 4.8 + kleur.hoorn[0] * 0.72;
  mat[M.hoorn] = {
    ramp: 'bot',
    lo: 1.4,
    hi: 5.2,
    rand: 0.6,
    patroon: (x) => (Math.abs(x) > puntVan ? -2.2 : 0),
  };
  mat[M.hoef] = { ramp: 'vacht', lo: 0.2, hi: 2.2, rand: 0.4 };
  mat[M.uier] = { ...kleur.uier };
  mat[M.kwast] = { ...kleur.kwast, patroon: (x, y, z) => plukken(x, y, z, [0.6, 0.6, 0.3], 41, 0.6) };
  // oren: de binnenkant (naar voren) in een eigen kleur
  const ob = kleur.oorBinnen;
  mat[M.oor] = {
    ...vachtMat(kleur, 'oor'),
    patroon: (x, y, z, nx, ny, nz, stap) => (ny > 0.35 ? naarRamp(ob.ramp, stap, [kleur.vacht.lo, kleur.vacht.hi], [ob.lo, ob.hi]) : 0),
  };
  return { M, mat };
}

function schaapMaterialen(kleur) {
  const M = { wol: 0, kop: 1, poot: 2, snuit: 3, oog: 4, hoef: 5, oor: 6 };
  const mat = [];
  const w = kleur.wol;
  // wol in plukken; onderaan, achteraan en in vlekken zit er vuil in
  mat[M.wol] = {
    ramp: w.ramp,
    lo: w.lo,
    hi: w.hi,
    rand: 1.1,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const p = plukken(x, y, z, [0.36, 0.36, 0.36], 23, 0.85);
      // vlekken alleen op de flanken en achteraan, waar het schaap in de modder ligt en zit
      const vlek = z < 25 && ruis3(x * 0.11 + 2.1, y * 0.11, z * 0.12, 57) > 0.68;
      const vuil = z < 16.4 + 2.4 * ruis3(x * 0.2, y * 0.2, 0.5, 61) || (y < -17 && z < 24) || vlek;
      if (vuil) return naarRamp(kleur.vuil.ramp, stap + p, [w.lo, w.hi], [kleur.vuil.lo, kleur.vuil.hi]);
      if (kleur.licht && (z < 19 || (y < -19 && Math.abs(x) < 5.5))) return naarRamp(kleur.licht.ramp, stap + p, [w.lo, w.hi], [kleur.licht.lo, kleur.licht.hi]);
      return p;
    },
  };
  mat[M.kop] = { ...kleur.kop, rand: 0.9 };
  mat[M.poot] = { ...kleur.kop, rand: 0.8, patroon: (x, y, z) => (z < 4 ? -0.6 : 0) };
  mat[M.snuit] = { ...kleur.snuit, glans: 0.8, rand: 0.4 };
  mat[M.oog] = { ramp: 'inkt', lo: 0.2, hi: 2.2, glans: 2.2, detail: true, rand: 0 };
  mat[M.hoef] = { ramp: 'vacht', lo: 0.2, hi: 2.0, rand: 0.3 };
  mat[M.oor] = { ...kleur.kop, rand: 0.8, patroon: (x, y, z, nx, ny) => (ny > 0.4 ? -0.8 : 0) };
  return { M, mat };
}

// ---------------------------------------------------------------- de koe bouwen

// koe({ houding, fase, kleur }): kleur 0 roodbruin, 1 zwart, 2 zwartbont. Zonder houding staat ze.
function koe(o = {}) {
  const kleur = KOE_KLEUREN[(o.kleur || 0) % KOE_KLEUREN.length];
  const P = houdingVan('koe', o.houding || 'staan', o.fase || 0);
  const T = standen(P, KOE);
  const { M, mat } = koeMaterialen(kleur);
  const D = { lijf: 1, kop: 2, voorL: 3, voorR: 4, achterL: 5, achterR: 6, staart: 7, oorL: 8, oorR: 9, hoorn: 10 };
  const L = (d) => beweeg(d, T.lijf);
  const N = (d) => beweeg(d, T.nek);
  const K = (d) => beweeg(d, T.kop);
  const delen = [];

  // --- romp: een diepe ton met een rechte rug, de heupknobbels en de zitbeenderen steken uit
  delen.push(L(ellips([0, 13, 40.5], [12, 17.5, 13.5], M.lijf, D.lijf)));
  delen.push(L(ellips([0, -5, 39.5], [15, 18.5, 14.2], M.lijf, D.lijf, 6)));
  delen.push(L(ellips([0, -25, 42.5], [12.2, 13, 10.8], M.lijf, D.lijf, 6)));
  delen.push(L(kegel([0, 21, 48.4], [0, -30, 48.6], 5.8, 5.2, M.lijf, D.lijf, 5)));
  delen.push(L(ellips([0, 19, 49], [6.5, 9, 5.5], M.lijf, D.lijf, 4)));
  for (const s of [-1, 1]) {
    delen.push(L(bol([s * 11.8, -19.5, 49.4], 3.4, M.lijf, D.lijf, 3)));
    delen.push(L(bol([s * 5.8, -35.5, 47], 2.8, M.lijf, D.lijf, 2.5)));
  }
  delen.push(L(kegel([0, -30, 50.4], [0, -36.5, 50], 3.4, 2.6, M.lijf, D.lijf, 2)));
  // het borstbeen, tussen de voorpoten
  delen.push(L(ellips([0, 27, 31], [6.5, 6.5, 6], M.lijf, D.lijf, 4)));
  // een klein uier met vier spenen: een koe van toen gaf een paar liter per dag
  delen.push(L(ellips([0, -14.5, 25.2], [6.2, 7.2, 4.8], M.uier, D.lijf, 3)));
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) delen.push(L(kegel([sx * 2.4, -14.5 + sy * 2.6, 21.6], [sx * 2.5, -14.5 + sy * 2.8, 18.4], 1.05, 0.8, M.uier, D.lijf)));
  }

  // --- hals, met de kwab eronder
  delen.push(N(kegel([0, 22, 43.5], [0, 44, 47.5], 11, 7.6, M.lijf, D.lijf, 6)));
  delen.push(N(platteKegel([0, 42.5, 39], [0, 25.5, 29.5], 3, 6, [1, 0, 0], 0.55, M.lijf, D.lijf, 3)));

  // --- kop: een breed voorhoofd, een lang gezicht en een brede snuit
  delen.push(K(ellips([0, 49.3, 48], [6.6, 5.6, 5.8], M.kop, D.kop, 3)));
  delen.push(K(kegel([0, 51, 45.5], [0, 57.5, 37], 6, 4.6, M.kop, D.kop, 2.5)));
  delen.push(K(ellips([0, 59.1, 34.4], [5.3, 4, 3.7], M.snuit, D.kop, 1.6)));
  delen.push(beweeg(kegel([0, 48.3, 42.5], [0, 55.5, 33.8], 5.4, 3.3, M.kop, D.kop, 1.6), T.kaak));
  const [hx, hz, hy] = kleur.hoorn;
  for (const s of [-1, 1]) {
    delen.push(K(bol([s * 5.9, 51.7, 45.4], 1.35, M.oog, D.kop)));
    delen.push(K(bol([s * 2.1, 62.3, 34.8], 0.95, M.neusgat, D.kop)));
    // horens: eerst naar buiten, dan omhoog en een beetje naar voren
    const voet = [s * 4.8, 48.9, 52];
    const punt = [s * (4.8 + hx), 48.9 + hy, 52 + hz];
    const midden = [s * (4.8 + hx * 0.85), 48.9 + hy * 0.1, 52 + hz * 0.25];
    for (const p of bochtProfiel(voet, midden, punt, (t) => mix(2, 0.55, t), 4, M.hoorn, D.hoorn, 0.8)) delen.push(K(p));
    // oren: plat, zijwaarts onder de horens, de holte naar voren
    const oor = platteKegel(KOE.oor(s), [s * 12.6, 46.7, 47], 1.3, 2.7, [0, 1, 0.25], 0.5, M.oor, s < 0 ? D.oorL : D.oorR, 1);
    delen.push(beweeg(oor, s < 0 ? T.oorL : T.oorR));
  }

  // --- poten
  for (const s of [-1, 1]) {
    const dv = s < 0 ? D.voorL : D.voorR;
    const da = s < 0 ? D.achterL : D.achterR;
    const [S, E, W, V] = KOE.voor(s);
    const [Hp, Kn, Hk, Ac] = KOE.achter(s);
    if (P.ligt) {
      delen.push(...koeGevouwen(s, S, Hp, M, dv, da).map(L));
      continue;
    }
    const voor = [
      [kegel(S, E, 6.2, 3.8, M.poot, dv, 4)],
      [kegel(E, W, 3.3, 2.3, M.poot, dv, 1.2)],
      [kegel(W, plus(V, [0, -0.2, 1.8]), 2.25, 2.05, M.poot, dv, 0.8), ellips(V, [2.6, 3.3, 1.9], M.hoef, dv, 0.8)],
    ];
    const achter = [
      [kegel(Hp, Kn, 8.6, 4.6, M.poot, da, 4.5)],
      [kegel(Kn, Hk, 3.9, 2.1, M.poot, da, 1.2), bol(plus(Hk, [0, -1.3, 0.8]), 2.3, M.poot, da, 1)],
      [kegel(Hk, plus(Ac, [0, 0.2, 1.8]), 2.05, 1.95, M.poot, da, 0.8), ellips(Ac, [2.5, 3.2, 1.9], M.hoef, da, 0.8)],
    ];
    const tv = poot(T, P, s < 0 ? 0 : 1, [S, E, W, V], true);
    const ta = poot(T, P, s < 0 ? 2 : 3, [Hp, Kn, Hk, Ac], false);
    voor.forEach((stuk, j) => delen.push(...stuk.map((d) => beweeg(d, tv[j]))));
    achter.forEach((stuk, j) => delen.push(...stuk.map((d) => beweeg(d, ta[j]))));
  }

  // --- staart: dun, tot over de hak, met een kwast; hij scharniert bij de wortel en halverwege
  for (const p of bochtProfiel(KOE.staartWortel, [0, -39.8, 44], KOE.staartMidden, (t) => mix(1.9, 1.4, t), 3, M.staart, D.staart, 1)) delen.push(beweeg(p, T.staart1));
  for (const p of bochtProfiel(KOE.staartMidden, [0, -40.2, 25], [0, -39.6, 19], (t) => mix(1.4, 1.05, t), 3, M.staart, D.staart, 1)) delen.push(beweeg(p, T.staart2));
  delen.push(beweeg(ruig(ellips([0, -39.6, 15.8], [2.1, 2.1, 4.4], M.kwast, D.staart, 1), [0.5, 0.5, 0.25], 31, 0.7), T.staart2));

  if (P.ligt) delen.push(GROND);
  return geschaald(model(delen, mat, omhul(delen)), SCHAAL.koe);
}

// De poten van een liggende koe, in de maten van het lijf (dat daarna gezakt en gekanteld wordt):
// voor gevouwen onder de borst, met de knie vooruit op de grond en de pijp terug eronder; achter
// ligt de bovenste poot (links) naast de buik, de hak naar achteren en de voet naar voren, en van
// de onderste steekt alleen de hak en de voet uit.
function koeGevouwen(s, S, Hp, M, dv, da) {
  const g = KOE.lig.zak; // de grond, in de maten van het lijf
  const E = [s * 8.2, 17.5, g + 3.4];
  const W = [s * 7.4, 28.5, g + 2.4];
  const V = [s * 5.2, 21.5, g + 1.8];
  const delen = [
    kegel(S, E, 6.2, 3.8, M.poot, dv, 4),
    kegel(E, W, 3.3, 2.4, M.poot, dv, 1.2),
    kegel(W, V, 2.2, 2.0, M.poot, dv, 0.8),
    ellips(plus(V, [0, -1, 0]), [2.4, 3, 1.8], M.hoef, dv, 0.8),
  ];
  if (s < 0) {
    const Kn = [-12.5, -11, g + 7];
    const Hk = [-14.5, -31, g + 3];
    const Ac = [-15.5, -12.5, g + 1.8];
    delen.push(
      kegel(Hp, Kn, 8.6, 4.8, M.poot, da, 4.5),
      kegel(Kn, Hk, 3.9, 2.2, M.poot, da, 1.2),
      bol(plus(Hk, [0, -1.4, 0.4]), 2.3, M.poot, da, 1),
      kegel(Hk, plus(Ac, [0, -1.5, 0]), 2.05, 1.95, M.poot, da, 0.8),
      ellips(Ac, [2.5, 3.2, 1.9], M.hoef, da, 0.8),
    );
  } else {
    const Hk = [11.5, -33, g + 2.6];
    const Ac = [13, -21, g + 1.6];
    delen.push(
      kegel(Hp, [10.5, -20, g + 6], 8.2, 5, M.poot, da, 4.5),
      bol(Hk, 2.4, M.poot, da, 2),
      kegel(Hk, plus(Ac, [0, -1.5, 0]), 2.05, 1.95, M.poot, da, 0.8),
      ellips(Ac, [2.5, 3.2, 1.9], M.hoef, da, 0.8),
    );
  }
  return delen;
}

// ---------------------------------------------------------------- het schaap bouwen

// schaap({ houding, fase, kleur }): kleur 0 vuilwit, 1 bruin, 2 met een zwarte kop.
function schaap(o = {}) {
  const kleur = SCHAAP_KLEUREN[(o.kleur || 0) % SCHAAP_KLEUREN.length];
  const P = houdingVan('schaap', o.houding || 'staan', o.fase || 0);
  const T = standen(P, SCHAAP);
  const { M, mat } = schaapMaterialen(kleur);
  const D = { lijf: 1, kop: 2, voorL: 3, voorR: 4, achterL: 5, achterR: 6, staart: 7, oorL: 8, oorR: 9 };
  const L = (d) => beweeg(d, T.lijf);
  const N = (d) => beweeg(d, T.nek);
  const K = (d) => beweeg(d, T.kop);
  const wol = (d, zaad, amp = 1.6) => ruig(d, [0.34, 0.3, 0.34], zaad, amp);
  const delen = [];

  // --- de wol: een ronde ton van plukken, iets hoger achter dan voor
  delen.push(L(wol(ellips([0, -2, 23.2], [10.2, 18.5, 9.4], M.wol, D.lijf), 11, 1.8)));
  delen.push(L(wol(ellips([0, 9.5, 23.8], [9, 8.5, 8.8], M.wol, D.lijf, 3), 12)));
  delen.push(L(wol(ellips([0, -14.5, 24.6], [9.4, 8.2, 8.6], M.wol, D.lijf, 3), 13)));

  // --- hals, in de wol
  delen.push(N(wol(kegel([0, 11.5, 25.5], [0, 22.7, 29.5], 6.8, 4.6, M.wol, D.lijf, 3), 14, 1.3)));

  // --- kop: kaal en smal, met een kuif van wol op het voorhoofd
  delen.push(K(ellips([0, 25.8, 30.2], [3.6, 3.8, 3.6], M.kop, D.kop, 2)));
  delen.push(K(kegel([0, 27.2, 28.8], [0, 32.2, 24.4], 3.2, 2.2, M.kop, D.kop, 1.5)));
  delen.push(K(ellips([0, 32.8, 23.8], [2.3, 2, 2], M.snuit, D.kop, 1)));
  delen.push(beweeg(kegel([0, 25.4, 27], [0, 31.2, 23.1], 2.6, 1.7, M.kop, D.kop, 1), T.kaak));
  delen.push(K(wol(ellips([0, 24.4, 32.5], [3.1, 2.8, 2], M.wol, D.kop, 1.5), 15, 0.8)));
  for (const s of [-1, 1]) {
    delen.push(K(bol([s * 3.3, 28, 29], 0.95, M.oog, D.kop)));
    // oren: zijwaarts en een tikje hangend, elk schaap net anders
    const hang = kleur.oor[s < 0 ? 0 : 1];
    const oor = platteKegel(SCHAAP.oor(s), [s * 7.8, 24.4 + hang * 0.05, 29 - hang * 0.12], 0.9, 1.7, [0, 1, 0.4], 0.5, M.oor, s < 0 ? D.oorL : D.oorR, 0.8);
    delen.push(beweeg(oor, s < 0 ? T.oorL : T.oorR));
  }

  // --- poten: boven in de wol, onder kaal en dun
  for (const s of [-1, 1]) {
    const dv = s < 0 ? D.voorL : D.voorR;
    const da = s < 0 ? D.achterL : D.achterR;
    const [S, E, W, V] = SCHAAP.voor(s);
    const [Hp, Kn, Hk, Ac] = SCHAAP.achter(s);
    if (P.ligt) {
      delen.push(...schaapGevouwen(s, S, Hp, M, dv, da, wol).map(L));
      continue;
    }
    const voor = [
      [wol(kegel(S, E, 3.6, 2.3, M.wol, dv, 2.5), 16 + s, 1)],
      [kegel(E, W, 1.55, 1.25, M.poot, dv, 0.8)],
      [kegel(W, plus(V, [0, 0, 1.3]), 1.2, 1.1, M.poot, dv, 0.6), ellips(V, [1.4, 1.8, 1.2], M.hoef, dv, 0.5)],
    ];
    const achter = [
      [wol(kegel(Hp, Kn, 4.8, 3, M.wol, da, 2.5), 18 + s, 1.1)],
      [kegel(Kn, Hk, 1.8, 1.2, M.poot, da, 0.8)],
      [kegel(Hk, plus(Ac, [0, 0, 1.3]), 1.15, 1.1, M.poot, da, 0.6), ellips(Ac, [1.35, 1.75, 1.2], M.hoef, da, 0.5)],
    ];
    const tv = poot(T, P, s < 0 ? 0 : 1, [S, E, W, V], true);
    const ta = poot(T, P, s < 0 ? 2 : 3, [Hp, Kn, Hk, Ac], false);
    voor.forEach((stuk, j) => delen.push(...stuk.map((d) => beweeg(d, tv[j]))));
    achter.forEach((stuk, j) => delen.push(...stuk.map((d) => beweeg(d, ta[j]))));
  }

  // --- staart: lang en wollig, zoals toen (hij werd nog niet gecoupeerd)
  for (const p of bochtProfiel(SCHAAP.staartWortel, [0, -22.6, 24], SCHAAP.staartMidden, (t) => mix(2.4, 2.1, t), 2, M.wol, D.staart, 1)) delen.push(beweeg(wol(p, 19, 0.8), T.staart1));
  for (const p of bochtProfiel(SCHAAP.staartMidden, [0, -22.8, 16.5], [0, -22.2, 13.5], (t) => mix(2.1, 1.6, t), 2, M.wol, D.staart, 1)) delen.push(beweeg(wol(p, 20, 0.8), T.staart2));

  if (P.ligt) delen.push(GROND);
  return geschaald(model(delen, mat, omhul(delen)), SCHAAL.schaap);
}

// De poten van een liggend schaap: bijna alles verdwijnt onder de wol. Voor steken de knieën op
// de grond naar voren, achter een hak en een voet opzij.
function schaapGevouwen(s, S, Hp, M, dv, da, wol) {
  const g = SCHAAP.lig.zak;
  const E = [s * 4.6, 8.5, g + 2];
  const W = [s * 4, 16, g + 1.4];
  const V = [s * 2.6, 11, g + 1.1];
  const delen = [
    wol(kegel(S, E, 3.6, 2.3, M.wol, dv, 2.5), 16 + s, 1),
    kegel(E, W, 1.55, 1.3, M.poot, dv, 0.8),
    kegel(W, V, 1.2, 1.1, M.poot, dv, 0.6),
    ellips(V, [1.3, 1.7, 1.1], M.hoef, dv, 0.5),
  ];
  const Hk = [s * 8.4, -18.5, g + 1.6];
  const Ac = [s * 9.4, -9.5, g + 1.1];
  delen.push(
    wol(kegel(Hp, [s * 8, -9, g + 3.6], 4.8, 3.2, M.wol, da, 2.5), 18 + s, 1.1),
    kegel(Hk, Ac, 1.2, 1.1, M.poot, da, 0.6),
    ellips(Ac, [1.3, 1.7, 1.1], M.hoef, da, 0.5),
  );
  return delen;
}

// ---------------------------------------------------------------- alle vellen

// Welke vellen er zijn: per soort een vel per kleur, zoals de gewone dorpelingen dorpeling0..
// hebben. js/vee.js kiest er een met het zaad van het dier (T.VEE.<soort>.kleuren).
const VELLEN = [
  ...KOE_KLEUREN.map((k, i) => ({ naam: `koe${i}`, soort: 'koe', kleur: i, kleurNaam: k.naam, maak: (o) => koe({ ...o, kleur: i }) })),
  ...SCHAAP_KLEUREN.map((k, i) => ({ naam: `schaap${i}`, soort: 'schaap', kleur: i, kleurNaam: k.naam, maak: (o) => schaap({ ...o, kleur: i }) })),
];

module.exports = {
  koe,
  schaap,
  VELLEN,
  KOE_KLEUREN,
  SCHAAP_KLEUREN,
  HOUDINGEN,
  SNELHEID,
  LOOP_FPS,
  SCHAAL,
  faseVan,
  fpsVan,
  CELLEN,
  celVan,
  // het binnenwerk, om na te rekenen dat voeten niet glijden en poten hun doel halen
  rig: { houdingVan, standen, KOE, SCHAAP },
};
