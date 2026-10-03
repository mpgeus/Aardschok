// De ondernemers (js/ondernemers.js; werklijst vraag 104, Marcel, 3 okt: "Stel er is een ondernemende inwoner die wapens
// wil maken etc", en "104 a b c d ja"): wie iets wil beginnen wat niemand mist, uit zichzelf. Eerst de wapenmaker: na
// een aanval van de rovers, in een dorp, komt hij het vragen. Ja: de militie slaat harder, maar het is verboden. Nee: hij
// neemt het je kwalijk, doet het stiekem in zijn kelder, en na twee keer nee trekt hij weg.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });

// Het echte gehucht, zoals een nieuw spel begint, stil en met een vast zaad (zoals in test/verzoeken.test.cjs), als
// dorp, met hout en goud genoeg, en een houthakker (anders vraagt iemand die eerst, js/raad.js).
function dorp() {
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
  T.S = S;
  const D = S.dorp;
  D.trede = 'dorp';
  T.zetVoorraad(D, 'hout', 100);
  T.zetVoorraad(D, 'goud', 100);
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'houthakker', T.deurVan(D.wereld, huis));
  assert.ok(T.plaatsGebouw(D, 'houthakker', plek.x, plek.y).gelukt);
  berichten.length = 0;
  return S;
}

// Een nacht, zoals het spel hem tikt (js/gebouwen.js).
function nacht(S, dag) {
  S.kalender.dag = dag + 0.3;
  S.kalender.stil = [];
  T.tikGebouwenDag(S.dorp, dag);
}
// Een instelling even anders, en daarna terug.
function met(blok, sleutel, waarde, doe) {
  const was = blok[sleutel];
  blok[sleutel] = waarde;
  try {
    return doe();
  } finally {
    blok[sleutel] = was;
  }
}
// Iedereen die het kan, is ondernemer: zo hangt een toets niet aan wie het zaad toevallig koos.
const allemaal = (doe) => met(T.ONDERNEMERS_INSTELLINGEN, 'kans', 1, doe);
const lopend = (D) => D.voorvallen && D.voorvallen.lopend;
function zeg(S, ja) {
  const D = S.dorp;
  const L = lopend(D);
  T.doeGevolg(S, D, T.GESPREKKEN[L.id].knopen.begin.keuzes[ja ? 0 : 1].doe);
  T.voorvalBeantwoord(D, L.id);
  return L;
}
// De rovers kwamen net (js/rovers.js zet dat bij een aanval).
function roversKwamen(D, dag) {
  D.rovers = D.rovers || T.nieuweRovers();
  D.rovers.laatsteAanval = dag;
}

test('wie ondernemer is, komt uit het zaad en wie hij is: zo blijft het, en een ander spel heeft anderen', () => {
  const S = dorp();
  const D = S.dorp;
  const wie = () => D.bewoners.mensen.filter((p) => T.ondernemingVan(D, p)).map((p) => p.id);
  const eerst = wie();
  assert.deepEqual(wie(), eerst, 'hetzelfde zaad, dezelfde ondernemers');
  for (const p of D.bewoners.mensen) {
    if (!T.ondernemingVan(D, p)) continue;
    assert.equal(p.leeftijd, 'volwassen');
    assert.ok(!p.wie && !p.schout, 'geen boer, en de schout niet');
  }
  // Over veel spellen is ongeveer `kans` van wie het kan, ondernemer.
  let kan = 0;
  let is = 0;
  const lot = D.lot.zaad;
  for (let z = 1; z <= 200; z++) {
    D.lot.zaad = z;
    for (const p of D.bewoners.mensen) {
      if (p.leeftijd !== 'volwassen' || p.wie || p.schout || (p.hoofd && p.hoofd.schout)) continue;
      kan++;
      if (T.ondernemingVan(D, p)) is++;
    }
  }
  D.lot.zaad = lot;
  assert.ok(Math.abs(is / kan - T.ONDERNEMERS_INSTELLINGEN.kans) < 0.04, `${is} van ${kan}`);
});

test('na een aanval van de rovers vraagt de wapenmaker het, in een dorp, met zijn eigen woorden', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  nacht(S, 1);
  assert.ok(!lopend(D) || lopend(D).id !== 'wapenverzoek', 'zonder rovers en zonder smidse wil niemand wapens');
  if (lopend(D)) T.voorvalBeantwoord(D, lopend(D).id);
  roversKwamen(D, 2);
  D.verzoeken.volgende = 0;
  nacht(S, 3);
  const L = lopend(D);
  assert.ok(L && L.id === 'wapenverzoek', `de wapenmaker vraagt het (${L && L.id})`);
  assert.equal(L.bouw.soort, 'wapenmaker');
  assert.equal(L.bouw.eigen, 'wapens');
  assert.equal(T.ondernemingVan(D, L.wie), 'wapens');
  const tekst = T.vulWoordenIn(D, T.GESPREKKEN.wapenverzoek.knopen.begin.tekst[0].zeg);
  assert.match(tekst, /ik wil wapens maken/);
  assert.match(tekst, /Na de rovers/);
  assert.match(tekst, /12 hout en 14 goud/);
  assert.match(T.vulWoordenIn(D, T.VOORVALLEN.wapenverzoek.roep), /onder vier ogen/);
  // In een gehucht nog niet: de wapenmaker hoort bij het dorp.
  T.voorvalBeantwoord(D, L.id);
  D.trede = 'gehucht';
  D.verzoeken.volgende = 0;
  nacht(S, 4);
  assert.ok(!lopend(D) || lopend(D).id !== 'wapenverzoek', 'in een gehucht niet');
}));

test('met een smidse vraagt hij het ook zonder rovers', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'smidse', T.deurVan(D.wereld, huis));
  const smidse = T.plaatsGebouw(D, 'smidse', plek.x, plek.y).instantie;
  smidse.klaar = true;
  nacht(S, 1);
  assert.equal(lopend(D) && lopend(D).id, 'wapenverzoek');
  assert.match(lopend(D).bouw.waarom, /De smid maakt hamers/);
}));

test('ja: de wapenmaker komt er, hij is er de meester en je dankbaar, en hij maakt wapens van hout en ijzer', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  roversKwamen(D, 0);
  nacht(S, 1);
  const L = zeg(S, true);
  const p = L.wie;
  const g = D.gebouwen.find((x) => x.soort === 'wapenmaker');
  assert.ok(g, 'de wapenmaker staat er');
  assert.equal(g.meester, p);
  assert.ok(Math.hypot(g.x - T.deurVan(D.wereld, p.huis).x, g.y - T.deurVan(D.wereld, p.huis).y) < 12, 'naast zijn huis');
  assert.ok(T.huisStemming(p.huis, 1) > 0, 'zijn huis is je dankbaar');
  assert.equal(D.verzoeken.eigen[p.id].ja, 1);
  assert.ok(!T.eigenVerzoeken(D, 2).some((x) => x.wie === p), 'wie ja hoorde, vraagt het niet meer');
  assert.ok(!T.eigenVerzoeken(D, 2).length, 'en er is er een: niemand anders vraagt het');
  g.klaar = true;
  T.zetVoorraad(D, 'ijzer', 10);
  for (let dag = 2; dag < 6; dag++) nacht(S, dag);
  assert.ok(D.voorraad.wapens > 0, `hij maakt wapens (${D.voorraad.wapens})`);
  assert.equal(T.wapensInHetDorp(D), Math.floor(D.voorraad.wapens));
}));

test('nee: zijn huis neemt het je kwalijk, hij smeedt stiekem in zijn kelder, en na twee keer trekt hij weg', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  roversKwamen(D, 0);
  nacht(S, 1);
  const nee = T.GESPREKKEN.wapenverzoek.knopen.begin.keuzes[1].doe;
  const ja = T.GESPREKKEN.wapenverzoek.knopen.begin.keuzes[0].doe;
  assert.match(T.prijsVanKeuze(D, nee).tekst, /neemt het je kwalijk/, 'het venster zegt wat nee doet');
  assert.match(T.prijsVanKeuze(D, ja).tekst, /verboden/, 'en dat ja verboden is');
  const L = zeg(S, false);
  const p = L.wie;
  assert.ok(T.huisStemming(p.huis, 2) < 0, 'zijn huis neemt het je kwalijk');
  assert.match(T.huisNadraagtTekst(p.huis, 2), /neemt je je nee kwalijk/, 'en het briefje bij zijn huis zegt het');
  assert.equal(D.verzoeken.eigen[p.id].nee, 1);
  assert.ok(p.huis.stiekem, 'hij doet het stiekem, in zijn kelder');
  assert.ok(berichten.some((t) => /hameren/.test(t)), 'en je hoort het');
  assert.ok(!D.gebouwen.some((g) => g.soort === 'wapenmaker'));
  // Elke dag een paar wapens, die de militie ook heeft.
  for (let dag = 2; dag < 10; dag++) nacht(S, dag);
  assert.ok(p.huis.stiekem.wapens > 1, `${p.huis.stiekem.wapens} wapens in zijn kelder`);
  assert.equal(T.wapensInHetDorp(D), Math.floor(p.huis.stiekem.wapens + ((D.voorraad.wapens) || 0)));
  // Niet binnen naNee dagen opnieuw; daarna wel, en een tweede nee: hij trekt weg, met zijn gezin, het bos in.
  for (let dag = 10; dag < 31; dag++) {
    nacht(S, dag);
    assert.ok(!lopend(D) || lopend(D).id !== 'wapenverzoek', `niet op dag ${dag}`);
    if (lopend(D)) T.voorvalBeantwoord(D, lopend(D).id);
  }
  roversKwamen(D, 31);
  let tweede = null;
  for (let dag = 31; dag < 40 && !tweede; dag++) {
    nacht(S, dag);
    if (lopend(D) && lopend(D).id === 'wapenverzoek') tweede = lopend(D);
    else if (lopend(D)) T.voorvalBeantwoord(D, lopend(D).id);
  }
  assert.ok(tweede && tweede.wie === p, 'hij vraagt het nog eens');
  // Het venster zegt het vooraf.
  assert.match(T.prijsVanKeuze(D, T.GESPREKKEN.wapenverzoek.knopen.begin.keuzes[1].doe).tekst, /trekt weg/);
  const hoofd = p.hoofd || p;
  const voor = D.bewoners.mensen.slice();
  const bevolking = D.bevolking;
  zeg(S, false);
  const weg = voor.filter((x) => !D.bewoners.mensen.includes(x));
  assert.ok(weg.includes(p), 'hij is weg');
  assert.ok(weg.every((x) => x === p || x === hoofd || x.hoofd === hoofd), 'met zijn gezin, en niemand anders');
  assert.equal(D.bevolking, bevolking - weg.length);
  assert.ok(D.rovers.bende.some((l) => l.id === p.id), 'en kan als rover terugkomen');
  assert.ok(berichten.some((t) => /twee keer nee/.test(t)));
  nacht(S, 41);
  assert.ok(!D.gebouwen.some((g) => g.stiekem), 'zijn kelder is stil');
}));

test('de inner die een wapenmaker ziet, wordt argwanend; één keer per jaar', () => {
  const S = dorp();
  const D = S.dorp;
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'wapenmaker', T.deurVan(D.wereld, huis));
  const g = T.plaatsGebouw(D, 'wapenmaker', plek.x, plek.y).instantie;
  g.klaar = true;
  D.inner = T.nieuweInner();
  T.innerKomt(D, 1, false);
  const voor = D.inner.argwaan;
  const naast = { x: plek.x - 1, y: plek.y + 1 };
  T.innerKijkt(D, naast);
  assert.ok(D.inner.bezoek.gebouwen.has(g), 'hij zag hem');
  assert.ok(Math.abs(D.inner.argwaan - voor - T.ONDERNEMERS_INSTELLINGEN.wapens.argwaanGezien) < 1e-9);
  assert.ok(berichten.some((t) => /De inner blijft staan bij de wapenmaker/.test(t)));
  T.innerKijkt(D, naast);
  assert.ok(Math.abs(D.inner.argwaan - voor - T.ONDERNEMERS_INSTELLINGEN.wapens.argwaanGezien) < 1e-9, 'niet twee keer');
  // Zijn rapport onthoudt het: een tweede bezoek dit jaar maakt niet nog eens argwanend.
  T.innerVertrekt(D);
  const na = D.inner.argwaan;
  D.inner.bezoek = null;
  T.innerKomt(D, 20, true);
  T.innerKijkt(D, naast);
  assert.equal(D.inner.argwaan, na);
});

test('op Sint-Maarten: wat de inner zag, laat de heer verzegelen, met de wapens weg en een boete volgend jaar', () => {
  const S = dorp();
  const D = S.dorp;
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'wapenmaker', T.deurVan(D.wereld, huis));
  const g = T.plaatsGebouw(D, 'wapenmaker', plek.x, plek.y).instantie;
  g.klaar = true;
  T.zetVoorraad(D, 'wapens', 6);
  // Niemand zag hem: dan weet de heer van niets, tenzij zijn soldaten het hele dorp doorzoeken.
  assert.deepEqual(T.heerVindtVerboden(D, false), []);
  D.inner = T.nieuweInner();
  T.innerKomt(D, 1, false);
  T.innerKijkt(D, { x: plek.x - 1, y: plek.y + 1 });
  T.innerVertrekt(D);
  D.heer = T.nieuweHeer();
  D.heer.bezoek = { staat: true, weg: false, wezens: [], betaald: null };
  const argwaan = D.inner.argwaan;
  assert.deepEqual(T.heerVindtVerboden(D, false), ['de wapenmaker']);
  assert.ok(g.verzegeld, 'verzegeld');
  assert.equal(D.voorraad.wapens || 0, 0, 'de wapens neemt hij mee');
  assert.ok(D.inner.argwaan > argwaan);
  assert.equal(D.heer.erbij, T.ONDERNEMERS_INSTELLINGEN.wapens.boete, 'de boete wacht tot de schatting betaald is');
  assert.ok(berichten.some((t) => /Wapens, schout\? In Mijn dorp\?/.test(t)));
  assert.deepEqual(T.heerVindtVerboden(D, true), [], 'wat verzegeld is, vindt hij niet nog eens');
  // Verzegeld: geen handen, en hij maakt niets.
  T.zetVoorraad(D, 'ijzer', 10);
  nacht(S, 2);
  assert.equal(g.handen, 0);
  assert.equal(D.voorraad.wapens || 0, 0);
  assert.match(T.gebouwToestand(D, g), /verzegeld door de heer/);
  // Na de schatting staat de boete op de rekening van volgend jaar.
  T.heerRekentErbij(D, 0);
  D.heer.bezoek.betaald = { deel: 1 };
  T.heerRekentErbij(D, 5);
  assert.equal(D.heer.schuld, 5, 'na de betaling komt een boete meteen op de schuld');
});

test('de schatting betaald: de boete voor de wapens komt bij de schuld van volgend jaar', () => {
  const S = dorp();
  const D = S.dorp;
  D.heer = T.nieuweHeer();
  D.heer.bezoek = { staat: true, weg: false, wezens: [], betaald: null };
  D.heer.brief = { dag: 0, eis: T.eisVanDeHeer(D) };
  T.heerRekentErbij(D, 20);
  const g = T.betaalHeer(D, { ...T.eisVanDeHeer(D).per });
  assert.equal(D.heer.schuld, g.schuld + 20);
  assert.equal(D.heer.erbij, 0);
});

test('de soldaten vinden een kelder waar stiekem gesmeed wordt, als ze daar zoeken', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  roversKwamen(D, 0);
  nacht(S, 1);
  const p = zeg(S, false).wie;
  for (let dag = 2; dag < 10; dag++) nacht(S, dag);
  D.heer = T.nieuweHeer();
  D.heer.bezoek = { staat: true, weg: false, wezens: [], betaald: null };
  const plek = T.verstopPlekVan(D, p.huis);
  assert.equal(T.zoekOpPlek(D, plek, 0.999), null, 'buiten de kans vinden ze niets');
  assert.ok(p.huis.stiekem);
  const tekst = T.zoekOpPlek(D, plek, 0);
  assert.match(tekst, /de wapens in de kelder van/);
  assert.ok(!p.huis.stiekem, 'zijn werkplaats is weg');
  assert.equal(T.wapensInHetDorp(D), 0);
  assert.equal(D.heer.erbij, T.ONDERNEMERS_INSTELLINGEN.wapens.boete);
  // Hij kan het nog eens vragen: hij hoorde maar één keer nee.
  assert.ok(T.eigenVerzoeken(D, 20).some((x) => x.wie === p));
}));

test('wie van de militie een wapen heeft, slaat harder', () => {
  const S = dorp();
  const D = S.dorp;
  T.zetVoorraad(D, 'wapens', 1);
  const a = {};
  const b = {};
  assert.equal(T.bewapen(D, [a, b]), 1);
  assert.ok(a.gewapend && !b.gewapend);
  const extra = T.ONDERNEMERS_INSTELLINGEN.wapens.schade;
  assert.deepEqual(T.slagSchade(a), T.SLAAN.schade.map((n) => n + extra));
  assert.deepEqual(T.slagSchade(b), T.SLAAN.schade);
  assert.deepEqual(T.slagSchade(S.schout), T.SLAAN.schade, 'de schout zelf niet');
});

test('ben je weg, dan beslist de raadsman het wapenverzoek, zoals elk verzoek', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  roversKwamen(D, 0);
  nacht(S, 1);
  const L = lopend(D);
  assert.equal(L.id, 'wapenverzoek');
  const raadsman = T.raadsmanKandidaten(D).find((p) => p !== L.wie);
  T.kiesRaadsman(D, raadsman);
  const keuze = T.raadsmanKeuze(D, raadsman, L.id);
  assert.ok(keuze && (keuze.doe.bouw || keuze.doe.weiger), 'hij kiest ja of nee');
  assert.ok(T.raadsmanBeslist(D));
  assert.ok(keuze.doe.bouw ? D.gebouwen.some((g) => g.soort === 'wapenmaker') : D.verzoeken.eigen[L.wie.id].nee === 1);
}));

test('wat een ondernemer onthoudt, wat zijn huis nadraagt en wat verzegeld is, gaat mee in een opgeslagen spel', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  roversKwamen(D, 0);
  nacht(S, 1);
  const p = zeg(S, false).wie;
  nacht(S, 2);
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'smidse', T.deurVan(D.wereld, huis));
  const g = T.plaatsGebouw(D, 'smidse', plek.x, plek.y).instantie;
  g.verzegeld = { dag: 2 };
  const terug = T.leesSpel(T.bewaarSpel(S)).staat.dorp;
  const p2 = terug.bewoners.mensen.find((x) => x.id === p.id);
  assert.equal(terug.verzoeken.eigen[p.id].nee, 1);
  assert.deepEqual(p2.huis.stiekem, p.huis.stiekem);
  assert.equal(T.huisStemming(p2.huis, 3), T.huisStemming(p.huis, 3));
  assert.deepEqual(terug.gebouwen.find((x) => x.soort === 'smidse').verzegeld, { dag: 2 });
}));
