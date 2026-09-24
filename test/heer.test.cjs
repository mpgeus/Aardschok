// De heer en Sint-Maarten zonder scherm (js/heer.js): de brief een maand vooraf, wat hij ziet en
// dus vraagt, betalen, de straf naar het tekort, de schandpaal waarbij jij aanwijst, en het afzetten.
// Zie ontwerp/spel.md, "Sint-Maarten: de heer int" (Marcel, 24 sep 2026) en de werklijst, punt 5.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/tijd.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/bouwen.js');
require('../js/handel.js');
require('../js/behoeften.js');
require('../js/heer.js');
const T = globalThis.Toren;
const IN = T.HEER_INSTELLINGEN;

// Dag 0 is 1 lentemaand van het eerste jaar: de brief komt op 11 wijnmaand, Sint-Maarten is
// 11 slachtmaand.
const BRIEF = 220;
const SINT_MAARTEN = 250;
const JAAR = T.DAGEN_PER_JAAR;

function maakS() {
  const tegels = [];
  for (let y = 0; y < 20; y++) tegels.push(new Array(20).fill('vloer'));
  const wezens = [
    { wie: 'boer1', naam: 'Gerrit' },
    { wie: 'boer2', naam: 'Aleid' },
    { soort: 'dorpeling', naam: 'dorpeling' },
  ];
  return {
    wereld: { b: 20, h: 20, tegels, voorwerpen: [], wezens, akkers: [{ b: 2, h: 10 }, { b: 4, h: 5 }] }, // 40 akkertegels
    voorraad: T.nieuweVoorraad(),
    gebouwen: [{ soort: 'huis', x: 0, y: 0, klaar: true, voortgang: 1, handen: 0 }],
    bevolking: 20,
    woonruimte: 0,
    kalender: { dag: 0 },
  };
}

test('T.dagenTot: de brief op 11 wijnmaand en Sint-Maarten op 11 slachtmaand', () => {
  assert.equal(T.dagenTot(BRIEF, IN.brief), 0);
  assert.equal(T.dagenTot(SINT_MAARTEN, T.SINT_MAARTEN), 0);
  assert.equal(T.dagenTot(BRIEF, T.SINT_MAARTEN), 30);
  assert.equal(T.dagenTot(SINT_MAARTEN + 1, T.SINT_MAARTEN), JAAR - 1);
});

test('de brief komt op 11 wijnmaand, niet eerder, en de aanslag ligt dan vast', () => {
  const S = maakS();
  for (let d = 1; d < BRIEF; d++) T.tikHeerDag(S, d);
  assert.equal(S.heer.aanslag, null);
  T.tikHeerDag(S, BRIEF);
  const a = S.heer.aanslag;
  assert.equal(a.graan, Math.ceil(40 * IN.pachtPerAkkertegel));
  assert.ok(a.goud > 0);
  assert.equal(a.wol, undefined, 'geen schaapskooi, geen wol');
  assert.equal(a.eieren, undefined, 'geen kippenhok, geen eieren');
  // Wat er na de brief gebeurt, verandert de aanslag niet meer.
  S.bevolking = 200;
  T.tikHeerDag(S, BRIEF + 1);
  assert.deepEqual(S.heer.aanslag, a);
});

test('wat hij ziet: schapen geven wol, kippen eieren, en een rijk huis meer goud', () => {
  const S = maakS();
  const kaal = T.aanslag(S, 1);
  S.gebouwen.push({ soort: 'schaapskooi', x: 5, y: 5, klaar: true }, { soort: 'kippenhok', x: 9, y: 9, klaar: true });
  const met = T.aanslag(S, 1);
  assert.equal(met.wol, IN.wolPerSchaapskooi);
  assert.equal(met.eieren, IN.eierenPerKippenhok);
  S.gebouwen.push({ soort: 'stenenHuis', x: 12, y: 12, klaar: true });
  assert.ok(T.aanslag(S, 1).goud > met.goud, 'een stenen huis oogt rijk');
  assert.ok(T.pronkVan('stenenHuis') > T.pronkVan('hut'));
  // Wat nog in aanbouw is, ziet hij niet als pronk.
  S.gebouwen.push({ soort: 'herberg', x: 15, y: 15, klaar: false });
  assert.equal(T.aanslag(S, 1).goud, T.aanslag({ ...S, gebouwen: S.gebouwen.slice(0, -1) }, 1).goud);
  assert.ok(kaal.goud > 0);
});

test('open verkocht ziet hij, stil verkocht niet', () => {
  const S = maakS();
  const voor = T.aanslag(S, 1).goud;
  S.handel = T.nieuweHandel();
  S.handel.boek.push({ dag: 10, goed: 'wol', aantal: -10, goud: 40, stil: true });
  assert.equal(T.aanslag(S, 1).goud, voor, 'stil: niets te zien');
  S.handel.boek.push({ dag: 11, goed: 'wol', aantal: -10, goud: 40, stil: false });
  assert.ok(T.aanslag(S, 1).goud >= voor + Math.floor(40 * IN.handelsDeel), 'open: dat ziet hij');
});

test('elk jaar vraagt hij meer', () => {
  const S = maakS();
  assert.ok(T.aanslag(S, 3).graan > T.aanslag(S, 1).graan);
});

// Tot en met Sint-Maarten van het eerste jaar, met een voorraad die vlak ervoor wordt gezet.
function totSintMaarten(S, voorraad, vanaf = 1, jaar = 0) {
  for (let d = vanaf; d < SINT_MAARTEN + jaar * JAAR; d++) T.tikHeerDag(S, d);
  for (const [wat, n] of Object.entries(voorraad(S.heer.aanslag))) T.zetVoorraad(S, wat, n);
  T.tikHeerDag(S, SINT_MAARTEN + jaar * JAAR);
  return S.heer.geschiedenis[S.heer.geschiedenis.length - 1];
}

test('wie alles betaalt, heeft een goed jaar', () => {
  const S = maakS();
  const r = totSintMaarten(S, (a) => ({ ...a, graan: a.graan + 5 }));
  assert.equal(r.straf, null);
  assert.equal(r.tekort, 0);
  assert.equal(S.voorraad.graan, 5, 'hij nam wat hij vroeg, niet meer');
  assert.equal(S.heer.tekorten, 0);
  assert.equal(S.heer.aanslag, null);
});

test('een klein tekort: hij vraagt voortaan meer, en wat ontbrak staat met rente op de volgende brief', () => {
  const S = maakS();
  const r = totSintMaarten(S, (a) => ({ ...a, goud: a.goud - 1 }));
  assert.equal(r.straf, 'eisen');
  assert.equal(S.heer.tekorten, 1);
  assert.ok(Math.abs(S.heer.verhoging - (1 + IN.verhoging)) < 1e-9);
  assert.ok(Math.abs(S.heer.schuld - IN.rente) < 1e-9);
  const volgend = T.aanslag(S, 2);
  const zonder = T.aanslag({ ...S, heer: { ...S.heer, schuld: 0, verhoging: 1 } }, 2);
  assert.ok(volgend.goud > zonder.goud);
});

test('een groter tekort: soldaten, een maand; ze eten mee en het dorp morrt', () => {
  const S = maakS();
  const r = totSintMaarten(S, (a) => ({ graan: Math.floor(a.graan / 2), goud: Math.floor(a.goud * 0.6) }));
  assert.equal(r.straf, 'soldaten');
  assert.ok(S.heer.soldaten);
  assert.ok(S.stemmingen.some((s) => s.reden === 'soldaten' && s.waarde < 0));
  T.zetVoorraad(S, 'graan', 100);
  T.tikHeerDag(S, SINT_MAARTEN + 1);
  assert.ok(S.voorraad.graan < 100, 'ze eten mee');
  for (let d = SINT_MAARTEN + 2; d <= SINT_MAARTEN + IN.soldaten.dagen; d++) T.tikHeerDag(S, d);
  assert.equal(S.heer.soldaten, null, 'na een maand trekken ze af');
});

test('een groot tekort: iemand aan de schandpaal, en jij wijst aan wie', () => {
  const S = maakS();
  const r = totSintMaarten(S, (a) => ({ graan: 1, goud: 0 }));
  assert.equal(r.straf, 'schandpaal');
  const namen = T.schandpaalKandidaten(S).map((k) => k.naam);
  assert.deepEqual(namen, ['Gerrit', 'Aleid', 'een keuter zonder land']);
  assert.equal(T.kiesSchandpaal(S, 'boer2').gelukt, true);
  assert.deepEqual(S.heer.geschandpaald.map((x) => x.naam), ['Aleid']);
  assert.ok(S.stemmingen.some((s) => s.reden === 'schandpaal' && s.waarde < 0));
  assert.equal(T.kiesSchandpaal(S, 'boer1').gelukt, false, 'één keer is genoeg');
});

test('niets betalen kost je meteen je ambt', () => {
  const S = maakS();
  const r = totSintMaarten(S, () => ({}));
  assert.equal(r.straf, 'afgezet');
  assert.equal(S.heer.afgezet.reden, 'niets');
  // Daarna gebeurt er niets meer: geen brief, geen Sint-Maarten.
  for (let d = SINT_MAARTEN + 1; d <= SINT_MAARTEN + JAAR; d++) T.tikHeerDag(S, d);
  assert.equal(S.heer.aanslag, null);
});

test('drie jaar op rij tekort kost je je ambt, en een goed jaar zet de teller terug', () => {
  const S = maakS();
  const weinig = (a) => ({ ...a, goud: a.goud - 1 });
  totSintMaarten(S, weinig, 1, 0);
  totSintMaarten(S, weinig, SINT_MAARTEN + 1, 1);
  assert.equal(S.heer.tekorten, 2);
  totSintMaarten(S, (a) => ({ ...a }), SINT_MAARTEN + JAAR + 1, 2);
  assert.equal(S.heer.tekorten, 0, 'een goed jaar');
  totSintMaarten(S, weinig, SINT_MAARTEN + 2 * JAAR + 1, 3);
  totSintMaarten(S, weinig, SINT_MAARTEN + 3 * JAAR + 1, 4);
  assert.equal(S.heer.afgezet, null);
  const r = totSintMaarten(S, weinig, SINT_MAARTEN + 4 * JAAR + 1, 5);
  assert.equal(r.straf, 'afgezet');
  assert.equal(S.heer.afgezet.reden, 'tekorten');
});

test('in het oude spel (geen mensen) komt er geen heer', () => {
  const S = maakS();
  S.bevolking = 0;
  for (let d = 1; d <= SINT_MAARTEN; d++) T.tikHeerDag(S, d);
  assert.equal(S.heer, undefined);
});

test('de brief is een brief: hoogdravend, en hij noemt wat hij wil', () => {
  const S = maakS();
  for (let d = 1; d <= BRIEF; d++) T.tikHeerDag(S, d);
  const b = T.briefVanDeHeer(S);
  assert.match(b.tekst, /Sint-Maarten/);
  assert.match(b.tekst, new RegExp(`${S.heer.aanslag.graan} graan`));
});
