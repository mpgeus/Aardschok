// Wat de figuren uit TripoSplat kosten op de echte videokaart (vraag 192; "Performance heeft hoge prioriteit", CLAUDE.md): dertig
// soldaten in beeld, van elke soort zes, staand en slaand, tegen hetzelfde aantal met de vellen van daarvoor. Per stand de
// tijd van een beeld tot en met de kaart, en hoe vol de textuurstapel is. De server moet draaien (npm start).
//
//   node gereedschap/schermen/figurenmeting.cjs [--oud <beschrijving.json van daarvoor>] [--firefox]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); }

const arg = (naam) => { const i = process.argv.indexOf(naam); return i < 0 ? null : process.argv[i + 1]; };
const FIREFOX = process.argv.includes('--firefox');
const oud = arg('--oud') ? JSON.parse(fs.readFileSync(arg('--oud'), 'utf8')).figuren.speerman : null;
const SOORTEN = ['speerman', 'boogschutter', 'kruisboogschutter', 'piekenier', 'ridder'];

async function meet(page, naam) {
  return page.evaluate(async ({ naam }) => {
    const T = Spel;
    const gl = T.gl.doek().getContext('webgl2');
    const px = new Uint8Array(4);
    const beeld = () => { const a = performance.now(); T.tekenBeeld(); if (gl) { gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return performance.now() - a; };
    const eerste = beeld();
    await new Promise((r) => setTimeout(r, 1500));
    const hit = beeld();
    const t = [];
    for (let i = 0; i < 40; i++) t.push(beeld());
    t.sort((a, b) => a - b);
    const v = T.debug.vellen();
    return { naam, eerste: +eerste.toFixed(1), naHetLaden: +hit.toFixed(1), p50: +t[20].toFixed(2), p95: +t[38].toFixed(2), telling: { ...T.gl.telling }, stapel: T.gl.stapel(), vellenMB: v.samen };
  }, { naam });
}

(async () => {
  const start = FIREFOX ? {} : { channel: 'chromium', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] };
  const browser = await (FIREFOX ? pw.firefox : pw.chromium).launch(start);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.log('FOUT', e.message));
  for (const stand of oud ? ['oud', 'nieuw'] : ['nieuw']) {
    await page.goto('http://localhost:8123/');
    await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.gl);
    await page.evaluate(async ({ stand, oud, SOORTEN }) => {
      const T = Spel;
      if (stand === 'oud') {
        const Sp = T.sprites;
        const g = Sp.figuurGegevens;
        Sp.figuurGegevens = (n) => (SOORTEN.includes(n) ? oud : g(n));
      }
      T.ui.sluitTitel(T.S);
      T.beginOpEiland(T.S, 5, T.LEVELS.demojaar);
      T.debug.geenNacht = true;
      T.debug.geenMist = true;
      await T.debug.stap(4);
      await T.debug.stap(2);
      const S = T.S;
      const D = S.dorp;
      S.zoom = 1;
      const c = T.soldatenVan(D)[0].wezen;
      window.__zij = [];
      SOORTEN.forEach((soort, i) => {
        for (let j = 0; j < 6; j++) {
          const w = T.maakWezen('soldaat', c.tx - 8 + i * 3, c.ty - 7 + j * 3);
          w.bewoner = { soldaat: { soort, sinds: 0 } };
          w.kant = 'speler';
          D.wereld.wezens.push(w);
          window.__zij.push(w);
        }
      });
      const q = T.naarSchermOp(S.wereld, c.tx, c.ty);
      T.kijkNaar(q.x, q.y);
      T.spelStil = true;
    }, { stand, oud, SOORTEN });
    console.log(stand, 'staan', JSON.stringify(await meet(page, 'staan')));
    await page.evaluate(() => { for (const w of window.__zij) w.uitval = { doel: { x: w.x - 3, y: w.y + 1 }, t: 0, duur: 1e6 }; });
    console.log(stand, 'slaan', JSON.stringify(await meet(page, 'slaan')));
    if (stand === 'nieuw') await page.evaluate(async () => { await Spel.debug.schermafdruk('figurenmeting'); });
  }
  await browser.close();
})();
