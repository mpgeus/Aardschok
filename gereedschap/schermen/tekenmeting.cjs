'use strict';
// Waar het tekenen zijn tijd kwijt is, per laag (npm run tekenmeting; werklijst vraag 123, f). Het proefdorp op eiland 5 (tot 12 okt land 5 van de maker), op
// drie schermen: 1920 bij 1080, 4K zonder schaal (3840 bij 2160 css-pixels) en 4K op 200% (1920 bij 1080, ratio 2), elk
// dichtbij en in het overzicht, overdag en 's avonds. Per beeld: alles (met een pixel teruggelezen, zodat de browser het
// tekenwerk ook doet), alleen het rekenwerk (op een doek van 1 pixel), zonder de nacht, de grondbuffer alleen, hoeveel
// opdrachten aan het doek, een CPU-profiel per laag, en de echte spellus. Zonder videokaart, zoals in de cloud, tenzij
// --videokaart of --edge (hieronder). Het rekenwerk alleen tekent altijd op een 2D-doek, ook met de videokaart.
//
//   npm run tekenmeting                                  alle drie de schermen (een kwartier)
//   npm run tekenmeting -- 1920x1080@1                   één scherm
//   npm run tekenmeting -- 1920x1080@1 --tekenen met     met WebGL op de processor (SwiftShader; de grond alleen meet 2D)
//   npm run tekenmeting -- 1920x1080@1 --videokaart      met de echte videokaart, zoals het spel bij een speler draait
//   npm run tekenmeting -- 1920x1080@1 --edge            idem in Edge
//   ... --hoogte                                         het land met heuvels (de spelregel "Height" op "Hills"; vraag 174, c)
//   ... --dagen 3                                        eerst drie speeldagen op 30×, met elk beeld getekend
//   npm run tekenmeting -- --tegen HEAD --videokaart     om en om tegen een oudere stand (hieronder, tegenStand)
//   ... --optie schaduwen=uit                            een spelregel voor allebei (alleen met --tegen)
// De uitslag in gereedschap/schermen/uit/tekenmeting*.json (niet in git), met de vlaggetjes in de naam.
//
// Om en om (--tegen REF, 18 okt; snelheid.md, "Meten"): de stand REF uit git in een losse werkkopie, met een eigen server
// op poort 8139, en de werkmap op 8123, in één browser, zodat wat de pc ernaast doet beide even raakt. Per scène
// --rondes keer (5) elk 20 beelden, de volgorde elke ronde om, en daarna één beeld van elk pixel voor pixel vergeleken
// (een kanaal meer dan 8 van 255 is anders). Alleen 1920×1080; --hoogte en --dagen gelden voor allebei.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execSync, spawn } = require('node:child_process');
const WORTEL = path.join(__dirname, '..', '..');
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); }
const URL = 'http://localhost:8123/';
const args = process.argv.slice(2);
const TEKENEN = args.includes('--tekenen') ? args[args.indexOf('--tekenen') + 1] : null; // 'met': WebGL op de processor
const EDGE = args.includes('--edge');
const VIDEOKAART = EDGE || args.includes('--videokaart');
const HOOGTE = args.includes('--hoogte');
const DAGEN = args.includes('--dagen') ? Number(args[args.indexOf('--dagen') + 1]) : 0;
const TEGEN = args.includes('--tegen') ? args[args.indexOf('--tegen') + 1] : null;
const RONDES = args.includes('--rondes') ? Number(args[args.indexOf('--rondes') + 1]) : 5;
// --optie id=keuze: een spelregel (js/opties.js) voor allebei, zoals schaduwen=uit (alleen bij --tegen).
const OPTIES = args.map((a, i) => (a === '--optie' ? args[i + 1].split('=') : null)).filter(Boolean);
// Zonder vlaggetjes tekent Playwright met SwiftShader, een videokaart in software: dan tekent het spel zonder (js/gl.js,
// geenKaart). De echte videokaart krijgt alleen de volle Chromium in het nieuwe headless, met deze vlaggen (17 okt).
const START = VIDEOKAART ? { channel: EDGE ? 'msedge' : 'chromium', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] } : {};
const SCHERMEN = (args.find((a) => /^\d+x\d+@\d/.test(a)) || '1920x1080@1,3840x2160@1,1920x1080@2').split(',');
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

// Een bladzijde met het spel, klaar om te meten: het proefdorp op eiland 5, de spellus stil, en het gereedschap van het
// meten erbij (gereedschap/grootte/pagina.js, Meet).
async function spelKlaar(page, url) {
  await page.addInitScript(() => {
    let n = 11;
    Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
    const orig = window.requestAnimationFrame.bind(window);
    window.__stop = false;
    window.requestAnimationFrame = (cb) => (window.__stop ? 0 : orig(cb));
  });
  await page.goto(url);
  await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug);
  await page.click('#menu [data-actie="nieuw"]');
  if (await page.$('#menu [data-actie="ja"]')) await page.click('#menu [data-actie="ja"]');
  await page.click('#menu [data-actie="begin"]');
  await page.keyboard.press('Escape');
  if (HOOGTE) await page.evaluate(() => Spel.zetOptie('hoogte', 'heuvels'));
  for (const [id, keuze] of OPTIES) await page.evaluate(([id, keuze]) => Spel.zetOptie(id, keuze), [id, keuze]);
  await page.evaluate(() => Spel.debug.proefdorp(5));
  await page.evaluate(() => Spel.debug.stap(0.5));
  // eerst de spellus stil: liep hij mee met de speeldagen, dan kreeg de bladzijde die sneller tekent meer tikken, en liepen
  // de twee werelden uiteen (18 okt)
  await page.evaluate(() => { window.__stop = true; });
  if (DAGEN) await page.evaluate(async (dagen) => { const S = Spel.S; Spel.zetSnelheid(S, 30); const tot = S.kalender.dag + dagen; while (S.kalender.dag < tot) await Spel.debug.stap(1 / 30); Spel.zetSnelheid(S, 1); }, DAGEN);
  await page.addScriptTag({ path: path.join(WORTEL, 'gereedschap', 'grootte', 'pagina.js') });
  page.setDefaultTimeout(180000);
}

// Om en om tegen de stand REF (--tegen; zie bovenaan).
async function tegenStand(browser) {
  const os = require('node:os');
  const map = path.join(os.tmpdir(), 'aardschok-tegen-' + TEGEN.replace(/[^\w.-]/g, '_'));
  try { execSync(`git worktree remove --force "${map}"`, { cwd: WORTEL, stdio: 'ignore' }); } catch { /* er was er geen */ }
  execSync(`git worktree add --detach "${map}" ${TEGEN}`, { cwd: WORTEL, stdio: 'ignore' });
  const stand = execSync(`git -C "${map}" log -1 --format=%h`, { encoding: 'utf8' }).trim();
  const oudServer = spawn(process.execPath, [path.join(map, 'server.cjs')], { cwd: map, env: { ...process.env, PORT: '8139' }, stdio: 'ignore' });
  try {
    for (let i = 0; i < 50; i++) {
      const ok = await new Promise((k) => http.get('http://localhost:8139/', (r) => { r.resume(); k(true); }).on('error', () => k(false)));
      if (ok) break;
      await new Promise((r) => setTimeout(r, 200));
    }
    const pages = {};
    for (const [naam, url] of [['oud', 'http://localhost:8139/'], ['nieuw', URL]]) {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      pages[naam] = await context.newPage();
      await spelKlaar(pages[naam], url);
    }
    const scènes = [['dichtbij, dag', null, 12], ['dichtbij, avond', null, 21], ['0,5, dag', 0.5, 12], ['0,35, dag', 0.35, 12], ['0,35, avond', 0.35, 21]];
    const uit = { tegen: TEGEN, stand, werkmap: execSync('git log -1 --format=%h', { cwd: WORTEL, encoding: 'utf8' }).trim(), rondes: RONDES, scènes: [] };
    const zet = ([zoom, uur]) => async (page) => page.evaluate(async ([zoom, uur]) => {
      const s = Spel.S; Meet.zetPlekken(uur); if (s.grond) s.grond.sleutel = ''; if (zoom) s.zoom = zoom; Meet.cameraOp(s.dorp.aanvoerder.tx, s.dorp.aanvoerder.ty);
      for (let i = 0; i < 100; i++) { Spel.tekenBeeld(); if (Spel.sprites.bezig() === 0) break; await new Promise((r) => setTimeout(r, 50)); }
    }, [zoom, uur]);
    for (const [naam, zoom, uur] of scènes) {
      for (const p of Object.values(pages)) await zet([zoom, uur])(p);
      // Per beeld met de kaart erbij (een pixel teruggelezen, zoals Meet.teken), en de processor alleen (zonder wachten:
      // zo loopt de spellus, en de kaart werkt dan tegelijk; js/gl.js stuurt een beeld sinds 18 okt pas in G.klaar).
      const r = { naam, oud: [], nieuw: [], oudCpu: [], nieuwCpu: [] };
      for (let i = 0; i < RONDES; i++) {
        for (const kant of i % 2 ? ['nieuw', 'oud'] : ['oud', 'nieuw']) {
          const x = await pages[kant].evaluate(([zoom, uur]) => {
            const m = Meet.teken(zoom, 20, true, { uur });
            const c = Meet.teken(zoom, 20, false, { uur });
            Spel.debug.wacht();
            return { p50: m.p50, cpu: c.p50, telling: { ...Spel.gl.telling } };
          }, [zoom, uur]);
          r[kant].push(x.p50);
          r[kant + 'Cpu'].push(x.cpu);
          r['telling ' + kant] = x.telling;
        }
      }
      // Eén beeld van elk, pixel voor pixel: het doek van de videokaart (of het gewone), twee keer getekend, zodat wat per
      // beeld bijwerkt (de doorkijk) gelijk staat, en op dezelfde klok van het scherm (de wind, het water, de rook).
      const beeld = {};
      for (const kant of ['oud', 'nieuw']) {
        beeld[kant] = Buffer.from(await pages[kant].evaluate(([zoom, uur]) => {
          const s = Spel.S; const z0 = s.zoom; const d0 = s.kalender.dag; if (zoom) s.zoom = zoom; s.kalender.dag = Math.floor(d0) + uur / 24;
          const t = s.tijd; s.tijd = 1000; Spel.tekenBeeld(); s.tijd = 1000; Spel.tekenBeeld(); s.tijd = t;
          const bron = (Spel.gl.kan() && Spel.gl.doek()) || document.getElementById('scherm');
          const c = document.createElement('canvas'); c.width = bron.width; c.height = bron.height;
          const k = c.getContext('2d'); k.drawImage(bron, 0, 0);
          const d = k.getImageData(0, 0, c.width, c.height).data;
          s.zoom = z0; s.kalender.dag = d0;
          let bin = ''; for (let i = 0; i < d.length; i += 32768) bin += String.fromCharCode.apply(null, d.subarray(i, i + 32768));
          return btoa(bin);
        }, [zoom, uur]), 'base64');
      }
      let anders = 0;
      const a = beeld.oud;
      const b = beeld.nieuw;
      for (let i = 0; i < Math.min(a.length, b.length); i += 4) {
        if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]), Math.abs(a[i + 3] - b[i + 3])) > 8) anders++;
      }
      // Wat anders is, rood op het nieuwe beeld (half zo licht), in uit/ (alleen als er iets anders is), met het oude en
      // het nieuwe beeld ernaast.
      if (anders) {
        const url = await pages.nieuw.evaluate(([a64, b64]) => {
          const a = Uint8Array.from(atob(a64), (c) => c.charCodeAt(0));
          const b = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const bron = (Spel.gl.kan() && Spel.gl.doek()) || document.getElementById('scherm');
          const c = document.createElement('canvas'); c.width = bron.width; c.height = bron.height;
          const k = c.getContext('2d'); const d = k.createImageData(c.width, c.height);
          for (let i = 0; i < d.data.length; i += 4) {
            const v = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]), Math.abs(a[i + 3] - b[i + 3]));
            if (v > 8) { d.data[i] = 255; d.data[i + 1] = 0; d.data[i + 2] = 0; } else { d.data[i] = b[i] >> 1; d.data[i + 1] = b[i + 1] >> 1; d.data[i + 2] = b[i + 2] >> 1; }
            d.data[i + 3] = 255;
          }
          k.putImageData(d, 0, 0);
          const uit = [c.toDataURL('image/png')];
          for (const x of [a, b]) {
            const e = k.createImageData(c.width, c.height);
            e.data.set(x.subarray(0, e.data.length));
            k.putImageData(e, 0, 0);
            uit.push(c.toDataURL('image/png'));
          }
          return uit;
        }, [beeld.oud.toString('base64'), beeld.nieuw.toString('base64')]);
        fs.mkdirSync(path.join(__dirname, 'uit'), { recursive: true });
        ['verschil', 'oud', 'nieuw'].forEach((soort, i) => fs.writeFileSync(path.join(__dirname, 'uit', `tekenmeting-tegen-${soort}-${naam.replace(/[^\w]+/g, '-')}.png`), Buffer.from(url[i].split(',')[1], 'base64')));
      }
      const med = (l) => { const x = [...l].sort((p, q) => p - q); return Math.round(x[x.length >> 1] * 100) / 100; };
      Object.assign(r, { oudMed: med(r.oud), nieuwMed: med(r.nieuw), oudCpuMed: med(r.oudCpu), nieuwCpuMed: med(r.nieuwCpu), verschilProcent: +((anders / (a.length / 4)) * 100).toFixed(3), zelfdeMaat: a.length === b.length });
      uit.scènes.push(r);
      const to = r['telling oud'];
      const tn = r['telling nieuw'];
      console.log(`${naam.padEnd(16)} oud ${String(r.oudMed).padStart(6)} ms  nieuw ${String(r.nieuwMed).padStart(6)} ms  (${(r.nieuwMed / r.oudMed).toFixed(2)}×; ` +
        `zonder wachten ${r.oudCpuMed} → ${r.nieuwCpuMed}, ${(r.nieuwCpuMed / r.oudCpuMed).toFixed(2)}×)  ` +
        `opdrachten ${to.opdrachten} → ${tn.opdrachten}, kladjes ${to.klad} → ${tn.klad}; anders ${r.verschilProcent}% van de pixels`);
    }
    return uit;
  } finally {
    oudServer.kill();
    try { execSync(`git worktree remove --force "${map}"`, { cwd: WORTEL, stdio: 'ignore' }); } catch { /* al weg */ }
  }
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
  if (HOOGTE) await page.evaluate(() => Spel.zetOptie('hoogte', 'heuvels'));
  await page.evaluate(() => Spel.debug.proefdorp(5));
  await page.evaluate(() => Spel.debug.stap(0.5));
  // Een paar speeldagen op 30×, met na elke twee tikken een beeld, zoals in de spellus: wat zich per beeld opstapelt
  // (op 17 okt 800 opdrachten in plaats van 60, code.md bij js/gl.js), zie je alleen zo.
  if (DAGEN) {
    const t0 = Date.now();
    await page.evaluate(async (dagen) => {
      const S = Spel.S; Spel.zetSnelheid(S, 30);
      const tot = S.kalender.dag + dagen;
      while (S.kalender.dag < tot) await Spel.debug.stap(1 / 30); // twee tikken en een beeld
      Spel.zetSnelheid(S, 1);
    }, DAGEN);
    console.log(`${DAGEN} speeldagen in ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  await page.evaluate(() => { window.__rafStop = true; });
  await page.waitForTimeout(300);
  await page.addScriptTag({ path: path.join(WORTEL, 'gereedschap', 'grootte', 'pagina.js') });
  if (TEKENEN) await page.evaluate((k) => { Spel.zetOptie('tekenen', k); Spel.TEKENEN_INSTELLINGEN.ookOpDeProcessor = true; }, TEKENEN);
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
      Meet.zetPlekken(uur); const s = Spel.S; if (s.grond) s.grond.sleutel = ''; s.zoom = zoom; Meet.cameraOp(s.dorp.aanvoerder.tx, s.dorp.aanvoerder.ty);
    }, [sc.uur, sc.zoom]);
    for (let i = 0; i < 100; i++) {
      await page.evaluate(() => Spel.tekenBeeld());
      if (await page.evaluate(() => Spel.sprites.bezig() === 0)) break;
      await page.waitForTimeout(50);
    }
    const r = { naam: sc.naam };
    r.alles = await page.evaluate(([z, u]) => Meet.teken(z, 30, true, { uur: u }), [sc.zoom, sc.uur]);
    r.alleenRekenen = await page.evaluate(([z, u]) => Meet.teken(z, 30, false, { uur: u, klein: true }), [sc.zoom, sc.uur]);
    r.zonderNacht = await page.evaluate(([z, u]) => { Spel.debug.geenNacht = true; const x = Meet.teken(z, 30, true, { uur: u }); Spel.debug.geenNacht = false; return x; }, [sc.zoom, sc.uur]);
    // de grond alleen: zijn stukken op hun plek, met een pixel teruggelezen
    r.grondAlleen = await page.evaluate(() => {
      const c = document.getElementById('scherm').getContext('2d'); const S = Spel.S; const m = Spel.tekenMaat(); const t = [];
      for (let i = 0; i < 30; i++) {
        const a = performance.now();
        c.save(); c.imageSmoothingEnabled = false;
        c.translate(Math.round(m.b / 2), Math.round(m.h / 2)); c.scale(S.zoom, S.zoom); c.translate(-Math.round(S.camera.x), -Math.round(S.camera.y));
        Spel.tekenGrondStukken(c, S); c.restore(); c.getImageData(0, 0, 1, 1); t.push(performance.now() - a);
      }
      t.sort((a, b) => a - b); return t[15];
    });
    // hoeveel opdrachten aan het doek per beeld
    r.opdrachten = await page.evaluate(() => {
      const P = CanvasRenderingContext2D.prototype; const tel = {}; const oud = {};
      for (const k of ['drawImage', 'fill', 'fillRect', 'stroke', 'fillText', 'createRadialGradient', 'createLinearGradient', 'save', 'clip']) {
        oud[k] = P[k]; P[k] = function (...a) { tel[k] = (tel[k] || 0) + 1; return oud[k].apply(this, a); };
      }
      Spel.tekenBeeld();
      for (const k in oud) P[k] = oud[k];
      return tel;
    });
    if (VIDEOKAART) r.gl = await page.evaluate(() => { Spel.tekenBeeld(); return { ...Spel.gl.telling }; });
    await page.evaluate((u) => { Spel.S.kalender.dag = Math.floor(Spel.S.kalender.dag) + u / 24; }, sc.uur);
    await cdp.send('Profiler.start');
    await page.evaluate(() => { for (let i = 0; i < 30; i++) { Spel.tekenBeeld(); Spel.debug.wacht(); } });
    const { profile } = await cdp.send('Profiler.stop');
    const p = inclusief(profile);
    r.profiel = { perBeeld: Object.fromEntries(Object.entries(p.lagen).map(([k, v]) => [k, Math.round((v / 30) * 10) / 10])), topEigenMsSamen: p.topEigen };
    // de echte spellus, met de browser die het beeld ook op het scherm zet
    r.lus = await page.evaluate(async ([z]) => { const x = await Meet.lus(3, 1, z); return { fps: Math.round(x.fps), tekenMs: Math.round(x.tekenMs * 10) / 10, tussenMax: Math.round(x.tussenMax) }; }, [sc.zoom]);
    await page.evaluate(() => { window.__rafStop = true; });
    uit.scènes.push(r);
    console.log(scherm, sc.naam, JSON.stringify({ alles: r.alles.p50, reken: r.alleenRekenen.p50, zonderNacht: r.zonderNacht.p50, grond: r.grondAlleen, lus: r.lus, gl: r.gl }));
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
  const browser = await pw.chromium.launch(START);
  if (TEGEN) {
    let uit;
    try { uit = await tegenStand(browser); } finally { await browser.close(); if (server) server.kill(); }
    fs.mkdirSync(path.join(__dirname, 'uit'), { recursive: true });
    const naam = ['tekenmeting-tegen', TEGEN.replace(/[^\w.-]/g, '_'), EDGE ? 'edge' : VIDEOKAART ? 'videokaart' : null, HOOGTE ? 'heuvels' : null, DAGEN ? `${DAGEN}dagen` : null].filter(Boolean).join('-');
    fs.writeFileSync(path.join(__dirname, 'uit', naam + '.json'), JSON.stringify(uit, null, 1) + '\n');
    return;
  }
  const alles = [];
  try { for (const s of SCHERMEN) alles.push(await meet(browser, s)); } finally { await browser.close(); if (server) server.kill(); }
  fs.mkdirSync(path.join(__dirname, 'uit'), { recursive: true });
  const naam = ['tekenmeting', TEKENEN, EDGE ? 'edge' : VIDEOKAART ? 'videokaart' : null, HOOGTE ? 'heuvels' : null, DAGEN ? `${DAGEN}dagen` : null].filter(Boolean).join('-');
  fs.writeFileSync(path.join(__dirname, 'uit', naam + '.json'), JSON.stringify(alles, null, 1) + '\n');
})().catch((e) => { console.error(e); process.exit(1); });
