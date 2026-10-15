// Het gevecht in real time (js/gevecht.js; werklijst vraag 170, stap 2; Marcel, 15 okt: "Aanvallen, dan terug", "Niemand
// vanzelf", "Iedereen, wie kan vlucht", en het town hall: "Daar kunnen mensen schuilen"). Op het proefdorp
// (test/grond.cjs), met een wachthuis en twee man militie (een hooivork: kosten 3, schade 2 tot 3, ernaast).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });

function dorp() {
  const { S, D, w, schout } = proefDorp(T, { gebouwen: ['wachthuis'] });
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen' }, T.schermVelden());
  S.kalender.dag = 5 + 10 / 24; // overdag
  const huis = D.gebouwen.find((g) => g.soort === 'wachthuis');
  T.zetSoldaten(D, huis, 'militie', 2);
  const [een, twee] = T.soldatenVan(D, huis).map((p) => p.wezen);
  berichten.length = 0;
  return { S, D, w, een, twee, hal: schout };
}

function zet(e, t) {
  e.x = e.tx = t.x;
  e.y = e.ty = t.y;
  e.pad = [];
  e.onderweg = false;
  e.binnen = false;
}

// Een vrije tegel op `d` tegels van `van` (recht of schuin), die van daar te zien is. `niet`: tegels die al bezet zijn.
function plekOp(w, van, d, niet = []) {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
    const t = { x: van.x + dx * d, y: van.y + dy * d };
    if (niet.some((n) => n.x === t.x && n.y === t.y)) continue;
    if (T.isBegaanbaar(w, t.x, t.y, { wezensBlokkeren: true }) && T.zichtTussen(w, van, t)) return t;
  }
  throw new Error(`geen vrije tegel op ${d} van ${van.x},${van.y}`);
}

// Een open plek bij `bij`: een tegel met tot `r` tegels eromheen niets dan vrije grond, zodat iedereen er iedereen ziet.
function ruimePlek(w, bij, r = 6) {
  const vrij = (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true });
  for (let ring = 0; ring < 60; ring++) {
    for (let y = bij.y - ring; y <= bij.y + ring; y++) {
      for (let x = bij.x - ring; x <= bij.x + ring; x++) {
        if (Math.max(Math.abs(x - bij.x), Math.abs(y - bij.y)) !== ring) continue;
        let goed = true;
        for (let dy = -r; dy <= r && goed; dy++) for (let dx = -r; dx <= r && goed; dx++) goed = vrij(x + dx, y + dy);
        if (goed) return { x, y };
      }
    }
  }
  throw new Error(`geen open plek bij ${bij.x},${bij.y}`);
}

// Een rover op tegel t, zoals js/rovers.js er een maakt.
function rover(w, t) {
  const e = T.maakWezen('rover', t.x, t.y);
  e.rover = true;
  w.wezens.push(e);
  return e;
}

// Een dorpeling die geen man is (geen soldaat, niet de schout), buiten.
const dorpeling = (D) => D.bewoners.mensen.find((p) => p.wezen && !p.soldaat && !p.schout && !T.isMan(D, p.wezen)).wezen;

test('wie raakt, slaat; de kosten van zijn slag maal secondenPerPunt is de tijd tot de volgende', () => {
  const { S, D, w, een, twee } = dorp();
  twee.binnen = true; // alleen de eerste vecht
  const hier = ruimePlek(w, T.tegelVan(een));
  zet(een, hier);
  een.post = { x: hier.x, y: hier.y };
  const r = rover(w, plekOp(w, hier, 1));
  T.werkGevechtBij(S, D);
  assert.equal(een.doelwit, r, 'hij koos de rover die naast hem staat');
  assert.ok(r.leven >= 12 - 3 && r.leven <= 12 - 2, `een hooivork slaat 2 tot 3 (${r.leven})`);
  const klaar = 3 * T.GEVECHT_INSTELLINGEN.secondenPerPunt;
  assert.ok(Math.abs(een.slagKlaar - klaar) < 1e-9, `de volgende slag op ${klaar} (${een.slagKlaar})`);
  const na = r.leven;
  S.wereldTijd = klaar - 0.1;
  T.werkGevechtBij(S, D);
  assert.equal(r.leven, na, 'nog niet');
  S.wereldTijd = klaar;
  T.werkGevechtBij(S, D);
  assert.ok(r.leven < na, 'nu wel');
  assert.equal(r.doelwit, een, 'en de rover slaat terug');
});

test('aanvallen, dan terug: een man valt aan wat hij ziet, maar niet verder dan de leiband van zijn post', () => {
  const { S, D, w, een } = dorp();
  const post = ruimePlek(w, T.tegelVan(een));
  zet(een, post);
  een.post = { x: post.x, y: post.y };
  const L = T.GEVECHT_INSTELLINGEN.leiband;
  // Een rover die hij ziet, binnen de leiband: die valt hij aan.
  const r = rover(w, plekOp(w, post, 5));
  T.werkGevechtBij(S, D);
  assert.equal(een.doelwit, r);
  assert.ok(een.pad.length > 0, 'hij loopt erheen');
  // Hij zat hem na tot voorbij de leiband: dan laat hij hem gaan, en zijn dag (zijn post) neemt het over.
  zet(een, plekOp(w, post, L + 1));
  zet(r, plekOp(w, T.tegelVan(een), 1));
  S.wereldTijd = 1;
  T.werkGevechtBij(S, D);
  assert.equal(een.doelwit, undefined, 'buiten de leiband laat hij hem gaan');
  assert.deepEqual(T.dagAnker(D, een), { x: post.x, y: post.y, straal: 0 }, 'en gaat terug naar zijn post');
  // Een rover die hij ziet, maar ver van zijn post: die kiest hij niet.
  zet(een, post);
  zet(r, plekOp(w, post, Math.min(L + 2, T.GEVECHT_INSTELLINGEN.zicht)));
  S.wereldTijd = 10;
  T.werkGevechtBij(S, D);
  assert.equal(een.doelwit, T.afstand(T.tegelVan(r), post) <= L ? r : undefined);
});

test('een vijand die je aanwijst, valt hij aan zonder leiband; de boog schiet van ver, zonder ernaast te lopen', () => {
  const { S, D, w, een } = dorp();
  // Een boogschutter (vraag 159): het wachthuis geeft hem een boog.
  een.bewoner.soldaat.soort = 'boogschutter';
  assert.equal(T.slagVan(een).schiet, true);
  const hier = ruimePlek(w, T.tegelVan(een));
  zet(een, hier);
  const r = rover(w, plekOp(w, hier, 6));
  T.geefOpdracht(S, { soort: 'volg', wie: T.nummersVan(D, [een]), doel: { x: r.tx, y: r.ty, soort: 'rover' } });
  T.wereldTik(S);
  assert.equal(een.volgt, r);
  assert.equal(T.kanRaken(D, een, r), true, 'zes tegels: de boog reikt tot acht');
  T.werkGevechtBij(S, D);
  assert.equal(een.pad.length, 0, 'hij blijft staan en schiet');
  assert.ok(r.leven < r.maxLeven, 'en raakt');
});

test('bij een aanval komt niemand vanzelf: de soldaten blijven bij het wachthuis, en het bericht zegt hoe je ze stuurt', () => {
  const { S, D, een, twee } = dorp();
  S.kalender.dag = 5 + 17.5 / 24;
  D.rovers = D.rovers || T.nieuweRovers();
  D.rovers.aanval = { soort: 'wild', dag: 5, fase: 'wacht', aantal: 2, meteen: true };
  T.werkRoversBij(S, D);
  assert.equal(D.rovers.aanval.fase, 'komen');
  assert.ok(berichten.some((t) => /^Robbers are coming\./.test(t) && /Choose your soldiers/.test(t)), berichten.join(' | '));
  for (const e of [een, twee]) {
    assert.ok(!e.opgeroepen, 'niemand wordt opgeroepen');
    assert.notEqual(T.dagAnker(D, e), null, 'zijn dag gaat door');
  }
});

test('een rover slaat ook een dorpeling; die vlucht naar het town hall, werkt niet, en komt eruit als er geen rover meer is', () => {
  const { S, D, w, hal } = dorp();
  const e = dorpeling(D);
  const p = e.bewoner;
  zet(e, ruimePlek(w, T.tegelVan(e)));
  const r = rover(w, plekOp(w, T.tegelVan(e), 4));
  T.werkGevechtBij(S, D);
  const deur = T.deurVan(w, hal);
  assert.deepEqual(p.schuilt, deur, 'hij vlucht naar de deur van het town hall');
  assert.ok(e.pad.length > 0, 'en rent erheen');
  assert.deepEqual(T.dagAnker(D, e), { x: deur.x, y: deur.y, straal: 0, binnen: true }, 'en gaat daar naar binnen');
  assert.equal(T.blijftThuis(p, D.kalender.dag), true);
  assert.equal(T.magWerken(S, D, e), false, 'wie schuilt, werkt niet');
  assert.equal(r.doelwit, e, 'de rover zit hem na');
  // De rover is weg: iedereen komt weer naar buiten.
  w.wezens.splice(w.wezens.indexOf(r), 1);
  T.werkGevechtBij(S, D);
  assert.equal(p.schuilt, undefined);
  assert.equal(D.schuilen, false);
});

test('wie valt, is dood: een dorpeling of een soldaat is een mond minder; de laatste rover van een aanval maakt hem af', () => {
  const { S, D, w, een } = dorp();
  const e = dorpeling(D);
  const r = rover(w, plekOp(w, T.tegelVan(e), 1));
  const voor = D.bevolking;
  T.raak(S, D, e, 100, r);
  assert.equal(e.dood, true);
  assert.equal(D.bevolking, voor - 1);
  assert.ok(berichten.some((t) => t.includes(T.naamVanBewoner(e.bewoner)) || /died/.test(t)), berichten.join(' | '));
  T.raak(S, D, een, 100, r);
  assert.equal(D.bevolking, voor - 2);
  // Een aanval van één rover: valt hij, dan is de aanval voorbij.
  D.rovers = D.rovers || T.nieuweRovers();
  D.rovers.aanval = { soort: 'wild', dag: 5, fase: 'komen', rovers: [r] };
  berichten.length = 0;
  T.raak(S, D, r, 100, null);
  assert.equal(r.dood, true);
  assert.equal(D.rovers.aanval, null);
  assert.ok(berichten.includes('The robbers are defeated.'), berichten.join(' | '));
});

test('het gevecht is een status: een bericht met de plek, de tijd hooguit op 1×, opslaan mag, en het houdt op als niemand meer vecht', () => {
  const { S, D, w, een } = dorp();
  S.kalender.snelheid = 30;
  const hier = ruimePlek(w, T.tegelVan(een));
  zet(een, hier);
  een.post = { x: hier.x, y: hier.y };
  const r = rover(w, plekOp(w, hier, 1));
  T.werkGevechtBij(S, D);
  assert.ok(D.gevecht, 'er wordt gevochten');
  assert.ok(berichten.includes('Fighting breaks out.'), berichten.join(' | '));
  assert.equal(T.snelheidNu(S), 1, 'de tijd gaat hooguit op 1×');
  assert.ok(T.statussenVan(D).some((s) => s.id === 'gevecht'), 'de status staat in de balk');
  assert.equal(T.waaromNietOpslaan(S), null, 'opslaan mag, ook nu');
  T.raak(S, D, r, 100, een);
  S.wereldTijd = 1;
  T.werkGevechtBij(S, D);
  assert.ok(D.gevecht, 'nog even niet voorbij');
  S.wereldTijd = 1 + T.GEVECHT_INSTELLINGEN.rustNa;
  T.werkGevechtBij(S, D);
  assert.equal(D.gevecht, null);
  assert.ok(berichten.includes('The fighting is over.'), berichten.join(' | '));
  assert.equal(T.snelheidNu(S), 30, 'en de tijd gaat weer op je eigen snelheid');
});

test('een wolf die je raakt: zijn roedel vecht terug, en na het gevecht gaat hij naar zijn hol', () => {
  const { S, D, w, een } = dorp();
  T.werkBeestenBij(S, D);
  const wolf = w.wezens.find((e) => e.beest === 'wolf' && !e.dood);
  assert.ok(wolf, 'er zijn wolven in het bos');
  const G = wolf.groep;
  assert.equal(T.isVijandig(wolf), false, 'een wolf die niets doet, is geen vijand die je mannen vanzelf aanvallen');
  T.raak(S, D, wolf, 1, een);
  assert.equal(G.vecht, true);
  assert.equal(T.isVijandig(wolf), true);
  for (const e of w.wezens.filter((x) => x.groep === G && !x.dood)) assert.ok(e.doelwit, 'elke wolf van de roedel vecht');
  T.gevechtVoorbij(S, D);
  assert.equal(G.vecht, false);
  assert.ok(G.weg > D.kalender.dag, 'hij blijft een tijd weg');
  assert.deepEqual(G.vluchtNaar, G.thuis, 'naar zijn hol');
  assert.ok(w.wezens.filter((x) => x.groep === G).every((x) => !x.doelwit));
});

test('twee werelden met dezelfde opdrachten vechten letter voor letter gelijk (lockstep)', () => {
  const speel = () => {
    const { S, D, w, een, twee } = dorp();
    const hier = ruimePlek(w, T.tegelVan(een));
    const r1 = rover(w, plekOp(w, hier, 3));
    rover(w, plekOp(w, hier, 4, [T.tegelVan(r1)]));
    T.geefOpdracht(S, { soort: 'volg', wie: T.nummersVan(D, [een, twee]), doel: { x: r1.tx, y: r1.ty, soort: 'rover' } });
    for (let i = 0; i < 900; i++) T.wereldTik(S);
    return S;
  };
  const a = speel();
  const b = speel();
  assert.ok(a.dorp.wereld.wezens.some((e) => e.rover && (e.dood || e.leven < e.maxLeven)), 'er werd gevochten');
  assert.equal(JSON.stringify(T.bewaarSpel(a, { nu: 0 })), JSON.stringify(T.bewaarSpel(b, { nu: 0 })));
});
