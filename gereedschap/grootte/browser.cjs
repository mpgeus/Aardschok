'use strict';
// node browser.cjs N [N ...] [--lus] [--geenTeken] [--dicht] [--uit bestand.json] (npm run grootte -- --browser)
// Start het spel in een onzichtbare Chromium (via de server van npm start, want pagina.js leest het doek uit, en dat
// weigert de browser vanaf schijf; draait hij niet, dan start dit hem zelf en stopt hem na afloop), zet er N bewoners in
// (bouw.cjs, in de bladzijde), en meet wat één getekend beeld kost (T.tekenScene) op de gewone zoom en uitgezoomd, hoe
// groot het opslaan is, en (met --lus) hoe vlot de echte spellus loopt. Zonder videokaart (zoals in de cloud) is het
// tekenen trager dan op een gewone computer.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execSync, spawn } = require('node:child_process');

// Playwright zoals de speeltest het vindt (gereedschap/speeltest/speeltest.cjs): hier, of algemeen geïnstalleerd.
function laadPlaywright() {
  try {
    return require('playwright');
  } catch {
    return require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright'));
  }
}
const { chromium } = laadPlaywright();
const WORTEL = path.join(__dirname, '..', '..');

const args = process.argv.slice(2);
const Ns = args.filter((a, i) => /^\d+$/.test(a) && !/^--(lusSec|venster|uit)$/.test(args[i - 1] || '')).map(Number);
const metLus = args.includes('--lus');
const metTeken = !args.includes('--geenTeken');
const metDicht = args.includes('--dicht');
const uitIdx = args.indexOf('--uit');
const uit = uitIdx >= 0 ? args[uitIdx + 1] : null;
const vensterIdx = args.indexOf('--venster');
const [VB, VH] = (vensterIdx >= 0 ? args[vensterIdx + 1] : '1280x800').split('x').map(Number);
const lusSec = args.indexOf('--lusSec') >= 0 ? Number(args[args.indexOf('--lusSec') + 1]) : 20;
const URL = 'http://localhost:8123/';

// Antwoordt de server van npm start (server.cjs)?
const serverDraait = () => new Promise((klaar) => {
  http.get(URL, (r) => { r.resume(); klaar(true); }).on('error', () => klaar(false));
});
// Draait hij niet, dan start dit hem, en geeft hem terug om na afloop te stoppen; anders null.
async function zorgVoorServer() {
  if (await serverDraait()) return null;
  const server = spawn(process.execPath, [path.join(WORTEL, 'server.cjs')], { cwd: WORTEL, stdio: 'ignore' });
  for (let i = 0; i < 50 && !(await serverDraait()); i++) await new Promise((r) => setTimeout(r, 200));
  return server;
}

const bouwBron = fs.readFileSync(path.join(__dirname, 'bouw.cjs'), 'utf8');

async function meetN(browser, N) {
  const context = await browser.newContext({ viewport: { width: VB, height: VH } });
  const page = await context.newPage();
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(m.text()); });
  await page.addInitScript(() => {
    let n = 11; // dezelfde vaste LCG als in Node (harnas.cjs)
    Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
    const orig = window.requestAnimationFrame.bind(window);
    window.__origRaf = orig;
    window.__rafStop = false;
    window.__rafWacht = null;
    window.__meet = false;
    window.__frames = [];
    window.requestAnimationFrame = (cb) => {
      if (window.__rafStop) { window.__rafWacht = cb; return 0; }
      return orig((t) => {
        if (window.__meet) {
          const s = performance.now();
          cb(t);
          window.__frames.push({ t, ms: performance.now() - s });
        } else cb(t);
      });
    };
  });
  await page.goto(URL);
  await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug);
  // Een nieuw spel, zoals een speler het begint: Nieuw spel, Begin, en de brief van de heer sluiten.
  await page.click('#menu [data-actie="nieuw"]');
  if (await page.$('#menu [data-actie="ja"]')) await page.click('#menu [data-actie="ja"]');
  await page.click('#menu [data-actie="begin"]');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !(Spel.S.kalender.stil || []).includes('brief'), null, { timeout: 15000 }).catch(() => {});
  // De spellus even stilzetten, zodat ze niet tussen mijn metingen door loopt.
  await page.evaluate(() => { window.__rafStop = true; });
  await page.waitForTimeout(300);
  const info = await page.evaluate(() => ({ modus: Spel.S.modus, stil: Spel.S.kalender.stil, zoom: Spel.S.zoom, bw: innerWidth, bh: innerHeight, dpr: devicePixelRatio, N: Spel.S.dorp.bevolking, sprites: !!(Spel.sprites && Spel.sprites.aan) }));
  // Bouwen
  await page.evaluate(`(() => { const module = { exports: {} }; const require = () => ({ T: globalThis.Spel }); ${bouwBron}\n globalThis.Bouw = module.exports; })()`);
  await page.addScriptTag({ path: path.join(__dirname, 'pagina.js') });
  const bouw = await page.evaluate((N) => {
    const t0 = performance.now();
    const r = N > Spel.S.dorp.bevolking ? Bouw.bouwDorp(Spel.S, N, { werk: true }) : { gelukt: true, L: Spel.S.wereld.b };
    r.ms = performance.now() - t0;
    r.bewoners = Spel.S.dorp.bewoners.mensen.length;
    r.gebouwen = Spel.S.dorp.gebouwen.length;
    r.wezens = Spel.S.wereld.wezens.length;
    r.voorwerpen = Spel.S.wereld.voorwerpen.length;
    return r;
  }, N);
  if (!bouw.gelukt) { await context.close(); return { N, bouw, fouten }; }
  const uitslag = { N, bouw, info, teken: {}, fouten };
  // Het dorp op een zomerdag om half één: iedereen bij zijn werk of zijn plein.
  await page.evaluate(() => {
    const s = Spel.S;
    s.kalender.dag = 104 + 12.5 / 24;
    s.kalender.snelheid = 1;
    for (const D of s.dorpen) D.gebouwenDag = 104;
    s.vanzelfBewaard = 104;
    if (s.grond) s.grond.sleutel = '';
    Meet.zetPlekken(12.5);
    Meet.cameraOp(35, 37); // het plein
  });
  // Tekenen: gewone zoom van dit venster en uitgezoomd; overdag, 's nachts (de donkere laag over het hele beeld) en 's avonds;
  // en alleen het rekenwerk van het spel (op een doek van 1 bij 1 pixel).
  const zoomen = [['gewoon', null], ['zoom 1', 1], ['zoom 0,5', 0.5], ['zoom 0,25', 0.25]];
  for (const [naam, z] of metTeken ? zoomen : []) {
    const K = z && z < 0.6 ? 40 : 100;
    const r = {};
    r.dag = await page.evaluate(([z, K]) => Meet.teken(z, K, true, { uur: 12.5 }), [z, K]);
    r.dagZonderFlush = await page.evaluate(([z, K]) => Meet.teken(z, K, false, { uur: 12.5 }), [z, K]);
    r.nacht = await page.evaluate(([z, K]) => Meet.teken(z, K, true, { uur: 2.0 }), [z, K]);
    r.avond = await page.evaluate(([z, K]) => Meet.teken(z, K, true, { uur: 20.8 }), [z, K]);
    r.jsDag = await page.evaluate(([z, K]) => Meet.teken(z, K, false, { uur: 12.5, klein: true }), [z, K]);
    uitslag.teken[naam] = r;
  }
  if (metDicht) {
    uitslag.dicht = [];
    for (const K of [0, 25, 50, 100, 200, 300, 450]) {
      const d = await page.evaluate((K) => Meet.dicht(K), K);
      const dag = await page.evaluate(() => Meet.teken(null, 60, true, { uur: 12.5 }));
      const js = await page.evaluate(() => Meet.teken(null, 60, false, { uur: 12.5, klein: true }));
      uitslag.dicht.push({ K, ...d, inBeeld: dag.wezens, gem: dag.gem, p95: dag.p95, jsGem: js.gem, jsP95: js.p95 });
    }
  }
  // Opslaan: hoe groot, en lukt het in de opslag van de browser?
  uitslag.opslaan = await page.evaluate(() => {
    const s = Spel.S;
    const t = [];
    let tekst = '';
    for (let i = 0; i < 3; i++) {
      const a = performance.now();
      tekst = Spel.bewaarSpel(s);
      t.push(performance.now() - a);
    }
    const a = performance.now();
    let r;
    try { r = Spel.slaOp(s, 'auto'); } catch (e) { r = { gelukt: false, reden: String(e) }; }
    const slaOpMs = performance.now() - a;
    return { tekens: tekst.length, kB: tekst.length / 1000, bewaarMs: t, slaOpMs, slaOp: r };
  });
  if (metLus) {
    uitslag.lus = {};
    // De ochtendspits, op gewone snelheid (1x) en op 30x: het dorp slaapt om 4:50, en wordt wakker.
    for (const [naam, uur, snelheid, sec, zoom] of [['1x_ochtend', 4.83, 1, lusSec, null], ['30x_ochtend', 4.83, 30, lusSec, null], ['1x_ochtend_zoom0,25', 4.83, 1, lusSec, 0.25]]) {
      await page.evaluate((uur) => Meet.zetPlekken(uur), uur);
      uitslag.lus[naam] = await page.evaluate(([s, v, z]) => Meet.lus(s, v, z), [sec, snelheid, zoom]);
    }
  }
  await context.close();
  return uitslag;
}

async function main() {
  const server = await zorgVoorServer();
  const browser = await chromium.launch();
  const alles = [];
  for (const N of Ns) {
    const t0 = Date.now();
    let r;
    try { r = await meetN(browser, N); } catch (e) { r = { N, mislukt: String(e && e.message || e).split('\n')[0] }; }
    r.duurSeconden = Math.round((Date.now() - t0) / 1000);
    alles.push(r);
    console.log(JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toFixed(3) : v)));
    if (uit) fs.writeFileSync(uit, JSON.stringify(alles, null, 1));
  }
  await browser.close();
  if (server) server.kill();
}
main().catch((e) => { console.error(e); process.exit(1); });
