// Het gevecht in beurten. Het begint op de plek waar iedereen staat: wie onderweg is, maakt
// zijn stap af, daarna verschijnt het raster op dezelfde vloer en gaat de wereld verder in
// beurten. Er is geen apart gevechtsscherm, en dat is de kern van het idee: de kamer waarin
// je rondliep, is het slagveld, met dezelfde deuren en kisten.
(function (T) {
  'use strict';

  // Eén potje actiepunten per beurt voor lopen (1 per stap), slaan en een deur dichtgooien. Een
  // klap kost levenspunten, bij een monster net als bij de schout (js/wereld.js, T.WEZENS). Tot
  // 25 sep kon de held ook toveren en was zijn leeftijd zijn levensbalk; dat ging eruit met het
  // oude spel (ontwerp/werklijst.md, punt 7b).
  T.SLAAN = { kosten: 3, schade: [3, 5] };
  T.DEUR_SLUITEN = 1;

  const worp = (b) => b[0] + Math.floor(Math.random() * (b[1] - b[0] + 1));

  // Stap 1 van de overgang: de wereld bevriest. De spellus roept beginGevecht aan zodra
  // niemand meer onderweg is.
  T.startGevecht = function (S, aanleiding, heldBegint) {
    if (S.modus !== 'verkennen') return;
    S.modus = 'overgang';
    S.naLopen = null;
    S.overgang = { aanleiding };
    // Wie onderweg is, maakt zijn stap af en blijft dan staan.
    for (const e of S.wereld.wezens) e.pad = e.onderweg ? [e.pad[0]] : [];
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
      S.held.ap = S.held.maxAp;
      S.bezig = false;
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
    T.ui.zetKnoppen(false);
    volgendeBeurt(S);
  };

  T.eindeGevecht = function (S, reden) {
    S.gevecht = null;
    S.modus = 'verkennen';
    S.bezig = false;
    S.bereik = null;
    T.ui.toonGevecht(false);
    T.ui.zetKnoppen(false);
    T.ui.bericht(reden === 'kwijt' ? 'Ze zijn je kwijt. Het wordt weer stil.' : 'Het is weer stil.', 'rust');
    for (const m of S.wereld.wezens) {
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
  // { tekst, kosten, kan, doe, pad } terug. kan = false: wel tonen, niet doen.
  // kosten staat alleen op 0 als het niet aan de punten ligt (te ver, geen zicht).
  T.handelingGevecht = function (S, doel) {
    if (!doel) return null;
    const w = S.wereld;
    const held = S.held;
    const ap = held.ap;
    const h = T.tegelVan(held);

    if (doel.wezen && doel.wezen.kant === 'monster' && !doel.wezen.dood) {
      const m = doel.wezen;
      const p = T.tegelVan(m);
      const k = T.SLAAN.kosten;
      if (T.raakt(w, h, p)) return { tekst: `Slaan (${T.SLAAN.schade.join('–')} schade)`, kosten: k, kan: ap >= k, doe: () => slaan(S, m, []) };
      const pad = heldPad(S, p, true);
      if (!pad) return { tekst: 'Je kunt er niet bij', kosten: 0, kan: false };
      const totaal = pad.length + k;
      return { tekst: 'Erheen lopen en slaan', kosten: totaal, kan: ap >= totaal, doe: () => slaan(S, m, pad), pad };
    }


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
  function knoppenAan(S) {
    T.ui.zetKnoppen(true, 'slaan');
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

  // Een klap kost levenspunten, een monster net zo goed als de schout. Wie op nul komt, valt: een
  // monster is dan verslagen, en voor de schout is het het einde (T.heldGevallen; voorlopig, tot
  // punt 13 van de werklijst zegt wat vallen echt betekent).
  function raak(S, doel, n) {
    doel.leven = Math.max(0, doel.leven - n);
    doel.flits = 0.3;
    T.anim.tekst(S, doel, '-' + n, doel === S.held ? '#f3b1a5' : '#ffd36b');
    if (doel.leven > 0) T.ui.toonVolgorde(S);
    else if (doel === S.held) T.heldGevallen(S);
    else sterf(S, doel);
  }
  // De ene plek waar een klap landt, ook voor de toetsen (test/regels.test.cjs).
  T.raak = raak;

  // Werkt ook zonder gevecht: dan is er geen beurtvolgorde om het uit te halen.
  function sterf(S, e) {
    e.dood = true;
    e.sterfTijd = 0;
    e.pad = [];
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

  // De schout valt, en dat is voorlopig het einde van het spel.
  T.heldGevallen = function (S) {
    const held = S.held;
    held.dood = true;
    held.sterfTijd = 0;
    held.pad = [];
    S.modus = 'dood';
    S.bezig = true;
    S.gevecht = null;
    T.ui.toonGevecht(false);
    T.ui.bericht('Je valt, en je staat niet meer op.', 'gevaar');
    T.anim.wacht(S, 1100).then(() => {
      T.ui.toonOverlay(
        'Gevallen',
        '<p>Je valt, en je staat niet meer op.</p>' +
          '<p>De heer schrijft de nieuwe schout dat die beter moet opletten: zo’n begrafenis kost ook weer geld.</p>',
        'Opnieuw beginnen',
        () => T.nieuwSpel(),
      );
    });
  };

  // Met hoeveel punten begint een monster zijn beurt? Met al zijn punten.
  T.monsterAp = (m) => m.maxAp;

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

  async function monsterBeurt(S, m) {
    const w = S.wereld;
    const held = S.held;
    await T.anim.wacht(S, 260);
    if (!S.gevecht) return;
    const plan = T.planMonsterBeurt(w, m, held);
    if (plan.pad.length) await T.anim.loop(m, plan.pad);
    for (let i = 0; i < plan.aanvallen; i++) {
      if (held.dood || !S.gevecht) return;
      if (!T.raakt(w, T.tegelVan(m), T.tegelVan(held))) break;
      await T.anim.uitval(m, T.tegelVan(held));
      const n = worp(m.aanval.schade);
      T.ui.bericht(`De ${m.naam} ${m.aanval.zin}: ${n} schade.`, 'gevaar');
      raak(S, held, n);
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
})(globalThis.Toren = globalThis.Toren || {});
