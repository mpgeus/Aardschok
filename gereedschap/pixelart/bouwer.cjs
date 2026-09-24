// De bouwer: een dorpsman in werkkleren die het dorp uitbreidt (ontwerp/werklijst.md; T.plaatsGebouw
// in js/gebouwen.js tekent hem straks bij een bouwplaats). Een hemd met opgestroopte mouwen, een
// leren schort, een platte werkmuts, een houten klophamer. Drie houdingen: staan en lopen zoals een
// gewone dorpeling (op 1,2 tegels/s — dorpelingen3.cjs, DORPELING_SNELHEID), en timmeren: de hamer
// heffen en naar voren neerslaan, alsof hij tegen een balk of muur vóór hem slaat.
//
// Zelfde bouwstenen als de andere dorpelingen, zodat hij ernaast past: profiel/romp/schil/schedel/
// houdingDorpeling/bottenDorpeling uit dorpelingen.cjs (zie daar "lopen en staan" voor de uitleg),
// en arm/been/band/wenkbrauwen uit dorpelingen3.cjs (been() geeft een knie, arm() met mouw tussen 1
// en 2 geeft de opgestroopte mouw). Dit bestand raakt geen van beide bestanden aan — hetzelfde
// uitgangspunt als maaier.cjs, zie de uitleg daar.
//
// Het timmeren is één starre zwaai van schouder tot hamerkop: anders dan de zeis van de maaier
// (die met twee handen tegelijk op twee vaste punten grijpt en dus elleboog-IK nodig heeft), is dit
// één hand om één steel, dus is een enkele rotatie om de schouder genoeg. fase 0 is de klap zelf;
// de zwaai wordt na de buiging van de romp gedraaid (HH.naElkaar), anders lijkt de schouder los te
// staan van het lijf zodra de romp ver voorover buigt bij de inslag.
'use strict';
const { mix } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, plus } = require('./figuren.cjs');
const HH = require('./houding.cjs');
const { profiel, romp, schil, schedel, houdingDorpeling, bottenDorpeling } = require('./dorpelingen.cjs');
const { arm, been, band, wenkbrauwen } = require('./dorpelingen3.cjs');

// hetzelfde oogmateriaal als dorpelingen.cjs/dorpelingen3.cjs (daar niet geëxporteerd)
const OOG = { ramp: 'inkt', lo: 0.6, hi: 1.4, detail: true, rand: 0, schaduw: false };

const BOUWER_SNELHEID = 1.2; // tegels/s, zoals een gewone dorpeling (dorpeling(), dorpelingen3.cjs)
const BOUWER_FPS = 10;
const BOUWER_SWING_AMPL = 68; // graden, van heffen tot de klap
const BOUWER_TIMMEREN_FPS = 8;
const BOUWER_TIMMEREN_BEELDEN = 9;

// ---------------------------------------------------------------- de houding van het timmeren

// fase 0..1 is één volledige slag: de klap bij fase 0 (de hamer laag en voor), de hef op zijn
// hoogst bij fase 0.5 (hamer hoog en achter). Loopt rond. Dezelfde vorm als houdingDorpeling/
// rustDorpeling verwachten (zak/zij/voor, romp, nek, voet, rokZwaai); de armen krijgen hieronder
// hun eigen, aparte behandeling (net als bij houdingMaaier in maaier.cjs), dus hg.arm blijft
// ongebruikt en staat er alleen om bottenDorpeling niet te laten struikelen.
function houdingBouwer(fase) {
  const impact = Math.max(0, HH.cosinus(fase)); // 1 bij de klap, 0 een kwart cyclus verderop
  return {
    zak: 0.5 * impact,
    zij: 0,
    voor: 0.7 * impact,
    romp: { buig: 5 + 6 * impact, draai: 3 * HH.sinus(fase), omhoog: 0 },
    nek: { knik: -2 - 3 * impact, draai: 0 },
    voet: [{ y: 3, z: 0, hoek: 0 }, { y: -4, z: 0, hoek: -8 }], // breed en stevig, geen pas
    arm: [{ hoek: 0 }, { hoek: 0 }],
    rokZwaai: 0,
  };
}

// ---------------------------------------------------------------- de bouwer

// stand: { houding, fase } — 'staan'/'lopen' zoals elke dorpeling (houdingDorpeling hierboven), of
// 'timmeren' (houdingBouwer hierboven). Zonder stand staat hij stil, de hamer los in de hand.
function bouwer(stand = null) {
  const M = { huid: 0, hemd: 1, schort: 2, broek: 3, schoen: 4, muts: 5, band: 6, oog: 7, brauw: 8, hout: 9 };
  const D = { benen: 1, romp: 2, schort: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, muts: 9, hamer: 10 };
  const H = [0, 4, 68];
  const kop = [6.8, 6.7, 7.6];
  const oog = [2.7, 0.8];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.7, hi: 6.2, schaduwKracht: 0.8 };
  mat[M.hemd] = { ramp: 'pet', lo: 1.2, hi: 5.8, patroon: (x, y, z) => (Math.sin(x * 1.2 + z * 0.4) > 0.86 ? -0.6 : 0) };
  mat[M.schort] = { ramp: 'leer', lo: 1, hi: 5.6, patroon: (x, y, z) => (Math.sin(x * 0.9 - z * 0.5) > 0.88 ? -0.7 : 0) };
  mat[M.broek] = { ramp: 'aarde', lo: 0.8, hi: 4.6 };
  mat[M.schoen] = { ramp: 'schors', lo: 0.6, hi: 4.2 };
  mat[M.muts] = { ramp: 'aarde', lo: 2.6, hi: 6.4 };
  mat[M.band] = { ramp: 'leer', lo: 0.6, hi: 3.6 };
  mat[M.oog] = OOG;
  mat[M.brauw] = { ramp: 'schors', lo: 1.2, hi: 3.4 };
  mat[M.hout] = { ramp: 'hout', lo: 1.5, hi: 6, patroon: (x, y, z) => (Math.sin(z * 1.4 + x * 0.6) > 0.85 ? -0.6 : 0) };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };

  const naam = typeof stand === 'string' ? stand : stand && stand.houding;
  const fase = (typeof stand === 'object' && stand && stand.fase) || 0;
  const timmeren = naam === 'timmeren';
  const hg = timmeren ? houdingBouwer(fase) : houdingDorpeling(stand, { snelheid: BOUWER_SNELHEID, fps: BOUWER_FPS, beenLengte: 23 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.4, 30],
    nek: [0, 1, 60],
    schouders: [[-10.5, 0.4, 57], [10.5, 0.4, 57]],
  });

  // --- benen: broek en lage werkschoenen, met een knie (been(), dorpelingen3.cjs — zie de uitleg
  // bovenaan dorpelingen.cjs voor hg/i/bot)
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    been(delen, s, {
      x: 4.5, heup: 30, r: [4, 3.5], broek: M.broek, schoen: M.schoen, dBenen: D.benen,
      laars: 12, voet: [3.3, 5.7, 2.8], voor: 0.8, hg, i, bot,
    });
  }

  // --- romp: een hemd, de hals bloot; schouders erop als bij boer()/smid() (dorpelingen.cjs)
  const vorm = {
    rx: profiel([[22, 10], [30, 10.6], [40, 11], [48, 10.6], [54, 10], [59, 9]]),
    ry: profiel([[22, 7.6], [30, 8], [40, 8], [48, 7.6], [54, 7], [59, 6.2]]),
    cy: profiel([[22, 0.4], [36, 1], [48, 1.2], [59, 0.5]]),
  };
  delen.push(romp(vorm, 22, 58, M.hemd, D.romp, 2));
  delen.push(ellips([0, 0.4, 57], [10, 6.4, 4.2], M.hemd, D.romp, 2.5));
  delen.push(kegel([0, 2, 55], plus(H, [0, -1.4, -6]), 3.2, 2.9, M.huid, D.romp, 1));

  // --- schort: leer, van de borst tot boven de knie, met een band om het middel en twee bandjes
  // over de schouder — schil() (dorpelingen.cjs) is letterlijk gemaakt voor "een schort, een sjaal"
  const schortBreed = (z) => (z < 40 ? 9.2 : z > 48 ? 5.4 : mix(9.2, 5.4, (z - 40) / 8));
  delen.push(schil(vorm, { los: 0.35, d: 0.7, breed: schortBreed, z0: 15, z1: 56, zHang: 36 }, M.schort, D.schort));
  delen.push(band(vorm, [0, 0, 39], [0, 0, 1], 1, { los: 0.35, d: 0.55, z0: 37, z1: 41 }, M.band, D.schort));
  for (const s of [-1, 1]) delen.push(capsule([s * 4, 3.6, 54], [s * 9.4, 1, 57.2], 0.85, M.band, D.schort));
  bot(Bn.Bromp);

  // --- armen en hamer: mouwen opgestroopt (mouw 1,15: net voorbij de elleboog bloot, arm(),
  // dorpelingen3.cjs). Een kleine hulpfunctie tekent de hamer zelf (een dunne steel met een dikke,
  // bolronde houten kop aan het eind), vanaf de vuist in een eigen richting, met een kop die
  // ruim voorbij de vuist hangt — dicht tegen de vuist aan verdwijnt hij anders in de hand, en
  // een bolle kop blijft (anders dan een dwarse cilinder) op elke kijkhoek een duidelijke klomp
  // in plaats van een dun streepje wanneer de steel toevallig naar de camera toe wijst.
  const mouwOptie = { r: [4, 3.5, 2.6], mouw: 1.15, stof: M.hemd, huid: M.huid };
  const tekenHamer = (greep, richting, steelLengte) => {
    const kopMidden = HH.plus(greep, HH.keer(richting, steelLengte));
    delen.push(kegel(HH.plus(greep, HH.keer(richting, -2.4)), HH.plus(kopMidden, HH.keer(richting, -1.8)), 1.3, 1.6, M.hout, D.hamer));
    delen.push(ellips(kopMidden, [4, 4, 4.4], M.hout, D.hamer, 1.4));
  };

  if (timmeren) {
    // De arm en de hamer staan hier in hun middenstand (halverwege de zwaai); daarna draait één
    // rotatie om de schouder ze naar de klap of de hef, en Bn.Bromp erna (HH.naElkaar) laat die
    // zwaai meebuigen met de voorover geleunde romp.
    const SCHOUDER_R = [10.5, 0.4, 57];
    const ElR = [15.5, 6, 46];
    const HandR = [17, 15, 37];
    arm(delen, SCHOUDER_R, ElR, HandR, { ...mouwOptie, dArm: D.armR, dHand: D.handR });
    tekenHamer(HandR, HH.eenheid([0.5, 0.85, 0.6]), 11);
    const zwaaiHoek = BOUWER_SWING_AMPL * HH.cosinus(fase);
    const AS = HH.eenheid([1, 0.25, 0]);
    bot(HH.naElkaar(Bn.Bromp, HH.beweging({ as: AS, graden: zwaaiHoek, om: SCHOUDER_R })));

    // linkerhand: steunt in de zij, beweegt niet los van de romp mee
    arm(delen, [-10.5, 0.4, 57], [-13.6, 0, 46], [-8, 4, 35], { ...mouwOptie, dArm: D.armL, dHand: D.handL });
    bot(Bn.Bromp);
  } else {
    // de hamer hangt los in de rechterhand, de kop ruim onder de vuist
    const HandR = [13.5, 8, 25];
    arm(delen, [10.5, 0.4, 57], [14, 3, 46], HandR, { ...mouwOptie, dArm: D.armR, dHand: D.handR });
    tekenHamer(HandR, HH.eenheid([0.35, -0.25, -1]), 11);
    bot(Bn.Barm[1]);
    arm(delen, [-10.5, 0.4, 57], [-13.6, 0, 46], [-11, 2.4, 37], { ...mouwOptie, dArm: D.armL, dHand: D.handL });
    bot(Bn.Barm[0]);
  }

  // --- hoofd: eenvoudig gezicht, wenkbrauwen, een platte werkmuts (bakker() in dorpelingen3.cjs
  // bouwt zijn muts op dezelfde manier: een band om het hoofd, een bol erop)
  schedel(delen, H, M, D, { maat: kop, oog });
  delen.push(ellips(plus(H, [0, 6.9, -1.3]), [1.6, 2.2, 2.5], M.huid, D.hoofd, 1));
  delen.push(bol(plus(H, [0, 8.1, -2.6]), 1.6, M.huid, D.hoofd, 1));
  wenkbrauwen(delen, H, kop, oog, M.brauw, D.hoofd, { z: 1.8, dik: 1.1, breed: 2 });
  delen.push(ellips(plus(H, [0, -0.5, 5.6]), [7.3, 7.2, 2.6], M.muts, D.muts, 1));
  delen.push(ellips(plus(H, [0, -1.6, 8]), [6.6, 6.2, 3.4], M.muts, D.muts, 1.4));
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 2, 42], straal: 50 });
}

module.exports = {
  bouwer, houdingBouwer,
  BOUWER_SNELHEID, BOUWER_FPS, BOUWER_SWING_AMPL, BOUWER_TIMMEREN_FPS, BOUWER_TIMMEREN_BEELDEN,
};
