// De speeltest (werklijst, vraag 45; Marcel, 28 sep: "A ja B ja C ja D ja"). Het spel speelt een jaar
// zoals het draait, in een onzichtbare browser, en een speler in code doet wat een speler doet: lopen,
// verstoppen, met de inner praten, de soldaten leiden, en de vensters beantwoorden. Elk jaar krijgt een
// vast zaad: hetzelfde zaad geeft dezelfde boeren en hetzelfde lot. Zo speel je na het bijstellen van een
// getal hetzelfde jaar opnieuw, en zie je precies wat de wijziging deed.
//
//   npm run speeltest                          de vijf spelers, elk met zaad 1, 2 en 3
//   npm run speeltest -- slim                  één speler, met zaad 1, 2 en 3
//   npm run speeltest -- bouwer                de bouwer, die twee jaar speelt (vraag 58): van gehucht tot dorp
//   npm run speeltest -- slim --zaad 7         één jaar
//   npm run speeltest -- --zaden 1-5           andere zaden
//   npm run speeltest -- lui60 --zaad 1 --opslaan        de proef met opslaan (vraag 48): op 1 oogstmaand
//                                                        opslaan, herladen, Verder, en dan precies hetzelfde
//                                                        jaar als zonder opslaan (--opslaan 245: een andere dag)
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
const SPELERS = ['braaf', 'lui30', 'lui60', 'slim', 'bouwer'];
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

const OOGSTMAAND = 150; // 1 oogstmaand, de dag waarop de proef met opslaan opslaat (vraag 48)

function leesOpdracht(argv) {
  const o = { spelers: [], zaden: [1, 2, 3], opslaan: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--opslaan') o.opslaan = /^\d+$/.test(argv[i + 1] || '') ? Number(argv[++i]) : OOGSTMAAND;
    else if (a === '--zaad') o.zaden = [Number(argv[++i])];
    else if (a === '--zaden') {
      const [van, tot] = argv[++i].split('-').map(Number);
      o.zaden = [];
      for (let z = van; z <= (tot || van); z++) o.zaden.push(z);
    } else if (SPELERS.includes(a)) o.spelers.push(a);
    else {
      console.error(`Onbekend: ${a}. Spelers: ${SPELERS.join(', ')}; en --zaad n, --zaden van-tot of --opslaan [dag].`);
      process.exit(1);
    }
  }
  if (!o.spelers.length) o.spelers = SPELERS;
  return o;
}

// Een jaar: een schone browser, Math.random uit het zaad (daaruit loot het spel de boeren en zijn eigen
// zaad, js/boeren.js), het spel zoals index.html het laadt, en dan de speler erbij. Met `opslaan` (de proef
// met opslaan): { dag, bewaar }, zie speler.js; slaat de speler op, dan herlaadt dit de bladzijde, en gaat
// hij verder met Verder op het titelscherm.
async function speelJaar(browser, speler, zaad, opslaan = null) {
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
  const laad = async () => {
    await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug);
    await page.addScriptTag({ path: path.join(__dirname, 'speler.js') });
  };
  await page.goto('file://' + path.join(WORTEL, 'index.html'));
  await laad();
  const begin = Date.now();
  let uitslag;
  try {
    uitslag = await page.evaluate((o) => Spel.speeltest.speel(o), { speler, zaad, opslaan });
    if (uitslag.opgeslagen) {
      const opgeslagen = uitslag.opgeslagen;
      await page.reload();
      await laad();
      uitslag = await page.evaluate((o) => Spel.speeltest.speel(o), { speler, zaad, verder: { eenKeer: opgeslagen.eenKeer } });
      uitslag.opgeslagen = opgeslagen;
    }
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
  // Op welke stand: de laatste commit die het spel zelf veranderde (js/, index.html, de kaarten en de
  // beelden), want een commit in ontwerp/ of hier verandert niets aan hoe het speelt.
  const git = (opdracht) => execSync(`git ${opdracht}`, { cwd: WORTEL, encoding: 'utf8' }).trim();
  const SPEL = '-- js index.html kaarten beelden';
  const vies = git(`status --porcelain ${SPEL}`);
  const stand = `het spel van ${git(`log -1 --format=%h ${SPEL}`)} (${git('rev-parse --abbrev-ref HEAD')} op ${git('rev-parse --short HEAD')})` +
    (vies ? ', met wijzigingen in het spel die nog niet gecommit zijn' : '');
  console.log(`De speeltest speelt op ${stand}.`);
  fs.mkdirSync(UIT, { recursive: true });
  const { chromium } = laadPlaywright();
  const browser = await chromium.launch();
  if (o.opslaan != null) {
    await proefMetOpslaan(browser, o);
    await browser.close();
    return;
  }
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

// Waar twee bewaarde spellen verschillen: het pad en de twee waarden, hoogstens twintig.
function verschillen(a, b, pad = '', uit = []) {
  if (uit.length >= 20) return uit;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) verschillen(a[k], b[k], `${pad}.${k}`, uit);
  } else if (JSON.stringify(a) !== JSON.stringify(b)) {
    uit.push(`${pad}: ${JSON.stringify(a)} tegen ${JSON.stringify(b)}`.slice(0, 300));
  }
  return uit;
}

// De proef met opslaan (vraag 48): per speler en zaad twee jaren naast elkaar. Het ene slaat op de dag op,
// herlaadt de bladzijde en gaat verder met Verder op het titelscherm; het andere speelt door. Vanaf dat
// moment hebben ze hetzelfde lot (speler.js), dus moet het spel aan het eind letter voor letter gelijk zijn.
async function proefMetOpslaan(browser, o) {
  const regels = [];
  for (const speler of o.spelers) {
    for (const zaad of o.zaden) {
      const [gewoon, bewaard] = await Promise.all([
        speelJaar(browser, speler, zaad, { dag: o.opslaan, bewaar: false }),
        speelJaar(browser, speler, zaad, { dag: o.opslaan, bewaar: true }),
      ]);
      const wie = `${speler}, zaad ${zaad}`;
      let regel;
      if (gewoon.mislukt || bewaard.mislukt) regel = `${wie}: MISLUKT: ${gewoon.mislukt || bewaard.mislukt}`;
      else if (!bewaard.opgeslagen) regel = `${wie}: MISLUKT: de speler heeft niet opgeslagen`;
      else {
        const a = gewoon.eindStaat;
        const b = bewaard.eindStaat;
        const op = `opgeslagen op ${bewaard.opgeslagen.datum} ("${bewaard.opgeslagen.melding}"), herladen, verder met Verder`;
        if (a === b) regel = `${wie}: ${op}: precies hetzelfde jaar (${Math.round(a.length / 1024)} kB, gelijk tot de laatste letter)`;
        else {
          // Beide eindstanden bewaren, en elke plek noemen waar ze verschillen (de eerste twintig).
          fs.writeFileSync(path.join(UIT, `opslaan-${speler}-${zaad}-zonder.json`), a);
          fs.writeFileSync(path.join(UIT, `opslaan-${speler}-${zaad}-met.json`), b);
          const plekken = verschillen(JSON.parse(a), JSON.parse(b));
          regel = `${wie}: ${op}: VERSCHIL op ${plekken.length === 20 ? '20 of meer' : plekken.length} plekken\n` +
            plekken.map((v) => `  ${v}`).join('\n');
        }
      }
      const fouten = [...(gewoon.fouten || []), ...(bewaard.fouten || [])];
      if (fouten.length) regel += `\n  fouten in de console: ${fouten.slice(0, 3).join(' / ')}`;
      console.log(regel);
      regels.push(regel);
    }
  }
  fs.writeFileSync(path.join(UIT, 'opslaan.md'), `# De proef met opslaan\n\n${regels.map((r) => `- ${r}`).join('\n')}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
