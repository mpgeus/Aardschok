// De treden: van gehucht tot dorp (stap 2 van de proef "van gehucht tot dorp"; werklijst vraag 51 en 53, Marcel,
// 28 en 29 sep: "A ja B ja C ja D ja"; ontwerp/spel.md, "Van dorp tot stad"). Voorlopig alleen de eerste trede.
//
// Het gehucht wordt een dorp als er genoeg mensen zijn en een kapel en een smidse klaar staan. Het doel staat vanaf
// het begin linksboven (T.tredeDoel; js/main.js zet het in het vak als er geen quest is), en de heer noemt het in
// zijn benoemingsbrief. Is het zover (T.tikTredeDag, elke dag), dan blijft het een dorp, ook als er mensen
// wegtrekken, en schrijft de heer een brief (js/brieven.js, T.ui.toonBrief(S, 'dorp')): het eind van de proef, met
// "Verder als dorp" en "Naar het titelscherm". Het dorp zet het bouwmenu van het dorp open (T.inBouwmenu, js/gebouwen.js:
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
  const heeftTreden = (D) => !!(D.wereld && D.wereld.plein);

  // De trede na deze, of null. Voorlopig is er alleen het dorp.
  T.volgendeTrede = (D) => (D.trede === 'gehucht' ? 'dorp' : null);

  // Is het al minstens deze trede? Voor wat pas in een dorp komt: het hoofdgeld hieronder, en de heervaart
  // (js/heervaart.js).
  const VOLGORDE = ['gehucht', 'dorp'];
  T.tredeMinstens = (D, trede) => VOLGORDE.indexOf(D.trede || 'gehucht') >= VOLGORDE.indexOf(trede);

  // Hoe het ervoor staat met de volgende trede: { kop, tekst, klaar, trede }, of null als er niets te halen is.
  // `tekst` is voor het vak linksboven: "43 van 50 mensen · een kapel ✓ · nog geen smidse".
  T.tredeDoel = function (D) {
    const trede = T.volgendeTrede(D);
    if (!trede || !heeftTreden(D)) return null;
    const eis = IN()[trede];
    const delen = [];
    const genoeg = (D.bevolking || 0) >= eis.mensen;
    delen.push(genoeg ? `${eis.mensen} mensen ✓` : `${D.bevolking || 0} van ${eis.mensen} mensen`);
    let klaar = genoeg;
    for (const soort of eis.gebouwen) {
      const naam = T.GEBOUWEN[soort].naam;
      const lijst = (D.gebouwen || []).filter((g) => g.soort === soort);
      if (lijst.some((g) => g.klaar)) delen.push(`een ${naam} ✓`);
      else {
        klaar = false;
        delen.push(lijst.length ? `de ${naam} in aanbouw` : `nog geen ${naam}`);
      }
    }
    // De kop draagt de naam van je dorp, als het er een heeft: "Heikant · naar een dorp".
    const naam = T.dorpsnaam(D);
    return { kop: naam ? `${naam} · naar een ${trede}` : `Naar een ${trede}`, tekst: delen.join(' · '), klaar, trede };
  };

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, na de groei): is het doel gehaald, dan gaat de trede omhoog.
  T.tikTredeDag = function (D) {
    const doel = T.tredeDoel(D);
    if (doel && doel.klaar) T.wordtTrede(D, doel.trede);
  };

  // Het gehucht is een dorp: dat blijft het. De heer schrijft (js/brieven.js); zonder scherm (een toets) alleen een
  // bericht.
  T.wordtTrede = function (D, trede) {
    D.trede = trede;
    if (T.ui && T.ui.toonBrief) T.ui.toonBrief(D, 'dorp');
    else bericht(`Het gehucht is een ${trede} geworden.`, 'goed');
  };

  // Het hoofdgeld in deze trede, als factor op wat de heer per ziel vraagt (js/heer.js, T.eisVanDeHeer).
  T.hoofdgeldFactor = (D) => (T.tredeMinstens(D, 'dorp') ? IN().hoofdgeldInDorp : 1);

  // Wat de heer in zijn benoemingsbrief vraagt (js/brieven.js): "een kapel, een smidse en vijftig zielen".
  const TIENTALLEN = { 20: 'twintig', 30: 'dertig', 40: 'veertig', 50: 'vijftig', 60: 'zestig', 70: 'zeventig', 80: 'tachtig', 90: 'negentig', 100: 'honderd' };
  T.tredeEisTekst = function (trede) {
    const eis = IN()[trede];
    const gebouwen = eis.gebouwen.map((s) => `een ${T.GEBOUWEN[s].naam}`);
    return `${gebouwen.join(', ')} en ${TIENTALLEN[eis.mensen] || eis.mensen} zielen`;
  };

  // Hoe het dorp heet (Marcel, 29 sep, werklijst vraag 60: "speler mag zelf de naam voor zijn dorp kiezen aan het
  // begin"): je kiest het bij Nieuw spel (js/menu.js), met een van deze als voorstel. Het staat in S.dorpsnaam, en
  // de heer schrijft het in zijn brieven ("Ons gehucht Heikant"). Zonder naam (een proefkaart, of een spel van
  // vóór 29 sep) is het "dit gehucht".
  T.DORPSNAMEN = ['Heikant', 'Beekveld', 'Wolfsdonk', 'Oudeland', 'Molenhoek', 'Eikenrode', 'Veldhoek', 'Kraaiwijk', 'Lindeloo', 'Braakhuizen'];
  const LANGSTE_NAAM = 24;
  T.dorpsnaam = (D) => (D && D.dorpsnaam) || null;
  // Een voorstel, vast bij een getal (het zaad van het spel), zodat een speeltest hetzelfde dorp krijgt.
  T.voorgesteldeDorpsnaam = (n) => T.DORPSNAMEN[Math.abs(Math.floor(n || 0)) % T.DORPSNAMEN.length];
  // Wat de speler typte: zonder spaties eromheen, niet te lang, en leeg is geen naam.
  T.zetDorpsnaam = function (D, naam) {
    const schoon = String(naam == null ? '' : naam).replace(/\s+/g, ' ').trim().slice(0, LANGSTE_NAAM);
    D.dorpsnaam = schoon || null;
    return D.dorpsnaam;
  };
})(globalThis.Spel = globalThis.Spel || {});
