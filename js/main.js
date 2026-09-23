// Opstarten, de spellus en de invoer. Elk beeld: animaties bijwerken, bij het rondlopen de
// monsters laten dwalen en uitkijken, de camera laten meeglijden, en tekenen.
(function (T) {
  'use strict';

  const canvas = document.getElementById('scherm');
  const ctx = canvas.getContext('2d');
  let bw = 0;
  let bh = 0;
  const S = (T.S = { tijd: 0, wind: 0 });

  // index.html?kaart=gehucht begint direct op die kaart, zonder tutorial: voor een proefje
  // (T.beginOpKaart, js/gebied.js). Zonder "kaart" verandert er niets aan het gewone begin.
  const BEGIN_KAART = new URLSearchParams(window.location.search).get('kaart');

  // Hoe hoog iets boven zijn tegel uitsteekt, om erop te kunnen klikken. Met sprites zijn de
  // figuren groter dan de vlakken waren, dus vraagt het aanwijzen het aan de sprites zelf.
  const WEZEN_HOOGTE = { wim: 48, slijm: 28, skelet: 52 };
  const VOORWERP_HOOGTE = { fontein: 32, kist: 36, trap: 46, sleutel: 28, ton: 32, zak: 24 };
  const SPRITE_VOORWERP_HOOGTE = { fontein: 46, kist: 40, trap: 46, sleutel: 26, ton: 40, zak: 28 };
  const hoogteVan = (e) =>
    T.sprites.aan && !T.debug.vlakken ? T.sprites.hoogte(e.soort) : WEZEN_HOOGTE[e.soort] || 48;
  const voorwerpHoogte = (v) =>
    (T.sprites.aan && !T.debug.vlakken ? SPRITE_VOORWERP_HOOGTE : VOORWERP_HOOGTE)[v.soort];

  // Een nieuw spel begint op het erf, bij de oude meester in zijn moestuin: de tutorial
  // (js/tutorial.js). Vanaf het titelscherm begint die pas als je op de knop drukt; na "Opnieuw"
  // meteen.
  T.nieuwSpel = function (meteen) {
    S.gebieden = {}; // een nieuw spel begint met een schone toren en een schoon erf
    Object.assign(S, {
      vlaggen: new Set(),
      gesprekLeeftijd: {},
      modus: 'verkennen',
      gevecht: null,
      overgang: null,
      bezig: false,
      spreuk: null,
      spreukBereik: null,
      lichten: [],
      inventaris: new Set(),
      goud: 0,
      goudGehad: false, // ooit goud gehad? dan blijft het vakje in beeld, ook op nul
      quests: {}, // per quest de fase waarin hij staat (js/quest.js)
      questWeg: {}, // en hoe je hem oploste, zodat het dorp erop kan reageren
      questBeloond: new Set(),
      sleutelGebruikt: false,
      fonteinLeeg: false,
      sluipen: false,
      bezocht: new Set(['hal']),
      naarGebied: null,
      netGeland: null, // de tegel waar de held zojuist is neergezet (js/gebied.js)
      grond: null, // de buffer waar de grond op staat (js/tekenen.js)
      effecten: [],
      wachters: [],
      rasterAlpha: 0,
      rasterTegels: [],
      rasterStart: 0,
      rasterVan: null,
      bereik: null,
      hover: null,
      handeling: null,
      naLopen: null,
      regieCamera: null, // waar de camera in een scène naartoe kijkt (js/regie.js); null = de held volgen
      spreektMet: null,
    });
    // Een proefje (?kaart=) begint zonder tutorial op zijn eigen kaart; lukt dat niet (de kaart
    // bestaat niet), dan valt het terug op het gewone begin — een half aangelegde wereld mag
    // nooit het spel breken.
    if (!BEGIN_KAART || !T.beginOpKaart(S, BEGIN_KAART)) T.beginOpHetErf(S); // zet S.wereld, S.held en S.tutorial
    const p = T.naarScherm(S.held.x, S.held.y);
    S.camera = { x: p.x, y: p.y - 24 };
    T.ui.reset(S);
    if (!BEGIN_KAART) T.ui.bericht('Een middag in de nazomer. Je oude meester staat in zijn moestuin, zoals altijd.');
    if (meteen) T.startTutorial(S);
  };

  // Het beeld zoomt mee met het venster: op een groot scherm wordt de toren groter, op een
  // klein scherm nooit kleiner dan ware grootte.
  //
  // De buffer is hele css-pixels, niet devicePixelRatio maal zoveel. Op een scherm met ratio 1,5
  // tekende het spel op vol scherm 2880×1620 = 4,7 miljoen pixels per beeld, en dat levert voor
  // pixel art niets op: de sprites worden toch al met een hele factor vergroot, en de browser
  // schaalt de buffer daarna met image-rendering: pixelated na (zie stijl.css). Op een scherm met
  // een echte hele ratio (2, een retina) tekenen we wel op die ratio, want daar levert het wél
  // scherpere pixels op; een halve ratio ronden we naar beneden af.
  function formaat() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    bw = window.innerWidth;
    bh = window.innerHeight;
    canvas.width = Math.round(bw * dpr);
    canvas.height = Math.round(bh * dpr);
    canvas.style.width = bw + 'px';
    canvas.style.height = bh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S.zoom = Math.max(1, Math.min(2, Math.min(bw / 900, bh / 540)));
  }

  // Van schermpixels naar de isometrische vlakte waarop getekend wordt, en terug. Precies
  // dezelfde afronding als in tekenScene, anders wijst de muis net naast de tegel.
  const naarVlak = (mx, my) => ({
    x: (mx - Math.round(bw / 2)) / S.zoom + Math.round(S.camera.x),
    y: (my - Math.round(bh / 2)) / S.zoom + Math.round(S.camera.y),
  });
  const vanVlak = (sx, sy) => ({
    x: (sx - Math.round(S.camera.x)) * S.zoom + Math.round(bw / 2),
    y: (sy - Math.round(S.camera.y)) * S.zoom + Math.round(bh / 2),
  });

  const heldAanDeBeurt = () => !!S.gevecht && S.gevecht.volgorde[S.gevecht.beurt] === S.held;

  // Wat ligt er onder de muis? Wezens en voorwerpen steken boven hun tegel uit, dus die
  // worden eerst gezocht, van voor naar achter. Anders is het de tegel zelf.
  function zoekDoel(mx, my) {
    const w = S.wereld;
    const { x: sx, y: sy } = naarVlak(mx, my);
    const kandidaten = [];
    for (const e of w.wezens) {
      if (e.dood || e === S.held || !T.isZichtbaar(w, e.tx, e.ty)) continue;
      const p = T.naarScherm(e.x, e.y);
      const hoog = hoogteVan(e);
      if (sx > p.x - 17 && sx < p.x + 17 && sy > p.y - hoog && sy < p.y + 9) {
        kandidaten.push({ d: e.x + e.y + 0.01, wezen: e, x: e.tx, y: e.ty });
      }
    }
    for (const v of w.voorwerpen) {
      const hoog = voorwerpHoogte(v);
      if (!hoog || !T.isZichtbaar(w, v.x, v.y)) continue;
      const p = T.naarScherm(v.x, v.y);
      if (sx > p.x - 20 && sx < p.x + 20 && sy > p.y - hoog && sy < p.y + 10) {
        kandidaten.push({ d: v.x + v.y, voorwerp: v, x: v.x, y: v.y });
      }
    }
    if (kandidaten.length) {
      kandidaten.sort((a, b) => b.d - a.d);
      return kandidaten[0];
    }
    const f = T.naarWereld(sx, sy);
    const x = Math.round(f.x);
    const y = Math.round(f.y);
    if (x < 0 || y < 0 || x >= w.b || y >= w.h) return null;
    return { x, y };
  }

  // De muis wordt elk beeld opnieuw bekeken, want onder een stilstaande muis kan intussen
  // een monster doorlopen. Tekst bij de muis, pad op de vloer en de actiepunten zeggen
  // alle drie wat een klik zou doen.
  // Wat er bij de muis staat: wat een klik doet, wat het aan punten kost en wat het aan leven
  // kost. Alles uit hetzelfde antwoord, zodat het scherm niet iets anders belooft dan de klik.
  function tipTekst(h) {
    let t = h.tekst;
    if (h.kosten) t += ` · ${h.kosten} AP`;
    if (h.maanden) {
      t += ` · ${T.duurKort(h.maanden)}`;
      if (S.held.leeftijd + h.maanden >= T.EINDLEEFTIJD) t += ' · daarna ben je honderd';
    }
    return t;
  }

  function werkHoverBij() {
    const actief = S.modus === 'verkennen' || (S.modus === 'gevecht' && !S.bezig && heldAanDeBeurt());
    S.spreukBereik = actief && S.spreuk ? T.spreukBereik(S) : null;
    if (!S.muis || !actief) {
      S.hover = null;
      S.handeling = null;
      T.ui.verbergTooltip();
      canvas.style.cursor = 'default';
      if (S.modus === 'gevecht' && heldAanDeBeurt()) T.ui.toonAp(S.held.ap, S.held.maxAp, 0, true);
      return;
    }
    S.hover = zoekDoel(S.muis.x, S.muis.y);
    const h = S.modus === 'verkennen' ? T.handelingVerkennen(S, S.hover) : T.handelingGevecht(S, S.hover);
    S.handeling = h;
    if (S.modus === 'gevecht') T.ui.toonAp(S.held.ap, S.held.maxAp, h ? h.kosten || 0 : 0, !h || h.kan !== false);
    if (h && h.tekst) T.ui.tooltip(tipTekst(h), S.muis.x, S.muis.y, !!h.fout || h.kan === false);
    else T.ui.verbergTooltip();
    // Met een spreuk in de hand richt je: een kruisje in plaats van een wijzende hand.
    canvas.style.cursor = h ? (S.spreuk ? 'crosshair' : 'pointer') : S.spreuk ? 'crosshair' : 'default';
  }

  // Bij het rondlopen volgt de camera de held; in een gevecht zoekt hij het midden tussen
  // iedereen die meedoet, zodat het hele slagveld in beeld schuift.
  //
  // Dat begint al bij de overgang, vóór het gevecht: het monster dat je ziet, komt meteen in
  // beeld, tegelijk met de melding. Buiten is dat het verschil tussen een gevecht dat begint en
  // aangevallen worden door iets wat je niet kunt zien.
  // Vroeger hield de camera hier een marge aan tot de rand van de kaart (begrensCamera), zodat
  // je nooit de lege ruimte erachter zag: de camera stopte al een halve schermmaat van de rand.
  // Op een kleine kaart (het dorp, 48×40) liep de held daardoor ver uit het midden door en
  // verdween in de hoek, tot onder het leeftijdspaneel (Marcel, 21 sep 2026) — de camera volgde
  // niet meer mee terwijl de held nog een heel eind verder kon lopen. Nu js/tekenen.js voorbij de
  // rand een bosrand tekent (zie daar "het bos om de kaart heen") is die marge niet meer nodig:
  // wat er te zien komt voorbij de kaart is bos, geen leegte, dus de camera volgt de held gewoon
  // altijd. Dat houdt hem ook vanzelf uit de buurt van het paneel en de knoppen onderaan, want
  // zijn plek op het scherm staat dan vast in plaats van dat hij naar een bevroren camera toe kan
  // weglopen.
  function cameraDoel() {
    // Een scène kan het beeld ergens anders op richten dan de held (js/regie.js); zonder dat
    // blijft dit gewoon het gevecht of de held volgen.
    if (S.regieCamera) return T.naarScherm(S.regieCamera.x, S.regieCamera.y);
    const aanleiding = S.overgang && S.overgang.aanleiding;
    const lijst = S.gevecht
      ? [S.held, ...S.gevecht.monsters.filter((m) => !m.dood)]
      : aanleiding && !aanleiding.dood
        ? [S.held, aanleiding]
        : [S.held];
    let x = 0;
    let y = 0;
    for (const e of lijst) {
      const p = T.naarScherm(e.x, e.y);
      x += p.x;
      y += p.y;
    }
    return { x: x / lijst.length, y: y / lijst.length - 24 };
  }

  function werkBij(dt) {
    // Een resize-gebeurtenis komt niet altijd (een tabblad dat verborgen opstartte, heeft
    // eerst geen maat), dus kijkt de lus zelf of het venster veranderd is.
    if (window.innerWidth !== bw || window.innerHeight !== bh) formaat();
    S.tijd += dt;
    S.wind = T.windWaarde(S.tijd);
    T.werkAnimatiesBij(S, dt);
    // Een overgang naar een ander gebied wordt hier opgepakt, en niet daar waar hij ontstaat
    // (T.bijAankomst): de lijst wezens van de wereld verandert erdoor, en daar loopt de animatie
    // net doorheen.
    if (S.naarGebied) T.gaNaarGebied(S, S.naarGebied);
    T.werkLichtenBij(S, dt);
    // Heeft de speler gedaan wat de meester vroeg? Dan begint de volgende scène (js/tutorial.js),
    // nog vóór er iets dwaalt of iemand je ziet.
    T.werkTutorialBij(S);
    // Quests gaan net zo vanzelf verder (js/quest.js): heb je wat de bakker nodig heeft, dan
    // schuift de fase op. Het vak linksboven is van de meester zolang hij nog iets vraagt, en
    // daarna van de quest die je het eerst aannam.
    T.werkQuestsBij(S);
    if (!T.tutorialLoopt(S)) {
      const doelNu = T.questDoel(S);
      T.ui.opdracht(doelNu && doelNu.tekst, doelNu && doelNu.kop);
    }
    if (S.modus === 'verkennen') {
      T.laatDwalen(S, dt);
      const m = T.zoekOntdekking(S);
      if (m) T.startGevecht(S, m, false);
    }
    if (S.modus === 'overgang' && S.wereld.wezens.every((e) => !e.pad.length)) T.beginGevecht(S);
    const doelAlpha = S.modus === 'gevecht' ? 1 : 0;
    S.rasterAlpha += (doelAlpha - S.rasterAlpha) * Math.min(1, dt * 5);
    const doel = cameraDoel();
    const k = 1 - Math.exp(-dt * 5);
    S.camera.x += (doel.x - S.camera.x) * k;
    S.camera.y += (doel.y - S.camera.y) * k;
    werkHoverBij();
    T.ui.toonSpreuken(S);
  }

  let vorige = 0;
  function lus(nu) {
    const dt = vorige ? Math.min(0.05, (nu - vorige) / 1000) : 0;
    vorige = nu;
    werkBij(dt);
    T.tekenScene(ctx, S, bw, bh);
    requestAnimationFrame(lus);
  }

  canvas.addEventListener('mousemove', (ev) => {
    S.muis = { x: ev.clientX, y: ev.clientY };
  });
  canvas.addEventListener('mouseleave', () => {
    S.muis = null;
  });
  canvas.addEventListener('click', (ev) => {
    S.muis = { x: ev.clientX, y: ev.clientY };
    werkHoverBij();
    const h = S.handeling;
    if (!h || !h.doe || h.kan === false) return;
    h.doe();
  });
  canvas.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    T.kiesSpreuk(S, null);
  });
  // De spreuktoetsen (2, 3, 4) werken binnen én buiten een gevecht, want een dwaallicht en een
  // windstoot horen juist bij het rondlopen. 1 en Escape leggen een spreuk weer weg.
  window.addEventListener('keydown', (ev) => {
    if (S.modus === 'dialoog') {
      const n = parseInt(ev.key, 10);
      if (n >= 1 && n <= 9) T.ui.kiesKeuze(n - 1);
      if (ev.key === 'Escape') T.sluitDialoog(S);
      return;
    }
    // Tijdens een scène (js/regie.js) ligt de invoer stil op de overslaan-toets na: de speler
    // kan niet wegwandelen, maar hoeft ook niet werkeloos toe te kijken. Enter, spatie of 1 is
    // "Verder" bij een regel tekst.
    if (S.modus === 'regie') {
      if (ev.key === 'Escape') T.regie.overslaan();
      else if (ev.key === 'Enter' || ev.key === ' ' || ev.key === '1') {
        ev.preventDefault();
        T.ui.kiesKeuze(0);
      }
      return;
    }
    if (S.modus !== 'verkennen' && S.modus !== 'gevecht') return;
    const spreuk = T.SPREUK_VOLGORDE.find((id) => T.SPREUKEN[id].toets === ev.key);
    if (spreuk) {
      T.kiesSpreuk(S, spreuk);
      return;
    }
    if (ev.key === '1' || ev.key === 'Escape') {
      T.kiesSpreuk(S, null);
      return;
    }
    if (S.modus === 'verkennen') {
      if (ev.key === 's' || ev.key === 'S') T.wisselSluipen(S);
      return;
    }
    if (ev.key === 'd' || ev.key === 'D') T.deurDicht(S);
    else if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      T.eindeBeurt(S);
    }
  });
  document.getElementById('knoppen').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || b.disabled) return;
    b.blur(); // anders drukt de spatiebalk straks ook deze knop nog eens in
    if (b.dataset.actie === 'einde') T.eindeBeurt(S);
    else if (b.dataset.actie === 'deur') T.deurDicht(S);
    else T.kiesSpreuk(S, null);
  });
  document.getElementById('spreukbalk').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    b.blur();
    T.kiesSpreuk(S, b.dataset.spreuk);
  });
  document.getElementById('sluip-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    T.wisselSluipen(S);
  });
  window.addEventListener('resize', formaat);

  // Voor het testen.
  T.debug = {
    // Toren.debug.vlakken = true tekent weer met vlakken in plaats van met de pixel art,
    // om te vergelijken en om te zien of er niets verdwenen is.
    vlakken: false,
    // Waar staat tegel (x, y) nu op het scherm, in css-pixels? Voor echte klikken.
    naarBeeld(x, y) {
      const p = T.naarScherm(x, y);
      return vanVlak(p.x, p.y);
    },
    // Zet hoe vaak een spreuk al raak was, om de treden te proberen zonder ze te verdienen:
    // Toren.debug.meesterschap('vuurschicht', 15) → 'Meesterlijk'.
    meesterschap(id, aantal) {
      if (!T.SPREUKEN[id]) return `Die spreuk ken ik niet: ${id}`;
      S.held.meesterschap[id] = Math.max(0, Math.floor(aantal));
      return T.TREDEN[T.trede(S.held, id)].naam;
    },
    // Hoeveel milliseconden kost één beeld? Toren.debug.meet() tekent n beelden achter elkaar en
    // geeft het gemiddelde, de mediaan en de slechtste terug. Een beeld hoort ruim onder de 16 ms
    // te blijven (zestig beelden per seconde), het liefst onder de 5, zodat er ruimte overblijft
    // voor een tragere machine.
    meet(n) {
      const aantal = n || 120;
      const tijden = [];
      for (let i = 0; i < aantal; i++) {
        const t0 = performance.now();
        T.tekenScene(ctx, S, bw, bh);
        tijden.push(performance.now() - t0);
      }
      tijden.sort((a, b) => a - b);
      const som = tijden.reduce((a, b) => a + b, 0);
      const af = (x) => Math.round(x * 100) / 100;
      return {
        venster: `${bw}×${bh}`, zoom: Math.round(S.zoom * 100) / 100, buffer: `${canvas.width}×${canvas.height}`,
        gemiddeld: af(som / aantal), mediaan: af(tijden[aantal >> 1]), slechtste: af(tijden[aantal - 1]),
      };
    },
    // Een quest in een fase zetten zonder hem te spelen, zoals debug.meesterschap dat voor de
    // treden doet. Zo kun je zien wat het dorp in elke fase zegt terwijl je de kaart nog tekent:
    //   Toren.debug.quest()                 → wat er loopt, en wat er te kiezen valt
    //   Toren.debug.quest('bakker')         → de fasen van die quest, en waar hij nu staat
    //   Toren.debug.quest('bakker', 'terug') → zet hem daar neer
    //   Toren.debug.quest('bakker', 'uit')   → helemaal terug naar niet begonnen, beloning en al
    quest(naam, fase) {
      if (!naam) {
        return {
          loopt: { ...S.quests },
          tekiezen: Object.fromEntries(Object.entries(T.QUESTS).map(([id, q]) => [id, Object.keys(q.fasen)])),
        };
      }
      const q = T.QUESTS[naam];
      if (!q) return `Die quest ken ik niet: ${naam}. Er is: ${Object.keys(T.QUESTS).join(', ') || 'nog niets'}.`;
      if (!fase) return { nu: T.questFase(S, naam) || 'niet begonnen', weg: T.questWegVan(S, naam), fasen: Object.keys(q.fasen) };
      if (fase === 'uit') {
        delete S.quests[naam];
        delete S.questWeg[naam];
        for (const sleutel of [...S.questBeloond]) if (sleutel.startsWith(`${naam}:`)) S.questBeloond.delete(sleutel);
        T.werkQuestVoorwerpen(S);
        T.werkGeheimenBij(S);
        return `${q.naam}: niet begonnen. De beloning kan weer opnieuw.`;
      }
      if (!q.fasen[fase]) return `"${fase}" is geen fase van ${q.naam}. Er is: ${Object.keys(q.fasen).join(', ')}.`;
      T.zetQuest(S, naam, fase);
      const f = q.fasen[fase];
      return { quest: q.naam, fase, doel: f.doel || null, goud: S.goud, tas: [...S.inventaris] };
    },
    // Naar een ander gebied springen zonder ernaartoe te lopen: Toren.debug.gaNaar('erf').
    gaNaar(naam) {
      T.gaNaarGebied(S, naam);
      return S.wereld.gebied;
    },
    // Laat het spel `seconden` verder lopen zonder op beelden van de browser te wachten.
    // Een verborgen tabblad tekent maar af en toe een beeld, en dan loopt alles in slow
    // motion. Na elk beeld krijgen de beloftes (loop, wacht, uitval) de kans om door te gaan.
    async stap(seconden) {
      const n = Math.round(seconden * 60);
      for (let i = 0; i < n; i++) {
        werkBij(1 / 60);
        for (let k = 0; k < 8; k++) await null;
      }
      T.tekenScene(ctx, S, bw, bh);
    },
    // Bewijs dat js/regie.js werkt: Wim loopt naar de fontein, zegt iets, wordt door een kleine
    // vuurschicht zichtbaar een jaar ouder, en loopt terug. Alleen in de hal, waar Wim staat;
    // Toren.debug.regieProef() in de console van de browser.
    async regieProef() {
      const wim = S.wereld.wezens.find((e) => e.soort === 'wim');
      if (!wim) return 'Wim staat hier niet: ga eerst de toren in.';
      // Alleen de held heeft normaal een leeftijd (js/wereld.js); voor de proef leent Wim er
      // hier eentje, zodat T.verouder iets heeft om bij op te tellen.
      if (wim.leeftijd == null) wim.leeftijd = 97 * 12;
      await T.regie.speel(S, async () => {
        await T.regie.loop(wim, 7, 5);
        await T.regie.zeg(wim, 'Kijk eens, Wim kan ook ouder worden.');
        await T.regie.tover(wim, 'vuurschicht', { x: 7, y: 6 });
        await T.regie.loop(wim, 5, 2);
      });
      return `Wim is nu ${T.leeftijdTekst(wim.leeftijd)}.`;
    },
    // Waar staat de tutorial (js/tutorial.js)? Toren.debug.tutorial() in de console.
    tutorial() {
      const t = S.tutorial;
      if (!t) return 'Geen tutorial.';
      return {
        fase: t.fase, bezig: t.bezig, gebied: S.wereld.gebied,
        held: `${S.held.tx},${S.held.ty}`, meester: `${t.meester.tx},${t.meester.ty} · ${T.leeftijdTekst(t.meester.leeftijd)}${t.meester.dood ? ' · dood' : ''}`,
        tonnen: [t.tonOud.soort, t.tonJij.soort], spullen: [...S.inventaris],
      };
    },
  };

  formaat();
  // De pixel art gaat meteen laden; tot hij klaar is tekent het spel zijn vlakken. Bij het
  // titelscherm is dat nooit te zien.
  T.sprites.laad();
  T.nieuwSpel(false);
  if (BEGIN_KAART && S.wereld && S.wereld.gebied === BEGIN_KAART) {
    // Een proefje: geen titelscherm en geen tutorial, meteen spelen.
    S.modus = 'verkennen';
  } else {
    S.modus = 'titel';
    // Geen uitlegscherm: wat een spreuk kost en wat de staf kost, laat de meester je zien
    // (ontwerp/verhaal.md, "Hij speelt met zijn leeftijd").
    T.ui.toonOverlay(
      'Aardschok',
      '<p>Je oude meester is zevenennegentig, en hij doet nog elke dag zijn moestuin. Jij bent vierentachtig. Voor hem ben je nog altijd de jongen.</p>' +
        '<p>Klik om te lopen, te praten of iets te gebruiken. <kbd>Esc</kbd> slaat een scène over.</p>',
      'Naar het erf',
      () => {
        S.modus = 'verkennen';
        T.startTutorial(S);
      },
    );
  }
  requestAnimationFrame(lus);
})(globalThis.Toren = globalThis.Toren || {});
