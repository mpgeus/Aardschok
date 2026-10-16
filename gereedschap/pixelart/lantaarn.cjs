// De lantaarn van de groepsleider (werklijst vraag 171, D2; ontwerp/beeld.md, "De lantaarn van de groepsleider"; Marcel,
// 16 okt: "M2, E1"): een eigen laag die het spel over elk figuur tekent, in de hand aan de kant van de kijker, en alleen
// als hij brandt.
//
// Twee dingen:
//  - het lantaarntje zelf: een vierkant kooitje van zwart ijzer met vier ruitjes van hoorn die gloeien, een spits dakje,
//    een ring en een hengsel (naar de lantaarn van de koster, dorpelingen3.cjs). Het anker is waar de hand het hengsel
//    vasthoudt: de lantaarn hangt eronder. Een kooitje draait niet zichtbaar mee, dus één kijkrichting, twee beelden
//    voor de vlam, en drie standen voor het schommelen bij het lopen (B1; Marcel, 16 okt: "A1, B1"): de onderkant naar
//    links, recht en naar rechts, vooraf gerenderd, want een pixeltekening draaien in het spel rafelt de randen;
//  - waar die hand zit, per lijf (boer, boerin, jongen, meisje), houding, richting en beeld, uit het model zelf (de
//    delen handL en handR, op hun plek in de houding), omgerekend naar pixels tegen het anker van het figuur, zoals
//    kern.cjs tekent. Het spel mag geen pixels lezen, en de handen hebben dezelfde kleur als het gezicht, dus het komt
//    uit het model, zoals de ogen van de wolf uit ogen.cjs komen.
//
//   node gereedschap/pixelart/lantaarn.cjs              de proefplaat: uit/lantaarn-proef.png
//   node gereedschap/pixelart/lantaarn.cjs --handen     de handen voor het spel: beelden/handen.js (T.HANDEN)
//   node gereedschap/pixelart/naar-spel.cjs --alleen lantaarn    het vel voor het spel: beelden/lantaarn.png
//
// Opnieuw draaien (--handen) als de lijven, hun houdingen of hun uiterlijken veranderen.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, klem } = K;
const { model, kegel, capsule } = require('./figuren.cjs');
const { ring } = require('./figuren2.cjs');
const H = require('./houding.cjs');

// ---------------------------------------------------------------- het lantaarntje

// Naar die van de koster, wat hoger en smaller (zo'n 6 bij 11 pixels met het hengsel, tegen 60 voor een man), met dunne
// stijlen, zodat het hoorn het meest te zien is. BREED en HOOG zijn het halve kooitje, in eenheden voor SCHAAL.
const SCHAAL = 0.68;
const BREED = 2.5;
const HOOG = 4.6;
// Het schommelen (B1): zoveel graden scheef, om de kijkrichting (kern.cjs, V; hij wordt in ZO gerenderd, en dan is de
// richting in het model dezelfde), zodat hij alleen in het vlak van het scherm draait: zijn vlakken kijken even ver naar
// de camera, dus het hoorn gloeit schuin net zo als recht. Een positieve hoek zet de onderkant naar rechts.
const SCHOMMEL = 9;
const SCHOMMEL_AS = K.V.map((v) => -v); // naar de camera toe
const STANDEN = [-1, 0, 1]; // de onderkant naar links, recht, naar rechts; zo staan de rijen in het vel
// Het model met het anker (0, 0, 0) waar de hand het hengsel vasthoudt; `vlam` is het beeld (0 of 1): de vlam flakkert;
// `scheef` is de stand (-1, 0 of 1, STANDEN).
function lantaarn(vlam = 0, scheef = 0) {
  const s = SCHAAL;
  const M = { ijzer: 0, hoorn: 1 };
  const D = { lantaarn: 1 };
  const L = [0, 0, -(HOOG + 6.4) * s]; // het midden van het kooitje, onder het hengsel
  const p = (dx, dy, dz) => [L[0] + dx * s, L[1] + dy * s, L[2] + dz * s];
  const mat = [];
  mat[M.ijzer] = { ramp: 'ijzer', lo: 0.6, hi: 4.2, glans: 1.2 };
  // Hoorn laat het licht melkig door: warm, en waar de vlam staat het felst; in het tweede beeld staat ze iets hoger.
  const vlamZ = L[2] + (vlam ? 0.8 : 0) * s;
  mat[M.hoorn] = { ramp: 'vuur', gloei: (x, y, z, kijk) => klem(3.4 + 2.0 * kijk + (Math.abs(z - vlamZ) < 1.4 * s ? 0.8 : 0), 3, 6.6) };
  const delen = [];
  // de ruitjes van hoorn: een doos die gloeit
  delen.push({ f: (x, y, z) => sdf.doos(x - L[0], y - L[1], z - L[2], BREED * s, BREED * s, HOOG * s, 0.4 * s), g: [L[0], L[1], L[2], 7 * s], m: M.hoorn, deel: D.lantaarn });
  // de vier ijzeren stijlen op de hoeken
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) delen.push(capsule(p(sx * (BREED + 0.05), sy * (BREED + 0.05), -HOOG - 0.3), p(sx * (BREED + 0.05), sy * (BREED + 0.05), HOOG + 0.3), 0.4 * s, M.ijzer, D.lantaarn));
  // de voet, het spitse dakje met het pijpje, en de ring met het hengsel
  delen.push({ f: (x, y, z) => sdf.doos(x - L[0], y - L[1], z - L[2] + (HOOG + 0.8) * s, (BREED + 0.45) * s, (BREED + 0.45) * s, 0.6 * s, 0.3 * s), g: [L[0], L[1], L[2] - (HOOG + 0.8) * s, 5 * s], m: M.ijzer, deel: D.lantaarn });
  delen.push(kegel(p(0, 0, HOOG + 0.3), p(0, 0, HOOG + 2.7), 3.0 * s, 1.0 * s, M.ijzer, D.lantaarn));
  delen.push(capsule(p(0, 0, HOOG + 2.5), p(0, 0, HOOG + 4.2), 0.5 * s, M.ijzer, D.lantaarn));
  delen.push(ring(p(0, 0, HOOG + 5), [0, 1, 0], 1.5 * s, 0.45 * s, M.ijzer, D.lantaarn));
  const B = scheef ? H.beweging({ as: SCHOMMEL_AS, graden: scheef * SCHOMMEL, om: [0, 0, 0] }) : null;
  return model(H.beweegDelen(delen, B), mat, { midden: H.opPunt(B, L), straal: 12 * s });
}

const LANTAARN_CEL = [22, 30];
const LANTAARN_ANKER = [10, 3]; // de hand: het kooitje hangt eronder
function lantaarnBeeld(vlam, scheef = 0) {
  // Een kwartslag gedraaid (ZO): zo zie je één ruit recht en de volgende schuin, en niet een stijl in het midden.
  return K.losRenderen(lantaarn(vlam, scheef), { b: LANTAARN_CEL[0], h: LANTAARN_CEL[1], anker: LANTAARN_ANKER, richting: 'ZO' });
}

// Alleen wat gloeit: de ruitjes van hoorn en de vlam (de ramp 'vuur'). Het spel ponst daarmee een gat in het doek, waar
// de nacht niet in valt, en vult het na de nacht met dezelfde pixels (js/tekenen.js, tekenLantaarn), zoals de ramen.
function gloedVan(beeld) {
  const uit = new K.Plaat(beeld.b, beeld.h);
  for (let j = 0; j < beeld.h; j++) {
    for (let i = 0; i < beeld.b; i++) {
      const k = beeld.lees(i, j);
      if (k && k[0] === K.RAMP.vuur) uit.zet(i, j, k[0], k[1]);
    }
  }
  return uit;
}

// Het vel voor het spel (naar-spel.cjs --alleen lantaarn): twee lagen onder elkaar (LAGEN: de hele lantaarn, en alleen wat
// gloeit), elk met een rij per stand (STANDEN) en een kolom per beeld van de vlam.
const LAGEN = ['heel', 'gloed'];
function vel() {
  const plaat = new K.Plaat(LANTAARN_CEL[0] * 2, LANTAARN_CEL[1] * STANDEN.length * LAGEN.length);
  STANDEN.forEach((scheef, rij) => {
    for (const vlam of [0, 1]) {
      const beeld = lantaarnBeeld(vlam, scheef);
      plaat.plak(beeld, vlam * LANTAARN_CEL[0], rij * LANTAARN_CEL[1]);
      plaat.plak(gloedVan(beeld), vlam * LANTAARN_CEL[0], (STANDEN.length + rij) * LANTAARN_CEL[1]);
    }
  });
  return plaat;
}
// Wat in beelden/beschrijving.json komt: js/sprites.js zoekt er een beeld mee op (S.lantaarn).
function beschrijving(bestand) {
  return { bestand, cel: LANTAARN_CEL, anker: LANTAARN_ANKER, vlammen: 2, standen: STANDEN, lagen: LAGEN };
}

// ---------------------------------------------------------------- de hand

const { boer } = require('./dorpelingen.cjs');
const { boerin, jongen, meisje } = require('./dorpelingen2.cjs');
const UI = require('./uiterlijk.cjs');
// Per lijf: de bouwer en de delen van de linker- en de rechterhand (de `D` van de bouwer).
const LIJVEN = {
  boer: { bouw: boer, handen: [5, 6] },
  boerin: { bouw: boerin, handen: [6, 7] },
  jongen: { bouw: jongen, handen: [6, 7] },
  meisje: { bouw: meisje, handen: [7, 8] },
  // een soldaat die oud wordt (uiterlijk-anim.cjs: de ouden op het lijf van de boer en de boerin)
  oudeman: { bouw: boer, handen: [5, 6] },
  oudevrouw: { bouw: boerin, handen: [6, 7] },
};
const HOUDINGEN = { staan: 4, lopen: 8 }; // beelden per houding, zoals uiterlijk-anim.cjs

// Het midden van een deel in het model, op zijn plek in de houding (de bol om het deel, figuren.cjs).
function middenVan(m, deel) {
  const d = m.delen.filter((x) => x.deel === deel);
  if (!d.length) return null;
  const s = d.reduce((a, x) => [a[0] + x.g[0], a[1] + x.g[1], a[2] + x.g[2]], [0, 0, 0]);
  return s.map((v) => v / d.length);
}
// Een punt van het figuur (lokaal: x rechts, y naar voren, z omhoog, de voeten op de oorsprong) in pixels tegen het
// anker, als het figuur naar `kant` kijkt (kern.cjs, tekenModel en naarScherm).
function opScherm([lx, ly, lz], kant) {
  const a = (K.RICHTING[kant] * Math.PI) / 180;
  const X = -lx * Math.sin(a) + ly * Math.cos(a);
  const Y = lx * Math.cos(a) + ly * Math.sin(a);
  return [X * K.EX[0] + Y * K.EX[1] + lz * K.EX[2], X * K.EY[0] + Y * K.EY[1] + lz * K.EY[2]];
}
// Hoe dichtbij de camera (groter is dichterbij): langs de kijkrichting V.
function nabijheid([lx, ly], kant) {
  const a = (K.RICHTING[kant] * Math.PI) / 180;
  return lx * (Math.cos(a) - Math.sin(a)) + ly * (Math.cos(a) + Math.sin(a));
}

// De hand die de lantaarn draagt, per richting: de hand die in het eerste beeld van staan het dichtst bij de kijker is,
// en waar het gelijk is (recht van voren of van achteren) de rechter. Vast per richting, zodat hij bij het lopen niet van
// hand wisselt als de armen zwaaien.
function draagHand(f, kant) {
  const m = f.maak({ houding: 'staan', fase: 0 });
  const [l, r] = f.handen.map((d) => middenVan(m, d));
  return nabijheid(l, kant) > nabijheid(r, kant) + 0.5 ? 0 : 1;
}

// Welke stand (STANDEN) bij elk beeld van een lus hoort (B1): hij zwaait met de arm mee, een beeld later, zoals een
// lantaarn die doorzwaait. Is de hand in het vorige beeld op het scherm meer dan DOORZWAAI pixels rechts van het midden
// van zijn zwaai, dan hangt de onderkant naar rechts, en links ook zo. Recht van voren of van achteren gaat de hand
// vooral op en neer, en staand staat hij stil: dan hangt hij recht.
const DOORZWAAI = 1.5;
function standenVan(xs) {
  const midden = (Math.max(...xs) + Math.min(...xs)) / 2;
  return xs.map((_, i) => {
    const d = xs[(i - 1 + xs.length) % xs.length] - midden;
    return d > DOORZWAAI ? 1 : d < -DOORZWAAI ? -1 : 0;
  });
}

// Per houding, per richting (K.KANTEN), per beeld: [dx, dy, scheef], de hand tegen het anker van het figuur en de stand
// van de lantaarn.
function handenVan(f) {
  const uit = {};
  for (const [houding, beelden] of Object.entries(HOUDINGEN)) {
    uit[houding] = K.KANTEN.map((kant) => {
      const h = draagHand(f, kant);
      const rij = [];
      for (let i = 0; i < beelden; i++) {
        const m = f.maak({ houding, fase: i / beelden });
        const [dx, dy] = opScherm(middenVan(m, f.handen[h]), kant);
        rij.push([Math.round(dx * 2) / 2, Math.round(dy * 2) / 2]);
      }
      const standen = houding === 'lopen' ? standenVan(rij.map((p) => p[0])) : rij.map(() => 0);
      return rij.map((p, i) => [p[0], p[1], standen[i]]);
    });
  }
  return uit;
}

// Een figuur van een lijf met uiterlijk nr: { maak(stand), handen }.
const figuur = (lijf, nr) => ({ maak: (stand) => LIJVEN[lijf].bouw(stand, UI.UITERLIJKEN[lijf][nr]), handen: LIJVEN[lijf].handen });

// ---------------------------------------------------------------- de handen voor het spel

// Elk vel dat iemand met een lantaarn kan dragen: een soldaat in zijn uiterlijk (boer-u7, en in de kleren van zijn stand,
// boer-u7-deftig; jong: jongen-u3; oud: oudeman-u2), uit dezelfde lijst als uiterlijk-anim.cjs, en de eerste aanvoerder
// in de oude vellen dorpeling0 en dorpeling1 (dorpelingen-anim.cjs). Geeft { naam: { maak(stand), handen } }.
function dragers() {
  const { uiterlijkFiguren } = require('./uiterlijk-anim.cjs');
  const { dorpeling } = require('./dorpelingen3.cjs');
  const uit = {
    dorpeling0: { maak: (stand) => dorpeling(0, { geslacht: 'man' }, stand), handen: [8, 9] },
    dorpeling1: { maak: (stand) => dorpeling(1, { geslacht: 'vrouw' }, stand), handen: [8, 9] },
  };
  for (const f of uiterlijkFiguren()) {
    const lijf = f.naam.replace(/-u\d+(-arm|-deftig)?$/, '');
    if (LIJVEN[lijf] && f.houdingen.staan && f.houdingen.lopen) uit[f.naam] = { maak: f.maak, handen: LIJVEN[lijf].handen };
  }
  return uit;
}

// beelden/handen.js: T.HANDEN = { richtingen, sets, vellen }. De meeste vellen hebben dezelfde handen (de kleren
// veranderen ze niet, en de meeste uiterlijken van een lijf ook niet), dus elke set staat er één keer in (sets[i]: per
// houding, per richting in de volgorde van `richtingen`, per beeld [dx, dy, scheef]), en per vel het nummer van zijn set.
function handenVoorHetSpel() {
  const sets = [];
  const nummer = new Map();
  const vellen = {};
  for (const [naam, f] of Object.entries(dragers())) {
    const set = handenVan(f);
    const sleutel = JSON.stringify(set);
    if (!nummer.has(sleutel)) {
      nummer.set(sleutel, sets.length);
      sets.push(set);
    }
    vellen[naam] = nummer.get(sleutel);
  }
  const tekst = `// Gemaakt door gereedschap/pixelart/lantaarn.cjs --handen — niet met de hand bijwerken.
// Waar de hand zit die de lantaarn draagt, per vel, houding, richting en beeld, tegen het anker, en hoe scheef hij hangt:
// js/tekenen.js tekent er de lantaarn van een groepsleider en de aanvoerder (werklijst vraag 171).
(function (T) {
  T.HANDEN = ${JSON.stringify({ richtingen: K.KANTEN, sets, vellen })};
})(globalThis.Spel = globalThis.Spel || {});
`;
  fs.writeFileSync(path.join(__dirname, '..', '..', 'beelden', 'handen.js'), tekst);
  console.log(`beelden/handen.js: ${Object.keys(vellen).length} vellen, ${sets.length} sets, ${(tekst.length / 1024).toFixed(1)} KB`);
}

// ---------------------------------------------------------------- de proefplaat

// Per figuur drie rijen: staan uit de acht richtingen, en lopen naar zuidwest en naar noordoost, elk beeld; 's nachts, met
// de lantaarn brandend en zijn warme licht om hem heen, op ware grootte en drie keer vergroot.
const RUIM = { b: 260, h: 240, anker: [130, 180] };
const CEL = [52, 92];
const CEL_ANKER = [26, 80];
const NACHT = [0.2, 0.24, 0.42]; // wat er van de kleur overblijft zonder licht (ongeveer js/tekenen.js, tekenNacht)
const WARM = [1.0, 0.77, 0.47]; // het licht van een lantaarn (de kleur 'drager' in js/tekenen.js)
const LICHT_STRAAL = 34; // pixels

function proef() {
  // en de drie met een hand in de zij (A1: de lantaarn op de heup)
  const figuren = [['boer', 0], ['boerin', 1], ['jongen', 1], ['boer', 5], ['boerin', 3]];
  const rijen = [];
  for (const [lijf, nr] of figuren) {
    const f = figuur(lijf, nr);
    const H = handenVan(f);
    rijen.push(K.KANTEN.map((kant, k) => ({ f, houding: 'staan', i: 0, kant, hand: H.staan[k][0] })));
    for (const kant of ['ZW', 'NO']) {
      const k = K.KANTEN.indexOf(kant);
      rijen.push(H.lopen[k].map((hand, i) => ({ f, houding: 'lopen', i, kant, hand })));
    }
  }
  const kolommen = Math.max(...rijen.map((r) => r.length));
  const plaat = new K.Plaat(CEL[0] * kolommen, CEL[1] * rijen.length);
  const gloeit = new Uint8Array(plaat.b * plaat.h); // de ruitjes van hoorn: die geven licht, en worden niet donkerder
  const lichten = [];
  const vlammen = [lantaarnBeeld(0), lantaarnBeeld(1)];
  const beelden = STANDEN.map((scheef) => (scheef ? [lantaarnBeeld(0, scheef), lantaarnBeeld(1, scheef)] : vlammen));
  const vuur = K.RAMP.vuur;
  rijen.forEach((rij, y) => {
    rij.forEach((c, x) => {
      const fig = K.losRenderen(c.f.maak({ houding: c.houding, fase: c.i / HOUDINGEN[c.houding] }), { b: RUIM.b, h: RUIM.h, anker: RUIM.anker, richting: c.kant });
      const ox = x * CEL[0];
      const oy = y * CEL[1];
      plaat.plak(fig.uitsnede(RUIM.anker[0] - CEL_ANKER[0], RUIM.anker[1] - CEL_ANKER[1], CEL[0], CEL[1]), ox, oy);
      // de lantaarn: zijn anker op de hand
      const hx = ox + CEL_ANKER[0] + c.hand[0];
      const hy = oy + CEL_ANKER[1] + c.hand[1];
      const l = beelden[STANDEN.indexOf(c.hand[2])][c.i % 2];
      const lx = Math.round(hx - LANTAARN_ANKER[0]);
      const ly = Math.round(hy - LANTAARN_ANKER[1]);
      for (let j = 0; j < l.h; j++) {
        for (let i = 0; i < l.b; i++) {
          const kleur = l.lees(i, j);
          if (!kleur) continue;
          plaat.zet(lx + i, ly + j, kleur[0], kleur[1]);
          const px = lx + i;
          const py = ly + j;
          if (px >= 0 && py >= 0 && px < plaat.b && py < plaat.h) gloeit[py * plaat.b + px] = kleur[0] === vuur ? 1 : 0;
        }
      }
      lichten.push([hx, hy + 6]);
    });
  });
  // De nacht: elke pixel krijgt het licht van de nacht en van de lantaarns die dichtbij zijn; wat gloeit, blijft zo.
  const bg = [52, 64, 44];
  const rgba = plaat.rgba('#344030');
  for (let p = 0; p < plaat.b * plaat.h; p++) {
    if (gloeit[p]) continue;
    const x = p % plaat.b;
    const y = (p - x) / plaat.b;
    let w = 0;
    for (const [lx, ly] of lichten) {
      const d = Math.hypot(x - lx, (y - ly) * 1.6);
      if (d < LICHT_STRAAL) w = Math.max(w, (1 - d / LICHT_STRAAL) ** 1.6);
    }
    for (let c = 0; c < 3; c++) {
      const licht = NACHT[c] + (WARM[c] - NACHT[c]) * w * 0.85;
      rgba[p * 4 + c] = klem(Math.round(rgba[p * 4 + c] * licht), 0, 255);
    }
    void bg;
  }
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  // ware grootte boven, en drie keer vergroot eronder
  const b = plaat.b;
  const h = plaat.h;
  const Z = 3;
  const B = b * Z;
  const Hh = h + h * Z + 8;
  const doek = Buffer.alloc(B * Hh * 4);
  for (let i = 0; i < B * Hh; i++) doek.set([20, 22, 30, 255], i * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) doek.set(rgba.subarray((y * b + x) * 4, (y * b + x) * 4 + 4), (y * B + x) * 4);
  for (let y = 0; y < h * Z; y++) {
    for (let x = 0; x < B; x++) {
      const s = ((Math.floor(y / Z)) * b + Math.floor(x / Z)) * 4;
      doek.set(rgba.subarray(s, s + 4), ((h + 8 + y) * B + x) * 4);
    }
  }
  fs.writeFileSync(path.join(uit, 'lantaarn-proef.png'), K.pngVanBeeld({ b: B, h: Hh, rgba: doek }));
  // ook het lantaarntje alleen, overdag, vergroot, om de vorm te zien
  const los = new K.Plaat(LANTAARN_CEL[0] * 2, LANTAARN_CEL[1]);
  los.plak(vlammen[0], 0, 0);
  los.plak(vlammen[1], LANTAARN_CEL[0], 0);
  fs.writeFileSync(path.join(uit, 'lantaarn-los.png'), K.png(los, 8, '#5e6a44'));
  console.log(`uit/lantaarn-proef.png (${B}x${Hh}) en uit/lantaarn-los.png`);
}

if (require.main === module) {
  if (process.argv.includes('--handen')) handenVoorHetSpel();
  else proef();
}

module.exports = { lantaarn, lantaarnBeeld, vel, beschrijving, handenVan, figuur, opScherm, LIJVEN, HOUDINGEN, STANDEN, LANTAARN_CEL, LANTAARN_ANKER };
