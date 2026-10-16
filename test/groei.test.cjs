// De groei van de huizen op de afwisseling (js/behoeften.js, pasHuisGroeiToe; ronde 3 van het snoeien, stap 6; Marcel,
// 16 okt: "Groei op afwisseling, doe maar"), en de standen die bleven (T.STANDEN, js/treden.js): wie waar woont, voor de
// treden, de belasting, de kleren en de brand. Tot 16 okt stond hier test/wensen.test.cjs, met de wensen per huis.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {} };

const ZOMERDAG = 30;
const WINTERDAG = 280;

// Het proefdorp (test/grond.cjs), op dag 2: het lege begin, het huis van de schout, twee boerderijen met een akker, en hutten
// voor wie nog in het kamp woonde; iedereen woont en staat thuis.
function dorp(opties = {}) {
  const S = proefDorp(T, opties).S;
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  return S;
}

// Met een huis erbij, en het gezin van de hut trekt erin; de hut blijft staan, leeg.
function dorpMetHuis() {
  const S = dorp({ boerderijen: 3, gebouwen: ['huis'] });
  const D = S.dorp;
  const hut = D.gebouwen.find((g) => g.soort === 'hut');
  const huis = D.gebouwen.find((g) => g.soort === 'huis');
  for (const p of D.bewoners.mensen) if (p.huis === hut) p.huis = huis;
  return S;
}

// Zoals vóór 30 sep, met de spelregel "Het seizoen" op jij: niemand sprokkelt, zodat het hout precies na te rekenen is.
function metRegels(regels, fn) {
  for (const [id, keus] of Object.entries(regels)) T.zetOptie(id, keus);
  try {
    return fn();
  } finally {
    T.optiesTerug();
  }
}
// De berichten die het dorp zegt, zolang fn loopt.
function berichten(fn) {
  const gezegd = [];
  const oud = T.ui.bericht;
  T.ui.bericht = (tekst) => gezegd.push(tekst);
  try {
    fn();
  } finally {
    T.ui.bericht = oud;
  }
  return gezegd;
}
// Wat het dorp at: zoveel soorten (de afwisseling, die T.eetVandaag elke dag zet; hier vast, want de toets eet niet).
function at(D, n) {
  D.behoeften = D.behoeften || T.nieuweBehoeften();
  D.behoeften.afwisseling = ['graan', 'vis', 'groente', 'kaas', 'eieren', 'brood'].slice(0, n);
}
// Is dit de tekening van een gebouw van deze soort, zoals het dorp ze bouwt: in de stijl van zijn land (T.stijlTekeningen,
// js/bouwstijl.js), met de deur naar welke kant ook; en zonder stijl uit T.GEBOUWEN.
const isTekeningVan = (D, soort, tekening) => (T.stijlTekeningen(D, soort) || T.GEBOUWEN[soort].tekeningen).includes(T.metDeurNaar(tekening, 'z'));
const mensenIn = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g);
const eenHut = (D) => D.gebouwen.find((g) => g.soort === 'hut' && mensenIn(D, g).length);
const eenHuis = (D) => D.gebouwen.find((g) => g.soort === 'huis' && g.huis !== 'schout');
// Wie in dit huis woont, is binnen, zoals 's nachts als een huis doorgroeit: in een toets loopt niemand, en het oude
// stel staat bij het begin voor zijn deur, waar het huis overheen groeit (werklijst vraag 88: niet over iemand heen).
function binnen(D, g) {
  for (const p of mensenIn(D, g)) if (p.wezen) p.wezen.binnen = true;
}
function dagen(D, van, n) {
  let dag = van;
  for (let i = 0; i < n; i++) T.tikBehoeftenDag(D, ++dag);
  return dag;
}

// ---------------------------------------------------------------------------------------------
// De standen
// ---------------------------------------------------------------------------------------------

test('in het proefdorp: de boerderijen zijn van boeren, het huis van dorpelingen, de hutten van keuters; het huis van de schout heeft geen stand', () => {
  const D = dorpMetHuis().dorp;
  for (const g of D.gebouwen) {
    const verwacht = g.huis === 'schout' ? null : { boerderij: 'boeren', huis: 'dorpelingen', hut: 'keuters' }[g.soort] || null;
    assert.equal(T.standVan(g), verwacht, `${g.soort} op ${g.x},${g.y}`);
  }
  assert.equal(T.standVan({ soort: 'woontoren' }), 'ambachtslieden');
  assert.equal(T.standOnder('dorpelingen'), 'keuters');
  assert.equal(T.standOnder('boeren'), null, 'de boeren staan ernaast');
});

test('een hogere stand betaalt meer belasting: wie in een huis woont, telt dubbel', () => {
  const D = dorpMetHuis().dorp;
  const inHuis = mensenIn(D, eenHuis(D)).length;
  assert.ok(inHuis > 0);
  const N = T.WETTEN_INSTELLINGEN.belastingNaarStand;
  assert.equal(N.keuters, 1);
  assert.equal(T.belastbaar(D), D.bevolking + inHuis * (N.dorpelingen - 1));
  assert.equal(T.belastbaar({ bevolking: 20 }), 20, 'zonder bewoners iedereen als één');
});

// ---------------------------------------------------------------------------------------------
// Het dorp als geheel
// ---------------------------------------------------------------------------------------------

test('de tevredenheid is één getal voor het dorp: eten, brandhout en een kapel', () => {
  const D = dorp().dorp;
  const b = T.berekenTevredenheid(D, ZOMERDAG);
  // Genoeg eten, de zomer, zonder kapel; de afwisseling maakt niet tevredener, maar werkt harder en laat groeien.
  assert.ok(Math.abs(b.tevredenheid - (0.5 + 0.3 + 0.2 * T.BEHOEFTEN_INSTELLINGEN.kerkBasis)) < 1e-9, `${b.tevredenheid}`);
  assert.ok(b.mist.includes('a church'));
  assert.equal(b.wensen, undefined);
});

test('er trekt een gezin weg als het dorp onder de vertrekdrempel zakt, en het bericht zegt wat er mist', () => {
  const D = dorpMetHuis().dorp;
  for (const wat of ['graan', 'hout', 'kaas', 'vlees', 'vis', 'groente', 'eieren']) T.zetVoorraad(D, wat, 0);
  const groeidag = Math.ceil(WINTERDAG / T.GEBOUWEN_INSTELLINGEN.gezinDagen) * T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  assert.equal(T.datumVanDag(groeidag).seizoen, 'winter');
  assert.ok(T.berekenTevredenheid(D, groeidag).tevredenheid < T.BEHOEFTEN_INSTELLINGEN.vertrekDrempel);
  const voor = D.bevolking;
  const gezegd = berichten(() => T.tikBehoeftenDag(D, groeidag));
  assert.ok(D.bevolking < voor);
  assert.ok(gezegd.some((t) => t.includes(': they have no food and no firewood.')), gezegd.join(' | '));
});

test('wie alleen een kapel mist, trekt niet weg', () => {
  const D = dorpMetHuis().dorp;
  const voor = D.bevolking;
  dagen(D, 0, 2 * T.GEBOUWEN_INSTELLINGEN.gezinDagen);
  assert.equal(D.bevolking, voor);
});

// ---------------------------------------------------------------------------------------------
// Doorgroeien op de afwisseling
// ---------------------------------------------------------------------------------------------

test('de woningen hebben hun tekening als voorwerp, zodat ze kunnen doorgroeien', () => {
  const D = dorpMetHuis().dorp;
  for (const g of D.gebouwen) {
    if (!g.tekening) continue;
    assert.ok(g.voorwerp, `${g.soort} op ${g.x},${g.y}`);
    assert.equal(g.voorwerp.tekeningNaam, g.tekening.split('/').pop());
    assert.ok(D.wereld.voorwerpen.includes(g.voorwerp), 'het voorwerp dat er al lag, geen tweede');
  }
});

test('de groei staat in de werkbank: een hut vraagt 3 soorten, een huis 4, een stenen huis 5, en wat het kost', () => {
  const IN = T.BEHOEFTEN_INSTELLINGEN;
  assert.deepEqual(IN.groeiSoorten, { huis: 3, stenenHuis: 4, woontoren: 5 });
  assert.deepEqual(IN.groeiBouwstof.huis, { hout: 8 });
  assert.equal(T.groeiSoortenVoor('hut'), 3);
  assert.equal(T.groeiSoortenVoor('huis'), 4);
  assert.equal(T.groeiSoortenVoor('stenenHuis'), 5);
  assert.equal(T.groeiSoortenVoor('woontoren'), 0, 'die groeit niet verder');
  assert.ok(T.WERKBANK.some((d) => d.blok === 'BEHOEFTEN_INSTELLINGEN'));
  assert.ok(!T.WERKBANK.some((d) => d.blok === 'WENSEN_INSTELLINGEN'), 'de wensen zijn weg');
  assert.ok(!T.OPTIES.some((o) => ['wensen', 'herbergEnMarkt', 'achteruit'].includes(o.id)), 'en hun spelregels');
});

// De hutten met mensen in het proefdorp groeien allemaal, elk voor 8 hout.
const hutten = (D) => D.gebouwen.filter((g) => g.soort === 'hut' && mensenIn(D, g).length);

test('een hut groeit na een maand met drie soorten eten door tot een huis, voor 8 hout; met twee niet', () => metRegels({ seizoen: 'jij' }, () => {
  const D = dorp().dorp;
  const hut = eenHut(D);
  const n = hutten(D).length;
  for (const g of hutten(D)) binnen(D, g);
  at(D, 2);
  let dag = dagen(D, ZOMERDAG, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 5);
  assert.equal(hut.soort, 'hut', 'met twee soorten groeit hij niet');
  assert.equal(hut.groeiDagen, 0);
  at(D, 3);
  const hout = D.voorraad.hout;
  const gezegd = berichten(() => { dag = dagen(D, dag, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen); });
  assert.equal(hut.soort, 'huis');
  assert.equal(T.standVan(hut), 'dorpelingen');
  assert.equal(D.voorraad.hout, hout - 8 * n);
  assert.equal(gezegd.filter((t) => t === 'A hut has grown into a house, for 8 logs.').length, n, gezegd.join(' | '));
  assert.ok(hut.voorwerp.vel != null, 'met de tekening van een huis');
  assert.ok(isTekeningVan(D, 'huis', hut.tekening), hut.tekening);
  // Wie binnen was, komt door de nieuwe deur weer naar buiten, niet in de muur waar de oude deur was (vraag 88).
  const deur = T.deurVan(D.wereld, hut);
  for (const p of mensenIn(D, hut)) assert.deepEqual([p.wezen.tx, p.wezen.ty], [deur.x, deur.y]);
  assert.ok(T.isBegaanbaar(D.wereld, deur.x, deur.y));
  // Een huis vraagt vier soorten: met drie groeit het niet verder.
  dagen(D, dag, 40);
  assert.equal(hut.soort, 'huis');
  assert.equal(hut.groeiDagen, 0);
}));

test('een dag telt alleen als het dorp ook tevreden genoeg is: in de winter zonder brandhout groeit er niets', () => metRegels({ seizoen: 'jij' }, () => {
  const D = dorp().dorp;
  const hut = eenHut(D);
  at(D, 6);
  T.zetVoorraad(D, 'hout', 0);
  T.zetVoorraad(D, 'turf', 0);
  dagen(D, WINTERDAG, 10);
  assert.ok(D.behoeften.tevredenheid < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDrempel, `${D.behoeften.tevredenheid}`);
  assert.equal(hut.groeiDagen, 0);
}));

test('zonder hout wacht de hut, en zegt het dorp het één keer; met hout groeit hij de volgende dag', () => metRegels({ seizoen: 'jij' }, () => {
  const D = dorp().dorp;
  const hut = eenHut(D);
  // Eén hut met mensen: de anderen trekken bij hem in.
  for (const g of hutten(D)) for (const p of mensenIn(D, g)) p.huis = hut;
  binnen(D, hut);
  at(D, 3);
  T.zetVoorraad(D, 'hout', 0);
  let dag = ZOMERDAG;
  const gezegd = berichten(() => { dag = dagen(D, dag, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 5); });
  assert.equal(hut.soort, 'hut');
  assert.deepEqual(gezegd.filter((t) => t.includes('can become a house')), ['A hut can become a house, but that takes 8 logs.']);
  // De raad zegt het ook, met wie het hout maakt (js/raad.js), en wat je mist om die te bouwen.
  assert.equal(T.bouwstofRaad(D), `A hut can become a house, but the stores do not hold 8 logs: build a woodcutter [B]. For that you are short of ${T.GEBOUWEN.houthakker.kosten.hout} logs.`);
  T.zetVoorraad(D, 'hout', 10);
  assert.equal(T.bouwstofRaad(D), null, 'is het hout er, dan groeit hij vannacht');
  T.tikBehoeftenDag(D, ++dag);
  assert.equal(hut.soort, 'huis');
  assert.equal(D.voorraad.hout, 2);
}));

test('een huis groeit met vier soorten door tot een stenen huis, voor 12 steen', () => metRegels({ seizoen: 'jij' }, () => {
  const D = dorpMetHuis().dorp;
  const huis = eenHuis(D);
  T.zetVoorraad(D, 'steen', 15);
  at(D, 3);
  let dag = dagen(D, ZOMERDAG, 40);
  assert.equal(huis.soort, 'huis', 'met drie soorten groeit het niet');
  at(D, 4);
  const voet = { ...huis.voet };
  const tekening = huis.tekening;
  dag = dagen(D, dag, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen);
  assert.equal(huis.soort, 'stenenHuis');
  assert.equal(T.standVan(huis), 'ambachtslieden');
  assert.equal(D.voorraad.steen, 3);
  // Het versteent tot zijn eigen broertje ("huis11" wordt "steen11", met de deur naar dezelfde kant), op zijn eigen grond
  // (vraag 85, d).
  assert.ok(isTekeningVan(D, 'stenenHuis', huis.tekening), huis.tekening);
  assert.equal(T.vormVan(huis.tekening), T.vormVan(tekening).replace('huis', 'steen'));
  assert.equal(T.deurKantVan(huis.tekening), T.deurKantVan(tekening));
  assert.deepEqual(huis.voet, voet);
  // Een woontoren pas met marktrecht, ook met vijf soorten.
  at(D, 5);
  T.zetVoorraad(D, 'steen', 50);
  dagen(D, dag, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 2);
  assert.equal(huis.soort, 'stenenHuis');
  assert.equal(T.huisToestand(D, huis).groei.later, 'marktrecht');
}));

test('elk huis heeft een stenen broertje dat op zijn eigen grond past', () => {
  const steen = T.GEBOUWEN.stenenHuis;
  for (const t of T.GEBOUWEN.huis.tekeningen) {
    const broertje = steen.broertjes[t];
    assert.ok(broertje && steen.tekeningen.includes(broertje), `${t} heeft een broertje`);
    const a = T.gebouwVoet('huis', t);
    const b = T.gebouwVoet('stenenHuis', broertje);
    assert.ok(b.b <= a.b && b.h <= a.h, `${broertje} (${b.b}×${b.h}) past op ${t} (${a.b}×${a.h})`);
  }
});

test('een huis groeit niet over iemand heen die ervoor staat: dan morgen weer', () => metRegels({ seizoen: 'jij' }, () => {
  const D = dorp().dorp;
  const hut = eenHut(D);
  at(D, 3);
  // Wie in de hut woont, staat bij het begin voor zijn deur, buiten, en het huis zou over die tegels heen groeien.
  const dag = dagen(D, ZOMERDAG, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 3);
  assert.equal(hut.soort, 'hut', 'niet over iemand heen (vraag 88)');
  binnen(D, hut);
  T.tikBehoeftenDag(D, dag + 1);
  assert.equal(hut.soort, 'huis', 'zijn ze binnen, dan wel');
}));

test('een huis zonder mensen telt niet, en begint opnieuw als er weer iemand komt', () => metRegels({ seizoen: 'jij' }, () => {
  const D = dorp().dorp;
  const hut = eenHut(D);
  at(D, 3);
  const dag = dagen(D, ZOMERDAG, 5);
  assert.equal(hut.groeiDagen, 5);
  const wie = mensenIn(D, hut);
  for (const p of wie) p.huis = null;
  T.tikBehoeftenDag(D, dag + 1);
  assert.equal(hut.groeiDagen, undefined);
  for (const p of wie) p.huis = hut;
}));

// ---------------------------------------------------------------------------------------------
// 2c: het briefje bij een huis (werklijst vraag 100)
// ---------------------------------------------------------------------------------------------

test('2c: een huis zegt wie er woont en hoe ver het is met doorgroeien', () => {
  const D = dorpMetHuis().dorp;
  at(D, 2);
  T.tikBehoeftenDag(D, ZOMERDAG);
  const huis = eenHuis(D);
  const t = T.huisToestand(D, huis);
  assert.equal(t.mensen, mensenIn(D, huis).length);
  assert.deepEqual(t.wie, mensenIn(D, huis).map(T.naamVanBewoner));
  assert.deepEqual(t.groei, {
    dagen: 0, nodig: T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen, wordt: 'stone house', kosten: { steen: 12 },
    soorten: 4, nu: 2, tevreden: true, later: null, wacht: false, waarom: null,
  });
  // Het huis van de schout en een huis zonder mensen laten niets zien.
  assert.equal(T.huisToestand(D, D.gebouwen.find((g) => g.huis === 'schout')), null);
  assert.equal(T.huisToestand(D, D.gebouwen.find((g) => g.soort === 'hut' && !mensenIn(D, g).length)), null);
  // Een boerderij groeit niet door.
  assert.equal(T.huisToestand(D, D.gebouwen.find((g) => g.soort === 'boerderij')).groei, null);
});
