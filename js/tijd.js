// De kalender: dag, maand, seizoen en jaar, als regels zonder scherm (net als js/quest.js) --
// dus te toetsen, in test/tijd.test.cjs. De kalender loopt op zijn eigen klok, los van S.tijd
// (de speltijd waar animaties op wachten, CLAUDE.md "Testen in de browser"): T.tikKalender telt
// zijn eigen S.kalender.dag op, dus pauzeren of versnellen raakt S.tijd nooit aan, en dus ook
// geen animatie.
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

  // Sint-Maarten, 11 slachtmaand: de dag waarop de heer komt innen (ontwerp/spel.md). Een
  // benoemde dag zoals deze is een { maand, dag } in dezelfde telling die datumVanDag teruggeeft.
  T.SINT_MAARTEN = { maand: T.MAANDEN.findIndex((m) => m.naam === 'slachtmaand'), dag: 11 };

  // Hoeveel wallklok-seconden één speeldag kost bij snelheid 1x. Bij 3x moet een jaar in een
  // minuut of vijf voorbij zijn (Marcel, 23 sep), zodat je het graan ziet groeien:
  // 360 dagen x (2,5 / 3) s = 300 s = vijf minuten. Bij 1x is dat vijftien minuten, bij 2x zeven
  // en een half: traag genoeg om een keur te overwegen, snel genoeg om niet te vervelen.
  T.DAG_LENGTE = 2.5;

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
    return { dag: 0, snelheid: 1 };
  };

  // Eén plek waarlangs de klok tikt (zoals de voorraad via T.wijzigVoorraad), zodat het scherm
  // altijd bijblijft. `dt` is echte verstreken seconden, dezelfde dt waarmee de spellus
  // S.tijd ophoogt (js/main.js) -- maar de kalender telt op zijn EIGEN klok (S.kalender.dag),
  // nooit op S.tijd zelf, dus pauzeren of versnellen laat geen animatie stilvallen of doorschieten.
  T.tikKalender = function (S, dt) {
    const k = S.kalender;
    if (!k || !k.snelheid) return;
    const vorigeDag = Math.floor(k.dag);
    k.dag += (dt * k.snelheid) / T.DAG_LENGTE;
    if (Math.floor(k.dag) !== vorigeDag && T.ui && T.ui.toonKalender) T.ui.toonKalender(S);
  };

  // Pauze is snelheid 0; de laatste snelheid ervoor blijft staan, zodat pauze-en-hervat (de P
  // van js/hud.js) weer bij dezelfde snelheid uitkomt.
  T.zetSnelheid = function (S, snelheid) {
    const k = S.kalender;
    if (snelheid === 0 && k.snelheid > 0) k.laatsteSnelheid = k.snelheid;
    k.snelheid = snelheid;
    if (T.ui && T.ui.toonKalender) T.ui.toonKalender(S);
  };
})(globalThis.Toren = globalThis.Toren || {});
