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
// renderHuis(opgave) geeft { plaat, anker, voet, deur, ramen }:
//   plaat  de tekening, strak gesneden, zonder gras en zonder schaduw op de grond: het spel legt
//          zijn eigen grond eronder;
//   anker  het punt in de plaat waar de achterste hoek van de voet valt (naar-tiled.cjs legt daar
//          de afspraak van tegels.json op: +16, het midden van de tegel);
//   voet   [b, d]: hoeveel tegels het huis beslaat, gemeten aan het huis zelf, net boven de grond
//          (muren, een aanbouw, een trap, de palen van een galerij), niet aan zijn dak;
//   deur   [dx, dy]: de tegel vóór de deur, vanaf de achterste tegel van de voet. Die ligt buiten de
//          voet, dus een van beide is -1, b of d. Het spel stuurt de bewoners daarheen
//          (T.deurVan, js/bewoners.js);
//   ramen  de ramen die je ziet, elk een lijst ruitjes (vierhoeken in pixels vanaf het anker van het
//          spel; ramenVan hieronder). 's Avonds branden die van de herberg (js/tekenen.js).
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
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
  // ── stenen huizen: trede 3, het stenen broertje van elk huis (werklijst vraag 85, d; Marcel, 1 okt: "d ja"): dezelfde
  // vorm, maat, nok, uitbouwen en hetzelfde zaad, maar veldsteen met een stenen schoorsteen, onder riet. Zo versteent een
  // huis op zijn eigen grond als zijn mensen ambachtslieden worden (js/behoeften.js, T.GEBOUWEN.stenenHuis.broertjes), en
  // herken je het. Riet, want steen onder pannen hoort bij een stad (spel.md, "Beter bouwen"); leien en pannen staan op de
  // proefplaat van 1 okt. Een anderhalve laag is steen onder en vakwerk erboven. Met bouwfases, voor wie het met de
  // spelregel "Huizen" zelf bouwt ──
  steen1: { gebouw: 'stenenHuis', trede: 3, zaad: 21, vorm: 'rechthoek', b: 7, d: 5, lagen: 1, nok: 'x', dak: 'riet', wand: 'veldsteen', boven: 'vakwerk', plint: 36, schoor: false, uit: { luiken: true, bakken: 1 } },
  steen2: { gebouw: 'stenenHuis', trede: 3, zaad: 22, vorm: 'rechthoek', b: 7, d: 5, lagen: 1.5, nok: 'y', dak: 'riet', wand: 'veldsteen', boven: 'vakwerk', plint: 36, schoor: false, uit: { kapellen: 1 } },
  steen3: { gebouw: 'stenenHuis', trede: 3, zaad: 23, vorm: 'rechthoek', b: 8, d: 5, lagen: 1, nok: 'x', dak: 'riet', wand: 'veldsteen', boven: 'vakwerk', plint: 36, schoor: true, uit: { aanbouw: true, luiken: true } },
  steen4: { gebouw: 'stenenHuis', trede: 3, zaad: 24, vorm: 'L', b: 8, d: 5, b2: 4, d2: 8, kant: -1, voor: false, lagen: 1, nok: 'x', dak: 'riet', wand: 'veldsteen', boven: 'vakwerk', plint: 36, schoor: false, uit: false },
  steen5: { gebouw: 'stenenHuis', trede: 3, zaad: 25, vorm: 'rechthoek', b: 6, d: 5, lagen: 1.5, nok: 'x', dak: 'riet', wand: 'veldsteen', boven: 'vakwerk', plint: 36, schoor: false, uit: { gevelschoorsteen: true, kapellen: 1 } },
  steen6: { gebouw: 'stenenHuis', trede: 3, zaad: 26, vorm: 'T', b: 9, d: 5, b2: 4, p2: 3, voor: true, lagen: 1, nok: 'y', dak: 'riet', wand: 'veldsteen', boven: 'vakwerk', plint: 36, schoor: false, uit: { bakken: 2 } },
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
  // ── de herberg van het gehucht (27 sep, werklijst punt 2): trede 2, vakwerk onder riet zoals de
  // huizen, maar groter en hoger, met een zolder en dakkapellen. Een T, zodat hij groter is dan een
  // boerderij (vraag 39; Marcel: "Prima"), met een topgevel naar voren en de dwarsvleugel naar achteren
  // (voor: false): met de vleugel naar voren kwam de deur in de binnenhoek, en lag de tegel ervoor drie
  // tegels van de muur. Nu zit de deur midden op de lange kant, naar het plein, met de ramen erlangs. De
  // oude tekening (tegels/gebouwen.png) is van steen onder pannen: trede 4 à 5, te rijk voor een
  // gehucht. Hij staat op de kaart (gereedschap/tiled/maak-gehucht.cjs), niemand bouwt hem, dus geen
  // bouwfases ──
  herberg1: { gebouw: 'herberg', trede: 2, fasen: false, zaad: 53, vorm: 'T', b: 11, d: 5, b2: 4, p2: 3, voor: false, lagen: 1.5, nok: 'y', dak: 'riet', wand: 'vakwerk', plint: 40, schoorsteen: 'leem', schoor: false, uit: { kapellen: 3, luiken: true, bakken: 2 } },
};

// ---------------------------------------------------------------- de bouwstijlen

// Elk land bouwt in één stijl (werklijst vraag 114, stap 2; Marcel, 4 okt: de vier stijlen, "ja drie per soort, hutten
// houden riet", en voor de eerste "A ja B ja C ik wil overal bouwfase voor"): de kalk op het vakwerk, de kleur van de
// luiken, de natuursteen en het dak van het gehucht, met per soort drie eigen vormen uit de huizen hierboven (twee
// boerderijen); het stenen huis is het stenen broertje van een huis van de stijl. Elke vorm komt in de vier standen
// hieronder, onder het dak van elke trede: dat van het gehucht (riet, of spanen), leien in een dorp, pannen met
// marktrecht; een stenen huis in de natuursteen van zijn stijl onder leien of pannen, en in baksteen onder pannen (pas
// met een steenbakkerij). Een hut houdt het dak van het gehucht, en heeft geen luiken. Alles met bouwfasen. De maker
// geeft elk land een stijl (js/maker.js), en het spel zoekt een tekening op met T.stijlTekening (js/gebouwen.js), uit
// `stijl` bij elke tekening in tegels.js (naar-tiled.cjs).
const STIJLEN = {
  // (1) wit vakwerk, groene luiken, veldsteen (Marcel, 4 okt, "A ja": hut 1, 3 en 4, huis 1, 3 en 6, boerderij 1 en 4)
  wit: { kalk: 'wit', luiken: 'den', steen: 'veldsteen', dak: 'riet', hut: ['hut1', 'hut3', 'hut4'], huis: ['huis1', 'huis3', 'huis6'], boerderij: ['boerderij1', 'boerderij4'] },
  // Stap 2b (Marcel, 4 okt: "A ja B ja C delen"): elke stijl een eigen drietal huizen, met een uitbouw als kenmerk, en
  // de hutten van wit. Een hut van vlechtwerk onder riet ziet er in elke stijl hetzelfde uit (de kalk komt niet op leem),
  // dus oker en roze tekenen hem niet opnieuw: `hut: 'wit'` zegt dat ze de hutten van wit nemen (js/bouwstijl.js).
  // (2) oker, "de zolders": oker kalk, rode luiken, zandsteen; anderhalve laag, de L naar achter, smal en hoog
  oker: { kalk: 'oker', luiken: 'rood', steen: 'zandsteen', dak: 'riet', hut: 'wit', huis: ['huis2', 'huis4', 'huis5'], boerderij: ['boerderij6', 'boerderij7'] },
  // (3) planken, "het houtland": planken onder spanen, blauwgrijze luiken, veldsteen, en alles van hout ("B ja"): de
  // huizen en de hutten van planken, boven het stenen broertje planken; een galerij, een buitentrap, een aanbouw
  planken: { kalk: 'wit', luiken: 'pet', steen: 'veldsteen', dak: 'spanen', wand: 'planken', boven: 'planken', hut: ['hut1', 'hut3', 'hut4'], huis: ['huis7', 'huis8', 'huis9'], boerderij: ['boerderij2', 'boerderij5'] },
  // (4) roze, "het rijke vakwerk": roze kalk, kale luiken, zandsteen; twee lagen die overkragen, een erker, een T
  roze: { kalk: 'roze', luiken: 'hout', steen: 'zandsteen', dak: 'riet', hut: 'wit', huis: ['huis10', 'huis11', 'huis12'], boerderij: ['boerderij8', 'boerderij9'] },
};
// De toren van de kapel en de woontoren per stijl (Marcel, 4 okt: "1. Afwisselen ... 2. Zelfde als 1"), zoals in het plan
// (werklijst vraag 114, "Plan voor de huizen in het spel", 2): wit een zadeldaktoren en kantelen, oker een naaldspits en een tentdak, planken een naaldspits en kantelen, roze een
// zadeldaktoren en een tentdak.
const TORENS = {
  wit: { kapel: 'zadel', woontoren: 'kantelen' },
  oker: { kapel: 'spits', woontoren: 'tent' },
  planken: { kapel: 'spits', woontoren: 'kantelen' },
  roze: { kapel: 'zadel', woontoren: 'tent' },
};

// De grote gebouwen van een stijl (werklijst vraag 114, stap 3; Marcel, 7 okt: "A; ja goed idee, B: Ja, C: Ja graag"):
// de kleine herberg (het gehucht), de grote met een stal aan een binnenplaats met een muur en een poort (een dorp: hij
// groeit door), de kapel met de toren van de stijl, de woontoren (vanaf marktrecht, drie gezinnen) en het huis van de
// schout. Elk rondom, met de deur naar zuid; draai geeft een andere stand. Een gebouw uit delen is { delen: [{ spec,
// plek }], deurVan }, anders { spec }. dak: het dak van de trede (zonder: dat van het gehucht, of leien in een dorp);
// steen: de natuursteen van de stijl, of 'baksteen' (met een steenbakkerij).
function grootGebouw(stijl, soort, o = {}) {
  const S = STIJLEN[stijl];
  if (!S) throw new Error(`geen stijl "${stijl}"`);
  const steen = o.steen || S.steen;
  const draai = o.draai || 0;
  const rond = { rondom: true, nok: 'x', deur: 'voor', deurOp: 'hoofd', draai, kalk: S.kalk };
  const wand = S.wand ? { wand: S.wand } : {};
  if (soort === 'herbergKlein') {
    const h = HUIZEN.herberg1;
    return { spec: { ...h, ...rond, ...wand, dak: o.dak || S.dak, uit: { ...h.uit, luiken: S.luiken } } };
  }
  if (soort === 'herberg') {
    // twee lagen van 12 bij 6 met een uithangbord; rechts ervan de binnenplaats, achterin de stal, en langs de andere
    // twee kanten een muur met de poort aan de straat (de kant van de deur)
    const dak = o.dak || 'leien';
    const herberg = { zaad: 53, vorm: 'rechthoek', b: 12, d: 6, lagen: 2, wand: 'vakwerk', ...wand, schoorsteen: 'leem', schoor: false, bord: true, ...rond, dak, uit: { kapellen: 3, luiken: S.luiken, bakken: 2 } };
    const stal = { zaad: 57, vorm: 'rechthoek', b: 6, d: 3, lagen: 1, wand: 'planken', hout: 'schors', schoorsteen: false, schoor: false, uit: false, ...rond, dak: dak === 'leien' && stijl !== 'planken' ? S.dak : dak, kalk: S.kalk };
    // o.stal (Marcel, 7 okt: "Stal misschien los naast de herberg? of aan de achterkant, nu wordt het wat massief", en
    // daarna: "Ik denk dat we de stal bij de herberg maar gaan laten"): standaard geen stal, de herberg alleen; 'naast'
    // (los ernaast, met een pad ertussen), 'achter' (achter de herberg, met de binnenplaats ertussen en een muur met de
    // poort aan de zijkant), of 'tegen' (de eerste proefplaat: tegen de herberg aan, met een binnenplaats ervoor) staan
    // nog op de proefplaten
    const waar = o.stal || 'geen';
    if (waar === 'geen') return { spec: herberg };
    if (waar === 'naast') return { delen: [{ spec: herberg }, { spec: { ...stal, d: 4 }, plek: [10.5, -0.5] }], deurVan: 0 };
    if (waar === 'achter') {
      const muur = { zaad: 58, erfmuur: true, steen, stukken: [[[6.3, -3.4], [6.3, -9]], [[-6.3, -3.4], [-6.3, -9]], [[-6.3, -9], [-1.3, -9]]], poort: { stuk: 0, bij: 0.5, breed: 1.8, binnen: [-1, 0] }, draai };
      return { delen: [{ spec: herberg }, { spec: { ...stal, d: 4 }, plek: [2, -7] }, { spec: muur, plek: [0, 0] }], deurVan: 0 };
    }
    const muur = { zaad: 58, erfmuur: true, steen, stukken: [[[12.3, 0], [12.3, 3.3]], [[6.2, 3.3], [12.3, 3.3]]], poort: { stuk: 1, bij: 0.5, breed: 1.8, binnen: [0, -1] }, draai };
    return { delen: [{ spec: herberg }, { spec: stal, plek: [9.15, -1.5] }, { spec: muur, plek: [0, 0] }], deurVan: 0 };
  }
  if (soort === 'kapel') {
    // groter dan de herberg (Marcel, 7 okt: "Is de kerk / kapel niet te klein in vergelijk met de rest?"): het schip 12 bij
    // 6, twee lagen hoog, en een toren van vier lagen, het hoogste punt van het dorp. In de stijl van de huizen (Marcel, 8
    // okt: "de woontoren en kerk vallen kwa stijl buiten de boot", en op het voorstel "Ja goed"): het schip met kalk over
    // de steen, in de kalk van de stijl, met een plint en hoekstenen van de steen van de huizen, en de toren net zo; in
    // planken een schip van planken. o.oud: de kapel van 7 okt, van steen met een toren van zes lagen.
    const groot = o.groot !== false;
    const oud = !!o.oud;
    const muur = oud ? 'veldsteen' : stijl === 'planken' ? 'planken' : 'kalk';
    const schip = { zaad: 61, vorm: 'rechthoek', b: groot ? 12 : 9, d: groot ? 6 : 5, lagen: groot ? 2 : 1.5, boven: muur, wand: muur, steen, schoorsteen: false, schoor: false, uit: false, ramen: 'kerk', ...rond, dak: o.dak || (oud ? 'leien' : stijl === 'planken' ? 'spanen' : 'leien') };
    const zadel = TORENS[stijl].kapel === 'zadel';
    const tb = groot ? (zadel ? 5 : 4) : zadel ? 4 : 3;
    const toren = { zaad: 62, dak: 'plat', steen, lagen: oud ? (groot ? 6 : 4) : groot ? 4 : 3, b: tb, d: tb, torendak: TORENS[stijl].kapel, ramen: 'kerk', rondom: true, draai, ...(oud ? {} : { gepleisterd: true, kalk: S.kalk, dekking: stijl === 'planken' ? 'spanen' : 'leien' }) };
    return { delen: [{ spec: schip }, { spec: toren, plek: [(groot ? 6 : 4.5) + tb / 2 + (groot ? 0.3 : -0.2), 0] }], deurVan: 1 };
  }
  if (soort === 'woontoren') {
    // een hoog huis (Marcel, 8 okt, op het voorstel: "Ja goed"): op 5 bij 5 een stenen benedenverdieping zoals het stenen
    // huis, een bovenverdieping die overkraagt in het hout van de stijl, en een steil zadeldak met dakkapellen, onder
    // het dak van de trede; geen kantelen of tentdak meer. o.oud: de toren van 7 okt.
    if (!o.oud) {
      return { spec: { zaad: 54, vorm: 'rechthoek', b: 5, d: 5, lagen: 2, ...rond, wand: 'veldsteen', boven: S.boven || 'vakwerk', steen, dak: o.dak || 'pannen', plint: 36, schoorsteen: 'steen', schoor: false, uit: { kapellen: 2, luiken: S.luiken, bakken: 1 } } };
    }
    const tent = TORENS[stijl].woontoren === 'tent';
    return { spec: { zaad: tent ? 52 : 54, dak: 'plat', steen, lagen: 4, b: 5, d: 5, ramen: 'woon', rondom: true, draai, ...(tent ? { torendak: 'tent', dekking: 'pannen' } : { kantelen: true }) } };
  }
  if (soort === 'schout') {
    const h = HUIZEN.schoutshuis;
    return { spec: { ...h, ...rond, dak: o.dak || S.dak, steen, boven: S.boven || 'vakwerk', uit: { ...h.uit, luiken: S.luiken } } };
  }
  throw new Error(`geen groot gebouw "${soort}"`);
}

// De vormen die alleen een stijl heeft (stap 2b): zoals de huizen hierboven, maar nooit een losse tekening op het vel. Van
// een huis maakt stijlHuizen zelf zijn stenen broertje (steenVan). `luiken: 'hout'` hierboven: kaal hout, de kleur van het
// hout van het huis.
const VORMEN = {
  // oker: een T met de vleugel naar voren, en boerderij 3 (anderhalve laag, twee kapellen) in vakwerk in plaats van vlechtwerk
  boerderij6: { gebouw: 'boerderij', trede: 2, zaad: 36, vorm: 'T', b: 10, d: 5, b2: 4, p2: 3, voor: true, lagen: 1, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 40, schoorsteen: 'leem', schoor: false, uit: { bakken: 1 } },
  boerderij7: { ...HUIZEN.boerderij3, zaad: 37, wand: 'vakwerk' },
  // planken: een lang huis van twee lagen met een galerij langs de bovenverdieping, een L met een buitentrap naar een
  // opkamer, en een huis met een aanbouw en een schoor
  huis7: { gebouw: 'huis', trede: 2, zaad: 27, vorm: 'rechthoek', b: 9, d: 5, lagen: 2, nok: 'x', dak: 'riet', wand: 'planken', plint: 36, schoorsteen: 'leem', schoor: false, uit: { balkon: true } },
  huis8: { gebouw: 'huis', trede: 2, zaad: 28, vorm: 'L', b: 8, d: 6, b2: 4, d2: 7, kant: 1, voor: false, lagen: 1.5, nok: 'x', dak: 'riet', wand: 'planken', plint: 36, schoorsteen: 'leem', schoor: false, uit: { trap: true } },
  huis9: { gebouw: 'huis', trede: 2, zaad: 29, vorm: 'rechthoek', b: 8, d: 5, lagen: 1, nok: 'x', dak: 'riet', wand: 'planken', plint: 36, schoorsteen: 'leem', schoor: true, uit: { aanbouw: true } },
  // roze: twee lagen met een overkragende verdieping, een erker, en een T met de vleugel naar achter, anderhalve laag
  huis10: { gebouw: 'huis', trede: 2, zaad: 30, vorm: 'rechthoek', b: 7, d: 5, lagen: 2, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 36, schoorsteen: 'leem', schoor: false, uit: { bakken: 2 } },
  huis11: { gebouw: 'huis', trede: 2, zaad: 31, vorm: 'rechthoek', b: 8, d: 6, lagen: 1, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 36, schoorsteen: 'leem', schoor: false, uit: { erker: true, bakken: 1 } },
  huis12: { gebouw: 'huis', trede: 2, zaad: 32, vorm: 'T', b: 9, d: 5, b2: 4, p2: 3, voor: false, lagen: 1.5, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 36, schoorsteen: 'leem', schoor: false, uit: { kapellen: 1 } },
  // roze: een L met de vleugel aan de andere kant dan boerderij 1, en een lange van anderhalve laag
  boerderij8: { gebouw: 'boerderij', trede: 2, zaad: 38, vorm: 'L', b: 9, d: 5, b2: 3, d2: 7, kant: -1, voor: false, lagen: 1, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 40, schoorsteen: 'leem', schoor: false, uit: { bakken: 1 } },
  boerderij9: { gebouw: 'boerderij', trede: 2, zaad: 39, vorm: 'rechthoek', b: 10, d: 6, lagen: 1.5, nok: 'x', dak: 'riet', wand: 'vakwerk', plint: 40, schoorsteen: 'leem', schoor: false, uit: { kapellen: 2 } },
};
// Het stenen broertje van een huis: zoals steen1 tot en met 6 hierboven (veldsteen, een stenen schoorsteen), met wat de
// stijl boven de steen zet.
const steenVan = (vorm) => {
  const { schoorsteen, ...h } = HUIZEN[vorm] || VORMEN[vorm];
  return { ...h, gebouw: 'stenenHuis', trede: 3, wand: 'veldsteen', boven: 'vakwerk' };
};
const vormVan = (vorm) => HUIZEN[vorm] || VORMEN[vorm];
// De hutten van een stijl, en uit welke stijl ze komen (oker en roze nemen die van wit).
const huttenVan = (stijl) => (typeof STIJLEN[stijl].hut === 'string' ? { stijl: STIJLEN[stijl].hut, hut: STIJLEN[STIJLEN[stijl].hut].hut } : { stijl, hut: STIJLEN[stijl].hut });
// De vier standen: de deur naar zuid (+y), oost (+x), noord (-y) of west (-x), op de lange muur van de hoofdvleugel
// (deurOp in huis-sdf.cjs), of in de gevel van een vleugel die naar voren steekt. Een huis van een stijl is één huis
// rondom (huis-sdf.cjs, rondom), gebouwd met zijn deur naar zuid, en een stand is hoeveel kwartslagen het gedraaid staat
// (tekenWereld met o.draai in toren.cjs; werklijst vraag 124, B; Marcel: "124b Ja dan"): oost, noord en west zijn
// hetzelfde huis van een andere kant, en elke muur zie je in twee standen, één keer in de zon en één keer in de schaduw.
// Tot 4 okt was oost het spiegelbeeld van zuid (nok 'y'), en stonden noord en west met hun deur achter.
const STANDEN = { z: { draai: 0 }, o: { draai: 1 }, n: { draai: 2 }, w: { draai: 3 } };
// De naam van een tekening van een stijl, "<stijl>-<vorm>-<dak>-<stand>"; een stenen huis van baksteen heeft
// "baksteen" waar het dak staat (het ligt altijd onder pannen). Dezelfde afspraak als T.stijlNaam in js/gebouwen.js.
const stijlNaam = (stijl, vorm, dak, stand) => `${stijl}-${vorm}-${dak}-${stand}`;

// De opgaven van alle stijlen, elk met `stijl`: { stijl, vorm, soort, dak, steen, stand } (naar-tiled.cjs zet het bij
// de tekening in tegels.js). Een vorm houdt het zaad en de uitbouwen van zijn huis hierboven.
function stijlHuizen() {
  const uit = {};
  for (const [stijl, S] of Object.entries(STIJLEN)) {
    const zet = (soort, vorm, basis, daken, extra = {}, ook = []) => {
      for (const [dak, steen] of daken) {
        for (const [stand, st] of Object.entries(STANDEN)) {
          const naam = stijlNaam(stijl, vorm, steen === 'baksteen' ? 'baksteen' : dak, stand);
          uit[naam] = {
            ...basis, ...extra, gebouw: soort, nok: 'x', deur: 'voor', rondom: true, draai: st.draai, deurOp: 'hoofd', dak, kalk: S.kalk,
            ...(steen ? { steen } : {}),
            stijl: { stijl, vorm, soort, dak, steen: steen || null, stand, ...(ook.length ? { ook } : {}) },
          };
        }
      }
    };
    const metLuiken = (basis) => ({ ...(basis.uit || {}), luiken: S.luiken });
    const daken = [[S.dak], ['leien'], ['pannen']];
    // de wand van de stijl (planken), op de hutten en de huizen; een boerderij houdt de zijne
    const wand = S.wand ? { wand: S.wand } : {};
    // de stijlen die deze hutten ook nemen (js/bouwstijl.js zet ze er ook onder)
    const ook = Object.keys(STIJLEN).filter((s) => STIJLEN[s].hut === stijl);
    if (!(typeof S.hut === 'string')) for (const vorm of S.hut) zet('hut', vorm, HUIZEN[vorm], [[S.dak]], wand, ook);
    for (const vorm of S.huis) {
      zet('huis', vorm, vormVan(vorm), daken, { ...wand, uit: metLuiken(vormVan(vorm)) });
      const broertje = vorm.replace('huis', 'steen');
      const basis = HUIZEN[broertje] || steenVan(vorm);
      zet('stenenHuis', broertje, basis, [['leien', S.steen], ['pannen', S.steen], ['pannen', 'baksteen']], { ...(S.boven ? { boven: S.boven } : {}), uit: metLuiken(vormVan(vorm)) });
    }
    for (const vorm of S.boerderij) zet('boerderij', vorm, vormVan(vorm), daken, { uit: metLuiken(vormVan(vorm)) });
    // de grote gebouwen (vraag 114, stap 3; grootGebouw hieronder): de kleine herberg van het gehucht, de grote waar
    // hij in een dorp toe doorgroeit (leien, pannen), de kapel en de woontoren in de steen van de stijl of in baksteen
    // (met een steenbakkerij), en het huis van de schout. Alle met bouwfasen (de kapel per deel, fasenVanDelen), behalve
    // het huis van de schout: dat bouwt niemand.
    const groot = (soort, vorm, welk, daken, fasen) => {
      for (const [dak, steen] of daken) {
        for (const [stand, st] of Object.entries(STANDEN)) {
          const naam = stijlNaam(stijl, vorm, steen === 'baksteen' ? 'baksteen' : dak, stand);
          const g = grootGebouw(stijl, welk, { dak, steen, draai: st.draai });
          uit[naam] = {
            ...(g.spec || { delen: g.delen, deurVan: g.deurVan }), gebouw: soort, draai: st.draai, ...(fasen ? {} : { fasen: false }),
            stijl: { stijl, vorm, soort, dak, steen: steen || null, stand },
          };
        }
      }
    };
    groot('herberg', 'herberg1', 'herbergKlein', [[S.dak]], true);
    groot('herberg', 'herberg2', 'herberg', [['leien'], ['pannen']], true);
    // de kapel van planken onder spanen (Marcel, 8 okt, op de proefplaat: "Veel beter zo")
    const kapelDak = stijl === 'planken' ? 'spanen' : 'leien';
    groot('kapel', 'kapel', 'kapel', [[kapelDak, S.steen], [kapelDak, 'baksteen']], true);
    groot('woontoren', 'woontoren', 'woontoren', [['pannen', S.steen], ['pannen', 'baksteen']], true);
    groot('schout', 'schoutshuis', 'schout', [[S.dak, S.steen]], false);
  }
  return uit;
}
Object.assign(HUIZEN, stijlHuizen());

// De wereld van een opgave: een huis of een toren van de bouwer, of een gebouw uit delen ({ delen: [{ spec, plek }],
// deurVan }: de kapel met haar toren, HS.samen; vraag 114, stap 3).
function wereldVan(spec) {
  if (!spec.delen) return HS.huis(spec.zaad, spec);
  const W = HS.samen(spec.delen.map((d) => ({ W: d.spec.erfmuur ? HS.erfmuur(d.spec.zaad, d.spec) : HS.huis(d.spec.zaad, d.spec), plek: d.plek })));
  W.deurVan = spec.deurVan || 0;
  return W;
}

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
//
// draai: het huis zoveel kwartslagen gedraaid (Tr.draaiNaar; een stand van een stijl, vraag 124, B): dan is alles
// gemeten zoals het in het beeld ligt, de voet, de hoek en de deur.
const Z_VOET = [10];
// o.zonderDeur: alleen de voet en de hoek (een deel zonder deur, zoals het schip van een kapel: fasenVanDelen).
function meetHuis(W, draai = 0, o = {}) {
  const H = W.H;
  // een punt van het huis zoals het in het beeld ligt, en terug
  const naar = (p) => (draai ? Tr.draaiNaar(draai, p) : p);
  const terug = (x, y) => (draai ? Tr.draaiTerug(draai, [x, y]) : [x, y]);
  // de achterste hoek van het plan, op een halve tegel afgerond (de vleugels staan scheef, en een
  // tweede vleugel een graad of twee uit het haakse: dat mag de hoek niet verschuiven)
  // een gebouw uit delen (HS.samen: de kapel met haar toren; vraag 114, stap 3) meet al zijn delen, elk op zijn plek
  const delen = W.delen ? W.delen.map((d) => ({ H: d.H, dx: d.plek[0], dy: d.plek[1] })) : [{ H, dx: 0, dy: 0 }];
  const vleugels = delen.flatMap((d) => d.H.vleugels.map((V) => ({ V, dx: d.dx, dy: d.dy })));
  let px = Infinity;
  let py = Infinity;
  for (const { V, dx: ox, dy: oy } of vleugels) {
    for (const sa of [-1, 1]) {
      for (const sq of [-1, 1]) {
        const [wx, wy] = V.wereld(sa * V.ha, sq * V.hq);
        const [x, y] = naar([wx + ox, wy + oy]);
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
        const [x, y] = terug((gx + i + 0.2 + a * 0.15) * TEGEL, (gy + j + 0.2 + b * 0.15) * TEGEL);
        for (const z of Z_VOET) if (Tr.veld(groepen, n, x, y, z) < 0) return true;
      }
    }
    return false;
  };
  const RUIM = 4;
  const maat = Math.ceil(Math.max(...vleugels.map(({ V, dx: ox, dy: oy }) => Math.hypot(V.cx + ox, V.cy + oy) + Math.hypot(V.ha, V.hq))) / TEGEL) * 2 + RUIM * 2;
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
  // Een huis rondom (vraag 124, B) telt de voet van zijn schoor altijd mee: de punten hierboven missen de dunne stok
  // soms, en gedraaid staat hij in een van de standen vooraan, waar hij anders over de rand van de voet steekt (de oude
  // huizen houden hun voet: daar staat hij achteraan, en het ontworpen gehucht ligt erop).
  if (H.rondom && H.schoor) {
    const [x, y] = naar(HS.schoorPunten(H).voet);
    const i = Math.floor(x / TEGEL - gx);
    const j = Math.floor(y / TEGEL - gy);
    i0 = Math.min(i0, i);
    j0 = Math.min(j0, j);
    i1 = Math.max(i1, i);
    j1 = Math.max(j1, j);
  }
  if (!Number.isFinite(i0)) throw new Error('geen voet gevonden');
  const voet = [i1 - i0 + 1, j1 - j0 + 1];
  // de hoek van de voet: de achterste hoek van de eerste bezette tegel
  const hoek = [gx + i0, gy + j0];
  if (o.zonderDeur) return { voet, hoek };
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
  // bij een gebouw uit delen de deur van het deel W.deurVan (de toren van een kapel), op zijn plek
  const DD = delen[W.deurVan || 0];
  const opPlek = ([x, y]) => [x + DD.dx / TEGEL, y + DD.dy / TEGEL];
  const deuren = [(a) => naar(opPlek(HS.voorDeDeur(DD.H, a)))];
  for (const d of DD.H.deuren) {
    if (d === DD.H.deur || d.h0 > 20) continue;
    deuren.push((a) => naar(opPlek(d.P.pos(d.u, 0, a * TEGEL).slice(0, 2).map((v) => v / TEGEL))));
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
// spec.draai: zoveel kwartslagen gedraaid (een stand van een stijl, STANDEN).
function renderHuis(spec) {
  const t0 = Date.now();
  const draai = spec.draai || 0;
  const W = wereldVan(spec);
  const H = W.H;
  const m = meetHuis(W, draai);
  const kd = W.delen ? HS.kaderSamen(W, draai) : HS.kaderVan(H, [], draai);
  const RAND = 12;
  const b = Math.ceil(kd.b + RAND * 2);
  const h = Math.ceil(kd.h + RAND * 2);
  const OX = Math.round(RAND - kd.x0);
  const OY = Math.round(RAND - kd.y0);
  const B = new K.Beeld(b, h, OX, OY);
  Tr.tekenWereld(B, W, { draai });
  B.lichten.push(...Tr.lichtenNaar(draai, W.lichten));
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
  const anker = [Math.round(ax) - xa, Math.round(ay) - ya];
  return {
    plaat: plaat.uitsnede(xa, ya, x1 - xa + 1, y1 - ya + 1),
    anker,
    voet: m.voet,
    deur: m.deur,
    deurVer: m.deurVer,
    ramen: ramenVan(B, W, xa, ya, anker),
    ms: Date.now() - t0,
  };
}

// De ramen die je ziet (27 sep, werklijst vraag 39: 's avonds branden de ramen van de herberg, en je
// ziet de gasten erachter als schimmen): welke pixels van het beeld glas zijn (de groep 'glas' van de
// huizenbouwer, en alleen wat vooraan ligt), in ruitjes die aan elkaar liggen. Een kruis in het kozijn
// deelt een raam in ruitjes; welk raam het is, zegt het deel van het glas (huis-sdf.cjs geeft elk raam
// zijn eigen glas, deel 600 plus zijn nummer). Een ruitje is zijn omtrek, [x, y, x, y, ...] (omtrekVan),
// in pixels vanaf het anker van het spel: de achterste voethoek plus 16 (naar-tiled.cjs, "anker"). Het
// spel tekent ermee (js/tekenen.js). Een spikkel van een paar pixels telt niet.
const RAAM_KLEINST = 4; // pixels

// De omtrek van een ruitje: het bolle omhulsel van zijn pixels (van hun hoeken), zonder punten op een
// rechte lijn. Een ruitje is een parallellogram in een schuine muur, en vaak snijdt het kozijn er een
// hoek af; een vierhoek tussen zijn linker- en rechterkolom liet dan een driehoekje glas donker.
function omtrekVan(px) {
  const gezien = new Set();
  const punten = [];
  for (const [x, y] of px) {
    for (const [hx, hy] of [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]) {
      const k = hx * 4096 + hy;
      if (!gezien.has(k)) gezien.add(k), punten.push([hx, hy]);
    }
  }
  punten.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const draai = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const helft = (lijst) => {
    const uit = [];
    for (const q of lijst) {
      while (uit.length >= 2 && draai(uit[uit.length - 2], uit[uit.length - 1], q) <= 0) uit.pop();
      uit.push(q);
    }
    return uit.slice(0, -1);
  };
  return helft(punten).concat(helft(punten.slice().reverse()));
}
function ramenVan(B, W, xa, ya, anker) {
  const glas = new Set(W.groepen.filter((g) => g.naam === 'glas' && g.obj != null).map((g) => g.obj));
  if (!glas.size) return [];
  const isGlas = (x, y) => x >= 0 && y >= 0 && x < B.b && y < B.h && glas.has(B.obj[y * B.b + x]);
  const gezien = new Uint8Array(B.b * B.h);
  // Pixels vanaf het anker van het spel (de achterste voethoek plus 16), met de rand van de pixel.
  const ox = xa + anker[0];
  const oy = ya + anker[1] + 16;
  const ramen = new Map(); // per raam (het deel van zijn glas): zijn ruitjes
  for (let y = 0; y < B.h; y++) {
    for (let x = 0; x < B.b; x++) {
      if (gezien[y * B.b + x] || !isGlas(x, y)) continue;
      // één ruitje: alles van hetzelfde raam wat er (recht, niet schuin) aan vastzit
      const deel = B.deel[y * B.b + x];
      const px = [];
      const rij = [[x, y]];
      gezien[y * B.b + x] = 1;
      while (rij.length) {
        const [cx, cy] = rij.pop();
        px.push([cx, cy]);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (isGlas(nx, ny) && !gezien[ny * B.b + nx] && B.deel[ny * B.b + nx] === deel) {
            gezien[ny * B.b + nx] = 1;
            rij.push([nx, ny]);
          }
        }
      }
      if (px.length < RAAM_KLEINST) continue;
      if (!ramen.has(deel)) ramen.set(deel, []);
      ramen.get(deel).push(omtrekVan(px).flatMap(([hx, hy]) => [hx - ox, hy - oy]));
    }
  }
  return [...ramen.values()];
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
  // op werkhoogte. Een huis rondom (een stijl, vraag 124, B) krijgt hem ook aan de -x- en de -y-kant ('X' en
  // 'Y'), zodat de bouwplaats van elke kant dezelfde is (Marcel, 4 okt: "B ja"). m is de voet van het huis
  // zelf, niet gedraaid.
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
    if (kanten.includes('Y')) {
      const n = Math.max(2, Math.round((X1 - X0) / FASE.stap) + 1);
      for (let i = 0; i < n; i++) paal(X0 + 10 + ((X1 - X0 - 20) * i) / (n - 1), Y0 - u);
      plank((X0 + X1) / 2, Y0 - u, (X1 - X0) / 2, 7);
    }
    if (kanten.includes('X')) {
      const n = Math.max(2, Math.round((Y1 - Y0) / FASE.stap) + 1);
      for (let i = 0; i < n; i++) paal(X0 - u, Y0 + 10 + ((Y1 - Y0 - 20) * i) / (n - 1));
      plank(X0 - u, (Y0 + Y1) / 2, 7, (Y1 - Y0) / 2);
    }
  };
  // Het dak in latten: de buitenste laag van het dak, alleen waar een lat ligt, van de goot tot de nok,
  // per vleugel dwars op zijn nok; en een nokbalk. `boven`: alleen boven die hoogte (fase 5).
  const dakDeel = groepen.filter((g) => HET_DAK.has(g.naam)).flatMap((g) => g.delen)[0];
  const latten = (N, boven = -Infinity) => {
    if (!dakDeel || H.plat) return; // een toren heeft geen latten: zijn dak komt in één keer (de kapel, vraag 114, stap 3)
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
  const zHalf = H.plat ? H.zDak + ((H.zTop ?? H.zDak) - H.zDak) * 0.5 : H.voetZ + (H.zNmax - H.voetZ) * 0.5;
  const zMuur = z0 + (zTop - z0) * 0.62;
  // Zonder dak zie je de bovenkant van de muren, die schuin onder het riet loopt: die is de zolder,
  // en donker, anders lijkt het tussen de latten een wit dak.
  const zolder = (p, naam) => {
    if (naam !== 'romp' || !dakDeel || H.plat) return p; // een toren: zijn topgevels zijn van steen, geen zolder
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
  steiger(w[2], zMuur, H.rondom ? 'xyXY' : 'xy');
  // 4. de muren af, het dak in latten
  neem(w[3], muur, zolder);
  latten(w[3]);
  steiger(w[3], zTop, H.rondom ? 'xyXY' : 'xy');
  // 5. de onderste helft van het dak gedekt (rondom: de steiger nog langs de voor- en de achterkant)
  neem(w[4], muur, zolder);
  neem(w[4], (n) => HET_DAK.has(n), (p) => ({ ...p, f: (x, y, z) => Math.max(p.f(x, y, z), z - zHalf) }));
  latten(w[4], zHalf);
  steiger(w[4], zTop, H.rondom ? 'yY' : 'y');
  return w;
}

// De vijf fases van een huis voor bouwfasen.cjs, in dezelfde vorm als zijn eigen renderGebouw: één
// cel voor alle vijf (strak om wat ze samen tekenen), met het anker op de achterste hoek van de voet,
// zodat het huis niet verspringt terwijl het groeit. In de eerste fase liggen er een stapel hout en
// een hoop steen voor de voet, een maat groter dan anders, net als bij de oude gebouwen.
// Een gebouw uit delen (de kapel met haar toren; vraag 114, stap 3) bouwt elk deel op zijn eigen manier, met zijn eigen
// steiger, en elke fase is de delen samen (HS.samen), zoals het afgewerkte gebouw (wereldVan).
function fasenVanDelen(spec) {
  const delen = spec.delen.map((d) => {
    const Wd = HS.huis(d.spec.zaad, d.spec);
    return { fasen: fasenVanHuis(Wd, meetHuis(Wd, 0, { zonderDeur: true })), plek: d.plek };
  });
  return FASEN.map((_, i) => HS.samen(delen.map((d) => ({ W: d.fasen[i], plek: d.plek }))));
}

function renderHuisFasen(naam) {
  const spec = HUIZEN[naam];
  const draai = spec.draai || 0;
  const W = wereldVan(spec);
  const H = W.H;
  // de voet zoals hij in het beeld ligt (het anker, de stapels), en die van het huis zelf (de steiger)
  const m = meetHuis(W, draai);
  const werelden = spec.delen ? fasenVanDelen(spec) : fasenVanHuis(W, draai ? meetHuis(W) : m);
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
  // rondom staat de steiger ook achter
  if (H.rondom) extra.push([m.hoek[0] * TEGEL - 30, m.hoek[1] * TEGEL - 30, H.zM + 40], [m.hoek[0] * TEGEL - 30, Y1 + 30, 0], [X1 + 30, m.hoek[1] * TEGEL - 30, 0]);
  let kd = HS.kaderVan(H, extra, draai);
  if (W.delen) {
    // de delen samen, en de steiger om elk deel: een flinke rand
    const ks = HS.kaderSamen(W, draai);
    const x0 = Math.min(kd.x0, ks.x0) - 40;
    const x1 = Math.max(kd.x1, ks.x1) + 40;
    const y0 = Math.min(kd.y0, ks.y0) - 40;
    const y1 = Math.max(kd.y1, ks.y1) + 20;
    kd = { x0, x1, y0, y1, b: x1 - x0, h: y1 - y0 };
  }
  const RAND = 12;
  const b = Math.ceil(kd.b + RAND * 2);
  const h = Math.ceil(kd.h + RAND * 2);
  const OX = Math.round(RAND - kd.x0);
  const OY = Math.round(RAND - kd.y0);
  const platen = werelden.map((N, i) => {
    const B = new K.Beeld(b, h, OX, OY);
    Tr.tekenWereld(B, N, { draai });
    if (i === 0) for (const p of stapel) D.zetModel(B, p.model, p.gx, p.gy, 'Z');
    B.lichten.push(...Tr.lichtenNaar(draai, N.lichten));
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

// ---------------------------------------------------------------- de ruïne
//
// Een afgebrand huis (js/brand.js; werklijst vraag 144, 3; Marcel, 9 okt: "Huis moet afgebrokkeld zijn. Echt kapot.
// Structureel ingestort etc", "Moet wel handgetekend lijken", en op de eerste proefplaat: "Ja ik wil balken zien, losse
// stenen, plukjes zwart geblakerd riet van het dak", "dit is te ai, ik moet iets natuurlijker hebben iets 'echts'").
// Uit het huis zelf gesneden, zoals de bouwfasen hierboven, en gebouwd zoals een huis echt instort:
//   de muren   een schil, waarvan de hoeken het hoogst blijven staan (daar is de muur het sterkst) en de muur ertussen
//              is ingezakt, tot vlak boven de grond of tot halverwege; de breuk ruw, in trapjes van een laag stenen;
//   het puin   waar een muur inzakte, ligt hij als een berg tegen zijn voet, binnen en buiten, en losse stenen liggen
//              overal, op de bergen, op de vloer en voor het huis;
//   de balken  het dak is weg, maar zijn balken liggen kriskras in het huis, met een eind op de grond en een eind op
//              een muur of op elkaar, verkoold en gebarsten; van een paar spanten staat nog een stomp op de muur;
//   het riet   plukken zwart geblakerd riet van het dak, op de vloer, op het puin en op de balken, met hier en daar
//              een halm die nog bruin is.
// Het hout van het huis wordt houtskool met zijn nerf, steen en leem beroet in strepen. Geen licht achter de ramen. Het
// anker is dat van het huis, zodat de ruïne op zijn plek staat.
const RUINE = {
  hoek: 0.72, // een hoek staat nog tot zoveel van de muurhoogte (maal zijn eigen sterkte, van hoekSterk tot 1)
  hoekSterk: 0.45,
  hoekVlak: 14, // zo ver van de hoek staat de muur nog op zijn volle hoogte
  hoekBreed: 30, // en over zoveel eenheden daarna zakt hij naar het midden
  midden: [0.05, 0.4], // de muur tussen de hoeken: tussen zoveel en zoveel van zijn hoogte
  golf: 40, // hoe lang een stuk muur ongeveer even hoog blijft
  kartel: 8, // de breuk is ruw: zoveel eenheden op en neer
  laagje: 7, // en hij valt in trapjes van zoveel eenheden, een laag stenen
  bergen: 4, // puinbergen per vleugel, waar de muur het laagst is
  stenen: 80, // losse stenen
  balken: 9, // verkoolde balken per vleugel
  spanten: 4, // stompen van spanten per vleugel
  plukken: 16, // plukken zwart riet
  scherven: 60, // scherven van een dak van leien of pannen, rond het huis
};
// Elke muur brandt op zijn eigen manier: hoe hoog een hoek nog staat en hoe hoog de muur ertussen (van, tot), en in de fase
// binnengestort (het dak ligt binnen) hoe hoog hij dan nog staat. Steen blijft staan; van vakwerk valt het leem eruit, en
// het geraamte (SKELET: de stijlen en de liggers) staat hoger; planken en een blokhut branden tot stompen.
const MUURSOORTEN = {
  veldsteen: { hoek: 1, midden: [0.55, 0.9], binnen: 0.98 },
  kalk: { hoek: 1, midden: [0.55, 0.9], binnen: 0.98 },
  vakwerk: { hoek: 0.72, midden: [0.05, 0.4], binnen: 0.85 },
  vlecht: { hoek: 0.7, midden: [0.04, 0.35], binnen: 0.8 },
  planken: { hoek: 0.35, midden: [0.02, 0.14], binnen: 0.6 },
  blokhut: { hoek: 0.45, midden: [0.04, 0.2], binnen: 0.7 },
};
const SKELET = { hoek: 0.9, midden: [0.25, 0.8], binnen: 0.95 };
const STEEN_MUUR = new Set(['veldsteen', 'kalk']);
// Wat niet tot houtskool brandt: steen, leem en pleister, en de pannen ('dak') en leien (veldsteen) van een dak.
const ALS_STEEN = /steen|pleister|leem|aarde|zand|ijzer|^dak$/;
// Boven een raam van een stenen muur een zwarte pluim, waar de vlammen naar buiten sloegen: smal onderaan, breder en
// vager naar boven. `pluimen`: per raam [x, y, z van de bovenkant, halve breedte].
const ROETPLUIM = 70;
function inPluim(C, pluimen) {
  for (const [x, y, z, b] of pluimen) {
    const hoog = (C.z || 0) - z;
    if (hoog < -4 || hoog > ROETPLUIM) continue;
    const breed = b * (1 + hoog / ROETPLUIM);
    const d = Math.hypot((C.x || 0) - x, (C.y || 0) - y);
    if (d < breed * (1 - 0.35 * K.rnd(C.px >> 1, C.py >> 2, 77) * (hoog / ROETPLUIM))) return true;
  }
  return false;
}
// `midden`: het midden van het huis [x, y]; een muur die ernaartoe kijkt, is de binnenkant, en die is zwart: daar brandde het.
function verkoold(mat, zaad, zTop, pluimen = [], midden = null) {
  const uit = {};
  for (const [naam, m] of Object.entries(mat)) {
    const steen = ALS_STEEN.test(m.ramp || '');
    uit[naam] = {
      ...m,
      // Alles houdt zijn eigen tekening (de nerf van het hout, de stenen, het vakwerk). Hout is houtskool, grijsbruin en
      // donker; steen en leem worden donkerder, en zwart beroet in strepen van boven naar beneden.
      patroon: (C) => {
        const r = m.patroon ? m.patroon(C) : 0;
        const plus = typeof r === 'number' ? r : (r && r.plus) || 0;
        if (!steen) return { ramp: 'schors', stap: 0.25 + (C.stap + plus) * 0.32 };
        if (inPluim(C, pluimen)) return { stap: (C.stap + plus) * 0.2 };
        if (midden && (midden[0] - (C.x || 0)) * (C.nx || 0) + (midden[1] - (C.y || 0)) * (C.ny || 0) > 0 && Math.abs(C.nz || 0) < 0.7) {
          // zwart, met hier en daar een plek waar het pleister nog door het roet heen komt
          const plek = K.rnd(Math.floor((C.x || 0) / 14), Math.floor((C.z || 0) / 12), zaad + 5) < 0.12;
          return plek ? { stap: (C.stap + plus) * 0.4 } : { ramp: 'schors', stap: 0.35 + C.stap * 0.16 };
        }
        const hoog = K.klem((C.z || 0) / zTop, 0, 1);
        const streep = hoog > 0.25 + 0.6 * K.rnd(C.px >> 1, zaad, 3);
        return { stap: (C.stap + plus) * (streep ? 0.3 : 0.62 - 0.25 * hoog) };
      },
    };
  }
  // de vloer: as en roet, met wat halmen en stukjes steen
  uit.as = {
    ramp: 'schors', lo: 0.5, hi: 2.1, rand: 0.3,
    patroon: (C) => (K.hash(C.px >> 1, C.py, 9) % 13 === 0 ? { ramp: 'veldsteen', stap: 1.6 + C.stap * 0.25 } : 0),
  };
  // een verkoolde balk: zwart, in blokjes gebarsten (zoals houtskool barst), hier en daar een grijze plek as
  uit.kool = {
    ramp: 'schors', lo: 0.3, hi: 2.8, rand: 0.7,
    patroon: (C) => {
      const blok = K.hash((C.px + (C.py & 1)) >> 2, C.py >> 1, 11);
      return blok % 5 === 0 ? -0.7 : blok % 17 === 0 ? { ramp: 'veldsteen', stap: 1.6 + C.stap * 0.3 } : 0;
    },
  };
  // puin en losse stenen: veldsteen ('steen' trekt naar paars, dorp.cjs), in brokken met een eigen tint, beroet
  uit.puin = {
    ramp: 'veldsteen', lo: 0.8, hi: 4.6, rand: 0.6,
    patroon: (C) => {
      const brok = K.hash(C.px >> 2, C.py >> 2, 13);
      return brok % 6 === 0 ? { ramp: 'schors', stap: 0.8 + C.stap * 0.3 } : (brok % 5) * 0.25 - 0.5;
    },
  };
  // de schoorsteen die nog staat: veldsteen in lagen, met voegen, naar boven toe zwarter
  uit.stapel = {
    ramp: 'veldsteen', lo: 0.9, hi: 4.6, rand: 0.6,
    patroon: (C) => {
      const laag = Math.floor(C.py / 5);
      const voeg = C.py % 5 === 0 || (C.px + (laag % 2) * 4) % 8 === 0;
      const roet = K.klem((C.z || 0) / zTop, 0, 1.4) * 1.6;
      return (voeg ? -1.1 : (K.hash(C.px >> 3, laag, 19) % 4) * 0.3 - 0.4) - roet;
    },
  };
  // zwart riet: halmen schuin naast elkaar, de meeste zwart, een paar nog bruin of goud geschroeid
  uit.rietkool = {
    ramp: 'schors', lo: 0.2, hi: 1.8, rand: 0.5,
    patroon: (C) => {
      // een halm loopt schuin over een paar pixels: dezelfde waarde langs (px + 2 py), anders per plukje van acht breed
      const halm = K.hash((C.px + C.py * 2) >> 1, (C.px - C.py) >> 4, 15);
      return halm % 23 === 0 ? { ramp: 'stro', stap: 1.2 + C.stap * 0.2 } : halm % 6 === 0 ? { ramp: 'aarde', stap: 0.7 + C.stap * 0.25 } : halm % 3 === 0 ? -0.4 : 0;
    },
  };
  return uit;
}

// Een balk van A naar B, `b` breed en `h` hoog (een halve maat), als vorm in een groep.
function balkVorm(A, B, b, h, m, deel) {
  const d = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
  const L = Math.hypot(...d) || 1;
  const u = d.map((c) => c / L);
  let v = [-u[1], u[0], 0];
  const lv = Math.hypot(...v);
  v = lv < 1e-6 ? [1, 0, 0] : v.map((c) => c / lv);
  const w = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const c = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
  const r = Math.max(b, h);
  return {
    f: (x, y, z) => {
      const p = [x - c[0], y - c[1], z - c[2]];
      const pu = p[0] * u[0] + p[1] * u[1] + p[2] * u[2];
      const pv = p[0] * v[0] + p[1] * v[1] + p[2] * v[2];
      const pw = p[0] * w[0] + p[1] * w[1] + p[2] * w[2];
      return sdf.doos(pu, pv, pw, L / 2, b, h, 0.5);
    },
    grens: [c[0], c[1], L / 2 + r + 2, Math.min(A[2], B[2]) - r - 2, Math.max(A[2], B[2]) + r + 2],
    m,
    deel,
  };
}

// Naar buiten, vanaf een punt op of bij een muur: de richting loodrecht op de dichtste muur van zijn vleugel.
function naarBuiten(H, x, y) {
  let best = null;
  for (const V of H.vleugels) {
    const [a, q] = V.lok(x, y);
    const dA = V.ha - Math.abs(a);
    const dQ = V.hq - Math.abs(q);
    const d = Math.min(dA, dQ);
    if (best && d >= best.d) continue;
    const [ox, oy] = V.wereld(0, 0);
    const [ax, ay] = dQ < dA ? V.wereld(0, Math.sign(q) || 1) : V.wereld(Math.sign(a) || 1, 0);
    const l = Math.hypot(ax - ox, ay - oy) || 1;
    best = { d, n: [(ax - ox) / l, (ay - oy) / l] };
  }
  return best ? best.n : [0, 1];
}

// Wat er aan de buitenkant van het huis hing, na de brand (vraag 144, 3, punt 4; Marcel: "wow, wat een detail"): een
// luik dat aan zijn bovenste scharnier scheef hangt, of voor het huis op de grond ligt als zijn muur er niet meer is; de
// deur die uit zijn hengsels viel en voor de deur ligt; de bloembak die onder het raam ligt, met zwarte planten; en
// glasscherven onder elk raam. `o`: { staat(x, y, z): staat de muur daar nog, grond(x, y): hoe hoog de grond daar is (het
// puin), luikBlijft, luikHangt: de kans dat een luik blijft hangen zoals het hing, of scheef, deur, bak: of die vallen,
// scherven: hoeveel per raam }.
function watBuitenHing(W, N, zaad, o) {
  const H = W.H;
  const r = (a, b = 0) => K.rnd(zaad, a, b);
  const delen = (naam) => W.groepen.filter((g) => g.naam === naam);
  N.mat.scherf = { ramp: 'pet', lo: 2.4, hi: 6.4, rand: 1.2 };
  const L = N.groep('luiken');
  let i = 0;
  for (const g of delen('luiken')) {
    for (const p of g.delen) {
      i++;
      if (!p.luik || o.luiken === false) continue; // opgeruimd: de luiken zijn weg
      const { lok, lw, hv } = p.luik;
      const [cx, cy, cz] = p.g;
      const lot = r(i, 200);
      const staat = o.staat(cx, cy, cz + hv + 12); // de muur moet er ruim boven nog staan, anders hangt het in de lucht
      if (staat && lot < o.luikBlijft) {
        Tr.voeg(L, { ...p });
      } else if (staat && lot < o.luikBlijft + o.luikHangt) {
        // scheef aan zijn bovenste scharnier: in zijn eigen vlak gedraaid om de bovenhoek aan de kant van het raam
        const th = 0.45 + 0.65 * r(i, 201);
        const c = Math.cos(th);
        const sn = Math.sin(th);
        Tr.voeg(L, {
          ...p,
          f: (x, y, z) => {
            const [l, v, n] = lok(x, y, z);
            const dv = v - hv;
            return sdf.doos(l * c - dv * sn - lw / 2, l * sn + dv * c + hv, n, lw / 2, hv, 1.1, 0.4);
          },
          g: [cx, cy, cz, Math.hypot(lw, hv) * 2 + 5],
        });
      } else {
        // gevallen: plat voor de muur, een beetje scheef
        const [nx, ny] = naarBuiten(H, cx, cy);
        const uit = 6 + 10 * r(i, 202);
        const mx = cx + nx * uit;
        const my = cy + ny * uit;
        const draai = (r(i, 203) - 0.5) * 1.2;
        const tx = -ny * Math.cos(draai) + nx * Math.sin(draai);
        const ty = nx * Math.cos(draai) + ny * Math.sin(draai);
        const z = o.grond(mx, my) + 1.2;
        Tr.voeg(L, balkVorm([mx - tx * hv, my - ty * hv, z], [mx + tx * hv, my + ty * hv, z + (r(i, 204) - 0.5) * 3], lw / 2, 1.1, 'kool', p.deel));
      }
    }
  }
  if (o.deur) {
    const DG = N.groep('deur');
    for (const g of delen('deur')) {
      for (const p of g.delen) {
        if (!p.g) continue;
        const [cx, cy] = p.g;
        const [nx, ny] = naarBuiten(H, cx, cy);
        const hh = p.hh || 30;
        const hb = p.hb || 14;
        // uit zijn hengsels: hij ligt voor de deur, met de bovenkant naar buiten, wat scheef
        const draai = (r(cx | 0, 210) - 0.5) * 0.7;
        const ux = nx * Math.cos(draai) - ny * Math.sin(draai);
        const uy = ny * Math.cos(draai) + nx * Math.sin(draai);
        const ax = cx + nx * 5;
        const ay = cy + ny * 5;
        const z = o.grond(ax + ux * hh, ay + uy * hh) + 1.5;
        Tr.voeg(DG, balkVorm([ax, ay, z + 2.5], [ax + ux * hh * 2, ay + uy * hh * 2, z], hb, 1.5, 'kool', p.deel));
      }
    }
  }
  if (o.bak) {
    for (const g of delen('bloembak')) {
      const G = N.groep('bloembak');
      const zs = g.delen.map((p) => (p.g ? p.g[2] - (p.g[3] || 0) : p.grens ? p.grens[3] : 0));
      const zmin = Math.min(...zs);
      const c = g.delen.find((p) => p.g) || g.delen[0];
      const [cx, cy] = c.g || c.grens;
      const [nx, ny] = naarBuiten(H, cx, cy);
      const ox = nx * 9;
      const oy = ny * 9;
      const dz = zmin - o.grond(cx + ox, cy + oy) - 1;
      for (const p of g.delen) {
        const q = { ...p, f: (x, y, z) => p.f(x - ox, y - oy, z + dz) };
        if (p.g) q.g = [p.g[0] + ox, p.g[1] + oy, p.g[2] - dz, p.g[3]];
        if (p.grens) q.grens = [p.grens[0] + ox, p.grens[1] + oy, p.grens[2], p.grens[3] - dz, p.grens[4] - dz];
        Tr.voeg(G, q);
      }
    }
  }
  if (o.scherven) {
    const SG = N.groep('glasscherven');
    let k = 0;
    for (const g of delen('glas')) {
      for (const p of g.delen) {
        if (!p.g || !p.op) continue;
        const [cx, cy] = p.g;
        const [nx, ny] = naarBuiten(H, cx, cy);
        for (let j = 0; j < o.scherven; j++, k++) {
          const uit = 3 + 14 * r(k, 220);
          const opzij = (r(k, 221) - 0.5) * p.op.hb * 2.4;
          const x = cx + nx * uit - ny * opzij;
          const y = cy + ny * uit + nx * opzij;
          const yaw = r(k, 222) * Math.PI;
          const lang = 1 + r(k, 223) * 1.6;
          const z = o.grond(x, y) + 0.5;
          Tr.voeg(SG, balkVorm([x - Math.cos(yaw) * lang, y - Math.sin(yaw) * lang, z], [x + Math.cos(yaw) * lang, y + Math.sin(yaw) * lang, z + (r(k, 224) - 0.5)], 0.9 + r(k, 225) * 0.8, 0.35, 'scherf', 1003));
        }
      }
    }
  }
}

function ruineVanHuis(W, zaad, soort = 'ingestort') {
  const opgeruimd = soort === 'opgeruimd';
  const binnen = soort === 'binnengestort';
  const H = W.H;
  const N = new Tr.Wereld();
  // de ramen, voor de roetpluimen erboven (alleen in steen: in hout is de muur er zelf niet meer)
  const pluimen = W.groepen.filter((g) => g.naam === 'glas').flatMap((g) => g.delen)
    .filter((p) => p.op && p.g)
    .map((p) => [p.g[0], p.g[1], p.g[2] + p.op.hh, p.op.hb * 1.2]);
  const midden = H.vleugels.map((V) => V.wereld(0, 0)).reduce((m, [x, y], i, l) => [m[0] + x / l.length, m[1] + y / l.length], [0, 0]);
  N.mat = verkoold(W.mat, zaad, H.zM, pluimen, midden);
  N.lichten = [];
  N.H = H;
  const groepen = W.groepen.filter((g) => g.delen.length);
  const neem = (filter, f) => {
    for (const g of groepen) {
      if (!filter(g.naam)) continue;
      const G = N.groep(g.naam);
      for (const p of g.delen) {
        const q = f(p, g.naam);
        if (q) Tr.voeg(G, { ...q });
      }
    }
  };
  const zTop = H.zM;
  const r = (a, b = 0) => K.rnd(zaad, a, b);
  const glad1 = (t, k) => {
    const i = Math.floor(t);
    const f = t - i;
    const g = f * f * (3 - 2 * f);
    return r(i, k) + (r(i + 1, k) - r(i, k)) * g;
  };
  const glad2 = (x, y, k) => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const a = r(i * 7919 + j, k) + (r((i + 1) * 7919 + j, k) - r(i * 7919 + j, k)) * fx;
    const b = r(i * 7919 + j + 1, k) + (r((i + 1) * 7919 + j + 1, k) - r(i * 7919 + j + 1, k)) * fx;
    return a + (b - a) * fy;
  };
  const vleugels = H.vleugels.map((V, n) => {
    const wanden = V.wanden || ['vakwerk'];
    return {
      V, n, wand: wanden[0],
      // steen onder en hout boven (twee lagen): het hout brandt weg, de steen staat tot de vloer van boven
      tot: wanden.length > 1 && STEEN_MUUR.has(wanden[0]) && !STEEN_MUUR.has(wanden[1]) ? H.h1 : Infinity,
      sterk: [0, 1, 2, 3].map((c) => RUINE.hoekSterk + (1 - RUINE.hoekSterk) * r(n * 4 + c, 30)),
    };
  });
  // Hoe hoog de muur hier nog staat (zonder ruwheid): bij een hoek hoog, ertussen ingezakt, naar zijn soort (MUURSOORTEN).
  // `skelet`: voor het geraamte van vakwerk, dat hoger staat dan het leem ertussen.
  const muurHoogte = (x, y, skelet = false) => {
    let best = 0;
    for (const { V, n, sterk, wand, tot } of vleugels) {
      const S = (skelet && (wand === 'vakwerk' || wand === 'vlecht') && SKELET) || MUURSOORTEN[wand] || MUURSOORTEN.vakwerk;
      const [a, q] = V.lok(x, y);
      if (Math.abs(a) > V.ha + 14 || Math.abs(q) > V.hq + 14) continue;
      const dA = V.ha - Math.abs(a);
      const dQ = V.hq - Math.abs(q);
      // binnen, ver van de muren (een stijl van het vakwerk): die staat niet alleen overeind
      if (Math.min(dA, dQ) > 16) {
        best = Math.max(best, zTop * 0.08);
        continue;
      }
      const langs = dQ < dA; // op een lange muur (langs de nok), anders op een kopse
      const t = langs ? a : q;
      const zij = langs ? (q > 0 ? 0 : 1) : a > 0 ? 2 : 3;
      const dHoek = langs ? dA : dQ;
      const hoek = sterk[(a > 0 ? 1 : 0) + (q > 0 ? 2 : 0)];
      const [m0, m1] = S.midden;
      const midden = m0 + (m1 - m0) * glad1(t / RUINE.golf + zij * 17 + n * 5 + (skelet ? 9 : 0), 1);
      const bij = Math.exp(-Math.max(0, dHoek - RUINE.hoekVlak) / RUINE.hoekBreed);
      let h = midden + (S.hoek * hoek - midden) * bij;
      // binnengestort: het dak ligt binnen, de muren staan nog bijna heel
      if (binnen) h = Math.max(h, S.binnen * (0.9 + 0.1 * glad1(t / 20 + zij * 7, 14)));
      best = Math.max(best, Math.min(zTop * h, tot));
    }
    return best;
  };
  // opgeruimd: wat nog wankel stond, is neergehaald (een stenen muur laat men staan tot hij weer opgemetseld wordt)
  const steen = vleugels.every((v) => STEEN_MUUR.has(v.wand));
  const breuk = (x, y, skelet = false) => {
    const z = muurHoogte(x, y, skelet) * (opgeruimd ? (steen ? 0.5 : 0.3) : 1) + (glad2(x / 16, y / 16, 4) - 0.5) * 2 * RUINE.kartel;
    const laag = RUINE.laagje;
    return Math.floor(z / laag) * laag + (glad2(x / 6, y / 6, 13) > 0.74 ? laag : 0);
  };
  // De breuk als afstand, gedeeld door hoe steil hij hooguit is: een veld dat meer belooft dan het waarmaakt, laat de
  // stralen door de dunne muur schieten.
  const STEIL = 1.5 + zTop * (1 / RUINE.hoekBreed + 0.9 * 1.6 / RUINE.golf) + RUINE.kartel / 8;
  const boven = (x, y, z, skelet) => (z - breuk(x, y, skelet)) / STEIL;
  const MUREN = new Set([...BIJ_DE_MUREN].filter((n) => n !== 'glas' && n !== 'deur'));
  const GERAAMTE = new Set(['stijlen', 'liggers', 'aanbouwstijlen']);
  neem((n) => MUREN.has(n) || n === 'plint' || n === 'gevelschoorsteen', (p, naam) => {
    if (naam === 'romp' && p.deel === 1) return { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), -p.f(x, y, FASE.schilZ) - FASE.schil, boven(x, y, z)) };
    if (naam === 'gevelschoorsteen') return { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), z - (zTop + 10)) }; // de stenen schoorsteen staat nog
    const skelet = GERAAMTE.has(naam);
    return { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), boven(x, y, z, skelet)) };
  });
  // De stenen schoorsteen blijft overeind: van de haard op de grond tot boven, waar hij op het dak stond, zwart van het
  // roet. Een schoorsteen van leem valt met het dak. Is het huis ingestort, dan is er soms een stuk van de top af.
  const S = H.schoorsteen;
  if (S && H.schoorsteenSoort === 'steen') {
    const V = S.V;
    const top = (V.nokZ(S.a) + H.dik + S.hoog) * (soort === 'binnengestort' ? 0.9 : opgeruimd ? 0.42 : 0.55 + 0.2 * r(1, 15));
    const [cx, cy] = V.wereld(S.a, S.q);
    Tr.voeg(N.groep('schoorsteen'), {
      f: (x, y, z) => {
        const [a, q] = V.lok(x, y);
        const d = sdf.doos(a - S.a, q - S.q, z - top / 2, S.s, S.s, top / 2, 1.2);
        // de breuk bovenaan is ruw, en van binnen is hij hol
        const rand = Math.max(d, z - top + 4 * glad2((a - S.a) / 5, (q - S.q) / 5, 16));
        return Math.max(rand, -sdf.doos(a - S.a, q - S.q, z - top, S.s - 3.4, S.s - 3.4, 12, 0.5));
      },
      grens: [cx, cy, S.s * 1.5 + 2, -1, top + 4],
      m: 'stapel',
      deel: 4,
    });
  }
  // De vloer: as, binnen de muren, wat bobbelig.
  const vloer = N.groep('as');
  for (const V of H.vleugels) {
    const [cx, cy] = V.wereld(0, 0);
    Tr.voeg(vloer, {
      f: (x, y, z) => {
        const [a, q] = V.lok(x, y);
        return sdf.doos(a, q, z - 1.2, V.ha - 8, V.hq - 8, 1.2 + glad2(a / 10, q / 10, 5) * 2, 1);
      },
      grens: [cx, cy, Math.hypot(V.ha, V.hq), -1, 6],
      m: 'as',
      deel: 994,
    });
  }
  // Puinbergen tegen de voet van een ingezakte muur, binnen en buiten: een lage berg, half in de grond.
  const puin = N.groep('puin');
  const bergen = [];
  let k = 0;
  for (const { V } of vleugels) {
    const kandidaten = [];
    for (let i = 0; i < 24; i++, k++) {
      const langs = r(k, 40) < 0.62;
      const zij = r(k, 41) < 0.5 ? -1 : 1;
      const t = (r(k, 42) * 2 - 1) * ((langs ? V.ha : V.hq) - 12);
      const [a, q] = langs ? [t, zij * V.hq] : [zij * V.ha, t];
      const [x, y] = V.wereld(a, q);
      kandidaten.push({ x, y, a, q, h: muurHoogte(x, y) });
    }
    kandidaten.sort((p, q) => p.h - q.h);
    for (const c of kandidaten.slice(0, RUINE.bergen)) {
      for (const kant of [-1, 1]) {
        // binnen en buiten de muur, buiten wat kleiner
        const [lx, ly] = V.wereld(c.a * (1 + kant * 0.06 * Math.sign(c.a) * (Math.abs(c.a) > V.ha - 1 ? 1 : 0)), c.q * (1 + kant * 0.08 * (Math.abs(c.q) > V.hq - 1 ? 1 : 0)));
        const R = (kant < 0 ? 22 : 15) + r(k++, 43) * 8;
        const Hb = ((kant < 0 ? 13 : 9) + r(k++, 44) * 6) * (opgeruimd ? 1.5 : 1);
        bergen.push({ x: lx, y: ly, R, H: Hb });
        Tr.voeg(puin, {
          f: (x, y, z) => Math.max(sdf.ellipsoide(x - lx, y - ly, z, R, R * 0.85, Hb), -z),
          grens: [lx, ly, R + 2, -1, Hb + 2],
          m: 'puin',
          deel: 997,
        });
      }
    }
  }
  // Binnengestort: het dak ligt in het huis, een bobbelige berg van zwart riet (of puin) tot zo'n derde van de muur.
  const dakBerg = binnen ? zTop * 0.36 : 0;
  const bergBinnen = (x, y) => {
    if (!binnen) return 0;
    let z = 0;
    for (const V of H.vleugels) {
      const [a, q] = V.lok(x, y);
      const d2 = (a / (V.ha - 10)) ** 2 + (q / (V.hq - 10)) ** 2;
      if (d2 < 1) z = Math.max(z, (dakBerg + (glad2(a / 18, q / 18, 17) - 0.5) * dakBerg * 0.6) * Math.sqrt(1 - d2));
    }
    return z;
  };
  const hoogteOp = (x, y) => {
    let z = Math.max(2, bergBinnen(x, y));
    for (const b of bergen) {
      const d2 = ((x - b.x) / b.R) ** 2 + ((y - b.y) / (b.R * 0.85)) ** 2;
      if (d2 < 1) z = Math.max(z, b.H * Math.sqrt(1 - d2));
    }
    return z;
  };
  // Losse stenen: de meeste op en bij de bergen, de rest op de vloer en voor het huis.
  const [X0, Y0, X1, Y1] = (() => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const V of H.vleugels) for (const [a, q] of [[-V.ha, -V.hq], [V.ha, -V.hq], [V.ha, V.hq], [-V.ha, V.hq]]) {
      const [x, y] = V.wereld(a, q);
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    return [x0, y0, x1, y1];
  })();
  for (let i = 0; i < RUINE.stenen * (opgeruimd ? 0.3 : 1); i++, k++) {
    let x;
    let y;
    if (bergen.length && r(k, 50) < 0.6) {
      const b = bergen[Math.floor(r(k, 51) * bergen.length)];
      const hoek = r(k, 52) * Math.PI * 2;
      const d = Math.sqrt(r(k, 53)) * b.R * 1.15;
      x = b.x + Math.cos(hoek) * d;
      y = b.y + Math.sin(hoek) * d;
    } else {
      x = X0 - 20 + r(k, 54) * (X1 - X0 + 50);
      y = Y0 - 20 + r(k, 55) * (Y1 - Y0 + 50);
    }
    const s = 2.2 + r(k, 56) * 3.4;
    const z = hoogteOp(x, y) + s * 0.4;
    const yaw = r(k, 57) * Math.PI;
    const L = s * (0.9 + r(k, 58) * 0.7);
    const A = [x - Math.cos(yaw) * L, y - Math.sin(yaw) * L, z + (r(k, 59) - 0.5) * s];
    const B = [x + Math.cos(yaw) * L, y + Math.sin(yaw) * L, z - (r(k, 59) - 0.5) * s];
    Tr.voeg(puin, balkVorm(A, B, s * (0.6 + r(k, 60) * 0.4), s * 0.55, 'puin', 998));
  }
  // De balken van het dak, kriskras: een eind op de grond (of op een berg), een eind op een muur of op een andere balk.
  // Opgeruimd liggen ze op een stapel voor het huis, naast elkaar en op elkaar.
  const balken = N.groep('balken');
  const liggen = [];
  if (opgeruimd) {
    const V = H.vleugels[0];
    const L = Math.min(110, V.ha * 1.4);
    for (let laag = 0; laag < 3; laag++) {
      for (let i = 0; i < 4 - laag; i++, k++) {
        const q = V.hq + 26 + (i - (3 - laag) / 2) * 11 + laag * 5;
        const z = 5 + laag * 9;
        const [ax, ay] = V.wereld(-L / 2 + (r(k, 75) - 0.5) * 12, q);
        const [bx, by] = V.wereld(L / 2 + (r(k, 76) - 0.5) * 12, q);
        Tr.voeg(balken, balkVorm([ax, ay, z], [bx, by, z], 4.5, 4.2, 'kool', 996));
      }
    }
  }
  for (const { V } of opgeruimd ? [] : vleugels) {
    for (let i = 0; i < RUINE.balken; i++, k++) {
      const a0 = (r(k, 60) * 2 - 1) * (V.ha - 14);
      const q0 = (r(k, 61) * 2 - 1) * (V.hq - 14);
      const hoek = r(k, 62) * Math.PI;
      const L = 40 + r(k, 63) * 70;
      let [ax, ay] = V.wereld(a0 - Math.cos(hoek) * L / 2, q0 - Math.sin(hoek) * L / 2);
      let [bx, by] = V.wereld(a0 + Math.cos(hoek) * L / 2, q0 + Math.sin(hoek) * L / 2);
      const soort = r(k, 64);
      let az = hoogteOp(ax, ay) + 4;
      let bz = hoogteOp(bx, by) + 4;
      if (soort < 0.4) {
        // schuin: het ene eind op de bovenkant van de muur
        const zij = r(k, 65) < 0.5 ? -1 : 1;
        [bx, by] = V.wereld(Math.max(-V.ha + 4, Math.min(V.ha - 4, a0 + Math.cos(hoek) * L / 2)), zij * (V.hq - 5));
        // laag tegen de muur, niet steiler dan zo'n twintig graden: een balk die tegen een hoge muur leunt, oogt als een paal
        const vlak = Math.hypot(bx - ax, by - ay);
        bz = Math.max(bz, Math.min(breuk(bx, by) - 2, zTop * 0.18, az + vlak * 0.4));
      } else if (soort < 0.7 && liggen.length) {
        // op een balk die er al ligt
        const o = liggen[Math.floor(r(k, 66) * liggen.length)];
        bz = Math.max(bz, Math.min(o + 6, 16));
      }
      liggen.push(Math.max(az, bz) / 2 + Math.min(az, bz) / 2);
      const dik = 3 + r(k, 67) * 2;
      Tr.voeg(balken, balkVorm([ax, ay, az], [bx, by, bz], dik, dik * (0.8 + r(k, 68) * 0.3), 'kool', 996));
    }
    // Stompen van spanten: van de bovenkant van een lange muur schuin omhoog, naar binnen, kort afgebroken.
    for (let i = 0; i < RUINE.spanten; i++, k++) {
      const a0 = (r(k, 70) * 2 - 1) * (V.ha - 10);
      const zij = r(k, 71) < 0.5 ? -1 : 1;
      const [ax, ay] = V.wereld(a0, zij * (V.hq - 3));
      const az = breuk(ax, ay) - 3;
      if (az < zTop * 0.45) continue; // alleen waar de muur nog staat
      const L = 12 + r(k, 72) * 14;
      const helling = 0.45 + r(k, 73) * 0.3;
      const [bx, by] = V.wereld(a0 + (r(k, 74) - 0.5) * 10, zij * (V.hq - 3 - L * Math.cos(helling)));
      Tr.voeg(balken, balkVorm([ax, ay, az], [bx, by, az + L * Math.sin(helling)], 3, 2.6, 'kool', 999));
    }
  }
  // Een dak van leien of pannen brandt niet: het breekt, en de scherven liggen rond het huis, op het puin en binnen.
  if (H.dak === 'leien' || H.dak === 'pannen') {
    const scherven = N.groep('scherven');
    for (let i = 0; i < RUINE.scherven * (opgeruimd ? 0.4 : 1); i++, k++) {
      const binnenIn = r(k, 100) < 0.45;
      const x = binnenIn ? X0 + 8 + r(k, 101) * (X1 - X0 - 16) : X0 - 26 + r(k, 102) * (X1 - X0 + 52);
      const y = binnenIn ? Y0 + 8 + r(k, 103) * (Y1 - Y0 - 16) : Y0 - 26 + r(k, 104) * (Y1 - Y0 + 52);
      const yaw = r(k, 105) * Math.PI;
      const L = 3 + r(k, 106) * 3.5;
      const z = hoogteOp(x, y) + 1.2;
      const kant = (r(k, 107) - 0.5) * 2.5; // een scherf ligt scheef
      Tr.voeg(scherven, balkVorm([x - Math.cos(yaw) * L, y - Math.sin(yaw) * L, z - kant], [x + Math.cos(yaw) * L, y + Math.sin(yaw) * L, z + kant], 2.6 + r(k, 108) * 2, 0.8, 'dak', 1001));
    }
  }
  if (binnen) {
    for (const { V } of vleugels) {
      const [cx, cy] = V.wereld(0, 0);
      Tr.voeg(N.groep(H.dak === 'riet' ? 'rietkool' : 'puin'), {
        f: (x, y, z) => {
          const [a, q] = V.lok(x, y);
          const golf = (glad2(a / 18, q / 18, 17) - 0.5) * dakBerg * 0.6;
          return Math.max(sdf.ellipsoide(a, q, z, V.ha - 10, V.hq - 10, dakBerg + golf) / 2, -z);
        },
        grens: [cx, cy, Math.hypot(V.ha, V.hq), -1, dakBerg * 1.4 + 2],
        m: H.dak === 'riet' ? 'rietkool' : 'puin',
        deel: 1002,
      });
    }
  }
  // Plukken zwart riet: drie bulten door elkaar, op de vloer, op de bergen en op de balken.
  const riet = N.groep('rietkool');
  for (let i = 0; i < RUINE.plukken * (opgeruimd ? 0.25 : 1) * (H.dak === 'riet' ? 1 : 0.3); i++, k++) {
    const x = X0 + 10 + r(k, 80) * (X1 - X0 - 20);
    const y = Y0 + 10 + r(k, 81) * (Y1 - Y0 - 20);
    const z = hoogteOp(x, y) + (r(k, 82) < 0.35 ? 7 : 1);
    const delen = [0, 1, 2].map((j) => ({
      dx: (r(k, 83 + j) - 0.5) * 16, dy: (r(k, 86 + j) - 0.5) * 16,
      a: 6 + r(k, 89 + j) * 8, b: 5 + r(k, 92 + j) * 6, c: 2.5 + r(k, 95 + j) * 3,
    }));
    Tr.voeg(riet, {
      f: (px, py, pz) => {
        let d = Infinity;
        for (const p of delen) d = Math.min(d, sdf.ellipsoide(px - x - p.dx, py - y - p.dy, pz - z, p.a, p.b, p.c));
        return d;
      },
      grens: [x, y, 26, z - 6, z + 8],
      m: 'rietkool',
      deel: 995,
    });
  }
  // Wat er buiten hing: in de ruïne meest gevallen, binnengestort nog vaak scheef; opgeruimd is het weg, op wat glas na.
  watBuitenHing(W, N, zaad, {
    staat: (x, y, z) => z < breuk(x, y) - 4,
    grond: (x, y) => hoogteOp(x, y) - 1,
    luiken: !opgeruimd,
    luikBlijft: opgeruimd ? 0 : binnen ? 0.25 : 0.1,
    luikHangt: opgeruimd ? 0 : binnen ? 0.45 : 0.3,
    deur: !opgeruimd,
    bak: !opgeruimd,
    scherven: opgeruimd ? 1 : 5,
  });
  return N;
}

// De fasen van het afbranden (Marcel, 9 okt: "Ik wil natuurlijk ook verschillende fasen van afbranden / kapot. Art maakt
// of breekt een spel"), als de bouwfasen, maar omgekeerd: het huis zoals het brandt, en wat er daarna van over is.
//   geschroeid  het huis staat, het dak heeft zwarte plekken en de eerste gaten, de bovenkant van de muren is beroet;
//   dakvalt     het dak heeft grote gaten met de verkoolde latten eronder, de rest is zwart, de muren zijn beroet;
//   binnengestort  het dak ligt in het huis, de muren staan nog zwart overeind (ruineVanHuis);
//   ingestort   de ruïne (ruineVanHuis);
//   opgeruimd   de muren laag, het puin op hopen, de balken op een stapel: zo begint het herbouwen.
const BRANDFASEN = ['geschroeid', 'dakvalt', 'binnengestort', 'ingestort', 'opgeruimd'];
const SCHROEI = {
  geschroeid: { zwart: 0.36, gat: 0.17, muur: 0.75 }, // hoeveel van het dak zwart is, hoeveel weg, en vanaf welke hoogte de muur beroet is
  dakvalt: { zwart: 0.75, gat: 0.55, muur: 0.45 },
  bruin: 0.1, // om het zwart een rand van geschroeid bruin, zo breed (in de vlek)
};
function schroeiVanHuis(W, zaad, fase) {
  const H = W.H;
  const S = SCHROEI[fase];
  const zTop = H.zM;
  const N = new Tr.Wereld();
  const kool = verkoold(W.mat, zaad, zTop);
  const r = (a, b = 0) => K.rnd(zaad, a, b);
  const vlak = (x, y, k, schaal) => {
    const i = Math.floor(x / schaal);
    const j = Math.floor(y / schaal);
    const fx = x / schaal - i;
    const fy = y / schaal - j;
    const v = (a, b) => r(a * 7919 + b, k);
    const boven = v(i, j) + (v(i + 1, j) - v(i, j)) * fx;
    const onder = v(i, j + 1) + (v(i + 1, j + 1) - v(i, j + 1)) * fx;
    return boven + (onder - boven) * fy;
  };
  // grillig: een grove vlek met een fijnere erdoor, zodat de rand van het zwart rafelt zoals verbrand riet
  const vlek = (x, y, k, schaal) => 0.68 * vlak(x, y, k, schaal) + 0.32 * vlak(x, y, k + 50, schaal / 3.2);
  // Een materiaal dat hier en daar verkoold is: het dak in vlekken met een bruine rand, een muur van boven naar beneden.
  N.mat = {};
  for (const [naam, m] of Object.entries(W.mat)) {
    const dak = naam === 'riet' || naam === 'dak' || naam === 'nok';
    N.mat[naam] = {
      ...m,
      patroon: (C) => {
        const eigen = m.patroon ? m.patroon(C) : 0;
        if (!dak) return (C.z || 0) / zTop > S.muur + 0.25 * vlek(C.x || 0, C.y || 0, 22, 9) ? kool[naam].patroon(C) : eigen;
        const v = vlek(C.x || 0, C.y || 0, 21, 26);
        const plus0 = typeof eigen === 'number' ? eigen : (eigen && eigen.plus) || 0;
        // lei en pannen branden niet: ze worden zwart van het roet, en houden hun vorm
        if (H.dak !== 'riet') return v < S.zwart ? { stap: (C.stap + plus0) * 0.3 } : v < S.zwart + SCHROEI.bruin ? { stap: (C.stap + plus0) * 0.6 } : eigen;
        if (v < S.zwart) return kool[naam].patroon(C);
        if (v < S.zwart + SCHROEI.bruin) {
          // geschroeid: bruin, met de tekening van het riet erin, donkerder naar het zwart toe
          const t = (v - S.zwart) / SCHROEI.bruin;
          const plus = typeof eigen === 'number' ? eigen : (eigen && eigen.plus) || 0;
          return { ramp: 'hout', stap: 0.6 + (C.stap + plus) * (0.25 + 0.25 * t) };
        }
        return eigen;
      },
    };
  }
  N.mat.kool = kool.kool;
  N.mat.glas = { ...kool.kool }; // het glas is zwart: geen licht meer
  N.lichten = [];
  N.H = H;
  // Alles van het huis, behalve dat het dak gaten heeft (waar de vlek het laagst is), met een zachte rand.
  const dakDeel = W.groepen.filter((g) => HET_DAK.has(g.naam)).flatMap((g) => g.delen)[0];
  for (const g of W.groepen.filter((g) => g.delen.length && !(fase === 'dakvalt' && g.naam === 'luiken'))) {
    const G = N.groep(g.naam);
    const dak = HET_DAK.has(g.naam) || g.naam === 'nok' || g.naam === 'windveer';
    for (const p of g.delen) {
      if (!dak) {
        Tr.voeg(G, { ...p });
        continue;
      }
      Tr.voeg(G, { ...p, f: (x, y, z) => Math.max(p.f(x, y, z), (S.gat - vlek(x, y, 21, 26)) * 14) });
    }
  }
  // Onder de gaten de latten van het dak, verkoold (zoals de bouwfase dakgebinte).
  if (dakDeel && !H.plat && fase === 'dakvalt') {
    const G = N.groep('latten');
    const fD = dakDeel.f;
    for (const V of H.vleugels) {
      Tr.voeg(G, {
        f: (x, y, z) => {
          const d = fD(x, y, z);
          const [a, q] = V.lok(x, y);
          const rr = ((a % FASE.lat) + FASE.lat) % FASE.lat;
          const lat = Math.min(rr, FASE.lat - rr) - 5;
          const nok = V.nokZ(a) - 18 - z;
          return Math.max(d + 3, -d - 12, Math.min(lat, nok), Math.abs(a) - V.XR, Math.abs(q) - (V.Qe0 + 10));
        },
        grens: dakDeel.grens,
        g: dakDeel.g,
        m: 'kool',
        deel: 993,
      });
    }
  }
  // Als het dak valt, springen de ruiten en hangt een enkel luik scheef (de muren staan nog).
  if (fase === 'dakvalt') watBuitenHing(W, N, zaad, { staat: () => true, grond: () => 0, luikBlijft: 0.65, luikHangt: 0.35, deur: false, bak: false, scherven: 3 });
  return N;
}

function brandfaseVanHuis(W, zaad, fase) {
  return SCHROEI[fase] ? schroeiVanHuis(W, zaad, fase) : ruineVanHuis(W, zaad, fase);
}

// Een fase van het afbranden van een huis voor ruines.cjs: één cel, met het anker op de achterste hoek van de voet (zoals
// renderHuisFasen).
// `variant`: een ander zaad, zodat twee dezelfde huizen niet hetzelfde instorten (punt 6).
function renderHuisRuine(naam, fase = 'ingestort', variant = 0) {
  const spec = HUIZEN[naam];
  const draai = spec.draai || 0;
  const W = wereldVan(spec);
  const H = W.H;
  const m = meetHuis(W, draai);
  const zaad = (spec.zaad || 1) * 31 + 7 + variant * 1009;
  const N = spec.delen
    ? HS.samen(spec.delen.map((d) => ({ W: brandfaseVanHuis(HS.huis(d.spec.zaad, d.spec), zaad + d.plek[0], fase), plek: d.plek })))
    : brandfaseVanHuis(W, zaad, fase);
  // het kader: het huis, en de stenen en het puin tot een tegel eromheen
  const extra = [];
  const [hx, hy, vb, vh] = [m.hoek[0], m.hoek[1], m.voet[0], m.voet[1]];
  for (const [gx, gy] of [[hx - 1, hy - 1], [hx + vb + 1, hy - 1], [hx - 1, hy + vh + 1], [hx + vb + 1, hy + vh + 1]]) extra.push([gx * TEGEL, gy * TEGEL, 0]);
  const kd = W.delen ? HS.kaderSamen(W, draai) : HS.kaderVan(H, extra, draai);
  const RAND = 12;
  const b = Math.ceil(kd.b + RAND * 2);
  const h = Math.ceil(kd.h + RAND * 2);
  const OX = Math.round(RAND - kd.x0);
  const OY = Math.round(RAND - kd.y0);
  const B = new K.Beeld(b, h, OX, OY);
  Tr.tekenWereld(B, N, { draai });
  K.belicht(B, { omgeving: () => 0.2 });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  const plaat = K.Plaat.van(K.kwantiseer(B));
  let xa = plaat.b;
  let ya = plaat.h;
  let xb = -1;
  let yb = -1;
  for (let y = 0; y < plaat.h; y++) {
    for (let x = 0; x < plaat.b; x++) {
      if (plaat.px[(y * plaat.b + x) * 2] < 0) continue;
      if (x < xa) xa = x;
      if (x > xb) xb = x;
      if (y < ya) ya = y;
      if (y > yb) yb = y;
    }
  }
  const X = m.hoek[0] * TEGEL;
  const Y = m.hoek[1] * TEGEL;
  const ax = Math.round(OX + X * EX[0] + Y * EX[1]);
  const ay = Math.round(OY + X * EY[0] + Y * EY[1]);
  const cb = xb - xa + 1;
  const ch = yb - ya + 1;
  return { id: spec.gebouw, tekening: naam, cb, ch, ankerX: ax - xa, ankerY: ay - ya, beslaat: m.voet, plaat: plaat.uitsnede(xa, ya, cb, ch) };
}

// ---------------------------------------------------------------- werkers

// Een huis kost zo'n halve minuut; de huizen gaan daarom tegelijk, elk in een eigen draad, net als
// in huis-sdf-export.cjs en bouwfasen.cjs (een wachtrij waar elke draad de volgende uit pakt).
if (!isMainThread && workerData === 'huizen') {
  parentPort.on('message', ({ i, naam }) => {
    try {
      const r = renderHuis(HUIZEN[naam]);
      parentPort.postMessage({ i, naam, b: r.plaat.b, h: r.plaat.h, px: r.plaat.px, anker: r.anker, voet: r.voet, deur: r.deur, deurVer: r.deurVer, ramen: r.ramen, ms: r.ms });
    } catch (e) {
      parentPort.postMessage({ i, naam, fout: e.message });
    }
  });
}

const DRADEN = () => Math.max(1, Math.min(8, os.cpus().length));

// namen: welke huizen (standaard alle). Geeft per huis { naam, plaat, anker, voet, deur, ms }, in
// dezelfde volgorde; een huis dat mislukt, meldt zich en valt weg.
// Wat al gerenderd is, ligt in uit/huizen-cache (niet in git), per huis onder een sleutel uit zijn opgave en de code van
// de bouwer: zo kan het renderen van het hele vel in delen (een taak op de achtergrond stopt na twee uur; vraag 114, stap
// 3), en rendert een tweede keer alleen wat nieuw of veranderd is.
const CACHE = path.join(__dirname, 'uit', 'huizen-cache');
let codeSleutel = null;
function cacheBestand(naam) {
  if (!codeSleutel) {
    const h = crypto.createHash('sha1');
    for (const f of ['huizen.cjs', 'huis-sdf.cjs', 'toren.cjs', 'kern.cjs', 'dorp.cjs']) h.update(fs.readFileSync(path.join(__dirname, f)));
    codeSleutel = h.digest('hex').slice(0, 12);
  }
  const s = crypto.createHash('sha1').update(codeSleutel + JSON.stringify(HUIZEN[naam])).digest('hex').slice(0, 16);
  return path.join(CACHE, `${naam}-${s}.json`);
}
function renderHuizen(namen = Object.keys(HUIZEN), draden = DRADEN()) {
  fs.mkdirSync(CACHE, { recursive: true });
  const bewaard = new Map();
  for (const naam of namen) {
    const f = cacheBestand(naam);
    if (!fs.existsSync(f)) continue;
    const m = JSON.parse(fs.readFileSync(f, 'utf8'));
    const plaat = new K.Plaat(m.b, m.h);
    plaat.px = Int16Array.from(m.px);
    bewaard.set(naam, { naam, plaat, anker: m.anker, voet: m.voet, deur: m.deur, deurVer: m.deurVer, ramen: m.ramen, ms: 0 });
  }
  if (bewaard.size) console.log(`  ${bewaard.size} huizen uit ${path.relative(process.cwd(), CACHE)}`);
  const nog = namen.filter((n) => !bewaard.has(n));
  return renderNieuw(nog, draden).then((r) => {
    const per = new Map(r.map((x) => [x.naam, x]));
    return namen.map((n) => bewaard.get(n) || per.get(n)).filter(Boolean);
  });
}
function renderNieuw(namen, draden) {
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
          uit[m.i] = { naam: m.naam, plaat, anker: m.anker, voet: m.voet, deur: m.deur, deurVer: m.deurVer, ramen: m.ramen, ms: m.ms };
          fs.writeFileSync(cacheBestand(m.naam), JSON.stringify({ b: m.b, h: m.h, px: Array.from(m.px), anker: m.anker, voet: m.voet, deur: m.deur, deurVer: m.deurVer, ramen: m.ramen }));
          console.log(`  ${m.naam.padEnd(12)} ${m.b}×${m.h}  voet ${m.voet.join('×')}  deur ${m.deur} (${m.deurVer} tegel voor de muur)  ${m.ramen.length} ramen  ${(m.ms / 1000).toFixed(1)} s`);
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

module.exports = { HUIZEN, STIJLEN, TORENS, grootGebouw, VORMEN, huttenVan, STANDEN, stijlNaam, FASEN, BRANDFASEN, RUINE, brandfaseVanHuis, renderHuis, renderHuizen, renderHuisFasen, renderHuisRuine, meetHuis };

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
