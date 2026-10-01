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

  // Een nieuw spel: een verse wereld in het gehucht. Alles van een vorig spel gaat eerst weg, ook wat de
  // regels er onderweg bij zetten (de heer, de inner, het slapen, het einde); alleen de zoom van het scherm
  // blijft. Het begint niet vanzelf: het titelscherm (js/menu.js, vraag 48) laat het erachter wachten, en
  // pas "Nieuw spel" geeft de benoemingsbrief van de heer, waarmee een spel begint sinds Marcel hem op
  // 25 sep koos (T.ui.toonBrief(S.dorp, 'benoeming'), js/brieven.js). Een proefje (?kaart=) begint meteen,
  // zonder brief, en wordt nooit opgeslagen (S.proefje; js/opslaan.js). Met `makerZaad` begint het op
  // een gehucht van de maker uit dat zaad (T.beginOpKaart, js/gebied.js; Spel.debug.gehucht).
  T.nieuwSpel = function (makerZaad) {
    for (const k of Object.keys(S)) if (k !== 'zoom') delete S[k];
    Object.assign(S, {
      tijd: 0,
      gebieden: {}, // een nieuw spel begint met schone gebieden
      modus: 'verkennen',
      gevecht: null,
      overgang: null,
      bezig: false,
      inventaris: new Set(),
      kalender: T.nieuweKalender(), // dag, seizoen, jaar en snelheid (js/tijd.js), voor het spel en al zijn dorpen
      // De dorpen (S.dorpen) en je eigen dorp (S.dorp) komen met de kaart: T.beginOpKaart hieronder (js/dorp.js).
      quests: {}, // per quest de fase waarin hij staat (js/quest.js)
      questWeg: {}, // en hoe je hem oploste, zodat het dorp erop kan reageren
      questBeloond: new Set(),
      sleutelGebruikt: false,
      fonteinLeeg: false,
      sluipen: false,
      bezocht: new Set(['hal']),
      naarGebied: null,
      netGeland: null, // de tegel waar de schout zojuist is neergezet (js/gebied.js)
    }, T.schermVelden()); // wat alleen scherm is (de muis, het raster, het bouwmenu): js/opslaan.js
    // Een proefje (?kaart=) begint op zijn eigen kaart, zonder brief; lukt dat niet (de kaart
    // bestaat niet), dan valt het terug op het gehucht — een half aangelegde wereld mag nooit het
    // spel breken.
    const proefje = !!BEGIN_KAART && T.beginOpKaart(S, BEGIN_KAART, makerZaad);
    if (!proefje) T.beginOpKaart(S, 'gehucht', makerZaad); // zet S.wereld en S.schout
    if (proefje) S.proefje = true;
    zetCameraOpSchout();
    T.ui.reset(S);
  };

  // Het spel dat achter het titelscherm klaarstaat, begint op het gehucht dat de spelregel "Je gehucht" nu zegt
  // (js/maker.js). Het stond er al toen de bladzijde opende; wie de spelregel daarna omzette (op het titelscherm, of
  // in een spel), krijgt bij Nieuw spel (js/menu.js) eerst een vers spel. Wie niets omzette, houdt het spel dat
  // klaarstond, zodat hetzelfde zaad hetzelfde spel blijft geven (de speeltest).
  // Geeft true als er een vers spel kwam.
  T.gehuchtNaarDeSpelregel = function () {
    const gemaakt = !!(S.gebieden && S.gebieden.gehucht && S.gebieden.gehucht.maker);
    if (S.proefje || gemaakt === !!T.MAKER_INSTELLINGEN.eigenGehucht) return false;
    T.nieuwSpel();
    return true;
  };

  function zetCameraOpSchout() {
    const p = T.naarScherm(S.schout.x, S.schout.y);
    S.camera = { x: p.x, y: p.y - 24 };
  }

  // Een bewaard spel laden (js/opslaan.js). Eerst lezen: lukt dat niet, dan blijft het spel zoals het was.
  // Dan een nieuw spel, zodat wat er sinds het bewaren in het spel bij kwam, zijn beginwaarde heeft; het
  // bewaarde erover; en het scherm opnieuw op de schout. Geeft { gelukt, kop } of { gelukt: false, reden }.
  T.laadSpel = function (plek) {
    const gelezen = T.leesVanPlek(plek);
    if (!gelezen.gelukt) return gelezen;
    T.nieuwSpel();
    T.zetSpel(S, gelezen);
    zetCameraOpSchout();
    T.ui.reset(S);
    return { gelukt: true, kop: gelezen.kop };
  };

  // Terug naar het titelscherm (het menu, en de twee eindschermen: je ambt kwijt, of gevallen). Daarachter
  // wacht een nieuw spel, zoals toen de bladzijde openging.
  T.naarTitelscherm = function () {
    T.nieuwSpel();
    if (!S.proefje) T.ui.toonTitel(S);
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

  // Wat ligt er onder de muis? Wezens en voorwerpen steken boven hun tegel uit, dus die
  // worden eerst gezocht, van voor naar achter. Anders is het de tegel zelf.
  function zoekDoel(mx, my) {
    const w = S.wereld;
    const { x: sx, y: sy } = naarVlak(mx, my);
    const kandidaten = [];
    for (const e of w.wezens) {
      if (e.dood || e.binnen || e === S.schout || !T.isZichtbaar(w, e.tx, e.ty)) continue;
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
    // Met een erf in de hand op een vrij erf: een klik maakt het weer gewone grond (js/erven.js).
    const erf = T.GEBOUWEN[S.bouwSoort].erf ? T.erfOp(S.dorp, x, y) : null;
    if (erf && !erf.hut) {
      S.bouwHover = { x, y, ok: false, weghalen: erf };
      canvas.style.cursor = 'pointer';
      T.ui.tooltip('Klik: dit erf weer gewone grond maken.', S.muis.x, S.muis.y);
      S.hover = null;
      S.handeling = null;
      return;
    }
    // Past hij niet, dan zegt de muis waarom (op het plein wordt niet gebouwd), net als de klik.
    const reden = T.waaromPastHetNiet(S.dorp, S.bouwSoort, x, y);
    S.bouwHover = { x, y, ok: !reden, reden };
    canvas.style.cursor = 'crosshair';
    // Een plek die een huis in de buurt wil (een put, een kapel, de herberg, een markt): wie hij hier bereikt. De kring is
    // groter dan het scherm, dus zegt de muis het ook in woorden (js/wensen.js).
    const voet = !reden && T.gebouwVoet(S.bouwSoort, T.volgendeTekening(S.dorp, S.bouwSoort));
    const kring = voet && T.kringTekst(S.dorp, S.bouwSoort, { x, y, b: voet.b, h: voet.h });
    if (reden) T.ui.tooltip(reden, S.muis.x, S.muis.y, true);
    else if (kring) T.ui.tooltip(kring, S.muis.x, S.muis.y);
    else T.ui.verbergTooltip();
    S.hover = null;
    S.handeling = null;
  }

  function werkHoverBij() {
    if (S.bouwSoort) {
      werkBouwHoverBij();
      return;
    }
    // In een gevecht bestuur je wie van jouw kant aan de beurt is: de schout, of een man van de militie.
    const actief = S.modus === 'verkennen' || (S.modus === 'gevecht' && !S.bezig && T.spelerAanDeBeurt(S));
    if (!S.muis || !actief) {
      S.hover = null;
      S.handeling = null;
      T.ui.verbergTooltip();
      canvas.style.cursor = 'default';
      if (S.modus === 'gevecht' && T.spelerAanDeBeurt(S)) {
        const v = T.aanDeBeurt(S);
        T.ui.toonAp(v.ap, v.maxAp, 0, true);
      }
      return;
    }
    S.hover = zoekDoel(S.muis.x, S.muis.y);
    const h = S.modus === 'verkennen' ? T.handelingVerkennen(S, S.hover) : T.handelingGevecht(S, S.hover);
    S.handeling = h;
    if (S.modus === 'gevecht') {
      const v = T.aanDeBeurt(S);
      T.ui.toonAp(v.ap, v.maxAp, h ? h.kosten || 0 : 0, !h || h.kan !== false);
    }
    if (h && h.tekst) T.ui.tooltip(tipTekst(h), S.muis.x, S.muis.y, !!h.fout || h.kan === false);
    else T.ui.verbergTooltip();
    canvas.style.cursor = h ? 'pointer' : 'default';
  }

  // Bij het rondlopen volgt de camera de schout; in een gevecht zoekt hij het midden tussen
  // iedereen die meedoet, zodat het hele slagveld in beeld schuift.
  //
  // Dat begint al bij de overgang, vóór het gevecht: het monster dat je ziet, komt meteen in
  // beeld, tegelijk met de melding. Buiten is dat het verschil tussen een gevecht dat begint en
  // aangevallen worden door iets wat je niet kunt zien.
  // Vroeger hield de camera hier een marge aan tot de rand van de kaart (begrensCamera), zodat
  // je nooit de lege ruimte erachter zag: de camera stopte al een halve schermmaat van de rand.
  // Op een kleine kaart (het dorp, 48×40) liep de schout daardoor ver uit het midden door en
  // verdween in de hoek, tot onder het paneel linksboven (Marcel, 21 sep 2026) — de camera volgde
  // niet meer mee terwijl de schout nog een heel eind verder kon lopen. Nu js/tekenen.js voorbij de
  // rand een bosrand tekent (zie daar "het bos om de kaart heen") is die marge niet meer nodig:
  // wat er te zien komt voorbij de kaart is bos, geen leegte, dus de camera volgt de schout gewoon
  // altijd. Dat houdt hem ook vanzelf uit de buurt van het paneel en de knoppen onderaan, want
  // zijn plek op het scherm staat dan vast in plaats van dat hij naar een bevroren camera toe kan
  // weglopen.
  // Achter het titelscherm glijdt de camera langzaam rond het plein (vraag 48 C): een rondje in twee
  // minuten, op de klok van het scherm, want de wereld staat daar stil.
  function titelCamera() {
    const rand = S.wereld.plein;
    let mx = S.schout.x;
    let my = S.schout.y;
    if (rand && rand.length) {
      mx = rand.reduce((n, [x]) => n + x, 0) / rand.length;
      my = rand.reduce((n, [, y]) => n + y, 0) / rand.length;
    }
    const hoek = (S.tijd / 120) * 2 * Math.PI;
    const p = T.naarScherm(mx + 4 * Math.cos(hoek), my + 4 * Math.sin(hoek));
    return { x: p.x, y: p.y - 24 };
  }
  T.titelCamera = titelCamera;

  // In een gevecht kijkt de camera naar wie van jouw kant aan de beurt is (de schout, of een man van de
  // militie) en de vijanden die nog staan.
  function cameraDoel() {
    const aanleiding = S.overgang && S.overgang.aanleiding;
    const wie = T.spelerAanDeBeurt(S) ? T.aanDeBeurt(S) : S.schout;
    const lijst = S.gevecht
      ? [wie, ...S.gevecht.monsters.filter((m) => !m.dood)]
      : aanleiding && !aanleiding.dood
        ? [S.schout, aanleiding]
        : [S.schout];
    let x = 0;
    let y = 0;
    for (const e of lijst) {
      const p = T.naarScherm(e.x, e.y);
      x += p.x;
      y += p.y;
    }
    return { x: x / lijst.length, y: y / lijst.length - 24 };
  }

  // De raad onder het doel (js/raad.js) rekent met de groei en de winter, en dat hoeft niet elk beeld: om de halve
  // seconde is genoeg. Hij verandert niets, en is alleen scherm, dus hij staat niet in S.
  const RAAD_ELKE = 0.5;
  let raadNu = null;
  let raadOp = -Infinity;

  function werkBij(dt) {
    // Een resize-gebeurtenis komt niet altijd (een tabblad dat verborgen opstartte, heeft
    // eerst geen maat), dus kijkt de lus zelf of het venster veranderd is.
    if (window.innerWidth !== bw || window.innerHeight !== bh) formaat();
    S.tijd += dt;
    S.wind = T.windWaarde(S.tijd);
    // De tijd van de wereld: de schermtijd maal de snelheid van de kalender (T.wereldFactor,
    // js/tijd.js). Lopen, maaien en dwalen gaan daarop, zodat een tocht of een tegel graan op elke
    // snelheid even veel uren kost; op pauze staat alles stil. S.wereldTijd telt hem op, voor wie
    // een duur moet afwachten (het maaien, het geduld van de inner).
    const dtWereld = dt * T.wereldFactor(S);
    S.wereldTijd = (S.wereldTijd || 0) + dtWereld;
    // De kalender loopt op haar eigen klok, niet op S.tijd (CLAUDE.md, "Testen in de browser"):
    // zo laat pauzeren of versnellen nooit een animatie stilvallen of doorschieten.
    T.tikKalender(S, dt);
    T.werkDagBij(S); // wakker worden na het slapen (js/dag.js)
    // Elke ochtend vanzelf opslaan (js/opslaan.js, vraag 48 A); js/menu.js zegt het in de hoek.
    const bewaard = T.werkOpslaanBij(S);
    if (bewaard) T.ui.opgeslagen(bewaard);
    // Elk dorp leeft (js/dorp.js; werklijst, vraag 71, A): zijn dag, zijn bezoekers, zijn mensen, zijn rovers en zijn
    // voorvallen. Waar je bent, lopen, maaien en dwalen ze hieronder en worden ze getekend; een dorp waar je niet bent,
    // doet dat in T.werkDorpBij zelf.
    for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtWereld);
    T.werkLandBij(S); // op reis de volgende provincie, en over de weg het gehucht uit de kaart van het land (js/land.js)
    T.ui.werkLandkaartBij(S); // en die kaart op het scherm (js/landkaart.js)
    T.werkAnimatiesBij(S, dt, dtWereld);
    // Een overgang naar een ander gebied wordt hier opgepakt, en niet daar waar hij ontstaat
    // (T.bijAankomst): de lijst wezens van de wereld verandert erdoor, en daar loopt de animatie
    // net doorheen.
    if (S.naarGebied) T.gaNaarGebied(S, S.naarGebied);
    // Quests gaan vanzelf verder (js/quest.js): heb je wat een quest vraagt, dan schuift de
    // fase op, nog vóór er iets dwaalt of iemand je ziet. Het vak linksboven is van de quest die
    // je het eerst aannam; zonder quest staat er het doel van het gehucht: een dorp worden
    // (js/treden.js). Daaronder de raad: wat nu tussen jou en een dorp staat (js/raad.js).
    T.werkQuestsBij(S);
    const doelNu = T.questDoel(S) || T.tredeDoel(S.dorp);
    if (!(S.tijd - raadOp < RAAD_ELKE) || S.tijd < raadOp) {
      raadNu = T.raadNu(S.dorp);
      raadOp = S.tijd;
    }
    T.ui.opdracht(doelNu && doelNu.tekst, doelNu && doelNu.kop, raadNu && raadNu.tekst);
    // Ook op reis (js/land.js, de kaart van het land) gaat het dorp zijn gang: er wordt gemaaid en gedwaald.
    if (S.modus === 'verkennen' || S.modus === 'land') {
      // Vóór T.laatDwalen: wie hier een pad krijgt of aan het maaien slaat (T.werkOogstBij,
      // js/akkers.js, alleen het nieuwe spel: S.wereld.akkers is er anders niet), staat voor
      // T.laatDwalen al "bezig" (m.pad.length of m.maait) en dwaalt deze beurt niet ook nog weg.
      const hier = T.dorpHier(S); // het dorp waar je bent; de andere maaien in T.werkDorpBij (js/dorp.js)
      if (hier) T.werkOogstBij(S, hier, dtWereld);
      T.laatDwalen(S, dtWereld);
      const m = S.modus === 'verkennen' && T.zoekOntdekking(S);
      if (m) T.startGevecht(S, m, false);
    }
    if (S.modus === 'overgang' && S.wereld.wezens.every((e) => !e.pad.length)) T.beginGevecht(S);
    const doelAlpha = S.modus === 'gevecht' ? 1 : 0;
    S.rasterAlpha += (doelAlpha - S.rasterAlpha) * Math.min(1, dt * 5);
    const doel = T.ui.titelOpen() ? titelCamera() : cameraDoel();
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
    // Wie slaapt en ergens heen wil, is wakker (js/dag.js).
    if (S.slaap && T.wordWakker) T.wordWakker(S);
    werkHoverBij();
    if (S.bouwSoort) {
      const soort = S.bouwSoort;
      const hover = S.bouwHover;
      if (hover && hover.weghalen) {
        const r = T.haalErfWeg(S.dorp, hover.weghalen);
        T.ui.bericht(r.gelukt ? r.bericht : r.reden, r.gelukt ? null : 'gevaar');
        S.bouwSoort = null;
        return;
      }
      if (!hover || !hover.ok) {
        T.ui.bericht((hover && hover.reden) || 'Daar past het niet.', 'gevaar');
        return;
      }
      const r = T.plaatsGebouw(S.dorp, soort, hover.x, hover.y);
      if (!r.gelukt) {
        T.ui.bericht(r.reden, 'gevaar');
        return;
      }
      T.ui.bericht(r.bericht, 'goed');
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
      if (ev.key === 'Escape') T.ui.sluitHandel(S.dorp);
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
    // stil. Esc of V sluit het; B, O en W sluiten het ook en gaan dan meteen door naar het bouwmenu,
    // de spelregels of de wetten, hieronder.
    if (S.modus === 'velden') {
      const k = (ev.key || '').toLowerCase();
      if (k === 'escape' || k === 'v' || k === 'b' || k === 'o' || k === 'w' || k === 'r') T.ui.sluitVelden(S);
      if (k !== 'b' && k !== 'o' && k !== 'w' && k !== 'r') return;
    }
    // Het menu Wetten (js/wettenmenu.js) net zo: Esc of W sluit het, en B, O, V en R gaan meteen door.
    if (S.modus === 'wetten') {
      const k = (ev.key || '').toLowerCase();
      if (k === 'escape' || k === 'w' || k === 'b' || k === 'o' || k === 'v' || k === 'r') T.ui.sluitWetten(S);
      if (k !== 'b' && k !== 'o' && k !== 'v' && k !== 'r') return;
    }
    // Het venster Raadsman (js/raadsmanvenster.js) net zo: Esc of R sluit het, en B, O, V en W gaan meteen door.
    if (S.modus === 'raadsman') {
      const k = (ev.key || '').toLowerCase();
      if (k === 'escape' || k === 'r' || k === 'b' || k === 'o' || k === 'v' || k === 'w') T.ui.sluitRaadsman(S);
      if (k !== 'b' && k !== 'o' && k !== 'v' && k !== 'w') return;
    }
    // De kaart van het land (js/landkaart.js): Esc is terug het gehucht in, als je nog thuis bent; op reis of in een
    // andere provincie kies je op de kaart waar je heen gaat.
    if (S.modus === 'land') {
      if (ev.key === 'Escape') T.ui.sluitLand(S);
      return;
    }
    // Thuis na een reis (js/landkaart.js): wat er gebeurde; Esc is verder.
    if (ev.key === 'Escape' && T.ui.terugOpen()) {
      T.ui.sluitTerug(S);
      return;
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
    // W: de wetten (js/wettenmenu.js), ook alleen bij het rondlopen.
    if (T.NIEUWE_HUD && S.modus === 'verkennen' && (ev.key === 'w' || ev.key === 'W')) {
      T.ui.openWetten(S);
      return;
    }
    // R: je raadsman (js/raadsmanvenster.js), ook alleen bij het rondlopen.
    if (T.NIEUWE_HUD && S.modus === 'verkennen' && (ev.key === 'r' || ev.key === 'R')) {
      T.ui.openRaadsman(S);
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
      } else {
        T.ui.openMenu(S); // is er niets anders om weg te leggen: het menu (js/menu.js, vraag 48 D)
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
    // Spel.debug.vlakken = true tekent weer met vlakken in plaats van met de pixel art,
    // om te vergelijken en om te zien of er niets verdwenen is.
    vlakken: false,
    // Waar staat tegel (x, y) nu op het scherm, in css-pixels? Voor echte klikken.
    naarBeeld(x, y) {
      const p = T.naarScherm(x, y);
      return vanVlak(p.x, p.y);
    },
    // De kalender een dag of een snelheid geven zonder te wachten: Spel.debug.kalender(310) →
    // naar dag 310, Spel.debug.kalender(null, 3) → 3x. Zonder argumenten zegt het waar de
    // kalender nu staat.
    kalender(dag, snelheid) {
      if (dag != null) S.kalender.dag = dag;
      if (snelheid != null) T.zetSnelheid(S, snelheid);
      T.ui.toonKalender(S); // ook bijwerken als alleen de dag rechtstreeks gezet is
      return { ...T.datumVanDag(S.kalender.dag), snelheid: S.kalender.snelheid };
    },
    // Naar een uur van deze dag springen (js/dag.js): Spel.debug.uur(21) voor de avond, (2) voor de
    // nacht. Zonder getal zegt het hoe laat het is en welk deel van de dag.
    uur(u) {
      if (typeof u === 'number') S.kalender.dag = Math.floor(S.kalender.dag) + Math.max(0, Math.min(23.99, u)) / 24;
      T.ui.toonKalender(S);
      const dag = S.kalender.dag;
      return { uur: T.uurTekst(dag), deel: T.dagdeelVan(dag), licht: T.lichtVan(dag), dagindeling: T.dagindeling(dag) };
    },
    // Een gebouw rechtstreeks neerzetten, zonder het bouwmenu: Spel.debug.bouw('huis', 10, 10).
    // Zelfde antwoord als een klik in het bouwmenu (js/gebouwen.js, T.plaatsGebouw).
    bouw(soort, x, y) {
      return T.plaatsGebouw(S.dorp, soort, x, y);
    },
    // De marskramer nu laten komen, zonder op grasmaand te wachten: Spel.debug.marskramer() voor
    // het bezoek van de lente, (1) voor de zomer, (2) voor de herfst (js/handel.js). Is hij er al,
    // dan zegt het hoe het met hem staat.
    marskramer(bezoek) {
      if (!S.dorp.marskramer) T.marskramerKomt(S.dorp, bezoek || 0, Math.floor(S.kalender.dag));
      const m = S.dorp.marskramer;
      if (m) m.meteen = true; // ook 's nachts: niet op het bezoekuur wachten (js/dag.js, T.bezoekerKomtAan)
      return m && { bezoek: m.bezoek, beurs: m.beurs, plaats: m.plaats, heeft: { ...m.heeft }, staat: m.staat, weg: m.weg, gaatOp: m.gaatOp };
    },
    // De heer nu laten komen, zonder op Sint-Maarten te wachten (js/heer.js): Spel.debug.heer().
    // Is hij er al, dan zegt het wat hij vraagt en hoe het met hem staat. Spel.debug.brief()
    // stuurt zijn brief van wijnmaand nu.
    heer() {
      if (!S.dorp.heer || !S.dorp.heer.bezoek) T.heerKomt(S.dorp, Math.floor(S.kalender.dag));
      const b = S.dorp.heer.bezoek;
      b.meteen = true; // ook 's nachts: niet op het bezoekuur wachten (js/dag.js, T.bezoekerKomtAan)
      return { vraagt: T.eisVanDeHeer(S.dorp).per, staat: b.staat, betaald: !!b.betaald, schuld: S.dorp.heer.schuld };
    },
    brief() {
      T.stuurBrief(S.dorp, Math.floor(S.kalender.dag));
      return T.eisVanDeHeer(S.dorp).per;
    },
    // De inner nu laten komen, zonder op oogstmaand te wachten (js/inner.js): Spel.debug.inner(),
    // of Spel.debug.inner(true) voor zijn onverwachte tweede bezoek. Is hij er al, dan zegt het
    // wat hij zag, tot hoe laat hij blijft, hoe lang je hem aan de praat hield, wat je hem gaf, en
    // wat er in zijn rapport staat.
    inner(onverwacht) {
      const I = S.dorp.inner || (S.dorp.inner = T.nieuweInner());
      if (!I.bezoek) T.innerKomt(S.dorp, Math.floor(S.kalender.dag), !!onverwacht);
      const b = I.bezoek;
      b.meteen = true; // ook 's nachts: niet op het bezoekuur wachten (js/dag.js, T.bezoekerKomtAan)
      const r = I.rapport;
      const uur = (dag) => `${Math.floor(T.uurVanDag(dag))}:${String(Math.floor((T.uurVanDag(dag) % 1) * 60)).padStart(2, '0')}`;
      return {
        blijftTot: b.tot != null && isFinite(b.tot) ? uur(b.tot) : null, gepraat: Math.round(b.gepraat * 10) / 10, uitgepraat: b.uitgepraat,
        volgt: b.volgt, weg: b.weg, gebouwen: b.gebouwen.size, tegels: b.tegels.size,
        nogTeZien: b.weg ? 0 : T.innerNogTeZien(S.dorp).length, argwaan: I.argwaan, waarom: I.waarom.slice(),
        geschenken: I.geschenken, korting: T.innerKorting(S.dorp), gehoord: I.gehoord,
        rapport: r && { gebouwen: r.gebouwen, woonruimte: r.woonruimte, tegels: r.tegels, graanGezien: r.graanGezien, graanVerwacht: r.graanVerwacht, goudGezien: r.goudGezien, goudVerwacht: r.goudVerwacht, korting: r.korting },
      };
    },
    // Zijn argwaan zetten (0..1), om te zien wat ze doet: Spel.debug.argwaan(0.6). Zonder getal
    // zegt het hoe hoog ze is, en waarom.
    argwaan(n) {
      const I = S.dorp.inner || (S.dorp.inner = T.nieuweInner());
      if (typeof n === 'number') {
        I.argwaan = Math.max(0, Math.min(1, n));
        if (T.ui.toonArgwaan) T.ui.toonArgwaan(S.dorp);
      }
      return { argwaan: I.argwaan, waarom: I.waarom.slice() };
    },
    // Wie de schout nu ziet (js/zien.js): hoe ver je hem ziet waar hij staat, wie er kijkt en hoe ver
    // die staat, en welk licht er brandt.
    getuigen() {
      if (!T.getuigenVan) return 'Zien kan alleen in het gehucht.';
      const h = T.tegelVan(S.schout);
      return {
        zicht: Math.round(T.zichtOp(S.dorp, h) * 10) / 10,
        kijkers: T.getuigenVan(S.dorp, null).map((e) => {
          const p = T.bewonerVan(S.dorp, e);
          return { wie: p ? T.naamVanBewoner(p) : e.wie || e.soort, tegel: `${e.tx},${e.ty}`, afstand: Math.round(Math.hypot(e.tx - h.x, e.ty - h.y) * 10) / 10 };
        }),
        licht: T.lichtBronnen(S.dorp).map((b) => `${b.x},${b.y} (${b.straal})`),
      };
    },
    // De verstopplekken (js/verstoppen.js): waar je iets kunt verstoppen, wat er ligt, en hoe vaak
    // de soldaten het er vinden. Spel.debug.verstopt('boer1', 30, 5) zet 30 graan en 5 goud in
    // de kelder van boer1 (of 'schout', of 'kapel'), zonder te lopen, als het kan.
    verstopt(huis, graan = 0, goud = 0) {
      if (!T.verstopPlekken) return 'Verstoppen kan alleen in het gehucht.';
      const plekken = T.verstopPlekken(S.dorp);
      if (huis) {
        const p = plekken.find((q) => q.gebouw.huis === huis || q.gebouw.soort === huis);
        if (!p) return `Geen plek bij "${huis}". Er is: ${plekken.map((q) => q.gebouw.huis || q.gebouw.soort).join(', ')}.`;
        for (const [wat, n] of [['graan', graan], ['goud', goud]]) {
          if (!(n > 0)) continue;
          const r = T.verstop(S.dorp, p.gebouw, wat, n);
          if (!r.kan) return r.reden;
        }
      }
      return plekken.map((p) => ({
        plek: p.naam, wie: p.gebouw.huis || p.gebouw.soort, karakter: p.karakter, graan: Math.floor((p.gebouw.verstopt || {}).graan || 0),
        goud: Math.floor((p.gebouw.verstopt || {}).goud || 0), plaats: p.plaats, vinden: p.vinden, houdt: p.houdt, weigert: p.weigert,
      }));
    },
    // Wie er woont (js/bewoners.js): per bewoner wie hij is, zijn huis, zijn werk, waar hij staat en
    // waar hij nu hoort. Spel.debug.bewoners('herder') zoekt in de tekst, zodat je er één vindt.
    bewoners(zoek) {
      if (!S.dorp.bewoners) return 'Er wonen hier geen bewoners.';
      const lijst = S.dorp.bewoners.mensen.map((p) => {
        const e = p.wezen;
        const a = e && T.dagAnker(S.dorp, e);
        return {
          wie: p.schout ? 'de schout' : p.wie ? `${T.naamVanMens(p.wie)}${T.MENSEN[p.wie] && T.MENSEN[p.wie].karakter ? ' (boer)' : ''}` : T.overBewonerTekst(S.dorp, e, p),
          leeftijd: p.leeftijd, huis: p.huis ? p.huis.huis || `${p.huis.soort} ${p.huis.x},${p.huis.y}` : '-',
          werk: p.werk ? `${p.werk.soort} ${p.werk.x},${p.werk.y}` : '-',
          staat: e ? (e.binnen ? 'binnen' : `${e.tx},${e.ty}`) : p.komt ? 'onderweg hierheen' : '-',
          hoort: a ? `${a.x},${a.y} (${a.binnen ? 'binnen' : 'straal ' + a.straal})` : '-',
        };
      });
      return zoek ? lijst.filter((r) => JSON.stringify(r).includes(zoek)) : lijst;
    },
    // Een nieuw gezin laten komen, zonder op een groeidag te wachten: het komt overdag over de weg
    // (js/bewoners.js). Is het dorp vol, dan neemt het een vrij erf, zoals op een groeidag (js/erven.js).
    // Spel.debug.gezin(-4) laat er een wegtrekken, zoals als het dorp ontevreden is.
    gezin(n = 4) {
      if (!S.dorp.bewoners) return 'Er wonen hier geen bewoners.';
      const plaats = n < 0 ? n : Math.max(0, Math.min(n, (S.dorp.woonruimte || 0) - S.dorp.bevolking));
      if (plaats === 0) {
        const hut = T.gezinZoektEenErf(S.dorp);
        T.ui.toonBevolking(S.dorp);
        return hut ? `Een gezin neemt het erf op (${hut.erf.x}, ${hut.erf.y}), en komt overdag over de weg.` : 'Er is geen plaats: wijs eerst een erf aan (Spel.debug.bouw(\'erf\', x, y)).';
      }
      const echt = plaats < 0 ? T.wijzigBevolking(S.dorp, plaats, 'vertrek', 'het dorp is niet tevreden genoeg') : T.wijzigBevolking(S.dorp, plaats, 'groei');
      T.ui.toonBevolking(S.dorp);
      return echt < 0 ? `${-echt} trekken weg.` : `${echt} komen over de weg, overdag vanaf ${T.DAG_INSTELLINGEN.bezoekUur} uur.`;
    },
    // De trede (js/treden.js): hoe ver het gehucht is met een dorp worden. Spel.debug.trede('dorp') maakt er nu
    // een dorp van, met de brief van de heer, zonder dat de eis gehaald is.
    trede(naar) {
      if (naar) T.wordtTrede(S.dorp, naar);
      const doel = T.tredeDoel(S.dorp);
      return { trede: S.dorp.trede, doel: doel ? `${doel.kop}: ${doel.tekst}` : 'geen volgende trede' };
    },
    // Het gehucht van de maker (js/maker.js): uit welk zaad het gehucht komt (of dat het het ontworpen gehucht is).
    // Spel.debug.gehucht(3) begint nu een nieuw spel op het gehucht van zaad 3, zoals op de pagina "Gehuchten van de
    // maker", zonder brief; zo kun je een zaad bekijken zonder de spelregel om te zetten.
    gehucht(zaad) {
      if (zaad != null) T.nieuwSpel(Number(zaad));
      const w = S.gebieden && S.gebieden.gehucht;
      return w && w.maker ? `Een gehucht van de maker, uit zaad ${w.maker.zaad}.` : 'Het ontworpen gehucht.';
    },
    // De raad onder het doel (js/raad.js): wat er nu staat, en welke raden nu allemaal gelden, in hun volgorde.
    raad() {
      if (!(S.wereld && S.wereld.plein)) return 'Hier is geen raad: deze kaart heeft geen plein.';
      const nu = T.raadNu(S.dorp);
      return { nu: nu ? nu.tekst : 'geen', gelden: T.RADEN.filter((r) => r.als(S)).map((r) => r.id) };
    },
    // De rovers (js/rovers.js): de bende (wie wegtrok), wanneer die en de wilde rovers komen, en de aanval die
    // loopt. Spel.debug.rovers(3) laat nu drie wilde rovers komen, Spel.debug.rovers('bende') de bende.
    rovers(wat) {
      const R = S.dorp.rovers || (S.dorp.rovers = T.nieuweRovers());
      if (wat != null && !R.aanval) {
        const bende = wat === 'bende';
        if (bende && !R.bende.length) return 'Er is geen bende: nog niemand trok weg.';
        R.aanval = { soort: bende ? 'bende' : 'wild', dag: Math.floor(S.kalender.dag), fase: 'wacht', aantal: bende ? 0 : Number(wat) || 3, meteen: true };
      }
      const A = R.aanval;
      return {
        bende: R.bende.map((l) => l.naam), bendeOp: R.bendeOp, wildeOp: R.wildeOp,
        aanval: A ? { soort: A.soort, fase: A.fase, rovers: (A.rovers || []).map((e) => `${e.tx},${e.ty}${e.dood ? ' dood' : ''}`), akker: A.veld } : null,
        militie: S.wereld.wezens.filter((e) => e.opgeroepen).map((e) => `${e.naam} (${e.leven} leven)`),
      };
    },
    // De heervaart (js/heervaart.js): wat de heer vraagt, wie er weg is en tot wanneer, hoe het de laatste keer ging,
    // en wie veteraan is. Spel.debug.heervaart('vraag') laat hem nu mannen vragen (ook in een gehucht), en
    // Spel.debug.heervaart('terug') laat ze nu terugkomen.
    heervaart(wat) {
      const H0 = S.dorp.heervaart;
      if (wat === 'vraag' && !(H0 && (H0.vraag || H0.tocht))) T.vraagHeervaart(S.dorp, Math.floor(S.kalender.dag));
      else if (wat === 'terug' && H0 && H0.tocht) T.heervaartKomtTerug(S.dorp);
      const H = S.dorp.heervaart || T.nieuweHeervaart();
      const naam = (p) => T.naamVanBewoner(p);
      return {
        geldt: T.heervaartGeldt(S.dorp),
        vraag: H.vraag ? { mannen: H.vraag.mannen, goud: H.vraag.goud, wie: H.vraag.wie.map(naam), uiterlijk: T.datumVanDag(H.vraag.uiterlijk).tekst } : null,
        weg: H.tocht ? { wie: H.tocht.wie.map(naam), terug: T.datumVanDag(H.tocht.terugOp).tekst } : null,
        laatste: H.laatste,
        veteranen: (S.dorp.bewoners ? S.dorp.bewoners.mensen.filter((p) => p.veteraan) : []).map(naam),
      };
    },
    // De voorvallen (js/voorvallen.js): wat er nu loopt, welke vervolgen nog komen, wanneer het volgende komt, en
    // welke er nu kunnen. Spel.debug.voorval('diefstal') laat dat nu beginnen, over mensen die erbij passen (ook als
    // het er nu de tijd niet voor is); wie het zegt, zoekt je meteen.
    voorval(id) {
      const dag = Math.floor(S.kalender.dag);
      if (!S.dorp.voorvallen) S.dorp.voorvallen = T.nieuweVoorvallen();
      if (id) {
        if (!T.VOORVALLEN[id]) return `Er is geen voorval "${id}". Er zijn: ${Object.keys(T.VOORVALLEN).join(', ')}.`;
        const v = T.VOORVALLEN[id];
        const oud = { vervolg: v.vervolg, als: v.als, pauze: v.pauze };
        Object.assign(v, { vervolg: false, als: undefined, pauze: 0 });
        const mensen = T.voorvalKan(S.dorp, id, dag);
        Object.assign(v, oud);
        if (!mensen) return `Voor "${id}" is er nu niemand die het kan zeggen, of over wie het kan gaan.`;
        if (S.dorp.voorvallen.lopend) T.voorvalBeantwoord(S.dorp, S.dorp.voorvallen.lopend.id);
        T.beginVoorval(S.dorp, id, mensen.wie, mensen.ander, dag).vanaf = S.kalender.dag;
      }
      const V = S.dorp.voorvallen;
      const naam = (p) => (p ? T.naamVanBewoner(p) : null);
      return {
        lopend: V.lopend ? { id: V.lopend.id, wie: naam(V.lopend.wie), ander: naam(V.lopend.ander), vanaf: T.uurTekst(V.lopend.vanaf), zoekt: !!(V.lopend.wie.wezen && V.lopend.wie.wezen.zoektSchout), oorzaak: V.lopend.oorzaak ? V.lopend.oorzaak.zin : null } : null,
        wacht: V.wacht.map((w) => ({ id: w.id, op: T.datumVanDag(w.op).tekst, wie: naam(w.wie), ander: naam(w.ander) })),
        volgende: V.volgende != null ? T.datumVanDag(V.volgende).tekst : null,
        // Wat er nu kan, met hoe zwaar het weegt, en waar het van komt als er een oorzaak speelt (vraag 74, B).
        kunnen: Object.keys(T.VOORVALLEN).filter((v) => T.voorvalKan(S.dorp, v, dag)).map((v) => {
          const o = T.oorzaakVan(S.dorp, v, dag);
          return `${v} (${Math.round(T.gewichtVanVoorval(S.dorp, v, dag) * 100) / 100})${o ? `: ${o.zin}` : ''}`;
        }),
        oorzaken: T.oorzakenNu(S.dorp, dag).map((o) => o.id),
        aantal: V.aantal,
        beantwoord: V.beantwoord,
        stemming: T.voorvalStemming(S.dorp, dag),
      };
    },
    // Het land (js/land.js): waar de schout is, of hij reist, wat hij zag en welke wegen er zijn. ('open') opent de
    // kaart, ('reis', 'De heide') of ('reis', 'p3') reist erheen, ('alles') laat het hele land zien, ('nieuw') maakt
    // het land opnieuw uit het zaad. Staat de spelregel Land uit, dan zet hij hem eerst aan.
    land(wat, waar) {
      if (!T.LAND_INSTELLINGEN.aan) T.zetOptie('land', 'aan');
      if (!S.land) S.land = T.nieuwLand(S);
      const L = S.land;
      const naam = (p) => T.provincieNaam(S, p);
      const zoek = (x) => L.provincies.find((p) => p.id === x || naam(p).toLowerCase() === String(x).toLowerCase());
      if (wat === 'nieuw') S.land = T.nieuwLand(S);
      if (wat === 'alles') for (const p of L.provincies) L.gezien.add(p.id);
      if (wat === 'open') T.openLand(S);
      if (wat === 'reis') {
        const p = zoek(waar);
        if (!p) return `Er is geen provincie "${waar}".`;
        if (S.modus !== 'land') T.openLand(S);
        const r = T.beginReis(S, p.id);
        if (!r.kan) return r.reden;
      }
      const M = S.land;
      const R = M.reis;
      return {
        waar: naam(T.provincie(M, M.waar)),
        reis: R ? { naar: naam(T.provincie(M, R.route[R.route.length - 1])), nogDagen: Math.round((R.aankomst - S.kalender.dag) * 10) / 10 } : null,
        gezien: M.provincies.filter((p) => M.gezien.has(p.id)).map(naam),
        provincies: M.provincies.map((p) => `${p.id}: ${naam(p)}${M.gezien.has(p.id) ? '' : ' (donker)'}`),
        wegen: M.wegen.map((w) => `${naam(T.provincie(M, w.van))} — ${naam(T.provincie(M, w.naar))}: ${w.dagen} ${w.dagen === 1 ? 'dag' : 'dagen'}`),
        gemist: M.gemist.length,
        brieven: M.brieven.slice(),
      };
    },
    // De raadsman (js/raadsman.js): wie het is en wat hij kan, uit wie je kiest, en wat hij besloot.
    // Spel.debug.raadsman('boer2') of ('Aaltje') maakt die boer raadsman.
    raadsman(wie) {
      if (wie) {
        const p = S.dorp.bewoners && S.dorp.bewoners.mensen.find((x) => x.wie === wie || T.naamVanBewoner(x) === wie);
        if (!p) return `Er is geen boer "${wie}".`;
        const r = T.kiesRaadsman(S.dorp, p);
        if (!r.kan) return r.reden;
      }
      const nu = T.raadsmanVan(S.dorp);
      return {
        raadsman: nu ? T.overRaadsmanTekst(S.dorp, nu) : null,
        kandidaten: T.raadsmanKandidaten(S.dorp).map((p) => T.overRaadsmanTekst(S.dorp, p)),
        besluiten: ((S.dorp.raadsman && S.dorp.raadsman.besluiten) || []).slice(-5).map((b) => `${T.datumVanDag(b.dag).tekst}: ${b.id}, "${b.antwoord}"${b.prijs ? ` (${b.prijs})` : ''}`),
      };
    },
    // Het rapport van de raadsman (js/ochtendrapport.js): wat erin staat, of hij het bracht en of je het las, hoe hij
    // rekent, en wat het dagboek van vandaag al heeft. ('nu') maakt nu een rapport, uit het dagboek van vandaag (hij
    // brengt het niet: het ligt klaar onder de knop Rapport), ('open') opent het papier.
    rapport(wat) {
      const D = S.dorp;
      const p = T.raadsmanVan(D);
      if (wat === 'nu') {
        if (!p) return 'Er is geen raadsman: kies er een met R, of met Spel.debug.raadsman("Aaltje").';
        T.tikOchtendrapportDag(D, Math.floor(S.kalender.dag));
        D.ochtendrapport.gebracht = true;
      }
      if (wat === 'open') T.ui.toonBrief(D, 'rapport');
      const R = D.ochtendrapport;
      return {
        raadsman: p ? T.overRaadsmanTekst(D, p) : null,
        rekenen: p ? T.vaardighedenVan(D, p).rekenen || 'gewoon' : null,
        rapport: R ? { dag: T.datumVanDag(R.dag).tekst, door: R.door, gebracht: R.gebracht, gelezen: R.gelezen, regels: R.regels } : null,
        dagboek: D.dagboek ? D.dagboek.regels.map((r) => `${r.soort}: ${r.wie || r.tekst || r.titel || ''}`) : [],
      };
    },
    // De wetten (js/wetten.js): per wet de stand, en wat hij dan doet. Spel.debug.wetten('rantsoen', 'krap')
    // zet er eerst een, zoals het menu (W) dat doet; de boete voor de houtkap en wat de belasting nog meeneemt,
    // staan erbij.
    wetten(id, stand) {
      if (id) {
        const r = T.zetWet(S.dorp, id, stand);
        if (!r.kan) return r.reden;
      }
      const lijst = T.wettenVanNu(S.dorp).map((w) => {
        const s = T.standVanWet(S.dorp, w);
        return { wet: w, stand: s, doet: T.watDeWetDoet(S.dorp, w, s).map((r) => (r.goed ? '+ ' : '− ') + r.tekst).join(' · ') };
      });
      return { wetten: lijst, boete: T.houtkapBoete(S.dorp), belastingRest: S.dorp.wetten ? S.dorp.wetten.belastingRest : 0 };
    },
    // De erven (js/erven.js): waar ze liggen, en wie er woont of bouwt. Een erf aanwijzen gaat als een
    // gebouw: Spel.debug.bouw('erf', 30, 20).
    // De wensen per huis (js/wensen.js): per huis met mensen zijn stand, wie er woont, hoe tevreden het is, en wat het
    // wil, met ✓ of ✗ (een goed dat maar deels gedekt is, met hoeveel); daarboven het dorp per stand, en wat er gemist
    // wordt. Spel.debug.wensen('dorpelingen') laat alleen die stand zien.
    wensen(stand) {
      const b = T.berekenTevredenheid(S.dorp, Math.floor(S.kalender.dag));
      if (!b.wensen) return `Geen wensen per huis: het dorp rekent als geheel (${Math.round(b.tevredenheid * 100)}%).`;
      const pct = (x) => `${Math.round(x * 100)}%`;
      const wie = (g) => S.dorp.bewoners.mensen.filter((p) => p.huis === g).map((p) => p.naam || T.naamVanMens(p.wie)).join(', ');
      const huizen = (n) => (n === 1 ? 'één huis' : `${n} huizen`);
      return {
        dorp: pct(b.tevredenheid),
        standen: Object.fromEntries(Object.entries(b.wensen.standen).map(([s, x]) => [s, `${pct(x.tevredenheid)}, ${x.mensen} mensen, ${x.alles} van de ${huizen(x.huizen)} heeft alles`])),
        gemist: b.wensen.gemist.map((m) => `${m.naam}: ${huizen(m.huizen)}, ${m.mensen} mensen`),
        huizen: b.wensen.huizen.filter((h) => !stand || h.stand === stand).map((h) => ({
          huis: `${T.GEBOUWEN[h.g.soort].naam} op ${h.g.x},${h.g.y}`, stand: h.stand, wie: wie(h.g), tevreden: pct(h.tevredenheid),
          wil: Object.entries(h.heeft).map(([id, x]) => `${T.WENSEN[id].naam} ${x >= 1 - 1e-9 ? '✓' : x > 0 ? `✗ (${pct(x)})` : '✗'}`).join(' · '),
        })),
      };
    },
    erven() {
      return (S.dorp.erven || []).map((e) => {
        const hut = e.hut;
        const wie = hut && S.dorp.bewoners ? S.dorp.bewoners.mensen.filter((p) => p.huis === hut).map((p) => p.naam) : [];
        const staat = !hut ? 'vrij' : hut.wachtOpHout ? 'wacht op hout' : hut.klaar ? `een ${T.GEBOUWEN[hut.soort].naam}` : `in aanbouw, klaar op dag ${hut.klaarOp}`;
        return { x: e.x, y: e.y, staat, wie: wie.join(', ') };
      });
    },
    // De herberg (js/herberg.js): wie er vanavond gaat, hoe ver ze lopen, gisteravond, en het bier.
    // Spel.debug.herberg(30) zet eerst 30 bier in de voorraad.
    herberg(bier) {
      const g = T.herbergVan(S.dorp);
      if (!g) return 'Hier staat geen herberg.';
      if (typeof bier === 'number') T.zetVoorraad(S.dorp, 'bier', bier);
      const w = S.dorp.bewoners.wereld;
      const deur = T.deurVan(w, g);
      const vanavond = T.herbergGasten(S.dorp, S.kalender.dag).map((p) => ({
        wie: p.wie ? T.naamVanMens(p.wie) : T.overBewonerTekst(S.dorp, p.wezen, p),
        uurLopen: Math.round(T.looptijdVan(w, p, T.deurVan(w, p.huis), { x: deur.x, y: deur.y, straal: 0 }, 'herberg') * 10) / 10,
        staat: p.wezen ? (p.wezen.binnen ? 'binnen' : `${p.wezen.tx},${p.wezen.ty}`) : '-',
      }));
      return { deur: `${deur.x},${deur.y}`, bier: Math.floor(S.dorp.voorraad.bier || 0), vanavond, gisteravond: S.dorp.herberg && S.dorp.herberg.gisteravond, tekst: T.gebouwToestand(S.dorp, g) };
    },
    // De soldaten nu laten zoeken, zoals op Sint-Maarten: staat de heer op het plein, dan op twee of drie
    // plekken, met de schout mee of waar de heer wijst (js/doorzoeken.js); anders, of met ('dorp'), het
    // hele dorp in één keer (js/inner.js), en dan zegt het wat ze vonden.
    zoeken(wat) {
      const b = S.dorp.heer && S.dorp.heer.bezoek;
      if (wat !== 'dorp' && b && b.staat) {
        delete b.zoeken;
        const z = T.beginDoorzoeken(S.dorp);
        return z && { plekken: z.nodig, heerKiest: z.heerKiest, doelen: (z.doelen || []).map((g) => T.verstopPlekVan(S.dorp, g).naam) };
      }
      return T.doorzoekDorp(S.dorp);
    },
    // Opslaan en laden zonder het menu (js/opslaan.js): Spel.debug.opslaan('2') zet het spel op plek 2
    // (zonder plek: 1), Spel.debug.laden('auto') laadt wat er vanzelf bewaard is, en Spel.debug.spellen()
    // zegt wat er op de plekken staat, het nieuwste bovenaan.
    opslaan(plek = '1') {
      const r = T.slaOp(S, String(plek));
      return r.gelukt ? `Opgeslagen op plek ${plek}: ${r.kop.datum}.` : r.reden;
    },
    laden(plek = 'auto') {
      const r = T.laadSpel(String(plek));
      if (r.gelukt && T.ui.titelOpen()) T.ui.sluitTitel(S);
      return r.gelukt ? `Geladen: ${r.kop.datum}.` : r.reden;
    },
    spellen() {
      return T.opgeslagenSpellen().map((s) => `${s.plek}: ${s.kop.naam ? `${s.kop.naam}, ` : ''}${s.kop.datum || '?'}, ${s.kop.bevolking} mensen${s.reden ? ` (${s.reden})` : ''}`);
    },
    // Het slachtvenster nu openen (js/hud.js, T.ui.openSlachten), zonder op 1 slachtmaand te wachten.
    slachten() {
      if (!T.ui.openSlachten) return 'Het slachtvenster is er alleen in het gehucht.';
      T.ui.openSlachten(S.dorp);
      return T.ui.slachtenOpen() ? 'open' : 'Er is geen vee om te slachten.';
    },
    // Vee neerzetten om naar te kijken (js/vee.js): Spel.debug.vee('koe', 4) zet vier koeien op de
    // weide met de meeste plaats (een schaap op de heide, als die er is), elk op een vrije tegel en
    // met een eigen zaad (en dus een eigen kleur en een eigen ritme van grazen, staan en liggen).
    // Daar horen ze bij de kudde: ze blijven binnen de weide, geven melk en werpen jongen, en
    // verhuizen mee bij een wissel. Is die weide vol, dan de volgende; te vol mag, dat is ook iets
    // om naar te kijken (minder melk). Zonder weide, of zonder vrije tegel erop, rond een open plek
    // bij de schout, zoals vóór de weides.
    vee(soort = 'koe', aantal = 1) {
      if (!T.VEE[soort]) return `Dat dier ken ik niet: ${soort}. Er is: ${Object.keys(T.VEE).join(', ')}.`;
      const w = S.wereld;
      const h = S.schout;
      const vrij = (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true });
      const opWeide = [];
      // Een schaap gaat naar de heide als het gehucht er een heeft (js/vee.js, T.graastOp).
      const meent = T.graastOp(w, soort) === 'meent' ? T.meentVan(w) : null;
      const weides = meent ? [meent] : (w.akkers || []).filter((v) => T.bestemmingVan(v) === 'weide');
      while (opWeide.length < aantal && weides.length) {
        weides.sort((a, b) => T.weideStand(S.dorp, b).vrij - T.weideStand(S.dorp, a).vrij);
        const v = weides[0];
        // De vrije tegel die het verst van de andere dieren op deze weide ligt: zo spreidt de kudde.
        const anderen = T.dierenOp(S.dorp, v);
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
        S.dorp.veeZaad = (S.dorp.veeZaad || 0) + 1;
        const e = T.zetOpWeide(T.maakDier(soort, plek.x, plek.y, S.dorp.veeZaad), v);
        w.wezens.push(e);
        opWeide.push(e);
      }
      const opWeideTekst = opWeide.map((e) => `${e.naam} ${e.vel} op ${e.tx},${e.ty}, op ${e.weide.meent ? 'de heide' : `de weide ${e.weide.naam}`}`);
      if (opWeide.length && T.ui.toonVoorraad) T.ui.toonVoorraad(S.dorp); // de melk bij de kaas in de balk
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
            S.dorp.veeZaad = (S.dorp.veeZaad || 0) + 1;
            const e = T.maakDier(soort, x, y, S.dorp.veeZaad);
            w.wezens.push(e);
            dieren.push(e);
            geplaatst.push(e);
          }
        }
      }
      return opWeideTekst.concat(geplaatst.map((e) => `${e.naam} ${e.vel} op ${e.tx},${e.ty}`));
    },
    // Het doek als PNG bewaren: await Spel.debug.schermafdruk('graan-rijp') schrijft
    // gereedschap/pixelart/uit/schermen/graan-rijp.png (via server.cjs; werkt niet vanaf file://).
    // Alleen het doek, dus zonder de html-balken erover. Zo kan een sessie of agent een blik op het
    // spel laten zien zonder de hele afbeelding als tekst door zijn gesprek te halen.
    async schermafdruk(naam) {
      const doek = document.querySelector('canvas');
      const blob = await new Promise((klaar) => doek.toBlob(klaar, 'image/png'));
      const r = await fetch('/gereedschap/api/schermafdruk/' + encodeURIComponent(naam), { method: 'POST', body: blob });
      return r.json();
    },
    // Hoeveel milliseconden kost één beeld? Spel.debug.meet() tekent n beelden achter elkaar en
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
    // fase zegt terwijl je de kaart nog tekent (er zijn nog geen quests: js/quests.js is leeg):
    //   Spel.debug.quest()                   → wat er loopt, en wat er te kiezen valt
    //   Spel.debug.quest('<quest>')          → de fasen van die quest, en waar hij nu staat
    //   Spel.debug.quest('<quest>', '<fase>') → zet hem daar neer
    //   Spel.debug.quest('<quest>', 'uit')    → helemaal terug naar niet begonnen, beloning en al
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
      return { quest: q.naam, fase, doel: f.doel || null, goud: S.dorp.goud, tas: [...S.inventaris] };
    },
    // Naar een ander gebied springen zonder ernaartoe te lopen: Spel.debug.gaNaar('proefbos').
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
  // De pixel art gaat meteen laden; tot hij klaar is tekent het spel zijn vlakken, achter het titelscherm.
  // Een proefje (?kaart=) slaat het titelscherm over.
  T.sprites.laad();
  T.nieuwSpel();
  if (!S.proefje) T.ui.toonTitel(S);
  requestAnimationFrame(lus);
})(globalThis.Spel = globalThis.Spel || {});
