// Het gevecht in beurten. Het begint op de plek waar iedereen staat: wie onderweg is, maakt
// zijn stap af, daarna verschijnt het raster op dezelfde vloer en gaat de wereld verder in
// beurten. Er is geen apart gevechtsscherm, en dat is de kern van het idee: de kamer waarin
// je rondliep, is het slagveld, met dezelfde deuren, kisten en fontein.
(function (T) {
  'use strict';

  // Eén potje actiepunten per beurt voor lopen (1 per stap), slaan, toveren en drinken.
  // Daar staat de afweging waar het spel om draait: slaan met de staf kost geen levensjaren,
  // maar is zwak en brengt je binnen bereik van de klappen; een vuurschicht is sterk en werkt
  // op afstand, maar kost een jaar van je leven. De spreuken staan in spreuken.js.
  T.SLAAN = { kosten: 3, schade: [3, 5] };
  T.FONTEIN = { kosten: 3, maanden: 24 };
  T.DEUR_SLUITEN = 1;

  const worp = (b) => b[0] + Math.floor(Math.random() * (b[1] - b[0] + 1));

  // Ouder worden (of, bij de fontein, jonger) — van de held, of, met het vierde argument, van
  // wie dan ook: de meester veroudert zichtbaar in zijn eigen scène (js/regie.js), lang voordat
  // de speler het overneemt. Dit is de enige weg naar een leeftijd (CLAUDE.md, De kernregel):
  // geen tweede functie, want die mist vroeg of laat iets. Voor iedereen geldt de leeftijd zelf,
  // het zwevende getal boven het hoofd, en sterven op honderd; alleen van de held zijn het
  // leeftijdspaneel, de beurtvolgorde, de meldingen over actiepunten, de kring en het einde van
  // het spel (T.heldGevallen) — een ander wezen dat honderd wordt, sterft, maar het spel gaat
  // door.
  T.verouder = function (S, maanden, uitKlap, wezen) {
    const e = wezen || S.held;
    const isHeld = e === S.held;
    const apVoor = isHeld ? T.apVoorLeeftijd(e.leeftijd) : 0;
    e.leeftijd = Math.min(T.EINDLEEFTIJD, Math.max(0, e.leeftijd + maanden));
    // Een kring van spreuken die open is, blijft open, ook als de fontein je jonger maakt.
    // Alleen de held tovert, dus alleen de held heeft een kring.
    if (isHeld) e.kring = Math.max(e.kring || 0, T.kringVoorLeeftijd(e.leeftijd));
    if (uitKlap) e.flits = 0.3;
    T.anim.tekst(S, e, T.duurKort(maanden), maanden > 0 ? '#e6d3a3' : '#9fe0a0');
    if (isHeld) {
      T.ui.toonLeeftijd(e);
      T.ui.toonVolgorde(S);
    }
    if (e.leeftijd >= T.EINDLEEFTIJD) {
      e.dood = true;
      e.sterfTijd = 0;
      e.pad = [];
      if (isHeld) T.heldGevallen(S);
      return;
    }
    if (!isHeld) return;
    const apNa = T.apVoorLeeftijd(e.leeftijd);
    if (apNa < apVoor) T.ui.bericht(`Je lijf wordt trager: vanaf nu ${apNa} actiepunten per beurt. Je magie wordt sterker.`, 'gevaar');
    else if (apNa > apVoor) T.ui.bericht(`Je lijf voelt lichter: weer ${apNa} actiepunten per beurt.`, 'goed');
  };

  // Stap 1 van de overgang: de wereld bevriest. De spellus roept beginGevecht aan zodra
  // niemand meer onderweg is.
  T.startGevecht = function (S, aanleiding, heldBegint) {
    if (S.modus !== 'verkennen') return;
    S.modus = 'overgang';
    S.naLopen = null;
    S.spreuk = null;
    S.overgang = { aanleiding };
    // Wie op een dwaallicht afging, schrikt op: nu telt alleen nog de held.
    for (const e of S.wereld.wezens) {
      e.pad = e.onderweg ? [e.pad[0]] : [];
      e.gelokt = null;
    }
    if (!heldBegint) aanleiding.alarm = 1.3;
    T.ui.verbergTooltip();
    T.ui.bericht(heldBegint ? `Je valt de ${aanleiding.naam} aan!` : `De ${aanleiding.naam} ziet je!`, 'gevaar');
  };

  // Stap 2: iedereen staat op een tegel. Wie doet mee, in welke volgorde, op welke vloer.
  T.beginGevecht = function (S) {
    const w = S.wereld;
    const held = S.held;
    const monsters = T.deelnemers(w, held, S.overgang.aanleiding);
    S.overgang = null;
    const kamers = new Set();
    for (const e of [held, ...monsters]) {
      const k = T.kamerVan(w, e.tx, e.ty);
      if (k) {
        kamers.add(k.id);
        w.bekend.add(k.id);
      }
    }
    if (!kamers.size) kamers.add(w.huidigeKamer);
    monsters.sort((a, b) => b.initiatief - a.initiatief);
    S.gevecht = { monsters, volgorde: [held, ...monsters], beurt: 0, ronde: 1, kamers, teller: 0 };
    S.rasterTegels = rasterVoor(w, kamers, S.gevecht.volgorde);
    S.rasterStart = S.tijd;
    S.rasterVan = T.tegelVan(held);
    S.modus = 'gevecht';
    T.ui.toonGevecht(true);
    beginBeurt(S);
  };

  // Wie doet er mee: het monster dat het begon, elk monster in dezelfde kamer als de held,
  // en elk monster dat hem van dichtbij kan zien.
  T.deelnemers = function (w, held, aanleiding) {
    const h = T.tegelVan(held);
    const kamerHeld = T.kamerVan(w, h.x, h.y);
    return w.wezens.filter((m) => {
      if (m.dood || m.kant !== 'monster') return false;
      if (m === aanleiding) return true;
      const p = T.tegelVan(m);
      const k = T.kamerVan(w, p.x, p.y);
      // Buiten is de hele kaart één kamer; dan zou elk monster op het erf meedoen. Daar telt
      // alleen wie de held echt kan zien.
      if (!w.buiten && k && kamerHeld && k === kamerHeld) return true;
      return T.afstand(p, h) <= 8 && T.zichtTussen(w, p, h);
    });
  };

  // Het raster ligt op elke vloertegel van de kamers waarin gevochten wordt, en op de
  // deuropeningen ertussen.
  // Hoe ver het raster buiten om de vechters heen reikt. Binnen bakent de kamer het slagveld af;
  // buiten is er maar één kamer, de hele kaart, en een raster over het hele erf zegt niets meer.
  const RASTER_BUITEN = 9;

  function rasterVoor(w, kamers, vechters) {
    const lijst = [];
    if (w.buiten) {
      const wie = (vechters || []).filter((e) => !e.dood).map((e) => T.tegelVan(e));
      if (!wie.length) return lijst;
      for (let y = 0; y < w.h; y++) {
        for (let x = 0; x < w.b; x++) {
          if (T.tegel(w, x, y) !== 'vloer') continue;
          if (wie.some((p) => T.afstand(p, { x, y }) <= RASTER_BUITEN)) lijst.push({ x, y });
        }
      }
      return lijst;
    }
    for (let y = 0; y < w.h; y++) {
      for (let x = 0; x < w.b; x++) {
        const t = T.tegel(w, x, y);
        if (t === 'vloer' && kamers.has(T.kamerVan(w, x, y).id)) lijst.push({ x, y });
        else if (t === 'deur' && w.burenKamers[y][x].some((id) => kamers.has(id))) lijst.push({ x, y });
      }
    }
    return lijst;
  }

  // Loopt iemand tijdens het gevecht een nieuwe kamer in, dan groeit het raster mee; buiten
  // schuift het gewoon met de vechters mee.
  T.gevechtBijAankomst = function (S, e, t) {
    const g = S.gevecht;
    if (e === S.held) {
      e.ap = Math.max(0, e.ap - 1);
      T.ui.toonAp(e.ap, e.maxAp, 0, true);
    }
    if (S.wereld.buiten) {
      if (e === S.held) S.rasterTegels = rasterVoor(S.wereld, g.kamers, g.volgorde);
      return;
    }
    const k = T.kamerVan(S.wereld, t.x, t.y);
    if (k && !g.kamers.has(k.id)) {
      g.kamers.add(k.id);
      S.wereld.bekend.add(k.id);
      S.rasterTegels = rasterVoor(S.wereld, g.kamers);
    }
  };

  function beginBeurt(S) {
    const g = S.gevecht;
    if (!g) return;
    g.teller++;
    const wie = g.volgorde[g.beurt];
    T.ui.toonVolgorde(S);
    if (wie === S.held) {
      // Kan geen enkel monster de held nog zien of bereiken (een deur dichtgegooid),
      // dan is hij ontsnapt.
      if (!g.monsters.some((m) => !m.dood && kanBijHeld(S, m))) {
        T.eindeGevecht(S, 'kwijt');
        return;
      }
      // Hoeveel punten er in een beurt zitten, hangt af van hoe oud je nu bent.
      S.held.maxAp = T.apVoorLeeftijd(S.held.leeftijd);
      S.held.ap = S.held.maxAp;
      S.spreuk = null;
      S.bezig = false;
      // Een dwaallicht uit de vorige ronde heeft zijn werk gedaan: elk monster had zijn beurt.
      S.lichten = S.lichten.filter((l) => !l.inGevecht);
      T.ververBereik(S);
      knoppenAan(S);
      T.ui.toonAp(S.held.ap, S.held.maxAp, 0, true);
    } else {
      S.bezig = true;
      S.bereik = null;
      T.ui.zetKnoppen(false);
      monsterBeurt(S, wie);
    }
  }

  function volgendeBeurt(S) {
    const g = S.gevecht;
    if (!g) return;
    if (!g.monsters.some((m) => !m.dood)) {
      T.eindeGevecht(S, 'gewonnen');
      return;
    }
    g.beurt = (g.beurt + 1) % g.volgorde.length;
    if (g.beurt === 0) g.ronde++;
    beginBeurt(S);
  }

  T.eindeBeurt = function (S) {
    const g = S.gevecht;
    if (!g || S.bezig || g.volgorde[g.beurt] !== S.held) return;
    S.bezig = true;
    S.bereik = null;
    S.spreuk = null;
    T.ui.zetKnoppen(false);
    volgendeBeurt(S);
  };

  // Na het gevecht is alles wat nog voor een volgende beurt bewaard werd (nabranden, punten
  // kwijt door een windstoot, kijken naar een dwaallicht), voorbij.
  T.eindeGevecht = function (S, reden) {
    S.gevecht = null;
    S.modus = 'verkennen';
    S.bezig = false;
    S.bereik = null;
    S.spreuk = null;
    S.lichten = S.lichten.filter((l) => !l.inGevecht);
    T.ui.toonGevecht(false);
    T.ui.zetKnoppen(false);
    T.ui.bericht(reden === 'kwijt' ? 'Ze zijn je kwijt. Het wordt weer stil.' : 'Het is weer stil.', 'rust');
    for (const m of S.wereld.wezens) {
      m.brandt = 0;
      m.apVerlies = 0;
      m.afgeleid = null;
      if (m.kant === 'monster' && !m.dood) m.dwaalTijd = 2.5;
    }
  };

  T.ververBereik = function (S) {
    const w = S.wereld;
    const held = S.held;
    S.bereik = T.bereik(
      T.tegelVan(held),
      held.ap,
      (x, y) => T.isZichtbaar(w, x, y) && T.isBegaanbaar(w, x, y, { deurenOpenen: true, wezensBlokkeren: true, wie: held }),
      (x, y) => T.isVast(w, x, y),
    );
  };

  function heldPad(S, doel, naast) {
    const w = S.wereld;
    return T.zoekPad(
      T.tegelVan(S.held),
      doel,
      (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: true, wezensBlokkeren: true, wie: S.held }),
      (x, y) => T.isVast(w, x, y),
      { naast },
    );
  }

  // Wat gebeurt er als je in je beurt hierop klikt, en wat kost het? Geeft
  // { tekst, kosten, maanden, kan, doe, pad, lijn } terug. kan = false: wel tonen, niet doen.
  // kosten staat alleen op 0 als het niet aan de punten ligt (te ver, geen zicht).
  T.handelingGevecht = function (S, doel) {
    // Met een spreuk in de hand vraagt elke klik iets anders (zie toveren.js).
    if (S.spreuk) return T.handelingSpreuk(S, doel);
    if (!doel) return null;
    // Wat de tutorial hier anders laat gaan (js/tutorial.js): het water in de fontein is dan voor
    // de meester, ook midden in een gevecht.
    const anders = T.tutorialHandeling && T.tutorialHandeling(S, doel);
    if (anders) return anders;
    const w = S.wereld;
    const held = S.held;
    const ap = held.ap;
    const h = T.tegelVan(held);

    if (doel.wezen && doel.wezen.kant === 'monster' && !doel.wezen.dood) {
      const m = doel.wezen;
      const p = T.tegelVan(m);
      const k = T.SLAAN.kosten;
      if (T.raakt(w, h, p)) return { tekst: `Slaan met je staf (${T.SLAAN.schade.join('–')} schade)`, kosten: k, kan: ap >= k, doe: () => slaan(S, m, []) };
      const pad = heldPad(S, p, true);
      if (!pad) return { tekst: 'Je kunt er niet bij', kosten: 0, kan: false };
      const totaal = pad.length + k;
      return { tekst: 'Erheen lopen en slaan', kosten: totaal, kan: ap >= totaal, doe: () => slaan(S, m, pad), pad };
    }

    if (doel.voorwerp && doel.voorwerp.soort === 'fontein') {
      if (S.fonteinLeeg) return { tekst: 'De fontein staat droog', kosten: 0, kan: false };
      const v = doel.voorwerp;
      const pad = T.raakt(w, h, v) ? [] : heldPad(S, v, true);
      if (!pad) return null;
      const kosten = pad.length + T.FONTEIN.kosten;
      return {
        tekst: `De laatste slok: ${T.duurTekst(T.FONTEIN.maanden)} jonger`,
        kosten, kan: ap >= kosten, doe: () => drinken(S, pad), pad,
      };
    }
    if (doel.voorwerp && doel.voorwerp.soort === 'trap') return { tekst: 'Niet midden in een gevecht', kosten: 0, kan: false };

    if (doel.x === h.x && doel.y === h.y) return null;
    if (!T.isZichtbaar(w, doel.x, doel.y) || !T.isBegaanbaar(w, doel.x, doel.y, { deurenOpenen: true, wezensBlokkeren: true, wie: held })) return null;
    const pad = heldPad(S, { x: doel.x, y: doel.y }, false);
    if (!pad) return null;
    return { tekst: 'Lopen', kosten: pad.length, kan: ap >= pad.length, doe: () => lopen(S, pad), pad };
  };

  function bezigMet(S) {
    S.bezig = true;
    T.ui.zetKnoppen(false);
    T.ui.verbergTooltip();
  }

  async function lopen(S, pad) {
    bezigMet(S);
    await T.anim.loop(S.held, pad);
    naHandeling(S);
  }

  async function slaan(S, m, pad) {
    bezigMet(S);
    if (pad.length) await T.anim.loop(S.held, pad);
    if (m.dood || !T.raakt(S.wereld, T.tegelVan(S.held), T.tegelVan(m))) {
      naHandeling(S);
      return;
    }
    S.held.ap -= T.SLAAN.kosten;
    T.ui.toonAp(S.held.ap, S.held.maxAp, 0, true);
    await T.anim.uitval(S.held, T.tegelVan(m));
    const n = worp(T.SLAAN.schade);
    T.ui.bericht(`Je slaat de ${m.naam}: ${n} schade.`);
    raak(S, m, n);
    await T.anim.wacht(S, 320);
    naHandeling(S);
  }

  async function drinken(S, pad) {
    bezigMet(S);
    if (pad.length) await T.anim.loop(S.held, pad);
    S.held.ap -= T.FONTEIN.kosten;
    T.drinkLaatsteSlok(S);
    await T.anim.wacht(S, 350);
    naHandeling(S);
  }

  // De fontein heeft nog één slok, en die maakt je twee jaar jonger. Wanneer je hem neemt,
  // is een keuze: nu, midden in een gevecht, of bewaren voor erger.
  T.drinkLaatsteSlok = function (S) {
    S.fonteinLeeg = true;
    T.verouder(S, -T.FONTEIN.maanden, false);
    T.ui.bericht(`Je drinkt de laatste slok en voelt je ${T.duurTekst(T.FONTEIN.maanden)} jonger. De fontein staat droog.`, 'goed');
  };

  // Een open deur naast de held, waar niemand in staat. Die kan hij dichtgooien: een
  // monster opent geen deuren, dus zo snijd je een achtervolger af.
  T.deurNaastHeld = function (S) {
    const w = S.wereld;
    const h = T.tegelVan(S.held);
    for (const d of w.deuren.values()) {
      if (d.staat === 'open' && T.raakt(w, h, d) && !T.wezenOp(w, d.x, d.y)) return d;
    }
    return null;
  };

  T.deurDicht = function (S) {
    const g = S.gevecht;
    if (!g || S.bezig || g.volgorde[g.beurt] !== S.held) return;
    const d = T.deurNaastHeld(S);
    if (!d || S.held.ap < T.DEUR_SLUITEN) return;
    S.held.ap -= T.DEUR_SLUITEN;
    d.staat = 'dicht';
    T.ui.bericht('Je gooit de deur dicht.');
    naHandeling(S);
  };

  // De knoppen staan aan in de eigen beurt; de deurknop verschijnt alleen naast een open deur.
  // Slaan is gekozen zolang er geen spreuk in de hand is.
  function knoppenAan(S) {
    T.ui.zetKnoppen(true, S.spreuk || 'slaan');
    T.ui.toonDeurKnop(!!T.deurNaastHeld(S), S.held.ap >= T.DEUR_SLUITEN);
  }

  function naHandeling(S) {
    const g = S.gevecht;
    if (!g || S.modus !== 'gevecht') return;
    if (!g.monsters.some((m) => !m.dood)) {
      T.eindeGevecht(S, 'gewonnen');
      return;
    }
    S.bezig = false;
    T.ververBereik(S);
    knoppenAan(S);
    T.ui.toonAp(S.held.ap, S.held.maxAp, 0, true);
    // Zijn de punten op, dan gaat de beurt vanzelf over. De teller voorkomt dat deze
    // vertraagde aanroep een latere beurt afbreekt.
    if (S.held.ap <= 0) {
      const teller = g.teller;
      T.anim.wacht(S, 450).then(() => {
        if (S.gevecht === g && g.teller === teller) T.eindeBeurt(S);
      });
    }
  }

  // Een monster verliest levenspunten. De held niet: die wordt ouder (zie T.verouder).
  function raak(S, doel, n) {
    doel.leven = Math.max(0, doel.leven - n);
    doel.flits = 0.3;
    T.anim.tekst(S, doel, '-' + n, '#ffd36b');
    if (doel.leven <= 0) sterf(S, doel);
    else T.ui.toonVolgorde(S);
  }

  // Ook buiten een gevecht: in een scène kan de meester een monster vellen (js/tutorial.js), en
  // dan is er geen beurtvolgorde om het uit te halen.
  function sterf(S, e) {
    e.dood = true;
    e.sterfTijd = 0;
    e.pad = [];
    e.brandt = 0;
    e.gelokt = null;
    T.ui.bericht(`De ${e.naam} is verslagen.`, 'goed');
    const g = S.gevecht;
    if (!g) return;
    const i = g.volgorde.indexOf(e);
    if (i >= 0) {
      g.volgorde.splice(i, 1);
      if (i < g.beurt) g.beurt--;
    }
    T.ui.toonVolgorde(S);
  }

  // Brandt een monster aan het begin van zijn eigen beurt dood, dan is de volgorde al
  // opgeschoven: wie na hem kwam, staat nu op zijn plek en is dus meteen aan de beurt.
  function naDoodInEigenBeurt(S) {
    const g = S.gevecht;
    if (!g) return;
    if (!g.monsters.some((m) => !m.dood)) {
      T.eindeGevecht(S, 'gewonnen');
      return;
    }
    if (g.beurt >= g.volgorde.length) {
      g.beurt = 0;
      g.ronde++;
    }
    beginBeurt(S);
  }

  T.heldGevallen = function (S) {
    S.modus = 'dood';
    S.bezig = true;
    S.gevecht = null;
    T.ui.toonGevecht(false);
    T.ui.bericht('Je bent honderd geworden.', 'gevaar');
    T.anim.wacht(S, 1100).then(() => {
      T.ui.toonOverlay(
        'Honderd',
        '<p>Je bent honderd jaar geworden. Je gaat zitten waar je staat, net als je meester, en sluit je ogen. Wim zal de trap nog één keer vegen.</p>',
        'Opnieuw proberen',
        // Helemaal opnieuw: T.nieuwSpel zet de heer, de inner en de handel niet terug.
        () => location.reload(),
      );
    });
  };

  // Met hoeveel punten begint een monster zijn beurt? Een windstoot vanaf Geoefend laat het
  // wankelen, en dan heeft het er deze ene beurt minder.
  T.monsterAp = (m) => Math.max(0, m.maxAp - (m.apVerlies || 0));

  // Wat doet een monster in zijn beurt? Het loopt zo kort mogelijk naar de held, en slaat
  // toe zo vaak als de overgebleven punten toelaten. Haalt het de held niet, dan komt het
  // zo dichtbij als het kan. Los van het scherm, zodat het te toetsen is.
  T.planMonsterBeurt = function (w, m, held) {
    const ap = T.monsterAp(m);
    const pad = T.zoekPad(
      T.tegelVan(m),
      T.tegelVan(held),
      (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: false, wezensBlokkeren: true, wie: m }),
      (x, y) => T.isVast(w, x, y),
      { naast: true },
    );
    if (pad === null) return { pad: [], aanvallen: 0, kanNiet: true };
    const stappen = Math.min(pad.length, ap);
    const aanvallen = stappen === pad.length ? Math.floor((ap - stappen) / m.aanval.kosten) : 0;
    return { pad: pad.slice(0, stappen), aanvallen, kanNiet: false };
  };

  // Een monster dat naar een dwaallicht kijkt, loopt er in zijn beurt heen in plaats van aan
  // te vallen, zo ver als zijn punten reiken.
  T.planAfgeleid = function (w, m, licht) {
    const pad = T.lokPad(w, m, licht) || [];
    return { pad: pad.slice(0, T.monsterAp(m)), aanvallen: 0, kanNiet: false };
  };

  async function monsterBeurt(S, m) {
    const w = S.wereld;
    const held = S.held;
    await T.anim.wacht(S, 260);
    if (!S.gevecht) return;
    // Nabranden van een vuurschicht gaat voor: daar begint de beurt mee, en soms eindigt hij
    // er ook mee.
    if (m.brandt > 0) {
      const n = m.brandt;
      m.brandt = 0;
      T.ui.bericht(`De ${m.naam} brandt na: ${n} schade.`);
      raak(S, m, n);
      await T.anim.wacht(S, 420);
      if (!S.gevecht) return;
      if (m.dood) {
        naDoodInEigenBeurt(S);
        return;
      }
    }
    // Kijkt het naar een dwaallicht, dan loopt het daarheen en slaat het niet. Allebei de
    // gevolgen van een spreuk gelden maar één beurt.
    const afgeleid = m.afgeleid;
    const plan = afgeleid ? T.planAfgeleid(w, m, afgeleid) : T.planMonsterBeurt(w, m, held);
    m.afgeleid = null;
    m.apVerlies = 0;
    if (afgeleid) {
      m.vraag = 1.2;
      T.ui.bericht(`De ${m.naam} gaat op het dwaallicht af.`);
    }
    if (plan.pad.length) await T.anim.loop(m, plan.pad);
    for (let i = 0; i < plan.aanvallen; i++) {
      if (held.dood || !S.gevecht) return;
      if (!T.raakt(w, T.tegelVan(m), T.tegelVan(held))) break;
      await T.anim.uitval(m, T.tegelVan(held));
      const n = worp(m.aanval.maanden);
      T.ui.bericht(`De ${m.naam} ${m.aanval.zin}. Het kost je ${T.duurTekst(n)}.`, 'gevaar');
      T.verouder(S, n, true);
      await T.anim.wacht(S, 380);
    }
    if (held.dood || !S.gevecht) return;
    await T.anim.wacht(S, 160);
    volgendeBeurt(S);
  }

  // Kan dit monster de held nog zien of bereiken? Andere wezens tellen hier niet als
  // obstakel: die gaan nog opzij.
  function kanBijHeld(S, m) {
    const w = S.wereld;
    const a = T.tegelVan(m);
    const h = T.tegelVan(S.held);
    if (T.zichtTussen(w, a, h)) return true;
    const pad = T.zoekPad(a, h, (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: false }), (x, y) => T.isVast(w, x, y), { naast: true });
    return pad !== null;
  }

  // Voor toveren.js: een spreuk in een gevecht gaat door dezelfde molen als slaan. Knoppen uit,
  // effect, en daarna is de held weer aan zet.
  T.bezigMet = bezigMet;
  T.naHandeling = naHandeling;
  T.raak = raak;
  T.knoppenAan = knoppenAan;
})(globalThis.Toren = globalThis.Toren || {});
