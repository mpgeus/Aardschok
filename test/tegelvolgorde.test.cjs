// Toetst de vaste volgorde en vaste capaciteit van een tegelvel (gereedschap/pixelart/
// vaste-volgorde.cjs, gebruikt door naar-tiled.cjs — zie ontwerp/kaarten.md): dat een tegel
// toevoegen aan een vel geen enkel bestaand nummer verandert.
//
// Aanleiding: tegels/gebouwen.tsx groeide op 20 sep 2026 (commit 9f93c9f) van 15 naar 27 tegels,
// met de twaalf nieuwe gebouwen MIDDEN in de lijst (na dorpshuis5, vóór kapel) in plaats van
// achteraan. Elk vel na gebouwen in een kaart zou daardoor stilletjes de verkeerde plaatjes gaan
// tonen zodra er nog een boom of huis bijkomt. Tot 23 okt toetste dit bestand ook dat de twee
// proefkaarten uit Tiled die verhuizing goed doorstonden, uit een oude commit; die kaarten gingen weg
// in ronde 4 van het snoeien (ontwerp/snoeien.md).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { vasteVolgordeEnCapaciteit } = require('../gereedschap/pixelart/vaste-volgorde.cjs');

// Een eigen tijdelijke map per toets, zodat ze elkaar niet in de weg zitten en tegels/ zelf niet
// aangeraakt wordt.
function tijdelijkeMap(t) {
  const map = fs.mkdtempSync(path.join(os.tmpdir(), 'volgorde-'));
  t.after(() => fs.rmSync(map, { recursive: true, force: true }));
  return map;
}
const sleutels = (arr) => arr.map((k) => ({ key: k }));

// ---------------------------------------------------------------- vasteVolgordeEnCapaciteit

test('een nieuwe tegel komt achteraan: bestaande nummers veranderen niet, ook niet als de code hem ergens in het midden aanlevert', (t) => {
  const map = tijdelijkeMap(t);
  const eerst = vasteVolgordeEnCapaciteit(map, 'test', sleutels(['a', 'b', 'c']), 8, 4);
  assert.equal(eerst[0].key, 'a');
  assert.equal(eerst[1].key, 'b');
  assert.equal(eerst[2].key, 'c');
  assert.equal(eerst[3], null); // opgevuld tot een veelvoud van kolommen (4)

  // Precies wat er bij gebouwen.tsx gebeurde: de code levert een nieuwe tegel niet aan het eind
  // van zijn eigen lijst, maar er middenin — tussen "a" en "b".
  const tweede = vasteVolgordeEnCapaciteit(map, 'test', sleutels(['a', 'x', 'b', 'c']), 8, 4);
  assert.equal(tweede[0].key, 'a');
  assert.equal(tweede[1].key, 'b');
  assert.equal(tweede[2].key, 'c');
  assert.equal(tweede[4].key, 'x'); // nieuw: helemaal achteraan, niet tussen a en b
});

test('een tegel die uit de code verdwijnt, houdt zijn plek als lege cel — er schuift niets op', (t) => {
  const map = tijdelijkeMap(t);
  vasteVolgordeEnCapaciteit(map, 'test', sleutels(['a', 'b', 'c']), 8, 4);
  const na = vasteVolgordeEnCapaciteit(map, 'test', sleutels(['a', 'c']), 8, 4);
  assert.equal(na[0].key, 'a');
  assert.equal(na[1], null); // b is weg, maar zijn nummer blijft leeg, niet hergebruikt
  assert.equal(na[2].key, 'c');
});

test('een uitbreiding rondt af op een veelvoud van kolommen, zodat een stempelblok nooit half begint', (t) => {
  const map = tijdelijkeMap(t);
  vasteVolgordeEnCapaciteit(map, 'test', sleutels(['a', 'b', 'c']), 16, 4);
  const na = vasteVolgordeEnCapaciteit(map, 'test', sleutels(['a', 'b', 'c', 'd', 'e']), 16, 4);
  assert.equal(na[3], null); // opvulling tot een veelvoud van 4
  assert.equal(na[4].key, 'd'); // d en e beginnen aan een nieuwe rij, niet halverwege
  assert.equal(na[5].key, 'e');
});

test('geen ruimte meer: een duidelijke fout in plaats van een tegel die stilzwijgend verdwijnt', (t) => {
  const map = tijdelijkeMap(t);
  assert.throws(() => vasteVolgordeEnCapaciteit(map, 'test', sleutels(['a', 'b', 'c', 'd', 'e']), 4, 4));
});

test('de bevroren volgorde overleeft een nieuwe run: dezelfde tegels geven weer dezelfde plekken', (t) => {
  const map = tijdelijkeMap(t);
  const items = sleutels(['a', 'b', 'c']);
  const eerst = vasteVolgordeEnCapaciteit(map, 'test', items, 8, 4).map((it) => it && it.key);
  const tweede = vasteVolgordeEnCapaciteit(map, 'test', items, 8, 4).map((it) => it && it.key);
  assert.deepEqual(eerst, tweede);
});
