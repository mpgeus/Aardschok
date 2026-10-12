// De graanschuur en de wachters bij het zaaigraan (js/graanschuur.js; werklijst vraag 132; Marcel, 8 okt: "bij honger
// grijpen mensen alles aan. Je moet mensen inzetten om het warenhuis te beschermen", en een wachter per twintig mensen:
// "anders maken ze geen kans").
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

// Het proefdorp (test/grond.cjs) met een graanschuur die klaar is; jij bouwt, en de voorvallen komen alleen als de regels
// ze beginnen.
function dorp() {
  const { S, D, gebouw } = proefDorp(T, { gebouwen: ['graanschuur'] });
  Object.assign(S, { vlaggen: new Set() });
  T.S = S;
  return { S, D, schuur: gebouw('graanschuur') };
}

// Een dag in de winter, na de oogst en voor het zaaien: dan ligt er zaaigraan apart.
function winterdag(D) {
  for (let dag = 0; dag < T.DAGEN_PER_JAAR; dag++) {
    if (T.datumVanDag(dag).maand === T.MAANDEN.findIndex((m) => m.naam === 'louwmaand') && T.zaaigraanApart(D, dag) > 0) return dag;
  }
  throw new Error('geen winterdag met zaaigraan');
}

// Het dorp heeft alleen nog zijn zaaigraan: geen ander graan, geen kaas, geen vlees, geen melk.
function alleenZaaigraan(D, dag) {
  for (const wat of ['kaas', 'vlees', 'brood', 'vis']) T.zetVoorraad(D, wat, 0);
  if (D.vee) D.vee.melk = 0;
  T.zetVoorraad(D, 'graan', T.zaaigraanApart(D, dag));
}

function luister(f) {
  const gezegd = [];
  const zeg = T.zeg;
  T.zeg = (D, tekst) => gezegd.push(tekst);
  try {
    f(gezegd);
  } finally {
    T.zeg = zeg;
  }
  return gezegd;
}

test('komt de honger aan het zaaigraan, dan zoekt een boer je; zet je er mannen bij, dan blijft het liggen', () => {
  const { D } = dorp();
  try {
    const dag = winterdag(D);
    D.kalender.dag = dag + 0.3;
    alleenZaaigraan(D, dag);
    const zaai = D.voorraad.graan;
    // De eerste dag: het dorp eet ervan, en een boer zoekt je.
    const eerst = T.eetVandaag(D, dag);
    assert.ok(eerst.zaaigraan > 0, 'zonder wachters eet het ervan');
    assert.equal(D.voorvallen.lopend && D.voorvallen.lopend.id, 'zaaigraanHonger', 'een boer zoekt je');
    // Mannen bij de graanschuur: een per twintig mensen, minstens twee.
    const wie = luister(() => T.voorvalGevolg(D, { bewaak: 1 }));
    const nodig = Math.max(2, Math.ceil(D.bevolking / 20));
    assert.equal(T.wachtersNodig(D), nodig);
    assert.equal(D.zaaigraan.wachters.length, nodig, wie.join(' / '));
    for (const e of D.zaaigraan.wachters) {
      const p = T.bewonerVan(D, e);
      assert.ok(p.wacht && e.moetNaar && e.moetNaar.wacht, 'hij staat bij de graanschuur');
    }
    T.verdeelHanden(D);
    for (const e of D.zaaigraan.wachters) assert.equal(T.bewonerVan(D, e).werk, null, 'en werkt nergens');
    // Nu blijft het zaaigraan liggen, en is er honger.
    const voor = D.voorraad.graan;
    const daarna = T.eetVandaag(D, dag + 1);
    assert.equal(daarna.zaaigraan, 0, 'het zaaigraan blijft liggen');
    assert.equal(D.voorraad.graan, voor);
    assert.ok(daarna.tekort > 0, 'en het dorp heeft honger');
    assert.ok(voor <= zaai);
  } finally {
    T.optiesTerug();
  }
});

test('met te weinig wachters pakt het dorp een deel; de helft bewaken laat de helft vrij', () => {
  const { D } = dorp();
  try {
    const dag = winterdag(D);
    D.kalender.dag = dag + 0.3;
    alleenZaaigraan(D, dag);
    T.bewaakZaaigraan(D, 1);
    assert.equal(T.zaaigraanBeschermd(D), 1);
    // Eén van de twee wachters gaat weg (zijn stap naar de schuur houdt op): er zijn in het proefdorp maar twee mannen, dus
    // hij is de volgende keer weer beschikbaar.
    const weg = D.zaaigraan.wachters.pop();
    delete weg.moetNaar;
    T.bewonerVan(D, weg).wacht = false;
    assert.ok(Math.abs(T.zaaigraanBeschermd(D) - 1 / T.wachtersNodig(D)) < 1e-9, 'een van de wachters: dat deel');
    T.bewaakZaaigraan(D, 0.5);
    assert.ok(Math.abs(T.zaaigraanBeschermd(D) - 0.5) < 1e-9, 'de helft');
    const voor = D.voorraad.graan;
    const at = T.eetVandaag(D, dag).zaaigraan;
    assert.ok(at > 0 && at <= voor / 2 + 1e-9, `hooguit de helft: ${at} van ${voor}`);
  } finally {
    T.optiesTerug();
  }
});

test('honger terwijl het graan bewaakt wordt, kost vertrouwen; bij het zaaien gaan de wachters naar huis', () => {
  const { D } = dorp();
  try {
    const dag = winterdag(D);
    D.kalender.dag = dag + 0.3;
    T.bewaakZaaigraan(D, 1);
    const wachters = [...D.zaaigraan.wachters];
    const v = D.bazen ? D.bazen.vertrouwen : null;
    T.tikGraanschuurDag(D, dag, true);
    if (v != null) assert.equal(D.bazen.vertrouwen, v - T.GRAANSCHUUR_INSTELLINGEN.vertrouwenPerHongerdag);
    // Het zaaien: niets meer apart.
    let zaaien = dag;
    while (T.zaaigraanApart(D, zaaien) > 0) zaaien++;
    luister((z) => {
      T.tikGraanschuurDag(D, zaaien, false);
      assert.ok(z.some((t) => /the guards at the granary go home/.test(t)), z.join(' / '));
    });
    assert.equal(D.zaaigraan.bewaakt, 0);
    for (const e of wachters) {
      assert.ok(!T.bewonerVan(D, e).wacht && !e.moetNaar, 'naar huis en aan het werk');
    }
  } finally {
    T.optiesTerug();
  }
});

test('zonder graanschuur, of met de spelregel "Pas bij nood", eet het dorp het zaaigraan op zonder te vragen', () => {
  for (const zonder of ['schuur', 'regel']) {
    const { D, schuur } = dorp();
    try {
      if (zonder === 'schuur') D.gebouwen.splice(D.gebouwen.indexOf(schuur), 1);
      else T.zetOptie('zaaigraan', 'nood');
      const dag = winterdag(D);
      D.kalender.dag = dag + 0.3;
      alleenZaaigraan(D, dag);
      assert.ok(T.eetVandaag(D, dag).zaaigraan > 0);
      assert.ok(!(D.voorvallen && D.voorvallen.lopend), `${zonder}: niemand zoekt je`);
      if (zonder === 'schuur') assert.equal(T.bewaakZaaigraan(D, 1).length, 0, 'zonder graanschuur is er niets te bewaken');
    } finally {
      T.optiesTerug();
    }
  }
});

test('wat helpt aan eten: een graanschuur als die er niet is, en zaaigraan kopen als het te weinig is (vraag 132, b)', () => {
  const { D, schuur } = dorp();
  try {
    const dag = winterdag(D);
    D.kalender.dag = dag + 0.3;
    D.gebouwen.splice(D.gebouwen.indexOf(schuur), 1);
    T.zetVoorraad(D, 'graan', T.zaaigraanApart(D, dag) / 2);
    const hulp = T.watHelptAanEten(D);
    const ids = hulp.map((h) => h.id);
    assert.ok(ids.includes('graanschuur'), ids.join(', '));
    const kopen = hulp.find((h) => h.id === 'kopen');
    assert.ok(kopen && /peddler/.test(kopen.zin), 'zaaigraan kopen bij de marskramer');
    assert.ok(hulp.filter((h) => h.bouw).every((h) => T.GEBOUWEN[h.bouw]), 'wat het dorp vraagt, is een gebouw');
  } finally {
    T.optiesTerug();
  }
});

test('na een voorjaar met honger maakt een boer een veld weide, als het hooi geen koe meer draagt', () => {
  for (const honger of [0, 20]) {
    const { D } = dorp();
    try {
      D.behoeften.voorjaarsHonger = honger;
      const voor = D.wereld.akkers.filter((v) => T.planVan(v) === 'weide').length;
      let anders;
      const gezegd = luister(() => {
        anders = T.boerenKiezenVelden(D);
      });
      const na = D.wereld.akkers.filter((v) => T.planVan(v) === 'weide').length;
      if (!honger) {
        assert.equal(na, voor, 'zonder honger geen weide erbij');
        continue;
      }
      assert.equal(na, voor + 1, 'een weide erbij');
      const w = anders.find((a) => a.weide);
      assert.ok(w && w.veld.planDoor === 'boer', 'een boer koos het');
      assert.ok(gezegd.some((t) => /will become meadow/.test(t)), gezegd.join(' / '));
      assert.equal(D.behoeften.voorjaarsHonger, 0, 'een nieuw jaar telt opnieuw');
    } finally {
      T.optiesTerug();
    }
  }
});

test('de raad vraagt meer vissers als het dorp groeit, en meer weide na een voorjaar met honger', () => {
  // Een eiland met water in het land (zaad 62707; op het eiland van zaad 2 ligt er te weinig): een visser vraagt water.
  const { D } = proefDorp(T, { zaad: 62707 });
  try {
    D.kalender.dag = 100.5; // hooimaand: de visser vist
    D.bevolking = 70;
    D.gebouwen.push({ soort: 'visser', x: 0, y: 0, klaar: true });
    const ids = () => T.watHelptAanEten(D).map((h) => h.id);
    assert.ok(ids().includes('visser'), `nog een visser bij 70 mensen: ${ids()}`);
    D.bevolking = 20;
    assert.ok(!ids().includes('visser'), 'een is genoeg voor twintig');
    D.behoeften.voorjaarsHonger = 30;
    assert.ok(ids().includes('weide'), 'meer weide');
  } finally {
    T.optiesTerug();
  }
});
