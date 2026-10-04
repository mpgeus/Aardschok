'use strict';
// Waar het tekenen zijn tijd kwijt is, per laag (npm run tekenmeting; werklijst vraag 123, f). Land 5 van de maker, op
// drie schermen: 1920 bij 1080, 4K zonder schaal (3840 bij 2160 css-pixels) en 4K op 200% (1920 bij 1080, ratio 2), elk
// dichtbij en in het overzicht, overdag en 's avonds. Per beeld: alles (met een pixel teruggelezen, zodat de browser het
// tekenwerk ook doet), alleen het rekenwerk (op een doek van 1 pixel), zonder de nacht, de grondbuffer alleen, hoeveel
// opdrachten aan het doek, een CPU-profiel per laag, en de echte spellus. Zonder videokaart, zoals in de cloud.
//
//   npm run tekenmeting                                  alle drie de schermen (een kwartier)
//   npm run tekenmeting -- 1920x1080@1                   één scherm
// De uitslag in gereedschap/schermen/uit/tekenmeting.json (niet in git).
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execSync, spawn } = require('node:child_process');
const WORTEL = path.join(__dirname, '..', '..');
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); }
const URL = 'http://localhost:8123/';
const SCHERMEN = (process.argv[2] || '1920x1080@1,3840x2160@1,1920x1080@2').split(',');
const serverDraait = () => new Promise((klaar) => {
  http.get(URL, (r) => { r.resume(); klaar(true); }).on('error', () => klaar(false));
});
const LAGEN = ['werkGrondBij', 'tekenWeides', 'tekenVoorwerp', 'tekenWezen', 'tekenBosrandBoom', 'bosVoorBij', 'werkDoorkijkBij',
  'tekenKijkgat', 'tekenGerasterd', 'tekenNacht', 'ponsRamen', 'vulRamen', 'tekenHuisTekens', 'tekenOogjes', 'tekenWolkjes',
  'tekenEffecten', 'tekenVignet', 'tekenVolgorde', 'tekenMarkeringen', 'getImageData', 'drawImage'];

function inclusief(prof) {
  const nodes = new Map(prof.nodes.map((n) => [n.id, n]));
  const ouder = new Map();
  for (const n of prof.nodes) for (const k of n.children || []) ouder.set(k, n.id);
  const uit = {}; let totaal = 0; const eigen = {};
  for (let i = 0; i < prof.samples.length; i++) {
    const dt = prof.timeDeltas[i] || 0; totaal += dt;
    const gezien = new Set();
    const self = nodes.get(prof.samples[i]).callFrame.functionName || '(anoniem)';
    eigen[self] = (eigen[self] || 0) + dt;
    for (let id = prof.samples[i]; id != null; id = ouder.get(id)) {
      const f = nodes.get(id).callFrame.functionName;
      if (LAGEN.includes(f) && !gezien.has(f)) { gezien.add(f); uit[f] = (uit[f] || 0) + dt; }
    }
  }
  const top = Object.entries(eigen).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => [k, Math.round(v / 1000)]);
  return { totaalMs: totaal / 1000, lagen: Object.fromEntries(Object.entries(uit).map(([k, v]) => [k, Math.round(v / 100) / 10])), topEigen: top };
}

async function meet(browser, scherm) {
  const [b, h, d] = scherm.match(/(\d+)x(\d+)@(\d+)/).slice(1).map(Number);
  const context = await browser.newContext({ viewport: { width: b, height: h }, deviceScaleFactor: d });
  const page = await context.newPage();
  await page.addInitScript(() => {
    let n = 11;
    Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
    const orig = window.requestAnimationFrame.bind(window);
    Object.assign(window, { __origRaf: orig, __rafStop: false, __rafWacht: null, __meet: false, __frames: [] });
    window.requestAnimationFrame = (cb) => {
      if (window.__rafStop) { window.__rafWacht = cb; return 0; }
      return orig((t) => { if (window.__meet) { const s = performance.now(); cb(t); window.__frames.push({ t, ms: performance.now() - s }); } else cb(t); });
    };
  });
  await page.goto(URL);
  await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug);
  await page.click('#menu [data-actie="nieuw"]');
  if (await page.$('#menu [data-actie="ja"]')) await page.click('#menu [data-actie="ja"]');
  await page.click('#menu [data-actie="begin"]');
  await page.keyboard.press('Escape');
  await page.evaluate(() => Spel.debug.gehucht(5));
  await page.evaluate(() => Spel.debug.stap(0.5));
  await page.evaluate(() => { window.__rafStop = true; });
  await page.waitForTimeout(300);
  await page.addScriptTag({ path: path.join(WORTEL, 'gereedschap', 'grootte', 'pagina.js') });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
  const zoomStd = await page.evaluate(() => Spel.S.zoom);
  const scènes = [
    { naam: 'dichtbij, dag', zoom: zoomStd, uur: 12 },
    { naam: 'dichtbij, avond', zoom: zoomStd, uur: 21 },
    { naam: 'overzicht 0,5, dag', zoom: 0.5, uur: 12 },
    { naam: 'overzicht 0,35, dag', zoom: 0.35, uur: 12 },
    { naam: 'overzicht 0,35, avond', zoom: 0.35, uur: 21 },
  ];
  const uit = { scherm, zoomStd, gpu: await page.evaluate(() => { const c = document.createElement('canvas').getContext('webgl'); if (!c) return 'geen webgl'; const e = c.getExtension('WEBGL_debug_renderer_info'); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'webgl'; }), scènes: [] };
  for (const sc of scènes) {
    await page.evaluate(([uur, zoom]) => {
      Meet.zetPlekken(uur); const s = Spel.S; if (s.grond) s.grond.sleutel = ''; s.zoom = zoom; Meet.cameraOp(s.schout.tx, s.schout.ty);
    }, [sc.uur, sc.zoom]);
    for (let i = 0; i < 100; i++) {
      await page.evaluate(() => Spel.tekenScene(document.getElementById('scherm').getContext('2d'), Spel.S, innerWidth, innerHeight));
      if (await page.evaluate(() => Spel.sprites.bezig() === 0)) break;
      await page.waitForTimeout(50);
    }
    const r = { naam: sc.naam };
    r.alles = await page.evaluate(([z, u]) => Meet.teken(z, 30, true, { uur: u }), [sc.zoom, sc.uur]);
    r.alleenRekenen = await page.evaluate(([z, u]) => Meet.teken(z, 30, false, { uur: u, klein: true }), [sc.zoom, sc.uur]);
    r.zonderNacht = await page.evaluate(([z, u]) => { Spel.debug.geenNacht = true; const x = Meet.teken(z, 30, true, { uur: u }); Spel.debug.geenNacht = false; return x; }, [sc.zoom, sc.uur]);
    // de grond alleen: zijn buffer over het hele scherm, met een pixel teruggelezen
    r.grondAlleen = await page.evaluate(() => {
      const c = document.getElementById('scherm').getContext('2d'); const g = Spel.S.grond; const t = [];
      for (let i = 0; i < 30; i++) { const a = performance.now(); c.save(); c.imageSmoothingEnabled = false; c.drawImage(g.canvas, 0, 0, innerWidth, innerHeight); c.restore(); c.getImageData(0, 0, 1, 1); t.push(performance.now() - a); }
      t.sort((a, b) => a - b); return t[15];
    });
    // hoeveel opdrachten aan het doek per beeld
    r.opdrachten = await page.evaluate(() => {
      const P = CanvasRenderingContext2D.prototype; const tel = {}; const oud = {};
      for (const k of ['drawImage', 'fill', 'fillRect', 'stroke', 'fillText', 'createRadialGradient', 'createLinearGradient', 'save', 'clip']) {
        oud[k] = P[k]; P[k] = function (...a) { tel[k] = (tel[k] || 0) + 1; return oud[k].apply(this, a); };
      }
      Spel.tekenScene(document.getElementById('scherm').getContext('2d'), Spel.S, innerWidth, innerHeight);
      for (const k in oud) P[k] = oud[k];
      return tel;
    });
    await page.evaluate((u) => { Spel.S.kalender.dag = Math.floor(Spel.S.kalender.dag) + u / 24; }, sc.uur);
    await cdp.send('Profiler.start');
    await page.evaluate(() => { const c = document.getElementById('scherm').getContext('2d'); for (let i = 0; i < 30; i++) { Spel.tekenScene(c, Spel.S, innerWidth, innerHeight); c.getImageData(0, 0, 1, 1); } });
    const { profile } = await cdp.send('Profiler.stop');
    const p = inclusief(profile);
    r.profiel = { perBeeld: Object.fromEntries(Object.entries(p.lagen).map(([k, v]) => [k, Math.round((v / 30) * 10) / 10])), topEigenMsSamen: p.topEigen };
    // de echte spellus, met de browser die het beeld ook op het scherm zet
    r.lus = await page.evaluate(async ([z]) => { const x = await Meet.lus(3, 1, z); return { fps: Math.round(x.fps), tekenMs: Math.round(x.tekenMs * 10) / 10, tussenMax: Math.round(x.tussenMax) }; }, [sc.zoom]);
    await page.evaluate(() => { window.__rafStop = true; });
    uit.scènes.push(r);
    console.log(scherm, sc.naam, JSON.stringify({ alles: r.alles.p50, reken: r.alleenRekenen.p50, zonderNacht: r.zonderNacht.p50, grond: r.grondAlleen, lus: r.lus }));
  }
  await context.close();
  return uit;
}

(async () => {
  let server = null;
  if (!(await serverDraait())) {
    server = spawn(process.execPath, [path.join(WORTEL, 'server.cjs')], { cwd: WORTEL, stdio: 'ignore' });
    for (let i = 0; i < 50 && !(await serverDraait()); i++) await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await pw.chromium.launch();
  const alles = [];
  try { for (const s of SCHERMEN) alles.push(await meet(browser, s)); } finally { await browser.close(); if (server) server.kill(); }
  fs.mkdirSync(path.join(__dirname, 'uit'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'uit', 'tekenmeting.json'), JSON.stringify(alles, null, 1) + '\n');
})().catch((e) => { console.error(e); process.exit(1); });
