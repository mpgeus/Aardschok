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
    if (T.isBegaanbaar(D.wereld, t.x, t.y) && T.kentTegel(D.wereld, t.x, t.y) && !T.gebouwOp(D, t.x, t.y)) return t;
  }
  throw new Error('geen vrije tegel');
}

test('je mannen zijn de held, de soldaten en de veteranen; een dorpeling niet', () => {
  const { D, a, b } = metMilitie();
  assert.deepEqual(T.mannenVan(D), [D.schout, a, b]);
  assert.ok(T.isMan(D, D.schout));
  const dorpeling = D.bewoners.mensen.find((p) => p.wezen && !p.soldaat && !p.schout).wezen;
  assert.equal(T.isMan(D, dorpeling), false);
  assert.equal(T.manTekst(D, a), `${a.bewoner.naam} · militia`);
  assert.equal(T.manTekst(D, D.schout), 'The reeve');
});

test('links kiest: een man of een dorpeling geeft zichzelf, een gebouw zijn briefje, de heer zijn gesprek', () => {
  const { S, D, a, huis } = metMilitie();
  assert.equal(T.handelingVerkennen(S, { wezen: a }).kies, a);
  const dorpeling = D.bewoners.mensen.find((p) => p.wezen && !p.soldaat && !p.schout).wezen;
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
  assert.equal(T.kentTegel(D.wereld, ver.x, ver.y), false, 'de hoek van het eiland ken je niet');
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
  const terug = T.manBriefje(D, a).delen[0].regels.find((r) => typeof r === 'object').knoppen[0];
  assert.equal(terug.tekst, 'Back to the guardhouse');
  T.geefOpdracht(S, terug.opdracht);
  T.wereldTik(S);
  assert.equal(a.post, undefined);
  assert.ok(b.post, 'alleen wie je terugriep');
  const deur = T.deurVan(D.wereld, huis);
  const anker = T.dagAnker(D, a);
  assert.deepEqual([anker.x, anker.y], [deur.x, deur.y], 'weer bij het wachthuis');
});

test("een bevel in de nacht: hij blijft die nacht op zijn post, en de nacht erna slaapt hij weer thuis", () => {
  const { S, D, huis, a } = metMilitie();
  zetUur(S, 2);
  const doel = vrijeTegel(D, T.deurVan(D.wereld, huis), 6, 2);
  T.geefOpdracht(S, T.handelingSturen(S, doel, [a]).opdracht);
  T.wereldTik(S);
  assert.equal(a.post.wakker, true);
  assert.equal(T.dagAnker(D, a).straal, 0, 'deze nacht op zijn post');
  zetUur(S, 10);
  T.wereldTik(S);
  assert.equal(a.post.wakker, undefined, 'de ochtend: het is weer een gewone post');
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
  assert.equal(meer.delen[0].regels.length, 2, 'nog geen post: geen knop');
  const dorpeling = D.bewoners.mensen.find((p) => p.wezen && !p.soldaat && !p.schout && p.huis);
  S.gekozen = dorpeling.wezen;
  const d = T.gekozenBriefje(S).briefje;
  assert.equal(d.kop, T.overBewonerTekst(D, dorpeling.wezen).split(' · ')[0]);
  assert.ok(d.delen[0].regels.every((r) => typeof r === 'string'), 'niets te zeggen: geen Talk');
});

test('de waard heeft Talk op zijn briefje: het gesprek over gisteravond', () => {
  const { S } = proefDorp(T, { gebouwen: ['herberg'] });
  const D = S.dorp;
  const g = D.gebouwen.find((x) => x.soort === 'herberg');
  const waard = D.bewoners.mensen.find((p) => p.werk === g);
  assert.ok(waard && waard.wezen, 'de herberg heeft een waard');
  assert.equal(T.gesprekBij(D, waard.wezen).id, 'waard');
  S.gekozen = waard.wezen;
  const knop = T.gekozenBriefje(S).briefje.delen[0].regels.find((r) => typeof r === 'object').knoppen[0];
  assert.deepEqual([knop.tekst, knop.gesprek], ['Talk', { id: 'waard' }]);
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
