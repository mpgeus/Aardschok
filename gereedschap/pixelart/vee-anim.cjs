'use strict';
// Schrijft de animaties van het vee weg (vee.cjs; ontwerp/beeld.md, "Het vee"), op dezelfde manier
// als bosvijanden-anim.cjs: per vel per houding één vel (rijen zijn de acht richtingen
// Z ZW W NW N NO O ZO, kolommen de beelden), een JSON met de maten en de loopsnelheid, en een
// proefplaat om te beoordelen. Meldt het als een beeld tegen de rand van zijn cel komt.
//   uit/vee/animaties/<naam>.json           { naam, kleur, cel, anker, snelheid, richtingen, houdingen }
//   uit/vee/animaties/<naam>-<houding>.png  de vellen die naar-spel.cjs kopieert
//   uit/vee-proef.png                        de proefplaat: de drie koeien en de drie schapen naast
//                                            de boer, op ware grootte. Per rij een kleur: grazen,
//                                            staan (ook van voren), twee loopbeelden en liggen in ZO;
//                                            de onderste rij de andere houdingen van voren (Z).
//
//   node gereedschap/pixelart/vee-anim.cjs                (alle zes vellen, en de proefplaat)
//   node gereedschap/pixelart/vee-anim.cjs koe0 schaap2   (alleen deze vellen)
//   node gereedschap/pixelart/vee-anim.cjs --proef        (alleen de proefplaat, een halve minuut)
//
// Daarna: node gereedschap/pixelart/naar-spel.cjs --alleen koe0,koe1,koe2,schaap0,schaap1,schaap2
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const V = require('./vee.cjs');
const { boer } = require('./dorpelingen.cjs');

const UIT = path.join(__dirname, 'uit');
const UIT_ANIM = path.join(UIT, 'vee', 'animaties');

const args = process.argv.slice(2);
const alleenProef = args.includes('--proef');
const GEVRAAGD = args.filter((a) => !a.startsWith('--'));
const onbekend = GEVRAAGD.filter((n) => !V.VELLEN.some((v) => v.naam === n));
if (onbekend.length) {
  console.error(`Onbekend vel: ${onbekend.join(', ')}. Kies uit: ${V.VELLEN.map((v) => v.naam).join(', ')}.`);
  process.exit(1);
}
const TE_RENDEREN = alleenProef ? [] : GEVRAAGD.length ? V.VELLEN.filter((v) => GEVRAAGD.includes(v.naam)) : V.VELLEN;

// de rand van wat er in een beeld staat
function kader(p) {
  let x0 = p.b, x1 = -1, y0 = p.h, y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { x0, x1, y0, y1 };
}

// ---------------------------------------------------------------- de vellen

let klem = false;
if (TE_RENDEREN.length) fs.mkdirSync(UIT_ANIM, { recursive: true });
for (const vel of TE_RENDEREN) {
  const [b, h, ax, ay] = V.celVan(vel.soort);
  const houdingen = {};
  for (const [houding, H] of Object.entries(V.HOUDINGEN)) {
    const plaat = new K.Plaat(b * H.beelden, h * K.KANTEN.length);
    for (let i = 0; i < H.beelden; i++) {
      const m = vel.maak({ houding, fase: V.faseVan(houding, i) });
      K.KANTEN.forEach((kant, r) => {
        const p = K.losRenderen(m, { b, h, anker: [ax, ay], richting: kant });
        plaat.plak(p, i * b, r * h);
        const k = kader(p);
        if (k.x1 >= 0 && (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= b - 1 || k.y1 >= h - 1)) {
          console.log(`  RAND ${vel.naam} ${houding} beeld ${i} ${kant}: ${k.x0}..${k.x1}, ${k.y0}..${k.y1} in ${b}×${h}`);
          klem = true;
        }
      });
    }
    const bestand = `${vel.naam}-${houding}.png`;
    fs.writeFileSync(path.join(UIT_ANIM, bestand), K.png(plaat, 1));
    const fps = V.fpsVan(vel.soort, houding);
    const regel = { bestand, beelden: H.beelden, fps, herhaal: H.herhaal };
    if (houding === 'lopen') {
      // één rondje is één pas van elke poot; het spel rekent in "passen" van een half rondje
      // (js/sprites.js: cyclus = 2 × stap), net als bij de dorpelingen
      regel.snelheid = V.SNELHEID[vel.soort];
      regel.stap = +((V.SNELHEID[vel.soort] * (H.beelden / fps)) / 2).toFixed(3);
    }
    houdingen[houding] = regel;
  }
  const beschrijving = {
    naam: vel.naam,
    kleur: vel.kleurNaam,
    cel: [b, h],
    anker: [ax, ay],
    snelheid: V.SNELHEID[vel.soort],
    snelheidEenheid: 'tegels per seconde',
    richtingen: K.KANTEN,
    houdingen,
  };
  fs.writeFileSync(path.join(UIT_ANIM, `${vel.naam}.json`), JSON.stringify(beschrijving, null, 2) + '\n');
  console.log(`${vel.naam} (${vel.kleurNaam}): ${Object.keys(houdingen).length} houdingen, cel ${b}×${h}, ${V.SNELHEID[vel.soort]} tegels/s`);
}
if (klem) process.exitCode = 1;

// ---------------------------------------------------------------- de proefplaat

// Op ware grootte, want zo staan ze in het spel (dat alles nog eens twee keer vergroot). Elke rij
// heeft één grondlijn, zodat de koe, het schaap en de boer op dezelfde hoogte staan en je hun maat
// kunt vergelijken. Rij 1 tot 3: een kleur per rij, koe en schaap, in ZO (en staan ook in Z);
// rij 4: de andere houdingen van voren, elk in een andere kleur.
function proefplaat() {
  const GROEN = '#56703a';
  const vel = (naam) => V.VELLEN.find((v) => v.naam === naam);
  const beeld = (naam, houding, kant, i = 0) => {
    const v = vel(naam);
    const [b, h, ax, ay] = V.celVan(v.soort);
    return { p: K.losRenderen(v.maak({ houding, fase: V.faseVan(houding, i) }), { b, h, anker: [ax, ay], richting: kant }), ax, ay };
  };
  const man = { p: K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: 112, h: 124, anker: [56, 110], richting: 'Z' }), ax: 56, ay: 110 };
  const rijen = [];
  for (let k = 0; k < 3; k++) {
    rijen.push([
      man,
      beeld(`koe${k}`, 'grazen', 'ZO', 2),
      beeld(`koe${k}`, 'staan', 'ZO', 1),
      beeld(`koe${k}`, 'staan', 'Z', 5),
      beeld(`koe${k}`, 'lopen', 'ZO', 0),
      beeld(`koe${k}`, 'lopen', 'ZO', 4),
      beeld(`koe${k}`, 'liggen', 'ZO', 0),
      null,
      beeld(`schaap${k}`, 'grazen', 'ZO', 2),
      beeld(`schaap${k}`, 'staan', 'ZO', 1),
      beeld(`schaap${k}`, 'lopen', 'ZO', 2),
      beeld(`schaap${k}`, 'liggen', 'ZO', 0),
    ]);
  }
  rijen.push([
    man,
    beeld('koe0', 'grazen', 'Z', 2),
    beeld('koe1', 'lopen', 'Z', 2),
    beeld('koe2', 'liggen', 'Z', 0),
    null,
    beeld('schaap0', 'grazen', 'Z', 2),
    beeld('schaap1', 'staan', 'Z', 1),
    beeld('schaap2', 'lopen', 'Z', 2),
    beeld('schaap0', 'liggen', 'Z', 0),
  ]);

  // per rij: hoe ver het boven en onder de grondlijn reikt; per beeld: zijn eigen breedte
  const RAND = 2;
  const GAT = 4;
  const TUSSEN = 18; // tussen de koeien en de schapen
  const maten = rijen.map((rij) => {
    let boven = 0;
    let onder = 0;
    const stukken = rij.map((s) => {
      if (!s) return null;
      const k = kader(s.p);
      boven = Math.max(boven, s.ay - k.y0);
      onder = Math.max(onder, k.y1 - s.ay);
      return { ...s, x0: k.x0 - RAND, b: k.x1 - k.x0 + 1 + 2 * RAND };
    });
    return { stukken, boven: boven + RAND, onder: onder + RAND };
  });
  const breed = Math.max(...maten.map((r) => r.stukken.reduce((som, s) => som + (s ? s.b + GAT : TUSSEN), 0)));
  const hoog = maten.reduce((som, r) => som + r.boven + r.onder + 1, 0) + GAT * (maten.length - 1);
  const plaat = new K.Plaat(breed, hoog);
  let y = 0;
  for (const r of maten) {
    let x = 0;
    for (const s of r.stukken) {
      if (!s) {
        x += TUSSEN;
        continue;
      }
      plaat.plak(s.p.uitsnede(s.x0, s.ay - r.boven, s.b, r.boven + r.onder + 1), x, y);
      x += s.b + GAT;
    }
    y += r.boven + r.onder + 1 + GAT;
  }
  const bestand = path.join(UIT, 'vee-proef.png');
  fs.writeFileSync(bestand, K.png(plaat, 1, GROEN));
  console.log(`vee-proef.png: ${plaat.b}×${plaat.h}`);
  if (plaat.b > 900 || plaat.h > 400) console.log('  let op: groter dan 900×400');
}
if (alleenProef || TE_RENDEREN.length === V.VELLEN.length) proefplaat();
