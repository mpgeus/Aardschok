// Toetst de vaste volgorde en vaste capaciteit van een tegelvel (gereedschap/pixelart/
// vaste-volgorde.cjs, gebruikt door naar-tiled.cjs — zie ontwerp/kaarten.md): dat een tegel
// toevoegen aan een vel geen enkel bestaand nummer verandert, en dat kaarten/proef.tmj en
// kaarten/proefbos.tmj, verhuisd naar de nieuwe nummers op 21 sep 2026, nog dezelfde tegels tonen
// als vóór die verhuizing.
//
// Aanleiding: tegels/gebouwen.tsx groeide op 20 sep 2026 (commit 9f93c9f) van 15 naar 27 tegels,
// met de twaalf nieuwe gebouwen MIDDEN in de lijst (na dorpshuis5, vóór kapel) in plaats van
// achteraan. Elk vel na gebouwen in een kaart zou daardoor stilletjes de verkeerde plaatjes gaan
// tonen zodra er nog een boom of huis bijkomt. Deze toets houdt twee dingen tegelijk vast: de
// bouwsteen die dat voortaan voorkomt, en dat de eenmalige verhuizing zelf goed ging.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { vasteVolgordeEnCapaciteit } = require('../gereedschap/pixelart/vaste-volgorde.cjs');

const WORTEL = path.join(__dirname, '..');

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

// ---------------------------------------------------------------- de verhuisde proefkaarten
//
// kaarten/proef.tmj en kaarten/proefbos.tmj zijn met de hand in Tiled getekend, met de nummers
// van vóór commit 9f93c9f. Deze toets laadt elke kaart twee keer: zoals hij toen was (uit git,
// met de tegels.json van dat moment) en zoals hij nu is (van schijf), en vergelijkt elke
// grondtegel en elk voorwerp op NAAM — nooit op nummer, want de nummers zijn juist expres
// veranderd. Zelfde opzoeking als js/kaart.js se bouwOpzoeker, hier met een los meegegeven
// tegels.json in plaats van T.TEGELS, zodat de oude en de nieuwe stand naast elkaar kunnen staan.
const VOOR_COMMIT = '9f93c9f'; // "Beeld: twaalf nieuwe gebouwen naar referentie een, en een aanbouw"

function git(...args) {
  return execFileSync('git', args, { cwd: WORTEL, encoding: 'utf8' });
}
function laadUitGit(commit, bestand) {
  return JSON.parse(git('show', `${commit}:${bestand}`));
}
function velNaamVan(bron) {
  return String(bron || '').replace(/\\/g, '/').split('/').pop().replace(/\.tsx$/i, '');
}
function opzoekerVoor(kaart, tegelsJson) {
  const sets = (kaart.tilesets || []).map((t) => {
    const vel = tegelsJson[velNaamVan(t.source)];
    return { firstgid: t.firstgid || 1, aantal: vel ? vel.tiles.length : 0, vel };
  });
  return (gid) => {
    const g = gid & 0x1fffffff; // spiegel/draai-vlaggen (Tiled) wegdoen
    if (!g) return null;
    for (const s of sets) {
      const lokaal = g - s.firstgid;
      if (s.vel && lokaal >= 0 && lokaal < s.aantal) {
        const eig = s.vel.tiles[lokaal];
        return eig ? eig.naam : null;
      }
    }
    return null;
  };
}
function namenUit(kaart, tegelsJson) {
  const opzoek = opzoekerVoor(kaart, tegelsJson);
  const grond = [];
  const voorwerpen = [];
  for (const laag of kaart.layers || []) {
    if (laag.type === 'tilelayer' && Array.isArray(laag.data)) {
      const breedte = laag.width;
      laag.data.forEach((gid, i) => {
        if (gid) grond.push([i % breedte, Math.floor(i / breedte), opzoek(gid)]);
      });
    } else if (laag.type === 'objectgroup') {
      for (const obj of laag.objects || []) {
        if (obj.gid) voorwerpen.push(`${obj.name || obj.id}:${opzoek(obj.gid)}`);
      }
    }
  }
  return { grond, voorwerpen };
}

for (const bestand of ['proef.tmj', 'proefbos.tmj']) {
  test(`${bestand}: elke tegel en elk voorwerp toont dezelfde naam als vóór de verhuizing (commit ${VOOR_COMMIT})`, () => {
    const voor = namenUit(laadUitGit(VOOR_COMMIT, `kaarten/${bestand}`), laadUitGit(VOOR_COMMIT, 'tegels/tegels.json'));
    const na = namenUit(
      JSON.parse(fs.readFileSync(path.join(WORTEL, 'kaarten', bestand), 'utf8')),
      JSON.parse(fs.readFileSync(path.join(WORTEL, 'tegels', 'tegels.json'), 'utf8')),
    );

    assert.equal(na.grond.length, voor.grond.length, 'evenveel grondtegels als voorheen');
    for (let i = 0; i < voor.grond.length; i++) {
      const [x, y, naam] = voor.grond[i];
      const [nx, ny, nnaam] = na.grond[i];
      assert.equal(`${nx},${ny}`, `${x},${y}`, `tegel ${i} staat nog op dezelfde plek`);
      assert.equal(nnaam, naam, `(${x}, ${y}) toonde "${naam}" en toont nu "${nnaam}"`);
    }
    assert.deepEqual(na.voorwerpen.sort(), voor.voorwerpen.sort(), 'dezelfde voorwerpen, dezelfde namen');
  });
}
