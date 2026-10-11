// De ossenkar en het kamp van het lege begin (gereedschap/pixelart/ossenkar.cjs en kamp.cjs; ontwerp/beeld.md, "De ossenkar
// en het kamp", vraag 152). Alleen de kunst: dat de kar rijdt zonder te glijden, en dat de vellen in beelden/ passen bij
// wat de beschrijving zegt. Wat het spel ermee doet, komt met stap 1 van vraag 152.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const O = require('../gereedschap/pixelart/ossenkar.cjs');
const Kamp = require('../gereedschap/pixelart/kamp.cjs');
const Vee = require('../gereedschap/pixelart/vee.cjs');

const WORTEL = path.join(__dirname, '..');
const TEGEL = 64 / Math.SQRT2;
const BESCHRIJVING = JSON.parse(fs.readFileSync(path.join(WORTEL, 'beelden', 'beschrijving.json'), 'utf8'));
function maatVan(pad) {
  const buf = fs.readFileSync(pad);
  return { b: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

test('de kar rijdt in het tempo van de os, en zijn wiel rolt zonder te glijden', () => {
  const H = O.HOUDINGEN.lopen;
  assert.equal(O.SNELHEID, Vee.SNELHEID.os);
  assert.equal(H.fps, Vee.LOOP_FPS.os);
  // in een rondje rijdt de kar zo ver als het wiel over zijn omtrek afrolt
  const weg = (O.SNELHEID * TEGEL * H.beelden) / H.fps;
  assert.ok(Math.abs(O.WIEL.draai * O.WIEL.r - weg) < 1e-9, `het wiel rolt ${(O.WIEL.draai * O.WIEL.r).toFixed(2)}, de kar rijdt ${weg.toFixed(2)}`);
  // en na een rondje staan de spaken weer waar ze stonden: de lus sluit
  const spaak = (2 * Math.PI) / O.WIEL.spaken;
  assert.ok(Math.abs(O.WIEL.draai / spaak - Math.round(O.WIEL.draai / spaak)) < 1e-9);
});

test('de os: een staande voet schuift precies zo hard terug als de kar vooruitgaat', () => {
  const H = Vee.HOUDINGEN.lopen;
  const fps = Vee.fpsVan('os', 'lopen');
  const perBeeld = (Vee.SNELHEID.os * TEGEL) / fps / Vee.SCHAAL.os;
  let gemeten = 0;
  for (let i = 0; i < H.beelden; i++) {
    const a = Vee.rig.houdingVan('os', 'lopen', i / H.beelden);
    const b = Vee.rig.houdingVan('os', 'lopen', (i + 1) / H.beelden);
    for (let v = 0; v < 4; v++) {
      const rust = Vee.rig.KOE.stand[v];
      const opGrond = (p) => p.buig === 0 && Math.abs(p.p[2] - rust[2]) < 1e-9;
      if (!opGrond(a.voeten[v]) || !opGrond(b.voeten[v]) || a.voeten[v].p[1] - b.voeten[v].p[1] < 0) continue;
      assert.ok(Math.abs(a.voeten[v].p[1] - b.voeten[v].p[1] - perBeeld) < 1e-6, `voet ${v} beeld ${i}`);
      gemeten++;
    }
  }
  assert.ok(gemeten >= 8, `maar ${gemeten} keer een staande voet gezien`);
});

test('de vellen van de ossenkar in beelden/: staan en lopen, een rij per richting, en lopen op de snelheid van de kar', () => {
  for (const vel of O.VELLEN) {
    const f = BESCHRIJVING.figuren[vel.naam];
    if (!f) continue;
    assert.deepEqual(Object.keys(f.houdingen).sort(), ['lopen', 'staan'], vel.naam);
    const l = f.houdingen.lopen;
    assert.equal(l.snelheid, O.SNELHEID, vel.naam);
    assert.equal(l.stap, +((O.SNELHEID * (l.beelden / l.fps)) / 2).toFixed(3), `${vel.naam}: de pas past bij de snelheid`);
    for (const h of Object.values(f.houdingen)) {
      const { b, h: hoog } = maatVan(path.join(WORTEL, 'beelden', 'figuren', h.bestand));
      assert.equal(b, h.cel[0] * h.beelden, `${h.bestand}: een kolom per beeld`);
      assert.equal(hoog, h.cel[1] * f.richtingen.length, `${h.bestand}: een rij per richting`);
    }
  }
});

test('het kamp in beelden/: een rij per soort en een kolom per richting, en het vuur met een cel per beeld en stand', () => {
  const k = BESCHRIJVING.kamp;
  if (!k) return;
  assert.deepEqual(k.soorten, Kamp.SOORTEN.map(([naam]) => naam));
  assert.deepEqual(k.richtingen, Kamp.RICHTINGEN);
  const vel = maatVan(path.join(WORTEL, 'beelden', k.bestand));
  assert.deepEqual([vel.b, vel.h], [k.cel[0] * k.richtingen.length, k.cel[1] * k.soorten.length]);
  const vuur = maatVan(path.join(WORTEL, 'beelden', k.vuur.bestand));
  assert.deepEqual([vuur.b, vuur.h], [k.vuur.cel[0] * (k.vuur.beelden + k.vuur.standen.length - 1), k.vuur.cel[1]]);
});
