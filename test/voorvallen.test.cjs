// De voorvallen (js/voorvallen.js; werklijst vraag 65, Marcel, 29 sep: "A ja"): om de paar dagen komt iemand uit het
// dorp de schout zoeken met een vraag, een ruzie of een ramp, en je kiest uit twee of drie antwoorden, elk met een
// prijs die je vooraf ziet. In de winter vaker, en sommige komen terug.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

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
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, trede: 'gehucht' };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.kalender = T.nieuweKalender();
  S.lot = Object.assign(S.lot || {}, { zaad: 7 });
  S.voorvallen = T.nieuweVoorvallen();
  return S;
}

// Een voorval dat nu loopt, over mensen die erbij passen, op dag `dag`.
function metVoorval(S, id, dag = 10) {
  S.kalender.dag = dag;
  const v = T.VOORVALLEN[id];
  const oud = { vervolg: v.vervolg, als: v.als };
  Object.assign(v, { vervolg: false, als: undefined });
  const mensen = T.voorvalKan(S, id, dag);
  Object.assign(v, oud);
  assert.ok(mensen, `er is iemand voor "${id}"`);
  return T.beginVoorval(S, id, mensen.wie, mensen.ander, dag);
}

// Het eerste antwoord van een voorval dat het gesprek sluit en waarvoor genoeg is, zoals een speler kiest.
const knoopVan = (id) => T.GESPREKKEN[id].knopen[T.GESPREKKEN[id].start];
const antwoorden = (id) => knoopVan(id).keuzes;

// Wat een antwoord mag doen: wat elk gesprek kan, en wat js/voorvallen.js erbij doet (het kop-commentaar daar).
const WAREN = ['graan', 'hout', 'wol', 'bier', 'ijzer', 'zout', 'vlees', 'vis', 'kaas', 'hooi'];
const GEVOLGEN = new Set(['zetVlag', 'wisVlag', 'geef', 'neem', 'goud', ...WAREN, 'tevreden', 'argwaan', 'verban', 'sterfkans', 'gezin', 'voorval', ...Object.keys(T.VEE)]);

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
  const vervolgen = new Set();
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
    T.tikVoorvallenDag(S, d);
    const L = S.voorvallen.lopend;
    if (L && L.dag === d) {
      dagen.push(d);
      T.voorvalBeantwoord(S, L.id);
    }
  }
  assert.ok(dagen[0] >= T.VOORVALLEN_INSTELLINGEN.eersteNa, 'het eerste komt niet vóór eersteNa');
  assert.ok(dagen.length >= 25 && dagen.length <= 60, `een jaar heeft er ${dagen.length}; om de paar dagen is 25 tot 60`);
  // Dag 0 is 1 lentemaand: wintermaand begint op dag 270, en het jaar loopt door tot eind sprokkelmaand.
  const winter = dagen.filter((d) => T.datumVanDag(d).seizoen === 'winter').length / 90;
  const rest = dagen.filter((d) => T.datumVanDag(d).seizoen !== 'winter').length / 270;
  assert.ok(winter > rest, `in de winter vaker: ${winter.toFixed(3)} per dag, anders ${rest.toFixed(3)}`);
  assert.equal(S.voorvallen.aantal, dagen.length);
});

test('wie het zegt en over wie het gaat, passen bij het voorval, en zijn niet van hetzelfde gezin', () => {
  const S = gehucht();
  const boer = (p) => !!(p.wie && p.huis && p.huis.soort === 'boerderij');
  const dief = T.voorvalKan(S, 'diefstal', 10);
  assert.ok(dief);
  assert.equal(dief.wie.geslacht, 'vrouw');
  assert.equal(dief.ander.geslacht, 'man');
  assert.ok(!boer(dief.ander), 'de dief is geen boer');
  assert.notEqual(dief.wie.gezin, dief.ander.gezin);
  const grens = T.voorvalKan(S, 'akkergrens', 10);
  assert.ok(grens && boer(grens.wie) && boer(grens.ander) && grens.wie !== grens.ander, 'twee boeren om een grens');
  // Een karakter: de boer die het trok (js/boeren.js), en anders komt het voorval niet.
  for (const [id, karakter] of [['weduweDak', 'weduwe'], ['lied', 'zanger'], ['klok', 'vrome'], ['wijsheid', 'grijsaard']]) {
    const heeft = S.bewoners.mensen.some((p) => boer(p) && p.wezen.karakter === karakter);
    const v = T.VOORVALLEN[id];
    const oud = v.als;
    v.als = undefined;
    const m = T.voorvalKan(S, id, 10);
    v.als = oud;
    assert.equal(!!m, heeft, `${id}: alleen als er een ${karakter} is`);
    if (m) assert.equal(m.wie.wezen.karakter, karakter);
  }
  // Niemand van het gezin van de schout, en de schout zelf niet.
  for (let d = 1; d < 200; d += 3) {
    for (const id of Object.keys(T.VOORVALLEN)) {
      const m = T.voorvalKan(S, id, d);
      for (const p of m ? [m.wie, m.ander].filter(Boolean) : []) assert.ok(!p.schout && !(p.hoofd && p.hoofd.schout), `${id}: niet de schout of zijn gezin`);
    }
  }
});

test('een voorval komt als het er de tijd voor is: de maand, een gebouw, de voorraad, het vee', () => {
  const S = gehucht();
  const GRASMAAND = 1 * T.DAGEN_PER_MAAND;
  const HOOIMAAND = 4 * T.DAGEN_PER_MAAND;
  const OOGSTMAAND = 5 * T.DAGEN_PER_MAAND;
  assert.ok(T.voorvalKan(S, 'zaaigraan', GRASMAAND + 3), 'zaaigraan in grasmaand');
  assert.equal(T.voorvalKan(S, 'zaaigraan', HOOIMAAND + 3), null, 'en niet in hooimaand');
  T.zetVoorraad(S, 'graan', 50);
  assert.equal(T.voorvalKan(S, 'oogstfeest', OOGSTMAAND + 3), null, 'een oogstfeest met 50 graan: nee');
  T.zetVoorraad(S, 'graan', 200);
  assert.ok(T.voorvalKan(S, 'oogstfeest', OOGSTMAAND + 3), 'met 200 graan wel');
  assert.equal(T.voorvalKan(S, 'oogstfeest', GRASMAAND + 3), null, 'maar niet in grasmaand');
  // De vechtpartij is in de herberg: zonder herberg niet.
  assert.ok(T.voorvalKan(S, 'vechtpartij', 10));
  const herberg = S.gebouwen.find((g) => g.soort === 'herberg');
  herberg.klaar = false;
  assert.equal(T.voorvalKan(S, 'vechtpartij', 10), null);
  herberg.klaar = true;
  // Wolven in de winter, en alleen als er schapen zijn om te halen.
  const LOUWMAAND = 10 * T.DAGEN_PER_MAAND;
  const schapen = T.veeVan(S).filter((e) => e.dier === 'schaap').length;
  assert.equal(!!T.voorvalKan(S, 'wolven', LOUWMAAND + 3), schapen >= 3, `wolven met ${schapen} schapen`);
  assert.equal(T.voorvalKan(S, 'wolven', GRASMAAND + 3), null, 'niet in grasmaand');
  // Hetzelfde voorval niet binnen zijn pauze.
  metVoorval(S, 'zwerver', 20);
  T.voorvalBeantwoord(S, 'zwerver');
  assert.equal(T.voorvalKan(S, 'zwerver', 30), null);
  assert.ok(T.voorvalKan(S, 'zwerver', 20 + T.VOORVALLEN_INSTELLINGEN.pauze));
  // Een vervolg komt nooit zomaar.
  assert.equal(T.voorvalKan(S, 'diefstalWeer', 10), null);
});

test('het venster zegt vooraf wat een antwoord kost, en wat er niet is, kun je niet geven', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal');
  const [verban, boete, laatGaan] = antwoorden('diefstal').map((k) => T.prijsVanKeuze(S, k.doe));
  assert.equal(verban.tekst, `tevredenheid +3%, ${T.naamVanBewoner(L.ander)} moet het bos in`);
  assert.equal(boete.tekst, '+1 goud, tevredenheid +2%');
  assert.equal(laatGaan.tekst, 'tevredenheid −3%', 'dat hij terug kan komen, zegt het niet');
  T.zetVoorraad(S, 'graan', 5);
  const p = T.prijsVanKeuze(S, { graan: -10, tevreden: -4 });
  assert.equal(p.kan, false);
  assert.equal(p.waarom, 'je hebt 5 graan');
  assert.deepEqual(T.prijsVanKeuze(S, { graan: 10 }), { tekst: '+10 graan', kan: true, waarom: '' }, 'wat erbij komt, kan altijd');
  assert.equal(T.prijsVanKeuze(S, { schaap: -2, sterfkans: 30, argwaan: -5 }).tekst, '−2 schapen, argwaan −5%, 30% kans op een dode');
  // Een gewoon gesprek: de marskramer opent zijn venster, en dat kost niets.
  assert.deepEqual(T.prijsVanKeuze(S, { handel: true }), { tekst: '', kan: true, waarom: '' });
});

test('een antwoord doet wat het zegt: de voorraad, de tevredenheid die wegslijt, en de argwaan', () => {
  const S = gehucht();
  S.behoeften = T.nieuweBehoeften();
  metVoorval(S, 'bruiloft', 40);
  T.zetVoorraad(S, 'graan', 100);
  T.zetVoorraad(S, 'bier', 30);
  T.doeGevolg(S, antwoorden('bruiloft')[0].doe);
  assert.equal(S.voorraad.graan, 85);
  assert.equal(S.voorraad.bier, 20);
  const nu = T.voorvalStemming(S, 40);
  assert.ok(Math.abs(nu.erbij - 0.06) < 1e-9, 'zes procent tevredener');
  assert.deepEqual(nu.blij, ['de bruiloft']);
  assert.ok(Math.abs(T.voorvalStemming(S, 55).erbij - 0.03) < 1e-9, 'na een halve stemmingDagen nog de helft');
  assert.equal(T.voorvalStemming(S, 40 + T.VOORVALLEN_INSTELLINGEN.stemmingDagen).erbij, 0, 'en dan is het weg');
  const b = T.berekenTevredenheid(S, 40);
  assert.ok(b.blij.includes('de bruiloft'), 'de balk zegt waar het dorp blij mee is');
  const argwaan = (S.inner && S.inner.argwaan) || 0;
  T.doeGevolg(S, { argwaan: 5 });
  assert.ok(Math.abs(S.inner.argwaan - argwaan - 0.05) < 1e-9);
});

test('verbannen: de dief trekt weg, en gaat het bos in als rover', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal');
  const dief = L.ander;
  const voor = S.bevolking;
  T.doeGevolg(S, antwoorden('diefstal')[0].doe);
  assert.equal(S.bevolking, voor - 1);
  assert.ok(!S.bewoners.mensen.includes(dief), 'hij woont hier niet meer');
  assert.ok(S.rovers.bende.some((r) => r.id === dief.id), 'hij is bij de rovers');
  assert.ok(berichten.some((t) => t.startsWith(dief.naam) && t.includes('trekt weg: verbannen door de schout')));
});

test('de koorts: met pech sterft er iemand; de wolven halen schapen; en een gezin komt als er plaats is', () => {
  const S = gehucht();
  metVoorval(S, 'ziekte');
  const voor = S.bevolking;
  T.doeGevolg(S, { sterfkans: 100 });
  assert.equal(S.bevolking, voor - 1, 'bij honderd procent sterft er een');
  assert.ok(berichten.some((t) => t.startsWith('De koorts: ')));
  T.doeGevolg(S, { sterfkans: 0 });
  assert.equal(S.bevolking, voor - 1);
  const schapen = () => T.veeVan(S).filter((e) => e.dier === 'schaap').length;
  if (schapen() >= 2) {
    const n = schapen();
    T.doeGevolg(S, { schaap: -2 });
    assert.equal(schapen(), n - 2);
  }
  const mensen = S.bevolking;
  const plaats = T.plaatsVoorEenGezin(S);
  T.doeGevolg(S, { gezin: 1 });
  assert.equal(S.bevolking > mensen, plaats, 'er komt een gezin als er plaats is');
});

test('een vervolg komt later, over dezelfde mensen, of zoals het vervolg zegt', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal', 50);
  T.doeGevolg(S, { voorval: 'diefDank' });
  const w = S.voorvallen.wacht[0];
  const IN = T.VOORVALLEN_INSTELLINGEN;
  assert.equal(w.id, 'diefDank');
  assert.ok(w.op >= 50 + IN.vervolgVan && w.op <= 50 + IN.vervolgTot, `op dag ${w.op}`);
  assert.equal(w.wie, L.wie);
  assert.equal(w.ander, L.ander);
  T.voorvalBeantwoord(S, 'diefstal');
  S.voorvallen.volgende = 1e9;
  S.kalender.dag = w.op;
  T.tikVoorvallenDag(S, w.op);
  const nu = S.voorvallen.lopend;
  assert.equal(nu.id, 'diefDank');
  assert.equal(nu.wie, L.ander, 'de dief komt het zelf zeggen');
  assert.equal(nu.ander, L.wie);
  // 'niets' in een lijstje is niets.
  T.voorvalBeantwoord(S, 'diefDank');
  T.doeGevolg(S, { voorval: ['niets'] });
  assert.equal(S.voorvallen.wacht.length, 0);
  // Een vervolg op zijn eigen tijd: het zaaigraan komt na de oogst terug.
  const Z = gehucht();
  T.zetVoorraad(Z, 'graan', 100);
  metVoorval(Z, 'zaaigraan', 35);
  T.doeGevolg(Z, antwoorden('zaaigraan')[0].doe);
  const [van, tot] = T.VOORVALLEN.zaaigraanTerug.na;
  assert.equal(Z.voorraad.graan, 80);
  assert.ok(Z.voorvallen.wacht[0].op >= 35 + van && Z.voorvallen.wacht[0].op <= 35 + tot, 'na de oogst');
});

test('wie het zegt, zoekt de schout: hij loopt naar hem toe, spreekt hem aan, en gaat na je antwoord zijns weegs', () => {
  const S = gehucht();
  const L = metVoorval(S, 'zwerver', 20);
  const e = L.wie.wezen;
  S.kalender.dag = L.vanaf - 0.01;
  T.werkVoorvallenBij(S);
  assert.ok(!e.zoektSchout, 'vóór zijn uur nog niet');
  S.kalender.dag = L.vanaf + 0.001;
  T.werkVoorvallenBij(S);
  assert.ok(e.zoektSchout, 'vanaf zijn uur zoekt hij je');
  assert.ok(berichten.includes(`${T.naamVanBewoner(L.wie)} zoekt je.`));
  assert.equal(T.dagAnker(S, e), null, 'het dagritme laat hem gaan');
  assert.equal(T.voorvalVan(S, e), L, 'wie op hem klikt, praat over het voorval');
  assert.ok(e.pad.length > 0 || T.afstand({ x: e.tx, y: e.ty }, { x: S.schout.tx, y: S.schout.ty }) <= 1, 'hij loopt naar de schout');
  // Hij staat naast de schout, en die staat stil: dan spreekt hij hem aan, één keer.
  e.pad = [];
  e.onderweg = false;
  const h = S.schout;
  const naast = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1]].map(([dx, dy]) => ({ x: h.tx + dx, y: h.ty + dy })).find((t) => T.isBegaanbaar(S.wereld, t.x, t.y));
  e.x = e.tx = naast.x;
  e.y = e.ty = naast.y;
  aangesproken.length = 0;
  T.werkVoorvallenBij(S);
  T.werkVoorvallenBij(S);
  assert.equal(aangesproken.length, 1);
  assert.equal(aangesproken[0].e, e);
  assert.equal(aangesproken[0].id, 'zwerver');
  T.voorvalBeantwoord(S, 'zwerver');
  assert.equal(S.voorvallen.lopend, null);
  assert.ok(!e.zoektSchout);
  assert.equal(S.voorvallen.beantwoord, 1);
});

test("'s avonds gaat hij naar huis, en de volgende ochtend komt hij terug", () => {
  const S = gehucht();
  const L = metVoorval(S, 'zwerver', 20);
  const e = L.wie.wezen;
  S.kalender.dag = L.vanaf + 0.01;
  T.werkVoorvallenBij(S);
  assert.ok(e.zoektSchout, 'overdag zoekt hij je');
  S.kalender.dag = 20 + 21 / 24;
  T.werkVoorvallenBij(S);
  assert.ok(!e.zoektSchout, "'s avonds niet");
  S.kalender.dag = 21;
  T.tikVoorvallenDag(S, 21);
  assert.equal(S.voorvallen.lopend, L, 'de volgende dag loopt het nog');
  S.kalender.dag = 21 + 10 / 24;
  T.werkVoorvallenBij(S);
  assert.ok(e.zoektSchout, 'en zoekt hij je weer');
});

test('wie je niet sprak, gaat voorbij, en dat neemt het dorp je kwalijk', () => {
  const S = gehucht();
  const L = metVoorval(S, 'lening', 30);
  S.voorvallen.volgende = 1e9;
  T.tikVoorvallenDag(S, 30 + T.VOORVALLEN_INSTELLINGEN.zoektDagen - 1);
  assert.equal(S.voorvallen.lopend, L);
  T.tikVoorvallenDag(S, 30 + T.VOORVALLEN_INSTELLINGEN.zoektDagen);
  assert.equal(S.voorvallen.lopend, null);
  assert.ok(berichten.includes(`${T.naamVanBewoner(L.wie)} heeft je niet gesproken, en gaat weer aan het werk.`));
  const s = T.voorvalStemming(S, 30 + T.VOORVALLEN_INSTELLINGEN.zoektDagen);
  assert.ok(s.erbij < 0);
  assert.deepEqual(s.last, ['een schout die er niet was']);
  assert.ok(!L.wie.wezen.zoektSchout);
});

test('de spelregel: uit komt er niemand, en vaak komen ze vaker', () => {
  const tel = (keuze) => {
    T.zetOptie('voorvallen', keuze);
    const S = gehucht();
    let n = 0;
    for (let d = 1; d < 180; d++) {
      T.tikVoorvallenDag(S, d);
      const L = S.voorvallen.lopend;
      if (L && L.dag === d) {
        n++;
        T.voorvalBeantwoord(S, L.id);
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
  }
  assert.equal(T.VOORVALLEN_INSTELLINGEN.dagenTussen, 10, 'gewoon is de standaard');
});

test('bewaren en laden: het voorval van nu, zijn mensen en wat nog komt, blijven hetzelfde', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal', 50);
  T.doeGevolg(S, { voorval: 'diefDank', tevreden: 2 });
  const S2 = gehucht();
  T.zetSpel(S2, T.leesSpel(T.bewaarSpel(S, { nu: 1790000000000 })));
  const L2 = S2.voorvallen.lopend;
  assert.equal(L2.id, 'diefstal');
  assert.ok(S2.bewoners.mensen.includes(L2.wie), 'wie het zegt, is een bewoner van het geladen spel');
  assert.equal(L2.wie.naam, L.wie.naam);
  assert.equal(S2.voorvallen.wacht[0].ander, L2.ander, 'het vervolg gaat over dezelfde dief');
  assert.equal(S2.voorvallen.stemming.length, 1);
});
