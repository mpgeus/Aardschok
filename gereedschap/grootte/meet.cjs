'use strict';
// node meet.cjs N [--werk] [--indeling erven|compact] [--kaart L] [--dagen 1] [--start 20] [--snelheid 30] [--delen]
//                 [--prof bestand.cpuprofile] [--uit bestand.json]
// Bouwt een dorp van N bewoners (bouw.cjs), speelt het op 30× (een beeld: dt = 1/60, dtWereld = 0,5 s) en meet per
// beeld de tijd van de wereld (werkBij uit js/main.js, zonder scherm), de dagtik en het opslaan. Met --prof een
// CPU-profiel van de meting (lees het met profiel.cjs). npm run grootte (grootte.cjs) draait dit per N.
const fs = require('node:fs');
const { T, beginSpel, beeld, zetDag, nu, pct, gem } = require('./harnas.cjs');
const { bouwDorp } = require('./bouw.cjs');

const arg = (naam, std) => {
  const i = process.argv.indexOf('--' + naam);
  if (i < 0) return std;
  const v = process.argv[i + 1];
  return v == null || v.startsWith('--') ? true : isNaN(Number(v)) ? v : Number(v);
};
const N = Number(process.argv[2] || 26);
const metWerk = !!arg('werk', false);
const indeling = arg('indeling', 'erven');
const startUur = arg('start', 12);
const kaart = arg('kaart', 0);
const dagen = arg('dagen', 1);
const metDelen = !!arg('delen', false);
const dagStart = arg('dag', 104); // 15 zomermaand
const uit = arg('uit', null);
const snelheid = arg('snelheid', 30);
const profUit = arg('prof', null);
const maxFrames = arg('frames', 0); // 0 = hele dagen
const vanUur = arg('van', 0); // begin van de meting, in uren na 00:00
const maker = arg('maker', null); // het nummer van een land van de maker, in plaats van het ontworpen gehucht

// ── Het dorp ──
if (global.gc) global.gc();
const heapVoor = process.memoryUsage().heapUsed;
let t0 = nu();
const S = beginSpel({ maker: typeof maker === 'number' ? maker : null });
const D = S.dorp;
const bouw = N > D.bevolking || kaart ? bouwDorp(S, N, { werk: metWerk, kaart, indeling }) : { gelukt: true, L: S.wereld.b, huizen: 0, werkplekken: 0, gebouwen: D.gebouwen.length, bewoners: D.bewoners.mensen.length, wezens: S.wereld.wezens.length };
const bouwMs = nu() - t0;
if (!bouw.gelukt) {
  console.log(JSON.stringify({ N, gelukt: false, reden: bouw.reden }));
  process.exit(0);
}
const w = S.wereld;
const soorten = {};
for (const e of w.wezens) soorten[e.soort] = (soorten[e.soort] || 0) + 1;

// ── Wat we meten ──
// Het zoeken van een weg: T.zoekRoute (js/lopen.js: A* om wat vaststaat, of een veld; vraag 119), en T.zoekPad waar
// het niet binnen T.zoekRoute gebeurt (een omweg om iemand heen, een gevecht). Tot 4 okt telde hier alleen T.zoekPad.
const teller = { padN: 0, padMs: 0, dagtikken: [], opslaan: [] };
let inRoute = 0;
const telZoeken = (orig) => function (...a) {
  if (inRoute) return orig.apply(this, a);
  inRoute++;
  const s = nu();
  try {
    return orig.apply(this, a);
  } finally {
    inRoute--;
    teller.padMs += nu() - s;
    teller.padN++;
  }
};
T.zoekPad = telZoeken(T.zoekPad);
T.zoekRoute = telZoeken(T.zoekRoute);
const origTik = T.tikGebouwenDag;
T.tikGebouwenDag = function (...a) {
  const s = nu();
  const r = origTik.apply(this, a);
  teller.dagtikken.push(nu() - s);
  return r;
};
const origSlaOp = T.slaOp;
T.slaOp = function (...a) {
  const s = nu();
  const r = origSlaOp.apply(this, a);
  teller.opslaan.push(nu() - s);
  return r;
};

// Delen van het beeld en van de dagtik, als de bladzijde erom vraagt (kost wat extra tijd per aanroep).
const delenTijd = {};
if (metDelen) {
  const wikkel = (naam) => {
    const f = T[naam];
    if (typeof f !== 'function') return;
    T[naam] = function (...a) {
      const s = nu();
      const r = f.apply(this, a);
      delenTijd[naam] = (delenTijd[naam] || 0) + nu() - s;
      return r;
    };
  };
  ['werkGebouwenBij', 'werkMarskramerBij', 'werkHeerBij', 'werkDoorzoekenBij', 'werkInnerBij', 'werkBewonersBij', 'werkRoversBij',
    'werkVoorvallenBij', 'beweegWezens', 'werkOogstBij', 'laatDwalen',
    'tikAkkersDag', 'tikVeeDag', 'tikHerbergDag', 'tikBehoeftenDag', 'tikHandelDag', 'tikHeerDag', 'tikHeervaartDag', 'tikInnerDag',
    'tikVoorvallenDag', 'tikErvenDag', 'eetVandaag', 'verdeelHanden', 'wijsWerkToe', 'looptijdVan', 'tikWettenDag', 'tikRoversDag', 'tikTredeDag',
    'werkUrenVan', 'zoekRoute'].forEach(wikkel);
}

// ── Spelen ──
S.kalender.snelheid = snelheid;
const dt = 1 / 60;
const framesPerDag = Math.round((T.DAG_LENGTE / snelheid) / dt); // 600 bij 30×
zetDag(S, dagStart, startUur); // warm-up vanaf dit uur, tot 00:00 van de volgende dag
// warm-up: tot 00:00 van dagStart + warm, en dan nog `warm` dagen
const doelDag = dagStart + 1 + vanUur / 24; // begin van de meting (standaard 00:00)
t0 = nu();
let warmFrames = 0;
while (S.kalender.dag < doelDag - 1e-9) {
  beeld(S, dt);
  if (++warmFrames > 20 * framesPerDag) throw new Error('warm-up loopt niet af');
}
const warmMs = nu() - t0;
teller.padN = 0; teller.padMs = 0; teller.dagtikken = []; teller.opslaan = [];
for (const k of Object.keys(delenTijd)) delenTijd[k] = 0;

let sessie = null;
if (profUit) {
  const insp = require('node:inspector');
  sessie = new insp.Session();
  sessie.connect();
  sessie.post('Profiler.enable');
  sessie.post('Profiler.setSamplingInterval', { interval: 500 });
  sessie.post('Profiler.start');
}
const uitslagWaarschuwing = [];
const fr = []; // per beeld: { ms, uur, pad, padMs, tik, sla }
const n0 = S.wereld.wezens.length;
for (let d = 0; d < dagen; d++) {
  for (let i = 0; i < framesPerDag; i++) {
    if (maxFrames && fr.length >= maxFrames) break;
    const a = teller.padN;
    const am = teller.padMs;
    const nt = teller.dagtikken.length;
    const ns = teller.opslaan.length;
    const s = nu();
    beeld(S, dt);
    const ms = nu() - s;
    if (S.modus !== 'verkennen') { console.log('LET OP: modus is', S.modus, 'op beeld', fr.length); uitslagWaarschuwing.push(S.modus + '@' + fr.length); }
    const uur = T.uurVanDag(S.kalender.dag);
    fr.push({ ms, uur, pad: teller.padN - a, padMs: teller.padMs - am, tik: teller.dagtikken.length > nt, sla: teller.opslaan.length > ns });
  }
}

if (sessie) {
  sessie.post('Profiler.stop', (err, res) => { if (!err) fs.writeFileSync(profUit, JSON.stringify(res.profile)); });
  sessie.disconnect();
}
// ── Uitslag ──
const alle = fr.map((f) => f.ms);
const slechtste5 = alle.slice().sort((a, b) => b - a).slice(0, Math.max(1, Math.round(alle.length * 0.05)));
const gewoon = fr.filter((f) => !f.tik && !f.sla).map((f) => f.ms);
const dind = T.dagindeling(Math.floor(S.kalender.dag) - 1);
const overdag = fr.filter((f) => f.uur >= dind.opstaan && f.uur < dind.slapen && !f.tik && !f.sla).map((f) => f.ms);
const dagdeel = {};
for (const f of fr) {
  const deel = f.uur < dind.opstaan || f.uur >= dind.slapen ? 'nacht' : f.uur < dind.werkBegin ? 'ochtend' : f.uur < dind.schaftBegin ? 'werk' : f.uur < dind.schaftEind ? 'schaft' : f.uur < dind.werkEind ? 'werk' : 'avond';
  (dagdeel[deel] = dagdeel[deel] || []).push(f.ms);
}
const traagste = fr.map((f, i) => ({ i, uur: +f.uur.toFixed(2), ms: +f.ms.toFixed(1), pad: f.pad, padMs: +f.padMs.toFixed(1), tik: f.tik, sla: f.sla })).sort((a, b) => b.ms - a.ms).slice(0, 8);
const telSoort = (f) => D.gebouwen.filter(f).length;
const uitslag = {
  waarschuwing: uitslagWaarschuwing,
  N, L: bouw.L, huizen: telSoort((g) => g.soort === 'hut' || g.soort === 'huis' || g.soort === 'stenenHuis'), indeling, werkplekken: bouw.werkplekken, gebouwen: D.gebouwen.length, bewoners: D.bewoners.mensen.length, wezens: S.wereld.wezens.length,
  soorten, bouwMs: Math.round(bouwMs), warmMs: Math.round(warmMs),
  frames: fr.length, dagen,
  beeld: {
    gem: gem(alle), gemGewoon: gem(gewoon), gemOverdag: gem(overdag), p50: pct(gewoon, 0.5), p95: pct(gewoon, 0.95), p99: pct(gewoon, 0.99), max: Math.max(...alle),
    p95Alle: pct(alle, 0.95), maxGewoon: Math.max(...gewoon), gemSlechtste5: gem(slechtste5),
  },
  dagdeel: Object.fromEntries(Object.entries(dagdeel).map(([k, v]) => [k, { gem: +gem(v).toFixed(3), p95: +pct(v, 0.95).toFixed(3), max: +Math.max(...v).toFixed(1), n: v.length }])),
  dagtik: { n: teller.dagtikken.length, gem: gem(teller.dagtikken), max: Math.max(0, ...teller.dagtikken), lijst: teller.dagtikken.map((x) => +x.toFixed(2)) },
  opslaan: { n: teller.opslaan.length, gem: gem(teller.opslaan), lijst: teller.opslaan.map((x) => +x.toFixed(2)) },
  pad: { aanroepen: teller.padN, ms: teller.padMs, perDag: teller.padN / dagen, msPerDag: teller.padMs / dagen, aandeel: teller.padMs / fr.reduce((a, f) => a + f.ms, 0) },
  traagste,
  wezensNa: S.wereld.wezens.length - n0,
};
// Opslaan (js/opslaan.js): hoe groot en hoe lang, en hoeveel daarvan de kaart zelf is.
{
  const tijden2 = [];
  let tekst = '';
  for (let i = 0; i < 5; i++) {
    const s0 = nu();
    tekst = T.bewaarSpel(S);
    tijden2.push(nu() - s0);
  }
  const w2 = S.wereld;
  const bewaard = [w2.tegels, w2.grond, w2.burenKamers];
  w2.tegels = []; w2.grond = []; w2.burenKamers = [];
  const zonderKaart = T.bewaarSpel(S).length;
  [w2.tegels, w2.grond, w2.burenKamers] = bewaard;
  uitslag.opslag = { tekens: tekst.length, kB: tekst.length / 1000, zonderKaartKB: zonderKaart / 1000, kaartKB: (tekst.length - zonderKaart) / 1000, ms: pct(tijden2, 0.5), msEerste: tijden2[0], msAlle: tijden2.map((x) => +x.toFixed(1)) };
}
if (global.gc) global.gc();
uitslag.heapMB = (process.memoryUsage().heapUsed - heapVoor) / 1e6;
// De dagtik op zichzelf: tien opeenvolgende dagen, zoals T.tikGebouwenDag ze tikt (zonder beeld eromheen).
{
  const delenVoor = Object.assign({}, delenTijd);
  for (const k of Object.keys(delenTijd)) delenTijd[k] = 0;
  const tikken = [];
  const basis = Math.floor(S.kalender.dag) + 1;
  for (let d = 0; d < 10; d++) {
    S.kalender.dag = basis + d + 0.3;
    S.kalender.stil = [];
    const s0 = nu();
    origTik.call(T, D, basis + d);
    tikken.push(nu() - s0);
  }
  uitslag.dagtikBank = { gem: gem(tikken), p50: pct(tikken, 0.5), max: Math.max(...tikken), lijst: tikken.map((x) => +x.toFixed(1)) };
  uitslag.delen = Object.fromEntries(Object.entries(delenVoor).map(([k, v]) => [k, +(v / dagen).toFixed(1)]));
  uitslag.delenDagtik = Object.fromEntries(Object.entries(delenTijd).map(([k, v]) => [k, +(v / 10).toFixed(2)]));
}
if (uit) fs.writeFileSync(uit, JSON.stringify(uitslag, null, 1));
const f3 = (x) => (x == null ? '-' : x.toFixed(3));
console.log(`N=${N} L=${bouw.L} ${indeling}${metWerk ? '+werk' : ''} huizen=${bouw.huizen} werkplekken=${bouw.werkplekken} gebouwen=${uitslag.gebouwen} wezens=${uitslag.wezens} (bouw ${uitslag.bouwMs} ms, warm-up ${uitslag.warmMs} ms)`);
console.log(`  beeld ms: gem ${f3(uitslag.beeld.gem)}  gem-gewoon ${f3(uitslag.beeld.gemGewoon)}  overdag ${f3(uitslag.beeld.gemOverdag)}  p50 ${f3(uitslag.beeld.p50)}  p95 ${f3(uitslag.beeld.p95)}  p99 ${f3(uitslag.beeld.p99)}  max ${f3(uitslag.beeld.max)}`);
console.log('  dagdelen:', JSON.stringify(uitslag.dagdeel));
console.log(`  dagtik: n=${uitslag.dagtik.n} gem ${f3(uitslag.dagtik.gem)} ms max ${f3(uitslag.dagtik.max)} ms; opslaan: n=${uitslag.opslaan.n} gem ${f3(uitslag.opslaan.gem)} ms`);
console.log(`  een weg zoeken: ${uitslag.pad.perDag.toFixed(0)} keer/dag, ${uitslag.pad.msPerDag.toFixed(1)} ms/dag = ${(uitslag.pad.aandeel * 100).toFixed(1)}% van de beeldtijd`);
console.log('  traagste:', JSON.stringify(traagste.slice(0, 5)));
console.log(`  dagtik (10 dagen): gem ${f3(uitslag.dagtikBank.gem)} ms, max ${f3(uitslag.dagtikBank.max)} ms; opslag ${uitslag.opslag.kB.toFixed(0)} kB (kaart ${uitslag.opslag.kaartKB.toFixed(0)} kB), ${uitslag.opslag.ms.toFixed(1)} ms (eerste ${uitslag.opslag.msEerste.toFixed(1)}); heap +${uitslag.heapMB.toFixed(1)} MB; gem van traagste 5%: ${f3(uitslag.beeld.gemSlechtste5)} ms`);
if (metDelen) {
  console.log('  delen (ms/dag):', JSON.stringify(uitslag.delen));
  console.log('  delen dagtik (ms/tik):', JSON.stringify(uitslag.delenDagtik));
}
