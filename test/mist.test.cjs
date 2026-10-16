// De mist (js/mist.js; B2c, ontwerp/kaarten.md "Het hele eiland"; Marcel, 13 okt: "A2, B1, C ok"): zwart wat niemand
// van jou zag, grijs wat je zag maar nu niet ziet, en helder waar je mensen en je gebouwen kijken. Wat je kent, is
// spelstaat en wordt bewaard, per dorp (D.gekend); wat je nu ziet, volgt uit waar ze staan. Je bouwt alleen op land dat je
// kent.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { leegBegin, proefDorp } = require('./grond.cjs');

const M = T.MIST_INSTELLINGEN;
const midden = (w) => ({ x: w.vak.x + (w.vak.b - 1) / 2, y: w.vak.y + (w.vak.h - 1) / 2 });
// Zet een wezen op tegel (x, y).
const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [] });

test('bij het begin kent het dorp een kring om het midden van zijn land; een nieuw dorp op een lege plek niets', () => {
  const { D, w } = leegBegin(T);
  const m = midden(w);
  const R = M.beginKring;
  assert.ok(T.kentTegel(D, Math.round(m.x), Math.round(m.y)), 'het midden');
  assert.ok(T.kentTegel(D, Math.round(m.x + R - 1), Math.round(m.y)), 'net binnen de kring');
  assert.ok(!T.kentTegel(D, Math.round(m.x + R + 2), Math.round(m.y)), 'net erbuiten: zwart');
  assert.ok(!T.kentTegel(D, Math.round(m.x + R), Math.round(m.y + R)), 'de hoek van het vak valt buiten de kring');
  const niemand = { wereld: w, gekend: new Map() }; // wat een dorp kent, is van dat dorp, niet van de kaart
  assert.ok(!T.kentTegel(niemand, Math.round(m.x), Math.round(m.y)), 'wie niets kent, kent het midden ook niet');
  assert.ok(!T.kentTegel(D, -1, 5) && !T.kentTegel(D, T.EILAND_INSTELLINGEN.maat, 5), 'buiten het eiland niets');
});

test('een kaart uit Tiled heeft geen mist', () => {
  const tiled = { wereld: { b: 4, h: 4, tegels: [['vloer']], wezens: [] } };
  assert.ok(T.kentTegel(tiled, 2, 2) && T.zietNu(tiled, 2, 2));
});

test('de aanvoerder ziet zijn kring; wat hij zag, ken je voortaan, en waar hij wegging, wordt het grijs', () => {
  const { S, D, w } = leegBegin(T);
  const m = midden(w);
  const x = Math.round(m.x + M.beginKring + 30);
  const y = Math.round(m.y);
  assert.ok(!T.kentTegel(D, x, y), 'daar is het nog zwart');
  zet(S.dorp.aanvoerder, x, y);
  T.werkMistBij(S, D);
  const Z = M.zicht.aanvoerder;
  assert.ok(T.zietNu(D, x + Z, y) && T.kentTegel(D, x + Z, y), 'zo ver ziet hij');
  assert.ok(!T.zietNu(D, x + Z + 1, y) && !T.kentTegel(D, x + Z + 1, y), 'een tegel verder niet');
  const versie = T.mistVersie(D);
  T.werkMistBij(S, D);
  assert.equal(T.mistVersie(D), versie, 'wie stilstaat, maakt niets nieuws bekend');
  zet(S.dorp.aanvoerder, Math.round(m.x), Math.round(m.y));
  T.werkMistBij(S, D);
  assert.ok(!T.zietNu(D, x, y) && T.kentTegel(D, x, y), 'waar hij was, is grijs: bekend, maar hij ziet het niet meer');
});

test('wie in het grijs loopt, zie je niet; je eigen mensen altijd', () => {
  const { S, D, w } = leegBegin(T);
  T.werkMistBij(S, D);
  const ver = { tx: S.dorp.aanvoerder.tx + M.zicht.aanvoerder + 5, ty: S.dorp.aanvoerder.ty };
  const dichtbij = { tx: S.dorp.aanvoerder.tx + 2, ty: S.dorp.aanvoerder.ty };
  assert.ok(!T.zieJeWezen(S, ver), 'een beest buiten zijn kring');
  assert.ok(T.zieJeWezen(S, dichtbij), 'een beest vlakbij');
  assert.ok(T.zieJeWezen(S, S.dorp.aanvoerder), 'de aanvoerder zelf');
  const kar = w.wezens.find((e) => e.kar);
  if (kar) assert.ok(T.zieJeWezen(S, kar), 'de kar is van jou');
});

test('het plein en een gebouw dat af is kijken ook', () => {
  const { S, D, w } = proefDorp(T);
  for (const e of w.wezens) if (e !== S.dorp.aanvoerder) e.binnen = true; // iedereen binnen: alleen de gebouwen en het plein kijken
  zet(S.dorp.aanvoerder, Math.round(midden(w).x + 300), Math.round(midden(w).y));
  T.werkMistBij(S, D);
  const { x: px, y: py } = D.plek.kamp.vuur;
  assert.ok(T.zietNu(D, px, py), 'het plein');
  const g = D.gebouwen.find((x) => x.klaar);
  const v = T.voetVanGebouw(g);
  assert.ok(T.zietNu(D, v.x + v.b + M.zicht.gebouw - 1, v.y), 'naast een gebouw dat af is');
});

test('wat je kent, blijft na opslaan en laden; een stuk dat je helemaal kent, bewaart als true', () => {
  const { S, D, w } = leegBegin(T);
  const m = midden(w);
  T.kenKring(D, m.x + 200, m.y, 70); // een kring van 70 bedekt zeker een heel stuk van 64
  const vol = [...D.gekend.values()].filter((r) => r === true).length;
  assert.ok(vol >= 1, 'een stuk dat je helemaal kent, is true');
  const proef = [[m.x, m.y], [m.x + 200, m.y], [m.x + 200 + 69, m.y], [m.x + 200 + 72, m.y], [m.x + 120, m.y + 60]].map(([x, y]) => [Math.round(x), Math.round(y)]);
  const voor = proef.map(([x, y]) => T.kentTegel(D, x, y));
  const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
  const S2 = leegBegin(T).S;
  assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
  const D2 = S2.dorp;
  assert.deepEqual(proef.map(([x, y]) => T.kentTegel(D2, x, y)), voor);
  assert.equal([...D2.gekend.values()].filter((r) => r === true).length, vol);
});

test('je bouwt alleen op land dat je kent: een gebouw en een veld', () => {
  const { D, w } = proefDorp(T);
  const { x: px, y: py } = D.plek.kamp.vuur; // het hart van het plein
  let plek = null;
  for (let r = 3; r < 16 && !plek; r++) {
    for (let dy = -r; dy <= r && !plek; dy++) {
      for (let dx = -r; dx <= r && !plek; dx++) if (!T.waaromPastHetNiet(D, 'hut', px + dx, py + dy)) plek = { x: px + dx, y: py + dy };
    }
  }
  assert.ok(plek, 'er is een plek voor een hut bij het plein');
  const veld = { x: plek.x, y: plek.y, b: 4, h: 4 };
  const reden = T.waaromOnbekendLand(D, veld);
  assert.equal(reden, null, 'die plek ken je');
  D.gekend.clear();
  assert.match(T.waaromPastHetNiet(D, 'hut', plek.x, plek.y) || '', /do not know that land/);
  assert.match(T.waaromPastVeldNiet(D, 'akker', veld) || '', /do not know that land/);
});
