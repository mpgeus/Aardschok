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
// Het huis krijgt rondom een looppad, zoals elk gebouw (T.GEBOUWEN_INSTELLINGEN.looppad, js/gebouwen.js; Marcel, 3 okt:
// "Ja" op drie tegels ook om een huis op een erf): waar het komt, ligt vast als je het erf aanwijst (erf.plan), en een
// gebouw dat later komt, blijft er met zijn looppad vandaan, ook als het huis er nog niet staat (T.huisPlekOp). Een huis
// dat doorgroeit, net zo (T.opDeGrondVanEenErf, js/behoeften.js). En past er toch geen hut meer op een vrij erf, dan telt
// het niet als plaats (T.bruikbareErven): dan zegt de raad dat er geen plaats is, en wijs je een ander erf aan (werklijst
// vraag 110, f; in de speeltest van vier jaar kwam er op 62707 zo twee en een half jaar geen gezin).
//
// Een erf mag op struiken en bomen (werklijst vraag 110, e; Marcel, 6 okt: "A ja B ja C ja D zo"; gemeten: zo passen er
// twee à drie keer zoveel erven op een land). Water, een rots, een gebouw, een veld of een pad houden het tegen, maar wat
// te rooien is (een boom, een stronk, een struik: T.ontginWerkOp, js/ontginnen.js) niet. Het gezin dat het erf neemt,
// rooit het eerst zelf: de man met de bijl, en zijn gezin helpt (js/veldwerk.js, zoals de boer bij het ontginnen). Zolang
// wacht de hut, nog niet op de kaart (`wachtOpRooien`, met het erf als kavel), en het gezin woont er al, zoals terwijl de
// hut oprijst. Is het na een maand niet af, dan rooien de buren de rest (js/bos.js, T.tikRooienDag, dat ook een werkplaats
// in het bos zo laat wachten). Een erf waar niets op staat, gaat voor (T.kiesErf).
// Staan er minstens zoveel bomen op als op een stuk bos bij het ontginnen, dan ligt het in het bos van de heer, en dat
// kost zijn gunst als je het aanwijst; de wei kost niets.
//
//   S.erven = [{ x, y, b, h, hut, plan }]  // waar een erf ligt, en de hut erop (een gebouw uit S.gebouwen),
//                                          // of null zolang het vrij is. De hut wijst terug: hut.erf. plan: waar het
//                                          // huis komt, { hut, huis, dx, dy, b, h } (de hoek in het erf, en de maat
//                                          // van het grootste van de twee).
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
    // Zoveel dagen rooit een gezin zijn erf zelf; wat er daarna nog staat, rooien de buren in één keer (het vangnet, zoals
    // bij het ontginnen). Een erf in de wei met een paar struiken is in een paar dagen vrij, een erf vol bomen niet.
    rooiDagen: 30,
  };
  const IN = () => T.ERVEN_INSTELLINGEN;

  T.erfMaat = () => ({ b: IN().breed, h: IN().diep });
  const ervenVan = (D) => D.erven || (D.erven = []);
  const dagNu = (D) => Math.floor((D.kalender && D.kalender.dag) || 0);

  // ---------------------------------------------------------------------------------------------
  // Aanwijzen en weghalen
  // ---------------------------------------------------------------------------------------------

  // Het erf onder tegel (x, y), of null.
  T.erfOp = function (D, x, y) {
    return (D.erven || []).find((e) => x >= e.x && x < e.x + e.b && y >= e.y && y < e.y + e.h) || null;
  };

  T.vrijeErven = (D) => (D.erven || []).filter((e) => !e.hut);

  // De vrije erven waar nog een hut op past (T.hutPastOpErf): daar kan een nieuw gezin heen.
  T.bruikbareErven = (D) => T.vrijeErven(D).filter((e) => T.hutPastOpErf(D, e));

  // Kan een nieuw gezin een erf nemen? Als het dorp zelf bouwt en er een vrij erf is waar een hut op past
  // (T.gezinZoektEenErf hieronder; en T.waaromGeenGezin in js/gebouwen.js, die zegt of er plaats is).
  T.kanEenErfNemen = (D) => IN().dorpBouwtZelf && T.bruikbareErven(D).length > 0;

  // Ligt (x, y) op een ander erf dan `behalve`, of binnen het looppad om de plek van het huis op een ander erf? Daar
  // groeit een huis niet heen (js/behoeften.js), zoals een gebouw dat er later komt er ook vandaan blijft (T.looppadOm,
  // js/gebouwen.js, met T.huisPlekOp).
  T.opDeGrondVanEenErf = function (D, x, y, behalve = null) {
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    for (const e of D.erven || []) {
      if (e === behalve) continue;
      if (x >= e.x && x < e.x + e.b && y >= e.y && y < e.y + e.h) return true;
      const p = e.plan;
      if (p && x >= e.x + p.dx - n && x < e.x + p.dx + p.b + n && y >= e.y + p.dy - n && y < e.y + p.dy + p.h + n) return true;
    }
    return false;
  };

  // Waarom past een erf niet met zijn linkerbovenhoek op (x, y)? De reden, of null. Het hele vak moet vrij
  // zijn: niet op het plein, niets vasts (water, een boom, een gebouw, de rand van de kaart), geen veld,
  // geen pad en geen ander erf (T.waaromNietOpDezeGrond, js/gebouwen.js). En er moet een hut in passen die
  // tot een huis kan doorgroeien, voor als iemand de maat in de werkbank kleiner zette.
  T.waaromPastErfNiet = function (D, x, y) {
    const w = D.wereld;
    if (!w) return 'Daar past het niet.';
    const { b, h } = T.erfMaat();
    let vast = false;
    let reden = null;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < b; dx++) {
        if (T.opHetPlein(w, x + dx, y + dy)) return 'Op het plein wordt niet gebouwd.';
        // Wat te rooien is (een boom, een stronk, een struik), houdt een erf niet tegen: dat rooit het gezin dat er komt.
        if (T.isVast(w, x + dx, y + dy) && !T.ontginWerkOp(w, x + dx, y + dy)) vast = true;
        else reden = reden || T.waaromNietOpDezeGrond(D, x + dx, y + dy);
      }
    }
    if (vast) return 'Daar staat iets in de weg: een erf moet helemaal vrij zijn.';
    if (reden) return reden;
    // Geen deur op een erf (werklijst vraag 88, js/gebouwen.js): de hut erop zou hem dichtzetten.
    if (T.deurOpRechthoek(D, { x, y, b, h })) return 'Daar is een deur.';
    if (!maatPast(D, b, h)) return 'Een erf van deze maat is te klein voor een hut.';
    if (!kiesTekeningen(D, { b, h }, { x, y, b, h })) {
      const n = T.GEBOUWEN_INSTELLINGEN.looppad;
      return `Hier past geen huis met een looppad van ${T.telwoord(n)} tegels rondom.`;
    }
    return null;
  };

  // Ligt (x, y) op de plek van het huis van een erf (erf.plan)? Een gebouw blijft er met zijn looppad vandaan, ook als
  // het huis er nog niet staat (T.looppadOm, js/gebouwen.js). `behalve`: het erf dat zelf zijn plek zoekt.
  T.huisPlekOp = function (D, x, y, behalve) {
    for (const e of D.erven || []) {
      const p = e !== behalve && e.plan;
      if (p && x >= e.x + p.dx && x < e.x + p.dx + p.b && y >= e.y + p.dy && y < e.y + p.dy + p.h) return true;
    }
    return false;
  };
  const planVan = (keus) => {
    if (!keus) return null;
    const v = [vorm('hut', keus.hut), vorm('huis', keus.huis)];
    return { ...keus, b: Math.max(...v.map((x) => x.b)), h: Math.max(...v.map((x) => x.h)) };
  };

  // Past er in een erf van deze maat een hut die tot een huis kan doorgroeien? Dat hangt alleen af van de
  // maat en de tekeningen, niet van waar het erf ligt: dus één keer uitrekenen per maat. (Geen spelstaat,
  // maar wat uit de tekeningen volgt; het muisspook vraagt het elk beeld.)
  const PAST = new Map();
  function maatPast(D, b, h) {
    const k = `${T.stijlVan(D) || ''}:${b}x${h}`;
    if (!PAST.has(k)) PAST.set(k, !!kiesTekeningen(D, { b, h }));
    return PAST.get(k);
  }

  // Een erf aanwijzen (het bouwmenu, via T.plaatsGebouw): { gelukt, reden, erf, bericht }, dezelfde vorm als
  // een gebouw neerzetten.
  T.legErfAan = function (D, x, y) {
    const reden = T.waaromPastErfNiet(D, x, y);
    if (reden) return { gelukt: false, reden };
    const { b, h } = T.erfMaat();
    const erf = { x, y, b, h, hut: null, plan: null };
    erf.plan = planVan(kiesTekeningen(D, erf, erf));
    // In het bos van de heer wil hij erom gevraagd worden (Marcel, 6 okt, B: "ja"), zoals bij een stuk bos dat een boer
    // ontgint; de wei kost niets.
    const bos = T.inHetBosVanDeHeer(D, erf);
    if (bos) T.wijzigGunst(D, -T.ONTGINNEN_INSTELLINGEN.gunst, 'Een erf in zijn bos');
    ervenVan(D).push(erf);
    const wat = T.watTeRooien(D, erf);
    const rooien = wat.bomen || wat.struiken ? ` Het rooit eerst ${T.rooiWoorden(wat)}.` : '';
    return { gelukt: true, erf, bericht: `Een erf aangewezen. Een nieuw gezin zet er zelf een hut op.${rooien}${bos ? ' Het ligt in het bos van de heer.' : ''}` };
  };

  // Een vrij erf weer gewone grond maken: in het bouwmenu, met het erf in de hand, klik je erop
  // (js/main.js). Een erf waar al een gezin woont, blijft.
  T.haalErfWeg = function (D, erf) {
    if (!erf) return { gelukt: false, reden: 'Daar ligt geen erf.' };
    if (erf.hut) return { gelukt: false, reden: 'Op dat erf woont al een gezin.' };
    const lijst = ervenVan(D);
    lijst.splice(lijst.indexOf(erf), 1);
    return { gelukt: true, bericht: 'Het erf is weer gewone grond.' };
  };

  // De hoeken van een vrij erf, voor de paaltjes (js/tekenen.js). Een erf met een hut heeft ze niet meer; een erf dat
  // het gezin nog rooit wel, want daar staat de hut nog niet.
  T.paaltjesVan = function (erf) {
    if (erf.hut && !erf.hut.wachtOpRooien) return [];
    const r = erf.x + erf.b - 1;
    const o = erf.y + erf.h - 1;
    return [{ x: erf.x, y: erf.y }, { x: r, y: erf.y }, { x: erf.x, y: o }, { x: r, y: o }];
  };

  // ---------------------------------------------------------------------------------------------
  // Wat er eerst weg moet (werklijst vraag 110, e; wat te rooien is en wie het rooit: js/bos.js)
  // ---------------------------------------------------------------------------------------------

  // Wat de muis zegt met een erf in de hand op het vak r (js/main.js): wat er eerst weg moet, en of het in het bos van de
  // heer ligt, of null als er niets staat.
  T.rooiTekst = function (D, r) {
    const wat = T.watTeRooien(D, r);
    if (!wat.bomen && !wat.struiken) return null;
    const bos = T.inHetBosVanDeHeer(D, r);
    return `Het gezin dat er komt, rooit eerst ${T.rooiWoorden(wat)}.${bos ? ` Dit is het bos van de heer: hij wil erom gevraagd worden (gunst −${T.ONTGINNEN_INSTELLINGEN.gunst}).` : ''}`;
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
  function opVolgorde(D, soort) {
    const lijst = T.tekeningenVan(D, soort) || [T.GEBOUWEN[soort].tekening];
    const eerst = T.metDeurNaar(T.volgendeTekening(D, soort), 'z');
    return [eerst, ...lijst.filter((t) => t !== eerst)];
  }

  // Een hut en het huis waar hij in doorgroeit, zo dat ze allebei met dezelfde linkerbovenhoek in het erf
  // passen, met hun deur erbinnen: js/behoeften.js laat een huis doorgroeien vanuit dezelfde hoek. De hoek
  // zo ver mogelijk naar achteren (noord), zodat de voorkant van het erf vrij blijft voor een moestuin. Met
  // `erf` (waar het erf ligt) alleen een hoek waar het huis rondom een looppad heeft. Geeft { hut, huis, dx, dy },
  // of null als er niets past.
  function kiesTekeningen(D, maat, erf = null) {
    if (T.stijlVan(D)) return kiesInStijl(D, maat, erf);
    for (const huis of opVolgorde(D, 'huis')) {
      for (const hut of opVolgorde(D, 'hut')) {
        const vormen = [vorm('hut', hut), vorm('huis', huis)];
        const b = Math.max(...vormen.map((v) => v.b));
        const h = Math.max(...vormen.map((v) => v.h));
        for (let dy = 0; dy < maat.h; dy++) {
          for (let dx = 0; dx < maat.b; dx++) {
            if (!pastOp(maat, vormen, dx, dy)) continue;
            if (erf && !T.looppadOm(D, { x: erf.x + dx, y: erf.y + dy, b, h }, T.GEBOUWEN_INSTELLINGEN.looppad, erf)) continue;
            return { hut, huis, dx, dy };
          }
        }
      }
    }
    return null;
  }

  // In een land met een bouwstijl (js/bouwstijl.js) hebben de hut en het huis hun deur naar dezelfde kant: de kant van
  // het erf die het dichtst bij de weg ligt (T.zijdenNaarDeWeg; Marcel, 4 okt), en past dat niet, naar de volgende
  // kant. Het huis staat achteraan op zijn erf, zodat de moestuin tussen de deur en de weg ligt: bij een deur naar het
  // zuiden zo ver mogelijk naar het noorden, bij een deur naar het oosten zo ver mogelijk naar het westen, enzovoort.
  function kiesInStijl(D, maat, erf) {
    const kanten = erf ? T.zijdenNaarDeWeg(D.wereld, erf) : T.DEURKANTEN;
    const huizen = opVolgorde(D, 'huis');
    const hutten = opVolgorde(D, 'hut');
    for (const kant of kanten) {
      for (const huis0 of huizen) {
        for (const hut0 of hutten) {
          const huis = T.metDeurNaar(huis0, kant);
          const hut = T.metDeurNaar(hut0, kant);
          const vormen = [vorm('hut', hut), vorm('huis', huis)];
          const b = Math.max(...vormen.map((v) => v.b));
          const h = Math.max(...vormen.map((v) => v.h));
          for (const [dx, dy] of hoekenVanAchter(maat, kant)) {
            if (!pastOp(maat, vormen, dx, dy)) continue;
            if (erf && !T.looppadOm(D, { x: erf.x + dx, y: erf.y + dy, b, h }, T.GEBOUWEN_INSTELLINGEN.looppad, erf)) continue;
            return { hut, huis, dx, dy };
          }
        }
      }
    }
    return null;
  }
  // De hoeken van een erf, van achter naar voren als de deur naar `kant` kijkt.
  function hoekenVanAchter(maat, kant) {
    const xs = [...Array(maat.b).keys()];
    const ys = [...Array(maat.h).keys()];
    if (kant === 'n') ys.reverse();
    if (kant === 'w') xs.reverse();
    const uit = [];
    if (kant === 'z' || kant === 'n') for (const dy of ys) for (const dx of xs) uit.push([dx, dy]);
    else for (const dx of xs) for (const dy of ys) uit.push([dx, dy]);
    return uit;
  }

  // ---------------------------------------------------------------------------------------------
  // Een gezin neemt een erf, en bouwt zijn hut
  // ---------------------------------------------------------------------------------------------

  // Waar werk is: het midden van de werkplaats die de meeste handen mist, of null.
  function waarWerkIs(D) {
    let beste = null;
    let mist = 0;
    for (const g of D.gebouwen || []) {
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

  // Welk vrij erf een nieuw gezin neemt: een erf waar niets te rooien staat gaat voor (vraag 110, e), en dan het dichtst
  // bij waar werk is, en is er nergens werk, het dichtst bij het plein. Of null.
  T.kiesErf = function (D) {
    const vrij = T.bruikbareErven(D);
    if (!vrij.length) return null;
    const doel = waarWerkIs(D) || T.pleinVan(D.wereld) || { x: 0, y: 0 };
    const afstand = (e) => Math.hypot(e.x + e.b / 2 - doel.x, e.y + e.h / 2 - doel.y);
    const rooien = (e) => (T.teRooienOp(D, e).length ? 1 : 0);
    return vrij.slice().sort((a, b) => rooien(a) - rooien(b) || afstand(a) - afstand(b))[0];
  };

  // Welke hut en welk huis er op dit erf komen: zijn plan, als het looppad om het huis nog vrij is, en anders een hut en
  // een huis die er nu wel passen (kiesTekeningen), of null. Iets wat later naast het erf kwam, kan het looppad innemen.
  function hutVoorErf(D, erf) {
    const plan = erf.plan;
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    return plan && T.looppadOm(D, { x: erf.x + plan.dx, y: erf.y + plan.dy, b: plan.b, h: plan.h }, n, erf) ? plan : kiesTekeningen(D, erf, erf);
  }

  // Past er een hut op dit erf (hutVoorErf)? Onthouden zolang de kaart en de erven dezelfde zijn (T.kaartVersie,
  // js/wereld.js): zoeken kost veel, en de groei en de raad vragen het vaak (T.waaromGeenGezin). Geen spelstaat, maar
  // wat uit de kaart volgt.
  const PAST_ER_EEN_HUT = new WeakMap();
  T.hutPastOpErf = function (D, erf) {
    const sleutel = `${T.kaartVersie(D.wereld)}:${(D.erven || []).length}`;
    const oud = PAST_ER_EEN_HUT.get(erf);
    if (oud && oud.sleutel === sleutel) return oud.past;
    const past = !!hutVoorErf(D, erf);
    PAST_ER_EEN_HUT.set(erf, { sleutel, past });
    return past;
  };

  // De hut op het erf: een gebouw als elk ander (T.bouwGebouw, js/gebouwen.js), maar met zijn erf erbij en
  // de tekening van het huis waar hij later in doorgroeit (`wordtTekening`, js/behoeften.js). Hij begint
  // pas als het hout er is (`wachtOpHout`, en dan nog geen `klaarOp`). Staat er op het erf nog iets te rooien, dan wacht
  // hij daar eerst op (`wachtOpRooien`, met het erf als kavel): hij telt al als het huis van het gezin, maar komt pas op de
  // kaart als het erf vrij is (T.tikRooienDag, js/bos.js). Geeft de hut, of null als er niets past.
  T.zetHutOpErf = function (D, erf) {
    const keus = hutVoorErf(D, erf);
    if (!keus) return null;
    erf.plan = planVan(keus);
    // Wat genomen is, is genomen: de volgende hut en het volgende huis worden een andere tekening.
    if (T.vormVan(keus.hut) === T.vormVan(T.volgendeTekening(D, 'hut'))) T.neemTekening(D, 'hut');
    if (T.vormVan(keus.huis) === T.vormVan(T.volgendeTekening(D, 'huis'))) T.neemTekening(D, 'huis');
    const rooien = T.teRooienOp(D, erf).length > 0;
    const hut = {
      soort: 'hut', x: erf.x + keus.dx, y: erf.y + keus.dy, tekening: keus.hut, voet: T.gebouwVoet('hut', keus.hut),
      klaar: false, klaarOp: null, handen: 0, voorwerp: null,
      erf, wordtTekening: keus.huis, wachtOpHout: !rooien, wachtOpRooien: rooien,
    };
    if (rooien) Object.assign(hut, { kavel: { x: erf.x, y: erf.y, b: erf.b, h: erf.h }, rooienTot: dagNu(D) + IN().rooiDagen });
    erf.hut = hut;
    T.bouwGebouw(D, hut);
    if (!rooien) begin(D, hut);
    return hut;
  };

  // Een bouwplaats begint zodra het hout er is: dan gaat het van de voorraad af, en rijst de hut in zijn
  // bouwtijd op (T.bouwFaseIndex, js/gebouwen.js). Geeft true als hij begon.
  function begin(D, hut) {
    const soort = T.GEBOUWEN[hut.soort];
    if (!T.kanBetalen(D, soort.kosten)) return false;
    T.betaalKosten(D, soort.kosten);
    hut.wachtOpHout = false;
    hut.klaarOp = dagNu(D) + soort.bouwtijd;
    if (hut.voorwerp) hut.voorwerp.klaarOp = hut.klaarOp;
    return true;
  }

  // "het gezin van Albert", of "een nieuw gezin" zolang er (in een toets) geen bewoners zijn.
  function gezinVan(D, g) {
    const p = D.bewoners && D.bewoners.mensen.find((m) => m.huis === g);
    return p && p.naam ? `het gezin van ${p.naam}` : 'een nieuw gezin';
  }

  // Het dorp is vol, en er wil een gezin komen (T.tikGebouwenDag, stap 4, js/gebouwen.js): het neemt een
  // vrij erf en zet er zijn hut op, of het zegt dat er geen plaats is (tot 28 sep gebeurde er dan niets,
  // en zei niets het je). Geeft de hut, of null.
  T.gezinZoektEenErf = function (D) {
    const zelf = IN().dorpBouwtZelf;
    const erf = T.kanEenErfNemen(D) ? T.kiesErf(D) : null;
    const hut = erf ? T.zetHutOpErf(D, erf) : null;
    if (!hut) {
      T.zeg(D, zelf
        ? 'Er wil een gezin komen, maar er is geen plaats. Wijs een erf aan (B).'
        : 'Er wil een gezin komen, maar er is geen plaats. Bouw een hut of een huis (B).');
      return null;
    }
    D.woonruimte = T.telWoonruimte(D);
    T.wijzigBevolking(D, Math.min(T.GEBOUWEN_INSTELLINGEN.gezinGrootte, T.GEBOUWEN.hut.woonruimte), 'groei');
    if (hut.wachtOpRooien) {
      T.zeg(D, `${T.hoofdletter(gezinVan(D, hut))} rooit eerst zijn erf: ${T.rooiWoorden(T.watTeRooien(D, erf))}.`);
    } else if (hut.wachtOpHout) {
      const hout = T.GEBOUWEN.hut.kosten.hout;
      T.zeg(D, `${T.hoofdletter(gezinVan(D, hut))} wacht op hout voor zijn hut: daar is ${hout} hout voor nodig.`, 'gevaar');
    }
    return hut;
  };

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, vóór de gebouwen die klaarkomen, en na het rooien, js/bos.js): een
  // bouwplaats die op hout wacht, begint als het er nu is.
  T.tikErvenDag = function (D) {
    for (const erf of D.erven || []) {
      const hut = erf.hut;
      if (hut && hut.wachtOpHout && begin(D, hut)) T.zeg(D, `${T.hoofdletter(gezinVan(D, hut))} begint aan zijn hut: het hout is er.`);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
