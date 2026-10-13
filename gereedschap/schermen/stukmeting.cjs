'use strict';
// Wat een nieuw stuk land kost (npm run stukmeting; B2b, stap 5, kaarten.md "Het hele eiland"): het proefdorp, de schout
// op 30× steeds naar de verste tegel die hij lopend haalt, in een richting, tot hij niet verder komt, en dan de volgende
// richting. Per beeld de regels en het tekenen apart, en hoeveel daarvan het maken van land was (T.landStuk); per stuk
// dat opengaat, dat beeld en de drie erna; en de zwaarste beelden, met wat erin gebeurde (een nieuwe dag, een stuk).
// Zonder videokaart, zoals in de cloud: in een gewone browser zijn de getallen lager, maar wat hapert, hapert ook daar.
//
//   npm run stukmeting                                   eiland 2, naar het zuiden (de kust) en dan het westen
//   npm run stukmeting -- --zaad 5 --richting oost,noord --duur 90 --afdruk kust.png
// De uitslag ook in gereedschap/schermen/uit/stukmeting.json (niet in git); --afdruk bewaart het beeld aan het eind.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execSync, spawn } = require('node:child_process');
const WORTEL = path.join(__dirname, '..', '..');
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); }
const URL = 'http://localhost:8123/';
const args = process.argv.slice(2);
const optie = (naam, standaard) => (args.includes('--' + naam) ? args[args.indexOf('--' + naam) + 1] : standaard);
const ZAAD = Number(optie('zaad', 2));
const RICHTINGEN = optie('richting', 'zuid,west').split(',');
const DUUR = Number(optie('duur', 60)) * 1000;
const AFDRUK = optie('afdruk', null);
const STAP = { zuid: [0, 1], west: [-1, 0], oost: [1, 0], noord: [0, -1] };
const serverDraait = () => new Promise((klaar) => {
  http.get(URL, (r) => { r.resume(); klaar(true); }).on('error', () => klaar(false));
});

async function meet(page) {
  page.on('pageerror', (e) => console.log('fout in de browser:', e.message));
  // Elk beeld: hoe lang, hoeveel daarvan tekenen en land maken, of er een stuk openging, en of er een dag of uur om was.
  await page.addInitScript(() => {
    const orig = window.requestAnimationFrame.bind(window);
    Object.assign(window, { __meet: false, __beelden: [] });
    window.requestAnimationFrame = (cb) => orig((t) => {
      if (!window.__meet) return cb(t);
      Object.assign(window, { __teken: 0, __land: 0, __stuk: null });
      const dag0 = Spel.S.kalender.dag;
      const s = performance.now();
      cb(t);
      const dag1 = Spel.S.kalender.dag;
      const nacht = Math.floor(dag0) !== Math.floor(dag1);
      window.__beelden.push({ t, ms: performance.now() - s, teken: window.__teken, land: window.__land, stuk: window.__stuk, nacht });
    });
  });
  await page.goto(URL);
  await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug);
  await page.click('#menu [data-actie="nieuw"]');
  if (await page.$('#menu [data-actie="ja"]')) await page.click('#menu [data-actie="ja"]');
  await page.click('#menu [data-actie="begin"]');
  await page.keyboard.press('Escape');
  await page.evaluate((zaad) => Spel.debug.proefdorp(zaad), ZAAD);
  await page.evaluate(() => Spel.debug.stap(0.5));
  await page.evaluate(() => {
    const T = Spel;
    const meet = (naam, waar) => {
      const f = T[naam];
      T[naam] = (...a) => {
        const s = performance.now();
        const r = f(...a);
        window[waar] += performance.now() - s;
        return r;
      };
    };
    meet('tekenBeeld', '__teken');
    meet('landStuk', '__land');
    const open = T.werkStukkenBij;
    T.werkStukkenBij = (S, D) => {
      const n = open(S, D);
      if (n != null) window.__stuk = n;
      return n;
    };
    // wie de kaart verandert zonder plek: dan gaat het raster van het lopen over al het land opnieuw (js/wereld.js)
    const kv = T.kaartVeranderd;
    window.__zonderPlek = {};
    T.kaartVeranderd = (w, plek) => {
      if (!plek) {
        const wie = (new Error().stack.split('\n')[2] || '').trim().replace(/^at /, '').replace(/\(.*\//, '(');
        window.__zonderPlek[wie] = (window.__zonderPlek[wie] || 0) + 1;
      }
      return kv(w, plek);
    };
    T.zetSnelheid(T.S, 30);
    window.__meet = true;
  });

  const log = [];
  const begin = Date.now();
  let richting = 0;
  let vast = 0;
  while (richting < RICHTINGEN.length && Date.now() - begin < DUUR) {
    await page.waitForTimeout(250);
    const uit = await page.evaluate((stap) => {
      const T = Spel;
      const S = T.S;
      const w = S.wereld;
      const s = S.schout;
      if (S.kalender.snelheid !== 30) T.zetSnelheid(S, 30); // een bezoeker zet hem op 1× (T.naarGewoneSnelheid)
      if (s.pad.length) return { loopt: true };
      // alles wat hij lopend haalt, en daarvan de verste tegel in deze richting
      const v = T.loopVak(w);
      const gezien = new Set([s.tx + ',' + s.ty]);
      const rij = [[s.tx, s.ty]];
      let beste = null;
      for (let i = 0; i < rij.length; i++) {
        const [x, y] = rij[i];
        const ver = x * stap[0] + y * stap[1];
        if (!beste || ver > beste.ver) beste = { x, y, ver };
        for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const k = x + a + ',' + (y + b);
          if (gezien.has(k) || !T.inVak(v, x + a, y + b) || !T.isBegaanbaar(w, x + a, y + b)) continue;
          gezien.add(k);
          rij.push([x + a, y + b]);
        }
      }
      if (beste.ver - (s.tx * stap[0] + s.ty * stap[1]) >= 3) {
        const pad = T.zoekRoute(w, { x: s.tx, y: s.ty }, beste, {});
        if (pad && pad.length) {
          T.geefRoute(s, pad, { x: beste.x, y: beste.y });
          return { van: [s.tx, s.ty], naar: [beste.x, beste.y], open: w.open.size };
        }
      }
      return { vast: true, op: [s.tx, s.ty], open: w.open.size };
    }, STAP[RICHTINGEN[richting]]);
    if (uit.naar) {
      log.push(`${RICHTINGEN[richting]}: van ${uit.van} naar ${uit.naar}, ${uit.open} stukken open`);
      vast = 0;
    }
    if (uit.vast && ++vast > 4) {
      log.push(`${RICHTINGEN[richting]}: komt niet verder op ${uit.op}, ${uit.open} stukken open`);
      richting++;
      vast = 0;
    }
  }
  await page.evaluate(() => Spel.zetSnelheid(Spel.S, 1));
  await page.waitForTimeout(1500);
  if (AFDRUK) await page.screenshot({ path: AFDRUK, clip: { x: 480, y: 270, width: 960, height: 540 } });
  const beelden = await page.evaluate(() => {
    window.__meet = false;
    return window.__beelden;
  });
  const zonderPlek = await page.evaluate(() => window.__zonderPlek);
  return { log, beelden, zonderPlek };
}

function verslag({ log, beelden, zonderPlek }) {
  const regels = (b) => b.ms - b.teken - b.land;
  const op = (lijst, q) => lijst.slice().sort((a, b) => a - b)[Math.floor(q * (lijst.length - 1))];
  const ms = (x) => x.toFixed(1);
  const regel = (naam, lijst) => `${naam}: mediaan ${ms(op(lijst, 0.5))} ms, 95% ${ms(op(lijst, 0.95))}, hoogst ${ms(Math.max(...lijst))}`;
  console.log(log.join('\n'));
  console.log(`\n${beelden.length} beelden in ${Math.round((beelden[beelden.length - 1].t - beelden[0].t) / 1000)} s`);
  console.log(regel('een beeld', beelden.map((b) => b.ms)));
  console.log(regel('de regels (zonder land maken)', beelden.map(regels)));
  console.log(regel('land maken', beelden.map((b) => b.land)));
  console.log(regel('tekenen', beelden.map((b) => b.teken)));
  console.log('\nper stuk dat opengaat, dat beeld en de drie erna (land maken / de rest van de regels / tekenen, in ms):');
  beelden.forEach((b, i) => {
    if (b.stuk == null) return;
    console.log(`  stuk ${b.stuk}: ${beelden.slice(i, i + 4).map((q) => `${Math.round(q.land)}/${Math.round(regels(q))}/${Math.round(q.teken)}`).join('  ')}`);
  });
  console.log('\nde zwaarste beelden:');
  const zwaar = beelden.map((b, i) => ({ i, b })).sort((x, y) => y.b.ms - x.b.ms).slice(0, 8);
  for (const { i, b } of zwaar) {
    console.log(`  beeld ${i}: ${Math.round(b.ms)} ms (regels ${Math.round(regels(b))}, land maken ${Math.round(b.land)}, tekenen ${Math.round(b.teken)})${b.stuk != null ? ', een stuk ging open' : ''}${b.nacht ? ', een nieuwe dag' : ''}`);
  }
  const zonder = Object.entries(zonderPlek);
  console.log(zonder.length ? `\nde kaart veranderd zonder plek: ${zonder.map(([wie, n]) => `${wie} ${n}×`).join(', ')}` : '\nde kaart veranderde nooit zonder plek');
}

(async () => {
  let server = null;
  if (!(await serverDraait())) {
    server = spawn(process.execPath, [path.join(WORTEL, 'server.cjs')], { cwd: WORTEL, stdio: 'ignore' });
    for (let i = 0; i < 50 && !(await serverDraait()); i++) await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await pw.chromium.launch();
  try {
    const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
    const uit = await meet(page);
    verslag(uit);
    const map = path.join(__dirname, 'uit');
    fs.mkdirSync(map, { recursive: true });
    fs.writeFileSync(path.join(map, 'stukmeting.json'), JSON.stringify({ zaad: ZAAD, richtingen: RICHTINGEN, ...uit }));
  } finally {
    await browser.close();
    if (server) server.kill();
  }
})();
