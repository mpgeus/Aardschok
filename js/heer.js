// De heer: wat hij op Sint-Maarten vraagt, wat hij doet als je tekortschiet, en zijn komen en
// gaan (ontwerp/spel.md, "Sint-Maarten: de heer komt innen", besloten door Marcel op 24 sep 2026;
// ontwerp/werklijst.md, punt 5). Net als js/handel.js in twee helften:
//   - de regels, zonder scherm en dus te toetsen (test/heer.test.cjs): wat hij ziet en dus vraagt
//     (T.eisVanDeHeer), wat iets voor hem waard is (T.waardeVoorDeHeer), wat een betaling tot gevolg
//     heeft (T.gevolgVanBetaling: het venster en de knop stellen dezelfde vraag, CLAUDE.md), het
//     betalen zelf (T.betaalHeer), de schandpaal (T.zetAanDeSchandpaal), en de dagen
//     (T.tikHeerDag): de brief op 1 wijnmaand, zijn komst op Sint-Maarten, de soldaten die in de
//     lente weer gaan.
//   - zijn komen en gaan als poppetje, met twee soldaten (T.werkHeerBij), net als de marskramer.
// De vensters (het betalen, de schandpaal en het einde) staan in js/hud.js, zijn brieven in js/brieven.js.
//
// Alleen waar de marskramer ook komt: een wereld met een plein (js/kaart.js leest "heer" uit het
// betekenisbestand, en anders de plek van de marskramer). Daarbuiten blijft dit bestand stil.
(function (T) {
  'use strict';

  // Alle getallen in één blok, om samen met Marcel bij te stellen als hij speelt (net als
  // T.HANDEL_INSTELLINGEN). Een eerste gok, behalve waar Marcel het koos (spel.md).
  T.HEER_INSTELLINGEN = {
    // Zijn brief komt op 1 wijnmaand, vóór het laatste bezoek van de marskramer (5 wijnmaand):
    // dan kun je nog verkopen voor zijn goud. Zelf komt hij op Sint-Maarten (T.SINT_MAARTEN).
    brief: { maand: 'wijnmaand', dag: 1 },
    // Wat hij ziet, en wat hij daarvoor vraagt: per akkertegel de pacht in graan (ook als hij braak
    // lag of weide was: hij telt de akkers, niet wat erop groeide), per mens hoofdgeld in goud, en
    // per gebouw wat bij zijn soort staat (T.GEBOUWEN[soort].heer, js/gebouwen.js). Hij rondt naar
    // boven af.
    pachtPerAkkertegel: 0.5,
    hoofdgeldPerMens: 0.2,
    // Waar hij de rekening op maakt (Marcel, 24 sep; js/inner.js): 'rapport' (wat zijn inner in
    // oogstmaand zag; wat die niet zag, betaal je dat jaar niet) of 'alles' (hij ziet alles zelf).
    // Zonder rapport (de inner kwam niet) ziet hij alles, en bij heel hoge argwaan ook.
    rekening: 'rapport',
    // Wat hij van het graan vraagt: 'deel' (dit deel van het graan dat de inner telde: in de schuren
    // en op de velden die hij zag) of 'pacht' (pachtPerAkkertegel voor elke akkertegel). Het deel is
    // zo gekozen dat wie niets verstopt, ongeveer betaalt wat de pacht was: de honger blijft.
    graan: 'deel',
    deelVanGraan: 0.15,
    // De kist (Marcel, 25 sep: "hij telt de kist"): de heer ziet alleen geld, dus hij vraagt ook dit
    // deel van het goud dat de inner in de kist telde (zonder rapport: van wat er op Sint-Maarten
    // in ligt). Zo heeft goud verstoppen zin (js/verstoppen.js). Aan of uit is een optie.
    kist: true,
    deelVanGoud: 0.15,
    // Waarin hij betaald wil worden: 'watHijZiet' (wol voor een schaapskooi, eieren voor een
    // kippenhok, hout voor zijn bos), 'graanEnGoud' (de pacht in graan, de rest omgerekend naar
    // goud) of 'alleenGoud' (alles omgerekend naar goud, ook de pacht). Omrekenen gaat met
    // T.waardeVoorDeHeer, en naar boven. Dit en de twee hieronder zijn opties in de Spelregels
    // (js/opties.js); wat hier staat, is wat Marcel koos (spel.md, "Instelbaar").
    betalenIn: 'watHijZiet',
    // Hoe hij een tekort telt: 'hoeveel' (naar het deel dat je gaf, de straffen hieronder) of
    // 'hoeVaak' (niet hoeveel, maar hoeveel jaar achter elkaar je tekortschoot: de eerste keer een
    // boete, de tweede ook soldaten, de derde ook de schandpaal, en na ambtKwijtNa keer je ambt).
    telWijze: 'hoeveel',
    // Mag de schout zichzelf aan de schandpaal zetten?
    schoutMagZelf: true,
    // Hij telt slecht (Marcel, 24 sep): wie in waarde minstens zoveel geeft, merkt hij niet.
    // Daaronder van licht naar zwaar; elke straf neemt de lichtere mee.
    straffen: [
      { vanaf: 0.9, straf: null },
      { vanaf: 2 / 3, straf: 'boete' },
      { vanaf: 0.5, straf: 'soldaten' },
      { vanaf: 0, straf: 'schandpaal' },
    ],
    // "Veel te weinig" is minder dan dit. Zoveel keer achter elkaar, en je bent je ambt kwijt.
    veelTeWeinig: 0.5,
    ambtKwijtNa: 2,
    // De boete: wat je tekortkwam (in goud, naar zijn waarde) komt volgend jaar terug, met dit deel
    // erbij. Zet de schout zichzelf aan de schandpaal, dan lacht de heer, en wordt het deel groter.
    boete: 0.5,
    boeteZelf: 1.5,
    // De soldaten: zoveel, ze eten elk voor zoveel mensen, en zolang ze er zijn is het dorp zoveel
    // minder tevreden. Ze blijven de winter over, tot de dag hieronder.
    soldaten: 2,
    soldaatEetAls: 3,
    soldatenOntevreden: 0.1,
    soldatenTot: { maand: 'lentemaand', dag: 1 },
    // De schandpaal: zoveel dagen staat hij er. Wat het het dorp kost, staat bij de mens zelf
    // (T.MENSEN[id].schandpaal, js/mensen.js), en dat slijt in zoveel dagen weer weg.
    schandpaalDagen: 3,
    wrokDagen: 120,
    // Komt de schout niet naar hem toe, dan neemt hij het na zoveel dagen zelf. Die dagen tellen
    // pas als hij op het plein staat en de tijd weer loopt: bij zijn komst staat hij stil.
    wachtDagen: 3,
    // Wat iets voor hem waard is, in goud per stuk. Wat de marskramer koopt, is waard wat die er
    // gemiddeld voor betaalt (T.waardeVoorDeHeer); hier alleen wat hij niet koopt.
    waarde: { goud: 1, steen: 0.25 },
    waardeAnders: 0.2,
  };

  const IN = () => T.HEER_INSTELLINGEN;
  const STRAFFEN = ['boete', 'soldaten', 'schandpaal']; // van licht naar zwaar

  T.nieuweHeer = function () {
    return {
      schuld: 0, // goud dat hij er volgend jaar bij vraagt: een tekort, met de boete
      veelTeWeinig: 0, // hoe vaak achter elkaar je hem veel te weinig gaf
      tekort: 0, // het tekort van het laatste Sint-Maarten, in goud (voor de boete van de schout)
      tekortJaren: 0, // hoeveel jaar achter elkaar je hem iets tekortdeed (telWijze 'hoeVaak')
      brief: null, // { dag, eis }: zijn brief van dit jaar, tot hij geweest is
      bezoek: null, // zijn bezoek op Sint-Maarten, zie T.heerKomt
      soldaten: null, // { tot, wezens }: ingekwartierd tot de lente
      wrok: [], // [{ wie, dag, kost, staat }]: wie jij aan de schandpaal zette
      jaren: [], // [{ jaar, deel, straf }]: hoe elk Sint-Maarten afliep
      paal: null, // { x, y }: waar de schandpaal staat, vanaf de eerste keer (T.zetSchandpaalNeer)
    };
  };

  // Waar hij kan komen: een wereld met een plein (zie bovenaan), en een uitgang om binnen te komen.
  function pleinVan(w) {
    return (w && (w.heer || w.marskramer)) || null;
  }
  function magKomen(D) {
    return !!pleinVan(D.wereld);
  }

  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  const inJaar = (maand, dag) => maand * T.DAGEN_PER_MAAND + (dag - 1);
  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  // Wat zijn soldaten samen per dag eten, in graan: elk voor soldaatEetAls mensen.
  const soldatenPerDag = () => IN().soldaten * IN().soldaatEetAls * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;

  // De eerstvolgende dag ná `dag` met deze datum ({ maand, dag }).
  function volgendeKeer(dag, datum) {
    const d = T.datumVanDag(dag);
    const verschil = inJaar(maandIdx(datum.maand), datum.dag) - inJaar(d.maand, d.dagVanMaand);
    return Math.floor(dag) + (((verschil % T.DAGEN_PER_JAAR) + T.DAGEN_PER_JAAR) % T.DAGEN_PER_JAAR || T.DAGEN_PER_JAAR);
  }


  // ---------------------------------------------------------------------------------------------
  // Wat hij ziet, en wat dat waard is
  // ---------------------------------------------------------------------------------------------

  // Wat hij vraagt: { per: { graan: 105, goud: 12, … }, regels: [{ wat, aantal, waarom }] }. De
  // regels zijn voor de brief en het venster: waarvoor hij wat vraagt. Elke regel rondt hij naar
  // boven af, en per goed is het de som van zijn regels. Een gebouw in aanbouw telt al mee: hij
  // ziet een steiger en rekent een huis. Een verstopplek ziet hij niet (zijn prijs is niets).
  // Het hoofdgeld per ziel: in een dorp zoveel keer zoveel als de trede zegt (js/treden.js; voorlopig 1).
  const hoofdgeld = (D) => IN().hoofdgeldPerMens * T.hoofdgeldFactor(D);

  T.eisVanDeHeer = function (D) {
    const regels = [];
    const tel = (wat, aantal, waarom) => {
      const n = Math.ceil(aantal - 1e-9);
      if (n > 0) regels.push({ wat, aantal: n, waarom });
    };
    // Waar hij de rekening op maakt: het rapport van de inner (js/inner.js), tenzij hij alles zelf
    // wil zien, er geen rapport is, of de argwaan zo hoog is dat hij het rapport niet meer gelooft.
    const I = D.inner;
    const argwaan = (I && I.argwaan) || 0;
    const INN = T.INNER_INSTELLINGEN;
    const rapport = IN().rekening === 'rapport' && I && I.rapport && !(INN && argwaan >= INN.rapportTeltNietVanaf) ? I.rapport : null;
    // De akkers die hij kent: wat stiekem in zijn bos ontgonnen werd en niemand vond, staat niet in zijn boeken
    // (js/ontginnen.js).
    const akkers = ((D.wereld && D.wereld.akkers) || []).filter(T.inDeBoeken);
    if (rapport) {
      if (IN().graan === 'deel') tel('graan', rapport.graanGezien * IN().deelVanGraan, `een deel van de ${Math.round(rapport.graanGezien)} graan die Onze inner telde`);
      else if (rapport.tegels) tel('graan', rapport.tegels * IN().pachtPerAkkertegel, `de pacht voor ${rapport.tegels} akkertegels die Onze inner zag`);
      if (rapport.woonruimte) tel('goud', rapport.woonruimte * hoofdgeld(D), `hoofdgeld voor ${rapport.woonruimte} zielen in de huizen die hij zag`);
      if (IN().kist && rapport.goudGezien > 0) tel('goud', rapport.goudGezien * IN().deelVanGoud, `een deel van de ${Math.floor(rapport.goudGezien)} goud die Onze inner in uw kist telde`);
    } else {
      const tegels = akkers.reduce((n, a) => n + a.b * a.h, 0);
      if (IN().graan === 'deel') {
        const graan = (D.voorraad && D.voorraad.graan) || 0;
        tel('graan', graan * IN().deelVanGraan, `een deel van de ${Math.round(graan)} graan in uw schuren`);
      } else if (tegels) {
        tel('graan', tegels * IN().pachtPerAkkertegel, `de pacht voor ${tegels} akkertegels`);
      }
      if (D.bevolking > 0) tel('goud', D.bevolking * hoofdgeld(D), `hoofdgeld voor ${D.bevolking} zielen`);
      // De kist zoals hij hem telde toen hij kwam; vóór zijn komst (de brief) wat er nu in ligt.
      const b = D.heer && D.heer.bezoek;
      const kist = b && !b.weg && b.kist != null ? b.kist : (D.voorraad && D.voorraad.goud) || 0;
      if (IN().kist && kist > 0) tel('goud', kist * IN().deelVanGoud, `een deel van de ${Math.floor(kist)} goud in uw kist`);
    }
    // Wat je zijn inner toestopte en de heer hoorde (js/inner.js, T.koopInnerOm): dat telt hij als goud
    // in je kist (Marcel, 27 sep, vraag 42).
    const toegestopt = (I && I.gehoord) || 0;
    if (IN().kist && toegestopt > 0) tel('goud', toegestopt * IN().deelVanGoud, `een deel van de ${toegestopt} goud die u Onze inner toestopte, want dat tellen Wij als goud in uw kist`);
    // Per soort gebouw één regel, in de volgorde van T.GEBOUWEN: wat in het rapport staat, of alles.
    const aantal = {};
    if (rapport) Object.assign(aantal, rapport.gebouwen);
    else for (const g of D.gebouwen || []) aantal[g.soort] = (aantal[g.soort] || 0) + 1;
    for (const id of Object.keys(T.GEBOUWEN || {})) {
      const n = aantal[id];
      const prijs = T.GEBOUWEN[id].heer;
      if (!n || !prijs) continue;
      for (const wat in prijs) tel(wat, prijs[wat] * n, n === 1 ? `een ${T.GEBOUWEN[id].naam}` : `${n} × ${T.GEBOUWEN[id].naam}`);
    }
    const h = D.heer;
    if (h && h.schuld > 0) tel('goud', h.schuld, 'wat u vorig jaar schuldig bleef, met de boete');
    // Heeft een houthakker dit jaar in zijn bos gekapt (de wet Houtkap, js/wetten.js), dan rekent hij een boete.
    const boete = T.houtkapBoete(D);
    if (boete > 0) tel('goud', boete, 'een boete voor de bomen die u uit Ons bos haalde');
    // Wil hij (een deel) in goud, dan rekent hij om, naar boven: de rest van de pacht, of alles.
    const wijze = IN().betalenIn;
    if (wijze === 'graanEnGoud' || wijze === 'alleenGoud') {
      for (const r of regels) {
        if (r.wat === 'goud' || (wijze === 'graanEnGoud' && r.wat === 'graan')) continue;
        r.waarom = `${r.waarom} (in plaats van ${r.aantal} ${r.wat})`;
        r.aantal = Math.max(1, Math.ceil(r.aantal * T.waardeVoorDeHeer(r.wat) - 1e-9));
        r.wat = 'goud';
      }
    }
    // De argwaan van zijn inner kost een toeslag in goud, naar rato (Marcel, 24 sep: "de heer vraagt
    // meer"): bij volle argwaan T.INNER_INSTELLINGEN.toeslag van alles wat hij vraagt, in waarde.
    if (argwaan > 0 && INN && INN.toeslag > 0) {
      // Over wat hij dit jaar vraagt, niet over de oude schuld: daar zit de boete al in.
      const waarde = regels.reduce((n, r) => n + r.aantal * T.waardeVoorDeHeer(r.wat), 0) - (h && h.schuld > 0 ? h.schuld : 0);
      tel('goud', waarde * argwaan * INN.toeslag, 'een toeslag, want Onze inner vertrouwt u niet');
    }
    // Per goed opgeteld; graan en goud voorop, de rest in de volgorde waarin hij ze tegenkwam.
    const per = {};
    for (const r of regels) per[r.wat] = (per[r.wat] || 0) + r.aantal;
    const volgorde = ['graan', 'goud'].filter((w) => per[w]).concat(Object.keys(per).filter((w) => w !== 'graan' && w !== 'goud'));
    regels.sort((a, b) => volgorde.indexOf(a.wat) - volgorde.indexOf(b.wat));
    return { per, regels, volgorde, rapport: !!rapport };
  };

  // Wat één stuk van iets voor hem waard is, in goud. Goud is goud; wat de marskramer koopt, is
  // waard wat die er gemiddeld over het jaar voor betaalt (graan 0,3, wol 0,53); de rest staat in
  // T.HEER_INSTELLINGEN.waarde, of is waardeAnders. Zo hoeft er geen tweede prijslijst bij te komen
  // die met die van de marskramer uit de pas loopt.
  T.waardeVoorDeHeer = function (wat) {
    const eigen = IN().waarde[wat];
    if (eigen != null) return eigen;
    const koopt = T.HANDEL_INSTELLINGEN && T.HANDEL_INSTELLINGEN.koopt[wat];
    if (koopt) return koopt.prijs.reduce((n, p) => n + p, 0) / koopt.prijs.length / koopt.per;
    return IN().waardeAnders;
  };

  // ---------------------------------------------------------------------------------------------
  // Betalen: wat een betaling tot gevolg heeft, en het betalen zelf
  // ---------------------------------------------------------------------------------------------

  // Is hij er, en wacht hij nog op zijn geld?
  T.heerWacht = function (D) {
    const b = D.heer && D.heer.bezoek;
    return !!(b && !b.betaald && !b.weg && !D.einde);
  };

  // Wat gebeurt er als de schout hem dit geeft? `geef` is { graan: 80, goud: 12, … }. Het antwoord
  // is waar het venster en de knop allebei op lezen (CLAUDE.md, "Scherm en klik stellen dezelfde
  // vraag"): wat hij echt neemt, welk deel dat is in waarde, welke straf erbij hoort, en in één
  // zin wat dat betekent.
  //
  // Hij neemt van elk goed hooguit wat hij vraagt, en nooit meer dan je hebt. Goud neemt hij altijd
  // in de plaats van iets anders (Marcel, 24 sep: hij ziet alleen geld): wat je aan goud meer
  // geeft dan hij vraagt, telt voor wat er verder ontbreekt, tot alles gedekt is.
  T.gevolgVanBetaling = function (D, geef, eis) {
    eis = eis || T.eisVanDeHeer(D);
    const v = D.voorraad || {};
    const neemt = {};
    let gevraagd = 0;
    let gegeven = 0;
    for (const wat of eis.volgorde) {
      if (wat === 'goud') continue;
      const w = T.waardeVoorDeHeer(wat);
      const n = Math.max(0, Math.min((geef && geef[wat]) || 0, eis.per[wat], v[wat] || 0));
      neemt[wat] = n;
      gevraagd += eis.per[wat] * w;
      gegeven += n * w;
    }
    gevraagd += eis.per.goud || 0;
    const open = Math.ceil(gevraagd - gegeven - 1e-9);
    neemt.goud = Math.max(0, Math.min((geef && geef.goud) || 0, v.goud || 0, open));
    gegeven = Math.min(gevraagd, gegeven + neemt.goud);

    const deel = gevraagd > 0 ? gegeven / gevraagd : 1;
    const tekort = gevraagd - gegeven;
    // zwaarte 0: niets, 1: boete, 2: ook soldaten, 3: ook de schandpaal.
    let zwaarte;
    let veelTeWeinig = false;
    let ambtKwijt;
    let keer = 0; // hoeveel jaar achter elkaar tekort, dit jaar meegeteld (telWijze 'hoeVaak')
    if (IN().telWijze === 'hoeVaak') {
      keer = deel < 1 - 1e-9 ? ((D.heer && D.heer.tekortJaren) || 0) + 1 : 0;
      zwaarte = Math.min(STRAFFEN.length, keer);
      ambtKwijt = keer > 0 && keer >= IN().ambtKwijtNa;
    } else {
      const band = IN().straffen.find((b) => deel >= b.vanaf - 1e-9) || IN().straffen[IN().straffen.length - 1];
      zwaarte = STRAFFEN.indexOf(band.straf) + 1;
      veelTeWeinig = deel < IN().veelTeWeinig - 1e-9;
      keer = veelTeWeinig ? ((D.heer && D.heer.veelTeWeinig) || 0) + 1 : 0;
      ambtKwijt = veelTeWeinig && keer >= IN().ambtKwijtNa;
    }
    const schuld = zwaarte ? Math.ceil(tekort * (1 + IN().boete) - 1e-9) : 0;
    // Met de spelregel "Twee bazen" (js/bazen.js; werklijst vraag 106) beslist zijn gunst over je ambt: wat deze schatting
    // ermee doet, en waar hij dan staat. Zonder: twee keer achter elkaar veel te weinig, zoals hierboven.
    const gunst = T.gunstNaSchatting(D, zwaarte ? STRAFFEN[zwaarte - 1] : null);
    if (gunst) ambtKwijt = gunst.na <= 0;
    const uit = {
      kan: T.heerWacht(D), neemt, gevraagd, gegeven, deel, tekort, straf: zwaarte ? STRAFFEN[zwaarte - 1] : null,
      boete: zwaarte >= 1, soldaten: zwaarte >= 2, schandpaal: zwaarte >= 3,
      veelTeWeinig, ambtKwijt, schuld, keer, gunst,
    };
    if (!uit.kan) uit.reden = 'De heer is er niet.';
    uit.tekst = gevolgTekst(uit);
    return uit;
  };

  const RANG = ['nulde', 'eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde', 'zevende', 'achtste', 'negende', 'tiende'];
  const rang = (n) => RANG[n] || `${n}e`;

  function gevolgTekst(g) {
    if (g.gunst) return gunstTekst(g);
    const hoeVaak = IN().telWijze === 'hoeVaak';
    const nogKeer = IN().ambtKwijtNa - g.keer;
    if (g.ambtKwijt) {
      return hoeVaak
        ? `Te weinig, voor de ${rang(g.keer)} keer achter elkaar: dit kost je je ambt.`
        : `Veel te weinig, voor de ${rang(g.keer)} keer achter elkaar: dit kost je je ambt.`;
    }
    // Hoe dicht je bij het einde zit: bij 'hoeVaak' telt elk tekort, anders alleen veel te weinig.
    let nog = '';
    if ((hoeVaak && g.keer) || g.veelTeWeinig) {
      const wat = hoeVaak ? 'Te weinig' : 'Veel te weinig';
      nog = nogKeer === 1 ? ` ${wat}: nog een keer zo, en je bent je ambt kwijt.` : ` ${wat}: nog ${nogKeer} keer zo, en je bent je ambt kwijt.`;
    }
    const wanneer = hoeVaak && g.keer ? `De ${rang(g.keer)} keer achter elkaar dat je tekortschiet. ` : '';
    if (g.schandpaal) return `${wanneer}Een boete (volgend jaar ${g.schuld} goud erbij), twee soldaten tot de lente, én de schandpaal: jij wijst aan wie.${nog}`;
    if (g.soldaten) return `${wanneer}Een boete (volgend jaar ${g.schuld} goud erbij), en twee soldaten die tot de lente blijven en meeëten.${hoeVaak ? nog : ''}`;
    if (g.boete) return `${wanneer}Een boete: volgend jaar komt er ${g.schuld} goud bij wat hij vraagt.${hoeVaak ? nog : ''}`;
    if (g.deel < 1 - 1e-9) return 'Hij telt slecht: dit merkt hij niet.';
    return 'Hij krijgt alles wat hij vraagt.';
  }

  // Met twee bazen (js/bazen.js): de straf, en wat het met zijn gunst doet.
  function gunstTekst(g) {
    const voor = g.gunst.na - g.gunst.erbij;
    if (g.ambtKwijt) return `Zijn gunst zakt naar 0: dit kost je je ambt.`;
    const straf = g.schandpaal
      ? `Een boete (volgend jaar ${g.schuld} goud erbij), twee soldaten tot de lente, én de schandpaal: jij wijst aan wie.`
      : g.soldaten ? `Een boete (volgend jaar ${g.schuld} goud erbij), en twee soldaten die tot de lente blijven en meeëten.`
        : g.boete ? `Een boete: volgend jaar komt er ${g.schuld} goud bij wat hij vraagt.`
          : g.deel < 1 - 1e-9 ? 'Hij telt slecht: dit merkt hij niet.' : 'Hij krijgt alles wat hij vraagt.';
    const waarschuwt = g.gunst.na < T.BAZEN_INSTELLINGEN.waarschuwing ? ' Dan schrijft hij je een waarschuwing.' : '';
    return `${straf} Zijn gunst: ${Math.round(Math.max(0, voor))} → ${Math.round(g.gunst.na)}.${waarschuwt}`;
  }

  // Wat de heer zegt als hij geteld heeft. Hij is de grap; zijn soldaten niet (spel.md).
  function heerZegt(g) {
    if (g.schandpaal) return '"Veel te weinig." De heer kijkt het gehucht rond. "Iemand moet dit voelen, schout. U mag kiezen wie."';
    if (g.soldaten) return '"Te weinig." De heer wijst twee soldaten aan. "Die blijven hier tot de lente. Ze eten wat u eet. Of wat u niet meer eet."';
    if (g.boete) return 'De heer telt, fronst, en schrijft iets op. "Dat komt er volgend jaar bij, schout. Met de boete. De boete is het mooiste deel."';
    if (g.deel < 1 - 1e-9) return 'De heer telt, telt nog eens, en komt twee keer ergens anders uit. "Het klopt," zegt hij.';
    return 'De heer telt twee keer, en het komt twee keer anders uit. "Het klopt," zegt hij. "Tot volgend jaar."';
  }

  // Wat je na deze betaling overhoudt tot de volgende oogst, voor het venster: zo zie je vóór het
  // betalen of je graan het haalt. Het dorp eet tot de oogst begint (T.AKKER_STADIA "rijp"), de
  // soldaten eten mee tot de lente als ze komen, en zaaien kost een zaaigraan per tegel.
  // { na, eten, melk, kaas, soldaten, zaaien, over, dagen }: `over` onder nul is graan tekort vóór
  // de oogst. Sinds het vee (25 sep): `eten` is wat het dorp aan graan eet, want de melk van
  // grasmaand af (`melk`, js/vee.js) drinkt het eerst; en wie graan tekortkomt, eet daarna nog de
  // `kaas` op, dus honger is pas een tekort groter dan de kaas. Zaaien kost alleen wat volgend jaar
  // akker wordt (het plan, js/akkers.js): een weide of braak zaai je niet.
  T.heerVooruitzicht = function (D, g) {
    const dag = dagNu(D);
    const rijp = T.AKKER_STADIA && T.AKKER_STADIA.find((s) => s.stadium === 'rijp');
    const oogst = rijp ? volgendeKeer(dag, { maand: T.MAANDEN[rijp.maand].naam, dag: rijp.dag }) : dag;
    const lente = volgendeKeer(dag, IN().soldatenTot);
    const perMens = T.etenPerMens(D);
    const melk = T.verwachteMelk(D, dag, oogst);
    const eten = Math.max(0, (D.bevolking || 0) * perMens * (oogst - dag) - melk);
    const soldaten = g && g.soldaten ? soldatenPerDag() * (lente - dag) : 0;
    const wordtAkker = (a) => T.planVan(a) === 'akker';
    const tegels = ((D.wereld && D.wereld.akkers) || []).filter(wordtAkker).reduce((n, a) => n + a.b * a.h, 0);
    const zaaien = tegels * (T.ZAAIGRAAN_PER_TEGEL || 0);
    const na = ((D.voorraad && D.voorraad.graan) || 0) - ((g && g.neemt && g.neemt.graan) || 0);
    const kaas = (D.voorraad && D.voorraad.kaas) || 0;
    // Vlees vult sinds 25 sep ook een maag (js/behoeften.js): het vangt net als de kaas een tekort op.
    const vlees = T.vleesAlsEten(D);
    return { na, eten, melk, kaas, vlees, soldaten, zaaien, over: na - eten - soldaten - zaaien, dagen: oogst - dag };
  };

  // Betalen. Geeft het gevolg terug (T.gevolgVanBetaling), of { kan: false, reden }.
  T.betaalHeer = function (D, geef) {
    if (!T.heerWacht(D)) return { kan: false, reden: 'De heer is er niet.' };
    const h = D.heer;
    const b = h.bezoek;
    const g = T.gevolgVanBetaling(D, geef);
    for (const wat in g.neemt) if (g.neemt[wat] > 0) T.wijzigVoorraad(D, wat, -g.neemt[wat]);
    // De oude schuld zat in wat hij vroeg; wat er nu openstaat, met de boete, is de nieuwe.
    h.schuld = g.schuld;
    h.tekort = g.tekort;
    h.veelTeWeinig = g.veelTeWeinig ? h.veelTeWeinig + 1 : 0;
    h.tekortJaren = g.deel < 1 - 1e-9 ? (h.tekortJaren || 0) + 1 : 0;
    h.brief = null;
    b.betaald = g;
    h.jaren.push({ jaar: T.datumVanDag(dagNu(D)).jaar, deel: g.deel, straf: g.straf });
    // Twee bazen (js/bazen.js): zijn gunst; op 0 ontslaat hij je (hieronder, of al via de meter).
    if (g.gunst) T.wijzigGunst(D, g.gunst.erbij, g.gunst.erbij > 0 ? 'je betaalde wat hij vroeg' : 'je betaalde te weinig');
    // Het rapport van de inner is betaald, en zijn argwaan zakt (js/inner.js); de boete voor de houtkap ook.
    T.innerNaSintMaarten(D);
    T.wettenNaSintMaarten(D);
    if (T.zetVlag) {
      T.zetVlag(D, 'heerBetaald');
      T.wisVlag(D, 'heerSchuld');
      T.wisVlag(D, 'briefVanDeHeer');
    }
    if (g.ambtKwijt) {
      T.ambtKwijt(D);
      return g;
    }
    T.zeg(D, heerZegt(g), g.boete ? 'gevaar' : null);
    if (g.soldaten) soldatenBlijven(D);
    // Bij de schandpaal wacht hij op jouw keuze (T.zetAanDeSchandpaal); anders gaat hij.
    if (g.schandpaal) b.schandpaal = true;
    else T.heerVertrekt(D);
    return g;
  };

  // Komt de schout niet, dan neemt de heer het zelf: van alles wat hij vraagt zoveel als er is, en
  // wat er dan nog ontbreekt in goud. Moet er iemand aan de schandpaal, dan wijst hij zelf aan:
  // wie het dorp het meest raakt. "Het dorp denkt dat jij het zo wilde."
  T.heerNeemtZelf = function (D) {
    if (!T.heerWacht(D)) return { kan: false, reden: 'De heer is er niet.' };
    const eis = T.eisVanDeHeer(D);
    const geef = { ...eis.per, goud: (D.voorraad && D.voorraad.goud) || 0 };
    T.zeg(D, 'Je bent niet gekomen. De heer neemt zelf mee wat hij hebben wil.', 'gevaar');
    T.wijzigGunst(D, T.BAZEN_INSTELLINGEN.nietGekomen, 'je kwam niet naar het plein');
    const g = T.betaalHeer(D, geef);
    if (g.schandpaal && !D.einde) {
      const keuzes = T.schandpaalKeuzes(D).filter((k) => k.wie !== 'schout');
      const zijn = keuzes.sort((a, b) => b.kost - a.kost)[0];
      if (zijn) {
        T.zeg(D, `De heer wees zelf aan wie er aan de schandpaal moest: ${zijn.naam}. Het dorp denkt dat jij het zo wilde.`, 'gevaar');
        T.zetAanDeSchandpaal(D, zijn.wie);
      } else {
        D.heer.bezoek.schandpaal = false;
        T.heerVertrekt(D);
      }
    }
    return g;
  };

  // ---------------------------------------------------------------------------------------------
  // De straffen: soldaten, de schandpaal, en je ambt kwijt
  // ---------------------------------------------------------------------------------------------

  function soldatenBlijven(D) {
    const h = D.heer;
    const b = h.bezoek;
    h.soldaten = { tot: volgendeKeer(dagNu(D), IN().soldatenTot), wezens: [] };
    // Zijn soldaten liepen met hem mee; die blijven nu hier, en lopen rond op het plein.
    if (b && b.wezens) {
      h.soldaten.wezens = b.wezens.filter((e) => e.wie === 'soldaat');
      b.wezens = b.wezens.filter((e) => e.wie !== 'soldaat');
      const plek = pleinVan(D.wereld);
      for (const e of h.soldaten.wezens) {
        e.thuis = { x: plek.x, y: plek.y };
        e.straal = 5;
      }
    }
    T.zetVlag(D, 'soldatenInHuis');
    T.wijzigVertrouwen(D, T.BAZEN_INSTELLINGEN.soldaten, 'soldaten van de heer in huis');
  }

  function soldatenGaan(D) {
    const h = D.heer;
    const s = h.soldaten;
    T.wisVlag(D, 'soldatenInHuis');
    T.zeg(D, 'Het is lente. De soldaten van de heer trekken weg.', 'goed');
    if (s.wezens && s.wezens.length) {
      s.weg = true; // ze lopen nog naar de weg; T.werkHeerBij haalt ze daar weg
      for (const e of s.wezens) naarDeWeg(D, e);
    } else {
      h.soldaten = null;
    }
  }

  // Wie er aan de schandpaal kan: de boeren (wie een karakter heeft, js/boeren.js), met wat het het
  // dorp kost naar hun aanzien, en de schout zelf. [{ wie, naam, eigenschap, kost, boete }]: kost is
  // de tevredenheid, boete het goud dat de heer erbij zet (alleen bij de schout).
  T.schandpaalKeuzes = function (D) {
    const lijst = [];
    const gezien = new Set();
    for (const e of (D.wereld && D.wereld.wezens) || []) {
      const kost = T.aanzienVan(e);
      if (kost == null || e.dood || gezien.has(e.wie)) continue;
      gezien.add(e.wie);
      const eigenschap = T.overBoerTekst(e);
      lijst.push({ wie: e.wie, naam: e.naam || T.naamVanMens(e.wie), eigenschap, kost, boete: 0 });
    }
    if (!IN().schoutMagZelf) return lijst;
    const h = D.heer;
    const extra = h ? Math.ceil(h.tekort * (IN().boeteZelf - IN().boete) - 1e-9) : 0;
    lijst.push({ wie: 'schout', naam: 'Jijzelf', eigenschap: 'de schout', kost: 0, boete: Math.max(0, extra) });
    return lijst;
  };

  // De schandpaal: een paal met een halsijzer, die er komt de eerste keer dat de heer iemand straft,
  // en dan blijft staan (Marcel, 24 sep; ontwerp/spel.md, "Sint-Maarten"). Hij staat een eindje
  // naast de heer op het plein. Wie gestraft wordt, staat op de tegel ervóór (x+1, y+1: in beeld
  // recht eronder), met zijn rug tegen de paal.
  const VOOR_DE_PAAL = { dx: 1, dy: 1 };

  // Mag hier de paal, of iemand die eraan staat? Begaanbaar, en niet in een akker.
  function vrijOpHetPlein(w, x, y) {
    if (!w.tegels || !T.isBegaanbaar) return true;
    if (!T.isBegaanbaar(w, x, y)) return false;
    return !(w.akkers || []).some((a) => x >= a.x && x < a.x + a.b && y >= a.y && y < a.y + a.h);
  }

  // Een tegel op afstand r van `doel` (de ringen rond `doel`), de eerste waarvoor `past` ja zegt.
  function eersteRond(doel, tot, past) {
    for (let r = 0; r <= tot; r++) {
      for (let y = doel.y - r; y <= doel.y + r; y++) {
        for (let x = doel.x - r; x <= doel.x + r; x++) {
          if (Math.max(Math.abs(x - doel.x), Math.abs(y - doel.y)) === r && past(x, y)) return { x, y };
        }
      }
    }
    return null;
  }

  // Waar de paal komt: zo dicht mogelijk bij twee tegels rechts van de heer, waar de paal én de
  // tegel ervoor vrij zijn. Puur: zet nog niets neer.
  T.plekVoorDeSchandpaal = function (D) {
    const w = D.wereld;
    const plek = pleinVan(w);
    const doel = { x: plek.x + 2, y: plek.y };
    return eersteRond(doel, 4, (x, y) => !(x === plek.x && y === plek.y)
      && vrijOpHetPlein(w, x, y) && vrijOpHetPlein(w, x + VOOR_DE_PAAL.dx, y + VOOR_DE_PAAL.dy)) || doel;
  };

  // De paal neerzetten, als hij er nog niet staat: een voorwerp dat zijn tegel beslaat
  // (T.VOORWERPEN.schandpaal, js/wereld.js). Geeft waar hij staat.
  T.zetSchandpaalNeer = function (D) {
    const h = D.heer || (D.heer = T.nieuweHeer());
    if (h.paal) return h.paal;
    const w = D.wereld;
    h.paal = T.plekVoorDeSchandpaal(D);
    T.zetVoorwerp(w, { soort: 'schandpaal', x: h.paal.x, y: h.paal.y });
    return h.paal;
  };

  // Waar wie gestraft wordt, staat: vóór de paal. Is die tegel intussen bebouwd, dan de
  // dichtstbijzijnde vrije tegel ernaast.
  function voorDePaal(D) {
    const paal = T.zetSchandpaalNeer(D);
    const doel = { x: paal.x + VOOR_DE_PAAL.dx, y: paal.y + VOOR_DE_PAAL.dy };
    return eersteRond(doel, 3, (x, y) => vrijOpHetPlein(D.wereld, x, y)) || doel;
  }

  // Wie staat er nu aan de paal? Wie voor zijn straf op de tegel ervóór moet (h.wrok, moetNaar),
  // daar is aangekomen (zijn dagen tellen) en stilstaat; anders null. Dan is de paal bezet: de
  // ketting loopt naar hem en hij draagt het halsijzer (js/tekenen.js). Puur.
  T.aanDePaal = function (D) {
    const h = D.heer;
    const w = D.wereld;
    if (!h || !h.paal || !w || !w.wezens) return null;
    const x = h.paal.x + VOOR_DE_PAAL.dx;
    const y = h.paal.y + VOOR_DE_PAAL.dy;
    for (const wr of h.wrok) {
      if (!wr.staat || wr.vanaf == null) continue;
      const e = w.wezens.find((m) => m.wie === wr.wie && !m.dood);
      if (!e || !e.moetNaar || e.moetNaar.x !== x || e.moetNaar.y !== y) continue;
      if (e.tx === x && e.ty === y && e.x === x && e.y === y && !(e.pad && e.pad.length)) return e;
    }
    return null;
  };

  // De vlag die een gesprek laat weten dat iemand aan de schandpaal stond, naar het gesprek dat hij
  // voert: een boer met het karakter weduwe (js/boeren.js) krijgt "schandpaalWeduwe", en dat leest
  // het gesprek van de weduwe. Elk karakter hoort in een spel bij één boer.
  T.schandpaalVlag = (wie) => 'schandpaal' + wie.charAt(0).toUpperCase() + wie.slice(1);

  T.zetAanDeSchandpaal = function (D, wie) {
    const h = D.heer;
    const b = h && h.bezoek;
    if (!b || !b.schandpaal) return { kan: false, reden: 'Er hoeft niemand aan de schandpaal.' };
    const keuze = T.schandpaalKeuzes(D).find((k) => k.wie === wie);
    if (!keuze) return { kan: false, reden: 'Die is er niet.' };
    // De eerste keer komt de paal er, en die blijft staan.
    T.zetSchandpaalNeer(D);
    if (wie === 'schout') {
      // Het dorp neemt het je niet kwalijk, maar de heer vindt het lachwekkend (Marcel, 24 sep).
      h.schuld += keuze.boete;
      T.zetVlag(D, 'schoutAanDeSchandpaal');
      T.wijzigVertrouwen(D, T.BAZEN_INSTELLINGEN.schandpaalZelf, 'je zette jezelf aan de schandpaal');
      T.zeg(D, `Je zet jezelf aan de schandpaal. Het dorp kijkt zwijgend toe. De heer lacht tot hij hikt, en zet er ${keuze.boete} goud bij.`, 'gevaar');
    } else {
      // Zijn poppetje loopt naar het plein en staat daar (T.wandelAnker, js/akkers.js, kijkt naar
      // moetNaar). Zijn dagen aan de paal tellen pas als hij er staat (T.werkHeerBij), net als bij
      // de marskramer: drie dagen zijn op 1× maar zeven seconden, en anders mocht hij al naar huis
      // voor hij er was. Zonder poppetje of zonder wereld om in te lopen staat hij er meteen.
      const e = ((D.wereld && D.wereld.wezens) || []).find((x) => x.wie === wie && !x.dood);
      const lopen = !!(e && kanLopen(D));
      h.wrok.push({ wie, dag: dagNu(D), kost: keuze.kost, staat: true, vanaf: lopen ? null : dagNu(D) });
      T.zetVlag(D, T.schandpaalVlag(e ? T.gesprekIdVan(e) : wie));
      if (e) e.moetNaar = { ...voorDePaal(D), straal: 0 };
      T.zeg(D, `${keuze.naam} moet ${IN().schandpaalDagen} dagen aan de schandpaal op het plein. Het dorp zal het onthouden.`, 'gevaar');
      T.wijzigVertrouwen(D, -keuze.kost * T.BAZEN_INSTELLINGEN.schandpaalPerAanzien, `${keuze.naam} aan de schandpaal`);
    }
    b.schandpaal = false;
    T.heerVertrekt(D);
    return { kan: true };
  };

  // Hoeveel minder tevreden het dorp is door wat de heer bracht: soldaten in huis, en wie jij aan de
  // schandpaal zette (dat slijt in wrokDagen weg). Voor T.berekenTevredenheid (js/behoeften.js):
  // { minder, waarom: ['soldaten in huis', …] }. Puur.
  T.heerOntevredenheid = function (D, dag) {
    const h = D.heer;
    const uit = { minder: 0, waarom: [] };
    if (!h) return uit;
    if (h.soldaten && !h.soldaten.weg) {
      uit.minder += IN().soldatenOntevreden;
      uit.waarom.push('soldaten in huis');
    }
    let wrok = 0;
    for (const w of h.wrok) wrok += w.kost * Math.max(0, 1 - (dag - w.dag) / IN().wrokDagen);
    if (wrok > 0) {
      uit.minder += wrok;
      uit.waarom.push('de schandpaal');
    }
    return uit;
  };

  // Je ambt kwijt: de heer ontslaat de schout van dit dorp (D.einde). In jouw dorp is het spel dan uit: js/hud.js
  // toont het einde, en zet het spel stil.
  // Met twee bazen (js/bazen.js) omdat zijn gunst op is (`waarom`), anders na twee keer veel te weinig.
  T.ambtKwijt = function (D, waarom) {
    if (D.einde) return;
    D.einde = { reden: 'ambt', dag: dagNu(D), waarom: waarom || null };
    T.zeg(D, waarom ? '"Genoeg, schout." De heer schudt zijn hoofd. "U bent ontslagen."' : '"Twee keer, schout." De heer schudt zijn hoofd. "U bent ontslagen."', 'gevaar');
    if (!D.ander) T.houdTijdStil(D, 'einde');
    if (T.ui && T.ui.toonEinde) T.ui.toonEinde(D);
  };

  // ---------------------------------------------------------------------------------------------
  // De dagen: de brief, zijn komst, het wachten, de soldaten die meeëten en weer gaan
  // ---------------------------------------------------------------------------------------------

  T.stuurBrief = function (D, dag) {
    const h = D.heer || (D.heer = T.nieuweHeer());
    h.brief = { dag, eis: T.eisVanDeHeer(D) };
    T.zetVlag(D, 'briefVanDeHeer');
    if (T.ui && T.ui.toonBrief) T.ui.toonBrief(D, 'schatting');
    else T.zeg(D, 'Er is een brief van de heer.');
  };

  T.heerKomt = function (D, dag) {
    const h = D.heer || (D.heer = T.nieuweHeer());
    // Hij telt de kist als hij komt, en dat getal houdt hij (js/heer.js, T.eisVanDeHeer, zonder
    // rapport): anders werd zijn eis kleiner terwijl je hem betaalde.
    h.bezoek = {
      komtOp: dag, staat: false, wachtTot: null, betaald: null, weg: false, wezens: null, schandpaal: false,
      kist: (D.voorraad && D.voorraad.goud) || 0,
      aankomst: { tekst: 'Sint-Maarten. De heer komt over de weg, met twee soldaten.', soort: 'gevaar', naarGewoon: true },
    };
    if (T.zetVlag) {
      T.zetVlag(D, 'heerOpBezoek');
      if (h.schuld > 0) T.zetVlag(D, 'heerSchuld');
    }
    // Hij komt overdag (js/dag.js, T.bezoekerKomtAan): valt zijn dag 's nachts in, dan zegt het
    // bericht het pas als hij de kaart op loopt (T.werkHeerBij). Zonder poppetje (een toets zonder
    // wereld om in te lopen) is hij er meteen, en staat hij meteen op het plein.
    if (!kanLopen(D)) h.bezoek.meteen = true;
    T.bezoekerKomtAan(D, h.bezoek);
    if (!kanLopen(D)) T.heerStaatErOp(D);
  };

  // Hij staat op het plein en wacht op je, en zijn wachtdagen tellen. Tot 26 sep stond de tijd dan
  // stil, omdat naar hem toe lopen bij een dag van 2,5 seconde dagen kostte; sinds de dag (js/dag.js)
  // kost het een uur of twee, en loopt de tijd gewoon door, op 1×.
  T.heerStaatErOp = function (D) {
    const h = D.heer;
    const b = h.bezoek;
    if (!b || b.staat) return;
    b.staat = true;
    // Op het plein kijkt hij rond: wat hij ziet en niet in het rapport van zijn inner staat, komt
    // alsnog op de rekening, en dat maakt argwanend (js/inner.js). En zijn soldaten zoeken: is de
    // argwaan hoog genoeg, het hele dorp; anders twee of drie plekken, waar de schout ze langs leidt
    // (js/doorzoeken.js; werklijst punt 4, vraag 41).
    T.heerKijktRond(D);
    const INN = T.INNER_INSTELLINGEN;
    const heelDorp = !!(INN && D.inner && D.inner.argwaan >= INN.doorzoekenVanaf && T.doorzoekDorp);
    if (heelDorp) T.doorzoekDorp(D);
    else {
      T.beginDoorzoeken(D);
      // En elk jaar lopen er een paar door het bos, naar akkers die niet in zijn boeken staan (js/ontginnen.js; vraag 107,
      // g1). Doorzoeken ze het hele dorp, dan doen ze dat daar al.
      T.doorzoekHetBos(D);
    }
    // Een akker in zijn bos die zijn inner zag en die niet in zijn boeken stond: betrapt (js/ontginnen.js).
    T.heerVindtBosAkkers(D);
    b.wachtTot = dagNu(D) + IN().wachtDagen;
    T.naarGewoneSnelheid(D);
    T.zeg(D, 'De heer staat op het plein en wacht op je.');
  };

  T.heerVertrekt = function (D) {
    const h = D.heer;
    const b = h.bezoek;
    b.weg = true;
    T.zetVlag(D, 'heerVertrekt');
    if (b.wezens && b.wezens.length) for (const e of b.wezens) naarDeWeg(D, e);
    else haalHeerWeg(D);
  };

  // Helemaal weg, ook uit de wereld; zijn vlaggen gaan mee.
  function haalHeerWeg(D) {
    const h = D.heer;
    if (!h || !h.bezoek) return;
    haalUitWereld(D, h.bezoek.wezens);
    if (T.wisVlag) for (const v of ['heerOpBezoek', 'heerBetaald', 'heerVertrekt', 'heerSchuld']) T.wisVlag(D, v);
    h.bezoek = null;
  }

  function haalUitWereld(D, wezens) {
    if (!wezens || !D.wereld) return;
    for (const e of wezens) {
      const i = D.wereld.wezens.indexOf(e);
      if (i >= 0) D.wereld.wezens.splice(i, 1);
    }
  }

  // Wat de soldaten vandaag eten, in graan: niets als ze er niet (meer) zijn. Ook voor wat het dorp
  // vooruitziet (js/behoeften.js, T.etenVoorDeWinter).
  T.soldatenEten = function (D, dag) {
    const s = D.heer && D.heer.soldaten;
    return s && !s.weg && dag < s.tot ? soldatenPerDag() : 0;
  };

  // Eén dag. Wordt aangeroepen vanuit T.tikGebouwenDag (js/gebouwen.js, stap 0), één keer per
  // verstreken kalenderdag, net als T.tikHandelDag.
  T.tikHeerDag = function (D, dag) {
    if (!magKomen(D) || D.einde) return;
    const h = D.heer || (D.heer = T.nieuweHeer());
    const d = T.datumVanDag(dag);
    // De soldaten eten mee zolang ze er zijn, elk voor drie; in de lente gaan ze.
    if (h.soldaten && !h.soldaten.weg) {
      if (dag >= h.soldaten.tot) soldatenGaan(D);
      else if (D.voorraad) T.wijzigVoorraad(D, 'graan', -T.soldatenEten(D, dag));
    }
    // Wie aan de schandpaal stond, mag na zijn dagen weer naar huis. Die tellen vanaf dat hij er
    // staat; komt hij er om wat voor reden ook niet, dan mag hij na een week ook naar huis.
    for (const w of h.wrok) {
      if (!w.staat) continue;
      const klaar = w.vanaf != null ? dag >= w.vanaf + IN().schandpaalDagen : dag >= w.dag + IN().schandpaalDagen + 7;
      if (!klaar) continue;
      w.staat = false;
      const e = ((D.wereld && D.wereld.wezens) || []).find((x) => x.wie === w.wie);
      if (e) {
        e.moetNaar = null;
        e.kijkt = null;
      }
    }
    if (d.maand === maandIdx(IN().brief.maand) && d.dagVanMaand === IN().brief.dag && !h.bezoek) T.stuurBrief(D, dag);
    if (d.sintMaarten && !h.bezoek) T.heerKomt(D, dag);
    // Hij wacht; komt de schout niet, dan neemt hij het zelf.
    const b = h.bezoek;
    if (b && b.staat && !b.betaald && b.wachtTot != null && dag >= b.wachtTot) T.heerNeemtZelf(D);
  };

  // ---------------------------------------------------------------------------------------------
  // Zijn komen en gaan in de wereld: elk beeld (js/main.js, werkBij), net als T.werkMarskramerBij.
  // Het lopen zelf doet het gewone dwaalwerk (js/verkennen.js, T.laatDwalen).
  // ---------------------------------------------------------------------------------------------

  function kanLopen(D) {
    return !!(D.wereld && T.maakMens && T.wegInEnUit(D.wereld) && D.wereld.wezens);
  }

  function naarDeWeg(D, e) {
    const uitgang = T.wegInEnUit(D.wereld);
    e.moetNaar = null;
    e.thuis = { x: uitgang.x, y: uitgang.y };
    e.straal = 1;
    e.gaat = true;
  }

  // Staat hij op de weg de kaart uit (of er vlak naast, want zijn straal is één), dan is hij weg.
  function isBijDeUitgang(D, e) {
    const uitgang = T.wegInEnUit(D.wereld);
    return e.tx === uitgang.x && e.ty === uitgang.y && !(e.pad && e.pad.length) && !e.onderweg;
  }

  T.werkHeerBij = function (D) {
    const h = D.heer;
    if (!h || !magKomen(D) || !kanLopen(D)) return;
    const w = D.wereld;
    const uitgang = T.wegInEnUit(w);
    const plek = pleinVan(w);
    const b = h.bezoek;
    if (b && !b.wezens && !b.weg) {
      // Overdag, vanaf het bezoekuur, met zijn bericht (js/dag.js).
      if (!T.bezoekerKomtAan(D, b)) return;
      // Hij komt de kaart op, met zijn twee soldaten vlak achter zich.
      const heer = T.maakMens('heer', uitgang.x, uitgang.y, 1);
      heer.thuis = { x: plek.x, y: plek.y };
      const soldaten = [];
      for (let i = 0; i < IN().soldaten; i++) {
        const s = T.maakMens('soldaat', uitgang.x, uitgang.y, 2);
        s.thuis = { x: plek.x + (i ? 1 : -1), y: plek.y + 1 };
        soldaten.push(s);
      }
      b.wezens = [heer, ...soldaten];
      w.wezens.push(...b.wezens);
      return;
    }
    if (b && b.wezens && !b.staat && !b.weg) {
      const heer = b.wezens[0];
      if (T.afstand({ x: plek.x, y: plek.y }, { x: heer.tx, y: heer.ty }) <= 1) T.heerStaatErOp(D);
    }
    if (b && b.weg && b.wezens) {
      const nog = b.wezens.filter((e) => !isBijDeUitgang(D, e));
      haalUitWereld(D, b.wezens.filter((e) => !nog.includes(e)));
      b.wezens = nog;
      if (!nog.length) haalHeerWeg(D);
    }
    // Wie aan de schandpaal moet: staat hij er, dan beginnen zijn dagen, en staat hij met zijn rug
    // naar de paal (e.kijkt, js/sprites.js): de paal staat een tegel schuin achter hem, dus naar Z.
    for (const wr of h.wrok) {
      if (!wr.staat || wr.vanaf != null) continue;
      const e = w.wezens.find((x) => x.wie === wr.wie);
      if (e && e.moetNaar && e.tx === e.moetNaar.x && e.ty === e.moetNaar.y) {
        wr.vanaf = dagNu(D);
        e.kijkt = 'Z';
      }
    }
    const s = h.soldaten;
    if (s && s.weg) {
      const nog = s.wezens.filter((e) => !isBijDeUitgang(D, e));
      haalUitWereld(D, s.wezens.filter((e) => !nog.includes(e)));
      s.wezens = nog;
      if (!nog.length) h.soldaten = null;
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
