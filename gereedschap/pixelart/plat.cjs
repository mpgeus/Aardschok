'use strict';
// De platte tekeningen van de huizen, voor de weergave plat in het spel (werklijst vraag 176, stap 4a; ontwerp/beeld.md,
// "Zicht in een dicht dorp"): de muren als een doorsnede, een vloer in het eigen dak. De snede staat in huizen.cjs
// (renderHuisPlat, naast de bouwfasen); dit bestand rendert ze en schrijft ze weg.
//
//   node gereedschap/pixelart/plat.cjs proef [tekening ...]     een proefplaat: per huis de tekening van het spel en de
//                                                                platte naast elkaar, op hun anker, in
//                                                                gereedschap/pixelart/uit/plat/proef.png (niet in git)
//
//   node gereedschap/pixelart/plat.cjs spel [naam of stijl ...]  de platte tekeningen voor het spel: per jonge tekening
//                                                                tegels/plat/<tekening>.png, strak gesneden met een eigen
//                                                                anker, en tegels/plat.json + .js (zoals de daksneeuw). Een
//                                                                oude tekening deelt die van zijn jonge (dezelfde vorm).
//                                                                Wat er al is, blijft staan, dus het kan in delen: een
//                                                                stijl ("wit") is alles wat met "wit-" begint. Elk huis in
//                                                                een eigen draad en meteen op schijf; met --erbij alleen
//                                                                wat er nog niet is (na een taak die stopte)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const K = require('./kern.cjs');
const HZ = require('./huizen.cjs');

const UIT = path.join(__dirname, 'uit', 'plat');
const TEGELS = path.join(__dirname, '..', '..', 'tegels');
// riet, spanen, leien en pannen, in de vier stijlen en het gehucht, een paar standen, en twee gebouwen uit delen
const PROEF = [
  'hut1', 'wit-huis1-riet-z', 'planken-hut1-spanen-z', 'oker-huis2-leien-o', 'roze-steen10-pannen-z', 'wit-steen1-baksteen-n',
  'planken-boerderij2-pannen-w', 'planken-herberg1-spanen-z', 'wit-woontoren-baksteen-z', 'oker-kapel-leien-z', 'wit-zagerij-riet-z',
];
const jong = (naam) => !!HZ.HUIZEN[naam] && !HZ.HUIZEN[naam].jong;

if (!isMainThread && workerData === 'plat') {
  parentPort.on('message', ({ i, naam }) => {
    try {
      const r = HZ.renderHuisPlat(naam);
      parentPort.postMessage({ i, naam, b: r.plaat.b, h: r.plaat.h, px: r.plaat.px, anker: r.anker, ms: r.ms });
    } catch (e) {
      parentPort.postMessage({ i, naam, fout: e.message });
    }
  });
}

// Een wachtrij waar elke draad de volgende uit pakt (zoals ruines.cjs); klaar(m) krijgt elk huis zodra het af is.
function renderAlle(namen, draden, klaar) {
  return new Promise((alles, fout) => {
    let volgende = 0;
    let gedaan = 0;
    const werkers = [];
    if (!namen.length) {
      alles();
      return;
    }
    const geef = (w) => {
      if (volgende < namen.length) w.postMessage({ i: volgende, naam: namen[volgende++] });
    };
    for (let n = 0; n < Math.min(draden, namen.length); n++) {
      const w = new Worker(__filename, { workerData: 'plat' });
      w.on('error', fout);
      w.on('message', (m) => {
        if (m.fout) console.warn(`  overgeslagen: ${m.naam} (${m.fout})`);
        else {
          const plaat = new K.Plaat(m.b, m.h);
          plaat.px = m.px;
          klaar({ naam: m.naam, plaat, anker: m.anker });
          console.log(`  ${m.naam.padEnd(28)} ${m.b}×${m.h}  ${(m.ms / 1000).toFixed(1)} s  (${gedaan + 1}/${namen.length})`);
        }
        if (++gedaan === namen.length) {
          for (const x of werkers) x.terminate();
          alles();
        } else geef(w);
      });
      werkers.push(w);
      geef(w);
    }
  });
}

// ---------------------------------------------------------------- de proefplaat

// De tekening van het spel uit tegels/huizen/, met haar anker (tegels.js).
function tekeningVanHetSpel(naam) {
  if (!globalThis.Spel) globalThis.Spel = {};
  if (!globalThis.Spel.TEGELS) require(path.join(TEGELS, 'tegels.js'));
  const t = globalThis.Spel.TEGELS.huizen.tiles.find((x) => x && x.naam === naam);
  if (!t) throw new Error(`geen tekening ${naam} in tegels.js`);
  return { beeld: K.leesPng(fs.readFileSync(path.join(TEGELS, '..', t.bestand))), anker: t.anker };
}

// Per huis gewoon en plat naast elkaar, met de ankers op één lijn, drie paren per rij.
function proefplaat(lijst) {
  const RAND = 16;
  const PER_RIJ = 3;
  const paren = lijst.map((r) => {
    const g = tekeningVanHetSpel(r.naam);
    return [g, { beeld: { b: r.plaat.b, h: r.plaat.h, rgba: r.plaat.rgba() }, anker: r.anker }];
  });
  const rijen = [];
  for (let i = 0; i < paren.length; i += PER_RIJ) rijen.push(paren.slice(i, i + PER_RIJ));
  const maten = rijen.map((rij) => {
    const stukken = rij.flat();
    const boven = Math.max(...stukken.map((s) => s.anker[1]));
    const onder = Math.max(...stukken.map((s) => s.beeld.h - s.anker[1]));
    const breed = rij.reduce((n, [g, p]) => n + g.beeld.b + p.beeld.b + RAND * 3, RAND);
    return { boven, h: boven + onder + RAND, breed };
  });
  const b = Math.max(...maten.map((m) => m.breed));
  const h = maten.reduce((n, m) => n + m.h, RAND);
  const rgba = Buffer.alloc(b * h * 4);
  for (let i = 0; i < b * h; i++) rgba.set([74, 90, 58, 255], i * 4);
  const plak = ({ beeld, anker }, x, ya) => {
    for (let y = 0; y < beeld.h; y++) {
      for (let c = 0; c < beeld.b; c++) {
        const j = (y * beeld.b + c) * 4;
        if (beeld.rgba[j + 3] < 128) continue;
        beeld.rgba.copy(rgba, ((ya - anker[1] + y) * b + x + c) * 4, j, j + 4);
      }
    }
  };
  let y = RAND;
  rijen.forEach((rij, i) => {
    let x = RAND;
    for (const [g, p] of rij) {
      plak(g, x, y + maten[i].boven);
      x += g.beeld.b + RAND;
      plak(p, x, y + maten[i].boven);
      x += p.beeld.b + RAND * 2;
    }
    y += maten[i].h;
  });
  fs.mkdirSync(UIT, { recursive: true });
  const pad = path.join(UIT, 'proef.png');
  fs.writeFileSync(pad, K.pngVanBeeld({ b, h, rgba }));
  console.log(`${path.relative(process.cwd(), pad)}: ${b}×${h}`);
}

async function proef(namen) {
  const lijst = [];
  await renderAlle(namen, Math.min(8, os.cpus().length), (r) => lijst.push(r));
  lijst.sort((a, c) => namen.indexOf(a.naam) - namen.indexOf(c.naam));
  proefplaat(lijst);
}

// ---------------------------------------------------------------- voor het spel

// Elk huis een eigen plaatje, en in plat.json zijn bestand, maat en anker. Wat er al in stond, blijft.
function schrijfSpel(lijst) {
  const I = require('./inpakken.cjs');
  fs.mkdirSync(path.join(TEGELS, 'plat'), { recursive: true });
  const jsonPad = path.join(TEGELS, 'plat.json');
  const platten = fs.existsSync(jsonPad) ? JSON.parse(fs.readFileSync(jsonPad, 'utf8')).platten : {};
  for (const r of lijst) {
    const bestand = `plat/${r.naam}.png`;
    fs.writeFileSync(path.join(TEGELS, bestand), I.pngVanBeeld(I.beeldVanPlaat(r.plaat)));
    platten[r.naam] = { bestand, b: r.plaat.b, h: r.plaat.h, anker: r.anker };
  }
  const gesorteerd = Object.fromEntries(Object.keys(platten).sort().map((n) => [n, platten[n]]));
  const data = {
    _lees_dit: 'De platte tekeningen van de huizen (gereedschap/pixelart/plat.cjs spel; huizen.cjs, renderHuisPlat; vraag 176, '
      + 'stap 4a) — niet met de hand bijwerken. Sleutel is de naam van de jonge tekening op het vel huizen (een oude, '
      + '"<naam>-oud", deelt die van zijn jonge). Elk een eigen plaatje (bestand, vanaf tegels/), dat het spel pas laadt als '
      + 'je plat kijkt; anker is het punt in dat plaatje dat op het anker van het huis komt (dezelfde afspraak als tegels.json).',
    platten: gesorteerd,
  };
  const json = JSON.stringify(data, null, 1);
  fs.writeFileSync(jsonPad, json + '\n');
  fs.writeFileSync(
    path.join(TEGELS, 'plat.js'),
    '// Gemaakt door gereedschap/pixelart/plat.cjs — niet met de hand bijwerken.\n'
      + '// Dezelfde inhoud als plat.json, als script, zodat file:// het ook kan lezen (zie js/sprites.js).\n'
      + '(function (T) {\n  T.PLAT = '
      + json.replace(/\n/g, '\n  ')
      + ';\n})(globalThis.Spel = globalThis.Spel || {});\n',
  );
}

async function spel(gevraagd, erbij = false) {
  const jsonPad = path.join(TEGELS, 'plat.json');
  const al = erbij && fs.existsSync(jsonPad) ? JSON.parse(fs.readFileSync(jsonPad, 'utf8')).platten : {};
  const namen = Object.keys(HZ.HUIZEN).filter(jong).filter((n) => !al[n]).filter((n) => !gevraagd.length || gevraagd.some((g) => n === g || n.startsWith(`${g}-`)));
  if (!namen.length) {
    console.log('geen huizen om te renderen');
    return;
  }
  // meer dan acht draden helpt nauwelijks (hyperthreading)
  const draden = Math.max(1, Math.min(8, os.cpus().length));
  console.log(`plat: ${namen.length} huizen, ${draden} draden`);
  const t0 = Date.now();
  // elk huis meteen op schijf, zodat een taak die stopt niets kwijtraakt
  await renderAlle(namen, draden, (r) => schrijfSpel([r]));
  console.log(`klaar in ${((Date.now() - t0) / 60000).toFixed(1)} minuten`);
}

if (isMainThread && require.main === module) {
  const args = process.argv.slice(2);
  const namen = args.slice(1).filter((a) => !a.startsWith('--'));
  const fout = (e) => {
    console.error(e);
    process.exit(1);
  };
  if (args[0] === 'proef') proef(namen.length ? namen : PROEF).catch(fout);
  else if (args[0] === 'spel') spel(namen, args.includes('--erbij')).catch(fout);
  else console.log('Gebruik: node gereedschap/pixelart/plat.cjs proef [tekening ...], of spel [naam of stijl ...] [--erbij]');
}

module.exports = { PROEF, schrijfSpel };
