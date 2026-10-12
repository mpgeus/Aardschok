// Twee bazen: de heer en het dorp kunnen je allebei wegsturen (werklijst vraag 106; Marcel, 3 okt: "106 a b c d ja", na
// "Kijk dat hele verstoppen verhaal is een beetje lame ... Of de gevolgen moeten echt groter zijn. Je wordt weg gevraagd
// als je niet ophoest wat ze willen hebben van je ofzo"). Het verstoppen zelf ging er op 11 okt uit (vraag 151).
//
// De haak ("De heer wil geld. Het dorp wil leven. Jij staat ertussen.") als de kern van het spel: twee meters, van 0 tot 100.
//   gunst       wat de heer van je vindt: de schatting op Sint-Maarten, de heervaart, of je naar hem toe kwam, en een
//               erf of een werkplaats in zijn bos (js/bos.js).
//   vertrouwen  wat het dorp van jóú vindt, niet hoe tevreden het is: je antwoorden op de voorvallen (zo zwaar als ze het
//               dorp tevreden of ontevreden maken), wie je naar de oorlog stuurde of vrijkocht, wie je aan de
//               schandpaal zette, wie verhongerde of bevroor, wie sneuvelde, de soldaten van de heer in huis, en wie
//               wegtrok na twee keer nee. En elke dag gaat het een stukje naar hoe tevreden het dorp is, zodat een
//               klap in een paar maanden wegslijt.
// Zakt een meter onder `waarschuwing`, dan krijg je een waarschuwing: de heer in een brief, of het dorp mort. Op 0 ben je
// weg: de heer ontslaat je (T.ambtKwijt, js/heer.js), of het dorp jaagt je weg (D.einde, reden 'verjaagd'). Maar altijd
// eerst de waarschuwing: wie er nog geen kreeg, zakt niet verder dan de laatste waarschuwing (naar, hieronder).
//
// De spelregel "Twee bazen" (aan, de standaard). Uit is het spel van vóór 3 okt: geen meters, en de heer ontslaat je pas
// na twee jaar veel te weinig (js/heer.js).
//
// D.bazen: { gunst, vertrouwen, waarom: { gunst: [{ dag, n, tekst }], vertrouwen: [...] } (het laatste, voor de balk),
//            gewaarschuwd: { gunst, vertrouwen }, waarschuwingen: { gunst, vertrouwen } (hoe vaak),
//            brief: { waarom, dag } (de brief met de waarschuwing, js/brieven.js) }
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
    // Wie nog geen waarschuwing kreeg, zakt niet verder dan dit: de volgende tegenvaller is je ambt.
    laatsteWaarschuwing: 5,
    // De heer. Wat de schatting op Sint-Maarten doet, naar de straf die erbij hoort (js/heer.js): goed betaald, een boete,
    // ook soldaten, ook de schandpaal.
    schatting: { goed: 15, boete: -10, soldaten: -25, schandpaal: -40 },
    // Je kwam niet naar het plein, en hij nam het zelf.
    nietGekomen: -10,
    // De heervaart (js/heervaart.js): je stuurde de mannen, kocht ze vrij, of hij haalde ze op omdat je niet antwoordde.
    heervaart: { gestuurd: 10, vrijgekocht: 5, gehaald: -10 },
    // Het dorp. Een antwoord op een voorval telt zo zwaar als het het dorp tevreden of ontevreden maakt (doe.tevreden,
    // in procenten), keer zoveel; besliste je raadsman, dan keer doorRaadsman.
    voorval: 0.5,
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
    // De schandpaal: zette je jezelf eraan, dan zoveel erbij; iemand anders, dan wat het het dorp aan tevredenheid kost
    // (T.HEER_INSTELLINGEN.schandpaalKost) keer zoveel eraf.
    schandpaalZelf: 10,
    schandpaalPerAanzien: 100,
    // Elke dag gaat het vertrouwen een stukje naar hoe tevreden het dorp is (de tevredenheid × 100): het verschil gedeeld
    // door zoveel dagen. Een tevreden dorp vertrouwt je, en wat je het aandeed, slijt in een paar maanden weg; een dorp
    // dat het slecht heeft, vertrouwt je weinig, en een klap erbij jaagt je weg (werklijst vraag 106, stap 3; Marcel,
    // 3 okt: "vertrouwen ook ja"). Tot 3 okt kwam er elke dag (tevredenheid − 0,75) × 0,15 bij: dan telde het alleen de
    // klappen op, en zakte het bij iedereen die lang genoeg speelde, ook in een dorp dat 90% tevreden was (speelbaar.md).
    volgDagen: 60,
  };
  const IN = () => T.BAZEN_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);

  T.nieuweBazen = () => ({
    gunst: IN().gunstBegin, vertrouwen: IN().vertrouwenBegin,
    waarom: { gunst: [], vertrouwen: [] }, gewaarschuwd: { gunst: false, vertrouwen: false }, brief: null,
    waarschuwingen: { gunst: 0, vertrouwen: 0 },
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
  function wijzig(D, welk, n, tekst) {
    if (!T.bazenTellen(D) || !n || D.einde) return;
    const b = bazenVan(D);
    const voor = b[welk];
    b[welk] = naar(b, welk, voor + n);
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
  // kwijt").
  function naar(b, welk, n) {
    const x = Math.max(0, Math.min(100, n));
    return x <= 0 && !b.gewaarschuwd[welk] ? IN().laatsteWaarschuwing : x;
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
    const n = b.waarschuwingen || (b.waarschuwingen = { gunst: 0, vertrouwen: 0 }); // een spel van vóór de telling
    n[welk]++;
    if (welk === 'gunst') {
      b.brief = { waarom: waaromZin(tekst), dag: dagNu(D) };
      if (T.ui && T.ui.toonBrief && !D.ander) T.ui.toonBrief(D, 'waarschuwing');
      else T.zeg(D, T.t('The lord writes to you: "Once more, reeve."'), 'gevaar');
    } else {
      T.zeg(D, T.t('The village grumbles. On the square they talk about you, and when you come, they fall silent. One more setback, and they will drive you out.'), 'gevaar');
    }
  }
  // Wat de heer in zijn brief zegt, naar wat zijn gunst het laatst deed zakken.
  function waaromZin(tekst) {
    if (!tekst) return T.t('We are not pleased with you.');
    return T.t('We are not pleased with you. {waarom}: We have seen it.', { waarom: T.hoofdletter(tekst) });
  }

  // Op 0: weg. De heer ontslaat je (js/heer.js), of het dorp jaagt je weg.
  function weg(D, welk, tekst) {
    if (D.einde) return;
    if (welk === 'gunst') {
      T.ambtKwijt(D, tekst ? T.t('His favour is spent: {waarom}.', { waarom: tekst }) : T.t('His favour is spent.'));
      return;
    }
    D.einde = { reden: 'verjaagd', dag: dagNu(D), waarom: tekst || null };
    T.zeg(D, T.t('The village stands at your door, with torches. "Go, reeve." You go.'), 'gevaar');
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
    if (reden === 'winter') T.wijzigVertrouwen(D, -verschil * IN().doodDoorWinter, T.t('those who starved or froze'));
    if (reden === 'gesneuveld') T.wijzigVertrouwen(D, -verschil * IN().gesneuveld, T.t('those who fell'));
  };

  // ---------------------------------------------------------------------------------------------
  // Elke dag
  // ---------------------------------------------------------------------------------------------

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, na de behoeften): het vertrouwen gaat een stukje naar hoe tevreden het
  // dorp is.
  T.tikBazenDag = function (D) {
    const doel = vertrouwenDoel(D);
    if (doel == null || D.einde) return;
    wijzig(D, 'vertrouwen', (doel - bazenVan(D).vertrouwen) / IN().volgDagen, null);
  };
  // Waar het vertrouwen heen gaat: de tevredenheid × 100, of null (zonder de spelregel, of zolang er geen is).
  function vertrouwenDoel(D) {
    const t = T.bazenTellen(D) && D.behoeften ? D.behoeften.tevredenheid : null;
    return t == null ? null : Math.round(t * 100);
  }

  // ---------------------------------------------------------------------------------------------
  // Voor het scherm (js/hud.js) en de raad (js/raad.js)
  // ---------------------------------------------------------------------------------------------

  // Hoe hij erbij staat, in een woord: blij, tevreden, ontevreden, boos (onder de waarschuwing). Een naam waar de regels op
  // letten (js/tafel.js); wat de speler ziet, staat in STEMMING.
  T.bazenStemming = (n) => (n >= 70 ? 'blij' : n >= 40 ? 'tevreden' : n >= IN().waarschuwing ? 'ontevreden' : 'boos');
  const STEMMING = { blij: T.t('pleased'), tevreden: T.t('content'), ontevreden: T.t('displeased'), boos: T.t('angry') };

  // Wat er bij de muis staat: het getal, hoe hij erbij staat, het laatste waarom, en wat er gebeurt onder de grens.
  T.bazenTekst = function (D, welk) {
    const b = bazenVan(D);
    const n = Math.round(b[welk]);
    const stemming = STEMMING[T.bazenStemming(n)];
    const recent = b.waarom[welk].slice().reverse().map((w) => `${w.n > 0 ? '+' : ''}${w.n} ${w.tekst}`).join('; ');
    const doel = vertrouwenDoel(D);
    const grens = IN().waarschuwing;
    const kop = welk === 'gunst'
      ? T.t("The lord's favour: {n} (the lord is {stemming}).", { n, stemming })
      : T.t("The village's trust: {n} (the village is {stemming}).", { n, stemming });
    const laatst = recent ? ` ${T.t('Lately: {recent}.', { recent })}` : '';
    const onder = welk === 'gunst'
      ? T.t('Below {grens} he writes you a warning; at 0 you lose your office.', { grens })
      : `${doel == null ? T.t('Every day it moves a little towards how content the village is.')
        : T.t('Every day it moves a little towards how content the village is ({doel}%).', { doel })} `
        + T.t('Below {grens} the village grumbles; at 0 they drive you out.', { grens });
    return `${kop}${laatst} ${onder}`;
  };
})(globalThis.Spel = globalThis.Spel || {});
