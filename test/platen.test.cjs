// De gebouwen uit Marcels platen (tegels/platen.js, gereedschap/blender/stijl/proef/gebouw_vel.py; Marcel, 1 nov): elk met de
// deur naar vier kanten en vijf bouwfasen, en in elke stijl de tekening van zijn soort.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const T = require('./laad.cjs').spel();
const WORTEL = path.join(__dirname, '..');
const tegels = T.TEGELS.platen.tiles;
const land = (stijl, trede = 'gehucht') => ({ trede, gebouwen: [], wereld: { stijl } });

test('elke tekening heeft zijn bestand, vijf bouwfasen, en een deur vlak buiten zijn voet aan de goede kant', () => {
  assert.equal(tegels.length, 16);
  for (const t of tegels) {
    assert.ok(fs.existsSync(path.join(WORTEL, t.bestand)), t.bestand);
    const f = T.BOUWFASEN.fasen[t.naam];
    assert.ok(f, `${t.naam}: bouwfasen`);
    assert.equal(f.fasen.length, 5, t.naam);
    assert.ok(fs.existsSync(path.join(WORTEL, 'tegels', f.bestand)), f.bestand);
    const [b, h] = t.beslaat;
    const [dx, dy] = t.deur;
    const kant = t.stijl.stand;
    assert.ok(kant === 'z' ? dy === h : kant === 'n' ? dy === -1 : kant === 'o' ? dx === b : dx === -1, `${t.naam}: de deur ${t.deur}`);
    assert.deepEqual(t.doos, [t.anker[0], t.anker[1], t.cel[2] - t.anker[0], t.cel[3] - t.anker[1]], t.naam);
  }
});

test('de burcht is het town hall, en de bakkerij, de molen en de stal hun eigen plaat, in elke stijl en met de deur naar elke kant', () => {
  const namen = { raadhuis: 'burcht', bakkerij: 'bakkerij', molen: 'molen', stal: 'stal' };
  for (const stijl of ['wit', 'oker', 'planken', 'roze']) {
    for (const [soort, naam] of Object.entries(namen)) {
      assert.deepEqual(T.stijlTekeningen(land(stijl, 'dorp'), soort), [`platen/${naam}-z`], `${stijl} ${soort}`);
      for (const kant of T.DEURKANTEN) assert.equal(T.metDeurNaar(`platen/${naam}-z`, kant), `platen/${naam}-${kant}`);
    }
  }
  for (const [soort, naam] of Object.entries(namen)) {
    assert.equal(T.GEBOUWEN[soort].tekening, `platen/${naam}-z`, 'ook in een land zonder stijl');
    const v = T.gebouwVoet(soort, T.GEBOUWEN[soort].tekening);
    assert.deepEqual(v, T.GEBOUWEN[soort].voet, `${soort}: de voet van de tekening`);
  }
});

test('een town hall dat al stond, houdt zijn tekening', () => {
  const oud = 'huizen/wit-raadhuis-riet-z';
  assert.equal(T.vormVan(oud), 'raadhuis');
  assert.equal(T.deurKantVan(oud), 'z');
  assert.equal(T.metDeurNaar(oud, 'o'), oud, 'hij draait niet meer: die soort heeft nu de plaat');
});
