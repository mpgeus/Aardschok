// Het rapport van de raadsman, 's ochtends (js/ochtendrapport.js; werklijst vraag 75, 3a; Marcel, 1 okt: "A Ja dat is
// goed", en bij het nakijken "a ja b ja c ja"): het dagboek, wat erin staat, zijn rekenen, en hoe hij het brengt.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

const berichten = [];
const geopend = [];
T.ui = new Proxy({}, {
  get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : naam === 'toonBrief' ? (D, soort) => geopend.push(soort) : () => {}),
});
T.anim = { tekst() {}, wacht: () => new Promise(() => {}), loop: () => new Promise(() => {}), uitval: () => new Promise(() => {}) };

// Het proefdorp (test/grond.cjs) met drie boerderijen, op dag 2, en een vast zaad voor de vaardigheden van de boeren
// (js/raadsman.js: uit het zaad en het nummer van de boer). Met zaad 1 kan de tweede boer rekenen, de eerste niet, en de
// derde niets bijzonders.
function dorp(zaad = 1, opties = {}) {
  const S = proefDorp(T, { boerderijen: 3, ...opties }).S;
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad });
  // Het proefdorp eet graan, kaas en vlees uit de kar: dat is de status eentonig (vraag 154). Hier at het vier soorten,
  // zodat een stille dag stil is.
  S.dorp.behoeften.afwisseling = ['graan', 'vlees', 'kaas', 'groente'];
  return S;
}

const boeren = (S) => S.dorp.bewoners.mensen.filter((p) => T.isBoer(S.dorp, p)).sort((a, b) => a.id - b.id);
// De boer met dit rekenen: 'goed', 'slecht', of undefined (niets bijzonders).
const boerMet = (S, rekenen) => {
  const p = boeren(S).find((b) => T.vaardighedenVan(S.dorp, b).rekenen === rekenen);
  assert.ok(p, `een boer met rekenen ${rekenen}`);
  return p;
};

function metRaadsman(S, rekenen = 'goed') {
  const p = boerMet(S, rekenen);
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
  const S = dorp();
  const D = S.dorp;
  S.kalender.dag = 3.5;
  T.wijzigBevolking(D, -2, 'winter', 'The cold is harsh, for the wood has run out');
  T.wijzigBevolking(D, 4, 'groei');
  const [stierf, kwam] = D.dagboek.regels;
  assert.equal(stierf.soort, 'mensen');
  assert.deepEqual([stierf.dag, stierf.verschil, stierf.reden, stierf.waarom], [3, -2, 'winter', 'The cold is harsh, for the wood has run out']);
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
  const S = dorp();
  const D = S.dorp;
  assert.equal(nacht(S, 1), null);
  assert.ok(!T.rapportKlaar(D));
  const klaas = metRaadsman(S);
  const R = nacht(S, 2);
  assert.deepEqual([R.dag, R.door, R.gebracht, R.gelezen], [2, T.naamVanBewoner(klaas), false, false]);
  assert.equal(R.regels.length, 1);
  assert.match(R.regels[0], /^Nothing special\./);
  assert.ok(T.rapportKlaar(D), 'de knop Rapport');
  T.leesRapport(D);
  assert.ok(!T.rapportKlaar(D));
  assert.ok(R.gebracht, 'wie het las, hoeft het niet meer gebracht te krijgen');
});

test('wat erin staat: wie er ging en kwam, hoe het gaat sinds gisteren, en wat er speelt', () => {
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S); // deze raadsman kan rekenen: zijn getallen kloppen
  nacht(S, 10);
  S.kalender.dag = 10.5;
  T.wijzigVoorraad(D, 'graan', -12);
  T.wijzigVoorraad(D, 'hout', 3);
  T.wijzigBevolking(D, -1, 'vertrek', 'the village is not content enough');
  const weg = D.dagboek.regels[0].wie;
  T.wijzigBevolking(D, 2, 'groei'); // niet meer: het proefdorp heeft woonruimte voor 20, en zit op 17 (vol is een eigen regel)
  const nieuw = D.dagboek.regels[1].wie;
  assert.ok(T.zetWet(D, 'rantsoen', 'krap').kan);
  const R = nacht(S, 11);
  assert.deepEqual(R.regels.slice(0, 4), [
    `${T.hoofdletter(weg)}${weg.includes(',') ? ',' : ''} left: the village is not content enough.`,
    `New in the village: ${nieuw}.`,
    'Since yesterday there is 12 less grain and 3 more logs.',
    'There is hunger, for the rations are short.',
  ]);
  // Daarna wat de huizen missen (vraag 87): de wet liet het dorp zijn tevredenheid opnieuw tellen, dus het weet het al.
  assert.match(R.regels[4], /want a chapel within 40 tiles\.$/);
});

test('wat de boeren deden, wat hij besliste toen je weg was, en wie je zocht en niet sprak', () => {
  const S = dorp();
  const D = S.dorp;
  const klaas = metRaadsman(S);
  const [trijn, aaltje] = boeren(S).filter((p) => p !== klaas).map(T.naamVanBewoner);
  nacht(S, 20);
  S.kalender.dag = 20.5;
  T.schrijfOp(D, 'boeren', { tekst: 'The hay lasts the winter: the farmers kept all their cattle.' });
  T.schrijfOp(D, 'besluit', { door: T.naamVanBewoner(klaas), titel: 'the theft', antwoord: 'Make him give it back.', prijs: '' });
  T.schrijfOp(D, 'besluit', { door: trijn, titel: 'the fire', antwoord: 'Everyone helps.', prijs: '5 wood' });
  T.schrijfOp(D, 'voorbij', { wie: aaltje, titel: 'the brawl' });
  const R = nacht(S, 21);
  assert.deepEqual(R.regels.slice(0, 4), [
    'The hay lasts the winter: the farmers kept all their cattle.',
    'On the theft, I decided: "Make him give it back."',
    `On the fire, ${trijn} decided: "Everyone helps." (5 wood)`,
    `${aaltje} came to see you about the brawl, and did not get to speak to you.`,
  ]);
});

test('de winter: vanaf drie maanden ervoor zegt hij of het hout en het eten hem halen, en in de winter hoe lang nog', () => {
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S);
  T.zetVoorraad(D, 'hout', 0);
  T.zetVoorraad(D, 'graan', 50000);
  assert.ok(!nacht(S, dagVan('zomermaand', 1)).regels.some((r) => r.includes('winter')), 'in de zomer nog niet');
  const herfst = dagVan('herfstmaand', 1);
  const R = nacht(S, herfst);
  const v = T.houtVoorDeWinter(D, herfst);
  assert.ok(!v.haalt);
  assert.ok(R.regels.includes(`The firewood lasts ${v.dagen} of the ${v.winter} days of winter.`), R.regels.join(' | '));
  assert.ok(R.regels.includes('The food lasts the winter.'));
  // In de winter zelf: wanneer het op is.
  const winter = dagVan('louwmaand', 10);
  T.zetVoorraad(D, 'hout', 0);
  const W = nacht(S, winter);
  const w = T.houtVoorDeWinter(D, winter);
  assert.equal(w.tot, 0);
  assert.ok(W.regels.includes(`The firewood has run out, and the winter lasts ${w.winter} more days.`), W.regels.join(' | '));
  assert.ok(W.regels.includes('The food lasts to the end of winter.'));
});

test('wat er komt: de marskramer vandaag, en de raden van de rovers, zonder de toets erbij', () => {
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S);
  const komt = dagVan('oogstmaand', 15);
  T.zetVoorraad(D, 'hout', 50000); // anders gaat het over de winter
  T.zetVoorraad(D, 'graan', 50000);
  D.marskramer = { komtOp: komt - 1, weg: false, staat: false, bezoek: 0 };
  assert.ok(nacht(S, komt - 1).regels.includes('The peddler comes today.'));
  D.marskramer = null;
  D.rovers = Object.assign(T.nieuweRovers(), { laatsteAanval: komt + 3 });
  const rovers = nacht(S, komt + 4).regels;
  assert.ok(rovers.includes('The robbers are coming back. A watch house gives you two men to fight at your side.'), 'zonder de toets erbij');
});

test('zijn rekenen: wie kan rekenen, zegt het precies; wie het niet bijzonder kan, rondt af; wie niet kan rekenen, zit ernaast', () => {
  const S = dorp();
  const D = S.dorp;
  const [klaas, trijn, aaltje] = [boerMet(S, 'goed'), boerMet(S, undefined), boerMet(S, 'slecht')];
  assert.equal(T.vaardighedenVan(D, klaas).rekenen, 'goed');
  assert.equal(T.vaardighedenVan(D, trijn).rekenen, undefined);
  assert.equal(T.vaardighedenVan(D, aaltje).rekenen, 'slecht');
  assert.deepEqual(T.rekenaarVan(D, klaas, 5)(37), { n: 37, tekst: '37' });
  assert.deepEqual(T.rekenaarVan(D, trijn, 5)(37), { n: 35, tekst: 'about 35' });
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
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S, 'slecht');
  const herfst = dagVan('herfstmaand', 1);
  T.zetVoorraad(D, 'graan', 50000);
  let mis = 0;
  for (let d = herfst; d < herfst + 30; d++) {
    // Zoveel hout dat het de winter net niet haalt: 80 van de 90 dagen.
    const v0 = T.houtVoorDeWinter(D, d);
    T.zetVoorraad(D, 'hout', Math.max(0, (v0.stook - v0.erbij) * (v0.winter - 10) - v0.erbij * v0.tot));
    const v = T.houtVoorDeWinter(D, d);
    const R = nacht(S, d);
    const zegtHaalt = R.regels.some((r) => /^The firewood( and the food)? lasts? the winter\./.test(r));
    if (zegtHaalt !== v.haalt) mis++;
  }
  assert.ok(mis > 0, 'wie niet kan rekenen, zit er soms naast');
});

test('een rapport dat je niet las, gaat op in het nieuwe; een gelezen niet, en hij onthoudt niet alles', () => {
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S);
  nacht(S, 5);
  S.kalender.dag = 5.5;
  T.wijzigBevolking(D, -1, 'winter', 'The hunger is harsh, for the food has run out');
  const eerst = nacht(S, 6).regels[0];
  assert.match(eerst, /^The hunger is harsh/);
  assert.equal(nacht(S, 7).regels[0], eerst, 'niet gelezen: het staat er nog');
  T.leesRapport(D);
  assert.ok(!nacht(S, 8).regels.includes(eerst), 'gelezen: weg');
  for (let i = 0; i < 20; i++) T.schrijfOp(D, 'voorbij', { wie: `Wie ${i}`, titel: 'de diefstal' });
  const vol = nacht(S, 9);
  assert.equal(vol.gebeurd.length, T.OCHTENDRAPPORT_INSTELLINGEN.gebeurdOnthouden);
  assert.equal(vol.gebeurd[vol.gebeurd.length - 1].wie, 'Wie 19', 'de laatste');
});

test('hij brengt het: hij vertrekt zo vroeg dat hij aan je deur staat als je opstaat, en komt naar je toe als je buiten bent', () => {
  const S = dorp();
  const D = S.dorp;
  const klaas = metRaadsman(S);
  const e = klaas.wezen;
  const h = D.schout;
  const dag = 10;
  nacht(S, dag);
  const ind = T.dagindeling(dag);
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const deur = T.deurVan(D.wereld, huis);
  // In het proefdorp staat de schout waar het lege begin hem zette; hier staat hij buiten bij zijn huis, aan zijn deur.
  Object.assign(h, { x: deur.x, y: deur.y, tx: deur.x, ty: deur.y, pad: [], onderweg: false });
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
  assert.equal(T.rapportAnker(D, boerMet(S, undefined).wezen), null);
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
  const S = dorp();
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
  const S = dorp();
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
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S);
  S.kalender.dag = 2;
  T.tikGebouwenDag(D, 2);
  assert.equal(D.ochtendrapport.dag, 2);
  assert.equal(D.dagboek.dag, 2);
  S.kalender.dag = 2.5;
  T.wijzigBevolking(D, -1, 'winter', 'The cold is harsh, for the wood has run out');
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

// Wat blijft zoals het was, zegt hij niet elke dag (werklijst vraag 76; Marcel: "a ja b ja c nu").
// Een dag verder, en het rapport gelezen: dan weet je wat erin stond.
function gelezenNacht(S, dag) {
  const R = nacht(S, dag);
  T.leesRapport(S.dorp);
  return R;
}

test('een oorzaak zegt hij als hij begint, om de week zolang hij blijft, en als hij voorbij is', () => {
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S);
  gelezenNacht(S, 10);
  assert.ok(T.zetWet(D, 'rantsoen', 'krap').kan);
  assert.ok(gelezenNacht(S, 11).regels.includes('There is hunger, for the rations are short.'));
  for (let d = 12; d < 18; d++) assert.ok(!gelezenNacht(S, d).regels.some((r) => /hunger/.test(r)), `dag ${d}`);
  assert.ok(gelezenNacht(S, 18).regels.some((r) => /honger|hunger/.test(r) && /, for seven days now: /.test(r)));
  assert.ok(!gelezenNacht(S, 19).regels.some((r) => /hunger/.test(r)));
  assert.ok(T.zetWet(D, 'rantsoen', 'gewoon').kan);
  assert.ok(gelezenNacht(S, 20).regels.includes('The hunger is over.'));
  assert.ok(!gelezenNacht(S, 21).regels.some((r) => /hunger/.test(r)));
});

test('las je het rapport niet, dan zegt hij het de volgende dag nog eens', () => {
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S);
  gelezenNacht(S, 10);
  assert.ok(T.zetWet(D, 'rantsoen', 'krap').kan);
  assert.ok(nacht(S, 11).regels.includes('There is hunger, for the rations are short.'));
  assert.ok(gelezenNacht(S, 12).regels.includes('There is hunger, for the rations are short.'), 'niet gelezen: nog eens');
  assert.ok(!gelezenNacht(S, 13).regels.some((r) => /hunger/.test(r)));
});

test('de winter zegt hij als hij omslaat of flink verschuift, en anders om de week', () => {
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S); // deze raadsman kan rekenen
  T.zetVoorraad(D, 'graan', 50000);
  T.zetVoorraad(D, 'hout', 0);
  const herfst = dagVan('herfstmaand', 1);
  const eerst = gelezenNacht(S, herfst).regels;
  assert.ok(eerst.some((r) => /^The firewood lasts \d+ of the 90 days of winter\.$/.test(r)), eerst.join(' | '));
  assert.ok(eerst.includes('The food lasts the winter.'));
  assert.ok(!gelezenNacht(S, herfst + 1).regels.some((r) => /winter/.test(r)), 'een dag later: hetzelfde, dus niets');
  // Genoeg hout: het slaat om, en dat zegt hij meteen (het eten niet: dat blijft hetzelfde).
  T.zetVoorraad(D, 'hout', 50000);
  const om = gelezenNacht(S, herfst + 2).regels.filter((r) => /winter/.test(r));
  assert.deepEqual(om, ['The firewood lasts the winter.']);
  // Een week nadat hij het zei: het eten nog eens.
  assert.ok(!gelezenNacht(S, herfst + 6).regels.some((r) => /winter/.test(r)));
  assert.deepEqual(gelezenNacht(S, herfst + 7).regels.filter((r) => /winter/.test(r)), ['The food lasts the winter.']);
  // Weer zonder hout (een brand): het slaat weer om, en dat zegt hij meteen.
  T.zetVoorraad(D, 'hout', 0);
  assert.ok(gelezenNacht(S, herfst + 8).regels.some((r) => /^The firewood lasts/.test(r)));
});

// ---------------------------------------------------------------------------------------------
// Wat de huizen missen, en wie er doorgroeide (werklijst vraag 86, a, en 87)
// ---------------------------------------------------------------------------------------------

// Het proefdorp heeft boerderijen en een hut, maar geen dorpelingen (vlees of vis, de put, de herberg, bier). Dus een dorp
// met een huis en een herberg erbij (de optie `gebouwen`) en bier in de voorraad, en het gezin van de hut trekt in het huis:
// drie boerderijen en een huis, zoals het gehucht van vroeger met zijn jonge gezin.
function dorpMetHuis() {
  const S = dorp(1, { gebouwen: ['huis', 'herberg'] });
  const D = S.dorp;
  T.zetVoorraad(D, 'bier', 100);
  T.zetVoorraad(D, 'vlees', 0); // het gezouten vlees uit de kar (vraag 154, D1) is op, zoals na de eerste maand
  const hut = D.gebouwen.find((g) => g.soort === 'hut');
  const huis = D.gebouwen.find((g) => g.soort === 'huis');
  for (const p of D.bewoners.mensen) if (p.huis === hut) p.huis = huis;
  return S;
}

// Een kapel die alle huizen bereikt die er een willen (de drie boerderijen en het huis): zijn midden is het midden van die
// huizen, binnen 40 tegels van elk van hen. Alleen de boekhouding: hij staat niet getekend.
const kapelVoorIedereen = (D) => {
  const midden = (g) => {
    const r = T.voetVanGebouw(g);
    return { x: r.x + r.b / 2, y: r.y + r.h / 2 };
  };
  const huizen = D.gebouwen.filter((g) => T.standVan(g) && D.bewoners.mensen.some((p) => p.huis === g));
  const m = { x: huizen.reduce((n, g) => n + midden(g).x, 0) / huizen.length, y: huizen.reduce((n, g) => n + midden(g).y, 0) / huizen.length };
  const kapel = { soort: 'kapel', x: Math.round(m.x) - 1, y: Math.round(m.y) - 1, voet: { b: 2, h: 2 }, klaar: true };
  D.gebouwen.push(kapel);
  for (const g of huizen) assert.ok(T.afstand(midden(kapel), midden(g)) <= T.WENSEN_INSTELLINGEN.kring.kapel, 'binnen zijn kring');
  return kapel;
};
const wensRegelsVan = (R) => R.regels.filter((r) => / wants? |^Nobody lacks|^All the houses/.test(r));

test('wat de huizen missen: als het begint, niet elke dag, om de week, en als het ophoudt', () => {
  const S = dorpMetHuis();
  const D = S.dorp;
  metRaadsman(S);
  T.tikBehoeftenDag(D, 10);
  let R = nacht(S, 11);
  assert.deepEqual(wensRegelsVan(R), [
    'Three farms and a house want a chapel within 40 tiles.',
    'A house wants a well within 12 tiles.',
    'A house wants meat or fish: build a fisherman or a hunter.',
  ], 'wat helpt, zonder de toets; het zwaarste eerst');
  T.leesRapport(D);
  assert.deepEqual(wensRegelsVan(nacht(S, 12)), [], 'de volgende dag niet nog eens');
  T.leesRapport(D);
  kapelVoorIedereen(D);
  assert.deepEqual(wensRegelsVan(nacht(S, 13)), ['Nobody lacks a chapel any more.'], 'een plek telt meteen');
  T.leesRapport(D);
  // Om de week zegt hij wat er nog steeds gemist wordt.
  R = nacht(S, 11 + T.OCHTENDRAPPORT_INSTELLINGEN.herhaalNa);
  assert.deepEqual(wensRegelsVan(R), ['A house wants a well within 12 tiles.', 'A house wants meat or fish: build a fisherman or a hunter.']);
});

test('wat de huizen missen: verandert wat helpt, dan zegt hij het; en hooguit zoveel per dag, de rest later', () => {
  const S = dorpMetHuis();
  const D = S.dorp;
  metRaadsman(S);
  T.tikBehoeftenDag(D, 10);
  const IN = T.OCHTENDRAPPORT_INSTELLINGEN;
  const oud = IN.wensenPerRapport;
  IN.wensenPerRapport = 1;
  try {
    assert.deepEqual(wensRegelsVan(nacht(S, 11)), ['Three farms and a house want a chapel within 40 tiles.']);
    T.leesRapport(D);
    assert.deepEqual(wensRegelsVan(nacht(S, 12)), ['A house wants a well within 12 tiles.']);
    T.leesRapport(D);
    assert.deepEqual(wensRegelsVan(nacht(S, 13)), ['A house wants meat or fish: build a fisherman or a hunter.']);
    T.leesRapport(D);
  } finally {
    IN.wensenPerRapport = oud;
  }
  D.gebouwen.push({ soort: 'visser', x: 0, y: 0, voet: { b: 3, h: 3 }, klaar: false });
  assert.deepEqual(wensRegelsVan(nacht(S, 14)), ['A house wants meat or fish: the fisherman is being built.']);
});

test('heeft elk huis wat het wil, dan zegt hij dat één keer', () => {
  const S = dorpMetHuis();
  const D = S.dorp;
  metRaadsman(S);
  kapelVoorIedereen(D);
  const huis = D.gebouwen.find((g) => g.soort === 'huis');
  const r = T.voetVanGebouw(huis);
  D.gebouwen.push({ soort: 'put', x: r.x, y: r.y + r.h, voet: { b: 1, h: 1 }, klaar: true });
  T.zetVoorraad(D, 'vis', 20);
  T.tikBehoeftenDag(D, 10);
  assert.ok(D.gebouwen.filter((g) => g.wensen).every((g) => g.wensen.alles), 'alles, in elk huis');
  assert.deepEqual(wensRegelsVan(nacht(S, 11)), ['All the houses have what they want.']);
  T.leesRapport(D);
  assert.deepEqual(wensRegelsVan(nacht(S, 12)), [], 'één keer');
});

test('wie er doorgroeide: "De hut van ... is een huis geworden", in wat er gebeurde', () => {
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S);
  const hut = D.gebouwen.find((g) => g.soort === 'hut');
  const wie = D.bewoners.mensen.find((p) => p.huis === hut).naam;
  // Een put vlak bij de hut (alleen de boekhouding): dan heeft hij alles, en groeit hij door.
  const r = T.voetVanGebouw(hut);
  D.gebouwen.push({ soort: 'put', x: r.x, y: r.y + r.h, voet: { b: 1, h: 1 }, klaar: true });
  // Binnen, zoals 's nachts: wie voor zijn deur staat, daar groeit het huis niet overheen.
  for (const p of D.bewoners.mensen) if (p.huis === hut && p.wezen) p.wezen.binnen = true;
  T.zetVoorraad(D, 'hout', 100);
  let dag = 30;
  nacht(S, dag);
  for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen; i++) T.tikBehoeftenDag(D, ++dag);
  assert.equal(hut.soort, 'huis', 'een maand alles: doorgegroeid');
  const R = nacht(S, dag + 1);
  assert.ok(R.regels.includes(`The hut of ${wie} has become a house: they now belong with the villagers.`), R.regels.join(' | '));
});

// Met niveaus (werklijst vraag 77, stap 2): wordt het erger, dan zegt hij het meteen, en wordt het minder ook.
test('een status die erger wordt of minder, zegt hij meteen: droogte, ernstige droogte, en weer droogte', () => {
  const S = dorp();
  const D = S.dorp;
  metRaadsman(S);
  const I = T.WEER_INSTELLINGEN;
  const begin = dagVan('zomermaand', 1);
  gelezenNacht(S, begin);
  D.weer = { vandaag: 'zon', droog: I.droogteVanaf, tekort: I.droogteVanaf, verlies: 0 };
  assert.ok(gelezenNacht(S, begin + 1).regels.some((r) => /^It is dry, for it has not rained for .* days\.$/.test(r)));
  assert.ok(!gelezenNacht(S, begin + 2).regels.some((r) => /dry|drought/i.test(r)), 'zolang het zo blijft, niet elke dag');
  D.weer.tekort = I.ernstigVanaf;
  assert.ok(gelezenNacht(S, begin + 3).regels.some((r) => /^The drought is severe, for/.test(r)));
  D.weer.tekort = I.droogteVanaf;
  assert.ok(gelezenNacht(S, begin + 4).regels.includes('The drought is no longer severe, but it is still dry.'));
  D.weer.tekort = 0;
  assert.ok(gelezenNacht(S, begin + 5).regels.includes('The drought is over.'));
});
