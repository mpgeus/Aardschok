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
  }
  return uit;
}
Object.assign(HUIZEN, stijlHuizen());

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
function meetHuis(W, draai = 0) {
  const H = W.H;
  // een punt van het huis zoals het in het beeld ligt, en terug
  const naar = (p) => (draai ? Tr.draaiNaar(draai, p) : p);
  const terug = (x, y) => (draai ? Tr.draaiTerug(draai, [x, y]) : [x, y]);
  // de achterste hoek van het plan, op een halve tegel afgerond (de vleugels staan scheef, en een
  // tweede vleugel een graad of twee uit het haakse: dat mag de hoek niet verschuiven)
  let px = Infinity;
  let py = Infinity;
  for (const V of H.vleugels) {
    for (const sa of [-1, 1]) {
      for (const sq of [-1, 1]) {
        const [x, y] = naar(V.wereld(sa * V.ha, sq * V.hq));
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
  const deuren = [(a) => naar(HS.voorDeDeur(H, a))];
  for (const d of H.deuren) {
    if (d === H.deur || d.h0 > 20) continue;
    deuren.push((a) => naar(d.P.pos(d.u, 0, a * TEGEL).slice(0, 2).map((v) => v / TEGEL)));
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
  const W = HS.huis(spec.zaad, spec);
  const H = W.H;
  const m = meetHuis(W, draai);
  const kd = HS.kaderVan(H, [], draai);
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
function renderHuisFasen(naam) {
  const spec = HUIZEN[naam];
  const draai = spec.draai || 0;
  const W = HS.huis(spec.zaad, spec);
  const H = W.H;
  // de voet zoals hij in het beeld ligt (het anker, de stapels), en die van het huis zelf (de steiger)
  const m = meetHuis(W, draai);
  const werelden = fasenVanHuis(W, draai ? meetHuis(W) : m);
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
  const kd = HS.kaderVan(H, extra, draai);
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
          uit[m.i] = { naam: m.naam, plaat, anker: m.anker, voet: m.voet, deur: m.deur, deurVer: m.deurVer, ramen: m.ramen, ms: m.ms };
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

module.exports = { HUIZEN, STIJLEN, VORMEN, huttenVan, STANDEN, stijlNaam, FASEN, renderHuis, renderHuizen, renderHuisFasen, meetHuis };

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
