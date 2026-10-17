// De rovers en de militie (stap 4 van de proef "van gehucht tot dorp"; werklijst vraag 55, Marcel, 29 sep: "A, Ja
// en ook 'wilde' rovers. B, ze roven de velden, graan etc ook maken ze soms velden kapot. C, Ja. D, mensen kunnen
// sterven").
//
// Wie wegtrekt (js/bewoners.js), gaat naar het dichtste roverskamp en wordt rover: de jongeren en de volwassenen, met
// hun naam en hun uiterlijk (werklijst vraag 170, stap 6a2, c2; hieronder, bij de roverskampen). Een overval komt nog
// van wilde rovers van buiten, op een dag die je niet ziet aankomen (in c3 komt hij uit een kamp).
//
// Een aanval (S.rovers.aanval) gaat zo: op een uur dat je niet ziet aankomen, vaker in het donker (werklijst vraag 170,
// stap 4; Marcel, 16 okt: D2), komen ze van de rand van de kaart die het dichtst bij een akker ligt, lopen erheen,
// roven er een paar uur, en gaan weg met graan uit de voorraad; soms maken ze de akker kapot (wat erop staat, groeit
// dit jaar niet meer: T.vertrapAkker, js/akkers.js). Een bericht zegt het, met de plek, en de tijd gaat naar 1×
// (T.bezoekerKomtAan, js/dag.js). Er komt niemand vanzelf (werklijst vraag 170, stap 2; Marcel, 15 okt: "Niemand
// vanzelf"): jij stuurt je soldaten (js/kiezen.js), en het gevecht is in real time (js/gevecht.js): een rover slaat wie
// hij tegenkomt, en een dorpeling die hem ziet, vlucht naar het town hall. Wie valt, is dood: een rover is uit zijn
// bende, een soldaat of een dorpeling is een mond minder (T.sneuvelt), en valt de aanvoerder, dan is het spel uit. Wie het
// overleeft, staat de volgende ochtend weer met al zijn leven op (werklijst vraag 11).
//
// Zonder scherm, en dus getoetst (test/rovers.test.cjs).
(function (T) {
  'use strict';

  T.ROVERS_INSTELLINGEN = {
    // Wilde rovers, van buiten: gemiddeld zo vaak per jaar, op een dag tussen de helft en anderhalf keer de tijd
    // ertussen, en niet in de eerste zoveel dagen van een spel. Ze bouwen langzaam op (Marcel, 29 sep, vraag 57):
    // het eerste jaar van je ambt komen ze met zoveel man, elk jaar daarna met zoveel meer, en nooit met meer dan
    // zoveel.
    wildePerJaar: 2,
    eersteWildeNa: 60,
    wildeEerst: 2,
    wildeErbijPerJaar: 1,
    wildeMeest: 4,
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
    // De roverskampen (werklijst vraag 170, stap 6a2, c1 en c2; waar ze liggen: T.EILAND_INSTELLINGEN.kampen): een kamp
    // begint met zoveel man, en elk jaar van het spel komen er zoveel van buiten bij, tot zoveel (de getallen van de wilde
    // rovers); wie uit een dorp wegtrekt, komt er altijd bij (Marcel, 17 okt: H2). Een tent per zoveel man, zolang het
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
  };
  const IN = () => T.ROVERS_INSTELLINGEN;

  const uurNu = (D) => (D.kalender ? D.kalender.dag * 24 : 0);
  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  // Een getal 0..1, vast per spel, per dag en per vraag `n`, zodat een speeltest met
  // hetzelfde zaad hetzelfde jaar speelt.
  const lot = (D, dag, n) => T.dobbelsteen(((D.lot && D.lot.zaad) || 1) * 37 + Math.floor(dag) * 7919 + n)();


  T.nieuweRovers = () => ({ wildeOp: null, aanval: null });

  // Alleen in het gehucht zelf: een wereld met akkers. Een proefkaart (?kaart=proef) heeft geen rovers.
  const heeftRovers = (D) => !!(D.wereld && T.veldenVan(D).length);

  // ---------------------------------------------------------------------------------------------
  // Wie rover wordt, en wanneer ze komen
  // ---------------------------------------------------------------------------------------------

  // Wie wegtrekt (js/bewoners.js, gaanWeg): een jongere of volwassene gaat naar het roverskamp dat het dichtst bij het
  // plein van zijn dorp ligt, met zijn naam en zijn uiterlijk, ook als het al vol is (Marcel, 17 okt: H2). Hij loopt het
  // dorp uit, en staat dezelfde dag in het kamp (T.werkKampenBij). Geeft het kamp, of null (een kaart zonder kampen).
  T.wordtRover = function (D, p) {
    if (p.leeftijd !== 'jong' && p.leeftijd !== 'volwassen') return null;
    const kampen = kampenVan(D.wereld, dagNu(D));
    const plein = T.pleinVan(D);
    if (!kampen.length || !plein) return null;
    const K = kampen.reduce((a, b) => (T.afstand(b, plein) < T.afstand(a, plein) ? b : a));
    const vel = (p.wezen && p.wezen.vel) || T.LEEFTIJDEN[p.leeftijd][p.geslacht] || null;
    K.bende.push({ id: K.geteld++, naam: p.naam, vel, uit: (D.plek && D.plek.naam) || null });
    return K;
  };

  // Hoeveel dagen er tussen twee keer wilde rovers zitten, en de eerste keer in een spel.
  const gemiddeldTussen = () => (IN().wildePerJaar > 0 ? T.DAGEN_PER_JAAR / IN().wildePerJaar : Infinity);
  const wildeTussen = (D, dag) => Math.max(1, Math.round(gemiddeldTussen() * (0.5 + lot(D, dag, 5))));
  const eersteWilde = (D, dag) => dag + IN().eersteWildeNa + Math.round(gemiddeldTussen() * lot(D, dag, 6));
  // Op welk uur van deze dag ze komen (D2): met nachtKans 's nachts, van middernacht tot het opstaan of van het slapen
  // tot middernacht (T.dagindeling, js/dag.js), anders tussen het opstaan en het slapen.
  function aanvalsUur(D, dag) {
    const d = T.dagindeling(dag);
    const r = lot(D, dag, 7);
    if (lot(D, dag, 8) >= IN().nachtKans) return d.opstaan + r * (d.slapen - d.opstaan);
    const u = r * (d.opstaan + 24 - d.slapen);
    return u < d.opstaan ? u : d.slapen + (u - d.opstaan);
  }
  // Met hoeveel man ze komen: elk jaar van je ambt met een man meer (dag 0 is de dag van je benoeming).
  const wildeAantal = (dag) =>
    Math.min(IN().wildeMeest, IN().wildeEerst + Math.floor(dag / T.DAGEN_PER_JAAR) * IN().wildeErbijPerJaar);

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js): de doden van gisteren worden begraven, wie het overleefde staat
  // weer op met al zijn leven, en er wordt bepaald of er vandaag rovers komen.
  T.tikRoversDag = function (D, dag) {
    if (!heeftRovers(D)) return;
    const R = D.rovers || (D.rovers = T.nieuweRovers());
    begraaf(D);
    if (!R.aanval) genees(D);
    if (R.wildeOp == null) R.wildeOp = eersteWilde(D, dag);
    if (R.aanval) return;
    if (dag >= R.wildeOp) {
      R.aanval = { soort: 'wild', dag, fase: 'wacht', aantal: wildeAantal(dag), uur: aanvalsUur(D, dag) };
      R.wildeOp = dag + wildeTussen(D, dag);
    }
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

  // Een rover valt (T.valt, js/gevecht.js): was hij van een roverskamp, dan is hij uit zijn bende.
  T.roverVerslagen = function (D, e) {
    const K = T.kampVan(D.wereld, e);
    if (K) K.bende = K.bende.filter((l) => l.id !== e.lid);
  };

  // ---------------------------------------------------------------------------------------------
  // Een aanval
  // ---------------------------------------------------------------------------------------------

  // Waar ze het land van dorp D op komen: de begaanbare tegel aan de rand van zijn land (T.dorpVak) die het dichtst bij
  // de akker ligt, en vanwaar ze er ook echt heen kunnen. Of null.
  T.roverIngang = function (D, veld) {
    const w = D.wereld;
    const midden = { x: veld.x + Math.floor(veld.b / 2), y: veld.y + Math.floor(veld.h / 2) };
    const rand = [];
    const vak = T.dorpVak(D);
    for (let x = vak.x; x < vak.x + vak.b; x++) rand.push({ x, y: vak.y }, { x, y: vak.y + vak.h - 1 });
    for (let y = vak.y + 1; y < vak.y + vak.h - 1; y++) rand.push({ x: vak.x, y }, { x: vak.x + vak.b - 1, y });
    const kan = rand.filter((t) => T.isBegaanbaar(w, t.x, t.y, {})).sort((a, b) => T.afstand(a, midden) - T.afstand(b, midden));
    for (const t of kan.slice(0, 12)) {
      if (T.zoekRoute(w, t, midden, { naast: true })) return t;
    }
    return null;
  };

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

  // Een rover op plek, met het uiterlijk vel; een van een overval hoort bij het dorp dat hij overvalt (D), een van een kamp
  // bij geen dorp (D null; zetMan, bij de roverskampen).
  function maakRover(D, vel, plek) {
    const e = T.maakWezen('rover', plek.x, plek.y);
    e.rover = true;
    if (D) e.dorp = D; // de rovers van een overval op dit dorp (T.hoortBij, js/wereld.js)
    e.vel = vel || T.LEEFTIJDEN.volwassen.man;
    return e;
  }

  // Het begin: de rovers komen de kaart op, en het dorp ziet ze. Wie soldaten heeft, hoort hoe hij ze stuurt.
  function begin(D, A) {
    const w = D.wereld;
    const R = D.rovers;
    // Een akker om te roven (geen weide of braak), en waar ze de kaart op komen. Is er geen, dan komen ze niet.
    // A.veld is het nummer van het veld onder de velden van het dorp (T.veldenVan, js/boerderij.js).
    const velden = T.veldenVan(D);
    const akkers = velden.map((a, i) => i).filter((i) => T.bestemmingVan(velden[i]) === 'akker');
    A.veld = akkers.length ? akkers[Math.floor(lot(D, A.dag, 1) * akkers.length)] : null;
    const ingang = A.veld != null ? T.roverIngang(D, velden[A.veld]) : null;
    if (!ingang) {
      R.aanval = null;
      return;
    }
    A.ingang = ingang;
    const aantal = A.aantal || 1;
    A.rovers = [];
    for (let i = 0; i < aantal; i++) {
      const e = maakRover(D, wildVel(D, A.dag, i), plekBij(w, ingang));
      w.wezens.push(e);
      A.rovers.push(e);
    }
    A.fase = 'komen';
    A.sinds = uurNu(D);
    R.laatsteAanval = A.dag; // de raad zegt dan een tijd lang wat een wachthuis doet (js/raad.js)
    const boer = T.boerVanVeld(D, velden[A.veld]);
    const akker = boer ? T.t('the field of {boer}', { boer: boer.naam }) : T.t('the field');
    const wie = T.t('{n|A wild robber turns up|{aantal} wild robbers turn up}', { n: aantal, aantal: T.hoofdletter(T.telwoord(aantal)) });
    // Er komt niemand vanzelf (vraag 170, stap 2): wie soldaten heeft, hoort hoe hij ze stuurt (js/kiezen.js).
    const hulp = T.militieVan(D).length ? ` ${T.t('Choose your soldiers, and right-click a robber.')}` : '';
    const veld = velden[A.veld];
    const plek = { x: veld.x + Math.floor(veld.b / 2), y: veld.y + Math.floor(veld.h / 2) };
    T.bezoekerKomtAan(D, { meteen: true, aankomst: { tekst: T.t('Robbers are coming. {wie}, heading for {akker}.{hulp}', { wie, akker, hulp }), soort: 'gevaar', naarGewoon: true, plek } });
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
    A.ingang = uitgang;
    const aantal = T.BODE_INSTELLINGEN.rovers.aanvallers;
    A.rovers = [];
    for (let i = 0; i < aantal; i++) {
      const e = maakRover(D, wildVel(D, A.dag, i), plekBij(w, uitgang));
      w.wezens.push(e);
      A.rovers.push(e);
    }
    A.fase = 'roven';
    A.sinds = uurNu(D);
    A.roofTot = uurNu(D) + T.BODE_INSTELLINGEN.hinderlaag.uren;
    R.laatsteAanval = A.dag;
    for (const e of wezens) {
      e.aangehouden = { x: e.tx, y: e.ty };
      if (!e.onderweg) e.pad = [];
    }
    const naam = T.naamVanBewoner(B.wie[0]);
    const wie = T.t('{aantal} robbers', { aantal: T.hoofdletter(T.telwoord(aantal)) });
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

  // Wilde rovers zien eruit als gewone mensen van buiten: mannen en vrouwen, jong en volwassen.
  function wildVel(D, dag, i) {
    const leeftijd = lot(D, dag, 20 + i) < 0.7 ? 'volwassen' : 'jong';
    return T.LEEFTIJDEN[leeftijd][lot(D, dag, 40 + i) < 0.75 ? 'man' : 'vrouw'];
  }

  // Een pad voor een rover naar (x, y), of naast die tegel als hij bezet is; om wat vaststaat, en wie er onderweg staat,
  // lost hij onderweg op (js/lopen.js).
  function stuur(D, e, doel) {
    const w = D.wereld;
    const naast = T.wezenOp(w, doel.x, doel.y, e) != null;
    const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, doel, { naast });
    if (pad && pad.length) T.geefRoute(e, pad, { x: doel.x, y: doel.y, naast });
  }

  const opVeld = (veld, e) => e.tx >= veld.x && e.tx < veld.x + veld.b && e.ty >= veld.y && e.ty < veld.y + veld.h;

  // Het roven zelf: graan uit de voorraad, en soms is de akker kapot.
  function roof(D, A, levend) {
    const veld = T.veldenVan(D)[A.veld];
    const graan = Math.min((D.voorraad && D.voorraad.graan) || 0, levend.length * IN().graanPerRover);
    if (graan > 0) T.wijzigVoorraad(D, 'graan', -graan);
    const kapot = lot(D, A.dag, 3) < IN().kansAkkerKapot ? T.vertrapAkker(veld) : 0;
    const boer = T.boerVanVeld(D, veld);
    const weg = graan > 0 ? T.t('The robbers make off with {buit}.', { buit: T.hoeveel(Math.round(graan), 'graan') }) : T.t('The robbers make off empty-handed.');
    const vertrapt = !kapot ? '' : ` ${boer ? T.t('The field of {boer} has been trampled: whatever stood on it is gone.', { boer: boer.naam }) : T.t('The field has been trampled: whatever stood on it is gone.')}`;
    T.zeg(D, `${weg}${vertrapt}`, 'gevaar');
    A.buit = { graan, kapot };
  }

  // Het eind van een aanval: wie nog leeft, is de kaart af.
  function eind(D) {
    D.rovers.aanval = null;
  }

  // Elke tik (T.werkDorpBij, js/dorp.js): de aanval loopt, van komen tot weggaan. Wie vecht (e.doelwit), laat het gevecht
  // lopen (js/gevecht.js); laat hij zijn doel gaan, dan gaat hij verder met wat hij deed.
  T.werkRoversBij = function (S, D) {
    const A = D.rovers && D.rovers.aanval;
    if (!A || !heeftRovers(D)) return;
    const w = D.wereld;
    if (A.fase === 'wacht') {
      if (S.modus !== 'verkennen') return;
      if (A.soort === 'hinderlaag') return beginHinderlaag(D, A);
      // Een aanval uit een spel van voor 16 okt heeft nog geen uur.
      if (!A.meteen && uurNu(D) < A.dag * 24 + (A.uur != null ? A.uur : aanvalsUur(D, A.dag))) return;
      begin(D, A);
      return;
    }
    const levend = A.rovers.filter((e) => !e.dood && w.wezens.includes(e));
    const vrij = levend.filter((e) => !e.doelwit);
    if (!levend.length) {
      if (A.soort === 'hinderlaag') laatDeBodeGaan(D);
      eind(D);
      return;
    }
    if (A.soort === 'hinderlaag' && A.fase === 'roven') return werkHinderlaagBij(D, A, levend);
    const veld = T.veldenVan(D)[A.veld];
    if (A.fase === 'komen') {
      for (const e of vrij) if (!e.pad.length && !e.onderweg && !opVeld(veld, e)) stuur(D, e, { x: veld.x + Math.floor(veld.b / 2), y: veld.y + Math.floor(veld.h / 2) });
      if (levend.some((e) => opVeld(veld, e))) {
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
  //         hij om het vuur staat) }], geteld (het id van de volgende), jaar (het jaar van het spel dat er het laatst een
  //         bij kwam), wakker (de dag tot wanneer niemand slaapt: er was een vijand), ver (er is niemand van een dorp in de
  //         buurt; keekVer: wanneer het weer kijkt) }
  // Een man van een kamp op de kaart is een rover zonder dorp: e.rover, e.kamp (het nummer van zijn kamp) en e.lid (zijn
  // id in de bende). De wereld werkt hem bij, één keer per kaart (T.werkKampenBij); vechten doet hij in
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
    const K = { nr: k.nr, x: k.x, y: k.y, staat: false, tenten: 0, lot: { zaad }, bende: [], geteld: 0, jaar: Math.floor(dag / T.DAGEN_PER_JAAR), wakker: 0 };
    for (let i = 0; i < IN().kampBende; i++) vanBuiten(K);
    return K;
  }
  // Er komt een man van buiten bij: een jongere of volwassene, meest mannen (zoals de wilde rovers, wildVel), met een
  // voornaam die nog niet in de bende is; alles uit de dobbelsteen van het kamp.
  function vanBuiten(K) {
    const leeftijd = T.toeval(K) < 0.7 ? 'volwassen' : 'jong';
    const geslacht = T.toeval(K) < 0.75 ? 'man' : 'vrouw';
    const lijst = T.VOORNAMEN[geslacht];
    const vrij = lijst.filter((n) => !K.bende.some((l) => l.naam === n));
    const uit = vrij.length ? vrij : lijst;
    K.bende.push({ id: K.geteld++, naam: uit[Math.floor(T.toeval(K) * uit.length)], vel: T.LEEFTIJDEN[leeftijd][geslacht], uit: null });
  }
  // Het kamp van wezen e op kaart w (een man van een kamp), of null; en zijn plaats in de bende.
  T.kampVan = (w, e) => (e && e.kamp != null && w && w.kampen ? w.kampen.find((K) => K.nr === e.kamp) || null : null);
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
      if (K.staat || !kampLandOpen(w, k)) continue;
      K.staat = true;
      T.zetVoorwerp(w, { soort: 'kampvuur', x: k.x, y: k.y, kamp: k.nr });
      zetTenten(w, K, k);
      for (const lid of K.bende) zetMan(w, K, lid, plekVan(w, K, lid));
      uit.push(K);
    }
    return uit;
  };
  // Is het land om kamp k open: elk stuk dat zijn open plek raakt?
  function kampLandOpen(w, k) {
    const r = T.EILAND_INSTELLINGEN.kampen.open;
    for (let sy = Math.floor((k.y - r) / T.STUK); sy <= Math.floor((k.y + r) / T.STUK); sy++) {
      for (let sx = Math.floor((k.x - r) / T.STUK); sx <= Math.floor((k.x + r) / T.STUK); sx++) {
        if (!w.open.has(T.stukNummer(sx, sy))) return false;
      }
    }
    return true;
  }
  // Een tent per `manPerTent` man, op de plekken die het eiland gaf, op volgorde; ze gaan niet weer neer als er een valt
  // (dat is c4). Staat er iemand waar een tent komt, dan komt hij een tik later.
  function zetTenten(w, K, k) {
    const nodig = Math.min(k.tenten.length, Math.ceil(K.bende.length / IN().manPerTent));
    while (K.tenten < nodig) {
      const t = k.tenten[K.tenten];
      for (let y = t.voet.y; y < t.voet.y + t.voet.h; y++) for (let x = t.voet.x; x < t.voet.x + t.voet.b; x++) if (T.wezenOp(w, x, y)) return;
      const voet = { dx: t.voet.x - t.x, dy: t.voet.y - t.y, b: t.voet.b, h: t.voet.h };
      T.zetVoorwerp(w, { soort: 'tent', x: t.x, y: t.y, vorm: 'tent-rover', richting: t.open, voet, kamp: k.nr });
      K.tenten++;
    }
  }
  // Waar een man om het vuur staat: zijn eigen plek tussen `rondHetVuur` tegels ervan, op het plein, niet op een tentplek
  // (ook een die er nog niet staat) of de tegel voor zijn opening, niet op het paadje, en niet die van een ander; met een
  // vaste worp uit het zaad van het kamp en zijn id (de dobbelsteen van het kamp rolt er niet door: wie er later bijkomt,
  // is dezelfde, of je het kamp nu zag of niet), en dan onthouden (lid.plek).
  function plekVan(w, K, lid) {
    if (lid.plek) return lid.plek;
    const E = eilandKampen(w);
    const k = E.kampen[K.nr];
    const pad = E.paden.find((p) => p.kamp === K.nr);
    const nee = new Set();
    for (const t of k.tenten) {
      nee.add(`${t.deur.x},${t.deur.y}`);
      for (let y = t.voet.y; y < t.voet.y + t.voet.h; y++) for (let x = t.voet.x; x < t.voet.x + t.voet.b; x++) nee.add(`${x},${y}`);
    }
    for (const l of K.bende) if (l.plek) nee.add(`${l.plek.x},${l.plek.y}`);
    const [van, tot] = IN().rondHetVuur;
    const kan = [];
    for (let y = Math.floor(K.y - tot); y <= K.y + tot; y++) {
      for (let x = Math.floor(K.x - tot); x <= K.x + tot; x++) {
        const d = Math.hypot(x - K.x, y - K.y);
        if (d < van || d > tot || nee.has(`${x},${y}`) || (pad && totPad(pad.punten, x, y) < 1.5) || !T.isBegaanbaar(w, x, y, {})) continue;
        kan.push({ x, y });
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
    const e = maakRover(null, lid.vel, plekBij(w, plek));
    e.kamp = K.nr;
    e.lid = lid.id;
    e.kijkt = { x: K.x, y: K.y };
    w.wezens.push(e);
    return e;
  }

  // Elke tik, één keer per kaart (T.wereldTik, js/tik.js), na het zetten van de kampen: elke nacht van de kampen (ook waar
  // je niet bent), en wat de mannen doen in een kamp dat er staat.
  T.werkKampenBij = function (S, w) {
    if (!w.kampen || !S.kalender) return;
    const dag = S.kalender.dag;
    if (w.kampenDag == null) w.kampenDag = Math.floor(dag);
    while (w.kampenDag < Math.floor(dag)) tikKampenDag(w, ++w.kampenDag);
    if (!w.kampen.some((K) => K.staat)) return;
    const mannen = new Map(); // nummer van het kamp → zijn mannen op de kaart
    for (const e of w.wezens) {
      if (e.kamp == null || !e.rover || e.dood) continue;
      const lijst = mannen.get(e.kamp);
      if (lijst) lijst.push(e);
      else mannen.set(e.kamp, [e]);
    }
    const E = eilandKampen(w);
    for (const K of w.kampen) if (K.staat) werkKampBij(S, w, K, E.kampen[K.nr], mannen.get(K.nr) || [], dag);
  };

  // Elke nacht van de kampen: is er een jaar van het spel om, dan komt er in elk kamp een man van buiten bij, tot
  // `kampMeest` (de getallen van de wilde rovers); en wie in een gevecht gewond raakte, heeft weer al zijn leven (vraag 11).
  function tikKampenDag(w, dag) {
    const jaar = Math.floor(dag / T.DAGEN_PER_JAAR);
    for (const K of w.kampen) {
      if (jaar <= K.jaar) continue;
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
  function werkKampBij(S, w, K, k, mannen, dag) {
    zetTenten(w, K, k);
    if (mannen.length < K.bende.length) {
      const er = new Set(mannen.map((e) => e.lid));
      for (const lid of K.bende) if (!er.has(lid.id)) mannen.push(zetMan(w, K, lid, aankomst(w, K)));
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
      const tent = Math.floor(i / IN().manPerTent);
      if (slapen && e.lid !== wacht && tent < K.tenten) naarBinnen(S, w, e, k.tenten[tent].deur);
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

  // Het vuur van een roverskamp: het brandt als het donker is, en smeult overdag.
  T.roverskampVuur = (dag) => (T.lichtVan(dag).nacht > 0 ? 'brandt' : 'smeult');
  // Het licht van de roverskampen op kaart w die er staan, voor T.lichtBronnen (js/zien.js): 's avonds en 's nachts, zoals
  // het kampvuur van het lege begin (T.BEGIN_INSTELLINGEN.vuur). Zo zie je in het donker een gloed in het bos, waar je het
  // land kent.
  T.roverskampenLicht = function (w, dag) {
    if (!w || !w.kampen || T.roverskampVuur(dag) !== 'brandt') return [];
    const L = T.BEGIN_INSTELLINGEN.vuur;
    return w.kampen.filter((K) => K.staat).map((K) => ({ x: K.x, y: K.y, straal: L.straal, beeldStraal: L.beeldStraal, sterkte: L.sterkte, soort: 'kampvuur' }));
  };
})(globalThis.Spel = globalThis.Spel || {});
