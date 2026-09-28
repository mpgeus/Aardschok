// De speeltest (werklijst, vraag 45; Marcel, 28 sep: "A ja B ja C ja D ja"). Het spel speelt een jaar
// zoals het draait, in een onzichtbare browser, en een speler in code doet wat een speler doet: lopen,
// verstoppen, met de inner praten, de soldaten leiden, en de vensters beantwoorden. Elk jaar krijgt een
// vast zaad: hetzelfde zaad geeft dezelfde boeren en hetzelfde lot. Zo speel je na het bijstellen van een
// getal hetzelfde jaar opnieuw, en zie je precies wat de wijziging deed.
//
//   npm run speeltest                          de vier spelers, elk met zaad 1, 2 en 3
//   npm run speeltest -- slim                  één speler, met zaad 1, 2 en 3
//   npm run speeltest -- slim --zaad 7         één jaar
//   npm run speeltest -- --zaden 1-5           andere zaden
//
// De spelers staan in speler.js (die draait in de bladzijde, naast het spel). Wat er per jaar gebeurde,
// komt in gereedschap/speeltest/uit/<speler>-<zaad>.json, en een tabel in uit/samenvatting.md (niet in
// git). Het spel gebruikt de standaard spelregels: een nieuwe browser onthoudt niets.
//
// Nodig: Playwright met Chromium (in de cloud staat het klaar; thuis `npm i -g playwright` en
// `npx playwright install chromium`). Het spel zelf blijft zonder afhankelijkheden.
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'uit');
const SPELERS = ['braaf', 'lui30', 'lui60', 'slim'];
const TEGELIJK = 3; // zoveel jaren tegelijk, elk in een eigen tabblad

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

function leesOpdracht(argv) {
  const o = { spelers: [], zaden: [1, 2, 3] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--zaad') o.zaden = [Number(argv[++i])];
    else if (a === '--zaden') {
      const [van, tot] = argv[++i].split('-').map(Number);
      o.zaden = [];
      for (let z = van; z <= (tot || van); z++) o.zaden.push(z);
    } else if (SPELERS.includes(a)) o.spelers.push(a);
    else {
      console.error(`Onbekend: ${a}. Spelers: ${SPELERS.join(', ')}; en --zaad n of --zaden van-tot.`);
      process.exit(1);
    }
  }
  if (!o.spelers.length) o.spelers = SPELERS;
  return o;
}

// Een jaar: een schone browser, Math.random uit het zaad (daaruit loot het spel de boeren en zijn eigen
// zaad, js/boeren.js), het spel zoals index.html het laadt, en dan de speler erbij.
async function speelJaar(browser, speler, zaad) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') fouten.push(m.text());
  });
  await page.addInitScript((z) => {
    let s = z >>> 0; // mulberry32: klein, en elk zaad geeft een eigen reeks
    Math.random = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, zaad);
  await page.goto('file://' + path.join(WORTEL, 'index.html'));
  await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug);
  await page.addScriptTag({ path: path.join(__dirname, 'speler.js') });
  const begin = Date.now();
  let uitslag;
  try {
    uitslag = await page.evaluate((o) => Spel.speeltest.speel(o), { speler, zaad });
  } catch (e) {
    uitslag = { speler, zaad, mislukt: String((e && e.message) || e).split('\n').slice(0, 2).join(' ') };
  }
  uitslag.fouten = fouten;
  uitslag.duurSeconden = Math.round((Date.now() - begin) / 1000);
  await context.close();
  return uitslag;
}

async function main() {
  const o = leesOpdracht(process.argv.slice(2));
  const commit = execSync('git rev-parse --short HEAD', { cwd: WORTEL, encoding: 'utf8' }).trim();
  const tak = execSync('git rev-parse --abbrev-ref HEAD', { cwd: WORTEL, encoding: 'utf8' }).trim();
  const vies = execSync('git status --porcelain -- js index.html kaarten beelden', { cwd: WORTEL, encoding: 'utf8' }).trim();
  const stand = `${tak} op ${commit}${vies ? ' (met wijzigingen die nog niet gecommit zijn)' : ''}`;
  console.log(`De speeltest speelt op ${stand}.`);
  fs.mkdirSync(UIT, { recursive: true });
  const { chromium } = laadPlaywright();
  const browser = await chromium.launch();
  const rij = [];
  for (const speler of o.spelers) for (const zaad of o.zaden) rij.push({ speler, zaad });
  const uitslagen = [];
  let volgende = 0;
  async function werker() {
    while (volgende < rij.length) {
      const { speler, zaad } = rij[volgende++];
      const u = await speelJaar(browser, speler, zaad);
      u.stand = stand;
      uitslagen.push(u);
      fs.writeFileSync(path.join(UIT, `${speler}-${zaad}.json`), JSON.stringify(u, null, 1));
      const kort = u.mislukt ? `MISLUKT: ${u.mislukt}` : `${u.eind ? u.eind.tekst : ''}`;
      console.log(`${speler}, zaad ${zaad}: ${u.duurSeconden} s, ${u.fouten.length} fouten. ${kort}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(TEGELIJK, rij.length) }, werker));
  await browser.close();
  const tabel = require('./samenvatting.cjs').maak(uitslagen, stand);
  fs.writeFileSync(path.join(UIT, 'samenvatting.md'), tabel);
  console.log('\n' + tabel);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
