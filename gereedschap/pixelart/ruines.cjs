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
// (Alle tekeningen voor het spel komen er pas na de proefplaat, als Marcel hem goed vindt.)
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const K = require('./kern.cjs');
const HZ = require('./huizen.cjs');

const UIT = path.join(__dirname, 'uit', 'ruines');
const PROEF = ['wit-hut1-riet-z', 'wit-huis1-riet-z', 'wit-steen1-leien-z', 'boerderij1'];
const RAND = 16;

// Eén huis: het huis en zijn fasen op een rij, met de ankers op één lijn, als <tekening>.png.
function rij(naam) {
  const t0 = Date.now();
  const heel = HZ.renderHuis(HZ.HUIZEN[naam]);
  const fasen = HZ.BRANDFASEN.map((f) => HZ.renderHuisRuine(naam, f));
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

const args = process.argv.slice(2);
if (args[0] === 'rij') rij(args[1]);
else if (args[0] === 'proef') proef(args.length > 1 ? args.slice(1) : PROEF);
else console.log('Gebruik: node gereedschap/pixelart/ruines.cjs proef [tekening ...]');
