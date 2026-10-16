// Het gevecht in real time (werklijst vraag 170, stap 2; Marcel, 15 okt: "Het concept gaan om naar RTS", en op het plan:
// "Aanvallen, dan terug", "Niemand vanzelf", "Iedereen, wie kan vlucht", "We hebben dan een 'town hall' nodig. Daar kunnen
// mensen schuilen").
//
// Er zijn geen beurten en geen raster meer: het gevecht loopt in de tik van de wereld (T.wereldTik, js/tik.js), in elk dorp
// (T.werkGevechtBij vanuit T.werkDorpBij, js/dorp.js), met het toeval van het dorp (T.toeval), en dus op elke computer
// gelijk, zoals lockstep vraagt. Tot 15 okt was het een gevecht in beurten, met actiepunten, een raster op de vloer en een
// deur die je dichtgooide (git bewaart het).
//
// Wie vecht:
//   - jouw kant (T.vechtVoor): de held, de soldaten en de veteranen (T.isMan, js/kiezen.js). Wie geen doel heeft, kijkt om
//     zich heen en valt de dichtste vijandige vijand
//     aan die hij ziet (zicht), maar alleen binnen de leiband van zijn post (of van waar hij hoort, T.dagAnker); loopt die
//     verder weg, dan laat hij hem gaan en keert terug. Een vijand die je zelf aanwijst (e.volgt, js/kiezen.js), zit hij na
//     zonder leiband. De held kiest zelf niets: hij vecht als je hem stuurt, of terug als hij geraakt wordt. Bij een aanval
//     komt niemand vanzelf: jij stuurt je mannen (Marcel: "Niemand vanzelf").
//   - de vijand (T.isVijandig): een rover slaat wie hij tegenkomt, ook een dorpeling (Marcel: "Iedereen"); een wolf alleen
//     als zijn roedel vecht of iemand aanvalt (js/beesten.js), en dan alleen jouw kant. Ook hij heeft een leiband, van waar
//     hij begon; daarna gaat hij verder met wat hij deed (roven, terug naar het hol).
// Een slag: wie raakt (T.kanRaken, met het wapen van T.slagVan in js/soldaten.js: de speer en de piek twee tegels, de boog
// en de kruisboog ver waar ze zien, maar niet met een vijand naast zich), blijft staan en slaat; de kosten van zijn slag
// (de actiepunten van vroeger) maal secondenPerPunt is de tijd tot de volgende. Schild en harnas vangen een deel af
// (T.vangtAf). Wie geraakt wordt en niets doet, slaat terug; een dorpeling vlucht.
//
// Een dorpeling die een rover ziet, vlucht naar het town hall (het huis van de schout: de eerste opslag, het midden van
// je bereik), en zit daar binnen tot er geen rover meer op de kaart is (p.schuilt, en T.blijftThuis in js/bewoners.js: wie
// schuilt, werkt niet). Is er nog geen town hall, dan naar zijn eigen huis.
//
// Het gevecht is een status (D.gevecht, T.OORZAKEN.gevecht in js/statussen.js; de richtlijn van 1 okt): het begint als
// iemand een doel kiest, met een bericht met de plek, en houdt op als er rustNa seconden niemand meer vecht. Zolang het
// duurt, loopt de tijd hooguit op 1× (T.snelheidNu, js/tijd.js; Marcel, 15 okt: "een gevecht ergens zet iedereen op 1×").
// Wie valt, is dood (Marcel, 29 sep: "mensen kunnen sterven"): een rover is uit zijn bende, een soldaat of een dorpeling is
// een mond minder (T.sneuvelt, js/rovers.js), en valt de held, dan is het spel uit (tot stap 5: dan staat er een veteraan op).
//
// Zonder scherm, en dus getoetst (test/gevecht.test.cjs); wat alleen scherm is (de zwevende schade, de pijl), gaat via
// T.anim (js/anim.js), alleen waar je kijkt.
(function (T) {
  'use strict';

  T.GEVECHT_INSTELLINGEN = {
    // De kosten van een slag (in de punten van T.slagVan: een zwaard 3, een boog 4) maal dit is de tijd tot de volgende
    // slag, in seconden op 1×: een zwaard slaat zo elke 1,2 seconde, een boog schiet elke 1,6.
    secondenPerPunt: 0.4,
    // Zo ver (tegels) ziet een man van jou een vijand; een rover of een wolf ziet zo ver als T.WEZENS zegt.
    zicht: 8,
    // Zo ver van zijn post (of van waar hij hoort, of van waar hij begon) zit iemand een vijand na; dan laat hij hem gaan.
    leiband: 10,
    // Wie geen doel heeft, kijkt zo vaak om zich heen (seconden van de wereld), en na een doel dat hij liet gaan zo lang
    // niet.
    kijkElke: 0.25,
    rustNaLoslaten: 2,
    // Zoveel vechters zoeken per tik een nieuwe weg (hun doel liep verder).
    zoekPerTik: 6,
    // Zoveel seconden zonder dat iemand vecht, en het gevecht is voorbij.
    rustNa: 6,
    // Een dorpeling die een rover zo dichtbij ziet (tegels), vlucht naar het town hall.
    vluchtZicht: 6,
    // Het leven van een dorpeling (een soldaat heeft dat van T.WEZENS.soldaat, T.levenAlsMan in js/rovers.js).
    leven: 10,
  };
  const IN = () => T.GEVECHT_INSTELLINGEN;

  // Zo slaat de held (T.slagVan, js/soldaten.js): ernaast, met wat hij bij zich heeft.
  T.SLAAN = { kosten: 3, schade: [3, 5] };

  const plek = (e) => T.tegelVan(e);
  const worp = (D, b) => b[0] + Math.floor(T.toeval(D) * (b[1] - b[0] + 1));

  // ── Wie vecht, en tegen wie ──

  // Vecht hij voor dorp D: de held, een soldaat of een veteraan, of wie meegaat op de jacht (js/beesten.js)?
  T.vechtVoor = (D, e) => !!e && !e.dood && T.isMan(D, e);
  // Een vijand die vecht: een rover (of een ander monster), en een wolf als zijn roedel vecht of iemand aanvalt.
  T.isVijandig = (e) => !!e && !e.dood && e.kant === 'monster' && (!e.beest || !!(e.groep && (e.groep.vecht || e.groep.aanval)));
  // Wie een vijand m aanvalt: jouw kant, en een rover ook een dorpeling die buiten is (een wolf niet). Wie rovers op de weg
  // aanhouden (js/rovers.js, de hinderlaag), houden ze vast; die slaan ze niet.
  function doelVoorVijand(D, m, x) {
    if (x === m || x.dood || x.binnen || x.aangehouden) return false;
    if (T.vechtVoor(D, x)) return true;
    return !m.beest && !!x.bewoner && !x.dier && !x.beest;
  }
  const zichtVan = (D, e) => (T.vechtVoor(D, e) ? IN().zicht : e.zicht || IN().zicht);

  // Waar hij hoort, van waar de leiband gaat: zijn post, of waar zijn dag hem zet (T.dagAnker, js/dag.js: het wachthuis);
  // anders waar hij staat.
  function ankerVan(D, e) {
    if (e.post) return { x: e.post.x, y: e.post.y };
    if (T.vechtVoor(D, e)) {
      const a = T.dagAnker(D, e);
      if (a) return { x: a.x, y: a.y };
    }
    return plek(e);
  }

  // Het leven van wie vecht of geraakt wordt: een man dat van een soldaat of veteraan (T.levenAlsMan), een ander het zijne,
  // of dat van een dorpeling.
  function zorgLeven(D, e) {
    if (e !== D.schout && T.isMan(D, e)) {
      const l = T.levenAlsMan(e);
      e.leven = l.leven;
      e.maxLeven = l.max;
    } else if (!(e.maxLeven > 0)) e.leven = e.maxLeven = IN().leven;
  }

  // De dichtste die hij ziet en mag aanvallen, binnen de leiband van waar hij hoort. Jouw kant kijkt alleen naar de
  // vijanden (een korte lijst), een vijand naar iedereen.
  function kiesDoel(D, e, vijanden) {
    const w = D.wereld;
    const hier = plek(e);
    const man = T.vechtVoor(D, e);
    const zicht = zichtVan(D, e);
    const anker = man ? ankerVan(D, e) : hier;
    let beste = null;
    let bij = Infinity;
    for (const x of man ? vijanden : w.wezens) {
      if (!man && !doelVoorVijand(D, e, x)) continue;
      const p = plek(x);
      const a = T.afstand(p, hier);
      if (a > zicht || a >= bij || T.afstand(p, anker) > IN().leiband) continue;
      if (!T.zichtTussen(w, hier, p)) continue;
      beste = x;
      bij = a;
    }
    return beste ? { doel: beste, anker } : null;
  }

  // Staat er een vijand van e naast tegel t? Dan kan wie schiet daar niet schieten (vraag 159, D1).
  function vijandNaast(D, e, t) {
    const man = T.vechtVoor(D, e);
    return D.wereld.wezens.some((x) => (man ? T.isVijandig(x) : doelVoorVijand(D, e, x)) && T.afstand(plek(x), t) === 1);
  }

  // Kan e doel d raken vanaf tegel `van` (standaard waar hij staat), met zijn wapen (T.slagVan)? Ernaast zoals altijd
  // (T.raakt); verder weg tot zijn bereik, als hij ziet waar hij heen steekt of schiet (T.zichtTussen: een ander wezen
  // ertussen houdt het niet tegen, dus een speer steekt langs een zwaard); en wie schiet, niet met een vijand naast zich.
  T.kanRaken = function (D, e, d, van = plek(e)) {
    const slag = T.slagVan(e);
    if (slag.schiet && vijandNaast(D, e, van)) return false;
    const p = plek(d);
    if (T.raakt(D.wereld, van, p)) return true;
    const a = T.afstand(van, p);
    return a >= 2 && a <= slag.bereik && T.zichtTussen(D.wereld, van, p);
  };

  // ── Elke tik ──

  // Elke tik, in elk dorp (T.werkDorpBij, js/dorp.js): wie vecht, kiest, loopt en slaat; wie een rover ziet, vlucht; en
  // het gevecht begint of houdt op.
  T.werkGevechtBij = function (S, D) {
    const w = D.wereld;
    if (!w || !w.wezens || S.modus === 'dood') return;
    const nu = S.wereldTijd || 0;
    const vijanden = w.wezens.filter(T.isVijandig);
    const budget = { zoek: IN().zoekPerTik };
    let vecht = null;
    for (const e of w.wezens) {
      if (e.dood || e.binnen) continue;
      // Een wolf vecht zelf pas als zijn roedel vecht; valt hij iemand aan, dan roept die om hulp (js/beesten.js).
      if (!T.vechtVoor(D, e) && !(T.isVijandig(e) && (!e.beest || e.groep.vecht))) continue;
      const d = doelVan(S, D, e, nu, vijanden);
      if (!d) continue;
      vecht = vecht || plek(e);
      doeMet(S, D, e, d, nu, budget);
    }
    vlucht(D, vijanden.filter((m) => !m.beest));
    if (vecht) {
      if (!D.gevecht) gevechtBegint(S, D, vecht, nu);
      D.gevecht.laatst = nu;
    } else if (D.gevecht && nu - D.gevecht.laatst >= IN().rustNa) T.gevechtVoorbij(S, D);
    // Een roedel die ging vechten, maar geen wolf vond een doel (wie hij wilde, was al binnen): dan gaat hij terug.
    else if (!D.gevecht && vijanden.some((v) => v.beest && v.groep.vecht)) T.wolvenNaHetGevecht(D);
  };

  // Het doel van e nu: wie hij volgt op jouw bevel (e.volgt, js/kiezen.js), of wie hij zelf koos (e.doelwit). Is dat er
  // niet meer, binnen, of te ver (de leiband, of uit zicht), dan laat hij het gaan; heeft hij niets, en is het tijd, dan
  // kijkt hij om zich heen.
  function doelVan(S, D, e, nu, vijanden) {
    let d = e.volgt || e.doelwit;
    if (d && !e.volgt) {
      const weg = d.dood || d.binnen || d.aangehouden || !D.wereld.wezens.includes(d);
      const ver = T.afstand(plek(d), plek(e)) > zichtVan(D, e) + 2 || (e.vanaf && T.afstand(plek(e), e.vanaf) > IN().leiband);
      const geenVijand = T.vechtVoor(D, e) ? !T.isVijandig(d) : !doelVoorVijand(D, e, d);
      if (weg || ver || geenVijand) {
        laatGaan(e, nu);
        d = null;
      }
    }
    if (d && e.volgt && (d.dood || !D.wereld.wezens.includes(d))) return null; // js/kiezen.js geeft hem een post
    // De held kiest zelf niets: hij blijft waar je hem neerzet (js/kiezen.js), en vecht als je hem stuurt of als hij
    // geraakt wordt (T.raak). Zo loopt hij niet vanzelf een gevecht in dat het spel kan beëindigen.
    if (d || nu < (e.omkijken || 0) || e === D.schout) return d;
    e.omkijken = nu + IN().kijkElke;
    const keus = kiesDoel(D, e, vijanden);
    if (!keus) return null;
    e.doelwit = keus.doel;
    e.vanaf = keus.anker;
    zorgLeven(D, e);
    zorgLeven(D, keus.doel);
    return keus.doel;
  }

  // Hij laat zijn doel gaan: hij maakt zijn stap af, en dan neemt zijn dag het over (zijn post of het wachthuis, T.dwaal),
  // of wat een rover deed (js/rovers.js).
  function laatGaan(e, nu) {
    delete e.doelwit;
    delete e.vanaf;
    e.pad = e.onderweg && e.pad.length ? [e.pad[0]] : [];
    e.omkijken = nu + IN().rustNaLoslaten;
  }

  // Wat e doet met doel d: raakt hij het, dan blijft hij staan en slaat als zijn vorige slag lang genoeg geleden is; wie
  // schiet en een vijand naast zich heeft, stapt opzij; anders loopt hij erheen.
  function doeMet(S, D, e, d, nu, budget) {
    // Wie vecht, heeft zijn leven (een man die je stuurde, kreeg het nog niet bij het kiezen): voor de levensbalk.
    if (!(e.maxLeven > 0)) zorgLeven(D, e);
    if (!(d.maxLeven > 0)) zorgLeven(D, d);
    if (T.kanRaken(D, e, d)) {
      if (e.pad.length) e.pad = e.onderweg ? [e.pad[0]] : [];
      if (!e.onderweg && nu >= (e.slagKlaar || 0)) slaan(S, D, e, d, nu);
      return;
    }
    const slag = T.slagVan(e);
    if (slag.schiet && vijandNaast(D, e, plek(e))) {
      if (!e.onderweg) stapOpzij(D, e);
      return;
    }
    const doel = plek(d);
    if (e.pad.length && e.padDoel && T.afstand(e.padDoel, doel) <= 1) return;
    if (budget.zoek-- <= 0) return;
    const pad = T.zoekRoute(D.wereld, plek(e), doel, { naast: true });
    if (pad === null) {
      if (!e.volgt) laatGaan(e, nu); // hij kan er niet komen
      return;
    }
    T.geefRoute(e, e.onderweg && e.pad[0] ? [e.pad[0], ...pad] : pad, { x: doel.x, y: doel.y, naast: true });
  }

  // Wie schiet en een vijand naast zich heeft, zet een stap naar een tegel waar er geen naast hem staat, zo ver mogelijk
  // van ze vandaan.
  function stapOpzij(D, e) {
    const w = D.wereld;
    const h = plek(e);
    let beste = null;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
      const t = { x: h.x + dx, y: h.y + dy };
      if (!T.isBegaanbaar(w, t.x, t.y, { wezensBlokkeren: true }) || vijandNaast(D, e, t)) continue;
      beste = t;
      break;
    }
    if (beste) T.geefRoute(e, [beste], beste);
  }

  // Een slag: de uitval (of de pijl), de schade min wat schild en harnas afvangen, en de tijd tot de volgende.
  function slaan(S, D, e, d, nu) {
    const slag = T.slagVan(e);
    e.slagKlaar = nu + slag.kosten * IN().secondenPerPunt;
    const doel = plek(d);
    if (S.wereld === D.wereld) {
      if (slag.schiet) T.anim.pijl(S, plek(e), doel);
      else e.uitval = { doel: { x: doel.x, y: doel.y }, t: 0, duur: 0.3 };
    }
    raak(S, D, d, Math.max(0, worp(D, slag.schade) - T.vangtAf(d, e)), e);
  }

  // Een klap kost levenspunten. Wie op nul komt, valt (T.valt); wie het overleeft en niets doet, slaat terug, en een
  // dorpeling vlucht. Ook voor de toetsen (test/gevecht.test.cjs) en Spel.debug.
  function raak(S, D, doel, n, van) {
    zorgLeven(D, doel);
    doel.leven = Math.max(0, doel.leven - n);
    doel.flits = 0.3;
    const onze = T.vechtVoor(D, doel) || !!doel.bewoner;
    if (S.wereld === D.wereld) T.anim.tekst(S, doel, '-' + n, onze ? '#f3b1a5' : '#ffd36b');
    if (doel.leven <= 0) {
      T.valt(S, D, doel, van);
      return;
    }
    if (!van) return;
    if (doel.beest && doel.groep) T.wolvenVechten(D, doel.groep, van);
    else if (doel.bewoner && !T.vechtVoor(D, doel)) T.schuil(D, doel);
    else if (!doel.doelwit && !doel.volgt) {
      doel.doelwit = van;
      doel.vanaf = ankerVan(D, doel);
    }
  }
  T.raak = raak;

  // Wie valt, is dood. De held: het spel is uit (T.schoutGevallen). Een man of een dorpeling: een mond minder (T.sneuvelt,
  // js/rovers.js), en hij ligt er tot de volgende dag. Een vijand is verslagen; een rover is uit zijn bende, en was hij
  // de laatste van zijn aanval, dan is die voorbij (T.naGevecht).
  T.valt = function (S, D, e, van) {
    const held = e === D.schout;
    const onze = !held && (T.vechtVoor(D, e) || !!e.bewoner);
    e.dood = true;
    e.sterfTijd = 0;
    e.pad = [];
    delete e.doelwit;
    delete e.volgt;
    if (held) {
      if (D === S.dorp) T.schoutGevallen(S);
      return;
    }
    if (onze) {
      T.sneuvelt(D, e, van);
      return;
    }
    T.zeg(D, T.t('The {wezen} is defeated.', { wezen: e.naam }), 'goed');
    if (e.rover) {
      T.roverVerslagen(D, e);
      const A = D.rovers && D.rovers.aanval;
      if (A && A.rovers && A.rovers.includes(e) && A.rovers.every((r) => r.dood)) T.naGevecht(D);
    }
  };

  // ── Vluchten en schuilen ──

  // Waar een dorpeling schuilt: in het town hall (het huis van de schout, als het af is), en anders in zijn eigen huis.
  // Geeft de tegel voor de deur, of null.
  function schuilDeur(D, p) {
    const hal = (D.gebouwen || []).find((g) => g.soort === 'schout' && g.klaar);
    const g = hal || (p && p.huis && p.huis.klaar !== false ? p.huis : null);
    return g ? T.deurVan(D.wereld, g) : null;
  }

  // Een dorpeling vlucht: hij houdt op met wat hij deed, en rent naar de deur van het town hall; daar gaat hij naar binnen
  // (T.dagAnker, js/dag.js) en blijft hij tot het rustig is. Geeft of hij vlucht.
  T.schuil = function (D, e) {
    const p = e.bewoner;
    if (!p || p.schuilt) return !!(p && p.schuilt);
    const deur = schuilDeur(D, p);
    if (!deur) return false;
    p.schuilt = { x: deur.x, y: deur.y };
    D.schuilen = true;
    T.stopWerk(e);
    e.maait = null;
    e.oogstDoel = null;
    e.dwaalTijd = 0;
    const pad = T.zoekRoute(D.wereld, plek(e), deur, {});
    if (pad && pad.length) T.geefRoute(e, e.onderweg && e.pad[0] ? [e.pad[0], ...pad] : pad, deur);
    return true;
  };

  // Elke tik: wie buiten een rover ziet, vlucht; is er geen rover meer op de kaart, dan komt iedereen weer naar buiten.
  function vlucht(D, rovers) {
    if (!rovers.length) {
      if (D.schuilen) {
        D.schuilen = false;
        for (const p of D.bewoners ? D.bewoners.mensen : []) delete p.schuilt;
      }
      return;
    }
    const w = D.wereld;
    for (const e of w.wezens) {
      const p = e.bewoner;
      if (!p || p.schuilt || e.dood || e.binnen || e.aangehouden || T.vechtVoor(D, e)) continue;
      const hier = plek(e);
      if (rovers.some((m) => T.afstand(plek(m), hier) <= IN().vluchtZicht && T.zichtTussen(w, plek(m), hier))) T.schuil(D, e);
    }
  }

  // ── Het gevecht als status ──

  // Het gevecht begint: een bericht met de plek (een klik erop, of Spatie, brengt je erheen; js/ui.js), de status in de
  // balk, en de tijd op hooguit 1×.
  function gevechtBegint(S, D, waar, nu) {
    D.gevecht = { sinds: nu, laatst: nu, plek: { x: waar.x, y: waar.y } };
    T.zeg(D, T.t('Fighting breaks out.'), 'gevaar', D.gevecht.plek);
    toonInDeBalk(S, D);
  }
  function toonInDeBalk(S, D) {
    if (T.ui && T.ui.toonStatussen) T.ui.toonStatussen(D);
    if (T.ui && T.ui.werkBalkBij && D === S.dorp) T.ui.werkBalkBij(S);
  }

  // Het gevecht is voorbij: een roedel die vocht, gaat terug naar zijn hol (js/beesten.js).
  T.gevechtVoorbij = function (S, D) {
    D.gevecht = null;
    T.zeg(D, T.t('The fighting is over.'), 'rust');
    T.wolvenNaHetGevecht(D);
    toonInDeBalk(S, D);
  };

  // Wordt er ergens gevochten, in een van de dorpen? Dan loopt de tijd hooguit op 1× (T.snelheidNu, js/tijd.js).
  T.erWordtGevochten = (S) => !!(S && S.dorpen && S.dorpen.some((D) => D.gevecht));

  // ── De held valt ──

  // De held valt, en dat is het einde van het spel (tot stap 5 van vraag 170: dan staat er een veteraan op).
  T.schoutGevallen = function (S) {
    S.modus = 'dood';
    T.ui.bericht(T.t('You fall, and you do not get up again.'), 'gevaar');
    T.ui.toonOverlay(
      T.t('Fallen'),
      `<p>${T.t('You fall, and you do not get up again.')}</p>` +
        `<p>${T.t('The lord writes to the new reeve that he had better take care: a funeral costs money too.')}</p>`,
      T.t('To the title screen'), // net als wie zijn ambt kwijt is (js/hud.js, T.ui.toonEinde)
      () => T.naarTitelscherm(),
    );
  };
})(globalThis.Spel = globalThis.Spel || {});
