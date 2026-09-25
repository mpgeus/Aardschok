// Opstarten, de spellus en de invoer. Elk beeld: animaties bijwerken, bij het rondlopen de
// monsters laten dwalen en uitkijken, de camera laten meeglijden, en tekenen.
(function (T) {
  'use strict';

  const canvas = document.getElementById('scherm');
  const ctx = canvas.getContext('2d');
  let bw = 0;
  let bh = 0;
  const S = (T.S = { tijd: 0, wind: 0 });

  // Een nieuw spel begint in het gehucht. Met index.html?kaart=<naam> begint het op een andere
  // kaart, voor een proefje (T.beginOpKaart, js/gebied.js), en dan zonder de benoemingsbrief.
  const BEGIN_KAART = new URLSearchParams(window.location.search).get('kaart');

  // Hoe hoog iets boven zijn tegel uitsteekt, om erop te kunnen klikken. Met sprites zijn de
  // figuren groter dan de vlakken waren, dus vraagt het aanwijzen het aan de sprites zelf.
  const WEZEN_HOOGTE = { slijm: 28, skelet: 52 };
  const VOORWERP_HOOGTE = { fontein: 32, kist: 36, sleutel: 28 };
  const SPRITE_VOORWERP_HOOGTE = { fontein: 46, kist: 40, sleutel: 26 };
  const hoogteVan = (e) =>
    T.sprites.aan && !T.debug.vlakken ? T.sprites.hoogte(e.soort) : WEZEN_HOOGTE[e.soort] || 48;
  const voorwerpHoogte = (v) =>
    (T.sprites.aan && !T.debug.vlakken ? SPRITE_VOORWERP_HOOGTE : VOORWERP_HOOGTE)[v.soort];

  // Een nieuw spel begint in het gehucht, met de benoemingsbrief van de heer (T.ui.toonBenoeming,
  // js/hud.js). Marcel koos hem op 25 sep in plaats van een titelscherm: de tutorial van het oude
  // spel vertelde je waarom je er was, en nu doet de heer dat zelf (ontwerp/spel.md, onder Open).
  T.nieuwSpel = function () {
    S.gebieden = {}; // een nieuw spel begint met schone gebieden
    Object.assign(S, {
      vlaggen: new Set(),
      modus: 'verkennen',
      gevecht: null,
      overgang: null,
      bezig: false,
      inventaris: new Set(),
      kalender: T.nieuweKalender(), // dag, seizoen, jaar en snelheid (js/tijd.js)
      voorraad: T.nieuweVoorraad(), // goud, graan, wol, hout (js/voorraad.js)
      gebouwen: [], // wat er staat of in aanbouw is (js/gebouwen.js), en hoe ver S.gebouwenDag is
      bevolking: 0, woonruimte: 0, // aantal mensen, en hoeveel er als woonruimte gegeven is
      behoeften: T.nieuweBehoeften ? T.nieuweBehoeften() : null, // tevredenheid en wat het dorp mist (js/behoeften.js)
      trede: 'gehucht', // de hoogste trede van het dorp; omhoog gaat pas mee met "Groei" (werklijst.md, punt 5)
      bouwSoort: null, bouwHover: null, bouwMenuOpen: false, // het bouwmenu (T.NIEUWE_HUD, js/hud.js)
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
      spreektMet: null,
    });
    // Een proefje (?kaart=) begint op zijn eigen kaart, zonder brief; lukt dat niet (de kaart
    // bestaat niet), dan valt het terug op het gehucht — een half aangelegde wereld mag nooit het
    // spel breken.
    const proefje = !!BEGIN_KAART && T.beginOpKaart(S, BEGIN_KAART);
    if (!proefje) T.beginOpKaart(S, 'gehucht'); // zet S.wereld en S.held
    const p = T.naarScherm(S.held.x, S.held.y);
    S.camera = { x: p.x, y: p.y - 24 };
    T.ui.reset(S);
    if (!proefje && T.ui.toonBenoeming) T.ui.toonBenoeming(S);
  };

  // Het beeld zoomt mee met het venster: op een groot scherm wordt het gehucht groter, op een
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
  // Wat er bij de muis staat: wat een klik doet en wat het aan punten kost. Alles uit hetzelfde
  // antwoord, zodat het scherm niet iets anders belooft dan de klik.
  function tipTekst(h) {
    let t = h.tekst;
    if (h.kosten) t += ` · ${h.kosten} AP`;
    return t;
  }

  // Een gebouw in de hand (S.bouwSoort, het bouwmenu in js/hud.js) verandert wat de muis doet:
  // hij richt een voet in plaats van dat er iets van het gewone rondlopen gebeurt. De
  // tegel onder de muis is de linkerbovenhoek van die voet (dezelfde afspraak als "beslaat" op de
  // kaart, js/kaart.js); T.gebouwPast zegt of hij daar past.
  function werkBouwHoverBij() {
    if (!S.muis) {
      S.bouwHover = null;
      return;
    }
    const { x: sx, y: sy } = naarVlak(S.muis.x, S.muis.y);
    const f = T.naarWereld(sx, sy);
    const x = Math.round(f.x);
    const y = Math.round(f.y);
    S.bouwHover = { x, y, ok: T.gebouwPast(S, S.bouwSoort, x, y) };
    canvas.style.cursor = 'crosshair';
    T.ui.verbergTooltip();
    S.hover = null;
    S.handeling = null;
  }

  function werkHoverBij() {
    if (S.bouwSoort) {
      werkBouwHoverBij();
      return;
    }
    const actief = S.modus === 'verkennen' || (S.modus === 'gevecht' && !S.bezig && heldAanDeBeurt());
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
    canvas.style.cursor = h ? 'pointer' : 'default';
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
  // verdween in de hoek, tot onder het paneel linksboven (Marcel, 21 sep 2026) — de camera volgde
  // niet meer mee terwijl de held nog een heel eind verder kon lopen. Nu js/tekenen.js voorbij de
  // rand een bosrand tekent (zie daar "het bos om de kaart heen") is die marge niet meer nodig:
  // wat er te zien komt voorbij de kaart is bos, geen leegte, dus de camera volgt de held gewoon
  // altijd. Dat houdt hem ook vanzelf uit de buurt van het paneel en de knoppen onderaan, want
  // zijn plek op het scherm staat dan vast in plaats van dat hij naar een bevroren camera toe kan
  // weglopen.
  function cameraDoel() {
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
    // De kalender loopt op haar eigen klok, niet op S.tijd (CLAUDE.md, "Testen in de browser"):
    // zo laat pauzeren of versnellen nooit een animatie stilvallen of doorschieten.
    T.tikKalender(S, dt);
    T.werkGebouwenBij(S); // merkt zelf een nieuwe dag op de kalenderklok (js/gebouwen.js)
    T.werkMarskramerBij(S); // zijn poppetje: over de weg binnen, naar de brink, en weer weg (js/handel.js)
    T.werkHeerBij(S); // net zo: de heer en zijn soldaten op Sint-Maarten (js/heer.js)
    T.werkInnerBij(S); // en de inner in oogstmaand: hij loopt zijn ronde, of met de schout mee (js/inner.js)
    T.werkAnimatiesBij(S, dt);
    // Een overgang naar een ander gebied wordt hier opgepakt, en niet daar waar hij ontstaat
    // (T.bijAankomst): de lijst wezens van de wereld verandert erdoor, en daar loopt de animatie
    // net doorheen.
    if (S.naarGebied) T.gaNaarGebied(S, S.naarGebied);
    // Quests gaan vanzelf verder (js/quest.js): heb je wat een quest vraagt, dan schuift de
    // fase op, nog vóór er iets dwaalt of iemand je ziet. Het vak linksboven is van de quest die
    // je het eerst aannam.
    T.werkQuestsBij(S);
    const doelNu = T.questDoel(S);
    T.ui.opdracht(doelNu && doelNu.tekst, doelNu && doelNu.kop);
    if (S.modus === 'verkennen') {
      // Vóór T.laatDwalen: wie hier een pad krijgt of aan het maaien slaat (T.werkOogstBij,
      // js/akkers.js, alleen het nieuwe spel: S.wereld.akkers is er anders niet), staat voor
      // T.laatDwalen al "bezig" (m.pad.length of m.maait) en dwaalt deze beurt niet ook nog weg.
      if (T.werkOogstBij) T.werkOogstBij(S, dt);
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
    if (S.bouwSoort) {
      const soort = S.bouwSoort;
      const hover = S.bouwHover;
      if (!hover || !hover.ok) {
        T.ui.bericht('Daar past het niet.', 'gevaar');
        return;
      }
      const r = T.plaatsGebouw(S, soort, hover.x, hover.y);
      if (!r.gelukt) {
        T.ui.bericht(r.reden, 'gevaar');
        return;
      }
      T.ui.bericht(`${T.GEBOUWEN[soort].naam} in aanbouw (${T.GEBOUWEN[soort].bouwtijd} dagen).`, 'goed');
      S.bouwSoort = null;
      return;
    }
    const h = S.handeling;
    if (!h || !h.doe || h.kan === false) return;
    h.doe();
  });
  canvas.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    if (S.bouwSoort) S.bouwSoort = null;
  });
  window.addEventListener('keydown', (ev) => {
    // Bij de marskramer (js/hud.js, het handelsvenster) ligt de rest stil; Esc sluit het venster.
    if (S.modus === 'handel') {
      if (ev.key === 'Escape') T.ui.sluitHandel(S);
      return;
    }
    // Bij de heer net zo (js/hud.js, betalen op Sint-Maarten; bij de schandpaal moet je kiezen),
    // en als je je ambt kwijt bent, is het spel uit.
    if (S.modus === 'heer') {
      if (ev.key === 'Escape') T.ui.sluitHeer(S);
      return;
    }
    // Het slachten (js/hud.js): de tijd staat stil, en Esc is niemand slachten.
    if (S.modus === 'slachten') {
      if (ev.key === 'Escape') T.ui.sluitSlachten(S);
      return;
    }
    // Verstoppen (js/hud.js, in een kelder of de kapel): net zo; Esc sluit.
    if (S.modus === 'verstoppen') {
      if (ev.key === 'Escape') T.ui.sluitVerstoppen(S);
      return;
    }
    if (S.modus === 'einde') return;
    // De spelregels (js/hud.js): daar typ je ook namen, dus alleen Esc doet iets.
    if (S.modus === 'spelregels') {
      if (ev.key === 'Escape') T.ui.sluitSpelregels(S);
      return;
    }
    // Het veldenvenster (js/hud.js): net als bij de spelregels staat de tijd stil en ligt de rest
    // stil. Esc of V sluit het; B en O sluiten het ook en gaan dan meteen door naar het bouwmenu of
    // de spelregels, hieronder.
    if (S.modus === 'velden') {
      const k = (ev.key || '').toLowerCase();
      if (k === 'escape' || k === 'v' || k === 'b' || k === 'o') T.ui.sluitVelden(S);
      if (k !== 'b' && k !== 'o') return;
    }
    if (ev.key === 'Escape' && T.ui.briefOpen && T.ui.briefOpen()) {
      T.ui.sluitBrief(S);
      return;
    }
    if (S.modus === 'dialoog') {
      const n = parseInt(ev.key, 10);
      if (n >= 1 && n <= 9) T.ui.kiesKeuze(n - 1);
      if (ev.key === 'Escape') T.sluitDialoog(S);
      return;
    }
    if (S.modus !== 'verkennen' && S.modus !== 'gevecht') return;
    // B: het bouwmenu (js/hud.js), alleen in het nieuwe spel en alleen bij het rondlopen — botst
    // nergens mee (CLAUDE.md, "Toetsen"). Nog eens B, Esc of rechtsklik legt een gebouw weer weg.
    // O: de spelregels (js/hud.js, js/opties.js), net als B alleen bij het rondlopen.
    if (T.NIEUWE_HUD && S.modus === 'verkennen' && (ev.key === 'o' || ev.key === 'O')) {
      T.ui.openSpelregels(S);
      return;
    }
    // V: de velden (js/hud.js; wat elk veld is en volgend jaar wordt), ook alleen bij het rondlopen.
    if (T.NIEUWE_HUD && S.modus === 'verkennen' && (ev.key === 'v' || ev.key === 'V') && S.wereld.akkers) {
      T.ui.openVelden(S);
      return;
    }
    if (T.NIEUWE_HUD && S.modus === 'verkennen' && (ev.key === 'b' || ev.key === 'B')) {
      if (S.bouwSoort || S.bouwMenuOpen) {
        S.bouwSoort = null;
        S.bouwMenuOpen = false;
      } else {
        S.bouwMenuOpen = true;
      }
      if (T.ui.toonBouwmenu) T.ui.toonBouwmenu(S);
      return;
    }
    if (ev.key === 'Escape') {
      if (S.bouwSoort || S.bouwMenuOpen) {
        S.bouwSoort = null;
        S.bouwMenuOpen = false;
        if (T.ui.toonBouwmenu) T.ui.toonBouwmenu(S);
      }
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
    // De kalender een dag of een snelheid geven zonder te wachten: Toren.debug.kalender(310) →
    // naar dag 310, Toren.debug.kalender(null, 3) → 3x. Zonder argumenten zegt het waar de
    // kalender nu staat.
    kalender(dag, snelheid) {
      if (dag != null) S.kalender.dag = dag;
      if (snelheid != null) T.zetSnelheid(S, snelheid);
      T.ui.toonKalender(S); // ook bijwerken als alleen de dag rechtstreeks gezet is
      return { ...T.datumVanDag(S.kalender.dag), snelheid: S.kalender.snelheid };
    },
    // Een gebouw rechtstreeks neerzetten, zonder het bouwmenu: Toren.debug.bouw('huis', 10, 10).
    // Zelfde antwoord als een klik in het bouwmenu (js/gebouwen.js, T.plaatsGebouw).
    bouw(soort, x, y) {
      return T.plaatsGebouw(S, soort, x, y);
    },
    // De marskramer nu laten komen, zonder op grasmaand te wachten: Toren.debug.marskramer() voor
    // het bezoek van de lente, (1) voor de zomer, (2) voor de herfst (js/handel.js). Is hij er al,
    // dan zegt het hoe het met hem staat.
    marskramer(bezoek) {
      if (!S.marskramer) T.marskramerKomt(S, bezoek || 0, Math.floor(S.kalender.dag));
      const m = S.marskramer;
      return m && { bezoek: m.bezoek, beurs: m.beurs, plaats: m.plaats, heeft: { ...m.heeft }, staat: m.staat, weg: m.weg, gaatOp: m.gaatOp };
    },
    // De heer nu laten komen, zonder op Sint-Maarten te wachten (js/heer.js): Toren.debug.heer().
    // Is hij er al, dan zegt het wat hij vraagt en hoe het met hem staat. Toren.debug.brief()
    // stuurt zijn brief van wijnmaand nu.
    heer() {
      if (!S.heer || !S.heer.bezoek) T.heerKomt(S, Math.floor(S.kalender.dag));
      const b = S.heer.bezoek;
      return { vraagt: T.eisVanDeHeer(S).per, staat: b.staat, betaald: !!b.betaald, schuld: S.heer.schuld };
    },
    brief() {
      T.stuurBrief(S, Math.floor(S.kalender.dag));
      return T.eisVanDeHeer(S).per;
    },
    // De inner nu laten komen, zonder op oogstmaand te wachten (js/inner.js): Toren.debug.inner(),
    // of Toren.debug.inner(true) voor zijn onverwachte tweede bezoek. Is hij er al, dan zegt het
    // wat hij zag, hoeveel geduld hij nog heeft, en wat er in zijn rapport staat.
    inner(onverwacht) {
      const I = S.inner || (S.inner = T.nieuweInner());
      if (!I.bezoek) T.innerKomt(S, Math.floor(S.kalender.dag), !!onverwacht);
      const b = I.bezoek;
      const r = I.rapport;
      return {
        geduld: b.geduld, volgt: b.volgt, weg: b.weg, gebouwen: b.gebouwen.size, tegels: b.tegels.size,
        nogTeZien: b.weg ? 0 : T.innerNogTeZien(S).length, argwaan: I.argwaan, waarom: I.waarom.slice(),
        rapport: r && { gebouwen: r.gebouwen, woonruimte: r.woonruimte, tegels: r.tegels, graanGezien: r.graanGezien, graanVerwacht: r.graanVerwacht, goudGezien: r.goudGezien, goudVerwacht: r.goudVerwacht },
      };
    },
    // Zijn argwaan zetten (0..1), om te zien wat ze doet: Toren.debug.argwaan(0.6). Zonder getal
    // zegt het hoe hoog ze is, en waarom.
    argwaan(n) {
      const I = S.inner || (S.inner = T.nieuweInner());
      if (typeof n === 'number') {
        I.argwaan = Math.max(0, Math.min(1, n));
        if (T.ui.toonArgwaan) T.ui.toonArgwaan(S);
      }
      return { argwaan: I.argwaan, waarom: I.waarom.slice() };
    },
    // De verstopplekken (js/verstoppen.js): waar je iets kunt verstoppen, wat er ligt, en hoe vaak
    // de soldaten het er vinden. Toren.debug.verstopt('boer1', 30, 5) zet 30 graan en 5 goud in
    // de kelder van boer1 (of 'schout', of 'kapel'), zonder te lopen, als het kan.
    verstopt(huis, graan = 0, goud = 0) {
      if (!T.verstopPlekken) return 'Verstoppen kan alleen in het gehucht.';
      const plekken = T.verstopPlekken(S);
      if (huis) {
        const p = plekken.find((q) => q.gebouw.huis === huis || q.gebouw.soort === huis);
        if (!p) return `Geen plek bij "${huis}". Er is: ${plekken.map((q) => q.gebouw.huis || q.gebouw.soort).join(', ')}.`;
        for (const [wat, n] of [['graan', graan], ['goud', goud]]) {
          if (!(n > 0)) continue;
          const r = T.verstop(S, p.gebouw, wat, n);
          if (!r.kan) return r.reden;
        }
      }
      return plekken.map((p) => ({
        plek: p.naam, wie: p.gebouw.huis || p.gebouw.soort, karakter: p.karakter, graan: Math.floor((p.gebouw.verstopt || {}).graan || 0),
        goud: Math.floor((p.gebouw.verstopt || {}).goud || 0), plaats: p.plaats, vinden: p.vinden, houdt: p.houdt, weigert: p.weigert,
      }));
    },
    // De soldaten het dorp nu laten doorzoeken, zoals op Sint-Maarten (js/inner.js): wat ze vinden.
    zoeken() {
      return T.doorzoekDorp ? T.doorzoekDorp(S) : 'Hier zoekt niemand.';
    },
    // Het slachtvenster nu openen (js/hud.js, T.ui.openSlachten), zonder op 1 slachtmaand te wachten.
    slachten() {
      if (!T.ui.openSlachten) return 'Het slachtvenster is er alleen in het gehucht.';
      T.ui.openSlachten(S);
      return T.ui.slachtenOpen() ? 'open' : 'Er is geen vee om te slachten.';
    },
    // Vee neerzetten om naar te kijken (js/vee.js): Toren.debug.vee('koe', 4) zet vier koeien op de
    // weide met de meeste plaats (een schaap op de heide, als die er is), elk op een vrije tegel en
    // met een eigen zaad (en dus een eigen kleur en een eigen ritme van grazen, staan en liggen).
    // Daar horen ze bij de kudde: ze blijven binnen de weide, geven melk en werpen jongen, en
    // verhuizen mee bij een wissel. Is die weide vol, dan de volgende; te vol mag, dat is ook iets
    // om naar te kijken (minder melk). Zonder weide, of zonder vrije tegel erop, rond een open plek
    // bij de schout, zoals vóór de weides.
    vee(soort = 'koe', aantal = 1) {
      if (!T.VEE[soort]) return `Dat dier ken ik niet: ${soort}. Er is: ${Object.keys(T.VEE).join(', ')}.`;
      const w = S.wereld;
      const h = S.held;
      const vrij = (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true });
      const opWeide = [];
      // Een schaap gaat naar de heide als het gehucht er een heeft (js/vee.js, T.graastOp).
      const meent = T.graastOp && T.graastOp(w, soort) === 'meent' ? T.meentVan(w) : null;
      const weides = meent ? [meent] : (w.akkers || []).filter((v) => T.bestemmingVan(v) === 'weide');
      while (opWeide.length < aantal && weides.length) {
        weides.sort((a, b) => T.weideStand(S, b).vrij - T.weideStand(S, a).vrij);
        const v = weides[0];
        // De vrije tegel die het verst van de andere dieren op deze weide ligt: zo spreidt de kudde.
        const anderen = T.dierenOp(S, v);
        let plek = null;
        let ruimte = -1;
        for (let y = v.y; y < v.y + v.h; y++) {
          for (let x = v.x; x < v.x + v.b; x++) {
            if (!vrij(x, y)) continue;
            const r = anderen.reduce((m, d) => Math.min(m, T.afstand({ x: d.tx, y: d.ty }, { x, y })), 99);
            if (r > ruimte) {
              ruimte = r;
              plek = { x, y };
            }
          }
        }
        if (!plek) {
          weides.shift(); // geen vrije tegel meer op deze weide: de volgende
          continue;
        }
        S.veeZaad = (S.veeZaad || 0) + 1;
        const e = T.zetOpWeide(T.maakDier(soort, plek.x, plek.y, S.veeZaad), v);
        w.wezens.push(e);
        opWeide.push(e);
      }
      const opWeideTekst = opWeide.map((e) => `${e.naam} ${e.vel} op ${e.tx},${e.ty}, op ${e.weide.meent ? 'de heide' : `de weide ${e.weide.naam}`}`);
      if (opWeide.length && T.ui.toonVoorraad) T.ui.toonVoorraad(S); // de melk bij de kaas in de balk
      if (opWeide.length === aantal) return opWeideTekst;
      aantal -= opWeide.length;
      // Het midden van de kudde: de dichtstbijzijnde tegel, drie of meer stappen van de schout, met
      // vijf bij vijf vrije tegels eromheen.
      const open = (x, y) => {
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (!vrij(x + dx, y + dy)) return false;
        return true;
      };
      let midden = null;
      for (let r = 3; r <= 16 && !midden; r++) {
        for (let dy = -r; dy <= r && !midden; dy++) {
          for (let dx = -r; dx <= r && !midden; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) === r && open(h.tx + dx, h.ty + dy)) midden = { x: h.tx + dx, y: h.ty + dy };
          }
        }
      }
      if (!midden) return opWeide.length ? opWeideTekst : 'Er is geen open stuk grond bij de schout.';
      // De dieren eromheen, van binnen naar buiten, met een tegel ruimte tussen elk dier (ook tussen
      // dieren die er al stonden): een koe is ruim twee tegels lang.
      const dieren = w.wezens.filter((e) => e.dier && !e.dood);
      const geplaatst = [];
      for (let r = 0; r <= 8 && geplaatst.length < aantal; r++) {
        for (let dy = -r; dy <= r && geplaatst.length < aantal; dy++) {
          for (let dx = -r; dx <= r && geplaatst.length < aantal; dx++) {
            const x = midden.x + dx;
            const y = midden.y + dy;
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || !vrij(x, y) || T.afstand(h, { x, y }) < 2) continue;
            if (dieren.some((d) => T.afstand({ x: d.tx, y: d.ty }, { x, y }) < 2)) continue;
            S.veeZaad = (S.veeZaad || 0) + 1;
            const e = T.maakDier(soort, x, y, S.veeZaad);
            w.wezens.push(e);
            dieren.push(e);
            geplaatst.push(e);
          }
        }
      }
      return opWeideTekst.concat(geplaatst.map((e) => `${e.naam} ${e.vel} op ${e.tx},${e.ty}`));
    },
    // Het doek als PNG bewaren: await Toren.debug.schermafdruk('graan-rijp') schrijft
    // gereedschap/pixelart/uit/schermen/graan-rijp.png (via server.cjs; werkt niet vanaf file://).
    // Alleen het doek, dus zonder de html-balken erover. Zo kan een sessie of agent een blik op het
    // spel laten zien zonder de hele afbeelding als tekst door zijn gesprek te halen.
    async schermafdruk(naam) {
      const doek = document.querySelector('canvas');
      const blob = await new Promise((klaar) => doek.toBlob(klaar, 'image/png'));
      const r = await fetch('/gereedschap/api/schermafdruk/' + encodeURIComponent(naam), { method: 'POST', body: blob });
      return r.json();
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
    // Een quest in een fase zetten zonder hem te spelen. Zo kun je zien wat het dorp in elke
    // fase zegt terwijl je de kaart nog tekent:
    //   Toren.debug.quest()                 → wat er loopt, en wat er te kiezen valt
    //   Toren.debug.quest('molen')          → de fasen van die quest, en waar hij nu staat
    //   Toren.debug.quest('molen', 'terug')  → zet hem daar neer
    //   Toren.debug.quest('molen', 'uit')    → helemaal terug naar niet begonnen, beloning en al
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
  };

  formaat();
  // De pixel art gaat meteen laden; tot hij klaar is tekent het spel zijn vlakken. Achter de
  // benoemingsbrief is dat nauwelijks te zien.
  T.sprites.laad();
  T.nieuwSpel();
  requestAnimationFrame(lus);
})(globalThis.Toren = globalThis.Toren || {});
