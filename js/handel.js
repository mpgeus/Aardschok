// De handel: de marskramer die drie keer per jaar het gehucht aandoet (ontwerp/spel.md, "Handel:
// de marskramer", besloten door Marcel op 24 sep 2026; ontwerp/werklijst.md, punt 4). Twee
// helften, net als js/akkers.js:
//   - de regels, zonder scherm en dus te toetsen (test/handel.test.cjs): wanneer hij komt en weer
//     gaat (T.tikHandelDag), wat hij bij zich heeft, wat iets kost, en kopen en verkopen.
//     T.kanKopen en T.kanVerkopen geven het antwoord waar het scherm en de klik allebei op lezen
//     (CLAUDE.md, "Scherm en klik stellen dezelfde vraag"); T.koop en T.verkoop doen het dan ook.
//   - zijn komen en gaan als poppetje (T.werkMarskramerBij): over de weg binnen, naar zijn plek op
//     het plein, tien dagen daar, en dan weer de weg op.
// Het venster waarin je handelt, staat in js/hud.js (T.ui.openHandel). Je opent het vanuit zijn
// gesprek (js/gesprekken.js, een antwoord met doe: { handel: true }), want je bent de schout, een
// poppetje in het dorp: je loopt naar hem toe.
//
// Alleen waar hij een plek heeft: "marskramer" in kaarten/<naam>.betekenis.json (js/kaart.js).
// Het gehucht heeft die, de kaarten van het oude spel niet; daar blijft dit bestand stil.
(function (T) {
  'use strict';

  // Alle getallen in één blok, om samen met Marcel bij te stellen als hij speelt (net als
  // T.BEHOEFTEN_INSTELLINGEN). Een eerste gok.
  T.HANDEL_INSTELLINGEN = {
    // Drie bezoeken per jaar, en niet in de winter: dan zijn de wegen slecht. Wat je in de winter
    // nodig hebt, koop je dus in wijnmaand. Zolang hij er is, staat zijn `vlag` (en
    // 'marskramerOpBezoek') aan, zodat zijn gesprek weet welk bezoek het is (js/gesprekken.js).
    bezoeken: [
      { maand: 'grasmaand', dag: 5, naam: 'lente', vlag: 'marskramerLente' },
      { maand: 'hooimaand', dag: 5, naam: 'zomer', vlag: 'marskramerZomer' },
      { maand: 'wijnmaand', dag: 5, naam: 'herfst', vlag: 'marskramerHerfst' },
    ],
    // Zo lang staat hij op het plein. De dagen tellen pas vanaf dat hij er staat: de weg in kost op
    // 3× al gauw een week, en dan zou hij in het donker weer vertrekken.
    blijftDagen: 10,
    // Het goud dat hij bij zich heeft om van jou te kopen (wat jij hem betaalt, komt erbij), en
    // hoeveel pakken hij kan meenemen: een zak graan, een baal wol, elk één pak.
    beurs: 40,
    plaats: 12,
    // Wat hij verkoopt: hoeveel hij per bezoek bij zich heeft (één getal, of een per bezoek), en de
    // prijs in goud, per bezoek (lente, zomer, herfst); per stuk, of per pak van `per` stuks. In de
    // herfst wil iedereen het nog vóór de winter. Stenen niet: een marskramer draagt zijn waar op
    // zijn rug. Die komen bij het dorp, met een voerman met een kar (werklijst.md, punt 14).
    // Graan alleen in de lente, als zaaigraan (werklijst vraag 59 en 79; Marcel, 1 okt, vraag 78:
    // "D dat is prima"): wie na een slechte winter niets meer heeft, kan het kopen, en de boeren
    // zaaien het na tot 1 bloeimaand (T.zaaiNa, js/akkers.js). Een pak is tien graan, net als
    // wanneer hij het koopt, en duurder dan hij het in de lente koopt.
    verkoopt: {
      ijzer: { heeft: 12, prijs: [3, 3, 4] },
      zout: { heeft: 15, prijs: [1, 1, 2] },
      graan: { per: 10, heeft: [10, 0, 0], prijs: [5, 5, 5] },
    },
    // Wat hij koopt: per pak van zoveel stuks, voor zoveel goud, per bezoek (lente, zomer,
    // herfst). Graan is in de lente schaars en na de oogst goedkoop: wie het door Sint-Maarten
    // heen houdt, krijgt er in de lente het dubbele voor. Wol is in de zomer goedkoop, want dan is
    // er net geschoren.
    koopt: {
      graan: { per: 10, prijs: [4, 3, 2] },
      wol: { per: 5, prijs: [3, 2, 3] },
      hout: { per: 20, prijs: [1, 1, 2] },
      eieren: { per: 10, prijs: [1, 1, 1] },
      groente: { per: 10, prijs: [1, 1, 1] },
      vis: { per: 5, prijs: [2, 2, 2] },
      vlees: { per: 5, prijs: [2, 2, 2] },
      huiden: { per: 2, prijs: [1, 1, 1] },
    },
  };

  const IN = () => T.HANDEL_INSTELLINGEN;

  // Waar hij kan komen: een wereld met een plek voor hem (js/kaart.js leest "marskramer" uit het
  // betekenisbestand). Zonder die plek (het oude spel, of een toets zonder wereld) gebeurt er niets.
  function magKomen(D) {
    return !!(D.wereld && D.wereld.marskramer);
  }

  // De dag in het jaar (0..359) waarop een bezoek begint, in dezelfde telling als T.datumVanDag.
  function beginInJaar(bezoek) {
    const maand = T.MAANDEN.findIndex((m) => m.naam === bezoek.maand);
    return maand * T.DAGEN_PER_MAAND + (bezoek.dag - 1);
  }

  // Begint er op deze dag een bezoek? Dan welk (de plek in T.HANDEL_INSTELLINGEN.bezoeken),
  // anders null. Puur, dus te toetsen zonder S.
  T.marskramerBegintOp = function (dag) {
    const d = T.datumVanDag(dag);
    const inJaar = d.maand * T.DAGEN_PER_MAAND + (d.dagVanMaand - 1);
    const i = IN().bezoeken.findIndex((b) => beginInJaar(b) === inJaar);
    return i >= 0 ? i : null;
  };

  // Wanneer komt hij weer? Voor een gesprek of een melding: de naam van de maand van het eerstvolgende
  // bezoek na deze dag.
  T.volgendeMarskramer = function (dag) {
    const d = T.datumVanDag(dag);
    const inJaar = d.maand * T.DAGEN_PER_MAAND + (d.dagVanMaand - 1);
    const na = IN().bezoeken.find((b) => beginInJaar(b) > inJaar);
    return (na || IN().bezoeken[0]).maand;
  };

  // Hoeveel hij van iets bij zich heeft als bezoek `i` begint: in stuks, of in pakken als het per pak gaat.
  function heeftBijBezoek(wat, i) {
    const h = IN().verkoopt[wat].heeft;
    return Array.isArray(h) ? h[i] || 0 : h;
  }
  // Wat hij bij dit bezoek te koop heeft (voor het venster, js/hud.js): wat hij die ronde meebracht, ook als het op is.
  T.verkooptNu = (D) => (D.marskramer ? Object.keys(IN().verkoopt).filter((wat) => heeftBijBezoek(wat, D.marskramer.bezoek) > 0) : []);

  // Hij komt: een vers bezoek met een volle mars en een volle beurs. `dag` is de dag dat hij het
  // gehucht in loopt; T.werkMarskramerBij zet de klok pas echt aan als hij op het plein staat.
  T.marskramerKomt = function (D, i, dag) {
    const bezoek = IN().bezoeken[i];
    const heeft = {};
    for (const wat in IN().verkoopt) heeft[wat] = heeftBijBezoek(wat, i);
    D.marskramer = {
      bezoek: i, komtOp: dag, gaatOp: dag + IN().blijftDagen,
      beurs: IN().beurs, plaats: IN().plaats, heeft,
      weg: false, // true zodra hij vertrekt: dan handelt hij niet meer, hij loopt naar de weg
      wezen: null, staat: false, // zijn poppetje, en of hij al op het plein staat
      aankomst: {
        tekst: i === IN().bezoeken.length - 1
          ? 'De marskramer komt over de weg: zijn laatste ronde vóór de winter.'
          : 'De marskramer komt over de weg. Hij blijft een paar dagen op het plein.',
        soort: 'goed',
      },
    };
    if (T.zetVlag) {
      T.zetVlag(D, 'marskramerOpBezoek');
      T.zetVlag(D, bezoek.vlag);
    }
    // Hij komt overdag (js/dag.js, T.bezoekerKomtAan): valt zijn dag 's nachts in, dan zegt het
    // bericht het pas als hij de kaart op loopt (T.werkMarskramerBij). Zonder wereld om in te lopen
    // (een toets) meteen.
    if (!kanLopen(D)) D.marskramer.meteen = true;
    T.bezoekerKomtAan(D, D.marskramer);
  };

  // Kan hij over de weg de kaart op? Dan heeft hij een poppetje (T.werkMarskramerBij).
  function kanLopen(D) {
    return !!(magKomen(D) && T.maakMens && deWeg(D.wereld));
  }

  // Hij gaat, op deze dag: vanaf nu handelt hij niet meer. Heeft hij een poppetje, dan loopt dat
  // eerst de weg op (T.werkMarskramerBij haalt hem daar weg); zonder poppetje is hij meteen weg.
  // De dag komt van T.tikHandelDag en niet van de kalender: springt die vooruit, dan tikken de
  // dagen ertussen één voor één na, en rekent "wanneer komt hij terug" vanaf zijn eigen dag.
  function vertrek(D, dag) {
    const m = D.marskramer;
    m.weg = true;
    T.zetVlag(D, 'marskramerVertrekt');
    if (T.ui && T.ui.sluitHandel) T.ui.sluitHandel(D); // staat het venster open (js/hud.js), dan gaat het dicht
    T.zeg(D, `De marskramer trekt verder. Hij komt terug in ${T.volgendeMarskramer(dag)}.`);
    if (!m.wezen) haalWeg(D);
  }

  // Helemaal weg, ook uit de wereld.
  function haalWeg(D) {
    const m = D.marskramer;
    if (!m) return;
    if (m.wezen && D.wereld) {
      const i = D.wereld.wezens.indexOf(m.wezen);
      if (i >= 0) D.wereld.wezens.splice(i, 1);
    }
    if (T.wisVlag) {
      T.wisVlag(D, 'marskramerOpBezoek');
      T.wisVlag(D, 'marskramerVertrekt');
      for (const b of IN().bezoeken) T.wisVlag(D, b.vlag);
    }
    D.marskramer = null;
  }

  // Eén dag: komt hij vandaag, of is zijn tijd om? Wordt aangeroepen vanuit T.tikGebouwenDag
  // (js/gebouwen.js, stap 0), één keer per verstreken kalenderdag, net als T.tikBehoeftenDag.
  T.tikHandelDag = function (D, dag) {
    if (!magKomen(D)) return;
    const m = D.marskramer;
    // Zolang hij nog over de weg aan komt lopen, telt zijn tijd niet: zie blijftDagen.
    if (m && !m.weg && (!m.wezen || m.staat) && dag >= m.gaatOp) vertrek(D, dag);
    if (!D.marskramer) {
      const i = T.marskramerBegintOp(dag);
      if (i != null) T.marskramerKomt(D, i, dag);
    }
  };

  // Kan er nu gehandeld worden? Alleen als hij er is en nog niet vertrekt.
  T.kanHandelen = function (D) {
    return !!(D.marskramer && !D.marskramer.weg);
  };

  // ---------------------------------------------------------------------------------------------
  // Kopen en verkopen. Allebei geven ze { kan, reden, ... } terug, zodat het venster een knop kan
  // dimmen met precies de reden die een klik zou geven.
  // ---------------------------------------------------------------------------------------------

  // Jij koopt `aantal` van hem: stuks (ijzer, zout), of pakken van `per` stuks (graan in de lente).
  T.kanKopen = function (D, wat, aantal) {
    const m = D.marskramer;
    const waar = IN().verkoopt[wat];
    if (!T.kanHandelen(D)) return { kan: false, reden: 'De marskramer is er niet.' };
    if (!waar) return { kan: false, reden: `Hij heeft geen ${wat} bij zich.` };
    const prijs = waar.prijs[m.bezoek];
    const per = waar.per || 1;
    const heeft = m.heeft[wat] || 0;
    const uit = { prijs, per, kosten: prijs * aantal, stuks: per * aantal, heeft };
    if (aantal > heeft) return { ...uit, kan: false, reden: heeft ? `Hij heeft er nog maar ${heeft * per}.` : 'Het is op.' };
    if ((D.voorraad.goud || 0) < prijs * aantal) return { ...uit, kan: false, reden: `Daar heb je het goud niet voor (${prijs * aantal}).` };
    return { ...uit, kan: true };
  };

  // Het boek van de marskramer: wat hij je sinds Sint-Maarten betaalde, en wat jij hem. Hij vertelt
  // het de inner, en dat is het spoor van goud (Marcel, 25 sep; spel.md, "Marcel koos voor stap
  // 2"; js/inner.js): wie veel verkocht en een lege kist heeft, valt op. Na Sint-Maarten begint het
  // opnieuw (T.innerNaSintMaarten).
  T.nieuwBoekMarskramer = (dag) => ({ sinds: dag || 0, ontvangen: 0, betaald: 0 });
  T.boekMarskramer = (D) => D.boekMarskramer || (D.boekMarskramer = T.nieuwBoekMarskramer(0));

  T.koop = function (D, wat, aantal) {
    const k = T.kanKopen(D, wat, aantal);
    if (!k.kan) return k;
    const m = D.marskramer;
    T.wijzigVoorraad(D, 'goud', -k.kosten);
    T.wijzigVoorraad(D, wat, k.stuks);
    m.heeft[wat] -= aantal;
    m.beurs += k.kosten;
    T.boekMarskramer(D).betaald += k.kosten;
    return k;
  };

  // Jij verkoopt hem `pakken` pakken van iets (een pak is `per` stuks: tien graan, vijf wol).
  T.kanVerkopen = function (D, wat, pakken) {
    const m = D.marskramer;
    const vraag = IN().koopt[wat];
    if (!T.kanHandelen(D)) return { kan: false, reden: 'De marskramer is er niet.' };
    if (!vraag) return { kan: false, reden: `${T.hoofdletter(wat)} koopt hij niet.` };
    const prijs = vraag.prijs[m.bezoek];
    const hebPakken = Math.floor((D.voorraad[wat] || 0) / vraag.per + 1e-9);
    const uit = { prijs, per: vraag.per, opbrengst: prijs * pakken, stuks: vraag.per * pakken };
    if (pakken > hebPakken) return { ...uit, kan: false, reden: `Daar heb je niet genoeg ${wat} voor (${vraag.per * pakken}).` };
    if (pakken > m.plaats) return { ...uit, kan: false, reden: m.plaats ? `Hij kan nog maar ${m.plaats} pak${m.plaats === 1 ? '' : 'ken'} meenemen.` : 'Zijn mars is vol.' };
    if (prijs * pakken > m.beurs) return { ...uit, kan: false, reden: m.beurs ? `Zoveel goud heeft hij niet meer (nog ${m.beurs}).` : 'Zijn beurs is leeg.' };
    return { ...uit, kan: true };
  };

  T.verkoop = function (D, wat, pakken) {
    const k = T.kanVerkopen(D, wat, pakken);
    if (!k.kan) return k;
    const m = D.marskramer;
    T.wijzigVoorraad(D, wat, -k.stuks);
    T.wijzigVoorraad(D, 'goud', k.opbrengst);
    m.beurs -= k.opbrengst;
    m.plaats -= pakken;
    T.boekMarskramer(D).ontvangen += k.opbrengst;
    return k;
  };

  // Is dit de goedkoopste of de duurste keer van het jaar? Voor het venster: 'duur', 'goedkoop' of
  // null, voor wat hij koopt ('koopt') of verkoopt ('verkoopt'), bij het bezoek van nu.
  T.prijsVanHetJaar = function (D, wat, kant) {
    const rij = IN()[kant][wat];
    if (!rij || !D.marskramer) return null;
    const nu = rij.prijs[D.marskramer.bezoek];
    const hoog = Math.max(...rij.prijs);
    const laag = Math.min(...rij.prijs);
    if (hoog === laag) return null;
    if (nu === hoog) return 'duur';
    if (nu === laag) return 'goedkoop';
    return null;
  };

  // ---------------------------------------------------------------------------------------------
  // Zijn komen en gaan in de wereld: elk beeld (js/main.js, werkBij), net als T.werkGebouwenBij.
  // Het lopen zelf doet het gewone dwaalwerk (js/verkennen.js, T.laatDwalen): ligt zijn `thuis`
  // buiten zijn straal, dan zoekt hij er een pad heen.
  // ---------------------------------------------------------------------------------------------

  // Waar hij het gehucht in komt, en waar hij het weer uit gaat: "komt" bij de plek in het
  // betekenisbestand, anders de eerste uitgang van de kaart (de weg de wereld in). De heer komt
  // over dezelfde weg (js/heer.js), dus die vraagt het hier ook.
  function deWeg(w) {
    const p = w.marskramer;
    if (p && p.komt) return p.komt;
    const o = (w.overgangen || [])[0];
    return o ? { x: o.x, y: o.y } : null;
  }
  T.wegInEnUit = (w) => (w ? deWeg(w) : null);

  T.werkMarskramerBij = function (D) {
    const m = D.marskramer;
    const w = D.wereld;
    if (!m || !magKomen(D) || !T.maakMens) return;
    const uitgang = deWeg(w);
    if (!m.wezen) {
      if (m.weg || !uitgang) return;
      // Overdag, vanaf het bezoekuur, met zijn bericht (js/dag.js).
      if (!T.bezoekerKomtAan(D, m)) return;
      const e = T.maakMens('marskramer', uitgang.x, uitgang.y, 1);
      // Zijn thuis is zijn plek op het plein, met een straal van één: daar scharrelt hij bij zijn
      // uitgestalde waar.
      e.thuis = { x: w.marskramer.x, y: w.marskramer.y, straal: 1 };
      w.wezens.push(e);
      m.wezen = e;
      return;
    }
    const e = m.wezen;
    if (!m.staat && !m.weg && T.afstand(e.thuis, { x: e.tx, y: e.ty }) <= 1) {
      // Hij staat er: nu pas beginnen zijn dagen te tellen.
      m.staat = true;
      m.gaatOp = Math.floor(D.kalender ? D.kalender.dag : m.komtOp) + IN().blijftDagen;
    }
    if (m.weg && uitgang) {
      e.thuis = { x: uitgang.x, y: uitgang.y, straal: 0 };
      if (e.tx === uitgang.x && e.ty === uitgang.y && !e.pad.length && !e.onderweg) haalWeg(D);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
