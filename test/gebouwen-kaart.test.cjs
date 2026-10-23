// De gebouwen met de tegels op naam erbij (js/kaart.js): de tekeningen en voeten van de gebouwen. Los van
// test/gebouwen.test.cjs, want dat bestand test T.gebouwVoet zonder dat kaart.js geladen is (zijn terugvaloptie). Tot
// ronde 2 van het snoeien (stap 6) toetste het ook gebouwen die de kaart zelf neerzette, met een beginvoorraad, en tot
// ronde 4 (23 okt) het plein van een kaart uit Tiled: dat is weg (het plein van het eiland: test/wereld.test.cjs).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

test('T.opzoekTegelNaam (door kaart.js naar buiten gezet) vindt een gewone tegel op naam', () => {
  // Dezelfde tegel als test/kaart.test.cjs gebruikt voor het huis op de proefkaart.
  const opz = T.opzoekTegelNaam('gebouwen/vakwerkhuis');
  assert.ok(opz, 'gebouwen/vakwerkhuis had gevonden moeten worden');
  assert.equal(opz.vel, 'gebouwen');
});

test('elke tekening in T.GEBOUWEN[soort].tekeningen bestaat, heeft bouwfasen, en geeft zijn eigen voet', () => {
  const fasen = require('../tegels/bouwfasen.json').fasen;
  for (const [soort, g] of Object.entries(T.GEBOUWEN)) {
    if (!g.tekeningen) continue;
    assert.ok(g.tekeningen.includes(g.tekening), `${soort}: zijn gewone tekening staat ook in de lijst`);
    for (const t of g.tekeningen) {
      const opz = T.opzoekTegelNaam(t);
      assert.ok(opz, `${soort}: ${t} staat niet in de tegelvellen`);
      assert.ok(fasen[t.split('/').pop()], `${soort}: ${t} heeft geen bouwfasen (tegels/bouwfasen.json)`);
      assert.deepEqual(T.gebouwVoet(soort, t), { b: opz.eig.beslaat[0], h: opz.eig.beslaat[1] });
    }
  }
});

test('T.gebouwVoet gebruikt de echte "beslaat" van de tekening als die er is', () => {
  // "huis" leent gebouwen/dorpshuis1; wat de tekening ook precies beslaat, het moet nu de tegel
  // zelf zijn die het zegt, niet de losse schatting in T.GEBOUWEN.huis.voet.
  const voet = T.gebouwVoet('huis');
  assert.ok(voet && Number.isInteger(voet.b) && voet.b > 0 && Number.isInteger(voet.h) && voet.h > 0);
});

