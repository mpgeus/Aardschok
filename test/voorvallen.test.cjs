// De voorvallen (js/voorvallen.js; werklijst vraag 65, Marcel, 29 sep: "A ja"): om de paar dagen komt iemand uit het
// dorp de schout zoeken met een vraag, een ruzie of een ramp, en je kiest uit twee of drie antwoorden, elk met een
// prijs die je vooraf ziet. In de winter vaker, en sommige komen terug.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
// Deze toetsen gaan over het spel waarin jij bouwt (de spelregel "Wie bouwt" op "Jij bouwt"; werklijst vraag 103):
// de gelote voorvallen, zonder bouwverzoeken ertussen. Hoe het gaat als de mensen het vragen, staat in test/verzoeken.test.cjs.
T.zetOptie('wieBouwt', 'jij');

const berichten = [];
const aangesproken = [];
T.ui = new Proxy({}, {
  get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : naam === 'spreekAan' ? (S, e, id) => aangesproken.push({ e, id }) : () => {}),
});
T.anim = { tekst() {}, wacht: () => new Promise(() => {}), loop: () => new Promise(() => {}), uitval: () => new Promise(() => {}) };

// Het echte gehucht, zoals een nieuw spel begint, stil en met een vast zaad (zoals in test/heervaart.test.cjs).
function gehucht() {
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
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad: 7 });
  S.dorp.voorvallen = T.nieuweVoorvallen();
  return S;
}

// Een voorval dat nu loopt, over mensen die erbij passen, op dag `dag`.
function metVoorval(S, id, dag = 10) {
  S.kalender.dag = dag;
  const v = T.VOORVALLEN[id];
  const oud = { vervolg: v.vervolg, als: v.als };
  Object.assign(v, { vervolg: false, als: undefined });
  const mensen = T.voorvalKan(S.dorp, id, dag);
  Object.assign(v, oud);
  assert.ok(mensen, `er is iemand voor "${id}"`);
  return T.beginVoorval(S.dorp, id, mensen.wie, mensen.ander, dag);
}

// Het eerste antwoord van een voorval dat het gesprek sluit en waarvoor genoeg is, zoals een speler kiest.
const knoopVan = (id) => T.GESPREKKEN[id].knopen[T.GESPREKKEN[id].start];
const antwoorden = (id) => knoopVan(id).keuzes;

// Wat een antwoord mag doen: wat elk gesprek kan, en wat js/voorvallen.js erbij doet (het kop-commentaar daar).
const WAREN = ['graan', 'hout', 'wol', 'bier', 'ijzer', 'zout', 'vlees', 'vis', 'kaas', 'hooi'];
const GEVOLGEN = new Set(['zetVlag', 'wisVlag', 'geef', 'neem', 'goud', ...WAREN, 'tevreden', 'gunst', 'vertrouwen', 'argwaan', 'verban', 'sterfkans', 'gezin', 'voorval', 'feest', 'bouw', 'weiger', 'ontgin', 'wolven', 'hek', 'zaak', 'weet', ...Object.keys(T.VEE)]);

test('elk voorval heeft een gesprek onder zijn naam, en elk antwoord gaat ergens heen en doet wat het spel kent', () => {
  for (const [id, v] of Object.entries(T.VOORVALLEN)) {
    const g = T.GESPREKKEN[id];
    assert.ok(g, `${id}: er is geen gesprek T.GESPREKKEN.${id}`);
    assert.equal(g.naam, '{wie}', `${id}: wie het zegt, vult het spel in`);
    assert.ok(g.knopen[g.start], `${id}: het begint bij een knoop die er is`);
    assert.ok(['recht', 'verzoek', 'ramp', 'kans', 'feest', 'heer'].includes(v.soort), `${id}: een soort`);
    assert.ok(v.titel, `${id}: een titel, voor de balk`);
    for (const [kid, k] of Object.entries(g.knopen)) {
      assert.ok(k.keuzes.length >= 1, `${id}, ${kid}: je kunt iets antwoorden`);
      for (const keuze of k.keuzes) {
        assert.ok(keuze.sluit || g.knopen[keuze.naar], `${id}, ${kid}: "${keuze.zeg}" gaat ergens heen`);
        for (const wat of Object.keys(keuze.doe || {})) assert.ok(GEVOLGEN.has(wat), `${id}: "${keuze.zeg}" doet ${wat}, en dat kent het spel niet`);
        const doe = keuze.doe || {};
        if (doe.verban) assert.ok(['wie', 'ander'].includes(doe.verban), `${id}: verban is 'wie' of 'ander'`);
      }
    }
  }
});

test('een vervolg bestaat, komt ergens vandaan, en {ander} staat alleen waar het over iemand gaat', () => {
  // De vervolgen van de graanzak roept js/zaak.js aan, naar het vonnis.
  const vervolgen = new Set(Object.values(T.ZAAK_INSTELLINGEN.vervolg).map((v) => v.id));
  for (const [id, g] of Object.entries(T.GESPREKKEN)) {
    if (!T.VOORVALLEN[id]) continue;
    for (const k of Object.values(g.knopen)) {
      for (const keuze of k.keuzes) {
        for (const naar of [].concat((keuze.doe && keuze.doe.voorval) || [])) {
          if (naar === 'niets') continue;
          assert.ok(T.VOORVALLEN[naar] && T.VOORVALLEN[naar].vervolg, `${id}: het vervolg "${naar}" is een voorval dat alleen als vervolg komt`);
          vervolgen.add(naar);
        }
      }
    }
  }
  for (const [id, v] of Object.entries(T.VOORVALLEN)) {
    if (v.vervolg) assert.ok(vervolgen.has(id), `${id} komt alleen als vervolg, maar niets roept het aan`);
    const tekst = JSON.stringify(T.GESPREKKEN[id]);
    if (!v.vervolg && !v.ander) assert.doesNotMatch(tekst, /\{ander\}/, `${id} gaat over niemand anders, maar noemt {ander}`);
  }
});

test('elk voorval is te beantwoorden: er is altijd een antwoord waarvoor genoeg is', () => {
  for (const [id, v] of Object.entries(T.VOORVALLEN)) {
    const heeft = (v.als && v.als.voorraad) || {};
    const kan = antwoorden(id).some((k) => {
      const doe = k.doe || {};
      return !doe.gezin && ['goud', ...WAREN].every((wat) => !(doe[wat] < 0) || (heeft[wat] || 0) >= -doe[wat]);
    });
    assert.ok(kan, `${id}: met een lege schuur kun je niets antwoorden`);
  }
});

test('om de paar dagen een voorval, in de winter vaker, en niet in de eerste dagen', () => {
  const S = gehucht();
  const dagen = [];
  for (let d = 1; d < T.DAGEN_PER_JAAR; d++) {
    S.kalender.dag = d;
    T.tikVoorvallenDag(S.dorp, d);
    const L = S.dorp.voorvallen.lopend;
    if (L && L.dag === d) {
      dagen.push(d);
      T.voorvalBeantwoord(S.dorp, L.id);
    }
  }
  assert.ok(dagen[0] >= T.VOORVALLEN_INSTELLINGEN.eersteNa, 'het eerste komt niet vóór eersteNa');
  assert.ok(dagen.length >= 25 && dagen.length <= 60, `een jaar heeft er ${dagen.length}; om de paar dagen is 25 tot 60`);
  // Dag 0 is 1 lentemaand: wintermaand begint op dag 270, en het jaar loopt door tot eind sprokkelmaand.
  const winter = dagen.filter((d) => T.datumVanDag(d).seizoen === 'winter').length / 90;
  const rest = dagen.filter((d) => T.datumVanDag(d).seizoen !== 'winter').length / 270;
  assert.ok(winter > rest, `in de winter vaker: ${winter.toFixed(3)} per dag, anders ${rest.toFixed(3)}`);
  assert.equal(S.dorp.voorvallen.aantal, dagen.length);
});

test('wie het zegt en over wie het gaat, passen bij het voorval, en zijn niet van hetzelfde gezin', () => {
  const S = gehucht();
  const boer = (p) => !!(p.wie && p.huis && p.huis.soort === 'boerderij');
  const dief = T.voorvalKan(S.dorp, 'diefstal', 10);
  assert.ok(dief);
  assert.equal(dief.wie.geslacht, 'vrouw');
  assert.equal(dief.ander.geslacht, 'man');
  assert.ok(!boer(dief.ander), 'de dief is geen boer');
  assert.notEqual(dief.wie.gezin, dief.ander.gezin);
  const grens = T.voorvalKan(S.dorp, 'akkergrens', 10);
  assert.ok(grens && boer(grens.wie) && boer(grens.ander) && grens.wie !== grens.ander, 'twee boeren om een grens');
  // Een karakter: de boer die het trok (js/boeren.js), en anders komt het voorval niet.
  for (const [id, karakter] of [['weduweDak', 'weduwe'], ['lied', 'zanger'], ['klok', 'vrome'], ['wijsheid', 'grijsaard']]) {
    const heeft = S.dorp.bewoners.mensen.some((p) => boer(p) && p.wezen.karakter === karakter);
    const v = T.VOORVALLEN[id];
    const oud = v.als;
    v.als = undefined;
    const m = T.voorvalKan(S.dorp, id, 10);
    v.als = oud;
    assert.equal(!!m, heeft, `${id}: alleen als er een ${karakter} is`);
    if (m) assert.equal(m.wie.wezen.karakter, karakter);
  }
  // Niemand van het gezin van de schout, en de schout zelf niet.
  for (let d = 1; d < 200; d += 3) {
    for (const id of Object.keys(T.VOORVALLEN)) {
      const m = T.voorvalKan(S.dorp, id, d);
      for (const p of m ? [m.wie, m.ander].filter(Boolean) : []) assert.ok(!p.schout && !(p.hoofd && p.hoofd.schout), `${id}: niet de schout of zijn gezin`);
    }
  }
});

test('een voorval komt als het er de tijd voor is: de maand, een gebouw, de voorraad, het vee', () => {
  const S = gehucht();
  const GRASMAAND = 1 * T.DAGEN_PER_MAAND;
  const HOOIMAAND = 4 * T.DAGEN_PER_MAAND;
  const OOGSTMAAND = 5 * T.DAGEN_PER_MAAND;
  assert.ok(T.voorvalKan(S.dorp, 'zaaigraan', GRASMAAND + 3), 'zaaigraan in grasmaand');
  assert.equal(T.voorvalKan(S.dorp, 'zaaigraan', HOOIMAAND + 3), null, 'en niet in hooimaand');
  T.zetVoorraad(S.dorp, 'graan', 50);
  assert.equal(T.voorvalKan(S.dorp, 'oogstfeest', OOGSTMAAND + 3), null, 'een oogstfeest met 50 graan: nee');
  T.zetVoorraad(S.dorp, 'graan', 200);
  assert.ok(T.voorvalKan(S.dorp, 'oogstfeest', OOGSTMAAND + 3), 'met 200 graan wel');
  assert.equal(T.voorvalKan(S.dorp, 'oogstfeest', GRASMAAND + 3), null, 'maar niet in grasmaand');
  // De vechtpartij is in de herberg: zonder herberg niet.
  assert.ok(T.voorvalKan(S.dorp, 'vechtpartij', 10));
  const herberg = S.dorp.gebouwen.find((g) => g.soort === 'herberg');
  herberg.klaar = false;
  assert.equal(T.voorvalKan(S.dorp, 'vechtpartij', 10), null);
  herberg.klaar = true;
  // Wolven in de winter, en alleen als er schapen zijn om te halen; met beesten in het bos komen ze niet zomaar, maar als
  // de wolven echt een schaap namen (js/beesten.js, test/beesten.test.cjs).
  const LOUWMAAND = 10 * T.DAGEN_PER_MAAND;
  const schapen = T.veeVan(S.dorp).filter((e) => e.dier === 'schaap').length;
  assert.equal(T.voorvalKan(S.dorp, 'wolven', LOUWMAAND + 3), null, 'met beesten in het bos niet zomaar');
  T.zetOptie('beesten', 'uit');
  try {
    assert.equal(!!T.voorvalKan(S.dorp, 'wolven', LOUWMAAND + 3), schapen >= 3, `wolven met ${schapen} schapen`);
    assert.equal(T.voorvalKan(S.dorp, 'wolven', GRASMAAND + 3), null, 'niet in grasmaand');
  } finally {
    T.zetOptie('beesten', 'aan');
  }
  // Hetzelfde voorval niet binnen zijn pauze.
  metVoorval(S, 'zwerver', 20);
  T.voorvalBeantwoord(S.dorp, 'zwerver');
  assert.equal(T.voorvalKan(S.dorp, 'zwerver', 30), null);
  assert.ok(T.voorvalKan(S.dorp, 'zwerver', 20 + T.VOORVALLEN_INSTELLINGEN.pauze));
  // Een vervolg komt nooit zomaar.
  assert.equal(T.voorvalKan(S.dorp, 'diefstalWeer', 10), null);
});

test('het venster zegt vooraf wat een antwoord kost, en wat er niet is, kun je niet geven', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal');
  const [verban, boete, laatGaan] = antwoorden('diefstal').map((k) => T.prijsVanKeuze(S.dorp, k.doe));
  assert.equal(verban.tekst, `tevredenheid +3%, ${T.naamVanBewoner(L.ander)} moet het bos in`);
  assert.equal(boete.tekst, '+1 goud, tevredenheid +2%');
  assert.equal(laatGaan.tekst, 'tevredenheid −3%', 'dat hij terug kan komen, zegt het niet');
  T.zetVoorraad(S.dorp, 'graan', 5);
  const p = T.prijsVanKeuze(S.dorp, { graan: -10, tevreden: -4 });
  assert.equal(p.kan, false);
  assert.equal(p.waarom, 'je hebt 5 graan');
  assert.deepEqual(T.prijsVanKeuze(S.dorp, { graan: 10 }), { tekst: '+10 graan', kan: true, waarom: '' }, 'wat erbij komt, kan altijd');
  assert.equal(T.prijsVanKeuze(S.dorp, { schaap: -2, sterfkans: 30, argwaan: -5 }).tekst, '−2 schapen, argwaan −5%, 30% kans op een dode');
  // Een gewoon gesprek: de marskramer opent zijn venster, en dat kost niets.
  assert.deepEqual(T.prijsVanKeuze(S.dorp, { handel: true }), { tekst: '', kan: true, waarom: '' });
});

test('een antwoord doet wat het zegt: de voorraad, de tevredenheid die wegslijt, en de argwaan', () => {
  const S = gehucht();
  S.dorp.behoeften = T.nieuweBehoeften();
  metVoorval(S, 'bruiloft', 40);
  T.zetVoorraad(S.dorp, 'graan', 100);
  T.zetVoorraad(S.dorp, 'bier', 30);
  T.doeGevolg(S, S.dorp, antwoorden('bruiloft')[0].doe);
  assert.equal(S.dorp.voorraad.graan, 85);
  assert.equal(S.dorp.voorraad.bier, 20);
  const nu = T.voorvalStemming(S.dorp, 40);
  assert.ok(Math.abs(nu.erbij - 0.06) < 1e-9, 'zes procent tevredener');
  assert.deepEqual(nu.blij, ['de bruiloft']);
  assert.ok(Math.abs(T.voorvalStemming(S.dorp, 55).erbij - 0.03) < 1e-9, 'na een halve stemmingDagen nog de helft');
  assert.equal(T.voorvalStemming(S.dorp, 40 + T.VOORVALLEN_INSTELLINGEN.stemmingDagen).erbij, 0, 'en dan is het weg');
  const b = T.berekenTevredenheid(S.dorp, 40);
  assert.ok(b.blij.includes('de bruiloft'), 'de balk zegt waar het dorp blij mee is');
  const argwaan = (S.dorp.inner && S.dorp.inner.argwaan) || 0;
  T.doeGevolg(S, S.dorp, { argwaan: 5 });
  assert.ok(Math.abs(S.dorp.inner.argwaan - argwaan - 0.05) < 1e-9);
});

test('verbannen: de dief trekt weg, en gaat het bos in als rover', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal');
  const dief = L.ander;
  const voor = S.dorp.bevolking;
  T.doeGevolg(S, S.dorp, antwoorden('diefstal')[0].doe);
  assert.equal(S.dorp.bevolking, voor - 1);
  assert.ok(!S.dorp.bewoners.mensen.includes(dief), 'hij woont hier niet meer');
  assert.ok(S.dorp.rovers.bende.some((r) => r.id === dief.id), 'hij is bij de rovers');
  assert.ok(berichten.some((t) => t.startsWith(dief.naam) && t.includes('trekt weg: verbannen door de schout')));
});

test('de koorts: met pech sterft er iemand; de wolven halen schapen; en een gezin komt als er plaats is', () => {
  const S = gehucht();
  metVoorval(S, 'ziekte');
  const voor = S.dorp.bevolking;
  T.doeGevolg(S, S.dorp, { sterfkans: 100 });
  assert.equal(S.dorp.bevolking, voor - 1, 'bij honderd procent sterft er een');
  assert.ok(berichten.some((t) => t.startsWith('De koorts: ')));
  T.doeGevolg(S, S.dorp, { sterfkans: 0 });
  assert.equal(S.dorp.bevolking, voor - 1);
  const schapen = () => T.veeVan(S.dorp).filter((e) => e.dier === 'schaap').length;
  if (schapen() >= 2) {
    const n = schapen();
    T.doeGevolg(S, S.dorp, { schaap: -2 });
    assert.equal(schapen(), n - 2);
  }
  const mensen = S.dorp.bevolking;
  const plaats = T.plaatsVoorEenGezin(S.dorp);
  T.doeGevolg(S, S.dorp, { gezin: 1 });
  assert.equal(S.dorp.bevolking > mensen, plaats, 'er komt een gezin als er plaats is');
});

test('een vervolg komt later, over dezelfde mensen, of zoals het vervolg zegt', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal', 50);
  T.doeGevolg(S, S.dorp, { voorval: 'diefDank' });
  const w = S.dorp.voorvallen.wacht[0];
  const IN = T.VOORVALLEN_INSTELLINGEN;
  assert.equal(w.id, 'diefDank');
  assert.ok(w.op >= 50 + IN.vervolgVan && w.op <= 50 + IN.vervolgTot, `op dag ${w.op}`);
  assert.equal(w.wie, L.wie);
  assert.equal(w.ander, L.ander);
  T.voorvalBeantwoord(S.dorp, 'diefstal');
  S.dorp.voorvallen.volgende = 1e9;
  S.kalender.dag = w.op;
  T.tikVoorvallenDag(S.dorp, w.op);
  const nu = S.dorp.voorvallen.lopend;
  assert.equal(nu.id, 'diefDank');
  assert.equal(nu.wie, L.ander, 'de dief komt het zelf zeggen');
  assert.equal(nu.ander, L.wie);
  // 'niets' in een lijstje is niets.
  T.voorvalBeantwoord(S.dorp, 'diefDank');
  T.doeGevolg(S, S.dorp, { voorval: ['niets'] });
  assert.equal(S.dorp.voorvallen.wacht.length, 0);
  // Een vervolg op zijn eigen tijd: het zaaigraan komt na de oogst terug.
  const Z = gehucht();
  T.zetVoorraad(Z.dorp, 'graan', 100);
  metVoorval(Z, 'zaaigraan', 35);
  T.doeGevolg(Z, Z.dorp, antwoorden('zaaigraan')[0].doe);
  const [van, tot] = T.VOORVALLEN.zaaigraanTerug.na;
  assert.equal(Z.dorp.voorraad.graan, 80);
  assert.ok(Z.dorp.voorvallen.wacht[0].op >= 35 + van && Z.dorp.voorvallen.wacht[0].op <= 35 + tot, 'na de oogst');
});

test('wie het zegt, zoekt de schout: hij loopt naar hem toe, spreekt hem aan, en gaat na je antwoord zijns weegs', () => {
  const S = gehucht();
  const L = metVoorval(S, 'zwerver', 20);
  const e = L.wie.wezen;
  S.kalender.dag = L.vanaf - 0.01;
  T.werkVoorvallenBij(S, S.dorp);
  assert.ok(!e.zoektSchout, 'vóór zijn uur nog niet');
  S.kalender.dag = L.vanaf + 0.001;
  T.werkVoorvallenBij(S, S.dorp);
  assert.ok(e.zoektSchout, 'vanaf zijn uur zoekt hij je');
  assert.ok(berichten.includes(`${T.naamVanBewoner(L.wie)} zoekt je.`));
  assert.equal(T.dagAnker(S.dorp, e), null, 'het dagritme laat hem gaan');
  assert.equal(T.voorvalVan(S.dorp, e), L, 'wie op hem klikt, praat over het voorval');
  assert.ok(e.pad.length > 0 || T.afstand({ x: e.tx, y: e.ty }, { x: S.schout.tx, y: S.schout.ty }) <= 1, 'hij loopt naar de schout');
  // Hij staat naast de schout, en die staat stil: dan spreekt hij hem aan, één keer.
  e.pad = [];
  e.onderweg = false;
  const h = S.schout;
  const naast = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1]].map(([dx, dy]) => ({ x: h.tx + dx, y: h.ty + dy })).find((t) => T.isBegaanbaar(S.wereld, t.x, t.y));
  e.x = e.tx = naast.x;
  e.y = e.ty = naast.y;
  aangesproken.length = 0;
  T.werkVoorvallenBij(S, S.dorp);
  T.werkVoorvallenBij(S, S.dorp);
  assert.equal(aangesproken.length, 1);
  assert.equal(aangesproken[0].e, e);
  assert.equal(aangesproken[0].id, 'zwerver');
  T.voorvalBeantwoord(S.dorp, 'zwerver');
  assert.equal(S.dorp.voorvallen.lopend, null);
  assert.ok(!e.zoektSchout);
  assert.equal(S.dorp.voorvallen.beantwoord, 1);
});

test("'s avonds gaat hij naar huis, en de volgende ochtend komt hij terug", () => {
  const S = gehucht();
  const L = metVoorval(S, 'zwerver', 20);
  const e = L.wie.wezen;
  S.kalender.dag = L.vanaf + 0.01;
  T.werkVoorvallenBij(S, S.dorp);
  assert.ok(e.zoektSchout, 'overdag zoekt hij je');
  S.kalender.dag = 20 + 21 / 24;
  T.werkVoorvallenBij(S, S.dorp);
  assert.ok(!e.zoektSchout, "'s avonds niet");
  S.kalender.dag = 21;
  T.tikVoorvallenDag(S.dorp, 21);
  assert.equal(S.dorp.voorvallen.lopend, L, 'de volgende dag loopt het nog');
  S.kalender.dag = 21 + 10 / 24;
  T.werkVoorvallenBij(S, S.dorp);
  assert.ok(e.zoektSchout, 'en zoekt hij je weer');
});

test('wie je niet sprak, gaat voorbij, en dat neemt het dorp je kwalijk', () => {
  const S = gehucht();
  const L = metVoorval(S, 'lening', 30);
  S.dorp.voorvallen.volgende = 1e9;
  T.tikVoorvallenDag(S.dorp, 30 + T.VOORVALLEN_INSTELLINGEN.zoektDagen - 1);
  assert.equal(S.dorp.voorvallen.lopend, L);
  T.tikVoorvallenDag(S.dorp, 30 + T.VOORVALLEN_INSTELLINGEN.zoektDagen);
  assert.equal(S.dorp.voorvallen.lopend, null);
  assert.ok(berichten.includes(`${T.naamVanBewoner(L.wie)} heeft je niet gesproken, en gaat weer aan het werk.`));
  const s = T.voorvalStemming(S.dorp, 30 + T.VOORVALLEN_INSTELLINGEN.zoektDagen);
  assert.ok(s.erbij < 0);
  assert.deepEqual(s.last, ['een schout die geen tijd had'], 'hij was in het dorp');
  assert.ok(!L.wie.wezen.zoektSchout);
  assert.equal(S.dorp.voorvallen.laatstVoorbij, undefined, 'een raadsman had hier niet beslist (vraag 68, B), dus de raad zegt niets');

  // Was de schout weg, dan had een raadsman beslist: de raad zegt het dan een tijd (js/raad.js).
  const S2 = gehucht();
  metVoorval(S2, 'lening', 30);
  S2.dorp.voorvallen.volgende = 1e9;
  // Hij is elders: van de kaart van het dorp af en op een andere, zoals T.gaNaarGebied hem verzet (js/gebied.js).
  const kaart = S2.dorp.wereld;
  kaart.wezens.splice(kaart.wezens.indexOf(S2.schout), 1);
  S2.wereld = { wezens: [S2.schout], naam: 'elders' };
  assert.ok(T.schoutIsWeg(S2.dorp));
  T.tikVoorvallenDag(S2.dorp, 30 + T.VOORVALLEN_INSTELLINGEN.zoektDagen);
  assert.equal(S2.dorp.voorvallen.lopend, null);
  assert.deepEqual(T.voorvalStemming(S2.dorp, 30 + T.VOORVALLEN_INSTELLINGEN.zoektDagen).last, ['een schout die er niet was']);
  assert.equal(S2.dorp.voorvallen.laatstVoorbij, 30 + T.VOORVALLEN_INSTELLINGEN.zoektDagen, 'de raad zegt dan: kies een raadsman');
});

test('de spelregel: uit komt er niemand, en vaak komen ze vaker', () => {
  const tel = (keuze) => {
    T.zetOptie('voorvallen', keuze);
    const S = gehucht();
    let n = 0;
    for (let d = 1; d < 180; d++) {
      T.tikVoorvallenDag(S.dorp, d);
      const L = S.dorp.voorvallen.lopend;
      if (L && L.dag === d) {
        n++;
        T.voorvalBeantwoord(S.dorp, L.id);
      }
    }
    return n;
  };
  try {
    assert.equal(tel('uit'), 0);
    const gewoon = tel('gewoon');
    assert.ok(tel('vaak') > gewoon);
    assert.ok(tel('zelden') < gewoon);
  } finally {
    T.optiesTerug();
    T.zetOptie('wieBouwt', 'jij');
  }
  assert.equal(T.VOORVALLEN_INSTELLINGEN.dagenTussen, 10, 'gewoon is de standaard');
});

test('bewaren en laden: het voorval van nu, zijn mensen en wat nog komt, blijven hetzelfde', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal', 50);
  T.doeGevolg(S, S.dorp, { voorval: 'diefDank', tevreden: 2 });
  const S2 = gehucht();
  T.zetSpel(S2, T.leesSpel(T.bewaarSpel(S, { nu: 1790000000000 })));
  const L2 = S2.dorp.voorvallen.lopend;
  assert.equal(L2.id, 'diefstal');
  assert.ok(S2.dorp.bewoners.mensen.includes(L2.wie), 'wie het zegt, is een bewoner van het geladen spel');
  assert.equal(L2.wie.naam, L.wie.naam);
  assert.equal(S2.dorp.voorvallen.wacht[0].ander, L2.ander, 'het vervolg gaat over dezelfde dief');
  assert.equal(S2.dorp.voorvallen.stemming.length, 1);
});

// ---------------------------------------------------------------------------------------------
// Waar het van komt (werklijst vraag 74, B; Marcel, 30 sep: "a ja")
// ---------------------------------------------------------------------------------------------

const WINTER = 10 * T.DAGEN_PER_MAAND + 3; // louwmaand
const ZOMER = 4 * T.DAGEN_PER_MAAND + 3; // hooimaand

// Het gehucht zonder oorzaak: gevoed, warm, tevreden, en met plaats in de huizen.
function zonderOorzaak() {
  const S = gehucht();
  const D = S.dorp;
  D.behoeften.tevredenheid = 0.8;
  D.behoeften.mist = [];
  D.behoeften.last = [];
  D.bevolking = T.telWoonruimte(D) - 4;
  for (const o of Object.keys(T.OORZAKEN)) assert.equal(T.OORZAKEN[o].speelt(D, ZOMER), null, `${o} speelt niet`);
  return S;
}

test('een oorzaak speelt als het dorp hem heeft, en zegt waarom', () => {
  const D = zonderOorzaak().dorp;
  assert.equal(T.oorzaakVan(D, 'diefstal', ZOMER), null, 'zonder honger komt een diefstal uit de lucht');

  T.zetWet(D, 'rantsoen', 'krap');
  assert.deepEqual(T.oorzaakVan(D, 'diefstal', ZOMER), { id: 'honger', zin: 'Er is honger, want het rantsoen is krap.', waarom: 'het rantsoen is krap' });
  T.zetWet(D, 'rantsoen', 'gewoon');
  D.behoeften.mist = ['eten'];
  assert.equal(T.oorzaakVan(D, 'stroper', ZOMER).zin, 'Er is honger, want er is niet genoeg eten.');
  D.behoeften.mist = [];

  D.behoeften.mist = ['brandhout voor de winter'];
  assert.equal(T.oorzaakVan(D, 'ziekte', ZOMER), null, 'kou is er alleen in de winter');
  D.voorraad.hout = 30;
  D.voorraad.turf = 0;
  assert.equal(T.oorzaakVan(D, 'ziekte', WINTER).zin, 'Het is koud in de huizen, want het hout haalt de winter niet.');
  D.voorraad.hout = 0;
  assert.equal(T.oorzaakVan(D, 'ziekte', WINTER).zin, 'Het is koud in de huizen, want het brandhout is op.');
  D.behoeften.mist = [];

  D.bevolking = T.telWoonruimte(D);
  assert.deepEqual(T.oorzaakVan(D, 'brand', ZOMER), { id: 'vol', zin: 'De huizen zitten vol.', waarom: '' });
  assert.equal(T.oorzaakVan(D, 'ziekte', ZOMER).id, 'vol', 'de koorts komt van kou, of van een vol dorp');
  D.bevolking -= 4;

  D.behoeften.tevredenheid = T.VOORVALLEN_INSTELLINGEN.onvrede - 0.1;
  D.behoeften.last = ['de belasting'];
  assert.equal(T.oorzaakVan(D, 'vechtpartij', ZOMER).zin, 'Het dorp is ontevreden, want het heeft last van de belasting.');
  assert.equal(T.oorzaakVan(D, 'zwerver', ZOMER), null, 'een kans heeft geen oorzaak');
});

test('met een oorzaak komt een probleem vaker, zonder zelden; op 1 en 1 zoals vóór 30 sep', () => {
  const D = zonderOorzaak().dorp;
  const IN = T.VOORVALLEN_INSTELLINGEN;
  assert.equal(T.gewichtVanVoorval(D, 'diefstal', ZOMER), IN.zonderOorzaak);
  assert.equal(T.gewichtVanVoorval(D, 'zwerver', ZOMER), 1, 'zonder oorzaak in T.VOORVALLEN verandert er niets');
  assert.equal(T.gewichtVanVoorval(D, 'brand', WINTER), 3 * IN.zonderOorzaak, 'het wintergewicht blijft');
  T.zetWet(D, 'rantsoen', 'krap');
  assert.equal(T.gewichtVanVoorval(D, 'diefstal', ZOMER), IN.metOorzaak);
  const oud = { met: IN.metOorzaak, zonder: IN.zonderOorzaak };
  try {
    Object.assign(IN, { metOorzaak: 1, zonderOorzaak: 1 });
    assert.equal(T.gewichtVanVoorval(D, 'diefstal', ZOMER), 1);
    assert.equal(T.gewichtVanVoorval(D, 'brand', WINTER), 3);
  } finally {
    Object.assign(IN, { metOorzaak: oud.met, zonderOorzaak: oud.zonder });
  }
});

test('een jaar met een krap rantsoen heeft meer diefstal, stroperij en schulden dan een jaar zonder', () => {
  const tel = (rantsoen) => {
    const D = zonderOorzaak().dorp;
    T.zetWet(D, 'rantsoen', rantsoen);
    let n = 0;
    for (let d = 1; d < T.DAGEN_PER_JAAR; d++) {
      const k = T.kiesVoorval(D, d);
      if (k && T.VOORVALLEN[k.id].oorzaak === 'honger') n++;
    }
    return n;
  };
  const gewoon = tel('gewoon');
  const krap = tel('krap');
  assert.ok(krap > 3 * gewoon, `met honger ${krap} keer, zonder ${gewoon} keer`);
});

test('het bericht zegt waarom, de raadsman ook, en een gesprek kan het zeggen met {oorzaak}', () => {
  const S = zonderOorzaak();
  const D = S.dorp;
  assert.equal(T.vulWoordenIn(D, 'Zo is het. {oorzaak}'), 'Zo is het. ', 'zonder voorval zegt {oorzaak} niets');
  T.zetWet(D, 'rantsoen', 'krap');
  const L = metVoorval(S, 'diefstal', ZOMER);
  assert.equal(L.oorzaak.id, 'honger');
  assert.equal(T.vulWoordenIn(D, 'Zo is het. {oorzaak}'), 'Zo is het. Er is honger, want het rantsoen is krap.');
  berichten.length = 0;
  S.kalender.dag = L.vanaf + 0.01;
  T.werkVoorvallenBij(S, D);
  assert.ok(berichten.some((b) => b.endsWith(' zoekt je. Er is honger, want het rantsoen is krap.')), berichten.join(' | '));
  // Ben je er niet, dan beslist de raadsman, en zijn bericht zegt het ook.
  const boer = T.raadsmanKandidaten(D)[0];
  T.kiesRaadsman(D, boer);
  berichten.length = 0;
  assert.ok(T.raadsmanBeslist(D));
  assert.ok(berichten.some((b) => b.includes('besliste over de diefstal') && b.endsWith('Er is honger, want het rantsoen is krap.')), berichten.join(' | '));
});

test('een voorval dat uit de lucht kwam, zegt geen waarom, en een vervolg ook niet', () => {
  const S = zonderOorzaak();
  const L = metVoorval(S, 'diefstal', ZOMER);
  assert.equal(L.oorzaak, null);
  berichten.length = 0;
  S.kalender.dag = L.vanaf + 0.01;
  T.werkVoorvallenBij(S, S.dorp);
  assert.ok(berichten.some((b) => b.endsWith(' zoekt je.')), berichten.join(' | '));
  T.zetWet(S.dorp, 'rantsoen', 'krap');
  assert.equal(T.oorzaakVan(S.dorp, 'diefstalWeer', ZOMER), null, 'een vervolg komt van het eerste voorval, niet van een oorzaak');
});
