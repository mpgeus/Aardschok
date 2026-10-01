// Het rapport van de raadsman, 's ochtends (js/ochtendrapport.js; werklijst vraag 75, 3a; Marcel, 1 okt: "A Ja dat is
// goed", en bij het nakijken "a ja b ja c ja"): het dagboek, wat erin staat, zijn rekenen, en hoe hij het brengt.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
const geopend = [];
T.ui = new Proxy({}, {
  get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : naam === 'toonBrief' ? (D, soort) => geopend.push(soort) : () => {}),
});
T.anim = { tekst() {}, wacht: () => new Promise(() => {}), loop: () => new Promise(() => {}), uitval: () => new Promise(() => {}) };

// Het echte gehucht, zoals een nieuw spel begint, stil en met een vast zaad (zoals in test/raadsman.test.cjs). Met zaad
// 7 kan Klaas rekenen, Aaltje niet, en Trijn niets bijzonders.
function gehucht(zaad = 7) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad });
  return S;
}

const boer = (S, naam) => S.dorp.bewoners.mensen.find((p) => T.isBoer(p.wezen) && T.naamVanBewoner(p) === naam);

function metRaadsman(S, naam = 'Klaas') {
  const p = boer(S, naam);
  assert.ok(T.kiesRaadsman(S.dorp, p).kan);
  return p;
}

// De dag (vanaf 1 lentemaand, dag 0) van een datum in het eerste jaar.
function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(`geen ${dagVanMaand} ${maand}`);
}

// De nacht naar dag `dag`: de raadsman maakt zijn rapport, zoals de dagtik dat als laatste doet.
function nacht(S, dag) {
  S.kalender.dag = dag;
  T.tikOchtendrapportDag(S.dorp, dag);
  return S.dorp.ochtendrapport;
}

test('het dagboek schrijft op wie er kwam, stierf of wegtrok, met wie het zijn; elke nacht begint het opnieuw', () => {
  const S = gehucht();
  const D = S.dorp;
  S.kalender.dag = 3.5;
  T.wijzigBevolking(D, -2, 'winter', 'De kou is hard, want het hout is op');
  T.wijzigBevolking(D, 4, 'groei');
  const [stierf, kwam] = D.dagboek.regels;
  assert.equal(stierf.soort, 'mensen');
  assert.deepEqual([stierf.dag, stierf.verschil, stierf.reden, stierf.waarom], [3, -2, 'winter', 'De kou is hard, want het hout is op']);
  // Wie het zijn, in dezelfde woorden als het bericht.
  assert.ok(stierf.wie && berichten.some((b) => b.includes(stierf.wie)), stierf.wie);
  assert.deepEqual([kwam.verschil, kwam.reden], [4, 'groei']);
  assert.ok(kwam.wie);
  // Het begin telt niet: dat is geen gebeurtenis.
  assert.equal(D.dagboek.regels.length, 2);
  nacht(S, 4);
  assert.deepEqual(D.dagboek.regels, []);
  assert.equal(D.dagboek.dag, 4);
});

test('zonder raadsman geen rapport; met een raadsman elke nacht een, en een stille dag is één regel', () => {
  const S = gehucht();
  const D = S.dorp;
  assert.equal(nacht(S, 1), null);
  assert.ok(!T.rapportKlaar(D));
  metRaadsman(S);
  const R = nacht(S, 2);
  assert.deepEqual([R.dag, R.door, R.gebracht, R.gelezen], [2, 'Klaas', false, false]);
  assert.equal(R.regels.length, 1);
  assert.match(R.regels[0], /^Niets bijzonders\./);
  assert.ok(T.rapportKlaar(D), 'de knop Rapport');
  T.leesRapport(D);
  assert.ok(!T.rapportKlaar(D));
  assert.ok(R.gebracht, 'wie het las, hoeft het niet meer gebracht te krijgen');
});

test('wat erin staat: wie er ging en kwam, hoe het gaat sinds gisteren, en wat er speelt', () => {
  const S = gehucht();
  const D = S.dorp;
  metRaadsman(S); // Klaas kan rekenen: zijn getallen kloppen
  nacht(S, 10);
  S.kalender.dag = 10.5;
  T.wijzigVoorraad(D, 'graan', -12);
  T.wijzigVoorraad(D, 'hout', 3);
  T.wijzigBevolking(D, -1, 'vertrek', 'het dorp is niet tevreden genoeg');
  const weg = D.dagboek.regels[0].wie;
  T.wijzigBevolking(D, 4, 'groei');
  const nieuw = D.dagboek.regels[1].wie;
  assert.ok(T.zetWet(D, 'rantsoen', 'krap').kan);
  const R = nacht(S, 11);
  assert.deepEqual(R.regels, [
    `${T.hoofdletter(weg)}${weg.includes(',') ? ',' : ''} trok weg: het dorp is niet tevreden genoeg.`,
    `Nieuw in het dorp: ${nieuw}.`,
    'Sinds gisteren is er 12 graan minder en 3 hout meer.',
    'Er is honger, want het rantsoen is krap.',
  ]);
});

test('wat de boeren deden, wat hij besliste toen je weg was, en wie je zocht en niet sprak', () => {
  const S = gehucht();
  const D = S.dorp;
  metRaadsman(S);
  nacht(S, 20);
  S.kalender.dag = 20.5;
  T.schrijfOp(D, 'boeren', { tekst: 'Het hooi haalt de winter: de boeren hielden al hun vee.' });
  T.schrijfOp(D, 'besluit', { door: 'Klaas', titel: 'de diefstal', antwoord: 'Laat hem het teruggeven.', prijs: '' });
  T.schrijfOp(D, 'besluit', { door: 'Aaltje', titel: 'de brand', antwoord: 'Iedereen helpt.', prijs: '5 hout' });
  T.schrijfOp(D, 'voorbij', { wie: 'Gerrit', titel: 'de vechtpartij' });
  const R = nacht(S, 21);
  assert.deepEqual(R.regels.slice(0, 4), [
    'Het hooi haalt de winter: de boeren hielden al hun vee.',
    'Over de diefstal besliste ik: "Laat hem het teruggeven."',
    'Over de brand besliste Aaltje: "Iedereen helpt." (5 hout)',
    'Gerrit zocht je over de vechtpartij, en sprak je niet.',
  ]);
});

test('de winter: vanaf drie maanden ervoor zegt hij of het hout en het eten hem halen, en in de winter hoe lang nog', () => {
  const S = gehucht();
  const D = S.dorp;
  metRaadsman(S);
  T.zetVoorraad(D, 'hout', 0);
  T.zetVoorraad(D, 'graan', 50000);
  assert.ok(!nacht(S, dagVan('zomermaand', 1)).regels.some((r) => r.includes('winter')), 'in de zomer nog niet');
  const herfst = dagVan('herfstmaand', 1);
  const R = nacht(S, herfst);
  const v = T.houtVoorDeWinter(D, herfst);
  assert.ok(!v.haalt);
  assert.ok(R.regels.includes(`Het hout haalt ${v.dagen} van de ${v.winter} dagen van de winter.`), R.regels.join(' | '));
  assert.ok(R.regels.includes('Het eten haalt de winter.'));
  // In de winter zelf: wanneer het op is.
  const winter = dagVan('louwmaand', 10);
  T.zetVoorraad(D, 'hout', 0);
  const W = nacht(S, winter);
  const w = T.houtVoorDeWinter(D, winter);
  assert.equal(w.tot, 0);
  assert.ok(W.regels.includes(`Het hout is op, en de winter duurt nog ${w.winter} dagen.`), W.regels.join(' | '));
  assert.ok(W.regels.includes('Het eten haalt het eind van de winter.'));
});

test('wat er komt: de marskramer, de heer of de inner vandaag, en de inner een paar dagen vooraf', () => {
  const S = gehucht();
  const D = S.dorp;
  metRaadsman(S);
  const komt = dagVan(T.INNER_INSTELLINGEN.komt.maand, T.INNER_INSTELLINGEN.komt.dag);
  T.zetVoorraad(D, 'hout', 50000); // anders gaat het over de winter
  T.zetVoorraad(D, 'graan', 50000);
  const R = nacht(S, komt - 2);
  assert.ok(R.regels.includes('De inner komt over 2 dagen. Wat hij niet ziet, telt de heer niet.'), R.regels.join(' | '));
  D.marskramer = { komtOp: komt - 1, weg: false, staat: false, bezoek: 0 };
  assert.ok(nacht(S, komt - 1).regels.includes('Vandaag komt de marskramer.'));
  D.marskramer = null;
  D.rovers = Object.assign(T.nieuweRovers(), { laatsteAanval: komt + 3 });
  const rovers = nacht(S, komt + 4).regels;
  assert.ok(rovers.includes('De rovers komen terug. Een wachthuis geeft je twee man die meevechten.'), 'zonder de toets erbij');
});

test('zijn rekenen: wie kan rekenen, zegt het precies; wie het niet bijzonder kan, rondt af; wie niet kan rekenen, zit ernaast', () => {
  const S = gehucht();
  const D = S.dorp;
  const [klaas, trijn, aaltje] = ['Klaas', 'Trijn', 'Aaltje'].map((n) => boer(S, n));
  assert.equal(T.vaardighedenVan(D, klaas).rekenen, 'goed');
  assert.equal(T.vaardighedenVan(D, trijn).rekenen, undefined);
  assert.equal(T.vaardighedenVan(D, aaltje).rekenen, 'slecht');
  assert.deepEqual(T.rekenaarVan(D, klaas, 5)(37), { n: 37, tekst: '37' });
  assert.deepEqual(T.rekenaarVan(D, trijn, 5)(37), { n: 35, tekst: "zo'n 35" });
  assert.deepEqual(T.rekenaarVan(D, trijn, 5)(7), { n: 7, tekst: '7' }, 'onder de tien telt iedereen');
  // Wie niet kan rekenen: tot 30% ernaast, elke dag anders, maar op dezelfde dag hetzelfde (de speeltest).
  const gezegd = [];
  for (let d = 0; d < 40; d++) {
    const g = T.rekenaarVan(D, aaltje, d)(100);
    assert.ok(g.n >= 70 && g.n <= 130, `${g.n}`);
    assert.deepEqual(T.rekenaarVan(D, aaltje, d)(100), g);
    gezegd.push(g.n);
  }
  assert.ok(new Set(gezegd).size > 3, gezegd.join(' '));
});

test('wie niet kan rekenen, zegt dat het hout de winter haalt terwijl het dat niet doet, of andersom', () => {
  const S = gehucht();
  const D = S.dorp;
  metRaadsman(S, 'Aaltje');
  const herfst = dagVan('herfstmaand', 1);
  T.zetVoorraad(D, 'graan', 50000);
  let mis = 0;
  for (let d = herfst; d < herfst + 30; d++) {
    // Zoveel hout dat het de winter net niet haalt: 80 van de 90 dagen.
    const v0 = T.houtVoorDeWinter(D, d);
    T.zetVoorraad(D, 'hout', Math.max(0, (v0.stook - v0.erbij) * (v0.winter - 10) - v0.erbij * v0.tot));
    const v = T.houtVoorDeWinter(D, d);
    const R = nacht(S, d);
    const zegtHaalt = R.regels.some((r) => /^Het hout( en het eten)? halen? de winter\./.test(r) || r === 'Het hout haalt de winter.');
    if (zegtHaalt !== v.haalt) mis++;
  }
  assert.ok(mis > 0, 'Aaltje zit er soms naast');
});

test('een rapport dat je niet las, gaat op in het nieuwe; een gelezen niet, en hij onthoudt niet alles', () => {
  const S = gehucht();
  const D = S.dorp;
  metRaadsman(S);
  nacht(S, 5);
  S.kalender.dag = 5.5;
  T.wijzigBevolking(D, -1, 'winter', 'De honger is hard, want het eten is op');
  const eerst = nacht(S, 6).regels[0];
  assert.match(eerst, /^De honger is hard/);
  assert.equal(nacht(S, 7).regels[0], eerst, 'niet gelezen: het staat er nog');
  T.leesRapport(D);
  assert.ok(!nacht(S, 8).regels.includes(eerst), 'gelezen: weg');
  for (let i = 0; i < 20; i++) T.schrijfOp(D, 'voorbij', { wie: `Wie ${i}`, titel: 'de diefstal' });
  const vol = nacht(S, 9);
  assert.equal(vol.gebeurd.length, T.OCHTENDRAPPORT_INSTELLINGEN.gebeurdOnthouden);
  assert.equal(vol.gebeurd[vol.gebeurd.length - 1].wie, 'Wie 19', 'de laatste');
});

test('hij brengt het: hij vertrekt zo vroeg dat hij aan je deur staat als je opstaat, en komt naar je toe als je buiten bent', () => {
  const S = gehucht();
  const D = S.dorp;
  const klaas = metRaadsman(S);
  const e = klaas.wezen;
  const h = D.schout;
  const dag = 10;
  nacht(S, dag);
  const ind = T.dagindeling(dag);
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const deur = T.deurVan(D.wereld, huis);
  const looptijd = T.looptijdVan(D.wereld, klaas, e.thuis, { x: deur.x, y: deur.y, straal: 1 }, 'rapport');
  assert.ok(looptijd > 0.5, `hij woont een eind weg: ${looptijd} uur`);
  const vertrek = ind.opstaan - looptijd - T.OCHTENDRAPPORT_INSTELLINGEN.marge;
  const om = (uur) => (S.kalender.dag = dag + uur / 24);
  // Vóór zijn vertrek slaapt hij, zoals iedereen.
  om(vertrek - 0.1);
  assert.equal(T.dagAnker(D, e).binnen, true);
  // Dan naar de deur van de schout, die nog slaapt.
  h.binnen = true;
  om(vertrek + 0.05);
  assert.deepEqual(T.dagAnker(D, e), { x: deur.x, y: deur.y, straal: 1 });
  // Is de schout buiten bij zijn huis, dan naar hem toe.
  h.binnen = false;
  om(ind.opstaan + 0.1);
  assert.deepEqual(T.dagAnker(D, e), { x: h.tx, y: h.ty, straal: 1 });
  // Wie geen raadsman is, loopt zijn eigen dag.
  assert.equal(T.rapportAnker(D, boer(S, 'Trijn').wezen), null);
  // Naast elkaar, en geen van beiden loopt: hij geeft het, en het papier gaat open.
  Object.assign(e, { tx: h.tx + 1, ty: h.ty, x: h.tx + 1, y: h.ty, binnen: false, pad: [] });
  S.slaap = { tot: dag + 1 };
  T.werkOchtendrapportBij(S, D);
  assert.equal(D.ochtendrapport.gebracht, false, 'niet terwijl je slaapt');
  S.slaap = null;
  S.modus = 'dialoog';
  T.werkOchtendrapportBij(S, D);
  assert.equal(D.ochtendrapport.gebracht, false, 'niet terwijl je met iemand praat');
  S.modus = 'verkennen';
  geopend.length = 0;
  T.werkOchtendrapportBij(S, D);
  assert.equal(D.ochtendrapport.gebracht, true);
  assert.deepEqual(geopend, ['rapport']);
  // Gebracht: hij gaat weer zijns weegs.
  assert.equal(T.rapportAnker(D, e), null);
});

test('was je er niet vóór het werk begint, dan gaat hij aan het werk en ligt het klaar', () => {
  const S = gehucht();
  const D = S.dorp;
  const klaas = metRaadsman(S);
  const dag = 10;
  nacht(S, dag);
  S.kalender.dag = dag + (T.dagindeling(dag).werkBegin + 0.01) / 24;
  assert.equal(T.rapportAnker(D, klaas.wezen), null);
  geopend.length = 0;
  T.werkOchtendrapportBij(S, D);
  assert.deepEqual(geopend, []);
  assert.ok(T.rapportKlaar(D), 'onder de knop Rapport');
});

test('de spelregel "Het rapport" uit: geen rapport, en de raadsman loopt zijn dag zoals vóór 1 okt', () => {
  const S = gehucht();
  const D = S.dorp;
  const klaas = metRaadsman(S);
  const IN = T.OCHTENDRAPPORT_INSTELLINGEN;
  IN.aan = false;
  try {
    assert.equal(nacht(S, 10), null);
    S.kalender.dag = 10 + (T.dagindeling(10).opstaan - 0.2) / 24;
    assert.equal(T.rapportAnker(D, klaas.wezen), null);
    assert.equal(T.dagAnker(D, klaas.wezen).binnen, true);
  } finally {
    IN.aan = true;
  }
  assert.ok(T.OPTIES.find((o) => o.id === 'rapport'), 'de spelregel bestaat');
});

test('het rapport is het laatste van de dag, alleen jouw dorp krijgt er een, en bewaren en laden houdt het', () => {
  const S = gehucht();
  const D = S.dorp;
  metRaadsman(S);
  S.kalender.dag = 2;
  T.tikGebouwenDag(D, 2);
  assert.equal(D.ochtendrapport.dag, 2);
  assert.equal(D.dagboek.dag, 2);
  S.kalender.dag = 2.5;
  T.wijzigBevolking(D, -1, 'winter', 'De kou is hard, want het hout is op');
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const terug = T.leesSpel(tekst);
  assert.ok(terug.gelukt);
  const D2 = terug.staat.dorp;
  assert.deepEqual(D2.ochtendrapport.regels, D.ochtendrapport.regels);
  assert.deepEqual(D2.dagboek.regels, D.dagboek.regels);
  // Een ander dorp dan het jouwe: niemand brengt het een rapport.
  D.ander = true;
  assert.equal(nacht(S, 3), null);
});
