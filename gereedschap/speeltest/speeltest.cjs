// De speeltest (werklijst, vraag 45; Marcel, 28 sep: "A ja B ja C ja D ja"). Het spel speelt een jaar
// zoals het draait, in een onzichtbare browser, en een speler in code doet wat een speler doet: lopen,
// verstoppen, met de inner praten, de soldaten leiden, en de vensters beantwoorden. Elk jaar krijgt een
// vast zaad: hetzelfde zaad geeft dezelfde boeren en hetzelfde lot. Zo speel je na het bijstellen van een
// getal hetzelfde jaar opnieuw, en zie je precies wat de wijziging deed.
//
//   npm run speeltest                          de zes spelers, elk met zaad 1, 2 en 3
//   npm run speeltest -- slim                  één speler, met zaad 1, 2 en 3
//   npm run speeltest -- bouwer                de bouwer, die twee jaar speelt (vraag 58): van gehucht tot dorp
//   npm run speeltest -- sluw                  de sluwe bouwer (vraag 94): de bouwer, maar hij bedriegt de heer en
//                                              houdt het graan verstopt voor de herberg en de molen
//   npm run speeltest -- bouwer sluw --jaren 4 de bouwers spelen vier jaar in plaats van twee: naar de winst (vraag 102, e)
//   npm run speeltest -- --tegelijk 4          zoveel spellen tegelijk, elk in een eigen tabblad (standaard 3)
//   npm run speeltest -- slim --zaad 7         één jaar
//   npm run speeltest -- --zaden 1-5           andere zaden
//   npm run speeltest -- lui60 --zaad 1 --opslaan        de proef met opslaan (vraag 48): op 1 oogstmaand
//                                                        opslaan, herladen, Verder, en dan precies hetzelfde
//                                                        jaar als zonder opslaan (--opslaan 245: een andere dag)
//   npm run speeltest -- bouwer --maker        op een gehucht van de maker (vraag 70, C): de spelregel "Je
//                                              gehucht" op "Elk spel een ander", elk zaad een ander gehucht
//   npm run speeltest -- bouwer --eiland       op het eiland (vraag 117): elk zaad een ander eiland, met je gehucht
//                                              erop, zoals een nieuw spel sinds 8 okt begint
//   npm run speeltest -- bouwer sluw --maker --samenvatting
//                                              niet spelen, maar de samenvatting opnieuw maken uit wat er al in uit/
//                                              ligt: zo geeft een speeltest die over meer taken verdeeld is, één tabel
//   npm run speeltest -- --regel seizoen=jij   met een spelregel anders dan de standaard (T.OPTIES in js/opties.js),
//   npm run speeltest -- --getal VOORVALLEN_INSTELLINGEN.metOorzaak=1
//                                              of met een getal uit de werkbank; allebei zo vaak als je wilt, zoals
//                                              de browser ze onthoudt als een speler ze kiest
//   npm run speeltest -- bouwer --naam voor    bewaart deze speeltest in uit/voor/, met de stand en alle waarden van de
//                                              bladzijde met getallen (vraag 142, stap 3); verander dan getallen, en
//   npm run speeltest -- bouwer --naam na --tegen voor
//                                              zet hem naast de vorige: welke waarden anders waren, en per spel wat er
//                                              anders afliep (uit/na/vergelijking.md; vergelijk.cjs). Met --samenvatting
//                                              maakt het de vergelijking opnieuw zonder te spelen
//
// De spelers staan in speler.js (die draait in de bladzijde, naast het spel). Wat er per jaar gebeurde,
// komt in gereedschap/speeltest/uit/<speler>-<zaad>.json, en een tabel in uit/samenvatting.md (niet in
// git; met --maker <speler>-<zaad>-maker.json en samenvatting-maker.md, met --eiland -eiland, en met --regel of --getal
// -regels achter de naam; met --naam in uit/<naam>/). Het spel gebruikt de standaard spelregels, behalve met --maker, --eiland, --regel en --getal:
// een nieuwe browser onthoudt niets.
//
// Nodig: Playwright met Chromium (in de cloud staat het klaar; thuis `npm i -g playwright` en
// `npx playwright install chromium`). Het spel zelf blijft zonder afhankelijkheden.
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const V = require('./vergelijk.cjs');

const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'uit');
const SPELERS = ['braaf', 'lui30', 'lui60', 'slim', 'bouwer', 'sluw'];
const TEGELIJK = 3; // zoveel spellen tegelijk, elk in een eigen tabblad (--tegelijk)

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
  const o = { spelers: [], zaden: [1, 2, 3], opslaan: null, maker: false, eiland: false, regels: {}, getallen: {}, jaren: null, tegelijk: TEGELIJK };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--opslaan') o.opslaan = /^\d+$/.test(argv[i + 1] || '') ? Number(argv[++i]) : OOGSTMAAND;
    else if (a === '--maker') o.maker = true;
    else if (a === '--eiland') o.eiland = true;
    else if (a === '--samenvatting') o.samenvatting = true;
    else if (a === '--naam' || a === '--tegen') {
      const naam = argv[++i] || '';
      if (!V.GOEDE_NAAM.test(naam)) {
        console.error(`${a} wil een naam van letters, cijfers en streepjes, zoals ${a} voor.`);
        process.exit(1);
      }
      o[a.slice(2)] = naam;
    }
    else if (a === '--regel' || a === '--getal') {
      const [naam, waarde] = String(argv[++i] || '').split('=');
      if (!naam || waarde == null || waarde === '') {
        console.error(`${a} wil naam=waarde, zoals --regel seizoen=jij of --getal VOORVALLEN_INSTELLINGEN.metOorzaak=1.`);
        process.exit(1);
      }
      if (a === '--regel') o.regels[naam] = waarde;
      else o.getallen[naam] = Number(waarde);
    }
    else if (a === '--jaren') o.jaren = Number(argv[++i]);
    else if (a === '--tegelijk') o.tegelijk = Number(argv[++i]);
    else if (a === '--zaad') o.zaden = [Number(argv[++i])];
    else if (a === '--zaden') {
      const [van, tot] = argv[++i].split('-').map(Number);
      o.zaden = [];
      for (let z = van; z <= (tot || van); z++) o.zaden.push(z);
    } else if (SPELERS.includes(a)) o.spelers.push(a);
    else {
      console.error(`Onbekend: ${a}. Spelers: ${SPELERS.join(', ')}; en --zaad n, --zaden van-tot, --jaren n, --tegelijk n, --opslaan [dag], --maker, --eiland, --samenvatting, --regel naam=keuze, --getal pad=waarde, --naam naam of --tegen naam.`);
      process.exit(1);
    }
  }
  if (!o.spelers.length) o.spelers = SPELERS;
  if (o.tegen && !o.naam) {
    console.error('--tegen vergelijkt met een speeltest met een naam, dus deze krijgt er ook een: --naam na --tegen voor.');
    process.exit(1);
  }
  if (o.tegen && o.tegen === o.naam) {
    console.error('--naam en --tegen zijn dezelfde; kies een nieuwe naam voor deze speeltest.');
    process.exit(1);
  }
  // De spelregels zoals de browser ze onthoudt (js/opties.js, onder aardschok.spelregels). Het gehucht altijd: zonder
  // --maker of --eiland het ontworpen gehucht, ook nu een nieuw spel het eiland maakt (vraag 117), zodat een speeltest te
  // vergelijken blijft met de speeltests ervoor; met --maker de landen van de maker zonder het eiland. `proef`: het spel
  // neemt "Je gehucht" alleen uit de browser als een proef hem zette (T.laadOpties).
  const keuzes = { gehucht: o.eiland ? 'eiland' : o.maker ? 'maker' : 'ontworpen', ...o.regels };
  o.spelregels = { keuzes, namen: {}, getallen: o.getallen, proef: true };
  o.anders = [...Object.entries(o.regels), ...Object.entries(o.getallen)].map(([k, v]) => `${k}=${v}`);
  return o;
}

// Een jaar: een schone browser, Math.random uit het zaad (daaruit loot het spel de boeren en zijn eigen
// zaad, js/boeren.js), het spel zoals index.html het laadt, en dan de speler erbij. Met `opslaan` (de proef
// met opslaan): { dag, bewaar }, zie speler.js; slaat de speler op, dan herlaadt dit de bladzijde, en gaat
// hij verder met Verder op het titelscherm. Met `maker` staat de spelregel "Je gehucht" op "Elk spel een
// ander" (js/opties.js), zoals de browser het onthoudt als een speler hem kiest: dan legt de maker het gehucht
// uit het zaad van het spel (js/maker.js); zonder `maker` op "Het ontworpen gehucht". `spelregels`: wat de browser
// onthoudt (leesOpdracht).
async function speelJaar(browser, speler, zaad, opslaan = null, spelregels = null, jaren = null) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') fouten.push(m.text());
  });
  await page.addInitScript(({ z, spelregels }) => {
    let s = z >>> 0; // mulberry32: klein, en elk zaad geeft een eigen reeks
    Math.random = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    if (spelregels) localStorage.setItem('aardschok.spelregels', JSON.stringify(spelregels));
  }, { z: zaad, spelregels });
  const laad = async () => {
    await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug);
    await page.addScriptTag({ path: path.join(__dirname, 'speler.js') });
  };
  await page.goto('file://' + path.join(WORTEL, 'index.html'));
  await laad();
  const begin = Date.now();
  let uitslag;
  try {
    uitslag = await page.evaluate((o) => Spel.speeltest.speel(o), { speler, zaad, opslaan, jaren });
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
  const op = stand + (o.eiland ? ', op het eiland' : o.maker ? ', op gehuchten van de maker' : '') + (o.anders.length ? `, met ${o.anders.join(', ')}` : '');
  const achter = (o.eiland ? '-eiland' : o.maker ? '-maker' : '') + (o.anders.length ? '-regels' : '');
  // Met een naam komt alles in uit/<naam>/, met set.json (wat er gespeeld werd, op welke stand) en waarden.json (alle
  // waarden van de bladzijde met getallen zoals ze bij het begin in de code stonden; vergelijk.cjs). Zo staat de vorige
  // ernaast.
  const map = o.naam ? path.join(UIT, o.naam) : UIT;
  const setBestand = path.join(map, 'set.json');
  const vergelijkMet = () => {
    if (!o.tegen) return;
    const tegen = V.leesSpeeltest(o.tegen, UIT);
    if (!tegen) {
      console.log(`\nNiet te vergelijken: er is geen speeltest ${o.tegen} in ${path.relative(WORTEL, UIT)}.`);
      return;
    }
    const v = V.vergelijk(tegen, V.leesSpeeltest(o.naam, UIT));
    fs.writeFileSync(path.join(map, 'vergelijking.json'), JSON.stringify(v, null, 1));
    const tekst = V.alsTekst(v);
    fs.writeFileSync(path.join(map, 'vergelijking.md'), tekst);
    console.log('\n' + tekst);
  };
  // Niet spelen, maar de samenvatting opnieuw maken uit wat er al in uit/ ligt, voor deze spelers en zaden (met dezelfde
  // --maker, --regel en --getal). Een taak op de achtergrond stopt na twee uur, dus een speeltest van vier jaar gaat in
  // meer taken (werklijst, vraag 107, stap 3); zo geven ze samen één tabel.
  if (o.samenvatting) {
    const uitslagen = [];
    for (const speler of o.spelers) for (const zaad of o.zaden) {
      const bestand = path.join(map, `${speler}-${zaad}${achter}.json`);
      if (fs.existsSync(bestand)) uitslagen.push(JSON.parse(fs.readFileSync(bestand, 'utf8')));
      else console.log(`Niet gevonden: ${path.relative(WORTEL, bestand)}`);
    }
    const standen = [...new Set(uitslagen.map((u) => u.stand).filter(Boolean))];
    const tabel = require('./samenvatting.cjs').maak(uitslagen, standen.join('; ') || op);
    fs.writeFileSync(path.join(map, `samenvatting${achter}.md`), tabel);
    console.log('\n' + tabel);
    vergelijkMet();
    return;
  }
  console.log(`De speeltest speelt op ${op}.`);
  fs.mkdirSync(map, { recursive: true });
  const set = o.naam ? {
    naam: o.naam, wanneer: new Date().toISOString(), stand: op, klaar: false,
    opdracht: { spelers: o.spelers, zaden: o.zaden, jaren: o.jaren, land: o.eiland ? 'eiland' : o.maker ? 'maker' : 'ontworpen', regels: o.regels, getallen: o.getallen },
  } : null;
  if (set) {
    // Een vorige speeltest met dezelfde naam gaat weg, zodat er geen spel van de vorige keer tussen blijft liggen.
    for (const f of fs.readdirSync(map)) if (f.endsWith('.json') || f.endsWith('.md')) fs.unlinkSync(path.join(map, f));
    fs.writeFileSync(path.join(map, 'waarden.json'), JSON.stringify(V.waardenVan(V.leesBronnen(WORTEL))));
    fs.writeFileSync(setBestand, JSON.stringify(set, null, 1));
  }
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
      const u = await speelJaar(browser, speler, zaad, null, o.spelregels, o.jaren);
      u.stand = op;
      uitslagen.push(u);
      fs.writeFileSync(path.join(map, `${speler}-${zaad}${achter}.json`), JSON.stringify(u, null, 1));
      const kort = u.mislukt ? `MISLUKT: ${u.mislukt}` : `${u.eind ? u.eind.tekst : ''}`;
      console.log(`${speler}, zaad ${zaad}: ${u.duurSeconden} s, ${u.fouten.length} fouten. ${kort}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(o.tegelijk, rij.length) }, werker));
  await browser.close();
  const tabel = require('./samenvatting.cjs').maak(uitslagen, op);
  fs.writeFileSync(path.join(map, `samenvatting${achter}.md`), tabel);
  console.log('\n' + tabel);
  if (set) fs.writeFileSync(setBestand, JSON.stringify({ ...set, klaar: true }, null, 1));
  vergelijkMet();
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
        speelJaar(browser, speler, zaad, { dag: o.opslaan, bewaar: false }, o.spelregels),
        speelJaar(browser, speler, zaad, { dag: o.opslaan, bewaar: true }, o.spelregels),
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
