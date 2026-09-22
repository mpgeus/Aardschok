// De tutorial: één middag op het erf, met de oude meester in zijn moestuin (ontwerp/verhaal.md, "De
// opening: de meester doet de tutorial en sterft", "Hij speelt met zijn leeftijd" en "Hij doet zijn
// moestuin, tot hij sterft"). Hij werkt door terwijl hij praat en legt niets uit: hij vraagt je
// dingen. Zo leer je lopen, sluipen, een deur dichtgooien en slaan met je staf (kost niets), en zie
// je hem ondertussen met zijn leeftijd spelen: een vuurschicht op een oude ton (zevenennegentig
// wordt achtennegentig, en hij lacht erom), het laatste water uit de fontein (weer zesennegentig,
// "het is maar een getal") en de ton kapotmeppen met zijn staf (kost niets). Dan komt er iets de
// trap af, hij handelt het af, en dat kost hem zijn laatste jaar: hij sterft aan zijn eigen spreuk,
// bij zijn moestuin. Wim rouwt om hem, en jij neemt het over.
//
// Hoe het in elkaar zit:
//   - T.beginOpHetErf(S) zet het begin klaar (js/main.js, bij een nieuw spel): de held op het erf
//     voor de deur van de toren, en wat alleen de tutorial nodig heeft — twee tonnen bij de
//     moestuin, een zak zaaigoed in de voorraadkamer, de slijmkruiper vlak achter die deur. Niets
//     daarvan staat in kaarten/wereld.tmj: daar tekent Marcel in. Waar de tonnen komen, volgt uit
//     waar hij de moestuin en de meester neerzette.
//   - T.startTutorial(S) speelt de eerste scène. T.werkTutorialBij(S) kijkt elk beeld of de speler
//     gedaan heeft wat de meester vroeg, en start dan de volgende.
//   - De scènes zijn gewone code op het regieboek (js/regie.js). Overslaan (Escape) geeft daardoor
//     dezelfde wereld als uitkijken.
//   - De teksten staan in js/gesprekken.js (T.TUTORIAL_TEKST), zodat ze te polijsten zijn zonder
//     deze code te lezen.
//   - Alle jaren, ook die van de meester, lopen via T.verouder.
(function (T) {
  'use strict';

  // De toren staat in code (js/wereld.js), dus hier mogen vaste plekken staan. De slijmkruiper zit
  // eerst vlak achter de deur van de voorraadkamer: wie die opendoet, wordt gezien, ook gebukt, en
  // leert zo de deur dichtgooien. Daarna kruipt hij naar achteren, en dan kom je alleen gebukt
  // ongezien bij de zak (met sluipen ziet hij je pas van drie tegels, anders van vijf).
  const TOREN = {
    slijmVoor: { x: 12, y: 4 },
    slijmAchter: { x: 17, y: 6 },
    zak: { x: 13, y: 6 },
  };

  const tekst = (naam) => (T.TUTORIAL_TEKST && T.TUTORIAL_TEKST[naam]) || [];
  const punt = (o) => (o.tx != null ? { x: o.tx, y: o.ty } : { x: o.x, y: o.y });
  const midden = (a, b) => {
    const p = punt(a);
    const q = punt(b);
    return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
  };
  const zetVlag = (S, naam) => (T.zetVlag ? T.zetVlag(S, naam) : null);

  // Wie midden in een stap is, maakt die af; daarna staat hij stil voor de scène.
  function stil(e) {
    e.pad = e.onderweg && e.pad.length ? [e.pad[0]] : [];
  }

  // ---------------------------------------------------------------- plekken

  // Is deze tegel vrij om iets of iemand neer te zetten: begaanbaar, niemand erop, geen voorwerp
  // en geen overgang naar een ander gebied?
  function vrij(w, x, y) {
    return (
      T.isBegaanbaar(w, x, y, { wezensBlokkeren: true }) &&
      !T.overgangOp(w, x, y) &&
      !w.voorwerpen.some((v) => v.x === x && v.y === y)
    );
  }

  // De vrije tegel het dichtst bij p (p zelf als die vrij is), in ringen eromheen, en niet een van
  // de tegels in `behalve`.
  function vrijBij(w, p, behalve) {
    const nee = (x, y) => (behalve || []).some((q) => q && q.x === x && q.y === y);
    for (let r = 0; r <= 8; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = p.x + dx;
          const y = p.y + dy;
          if (vrij(w, x, y) && !nee(x, y)) return { x, y };
        }
      }
    }
    return { x: p.x, y: p.y };
  }

  // Een vrije tegel naast `doel` (zo dat je het kunt raken), zo dicht mogelijk bij `wie`. Waar
  // `wie` zelf al staat, telt ook.
  function naastTegel(w, doel, wie) {
    const d = punt(doel);
    let beste = null;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const p = { x: d.x + dx, y: d.y + dy };
      const hierAl = wie && wie.tx === p.x && wie.ty === p.y;
      if (!hierAl && !vrij(w, p.x, p.y)) continue;
      if (!T.raakt(w, p, d)) continue;
      const afstand = wie ? Math.hypot(p.x - wie.tx, p.y - wie.ty) : 0;
      if (!beste || afstand < beste.afstand) beste = { x: p.x, y: p.y, afstand };
    }
    return beste ? { x: beste.x, y: beste.y } : vrijBij(w, d);
  }

  // Waar alles op het erf komt, afgeleid van de moestuin en de meester zoals Marcel ze in Tiled
  // neerzette: de tonnen tegen de westkant van de tuin, en de tuin zelf (`bed`), want aan de rand
  // daarvan staat de meester aan het eind.
  function erfPlekken(w, meester) {
    const tuin = w.voorwerpen.find((v) => v.soort === 'moestuin');
    const b = (tuin && tuin.beslaat) || [1, 1];
    const x1 = tuin ? tuin.x : meester.tx + 1;
    const y1 = tuin ? tuin.y : meester.ty + 1;
    const x2 = x1 + b[0] - 1;
    const y2 = y1 + b[1] - 1;
    const o = (w.overgangen || []).find((x) => x.naar === 'toren');
    const deur = o ? { x: o.x, y: o.y } : vrijBij(w, { x: x2 + 6, y: y2 + 3 });
    const bijMeester = punt(meester);
    const tonOud = vrijBij(w, { x: x1 - 1, y: Math.floor((y1 + y2) / 2) }, [bijMeester]);
    const tonJij = vrijBij(w, { x: x1 - 1, y: y2 }, [bijMeester, tonOud]);
    return {
      bed: { x1, y1, x2, y2 },
      tuin: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
      deur,
      tonOud,
      tonJij,
      thuis: meester.thuis ? { x: meester.thuis.x, y: meester.thuis.y } : bijMeester,
    };
  }

  // Waar de meester zijn laatste stand houdt: de vrije tegel pal naast zijn tuin die het dichtst
  // bij hem is (bij gelijke stand: die het dichtst bij de toren). Hij hoeft er dus nauwelijks voor te
  // lopen, en hij sterft bij zijn moestuin.
  function standBijDeTuin(w, plek, m) {
    const { x1, y1, x2, y2 } = plek.bed;
    const mp = punt(m);
    let beste = null;
    for (let y = y1 - 1; y <= y2 + 1; y++) {
      for (let x = x1 - 1; x <= x2 + 1; x++) {
        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) continue; // in de tuin zelf
        const hierAl = x === mp.x && y === mp.y;
        if (!hierAl && !vrij(w, x, y)) continue;
        const d = T.afstand(mp, { x, y }) * 100 + Math.hypot(x - plek.deur.x, y - plek.deur.y);
        if (!beste || d < beste.d) beste = { x, y, d };
      }
    }
    return beste ? { x: beste.x, y: beste.y } : mp;
  }

  // Staat de held pal voor of achter de meester in beeld (dezelfde kolom op het scherm), dan zie je
  // de meester niet meer. Dan stapt de meester opzij, naar een vrije tegel naast hem die wel te
  // zien is: hij werkt door terwijl hij praat, dus een stapje meer of minder valt niet op.
  async function uitHetZicht(S, m) {
    const kolom = (p) => p.x - p.y;
    const hp = punt(S.held);
    const mp = punt(m);
    if (kolom(hp) !== kolom(mp) || T.afstand(hp, mp) > 2) return;
    let beste = null;
    for (const [dx, dy] of [[1, -1], [-1, 1], [1, 0], [0, -1], [-1, 0], [0, 1]]) {
      const p = { x: mp.x + dx, y: mp.y + dy };
      if (kolom(p) === kolom(hp) || !vrij(S.wereld, p.x, p.y)) continue;
      const d = Math.hypot(p.x - hp.x, p.y - hp.y);
      if (!beste || d < beste.d) beste = { x: p.x, y: p.y, d };
    }
    if (beste) await T.regie.loop(m, beste.x, beste.y);
  }

  // ---------------------------------------------------------------- het begin

  // Een nieuw spel begint op het erf. Geeft niets terug; zet S.wereld, S.held en S.tutorial. Is er
  // geen buitenkaart of geen meester op (Marcel is aan het tekenen), dan begint het spel gewoon
  // zonder tutorial: op het erf als dat er is, anders in de hal.
  T.beginOpHetErf = function (S) {
    S.tutorial = null;
    const toren = T.gebied(S, 'toren');
    const held = toren.wezens.find((e) => e.soort === 'held');
    S.held = held;
    S.wereld = toren;
    const buiten = toren.overgangen && toren.overgangen[0] ? toren.overgangen[0].naar : null;
    const erf = buiten ? T.gebied(S, buiten) : null;
    if (!erf) return;
    const land = T.landingIn(erf, 'toren');
    T.zetInGebied(S, held, buiten, land.x, land.y);
    S.wereld = erf;
    // Je staat er al: de naam van het erf hoeft bij de eerste stap niet nog eens in beeld.
    if (S.bezocht && erf.kamers[0]) S.bezocht.add(erf.kamers[0].id);
    const meester = erf.wezens.find((e) => e.soort === 'meester' && !e.dood);
    if (!meester) {
      console.warn('Aardschok: er staat geen meester op het erf (wezen "meester" in Tiled), dus er is geen tutorial.');
      return;
    }

    const plek = erfPlekken(erf, meester);
    const tonOud = { soort: 'ton', x: plek.tonOud.x, y: plek.tonOud.y };
    const tonJij = { soort: 'ton', x: plek.tonJij.x, y: plek.tonJij.y };
    erf.voorwerpen.push(tonOud, tonJij);
    const zak = { soort: 'zak', x: TOREN.zak.x, y: TOREN.zak.y };
    toren.voorwerpen.push(zak);
    const wim = toren.wezens.find((e) => e.soort === 'wim') || null;
    const slijm = toren.wezens.find((e) => e.soort === 'slijm') || null;

    // Deze middag dwaalt er geen monster: wat Marcel op de kaart zette, blijft staan waar het
    // staat tot de tutorial voorbij is, en de slijmkruiper zit vlak achter de deur. Staat er een te
    // dicht bij de moestuin, dan kan hij de les toch verstoren; dat moet Marcel horen.
    const vast = [];
    for (const e of [...erf.wezens, slijm]) {
      if (!e || e.kant !== 'monster') continue;
      vast.push({ e, dwaalt: e.dwaalt, straal: e.straal, thuis: e.thuis });
      e.dwaalt = false;
      e.pad = [];
      if (e !== slijm && T.afstand(punt(e), plek.tonOud) <= (e.zicht || 0) + 3) {
        console.warn(`Aardschok: de ${e.naam} op (${e.tx}, ${e.ty}) staat dicht bij de moestuin; hij kan de tutorial verstoren.`);
      }
    }
    if (slijm) T.zetInGebied(S, slijm, 'toren', TOREN.slijmVoor.x, TOREN.slijmVoor.y);

    S.tutorial = {
      fase: 'aankomst', // aankomst → naarMeester → boodschap → slaan → einde → klaar
      bezig: null, // de naam van de scène die nu loopt
      erf, toren, meester, wim, slijm, tonOud, tonJij, zak, plek, vast,
      wimThuis: wim && wim.thuis ? { x: wim.thuis.x, y: wim.thuis.y } : null,
      wimStraal: wim ? wim.straal : 0,
      bijMeester: false, // je klikte op de meester en liep naar hem toe
      wimBinnen: false, // Wim heeft je in de hal begroet
      geschept: false, // de laatste slok zit in de kom
      wimSchep: false, // Wim zag je scheppen en zegt er iets van
      geven: false, // je gaf de meester zijn spullen; de scène volgt het volgende beeld
      gevecht: false, // er liep een gevecht (de deurles)
      skelet: null,
      klaar: false,
    };
  };

  // Na het titelscherm: de eerste scène.
  T.startTutorial = function (S) {
    const t = S.tutorial;
    if (!t || t.fase !== 'aankomst') return null;
    T.ui.plek('Het erf');
    return speel(S, t, 'roepen', roepen);
  };

  // ---------------------------------------------------------------- de scènes

  function speel(S, t, naam, scene) {
    t.bezig = naam;
    return T.regie.speel(S, () => scene(S, t)).then(() => {
      t.bezig = null;
    });
  }

  async function zegAlles(wie, naam, pauze) {
    const regels = tekst(naam);
    for (let i = 0; i < regels.length; i++) {
      await T.regie.zeg(wie, regels[i]);
      if (pauze && i < regels.length - 1) await T.regie.wacht(pauze);
    }
  }

  // Het getal boven zijn hoofd: na "+1 jaar" of "−2 jaar" ook wat hij nu is. De held heeft
  // daar zijn paneel voor; de meester niet.
  function toonJaren(S, e) {
    if (T.anim && T.anim.tekst) T.anim.tekst(S, e, `${T.jaren(e.leeftijd)} jaar`, '#f3ead2', { na: 0.8, duur: 1.6 });
  }

  function breek(v) {
    const eig = T.VOORWERPEN[v.soort];
    if (eig && eig.breekt) v.soort = eig.breekt;
  }

  // Het begin: de camera op de meester in zijn tuin, en hij roept je.
  async function roepen(S, t) {
    const R = T.regie;
    R.camera(t.meester);
    await R.wacht(0.8);
    R.kijk(t.meester, S.held);
    await zegAlles(t.meester, 'roepen');
    R.camera(null);
    t.fase = 'naarMeester';
  }

  // Je staat bij hem: de vuurschicht op de oude ton, en de boodschap.
  async function ton(S, t) {
    const R = T.regie;
    const m = t.meester;
    stil(m);
    await uitHetZicht(S, m);
    R.kijk(m, S.held);
    const voor = tekst('tonVoor');
    if (voor[0]) await R.zeg(m, voor[0]);
    // Een paar stappen naar de ton toe, zodat jij niet tussen hem en zijn doel staat.
    const schiet = vrijBij(S.wereld, { x: t.tonOud.x - 2, y: t.tonOud.y }, [punt(S.held)]);
    await R.loop(m, schiet.x, schiet.y);
    R.kijk(m, t.tonOud);
    for (const regel of voor.slice(1)) await R.zeg(m, regel);
    // Zevenennegentig wordt achtennegentig. De ton vangt vuur, maar staat er nog.
    await R.tover(m, 'vuurschicht', t.tonOud);
    toonJaren(S, m);
    await R.wacht(1);
    R.kijk(m, S.held);
    await zegAlles(m, 'tonNa');
    await zegAlles(m, 'boodschap');
    t.fase = 'boodschap';
    zetVlag(S, 'boodschapGevraagd');
  }

  // De eerste keer in de hal: Wim.
  async function wimBinnen(S, t) {
    T.regie.kijk(t.wim, S.held);
    await zegAlles(t.wim, 'wimBinnen');
  }

  async function wimSchep(S, t) {
    T.regie.kijk(t.wim, S.held);
    await zegAlles(t.wim, 'wimSchep');
  }

  // Na de deurles: de slijmkruiper kruipt naar achteren, en Wim zegt hoe het verder moet.
  async function terugkruipen(S, t) {
    const R = T.regie;
    const s = t.slijm;
    s.dwaalt = false;
    await R.loop(s, TOREN.slijmAchter.x, TOREN.slijmAchter.y);
    if (t.wim && S.wereld.wezens.includes(t.wim)) {
      R.kijk(t.wim, S.held);
      await zegAlles(t.wim, 'terugkruipen');
    }
  }

  // Je brengt hem zijn water en zijn zaaigoed. Hij drinkt het laatste water van de fontein
  // (weer zesennegentig) en mept de oude ton kapot met zijn staf. Dan jij.
  async function drinken(S, t) {
    const R = T.regie;
    const m = t.meester;
    stil(m);
    await uitHetZicht(S, m);
    R.kijk(m, S.held);
    S.inventaris.delete('kom');
    S.inventaris.delete('zak');
    T.ui.toonInventaris(S);
    await zegAlles(m, 'drinkenVoor');
    await R.wacht(0.6);
    T.verouder(S, -T.FONTEIN.maanden, false, m);
    toonJaren(S, m);
    await R.wacht(1.2);
    await zegAlles(m, 'drinkenNa');
    const bij = naastTegel(S.wereld, t.tonOud, m);
    await R.loop(m, bij.x, bij.y);
    R.kijk(m, t.tonOud);
    await R.sla(m, t.tonOud, () => breek(t.tonOud));
    await R.wacht(0.5);
    R.kijk(m, S.held);
    await zegAlles(m, 'staf');
    R.kijk(m, t.tonJij);
    await zegAlles(m, 'jij');
    t.fase = 'slaan';
    zetVlag(S, 'tonGevraagd');
  }

  // Het einde, in één scène met drie hoofdstukken: wie tijdens het gevecht op Escape drukt, slaat
  // het gevecht over, niet Wim die daarna rouwt (T.regie.hoofdstuk).
  async function einde(S, t) {
    await goedzo(S, t);
    T.regie.hoofdstuk();
    await onraad(S, t);
    await laatsteSpreuk(S, t);
    T.regie.hoofdstuk();
    await rouw(S, t);
  }

  // Jij sloeg de tweede ton kapot. Hij draait zich weer naar zijn bonen.
  async function goedzo(S, t) {
    const R = T.regie;
    const m = t.meester;
    stil(m);
    await uitHetZicht(S, m);
    R.kijk(m, S.held);
    await zegAlles(m, 'goedzo');
    R.kijk(m, t.plek.tuin);
    await zegAlles(m, 'bonen');
    await R.wacht(1.5);
  }

  // Waar Wim heen vlucht als hij de toren uit komt: halverwege naar de meester, net naast de weg
  // die wat er achter hem aan komt straks neemt. Dan loopt het vlak langs hem, en is hij na afloop
  // gauw bij zijn meester.
  function vluchtplek(w, deur, stand) {
    const pad = T.zoekPad(deur, stand, (x, y) => T.isBegaanbaar(w, x, y), (x, y) => T.isVast(w, x, y), { naast: true }) || [];
    const opPad = (x, y) => pad.some((p) => p.x === x && p.y === y);
    const half = pad[Math.floor(pad.length / 2)] || deur;
    let beste = null;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = half.x + dx;
        const y = half.y + dy;
        if (!vrij(w, x, y) || opPad(x, y)) continue;
        const d = Math.hypot(dx, dy);
        if (!beste || d < beste.d) beste = { x, y, d };
      }
    }
    return beste ? { x: beste.x, y: beste.y } : vrijBij(w, deur, [deur]);
  }

  // Wim komt de toren uit rennen en roept, en vlucht halverwege naar de meester. De meester stapt
  // naar de rand van zijn tuin, en achter Wim aan komt het skelet naar buiten (ontwerp: "er komt
  // iets van boven de trap af dat er niet hoort te zijn"; wat, zegt het ontwerp niet).
  async function onraad(S, t) {
    const R = T.regie;
    const w = S.wereld;
    const m = t.meester;
    const wim = t.wim;
    const deur = t.plek.deur;
    // Waar iedereen heen gaat, ligt vast voordat er iemand beweegt: zo komt uitkijken precies uit
    // waar overslaan uitkomt, ook al lopen Wim en de meester tegelijk.
    const stand = standBijDeTuin(w, t.plek, m);
    const weg = vluchtplek(w, deur, stand);
    // Waar jij gaat staan als hij "blijf achter me" zegt: twee stappen achter hem, weg van de kant
    // waar het vandaan komt. Dat is niet per se de toren: het loopt om de tuin heen, dus telt het
    // laatste stuk van zijn weg.
    const aanloop = T.zoekPad(deur, stand, (x, y) => T.isBegaanbaar(w, x, y), (x, y) => T.isVast(w, x, y), { naast: true }) || [];
    const van = aanloop.length > 3 ? aanloop[aanloop.length - 4] : deur;
    const lang = Math.hypot(stand.x - van.x, stand.y - van.y) || 1;
    const achterDoel = {
      x: Math.round(stand.x + (2 * (stand.x - van.x)) / lang),
      y: Math.round(stand.y + (2 * (stand.y - van.y)) / lang),
    };
    const achter = vrijBij(w, achterDoel, [stand, weg, deur, punt(m)]);
    let wimVlucht = Promise.resolve();
    if (wim) {
      T.zetInGebied(S, wim, w.gebied, deur.x, deur.y);
      wim.dwaalt = false;
      wim.thuis = null;
      R.camera(deur);
      await R.wacht(0.4);
      R.kijk(wim, m);
      await zegAlles(wim, 'wimOnraad');
      wimVlucht = R.loop(wim, weg.x, weg.y);
      await R.wacht(1.5);
    }
    // Vlak achter Wim komt het de deur uit.
    const sk = T.maakWezen('skelet', deur.x, deur.y);
    sk.dwaalt = false;
    sk.thuis = null;
    w.wezens.push(sk);
    t.skelet = sk;
    R.camera(midden(m, sk));
    await R.loop(m, stand.x, stand.y);
    await R.wacht(0.3);
    R.kijk(m, sk);
    await zegAlles(m, 'blijfAchter');
    await R.loop(S.held, achter.x, achter.y);
    // Pas als Wim er is, komt het op hem af: zo loopt het nooit tegen Wim op.
    await wimVlucht;
  }

  // Het skelet komt een paar stappen dichterbij, maar nooit tot vlak bij de meester of bij jou.
  async function dichterbij(S, sk, m, stappen) {
    const w = S.wereld;
    const pad = T.zoekPad(
      punt(sk),
      punt(m),
      (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: sk }),
      (x, y) => T.isVast(w, x, y),
      { naast: true },
    );
    if (!pad) return;
    let doel = null;
    for (const p of pad.slice(0, stappen)) {
      if (T.afstand(p, punt(m)) < 3 || T.afstand(p, punt(S.held)) < 2) break;
      doel = p;
    }
    if (doel) await T.regie.loop(sk, doel.x, doel.y);
  }

  // Elke vuurschicht kost hem een jaar, en het skelet komt telkens nog een stukje dichterbij. Op
  // negenennegentig weet hij wat de volgende kost, en hij doet hem toch: eerst raakt de schicht,
  // dan is hij honderd (T.verouder), en hij sterft bij zijn moestuin. De grijze zucht die dan van
  // hem opstijgt (js/tekenen.js), is zijn laatste adem.
  async function laatsteSpreuk(S, t) {
    const R = T.regie;
    const m = t.meester;
    const sk = t.skelet;
    const jaar = T.SPREUKEN.vuurschicht.basis.maanden;
    let eerste = true;
    while (m.leeftijd + jaar < T.EINDLEEFTIJD && !sk.dood) {
      await dichterbij(S, sk, m, 4);
      R.camera(midden(m, sk));
      R.kijk(m, sk);
      const n = Math.max(1, Math.min(5, sk.leven - 1)); // het komt nog: niet de genadeklap
      await R.tover(m, 'vuurschicht', sk, () => T.raak(S, sk, n));
      toonJaren(S, m);
      await R.wacht(0.8);
      if (eerste) {
        eerste = false;
        await zegAlles(m, 'taai');
      }
    }
    await dichterbij(S, sk, m, 4);
    R.camera(midden(m, sk));
    R.kijk(m, S.held);
    await zegAlles(m, 'laatste');
    R.kijk(m, sk);
    await R.tover(m, 'vuurschicht', sk, () => {
      if (!sk.dood) T.raak(S, sk, sk.leven);
    });
    zetVlag(S, 'meesterDood');
    R.camera(m);
    await R.wacht(1.5);
  }

  // Wim, bij de meester. Dan tegen jou, aarzelend: "meester". En hij gaat de trap vegen.
  async function rouw(S, t) {
    const R = T.regie;
    const w = S.wereld;
    const m = t.meester;
    const wim = t.wim;
    if (wim && w.wezens.includes(wim)) {
      const bij = naastTegel(w, m, wim);
      R.camera(m);
      // Hij roept al terwijl hij eraan komt; de rest zegt hij bij hem.
      const regels = tekst('rouw');
      const lopen = R.loop(wim, bij.x, bij.y);
      await R.wacht(1.5);
      if (regels[0]) await R.zeg(wim, regels[0]);
      await lopen;
      R.kijk(wim, m);
      for (const regel of regels.slice(1)) {
        await R.wacht(1.3);
        await R.zeg(wim, regel);
      }
      await R.wacht(1.2);
      R.kijk(wim, S.held);
      await zegAlles(wim, 'overnemen', 0.8);
      R.camera(null);
      await R.loop(wim, t.plek.deur.x, t.plek.deur.y);
      // Terug naar zijn hal, waar hij thuishoort.
      if (t.wimThuis) {
        T.zetInGebied(S, wim, 'toren', t.wimThuis.x, t.wimThuis.y);
        wim.thuis = { x: t.wimThuis.x, y: t.wimThuis.y };
        wim.straal = t.wimStraal;
        wim.dwaalt = true;
      }
    }
    sluitAf(S, t);
  }

  // De middag is voorbij, en de toren is van jou. De slijmkruiper dwaalt weer door de voorraadkamer;
  // wat er op het erf rondloopt, pas als je bij de tuin weggaat (T.werkTutorialBij): een wolf die je
  // bij het lichaam van je meester bespringt, is niet wat dit moment nodig heeft.
  function sluitAf(S, t) {
    t.fase = 'klaar';
    t.klaar = true;
    laatLos(t, (v) => !t.erf.wezens.includes(v.e));
    T.ui.opdracht(null);
    T.ui.plek('De toren is van jou');
  }

  function laatLos(t, welke) {
    for (const v of t.vast) {
      if (v.los || !welke(v)) continue;
      v.e.dwaalt = v.dwaalt;
      v.e.straal = v.straal;
      v.e.thuis = v.thuis;
      v.los = true;
    }
  }

  // Voor de toetsen: elke scène los, op dezelfde manier gestart als in het spel.
  const SCENES = { roepen, ton, wimBinnen, wimSchep, terugkruipen, drinken, einde };
  T.speelTutorialScene = (S, naam) => speel(S, S.tutorial, naam, SCENES[naam]);

  // ---------------------------------------------------------------- elk beeld

  // Wat er bij de muis anders gaat zolang de tutorial loopt; null als niets (js/verkennen.js en
  // js/gevecht.js vragen het eerst hier).
  T.tutorialHandeling = function (S, doel) {
    const t = S.tutorial;
    if (!t || t.klaar || !doel) return null;
    const v = doel.voorwerp;
    if (v && v.soort === 'fontein' && !t.geschept) {
      if (S.gevecht) return { tekst: 'Het water is voor de meester', kosten: 0, kan: false };
      if (t.fase !== 'boodschap') {
        return { tekst: 'Het water is van de meester', fout: true, doe: () => T.ui.bericht('Dat water is van de meester. Er zit nog maar één slok in.') };
      }
      return { tekst: 'Een kom water scheppen voor de meester', doe: () => T.loopNaast(S, v, () => schep(S, t)) };
    }
    const e = doel.wezen;
    if (e && e === t.meester && !e.dood && !S.gevecht) {
      // Hij scharrelt intussen door (hij werkt door terwijl hij praat): wie op hem klikte en er
      // is, is er, ook als hij net een stap verder stond.
      if (t.fase === 'naarMeester') {
        return {
          tekst: 'Naar de meester',
          doe: () => T.loopNaast(S, e, () => {
            t.bijMeester = true;
          }),
        };
      }
      if (t.fase === 'boodschap' && S.inventaris.has('kom') && S.inventaris.has('zak')) {
        return {
          tekst: 'De meester zijn water en zijn zaaigoed geven',
          doe: () => T.loopNaast(S, e, () => {
            t.geven = true;
          }),
        };
      }
    }
    return null;
  };

  // De laatste slok, in een kom voor de meester. De fontein staat daarna droog: aan het eind is
  // hij er niet meer als de meester hem nodig heeft (ontwerp/verhaal.md, "Hij speelt met zijn
  // leeftijd").
  function schep(S, t) {
    if (t.geschept || S.fonteinLeeg) return;
    t.geschept = true;
    S.fonteinLeeg = true;
    S.inventaris.add('kom');
    T.ui.toonInventaris(S);
    T.ui.bericht('Je schept het laatste water uit de fontein in een kom. De fontein staat droog.', 'goed');
    if (t.wim && S.wereld.wezens.includes(t.wim)) t.wimSchep = true;
  }

  // Wat de meester je op dit moment gevraagd heeft, voor het vak linksboven (T.ui.opdracht).
  function opdrachtTekst(S, t) {
    if (t.bezig) return null;
    const inToren = S.wereld === t.toren;
    if (S.gevecht || S.modus === 'overgang') {
      if (!inToren) return null;
      return 'Gezien! Klik op de vloer achter je om terug de hal in te stappen, gooi met <kbd>D</kbd> de deur dicht en eindig je beurt met <kbd>spatie</kbd>. Die beesten doen geen deuren open.';
    }
    if (t.fase === 'naarMeester') return 'Loop naar de meester, bij zijn moestuin. Klik op de grond om te lopen.';
    if (t.fase === 'boodschap') {
      const kom = S.inventaris.has('kom');
      const zak = S.inventaris.has('zak');
      if (kom && zak) return 'Breng de meester zijn water en zijn zaaigoed: klik op hem.';
      const nog = [!kom && 'een kom water uit de fontein in de hal', !zak && 'een zak zaaigoed uit de voorraadkamer'];
      let regel = `Haal ${nog.filter(Boolean).join(', en ')}.`;
      if (!inToren) regel += ' Naar binnen: klik op de deur van de toren.';
      else if (!zak) regel += ' In de voorraadkamer zit iets. Sluip met <kbd>S</kbd>: dan ziet het je pas als je er vlak bij bent.';
      return regel;
    }
    if (t.fase === 'slaan') return 'Sla de andere ton kapot: klik erop. Slaan met je staf kost niets.';
    return null;
  }

  // Elk beeld (js/main.js): heeft de speler gedaan wat er gevraagd werd? Dan de volgende scène.
  T.werkTutorialBij = function (S) {
    const t = S.tutorial;
    if (!t || t.fase === 'aankomst') return;
    if (t.klaar) {
      // Na afloop: wie bij de tuin weggaat (of naar binnen), laat het erf weer leven.
      if (t.bezig || t.vast.every((v) => v.los)) return;
      if (S.wereld !== t.erf || T.afstand(punt(S.held), t.plek.tuin) > 12) laatLos(t, () => true);
      return;
    }
    T.ui.opdracht(opdrachtTekst(S, t));
    if (S.gevecht || S.modus === 'overgang') {
      t.gevecht = true;
      return;
    }
    if (t.bezig || S.modus !== 'verkennen') return;
    const held = S.held;
    const inToren = S.wereld === t.toren;
    const wimHier = t.wim && S.wereld.wezens.includes(t.wim);

    // Een gevecht is net voorbij: in de toren is dat de deurles geweest.
    if (t.gevecht) {
      t.gevecht = false;
      if (inToren && t.slijm && !t.slijm.dood) {
        speel(S, t, 'terugkruipen', terugkruipen);
        return;
      }
    }
    if (t.wimSchep) {
      t.wimSchep = false;
      if (wimHier) {
        speel(S, t, 'wimSchep', wimSchep);
        return;
      }
    }
    if (t.fase === 'naarMeester' && S.wereld === t.erf && !held.onderweg && !held.pad.length) {
      if (t.bijMeester || T.afstand(punt(held), punt(t.meester)) <= 3) {
        speel(S, t, 'ton', ton);
        return;
      }
    }
    if (t.fase === 'boodschap' && inToren && !t.wimBinnen && wimHier) {
      t.wimBinnen = true;
      speel(S, t, 'wimBinnen', wimBinnen);
      return;
    }
    if (t.fase === 'boodschap' && t.geven) {
      t.geven = false;
      speel(S, t, 'drinken', drinken);
      return;
    }
    if (t.fase === 'slaan' && t.tonJij.soort !== 'ton' && S.wereld === t.erf) {
      t.fase = 'einde';
      speel(S, t, 'einde', einde);
    }
  };
})(globalThis.Toren = globalThis.Toren || {});
