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
  // knop (Pass of Repeal); een wet met meer standen een knop per stand, met de naam uit `toon` (de standen zelf zijn
  // namen waar de regels op letten). `woorden` zegt per stand hoe het dorp erover praat, bij de tevredenheid in de balk
  // ("It suffers from the short rations").
  T.WETTEN = {
    rantsoen: {
      naam: T.t('Rations'),
      trede: 'gehucht',
      uitleg: T.t('How much everyone eats each day.'),
      standen: ['krap', 'gewoon', 'ruim'],
      toon: { krap: T.t('short'), gewoon: T.t('normal'), ruim: T.t('generous') },
      standaard: 'gewoon',
      woorden: { krap: T.t('the short rations'), ruim: T.t('the generous rations') },
    },
    vreemden: {
      naam: T.t('Strangers welcome'),
      trede: 'gehucht',
      uitleg: T.t('Whoever wants to live here may come.'),
      standen: ['afgeschaft', 'aangenomen'],
      standaard: 'afgeschaft',
      woorden: { aangenomen: T.t('the strangers') },
    },
    houtkap: {
      naam: T.t("Felling in the lord's forest"),
      trede: 'gehucht',
      uitleg: T.t("The woodcutter may fell the lord's trees as well."),
      standen: ['afgeschaft', 'aangenomen'],
      standaard: 'afgeschaft',
      woorden: {},
    },
    belasting: {
      naam: T.t('Tax'),
      trede: 'gehucht',
      uitleg: T.t('Everyone pays a little into the village chest each month.'),
      standen: ['afgeschaft', 'aangenomen'],
      standaard: 'afgeschaft',
      woorden: { aangenomen: T.t('the tax') },
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
    if (!wet || !wet.standen.includes(stand)) return { kan: false, reden: T.t('That law does not exist.') };
    // De naam van de trede (js/treden.js) vraagt een dorp; dit is er een met alleen die trede.
    if (!T.wettenVanNu(D).includes(id)) return { kan: false, reden: T.t('That law comes with {trede}.', { trede: T.tredeNaam({ trede: wet.trede }) }) };
    if (T.standVanWet(D, id) === stand) return { kan: true };
    if (!D.wetten) D.wetten = T.nieuweWetten();
    D.wetten.standen[id] = stand;
    if (!T.wetIsAanUit(id)) T.zeg(D, T.t('{wet}: {stand} from today.', { wet: wet.naam, stand: wet.toon[stand] }));
    else T.zeg(D, stand === 'aangenomen' ? T.t('{wet}: passed.', { wet: wet.naam }) : T.t('{wet}: repealed.', { wet: wet.naam }));
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
    if (perMens > 0 && T.datumVanDag(dag).dagVanMaand === 1) {
      // Een hogere stand betaalt meer (js/wensen.js, T.belastbaar; werklijst vraag 80, C).
      W.belastingRest += T.belastbaar(D) * perMens;
      const goud = Math.floor(W.belastingRest + 1e-9);
      if (goud > 0) {
        W.belastingRest -= goud;
        T.wijzigVoorraad(D, 'goud', goud);
        T.zeg(D, T.t('The tax brought in {goud}.', { goud: T.hoeveel(goud, 'goud') }), 'goed');
      }
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Wat een wet doet, in woorden, voor het menu (js/wettenmenu.js)
  // ---------------------------------------------------------------------------------------------

  // Een getal met hooguit één decimaal, met een punt (ontwerp/engels.md).
  const getal = (x) => String(Math.round(x * 10) / 10);
  const KEER = {
    0.5: T.t('half as much'), 0.75: T.t('three quarters as much'), 1.25: T.t('a quarter more'),
    1.5: T.t('half as much again'), 2: T.t('twice as much'), 3: T.t('three times as much'),
  };
  const keer = (f) => KEER[f] || T.t('{n} times as much', { n: getal(f) });
  const vaak = (f) => (f === 2 ? T.t('twice as often') : f === 3 ? T.t('three times as often') : T.t('{n} times as often', { n: getal(f) }));

  // Wat een wet in een stand doet: [{ tekst, goed }], met de getallen van nu. Eerst wat goed is, dan wat het kost.
  T.watDeWetDoet = function (D, id, stand) {
    const d = T.wetDoet(id, stand);
    const regels = [];
    const bevolking = D.bevolking || 0;
    if (d.eten != null && d.eten !== 1) {
      const nu = bevolking * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
      regels.push({ goed: d.eten < 1, tekst: T.t('everyone eats {keer}: {graan} a day instead of {was}', { keer: keer(d.eten), graan: T.hoeveel(getal(nu * d.eten), 'graan'), was: getal(nu) }) });
    }
    if (d.gezinnen != null && d.gezinnen !== 1) {
      const basis = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
      regels.push({ goed: d.gezinnen > 1, tekst: T.t('a new family {vaak}: every {n|day|# days} instead of {basis}', { vaak: vaak(d.gezinnen), n: Math.max(1, Math.round(basis / d.gezinnen)), basis }) });
    }
    if (d.hout != null && d.hout !== 1) {
      const heeft = (D.gebouwen || []).some((g) => T.GEBOUWEN[g.soort].bos);
      regels.push({ goed: d.hout > 1, tekst: heeft ? T.t('a woodcutter cuts {keer} wood', { keer: keer(d.hout) }) : T.t('a woodcutter cuts {keer} wood (there is no woodcutter yet)', { keer: keer(d.hout) }) });
    }
    if (d.goud) regels.push({ goed: true, tekst: T.t('{goud} into the chest every month', { goud: T.hoeveel(getal(T.belastbaar(D) * d.goud), 'goud') }) });
    if (d.tevreden) {
      const pct = Math.round(Math.abs(d.tevreden) * 100);
      regels.push({ goed: d.tevreden > 0, tekst: d.tevreden > 0 ? T.t('{pct}% more content', { pct }) : T.t('{pct}% less content', { pct }) });
    }
    if (d.boete) regels.push({ goed: false, tekst: T.t('at Martinmas the lord charges a fine of {goud} if there was felling that year', { goud: T.hoeveel(d.boete, 'goud') }) });
    return regels.sort((a, b) => b.goed - a.goed);
  };
})(globalThis.Spel = globalThis.Spel || {});
