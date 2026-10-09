// De rovers en de militie (stap 4 van de proef "van gehucht tot dorp"; werklijst vraag 55, Marcel, 29 sep: "A, Ja
// en ook 'wilde' rovers. B, ze roven de velden, graan etc ook maken ze soms velden kapot. C, Ja. D, mensen kunnen
// sterven").
//
// Wie wegtrekt (js/bewoners.js), gaat het bos in en wordt rover: de jongeren en de volwassenen, met hun naam en hun
// uiterlijk (S.rovers.bende). Na een tijd komen ze terug, en daarna om de zoveel dagen weer, zolang er een van hen
// leeft. Daarnaast komen er wilde rovers van buiten, op een dag die je niet ziet aankomen.
//
// Een aanval (S.rovers.aanval) gaat zo: tegen de avond komen ze van de rand van de kaart die het dichtst bij een
// akker ligt, lopen erheen, roven er een paar uur, en gaan weg met graan uit de voorraad; soms maken ze de akker
// kapot (wat erop staat, groeit dit jaar niet meer: T.vertrapAkker, js/akkers.js). Een bericht zegt het, en de tijd
// gaat naar 1× (T.bezoekerKomtAan, js/dag.js). De mannen van het wachthuis lopen dan met de schout mee (zoals de
// inner, T.loopNaastDeSchout), en ziet een rover de schout, dan begint het gevecht in beurten (js/gevecht.js), met
// de hele bende en de militie die bij hem is. Wie valt, is dood: een rover is uit zijn bende, een wachter is een
// mond minder (T.sneuvelt), en valt de schout, dan is het spel uit. Wie het overleeft, staat de volgende ochtend
// weer met al zijn leven op (werklijst vraag 11).
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
    // Tegen de avond komen ze (het uur), en zo lang roven ze op de akker voor ze weer gaan. Halen ze hun akker of de
    // weg terug niet binnen opUren (ingesloten, of steeds iemand in de weg), dan geven ze het op.
    uur: 17,
    roofUren: 2,
    opUren: 6,
    // Wat ieder meeneemt, en de kans dat ze de akker kapotmaken.
    graanPerRover: 10,
    kansAkkerKapot: 0.3,
    // Hoe dicht een man van de militie bij de schout moet staan om mee te vechten.
    militieBij: 12,
  };
  const IN = () => T.ROVERS_INSTELLINGEN;

  const uurNu = (D) => (D.kalender ? D.kalender.dag * 24 : 0);
  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  // Een getal 0..1, vast per spel, per dag en per vraag `n` (zoals in js/doorzoeken.js), zodat een speeltest met
  // hetzelfde zaad hetzelfde jaar speelt.
  const lot = (D, dag, n) => T.dobbelsteen(((D.lot && D.lot.zaad) || 1) * 37 + Math.floor(dag) * 7919 + n)();


  T.nieuweRovers = () => ({ bende: [], bendeOp: null, wildeOp: null, aanval: null });

  // Alleen in het gehucht zelf: een wereld met akkers. Een proefkaart (?kaart=proef) heeft geen rovers.
  const heeftRovers = (D) => !!(D.wereld && D.wereld.akkers && D.wereld.akkers.length);

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
      R.aanval = { soort: 'bende', dag, fase: 'wacht' };
      R.bendeOp = dag + IN().opnieuwNaDagen;
    } else if (dag >= R.wildeOp) {
      R.aanval = { soort: 'wild', dag, fase: 'wacht', aantal: wildeAantal(dag) };
      R.wildeOp = dag + wildeTussen(D, dag);
    }
  };

  // Wie in een gevecht viel, ligt er tot de volgende dag.
  function begraaf(D) {
    const w = D.wereld;
    for (let i = w.wezens.length - 1; i >= 0; i--) {
      const e = w.wezens[i];
      if (e.dood && (e.rover || e.gesneuveld)) w.wezens.splice(i, 1);
    }
  }

  // Na een nacht heeft wie het overleefde weer al zijn leven: de schout, en de mannen van het wachthuis.
  function genees(D) {
    const wie = [D.schout, ...(D.bewoners ? D.bewoners.mensen.map((p) => p.wezen) : [])];
    for (const e of wie) if (e && !e.dood && e.maxLeven > 0) e.leven = e.maxLeven;
  }

  // ---------------------------------------------------------------------------------------------
  // De militie: de mannen van het wachthuis, en de veteranen van de heervaart
  // ---------------------------------------------------------------------------------------------

  // Wie in het wachthuis werkt, en wie van de heervaart terugkwam (js/heervaart.js; Marcel, 29 sep, vraag 60, B: ook
  // zonder wachthuis), met zijn poppetje. Wie nog weg is, of nog onderweg naar huis, vecht niet mee.
  T.militieVan = (D) =>
    (D.bewoners ? D.bewoners.mensen : [])
      .filter((p) => ((p.werk && p.werk.soort === 'wachthuis') || p.veteraan) && !p.weg && !p.komt && p.wezen && !p.wezen.dood)
      .map((p) => p.wezen);
  const opgeroepen = (D) => (D.wereld ? D.wereld.wezens.filter((e) => e.opgeroepen && !e.dood) : []);

  // Bij een aanval komt hij naar de schout: hij vecht aan jouw kant, met wat een wachter kan (T.WEZENS.wachter) of een
  // veteraan (T.WEZENS.veteraan), en met het leven dat hij nog heeft. Ook voor de jacht op de wolven (js/beesten.js).
  T.roepOp = roepOp;
  function roepOp(e) {
    const s = T.WEZENS[e.bewoner && e.bewoner.veteraan ? 'veteraan' : 'wachter'];
    e.opgeroepen = true;
    e.binnen = false;
    e.kant = 'speler';
    if (e.maxLeven !== s.leven) {
      // Nieuw in de militie, of intussen veteraan: het leven dat erbij komt, krijgt hij ook.
      e.leven = (e.maxLeven ? e.leven : 0) + s.leven - (e.maxLeven || 0);
      e.maxLeven = s.leven;
    }
    e.ap = s.ap;
    e.maxAp = s.ap;
    e.initiatief = s.initiatief;
  }

  // Na de aanval gaat hij weer naar huis of aan het werk (T.dagAnker, js/dag.js). Ook na de jacht (js/beesten.js).
  T.laatGaan = function (e) {
    e.opgeroepen = false;
    e.gewapend = false;
    e.kant = 'neutraal';
    if (!e.onderweg) e.pad = [];
  };
  function laatGaan(D) {
    for (const e of opgeroepen(D)) T.laatGaan(e);
  }

  // Wie er meevecht als het gevecht begint (T.beginGevecht, js/gevecht.js): de mannen die met de schout meeliepen
  // en dicht genoeg bij hem staan.
  T.militieInGevecht = function (D) {
    const h = D.schout;
    return opgeroepen(D).filter((e) => T.afstand({ x: e.tx, y: e.ty }, { x: h.tx, y: h.ty }) <= IN().militieBij);
  };

  // Wie van de militie ver weg was toen het gevecht begon, rent erheen: bij het begin en bij elke nieuwe ronde (js/gevecht.js)
  // zo ver als zijn punten reiken, en is hij dichtbij genoeg, dan vecht hij mee, na de rest van jouw kant. Tot 5 okt deed
  // hij helemaal niet mee, en viel een schout in de speeltest alleen tegen drie wilde rovers terwijl zijn wachters onderweg
  // waren (werklijst, 0c, punt 4). Geeft { erbij, onderweg }: wie er nu bij kwam, en wie nog onderweg is.
  T.militieKomtErbij = function (S, D) {
    const g = S.gevecht;
    if (!g) return { erbij: [], onderweg: [] };
    const erbij = T.militieInGevecht(D).filter((e) => !g.volgorde.includes(e));
    if (erbij.length) {
      const plek = g.volgorde.findIndex((e) => e.kant !== 'speler');
      g.volgorde.splice(plek < 0 ? g.volgorde.length : plek, 0, ...erbij);
      for (const e of erbij) e.pad = e.onderweg ? [e.pad[0]] : [];
    }
    const h = D.schout;
    const onderweg = opgeroepen(D).filter((e) => !g.volgorde.includes(e));
    for (const e of onderweg) {
      if (e.pad.length) continue;
      const pad = T.zoekRoute(D.wereld, { x: e.tx, y: e.ty }, { x: h.tx, y: h.ty }, { naast: true });
      if (pad && pad.length) e.pad = pad.slice(0, e.maxAp || T.WEZENS.wachter.ap);
    }
    return { erbij, onderweg };
  };

  // Een man van de militie valt (js/gevecht.js, raak): hij is dood, en een mond minder. Het bericht zegt wie het
  // was (T.wijzigBevolking, js/gebouwen.js, met wie het is).
  T.sneuvelt = function (D, e) {
    e.opgeroepen = false;
    e.gesneuveld = true;
    if (e.bewoner) T.wijzigBevolking(D, -1, 'gesneuveld', 'Het gevecht met de rovers was zwaar', [e.bewoner]);
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

  // Waar ze de kaart op komen: de begaanbare tegel aan de rand die het dichtst bij de akker ligt, en vanwaar ze er
  // ook echt heen kunnen. Of null.
  T.roverIngang = function (w, veld) {
    const midden = { x: veld.x + Math.floor(veld.b / 2), y: veld.y + Math.floor(veld.h / 2) };
    const rand = [];
    for (let x = 0; x < w.b; x++) rand.push({ x, y: 0 }, { x, y: w.h - 1 });
    for (let y = 1; y < w.h - 1; y++) rand.push({ x: 0, y }, { x: w.b - 1, y });
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
    e.lid = lid.id != null ? lid.id : null;
    e.vel = lid.vel || T.LEEFTIJDEN.volwassen.man;
    return e;
  }

  // Het begin: de rovers komen de kaart op, het dorp ziet ze, en de militie komt naar de schout.
  function begin(D, A) {
    const w = D.wereld;
    const R = D.rovers;
    // Een akker om te roven (geen weide of braak), en waar ze de kaart op komen. Is er geen, dan komen ze niet.
    const akkers = w.akkers.map((a, i) => i).filter((i) => T.bestemmingVan(w.akkers[i]) === 'akker');
    A.veld = akkers.length ? akkers[Math.floor(lot(D, A.dag, 1) * akkers.length)] : null;
    const ingang = A.veld != null ? T.roverIngang(w, w.akkers[A.veld]) : null;
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
    // Is de schout weg (op reis, js/land.js), dan roept niemand de militie bij hem: de rovers hebben vrij spel.
    const militie = T.schoutIsWeg(D) ? [] : T.militieVan(D);
    for (const e of militie) roepOp(e);
    // Wie een wapen heeft (js/ondernemers.js), slaat harder.
    const gewapend = T.bewapen(D, militie);
    const boer = T.boerVanVeld(D, w.akkers[A.veld]);
    const akker = `de akker${boer ? ` van ${boer.naam}` : ''}`;
    const wie = A.soort === 'bende'
      ? `${T.opsomming(leden.map((l) => l.naam))}, ${leden.length === 1 ? 'die wegtrok, komt' : 'die wegtrokken, komen'} terug als ${leden.length === 1 ? 'rover' : 'rovers'}`
      : `${leden.length === 1 ? 'Een wilde rover komt' : `${T.hoofdletter(T.telwoord(leden.length))} wilde rovers komen`} de kaart op`;
    // Wie er komt: de wachters, de veteranen van de heervaart, of allebei.
    const veteranen = militie.filter((e) => e.bewoner && e.bewoner.veteraan).length;
    const wachters = militie.length - veteranen;
    const metWapens = !gewapend ? '' : gewapend === militie.length ? ', met wapens' : `, ${T.telwoord(gewapend)} met een wapen`;
    const hulp = !militie.length ? '' : ` ${wachters && veteranen ? 'De wachters en de veteranen komen' : wachters ? 'De wachters komen' : veteranen === 1 ? 'De veteraan komt' : 'De veteranen komen'} naar je toe${metWapens}.`;
    T.bezoekerKomtAan(D, { meteen: true, aankomst: { tekst: `Rovers! ${wie}, op weg naar ${akker}.${hulp}`, soort: 'gevaar', naarGewoon: true } });
  }

  // De hinderlaag (de bode naar de marskramer, js/bode.js; werklijst vraag 143; Marcel, 9 okt: "De bode moet "onderschept"
  // kunnen worden. dat maakt het spannend"): komt de bode dicht bij de uitgang, dan staan de rovers er, en houden ze hem en
  // wie meegaat aan (e.aangehouden: ze staan stil, T.dagAnker). Wie meegaat, vecht aan jouw kant, en de militie komt naar
  // de schout. Komt de schout erbij, dan is het een gevecht in beurten; anders loopt het na een tijd af zoals onderweg
  // (T.bodeAangehouden). Is de bode niet meer op de kaart, dan gebeurt het buiten beeld.
  const bodeWezens = (D) => (D.bode ? D.bode.wie.map((p) => p.wezen).filter((e) => e && !e.dood && D.wereld.wezens.includes(e)) : []);
  function laatDeBodeGaan(D, wezens = bodeWezens(D)) {
    for (const e of wezens) {
      delete e.aangehouden;
      if (e.opgeroepen) T.laatGaan(e);
    }
    if (D.bode) D.bode.hinderlaag = false;
  }
  function beginHinderlaag(D, A) {
    const w = D.wereld;
    const R = D.rovers;
    const B = D.bode;
    const wezens = bodeWezens(D);
    const bode = B && B.hinderlaag && B.wie[0] && B.wie[0].wezen;
    const uitgang = T.wegInEnUit(w);
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
    // Wie meegaat, vecht aan jouw kant (de bode zelf niet), en blijft bij hem.
    const mee = wezens.filter((e) => e !== bode);
    for (const e of mee) roepOp(e);
    const militie = T.schoutIsWeg(D) ? [] : T.militieVan(D).filter((e) => !mee.includes(e));
    for (const e of militie) roepOp(e);
    T.bewapen(D, [...mee, ...militie]);
    const naam = T.naamVanBewoner(B.wie[0]);
    const wie = R.bende.length ? `${T.opsomming(leden.map((l) => l.naam))}, ${leden.length === 1 ? 'die wegtrok' : 'die wegtrokken'}` : `${T.hoofdletter(T.telwoord(leden.length))} rovers`;
    const hulp = militie.length ? ' De militie komt naar je toe.' : '';
    T.bezoekerKomtAan(D, { meteen: true, aankomst: { tekst: `Rovers op de weg! ${wie} houden ${naam} aan bij de uitgang van het dorp. Ga erheen, of ze nemen alles.${hulp}`, soort: 'gevaar', naarGewoon: true } });
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
    const w = D.wereld;
    const veld = w.akkers[A.veld];
    const graan = Math.min((D.voorraad && D.voorraad.graan) || 0, levend.length * IN().graanPerRover);
    if (graan > 0) T.wijzigVoorraad(D, 'graan', -graan);
    const kapot = lot(D, A.dag, 3) < IN().kansAkkerKapot ? T.vertrapAkker(veld) : 0;
    const boer = T.boerVanVeld(D, veld);
    const delen = [];
    if (graan > 0) delen.push(`${Math.round(graan)} graan`);
    const buit = delen.length ? ` met ${delen.join(' en ')}` : ' met lege handen';
    T.zeg(D, `De rovers gaan ervandoor${buit}.${kapot ? ` De akker${boer ? ` van ${boer.naam}` : ''} is vertrapt: wat erop stond, is weg.` : ''}`, 'gevaar');
    A.buit = { graan, kapot };
  }

  // Het eind van een aanval: wie nog leeft, is de kaart af, en de militie gaat weer naar huis.
  function eind(D) {
    laatGaan(D);
    D.rovers.aanval = null;
  }

  // Elk beeld (js/main.js, werkBij): de aanval loopt, van komen tot weggaan. In een gevecht staat hij stil: dan
  // beweegt het gevecht in beurten iedereen (js/gevecht.js).
  T.werkRoversBij = function (S, D) {
    const A = D.rovers && D.rovers.aanval;
    if (!A || !heeftRovers(D)) return;
    if (S.modus === 'gevecht' || S.modus === 'overgang' || S.modus === 'dood') return;
    const w = D.wereld;
    if (A.fase === 'wacht') {
      if (S.modus !== 'verkennen') return;
      if (A.soort === 'hinderlaag') return beginHinderlaag(D, A);
      if (!A.meteen && T.uurVanDag(D.kalender.dag) < IN().uur) return;
      begin(D, A);
      return;
    }
    // De militie loopt met de schout mee (zoals de inner, js/inner.js); wie bij de bode is, blijft daar.
    for (const e of opgeroepen(D)) if (!e.onderweg && !e.aangehouden) T.loopNaastDeSchout(D, e);
    const levend = A.rovers.filter((e) => !e.dood && w.wezens.includes(e));
    if (!levend.length) {
      if (A.soort === 'hinderlaag') laatDeBodeGaan(D);
      eind(D);
      return;
    }
    if (A.soort === 'hinderlaag' && A.fase === 'roven') return werkHinderlaagBij(D, A, levend);
    const veld = w.akkers[A.veld];
    if (A.fase === 'komen') {
      for (const e of levend) if (!e.pad.length && !e.onderweg && !opVeld(veld, e)) stuur(D, e, { x: veld.x + Math.floor(veld.b / 2), y: veld.y + Math.floor(veld.h / 2) });
      if (levend.some((e) => opVeld(veld, e))) {
        A.fase = 'roven';
        A.roofTot = uurNu(D) + IN().roofUren;
      } else if (uurNu(D) >= A.sinds + IN().opUren) {
        // Ze halen de akker niet: dan gaan ze met lege handen terug.
        A.fase = 'weg';
        A.sinds = uurNu(D);
        for (const e of levend) e.pad = [];
      }
      return;
    }
    if (A.fase === 'roven') {
      if (uurNu(D) < A.roofTot) return;
      roof(D, A, levend);
      A.fase = 'weg';
      A.sinds = uurNu(D);
      for (const e of levend) e.pad = [];
      return;
    }
    // Weg: naar waar ze kwamen, en daar zijn ze de kaart af. Halen ze het niet op tijd, dan zijn ze toch weg.
    const opgegeven = uurNu(D) >= A.sinds + IN().opUren;
    for (const e of levend) {
      if (e.onderweg && !opgegeven) continue;
      if (opgegeven || (e.tx === A.ingang.x && e.ty === A.ingang.y)) w.wezens.splice(w.wezens.indexOf(e), 1);
      else if (!e.pad.length) stuur(D, e, A.ingang);
    }
    if (!A.rovers.some((e) => !e.dood && w.wezens.includes(e))) eind(D);
  };

  // Na een gevecht (T.eindeGevecht, js/gevecht.js): zijn alle rovers van de aanval verslagen, dan is hij voorbij.
  // Zijn ze je kwijt, dan gaan ze verder met wat ze deden.
  T.naGevecht = function (D) {
    const A = D.rovers && D.rovers.aanval;
    if (!A || !A.rovers) return;
    if (A.rovers.every((e) => e.dood)) {
      if (A.soort === 'hinderlaag') {
        T.bodeWegVrij(D);
        laatDeBodeGaan(D);
        T.zeg(D, D.bode ? 'De rovers zijn verslagen. De bode gaat verder.' : 'De rovers zijn verslagen.', 'goed');
      } else T.zeg(D, 'De rovers zijn verslagen.', 'goed');
      eind(D);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
