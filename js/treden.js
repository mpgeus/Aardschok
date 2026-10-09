// De treden: van gehucht tot dorp, en van dorp tot marktrecht (stap 2 van de proef "van gehucht tot dorp", werklijst
// vraag 51 en 53, Marcel, 28 en 29 sep; sinds 2 okt uit de standen, vraag 90: "a ja b ja c ja d ja"; ontwerp/spel.md,
// "Van dorp tot stad").
//
// Zoals in Anno 1602 komt een trede met de mensen van een stand (js/wensen.js): het gehucht wordt een dorp bij 20
// dorpelingen, en het dorp krijgt marktrecht bij 20 ambachtslieden. De spelregel "Treden" zet de oude eis terug: een
// dorp bij 50 mensen, met een kapel en een smidse klaar. Het doel staat vanaf het begin linksboven (T.tredeDoel;
// js/main.js zet het in het vak als er geen quest is), en de heer noemt het in zijn benoemingsbrief. Is het zover
// (T.tikTredeDag, elke dag), dan blijft het zo, ook als er mensen wegtrekken, en schrijft de heer een brief
// (js/brieven.js, T.ui.toonBrief(D, trede)). Een trede zet het bouwmenu van die trede open (T.inBouwmenu,
// js/gebouwen.js: deze trede en de treden ervoor). De trede staat in D.trede, en wordt dus vanzelf bewaard.
//
// Zonder scherm, en dus getoetst (test/treden.test.cjs).
(function (T) {
  'use strict';

  T.TREDEN_INSTELLINGEN = {
    // Wanneer een trede komt (Marcel, 2 okt, vraag 90, A): zoveel mensen van een stand, of van een stand erboven
    // (T.mensenVanStand, js/wensen.js: wie in een huis woont, is dorpeling, en in een stenen huis ambachtsman), en
    // deze gebouwen klaar. Zonder stand telt iedereen: zo was het in de proef van 28 sep (vraag 51), een dorp bij 50
    // mensen met een kapel en een smidse, en zo zet de spelregel "Treden" het terug.
    dorp: { stand: 'dorpelingen', mensen: 20, gebouwen: [] },
    marktrecht: { stand: 'ambachtslieden', mensen: 20, gebouwen: [] },
    // Hoeveel keer zoveel hoofdgeld de heer per ziel vraagt als het een dorp is (js/heer.js). "Dat kost u vanaf nu
    // meer" is voorlopig alleen woorden (Marcel, 29 sep, vraag 53, D): 1.
    hoofdgeldInDorp: 1,
  };
  const IN = () => T.TREDEN_INSTELLINGEN;


  // Is hier een trede te halen? Alleen in het gehucht zelf: een wereld met een plein (waar de heer komt). Een
  // proefkaart (?kaart=proef) heeft er geen.
  const heeftTreden = (D) => !!(D.wereld && D.wereld.plein);

  // De treden in hun volgorde staan bij de gebouwen (T.GEBOUW_TREDEN, js/gebouwen.js: gehucht, dorp, marktrecht, stad),
  // want daar hoort elk gebouw bij een trede. Een trede is te halen als hij een eis heeft (hierboven); de stad nog niet.
  const volgorde = () => T.GEBOUW_TREDEN;
  T.volgendeTrede = function (D) {
    const volgende = volgorde()[volgorde().indexOf(D.trede || 'gehucht') + 1];
    return volgende && IN()[volgende] ? volgende : null;
  };

  // Is het al minstens deze trede? Voor wat pas in een dorp komt: het hoofdgeld hieronder, en de heervaart
  // (js/heervaart.js).
  T.tredeMinstens = (D, trede) => volgorde().indexOf(D.trede || 'gehucht') >= volgorde().indexOf(trede);

  // Hoe een trede heet: als doel ("naar een dorp", "naar marktrecht"), en wat je dan bent ("Bouwen — het dorp met
  // marktrecht", js/hud.js).
  const NAMEN = {
    gehucht: { doel: 'een gehucht', is: 'het gehucht' },
    dorp: { doel: 'een dorp', is: 'het dorp' },
    marktrecht: { doel: 'marktrecht', is: 'het dorp met marktrecht' },
    stad: { doel: 'een stad', is: 'de stad' },
  };
  T.tredeNaam = (D) => NAMEN[D.trede || 'gehucht'].is;

  // Hoeveel mensen de eis telt, en hoe ze heten: { n, wie }. Met een stand wie die stand heeft of een erboven, zonder
  // iedereen.
  const geteld = (D, eis) => (eis.stand
    ? { n: T.mensenVanStand(D, eis.stand), wie: T.STANDEN[eis.stand].naam }
    : { n: D.bevolking || 0, wie: 'mensen' });

  // Hoeveel mensen de volgende trede nog vraagt, of 0 (ook als er geen trede meer te halen is): voor de raad
  // (js/raad.js), die zegt wat de groei doet zolang het doel mensen vraagt.
  T.tredeMensenNodig = function (D) {
    const trede = T.volgendeTrede(D);
    if (!trede) return 0;
    const eis = IN()[trede];
    return Math.max(0, eis.mensen - geteld(D, eis).n);
  };

  // Hoe het ervoor staat met de volgende trede: { kop, tekst, deel, klaar, trede }, of null als er niets te halen is.
  // `tekst` is voor het briefje linksboven: "12 van 20 dorpelingen", of met de oude eis "43 van 50 mensen · een kapel ✓ ·
  // nog geen smidse"; `deel` is hoe ver de mensen zijn (0 tot 1), voor de streep eronder (js/ui.js).
  T.tredeDoel = function (D) {
    const trede = T.volgendeTrede(D);
    if (!trede || !heeftTreden(D)) return null;
    const eis = IN()[trede];
    const delen = [];
    const { n, wie } = geteld(D, eis);
    const genoeg = n >= eis.mensen;
    delen.push(genoeg ? `${eis.mensen} ${wie} ✓` : `${n} van ${eis.mensen} ${wie}`);
    let klaar = genoeg;
    for (const soort of eis.gebouwen || []) {
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
    const doel = NAMEN[trede].doel;
    const deel = Math.min(1, n / eis.mensen);
    return { kop: naam ? `${naam} · naar ${doel}` : `Naar ${doel}`, tekst: delen.join(' · '), deel, klaar, trede };
  };

  // Welke gebouwen het doel nog vraagt en die er nog niet staan, ook niet in aanbouw: voor de raad (js/raad.js), die
  // zegt wat je ervoor mist. Leeg als er geen trede meer te halen is.
  T.doelGebouwen = function (D) {
    const trede = T.volgendeTrede(D);
    if (!trede || !heeftTreden(D)) return [];
    return (IN()[trede].gebouwen || []).filter((soort) => !(D.gebouwen || []).some((g) => g.soort === soort));
  };

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, na de groei): is het doel gehaald, dan gaat de trede omhoog.
  T.tikTredeDag = function (D) {
    const doel = T.tredeDoel(D);
    if (doel && doel.klaar) T.wordtTrede(D, doel.trede);
  };

  // Een trede gehaald: dat blijft zo. De heer schrijft (js/brieven.js, een brief per trede); zonder scherm (een toets)
  // alleen een bericht.
  const GEHAALD = { dorp: 'Het gehucht is een dorp geworden.', marktrecht: 'Het dorp heeft marktrecht gekregen.' };
  T.wordtTrede = function (D, trede) {
    D.trede = trede;
    if (T.ui && T.ui.toonBrief) T.ui.toonBrief(D, trede);
    else T.zeg(D, GEHAALD[trede] || `Het is ${NAMEN[trede].is} geworden.`, 'goed');
  };

  // Het hoofdgeld in deze trede, als factor op wat de heer per ziel vraagt (js/heer.js, T.eisVanDeHeer).
  T.hoofdgeldFactor = (D) => (T.tredeMinstens(D, 'dorp') ? IN().hoofdgeldInDorp : 1);

  // Wat de heer in zijn benoemingsbrief vraagt (js/brieven.js): "twintig zielen in huizen, niet in hutten" (de huizen
  // van de stand, en die van de stand eronder; T.STANDEN in js/wensen.js), of met de oude eis "een kapel, een smidse en
  // vijftig zielen".
  const TIENTALLEN = { 20: 'twintig', 30: 'dertig', 40: 'veertig', 50: 'vijftig', 60: 'zestig', 70: 'zeventig', 80: 'tachtig', 90: 'negentig', 100: 'honderd' };
  const huizenVan = (stand) => T.GEBOUWEN[T.STANDEN[stand].huis].meervoud;
  T.tredeEisTekst = function (trede) {
    const eis = IN()[trede];
    const zielen = `${TIENTALLEN[eis.mensen] || eis.mensen} zielen`;
    const gebouwen = (eis.gebouwen || []).map((s) => `een ${T.GEBOUWEN[s].naam}`);
    if (eis.stand) {
      const onder = T.standOnder(eis.stand);
      const waar = `${zielen} in ${huizenVan(eis.stand)}${onder ? `, niet in ${huizenVan(onder)}` : ''}`;
      return gebouwen.length ? `${gebouwen.join(', ')} en ${waar}` : waar;
    }
    return gebouwen.length ? `${gebouwen.join(', ')} en ${zielen}` : zielen;
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
