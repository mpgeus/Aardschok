// Grond uit het bos (werklijst vraag 110, e, met 115; Marcel, 6 okt: "A ja B ja C ja D zo"): waar een werkplaats kan komen
// als er eerst gerooid wordt, en een huis dat doorgroeit en eerst rooit wat in de weg staat (vraag 130). Tot ronde 2 van
// het snoeien (12 okt) stond hier ook het erf dat een gezin zelf rooide (js/erven.js); de erven zijn weg.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

// Het proefdorp (test/grond.cjs), stil en met een vaste worp: het raadhuis, twee boerderijen met hun akker, en
// hutten. In het lege begin bouwen de mensen zelf: wat een toets neerzet met T.plaatsGebouw is een bouwplaats.
function dorp(dag, opties) {
  const { S, D } = proefDorp(T, opties);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() });
  T.S = S;
  if (dag != null) {
    S.kalender.dag = dag;
    D.gebouwenDag = Math.floor(dag);
  }
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

// De plek voor een werkplaats die het dichtst bij het plein ligt en na het rooien past, met zoveel bomen op zijn
// stuk (de voet met het looppad, T.kavelVan) als `wil` vraagt.
function werkplaatsPlek(S, soort, wil) {
  const D = S.dorp;
  const plein = T.pleinVan(S.dorp);
  const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort));
  const plekken = [];
  const K = T.kaartVak(S.wereld);
  for (let y = K.y; y < K.y + K.h; y++) {
    for (let x = K.x; x < K.x + K.b; x++) plekken.push({ x, y, d: Math.hypot(x - plein.x, y - plein.y) });
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
    const S = dorp();
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

// Doorgroeien (werklijst vraag 130; Marcel, 6 okt: "Ok"): een hut die alles heeft, maar niet groter kan worden omdat er iets
// in de weg staat. In het ontworpen gehucht en op de landen van de maker stond zo'n hut van een oud stel; nu is het de eerste
// hut van het proefdorp waar een gezin woont. Rechts van een hut ligt elke vorm waar hij in groeit (in zijn stijl passen ze
// in elkaar: 7 bij 5, 8 bij 6, 9 bij 8), dus daar zet de toets iets neer dat in de weg staat.

// Een natuurvoorwerp (een struik, een appelboom, een rots) op een tegel, zoals de kaart het zette: de tegel zelf is vast.
function zetNatuur(w, soort, x, y) {
  const t = T.opzoekTegelNaam(soort);
  const v = { soort, x, y, vel: t.vel, id: t.id, beslaat: [1, 1] };
  T.kenSoortVan(v);
  const daar = T.voorwerpOp(w, x, y);
  if (daar) T.haalVoorwerpWeg(w, daar);
  T.zetVoorwerp(w, v);
  T.zetTegel(w, x, y, 'muur');
  T.kaartVeranderd(w);
  return v;
}
// Een nacht, met genoeg graan en hout: zo heeft wie er woont te eten en te stoken. En vis en groente erbij: met drie
// soorten eten groeit een hut door (js/behoeften.js, groeiSoorten).
function nachtMetGenoeg(S, dag) {
  T.zetVoorraad(S.dorp, 'graan', 2000);
  T.zetVoorraad(S.dorp, 'vis', 2000);
  T.zetVoorraad(S.dorp, 'groente', 2000);
  if (S.dorp.voorraad.hout < 300) T.zetVoorraad(S.dorp, 'hout', 300);
  S.kalender.dag = dag + 0.3;
  S.kalender.stil = [];
  T.tikGebouwenDag(S.dorp, dag);
}
// De dag na vandaag: waar de nachten beginnen (het proefdorp is van dag 2, en een put bouwen kost nog een nacht).
const morgen = (S) => Math.floor(S.kalender.dag) + 1;
// De eerste hut waar een gezin woont. Rechts ervan staat `wat` in de weg, op de tegel naast zijn tweede rij. (Tot 16 okt
// kreeg hij een put erbij, zodat hij alles had wat zijn stand wilde.)
function hutMetAlles(S, wat = 'struik') {
  const D = S.dorp;
  const hut = D.gebouwen.find((g) => g.soort === 'hut' && D.bewoners.mensen.some((p) => p.huis === g));
  assert.ok(hut, 'een bewoonde hut');
  zetNatuur(D.wereld, wat, hut.x + hut.voet.b, hut.y + 1);
  assert.ok(T.groeiRooiPlan(D, hut), 'hij kan alleen groeien als er eerst gerooid wordt');
  // Het gezin is binnen, zoals 's nachts: wie bij de deur staat, staat een groter huis in de weg (T.wieStaatOp).
  for (const p of D.bewoners.mensen) if (p.huis === hut && p.wezen) p.wezen.binnen = true;
  return hut;
}

test('een hut die kan groeien maar niet past, rooit eerst wat in de weg staat, en groeit dan (vraag 130)', () => {
  zo(() => {
    const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9; // geen nieuwe gezinnen: die lopen hier niet binnen
    try {
      const S = dorp();
      const D = S.dorp;
      const hut = hutMetAlles(S);
      const plan = T.groeiRooiPlan(D, hut);
      const struiken = T.teRooienOp(D, plan);
      assert.ok(struiken.length >= 1, 'er staat iets te rooien');
      const hoofd = D.bewoners.mensen.find((p) => p.huis === hut && !p.hoofd);
      const begin = morgen(S);
      let dag = begin;
      // Een maand genoeg: dan wil hij groeien, maar het past niet, en het gezin gaat rooien.
      while (!hut.groeitNaRooien && dag < begin + 80) nachtMetGenoeg(S, dag++);
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
      const S = dorp();
      const D = S.dorp;
      const hut = hutMetAlles(S);
      const begin = morgen(S);
      let dag = begin;
      while (!hut.groeitNaRooien && dag < begin + 80) nachtMetGenoeg(S, dag++);
      const tot = hut.rooienTot;
      assert.equal(tot, dag - 1 + T.BOS_INSTELLINGEN.rooiDagen);
      // Hier tikken alleen de nachten: niemand rooit, tot de maand om is.
      while (hut.soort === 'hut' && dag < tot + 5) nachtMetGenoeg(S, dag++);
      assert.equal(hut.soort, 'huis', `na een maand rooien de buren, en groeit hij (dag ${dag}, tot ${tot})`);

      // Een ander dorp, dezelfde hut, maar met een rots waar elke vorm van het huis komt: niets te rooien, dus geen plan,
      // en het briefje zegt waarom.
      const S2 = dorp();
      const D2 = S2.dorp;
      const hut2 = hutMetAlles(S2);
      const plan = T.groeiRooiPlan(D2, hut2);
      const oud = hut2.voet || T.gebouwVoet(hut2.soort, hut2.tekening);
      const x = hut2.x + 1;
      const y = hut2.y + oud.h; // net onder de hut, in elke grotere vorm
      assert.ok(y < plan.y + plan.h);
      zetNatuur(D2.wereld, 'rots', x, y);
      assert.equal(T.groeiRooiPlan(D2, hut2), null, 'een rots rooit niemand');
      let dag2 = morgen(S2);
      const eind2 = dag2 + 60;
      while (dag2 < eind2) nachtMetGenoeg(S2, dag2++);
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
      assert.ok(!T.huisToestand(D2, hut2).groei.wacht);
      assert.match(T.huisToestand(D2, hut2).groei.waarom, /a rock/);
    } finally {
      T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    }
  });
});

// Vraag 130, wat Marcel er in de zevenendertigste sessie bij koos ("Eens alle 3"): a2, het gezin kapt ook zijn eigen
// appelboom; c2, de raad zegt het als een huis dat alles heeft, niet kan groeien (d, een erf kwam niet waar het een huis
// elke vorm afneemt, is weg met de erven).

test('a2: een appelboom is van iemand, maar staat hij waar het huis groter wordt, dan kapt het gezin hem, voor het hout van een gerooide boom', () => {
  zo(() => {
    const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9;
    try {
      // Een hut waar alleen een appelboom in de weg staat, bij elke vorm van het huis.
      const S = dorp();
      const D = S.dorp;
      const hut = hutMetAlles(S, 'appelboom');
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
      const begin = morgen(S);
      let dag = begin;
      while (!hut.groeitNaRooien && dag < begin + 80) nachtMetGenoeg(S, dag++);
      assert.ok(hut.groeitNaRooien, 'het gezin rooit');
      assert.equal(appel.teKappen, true);
      assert.equal(T.ontginWerkOp(D.wereld, a.x, a.y), 'hakken', 'nu is hij een boom als elke andere');
      assert.match(T.waaromGroeitHetNiet(D, hut), /one tree/);
      const hout = D.voorraad.hout;
      assert.equal(T.hakBoom(D, a.x, a.y), true);
      assert.equal(D.voorraad.hout - hout, T.rooiHoutPerBoom(D), 'in het lege begin geeft een gerooide boom rooiHout');
      T.rooi(D, a.x, a.y);
      while (hut.soort === 'hut' && dag < begin + 80 + T.BOS_INSTELLINGEN.rooiDagen) nachtMetGenoeg(S, dag++);
      assert.equal(hut.soort, 'huis', 'en de hut groeit');
    } finally {
      T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    }
  });
});

test('a2: woont er niemand meer in het huis dat zou groeien, dan is de appelboom weer van iemand', () => {
  zo(() => {
    // Het proefdorp met een hut extra, waar niemand woont.
    const S = dorp(null, { hutten: 3 });
    const D = S.dorp;
    const hut = D.gebouwen.find((g) => g.soort === 'hut' && !D.bewoners.mensen.some((p) => p.huis === g));
    assert.ok(hut, 'een lege hut');
    const appel = zetNatuur(D.wereld, 'appelboom', hut.x + hut.voet.b, hut.y + 1);
    const plan = T.groeiRooiPlan(D, hut);
    assert.ok(plan, 'een lege hut met een appelboom in de weg');
    T.rooiOmTeGroeien(D, hut, plan);
    const appels = [];
    for (let y = plan.y; y < plan.y + plan.h; y++) {
      for (let x = plan.x; x < plan.x + plan.b; x++) {
        const v = T.voorwerpOp(D.wereld, x, y);
        if (T.isEigenBoom(v)) appels.push(v);
      }
    }
    assert.ok(appels.includes(appel) && appels.every((v) => v.teKappen));
    S.kalender.dag = 1.3;
    T.tikRooienDag(D); // er woont niemand in deze hut
    assert.ok(!hut.groeitNaRooien);
    assert.ok(appels.every((v) => !v.teKappen && T.voorwerpOp(D.wereld, v.x, v.y) === v), 'hij staat er nog, en is weer van iemand');
  });
});

test('a2: de eigen appelboom gaat alleen om als geen vorm zonder hem kan (Marcel: "A")', () => {
  zo(() => {
    const S = dorp();
    const D = S.dorp;
    const w = S.wereld;
    // De vormen van het huis liggen in de stijl van het proefdorp in elkaar (7 bij 5, 8 bij 6, 9 bij 8): dan is er nooit een
    // vorm zonder de appelboom naast een met. Daarom krijgt deze hut een losse tekening van een hut zonder stijl (zes bij
    // vier, zoals de zijne), met als huis vormen die elkaar niet bevatten: 7 bij 5 (rechts), 5 bij 7 (onder) en groter.
    const hut = D.gebouwen.find((g) => g.soort === 'hut' && D.bewoners.mensen.some((p) => p.huis === g));
    assert.ok(hut, 'een bewoonde hut');
    hut.tekening = 'huizen/hut3';
    assert.deepEqual(hut.voet, T.gebouwVoet('hut', 'huizen/hut3'), 'dezelfde voet');
    const zet = (soort, dx, dy) => zetNatuur(w, soort, hut.x + dx, hut.y + dy);
    zet('appelboom', 6, 2); // rechts: één appelboom
    zet('struik', 1, 6); // onder: twee struiken
    zet('struik', 3, 6);
    const plan = T.groeiRooiPlan(D, hut);
    assert.ok(plan, 'het gezin kan rooien');
    const appelErin = plan.x <= hut.x + 6 && hut.x + 6 < plan.x + plan.b && plan.y <= hut.y + 2 && hut.y + 2 < plan.y + plan.h;
    assert.ok(!appelErin, 'twee struiken liever dan zijn appelboom');
    assert.deepEqual(T.teRooienOp(D, plan).map((t) => `${t.x - hut.x},${t.y - hut.y}`).sort(), ['1,6', '3,6']);
    // Ligt er onder een rots, dan kan het niet anders: dan gaat de appelboom om.
    zet('rots', 2, 6);
    const nu = T.groeiRooiPlan(D, hut);
    assert.ok(nu && nu.x <= hut.x + 6 && hut.x + 6 < nu.x + nu.b && nu.y <= hut.y + 2 && hut.y + 2 < nu.y + nu.h, 'nu de vorm met de appelboom');
  });
});

test('wat het briefje en de raad over groeien vragen, loot geen volgende tekening (het spel loopt niet anders naar de muis)', () => {
  zo(() => {
    const S = dorp();
    const D = S.dorp;
    const hut = hutMetAlles(S);
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
