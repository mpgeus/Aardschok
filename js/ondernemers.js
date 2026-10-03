// De ondernemers: wie iets wil beginnen wat niemand mist, uit zichzelf (werklijst vraag 104; Marcel, 3 okt: "Stel er is
// een ondernemende inwoner die wapens wil maken etc", en "104 a b c d ja"). Het laatste deel van vraag 103, b: naast wat
// het dorp mist (js/verzoeken.js), vraagt iemand je soms wat hij zelf wil, en daar zitten de keuzes die het spel anders
// maken dan een bouwspel: ja maakt de een rijk en de ander boos.
//
//   wie      een op de zoveel volwassenen (geen boer, niet van de schout) heeft een onderneming, geloot uit het zaad
//            van het spel en wie hij is (T.ondernemingVan), zoals het karakter van de boeren: elk spel andere
//            ondernemers.
//   wat      T.ONDERNEMINGEN: de wapenmaker (na een aanval van de rovers, of met een smidse), en later meer.
//   ja       het gebouw komt er, hij is er de meester (js/verzoeken.js), en zijn huis is je een tijd dankbaar.
//   nee      zijn huis neemt het je een tijd kwalijk; heeft hij een kelder, dan doet de wapenmaker het daar stiekem; en
//            na `wegNa` keer nee trekt hij weg, met zijn gezin, en kan als rover terugkomen (js/rovers.js).
// Wat een huis nadraagt (wrok, dank), staat op het huis (g.stemming) en slijt weg; T.huisStemming geeft het aan de
// tevredenheid van dat huis (T.berekenWensen, js/wensen.js).
//
// De wapens: wie van de militie een wapen heeft, slaat harder (T.slagSchade, js/gevecht.js). Maar wapens zijn verboden:
//   - de inner die een verboden werkplaats ziet (T.innerKijkt, js/inner.js), wordt argwanend (T.innerZietVerboden);
//   - op Sint-Maarten weet de heer het als zijn inner of hijzelf hem zag, of als zijn soldaten het hele dorp doorzoeken
//     (T.heerVindtVerboden, vanuit T.heerStaatErOp in js/heer.js); een werkplaats in een kelder vinden ze alleen als ze
//     die kelder doorzoeken (T.zoekOpPlek, js/verstoppen.js). Dan straft hij (T.verbodenGevonden): hij laat de
//     werkplaats verzegelen, neemt de wapens mee, en zet een boete op de rekening van volgend jaar.
//
// D.verzoeken.eigen: { [id van de bewoner]: { nee (hoe vaak), ja (de dag), dag (van het laatste antwoord) } }
// Op een huis: g.stemming = [{ waarde (procent), dag, dagen, waarom ('wrok' of 'dank'), wie (zijn naam) }]; g.stiekem = { wat: 'wapens', wie (id), sinds,
// wapens }. Op een werkplaats: g.verzegeld = { dag }.
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
      // Stiekem, in zijn kelder: zoveel wapens per dag, van oud ijzer, tot er zoveel liggen.
      stiekemPerDag: 0.25,
      stiekemTot: 10,
      // De inner die een verboden werkplaats ziet: zoveel argwaan erbij.
      argwaanGezien: 0.2,
      // Vindt de heer hem: zoveel goud boete (volgend jaar erbij), en zoveel argwaan.
      boete: 20,
      argwaanGevonden: 0.15,
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
  // js/gesprekken.js), wanneer hij het vraagt (`wil`, naast de trede: T.magGebouwd), en waarom, als zin.
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
  };
  const naAanval = (D, dag) => !!(D.rovers && D.rovers.laatsteAanval != null && dag - D.rovers.laatsteAanval <= IN().wapens.naAanval);
  const heeftSmidse = (D) => (D.gebouwen || []).some((g) => g.soort === 'smidse' && g.klaar);

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

  // Ja: hij is je dankbaar, en wat hij stiekem deed, doet hij nu in het open.
  T.eigenToegestaan = function (D, L) {
    const p = L.wie;
    const dag = dagNu(D);
    const E = eigenVan(D, p);
    E.ja = dag;
    E.dag = dag;
    if (p.huis) {
      voegStemmingToe(p.huis, IN().dank, dag, IN().dankDagen, 'dank', naamVan(p));
      delete p.huis.stiekem;
    }
  };

  // Wie er met hem wegtrekt: is hij het hoofd van zijn gezin, of de vrouw of man ervan, dan het hele gezin; een zoon of
  // dochter gaat alleen. Een boer blijft (hij trekt nooit weg, js/bewoners.js), en wie weg is (de heervaart) ook.
  function gezinVan(D, p) {
    const hoofd = !p.hoofd ? p : (p.band === 'vrouw' || p.band === 'man') && !p.hoofd.wie ? p.hoofd : null;
    const gezin = hoofd ? [hoofd, ...D.bewoners.mensen.filter((x) => x.hoofd === hoofd)] : [p];
    return gezin.filter((x) => D.bewoners.mensen.includes(x) && !x.wie && !x.schout && !x.weg);
  }

  // Wat een antwoord op zijn verzoek nog meer doet, voor het venster (T.prijsVanKeuze, js/voorvallen.js): nee, en hij
  // neemt het je kwalijk of trekt weg; ja op iets verbodens, en de heer mag het niet zien. Wat hij stiekem doet, zegt
  // het niet: dat is de verrassing, zoals een vervolg. [tekst]
  T.eigenPrijs = function (D, L, doe) {
    const p = L.wie;
    const delen = [];
    if (doe.weiger) {
      const weg = eigenVan(D, p).nee + 1 >= IN().wegNa;
      const gezin = weg ? gezinVan(D, p) : [];
      const zijn = p.geslacht === 'vrouw' ? 'haar' : 'zijn';
      delen.push(!weg ? `${naamVan(p)} neemt het je kwalijk` : gezin.length > 1 ? `${naamVan(p)} trekt weg, met ${zijn} gezin` : `${naamVan(p)} trekt weg`);
    }
    if (doe.bouw && T.GEBOUWEN[L.bouw.soort].verdacht) delen.push('verboden: de heer mag het niet zien');
    return delen;
  };

  // Nee: hij neemt het je kwalijk. Na wegNa keer trekt hij weg (met zijn gezin, gezinVan); anders doet de wapenmaker
  // het stiekem, als hij een kelder heeft.
  T.eigenGeweigerd = function (D, L) {
    const p = L.wie;
    const dag = dagNu(D);
    const E = eigenVan(D, p);
    E.nee++;
    E.dag = dag;
    if (E.nee >= IN().wegNa) {
      const wie = gezinVan(D, p);
      T.wijzigBevolking(D, -wie.length, 'vertrek', `${naamVan(p)} kreeg ${T.telwoord(E.nee)} keer nee van de schout`, wie);
      return;
    }
    if (p.huis) voegStemmingToe(p.huis, -IN().wrok, dag, IN().wrokDagen, 'wrok', naamVan(p));
    if (L.bouw.eigen === 'wapens' && p.huis && !p.huis.stiekem && T.verstopPlekVan(D, p.huis)) {
      p.huis.stiekem = { wat: 'wapens', wie: p.id, sinds: dag, wapens: 0 };
      T.zeg(D, `${hoofdletter(naamVan(p))} zegt niets meer. Een paar dagen later hoor je hameren, 's nachts, onder zijn huis.`, 'gevaar');
    }
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

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, na het werk): wie stiekem werkt, maakt wapens in zijn kelder, tot hij
  // er niet meer woont; en wat een huis nadroeg en weggesleten is, gaat weg.
  T.tikOndernemersDag = function (D, dag) {
    for (const g of D.gebouwen || []) {
      if (g.stemming) {
        g.stemming = g.stemming.filter((s) => dag - s.dag < s.dagen);
        if (!g.stemming.length) delete g.stemming;
      }
      if (!g.stiekem) continue;
      const p = D.bewoners && D.bewoners.mensen.find((x) => x.id === g.stiekem.wie);
      if (!p || p.huis !== g) {
        delete g.stiekem;
        continue;
      }
      if (p.weg || T.vrijeDag(D, dag)) continue;
      const W = IN().wapens;
      g.stiekem.wapens = Math.min(W.stiekemTot, (g.stiekem.wapens || 0) + W.stiekemPerDag);
    }
  };

  // ---------------------------------------------------------------------------------------------
  // De wapens
  // ---------------------------------------------------------------------------------------------

  // Hoeveel wapens er in het dorp zijn: in de schuur (van de wapenmaker), en wat stiekem in een kelder ligt.
  T.wapensInHetDorp = function (D) {
    let n = (D.voorraad && D.voorraad.wapens) || 0;
    for (const g of D.gebouwen || []) if (g.stiekem) n += g.stiekem.wapens || 0;
    return Math.floor(n + 1e-9);
  };

  // Bij een aanval (js/rovers.js): zoveel mannen van de militie als er wapens zijn, hebben er een. Geeft hoeveel.
  T.bewapen = function (D, militie) {
    const n = T.wapensInHetDorp(D);
    militie.forEach((e, i) => {
      e.gewapend = i < n;
    });
    return Math.min(n, militie.length);
  };

  // ---------------------------------------------------------------------------------------------
  // Verboden: de inner, de heer en zijn soldaten
  // ---------------------------------------------------------------------------------------------

  const isVerboden = (g) => !!(T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].verdacht);

  // De inner ziet een verboden werkplaats (T.innerKijkt, js/inner.js): hij wordt argwanend, één keer per werkplaats per
  // jaar (wat hij eerder dit jaar zag, staat in zijn rapport).
  T.innerZietVerboden = function (D, g) {
    const r = D.inner && D.inner.rapport;
    if (!isVerboden(g) || (r && r.gezien && r.gezien.has(g))) return;
    T.zetArgwaan(D, IN().wapens.argwaanGezien, `hij zag een ${T.GEBOUWEN[g.soort].naam}`);
    T.zeg(D, `De inner blijft staan bij ${T.metLidwoord(g.soort)}. Hij schrijft lang.`, 'gevaar');
  };

  // Op Sint-Maarten, als de heer op het plein staat (T.heerStaatErOp, js/heer.js): wat hij weet, straft hij. Een
  // verboden werkplaats die zijn inner of hijzelf zag (het rapport), en als zijn soldaten het hele dorp doorzoeken
  // (`heelDorp`), elke. Wat in een kelder gebeurt, vinden de soldaten in die kelder (T.zoekOpPlek, js/verstoppen.js).
  // Geeft wat hij vond, als woorden.
  T.heerVindtVerboden = function (D, heelDorp) {
    const r = D.inner && D.inner.rapport;
    const gevonden = [];
    for (const g of D.gebouwen || []) {
      if (!isVerboden(g) || !g.klaar || g.verzegeld) continue;
      if (heelDorp || (r && r.gezien && r.gezien.has(g))) gevonden.push(T.verbodenGevonden(D, g));
    }
    return gevonden;
  };

  // De heer vond iets verbodens: een verboden werkplaats, of een kelder waar stiekem gesmeed werd. Een werkplaats laat
  // hij verzegelen (T.tikGebouwenDag, js/gebouwen.js: hij staat stil), en de wapens van het dorp neemt hij mee; uit een
  // kelder de wapens die erin liggen. Hij zet een boete op de rekening van volgend jaar (T.heerRekentErbij, js/heer.js),
  // en zijn argwaan stijgt. Geeft wat hij vond, als woorden ("de wapenmaker", "de wapens in de kelder van Geert").
  T.verbodenGevonden = function (D, g) {
    const W = IN().wapens;
    let wat;
    let zin;
    if (g.stiekem) {
      const p = D.bewoners && D.bewoners.mensen.find((x) => x.id === g.stiekem.wie);
      wat = `de wapens in de kelder van ${p ? naamVan(p) : 'een dorpeling'}`;
      zin = `De soldaten nemen ${wat} mee.`;
      delete g.stiekem;
    } else {
      wat = T.metLidwoord(g.soort);
      zin = `De heer laat ${wat} verzegelen, en neemt de wapens mee.`;
      g.verzegeld = { dag: dagNu(D) };
      const wapens = (D.voorraad && D.voorraad.wapens) || 0;
      if (wapens > 0) T.wijzigVoorraad(D, 'wapens', -wapens);
    }
    T.heerRekentErbij(D, W.boete);
    T.zetArgwaan(D, W.argwaanGevonden, 'er werden wapens gemaakt');
    T.zeg(D, `"Wapens, schout? In Mijn dorp?" ${zin} Volgend jaar komt er ${W.boete} goud bij wat hij vraagt.`, 'gevaar');
    if (T.ui && T.ui.toonVoorraad) T.ui.toonVoorraad(D);
    return wat;
  };
})(globalThis.Spel = globalThis.Spel || {});
