// De wachter tegen de fout van 21 sep 2026: het erf en de toren stonden verankerd op het midden
// van hun voet in plaats van op de achterste hoek (ontwerp/kaarten.md, "Een tegelnummer verandert
// nooit" is de vorige zo'n wachter; dit is er een voor het ankerpunt). tegels/erf.tsx en
// tegels/toren.tsx volgden hun eigen rekensom in plaats van de afspraak die gereedschap/pixelart/
// naar-tiled.cjs bij de gebouwen al goed had, en pas in het spel — met de aanvoerder half in de put en
// tegen de wand van de schuur — viel het op.
//
// Deze toets meet het na op het vel zelf, zonder scherm: voor elke tegel met een "beslaat" groter
// dan één bij één (dus met een achterste-hoek-anker, geen voetpunt zoals een boom) zoekt hij op het
// PNG waar de onderste rij niet-doorzichtige pixels ligt, en rekent om waar die rij zou vallen op
// het wereldraster als je het anker op T.naarScherm(mx, my) van de aangeklikte tegel legt (precies
// wat js/sprites.js doet, zie de uitleg bij "anker" in naar-tiled.cjs). Die rij hoort dicht bij de
// voorste rand van de voet te liggen — niet een heel stuk ervoor (te vroeg verankerd, de fout van
// vandaag) en niet er ver voorbij (op de grond ernaast).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { leesPng } = require('../gereedschap/pixelart/kern.cjs');

const TEGELS = path.join(__dirname, '..', 'tegels');
// Het spel zoals het draait: waar een tegel op zijn vel staat, vraagt deze toets aan T.sprites.celVan (js/sprites.js),
// net als het tekenen. Een ingepakt vel zegt het per tegel, een raster (de grond) uit zijn kolommen.
const T = require('./laad.cjs').spel();

// Alleen het alfakanaal: dat is genoeg om te zien waar het plaatje niet-doorzichtig is.
function leesAlfa(pad) {
  const { b, h, rgba } = leesPng(pad);
  const alfa = new Uint8Array(b * h);
  for (let i = 0; i < alfa.length; i++) alfa[i] = rgba[i * 4 + 3];
  return { breedte: b, hoogte: h, alfa };
}

// De onderste rij niet-doorzichtige pixels binnen één cel (x0, y0, cb, ch) van het vel, en het
// meest linkse en rechtse punt daarin. null als de cel leeg is (een gereserveerde lege plek).
function ondersteRij({ breedte, alfa }, x0, y0, cb, ch) {
  let laatsteY = -1;
  for (let y = ch - 1; y >= 0; y--) {
    let gevonden = false;
    for (let x = 0; x < cb; x++) if (alfa[(y0 + y) * breedte + (x0 + x)] !== 0) { gevonden = true; break; }
    if (gevonden) { laatsteY = y; break; }
  }
  if (laatsteY < 0) return null;
  let links = cb;
  let rechts = -1;
  for (let x = 0; x < cb; x++) {
    if (alfa[(y0 + laatsteY) * breedte + (x0 + x)] === 0) continue;
    if (x < links) links = x;
    if (x > rechts) rechts = x;
  }
  return { y: laatsteY, links, rechts };
}

// Een schermpunt (dx, dy) t.o.v. het anker terugrekenen naar tegel-eenheden t.o.v. de aangeklikte
// tegel: de omgekeerde som van T.naarScherm (js/iso.js), HB = 32, HH = 16.
function naarTegelDelta(dx, dy) {
  return { tx: (dx / 32 + dy / 16) / 2, ty: (dy / 16 - dx / 32) / 2 };
}

const velCache = new Map();
function velPng(bestand) {
  if (!velCache.has(bestand)) velCache.set(bestand, leesAlfa(path.join(TEGELS, bestand.replace(/^tegels\//, ''))));
  return velCache.get(bestand);
}
// Het plaatje waarop een tegel staat: zijn eigen bestand (de huizen en de gebouwen, een vel per tekening; werklijst
// vraag 114, stap 1), of het vel.
const pngVan = (vel, t) => velPng(t.bestand || vel.bestand);

// Hoeveel speling: een dakrand of een fundering steekt best een stukje buiten zijn eigen tegel.
// Gemeten aan alle huizen van gebouwen.tsx (waarvan het anker al goed stond) is dat een nette,
// bijna vaste 0,5 à 0,6 tegel, wat de plattegrond ook is — logisch, want de omlijning en de rand
// om het model (RAND in naar-tiled.cjs) zijn vaste maten, geen percentage van de voet. Gemeten aan
// de schuur vóór de fix (git-geschiedenis: tegels.json se erf.anker ging van [126, 129] naar
// [126, 145]) stak de onderste rij 1,2 tegel over de voorste hoek heen — dus 0,85 speling laat een
// dakrand met rust maar vangt de oude fout ruim. Sinds de bouwstijlen (vraag 114, stap 2a) 0,9: de L-hut van de stijl
// wit met zijn deur op de gevel van zijn vleugel heeft daar een stoep die 0,86 tegel over de voorste hoek steekt.
const SPELING = 0.9;
// Bij een klein ding (hooguit 2×2, zoals de houtstapel of het kippenhok) is diezelfde vaste rand
// al een groot deel van de hele voet, en soms hoort er ook iets bij dat wijder uitwaaiert dan het
// hoofdgebouwtje (het kippenhok se hek, de overstekende blokken hout op de houtstapel) — die halen
// deze speling niet. Kleiner dan 3 tegels blijft daarom bij de eenvoudige toets hierboven: niet
// leeg, en (elders, T.isBegaanbaar) zijn hele voet vast. Zie ontwerp/kaarten.md.
const KRAP = 3;

for (const [velNaam, vel] of Object.entries(T.TEGELS)) {
  if (!Array.isArray(vel.tiles)) continue;
  const metVoet = vel.tiles
    .map((t, id) => ({ ...t, id }))
    .filter((t) => t.naam && t.beslaat && (t.beslaat[0] > 1 || t.beslaat[1] > 1));
  if (!metVoet.length) continue;

  test(`${velNaam}: elke tegel met een voet heeft een gevulde cel, geen lege plek waar een plaatje hoort te staan`, () => {
    for (const t of metVoet) {
      const png = pngVan(vel, t);
      const plek = T.sprites.celVan(velNaam, t.id);
      assert.ok(plek, `${velNaam}/${t.naam}: staat nergens op het vel`);
      const [x0, y0, cb, ch] = plek.cel;
      assert.ok(x0 >= 0 && y0 >= 0 && x0 + cb <= png.breedte && y0 + ch <= png.hoogte, `${velNaam}/${t.naam}: de cel valt buiten het vel`);
      assert.ok(ondersteRij(png, x0, y0, cb, ch), `${velNaam}/${t.naam}: de cel is helemaal leeg`);
    }
  });

  const ruim = metVoet.filter((t) => t.beslaat[0] >= KRAP || t.beslaat[1] >= KRAP);
  if (!ruim.length) continue;

  test(`${velNaam}: elke tegel met een ruime voet (3 tegels of meer) staat ook echt op die voet (het anker is de achterste hoek, niet het midden)`, () => {
    for (const t of ruim) {
      const png = pngVan(vel, t);
      const [bw, bd] = t.beslaat;
      const { cel: [x0, y0, cb, ch], anker } = T.sprites.celVan(velNaam, t.id);
      const rij = ondersteRij(png, x0, y0, cb, ch);

      // De twee uiteinden van de onderste rij, t.o.v. het anker, terug naar tegel-eenheden.
      const links = naarTegelDelta(rij.links - anker[0], rij.y - anker[1]);
      const rechts = naarTegelDelta(rij.rechts - anker[0], rij.y - anker[1]);
      // De platen van Marcel staan op een ronde grasvoet: die is onderaan plat en raakt de ruit alleen in de hoek, dus daar
      // telt het midden van de rij. Zonder voet (de hut) is de onderste rij de stoep met zijn schaduw, die niet recht onder
      // het midden ligt en een paar pixels buiten de ruit valt; een anker op het midden van de voet scheelt 3 tegels.
      const midden = naarTegelDelta((rij.links + rij.rechts) / 2 - anker[0], rij.y - anker[1]);
      const punten = velNaam === 'platen' ? [['midden', midden]] : [['links', links], ['rechts', rechts]];
      const speling = velNaam === 'platen' ? 1.5 : SPELING;
      // De voorste hoek van de voet (de tegel is de achterste hoek, "beslaat" telt vanaf daar naar
      // rechtsonder, zie js/kaart.js): in tegel-eenheden t.o.v. de aangeklikte tegel zelf.
      const voorTx = bw - 1;
      const voorTy = bd - 1;
      // De ruit van de voet loopt van de achterste hoek (-0,5, -0,5) tot de voorste (voorTx + 0,5,
      // voorTy + 0,5); "binnen de ruit vallen" is dus: geen van beide assen voorbij die voorste
      // hoek. (Een ondergrens richting de achterste hoek toetsen we niet: een rond ding als de
      // toren haalt zijn eigen hoeken toch nooit, dat zegt niets over het anker.)
      for (const [naam, p] of punten) {
        assert.ok(
          p.tx <= voorTx + speling && p.ty <= voorTy + speling,
          `${velNaam}/${t.naam}: de onderste rij (${naam}) staat bij tegel (${p.tx.toFixed(2)}, ${p.ty.toFixed(2)}) — `
            + `dat is voorbij de voet van ${bw}×${bd} (tot (${voorTx}, ${voorTy})), het plaatje steekt over de rand van zijn voet heen — `
            + 'alsof het anker dichter naar het midden van de voet is verschoven dan naar de achterste hoek',
        );
      }
    }
  });
}
