// Ontginnen: het plaggen steken, waarbij heide akker wordt en je het ziet (werklijst vraag 107; Marcel, 5 okt). Een veld in
// ontginning (veld.ontginning) is heide of bos dat de boer tegel voor tegel kaal maakt (js/veldwerk.js): op de heide steekt
// hij plaggen, in het bos hakt hij de bomen om, rooit hij de stobben en spit hij om. Is het af, of is de tijd om, dan doen
// zijn mensen de rest, en in lentemaand wordt het een akker (T.wisselVelden en T.zaaiAkkers, js/akkers.js).
//
// Het verzoek is op 11 okt weggehaald (snoeironde, vraag 153): dat een boer, als het graan tekortkomt, komt vragen om een
// stuk heide of bos, en dat jij koos (heide tegen het vertrouwen van het dorp, bos gemeld tegen de gunst van de heer).
// Akkers leg jij nu zelf (vraag 151). Er maakt nu dus niets meer een veld in ontginning; dit werk slaapt tot stap 1d, als
// jij een akker op heide legt (ontwerp/snoeien.md). Wat bleef, is wat dan nodig is: git bewaart het verzoek.
//   veld.ontginning { tot (de dag dat het klaar is), op ('heide' of 'bos'), gestoken (Set "x,y": wat af is) }
// Regels zonder scherm, met toetsen (test/ontginnen.test.cjs, op een veld dat de toets zelf in ontginning zet).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js). Wat bleef, hoort bij het bos van de heer
  // (js/bos.js, js/erven.js en js/verzoeken.js gebruiken het).
  T.ONTGINNEN_INSTELLINGEN = {
    // Een stuk is bos als er minstens zoveel bomen op staan (ook een erf of een werkplaats in het bos van de heer,
    // js/bos.js). Wat een boom geeft, staat in T.BOS_INSTELLINGEN.houtPerBoom (js/bos.js).
    bosBomen: 10,
    // Wat het de gunst van de heer kost om in zijn bos te rooien, als je het hem meldt (vraag 107, b: hij wil erom gevraagd
    // worden).
    gunst: 5,
  };

  const sleutel = (x, y) => x + ',' + y;

  // Wat de boer in het bos opruimt (een boom hakt hij om, een stronk of een struik rooit hij), staat in js/bos.js
  // (T.ontginWerkOp, T.hakBoom, T.rooi). Wat laag groeit (varens, gras, bloemen, een keitje) gaat mee als hij de grond
  // omspit, ook op de heide; en een boompje dat de houthakker plant, maakt er plaats voor (js/bos.js).
  const LAAG = new Set(['varen', 'grasPol', 'bloemen', 'paddenstoelen', 'hoogGras', 'kleineRots']);
  T.groeitLaag = (v) => !!v && LAAG.has(v.soort);

  // De velden die nu ontgonnen worden.
  T.inOntginning = (w) => ((w && w.akkers) || []).filter((v) => v.ontginning);

  // Een tegel van een veld in ontginning gestoken of omgespit (js/veldwerk.js): daar is het kale grond, en wat er laag
  // groeide, is weg.
  T.steekPlag = function (veld, x, y, w) {
    if (!veld.ontginning) return;
    veld.ontginning.gestoken.add(sleutel(x, y));
    const v = w && T.voorwerpOp(w, x, y);
    if (T.groeitLaag(v)) T.haalVoorwerpWeg(w, v);
  };
  T.isGestoken = (veld, x, y) => !veld.ontginning || veld.ontginning.gestoken.has(sleutel(x, y));

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, vóór T.tikAkkersDag): een stuk dat af is, of waarvan de tijd om is, is
  // ontgonnen; wat de boer niet af had, doen zijn mensen dan nog (zoals het vangnet van de oogst, js/akkers.js): in het bos
  // de bomen om (het hout naar de schuur) en de stobben eruit. Op 1 lentemaand wordt het een akker, en gezaaid (T.wisselVelden en
  // T.zaaiAkkers; zolang het ontgonnen wordt, wisselt het niet). Is het klaar terwijl de boeren nazaaien (T.isNazaaitijd),
  // dan wordt het meteen een akker, en zaaien ze het na zodra er graan is (T.zaaiNa, in dezelfde nacht): dan hoeft wie in
  // de winter ja zei, niet een jaar te wachten.
  T.tikOntginnenDag = function (D, dag) {
    const w = D.wereld;
    for (const veld of T.inOntginning(w)) {
      if (dag < veld.ontginning.tot && veld.ontginning.gestoken.size < veld.b * veld.h) continue;
      for (const t of T.akkerTegels(veld)) {
        T.hakBoom(D, t.x, t.y);
        T.rooi(D, t.x, t.y);
        T.steekPlag(veld, t.x, t.y, w);
      }
      const bos = veld.ontginning.op === 'bos';
      delete veld.ontginning;
      const boer = T.boerVanVeld(D, veld);
      const wat = bos
        ? (boer ? T.t('The forest of {boer} has been cleared', { boer: boer.naam }) : T.t('The forest has been cleared'))
        : (boer ? T.t('The heath of {boer} has been cleared', { boer: boer.naam }) : T.t('The heath has been cleared'));
      if (T.isNazaaitijd(dag)) {
        veld.bestemming = T.planVan(veld);
        veld.ongezaaid = new Set(T.akkerTegels(veld).map((t) => sleutel(t.x, t.y)));
        T.zeg(D, T.t('{wat}: it is a field now, and the farmers sow it late.', { wat }), 'goed');
      } else T.zeg(D, T.t('{wat}: it becomes a field in {maand}.', { wat, maand: T.MAANDEN.find((m) => m.naam === 'lentemaand').toon }), 'goed');
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
