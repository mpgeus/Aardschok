// De rovers en de militie (stap 4 van de proef "van gehucht tot dorp"; werklijst vraag 55, Marcel, 29 sep: "A, Ja
// en ook 'wilde' rovers. B, ze roven de velden, graan etc ook maken ze soms velden kapot. C, Ja. D, mensen kunnen
// sterven").
//
// Wie wegtrekt (js/bewoners.js), gaat naar het dichtste roverskamp en wordt rover: de jongeren en de volwassenen, met
// hun naam en hun uiterlijk (werklijst vraag 170, stap 6a2, c2; hieronder, bij de roverskampen). En uit dat kamp komt de
// overval (c3; Marcel, 27 okt: "c3 A1 B1 C1, demo mee"): op een dag die je niet ziet aankomen, vertrekken de mannen van
// het kamp dat het dichtst bij je plein ligt en mannen thuis heeft; ze reizen buiten beeld over de wegen (de grove weg,
// js/lopen.js), komen je land op waar hun weg het binnenkomt, en gaan met de buit terug naar hun kamp, waar hij ligt.
//
// Een aanval (D.rovers.aanval) gaat zo: op een uur dat je niet ziet aankomen, vaker in het donker (werklijst vraag 170,
// stap 4; Marcel, 16 okt: D2), komen ze langs hun weg naar een akker, roven er een paar uur, en gaan weg met graan uit de
// voorraad; soms maken ze de akker kapot (wat erop staat, groeit dit jaar niet meer: T.vertrapAkker, js/akkers.js). Is er geen akker, dan komen ze voor de grootste stapel die nog
// buiten ligt, en nemen ze daarvan mee (werklijst R, vraag 185; Marcel, 23 okt: "stapels ja"): wat de dragers nog
// niet binnen hebben, is niet veilig. Een bericht zegt het, met de plek, en de tijd gaat naar 1×
// (T.bezoekerKomtAan, js/dag.js). Er komt niemand vanzelf (werklijst vraag 170, stap 2; Marcel, 15 okt: "Niemand
// vanzelf"): jij stuurt je soldaten (js/kiezen.js), en het gevecht is in real time (js/gevecht.js): een rover slaat wie
// hij tegenkomt, en een dorpeling die hem ziet, vlucht naar het town hall. Wie valt, is dood: een rover is uit zijn
// bende, en wat hij droeg, ligt er (C1), een soldaat of een dorpeling is een mond minder (T.sneuvelt), en valt de
// aanvoerder, dan neemt een ander het over. Wie het overleeft, staat de volgende ochtend weer met al zijn leven op
// (werklijst vraag 11).
//
// In de demo (het level demojaar, levels/demojaar.js) komen ze niet op het rooster, maar één keer, zeker, op een dag uit
// het zaad, overdag, en een bericht zegt het een dag van tevoren (werklijst R, vraag 185; Marcel, 20 okt: "Voor de demo
// wil ik ook een keer een roversaanval; zodat de speler de combat kan proberen en ervaren", en 23 okt: "overdag,
// aankondiging ja"): zo kan de speler zijn wacht klaarzetten. Dat is de aangekondigde overval (T.roversKomen), die een
// trigger van het level begint (js/scenario.js).
//
// Zonder scherm, en dus getoetst (test/rovers.test.cjs).
(function (T) {
  'use strict';

  T.ROVERS_INSTELLINGEN = {
    // Het rooster van de overvallen (c3): per dorp gemiddeld zo vaak per jaar, op een dag tussen de helft en anderhalf keer
    // de tijd ertussen, en niet in de eerste zoveel dagen van een spel. Ze bouwen langzaam op (Marcel, 29 sep, vraag 57;
    // 27 okt: A1): het eerste jaar van je ambt gaan er zoveel man van het kamp op uit, elk jaar daarna zoveel meer, en
    // nooit meer dan zoveel; de rest blijft thuis, en heeft het kamp er minder, dan gaan die.
    overvalPerJaar: 2,
    eersteOvervalNa: 60,
    overvalEerst: 2,
    overvalErbijPerJaar: 1,
    overvalMeest: 4,
    // Waar ze je land op komen (c3, B1): langs hun weg, zodra ze zoveel tegels van hun akker of stapel zijn, of later, als
    // het land daar nog dicht is.
    ingangAfstand: 40,
    // Op welk uur ze komen (vraag 170, stap 4, D2): met deze kans 's nachts (van het slapen tot het opstaan, als de
    // nachtdienst), anders tussen het opstaan en het slapen, en daarbinnen op elk uur even vaak; zo komen ze per uur
    // zo'n drie keer vaker in het donker. Het uur komt uit het zaad (aanvalsUur).
    nachtKans: 0.5,
    // Zo lang roven ze op de akker voor ze weer gaan. Halen ze hun akker of de weg terug niet binnen opUren
    // (ingesloten, of steeds iemand in de weg), dan geven ze het op.
    roofUren: 2,
    opUren: 6,
    // Wat ieder meeneemt, en de kans dat ze de akker kapotmaken.
    graanPerRover: 10,
    kansAkkerKapot: 0.3,
    // Zoveel neemt ieder van een stapel mee (vraag 185), als ze voor een stapel kwamen.
    stapelPerRover: 4,
    // De aangekondigde overval (vraag 185; de demo, T.roversKomen): overdag, van een uur na zonsopgang tot `voorDonker` uur
    // voor zonsondergang, zodat het gevecht in het licht valt. Zoveel uur van tevoren (tot een dag) zegt een bericht dat er
    // rovers gezien zijn, met de plek waar ze zullen komen. Met hoeveel man, en op welke dag, zegt het level.
    aangekondigd: { vooraf: 24, voorDonker: 4 },
    // De roverskampen (werklijst vraag 170, stap 6a2, c1 en c2; waar ze liggen: T.EILAND_INSTELLINGEN.kampen): een kamp
    // begint met zoveel man, en elk jaar van het spel komen er zoveel van buiten bij, tot zoveel (de getallen van het
    // rooster van de overvallen); wie uit een dorp wegtrekt, komt er altijd bij (Marcel, 17 okt: H2). Een tent per zoveel man, zolang het
    // eiland plekken heeft (`tentenMeest`); wie er geen meer heeft, slaapt bij het vuur.
    kampBende: 2,
    kampErbijPerJaar: 1,
    kampMeest: 4,
    manPerTent: 2,
    // Om het vuur staat elke man op zijn eigen plek, tussen zoveel tegels ervan. 's Nachts (van het slapen tot het
    // opstaan, T.dagindeling) slapen ze in hun tent, op één na, die bij het vuur waakt (Marcel, 17 okt: N1); heeft een
    // van hen een vijand, dan komt iedereen naar buiten, en blijft zoveel uur wakker. Is er niemand van een dorp binnen
    // zoveel tegels van het vuur, dan kijken ze niet om zich heen (zoals het wild, T.BEESTEN_INSTELLINGEN.rustVerder).
    rondHetVuur: [2, 3.5],
    wakkerUren: 1,
    rustVerder: 20,
    // Een verslagen kamp (c4): wat er aan buit ligt, nemen je mannen mee als ze tot zoveel tegels bij de hoop komen,
    // ieder hooguit zoveel (alles samen, zoals een rover van een stapel, `stapelPerRover`, maar dan voor de hele buit).
    buitAfstand: 2,
    buitPerMan: 10,
    // De hoop buit naast het vuur (Marcel, 27 okt: "ik wil een grotere buit zien", en "b"): klein tot het eerste getal,
    // middel tot het tweede, daarboven groot (alles samen geteld).
    buitMaten: [20, 60],
    // De palissade om het hol van een level (werklijst K, 2c; Marcel, 27 okt: "1, 2, 3 en 5", "variatie is goed", en
    // "misschien het kamp iets ruimer opzetten": van 7 naar 9 tegels, en de open plek van 12 naar 14): een
    // ring op zoveel tegels van het vuur, met een opening van zoveel tegels waar het paadje binnenkomt; de bomen gaan weg
    // tot zoveel tegels van het vuur (`vrij`, de grotere open plek). Elke paal staat `tussen` tegels van de vorige (dicht
    // tegen elkaar), de eerste `poortRuimte` tegels van een poortpaal, en is een soort met deze kansen (`soorten`; twee
    // gaatjes of twee afgebroken naast elkaar komen niet voor). De tekeningen: gereedschap/pixelart/palissade.cjs.
    // De tenten staan tegen de palissade (Marcel, 27 okt: "B; mag beetje random"): `tentAfstand` tegels van het vuur (van,
    // tot), elk tot `tentSchuif` van de ruimte tussen twee tenten van zijn plek, en niet binnen `tentNietVoor` graden van
    // de kant van de kijker (daar verdwijnt een tent achter de voorwand).
    palissade: {
      straal: 9, opening: 3, vrij: 14, tussen: 0.305, poortRuimte: 0.41,
      soorten: { gewoon: 0.6, nieuw: 0.08, scheef: 0.07, afgebroken: 0.07, gat: 0.06, plank: 0.06, mos: 0.06 },
      tentAfstand: [5.5, 6.5], tentSchuif: 0.2, tentNietVoor: 35,
    },
  };
  const IN = () => T.ROVERS_INSTELLINGEN;

  const uurNu = (D) => (D.kalender ? D.kalender.dag * 24 : 0);
  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  // Een getal 0..1, vast per spel, per dag en per vraag `n`, zodat een speeltest met
  // hetzelfde zaad hetzelfde jaar speelt.
  const lot = (D, dag, n) => T.dobbelsteen(((D.lot && D.lot.zaad) || 1) * 37 + Math.floor(dag) * 7919 + n)();


  // Een dorp met `overvallen: false` (een level, T.nieuwDorp in js/dorp.js) krijgt geen overvallen op het rooster.
  T.nieuweRovers = () => ({ overvalOp: null, aanval: null });

  // Alleen in het gehucht zelf: een dorp dat vanaf niets begon (D.begin, js/begin.js), of een wereld met akkers. Een
  // proefkaart (?kaart=proef) heeft geen rovers.
  const heeftRovers = (D) => !!(D.wereld && (D.begin || T.veldenVan(D).length));

  // ---------------------------------------------------------------------------------------------
  // Wie rover wordt, en wanneer ze komen
  // ---------------------------------------------------------------------------------------------

  // Wie wegtrekt (js/bewoners.js, gaanWeg): een jongere of volwassene gaat naar het roverskamp dat het dichtst bij het
  // plein van zijn dorp ligt, met zijn naam en zijn uiterlijk, ook als het al vol is (Marcel, 17 okt: H2). Hij loopt het
  // dorp uit, en staat dezelfde dag in het kamp (T.werkKampenBij). Geeft het kamp, of null (een kaart zonder kampen).
  // In een level met een rand (js/wereld.js) alleen een kamp dat binnen de rand kan staan; is er geen, dan gaat hij weg.
  T.wordtRover = function (D, p) {
    if (p.leeftijd !== 'jong' && p.leeftijd !== 'volwassen') return null;
    const kampen = kampenBinnen(D.wereld, dagNu(D));
    const plein = T.pleinVan(D);
    if (!kampen.length || !plein) return null;
    const K = kampen.reduce((a, b) => (T.afstand(b, plein) < T.afstand(a, plein) ? b : a));
    const vel = (p.wezen && p.wezen.vel) || T.LEEFTIJDEN[p.leeftijd][p.geslacht] || null;
    K.bende.push({ id: K.geteld++, naam: p.naam, vel, uit: (D.plek && D.plek.naam) || null });
    return K;
  };

  // Hoeveel dagen er tussen twee overvallen zitten, en de eerste keer in een spel.
  const gemiddeldTussen = () => (IN().overvalPerJaar > 0 ? T.DAGEN_PER_JAAR / IN().overvalPerJaar : Infinity);
  const overvalTussen = (D, dag) => Math.max(1, Math.round(gemiddeldTussen() * (0.5 + lot(D, dag, 5))));
  const eersteOverval = (D, dag) => dag + IN().eersteOvervalNa + Math.round(gemiddeldTussen() * lot(D, dag, 6));
  // Op welk uur van deze dag ze komen (D2): met nachtKans 's nachts, van middernacht tot het opstaan of van het slapen
  // tot middernacht (T.dagindeling, js/dag.js), anders tussen het opstaan en het slapen.
  function aanvalsUur(D, dag) {
    const d = T.dagindeling(dag);
    const r = lot(D, dag, 7);
    if (lot(D, dag, 8) >= IN().nachtKans) return d.opstaan + r * (d.slapen - d.opstaan);
    const u = r * (d.opstaan + 24 - d.slapen);
    return u < d.opstaan ? u : d.slapen + (u - d.opstaan);
  }
  // De aangekondigde overval komt overdag (vraag 185): van een uur na zonsopgang tot `voorDonker` uur voor zonsondergang.
  function overdagUur(D, dag) {
    const zon = T.dagindeling(dag).zon;
    const van = zon.op + 1;
    return van + lot(D, dag, 7) * Math.max(0, zon.onder - IN().aangekondigd.voorDonker - van);
  }
  // Met hoeveel man ze op pad gaan: elk jaar van je ambt met een man meer (dag 0 is de dag van je benoeming).
  const overvalAantal = (dag) =>
    Math.min(IN().overvalMeest, IN().overvalEerst + Math.floor(dag / T.DAGEN_PER_JAAR) * IN().overvalErbijPerJaar);

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js): de doden van gisteren worden begraven, wie het overleefde staat
  // weer op met al zijn leven, en er wordt bepaald of er morgen rovers komen: een dag van tevoren, zodat ze op tijd uit
  // hun kamp vertrekken (c3).
  T.tikRoversDag = function (D, dag) {
    if (!heeftRovers(D)) return;
    const R = D.rovers || (D.rovers = T.nieuweRovers());
    begraaf(D);
    if (!R.aanval) genees(D);
    if (R.overvallen === false) return;
    if (R.overvalOp == null) R.overvalOp = eersteOverval(D, dag);
    if (R.aanval) return;
    if (dag + 1 >= R.overvalOp) {
      const op = dag + 1;
      R.aanval = { soort: 'overval', dag: op, fase: 'wacht', aantal: overvalAantal(op), uur: aanvalsUur(D, op) };
      R.overvalOp = op + overvalTussen(D, op);
    }
  };

  // Rovers die komen omdat een scenario het zegt (de trigger `rovers`, js/scenario.js) of het debugvenster: `aantal` man
  // uit het dichtste kamp, over `overUren` uur (0: nu), zoals op het rooster (voor een akker, anders een stapel); heeft
  // het kamp er minder thuis, dan komen er van buiten bij (`aanvullen`). Of `aangekondigd` (de overval van de demo, vraag
  // 185): morgen, overdag, en een bericht vooraf met de plek waar ze komen (meld, hieronder); is er dan nog niets om te
  // roven, dan komen ze een dag later. Of `meteen` (Spel.debug.rovers en de toetsen): nu, zonder reis. Niet als er al een
  // aanval is, of het dorp geen rovers kan hebben. Geeft of het lukte.
  T.roversKomen = function (D, { aantal = 1, overUren = 0, aangekondigd = false, meteen = false } = {}) {
    if (!heeftRovers(D)) return false;
    const R = D.rovers || (D.rovers = T.nieuweRovers());
    if (R.aanval) return false;
    const A = { soort: 'overval', fase: 'wacht', aantal: Math.max(1, aantal), aanvullen: true };
    if (aangekondigd) {
      A.dag = dagNu(D) + 1;
      A.uur = overdagUur(D, A.dag);
      A.aangekondigd = true;
    } else {
      const moment = uurNu(D) + (meteen ? 0 : Math.max(0, overUren));
      A.dag = Math.floor(moment / 24);
      A.uur = moment - A.dag * 24;
      if (meteen) A.meteen = true;
    }
    R.aanval = A;
    return true;
  };

  // Wie in een gevecht viel, ligt er tot de volgende dag: een rover, een man of een dorpeling, en een wolf.
  function begraaf(D) {
    const w = D.wereld;
    for (let i = w.wezens.length - 1; i >= 0; i--) {
      const e = w.wezens[i];
      if (e.dood && (e.rover || e.gesneuveld || e.beest)) w.wezens.splice(i, 1);
    }
  }

  // Na een nacht heeft wie het overleefde weer al zijn leven: de aanvoerder, en de soldaten.
  function genees(D) {
    const wie = [D.aanvoerder, ...(D.bewoners ? D.bewoners.mensen.map((p) => p.wezen) : [])];
    for (const e of wie) if (e && !e.dood && e.maxLeven > 0) e.leven = e.maxLeven;
  }

  // ---------------------------------------------------------------------------------------------
  // De militie: de soldaten van het wachthuis, en de veteranen van de heervaart
  // ---------------------------------------------------------------------------------------------

  // Wie soldaat is (js/soldaten.js; vraag 159), en wie van de heervaart terugkwam (js/heervaart.js; Marcel, 29 sep, vraag
  // 60, B: ook zonder wachthuis), met zijn poppetje. Wie nog weg is, of nog onderweg naar huis, vecht niet mee. Met welk
  // wapen hij vecht, zegt T.slagVan (js/soldaten.js): een veteraan zonder soort met een hooivork.
  T.militieVan = (D) =>
    (D.bewoners ? D.bewoners.mensen : [])
      .filter((p) => (p.soldaat || p.veteraan) && !p.weg && !p.komt && p.wezen && !p.wezen.dood)
      .map((p) => p.wezen);

  // Zijn leven als man van de militie (het leven van een soldaat, T.WEZENS.soldaat, of een veteraan, T.WEZENS.veteraan):
  // { leven, max }. Nieuw in de militie, of intussen veteraan: het leven dat erbij komt, krijgt hij ook. Ook voor zijn
  // briefje (js/kiezen.js), vóór hij ooit vocht.
  T.levenAlsMan = function (e) {
    const s = T.WEZENS[e.bewoner && e.bewoner.veteraan ? 'veteraan' : 'soldaat'];
    if (e.maxLeven === s.leven) return { leven: e.leven, max: s.leven };
    return { leven: (e.maxLeven ? e.leven : 0) + s.leven - (e.maxLeven || 0), max: s.leven };
  };

  // Een man of een dorpeling valt (T.valt, js/gevecht.js): hij is dood, en een mond minder. Het bericht zegt wie het
  // was (T.wijzigBevolking, js/gebouwen.js, met wie het is), en waartegen (`van`: wie de laatste klap gaf).
  T.sneuvelt = function (D, e, van) {
    e.gesneuveld = true;
    const p = T.bewonerVan(D, e); // de eerste aanvoerder draagt zijn bewoner niet mee (js/bewoners.js)
    const man = !!p && !!(p.soldaat || p.veteraan || p.aanvoerder);
    const waarom = van && van.beest ? T.t('The fight with the wolves was hard')
      : man ? T.t('The fight with the robbers was hard') : T.t('The robbers struck in the village');
    if (p) T.wijzigBevolking(D, -1, 'gesneuveld', waarom, [p]);
  };

  // Een rover valt (T.valt, js/gevecht.js): was hij van een roverskamp, dan is hij uit zijn bende; en wat hij van een
  // overval meedroeg (c3, C1), ligt er als een losse stapel (js/kar.js), die de dragers halen als hij in je bereik ligt.
  T.roverVerslagen = function (D, e) {
    const K = T.kampVan(D.wereld, e);
    if (K) K.bende = K.bende.filter((l) => l.id !== e.lid);
    if (K && !K.bende.length && !K.verslagen) kampValt(D, K);
    const ligt = {};
    for (const [wat, n] of Object.entries(e.buit || {})) if (n > 0) ligt[wat] = n;
    if (Object.keys(ligt).length) T.legLosseStapel(e.dorp || D, T.tegelVan(e), ligt);
    delete e.buit;
  };

  // ---------------------------------------------------------------------------------------------
  // Uit het kamp en terug (werklijst vraag 170, c3)
  // ---------------------------------------------------------------------------------------------

  // De kampen van kaart w waar een overval vandaan kan komen, en waar wie wegtrekt heen kan: in een level met een rand
  // (js/wereld.js) alleen een kamp dat erbinnen kan staan.
  // Een verslagen kamp (c4) telt niet meer.
  const kampenBinnen = (w, dag) =>
    kampenVan(w, dag).filter((K) => !K.verslagen && stukkenVanKamp(eilandKampen(w).kampen[K.nr]).every(([sx, sy]) => T.stukBinnenRand(w, sx, sy)));
  // Het kamp met nummer nr op kaart w, of null; en wie van kamp K thuis is (niet op pad).
  const kampNr = (w, nr) => (nr != null && w.kampen ? w.kampen.find((K) => K.nr === nr) || null : null);
  const thuis = (K) => K.bende.filter((l) => !l.opPad);

  // Het kamp waar rovers voor dorp D vandaan komen: het dichtst bij zijn plein, met mannen thuis (of met `elk` ook een
  // zonder: een level of het debugvenster vult het aan), en met een weg naar het dorp. Geeft { K, weg } (de grove weg naar
  // het plein, js/lopen.js), of null.
  function kampVoor(D, elk) {
    const w = D.wereld;
    const plein = T.pleinVan(D);
    if (!plein) return null;
    const kampen = kampenBinnen(w, dagNu(D)).filter((K) => elk || thuis(K).length).sort((a, b) => T.afstand(a, plein) - T.afstand(b, plein));
    for (const K of kampen) {
      const weg = T.groveWeg(w, K, plein);
      if (weg) return { K, weg };
    }
    return null;
  }
  // Hoeveel uur een rover over een weg doet (een lijst punten; het laatste stuk, binnen `ingangAfstand` van het eind, loopt
  // hij op je land): zijn pas (T.WEZENS.rover) op de klok van de wereld.
  function reisUren(weg) {
    const eind = weg[weg.length - 1];
    let tegels = 0;
    for (let i = 1; i < weg.length && T.afstand(weg[i - 1], eind) > IN().ingangAfstand; i++) tegels += Math.hypot(weg[i].x - weg[i - 1].x, weg[i].y - weg[i - 1].y);
    return tegels / T.WEZENS.rover.snelheid / (T.DAG_LENGTE / 24);
  }

  // Uit welk kamp de overval komt, en hoe lang ze onderweg zijn (A.kamp, A.reis in uren): het dichtste met mannen thuis.
  // Geeft false als er geen is.
  function plan(D, A) {
    const k = kampVoor(D, A.aanvullen);
    if (!k) return false;
    A.kamp = k.K.nr;
    A.reis = A.meteen ? 0 : reisUren(k.weg);
    return true;
  }
  // Ze vertrekken, zo dat ze op het uur van de aanval bij je zijn: wie thuis is, tot `aantal` (A1; vult een level of het
  // debugvenster aan, dan komen er van buiten bij). Staat het kamp er, dan lopen ze het paadje af tot de rand van de open
  // plek (werkKampBij), en reizen ze verder buiten beeld. Geeft false als er niemand thuis is.
  function vertrek(D, A) {
    const K = kampNr(D.wereld, A.kamp);
    if (!K) return false;
    if (A.aanvullen) while (thuis(K).length < A.aantal) vanBuiten(K);
    const leden = thuis(K).slice(0, A.aantal);
    if (!leden.length) return false;
    for (const l of leden) l.opPad = { terug: null };
    A.leden = leden.map((l) => l.id);
    A.fase = 'onderweg';
    return true;
  }
  // De mannen van de aanval (A.leden, voor zover ze nog leven) komen bij `bij` de kaart op, met hun naam en hun uiterlijk;
  // wie nog in zijn kamp stond (hij liep het paadje nog af), is daar weg. Geeft of er iemand kwam.
  function opDeKaart(D, A, bij) {
    const w = D.wereld;
    const K = kampNr(w, A.kamp);
    const leden = K ? K.bende.filter((l) => A.leden.includes(l.id)) : [];
    for (let i = w.wezens.length - 1; i >= 0; i--) {
      const e = w.wezens[i];
      if (!e.dorp && e.kamp === A.kamp && A.leden.includes(e.lid)) w.wezens.splice(i, 1);
    }
    A.rovers = leden.map((l) => {
      const e = maakRover(D, K, l, plekBij(w, bij));
      w.wezens.push(e);
      return e;
    });
    return A.rovers.length > 0;
  }

  // Waar ze het land van dorp D op komen (B1): langs hun weg van het kamp, zodra ze `ingangAfstand` tegels van hun doel
  // zijn, of later, als het land daar nog dicht is; op een tegel vanwaar ze er ook echt heen kunnen. Of null.
  function ingangVan(D, A, doel) {
    const w = D.wereld;
    const K = kampNr(w, A.kamp);
    const naar = midden(doel);
    const weg = K && T.groveWeg(w, K, naar);
    for (const p of weg || []) {
      if (T.afstand(p, naar) > IN().ingangAfstand) continue;
      const t = begaanbaarBij(w, p);
      if (t && T.zoekRoute(w, t, naar, { naast: true })) return t;
    }
    return null;
  }
  // De begaanbare tegel die het dichtst bij p ligt, binnen een vak van de grove weg; of null (dicht land, water).
  function begaanbaarBij(w, p) {
    for (let r = 0; r <= 4; r++) {
      for (let y = p.y - r; y <= p.y + r; y++) {
        for (let x = p.x - r; x <= p.x + r; x++) {
          if (Math.max(Math.abs(x - p.x), Math.abs(y - p.y)) === r && T.isBegaanbaar(w, x, y, {})) return { x, y };
        }
      }
    }
    return null;
  }

  // Het hol van een level (werklijst K, 2c; Marcel, 27 okt: "A1"; levels/rovershol.js, dorpen[].hol): het kamp dat het
  // dichtst bij dorp D ligt (binnen de rand) wordt zijn hol, met zoveel man (`bende`; wie er niet is, komt van buiten),
  // deze buit (`buit`), en een palissade (`palissade`, zetPalissade). D.hol is zijn nummer (de voorwaarde `hol`,
  // js/scenario.js). Bij het begin van het spel (T.beginOpEiland, js/begin.js). Geeft het kamp, of null.
  T.maakHol = function (D, o = {}) {
    const w = D.wereld;
    const v = D.plek && D.plek.vak;
    const bij = T.pleinVan(D) || (v ? { x: v.x + Math.floor(v.b / 2), y: v.y + Math.floor(v.h / 2) } : null);
    const kampen = bij ? kampenBinnen(w, dagNu(D)).sort((a, b) => T.afstand(a, bij) - T.afstand(b, bij)) : [];
    const K = kampen[0];
    if (!K) return null;
    while (K.bende.length < (o.bende || 0)) vanBuiten(K);
    K.buit = { ...(o.buit || {}) };
    if (o.palissade) K.palissade = true;
    D.hol = K.nr;
    return K;
  };
  // Hoe het hol van dorp D ervoor staat: 'staat', 'verslagen', of null als het geen hol heeft.
  T.holStand = function (D) {
    const K = D.hol != null ? kampNr(D.wereld, D.hol) : null;
    return K ? (K.verslagen ? 'verslagen' : 'staat') : null;
  };

  // De bode (js/bode.js): het kamp waar de rovers vandaan komen die hem onderweg kunnen aanhouden, het dichtste met mannen
  // thuis, of null: dan zijn er geen rovers onderweg. Valt er buiten beeld een (T.roverValtOnderweg), dan is hij uit zijn
  // bende; en wat ze hem afnemen, gaat naar hun kamp (T.buitNaarKamp).
  T.kampVoorDeBode = (D) => {
    const k = kampVoor(D);
    return k ? k.K.nr : null;
  };
  T.roverValtOnderweg = function (D, nr) {
    const K = kampNr(D.wereld, nr);
    const lid = K && thuis(K)[0];
    if (lid) K.bende = K.bende.filter((l) => l !== lid);
  };
  T.buitNaarKamp = function (D, nr, buit) {
    const K = kampNr(D.wereld, nr);
    if (K) legBij(K, buit);
  };
  // Buit erbij in kamp K (K.buit, { wat: hoeveel }).
  function legBij(K, buit) {
    for (const [wat, n] of Object.entries(buit || {})) if (n > 0) K.buit[wat] = (K.buit[wat] || 0) + n;
  }

  // ---------------------------------------------------------------------------------------------
  // Een aanval
  // ---------------------------------------------------------------------------------------------

  // Een vrije tegel bij (x, y), voor de i-de rover: zo komen ze naast elkaar de kaart op.
  function plekBij(w, bij) {
    for (let r = 0; r <= 4; r++) {
      for (let y = bij.y - r; y <= bij.y + r; y++) {
        for (let x = bij.x - r; x <= bij.x + r; x++) {
          if (Math.max(Math.abs(x - bij.x), Math.abs(y - bij.y)) !== r) continue;
          if (T.isBegaanbaar(w, x, y, { wezensBlokkeren: true })) return { x, y };
        }
      }
    }
    return bij;
  }

  // Een man van kamp K (lid, uit zijn bende) op plek; op een overval hoort hij bij het dorp dat hij overvalt (D), thuis bij
  // geen dorp (D null; zetMan, bij de roverskampen).
  function maakRover(D, K, lid, plek) {
    const e = T.maakWezen('rover', plek.x, plek.y);
    e.rover = true;
    if (D) e.dorp = D; // de rovers van een overval op dit dorp (T.hoortBij, js/wereld.js)
    e.vel = lid.vel || T.LEEFTIJDEN.volwassen.man;
    e.kamp = K.nr;
    e.lid = lid.id;
    return e;
  }

  // Waar een overval op afkomt: een akker (geen weide of braak), en is er geen, de grootste stapel (vraag 185); en waar
  // ze de kaart op komen. A.veld is het nummer van de akker onder de velden van het dorp (T.veldenVan, js/boerderij.js),
  // A.stapel het gebouw met de stapel, en A.stapelPlek de tegel waar die ligt. Zet het in A, of false: dan komen ze niet.
  function kiesDoel(D, A) {
    const velden = T.veldenVan(D);
    const akkers = velden.map((a, i) => i).filter((i) => T.bestemmingVan(velden[i]) === 'akker');
    const doel = {};
    if (akkers.length) doel.veld = akkers[Math.floor(lot(D, A.dag, 1) * akkers.length)];
    else {
      const g = grootsteStapel(D);
      if (!g) return false;
      Object.assign(doel, stapelDoel(D, g));
    }
    doel.ingang = ingangVan(D, A, doel.stapel ? doel.stapelPlek : velden[doel.veld]);
    if (!doel.ingang) return false;
    Object.assign(A, doel);
    return true;
  }
  // De stapel met het meeste erop, bij een deur of los; een kruimel (minder dan één) laten ze liggen.
  const grootsteStapel = (D) =>
    (D.gebouwen || []).filter((g) => T.stapelVan(g) >= 1).reduce((a, g) => (!a || T.stapelVan(g) > T.stapelVan(a) ? g : a), null);
  const stapelDoel = (D, g) => {
    const p = T.stapelPlek(D, g);
    return { stapel: g, stapelPlek: { x: p.x, y: p.y, b: 1, h: 1 } };
  };
  // Waar ze heen lopen: de akker, of de tegel van de stapel.
  const doelVan = (D, A) => (A.stapel ? A.stapelPlek : T.veldenVan(D)[A.veld]);
  const midden = (d) => ({ x: d.x + Math.floor(d.b / 2), y: d.y + Math.floor(d.h / 2) });
  // Zijn ze er: op de akker, of naast de stapel.
  function isEr(D, A, e) {
    const d = doelVan(D, A);
    if (A.stapel) return Math.max(Math.abs(e.tx - d.x), Math.abs(e.ty - d.y)) <= 1;
    return e.tx >= d.x && e.tx < d.x + d.b && e.ty >= d.y && e.ty < d.y + d.h;
  }

  // Het bericht van de aangekondigde overval, een dag van tevoren (vraag 185): er zijn rovers gezien, met de plek waar ze de
  // kaart op zullen komen, en de tijd gaat naar 1×. Is er niets om te roven, dan komen ze een dag later, met het bericht
  // morgen.
  function meld(D, A) {
    if (!A.ingang && !kiesDoel(D, A)) return eenDagLater(D, A);
    A.gemeld = true;
    const hulp = T.militieVan(D).length ? ` ${T.t('Choose your soldiers, and right-click where they should stand.')}` : '';
    T.zeg(D, `${T.t('Robbers were seen in the woods near the village. They will come soon.')}${hulp}`, 'gevaar', A.ingang);
    T.naarGewoneSnelheid(D);
  }

  // Niets om te roven bij een aangekondigde overval: dan komen ze een dag later, met het bericht morgen.
  function eenDagLater(D, A) {
    A.dag += 1;
    A.uur = overdagUur(D, A.dag);
  }

  // Het begin: de rovers komen de kaart op, waar hun weg haar binnenkomt, en het dorp ziet ze. Wie soldaten heeft, hoort
  // hoe hij ze stuurt. Is hun stapel intussen weg, dan nemen ze de grootste die er nu ligt.
  function begin(D, A) {
    const R = D.rovers;
    if (A.stapel && !(D.gebouwen.includes(A.stapel) && T.stapelVan(A.stapel) >= 1)) {
      const g = grootsteStapel(D);
      if (g) Object.assign(A, stapelDoel(D, g));
    }
    if (!opDeKaart(D, A, A.ingang)) return eind(D);
    const aantal = A.rovers.length;
    A.fase = 'komen';
    A.sinds = uurNu(D);
    R.laatsteAanval = A.dag; // de raad zegt dan een tijd lang wat een wachthuis doet (js/raad.js)
    const wie = T.t('{n|A robber turns up|{aantal} robbers turn up}', { n: aantal, aantal: T.hoofdletter(T.telwoord(aantal)) });
    // Er komt niemand vanzelf (vraag 170, stap 2): wie soldaten heeft, hoort hoe hij ze stuurt (js/kiezen.js).
    const hulp = T.militieVan(D).length ? ` ${T.t('Choose your soldiers, and right-click a robber.')}` : '';
    const plek = midden(doelVan(D, A));
    let tekst;
    if (A.stapel) {
      const ligt = A.stapel.stapel || {};
      const meest = Object.keys(ligt).reduce((a, wat) => (!a || ligt[wat] > ligt[a] ? wat : a), null);
      tekst = meest
        ? T.t('Robbers are coming. {wie}, heading for the {waar} left outside.{hulp}', { wie, waar: T.waarNaam(meest), hulp })
        : T.t('Robbers are coming. {wie}, heading for the village.{hulp}', { wie, hulp });
    } else {
      const boer = T.boerVanVeld(D, T.veldenVan(D)[A.veld]);
      const akker = boer ? T.t('the field of {boer}', { boer: boer.naam }) : T.t('the field');
      tekst = T.t('Robbers are coming. {wie}, heading for {akker}.{hulp}', { wie, akker, hulp });
    }
    T.bezoekerKomtAan(D, { meteen: true, aankomst: { tekst, soort: 'gevaar', naarGewoon: true, plek } });
  }

  // De hinderlaag (de bode naar de marskramer, js/bode.js; werklijst vraag 143; Marcel, 9 okt: "De bode moet "onderschept"
  // kunnen worden. dat maakt het spannend"): komt de bode dicht bij de uitgang, dan staan de rovers er, en houden ze hem en
  // wie meegaat aan (e.aangehouden: ze staan stil, T.dagAnker; de rovers slaan ze niet, js/gevecht.js). Stuur je je mannen
  // erheen, dan vechten ze (js/gevecht.js); anders loopt het na een tijd af zoals onderweg (T.bodeAangehouden). Is de bode
  // niet meer op de kaart, dan gebeurt het buiten beeld.
  const bodeWezens = (D) => (D.bode ? D.bode.wie.map((p) => p.wezen).filter((e) => e && !e.dood && D.wereld.wezens.includes(e)) : []);
  function laatDeBodeGaan(D, wezens = bodeWezens(D)) {
    for (const e of wezens) delete e.aangehouden;
    if (D.bode) D.bode.hinderlaag = false;
  }
  function beginHinderlaag(D, A) {
    const w = D.wereld;
    const R = D.rovers;
    const B = D.bode;
    const wezens = bodeWezens(D);
    const bode = B && B.hinderlaag && B.wie[0] && B.wie[0].wezen;
    const uitgang = T.wegInEnUit(D);
    if (!bode || !wezens.includes(bode) || !uitgang) {
      // Hij is de kaart al af: dan gebeurt het onderweg.
      if (B) B.hinderlaag = false;
      R.aanval = null;
      return;
    }
    if (T.afstand(uitgang, { x: bode.tx, y: bode.ty }) > T.BODE_INSTELLINGEN.hinderlaag.afstand) return;
    // Ze komen uit zijn kamp (c3): wie daar thuis is, tot `aanvallers`. Is er niemand, dan zijn er geen rovers onderweg.
    const K = kampNr(w, B.kamp);
    const leden = K ? thuis(K).slice(0, T.BODE_INSTELLINGEN.rovers.aanvallers) : [];
    if (!leden.length) {
      B.hinderlaag = false;
      B.onderschept = null;
      R.aanval = null;
      return;
    }
    const weg = T.groveWeg(w, K, uitgang);
    Object.assign(A, { kamp: K.nr, leden: leden.map((l) => l.id), reis: weg ? reisUren(weg) : 0, ingang: uitgang });
    for (const l of leden) l.opPad = { terug: null };
    opDeKaart(D, A, uitgang);
    const aantal = A.rovers.length;
    A.fase = 'roven';
    A.sinds = uurNu(D);
    A.roofTot = uurNu(D) + T.BODE_INSTELLINGEN.hinderlaag.uren;
    R.laatsteAanval = A.dag;
    for (const e of wezens) {
      e.aangehouden = { x: e.tx, y: e.ty };
      if (!e.onderweg) e.pad = [];
    }
    const naam = T.naamVanBewoner(B.wie[0]);
    const wie = T.t('{n|A robber|{aantal} robbers}', { n: aantal, aantal: T.hoofdletter(T.telwoord(aantal)) });
    T.bezoekerKomtAan(D, { meteen: true, aankomst: { tekst: T.t('Robbers on the road. {wie} {n|stops|stop} {naam} at the village exit. Send your men there, or they will take everything.', { wie, n: aantal, naam }), soort: 'gevaar', naarGewoon: true, plek: uitgang } });
  }
  function werkHinderlaagBij(D, A, levend) {
    const B = D.bode;
    const wezens = bodeWezens(D);
    if (A.fase === 'roven') {
      if (!B || !wezens.length) {
        A.fase = 'weg';
        A.sinds = uurNu(D);
        return;
      }
      // Ze staan om hem heen.
      const bode = wezens[0];
      for (const e of levend) if (!e.pad.length && !e.onderweg && T.afstand({ x: e.tx, y: e.ty }, { x: bode.tx, y: bode.ty }) > 1.5) stuur(D, e, { x: bode.tx, y: bode.ty });
      if (uurNu(D) < A.roofTot) return;
      T.bodeAangehouden(D, A.rovers);
      laatDeBodeGaan(D, wezens);
      A.fase = 'weg';
      A.sinds = uurNu(D);
      for (const e of levend) e.pad = [];
      return true;
    }
    return false;
  }

  // Een pad voor een rover naar (x, y), of naast die tegel als hij bezet is (of `naast`: een stapel); om wat vaststaat, en
  // wie er onderweg staat, lost hij onderweg op (js/lopen.js).
  function stuur(D, e, doel, ernaast = false) {
    const w = D.wereld;
    const naast = ernaast || T.wezenOp(w, doel.x, doel.y, e) != null;
    const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, doel, { naast });
    if (pad && pad.length) T.geefRoute(e, pad, { x: doel.x, y: doel.y, naast });
  }

  // Het roven zelf: graan uit de voorraad, en soms is de akker kapot; of wat ze van hun stapel kunnen dragen.
  function roof(D, A, levend) {
    if (A.stapel) return roofStapel(D, A, levend);
    const veld = T.veldenVan(D)[A.veld];
    const graan = Math.min((D.voorraad && D.voorraad.graan) || 0, levend.length * IN().graanPerRover);
    if (graan > 0) T.wijzigVoorraad(D, 'graan', -graan);
    const kapot = lot(D, A.dag, 3) < IN().kansAkkerKapot ? T.vertrapAkker(veld) : 0;
    const boer = T.boerVanVeld(D, veld);
    const weg = graan > 0 ? T.t('The robbers make off with {buit}.', { buit: T.hoeveel(Math.round(graan), 'graan') }) : T.t('The robbers make off empty-handed.');
    const vertrapt = !kapot ? '' : ` ${boer ? T.t('The field of {boer} has been trampled: whatever stood on it is gone.', { boer: boer.naam }) : T.t('The field has been trampled: whatever stood on it is gone.')}`;
    T.zeg(D, `${weg}${vertrapt}`, 'gevaar');
    A.buit = { graan, kapot };
    deelBuit(levend, graan > 0 ? { graan } : {});
  }
  function roofStapel(D, A, levend) {
    const g = A.stapel;
    const buit = D.gebouwen.includes(g) ? T.neemVanStapel(D, g, levend.length * IN().stapelPerRover) : {};
    const waren = Object.keys(buit).filter((wat) => buit[wat] >= 0.5);
    T.zeg(D, waren.length
      ? T.t('The robbers make off with {buit}.', { buit: T.opsomming(waren.map((wat) => T.hoeveel(Math.round(buit[wat]), wat))) })
      : T.t('The robbers make off empty-handed.'), 'gevaar');
    A.buit = buit;
    deelBuit(levend, buit);
  }
  // Ieder draagt een even groot deel (e.buit): valt hij, dan ligt het er (T.roverVerslagen), haalt hij zijn kamp, dan ligt
  // het daar (K.buit).
  function deelBuit(levend, buit) {
    for (const e of levend) {
      e.buit = {};
      for (const [wat, n] of Object.entries(buit)) if (n > 0) e.buit[wat] = n / levend.length;
    }
  }

  // Het eind van een aanval: wie nog leeft, is de kaart af, en reist terug naar zijn kamp (c3), met wat hij draagt; na de
  // reis is hij er (thuisVan, bij de roverskampen).
  function eind(D) {
    const A = D.rovers.aanval;
    D.rovers.aanval = null;
    const K = A && A.leden ? kampNr(D.wereld, A.kamp) : null;
    if (!K) return;
    const terug = D.kalender.dag + (A.reis || 0) / 24;
    for (const l of K.bende) {
      if (!A.leden.includes(l.id) || !l.opPad || l.opPad.terug != null) continue;
      const e = (A.rovers || []).find((r) => r.lid === l.id);
      l.opPad = { terug, buit: (e && e.buit) || {} };
    }
  }

  // Elke tik (T.werkDorpBij, js/dorp.js): de buit uit een verslagen kamp die je mannen thuisbrengen, en de aanval, van
  // komen tot weggaan. Wie vecht (e.doelwit), laat het gevecht lopen (js/gevecht.js); laat hij zijn doel gaan, dan gaat hij
  // verder met wat hij deed.
  T.werkRoversBij = function (S, D) {
    if (D.buitOnderweg) brengBuit(D);
    const A = D.rovers && D.rovers.aanval;
    if (!A || !heeftRovers(D)) return;
    const w = D.wereld;
    if (A.fase === 'wacht') {
      if (S.modus !== 'verkennen') return;
      if (A.soort === 'hinderlaag') return beginHinderlaag(D, A);
      // Uit welk kamp, en hoe lang ze onderweg zijn (c3). Is er geen kamp met mannen thuis, dan komt er deze keer niemand.
      if (A.kamp == null && !plan(D, A)) return eind(D);
      const moment = A.dag * 24 + A.uur;
      if (A.aangekondigd && !A.gemeld && uurNu(D) >= moment - IN().aangekondigd.vooraf) return meld(D, A);
      if (!A.meteen && uurNu(D) < moment - A.reis) return;
      if (!A.ingang && !kiesDoel(D, A)) return A.aangekondigd ? eenDagLater(D, A) : eind(D);
      if (!vertrek(D, A)) return eind(D);
    }
    if (A.fase === 'onderweg') {
      // Is de reis langer dan het bericht vooraf, dan zijn ze al op weg als het komt.
      if (A.aangekondigd && !A.gemeld && uurNu(D) >= A.dag * 24 + A.uur - IN().aangekondigd.vooraf) meld(D, A);
      if (!A.meteen && uurNu(D) < A.dag * 24 + A.uur) return;
      return begin(D, A);
    }
    const levend = A.rovers.filter((e) => !e.dood && w.wezens.includes(e));
    const vrij = levend.filter((e) => !e.doelwit);
    if (!levend.length) {
      if (A.soort === 'hinderlaag') laatDeBodeGaan(D);
      eind(D);
      return;
    }
    if (A.soort === 'hinderlaag' && A.fase === 'roven') return werkHinderlaagBij(D, A, levend);
    if (A.fase === 'komen') {
      const naar = midden(doelVan(D, A));
      for (const e of vrij) if (!e.pad.length && !e.onderweg && !isEr(D, A, e)) stuur(D, e, naar, !!A.stapel);
      if (levend.some((e) => isEr(D, A, e))) {
        A.fase = 'roven';
        A.roofTot = uurNu(D) + IN().roofUren;
      } else if (uurNu(D) >= A.sinds + IN().opUren) {
        // Ze halen de akker niet: dan gaan ze met lege handen terug.
        A.fase = 'weg';
        A.sinds = uurNu(D);
        for (const e of vrij) e.pad = [];
      }
      return;
    }
    if (A.fase === 'roven') {
      if (uurNu(D) < A.roofTot) return;
      roof(D, A, levend);
      A.fase = 'weg';
      A.sinds = uurNu(D);
      for (const e of vrij) e.pad = [];
      return;
    }
    // Weg: naar waar ze kwamen, en daar zijn ze de kaart af. Halen ze het niet op tijd, dan zijn ze toch weg.
    const opgegeven = uurNu(D) >= A.sinds + IN().opUren;
    for (const e of levend) {
      if ((e.onderweg || e.doelwit) && !opgegeven) continue;
      if (opgegeven || (e.tx === A.ingang.x && e.ty === A.ingang.y)) w.wezens.splice(w.wezens.indexOf(e), 1);
      else if (!e.pad.length) stuur(D, e, A.ingang);
    }
    if (!A.rovers.some((e) => !e.dood && w.wezens.includes(e))) eind(D);
  };

  // De laatste rover van de aanval valt (T.valt, js/gevecht.js): dan is hij voorbij, en een bode die ze aanhielden, gaat
  // verder.
  T.naGevecht = function (D) {
    const A = D.rovers && D.rovers.aanval;
    if (!A || !A.rovers) return;
    if (A.rovers.every((e) => e.dood)) {
      if (A.soort === 'hinderlaag') {
        T.bodeWegVrij(D);
        laatDeBodeGaan(D);
        T.zeg(D, D.bode ? T.t('The robbers are defeated. The messenger goes on.') : T.t('The robbers are defeated.'), 'goed');
      } else T.zeg(D, T.t('The robbers are defeated.'), 'goed');
      eind(D);
    }
  };

  // ---------------------------------------------------------------------------------------------
  // De roverskampen (werklijst vraag 170, stap 6a2, c1 en c2)
  // ---------------------------------------------------------------------------------------------

  // Waar de kampen liggen, zegt het eiland (E.kampen, js/eiland.js, legKampen: drie per eiland, in het woud, met hun open
  // plek, hun tentplekken en een paadje naar de dichtste weg); wat een kamp in dit spel is, onthoudt de kaart (w.kampen,
  // bewaard), vanaf het begin van een spel, ook waar je nog niet kwam: de bende groeit ook daar, en wie wegtrekt, moet
  // ergens heen (c2). Een kamp is van de wereld, niet van een dorp, zoals het wild (js/beesten.js), en gooit met een eigen
  // dobbelsteen (`lot`, uit het nummer van het eiland en van het kamp; Marcel koos A1 voor het wild):
  //   K = { nr, x, y (het vuur), staat (zijn land is open: het vuur, de tenten en de mannen staan er), tenten (hoeveel er
  //         staan), lot, bende [{ id, naam, vel, uit (het dorp waar hij wegtrok, of null: van buiten), plek {x, y} (waar
  //         hij om het vuur staat), opPad (op een overval, c3: { terug: de dag dat hij thuis is, of null zolang hij op je
  //         land is; buit: wat hij meebrengt }) }], geteld (het id van de volgende), jaar (het jaar van het spel dat er het
  //         laatst een bij kwam), wakker (de dag tot wanneer niemand slaapt: er was een vijand), ver (er is niemand van een
  //         dorp in de buurt; keekVer: wanneer het weer kijkt), buit ({ wat: hoeveel }: wat ze thuisbrachten, c3),
  //         verslagen (de laatste man viel, c4), palissade (het hol van een level heeft er een, T.maakHol; palissadeStaat:
  //         hij staat er, zetPalissade), tentPlekken (die van het hol, tegen de palissade; een gewoon kamp heeft die van
  //         het eiland, tentPlekken()), spullen (de aankleding, spullenVoor) }
  // Een man van een kamp op de kaart is een rover: e.rover, e.kamp (het nummer van zijn kamp) en e.lid (zijn id in de
  // bende); thuis van geen dorp, op een overval van het dorp dat hij overvalt (e.dorp). De wereld werkt hem bij, één keer per kaart (T.werkKampenBij); vechten doet hij in
  // T.werkGevechtVanDeWereldBij (js/gevecht.js), met de dobbelsteen van zijn kamp.

  // De kampen van kaart w (vanaf dag `dag`), of een lege lijst: een kaart die niet op het eiland ligt, heeft er geen.
  function kampenVan(w, dag) {
    if (w.kampen || !T.opEiland(w)) return w.kampen || [];
    w.kampen = eilandKampen(w).kampen.map((k) => nieuwKamp(w, k, dag));
    return w.kampen;
  }
  // Wat het eiland van de kampen zegt (de kampen en de paadjes), per kaart onthouden: het eiland opvragen kost niets als
  // het het laatste is, maar leven er dorpen op twee eilanden (de toetsen), dan maakte elke tik ze allebei opnieuw.
  const EILAND_KAMPEN = new WeakMap(); // kaart → { kampen, paden } (volgt uit het eiland, niet bewaard)
  function eilandKampen(w) {
    let uit = EILAND_KAMPEN.get(w);
    if (!uit) {
      const E = T.eilandVan(w.eiland.zaad);
      uit = { kampen: E.kampen, paden: E.paden };
      EILAND_KAMPEN.set(w, uit);
    }
    return uit;
  }
  function nieuwKamp(w, k, dag) {
    const zaad = (((w.eiland.zaad >>> 0) * 31 + (k.nr + 1) * 7919) ^ 0x5bd1e995) >>> 0;
    const K = { nr: k.nr, x: k.x, y: k.y, staat: false, tenten: 0, lot: { zaad }, bende: [], geteld: 0, jaar: Math.floor(dag / T.DAGEN_PER_JAAR), wakker: 0, buit: {} };
    for (let i = 0; i < IN().kampBende; i++) vanBuiten(K);
    return K;
  }
  // Er komt een man van buiten bij: een jongere of volwassene, meest mannen (zoals de wilde rovers van voor c3), met een
  // voornaam die nog niet in de bende is; alles uit de dobbelsteen van het kamp.
  function vanBuiten(K) {
    const leeftijd = T.toeval(K) < 0.7 ? 'volwassen' : 'jong';
    const geslacht = T.toeval(K) < 0.75 ? 'man' : 'vrouw';
    const lijst = T.VOORNAMEN[geslacht];
    const vrij = lijst.filter((n) => !K.bende.some((l) => l.naam === n));
    const uit = vrij.length ? vrij : lijst;
    K.bende.push({ id: K.geteld++, naam: uit[Math.floor(T.toeval(K) * uit.length)], vel: T.LEEFTIJDEN[leeftijd][geslacht], uit: null });
  }
  // Het kamp van wezen e op kaart w (een man van een kamp, thuis of op een overval), of null; en zijn plaats in de bende.
  T.kampVan = (w, e) => (e && w ? kampNr(w, e.kamp) : null);
  T.lidVan = function (w, e) {
    const K = T.kampVan(w, e);
    return (K && K.bende.find((l) => l.id === e.lid)) || null;
  };

  // Gaat het land om een kamp open (de stukken die zijn open plek raakt, w.open), dan staat het er (Marcel, 17 okt: V2, je
  // vindt een kamp zelf), zoals het wild: het vuur, een tent per `manPerTent` man met de opening naar het vuur, en de
  // mannen, elk op zijn plek. Elke tik, één keer per kaart (T.wereldTik, js/tik.js), vóór het wild; het kijkt alleen als
  // er land open ging (KAMPEN_BIJ). Geeft de kampen die er nu staan.
  const KAMPEN_BIJ = new WeakMap(); // kaart → hoeveel stukken er open waren toen het keek (volgt uit de kaart, niet bewaard)
  T.zetRoverskampenBij = function (S, w) {
    if (!T.opEiland(w) || !w.open) return [];
    const kampen = kampenVan(w, Math.floor(S.kalender.dag));
    if (KAMPEN_BIJ.get(w) === w.open.size || kampen.every((K) => K.staat)) return [];
    KAMPEN_BIJ.set(w, w.open.size);
    const E = eilandKampen(w);
    const uit = [];
    for (const K of kampen) {
      const k = E.kampen[K.nr];
      if (K.staat || !kampLandOpen(w, k, K.palissade ? IN().palissade.vrij : undefined)) continue;
      K.staat = true;
      T.zetVoorwerp(w, { soort: 'kampvuur', x: k.x, y: k.y, kamp: k.nr });
      if (K.palissade) zetPalissade(w, K);
      zetTenten(w, K);
      if (!K.spullen) K.spullen = spullenVoor(w, K);
      for (const lid of K.bende) zetMan(w, K, lid, plekVan(w, K, lid));
      uit.push(K);
    }
    return uit;
  };
  // De stukken die de open plek van kamp k raakt, als [sx, sy]; en is het land daar open?
  // Met een palissade om het kamp (het hol) zoveel verder als de open plek groter wordt (`palissade.vrij`).
  function stukkenVanKamp(k, r = T.EILAND_INSTELLINGEN.kampen.open) {
    const uit = [];
    for (let sy = Math.floor((k.y - r) / T.STUK); sy <= Math.floor((k.y + r) / T.STUK); sy++) {
      for (let sx = Math.floor((k.x - r) / T.STUK); sx <= Math.floor((k.x + r) / T.STUK); sx++) uit.push([sx, sy]);
    }
    return uit;
  }
  // Land buiten de rand van een level gaat nooit open: dat telt niet mee; maar het vuur zelf ligt binnen de rand.
  const kampLandOpen = (w, k, r) =>
    T.stukBinnenRand(w, Math.floor(k.x / T.STUK), Math.floor(k.y / T.STUK)) &&
    stukkenVanKamp(k, r).every(([sx, sy]) => !T.stukBinnenRand(w, sx, sy) || w.open.has(T.stukNummer(sx, sy)));
  // De palissade om het hol (T.maakHol; werklijst K, 2c; Marcel, 27 okt: "1, 2, 3 en 5"). Eerst de grotere open plek: wat
  // er op het eiland groeit (v.natuur: een boom, een struik), gaat weg tot `palissade.vrij` van het vuur, zodat het woud
  // de voorwand en de poort niet afdekt. Dan de ring: elke tegel op `palissade.straal` van het vuur een voorwerp dat in de
  // weg staat (T.VOORWERPEN.palissade, js/wereld.js; je ziet het niet, de palen tekent palenVan), behalve `palissade.opening`
  // tegels waar het paadje de ring kruist (kruisingMetPaadje). Water en wat er al staat, slaat hij over. Eén keer, als het
  // kamp er komt te staan; de palissade blijft ook als het verslagen is.
  function zetPalissade(w, K) {
    K.palissadeStaat = true;
    const P = IN().palissade;
    for (let y = K.y - P.vrij; y <= K.y + P.vrij; y++) {
      for (let x = K.x - P.vrij; x <= K.x + P.vrij; x++) {
        if (Math.hypot(x - K.x, y - K.y) > P.vrij) continue;
        const v = T.voorwerpOp(w, x, y);
        if (v && v.natuur) T.haalVoorwerpWeg(w, v);
      }
    }
    const R = P.straal;
    const poort = kruisingMetPaadje(w, K, R);
    for (let y = K.y - R - 1; y <= K.y + R + 1; y++) {
      for (let x = K.x - R - 1; x <= K.x + R + 1; x++) {
        const d = Math.hypot(x - K.x, y - K.y);
        if (d < R - 0.5 || d >= R + 0.5) continue;
        if (poort && Math.hypot(x - poort.x, y - poort.y) <= P.opening / 2 + 0.25) continue;
        if (!T.isBegaanbaar(w, x, y, {})) continue;
        T.zetVoorwerp(w, { soort: 'palissade', x, y, kamp: K.nr });
      }
    }
    if (!K.tentPlekken) K.tentPlekken = tentenTegenDePalissade(w, K);
  }
  // De tentplekken van kamp K ({ x, y, open, voet, deur }, T.tentOp in js/eiland.js), op volgorde: die van het hol tegen
  // zijn palissade, anders die het eiland gaf.
  const tentPlekken = (w, K) => K.tentPlekken || eilandKampen(w).kampen[K.nr].tenten;
  T.tentPlekkenVan = tentPlekken;
  // De tenten van het hol tegen zijn palissade (Marcel, 27 okt: "B; mag beetje random"): `tentenMeest` plekken, gelijk
  // verdeeld over de ring vanaf de poort, behalve bij de poort (het paadje naar het vuur blijft vrij) en vooraan
  // (`tentNietVoor`); elk `tentAfstand` van het vuur en een stukje verschoven (`tentSchuif`), met zijn opening naar het
  // vuur (staat hij schuin, dan een van de twee), met een vast lot uit het zaad van het kamp. Kan een plek niet (op een
  // andere tent of ernaast, het paadje, de buit, water), dan nog een paar worpen, en anders valt hij weg. Eén keer, als
  // het hol er komt te staan (K.tentPlekken, bewaard: zo blijven ze waar de tenten staan).
  function tentenTegenDePalissade(w, K) {
    const P = IN().palissade;
    const lot = T.dobbelsteen((K.lot.zaad ^ 0x7a3c91e5) >>> 0);
    const pad = eilandKampen(w).paden.find((p) => p.kamp === K.nr);
    const p = kruisingMetPaadje(w, K, P.straal);
    const poortHoek = p ? Math.atan2(p.y - K.y, p.x - K.x) : 0;
    const [van, tot] = P.tentAfstand;
    const poortVrij = (P.opening / 2 + 2) / van;
    const nietVoor = (P.tentNietVoor * Math.PI) / 180;
    const tussen = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    // de hoeken waar een tent mag, in stappen van een halve graad vanaf de poort rond
    const hoeken = [];
    for (let i = 0; i < 720; i++) {
      const a = poortHoek + (i * Math.PI) / 360;
      if (tussen(a, poortHoek) > poortVrij && tussen(a, Math.PI / 4) > nietVoor) hoeken.push(a);
    }
    const n = T.EILAND_INSTELLINGEN.kampen.tentenMeest;
    const stap = hoeken.length / n;
    const b = buitPlek(K);
    const bezet = [];
    const uit = [];
    for (let i = 0; i < n && hoeken.length; i++) {
      for (let poging = 0; poging < 8; poging++) {
        const j = Math.floor((i + 0.5 + (lot() - 0.5) * 2 * P.tentSchuif) * stap);
        const a = hoeken[Math.max(0, Math.min(hoeken.length - 1, j))];
        const r = van + lot() * (tot - van);
        const x = Math.round(K.x + Math.cos(a) * r);
        const y = Math.round(K.y + Math.sin(a) * r);
        const dx = K.x - x;
        const dy = K.y - y;
        const langsX = dx > 0 ? 'ZO' : 'NW'; // geen tekst
        const langsY = dy > 0 ? 'ZW' : 'NO'; // geen tekst
        const schuin = Math.min(Math.abs(dx), Math.abs(dy)) > 0.65 * Math.max(Math.abs(dx), Math.abs(dy));
        const open = schuin ? (lot() < 0.5 ? langsX : langsY) : Math.abs(dx) > Math.abs(dy) ? langsX : langsY;
        const t = T.tentOp(x, y, open);
        const tegels = T.tentTegels(t);
        const kan = tegels.every(([tx, ty]) =>
          T.isBegaanbaar(w, tx, ty, {}) &&
          Math.hypot(tx - K.x, ty - K.y) <= P.straal - 1.2 &&
          Math.max(Math.abs(tx - b.x), Math.abs(ty - b.y)) > 2 &&
          !(pad && totPad(pad.punten, tx, ty) < 1.5) &&
          !bezet.some(([ax, ay]) => Math.max(Math.abs(ax - tx), Math.abs(ay - ty)) < 3));
        if (!kan) continue;
        bezet.push(...tegels);
        uit.push(t);
        break;
      }
    }
    return uit;
  }
  // Waar het paadje van kamp K (vanaf het vuur naar buiten) op `r` tegels van het vuur komt ({ x, y }, niet afgerond), of
  // null.
  function kruisingMetPaadje(w, K, r) {
    const pad = eilandKampen(w).paden.find((p) => p.kamp === K.nr);
    for (let i = 0; pad && i + 1 < pad.punten.length; i++) {
      const [ax, ay] = pad.punten[i];
      const [bx, by] = pad.punten[i + 1];
      const st = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) * 4));
      for (let s = 0; s <= st; s++) {
        const x = ax + ((bx - ax) * s) / st;
        const y = ay + ((by - ay) * s) / st;
        if (Math.hypot(x - K.x, y - K.y) >= r) return { x, y };
      }
    }
    return null;
  }
  // De palen van de palissade van kamp K, om te tekenen (T.roverskampenPalissade): elke paal op zijn eigen plek op de
  // cirkel ({ x, y } in tegels, niet afgerond), met zijn rij uit het vel (de soort, met een vast lot uit het zaad van het
  // kamp, zoals een willekeurige tegel; Marcel, 27 okt: "Als een soort random tile erin") en zijn richting (de buitenkant,
  // in zestien stappen); en de poort: de twee zware palen ('paal-lap' links, 'paal') en de balk met de schedel ('balk', in
  // het midden tussen de palen, `boven`: hij gaat over wie eronder loopt). Volgt uit het kamp en het eiland, dus niet
  // bewaard (PALEN).
  const PALEN = new WeakMap(); // kamp → [{ x, y, rij, richting, boven }]
  const richting16 = (a) => (((Math.round(a / (Math.PI / 8)) % 16) + 16) % 16);
  function palenVan(w, K) {
    let uit = PALEN.get(K);
    if (uit) return uit;
    const P = IN().palissade;
    const R = P.straal;
    const p = kruisingMetPaadje(w, K, R);
    const poortHoek = p ? Math.atan2(p.y - K.y, p.x - K.x) : 0;
    const halfGat = P.opening / 2 / R;
    const vrij = P.poortRuimte / R;
    const boog = 2 * Math.PI - 2 * halfGat - 2 * vrij;
    const n = Math.max(1, Math.round(boog / (P.tussen / R)));
    const op = (a, r = R) => ({ x: K.x + Math.cos(a) * r, y: K.y + Math.sin(a) * r });
    const lot = T.dobbelsteen((K.lot.zaad ^ 0x2f6b5a1d) >>> 0);
    uit = [];
    let vorige = null;
    for (let i = 0; i <= n; i++) {
      const a = poortHoek + halfGat + vrij + (i * boog) / n;
      const soort = kiesPaal(lot, vorige);
      vorige = soort;
      const r2 = lot();
      const rij = soort === 'gewoon' ? `gewoon${Math.floor(r2 * 3)}` : soort === 'scheef' ? ['scheef-uit', 'scheef-in', 'scheef-langs'][Math.floor(r2 * 3)] : soort === 'gat' ? (r2 < 0.5 ? 'gat' : 'gat-stomp') : soort;
      uit.push({ ...op(a), rij, richting: richting16(a) });
    }
    const posten = [poortHoek - halfGat, poortHoek + halfGat].map((a) => op(a));
    uit.push({ ...posten[0], rij: 'paal-lap', richting: richting16(poortHoek - halfGat) });
    uit.push({ ...posten[1], rij: 'paal', richting: richting16(poortHoek + halfGat) });
    uit.push({ x: (posten[0].x + posten[1].x) / 2, y: (posten[0].y + posten[1].y) / 2, rij: 'balk', richting: richting16(poortHoek), boven: true });
    PALEN.set(K, uit);
    return uit;
  }
  // Een soort paal met de kansen van `palissade.soorten`; een gaatje of een afgebroken naast dezelfde wordt een gewone.
  function kiesPaal(lot, vorige) {
    const soorten = IN().palissade.soorten;
    let r = lot() * Object.values(soorten).reduce((a, b) => a + b, 0);
    for (const [soort, kans] of Object.entries(soorten)) {
      if ((r -= kans) >= 0) continue;
      return (soort === 'gat' || soort === 'afgebroken') && soort === vorige ? 'gewoon' : soort;
    }
    return 'gewoon';
  }
  // De palen van de palissade van kamp K op kaart w, om te tekenen (js/tekenen.js), of een lege lijst: één keer
  // uitgerekend, dan dezelfde lijst elk beeld.
  T.palissadeVan = (w, K) => (K.palissadeStaat ? palenVan(w, K) : []);

  // Een tent per `manPerTent` man, op de tentplekken op volgorde; ze gaan niet weer neer als er een valt (dat is c4).
  // Staat er iemand waar een tent komt, dan komt hij een tik later.
  function zetTenten(w, K) {
    if (K.verslagen) return;
    const plekken = tentPlekken(w, K);
    const nodig = Math.min(plekken.length, Math.ceil(K.bende.length / IN().manPerTent));
    while (K.tenten < nodig) {
      const t = plekken[K.tenten];
      for (let y = t.voet.y; y < t.voet.y + t.voet.h; y++) for (let x = t.voet.x; x < t.voet.x + t.voet.b; x++) if (T.wezenOp(w, x, y)) return;
      const voet = { dx: t.voet.x - t.x, dy: t.voet.y - t.y, b: t.voet.b, h: t.voet.h };
      T.zetVoorwerp(w, { soort: 'tent', x: t.x, y: t.y, vorm: 'tent-rover', richting: t.open, voet, kamp: K.nr });
      K.tenten++;
    }
  }
  // Waar een man om het vuur staat: zijn eigen plek tussen `rondHetVuur` tegels ervan, op het plein, niet op een tentplek
  // (ook een die er nog niet staat) of de tegel voor zijn opening, niet op het paadje, en niet die van een ander; met een
  // vaste worp uit het zaad van het kamp en zijn id (de dobbelsteen van het kamp rolt er niet door: wie er later bijkomt,
  // is dezelfde, of je het kamp nu zag of niet), en dan onthouden (lid.plek).
  function plekVan(w, K, lid) {
    if (lid.plek) return lid.plek;
    const pad = eilandKampen(w).paden.find((p) => p.kamp === K.nr);
    const nee = new Set();
    for (const t of tentPlekken(w, K)) for (const [x, y] of T.tentTegels(t)) nee.add(`${x},${y}`);
    for (const l of K.bende) if (l.plek) nee.add(`${l.plek.x},${l.plek.y}`);
    const b = buitPlek(K);
    for (let y = b.y - 1; y <= b.y + 1; y++) for (let x = b.x - 1; x <= b.x + 1; x++) nee.add(`${x},${y}`);
    // en niet op de aankleding (spullenVoor), behalve wat op de grond ligt
    for (const q of K.spullen || []) {
      const r = SPUL[q.soort].grond ? -1 : SPUL[q.soort].voet;
      for (let y = Math.floor(q.y - r); y <= Math.ceil(q.y + r); y++) for (let x = Math.floor(q.x - r); x <= Math.ceil(q.x + r); x++) if (Math.hypot(x - q.x, y - q.y) <= r + 0.5) nee.add(`${x},${y}`);
    }
    // Zijn er om het vuur geen plekken meer vrij (een groot hol, met zijn tenten en zijn aankleding), dan een tegel verder,
    // tot drie tegels verder.
    const [van, tot0] = IN().rondHetVuur;
    const kan = [];
    for (let tot = tot0; !kan.length && tot <= tot0 + 3; tot += 1) {
      for (let y = Math.floor(K.y - tot); y <= K.y + tot; y++) {
        for (let x = Math.floor(K.x - tot); x <= K.x + tot; x++) {
          const d = Math.hypot(x - K.x, y - K.y);
          if (d < van || d > tot || nee.has(`${x},${y}`) || (pad && totPad(pad.punten, x, y) < 1.5) || !T.isBegaanbaar(w, x, y, {})) continue;
          kan.push({ x, y });
        }
      }
    }
    const worp = T.dobbelsteen((K.lot.zaad ^ Math.imul(lid.id + 1, 0x9e3779b1)) >>> 0)();
    lid.plek = kan.length ? kan[Math.floor(worp * kan.length)] : plekBij(w, { x: K.x + 1, y: K.y });
    return lid.plek;
  }
  // Hoe ver (x, y) van een lijn ligt (een lijst punten [x, y]): het paadje van een kamp.
  function totPad(punten, x, y) {
    let d = Infinity;
    for (let i = 0; i + 1 < punten.length; i++) {
      const [ax, ay] = punten[i];
      const [bx, by] = punten[i + 1];
      const lx = bx - ax;
      const ly = by - ay;
      const ll = lx * lx + ly * ly;
      const u = ll > 0 ? Math.max(0, Math.min(1, ((x - ax) * lx + (y - ay) * ly) / ll)) : 0;
      d = Math.min(d, Math.hypot(x - ax - u * lx, y - ay - u * ly));
    }
    return d;
  }
  // Waar een nieuwe man het kamp in komt: over het paadje, aan de rand van de open plek.
  function aankomst(w, K) {
    const E = eilandKampen(w);
    const pad = E.paden.find((p) => p.kamp === K.nr);
    const r = T.EILAND_INSTELLINGEN.kampen.open - 1;
    for (let i = 0; pad && i + 1 < pad.punten.length; i++) {
      const [ax, ay] = pad.punten[i];
      const [bx, by] = pad.punten[i + 1];
      const st = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
      for (let s = 0; s <= st; s++) {
        const x = Math.round(ax + ((bx - ax) * s) / st);
        const y = Math.round(ay + ((by - ay) * s) / st);
        if (Math.hypot(x - K.x, y - K.y) >= r) return plekBij(w, { x, y });
      }
    }
    return plekBij(w, { x: K.x + r, y: K.y });
  }
  // Een man van kamp K op de kaart, op plek (of de vrije tegel ernaast), met zijn gezicht naar het vuur.
  function zetMan(w, K, lid, plek) {
    const e = maakRover(null, K, lid, plekBij(w, plek));
    e.kijkt = { x: K.x, y: K.y };
    w.wezens.push(e);
    return e;
  }

  // Elke tik, één keer per kaart (T.wereldTik, js/tik.js), na het zetten van de kampen: elke nacht van de kampen (ook waar
  // je niet bent), wie thuiskomt van een overval, en wat de mannen doen in een kamp dat er staat.
  T.werkKampenBij = function (S, w) {
    if (!w.kampen || !S.kalender) return;
    const dag = S.kalender.dag;
    if (w.kampenDag == null) w.kampenDag = Math.floor(dag);
    while (w.kampenDag < Math.floor(dag)) tikKampenDag(w, ++w.kampenDag);
    for (const K of w.kampen) for (const l of K.bende) if (l.opPad && l.opPad.terug != null && dag >= l.opPad.terug) thuisVan(K, l);
    if (!w.kampen.some((K) => K.staat)) return;
    const mannen = new Map(); // nummer van het kamp → zijn mannen op de kaart (niet wie op een overval is: e.dorp)
    for (const e of w.wezens) {
      if (e.kamp == null || !e.rover || e.dood || e.dorp) continue;
      const lijst = mannen.get(e.kamp);
      if (lijst) lijst.push(e);
      else mannen.set(e.kamp, [e]);
    }
    for (const K of w.kampen) if (K.staat) werkKampBij(S, w, K, mannen.get(K.nr) || [], dag);
  };

  // Thuis van een overval (c3): wat hij meebracht, ligt in het kamp (K.buit; in c4 haal je het daar), en staat het kamp er,
  // dan komt hij over het paadje binnen (werkKampBij).
  function thuisVan(K, l) {
    legBij(K, l.opPad.buit);
    delete l.opPad;
  }

  // Valt de laatste man van een kamp, thuis of op een overval (c4), dan is het verslagen, en het komt niet terug (R1): de
  // tenten gaan neer, het vuur gaat uit, en er komt niemand meer bij, van buiten of wie wegtrekt. Wat er aan buit lag,
  // ligt er nog (K1): je mannen dragen het naar huis (neemBuit). Een bericht zegt het, met de plek.
  function kampValt(D, K) {
    const w = D.wereld;
    K.verslagen = true;
    for (const v of w.voorwerpen.filter((x) => x.soort === 'tent' && x.kamp === K.nr)) T.haalVoorwerpWeg(w, v);
    K.tenten = 0;
    const tekst = Object.keys(K.buit).length
      ? T.t("The robbers' camp is beaten. Their loot lies by the fire: send your men there to carry it home.")
      : T.t("The robbers' camp is beaten.");
    T.zeg(D, tekst, 'goed', { x: K.x, y: K.y });
  }
  // De aankleding van een roverskamp (werklijst K, 2c; Marcel, 27 okt: "Alles valt en staat met de aankleding", "alle
  // negen"; de tekeningen in gereedschap/pixelart/aankleding.cjs). Per soort: waar het staat (`zone`, van zoveel tot zoveel
  // tegels van het vuur; nooit verder dan `voet` + 1 binnen de palissade, of in een gewoon kamp tot `kampTot`, de rand van
  // zijn plein), hoe groot het is (`voet`, in tegels: zover blijft een ander ervan af), of het plat op de grond
  // ligt (`grond`: het mag onder een ander liggen), en hoeveel er in het hol komen (`hol`) en in een gewoon kamp
  // (`kamp`; een breuk is een kans). Het slaapvel komt voor elke tent, de waslijn tussen twee tenten (`tussenTenten`: hij
  // mag tot tegen een tent), en de fakkels bij de poort (alleen met een palissade). De rest zoekt een plek op volgorde van
  // groot naar klein (VOLGORDE), zodat de grote dingen nog ruimte vinden.
  const SPUL = {
    zitstam: { zone: [1.6, 2.8], voet: 0.8, hol: 2, kamp: 2 },
    'zitstam-bijl': { zone: [1.6, 2.8], voet: 0.8, hol: 1, kamp: 0 },
    spit: { zone: [2.4, 3.4], voet: 0.9, hol: 1, kamp: 0.5 },
    slaapvel: { voet: 0.5, grond: true },
    waslijn: { voet: 1.2, tussenTenten: true, hol: 1, kamp: 1 },
    wapenrek: { zone: [3.4, 9], voet: 0.7, hol: 1, kamp: 0 },
    schietschijf: { zone: [3.4, 9], voet: 0.6, hol: 1, kamp: 0 },
    hakblok: { zone: [2.8, 9], voet: 0.5, hol: 1, kamp: 1 },
    brandhout: { zone: [5, 9], voet: 0.6, hol: 1, kamp: 0.5 },
    bierbok: { zone: [2.8, 7], voet: 0.7, hol: 1, kamp: 0 },
    droograam: { zone: [3.4, 9], voet: 0.7, hol: 1, kamp: 0.3 },
    konijnenpaal: { zone: [3.0, 9], voet: 0.5, hol: 1, kamp: 0.3 },
    kar: { zone: [3.2, 9], voet: 1.3, hol: 1, kamp: 0 },
    fakkel: { voet: 0.2 },
    modderplas: { zone: [1.6, 9], voet: 0.6, grond: true, hol: 2, kamp: 1 },
    stro: { zone: [1.6, 6.5], voet: 0.5, grond: true, hol: 3, kamp: 2 },
  };
  const KAMP_TOT = 5.6;
  const VOLGORDE = ['kar', 'spit', 'zitstam-bijl', 'zitstam', 'bierbok', 'wapenrek', 'droograam', 'schietschijf', 'brandhout', 'hakblok', 'konijnenpaal', 'modderplas', 'stro'];
  const richting4 = (a) => (((Math.round(a / (Math.PI / 2)) % 4) + 4) % 4);
  // Wat kamp K aan aankleding krijgt, en waar: [{ soort, x, y, richting }] (x, y in tegels, niet afgerond; richting 0 tot 3
  // in stappen van 90 graden vanaf ZO, zoals de tent). Met een vast lot uit het zaad van het kamp, zoals de soorten paal:
  // elk ding probeert plekken in zijn zone tot er een vrij is (niet op een tent of waar er een komt, het vuur, de buit,
  // het paadje of een ander ding), en kijkt met zijn voorkant naar het vuur. Eén keer, als het kamp er komt te staan
  // (K.spullen, bewaard).
  function spullenVoor(w, K) {
    const lot = T.dobbelsteen((K.lot.zaad ^ 0x51ed270b) >>> 0);
    const pad = eilandKampen(w).paden.find((p) => p.kamp === K.nr);
    const uit = [];
    const plekken = tentPlekken(w, K);
    const tentTegels = new Set();
    for (const t of plekken) for (const [x, y] of T.tentTegels(t)) tentTegels.add(`${x},${y}`);
    const b = buitPlek(K);
    const naarVuur = (x, y) => richting4(Math.atan2(K.y - y, K.x - x));
    const vrij = (soort, x, y) => {
      const S = SPUL[soort];
      const r = S.voet;
      if (!S.grond && pad && totPad(pad.punten, x, y) < r + 0.8) return false;
      if (Math.hypot(x - K.x, y - K.y) < 1 + r * 0.6 || Math.max(Math.abs(x - b.x), Math.abs(y - b.y)) < 1.3 + r * 0.6) return false;
      for (let ty = Math.floor(y - r); ty <= Math.ceil(y + r); ty++) {
        for (let tx = Math.floor(x - r); tx <= Math.ceil(x + r); tx++) {
          if (Math.hypot(tx - x, ty - y) > r + 0.5) continue;
          if ((!S.tussenTenten && tentTegels.has(`${tx},${ty}`)) || !T.isBegaanbaar(w, tx, ty, {})) return false;
        }
      }
      return S.grond || uit.every((q) => SPUL[q.soort].grond || Math.hypot(q.x - x, q.y - y) >= r + SPUL[q.soort].voet);
    };
    const zet = (soort, x, y, richting) => uit.push({ soort, x, y, richting });
    // de slaapvellen voor de tenten (alle tentplekken van het kamp, ook die nog komen), een halve tegel naar het vuur
    for (const t of plekken.slice(0, Math.max(1, Math.ceil(K.bende.length / IN().manPerTent)))) {
      const a = Math.atan2(K.y - t.deur.y, K.x - t.deur.x);
      zet('slaapvel', t.deur.x + Math.cos(a) * 0.6, t.deur.y + Math.sin(a) * 0.6, richting4(a));
    }
    // de fakkels bij de poort, net binnen de palissade
    if (K.palissade) {
      const P = IN().palissade;
      const p = kruisingMetPaadje(w, K, P.straal);
      const poortHoek = p ? Math.atan2(p.y - K.y, p.x - K.x) : 0;
      for (const kant of [-1, 1]) {
        const a = poortHoek + (kant * P.opening * 0.4) / P.straal;
        zet('fakkel', K.x + Math.cos(a) * (P.straal - 1), K.y + Math.sin(a) * (P.straal - 1), 0);
      }
    }
    // de waslijn tussen twee tenten die 3 tot 6 tegels uit elkaar staan, wat naar het vuur: de dichtste twee waar plaats is
    const tenten = plekken.slice(0, Math.max(2, Math.ceil(K.bende.length / IN().manPerTent)));
    const paren = [];
    for (let i = 0; i < tenten.length; i++) for (let j = i + 1; j < tenten.length; j++) {
      const d = Math.hypot(tenten[i].x - tenten[j].x, tenten[i].y - tenten[j].y);
      if (d >= 3 && d <= 6) paren.push({ a: tenten[i], b: tenten[j], d });
    }
    const hoeveel = (S) => {
      const n = K.palissade ? S.hol || 0 : S.kamp || 0;
      return Math.floor(n) + (lot() < n % 1 ? 1 : 0);
    };
    if (hoeveel(SPUL.waslijn)) {
      for (const paar of paren.sort((p, q) => p.d - q.d)) {
        const m = { x: (paar.a.x + paar.b.x) / 2, y: (paar.a.y + paar.b.y) / 2 };
        const a = Math.atan2(K.y - m.y, K.x - m.x);
        const x = m.x + Math.cos(a) * 0.8;
        const y = m.y + Math.sin(a) * 0.8;
        if (!vrij('waslijn', x, y)) continue;
        zet('waslijn', x, y, richting4(Math.atan2(paar.b.y - paar.a.y, paar.b.x - paar.a.x) - Math.PI / 2));
        break;
      }
    }
    // de rest in hun zone, van groot naar klein
    for (const soort of VOLGORDE) {
      const S = SPUL[soort];
      for (let n = hoeveel(S); n > 0; n--) {
        for (let poging = 0; poging < 80; poging++) {
          const a = lot() * Math.PI * 2;
          const tot = Math.min(S.zone[1], K.palissade ? IN().palissade.straal - 1 - S.voet : KAMP_TOT);
          const r = S.zone[0] + lot() * Math.max(0, tot - S.zone[0]);
          const x = K.x + Math.cos(a) * r;
          const y = K.y + Math.sin(a) * r;
          if (!vrij(soort, x, y)) continue;
          zet(soort, x, y, naarVuur(x, y));
          break;
        }
      }
    }
    return uit;
  }
  // Waar de buit van kamp K ligt: twee tegels rechts van het vuur op het scherm, tussen de tentplekken door (de grote
  // hoop beslaat er zo'n twee bij twee); niemand staat daar om het vuur (plekVan).
  const buitPlek = (K) => ({ x: K.x + 2, y: K.y - 2 });

  // De buit van een verslagen kamp (c4; Marcel, 17 okt: "B1, dan kun je het ook nog verliezen tijdens een gevecht"): wie
  // van je mannen bij het vuur komt, neemt mee wat hij kan dragen (`buitPerMan`), en het telt pas als hij terug is in het
  // bereik van zijn dorp (brengBuit); wat blijft liggen, haal je een tweede keer. Wie het draagt en valt, verliest het.
  function neemBuit(S, w, K) {
    if (!Object.keys(K.buit).length) return;
    for (const D of S.dorpen || []) {
      if (D.wereld !== w) continue;
      for (const e of T.mannenVan(D)) {
        if (e.buit || T.afstand(T.tegelVan(e), buitPlek(K)) > IN().buitAfstand) continue;
        let ruimte = IN().buitPerMan;
        e.buit = {};
        for (const wat of Object.keys(K.buit)) {
          const n = Math.min(ruimte, K.buit[wat]);
          if (n <= 0) continue;
          e.buit[wat] = n;
          K.buit[wat] -= n;
          if (K.buit[wat] < 1e-6) delete K.buit[wat];
          ruimte -= n;
        }
        D.buitOnderweg = true;
        if (!Object.keys(K.buit).length) return;
      }
    }
  }
  // Een man met buit uit een kamp is terug in het bereik van zijn dorp (T.inBouwBereik, js/begin.js): hij legt hem neer
  // als een losse stapel, en de dragers brengen hem binnen (een waar telt pas als hij binnen is).
  function brengBuit(D) {
    let nog = false;
    for (const e of T.mannenVan(D)) {
      if (!e.buit) continue;
      if (!T.inBouwBereik(D, e.tx, e.ty)) {
        nog = true;
        continue;
      }
      const waren = Object.keys(e.buit);
      T.legLosseStapel(D, T.tegelVan(e), e.buit);
      T.zeg(D, T.t("{naam} brings home {buit} from the robbers' camp.", { naam: e.naam, buit: T.opsomming(waren.map((wat) => T.hoeveel(Math.round(e.buit[wat]), wat))) }), 'goed', T.tegelVan(e));
      delete e.buit;
    }
    if (!nog) delete D.buitOnderweg;
  }

  // Elke nacht van de kampen: is er een jaar van het spel om, dan komt er in elk kamp een man van buiten bij, tot
  // `kampMeest` (de getallen van het rooster); en wie in een gevecht gewond raakte, heeft weer al zijn leven (vraag 11).
  function tikKampenDag(w, dag) {
    const jaar = Math.floor(dag / T.DAGEN_PER_JAAR);
    for (const K of w.kampen) {
      if (jaar <= K.jaar || K.verslagen) continue;
      K.jaar = jaar;
      for (let i = 0; i < IN().kampErbijPerJaar && K.bende.length < IN().kampMeest; i++) vanBuiten(K);
    }
    for (const e of w.wezens) if (e.kamp != null && e.rover && !e.dood && !e.doelwit && e.maxLeven > 0) e.leven = e.maxLeven;
  }

  // Wat de mannen van kamp K doen. Wie erbij kwam (van buiten, of uit een dorp), komt over het paadje het kamp in, en de
  // tenten volgen de bende. Overdag staat iedereen op zijn plek, met zijn gezicht naar het vuur; 's nachts slaapt hij in
  // zijn tent, behalve de wacht (elke nacht een ander) en wie geen tent heeft (N1). Heeft een van hen een vijand (zijn
  // gevecht kiest die, js/gevecht.js), dan komt iedereen naar buiten, en slaapt niemand tot `wakkerUren` erna. Is er niemand
  // van een dorp binnen `rustVerder` (om de twee seconden gevraagd), dan kijken ze niet om zich heen (e.ver; zoals het
  // wild): dan kost een kamp ver weg bijna niets.
  function werkKampBij(S, w, K, mannen, dag) {
    if (K.verslagen) return neemBuit(S, w, K);
    zetTenten(w, K);
    if (mannen.length < K.bende.length) {
      const er = new Set(mannen.map((e) => e.lid));
      for (const lid of K.bende) if (!er.has(lid.id) && !lid.opPad) mannen.push(zetMan(w, K, lid, aankomst(w, K)));
    }
    const t = S.wereldTijd || 0;
    if (t >= (K.keekVer || 0)) {
      K.keekVer = t + 2;
      K.ver = !w.wezens.some((m) => m.dorp && !m.dood && T.afstand(T.tegelVan(m), K) <= IN().rustVerder);
    }
    if (mannen.some((e) => e.doelwit)) K.wakker = dag + IN().wakkerUren / 24;
    const slapen = dag >= K.wakker && isNacht(dag);
    const wacht = slapen && K.bende.length ? K.bende[nachtVan(dag) % K.bende.length].id : null;
    for (const e of mannen) {
      e.ver = K.ver;
      if (e.doelwit) continue;
      const i = K.bende.findIndex((l) => l.id === e.lid);
      if (i < 0) continue;
      if (K.bende[i].opPad) {
        gaatOpPad(S, w, K, e);
        continue;
      }
      const tent = Math.floor(i / IN().manPerTent);
      if (slapen && e.lid !== wacht && tent < K.tenten) naarBinnen(S, w, e, tentPlekken(w, K)[tent].deur);
      else naarBuiten(S, w, K, e, plekVan(w, K, K.bende[i]));
    }
  }
  // Of het nacht is (van het slapen tot het opstaan, T.dagindeling in js/dag.js), en de nacht waarin het is (de dag van
  // de avond waarmee hij begon, plus een vast getal, zodat het nooit onder nul komt): de wacht blijft de hele nacht dezelfde.
  function isNacht(dag) {
    const d = T.dagindeling(dag);
    const u = T.uurVanDag(dag);
    return u >= d.slapen || u < d.opstaan;
  }
  const nachtVan = (dag) => Math.floor(dag) - (T.uurVanDag(dag) < 12 ? 1 : 0) + 1000;
  // Op pad (c3): hij loopt het paadje af tot de rand van de open plek (aankomst, zoals wie erbij komt), en is daar uit
  // beeld; verder reist hij buiten beeld (de overval).
  function gaatOpPad(S, w, K, e) {
    if (e.binnen) {
      if (T.wezenOp(w, e.tx, e.ty, e)) return;
      e.binnen = false;
      e.deurSinds = S.tijd;
    }
    if (!e.naarRand) e.naarRand = aankomst(w, K);
    if (T.afstand(T.tegelVan(e), e.naarRand) <= 1) w.wezens.splice(w.wezens.indexOf(e), 1);
    else if (!e.pad.length && !e.onderweg) stuurKamp(S, w, e, e.naarRand);
  }
  // Naar zijn tent: bij de deur (of ernaast, als een ander erin staat) gaat hij naar binnen; js/tekenen.js laat hem de deur
  // in stappen, zoals een dorpeling (js/verkennen.js).
  function naarBinnen(S, w, e, deur) {
    if (e.binnen || e.onderweg) return;
    if (T.afstand(T.tegelVan(e), deur) <= 1) {
      e.binnen = true;
      e.deur = { x: deur.x, y: deur.y };
      e.deurSinds = S.tijd;
      e.pad = [];
      return;
    }
    if (!e.pad.length) stuurKamp(S, w, e, deur);
  }
  // Naar buiten, en naar zijn plek om het vuur; daar kijkt hij naar het vuur. Staat er een ander op zijn plek, dan blijft
  // hij ernaast staan.
  function naarBuiten(S, w, K, e, plek) {
    if (e.binnen) {
      if (T.wezenOp(w, e.tx, e.ty, e)) return;
      e.binnen = false;
      e.deurSinds = S.tijd;
    }
    if (e.onderweg || e.pad.length) return;
    const ver = T.afstand(T.tegelVan(e), plek);
    if (ver === 0 || (ver === 1 && T.wezenOp(w, plek.x, plek.y, e))) e.kijkt = { x: K.x, y: K.y };
    else stuurKamp(S, w, e, plek);
  }
  // Een pad voor een man van een kamp, zoals een rover van een overval (stuur), maar niet vaker dan om de twee seconden
  // (e.zoektWeg, zoals het wild): vindt hij geen weg, dan zoekt hij niet elke tik opnieuw.
  function stuurKamp(S, w, e, doel) {
    const t = S.wereldTijd || 0;
    if (t < (e.zoektWeg || 0)) return;
    e.zoektWeg = t + 2;
    const naast = T.wezenOp(w, doel.x, doel.y, e) != null;
    const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, doel, { naast });
    if (pad && pad.length) T.geefRoute(e, pad, { x: doel.x, y: doel.y, naast });
  }

  // De buit van de roverskampen op kaart w die er staan, om te tekenen (js/tekenen.js; Marcel, 27 okt: "B ja", "ik wil een
  // grotere buit zien" en "b"): een hoop naast het vuur (buitPlek), klein, middel of groot naar hoeveel er ligt
  // (`buitMaten`; gereedschap/pixelart/buit.cjs), zolang er iets ligt, ook in een kamp dat nog leeft (wat ze thuisbrachten,
  // c3). Met `wat` en `vol` voor wie hem zonder dat vel als losse stapel tekent. Alleen beeld: je loopt erover.
  T.roverskampenBuit = function (w) {
    const uit = [];
    for (const K of (w && w.kampen) || []) {
      if (!K.staat) continue;
      let n = 0;
      let wat = null;
      for (const k of Object.keys(K.buit)) {
        n += K.buit[k];
        if (!wat || K.buit[k] > K.buit[wat]) wat = k;
      }
      const [klein, middel] = IN().buitMaten;
      const maat = n < klein ? 'klein' : n < middel ? 'middel' : 'groot';
      if (n >= 0.5) uit.push({ ...buitPlek(K), wat, vol: n / T.KAR_INSTELLINGEN.stapelVol, maat });
    }
    return uit;
  };

  // Het vuur van roverskamp K: het brandt als het donker is, en smeult overdag; van een verslagen kamp is het uit (c4).
  T.roverskampVuur = (dag, K) => (K && K.verslagen ? 'uit' : T.lichtVan(dag).nacht > 0 ? 'brandt' : 'smeult');
  // Het licht van de roverskampen op kaart w die er staan, voor T.lichtBronnen (js/zien.js): 's avonds en 's nachts, zoals
  // het kampvuur van het lege begin (T.BEGIN_INSTELLINGEN.vuur). Zo zie je in het donker een gloed in het bos, waar je het
  // land kent.
  T.roverskampenLicht = function (w, dag) {
    if (!w || !w.kampen || T.roverskampVuur(dag) !== 'brandt') return [];
    const L = T.BEGIN_INSTELLINGEN.vuur;
    const uit = [];
    for (const K of w.kampen) {
      if (!K.staat || K.verslagen) continue;
      uit.push({ x: K.x, y: K.y, straal: L.straal, beeldStraal: L.beeldStraal, sterkte: L.sterkte, soort: 'kampvuur' });
      // de fakkels bij de poort van het hol (de aankleding): een kleiner licht
      for (const q of K.spullen || []) if (q.soort === 'fakkel') uit.push({ x: q.x, y: q.y, straal: L.straal * 0.5, beeldStraal: L.beeldStraal * 0.5, sterkte: L.sterkte * 0.7, soort: 'kampvuur' });
    }
    return uit;
  };
})(globalThis.Spel = globalThis.Spel || {});
