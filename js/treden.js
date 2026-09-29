// De treden: van gehucht tot dorp (stap 2 van de proef "van gehucht tot dorp"; werklijst vraag 51 en 53, Marcel,
// 28 en 29 sep: "A ja B ja C ja D ja"; ontwerp/spel.md, "Van dorp tot stad"). Voorlopig alleen de eerste trede.
//
// Het gehucht wordt een dorp als er genoeg mensen zijn en een kapel en een smidse klaar staan. Het doel staat vanaf
// het begin linksboven (T.tredeDoel; js/main.js zet het in het vak als er geen quest is), en de heer noemt het in
// zijn benoemingsbrief. Is het zover (T.tikTredeDag, elke dag), dan blijft het een dorp, ook als er mensen
// wegtrekken, en schrijft de heer een brief (js/hud.js, T.ui.toonDorpsbrief): het eind van de proef, met "Verder
// als dorp" en "Naar het titelscherm". Het dorp zet het bouwmenu van het dorp open (T.inBouwmenu, js/gebouwen.js:
// deze trede en de treden ervoor). De trede staat in S.trede, en wordt dus vanzelf bewaard.
//
// Zonder scherm, en dus getoetst (test/treden.test.cjs).
(function (T) {
  'use strict';

  T.TREDEN_INSTELLINGEN = {
    // Wanneer het gehucht een dorp is (Marcel, 28 sep, vraag 51): zoveel mensen, en deze gebouwen klaar. Vroeger
    // was het verschil vaak de kerk: een gehucht had er geen, een dorp wel.
    dorp: { mensen: 50, gebouwen: ['kapel', 'smidse'] },
    // Hoeveel keer zoveel hoofdgeld de heer per ziel vraagt als het een dorp is (js/heer.js). "Dat kost u vanaf nu
    // meer" is voorlopig alleen woorden (Marcel, 29 sep, vraag 53, D): 1.
    hoofdgeldInDorp: 1,
  };
  const IN = () => T.TREDEN_INSTELLINGEN;

  const bericht = (tekst, soort) => {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  };

  // Is hier een trede te halen? Alleen in het gehucht zelf: een wereld met een plein (waar de heer komt). Een
  // proefkaart (?kaart=proef) heeft er geen.
  const heeftTreden = (S) => !!(S.wereld && S.wereld.plein);

  // De trede na deze, of null. Voorlopig is er alleen het dorp.
  T.volgendeTrede = (S) => (S.trede === 'gehucht' ? 'dorp' : null);

  // Hoe het ervoor staat met de volgende trede: { kop, tekst, klaar, trede }, of null als er niets te halen is.
  // `tekst` is voor het vak linksboven: "43 van 50 mensen · een kapel ✓ · nog geen smidse".
  T.tredeDoel = function (S) {
    const trede = T.volgendeTrede(S);
    if (!trede || !heeftTreden(S)) return null;
    const eis = IN()[trede];
    const delen = [];
    const genoeg = (S.bevolking || 0) >= eis.mensen;
    delen.push(genoeg ? `${eis.mensen} mensen ✓` : `${S.bevolking || 0} van ${eis.mensen} mensen`);
    let klaar = genoeg;
    for (const soort of eis.gebouwen) {
      const naam = T.GEBOUWEN[soort].naam;
      const lijst = (S.gebouwen || []).filter((g) => g.soort === soort);
      if (lijst.some((g) => g.klaar)) delen.push(`een ${naam} ✓`);
      else {
        klaar = false;
        delen.push(lijst.length ? `de ${naam} in aanbouw` : `nog geen ${naam}`);
      }
    }
    return { kop: `Naar een ${trede}`, tekst: delen.join(' · '), klaar, trede };
  };

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, na de groei): is het doel gehaald, dan gaat de trede omhoog.
  T.tikTredeDag = function (S) {
    const doel = T.tredeDoel(S);
    if (doel && doel.klaar) T.wordtTrede(S, doel.trede);
  };

  // Het gehucht is een dorp: dat blijft het. De heer schrijft (js/hud.js); zonder scherm (een toets) alleen een
  // bericht.
  T.wordtTrede = function (S, trede) {
    S.trede = trede;
    if (T.ui && T.ui.toonDorpsbrief) T.ui.toonDorpsbrief(S);
    else bericht(`Het gehucht is een ${trede} geworden.`, 'goed');
  };

  // Het hoofdgeld in deze trede, als factor op wat de heer per ziel vraagt (js/heer.js, T.eisVanDeHeer).
  T.hoofdgeldFactor = (S) => (S.trede && S.trede !== 'gehucht' ? IN().hoofdgeldInDorp : 1);

  // Wat de heer in zijn benoemingsbrief vraagt (js/hud.js): "een kapel, een smidse en vijftig zielen".
  const TIENTALLEN = { 20: 'twintig', 30: 'dertig', 40: 'veertig', 50: 'vijftig', 60: 'zestig', 70: 'zeventig', 80: 'tachtig', 90: 'negentig', 100: 'honderd' };
  T.tredeEisTekst = function (trede) {
    const eis = IN()[trede];
    const gebouwen = eis.gebouwen.map((s) => `een ${T.GEBOUWEN[s].naam}`);
    return `${gebouwen.join(', ')} en ${TIENTALLEN[eis.mensen] || eis.mensen} zielen`;
  };
})(globalThis.Spel = globalThis.Spel || {});
