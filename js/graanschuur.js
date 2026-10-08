// De graanschuur en de wachters bij het zaaigraan (werklijst vraag 132; Marcel, 8 okt: "bij honger grijpen mensen alles
// aan. Je moet mensen inzetten om het warenhuis te beschermen", "Ja, er moet een graanschuur komen", en over een wachter
// per twintig mensen: "Ja goed idee, anders maken ze geen kans").
//
// Van de oogst tot het zaaien houdt het dorp het zaaigraan apart (T.zaaigraanApart, js/akkers.js), en het eet het pas
// als er niets anders meer is (T.eetVandaag, js/behoeften.js). Tot 8 okt at het het dan gewoon op, en bleven de akkers
// in de lente leeg (de speeltest van de jager die echt jaagt: de oogst zakte van 612 naar 205 en 32). Nu:
//   - het zaaigraan ligt in de graanschuur (T.GEBOUWEN.graanschuur); zonder graanschuur is er niets te bewaken, en eet
//     het dorp het op zoals vroeger;
//   - de eerste dag dat de honger aan het zaaigraan komt, zoekt een boer je: het dorp wil het zaaigraan eten (het
//     voorval `zaaigraanHonger`, js/voorvallen.js en js/gesprekken.js). Je zet er mannen bij (alles, of de helft), of je laat
//     ze eten. Tot je kiest, eet het dorp ervan;
//   - wie bewaakt (de militie eerst, dan de weerbare mannen), staat dag en nacht bij de graanschuur en werkt nergens
//     (`p.wacht`, in kanWerken van js/bewoners.js); er is een wachter per mensenPerWachter mensen nodig, minstens
//     minstensWachters, en met te weinig wachters grijpt het dorp een deel (T.zaaigraanBeschermd);
//   - elke dag dat er honger is terwijl het graan bewaakt wordt, kost vertrouwen; bij het zaaien gaan de wachters naar
//     huis (T.tikGraanschuurDag).
// In het dorp: D.zaaigraan = { bewaakt (het deel van het zaaigraan dat bewaakt wordt, 0 tot 1), wachters [poppetjes],
// gevraagd (de dag waarop het voorval begon: één keer per winter) }.
(function (T) {
  'use strict';

  T.GRAANSCHUUR_INSTELLINGEN = {
    // De spelregel "Zaaigraan" op "Bewaken" (aan), of het dorp eet het bij honger zonder te vragen, zoals voor 8 okt.
    bewaken: true,
    // Een wachter per zoveel mensen, en minstens zoveel.
    mensenPerWachter: 20,
    minstensWachters: 2,
    // Elke dag dat het dorp honger heeft terwijl het zaaigraan bewaakt wordt, zoveel vertrouwen minder.
    vertrouwenPerHongerdag: 1,
    // Zo dicht bij de deur van de graanschuur staan de wachters.
    wachtStraal: 2,
  };
  const IN = () => T.GRAANSCHUUR_INSTELLINGEN;

  const Z = (D) => D.zaaigraan || (D.zaaigraan = { bewaakt: 0, wachters: [], gevraagd: null });

  // De graanschuur van het dorp: de eerste die klaar is, of null.
  T.graanschuurVan = (D) => (D.gebouwen || []).find((g) => g.soort === 'graanschuur' && g.klaar) || null;

  // Hoeveel wachters het zaaigraan vraagt: een per mensenPerWachter mensen, minstens minstensWachters.
  T.wachtersNodig = (D) => Math.max(IN().minstensWachters, Math.ceil((D.bevolking || 0) / IN().mensenPerWachter));

  // Welk deel van het zaaigraan het dorp niet kan pakken (0 tot 1): het deel dat bewaakt wordt, maal hoeveel van de
  // wachters er staan (met te weinig wachters grijpt het dorp een deel).
  T.zaaigraanBeschermd = function (D) {
    const Zg = D.zaaigraan;
    if (!IN().bewaken || !Zg || !(Zg.bewaakt > 0) || !T.graanschuurVan(D)) return 0;
    const staan = Zg.wachters.filter((e) => !e.dood && D.wereld.wezens.includes(e)).length;
    return Zg.bewaakt * Math.min(1, staan / T.wachtersNodig(D));
  };

  // De honger komt aan het zaaigraan (T.eetVandaag, js/behoeften.js): de eerste keer deze winter zoekt een boer je, als
  // er een graanschuur is en het nog niet bewaakt wordt. Geeft of het voorval begon.
  T.zaaigraanInGevaar = function (D, dag) {
    const Zg = Z(D);
    if (!IN().bewaken || Zg.bewaakt > 0 || !T.graanschuurVan(D)) return false;
    if (Zg.gevraagd != null && dag - Zg.gevraagd < T.DAGEN_PER_JAAR / 2) return false;
    const V = D.voorvallen || (D.voorvallen = T.nieuweVoorvallen());
    if ((V.lopend && V.lopend.id === 'zaaigraanHonger') || V.wacht.some((x) => x.id === 'zaaigraanHonger')) return false;
    const mensen = T.wieZegtHet(D, 'zaaigraanHonger', dag);
    if (!mensen) return false;
    Zg.gevraagd = Math.floor(dag);
    if (V.lopend) V.wacht.push({ id: 'zaaigraanHonger', op: Math.floor(dag), wie: mensen.wie, ander: mensen.ander });
    else T.beginVoorval(D, 'zaaigraanHonger', mensen.wie, mensen.ander, dag);
    return true;
  };

  // Wie het zaaigraan bewaakt: de militie (T.militieVan, js/rovers.js), dan de weerbare mannen (T.weerbareMannen,
  // js/bewoners.js), wie nog niet ergens anders moet zijn; zoveel als er nodig zijn. Geeft de bewoners.
  function wachtersVoor(D) {
    const al = new Set();
    const uit = [];
    const neem = (p) => {
      const e = p && p.wezen;
      if (!e || e.dood || al.has(p) || e.opgeroepen || e.moetNaar || p.weg || p.komt) return;
      al.add(p);
      uit.push(p);
    };
    for (const e of T.militieVan(D)) neem(T.bewonerVan(D, e));
    for (const p of T.weerbareMannen(D)) neem(p);
    return uit.slice(0, T.wachtersNodig(D));
  }

  // Het zaaigraan bewaken (het voorval `zaaigraanHonger`, doe.bewaak): `deel` is wat er bewaakt wordt (1 alles, 0.5 de helft;
  // de rest mag het dorp eten). De wachters lopen naar de graanschuur en blijven er staan.
  T.bewaakZaaigraan = function (D, deel) {
    const g = T.graanschuurVan(D);
    if (!g) return [];
    const deur = T.deurVan(D.wereld, g) || { x: g.x, y: g.y };
    const Zg = Z(D);
    laatGaan(D);
    const wie = wachtersVoor(D);
    for (const p of wie) {
      p.wacht = true;
      p.wezen.moetNaar = { x: deur.x, y: deur.y, straal: IN().wachtStraal, wacht: true };
    }
    Zg.bewaakt = deel;
    Zg.wachters = wie.map((p) => p.wezen);
    const tekort = T.wachtersNodig(D) - wie.length;
    T.zeg(D, wie.length
      ? `${T.opsomming(wie.map((p) => T.naamVanBewoner(p)))} ${wie.length === 1 ? 'staat' : 'staan'} bij de graanschuur.${tekort > 0 ? ` Er zijn er ${T.telwoord(tekort)} te weinig: wie honger heeft, pakt een deel.` : ''}`
      : 'Er is niemand om de graanschuur te bewaken.');
    return wie;
  };

  // De wachters gaan naar huis en aan het werk.
  function laatGaan(D) {
    const Zg = Z(D);
    for (const e of Zg.wachters) {
      const p = T.bewonerVan(D, e);
      if (p) delete p.wacht;
      if (e.moetNaar && e.moetNaar.wacht) e.moetNaar = null;
    }
    Zg.wachters = [];
    Zg.bewaakt = 0;
  }

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): is er niets meer apart (het zaaien is begonnen), dan gaan de wachters
  // naar huis; had het dorp vandaag honger terwijl het graan bewaakt werd, dan kost dat vertrouwen; wie er niet meer is,
  // gaat uit de wachters.
  T.tikGraanschuurDag = function (D, dag, honger) {
    const Zg = D.zaaigraan;
    if (!Zg || !(Zg.bewaakt > 0)) return;
    if (!T.graanschuurVan(D) || T.zaaigraanApart(D, dag) <= 0) {
      laatGaan(D);
      if (T.zaaigraanApart(D, dag) <= 0) T.zeg(D, 'Het zaaigraan gaat de grond in: de wachters bij de graanschuur gaan naar huis.', 'goed');
      return;
    }
    Zg.wachters = Zg.wachters.filter((e) => !e.dood && D.wereld.wezens.includes(e));
    if (honger) T.wijzigVertrouwen(D, -IN().vertrouwenPerHongerdag, 'het zaaigraan wordt bewaakt terwijl het dorp honger heeft');
  };
})(globalThis.Spel = globalThis.Spel || {});
