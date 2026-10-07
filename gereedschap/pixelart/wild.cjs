// Het wild: het edelhert (werklijst vraag 116, stap 1, 7 okt 2026; ontwerp/beeld.md, "Het vee" en "Het wild").
// Herten grazen in kleine groepjes aan de bosrand en rennen weg als iemand dichtbij komt. Later komen hier
// een wild zwijn en een beer bij, op hetzelfde tuig.
//
// Gebouwd zoals de koe en het schaap in vee.cjs, op het tuig van de wolf (bosvijanden.cjs): een romp met een
// hals, een kop, vier poten van drie starre stukken en een staart, en per beeld een houding die ze neerzet.
// Lokale assen als bij alle figuren: x naar rechts, y naar voren, z omhoog, de voeten op z = 0. Het midden
// van de tegel ligt onder het midden van de romp, tussen de voor- en de achterpoten. De bouwstenen (de
// botten van `standen`, de poot, `beweeg`, de grond) komen uit vee.cjs en bosvijanden.cjs; hier staat alleen
// wat een hert anders maakt: slank, lange dunne poten, een lange hals, grote oren, een korte staart met een
// lichte spiegel eromheen, en bij het mannetje een gewei.
//
// Vijf houdingen, allemaal een lus:
//   grazen  de kop omlaag tot op het gras, een ruk aan een pluk, een oor dat flikkert
//   staan   alert: de kop omhoog, de oren draaien om de beurt, af en toe een hoef
//   lopen   stapvoets (1,0 tegel per seconde): achter links, voor links, achter rechts, voor rechts
//   rennen  in sprongen, als het vlucht (4,0 tegel per seconde): de achterpoten, de voorpoten, en een
//           zweefmoment; de oren plat, de staart omhoog zodat de spiegel oplicht
//   liggen  neergevlijd op de borst, de kop omhoog, herkauwend, met een oor dat draait
//
// De boer is 82 eenheden hoog met zijn hoed, zo'n 1,70 meter, en een eenheid is dus ruim 2 centimeter. Een
// edelhert staat zo'n 1,2 meter in de schoft: 58 eenheden voor het mannetje, 52 voor de hindes. Middeleeuws
// vee is klein, maar wild niet: met de kop omhoog komt een hert boven een koe en bijna boven een boer uit.
// Niets is gelijk: drie vellen (hert0 een roodbruine hinde, hert1 een grijsbruine, hert2 een hert met een
// gewei), elk met een eigen maat en eigen kleuren.
'use strict';
const { klem, mix, ruis3, TEGEL } = require('./kern.cjs');
const { model, kegel, bol, ellips, plus, naarRamp, geschaald } = require('./figuren.cjs');
const BV = require('./bosvijanden.cjs');
const V = require('./vee.cjs');

const { bochtProfiel, platteKegel, plukken, ruig } = BV;
const { pas, omhul } = BV.beweging;
// Eén poot van drie starre stukken naar zijn voet: die van de wolf, zoals bij de koe en het schaap.
const poot = BV.rig.wolfPoot;
const { beweeg, GROND, basis } = V.bouw;
const { standen } = V.rig;

// ---------------------------------------------------------------- maten van het spel

// Snelheden in tegels per seconde, per soort en per gang: de voeten schuiven er precies mee. Het spel moet
// ze overnemen (straks T.WILD in js/), anders glijden de voeten.
const SNELHEID = { hert: { lopen: 1.0, rennen: 4.0 } };
// Beelden per seconde van de loopcycli: één rondje is één pas van elke poot (lopen), of één sprong van het
// hele dier (rennen). Een hert doet stapvoets een rondje per seconde, en rent in anderhalve sprong per seconde.
const LOOP_FPS = { lopen: 8, rennen: 12 };

const HOUDINGEN = {
  grazen: { beelden: 8, fps: 5, herhaal: true },
  staan: { beelden: 8, fps: 5, herhaal: true },
  lopen: { beelden: 8, fps: LOOP_FPS.lopen, herhaal: true },
  rennen: { beelden: 8, fps: LOOP_FPS.rennen, herhaal: true },
  liggen: { beelden: 8, fps: 4, herhaal: true },
};
const faseVan = (houding, i) => i / HOUDINGEN[houding].beelden;
const fpsVan = (soort, houding) => HOUDINGEN[houding].fps;
// hoeveel tegels één pas is: het spel leidt de fase van de cyclus af uit de afgelegde afstand, en rekent in
// "passen" van een half rondje (js/sprites.js: cyclus = 2 × stap), net als bij het vee
const stapVan = (soort, houding) => +((SNELHEID[soort][houding] * (HOUDINGEN[houding].beelden / HOUDINGEN[houding].fps)) / 2).toFixed(3);

// Een cel: ruim genoeg voor het hert met zijn kop omhoog en zijn gewei (111 pixels boven de grond), voor een
// rennend dier dat zijn hals ver naar voren strekt (65 opzij), en voor het grazende hert met zijn gewei naar voren
// (71 opzij); gemeten met `node wild-anim.cjs --meet`. Het anker is het midden van de tegel, op de grond.
// naar-spel.cjs krimpt de cel per houding tot wat erin staat; wild-anim.cjs meldt het als iets tegen de rand komt.
const CELLEN = {
  hert: [160, 148, 80, 118],
};
const celVan = (soort) => CELLEN[soort];

// ---------------------------------------------------------------- bouwstenen

// een zachte piek op fase c met halve breedte w (een rondje is 1): 1 in het midden, 0 erbuiten. Zo is elk
// oor dat flikkert en elke hoef die even omhoog gaat een lus zonder een sprong.
const piek = (f, c, w) => {
  let d = f - c;
  d -= Math.round(d);
  return Math.abs(d) >= w ? 0 : 0.5 + 0.5 * Math.cos((Math.PI * d) / w);
};

// De kop in rust kijkt 30 graden onder de horizontaal. `kopPunt(d, h, x)` is een plek in de maten van de kop:
// d langs de as van de kop (naar de snuit), h loodrecht erop (omhoog), x opzij.
const KOP_HOEK = (30 * Math.PI) / 180;
const AS = [0, Math.cos(KOP_HOEK), -Math.sin(KOP_HOEK)];
const OP = [0, Math.sin(KOP_HOEK), Math.cos(KOP_HOEK)];
const POLL = [0, 33, 72];
const kopPunt = (d, h, x = 0) => [x, POLL[1] + AS[1] * d + OP[1] * h, POLL[2] + AS[2] * d + OP[2] * h];
// en terug: een plek in de maten van het model naar die van de kop, voor wat op de kop gekleurd wordt
const inKop = (y, z) => {
  const dy = y - POLL[1];
  const dz = z - POLL[2];
  return [dy * AS[1] + dz * AS[2], dy * OP[1] + dz * OP[2]];
};

// ---------------------------------------------------------------- het hert

// Draaipunten en poten in rust. De poten zijn [schouder, elleboog, pols, voet] en [heup, knie, hak, voet]: de
// voorpoot een bijna rechte zuil, de achterpoot knikt vooruit bij de knie en terug bij de hak. De poten zijn
// lang en dun: tot de buik is het 35 eenheden, van de 58 in de schoft.
const HERT = {
  rolAs: [0, -2, 46],
  nekVoet: [0, 17, 50],
  poll: POLL,
  kaakAs: kopPunt(3.4, -2.4),
  oor: (s) => kopPunt(-0.2, 3.1, s * 2.8),
  staartWortel: [0, -31.5, 52.5],
  staartMidden: [0, -35, 50.5],
  voor: (s) => [[s * 6.4, 20.5, 46.5], [s * 6, 16, 35.5], [s * 5.6, 19.6, 18.2], [s * 5.6, 20.6, 1.7]],
  achter: (s) => [[s * 6.2, -24.5, 46.5], [s * 6.8, -14.5, 33], [s * 5.6, -29.5, 21.2], [s * 5.4, -25.5, 1.7]],
  // zo staat het stil: niet netjes in het vierkant, een voorpoot een tikje vooruit
  stand: [[-5.6, 21.8, 1.7], [5.6, 19.8, 1.7], [-5.4, -26.2, 1.7], [5.4, -24.8, 1.7]],
  // lopen: de middens van de passen, hoe hoog een voet opkomt (voor, achter), hoe lang hij staat, en hoe ver
  // het schouderblad meegaat
  gang: { y: [20.6, 20.6, -25.5, -25.5], til: [7, 6], duur: 0.68, schouder: [0.5, 7] },
  // rennen: per voet (voor links, voor rechts, achter links, achter rechts) wanneer hij neerkomt, en hoe lang
  // hij staat. Eerst de achterpoten, dan de voorpoten, en tussen beide en erna zweeft het dier.
  ren: { y: [20.6, 20.6, -25.5, -25.5], til: [13, 11], land: [0.44, 0.5, 0, 0.06], duur: [0.27, 0.27, 0.3, 0.3], schouder: [0.55, 8] },
  // liggen: hoe ver het lijf zakt, hoe ver het op zijn rechterzij hangt, en waar de staart ligt
  lig: { zak: 33.2, rol: 5, staart: { zwaai: 12, til: 2, knik: 0, knikTil: 0 } },
  anim: {
    staanNek: 9, staanKop: 8, staanDraai: 16, oorVoor: -14, oorDraai: 22,
    graasNek: -109, graasKop: 54, graasDraai: 7, kauw: 5,
    loopNek: -12, loopKop: 20,
    rensNek: -28, rensKop: 53,
    ligNek: 8, ligKop: 6, ligDraai: -12,
  },
};

// De drie vellen. `schaal` is hoe groot het dier in het spel staat, tegen de maten waarin het hierboven gebouwd is
// (het hert met gewei is de maat zelf; de hindes zijn kleiner). `bouw`: hoe breed het lijf is, hoe dik de hals en
// hoe groot de oren, tegen die maat. De rest is wat er op elk dier anders uitziet: de kleur van de vacht, de lichte
// buik, de spiegel, de benen, het gezicht.
const HERT_KLEUREN = [
  {
    naam: 'roodbruin',
    geslacht: 'hinde',
    schaal: 0.9,
    bouw: { dik: 0.9, nek: 0.78, oor: 1.28, kop: 1 },
    vacht: { ramp: 'dak', lo: 1.1, hi: 5.4 },
    buik: { ramp: 'zand', lo: 2.2, hi: 6.1 },
    spiegel: { ramp: 'zand', lo: 3.0, hi: 6.6 },
    poot: { ramp: 'dak', lo: 0.8, hi: 4.7 },
    kop: { ramp: 'dak', lo: 1.0, hi: 5.2 },
    muil: { ramp: 'pleister', lo: 1.6, hi: 5.6 },
    binnenoor: { ramp: 'zand', lo: 1.8, hi: 5.4 },
  },
  {
    naam: 'grijsbruin',
    geslacht: 'hinde',
    schaal: 0.88,
    bouw: { dik: 0.88, nek: 0.76, oor: 1.24, kop: 1 },
    vacht: { ramp: 'schors', lo: 1.2, hi: 5.9 },
    buik: { ramp: 'perkament', lo: 1.5, hi: 5.4 },
    spiegel: { ramp: 'perkament', lo: 2.2, hi: 6.3 },
    poot: { ramp: 'schors', lo: 0.7, hi: 5.0 },
    kop: { ramp: 'schors', lo: 1.0, hi: 5.4 },
    muil: { ramp: 'pleister', lo: 1.4, hi: 5.4 },
    binnenoor: { ramp: 'perkament', lo: 1.4, hi: 5.2 },
  },
  {
    naam: 'met gewei',
    geslacht: 'hert',
    schaal: 1,
    bouw: { dik: 1, nek: 1.12, oor: 1.15, kop: 1.16 },
    vacht: { ramp: 'jas', lo: 0.9, hi: 4.6 },
    hals: { ramp: 'leer', lo: 0.7, hi: 4.8 },
    buik: { ramp: 'zand', lo: 1.6, hi: 5.6 },
    spiegel: { ramp: 'zand', lo: 2.8, hi: 6.4 },
    poot: { ramp: 'leer', lo: 0.6, hi: 4.6 },
    kop: { ramp: 'leer', lo: 0.9, hi: 5.0 },
    muil: { ramp: 'pleister', lo: 1.2, hi: 5.0 },
    binnenoor: { ramp: 'zand', lo: 1.4, hi: 5.0 },
  },
];

// ---------------------------------------------------------------- houdingen

// De houding als getallen, zoals bij het vee (`basis` in vee.cjs): lijf, nek en kop, kaak, oren (hoe ver elk oor naar
// achteren draait; negatief is naar voren), staart, voeten, schouder.
function houdingVan(houding, fase, schaal = 1) {
  const M = HERT;
  const A = M.anim;
  const B = basis(M);
  const a = 2 * Math.PI * fase;
  if (houding === 'staan') {
    // alert: de borst gaat op en neer, de kop kijkt eerst één kant op en dan de andere, de oren draaien om de
    // beurt, de staart tikt even, en een voorhoef komt omhoog
    B.lijf.schuif = [0, 0, 0.3 * Math.sin(2 * a)];
    B.lijf.kantel = 0.4 * Math.sin(2 * a + 0.5);
    B.nek.kantel = A.staanNek + 1.4 * Math.sin(a + 0.6);
    B.nek.draai = A.staanDraai * Math.sin(a - 0.3);
    B.kop.kantel = A.staanKop + 2 * Math.sin(a + 1.4);
    B.kop.draai = 5 * Math.sin(a + 0.9);
    B.oren = [A.oorVoor + A.oorDraai * Math.sin(a + 0.4), A.oorVoor + A.oorDraai * Math.sin(a - 1.3)];
    B.staart.zwaai = 16 * piek(fase, 0.62, 0.1) * Math.sin(a * 6);
    B.staart.til = 3 + 3 * piek(fase, 0.62, 0.12);
    const hoef = piek(fase, 0.8, 0.13);
    B.voeten[1] = { p: plus(M.stand[1], [0, 1.2 * hoef, 2.6 * hoef]), buig: -26 * hoef };
    return B;
  }
  if (houding === 'grazen') {
    // de kop tot op het gras; twee keer per rondje een ruk aan een pluk, en ondertussen zwaait de snuit langzaam
    // heen en weer. Een oor flikkert, de staart tikt.
    B.lijf.schuif = [0, 0.8, -2.4 + 0.3 * Math.sin(a)];
    B.lijf.kantel = -4;
    // en eens per rondje komt de kop even omhoog om rond te kijken, kauwend
    const op = piek(fase, 0.72, 0.2);
    B.nek.kantel = A.graasNek + 3 * Math.max(0, Math.sin(2 * a)) + 26 * op;
    B.nek.draai = A.graasDraai * Math.sin(a) + 8 * op;
    B.kop.kantel = A.graasKop - 5 * Math.max(0, Math.sin(2 * a - 0.5)) - 12 * op;
    B.kaak = A.kauw * (0.5 + 0.5 * Math.sin(2 * a + 1.2));
    B.kaakZij = 3 * Math.sin(2 * a + 2.4);
    B.oren = [6 + 3 * Math.sin(a + 1), 6 + 3 * Math.sin(a) + 38 * piek(fase, 0.3, 0.08)];
    B.staart.zwaai = 14 * Math.sin(a + 0.8) * (0.4 + 0.6 * piek(fase, 0.6, 0.3));
    B.staart.til = 5 + 3 * Math.sin(a);
    return B;
  }
  if (houding === 'lopen') {
    // Stapvoets: achter links, voor links, achter rechts, voor rechts, een kwart na elkaar. Een staande voet
    // schuift in precies het tempo van het spel naar achteren (SNELHEID, LOOP_FPS), in de maten van het model.
    const G = M.gang;
    const v = (SNELHEID.hert.lopen * TEGEL) / schaal;
    const rondje = HOUDINGEN.lopen.beelden / LOOP_FPS.lopen;
    const zwaai = v * G.duur * rondje;
    const land = [0.25, 0.75, 0, 0.5];
    for (let i = 0; i < 4; i++) {
      const [dy, dz, s] = pas(fase - land[i], G.duur, zwaai, i < 2 ? G.til[0] : G.til[1]);
      B.voeten[i] = { p: [M.stand[i][0], G.y[i] + dy, M.stand[i][2] + dz], buig: s < 0 ? 0 : (i < 2 ? -70 : -40) * Math.sin(Math.PI * s) };
      if (i < 2) B.schouder[i] = klem(dy * G.schouder[0], -G.schouder[1], G.schouder[1]);
    }
    // twee keer per rondje op en neer, een beetje wiegen van links naar rechts, en de kop knikt als een voorvoet
    // neerkomt; de oren staan voor het luisteren
    B.lijf.schuif = [0, 0, -0.7 + 0.55 * Math.cos(4 * Math.PI * (fase - 0.1))];
    B.lijf.rol = 1.2 * Math.sin(a);
    B.nek.kantel = A.loopNek - 2.6 * Math.cos(4 * Math.PI * (fase - 0.25));
    B.nek.draai = 3 * Math.sin(a + 0.5);
    B.kop.kantel = A.loopKop + 1.5 * Math.cos(4 * Math.PI * (fase - 0.25));
    B.oren = [-4 + 5 * Math.sin(a + 0.3), -4 + 5 * Math.sin(a + 2.2)];
    B.staart.zwaai = 8 * Math.sin(a + 1.4);
    B.staart.til = 4;
    return B;
  }
  if (houding === 'rennen') {
    // In sprongen: eerst komen de achterpoten neer en duwen af, dan de voorpoten, en daartussen en erna zweeft
    // het dier met alle vier de poten van de grond. Een staande voet schuift ook hier precies met de snelheid
    // van het spel naar achteren; de poot zwaait daarna in een boog naar voren.
    const R = M.ren;
    const v = (SNELHEID.hert.rennen * TEGEL) / schaal;
    const rondje = HOUDINGEN.rennen.beelden / LOOP_FPS.rennen;
    for (let i = 0; i < 4; i++) {
      const zwaai = v * R.duur[i] * rondje;
      const [dy, dz, s] = pas(fase - R.land[i], R.duur[i], zwaai, i < 2 ? R.til[0] : R.til[1]);
      B.voeten[i] = { p: [M.stand[i][0], R.y[i] + dy, M.stand[i][2] + dz], buig: s < 0 ? 0 : (i < 2 ? -85 : -50) * Math.sin(Math.PI * s) };
      if (i < 2) B.schouder[i] = klem(dy * R.schouder[0], -R.schouder[1], R.schouder[1]);
    }
    // twee keer per rondje omhoog (gestrekt en gebald), het lijf wiegt als een schommelpaard, de hals
    // strekt zich naar voren en gaat mee met de sprong, de oren liggen plat, de staart staat omhoog
    B.lijf.schuif = [0, 0, -2.2 + 2.6 * Math.cos(4 * Math.PI * (fase - 0.4)) + 1.3 * Math.cos(2 * Math.PI * (fase - 0.88))];
    B.lijf.kantel = 6 * Math.sin(a - 0.3);
    B.lijf.rol = 1.5 * Math.sin(a + 0.4);
    B.nek.kantel = A.rensNek + 5 * Math.sin(a - 0.5);
    B.nek.draai = 2 * Math.sin(a);
    B.kop.kantel = A.rensKop - 5 * Math.sin(a - 0.5);
    B.oren = [52, 52];
    B.spiegel = 1.3;
    B.staart.til = 44 + 5 * Math.sin(a + 1);
    B.staart.zwaai = 4 * Math.sin(a + 0.6);
    return B;
  }
  if (houding === 'liggen') {
    // neergevlijd op de borst, een beetje op één zij; de kop omhoog, rustig ademen en herkauwen, de kop wat opzij
    // om te luisteren, en een oor dat draait
    B.ligt = true;
    B.lijf.schuif = [0, 0, -M.lig.zak + 0.3 * Math.sin(2 * a)];
    B.lijf.rol = M.lig.rol;
    B.nek.kantel = A.ligNek + 1.4 * Math.sin(a + 0.5);
    B.nek.draai = A.ligDraai + 9 * Math.sin(a - 0.4);
    B.kop.kantel = A.ligKop + 2 * Math.sin(a + 1.1);
    B.kaak = 6 * (0.5 + 0.5 * Math.sin(2 * a));
    B.kaakZij = 3 * Math.sin(2 * a + 1.2);
    B.oren = [-6 + 5 * Math.sin(a + 0.3) + 30 * piek(fase, 0.3, 0.09), -6 + 5 * Math.sin(a - 1.5)];
    B.staart = { ...M.lig.staart };
    return B;
  }
  throw new Error('onbekende houding: ' + houding);
}

// ---------------------------------------------------------------- materialen

// Een lichtere kleur op een plek: de stap blijft dezelfde stap van de schaduw naar het licht, maar op het ramp van de
// lichte kleur.
const lichter = (stap, van, naar) => naarRamp(naar.ramp, stap, [van.lo, van.hi], [naar.lo, naar.hi]);

function hertMaterialen(kleur, P) {
  const M = { lijf: 0, kop: 1, poot: 2, staart: 3, snuit: 4, oog: 5, neusgat: 6, hoef: 7, oor: 8, hals: 9, gewei: 10 };
  const mat = [];
  const v = kleur.vacht;
  const isHert = kleur.geslacht === 'hert';
  const open = P.spiegel || 1; // bij het rennen staat de spiegel wijd open
  const hals = kleur.hals || v;
  // het lijf: een lichte buik en lichte binnenkant van de dijen, een donkere streep over de rug, en achteraan de
  // spiegel: een lichte vlek rond de staart. Bij het hert met gewei loopt de donkere hals uit over de schouders.
  mat[M.lijf] = {
    ramp: v.ramp,
    lo: v.lo,
    hi: v.hi,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const sx = x / (6.6 * open);
      const sz = (z - 50.6) / (8.8 * open);
      if (y < -27 && sx * sx + sz * sz < 1 + 0.18 * ruis3(x * 0.45, z * 0.45, 3, 11)) return lichter(stap, v, kleur.spiegel);
      const rand = 40.2 + 1.5 * ruis3(x * 0.2 + 1.3, y * 0.13, z * 0.2, 17);
      if (z < rand || nz < -0.55) return lichter(stap, v, kleur.buik);
      if (isHert && y > 15 + 5 * ruis3(x * 0.22 + 2, z * 0.22, 5, 23)) return lichter(stap, v, hals);
      return Math.abs(x) < 1.7 && nz > 0.75 && y > -30 ? -0.7 : 0;
    },
  };
  // de hals: bij het hert met gewei donker en met haar (de manen), anders van de kleur van het lijf met een lichte keel
  mat[M.hals] = {
    ramp: hals.ramp,
    lo: hals.lo,
    hi: hals.hi,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      if (!isHert && nz < -0.35) return lichter(stap, hals, kleur.buik);
      return isHert ? plukken(x, y, z, [0.5, 0.3, 0.16], 29, 0.6) : 0;
    },
  };
  // de poten: boven van de kleur van het lijf, onder donkerder, de binnenkant van de dijen licht
  const p = kleur.poot;
  mat[M.poot] = {
    ramp: v.ramp,
    lo: v.lo,
    hi: v.hi,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      if (z > 24 && (x * nx < -0.3 || nz < -0.35)) return lichter(stap, v, kleur.buik);
      if (z < 22 + 3 * ruis3(x * 0.3, y * 0.3, z * 0.15, 31)) return lichter(stap, v, p);
      return 0;
    },
  };
  // staart: kort, de kleur van het lijf, met een lichte onderkant
  mat[M.staart] = {
    ramp: v.ramp,
    lo: v.lo,
    hi: v.hi,
    patroon: (x, y, z, nx, ny, nz, stap) => (nz < -0.2 ? lichter(stap, v, kleur.spiegel) : -0.5),
  };
  // kop: donkerder voorhoofd en neusrug, lichte lippen en snuit, een lichte keel
  const k = kleur.kop;
  mat[M.kop] = {
    ramp: k.ramp,
    lo: k.lo,
    hi: k.hi,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const [d, h] = inKop(y, z);
      if (d > 14.5 || (d > 8 && h < -1.4 && Math.abs(x) < 2.6)) return lichter(stap, k, kleur.muil);
      if (h < -2.2 - Math.max(0, d - 5) * 0.4 && d < 12) return lichter(stap, k, kleur.buik);
      // een lichte ring om het oog
      const ox = Math.abs(x) - 3.1;
      if (ox * ox + (d - 6.7) * (d - 6.7) + (h - 1.7) * (h - 1.7) < (isHert ? 3.2 : 3.6)) return lichter(stap, k, kleur.muil);
      return nz > 0.5 ? -0.4 : 0;
    },
  };
  mat[M.snuit] = { ramp: 'inkt', lo: 0.4, hi: 2.4, glans: 1.2, rand: 0.4 };
  mat[M.oog] = { ramp: 'inkt', lo: 0.2, hi: 2.2, glans: 2.2, detail: true, rand: 0 };
  mat[M.neusgat] = { ramp: 'inkt', lo: 0, hi: 1.2, detail: true, rand: 0, schaduw: false };
  mat[M.hoef] = { ramp: 'vacht', lo: 0.1, hi: 2.1, rand: 0.4 };
  // oren: de buitenkant van de kleur van de kop, de binnenkant (naar voren) licht en de rand donker
  const bo = kleur.binnenoor;
  mat[M.oor] = {
    ramp: k.ramp,
    lo: k.lo,
    hi: k.hi,
    patroon: (x, y, z, nx, ny, nz, stap) => (ny > 0.3 ? lichter(stap, k, bo) : -0.5),
  };
  // gewei: bot, aan de voet donker en bruin, naar de punten toe licht
  mat[M.gewei] = {
    ramp: 'bot',
    lo: 0.6,
    hi: 4.6,
    rand: 0.6,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const [d, h] = inKop(y, z);
      if (h < 7.5) return naarRamp('leer', stap, [0.6, 4.6], [0.8, 4.6]);
      return h > 15 ? 1 : 0;
    },
  };
  return { M, mat };
}

// ---------------------------------------------------------------- het gewei

// Het gewei van het hert: aan elke kant een stam die eerst naar buiten en omhoog gaat, en dan naar voren buigt, met
// een ogentak, een ijsvogeltak, een middentak en bovenaan een kroon van drie punten. In de maten van de kop.
function gewei(s, M, D) {
  const delen = [];
  const voet = kopPunt(2, 3.6, s * 2.5);
  const midden = kopPunt(-3.2, 11.5, s * 8.6);
  const top = kopPunt(3.8, 22.5, s * 7.4);
  const punt = (t) => [0, 1, 2].map((i) => (1 - t) * (1 - t) * voet[i] + 2 * (1 - t) * t * midden[i] + t * t * top[i]);
  // de roos aan de voet en de stam
  delen.push(ellips(voet, [2.9, 2.9, 2.1], M.gewei, D.gewei, 0.8));
  for (const p of bochtProfiel(voet, midden, top, (t) => mix(2.1, 0.9, t), 7, M.gewei, D.gewei, 0.7)) delen.push(p);
  // een tak: van een plek op de stam in een richting in de maten van de kop (d, h, x)
  const tak = (t, [rd, rh, rx], lengte, r) => {
    const a = punt(t);
    const richting = [rx * s, AS[1] * rd + OP[1] * rh, AS[2] * rd + OP[2] * rh];
    const l = Math.hypot(...richting);
    return kegel(a, plus(a, richting.map((c) => (c / l) * lengte)), r, r * 0.3, M.gewei, D.gewei, 0.5);
  };
  delen.push(tak(0.06, [1, -0.15, 0.1], 9.5, 1.5)); // de ogentak: naar voren over het gezicht
  delen.push(tak(0.26, [1, 0.45, 0.12], 8.5, 1.3)); // de ijsvogeltak
  delen.push(tak(0.5, [1, 0.75, 0.1], 7.8, 1.2)); // de middentak
  delen.push(tak(1, [0.1, 1, 0.12], 7, 1.05)); // de kroon: omhoog,
  delen.push(tak(1, [1, 0.5, -0.3], 7, 1.05)); // naar voren
  delen.push(tak(1, [-0.8, 0.7, 0.7], 6.4, 1)); // en naar achteren en buiten
  return delen;
}

// ---------------------------------------------------------------- het hert bouwen

// hert({ houding, fase, kleur }): kleur 0 de roodbruine hinde, 1 de grijsbruine, 2 het hert met gewei. Zonder
// houding staat het.
function hert(o = {}) {
  const kleur = HERT_KLEUREN[(o.kleur || 0) % HERT_KLEUREN.length];
  const P = houdingVan(o.houding || 'staan', o.fase || 0, kleur.schaal);
  const T = standen(P, HERT);
  const { M, mat } = hertMaterialen(kleur, P);
  const D = { lijf: 1, kop: 2, voorL: 3, voorR: 4, achterL: 5, achterR: 6, staart: 7, oorL: 8, oorR: 9, gewei: 10, hals: 11 };
  const L = (d) => beweeg(d, T.lijf);
  const N = (d) => beweeg(d, T.nek);
  const K = (d) => beweeg(d, T.kop);
  const isHert = kleur.geslacht === 'hert';
  const { dik, nek, oor: oorMaat, kop: kopDik } = kleur.bouw;
  const delen = [];

  // --- romp: slank, een diepe borst, een opgetrokken flank, een rechte rug met de schoft en de ronde kruin
  delen.push(L(ellips([0, 14, 45], [7.8 * dik, 13.5, 11.4], M.lijf, D.lijf)));
  delen.push(L(ellips([0, -4, 45.6], [7.4 * dik, 15, 10.2], M.lijf, D.lijf, 6)));
  delen.push(L(ellips([0, -22, 46], [7.8 * dik, 11.5, 10.6], M.lijf, D.lijf, 6)));
  delen.push(L(kegel([0, 19, 52], [0, -28, 52.2], 4.8 * dik, 5 * dik, M.lijf, D.lijf, 5)));
  delen.push(L(ellips([0, 17, 52.5], [4.6 * dik, 7, 5.2], M.lijf, D.lijf, 3)));
  for (const s of [-1, 1]) delen.push(L(bol([s * 6.4 * dik, -19, 54], 2.4, M.lijf, D.lijf, 2.5)));

  // --- hals: lang, bij het hert dik en ruig (de manen), met een diepe voet
  const dikHals = (d) => (isHert ? ruig(d, [0.5, 0.3, 0.42], 5, 1.2) : d);
  delen.push(N(dikHals(kegel([0, 16, 47.5], [0, 31, 69.5], 7.4 * nek, 3.9 * nek, M.hals, D.lijf, 5))));
  delen.push(N(kegel([0, 21, 44], [0, 29, 60], 5.2 * nek, 3 * nek, M.hals, D.lijf, 4)));

  // --- kop: een lang gezicht dat smaller wordt, een donkere neus, een slanke onderkaak
  delen.push(K(kegel(kopPunt(0.5, 0.5), kopPunt(9.5, -0.2), 4.1 * kopDik, 3 * kopDik, M.kop, D.kop, 3)));
  delen.push(K(kegel(kopPunt(8.5, -0.5), kopPunt(18.2, -0.9), 2.8 * kopDik, 2.1 * kopDik, M.kop, D.kop, 2)));
  delen.push(K(ellips(kopPunt(19.2, -0.9), [1.9 * kopDik, 1.7, 1.5 * kopDik], M.snuit, D.kop, 1.2)));
  delen.push(beweeg(kegel(kopPunt(3.4, -3), kopPunt(16.5, -2.9), 2.6 * kopDik, 1.4 * kopDik, M.kop, D.kop, 1.5), T.kaak));
  for (const s of [-1, 1]) {
    delen.push(K(ellips(kopPunt(5, -1.6, s * 2.2 * kopDik), [2.2, 3.6, 2.6 * kopDik], M.kop, D.kop, 2)));
    delen.push(K(bol(kopPunt(6.7, 1.7, s * 3.1), 1.15, M.oog, D.kop)));
    delen.push(K(bol(kopPunt(19.3, 0.2, s * 1.2), 0.5, M.neusgat, D.kop)));
    // oren: groot, in het midden het breedst, omhoog en opzij; de holte naar voren
    const wortel = HERT.oor(s);
    const mid = plus(wortel, [s * 3.9 * oorMaat, -1, 4.2 * oorMaat]);
    const tip = plus(wortel, [s * 7.9 * oorMaat, -2.2, 8.2 * oorMaat]);
    const bron = s < 0 ? T.oorL : T.oorR;
    const deel = s < 0 ? D.oorL : D.oorR;
    delen.push(beweeg(platteKegel(wortel, mid, 1.6, 3 * oorMaat, [s * 0.7, 0.7, 0.1], 0.42, M.oor, deel, 0.8), bron));
    delen.push(beweeg(platteKegel(mid, tip, 3 * oorMaat, 0.5, [s * 0.7, 0.7, 0.1], 0.42, M.oor, deel, 0.8), bron));
    if (isHert) for (const d of gewei(s, M, D)) delen.push(K(d));
  }

  // --- poten: lang en dun, met een knobbel voor de knie en de hak
  for (const s of [-1, 1]) {
    const dv = s < 0 ? D.voorL : D.voorR;
    const da = s < 0 ? D.achterL : D.achterR;
    const [S, E, W, Vc] = HERT.voor(s);
    const [Hp, Kn, Hk, Ac] = HERT.achter(s);
    if (P.ligt) {
      delen.push(...hertGevouwen(s, S, Hp, M, dv, da, dik).map(L));
      continue;
    }
    const voor = [
      [kegel(S, E, 5 * dik, 3.2, M.poot, dv, 3.5)],
      [kegel(E, W, 2.9, 1.9, M.poot, dv, 1.2), bol(W, 2.15, M.poot, dv, 1)],
      [kegel(W, plus(Vc, [0, -0.2, 1.6]), 1.7, 1.35, M.poot, dv, 0.8), ellips(Vc, [1.75, 2.6, 1.6], M.hoef, dv, 0.8)],
    ];
    const achter = [
      [kegel(Hp, Kn, 6.8 * dik, 3.8, M.poot, da, 4.5)],
      [kegel(Kn, Hk, 3.6, 1.9, M.poot, da, 1.2), bol(plus(Hk, [0, -0.8, 0.4]), 2.1, M.poot, da, 1)],
      [kegel(Hk, plus(Ac, [0, 0.2, 1.6]), 1.7, 1.35, M.poot, da, 0.8), ellips(Ac, [1.75, 2.6, 1.6], M.hoef, da, 0.8)],
    ];
    const tv = poot(T, P, s < 0 ? 0 : 1, [S, E, W, Vc], true);
    const ta = poot(T, P, s < 0 ? 2 : 3, [Hp, Kn, Hk, Ac], false);
    voor.forEach((stuk, j) => delen.push(...stuk.map((d) => beweeg(d, tv[j]))));
    achter.forEach((stuk, j) => delen.push(...stuk.map((d) => beweeg(d, ta[j]))));
  }

  // --- staart: kort en dik aan de wortel, midden in de spiegel
  for (const p of bochtProfiel(HERT.staartWortel, [0, -35.5, 52], [0, -38.6, 47.8], (t) => mix(2.8, 1.5, t), 3, M.staart, D.staart, 1)) delen.push(beweeg(p, T.staart1));

  if (P.ligt) delen.push(GROND);
  return geschaald(model(delen, mat, omhul(delen)), kleur.schaal);
}

// De poten van een liggend hert, in de maten van het lijf (dat daarna gezakt en gekanteld wordt): voor gevouwen onder
// de borst, met de knie vooruit op de grond en de pijp terug eronder; achter ligt de bovenste poot (links) naast de buik,
// de hak naar achteren en de voet naar voren, en van de onderste steekt alleen de hak en de voet uit.
function hertGevouwen(s, S, Hp, M, dv, da, dik) {
  const g = HERT.lig.zak; // de grond, in de maten van het lijf
  const E = [s * 7.6, 15, g + 3.6];
  const W = [s * 6.8, 31, g + 2.4];
  const Vc = [s * 4.8, 21, g + 1.7];
  const delen = [
    kegel(S, E, 5 * dik, 3.3, M.poot, dv, 3.5),
    kegel(E, W, 2.9, 2.1, M.poot, dv, 1.2),
    kegel(W, Vc, 1.9, 1.5, M.poot, dv, 0.8),
    ellips(plus(Vc, [0, -0.8, 0]), [1.75, 2.5, 1.5], M.hoef, dv, 0.8),
  ];
  if (s < 0) {
    const Kn = [-12, -9, g + 7];
    const Hk = [-13.5, -31, g + 3];
    const Ac = [-14.5, -12, g + 1.7];
    delen.push(
      kegel(Hp, Kn, 6.8 * dik, 4, M.poot, da, 4.5),
      kegel(Kn, Hk, 3.6, 2.1, M.poot, da, 1.2),
      bol(plus(Hk, [0, -1, 0.4]), 2.1, M.poot, da, 1),
      kegel(Hk, plus(Ac, [0, -1.5, 0]), 1.7, 1.45, M.poot, da, 0.8),
      ellips(Ac, [1.75, 2.5, 1.5], M.hoef, da, 0.8),
    );
  } else {
    const Hk = [11, -33.5, g + 2.6];
    const Ac = [12.5, -19, g + 1.6];
    delen.push(
      kegel(Hp, [10, -19, g + 6], 6.6 * dik, 4.2, M.poot, da, 4.5),
      bol(Hk, 2.1, M.poot, da, 2),
      kegel(Hk, plus(Ac, [0, -1.5, 0]), 1.7, 1.45, M.poot, da, 0.8),
      ellips(Ac, [1.75, 2.5, 1.5], M.hoef, da, 0.8),
    );
  }
  return delen;
}

// ---------------------------------------------------------------- alle vellen

// Welke vellen er zijn: hert0, hert1 en hert2, zoals de koeien koe0..2 hebben. Later komen het wilde zwijn en de
// beer hier bij, elk met zijn eigen soort.
const VELLEN = HERT_KLEUREN.map((k, i) => ({ naam: `hert${i}`, soort: 'hert', kleur: i, kleurNaam: k.naam, maak: (o) => hert({ ...o, kleur: i }) }));

module.exports = {
  hert,
  VELLEN,
  HERT_KLEUREN,
  HOUDINGEN,
  SNELHEID,
  LOOP_FPS,
  faseVan,
  fpsVan,
  stapVan,
  CELLEN,
  celVan,
  // het binnenwerk, om na te rekenen dat voeten niet glijden en poten hun doel halen
  rig: { houdingVan, HERT, kopPunt },
};
