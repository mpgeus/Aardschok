// Grond uit het bos (werklijst vraag 110, e, met 115; Marcel, 6 okt: "A ja B ja C ja D zo"): waar een werkplaats kan komen
// als er eerst gerooid wordt, en een huis dat doorgroeit en eerst rooit wat in de weg staat (vraag 130). Tot ronde 2 van
// het snoeien (12 okt) stond hier ook het erf dat een gezin zelf rooide (js/erven.js); de erven zijn weg.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Het ontworpen gehucht, zoals een nieuw spel begint, stil en met een vaste worp.
function gehucht(dag = 0) {
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
  S.kalender.dag = dag;
  S.dorp.gebouwenDag = Math.floor(dag);
  return S;
}

// Zonder voorvallen, met een vaste worp, en na afloop alles terug.
function zo(f) {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('voorvallen', 'uit');
  try {
    return f();
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
}

// Het dorp vol: in elk huis zoveel mensen als er plaats is.
function vol(S) {
  T.wijzigBevolking(S.dorp, S.dorp.woonruimte - S.dorp.bevolking, 'groei');
}

// De plek voor een werkplaats die het dichtst bij het plein ligt en na het rooien past, met zoveel bomen op zijn
// stuk (de voet met het looppad, T.kavelVan) als `wil` vraagt.
function werkplaatsPlek(S, soort, wil) {
  const D = S.dorp;
  const plein = T.pleinVan(S.wereld);
  const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort));
  const plekken = [];
  for (let y = 0; y < S.wereld.tegels.length; y++) {
    for (let x = 0; x < S.wereld.tegels[0].length; x++) plekken.push({ x, y, d: Math.hypot(x - plein.x, y - plein.y) });
  }
  plekken.sort((a, b) => a.d - b.d);
  for (const p of plekken) {
    const kavel = T.kavelVan(D, p.x, p.y, voet);
    if (wil(T.watTeRooien(D, kavel).bomen) && !T.waaromPastHetNiet(D, soort, p.x, p.y, null, kavel)) return { x: p.x, y: p.y, rooien: kavel };
  }
  return null;
}
const BOS = () => T.BOS_INSTELLINGEN.bosVanDeHeer;

// Stap 2: een werkplaats waar geen open grond meer is (T.plekVoor, js/bouwen.js).

test('een plek om te rooien voor een werkplaats: met zo weinig mogelijk bomen, en hij past pas na het rooien', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const bij = werkplaatsPlek(S, 'weverij', (n) => n >= BOS());
    const plek = T.plekOmTeRooien(D, 'weverij', { x: bij.x + 5, y: bij.y + 5 });
    assert.ok(plek, 'er is een plek om te rooien');
    assert.ok(plek.rooien, 'met het stuk dat eerst vrij moet');
    assert.ok(T.teRooienOp(D, plek.rooien).length > 0, 'daar staat iets te rooien');
    assert.ok(T.waaromPastHetNiet(D, 'weverij', plek.x, plek.y), 'zonder rooien past hij niet');
    assert.equal(T.waaromPastHetNiet(D, 'weverij', plek.x, plek.y, null, plek.rooien), null, 'na het rooien wel');
    // Het stuk is de voet met het looppad eromheen.
    const voet = T.gebouwVoet('weverij', T.volgendeTekening(D, 'weverij'));
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    assert.deepEqual(plek.rooien, T.kavelVan(D, plek.x, plek.y, voet));
    assert.ok(plek.rooien.b <= voet.b + 2 * n && plek.rooien.h <= voet.h + 2 * n);
  });
});

test('een put op een plek om te rooien bereikt een huis dat er nog geen heeft, waar je ook zoekt; mist niemand er een, dan geen plek', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const voet = T.gebouwVoet('put', T.volgendeTekening(D, 'put'));
    const kring = T.kringTeller(D, 'put');
    // In de speeltest van 6 okt koos hij de plek met de minste bomen bij het hart van het dorp, en kwam er elke maand een
    // put die niemand bereikte.
    for (const bij of [{ x: 0, y: 0 }, { x: S.wereld.b - 1, y: S.wereld.h - 1 }]) {
      const plek = T.plekOmTeRooien(D, 'put', bij);
      assert.ok(plek, 'er is een plek om te rooien');
      assert.ok(kring({ x: plek.x, y: plek.y, b: voet.b, h: voet.h }).zonder > 0, `${plek.x},${plek.y} bereikt een huis zonder put`);
    }
    // Bereikt de put die er staat iedereen, dan is er geen plek: niemand mist er een.
    const oud = T.WENSEN_INSTELLINGEN.kring.put;
    T.WENSEN_INSTELLINGEN.kring.put = 200;
    try {
      assert.equal(T.plekOmTeRooien(D, 'put', { x: 0, y: 0 }), null);
    } finally {
      T.WENSEN_INSTELLINGEN.kring.put = oud;
    }
  });
});

// Doorgroeien (werklijst vraag 130; Marcel, 6 okt: "Ok"): op land 62707 van de maker stond de hut van een oud stel waar
// het kleinste huis dat hij kan worden, één struik in de weg heeft. In de speeltest van vier jaar had die hut 1349 dagen
// alles en groeide hij nooit, en won daarom geen dorp. Nu rooit het gezin wat in de weg staat, en dan groeit hij. Sinds de
// grote gebouwen (vraag 114, stap 3) ligt dat land anders, en spelen de toetsen op land 62710, met net zo'n hut.
function landVanDeMaker(zaad) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  const opEiland = T.MAKER_INSTELLINGEN.opEiland;
  T.MAKER_INSTELLINGEN.opEiland = false; // een land van de maker zonder het eiland: deze toetsen gaan over zijn landen (sinds 8 okt maakt een nieuw spel het eiland, vraag 117)
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    T.MAKER_INSTELLINGEN.opEiland = opEiland;
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  return S;
}
// Een nacht, met genoeg graan en hout: zo heeft wie er woont te eten en te stoken.
function nachtMetGenoeg(S, dag) {
  T.zetVoorraad(S.dorp, 'graan', 2000);
  if (S.dorp.voorraad.hout < 300) T.zetVoorraad(S.dorp, 'hout', 300);
  S.kalender.dag = dag + 0.3;
  S.kalender.stil = [];
  T.tikGebouwenDag(S.dorp, dag);
}
// De hut van het oude stel, met een put erbij: dan heeft hij alles.
function hutMetAlles(S) {
  const D = S.dorp;
  const hut = D.gebouwen.find((g) => g.soort === 'hut' && D.bewoners.mensen.some((p) => p.huis === g) && T.groeiRooiPlan(D, g));
  assert.ok(hut, 'een bewoonde hut die eerst moet rooien');
  const plek = T.plekVoor(D, 'put', T.deurVan(D.wereld, hut));
  assert.ok(plek, 'er is een plek voor een put');
  const u = T.plaatsGebouw(D, 'put', plek.x, plek.y);
  assert.ok(u.gelukt, u.reden);
  return hut;
}

test('een hut die alles heeft maar niet past, rooit eerst wat in de weg staat, en groeit dan (vraag 130)', () => {
  zo(() => {
    const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9; // geen nieuwe gezinnen: die lopen hier niet binnen
    try {
      const S = landVanDeMaker(62710);
      const D = S.dorp;
      const hut = hutMetAlles(S);
      const plan = T.groeiRooiPlan(D, hut);
      const struiken = T.teRooienOp(D, plan);
      assert.ok(struiken.length >= 1, 'er staat iets te rooien');
      const hoofd = D.bewoners.mensen.find((p) => p.huis === hut && !p.hoofd);
      let dag = 1;
      // Een maand alles: dan wil hij groeien, maar het past niet, en het gezin gaat rooien.
      while (!hut.groeitNaRooien && dag < 80) nachtMetGenoeg(S, dag++);
      assert.ok(hut.groeitNaRooien, `het gezin rooit (dag ${dag})`);
      assert.equal(hut.soort, 'hut', 'nog een hut');
      assert.deepEqual(hut.kavel, plan, 'het stuk dat vrij moet: de nieuwe voet');
      assert.equal(T.rooitHij(hoofd), hut, 'het hoofd van het gezin rooit');
      assert.match(T.waaromGroeitHetNiet(D, hut), /the family first clears/);
      assert.match(T.huisToestand(D, hut).groei.waarom, /first clears/);
      // Wie er staat te rooien: zijn de struiken weg, dan de volgende nacht klaar, en daarna groeit hij.
      for (const t of struiken) {
        if (T.ontginWerkOp(D.wereld, t.x, t.y) === 'hakken') T.hakBoom(D, t.x, t.y);
        T.rooi(D, t.x, t.y);
      }
      nachtMetGenoeg(S, dag++);
      assert.equal(hut.groeitNaRooien, undefined, 'klaar met rooien');
      assert.equal(T.rooitHij(hoofd), null);
      nachtMetGenoeg(S, dag++);
      assert.equal(hut.soort, 'huis', 'de hut is een huis geworden');
    } finally {
      T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    }
  });
});

test('rooit niemand het, dan doen de buren de rest na een maand; staat er iets wat niet te rooien is, dan zegt het briefje het', () => {
  zo(() => {
    const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9;
    try {
      const S = landVanDeMaker(62710);
      const D = S.dorp;
      const hut = hutMetAlles(S);
      let dag = 1;
      while (!hut.groeitNaRooien && dag < 80) nachtMetGenoeg(S, dag++);
      const tot = hut.rooienTot;
      assert.equal(tot, dag - 1 + T.BOS_INSTELLINGEN.rooiDagen);
      // Hier tikken alleen de nachten: niemand rooit, tot de maand om is.
      while (hut.soort === 'hut' && dag < tot + 5) nachtMetGenoeg(S, dag++);
      assert.equal(hut.soort, 'huis', `na een maand rooien de buren, en groeit hij (dag ${dag}, tot ${tot})`);

      // Een ander land, dezelfde hut, maar met een rots waar elke vorm van het huis komt: niets te rooien, dus geen plan,
      // en het briefje zegt waarom.
      const S2 = landVanDeMaker(62710);
      const D2 = S2.dorp;
      const hut2 = hutMetAlles(S2);
      const plan = T.groeiRooiPlan(D2, hut2);
      const oud = hut2.voet || T.gebouwVoet(hut2.soort, hut2.tekening);
      const x = hut2.x + 1;
      const y = hut2.y + oud.h; // net onder de hut, in elke grotere vorm
      assert.ok(y < plan.y + plan.h);
      const t = T.opzoekTegelNaam('rots');
      const rots = { soort: 'rots', x, y, vel: t.vel, id: t.id, beslaat: [1, 1] };
      T.kenSoortVan(rots);
      const daar = T.voorwerpOp(D2.wereld, x, y);
      if (daar) T.haalVoorwerpWeg(D2.wereld, daar);
      T.zetVoorwerp(D2.wereld, rots);
      D2.wereld.tegels[y][x] = 'muur';
      T.kaartVeranderd(D2.wereld);
      assert.equal(T.groeiRooiPlan(D2, hut2), null, 'een rots rooit niemand');
      let dag2 = 1;
      while (dag2 < 60) nachtMetGenoeg(S2, dag2++);
      assert.equal(hut2.soort, 'hut');
      assert.ok(!hut2.groeitNaRooien);
      assert.match(T.waaromGroeitHetNiet(D2, hut2), /there is a rock where it has to grow/);
      assert.match(T.huisToestand(D2, hut2).groei.waarom, /a rock/);
      // Is het hout een dag op, dan wacht hij nog steeds op plaats, niet op hout: in de speeltest van 6 okt bleef een hut
      // die door een erf niet kon groeien, zo drie jaar "wachten op 8 hout".
      T.zetVoorraad(D2, 'hout', 0);
      T.zetVoorraad(D2, 'graan', 2000);
      S2.kalender.dag = dag2 + 0.3;
      S2.kalender.stil = [];
      T.tikGebouwenDag(D2, dag2++);
      assert.ok(!hut2.wachtOpBouwstof, 'hij wacht niet op hout');
      assert.notEqual(T.huisToestand(D2, hut2).teken, 'bouwstof');
      assert.match(T.huisToestand(D2, hut2).groei.waarom, /a rock/);
    } finally {
      T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    }
  });
});

// Vraag 130, wat Marcel er in de zevenendertigste sessie bij koos ("Eens alle 3"): a2, het gezin kapt ook zijn eigen
// appelboom; c2, de raad zegt het als een huis dat alles heeft, niet kan groeien (d, een erf kwam niet waar het een huis
// elke vorm afneemt, is weg met de erven).

test('a2: een appelboom is van iemand, maar staat hij waar het huis groter wordt, dan kapt het gezin hem, voor 10 hout', () => {
  zo(() => {
    const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9;
    try {
      // Op land 7777 staat een hut waar alleen een appelboom in de weg staat, bij elke vorm van het huis.
      const S = landVanDeMaker(7777);
      const D = S.dorp;
      vol(S);
      const hut = hutMetAlles(S);
      const plan = T.groeiRooiPlan(D, hut);
      const appels = [];
      for (let y = plan.y; y < plan.y + plan.h; y++) {
        for (let x = plan.x; x < plan.x + plan.b; x++) if (T.isEigenBoom(T.voorwerpOp(D.wereld, x, y))) appels.push({ x, y });
      }
      assert.ok(appels.length >= 1, 'een appelboom waar het huis groter wordt');
      const a = appels[0];
      const appel = T.voorwerpOp(D.wereld, a.x, a.y);
      assert.equal(T.ontginWerkOp(D.wereld, a.x, a.y), null, 'wie ontgint of een bouwplaats rooit, laat hem staan');
      assert.equal(T.hakBoom(D, a.x, a.y), false, 'en omhakken kan niet');
      let dag = 1;
      while (!hut.groeitNaRooien && dag < 80) nachtMetGenoeg(S, dag++);
      assert.ok(hut.groeitNaRooien, 'het gezin rooit');
      assert.equal(appel.teKappen, true);
      assert.equal(T.ontginWerkOp(D.wereld, a.x, a.y), 'hakken', 'nu is hij een boom als elke andere');
      assert.match(T.waaromGroeitHetNiet(D, hut), /one tree/);
      const hout = D.voorraad.hout;
      assert.equal(T.hakBoom(D, a.x, a.y), true);
      assert.equal(D.voorraad.hout - hout, T.BOS_INSTELLINGEN.houtPerBoom);
      T.rooi(D, a.x, a.y);
      while (hut.soort === 'hut' && dag < 80 + T.BOS_INSTELLINGEN.rooiDagen) nachtMetGenoeg(S, dag++);
      assert.equal(hut.soort, 'huis', 'en de hut groeit');
    } finally {
      T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    }
  });
});

test('a2: woont er niemand meer in het huis dat zou groeien, dan is de appelboom weer van iemand', () => {
  zo(() => {
    const S = landVanDeMaker(7777);
    const D = S.dorp;
    // een hut waar niemand woont, met een appelboom waar hij groter wordt
    const metAppel = (g) => {
      const p = T.groeiRooiPlan(D, g);
      if (!p) return false;
      for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.b; x++) if (T.isEigenBoom(T.voorwerpOp(D.wereld, x, y))) return true;
      return false;
    };
    const hut = D.gebouwen.find((g) => g.soort === 'hut' && !D.bewoners.mensen.some((p) => p.huis === g) && metAppel(g));
    assert.ok(hut, 'een lege hut met een appelboom in de weg');
    const plan = T.groeiRooiPlan(D, hut);
    T.rooiOmTeGroeien(D, hut, plan);
    const appels = [];
    for (let y = plan.y; y < plan.y + plan.h; y++) {
      for (let x = plan.x; x < plan.x + plan.b; x++) {
        const v = T.voorwerpOp(D.wereld, x, y);
        if (T.isEigenBoom(v)) appels.push(v);
      }
    }
    assert.ok(appels.length && appels.every((v) => v.teKappen));
    S.kalender.dag = 1.3;
    T.tikRooienDag(D); // er woont niemand in deze hut
    assert.ok(!hut.groeitNaRooien);
    assert.ok(appels.every((v) => !v.teKappen && T.voorwerpOp(D.wereld, v.x, v.y) === v), 'hij staat er nog, en is weer van iemand');
  });
});

test('a2: de eigen appelboom gaat alleen om als geen vorm zonder hem kan (Marcel: "A")', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const w = S.wereld;
    // De hut op 44, 44 in het ontworpen gehucht groeit naar rechts (x 50) of naar onder (y 50), elk een eigen vorm.
    const hut = D.gebouwen.find((g) => g.soort === 'hut' && g.x === 44 && g.y === 44);
    assert.ok(hut, 'de hut op 44, 44');
    const zet = (soort, x, y) => {
      const t = T.opzoekTegelNaam(soort);
      const v = { soort, x, y, vel: t.vel, id: t.id, beslaat: [1, 1] };
      T.kenSoortVan(v);
      const daar = T.voorwerpOp(w, x, y);
      if (daar) T.haalVoorwerpWeg(w, daar);
      T.zetVoorwerp(w, v);
      w.tegels[y][x] = 'muur';
      T.kaartVeranderd(w);
    };
    zet('appelboom', 50, 46); // rechts: één appelboom
    zet('struik', 45, 50); // onder: twee struiken
    zet('struik', 47, 50);
    const plan = T.groeiRooiPlan(D, hut);
    assert.ok(plan, 'het gezin kan rooien');
    const appelErin = plan.x <= 50 && 50 < plan.x + plan.b && plan.y <= 46 && 46 < plan.y + plan.h;
    assert.ok(!appelErin, 'twee struiken liever dan zijn appelboom');
    assert.deepEqual(T.teRooienOp(D, plan).map((t) => `${t.x},${t.y}`).sort(), ['45,50', '47,50']);
    // Ligt er onder een rots, dan kan het niet anders: dan gaat de appelboom om.
    zet('rots', 46, 50);
    const nu = T.groeiRooiPlan(D, hut);
    assert.ok(nu && nu.x <= 50 && 50 < nu.x + nu.b && nu.y <= 46 && 46 < nu.y + nu.h, 'nu de vorm met de appelboom');
  });
});

test('wat het briefje en de raad over groeien vragen, loot geen volgende tekening (het spel loopt niet anders naar de muis)', () => {
  zo(() => {
    const S = landVanDeMaker(62710);
    const D = S.dorp;
    const hut = D.gebouwen.find((g) => g.soort === 'hut' && T.groeiRooiPlan(D, g, false));
    hut.groeiDagen = T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen;
    if (D.volgendeTekening) delete D.volgendeTekening.huis;
    const toeval = Math.random;
    Math.random = () => {
      throw new Error('geloot');
    };
    try {
      T.waaromGroeitHetNiet(D, hut);
      T.groeiRooiPlan(D, hut, false);
    } finally {
      Math.random = toeval;
    }
    assert.ok(!D.volgendeTekening || D.volgendeTekening.huis === undefined, 'er is geen huis geloot');
  });
});
