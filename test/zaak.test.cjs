// De verdwenen graanzak (js/zaak.js; werklijst vraag 128, Marcel, 8 okt: "akkoord, bouwen maar"): één zaak van begin tot
// eind. De zak verdwijnt in de eerste herfst, de boer verdenkt de verkeerde, je zoekt het uit te voet (rondvragen, het
// spoor), op de zitting op het plein beslis je, en wat je koos, komt terug: een vervolg, en het boek van de schuur.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.zetOptie('wieBouwt', 'jij');

const berichten = [];
const aangesproken = [];
T.ui = new Proxy({}, {
  get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : naam === 'spreekAan' ? (S, e, id) => aangesproken.push({ e, id }) : () => {}),
});

// Het echte gehucht, stil en met een vast zaad (zoals in test/voorvallen.test.cjs).
function gehucht() {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad: 7 });
  S.dorp.voorvallen = T.nieuweVoorvallen();
  T.S = S;
  return S;
}

// De eerste dag van een maand in het eerste jaar.
const dagVan = (maand) => T.MAANDEN.findIndex((m) => m.naam === maand) * T.DAGEN_PER_MAAND - T.TIJD_START_MAAND * T.DAGEN_PER_MAAND;

// Tik de zaak dag voor dag, van `van` tot hij er is (of tot `tot`). Geeft de dag.
function totDeZaak(S, van, tot) {
  for (let d = van; d < tot; d++) {
    S.kalender.dag = d;
    T.tikZaakDag(S.dorp, d);
    if (S.dorp.zaak) return d;
  }
  return null;
}

// Een zaak die net begon, met de boer die je zoekt.
function metZaak() {
  const S = gehucht();
  const dag = totDeZaak(S, dagVan('herfstmaand'), dagVan('slachtmaand'));
  assert.ok(dag != null, 'de zak verdwijnt in de eerste herfst');
  return { S, D: S.dorp, Z: S.dorp.zaak, dag };
}

// Een antwoord geven zoals de speler het doet (js/dialoog.js).
function antwoord(S, id, knoop, keuze) {
  const k = T.GESPREKKEN[id].knopen[knoop].keuzes[keuze];
  T.doeGevolg(S, S.dorp, k.doe);
  if (k.sluit) T.voorvalBeantwoord(S.dorp, id);
  return k;
}

test('de zak verdwijnt één keer, in herfstmaand van het eerste jaar, met de verkeerde verdachte', () => {
  const S = gehucht();
  const D = S.dorp;
  assert.equal(totDeZaak(S, 0, dagVan('herfstmaand')), null, 'niet vóór de herfst');
  const graan = D.voorraad.graan;
  const dag = totDeZaak(S, dagVan('herfstmaand'), dagVan('slachtmaand'));
  const Z = D.zaak;
  assert.equal(T.MAANDEN[T.datumVanDag(dag).maand].naam, 'herfstmaand');
  assert.equal(D.voorraad.graan, graan - Z.zak, 'de zak is weg uit de voorraad');
  assert.equal(Z.fase, 'gestolen');
  assert.equal(D.voorvallen.lopend.id, 'graanzak');
  assert.equal(D.voorvallen.lopend.wie, Z.aanklager, 'de boer van de schuur komt het zeggen');
  assert.equal(D.voorvallen.lopend.ander, Z.verdachte, 'over wie hij verdenkt');
  // De mensen: allemaal anders, en de dader is een vader met een kind.
  const gezinnen = new Set([Z.dader.gezin, Z.aanklager.gezin, Z.verdachte.gezin]);
  assert.equal(gezinnen.size, 3);
  assert.equal(Z.dader.geslacht, 'man');
  assert.equal(Z.ziek.gezin, Z.dader.gezin);
  assert.ok(['kind', 'kleuter'].includes(Z.ziek.leeftijd));
  assert.equal(Z.aanklager.huis, Z.schuur);
  assert.ok(Z.spoor.length > 0, 'er ligt een spoor');
  assert.ok(berichten.some((b) => b.includes('zak graan')));
  // Het volgende jaar niet weer.
  D.zaak = null;
  D.voorvallen.lopend = null;
  assert.equal(totDeZaak(S, dagVan('herfstmaand') + T.DAGEN_PER_JAAR, dagVan('slachtmaand') + T.DAGEN_PER_JAAR), null);
});

test('met de spelregel uit verdwijnt er niets', () => {
  T.zetOptie('zaak', 'uit');
  try {
    const S = gehucht();
    assert.equal(totDeZaak(S, 0, dagVan('slachtmaand')), null);
  } finally {
    T.zetOptie('zaak', 'aan');
  }
});

test('je zoekt het uit: de zitting komt, en wie je aanklikt, vraag je ernaar', () => {
  const { S, D, Z, dag } = metZaak();
  antwoord(S, 'graanzak', 'begin', 0);
  assert.equal(Z.fase, 'onderzoek');
  assert.equal(Z.zitting, dag + T.ZAAK_INSTELLINGEN.zittingNa);
  assert.ok(T.heeftVlag(D, 'zaakLoopt'));
  assert.deepEqual(Z.weet.map((w) => w.id), ['beschuldiging'], 'wat de boer zegt, is een gerucht');
  // Ieder zijn gesprek.
  assert.equal(T.zaakGesprekVan(D, Z.dader.wezen), 'zaakDader');
  assert.equal(T.zaakGesprekVan(D, Z.verdachte.wezen), 'zaakVerdachte');
  assert.equal(T.zaakGesprekVan(D, Z.aanklager.wezen), 'zaakAanklager');
  if (Z.buur) assert.equal(T.zaakGesprekVan(D, Z.buur.wezen), 'zaakBuur');
  assert.equal(T.zaakGesprekVan(D, Z.ziek.wezen), null, 'een kind vraag je niet');
  assert.equal(T.zaakGesprekVan(D, D.schout), null);
  // Wat ze zeggen, komt op het papier, elk bij zijn soort.
  T.vraagNaarDeZaak(D, Z.verdachte.wezen);
  assert.match(T.vulWoordenIn(D, '{gevraagd}'), new RegExp(T.naamVanBewoner(Z.verdachte)));
  antwoord(S, 'zaakVerdachte', 'begin', 0);
  antwoord(S, 'zaakHerberg', 'begin', 0);
  const soorten = Object.fromEntries(T.zaakWetenPerSoort(D).map((s) => [s.soort, s.regels.length]));
  assert.deepEqual(soorten, { feit: 0, getuige: 1, gerucht: 3 });
  assert.ok(!T.heeftVlag(D, 'zaakBewijs'), 'wat de herbergierster zegt, wijst nog niet naar de dader');
  // De dader ontkent, tot je bewijs hebt.
  const dader = T.GESPREKKEN.zaakDader.knopen.begin;
  assert.equal(T.eersteDiePast(S, D, 'zaakDader', dader.tekst), dader.tekst[1]);
});

test('het spoor: wie erbij staat, ziet het, en dan is het bewijs', () => {
  const { S, D, Z } = metZaak();
  antwoord(S, 'graanzak', 'begin', 0);
  const h = D.schout;
  h.tx = Z.spoor[0].x + 5;
  h.ty = Z.spoor[0].y + 5;
  T.werkZaakBij(S, D);
  assert.ok(!T.heeftVlag(D, 'zaakSpoor'), 'van ver zie je het niet');
  h.tx = Z.spoor[0].x;
  h.ty = Z.spoor[0].y;
  T.werkZaakBij(S, D);
  assert.ok(T.heeftVlag(D, 'zaakSpoor'));
  assert.ok(T.heeftVlag(D, 'zaakBewijs'));
  assert.ok(berichten.at(-1).includes('spoor'));
});

test('de zitting: op haar dag staan ze op het plein, en komt de schout erbij, dan begint ze', () => {
  const { S, D, Z } = metZaak();
  antwoord(S, 'graanzak', 'begin', 0);
  for (let d = Z.dag + 1; d < Z.zitting; d++) {
    T.tikZaakDag(D, d);
    assert.equal(D.voorvallen.lopend, null, 'tot de zitting loopt er niets');
  }
  S.kalender.dag = Z.zitting;
  T.tikZaakDag(D, Z.zitting);
  const L = D.voorvallen.lopend;
  assert.equal(L.id, 'zitting');
  assert.ok(L.plein);
  // 's Ochtends nog niet; vanaf een uur ervoor staan ze er.
  S.kalender.dag = Z.zitting + 9 / 24;
  assert.equal(T.zaakAnker(D, Z.aanklager.wezen), null);
  assert.equal(T.voorvalVan(D, Z.aanklager.wezen), null);
  S.kalender.dag = Z.zitting + 13.5 / 24;
  const m = T.zittingPlek(D);
  const a = T.zaakAnker(D, Z.aanklager.wezen);
  assert.ok(a && T.afstand(a, m) <= 2, 'de aanklager staat bij het midden');
  assert.ok(T.zaakAnker(D, Z.verdachte.wezen));
  assert.equal(T.dagAnker(D, Z.aanklager.wezen).x, a.x, 'het dagritme stuurt hem erheen');
  assert.equal(T.voorvalVan(D, Z.aanklager.wezen), L, 'je kunt hem aanklikken');
  // Ver weg begint ze niet; bij het plein wel.
  aangesproken.length = 0;
  D.schout.tx = m.x + 20;
  D.schout.ty = m.y + 20;
  T.werkVoorvallenBij(S, D);
  assert.equal(aangesproken.length, 0);
  assert.ok(!Z.aanklager.wezen.zoektSchout, 'hij komt je niet zoeken');
  D.schout.tx = m.x;
  D.schout.ty = m.y + 2;
  D.schout.onderweg = false;
  T.werkVoorvallenBij(S, D);
  assert.equal(aangesproken.length, 1);
  assert.equal(aangesproken[0].id, 'zitting');
});

test('met bewijs noem je de dader; wie het verbergt, staat niet in het boek, en de inner leest het voor', () => {
  const { S, D, Z } = metZaak();
  antwoord(S, 'graanzak', 'begin', 0);
  T.zaakWeet(D, 'licht');
  S.kalender.dag = Z.zitting;
  T.tikZaakDag(D, Z.zitting);
  const begin = T.GESPREKKEN.zitting.knopen.begin;
  const noem = begin.keuzes.find((k) => k.naar === 'dader');
  assert.ok(T.zichtbareKeuzes(S, D, 'zitting', begin.keuzes).includes(noem), 'met bewijs kun je de dader noemen');
  antwoord(S, 'zitting', 'dader', 2); // verbergen
  assert.equal(Z.fase, 'af');
  assert.equal(Z.uitkomst, 'verberg');
  assert.equal(D.voorvallen.lopend, null);
  assert.deepEqual(Z.spoor, []);
  assert.ok(!T.heeftVlag(D, 'zaakLoopt') && !T.heeftVlag(D, 'zaakBewijs'), 'de vlaggen zijn weg');
  assert.deepEqual(Z.boek, { tekort: Z.zak, gelezen: false });
  const w = D.voorvallen.wacht.find((x) => x.id === 'zaakDank');
  assert.ok(w, 'het vervolg wacht');
  assert.equal(w.wie, Z.dader);
  assert.equal(w.ander, Z.ziek);
  // Op Sint-Maarten leest de inner het boek: één keer.
  const argwaan = D.inner ? D.inner.argwaan : 0;
  const gunst = D.bazen ? D.bazen.gunst : null;
  T.heerLeestHetBoek(D);
  assert.ok(D.inner.argwaan > argwaan);
  if (gunst != null && T.BAZEN_INSTELLINGEN.aan) assert.ok(D.bazen.gunst < gunst);
  const na = D.inner.argwaan;
  T.heerLeestHetBoek(D);
  assert.equal(D.inner.argwaan, na);
});

test('wie de verdachte straft, krijgt hem later terug; wie de dader straft, ziet zijn kind', () => {
  let { S, D, Z } = metZaak();
  antwoord(S, 'graanzak', 'begin', 1); // meteen straffen
  assert.equal(Z.uitkomst, 'straf');
  assert.ok(!Z.boek, 'een boete staat gewoon in het boek');
  const w = D.voorvallen.wacht.find((x) => x.id === 'zaakWrok');
  assert.equal(w.wie, Z.verdachte);
  assert.equal(w.ander, Z.dader);
  ({ S, D, Z } = metZaak());
  antwoord(S, 'graanzak', 'begin', 0);
  T.zaakWeet(D, 'spoor');
  T.tikZaakDag(D, Z.zitting);
  antwoord(S, 'zitting', 'dader', 0);
  assert.equal(Z.uitkomst, 'strafDader');
  assert.equal(D.voorvallen.wacht.find((x) => x.id === 'zaakKind').ander, Z.ziek);
});

test('sprak je de boer niet, dan komt de zitting er toch; kom je niet op de zitting, dan is de zaak af zonder vonnis', () => {
  const { S, D, Z, dag } = metZaak();
  const L = D.voorvallen.lopend;
  // Zijn tijd is om (js/voorvallen.js), en hij gaat voorbij.
  T.tikVoorvallenDag(D, L.tot);
  assert.equal(D.voorvallen.lopend, null);
  T.tikZaakDag(D, L.tot + 1);
  assert.equal(Z.fase, 'onderzoek');
  assert.ok(Z.zitting > dag);
  S.kalender.dag = Z.zitting;
  T.tikZaakDag(D, Z.zitting);
  assert.equal(D.voorvallen.lopend.id, 'zitting');
  T.tikVoorvallenDag(D, Z.zitting + 1); // de dag is om, en je kwam niet
  T.tikZaakDag(D, Z.zitting + 2);
  assert.equal(Z.fase, 'af');
  assert.equal(Z.uitkomst, 'geen');
  assert.ok(Z.boek, 'de zak staat nergens');
  assert.ok(D.voorvallen.wacht.some((x) => x.id === 'zaakWeer'));
});

test('een zaak blijft dezelfde na opslaan en laden', () => {
  const { S, D, Z } = metZaak();
  antwoord(S, 'graanzak', 'begin', 0);
  T.zaakWeet(D, 'licht');
  const S2 = T.leesSpel(T.bewaarSpel(S)).staat;
  const Z2 = S2.dorp.zaak;
  assert.equal(Z2.fase, 'onderzoek');
  assert.deepEqual(Z2.weet.map((w) => w.id), Z.weet.map((w) => w.id));
  assert.ok(S2.dorp.bewoners.mensen.includes(Z2.dader), 'de dader is een bewoner, niet een kopie');
  assert.equal(Z2.schuur, S2.dorp.gebouwen.find((g) => g === Z2.schuur));
});
