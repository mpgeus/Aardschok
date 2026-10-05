// Ontginnen: het land groeit mee (werklijst vraag 107; Marcel, 5 okt: "107 a b c d e ja"). Komt het dorp graan tekort, dan
// vraagt een boer of zijn zoon je om een stuk heide naast zijn akker te ontginnen, dertig tegels. Ja: het wordt een veld van
// zijn boerderij, en zijn boeren zaaien en maaien het; geen nieuwe boerderij en geen nieuw gezin. Maar de heide is de meent,
// van iedereen, en het dorp vindt het zijn grond: het vertrouwen in jou zakt (js/bazen.js; hoeveel, staat bij het antwoord in
// js/gesprekken.js, zoals bij elk voorval). Een maand steekt hij er plaggen
// (js/veldwerk.js: hij werkt er tegel voor tegel, en wat hij stak, is kale grond), en in lentemaand wordt het gezaaid, met
// zaaigraan zoals elke akker (T.wisselVelden en T.zaaiAkkers, js/akkers.js). De schapen grazen er niet meer (js/vee.js).
// Dit is stap 1 van drie (vraag 107, e): de heide. Het bos (openlijk, tegen de gunst van de heer, of stiekem) komt erna.
//
// Het verzoek loopt zoals een bouwverzoek (js/verzoeken.js): wie het vraagt, zoekt je (het voorval 'ontginverzoek',
// js/voorvallen.js, met de woorden in js/gesprekken.js), de plek ligt zolang in goud op de grond (js/tekenen.js), en ben je
// weg, dan beslist je raadsman (js/raadsman.js).
//   L.ontgin        op het voorval: { x, y, b, h, boer (het poppetje van de boer wiens veld het wordt), nut }
//   veld.ontginning op een veld dat ontgonnen wordt: { tot (de dag dat het klaar is), op: 'heide', gestoken (Set "x,y") }
//   D.ontginnen     { gevraagd (de dag van het laatste verzoek), klaar (de dag dat het laatste stuk klaar was) }
// Regels zonder scherm, met toetsen (test/ontginnen.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.ONTGINNEN_INSTELLINGEN = {
    // De spelregel "Ontginnen": aan, of uit (dan blijft het land zoals het is, zoals tot 5 okt).
    aan: true,
    // Hoe groot een stuk is (dertig tegels, vraag 107, d), en hoe lang de heide duurt: een maand plaggen steken (c).
    breed: 6,
    diep: 5,
    heideDagen: 30,
    // Na een verzoek vraagt er pas na zoveel dagen weer iemand, wat je ook zei, en ook als je hem niet sprak (dan zou hij
    // elke dag terugkomen, zolang het graan tekortkomt); na een ja pas als het stuk klaar is, en dan nog zoveel dagen later.
    opnieuw: 30,
    naKlaar: 30,
    // Wat de schapen op de meent minstens over moeten houden, bovenop wat ze nodig hebben, in tegels.
    schapenRuimte: 10,
    // Wat het verzoek de raadsman waard is, als tevredenheid (js/raadsman.js; zoals T.VERZOEKEN_INSTELLINGEN.nutTot).
    nut: 6,
  };
  const IN = () => T.ONTGINNEN_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const sleutel = (x, y) => x + ',' + y;
  const staatVan = (D) => D.ontginnen || (D.ontginnen = { gevraagd: null, klaar: null });

  // Komt het dorp graan tekort? Dezelfde vraag als de raad (js/raad.js, 'graan'): er komt geen gezin om het graan
  // (T.waaromGeenGezin, js/gebouwen.js), of het eten haalt de winter niet (T.watDeWinterNietHaalt, js/behoeften.js).
  T.graanTekort = (D) => T.waaromGeenGezin(D).includes('graan') || T.watDeWinterNietHaalt(D, dagNu(D)).includes('eten');

  // De velden die nu ontgonnen worden.
  T.inOntginning = (w) => ((w && w.akkers) || []).filter((v) => v.ontginning);

  // Hoe ver twee rechthoeken van tegels uit elkaar liggen: 1 als ze elkaar raken (ook met een hoek), 0 als ze overlappen.
  function afstandTussen(a, b) {
    const dx = Math.max(0, a.x - (b.x + b.b - 1), b.x - (a.x + a.b - 1));
    const dy = Math.max(0, a.y - (b.y + b.h - 1), b.y - (a.y + a.h - 1));
    return Math.max(dx, dy);
  }

  // Mag deze tegel ontgonnen worden? Heide van de meent, te belopen (geen boom, rots of gebouw), geen veld, weg, erf of
  // lantaarn (T.waaromNietOpDezeGrond, js/gebouwen.js), niet het plein, niet voor een deur, en geen paadje van een deur
  // ("op een pad komt hij niet", vraag 107, d; op het ontworpen gehucht loopt dat van de schaapskooi over de heide). Een
  // gesleten paadje mag wel: anders duwt het looppad van de boer zelf het volgende stuk weg.
  function magOntgonnen(D, m, x, y) {
    const w = D.wereld;
    if (x < m.x || y < m.y || x >= m.x + m.b || y >= m.y + m.h) return false;
    if (!T.isBegaanbaar(w, x, y) || T.bijDeur(w, x, y) || T.opHetPlein(w, x, y) || T.isAangelegdPaadje(D, x, y)) return false;
    return !T.waaromNietOpDezeGrond(D, x, y);
  }

  // Hoeveel tegels de meent nog heeft voor de schapen, als dit stuk eraf gaat (js/vee.js, T.weideStand): genoeg voor wie
  // er graast, met wat ruimte over?
  function schapenHoudenGenoeg(D, m, stuk) {
    const stand = T.weideStand(D, m);
    return stand.tegels - stuk.b * stuk.h >= stand.nodig + IN().schapenRuimte;
  }

  // De plek voor een stuk heide bij de velden van deze boer: de rechthoek van breed bij diep (of andersom) op de meent die
  // het dichtst bij een van zijn velden ligt; bij gelijk de eerste, van boven naar beneden. Of null. Naast zijn akker als
  // het kan (vraag 107, d), en anders zo dichtbij als het kan: op de landen van de maker ligt de heide in een hoek, 8 tot
  // 40 tegels van de dichtste boerderij (5 okt), en wat ontgonnen is, ligt de volgende keer het dichtst bij, zodat de heide
  // van de kant van het dorp af ontgonnen wordt.
  T.ontginPlekVoor = function (D, boer) {
    const w = D.wereld;
    const meenten = (w.meenten || []).filter((m) => m.meent);
    let beste = null;
    for (const m of meenten) {
      for (const [b, h] of [[IN().breed, IN().diep], [IN().diep, IN().breed]]) {
        for (let y = m.y; y + h <= m.y + m.h; y++) {
          for (let x = m.x; x + b <= m.x + m.b; x++) {
            const stuk = { x, y, b, h };
            const d = Math.min(...boer.werkAkkers.map((v) => afstandTussen(stuk, v)));
            if (beste && d >= beste.d) continue;
            let past = true;
            for (let dy = 0; dy < h && past; dy++) for (let dx = 0; dx < b && past; dx++) past = magOntgonnen(D, m, x + dx, y + dy);
            if (past && schapenHoudenGenoeg(D, m, stuk)) beste = { ...stuk, d, meent: m };
          }
        }
      }
    }
    return beste && { x: beste.x, y: beste.y, b: beste.b, h: beste.h };
  };

  // Wie het komt vragen: de zoon van de boer, als hij een grote zoon heeft die je kan komen zoeken, anders de boer zelf
  // (T.kanJeKomenZoeken, js/voorvallen.js).
  function wieVraagt(D, boer) {
    const p = T.bewonerVan(D, boer);
    if (!p) return null;
    const zoon = D.bewoners.mensen.find((q) => q.huis === p.huis && q.band === 'zoon' && (q.leeftijd === 'volwassen' || q.leeftijd === 'jong') && T.kanJeKomenZoeken(D, q));
    return zoon || (T.kanJeKomenZoeken(D, p) ? p : null);
  }

  // Komt er vandaag iemand vragen om heide te ontginnen? Vanuit T.tikVoorvallenDag (js/voorvallen.js), als er niets anders
  // loopt, vóór de bouwverzoeken. Alleen als het dorp graan tekortkomt, er geen stuk in ontginning is, en niet kort na het
  // vorige verzoek of het vorige stuk. De boer met het stuk heide dat het dichtst bij zijn velden ligt, vraagt het. Geeft
  // of er een verzoek begon.
  T.beginOntginverzoek = function (D, dag) {
    if (!IN().aan || D.ander || !D.bewoners || !D.wereld || !(D.wereld.meenten || []).length) return false;
    const st = staatVan(D);
    if (st.gevraagd != null && dag - st.gevraagd < IN().opnieuw) return false;
    if (st.klaar != null && dag - st.klaar < IN().naKlaar) return false;
    if (T.inOntginning(D.wereld).length || !T.graanTekort(D)) return false;
    let keus = null;
    for (const e of D.wereld.wezens) {
      if (e.dood || !e.werkAkkers || !e.werkAkkers.length) continue;
      const plek = T.ontginPlekVoor(D, e);
      if (!plek) continue;
      const d = Math.min(...e.werkAkkers.map((v) => afstandTussen(plek, v)));
      if (!keus || d < keus.d) keus = { boer: e, plek, d };
    }
    const wie = keus && wieVraagt(D, keus.boer);
    if (!wie) return false;
    const L = T.beginVoorval(D, 'ontginverzoek', wie, null, dag);
    L.ontgin = { ...keus.plek, boer: keus.boer, nut: IN().nut };
    st.gevraagd = dag;
    return true;
  };

  // Ja (doe: { ontgin: true }, js/voorvallen.js): het stuk wordt een veld van zijn boerderij, dat nog ontgonnen wordt. Het
  // rust tot het klaar is (braak), en wordt in lentemaand een akker (het plan, js/akkers.js). Is de plek intussen niet meer
  // vrij, dan de plek die hij nu zou kiezen.
  T.ontginToegestaan = function (D, L) {
    const o = L.ontgin;
    const boer = o.boer;
    const w = D.wereld;
    const vrij = (w.meenten || []).some((m) => {
      for (let dy = 0; dy < o.h; dy++) for (let dx = 0; dx < o.b; dx++) if (!magOntgonnen(D, m, o.x + dx, o.y + dy)) return false;
      return true;
    });
    const plek = vrij ? o : T.ontginPlekVoor(D, boer);
    if (!plek) {
      T.zeg(D, `Op de heide is geen plek meer om te ontginnen.`);
      return null;
    }
    const nummer = w.akkers.filter((v) => v.huis === boer.huis && /ontgonnen/.test(v.naam)).length + 1;
    const veld = {
      naam: `${boer.huis}-ontgonnen-${nummer}`, x: plek.x, y: plek.y, b: plek.b, h: plek.h,
      huis: boer.huis, bestemming: 'braak', plan: 'akker', planDoor: 'boer',
      vruchtbaarheid: T.VELDEN_INSTELLINGEN.beginVruchtbaarheid,
      ontginning: { tot: dagNu(D) + IN().heideDagen, op: 'heide', gestoken: new Set() },
    };
    w.akkers.push(veld);
    boer.werkAkkers.push(veld);
    // Een veld waar heide was: wat uit de kaart volgt (de paadjes van de deuren lopen niet over een veld, js/paden.js; de
    // wegen en de grond), wordt opnieuw uitgerekend.
    T.kaartVeranderd(w);
    const zaaien = T.isNazaaitijd(veld.ontginning.tot) ? 'en dan zaaien ze het meteen' : 'en in lentemaand wordt het gezaaid';
    T.zeg(D, `${T.hoofdletter(T.naamVanBewoner(L.wie))} begint de heide te ontginnen: over een maand is het een akker, ${zaaien}.`, 'goed');
    return veld;
  };

  // Een tegel van een veld in ontginning gestoken (js/veldwerk.js): daar is het kale grond.
  T.steekPlag = function (veld, x, y) {
    if (veld.ontginning) veld.ontginning.gestoken.add(sleutel(x, y));
  };
  T.isGestoken = (veld, x, y) => !veld.ontginning || veld.ontginning.gestoken.has(sleutel(x, y));

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, vóór T.tikAkkersDag): een stuk waarvan de maand om is, is ontgonnen; wat
  // de boer niet stak, steken zijn mensen dan nog (zoals het vangnet van de oogst, js/akkers.js). Op 1 lentemaand wordt
  // het een akker, en gezaaid (T.wisselVelden en T.zaaiAkkers; zolang het ontgonnen wordt, wisselt het niet). Is het
  // klaar terwijl de boeren nazaaien (T.isNazaaitijd), dan wordt het meteen een akker, en zaaien ze het na zodra er graan
  // is (T.zaaiNa, in dezelfde nacht): dan hoeft wie in de winter ja zei, niet een jaar te wachten.
  T.tikOntginnenDag = function (D, dag) {
    const w = D.wereld;
    for (const veld of T.inOntginning(w)) {
      if (dag < veld.ontginning.tot) continue;
      delete veld.ontginning;
      staatVan(D).klaar = dag;
      const boer = T.boerVanVeld(D, veld);
      const van = boer ? `van ${boer.naam} ` : '';
      if (T.isNazaaitijd(dag)) {
        veld.bestemming = T.planVan(veld);
        veld.ongezaaid = new Set(T.akkerTegels(veld).map((t) => sleutel(t.x, t.y)));
        T.zeg(D, `De heide ${van}is ontgonnen: het is een akker, en de boeren zaaien hem na.`, 'goed');
      } else T.zeg(D, `De heide ${van}is ontgonnen: in lentemaand wordt het een akker.`, 'goed');
    }
  };

  // De woorden van het gesprek (js/gesprekken.js, 'ontginverzoek'; T.vulWoordenIn, js/gesprek.js).
  const ontginNu = (D) => {
    const L = D.voorvallen && D.voorvallen.lopend;
    return L && L.ontgin ? L : null;
  };
  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  // "het stuk heide naast onze akker", "het stuk heide naast de akker van mijn vader"
  T.GESPREK_WOORDEN.heide = (D) => {
    const L = ontginNu(D);
    if (!L) return 'de heide';
    const vanDeBoer = L.ontgin.boer === L.wie.wezen;
    return `het stuk heide naast ${vanDeBoer ? 'mijn akker' : 'de akker van mijn vader'}`;
  };
  // "dertig tegels": hoe groot het stuk is
  T.GESPREK_WOORDEN.stuk = (D) => {
    const L = ontginNu(D);
    return L ? `${T.telwoord(L.ontgin.b * L.ontgin.h)} tegels` : 'een stuk';
  };
})(globalThis.Spel = globalThis.Spel || {});
