// De ondernemers: wie iets wil beginnen wat niemand mist, uit zichzelf (werklijst vraag 104; Marcel, 3 okt: "Stel er is
// een ondernemende inwoner die wapens wil maken etc", en "104 a b c d ja"). Het laatste deel van vraag 103, b: naast wat
// het dorp mist (js/verzoeken.js), vraagt iemand je soms wat hij zelf wil, en daar zitten de keuzes die het spel anders
// maken dan een bouwspel: ja maakt de een rijk en de ander boos.
//
//   wie      een op de zoveel volwassenen (geen boer, niet van de schout) heeft een onderneming, geloot uit het zaad
//            van het spel en wie hij is (T.ondernemingVan), zoals het karakter van de boeren: elk spel andere
//            ondernemers.
//   wat      T.ONDERNEMINGEN: de wapenmaker (na een aanval van de rovers, of met een smidse), en een tweede herberg (in
//            een dorp met één herberg, vanaf zoveel mensen).
//   ja       het gebouw komt er, hij is er de meester (js/verzoeken.js), en zijn huis is je een tijd dankbaar.
//   nee      zijn huis neemt het je een tijd kwalijk, en na `wegNa` keer nee trekt hij weg, met zijn gezin, en kan als
//            rover terugkomen (js/rovers.js).
// En wat het een ander doet: de herbergierster is boos als er een tweede herberg komt (ze brouwt een tijd niet), en je
// dankbaar als je nee zegt. Ze vechten om de gasten: wie 's avonds gaat, gaat naar de herberg die het dichtst bij zijn
// huis staat (js/herberg.js).
// Wat een huis nadraagt (wrok, dank), staat op het huis (g.stemming) en slijt weg; T.huisStemming geeft het aan de
// tevredenheid van dat huis (T.berekenWensen, js/wensen.js).
//
// De wapens: wie van de militie een wapen heeft, slaat harder (T.slagSchade, js/gevecht.js). Ze zijn niet verboden
// (Marcel, 7 okt: "Het is logisch dat er wapens zijn om de stad te verdedigen. Alleen weerstand tegen de heer is
// inacceptabel"; werklijst vraag 131). Tot dan verzegelde de heer de werkplaats als zijn inner hem zag, en smeedde wie nee
// hoorde stiekem in zijn kelder.
//
// D.verzoeken.eigen: { [id van de bewoner]: { nee (hoe vaak), ja (de dag), dag (van het laatste antwoord) } }
// Op een huis: g.stemming = [{ waarde (procent), dag, dagen, waarom ('wrok' of 'dank'), wie (zijn naam) }]. Op een
// werkplaats: g.weigert = { tot, waarom } (wie er werkt, doet het niet).
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.ONDERNEMERS_INSTELLINGEN = {
    // Zoveel kans heeft een volwassene op een onderneming.
    kans: 0.15,
    // Wie nee hoort, neemt het je kwalijk: zijn huis is zoveel procent minder tevreden, en dat slijt in zoveel dagen weg.
    wrok: 15,
    wrokDagen: 60,
    // Wie ja hoort, is je dankbaar: zijn huis is zoveel procent tevredener, en dat slijt in zoveel dagen weg.
    dank: 10,
    dankDagen: 60,
    // Na zoveel keer nee trekt hij weg.
    wegNa: 2,
    // Wat een eigen verzoek de raadsman waard is, als tevredenheid (js/raadsman.js): het dorp mist het niet.
    nut: 2,
    wapens: {
      // Na een aanval van de rovers wil hij zoveel dagen lang wapens maken; staat er een smidse, dan altijd.
      naAanval: 60,
      // Wie van de militie een wapen heeft, slaat zoveel harder.
      schade: 2,
    },
    herberg: {
      // Een tweede herberg vraagt iemand pas in een dorp met zoveel mensen.
      vanaf: 50,
      // Komt hij er, dan brouwt de herbergierster zoveel dagen niet.
      boosDagen: 60,
    },
  };
  const IN = () => T.ONDERNEMERS_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const naamVan = (p) => T.naamVanBewoner(p);
  const hoofdletter = (s) => T.hoofdletter(s);

  // ---------------------------------------------------------------------------------------------
  // Wie ondernemer is, en wat hij wil
  // ---------------------------------------------------------------------------------------------

  // Wat een ondernemer kan willen. Per onderneming: het gebouw, het voorval (zijn woorden staan onder dezelfde naam in
  // js/gesprekken.js), wanneer hij het vraagt (`wil`, naast de trede: T.magGebouwd), en waarom, als zin. En wat ja en
  // nee verder doen (`ja`, `nee`: naast wat elk eigen verzoek doet, hieronder), en wat het venster daarover zegt
  // (`prijs`: [tekst]).
  T.ONDERNEMINGEN = {
    wapens: {
      soort: 'wapenmaker',
      voorval: 'wapenverzoek',
      wil: (D, dag) => {
        if ((D.gebouwen || []).some((g) => g.soort === 'wapenmaker')) return false;
        return naAanval(D, dag) || heeftSmidse(D);
      },
      waarom: (D, dag) => (naAanval(D, dag)
        ? 'Na de rovers wil niemand nog met een hooivork voor zijn akker staan.'
        : 'De smid maakt hamers en hoefijzers, en de rovers komen terug.'),
    },
    herberg: {
      soort: 'herberg',
      voorval: 'herbergverzoek',
      wil: (D) => {
        const herbergen = (D.gebouwen || []).filter((g) => g.soort === 'herberg');
        return herbergen.length === 1 && herbergen[0].klaar && (D.bevolking || 0) >= IN().herberg.vanaf;
      },
      waarom: (D) => {
        const ver = verVanDeHerberg(D);
        if (ver >= 3) return `${hoofdletter(T.telwoord(ver))} mensen wonen meer dan een uur van de herberg, en komen er zelden.`;
        if (T.herbergDroog(D)) return 'De herberg is droog: de herbergierster brouwt alleen.';
        return 'Eén herberg is te weinig voor een dorp: wie bij haar geen plaats heeft, zit thuis.';
      },
      // Ja: de herbergierster is boos, en brouwt een tijd niet.
      ja: (D) => {
        const g = T.herbergVan(D);
        if (!g) return;
        const naam = herbergierVan(D);
        g.weigert = { tot: dagNu(D) + IN().herberg.boosDagen, waarom: `${naam} is boos op je` };
        T.zeg(D, `${hoofdletter(naam)} hoort het. "Een tweede herberg, schout? Dan brouw jij je bier voortaan zelf maar."`, 'gevaar');
      },
      // Nee: zij is je dankbaar (het vat bier staat in het antwoord, js/gesprekken.js).
      nee: (D) => {
        if (T.herbergVan(D)) T.zeg(D, `${hoofdletter(herbergierVan(D))} hoort het, en zet een vat bier voor het dorp klaar.`, 'goed');
      },
      prijs: (D, L, doe) => {
        if (!T.herbergVan(D)) return [];
        if (doe.bouw) return [`${herbergierVan(D)} is boos, en brouwt ${IN().herberg.boosDagen} dagen niet`];
        if (doe.weiger) return [`${herbergierVan(D)} is je dankbaar`];
        return [];
      },
    },
  };
  const naAanval = (D, dag) => !!(D.rovers && D.rovers.laatsteAanval != null && dag - D.rovers.laatsteAanval <= IN().wapens.naAanval);
  const heeftSmidse = (D) => (D.gebouwen || []).some((g) => g.soort === 'smidse' && g.klaar);

  // Wie de herberg van het begin houdt: wie er woont (de herbergierster), of "de herbergier".
  function herbergierVan(D) {
    const g = T.herbergVan(D);
    const p = g && D.bewoners && D.bewoners.mensen.find((x) => x.huis === g && x.leeftijd === 'volwassen');
    return p ? naamVan(p) : 'de herbergier';
  }

  // Hoeveel volwassenen meer dan een uur van de herberg wonen (T.looptijdVan, js/bewoners.js; dezelfde weg als
  // js/herberg.js onthoudt).
  function verVanDeHerberg(D) {
    const g = T.herbergVan(D);
    const w = D.bewoners && D.bewoners.wereld;
    if (!g || !w) return 0;
    const deur = T.deurVan(w, g);
    return D.bewoners.mensen.filter((p) => p.leeftijd === 'volwassen' && p.huis && p.huis !== g && !p.schout
      && T.looptijdVan(w, p, T.deurVan(w, p.huis), { x: deur.x, y: deur.y, straal: 0 }, 'herberg') > 1).length;
  }

  // Wat hij wil beginnen (een sleutel van T.ONDERNEMINGEN), of null: uit het zaad van het spel en zijn id, zodat elk
  // spel andere ondernemers heeft en een spel ze houdt. Alleen een volwassene die geen boer is en niet bij de schout
  // hoort.
  T.ondernemingVan = function (D, p) {
    if (!p || p.leeftijd !== 'volwassen' || p.wie || p.schout || (p.hoofd && p.hoofd.schout)) return null;
    const r = T.dobbelsteen(((D.lot && D.lot.zaad) || 1) * 101 + p.id * 7919 + 17);
    if (r() >= IN().kans) return null;
    const soorten = Object.keys(T.ONDERNEMINGEN);
    return soorten[Math.floor(r() * soorten.length)];
  };

  // Wat hij onthoudt van wat hij je vroeg: { nee, ja, dag }.
  function eigenVan(D, p) {
    const R = D.verzoeken || (D.verzoeken = T.nieuweVerzoeken());
    const E = R.eigen || (R.eigen = {});
    return E[p.id] || (E[p.id] = { nee: 0, ja: null, dag: null });
  }

  // Wat de ondernemers nu willen vragen, voor js/verzoeken.js: [{ soort, waarom, voor: 'eigen', wil, wie, voorval }],
  // in de volgorde van de bewoners. Wie ja hoorde, heeft zijn werkplaats; wie het niet meer kan vragen (weg, of op
  // reis), vraagt het niet.
  T.eigenVerzoeken = function (D, dag) {
    const uit = [];
    for (const p of (D.bewoners && D.bewoners.mensen) || []) {
      const wil = T.ondernemingVan(D, p);
      const o = wil && T.ONDERNEMINGEN[wil];
      if (!o || p.weg || !T.magGebouwd(D, o.soort) || !o.wil(D, dag, p)) continue;
      if (eigenVan(D, p).ja != null) continue;
      uit.push({ soort: o.soort, waarom: o.waarom(D, dag, p), voor: 'eigen', wil, wie: p, voorval: o.voorval });
    }
    return uit;
  };

  // ---------------------------------------------------------------------------------------------
  // Het antwoord (vanuit js/verzoeken.js)
  // ---------------------------------------------------------------------------------------------

  // Ja: hij is je dankbaar. En wat zijn onderneming verder doet.
  T.eigenToegestaan = function (D, L) {
    const p = L.wie;
    const dag = dagNu(D);
    const E = eigenVan(D, p);
    E.ja = dag;
    E.dag = dag;
    if (p.huis) voegStemmingToe(p.huis, IN().dank, dag, IN().dankDagen, 'dank', naamVan(p));
    const o = T.ONDERNEMINGEN[L.bouw.eigen];
    if (o && o.ja) o.ja(D, L);
  };

  // Wie er met hem wegtrekt: is hij het hoofd van zijn gezin, of de vrouw of man ervan, dan het hele gezin; een zoon of
  // dochter gaat alleen. Een boer blijft (hij trekt nooit weg, js/bewoners.js), en wie weg is (de heervaart) ook.
  function gezinVan(D, p) {
    const hoofd = !p.hoofd ? p : (p.band === 'vrouw' || p.band === 'man') && !p.hoofd.wie ? p.hoofd : null;
    const gezin = hoofd ? [hoofd, ...D.bewoners.mensen.filter((x) => x.hoofd === hoofd)] : [p];
    return gezin.filter((x) => D.bewoners.mensen.includes(x) && !x.wie && !x.schout && !x.weg);
  }

  // Wat een antwoord op zijn verzoek nog meer doet, voor het venster (T.prijsVanKeuze, js/voorvallen.js): nee, en hij
  // neemt het je kwalijk of trekt weg; en wat zijn onderneming erover zegt (de herbergierster). [tekst]
  T.eigenPrijs = function (D, L, doe) {
    const p = L.wie;
    const delen = [];
    if (doe.weiger) {
      const weg = eigenVan(D, p).nee + 1 >= IN().wegNa;
      const gezin = weg ? gezinVan(D, p) : [];
      const zijn = p.geslacht === 'vrouw' ? 'haar' : 'zijn';
      delen.push(!weg ? `${naamVan(p)} neemt het je kwalijk` : gezin.length > 1 ? `${naamVan(p)} trekt weg, met ${zijn} gezin` : `${naamVan(p)} trekt weg`);
    }
    const o = T.ONDERNEMINGEN[L.bouw.eigen];
    if (o && o.prijs) delen.push(...o.prijs(D, L, doe));
    return delen;
  };

  // Nee: hij neemt het je kwalijk, en wat zijn onderneming verder doet (de herbergierster is je dankbaar). Na wegNa keer
  // trekt hij weg (met zijn gezin, gezinVan).
  T.eigenGeweigerd = function (D, L) {
    const p = L.wie;
    const dag = dagNu(D);
    const E = eigenVan(D, p);
    E.nee++;
    E.dag = dag;
    const o = T.ONDERNEMINGEN[L.bouw.eigen];
    if (E.nee >= IN().wegNa) {
      const wie = gezinVan(D, p);
      T.wijzigBevolking(D, -wie.length, 'vertrek', `${naamVan(p)} kreeg ${T.telwoord(E.nee)} keer nee van de schout`, wie);
      T.wijzigVertrouwen(D, T.BAZEN_INSTELLINGEN.wegGetrokken, `${naamVan(p)} trok weg`);
    } else if (p.huis) voegStemmingToe(p.huis, -IN().wrok, dag, IN().wrokDagen, 'wrok', naamVan(p));
    if (o && o.nee) o.nee(D, L);
  };

  // ---------------------------------------------------------------------------------------------
  // Wat een huis nadraagt
  // ---------------------------------------------------------------------------------------------

  function voegStemmingToe(g, waarde, dag, dagen, waarom, wie) {
    (g.stemming || (g.stemming = [])).push({ waarde, dag, dagen, waarom, wie });
  }

  // Wat dit huis nadraagt, als deel van de tevredenheid (0.15 is vijftien procent erbij), op `dag`: wat het je
  // kwalijk neemt of dankbaar is, en dat slijt weg. Voor T.berekenWensen (js/wensen.js).
  T.huisStemming = function (g, dag) {
    let n = 0;
    for (const s of g.stemming || []) n += s.waarde * Math.max(0, 1 - (dag - s.dag) / s.dagen);
    return n / 100;
  };

  // Wat dit huis je nadraagt, in een zin voor het briefje bij het huis (T.huisToestand, js/wensen.js), of null: het
  // laatste dat nog niet weggesleten is.
  T.huisNadraagtTekst = function (g, dag) {
    const s = (g.stemming || []).filter((x) => dag - x.dag < x.dagen).pop();
    if (!s) return null;
    return s.waarom === 'wrok' ? `${hoofdletter(s.wie)} neemt je je nee kwalijk.` : `${hoofdletter(s.wie)} is je dankbaar voor je ja.`;
  };

  // ---------------------------------------------------------------------------------------------
  // Elke dag
  // ---------------------------------------------------------------------------------------------

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, na het werk): wat een huis nadroeg en weggesleten is, gaat weg.
  T.tikOndernemersDag = function (D, dag) {
    for (const g of D.gebouwen || []) {
      if (!g.stemming) continue;
      g.stemming = g.stemming.filter((s) => dag - s.dag < s.dagen);
      if (!g.stemming.length) delete g.stemming;
    }
  };

  // ---------------------------------------------------------------------------------------------
  // De wapens
  // ---------------------------------------------------------------------------------------------

  // Hoeveel wapens er in het dorp zijn: in de schuur, van de wapenmaker.
  T.wapensInHetDorp = function (D) {
    return Math.floor(((D.voorraad && D.voorraad.wapens) || 0) + 1e-9);
  };

  // Bij een aanval (js/rovers.js): zoveel mannen van de militie als er wapens zijn, hebben er een. Geeft hoeveel.
  T.bewapen = function (D, militie) {
    const n = T.wapensInHetDorp(D);
    militie.forEach((e, i) => {
      e.gewapend = i < n;
    });
    return Math.min(n, militie.length);
  };
})(globalThis.Spel = globalThis.Spel || {});
