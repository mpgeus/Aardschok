// De grillen van de heer (js/grillen.js; werklijst vraag 106, stap 2): elke maand een brief met iets wat hij wil, en elk
// antwoord weegt zijn gunst tegen het vertrouwen van het dorp (js/bazen.js). Wie niet antwoordt, ergert hem.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

const berichten = [];
const brieven = [];
T.ui = new Proxy({}, {
  get: (_, naam) => {
    if (naam === 'bericht') return (t) => berichten.push(t);
    if (naam === 'toonBrief') return (D, soort) => brieven.push(soort);
    return () => {};
  },
});

// Het proefdorp (test/grond.cjs), stil en met een vast zaad. Het eerste jaar laat de heer het lege begin met rust (js/begin.js,
// T.heerLaatMetRust): voor zijn grillen is dat voorbij, dus `heerVrijTot` gaat op 0 (zoals een speler die een jaar speelt).
function gehucht() {
  const S = proefDorp(T).S;
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  S.dorp.begin.heerVrijTot = 0;
  T.S = S;
  berichten.length = 0;
  brieven.length = 0;
  return S;
}
const IN = () => T.GRILLEN_INSTELLINGEN;
// De eerste dag van het spel met deze datum ('grasmaand', 12).
function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
function tik(S, dag) {
  S.kalender.dag = dag + 0.3;
  T.tikGrillenDag(S.dorp, dag);
}

test('elke gril heeft een titel, een brief, en antwoorden die de heer tegen het dorp wegen', () => {
  const sleutels = new Set(['goud', 'graan', 'hout', 'wol', 'bier', 'ijzer', 'zout', 'vlees', 'vis', 'kaas', 'hooi', 'gunst', 'vertrouwen']);
  assert.ok(Object.keys(T.GRILLEN).length >= 12, 'genoeg om twee jaar niet te herhalen');
  for (const [id, g] of Object.entries(T.GRILLEN)) {
    assert.ok(g.titel && g.tekst.length && g.keuzes.length >= 2, id);
    for (const k of g.keuzes) for (const s of Object.keys(k.doe)) assert.ok(sleutels.has(s), `${id}: ${s}`);
    assert.ok(g.keuzes.some((k) => k.doe.gunst > 0), `${id}: wie hem geeft wat hij wil, wint zijn gunst`);
    assert.ok(g.keuzes.some((k) => (k.doe.gunst || 0) < 0), `${id}: wie weigert, verliest het`);
    assert.ok(g.stil.gunst < 0, `${id}: wie zwijgt, ergert hem`);
  }
});

test('op de twaalfde van de maand komt zijn brief, niet in de eerste maand, niet in de maand van de schatting of van Sint-Maarten', () => {
  const S = gehucht();
  const D = S.dorp;
  tik(S, dagVan('lentemaand', 12));
  assert.equal(T.grilNu(D), null, 'niet in de eerste maand van je ambt');
  tik(S, dagVan('grasmaand', 11));
  assert.equal(T.grilNu(D), null);
  tik(S, dagVan('grasmaand', IN().dag));
  const g = T.grilNu(D);
  assert.ok(g && T.GRILLEN[g.id], 'een gril');
  assert.deepEqual(brieven, ['gril'], 'als brief');
  assert.equal(g.uiterlijk, dagVan('grasmaand', IN().dag) + IN().antwoordBinnen);
  // Hetzelfde spel, dezelfde dag: dezelfde gril.
  const S2 = gehucht();
  tik(S2, dagVan('grasmaand', IN().dag));
  assert.equal(T.grilNu(S2.dorp).id, g.id);
  // Niet in de maand van de schatting (oogstmaand) en van Sint-Maarten (slachtmaand).
  for (const maand of IN().nietIn) {
    const S3 = gehucht();
    tik(S3, dagVan(maand, IN().dag));
    assert.equal(T.grilNu(S3.dorp), null, maand);
  }
});

test('een antwoord kost wat het zegt, en weegt de heer tegen het dorp', () => {
  const S = gehucht();
  const D = S.dorp;
  D.grillen = T.nieuweGrillen();
  D.grillen.vraag = { id: 'standbeeld', dag: 40, uiterlijk: 50 };
  T.zetVoorraad(D, 'hout', 40);
  T.zetVoorraad(D, 'goud', 20);
  const keuzes = T.grilKeuzes(D);
  assert.equal(keuzes.length, 3);
  assert.match(keuzes[0].prijs, /−6 gold, −16 logs/);
  assert.match(keuzes[0].prijs, /the lord's favour \+10, the village's trust −3/);
  assert.ok(keuzes.every((k) => !k.hoofd), 'het spel kiest niet voor je');
  // Het vertrouwen is op dag 2 van het proefdorp al een stukje naar de tevredenheid gegaan (T.tikBazenDag): reken vanaf nu.
  const voor = T.bazenNu(D);
  assert.ok(T.beantwoordGril(D, 0));
  assert.equal(D.voorraad.hout, 24);
  assert.equal(D.voorraad.goud, 14);
  assert.deepEqual(T.bazenNu(D), { gunst: voor.gunst + 10, vertrouwen: voor.vertrouwen - 3 });
  assert.equal(T.grilNu(D), null, 'de vraag is weg');
  assert.match(T.bazenTekst(D, 'gunst'), /\+10 the statue/);
});

test('wat het dorp niet heeft, kan het niet geven', () => {
  const S = gehucht();
  const D = S.dorp;
  D.grillen = T.nieuweGrillen();
  D.grillen.vraag = { id: 'lening', dag: 40, uiterlijk: 50 };
  T.zetVoorraad(D, 'goud', 5);
  const [lenen, weigeren] = T.grilKeuzes(D);
  assert.equal(lenen.kan, false);
  assert.match(lenen.waarom, /you have 5 gold/);
  assert.equal(T.beantwoordGril(D, 0), false);
  assert.ok(weigeren.kan);
  assert.ok(T.grilNu(D), 'hij wacht nog op je antwoord');
});

test('wie niet antwoordt, ergert hem', () => {
  const S = gehucht();
  const D = S.dorp;
  tik(S, dagVan('grasmaand', IN().dag));
  const g = T.grilNu(D);
  tik(S, g.uiterlijk - 1);
  assert.ok(T.grilNu(D), 'nog niet');
  tik(S, g.uiterlijk);
  assert.equal(T.grilNu(D), null);
  assert.equal(T.bazenNu(D).gunst, 50 + T.GRILLEN[g.id].stil.gunst);
  assert.ok(berichten.some((t) => /We heard nothing from you, commander/.test(t)));
  assert.equal(D.grillen.stil, 1);
});

test('dezelfde gril komt niet binnen een pauze terug, en niet als er al een brief van de heer wacht', () => {
  const S = gehucht();
  const D = S.dorp;
  const gezien = [];
  // Wie hem alles geeft (en het heeft), blijft in functie: elke maand een brief.
  for (const wat of ['goud', 'graan', 'hout', 'bier', 'vlees']) T.zetVoorraad(D, wat, 500);
  for (let m = 1; m < 12; m++) {
    const dag = m * T.DAGEN_PER_MAAND + IN().dag - 1;
    tik(S, dag);
    const g = T.grilNu(D);
    if (g) {
      gezien.push(g.id);
      assert.ok(T.beantwoordGril(D, 0));
    }
  }
  assert.equal(new Set(gezien).size, gezien.length, `geen herhaling: ${gezien.join(', ')}`);
  assert.equal(gezien.length, 9, 'elke maand behalve de eerste, oogstmaand en slachtmaand');
  const S2 = gehucht();
  S2.dorp.heer = T.nieuweHeer();
  S2.dorp.heer.brief = { dag: 0, eis: {} };
  tik(S2, dagVan('grasmaand', IN().dag));
  assert.equal(T.grilNu(S2.dorp), null, 'eerst de schatting');
});

test('met de spelregel "Alleen de heer" zijn er geen grillen', () => {
  const S = gehucht();
  T.zetOptie('tweeBazen', 'uit');
  try {
    tik(S, dagVan('grasmaand', IN().dag));
    assert.equal(T.grilNu(S.dorp), null);
  } finally {
    T.optiesTerug();
  }
});

test('een gril die wacht, gaat mee in een opgeslagen spel', () => {
  const S = gehucht();
  tik(S, dagVan('grasmaand', IN().dag));
  const terug = T.leesSpel(T.bewaarSpel(S)).staat.dorp;
  assert.deepEqual(terug.grillen, S.dorp.grillen);
});

test('wie hem alles weigert, is binnen het jaar zijn ambt kwijt, na een waarschuwing', () => {
  const S = gehucht();
  const D = S.dorp;
  // Welke grillen er komen, loot het zaad van het dorp (T.lotVanDeDag). Wie alles weigert, verliest gemiddeld zo'n zes gunst
  // per brief: bij de meeste zaden is hij in de elfde maand weg, bij een paar pas in de twaalfde. Dit zaad is er een van de meeste.
  D.lot.zaad = 1;
  let geweigerd = 0;
  for (let m = 1; m < 12 && !D.einde; m++) {
    tik(S, m * T.DAGEN_PER_MAAND + IN().dag - 1);
    const g = T.grilNu(D);
    if (!g) continue;
    const weiger = T.GRILLEN[g.id].keuzes.reduce((beste, k, i, ks) => ((k.doe.gunst || 0) < (ks[beste].doe.gunst || 0) ? i : beste), 0);
    assert.ok(T.beantwoordGril(D, weiger));
    geweigerd++;
  }
  assert.equal(D.einde && D.einde.reden, 'ambt');
  assert.ok(brieven.includes('waarschuwing'), 'eerst de waarschuwing');
  assert.ok(geweigerd >= 5, `na ${geweigerd} keer`);
});
