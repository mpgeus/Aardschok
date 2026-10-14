// De ossenkar en de stapels (js/kar.js; werklijst C, stap 1; Marcel, 14 okt: "A2, B2, C1, D2, E2"): wat een gebouw maakt,
// ligt op een stapel bij zijn deur tot de kar het haalt, en telt pas in de opslag. Stap 1 is het hout.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { leegBegin, proefDorp, bouwAf, dagen } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

// Het proefdorp (test/grond.cjs), stil: het huis van de schout (de opslag), twee boerderijen en hutten.
function dorp() {
  const { S, D, w, schout } = proefDorp(T);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() });
  T.S = S;
  return { S, D, w, schout, kar: D.begin.kar, dag: Math.floor(S.kalender.dag) };
}

// Een houthakker bij het vuur, meteen af; geeft het gebouw en de dag erna.
function metHouthakker(S, D, dag) {
  T.wijzigVoorraad(D, 'hout', 20);
  T.wijzigVoorraad(D, 'goud', 10);
  const g = T.proefdorp.zetBijHetVuur(D, 'houthakker');
  bouwAf(T, D, g, dag);
  dagen(T, S, dag + 1);
  return g;
}

test('de kar gaat aan het werk als het kamp op is; tot dan gaat wat er gemaakt wordt meteen de voorraad in', () => {
  const { S, D } = leegBegin(T);
  assert.equal(T.metDeKar(D), false, 'onderweg haalt de kar nog niets');
  T.opStapel(D, { soort: 'hut', x: 0, y: 0 }, 'hout', 3);
  assert.equal(D.voorraad.hout, 3, 'zonder kar telt het meteen');
  dagen(T, S, 1);
  assert.deepEqual(D.karren, [D.begin.kar]);
  assert.equal(D.begin.kar.vel, 'huifkar', 'tot het huis van de schout er is, blijft het de huifkar');
});

test('het hout van de houthakker ligt op zijn stapel, en telt pas als de kar het in de opslag heeft', () => {
  const { S, D, dag } = dorp();
  const g = metHouthakker(S, D, dag);
  // Vannacht hakte hij: dat ligt bij zijn deur, en de kar haalt het morgen.
  dagen(T, S, dag + 2);
  assert.ok(T.stapelVan(g) > 1, `zijn stapel: ${T.stapelVan(g)}`);
  const hout = D.voorraad.hout;
  const opDeStapel = g.stapel.hout;
  dagen(T, S, dag + 3);
  // (op een half hout na: wat de gezinnen sprokkelen en stoken, gaat ook door de voorraad)
  assert.ok(Math.abs(D.voorraad.hout - (hout + opDeStapel)) < 0.5, `de kar haalde het gisteren binnen: ${D.voorraad.hout} en ${hout} + ${opDeStapel}`);
  assert.equal(D.begin.kar.rit, null, 'en staat weer bij de opslag');
});

test('de kar rijdt in de werktijd: naar de stapel, laden, terug, lossen, met de weg van de os', () => {
  const { S, D, kar, schout, dag } = dorp();
  const g = metHouthakker(S, D, dag);
  // De nacht van dag + 1 hakte hij; de dag zelf rijdt de kar.
  const d = dag + 1;
  const fasen = [];
  const van = { x: kar.tx, y: kar.ty };
  for (let u = 0; u < 24; u += 0.05) {
    S.kalender.dag = d + u / 24;
    T.werkKarBij(S, D);
    const f = kar.rit ? kar.rit.fase : null;
    if (f !== (fasen.length ? fasen[fasen.length - 1].f : null)) fasen.push({ f, u });
  }
  assert.deepEqual(fasen.map((x) => x.f), ['heen', 'laden', 'terug', 'lossen', null]);
  const werk = T.dagindeling(d);
  assert.ok(fasen[0].u >= werk.werkBegin - 0.06 && fasen[0].u < werk.werkBegin + 0.1, `hij vertrekt als het werk begint (${fasen[0].u})`);
  // de weg: zo lang als de os erover doet, heen en terug
  const deur = T.deurVan(D.wereld, g);
  const opslag = T.deurVan(D.wereld, schout);
  const uren = (fasen[1].u - fasen[0].u);
  const minstens = ((T.afstand(van, deur) - 2) / T.BEGIN_INSTELLINGEN.karSnelheid / T.DAG_LENGTE) * 24;
  assert.ok(uren >= minstens, `heen ${uren} uur, minstens ${minstens}`);
  const terug = ((T.afstand(deur, opslag) - 2) / T.BEGIN_INSTELLINGEN.karSnelheid / T.DAG_LENGTE) * 24;
  assert.ok(fasen[3].u - fasen[2].u >= terug, `terug ${fasen[3].u - fasen[2].u} uur, minstens ${terug}`);
  assert.ok(T.afstand({ x: kar.tx, y: kar.ty }, opslag) <= 2, 'hij staat bij de deur van de opslag');
  assert.equal(T.stapelVan(g), 0);
});

test('een volle stapel zet het gebouw stil, tot de kar komt', () => {
  const { S, D, dag } = dorp();
  const g = metHouthakker(S, D, dag);
  g.stapel = { hout: T.KAR_INSTELLINGEN.stapelVol };
  g.karKanNietTot = dag + 100; // de kar komt er niet bij
  dagen(T, S, dag + 2);
  assert.equal(T.stapelVan(g), T.KAR_INSTELLINGEN.stapelVol, 'er komt niets bij');
  assert.match(g.stilWant, /stack is full/);
  g.karKanNietTot = 0;
  dagen(T, S, dag + 3);
  assert.ok(T.stapelVan(g) < T.KAR_INSTELLINGEN.stapelVol, 'de kar haalde het, en hij hakt weer');
  assert.ok(!g.stilWant);
});

test('wat de bouwers rooien, ligt op de stapel van de bouwplaats; het hout van een veld op die van zijn boerderij', () => {
  const { D, boerderijen } = proefDorp(T);
  const g = { soort: 'hut', x: 0, y: 0, voet: { b: 3, h: 3 } };
  D.gebouwen.push(g);
  T.opStapel(D, g, 'hout', 2);
  assert.deepEqual(g.stapel, { hout: 2 });
  const veld = { soort: 'akker', boerderij: boerderijen[0] };
  T.opStapel(D, veld, 'hout', 2);
  assert.equal(boerderijen[0].stapel.hout, 2);
  assert.equal(veld.stapel, undefined);
  // graan gaat (nog) niet met de kar
  const graan = D.voorraad.graan;
  T.opStapel(D, g, 'graan', 5);
  assert.equal(D.voorraad.graan, graan + 5);
});

test('een kar halverwege zijn rit, bewaard en geladen, rijdt verder', () => {
  const { S, D, dag } = dorp();
  const g = metHouthakker(S, D, dag);
  const d = dag + 1;
  let u = 0;
  for (; u < 24 && !(D.begin.kar.rit && D.begin.kar.rit.fase === 'terug'); u += 0.05) {
    S.kalender.dag = d + u / 24;
    T.werkKarBij(S, D);
  }
  assert.equal(D.begin.kar.rit.fase, 'terug');
  const lading = D.begin.kar.lading.hout;
  assert.ok(lading > 0);
  const hout = D.voorraad.hout;
  const S2 = {};
  assert.ok(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 0 })).gelukt);
  const D2 = S2.dorp;
  assert.equal(D2.karren[0], D2.begin.kar, 'de kar is dezelfde als die van het begin');
  assert.ok(D2.wereld.wezens.includes(D2.karren[0]));
  dagen(T, S2, d + 1);
  assert.ok(Math.abs(D2.voorraad.hout - (hout + lading)) < 1e-6 || D2.voorraad.hout > hout + lading - 1e-6, 'hij loste wat hij droeg');
  assert.equal(T.stapelVan(D2.gebouwen.find((x) => x.soort === g.soort)) > 0, true, 'en vannacht hakte de houthakker weer');
});
