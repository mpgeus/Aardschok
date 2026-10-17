// De rovers en de militie (stap 4 van de proef "van gehucht tot dorp"; werklijst vraag 55, Marcel, 29 sep: "A, Ja
// en ook 'wilde' rovers. B, ze roven de velden, graan etc ook maken ze soms velden kapot. C, Ja. D, mensen kunnen
// sterven").
//
// Wie wegtrekt (js/bewoners.js), gaat het bos in en wordt rover: de jongeren en de volwassenen, met hun naam en hun
// uiterlijk (S.rovers.bende). Na een tijd komen ze terug, en daarna om de zoveel dagen weer, zolang er een van hen
// leeft. Daarnaast komen er wilde rovers van buiten, op een dag die je niet ziet aankomen.
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
    // Wie wegtrok, komt na zoveel dagen terug, en daarna, zolang er nog iemand van de bende leeft, om de zoveel
    // dagen weer.
    terugNaDagen: 10,
    opnieuwNaDagen: 20,
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
    // De roverskampen (werklijst vraag 170, stap 6a2, c1; waar ze liggen: T.EILAND_INSTELLINGEN.kampen): een kamp begint
    // met zoveel man (zijn bende komt in c2), en heeft een tent per zoveel man.
    kampBende: 2,
    manPerTent: 2,
  };
  const IN = () => T.ROVERS_INSTELLINGEN;

  const uurNu = (D) => (D.kalender ? D.kalender.dag * 24 : 0);
  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  // Een getal 0..1, vast per spel, per dag en per vraag `n`, zodat een speeltest met
  // hetzelfde zaad hetzelfde jaar speelt.
  const lot = (D, dag, n) => T.dobbelsteen(((D.lot && D.lot.zaad) || 1) * 37 + Math.floor(dag) * 7919 + n)();


  T.nieuweRovers = () => ({ bende: [], bendeOp: null, wildeOp: null, aanval: null });

  // Alleen in het gehucht zelf: een wereld met akkers. Een proefkaart (?kaart=proef) heeft geen rovers.
  const heeftRovers = (D) => !!(D.wereld && T.veldenVan(D).length);

  // ---------------------------------------------------------------------------------------------
  // Wie rover wordt, en wanneer ze komen
  // ---------------------------------------------------------------------------------------------

  // Wie wegtrekt (js/bewoners.js, gaanWeg): een jongere of volwassene gaat het bos in, en komt terug als rover.
  T.wordtRover = function (D, p) {
    if (p.leeftijd !== 'jong' && p.leeftijd !== 'volwassen') return;
    const R = D.rovers || (D.rovers = T.nieuweRovers());
    R.bende.push({ id: p.id, naam: p.naam, vel: (p.wezen && p.wezen.vel) || T.LEEFTIJDEN[p.leeftijd][p.geslacht] || null });
    if (R.bendeOp == null) R.bendeOp = dagNu(D) + IN().terugNaDagen;
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
    if (R.bende.length && R.bendeOp != null && dag >= R.bendeOp) {
      R.aanval = { soort: 'bende', dag, fase: 'wacht', uur: aanvalsUur(D, dag) };
      R.bendeOp = dag + IN().opnieuwNaDagen;
    } else if (dag >= R.wildeOp) {
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

  // Een rover valt (js/gevecht.js, sterf): kwam hij uit het gehucht, dan is hij uit de bende.
  T.roverVerslagen = function (D, e) {
    const R = D.rovers;
    if (!R || e.lid == null) return;
    R.bende = R.bende.filter((l) => l.id !== e.lid);
    if (!R.bende.length) R.bendeOp = null;
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

  function maakRover(D, lid, plek) {
    const e = T.maakWezen('rover', plek.x, plek.y);
    e.rover = true;
    e.dorp = D; // de rovers van een overval op dit dorp (T.hoortBij, js/wereld.js)
    e.lid = lid.id != null ? lid.id : null;
    e.vel = lid.vel || T.LEEFTIJDEN.volwassen.man;
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
    const leden = A.soort === 'bende' ? R.bende.slice() : Array.from({ length: A.aantal || 1 }, (_, i) => ({ vel: wildVel(D, A.dag, i) }));
    A.rovers = [];
    for (const lid of leden) {
      const e = maakRover(D, lid, plekBij(w, ingang));
      w.wezens.push(e);
      A.rovers.push(e);
    }
    A.fase = 'komen';
    A.sinds = uurNu(D);
    R.laatsteAanval = A.dag; // de raad zegt dan een tijd lang wat een wachthuis doet (js/raad.js)
    const boer = T.boerVanVeld(D, velden[A.veld]);
    const akker = boer ? T.t('the field of {boer}', { boer: boer.naam }) : T.t('the field');
    const wie = A.soort === 'bende'
      ? T.t('{n|{namen}, who left, comes back as a robber|{namen}, who left, come back as robbers}', { n: leden.length, namen: T.opsomming(leden.map((l) => l.naam)) })
      : T.t('{n|A wild robber turns up|{aantal} wild robbers turn up}', { n: leden.length, aantal: T.hoofdletter(T.telwoord(leden.length)) });
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
    const aantal = Math.max(T.BODE_INSTELLINGEN.rovers.aanvallers, R.bende.length);
    const leden = R.bende.length ? R.bende.slice() : Array.from({ length: aantal }, (_, i) => ({ vel: wildVel(D, A.dag, i) }));
    A.rovers = [];
    for (const lid of leden) {
      const e = maakRover(D, lid, plekBij(w, uitgang));
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
    const wie = R.bende.length ? T.t('{namen}, who left,', { namen: T.opsomming(leden.map((l) => l.naam)) }) : T.t('{aantal} robbers', { aantal: T.hoofdletter(T.telwoord(leden.length)) });
    T.bezoekerKomtAan(D, { meteen: true, aankomst: { tekst: T.t('Robbers on the road. {wie} {n|stops|stop} {naam} at the village exit. Send your men there, or they will take everything.', { wie, n: leden.length, naam }), soort: 'gevaar', naarGewoon: true, plek: uitgang } });
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
  // De roverskampen (werklijst vraag 170, stap 6a2, c1)
  // ---------------------------------------------------------------------------------------------

  // Waar de kampen liggen, zegt het eiland (E.kampen, js/eiland.js, legKampen: drie per eiland, in het woud, met hun open
  // plek en een paadje naar de dichtste weg); wat een kamp in dit spel is, onthoudt de kaart (w.kampen, bewaard: { nr, x,
  // y }, en in c2 tot c4 zijn bende, zijn buit en of het verslagen is). Je vindt een kamp zelf (Marcel, 17 okt: V2): gaat
  // het land om een kamp open (de stukken die zijn open plek raakt, w.open), dan staat het er, zoals het wild
  // (js/beesten.js): een tent per `manPerTent` man van zijn bende, met de opening naar het vuur, en het vuur. Elke tik,
  // één keer per kaart (T.wereldTik, js/tik.js), vóór het wild. Het kijkt alleen als er land open ging (KAMPEN_BIJ): het
  // eiland opvragen kost niets als het het laatste is, maar leven er dorpen op twee eilanden (de toetsen), dan maakte
  // elke tik ze allebei opnieuw. Geeft de kampen die erbij kwamen.
  const KAMPEN_BIJ = new WeakMap(); // kaart → hoeveel stukken er open waren toen het keek (volgt uit de kaart, niet bewaard)
  T.zetRoverskampenBij = function (S, w) {
    if (!T.opEiland(w) || !w.open || KAMPEN_BIJ.get(w) === w.open.size) return [];
    KAMPEN_BIJ.set(w, w.open.size);
    const E = T.eilandVan(w.eiland.zaad);
    const kampen = w.kampen || (w.kampen = []);
    if (kampen.length === E.kampen.length) return [];
    const uit = [];
    for (const k of E.kampen) {
      if (kampen.some((q) => q.nr === k.nr) || !kampLandOpen(w, k)) continue;
      const kamp = { nr: k.nr, x: k.x, y: k.y };
      kampen.push(kamp);
      for (const t of k.tenten.slice(0, Math.ceil(IN().kampBende / IN().manPerTent))) {
        const voet = { dx: t.voet.x - t.x, dy: t.voet.y - t.y, b: t.voet.b, h: t.voet.h };
        T.zetVoorwerp(w, { soort: 'tent', x: t.x, y: t.y, vorm: 'tent-rover', richting: t.open, voet, kamp: k.nr });
      }
      T.zetVoorwerp(w, { soort: 'kampvuur', x: k.x, y: k.y, kamp: k.nr });
      uit.push(kamp);
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
  // Het vuur van een roverskamp: het brandt als het donker is, en smeult overdag.
  T.roverskampVuur = (dag) => (T.lichtVan(dag).nacht > 0 ? 'brandt' : 'smeult');
  // Het licht van de roverskampen op kaart w, voor T.lichtBronnen (js/zien.js): 's avonds en 's nachts, zoals het
  // kampvuur van het lege begin (T.BEGIN_INSTELLINGEN.vuur). Zo zie je in het donker een gloed in het bos, waar je het
  // land kent.
  T.roverskampenLicht = function (w, dag) {
    if (!w || !w.kampen || !w.kampen.length || T.roverskampVuur(dag) !== 'brandt') return [];
    const L = T.BEGIN_INSTELLINGEN.vuur;
    return w.kampen.map((k) => ({ x: k.x, y: k.y, straal: L.straal, sterkte: L.sterkte, soort: 'kampvuur' }));
  };
})(globalThis.Spel = globalThis.Spel || {});
