// Wie zoekt een omweg (T.ontwijk -> omweg -> T.zoekPad), hoe vaak lukt het, en wat kost het: drie dagen op 30x op het
// proefdorp, zoals gereedschap/grootte/meet.cjs.
const path = require('path');
const R = '/home/user/Aardschok/gereedschap/grootte/';
const { T, beginSpel, beeld, zetDag, nu } = require(R + 'harnas.cjs');
const S = beginSpel({});
zetDag(S, 104, 20);
S.kalender.snelheid = Number(process.argv[2] || 30);
let huidig = null;
const ontwijk = T.ontwijk;
T.ontwijk = function (S_, w, e, v, dt) { huidig = e; try { return ontwijk.apply(this, arguments); } finally { huidig = null; } };
const zoek = T.zoekPad;
const per = new Map();
const soort = (e) => e.beest ? `beest ${e.soort || ''}${e.leider ? ' leider' : e.groep ? ' volger' : ''}` : e.dier ? `dier ${e.soort || ''}` : e.kar ? 'kar' : e.soldaat || e.kant === 'monster' ? 'soldaat/monster' : 'mens';
T.zoekPad = function () {
  const t0 = nu(); const r = zoek.apply(this, arguments); const ms = nu() - t0;
  const k = huidig ? 'omweg: ' + soort(huidig) : 'ander zoeken';
  const s = per.get(k) || { n: 0, mis: 0, ms: 0, msMis: 0 };
  s.n++; s.ms += ms; if (!r || !r.length) { s.mis++; s.msMis += ms; }
  per.set(k, s);
  return r;
};
const dagen = 3, dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / S.kalender.snelheid / dt);
const tijden = [];
for (let i = 0; i < dagen * perDag; i++) { const t0 = nu(); beeld(S, dt); tijden.push(nu() - t0); }
const tot = tijden.reduce((a, b) => a + b, 0);
console.log(`snelheid ${S.kalender.snelheid}x, ${tijden.length} tikken, totaal ${tot.toFixed(0)} ms, gem ${(tot / tijden.length).toFixed(2)} ms`);
console.log(`wezens: ${S.wereld.wezens.length} (beesten ${S.wereld.wezens.filter(e => e.beest).length}, mensen ${S.wereld.wezens.filter(e => !e.beest && !e.dier && !e.kar).length})`);
for (const [k, s] of [...per].sort((a, b) => b[1].ms - a[1].ms))
  console.log(`${k.padEnd(34)} ${String(s.n).padStart(6)} keer, ${String(s.mis).padStart(6)} mislukt; ${s.ms.toFixed(0).padStart(5)} ms (${(100 * s.ms / tot).toFixed(0)}% van de tik), waarvan mislukt ${s.msMis.toFixed(0)} ms`);
