'use strict';
// Vaste schermafdrukken van het spel (npm run schermen; werklijst vraag 114, stap 1). Voor een verandering aan hoe het
// spel tekent of zijn plaatjes laadt (de vellen per tekening, straks WebGL, vraag 123): draai het ervoor en erna, en het
// zegt per beeld of het byte voor byte hetzelfde bleef, en anders hoeveel pixels er verschillen. Het meet erbij wat de
// browser aan plaatjes vasthoudt (Spel.debug.vellen), hoeveel geheugen Chromium gebruikt, en hoe lang het eerste beeld
// na het uitzoomen duurt.
//
//   npm run schermen -- --naam voor              schrijft gereedschap/schermen/uit/voor/ (de beelden en meting.json)
//   npm run schermen -- --naam na --tegen voor   en vergelijkt met wat er in uit/voor/ staat
//   npm run schermen -- --naam gl --tegen voor --tekenen met    met de videokaart (WebGL, vraag 123)
//
// Vast blijft het zo: de spellus loopt niet (requestAnimationFrame staat stil), het toeval is een vaste reeks, het spel
// gaat alleen verder met Spel.debug.stap (elk beeld 1/60 seconde), de mensen staan op hun plek voor het uur
// (Meet.zetPlekken uit gereedschap/grootte/pagina.js), en elk beeld wacht tot alle plaatjes er zijn (T.sprites.bezig).
// Het ontworpen gehucht en land 5 van de maker, op 1280 bij 800, zonder videokaart (zoals in de cloud).
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execSync, spawn } = require('node:child_process');
const K = require('../pixelart/kern.cjs');

function laadPlaywright() {
  try {
    return require('playwright');
  } catch {
    try {
      return require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright'));
    } catch {
      console.error('Playwright ontbreekt. Installeer het met `npm i -g playwright` en `npx playwright install chromium`.');
      process.exit(1);
    }
  }
}

const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'uit');
const URL = 'http://localhost:8123/';
const VENSTER = { width: 1280, height: 800 };

const args = process.argv.slice(2);
const optie = (naam) => (args.includes(naam) ? args[args.indexOf(naam) + 1] : null);
const NAAM = optie('--naam') || 'laatste';
const TEGEN = optie('--tegen');
const TEKENEN = optie('--tekenen'); // 'met': met de videokaart (de spelregel "Tekenen", vraag 123)

// Antwoordt de server van npm start (server.cjs)? Zo niet, dan start dit hem, en stopt hem na afloop.
const serverDraait = () => new Promise((klaar) => {
  http.get(URL, (r) => { r.resume(); klaar(true); }).on('error', () => klaar(false));
});
async function zorgVoorServer() {
  if (await serverDraait()) return null;
  const server = spawn(process.execPath, [path.join(WORTEL, 'server.cjs')], { cwd: WORTEL, stdio: 'ignore' });
  for (let i = 0; i < 50 && !(await serverDraait()); i++) await new Promise((r) => setTimeout(r, 200));
  return server;
}

// Het geheugen van Chromium: alle processen van de browser die dit script startte, samen (RSS, in MB). Alleen waar /proc
// is (Linux); anders null.
function geheugenVanChromium() {
  try {
    const ouders = new Map();
    for (const p of fs.readdirSync('/proc')) {
      if (!/^\d+$/.test(p)) continue;
      const stat = fs.readFileSync(`/proc/${p}/stat`, 'utf8');
      ouders.set(Number(p), Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1]));
    }
    const boom = new Set([process.pid]);
    for (let groei = true; groei;) {
      groei = false;
      for (const [p, ouder] of ouders) if (boom.has(ouder) && !boom.has(p)) { boom.add(p); groei = true; }
    }
    let kb = 0;
    for (const p of boom) {
      if (!/chrom|headless/i.test(fs.readFileSync(`/proc/${p}/comm`, 'utf8'))) continue;
      const m = /VmRSS:\s+(\d+)/.exec(fs.readFileSync(`/proc/${p}/status`, 'utf8'));
      if (m) kb += Number(m[1]);
    }
    return Math.round(kb / 1024);
  } catch {
    return null;
  }
}

// Een bladzijde met het spel, zonder spellus en met een vaste reeks toeval, en de hulpjes van npm run grootte erbij.
async function openSpel(context, adres) {
  const page = await context.newPage();
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(m.text()); });
  await page.addInitScript(() => {
    let n = 11;
    Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
    window.requestAnimationFrame = () => 0; // de spellus loopt niet: alleen Spel.debug.stap laat het spel verder gaan
  });
  await page.goto(adres);
  // Op een klok kijken, niet per beeld van de browser: de spellus loopt hier niet.
  await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug && Spel.sprites, null, { polling: 100 });
  await page.waitForFunction(() => Spel.sprites.aan && Spel.sprites.buitenAan, null, { polling: 100, timeout: 60000 });
  await page.addScriptTag({ path: path.join(WORTEL, 'gereedschap', 'grootte', 'pagina.js') });
  if (TEKENEN) await page.evaluate((k) => { Spel.zetOptie('tekenen', k); Spel.TEKENEN_INSTELLINGEN.ookOpDeProcessor = true; }, TEKENEN);
  return { page, fouten };
}

// Tekenen tot alle plaatjes er zijn (wat een beeld vraagt, kan pas dan beginnen te laden), en dan het doek als PNG.
async function afdruk(page) {
  for (let i = 0; i < 100; i++) {
    await page.evaluate(() => Spel.debug.stap(0));
    if (await page.evaluate(() => Spel.sprites.bezig() === 0)) break;
    await page.waitForTimeout(50);
  }
  const data = await page.evaluate(() => Spel.debug.beeld().toDataURL('image/png'));
  return Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
}

// Hoe lang het eerste beeld duurt na het uitzoomen naar `zoom` (de grond en het bos opnieuw in hun buffer): één beeld,
// met een pixel teruggelezen, zodat de browser het tekenwerk ook echt doet.
const eersteBeeldOp = (page, zoom) => page.evaluate((z) => {
  const s = Spel.S;
  s.zoom = z;
  const t0 = performance.now();
  Spel.debug.beeld().getContext('2d').getImageData(0, 0, 1, 1);
  return Math.round(performance.now() - t0);
}, zoom);

// Het uur, de zoom en waar de camera kijkt, met de mensen op hun plek voor dat uur.
const zet = (page, { uur, zoom, op }) => page.evaluate(([uur, zoom, op]) => {
  const s = Spel.S;
  Meet.zetPlekken(uur);
  if (s.grond) s.grond.sleutel = '';
  s.zoom = zoom;
  if (op) Meet.cameraOp(op[0], op[1]);
}, [uur, zoom, op]);

async function hetOntworpenGehucht(context, beelden, meting) {
  const { page, fouten } = await openSpel(context, URL + '?kaart=gehucht');
  await page.evaluate(() => Spel.debug.stap(0.5)); // het dorp komt op gang: wie er woont, staat er
  const zoom = await page.evaluate(() => Spel.S.zoom);
  const plein = [35, 37];
  await zet(page, { uur: 12, zoom, op: plein });
  beelden.plein = await afdruk(page);
  meting.bijHetBegin = await page.evaluate(() => Spel.debug.vellen('alles'));
  meting.eersteUitzoomen = await eersteBeeldOp(page, 0.35);
  for (const z of [1, 0.5, 0.35]) {
    await zet(page, { uur: 12, zoom: z, op: plein });
    beelden[`plein-zoom-${z}`] = await afdruk(page);
  }
  meting.inHetOverzicht = await page.evaluate(() => Spel.debug.vellen());
  meting.chromiumInHetOverzicht = geheugenVanChromium();
  const herberg = await page.evaluate(() => { const h = Spel.herbergVan(Spel.S.dorp); return h && [h.x + 2, h.y + 2]; });
  await zet(page, { uur: 20.8, zoom, op: herberg || plein });
  beelden['herberg-avond'] = await afdruk(page);
  await zet(page, { uur: 2, zoom, op: plein });
  beelden.nacht = await afdruk(page);
  // Twee bouwplaatsen, een uit elk vel (de smidse uit de gebouwen, een stenen huis uit de huizen), in hun vijf fases,
  // en dan klaar. Een fase volgt uit hoe ver de bouwtijd is (T.bouwFaseIndex): die zetten we hier recht.
  const plaatsen = await page.evaluate(() => {
    const D = Spel.S.dorp;
    Spel.wijzigVoorraad(D, 'hout', 200);
    Spel.wijzigVoorraad(D, 'goud', 200);
    window.__bouwplaatsen = [];
    for (const soort of ['smidse', 'stenenHuis']) {
      let r = null;
      for (let y = 44; y < 70 && !(r && r.gelukt); y++) {
        for (let x = 40; x < 70 && !(r && r.gelukt); x++) r = Spel.debug.bouw(soort, x, y);
      }
      if (r && r.gelukt) window.__bouwplaatsen.push({ soort, g: r.instantie });
    }
    return window.__bouwplaatsen.map((p) => ({ soort: p.soort, x: p.g.x, y: p.g.y, tekening: p.g.tekening }));
  });
  meting.bouwplaatsen = plaatsen;
  for (const [i, p] of plaatsen.entries()) {
    for (let fase = 0; fase <= 5; fase++) {
      await page.evaluate(([i, fase]) => {
        const v = window.__bouwplaatsen[i].g.voorwerp;
        if (fase < 5) v.klaarOp = Spel.S.kalender.dag + v.bouwtijd * (1 - (fase + 0.5) / 5);
        else v.inAanbouw = false;
      }, [i, fase]);
      await zet(page, { uur: 12, zoom, op: [p.x + 2, p.y + 2] });
      beelden[`${p.soort}-${fase < 5 ? `fase${fase}` : 'klaar'}`] = await afdruk(page);
    }
  }
  meting.naDeBouwplaatsen = await page.evaluate(() => Spel.debug.vellen());
  meting.chromiumNaDeBouwplaatsen = geheugenVanChromium();
  meting.fouten = fouten;
  await page.close();
}

async function eenLandVanDeMaker(context, beelden, meting) {
  const { page, fouten } = await openSpel(context, URL);
  await page.click('#menu [data-actie="nieuw"]');
  if (await page.$('#menu [data-actie="ja"]')) await page.click('#menu [data-actie="ja"]');
  await page.click('#menu [data-actie="begin"]');
  await page.keyboard.press('Escape');
  await page.evaluate(() => Spel.debug.gehucht(5));
  await page.evaluate(() => Spel.debug.stap(0.5));
  const zoom = await page.evaluate(() => Spel.S.zoom);
  const schout = await page.evaluate(() => [Spel.S.schout.tx, Spel.S.schout.ty]);
  await zet(page, { uur: 12, zoom, op: schout });
  beelden.maker5 = await afdruk(page);
  meting.maker5 = await page.evaluate(() => Spel.debug.vellen());
  await zet(page, { uur: 12, zoom: 0.5, op: schout });
  beelden['maker5-zoom-0.5'] = await afdruk(page);
  meting.makerFouten = fouten;
  await page.close();
}

// Twee afdrukken vergelijken: byte voor byte, en anders pixel voor pixel. Een pixel die anders is, is afronding (hooguit
// 2 op 255 per kleur: doorzichtigheid en verlopen rekenen op de videokaart net anders), een buurpixel (de andere manier
// van tekenen koos bij een zoom die geen heel getal is de pixel ernaast: hij is gelijk aan een van de acht buren), of echt
// anders. De maat voor WebGL tegen 2D (vraag 123): overdag niet meer dan 0,1% echt anders.
function vergelijk(a, b) {
  if (a.equals(b)) return { gelijk: true };
  const pa = K.leesPng(a);
  const pb = K.leesPng(b);
  if (pa.b !== pb.b || pa.h !== pb.h) return { gelijk: false, reden: `maat ${pa.b}×${pa.h} tegen ${pb.b}×${pb.h}` };
  const verschil = (i, j) => Math.max(Math.abs(pa.rgba[i] - pb.rgba[j]), Math.abs(pa.rgba[i + 1] - pb.rgba[j + 1]), Math.abs(pa.rgba[i + 2] - pb.rgba[j + 2]), Math.abs(pa.rgba[i + 3] - pb.rgba[j + 3]));
  let anders = 0;
  let afronding = 0;
  let buur = 0;
  let echt = 0;
  for (let y = 0; y < pa.h; y++) {
    for (let x = 0; x < pa.b; x++) {
      const i = (y * pa.b + x) * 4;
      const d = verschil(i, i);
      if (!d) continue;
      anders++;
      if (d <= 2) { afronding++; continue; }
      let isBuur = false;
      for (let dy = -1; dy <= 1 && !isBuur; dy++) {
        for (let dx = -1; dx <= 1 && !isBuur; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if ((dx || dy) && xx >= 0 && yy >= 0 && xx < pa.b && yy < pa.h && verschil((yy * pa.b + xx) * 4, i) <= 2) isBuur = true;
        }
      }
      if (isBuur) buur++;
      else echt++;
    }
  }
  const pct = (n) => Math.round((n / (pa.b * pa.h)) * 10000) / 100;
  return { gelijk: false, anders, procent: pct(anders), afronding, buur, echt, echtProcent: pct(echt) };
}

(async () => {
  const server = await zorgVoorServer();
  const { chromium } = laadPlaywright();
  const browser = await chromium.launch();
  const beelden = {};
  const meting = { naam: NAAM, commit: execSync('git rev-parse --short HEAD', { cwd: WORTEL, encoding: 'utf8' }).trim() };
  try {
    const context = await browser.newContext({ viewport: VENSTER });
    await hetOntworpenGehucht(context, beelden, meting);
    await eenLandVanDeMaker(context, beelden, meting);
    await context.close();
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  const map = path.join(UIT, NAAM);
  fs.mkdirSync(map, { recursive: true });
  for (const [naam, png] of Object.entries(beelden)) fs.writeFileSync(path.join(map, `${naam}.png`), png);
  fs.writeFileSync(path.join(map, 'meting.json'), JSON.stringify(meting, null, 1) + '\n');
  const kort = (v) => v && `${v.samen} MB in ${v.vellen} vellen`;
  console.log(`${Object.keys(beelden).length} beelden in gereedschap/schermen/uit/${NAAM}/ (commit ${meting.commit})`);
  console.log(`  plaatjes bij het begin: ${kort(meting.bijHetBegin)}; in het overzicht: ${kort(meting.inHetOverzicht)}; na de bouwplaatsen: ${kort(meting.naDeBouwplaatsen)}; land 5 van de maker: ${kort(meting.maker5)}`);
  console.log(`  het eerste beeld op 0,35: ${meting.eersteUitzoomen} ms; Chromium samen: ${meting.chromiumInHetOverzicht} MB in het overzicht, ${meting.chromiumNaDeBouwplaatsen} MB na de bouwplaatsen`);
  if (meting.bouwplaatsen.length < 2) console.log(`  let op: maar ${meting.bouwplaatsen.length} bouwplaats(en) gezet`);
  const fouten = [...meting.fouten, ...meting.makerFouten];
  if (fouten.length) console.log(`  fouten in de bladzijde:\n    ${fouten.join('\n    ')}`);
  if (TEGEN) {
    let gelijk = 0;
    for (const naam of Object.keys(beelden)) {
      const ander = path.join(UIT, TEGEN, `${naam}.png`);
      if (!fs.existsSync(ander)) { console.log(`  ${naam}: niet in ${TEGEN}`); continue; }
      const v = vergelijk(beelden[naam], fs.readFileSync(ander));
      if (v.gelijk) gelijk++;
      else console.log(`  ${naam}: anders dan in ${TEGEN}: ${v.reden || `${v.anders} pixels (${v.procent}%): ${v.afronding} afronding, ${v.buur} buurpixel, ${v.echt} echt anders (${v.echtProcent}%)`}`);
    }
    console.log(`  ${gelijk} van ${Object.keys(beelden).length} beelden byte voor byte gelijk aan ${TEGEN}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
