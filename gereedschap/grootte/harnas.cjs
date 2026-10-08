'use strict';
// Het harnas van de meting "hoe groot kan een dorp worden" (npm run grootte; werklijst, vraag 74). Laadt het spel zoals
// de toetsen (test/laad.cjs), zet er N bewoners in (bouw.cjs), en speelt beelden zoals js/main.js (werkBij) dat doet,
// zonder scherm. Verandert werkBij, kijk dan of beeld() hieronder nog hetzelfde doet.
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

// Een nieuw spel op het ontworpen gehucht, zoals tweeDorpen() in test/dorpen.test.cjs (zonder buurdorp); met `maker` op
// het land van de maker uit dat nummer (js/maker.js, vraag 112), zonder het eiland (vraag 117), zodat de metingen te
// vergelijken blijven met die ervoor.
function beginSpel({ zaad = 11, opslag = true, maker = null } = {}) {
  const echt = console.warn;
  console.warn = () => {};
  vastToeval(zaad);
  // De vorm van S zoals T.nieuwSpel in js/main.js hem maakt (plus wat alleen scherm is).
  const S = Object.assign({
    tijd: 0, gebieden: {}, modus: 'verkennen', gevecht: null, overgang: null, bezig: false, inventaris: new Set(),
    kalender: T.nieuweKalender(), quests: {}, questWeg: {}, questBeloond: new Set(), sleutelGebruikt: false,
    fonteinLeeg: false, sluipen: false, bezocht: new Set(['hal']), naarGebied: null, netGeland: null, zoom: 1,
  }, T.schermVelden());
  const opEiland = T.MAKER_INSTELLINGEN.opEiland;
  T.MAKER_INSTELLINGEN.opEiland = false;
  try {
    if (!T.beginOpKaart(S, 'gehucht', maker)) throw new Error('beginOpKaart mislukte');
  } finally {
    console.warn = echt;
    T.MAKER_INSTELLINGEN.opEiland = opEiland;
  }
  if (opslag) T.gebruikOpslagPlek(geheugenOpslag());
  return S;
}

const nu = () => Number(process.hrtime.bigint()) / 1e6; // ms

// Eén beeld, zoals werkBij in js/main.js, zonder wat alleen scherm is (formaat, camera, muis). `delen`, als het er
// is, krijgt per deel de tijd in ms.
const RAAD_ELKE = 0.5;
const toestand = { raadNu: null, raadOp: -Infinity };
function beeld(S, dt, delen) {
  const tm = delen ? (naam, f) => { const t0 = nu(); f(); delen[naam] = (delen[naam] || 0) + nu() - t0; } : (naam, f) => f();
  S.tijd += dt;
  S.wind = T.windWaarde(S.tijd);
  const dtWereld = dt * T.wereldFactor(S);
  S.wereldTijd = (S.wereldTijd || 0) + dtWereld;
  T.tikKalender(S, dt);
  T.werkDagBij(S);
  tm('opslaan', () => {
    const bewaard = T.werkOpslaanBij(S);
    if (bewaard) T.ui.opgeslagen(bewaard);
  });
  tm('dorpen', () => { for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtWereld); });
  T.werkLandBij(S);
  T.ui.werkLandkaartBij(S);
  tm('animaties', () => T.werkAnimatiesBij(S, dt, dtWereld));
  if (S.naarGebied) T.gaNaarGebied(S, S.naarGebied);
  T.werkQuestsBij(S);
  const doelNu = T.questDoel(S) || T.tredeDoel(S.dorp);
  tm('raad', () => {
    if (!(S.tijd - toestand.raadOp < RAAD_ELKE) || S.tijd < toestand.raadOp) {
      toestand.raadNu = T.raadNu(S.dorp);
      toestand.raadOp = S.tijd;
    }
  });
  T.ui.opdracht(doelNu && doelNu.tekst, doelNu && doelNu.kop, toestand.raadNu && toestand.raadNu.tekst);
  if (S.modus === 'verkennen' || S.modus === 'land') {
    tm('oogst', () => {
      const hier = T.dorpHier(S);
      if (hier) T.werkOogstBij(S, hier, dtWereld);
    });
    tm('dwalen', () => T.laatDwalen(S, dtWereld));
    const m = S.modus === 'verkennen' && T.zoekOntdekking(S);
    if (m) T.startGevecht(S, m, false);
  }
  if (S.modus === 'overgang' && S.wereld.wezens.every((e) => !e.pad.length)) T.beginGevecht(S);
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
