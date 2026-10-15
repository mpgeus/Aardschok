'use strict';
// Het harnas van de meting "hoe groot kan een dorp worden" (npm run grootte; werklijst, vraag 74). Laadt het spel zoals
// de toetsen (test/laad.cjs), zet er N bewoners in (bouw.cjs), en speelt beelden zoals js/main.js (werkBij) dat doet,
// zonder scherm: de wereld met dezelfde tik als het spel (T.wereldTik, js/tik.js).
// Het meet het spel in deze map. Wil je een oudere stand meten, maak dan een losse kopie (git worktree add) en wijs die
// aan met SPEL_WORTEL; zo verandert een sessie die in de werkmap verder bouwt de meting niet.
const WORTEL = process.env.SPEL_WORTEL || require('node:path').join(__dirname, '..', '..');
const T = require(WORTEL + '/test/laad.cjs').spel();

// Een T.ui die niets doet, zoals in test/dorpen.test.cjs.
T.ui = new Proxy({}, { get: () => () => undefined });

// Math.random vast (zelfde LCG als tweeDorpen() in test/dorpen.test.cjs), en het blijft vast tijdens de meting.
function vastToeval(zaad = 11) {
  let n = zaad;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
}

// Een opslag in het geheugen, zoals localStorage, zodat het vanzelf opslaan van elke ochtend echt werk doet.
function geheugenOpslag() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    m,
  };
}

// Een nieuw spel met het proefdorp op het eiland van nummer `maker` (zonder: 5; T.proefdorp, js/begin.js): een dorp om
// bewoners in te zetten, hetzelfde als waarop de toetsen spelen. Tot ronde 2 van het snoeien (stap 6, 12 okt) was het het
// gehucht dat er al was, op het land van de maker zonder het eiland (en tot stap 3c het ontworpen gehucht): metingen van
// daarvoor zijn niet te vergelijken.
function beginSpel({ zaad = 11, opslag = true, maker = null } = {}) {
  const dorp = T.bewaarSpel(T.proefdorp.maak({ zaad: maker != null ? maker : 5 }), { nu: 0 });
  vastToeval(zaad);
  // De vorm van S zoals T.nieuwSpel in js/main.js hem maakt (plus wat alleen scherm is).
  const S = Object.assign({
    tijd: 0, gebieden: {}, modus: 'verkennen', gevecht: null, overgang: null, bezig: false, inventaris: new Set(),
    kalender: T.nieuweKalender(), quests: {}, questWeg: {}, questBeloond: new Set(), sleutelGebruikt: false,
    fonteinLeeg: false, sluipen: false, bezocht: new Set(['hal']), naarGebied: null, netGeland: null, zoom: 1,
  }, T.schermVelden());
  const uit = T.herstelSpel(S, dorp);
  if (!uit.gelukt) throw new Error(uit.reden);
  if (opslag) T.gebruikOpslagPlek(geheugenOpslag());
  return S;
}

const nu = () => Number(process.hrtime.bigint()) / 1e6; // ms

// Eén beeld, zoals werkBij in js/main.js, zonder wat alleen scherm is (formaat, camera, muis): een tik van de wereld
// (T.wereldTik, js/tik.js; dezelfde als het spel), het vanzelf opslaan en de raad. `delen`, als het er is, krijgt per
// deel de tijd in ms.
const RAAD_ELKE = 0.5;
const toestand = { raadNu: null, raadOp: -Infinity };
function beeld(S, dt, delen) {
  const tm = delen ? (naam, f) => { const t0 = nu(); f(); delen[naam] = (delen[naam] || 0) + nu() - t0; } : (naam, f) => f();
  T.wereldTik(S, dt, tm);
  S.wind = T.windWaarde(S.tijd);
  tm('opslaan', () => {
    const bewaard = T.werkOpslaanBij(S);
    if (bewaard) T.ui.opgeslagen(bewaard);
  });
  tm('raad', () => {
    if (!(S.tijd - toestand.raadOp < RAAD_ELKE) || S.tijd < toestand.raadOp) {
      toestand.raadNu = T.raadNu(S.dorp);
      toestand.raadOp = S.tijd;
    }
  });
}

// Zet de kalender op dag `dag` (met uur) zoals Spel.debug.kalender dat doet: de dagen ertussen worden niet meer
// getikt, want de gebouwen weten dan waar ze beginnen (D.gebouwenDag = null: "eerste keer: alleen onthouden").
function zetDag(S, dag, uur) {
  S.kalender.dag = Math.floor(dag) + uur / 24;
  for (const D of S.dorpen) D.gebouwenDag = Math.floor(dag);
  S.vanzelfBewaard = Math.floor(dag); // die ochtend is al bewaard
}

const pct = (lijst, p) => {
  const s = lijst.slice().sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0;
};
const gem = (lijst) => (lijst.length ? lijst.reduce((a, b) => a + b, 0) / lijst.length : 0);

module.exports = { WORTEL, T, beginSpel, beeld, zetDag, vastToeval, geheugenOpslag, nu, pct, gem };
