// De erven: bouwgrond voor een nieuw gezin (werklijst vraag 52; Marcel, 28 sep: "A ja B ja C ja D ja";
// ontwerp/spel.md, "Het dorp bouwt zelf"). Stap 1 van de proef "van gehucht tot dorp".
//
// Jij wijst een erf aan met het bouwmenu, zoals een gebouw (T.plaatsGebouw, js/gebouwen.js): een vak dat
// groot genoeg is voor elk huis dat er ooit komt, met de tegel voor zijn deur en plaats voor een moestuin.
// Een erf is land, geen gebouw: het maakt de grond niet vast, en de inner en de heer zien het niet. Zolang
// het vrij is, staan er paaltjes op zijn hoeken (js/tekenen.js).
//
// Is het dorp vol (geen huis met plaats), dan neemt een nieuw gezin het vrije erf dat het dichtst bij zijn
// werk ligt, en zet er zelf een hut op, met hout uit de voorraad; ligt er te weinig, dan wacht de
// bouwplaats. Het gezin woont er al terwijl de hut oprijst (zijn woonruimte telt, T.telWoonruimte in
// js/gebouwen.js), en werkt er overdag aan (T.dagAnker, js/dag.js). Bij de hut ligt ook vast in welk huis
// hij later doorgroeit (js/behoeften.js): een huis dat in het erf past, dus het dorp groeit nooit over
// een erf heen.
//
//   S.erven = [{ x, y, b, h, hut }]  // waar een erf ligt, en de hut erop (een gebouw uit S.gebouwen),
//                                    // of null zolang het vrij is. De hut wijst terug: hut.erf.
//
// Alles hier is zonder scherm, en dus getoetst (test/erven.test.cjs).
(function (T) {
  'use strict';

  T.ERVEN_INSTELLINGEN = {
    // Of het dorp zijn eigen huizen bouwt (Marcel, 28 sep): dan wijs jij erven aan, en staan de hut en het
    // huis niet in het bouwmenu (T.inBouwmenu, js/gebouwen.js). Een keuze in de spelregels (js/opties.js,
    // "Huizen").
    dorpBouwtZelf: true,
    // De maat van een erf, in tegels. Het grootste huis is 10 bij 7 of 8 bij 9 tegels, met de tegel voor
    // zijn deur daarbuiten, en er moet een moestuin bij kunnen.
    breed: 10,
    diep: 10,
  };
  const IN = () => T.ERVEN_INSTELLINGEN;

  T.erfMaat = () => ({ b: IN().breed, h: IN().diep });
  const ervenVan = (S) => S.erven || (S.erven = []);
  const dagNu = (S) => Math.floor((S.kalender && S.kalender.dag) || 0);
  const bericht = (tekst, soort) => {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  };

  // ---------------------------------------------------------------------------------------------
  // Aanwijzen en weghalen
  // ---------------------------------------------------------------------------------------------

  // Het erf onder tegel (x, y), of null.
  T.erfOp = function (S, x, y) {
    return (S.erven || []).find((e) => x >= e.x && x < e.x + e.b && y >= e.y && y < e.y + e.h) || null;
  };

  T.vrijeErven = (S) => (S.erven || []).filter((e) => !e.hut);

  // Waarom past een erf niet met zijn linkerbovenhoek op (x, y)? De reden, of null. Het hele vak moet vrij
  // zijn: niet op het plein, niets vasts (water, een boom, een gebouw, de rand van de kaart), geen veld,
  // geen pad en geen ander erf (T.waaromNietOpDezeGrond, js/gebouwen.js). En er moet een hut in passen die
  // tot een huis kan doorgroeien, voor als iemand de maat in de werkbank kleiner zette.
  T.waaromPastErfNiet = function (S, x, y) {
    const w = S.wereld;
    if (!w) return 'Daar past het niet.';
    const { b, h } = T.erfMaat();
    let vast = false;
    let reden = null;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < b; dx++) {
        if (T.opHetPlein(w, x + dx, y + dy)) return 'Op het plein wordt niet gebouwd.';
        if (T.isVast(w, x + dx, y + dy)) vast = true;
        else reden = reden || T.waaromNietOpDezeGrond(S, x + dx, y + dy);
      }
    }
    if (vast) return 'Daar staat iets in de weg: een erf moet helemaal vrij zijn.';
    if (reden) return reden;
    if (!maatPast(S, b, h)) return 'Een erf van deze maat is te klein voor een hut.';
    return null;
  };

  // Past er in een erf van deze maat een hut die tot een huis kan doorgroeien? Dat hangt alleen af van de
  // maat en de tekeningen, niet van waar het erf ligt: dus één keer uitrekenen per maat. (Geen spelstaat,
  // maar wat uit de tekeningen volgt; het muisspook vraagt het elk beeld.)
  const PAST = new Map();
  function maatPast(S, b, h) {
    const k = `${b}x${h}`;
    if (!PAST.has(k)) PAST.set(k, !!kiesTekeningen(S, { b, h }));
    return PAST.get(k);
  }

  // Een erf aanwijzen (het bouwmenu, via T.plaatsGebouw): { gelukt, reden, erf, bericht }, dezelfde vorm als
  // een gebouw neerzetten.
  T.legErfAan = function (S, x, y) {
    const reden = T.waaromPastErfNiet(S, x, y);
    if (reden) return { gelukt: false, reden };
    const { b, h } = T.erfMaat();
    const erf = { x, y, b, h, hut: null };
    ervenVan(S).push(erf);
    return { gelukt: true, erf, bericht: 'Een erf aangewezen. Een nieuw gezin zet er zelf een hut op.' };
  };

  // Een vrij erf weer gewone grond maken: in het bouwmenu, met het erf in de hand, klik je erop
  // (js/main.js). Een erf waar al een gezin woont, blijft.
  T.haalErfWeg = function (S, erf) {
    if (!erf) return { gelukt: false, reden: 'Daar ligt geen erf.' };
    if (erf.hut) return { gelukt: false, reden: 'Op dat erf woont al een gezin.' };
    const lijst = ervenVan(S);
    lijst.splice(lijst.indexOf(erf), 1);
    return { gelukt: true, bericht: 'Het erf is weer gewone grond.' };
  };

  // De hoeken van een vrij erf, voor de paaltjes (js/tekenen.js). Een erf met een hut heeft ze niet meer.
  T.paaltjesVan = function (erf) {
    if (erf.hut) return [];
    const r = erf.x + erf.b - 1;
    const o = erf.y + erf.h - 1;
    return [{ x: erf.x, y: erf.y }, { x: r, y: erf.y }, { x: erf.x, y: o }, { x: r, y: o }];
  };

  // ---------------------------------------------------------------------------------------------
  // Welke hut, en welk huis later
  // ---------------------------------------------------------------------------------------------

  // De voet van een tekening en de tegel voor zijn deur, vanaf de linkerbovenhoek. Zonder `deur` bij de
  // tekening is dat, zoals T.deurVan (js/bewoners.js) het doet, de tegel midden voor zijn voorkant.
  function vorm(soort, tekening) {
    const voet = T.gebouwVoet(soort, tekening);
    const opz = tekening && T.opzoekTegelNaam ? T.opzoekTegelNaam(tekening) : null;
    const deur = opz && opz.eig && opz.eig.deur ? opz.eig.deur : [Math.floor(voet.b / 2), voet.h];
    return { b: voet.b, h: voet.h, deur };
  }

  // Past alles (voeten en deuren) met de hoek op (dx, dy) in een vak van maat.b bij maat.h?
  function pastOp(maat, vormen, dx, dy) {
    const binnen = (x, y) => x >= 0 && y >= 0 && x < maat.b && y < maat.h;
    return vormen.every((v) => binnen(dx, dy) && binnen(dx + v.b - 1, dy + v.h - 1) && binnen(dx + v.deur[0], dy + v.deur[1]));
  }

  // De tekeningen van een soort, die van het bouwmenu voorop (T.volgendeTekening, js/gebouwen.js): zo wordt
  // een rij hutten niet één stempel.
  function opVolgorde(S, soort) {
    const lijst = T.GEBOUWEN[soort].tekeningen || [T.GEBOUWEN[soort].tekening];
    const eerst = T.volgendeTekening(S, soort);
    return [eerst, ...lijst.filter((t) => t !== eerst)];
  }

  // Een hut en het huis waar hij in doorgroeit, zo dat ze allebei met dezelfde linkerbovenhoek in het erf
  // passen, met hun deur erbinnen: js/behoeften.js laat een huis doorgroeien vanuit dezelfde hoek. De hoek
  // zo ver mogelijk naar achteren (noord), zodat de voorkant van het erf vrij blijft voor een moestuin.
  // Geeft { hut, huis, dx, dy }, of null als er niets past.
  function kiesTekeningen(S, maat) {
    for (const huis of opVolgorde(S, 'huis')) {
      for (const hut of opVolgorde(S, 'hut')) {
        const vormen = [vorm('hut', hut), vorm('huis', huis)];
        for (let dy = 0; dy < maat.h; dy++) {
          for (let dx = 0; dx < maat.b; dx++) if (pastOp(maat, vormen, dx, dy)) return { hut, huis, dx, dy };
        }
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------------------------
  // Een gezin neemt een erf, en bouwt zijn hut
  // ---------------------------------------------------------------------------------------------

  // Waar werk is: het midden van de werkplaats die de meeste handen mist, of null.
  function waarWerkIs(S) {
    let beste = null;
    let mist = 0;
    for (const g of S.gebouwen || []) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !soort || !(soort.handen > 0)) continue;
      const m = soort.handen - (g.handen || 0);
      if (m <= mist) continue;
      mist = m;
      const v = T.voetVanGebouw(g);
      beste = { x: v.x + v.b / 2, y: v.y + v.h / 2 };
    }
    return beste;
  }

  // Welk vrij erf een nieuw gezin neemt: het dichtst bij waar werk is, en is er nergens werk, het dichtst
  // bij het plein. Of null.
  T.kiesErf = function (S) {
    const vrij = T.vrijeErven(S);
    if (!vrij.length) return null;
    const doel = waarWerkIs(S) || T.pleinVan(S.wereld) || { x: 0, y: 0 };
    const afstand = (e) => Math.hypot(e.x + e.b / 2 - doel.x, e.y + e.h / 2 - doel.y);
    return vrij.slice().sort((a, b) => afstand(a) - afstand(b))[0];
  };

  // De hut op het erf: een gebouw als elk ander (T.bouwGebouw, js/gebouwen.js), maar met zijn erf erbij en
  // de tekening van het huis waar hij later in doorgroeit (`wordtTekening`, js/behoeften.js). Hij begint
  // pas als het hout er is (`wachtOpHout`, en dan nog geen `klaarOp`). Geeft de hut, of null als er niets
  // past.
  T.zetHutOpErf = function (S, erf) {
    const keus = kiesTekeningen(S, erf);
    if (!keus) return null;
    // Wat genomen is, is genomen: de volgende hut en het volgende huis worden een andere tekening.
    if (keus.hut === T.volgendeTekening(S, 'hut')) T.neemTekening(S, 'hut');
    if (keus.huis === T.volgendeTekening(S, 'huis')) T.neemTekening(S, 'huis');
    const hut = {
      soort: 'hut', x: erf.x + keus.dx, y: erf.y + keus.dy, tekening: keus.hut, voet: T.gebouwVoet('hut', keus.hut),
      klaar: false, klaarOp: null, handen: 0, voorwerp: null,
      erf, wordtTekening: keus.huis, wachtOpHout: true,
    };
    erf.hut = hut;
    T.bouwGebouw(S, hut);
    begin(S, hut);
    return hut;
  };

  // Een bouwplaats begint zodra het hout er is: dan gaat het van de voorraad af, en rijst de hut in zijn
  // bouwtijd op (T.bouwFaseIndex, js/gebouwen.js). Geeft true als hij begon.
  function begin(S, hut) {
    const soort = T.GEBOUWEN[hut.soort];
    if (!T.kanBetalen(S, soort.kosten)) return false;
    T.betaalKosten(S, soort.kosten);
    hut.wachtOpHout = false;
    hut.klaarOp = dagNu(S) + soort.bouwtijd;
    if (hut.voorwerp) hut.voorwerp.klaarOp = hut.klaarOp;
    return true;
  }

  // "het gezin van Albert", of "een nieuw gezin" zolang er (in een toets) geen bewoners zijn.
  function gezinVan(S, g) {
    const p = S.bewoners && S.bewoners.mensen.find((m) => m.huis === g);
    return p && p.naam ? `het gezin van ${p.naam}` : 'een nieuw gezin';
  }

  // Het dorp is vol, en er wil een gezin komen (T.tikGebouwenDag, stap 4, js/gebouwen.js): het neemt een
  // vrij erf en zet er zijn hut op, of het zegt dat er geen plaats is (tot 28 sep gebeurde er dan niets,
  // en zei niets het je). Geeft de hut, of null.
  T.gezinZoektEenErf = function (S) {
    const zelf = IN().dorpBouwtZelf;
    const erf = zelf ? T.kiesErf(S) : null;
    const hut = erf ? T.zetHutOpErf(S, erf) : null;
    if (!hut) {
      bericht(zelf
        ? 'Er wil een gezin komen, maar er is geen plaats. Wijs een erf aan (B).'
        : 'Er wil een gezin komen, maar er is geen plaats. Bouw een hut of een huis (B).');
      return null;
    }
    S.woonruimte = T.telWoonruimte(S);
    T.wijzigBevolking(S, Math.min(T.GEBOUWEN_INSTELLINGEN.gezinGrootte, T.GEBOUWEN.hut.woonruimte), 'groei');
    if (hut.wachtOpHout) {
      const hout = T.GEBOUWEN.hut.kosten.hout;
      bericht(`${T.hoofdletter(gezinVan(S, hut))} wacht op hout voor zijn hut: daar is ${hout} hout voor nodig.`, 'gevaar');
    }
    return hut;
  };

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, vóór de gebouwen die klaarkomen): een bouwplaats die op
  // hout wacht, begint als het er nu is.
  T.tikErvenDag = function (S) {
    for (const erf of S.erven || []) {
      const hut = erf.hut;
      if (hut && hut.wachtOpHout && begin(S, hut)) bericht(`${T.hoofdletter(gezinVan(S, hut))} begint aan zijn hut: het hout is er.`);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
