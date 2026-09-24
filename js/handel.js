// De handel: de marskramer die drie keer per jaar het gehucht aandoet (ontwerp/spel.md, "Handel:
// de marskramer", besloten door Marcel op 24 sep 2026; ontwerp/werklijst.md, punt 4). Twee
// helften, net als js/akkers.js:
//   - de regels, zonder scherm en dus te toetsen (test/handel.test.cjs): wanneer hij komt en weer
//     gaat (T.tikHandelDag), wat hij bij zich heeft, wat iets kost, en kopen en verkopen.
//     T.kanKopen en T.kanVerkopen geven het antwoord waar het scherm en de klik allebei op lezen
//     (CLAUDE.md, "Scherm en klik stellen dezelfde vraag"); T.koop en T.verkoop doen het dan ook.
//   - zijn komen en gaan als poppetje (T.werkMarskramerBij): over de weg binnen, naar zijn plek op
//     de brink, tien dagen daar, en dan weer de weg op.
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
    // Zo lang staat hij op de brink. De dagen tellen pas vanaf dat hij er staat: de weg in kost op
    // 3× al gauw een week, en dan zou hij in het donker weer vertrekken.
    blijftDagen: 10,
    // Het goud dat hij bij zich heeft om van jou te kopen (wat jij hem betaalt, komt erbij), en
    // hoeveel pakken hij kan meenemen: een zak graan, een baal wol, elk één pak.
    beurs: 40,
    plaats: 12,
    // Wat hij verkoopt: hoeveel hij per bezoek bij zich heeft, en de prijs per stuk in goud,
    // per bezoek (lente, zomer, herfst). In de herfst wil iedereen het nog vóór de winter.
    // Stenen niet: een marskramer draagt zijn waar op zijn rug. Die komen bij het dorp, met een
    // voerman met een kar (werklijst.md, punt 14).
    verkoopt: {
      ijzer: { heeft: 12, prijs: [3, 3, 4] },
      zout: { heeft: 15, prijs: [1, 1, 2] },
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
  function magKomen(S) {
    return !!(S.wereld && S.wereld.marskramer);
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

  // Hij komt: een vers bezoek met een volle mars en een volle beurs. `dag` is de dag dat hij het
  // gehucht in loopt; T.werkMarskramerBij zet de klok pas echt aan als hij op de brink staat.
  T.marskramerKomt = function (S, i, dag) {
    const bezoek = IN().bezoeken[i];
    const heeft = {};
    for (const wat in IN().verkoopt) heeft[wat] = IN().verkoopt[wat].heeft;
    S.marskramer = {
      bezoek: i, komtOp: dag, gaatOp: dag + IN().blijftDagen,
      beurs: IN().beurs, plaats: IN().plaats, heeft,
      weg: false, // true zodra hij vertrekt: dan handelt hij niet meer, hij loopt naar de weg
      wezen: null, staat: false, // zijn poppetje, en of hij al op de brink staat
    };
    if (T.zetVlag) {
      T.zetVlag(S, 'marskramerOpBezoek');
      T.zetVlag(S, bezoek.vlag);
    }
    if (T.ui && T.ui.bericht) {
      T.ui.bericht(i === IN().bezoeken.length - 1
        ? 'De marskramer komt over de weg: zijn laatste ronde vóór de winter.'
        : 'De marskramer komt over de weg. Hij blijft een paar dagen op de brink.', 'goed');
    }
  };

  // Hij gaat: vanaf nu handelt hij niet meer. Heeft hij een poppetje, dan loopt dat eerst de weg
  // op (T.werkMarskramerBij haalt hem daar weg); zonder poppetje is hij meteen weg.
  function vertrek(S) {
    const m = S.marskramer;
    m.weg = true;
    if (T.zetVlag) T.zetVlag(S, 'marskramerVertrekt');
    if (T.ui && T.ui.sluitHandel && S.modus === 'handel') T.ui.sluitHandel(S);
    if (T.ui && T.ui.bericht) {
      const dag = S.kalender ? Math.floor(S.kalender.dag) : m.gaatOp;
      T.ui.bericht(`De marskramer trekt verder. Hij komt terug in ${T.volgendeMarskramer(dag)}.`);
    }
    if (!m.wezen) haalWeg(S);
  }

  // Helemaal weg, ook uit de wereld.
  function haalWeg(S) {
    const m = S.marskramer;
    if (!m) return;
    if (m.wezen && S.wereld) {
      const i = S.wereld.wezens.indexOf(m.wezen);
      if (i >= 0) S.wereld.wezens.splice(i, 1);
    }
    if (T.wisVlag) {
      T.wisVlag(S, 'marskramerOpBezoek');
      T.wisVlag(S, 'marskramerVertrekt');
      for (const b of IN().bezoeken) T.wisVlag(S, b.vlag);
    }
    S.marskramer = null;
  }

  // Eén dag: komt hij vandaag, of is zijn tijd om? Wordt aangeroepen vanuit T.tikGebouwenDag
  // (js/gebouwen.js, stap 0), één keer per verstreken kalenderdag, net als T.tikBehoeftenDag.
  T.tikHandelDag = function (S, dag) {
    if (!magKomen(S)) return;
    const m = S.marskramer;
    // Zolang hij nog over de weg aan komt lopen, telt zijn tijd niet: zie blijftDagen.
    if (m && !m.weg && (!m.wezen || m.staat) && dag >= m.gaatOp) vertrek(S);
    if (!S.marskramer) {
      const i = T.marskramerBegintOp(dag);
      if (i != null) T.marskramerKomt(S, i, dag);
    }
  };

  // Kan er nu gehandeld worden? Alleen als hij er is en nog niet vertrekt.
  T.kanHandelen = function (S) {
    return !!(S.marskramer && !S.marskramer.weg);
  };

  // ---------------------------------------------------------------------------------------------
  // Kopen en verkopen. Allebei geven ze { kan, reden, ... } terug, zodat het venster een knop kan
  // dimmen met precies de reden die een klik zou geven.
  // ---------------------------------------------------------------------------------------------

  // Jij koopt `aantal` stuks van hem (ijzer, zout).
  T.kanKopen = function (S, wat, aantal) {
    const m = S.marskramer;
    const waar = IN().verkoopt[wat];
    if (!T.kanHandelen(S)) return { kan: false, reden: 'De marskramer is er niet.' };
    if (!waar) return { kan: false, reden: `Hij heeft geen ${wat} bij zich.` };
    const prijs = waar.prijs[m.bezoek];
    const heeft = m.heeft[wat] || 0;
    const uit = { prijs, kosten: prijs * aantal, heeft };
    if (aantal > heeft) return { ...uit, kan: false, reden: heeft ? `Hij heeft er nog maar ${heeft}.` : 'Het is op.' };
    if ((S.voorraad.goud || 0) < prijs * aantal) return { ...uit, kan: false, reden: `Daar heb je het goud niet voor (${prijs * aantal}).` };
    return { ...uit, kan: true };
  };

  T.koop = function (S, wat, aantal) {
    const k = T.kanKopen(S, wat, aantal);
    if (!k.kan) return k;
    const m = S.marskramer;
    T.wijzigVoorraad(S, 'goud', -k.kosten);
    T.wijzigVoorraad(S, wat, aantal);
    m.heeft[wat] -= aantal;
    m.beurs += k.kosten;
    return k;
  };

  // Jij verkoopt hem `pakken` pakken van iets (een pak is `per` stuks: tien graan, vijf wol).
  T.kanVerkopen = function (S, wat, pakken) {
    const m = S.marskramer;
    const vraag = IN().koopt[wat];
    if (!T.kanHandelen(S)) return { kan: false, reden: 'De marskramer is er niet.' };
    if (!vraag) return { kan: false, reden: `${T.hoofdletter(wat)} koopt hij niet.` };
    const prijs = vraag.prijs[m.bezoek];
    const hebPakken = Math.floor((S.voorraad[wat] || 0) / vraag.per + 1e-9);
    const uit = { prijs, per: vraag.per, opbrengst: prijs * pakken, stuks: vraag.per * pakken };
    if (pakken > hebPakken) return { ...uit, kan: false, reden: `Daar heb je niet genoeg ${wat} voor (${vraag.per * pakken}).` };
    if (pakken > m.plaats) return { ...uit, kan: false, reden: m.plaats ? `Hij kan nog maar ${m.plaats} pak${m.plaats === 1 ? '' : 'ken'} meenemen.` : 'Zijn mars is vol.' };
    if (prijs * pakken > m.beurs) return { ...uit, kan: false, reden: m.beurs ? `Zoveel goud heeft hij niet meer (nog ${m.beurs}).` : 'Zijn beurs is leeg.' };
    return { ...uit, kan: true };
  };

  T.verkoop = function (S, wat, pakken) {
    const k = T.kanVerkopen(S, wat, pakken);
    if (!k.kan) return k;
    const m = S.marskramer;
    T.wijzigVoorraad(S, wat, -k.stuks);
    T.wijzigVoorraad(S, 'goud', k.opbrengst);
    m.beurs -= k.opbrengst;
    m.plaats -= pakken;
    return k;
  };

  // Is dit de goedkoopste of de duurste keer van het jaar? Voor het venster: 'duur', 'goedkoop' of
  // null, voor wat hij koopt ('koopt') of verkoopt ('verkoopt'), bij het bezoek van nu.
  T.prijsVanHetJaar = function (S, wat, kant) {
    const rij = IN()[kant][wat];
    if (!rij || !S.marskramer) return null;
    const nu = rij.prijs[S.marskramer.bezoek];
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
  // betekenisbestand, anders de eerste uitgang van de kaart (de weg de wereld in).
  function deWeg(w) {
    const p = w.marskramer;
    if (p.komt) return p.komt;
    const o = (w.overgangen || [])[0];
    return o ? { x: o.x, y: o.y } : null;
  }

  T.werkMarskramerBij = function (S) {
    const m = S.marskramer;
    const w = S.wereld;
    if (!m || !magKomen(S) || !T.maakMens) return;
    const uitgang = deWeg(w);
    if (!m.wezen) {
      if (m.weg || !uitgang) return;
      const e = T.maakMens('marskramer', uitgang.x, uitgang.y, 1);
      // Zijn thuis is zijn plek op de brink, met een straal van één: daar scharrelt hij bij zijn
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
      m.gaatOp = Math.floor(S.kalender ? S.kalender.dag : m.komtOp) + IN().blijftDagen;
    }
    if (m.weg && uitgang) {
      e.thuis = { x: uitgang.x, y: uitgang.y, straal: 0 };
      if (e.tx === uitgang.x && e.ty === uitgang.y && !e.pad.length && !e.onderweg) haalWeg(S);
    }
  };
})(globalThis.Toren = globalThis.Toren || {});
