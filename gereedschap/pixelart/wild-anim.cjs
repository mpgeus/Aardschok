'use strict';
// Schrijft de animaties van het wild weg (wild.cjs; ontwerp/beeld.md, "Het wild"), op dezelfde manier als
// vee-anim.cjs: per vel per houding één vel (rijen zijn de acht richtingen Z ZW W NW N NO O ZO, kolommen de
// beelden), een JSON met de maten en de snelheden, en een proefplaat om te beoordelen. Meldt het als een beeld
// tegen de rand van zijn cel komt.
//   uit/wild/animaties/<naam>.json           { naam, kleur, cel, anker, snelheid, richtingen, houdingen }
//   uit/wild/animaties/<naam>-<houding>.png  de vellen die naar-spel.cjs kopieert
//   uit/wild-proef.png                       de proefplaat: de drie herten naast de boer, op ware grootte. Per
//                                            rij een hert: grazen, staan, twee loopbeelden, twee sprongen en
//                                            liggen in ZO; de onderste rij de houdingen van voren (Z).
//
// In de JSON hebben lopen en rennen elk hun `snelheid` (tegels per seconde) en hun `stap` (tegels per pas, een half
// rondje van de cyclus): het spel leidt de fase van de cyclus af uit de afgelegde afstand, zodat de voeten niet glijden.
//
//   node gereedschap/pixelart/wild-anim.cjs                (alle drie de vellen, en de proefplaat)
//   node gereedschap/pixelart/wild-anim.cjs hert0 hert2    (alleen deze vellen)
//   node gereedschap/pixelart/wild-anim.cjs --proef        (alleen de proefplaat, een halve minuut)
//   node gereedschap/pixelart/wild-anim.cjs --meet hert2   (meet hoe ver de beelden reiken, om de cel te kiezen)
//
// Daarna: node gereedschap/pixelart/naar-spel.cjs --alleen hert0,hert1,hert2
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const W = require('./wild.cjs');
const { boer } = require('./dorpelingen.cjs');

const UIT = path.join(__dirname, 'uit');
const UIT_ANIM = path.join(UIT, 'wild', 'animaties');

const args = process.argv.slice(2);
const alleenProef = args.includes('--proef');
const meten = args.includes('--meet');
const GEVRAAGD = args.filter((a) => !a.startsWith('--'));
const onbekend = GEVRAAGD.filter((n) => !W.VELLEN.some((v) => v.naam === n));
if (onbekend.length) {
  console.error(`Onbekend vel: ${onbekend.join(', ')}. Kies uit: ${W.VELLEN.map((v) => v.naam).join(', ')}.`);
  process.exit(1);
}
const TE_RENDEREN = alleenProef ? [] : GEVRAAGD.length ? W.VELLEN.filter((v) => GEVRAAGD.includes(v.naam)) : W.VELLEN;

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

// ---------------------------------------------------------------- meten

// Hoe ver reiken de beelden van elke houding van het anker af? Alle beelden in alle richtingen, in een ruime cel;
// zo is de cel in wild.cjs (CELLEN) te kiezen.
if (meten) {
  const [b, h, ax, ay] = [400, 340, 200, 250];
  const vellen = TE_RENDEREN.length ? TE_RENDEREN : W.VELLEN;
  const per = {};
  for (const vel of vellen) {
    for (const [houding, H] of Object.entries(W.HOUDINGEN)) {
      const r = (per[houding] = per[houding] || { links: 0, rechts: 0, boven: 0, onder: 0 });
      for (let i = 0; i < H.beelden; i++) {
        const m = vel.maak({ houding, fase: W.faseVan(houding, i) });
        for (const kant of K.KANTEN) {
          const k = kader(K.losRenderen(m, { b, h, anker: [ax, ay], richting: kant }));
          if (k.x1 < 0) continue;
          r.links = Math.max(r.links, ax - k.x0);
          r.rechts = Math.max(r.rechts, k.x1 - ax);
          r.boven = Math.max(r.boven, ay - k.y0);
          r.onder = Math.max(r.onder, k.y1 - ay);
        }
      }
    }
    console.log(`${vel.naam} gemeten`);
  }
  console.log(JSON.stringify(per));
  process.exit(0);
}

// ---------------------------------------------------------------- de vellen

let klem = false;
if (TE_RENDEREN.length) fs.mkdirSync(UIT_ANIM, { recursive: true });
for (const vel of TE_RENDEREN) {
  const [b, h, ax, ay] = W.celVan(vel.soort);
  const houdingen = {};
  for (const [houding, H] of Object.entries(W.HOUDINGEN)) {
    const plaat = new K.Plaat(b * H.beelden, h * K.KANTEN.length);
    for (let i = 0; i < H.beelden; i++) {
      const m = vel.maak({ houding, fase: W.faseVan(houding, i) });
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
    const regel = { bestand, beelden: H.beelden, fps: W.fpsVan(vel.soort, houding), herhaal: H.herhaal };
    const snelheid = W.SNELHEID[vel.soort][houding];
    if (snelheid) {
      // één rondje is één pas van elke poot (lopen) of één sprong (rennen); het spel rekent in "passen" van een half
      // rondje (js/sprites.js: cyclus = 2 × stap), net als bij het vee en de dorpelingen
      regel.snelheid = snelheid;
      regel.stap = W.stapVan(vel.soort, houding);
    }
    houdingen[houding] = regel;
  }
  const beschrijving = {
    naam: vel.naam,
    kleur: vel.kleurNaam,
    cel: [b, h],
    anker: [ax, ay],
    snelheid: W.SNELHEID[vel.soort].lopen,
    snelheidEenheid: 'tegels per seconde',
    richtingen: K.KANTEN,
    houdingen,
  };
  fs.writeFileSync(path.join(UIT_ANIM, `${vel.naam}.json`), JSON.stringify(beschrijving, null, 2) + '\n');
  console.log(`${vel.naam} (${vel.kleurNaam}): ${Object.keys(houdingen).length} houdingen, cel ${b}×${h}, lopen ${W.SNELHEID[vel.soort].lopen} en rennen ${W.SNELHEID[vel.soort].rennen} tegels/s`);
}
if (klem) process.exitCode = 1;

// ---------------------------------------------------------------- de proefplaat

// Op ware grootte, want zo staan ze in het spel (dat alles nog eens twee keer vergroot). Elke rij heeft één grondlijn,
// zodat de herten en de boer op dezelfde hoogte staan en je hun maat kunt vergelijken. Rij 1 tot 3: een hert per
// rij, in ZO: grazen, staan, twee loopbeelden, twee sprongen en liggen; rij 4: de houdingen van voren (Z), elk hert
// in andere houdingen.
function proefplaat() {
  const GROEN = '#56703a';
  const vel = (naam) => W.VELLEN.find((v) => v.naam === naam);
  const beeld = (naam, houding, kant, i = 0) => {
    const v = vel(naam);
    const [b, h, ax, ay] = W.celVan(v.soort);
    return { p: K.losRenderen(v.maak({ houding, fase: W.faseVan(houding, i) }), { b, h, anker: [ax, ay], richting: kant }), ax, ay };
  };
  const man = { p: K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: 112, h: 124, anker: [56, 110], richting: 'Z' }), ax: 56, ay: 110 };
  const rijen = [];
  for (let k = 0; k < 3; k++) {
    const n = `hert${k}`;
    rijen.push([
      man,
      beeld(n, 'grazen', 'ZO', 2),
      beeld(n, 'staan', 'ZO', 1),
      beeld(n, 'lopen', 'ZO', 0),
      beeld(n, 'lopen', 'ZO', 4),
      beeld(n, 'rennen', 'ZO', 1),
      beeld(n, 'rennen', 'ZO', 4),
      beeld(n, 'liggen', 'ZO', 0),
    ]);
  }
  rijen.push([
    man,
    beeld('hert0', 'staan', 'Z', 1),
    beeld('hert0', 'grazen', 'Z', 2),
    beeld('hert1', 'lopen', 'Z', 2),
    beeld('hert1', 'rennen', 'Z', 1),
    beeld('hert2', 'staan', 'Z', 5),
    beeld('hert2', 'rennen', 'Z', 4),
    beeld('hert2', 'liggen', 'Z', 0),
    beeld('hert0', 'liggen', 'Z', 0),
  ]);

  // per rij: hoe ver het boven en onder de grondlijn reikt; per beeld: zijn eigen breedte
  const RAND = 2;
  const GAT = 4;
  const maten = rijen.map((rij) => {
    let boven = 0;
    let onder = 0;
    const stukken = rij.map((s) => {
      const k = kader(s.p);
      boven = Math.max(boven, s.ay - k.y0);
      onder = Math.max(onder, k.y1 - s.ay);
      return { ...s, x0: k.x0 - RAND, b: k.x1 - k.x0 + 1 + 2 * RAND };
    });
    return { stukken, boven: boven + RAND, onder: onder + RAND };
  });
  const breed = Math.max(...maten.map((r) => r.stukken.reduce((som, s) => som + s.b + GAT, 0)));
  const hoog = maten.reduce((som, r) => som + r.boven + r.onder + 1, 0) + GAT * (maten.length - 1);
  const plaat = new K.Plaat(breed, hoog);
  let y = 0;
  for (const r of maten) {
    let x = 0;
    for (const s of r.stukken) {
      plaat.plak(s.p.uitsnede(s.x0, s.ay - r.boven, s.b, r.boven + r.onder + 1), x, y);
      x += s.b + GAT;
    }
    y += r.boven + r.onder + 1 + GAT;
  }
  fs.mkdirSync(UIT, { recursive: true });
  fs.writeFileSync(path.join(UIT, 'wild-proef.png'), K.png(plaat, 1, GROEN));
  console.log(`wild-proef.png: ${plaat.b}×${plaat.h}`);
  if (plaat.b > 1000 || plaat.h > 560) console.log('  let op: groter dan 1000×560');
}
if (alleenProef || TE_RENDEREN.length === W.VELLEN.length) proefplaat();
