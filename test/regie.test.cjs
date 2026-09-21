// De fundering onder de tutorial, zonder scherm: T.verouder werkt voor elk wezen (niet alleen
// de held), en js/regie.js speelt daarmee een korte scène af — waarbij overslaan de wereld in
// dezelfde eindtoestand achterlaat als uitkijken. Zie CLAUDE.md, "De kernregel", en
// ontwerp/verhaal.md, "Hij doet zijn moestuin, tot hij sterft".
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/spreuken.js');
require('../js/anim.js');
require('../js/verkennen.js'); // T.magStappen en T.bijStapBegin/T.bijAankomst, die anim.js bij elke stap aanroept
require('../js/gevecht.js');
require('../js/regie.js');
const T = globalThis.Toren;

// Zonder scherm doet T.ui niets, behalve dat "Verder" in een gesprek zichzelf meteen aanklikt:
// zo hoeft dit bestand geen muisklik na te bootsen om een zeg() voorbij te laten gaan.
T.ui = new Proxy({}, {
  get: (_, naam) => (naam === 'toonDialoog' ? (_naam2, _tekst, lijst) => lijst[0].kies() : () => {}),
});
// kijk() vraagt alleen om een kijkrichting terug te geven; de echte tekening (js/sprites.js)
// doet dit spel niet mee.
T.sprites = { richtingVan: (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'O' : 'W') : dy > 0 ? 'Z' : 'N') };

const wezen = (w, soort) => w.wezens.find((e) => e.soort === soort);

// Een spelstaat zoals main.js hem maakt, maar zonder canvas en camera.
function maakSpel() {
  const w = T.maakWereld();
  return {
    tijd: 0, wereld: w, held: wezen(w, 'held'), modus: 'verkennen', gevecht: null,
    overgang: null, bezig: false, spreuk: null, effecten: [], wachters: [], regieCamera: null,
  };
}

// De spellus, zo snel als Node hem kan draaien: na elk beeld krijgen de beloftes (loop, wacht,
// schicht) de kans om door te gaan.
async function stap(S, seconden) {
  for (let i = 0; i < Math.round(seconden * 60); i++) {
    S.tijd += 1 / 60;
    T.werkAnimatiesBij(S, 1 / 60);
    for (let k = 0; k < 8; k++) await null;
  }
}

// ── T.verouder voor elk wezen ──

test('T.verouder pakt zonder vierde argument nog gewoon de held', () => {
  const S = maakSpel();
  const voor = S.held.leeftijd;
  T.verouder(S, 12, false);
  assert.equal(S.held.leeftijd, voor + 12);
});

test('T.verouder laat een ander wezen op en neer gaan, los van de held', () => {
  const S = maakSpel();
  const wim = wezen(S.wereld, 'wim');
  wim.leeftijd = 97 * 12;
  const heldVoor = S.held.leeftijd;
  T.verouder(S, 12, false, wim);
  assert.equal(wim.leeftijd, 98 * 12);
  assert.equal(S.held.leeftijd, heldVoor); // de held merkt er niets van
  T.verouder(S, -24, false, wim);
  assert.equal(wim.leeftijd, 96 * 12);
});

test('een ander wezen dat honderd wordt, sterft, maar het spel gaat door', () => {
  const S = maakSpel();
  const wim = wezen(S.wereld, 'wim');
  wim.leeftijd = T.EINDLEEFTIJD - 6;
  T.verouder(S, 6, false, wim);
  assert.equal(wim.leeftijd, T.EINDLEEFTIJD);
  assert.equal(wim.dood, true);
  assert.deepEqual(wim.pad, []);
  assert.equal(S.modus, 'verkennen'); // geen T.heldGevallen: dat is alleen van de held
  assert.ok(!S.held.dood);
});

// ── js/regie.js ──

test('tijdens een scène staat de invoer op slot, en loop zet het wezen op de juiste tegel', async () => {
  const S = maakSpel();
  const wim = wezen(S.wereld, 'wim');
  const belofte = T.regie.speel(S, async () => {
    await T.regie.loop(wim, 7, 5);
  });
  assert.equal(S.modus, 'regie');
  await stap(S, 10);
  await belofte;
  assert.equal(wim.tx, 7);
  assert.equal(wim.ty, 5);
  assert.equal(S.modus, 'verkennen'); // de invoer gaat weer open
});

test('overslaan geeft dezelfde eindtoestand als uitkijken', async () => {
  const maakScene = (wim) => async () => {
    await T.regie.loop(wim, 7, 5);
    await T.regie.zeg(wim, 'Even later.');
    await T.regie.tover(wim, 'vuurschicht', { x: 7, y: 6 });
    await T.regie.loop(wim, 5, 2);
  };

  const S1 = maakSpel();
  const wim1 = wezen(S1.wereld, 'wim');
  wim1.leeftijd = 97 * 12;
  const gedaan1 = T.regie.speel(S1, maakScene(wim1));
  await stap(S1, 10); // ruim de tijd om alles echt te laten uitspelen
  await gedaan1;

  const S2 = maakSpel();
  const wim2 = wezen(S2.wereld, 'wim');
  wim2.leeftijd = 97 * 12;
  const gedaan2 = T.regie.speel(S2, maakScene(wim2));
  T.regie.overslaan(); // meteen overslaan, voordat er iets geanimeerd is
  await gedaan2;

  assert.equal(wim1.leeftijd, 98 * 12); // de vuurschicht kost, net als bij de held, een jaar
  assert.equal(wim2.tx, wim1.tx);
  assert.equal(wim2.ty, wim1.ty);
  assert.equal(wim2.leeftijd, wim1.leeftijd);
  assert.equal(S1.modus, 'verkennen');
  assert.equal(S2.modus, 'verkennen');
});

test('kijk draait de kijkrichting alleen als er al een beeldStand is', () => {
  const S = maakSpel();
  const wim = wezen(S.wereld, 'wim');
  T.regie.kijk(wim, { x: wim.x + 5, y: wim.y }); // nog nooit getekend: geen beeldStand, geen effect
  assert.equal(wim.beeldStand, undefined);
  wim.beeldStand = { richting: 'Z' };
  T.regie.kijk(wim, { x: wim.x + 5, y: wim.y });
  assert.equal(wim.beeldStand.richting, 'O');
});

test('camera zet en laat weer los waar het beeld naar kijkt', () => {
  const S = maakSpel();
  T.S = S;
  T.regie.camera({ x: 7, y: 6 });
  assert.deepEqual(S.regieCamera, { x: 7, y: 6 });
  T.regie.camera(null);
  assert.equal(S.regieCamera, null);
});
