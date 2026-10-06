// Het bos (js/bos.js; werklijst vraag 115, met 110, e; Marcel, 4 okt: "De houthakker hakt bomen om uiteindelijk en plant
// nieuwe boompjes terug", en 6 okt: "A ja B ja C ja D zo"): de houthakker maakt evenveel hout als altijd, maar het komt uit
// de dichtste boom binnen tien tegels van zijn schuur, en elke tien hout is die om. Naast de stronk plant hij een boompje,
// dat in een jaar of twee een boom is; de stronk vergaat. Staat er geen boom meer, dan staat hij stil.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Het ontworpen gehucht, zoals een nieuw spel begint, stil en met een vaste worp.
function gehucht() {
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
  return S;
}

// Zonder voorvallen en verzoeken (jij bouwt), met een vaste worp, en na afloop alles terug.
function zo(f, regels = {}) {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('wieBouwt', 'jij');
  T.zetOptie('voorvallen', 'uit');
  for (const id in regels) T.zetOptie(id, regels[id]);
  try {
    return f();
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
}

// Een nacht, zoals het spel hem tikt (js/gebouwen.js).
function nacht(S, dag) {
  S.kalender.dag = dag + 0.3;
  S.kalender.stil = [];
  T.tikGebouwenDag(S.dorp, dag);
}

// Een houthakker bij het bos, klaar en met zijn hand, en genoeg te eten zodat er gewerkt wordt. Geeft de schuur.
function metHouthakker(S) {
  const D = S.dorp;
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'houthakker', T.deurVan(D.wereld, huis));
  assert.ok(plek, 'er is een plek bij het bos');
  const u = T.plaatsGebouw(D, 'houthakker', plek.x, plek.y);
  assert.ok(u.gelukt, u.reden);
  T.zetVoorraad(D, 'graan', 500);
  T.zetVoorraad(D, 'hout', 100);
  for (let d = 1; d <= T.GEBOUWEN.houthakker.bouwtijd + 1; d++) nacht(S, d);
  assert.ok(u.instantie.klaar, 'de schuur staat');
  return u.instantie;
}

const boomOp = (w, t) => T.NATUUR.bos.telt(w, t.x, t.y, T.voorwerpOp(w, t.x, t.y));
const soortOp = (w, t) => (T.voorwerpOp(w, t.x, t.y) || {}).soort || null;
// De bomen binnen het bereik van de houthakker g: zijn voet, hakStraal tegels naar elke kant groter (zoals T.natuurBij).
const bomenBij = (D, g) => {
  const w = D.wereld;
  const f = T.voetVanGebouw(g);
  const r = T.BOS_INSTELLINGEN.hakStraal;
  const uit = [];
  for (let y = Math.max(0, f.y - r); y < Math.min(w.tegels.length, f.y + f.h + r); y++) {
    for (let x = Math.max(0, f.x - r); x < Math.min(w.tegels[0].length, f.x + f.b + r); x++) if (boomOp(w, { x, y })) uit.push({ x, y });
  }
  return uit;
};
// Het boompje naast t, of null.
function boompjeNaast(w, t) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const v = T.voorwerpOp(w, t.x + dx, t.y + dy);
      if (v && v.soort === 'boompje') return v;
    }
  }
  return null;
}

test('de houthakker hakt de dichtste boom bij zijn schuur, en elke tien hout is er een om: een stronk, met twee boompjes ernaast', () => zo(() => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const g = metHouthakker(S);
  const deur = T.deurVan(w, g);
  const boom = g.boom;
  assert.ok(boom && boomOp(w, boom), 'hij heeft een boom om aan te hakken');
  const bij = bomenBij(D, g);
  assert.ok(bij.some((t) => t.x === boom.x && t.y === boom.y), 'binnen zijn bereik');
  const d = Math.hypot(boom.x - deur.x, boom.y - deur.y);
  assert.ok(bij.every((t) => Math.hypot(t.x - deur.x, t.y - deur.y) >= d - 1e-9), 'de dichtste bij zijn deur');
  // Hij hakt; het hout komt zoals altijd, elke dag een deel, en elke tien is er een boom om.
  const hout = D.voorraad.hout;
  const om = [];
  let dag = T.GEBOUWEN.houthakker.bouwtijd + 2;
  while (om.length < 4 && dag < 80) {
    const t = g.boom && { x: g.boom.x, y: g.boom.y, bos: T.isBos(w, g.boom.x, g.boom.y, true), soort: soortOp(w, g.boom) };
    nacht(S, dag++);
    if (t && !boomOp(w, t)) om.push({ ...t, dag: dag - 1 });
  }
  assert.equal(om.length, 4, 'vier bomen om');
  assert.deepEqual({ x: om[0].x, y: om[0].y }, boom, 'eerst de dichtste');
  assert.ok(D.voorraad.hout > hout, 'het hout ging naar de schuur');
  assert.ok(g.gehakt < T.BOS_INSTELLINGEN.houtPerBoom);
  for (const t of om) {
    const stronk = T.voorwerpOp(w, t.x, t.y);
    assert.equal(stronk && stronk.soort, 'boomstronk');
    assert.equal(stronk.gehaktOp, t.dag, 'de stronk weet wanneer hij omging');
  }
  // Naast een stronk in het bos (het jonge bos meegeteld, T.isBos) twee boompjes, die weer worden wat er stond; naast een
  // boom in de wei niets.
  const geplant = w.voorwerpen.filter((v) => v.soort === 'boompje');
  for (const v of geplant) {
    const t = om.find((b) => b.dag === v.geplant && Math.abs(b.x - v.x) <= 1 && Math.abs(b.y - v.y) <= 1);
    assert.ok(t, 'naast een stronk, geplant toen hij omging');
    assert.ok(t.bos, 'alleen in het bos');
    assert.equal(v.wordt, ['eik', 'herfstEik', 'den', 'berk'].includes(t.soort) ? t.soort : 'eik', `het wordt weer een ${t.soort}`);
  }
  const inHetBos = om.filter((t) => t.bos).length;
  if (inHetBos) assert.ok(geplant.length > inHetBos, `meer dan één boompje per boom: ${geplant.length} voor ${inHetBos}`);
  assert.ok(geplant.length <= inHetBos * T.BOS_INSTELLINGEN.boompjesPerBoom, 'hooguit twee per boom');
}));

test('wat hij kapt en inplant, blijft bos: na vier jaar hakt hij minstens zoveel als in het eerste (vraag 128, f)', () => zo(() => {
  // Alleen de houthakker: geen nieuwe gezinnen (wie komt, loopt hier niet binnen, want alleen de nachten tikken), en
  // genoeg graan en hout, zodat het dorp niet krimpt.
  const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  const hakte = T.houthakkerHakte;
  T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9;
  try {
    const S = gehucht();
    const D = S.dorp;
    const g = metHouthakker(S);
    const hout = [];
    const stil = [];
    T.houthakkerHakte = (D2, g2, h) => {
      hout[hout.length - 1] += h;
      return hakte(D2, g2, h);
    };
    let dag = T.GEBOUWEN.houthakker.bouwtijd + 2;
    for (let jaar = 0; jaar < 4; jaar++) {
      hout.push(0);
      stil.push(0);
      for (let i = 0; i < 360; i++, dag++) {
        T.zetVoorraad(D, 'graan', 2000);
        T.zetVoorraad(D, 'hout', 300);
        nacht(S, dag);
        if (g.boom === null) stil[jaar]++;
      }
    }
    // Met één boompje, en alleen waar nog volgroeide bomen stonden, hakte hij in het vierde jaar 140 hout en stond hij
    // 280 dagen stil; met twee, en het jonge bos meegeteld, 473 en 88.
    assert.ok(hout[3] >= hout[0], `vierde jaar ${Math.round(hout[3])} hout, eerste ${Math.round(hout[0])}`);
    assert.ok(stil[3] < 180, `${stil[3]} dagen stil in het vierde jaar`);
  } finally {
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    T.houthakkerHakte = hakte;
  }
}));

test('een stronk staat niet in de weg: wie een boom omhakte, loopt verder het bos in', () => zo(() => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const boom = w.voorwerpen.find((v) => T.NATUUR.bos.telt(w, v.x, v.y, v));
  assert.ok(!T.isBegaanbaar(w, boom.x, boom.y), 'een boom staat in de weg');
  assert.ok(T.velBoom(D, boom.x, boom.y));
  assert.equal(soortOp(w, boom), 'boomstronk');
  assert.ok(T.isBegaanbaar(w, boom.x, boom.y), 'zijn stronk niet');
  // En de houthakker hakt een half jaar door zonder stil te staan zolang er bomen binnen zijn bereik staan.
  const g = metHouthakker(S);
  let stil = 0;
  for (let dag = 6; dag < 186; dag++) {
    nacht(S, dag);
    if (g.boom === null && bomenBij(D, g).length) stil++;
  }
  assert.equal(stil, 0, 'nooit stil met bomen binnen bereik');
}));

test('hij maakt evenveel hout als de houthakker uit het niets: twee per dag, maal hoe hard er gewerkt wordt', () => {
  const telHout = (regels) => zo(() => {
    const S = gehucht();
    const D = S.dorp;
    metHouthakker(S);
    const voor = D.voorraad.hout;
    for (let dag = 6; dag < 26; dag++) nacht(S, dag);
    return D.voorraad.hout - voor;
  }, regels);
  const hakt = telHout({ houthakker: 'hakt' });
  const niets = telHout({ houthakker: 'uitHetNiets' });
  assert.ok(Math.abs(hakt - niets) < 1e-6, `${hakt} tegen ${niets}`);
});

test('met de wet Houtkap hakt hij twee keer zo hard, en gaan er twee keer zoveel bomen om', () => {
  const telBomen = (houtkap) => zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const g = metHouthakker(S);
    if (houtkap) T.zetWet(D, 'houtkap', 'aangenomen');
    const voor = bomenBij(D, g).length;
    for (let dag = 6; dag < 36; dag++) nacht(S, dag);
    return voor - bomenBij(D, g).length;
  });
  const gewoon = telBomen(false);
  const kap = telBomen(true);
  assert.ok(gewoon >= 2, `${gewoon} bomen in dertig dagen`);
  assert.ok(kap > gewoon, `met de houtkap ${kap}, zonder ${gewoon}`);
});

test('staat er binnen tien tegels geen boom meer, dan staat hij stil en zegt de raad het; zijn hand werkt elders, en het dorp vraagt geen nieuwe', () => zo(() => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const g = metHouthakker(S);
  const hand = D.bewoners.mensen.find((p) => p.werk === g);
  assert.ok(hand, 'hij heeft een hand');
  const bomen = bomenBij(D, g);
  for (const t of bomen) T.velBoom(D, t.x, t.y);
  nacht(S, 10);
  assert.equal(g.boom, null);
  assert.match(g.stilWant, /geen boom meer binnen tien tegels/);
  assert.equal(g.werkte, 0, 'geen hout uit het niets');
  assert.match(T.gebouwToestand(D, g), /staat stil, er staat geen boom meer/);
  const raad = T.RADEN.find((x) => x.id === 'geenBoom');
  assert.ok(raad.als(D), 'de raad zegt het');
  assert.match(raad.tekst(D), /De houthakker staat stil.*Zijn hand werkt zolang ergens anders/);
  // Vraag 128, e: de volgende nacht wil hij geen handen meer, en zijn hand gaat; een nieuwe houthakker vraagt het dorp
  // niet, want het hout haalt de winter (het is lente).
  nacht(S, 11);
  assert.equal(g.handen, 0);
  assert.notEqual(hand.werk, g, 'zijn hand werkt er niet meer');
  assert.ok(!T.watTeBouwen(D).some((x) => x.soort === 'houthakker'), 'geen nieuwe houthakker omdat hij stilstaat');
  // Staat er weer een boom (een boompje is opgegroeid), dan hakt hij weer, met een hand.
  const t = bomen[0];
  const stronk = T.voorwerpOp(w, t.x, t.y);
  if (stronk) T.haalVoorwerpWeg(w, stronk);
  // Waar de stronk stond, staat nu een boom, zoals een boompje dat opgroeide.
  const eik = T.opzoekTegelNaam('eik');
  const boom = { soort: 'eik', x: t.x, y: t.y, vel: eik.vel, id: eik.id, beslaat: [1, 1] };
  T.kenSoortVan(boom);
  T.zetVoorwerp(w, boom);
  nacht(S, 12);
  assert.deepEqual(g.boom, { x: t.x, y: t.y }, 'hij heeft weer een boom');
  nacht(S, 13);
  assert.equal(g.handen, 1, 'en weer een hand');
  assert.ok(g.werkte > 0, 'en hakt');
}));

test('een houthakker komt alleen bij genoeg bos: minstens dertig bomen binnen tien tegels', () => zo(() => {
  const S = gehucht();
  const D = S.dorp;
  const bij = T.GEBOUWEN.houthakker.bij;
  assert.deepEqual({ straal: bij.straal, minstens: bij.minstens }, { straal: T.BOS_INSTELLINGEN.hakStraal, minstens: 30 });
  const g = metHouthakker(S);
  assert.ok(T.natuurBij(D.wereld, 'bos', T.voetVanGebouw(g), bij.straal) >= 30, 'waar hij kwam, staan er minstens dertig');
  // Een plek met wat bos, maar minder dan dertig bomen binnen tien tegels, zegt waarom niet; met dertig of meer niets.
  const voet = T.gebouwVoet('houthakker', T.volgendeTekening(D, 'houthakker'));
  const plekken = { weinig: null, genoeg: null };
  for (let y = 0; y < D.wereld.tegels.length; y++) {
    for (let x = 0; x < D.wereld.tegels[0].length; x++) {
      const r = { x, y, b: voet.b, h: voet.h };
      const n = T.natuurBij(D.wereld, 'bos', r, bij.straal);
      if (n >= 8 && n < 30) plekken.weinig = plekken.weinig || r;
      if (n >= 30) plekken.genoeg = plekken.genoeg || r;
    }
  }
  assert.ok(plekken.weinig && plekken.genoeg);
  assert.match(T.waaromNietBijDeNatuur(D, 'houthakker', plekken.weinig) || '', /bos/);
  assert.equal(T.waaromNietBijDeNatuur(D, 'houthakker', plekken.genoeg), null);
}));

test('een boompje wordt in een jaar of twee een jonge boom en dan een boom; een stronk vergaat na een jaar', () => zo(() => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  // Een boom in het bos, omgehakt op dag 10, met een boompje ernaast.
  S.kalender.dag = 10.3;
  const plek = w.voorwerpen.find((v) => T.NATUUR.bos.telt(w, v.x, v.y, v) && v.soort === 'eik' && T.isBos(w, v.x, v.y));
  assert.ok(plek, 'er staat een eik in het bos');
  const t = { x: plek.x, y: plek.y };
  assert.equal(T.velBoom(D, t.x, t.y), 'eik');
  const jong = T.plantNaast(D, t, 'eik');
  assert.ok(jong, 'er is plaats voor een boompje');
  assert.equal(jong.soort, 'boompje');
  assert.equal(jong.wordt, 'eik');
  assert.ok(T.isBegaanbaar(w, jong.x, jong.y), 'langs een boompje loop je');
  assert.equal(T.ontginWerkOp(w, jong.x, jong.y), 'rooien', 'wie bouwt, rooit het');
  const B = T.BOS_INSTELLINGEN;
  let wanneerJong = null;
  let wanneerBoom = null;
  for (let dag = 11; dag <= 10 + 2 * (B.boompjeDagen + B.jongeBoomDagen) + 2; dag++) {
    S.kalender.dag = dag + 0.3;
    T.tikBosDag(D);
    const soort = soortOp(w, jong);
    if (wanneerJong == null && soort === 'jongeEik') wanneerJong = dag;
    if (wanneerBoom == null && soort === 'eik') wanneerBoom = dag;
    if (dag === 10 + B.stronkDagen - 1) assert.equal(soortOp(w, t), 'boomstronk', 'de stronk staat er nog');
    if (dag === 10 + B.stronkDagen) assert.equal(soortOp(w, t), null, 'de stronk is vergaan');
  }
  assert.ok(wanneerJong >= 10 + B.boompjeDagen && wanneerJong <= 10 + 2 * B.boompjeDagen, `een jonge boom op dag ${wanneerJong}`);
  assert.ok(wanneerBoom - wanneerJong >= B.jongeBoomDagen - 1 && wanneerBoom - wanneerJong <= 2 * B.jongeBoomDagen + 1, `een boom op dag ${wanneerBoom}`);
  assert.ok(!T.isBegaanbaar(w, jong.x, jong.y), 'een boom staat in de weg');
  assert.ok(T.NATUUR.bos.telt(w, jong.x, jong.y, T.voorwerpOp(w, jong.x, jong.y)), 'en telt als boom');
}));

test('een boompje komt niet op een paadje, een veld, voor een deur of waar iemand staat', () => zo(() => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  S.kalender.dag = 10.3;
  // Een stronk midden op een akker, voor een deur: geen plek om te planten. (Een kunstje: de akker heeft geen boom.)
  const akker = w.akkers[0];
  const t = { x: akker.x + 1, y: akker.y + 1 };
  const voor = w.voorwerpen.length;
  const jong = T.plantNaast(D, t, 'eik');
  if (jong) {
    assert.ok(!T.waaromNietOpDezeGrond(D, jong.x, jong.y) && !T.bijDeur(w, jong.x, jong.y) && !T.isAangelegdPaadje(D, jong.x, jong.y));
  } else assert.equal(w.voorwerpen.length, voor);
  // Midden op de akker zelf mag het niet: alle buren zijn akker.
  const midden = { x: akker.x + Math.floor(akker.b / 2), y: akker.y + Math.floor(akker.h / 2) };
  if (akker.b >= 3 && akker.h >= 3) assert.equal(T.plantNaast(D, midden, 'eik'), null);
}));

test('met de spelregel "Hout uit het niets" hakt hij geen boom om', () => zo(() => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const g = metHouthakker(S);
  const voor = bomenBij(D, g).length;
  for (let dag = 6; dag < 30; dag++) nacht(S, dag);
  assert.equal(bomenBij(D, g).length, voor);
  assert.equal(g.stilWant, null);
}, { houthakker: 'uitHetNiets' }));

test('bewaren en laden houdt de boom van de houthakker, wat hij er al uit hakte, en de boompjes met hun dag', () => zo(() => {
  const S = gehucht();
  const D = S.dorp;
  const g = metHouthakker(S);
  for (let dag = 6; dag < 14; dag++) nacht(S, dag);
  const w = D.wereld;
  const jong = w.voorwerpen.filter((v) => v.geplant != null).map((v) => ({ x: v.x, y: v.y, soort: v.soort, geplant: v.geplant, wordt: v.wordt }));
  const stronken = w.voorwerpen.filter((v) => v.gehaktOp != null).length;
  assert.ok(stronken > 0, 'er ging een boom om');
  const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
  const D2 = S2.dorp;
  const g2 = D2.gebouwen.find((x) => x.soort === 'houthakker');
  assert.deepEqual(g2.boom, g.boom);
  assert.equal(g2.gehakt, g.gehakt);
  const w2 = D2.wereld;
  assert.deepEqual(w2.voorwerpen.filter((v) => v.geplant != null).map((v) => ({ x: v.x, y: v.y, soort: v.soort, geplant: v.geplant, wordt: v.wordt })), jong);
  assert.equal(w2.voorwerpen.filter((v) => v.gehaktOp != null).length, stronken);
}));

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag`; `elk` kijkt elk beeld mee.
function totUur(S, dag, tot, elk) {
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
    if (elk) elk();
  }
}

test('het poppetje: de houthakker loopt naar zijn boom, hakt er met de bijl aan, en brengt een bundel naar zijn schuur', () => zo(() => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const g = metHouthakker(S);
  const p = D.bewoners.mensen.find((q) => q.werk === g);
  assert.ok(p && p.wezen, 'er werkt iemand');
  const e = p.wezen;
  const deur = T.deurVan(w, g);
  let hakte = false;
  let bundel = false;
  let afgeleverd = false;
  const dag = Math.floor(S.kalender.dag) + 1;
  S.kalender.dag = dag + 6 / 24;
  totUur(S, dag, 17, () => {
    if (e.werkt && e.werkt.soort === 'hakken' && e.werkt.tot != null && !e.werkt.rust) {
      assert.deepEqual(e.werkt.op, g.boom, 'hij hakt aan zijn boom');
      assert.equal(Math.abs(e.tx - g.boom.x) + Math.abs(e.ty - g.boom.y), 1, 'van recht ernaast');
      hakte = true;
    }
    if (hakte && e.draagt === 'bundel') bundel = true;
    if (bundel && !e.draagt && T.afstand(deur, { x: e.tx, y: e.ty }) <= 1) afgeleverd = true;
  });
  assert.ok(hakte, 'hij hakte');
  assert.ok(bundel, 'hij droeg een bundel');
  assert.ok(afgeleverd, 'en legde die bij zijn schuur');
}));
