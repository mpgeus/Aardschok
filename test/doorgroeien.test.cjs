// Een huis dat doorgroeit, rooit eerst wat in de weg staat (werklijst vraag 130; Marcel, 6 okt: "Ok" op a met c, en "A"
// voor de appelboom). Op elk land van de maker stond bij het begin een hut die nooit kon doorgroeien, meestal door één
// struik, en daarom won er geen dorp. Nu rooit het gezin dat erin woont eerst wat er op de nieuwe voet staat (de man met
// de bijl, zijn gezin helpt), zoals een gezin zijn erf; een appelboom gaat alleen om als geen vorm zonder hem past. Wat
// het dan nog tegenhoudt (een gebouw, een erf, een deur), zegt het briefje bij het huis.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
T.ui = new Proxy({}, { get: (_, k) => (k === 'bericht' ? (tekst) => berichten.push(String(tekst)) : () => undefined) });

// Een land van de maker, zoals een nieuw spel begint, stil en met een vaste worp.
function land(zaad) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  return S;
}

// Zonder voorvallen (dan komt er niemand de schout zoeken), met een vaste worp, en na afloop alles terug.
function zo(f) {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('voorvallen', 'uit');
  berichten.length = 0;
  try {
    return f();
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
}

// De hutten waar geen vorm past zoals hij is, maar wel als het gezin eerst rooit (T.groeiPlanVan, js/behoeften.js).
const huttenDieRooien = (D) => D.gebouwen.filter((g) => g.soort === 'hut' && g.klaar && g.voorwerp).map((g) => ({ g, plan: T.groeiPlanVan(D, g) })).filter((x) => x.plan && !x.plan.past && x.plan.rooien && x.plan.rooien.length);
const appels = (plan) => plan.rooien.filter((t) => t.appel).length;

// Dit huis heeft morgen een maand alles (een put en een kapel bij de deur; eten en brandhout heeft het gehucht bij het
// begin), en de bouwstof is er.
function klaarOmTeGroeien(D, g) {
  D.gebouwen.push({ soort: 'put', x: g.x - 4, y: g.y, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  D.gebouwen.push({ soort: 'kapel', x: g.x - 8, y: g.y, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  g.groeiDagen = T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen - 1;
  T.zetVoorraad(D, 'hout', 100);
}

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag`.
function totUur(S, dag, tot) {
  S.kalender.snelheid = 30;
  while (S.kalender.dag < dag + tot / 24) {
    const dt = 1 / 60;
    S.tijd += dt;
    const dtW = dt * T.wereldFactor(S);
    S.wereldTijd += dtW;
    T.tikKalender(S, dt);
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtW);
    T.werkAnimatiesBij(S, dt, dtW);
    T.werkOogstBij(S, S.dorp, dtW);
    T.werkVeldwerkBij(S, S.dorp);
    T.laatDwalen(S, dtW);
  }
}

// Alleen de regels, nacht na nacht (zonder poppetjes: dan rooit niemand, tot de buren het na rooiDagen doen).
function nachten(S, van, tot) {
  for (let dag = van; dag <= tot; dag++) {
    S.kalender.dag = dag;
    T.tikGebouwenDag(S.dorp, dag);
  }
}

test('op elk land van de speeltest staat een hut die alleen kan doorgroeien als het gezin eerst rooit, en zonder appelboom', () => {
  zo(() => {
    for (const zaad of [62707, 73425, 72022]) {
      const D = land(zaad).dorp;
      const lijst = huttenDieRooien(D);
      assert.ok(lijst.length >= 1, `op ${zaad} een hut die eerst moet rooien`);
      for (const { plan } of lijst) assert.equal(appels(plan), 0, `op ${zaad} past er een vorm zonder de appelboom`);
      // Zonder rooien kon geen enkele hut ervan groeien, en er staat bij het begin niets in de weg wat niet te rooien is.
      for (const g of D.gebouwen) assert.equal(T.waaromGroeitHetNiet(D, g), null, `${zaad}: ${g.soort} op ${g.x},${g.y}`);
    }
  });
});

test('het hoofd van het gezin rooit met de bijl wat in de weg staat, zijn gezin helpt en werkt zolang nergens, en dan groeit de hut', () => {
  zo(() => {
    const S = land(62707);
    const D = S.dorp;
    const { g, plan } = huttenDieRooien(D)[0];
    klaarOmTeGroeien(D, g);
    const gezin = D.bewoners.mensen.filter((p) => p.huis === g);
    const hoofd = gezin.find((p) => !p.hoofd);
    totUur(S, 1, 7); // de nacht: een maand alles, maar geen vorm past zoals hij is
    assert.equal(g.soort, 'hut');
    assert.equal(g.rooitVoorGroei, true);
    assert.deepEqual(g.kavel, { x: g.x, y: g.y, b: plan.voet.b, h: plan.voet.h }, 'het rooit de nieuwe voet');
    assert.equal(g.rooienTot, 1 + T.BOS_INSTELLINGEN.rooiDagen);
    assert.deepEqual(T.teRooienOp(D, g.kavel).map((t) => `${t.x},${t.y}`).sort(), plan.rooien.map((t) => `${t.x},${t.y}`).sort());
    assert.ok(berichten.some((b) => b.startsWith(`Het gezin van ${T.naamVanBewoner(hoofd)} rooit eerst`)), berichten.join('\n'));
    assert.equal(T.rooitHij(hoofd), g);
    T.wijsWerkToe(D);
    assert.ok(gezin.every((p) => !p.werk), 'wie rooit, werkt nergens');
    // Het briefje zegt wat het gezin rooit.
    assert.match(T.huisToestand(D, g).groei.rooit, /struik|boom/);
    let gerooid = false;
    let geholpen = false;
    for (let dag = 1; dag <= 6 && g.soort === 'hut'; dag++) {
      for (let uur = 8; uur <= 17; uur += 0.5) {
        totUur(S, dag, uur);
        const e = hoofd.wezen;
        if (e && e.werkt && (e.werkt.soort === 'hakken' || e.werkt.soort === 'rooien')) gerooid = true;
        if (gezin.some((p) => p !== hoofd && p.wezen && T.helpAnker(D, p.wezen))) geholpen = true;
      }
      totUur(S, dag + 1, 7);
    }
    assert.ok(gerooid, 'hij hakte of rooide');
    if (gezin.some((p) => p !== hoofd && (p.leeftijd === 'volwassen' || p.leeftijd === 'jong'))) assert.ok(geholpen, 'zijn gezin hielp');
    assert.equal(g.soort, 'huis', 'en dan groeit de hut');
    assert.deepEqual(g.voet, plan.voet);
    assert.equal(g.rooitVoorGroei, undefined);
    assert.equal(g.kavel, undefined);
    assert.equal(T.teRooienOp(D, { x: g.x, y: g.y, b: plan.voet.b, h: plan.voet.h }).length, 0);
    assert.ok(berichten.some((b) => b.startsWith(`Een hut is gegroeid tot een huis, voor ${T.WENSEN_INSTELLINGEN.bouwstof.huis.hout} hout`)));
    T.wijsWerkToe(D);
    assert.ok(!T.gezinRooit(g), 'daarna kan het gezin weer werken');
  });
});

test('een appelboom gaat alleen om als geen vorm zonder hem past; is de maand om, dan hakken de buren hem', () => {
  zo(() => {
    // Op land 1 staat de appelboom bij elke vorm in de weg.
    const S = land(1);
    const D = S.dorp;
    const lijst = huttenDieRooien(D).filter((x) => appels(x.plan) > 0);
    assert.equal(lijst.length, 1);
    const { g, plan } = lijst[0];
    const appel = plan.rooien.find((t) => t.appel);
    const boom = T.voorwerpOp(D.wereld, appel.x, appel.y);
    assert.equal(boom.soort, 'appelboom');
    assert.equal(T.ontginWerkOp(D.wereld, appel.x, appel.y), null, 'een appelboom rooit niemand zomaar');
    klaarOmTeGroeien(D, g);
    nachten(S, 1, 1);
    assert.equal(g.rooitVoorGroei, true);
    assert.equal(boom.omhakken, true, 'deze mag om');
    assert.equal(T.ontginWerkOp(D.wereld, appel.x, appel.y), 'hakken');
    assert.equal(D.wereld.voorwerpen.filter((v) => v.omhakken).length, 1, 'alleen deze');
    assert.match(T.rooiWoorden(T.watNogTeRooienVoorGroei(D, g)), /de appelboom \(\+10 hout\)/);
    // Niemand rooit (alleen de regels): tot de maand om is, wacht het; dan hakken de buren hem om (het hout naar de schuur),
    // en de nacht erna groeit de hut.
    const tot = g.rooienTot;
    nachten(S, 2, tot - 1);
    assert.equal(g.rooitVoorGroei, true);
    assert.equal(g.soort, 'hut');
    S.kalender.dag = tot;
    const hout = D.voorraad.hout;
    T.tikRooienDag(D);
    assert.equal(D.voorraad.hout, hout + T.BOS_INSTELLINGEN.houtPerBoom, 'het hout van de appelboom gaat naar de schuur');
    assert.equal(g.rooitVoorGroei, undefined);
    assert.notEqual(T.voorwerpOp(D.wereld, appel.x, appel.y), boom, 'de appelboom is om');
    assert.ok(berichten.some((b) => /De buren helpen .* de rest te rooien/.test(b)));
    nachten(S, tot + 1, tot + 1);
    assert.equal(g.soort, 'huis');
    assert.ok(berichten.some((b) => b.startsWith(`Een hut is gegroeid tot een huis, voor ${T.WENSEN_INSTELLINGEN.bouwstof.huis.hout} hout`)));
    assert.equal(D.wereld.voorwerpen.filter((v) => v.omhakken).length, 0);
  });
});

test('het briefje zegt waarom een huis dat alles heeft niet kan doorgroeien: een erf in de weg, en zonder erf rooit het weer', () => {
  zo(() => {
    const S = land(62707);
    const D = S.dorp;
    const { g } = huttenDieRooien(D)[0];
    klaarOmTeGroeien(D, g);
    // Een erf over de hele grond waar het huis heen zou groeien (zoals de bouwer in de speeltest er een legde).
    const erf = { x: g.x, y: g.y, b: 12, h: 12 };
    (D.erven || (D.erven = [])).push(erf);
    nachten(S, 1, 1);
    assert.equal(g.soort, 'hut');
    assert.equal(g.rooitVoorGroei, undefined, 'rooien helpt niet: het gezin begint er niet aan');
    const groei = T.huisToestand(D, g).groei;
    assert.equal(groei.inDeWeg, 'een erf ligt in de weg');
    assert.equal(groei.rooit, null);
    // Was er een nacht te weinig hout, en is het er weer, dan wacht het huis niet meer op bouwstof: geen teken van
    // bouwstof bij zijn deur, want het hout is er (eerst bleef dat staan zolang het huis niet groeide).
    const hout = D.voorraad.hout;
    T.zetVoorraad(D, 'hout', 0);
    nachten(S, 2, 2);
    assert.equal(T.tekenVanHuis(g), 'bouwstof');
    T.zetVoorraad(D, 'hout', hout);
    nachten(S, 3, 3);
    assert.equal(T.tekenVanHuis(g), null);
    assert.equal(T.huisToestand(D, g).groei.inDeWeg, 'een erf ligt in de weg');
    // Is het erf weg, dan kan het weer (meteen, niet pas morgen), en rooit het de nacht erna.
    D.erven.splice(D.erven.indexOf(erf), 1);
    assert.equal(T.waaromGroeitHetNiet(D, g), null);
    nachten(S, 4, 4);
    assert.equal(g.rooitVoorGroei, true);
  });
});

test('een gebouw in de weg noemt het briefje bij naam', () => {
  zo(() => {
    const S = land(62707);
    const D = S.dorp;
    const { g, plan } = huttenDieRooien(D)[0];
    // Een put op elke tegel waar het huis heen kan groeien en waar niets te rooien staat: dan staat de put altijd in de weg.
    const w = D.wereld;
    const oud = g.voet || T.gebouwVoet(g.soort, g.tekening);
    for (let y = g.y; y < g.y + 12; y++) {
      for (let x = g.x; x < g.x + 12; x++) {
        if ((x < g.x + oud.b && y < g.y + oud.h) || T.voorwerpOp(w, x, y)) continue;
        w.tegels[y][x] = 'muur';
        D.gebouwen.push({ soort: 'put', x, y, voet: { b: 1, h: 1 }, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
      }
    }
    T.kaartVeranderd(w);
    assert.ok(plan.rooien.length > 0);
    assert.equal(T.waaromGroeitHetNiet(D, g), 'de put staat in de weg');
  });
});

test('het briefje loot niets: vragen waarom een huis niet groeit, laat het spel niet anders lopen', () => {
  zo(() => {
    const D = land(73425).dorp;
    delete D.volgendeTekening;
    const toeval = Math.random;
    Math.random = () => {
      throw new Error('het briefje mag niet loten');
    };
    try {
      for (const g of D.gebouwen) {
        T.waaromGroeitHetNiet(D, g);
        T.groeiPlanVan(D, g);
      }
    } finally {
      Math.random = toeval;
    }
    assert.equal(D.volgendeTekening, undefined);
  });
});

test('bewaren en laden houdt een huis dat rooit om door te groeien, en de appelboom die om mag', () => {
  zo(() => {
    const S = land(1);
    const D = S.dorp;
    const { g } = huttenDieRooien(D).find((x) => appels(x.plan) > 0);
    klaarOmTeGroeien(D, g);
    nachten(S, 1, 1);
    assert.equal(g.rooitVoorGroei, true);
    const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
    const S2 = land(1);
    assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
    const D2 = S2.dorp;
    const g2 = D2.gebouwen.find((x) => x.x === g.x && x.y === g.y);
    assert.equal(g2.rooitVoorGroei, true);
    assert.deepEqual(g2.kavel, g.kavel);
    assert.equal(g2.rooienTot, g.rooienTot);
    assert.equal(D2.wereld.voorwerpen.filter((v) => v.omhakken && v.soort === 'appelboom').length, 1);
    assert.deepEqual(T.watNogTeRooienVoorGroei(D2, g2), T.watNogTeRooienVoorGroei(D, g));
  });
});
