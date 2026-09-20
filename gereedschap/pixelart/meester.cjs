// De oude meester: de leermeester van de held, van dezelfde school als de tovenaar maar veertig
// jaar verder (ontwerp/verhaal.md, "De oude meester"). Hij doet de tutorial en sterft aan het
// eind ervan, dus de speler kijkt lang naar hem: zijn gezicht moet leesbaar blijven.
//
// Zelfde bouwwijze als de tovenaar (zie figuren.cjs): een klein 3D-model van bouwstenen (SDF's),
// door kern.cjs uit acht richtingen gefotografeerd. Anders dan de tovenaar heeft hij geen
// leeftijdbereik: hij is altijd tegen de honderd, dus `meester(stand)` neemt maar één argument
// (net als `wim(stand)` in figuren2.cjs), geen apart leeftijdsgetal.
//
// Wat hem anders maakt dan de tovenaar (ontwerp/verhaal.md, "De oude meester"): een wijnrood
// gewaad (de rood-ramp, niet gewaad), de punt van zijn hoed helemaal omgezakt tot over zijn
// schouder, een baard tot op zijn riem, een kromme staf met een steen in een klauw in plaats van
// een gladde gloeiende bol, en krommer dan de tovenaar op zijn 99e, leunend op zijn staf als een
// stok — en daardoor ook wat lager, zo'n 82 in plaats van 88 pixels.
'use strict';
const { sdf, klem, mix } = require('./kern.cjs');
const { model, kegel, bol, ellips, bochtKegel, plus, naarRamp } = require('./figuren.cjs');
const HH = require('./houding.cjs');

// Overgenomen uit figuren.cjs (niet geëxporteerd): de grensbol om een rok die door de benen is
// uitgerekt of uitgezakt. Ongewijzigd t.o.v. de tovenaar, dezelfde rok-techniek.
function rokGrens(benen, rokTop, wijd) {
  let voor = 14.6 + wijd;
  let achter = -13.4 - wijd;
  for (const b of benen || []) {
    voor = Math.max(voor, b.knie[1] + 6.5);
    achter = Math.min(achter, b.knie[1] - 6.5);
  }
  const r = Math.max(16.8 + wijd, (voor - achter) / 2);
  return [0, (voor + achter) / 2, rokTop / 2, Math.hypot(r, rokTop / 2) + 3];
}

// ---------------------------------------------------------------- maten (vast, geen leeftijd)

// Krommer dan de tovenaar op zijn 99e: diens "krom" loopt van 0,25 naar 1 op zijn honderdste (zie
// figuren.cjs); hier ligt hij vast hoger dan dat. Dezelfde formules voor schouder- en
// hoofdmidden als bij de tovenaar, gewoon met die hogere waarde.
const KROM = 1.3;
const S = [0, 2.5 + 4 * KROM, 61 - 3.5 * KROM]; // midden tussen de schouders
const H = [0, 5 + 7.5 * KROM, 71.5 - 5.5 * KROM]; // midden van het hoofd
const HEUP = [0, 1, 40]; // heuphoogte: ongewijzigd, het krommen zit in de romp, niet in de benen
const NEK = [0, S[1], S[2] + 2];
const KIN = plus(H, [0, 4.2, -6.4]);
const RAND = plus(H, [0, -0.6, 7.6]); // rand van de hoed: iets hoger dan bij de tovenaar, ruimte voor het gezicht eronder

const MANTEL_ONDER = S[2] - 9.5;
const MANTEL_TOP = S[2] + 6.5;
const RIEM_Z = 41.5; // een sober koord, geen sjerp met kwastjes: hij is de leermeester, niet de avonturier
const BAARD_LEN = 24; // langer dan de tovenaar (19 op zijn 84e): tot op zijn riem
const STEEN_R = 3.4;

// De kromme staf: een stok om op te leunen, geen rechte staf naast hem. Vijf punten langs de as,
// met een bocht erin; het greeppunt ligt op borsthoogte, de klauw ruim buiten zijn silhouet op
// schouderhoogte (niet erboven, anders komt hij naast zijn hoofd te hangen).
const STAF_ONDER = [-13, 15, 0];
const STAF_KNIK1 = [-17.5, 10.5, 22];
const STAF_GRIP = [-13, 16.5, 49];
const STAF_KNIK2 = [-16.5, 13, 57];
const STAF_TOP = [-18.5, 13.5, 63]; // middelpunt van de steen
const GREEP = STAF_GRIP[2];
const STAF_PAD = [STAF_ONDER, STAF_KNIK1, STAF_GRIP, STAF_KNIK2, STAF_TOP];
// Waar de as van de staf zit op hoogte z (voor de botten): stuksgewijs langs STAF_PAD, want de
// staf is krom en dus geen rechte lijn zoals bij de tovenaar (die had genoeg aan twee punten).
function stafAs(z) {
  for (let i = 0; i < STAF_PAD.length - 1; i++) {
    const a = STAF_PAD[i];
    const b = STAF_PAD[i + 1];
    if (z <= b[2] || i === STAF_PAD.length - 2) {
      const t = b[2] === a[2] ? 0 : klem((z - a[2]) / (b[2] - a[2]), 0, 1);
      return [mix(a[0], b[0], t), mix(a[1], b[1], t), z];
    }
  }
  return STAF_PAD[0];
}

// Loopsnelheid in tegels per seconde: trager dan de tovenaar op zijn traagst (1,8 op zijn 99e),
// want hij loopt op een stok.
const MEESTER_SNELHEID = 1.55;

const richting = (a, b) => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l, (b[2] - a[2]) / l];
};

// ---------------------------------------------------------------- rusthouding en houdingen

// Alles op nul is de stilstaande figuur. Zelfde vorm als rustTovenaar in figuren.cjs, met "bol"
// vervangen door "steen" (hij gloeit zelf niet als een bol, maar er zit licht ín de steen).
const rustMeester = () => ({
  zak: 0,
  zij: 0,
  voor: 0,
  romp: { buig: 0, hel: 0, draai: 0, omhoog: 0 },
  nek: { knik: 0, hel: 0, draai: 0 },
  baard: { zwaai: 0, hel: 0 },
  hoed: { kantel: 0, hel: 0, dp: [0, 0, 0] },
  staf: { omZ: 0, kantel: 0, hel: 0, dp: [0, 0, 0], greep: 0, los: false },
  handL: null, // null: de linkerhand steunt op de staf, zijn stok
  handR: null,
  voet: [{ y: 0, z: 0, hoek: 0 }, { y: 0, z: 0, hoek: 0 }],
  rok: { hoog: 0, wijd: 0, zoom: 0 },
  steen: { gloed: 0, straal: 0, licht: 1 },
  val: null,
  knielt: false,
});

// Dezelfde zes houdingen als de tovenaar (zie ontwerp/beeld.md); de bouwfunctie hieronder kan ze
// allemaal aan. De animaties zelf worden hier nog niet gerenderd (dat is aan
// animaties-export.cjs) — dit is alvast het houdingwerk ervoor, per opdracht met één los beeld
// per houding gecontroleerd (zie meester-export.cjs).
function houdingMeester(stand) {
  const naam = typeof stand === 'string' ? stand : stand && stand.houding;
  if (!naam) return null;
  const fase = (typeof stand === 'object' && stand.fase) || 0;
  const h = rustMeester();
  const rij = (r) => HH.langsRij(r, fase);
  switch (naam) {
    // Ademen: een klein wiegen. De baard deint na, de omgezakte punt van de hoed zwaait zacht
    // mee en de steen gloeit heel even flauw op, alsof hij hem in gedachten aanraakt.
    case 'staan': {
      const adem = rij([0, 1, 1, 0, 0]);
      const na = rij([0, 0, 1, 1, 0]);
      h.romp.omhoog = adem;
      h.nek.knik = -1 * adem;
      h.baard.zwaai = -1.6 * na;
      h.hoed.dp = [0, -0.7 * na, 0];
      h.handR = [0, -0.4 * na, 0.3 * adem];
      const klop = rij([0, 0.5, 1, 0.4, 0]);
      h.steen.gloed = 0.35 * klop;
      h.steen.licht = 1 + 0.06 * klop;
      break;
    }
    // Een schuifelpas op de plaats: hij steunt zijn gewicht op de stok, de vrije hand zwaait
    // amper mee. Trager en korter dan de tovenaar, ook op diens oudst.
    case 'lopen': {
      const v = MEESTER_SNELHEID * HH.PER_TEGEL;
      const T = 0.95;
      const steun = 0.62;
      const til = 2.2;
      const R = HH.loopVoet(fase, { v, T, steun, til, hiel: 5, hak: 7 });
      const L = HH.loopVoet(fase, { v, T, steun, til, hiel: 5, hak: 7, verzet: 0.5 });
      h.voet = [
        { y: L.y - 2.4, z: L.z, hoek: L.hoek },
        { y: R.y - 2.4, z: R.z, hoek: R.hoek },
      ];
      h.rok.zoom = 1.2;
      h.zak = (0.6 * (1 + HH.cosinus(2 * fase))) / 2;
      h.zij = 0.6 * HH.sinus(fase);
      h.romp.buig = 1.5 + 0.7 * HH.cosinus(2 * fase);
      h.romp.draai = 1.8 * HH.sinus(fase);
      h.nek.knik = -0.3 * h.romp.buig;
      h.baard.zwaai = 1.5 * HH.sinus(2 * fase - 0.18);
      h.hoed.dp = [0, -0.9 * HH.sinus(2 * fase), 0];
      // de stok tikt licht mee; hij blijft verder waar hij hem plant, zijn gewicht steunt erop
      h.staf.dp = [0, 0.7 * HH.cosinus(fase), 1 * Math.max(0, HH.sinus(fase))];
      h.handR = [0, -2.2 * HH.cosinus(fase), 0.5 * HH.sinus(fase)];
      break;
    }
    // Slaan met de staf: kost geen jaren. Hij grijpt hoger op de schacht om uit te halen, net
    // als de tovenaar, maar de zwaai is korter: hij kan zijn steun niet ver kwijt.
    case 'slaan': {
      const schuif = rij([0, -3, -6, -9, -8, -3]);
      h.staf.greep = schuif;
      h.staf.omZ = GREEP + schuif;
      h.staf.kantel = rij([-6, -26, -13, 58, 45, 7]);
      h.staf.dp = [0, rij([0, -2, 0, 4, 3, 1]), rij([0, 3, 5, 1, 1, 0])];
      h.romp.buig = rij([0, -5, -2, 9, 6, 1]);
      h.romp.draai = rij([0, -6, -3, 5, 4, 1]);
      h.zak = rij([0, 0.3, 0, 1.6, 1, 0.2]);
      h.nek.knik = rij([0, -4, -2, 6, 4, 1]);
      h.handR = [rij([0, 1.5, 3, 4, 3, 1]), rij([0, -2, -1.5, 3, 2, 1]), rij([0, 3, 5, 1.5, 1, 0])];
      h.baard.zwaai = rij([0, 4, 2, -5, -3, -1]);
      h.voet = [
        { y: rij([0, -1, 0, 1.3, 0.8, 0.1]), z: 0, hoek: 0 },
        { y: rij([0, -1, -0.7, 0.7, 0.3, 0]), z: 0, hoek: rij([0, -3, -1, 2, 1, 0]) },
      ];
      break;
    }
    // Een spreuk: de steen in de klauw licht op, bleek in plaats van vuurkleurig — een gloed van
    // binnenuit in plaats van de tovenaars gladde, vurige bol.
    case 'spreuk': {
      const schuif = rij([0, 1, 2.5, 2.5, 1.5, 0]);
      h.staf.greep = schuif;
      h.staf.omZ = GREEP + schuif;
      h.staf.kantel = rij([0, -4, -9, -11, -6, -1]);
      h.staf.dp = [rij([0, 1, 1, 1, 0, 0]), rij([0, -1, -3, -2, -1, 0]), rij([0, 4, 9, 10, 5, 1])];
      h.romp.buig = rij([0, -3, -5, 5, 3, 0]);
      h.nek.knik = rij([0, -4, -6, 2, 1, 0]);
      h.handR = [rij([0, 1, 3, 5, 3, 1]), rij([0, 2, 4, 8, 5, 1]), rij([0, 3, 6, 5, 2, 0])];
      h.baard.zwaai = rij([0, -2, -4, 3, 1, 0]);
      h.steen.gloed = rij([0.3, 1, 2, 3, 1.4, 0.4]);
      h.steen.straal = rij([0.1, 0.35, 0.85, 1.3, 0.6, 0.15]);
      h.steen.licht = rij([1, 1.25, 1.7, 2.2, 1.4, 1.05]);
      break;
    }
    // Terugdeinzen: net als de tovenaar krimpt hij ineen, maar hij klemt zich meteen aan de staf
    // vast in plaats van weg te stappen — zijn steun is zijn eerste houvast.
    case 'geraakt': {
      h.romp.buig = rij([-8, -5, -2]);
      h.romp.draai = rij([-4, -3, -1]);
      h.nek.knik = rij([-6, -4, -1]);
      h.zak = rij([1.2, 0.8, 0.2]);
      h.baard.zwaai = rij([5, 3, 1]);
      h.handR = [rij([2, 1.5, 0.5]), rij([-3, -2, -1]), rij([4, 3, 1])];
      h.staf.kantel = rij([-4, -3, -1]);
      h.voet = [
        { y: -1, z: 0, hoek: 0 },
        { y: rij([-1.8, -1.2, -0.3]), z: 0, hoek: 0 },
      ];
      break;
    }
    // Sterven op zijn honderdste, aan zijn eigen laatste spreuk: waardig, niet gewelddadig. Het
    // gewaad zakt tot een hoop stof, hij kantelt op zijn zij, en de stok glijdt pas op het eind
    // uit zijn hand: tot dan probeert hij zich er nog aan vast te houden.
    case 'sterven': {
      h.knielt = true;
      const zak = rij([0, 1.2, 6, 13, 19, 23, 25.5, 26]);
      h.zak = zak;
      h.rok.hoog = zak * 1.02;
      h.rok.wijd = rij([0, 0.4, 2, 4.4, 6.6, 8, 8.8, 9.2]);
      h.romp.buig = rij([2, 4, 8, 14, 17, 15, 12, 10]);
      h.romp.hel = rij([0, 1, 5, 16, 40, 66, 82, 87]);
      h.nek.knik = rij([-4, -2, 2, 6, 8, 7, 5, 4]);
      h.baard.zwaai = rij([-2, -1, 2, 5, 7, 8, 8, 7]);
      h.voet = [
        { y: -6, z: 0.5, hoek: -22 },
        { y: -6, z: 0.5, hoek: -22 },
      ];
      h.staf.los = true;
      h.staf.omZ = GREEP;
      h.staf.kantel = rij([0, 3, 7, 14, 20, 24, 25, 25]);
      h.staf.hel = rij([0, 4, 14, 36, 60, 78, 88, 90]);
      h.staf.dp = [0, rij([0, 0, 1, 2, 4, 6, 7, 7]), rij([0, -0.5, -2, -6, -15, -27, -35, -37])];
      h.handL = [rij([0, 1, 3, 7, 11, 14, 16, 17]), rij([0, 0, 1, 2, 3, 3, 3, 3]), rij([0, -1, -3, -7, -10, -12, -13, -13])];
      h.handR = [rij([0, 1, 2, 3, 5, 6, 6, 6]), rij([0, 1, 2, 2, 3, 3, 3, 3]), rij([0, 0, -1, -2, -2, -3, -3, -3])];
      h.hoed.dp = [rij([0, 0, 0, -1, -2, -3, -4, -5]), 0, rij([0, 0, 0, -0.5, -1, -1.5, -2, -2.5])];
      const dof = rij([0, 0.1, 0.25, 0.45, 0.62, 0.78, 0.9, 1]);
      h.steen.gloed = -2.4 * dof;
      h.steen.licht = 1 - 0.75 * dof;
      break;
    }
    default:
      throw new Error(`De oude meester kent de houding "${naam}" niet.`);
  }
  return h;
}

// ---------------------------------------------------------------- de oude meester

// De leermeester van de held: dezelfde school als de tovenaar, veertig jaar verder. Geen
// leeftijdgetal zoals bij de tovenaar (hij is altijd tegen de honderd); stand: { houding, fase }
// laat hem bewegen (zie houdingMeester hierboven). Zonder stand staat hij stil, precies zoals op
// de vellen in uit/.
function meester(stand = null) {
  const hg = houdingMeester(stand);

  const M = { gewaad: 0, rand: 1, huid: 2, baard: 3, oog: 4, hout: 5, steen: 6, leer: 7, hoed: 8, mantel: 9, klauw: 10 };
  const D = { rok: 1, lijf: 2, armL: 3, armR: 4, hoofd: 5, baard: 6, hoed: 7, staf: 8, steen: 9, schoen: 10, riem: 11, mantel: 12, handL: 13, handR: 14, klauw: 15 };

  const mat = [];
  mat[M.gewaad] = {
    ramp: 'rood',
    lo: 0.7,
    hi: 6.2,
    patroon: (x, y, z, nx, ny, nz, stap) => (z < 3.6 ? naarRamp('goud', stap, [0.7, 6.2], [1.2, 6.4]) : 0),
  };
  mat[M.rand] = { ramp: 'goud', lo: 1.2, hi: 6.4, glans: 1.2 };
  // altijd de wallen van hoge leeftijd, in tegenstelling tot de tovenaar die ze pas na zijn 87e krijgt
  mat[M.huid] = {
    ramp: 'huid',
    lo: 2.1,
    hi: 6.8,
    schaduwKracht: 0.75,
    patroon: (x, y, z) => {
      for (const s of [-1, 1]) {
        const dx = x - s * 2.8;
        const dz = z - (H[2] - 1);
        if (y > H[1] + 4 && Math.abs(dx) < 1.8 && Math.abs(dz) < 0.9) return -1.3;
      }
      return 0;
    },
  };
  mat[M.baard] = {
    ramp: 'baard',
    lo: 1.4,
    hi: 7,
    patroon: (x, y, z) => {
      const streng = Math.sin(x * 2.1 + Math.sin(z * 0.4) * 1.3 + y * 0.5);
      return streng > 0.5 ? 0.6 : streng < -0.7 ? -0.9 : 0;
    },
  };
  mat[M.oog] = { ramp: 'inkt', lo: 0.6, hi: 1.6, detail: true, rand: 0, schaduw: false };
  mat[M.hout] = {
    ramp: 'hout',
    lo: 0.8,
    hi: 6.2,
    patroon: (x, y, z) => (Math.sin(z * 0.8 + Math.sin(x * 2.6) * 2.4) > 0.62 ? -0.8 : 0),
  };
  mat[M.steen] = {
    ramp: 'steen',
    lo: 1.6,
    hi: 6.6,
    patroon: (x, y, z) => (Math.sin(x * 1.4 + z * 1.8 + y * 0.9) > 0.5 ? 0.6 : -0.4),
    // een steen, geen vurige bol: hij gloeit bleek op vanuit zichzelf in plaats van oranje
    gloei: (x, y, z, kijk) => klem(1.3 + 2 * kijk * kijk + (hg ? hg.steen.gloed * 0.75 : 0), 1, 7),
  };
  mat[M.leer] = { ramp: 'leer', lo: 0.8, hi: 5.2 };
  mat[M.hoed] = {
    ramp: 'rood',
    lo: 0.35,
    hi: 5.6,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      // hoedband
      if (z < H[2] + 10.2 && z > H[2] + 6.8 && Math.hypot(x, y - H[1] + 0.6) < 11.4) {
        return naarRamp('goud', stap, [0.35, 5.6], [1.3, 6.2]);
      }
      // een ster voorop de rand, in plaats van op de punt (die hangt nu omlaag): teken van dezelfde school
      const sx = x - RAND[0];
      const sy = y - (RAND[1] + 10.8);
      if (Math.abs(z - RAND[2]) < 1.7 && Math.hypot(sx, sy) < 4.4) {
        const a = Math.atan2(sy, sx) + Math.PI / 2;
        const r = Math.hypot(sx, sy);
        const punt = 1.2 + 1.8 * Math.pow(Math.abs(Math.cos((a * 5) / 2)), 3);
        if (r < punt) return naarRamp('goud', stap, [0.35, 5.6], [3, 6.6]);
      }
      return 0;
    },
  };
  mat[M.mantel] = {
    ramp: 'rood',
    lo: 0.25,
    hi: 4.8,
    patroon: (x, y, z, nx, ny, nz, stap) => (z < MANTEL_ONDER + 1.6 ? naarRamp('goud', stap, [0.25, 4.8], [1.3, 6.2]) : 0),
  };
  mat[M.klauw] = { ramp: 'ijzer', lo: 1.4, hi: 6.2, glans: 1.4 };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const draaiM = (buig, hel, om) => HH.maalM(HH.draaiing([0, 0, 1], om), HH.maalM(HH.draaiing([0, 1, 0], hel), HH.draaiing([1, 0, 0], -buig)));

  // --- de botten op hun plek zetten (alleen van belang met een houding)
  const Bval = hg && hg.val ? HH.beweging({ as: [0, 1, 0], graden: hg.val.graden, om: hg.val.om }) : null;
  const Blijf = hg ? HH.naElkaar(Bval, HH.beweging({ dp: [hg.zij, hg.voor, -hg.zak] })) : null;
  const Brok = hg ? HH.naElkaar(Bval, HH.beweging({ dp: [hg.zij, hg.voor, 0] })) : null;
  const Bromp = hg ? HH.naElkaar(Blijf, HH.beweging({ M: draaiM(hg.romp.buig, hg.romp.hel, hg.romp.draai), om: HEUP, dp: [0, 0, hg.romp.omhoog] })) : null;
  const Bhoofd = hg ? HH.naElkaar(Bromp, HH.beweging({ M: draaiM(hg.nek.knik, hg.nek.hel, hg.nek.draai), om: NEK })) : null;
  const Bbaard = hg ? HH.naElkaar(Bhoofd, HH.beweging({ M: draaiM(hg.baard.zwaai, hg.baard.hel, 0), om: KIN })) : null;
  const Bhoed = hg ? HH.naElkaar(Bhoofd, HH.beweging({ M: draaiM(hg.hoed.kantel, hg.hoed.hel, 0), om: RAND, dp: hg.hoed.dp })) : null;
  const Bstaf = hg
    ? HH.naElkaar(hg.staf.los ? null : Bval, HH.beweging({ M: draaiM(hg.staf.kantel, hg.staf.hel, 0), om: stafAs(hg.staf.omZ), dp: hg.staf.dp }))
    : null;
  const BhandL = hg ? (hg.handL ? HH.naElkaar(Blijf, HH.beweging({ dp: hg.handL })) : HH.naElkaar(Bstaf, HH.beweging({ dp: [0, 0, hg.staf.greep] }))) : null;
  const Bvoet = [0, 1].map((i) =>
    hg ? HH.naElkaar(Bval, HH.beweging({ as: [1, 0, 0], graden: hg.voet[i].hoek, om: [(i ? 1 : -1) * 4.8, 5, 0], dp: [0, hg.voet[i].y, hg.voet[i].z] })) : null,
  );

  // --- staf (eerst, dan liggen de handen erover): krom, met geknoest hout, en een klauw die een
  // steen vasthoudt in plaats van de tovenaars gladde gloeiende bol.
  delen.push(...bochtKegel(STAF_ONDER, STAF_KNIK1, STAF_GRIP, 1.7, 1.35, 4, M.hout, D.staf, 1));
  delen.push(...bochtKegel(STAF_GRIP, STAF_KNIK2, [STAF_TOP[0], STAF_TOP[1], STAF_TOP[2] - STEEN_R - 2], 1.35, 1.05, 3, M.hout, D.staf, 1));
  for (const p of [HH.tussen(STAF_ONDER, STAF_KNIK1, 0.4), HH.tussen(STAF_KNIK1, STAF_GRIP, 0.35), HH.tussen(STAF_GRIP, STAF_KNIK2, 0.5)]) {
    delen.push(bol(p, 1.85, M.hout, D.staf, 1.1));
  }
  // klauw: drie zware, gekromde klauwen om de steen, in ijzer in plaats van hout
  const bc = STAF_TOP;
  for (const [ax, ay] of [
    [-1, 0.25],
    [0.85, 0.75],
    [0.25, -1.05],
  ]) {
    const n = Math.hypot(ax, ay);
    const ux = ax / n;
    const uy = ay / n;
    delen.push(
      ...bochtKegel(
        [STAF_TOP[0], STAF_TOP[1], STAF_TOP[2] - STEEN_R - 1.8],
        [bc[0] + ux * (STEEN_R + 3), bc[1] + uy * (STEEN_R + 3), STAF_TOP[2] - STEEN_R * 0.5],
        [bc[0] + ux * (STEEN_R * 0.5), bc[1] + uy * (STEEN_R * 0.5), STAF_TOP[2] + STEEN_R * 0.9],
        1.6,
        0.55,
        3,
        M.klauw,
        D.klauw,
        0.7,
      ),
    );
  }
  delen.push(ellips(bc, [STEEN_R, STEEN_R * 0.85, STEEN_R * 1.05], M.steen, D.steen, 0.8));
  delen.push(ellips(plus(bc, [1.6, 0.6, 1.1]), [STEEN_R * 0.55, STEEN_R * 0.5, STEEN_R * 0.6], M.steen, D.steen, 0.6));
  bot(Bstaf);

  // --- rok: dezelfde klokvormige techniek als de tovenaar (de benen zijn onzichtbaar maar
  // trekken de stof mee), in wijnrood.
  const rokTop = hg ? 43 - hg.rok.hoog : 43;
  const rokWijd = hg ? hg.rok.wijd : 0;
  const zoomVan = (y) => (hg ? hg.rok.zoom + 0.5 * Math.max(0, Math.abs(y - 0.6) - 13) : 0);
  const benen =
    hg && !hg.knielt
      ? [0, 1].map((i) => {
          const s = i ? 1 : -1;
          const hp = [s * 5, 0.5 + hg.voor, 40 - hg.zak * 0.8];
          const enkel = [s * 4.6, 4 + hg.voet[i].y, 3.4 + hg.voet[i].z];
          return { heup: hp, enkel, knie: HH.tussen(hp, enkel, 0.52) };
        })
      : null;
  delen.push({
    f: hg
      ? (x, y, z) => {
          const t = klem(z / rokTop, 0, 1);
          const rx = mix(16.4 + rokWijd, 10, Math.pow(t, 0.8));
          let ry = mix(13.6 + rokWijd, 8, Math.pow(t, 0.9));
          let cy = mix(0.6, 1.5 * KROM, t);
          if (benen) {
            let voor = cy + ry;
            let achter = cy - ry;
            for (const b of benen) {
              const u = klem((b.heup[2] - z) / (b.heup[2] - b.knie[2]), 0, 1);
              const by = mix(b.heup[1], b.knie[1], u);
              const br = mix(7.3, 5.8, u);
              voor = Math.max(voor, by + br);
              achter = Math.min(achter, by - br);
            }
            cy = (voor + achter) / 2;
            ry = (voor - achter) / 2;
          }
          const ex = x / rx;
          const ey = (y - cy) / ry;
          const th = Math.atan2(ey, ex);
          const plooi = (0.06 * Math.sin(th * 9 + 1.3) + 0.035 * Math.sin(th * 5 - 0.4)) * (1 - t * 0.8);
          const zij = (Math.hypot(ex, ey) - 1 - plooi) * Math.min(rx, ry) * 0.88;
          return Math.max(zij, zoomVan(y) - z, z - rokTop);
        }
      : (x, y, z) => {
          const t = klem(z / rokTop, 0, 1);
          const rx = mix(16.4, 10, Math.pow(t, 0.8));
          const ry = mix(13.6, 8, Math.pow(t, 0.9));
          const cy = mix(0.6, 1.5 * KROM, t);
          const ex = x / rx;
          const ey = (y - cy) / ry;
          const th = Math.atan2(ey, ex);
          const plooi = (0.06 * Math.sin(th * 9 + 1.3) + 0.035 * Math.sin(th * 5 - 0.4)) * (1 - t * 0.8);
          const zij = (Math.hypot(ex, ey) - 1 - plooi) * Math.min(rx, ry) * 0.88;
          return Math.max(zij, -z, z - rokTop);
        },
    g: hg ? rokGrens(benen, rokTop, rokWijd) : [0, 1, rokTop / 2, 28],
    m: M.gewaad,
    ...(hg ? { terug: (x, y, z) => [x, y, z - zoomVan(y)] } : {}),
    deel: D.rok,
  });
  bot(Brok);

  // --- romp, mantel over de schouders, en een sober koord als riem (geen sjerp met kwastjes:
  // hij is de sobere leermeester, niet de avonturier)
  delen.push(kegel([0, 0.8, 40], [0, S[1] * 0.75, S[2] - 6], 9, 9.8, M.gewaad, D.rok, 4));
  delen.push(ellips([0, S[1], S[2] - 1], [11.4, 7.6, 5.8], M.gewaad, D.lijf, 4));
  delen.push({
    f: (x, y, z) => {
      const t = klem((MANTEL_TOP - z) / (MANTEL_TOP - MANTEL_ONDER), 0, 1);
      const r = mix(6.2, 14.2, Math.sqrt(t));
      const cy = S[1] - 0.4 + t * 0.6;
      const zij = (Math.hypot(x, (y - cy) / 0.74) - r) * 0.7;
      return Math.max(zij, MANTEL_ONDER - z, z - MANTEL_TOP);
    },
    g: [0, S[1], (MANTEL_ONDER + MANTEL_TOP) / 2, 17],
    m: M.mantel,
    deel: D.mantel,
  });
  delen.push({
    f: (x, y, z) => sdf.torus(x, (y - 0.9) * 1.15, z - RIEM_Z, 10.2, 1.3) * 0.85,
    g: [0, 0.9, RIEM_Z, 13],
    m: M.leer,
    deel: D.riem,
  });
  bot(Bromp);

  // --- schoenen, met een stuk laars naar de knie toe zodat een voet die onder de rok uit komt
  // niet los hangt
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    delen.push(ellips([s * 4.4, 6, 2], [3, 5, 2.4], M.leer, D.schoen));
    delen.push(bol([s * 4.6, 11, 3], 1.15, M.leer, D.schoen, 1.2));
    bot(Bvoet[i]);
    if (hg) {
      const enkel = benen ? benen[i].enkel : [s * 4.6, 4 + hg.voet[i].y, 3.4 + hg.voet[i].z];
      const naarBoven = HH.eenheid(HH.af(benen ? benen[i].heup : [s * 4.8, 0.5, 40], enkel));
      delen.push(kegel(enkel, HH.plus(enkel, HH.keer(naarBoven, 8.5)), 2.6, 2.2, M.leer, D.schoen, 1));
      bot(Bval);
    }
  }

  // --- armen: links steunt op de staf (zijn stok), rechts hangt los of gebaart
  const Ls = plus(S, [-10.5, 0, -1.5]);
  const Lh = [STAF_GRIP[0] + 0.6, STAF_GRIP[1] - 0.7, GREEP];
  const Le = [mix(Ls[0], Lh[0], 0.45) - 1.8, mix(Ls[1], Lh[1], 0.3) + 1, mix(Ls[2], Lh[2], 0.5) + 2];
  const uL = richting(Lh, Le);
  const Lw = plus(Lh, [uL[0] * 4.4, uL[1] * 4.4, uL[2] * 4.4]);
  const Rs = plus(S, [10.5, 0, -1.5]);
  const Re = plus(Rs, [2.8, 1.5, -11]);
  const Rw = plus(Re, [-1, 4, -8]);
  const uR = richting(Re, Rw);
  const Rh = plus(Rw, [uR[0] * 3.6, uR[1] * 3.6, uR[2] * 3.6]);

  const Lhn = hg ? HH.opPunt(BhandL, Lh) : Lh;
  const Lsn = hg ? HH.opPunt(Bromp, Ls) : Ls;
  const Len = hg ? HH.elleboog(Ls, Le, Lh, Lsn, Lhn) : Le;
  const Rsn = hg ? HH.opPunt(Bromp, Rs) : Rs;
  const Rhn = hg ? HH.opPunt(Blijf, plus(Rh, hg.handR || [0, 0, 0])) : Rh;
  const Ren = hg ? HH.elleboog(Rs, Re, Rh, Rsn, Rhn) : Re;
  const BarmL1 = hg ? HH.lidBeweging(Ls, Le, Lsn, Len) : null;
  const BarmL2 = hg ? HH.lidBeweging(Le, Lh, Len, Lhn) : null;
  const BarmR1 = hg ? HH.lidBeweging(Rs, Re, Rsn, Ren) : null;
  const BarmR2 = hg ? HH.lidBeweging(Re, Rh, Ren, Rhn) : null;

  // mouwrand: dezelfde tweekleurige techniek als de tovenaar (goud op het laatste stuk)
  const manchet = (a, b) => (x, y, z) => {
    const t =
      ((x - a[0]) * (b[0] - a[0]) + (y - a[1]) * (b[1] - a[1]) + (z - a[2]) * (b[2] - a[2])) /
      ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2);
    return t > 0.9 ? M.rand : M.gewaad;
  };
  delen.push(kegel(Ls, Le, 4.3, 4, M.gewaad, D.armL, 1.5));
  bot(BarmL1);
  delen.push(kegel(Le, Lw, 4, 5, manchet(Le, Lw), D.armL, 1));
  bot(BarmL2);
  delen.push(kegel(Rs, Re, 4.3, 4, M.gewaad, D.armR, 1.5));
  bot(BarmR1);
  delen.push(kegel(Re, Rw, 4, 5, manchet(Re, Rw), D.armR, 1));
  bot(BarmR2);
  delen.push(ellips(Lh, [3.2, 3.3, 3.8], M.huid, D.handL, 0.6));
  delen.push(bol(plus(Lh, [1.3, 2.2, 1.7]), 1.45, M.huid, D.handL, 0.6));
  bot(BhandL);
  delen.push(ellips(Rh, [2.9, 3, 3.8], M.huid, D.handR, 0.6));
  delen.push(bol(plus(Rh, [-1.5, 1.1, 0.8]), 1.25, M.huid, D.handR, 0.6));
  bot(BarmR2);

  // --- hoofd: smaller en ingevallener dan de tovenaar, met een haviksneus en zichtbare ogen
  // onder borstelige wenkbrauwen (die blijven, net als bij de tovenaar, boven het oog)
  delen.push(ellips(H, [7, 6.8, 7.7], M.huid, D.hoofd));
  delen.push(ellips(plus(H, [0, 7.5, -1.8]), [1.5, 3.1, 2.8], M.huid, D.hoofd, 1.2));
  delen.push(bol(plus(H, [0, 9.7, -3.7]), 1.45, M.huid, D.hoofd, 1));
  for (const s of [-1, 1]) {
    delen.push(ellips(plus(H, [s * 6.9, 0.4, 0]), [1.3, 2.1, 2.8], M.huid, D.hoofd, 0.6)); // oor
    delen.push(bol(plus(H, [s * 2.9, 6.2, 0.9]), 0.9, M.oog, D.hoofd)); // oog
    delen.push(ellips(plus(H, [s * 3, 6.3, 2.3]), [2.9, 1.35, 1.3], M.baard, D.hoofd, 0.5)); // wenkbrauw, boven het oog
  }
  delen.push(ellips(plus(H, [0, -1.6, -1]), [7.9, 7.2, 7.2], M.baard, D.hoofd, 1)); // haar opzij en achter
  bot(Bhoofd);

  // --- baard: tot op zijn riem, langer en dunner dan die van de tovenaar
  const puntBaard = plus(H, [0, 5.6, -6.4 - BAARD_LEN]);
  delen.push(kegel(KIN, puntBaard, 3.6, 0.6, M.baard, D.baard, 1.3));
  delen.push(kegel(plus(H, [0, 3.2, -7.6]), plus(puntBaard, [0, -0.8, 7]), 3.2, 1.3, M.baard, D.baard, 1.6));
  for (const s of [-1, 1]) {
    delen.push(kegel(plus(H, [s * 1, 7.6, -3.6]), plus(H, [s * 4.6, 6.2, -6]), 1.3, 0.8, M.baard, D.baard, 1));
    delen.push(kegel(plus(H, [s * 6.2, 1.2, -1.4]), plus(H, [s * 4.6, 3.4, -6.6]), 1.7, 2.1, M.baard, D.baard, 1.3));
  }
  bot(Bbaard);

  // --- hoed: brede rand (iets opgewipt vooraan, extra ruim voor het gezicht eronder), en de punt
  // niet rechtop maar helemaal omgezakt tot over zijn schouder
  delen.push({
    f: (x, y, z) => {
      const dx = x - RAND[0];
      const dy = y - RAND[1];
      const dz = z - RAND[2] + 0.008 * (dx * dx + dy * dy) - 0.09 * dy;
      return sdf.ellipsoide(dx, dy, dz, 14.2, 13.6, 1.3) * 0.8;
    },
    g: [RAND[0], RAND[1], RAND[2], 15.5],
    m: M.hoed,
    deel: D.hoed,
  });
  // Een lage bol als kruin (geen scherpe punt meer), waar een sliert vanaf zakt tot over de
  // schouder — dat leest duidelijk anders dan de rechtop staande punt van de tovenaar, vooral van
  // opzij en van achteren. Twee lessen uit het proberen: rechte kegels in plaats van een bocht
  // met verre stuurpunten (die zwaaiden in de isometrische projectie onvoorspelbaar weg achter
  // romp of mantel), en ver genoeg naar buiten — de rand is zelf al 14,2 breed, dus een sliert die
  // daar niet ruim voorbij komt, verdwijnt gewoon binnen het silhouet van de rand.
  const kruin = plus(RAND, [0, -1, 7]);
  delen.push(ellips(kruin, [6.4, 6, 5], M.hoed, D.hoed, 1.4));
  delen.push(kegel(plus(kruin, [0, 0, 1]), [17, S[1] + 2, RAND[2] - 9], 5, 2.3, M.hoed, D.hoed, 1.3));
  delen.push(kegel([16, S[1] + 1.4, RAND[2] - 8], [23, S[1] - 3, RAND[2] - 19], 3, 1.2, M.hoed, D.hoed, 1.4));
  bot(Bhoed);

  const bcN = hg ? HH.opPunt(Bstaf, bc) : bc;
  const licht = hg ? hg.steen.licht : 1;
  return model(delen, mat, {
    ...HH.omvat(delen, 2),
    lichten: [{ pos: bcN, r: 26 * licht, sterk: 1.25 * licht, warm: 1, eigen: true }],
    bolPlek: bcN,
    bolR: STEEN_R,
  });
}

module.exports = { meester, houdingMeester, MEESTER_SNELHEID };
