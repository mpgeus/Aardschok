// Het vee (js/vee.js; ontwerp/beeld.md en ontwerp/spel.md, "Het vee" en "Weides met koeien en
// schapen", 25 sep 2026). Eerst wat een dier ís en hoe het zich gedraagt als het stilstaat. Het zaad
// kiest zijn kleur (en dus zijn vel), zijn eigen ritme van grazen, staan en liggen komt uit de tijd
// en dat zaad (nooit uit Math.random per beeld), en een dier is neutraal: het vecht niet, praat
// niet, en dwaalt rond zijn plek. Daarna de regels van stap 1: de beginkudde, plaats op de weide,
// melk, eten en kaas, jongen, en wisselen.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
require('../js/voorraad.js');
require('../js/wereld.js');
require('../js/mensen.js');
require('../js/vee.js');
require('../js/gebouwen.js');
require('../js/behoeften.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/kaart.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/akkers.js');
require('../js/boeren.js');
require('../js/gevecht.js');
require('../js/verkennen.js');
require('../js/gesprekken.js');
require('../js/gesprek.js');
const T = globalThis.Spel;
const Vee = require('../gereedschap/pixelart/vee.cjs');

const HOUDINGEN = ['grazen', 'staan', 'lopen', 'liggen'];

test('T.maakDier: een neutraal wezen dat niet vecht en rond zijn plek dwaalt', () => {
  for (const soort of Object.keys(T.VEE)) {
    const e = T.maakDier(soort, 10, 12, 7);
    const v = T.VEE[soort];
    assert.equal(e.soort, soort);
    assert.equal(e.dier, soort);
    assert.equal(e.naam, v.naam);
    assert.equal(e.kant, 'neutraal', 'het begint nooit een gevecht');
    assert.equal(e.maxLeven, 0, 'geen levensbalk');
    assert.equal(e.ap, 0);
    assert.equal(e.gesprek, null);
    assert.deepEqual([e.x, e.y, e.tx, e.ty], [10, 12, 10, 12]);
    assert.deepEqual(e.thuis, { x: 10, y: 12 });
    assert.equal(e.straal, v.straal);
    assert.equal(e.dwaalt, true);
    assert.equal(e.snelheid, v.snelheid);
    assert.equal(T.snelheidVan(e), v.snelheid);
    assert.deepEqual(e.pauze, v.pauze);
    assert.ok(e.dwaalTijd >= v.pauze[0] && e.dwaalTijd <= v.pauze[1]);
    assert.deepEqual(e.pad, []);
  }
  assert.throws(() => T.maakDier('geit', 0, 0, 1), /onbekend dier/);
});

test('hetzelfde zaad geeft hetzelfde dier, en een kudde kijkt niet allemaal dezelfde kant op', () => {
  const a = T.maakDier('koe', 3, 4, 42);
  const b = T.maakDier('koe', 9, 1, 42);
  for (const veld of ['kleur', 'vel', 'fase', 'dwaalTijd', 'beginRichting']) assert.deepEqual(a[veld], b[veld], veld);
  const kanten = new Set();
  for (let z = 1; z <= 12; z++) kanten.add(T.maakDier('schaap', 0, 0, z).beginRichting);
  assert.ok(kanten.size >= 4, `twaalf schapen kijken maar ${kanten.size} kanten op`);
  for (const k of kanten) assert.ok(['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO'].includes(k));
});

test('het zaad kiest de kleur, en daarmee het vel: koe0..2 en schaap0..2', () => {
  for (const [soort, v] of Object.entries(T.VEE)) {
    const gezien = new Set();
    for (let z = -5; z < 20; z++) {
      const k = T.dierKleur(soort, z);
      assert.ok(Number.isInteger(k) && k >= 0 && k < v.kleuren, `${soort} zaad ${z}: kleur ${k}`);
      assert.equal(T.dierKleur(soort, z), k, 'vast');
      assert.equal(T.maakDier(soort, 0, 0, z).vel, `${soort}${k}`);
      gezien.add(k);
    }
    assert.equal(gezien.size, v.kleuren, `alle ${v.kleuren} kleuren van ${soort} komen voor`);
    // net zoveel kleuren als er vellen getekend worden
    assert.equal(v.kleuren, Vee.VELLEN.filter((vel) => vel.soort === soort).length);
  }
  // geen of een raar zaad is kleur 0, geen fout
  assert.equal(T.dierKleur('koe', undefined), 0);
  assert.equal(T.dierKleur('koe', 4.7), 1);
});

// Wat een kudde doet over een lange tijd, elke seconde bekeken.
function kijk(soort, zaden, seconden, stap = 1) {
  const dieren = zaden.map((z) => T.maakDier(soort, 0, 0, z));
  const tel = { grazen: 0, staan: 0, liggen: 0 };
  let allemaalLiggen = 0;
  for (let t = 0; t < seconden; t += stap) {
    let liggen = 0;
    for (const e of dieren) {
      const r = T.rustVanDier(e, t);
      tel[r]++;
      if (r === 'liggen') liggen++;
    }
    if (liggen === dieren.length) allemaalLiggen++;
  }
  const totaal = tel.grazen + tel.staan + tel.liggen;
  return { deel: { grazen: tel.grazen / totaal, staan: tel.staan / totaal, liggen: tel.liggen / totaal }, allemaalLiggen };
}

test('de rusthouding: meestal grazen, soms staan, af en toe liggen', () => {
  const zaden = Array.from({ length: 40 }, (_, i) => i * 13 + 5);
  for (const [soort, v] of Object.entries(T.VEE)) {
    const { deel } = kijk(soort, zaden, 4 * 3600, 2);
    assert.ok(deel.grazen > deel.staan && deel.grazen > deel.liggen, `${soort} graast het meest: ${JSON.stringify(deel)}`);
    assert.ok(Math.abs(deel.grazen - v.rust.grazen) < 0.06, `${soort} graast ${deel.grazen.toFixed(2)} van de tijd, niet ${v.rust.grazen}`);
    assert.ok(Math.abs(deel.liggen - v.rust.liggen) < 0.05, `${soort} ligt ${deel.liggen.toFixed(2)} van de tijd, niet ${v.rust.liggen}`);
    assert.ok(deel.staan > 0.1, `${soort} staat ook weleens: ${deel.staan.toFixed(2)}`);
  }
});

test('de rusthouding flikkert niet: elke houding duurt een blok of langer, en liggen langer', () => {
  for (const [soort, v] of Object.entries(T.VEE)) {
    for (const zaad of [1, 2, 3, 17, 99]) {
      const e = T.maakDier(soort, 0, 0, zaad);
      const dt = 0.05;
      let nu = T.rustVanDier(e, 0);
      let sinds = 0;
      const stukken = [];
      for (let t = dt; t < 1800; t += dt) {
        const r = T.rustVanDier(e, t);
        assert.equal(T.rustVanDier(e, t), r, 'dezelfde tijd, hetzelfde antwoord');
        if (r !== nu) {
          if (sinds > 0) stukken.push({ houding: nu, duur: t - sinds });
          nu = r;
          sinds = t;
        }
      }
      // het eerste stuk kan half zijn (het begint midden in een blok); de rest is heel
      for (const s of stukken) assert.ok(s.duur >= 0.8 * v.rust.blok - dt, `${soort} ${zaad}: ${s.houding} maar ${s.duur.toFixed(2)} s`);
      const liggen = stukken.filter((s) => s.houding === 'liggen');
      for (const s of liggen) assert.ok(s.duur >= 2 * 0.8 * v.rust.blok - dt, `${soort} ${zaad}: gaat liggen voor maar ${s.duur.toFixed(1)} s`);
    }
  }
});

test('niet de hele kudde tegelijk: ze liggen nooit allemaal, en slaan niet op hetzelfde moment om', () => {
  // acht koeien en tien schapen, twee uur lang
  assert.equal(kijk('koe', [1, 2, 3, 4, 5, 6, 7, 8], 7200).allemaalLiggen, 0);
  assert.equal(kijk('schaap', [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 7200).allemaalLiggen, 0);
  // Wanneer slaat een dier om? Elk dier heeft een eigen bloklengte en een eigen begin, dus de
  // momenten vallen niet samen.
  const omslag = (zaad) => {
    const e = T.maakDier('koe', 0, 0, zaad);
    for (let t = 0.05; t < 60; t += 0.05) if (T.rustVanDier(e, t) !== T.rustVanDier(e, t - 0.05)) return Math.round(t * 20);
    return null;
  };
  const momenten = [1, 2, 3, 4, 5, 6].map(omslag).filter((m) => m != null);
  assert.ok(new Set(momenten).size >= momenten.length - 1, `ze slaan om op ${momenten}`);
});

test('een dier dat ligt, dwaalt niet weg; staat of graast het, dan zet het een stap', () => {
  const w = T.maakProefkamers();
  for (const e of w.wezens) if (e.soort !== 'held') e.dood = true;
  const held = w.wezens.find((e) => e.soort === 'held');
  held.x = held.tx = 2;
  held.y = held.ty = 2;
  const koe = T.maakDier('koe', 6, 4, 5);
  koe.straal = 2;
  koe.thuis = { x: 6, y: 4 };
  w.wezens.push(koe);
  const S = { wereld: w, held, tijd: 0 };
  const tijdVan = (houding) => {
    for (let t = 0; t < 3600; t += 1) if (T.rustVanDier(koe, t) === houding) return t;
    return null;
  };
  const lig = tijdVan('liggen');
  const graas = tijdVan('grazen');
  assert.ok(lig != null && graas != null);

  S.tijd = lig;
  koe.dwaalTijd = 0;
  T.laatDwalen(S, 0.1);
  assert.deepEqual(koe.pad, [], 'wie ligt, blijft liggen');

  S.tijd = graas;
  koe.dwaalTijd = 0;
  T.laatDwalen(S, 0.1);
  assert.equal(koe.pad.length, 1, 'een stap naar een buurtegel');
  // en daarna staat het een eigen, lange pauze stil
  assert.ok(koe.dwaalTijd >= koe.pauze[0] && koe.dwaalTijd <= koe.pauze[1], `pauze ${koe.dwaalTijd}`);
});

test('de muis op een dier: alleen wat het is, geen gesprek en geen klik', () => {
  const w = T.maakProefkamers();
  const held = w.wezens.find((e) => e.soort === 'held');
  const S = { wereld: w, held, spreuk: null, inventaris: new Set() };
  for (const soort of Object.keys(T.VEE)) {
    const e = T.maakDier(soort, 5, 5, 3);
    assert.equal(T.gesprekVan(e), null, 'er is geen gesprek "koe" of "schaap"');
    const h = T.handelingVerkennen(S, { wezen: e, x: 5, y: 5 });
    assert.equal(h.tekst, soort === 'koe' ? 'Een koe' : 'Een schaap');
    assert.equal(h.doe, undefined, 'een klik doet niets');
  }
  // en in een gevecht telt het niet mee
  const koe = T.maakDier('koe', 3, 3, 1);
  w.wezens.push(koe);
  assert.deepEqual(T.deelnemers(w, held, koe), []);
});

test('de loopsnelheid in het spel is die van de kunst, anders glijden de voeten', () => {
  for (const [soort, v] of Object.entries(T.VEE)) assert.equal(v.snelheid, Vee.SNELHEID[soort], soort);
  // en de vellen in beelden/, als ze er al zijn, lopen daar ook op en hebben alle vier de houdingen
  require('../beelden/beschrijving.js');
  const F = (T.BEELDEN && T.BEELDEN.figuren) || {};
  for (const vel of Vee.VELLEN) {
    const f = F[vel.naam];
    if (!f) continue;
    assert.deepEqual(Object.keys(f.houdingen).sort(), [...HOUDINGEN].sort(), vel.naam);
    assert.equal(f.snelheid, Vee.SNELHEID[vel.soort], vel.naam);
    const l = f.houdingen.lopen;
    assert.equal(l.stap, +((Vee.SNELHEID[vel.soort] * (l.beelden / l.fps)) / 2).toFixed(3), `${vel.naam}: de pas past bij de snelheid`);
    for (const h of HOUDINGEN) assert.equal(f.houdingen[h].herhaal, true, `${vel.naam} ${h} is een lus`);
  }
});

test('lopen: een voet op de grond schuift precies zo hard terug als het spel het dier vooruit schuift', () => {
  const TEGEL = 64 / Math.SQRT2;
  for (const soort of ['koe', 'schaap']) {
    const H = Vee.HOUDINGEN.lopen;
    const fps = Vee.fpsVan(soort, 'lopen');
    // per beeld schuift het spel het dier zoveel eenheden op; het model staat op SCHAAL
    const perBeeld = (Vee.SNELHEID[soort] * TEGEL) / fps / Vee.SCHAAL[soort];
    let gemeten = 0;
    for (let i = 0; i < H.beelden; i++) {
      const a = Vee.rig.houdingVan(soort, 'lopen', i / H.beelden);
      const b = Vee.rig.houdingVan(soort, 'lopen', (i + 1) / H.beelden);
      for (let v = 0; v < 4; v++) {
        const [pa, pb] = [a.voeten[v], b.voeten[v]];
        const opGrond = (p, voet) => p.buig === 0 && Math.abs(p.p[2] - voet[2]) < 1e-9;
        const rust = soort === 'koe' ? Vee.rig.KOE.stand[v] : Vee.rig.SCHAAP.stand[v];
        if (!opGrond(pa, rust) || !opGrond(pb, rust)) continue;
        // (niet over de grens van het rondje heen: daar begint de pas opnieuw)
        if (pa.p[1] - pb.p[1] < 0) continue;
        assert.ok(Math.abs(pa.p[1] - pb.p[1] - perBeeld) < 1e-6, `${soort} voet ${v} beeld ${i}: ${(pa.p[1] - pb.p[1]).toFixed(3)} i.p.v. ${perBeeld.toFixed(3)}`);
        gemeten++;
      }
    }
    assert.ok(gemeten >= 8, `${soort}: maar ${gemeten} keer een staande voet gezien`);
  }
});

test('de kunst: een koe is hoger en zwaarder dan een schaap, en allebei kleiner dan de boer', () => {
  // Gemeten aan de modellen zelf, met hun afstandsfunctie: geen render nodig. Hoe hoog is het
  // lijf op deze plek (x = 0, y), in eenheden?
  const top = (m, y) => {
    for (let z = 120; z > 0; z -= 0.25) if (m.sdf(0, y, z) < 0) return z;
    return 0;
  };
  const { boer } = require('../gereedschap/pixelart/dorpelingen.cjs');
  const man = top(boer({ houding: 'staan', fase: 0 }), 0);
  const koe = Vee.koe({ houding: 'staan' });
  const schaap = Vee.schaap({ houding: 'staan' });
  const schoft = top(koe, 19);
  const rug = top(schaap, 0);
  // Middeleeuws vee was klein: een koe van zo'n 1,1 meter in de schoft naast een man van 1,7, een
  // schaap van 60 centimeter.
  assert.ok(schoft / man > 0.55 && schoft / man < 0.72, `koe ${schoft} naast een boer van ${man}`);
  assert.ok(rug / man > 0.3 && rug / man < 0.42, `schaap ${rug} naast een boer van ${man}`);
  assert.ok(schoft > rug * 1.5, `koe ${schoft}, schaap ${rug}`);
  assert.ok(koe.straal > schaap.straal * 1.4, `koe ${koe.straal.toFixed(1)}, schaap ${schaap.straal.toFixed(1)}`);
  // en een liggend dier komt niet onder de grond uit (het deel dat eronder zakt, wordt weggesneden)
  for (const m of [Vee.koe({ houding: 'liggen' }), Vee.schaap({ houding: 'liggen' })]) {
    assert.ok(m.delen.some((d) => d.uit), 'de grond snijdt');
    assert.ok(m.sdf(0, 0, -3) > 0, 'onder de grond is niets');
  }
});

// ---------------------------------------------------------------------------------------------
// De regels: het vee op de weide (ontwerp/spel.md, "Weides met koeien en schapen", stap 1)
// ---------------------------------------------------------------------------------------------

const IN = T.VEE_INSTELLINGEN;
const ETEN = T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
const MELK = IN.melkVoorMensen * ETEN; // één koe, één dag, in graan gerekend
const bijna = (a, b) => Math.abs(a - b) < 1e-9;

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum, in het eerste of een later jaar.
function dagVan(maand, dagVanMaand, jaar) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return (jaar || 0) * T.DAGEN_PER_JAAR + ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}

// Een gehucht zonder kaart, met deze velden ({ x, y, b, h, bestemming }) en een vast lot.
function wereldMet(...velden) {
  const akkers = velden.map((v, i) => ({ naam: `veld${i}`, huis: null, plan: v.bestemming, vruchtbaarheid: 1, ...v }));
  const S = {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0,
    kalender: { dag: 0, snelheid: 1 }, lot: { zaad: 42 }, wereld: { wezens: [], akkers },
  };
  return { S, velden: akkers };
}

// Zet n dieren van één soort op een weide, in de hoek (waar precies doet hier niet ter zake).
function zet(S, veld, soort, n) {
  for (let i = 0; i < n; i++) S.wereld.wezens.push(T.zetOpWeide(T.maakDier(soort, veld.x, veld.y, 100 + S.wereld.wezens.length), veld));
}

// Wat de spelregels zeggen, even anders, en daarna weer terug.
function metInstelling(blok, waarden, fn) {
  const oud = JSON.parse(JSON.stringify(blok));
  Object.assign(blok, waarden);
  try {
    return fn();
  } finally {
    Object.assign(blok, oud);
  }
}

const binnen = (e, v) => e.tx >= v.x && e.tx < v.x + v.b && e.ty >= v.y && e.ty < v.y + v.h;

test('de beginkudde: drie koeien op het blok van Klaas (akker6), binnen de weide, en acht schapen op de heide', () => {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  const weide = S.wereld.akkers.find((a) => a.naam === 'akker6');
  assert.equal(weide.bestemming, 'weide', 'het betekenisbestand zegt het');
  assert.equal(weide.plan, 'weide');
  assert.ok(S.wereld.akkers.filter((a) => a !== weide).every((a) => a.bestemming === 'akker' && a.plan === 'akker'));
  assert.ok(S.wereld.akkers.every((a) => a.vruchtbaarheid === T.VELDEN_INSTELLINGEN.beginVruchtbaarheid));
  const vee = T.veeVan(S);
  assert.equal(vee.filter((e) => e.dier === 'koe').length, IN.beginKudde.koe);
  assert.equal(vee.filter((e) => e.dier === 'schaap').length, IN.beginKudde.schaap);
  // Sinds stap 2 van de weides staan de schapen op de heide, de meent (spel.md, "Marcel koos voor
  // stap 2"), en de koeien op de weide.
  const meent = T.meentVan(S.wereld);
  assert.ok(meent, 'het gehucht heeft een meent');
  for (const e of vee) {
    const plek = e.dier === 'koe' ? weide : meent;
    assert.equal(e.weide, plek);
    assert.ok(binnen(e, plek), `${e.soort} op ${e.tx},${e.ty}`);
    assert.ok(T.isBegaanbaar(S.wereld, e.tx, e.ty), 'het staat op begaanbare grond');
  }
  assert.equal(new Set(vee.map((e) => e.tx + ',' + e.ty)).size, vee.length, 'niet twee op één tegel');
  // Drie koeien hebben 12 van de 30 tegels nodig.
  const nodig = IN.beginKudde.koe * IN.plaats.koe;
  assert.deepEqual(T.weideStand(S, weide), { tegels: 30, nodig, vrij: 30 - nodig, vol: 1, koeien: 3, schapen: 0 });
  assert.equal(T.dierenOp(S, meent).length, IN.beginKudde.schaap);
  assert.equal(T.kooiPlaats(S), IN.kooiPlaats, 'en er staat een schaapskooi');
  // Zonder weide geen vee.
  const { S: kaal } = wereldMet({ x: 0, y: 0, b: 4, h: 4, bestemming: 'akker' });
  assert.deepEqual(T.zetBeginKudde(kaal), []);
  assert.equal(T.veeVan(kaal).length, 0);
});

test('melk: van grasmaand tot en met wijnmaand, elke koe voor vijf mensen, en minder als de weide te vol is', () => {
  const { S, velden: [weide] } = wereldMet({ x: 0, y: 0, b: 4, h: 3, bestemming: 'weide' }); // 12 tegels
  zet(S, weide, 'koe', 2);
  zet(S, weide, 'schaap', 2); // 2 × 4 + 2 × 2 = 12: precies vol
  assert.equal(T.melkVanDag(S, dagVan('lentemaand', 30)), 0, 'nog geen melk');
  assert.ok(bijna(T.melkVanDag(S, dagVan('grasmaand', 1)), 2 * MELK));
  assert.ok(bijna(T.melkVanDag(S, dagVan('wijnmaand', 30)), 2 * MELK));
  assert.equal(T.melkVanDag(S, dagVan('slachtmaand', 1)), 0, 'en daarna niet meer');
  // Nog een koe erbij: 16 nodig op 12 tegels, dan geeft elke koe driekwart.
  zet(S, weide, 'koe', 1);
  const stand = T.weideStand(S, weide);
  assert.equal(stand.vrij, -4);
  assert.equal(stand.vol, 12 / 16);
  assert.ok(bijna(T.melkVanDag(S, dagVan('grasmaand', 1)), 3 * MELK * (12 / 16)));
  // Een koe die bij geen weide hoort (Spel.debug.vee zet ze los neer), geeft niets.
  S.wereld.wezens.push(T.maakDier('koe', 20, 20, 5));
  assert.ok(bijna(T.melkVanDag(S, dagVan('grasmaand', 1)), 3 * MELK * (12 / 16)));
});

test('een kalf is nog geen koe: het geeft pas melk als het een jaar oud is', () => {
  const { S, velden: [weide] } = wereldMet({ x: 0, y: 0, b: 4, h: 4, bestemming: 'weide' });
  zet(S, weide, 'koe', 1);
  const kalf = T.zetOpWeide(T.maakDier('koe', 1, 1, 9), weide);
  kalf.geboren = dagVan('grasmaand', 1);
  S.wereld.wezens.push(kalf);
  assert.ok(bijna(T.melkVanDag(S, dagVan('grasmaand', 2)), MELK));
  assert.ok(bijna(T.melkVanDag(S, dagVan('grasmaand', 1, 1)), 2 * MELK));
});

test('eten: eerst de melk van vandaag, dan graan, dan kaas; wat er van de melk over is, wordt kaas', () => {
  const S = { voorraad: T.nieuweVoorraad(), bevolking: 20, vee: T.nieuwVee() };
  const nodig = 20 * ETEN;
  T.zetVoorraad(S, 'graan', 10);
  T.zetVoorraad(S, 'kaas', 5);
  // Melk voor de helft: de rest uit het graan, en de kaas blijft liggen.
  S.vee.melk = nodig / 2;
  let r = T.eetVandaag(S);
  assert.ok(bijna(r.melk, nodig / 2) && bijna(r.graan, nodig / 2) && r.kaas === 0 && r.tekort === 0, JSON.stringify(r));
  assert.ok(bijna(S.voorraad.graan, 10 - nodig / 2));
  assert.equal(S.voorraad.kaas, 5);
  assert.equal(S.vee.melk, 0, 'melk houdt niet');
  // Meer melk dan nodig: geen graan, en wat over is, wordt kaas.
  S.vee.melk = 3 * nodig;
  r = T.eetVandaag(S);
  assert.equal(r.graan, 0);
  assert.ok(bijna(r.kaasErbij, 2 * nodig * IN.melkNaarKaas));
  assert.ok(bijna(S.voorraad.kaas, 5 + 2 * nodig * IN.melkNaarKaas));
  // Geen melk en geen graan: pas dan de kaas.
  T.zetVoorraad(S, 'graan', 0);
  const kaas = S.voorraad.kaas;
  r = T.eetVandaag(S);
  assert.ok(bijna(r.kaas, nodig) && r.tekort === 0);
  assert.ok(bijna(S.voorraad.kaas, kaas - nodig));
  // Alles op: honger.
  T.zetVoorraad(S, 'kaas', 0);
  assert.ok(bijna(T.eetVandaag(S).tekort, nodig));
});

// Vlees vult een maag (Marcel, 25 sep: "Ja vlees moet ook eten zijn"): wat het zout niet goed houdt,
// eet het dorp vóór het graan, want dat bederft anders toch; gezouten vlees pas als het graan en de
// kaas op zijn, en dan gaat het zout mee.
test('eten: ongezouten vlees vóór het graan, gezouten vlees als laatste; de optie zet het uit', () => {
  const BH = T.BEHOEFTEN_INSTELLINGEN;
  const S = { voorraad: T.nieuweVoorraad(), bevolking: 20, vee: T.nieuwVee() };
  const nodig = 20 * ETEN;
  const perVlees = BH.vleesAlsGraan;
  // Geen zout: het vlees gaat voor het graan.
  T.zetVoorraad(S, 'graan', 10);
  T.zetVoorraad(S, 'vlees', 100);
  let r = T.eetVandaag(S);
  assert.ok(bijna(r.vlees, nodig / perVlees) && r.graan === 0 && r.tekort === 0, JSON.stringify(r));
  assert.equal(S.voorraad.graan, 10);
  // Genoeg zout voor al het vlees: dat bewaart het dorp, en het eet graan.
  T.zetVoorraad(S, 'zout', 100);
  r = T.eetVandaag(S);
  assert.ok(r.vlees === 0 && bijna(r.graan, nodig), JSON.stringify(r));
  // Graan en kaas op: dan het gezouten vlees, en het zout gaat mee.
  T.zetVoorraad(S, 'graan', 0);
  const vlees = S.voorraad.vlees;
  r = T.eetVandaag(S);
  assert.ok(bijna(r.vlees, nodig / perVlees) && r.tekort === 0, JSON.stringify(r));
  assert.ok(bijna(S.voorraad.vlees, vlees - nodig / perVlees));
  assert.ok(bijna(S.voorraad.zout, 100 - nodig / perVlees / BH.zoutHoudtGoed));
  // Vlees vult geen maag (de optie): honger, en het vlees blijft liggen.
  const oud = BH.vleesIsEten;
  BH.vleesIsEten = false;
  try {
    r = T.eetVandaag(S);
    assert.ok(r.vlees === 0 && bijna(r.tekort, nodig));
  } finally {
    BH.vleesIsEten = oud;
  }
});

test('de tevredenheid ziet de melk van vandaag en de kaas: wie geen graan heeft maar wel melk, eet', () => {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 20, vee: T.nieuwVee() };
  const dag = dagVan('grasmaand', 5);
  assert.equal(T.berekenTevredenheid(S, dag).voedselDekking, 0);
  S.vee.melk = 20 * ETEN;
  assert.equal(T.berekenTevredenheid(S, dag).voedselDekking, 1);
  S.vee.melk = 0;
  T.zetVoorraad(S, 'kaas', 100);
  assert.equal(T.berekenTevredenheid(S, dag).voedselDekking, 1);
  assert.ok(!T.berekenTevredenheid(S, dag).mist.includes('eten'));
});

test('een dag: het vee komt vóór het eten, dus het dorp drinkt de melk van dezelfde dag', () => {
  const { S, velden: [weide] } = wereldMet({ x: 0, y: 0, b: 2, h: 2, bestemming: 'weide' });
  zet(S, weide, 'koe', 1);
  S.bevolking = IN.melkVoorMensen; // precies zoveel monden als één koe voedt
  T.zetVoorraad(S, 'graan', 10);
  T.tikGebouwenDag(S, dagVan('grasmaand', 5));
  assert.ok(bijna(S.voorraad.graan, 10), `de melk was genoeg, en toch ging er graan af: ${S.voorraad.graan}`);
  assert.ok(!S.behoeften.mist.includes('eten'));
  // In de winter geeft ze niets, en eet het dorp graan.
  T.tikGebouwenDag(S, dagVan('wintermaand', 5));
  assert.ok(bijna(S.voorraad.graan, 10 - IN.melkVoorMensen * ETEN));
});

test('groei: op 1 grasmaand werpen koeien en schapen jongen, uit het lot van het spel en niet uit Math.random', () => {
  const dag = dagVan('grasmaand', 1);
  const kudde = (zaad) => {
    const { S, velden: [weide] } = wereldMet({ x: 0, y: 0, b: 10, h: 10, bestemming: 'weide' }); // ruim
    S.lot.zaad = zaad;
    zet(S, weide, 'koe', 10);
    zet(S, weide, 'schaap', 10);
    return { S, weide };
  };
  const { S, weide } = kudde(42);
  T.tikVeeDag(S, dag - 1);
  assert.equal(T.veeVan(S).length, 20, 'de dag ervoor nog niet');
  T.tikVeeDag(S, dag);
  const jong = T.veeVan(S).filter((e) => e.geboren === dag);
  const kalveren = jong.filter((e) => e.dier === 'koe').length;
  const lammeren = jong.filter((e) => e.dier === 'schaap').length;
  assert.ok(kalveren > 0 && kalveren < 10, `${kalveren} kalveren van tien koeien, bij een kans van ${IN.kansOpJong.koe}`);
  assert.ok(lammeren > 0 && lammeren < 10, `${lammeren} lammeren van tien schapen, bij een kans van ${IN.kansOpJong.schaap}`);
  for (const e of jong) {
    assert.equal(e.weide, weide, 'een jong blijft bij zijn moeder');
    assert.ok(binnen(e, weide));
  }
  T.tikVeeDag(S, dag + 1);
  assert.equal(T.veeVan(S).length, 20 + jong.length, 'de dag erna niet nog eens');
  // Hetzelfde spel werpt dezelfde jongen; een ander spel andere.
  const zelfde = kudde(42);
  T.tikVeeDag(zelfde.S, dag);
  assert.deepEqual(T.veeVan(zelfde.S).map((e) => e.zaad), T.veeVan(S).filter((e) => !(e.geboren > dag)).map((e) => e.zaad));
  const ander = kudde(7);
  T.tikVeeDag(ander.S, dag);
  assert.notDeepEqual(T.veeVan(ander.S).map((e) => e.zaad), T.veeVan(zelfde.S).map((e) => e.zaad));
});

test('groei: zolang er plaats is; een volle weide werpt niet, een krappe alleen wat past', () => {
  const dag = dagVan('grasmaand', 1);
  metInstelling(IN, { kansOpJong: { koe: 1, schaap: 1 } }, () => {
    // Vol: niets.
    const vol = wereldMet({ x: 0, y: 0, b: 4, h: 3, bestemming: 'weide' });
    zet(vol.S, vol.velden[0], 'koe', 2);
    zet(vol.S, vol.velden[0], 'schaap', 2); // 12 van 12
    T.tikVeeDag(vol.S, dag);
    assert.equal(T.veeVan(vol.S).length, 4);
    // Twee tegels vrij: één lam, en nooit een kalf (dat heeft er vier nodig).
    const krap = wereldMet({ x: 0, y: 0, b: 7, h: 2, bestemming: 'weide' });
    zet(krap.S, krap.velden[0], 'koe', 2);
    zet(krap.S, krap.velden[0], 'schaap', 2); // 12 van 14
    const jong = T.werpJongen(krap.S, dag);
    assert.deepEqual(jong.map((e) => e.dier), ['schaap']);
    assert.equal(T.weideStand(krap.S, krap.velden[0]).vrij, 0);
    // Ruimte voor drie schapen, en vijf die willen: drie lammeren.
    const drie = wereldMet({ x: 0, y: 0, b: 8, h: 2, bestemming: 'weide' });
    zet(drie.S, drie.velden[0], 'schaap', 5); // 10 van 16
    assert.equal(T.werpJongen(drie.S, dag).length, 3);
  });
});

test('groei staat uit met de optie "Groeit niet"', () => {
  metInstelling(IN, { groeit: false, kansOpJong: { koe: 1, schaap: 1 } }, () => {
    const { S, velden: [weide] } = wereldMet({ x: 0, y: 0, b: 10, h: 10, bestemming: 'weide' });
    zet(S, weide, 'koe', 3);
    T.tikVeeDag(S, dagVan('grasmaand', 1));
    assert.equal(T.veeVan(S).length, 3);
    assert.ok(S.vee.melk > 0, 'melk geven ze wel');
  });
});

test('T.kanBestemming: een weide wordt pas iets anders als zijn vee ergens anders plaats heeft', () => {
  const { S, velden: [oud, nieuw] } = wereldMet(
    { x: 0, y: 0, b: 5, h: 6, bestemming: 'weide' }, // 30 tegels, zoals akker6
    { x: 6, y: 0, b: 2, h: 14, bestemming: 'akker' }, // 28 tegels, zoals akker1
  );
  zet(S, oud, 'koe', 3);
  zet(S, oud, 'schaap', 8); // 28 nodig
  assert.deepEqual(T.kanBestemming(S, oud, 'akker'), {
    kan: false, reden: 'Dan is er volgend jaar geen weide meer voor 3 koeien en 8 schapen. Maak eerst een ander veld weide.',
  });
  assert.equal(T.zetPlan(S, oud, 'braak').kan, false);
  assert.equal(oud.plan, 'weide', 'wat niet kan, verandert niets');
  // Wordt het andere veld eerst weide, dan kan het wel: 28 tegels voor 28 nodig.
  assert.equal(T.zetPlan(S, nieuw, 'weide').kan, true);
  assert.deepEqual(T.kanBestemming(S, oud, 'akker'), { kan: true, reden: null });
  // Is die andere weide te klein, dan zegt hij hoeveel het scheelt.
  nieuw.b = 1;
  assert.deepEqual(T.kanBestemming(S, oud, 'akker'), {
    kan: false,
    reden: 'Dan is er te weinig weide: 3 koeien en 8 schapen moeten ergens anders grazen en hebben 28 tegels nodig, en op de andere weides zijn nog 14 tegels vrij.',
  });
  // Een akker braak laten liggen, of weer weide van maken, heeft met het vee niets te maken.
  nieuw.plan = 'akker';
  assert.equal(T.kanBestemming(S, nieuw, 'braak').kan, true);
});

test('op 1 lentemaand verhuist het vee naar zijn nieuwe weide', () => {
  const { S, velden: [oud, nieuw] } = wereldMet(
    { x: 0, y: 0, b: 5, h: 6, bestemming: 'weide' },
    { x: 6, y: 0, b: 2, h: 14, bestemming: 'akker' },
  );
  zet(S, oud, 'koe', 3);
  zet(S, oud, 'schaap', 8);
  T.zetVoorraad(S, 'graan', 100); // zaaigraan
  T.zetPlan(S, nieuw, 'weide');
  T.zetPlan(S, oud, 'akker');
  T.tikAkkersDag(S, dagVan('lentemaand', 1, 1));
  assert.equal(oud.bestemming, 'akker');
  assert.equal(nieuw.bestemming, 'weide');
  assert.equal(T.dierenOp(S, oud).length, 0);
  assert.equal(T.dierenOp(S, nieuw).length, 11);
  // Het gewone dwaalwerk brengt ze erheen: hun thuis is het midden van de nieuwe weide.
  for (const e of T.veeVan(S)) assert.deepEqual(e.thuis, { x: nieuw.x + 0.5, y: nieuw.y + 6.5 });
  assert.equal(T.weideStand(S, nieuw).vol, 1);
  // De oude weide is nu een akker, en wordt dus gezaaid.
  assert.equal(T.akkerOnbeslistTegels(oud).length, 30);
});

test('past het vee bij de wissel toch niet, dan staat het te krap; en is er geen weide meer, dan blijft de weide', () => {
  // Te krap: het plan ging buiten T.kanBestemming om (of de kudde groeide erna).
  const krap = wereldMet({ x: 0, y: 0, b: 5, h: 6, bestemming: 'weide' }, { x: 6, y: 0, b: 1, h: 14, bestemming: 'akker' });
  const [oud, klein] = krap.velden;
  zet(krap.S, oud, 'koe', 3);
  zet(krap.S, oud, 'schaap', 8);
  oud.plan = 'akker';
  klein.plan = 'weide';
  T.wisselVelden(krap.S);
  assert.equal(T.dierenOp(krap.S, klein).length, 11, 'niemand blijft achter op de akker');
  assert.equal(T.weideStand(krap.S, klein).vol, 14 / 28);
  assert.ok(bijna(T.melkVanDag(krap.S, dagVan('grasmaand', 1)), 3 * MELK * 0.5));
  // Geen weide meer: dan blijft de weide met vee weide.
  const geen = wereldMet({ x: 0, y: 0, b: 5, h: 6, bestemming: 'weide' });
  zet(geen.S, geen.velden[0], 'koe', 3);
  geen.velden[0].plan = 'akker';
  T.wisselVelden(geen.S);
  assert.equal(geen.velden[0].bestemming, 'weide');
  assert.equal(T.dierenOp(geen.S, geen.velden[0]).length, 3);
});
