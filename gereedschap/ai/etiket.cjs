// Opschriften op een vergelijkingsplaat (werklijst vraag 180; Marcel, 18 okt: "graag even markeren"): een titel bovenaan,
// en per vakje wat het is. Het tekenen van de letters doet etiket.ps1 met .NET van Windows (de tekenstraat heeft geen
// letters). `rijen` is dezelfde lijst als voor een plaat van naastElkaar: per vakje een beeld { b, h, rgba } en, als het
// een label heeft, `etiket`. Zo weet de plaat zelf waar elk label komt.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const K = require('../pixelart/kern.cjs');

const leeg = (b, h) => ({ b, h, rgba: Buffer.alloc(b * h * 4) });
function plakOp(doel, bron, ox, oy) {
  for (let y = 0; y < bron.h; y++) for (let x = 0; x < bron.b; x++) {
    const s = (y * bron.b + x) * 4;
    const dx = ox + x, dy = oy + y;
    if (bron.rgba[s + 3] < 128 || dx < 0 || dy < 0 || dx >= doel.b || dy >= doel.h) continue;
    bron.rgba.copy(doel.rgba, (dy * doel.b + dx) * 4, s, s + 4);
  }
}

// Rijen van vakjes naast en onder elkaar op een donkere grond, onderaan gelijk; geeft het doek en waar de labels komen.
function plaatMetLabels(rijen, gat = 10) {
  const breed = Math.max(...rijen.map((r) => r.reduce((s, x) => s + x.b + gat, gat)));
  const hoog = rijen.reduce((s, r) => s + Math.max(...r.map((x) => x.h)) + gat, gat);
  const doek = leeg(breed, hoog);
  for (let i = 0; i < breed * hoog; i++) doek.rgba.set([40, 44, 38, 255], i * 4);
  const labels = [];
  let y = gat;
  for (const r of rijen) {
    let x = gat;
    const rh = Math.max(...r.map((s) => s.h));
    for (const s of r) {
      plakOp(doek, s, x, y + rh - s.h);
      if (s.etiket) labels.push({ tekst: s.etiket, x: x + 2, y: y + rh - s.h + 2 });
      x += s.b + gat;
    }
    y += rh + gat;
  }
  return { doek, labels };
}

// Bewaar de plaat met zijn titel, een regel onderaan (mag leeg), en de labels.
function bewaar(pad, rijen, titel, onder = '') {
  const { doek, labels } = plaatMetLabels(rijen);
  fs.writeFileSync(pad, K.pngVanBeeld(doek));
  const spec = path.join(os.tmpdir(), `etiket-${process.pid}-${Date.now()}.json`);
  fs.writeFileSync(spec, JSON.stringify({ in: pad, uit: `${pad}.tmp.png`, titel, onder, labels }), 'utf8');
  try {
    execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'etiket.ps1'), '-Spec', spec], { stdio: 'pipe' });
    fs.renameSync(`${pad}.tmp.png`, pad);
  } catch (e) {
    console.log(`(geen opschriften: ${String(e.stderr || e.message).slice(0, 200)})`);
  } finally {
    fs.rmSync(spec, { force: true });
  }
  return pad;
}

// Een vakje met een label.
const met = (beeld, etiket) => Object.assign({}, beeld, { etiket });

module.exports = { bewaar, plaatMetLabels, met };
