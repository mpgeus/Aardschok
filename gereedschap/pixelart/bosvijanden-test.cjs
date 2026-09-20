'use strict';
// bosvijanden-test.cjs : controles op de bosvijanden, zonder naar plaatjes te hoeven kijken.
// Stilstaand:
// - elke richting past in de cel van 112×124 (anker 56,110), met een pixel ruimte;
// - de grensbol van elk deel bevat het deel echt (steekproef op een rooster), anders valt er
//   stilletjes een stuk weg;
// - elk deel ligt binnen de bol van het model (midden, straal), anders snijdt de renderer het af;
// - de ogen zijn te zien in de richtingen waarin het dier naar de camera kijkt.
// In beweging:
// - zonder houding komt er precies hetzelfde uit als in de weggeschreven stroken;
// - elke houding, elk beeld laat zich bouwen;
// - een voet die op de grond staat, schuift per beeld precies de loopsnelheid naar achteren;
// - de poten halen hun voetdoel (anders schiet de voet los van het been).
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const V = require('./bosvijanden.cjs');

const CEL = 112;
const HOOG = 124;
const ANKER = [56, 110];
const VOOR = ['Z', 'ZW', 'ZO', 'W', 'O'];
const gevallen = [
  // naam, model, hoogte in de zijaanzichten (W, O) in pixels
  ['wolf', V.wolf(), [45, 56]],
  ['reuzenspin', V.reuzenspin(), [38, 54]],
  ['kobold speer', V.kobold('speer'), [55, 64]],
  ['kobold knots', V.kobold('knots'), [55, 64]],
];
// naam van de strook, hoe je het model maakt, de cellennaam en de loopsnelheid
const VIJANDEN = [
  ['wolf', (o) => V.wolf(o), 'wolf', V.SNELHEID.wolf],
  ['reuzenspin', (o) => V.reuzenspin(o), 'reuzenspin', V.SNELHEID.reuzenspin],
  ['kobold', (o) => V.kobold('speer', o), 'kobold', V.SNELHEID.kobold],
  ['kobold-knots', (o) => V.kobold('knots', o), 'kobold', V.SNELHEID.kobold],
];

let fouten = 0;
function controle(naam, f) {
  try {
    f();
    console.log('  ok  ', naam);
  } catch (e) {
    fouten++;
    console.log('  FOUT', naam, '\n       ', e.message);
  }
}

for (const [naam, m, hoogte] of gevallen) {
  console.log(naam);
  controle('past in de cel, in alle acht richtingen', () => {
    for (const kant of K.KANTEN) {
      const p = K.losRenderen(m, { b: CEL, h: HOOG, anker: ANKER, richting: kant });
      for (let y = 0; y < HOOG; y++) {
        for (let x = 0; x < CEL; x++) {
          if (!p.lees(x, y)) continue;
          assert(x > 0 && y > 0 && x < CEL - 1 && y < HOOG - 1, `${kant}: pixel op de rand (${x}, ${y})`);
        }
      }
    }
  });
  controle(`hoogte in de zijaanzichten tussen ${hoogte[0]} en ${hoogte[1]} px`, () => {
    for (const kant of ['W', 'O']) {
      const p = K.losRenderen(m, { b: CEL, h: HOOG, anker: ANKER, richting: kant });
      let y0 = HOOG;
      let y1 = -1;
      for (let y = 0; y < HOOG; y++) for (let x = 0; x < CEL; x++) if (p.lees(x, y)) (y0 = Math.min(y0, y)), (y1 = Math.max(y1, y));
      const h = y1 - y0 + 1;
      assert(h >= hoogte[0] && h <= hoogte[1], `${kant}: ${h} px`);
    }
  });
  controle('grensbollen bevatten hun deel', () => {
    m.delen.forEach((d, i) => {
      if (!d.g || d.uit) return;
      const [cx, cy, cz, r] = d.g;
      const R = r + 4;
      for (let x = cx - R; x <= cx + R; x += 0.5) {
        for (let y = cy - R; y <= cy + R; y += 0.5) {
          for (let z = cz - R; z <= cz + R; z += 0.5) {
            const buiten = Math.hypot(x - cx, y - cy, z - cz) - r;
            if (buiten <= 0) continue;
            assert(d.f(x, y, z) > 0, `deel ${i}: binnen het deel maar ${buiten.toFixed(2)} buiten zijn grensbol, op (${x}, ${y}, ${z})`);
          }
        }
      }
    });
  });
  controle('alle delen binnen de bol van het model', () => {
    const [mx, my, mz] = m.midden;
    m.delen.forEach((d, i) => {
      if (!d.g || d.uit) return;
      const ver = Math.hypot(d.g[0] - mx, d.g[1] - my, d.g[2] - mz) + d.g[3];
      assert(ver <= m.straal, `deel ${i} reikt tot ${ver.toFixed(1)}, de straal is ${m.straal}`);
    });
  });
  controle('ogen te zien als hij naar de camera kijkt', () => {
    for (const kant of VOOR) {
      const B = new K.Beeld(CEL, HOOG, ANKER[0], ANKER[1]);
      K.tekenModel(B, m, { richting: kant });
      let n = 0;
      for (let i = 0; i < CEL * HOOG; i++) if (B.vlag[i] & K.VLAG.GLOEI) n++;
      assert(n >= 2, `${kant}: ${n} gloeiende pixels`);
    }
  });
}

// ---------------------------------------------------------------- in beweging

console.log('animatie');
const R = V.rig;
controle('zonder houding komt de oude strook eruit', () => {
  for (const [naam, maak] of VIJANDEN) {
    const bestand = path.join(__dirname, 'uit', 'vijanden', `${naam}-richtingen.png`);
    if (!fs.existsSync(bestand)) continue;
    const vel = new K.Plaat(CEL * 8, HOOG);
    K.KANTEN.forEach((kant, i) => vel.plak(K.losRenderen(maak(), { b: CEL, h: HOOG, anker: ANKER, richting: kant }), i * CEL, 0));
    assert(Buffer.compare(K.png(vel, 1), fs.readFileSync(bestand)) === 0, `${naam}: de stilstaande strook is veranderd`);
  }
});
controle('elke houding en elk beeld laat zich bouwen', () => {
  for (const [naam, maak] of VIJANDEN) {
    for (const [houding, H] of Object.entries(V.HOUDINGEN)) {
      for (let i = 0; i < H.beelden; i++) {
        const m = maak({ houding, fase: V.faseVan(houding, i) });
        assert(m.delen.length > 10, `${naam} ${houding} ${i}: te weinig delen`);
      }
    }
  }
});

// hoe ver een voet per beeld hoort te schuiven als hij op de grond staat
const perBeeld = (snelheid) => (snelheid * (64 / Math.SQRT2)) / V.HOUDINGEN.lopen.fps;
controle('geen glijdende voeten in de looppas', () => {
  const kijk = [
    ['wolf', (f) => R.wolfHouding('lopen', f).voeten.map((v) => v.p), 1.55, V.SNELHEID.wolf],
    ['reuzenspin', (f) => R.spinHouding('lopen', f).voeten.map((v) => v.p), 0.55, V.SNELHEID.reuzenspin],
    ['kobold', (f) => R.koboldHouding('lopen', f, 'speer').voeten.map((v) => v.p), 3.25, V.SNELHEID.kobold],
  ];
  for (const [naam, voeten, grond, snelheid] of kijk) {
    const stap = perBeeld(snelheid);
    let staand = 0;
    for (let i = 0; i < 8; i++) {
      const a = voeten(V.faseVan('lopen', i));
      const b = voeten(V.faseVan('lopen', (i + 1) % 8));
      for (let p = 0; p < a.length; p++) {
        if (a[p][2] >= grond || b[p][2] >= grond) continue;
        staand++;
        const d = b[p][1] - a[p][1];
        assert(Math.abs(d + stap) < 1e-6, `${naam} beeld ${i} voet ${p}: schuift ${d.toFixed(3)} in plaats van ${(-stap).toFixed(3)}`);
      }
    }
    // twee benen geven vier keer een voet die blijft staan, vier of acht benen meer
    assert(staand >= 4, `${naam}: maar ${staand} keer een voet op de grond in de hele pas`);
  }
});
controle('poten halen hun voetdoel', () => {
  const wolfRust = (s, vy) => [
    [
      [s * 5.8, 13, 29],
      [s * 5.6, 10.5 + vy, 18.5],
      [s * 5.3, 12.8 + vy, 5.2],
      [s * 5.3, 15.2 + vy, 1.5],
    ],
    [
      [s * 6, -15, 30],
      [s * 6.2, -9, 18.5],
      [s * 5.6, -18, 9],
      [s * 5.4, -15.4, 1.5],
    ],
  ];
  const koboldRust = (s) => {
    const vy = s < 0 ? 2.2 : -0.6;
    return [
      [s * 3.6, -1, 19],
      [s * 5.6, 3.2 + vy * 0.5, 11],
      [s * 4.4, 0.6 + vy, 3.2],
    ];
  };
  const marge = 1.8;
  for (const houding of Object.keys(V.HOUDINGEN)) {
    const H = V.HOUDINGEN[houding];
    for (let i = 0; i < H.beelden; i++) {
      const fase = V.faseVan(houding, i);
      // wolf
      let P = R.wolfHouding(houding, fase);
      let T = R.wolfStanden(P);
      for (const [s, vy] of [
        [-1, 2.5],
        [1, -0.5],
      ]) {
        const [voor, achter] = wolfRust(s, vy);
        for (const [pot, isVoor] of [
          [voor, true],
          [achter, false],
        ]) {
          const idx = (isVoor ? 0 : 2) + (s < 0 ? 0 : 1);
          const bereikt = R.tfPunt(R.wolfPoot(T, P, idx, pot, isVoor)[2], pot[3]);
          const e = Math.hypot(bereikt[0] - P.voeten[idx].p[0], bereikt[1] - P.voeten[idx].p[1], bereikt[2] - P.voeten[idx].p[2]);
          assert(e < marge, `wolf ${houding} beeld ${i} poot ${idx}: ${e.toFixed(2)} van zijn doel`);
        }
      }
      // spin
      P = R.spinHouding(houding, fase);
      T = R.spinStanden(P);
      for (let pr = 0; pr < 4; pr++) {
        for (const s of [-1, 1]) {
          const j = pr * 2 + (s > 0 ? 1 : 0);
          const r = R.spinPootRust(pr, s);
          const bereikt = R.tfPunt(R.spinPoot(T, P, j, [r.P0, r.P1, r.P2], r.d)[1], r.P2);
          const doel = P.lijfVast >= 0.5 ? R.tfPunt(T.lijf, P.voeten[j].p) : P.voeten[j].p;
          const e = Math.hypot(bereikt[0] - doel[0], bereikt[1] - doel[1], bereikt[2] - doel[2]);
          assert(e < marge, `spin ${houding} beeld ${i} poot ${j}: ${e.toFixed(2)} van zijn doel`);
        }
      }
      // kobold, met beide wapens
      for (const w of ['speer', 'knots']) {
        P = R.koboldHouding(houding, fase, w);
        T = R.koboldStanden(P, w);
        for (const s of [-1, 1]) {
          const idx = s < 0 ? 0 : 1;
          const been = koboldRust(s);
          const bereikt = R.tfPunt(R.koboldBeen(T, P, idx, been)[2], been[2]);
          const doel = P.lijfVoet >= 0.5 ? R.tfPunt(T.lijf, P.voeten[idx].p) : P.voeten[idx].p;
          const e = Math.hypot(bereikt[0] - doel[0], bereikt[1] - doel[1], bereikt[2] - doel[2]);
          assert(e < marge, `kobold ${w} ${houding} beeld ${i} been ${idx}: ${e.toFixed(2)} van zijn doel`);
        }
      }
    }
  }
});

console.log(fouten ? `${fouten} fout(en)` : 'alles goed');
process.exitCode = fouten ? 1 : 0;
