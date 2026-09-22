'use strict';
// proef-hekjes.cjs: de twee hekken van ronde 4a (tuin-sdf.cjs) als tuintje naast de tovenaar, op
// ware grootte en twee keer vergroot, om te beoordelen of ze laag en open genoeg zijn (ontwerp/
// beeld.md, "Hekjes van wilgentenen en van latten"; ontwerp/werklijst.md, ronde 4a).
//
//   node gereedschap/pixelart/proef-hekjes.cjs        -> uit/proefhuis/hekjes.png
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = require('./figuren.cjs');
const D = require('./dorp.cjs');
const T = require('./toren.cjs');
const TU = require('./tuin-sdf.cjs');
const { grondZon } = require('./huis-sdf-export.cjs');

const UIT = path.join(__dirname, 'uit', 'proefhuis');
fs.mkdirSync(UIT, { recursive: true });
const TG = K.TEGEL;

// Eén tuintje van 3×3 tegels in een gekozen hoedanigheid ('tenen' of 'lat'): het hek rondom, een
// hekje aan de voorkant, en een kruidenbed in het midden. Dezelfde opzet als TUINTJE in
// huis-sdf-export.cjs, maar compact (3×3 in plaats van 5×4) en met (ox, oy) als linkerbovenhoek
// in tegels, zodat twee tuintjes naast elkaar kunnen staan.
function tuintjeLaag(soort, ox, oy) {
  return [
    [`hek-${soort}-hoek-boven`, ox + 0, oy + 0],
    [`hek-${soort}-x`, ox + 1, oy + 0],
    [`hek-${soort}-hoek-rechts`, ox + 2, oy + 0],
    [`hek-${soort}-y`, ox + 0, oy + 1],
    ['kruidenbed', ox + 1, oy + 1],
    [`hek-${soort}-y`, ox + 2, oy + 1],
    [`hek-${soort}-hoek-links`, ox + 0, oy + 2],
    [`hekje-${soort}-x`, ox + 1, oy + 2],
    [`hek-${soort}-hoek-onder`, ox + 2, oy + 2],
  ];
}

// Twee tuintjes naast elkaar (tenen links, lat rechts — dezelfde diagonale verschuiving als
// dorp.cjs se huizen-proef.cjs gebruikt om dingen zuiver horizontaal naast elkaar te zetten: +dx
// en -dy in gelijke stappen geeft geen verticale drift op het scherm), en de tovenaar (84) ertussen
// vooraan, voor de maat.
const STUKKEN = [...tuintjeLaag('tenen', 0, 0), ...tuintjeLaag('lat', 5, -5)];

function vergroot2x(p) {
  const q = new K.Plaat(p.b * 2, p.h * 2);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (!k) continue;
      q.zet(x * 2, y * 2, k[0], k[1]);
      q.zet(x * 2 + 1, y * 2, k[0], k[1]);
      q.zet(x * 2, y * 2 + 1, k[0], k[1]);
      q.zet(x * 2 + 1, y * 2 + 1, k[0], k[1]);
    }
  }
  return q;
}

function scene(b, h, cx, cy, nudge) {
  const B = new K.Beeld(b, h, Math.round(b / 2 - (cx - cy) * 32), Math.round(h / 2 + nudge - (cx + cy) * 16));
  const kaart = D.grondKaart({ zaad: 5 });
  K.tekenDozen(B, [K.doos(-4, -9, 11, 6, -16, 0, D.grondTex(kaart, { dor: true }))]);
  const Rs = [];
  STUKKEN.forEach(([naam, tx, ty], i) => {
    const W = TU.tuinstuk(naam, 40 + i);
    const R = T.tekenWereld(B, W, { plek: [tx * TG, ty * TG] });
    if (R) Rs.push(R);
  });
  D.zetModel(B, F.tovenaar(84), 4.4, 0.6, 'Z'); // vooraan tussen de twee tuintjes, voor de maat
  D.grasPollen(B, kaart, { dicht: 0.5 });
  grondZon(B, { f: (x, y, z) => Math.min(...Rs.map((R) => R.f(x, y, z))) }, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B);
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

const t0 = Date.now();
const p1 = scene(700, 280, 3.5, -1.5, 4);
const p2 = vergroot2x(p1);
const gat = 14;
const b = Math.max(p1.b, p2.b);
const h = p1.h + gat + p2.h;
const plaat = new K.Plaat(b, h);
plaat.plak(p1, Math.round((b - p1.b) / 2), 0);
plaat.plak(p2, Math.round((b - p2.b) / 2), p1.h + gat);
fs.writeFileSync(path.join(UIT, 'hekjes.png'), K.png(plaat, 1));
console.log(`hekjes.png  ${plaat.b}×${plaat.h}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
