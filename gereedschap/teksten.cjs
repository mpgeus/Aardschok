// De zinnen van het spel uit de code lezen (vraag 147): npm run teksten.
//
// Elke zin die de speler ziet, staat in de code als T.t('Engelse zin', ...) (js/taal.js). Dit leest ze uit alle
// bestanden in js/, zonder het spel te draaien, en schrijft ze naar taal/bron.js, met in welk bestand ze staan: dat
// is de lijst waar de vertaaltool (gereedschap/vertalen.html) mee werkt, ook bij iemand zonder onze server. Daarna
// zegt het per taal in taal/ hoeveel zinnen er ontbreken, welke over zijn (een zin die in de code veranderde of
// wegging), en waar een vertaling niet past.
//
//   npm run teksten          taal/bron.js opnieuw, en het verslag
//
// test/taal.test.cjs gebruikt hetzelfde (module.exports): of taal/bron.js bij is, of elke T.t een gewone tekst
// meekrijgt, en of er in een omgezet bestand geen tekst meer buiten T.t staat (losseTeksten).
const fs = require('node:fs');
const path = require('node:path');

const WORTEL = path.join(__dirname, '..');
const BRON = path.join(WORTEL, 'taal', 'bron.js');

// ── De code lezen ──
//
// Een kleine lezer die weet wat tekst is en wat code: tekst tussen '' en "", sjablonen tussen `` (met wat in ${}
// staat als code), commentaar en reguliere expressies. Hij geeft de code terug met alles wat geen code is
// uitgewist (dezelfde lengte, de regels heel), en de teksten met hun plek.
const NA_DEZE_EEN_REGEX = new Set('(,=:[!&|?{};+-*%<>~^'.split(''));
const WOORDEN_VOOR_REGEX = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do', 'yield', 'await']);

function lees(src) {
  const code = src.split('');
  const teksten = []; // { soort: 'tekst' | 'sjabloon', waarde, begin, eind }
  const wis = (van, tot) => {
    for (let k = van; k < tot; k++) if (code[k] !== '\n') code[k] = ' ';
  };

  // Of een / hier een reguliere expressie begint: naar het laatste teken van code ervoor kijken.
  function regexMag(i) {
    let j = i - 1;
    while (j >= 0 && /\s/.test(code[j])) j--;
    if (j < 0) return true;
    if (NA_DEZE_EEN_REGEX.has(code[j])) return true;
    let k = j;
    while (k >= 0 && /[A-Za-z_$]/.test(code[k])) k--;
    return WOORDEN_VOOR_REGEX.has(src.slice(k + 1, j + 1));
  }

  // Leest code vanaf i tot het einde, of tot de } die een ${ sluit (dan geeft het de plek erna).
  function leesCode(i, inGat) {
    let diep = 0;
    while (i < src.length) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/') {
        const eind = src.indexOf('\n', i);
        const tot = eind < 0 ? src.length : eind;
        wis(i, tot);
        i = tot;
      } else if (c === '/' && src[i + 1] === '*') {
        const eind = src.indexOf('*/', i + 2);
        const tot = eind < 0 ? src.length : eind + 2;
        wis(i, tot);
        i = tot;
      } else if (c === "'" || c === '"') {
        i = leesTekst(i, c);
      } else if (c === '`') {
        i = leesSjabloon(i);
      } else if (c === '/' && regexMag(i)) {
        let j = i + 1;
        let klasse = false;
        while (j < src.length && src[j] !== '\n') {
          if (src[j] === '\\') j += 2;
          else if (src[j] === '[') (klasse = true), j++;
          else if (src[j] === ']') (klasse = false), j++;
          else if (src[j] === '/' && !klasse) break;
          else j++;
        }
        wis(i + 1, j);
        i = j + 1;
      } else if (c === '{') {
        diep++;
        i++;
      } else if (c === '}') {
        if (inGat && diep === 0) return i + 1;
        diep--;
        i++;
      } else {
        i++;
      }
    }
    return i;
  }

  function leesTekst(i, quote) {
    let j = i + 1;
    while (j < src.length && src[j] !== quote && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
    const letterlijk = src.slice(i, j + 1);
    let waarde;
    try {
      waarde = new Function(`return ${letterlijk};`)();
    } catch (e) {
      waarde = letterlijk.slice(1, -1);
    }
    teksten.push({ soort: 'tekst', waarde, begin: i, eind: j + 1 });
    wis(i + 1, j);
    return j + 1;
  }

  // Een sjabloon: de vaste stukken zijn tekst (samen, met \0 waar een ${} stond), wat in ${} staat is code.
  function leesSjabloon(i) {
    const stukken = [];
    let j = i + 1;
    let stuk = j;
    while (j < src.length && src[j] !== '`') {
      if (src[j] === '\\') j += 2;
      else if (src[j] === '$' && src[j + 1] === '{') {
        stukken.push(src.slice(stuk, j));
        wis(stuk, j);
        j = leesCode(j + 2, true);
        stuk = j;
      } else j++;
    }
    stukken.push(src.slice(stuk, j));
    wis(stuk, j);
    teksten.push({ soort: 'sjabloon', waarde: stukken.join('\0'), begin: i, eind: j + 1 });
    return j + 1;
  }

  leesCode(0, false);
  return { code: code.join(''), teksten };
}

const regelVan = (src, plek) => src.slice(0, plek).split('\n').length;

// De aanroepen van T.t in een bestand: de zinnen, en waar het eerste argument geen gewone tekst is.
function zinnenIn(bestand) {
  const src = fs.readFileSync(path.join(WORTEL, bestand), 'utf8');
  const { code, teksten } = lees(src);
  const opPlek = new Map(teksten.map((t) => [t.begin, t]));
  const zinnen = [];
  const fouten = [];
  const argumenten = new Set();
  for (const m of code.matchAll(/(?<![\w$.])T\.t\(\s*/g)) {
    const plek = m.index + m[0].length;
    const t = opPlek.get(plek);
    let na = t ? t.eind : plek;
    while (na < code.length && /\s/.test(code[na])) na++;
    if (!t || t.soort !== 'tekst' || (code[na] !== ',' && code[na] !== ')')) {
      fouten.push({ bestand, regel: regelVan(src, m.index), tekst: src.slice(m.index, src.indexOf('\n', m.index)).trim() });
      continue;
    }
    zinnen.push(t.waarde);
    argumenten.add(t.begin);
  }
  return { src, teksten, zinnen, fouten, argumenten };
}

// De bestanden van het spel: eerst in de volgorde van index.html, dan wat er verder in js/ staat.
function bestanden() {
  const { scriptsVan } = require('../test/laad.cjs');
  const geladen = scriptsVan('index.html').filter((s) => s.startsWith('js/'));
  const rest = fs.readdirSync(path.join(WORTEL, 'js')).filter((f) => f.endsWith('.js')).map((f) => `js/${f}`).filter((f) => !geladen.includes(f)).sort();
  return [...geladen, ...rest];
}

// Alle zinnen, elk één keer, in de volgorde waarin ze voor het eerst staan, met de bestanden waar ze staan.
function zoekTeksten() {
  const perZin = new Map();
  const fouten = [];
  for (const bestand of bestanden()) {
    const r = zinnenIn(bestand);
    fouten.push(...r.fouten);
    for (const t of r.zinnen) {
      if (!perZin.has(t)) perZin.set(t, { t, waar: [] });
      const z = perZin.get(t);
      if (!z.waar.includes(bestand)) z.waar.push(bestand);
    }
  }
  return { zinnen: [...perZin.values()], fouten };
}

// ── Tekst buiten T.t ──
//
// In een bestand dat omgezet is (OMGEZET in test/taal.test.cjs), staat geen tekst voor de speler meer buiten T.t.
// Wat telt als tekst: twee woorden of meer, of één woord met een hoofdletter (Laden, Terug), ook in een title=""; de
// html zelf (tags, klassen) telt niet. Een sleutel van het toetsenbord met een hoofdletter (Escape) is geen tekst; en
// wat toch geen tekst is, krijgt `// geen tekst` op zijn regel. Eén woord zonder hoofdletter ziet dit niet; dat vangt
// de proef met de nep-taal in de browser (stap 2 van vraag 147).
const TOETSEN = new Set(['Escape', 'Enter', 'Tab', 'Backspace', 'Delete', 'Shift', 'Control', 'Alt', 'Meta', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End']);

function losseTeksten(bestand) {
  const { src, teksten, argumenten } = zinnenIn(bestand);
  const regels = src.split('\n');
  const los = [];
  for (const t of teksten) {
    if (argumenten.has(t.begin) || t.waarde === 'use strict') continue;
    const regel = regelVan(src, t.begin);
    if (/\/\/.*geen tekst/.test(regels[regel - 1])) continue;
    const attributen = [...t.waarde.matchAll(/\b(?:title|placeholder|alt|aria-label)="([^"\0]*)"/g)].map((m) => m[1]);
    // Geen tekst: de tags, een attribuut met zijn waarde (ook als stuk van een tag), een html-teken, en een naam met
    // streepjes (een id of een klasse: menu-knop).
    const zichtbaar = [t.waarde.replace(/<[^>]*>/g, ' ').replace(/[\w-]+=(?:"[^"]*"?|'[^']*'?)/g, ' '), ...attributen]
      .join(' ')
      .replace(/&[#\w]+;/g, ' ')
      .replace(/\b[a-z0-9]+(?:-[a-z0-9]+)+\b/g, ' ')
      .replace(/\0/g, ' ');
    const woorden = zichtbaar.match(/[A-Za-zÀ-ÿ]{2,}/g) || [];
    const isTekst = woorden.length >= 2 || (woorden.length === 1 && /^[A-ZÀ-Ý]/.test(woorden[0]) && !TOETSEN.has(woorden[0]));
    if (isTekst) los.push({ bestand, regel, tekst: t.waarde.replace(/\0/g, '${…}') });
  }
  return los;
}

// ── taal/bron.js ──

function bronBestand(zinnen) {
  const regels = zinnen.map((z) => `  ${JSON.stringify(z)},`).join('\n');
  return (
    '// De bronteksten van het spel (vraag 147): elke zin die de speler kan zien, in het Engels, en in welke bestanden\n' +
    '// hij staat. Gemaakt door npm run teksten (gereedschap/teksten.cjs) uit de aanroepen van T.t in js/; niet met de\n' +
    '// hand bewerken. De vertaaltool (gereedschap/vertalen.html) werkt met deze lijst.\n' +
    `Spel.TAAL_BRON = [\n${regels}\n];\n`
  );
}

// De talen in taal/ (zonder bron.js), gelezen als gegevens.
function talenInMap() {
  const T = globalThis.Spel && globalThis.Spel.leesTaalBestand ? globalThis.Spel : (require('../js/naam.js'), require('../js/taal.js'), globalThis.Spel);
  return fs
    .readdirSync(path.join(WORTEL, 'taal'))
    .filter((f) => f.endsWith('.js') && f !== 'bron.js')
    .sort()
    .map((f) => ({ bestand: `taal/${f}`, ...T.leesTaalBestand(fs.readFileSync(path.join(WORTEL, 'taal', f), 'utf8')) }));
}

// Per taal: wat ontbreekt, wat over is (een vertaling van een zin die niet meer in de code staat), en wat niet past.
function verslagVan(taal, zinnen) {
  const T = globalThis.Spel;
  const bron = new Set(zinnen.map((z) => z.t));
  const ontbreekt = zinnen.filter((z) => !taal.zinnen[z.t]).map((z) => z.t);
  const over = Object.keys(taal.zinnen).filter((k) => !bron.has(k));
  const past = Object.entries(taal.zinnen)
    .filter(([k]) => bron.has(k))
    .map(([k, v]) => ({ t: k, fout: T.keurVertaling(k, v, taal.locale) }))
    .filter((x) => x.fout.length);
  return { ontbreekt, over, past };
}

module.exports = { lees, zinnenIn, zoekTeksten, losseTeksten, bronBestand, talenInMap, verslagVan, BRON };

if (require.main === module) {
  const { zinnen, fouten } = zoekTeksten();
  for (const f of fouten) console.log(`! ${f.bestand}:${f.regel}  T.t zonder gewone tekst: ${f.tekst}`);
  fs.mkdirSync(path.dirname(BRON), { recursive: true });
  fs.writeFileSync(BRON, bronBestand(zinnen), 'utf8');
  console.log(`taal/bron.js: ${zinnen.length} zinnen uit ${new Set(zinnen.flatMap((z) => z.waar)).size} bestanden`);
  for (const taal of talenInMap()) {
    const v = verslagVan(taal, zinnen);
    const af = zinnen.length - v.ontbreekt.length;
    console.log(`\n${taal.naam} (${taal.bestand}): ${af} van ${zinnen.length} vertaald`);
    for (const t of v.ontbreekt.slice(0, 20)) console.log(`  ontbreekt: ${t}`);
    if (v.ontbreekt.length > 20) console.log(`  ... en nog ${v.ontbreekt.length - 20}`);
    for (const t of v.over) console.log(`  over (staat niet meer in de code): ${t}`);
    for (const p of v.past) console.log(`  past niet: ${p.t}\n    ${p.fout.join('; ')}`);
  }
  if (fouten.length) process.exitCode = 1;
}
