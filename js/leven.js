// Ouder worden, geboren worden en sterven (werklijst vraag 145; Marcel, 9 okt: "mensen moeten ook ouder kunnen worden",
// en "1. C 2. Ja 3. Ja 4. ... Eerst alleen het beeld. in de middeleeuwen werden ze toch niet zo oud").
//
// Wie in het dorp woont, heeft een geboortedag (p.geboren, een dag van de kalender; wie er bij het begin al was, krijgt er
// een die bij zijn leeftijd past, ergens in die fase). Elke fase duurt een vast aantal jaren (fasen in
// T.LEVEN_INSTELLINGEN): kleuter, kind, jong, volwassen, oud. Elke nacht (T.tikLevenDag, vanuit T.tikGebouwenDag) gaat wie
// zijn fase uit is, een verder: zijn poppetje krijgt het vel en de snelheid van zijn leeftijd (T.poppetjeNaarLeeftijd in
// js/bewoners.js), en wie werkt, zegt T.LEEFTIJDEN zoals altijd (de handen worden opnieuw verdeeld). Wie oud is, sterft
// na zijn jaren, op een dag uit het lot, van ouderdom (T.wijzigBevolking met reden 'ouderdom'). Een gezin met een moeder
// en een vader die volwassen zijn, krijgt soms een kind, als er plaats is in het huis (reden 'geboorte': een kleuter in
// haar gezin). De schout en de mensen met een naam (de boeren, de herbergierster: p.wie) worden niet ouder; aan hen hangt
// het spel. Wie weg is (de heervaart, de bode), ook niet, tot hij terug is. De spelregel "Ouder worden"; de getallen in
// T.LEVEN_INSTELLINGEN.
(function (T) {
  'use strict';

  T.LEVEN_INSTELLINGEN = {
    // Worden de mensen ouder, sterven ze van ouderdom en worden er kinderen geboren (de spelregel "Ouder worden")?
    aan: true,
    // Zo lang duurt elke fase, in jaren van het spel.
    fasen: { kleuter: 2, kind: 2, jong: 3, volwassen: 10, oud: 3 },
    // Wie zijn jaren als oude uit is, sterft binnen zoveel jaar daarna, op een dag uit het lot.
    sterftBinnen: 1.5,
    // Een gezin krijgt met deze kans per jaar een kind, tot het zoveel kinderen heeft, en alleen als er plaats is.
    geboorte: { kans: 0.35, hooguit: 5 },
  };
  const IN = () => T.LEVEN_INSTELLINGEN;
  const FASEN = ['kleuter', 'kind', 'jong', 'volwassen', 'oud'];
  const JAAR = () => T.DAGEN_PER_JAAR;

  // Wanneer elke fase begint, in dagen na de geboorte; en wanneer die van de ouden ophoudt.
  const beginVan = (fase) => FASEN.slice(0, FASEN.indexOf(fase)).reduce((n, f) => n + IN().fasen[f], 0) * JAAR();
  const duurVan = (fase) => IN().fasen[fase] * JAAR();

  // Wordt deze bewoner ouder? Niet de schout, niet wie een naam heeft, en niet wie weg is.
  T.wordtOuder = (p) => !p.schout && !p.wie && !p.weg && FASEN.includes(p.leeftijd);

  // Hoe oud iemand is, in jaren (voor het briefje en de toetsen), of null.
  T.leeftijdInJaren = (D, p) => (p.geboren == null ? null : Math.floor((D.kalender.dag - p.geboren) / JAAR()));

  // De fase die bij een leeftijd in dagen hoort; voorbij de ouden: 'dood'.
  function faseVan(D, p, dagen) {
    for (const f of FASEN) if (dagen < beginVan(f) + duurVan(f)) return f;
    const extra = T.vastLot(D, p.id, 4102) * IN().sterftBinnen * JAAR();
    return dagen < beginVan('oud') + duurVan('oud') + extra ? 'oud' : 'dood';
  }

  // Wie geen geboortedag heeft (wie er al was), krijgt er een ergens in zijn fase.
  function geefGeboortedag(D, p, dag) {
    p.geboren = Math.floor(dag - beginVan(p.leeftijd) - T.vastLot(D, p.id, 4101) * duurVan(p.leeftijd));
  }

  // Een gezin: zijn moeder, als ze volwassen is en er een volwassen vader bij woont.
  function moederVan(D, gezin) {
    const leden = D.bewoners.mensen.filter((p) => p.gezin === gezin && !p.weg);
    const moeder = leden.find((p) => p.geslacht === 'vrouw' && p.leeftijd === 'volwassen' && (!p.hoofd || p.band === 'vrouw' || p.band === 'schoondochter'));
    const vader = moeder && leden.find((p) => p.geslacht === 'man' && p.leeftijd === 'volwassen' && (p === moeder.hoofd || p.hoofd === moeder || (!p.hoofd && moeder.hoofd === p)));
    if (!moeder || !vader || !moeder.huis) return null;
    const kinderen = leden.filter((p) => p.band === 'zoon' || p.band === 'dochter').length;
    return kinderen < IN().geboorte.hooguit ? moeder : null;
  }

  T.tikLevenDag = function (D, dag) {
    if (!IN().aan || !D.bewoners) return;
    let anders = false;
    for (const p of D.bewoners.mensen.slice()) {
      if (!T.wordtOuder(p)) continue;
      if (p.geboren == null) geefGeboortedag(D, p, dag);
      const fase = faseVan(D, p, dag - p.geboren);
      if (fase === p.leeftijd) continue;
      if (fase === 'dood') {
        T.wijzigBevolking(D, -1, 'ouderdom', 'Van ouderdom', [p]);
        anders = true;
        continue;
      }
      // Alleen vooruit: wie in een latere fase begon dan zijn dagen zeggen, blijft waar hij is.
      if (FASEN.indexOf(fase) < FASEN.indexOf(p.leeftijd)) continue;
      p.leeftijd = fase;
      delete p.uiterlijk; // een nieuw uiterlijk bij zijn nieuwe leeftijd, met zijn trekken (js/bewoners.js)
      T.poppetjeNaarLeeftijd(D, p);
      anders = true;
    }
    // Geboren: per gezin, met een eigen lot per dag.
    const gezinnen = [...new Set(D.bewoners.mensen.map((p) => p.gezin))];
    for (const gezin of gezinnen) {
      const moeder = moederVan(D, gezin);
      if (!moeder || T.plaatsInHuis(D, moeder.huis) <= 0) continue;
      if (T.vastLot(D, dag, 4200 + gezin) >= IN().geboorte.kans / JAAR()) continue;
      T.wijzigBevolking(D, 1, 'geboorte', null, [moeder]);
      const kind = D.bewoners.mensen[D.bewoners.mensen.length - 1]; // wie er net bij kwam (js/bewoners.js, geboren)
      if (kind.gezin === moeder.gezin && kind.leeftijd === 'kleuter') kind.geboren = Math.floor(dag);
      T.zeg(D, `${T.naamVanBewoner(moeder)} heeft een kind gekregen.`, 'goed');
      anders = true;
    }
    if (anders) T.verdeelHanden(D);
  };
})(globalThis.Spel = globalThis.Spel || {});
