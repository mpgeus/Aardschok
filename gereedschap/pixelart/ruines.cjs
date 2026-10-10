// De fasen van het afbranden van een huis (js/brand.js; werklijst vraag 144, 3; Marcel, 9 okt: "Huis moet afgebrokkeld
// zijn. Echt kapot. Structureel ingestort etc", "Moet wel handgetekend lijken", "Ja ik wil balken zien, losse stenen,
// plukjes zwart geblakerd riet van het dak", en "Ik wil natuurlijk ook verschillende fasen van afbranden / kapot"). Elk
// huis van de huizenbouwer (huizen.cjs, HUIZEN) krijgt ze, uit het huis zelf gesneden (renderHuisRuine in huizen.cjs):
// geschroeid, het dak valt, ingestort, opgeruimd (BRANDFASEN).
//
//   node gereedschap/pixelart/ruines.cjs proef [tekening ...]   een proefplaat: per huis het huis en zijn fasen naast
//                                                                elkaar, in gereedschap/pixelart/uit/ruines/proef.png
//                                                                (niet in git); elk huis in een eigen proces
//
//   node gereedschap/pixelart/ruines.cjs spel [naam of stijl ...] de fasen voor het spel (vraag 144, de ronde van alle
//                                                                tekeningen): per huis dat kan branden een eigen vel,
//                                                                tegels/brandfasen/<tekening>.png, en tegels/brandfasen.json
//                                                                + .js (zoals de bouwfasen). Wat er al is, blijft staan,
//                                                                dus het kan in delen: een stijl ("wit") is alles wat met
//                                                                "wit-" begint. Elk huis in een eigen draad
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const K = require('./kern.cjs');
const HZ = require('./huizen.cjs');

const UIT = path.join(__dirname, 'uit', 'ruines');
const PROEF = ['wit-hut1-riet-z', 'wit-huis1-riet-z', 'wit-steen1-leien-z', 'boerderij1'];
const RAND = 16;

// Eén huis: het huis en zijn fasen op een rij, met de ankers op één lijn, als <tekening>.png.
function rij(naam) {
  const t0 = Date.now();
  const heel = HZ.renderHuis(HZ.HUIZEN[naam]);
  // de fasen, en van ingestort een tweede variant (elk huis valt anders in)
  const fasen = [...HZ.BRANDFASEN.map((f) => HZ.renderHuisRuine(naam, f)), HZ.renderHuisRuine(naam, 'ingestort', 1)];
  const platen = [{ plaat: heel.plaat, ax: heel.anker[0], ay: heel.anker[1] }, ...fasen.map((r) => ({ plaat: r.plaat, ax: r.ankerX, ay: r.ankerY }))];
  const boven = Math.max(...platen.map((p) => p.ay));
  const onder = Math.max(...platen.map((p) => p.plaat.h - p.ay));
  const vel = new K.Plaat(platen.reduce((n, p) => n + p.plaat.b + RAND, RAND), boven + onder);
  let x = RAND;
  for (const p of platen) {
    vel.plak(p.plaat, x, boven - p.ay);
    x += p.plaat.b + RAND;
  }
  fs.writeFileSync(path.join(UIT, `${naam}.png`), K.png(vel, 1, '#4a5a3a'));
  console.log(`  ${naam.padEnd(22)} ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

// De proefplaat: elk huis in een eigen proces, dan de rijen onder elkaar (met Python's PIL niet nodig: een kleine
// PNG-lezer is er niet, dus de rijen staan als losse bestanden naast proef.html).
function proef(namen) {
  fs.mkdirSync(UIT, { recursive: true });
  let klaar = 0;
  for (const naam of namen) {
    const p = spawn(process.execPath, [__filename, 'rij', naam], { stdio: 'inherit' });
    p.on('exit', () => {
      if (++klaar < namen.length) return;
      const html = `<!doctype html><meta charset="utf-8"><body style="background:#4a5a3a;margin:0">${namen.map((n) => `<img src="${n}.png" style="display:block;image-rendering:pixelated">`).join('')}`;
      fs.writeFileSync(path.join(UIT, 'proef.html'), html);
      console.log(`  ${path.join(UIT, 'proef.html')}`);
    });
  }
}

// ---------------------------------------------------------------- voor het spel

// Wat kan branden (js/brand.js: een huis met een stand, T.standVan): de hutten, huizen, stenen huizen, boerderijen en de
// woontoren, van de jonge tekening (een oude brandt net zo af). De fasen in deze volgorde op het vel, en van ingestort een
// tweede variant (elk huis valt anders in), als "ingestort2".
const BRANDBAAR = new Set(['hut', 'huis', 'stenenHuis', 'boerderij', 'woontoren']);
const SPEL_FASEN = [...HZ.BRANDFASEN.map((f) => [f, f, 0]), ['ingestort2', 'ingestort', 1]];
const TEGELS = path.join(__dirname, '..', '..', 'tegels');
const brandbaar = (naam) => {
  const s = HZ.HUIZEN[naam];
  return !!s && !s.jong && s.fasen !== false && BRANDBAAR.has(s.gebouw);
};

if (!isMainThread && workerData === 'ruines') {
  parentPort.on('message', ({ i, naam }) => {
    const t0 = Date.now();
    try {
      const platen = SPEL_FASEN.map(([, fase, variant]) => {
        const r = HZ.renderHuisRuine(naam, fase, variant);
        return { b: r.plaat.b, h: r.plaat.h, px: r.plaat.px, anker: [r.ankerX, r.ankerY + 16] };
      });
      parentPort.postMessage({ i, naam, platen, ms: Date.now() - t0 });
    } catch (e) {
      parentPort.postMessage({ i, naam, fout: e.message });
    }
  });
}

function renderAlle(namen, draden) {
  return new Promise((klaar, fout) => {
    let volgende = 0;
    let gedaan = 0;
    const werkers = [];
    const geef = (w) => {
      if (volgende < namen.length) w.postMessage({ i: volgende, naam: namen[volgende++] });
    };
    for (let n = 0; n < Math.min(draden, namen.length); n++) {
      const w = new Worker(__filename, { workerData: 'ruines' });
      w.on('error', fout);
      w.on('message', (m) => {
        if (m.fout) console.warn(`  overgeslagen: ${m.naam} (${m.fout})`);
        else {
          // elk huis meteen op schijf, zodat een taak die stopt niets kwijtraakt
          schrijfSpel([m]);
          console.log(`  ${m.naam.padEnd(26)} ${(m.ms / 1000).toFixed(1)} s  (${gedaan + 1}/${namen.length})`);
        }
        if (++gedaan === namen.length) {
          for (const x of werkers) x.terminate();
          klaar();
        } else geef(w);
      });
      werkers.push(w);
      geef(w);
    }
  });
}

// Per huis een eigen vel met zijn fasen strak gesneden (inpakken.cjs), en in brandfasen.json waar elke fase staat, met
// zijn anker (dezelfde afspraak als tegels.json en de bouwfasen). Wat er al in stond, blijft.
function schrijfSpel(lijst) {
  const I = require('./inpakken.cjs');
  fs.mkdirSync(path.join(TEGELS, 'brandfasen'), { recursive: true });
  const jsonPad = path.join(TEGELS, 'brandfasen.json');
  const fasen = fs.existsSync(jsonPad) ? JSON.parse(fs.readFileSync(jsonPad, 'utf8')).fasen : {};
  for (const m of lijst) {
    const beelden = m.platen.map((p) => {
      const plaat = new K.Plaat(p.b, p.h);
      plaat.px = p.px;
      return I.beeldVanPlaat(plaat);
    });
    const rij = I.leegBeeld(beelden.reduce((n, b) => n + b.b, 0), Math.max(...beelden.map((b) => b.h)));
    let x = 0;
    const cellen = beelden.map((b, i) => {
      I.kopieer(b, [0, 0, b.b, b.h], rij, x, 0);
      const c = { cel: [x, 0, b.b, b.h], anker: m.platen[i].anker };
      x += b.b;
      return c;
    });
    const uit = I.pakVelIn(rij, cellen);
    const bestand = `brandfasen/${m.naam}.png`;
    fs.writeFileSync(path.join(TEGELS, bestand), I.pngVanBeeld(uit.beeld));
    fasen[m.naam] = { bestand, fasen: uit.tegels.map((t, i) => t && { x: t.cel[0], y: t.cel[1], b: t.cel[2], h: t.cel[3], anker: t.anker, naam: SPEL_FASEN[i][0] }) };
  }
  const data = {
    _lees_dit: 'De fasen van het afbranden per huis (gereedschap/pixelart/ruines.cjs spel; vraag 144, 3) — niet met de hand '
      + 'bijwerken. Sleutel is de naam van de jonge tekening op het vel huizen. Per huis een eigen vel (bestand, vanaf '
      + 'tegels/), dat het spel pas laadt als het brandt; per fase snijdt x/y/b/h de cel uit dat vel, en anker is het punt '
      + 'in die cel dat op het anker van het huis komt (dezelfde afspraak als tegels.json). De volgorde: geschroeid, het '
      + 'dak valt, binnengestort, ingestort, opgeruimd, en ingestort2 (een tweede variant).',
    fasen,
  };
  const json = JSON.stringify(data, null, 1);
  fs.writeFileSync(jsonPad, json + '\n');
  fs.writeFileSync(
    path.join(TEGELS, 'brandfasen.js'),
    '// Gemaakt door gereedschap/pixelart/ruines.cjs — niet met de hand bijwerken.\n'
      + '// Dezelfde inhoud als brandfasen.json, als script, zodat file:// het ook kan lezen (zie js/sprites.js).\n'
      + '(function (T) {\n  T.BRANDFASEN = '
      + json.replace(/\n/g, '\n  ')
      + ';\n})(globalThis.Spel = globalThis.Spel || {});\n',
  );
}

async function spel(gevraagd) {
  const namen = Object.keys(HZ.HUIZEN).filter(brandbaar).filter((n) => !gevraagd.length || gevraagd.some((g) => n === g || n.startsWith(`${g}-`)));
  if (!namen.length) {
    console.log('geen huizen om te renderen');
    return;
  }
  const draden = Math.max(1, Math.min(8, os.cpus().length - 1));
  console.log(`brandfasen: ${namen.length} huizen, ${draden} draden`);
  const t0 = Date.now();
  await renderAlle(namen, draden);
  console.log(`klaar in ${((Date.now() - t0) / 60000).toFixed(1)} minuten`);
}

if (isMainThread && require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === 'rij') rij(args[1]);
  else if (args[0] === 'proef') proef(args.length > 1 ? args.slice(1) : PROEF);
  else if (args[0] === 'spel') spel(args.slice(1)).catch((e) => { console.error(e); process.exit(1); });
  else console.log('Gebruik: node gereedschap/pixelart/ruines.cjs proef [tekening ...], of spel [naam of stijl ...]');
}

module.exports = { BRANDBAAR, SPEL_FASEN, brandbaar, schrijfSpel };
