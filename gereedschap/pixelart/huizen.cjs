'use strict';
// De huizen van het spel: welke huizen van de huizenbouwer (huis-sdf.cjs) op het vel
// tegels/huizen.png staan, en hoe er een voor dat vel gerenderd wordt. Ronde 4b van de huizenbouwer
// (ontwerp/beeld.md, "Ronde 4b: de huizen in het spel"); naar-tiled.cjs maakt het vel, bouwfasen.cjs
// de vijf fases waarin een huis oprijst.
//
// Elke opgave ligt helemaal vast, ook de uitbouwen (`uit`, uitgeschreven): zonder `uit` kiest het zaad
// ze, en een nieuwe kans in huis-sdf.cjs zou dan stil een ander huis op het vel zetten. Een huis
// dat op het vel staat, verandert alleen als iemand zijn regel hieronder verandert. Nieuwe huizen
// komen achteraan op het vel, wat de volgorde hier ook is (vaste-volgorde.cjs).
//
// Een opgave is die van huis(zaad, o) in huis-sdf.cjs (vorm, maat, lagen, nok, dak, wand, boven,
// hout, uit), met:
//   deur     'voor' (standaard: op een muur die je ziet) of 'achter' (aan de kant die je niet ziet:
//            het huis staat met zijn achterkant naar de kijker, en met zijn deur naar het plein);
//   gebouw   welk gebouw van het spel hem gebruikt (T.GEBOUWEN in js/gebouwen.js), om te lezen;
//   trede    de stap op de ladder van beter bouwen (ontwerp/spel.md, "Beter bouwen"): 1 vlechtwerk
//            onder riet, 2 vakwerk onder riet, 3 half steen. In het spel nu alleen 1 en 2, en de
//            schout in 3 (Marcel, 26 sep).
//
// renderHuis(opgave) geeft { plaat, anker, voet, deur }:
//   plaat  de tekening, strak gesneden, zonder gras en zonder schaduw op de grond: het spel legt
//          zijn eigen grond eronder;
//   anker  het punt in de plaat waar de achterste hoek van de voet valt (naar-tiled.cjs legt daar
//          de afspraak van tegels.json op: +16, het midden van de tegel);
//   voet   [b, d]: hoeveel tegels het huis beslaat, gemeten aan het huis zelf, net boven de grond
//          (muren, een aanbouw, een trap, de palen van een galerij), niet aan zijn dak;
//   deur   [dx, dy]: de tegel vóór de deur, vanaf de achterste tegel van de voet. Die ligt buiten de
//          voet, dus een van beide is -1, b of d. Het spel stuurt de bewoners daarheen
//          (T.deurVan, js/bewoners.js).
const fs = require('fs');
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');
const Tr = require('./toren.cjs');
const HS = require('./huis-sdf.cjs');
const F = require('./figuren.cjs');
const VW = require('./voorwerpen.cjs');

const { TEGEL, EX, EY, sdf } = K;

// ---------------------------------------------------------------- de huizen

// Het gehucht (Marcel, 26 sep): echte hutten van vlechtwerk en leem onder riet, huizen van vakwerk
// onder riet, vijf boerderijen die elk anders zijn, en het huis van de schout: steen beneden,
// vakwerk erboven, het enige huis dat half steen is. Maten in tegels, b langs de nok. In het gehucht
// is geen steen: een lage plint, en een schoorsteen van leem (een hut heeft er geen: de rook trekt
// door het riet). Een stenen schoorsteen hoort bij trede 3, zoals bij de schout.
const HUIZEN = {
  // ── hutten: trede 1, vlechtwerk met leem onder riet, klein en laag, het hout grijs verweerd ──
  hut1: { gebouw: 'hut', trede: 1, zaad: 11, vorm: 'rechthoek', b: 5, d: 4, lagen: 1, nok: 'x', dak: 'riet', wand: 'vlecht', hout: 'schors', laag: true, plint: 30, schoorsteen: false, schoor: true, uit: false },
  hut2: { gebouw: 'hut', trede: 1, zaad: 12, vorm: 'rechthoek', b: 5, d: 4, lagen: 1, nok: 'y', dak: 'riet', wand: 'vlecht', hout: 'schors', laag: true, plint: 30, schoorsteen: false, schoor: false, uit: { luiken: true } },
  // (een aanbouw past niet onder de lage goot van een hut: de bouwer slaat hem dan over)
  hut3: { gebouw: 'hut', trede: 1, zaad: 13, vorm: 'rechthoek', b: 6, d: 4, lagen: 1, nok: 'x', dak: 'riet', wand: 'vlecht', hout: 'schors', laag: true, plint: 30, schoorsteen: false, schoor: false, uit: false },
  hut4: { gebouw: 'hut', trede: 1, zaad: 14, vorm: 'L', b: 6, d: 4, b2: 3, d2: 6, kant: 1, voor: true, lagen: 1, nok: 'y', dak: 'riet', wand: 'vlecht', hout: 'schors', laag: true, plint: 30, schoorsteen: false, schoor: false, uit: false },
  // ── huizen: trede 2, vakwerk onder riet ──
  huis1: { gebouw: 'huis', trede: 2, zaad: 21, vorm: 'rechthoek', b: 7, d: 5, lagen: 1, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 36, schoorsteen: 'leem', schoor: false, uit: { luiken: true, bakken: 1 } },
  huis2: { gebouw: 'huis', trede: 2, zaad: 22, vorm: 'rechthoek', b: 7, d: 5, lagen: 1.5, nok: 'y', dak: 'riet', wand: 'vakwerk', plint: 36, schoorsteen: 'leem', schoor: false, uit: { kapellen: 1 } },
  huis3: { gebouw: 'huis', trede: 2, zaad: 23, vorm: 'rechthoek', b: 8, d: 5, lagen: 1, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 36, schoorsteen: 'leem', schoor: true, uit: { aanbouw: true, luiken: true } },
  huis4: { gebouw: 'huis', trede: 2, zaad: 24, vorm: 'L', b: 8, d: 5, b2: 4, d2: 8, kant: -1, voor: false, lagen: 1, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 36, schoorsteen: 'leem', schoor: false, uit: false },
  huis5: { gebouw: 'huis', trede: 2, zaad: 25, vorm: 'rechthoek', b: 6, d: 5, lagen: 1.5, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 36, schoorsteen: 'leem', schoor: false, uit: { gevelschoorsteen: true, kapellen: 1 } },
  huis6: { gebouw: 'huis', trede: 2, zaad: 26, vorm: 'T', b: 9, d: 5, b2: 4, p2: 3, voor: true, lagen: 1, nok: 'y', dak: 'riet', wand: 'vakwerk', plint: 36, schoorsteen: 'leem', schoor: false, uit: { bakken: 2 } },
  // ── boerderijen: trede 2, elk in een ander hout onder riet (en één onder spanen). Elk past in zijn
  // vak op de kaart van het gehucht (gereedschap/tiled/maak-gehucht.cjs, HUIZEN), zoals Marcel die
  // indeling goedkeurde: een L, een T, en twee met hun deur achter, naar het plein toe ──
  boerderij1: { gebouw: 'boerderij', trede: 2, zaad: 31, vorm: 'L', b: 9, d: 5, b2: 3, d2: 7, kant: 1, voor: false, lagen: 1, nok: 'y', dak: 'riet', wand: 'vakwerk', plint: 40, schoorsteen: 'leem', schoor: false, uit: { luiken: true } },
  boerderij2: { gebouw: 'boerderij', trede: 2, zaad: 32, vorm: 'T', b: 9, d: 5, b2: 3, p2: 3, voor: false, lagen: 1, nok: 'x', dak: 'riet', wand: 'planken', plint: 40, schoorsteen: 'leem', schoor: false, uit: false },
  boerderij3: { gebouw: 'boerderij', trede: 2, zaad: 33, vorm: 'rechthoek', b: 9, d: 6, lagen: 1.5, nok: 'y', deur: 'achter', dak: 'riet', wand: 'vlecht', plint: 40, schoorsteen: 'leem', schoor: false, uit: { kapellen: 2 } },
  boerderij4: { gebouw: 'boerderij', trede: 2, zaad: 34, vorm: 'rechthoek', b: 8, d: 6, lagen: 1, nok: 'y', deur: 'achter', dak: 'riet', wand: 'vakwerk', plint: 40, schoorsteen: 'leem', schoor: false, uit: { luiken: true, bakken: 2 } },
  boerderij5: { gebouw: 'boerderij', trede: 2, zaad: 35, vorm: 'rechthoek', b: 9, d: 5, lagen: 1, nok: 'y', dak: 'spanen', wand: 'blokhut', plint: 40, schoorsteen: 'leem', schoor: false, uit: false },
  // ── de schout: trede 3, steen beneden en vakwerk erboven (Marcel: "Vakwerk op stenen voet") ──
  // niemand bouwt het huis van de schout, dus geen bouwfases (bouwfasen.cjs)
  schoutshuis: { gebouw: 'huis', trede: 3, fasen: false, zaad: 41, vorm: 'rechthoek', b: 8, d: 6, lagen: 2, nok: 'x', dak: 'riet', wand: 'veldsteen', boven: 'vakwerk', schoor: false, uit: { luiken: true, bakken: 2 } },
};

// ---------------------------------------------------------------- meten: voet en deur

// Welke tegels het huis beslaat en waar zijn deur is, gemeten aan de wereld zelf. Het raster van
// de tegels hangt aan de achterste hoek van het plan (zijn vleugels, zonder dak): het plan is een
// heel aantal tegels, en het midden ervan ligt op de oorsprong, dus die hoek ligt op een hele of
// een halve tegel. Een tegel hoort bij de voet als het huis in zijn hart staat, net boven de grond
// (Z_VOET, onder een bloembak): vijf keer vijf punten, een vijfde tegel van de rand af. Zo tellen de balken van het
// vakwerk niet, die een paar pixels uit de muur steken, en de palen van een galerij wel.
//
// Een schoor (een balk die schuin tegen een kopgevel steunt) telt mee: hij steekt een tegel voor de
// gevel uit, en je loopt er niet doorheen. Omdat de voet een rechthoek is (js/kaart.js zet hem
// helemaal vast), gaat dan een hele rij tegels langs die gevel dicht; daarom ligt `schoor` in elke
// opgave vast.
const Z_VOET = [10];
function meetHuis(W) {
  const H = W.H;
  // de achterste hoek van het plan, op een halve tegel afgerond (de vleugels staan scheef, en een
  // tweede vleugel een graad of twee uit het haakse: dat mag de hoek niet verschuiven)
  let px = Infinity;
  let py = Infinity;
  for (const V of H.vleugels) {
    for (const sa of [-1, 1]) {
      for (const sq of [-1, 1]) {
        const [x, y] = V.wereld(sa * V.ha, sq * V.hq);
        px = Math.min(px, x);
        py = Math.min(py, y);
      }
    }
  }
  const gx = Math.round((px / TEGEL) * 2) / 2;
  const gy = Math.round((py / TEGEL) * 2) / 2;
  // het veld: tekenWereld sluit de groepen (grenscilinders), op een vlak van 1×1 kost dat niets
  Tr.tekenWereld(new K.Beeld(1, 1, 0, 0), W);
  const groepen = W.groepen.filter((g) => g.delen.length);
  const n = groepen.length;
  const bezet = (i, j) => {
    for (let a = 0; a < 5; a++) {
      for (let b = 0; b < 5; b++) {
        const x = (gx + i + 0.2 + a * 0.15) * TEGEL;
        const y = (gy + j + 0.2 + b * 0.15) * TEGEL;
        for (const z of Z_VOET) if (Tr.veld(groepen, n, x, y, z) < 0) return true;
      }
    }
    return false;
  };
  const RUIM = 4;
  const maat = Math.ceil(Math.max(...H.vleugels.map((V) => Math.hypot(V.cx, V.cy) + Math.hypot(V.ha, V.hq))) / TEGEL) * 2 + RUIM * 2;
  let i0 = Infinity;
  let j0 = Infinity;
  let i1 = -Infinity;
  let j1 = -Infinity;
  for (let j = -RUIM; j < maat; j++) {
    for (let i = -RUIM; i < maat; i++) {
      if (!bezet(i, j)) continue;
      i0 = Math.min(i0, i);
      j0 = Math.min(j0, j);
      i1 = Math.max(i1, i);
      j1 = Math.max(j1, j);
    }
  }
  if (!Number.isFinite(i0)) throw new Error('geen voet gevonden');
  const voet = [i1 - i0 + 1, j1 - j0 + 1];
  // de hoek van de voet: de achterste hoek van de eerste bezette tegel
  const hoek = [gx + i0, gy + j0];
  // De tegel vóór de deur: een halve tegel voor de muur, en staat daar nog iets van het huis (een
  // aanbouw die verder uitsteekt dan de muur met de deur), dan verder naar buiten tot hij vrij is.
  // deurVer: hoeveel tegels die tegel van de deur zelf af ligt. Meer dan één: de voet, een
  // rechthoek, loopt voor de deur langs, en dan sta je een eind voor je eigen deur.
  const binnen = (dx, dy) => dx >= 0 && dy >= 0 && dx < voet[0] && dy < voet[1];
  const tegelVoor = (plek) => {
    const [mx, my] = plek(0);
    const [ux, uy] = plek(1);
    for (let t = 0.5; t < 12; t += 0.25) {
      const dx = Math.floor(mx + (ux - mx) * t - hoek[0]);
      const dy = Math.floor(my + (uy - my) * t - hoek[1]);
      if (!binnen(dx, dy)) return { deur: [dx, dy], deurVer: t };
    }
    return null;
  };
  // De voordeur, of een andere deur op de grond die aan de rand van de voet ligt: de bouwer zet een
  // aanbouw altijd tegen de lange muur, naast de voordeur, en dan gaat de boer door de staldeur.
  const deuren = [(a) => HS.voorDeDeur(H, a)];
  for (const d of H.deuren) {
    if (d === H.deur || d.h0 > 20) continue;
    deuren.push((a) => d.P.pos(d.u, 0, a * TEGEL).slice(0, 2).map((v) => v / TEGEL));
  }
  let beste = null;
  for (const plek of deuren) {
    const t = tegelVoor(plek);
    if (t && (!beste || t.deurVer < beste.deurVer)) beste = t;
  }
  if (!beste) throw new Error('geen tegel voor de deur');
  return { voet, hoek, ...beste };
}

// ---------------------------------------------------------------- renderen

// Eén huis voor het vel: dezelfde tekenaar en hetzelfde licht als de proefplaten (paneelHuis in
// huis-sdf-export.cjs), zonder gras en zonder grondschaduw. Een marge rond het kader voor de omlijning.
function renderHuis(spec) {
  const t0 = Date.now();
  const W = HS.huis(spec.zaad, spec);
  const H = W.H;
  const m = meetHuis(W);
  const kd = HS.kaderVan(H);
  const RAND = 12;
  const b = Math.ceil(kd.b + RAND * 2);
  const h = Math.ceil(kd.h + RAND * 2);
  const OX = Math.round(RAND - kd.x0);
  const OY = Math.round(RAND - kd.y0);
  const B = new K.Beeld(b, h, OX, OY);
  Tr.tekenWereld(B, W);
  B.lichten.push(...W.lichten);
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: HS.WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  const plaat = K.Plaat.van(K.kwantiseer(B));
  // waar de achterste hoek van de voet op het scherm valt
  const X = m.hoek[0] * TEGEL;
  const Y = m.hoek[1] * TEGEL;
  const ax = OX + X * EX[0] + Y * EX[1];
  const ay = OY + X * EY[0] + Y * EY[1];
  // strak snijden
  let xa = plaat.b;
  let ya = plaat.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < plaat.h; y++) {
    for (let x = 0; x < plaat.b; x++) {
      if (plaat.px[(y * plaat.b + x) * 2] < 0) continue;
      if (x < xa) xa = x;
      if (x > x1) x1 = x;
      if (y < ya) ya = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) throw new Error('niets getekend');
  return {
    plaat: plaat.uitsnede(xa, ya, x1 - xa + 1, y1 - ya + 1),
    anker: [Math.round(ax) - xa, Math.round(ay) - ya],
    voet: m.voet,
    deur: m.deur,
    deurVer: m.deurVer,
    ms: Date.now() - t0,
  };
}

// ---------------------------------------------------------------- de bouwfasen
//
// Een huis in aanbouw, in vijf fases tussen "net begonnen" en de tekening op het huizenvel
// (bouwfasen.cjs zet ze op tegels/bouwfasen.png, naast die van de oude gebouwen; ontwerp/spel.md,
// "Gebouwen": "eerst zie je een paar stenen, dan wat hout erbij en gaandeweg steeds meer van het
// gebouw tot het klaar is"). Niet opnieuw getekend, maar uit het huis zelf gesneden: dezelfde wereld,
// met de muren uitgehold tot een schil en op een hoogte afgesneden, het dak in latten, en er een
// geraamte en steigers bij. Zo past elke fase op het afgewerkte huis, ook bij een L, een T of een
// aanbouw, en blijft het anker (de achterste hoek van de voet) hetzelfde punt.
//   1. fundering       de onderkant van de muren, een ring van stenen, met hout en steen ernaast;
//   2. geraamte        daarop een houten geraamte: stijlen en regels langs alle muren;
//   3. muren-steigers  de muren tot twee derde, en steigers langs de kanten die je ziet;
//   4. dakgebinte      de muren af, het dak nog in latten;
//   5. half-gedekt     de onderste helft van het dak gedekt.
const FASEN = ['fundering', 'geraamte', 'muren-steigers', 'dakgebinte', 'half-gedekt'];
// Wat bij de muren hoort: tot de snede in fase 3, heel vanaf fase 4. Het dak zelf komt half in fase 5.
// De rest (de nok, de windveren, de schoorsteen, luiken, bloembakken, de schoor, het dak van een
// aanbouw) komt pas als het huis klaar is.
const BIJ_DE_MUREN = new Set(['romp', 'liggers', 'stijlen', 'blokhoek', 'aanbouwhout', 'aanbouwstijlen', 'deur', 'ramen', 'glas']);
const HET_DAK = new Set(['riet', 'dak']);
const FASE = {
  fundering: 12, // hoe hoog de ring van stenen is, in eenheden
  schil: 9, // hoe dik een muur in aanbouw is
  schilZ: 25, // op die hoogte meten we hoe diep een punt in het huis ligt (onder de ramen, boven de vloer)
  stap: 70, // de afstand tussen de stijlen van het geraamte en de palen van de steiger
  lat: 56, // de afstand tussen de latten van het dak
  steigerUit: 16, // hoe ver de steiger voor de muur staat
};

function fasenVanHuis(W, m) {
  const H = W.H;
  const nieuw = () => {
    const N = new Tr.Wereld();
    N.mat = W.mat;
    N.lichten = W.lichten;
    N.H = H;
    return N;
  };
  const groepen = W.groepen.filter((g) => g.delen.length);
  const neem = (N, filter, f = (p) => p) => {
    for (const g of groepen) {
      if (!filter(g.naam)) continue;
      const G = N.groep(g.naam);
      for (const p of g.delen) {
        const q = f(p, g.naam);
        if (q) Tr.voeg(G, { ...q });
      }
    }
  };
  const muur = (naam) => BIJ_DE_MUREN.has(naam);
  // Een muur als schil, afgesneden op hoogte zc; de drempel (deel 9) blijft zoals hij is. Hoe diep een
  // punt in het huis ligt, meten we op één hoogte (FASE.schilZ): het veld zelf zou vlak boven de grond
  // ook de afstand tot de vloer meten, en dan bleef er een dichte plaat liggen in plaats van een ring.
  const schilTot = (zc) => (p, naam) => {
    if (naam === 'romp' && p.deel === 1) return { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), -p.f(x, y, FASE.schilZ) - FASE.schil, z - zc) };
    if (naam === 'romp') return p;
    return { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), z - zc) };
  };

  // Een balk of een stijl in het stelsel van een vleugel (a langs de nok, q dwars erop), buiten de
  // andere vleugels: bij een L of een T lopen de regels niet dwars door de andere vleugel heen.
  const doosIn = (V, ac, qc, zc, ha, hq, hz) => {
    const [cx, cy] = V.wereld(ac, qc);
    const anderen = H.vleugels.filter((V2) => V2 !== V);
    return {
      f: (x, y, z) => {
        const [a, q] = V.lok(x, y);
        let d = sdf.doos(a - ac, q - qc, z - zc, ha, hq, hz, 0.8);
        for (const V2 of anderen) {
          const [a2, q2] = V2.lok(x, y);
          d = Math.max(d, -sdf.doos(a2, q2, 0, V2.ha - 6, V2.hq - 6, 1e4));
        }
        return d;
      },
      grens: [cx, cy, Math.hypot(ha, hq) + 2, zc - hz - 1, zc + hz + 1],
      m: 'hout',
      deel: 990,
    };
  };
  const binnenAndere = (V, a, q) => H.vleugels.some((V2) => {
    if (V2 === V) return false;
    const [a2, q2] = V2.lok(...V.wereld(a, q));
    return Math.abs(a2) < V2.ha - 6 && Math.abs(q2) < V2.hq - 6;
  });
  const z0 = FASE.fundering;
  const zTop = H.zM;
  const geraamte = (N) => {
    const G = N.groep('geraamte');
    for (const V of H.vleugels) {
      const [ha, hq] = [V.ha - 4, V.hq - 4];
      const na = Math.max(2, Math.round((2 * ha) / FASE.stap) + 1);
      const nq = Math.max(2, Math.round((2 * hq) / FASE.stap) + 1);
      const stijlen = [];
      for (let i = 0; i < na; i++) for (const sq of [-1, 1]) stijlen.push([-ha + (2 * ha * i) / (na - 1), sq * hq]);
      for (let i = 1; i < nq - 1; i++) for (const sa of [-1, 1]) stijlen.push([sa * ha, -hq + (2 * hq * i) / (nq - 1)]);
      for (const [a, q] of stijlen) {
        if (binnenAndere(V, a, q)) continue;
        Tr.voeg(G, doosIn(V, a, q, (z0 + zTop) / 2, 4, 4, (zTop - z0) / 2));
      }
      // de regels onderaan (op de ring) en bovenaan (onder de goot), rondom
      for (const zc of [z0 + 3.5, zTop - 3.5]) {
        for (const sq of [-1, 1]) Tr.voeg(G, doosIn(V, 0, sq * hq, zc, ha + 4, 4, 3.5));
        for (const sa of [-1, 1]) Tr.voeg(G, doosIn(V, sa * ha, 0, zc, 4, hq + 4, 3.5));
      }
    }
  };
  // De steiger langs de kanten die je ziet (de +x- en de +y-kant van de voet): palen, en een loopplank
  // op werkhoogte.
  const [X0, Y0] = [m.hoek[0] * TEGEL, m.hoek[1] * TEGEL];
  const [X1, Y1] = [X0 + m.voet[0] * TEGEL, Y0 + m.voet[1] * TEGEL];
  const steiger = (N, hoogte, kanten) => {
    const G = N.groep('steiger');
    const paal = (x, y) => Tr.voeg(G, {
      f: (px, py, pz) => sdf.cilinder(px - x, py - y, pz, 3, 0, hoogte + 22),
      grens: [x, y, 4, -1, hoogte + 23],
      m: 'hout',
      deel: 991,
    });
    const plank = (cx, cy, hx, hy) => Tr.voeg(G, {
      f: (px, py, pz) => sdf.doos(px - cx, py - cy, pz - (hoogte - 26), hx, hy, 1.6, 0.5),
      grens: [cx, cy, Math.hypot(hx, hy) + 2, hoogte - 29, hoogte - 23],
      m: 'hout',
      deel: 992,
    });
    const u = FASE.steigerUit;
    if (kanten.includes('y')) {
      const n = Math.max(2, Math.round((X1 - X0) / FASE.stap) + 1);
      for (let i = 0; i < n; i++) paal(X0 + 10 + ((X1 - X0 - 20) * i) / (n - 1), Y1 + u);
      plank((X0 + X1) / 2, Y1 + u, (X1 - X0) / 2, 7);
    }
    if (kanten.includes('x')) {
      const n = Math.max(2, Math.round((Y1 - Y0) / FASE.stap) + 1);
      for (let i = 0; i < n; i++) paal(X1 + u, Y0 + 10 + ((Y1 - Y0 - 20) * i) / (n - 1));
      plank(X1 + u, (Y0 + Y1) / 2, 7, (Y1 - Y0) / 2);
    }
  };
  // Het dak in latten: de buitenste laag van het dak, alleen waar een lat ligt, van de goot tot de nok,
  // per vleugel dwars op zijn nok; en een nokbalk. `boven`: alleen boven die hoogte (fase 5).
  const dakDeel = groepen.filter((g) => HET_DAK.has(g.naam)).flatMap((g) => g.delen)[0];
  const latten = (N, boven = -Infinity) => {
    if (!dakDeel) return;
    const G = N.groep('dakgebinte');
    const fD = dakDeel.f;
    for (const V of H.vleugels) {
      Tr.voeg(G, {
        f: (x, y, z) => {
          const d = fD(x, y, z);
          const [a, q] = V.lok(x, y);
          const r = ((a % FASE.lat) + FASE.lat) % FASE.lat;
          const lat = Math.min(r, FASE.lat - r) - 3;
          const nok = V.nokZ(a) - 18 - z;
          return Math.max(d, -d - 7, Math.min(lat, nok), Math.abs(a) - V.XR, Math.abs(q) - (V.Qe0 + 10), boven - z);
        },
        grens: dakDeel.grens,
        g: dakDeel.g,
        m: 'hout',
        deel: 993,
      });
    }
  };
  const zHalf = H.voetZ + (H.zNmax - H.voetZ) * 0.5;
  const zMuur = z0 + (zTop - z0) * 0.62;
  // Zonder dak zie je de bovenkant van de muren, die schuin onder het riet loopt: die is de zolder,
  // en donker, anders lijkt het tussen de latten een wit dak.
  const zolder = (p, naam) => {
    if (naam !== 'romp' || !dakDeel) return p;
    const m = p.m;
    return { ...p, m: (x, y, z) => (z > zTop - 4 && dakDeel.f(x, y, z) < 6 ? 'donker' : typeof m === 'function' ? m(x, y, z) : m) };
  };

  const w = FASEN.map(() => nieuw());
  // 1. fundering
  neem(w[0], (n) => n === 'romp', schilTot(z0));
  // 2. geraamte
  neem(w[1], (n) => n === 'romp', schilTot(z0));
  geraamte(w[1]);
  // 3. muren tot twee derde, met steigers
  neem(w[2], muur, schilTot(zMuur));
  geraamte(w[2]);
  steiger(w[2], zMuur, 'xy');
  // 4. de muren af, het dak in latten
  neem(w[3], muur, zolder);
  latten(w[3]);
  steiger(w[3], zTop, 'xy');
  // 5. de onderste helft van het dak gedekt
  neem(w[4], muur, zolder);
  neem(w[4], (n) => HET_DAK.has(n), (p) => ({ ...p, f: (x, y, z) => Math.max(p.f(x, y, z), z - zHalf) }));
  latten(w[4], zHalf);
  steiger(w[4], zTop, 'y');
  return w;
}

// De vijf fases van een huis voor bouwfasen.cjs, in dezelfde vorm als zijn eigen renderGebouw: één
// cel voor alle vijf (strak om wat ze samen tekenen), met het anker op de achterste hoek van de voet,
// zodat het huis niet verspringt terwijl het groeit. In de eerste fase liggen er een stapel hout en
// een hoop steen voor de voet, een maat groter dan anders, net als bij de oude gebouwen.
function renderHuisFasen(naam) {
  const spec = HUIZEN[naam];
  const W = HS.huis(spec.zaad, spec);
  const H = W.H;
  const m = meetHuis(W);
  const werelden = fasenVanHuis(W, m);
  const s = 1.6;
  const x0 = m.hoek[0];
  const y1 = m.hoek[1] + m.voet[1];
  const stapel = [
    { model: F.geschaald(D.houtstapel(1000), s), gx: x0 + 0.6, gy: y1 + 0.9 },
    { model: F.geschaald(VW.puin(1005, 7), s), gx: x0 + 2.4, gy: y1 + 1.2 },
  ];
  // het kader: het afgewerkte huis, de stapels, en de steiger met zijn palen
  const extra = [];
  for (const p of stapel) for (const [dx, dy, z] of [[-1.5, -1.5, 0], [1.5, 1.5, 0], [0, 0, 90]]) extra.push([(p.gx + dx) * TEGEL, (p.gy + dy) * TEGEL, z]);
  const [X1, Y1] = [(m.hoek[0] + m.voet[0]) * TEGEL, (m.hoek[1] + m.voet[1]) * TEGEL];
  extra.push([X1 + 30, Y1 + 30, 0], [X1 + 30, m.hoek[1] * TEGEL, H.zM + 40], [m.hoek[0] * TEGEL, Y1 + 30, H.zM + 40]);
  const kd = HS.kaderVan(H, extra);
  const RAND = 12;
  const b = Math.ceil(kd.b + RAND * 2);
  const h = Math.ceil(kd.h + RAND * 2);
  const OX = Math.round(RAND - kd.x0);
  const OY = Math.round(RAND - kd.y0);
  const platen = werelden.map((N, i) => {
    const B = new K.Beeld(b, h, OX, OY);
    Tr.tekenWereld(B, N);
    if (i === 0) for (const p of stapel) D.zetModel(B, p.model, p.gx, p.gy, 'Z');
    B.lichten.push(...N.lichten);
    K.belicht(B, { omgeving: () => 0.2 });
    D.avondlicht(B, { warm: HS.WARM });
    K.verwarm(B, 1.8);
    K.omlijn(B);
    return K.Plaat.van(K.kwantiseer(B));
  });
  // strak om wat de vijf samen tekenen
  let xa = b;
  let ya = h;
  let xb = -1;
  let yb = -1;
  for (const p of platen) {
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.b; x++) {
        if (p.px[(y * p.b + x) * 2] < 0) continue;
        if (x < xa) xa = x;
        if (x > xb) xb = x;
        if (y < ya) ya = y;
        if (y > yb) yb = y;
      }
    }
  }
  const X = m.hoek[0] * TEGEL;
  const Y = m.hoek[1] * TEGEL;
  const ax = Math.round(OX + X * EX[0] + Y * EX[1]);
  const ay = Math.round(OY + X * EY[0] + Y * EY[1]);
  const cb = xb - xa + 1;
  const ch = yb - ya + 1;
  return {
    id: spec.gebouw, tekening: naam, cb, ch, ankerX: ax - xa, ankerY: ay - ya,
    beslaat: m.voet, fasenNamen: FASEN, platen: platen.map((p) => p.uitsnede(xa, ya, cb, ch)),
  };
}

// ---------------------------------------------------------------- werkers

// Een huis kost zo'n halve minuut; de huizen gaan daarom tegelijk, elk in een eigen draad, net als
// in huis-sdf-export.cjs en bouwfasen.cjs (een wachtrij waar elke draad de volgende uit pakt).
if (!isMainThread && workerData === 'huizen') {
  parentPort.on('message', ({ i, naam }) => {
    try {
      const r = renderHuis(HUIZEN[naam]);
      parentPort.postMessage({ i, naam, b: r.plaat.b, h: r.plaat.h, px: r.plaat.px, anker: r.anker, voet: r.voet, deur: r.deur, deurVer: r.deurVer, ms: r.ms });
    } catch (e) {
      parentPort.postMessage({ i, naam, fout: e.message });
    }
  });
}

const DRADEN = () => Math.max(1, Math.min(8, os.cpus().length));

// namen: welke huizen (standaard alle). Geeft per huis { naam, plaat, anker, voet, deur, ms }, in
// dezelfde volgorde; een huis dat mislukt, meldt zich en valt weg.
function renderHuizen(namen = Object.keys(HUIZEN), draden = DRADEN()) {
  return new Promise((klaar, fout) => {
    const uit = new Array(namen.length);
    let volgende = 0;
    let gedaan = 0;
    const werkers = [];
    if (!namen.length) {
      klaar([]);
      return;
    }
    const geef = (w) => {
      if (volgende >= namen.length) return;
      const i = volgende++;
      w.postMessage({ i, naam: namen[i] });
    };
    for (let n = 0; n < Math.min(draden, namen.length); n++) {
      const w = new Worker(__filename, { workerData: 'huizen' });
      w.on('error', fout);
      w.on('message', (m) => {
        if (m.fout) console.warn(`  overgeslagen: ${m.naam} (${m.fout})`);
        else {
          const plaat = new K.Plaat(m.b, m.h);
          plaat.px = m.px;
          uit[m.i] = { naam: m.naam, plaat, anker: m.anker, voet: m.voet, deur: m.deur, deurVer: m.deurVer, ms: m.ms };
          console.log(`  ${m.naam.padEnd(12)} ${m.b}×${m.h}  voet ${m.voet.join('×')}  deur ${m.deur} (${m.deurVer} tegel voor de muur)  ${(m.ms / 1000).toFixed(1)} s`);
        }
        if (++gedaan === namen.length) {
          for (const x of werkers) x.terminate();
          klaar(uit.filter(Boolean));
        } else geef(w);
      });
      werkers.push(w);
      geef(w);
    }
  });
}

module.exports = { HUIZEN, FASEN, renderHuis, renderHuizen, renderHuisFasen, meetHuis };

// node gereedschap/pixelart/huizen.cjs [naam ...]: de huizen los op een proefplaat, met hun voet
// (een ruit) en de tegel voor hun deur (een punt), om te zien of die kloppen. Naar
// gereedschap/pixelart/uit/huizen/proef.png (niet in git).
if (isMainThread && require.main === module) {
  const path = require('path');
  const namen = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(HUIZEN);
  const t0 = Date.now();
  renderHuizen(namen).then((lijst) => {
    const cb = Math.max(...lijst.map((r) => r.plaat.b)) + 20;
    const ch = Math.max(...lijst.map((r) => r.plaat.h)) + 60;
    const kolommen = Math.min(4, lijst.length);
    const vel = new K.Plaat(cb * kolommen, ch * Math.ceil(lijst.length / kolommen));
    lijst.forEach((r, i) => {
      const x0 = (i % kolommen) * cb + 10;
      const y0 = Math.floor(i / kolommen) * ch + 10;
      vel.plak(r.plaat, x0, y0);
      // de voet als ruit en de deur als punt, in de kleur van de omlijning
      const [ax, ay] = [x0 + r.anker[0], y0 + r.anker[1]];
      const punt = (tx, ty) => [ax + (tx - ty) * 32, ay + (tx + ty) * 16];
      const lijn = ([xa, ya], [xb, yb]) => {
        const n = Math.max(Math.abs(xb - xa), Math.abs(yb - ya));
        for (let s = 0; s <= n; s++) vel.zet(Math.round(xa + ((xb - xa) * s) / n), Math.round(ya + ((yb - ya) * s) / n), K.RAMP.goud, 6);
      };
      const [b, d] = r.voet;
      lijn(punt(0, 0), punt(b, 0));
      lijn(punt(b, 0), punt(b, d));
      lijn(punt(b, d), punt(0, d));
      lijn(punt(0, d), punt(0, 0));
      const [dx, dy] = punt(r.deur[0] + 0.5, r.deur[1] + 0.5);
      for (let a = -3; a <= 3; a++) for (let c = -2; c <= 2; c++) vel.zet(Math.round(dx + a), Math.round(dy + c), K.RAMP.rood, 5);
    });
    const dir = path.join(__dirname, 'uit', 'huizen');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'proef.png'), K.png(vel, 1, '#20202a'));
    console.log(`proef.png ${vel.b}×${vel.h}, ${lijst.length} huizen, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  });
}
