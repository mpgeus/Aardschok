// Het kleine leven (werklijst vraag 145, 3; js/kleinleven.js): de kip die op het erf van de boerderij scharrelt, en de
// hond die met zijn baas meeloopt en blaft naar vreemden. Alleen beeld: ze doen niets in de regels.
//
// De kip is klein: zo'n 40 centimeter, 18 eenheden (de boer is er 82 met zijn hoed). Een bolle romp, een staart die
// omhoog waaiert, een hals met een kop, een kam en lellen, een snavel, en twee gele poten. Drie houdingen:
//   staan   de kop draait schokkerig van links naar rechts
//   lopen   de poten om en om, en de kop die stilstaat en dan vooruit schiet, zoals een kip loopt
//   pikken  voorover, twee keer de snavel in de grond, en weer op
// Vier vellen: kip0 wit, kip1 bruin, kip2 zwart gespikkeld, en kip3 een haan, roodbruin met een groene staart.
//
// De hond is de wolf van bosvijanden.cjs met o.hond (een vacht in zijn kleur, gewone ogen, de bek dicht, flaporen en
// een krulstaart), op 0,72 gezet: een boerenhond tot de knie. Drie houdingen: staan, lopen, en blaffen (de beweging van
// de aanval van de wolf). Drie vellen: hond0 bruin, hond1 zwart, hond2 geel.
//
//   node gereedschap/pixelart/klein.cjs proef      de proefplaat, in gereedschap/pixelart/uit/klein/
// Lokale assen zoals overal: x naar rechts, y naar voren, z omhoog, de voeten op z = 0.
'use strict';
const { model, kegel, bol, ellips, plus, geschaald } = require('./figuren.cjs');
const BV = require('./bosvijanden.cjs');

// ---------------------------------------------------------------- de kip

const KIP_SNELHEID = 0.8; // tegels per seconde
const KIP_HOUDINGEN = {
  staan: { beelden: 6, fps: 5 },
  lopen: { beelden: 8, fps: 10 },
  pikken: { beelden: 8, fps: 8 },
};
const KIP_KLEUREN = [
  { naam: 'kip0', veren: { ramp: 'pleister', lo: 2.6, hi: 6.6 }, staart: { ramp: 'pleister', lo: 2.2, hi: 6 } },
  { naam: 'kip1', veren: { ramp: 'herfst', lo: 1.4, hi: 5.4 }, staart: { ramp: 'hout', lo: 0.8, hi: 4.2 } },
  { naam: 'kip2', veren: { ramp: 'vacht', lo: 0.4, hi: 3, spikkel: true }, staart: { ramp: 'vacht', lo: 0.2, hi: 2.4 } },
  { naam: 'kip3', veren: { ramp: 'herfst', lo: 1.8, hi: 6 }, staart: { ramp: 'den', lo: 0.6, hi: 5 }, haan: true },
];

function kip(kleur, stand = {}) {
  const K = KIP_KLEUREN[kleur];
  const houding = stand.houding || 'staan';
  const f = (stand.fase || 0) * Math.PI * 2;
  const M = { veren: 0, staart: 1, kam: 2, snavel: 3, poot: 4, oog: 5 };
  const D = { lijf: 1, staart: 2, kop: 3, pootL: 4, pootR: 5 };
  const mat = [];
  mat[M.veren] = { ...K.veren, patroon: (x, y, z) => (K.veren.spikkel && Math.sin(x * 3.1 + y * 2.3) + Math.sin(z * 3.7 - x * 1.9) > 1.3 ? { ramp: 'pleister', stap: 5 } : Math.sin(y * 1.6 + z * 0.8) > 0.7 ? -0.5 : 0) };
  mat[M.staart] = { ...K.staart, glans: K.haan ? 1.2 : 0 };
  mat[M.kam] = { ramp: 'rood', lo: 2.6, hi: 6.4 };
  mat[M.snavel] = { ramp: 'goud', lo: 2.4, hi: 5.4 };
  mat[M.poot] = { ramp: 'goud', lo: 1.8, hi: 4.6 };
  mat[M.oog] = { ramp: 'inkt', lo: 0.4, hi: 1.4, detail: true, rand: 0 };

  // de houding: hoe ver hij voorover helt, waar de kop is, en de stand van de poten
  let voorover = 0;
  let kopVoor = 0;
  let kopOmlaag = 0;
  let kopDraai = 0;
  let pas = 0;
  if (houding === 'staan') kopDraai = Math.round(Math.sin(f) * 2) * 0.35; // schokkerig: in standen
  if (houding === 'lopen') {
    pas = Math.sin(f);
    // de kop staat stil en schiet dan vooruit: een zaagtand op de halve cyclus
    const t = (stand.fase * 2) % 1;
    kopVoor = t < 0.7 ? -t * 2.2 : -1.5 + (t - 0.7) * 5;
  }
  if (houding === 'pikken') {
    const t = stand.fase || 0;
    voorover = 0.5 + 0.2 * Math.sin(f * 2);
    const pik = Math.max(0, Math.sin(f * 2)); // twee keer per cyclus
    kopOmlaag = 4 + 7 * pik;
    kopVoor = 2 + 1.5 * pik;
    if (t > 0.85) voorover *= (1 - t) / 0.15;
  }
  const delen = [];
  const romp = [0, 0, 9];
  const kantel = (p) => {
    // om de heup voorover: z en y draaien om de as x door [0, -2, 6]
    const dy = p[1] + 2;
    const dz = p[2] - 6;
    const c = Math.cos(voorover);
    const s = Math.sin(voorover);
    return [p[0], -2 + dy * c + dz * s, 6 - dy * s + dz * c];
  };
  delen.push(ellips(kantel(romp), [4.6, 6.6, 4.4], M.veren, D.lijf, 1.4));
  delen.push(ellips(kantel([0, 3.6, 10.6]), [3.6, 3.6, 3.4], M.veren, D.lijf, 1.2)); // de borst
  // de staart: veren die omhoog en naar achteren waaieren (een haan heeft ze lang en gebogen)
  for (const [x, l] of [[-1.3, 1], [0, 1.15], [1.3, 1]]) {
    const voet = kantel([x * 0.8, -5, 11]);
    if (K.haan) {
      // sikkelveren: omhoog, en dan in een boog naar achteren en omlaag
      const midden = kantel([x * 1.4, -8.4, 17.6 * l]);
      const punt = kantel([x * 1.8, -13.4, 12.6 * l]);
      delen.push(kegel(voet, midden, 2.2, 1.4, M.staart, D.staart, 0.8));
      delen.push(kegel(midden, punt, 1.4, 0.5, M.staart, D.staart, 0.8));
    } else delen.push(kegel(voet, kantel([x * 1.6, -8.6, 16.6 * l]), 2.2, 0.8, M.staart, D.staart, 0.8));
  }
  // hals en kop
  const H = kantel([0, 5.4 + kopVoor, 16 - kopOmlaag]);
  delen.push(kegel(kantel([0, 3.4, 11.6]), H, 2.6, 1.9, M.veren, D.kop, 1));
  delen.push(bol(H, 2.3, M.veren, D.kop, 0.8));
  const vooruit = [Math.sin(kopDraai), Math.cos(kopDraai)];
  const op = (dx, dy, dz) => [H[0] + dx * vooruit[1] + dy * vooruit[0], H[1] - dx * vooruit[0] + dy * vooruit[1], H[2] + dz];
  delen.push(kegel(op(0, 1.6, -0.2), op(0, 3.8, -0.8), 0.9, 0.25, M.snavel, D.kop));
  for (const s of [-1, 1]) delen.push(bol(op(s * 1.4, 1, 0.6), 0.55, M.oog, D.kop));
  // de kam: een paar tandjes bovenop, en de lellen onder de snavel
  for (const [dy, h] of [[1, 1.2], [0, 1.6], [-1, 1.3]]) delen.push(bol(op(0, dy, 2 + h * (K.haan ? 1.5 : 0.8)), K.haan ? 1.2 : 0.85, M.kam, D.kop, 0.6));
  delen.push(ellips(op(0, 1.6, -1.8), [0.6, 0.6, K.haan ? 1.6 : 1], M.kam, D.kop, 0.4));
  // de poten: dunne gele poten, om en om naar voren als hij loopt
  for (const s of [-1, 1]) {
    const voor = s * pas * 2.2;
    const tillen = Math.max(0, s * pas) * 1.2;
    const heup = kantel([s * 1.7, 0, 6]);
    const voet = [s * 1.8, 0.6 + voor, 0.5 + tillen];
    delen.push(kegel(heup, voet, 0.75, 0.55, M.poot, s < 0 ? D.pootL : D.pootR));
    for (const t of [-0.5, 0, 0.5]) delen.push(kegel(voet, plus(voet, [t * 1.4, 1.8, -0.3]), 0.4, 0.3, M.poot, s < 0 ? D.pootL : D.pootR));
  }
  return model(delen, mat, { midden: [0, 0, 9], straal: 20 });
}

// ---------------------------------------------------------------- de hond

const HOND_SCHAAL = 0.72;
const HOND_HOUDINGEN = {
  staan: BV.HOUDINGEN.staan,
  lopen: BV.HOUDINGEN.lopen,
  blaffen: BV.HOUDINGEN.aanval,
};
const HOND_KLEUREN = [
  { naam: 'hond0', vacht: { ramp: 'hout' } },
  { naam: 'hond1', vacht: { ramp: 'vacht' } },
  { naam: 'hond2', vacht: { ramp: 'stro' } },
];
function hond(kleur, stand = {}) {
  const houding = stand.houding === 'blaffen' ? 'aanval' : stand.houding;
  const o = { houding, fase: stand.fase, hond: { vacht: HOND_KLEUREN[kleur].vacht, oren: 'hang', staart: 'krul' } };
  return geschaald(BV.wolf(o), HOND_SCHAAL);
}

module.exports = { kip, KIP_KLEUREN, KIP_HOUDINGEN, KIP_SNELHEID, hond, HOND_KLEUREN, HOND_HOUDINGEN, HOND_SCHAAL };

// ---------------------------------------------------------------- de proefplaat

if (require.main === module && process.argv[2] === 'proef') {
  const fs = require('fs');
  const path = require('path');
  const K = require('./kern.cjs');
  const { boer } = require('./dorpelingen.cjs');
  const UIT = path.join(__dirname, 'uit', 'klein');
  fs.mkdirSync(UIT, { recursive: true });
  const cel = (m, kant) => K.losRenderen(m, { b: 140, h: 120, anker: [70, 100], richting: kant });
  const rijen = [];
  // de boer voor de maat, dan per kip staan, twee loopbeelden en twee keer pikken, in ZO en Z
  for (const kant of ['ZO', 'Z']) {
    const rij = [cel(boer({ houding: 'staan', fase: 0 }), kant)];
    for (let k = 0; k < KIP_KLEUREN.length; k++) {
      for (const [h, fase] of [['staan', 0], ['lopen', 0.25], ['pikken', 0.25]]) rij.push(cel(kip(k, { houding: h, fase }), kant));
    }
    rijen.push(rij);
  }
  for (const kant of ['ZO', 'Z']) {
    const rij = [cel(boer({ houding: 'staan', fase: 0 }), kant)];
    for (let k = 0; k < HOND_KLEUREN.length; k++) {
      for (const [h, fase] of [['staan', 0], ['lopen', 0.25], ['blaffen', 0.4]]) rij.push(cel(hond(k, { houding: h, fase }), kant));
    }
    rijen.push(rij);
  }
  const KOL = 64;
  const HOOG = 100;
  const n = Math.max(...rijen.map((r) => r.length));
  const vel = new K.Plaat(KOL * n, HOOG * rijen.length);
  rijen.forEach((rij, r) => rij.forEach((p, i) => vel.plak(p.uitsnede(38, 10, KOL, HOOG), i * KOL, r * HOOG)));
  fs.writeFileSync(path.join(UIT, 'proef-3x.png'), K.png(vel, 3, '#5e6a44'));
  console.log(path.join(UIT, 'proef-3x.png'));
}
