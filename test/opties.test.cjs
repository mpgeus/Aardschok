// De spelregels zonder scherm (js/opties.js): de keuzes, de namen en de werkbank, hoe ze samen
// de instellingenblokken zetten, en het onthouden. Wat de regels met een keuze doen, staat bij
// hun eigen module (test/heer.test.cjs, test/behoeften.test.cjs). Zie ontwerp/spel.md,
// "Instelbaar: opties in plaats van één keuze" (Marcel, 24 sep 2026).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

// De blokken zoals de bestanden ze zetten, vóór opties.js er iets mee doet.
const BLOKKEN = [
  'GEBOUWEN_INSTELLINGEN', 'BEHOEFTEN_INSTELLINGEN', 'HANDEL_INSTELLINGEN', 'HEER_INSTELLINGEN',
  'VELDEN_INSTELLINGEN', 'VEE_INSTELLINGEN', 'DAG_INSTELLINGEN',
  'BEWONERS_INSTELLINGEN', 'DOORKIJK_INSTELLINGEN', 'HERBERG_INSTELLINGEN', 'ZIEN_INSTELLINGEN',
];
const LOS = ['GRAAN_PER_TEGEL', 'ZAAIGRAAN_PER_TEGEL', 'DAG_LENGTE', 'OOGST_UREN_PER_TEGEL'];
const bestanden = {};
for (const k of BLOKKEN.concat(LOS)) bestanden[k] = JSON.parse(JSON.stringify(T[k]));
const namen = {};
for (const id of ['heer', 'boer1', 'boer2', 'boer3', 'boer4', 'boer5']) namen[id] = T.MENSEN[id].naam;

// Elke toets begint en eindigt op de standaard (en de browser, die er hier niet is, onthoudt niets).
test.afterEach(() => T.pasOptiesToe(null));

test('elke optie heeft een standaard onder zijn keuzes, en elke keuze zet iets wat bestaat', () => {
  const ids = new Set();
  for (const o of T.OPTIES) {
    assert.ok(!ids.has(o.id), `${o.id} staat er twee keer`);
    ids.add(o.id);
    assert.ok(o.naam && o.uitleg, `${o.id} heeft een naam en een uitleg`);
    assert.ok(o.keuzes.some((k) => k.id === o.standaard), `${o.id}: de standaard ${o.standaard} is geen keuze`);
    for (const k of o.keuzes) {
      assert.ok(k.naam && k.uitleg, `${o.id}.${k.id} heeft een naam en een uitleg`);
      for (const pad in k.zet) assert.notEqual(T.leesPad(pad), undefined, `${o.id}.${k.id} zet ${pad}, en dat bestaat niet`);
    }
  }
});

test('de standaard is precies wat de bestanden zeggen: wat Marcel koos', () => {
  T.pasOptiesToe(null);
  for (const k of BLOKKEN.concat(LOS)) assert.deepEqual(T[k], bestanden[k], `${k} wijkt af van het bestand`);
  for (const id in namen) assert.equal(T.MENSEN[id].naam, namen[id]);
  assert.deepEqual(T.OPTIES_NU, { keuzes: {}, namen: {}, getallen: {} });
});

test('een keuze zet zijn waarden, en terug naar de standaard zet ze terug', () => {
  T.pasOptiesToe({ keuzes: { graan: 'ruim', telt: 'steedsZwaarder', hongerBuitenWinter: 'sterven' } });
  assert.equal(T.GRAAN_PER_TEGEL, 5);
  assert.equal(T.HEER_INSTELLINGEN.telWijze, 'hoeVaak');
  assert.equal(T.HEER_INSTELLINGEN.ambtKwijtNa, 4);
  assert.equal(T.BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter, 'sterven');
  assert.equal(T.optieKeuze('graan'), 'ruim');
  T.pasOptiesToe({ keuzes: { telt: 'precies' } });
  assert.equal(T.GRAAN_PER_TEGEL, 4, 'wat je niet meer kiest, gaat terug');
  assert.equal(T.HEER_INSTELLINGEN.telWijze, 'hoeveel');
  assert.equal(T.HEER_INSTELLINGEN.straffen[0].vanaf, 1);
  assert.equal(T.HEER_INSTELLINGEN.ambtKwijtNa, 2);
  T.pasOptiesToe({ keuzes: { telt: 'slecht' } });
  assert.deepEqual(T.HEER_INSTELLINGEN, bestanden.HEER_INSTELLINGEN);
});

test('het graan van de heer is een keuze (punt 6), en de heer staat in de werkbank', () => {
  assert.equal(T.HEER_INSTELLINGEN.rekening, undefined, 'de heer rekent op wat er is: daar is geen keuze meer over');
  assert.equal(T.HEER_INSTELLINGEN.graan, 'deel', 'Marcel koos: een deel van wat er ligt');
  T.pasOptiesToe({ keuzes: { graanVoorDeHeer: 'pacht', rekening: 'alles', sporen: 'graan' } });
  assert.equal(T.HEER_INSTELLINGEN.graan, 'pacht');
  assert.equal(T.HEER_INSTELLINGEN.rekening, undefined, 'een keuze die in een bewaard spel stond maar niet meer bestaat, wordt overgeslagen');
  const heer = T.werkbankGetallen(T.WERKBANK.find((d) => d.blok === 'HEER_INSTELLINGEN'));
  assert.equal(heer.find((g) => g.pad === 'HEER_INSTELLINGEN.brief.dag').label, 'letter · day');
  assert.equal(heer.find((g) => g.pad === 'HEER_INSTELLINGEN.pachtPerAkkertegel').waarde, bestanden.HEER_INSTELLINGEN.pachtPerAkkertegel);
  assert.ok(!heer.some((g) => g.pad === 'HEER_INSTELLINGEN.brief.maand'), 'een maand is geen getal');
});

test('de weides: of het land uitput en of het vee groeit, zijn keuzes; Marcel koos allebei ja', () => {
  assert.equal(T.VELDEN_INSTELLINGEN.vruchtbaarheid, true);
  assert.equal(T.VEE_INSTELLINGEN.groeit, true);
  assert.equal(T.optieKeuze('vruchtbaarheid'), 'putUit');
  assert.equal(T.optieKeuze('veeGroeit'), 'groeit');
  T.pasOptiesToe({ keuzes: { vruchtbaarheid: 'blijftGoed', veeGroeit: 'groeitNiet' } });
  assert.equal(T.VELDEN_INSTELLINGEN.vruchtbaarheid, false);
  assert.equal(T.VEE_INSTELLINGEN.groeit, false);
  T.pasOptiesToe(null);
  assert.deepEqual(T.VELDEN_INSTELLINGEN, bestanden.VELDEN_INSTELLINGEN);
  assert.deepEqual(T.VEE_INSTELLINGEN, bestanden.VEE_INSTELLINGEN);
  // En hun getallen staan in de werkbank, elk met een leesbare naam; een maand is geen getal.
  const vee = T.werkbankGetallen(T.WERKBANK.find((d) => d.blok === 'VEE_INSTELLINGEN'));
  assert.equal(vee.find((g) => g.pad === 'VEE_INSTELLINGEN.plaats.koe').label, 'room · cow');
  assert.equal(vee.find((g) => g.pad === 'VEE_INSTELLINGEN.melkVoorMensen').waarde, 5);
  assert.ok(!vee.some((g) => g.pad === 'VEE_INSTELLINGEN.melk.van'));
  const velden = T.werkbankGetallen(T.WERKBANK.find((d) => d.blok === 'VELDEN_INSTELLINGEN'));
  assert.equal(velden.find((g) => g.pad === 'VELDEN_INSTELLINGEN.akkerPutUit').label, 'arable field wears out');
});

test('de doorkijk: het kijkvenster en het plein zijn de standaard, het raster is een keuze (vraag 34)', () => {
  // Marcel, 26 sep: "Ja dit is een goede optie" en "Raster ook als keuze" (ontwerp/beeld.md, "Doorkijk").
  assert.equal(T.optieKeuze('doorkijk'), 'venster');
  assert.equal(T.optieKeuze('doorkijkPlein'), 'ookHetPlein');
  assert.equal(T.DOORKIJK_INSTELLINGEN.manier, 'venster');
  assert.equal(T.DOORKIJK_INSTELLINGEN.plein, true);
  T.pasOptiesToe({ keuzes: { doorkijk: 'raster', doorkijkPlein: 'wieErToeDoet' } });
  assert.equal(T.DOORKIJK_INSTELLINGEN.manier, 'raster');
  assert.equal(T.DOORKIJK_INSTELLINGEN.plein, false);
  T.pasOptiesToe(null);
  assert.deepEqual(T.DOORKIJK_INSTELLINGEN, bestanden.DOORKIJK_INSTELLINGEN);
  // De getallen staan in de werkbank; het raster zelf is een keuze, geen getal.
  const doorkijk = T.werkbankGetallen(T.WERKBANK.find((d) => d.blok === 'DOORKIJK_INSTELLINGEN'));
  assert.equal(doorkijk.find((g) => g.pad === 'DOORKIJK_INSTELLINGEN.kijkgatStraal').label, 'peephole radius');
  assert.equal(doorkijk.find((g) => g.pad === 'DOORKIJK_INSTELLINGEN.rasterCel').waarde, 1);
  assert.ok(!doorkijk.some((g) => g.pad === 'DOORKIJK_INSTELLINGEN.manier'));
});

test('een onbekende keuze valt terug op de standaard', () => {
  T.pasOptiesToe({ keuzes: { graan: 'bestaatNiet' } });
  assert.equal(T.GRAAN_PER_TEGEL, 4);
  assert.deepEqual(T.OPTIES_NU.keuzes, {});
});

test('de werkbank kent alle getallen, met een leesbare naam', () => {
  const alle = T.WERKBANK.flatMap((deel) => T.werkbankGetallen(deel));
  const pad = (p) => alle.find((g) => g.pad === p);
  assert.ok(pad('GRAAN_PER_TEGEL'));
  assert.equal(pad('BEHOEFTEN_INSTELLINGEN.brandhoutPerHuishoudenPerDag').label, 'firewood per household per day');
  assert.equal(pad('HANDEL_INSTELLINGEN.koopt.graan.prijs.0').label, 'buys · grain · price · spring');
  assert.equal(pad('HANDEL_INSTELLINGEN.bezoeken.2.dag').label, 'visits · autumn · day');
  assert.equal(pad('HEER_INSTELLINGEN.straffen.1.vanaf').label, 'punishments · a fine · from');
  assert.equal(pad('HEER_INSTELLINGEN.straffen.1.vanaf').doorOptie, 'How the lord counts');
  assert.equal(pad('GRAAN_PER_TEGEL').doorOptie, 'Grain');
  assert.equal(pad('HEER_INSTELLINGEN.boete').doorOptie, null);
  for (const g of alle) assert.equal(typeof g.waarde, 'number', g.pad);
  // Geen tekst en geen ja/nee: die zijn van de keuzes.
  assert.ok(!alle.some((g) => g.pad === 'HEER_INSTELLINGEN.betalenIn'));
});

// De namen van de getallen komen uit NAAM_VAN_SLEUTEL (js/opties.js), in het Engels (vraag 147, deel 7): een sleutel die er
// niet in staat, toont zich in woorden uit het Nederlands van de code, en dat ziet de speler.
test('elke sleutel van elk getal in de werkbank heeft een Engelse naam', () => {
  const alle = T.WERKBANK.flatMap((deel) => T.werkbankGetallen(deel));
  const mist = new Set();
  for (const g of alle) {
    if (!g.pad.includes('_INSTELLINGEN.')) continue; // de losse getallen hebben hun eigen naam, in T.WERKBANK
    const delen = g.pad.split('.');
    for (let i = 1; i < delen.length; i++) {
      if (/^\d+$/.test(delen[i])) continue;
      const tot = delen.slice(0, i + 1).join('.');
      if (!T.werkbankNaam(tot)) mist.add(tot);
    }
  }
  assert.deepEqual([...mist], [], 'zet de sleutel in NAAM_VAN_SLEUTEL (js/opties.js), met een Engelse naam');
  // Een naam uit woorden van een sleutel (inWoorden) heeft geen hoofdletter midden in een woord; een Engelse naam wel
  // een hoofdletter na een spatie, maar niet zo.
  for (const g of alle) assert.ok(!/[a-z][A-Z]/.test(g.label), `${g.pad}: ${g.label}`);
  for (const deel of T.WERKBANK) assert.ok(/^[A-Z]/.test(deel.naam), `kop ${deel.naam}`);
});

test('wat je in de werkbank zet, gaat vóór een keuze, en is terug te zetten', () => {
  T.pasOptiesToe({ keuzes: { graan: 'ruim' }, getallen: { GRAAN_PER_TEGEL: 6, 'HEER_INSTELLINGEN.boete': 0.8 } });
  assert.equal(T.GRAAN_PER_TEGEL, 6);
  assert.equal(T.HEER_INSTELLINGEN.boete, 0.8);
  const g = T.werkbankGetallen(T.WERKBANK[0]).find((x) => x.pad === 'GRAAN_PER_TEGEL');
  assert.equal(g.eigen, true);
  assert.equal(g.standaard, 5, 'zonder de werkbank zet de keuze Ruim er 5');
  T.pasOptiesToe({ keuzes: { graan: 'ruim' } });
  assert.equal(T.GRAAN_PER_TEGEL, 5);
  assert.equal(T.HEER_INSTELLINGEN.boete, bestanden.HEER_INSTELLINGEN.boete);
  // Een pad dat niet bestaat, of geen getal is, doet niets.
  T.pasOptiesToe({ getallen: { 'HEER_INSTELLINGEN.bestaatNiet': 3, 'HEER_INSTELLINGEN.betalenIn': 4 } });
  assert.equal(T.HEER_INSTELLINGEN.betalenIn, 'watHijZiet');
  assert.deepEqual(T.OPTIES_NU.getallen, {});
});

test('een naam komt overal: bij de mens, in zijn gesprek, en op zijn poppetje', () => {
  const e = T.maakMens('boer2', 3, 3);
  const S = { wereld: { wezens: [e] } };
  T.pasOptiesToe({ namen: { boer2: 'Grietje' } }, S);
  assert.equal(T.naamVanMens('boer2'), 'Grietje');
  assert.equal(e.naam, 'Grietje');
  // Leeg, of alleen spaties, is de standaard.
  T.pasOptiesToe({ namen: { boer2: '   ' } }, S);
  assert.equal(e.naam, namen.boer2);
  assert.deepEqual(T.OPTIES_NU.namen, {});
});

test('de heer heeft standaard geen naam; geef je hem er een, dan draagt hij die', () => {
  assert.equal(T.naamVanDeHeer(), null);
  T.pasOptiesToe({ namen: { heer: 'Jonker Gijsbrecht' } });
  assert.equal(T.naamVanDeHeer(), 'Jonker Gijsbrecht');
  assert.equal(T.GESPREKKEN.heer.naam, 'Jonker Gijsbrecht');
});

test('onthouden en teruglezen, en een kapotte of lege opslag breekt niets', () => {
  const geheugen = {};
  const opslag = { setItem: (k, v) => { geheugen[k] = v; }, getItem: (k) => (k in geheugen ? geheugen[k] : null) };
  T.pasOptiesToe({ keuzes: { betalenIn: 'alleenGoud' }, namen: { boer1: 'Joost' }, getallen: { DAG_LENGTE: 1 } });
  T.bewaarOpties(opslag);
  T.pasOptiesToe(null);
  const terug = T.laadOpties(opslag);
  assert.deepEqual(terug, { keuzes: { betalenIn: 'alleenGoud' }, namen: { boer1: 'Joost' }, getallen: { DAG_LENGTE: 1 } });
  T.pasOptiesToe(terug);
  assert.equal(T.HEER_INSTELLINGEN.betalenIn, 'alleenGoud');
  assert.equal(T.DAG_LENGTE, 1);
  for (const k in geheugen) geheugen[k] = '{kapot';
  assert.equal(T.laadOpties(opslag), null);
  const stuk = { getItem: () => { throw new Error('geblokkeerd'); }, setItem: () => { throw new Error('vol'); } };
  assert.equal(T.laadOpties(stuk), null);
  assert.doesNotThrow(() => T.bewaarOpties(stuk));
});

test('een keus van vroeger voor een spelregel die er niet meer is, telt niet', () => {
  const opslag = (i) => ({ getItem: () => JSON.stringify(i), setItem: () => {} });
  // De browser onthield "Je gehucht" en "Het begin" van vóór ronde 2 van het snoeien (stap 3): die spelregels zijn weg,
  // en een nieuw spel begint toch leeg op het eiland.
  T.pasOptiesToe(T.laadOpties(opslag({ keuzes: { gehucht: 'maker', begin: 'gehucht', betalenIn: 'alleenGoud' }, namen: {}, getallen: {} })));
  assert.deepEqual(T.OPTIES_NU.keuzes, { betalenIn: 'alleenGoud' });
  assert.equal(T.MAKER_INSTELLINGEN.opEiland, true);
  assert.equal(T.HEER_INSTELLINGEN.betalenIn, 'alleenGoud');
  T.pasOptiesToe(null);
});

test('zetOptie, zetGetal, zetNaam en optiesTerug veranderen één ding en laten de rest staan', () => {
  T.zetOptie('graan', 'honger');
  T.zetGetal('HEER_INSTELLINGEN.wachtDagen', 5);
  T.zetNaam('boer5', 'Hein');
  assert.equal(T.GRAAN_PER_TEGEL, 3.5);
  assert.equal(T.HEER_INSTELLINGEN.wachtDagen, 5);
  assert.equal(T.naamVanMens('boer5'), 'Hein');
  T.zetGetal('HEER_INSTELLINGEN.wachtDagen', null);
  assert.equal(T.HEER_INSTELLINGEN.wachtDagen, bestanden.HEER_INSTELLINGEN.wachtDagen);
  assert.equal(T.GRAAN_PER_TEGEL, 3.5, 'de keuze blijft');
  T.optiesTerug();
  assert.equal(T.GRAAN_PER_TEGEL, 4);
  assert.equal(T.naamVanMens('boer5'), namen.boer5);
});

test('een bereik voor de schuif past bij het getal', () => {
  assert.deepEqual(T.werkbankBereik(20), { min: 0, max: 60, stap: 1 });
  assert.deepEqual(T.werkbankBereik(0.05), { min: 0, max: 0.2, stap: 0.001 });
  assert.deepEqual(T.werkbankBereik(0.5), { min: 0, max: 1, stap: 0.01 });
  assert.deepEqual(T.werkbankBereik(2.5), { min: 0, max: 8, stap: 0.1 });
  assert.deepEqual(T.werkbankBereik(0), { min: 0, max: 1, stap: 0.01 });
});
