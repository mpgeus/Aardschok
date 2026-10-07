// De ondernemers (js/ondernemers.js; werklijst vraag 104, Marcel, 3 okt: "Stel er is een ondernemende inwoner die wapens
// wil maken etc", en "104 a b c d ja"): wie iets wil beginnen wat niemand mist, uit zichzelf. Eerst de wapenmaker: na
// een aanval van de rovers, in een dorp, komt hij het vragen. Ja: de militie slaat harder, en dat mag (Marcel, 7 okt:
// "Wapens zijn niet meer verboden"; werklijst vraag 131). Nee: hij neemt het je kwalijk, en na twee keer nee trekt hij
// weg.
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
  // In de buurt van zijn huis, met een looppad rondom (js/gebouwen.js; Marcel, 3 okt): tot dan stond hij er op 10 tegels
  // klem tussen een huis en een eik, en nu op de eerste plek met drie tegels eromheen.
  assert.ok(Math.hypot(g.x - T.deurVan(D.wereld, p.huis).x, g.y - T.deurVan(D.wereld, p.huis).y) < 25, 'in de buurt van zijn huis');
  assert.ok(T.looppadOm(D, T.voetVanGebouw(g), T.GEBOUWEN_INSTELLINGEN.looppad), 'met een looppad rondom');
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

test('nee: zijn huis neemt het je kwalijk, en na twee keer trekt hij weg', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  roversKwamen(D, 0);
  nacht(S, 1);
  const nee = T.GESPREKKEN.wapenverzoek.knopen.begin.keuzes[1].doe;
  const ja = T.GESPREKKEN.wapenverzoek.knopen.begin.keuzes[0].doe;
  assert.match(T.prijsVanKeuze(D, nee).tekst, /neemt het je kwalijk/, 'het venster zegt wat nee doet');
  assert.doesNotMatch(T.prijsVanKeuze(D, ja).tekst, /verboden|heer/, 'ja is niet verboden (vraag 131)');
  const L = zeg(S, false);
  const p = L.wie;
  assert.ok(T.huisStemming(p.huis, 2) < 0, 'zijn huis neemt het je kwalijk');
  assert.match(T.huisNadraagtTekst(p.huis, 2), /neemt je je nee kwalijk/, 'en het briefje bij zijn huis zegt het');
  assert.equal(D.verzoeken.eigen[p.id].nee, 1);
  assert.ok(!D.gebouwen.some((g) => g.soort === 'wapenmaker'));
  // Hij smeedt niet stiekem in zijn kelder: er valt niets te verbergen (tot 7 okt wel, vraag 131).
  for (let dag = 2; dag < 10; dag++) nacht(S, dag);
  assert.equal(T.wapensInHetDorp(D), 0, 'zonder werkplaats geen wapens');
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
  // Wie bij zijn gezin hoort, vooraf: wie wegtrekt, laat de banden van wie blijft opnieuw leggen (js/bewoners.js).
  const hoofd = p.hoofd || p;
  const voor = D.bewoners.mensen.slice();
  const gezin = new Set(voor.filter((x) => x === p || x === hoofd || x.hoofd === hoofd));
  const bevolking = D.bevolking;
  zeg(S, false);
  const weg = voor.filter((x) => !D.bewoners.mensen.includes(x));
  assert.ok(weg.includes(p), 'hij is weg');
  assert.ok(weg.every((x) => gezin.has(x)), 'met zijn gezin, en niemand anders');
  assert.equal(D.bevolking, bevolking - weg.length);
  assert.ok(D.rovers.bende.some((l) => l.id === p.id), 'en kan als rover terugkomen');
  assert.ok(berichten.some((t) => /twee keer nee/.test(t)));
}));

// Wapens zijn niet verboden (Marcel, 7 okt: "Het is logisch dat er wapens zijn om de stad te verdedigen. Alleen weerstand
// tegen de heer is inacceptabel"; werklijst vraag 131). Tot dan maakte een wapenmaker de inner argwanend, en liet de heer
// hem op Sint-Maarten verzegelen, met de wapens weg, 30 gunst eraf en 20 goud boete.
test('de inner die een wapenmaker ziet, wordt er niet argwanend van, en de heer laat hem op Sint-Maarten staan', () => {
  const S = dorp();
  const D = S.dorp;
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'wapenmaker', T.deurVan(D.wereld, huis));
  const g = T.plaatsGebouw(D, 'wapenmaker', plek.x, plek.y).instantie;
  g.klaar = true;
  T.zetVoorraad(D, 'wapens', 6);
  D.inner = T.nieuweInner();
  T.innerKomt(D, 1, false);
  const argwaan = D.inner.argwaan;
  T.innerKijkt(D, { x: plek.x - 1, y: plek.y + 1 });
  assert.ok(D.inner.bezoek.gebouwen.has(g), 'hij zag hem');
  assert.equal(D.inner.argwaan, argwaan, 'en wordt er niet argwanend van');
  T.innerVertrekt(D);
  // Op Sint-Maarten, ook als zijn soldaten het hele dorp doorzoeken: de wapens blijven, en het kost niets.
  D.inner.argwaan = T.INNER_INSTELLINGEN.doorzoekenVanaf;
  D.heer = T.nieuweHeer();
  D.heer.bezoek = { staat: false, weg: false, wezens: [], betaald: null };
  const gunst = T.bazenNu(D).gunst;
  const schuld = D.heer.schuld || 0;
  T.heerStaatErOp(D);
  assert.equal(D.voorraad.wapens, 6, 'de wapens blijven');
  assert.equal(T.bazenNu(D).gunst, gunst, 'zijn gunst blijft');
  assert.equal(D.heer.schuld || 0, schuld, 'geen boete');
  assert.ok(!berichten.some((t) => /Wapens, schout/.test(t)));
  // En hij werkt gewoon door.
  T.zetVoorraad(D, 'ijzer', 10);
  nacht(S, 2);
  nacht(S, 3);
  assert.ok(D.voorraad.wapens > 6, `hij maakt wapens (${D.voorraad.wapens})`);
});

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

test('wat een ondernemer onthoudt en wat zijn huis nadraagt, gaat mee in een opgeslagen spel', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  roversKwamen(D, 0);
  nacht(S, 1);
  const p = zeg(S, false).wie;
  nacht(S, 2);
  const terug = T.leesSpel(T.bewaarSpel(S)).staat.dorp;
  const p2 = terug.bewoners.mensen.find((x) => x.id === p.id);
  assert.equal(terug.verzoeken.eigen[p.id].nee, 1);
  assert.ok(T.huisStemming(p.huis, 3) < 0);
  assert.equal(T.huisStemming(p2.huis, 3), T.huisStemming(p.huis, 3));
}));

// ── De tweede herberg ──

// Wie een herberg wil beginnen: in dit dorp vanaf `vanaf` mensen; in de toets meteen.
const metHerberg = (doe) => allemaal(() => met(T.ONDERNEMERS_INSTELLINGEN.herberg, 'vanaf', 0, doe));
function herbergVerzoek(S) {
  const D = S.dorp;
  for (let dag = 1; dag < 8; dag++) {
    nacht(S, dag);
    const L = lopend(D);
    if (L && L.id === 'herbergverzoek') return L;
    if (L) T.voorvalBeantwoord(D, L.id);
  }
  return null;
}

test('in een dorp met één herberg wil iemand er een tweede beginnen, vanaf zoveel mensen', () => allemaal(() => {
  const S = dorp();
  const D = S.dorp;
  assert.ok(D.bevolking < T.ONDERNEMERS_INSTELLINGEN.herberg.vanaf);
  assert.ok(!T.eigenVerzoeken(D, 1).some((x) => x.wil === 'herberg'), 'een klein dorp heeft genoeg aan één');
  met(T.ONDERNEMERS_INSTELLINGEN.herberg, 'vanaf', 0, () => {
    const L = herbergVerzoek(S);
    assert.ok(L, 'nu vraagt iemand het');
    assert.equal(L.bouw.soort, 'herberg');
    assert.equal(L.bouw.eigen, 'herberg');
    assert.equal(T.ondernemingVan(D, L.wie), 'herberg');
    const tekst = T.vulWoordenIn(D, T.GESPREKKEN.herbergverzoek.knopen.begin.tekst[0].zeg);
    assert.match(tekst, /ik wil een tweede herberg beginnen/);
    assert.match(tekst, /16 hout en 12 goud/);
    const [ja, nee] = T.GESPREKKEN.herbergverzoek.knopen.begin.keuzes.map((k) => T.prijsVanKeuze(D, k.doe).tekst);
    assert.match(ja, /is boos, en brouwt 60 dagen niet/);
    assert.match(nee, /\+10 bier/);
    assert.match(nee, /neemt het je kwalijk/);
    assert.match(nee, /is je dankbaar/);
    // In een gehucht nog niet, en met twee herbergen ook niet.
    D.trede = 'gehucht';
    assert.ok(!T.eigenVerzoeken(D, 9).some((x) => x.wil === 'herberg'));
  });
}));

test('ja: de tweede herberg komt er, en de herbergierster brouwt een tijd niet', () => metHerberg(() => {
  const S = dorp();
  const D = S.dorp;
  const eerste = T.herbergVan(D);
  const L = herbergVerzoek(S);
  zeg(S, true);
  const tweede = D.gebouwen.find((g) => g.soort === 'herberg' && g !== eerste);
  assert.ok(tweede, 'er komt een tweede herberg');
  assert.equal(tweede.meester, L.wie);
  assert.ok(eerste.weigert, 'de herbergierster is boos');
  assert.ok(berichten.some((t) => /Een tweede herberg, schout\?/.test(t)));
  assert.ok(!T.eigenVerzoeken(D, 10).some((x) => x.wil === 'herberg'), 'met twee vraagt niemand een derde');
  // Ze brouwt niet tot haar tijd om is.
  const dag = L.dag + 1;
  T.zetVoorraad(D, 'bier', 0);
  nacht(S, dag);
  assert.equal(eerste.werkte, 0);
  assert.match(T.gebouwToestand(D, eerste), /is boos op je/);
  nacht(S, eerste.weigert.tot);
  assert.ok(!(eerste.stilWant || '').includes('boos'), 'daarna weer wel');
}));

test('nee: de herbergierster is je dankbaar, met een vat bier', () => metHerberg(() => {
  const S = dorp();
  const D = S.dorp;
  const L = herbergVerzoek(S);
  const bier = D.voorraad.bier;
  zeg(S, false);
  assert.equal(D.voorraad.bier, bier + 10);
  assert.ok(berichten.some((t) => /zet een vat bier voor het dorp klaar/.test(t)));
  assert.ok(T.huisStemming(L.wie.huis, L.dag + 1) < 0, 'en wie het vroeg, neemt het je kwalijk');
  assert.ok(!T.herbergVan(D).weigert);
}));

test('met twee herbergen gaat elke gast naar de herberg die het dichtst bij zijn huis staat', () => {
  const S = dorp();
  const D = S.dorp;
  const w = D.bewoners.wereld;
  const eerste = T.herbergVan(D);
  // De tweede, zo ver mogelijk van de eerste: bij het huis dat er het verst vandaan staat.
  const deur1 = T.deurVan(w, eerste);
  const ver = D.gebouwen.filter((g) => T.standVan(g)).sort((a, b) => T.afstand(T.deurVan(w, b), deur1) - T.afstand(T.deurVan(w, a), deur1))[0];
  const plek = T.plekVoor(D, 'herberg', T.deurVan(w, ver));
  const tweede = T.plaatsGebouw(D, 'herberg', plek.x, plek.y).instantie;
  tweede.klaar = true;
  T.zetVoorraad(D, 'bier', 200);
  assert.deepEqual(T.herbergenVan(D), [eerste, tweede]);
  // Een winteravond, als iedereen vaker gaat; over een paar avonden.
  const gasten = [];
  for (let dag = 300; dag < 306; dag++) for (const p of T.herbergGasten(D, dag)) gasten.push({ p, g: T.herbergVanGast(D, p, dag) });
  assert.ok(gasten.some((x) => x.g === tweede), 'er gaan er naar de tweede');
  assert.ok(gasten.some((x) => x.g === eerste), 'en naar de eerste');
  for (const { p, g } of gasten) {
    const naar = (h) => T.looptijdVan(w, p, T.deurVan(w, p.huis), Object.assign({ straal: 0 }, T.deurVan(w, h)), h === eerste ? 'herberg' : 'herberg1');
    assert.ok(naar(g) <= naar(g === eerste ? tweede : eerste) + 1e-9, `${T.naamVanBewoner(p)} gaat naar de dichtste`);
  }
  // Licht en tekst per herberg.
  assert.match(T.herbergTekst(D, tweede), /bier/);
});
