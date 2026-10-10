// Twee speeltests naast elkaar (werklijst vraag 142, stap 3; Marcel, 10 okt: een set getallen probeer je in de code, en de
// speeltest zet hem naast de vorige). Een speeltest met een naam (`npm run speeltest -- bouwer --naam voor`) bewaart in
// uit/<naam>/ wat hij speelde: set.json met de stand en de opdracht, waarden.json met alle waarden van de bladzijde met
// getallen (gelezen met gereedschap/instellingen/bron.js, zoals de bladzijde ze toont), en per spel zijn uitslag. Dit zet twee zulke
// speeltests naast elkaar: welke waarden er anders waren, en per spel wat er anders afliep. Dezelfde speler met hetzelfde
// zaad speelt hetzelfde jaar, dus wat er anders afloopt, komt van die waarden (of van de code, als de stand verschilt).
//
// Zonder browser, dus te toetsen (test/speeltest-vergelijk.test.cjs). speeltest.cjs schrijft het, en de server en
// gereedschap/instellingen.html lezen het.
const fs = require('node:fs');
const path = require('node:path');
const I = require('../instellingen/bron.js');
const { NAMEN, BASIS } = require('./samenvatting.cjs');

const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'uit');

// De naam van een speeltest wordt een map in uit/: alleen letters, cijfers, streepjes en lage streepjes.
const GOEDE_NAAM = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

// De bestanden waar de getallen in staan, zoals de server ze leest: { 'js/akkers.js': tekst, ... }.
function leesBronnen(wortel = WORTEL) {
  const bronnen = {};
  for (const f of fs.readdirSync(path.join(wortel, 'js')).filter((f) => f.endsWith('.js')).sort()) {
    bronnen['js/' + f] = fs.readFileSync(path.join(wortel, 'js', f), 'utf8');
  }
  return bronnen;
}

// Alle waarden van de bladzijde met getallen: { sleutel: { blok, pad, soort, waarde, naam } }, in de volgorde van de
// bladzijde (de spelregels, de gebouwen, de onderwerpen). Een spelregel heet naar zijn id, niet naar zijn plek in de lijst,
// zodat een spelregel erbij niet elke spelregel erna "anders" maakt. Zet de standaard van een spelregel een waarde (ook via
// het object eromheen), dan staat dat erbij (`spelregel`: { optie, waarde }): in het spel geldt dan die.
function waardenVan(bronnen) {
  const m = I.model(bronnen);
  const uit = {};
  const zet = (sleutel, b, naam) => {
    uit[sleutel] = { blok: b.blok, pad: b.pad, soort: b.soort, waarde: b.waarde, naam };
    const std = (b.spelregels || []).find((z) => z.standaard && !z.heel);
    if (std) uit[sleutel].spelregel = { optie: std.optie, waarde: std.waarde };
  };
  for (const r of m.spelregels) zet(`OPTIES:${r.id}`, { blok: r.blok, pad: r.pad, soort: 'keuze', waarde: r.standaard }, `De spelregel "${r.naam || r.id}"`);
  for (const g of m.gebouwen) for (const b of g.bladen) zet([b.blok, ...b.pad].join('.'), b, `${g.naam}: ${b.pad.slice(1).join(' › ')}`);
  for (const o of m.onderwerpen) {
    for (const b of o.bladen) zet([b.blok, ...b.pad].join('.'), b, b.naam ? `${o.naam}: ${b.naam}` : `${o.naam}: ${b.pad.join(' › ')}`);
  }
  return uit;
}

// Waar twee sets waarden verschillen: [{ sleutel, naam, blok, pad, soort, voor, na }], in de volgorde van de bladzijde. Wat
// er in de ene niet is, heeft daar null (een getal dat erbij kwam of wegging).
function andereWaarden(voor, na) {
  const uit = [];
  for (const k of new Set([...Object.keys(na), ...Object.keys(voor)])) {
    const a = voor[k];
    const b = na[k];
    if (a && b && JSON.stringify(a.waarde) === JSON.stringify(b.waarde)) continue;
    const x = b || a;
    uit.push({ sleutel: k, naam: x.naam, blok: x.blok, pad: x.pad, soort: x.soort, voor: a ? a.waarde : null, na: b ? b.waarde : null, nietInHetSpel: nietInHetSpel(b) });
  }
  return uit;
}

// Doet deze waarde in het spel niets, omdat de standaard van een spelregel hem anders zet? Dan zegt het welke en waarop.
function nietInHetSpel(w) {
  if (!w || !w.spelregel || JSON.stringify(w.spelregel.waarde) === JSON.stringify(w.waarde)) return null;
  return w.spelregel;
}

const som = (lijst, f) => (lijst || []).reduce((n, x) => n + ((x && f(x)) || 0), 0);
const rond = (x) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x) : null);
const procent = (x) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 100) : null);

// Wat een spel opleverde, in de maten van de vergelijking. Een getal waar het kan (dan is het verschil te rekenen), een
// datum of hoe het afliep als tekst. De uitslag is wat gereedschap/speeltest/speler.js per spel teruggeeft.
const MATEN = [
  ['afloop', 'Hoe het afliep', (u) => u.mislukt ? `mislukt: ${u.mislukt}` : u.eind && u.eind.tekst],
  ['mensen', 'Mensen aan het eind', (u) => u.eind && u.eind.bevolking],
  ['dorp', 'Een dorp op', (u) => (u.dorp ? u.dorp.datum : 'niet')],
  ['marktrecht', 'Marktrecht op', (u) => (u.marktrecht ? u.marktrecht.datum : 'niet')],
  ['gewonnen', 'Gewonnen op', (u) => (u.eind && u.eind.eind && u.eind.eind.gewonnen) || 'niet'],
  ['allemaal', 'Dagen dat alle huizen alles hadden', (u) => som(u.geluk, (g) => g.allemaal)],
  ['teller', 'De langste reeks naar de winst (dagen)', (u) => u.eind && u.eind.eind && u.eind.eind.beste],
  ['tevreden', 'Tevreden aan het eind (%)', (u) => u.eind && procent(u.eind.tevredenheid)],
  ['honger', 'Dagen met honger', (u) => som(u.geluk, (g) => g.honger)],
  ['doden', 'Doden in de winter', (u) => u.winter && u.winter.doden],
  ['weg', 'Weggetrokken', (u) => u.winter && u.winter.weg],
  ['gunst', 'Gunst van de heer', (u) => u.eind && u.eind.bazen && u.eind.bazen.gunst],
  ['vertrouwen', 'Vertrouwen van het dorp', (u) => u.eind && u.eind.bazen && u.eind.bazen.vertrouwen],
  ['argwaan', 'Argwaan van de heer (%)', (u) => u.eind && procent(u.eind.argwaan)],
  ['graan', 'Graan aan het eind', (u) => u.eind && u.eind.graan],
  ['goud', 'Goud aan het eind', (u) => u.eind && u.eind.goud],
  ['hout', 'Hout aan het eind', (u) => u.eind && u.eind.hout],
  ['fouten', 'Fouten in de console', (u) => (u.fouten || []).length],
];

function matenVan(u) {
  return MATEN.map(([id, naam, f]) => {
    let w = null;
    try {
      w = f(u);
    } catch {
      w = null;
    }
    if (typeof w === 'number') w = rond(w);
    return { id, naam, waarde: w == null ? null : w };
  });
}

// Wat er gespeeld werd, zonder de naam: twee speeltests zijn te vergelijken als dit gelijk is.
function opdrachtTekst(o) {
  if (!o) return '?';
  const zaden = o.zaden && o.zaden.length > 1 ? `zaden ${o.zaden[0]} tot ${o.zaden[o.zaden.length - 1]}` : `zaad ${(o.zaden || [])[0]}`;
  const land = { eiland: 'op het eiland', maker: 'op gehuchten van de maker', ontworpen: 'op het ontworpen gehucht' }[o.land] || o.land;
  const anders = [...Object.entries(o.regels || {}), ...Object.entries(o.getallen || {})].map(([k, v]) => `${k}=${v}`);
  return `${(o.spelers || []).join(', ')}, ${zaden}${o.jaren ? `, ${o.jaren} jaar` : ''}, ${land}${anders.length ? `, met ${anders.join(', ')}` : ''}`;
}

// Wat een speeltest met een naam in zijn map schrijft, naast de uitslag per spel.
const EIGEN = new Set(['set.json', 'waarden.json', 'vergelijking.json']);

// Een speeltest uit uit/<naam>/: { set, uitslagen }, met de waarden in set.waarden, of null als hij er niet is. De
// uitslagen zijn de bestanden met een speler en een zaad erin (wat speeltest.cjs per spel schrijft).
function leesSpeeltest(naam, uit = UIT) {
  if (!GOEDE_NAAM.test(naam || '')) return null;
  const map = path.join(uit, naam);
  const setBestand = path.join(map, 'set.json');
  if (!fs.existsSync(setBestand)) return null;
  const set = JSON.parse(fs.readFileSync(setBestand, 'utf8'));
  const waardenBestand = path.join(map, 'waarden.json');
  set.waarden = fs.existsSync(waardenBestand) ? JSON.parse(fs.readFileSync(waardenBestand, 'utf8')) : {};
  const uitslagen = [];
  for (const f of fs.readdirSync(map).sort()) {
    if (!f.endsWith('.json') || EIGEN.has(f)) continue;
    try {
      const u = JSON.parse(fs.readFileSync(path.join(map, f), 'utf8'));
      if (u && u.speler && u.zaad != null) uitslagen.push(u);
    } catch {
      // een half geschreven bestand van een speeltest die gestopt werd: overslaan
    }
  }
  return { set, uitslagen };
}

// De speeltests in uit/, de nieuwste eerst: [{ naam, wanneer, stand, opdracht, klaar }].
function speeltestsIn(uit = UIT) {
  if (!fs.existsSync(uit)) return [];
  const lijst = [];
  for (const naam of fs.readdirSync(uit)) {
    if (!GOEDE_NAAM.test(naam)) continue;
    const bestand = path.join(uit, naam, 'set.json');
    if (!fs.existsSync(bestand)) continue;
    try {
      const s = JSON.parse(fs.readFileSync(bestand, 'utf8'));
      lijst.push({ naam, wanneer: s.wanneer, stand: s.stand, opdracht: s.opdracht, klaar: !!s.klaar, vergelijking: fs.existsSync(path.join(uit, naam, 'vergelijking.json')) });
    } catch {
      // een set.json die niet te lezen is: niet in de lijst
    }
  }
  return lijst.sort((a, b) => String(b.wanneer).localeCompare(String(a.wanneer)));
}

// Twee speeltests naast elkaar: `tegen` (de vorige) en `na` (deze), elk { set, uitslagen }.
function vergelijk(tegen, na) {
  const spellen = [];
  for (const u of na.uitslagen) {
    const v = tegen.uitslagen.find((x) => x.speler === u.speler && x.zaad === u.zaad);
    const a = v ? matenVan(v) : null;
    const b = matenVan(u);
    spellen.push({
      speler: u.speler, zaad: u.zaad, naam: `${BASIS[u.speler] || NAMEN[u.speler] || u.speler}, zaad ${u.zaad}`, gespeeldTegen: !!v,
      maten: b.map((m, i) => ({ id: m.id, naam: m.naam, voor: a ? a[i].waarde : null, na: m.waarde })),
    });
  }
  spellen.sort((x, y) => String(x.speler).localeCompare(String(y.speler)) || x.zaad - y.zaad);
  const opdrachtVoor = opdrachtTekst(tegen.set.opdracht);
  const opdrachtNa = opdrachtTekst(na.set.opdracht);
  return {
    naam: na.set.naam, tegen: tegen.set.naam,
    voor: { naam: tegen.set.naam, wanneer: tegen.set.wanneer, stand: tegen.set.stand, opdracht: opdrachtVoor },
    na: { naam: na.set.naam, wanneer: na.set.wanneer, stand: na.set.stand, opdracht: opdrachtNa },
    zelfdeOpdracht: opdrachtVoor === opdrachtNa,
    waarden: andereWaarden(tegen.set.waarden || {}, na.set.waarden || {}),
    spellen,
  };
}

const toon = (w) => (w == null ? '' : typeof w === 'boolean' ? (w ? 'ja' : 'nee') : typeof w === 'string' ? w : JSON.stringify(w));
const cel = (w) => toon(w).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const verschil = (a, b) => (typeof a === 'number' && typeof b === 'number' ? (b === a ? '' : `${b > a ? '+' : ''}${b - a}`) : toon(a) === toon(b) ? '' : 'anders');

const alsNiet = (w) => `${w.naam} doet in het spel niets: de standaard van de spelregel "${w.nietInHetSpel.optie}" zet het op ${toon(w.nietInHetSpel.waarde)}. Verander daarvoor de spelregel.`;

// De vergelijking als tekst, voor uit/<naam>/vergelijking.md en de opdrachtregel.
function alsTekst(v) {
  const uit = [`# ${v.naam} naast ${v.tegen}`, ''];
  uit.push(`- ${v.tegen}: ${v.voor.opdracht}; ${v.voor.stand || '?'}${v.voor.wanneer ? `; ${v.voor.wanneer}` : ''}`);
  uit.push(`- ${v.naam}: ${v.na.opdracht}; ${v.na.stand || '?'}${v.na.wanneer ? `; ${v.na.wanneer}` : ''}`);
  uit.push('');
  if (!v.zelfdeOpdracht) uit.push('**Let op:** de twee speelden niet hetzelfde, dus een verschil komt niet alleen van de waarden.', '');
  uit.push('## Wat er anders was', '');
  if (!v.waarden.length) {
    uit.push(`Geen waarde was anders. ${v.voor.stand === v.na.stand ? 'Op dezelfde stand speelt hetzelfde zaad hetzelfde jaar, dus hieronder hoort niets anders te zijn.' : 'Wat er hieronder anders afliep, komt van de code: de stand verschilt.'}`, '');
  } else {
    uit.push(`| waarde | ${v.tegen} | ${v.naam} |`, '| --- | --- | --- |');
    for (const w of v.waarden) uit.push(`| ${cel(w.naam)} (${cel([w.blok, ...w.pad].join('.'))}) | ${w.voor == null ? '(niet)' : cel(w.voor)} | ${w.na == null ? '(niet)' : cel(w.na)} |`);
    uit.push('');
    for (const w of v.waarden) if (w.nietInHetSpel) uit.push(`- ${alsNiet(w)}`);
    if (v.waarden.some((w) => w.nietInHetSpel)) uit.push('');
  }
  uit.push('## Per spel', '');
  for (const s of v.spellen) {
    uit.push(`### ${s.naam}`, '');
    if (!s.gespeeldTegen) uit.push(`${v.tegen} speelde dit spel niet.`, '');
    uit.push(`| | ${v.tegen} | ${v.naam} | verschil |`, '| --- | --- | --- | --- |');
    for (const m of s.maten) if (m.voor != null || m.na != null) uit.push(`| ${m.naam} | ${cel(m.voor)} | ${cel(m.na)} | ${s.gespeeldTegen ? verschil(m.voor, m.na) : ''} |`);
    uit.push('');
  }
  return uit.join('\n');
}

module.exports = { alsNiet, GOEDE_NAAM, UIT, leesBronnen, waardenVan, andereWaarden, matenVan, MATEN, opdrachtTekst, leesSpeeltest, speeltestsIn, vergelijk, alsTekst, verschil };
