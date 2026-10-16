// De treden: van gehucht tot dorp, en van dorp tot marktrecht (stap 2 van de proef "van gehucht tot dorp", werklijst
// vraag 51 en 53, Marcel, 28 en 29 sep; sinds 2 okt uit de standen, vraag 90: "a ja b ja c ja d ja"; ontwerp/spel.md,
// "Van dorp tot stad").
//
// Zoals in Anno 1602 komt een trede met de mensen van een stand (T.STANDEN hieronder: wie in een huis woont, is dorpeling,
// en in een stenen huis ambachtsman): het gehucht wordt een dorp bij 20 dorpelingen, en het dorp krijgt marktrecht bij 20
// ambachtslieden. (De eis van de proef van 28 sep, een dorp bij 50
// mensen met een kapel en een smidse klaar, was tot 11 okt een spelregel "Treden"; die is weggehaald, snoeironde vraag
// 153.) Het doel staat vanaf het begin linksboven (T.tredeDoel;
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
    // (T.mensenVanStand hieronder: wie in een huis woont, is dorpeling, en in een stenen huis ambachtsman), en
    // deze gebouwen klaar. Zonder stand telt iedereen: zo was het in de proef van 28 sep (vraag 51), een dorp bij 50
    // mensen met een kapel en een smidse.
    dorp: { stand: 'dorpelingen', mensen: 20, gebouwen: [] },
    marktrecht: { stand: 'ambachtslieden', mensen: 20, gebouwen: [] },
    // Hoeveel keer zoveel hoofdgeld de heer per ziel vraagt als het een dorp is (js/heer.js). "Dat kost u vanaf nu
    // meer" is voorlopig alleen woorden (Marcel, 29 sep, vraag 53, D): 1.
    hoofdgeldInDorp: 1,
  };
  const IN = () => T.TREDEN_INSTELLINGEN;

  // De standen, van laag naar hoog (Anno 1602; werklijst vraag 79 en 85): wie waar woont. `huis` is de soort uit
  // T.GEBOUWEN waar hij woont, `ook` de soorten die er ook bij horen. De boeren staan ernaast (`los`): hun boerderij groeit
  // niet. Een stand telt voor de treden (hierboven), de belasting (T.belastbaar, js/wetten.js), de kleren
  // (T.klerenVan, js/bewoners.js) en wat er kan branden (js/brand.js). Tot 16 okt wilde elke stand ook iets (js/wensen.js,
  // de wensen per huis: een put, bier, een kapel, laken, een markt); dat is weg (ronde 3 van het snoeien, stap 6).
  T.STANDEN = {
    keuters: { naam: T.t('cottars'), huis: 'hut' },
    dorpelingen: { naam: T.t('villagers'), huis: 'huis' },
    ambachtslieden: { naam: T.t('craftsmen'), huis: 'stenenHuis', ook: ['woontoren'] },
    boeren: { naam: T.t('farmers'), huis: 'boerderij', ook: ['wijnboerderij'], los: true },
  };
  const ladder = () => Object.keys(T.STANDEN).filter((s) => !T.STANDEN[s].los);

  // De stand van een gebouw, of null: het huis van de schout heeft er geen (dat is van jou), en een werkplaats ook niet.
  T.standVan = function (g) {
    if (!g || g.huis === 'schout') return null;
    for (const s of Object.keys(T.STANDEN)) if (T.STANDEN[s].huis === g.soort || (T.STANDEN[s].ook || []).includes(g.soort)) return s;
    return null;
  };

  // De stand onder deze op de ladder (de keuters onder de dorpelingen), of null: de onderste, en de boeren, die ernaast
  // staan.
  T.standOnder = function (stand) {
    const i = ladder().indexOf(stand);
    return i > 0 ? ladder()[i - 1] : null;
  };

  // Hoeveel mensen er in elk huis wonen: de bewoners met dat huis (js/bewoners.js). Wie op de heervaart is, telt mee: zijn
  // huis wacht op hem.
  T.mensenPerHuis = function (D) {
    const tel = new Map();
    for (const p of (D.bewoners && D.bewoners.mensen) || []) if (p.huis) tel.set(p.huis, (tel.get(p.huis) || 0) + 1);
    return tel;
  };

  // Hoeveel mensen er nu minstens deze stand hebben: wie in een huis van die stand woont, of van een stand erboven (de
  // boeren staan ernaast en tellen alleen voor zichzelf). Voor de treden (Marcel, 2 okt, vraag 90, A): een dorp bij 20
  // dorpelingen. Een huis dat versteent, blijft meetellen: anders werd een gehucht waar de huizen te vroeg versteenden,
  // nooit een dorp.
  T.mensenVanStand = function (D, stand) {
    const vanaf = ladder().indexOf(stand);
    const telt = (s) => (vanaf < 0 ? s === stand : ladder().indexOf(s) >= vanaf);
    let n = 0;
    for (const [g, m] of T.mensenPerHuis(D)) if (telt(T.standVan(g))) n += m;
    return n;
  };


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

  // Hoe een trede heet: als doel ("towards a village", "towards a market town"), en wat je dan bent ("Build — the
  // village", js/hud.js). Marktrecht heet in het Engels the market town (ontwerp/engels.md).
  const NAMEN = {
    gehucht: { doel: T.t('a hamlet'), is: T.t('the hamlet') },
    dorp: { doel: T.t('a village'), is: T.t('the village') },
    marktrecht: { doel: T.t('a market town'), is: T.t('the market town') },
    stad: { doel: T.t('a town'), is: T.t('the town') },
  };
  T.tredeNaam = (D) => NAMEN[D.trede || 'gehucht'].is;
  // Hoe een trede heet als doel ("a market town"): voor het briefje bij een huis dat pas daar doorgroeit (js/huisbriefje.js).
  T.tredeDoelNaam = (trede) => NAMEN[trede].doel;

  // Hoeveel mensen de eis telt, en hoe ze heten: { n, wie }. Met een stand wie die stand heeft of een erboven, zonder
  // iedereen.
  const geteld = (D, eis) => (eis.stand
    ? { n: T.mensenVanStand(D, eis.stand), wie: T.STANDEN[eis.stand].naam }
    : { n: D.bevolking || 0, wie: T.t('people') });

  // Hoeveel mensen de volgende trede nog vraagt, of 0 (ook als er geen trede meer te halen is): voor de raad
  // (js/raad.js), die zegt wat de groei doet zolang het doel mensen vraagt.
  T.tredeMensenNodig = function (D) {
    const trede = T.volgendeTrede(D);
    if (!trede) return 0;
    const eis = IN()[trede];
    return Math.max(0, eis.mensen - geteld(D, eis).n);
  };

  // Hoe het ervoor staat met de volgende trede: { kop, tekst, deel, klaar, trede }, of null als er niets te halen is.
  // `tekst` is voor het briefje linksboven: "12 of 20 villagers", of met de oude eis "43 of 50 people · a chapel ✓ ·
  // no smithy yet"; `deel` is hoe ver de mensen zijn (0 tot 1), voor de streep eronder (js/ui.js).
  T.tredeDoel = function (D) {
    const trede = T.volgendeTrede(D);
    if (!trede || !heeftTreden(D)) return null;
    const eis = IN()[trede];
    const delen = [];
    const { n, wie } = geteld(D, eis);
    const genoeg = n >= eis.mensen;
    delen.push(genoeg ? `${eis.mensen} ${wie} ✓` : T.t('{n} of {max} {wie}', { n, max: eis.mensen, wie }));
    let klaar = genoeg;
    for (const soort of eis.gebouwen || []) {
      const gebouw = T.GEBOUWEN[soort].naam;
      const lijst = (D.gebouwen || []).filter((g) => g.soort === soort);
      if (lijst.some((g) => g.klaar)) delen.push(`${T.eenNaam(gebouw)} ✓`);
      else {
        klaar = false;
        delen.push(lijst.length ? T.t('the {gebouw} is being built', { gebouw }) : T.t('no {gebouw} yet', { gebouw }));
      }
    }
    // De kop draagt de naam van je dorp, als het er een heeft: "Heathside · towards a village".
    const naam = T.dorpsnaam(D);
    const doel = NAMEN[trede].doel;
    const deel = Math.min(1, n / eis.mensen);
    return { kop: naam ? T.t('{naam} · towards {doel}', { naam, doel }) : T.t('Towards {doel}', { doel }), tekst: delen.join(' · '), deel, klaar, trede };
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
  const GEHAALD = {
    dorp: () => T.t('The hamlet has become a village.'),
    marktrecht: () => T.t('The village has become a market town.'),
  };
  T.wordtTrede = function (D, trede) {
    D.trede = trede;
    if (T.ui && T.ui.toonBrief) T.ui.toonBrief(D, trede);
    else T.zeg(D, GEHAALD[trede] ? GEHAALD[trede]() : T.t('It has become {trede}.', { trede: NAMEN[trede].is }), 'goed');
  };

  // Het hoofdgeld in deze trede, als factor op wat de heer per ziel vraagt (js/heer.js, T.eisVanDeHeer).
  T.hoofdgeldFactor = (D) => (T.tredeMinstens(D, 'dorp') ? IN().hoofdgeldInDorp : 1);

  // Wat de heer in zijn benoemingsbrief vraagt (js/brieven.js): "twenty souls in houses, not in huts" (de huizen van de
  // stand, en die van de stand eronder; T.STANDEN hierboven), of met de oude eis "a chapel, a smithy and fifty
  // souls".
  const TIENTALLEN = {
    20: T.t('twenty'), 30: T.t('thirty'), 40: T.t('forty'), 50: T.t('fifty'), 60: T.t('sixty'), 70: T.t('seventy'),
    80: T.t('eighty'), 90: T.t('ninety'), 100: T.t('a hundred'),
  };
  const huizenVan = (stand) => T.GEBOUWEN[T.STANDEN[stand].huis].meervoud;
  T.tredeEisTekst = function (trede) {
    const eis = IN()[trede];
    const zielen = T.t('{aantal} souls', { aantal: TIENTALLEN[eis.mensen] || eis.mensen });
    const gebouwen = (eis.gebouwen || []).map((s) => T.eenNaam(T.GEBOUWEN[s].naam));
    if (eis.stand) {
      const onder = T.standOnder(eis.stand);
      const waar = onder
        ? T.t('{zielen} in {huizen}, not in {onder}', { zielen, huizen: huizenVan(eis.stand), onder: huizenVan(onder) })
        : T.t('{zielen} in {huizen}', { zielen, huizen: huizenVan(eis.stand) });
      return T.opsomming([...gebouwen, waar]);
    }
    return T.opsomming([...gebouwen, zielen]);
  };

  // Hoe het dorp heet (Marcel, 29 sep, werklijst vraag 60: "speler mag zelf de naam voor zijn dorp kiezen aan het
  // begin"): je kiest het bij Nieuw spel (js/menu.js), met een van deze als voorstel. Het staat in S.dorpsnaam, en
  // de heer schrijft het in zijn brieven ("Our hamlet Heathside"). Zonder naam (een proefkaart, of een spel van
  // vóór 29 sep) is het "this hamlet".
  T.DORPSNAMEN = ['Heathside', 'Brookfield', 'Wolfden', 'Oldland', 'Millcombe', 'Oakley', 'Fieldhurst', 'Crowthorpe', 'Lindley', 'Brakeham']; // geen tekst: eigennamen
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
