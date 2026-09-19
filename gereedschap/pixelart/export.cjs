// Schrijft alle HD-pixel art weg als PNG op ware grootte (1 pixel = 1 pixel) in uit/. Vergroten
// gebeurt later scherp, met image-rendering: pixelated. Stroken hebben vaste cellen, zodat
// onderschriften en het spel ze zonder meetwerk kunnen vinden.
//
//   node gereedschap/pixelart/export.cjs      (of: npm run pixelart)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = { ...require('./figuren.cjs'), ...require('./figuren2.cjs') };
const V = require('./voorwerpen.cjs');
const Kamers = require('./kamers.cjs');
const { portret } = require('./portret.cjs');

const UIT = path.join(__dirname, 'uit');
fs.mkdirSync(UIT, { recursive: true });
const schrijf = (naam, p) => fs.writeFileSync(path.join(UIT, naam), K.png(p, 1));

// ---------------------------------------------------------------- scènes

for (const jaar of [84, 92, 99]) schrijf(`hd-hal-${jaar}.png`, Kamers.hal(jaar));
schrijf('hd-gevecht.png', Kamers.voorraadkamer(85));

// ---------------------------------------------------------------- figuren in acht richtingen

// Cellen van 112×124; de voeten (het midden van de tegel) staan op (56, 110).
const CEL = 112;
const HOOG = 124;
const figuurCel = (model, kant) => K.losRenderen(model, { b: CEL, h: HOOG, anker: [CEL / 2, HOOG - 14], richting: kant });
function strook(cellen) {
  const vel = new K.Plaat(CEL * cellen.length, HOOG);
  cellen.forEach((p, i) => vel.plak(p, i * CEL, 0));
  return vel;
}
const modellen = { tovenaar: F.tovenaar(84), wim: F.wim(), skelet: F.skelet(), slijm: F.slijm() };
for (const [naam, m] of Object.entries(modellen)) schrijf(`hd-${naam}-richtingen.png`, strook(K.KANTEN.map((k) => figuurCel(m, k))));
schrijf('hd-tovenaar-leeftijd.png', strook([84, 88, 92, 96, 99].map((j) => figuurCel(F.tovenaar(j), 'ZO'))));

// ---------------------------------------------------------------- portretten

for (const j of [84, 92, 99]) {
  const o = Math.max(0, Math.min(1, (j - 84) / 16));
  const krom = 0.25 + 0.75 * o;
  schrijf(`hd-portret-tovenaar-${j}.png`, portret(F.tovenaar(j), [0, 5 + 7.5 * krom, 71.5 - 5.5 * krom], { midden: 0.56 }));
}
schrijf('hd-portret-wim.png', portret(F.wim(), [0, 3.4, 65], { midden: 0.5 }));

// ---------------------------------------------------------------- muren, vloeren, voorwerpen

// Eén muurstuk van een tegel breed: de versiering op de linkerwand (noordmuur) of op de
// rechterwand (westmuur, voor het raam en de doorgang).
const MUURB = 80;
const MUURH = 176;
function muurstuk(deco, westmuur = false, extra) {
  const B = new K.Beeld(MUURB, MUURH, westmuur ? 48 : 32, MUURH - 26);
  const tex = Kamers.muurTex({ deco: westmuur ? { x: { 0: deco } } : { y: { 0: deco } }, zaad: 5 });
  const doos = westmuur ? K.doos(-1, -0.5, -0.5, 0.5, 0, Kamers.MUUR_H, tex) : K.doos(-0.5, -1, 0.5, -0.5, 0, Kamers.MUUR_H, tex);
  // een stukje vloer ervoor, zodat de muur ergens op staat
  const vloer = K.doos(-0.5, -0.5, 0.5, 0.5, -10, 0, Kamers.zandVloer());
  K.tekenDozen(B, [doos, vloer]);
  if (extra) extra(B);
  K.belicht(B, { omgeving: () => -0.4 });
  K.verwarm(B, 2);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}
const muren = [
  muurstuk(null),
  muurstuk(Kamers.deurDeco(true)),
  muurstuk(Kamers.raamDeco(), true),
  muurstuk(Kamers.wandkleedDeco()),
  muurstuk(Kamers.doorgangDeco(true), true),
  muurstuk(Kamers.scheurDeco([[9, 127], [11, 116], [8, 106], [12, 96], [9, 86], [13, 76]], 2)),
  muurstuk(null, false, (B) => K.tekenModel(B, V.wandlamp(), { gx: 0, gy: -0.5, richting: 'ZW' })),
  muurstuk(null, false, (B) => K.tekenModel(B, V.wandrek(1), { gx: 0, gy: -0.5, richting: 'ZW' })),
];
const muurVel = new K.Plaat(MUURB * muren.length, MUURH);
muren.forEach((p, i) => muurVel.plak(p, i * MUURB, 0));
schrijf('hd-muren.png', muurVel);

// vloeren: vier tegels van elk soort
function vloerstuk(tex) {
  const B = new K.Beeld(144, 88, 72, 22);
  K.tekenDozen(B, [K.doos(-0.5, -0.5, 1.5, 1.5, -12, 0, tex)]);
  K.belicht(B, { omgeving: () => -0.3 });
  return K.Plaat.van(K.kwantiseer(B));
}
const vloerVel = new K.Plaat(144 * 2, 88);
vloerVel.plak(vloerstuk(Kamers.zandVloer()), 0, 0);
vloerVel.plak(vloerstuk(Kamers.houtVloer()), 144, 0);
schrijf('hd-vloeren.png', vloerVel);

// voorwerpen, de vuurschicht zwevend
const VB = 88;
const VH = 112;
const voorwerpen = [
  [V.tafel(), 'ZW'],
  [V.fontein(), 'ZO'],
  [V.kist(), 'ZO'],
  [V.ton(), 'ZO'],
  [V.zak(1), 'ZO'],
  [V.puin(3, 8), 'ZO'],
  [V.sleutel(), 'ZO'],
  [V.vuurschicht(), -20],
];
const voorwerpVel = new K.Plaat(VB * voorwerpen.length, VH);
voorwerpen.forEach(([m, r], i) => {
  const z = i === voorwerpen.length - 1 ? 40 : 0;
  voorwerpVel.plak(K.losRenderen(m, { b: VB, h: VH, anker: [VB / 2, VH - 22], richting: r, model: { z } }), i * VB, 0);
});
schrijf('hd-voorwerpen.png', voorwerpVel);

for (const f of fs.readdirSync(UIT).sort()) {
  const b = fs.readFileSync(path.join(UIT, f));
  console.log(f.padEnd(28), `${b.readUInt32BE(16)}×${b.readUInt32BE(20)}`);
}
