// De proefversie voor een tester (werklijst vraag 58, C; Marcel, 29 sep: "C itch io"): een zip met alleen wat het
// spel nodig heeft, met index.html bovenin, zoals itch.io een spel in de browser wil. Uitgepakt speelt hij ook los,
// met een dubbelklik op index.html, want het spel draait vanaf een los bestand (ontwerp/verpakken.md).
//
//   npm run proefversie        maakt gereedschap/proefversie/uit/<naam>-proef-<datum>-<commit>.zip
//
// In de zip staat in js/naam.js de stand (T.STAND): de datum en de commit, en of er nog wijzigingen in het spel
// waren die niet gecommit zijn. Het titelscherm zet hem klein rechtsonder, zodat we weten waarop een tester speelde
// (CLAUDE.md, onder Git). Wat erin gaat: index.html, wat daarin geladen wordt (de scripts en de stijl), en de
// plaatjes uit beelden/ en tegels/, die js/sprites.js zelf laadt. De bronnen van die plaatjes (Tiled, .json) niet.
// Hoe de zip op itch.io komt, staat in ontwerp/verpakken.md, "Een proefversie op itch.io".
//
// Zonder afhankelijkheden: de zip maakt dit bestand zelf, met zlib uit Node.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { execSync } = require('node:child_process');

const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'uit');
require(path.join(WORTEL, 'js', 'naam.js'));
const NAAM = globalThis.Spel.NAAM;

// Alle bestanden onder een map, als paden vanaf de wortel met een schuine streep.
function onder(map) {
  const uit = [];
  for (const e of fs.readdirSync(path.join(WORTEL, map), { withFileTypes: true })) {
    const pad = `${map}/${e.name}`;
    if (e.isDirectory()) uit.push(...onder(pad));
    else uit.push(pad);
  }
  return uit;
}

// Wat het spel laadt: index.html, de scripts en de stijl die erin staan, en de plaatjes.
function bestanden() {
  const html = fs.readFileSync(path.join(WORTEL, 'index.html'), 'utf8');
  const lijst = new Set(['index.html']);
  for (const m of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)) {
    if (/^[a-z]+:/i.test(m[1])) throw new Error(`index.html laadt iets van buiten: ${m[1]}. Dat komt niet in de zip.`);
    lijst.add(m[1]);
  }
  for (const map of ['beelden', 'tegels']) for (const f of onder(map)) if (f.endsWith('.png')) lijst.add(f);
  for (const f of lijst) if (!fs.existsSync(path.join(WORTEL, f))) throw new Error(`${f} staat in index.html, maar bestaat niet.`);
  return [...lijst].sort();
}

// De stand: "Proefversie van 29 sep 2026 · 6750a21", met "en wijzigingen" als het spel wijzigingen heeft die nog niet
// gecommit zijn (zoals de speeltest het zegt: js, index.html, de kaarten, de beelden en de stijl).
function stand() {
  const git = (opdracht) => execSync(`git ${opdracht}`, { cwd: WORTEL, encoding: 'utf8' }).trim();
  const MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const nu = new Date();
  const commit = git('rev-parse --short HEAD');
  const vies = git('status --porcelain -- js index.html kaarten beelden tegels stijl.css');
  return {
    tekst: `Proefversie van ${nu.getDate()} ${MAANDEN[nu.getMonth()]} ${nu.getFullYear()} · ${commit}${vies ? ' en wijzigingen' : ''}`,
    bestand: `${NAAM.toLowerCase()}-proef-${nu.toISOString().slice(0, 10)}-${commit}${vies ? '-met-wijzigingen' : ''}.zip`,
    vies: !!vies,
  };
}

// ── De zip ────────────────────────────────────────────────────────────────────────────────────────
// Elk bestand ingepakt met deflate, of zoals het is als dat niet kleiner wordt (een png is al ingepakt), met zijn
// CRC-32; daarna de inhoudsopgave. Namen in UTF-8 (vlag 0x0800).
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function maakZip(lijst) {
  const nu = new Date();
  const tijd = (nu.getHours() << 11) | (nu.getMinutes() << 5) | Math.floor(nu.getSeconds() / 2);
  const datum = ((nu.getFullYear() - 1980) << 9) | ((nu.getMonth() + 1) << 5) | nu.getDate();
  const delen = [];
  const inhoud = [];
  let plek = 0;
  for (const { naam, data } of lijst) {
    const n = Buffer.from(naam, 'utf8');
    const ingepakt = zlib.deflateRawSync(data, { level: 9 });
    const deflate = ingepakt.length < data.length;
    const lijf = deflate ? ingepakt : data;
    const crc = crc32(data);
    const kop = Buffer.alloc(30);
    kop.writeUInt32LE(0x04034b50, 0);
    kop.writeUInt16LE(20, 4);
    kop.writeUInt16LE(0x0800, 6);
    kop.writeUInt16LE(deflate ? 8 : 0, 8);
    kop.writeUInt16LE(tijd, 10);
    kop.writeUInt16LE(datum, 12);
    kop.writeUInt32LE(crc, 14);
    kop.writeUInt32LE(lijf.length, 18);
    kop.writeUInt32LE(data.length, 22);
    kop.writeUInt16LE(n.length, 26);
    delen.push(kop, n, lijf);
    const regel = Buffer.alloc(46);
    regel.writeUInt32LE(0x02014b50, 0);
    regel.writeUInt16LE(20, 4);
    regel.writeUInt16LE(20, 6);
    regel.writeUInt16LE(0x0800, 8);
    regel.writeUInt16LE(deflate ? 8 : 0, 10);
    regel.writeUInt16LE(tijd, 12);
    regel.writeUInt16LE(datum, 14);
    regel.writeUInt32LE(crc, 16);
    regel.writeUInt32LE(lijf.length, 20);
    regel.writeUInt32LE(data.length, 24);
    regel.writeUInt16LE(n.length, 28);
    regel.writeUInt32LE(plek, 42);
    inhoud.push(regel, n);
    plek += kop.length + n.length + lijf.length;
  }
  const opgave = Buffer.concat(inhoud);
  const eind = Buffer.alloc(22);
  eind.writeUInt32LE(0x06054b50, 0);
  eind.writeUInt16LE(lijst.length, 8);
  eind.writeUInt16LE(lijst.length, 10);
  eind.writeUInt32LE(opgave.length, 12);
  eind.writeUInt32LE(plek, 16);
  return Buffer.concat([...delen, opgave, eind]);
}

function main() {
  const s = stand();
  const lijst = bestanden().map((naam) => {
    let data = fs.readFileSync(path.join(WORTEL, naam));
    if (naam === 'js/naam.js') {
      const oud = data.toString('utf8');
      const nieuw = oud.replace(/^(\s*)T\.STAND = null;$/m, `$1T.STAND = ${JSON.stringify(s.tekst)};`);
      if (nieuw === oud) throw new Error('In js/naam.js staat geen "T.STAND = null;" meer: de stand kan niet in de zip.');
      data = Buffer.from(nieuw, 'utf8');
    }
    return { naam, data };
  });
  const zip = maakZip(lijst);
  fs.mkdirSync(UIT, { recursive: true });
  const doel = path.join(UIT, s.bestand);
  fs.writeFileSync(doel, zip);
  const mb = (n) => (n / 1024 / 1024).toFixed(1).replace('.', ',');
  console.log(`${s.tekst}: ${lijst.length} bestanden, ${mb(zip.length)} MB.`);
  console.log(`Klaar: ${path.relative(WORTEL, doel)}`);
  if (s.vies) console.log('Let op: het spel heeft wijzigingen die nog niet gecommit zijn. Commit eerst, dan weet je waarop de tester speelt.');
}

main();
