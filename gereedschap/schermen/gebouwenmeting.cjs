// Wat de vier gebouwen uit Marcels platen kosten ("Performance heeft hoge prioriteit", CLAUDE.md): dezelfde kaart zonder en met,
// op de echte videokaart, zoals figurenmeting.cjs. De server moet draaien (npm start).
//
//   node gereedschap/schermen/gebouwenmeting.cjs [--firefox]
'use strict';
const path = require('path');
const { execSync } = require('child_process');
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); }
const FIREFOX = process.argv.includes('--firefox');

async function meet(page, naam, zoom) {
  return page.evaluate(async ({ naam, zoom }) => {
    const T = Spel;
    T.S.zoom = zoom;
    const gl = T.gl.doek().getContext('webgl2');
    const px = new Uint8Array(4);
    const beeld = () => { const a = performance.now(); T.tekenBeeld(); if (gl) gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return performance.now() - a; };
    const eerste = beeld();
    await new Promise((r) => setTimeout(r, 2000));
    const hit = beeld();
    const t = [];
    for (let i = 0; i < 60; i++) t.push(beeld());
    t.sort((a, b) => a - b);
    const v = T.debug.vellen();
    return { naam, zoom, eerste: +eerste.toFixed(1), naHetLaden: +hit.toFixed(1), p50: +t[30].toFixed(2), p95: +t[57].toFixed(2), vellen: v };
  }, { naam, zoom });
}

(async () => {
  const start = FIREFOX ? {} : { channel: 'chromium', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] };
  const browser = await (FIREFOX ? pw.firefox : pw.chromium).launch(start);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.log('FOUT', e.message));
  for (const stand of ['zonder', 'met']) {
    await page.goto('http://localhost:8123/');
    await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.gl);
    await page.evaluate(async ({ stand }) => {
      const T = Spel;
      const S = T.S;
      T.ui.sluitTitel(S);
      T.beginOpEiland(S, 5, T.LEVELS.demojaar);
      T.debug.geenNacht = true;
      T.debug.geenMist = true;
      await T.debug.stap(4);
      await T.debug.stap(2);
      const D = S.dorp;
      D.trede = 'stad';
      D.dicht = [];
      for (const w of ['hout', 'steen', 'goud', 'leem', 'riet', 'planken']) { try { T.zetVoorraad(D, w, 400); } catch (e) { /* die waar is er niet */ } }
      const naar = T.naarSchermOp(S.wereld, 2027, 1654);
      T.kijkNaar(naar.x, naar.y);
      if (stand === 'met') {
        let bij = { x: 2015, y: 1668 };
        for (const [soort, kant] of [['raadhuis', 'z'], ['bakkerij', 'o'], ['molen', 'n'], ['stal', 'w']]) {
          const p = T.plekVoor(D, soort, bij);
          const r = T.plaatsGebouw(D, soort, p.x, p.y, kant);
          if (!r.gelukt) throw new Error(soort + ': ' + r.reden);
          T.proefdorp.bouwAf(D, r.instantie, 1);
          r.instantie.klaar = true;
          r.instantie.voorwerp.inAanbouw = false;
          bij = { x: p.x + 11, y: p.y };
        }
      }
      T.spelStil = true;
    }, { stand });
    for (const zoom of [1, 0.5]) console.log(stand, JSON.stringify(await meet(page, stand, zoom)));
  }
  await browser.close();
})();
