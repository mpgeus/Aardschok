// De motor van een scenario (js/scenario.js; vraag 187, stap 1a; ontwerp/scenario.md, 2): de triggers, de gebieden, de
// doelen en de keuring, op het proefdorp (test/grond.cjs).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (tekst, soort, plek) => berichten.push({ tekst, soort, plek }) : () => {}) });
T.anim = { tekst() {}, pijl() {} };

function gehucht() {
  const { S } = proefDorp(T);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen' }, T.schermVelden());
  berichten.length = 0;
  return S;
}
// Een seconde van de wereld verder, en de triggers kijken (zoals de tik dat doet, js/tik.js).
function seconde(S, n = 1) {
  for (let i = 0; i < n; i++) {
    S.wereldTijd += 1;
    T.werkScenarioBij(S);
  }
}
const opUur = (S, dag, uur) => {
  S.kalender.dag = dag + uur / 24;
};
const start = (S, level) => assert.deepEqual(T.startScenario(S, level), []);
const trigger = (S, id) => S.scenario.triggers.find((t) => t.id === id);

test('de keuring: een goed level is goed, en elke fout heeft een zin', () => {
  const goed = {
    gebieden: { brug: { x: 10, y: 10, b: 3, h: 2 }, bron: { x: 20, y: 20, r: 2 } },
    triggers: [
      { id: 'begin', als: [{ dag: 0 }], dan: [{ doel: { id: 'brug', tekst: 'Hold the bridge.', hoofd: true } }] },
      { id: 'gezien', als: [{ dag: { tussen: [5, 9], lot: 'overval' } }], dan: [{ bericht: { tekst: 'Robbers.', gebied: 'bron' } }] },
      { id: 'erop', als: [{ inGebied: { gebied: 'brug' } }, { na: { trigger: 'gezien', uren: 2 } }], dan: [{ doel: { id: 'brug', stand: 'af' } }] },
    ],
  };
  assert.deepEqual(T.keurScenario(goed), []);
  const fouten = (triggers, gebieden = {}) => T.keurScenario({ gebieden, triggers });
  const heeft = (lijst, stuk) => assert.ok(lijst.some((z) => z.includes(stuk)), `${stuk} in ${JSON.stringify(lijst)}`);
  heeft(fouten([{ id: 'a', als: [{ dgg: 3 }] }]), 'de voorwaarde dgg bestaat niet');
  heeft(fouten([{ id: 'a', dan: [{ berichtt: 'x' }] }]), 'het gevolg berichtt bestaat niet');
  heeft(fouten([{ id: 'a', als: [{ inGebied: { gebied: 'brug' } }] }]), 'gebied brug is er niet');
  heeft(fouten([{ id: 'a', als: [{ na: { trigger: 'b', uren: 1 } }] }]), 'trigger b is er niet');
  heeft(fouten([{ id: 'a' }, { id: 'a' }]), 'staat er twee keer');
  heeft(fouten([{ id: 'a', als: [{ dag: { tussen: [1, 2] } }] }]), 'heeft een lot');
  heeft(fouten([{ id: 'a', als: [{ dag: { tussen: [1, 2], lot: 'x' } }] }, { id: 'b', als: [{ dag: { tussen: [3, 4], lot: 'x' } }] }]), 'twee keer andere dagen');
  heeft(fouten([{ id: 'a', keer: 0 }]), 'keer is een getal');
  heeft(fouten([{ id: 'a', als: [{ heer: 'boos' }] }]), 'de heer kent boos niet');
  heeft(fouten([{ id: 'a', dan: [{ doel: { id: 'd', tekst: 'Do it.' } }] }]), 'doel d kan nooit af');
  heeft(fouten([{ id: 'a', als: [{ doel: 'd' }] }]), 'doel d komt er nergens bij');
  heeft(fouten([], { kapot: { x: 1, y: 1 } }), 'gebied kapot');
  heeft(fouten([{ id: 'a', dan: [{ scene: 'dansen' }] }]), 'de scène dansen bestaat niet');
  heeft(T.keurScenario({ dorpen: [{ wacht: ['ridder'] }] }), 'de soldaat ridder bestaat niet');
  heeft(T.keurScenario({ dorpen: [{ dicht: ['kasteeltje'] }] }), 'het gebouw kasteeltje bestaat niet');
  // De woorden van het hol (2c): alleen in een level met een hol, en het gebied 'hol' is van het spel.
  heeft(fouten([{ id: 'a', als: [{ hol: 'verslagen' }] }]), 'de voorwaarde hol vraagt een dorp met een hol');
  heeft(fouten([{ id: 'a', dan: [{ bericht: { tekst: 'There.', gebied: 'hol' } }] }]), 'gebied hol vraagt een dorp met een hol');
  heeft(fouten([], { hol: { x: 1, y: 1, r: 2 } }), 'gebied hol is van het spel');
  heeft(fouten([{ id: 'a', als: [{ overval: 'vaak' }] }]), 'overval is een getal');
  heeft(fouten([{ id: 'a', dan: [{ doel: { id: 'd', gebied: 'nergens' } }] }]), 'gebied nergens is er niet');
  const metHol = (triggers) => T.keurScenario({ dorpen: [{ hol: { bende: 3 } }], triggers });
  heeft(metHol([{ id: 'a', als: [{ hol: 'weg' }] }]), "het hol is 'staat' of 'verslagen'");
  assert.deepEqual(metHol([{ id: 'a', als: [{ hol: 'staat' }, { overval: { minstens: 1 } }, { inGebied: { gebied: 'hol' } }] }]), []);
  // Met een fout begint het niet.
  const S = gehucht();
  assert.ok(T.startScenario(S, { triggers: [{ id: 'a', als: [{ dgg: 3 }] }] }).length);
  assert.equal(S.scenario, undefined);
});

test('een trigger gaat af op zijn dag, één keer; met keer vaker, en wat uit begint, zet een ander aan', () => {
  const S = gehucht();
  opUur(S, 3, 12);
  start(S, {
    triggers: [
      { id: 'vijf', als: [{ dag: 5 }], dan: [{ teller: { vijf: 1 } }] },
      { id: 'twee', keer: 2, als: [{ dag: 5 }], dan: [{ teller: { twee: 1 } }, { triggerAan: 'laat' }] },
      { id: 'laat', aan: false, keer: 'altijd', dan: [{ teller: { laat: 1 } }] },
    ],
  });
  seconde(S, 3);
  assert.deepEqual(S.scenario.tellers, {});
  opUur(S, 5, 0);
  seconde(S, 4);
  // vijf één keer; twee twee keer; laat ging in de eerste ronde al mee (hij staat verderop), en daarna elke seconde.
  assert.deepEqual(S.scenario.tellers, { vijf: 1, twee: 2, laat: 4 });
  assert.equal(trigger(S, 'vijf').aan, false);
  assert.equal(trigger(S, 'twee').aan, false);
  assert.equal(trigger(S, 'vijf').laatst, 5 * 24);
});

test('de triggers kijken één keer per seconde van de wereld, niet per tik', () => {
  const S = gehucht();
  start(S, { triggers: [{ id: 'tel', keer: 'altijd', dan: [{ teller: { n: 1 } }] }] });
  for (let i = 0; i < 10; i++) {
    S.wereldTijd += 0.25;
    T.werkScenarioBij(S);
  }
  assert.equal(S.scenario.tellers.n, 2); // van 0 tot 2,5: de seconden 1 en 2
});

test('een dag uit het zaad ligt vast bij het begin, tussen zijn dagen, en dezelfde naam is dezelfde dag', () => {
  const level = {
    triggers: [
      { id: 'a', als: [{ dag: { tussen: [60, 220], lot: 'overval' } }], dan: [{ teller: { a: 1 } }] },
      { id: 'b', als: [{ dag: { tussen: [60, 220], lot: 'overval' } }], dan: [{ teller: { b: 1 } }] },
    ],
  };
  const S = gehucht();
  start(S, level);
  const dag = S.scenario.lot.overval;
  assert.ok(dag >= 60 && dag <= 220, `dag ${dag}`);
  const S2 = gehucht();
  start(S2, level);
  assert.equal(S2.scenario.lot.overval, dag, 'hetzelfde land, dezelfde dag');
  opUur(S, dag - 1, 23);
  seconde(S);
  assert.deepEqual(S.scenario.tellers, {});
  opUur(S, dag, 1);
  seconde(S);
  assert.deepEqual(S.scenario.tellers, { a: 1, b: 1 });
});

test('na een andere trigger, en alleen overdag: het bericht van de overval en de rovers een dag later', () => {
  const S = gehucht();
  opUur(S, 10, 20); // 's avonds
  start(S, {
    triggers: [
      { id: 'gezien', als: [{ dag: 10 }], dan: [{ bericht: { tekst: 'Robbers were seen in the woods near the village. They will come soon.', toon: 'gevaar' } }] },
      { id: 'overval', als: [{ na: { trigger: 'gezien', uren: 24 } }, { uur: 'overdag' }], dan: [{ rovers: { aantal: 3 } }] },
    ],
  });
  seconde(S);
  assert.deepEqual(berichten.map((b) => [b.tekst, b.soort]), [['Robbers were seen in the woods near the village. They will come soon.', 'gevaar']]);
  opUur(S, 11, 19); // een dag later, maar al donker
  seconde(S);
  assert.equal(trigger(S, 'overval').gedaan, 0);
  const zon = T.zonVan(12);
  opUur(S, 12, zon.op - 0.5);
  seconde(S);
  assert.equal(trigger(S, 'overval').gedaan, 0, 'nog voor zonsopgang');
  opUur(S, 12, zon.op + 0.5);
  seconde(S);
  assert.equal(trigger(S, 'overval').gedaan, 1);
  const A = S.dorp.rovers.aanval;
  assert.ok(A && A.fase === 'wacht' && A.aantal === 3 && A.dag === 12, JSON.stringify(A));
});

test('de voorwaarden over het dorp: waren, mensen, gebouwen, de trede, een vlag, en wat niemand kent', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetVoorraad(D, 'graan', 30);
  const geldt = (als) => T.voorwaardeGeldt(S, D, null, als);
  assert.equal(geldt({ waar: { graan: 30 } }), true);
  assert.equal(geldt({ waar: { graan: 31 } }), false);
  assert.equal(geldt({ waar: { graan: { minder: 31 } } }), true);
  assert.equal(geldt({ bevolking: D.bevolking }), true);
  assert.equal(geldt({ bevolking: { minder: D.bevolking } }), false);
  assert.equal(geldt({ gebouw: { raadhuis: 1 } }), true);
  assert.equal(geldt({ gebouw: { molen: 1 } }), false);
  assert.equal(geldt({ trede: 'gehucht' }), true);
  assert.equal(geldt({ trede: 'dorp' }), false);
  assert.equal(geldt({ vlag: 'ergens' }), false);
  T.zetVlag(D, 'ergens');
  assert.equal(geldt({ vlag: 'ergens', waar: { graan: 30 } }), true);
  assert.equal(geldt({ vlag: 'ergens', iets: 1 }), false, 'een woord dat niemand kent, geldt niet');
  assert.equal(geldt({ wie: 'speler', vlag: 'ergens' }), true, 'wie is geen voorwaarde');
});

test('de heer: zijn stand in woorden', () => {
  const S = gehucht();
  const D = S.dorp;
  const geldt = (als) => T.voorwaardeGeldt(S, D, null, als);
  assert.equal(geldt({ heer: 'komt' }), false);
  T.heerKomt(D, Math.floor(S.kalender.dag));
  assert.ok(T.heerStand(D).includes('komt'));
  assert.equal(geldt({ heer: 'komt' }), true);
  assert.equal(geldt({ heer: ['komt', 'betaald'] }), false);
  D.heer.bezoek.betaald = { geweigerd: true };
  assert.equal(geldt({ heer: 'geweigerd' }), true);
});

test('de kaart: wie in een gebied staat (het checkpoint), en een gebied zonder vijand', () => {
  const S = gehucht();
  const D = S.dorp;
  const h = D.aanvoerder;
  const gebieden = { hier: { x: h.tx - 1, y: h.ty - 1, b: 3, h: 3 }, daar: { x: h.tx + 30, y: h.ty, r: 1 } };
  start(S, {
    gebieden,
    triggers: [
      { id: 'hier', als: [{ inGebied: { gebied: 'hier' } }], dan: [{ teller: { hier: 1 } }] },
      { id: 'daar', als: [{ inGebied: { gebied: 'daar' } }], dan: [{ teller: { daar: 1 } }] },
      { id: 'drie', als: [{ inGebied: { gebied: 'hier', aantal: 99 } }], dan: [{ teller: { drie: 1 } }] },
      { id: 'leeg', als: [{ leegGebied: 'hier' }], dan: [{ teller: { leeg: 1 } }] },
    ],
  });
  // Een rover in het gebied: dan is het niet leeg.
  const rover = { kant: 'monster', tx: h.tx, ty: h.ty + 1, x: h.tx, y: h.ty + 1 };
  D.wereld.wezens.push(rover);
  seconde(S);
  assert.deepEqual(S.scenario.tellers, { hier: 1 });
  rover.dood = true;
  seconde(S);
  assert.deepEqual(S.scenario.tellers, { hier: 1, leeg: 1 });
  D.wereld.wezens.splice(D.wereld.wezens.indexOf(rover), 1);
});

test('de gevolgen: een doel erbij en af, linksboven, een bericht met een plek, waren, een vlag, en het eind', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetVoorraad(D, 'goud', 10);
  start(S, {
    gebieden: { put: { x: 40, y: 50, b: 4, h: 2 } },
    triggers: [
      { id: 'begin', dan: [{ doel: { id: 'put', tekst: 'Guard the <well>.', hoofd: true } }, { bericht: { tekst: 'Look here.', gebied: 'put' } }] },
      { id: 'af', aan: false, dan: [{ doel: { id: 'put', stand: 'af' } }, { waar: { goud: 25 } }, { zetVlag: 'putGered' }] },
      { id: 'eind', als: [{ doel: 'put' }], dan: [{ einde: { gewonnen: true, tekst: 'Well done.' } }] },
    ],
  });
  assert.deepEqual(T.doelLinksboven(S, D), T.tredeDoel(D), 'zonder doel het doel van de trede');
  seconde(S);
  assert.deepEqual(S.scenario.doelen, [{ id: 'put', tekst: 'Guard the <well>.', hoofd: true, stand: 'open', plek: null }]);
  assert.deepEqual(T.doelLinksboven(S, D), { kop: 'Goal', tekst: 'Guard the &lt;well&gt;.', deel: null });
  assert.deepEqual(berichten.map((b) => b.tekst), ['New goal: Guard the <well>.', 'Look here.']);
  assert.deepEqual(berichten[1].plek, { x: 42, y: 51 });
  T.GEVOLGEN.triggerAan(S, D, 'af');
  seconde(S);
  assert.equal(D.voorraad.goud, 35);
  assert.ok(T.heeftVlag(D, 'putGered'));
  assert.equal(berichten.at(-1).tekst, 'Goal reached: Guard the <well>.');
  assert.deepEqual(T.doelLinksboven(S, D), T.tredeDoel(D), 'een doel dat af is, gaat weg van linksboven');
  // De trigger van het eind staat verderop, en ziet in dezelfde ronde al dat het doel af is.
  assert.deepEqual(D.einde, { reden: 'scenario', dag: Math.floor(S.kalender.dag), gewonnen: true, kop: null, tekst: 'Well done.' });
});

test('een scenario wordt bewaard, en speelt na het laden verder', () => {
  const S = gehucht();
  opUur(S, 4, 12);
  start(S, {
    triggers: [
      { id: 'a', als: [{ dag: 4 }], dan: [{ teller: { a: 1 } }, { doel: { id: 'd', tekst: 'Wait.' } }] },
      { id: 'b', als: [{ na: { trigger: 'a', uren: 12 } }], dan: [{ doel: { id: 'd', stand: 'af' } }] },
    ],
  });
  seconde(S);
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const L = {};
  assert.ok(T.herstelSpel(L, tekst).gelukt);
  assert.deepEqual(L.scenario, S.scenario);
  opUur(L, 5, 0);
  L.wereldTijd += 1;
  T.werkScenarioBij(L);
  assert.equal(L.scenario.doelen[0].stand, 'af');
});

// Het demojaar (vraag 187, stap 1b; levels/demojaar.js): wat het doet, toetsen test/rovers, soldaten, heer, einde en regie.
test('het demojaar komt door de keuring, en een nieuw spel ermee heeft de wacht, het slot, geen overvallen op het rooster en de triggers', () => {
  assert.deepEqual(T.keurScenario(T.LEVELS.demojaar), []);
  const S = T.proefdorp.begin(T.proefdorp.zaad, T.demoLevel());
  const D = S.dorp;
  assert.deepEqual(D.dicht, ['wachthuis', 'wapenmaker']);
  assert.equal(D.rovers.overvallen, false);
  assert.deepEqual(T.soldatenVan(D).map((p) => p.soldaat.soort), ['speerman', 'speerman', 'kruisboogschutter']);
  assert.equal(S.scenario.demo, true, 'begonnen als de demo (T.demoLevel)');
  assert.equal(S.scenario.hoofdstuk, null);
  assert.deepEqual(S.scenario.triggers.map((t) => t.id), ['overval', 'sintMaarten']);
  assert.ok(S.scenario.lot.overval >= 59 && S.scenario.lot.overval <= 219);
  // Het volle spel heeft er niets van.
  const V = T.proefdorp.begin(T.proefdorp.zaad);
  assert.deepEqual(V.dorp.dicht, []);
  assert.equal(V.dorp.rovers, undefined);
  assert.equal(V.scenario, undefined);
  // Een level dat niet door de keuring komt, begint geen spel.
  assert.throws(() => T.proefdorp.begin(T.proefdorp.zaad, { dorpen: [{ dicht: ['kasteeltje'] }] }), /het gebouw kasteeltje bestaat niet/);
});

// Het rovershol, hoofdstuk 2 (werklijst K, 2c; levels/rovershol.js): de brief zegt het, het hol staat er, na de eerste
// overval wijst het doel ernaar, en het eind komt als het valt, of als de heer op Sint-Maarten komt en het staat er nog.
test('het rovershol: het hol met zijn bende, een doel dat na de eerste overval naar het hol wijst, en gewonnen of mislukt', () => {
  assert.deepEqual(T.keurScenario(T.LEVELS.rovershol), []);
  const nieuw = () => {
    const S = T.proefdorp.begin(T.proefdorp.zaad, T.hoofdstukLevel('hol'));
    Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen' }, T.schermVelden());
    berichten.length = 0;
    return S;
  };
  const S = nieuw();
  const D = S.dorp;
  assert.equal(S.scenario.hoofdstuk, 'hol');
  assert.equal(S.scenario.inleiding, T.LEVELS.rovershol.inleiding, 'de zin voor de eerste brief');
  assert.deepEqual(D.dicht, [], 'het wachthuis en de wapenmaker zijn open');
  assert.deepEqual(T.soldatenVan(D).map((p) => p.soldaat.soort), ['speerman', 'speerman', 'kruisboogschutter']);
  assert.notEqual(D.rovers && D.rovers.overvallen, false, 'de overvallen op het rooster');
  const K = S.wereld.kampen.find((k) => k.nr === D.hol);
  assert.equal(K.bende.length, 10);
  assert.equal(K.palissade, true);
  assert.deepEqual(K.buit, { graan: 60, goud: 20 });
  // Het begin: het hoofddoel, nog zonder plek.
  seconde(S);
  assert.equal(T.doelLinksboven(S, D).tekst, "Destroy the robbers' den before Martinmas.");
  assert.deepEqual(T.doelPlekken(S), []);
  // Het gebied 'hol': een kring om het vuur tot de palissade.
  const g = T.holGebied(D);
  assert.deepEqual(g, { x: K.x, y: K.y, r: T.ROVERS_INSTELLINGEN.palissade.straal });
  const erin = { inGebied: { gebied: 'hol' } };
  assert.equal(T.voorwaardeGeldt(S, D, null, erin), false);
  const man = D.wereld.wezens.find((e) => T.isVanDorp(D, e));
  Object.assign(man, { tx: K.x + 3, ty: K.y });
  assert.equal(T.voorwaardeGeldt(S, D, null, erin), true, 'een van je mensen in het hol');
  // Na de eerste overval die kwam (D2): het spoor, een bericht met de plek, en de ring op de minikaart.
  seconde(S, 3);
  assert.equal(S.scenario.triggers.find((t) => t.id === 'spoor').gedaan, 0, 'nog geen overval');
  (D.rovers || (D.rovers = T.nieuweRovers())).geweest = 1;
  seconde(S);
  const spoor = berichten.find((b) => b.tekst.startsWith('The robbers left a trail'));
  assert.deepEqual(spoor && spoor.plek, { x: K.x, y: K.y });
  assert.deepEqual(T.doelPlekken(S), [{ x: K.x, y: K.y }]);
  // Valt de laatste rover, dan is het gewonnen (E1).
  K.verslagen = true;
  seconde(S);
  assert.equal(S.scenario.doelen[0].stand, 'af');
  assert.deepEqual(T.doelPlekken(S), [], 'een doel dat af is, wijst nergens meer heen');
  assert.equal(D.einde.reden, 'scenario');
  assert.equal(D.einde.gewonnen, true);
  assert.equal(D.einde.kop, 'The woods are quiet');
  assert.equal(T.spelGewonnen(D), true);
  // Komt de heer op Sint-Maarten en staat het hol er nog, dan is het mislukt (C1).
  const S2 = nieuw();
  seconde(S2);
  (S2.dorp.heer || (S2.dorp.heer = T.nieuweHeer())).bezoek = {}; // Sint-Maarten: hij komt (T.heerStand)
  assert.ok(T.heerStand(S2.dorp).includes('komt'));
  seconde(S2);
  assert.equal(S2.scenario.doelen[0].stand, 'mislukt');
  assert.equal(S2.dorp.einde.gewonnen, false);
  assert.equal(T.spelGewonnen(S2.dorp), false);
});

test('de tik laat de triggers kijken (T.wereldTik, js/tik.js)', () => {
  const S = gehucht();
  start(S, { triggers: [{ id: 'nu', dan: [{ teller: { nu: 1 } }] }] });
  S.kalender.snelheid = 30;
  for (let i = 0; i < 4 && !S.scenario.tellers.nu; i++) T.wereldTik(S);
  assert.equal(S.scenario.tellers.nu, 1);
});

test('een gesprek kent de woorden van de triggers ook: één taal', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetVoorraad(D, 'hout', 5);
  assert.equal(T.voorwaardeGeldt(S, D, 'marskramer', { waar: { hout: 5 }, nietVlag: 'weg' }), true);
  T.doeGevolg(S, D, { zetVlag: ['een', 'twee'], waar: { hout: -2 } });
  assert.ok(T.heeftVlag(D, 'een') && T.heeftVlag(D, 'twee'));
  assert.equal(D.voorraad.hout, 3);
});
