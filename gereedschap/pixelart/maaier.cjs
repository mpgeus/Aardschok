// De maaier: de boer uit graan.cjs/graan-proef.cjs, maar met een zeis in beide handen in plaats
// van de hooivork, en de maaibeweging als houding (werklijst, "boer met zeis"; zie
// gereedschap/pixelart/README.md voor hoe houding.cjs werkt en dorpelingen.cjs boven "lopen en
// staan" voor hoe een been met een knie buigt — de smid is daar het voorbeeld).
//
// Dit bestand raakt dorpelingen.cjs niet aan: het hergebruikt alleen wat daar al wordt
// geëxporteerd (profiel, schedel, romp, bottenDorpeling, beenPunten, voetBot, knieTussen) en bouwt
// verder net als boer() daar dat doet — zelfde materialen, zelfde benen, kiel en hoofd (met
// strohoed), zodat het dezelfde figuur is als op de graanplaat. Alleen de armen en de houding zijn
// nieuw: geen lopen/staan uit houdingDorpeling (die kent "maaien" niet), maar een eigen
// houdingMaaier() hieronder, in precies dezelfde vorm (zak/zij/voor, romp, nek, voet, rokZwaai) die
// bottenDorpeling/beenPunten/voetBot toch al verwachten.
'use strict';
const { sdf, klem, mix, ruis3 } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, bochtKegel, plus } = require('./figuren.cjs');
const { ring } = require('./figuren2.cjs');
const HH = require('./houding.cjs');
const { profiel, schedel, romp, bottenDorpeling, beenPunten, voetBot, knieTussen } = require('./dorpelingen.cjs');

// hetzelfde oogmateriaal als dorpelingen.cjs (niet geëxporteerd vandaar, dus hier één regel gelijk)
const OOG = { ramp: 'inkt', lo: 0.6, hi: 1.4, detail: true, rand: 0, schaduw: false };

// ---------------------------------------------------------------- de zeis

// Bouwt steel, twee handgrepen en blad tussen vaste punten P = { boven, greepBoven, greepOnder,
// onder, bladMid, bladTip }. `zijAs` is een eenheidsvector dwars op de steel, voor de twee
// handgrepen (D-vormige knoppen). Los te gebruiken (zie zeis() hieronder) of rechtstreeks in de
// handen van de maaier (zie maaier() verderop) — in beide gevallen dezelfde vorm, alleen de punten
// verschillen, net zoals de hooivork van de boer als losse delen in zijn hand werd gebouwd.
function zeisDelen(P, zijAs, M, D) {
  const d = [];
  d.push(capsule(P.boven, P.greepBoven, 1.05, M.hout, D.steel));
  d.push(capsule(P.greepBoven, P.greepOnder, 1.2, M.hout, D.steel));
  d.push(capsule(P.greepOnder, P.onder, 1.2, M.hout, D.steel));
  for (const g of [P.greepBoven, P.greepOnder]) {
    d.push(capsule(HH.plus(g, HH.keer(zijAs, -3.4)), HH.plus(g, HH.keer(zijAs, 3.4)), 1.05, M.hout, D.handvat));
  }
  // het blad: lang en licht gebogen, van de aanzet tot de punt — breder dan de steel, zodat het
  // ook op afstand als blad leest en niet als een tweede stok
  d.push(...bochtKegel(P.onder, P.bladMid, P.bladTip, 3.6, 0.6, 5, M.ijzer, D.blad, 0.5));
  return d;
}

// De zeis los, als eigen klein model (stijl voorwerpen.cjs): rechtop, het blad laag naar één kant.
function zeis() {
  const M = { hout: 0, ijzer: 1 };
  const D = { steel: 1, handvat: 1, blad: 2 };
  const mat = [];
  mat[M.hout] = { ramp: 'hout', lo: 1.4, hi: 5.8, patroon: (x, y, z) => (Math.sin(z * 1.3) > 0.85 ? -0.6 : 0) };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.6, hi: 6.2, glans: 1.8, detail: true };
  const P = {
    boven: [0, -1, 86],
    greepBoven: [0, 0, 63],
    greepOnder: [1, 3, 33],
    onder: [2, 5, 7],
    bladMid: [17, 8, 4.5],
    bladTip: [35, 11, 2.5],
  };
  const d = zeisDelen(P, [1, 0, 0.05], M, D);
  return model(d, mat, { midden: [11, 4, 40], straal: 52 });
}

// ---------------------------------------------------------------- de houding van het maaien

const SWING_AMPL = 52; // graden, hoever armen+zeis om het lijf zwaaien
const TORSO_TWIST = 15; // graden, hoeveel het bovenlijf meedraait (minder dan de zwaai zelf)
const MAAIER_FPS = 8;
const MAAIER_BEELDEN = 12;

// fase 0..1 is één volledige slag: rechts->links snijden (fase 0..0.5, het blad laag en het lijf
// buigt mee voorover) en de terughaal (fase 0.5..1, het blad iets van de grond en de rechtervoet
// zet een klein stapje bij). Loopt rond (fase 1 sluit aan op fase 0). Dezelfde vorm als
// rustDorpeling()/houdingDorpeling() in dorpelingen.cjs, want bottenDorpeling/beenPunten/voetBot
// verwachten precies dat.
function houdingMaaier(fase) {
  const hef = Math.max(0, HH.sinus(fase - 0.5)); // 0..1..0, alleen tijdens de terughaal
  const voor = Math.max(0, HH.cosinus(fase)); // 0..1, piekt bij de snijslag (fase 0)
  return {
    zak: 1 + 0.7 * voor,
    zij: 1.6 * HH.sinus(fase),
    voor: 0.5 * voor,
    romp: { buig: 3 + 3 * voor, draai: TORSO_TWIST * HH.cosinus(fase), omhoog: 0 },
    nek: { knik: -1.2, draai: 0.4 * TORSO_TWIST * HH.cosinus(fase) },
    voet: [
      { y: 0, z: 0, hoek: 0 },
      { y: 5 * hef, z: 3.5 * hef, hoek: 10 * hef },
    ],
    arm: [{ hoek: 0 }, { hoek: 0 }], // ongebruikt: de armen krijgen hieronder hun eigen bot
    rokZwaai: 0,
  };
}

// ---------------------------------------------------------------- de maaier

// Dezelfde boer als graan-proef.cjs gebruikt (zie People.boer() daar; strohoed zit er al in), maar
// met een zeis in beide handen en de maaibeweging in plaats van lopen/staan. fase: zie
// houdingMaaier hierboven. Zonder fase (0) staat hij aan het begin van de snijslag.
function maaier(fase = 0) {
  const M = { huid: 0, kiel: 1, broek: 2, klomp: 3, haar: 4, oog: 5, stro: 6, lint: 7, doek: 8, hout: 9, ijzer: 10, strootje: 11 };
  const D = { benen: 1, kiel: 2, armL: 3, armR: 4, handL: 5, handR: 6, hoofd: 7, hoed: 8, doek: 9, steel: 10, handvat: 10, blad: 11 };
  const H = [0, 4, 68.5];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.9, hi: 6.4, schaduwKracht: 0.85 };
  mat[M.kiel] = { ramp: 'pet', lo: 1.4, hi: 6.2, patroon: (x, y, z) => (Math.sin(x * 1.3 + 0.4) > 0.82 && z < 50 ? -0.7 : 0) };
  mat[M.broek] = { ramp: 'aarde', lo: 0.8, hi: 4.6 };
  mat[M.klomp] = { ramp: 'zand', lo: 3, hi: 7.4 };
  mat[M.haar] = { ramp: 'schors', lo: 0.8, hi: 4.4 };
  mat[M.oog] = OOG;
  mat[M.stro] = {
    ramp: 'stro',
    lo: 1.6,
    hi: 6.2,
    patroon: (x, y, z) => {
      const r = Math.hypot(x - H[0], y - H[1]);
      const s = z > H[2] + 7.2 ? Math.sin(z * 2.4) : Math.sin(r * 2.2);
      return s > 0.55 ? 0.6 : s < -0.7 ? -0.6 : 0;
    },
  };
  mat[M.lint] = { ramp: 'schors', lo: 0.6, hi: 3 };
  mat[M.doek] = { ramp: 'rood', lo: 2, hi: 6.4 };
  mat[M.hout] = { ramp: 'hout', lo: 1.6, hi: 6 };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.8, hi: 6.2, glans: 1.2, detail: true };
  mat[M.strootje] = { ramp: 'stro', lo: 4.2, hi: 6.6 };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingMaaier(fase);
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.3, 30],
    nek: [0, 0, 59],
    schouders: [[-10, 0.3, 56], [10, 0.3, 56]],
  });

  // --- benen en klompen: zelfde punten als boer(), de rechter zet het kleine stapje
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    const heupR = [s * 4.4, 0, 30];
    const enkelR = [s * 4.3, 0.8, 7];
    const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
    delen.push(kegel(P.heup, P.knie, 3.9, 3.65, M.broek, D.benen, 1));
    delen.push(kegel(P.knie, P.enkel, 3.65, 3.4, M.broek, D.benen, 1));
    bot(null);
    delen.push(ellips([s * 4.4, 2.6, 3], [3.5, 6.6, 3.2], M.klomp, D.benen, 1));
    delen.push(bol([s * 4.4, 8.4, 3.9], 1.7, M.klomp, D.benen, 1.8));
    bot(voetBot(hg, i, [s * 4.4, 2.2, 0]));
  }

  // --- kiel: los en wijd, tot halverwege de dij; schouders erop (zelfde als boer())
  const kiel = {
    rx: profiel([[24, 11], [30, 10.2], [38, 9.4], [46, 9.8], [52, 10.4], [58, 10]]),
    ry: profiel([[24, 8.4], [30, 7.6], [38, 6.8], [46, 7], [52, 7.2], [58, 6.4]]),
    cy: profiel([[24, 0.8], [40, 0.8], [58, 0.5]]),
  };
  delen.push(romp(kiel, 24, 58, M.kiel, D.kiel, 2));
  delen.push(ellips([0, 0.4, 57], [10.4, 6.8, 4.4], M.kiel, D.kiel, 2.5));
  // rode halsdoek met een knoop en een puntje voorop
  delen.push({
    f: (x, y, z) => Math.max(Math.abs(sdf.ellipsoide(x, y - 1.4, z - 60.4, 5.8, 5.4, 3)) - 0.9, Math.abs(z - 60.4) - 1.8),
    g: [0, 1.4, 60.4, 8],
    m: M.doek,
    deel: D.doek,
  });
  delen.push(bol([0.6, 7, 59.4], 1.6, M.doek, D.doek, 0.6));
  delen.push(kegel([0.6, 7.2, 58.8], [1.4, 8.4, 54.6], 1.8, 0.7, M.doek, D.doek));
  bot(Bn.Bromp);

  // --- armen + zeis: beide handen aan de steel. De zwaai draait niet de al-gebouwde armen (dan
  // raakt de schouder los van het lijf zodra de hoek groot wordt), maar de greeppunten zélf, om
  // PIVOT; de schouders (Sch hieronder) blijven op hun echte, vaste plek en de elleboog-IK buigt
  // de arm mee naar waar de hand deze fase moet zijn — zoals beenPunten dat voor de knie doet.
  // Bn.Bromp erover (bot() hieronder) laat het bovenlijf zichtbaar meedraaien met de romp.
  const zwaaiHoek = SWING_AMPL * HH.cosinus(fase);
  const PIVOT = [3, 3, 46];
  const B_zwaai = HH.beweging({ as: [0, 0, 1], graden: zwaaiHoek, om: PIVOT });
  const draaiPunt = (p) => HH.opPunt(B_zwaai, p);

  const P = {
    boven: draaiPunt([13, 2, 52]),
    greepBoven: draaiPunt([18, 6, 43]), // rechterhand: bovenste greep, een eind van het lijf af
    greepOnder: draaiPunt([23, 16, 23]), // linkerhand: onderste greep, verder naar het blad toe
    onder: draaiPunt([26, 20, 10]),
    bladMid: draaiPunt([43, 25, 7]),
    bladTip: draaiPunt([62, 29, 4]),
  };
  const zijAs = HH.eenheid(HH.kruis(HH.af(P.onder, P.boven), [0, 0, 1]));
  delen.push(...zeisDelen(P, zijAs, M, D));

  const armDeel = (Sch, ElRef, HandRef, HandDoel, dArm, dHand) => {
    const El = HH.elleboog(Sch, ElRef, HandRef, Sch, HandDoel);
    delen.push(kegel(Sch, El, 3.9, 3.4, M.kiel, dArm, 1.5));
    delen.push(ring(HH.tussen(Sch, El, 0.96), HH.eenheid(HH.af(El, Sch)), 3.4, 1, M.kiel, dArm));
    const pols = HH.plus(HandDoel, HH.keer(HH.eenheid(HH.af(El, HandDoel)), 2.8));
    delen.push(kegel(El, pols, 3.1, 2.4, M.huid, dArm, 1));
    delen.push(ellips(HandDoel, [2.6, 2.8, 3.1], M.huid, dHand, 0.6));
  };
  // rest-armlengtes van boer() geleend, alleen om de elleboog-IK zijn botlengte te geven
  armDeel([10, 0.3, 56], [12.3, 0.4, 45.5], [11.4, 2.6, 36.2], P.greepBoven, D.armR, D.handR);
  armDeel([-10, 0.3, 56], [-13.6, -0.6, 45.4], [-13.4, 1.8, 41.5], P.greepOnder, D.armL, D.handL);

  bot(Bn.Bromp);

  // --- hoofd: zelfde als boer() — lang gezicht, strootje, strohoed
  const oy = schedel(delen, H, M, D, { maat: [6.7, 6.7, 7.8], oog: [2.6, 0.8], oor: 1 });
  delen.push(ellips(plus(H, [0, 6.9, -1.4]), [1.7, 2.4, 2.6], M.huid, D.hoofd, 1));
  delen.push(bol(plus(H, [0, 8.2, -2.8]), 1.7, M.huid, D.hoofd, 1));
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.7, oy + 0.1, 2.6]), [2.1, 1, 0.9], M.haar, D.hoofd, 0.4));
  delen.push(ellips(plus(H, [0, -2, 0.4]), [7.1, 6.1, 6.8], M.haar, D.hoofd, 1));
  delen.push(capsule(plus(H, [1.4, 5.8, -4.3]), plus(H, [8.6, 8.4, -0.8]), 0.5, M.strootje, D.hoofd));
  const rand = plus(H, [0, -1.2, 6.6]);
  delen.push({
    f: (x, y, z) => {
      const dx = x - rand[0];
      const dy = y - rand[1];
      const dz = z - rand[2] + 0.01 * (dx * dx + dy * dy) - 0.17 * dy;
      return sdf.ellipsoide(dx, dy, dz, 13.4, 12.8, 1) * 0.75;
    },
    g: [rand[0], rand[1], rand[2], 15],
    m: M.stro,
    deel: D.hoed,
  });
  delen.push({
    f: (x, y, z) => sdf.cilinder(x - rand[0], y - rand[1] - 0.4, z - rand[2], 6.3, 0, 6.2) - 0.6,
    g: [rand[0], rand[1], rand[2] + 3.5, 9],
    m: (x, y, z) => (z < rand[2] + 2.4 ? M.lint : M.stro),
    deel: D.hoed,
    k: 1,
  });
  bot(Bn.Bnek);

  return model(delen, mat, HH.omvat(delen, 2));
}

module.exports = { zeis, zeisDelen, maaier, houdingMaaier, SWING_AMPL, TORSO_TWIST, MAAIER_FPS, MAAIER_BEELDEN };
