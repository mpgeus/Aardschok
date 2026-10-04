'use strict';
// Een dorp van N bewoners bouwen op het gehucht (alleen voor de meting, npm run grootte). Ook in de bladzijde
// (browser.cjs zet deze bron daar neer, met T = Spel), zodat het in Node en in de browser hetzelfde dorp is. Gebruikt de regels van het spel zelf:
// T.legErfAan en T.zetHutOpErf (js/erven.js: zo groeit het dorp echt), T.plaatsGebouw (met T.waaromPastHetNiet),
// T.wijzigBevolking (en daarmee de bewoners uit js/bewoners.js), T.verdeelHanden. Wat een speler met de hand zou doen,
// doen we in bulk.
//
// Twee indelingen:
//   'erven'   (standaard) elk gezin op een erf van 10 bij 10, zoals het spel het doet; werkplekken met twee tegels lucht.
//   'compact' hutten zonder erf, met één tegel steeg ertussen (veel krapper dan het spel ooit bouwt).
const { T } = require('./harnas.cjs');

// Kaart groter maken: nieuwe rijen en kolommen gras rechts en onder (de bestaande coördinaten blijven gelden).
function vergroot(S, L) {
  const w = S.wereld;
  if (L <= w.b && L <= w.h) return;
  const gras = { vel: 'rand', id: 0, naam: 'gras' }; // één ding voor elke tegel gras, zoals T.laadKaart
  for (let y = 0; y < L; y++) {
    if (y >= w.h) {
      w.tegels.push([]);
      w.grond.push([]);
    }
    for (let x = y < w.h ? w.b : 0; x < L; x++) {
      w.tegels[y].push('vloer');
      w.grond[y].push(gras);
    }
  }
  // buiten is elke rij kamers dezelfde (T.laadKaart): een nieuwe, even breed
  w.burenKamers = new Array(L).fill(new Array(L).fill(['buiten']));
  w.b = L;
  w.h = L;
  w.kamers[0].x2 = L - 1;
  w.kamers[0].y2 = L - 1;
}

// De vrije grond als raster. `muur`: er staat iets vast (T.isVast); `nee`: er mag niet gebouwd worden (plein, veld,
// pad, erf: T.waaromNietOpDezeGrond).
function maakRaster(D) {
  const w = D.wereld;
  const muur = new Uint8Array(w.b * w.h);
  const nee = new Uint8Array(w.b * w.h);
  for (let y = 0; y < w.h; y++) {
    for (let x = 0; x < w.b; x++) {
      const i = y * w.b + x;
      if (T.isVast(w, x, y)) muur[i] = 1;
      else if (T.opHetPlein(w, x, y) || T.waaromNietOpDezeGrond(D, x, y)) nee[i] = 1;
    }
  }
  return { muur, nee, b: w.b, h: w.h };
}

// Past een voet (b bij h) met zijn linkerbovenhoek op (x, y), met `lucht` tegels vrij eromheen?
function pastMetLucht(r, x, y, b, h, lucht) {
  if (x < lucht || y < lucht || x + b + lucht > r.b || y + h + lucht > r.h) return false;
  for (let yy = y - lucht; yy < y + h + lucht; yy++) {
    for (let xx = x - lucht; xx < x + b + lucht; xx++) {
      const i = yy * r.b + xx;
      if (r.muur[i]) return false;
      const rand = xx < x || xx >= x + b || yy < y || yy >= y + h;
      if (!rand && r.nee[i]) return false;
    }
  }
  return true;
}

// Past een erf (b bij h) met zijn linkerbovenhoek op (x, y)? Het hele vak moet vrij zijn.
function erfPast(r, x, y, b, h) {
  if (x < 1 || y < 1 || x + b + 1 > r.b || y + h + 1 > r.h) return false;
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + b; xx++) if (r.muur[yy * r.b + xx] || r.nee[yy * r.b + xx]) return false;
  return true;
}

// Alle plekken op volgorde van afstand tot het plein: het dorp groeit vanuit het midden.
function kandidaten(D) {
  const w = D.wereld;
  const c = w.marskramer || { x: w.b / 2, y: w.h / 2 };
  const lijst = [];
  for (let y = 1; y < w.h - 1; y++) for (let x = 1; x < w.b - 1; x++) lijst.push({ x, y, d: Math.hypot(x - c.x, y - c.y) });
  lijst.sort((a, b) => a.d - b.d || a.y - b.y || a.x - b.x);
  return lijst;
}

// Een gebouw klaar maken, zoals T.tikGebouwenDag dat na de bouwtijd doet.
function klaarMaken(g) {
  g.klaar = true;
  g.klaarOp = 0;
  g.wachtOpHout = false;
  if (g.voorwerp) g.voorwerp.inAanbouw = false;
}

function markeerVoet(r, g) {
  const v = T.voetVanGebouw(g);
  for (let yy = v.y; yy < v.y + v.h; yy++) for (let xx = v.x; xx < v.x + v.b; xx++) r.muur[yy * r.b + xx] = 1;
}

// Een gebouw neerzetten via het spel zelf (T.plaatsGebouw) en meteen klaar.
function zetGebouw(D, soort, r, kand, wijzer, lucht) {
  const tekening = T.volgendeTekening(D, soort);
  const voet = T.gebouwVoet(soort, tekening);
  const sleutel = soort + '|' + tekening + '|' + lucht;
  let i = wijzer[sleutel] || 0;
  for (; i < kand.length; i++) {
    const k = kand[i];
    if (!pastMetLucht(r, k.x, k.y, voet.b, voet.h, lucht)) continue;
    const res = T.plaatsGebouw(D, soort, k.x, k.y);
    if (!res.gelukt) continue; // het spel zegt nee waar mijn raster ja zei
    klaarMaken(res.instantie);
    markeerVoet(r, res.instantie);
    wijzer[sleutel] = i + 1;
    return res.instantie;
  }
  wijzer[sleutel] = i;
  return null;
}

// Een erf aanwijzen en een hut erop zetten, zoals een gezin dat doet (T.zetHutOpErf), en meteen klaar.
function zetErf(D, r, kand, wijzer) {
  const { b, h } = T.erfMaat();
  let i = wijzer.erf || 0;
  for (; i < kand.length; i++) {
    const k = kand[i];
    if (!erfPast(r, k.x, k.y, b, h)) continue;
    const res = T.legErfAan(D, k.x, k.y);
    if (!res.gelukt) continue;
    for (let yy = k.y; yy < k.y + h; yy++) for (let xx = k.x; xx < k.x + b; xx++) r.nee[yy * r.b + xx] = 1;
    const hut = T.zetHutOpErf(D, res.erf);
    if (!hut) return null;
    klaarMaken(hut);
    markeerVoet(r, hut);
    wijzer.erf = i + 1;
    return hut;
  }
  wijzer.erf = i;
  return null;
}

// Geef het dorp genoeg hout en goud voor het bouwen (alleen de meting).
function vulVoorraad(D) {
  for (const wat of ['hout', 'goud', 'steen', 'graan', 'hooi', 'bier']) T.zetVoorraad(D, wat, 1e9);
}

const WERKPLEKKEN = ['houthakker', 'steengroeve', 'kleiput', 'rietsnijder', 'jager', 'visser', 'smidse', 'timmerman', 'molen', 'bakkerij',
  'brouwerij', 'turfsteker', 'ertsgraver', 'kalkbrander', 'steenbakkerij', 'weverij', 'kuiper', 'slager', 'leerlooier', 'badhuis', 'gasthuis'];

const handenVan = (D) => D.gebouwen.reduce((s, g) => s + (g.klaar ? T.GEBOUWEN[g.soort].handen || 0 : 0), 0);

// De bewoners die onderweg zijn (een nieuw gezin komt over de weg) staan meteen bij hun deur, zoals bij het begin
// van een spel (js/bewoners.js, maakPoppetje zonder `bij`), en leven dan als elke andere.
function zetBijDeur(D) {
  const B = D.bewoners;
  const w = B.wereld;
  for (const a of B.komen) a.meteen = true; // niet op het bezoekuur wachten
  T.werkBewonersBij(D); // de poppetjes verschijnen, zoals het spel het doet
  for (const p of B.mensen) {
    const e = p.wezen;
    if (!p.komt || !e) continue;
    const deur = T.deurVan(w, p.huis);
    let plek = deur;
    for (let r = 0; r <= 3; r++) {
      const vrij = [];
      for (let y = deur.y - r; y <= deur.y + r; y++) {
        for (let x = deur.x - r; x <= deur.x + r; x++) {
          if (Math.max(Math.abs(x - deur.x), Math.abs(y - deur.y)) === r && T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e })) vrij.push({ x, y });
        }
      }
      if (vrij.length) {
        plek = vrij[0];
        break;
      }
    }
    e.x = e.tx = plek.x;
    e.y = e.ty = plek.y;
    e.pad = [];
    e.onderweg = false;
    delete p.komt;
  }
}

// Het hele dorp van N bewoners, op een kaart die zo groot is als nodig. opties: { werk: genoeg werkplekken,
// indeling: 'erven' | 'compact', kaart: minimale maat }. Laat het spel in een rustige stand achter.
function bouwDorp(S, N, opties = {}) {
  const D = S.dorp;
  const indeling = opties.indeling || 'erven';
  const lucht = opties.lucht != null ? opties.lucht : 2;
  vulVoorraad(D);
  const L0 = opties.kaart || S.wereld.b;
  const maten = [76, 100, 128, 160, 192, 224, 256, 288, 320, 384, 448, 512].filter((m) => m >= L0 && m <= (opties.maxKaart || Infinity));
  let reden = '';
  for (const L of maten) {
    vergroot(S, L);
    const kand = kandidaten(D);
    const wijzer = {};
    const r = maakRaster(D);
    D.woonruimte = T.telWoonruimte(D);
    // Hoeveel huizen, en hoeveel werkplekken erbij (naar rato, door elkaar, zodat er werk is waar men woont).
    const huizen = Math.max(0, Math.ceil((N - T.telWoonruimte(D)) / T.GEBOUWEN.hut.woonruimte));
    // Ongeveer vier op de vijf mensen kan werken (js/bewoners.js, T.LEEFTIJDEN: een kleuter niet), en een werkplek heeft gemiddeld 1,5 hand.
    const werkNodig = opties.werk ? Math.max(0, Math.ceil((0.85 * N - handenVan(D)) / 1.5)) : 0;
    let gehut = 0;
    let gewerkt = 0;
    let overgeslagen = 0;
    let mislukt = false;
    const totaal = huizen + werkNodig;
    for (let k = 0; k < totaal && !mislukt; k++) {
      // Verdeel de twee soorten gelijkmatig over de volgorde.
      const moetHuis = gehut < Math.round(((k + 1) * huizen) / totaal) || gewerkt >= werkNodig;
      if (moetHuis && gehut < huizen) {
        const g = indeling === 'erven' ? zetErf(D, r, kand, wijzer) : zetGebouw(D, 'hut', r, kand, wijzer, 1);
        if (!g) mislukt = true;
        else gehut++;
      } else if (gewerkt < werkNodig) {
        // Wat bij het bos, de rotsen of het water hoort (T.GEBOUWEN[soort].bij; vraag 112, c), past niet overal: lukt
        // het niet, dan de volgende soort.
        let g = null;
        for (let n = 0; n < WERKPLEKKEN.length && !g; n++) {
          const soort = WERKPLEKKEN[(gewerkt + overgeslagen) % WERKPLEKKEN.length];
          g = zetGebouw(D, soort, r, kand, wijzer, lucht);
          if (g || !T.GEBOUWEN[soort].bij) break;
          overgeslagen++;
        }
        if (!g) mislukt = true;
        else gewerkt++;
      }
    }
    if (mislukt) {
      reden = `geen plaats op ${L}×${L} na ${gehut} huizen en ${gewerkt} werkplekken (nodig: ${huizen} en ${werkNodig})`;
      continue;
    }
    D.woonruimte = T.telWoonruimte(D);
    const nodig = Math.max(0, N - D.bevolking);
    if (nodig) T.wijzigBevolking(D, nodig, 'groei'); // zoals het spel: T.bewonersVolgen (js/bewoners.js) doet de rest
    zetBijDeur(D);
    // Te weinig handen (een afronding)? Nog een paar werkplekken.
    if (opties.werk) {
      let extra = 0;
      while (handenVan(D) < T.werkendeHanden(D) && extra < 200) {
        const g = zetGebouw(D, WERKPLEKKEN[(gewerkt + extra) % WERKPLEKKEN.length], r, kand, wijzer, lucht);
        if (!g) break;
        extra++;
      }
      gewerkt += extra;
    }
    T.verdeelHanden(D);
    D.woonruimte = T.telWoonruimte(D);
    return { gelukt: true, L, huizen: gehut, werkplekken: gewerkt, gebouwen: D.gebouwen.length, bewoners: D.bewoners.mensen.length, wezens: S.wereld.wezens.length, indeling };
  }
  return { gelukt: false, reden };
}

module.exports = { T, vergroot, bouwDorp, maakRaster, kandidaten, zetGebouw, zetErf, vulVoorraad, zetBijDeur, klaarMaken, markeerVoet, handenVan };
