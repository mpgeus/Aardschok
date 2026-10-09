// De bladzijde met alle getallen (gereedschap/instellingen.html, werklijst vraag 142): de lezer in
// gereedschap/instellingen/bron.js leest elk getal uit de bestanden zelf, en schrijft er precies één terug.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WORTEL = path.join(__dirname, '..');
const I = require('../gereedschap/instellingen/bron.js');
const T = require('./laad.cjs').spel();

const bronnen = {};
for (const f of fs.readdirSync(path.join(WORTEL, 'js')).filter((f) => f.endsWith('.js')).sort()) {
  bronnen['js/' + f] = fs.readFileSync(path.join(WORTEL, 'js', f), 'utf8');
}
const model = I.model(bronnen);

test('elk getal van de werkbank leest de bladzijde zoals het spel het heeft', () => {
  let gezien = 0;
  for (const o of model.onderwerpen) {
    for (const b of o.bladen) {
      if (b.soort !== 'getal' && b.soort !== 'waar') continue;
      if (!T.WERKBANK.some((d) => d.blok === b.blok || (d.losse && b.blok in d.losse))) continue;
      assert.equal(T.leesPad([b.blok, ...b.pad].join('.')), b.waarde, `${b.blok}.${b.pad.join('.')}`);
      gezien++;
    }
  }
  assert.ok(gezien > 800, `${gezien} getallen`);
});

test('de bladzijde kent elk instellingenblok, de spelregels en de gebouwen', () => {
  const blokken = new Set(model.onderwerpen.map((o) => o.blok).filter(Boolean));
  for (const tekst of Object.values(bronnen)) {
    for (const n of I.blokkenIn(tekst)) {
      if (/_INSTELLINGEN$/.test(n) && !I.VERBORGEN.has(n)) assert.ok(blokken.has(n), `${n} staat niet op de bladzijde`);
    }
  }
  assert.equal(model.spelregels.length, T.OPTIES.length);
  for (const r of model.spelregels) {
    const o = T.OPTIES.find((x) => x.id === r.id);
    assert.ok(o, r.id);
    assert.equal(r.standaard, o.standaard, r.id);
    assert.deepEqual(r.keuzes.map((k) => k.id), o.keuzes.map((k) => k.id), r.id);
  }
  assert.deepEqual(model.gebouwen.map((g) => g.soort), Object.keys(T.GEBOUWEN));
});

test('een getal schrijven verandert alleen dat getal, en het commentaar blijft staan', () => {
  const tekst = bronnen['js/akkers.js'];
  const nieuw = I.zet(tekst, 'SCHOVEN_INSTELLINGEN', ['zwadGrens'], 6);
  const voor = tekst.split(/\r?\n/);
  const na = nieuw.split(/\r?\n/);
  assert.equal(na.length, voor.length);
  const anders = voor.map((r, i) => (r !== na[i] ? i : -1)).filter((i) => i >= 0);
  assert.equal(anders.length, 1);
  assert.match(na[anders[0]], /^\s*zwadGrens: 6,$/);
  assert.equal(I.knoopOp(I.leesBlok(nieuw, 'SCHOVEN_INSTELLINGEN').waarde, ['zwadGrens']).waarde, 6);
  // Een ingesprongen getal, een schakelaar, een getal in een lijst, een gebouw en de standaard van een spelregel.
  assert.equal(I.knoopOp(I.leesBlok(I.zet(bronnen['js/vee.js'], 'VEE_INSTELLINGEN', ['scheren', 'dag'], 3), 'VEE_INSTELLINGEN').waarde, ['scheren', 'dag']).waarde, 3);
  assert.equal(I.knoopOp(I.leesBlok(I.zet(tekst, 'SCHOVEN_INSTELLINGEN', ['dagloners'], false), 'SCHOVEN_INSTELLINGEN').waarde, ['dagloners']).waarde, false);
  const zout = I.zet(bronnen['js/handel.js'], 'HANDEL_INSTELLINGEN', ['verkoopt', 'zout', 'heeft', 2], 50);
  assert.ok(zout.includes('heeft: [15, 15, 50]'));
  const bakkerij = I.zet(bronnen['js/gebouwen.js'], 'GEBOUWEN', ['bakkerij', 'kosten', 'hout'], 14);
  assert.equal(I.knoopOp(I.leesBlok(bakkerij, 'GEBOUWEN').waarde, ['bakkerij', 'kosten', 'hout']).waarde, 14);
  const r = model.spelregels.find((x) => x.id === 'dagloners');
  const opties = I.zet(bronnen['js/opties.js'], 'OPTIES', r.pad, 'binden');
  assert.equal(I.model({ 'js/opties.js': opties }).spelregels.find((x) => x.id === 'dagloners').standaard, 'binden');
});

// Met git core.autocrlf=true staan de bestanden op Windows met \r\n in de werkmap, in de cloud met \n: de bladzijde leest
// beide hetzelfde, en een getal schrijven laat de regeleinden van het bestand staan.
test('een bestand met \\r\\n leest hetzelfde als met \\n, en schrijven houdt zijn regeleinden', () => {
  const lf = {};
  const crlf = {};
  for (const [bestand, tekst] of Object.entries(bronnen)) {
    lf[bestand] = tekst.replace(/\r\n/g, '\n');
    crlf[bestand] = lf[bestand].replace(/\n/g, '\r\n');
  }
  assert.deepEqual(I.model(crlf), I.model(lf));
  for (const tekst of [lf['js/akkers.js'], crlf['js/akkers.js']]) {
    const nieuw = I.zet(tekst, 'SCHOVEN_INSTELLINGEN', ['zwadGrens'], 6);
    assert.equal(nieuw.split('\r\n').length, tekst.split('\r\n').length);
    assert.equal(nieuw.split('\n').length, tekst.split('\n').length);
    assert.equal(I.knoopOp(I.leesBlok(nieuw, 'SCHOVEN_INSTELLINGEN').waarde, ['zwadGrens']).waarde, 6);
  }
});

test('wat geen gewoon getal is, of wat niet past, schrijft het niet', () => {
  const tekst = bronnen['js/akkers.js'];
  assert.throws(() => I.zet(tekst, 'SCHOVEN_INSTELLINGEN', ['zwadGrens'], 'veel'), /geen getal/);
  assert.throws(() => I.zet(tekst, 'SCHOVEN_INSTELLINGEN', ['dagloners'], 3), /waar of niet waar/);
  assert.throws(() => I.zet(tekst, 'SCHOVEN_INSTELLINGEN', ['bestaatNiet'], 3), /bestaat niet/);
  assert.throws(() => I.zet(tekst, 'GEEN_BLOK', ['x'], 3), /staat niet in dit bestand/);
  // AKKER_STADIA heeft maandIdx('lentemaand'): dat is een uitdrukking, geen getal.
  const stadia = I.bladen(I.leesBlok(tekst, 'AKKER_STADIA').waarde);
  const som = stadia.find((b) => b.soort === 'anders');
  assert.ok(som, 'er is een uitdrukking');
  assert.throws(() => I.zet(tekst, 'AKKER_STADIA', som.pad, 2), /geen gewoon getal/);
});

test('elk getal in elk bestand kan zichzelf terugschrijven zonder dat er iets anders verandert', () => {
  for (const [bestand, tekst] of Object.entries(bronnen)) {
    for (const blok of I.blokkenIn(tekst)) {
      const b = I.leesBlok(tekst, blok);
      for (const x of I.bladen(b.waarde)) {
        if (x.soort !== 'getal' && x.soort !== 'waar') continue;
        const nieuw = I.zet(tekst, blok, x.pad, x.waarde);
        const terug = I.knoopOp(I.leesBlok(nieuw, blok).waarde, x.pad);
        assert.equal(terug.waarde, x.waarde, `${bestand} ${blok}.${x.pad.join('.')}`);
        assert.equal(nieuw.length - tekst.length, I.alsBron(x.soort, x.waarde).length - (x.eind - x.begin), `${bestand} ${blok}.${x.pad.join('.')}`);
      }
    }
  }
});
