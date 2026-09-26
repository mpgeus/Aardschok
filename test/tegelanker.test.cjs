// De wachter tegen de fout van 21 sep 2026: het erf en de toren stonden verankerd op het midden
// van hun voet in plaats van op de achterste hoek (ontwerp/kaarten.md, "Een tegelnummer verandert
// nooit" is de vorige zo'n wachter; dit is er een voor het ankerpunt). tegels/erf.tsx en
// tegels/toren.tsx volgden hun eigen rekensom in plaats van de afspraak die gereedschap/pixelart/
// naar-tiled.cjs bij de gebouwen al goed had, en pas in het spel — met de schout half in de put en
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
const zlib = require('zlib');

const TEGELS = path.join(__dirname, '..', 'tegels');
const TEGELS_JSON = JSON.parse(fs.readFileSync(path.join(TEGELS, 'tegels.json'), 'utf8'));

// Een klein, eigen PNG-lezertje: kern.cjs se png() (gereedschap/pixelart/kern.cjs) schrijft altijd
// 8-bit RGBA zonder interlace en met filtertype 0 (geen) op elke rij — dat is alles wat we hier
// terug hoeven te lezen, dus geen algemene PNG-decoder nodig. Geeft alleen het alfakanaal terug,
// dat is genoeg om te zien waar het plaatje niet-doorzichtig is.
const PNG_SIGNATUUR = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function leesAlfa(pad) {
  const buf = fs.readFileSync(pad);
  assert.ok(buf.subarray(0, 8).equals(PNG_SIGNATUUR), `${pad}: geen PNG`);
  let o = 8;
  let breedte = 0;
  let hoogte = 0;
  let bitdiepte = 0;
  let kleurtype = 0;
  const idat = [];
  while (o + 8 <= buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString('ascii', o + 4, o + 8);
    const data = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') {
      breedte = data.readUInt32BE(0);
      hoogte = data.readUInt32BE(4);
      bitdiepte = data[8];
      kleurtype = data[9];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    o += 8 + len + 4; // lengte + type + data + crc
  }
  assert.equal(bitdiepte, 8, `${pad}: verwacht 8-bit RGBA zoals kern.cjs se png() dat schrijft`);
  assert.equal(kleurtype, 6, `${pad}: verwacht kleurtype 6 (RGBA)`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = breedte * 4;
  const alfa = new Uint8Array(breedte * hoogte);
  for (let y = 0; y < hoogte; y++) {
    const rij = y * (stride + 1);
    assert.equal(raw[rij], 0, `${pad}: rij ${y} gebruikt een filter, kern.cjs se png() doet dat nooit`);
    for (let x = 0; x < breedte; x++) alfa[y * breedte + x] = raw[rij + 1 + x * 4 + 3];
  }
  return { breedte, hoogte, alfa };
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

// Hoeveel speling: een dakrand of een fundering steekt best een stukje buiten zijn eigen tegel.
// Gemeten aan alle huizen van gebouwen.tsx (waarvan het anker al goed stond) is dat een nette,
// bijna vaste 0,5 à 0,6 tegel, wat de plattegrond ook is — logisch, want de omlijning en de rand
// om het model (RAND in naar-tiled.cjs) zijn vaste maten, geen percentage van de voet. Gemeten aan
// de schuur vóór de fix (git-geschiedenis: tegels.json se erf.anker ging van [126, 129] naar
// [126, 145]) stak de onderste rij 1,2 tegel over de voorste hoek heen — dus 0,85 speling laat een
// dakrand met rust maar vangt de oude fout ruim.
const SPELING = 0.85;
// Bij een klein ding (hooguit 2×2, zoals de houtstapel of het kippenhok) is diezelfde vaste rand
// al een groot deel van de hele voet, en soms hoort er ook iets bij dat wijder uitwaaiert dan het
// hoofdgebouwtje (het kippenhok se hek, de overstekende blokken hout op de houtstapel) — die halen
// deze speling niet. Kleiner dan 3 tegels blijft daarom bij de eenvoudige toets hierboven: niet
// leeg, en (elders, T.isBegaanbaar) zijn hele voet vast. Zie ontwerp/kaarten.md.
const KRAP = 3;

for (const [velNaam, vel] of Object.entries(TEGELS_JSON)) {
  if (!vel.anker || !Array.isArray(vel.tiles)) continue;
  const metVoet = vel.tiles
    .map((t, id) => ({ ...t, id }))
    .filter((t) => t.naam && t.beslaat && (t.beslaat[0] > 1 || t.beslaat[1] > 1));
  if (!metVoet.length) continue;

  test(`${velNaam}.png: elke tegel met een voet heeft een gevulde cel, geen lege plek waar een plaatje hoort te staan`, () => {
    const png = velPng(vel.bestand);
    const kolommen = vel.kolommen || vel.tiles.length;
    for (const t of metVoet) {
      const x0 = (t.id % kolommen) * vel.tegelB;
      const y0 = Math.floor(t.id / kolommen) * vel.tegelH;
      assert.ok(ondersteRij(png, x0, y0, vel.tegelB, vel.tegelH), `${velNaam}/${t.naam}: de cel is helemaal leeg`);
    }
  });

  const ruim = metVoet.filter((t) => t.beslaat[0] >= KRAP || t.beslaat[1] >= KRAP);
  if (!ruim.length) continue;

  test(`${velNaam}.png: elke tegel met een ruime voet (3 tegels of meer) staat ook echt op die voet (het anker is de achterste hoek, niet het midden)`, () => {
    const png = velPng(vel.bestand);
    const kolommen = vel.kolommen || vel.tiles.length;
    for (const t of ruim) {
      const [bw, bd] = t.beslaat;
      const x0 = (t.id % kolommen) * vel.tegelB;
      const y0 = Math.floor(t.id / kolommen) * vel.tegelH;
      const rij = ondersteRij(png, x0, y0, vel.tegelB, vel.tegelH);

      // De twee uiteinden van de onderste rij, t.o.v. het anker, terug naar tegel-eenheden.
      const links = naarTegelDelta(rij.links - vel.anker[0], rij.y - vel.anker[1]);
      const rechts = naarTegelDelta(rij.rechts - vel.anker[0], rij.y - vel.anker[1]);
      // De voorste hoek van de voet (de tegel is de achterste hoek, "beslaat" telt vanaf daar naar
      // rechtsonder, zie js/kaart.js): in tegel-eenheden t.o.v. de aangeklikte tegel zelf.
      const voorTx = bw - 1;
      const voorTy = bd - 1;
      // De ruit van de voet loopt van de achterste hoek (-0,5, -0,5) tot de voorste (voorTx + 0,5,
      // voorTy + 0,5); "binnen de ruit vallen" is dus: geen van beide assen voorbij die voorste
      // hoek. (Een ondergrens richting de achterste hoek toetsen we niet: een rond ding als de
      // toren haalt zijn eigen hoeken toch nooit, dat zegt niets over het anker.)
      for (const [naam, p] of [['links', links], ['rechts', rechts]]) {
        assert.ok(
          p.tx <= voorTx + SPELING && p.ty <= voorTy + SPELING,
          `${velNaam}/${t.naam}: de onderste rij (${naam}) staat bij tegel (${p.tx.toFixed(2)}, ${p.ty.toFixed(2)}) — `
            + `dat is voorbij de voet van ${bw}×${bd} (tot (${voorTx}, ${voorTy})), het plaatje steekt over de rand van zijn voet heen — `
            + 'alsof het anker dichter naar het midden van de voet is verschoven dan naar de achterste hoek',
        );
      }
    }
  });
}
