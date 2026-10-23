// De stapels, de dragers en de ossenkar (js/kar.js; werklijst C, stap 1; Marcel, 14 okt: "A2, B2, C1, D2, E2"; vraag 184,
// 20 okt: de dragers): wat een gebouw maakt, ligt op een stapel bij zijn deur tot een drager of een kar het haalt, en telt
// pas in de opslag; wat een bouwplaats of een werkplaats nodig heeft, brengen ze uit de opslag.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { leegBegin, proefDorp, bouwAf, dagen } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

// Het proefdorp (test/grond.cjs), stil: het raadhuis (de opslag), twee boerderijen en hutten.
function dorp() {
  const { S, D, w, raadhuis, boerderijen } = proefDorp(T);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  T.S = S;
  return { S, D, w, raadhuis, boerderijen, dag: Math.floor(S.kalender.dag) };
}

// Wat de dragers samen dragen, van `wat`.
const gedragen = (D, wat) => D.bewoners.mensen.reduce((n, p) => n + ((p.vervoer && p.vervoer.lading[wat]) || 0), 0);

// Een houthakker bij het vuur, meteen af; geeft het gebouw en de dag erna.
function metHouthakker(S, D, dag) {
  T.wijzigVoorraad(D, 'hout', 20);
  T.wijzigVoorraad(D, 'goud', 10);
  const g = T.proefdorp.zetBijHetVuur(D, 'houthakker');
  bouwAf(T, D, g, dag);
  dagen(T, S, dag + 1);
  return g;
}

test('het dragen begint als het kamp op is; tot dan gaat wat er gemaakt wordt meteen de voorraad in, en de huifkar rijdt niet', () => {
  const { S, D } = leegBegin(T);
  assert.equal(T.metVervoer(D), false, 'onderweg wordt er nog niets gedragen');
  T.opStapel(D, { soort: 'hut', x: 0, y: 0 }, 'hout', 3);
  assert.equal(D.voorraad.hout, 3, 'zonder vervoer telt het meteen');
  dagen(T, S, 1);
  assert.equal(T.metVervoer(D), true);
  assert.deepEqual(T.karrenVan(D), [], 'het begin heeft geen kar (vraag 184): vanaf dag één dragen de mensen');
  assert.equal(D.begin.kar.vel, 'huifkar');
  const k = D.plek.kamp.kar;
  assert.deepEqual(T.deVoorraad(D), { x: k.x, y: k.y, naast: true }, 'de huifkar is de opslag, tot het raadhuis er is');
  assert.ok(T.dragersVan(D).length > 0, 'wie geen werk heeft, draagt');
});

test('het hout van de houthakker ligt op zijn stapel, en telt pas als een drager het in de opslag heeft', () => {
  const { S, D, dag } = dorp();
  const g = metHouthakker(S, D, dag);
  // Vannacht hakte hij: dat ligt bij zijn deur, en de dragers halen het morgen.
  dagen(T, S, dag + 2);
  assert.ok(T.stapelVan(g) > 1, `zijn stapel: ${T.stapelVan(g)}`);
  const hout = D.voorraad.hout;
  const opDeStapel = g.stapel.hout;
  dagen(T, S, dag + 3);
  // (op een half hout na: wat de gezinnen sprokkelen en stoken, gaat ook door de voorraad)
  assert.ok(Math.abs(D.voorraad.hout - (hout + opDeStapel)) < 0.5, `de dragers haalden het gisteren binnen: ${D.voorraad.hout} en ${hout} + ${opDeStapel}`);
  assert.equal(gedragen(D, 'hout'), 0, 'en niemand draagt nog iets');
});

test('een drager loopt in de werktijd: naar de stapel, één stuk laden, terug, lossen, in het tempo van een mens', () => {
  const { S, D, raadhuis, dag } = dorp();
  const g = metHouthakker(S, D, dag);
  // De nacht van dag + 1 hakte hij; de dag zelf halen de dragers het.
  const d = dag + 1;
  let v = null;
  const fasen = [];
  let lading = 0;
  for (let u = 0; u < 24; u += 0.02) {
    S.kalender.dag = d + u / 24;
    T.werkKarBij(S, D);
    if (!v) {
      const p = D.bewoners.mensen.find((q) => q.vervoer && q.vervoer.rit && q.vervoer.rit.plan === 'halen' && q.vervoer.rit.naar === g);
      if (p) v = p.vervoer;
    }
    if (!v) continue;
    const f = v.rit ? v.rit.fase : null;
    if (f !== (fasen.length ? fasen[fasen.length - 1].f : undefined)) fasen.push({ f, u });
    if (f === 'terug') lading = Math.max(lading, v.lading.hout || 0);
    if (fasen.length && f === null) break;
  }
  assert.deepEqual(fasen.map((x) => x.f), ['heen', 'laden', 'terug', 'lossen', null]);
  const werk = T.dagindeling(d);
  assert.ok(fasen[0].u >= werk.werkBegin - 0.03, `hij begint niet voor het werk (${fasen[0].u})`);
  assert.equal(lading, T.KAR_INSTELLINGEN.perDrager, 'één stuk per keer');
  // terug: zo lang als een mens erover loopt, van de deur van de houthakker naar de opslag
  const snelheid = T.BEWONERS_INSTELLINGEN[T.LEEFTIJDEN[v.bewoner.leeftijd].snelheid];
  const terug = ((T.afstand(T.deurVan(D.wereld, g), T.deurVan(D.wereld, raadhuis)) - 2) / snelheid / T.DAG_LENGTE) * 24;
  assert.ok(fasen[3].u - fasen[2].u >= terug, `terug ${fasen[3].u - fasen[2].u} uur, minstens ${terug}`);
  assert.ok(T.afstand({ x: v.tx, y: v.ty }, T.deurVan(D.wereld, raadhuis)) <= 2, 'hij loste bij de deur van de opslag');
});

test('een volle stapel zet het gebouw stil, tot er iemand komt', () => {
  const { S, D, dag } = dorp();
  const g = metHouthakker(S, D, dag);
  g.stapel = { hout: T.KAR_INSTELLINGEN.stapelVol };
  g.karKanNietTot = dag + 100; // er komt niemand bij
  dagen(T, S, dag + 2);
  assert.equal(T.stapelVan(g), T.KAR_INSTELLINGEN.stapelVol, 'er komt niets bij');
  assert.match(g.stilWant, /stack is full/);
  g.karKanNietTot = 0;
  dagen(T, S, dag + 3);
  assert.ok(T.stapelVan(g) < T.KAR_INSTELLINGEN.stapelVol, 'de dragers haalden het, en hij hakt weer');
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
  // goud wordt niet gedragen (stap 3: de rest wel)
  const goud = D.voorraad.goud;
  T.opStapel(D, g, 'goud', 5);
  assert.equal(D.voorraad.goud, goud + 5);
  T.opStapel(D, g, 'graan', 5);
  assert.equal(g.stapel.graan, 5);
});

test('een drager halverwege zijn rit, bewaard en geladen, loopt verder', () => {
  const { S, D, dag } = dorp();
  const g = metHouthakker(S, D, dag);
  const d = dag + 1;
  const terug = () => D.bewoners.mensen.find((p) => p.vervoer && p.vervoer.rit && p.vervoer.rit.fase === 'terug' && p.vervoer.lading.hout > 0);
  for (let u = 0; u < 24 && !terug(); u += 0.02) {
    S.kalender.dag = d + u / 24;
    T.werkKarBij(S, D);
  }
  const p = terug();
  assert.ok(p, 'er loopt er een terug met hout');
  const hout = D.voorraad.hout;
  const onderweg = gedragen(D, 'hout');
  const S2 = {};
  assert.ok(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 0 })).gelukt);
  const D2 = S2.dorp;
  const p2 = D2.bewoners.mensen.find((q) => q.naam === p.naam);
  assert.equal(p2.vervoer.rit.fase, 'terug', 'hij is nog onderweg');
  assert.equal(p2.vervoer.bewoner, p2, 'en weet wie hij is');
  dagen(T, S2, d + 1);
  assert.ok(D2.voorraad.hout > hout + onderweg - 1, 'hij loste wat hij droeg');
  assert.equal(T.stapelVan(D2.gebouwen.find((x) => x.soort === g.soort)) > 0, true, 'en vannacht hakte de houthakker weer');
});

// ---------------------------------------------------------------------------------------------
// Stap 2: de bouwplaats krijgt haar hout gebracht (B2), en de werkplaats wat hij verwerkt
// ---------------------------------------------------------------------------------------------

// Een hut bij het vuur, neergezet zoals de speler het doet (T.plaatsGebouw): een bouwplaats. Moet er gerooid worden, dan
// is dat meteen gedaan (het hout gaat de voorraad in; een toets zet die erna), zodat de dragers er hout heen kunnen brengen.
function zetHut(D) {
  const g = T.proefdorp.zetBijHetVuur(D, 'hut');
  if (g.wachtOpRooien) {
    for (const t of T.teRooienOp(D, g.kavel)) T.rooiTegel(D, t);
    g.wachtOpRooien = false;
    T.zetOpDeKaart(D, g);
  }
  return g;
}

test('neerzetten kost alleen het goud; het hout is wat de bouwplaats gebracht wil hebben', () => {
  const { D } = dorp();
  T.zetVoorraad(D, 'hout', 3);
  T.zetVoorraad(D, 'goud', 10);
  const g = T.proefdorp.zetBijHetVuur(D, 'houthakker');
  assert.equal(D.voorraad.hout, 3, 'het hout blijft liggen tot de dragers het halen');
  assert.equal(D.voorraad.goud, 10 - T.GEBOUWEN.houthakker.kosten.goud);
  assert.deepEqual(g.bouw.nodig, { hout: T.GEBOUWEN.houthakker.kosten.hout });
  assert.deepEqual(g.bouw.er, {});
  assert.equal(T.nogTeBrengen(D, 'hout'), T.GEBOUWEN.houthakker.kosten.hout);
  T.zetVoorraad(D, 'goud', 0);
  assert.equal(T.plaatsGebouw(D, 'hut', 0, 0).gelukt, false, 'zonder goud niet');
});

test('de dragers brengen het hout naar de bouwplaats, en de bouwers komen zo ver als het hout reikt', () => {
  const { S, D, dag } = dorp();
  const g = zetHut(D);
  T.zetVoorraad(D, 'hout', 5);
  // De dragers brengen wat er is (5 van de 8, één stuk per keer), en de bouwers bouwen ermee.
  dagen(T, S, dag + 1);
  dagen(T, S, dag + 2);
  assert.equal(g.bouw.er.hout, 5, 'ze brachten wat er was');
  assert.equal(D.voorraad.hout < 1, true, 'uit de opslag');
  const deel = 5 / T.GEBOUWEN.hut.kosten.hout;
  dagen(T, S, dag + 3);
  assert.ok(g.bouw.gedaan <= g.bouw.werk * deel + 1e-9, `zo ver als het hout reikt: ${g.bouw.gedaan}`);
  assert.ok(!g.klaar);
  assert.equal(T.wachtOpHout(g), true);
  assert.match(T.gebouwToestand(D, g), /waiting for carriers to bring logs \(5 of 8 here\)/);
  // wie bouwt, gaat niet naar een plaats die op hout wacht
  dagen(T, S, dag + 4);
  assert.equal(D.bewoners.mensen.filter((p) => p.bouwt === g).length, 0, 'niemand staat te wachten');
  // komt er hout, dan brengen ze de rest, en wordt hij af
  T.zetVoorraad(D, 'hout', 20);
  for (let d = dag + 5; d < dag + 10 && !g.klaar; d++) dagen(T, S, d);
  assert.equal(g.bouw.er.hout, T.GEBOUWEN.hut.kosten.hout);
  assert.ok(g.klaar, 'de hut is af');
});

test('wat de bouwers op de plek rooien, gaat eerst in het gebouw; wat over is, op de stapel', () => {
  const { D } = dorp();
  const g = zetHut(D);
  T.opStapel(D, g, 'hout', 6);
  assert.equal(g.bouw.er.hout, 6);
  T.opStapel(D, g, 'hout', 6);
  assert.equal(g.bouw.er.hout, T.GEBOUWEN.hut.kosten.hout);
  assert.equal(g.stapel.hout, 12 - T.GEBOUWEN.hut.kosten.hout);
  assert.equal(T.nogTeBrengen(D, 'hout'), 0);
});

test('de raad rekent het hout dat de bouwplaatsen nog vragen niet als brandhout', () => {
  const { D } = dorp();
  const dag = Math.floor(D.kalender.dag);
  const g = zetHut(D);
  T.zetVoorraad(D, 'hout', 30);
  const met = T.houtVoorDeWinter(D, dag);
  g.bouw.er.hout = g.bouw.nodig.hout; // alsof het al gebracht was
  T.zetVoorraad(D, 'hout', 30);
  const zonder = T.houtVoorDeWinter(D, dag);
  assert.notDeepEqual(met, zonder, 'met hout dat de hut nog vraagt, is er minder brandhout');
});

test('de zagerij neemt zijn stammen uit wat de dragers bij hem brachten, niet uit de opslag', () => {
  const { S, D } = proefDorp(T, { gebouwen: ['zagerij'] });
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  T.S = S;
  const dag = Math.floor(S.kalender.dag);
  const g = D.gebouwen.find((x) => x.soort === 'zagerij');
  assert.ok(g.klaar);
  // Komt er niemand bij, dan staat hij stil, ook met hout in de opslag.
  g.in = {};
  g.karKanNietTot = dag + 2;
  T.zetVoorraad(D, 'hout', 40);
  dagen(T, S, dag + 1);
  assert.equal(g.werkte, 0, 'er lag niets bij hem');
  assert.equal(g.tekort, 'hout');
  assert.ok(Math.abs(D.voorraad.hout - 40) < 1, 'de opslag bleef zoals hij was');
  // Dan brengen ze hout, en zaagt hij.
  g.karKanNietTot = 0;
  T.zetVoorraad(D, 'hout', 40);
  dagen(T, S, dag + 2);
  assert.ok(g.werkte > 0, 'hij zaagt');
  assert.ok(g.stapel.planken > 0, 'de planken liggen bij zijn deur, tot iemand ze haalt');
  assert.ok(g.in.hout > 0 && g.in.hout < T.KAR_INSTELLINGEN.voorraadIn, `bij hem: ${g.in.hout}`);
  assert.ok(Math.abs(D.voorraad.hout - (40 - T.KAR_INSTELLINGEN.voorraadIn)) < 1, `de dragers namen het mee: ${D.voorraad.hout}`);
});

// ---------------------------------------------------------------------------------------------
// Stap 3: de rest van wat een gebouw maakt (Marcel, 14 okt: "a ja, b ja, c ja, d ja")
// ---------------------------------------------------------------------------------------------

test('eten op een stapel eet het dorp niet, maar het telt wel voor de winter; pas in de opslag eten ze het', () => {
  const { S, D, raadhuis, dag } = dorp();
  T.zetVoorraad(D, 'vlees', 0);
  const winterVoor = T.etenVoorDeWinter(D, dag).dagen;
  raadhuis.stapel = { vlees: 12 }; // (een stapel bij het raadhuis, alsof een jager hem maakte)
  raadhuis.karKanNietTot = dag + 2; // er komt nog niemand bij
  assert.ok(T.etenVoorDeWinter(D, dag).dagen >= winterVoor, 'het vlees komt nog binnen');
  dagen(T, S, dag + 1);
  assert.equal(D.voorraad.vlees || 0, 0, 'niet in de opslag');
  assert.ok(!D.behoeften.afwisseling.includes('vlees'), 'en niet gegeten');
  raadhuis.karKanNietTot = 0;
  dagen(T, S, dag + 2);
  assert.ok((D.voorraad.vlees || 0) + T.opDeStapels(D, 'vlees') > 0);
  assert.ok(T.opDeStapels(D, 'vlees') < 12, 'de dragers haalden het');
});

test('de oogst ligt bij de boerderij tot iemand hem haalt; wat van het vee komt, gaat meteen de voorraad in', () => {
  const { D, boerderijen } = dorp();
  const g = boerderijen[0];
  const graan = D.voorraad.graan;
  T.haalSchovenBinnen(D, 20, g);
  assert.equal(g.stapel.graan, 20);
  assert.equal(D.voorraad.graan, graan);
  T.wijnBinnen(D, 2, g);
  assert.ok(g.stapel.wijn > 0);
  // het vee hoort niet bij een gebouw (Marcel: "c ja"): zonder gebouw meteen de voorraad in
  const wol = D.voorraad.wol || 0;
  T.opStapel(D, null, 'wol', 3);
  assert.equal(D.voorraad.wol, wol + 3);
});

// ---------------------------------------------------------------------------------------------
// Stap 4: de schuur (Marcel, 14 okt: "a ja, b ja, c ja")
// ---------------------------------------------------------------------------------------------

// Een schuur zo ver mogelijk van het raadhuis, maar nog binnen het bereik, meteen af (de nacht erop).
function zetSchuur(S, D, raadhuis, dag) {
  T.wijzigVoorraad(D, 'hout', 30);
  T.wijzigVoorraad(D, 'goud', 10);
  const huis = T.deurVan(D.wereld, raadhuis);
  const plekken = [];
  const K = T.kaartVak(D.wereld);
  for (let y = K.y; y < K.y + K.h; y++) {
    for (let x = K.x; x < K.x + K.b; x++) {
      const d = Math.hypot(x - huis.x, y - huis.y);
      if (d > 10 && d < 16) plekken.push({ x, y, d });
    }
  }
  plekken.sort((a, b) => b.d - a.d);
  for (const p of plekken) {
    const u = T.plaatsGebouw(D, 'schuur', p.x, p.y); // (staat er bos, dan rooit bouwAf het)
    if (!u.gelukt) continue;
    bouwAf(T, D, u.instantie, dag);
    dagen(T, S, dag + 1);
    return u.instantie;
  }
  throw new Error('geen plek voor een schuur');
}

test('de schuur: 15 hout en 6 goud, alleen in het lege begin, een opslag met een eigen kar', () => {
  const s = T.GEBOUWEN.schuur;
  assert.deepEqual(s.kosten, { hout: 15, goud: 6 });
  assert.equal(s.trede, 'gehucht');
  assert.ok(s.opslag && s.kar && s.leeg);
  const { S, D, raadhuis, dag } = dorp();
  assert.ok(T.inBouwmenu(D, 'schuur'));
  const g = zetSchuur(S, D, raadhuis, dag);
  assert.ok(g.klaar);
  assert.equal(D.karren.length, 1, 'de schuur kreeg zijn kar (het begin heeft er geen, vraag 184)');
  const kar = D.karren[0];
  assert.equal(kar.thuis, g);
  assert.equal(g.kar, kar);
  assert.ok(D.wereld.wezens.includes(kar));
  // en een tweede schuur in het bouwmenu kan ook (hij is niet eenmalig)
  assert.ok(T.inBouwmenu(D, 'schuur'));
});

test('om de schuur heen kun je bouwen, ook waar het plein en het huis te ver zijn', () => {
  const { S, D, raadhuis, dag } = dorp();
  const g = zetSchuur(S, D, raadhuis, dag);
  const deur = T.deurVan(D.wereld, g);
  const huis = T.deurVan(D.wereld, raadhuis);
  // een tegel aan de andere kant van de schuur, 14 tegels van zijn deur
  const r = Math.hypot(deur.x - huis.x, deur.y - huis.y);
  const t = { x: Math.round(deur.x + ((deur.x - huis.x) / r) * 14), y: Math.round(deur.y + ((deur.y - huis.y) / r) * 14) };
  assert.ok(T.inBouwBereik(D, t.x, t.y), 'binnen het bereik van de schuur');
});

test('wat bij de schuur ligt, wordt in de schuur gelost; de kar wacht bij zijn schuur', () => {
  const { S, D, raadhuis, dag } = dorp();
  const g = zetSchuur(S, D, raadhuis, dag);
  const kar = D.karren[0];
  g.stapel = { steen: 10 };
  const steen = D.voorraad.steen || 0;
  dagen(T, S, dag + 2);
  assert.ok(!g.stapel.steen, 'de stapel is gehaald');
  assert.ok(D.voorraad.steen >= steen + 10 - 1e-9, 'één voorraad: hij telt in de balk');
  const bijSchuur = T.afstand({ x: kar.tx, y: kar.ty }, T.deurVan(D.wereld, g));
  assert.ok(bijSchuur <= 2, `de kar van de schuur staat bij zijn schuur (${bijSchuur})`);
});

test('elke kar haalt wat het dichtst bij zijn eigen opslag ligt; een drager lost bij de opslag die het dichtst bij is', () => {
  const { S, D, raadhuis, dag } = dorp();
  const a = zetSchuur(S, D, raadhuis, dag);
  const b = zetSchuur(S, D, raadhuis, dag + 1);
  assert.equal(D.karren.length, 2);
  const [ka, kb] = D.karren;
  // een stapel bij elke schuur: die is van zijn eigen kar
  a.stapel = { steen: 8 };
  b.stapel = { steen: 8 };
  // alleen de karren: niemand anders draagt (iedereen schuilt even)
  for (const p of D.bewoners.mensen) p.schuilt = { x: 0, y: 0 };
  dagen(T, S, dag + 3);
  assert.ok(!a.stapel.steen && !b.stapel.steen, 'allebei gehaald');
  assert.ok(T.afstand({ x: ka.tx, y: ka.ty }, T.deurVan(D.wereld, a)) <= 2 && T.afstand({ x: kb.tx, y: kb.ty }, T.deurVan(D.wereld, b)) <= 2, 'elke kar bij zijn eigen schuur');
  for (const p of D.bewoners.mensen) delete p.schuilt;
  // een drager: zijn stuk van de stapel bij schuur a lost hij in schuur a, niet in het raadhuis
  for (const k of D.karren) k.thuis = null;
  D.karren.length = 0;
  a.stapel = { steen: 1 };
  dagen(T, S, dag + 4);
  assert.ok(!a.stapel.steen, 'een drager haalde het');
  const p = D.bewoners.mensen.find((q) => q.vervoer && T.afstand({ x: q.vervoer.tx, y: q.vervoer.ty }, T.deurVan(D.wereld, a)) <= 2);
  assert.ok(p, 'en loste bij de schuur');
});
