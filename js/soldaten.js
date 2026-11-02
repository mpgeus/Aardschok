// De soldaten (werklijst vraag 159; Marcel, 14 okt: "Iedereen is een mens, elk mens kan iets worden. Iemand pakt een
// zwaard en schild -> zwaardvechter. Speer - spearman etc. Zoals Knights and merchants het doet", op het plan van 15 okt
// "A1, B1, C1, D1", en over de wapens: "sword, spear, shield, pike, bow, crossbow, armor", met vaste soorten).
//
// Soldaat word je in het wachthuis (A1): op zijn briefje zet je per soort hoeveel soldaten je wilt, samen hooguit
// `plaatsen`. Elke soort heeft vaste stukken (T.SOLDAAT_SOORTEN, zoals in Knights and Merchants): de militie een
// hooivork, de speerman speer en harnas (Marcel, 21 okt: "Speer is een 2 handed weapon": geen schild, zoals de lansdrager in
// Knights and Merchants), de piekenier piek en harnas, de zwaardvechter zwaard, schild en harnas, de
// boogschutter een boog, de kruisboogschutter kruisboog en harnas, en de ridder zwaard, schild, harnas en paard (Marcel, 1
// nov: "Ja, hij is duur, schild, zwaard, harnas en paard"). Liggen al zijn stukken in de opslag, dan pakt wie
// geen werk heeft (B1: geen werkplaats en geen boerderij; wie alleen meebouwt, wel), volwassen of jong, en niet van het
// gezin van de aanvoerder, ze op, en is hij soldaat: hij werkt en bouwt niet meer, eet mee zoals iedereen, staat in zijn
// dienst bij het wachthuis en slaapt daarbuiten thuis (de dag- of de nachtdienst, js/kiezen.js; vraag 170, stap 4). Zet
// je er een minder, dan levert hij zijn stukken weer in en is hij vrij. Valt hij, dan zijn ze weg. Een hooivork heeft
// elke boer: daarvoor hoeft er niets in de opslag te liggen, en wie zonder soort meevecht (een veteraan, wie met de
// bode meegaat, de jacht op de wolven), vecht ermee.
//
// De stukken maakt de wapenmaker (T.GEBOUWEN.wapenmaker, in het gehucht; C1, en Marcel erbij: "iemand kan gewoon
// wapensmid worden"): elke dag één, het stuk dat het meest gevraagd wordt (T.wapensGevraagd: wat de wachthuizen willen en
// nog niet hebben), van planken, ijzer of huiden (T.receptVan, js/gebouwen.js). Vraagt niemand iets, dan staat hij stil.
// Een paard maakt hij niet: dat komt uit de stal (T.GEBOUWEN.stal), en de marskramer heeft er soms een (js/handel.js).
//
// In het gevecht (js/gevecht.js) slaat elk wapen anders (D1; T.slagVan): de hooivork zwak, de speer en de piek reiken twee
// tegels (de piek slaat harder; opzij alleen van ernaast, steekReik in js/gevecht.js), het zwaard hard, en de boog en de kruisboog schieten ver waar ze zien, maar niet met een
// vijand naast zich. Schild en harnas vangen een deel van elke klap af (T.vangtAf), behalve van een bout uit een
// kruisboog. De getallen staan in T.SOLDATEN_INSTELLINGEN (in de werkbank).
//
// In het dorp: g.soldaten = { militie, speerman, ... } op een wachthuis (hoeveel je er wilt), en p.soldaat =
// { soort, wachthuis, sinds } op een bewoner (sinds: de dag dat hij soldaat werd). Zonder scherm, en dus getoetst
// (test/soldaten.test.cjs).
//
// Valt de aanvoerder, dan neemt een veteraan het over, anders de soldaat die het langst dient (onderaan; vraag 170, stap 5).
(function (T) {
  'use strict';

  T.SOLDATEN_INSTELLINGEN = {
    // Zoveel soldaten heeft een wachthuis (A1).
    plaatsen: 6,
    // Per wapen: wat een slag kost aan actiepunten, de schade [van, tot], en tot hoeveel tegels ver hij raakt (1 is
    // ernaast).
    wapens: {
      hooivork: { kosten: 3, schade: [2, 3], bereik: 1 },
      speer: { kosten: 3, schade: [3, 5], bereik: 2 },
      piek: { kosten: 3, schade: [4, 6], bereik: 2 },
      zwaard: { kosten: 3, schade: [5, 7], bereik: 1 },
      // `mis`: zo vaak mist een pijl of een bout, en valt hij naast zijn doel (js/gevecht.js; Marcel, 2 nov: "Boogschutters
      // raken niet altijd ... 30%?", en voor de kruisboog "Minder: 15 %", en daarna 25 %: "1. C", toen de zware mix 88 % won)
      boog: { kosten: 4, schade: [2, 4], bereik: 8, mis: 0.3 },
      kruisboog: { kosten: 4, schade: [2, 4], bereik: 8, mis: 0.25 },
      // De knots (3e; Marcel, 2 nov: "ze vallen wel langzaam aan, het is een zwaar wapen", en "3. Ja prima"): langzamer dan een
      // zwaard (elke 1,6 seconde), maar door het harnas heen (`breektHarnas` bij het stuk, T.vangtAf).
      knots: { kosten: 4, schade: [4, 6], bereik: 1 },
      // Geen stuk: het mes van een schutter die een vijand naast zich heeft en niet weg kan (js/gevecht.js; Marcel, 2 nov:
      // "1. A": zwak, zodat hij geen schietschijf is maar kansloos tegen een zwaardvechter).
      mes: { kosten: 3, schade: [1, 3], bereik: 1 },
    },
    // Zoveel schade vangt het van elke klap af. Het schild 1 sinds Marcel, 2 nov: "Ja, schild 1" (was 2: een zwaardvechter
    // ving zo 3 af, een speer deed hem 0 tot 2, en de zware mix won 85 % van zijn slagen).
    bescherming: { schild: 1, harnas: 1 },
    // Het leven van een soldaat, per soort (Marcel, 2 nov: "C. Eigen hoeveelheid leven"; T.levenAlsMan, js/rovers.js). Tot
    // dan had iedereen 16 (T.WEZENS.soldaat), en was een boogschutter 16 leven voor 2 punten. De ruiter en de ridder houden
    // wat hun paard ze gaf (anderhalf en twee maal 16).
    // De zwaardvechter 18 sinds Marcel, 2 nov: "1. C" (was 20; de zware mix won toen 88 %).
    leven: { militie: 12, speerman: 16, piekenier: 16, zwaardvechter: 18, knotsdrager: 16, boogschutter: 12, kruisboogschutter: 14, ruiter: 24, ridder: 32 },
    // Wat zijn paard de ridder geeft: zoveel maal zijn pas (T.snelheidVan, js/wereld.js).
    ridder: { snelheid: 1.6 },
    // En de lichte ruiter (Marcel, 2 nov: "een vlotte soldaat te paard naast de knight. een lichtere variant dus", en "2. A":
    // een gewoon paard): sneller dan de ridder (en met minder leven, hierboven: hij heeft geen harnas en geen schild).
    ruiter: { snelheid: 2 },
  };
  const IN = () => T.SOLDATEN_INSTELLINGEN;

  // De stukken: de waar in de opslag (de hooivork heeft er geen: die heeft elke boer), of het een wapen is, of hij schiet
  // (op afstand, waar hij ziet, en niet met een vijand naast zich), en of schild en harnas ervan niets afvangen.
  const STUKKEN = {
    hooivork: { waar: null, wapen: true, naam: () => T.t('pitchfork') },
    speer: { waar: 'speren', wapen: true, naam: () => T.t('spear') },
    piek: { waar: 'pieken', wapen: true, naam: () => T.t('pike') },
    zwaard: { waar: 'zwaarden', wapen: true, naam: () => T.t('sword') },
    // de knots slaat door het harnas heen (Marcel, 28 okt: K2; 2 nov: "2. A": het schild vangt wel af)
    knots: { waar: 'knotsen', wapen: true, breektHarnas: true, naam: () => T.t('mace') },
    boog: { waar: 'bogen', wapen: true, schiet: true, naam: () => T.t('bow') },
    kruisboog: { waar: 'kruisbogen', wapen: true, schiet: true, doorHarnas: true, naam: () => T.t('crossbow') },
    schild: { waar: 'schilden', naam: () => T.t('shield') },
    harnas: { waar: 'harnassen', naam: () => T.t('armour') }, // van leer; een ijzeren harnas komt later
    paard: { waar: 'paarden', naam: () => T.t('horse') },
  };
  T.STUKKEN = STUKKEN;
  // Is deze waar een stuk (een speer, een schild, ...)? Die bestaan alleen heel: de wapenmaker maakt ze heel (T.receptVan,
  // js/gebouwen.js), en de kar laadt ze heel (js/kar.js).
  const STUK_WAREN = new Set(Object.values(STUKKEN).map((s) => s.waar).filter(Boolean));
  T.isStuk = (wat) => STUK_WAREN.has(wat);

  // De soorten soldaten, in de volgorde van het briefje, met hun stukken (het wapen eerst).
  T.SOLDAAT_SOORTEN = {
    militie: { stukken: ['hooivork'], naam: () => T.t('militia') },
    speerman: { stukken: ['speer', 'harnas'], naam: () => T.t('spearman') },
    piekenier: { stukken: ['piek', 'harnas'], naam: () => T.t('pikeman') },
    zwaardvechter: { stukken: ['zwaard', 'schild', 'harnas'], naam: () => T.t('swordsman') },
    // De knotsdrager (3e; Marcel, 28 okt: "Maceman", ook in het dorp; 2 nov: "Mace en heavy leather armour"): zijn figuur
    // maakt een lokale sessie, het vel `knotsdrager` (js/sprites.js); tot dan loopt hij als dorpeling.
    knotsdrager: { stukken: ['knots', 'harnas'], naam: () => T.t('maceman') },
    boogschutter: { stukken: ['boog'], naam: () => T.t('archer') },
    kruisboogschutter: { stukken: ['kruisboog', 'harnas'], naam: () => T.t('crossbowman') },
    // De lichte ruiter (2 nov): tot hij een eigen figuur heeft, leent hij dat van de ridder (`leent`, js/sprites.js).
    ruiter: { stukken: ['speer', 'paard'], naam: () => T.t('horseman'), leent: 'ridder' },
    ridder: { stukken: ['zwaard', 'schild', 'harnas', 'paard'], naam: () => T.t('knight') },
  };
  const SOORTEN = Object.keys(T.SOLDAAT_SOORTEN);
  T.soortNaam = (soort) => T.SOLDAAT_SOORTEN[soort].naam();
  // Wat een soldaat van deze soort kost in een veldslag (js/veldslag.js; scenario.md, 7: "De prijs van een soldaat is de
  // waarde van zijn stukken"): de waarde van zijn stukken in goud (T.waardeVan, js/einde.js), de hooivork, die geen waar
  // is, op zijn eigen naam. Zo is er geen tweede prijslijst: een speerman kost 4, de militie 1 (B1).
  T.soldaatPrijs = (soort) => stukkenVan(soort).reduce((som, stuk) => som + T.waardeVan(STUKKEN[stuk].waar || stuk), 0);
  T.stukNaam = (stuk) => STUKKEN[stuk].naam();
  const stukkenVan = (soort) => T.SOLDAAT_SOORTEN[soort].stukken;

  const mensen = (D) => (D.bewoners ? D.bewoners.mensen : []);
  const wachthuizen = (D) => (D.gebouwen || []).filter((g) => g.soort === 'wachthuis' && g.klaar);
  // Hoeveel soldaten je bij wachthuis g wilt, per soort.
  const gewild = (g) => g.soldaten || (g.soldaten = Object.fromEntries(SOORTEN.map((s) => [s, 0])));
  const som = (o) => SOORTEN.reduce((n, s) => n + (o[s] || 0), 0);
  const ligt = (D, waar) => (D.voorraad && D.voorraad[waar]) || 0;

  // De soldaten van het dorp, of van wachthuis g.
  T.soldatenVan = (D, g) => mensen(D).filter((p) => p.soldaat && (!g || p.soldaat.wachthuis === g));
  const vanSoort = (D, g, soort) => T.soldatenVan(D, g).filter((p) => p.soldaat.soort === soort);

  // Hoeveel wapens er in de opslag liggen, alle soorten samen (de bode, js/bode.js: met een wapen voor elke man vechten
  // ze beter).
  T.wapensInHetDorp = function (D) {
    let n = 0;
    for (const stuk in STUKKEN) if (STUKKEN[stuk].wapen && STUKKEN[stuk].waar) n += ligt(D, STUKKEN[stuk].waar);
    return Math.floor(n + 1e-9);
  };

  // Wat de wachthuizen vragen: per waar hoeveel stukken er nodig zijn voor de soldaten die gewild zijn en er nog niet zijn.
  // Tot zoveel maakt de wapenmaker (T.maaktTot, js/gebouwen.js), min wat er al ligt.
  T.wapensGevraagd = function (D) {
    const uit = {};
    for (const stuk in STUKKEN) if (STUKKEN[stuk].waar) uit[STUKKEN[stuk].waar] = 0;
    for (const g of wachthuizen(D)) {
      for (const soort of SOORTEN) {
        const nog = Math.max(0, (gewild(g)[soort] || 0) - vanSoort(D, g, soort).length);
        for (const stuk of stukkenVan(soort)) if (STUKKEN[stuk].waar) uit[STUKKEN[stuk].waar] += nog;
      }
    }
    return uit;
  };

  // Wat er van een soort nog niet in de opslag ligt: de stukken waarvan er geen is.
  const ontbreekt = (D, soort) => stukkenVan(soort).filter((stuk) => STUKKEN[stuk].waar && !(ligt(D, STUKKEN[stuk].waar) >= 1 - 1e-9));

  // Wie bij wachthuis g soldaat kan worden (B1): wie kan werken (T.kanWerken) en geen werk heeft, volwassen of jong, niet
  // van het gezin van de aanvoerder, en al hier. Eerst de volwassenen, en wie het dichtst bij het wachthuis woont.
  const LEEFTIJD = { volwassen: 0, jong: 1 };
  function vrijVoor(D, g) {
    const deur = T.deurVan(D.wereld, g) || { x: g.x, y: g.y };
    const score = (p) => LEEFTIJD[p.leeftijd] * 100 + T.afstand(T.deurVanBewoner(D, p), deur);
    return mensen(D)
      .filter((p) => T.kanWerken(p) && !p.werk && LEEFTIJD[p.leeftijd] != null && !T.vanAanvoerder(p) && !p.komt && !(p.wezen && p.wezen.dood))
      .sort((a, b) => score(a) - score(b) || a.id - b.id);
  }

  function maakSoldaat(D, p, g, soort) {
    for (const stuk of stukkenVan(soort)) if (STUKKEN[stuk].waar) T.wijzigVoorraad(D, STUKKEN[stuk].waar, -1);
    p.soldaat = { soort, wachthuis: g, sinds: D.kalender ? D.kalender.dag : 0 };
    p.bouwt = null;
    T.zetPlekken(D, p);
  }

  function leverIn(D, p) {
    for (const stuk of stukkenVan(p.soldaat.soort)) if (STUKKEN[stuk].waar) T.wijzigVoorraad(D, STUKKEN[stuk].waar, 1);
    delete p.soldaat;
    T.zetPlekken(D, p);
  }

  // Elke ochtend na het verdelen van de handen (T.tikGebouwenDag, js/gebouwen.js), na het afbreken (js/afbreken.js), en
  // meteen als je op het briefje een soldaat erbij of eraf zet (T.zetSoldaten): wie er te veel is, levert zijn stukken in
  // (wie het laatst kwam, het eerst), en wie er te weinig is, komt erbij zolang er een vrij is en al zijn stukken in de
  // opslag liggen. Een soldaat van een wachthuis dat er niet meer is, levert ook in. Geeft { erbij: [{ p, soort }], weg:
  // [{ p, soort }] }.
  T.werkSoldatenBij = function (D) {
    const erbij = [];
    const weg = [];
    const huizen = wachthuizen(D);
    const geef = (p) => {
      weg.push({ p, soort: p.soldaat.soort });
      leverIn(D, p);
    };
    // (De wacht van de demo heeft geen wachthuis, en blijft: T.zetKamp in js/begin.js, js/bewoners.js.)
    for (const p of T.soldatenVan(D)) if (p.soldaat.wachthuis && !huizen.includes(p.soldaat.wachthuis)) geef(p);
    for (const g of huizen) {
      for (const soort of SOORTEN) for (const p of vanSoort(D, g, soort).slice(gewild(g)[soort] || 0)) geef(p);
    }
    for (const g of huizen) {
      for (const soort of SOORTEN) {
        let n = vanSoort(D, g, soort).length;
        while (n < (gewild(g)[soort] || 0) && !ontbreekt(D, soort).length) {
          const p = vrijVoor(D, g)[0];
          if (!p) break;
          maakSoldaat(D, p, g, soort);
          erbij.push({ p, soort });
          n++;
        }
      }
    }
    // Wie inleverde en meteen weer soldaat werd (bij een ander wachthuis, of van een andere soort), leverde niet echt in.
    const geruild = new Set(erbij.map((x) => x.p));
    return { erbij, weg: weg.filter((x) => !geruild.has(x.p)) };
  };

  // Wat er gebeurde, als bericht: wie soldaat werd (en wat voor een), en wie zijn stukken inleverde.
  function zegWatEr(D, { erbij, weg }) {
    const wie = (lijst) => T.opsomming(lijst.map((x) => `${T.naamVanBewoner(x.p)} (${T.soortNaam(x.soort)})`));
    if (erbij.length) T.zeg(D, T.t('{n|{wie} becomes a soldier at the watch house.|{wie} become soldiers at the watch house.}', { n: erbij.length, wie: wie(erbij) }), 'goed');
    if (weg.length) T.zeg(D, T.t('{n|{wie} hands in the weapons, and is free to work again.|{wie} hand in the weapons, and are free to work again.}', { n: weg.length, wie: wie(weg) }));
  }

  // Elke ochtend (T.tikGebouwenDag), en na het afbreken: de soldaten bijwerken, en zeggen wat er gebeurde.
  T.tikSoldatenDag = function (D) {
    zegWatEr(D, T.werkSoldatenBij(D));
  };

  // Een soldaat van deze soort erbij (verschil 1) of eraf (-1), bij wachthuis g: de knoppen op het briefje. Samen niet
  // meer dan `plaatsen`. Geeft true als er iets veranderde.
  T.zetSoldaten = function (D, g, soort, verschil) {
    const wil = gewild(g);
    const nu = wil[soort] || 0;
    const nieuw = Math.max(0, Math.min(nu + verschil, nu + IN().plaatsen - som(wil)));
    if (nieuw === nu) return false;
    wil[soort] = nieuw;
    zegWatEr(D, T.werkSoldatenBij(D));
    return true;
  };

  // Waarom er bij wachthuis g minder soldaten van deze soort zijn dan je wilt, als een stukje zin.
  function waaromNog(D, soort) {
    const mist = ontbreekt(D, soort);
    const bijSmid = mist.filter((stuk) => stuk !== 'paard');
    if (bijSmid.length) {
      const waren = T.opsomming(bijSmid.map((stuk) => T.waarNaam(STUKKEN[stuk].waar)));
      return (D.gebouwen || []).some((x) => x.soort === 'wapenmaker')
        ? T.t('waiting for {waren} from the weaponsmith', { waren })
        : T.t('waiting for {waren}: build a weaponsmith', { waren });
    }
    if (mist.length) {
      return (D.gebouwen || []).some((x) => x.soort === 'stal')
        ? T.t('waiting for a horse from the stable')
        : T.t('waiting for a horse: build a stable, or buy one from the merchant');
    }
    return T.t('nobody without work');
  }

  // Het briefje van een wachthuis (js/gebouwbriefje.js): per soort hoeveel soldaten er zijn en hoeveel je er wilt, met een
  // knop eraf en erbij ({ tekst, uitleg, kan, doe }, zoals een handeling), en wie het zijn.
  T.GEBOUW_DELEN = T.GEBOUW_DELEN || {};
  T.GEBOUW_DELEN.wachthuis = function (D, g) {
    const wil = gewild(g);
    const hier = T.soldatenVan(D, g);
    const regels = [T.t('{n} of {m} places: a soldier no longer works or builds, but eats like everyone.', { n: hier.length, m: IN().plaatsen })];
    for (const soort of SOORTEN) {
      const n = vanSoort(D, g, soort).length;
      const w = wil[soort] || 0;
      const wat = T.t('{soort} ({stukken})', { soort: T.hoofdletter(T.soortNaam(soort)), stukken: T.opsomming(stukkenVan(soort).map(T.stukNaam)) });
      const tekst = n < w
        ? T.t('{wat}: {n} of {w}, {waarom}.', { wat, n, w, waarom: waaromNog(D, soort) })
        : T.t('{wat}: {n}.', { wat, n });
      regels.push({
        tekst,
        knoppen: [
          { tekst: '−', uitleg: T.t('One {soort} less: the pieces go back into store.', { soort: T.soortNaam(soort) }), kan: w > 0, opdracht: { soort: 'soldaten', x: g.x, y: g.y, soldaat: soort, verschil: -1 } },
          { tekst: '+', uitleg: T.t('One {soort} more.', { soort: T.soortNaam(soort) }), kan: som(wil) < IN().plaatsen, opdracht: { soort: 'soldaten', x: g.x, y: g.y, soldaat: soort, verschil: 1 } },
        ],
      });
    }
    if (hier.length) {
      regels.push(T.t('On guard: {wie}.', { wie: T.opsomming(hier.map((p) => `${T.naamVanBewoner(p)} (${T.soortNaam(p.soldaat.soort)})`)) }));
      // Hoeveel er overdag en 's nachts waken (vraag 170, stap 4), en te wapen: wie rust, staat op (js/kiezen.js).
      const nacht = hier.filter((p) => p.soldaat.dienst === 'nacht').length;
      const rusten = hier.filter((p) => T.isMan(D, p.wezen) && !T.inDienst(D, p.wezen)).length;
      regels.push({
        tekst: T.t('On watch by day {dag}, by night {nacht}.', { dag: hier.length - nacht, nacht }),
        knoppen: [{
          tekst: T.t('To arms'),
          uitleg: rusten ? T.t('Who sleeps, gets up and goes on watch until his own watch begins') : T.t('Everyone is on watch'),
          kan: rusten > 0,
          opdracht: { soort: 'teWapen', x: g.x, y: g.y },
        }],
      });
    }
    return [{ titel: T.t('Soldiers'), regels }];
  };

  // Bij de muis en op het briefje van de wapenmaker: wat er gevraagd wordt; bij het wachthuis: hoeveel soldaten.
  T.GEBOUW_ERBIJ = T.GEBOUW_ERBIJ || {};
  T.GEBOUW_ERBIJ.wapenmaker = function (D) {
    const vraag = T.wapensGevraagd(D);
    const wat = Object.keys(vraag).filter((x) => vraag[x] > 0 && T.GEBOUWEN.wapenmaker.maakt.uit[x]);
    return wat.length
      ? T.t('Asked for at the watch house: {waren}.', { waren: T.opsomming(wat.map((x) => T.hoeveel(vraag[x], x))) })
      : T.t('Nobody has asked for weapons: set soldiers at a watch house.');
  };
  T.GEBOUW_ERBIJ.stal = function (D) {
    const n = T.wapensGevraagd(D).paarden;
    return n > 0
      ? T.t('Asked for at the watch house: {n|# horse|# horses}.', { n })
      : T.t('Nobody has asked for horses: set knights at a watch house.');
  };
  T.GEBOUW_ERBIJ.wachthuis = (D, g) => T.t('{n|# soldier|# soldiers} of {m}.', { n: T.soldatenVan(D, g).length, m: IN().plaatsen });

  // ---------------------------------------------------------------------------------------------
  // In het gevecht
  // ---------------------------------------------------------------------------------------------

  // De stukken van wezen e: een soldaat die van zijn soort, een veteraan een hooivork, een aanvoerder die het overnam die
  // van wat hij was (p.wapen, onderaan), en de eerste aanvoerder, een dorpeling en een vijand geen (de aanvoerder slaat
  // zoals T.SLAAN, een vijand zoals zijn aanval in T.WEZENS, js/wereld.js). Tot 15 okt telde het alleen voor wie
  // opgeroepen was (kant 'speler'); sinds het gevecht in real time (vraag 170, stap 2) vecht een soldaat ook zonder.
  T.stukkenVan = function (e) {
    // de held heeft geen e.bewoner (js/bewoners.js, T.zetHeld): zijn bewoner zoeken we alleen in een veldslag, voor het
    // wapen van een generaal (js/veldslag.js); in een dorp heeft de eerste held geen wapen
    const p = e && (e.bewoner || (e.dorp && e.dorp.veldslag && e === e.dorp.aanvoerder ? T.bewonerVan(e.dorp, e) : null));
    if (!p) return [];
    if (p.aanvoerder) return p.wapen ? stukkenVan(p.wapen) : [];
    if (p.soldaat) return stukkenVan(p.soldaat.soort);
    return p.veteraan ? stukkenVan('militie') : [];
  };

  // Hoe wezen e slaat (js/gevecht.js): { wapen, kosten, schade, bereik, schiet, doorHarnas }. Een vijand (een rover, een
  // wolf) met zijn aanval (T.WEZENS), ernaast; de aanvoerder met T.SLAAN, ernaast; een man met zijn wapen.
  T.slagVan = function (e) {
    if (e.aanval) return { wapen: null, kosten: e.aanval.kosten, schade: e.aanval.schade, bereik: 1, schiet: false, doorHarnas: false };
    const wapen = T.stukkenVan(e).find((stuk) => STUKKEN[stuk].wapen);
    if (!wapen) return { wapen: null, kosten: T.SLAAN.kosten, schade: T.SLAAN.schade, bereik: 1, schiet: false, doorHarnas: false };
    const s = STUKKEN[wapen];
    return { wapen, ...IN().wapens[wapen], schiet: !!s.schiet, doorHarnas: !!s.doorHarnas, breektHarnas: !!s.breektHarnas };
  };

  // Hoe een schutter slaat die niet weg kan: met zijn mes, ernaast (js/gevecht.js).
  T.mesSlag = () => ({ wapen: 'mes', ...IN().wapens.mes, schiet: false, doorHarnas: false });

  // Zit hij op een paard (de ridder, de ruiter)? Dan heeft hij meer leven en een grotere pas: wat T.paardVan zegt.
  T.opPaard = (e) => !!(e && e.bewoner && e.bewoner.soldaat && stukkenVan(e.bewoner.soldaat.soort).includes('paard'));
  // Wat zijn paard hem geeft ({ snelheid }, de getallen van zijn soort in de instellingen), of null te voet.
  T.paardVan = (e) => (T.opPaard(e) ? IN()[e.bewoner.soldaat.soort] || IN().ridder : null);
  // Heeft hij een schild in de hand: niet te paard (de ridder houdt het bij zich), voor de schildpad (js/kiezen.js).
  T.heeftSchild = (e) => !T.opPaard(e) && T.stukkenVan(e).includes('schild');

  // Hoeveel schade schild en harnas van doel afvangen, van een klap van `van` (wie slaat, met `slag`: zijn wapen, of een
  // ander, zoals het mes van een schutter). Van een bout uit een kruisboog niets; van een knots alleen het schild.
  T.vangtAf = function (doel, van, slag = van ? T.slagVan(van) : null) {
    if (slag && slag.doorHarnas) return 0;
    const breekt = !!(slag && slag.breektHarnas);
    let n = 0;
    for (const stuk of T.stukkenVan(doel)) if (!(breekt && stuk === 'harnas')) n += IN().bescherming[stuk] || 0;
    // gedekt in de schildpad (js/kiezen.js) meer van een pijl
    if (slag && slag.schiet && T.gedektInSchildpad(doel)) n += T.KIEZEN_INSTELLINGEN.schildpad.pijl;
    // in de kring van zijn generaal (3d, js/veldslag.js) een harnas extra (niet tegen een knots)
    if (!breekt && T.inKring(doel)) n += T.VELDSLAG_INSTELLINGEN.generaal.harnas;
    return n;
  };

  // ---------------------------------------------------------------------------------------------
  // De aanvoerder: wie het bevel overneemt
  // ---------------------------------------------------------------------------------------------

  // Valt de aanvoerder (T.valt, js/gevecht.js), dan neemt een ander het over (vraag 170, stap 5; Marcel, 15 okt: "wanneer hij
  // valt kan er een ander opstaan. Deze uit veteranen gekozen", en B1 en C2 van 16 okt): een veteraan, anders de soldaat
  // die het langst dient (p.soldaat.sinds), en is er niemand, dan de eerste die soldaat wordt of van de heervaart
  // terugkomt (T.werkAanvoerderBij, elke tik). Het spel gaat door. Hij houdt zijn uiterlijk en zijn wapen (B1, p.wapen),
  // telt niet meer mee in het wachthuis, heeft geen dienst, en staat waar je hem zet, zoals de eerste. Zijn gezin trekt
  // in het huis van de aanvoerder (huis: 'aanvoerder': het town hall, of in het begin zijn tent), en wie daar woonde, in
  // het zijne (C2: ze ruilen; had hij geen huis, dan is dat gezin dakloos, zoals na afbreken).

  // Wie het overneemt, of null: een veteraan (de eerste in het dorp), anders de soldaat die het langst dient.
  T.opvolgerVan = function (D) {
    const kan = (p) => !p.weg && !p.komt && !p.aanvoerder && p.wezen && !p.wezen.dood;
    const veteraan = mensen(D).find((p) => p.veteraan && kan(p));
    if (veteraan) return veteraan;
    const langst = (a, b) => (a.soldaat.sinds || 0) - (b.soldaat.sinds || 0) || a.id - b.id;
    return T.soldatenVan(D).filter(kan).sort(langst)[0] || null;
  };

  // Bewoner p wordt de aanvoerder van D. Geeft wat hij was: 'veteraan' of de soort soldaat.
  T.wordtAanvoerder = function (D, p) {
    const e = p.wezen;
    const l = T.levenAlsMan(e);
    const was = p.soldaat ? p.soldaat.soort : 'veteraan';
    p.wapen = p.soldaat ? p.soldaat.soort : 'militie';
    delete p.soldaat;
    delete p.veteraan;
    p.aanvoerder = true;
    p.werk = null;
    p.bouwt = null;
    // Hij staat waar je hem zet (geen dagritme, zoals de eerste), en wie sliep, komt naar buiten.
    e.kant = 'speler';
    e.dwaalt = false;
    delete e.post;
    e.binnen = false;
    e.pad = e.onderweg && e.pad[0] ? [e.pad[0]] : [];
    // Het leven van een aanvoerder (T.WEZENS.aanvoerder), met wat hij nu mist.
    const max = T.WEZENS.aanvoerder.leven;
    e.maxLeven = max;
    e.leven = Math.min(max, l.leven + max - l.max);
    D.aanvoerder = e;
    // C2: zijn gezin naar het huis van de aanvoerder, en wie daar woonde naar het zijne.
    const thuis = (D.gebouwen || []).find((g) => g.huis === 'aanvoerder');
    const vorig = p.huis;
    if (thuis && thuis !== vorig) {
      const oud = mensen(D).filter((x) => x.huis === thuis && x.gezin !== p.gezin);
      T.verhuis(D, mensen(D).filter((x) => x.gezin === p.gezin), thuis);
      if (oud.length && vorig) T.verhuis(D, oud, vorig);
      else if (oud.length) T.wordtDakloos(D, oud);
    } else T.zetPlekken(D, p);
    return was;
  };

  // De aanvoerder van D viel (T.valt, js/gevecht.js; T.sneuvelt zei het al): een ander neemt het over, of het dorp zegt
  // dat er niemand is.
  // In een veldslag (js/veldslag.js; 3b3, en Marcel, 28 okt, over de generaals: "eenmaal dood vecht de rest door tot het
  // eind") neemt niemand het over, en zegt niemand het.
  T.aanvoerderValt = function (D) {
    D.aanvoerder = null;
    if (!T.werkAanvoerderBij(D) && !D.veldslag) T.zeg(D, T.t('There is no one to take command. The first who becomes a soldier, will.'), 'gevaar');
  };

  // Elke tik (T.werkDorpBij, js/dorp.js): heeft D geen aanvoerder, en is er een veteraan of een soldaat, dan neemt die het
  // over (niet in een veldslag, hierboven). Geeft wie, of null.
  T.werkAanvoerderBij = function (D) {
    if (D.aanvoerder || !D.bewoners || D.veldslag) return null;
    const p = T.opvolgerVan(D);
    if (!p) return null;
    const wie = T.hoofdletter(T.naamVanBewoner(p));
    const was = T.wordtAanvoerder(D, p);
    const thuis = (D.gebouwen || []).find((g) => g.huis === 'aanvoerder');
    const huis = thuis ? (T.GEBOUWEN[thuis.soort] || {}).naam || thuis.soort : null;
    const tekst = was === 'veteraan' ? T.t('{wie}, a veteran, takes command.', { wie }) : T.t('{wie}, the soldier who has served longest, takes command.', { wie });
    T.zeg(D, huis ? `${tekst} ${T.t('His household moves into the {huis}.', { huis })}` : tekst, 'goed', T.tegelVan(p.wezen));
    return p;
  };

  // ---------------------------------------------------------------------------------------------
  // De groepsleider en zijn lantaarn
  // ---------------------------------------------------------------------------------------------

  // Elke groep soldaten heeft een groepsleider die een lantaarn draagt (vraag 171; Marcel, 16 okt: "elke groep soldaten
  // heeft een groepsleider die een lantaarn draagt", en "A1, B1, C1, D2"). Een groep zijn de soldaten van één wachthuis
  // (A1), en de leider is, van wie er nu dienst heeft, wie het langst dient (p.soldaat.sinds, zoals bij het overnemen van de
  // aanvoerder): zo heeft de nachtwacht 's nachts haar eigen leider. De aanvoerder draagt er ook een (C1). Zijn lantaarn is
  // licht, zoals die van de bode (B1, T.draagtLicht in js/zien.js): de wolven vallen niemand in het licht aan.

  // De leider van de soldaten van wachthuis g die nu dienst hebben, of null.
  T.groepsleiderVan = function (D, g) {
    const kan = (p) => !p.weg && !p.komt && p.wezen && !p.wezen.dood && T.inDienst(D, p.wezen);
    const langst = (a, b) => (a.soldaat.sinds || 0) - (b.soldaat.sinds || 0) || a.id - b.id;
    return T.soldatenVan(D, g).filter(kan).sort(langst)[0] || null;
  };

  // Wie een lantaarn draagt (brandend of niet, dat zegt T.draagtLicht): de aanvoerder, en de leider van elk wachthuis.
  T.lantaarnDragers = function (D) {
    const uit = D.aanvoerder && !D.aanvoerder.dood ? [D.aanvoerder] : [];
    for (const g of wachthuizen(D)) {
      const p = T.groepsleiderVan(D, g);
      if (p) uit.push(p.wezen);
    }
    return uit;
  };
})(globalThis.Spel = globalThis.Spel || {});
