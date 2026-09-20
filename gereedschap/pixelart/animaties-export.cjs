// Schrijft de animaties van de figuren weg naar uit/animaties/:
//
//   <figuur>-<houding>.png   een vel: een rij per richting (Z ZW W NW N NO O ZO), een kolom per
//                            beeld. De cel is 112×124 met de voeten op (56, 110); past een
//                            houding daar niet in (liggen, uithalen), dan wordt de cel ruimer
//                            en staat dat in de JSON.
//   <figuur>.json            { naam, cel, anker, snelheid, houdingen: { ... } }
//   <figuur>-<houding>-zo.png   bewegende PNG (×3, richting ZO) om de beweging te bekijken
//
// Het rekenwerk gaat over alle kernen tegelijk; elk beeld is een losse opdracht voor een werker.
//
//   node gereedschap/pixelart/animaties-export.cjs      (of: npm run pixelart:animaties)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Worker, isMainThread, parentPort } = require('worker_threads');
const K = require('./kern.cjs');
const F = { ...require('./figuren.cjs'), ...require('./figuren2.cjs') };
const { apng } = require('./apng.cjs');

// Ruime cel om in te renderen; daarna wordt er krap uit gesneden. De figuur staat met zijn
// voeten op het anker, net als in het spel.
const RUIM = { b: 288, h: 232, anker: [144, 200] };
const CEL = [112, 124];
const ANKER = [56, 110];

function bouw(figuur, houding, fase, leeftijd) {
  const stand = { houding, fase };
  if (figuur === 'tovenaar') return F.tovenaar(leeftijd, stand);
  if (figuur === 'wim') return F.wim(stand);
  if (figuur === 'skelet') return F.skelet(stand);
  return F.slijm(false, stand);
}
const renderBeeld = (t) =>
  K.losRenderen(bouw(t.figuur, t.houding, t.fase, t.leeftijd), { b: RUIM.b, h: RUIM.h, anker: RUIM.anker, richting: t.kant });

// ---------------------------------------------------------------- de werker

if (!isMainThread) {
  parentPort.on('message', (taak) => {
    const p = renderBeeld(taak);
    parentPort.postMessage({ i: taak.i, px: p.px }, [p.px.buffer]);
  });
}

// ---------------------------------------------------------------- wat er beweegt

// beelden, fps en herhalen komen uit ontwerp/beeld.md. `leeftijden` maakt één vel per leeftijd:
// de tovenaar loopt op zijn 84e anders dan op zijn 99e.
const FIGUREN = [
  {
    naam: 'tovenaar',
    snelheid: { 84: F.loopSnelheid(84), 92: F.loopSnelheid(92), 99: F.loopSnelheid(99) },
    houdingen: [
      { naam: 'staan', beelden: 4, fps: 4, herhaal: true, leeftijd: 84 },
      { naam: 'lopen', beelden: 8, fps: 10, herhaal: true, leeftijden: [84, 92, 99] },
      { naam: 'slaan', beelden: 6, fps: 12, herhaal: false, leeftijd: 84 },
      { naam: 'spreuk', beelden: 6, fps: 12, herhaal: false, leeftijd: 84 },
      { naam: 'geraakt', beelden: 3, fps: 12, herhaal: false, leeftijd: 84 },
      { naam: 'sterven', beelden: 8, fps: 10, herhaal: false, leeftijd: 100 },
    ],
  },
  {
    naam: 'wim',
    snelheid: 2.0,
    houdingen: [
      { naam: 'staan', beelden: 4, fps: 4, herhaal: true },
      { naam: 'lopen', beelden: 8, fps: 12, herhaal: true },
      { naam: 'vegen', beelden: 8, fps: 8, herhaal: true },
      { naam: 'praten', beelden: 6, fps: 6, herhaal: true },
    ],
  },
  {
    naam: 'skelet',
    snelheid: 2.2,
    houdingen: [
      { naam: 'staan', beelden: 4, fps: 4, herhaal: true },
      { naam: 'lopen', beelden: 8, fps: 10, herhaal: true },
      { naam: 'aanval', beelden: 6, fps: 12, herhaal: false },
      { naam: 'geraakt', beelden: 3, fps: 12, herhaal: false },
      { naam: 'sterven', beelden: 8, fps: 10, herhaal: false },
    ],
  },
  {
    naam: 'slijm',
    snelheid: 1.4,
    houdingen: [
      { naam: 'staan', beelden: 4, fps: 4, herhaal: true },
      { naam: 'lopen', beelden: 8, fps: 10, herhaal: true },
      { naam: 'aanval', beelden: 6, fps: 12, herhaal: false },
      { naam: 'geraakt', beelden: 3, fps: 12, herhaal: false },
      { naam: 'sterven', beelden: 8, fps: 10, herhaal: false },
    ],
  },
];

// ---------------------------------------------------------------- hulp

// bij een herhalende houding loopt de fase tot net vóór 1 (beeld n sluit aan op beeld 0),
// bij een houding die eenmaal speelt van 0 tot en met 1
const faseVan = (i, n, herhaal) => (herhaal ? i / n : n > 1 ? i / (n - 1) : 0);

// de krappe doos om alles wat er op de plaat staat
function doosVan(plaat) {
  let x0 = plaat.b;
  let x1 = 0;
  let y0 = plaat.h;
  let y1 = 0;
  for (let y = 0; y < plaat.h; y++) {
    for (let x = 0; x < plaat.b; x++) {
      if (plaat.px[(y * plaat.b + x) * 2] < 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < x0 ? { x0: 0, y0: 0, b: 1, h: 1 } : { x0, y0, b: x1 - x0 + 1, h: y1 - y0 + 1 };
}
// hoever een doos vanaf het anker reikt: links, rechts, boven, onder
const reikVan = (d, anker) => ({ l: anker[0] - d.x0, r: d.x0 + d.b - anker[0], b: anker[1] - d.y0, o: d.y0 + d.h - anker[1] });
const samen = (a, b) => ({ l: Math.max(a.l, b.l), r: Math.max(a.r, b.r), b: Math.max(a.b, b.b), o: Math.max(a.o, b.o) });
// De standaardcel als het past, anders een ruimere die wel past. Het anker blijft midden onder,
// zodat het spel de figuur altijd op dezelfde manier op zijn tegel zet.
function celVoor(doos) {
  const marge = 3;
  if (doos.l + marge <= ANKER[0] && doos.r + marge <= CEL[0] - ANKER[0] && doos.b + marge <= ANKER[1] && doos.o + marge <= CEL[1] - ANKER[1]) {
    return { cel: CEL.slice(), anker: ANKER.slice() };
  }
  const halfB = Math.max(ANKER[0], Math.max(doos.l, doos.r) + marge);
  const breed = Math.max(CEL[0], 2 * Math.ceil(halfB / 2));
  const onder = Math.max(CEL[1] - ANKER[1], doos.o + marge);
  const hoog = Math.max(CEL[1], Math.ceil((Math.max(ANKER[1], doos.b + marge) + onder) / 2) * 2);
  return { cel: [breed, hoog], anker: [breed / 2, hoog - onder] };
}

// ---------------------------------------------------------------- de werkers aansturen

function maakPloeg(n) {
  const werkers = [];
  for (let i = 0; i < n; i++) {
    const w = new Worker(__filename);
    w.unref();
    werkers.push(w);
  }
  return {
    // taken: [{ figuur, houding, fase, leeftijd, kant }] → platen in dezelfde volgorde
    doe(taken) {
      return new Promise((klaar, fout) => {
        const uit = new Array(taken.length);
        let volgende = 0;
        let gedaan = 0;
        const geef = (w) => {
          if (volgende >= taken.length) return;
          const i = volgende++;
          w.postMessage({ ...taken[i], i });
        };
        for (const w of werkers) {
          w.removeAllListeners('message');
          w.removeAllListeners('error');
          w.on('error', fout);
          w.on('message', (m) => {
            const p = new K.Plaat(RUIM.b, RUIM.h);
            p.px = m.px;
            uit[m.i] = p;
            if (++gedaan === taken.length) klaar(uit);
            else geef(w);
          });
        }
        for (const w of werkers) geef(w);
      });
    },
    stop() {
      for (const w of werkers) w.terminate();
    },
  };
}

// ---------------------------------------------------------------- alles maken

async function alles() {
  const UIT = path.join(__dirname, 'uit', 'animaties');
  fs.mkdirSync(UIT, { recursive: true });
  const ploeg = maakPloeg(Math.max(2, Math.min(12, os.cpus().length - 1)));
  const begin = Date.now();
  const loopPlaten = {}; // om later de voorbeelden mee te maken
  let vellen = 0;

  for (const fig of FIGUREN) {
    // Eerst alles renderen en krap uitsnijden, dan pas de cel kiezen: één cel voor alle
    // houdingen van een figuur, zodat het spel maar één maat hoeft te kennen.
    const werk = [];
    let reik = { l: 1, r: 1, b: 1, o: 1 };
    for (const h of fig.houdingen) {
      for (const leeftijd of h.leeftijden || [h.leeftijd]) {
        const taken = [];
        for (const kant of K.KANTEN) {
          for (let i = 0; i < h.beelden; i++) {
            taken.push({ figuur: fig.naam, houding: h.naam, fase: faseVan(i, h.beelden, h.herhaal), leeftijd, kant });
          }
        }
        const platen = await ploeg.doe(taken);
        const stukken = platen.map((p) => {
          const d = doosVan(p);
          reik = samen(reik, reikVan(d, RUIM.anker));
          return { plaat: p.uitsnede(d.x0, d.y0, d.b, d.h), dx: d.x0 - RUIM.anker[0], dy: d.y0 - RUIM.anker[1] };
        });
        werk.push({ h, leeftijd, stukken, sleutel: h.leeftijden ? `${h.naam}-${leeftijd}` : h.naam });
      }
    }
    const { cel, anker } = celVoor(reik);
    const beschrijving = {
      naam: fig.naam,
      cel,
      anker,
      snelheid: fig.snelheid,
      richtingen: K.KANTEN,
      houdingen: {},
    };
    for (const { h, leeftijd, stukken, sleutel } of werk) {
      const bestand = `${fig.naam}-${sleutel}.png`;
      const cellen = stukken.map((s) => {
        const p = new K.Plaat(cel[0], cel[1]);
        p.plak(s.plaat, anker[0] + s.dx, anker[1] + s.dy);
        return p;
      });
      const vel = new K.Plaat(cel[0] * h.beelden, cel[1] * K.KANTEN.length);
      cellen.forEach((p, k) => vel.plak(p, (k % h.beelden) * cel[0], Math.floor(k / h.beelden) * cel[1]));
      fs.writeFileSync(path.join(UIT, bestand), K.png(vel, 1));
      vellen++;

      const regel = { bestand, beelden: h.beelden, fps: h.fps, herhaal: h.herhaal };
      if (h.leeftijden || h.naam === 'sterven') regel.leeftijd = leeftijd;
      if (h.naam === 'lopen') {
        regel.snelheid = typeof fig.snelheid === 'object' ? fig.snelheid[leeftijd] : fig.snelheid;
        regel.stap = +((regel.snelheid * (h.beelden / h.fps)) / 2).toFixed(3); // tegels per pas
      }
      beschrijving.houdingen[sleutel] = regel;

      // bewegend voorbeeld: richting ZO, drie keer zo groot
      const zo = K.KANTEN.indexOf('ZO') * h.beelden;
      const reeks = cellen.slice(zo, zo + h.beelden);
      const duur = reeks.map((_, i) => (!h.herhaal && i === h.beelden - 1 ? 1.2 : 1 / h.fps));
      fs.writeFileSync(path.join(UIT, `${fig.naam}-${sleutel}-zo.png`), apng(reeks, { duur, schaal: 3, herhaal: 0 }));
      if (h.naam === 'lopen') loopPlaten[`${fig.naam}-${leeftijd}`] = { snij: cellen, cel, anker, fps: h.fps, beelden: h.beelden };
    }
    fs.writeFileSync(path.join(UIT, `${fig.naam}.json`), JSON.stringify(beschrijving, null, 2) + '\n');
  }

  // de tovenaar op zijn 84e, 92e en 99e naast elkaar, om de ouderdom te vergelijken
  naastElkaar(
    path.join(UIT, 'tovenaar-lopen-leeftijden.png'),
    [84, 92, 99].map((j) => loopPlaten[`tovenaar-${j}`]),
    'ZO',
    10,
  );
  // en elke figuur lopend in alle acht richtingen
  for (const fig of FIGUREN) {
    const jaar = fig.naam === 'tovenaar' ? 84 : undefined;
    const bron = loopPlaten[`${fig.naam}-${jaar}`];
    if (!bron) continue;
    alleKanten(path.join(UIT, `${fig.naam}-lopen-richtingen.png`), bron);
  }

  ploeg.stop();
  console.log(`${vellen} vellen in ${((Date.now() - begin) / 1000).toFixed(1)} s`);
  for (const f of fs.readdirSync(UIT).sort()) {
    const b = fs.readFileSync(path.join(UIT, f));
    if (f.endsWith('.png')) console.log(f.padEnd(34), `${b.readUInt32BE(16)}×${b.readUInt32BE(20)}`);
  }
}

// een bewegende PNG met een paar reeksen naast elkaar (zelfde aantal beelden)
function naastElkaar(bestand, bronnen, kant, fps) {
  const k = K.KANTEN.indexOf(kant);
  const n = bronnen[0].beelden;
  const breed = bronnen.reduce((s, b) => s + b.cel[0], 0);
  const hoog = Math.max(...bronnen.map((b) => b.cel[1]));
  const platen = [];
  for (let i = 0; i < n; i++) {
    const p = new K.Plaat(breed, hoog);
    let x = 0;
    for (const b of bronnen) {
      p.plak(b.snij[k * b.beelden + i], x, hoog - b.cel[1]);
      x += b.cel[0];
    }
    platen.push(p);
  }
  fs.writeFileSync(bestand, apng(platen, { fps, schaal: 2, herhaal: 0 }));
}
// een bewegende PNG met alle acht richtingen naast elkaar, in de volgorde van de vellen
function alleKanten(bestand, bron) {
  const n = bron.beelden;
  const kol = 4;
  const rijen = Math.ceil(K.KANTEN.length / kol);
  const platen = [];
  for (let i = 0; i < n; i++) {
    const p = new K.Plaat(bron.cel[0] * kol, bron.cel[1] * rijen);
    K.KANTEN.forEach((kant, k) => p.plak(bron.snij[k * n + i], (k % kol) * bron.cel[0], Math.floor(k / kol) * bron.cel[1]));
    platen.push(p);
  }
  fs.writeFileSync(bestand, apng(platen, { fps: bron.fps, schaal: 2, herhaal: 0 }));
}

if (isMainThread) {
  alles().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
