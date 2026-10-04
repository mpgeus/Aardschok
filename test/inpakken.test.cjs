// De vellen zijn ingepakt (werklijst vraag 114, 2a; gereedschap/pixelart/inpakken.cjs): elke tekening strak gesneden,
// met zijn eigen rechthoek en anker, en de huizen en de gebouwen elk in een eigen bestand (vraag 114, stap 1). Deze toets
// kijkt na dat het inpakken een tekening niet verandert (alleen waar hij staat), en dat wat het spel laadt klopt: elke
// cel op zijn vel, geen twee op elkaar, geen vel groter dan een videokaart aankan, elke tekening van de huizen en de
// gebouwen in zijn eigen bestand, en elk vel met bouwfasen bestaat.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const I = require('../gereedschap/pixelart/inpakken.cjs');
const T = require('./laad.cjs').spel();

const WORTEL = path.join(__dirname, '..');

// Een klein beeld met een paar gekleurde rechthoeken erin.
function beeldMet(b, h, vlakken) {
  const beeld = I.leegBeeld(b, h);
  for (const [x0, y0, x1, y1, kleur] of vlakken) {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) beeld.rgba.writeUInt32BE(kleur, (y * b + x) * 4);
  }
  return beeld;
}
// De pixel op (dx, dy) vanaf het anker van een tegel, of 0 buiten zijn cel.
function rondAnker(beeld, { cel, anker }, dx, dy) {
  const x = cel[0] + anker[0] + dx;
  const y = cel[1] + anker[1] + dy;
  if (x < cel[0] || y < cel[1] || x >= cel[0] + cel[2] || y >= cel[1] + cel[3]) return 0;
  return beeld.rgba.readUInt32BE((y * beeld.b + x) * 4);
}

test('inpakken verandert een tekening niet: dezelfde pixels rond hetzelfde anker, alleen strakker', () => {
  // drie cellen van 20 bij 30 naast elkaar, het anker op (10, 25); de middelste is leeg
  const raster = beeldMet(60, 30, [[3, 4, 12, 26, 0xff0000ff], [44, 10, 58, 30, 0x00ff00ff], [50, 2, 52, 8, 0x0000ffff]]);
  const tegels = [0, 1, 2].map((i) => ({ cel: [i * 20, 0, 20, 30], anker: [10, 25] }));
  const { beeld, tegels: nieuw } = I.pakVelIn(raster, tegels);
  assert.equal(nieuw[1], null, 'een lege cel komt niet op het vel');
  assert.deepEqual(nieuw[0].cel.slice(2), [9, 22], 'strak gesneden');
  assert.deepEqual(nieuw[2].cel.slice(2), [14, 28]);
  for (const i of [0, 2]) {
    for (let dy = -30; dy < 10; dy++) {
      for (let dx = -20; dx < 20; dx++) assert.equal(rondAnker(beeld, nieuw[i], dx, dy), rondAnker(raster, tegels[i], dx, dy), `tegel ${i} op (${dx}, ${dy})`);
    }
  }
  // met houdHoogte blijft de hoogte van de cel (de wind buigt naar de hoogte in de cel)
  const metWind = I.pakVelIn(raster, tegels, { houdHoogte: true });
  assert.equal(metWind.tegels[0].cel[3], 30);
  assert.equal(metWind.tegels[0].anker[1], 25);
});

test('los snijden verandert een tekening niet: elk een eigen beeld, strak, rond hetzelfde anker', () => {
  const raster = beeldMet(60, 30, [[3, 4, 12, 26, 0xff0000ff], [44, 10, 58, 30, 0x00ff00ff], [50, 2, 52, 8, 0x0000ffff]]);
  const tegels = [0, 1, 2].map((i) => ({ cel: [i * 20, 0, 20, 30], anker: [10, 25] }));
  const los = I.snijLos(raster, [...tegels, null]);
  assert.equal(los[1], null, 'een lege cel geeft geen bestand');
  assert.equal(los[3], null);
  assert.deepEqual(los[0].cel, [0, 0, 9, 22], 'strak gesneden, en de cel is het hele beeld');
  assert.deepEqual([los[2].beeld.b, los[2].beeld.h], [14, 28]);
  for (const i of [0, 2]) {
    for (let dy = -30; dy < 10; dy++) {
      for (let dx = -20; dx < 20; dx++) assert.equal(rondAnker(los[i].beeld, los[i], dx, dy), rondAnker(raster, tegels[i], dx, dy), `tegel ${i} op (${dx}, ${dy})`);
    }
  }
  // Hetzelfde als op een ingepakt vel: alleen staat elke tekening in een eigen beeld.
  const vel = I.pakVelIn(raster, tegels);
  for (const i of [0, 2]) assert.deepEqual(los[i].anker, vel.tegels[i].anker);
});

test('krimpen houdt het raster, maakt de cel zo klein als wat erin staat, en doet een tweede keer niets', () => {
  const raster = beeldMet(40, 40, [[5, 6, 9, 15, 0xff0000ff], [22, 8, 30, 12, 0x00ff00ff], [4, 28, 8, 34, 0x0000ffff]]);
  const k = I.krimpRaster(raster, [20, 20], [10, 18]);
  assert.ok(k.gekrompen);
  assert.deepEqual(k.cel, [8, 9]); // binnen een cel: x van 2 tot 10, y van 6 tot 15
  assert.deepEqual(k.anker, [8, 12]);
  assert.equal(k.beeld.b, 16);
  assert.equal(k.beeld.h, 18);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      for (let dy = -20; dy < 20; dy++) {
        for (let dx = -20; dx < 20; dx++) {
          assert.equal(
            rondAnker(k.beeld, { cel: [c * 8, r * 9, 8, 9], anker: k.anker }, dx, dy),
            rondAnker(raster, { cel: [c * 20, r * 20, 20, 20], anker: [10, 18] }, dx, dy),
          );
        }
      }
    }
  }
  assert.equal(I.krimpRaster(k.beeld, k.cel, k.anker).gekrompen, false);
});

// De maat van een PNG uit zijn kop, zonder hem uit te pakken.
function maatVan(pad) {
  const buf = fs.readFileSync(pad);
  return { b: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
const overlapt = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

test('elk ingepakt vel in tegels/: elke tegel met een naam op zijn vel, geen twee op elkaar, niet te groot', () => {
  const ingepakt = Object.entries(T.TEGELS).filter(([, v]) => v.ingepakt && !v.perTekening);
  assert.deepEqual(ingepakt.map(([n]) => n).sort(), ['begroeiing', 'bomen', 'erf', 'tuin']);
  for (const [naam, vel] of ingepakt) {
    const { b, h } = maatVan(path.join(WORTEL, vel.bestand));
    assert.equal(b, vel.breedte, `${naam}: de breedte in tegels.js`);
    assert.equal(h, vel.hoogte, `${naam}: de hoogte in tegels.js`);
    assert.ok(Math.max(b, h) <= I.MAX_ZIJDE, `${naam}: ${b}×${h}`);
    const cellen = [];
    vel.tiles.forEach((t, id) => {
      if (!t.naam) return;
      const plek = T.sprites.celVan(naam, id);
      assert.ok(plek, `${naam}/${t.naam}: geen cel`);
      const [x, y, cb, ch] = plek.cel;
      assert.ok(x >= 0 && y >= 0 && cb > 0 && ch > 0 && x + cb <= b && y + ch <= h, `${naam}/${t.naam}: de cel valt buiten het vel`);
      for (const ander of cellen) assert.ok(!overlapt(plek.cel, ander.cel), `${naam}/${t.naam} ligt op ${ander.naam}`);
      cellen.push({ naam: t.naam, cel: plek.cel });
    });
  }
});

test('een vel per tekening: de huizen en de gebouwen elk in een eigen bestand, strak, en niets anders in de map', () => {
  const perTekening = Object.entries(T.TEGELS).filter(([, v]) => v.perTekening);
  assert.deepEqual(perTekening.map(([n]) => n).sort(), ['gebouwen', 'huizen']);
  for (const [naam, vel] of perTekening) {
    assert.ok(vel.ingepakt && !vel.bestand, `${naam}: elke tegel een eigen cel en anker, en geen vel van zichzelf`);
    assert.ok(!fs.existsSync(path.join(WORTEL, 'tegels', `${naam}.png`)), `${naam}: het ene vel van vóór 4 okt is weg`);
    const bestanden = [];
    vel.tiles.forEach((t, id) => {
      if (!t.naam) return;
      assert.equal(t.bestand, `tegels/${naam}/${t.naam}.png`, `${naam}/${t.naam}: zijn eigen bestand`);
      const beeld = I.leesPng(path.join(WORTEL, t.bestand));
      assert.deepEqual(T.sprites.celVan(naam, id).cel, [0, 0, beeld.b, beeld.h], `${naam}/${t.naam}: de cel is het hele bestand`);
      assert.deepEqual(I.grens(beeld, [0, 0, beeld.b, beeld.h]), [0, 0, beeld.b, beeld.h], `${naam}/${t.naam}: strak gesneden`);
      bestanden.push(`${t.naam}.png`);
    });
    assert.deepEqual(fs.readdirSync(path.join(WORTEL, 'tegels', naam)).sort(), bestanden.sort(), `${naam}: in de map staat alleen wat in tegels.js staat`);
  }
});

test('de bouwfasen: elk gebouw een eigen vel, en elke fase op dat vel', () => {
  const B = T.BOUWFASEN;
  assert.ok(Object.keys(B.fasen).length >= 30);
  assert.ok(!fs.existsSync(path.join(WORTEL, 'tegels', 'bouwfasen.png')), 'het ene grote vel van vóór 4 okt is weg');
  for (const [naam, g] of Object.entries(B.fasen)) {
    const pad = path.join(WORTEL, 'tegels', g.bestand);
    assert.ok(fs.existsSync(pad), `${naam}: ${g.bestand} bestaat niet`);
    const { b, h } = maatVan(pad);
    assert.equal(g.fasen.length, 5, `${naam}: vijf fases`);
    for (const f of g.fasen) assert.ok(f.x >= 0 && f.y >= 0 && f.x + f.b <= b && f.y + f.h <= h, `${naam}/${f.naam}: buiten zijn vel`);
  }
});

test('de figuren: een raster, met een cel per beeld en een rij per kijkrichting', () => {
  const F = T.BEELDEN.figuren;
  for (const [naam, f] of Object.entries(F)) {
    for (const [h, o] of Object.entries(f.houdingen)) {
      const cel = o.cel || f.cel;
      const { b, h: hoog } = maatVan(path.join(WORTEL, 'beelden', 'figuren', o.bestand));
      assert.equal(b, o.beelden * cel[0], `${naam}/${h}: de breedte is beelden maal cel`);
      assert.equal(hoog, f.richtingen.length * cel[1], `${naam}/${h}: de hoogte is richtingen maal cel`);
    }
  }
});
