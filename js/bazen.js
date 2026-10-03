// Twee bazen: de heer en het dorp kunnen je allebei wegsturen (werklijst vraag 106; Marcel, 3 okt: "106 a b c d ja", na
// "Kijk dat hele verstoppen verhaal is een beetje lame ... Of de gevolgen moeten echt groter zijn. Je wordt weg gevraagd
// als je niet ophoest wat ze willen hebben van je ofzo").
//
// De haak ("De heer wil geld. Het dorp wil leven. Jij staat ertussen.") als de kern van het spel: twee meters, van 0 tot 100.
//   gunst       wat de heer van je vindt: de schatting op Sint-Maarten, de heervaart, of je naar hem toe kwam, en wat
//               zijn soldaten vinden (wapens, en wat je verstopte).
//   vertrouwen  wat het dorp van jóú vindt, niet hoe tevreden het is: je antwoorden op de voorvallen (zo zwaar als ze het
//               dorp tevreden of ontevreden maken), wie je naar de oorlog stuurde of vrijkocht, wie je aan de
//               schandpaal zette, wie verhongerde of bevroor, wie sneuvelde, de soldaten van de heer in huis, en wie
//               wegtrok na twee keer nee; en langzaam, elke dag, hoe het gaat (de tevredenheid).
// Zakt een meter onder `waarschuwing`, dan krijg je een waarschuwing: de heer in een brief, of het dorp mort. Op 0 ben je
// weg: de heer ontslaat je (T.ambtKwijt, js/heer.js), of het dorp jaagt je weg (D.einde, reden 'verjaagd'). Maar altijd
// eerst de waarschuwing: wie er nog geen kreeg, zakt niet verder dan de laatste waarschuwing (naar, hieronder). Wie
// betrapt wordt op verstoppen (T.zoekOpPlek, js/verstoppen.js), krijgt de laatste waarschuwing, en had hij die al, dan
// is hij weg; met de spelregel "Betrapt" op "Meteen weg" altijd meteen.
//
// De spelregel "Twee bazen" (aan, de standaard). Uit is het spel van vóór 3 okt: geen meters, en de heer ontslaat je pas
// na twee jaar veel te weinig (js/heer.js).
//
// D.bazen: { gunst, vertrouwen, waarom: { gunst: [{ dag, n, tekst }], vertrouwen: [...] } (het laatste, voor de balk),
//            gewaarschuwd: { gunst, vertrouwen }, brief: { waarom, dag } (de brief met de waarschuwing, js/brieven.js),
//            betraptOp (de dag dat zijn soldaten iets vonden) }
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js). Een eerste gok.
  T.BAZEN_INSTELLINGEN = {
    // De spelregel "Twee bazen".
    aan: true,
    // Waar ze beginnen: de heer kent je nog niet, het dorp ook niet.
    gunstBegin: 50,
    vertrouwenBegin: 50,
    // Onder deze grens een waarschuwing; op 0 ben je weg. Een nieuwe waarschuwing komt pas als hij eerst weer zoveel
    // boven de grens kwam.
    waarschuwing: 20,
    opnieuwBoven: 10,
    // De spelregel "Betrapt": wie betrapt wordt op verstoppen, krijgt de laatste waarschuwing ('waarschuwing': de gunst
    // zakt tot `laatsteWaarschuwing`, en de volgende tegenvaller is je ambt) of is meteen weg ('weg').
    betrapt: 'waarschuwing',
    laatsteWaarschuwing: 5,
    // De heer. Wat de schatting op Sint-Maarten doet, naar de straf die erbij hoort (js/heer.js): goed betaald, een boete,
    // ook soldaten, ook de schandpaal.
    schatting: { goed: 15, boete: -10, soldaten: -25, schandpaal: -40 },
    // Je kwam niet naar het plein, en hij nam het zelf.
    nietGekomen: -10,
    // De heervaart (js/heervaart.js): je stuurde de mannen, kocht ze vrij, of hij haalde ze op omdat je niet antwoordde.
    heervaart: { gestuurd: 10, vrijgekocht: 5, gehaald: -10 },
    // Zijn soldaten vonden wapens (js/ondernemers.js).
    wapens: -30,
    // Het dorp. Een antwoord op een voorval telt zo zwaar als het het dorp tevreden of ontevreden maakt (doe.tevreden,
    // in procenten), keer zoveel; besliste je raadsman, dan keer doorRaadsman.
    voorval: 1,
    doorRaadsman: 0.5,
    // Wie je zocht, vond je niet, of je had geen tijd.
    nietGevonden: -2,
    // De heervaart: mannen naar de oorlog, of vrijgekocht.
    heervaartWeg: -8,
    heervaartVrij: 8,
    // Per mens die verhongerde of bevroor (de winter, js/behoeften.js), en per mens die sneuvelde (tegen de rovers, of
    // in de oorlog van de heer).
    doodDoorWinter: -3,
    gesneuveld: -2,
    // Soldaten van de heer in huis (een straf van Sint-Maarten).
    soldaten: -10,
    // De schandpaal: zette je jezelf eraan, dan zoveel erbij; iemand anders, dan zijn aanzien (js/boeren.js: wat het
    // het dorp aan tevredenheid kost) keer zoveel eraf.
    schandpaalZelf: 10,
    schandpaalPerAanzien: 100,
    // Een ondernemer trok weg na twee keer nee (js/ondernemers.js).
    wegGetrokken: -10,
    // Elke dag, langzaam: wie het lang slecht heeft, geeft de schout de schuld, en wie het goed heeft, gunt het hem.
    // (tevredenheid − midden) × perDag.
    midden: 0.6,
    perDag: 0.25,
  };
  const IN = () => T.BAZEN_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const NAAM = { gunst: 'de gunst van de heer', vertrouwen: 'het vertrouwen van het dorp' };

  T.nieuweBazen = () => ({
    gunst: IN().gunstBegin, vertrouwen: IN().vertrouwenBegin,
    waarom: { gunst: [], vertrouwen: [] }, gewaarschuwd: { gunst: false, vertrouwen: false }, brief: null,
  });
  const bazenVan = (D) => D.bazen || (D.bazen = T.nieuweBazen());

  // Tellen ze hier? Met de spelregel aan, en waar de heer kan komen (een wereld met een plein, js/heer.js): een
  // proefkaart heeft geen heer en geen dorp dat je kan wegsturen.
  T.bazenTellen = (D) => IN().aan && !!(D && D.wereld && (D.wereld.heer || D.wereld.marskramer));

  // ---------------------------------------------------------------------------------------------
  // De meters
  // ---------------------------------------------------------------------------------------------

  // Een meter verandert, met waarom (voor de balk; een kleine verandering van elke dag schrijft hij niet op). Zakt hij
  // onder de grens, dan de waarschuwing; op 0 ben je weg.
  function wijzig(D, welk, n, tekst, hard) {
    if (!T.bazenTellen(D) || !n || D.einde) return;
    const b = bazenVan(D);
    const voor = b[welk];
    b[welk] = naar(b, welk, voor + n, hard);
    if (tekst && Math.abs(n) >= 1) {
      const log = b.waarom[welk];
      log.push({ dag: dagNu(D), n: Math.round(b[welk] - voor), tekst });
      if (log.length > 5) log.shift();
    }
    kijk(D, welk, tekst);
    if (T.ui && T.ui.toonBazen) T.ui.toonBazen(D);
  }
  // Waar een meter heen gaat: tussen 0 en 100. Wie nog geen waarschuwing kreeg, komt niet verder dan de laatste
  // waarschuwing: je ziet het aankomen (werklijst vraag 106, a: "met een duidelijke waarschuwing, en dan ben je je ambt
  // kwijt"). `hard` (betrapt na een waarschuwing, of met de spelregel "meteen weg"): wel.
  function naar(b, welk, n, hard) {
    const x = Math.max(0, Math.min(100, n));
    return x <= 0 && !hard && !b.gewaarschuwd[welk] ? IN().laatsteWaarschuwing : x;
  }
  T.wijzigGunst = (D, n, tekst) => wijzig(D, 'gunst', n, tekst);
  T.wijzigVertrouwen = (D, n, tekst) => wijzig(D, 'vertrouwen', n, tekst);

  function kijk(D, welk, tekst) {
    const b = bazenVan(D);
    if (b[welk] <= 0) return weg(D, welk, tekst);
    if (b[welk] >= IN().waarschuwing + IN().opnieuwBoven) b.gewaarschuwd[welk] = false;
    if (b[welk] < IN().waarschuwing && !b.gewaarschuwd[welk]) waarschuw(D, welk, tekst);
  }

  // De waarschuwing: de heer schrijft je een brief (js/brieven.js, soort 'waarschuwing'); het dorp mort, en de raad
  // onder het doel zegt het (js/raad.js).
  function waarschuw(D, welk, tekst) {
    const b = bazenVan(D);
    b.gewaarschuwd[welk] = true;
    if (welk === 'gunst') {
      b.brief = { waarom: waaromZin(tekst), dag: dagNu(D) };
      if (T.ui && T.ui.toonBrief && !D.ander) T.ui.toonBrief(D, 'waarschuwing');
      else T.zeg(D, `De heer schrijft je: "Nog één keer, schout."`, 'gevaar');
    } else {
      T.zeg(D, 'Het dorp mort. Op het plein praten ze over je, en als je komt, zwijgen ze. Nog één tegenvaller, en ze jagen je weg.', 'gevaar');
    }
  }
  // Wat de heer in zijn brief zegt, naar wat zijn gunst het laatst deed zakken.
  function waaromZin(tekst) {
    if (!tekst) return 'Wij zijn niet tevreden over u.';
    return `Wij zijn niet tevreden over u. ${T.hoofdletter(tekst)}: Wij hebben het gezien.`;
  }

  // Op 0: weg. De heer ontslaat je (js/heer.js), of het dorp jaagt je weg.
  function weg(D, welk, tekst) {
    if (D.einde) return;
    if (welk === 'gunst') {
      T.ambtKwijt(D, tekst ? `Zijn gunst is op: ${tekst}.` : 'Zijn gunst is op.');
      return;
    }
    D.einde = { reden: 'verjaagd', dag: dagNu(D), waarom: tekst || null };
    T.zeg(D, 'Het dorp staat voor je deur, met fakkels. "Ga, schout." Je gaat.', 'gevaar');
    if (!D.ander) T.houdTijdStil(D, 'einde');
    if (T.ui && T.ui.toonEinde) T.ui.toonEinde(D);
  }

  // Wat de meters nu zijn: { gunst, vertrouwen } (zonder de spelregel: null).
  T.bazenNu = (D) => (T.bazenTellen(D) ? { gunst: bazenVan(D).gunst, vertrouwen: bazenVan(D).vertrouwen } : null);

  // ---------------------------------------------------------------------------------------------
  // Wat ze beweegt (vanuit de regels waar het gebeurt)
  // ---------------------------------------------------------------------------------------------

  // De schatting (js/heer.js, T.gevolgVanBetaling): wat zijn gunst doet, naar de straf, en waar hij dan staat.
  // { erbij, na } (zonder de spelregel: null).
  T.gunstNaSchatting = function (D, straf) {
    if (!T.bazenTellen(D)) return null;
    const erbij = IN().schatting[straf || 'goed'] || 0;
    const b = bazenVan(D);
    return { erbij, na: naar(b, 'gunst', b.gunst + erbij) };
  };

  // Een antwoord op een voorval (js/voorvallen.js): zo zwaar als het het dorp tevreden maakt, en minder als je raadsman
  // het besliste.
  T.vertrouwenNaVoorval = (D, tevreden, titel, doorRaadsman) =>
    T.wijzigVertrouwen(D, tevreden * IN().voorval * (doorRaadsman ? IN().doorRaadsman : 1), titel);

  // Wie het dorp verlaat (T.wijzigBevolking, js/gebouwen.js): wie verhongerde of bevroor, en wie sneuvelde.
  T.vertrouwenNaBevolking = function (D, verschil, reden) {
    if (verschil >= 0) return;
    if (reden === 'winter') T.wijzigVertrouwen(D, -verschil * IN().doodDoorWinter, 'wie verhongerde of bevroor');
    if (reden === 'gesneuveld') T.wijzigVertrouwen(D, -verschil * IN().gesneuveld, 'wie sneuvelde');
  };

  // Betrapt: zijn soldaten vonden wat je verstopte (js/verstoppen.js). De laatste waarschuwing, of meteen weg.
  // Eén keer per dag: vinden ze in één zoektocht twee plekken, dan is dat één keer betrapt.
  T.betrapt = function (D) {
    if (!T.bazenTellen(D) || D.einde) return;
    const b = bazenVan(D);
    if (b.betraptOp === dagNu(D)) return;
    b.betraptOp = dagNu(D);
    const tekst = 'zijn soldaten vonden wat je verstopte';
    // Meteen weg (de spelregel), of je had je waarschuwing al: dan is dit de tegenvaller te veel.
    if (IN().betrapt === 'weg' || b.gewaarschuwd.gunst) {
      wijzig(D, 'gunst', -b.gunst, tekst, true);
      return;
    }
    const tot = Math.min(b.gunst, IN().laatsteWaarschuwing);
    if (tot < b.gunst) wijzig(D, 'gunst', tot - b.gunst, tekst);
    else kijk(D, 'gunst', tekst);
  };

  // ---------------------------------------------------------------------------------------------
  // Elke dag
  // ---------------------------------------------------------------------------------------------

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, na de behoeften): het vertrouwen volgt langzaam hoe het gaat.
  T.tikBazenDag = function (D) {
    if (!T.bazenTellen(D) || !D.behoeften || D.einde) return;
    const t = D.behoeften.tevredenheid;
    if (t == null) return;
    wijzig(D, 'vertrouwen', (t - IN().midden) * IN().perDag, null);
  };

  // ---------------------------------------------------------------------------------------------
  // Voor het scherm (js/hud.js) en de raad (js/raad.js)
  // ---------------------------------------------------------------------------------------------

  // Hoe hij erbij staat, in een woord: blij, tevreden, ontevreden, boos (onder de waarschuwing).
  T.bazenStemming = (n) => (n >= 70 ? 'blij' : n >= 40 ? 'tevreden' : n >= IN().waarschuwing ? 'ontevreden' : 'boos');

  // Wat er bij de muis staat: het getal, hoe hij erbij staat, het laatste waarom, en wat er gebeurt onder de grens.
  T.bazenTekst = function (D, welk) {
    const b = bazenVan(D);
    const n = Math.round(b[welk]);
    const wie = welk === 'gunst' ? 'De heer' : 'Het dorp';
    const recent = b.waarom[welk].slice().reverse().map((w) => `${w.n > 0 ? '+' : ''}${w.n} ${w.tekst}`).join('; ');
    const grens = welk === 'gunst'
      ? `Onder ${IN().waarschuwing} schrijft hij je een waarschuwing, op 0 ben je je ambt kwijt.`
      : `Onder ${IN().waarschuwing} mort het dorp, op 0 jagen ze je weg.`;
    return `${T.hoofdletter(NAAM[welk])}: ${n} (${wie.toLowerCase()} is ${T.bazenStemming(n)}).${recent ? ` Het laatst: ${recent}.` : ''} ${grens}`;
  };
})(globalThis.Spel = globalThis.Spel || {});
