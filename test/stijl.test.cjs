// De stijlafwerking (gereedschap/pixelart/stijl.cjs; werklijst vraag 180, gereedschap/ai/hd-stijl.md): de delen die elk
// ding gebruikt. Een kleurreeks loopt van donker naar licht en schuift van koel naar warm; een verdeling telt op tot één;
// en niets hangt aan toeval per beeld (dan flikkert het bij het draaien).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const S = require('../gereedschap/pixelart/stijl.cjs');

test('een kleurreeks loopt van donker naar licht, de schaduw koeler dan het licht', () => {
  const hout = S.reeks([109, 62, 28], 7, { koel: 15, warm: 15 });
  assert.equal(hout.length, 7);
  for (let k = 1; k < hout.length; k++) assert.ok(S.lum(hout[k]) > S.lum(hout[k - 1]), `toon ${k} lichter dan ${k - 1}`);
  assert.ok(hout.every((c) => c.every((v) => v >= 0 && v <= 255)));
  // de tint (OKLCh, in graden): de schaduw schuift naar rood en paars, het licht naar geel
  const tint = hout.map((c) => S.naarLch(c)[2]);
  assert.ok(tint[0] < tint[3] && tint[3] < tint[6], `de tint schuift van ${tint[0].toFixed(0)} naar ${tint[6].toFixed(0)}`);
});

test('een verdeling telt op tot één, de lichtste toon het zeldzaamst', () => {
  for (const n of [5, 6, 7, 8]) {
    const v = S.verdeling(n);
    assert.equal(v.length, n);
    assert.ok(Math.abs(v.reduce((a, b) => a + b, 0) - 1) < 1e-9);
    assert.ok(v[n - 1] < Math.max(...v.slice(0, n - 1)));
  }
});

test('de stijlafwerking hangt niet aan toeval', () => {
  const bron = fs.readFileSync(path.join(__dirname, '..', 'gereedschap', 'pixelart', 'stijl.cjs'), 'utf8');
  assert.ok(!/Math\.random/.test(bron), 'stijl.cjs gebruikt Math.random: dan flikkert een detail per beeld');
});
