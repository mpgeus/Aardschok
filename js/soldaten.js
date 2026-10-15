// De soldaten (werklijst vraag 159; Marcel, 14 okt: "Iedereen is een mens, elk mens kan iets worden. Iemand pakt een
// zwaard en schild -> zwaardvechter. Speer - spearman etc. Zoals Knights and merchants het doet", op het plan van 15 okt
// "A1, B1, C1, D1", en over de wapens: "sword, spear, shield, pike, bow, crossbow, armor", met vaste soorten).
//
// Soldaat word je in het wachthuis (A1): op zijn briefje zet je per soort hoeveel soldaten je wilt, samen hooguit
// `plaatsen`. Elke soort heeft vaste stukken (T.SOLDAAT_SOORTEN, zoals in Knights and Merchants): de militie een hooivork,
// de speerman speer en schild, de piekenier piek en harnas, de zwaardvechter zwaard, schild en harnas, de boogschutter een
// boog, en de kruisboogschutter kruisboog en harnas. Liggen al zijn stukken in de opslag, dan pakt wie geen werk heeft (B1:
// geen werkplaats en geen boerderij; wie alleen meebouwt, wel), volwassen of jong, en niet van het gezin van de schout, ze
// op, en is hij soldaat: hij werkt en bouwt niet meer, eet mee zoals iedereen, staat overdag bij het wachthuis en slaapt
// thuis. Zet je er een minder, dan levert hij zijn stukken weer in en is hij vrij. Valt hij, dan zijn ze weg. Een
// hooivork heeft elke boer: daarvoor hoeft er niets in de opslag te liggen, en wie zonder soort meevecht (een veteraan,
// wie met de bode meegaat, de jacht op de wolven), vecht ermee.
//
// De stukken maakt de wapenmaker (T.GEBOUWEN.wapenmaker, in het gehucht; C1, en Marcel erbij: "iemand kan gewoon
// wapensmid worden"): elke dag één, het stuk dat het meest gevraagd wordt (T.wapensGevraagd: wat de wachthuizen willen en
// nog niet hebben), van planken, ijzer of huiden (T.receptVan, js/gebouwen.js). Vraagt niemand iets, dan staat hij stil.
//
// In het gevecht (js/gevecht.js) slaat elk wapen anders (D1; T.slagVan): de hooivork zwak, de speer en de piek reiken twee
// tegels (de piek slaat harder), het zwaard hard, en de boog en de kruisboog schieten ver waar ze zien, maar niet met een
// vijand naast zich. Schild en harnas vangen een deel van elke klap af (T.vangtAf), behalve van een bout uit een
// kruisboog. De getallen staan in T.SOLDATEN_INSTELLINGEN (in de werkbank).
//
// In het dorp: g.soldaten = { militie, speerman, ... } op een wachthuis (hoeveel je er wilt), en p.soldaat =
// { soort, wachthuis } op een bewoner. Zonder scherm, en dus getoetst (test/soldaten.test.cjs).
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
      boog: { kosten: 4, schade: [2, 4], bereik: 8 },
      kruisboog: { kosten: 4, schade: [2, 4], bereik: 8 },
    },
    // Zoveel schade vangt het van elke klap af.
    bescherming: { schild: 2, harnas: 1 },
  };
  const IN = () => T.SOLDATEN_INSTELLINGEN;

  // De stukken: de waar in de opslag (de hooivork heeft er geen: die heeft elke boer), of het een wapen is, of hij schiet
  // (op afstand, waar hij ziet, en niet met een vijand naast zich), en of schild en harnas ervan niets afvangen.
  const STUKKEN = {
    hooivork: { waar: null, wapen: true, naam: () => T.t('pitchfork') },
    speer: { waar: 'speren', wapen: true, naam: () => T.t('spear') },
    piek: { waar: 'pieken', wapen: true, naam: () => T.t('pike') },
    zwaard: { waar: 'zwaarden', wapen: true, naam: () => T.t('sword') },
    boog: { waar: 'bogen', wapen: true, schiet: true, naam: () => T.t('bow') },
    kruisboog: { waar: 'kruisbogen', wapen: true, schiet: true, doorHarnas: true, naam: () => T.t('crossbow') },
    schild: { waar: 'schilden', naam: () => T.t('shield') },
    harnas: { waar: 'harnassen', naam: () => T.t('armour') }, // van leer; een ijzeren harnas komt later
  };
  T.STUKKEN = STUKKEN;
  // Is deze waar een stuk (een speer, een schild, ...)? Die bestaan alleen heel: de wapenmaker maakt ze heel (T.receptVan,
  // js/gebouwen.js), en de kar laadt ze heel (js/kar.js).
  const STUK_WAREN = new Set(Object.values(STUKKEN).map((s) => s.waar).filter(Boolean));
  T.isStuk = (wat) => STUK_WAREN.has(wat);

  // De soorten soldaten, in de volgorde van het briefje, met hun stukken (het wapen eerst).
  T.SOLDAAT_SOORTEN = {
    militie: { stukken: ['hooivork'], naam: () => T.t('militia') },
    speerman: { stukken: ['speer', 'schild'], naam: () => T.t('spearman') },
    piekenier: { stukken: ['piek', 'harnas'], naam: () => T.t('pikeman') },
    zwaardvechter: { stukken: ['zwaard', 'schild', 'harnas'], naam: () => T.t('swordsman') },
    boogschutter: { stukken: ['boog'], naam: () => T.t('archer') },
    kruisboogschutter: { stukken: ['kruisboog', 'harnas'], naam: () => T.t('crossbowman') },
  };
  const SOORTEN = Object.keys(T.SOLDAAT_SOORTEN);
  T.soortNaam = (soort) => T.SOLDAAT_SOORTEN[soort].naam();
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
  // van het gezin van de schout, en al hier. Eerst de volwassenen, en wie het dichtst bij het wachthuis woont.
  const LEEFTIJD = { volwassen: 0, jong: 1 };
  function vrijVoor(D, g) {
    const deur = T.deurVan(D.wereld, g) || { x: g.x, y: g.y };
    const score = (p) => LEEFTIJD[p.leeftijd] * 100 + T.afstand(T.deurVanBewoner(D, p), deur);
    return mensen(D)
      .filter((p) => T.kanWerken(p) && !p.werk && LEEFTIJD[p.leeftijd] != null && !T.vanSchout(p) && !p.komt && !(p.wezen && p.wezen.dood))
      .sort((a, b) => score(a) - score(b) || a.id - b.id);
  }

  function maakSoldaat(D, p, g, soort) {
    for (const stuk of stukkenVan(soort)) if (STUKKEN[stuk].waar) T.wijzigVoorraad(D, STUKKEN[stuk].waar, -1);
    p.soldaat = { soort, wachthuis: g };
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
    for (const p of T.soldatenVan(D)) if (!huizen.includes(p.soldaat.wachthuis)) geef(p);
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
    if (mist.length) {
      const waren = T.opsomming(mist.map((stuk) => T.waarNaam(STUKKEN[stuk].waar)));
      return (D.gebouwen || []).some((x) => x.soort === 'wapenmaker')
        ? T.t('waiting for {waren} from the weaponsmith', { waren })
        : T.t('waiting for {waren}: build a weaponsmith', { waren });
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
    if (hier.length) regels.push(T.t('On guard: {wie}.', { wie: T.opsomming(hier.map((p) => `${T.naamVanBewoner(p)} (${T.soortNaam(p.soldaat.soort)})`)) }));
    return [{ titel: T.t('Soldiers'), regels }];
  };

  // Bij de muis en op het briefje van de wapenmaker: wat er gevraagd wordt; bij het wachthuis: hoeveel soldaten.
  T.GEBOUW_ERBIJ = T.GEBOUW_ERBIJ || {};
  T.GEBOUW_ERBIJ.wapenmaker = function (D) {
    const vraag = T.wapensGevraagd(D);
    const wat = Object.keys(vraag).filter((x) => vraag[x] > 0);
    return wat.length
      ? T.t('Asked for at the watch house: {waren}.', { waren: T.opsomming(wat.map((x) => T.hoeveel(vraag[x], x))) })
      : T.t('Nobody has asked for weapons: set soldiers at a watch house.');
  };
  T.GEBOUW_ERBIJ.wachthuis = (D, g) => T.t('{n|# soldier|# soldiers} of {m}.', { n: T.soldatenVan(D, g).length, m: IN().plaatsen });

  // ---------------------------------------------------------------------------------------------
  // In het gevecht
  // ---------------------------------------------------------------------------------------------

  // De stukken van wezen e: een soldaat die van zijn soort, wie anders aan jouw kant meevecht een hooivork, en de schout
  // en een vijand geen (de schout slaat zoals T.SLAAN, een vijand zoals zijn aanval in T.WEZENS, js/wereld.js).
  T.stukkenVan = function (e) {
    if (!e || e.kant !== 'speler') return [];
    const p = e.bewoner;
    if (!p || p.schout) return [];
    return stukkenVan(p.soldaat ? p.soldaat.soort : 'militie');
  };

  // Hoe wezen e van jouw kant slaat: { wapen, kosten, schade, bereik, schiet, doorHarnas }. De schout met T.SLAAN, ernaast.
  T.slagVan = function (e) {
    const wapen = T.stukkenVan(e).find((stuk) => STUKKEN[stuk].wapen);
    if (!wapen) return { wapen: null, kosten: T.SLAAN.kosten, schade: T.SLAAN.schade, bereik: 1, schiet: false, doorHarnas: false };
    const s = STUKKEN[wapen];
    return { wapen, ...IN().wapens[wapen], schiet: !!s.schiet, doorHarnas: !!s.doorHarnas };
  };

  // Hoeveel schade schild en harnas van doel afvangen, van een klap van `van` (een wezen, of null: een vijand). Van een
  // bout uit een kruisboog niets.
  T.vangtAf = function (doel, van) {
    if (van && T.slagVan(van).doorHarnas) return 0;
    let n = 0;
    for (const stuk of T.stukkenVan(doel)) n += IN().bescherming[stuk] || 0;
    return n;
  };
})(globalThis.Spel = globalThis.Spel || {});
