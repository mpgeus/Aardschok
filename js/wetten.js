// De wetten (stap 3 van de proef "van gehucht tot dorp"; werklijst vraag 54, Marcel, 29 sep: "Het wordt gewoon een
// menu zoals in diplomacy 3, waar je weten kunt aannemen etc. Maak het niet te ingewikkeld", en op het plan: "A ja
// B ja"). Eerst heetten ze keuren (ontwerp/spel.md, "Keuren en politiek").
//
// Een menu zoals in Democracy 3 (js/wettenmenu.js, onder W): elke wet heeft een voordeel en een nadeel, je neemt
// hem aan of schaft hem af, en hij geldt meteen. Aannemen kost niets: zijn nadeel is de prijs.
//
// Wat een wet doet, staat als getallen in één blok (T.WETTEN_INSTELLINGEN, in de werkbank), per stand van de wet:
//   eten      hoeveel keer zoveel ieder eet (het rantsoen)
//   tevreden  wat er bij de tevredenheid bijkomt of afgaat (0,1 is 10%)
//   gezinnen  hoeveel keer zo vaak er een nieuw gezin kan komen
//   hout      hoeveel keer zoveel een houthakker hakt (hij hakt in het bos van de heer: T.GEBOUWEN[x].bos)
//   boete     goud dat de heer op Sint-Maarten rekent als er dat jaar in zijn bos gekapt is
//   goud      goud per mens per maand in de kist (de belasting)
// De regels vragen het aan T.wetFactor en T.wetSom (het eten in js/behoeften.js, de groei en de houthakker in
// js/gebouwen.js, de boete in js/heer.js), en het menu zegt het met T.watDeWetDoet. Zo zeggen de kaart in het
// menu en de regel hetzelfde.
//
// Wat je aannam, staat in S.wetten (en wordt dus vanzelf bewaard). Zonder S.wetten (een oud spel, een toets)
// staat elke wet op zijn standaard: dan speelt het spel zoals vóór de wetten.
//
// Zonder scherm, en dus getoetst (test/wetten.test.cjs).
(function (T) {
  'use strict';

  T.WETTEN_INSTELLINGEN = {
    rantsoen: {
      krap: { eten: 0.75, tevreden: -0.15 },
      ruim: { eten: 1.5, tevreden: 0.1 },
    },
    vreemden: { aangenomen: { gezinnen: 2, tevreden: -0.05 } },
    houtkap: { aangenomen: { hout: 2, boete: 5 } },
    belasting: { aangenomen: { goud: 0.05, tevreden: -0.1 } },
  };
  const IN = () => T.WETTEN_INSTELLINGEN;

  // De wetten, in de volgorde van het menu. Een wet met de standen afgeschaft en aangenomen heeft in het menu één
  // knop (Aannemen of Afschaffen); een wet met meer standen een knop per stand. `woorden` zegt per stand hoe het
  // dorp erover praat, bij de tevredenheid in de balk ("Het heeft last van het krappe rantsoen").
  T.WETTEN = {
    rantsoen: {
      naam: 'Rantsoen',
      trede: 'gehucht',
      uitleg: 'Hoeveel ieder elke dag eet.',
      standen: ['krap', 'gewoon', 'ruim'],
      standaard: 'gewoon',
      woorden: { krap: 'het krappe rantsoen', ruim: 'het ruime rantsoen' },
    },
    vreemden: {
      naam: 'Vreemden welkom',
      trede: 'gehucht',
      uitleg: 'Wie hier wil wonen, mag komen.',
      standen: ['afgeschaft', 'aangenomen'],
      standaard: 'afgeschaft',
      woorden: { aangenomen: 'de vreemden' },
    },
    houtkap: {
      naam: 'Houtkap in het bos van de heer',
      trede: 'gehucht',
      uitleg: 'De houthakker mag ook de bomen van de heer omhakken.',
      standen: ['afgeschaft', 'aangenomen'],
      standaard: 'afgeschaft',
      woorden: {},
    },
    belasting: {
      naam: 'Belasting',
      trede: 'gehucht',
      uitleg: 'Ieder betaalt elke maand een beetje aan de kist van het dorp.',
      standen: ['afgeschaft', 'aangenomen'],
      standaard: 'afgeschaft',
      woorden: { aangenomen: 'de belasting' },
    },
  };


  T.nieuweWetten = () => ({ standen: {}, gekapt: false, belastingRest: 0 });

  // Een wet met alleen afgeschaft en aangenomen: in het menu één knop.
  T.wetIsAanUit = (id) => T.WETTEN[id].standen.length === 2 && T.WETTEN[id].standen[1] === 'aangenomen';

  // In welke stand een wet nu staat.
  T.standVanWet = (D, id) => (D.wetten && D.wetten.standen[id]) || T.WETTEN[id].standaard;

  // Wat een wet in een stand doet: { eten, tevreden, ... }, of {} (de standaard doet niets).
  T.wetDoet = (id, stand) => (IN()[id] && IN()[id][stand]) || {};

  // De wetten die je hier mag maken: van deze trede en de treden ervoor, zoals de gebouwen in het bouwmenu
  // (T.inBouwmenu, js/gebouwen.js).
  T.wettenVanNu = (D) => Object.keys(T.WETTEN).filter((id) => T.GEBOUW_TREDEN.indexOf(T.WETTEN[id].trede) <= T.GEBOUW_TREDEN.indexOf(D.trede || 'gehucht'));

  // Een wet aannemen, afschaffen of in een andere stand zetten. Geeft { kan, reden }. Hij geldt meteen: wat het
  // dorp eet, hoe tevreden het is en wat de houthakker hakt, vragen de regels elke dag opnieuw.
  T.zetWet = function (D, id, stand) {
    const wet = T.WETTEN[id];
    if (!wet || !wet.standen.includes(stand)) return { kan: false, reden: 'Die wet bestaat niet.' };
    if (!T.wettenVanNu(D).includes(id)) return { kan: false, reden: `Dat mag pas als het een ${wet.trede} is.` };
    if (T.standVanWet(D, id) === stand) return { kan: true };
    if (!D.wetten) D.wetten = T.nieuweWetten();
    D.wetten.standen[id] = stand;
    if (!T.wetIsAanUit(id)) T.zeg(D, `${wet.naam}: vanaf vandaag ${stand}.`);
    else T.zeg(D, `${wet.naam}: ${stand === 'aangenomen' ? 'aangenomen' : 'afgeschaft'}.`);
    T.tevredenheidOpnieuw(D);
    return { kan: true };
  };

  // Wat alle wetten samen doen, voor één soort: een factor (eten, gezinnen, hout) vermenigvuldigt, een getal
  // (tevreden, goud) telt op.
  T.wetFactor = function (D, soort) {
    let f = 1;
    for (const id of Object.keys(T.WETTEN)) {
      const d = T.wetDoet(id, T.standVanWet(D, id));
      if (d[soort] != null) f *= d[soort];
    }
    return f;
  };
  T.wetSom = function (D, soort) {
    let n = 0;
    for (const id of Object.keys(T.WETTEN)) n += T.wetDoet(id, T.standVanWet(D, id))[soort] || 0;
    return n;
  };

  // Wat de wetten aan de tevredenheid doen (T.berekenTevredenheid, js/behoeften.js): { erbij, last, blij }, met
  // de woorden van de wetten die eraf doen en die erbij doen.
  T.wettenTevredenheid = function (D) {
    const r = { erbij: 0, last: [], blij: [] };
    for (const id of Object.keys(T.WETTEN)) {
      const stand = T.standVanWet(D, id);
      const t = T.wetDoet(id, stand).tevreden || 0;
      if (!t) continue;
      r.erbij += t;
      const woorden = T.WETTEN[id].woorden[stand];
      if (woorden) (t < 0 ? r.last : r.blij).push(woorden);
    }
    return r;
  };

  // De boete die de heer op Sint-Maarten rekent (T.eisVanDeHeer, js/heer.js): heeft een houthakker dit jaar in
  // zijn bos gekapt, dan de boete uit de werkbank, ook als de wet intussen weer is afgeschaft.
  T.houtkapBoete = (D) => (D.wetten && D.wetten.gekapt ? T.wetDoet('houtkap', 'aangenomen').boete || 0 : 0);

  // Na Sint-Maarten (T.betaalHeer, js/heer.js): de boete is betaald, en het tellen begint opnieuw.
  T.wettenNaSintMaarten = function (D) {
    if (D.wetten) D.wetten.gekapt = false;
  };

  // Elke dag, na het werk (T.tikGebouwenDag, js/gebouwen.js): heeft een houthakker vandaag in het bos van de heer
  // gehakt, dan weet de heer het op Sint-Maarten; en op de eerste van de maand brengt de belasting goud op. Wat
  // niet een heel goud is, gaat mee naar de volgende maand.
  T.tikWettenDag = function (D, dag) {
    if (!D.wetten) D.wetten = T.nieuweWetten();
    const W = D.wetten;
    if (T.wetFactor(D, 'hout') > 1 && (D.gebouwen || []).some((g) => g.werkte > 0 && T.GEBOUWEN[g.soort].bos)) W.gekapt = true;
    const perMens = T.wetSom(D, 'goud');
    // Met een beurs per huis (js/geld.js, vraag 141) is de belasting een tiende van wat elk huis die maand verdiende
    // (Marcel, 9 okt: "ja dat is akkoord"): wat de wet per mens vraagt, naar verhouding van belastingIJk.
    if (perMens > 0 && T.datumVanDag(dag).dagVanMaand === 1 && T.metHuisbeurzen()) {
      const deel = T.GELD_INSTELLINGEN.tiende * (perMens / T.GELD_INSTELLINGEN.belastingIJk);
      let samen = 0;
      for (const g of D.gebouwen || []) if (g.verdiend > 0) samen += T.betaal(D, g, 'kas', g.verdiend * deel);
      if (samen > 0) T.zeg(D, `De belasting bracht ${T.muntTekst(samen)} op.`, 'goed');
      return;
    }
    if (perMens > 0 && T.datumVanDag(dag).dagVanMaand === 1) {
      // Een hogere stand betaalt meer (js/wensen.js, T.belastbaar; werklijst vraag 80, C).
      W.belastingRest += T.belastbaar(D) * perMens;
      const goud = Math.floor(W.belastingRest + 1e-9);
      if (goud > 0) {
        W.belastingRest -= goud;
        T.wijzigVoorraad(D, 'goud', goud);
        T.zeg(D, `De belasting bracht ${goud} goud op.`, 'goed');
      }
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Wat een wet doet, in woorden, voor het menu (js/wettenmenu.js)
  // ---------------------------------------------------------------------------------------------

  const getal = (x) => String(Math.round(x * 10) / 10).replace('.', ',');
  const KEER = { 0.5: 'de helft', 0.75: 'driekwart', 1.25: 'een kwart meer', 1.5: 'anderhalf keer zoveel', 2: 'twee keer zoveel', 3: 'drie keer zoveel' };
  const keer = (f) => KEER[f] || `${getal(f)} keer zoveel`;
  const vaak = (f) => (f === 2 ? 'twee keer zo vaak' : f === 3 ? 'drie keer zo vaak' : `${getal(f)} keer zo vaak`);

  // Wat een wet in een stand doet: [{ tekst, goed }], met de getallen van nu. Eerst wat goed is, dan wat het kost.
  T.watDeWetDoet = function (D, id, stand) {
    const d = T.wetDoet(id, stand);
    const regels = [];
    const bevolking = D.bevolking || 0;
    if (d.eten != null && d.eten !== 1) {
      const nu = bevolking * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
      regels.push({ goed: d.eten < 1, tekst: `ieder eet ${keer(d.eten)}: ${getal(nu * d.eten)} graan per dag in plaats van ${getal(nu)}` });
    }
    if (d.gezinnen != null && d.gezinnen !== 1) {
      const basis = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
      regels.push({ goed: d.gezinnen > 1, tekst: `${vaak(d.gezinnen)} een nieuw gezin: om de ${Math.max(1, Math.round(basis / d.gezinnen))} dagen in plaats van ${basis}` });
    }
    if (d.hout != null && d.hout !== 1) {
      const heeft = (D.gebouwen || []).some((g) => T.GEBOUWEN[g.soort].bos);
      regels.push({ goed: d.hout > 1, tekst: `een houthakker hakt ${keer(d.hout)} hout${heeft ? '' : ' (er is nog geen houthakker)'}` });
    }
    if (d.goud && T.metHuisbeurzen()) {
      const deel = T.GELD_INSTELLINGEN.tiende * (d.goud / T.GELD_INSTELLINGEN.belastingIJk);
      regels.push({ goed: true, tekst: `elke maand ${getal(deel * 100)} procent van wat de huizen verdienen in de kas` });
    } else if (d.goud) regels.push({ goed: true, tekst: `elke maand ${getal(T.belastbaar(D) * d.goud)} goud in de kist` });
    if (d.tevreden) {
      const pct = Math.round(Math.abs(d.tevreden) * 100);
      regels.push({ goed: d.tevreden > 0, tekst: d.tevreden > 0 ? `${pct}% tevredener` : `${pct}% minder tevreden` });
    }
    if (d.boete) regels.push({ goed: false, tekst: `de heer rekent op Sint-Maarten ${d.boete} goud boete, als er dat jaar gekapt is` });
    return regels.sort((a, b) => b.goed - a.goed);
  };
})(globalThis.Spel = globalThis.Spel || {});
