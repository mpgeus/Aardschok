// De heer, en Sint-Maarten (ontwerp/spel.md, "Sint-Maarten: de heer int"; werklijst, punt 5).
// Marcel koos op 24 sep: een brief een maand vooraf met wat hij wil; hij vraagt naar wat er te zien
// is; straffen naar het tekort; en drie jaar op rij tekort, of één keer niets, kost je je ambt.
//
//   11 wijnmaand    de brief: T.aanslag rekent uit wat hij wil, en dat ligt dan vast
//   11 slachtmaand  Sint-Maarten: je betaalt wat hij vraagt, of wat je hebt (T.betaalHeer), en het
//                   tekort bepaalt de straf
//
// Regels zonder scherm (test/heer.test.cjs). T.tikHeerDag wordt één keer per dag aangeroepen vanuit
// T.tikGebouwenDag. De brief, de vraag op Sint-Maarten, de keuze voor de schandpaal en het afzetten
// gaan via T.ui (js/hud.js), zacht gekoppeld: zonder scherm betaalt het dorp op Sint-Maarten
// meteen wat het kan, zodat een toets een jaar in één keer kan doorlopen.
(function (T) {
  'use strict';

  // Getallen om bij te stellen, in één blok (CLAUDE.md). Een eerste gok: nog niet gespeeld.
  T.HEER_INSTELLINGEN = {
    brief: { maand: 'wijnmaand', dag: 11 }, // een maand voor Sint-Maarten
    pachtPerAkkertegel: 0.25, // graan: een achtste van wat een akkertegel opbrengt (T.GRAAN_PER_TEGEL)
    wolPerSchaapskooi: 6,
    eierenPerKippenhok: 20, // de pachthoenders, in eieren
    hoofdgeld: 0.3, // goud per mens
    pronkGoud: 0.5, // goud per punt pronk (T.pronkVan: wat een gebouw aan goud kostte, telt)
    handelsDeel: 0.25, // van wat je sinds vorig jaar open aan de marskramer verkocht
    groeiPerJaar: 0.1, // elk jaar vraagt hij zoveel meer: hij raakt eraan gewend
    verhoging: 0.2, // na een klein tekort vraagt hij voortaan zoveel meer
    rente: 1.5, // wat je tekortkwam, staat zo zwaar (in goud) op de volgende brief
    klein: 0.25, // een tekort onder dit deel van wat hij vroeg is klein ...
    groot: 0.6, // ... vanaf dit deel groot; daartussen komen de soldaten
    soldaten: { aantal: 4, dagen: 30, eten: 0.1, stemming: -0.15 }, // eten: graan per soldaat per dag
    schandpaal: { dagen: 20, stemming: -0.15 },
    afzettenNa: 3, // zoveel jaar op rij tekort, en hij zet je af
  };

  // Wat een goed waard is voor de heer (in goud): de gewone prijs van de marskramer (js/handel.js),
  // zodat een tekort in graan en een tekort in goud tegen elkaar op te tellen zijn.
  const WAARDE = { graan: 0.25, wol: 1.5, eieren: 0.3, goud: 1 };
  const waardeVan = (wat) => (T.MARSKRAMER_KOOPT && T.MARSKRAMER_KOOPT[wat] ? T.MARSKRAMER_KOOPT[wat].prijs : WAARDE[wat] || 1);
  const bericht = (tekst, soort) => {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  };

  T.nieuweHeer = function () {
    return {
      aanslag: null, // wat hij dit jaar wil, vanaf de brief tot Sint-Maarten
      briefJaar: null,
      geindJaar: null,
      tekorten: 0, // zoveel jaar op rij tekort
      verhoging: 1, // hoeveel meer hij vraagt na kleine tekorten
      schuld: 0, // wat je tekortkwam, met rente, in goud: het staat op de volgende brief
      handelGezien: 0, // tot hoever hij de open handel al heeft meegeteld
      soldaten: null, // { aantal, tot }
      schandpaal: null, // { vraag: true } zolang jij nog moet aanwijzen wie
      geschandpaald: [], // wie je aanwees, en wanneer: het dorp onthoudt het (punt 9)
      geschiedenis: [], // per jaar: wat hij vroeg, wat je gaf, het tekort en de straf
      afgezet: null,
    };
  };

  // Hoe rijk een gebouw oogt: wat het aan goud kostte telt, plus een half punt omdat het er staat.
  // Een stenen huis (30 goud) oogt veel rijker dan een hut (geen goud).
  T.pronkVan = function (soort) {
    const g = T.GEBOUWEN[soort];
    return g ? 0.5 + 0.25 * ((g.kosten && g.kosten.goud) || 0) : 0;
  };

  // Wat de heer ziet als hij zijn brief schrijft: de gebouwen die af zijn, de akkers, de mensen, en
  // de open handel sinds vorig jaar. Stil verkocht ziet hij niet; de voorraad ook niet (die telt de
  // inner, punt 6).
  T.watDeHeerZiet = function (S) {
    const H = S.heer || T.nieuweHeer();
    const klaar = (S.gebouwen || []).filter((g) => g.klaar);
    const tel = (soort) => klaar.filter((g) => g.soort === soort).length;
    const akkertegels = ((S.wereld && S.wereld.akkers) || []).reduce((som, a) => som + a.b * a.h, 0);
    const open = T.handelTotaal ? T.handelTotaal(S).open : 0;
    return {
      mensen: S.bevolking || 0,
      akkertegels,
      schaapskooien: tel('schaapskooi'),
      kippenhokken: tel('kippenhok'),
      pronk: klaar.reduce((som, g) => som + T.pronkVan(g.soort), 0),
      openHandel: Math.max(0, open - H.handelGezien),
    };
  };

  // Wat hij dit jaar vraagt (jaar 1 is het eerste jaar van het spel). Afgerond naar boven: een heer
  // rekent niet in halve eieren.
  T.aanslag = function (S, jaar) {
    const IN = T.HEER_INSTELLINGEN;
    const H = S.heer || T.nieuweHeer();
    const z = T.watDeHeerZiet(S);
    const keer = (1 + IN.groeiPerJaar * Math.max(0, (jaar || 1) - 1)) * H.verhoging;
    const a = {
      graan: Math.ceil(z.akkertegels * IN.pachtPerAkkertegel * keer),
      wol: Math.ceil(z.schaapskooien * IN.wolPerSchaapskooi * keer),
      eieren: Math.ceil(z.kippenhokken * IN.eierenPerKippenhok * keer),
      goud: Math.ceil((z.mensen * IN.hoofdgeld + z.pronk * IN.pronkGoud + z.openHandel * IN.handelsDeel) * keer + H.schuld),
    };
    for (const wat of Object.keys(a)) if (!a[wat]) delete a[wat];
    return a;
  };

  // Hoeveel dagen het nog is tot de volgende { maand, dag } (maand als naam of als index in
  // T.MAANDEN), vanaf `dag`. 0 als het vandaag is.
  T.dagenTot = function (dag, doel) {
    const maand = typeof doel.maand === 'string' ? T.MAANDEN.findIndex((m) => m.naam === doel.maand) : doel.maand;
    const nu = T.datumVanDag(dag);
    const vandaag = nu.maand * T.DAGEN_PER_MAAND + nu.dagVanMaand - 1;
    const daar = maand * T.DAGEN_PER_MAAND + doel.dag - 1;
    return (daar - vandaag + T.DAGEN_PER_JAAR) % T.DAGEN_PER_JAAR;
  };

  // Het hoeveelste jaar van het spel dit is (1 in het eerste).
  const spelJaar = (dag) => T.datumVanDag(dag).jaar - T.TIJD_START_JAAR + 1;

  // Eén dag: de soldaten eten mee en trekken af, de brief komt, en op Sint-Maarten wordt er geïnd.
  // Alleen in een dorp met mensen (in het oude spel blijft S.bevolking 0).
  T.tikHeerDag = function (S, dag) {
    if (!(S.bevolking > 0) || !T.datumVanDag) return;
    if (!S.heer) S.heer = T.nieuweHeer();
    const H = S.heer;
    const IN = T.HEER_INSTELLINGEN;
    if (H.afgezet) return;
    const d = T.datumVanDag(dag);
    if (H.soldaten) {
      T.wijzigVoorraad(S, 'graan', -H.soldaten.aantal * IN.soldaten.eten);
      if (dag >= H.soldaten.tot) {
        H.soldaten = null;
        bericht('De soldaten trekken af. Ze nemen mee wat los zit.', 'rust');
      }
    }
    if (T.dagenTot(dag, IN.brief) === 0 && H.briefJaar !== d.jaar) {
      H.briefJaar = d.jaar;
      H.aanslag = T.aanslag(S, spelJaar(dag));
      if (T.ui && T.ui.brief) T.ui.brief(T.briefVanDeHeer(S));
    }
    if (d.sintMaarten && H.geindJaar !== d.jaar) {
      H.geindJaar = d.jaar;
      // Wie de brief miste (een sprong in de tijd), krijgt de rekening op de dag zelf.
      if (!H.aanslag || H.briefJaar !== d.jaar) H.aanslag = T.aanslag(S, spelJaar(dag));
      if (T.ui && T.ui.vraag) vraagSintMaarten(S, dag);
      else T.betaalHeer(S, dag);
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Sint-Maarten: betalen, en de straf
  // ---------------------------------------------------------------------------------------------

  // Wat je van de aanslag nu kunt betalen: per goed wat hij vraagt, of wat je hebt.
  T.watJeKuntBetalen = function (S) {
    const a = (S.heer && S.heer.aanslag) || {};
    const uit = {};
    for (const [wat, n] of Object.entries(a)) uit[wat] = Math.min(n, Math.floor(S.voorraad[wat] || 0));
    return uit;
  };

  // Betaal de heer: wat hij vraagt, of wat je hebt. Het tekort (in goud, naar T.MARSKRAMER_KOOPT)
  // bepaalt de straf. Geeft { tekort, straf } terug; straf is null, 'eisen', 'soldaten',
  // 'schandpaal' of 'afgezet'. Bij 'schandpaal' moet de speler nog aanwijzen wie (T.kiesSchandpaal).
  T.betaalHeer = function (S, dag) {
    const H = S.heer;
    const IN = T.HEER_INSTELLINGEN;
    if (!H || !H.aanslag) return null;
    const nu = dag != null ? dag : S.kalender ? Math.floor(S.kalender.dag) : 0;
    const a = H.aanslag;
    const betaald = T.watJeKuntBetalen(S);
    let gevraagd = 0;
    let gegeven = 0;
    for (const [wat, n] of Object.entries(a)) {
      if (betaald[wat] > 0) T.wijzigVoorraad(S, wat, -betaald[wat]);
      gevraagd += n * waardeVan(wat);
      gegeven += betaald[wat] * waardeVan(wat);
    }
    const tekort = gevraagd > 0 ? Math.max(0, 1 - gegeven / gevraagd) : 0;
    H.aanslag = null;
    H.schuld = 0;
    H.handelGezien = T.handelTotaal ? T.handelTotaal(S).open : 0;
    let straf = null;
    if (tekort <= 1e-9) {
      H.tekorten = 0;
      bericht('De heer is tevreden. Voorlopig.', 'goed');
    } else if (gegeven <= 0) {
      straf = 'afgezet';
    } else {
      H.tekorten++;
      H.schuld = (gevraagd - gegeven) * IN.rente;
      if (H.tekorten >= IN.afzettenNa) straf = 'afgezet';
      else if (tekort < IN.klein) {
        straf = 'eisen';
        H.verhoging += IN.verhoging;
        bericht('Er ontbrak wat. De heer vraagt voortaan meer, en wat er ontbrak komt met rente op zijn volgende brief.', 'gevaar');
      } else if (tekort < IN.groot) {
        straf = 'soldaten';
        H.soldaten = { aantal: IN.soldaten.aantal, tot: nu + IN.soldaten.dagen };
        if (T.voegStemmingToe) T.voegStemmingToe(S, { reden: 'soldaten', waarde: IN.soldaten.stemming, tot: nu + IN.soldaten.dagen });
        bericht(`Er ontbrak te veel. De heer stuurt ${IN.soldaten.aantal} soldaten, een maand lang. Ze eten mee, en het dorp morrt.`, 'gevaar');
      } else {
        straf = 'schandpaal';
        H.schandpaal = { vraag: true, dag: nu };
      }
    }
    H.geschiedenis.push({ jaar: T.datumVanDag(nu).jaar, gevraagd: { ...a }, betaald, tekort, straf });
    if (straf === 'afgezet') T.zetAf(S, gegeven <= 0 ? 'niets' : 'tekorten', nu);
    return { tekort, straf, betaald };
  };

  // Wie er aan de schandpaal kan: de boeren met een naam die in het dorp wonen (js/mensen.js), en
  // een keuter zonder land.
  T.schandpaalKandidaten = function (S) {
    const uit = [];
    for (const e of (S.wereld && S.wereld.wezens) || []) {
      if (e.wie && /^boer\d+$/.test(e.wie) && !uit.some((k) => k.wie === e.wie)) uit.push({ wie: e.wie, naam: e.naam });
    }
    uit.push({ wie: 'keuter', naam: 'een keuter zonder land' });
    return uit;
  };

  // Jij wijst aan. Het dorp morrt een tijdje, en het staat opgeschreven (voor de groepen, punt 9).
  T.kiesSchandpaal = function (S, wie) {
    const H = S.heer;
    const IN = T.HEER_INSTELLINGEN;
    if (!H || !H.schandpaal) return { gelukt: false, reden: 'Er hoeft niemand aan de schandpaal.' };
    const k = T.schandpaalKandidaten(S).find((x) => x.wie === wie) || { wie, naam: wie };
    const dag = H.schandpaal.dag;
    H.schandpaal = null;
    H.geschandpaald.push({ wie: k.wie, naam: k.naam, jaar: T.datumVanDag(dag).jaar });
    if (T.voegStemmingToe) T.voegStemmingToe(S, { reden: 'schandpaal', waarde: IN.schandpaal.stemming, tot: dag + IN.schandpaal.dagen });
    bericht(`${T.hoofdletter(k.naam)} staat een dag aan de schandpaal. Het dorp kijkt, en onthoudt wie jou dat liet doen.`, 'gevaar');
    return { gelukt: true };
  };

  // De heer zet je af. Het spel is voorbij (js/hud.js toont het).
  T.zetAf = function (S, reden, dag) {
    S.heer.afgezet = { reden, dag };
    if (T.ui && T.ui.afgezet) T.ui.afgezet(S, T.briefAfgezet(S));
  };

  // ---------------------------------------------------------------------------------------------
  // De brieven: hoogdravend en lachwekkend (ontwerp/spel.md, "Toon: zwarte satire")
  // ---------------------------------------------------------------------------------------------

  const opsomming = (a) => {
    const delen = Object.entries(a).map(([wat, n]) => `${n} ${wat}`);
    return delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || 'niets';
  };

  T.briefVanDeHeer = function (S) {
    const H = S.heer;
    const vorig = H.geschiedenis[H.geschiedenis.length - 1];
    const zin = !vorig
      ? 'Wij hebben vernomen dat het u goed gaat. Dat verheugt Ons zeer.'
      : !vorig.straf
        ? 'Vorig jaar waren Wij tevreden. Daarom vragen Wij nu iets meer; dat begrijpt u.'
        : 'Wij vergeten niet wat er vorig jaar ontbrak. Wij vergeten nooit iets, behalve wat Wij vergeten.';
    const schuld = H.schuld > 0 ? ' Met daarbij wat u Ons schuldig bleef, en wat rente, want Wij zijn geen klooster.' : '';
    return {
      kop: 'Een brief van de heer',
      tekst:
        `Wij, heer van dit gehucht en van alles wat erin groeit, laten Onze schout weten dat Wij op ` +
        `Sint-Maarten, de elfde der slachtmaand, het Onze komen halen: ${opsomming(H.aanslag)}. ` +
        `${zin}${schuld} Wie Ons tekortdoet, doet de Hemel tekort. ` +
        `Gegeven op Ons slot, met Onze eigen hand (die van de klerk).`,
    };
  };

  T.briefAfgezet = function (S) {
    const H = S.heer;
    const niets = H.afgezet && H.afgezet.reden === 'niets';
    return {
      kop: 'U bent afgezet',
      tekst: niets
        ? 'Niets. Op Sint-Maarten gaf u Ons niets. Wij hebben daar lang over nagedacht, wel een middag, en u bent geen schout meer. Uw huis is het Onze, uw ambt is voor Onze neef, en het dorp zal u niet missen, want het dorp is ook het Onze.'
        : `${H.tekorten} jaar op rij ontbrak er wat. Wij zijn geduldig, dat weet iedereen, maar Ons geduld is ook het Onze. U bent geen schout meer. Uw ambt is voor Onze neef; hij kan tellen, dat zegt hij zelf.`,
    };
  };

  // De vraag op Sint-Maarten (js/hud.js, T.ui.vraag): het spel staat stil tot je betaalt.
  function vraagSintMaarten(S, dag) {
    const a = S.heer.aanslag;
    const kan = T.watJeKuntBetalen(S);
    const alles = Object.keys(a).every((wat) => kan[wat] >= a[wat]);
    const iets = Object.values(kan).some((n) => n > 0);
    const heb = Object.fromEntries(Object.entries(kan).filter(([, n]) => n > 0));
    T.ui.vraag({
      sleutel: 'sint-maarten',
      pauze: true,
      kop: 'Sint-Maarten: de heer int',
      tekst:
        `De klerk van de heer staat voor de deur, met een weegschaal en twee knechten. Hij komt halen: ${opsomming(a)}. ` +
        (alles ? 'Het is er allemaal.' : iets ? `Je hebt: ${opsomming(heb)}.` : 'Je hebt niets van wat hij vraagt. Wie niets geeft, is geen schout meer.'),
      keuzes: [
        {
          tekst: alles ? 'Betaal' : iets ? 'Betaal wat er is' : 'Er is niets',
          doe: () => {
            // De vraag wie er aan de schandpaal moet, komt in de rij direct na deze (js/hud.js).
            const r = T.betaalHeer(S, dag);
            if (r && r.straf === 'schandpaal') vraagSchandpaal(S);
            return { gelukt: true };
          },
        },
      ],
    });
  }

  function vraagSchandpaal(S) {
    T.ui.vraag({
      sleutel: 'schandpaal',
      pauze: true,
      kop: 'De heer wil een voorbeeld',
      tekst: 'Er ontbrak veel. De klerk wil dat er iemand een dag aan de schandpaal staat, en jij bent de schout: jij wijst aan wie. Het dorp kijkt mee, en onthoudt het.',
      keuzes: T.schandpaalKandidaten(S).map((k) => ({ tekst: T.hoofdletter(k.naam), doe: () => T.kiesSchandpaal(S, k.wie) })),
    });
  }
})(globalThis.Toren = globalThis.Toren || {});
