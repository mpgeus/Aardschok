'use strict';
// De meting van de renderproef (gereedschap/pixiproef/evaluatie.md): dezelfde scène met js/gl.js en met PixiJS v8, in
// Chromium met de echte videokaart (zoals npm run tekenmeting -- --videokaart), en in de Electron van de proefversie
// (zoals het spel op Steam draait, met loadFile).
//
// De tijd: alle varianten tegelijk open (elk een eigen bladzijde, &alleen, met de spellus stil), en per zoom in korte
// blokken om en om. Deze pc wordt gedeeld (een render, een spel in Firefox, een andere sessie): op 17 okt liep Pixi in
// de tweede van twee rondes na elkaar vier keer zo traag als in de eerste, door iets anders op de machine. Om en om in
// blokjes raakt zo'n storing beide kanten, en elk blok schrijft op hoe druk de machine was (`belasting`, het deel van
// alle kernen dat bezig was, deze meting zelf meegerekend). Het geheugen, de wissel naar plat en de echte beelden per
// seconde daarna per tekenaar in een verse bladzijde, zodat het geheugen van de een niet bij de ander telt.
//
//   node gereedschap/pixiproef/meting.cjs            alles (een minuut of vijftien; npm start moet draaien)
//   node gereedschap/pixiproef/meting.cjs --snel     één blok per zoom, zonder Electron
//   ... --varianten huidig,gl2,gpu-vast              alleen deze (de namen hieronder, bij VARIANTEN)
//   ... --uit meting-gpu.json                        een andere naam voor de uitslag
//
// De uitslag in gereedschap/pixiproef/meting.json, en de vergelijking van het beeld in vergelijking-*.png (als pixi
// erbij is). De maat tussen WebGL en WebGPU is de doorvoer (Proef.meet, doorvoer): WebGPU kan alleen met een belofte
// op de kaart wachten, dus 'alles' telt daar een ronde van de browser per beeld mee.
// Meet niet terwijl er een render of een spel loopt: die nemen de processor in beslag (code.md bij js/gl.js).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { execSync, spawnSync } = require('node:child_process');
const MAP = __dirname;
const WORTEL = path.join(MAP, '..', '..');
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); }
const URL = 'http://localhost:8123/gereedschap/pixiproef/index.html';
const SNEL = process.argv.includes('--snel');
const B = 1920;
const H = 1080;
const ZOOMS = [1, 0.5, 0.35];
const START = { channel: 'chromium', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-precise-memory-info', '--js-flags=--expose-gc'] };
// De varianten: de huidige weg; Pixi op drie manieren van sorteren (pixiweg.js), met Pixi's eigen Culler en op WebGPU;
// en de eigen tekenaar op WebGL2 en op WebGPU (gl2weg.js, gpuweg.js), per beeld een lijst of met een vaste rij (vast).
const ALLE = [
  { naam: 'huidig', q: 'weg=huidig' },
  { naam: 'pixi', q: 'weg=pixi&sorteer=pixi' },
  { naam: 'pixi-alles', q: 'weg=pixi&sorteer=alles' },
  { naam: 'pixi-eigen', q: 'weg=pixi&sorteer=eigen' },
  { naam: 'pixi-culler', q: 'weg=pixi&sorteer=alles&culler=pixi' },
  { naam: 'pixi-gpu', q: 'weg=pixi&sorteer=pixi&pixigpu' },
  { naam: 'gl2', q: 'weg=gl2' },
  { naam: 'gpu', q: 'weg=gpu' },
  { naam: 'gl2-vast', q: 'weg=gl2&vast' },
  { naam: 'gpu-vast', q: 'weg=gpu&vast' },
];
const keuze = process.argv.includes('--varianten') ? process.argv[process.argv.indexOf('--varianten') + 1].split(',') : null;
const VARIANTEN = ALLE.filter((v) => !keuze || v.naam === 'huidig' || keuze.includes(v.naam));
const UIT = process.argv.includes('--uit') ? process.argv[process.argv.indexOf('--uit') + 1] : 'meting.json';
// Wie ook geheugen, de wissel en de echte beelden per seconde krijgt, en in Electron komt.
const UITGEBREID = ['huidig', 'pixi', 'pixi-gpu', 'gl2', 'gpu', 'gl2-vast', 'gpu-vast'];

const BLOKKEN = SNEL ? 1 : 4;
// Hoe druk de machine was sinds `van` (het deel van alle kernen dat bezig was).
const kernen = () => os.cpus().reduce((a, c) => { const t = c.times; a.bezig += t.user + t.nice + t.sys + t.irq; a.alles += t.user + t.nice + t.sys + t.irq + t.idle; return a; }, { bezig: 0, alles: 0 });
const belasting = (van) => { const nu = kernen(); return +((nu.bezig - van.bezig) / Math.max(1, nu.alles - van.alles)).toFixed(3); };
// Wacht tot de machine rustig is (minder dan RUSTIG van alle kernen bezig, twee seconden lang, terwijl de proef zelf
// stilstaat), hooguit een kwartier; zegt hoe lang het wachtte. Op 17 okt liep er midden in de meting een npm test van
// een andere sessie met zestien werkers.
const RUSTIG = 0.2;
const slaap = (ms) => new Promise((k) => setTimeout(k, ms));
async function wachtOpRust() {
  const t0 = Date.now();
  for (;;) {
    const van = kernen();
    await slaap(2000);
    const b = belasting(van);
    if (b < RUSTIG || Date.now() - t0 > 15 * 60000) return { gewachtS: Math.round((Date.now() - t0) / 1000), rust: b };
    if (Date.now() - t0 < 2500) console.log(`  de machine is druk (${Math.round(b * 100)}%), even wachten ...`);
  }
}
const mediaan = (l) => { const s = [...l].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

const serverDraait = () => new Promise((klaar) => {
  http.get(URL, (r) => { r.resume(); klaar(r.statusCode === 200); }).on('error', () => klaar(false));
});

async function bladzijde(browser, q) {
  const page = await browser.newPage({ viewport: { width: B, height: H } });
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(e.message));
  await page.goto(`${URL}?${q}&b=${B}&h=${H}&kaal`);
  await page.waitForFunction(() => Proef.klaar || Proef.fout, null, { timeout: 120000 });
  const fout = await page.evaluate(() => Proef.fout);
  if (fout) throw new Error(fout);
  return { page, fouten };
}

// De tijd, om en om: per zoom BLOKKEN keer elke variant 120 beelden (na 30 om warm te lopen), de volgorde elk blok om.
async function meetOmEnOm(browser) {
  const paginas = {};
  for (const v of VARIANTEN) {
    paginas[v.naam] = (await bladzijde(browser, v.q + '&alleen')).page;
    await paginas[v.naam].evaluate(() => { Proef.loopt = false; });
  }
  const blokken = {};
  for (const z of ZOOMS) {
    for (let b = 0; b < BLOKKEN; b++) {
      const rij = {};
      const rust = await wachtOpRust();
      for (const v of (b % 2 ? [...VARIANTEN].reverse() : VARIANTEN)) {
        const van = kernen();
        const m = await paginas[v.naam].evaluate((z) => Proef.meet(120, 30, { zoom: z }), z);
        await paginas[v.naam].evaluate(() => { Proef.loopt = false; });
        m.belasting = belasting(van);
        m.rustVooraf = rust;
        rij[v.naam] = m;
      }
      for (const v of VARIANTEN) ((blokken[v.naam] = blokken[v.naam] || {})[z] = blokken[v.naam][z] || []).push(rij[v.naam]);
      console.log(`zoom ${z}, blok ${b + 1}: ` + VARIANTEN.map((v) => `${v.naam} ${rij[v.naam].doorvoer} ms (${Math.round(rij[v.naam].belasting * 100)}%)`).join(', '));
    }
  }
  for (const p of Object.values(paginas)) await p.close();
  // Per variant en zoom: de mediaan over de blokken, en de verhouding tot huidig in hetzelfde blok.
  const samen = {};
  for (const v of VARIANTEN) {
    samen[v.naam] = {};
    for (const z of ZOOMS) {
      const l = blokken[v.naam][z];
      const h = blokken.huidig[z];
      samen[v.naam][z] = {
        allesMed: mediaan(l.map((m) => m.alles.med)), cpuMed: mediaan(l.map((m) => m.cpu.med)), p95: mediaan(l.map((m) => m.alles.p95)),
        maalHuidig: +mediaan(l.map((m, i) => m.alles.med / h[i].alles.med)).toFixed(2), opdrachten: l[0].opdrachten, zicht: l[0].zicht,
        doorvoer: mediaan(l.map((m) => m.doorvoer)), doorvoerMaalHuidig: +mediaan(l.map((m, i) => m.doorvoer / h[i].doorvoer)).toFixed(2),
        cpuMaalHuidig: +mediaan(l.map((m, i) => m.cpu.med / h[i].cpu.med)).toFixed(2),
        belasting: mediaan(l.map((m) => m.belasting)),
      };
    }
  }
  return { blokken, samen };
}

async function meetVariant(browser, v) {
  const { page, fouten } = await bladzijde(browser, v.q + '&alleen');
  const uit = { variant: v.naam, zooms: {}, extra: {} };
  for (const z of ZOOMS) uit.zooms[z] = await page.evaluate((z) => Proef.meet(120, 30, { zoom: z }), z);
  {
    // Waar de tijd zit op 35%: zonder schaduw, zonder licht, alles stil, en pannen.
    const z = 0.35;
    uit.extra.zonderSchaduw = await page.evaluate((z) => Proef.meet(180, 30, { zoom: z, schaduw: false }), z);
    uit.extra.zonderLicht = await page.evaluate((z) => Proef.meet(180, 30, { zoom: z, schaduw: true, licht: false }), z);
    uit.extra.stil = await page.evaluate((z) => Proef.meet(180, 30, { zoom: z, licht: true, beweging: false }), z);
    uit.extra.pannen = await page.evaluate((z) => Proef.meet(180, 30, { zoom: z, beweging: true, pannen: true }), z);
    await page.evaluate(() => { Proef.inst.pannen = false; Proef.cam.x = Proef.scene.midden.x; Proef.cam.y = Proef.scene.midden.y; });
    // Echte beelden per seconde met de spellus, op 35%.
    await page.evaluate(() => Proef.zetZoom(0.35));
    uit.extra.fps = await page.evaluate(() => Proef.fps(3));
    // Wisselen naar een andere weergave van de gebouwen, op 50%, en daarna een meting in die weergave.
    await page.evaluate(() => Proef.zetZoom(0.5));
    await page.evaluate(() => Proef.meet(30, 10, { zoom: 0.5 }));
    uit.extra.wissel = {};
    for (const m of ['plat', 'doorzichtig', 'verborgen', 'gewoon']) {
      const w = await page.evaluate((m) => Proef.wissel(m), m);
      w.daarna = await page.evaluate(() => Proef.meet(120, 20, { zoom: 0.5 }));
      uit.extra.wissel[m] = w;
    }
  }
  uit.geheugen = await page.evaluate(() => Proef.geheugen());
  uit.fouten = fouten;
  await page.close();
  return uit;
}

// Het beeld: beide tekenaars in één bladzijde, pixel voor pixel, per zoom; en Pixi met mipmaps ernaast.
async function vergelijkBeeld(browser) {
  const uit = { verschil: {}, platen: [] };
  const { page } = await bladzijde(browser, 'weg=huidig');
  const mip = await bladzijde(browser, 'weg=pixi&alleen&mip');
  const beelden = {};
  for (const z of ZOOMS) {
    await page.evaluate((z) => { Proef.zetZoom(z); Proef.inst.beweging = false; Proef.t = 3; }, z);
    const r = await page.evaluate(() => Proef.vergelijk());
    uit.verschil[z] = { verschilProcent: r.verschilProcent, gemiddeld: r.gemiddeld };
    await mip.page.evaluate((z) => { Proef.zetZoom(z); Proef.inst.beweging = false; Proef.t = 3; }, z);
    const m = await mip.page.evaluate(async () => {
      Proef.loopt = false;
      Proef.stand(Proef.scene, Proef.t);
      Proef.weg.teken(Proef.scene, Proef.cam, Proef.inst);
      const d = document.createElement('canvas');
      d.width = Proef.weg.b; d.height = Proef.weg.h;
      d.getContext('2d').drawImage(Proef.weg.canvas, 0, 0);
      return d.toDataURL('image/png');
    });
    beelden[z] = { huidig: r.huidig, pixi: r.pixi, mip: m };
  }
  // De plaat: per zoom een uitsnede van 480 bij 270 uit het midden, twee keer vergroot (dan zie je de pixels), en het
  // hele beeld verkleind ernaast.
  const plaat = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  for (const z of ZOOMS) {
    const url = await plaat.evaluate(async ({ b, z }) => {
      const laad = (src) => new Promise((k) => { const i = new Image(); i.onload = () => k(i); i.src = src; });
      const namen = [['huidig', 'js/gl.js (naaste pixel)'], ['pixi', 'PixiJS 8.22 (naaste pixel)'], ['mip', 'PixiJS 8.22 (lineair + mipmaps)']];
      const d = document.createElement('canvas');
      const uw = 480;
      const uh = 270;
      d.width = uw * 2 * 3 + 40;
      d.height = uh * 2 + 40;
      const c = d.getContext('2d');
      c.fillStyle = '#111';
      c.fillRect(0, 0, d.width, d.height);
      c.imageSmoothingEnabled = false;
      c.font = '16px system-ui';
      for (let i = 0; i < 3; i++) {
        const img = await laad(b[namen[i][0]]);
        const x = i * (uw * 2 + 20);
        c.drawImage(img, (img.width - uw) / 2, (img.height - uh) / 2 + 60, uw, uh, x, 30, uw * 2, uh * 2);
        c.fillStyle = '#ddd';
        c.fillText(`${namen[i][1]}, zoom ${Math.round(z * 100)}%`, x + 4, 20);
      }
      return d.toDataURL('image/png');
    }, { b: beelden[z], z });
    const bestand = `vergelijking-${Math.round(z * 100)}.png`;
    fs.writeFileSync(path.join(MAP, bestand), Buffer.from(url.split(',')[1], 'base64'));
    uit.platen.push(bestand);
  }
  await plaat.close();
  await page.close();
  await mip.page.close();
  return uit;
}

// Het beeld van de eigen tekenaars op WebGL2 en WebGPU (per beeld een lijst, en vast met de dieptebuffer) tegen
// js/gl.js, pixel voor pixel per zoom.
async function vergelijkNieuw(browser) {
  const uit = {};
  for (const vast of [false, true]) {
    const { page } = await bladzijde(browser, 'wegen=huidig,gl2,gpu' + (vast ? '&vast' : ''));
    for (const z of ZOOMS) {
      await page.evaluate((z) => { Proef.zetZoom(z); Proef.inst.beweging = false; Proef.t = 3; }, z);
      for (const w of ['gl2', 'gpu']) {
        const r = await page.evaluate((w) => Proef.vergelijk('huidig', w), w);
        ((uit[w + (vast ? '-vast' : '')] = uit[w + (vast ? '-vast' : '')] || {})[z] = { verschilProcent: r.verschilProcent, gemiddeld: r.gemiddeld });
      }
    }
    await page.close();
  }
  return uit;
}

// Electron, zoals de Steam-versie: loadFile (file://), met de videokaart; per tekenaar de drie zooms.
async function meetElectron() {
  const exe = path.join(WORTEL, 'gereedschap', 'proefversie', 'uit', 'electron-v44.5.1-win32-x64', 'electron.exe');
  if (!fs.existsSync(exe)) return { overgeslagen: 'geen electron.exe (npm run proefversie -- --windows haalt hem)' };
  // Om en om, twee keer elk (huidig, pixi, pixi, huidig), elk in een eigen Electron.
  const uit = {};
  const lijst = VARIANTEN.filter((v) => UITGEBREID.includes(v.naam));
  for (const v of [...lijst, ...[...lijst].reverse()]) {
    await wachtOpRust();
    const van = kernen();
    const r = spawnSync(exe, [path.join(MAP, 'electron'), path.join(MAP, 'index.html'), v.q], { encoding: 'utf8', timeout: 240000 });
    const regel = (r.stdout || '').split('\n').find((l) => l.startsWith('UITSLAG '));
    const m = regel ? JSON.parse(regel.slice(8)) : { fout: (r.stderr || r.error || '').toString().slice(0, 400) };
    m.belasting = belasting(van);
    (uit[v.naam] = uit[v.naam] || []).push(m);
    if (m.zooms) console.log(v.naam.padEnd(9), ZOOMS.map((z) => `${z}: ${m.zooms[z].doorvoer} ms (cpu ${m.zooms[z].cpu.med})`).join(', '), `(${Math.round(m.belasting * 100)}%)`);
    else console.log(v.naam, m.fout);
  }
  return uit;
}

// Vanaf een los bestand (file://) in Chromium: mag een plaatje naar de kaart?
async function meetLosBestand(browser) {
  const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
  const meldingen = [];
  page.on('console', (m) => meldingen.push(m.text()));
  page.on('pageerror', (e) => meldingen.push('pageerror: ' + e.message));
  const url = 'file:///' + path.join(MAP, 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
  await page.goto(url + '?b=640&h=360&kaal');
  await page.waitForFunction(() => Proef.klaar || Proef.fout, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  const uit = await page.evaluate(() => ({ glKapot: Spel.gl.kapot(), fout: Proef.fout }));
  uit.besmet = meldingen.filter((m) => /Tainted|SecurityError|cross-origin/i.test(m)).length;
  uit.voorbeeld = [...new Set(meldingen.map((m) => m.slice(0, 140)))].slice(0, 3);
  await page.close();
  return uit;
}

(async () => {
  if (!(await serverDraait())) {
    console.error('De server draait niet: eerst npm start (poort 8123).');
    process.exit(1);
  }
  const browser = await pw.chromium.launch(START);
  const kaart = await (async () => {
    const p = await browser.newPage();
    const k = await p.evaluate(() => { const c = document.createElement('canvas').getContext('webgl'); const e = c && c.getExtension('WEBGL_debug_renderer_info'); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'geen'; });
    await p.close();
    return k;
  })();
  const stand = (() => { try { return execSync('git log -1 --format=%h', { cwd: WORTEL, encoding: 'utf8' }).trim(); } catch { return '?'; } })();
  const uit = { datum: new Date().toISOString(), stand, scherm: `${B}x${H}`, kaart, browser: browser.version(), kernen: os.cpus().length };
  console.log(`Kaart: ${kaart}; Chromium ${browser.version()}; stand ${stand}`);
  uit.tijd = await meetOmEnOm(browser);
  for (const v of VARIANTEN) console.log(v.naam.padEnd(12), ZOOMS.map((z) => { const s = uit.tijd.samen[v.naam][z]; return `${z}: ${s.doorvoer} ms (${s.doorvoerMaalHuidig}×, cpu ${s.cpuMed})`; }).join(', '));
  uit.perTekenaar = {};
  for (const v of VARIANTEN.filter((w) => UITGEBREID.includes(w.naam))) {
    process.stdout.write(`${v.naam}: geheugen, wissel, beelden per seconde ... `);
    await wachtOpRust();
    const van = kernen();
    uit.perTekenaar[v.naam] = await meetVariant(browser, v);
    uit.perTekenaar[v.naam].belasting = belasting(van);
    console.log(JSON.stringify(uit.perTekenaar[v.naam].geheugen).slice(0, 160));
  }
  if (VARIANTEN.some((v) => v.naam === 'pixi')) {
    console.log('het beeld ...');
    uit.beeld = await vergelijkBeeld(browser);
    console.log(JSON.stringify(uit.beeld.verschil));
  }
  if (VARIANTEN.some((v) => /^(gl2|gpu)/.test(v.naam))) {
    uit.beeldNieuw = await vergelijkNieuw(browser);
    console.log('het beeld van WebGL2 en WebGPU:', JSON.stringify(uit.beeldNieuw));
  }
  console.log('los bestand ...');
  uit.losBestand = await meetLosBestand(browser);
  console.log(JSON.stringify(uit.losBestand));
  await browser.close();
  if (!SNEL) {
    console.log('Electron ...');
    uit.electron = await meetElectron();
  }
  fs.writeFileSync(path.join(MAP, UIT), JSON.stringify(uit, null, 1));
  console.log('klaar: gereedschap/pixiproef/' + UIT);
})().catch((e) => { console.error(e); process.exit(1); });
