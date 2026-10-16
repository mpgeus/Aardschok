// Kijken, kiezen en sturen als een god (js/kiezen.js; werklijst vraag 170, stap 1; Marcel, 15 okt: "Een post, tot je
// terugroept"). Links kiest (T.handelingVerkennen), rechts stuurt je mannen (T.handelingSturen), en een bevel is een
// opdracht die op een tik ingaat (js/tik.js): erheen (de post), een vijand achterna, en terug.
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

// Het proefdorp met een wachthuis en twee man militie, om tien uur 's ochtends.
function metMilitie() {
  const { S } = proefDorp(T, { gebouwen: ['wachthuis'] });
  const D = S.dorp;
  const huis = D.gebouwen.find((g) => g.soort === 'wachthuis');
  assert.equal(T.zetSoldaten(D, huis, 'militie', 2), true);
  zetUur(S, 10);
  S.kalender.snelheid = 10;
  const [a, b] = T.militieVan(D);
  return { S, D, huis, a, b };
}
const zetUur = (S, uur) => {
  S.kalender.dag = Math.floor(S.kalender.dag) + uur / 24;
};
// Tik tot `klaar` (of tot het te lang duurt).
function tikTot(S, klaar, meest = 4000) {
  for (let i = 0; i < meest; i++) {
    if (klaar()) return true;
    T.wereldTik(S);
  }
  return klaar();
}
// Een vrije tegel een eind van het wachthuis, op land dat je kent.
function vrijeTegel(D, van, dx, dy) {
  for (let r = 0; r < 10; r++) {
    const t = { x: van.x + dx + r, y: van.y + dy };
    if (T.isBegaanbaar(D.wereld, t.x, t.y) && T.kentTegel(D, t.x, t.y) && !T.gebouwOp(D, t.x, t.y)) return t;
  }
  throw new Error('geen vrije tegel');
}

test('je mannen zijn de held, de soldaten en de veteranen; een dorpeling niet', () => {
  const { D, a, b } = metMilitie();
  assert.deepEqual(T.mannenVan(D), [D.aanvoerder, a, b]);
  assert.ok(T.isMan(D, D.aanvoerder));
  const dorpeling = D.bewoners.mensen.find((p) => p.wezen && !p.soldaat && !p.aanvoerder).wezen;
  assert.equal(T.isMan(D, dorpeling), false);
  assert.equal(T.manTekst(D, a), `${a.bewoner.naam} · militia`);
  assert.equal(T.manTekst(D, D.aanvoerder), 'The commander');
});

test('links kiest: een man of een dorpeling geeft zichzelf, een gebouw zijn briefje, de heer zijn gesprek', () => {
  const { S, D, a, huis } = metMilitie();
  assert.equal(T.handelingVerkennen(S, { wezen: a }).kies, a);
  const dorpeling = D.bewoners.mensen.find((p) => p.wezen && !p.soldaat && !p.aanvoerder).wezen;
  assert.equal(T.handelingVerkennen(S, { wezen: dorpeling }).kies, dorpeling);
  const h = T.handelingVerkennen(S, { x: huis.x, y: huis.y });
  h.doe();
  assert.equal(S.gekozen, huis);
  const leeg = vrijeTegel(D, T.deurVan(D.wereld, huis), 3, 0);
  assert.equal(T.handelingVerkennen(S, leeg), null, 'een lege tegel: er valt niets te kiezen');
});

test('rechts met je mannen gekozen: erheen, of een vijand achterna; op land dat je niet kent niet', () => {
  const { S, D, a, b } = metMilitie();
  const doel = vrijeTegel(D, T.tegelVan(a), 5, 0);
  assert.equal(T.handelingSturen(S, doel, []), null, 'zonder mannen doet rechts niets');
  const h = T.handelingSturen(S, doel, [a, b]);
  assert.equal(h.tekst, 'Send 2 men here');
  assert.deepEqual(h.opdracht, { soort: 'stuur', wie: [a.bewoner.id, b.bewoner.id], naar: doel });
  assert.equal(T.handelingSturen(S, doel, [a]).tekst, `Send ${a.bewoner.naam} here`);
  const wolf = T.maakWezen('wolf', doel.x, doel.y);
  D.wereld.wezens.push(wolf);
  const v = T.handelingSturen(S, { wezen: wolf, x: doel.x, y: doel.y }, [a]);
  assert.equal(v.tekst, 'Attack the wolf');
  assert.equal(v.opdracht.soort, 'volg');
  const g = T.kaartGrens(D.wereld);
  const ver = { x: g.x + 2, y: g.y + 2 };
  assert.equal(T.kentTegel(D, ver.x, ver.y), false, 'de hoek van het eiland ken je niet');
  assert.equal(T.handelingSturen(S, ver, [a]).kan, false);
});

test('erheen: elk een eigen plek, en daar is zijn post, van het opstaan tot het slapen; tot je hem terugroept', () => {
  const { S, D, huis, a, b } = metMilitie();
  const doel = vrijeTegel(D, T.deurVan(D.wereld, huis), 6, 2);
  T.geefOpdracht(S, T.handelingSturen(S, doel, [a, b]).opdracht);
  T.wereldTik(S);
  assert.ok(a.post && b.post, 'het bevel ging in bij de tik');
  assert.notDeepEqual([a.post.x, a.post.y], [b.post.x, b.post.y], 'elk een eigen plek');
  assert.ok([a, b].some((e) => e.post.x === doel.x && e.post.y === doel.y), 'een van hen op de plek zelf');
  assert.ok(tikTot(S, () => [a, b].every((e) => !e.onderweg && e.tx === e.post.x && e.ty === e.post.y)), 'ze komen er');
  // Een uur later staan ze er nog (het dwalen laat ze staan, T.dagAnker geeft hun post).
  const tot = S.kalender.dag + 1 / 24;
  tikTot(S, () => S.kalender.dag >= tot, 40000);
  for (const e of [a, b]) assert.deepEqual([e.tx, e.ty], [e.post.x, e.post.y], `${e.naam} staat nog op zijn post`);
  assert.deepEqual(T.dagAnker(D, a), { x: a.post.x, y: a.post.y, straal: 0 });
  // 's Nachts slaapt hij thuis: zijn post geldt niet.
  zetUur(S, 2);
  assert.notDeepEqual(T.dagAnker(D, a), { x: a.post.x, y: a.post.y, straal: 0 });
  zetUur(S, 10);
  // Terug: de post is weg, en overdag hoort hij weer bij het wachthuis.
  const terug = T.manBriefje(D, a).delen[0].regels.find((r) => r.tekst === 'His post').knoppen[0];
  assert.equal(terug.tekst, 'Back to the guardhouse');
  T.geefOpdracht(S, terug.opdracht);
  T.wereldTik(S);
  assert.equal(a.post, undefined);
  assert.ok(b.post, 'alleen wie je terugriep');
  const deur = T.deurVan(D.wereld, huis);
  const anker = T.dagAnker(D, a);
  assert.deepEqual([anker.x, anker.y], [deur.x, deur.y], 'weer bij het wachthuis');
});

test("een bevel terwijl hij rust: hij staat op en blijft in dienst tot zijn eigen dienst begint; de nacht erna slaapt hij weer thuis", () => {
  const { S, D, huis, a } = metMilitie();
  zetUur(S, 2);
  assert.equal(T.inDienst(D, a), false, "'s nachts rust de dagdienst");
  const doel = vrijeTegel(D, T.deurVan(D.wereld, huis), 6, 2);
  T.geefOpdracht(S, T.handelingSturen(S, doel, [a]).opdracht);
  T.wereldTik(S);
  assert.equal(a.wakker, true);
  assert.equal(T.dagAnker(D, a).straal, 0, 'deze nacht op zijn post');
  zetUur(S, 10);
  T.wereldTik(S);
  assert.equal(a.wakker, undefined, 'de ochtend: het is weer zijn gewone dienst');
  zetUur(S, 2);
  const nacht = T.dagAnker(D, a);
  assert.ok(nacht.binnen, `de nacht erna slaapt hij thuis: ${JSON.stringify(nacht)}`);
});

test('een vijand achterna: ze lopen hem na, en is hij weg, dan is waar ze staan hun post', () => {
  const { S, D, huis, a, b } = metMilitie();
  const plek = vrijeTegel(D, T.deurVan(D.wereld, huis), 8, 3);
  const wolf = T.maakWezen('wolf', plek.x, plek.y);
  wolf.dwaalt = false;
  D.wereld.wezens.push(wolf);
  T.geefOpdracht(S, T.handelingSturen(S, { wezen: wolf, x: plek.x, y: plek.y }, [a, b]).opdracht);
  T.wereldTik(S);
  assert.equal(a.volgt, wolf);
  assert.equal(b.volgt, wolf);
  assert.ok(tikTot(S, () => T.raakt(D.wereld, T.tegelVan(a), T.tegelVan(wolf)) && !a.onderweg), 'hij staat naast de wolf');
  wolf.dood = true;
  T.wereldTik(S);
  assert.equal(a.volgt, undefined);
  assert.ok(a.post, 'hij houdt zijn plek');
});

test('wie zijn wapens neerlegt, is geen man meer en verliest zijn post', () => {
  const { S, D, huis, a } = metMilitie();
  const doel = vrijeTegel(D, T.deurVan(D.wereld, huis), 6, 2);
  T.geefOpdracht(S, T.handelingSturen(S, doel, [a]).opdracht);
  T.wereldTik(S);
  assert.ok(a.post);
  T.zetSoldaten(D, huis, 'militie', -2);
  assert.equal(T.isMan(D, a), false);
  T.dagAnker(D, a);
  assert.equal(a.post, undefined);
});

test('het briefje: van één man, van meer, en van een dorpeling met Talk als hij iets te zeggen heeft', () => {
  const { S, D, a, b } = metMilitie();
  const een = T.manBriefje(D, a);
  assert.equal(een.kop, a.bewoner.naam);
  assert.match(een.doet, /^Militia/);
  assert.ok(een.delen[0].regels.includes('Life: 16 of 16'), JSON.stringify(een.delen));
  assert.ok(een.delen[0].regels.includes('Carries: pitchfork'));
  S.gekozen = [a, b];
  const meer = T.gekozenBriefje(S).briefje;
  assert.equal(meer.kop, '2 men');
  assert.equal(meer.delen[0].regels.length, 4, 'twee namen, hun formatie en hun dienst; nog geen post: geen knop terug');
  const formatie = meer.delen[0].regels[2];
  assert.equal(formatie.tekst, 'Formation');
  assert.deepEqual(formatie.knoppen.map((k) => [k.tekst, k.kan]), [['Line', false], ['Ring', true]], 'een Line hebben ze al');
  const dienst = meer.delen[0].regels[3];
  assert.equal(dienst.tekst, 'Watch');
  assert.deepEqual(dienst.knoppen.map((k) => [k.tekst, k.kan]), [['Day', false], ['Night', true]], 'de dagdienst hebben ze al');
  const dorpeling = D.bewoners.mensen.find((p) => p.wezen && !p.soldaat && !p.aanvoerder && p.huis);
  S.gekozen = dorpeling.wezen;
  const d = T.gekozenBriefje(S).briefje;
  assert.equal(d.kop, T.overBewonerTekst(D, dorpeling.wezen).split(' · ')[0]);
  assert.ok(d.delen[0].regels.every((r) => typeof r === 'string'), 'niets te zeggen: geen Talk');
});

test('het praten is geparkeerd (stap 5): de waard heeft geen Talk, een klik op de marskramer opent zijn handel, op de heer zijn venster', () => {
  const { S } = proefDorp(T, { gebouwen: ['herberg'] });
  const D = S.dorp;
  const g = D.gebouwen.find((x) => x.soort === 'herberg');
  const waard = D.bewoners.mensen.find((p) => p.werk === g);
  assert.ok(waard && waard.wezen, 'de herberg heeft een waard');
  S.gekozen = waard.wezen;
  assert.ok(T.gekozenBriefje(S).briefje.delen[0].regels.every((r) => typeof r === 'string'), 'geen knop op zijn briefje');
  const geopend = [];
  const oud = T.ui;
  T.ui = new Proxy({}, { get: (_, naam) => (...a) => geopend.push(naam) });
  try {
    const kramer = T.maakMens('marskramer', waard.wezen.tx, waard.wezen.ty, 1);
    T.marskramerKomt(D, 0, S.kalender.dag);
    const h = T.handelingVerkennen(S, { wezen: kramer, x: kramer.x, y: kramer.y });
    assert.equal(h.tekst, 'Trade with the merchant');
    h.doe();
    assert.deepEqual(geopend, ['openHandel']);
    D.marskramer.weg = true;
    assert.equal(T.handelingVerkennen(S, { wezen: kramer, x: kramer.x, y: kramer.y }).doe, undefined, 'wie vertrekt, handelt niet meer');
    const heer = T.maakMens('heer', waard.wezen.tx, waard.wezen.ty, 1);
    T.heerKomt(D, S.kalender.dag);
    const k = T.handelingVerkennen(S, { wezen: heer, x: heer.x, y: heer.y });
    assert.equal(k.tekst, 'Pay the lord');
    k.doe();
    assert.deepEqual(geopend, ['openHandel', 'openHeer']);
  } finally {
    T.ui = oud;
  }
});

test('twee werelden met dezelfde bevelen blijven gelijk (lockstep)', () => {
  const speel = () => {
    const { S, D, huis, a, b } = metMilitie();
    const doel = vrijeTegel(D, T.deurVan(D.wereld, huis), 6, 2);
    T.geefOpdracht(S, T.handelingSturen(S, doel, [a, b]).opdracht);
    for (let i = 0; i < 600; i++) T.wereldTik(S);
    return JSON.stringify(T.bewaarSpel(S, { nu: 0 }));
  };
  assert.ok(speel() === speel());
});

// ── De formaties (vraag 170, stap 3; Marcel, 16 okt: "A1, B1, C1, D1, E1") ──

// Een tegel met een vrij vierkant van `r` tegels eromheen, een eind van `van`, op land dat je kent: daar schuift niemand.
function vrijVeld(D, van, dx, dy, r = 3) {
  const vrij = (x, y) => T.isBegaanbaar(D.wereld, x, y) && T.kentTegel(D, x, y) && !T.gebouwOp(D, x, y);
  for (let i = 0; i < 30; i++) {
    const t = { x: van.x + dx + i, y: van.y + dy };
    let ok = true;
    for (let y = -r; y <= r && ok; y++) for (let x = -r; x <= r && ok; x++) ok = vrij(t.x + x, t.y + y);
    if (ok) return t;
  }
  throw new Error('geen vrij veld');
}
// Zet wezen e op tegel (x, y), buiten en stil.
function zetOp(e, x, y) {
  Object.assign(e, { tx: x, ty: y, x, y, pad: [] });
  delete e.binnen;
}
// Hoe ver een plek vooruit ligt in richting f, en hoe ver opzij.
const vooruit = (p, naar, f) => (p.x - naar.x) * f.x + (p.y - naar.y) * f.y;
const opzij = (p, naar, f) => (p.x - naar.x) * -f.y + (p.y - naar.y) * f.x;
// Drie soldaten: militie, een speerman en een boogschutter (het wachthuis geeft ze hun wapens).
function drieSoorten() {
  const m = metMilitie();
  const { D, huis } = m;
  assert.equal(T.zetSoldaten(D, huis, 'militie', 1), true);
  const [, b, c] = T.militieVan(D);
  b.bewoner.soldaat.soort = 'speerman';
  c.bewoner.soldaat.soort = 'boogschutter';
  return { ...m, b, c };
}

test('de rij van een man: wie slaat voor, wie steekt erachter, wie schiet een rij verder', () => {
  const { D, a, b, c } = drieSoorten();
  assert.deepEqual([T.rijVan(a), T.rijVan(b), T.rijVan(c), T.rijVan(D.aanvoerder)], [0, 1, 2, 0]);
});

test('een Line: rijen dwars op de looprichting, op wapen gesorteerd, en ze kijken allemaal de kant op waar ze heen liepen', () => {
  const { S, D, a, b, c } = drieSoorten();
  const naar = vrijVeld(D, T.tegelVan(a), 8, 0);
  [a, b, c].forEach((e, i) => zetOp(e, naar.x - 6, naar.y + i - 1));
  const { plekken, richting: f } = T.formatiePlekken(D, [c, b, a], naar);
  assert.deepEqual(f, { x: 1, y: 0 }, 'ze lopen naar rechtsonder in beeld');
  const van = (e) => plekken.find((p) => p.e === e);
  assert.deepEqual([vooruit(van(a), naar, f), vooruit(van(b), naar, f), vooruit(van(c), naar, f)], [1, 0, -1], 'de middelste rij op de plek');
  for (const p of plekken) assert.deepEqual(p.kijk, f);
  // Als bevel: dat zijn hun posten, met hun kijkrichting.
  T.geefOpdracht(S, T.handelingSturen(S, naar, [a, b, c]).opdracht);
  T.wereldTik(S);
  for (const e of [a, b, c]) assert.deepEqual([e.post.x, e.post.y, e.post.kijk, e.post.richting], [van(e).x, van(e).y, f, f]);
});

test('een Line: hooguit `breedte` naast elkaar, wie er meer is, staat een rij erachter; in een rij wie links liep links', () => {
  const { D, huis, a, b } = metMilitie();
  T.zetSoldaten(D, huis, 'militie', 1);
  const c = T.militieVan(D)[2];
  const naar = vrijVeld(D, T.tegelVan(a), 8, 0);
  const f = { x: 1, y: 0 };
  const rij = T.formatiePlekken(D, [a, b, c], naar, f).plekken;
  assert.ok(rij.every((p) => vooruit(p, naar, f) === 0), 'drie naast elkaar, op de plek');
  assert.deepEqual(rij.map((p) => opzij(p, naar, f)).sort(), [-1, 0, 1]);
  const IN = T.KIEZEN_INSTELLINGEN.formatie;
  const was = IN.breedte;
  IN.breedte = 2;
  try {
    const twee = T.formatiePlekken(D, [a, b, c], naar, f).plekken;
    assert.deepEqual(twee.map((p) => vooruit(p, naar, f)).sort(), [-1, 0, 0], 'twee voor, een erachter');
  } finally {
    IN.breedte = was;
  }
  // Wie links staat, komt links: opzij gesorteerd zoals ze stonden.
  zetOp(a, naar.x - 6, naar.y - 2);
  zetOp(b, naar.x - 6, naar.y + 2);
  const [pa, pb] = [a, b].map((e) => T.formatiePlekken(D, [a, b], naar, f).plekken.find((p) => p.e === e));
  assert.ok(opzij(pa, naar, f) < opzij(pb, naar, f), 'niemand kruist');
});

test('een Ring: wie slaat en steekt in een kring om de plek, naar buiten kijkend; de schutters binnenin', () => {
  const { S, D, a, b, c } = drieSoorten();
  const naar = vrijVeld(D, T.tegelVan(a), 8, 0);
  T.zetFormatie(D, T.nummersVan(D, [a, b, c]), 'ring');
  assert.deepEqual([a.formatie, b.formatie, c.formatie], ['ring', 'ring', 'ring'], 'zonder post: alleen de keuze');
  assert.equal(a.post, undefined, 'en wie geen post heeft, blijft waar hij is');
  const { plekken, richting: f } = T.formatiePlekken(D, [a, b, c], naar);
  const van = (e) => plekken.find((p) => p.e === e);
  assert.deepEqual([van(c).x, van(c).y], [naar.x, naar.y], 'de boogschutter in het midden');
  assert.deepEqual(van(c).kijk, f);
  for (const e of [a, b]) {
    const p = van(e);
    assert.equal(Math.max(Math.abs(p.x - naar.x), Math.abs(p.y - naar.y)), 1, `${e.naam} op de kring`);
    assert.ok((p.x - naar.x) * p.kijk.x + (p.y - naar.y) * p.kijk.y > 0, `${e.naam} kijkt naar buiten`);
  }
  assert.notDeepEqual([van(a).x, van(a).y], [van(b).x, van(b).y]);
  assert.equal(Math.abs(van(a).x - van(b).x) + Math.abs(van(a).y - van(b).y) >= 2, true, 'tegenover elkaar, niet naast elkaar');
  // Alleen schutters: dan staan zij in de kring.
  const alleen = T.formatiePlekken(D, [c], naar).plekken;
  assert.deepEqual([alleen[0].x, alleen[0].y], [naar.x, naar.y], 'een man alleen staat op de plek');
  S.kalender.snelheid = 10;
});

test('een plek op een boom, een huis of water schuift naar de dichtste vrije tegel', () => {
  const { D, a, b, huis } = metMilitie();
  const naar = { x: huis.x, y: huis.y };
  assert.ok(!T.isBegaanbaar(D.wereld, naar.x, naar.y) || T.gebouwOp(D, naar.x, naar.y), 'op het wachthuis kan niemand staan');
  const { plekken } = T.formatiePlekken(D, [a, b], naar);
  for (const p of plekken) assert.ok(T.isBegaanbaar(D.wereld, p.x, p.y), `${p.e.naam} staat op een vrije tegel`);
  assert.notDeepEqual([plekken[0].x, plekken[0].y], [plekken[1].x, plekken[1].y], 'elk een eigen tegel');
});

test('de formatie hoort bij de mannen: de knop zet wie een post heeft meteen zo, en de volgende rechtsklik houdt hem', () => {
  const { S, D, a, b } = metMilitie();
  const naar = vrijVeld(D, T.tegelVan(a), 8, 0);
  T.geefOpdracht(S, T.handelingSturen(S, naar, [a, b]).opdracht);
  T.wereldTik(S);
  const lijn = [a, b].map((e) => [e.post.x, e.post.y]);
  // De knop Ring op hun briefje.
  S.gekozen = [a, b];
  const ring = T.gekozenBriefje(S).briefje.delen[0].regels.find((r) => r.tekst === 'Formation').knoppen[1];
  assert.deepEqual(ring.opdracht, { soort: 'formatie', wie: [a.bewoner.id, b.bewoner.id], formatie: 'ring' });
  T.geefOpdracht(S, ring.opdracht);
  T.wereldTik(S);
  assert.deepEqual([a.formatie, b.formatie], ['ring', 'ring']);
  assert.notDeepEqual([a, b].map((e) => [e.post.x, e.post.y]), lijn, 'ze gaan meteen anders staan');
  assert.deepEqual(a.post.richting, { x: 1, y: 0 }, 'de richting van de troep blijft');
  assert.deepEqual(T.gekozenBriefje(S).briefje.delen[0].regels.find((r) => r.tekst === 'Formation').knoppen.map((k) => k.kan), [true, false]);
  // De volgende rechtsklik houdt de Ring: twee man staan tegenover elkaar om de plek.
  const verder = vrijVeld(D, naar, 0, 8);
  T.geefOpdracht(S, T.handelingSturen(S, verder, [a, b]).opdracht);
  T.wereldTik(S);
  assert.deepEqual([a.formatie, b.formatie], ['ring', 'ring']);
  for (const e of [a, b]) assert.equal(Math.max(Math.abs(e.post.x - verder.x), Math.abs(e.post.y - verder.y)), 1, 'om de plek');
  // Samen met een man in een Line: de formatie van de meesten, bij gelijk een Line, en dan hebben ze die allemaal.
  delete b.formatie;
  T.stuurMannen(D, T.nummersVan(D, [a, b]), naar);
  assert.deepEqual([a.formatie, b.formatie], [undefined, undefined]);
  // Terug: de post en zijn richting zijn weg.
  T.roepTerug(D, T.nummersVan(D, [a, b]));
  assert.equal(a.post, undefined);
});

test('de held kijkt de kant op waar hij heen liep (hij heeft geen post), tot je hem op een vijand afstuurt', () => {
  const { S, D, a } = metMilitie();
  const held = D.aanvoerder;
  const naar = vrijVeld(D, T.tegelVan(a), 8, 0);
  [held, a].forEach((e, i) => zetOp(e, naar.x - 6, naar.y + i));
  T.stuurMannen(D, T.nummersVan(D, [held, a]), naar);
  assert.equal(held.post, undefined);
  const plek = T.formatiePlekken(D, [held, a], naar).plekken.find((p) => p.e === held);
  assert.deepEqual(held.kijkt, { x: plek.x + 4, y: plek.y }, 'hij kijkt naar een plek voor zich, de kant op waar hij heen liep');
  const wolf = T.maakWezen('wolf', naar.x + 2, naar.y);
  D.wereld.wezens.push(wolf);
  T.volgVijand(D, T.nummersVan(D, [held]), { x: wolf.tx, y: wolf.ty, soort: 'wolf' });
  assert.equal(held.kijkt, undefined, 'op een vijand af: hij kijkt naar zijn vijand');
  S.kalender.snelheid = 10;
});

test('de klok van het gevecht is niet de kijkrichting: wie om zich heen keek, heeft geen getal in e.kijkt', () => {
  const { S, D, a } = metMilitie();
  const wolf = T.maakWezen('wolf', a.tx + 3, a.ty);
  D.wereld.wezens.push(wolf);
  for (let i = 0; i < 30; i++) T.wereldTik(S);
  assert.notEqual(typeof a.kijkt, 'number');
  assert.equal(typeof a.omkijken, 'number', 'hij keek om zich heen');
});

// ── De diensten (vraag 170, stap 4; Marcel, 16 okt: "A1, B1, C2, D2") ──

test("de diensten: de dag van het opstaan tot het slapen bij het wachthuis, de nacht andersom; Night zet je op het briefje", () => {
  const { S, D, huis, a, b } = metMilitie();
  const deur = T.deurVan(D.wereld, huis);
  const bijWachthuis = (e) => {
    const r = T.dagAnker(D, e);
    return !!r && r.x === deur.x && r.y === deur.y && !r.binnen;
  };
  const d = T.dagindeling(S.kalender.dag);
  // De dagdienst: ook 's ochtends en 's avonds bij het wachthuis (A1: geen gat, geen put of herberg), 's nachts thuis.
  for (const uur of [d.opstaan + 0.1, 10, d.slapen - 0.1]) {
    zetUur(S, uur);
    assert.ok(bijWachthuis(a), `om ${uur.toFixed(1)} uur bij het wachthuis`);
  }
  zetUur(S, 2);
  assert.ok(T.dagAnker(D, a).binnen, "'s nachts slaapt hij thuis");
  // Night voor a, op zijn briefje: een opdracht, en dan alleen b nog in de dagdienst.
  zetUur(S, 10);
  const knop = T.manBriefje(D, a).delen[0].regels.find((r) => r.tekst === 'Watch').knoppen.find((k) => k.tekst === 'Night');
  assert.deepEqual(knop.opdracht, { soort: 'dienst', wie: [a.bewoner.id], dienst: 'nacht' });
  T.geefOpdracht(S, knop.opdracht);
  T.wereldTik(S);
  assert.equal(a.bewoner.soldaat.dienst, 'nacht');
  assert.equal(T.dienstVan(b), 'dag');
  assert.ok(T.dagAnker(D, a).binnen, 'de nachtwacht slaapt overdag');
  assert.match(T.manBriefje(D, a).doet, /Militia/);
  zetUur(S, 2);
  assert.ok(bijWachthuis(a), "'s nachts staat de nachtwacht bij het wachthuis");
  assert.ok(T.dagAnker(D, b).binnen, 'en de dagdienst slaapt');
  // Met een post: de nachtwacht staat er 's nachts, en overdag niet.
  const doel = vrijeTegel(D, deur, 6, 2);
  zetUur(S, 22.5);
  T.stuurMannen(D, [a.bewoner.id], doel);
  assert.equal(a.wakker, undefined, 'in zijn dienst: niemand hoeft op te staan');
  assert.deepEqual(T.dagAnker(D, a), { x: a.post.x, y: a.post.y, straal: 0 });
  zetUur(S, 10);
  assert.ok(T.dagAnker(D, a).binnen, 'overdag rust hij, ook met een post');
  // Day zet hem terug.
  T.zetDienst(D, [a.bewoner.id], 'dag');
  assert.equal(a.bewoner.soldaat.dienst, undefined);
  assert.deepEqual(T.dagAnker(D, a), { x: a.post.x, y: a.post.y, straal: 0 });
});

test("te wapen: wie van het wachthuis rust, staat op en gaat in dienst tot zijn eigen dienst begint; het briefje telt dag en nacht", () => {
  const { S, D, huis, a, b } = metMilitie();
  T.zetDienst(D, [b.bewoner.id], 'nacht');
  zetUur(S, 2);
  const regel = () => T.GEBOUW_DELEN.wachthuis(D, huis)[0].regels.find((r) => typeof r === 'object' && r.tekst.startsWith('On watch'));
  const r = regel();
  assert.equal(r.tekst, 'On watch by day 1, by night 1.');
  const knop = r.knoppen[0];
  assert.equal(knop.tekst, 'To arms');
  assert.equal(knop.kan, true, 'a slaapt');
  T.geefOpdracht(S, knop.opdracht);
  T.wereldTik(S);
  assert.equal(a.wakker, true, 'a staat op');
  assert.equal(b.wakker, undefined, 'b was al in dienst');
  assert.equal(T.dagAnker(D, a).binnen, undefined, 'a gaat naar het wachthuis');
  assert.equal(regel().knoppen[0].kan, false, 'iedereen is in dienst');
  // De ochtend: a is weer gewoon in zijn dienst, en b gaat slapen.
  zetUur(S, 10);
  T.wereldTik(S);
  assert.equal(a.wakker, undefined);
  assert.ok(T.dagAnker(D, b).binnen);
  assert.equal(T.manBriefje(D, b).doet.includes('asleep at home'), b.binnen === true);
});

test("de held heeft geen dienst: een bevel in de nacht wekt hem niet, hij gaat gewoon", () => {
  const { S, D, huis } = metMilitie();
  zetUur(S, 2);
  const naar = vrijeTegel(D, T.deurVan(D.wereld, huis), 6, 2);
  T.stuurMannen(D, T.nummersVan(D, [D.aanvoerder]), naar);
  assert.equal(D.aanvoerder.wakker, undefined);
  assert.equal(T.manBriefje(D, D.aanvoerder).delen[0].regels.some((r) => r.tekst === 'Watch'), false, 'geen Day en Night');
});
