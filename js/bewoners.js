// De bewoners: wie er in het dorp woont, met wie en in welk huis, en wie waar werkt. Werklijst punt
// 3b, stap 2: mensen worden poppetjes (ontwerp/spel.md, "Mensen worden poppetjes"; Marcel: "Ja, zo",
// 26 sep). Regels zonder scherm, zoals js/dag.js; toetsen in test/bewoners.test.cjs.
//
// Het getal in de balk (S.bevolking) blijft de waarheid: eten, groei, de winter en het hoofdgeld
// rekenen ermee, en het verandert alleen via T.wijzigBevolking (js/gebouwen.js). De bewoners zijn wie
// het zijn: één per mond, elk met een naam, een leeftijd, een huis en een poppetje. Wat hier staat:
//   - wie er bij een nieuw spel woont (T.zetBeginBewoners): op elke boerderij een gezin van vier dat
//     bij het karakter van de boer past, en bij de schout zijn vrouw en drie kinderen (Marcel koos het,
//     26 sep, vraag 27);
//   - wie erbij komt of weggaat als het getal verandert (T.bewonersVolgen, vanuit T.wijzigBevolking):
//     een nieuw gezin in een huis met plaats, of wie sterft of wegtrekt;
//   - wie waar werkt (T.werkendeHanden, T.wijsWerkToe): hoeveel handen een gebouw krijgt, zegt nog
//     steeds T.verdeelHanden (js/gebouwen.js); hier staat wíé dat zijn, en wie werk heeft, houdt het;
//   - de plekken waar iemand heen gaat: zijn deur (T.deurVan), de put, zijn werk, en waar hij is als
//     hij vrij is. Wannéér hij waar is, zegt de dag: T.dagAnker in js/dag.js, voor iedereen;
//   - wie het is, bij de muis (T.overBewonerTekst).
//
// De schout en de vijf boeren stonden er al (de kaart zet ze neer): zij zijn ook bewoners, en hun
// poppetje is het wezen dat er al was. Voor de rest maakt dit bestand een poppetje.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  // Een eerste voorstel van Claude (26 sep).
  T.BEWONERS_INSTELLINGEN = {
    // Hoe snel ze lopen, in tegels per seconde bij 1× (de boeren lopen 1,4 à 1,5).
    snelheidVolwassen: 1.35,
    snelheidKind: 1.6,
    snelheidOud: 1.0,
    // Hoe ver ze rondlopen rond hun plek, in tegels. Het erf staat bij de dag
    // (T.DAG_INSTELLINGEN.erfStraal); een oude en een kleuter blijven dichter bij huis.
    straalBijHuis: 1,
    straalWerk: 2,
    straalPut: 1,
    straalBrink: 3,
    straalHeide: 4,
  };
  const IN = () => T.BEWONERS_INSTELLINGEN;
  const erfStraal = () => (T.DAG_INSTELLINGEN ? T.DAG_INSTELLINGEN.erfStraal : 2);

  // Een leeftijd zegt welk vel iemand draagt (per geslacht), hoe snel hij loopt, en of hij kan werken:
  // `werkt` is de volgorde waarin het dorp hem daarvoor neemt (eerst de volwassenen, dan de
  // jongeren, de kinderen en de ouden); een kleuter werkt niet. Een jongere is een knaap of een meid
  // van twaalf tot zeventien. Er is nog geen eigen vel voor een knaap: hij draagt dat van een jongen.
  T.LEEFTIJDEN = {
    volwassen: { man: 'boer', vrouw: 'boerin', snelheid: 'snelheidVolwassen', werkt: 0 },
    jong: { man: 'jongen', vrouw: 'meisje', snelheid: 'snelheidKind', werkt: 1 },
    kind: { man: 'jongen', vrouw: 'meisje', snelheid: 'snelheidKind', werkt: 2 },
    oud: { man: 'oudeman', vrouw: 'boerin-grijsaard', snelheid: 'snelheidOud', werkt: 3 },
    kleuter: { man: 'kleuter', vrouw: 'kleuter', snelheid: 'snelheidKind', werkt: null },
  };

  // Voornamen, zoals ze in Drenthe klonken (een voorstel van Claude). De namen van de boeren staan in
  // T.MENSEN en in de spelregels. Niemand krijgt een naam die al in het dorp is, zolang er nog een
  // vrije is.
  T.VOORNAMEN = {
    man: [
      'Albert', 'Arend', 'Berend', 'Egbert', 'Evert', 'Folkert', 'Geert', 'Harm', 'Hendrik', 'Hidde',
      'Jakob', 'Jan', 'Johan', 'Lambert', 'Lubbert', 'Luitjen', 'Menno', 'Otto', 'Reinder', 'Roelof',
      'Swier', 'Tamme', 'Tijs', 'Wicher', 'Willem', 'Wolter',
    ],
    vrouw: [
      'Aafke', 'Aleid', 'Anna', 'Diewer', 'Fenna', 'Froukje', 'Geertje', 'Geesje', 'Grietje', 'Hilje',
      'Hille', 'Ida', 'Janna', 'Jeltje', 'Lammechien', 'Margje', 'Marchien', 'Mette', 'Roelfje',
      'Swaantje', 'Tette',
    ],
  };

  // Wie er in een gezin woont naast het hoofd, als [band, leeftijd, geslacht]; de band is wat hij van
  // het hoofd is ("zoon van Klaas"). Het hoofd is de boer (T.MENSEN, met zijn karakter), de schout,
  // of bij een nieuw gezin een man.
  //
  // Op een boerderij woont een gezin van vier (T.GEBOUWEN.boerderij.woonruimte): de boer, zijn vrouw
  // of haar man, en twee uit een van deze gezinnen, geloot. Een knaap is altijd een zoon: hij neemt
  // het werk dat over is, zoals de schapen hoeden (Marcel koos op 26 sep: de herder is een
  // boerenzoon).
  const BOERENGEZINNEN = [
    [['zoon', 'jong', 'man'], ['dochter', 'kind', 'vrouw']],
    [['zoon', 'jong', 'man'], ['moeder', 'oud', 'vrouw']],
    [['zoon', 'jong', 'man'], ['zoon', 'kind', 'man']],
    [['zoon', 'jong', 'man'], ['vader', 'oud', 'man']],
    [['dochter', 'kind', 'vrouw'], ['zoon', 'kleuter', 'man']],
  ];
  // Sommige karakters leggen het gezin vast (T.KARAKTERS in js/mensen.js): de weduwe heeft geen man
  // maar drie kleine kinderen, zoals haar karakter zegt; de oudste woont bij zijn zoon en
  // schoondochter; de nieuwkomer is jong en heeft kleine kinderen.
  const GEZIN_VAN_KARAKTER = {
    weduwe: { partner: false, anderen: [['dochter', 'kind', 'vrouw'], ['zoon', 'kind', 'man'], ['zoon', 'kleuter', 'man']] },
    grijsaard: { hoofd: 'oud', partner: false, anderen: [['zoon', 'volwassen', 'man'], ['schoondochter', 'volwassen', 'vrouw'], ['kleinzoon', 'kind', 'man']] },
    nieuwkomer: { anderen: [['dochter', 'kleuter', 'vrouw'], ['zoon', 'kleuter', 'man']] },
  };
  // Zoveel knapen wonen er ten minste op de boerderijen samen: de weduwe heeft een hand van de buren
  // nodig, en de schaapskooi een herder.
  const KNAPEN_BIJ_BEGIN = 2;
  // Het gezin van de schout: zijn vrouw en drie kinderen (Marcel, 26 sep, vraag 27).
  const SCHOUTSGEZIN = [['vrouw', 'volwassen', 'vrouw'], ['zoon', 'kind', 'man'], ['dochter', 'kind', 'vrouw'], ['zoon', 'kleuter', 'man']];
  // Een nieuw gezin (js/gebouwen.js, T.GEBOUWEN_INSTELLINGEN.gezinGrootte): een man, een vrouw, en de
  // rest kinderen, geloot uit deze.
  const NIEUWE_KINDEREN = [['zoon', 'kind', 'man'], ['dochter', 'kind', 'vrouw'], ['zoon', 'kleuter', 'man'], ['dochter', 'kleuter', 'vrouw']];
  // Wie van een gezin 's ochtends water haalt bij de put: de eerste die er is.
  const WATERHALERS = ['vrouw', 'schoondochter', 'dochter', 'zoon'];

  // ---------------------------------------------------------------------------------------------
  // Wie iemand is
  // ---------------------------------------------------------------------------------------------

  // Een bewoner (S.bewoners.mensen):
  //   { id: 7, naam: 'Geert', geslacht: 'man', leeftijd: 'jong',   // T.LEEFTIJDEN
  //     gezin: 3, hoofd: <het hoofd van zijn gezin, of null>, band: 'zoon',
  //     huis: <gebouw in S.gebouwen>, werk: <gebouw, of null>, wezen: <zijn poppetje>,
  //     haaltWater: true,          // hij gaat 's ochtends naar de put
  //     plek: { put, werk, vrij }, // waar hij heen gaat (zetPlekken hieronder); T.dagAnker kiest
  //     wie: 'boer1',              // alleen een boer: zijn id in T.MENSEN, waar zijn naam vandaan komt
  //     schout: true }             // alleen de schout zelf

  // Hoe hij heet: een boer zoals T.MENSEN (en de spelregels) het zeggen, de schout "de schout".
  const naamVan = (p) => (p.schout ? 'de schout' : p.wie ? T.naamVanMens(p.wie) : p.naam);
  // Hoort hij bij het gezin van de schout?
  const vanSchout = (p) => !!(p.schout || (p.hoofd && p.hoofd.schout));
  // Kan hij werken? Iedereen, behalve de schout zelf en een kleuter. Het gezin van de schout werkt
  // alleen als er niemand anders meer is (T.wijsWerkToe).
  const kanWerken = (p) => !p.schout && !!T.LEEFTIJDEN[p.leeftijd] && T.LEEFTIJDEN[p.leeftijd].werkt != null;

  // De bewoner van een poppetje: een nieuw poppetje draagt hem mee (e.bewoner); de schout en de boeren
  // hebben hun wezen al van de kaart, en die zoeken we op.
  T.bewonerVan = function (S, e) {
    if (!e) return null;
    if (e.bewoner) return e.bewoner;
    return (S && S.bewoners && S.bewoners.mensen.find((p) => p.wezen === e)) || null;
  };

  // ---------------------------------------------------------------------------------------------
  // Plekken: een deur, de put, de brink, en waar iemand werkt
  // ---------------------------------------------------------------------------------------------

  // De rechthoek die een gebouw beslaat: zijn tekening als die groter is (net als T.randVanGebouw in
  // js/verstoppen.js), anders zijn voet.
  function voetVan(g) {
    if (g.voorwerp && g.voorwerp.beslaat) return { x: g.x, y: g.y, b: g.voorwerp.beslaat[0], h: g.voorwerp.beslaat[1] };
    const v = g.voet || (T.gebouwVoet && T.gebouwVoet(g.soort)) || { b: 1, h: 1 };
    return { x: g.x, y: g.y, b: v.b, h: v.h };
  }

  // De begaanbare tegel rond een rechthoek die het dichtst bij `bij` ligt, of null.
  function tegelRond(w, r, bij) {
    let beste = null;
    let afstand = Infinity;
    for (let y = r.y - 1; y <= r.y + r.h; y++) {
      for (let x = r.x - 1; x <= r.x + r.b; x++) {
        const rand = x < r.x || x >= r.x + r.b || y < r.y || y >= r.y + r.h;
        if (!rand || !T.isBegaanbaar(w, x, y)) continue;
        const a = Math.hypot(x - bij.x, y - bij.y);
        if (a < afstand) {
          afstand = a;
          beste = { x, y };
        }
      }
    }
    return beste;
  }

  // De begaanbare tegel die het dichtst bij een punt ligt (het punt zelf als dat kan), of null.
  function tegelBij(w, punt, ver) {
    const cx = Math.round(punt.x);
    const cy = Math.round(punt.y);
    for (let r = 0; r <= (ver || 6); r++) {
      let beste = null;
      let afstand = Infinity;
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) !== r || !T.isBegaanbaar(w, x, y)) continue;
          const a = Math.hypot(x - punt.x, y - punt.y);
          if (a < afstand) {
            afstand = a;
            beste = { x, y };
          }
        }
      }
      if (beste) return beste;
    }
    return null;
  }

  // De deur van een gebouw: de tegel midden voor zijn voorkant, aan de kant van het zuiden, waar ook
  // de boeren en de schout op de kaart voor hun huis staan. Kan dat niet, dan de begaanbare tegel
  // rond zijn voet die daar het dichtst bij ligt.
  T.deurVan = function (w, g) {
    const v = voetVan(g);
    const voor = { x: v.x + Math.floor(v.b / 2), y: v.y + v.h };
    if (!w || T.isBegaanbaar(w, voor.x, voor.y)) return voor;
    return tegelRond(w, v, voor) || voor;
  };

  // De brink: waar de marskramer zijn waar uitstalt en de heer op Sint-Maarten staat
  // (kaarten/<naam>.betekenis.json, "marskramer"). Daar spelen de kinderen, en daar hangt rond wie
  // geen werk heeft.
  T.brinkVan = function (w) {
    const b = w && (w.brink || w.marskramer);
    return b ? { x: b.x, y: b.y } : null;
  };

  // De put het dichtst bij deze tegel, als plek om te staan: een begaanbare tegel ernaast. Een put
  // staat op de kaart als voorwerp (in het gehucht op de brink), of is gebouwd (T.GEBOUWEN.put).
  function putBij(S, w, van) {
    const putten = [];
    for (const v of w.voorwerpen || []) {
      if (v.soort === 'put') putten.push({ x: v.x, y: v.y, b: (v.beslaat || [1, 1])[0], h: (v.beslaat || [1, 1])[1] });
    }
    for (const g of S.gebouwen || []) if (g.soort === 'put' && g.klaar) putten.push(voetVan(g));
    let beste = null;
    let afstand = Infinity;
    for (const r of putten) {
      const a = Math.hypot(r.x + r.b / 2 - van.x, r.y + r.h / 2 - van.y);
      if (a < afstand) {
        afstand = a;
        beste = r;
      }
    }
    const t = beste && tegelRond(w, beste, van);
    return t ? { x: t.x, y: t.y, straal: IN().straalPut } : null;
  }

  // Waar iemand werkt: op de heide bij de schapen (de herder), op het erf van een boerderij, en
  // anders bij de deur van zijn werkplaats. Een eigen plek per soort werk (de houthakker bij de
  // bomen, de visser aan het water) komt later (ontwerp/opmerkingen.md).
  function werkplekVan(S, w, p) {
    const g = p.werk;
    if (!g) return null;
    if (g.soort === 'schaapskooi') {
      const meent = T.meentVan && T.meentVan(w);
      const t = meent && tegelBij(w, { x: meent.x + (meent.b - 1) / 2, y: meent.y + (meent.h - 1) / 2 });
      if (t) return { x: t.x, y: t.y, straal: IN().straalHeide };
    }
    const d = T.deurVan(w, g);
    return { x: d.x, y: d.y, straal: g.soort === 'boerderij' ? erfStraal() : IN().straalWerk };
  }

  // Waar iemand is als hij vrij is, overdag: een kind of een jongere speelt op de brink, en daar hangt
  // ook rond wie volwassen is en geen werk heeft (zo zie je dat er een werkplaats bij moet). Een oude
  // en een kleuter blijven bij huis, en de vrouw van de schout doet zijn huishouden.
  function vrijePlekVan(S, w, p, deur) {
    const bijHuis = { x: deur.x, y: deur.y, straal: IN().straalBijHuis };
    if (p.leeftijd === 'oud' || p.leeftijd === 'kleuter') return bijHuis;
    if (p.leeftijd === 'volwassen' && vanSchout(p)) return { x: deur.x, y: deur.y, straal: erfStraal() };
    const brink = T.brinkVan(w);
    const t = brink && tegelBij(w, brink);
    return t ? { x: t.x, y: t.y, straal: IN().straalBrink } : bijHuis;
  }

  // Zijn plekken opnieuw uitrekenen: bij een nieuw poppetje, en elke dag na het verdelen van het werk
  // (zijn werk kan veranderd zijn). T.dagAnker (js/dag.js) kiest er per deel van de dag een uit.
  function zetPlekken(S, p) {
    const w = S.bewoners && S.bewoners.wereld;
    if (!w || !p.huis || p.schout || p.wie) return;
    const deur = T.deurVan(w, p.huis);
    p.plek = { put: putBij(S, w, deur), werk: werkplekVan(S, w, p), vrij: vrijePlekVan(S, w, p, deur) };
  }

  // ---------------------------------------------------------------------------------------------
  // Gezinnen en poppetjes
  // ---------------------------------------------------------------------------------------------

  // Een naam die nog niet in het dorp is, zolang dat kan.
  function kiesNaam(S, geslacht, r) {
    const lijst = T.VOORNAMEN[geslacht] || T.VOORNAMEN.man;
    const bezet = new Set(S.bewoners.mensen.map(naamVan));
    const vrij = lijst.filter((n) => !bezet.has(n));
    const uit = vrij.length ? vrij : lijst;
    return uit[Math.floor(r() * uit.length)];
  }

  function nieuweBewoner(S, velden) {
    const p = Object.assign({ werk: null, wezen: null, hoofd: null, band: null, haaltWater: false, plek: null }, velden);
    p.id = S.bewoners.volgende++;
    S.bewoners.mensen.push(p);
    return p;
  }

  // De anderen van een gezin bij het hoofd zetten, als [band, leeftijd, geslacht].
  function zetGezin(S, hoofd, anderen, r) {
    const leden = [hoofd];
    for (const [band, leeftijd, geslacht] of anderen) {
      leden.push(nieuweBewoner(S, { naam: kiesNaam(S, geslacht, r), geslacht, leeftijd, band, hoofd, gezin: hoofd.gezin, huis: hoofd.huis }));
    }
    for (const band of WATERHALERS) {
      const p = leden.find((x) => x !== hoofd && x.band === band);
      if (p) {
        p.haaltWater = true;
        break;
      }
    }
    return leden;
  }

  const partnerVan = (hoofd) => (hoofd.geslacht === 'vrouw' ? ['man', 'volwassen', 'man'] : ['vrouw', 'volwassen', 'vrouw']);
  // Het karakter van een boer: het geloote (js/boeren.js), anders zoals hij geschreven is.
  const karakterVan = (boer) => boer.karakter || (T.MENSEN[boer.wie] && T.MENSEN[boer.wie].karakter) || null;

  // Het gezin op een boerderij: de boer (zijn wezen staat al op de kaart), en wie er naar zijn
  // karakter bij woont.
  function gezinVanBoer(S, g, boer, r) {
    const vast = GEZIN_VAN_KARAKTER[karakterVan(boer)] || {};
    const m = T.MENSEN[boer.wie] || {};
    const hoofd = nieuweBewoner(S, { wie: boer.wie, geslacht: m.geslacht || 'man', leeftijd: vast.hoofd || 'volwassen', gezin: S.bewoners.gezinnen++, huis: g, wezen: boer });
    const anderen = [];
    if (vast.partner !== false) anderen.push(partnerVan(hoofd));
    anderen.push(...(vast.anderen || BOERENGEZINNEN[Math.floor(r() * BOERENGEZINNEN.length)]));
    return zetGezin(S, hoofd, anderen, r);
  }

  // Een nieuw gezin van `n` mensen in huis g: een man, een vrouw, en de rest kinderen.
  function nieuwGezin(S, g, n, r) {
    const hoofd = nieuweBewoner(S, { naam: kiesNaam(S, 'man', r), geslacht: 'man', leeftijd: 'volwassen', gezin: S.bewoners.gezinnen++, huis: g });
    const anderen = [];
    if (n >= 2) anderen.push(partnerVan(hoofd));
    const kinderen = NIEUWE_KINDEREN.slice();
    while (anderen.length < n - 1) anderen.push(kinderen.splice(Math.floor(r() * kinderen.length), 1)[0] || ['zoon', 'kind', 'man']);
    return zetGezin(S, hoofd, anderen, r);
  }

  // Het poppetje van een bewoner, bij zijn deur (wie er al staat, schuift een tegel op). De schout
  // en de boeren hebben er al een.
  function maakPoppetje(S, p) {
    const w = S.bewoners.wereld;
    if (p.wezen || !w || !p.huis) return p.wezen;
    const L = T.LEEFTIJDEN[p.leeftijd];
    const deur = T.deurVan(w, p.huis);
    let plek = deur;
    for (let r = 0; r <= 3; r++) {
      const vrij = [];
      for (let y = deur.y - r; y <= deur.y + r; y++) {
        for (let x = deur.x - r; x <= deur.x + r; x++) {
          if (Math.max(Math.abs(x - deur.x), Math.abs(y - deur.y)) === r && T.isBegaanbaar(w, x, y, { wezensBlokkeren: true })) vrij.push({ x, y });
        }
      }
      if (vrij.length) {
        plek = vrij[0];
        break;
      }
    }
    const e = T.maakDorpeling(p.id, plek.x, plek.y, erfStraal());
    // Zijn soort heeft geen vel en geen gesprek: hij draagt het vel van zijn leeftijd (e.vel, zie
    // S.houding in js/sprites.js), en bij de muis staat wie hij is (js/verkennen.js).
    e.soort = 'bewoner';
    e.zaad = null;
    e.vel = L[p.geslacht] || L.man;
    e.naam = p.naam;
    e.snelheid = IN()[L.snelheid];
    e.thuis = { x: deur.x, y: deur.y };
    e.bewoner = p;
    p.wezen = e;
    w.wezens.push(e);
    return e;
  }

  // Een dobbelsteen voor het volgende gezin: uit het zaad van het spel, en elke keer een andere worp.
  function worp(S) {
    const B = S.bewoners;
    B.worpen = (B.worpen || 0) + 1;
    const zaad = ((B.zaad >>> 0) + B.worpen * 7919) >>> 0;
    return T.dobbelsteen ? T.dobbelsteen(zaad) : Math.random;
  }

  // De huizen van het dorp: wat klaar is en mensen een plek geeft, met hoeveel er nog bij kunnen.
  function huizenMetPlaats(S) {
    return (S.gebouwen || [])
      .filter((g) => g.klaar && T.GEBOUWEN[g.soort] && (T.GEBOUWEN[g.soort].woonruimte || 0) > 0)
      .map((g) => ({ g, vrij: T.GEBOUWEN[g.soort].woonruimte - S.bewoners.mensen.filter((p) => p.huis === g).length }));
  }

  // `n` mensen erbij, als gezin: zoveel mogelijk samen in het huis met de meeste plaats.
  function komenErBij(S, n) {
    const r = worp(S);
    const nieuw = [];
    while (n > 0) {
      const huizen = huizenMetPlaats(S).sort((a, b) => b.vrij - a.vrij);
      if (!huizen.length) break;
      const { g, vrij } = huizen[0];
      const k = vrij >= n ? n : Math.max(1, Math.min(n, vrij));
      nieuw.push(...nieuwGezin(S, g, k, r));
      n -= k;
    }
    for (const p of nieuw) {
      maakPoppetje(S, p);
      zetPlekken(S, p);
    }
    return nieuw;
  }

  // Wie het eerst gaat als er `n` minder zijn. Nooit de schout, zijn gezin of een boer zelf: die
  // horen bij het verhaal (de boeren staan op de kaart, met hun akker). Wie sterft (de winter, de
  // honger): de ouden eerst, dan de kleinsten. Wie wegtrekt: eerst een heel gezin dat later kwam (het
  // laatste het eerst), en dan de jongeren van de boerderijen; een man of vrouw laat zijn gezin het
  // laatst achter.
  const STERFTE = { oud: 0, kleuter: 1, kind: 2, jong: 3, volwassen: 4 };
  const VERTREK = { jong: 0, volwassen: 1, kind: 2, kleuter: 3, oud: 4 };
  function wieGaat(S, reden) {
    const kan = S.bewoners.mensen.filter((p) => !p.wie && !vanSchout(p));
    if (reden === 'vertrek') {
      const later = (p) => !(p.hoofd || p).wie; // een gezin dat later kwam: zijn hoofd is geen boer
      const partner = (p) => p.band === 'vrouw' || p.band === 'man';
      return kan.sort((a, b) => (later(b) - later(a)) || (later(a) ? b.gezin - a.gezin : 0) || (partner(a) - partner(b))
        || (VERTREK[a.leeftijd] - VERTREK[b.leeftijd]) || (b.id - a.id));
    }
    return kan.sort((a, b) => (STERFTE[a.leeftijd] - STERFTE[b.leeftijd]) || (b.id - a.id));
  }

  function gaanWeg(S, n, reden) {
    const B = S.bewoners;
    const weg = wieGaat(S, reden).slice(0, n);
    for (const p of weg) {
      B.mensen.splice(B.mensen.indexOf(p), 1);
      const w = B.wereld;
      if (p.wezen && w && w.wezens.includes(p.wezen)) w.wezens.splice(w.wezens.indexOf(p.wezen), 1);
      // Was hij het hoofd van zijn gezin, dan wordt de volgende dat (zijn vrouw, of de oudste).
      const rest = B.mensen.filter((x) => x.hoofd === p);
      if (rest.length) {
        const volgorde = { volwassen: 0, jong: 1, oud: 2, kind: 3, kleuter: 4 };
        const nieuw = rest.slice().sort((a, b) => volgorde[a.leeftijd] - volgorde[b.leeftijd])[0];
        nieuw.hoofd = null;
        nieuw.band = null;
        for (const x of rest) if (x !== nieuw) x.hoofd = nieuw;
      }
    }
    return weg;
  }

  // ---------------------------------------------------------------------------------------------
  // Het begin, en het getal volgen
  // ---------------------------------------------------------------------------------------------

  // Wie er bij een nieuw spel woont (T.beginOpKaart, js/gebied.js, ná het lot van de boeren: hun
  // karakter zegt wie er bij hen woont). Daarna evenveel bewoners als het getal, elk met een poppetje,
  // en meteen het werk verdeeld, zodat de eerste dag niet stil begint.
  T.zetBeginBewoners = function (S) {
    const w = S.wereld;
    if (!w || !S.gebouwen) return;
    const zaad = (((S.lot && S.lot.zaad) || 1) ^ 0x2545f491) >>> 0;
    S.bewoners = { wereld: w, mensen: [], volgende: 1, gezinnen: 1, zaad, worpen: 0 };
    const r = worp(S);
    const boerderijen = [];
    for (const g of S.gebouwen) {
      if (!g.klaar || !(T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].woonruimte > 0)) continue;
      if (g.huis === 'schout' && S.schout) {
        const schout = nieuweBewoner(S, { schout: true, geslacht: 'man', leeftijd: 'volwassen', gezin: S.bewoners.gezinnen++, huis: g, wezen: S.schout });
        zetGezin(S, schout, SCHOUTSGEZIN, r);
        continue;
      }
      const boer = g.huis && w.wezens.find((e) => e.wie === g.huis && !e.dood);
      if (boer) boerderijen.push(gezinVanBoer(S, g, boer, r));
    }
    // Genoeg knapen voor het werk dat over is: wie te weinig heeft, krijgt in een gezin zonder vast
    // karakter een zoon van twaalf in plaats van een kleiner kind.
    let knapen = S.bewoners.mensen.filter((p) => p.leeftijd === 'jong' && p.hoofd && p.hoofd.wie).length;
    for (const leden of boerderijen) {
      if (knapen >= KNAPEN_BIJ_BEGIN) break;
      if (GEZIN_VAN_KARAKTER[karakterVan(leden[0].wezen)]) continue;
      const kind = leden.find((p) => p.leeftijd === 'kind' || p.leeftijd === 'kleuter');
      if (!kind) continue;
      Object.assign(kind, { band: 'zoon', leeftijd: 'jong', geslacht: 'man', naam: kiesNaam(S, 'man', r) });
      knapen++;
    }
    // Evenveel bewoners als het getal: wie er nog bij moet, komt als gezin in een huis met plaats.
    const verschil = (S.bevolking || 0) - S.bewoners.mensen.length;
    if (verschil > 0) komenErBij(S, verschil);
    else if (verschil < 0) gaanWeg(S, -verschil, 'vertrek');
    for (const p of S.bewoners.mensen) maakPoppetje(S, p);
    if (T.verdeelHanden) T.verdeelHanden(S);
    else for (const p of S.bewoners.mensen) zetPlekken(S, p);
  };

  // Het getal veranderde (T.wijzigBevolking, js/gebouwen.js): de bewoners gaan mee. `reden`: 'groei'
  // (een nieuw gezin), 'winter' (wie sterft) of 'vertrek' (wie wegtrekt). Het begin ('begin') regelt
  // T.zetBeginBewoners zelf, zodra de boeren hun karakter hebben.
  T.bewonersVolgen = function (S, verschil, reden) {
    if (!S.bewoners || reden === 'begin') return;
    if (verschil > 0) komenErBij(S, verschil);
    else if (verschil < 0) gaanWeg(S, -verschil, reden);
  };

  // ---------------------------------------------------------------------------------------------
  // Wie waar werkt
  // ---------------------------------------------------------------------------------------------

  // Hoeveel handen het dorp heeft: wie kan werken. Zonder bewoners (een toets die alleen de regels
  // laadt) is dat het hele getal, zoals vóór de poppetjes.
  T.werkendeHanden = function (S) {
    if (!S.bewoners) return S.bevolking || 0;
    return S.bewoners.mensen.filter(kanWerken).length;
  };

  // Hoe goed iemand past op een plek bij gebouw g: hoe lager, hoe liever. De boer op zijn eigen
  // boerderij het eerst (ook de oudste: hij maait zelf). Verder naar leeftijd (T.LEEFTIJDEN: eerst de
  // volwassenen) en wie het dichtstbij woont; wie de werkplaats het liefst heeft
  // (T.GEBOUWEN[soort].liefst: de schaapskooi een knaap) gaat vóór, en het gezin van de schout het
  // laatst.
  function voorkeur(S, p, g, deur) {
    if (p.wie && p.huis === g) return -1e6;
    let s = T.LEEFTIJDEN[p.leeftijd].werkt * 100 + T.afstand(deur(p.huis), deur(g));
    const soort = T.GEBOUWEN[g.soort];
    if (soort && soort.liefst === p.leeftijd) s -= 500;
    if (vanSchout(p)) s += 10000;
    return s;
  }

  // Wie werkt waar: hoeveel handen een gebouw heeft, zei T.verdeelHanden al (g.handen); hier staat wíé
  // dat zijn. Wie werk heeft, houdt het. Eerst werkt een gezin op zijn eigen boerderij (de boer zelf,
  // en wie er volwassen of een knaap is), daarna krijgt een plek zonder hand de vrije hand die het
  // best past (voorkeur hierboven). Vraagt een gebouw minder handen, dan gaat wie het minst past.
  T.wijsWerkToe = function (S) {
    const B = S.bewoners;
    if (!B) return;
    const w = B.wereld;
    const deuren = new Map();
    const deur = (g) => {
      if (!deuren.has(g)) deuren.set(g, T.deurVan(w, g));
      return deuren.get(g);
    };
    const wil = (g) => (g.klaar ? g.handen || 0 : 0);
    const kunnen = B.mensen.filter(kanWerken);
    for (const p of B.mensen) if (p.werk && (!kanWerken(p) || !S.gebouwen.includes(p.werk))) p.werk = null;
    for (const g of S.gebouwen) {
      const hier = kunnen.filter((p) => p.werk === g);
      if (hier.length <= wil(g)) continue;
      hier.sort((a, b) => voorkeur(S, b, g, deur) - voorkeur(S, a, g, deur));
      for (const p of hier.slice(0, hier.length - wil(g))) p.werk = null;
    }
    const vul = (g, wie) => {
      let hier = kunnen.filter((p) => p.werk === g).length;
      while (hier < wil(g)) {
        let beste = null;
        let score = Infinity;
        for (const p of kunnen) {
          if (p.werk || !wie(p)) continue;
          const s = voorkeur(S, p, g, deur);
          if (s < score) {
            score = s;
            beste = p;
          }
        }
        if (!beste) return;
        beste.werk = g;
        hier++;
      }
    };
    // Eerst het eigen gezin: de boer op zijn eigen boerderij, en wie er volwassen of een knaap is.
    for (const g of S.gebouwen) vul(g, (p) => p.huis === g && (p.wie || T.LEEFTIJDEN[p.leeftijd].werkt <= 1));
    for (const g of S.gebouwen) vul(g, () => true);
    for (const p of B.mensen) zetPlekken(S, p);
  };

  // ---------------------------------------------------------------------------------------------
  // Wie het is, bij de muis
  // ---------------------------------------------------------------------------------------------

  function werkTekst(S, p) {
    const g = p.werk;
    if (!g) return p.leeftijd === 'volwassen' && !vanSchout(p) ? 'zonder werk' : '';
    if (g === p.huis) return ''; // wie op zijn eigen boerderij werkt: dat spreekt vanzelf
    if (g.soort === 'schaapskooi') return p.geslacht === 'vrouw' ? 'herderin' : 'herder';
    if (g.soort === 'boerderij') {
      const boer = S.bewoners.mensen.find((x) => x.huis === g && x.wie);
      if (boer) return `helpt op de boerderij van ${naamVan(boer)}`;
    }
    return `werkt bij de ${T.GEBOUWEN[g.soort] ? T.GEBOUWEN[g.soort].naam : g.soort}`;
  }

  // "Geert, zoon van Klaas · herder", "Hilje, vrouw van de schout", "Albert · zonder werk".
  T.overBewonerTekst = function (S, e) {
    const p = T.bewonerVan(S, e);
    if (!p || p.schout || p.wie) return '';
    let wie = naamVan(p);
    if (p.hoofd) wie += `, ${p.band} van ${naamVan(p.hoofd)}`;
    const werk = werkTekst(S, p);
    return werk ? `${wie} · ${werk}` : wie;
  };
})(globalThis.Spel = globalThis.Spel || {});
