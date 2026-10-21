// De soldaten (js/soldaten.js; werklijst vraag 159; Marcel, 15 okt: "A1, B1, C1, D1", en over de wapens "sword, spear,
// shield, pike, bow, crossbow, armor", in vaste soorten zoals in Knights and Merchants): wie geen werk heeft, wordt in het
// wachthuis soldaat met de stukken van zijn soort, de wapenmaker maakt wat er gevraagd wordt, en in het gevecht slaat elk
// wapen anders.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });

// Het proefdorp (test/grond.cjs) met een wachthuis, en desgewenst meer.
function gehucht(gebouwen = []) {
  const { S } = proefDorp(T, { gebouwen: ['wachthuis', ...gebouwen] });
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  const D = S.dorp;
  return { S, D, huis: D.gebouwen.find((g) => g.soort === 'wachthuis') };
}
// Wie soldaat kan worden: wie kan werken en geen werk heeft, volwassen of jong, niet van het gezin van de aanvoerder.
const vrij = (D) => D.bewoners.mensen.filter((p) => T.kanWerken(p) && !p.werk && ['volwassen', 'jong'].includes(p.leeftijd) && !T.vanAanvoerder(p));
// De regel van een soort op het briefje van het wachthuis.
const regelVan = (D, huis, begin) => T.gebouwBriefje(D, huis).delen.find((d) => d.titel === 'Soldiers').regels.find((r) => typeof r === 'object' && r.tekst.startsWith(begin));

test('wie geen werk heeft, wordt in het wachthuis militie; hij werkt en bouwt dan niet, en staat overdag bij het wachthuis', () => {
  const { D, huis } = gehucht();
  const voor = vrij(D);
  assert.ok(voor.length >= 2, `er zijn er die geen werk hebben (${voor.length})`);
  const werkers = D.bewoners.mensen.filter((p) => p.werk).length;
  berichten.length = 0;
  assert.equal(T.zetSoldaten(D, huis, 'militie', 1), true);
  const [p] = T.soldatenVan(D, huis);
  assert.ok(voor.includes(p), 'alleen wie geen werk had (B1)');
  assert.equal(p.soldaat.soort, 'militie');
  assert.equal(T.kanWerken(p), false, 'een soldaat is voltijds');
  assert.equal(D.bewoners.mensen.filter((q) => q.werk).length, werkers, 'niemand verloor zijn werk');
  const deur = T.deurVan(D.wereld, huis);
  assert.deepEqual([p.plek.werk.x, p.plek.werk.y], [deur.x, deur.y], 'overdag staat hij bij het wachthuis');
  T.kiesBouwers(D);
  assert.ok(!p.bouwt, 'hij bouwt niet mee');
  assert.ok(berichten.some((b) => b.includes(p.naam) && /becomes a soldier/.test(b)), berichten.join(' | '));
  assert.ok(T.militieVan(D).includes(p.wezen), 'bij een aanval vecht hij mee (js/rovers.js)');
});

test('hooguit zoveel soldaten als het wachthuis plaatsen heeft', () => {
  const { D, huis } = gehucht();
  const plaatsen = T.SOLDATEN_INSTELLINGEN.plaatsen;
  T.zetSoldaten(D, huis, 'militie', plaatsen + 3);
  assert.equal(huis.soldaten.militie, plaatsen);
  assert.equal(T.zetSoldaten(D, huis, 'speerman', 1), false, 'er is geen plaats meer');
  assert.equal(regelVan(D, huis, 'Spearman').knoppen[1].kan, false, 'de knop erbij staat uit');
  assert.ok(T.soldatenVan(D, huis).length <= plaatsen);
});

test('een speerman wacht tot speer en harnas in de opslag liggen; dan pakt hij ze, en eraf levert hij ze weer in', () => {
  const { D, huis } = gehucht();
  T.zetVoorraad(D, 'speren', 1);
  T.zetVoorraad(D, 'harnassen', 0);
  T.zetSoldaten(D, huis, 'speerman', 1);
  assert.equal(T.soldatenVan(D).length, 0, 'zonder harnas nog niet');
  assert.deepEqual(T.wapensGevraagd(D).harnassen, 1, 'het harnas is gevraagd');
  assert.match(regelVan(D, huis, 'Spearman').tekst, /0 of 1, waiting for leather armour: build a weaponsmith/);
  T.zetVoorraad(D, 'harnassen', 1);
  T.tikSoldatenDag(D);
  const [p] = T.soldatenVan(D);
  assert.equal(p.soldaat.soort, 'speerman');
  assert.equal(D.voorraad.speren, 0);
  assert.equal(D.voorraad.harnassen, 0);
  assert.equal(T.wapensGevraagd(D).speren, 0, 'er wordt niets meer gevraagd');
  // De knop eraf, zoals op het briefje: zijn opdracht, zoals de tik hem uitvoert (js/tik.js).
  const min = regelVan(D, huis, 'Spearman').knoppen[0];
  assert.equal(min.kan, true);
  assert.deepEqual(min.opdracht, { soort: 'soldaten', x: huis.x, y: huis.y, soldaat: 'speerman', verschil: -1 });
  T.OPDRACHTEN.soldaten(null, D, min.opdracht);
  assert.ok(!p.soldaat);
  assert.equal(T.kanWerken(p), true, 'hij is weer vrij');
  assert.equal(D.voorraad.speren, 1);
  assert.equal(D.voorraad.harnassen, 1);
});

test('de wapenmaker maakt wat het wachthuis vraagt, één stuk per dag, het liefst waarvoor hij heeft wat erin gaat', () => {
  const { D, huis } = gehucht(['wapenmaker']);
  const smid = D.gebouwen.find((g) => g.soort === 'wapenmaker');
  assert.equal(T.GEBOUWEN.wapenmaker.trede, 'gehucht', 'in het gehucht (C1)');
  assert.equal(T.receptVan(D, smid), null, 'niemand vraagt iets');
  assert.deepEqual(T.watErIngaat(D, smid), {}, 'dus brengt de kar hem niets');
  T.zetSoldaten(D, huis, 'zwaardvechter', 1);
  assert.deepEqual(T.watErIngaat(D, smid), { planken: 1, ijzer: 1, huiden: 2 });
  // Alleen planken: dan het schild.
  for (const wat of ['planken', 'ijzer', 'huiden']) T.zetVoorraad(D, wat, wat === 'planken' ? 10 : 0);
  smid.in = { planken: 8 };
  assert.deepEqual(T.receptVan(D, smid), { in: { planken: 1 }, uit: { schilden: 1 } });
  // Ligt het schild er al, dan het zwaard of het harnas.
  T.zetVoorraad(D, 'schilden', 1);
  T.zetVoorraad(D, 'ijzer', 10);
  smid.in = { planken: 8, ijzer: 8 };
  assert.deepEqual(T.receptVan(D, smid), { in: { ijzer: 1 }, uit: { zwaarden: 1 } });
  assert.match(T.gebouwToestand(D, smid), /Asked for at the watch house: .*sword/);
});

test('de wapenmaker maakt hele stukken: wat half af is, onthoudt hij, en op zijn stapel ligt nooit een halve speer', () => {
  // Uit de proef van 15 okt: er lag 0,8 speer in de opslag en 0,2 op zijn stapel; samen was het er een, dus hij maakte niets
  // meer, maar de kar liet het stapeltje liggen, en met 0,8 speer kon niemand speerman worden.
  const { S, D, huis } = gehucht(['wapenmaker']);
  const smid = D.gebouwen.find((g) => g.soort === 'wapenmaker');
  T.zetSoldaten(D, huis, 'speerman', 2);
  T.zetVoorraad(D, 'planken', 50);
  const begin = Math.floor(S.kalender.dag) + 1;
  let gemaakt = 0;
  for (let dag = begin; dag < begin + 8; dag++) {
    smid.in = { planken: 8 }; // wat de kar hem bracht (js/kar.js)
    S.kalender.dag = dag + 0.3;
    S.kalender.stil = [];
    T.tikGebouwenDag(D, dag);
    for (const wat of ['speren', 'harnassen']) {
      const n = ((smid.stapel && smid.stapel[wat]) || 0) + (D.voorraad[wat] || 0);
      assert.equal(n, Math.round(n), `dag ${dag}: ${n} ${wat}`);
    }
    // wat er ligt, en wat een speerman al pakte
    const ligt = ['speren', 'harnassen'].reduce((n, wat) => n + ((smid.stapel && smid.stapel[wat]) || 0) + (D.voorraad[wat] || 0), 0);
    gemaakt = ligt + 2 * T.soldatenVan(D, huis).length;
  }
  assert.ok(gemaakt >= 1, `hij maakte iets (${gemaakt})`);
  assert.ok(gemaakt <= 4, 'niet meer dan gevraagd');
  assert.equal(T.isStuk('speren'), true);
  assert.equal(T.isStuk('planken'), false);
});

test('een wachthuis dat afgebroken wordt: de soldaten leveren in en zijn weer vrij', () => {
  const { D, huis } = gehucht();
  T.zetSoldaten(D, huis, 'militie', 2);
  const wie = T.soldatenVan(D, huis);
  assert.equal(wie.length, 2);
  T.breekAf(D, huis);
  assert.equal(T.soldatenVan(D).length, 0);
  for (const p of wie) assert.equal(T.kanWerken(p), true);
});

test('een soldaat en zijn wachthuis gaan mee in een bewaard spel', () => {
  const { S, D, huis } = gehucht();
  T.zetSoldaten(D, huis, 'militie', 1);
  const { S: S2 } = proefDorp(T, { gebouwen: ['wachthuis'] });
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  const [p] = T.soldatenVan(S2.dorp);
  assert.ok(p, 'de soldaat is er nog');
  assert.equal(p.soldaat.wachthuis, S2.dorp.gebouwen.find((g) => g.soort === 'wachthuis'), 'met zijn eigen wachthuis');
  assert.equal(S2.dorp.gebouwen.find((g) => g.soort === 'wachthuis').soldaten.militie, 1);
});

// ── Het gevecht ──

// Een rij van n+1 vrije tegels naast elkaar, met zicht van de eerste tot de laatste, bij `bij`.
function vrijeRij(w, bij, n) {
  for (let r = 0; r < 40; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = bij.x + dx;
        const y = bij.y + dy;
        let ok = true;
        for (let i = 0; i <= n && ok; i++) ok = T.isBegaanbaar(w, x + i, y, { wezensBlokkeren: true }) && T.isBegaanbaar(w, x + i, y + 1, { wezensBlokkeren: true });
        if (ok && T.zichtTussen(w, { x, y }, { x: x + n, y })) return { x, y };
      }
    }
  }
  return null;
}
function zet(e, x, y) {
  e.x = e.tx = x;
  e.y = e.ty = y;
  e.pad = [];
  e.onderweg = false;
}
// Een soldaat van deze soort, met zijn stukken uit de opslag, buiten, op (x, y).
function soldaat(D, huis, soort, x, y) {
  for (const stuk of T.SOLDAAT_SOORTEN[soort].stukken) if (T.STUKKEN[stuk].waar) T.zetVoorraad(D, T.STUKKEN[stuk].waar, 1);
  const voor = new Set(T.soldatenVan(D));
  T.zetSoldaten(D, huis, soort, 1);
  const p = T.soldatenVan(D).find((q) => !voor.has(q));
  assert.ok(p, `een ${soort}`);
  p.wezen.binnen = false;
  zet(p.wezen, x, y);
  return p.wezen;
}

test('in het gevecht reiken speer en piek twee tegels, de hooivork en het zwaard één; de piek slaat harder', () => {
  const { S, D, huis } = gehucht();
  const w = S.wereld;
  const r = vrijeRij(w, { x: S.dorp.aanvoerder.tx, y: S.dorp.aanvoerder.ty }, 8);
  assert.ok(r, 'een open rij bij de aanvoerder');
  const rover = T.maakWezen('rover', r.x + 2, r.y);
  w.wezens.push(rover);
  zet(rover, r.x + 2, r.y);
  const speer = soldaat(D, huis, 'speerman', r.x, r.y);
  assert.equal(T.kanRaken(D, speer, rover), true, 'de speer reikt twee tegels');
  zet(speer, r.x, r.y + 1);
  const hooivork = soldaat(D, huis, 'militie', r.x, r.y);
  assert.equal(T.kanRaken(D, hooivork, rover), false, 'de hooivork niet');
  zet(hooivork, r.x + 1, r.y);
  assert.equal(T.kanRaken(D, hooivork, rover), true, 'van ernaast wel');
  assert.ok(T.slagVan({ kant: 'speler', bewoner: { soldaat: { soort: 'piekenier' } } }).schade[0] > T.slagVan(speer).schade[0], 'de piek slaat harder');
  assert.deepEqual(T.slagVan(S.dorp.aanvoerder).schade, T.SLAAN.schade, 'de aanvoerder slaat zoals altijd');
});

test('de boog schiet ver waar hij ziet, maar niet met een vijand naast zich', () => {
  const { S, D, huis } = gehucht();
  const w = S.wereld;
  const r = vrijeRij(w, { x: S.dorp.aanvoerder.tx, y: S.dorp.aanvoerder.ty }, 8);
  const rover = T.maakWezen('rover', r.x + 6, r.y);
  w.wezens.push(rover);
  zet(rover, r.x + 6, r.y);
  const boog = soldaat(D, huis, 'boogschutter', r.x, r.y);
  assert.equal(T.kanRaken(D, boog, rover), true, 'zes tegels ver');
  const tweede = T.maakWezen('rover', r.x + 1, r.y + 1);
  w.wezens.push(tweede);
  zet(tweede, r.x + 1, r.y + 1);
  assert.equal(T.kanRaken(D, boog, rover), false, 'met een rover naast zich schiet hij niet');
  assert.equal(T.kanRaken(D, boog, tweede), false, 'ook niet op die rover');
});

test('schild en harnas vangen een deel van elke klap af, maar niets van een bout uit een kruisboog', () => {
  const B = T.SOLDATEN_INSTELLINGEN.bescherming;
  const wie = (soort) => ({ kant: 'speler', bewoner: { soldaat: { soort } } });
  assert.equal(T.vangtAf(wie('zwaardvechter'), null), B.schild + B.harnas);
  assert.equal(T.vangtAf(wie('speerman'), null), B.harnas);
  assert.equal(T.vangtAf(wie('piekenier'), null), B.harnas);
  assert.equal(T.vangtAf(wie('boogschutter'), null), 0);
  assert.equal(T.vangtAf(wie('zwaardvechter'), wie('kruisboogschutter')), 0, 'een bout gaat erdoor');
  assert.equal(T.vangtAf(wie('zwaardvechter'), wie('boogschutter')), B.schild + B.harnas, 'een pijl niet');
});

// Vraag 171 (Marcel, 16 okt: "elke groep soldaten heeft een groepsleider die een lantaarn draagt", en "A1, B1, C1, D2").
test('elk wachthuis heeft een groepsleider: van wie dienst heeft, wie het langst dient; hij draagt een lantaarn, die in het donker brandt', () => {
  const { S, D, huis } = gehucht();
  T.zetSoldaten(D, huis, 'militie', 3);
  const [a, b, c] = T.soldatenVan(D, huis);
  Object.assign(a.soldaat, { sinds: 3 });
  Object.assign(b.soldaat, { sinds: 1, dienst: 'nacht' });
  Object.assign(c.soldaat, { sinds: 2 });
  const opUur = (u) => (S.kalender.dag = Math.floor(S.kalender.dag) + u / 24);
  opUur(10);
  assert.equal(T.groepsleiderVan(D, huis), c, 'overdag: wie van de dagdienst het langst dient');
  assert.deepEqual(T.lantaarnDragers(D), [D.aanvoerder, c.wezen], 'de aanvoerder draagt er ook een (C1)');
  assert.ok(!T.draagtLicht(D, c.wezen), 'overdag brandt hij niet');
  opUur(23);
  assert.equal(T.groepsleiderVan(D, huis), b, "'s nachts de nachtwacht");
  b.wezen.binnen = false;
  assert.ok(T.draagtLicht(D, b.wezen), 'buiten in het donker brandt hij');
  assert.ok(T.lichtBronnen(D).some((l) => l.soort === 'drager' && l.x === b.wezen.x && l.y === b.wezen.y));
  b.wezen.dood = true;
  c.wezen.wakker = true; // opgestaan (te wapen, js/kiezen.js): nu in dienst
  assert.equal(T.groepsleiderVan(D, huis), c, 'valt de leider, dan draagt de volgende de lantaarn');
});

// ---------------------------------------------------------------------------------------------
// De demo (werklijst Q, vraag 181, e; Marcel, 20 okt: "S1. Maar 2 speermannen en 1 kruisboogschutter. W. W1 L. L1", en
// "De soldaten staan gewoon waar je ze neerzet"): de wacht komt mee met de huifkar, en het wachthuis en de wapenmaker zijn
// op slot.
// ---------------------------------------------------------------------------------------------

const metDemo = (doe) => {
  T.DEMO_INSTELLINGEN.aan = true;
  try {
    return doe();
  } finally {
    T.DEMO_INSTELLINGEN.aan = false;
    T.DEMO_INSTELLINGEN.slot = null;
  }
};

test('in de demo komt de wacht mee met de huifkar: soldaten met hun eigen stukken, in een eigen tent, zonder wachthuis', () => metDemo(() => {
  const S = T.proefdorp.begin(T.proefdorp.zaad);
  const D = S.dorp;
  const wacht = T.soldatenVan(D);
  assert.deepEqual(wacht.map((p) => p.soldaat.soort), T.DEMO_INSTELLINGEN.wacht);
  assert.ok(wacht.every((p) => p.soldaat.wachthuis === null && p.huis.bewoners === 'wacht' && p.komt), 'over de weg, naar hun tent');
  assert.ok(!T.kampTenten(D).includes(wacht[0].huis), 'hun tent is geen tent van een gezin: ze trekken niet in een hut');
  assert.equal(D.bevolking, D.bewoners.mensen.length);
  // Hun stukken nemen ze niet uit de voorraad, en ze blijven soldaat, ook zonder wachthuis.
  for (const stuk of ['speren', 'schilden', 'kruisbogen', 'harnassen']) assert.ok(!(D.voorraad[stuk] < 0), stuk);
  T.werkSoldatenBij(D);
  assert.equal(T.soldatenVan(D).length, 3, 'zonder wachthuis leveren ze niet in');
  assert.ok(wacht.every((p) => !T.kanWerken(p)), 'een soldaat werkt niet');
  // In het volle spel is er geen wacht.
  T.DEMO_INSTELLINGEN.aan = false;
  assert.equal(T.soldatenVan(T.proefdorp.begin(T.proefdorp.zaad).dorp).length, 0);
}));

test('in de demo staan het wachthuis en de wapenmaker in het bouwmenu, op slot; het debugvenster zet het slot aan en uit', () => metDemo(() => {
  const { D } = proefDorp(T);
  for (const soort of ['wachthuis', 'wapenmaker']) {
    assert.ok(T.inBouwmenu(D, soort), `${soort} staat in het menu`);
    assert.ok(!T.magGebouwd(D, soort), `${soort}: de raad noemt het niet`);
    assert.equal(T.waaromPastHetNiet(D, soort, 0, 0), 'In the full game.');
  }
  assert.ok(T.magGebouwd(D, 'hut'), 'de rest is open');
  T.DEMO_INSTELLINGEN.slot = false; // het debugvenster: uit
  assert.ok(T.magGebouwd(D, 'wachthuis'));
  T.DEMO_INSTELLINGEN.aan = false;
  T.DEMO_INSTELLINGEN.slot = true; // en aan, ook buiten de demo, om te proberen
  assert.ok(!T.magGebouwd(D, 'wachthuis'));
  T.DEMO_INSTELLINGEN.slot = null;
  assert.ok(T.magGebouwd(D, 'wachthuis'), 'in het volle spel is niets op slot');
}));
