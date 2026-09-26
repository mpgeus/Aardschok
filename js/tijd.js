// De kalender: dag, maand, seizoen en jaar, en sinds 26 sep ook het uur, als regels zonder scherm
// (net als js/quest.js) -- dus te toetsen, in test/tijd.test.cjs. De kalender loopt op zijn eigen
// klok, los van S.tijd (de speltijd waar animaties op wachten, CLAUDE.md "Testen in de browser"):
// T.tikKalender telt zijn eigen S.kalender.dag op, dus pauzeren of versnellen raakt S.tijd nooit
// aan, en dus ook geen animatie.
//
// Een dag is sinds 26 sep een echte dag (ontwerp/spel.md, "Een dorp dat leeft en groeit"): vijf
// minuten bij 1×, met ochtend, werk, avond en nacht, en een maand blijft dertig dagen. Het uur is
// het deel achter de komma van S.kalender.dag (T.uurVanDag). Wat in de wereld loopt -- lopen,
// maaien, dwalen -- gaat mee met de snelheid (T.wereldFactor): bij 10× loopt iedereen tien keer zo
// snel, dus een tocht kost in het spel op elke snelheid even veel uren. De zon, de dagindeling en
// het licht staan in js/dag.js.
(function (T) {
  'use strict';

  // Voorlopig: het jaar waarin het spel begint (ontwerp/spel.md, "Het eerste proefje"). Het jaar
  // begint in de lente, dus dag 0 hieronder is 1 lentemaand van dit jaar.
  T.TIJD_START_JAAR = 1323;

  // Twaalf maanden van dertig dagen: geen schrikkeljaren, geen wisselende maandlengtes. Dat voegt
  // niets toe aan het gevoel en maakt elke som hieronder een deling door een vast getal.
  T.DAGEN_PER_MAAND = 30;
  T.DAGEN_PER_JAAR = T.DAGEN_PER_MAAND * 12;

  // De oude Nederlandse maandnamen, voor de sfeer, met de gewone naam erbij als uitleg en het
  // seizoen waarin de speler hem voelt (de gewone vierdeling: winter is december–februari, enz.).
  T.MAANDEN = [
    { naam: 'louwmaand', gewoon: 'januari', seizoen: 'winter' },
    { naam: 'sprokkelmaand', gewoon: 'februari', seizoen: 'winter' },
    { naam: 'lentemaand', gewoon: 'maart', seizoen: 'lente' },
    { naam: 'grasmaand', gewoon: 'april', seizoen: 'lente' },
    { naam: 'bloeimaand', gewoon: 'mei', seizoen: 'lente' },
    { naam: 'zomermaand', gewoon: 'juni', seizoen: 'zomer' },
    { naam: 'hooimaand', gewoon: 'juli', seizoen: 'zomer' },
    { naam: 'oogstmaand', gewoon: 'augustus', seizoen: 'zomer' },
    { naam: 'herfstmaand', gewoon: 'september', seizoen: 'herfst' },
    { naam: 'wijnmaand', gewoon: 'oktober', seizoen: 'herfst' },
    { naam: 'slachtmaand', gewoon: 'november', seizoen: 'herfst' },
    { naam: 'wintermaand', gewoon: 'december', seizoen: 'winter' },
  ];
  T.TIJD_START_MAAND = T.MAANDEN.findIndex((m) => m.naam === 'lentemaand');
  // Een nieuw spel begint 's ochtends, niet om middernacht in het donker.
  T.TIJD_START_UUR = 7;

  // Sint-Maarten, 11 slachtmaand: de dag waarop de heer komt innen (ontwerp/spel.md). Een
  // benoemde dag zoals deze is een { maand, dag } in dezelfde telling die datumVanDag teruggeeft.
  T.SINT_MAARTEN = { maand: T.MAANDEN.findIndex((m) => m.naam === 'slachtmaand'), dag: 11 };

  // Hoeveel wallklok-seconden één speeldag kost bij snelheid 1×. Tot 26 sep was dat 2,5 seconde
  // (een jaar in een kwartier), maar daarin paste geen dagritme: iemand liep nog geen vier tegels
  // per dag. Marcel koos op 26 sep een dag van vijf minuten en een maand van dertig dagen: dan
  // blijven alle getallen per dag zoals ze waren, en kost een tocht naar de herberg ruim een uur.
  // Een jaar duurt zo dertig uur bij 1×; daarvoor is de versneller (T.SNELHEDEN).
  T.DAG_LENGTE = 300;

  // De standen van de versneller, van pauze tot 30× (voorstel van Claude, 26 sep; vraag 22 in de
  // werklijst). Een jaar duurt dan 30 uur, 10 uur, 3 uur of 1 uur. Het dagritme zie je bij 1× tot
  // 3×; daarboven is het doorspoelen. Slapen tot de ochtend (js/dag.js) gaat nog sneller.
  T.SNELHEDEN = [0, 1, 3, 10, 30];
  T.SLAAP_SNELHEID = 60;

  // Dag → { jaar, maand, dagVanMaand, seizoen, sintMaarten, tekst }. Dag 0 is 1 lentemaand, dus
  // eerst omgerekend naar een telling vanaf 1 louwmaand (T.TIJD_START_MAAND maanden erbij), zodat
  // de jaargrens vanzelf na wintermaand valt, ook voor dag 0 zelf.
  T.datumVanDag = function (dag) {
    const vanafLouw = Math.floor(dag) + T.TIJD_START_MAAND * T.DAGEN_PER_MAAND;
    const jaar = T.TIJD_START_JAAR + Math.floor(vanafLouw / T.DAGEN_PER_JAAR);
    const dagInJaar = ((vanafLouw % T.DAGEN_PER_JAAR) + T.DAGEN_PER_JAAR) % T.DAGEN_PER_JAAR;
    const maand = Math.floor(dagInJaar / T.DAGEN_PER_MAAND);
    const dagVanMaand = (dagInJaar % T.DAGEN_PER_MAAND) + 1;
    const m = T.MAANDEN[maand];
    return {
      jaar,
      maand,
      dagVanMaand,
      seizoen: m.seizoen,
      sintMaarten: maand === T.SINT_MAARTEN.maand && dagVanMaand === T.SINT_MAARTEN.dag,
      tekst: `${dagVanMaand} ${m.naam} ${jaar}`,
    };
  };

  T.nieuweKalender = function () {
    return { dag: T.TIJD_START_UUR / 24, snelheid: 1 };
  };

  // Het uur van de dag, van 0 tot 24: wat er achter de komma van de dagteller staat.
  T.uurVanDag = function (dag) {
    return (dag - Math.floor(dag)) * 24;
  };

  // Hoe snel de wereld loopt tegenover de klok van het scherm: de snelheid van de kalender. Zonder
  // kalender (de proefkaarten) en in een gevecht in beurten gewoon 1, want een gevecht loopt op
  // zijn eigen maat. Op pauze 0: dan staat alles stil, ook wie loopt.
  T.wereldFactor = function (S) {
    if (!S || !S.kalender || S.gevecht || S.modus === 'gevecht' || S.modus === 'overgang') return 1;
    return S.kalender.snelheid || 0;
  };

  // Eén plek waarlangs de klok tikt (zoals de voorraad via T.wijzigVoorraad), zodat het scherm
  // altijd bijblijft. `dt` is echte verstreken seconden, dezelfde dt waarmee de spellus
  // S.tijd ophoogt (js/main.js) -- maar de kalender telt op zijn EIGEN klok (S.kalender.dag),
  // nooit op S.tijd zelf, dus pauzeren of versnellen laat geen animatie stilvallen of doorschieten.
  T.tikKalender = function (S, dt) {
    const k = S.kalender;
    if (!k || !k.snelheid) return;
    // Elk half uur ververst de balk (de datum en het uur, js/dag.js); bij 1× is dat elke 6,25 seconde.
    const vorig = Math.floor(k.dag * 48);
    k.dag += (dt * k.snelheid) / T.DAG_LENGTE;
    if (Math.floor(k.dag * 48) !== vorig && T.ui && T.ui.toonKalender) T.ui.toonKalender(S);
  };

  // Pauze is snelheid 0; de laatste snelheid ervoor blijft staan, zodat pauze-en-hervat (de P
  // van js/hud.js) weer bij dezelfde snelheid uitkomt.
  T.zetSnelheid = function (S, snelheid) {
    const k = S.kalender;
    if (snelheid === 0 && k.snelheid > 0) k.laatsteSnelheid = k.snelheid;
    k.snelheid = snelheid;
    if (T.ui && T.ui.toonKalender) T.ui.toonKalender(S);
  };
})(globalThis.Spel = globalThis.Spel || {});
