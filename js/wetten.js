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
//   goud      goud per mens per maand in de kist (de belasting)
// De regels vragen het aan T.wetFactor en T.wetSom (het eten in js/behoeften.js, de belasting hieronder), en het menu
// zegt het met T.watDeWetDoet.
//
// Sinds 15 okt zijn er twee, zoals in Stronghold: het rantsoen en de belasting, de hefboom tussen voorraad of goud en
// de tevredenheid (ronde 3 van het snoeien; Marcel: "Rantsoen en belasting"). Vreemdelingen welkom en kappen in het bos
// van de heer zijn weg (in git). Zo zeggen de kaart in het
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
    belasting: {
      naam: T.t('Tax'),
      trede: 'gehucht',
      uitleg: T.t('Everyone pays a little into the village chest each month.'),
      standen: ['afgeschaft', 'aangenomen'],
      standaard: 'afgeschaft',
      woorden: { aangenomen: T.t('the tax') },
    },
  };


  T.nieuweWetten = () => ({ standen: {}, belastingRest: 0 });

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
  // dorp eet en hoe tevreden het is, vragen de regels elke dag opnieuw.
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

  // Wat alle wetten samen doen, voor één soort: een factor (eten) vermenigvuldigt, een getal
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

  // Elke dag, na het werk (T.tikGebouwenDag, js/gebouwen.js): op de eerste van de maand brengt de belasting goud op.
  // Wat niet een heel goud is, gaat mee naar de volgende maand.
  T.tikWettenDag = function (D, dag) {
    if (!D.wetten) D.wetten = T.nieuweWetten();
    const W = D.wetten;
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

  // Wat een wet in een stand doet: [{ tekst, goed }], met de getallen van nu. Eerst wat goed is, dan wat het kost.
  T.watDeWetDoet = function (D, id, stand) {
    const d = T.wetDoet(id, stand);
    const regels = [];
    const bevolking = D.bevolking || 0;
    if (d.eten != null && d.eten !== 1) {
      const nu = bevolking * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
      regels.push({ goed: d.eten < 1, tekst: T.t('everyone eats {keer}: {graan} a day instead of {was}', { keer: keer(d.eten), graan: T.hoeveel(getal(nu * d.eten), 'graan'), was: getal(nu) }) });
    }
    if (d.goud) regels.push({ goed: true, tekst: T.t('{goud} into the chest every month', { goud: T.hoeveel(getal(T.belastbaar(D) * d.goud), 'goud') }) });
    if (d.tevreden) {
      const pct = Math.round(Math.abs(d.tevreden) * 100);
      regels.push({ goed: d.tevreden > 0, tekst: d.tevreden > 0 ? T.t('{pct}% more content', { pct }) : T.t('{pct}% less content', { pct }) });
    }
    return regels.sort((a, b) => b.goed - a.goed);
  };
})(globalThis.Spel = globalThis.Spel || {});
