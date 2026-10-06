'use strict';
// Het spel in het kort (Marcel, 6 okt: "Maak een korte samenvatting van wat ons spel is en hoe het speelt in pdf vorm
// aub. Zodat iemand anders het kan lezen"): een paar bladzijden voor een gamedesigner, met beelden uit het spel. De tekst
// staat in samenvatting.html, de beelden in beelden/, en de pdf komt in ontwerp/het-spel-in-het-kort.pdf; alle drie in
// git, zodat een sessie die alleen de tekst bijwerkt, altijd een pdf kan maken, ook als een beeld niet meer lukt.
//
//   npm run samenvatting                maakt de pdf uit de tekst en de beelden die er zijn
//   npm run samenvatting -- --beelden   speelt eerst het spel en maakt de vier beelden opnieuw (een minuut of twee)
//
// De pdf drukt Chromium af van de bladzijde zoals de server van het spel hem geeft (dan laden js/naam.js en de letters
// zonder omweg); draait de server niet, dan start dit hem, en stopt hem na afloop. De beelden komen uit het spel zoals
// het draait, elk uit een vers spel: land 5 van de maker op 6 hooimaand, met de videokaart (WebGL op de processor, zoals
// npm run schermen -- --tekenen met), zonder spellus en met een vaste reeks toeval, zodat hetzelfde spel hetzelfde beeld
// geeft. Lukt een beeld niet meer omdat het spel veranderde (er komt geen gesprek, de heer komt niet), dan zegt het waar
// het vastliep, en blijft het oude beeld staan.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execSync, spawn } = require('node:child_process');

const WORTEL = path.join(__dirname, '..', '..');
const BEELDEN = path.join(__dirname, 'beelden');
const PDF = path.join(WORTEL, 'ontwerp', 'het-spel-in-het-kort.pdf');
const URL = 'http://localhost:8123/';
const VENSTER = { width: 1600, height: 900 };
// Wat alleen hulp is (de toetsen rechts, 'Opgeslagen'), en wat er voor een beeld zonder ui ook af gaat.
const HULP = ['hulp-gehucht', 'opgeslagen'];
const UI = ['hud-gehucht', 'plek', 'volgorde', 'onder', 'berichten', 'opdracht'];

// Playwright zoals de speeltest het vindt (gereedschap/speeltest/speeltest.cjs): hier, of algemeen geïnstalleerd.
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

const stap = (page, s) => page.evaluate((s) => Spel.debug.stap(s), s);

// Een vers spel in een eigen context (zonder wat een vorig spel in de opslag zette), klaar voor een beeld: land 5 van
// de maker, op 6 hooimaand om negen uur, het graan rijp. Op dubbele maat, zodat een uitsnede scherp blijft.
async function nieuwSpel(browser) {
  const context = await browser.newContext({ viewport: VENSTER, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.fouten = [];
  page.on('pageerror', (e) => page.fouten.push(e.message));
  await page.addInitScript(() => {
    let n = 11;
    Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
    window.requestAnimationFrame = () => 0; // de spellus loopt niet: alleen Spel.debug.stap laat het spel verder gaan
  });
  await page.goto(URL);
  await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug && Spel.sprites, null, { polling: 100 });
  await page.waitForFunction(() => Spel.sprites.aan && Spel.sprites.buitenAan, null, { polling: 100, timeout: 60000 });
  await page.addScriptTag({ path: path.join(WORTEL, 'gereedschap', 'grootte', 'pagina.js') });
  await page.evaluate(() => { Spel.zetOptie('tekenen', 'met'); Spel.TEKENEN_INSTELLINGEN.ookOpDeProcessor = true; });
  await page.click('#menu [data-actie="nieuw"]');
  if (await page.$('#menu [data-actie="ja"]')) await page.click('#menu [data-actie="ja"]');
  await page.click('#menu [data-actie="begin"]');
  await page.keyboard.press('Escape');
  await page.evaluate(() => Spel.debug.gehucht(5));
  await stap(page, 0.5);
  await page.evaluate(() => Spel.debug.kalender(125 + 9 / 24)); // dag 125 na 1 lentemaand: 6 hooimaand
  await stap(page, 0.2);
  await sluitBrief(page);
  await verberg(page, HULP);
  return page;
}

const sluitBrief = async (page) => {
  if (await page.evaluate(() => Spel.ui.briefOpen())) await page.evaluate(() => Spel.ui.sluitBrief(Spel.S));
};

const verberg = (page, ids) => page.evaluate((ids) => {
  for (const id of ids) { const el = document.getElementById(id); if (el) el.style.visibility = 'hidden'; }
}, ids);

// Het uur, de zoom en waar de camera kijkt, met de mensen op hun plek voor dat uur (Meet, gereedschap/grootte/pagina.js).
const zet = (page, { uur, zoom, op }) => page.evaluate(([uur, zoom, op]) => {
  const s = Spel.S;
  Meet.zetPlekken(uur);
  if (s.grond) s.grond.sleutel = '';
  s.zoom = zoom;
  if (op) Meet.cameraOp(op[0], op[1]);
  Spel.ui.toonKalender(s);
}, [uur, zoom, op]);

// Het midden van het plein.
const plein = (page) => page.evaluate(() => {
  const tegels = Spel.pleinTegels(Spel.S.wereld);
  let x = 0;
  let y = 0;
  for (const t of tegels) { x += t.x; y += t.y; }
  return [x / tegels.length, y / tegels.length];
});

// Tekenen tot alle plaatjes er zijn: wat een beeld vraagt, kan pas dan beginnen te laden (zoals npm run schermen).
async function wachtOpPlaatjes(page) {
  for (let i = 0; i < 200; i++) {
    await stap(page, 0);
    if (await page.evaluate(() => Spel.sprites.bezig() === 0)) return;
    await page.waitForTimeout(50);
  }
}

// Laat het spel lopen tot iemand de schout aanspreekt (js/voorvallen.js, T.ui.spreekAan).
async function wachtOpGesprek(page, wat) {
  for (let i = 0; i < 180; i++) {
    if ((await page.evaluate(() => Spel.S.modus)) === 'dialoog') return;
    await stap(page, 1);
  }
  throw new Error(`er kwam geen gesprek (${wat})`);
}

// De vier beelden: wat elk in het spel doet, en welk stuk van het scherm erin komt. Een uitsnede (clip, in css-pixels)
// staat in de pdf klein en blijft op dubbele maat; een heel scherm komt op de maat van het venster (scale 'css').
const BEELD = {
  // Het gehucht van boven, met de balk.
  async dorp(page) {
    await zet(page, { uur: 10.5, zoom: 0.5, op: await plein(page) });
    await wachtOpPlaatjes(page);
    return { scale: 'css' };
  },
  // Een boer die wil ontginnen: de heide (het vertrouwen van het dorp), het bos gemeld (de gunst van de heer), of
  // stiekem (js/ontginnen.js). Wie de schout al zocht, krijgt eerst ja.
  async vraag(page) {
    await zet(page, { uur: 10.5, zoom: 1 });
    if (await page.evaluate(() => !!(Spel.S.dorp.voorvallen && Spel.S.dorp.voorvallen.lopend))) {
      await wachtOpGesprek(page, 'het voorval dat al liep');
      await page.keyboard.press('1');
      await stap(page, 0.5);
    }
    const ontgin = await page.evaluate(() => Spel.debug.ontginnen('nu'));
    if (typeof ontgin === 'string') throw new Error(`geen boer die wil ontginnen: ${ontgin}`);
    await wachtOpGesprek(page, 'de boer die wil ontginnen');
    await page.evaluate(() => { Spel.S.zoom = 0.75; });
    await stap(page, 1.5); // de camera komt tot stilstand
    await wachtOpPlaatjes(page);
    return { clip: { x: 450, y: 320, width: 700, height: 580 } };
  },
  // De heer met zijn twee soldaten (js/heer.js, T.werkHeerBij), op de weg het dorp in, zo'n 22 tegels van het plein.
  async heer(page) {
    await verberg(page, UI);
    await zet(page, { uur: 10, zoom: 5 / 3 });
    const midden = await plein(page);
    await page.evaluate(() => Spel.debug.heer());
    for (let i = 0; i < 400; i++) {
      await stap(page, 0.25);
      // Wie de tijd stilzet, laat de heer ook stilstaan: een gesprek (ja) of een brief.
      if ((await page.evaluate(() => Spel.S.modus)) === 'dialoog') await page.keyboard.press('1');
      await sluitBrief(page);
      const h = await page.evaluate(() => {
        const b = Spel.S.dorp.heer && Spel.S.dorp.heer.bezoek;
        return b && b.wezens ? { x: b.wezens[0].x, y: b.wezens[0].y } : null;
      });
      if (!h || Math.round(Math.hypot(h.x - midden[0], h.y - midden[1])) > 22) continue;
      await page.evaluate(([x, y]) => Meet.cameraOp(x, y), [h.x, h.y]);
      await wachtOpPlaatjes(page);
      await page.evaluate(([x, y]) => Meet.cameraOp(x, y), [h.x, h.y]);
      await stap(page, 0);
      return { clip: { x: 530, y: 280, width: 670, height: 335 } };
    }
    throw new Error('de heer kwam niet tot op 22 tegels van het plein');
  },
  // Een zomeravond op het plein, als de lantaarns en de ramen branden, zonder ui.
  async avond(page) {
    await verberg(page, UI);
    const zon = await page.evaluate(() => Spel.zonVan(Spel.S.kalender.dag));
    await zet(page, { uur: zon.onder + 1.1, zoom: 1, op: await plein(page) });
    await wachtOpPlaatjes(page);
    return { scale: 'css', clip: { x: 0, y: 50, width: 1600, height: 600 } };
  },
};

async function maakBeelden(browser) {
  fs.mkdirSync(BEELDEN, { recursive: true });
  let mis = 0;
  for (const [naam, maak] of Object.entries(BEELD)) {
    const page = await nieuwSpel(browser);
    try {
      const uitsnede = await maak(page);
      await page.screenshot({ path: path.join(BEELDEN, `${naam}.jpg`), type: 'jpeg', quality: 90, ...uitsnede });
      console.log(`  ${naam}.jpg`);
    } catch (e) {
      mis++;
      console.log(`  ${naam}.jpg lukte niet: ${e.message}; het oude beeld blijft staan`);
    } finally {
      if (page.fouten.length) console.log(`    fouten in de bladzijde:\n      ${page.fouten.join('\n      ')}`);
      await page.context().close();
    }
  }
  return mis;
}

async function maakPdf(browser) {
  const page = await browser.newPage();
  await page.goto(URL + 'gereedschap/samenvatting/samenvatting.html');
  await page.evaluate(async () => { await document.fonts.ready; });
  const geladen = await page.evaluate(() => [...document.fonts].filter((f) => f.status !== 'loaded').map((f) => f.family));
  if (geladen.length) console.log(`  let op: deze letters laadden niet: ${geladen.join(', ')}`);
  await page.pdf({ path: PDF, preferCSSPageSize: true, printBackground: true });
  await page.close();
  const bladzijden = (fs.readFileSync(PDF, 'latin1').match(/\/Type\s*\/Page\b(?!s)/g) || []).length;
  console.log(`${path.relative(WORTEL, PDF)}: ${bladzijden} bladzijden, ${Math.round(fs.statSync(PDF).size / 1024)} KB`);
}

(async () => {
  const metBeelden = process.argv.includes('--beelden');
  const server = await zorgVoorServer();
  const { chromium } = laadPlaywright();
  const browser = await chromium.launch();
  let mis = 0;
  try {
    if (metBeelden) {
      const commit = execSync('git rev-parse --short HEAD', { cwd: WORTEL, encoding: 'utf8' }).trim();
      console.log(`De beelden, uit het spel op ${commit}, in ${path.relative(WORTEL, BEELDEN)}/:`);
      mis = await maakBeelden(browser);
    }
    await maakPdf(browser);
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  if (mis) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
