// Opstarten, de spellus en de invoer. Elk beeld: animaties bijwerken, bij het rondlopen de
// monsters laten dwalen en uitkijken, de camera laten meeglijden, en tekenen.
(function (T) {
  'use strict';

  const canvas = document.getElementById('scherm');
  const ctx = canvas.getContext('2d');
  let bw = 0; // de maat waarop getekend wordt (formaat): css-pixels, of minder op een groot scherm
  let bh = 0;
  let cssB = 0; // de maat van het venster in css-pixels
  let cssH = 0;
  let perPunt = 1; // css-pixels per getekende pixel: 1, of 2 op een 4K-scherm zonder schaal
  let zoomVenster = 1; // de zoom die bij het venster hoort (formaat); het wiel zoomt verder uit
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
  // regels er onderweg bij zetten (de heer, het slapen, het einde); alleen de zoom van het scherm
  // blijft. Het begint niet vanzelf: het titelscherm (js/menu.js, vraag 48) laat het erachter wachten, en
  // pas "Nieuw spel" geeft de benoemingsbrief van de heer, waarmee een spel begint sinds Marcel hem op
  // 25 sep koos (T.ui.toonBrief(S.dorp, 'benoeming'), js/brieven.js). Een proefje (?kaart=) begint meteen,
  // zonder brief, en wordt nooit opgeslagen (S.proefje; js/opslaan.js). Het land is dat van de maker uit `makerZaad`
  // (het land dat je bij Nieuw spel koos, js/menu.js; Spel.debug.begin), of een nieuw (T.landVoorNieuwSpel, js/gebied.js),
  // met het lege begin erop.
  T.nieuwSpel = function (makerZaad) {
    for (const k of Object.keys(S)) if (k !== 'zoom') delete S[k];
    S.zoom = zoomVenster; // ook als het vorige spel verder uitgezoomd was
    Object.assign(S, {
      tijd: 0,
      gebieden: {}, // een nieuw spel begint met schone gebieden
      modus: 'verkennen',
      inventaris: new Set(),
      kalender: T.nieuweKalender(), // dag, seizoen, jaar en snelheid (js/tijd.js), voor het spel en al zijn dorpen
      // De dorpen (S.dorpen) en je eigen dorp (S.dorp) komen met de kaart: T.beginOpKaart hieronder (js/dorp.js).
      quests: {}, // per quest de fase waarin hij staat (js/quest.js)
      questWeg: {}, // en hoe je hem oploste, zodat het dorp erop kan reageren
      questBeloond: new Set(),
      bezocht: new Set(['hal']),
      naarGebied: null,
      netGeland: null, // de tegel waar de aanvoerder zojuist is neergezet (js/gebied.js)
      // De spelregels van dit spel (vraag 172, js/opties.js): wat je het laatst koos. Ze gelden meteen, ook voor het land
      // dat hieronder komt (de hoogte), en liggen vast zodra het spel begint (New game, js/menu.js).
      spelregels: T.nieuweSpelregels(),
    }, T.schermVelden()); // wat alleen scherm is (de muis, het bouwmenu): js/opslaan.js
    T.pasSpelregelsToe(S);
    // Een proefje (?kaart=) begint op zijn eigen kaart, zonder brief; lukt dat niet (de kaart
    // bestaat niet), dan valt het terug op het gehucht — een half aangelegde wereld mag nooit het
    // spel breken.
    const proefje = !!BEGIN_KAART && T.beginOpKaart(S, BEGIN_KAART);
    if (!proefje) T.beginOpKaart(S, 'gehucht', makerZaad != null ? makerZaad : T.landVoorNieuwSpel()); // zet S.wereld en S.dorp.aanvoerder
    if (proefje) S.proefje = true;
    zetCameraOpAanvoerder();
    T.ui.reset(S);
  };

  // Bij het begin en na het laden kijkt de camera naar de aanvoerder, of, als die viel en er nog geen ander is, naar het
  // plein.
  function zetCameraOpAanvoerder() {
    const h = S.dorp.aanvoerder || pleinMidden();
    const p = T.naarSchermOp(S.wereld, h.x, h.y);
    S.camera = { x: p.x, y: p.y - 24 };
    S.kijk = { x: S.camera.x, y: S.camera.y };
  }

  // Een bewaard spel laden (js/opslaan.js). Eerst lezen: lukt dat niet, dan blijft het spel zoals het was.
  // Dan een nieuw spel, zodat wat er sinds het bewaren in het spel bij kwam, zijn beginwaarde heeft; het
  // bewaarde erover; en het scherm opnieuw op de aanvoerder. Daarna maakt de lus eerst het land (`laden`, hieronder).
  // Geeft { gelukt, kop } of { gelukt: false, reden }.
  T.laadSpel = function (plek) {
    const gelezen = T.leesVanPlek(plek);
    if (!gelezen.gelukt) return gelezen;
    speelGelezen(gelezen);
    laden = { stappen: T.opwarmStappen(S), gedaan: 0 };
    return { gelukt: true, kop: gelezen.kop };
  };
  // Wat de lus na het laden nog doet voor hij tikt: het land van de open stukken (T.maakOpenStukken, js/wereld.js;
  // `snelheid.md`, F2), en dan wat de tik anders koud uitrekent (`stappen`, T.opwarmStappen in js/tik.js; H4), één per
  // beeld. Alleen scherm: hoe snel het klaar is, verandert niets aan de wereld.
  let laden = null;
  // Een gelezen spel (T.leesSpel, js/opslaan.js) spelen: een nieuw spel, en het gelezene erover.
  // De spelregels van het bewaarde spel (vraag 172, js/opties.js) gelden dan weer, vóór er een stuk land opengaat; een spel
  // van vóór 16 okt heeft er geen, en speelt met wat de browser het laatst koos. (Niet in T.zetSpel: de toetsen herstellen
  // daarmee hun proefdorp, en zetten soms vooraf zelf een getal.)
  function speelGelezen(gelezen) {
    T.nieuwSpel();
    T.zetSpel(S, gelezen);
    T.pasSpelregelsToe(S);
    zetCameraOpAanvoerder();
    T.ui.reset(S);
  }

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
  //
  // De tussenbuffer (werklijst vraag 123, b; Marcel, 4 okt): op een groot scherm tekent het spel op een hele deling
  // ervan, de grootste die nog minstens 1920 bij 1080 is (`T.TEKENEN_INSTELLINGEN.tussenbuffer`), en de browser
  // vergroot dat met die factor. Op 4K is dat 1920 bij 1080 maal twee: een kwart van het tekenwerk, hetzelfde beeld
  // voor pixel art, en hetzelfde stuk land als op 1920 bij 1080. Op 2560 bij 1440 (4K op 150%) is er geen hele
  // deling die groot genoeg blijft, en blijft het zoals het was. Wat er getekend wordt, is bw bij bh; de muis komt in
  // css-pixels binnen, en naarVlak en vanVlak rekenen om (perPunt).
  function formaat() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const tb = T.TEKENEN_INSTELLINGEN.tussenbuffer;
    cssB = window.innerWidth;
    cssH = window.innerHeight;
    const deling = Math.max(1, Math.floor(Math.min((cssB * dpr) / tb.b, (cssH * dpr) / tb.h)));
    const ratio = Math.max(1, Math.floor(dpr / deling)); // wat er van de ratio overblijft (een retina zonder deling)
    bw = Math.round((cssB * dpr) / deling / ratio);
    bh = Math.round((cssH * dpr) / deling / ratio);
    perPunt = cssB / bw;
    canvas.width = bw * ratio;
    canvas.height = bh * ratio;
    canvas.style.width = cssB + 'px';
    canvas.style.height = cssH + 'px';
    const glDoek = glZichtbaar ? T.gl.doek() : null;
    if (glDoek) {
      glDoek.style.width = cssB + 'px';
      glDoek.style.height = cssH + 'px';
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    tekenRatio = ratio;
    if (metVideokaart()) T.gl.zetMaat(canvas.width, canvas.height, ratio);
    // Wie op de zoom van het venster stond, blijft daarop; wie met het wiel verder uitzoomde, blijft op zijn stand.
    const oud = zoomVenster;
    zoomVenster = Math.max(1, Math.min(2, Math.min(bw / 900, bh / 540)));
    if (!S.zoom || Math.abs(S.zoom - oud) < 1e-6 || (S.zoom > zoomVenster && !S.foto)) S.zoom = zoomVenster;
  }

  // Van schermpixels naar de isometrische vlakte waarop getekend wordt, en terug. Precies
  // dezelfde afronding als in tekenScene, anders wijst de muis net naast de tegel.
  const naarVlak = (mx, my) => ({
    x: (mx / perPunt - Math.round(bw / 2)) / S.zoom + Math.round(S.camera.x),
    y: (my / perPunt - Math.round(bh / 2)) / S.zoom + Math.round(S.camera.y),
  });
  const vanVlak = (sx, sy) => ({
    x: ((sx - Math.round(S.camera.x)) * S.zoom + Math.round(bw / 2)) * perPunt,
    y: ((sy - Math.round(S.camera.y)) * S.zoom + Math.round(bh / 2)) * perPunt,
  });
  // De maat waarop getekend wordt (formaat), voor wie zelf een beeld tekent: het gereedschap van het meten.
  T.tekenMaat = () => ({ b: bw, h: bh });

  // Het beeld op het scherm, met de videokaart (js/gl.js, op een doek onder het gewone) of met het 2D-doek, naar de
  // spelregel "Tekenen" (T.TEKENEN_INSTELLINGEN.videokaart; werklijst vraag 123). Kan de browser geen WebGL, of laat
  // de kaart het los, dan zonder.
  let tekenRatio = 1;
  let glZichtbaar = false;
  const metVideokaart = () => T.TEKENEN_INSTELLINGEN.videokaart && T.gl.kan();
  T.tekenBeeld = function () {
    const gl = metVideokaart();
    if (gl !== glZichtbaar) {
      glZichtbaar = gl;
      const doek = T.gl.doek();
      if (doek) {
        if (!doek.parentNode) canvas.parentNode.insertBefore(doek, canvas);
        doek.classList.toggle('verborgen', !gl);
        doek.style.filter = canvas.style.filter; // de helderheid (T.ui.pasBeeldToe, hieronder)
      }
      if (gl) {
        T.gl.zetMaat(canvas.width, canvas.height, tekenRatio);
        doek.style.width = cssB + 'px';
        doek.style.height = cssH + 'px';
      }
    }
    if (!gl) return T.tekenScene(ctx, S, bw, bh);
    // Het gewone doek ligt erboven en blijft leeg: wat er buiten dit beeld op kwam (het meten), gaat eraf.
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    const d = T.gl.begin();
    T.tekenScene(d, S, bw, bh);
    T.gl.klaar();
  };

  // Het beeld zoals het nu op het scherm staat, als één 2D-doek: met de videokaart (js/gl.js) het doek van WebGL met het
  // gewone erover. Het tekent eerst een beeld, want WebGL houdt een beeld niet vast nadat het getoond is. Voor de
  // fotomodus (bewaarFoto) en Spel.debug.schermafdruk.
  function beeldNu() {
    T.tekenBeeld();
    if (!glZichtbaar) return canvas;
    const c = document.createElement('canvas');
    c.width = canvas.width;
    c.height = canvas.height;
    const x = c.getContext('2d');
    x.drawImage(T.gl.doek(), 0, 0);
    x.drawImage(canvas, 0, 0);
    return c;
  }

  // Wat ligt er onder de muis? Wezens en voorwerpen steken boven hun tegel uit, dus die
  // worden eerst gezocht, van voor naar achter. Anders is het de tegel zelf.
  function zoekDoel(mx, my) {
    const w = S.wereld;
    const { x: sx, y: sy } = naarVlak(mx, my);
    const kandidaten = [];
    for (const e of w.wezens) {
      // De aanvoerder is te kiezen, zoals je mannen (js/kiezen.js).
      if (e.dood || e.binnen || !T.isZichtbaar(w, e.tx, e.ty) || !T.zieJeWezen(S, e)) continue;
      const p = T.naarSchermOp(S.wereld, e.x, e.y);
      const hoog = hoogteVan(e);
      if (sx > p.x - 17 && sx < p.x + 17 && sy > p.y - hoog && sy < p.y + 9) {
        kandidaten.push({ d: e.x + e.y + 0.01, wezen: e, x: e.tx, y: e.ty });
      }
    }
    // wat er staat rond de plek onder de muis (ook wat er op het eiland groeit, T.voorwerpenIn); een gebouw steekt ver uit
    const onder = T.naarWereld(sx, sy);
    for (const v of T.voorwerpenIn(w, { x: Math.floor(onder.x) - 12, y: Math.floor(onder.y) - 12, b: 28, h: 28 })) {
      const hoog = voorwerpHoogte(v);
      if (!hoog || !T.isZichtbaar(w, v.x, v.y) || !T.kentTegel(S.dorp, v.x, v.y)) continue; // niet in het zwart (js/mist.js)
      const p = T.naarSchermOp(S.wereld, v.x, v.y);
      if (sx > p.x - 20 && sx < p.x + 20 && sy > p.y - hoog && sy < p.y + 10) {
        kandidaten.push({ d: v.x + v.y, voorwerp: v, x: v.x, y: v.y });
      }
    }
    if (kandidaten.length) {
      kandidaten.sort((a, b) => b.d - a.d);
      return kandidaten[0];
    }
    const f = T.naarWereldOp(S.wereld, sx, sy);
    const x = Math.round(f.x);
    const y = Math.round(f.y);
    if (!T.opKaart(w, x, y)) return null;
    return { x, y };
  }

  // De muis wordt elk beeld opnieuw bekeken, want onder een stilstaande muis kan intussen
  // een monster doorlopen. Tekst bij de muis, pad op de vloer en de actiepunten zeggen
  // alle drie wat een klik zou doen.
  // Wat er bij de muis staat: wat een klik doet en wat het aan punten kost. Alles uit hetzelfde
  // antwoord, zodat het scherm niet iets anders belooft dan de klik.
  function tipTekst(h) {
    let t = h.tekst;
    if (h.kosten) t = T.t('{tekst} · {kosten} AP', { tekst: t, kosten: h.kosten });
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
    const f = T.naarWereldOp(S.wereld, sx, sy);
    const x = Math.round(f.x);
    const y = Math.round(f.y);
    if (S.bouwSoort === 'weg') {
      werkWegHoverBij(x, y);
      return;
    }
    if (S.bouwSoort === 'afbreken') {
      werkAfbreekHoverBij(x, y);
      return;
    }
    if (T.isVeldSoort(S.bouwSoort)) {
      werkVeldHoverBij(x, y);
      return;
    }
    // Past hij niet, dan zegt de muis waarom (op het plein wordt niet gebouwd), net als de klik. In het lege begin rooien
    // de bouwers eerst wat er op de plek staat (js/bouwen.js): dezelfde kavel als bij de klik (T.plaatsGebouw).
    const kavel = T.bouwKavel(S.dorp, S.bouwSoort, x, y);
    const reden = T.waaromPastHetNiet(S.dorp, S.bouwSoort, x, y, null, kavel);
    S.bouwHover = { x, y, ok: !reden, reden };
    canvas.style.cursor = 'crosshair';
    // Wat de bouwers er eerst rooien (js/bouwen.js).
    const tekst = !reden && kavel && T.teRooienOp(S.dorp, kavel).length ? T.t('The builders first clear {wat}.', { wat: T.rooiWoordenOp(S.dorp, kavel) }) : null;
    if (reden) T.ui.tooltip(reden, S.muis.x, S.muis.y, true);
    else if (tekst) T.ui.tooltip(tekst, S.muis.x, S.muis.y);
    else T.ui.verbergTooltip();
    S.hover = null;
    S.handeling = null;
  }

  // Een veld in de hand (een akker of een wijngaard, js/boerderij.js; vraag 152, 1e): je trekt een rechthoek met twee
  // klikken, de ene hoek en dan de andere (slepen schuift het beeld). Tot de eerste klik wijst de muis één tegel aan; daarna
  // de rechthoek van die hoek (S.veldHoek, alleen scherm) tot de muis, met wat de klik zou zeggen (T.waaromPastVeldNiet).
  function werkVeldHoverBij(x, y) {
    const hoek = S.veldHoek && S.veldHoek.soort === S.bouwSoort ? S.veldHoek : null;
    const r = hoek ? T.veldRechthoek(hoek, { x, y }) : { x, y, b: 1, h: 1 };
    const reden = hoek ? T.waaromPastVeldNiet(S.dorp, S.bouwSoort, r) : null;
    S.bouwHover = { x: r.x, y: r.y, ok: !reden, reden, veld: r, hoek: !!hoek };
    canvas.style.cursor = 'crosshair';
    const veld = T.GEBOUWEN[S.bouwSoort].naam;
    if (reden) T.ui.tooltip(reden, S.muis.x, S.muis.y, true);
    else if (!hoek) T.ui.tooltip(T.t('Click one corner of the {veld}, then the other.', { veld }), S.muis.x, S.muis.y);
    else {
      const rooien = T.teRooienOp(S.dorp, r).length ? ' ' + T.t('The builders first clear {wat}.', { wat: T.rooiWoordenOp(S.dorp, r) }) : '';
      T.ui.tooltip(T.t('{n} tiles: click to lay the {veld} here.', { n: r.b * r.h, veld }) + rooien, S.muis.x, S.muis.y);
    }
    S.hover = null;
    S.handeling = null;
  }

  // Een weg in de hand (js/wegen.js; werklijst C, stap 5): twee klikken, het begin en het eind, zoals een veld. Tot de eerste
  // klik wijst de muis één tegel aan; daarna de weg van het begin tot de muis (T.planWeg, recht en haaks), met wat de klik
  // zou zeggen. Het plan rekent hij alleen opnieuw als de muis naar een andere tegel ging of de kaart veranderde.
  let wegPlan = null; // { sleutel, plan }: alleen scherm
  function werkWegHoverBij(x, y) {
    const begin = S.veldHoek && S.veldHoek.soort === 'weg' ? S.veldHoek : null;
    let plan = null;
    if (begin) {
      const sleutel = `${begin.x},${begin.y}>${x},${y}|${T.kaartVersie(S.dorp.wereld)}|${(S.dorp.wegwerk || []).length}`;
      if (!wegPlan || wegPlan.sleutel !== sleutel) wegPlan = { sleutel, plan: T.planWeg(S.dorp, begin, { x, y }) };
      plan = wegPlan.plan;
    }
    const reden = plan ? plan.reden : T.waaromGeenWegOp(S.dorp, x, y);
    S.bouwHover = { x, y, ok: !reden, reden, plekken: plan && plan.plekken.length ? plan.plekken : [{ x, y }], hoek: !!begin };
    canvas.style.cursor = 'crosshair';
    if (reden) T.ui.tooltip(reden, S.muis.x, S.muis.y, true);
    else if (!plan) T.ui.tooltip(T.t('Click where the road begins, then where it ends.'), S.muis.x, S.muis.y);
    else {
      const rooien = plan.rooien.length ? ' ' + T.t('The builders first clear {wat}.', { wat: T.rooiWoordenVanWeg(S.dorp, plan.rooien) }) : '';
      T.ui.tooltip(T.t('{n|One tile|# tiles}, {werk} workdays: click to lay the road here.', { n: plan.nieuw.length, werk: plan.werk }) + rooien, S.muis.x, S.muis.y);
    }
    S.hover = null;
    S.handeling = null;
  }

  // De klik met een weg in de hand: de eerste zet het begin, de tweede geeft de opdracht de weg te leggen (T.legWeg, bij de
  // volgende tik: js/tik.js). De muis vroeg al hetzelfde (T.planWeg). Daarna blijft de weg in de hand, met zijn eind als het
  // begin van het volgende stuk: zo leg je een weg met een bocht in een paar klikken, en een rechtsklik houdt op.
  function klikMetWeg(hover) {
    if (!hover) return;
    if (!hover.ok) {
      T.ui.bericht(hover.reden, 'gevaar');
      return;
    }
    if (hover.hoek) T.geefOpdracht(S, { soort: 'weg', van: { x: S.veldHoek.x, y: S.veldHoek.y }, tot: { x: hover.x, y: hover.y } });
    S.veldHoek = { soort: 'weg', x: hover.x, y: hover.y };
  }

  // Afbreken in de hand (js/afbreken.js; werklijst C, stap 5, e): de muis zegt wat een klik hier afbreekt, of waarom niet
  // (T.handelingAfbreken), en de klik doet hetzelfde.
  function werkAfbreekHoverBij(x, y) {
    const h = T.handelingAfbreken(S.dorp, x, y);
    S.bouwHover = { x, y, ok: !!(h && h.kan), reden: h && !h.kan ? h.tekst : null, afbreken: h };
    canvas.style.cursor = 'crosshair';
    if (!h) T.ui.tooltip(T.t('Click a road or a building to demolish it.'), S.muis.x, S.muis.y);
    else T.ui.tooltip(h.tekst, S.muis.x, S.muis.y, !h.kan);
    S.hover = null;
    S.handeling = null;
  }
  function klikMetAfbreken(hover) {
    const h = hover && hover.afbreken;
    if (!h) return;
    if (!h.kan) {
      T.ui.bericht(h.tekst, 'gevaar');
      return;
    }
    // De opdracht stelt bij de tik dezelfde vraag (js/tik.js). Afbreken blijft in de hand: een rechtsklik houdt op.
    T.geefOpdracht(S, { soort: 'afbreken', x: hover.x, y: hover.y });
  }

  // De klik met een veld in de hand: de eerste zet de ene hoek, de tweede geeft de opdracht het veld te leggen (T.legVeld,
  // bij de volgende tik: js/tik.js). De muis vroeg al hetzelfde (T.waaromPastVeldNiet). Past het niet, dan blijft de eerste
  // hoek liggen, zodat je de andere kunt verzetten.
  function klikMetVeld(soort, hover) {
    if (!hover) return;
    if (!hover.hoek) {
      S.veldHoek = { soort, x: hover.x, y: hover.y };
      return;
    }
    if (!hover.ok) {
      T.ui.bericht(hover.reden, 'gevaar');
      return;
    }
    const v = hover.veld;
    T.geefOpdracht(S, { soort: 'veld', veld: soort, rechthoek: { x: v.x, y: v.y, b: v.b, h: v.h } });
    S.bouwSoort = null;
    S.veldHoek = null;
  }

  // Het briefje bij een huis (js/huisbriefje.js; 2c, werklijst vraag 100): staat de muis op een huis met mensen in je eigen
  // dorp, dan hangt het naast zijn deur.
  function werkHuisbriefjeBij() {
    const D = S.modus === 'verkennen' && S.hover && T.dorpHier(S);
    const g = D === S.dorp && T.gebouwOp(D, S.hover.x, S.hover.y);
    if (!g || !T.huisToestand(D, g)) {
      T.ui.verbergHuisbriefje();
      return;
    }
    const deur = T.deurVan(S.wereld, g);
    const p = T.naarSchermOp(S.wereld, deur.x, deur.y);
    const c = vanVlak(p.x, p.y);
    T.ui.toonHuisbriefje(S, g, c.x, c.y);
  }

  function werkHoverBij() {
    if (S.bouwSoort) {
      T.ui.verbergHuisbriefje();
      werkBouwHoverBij();
      return;
    }
    if (!S.muis || S.modus !== 'verkennen') {
      S.hover = null;
      S.handeling = null;
      T.ui.verbergTooltip();
      T.ui.verbergHuisbriefje();
      canvas.style.cursor = 'default';
      return;
    }
    S.hover = zoekDoel(S.muis.x, S.muis.y);
    const h = T.handelingVerkennen(S, S.hover);
    S.handeling = h;
    // Met je mannen gekozen: wat rechts doet (js/kiezen.js). Bij de muis staat dat, behalve boven wat links te kiezen
    // is (een man, een dorpeling, een gebouw): daar zegt de muis wie of wat het is.
    const r = T.handelingSturen(S, S.hover, T.gekozenMannen(S));
    S.sturen = r;
    const tip = r && !(h && (h.kies || h.doe)) ? r : h;
    if (tip && tip.tekst) T.ui.tooltip(tipTekst(tip), S.muis.x, S.muis.y, !!tip.fout || tip.kan === false);
    else T.ui.verbergTooltip();
    canvas.style.cursor = h || (r && r.kan) ? 'pointer' : 'default';
    werkHuisbriefjeBij();
  }

  // De camera (werklijst vraag 170, stap 1; Marcel, 15 okt: "we gaan toch als 'god' sturen en bouwen"): hij volgt de
  // aanvoerder niet meer, maar kijkt waar jij kijkt (S.kijk, alleen scherm: T.schermVelden in js/opslaan.js). De pijltjes
  // en de muis tegen de rand van het scherm schuiven hem (Marcel: "Muis tegen de zijkant van het scherm bewegen, beweegt
  // het beeld in die richting"; T.KIEZEN_INSTELLINGEN.camera in js/kiezen.js), de minikaart zet hem ergens neer
  // (T.kijkNaar), het wiel zoomt, en Tab kijkt naar de held. Tot 15 okt volgde hij de aanvoerder, en tilde Tab hem eraf in het
  // overzicht (vraag 108, a); tot stap 2 keek het gevecht in beurten nog zelf mee.
  // Het midden van het plein, in tegels; zonder plein (een proefkaart) de aanvoerder, of de hoek van de kaart.
  function pleinMidden() {
    const rand = S.dorp && S.dorp.plek ? S.dorp.plek.plein : null;
    if (rand && rand.length) return { x: rand.reduce((n, [x]) => n + x, 0) / rand.length, y: rand.reduce((n, [, y]) => n + y, 0) / rand.length };
    const h = S.dorp.aanvoerder;
    return h ? { x: h.x, y: h.y } : { x: 0, y: 0 };
  }
  // Achter het titelscherm glijdt de camera langzaam rond het plein (vraag 48 C): een rondje in twee
  // minuten, op de klok van het scherm, want de wereld staat daar stil. Sinds vraag 172 staat links de tekst van het
  // titelscherm (js/menu.js), dus ligt het plein een stuk rechts van het midden (CAMERA.titelOpzij, een deel van de breedte).
  function titelCamera() {
    const m = pleinMidden();
    const hoek = (S.tijd / 120) * 2 * Math.PI;
    const p = T.naarSchermOp(S.wereld, m.x + 4 * Math.cos(hoek), m.y + 4 * Math.sin(hoek));
    return { x: p.x - (CAMERA.titelOpzij * bw) / S.zoom, y: p.y - 24 };
  }
  T.titelCamera = titelCamera;

  // Waar de camera heen glijdt: waar jij kijkt (S.kijk). Een gevecht trekt hem niet mee: het bericht brengt je erheen
  // (js/ui.js, en Spatie).
  const cameraDoel = () => S.kijk || S.camera;

  const CAMERA = {
    zoom: [0.5, 0.35], // verder uit met het wiel (dichterbij gaat tot de zoom van het venster)
    sleepVanaf: 6, // in de fotomodus: zoveel pixels moet de muis bewegen voor het slepen is in plaats van een klik
    titelOpzij: 0.16, // achter het titelscherm ligt het plein zoveel van de breedte rechts van het midden (js/menu.js)
  };
  // De fotomodus (werklijst vraag 146, e; Marcel, 1 okt: een "goed idee voor de Steam pagina", en 10 okt: `H`, met een
  // regel in het menu, `Enter` bewaart een plaatje, en zoomen tot twee keer dichterbij). H haalt alles van het beeld: de
  // html erover (body.foto in stijl.css) en wat op het doek ui is (S.foto in js/tekenen.js). De camera schuift zoals
  // altijd, en ook met slepen, want een klik doet hier niets; het wiel zoomt tot twee keer dichterbij. Het spel loopt
  // door (P zet het stil), en wat je nodig hebt (een venster, een brief, een gesprek) haalt je eruit. H of Esc
  // brengt je terug, op de zoom van daarvoor. Alleen scherm: S.foto staat in T.schermVelden (js/opslaan.js).
  const FOTO = {
    zoom: [2, 1.5, 1, 0.75, 0.5], // maal de zoom van het venster; verder uit tot de standen van het wiel (CAMERA.zoom)
  };
  const zoomStanden = () =>
    S.foto
      ? [...new Set([...FOTO.zoom.map((z) => z * zoomVenster), ...CAMERA.zoom])].sort((a, b) => b - a)
      : [zoomVenster, ...CAMERA.zoom];
  const fotoKan = () =>
    S.modus === 'verkennen' && !T.ui.vensterOpen() && !T.ui.briefOpen() && !T.ui.titelOpen() && !T.ui.menuOpen();
  function zetFoto(aan = !S.foto) {
    if (aan === !!S.foto || (aan && !fotoKan())) return false;
    if (aan) {
      S.bouwSoort = null; // een gebouw dat nog aan de muis hing, ligt weer weg, zoals bij het menu
      S.bouwMenuOpen = false;
      T.ui.toonBouwmenu(S);
      S.foto = { zoom: S.zoom };
    } else {
      S.zoom = S.foto.zoom;
      S.foto = null;
    }
    document.body.classList.toggle('foto', aan);
    if (aan) fotoWenk(T.t('Photo mode · drag or arrows to look · wheel to zoom · [Enter] saves a picture · [H] or [Esc] to return'));
    else document.getElementById('foto-wenk').classList.remove('flits');
    return true;
  }
  T.zetFoto = zetFoto;
  // Het briefje onderaan dat even blijft staan en wegvaagt (zoals "Opgeslagen", js/menu.js). Het ligt over het doek, dus
  // in een plaatje dat Enter bewaart, staat het niet.
  function fotoWenk(tekst) {
    const el = document.getElementById('foto-wenk');
    el.innerHTML = tekst.replace(/\[([^\]]+)\]/g, '<kbd>$1</kbd>'); // [H] wordt een toets, zoals in de raad (js/ui.js)
    el.classList.remove('flits');
    void el.offsetWidth; // zo begint het vagen opnieuw
    el.classList.add('flits');
  }
  // Het beeld als PNG, op de maat van het scherm: het spel tekent op een deling ervan (formaat), dus op 4K wordt elke
  // getekende pixel er twee bij twee, zoals je hem ziet. In de browser gaat het naar Downloads; de versie voor Windows
  // zet het in de map Afbeeldingen (gereedschap/proefversie/maak.cjs).
  function bewaarFoto() {
    const doek = beeldNu();
    const n = Math.max(1, Math.round((cssB * (window.devicePixelRatio || 1)) / doek.width));
    const c = document.createElement('canvas');
    c.width = doek.width * n;
    c.height = doek.height * n;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(doek, 0, 0, c.width, c.height);
    const nu = new Date();
    const twee = (g) => String(g).padStart(2, '0');
    const naam =
      `${T.NAAM} ${nu.getFullYear()}-${twee(nu.getMonth() + 1)}-${twee(nu.getDate())} ` +
      `${twee(nu.getHours())}.${twee(nu.getMinutes())}.${twee(nu.getSeconds())}.png`;
    c.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = naam;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      fotoWenk(T.t('Picture saved: {naam}', { naam }));
    }, 'image/png'); // geen tekst
  }
  // Houd de camera boven de kaart: het punt waar hij naar kijkt (24 pixels boven een tegel, zoals zetCameraOpAanvoerder),
  // op een tegel binnen T.kaartGrens (op het eiland het hele eiland).
  function begrens(k) {
    if (!S.wereld) return k;
    const g = T.kaartGrens(S.wereld);
    const t = T.naarWereld(k.x, k.y + 24);
    const x = Math.max(g.x, Math.min(g.x + g.b - 1, t.x));
    const y = Math.max(g.y, Math.min(g.y + g.h - 1, t.y));
    if (x === t.x && y === t.y) return k;
    const p = T.naarScherm(x, y);
    return { x: p.x, y: p.y - 24 };
  }
  // Kijk naar een plek (in pixels van de wereld, zoals S.camera), meteen: de minikaart (js/balk.js; vraag 165).
  T.kijkNaar = function (x, y) {
    S.kijk = begrens({ x, y });
    S.camera.x = S.kijk.x;
    S.camera.y = S.kijk.y;
  };
  // Glij naar een tegel (Tab naar de held, een groep, een bericht met een plek).
  function glijNaar(x, y) {
    const p = T.naarSchermOp(S.wereld, x, y);
    S.kijk = begrens({ x: p.x, y: p.y - 24 });
  }
  T.glijNaar = glijNaar;
  // Het beeld schuiven, in getekende pixels: wat je duwt of sleept, meteen, zonder na te glijden.
  function schuif(dx, dy) {
    const k = S.kijk || S.camera;
    S.kijk = begrens({ x: k.x + dx / S.zoom, y: k.y + dy / S.zoom });
    S.camera.x = S.kijk.x;
    S.camera.y = S.kijk.y;
  }
  // Een stand verder uit (+1) of dichterbij (-1), met het wiel: de eerste stand voorbij de zoom van nu (die na de
  // fotomodus ook een stand van de foto kan zijn).
  function zoom(richting) {
    const z = zoomStanden();
    const nu = S.zoom;
    const volgende = richting > 0 ? z.find((s) => s < nu - 1e-6) : z.filter((s) => s > nu + 1e-6).pop();
    if (volgende != null) S.zoom = volgende;
  }
  const SCHUIF = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  // De pijltjes die je ingedrukt houdt, en waar de muis in het venster is (ook boven de balken, die over het doek
  // liggen): elk beeld schuift de camera zolang je duwt (schuifBij). Alleen scherm.
  const pijlen = new Set();
  let randMuis = null;
  window.addEventListener('keydown', (ev) => {
    if (SCHUIF[ev.key]) pijlen.add(ev.key);
  });
  window.addEventListener('keyup', (ev) => pijlen.delete(ev.key));
  window.addEventListener('blur', () => {
    pijlen.clear();
    randMuis = null;
  });
  window.addEventListener('mousemove', (ev) => {
    randMuis = { x: ev.clientX, y: ev.clientY };
  });
  document.documentElement.addEventListener('mouseleave', () => {
    randMuis = null;
  });
  // Elk beeld: de pijltjes en de muis tegen de rand schuiven het beeld, even snel in elke richting en op elke zoom. Bij
  // het rondlopen en in de fotomodus, niet achter een venster, een brief of het titelscherm.
  function schuifBij(dt) {
    if (!(S.modus === 'verkennen' || S.foto) || T.ui.vensterOpen() || T.ui.briefOpen() || T.ui.titelOpen() || T.ui.menuOpen()) return;
    const IN = T.KIEZEN_INSTELLINGEN.camera;
    let dx = 0;
    let dy = 0;
    for (const k of pijlen) {
      dx += SCHUIF[k][0];
      dy += SCHUIF[k][1];
    }
    if (IN.rand > 0 && randMuis) {
      if (randMuis.x <= IN.rand) dx--;
      else if (randMuis.x >= cssB - 1 - IN.rand) dx++;
      if (randMuis.y <= IN.rand) dy--;
      else if (randMuis.y >= cssH - 1 - IN.rand) dy++;
    }
    dx = Math.sign(dx);
    dy = Math.sign(dy);
    if (!dx && !dy) return;
    const v = (IN.snelheid * dt) / Math.hypot(dx, dy);
    schuif(dx * v, dy * v);
  }
  let slepen = null; // { x, y, bewogen }: de muis ging omlaag in de fotomodus

  // ── Kiezen (werklijst vraag 170, stap 1; js/kiezen.js) ──
  // Links kiest een man (met Shift erbij of eraf), een dubbelklik alle van zijn soort in beeld, en slepen met links trekt
  // een kader om je mannen. Wat je koos, staat in S.gekozen (alleen scherm): één wezen, of een lijst van je mannen.
  let kader = null; // { x0, y0, x, y, bewogen }: de muis ging omlaag om een kader te trekken
  let netGekaderd = false; // de klik die na het kader komt, is geen klik
  function kiesMannen(lijst, erbij, wissel) {
    let nu = erbij ? T.gekozenMannen(S) : [];
    for (const e of lijst) {
      if (!nu.includes(e)) nu.push(e);
      else if (wissel) nu = nu.filter((m) => m !== e);
    }
    S.gekozen = nu.length === 0 ? null : nu.length === 1 ? nu[0] : nu;
  }
  // Waar een man staat op het scherm (in css-pixels): zijn lijf, zo'n 16 pixels boven zijn tegel.
  function opScherm(e) {
    const p = T.naarSchermOp(S.wereld, e.x, e.y);
    return vanVlak(p.x, p.y - 16);
  }
  const mannenInBeeld = () =>
    T.mannenVan(S.dorp).filter((e) => {
      if (e.binnen || !T.isZichtbaar(S.wereld, e.tx, e.ty)) return false;
      const p = opScherm(e);
      return p.x >= 0 && p.y >= 0 && p.x <= cssB && p.y <= cssH;
    });
  function kiesWezen(e, erbij, dubbel) {
    if (!T.isMan(S.dorp, e)) {
      S.gekozen = e; // een dorpeling: zijn briefje, alleen hij
      return;
    }
    if (dubbel) {
      const soort = T.soortVanMan(S.dorp, e);
      kiesMannen(mannenInBeeld().filter((m) => T.soortVanMan(S.dorp, m) === soort), erbij, false);
    } else kiesMannen([e], erbij, erbij);
  }
  function kiesInKader(k, erbij) {
    if (!S.dorp || S.dorp.wereld !== S.wereld) return; // je eigen mannen, ook bij een ander dorp op de kaart
    const [x0, x1] = [Math.min(k.x0, k.x), Math.max(k.x0, k.x)];
    const [y0, y1] = [Math.min(k.y0, k.y), Math.max(k.y0, k.y)];
    const binnen = mannenInBeeld().filter((e) => {
      const p = opScherm(e);
      return p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1;
    });
    kiesMannen(binnen, erbij, false);
  }
  function toonKader(k) {
    let el = document.getElementById('kader');
    if (!el) {
      el = document.createElement('div');
      el.id = 'kader'; // geen tekst
      document.body.appendChild(el);
    }
    el.classList.toggle('verborgen', !k);
    if (!k) return;
    Object.assign(el.style, {
      left: Math.min(k.x0, k.x) + 'px',
      top: Math.min(k.y0, k.y) + 'px',
      width: Math.abs(k.x - k.x0) + 'px',
      height: Math.abs(k.y - k.y0) + 'px',
    });
  }
  // De groepen (stap 1d): Ctrl of Shift met een cijfer maakt een groep van wie je koos, een cijfer kiest hem, en twee keer
  // vlak na elkaar kijkt de camera naar hem. Alleen scherm: elke speler zijn eigen groepen (S.groepen, T.schermVelden).
  const GROEP = { dubbel: 400 }; // ms tussen twee keer hetzelfde cijfer, om ernaar te kijken
  let vorigeGroep = { n: 0, op: -Infinity };
  function groep(n, maak) {
    if (maak) {
      const m = T.gekozenMannen(S);
      if (m.length) S.groepen[n] = m.slice();
      else delete S.groepen[n];
      if (m.length) T.ui.bericht(T.t('Group {n}: {aantal|one man|# men}', { n, aantal: m.length }), 'rust');
      return;
    }
    const m = (S.groepen[n] || []).filter((e) => T.isMan(S.dorp, e));
    if (!m.length) return;
    kiesMannen(m, false, false);
    const nu = performance.now();
    if (vorigeGroep.n === n && nu - vorigeGroep.op < GROEP.dubbel) {
      glijNaar(m.reduce((s, e) => s + e.x, 0) / m.length, m.reduce((s, e) => s + e.y, 0) / m.length);
    }
    vorigeGroep = { n, op: nu };
  }
  // Tab: de held kiezen en naar hem kijken (is er geen, omdat hij viel, dan niets).
  function naarDeHeld() {
    const h = S.dorp.aanvoerder;
    if (!T.isMan(S.dorp, h)) return;
    S.gekozen = h;
    glijNaar(h.x, h.y);
  }

  // De raad onder het doel (js/raad.js) rekent met de groei en de winter, en dat hoeft niet elk beeld: om de halve
  // seconde is genoeg. Hij verandert niets, en is alleen scherm, dus hij staat niet in S.
  const RAAD_ELKE = 0.5;
  let raadNu = null;
  let raadOp = -Infinity;
  // Wat er nog niet getikt is (js/tik.js, T.tikBij): alleen scherm, want elke computer heeft zijn eigen beelden.
  const klok = { rest: 0 };

  function werkBij(dt) {
    // Een resize-gebeurtenis komt niet altijd (een tabblad dat verborgen opstartte, heeft
    // eerst geen maat), dus kijkt de lus zelf of het venster veranderd is.
    if (window.innerWidth !== cssB || window.innerHeight !== cssH) formaat();
    // De wereld tikt in vaste stappen (js/tik.js; werklijst vraag 170, stap 0): zo vaak als er tijd verstreek, los van
    // hoeveel beelden deze computer tekent. Wat hieronder staat, is alleen scherm, en volgt elk beeld.
    T.tikBij(S, klok, dt);
    S.wind = T.windWaarde(S.tijd);
    // Elke ochtend vanzelf opslaan (js/opslaan.js, vraag 48 A); js/menu.js zegt het in de hoek. Niet in de tik: wat deze
    // computer bewaart, en wanneer (er staat misschien een venster open), is van hem alleen.
    const bewaard = T.werkOpslaanBij(S);
    if (bewaard) T.ui.opgeslagen(bewaard);
    T.werkEffectenBij(S, dt); // de zwevende teksten, en wie in een beurt op een animatie wacht (js/anim.js)
    // Het vak linksboven is van de quest die je het eerst aannam; zonder quest staat er het doel van het gehucht: een
    // dorp worden (js/treden.js). Daaronder de raad: wat nu tussen jou en een dorp staat (js/raad.js).
    const doelNu = T.questDoel(S) || T.tredeDoel(S.dorp);
    if (!(S.tijd - raadOp < RAAD_ELKE) || S.tijd < raadOp) {
      raadNu = T.raadNu(S.dorp);
      raadOp = S.tijd;
    }
    T.ui.opdracht(doelNu && doelNu.tekst, doelNu && doelNu.kop, raadNu && raadNu.tekst, doelNu && doelNu.deel);
    // In een gevecht (js/gevecht.js) kleuren de randen van het beeld een fractie rood (js/tekenen.js).
    const hier = T.dorpHier(S);
    S.gevechtGloed += ((hier && hier.gevecht ? 1 : 0) - S.gevechtGloed) * Math.min(1, dt * 5);
    // Wat je nodig hebt (een venster, een brief, een gesprek), haalt je uit de fotomodus.
    if (S.foto && !fotoKan()) zetFoto(false);
    schuifBij(dt);
    const doel = T.ui.titelOpen() ? titelCamera() : cameraDoel();
    const k = 1 - Math.exp(-dt * 5);
    S.camera.x += (doel.x - S.camera.x) * k;
    S.camera.y += (doel.y - S.camera.y) * k;
    werkHoverBij();
    T.ui.werkGebouwbriefjeBij(S); // het briefje van het gekozen gebouw (js/huisbriefje.js)
    T.ui.werkMinikaartBij(S); // de minikaart in de hoek (js/balk.js)
  }

  let vorige = 0;
  let getekend = 0; // het laatste beeld dat de grens van Settings toeliet (hieronder)
  function lus(nu) {
    // Na het laden eerst het land, een paar stukken per beeld, en dan de stappen, met de voortgang in het menu
    // (js/menu.js): zolang tikt de wereld niet en tekent het beeld niet, want anders deed de eerste tik het allemaal tegelijk.
    if (laden) {
      const r = T.maakOpenStukken(S.wereld);
      if (r.klaar === r.open && laden.gedaan < laden.stappen.length) laden.stappen[laden.gedaan++]();
      const voortgang = { klaar: r.klaar + laden.gedaan, open: r.open + laden.stappen.length };
      if (voortgang.klaar >= voortgang.open) laden = null;
      T.ui.landLaadt(S, voortgang);
      vorige = nu;
      requestAnimationFrame(lus);
      return;
    }
    // Frame rate (Settings, vraag 172b): staat er een grens, dan slaat de lus een beeld van het scherm over tot het zijn
    // beurt is, in de maat van de grens (ook op een scherm van 144 Hz). De wereld loopt hetzelfde: dt telt vanaf het
    // vorige beeld dat er wel was.
    const per = T.TEKENEN_INSTELLINGEN.beeldenPerSeconde;
    if (per) {
      const tussen = 1000 / per;
      if (nu - getekend < tussen - 1) {
        requestAnimationFrame(lus);
        return;
      }
      getekend = nu - ((nu - getekend) % tussen);
    }
    const dt = vorige ? Math.min(0.05, (nu - vorige) / 1000) : 0;
    vorige = nu;
    const t0 = performance.now();
    werkBij(dt);
    const t1 = performance.now();
    T.tekenBeeld();
    if (meter) meetBeeld(nu, t1 - t0, performance.now() - t1);
    requestAnimationFrame(lus);
  }

  // De meter (F2, of Spel.debug.meter()): hoeveel beelden per seconde, en per beeld hoe lang de regels en het tekenen
  // duren, met het traagste beeld van de laatste seconden. Zo zie je op je eigen machine waar het hapert (Marcel, 3 okt:
  // "Als de performance slecht is, hebben we niks"). Alleen scherm: niet in S, en hij meet pas als hij aan staat.
  let meter = null;
  function wisselMeter(aan = !meter) {
    let el = document.getElementById('meter');
    if (!el) {
      el = document.createElement('div');
      el.id = 'meter';
      el.className = 'paneel verborgen'; // geen tekst
      document.body.appendChild(el);
    }
    meter = aan ? { sinds: performance.now(), beelden: 0, regels: 0, tekenen: 0, traagst: 0 } : null;
    el.classList.toggle('verborgen', !aan);
    return aan;
  }

  // Wat van Settings hier woont (vraag 172b; js/instellingen.js): de meter, en de helderheid van de wereld, als filter op
  // het doek en dat van de videokaart (tekenBeeld, hierboven), niet op de vensters erboven. Bij het begin, en na elke
  // keuze in Settings.
  T.ui.pasBeeldToe = function () {
    const I = T.TEKENEN_INSTELLINGEN;
    if (!!meter !== I.meter) wisselMeter(I.meter);
    canvas.style.filter = I.helderheid === 1 ? '' : `brightness(${I.helderheid})`;
    const doek = glZichtbaar ? T.gl.doek() : null; // niet de videokaart opstarten als hij uit staat
    if (doek) doek.style.filter = canvas.style.filter;
  };

  // Pauze als je wegklikt (vraag 172b; T.TIJD_INSTELLINGEN.pauzeAlsWeg, Settings): zolang je in een ander venster bent,
  // staat de tijd stil, onder de reden 'weg' (js/tijd.js); terug is verder.
  window.addEventListener('blur', () => {
    if (T.TIJD_INSTELLINGEN.pauzeAlsWeg && S.kalender) T.houdTijdStil(S, 'weg');
  });
  window.addEventListener('focus', () => {
    if (S.kalender) T.laatTijdGaan(S, 'weg');
  });
  function meetBeeld(nu, regels, tekenen) {
    const m = meter;
    if (m.vorig != null) m.traagst = Math.max(m.traagst, nu - m.vorig);
    m.vorig = nu;
    m.beelden++;
    m.regels += regels;
    m.tekenen += tekenen;
    const duur = performance.now() - m.sinds;
    if (duur < 1000) return;
    const ms = (x) => (Math.round(x * 10) / 10).toLocaleString(T.taalLocale());
    document.getElementById('meter').textContent = T.t('{fps} frames/s · rules {regels} ms · drawing {tekenen} ms · slowest frame {traagst} ms · {kaart}', {
      fps: Math.round((m.beelden * 1000) / duur),
      regels: ms(m.regels / m.beelden),
      tekenen: ms(m.tekenen / m.beelden),
      traagst: ms(m.traagst),
      kaart: glZichtbaar ? T.t('with the graphics card') : T.t('without the graphics card'),
    });
    Object.assign(m, { sinds: performance.now(), beelden: 0, regels: 0, tekenen: 0, traagst: 0 });
  }

  canvas.addEventListener('mousedown', (ev) => {
    slepen = ev.button === 0 && S.foto ? { x: ev.clientX, y: ev.clientY, bewogen: false } : null;
    netGekaderd = false;
    kader = ev.button === 0 && !S.foto && !S.bouwSoort && S.modus === 'verkennen' ? { x0: ev.clientX, y0: ev.clientY, x: ev.clientX, y: ev.clientY, bewogen: false } : null;
  });
  window.addEventListener('mousemove', (ev) => {
    if (!kader) return;
    if (!(ev.buttons & 1)) {
      kader = null;
      toonKader(null);
      return;
    }
    kader.x = ev.clientX;
    kader.y = ev.clientY;
    if (!kader.bewogen && Math.hypot(kader.x - kader.x0, kader.y - kader.y0) >= CAMERA.sleepVanaf) kader.bewogen = true;
    if (kader.bewogen) toonKader(kader);
  });
  window.addEventListener('mouseup', (ev) => {
    if (!kader || ev.button !== 0) return;
    if (kader.bewogen) {
      kiesInKader(kader, ev.shiftKey);
      netGekaderd = true;
    }
    kader = null;
    toonKader(null);
  });
  canvas.addEventListener('mousemove', (ev) => {
    S.muis = { x: ev.clientX, y: ev.clientY };
    // Slepen in de fotomodus schuift het beeld (pas na een paar pixels: anders is het een klik).
    if (!slepen || !S.foto) return;
    if (!(ev.buttons & 1)) {
      slepen = null;
      return;
    }
    const dx = ev.clientX - slepen.x;
    const dy = ev.clientY - slepen.y;
    if (!slepen.bewogen && Math.hypot(dx, dy) < CAMERA.sleepVanaf) return;
    slepen.bewogen = true;
    schuif(-dx / perPunt, -dy / perPunt);
    slepen.x = ev.clientX;
    slepen.y = ev.clientY;
  });
  canvas.addEventListener('wheel', (ev) => {
    if (S.modus !== 'verkennen') return;
    ev.preventDefault();
    zoom(ev.deltaY > 0 ? 1 : -1);
  }, { passive: false });
  canvas.addEventListener('mouseleave', () => {
    S.muis = null;
  });
  canvas.addEventListener('click', (ev) => {
    S.muis = { x: ev.clientX, y: ev.clientY };
    // Na het slepen (de fotomodus) of een kader is het loslaten geen klik.
    const gesleept = (slepen && slepen.bewogen) || netGekaderd;
    slepen = null;
    netGekaderd = false;
    if (gesleept) return;
    if (S.foto) return; // in de fotomodus doet een klik niets
    werkHoverBij();
    if (S.bouwSoort) {
      const soort = S.bouwSoort;
      const hover = S.bouwHover;
      if (soort === 'weg') {
        klikMetWeg(hover);
        return;
      }
      if (soort === 'afbreken') {
        klikMetAfbreken(hover);
        return;
      }
      if (T.isVeldSoort(soort)) {
        klikMetVeld(soort, hover);
        return;
      }
      if (!hover || !hover.ok) {
        T.ui.bericht((hover && hover.reden) || T.t('It does not fit there.'), 'gevaar');
        return;
      }
      // De opdracht gaat in bij de volgende tik (js/tik.js); wat er gebeurde, zegt de regel (T.plaatsGebouw).
      T.geefOpdracht(S, { soort: 'bouw', gebouw: soort, x: hover.x, y: hover.y });
      S.bouwSoort = null;
      return;
    }
    // Links kiest (js/verkennen.js, js/kiezen.js): een man of een dorpeling, met zijn briefje, of een gebouw
    // (js/gebouwbriefje.js). Een klik ergens anders legt het briefje weg, behalve met Shift.
    const h = S.handeling;
    if (S.modus === 'verkennen' && h && h.kies) {
      kiesWezen(h.kies, ev.shiftKey, ev.detail >= 2);
      return;
    }
    if (!(S.modus === 'verkennen' && ev.shiftKey)) S.gekozen = null;
    if (!h || !h.doe || h.kan === false) return;
    h.doe();
  });
  canvas.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    // Met een veld of een weg in de hand haalt de eerste rechtsklik zijn eerste hoek (of het begin) weg.
    if (S.bouwSoort && S.veldHoek) S.veldHoek = null;
    else if (S.bouwSoort) S.bouwSoort = null;
    else if (S.modus === 'verkennen' && !S.foto) {
      // Rechts stuurt je gekozen mannen (js/kiezen.js): erheen, of een vijand achterna. De opdracht gaat in bij de
      // volgende tik (js/tik.js).
      S.muis = { x: ev.clientX, y: ev.clientY };
      werkHoverBij();
      const r = S.sturen;
      if (r && r.kan && r.doe) {
        r.doe();
        // Erheen: hun plekken in hun vorm, even in groen op de grond (vraag 170, stap 3, E1; js/tekenen.js).
        if (r.opdracht.soort === 'stuur') {
          const { plekken } = T.formatiePlekken(S.dorp, T.gekozenMannen(S), r.opdracht.naar);
          S.stuurPlekken = { plekken: plekken.map((p) => ({ x: p.x, y: p.y })), tot: S.tijd + T.KIEZEN_INSTELLINGEN.formatie.groen };
        }
      } else if (r && r.tekst) T.ui.bericht(r.tekst, 'gevaar');
    }
  });
  window.addEventListener('keydown', (ev) => {
    // F2: de meter (hierboven), altijd, ook als er een venster openstaat; hij is ook een instelling (Settings, The meter).
    if (ev.key === 'F2') {
      ev.preventDefault();
      T.zetOptie('meter', meter ? 'uit' : 'aan', S);
      T.ui.pasBeeldToe();
      return;
    }
    // Een venster (js/ui.js; de marskramer, de heer, het slachten, de spelregels, de velden, de wetten): zolang het open is, ligt de rest stil. Esc sluit het, en de toets van een ander venster of B gaat er
    // meteen heen (hieronder); wat precies, zegt T.ui.toetsBijVenster.
    if (T.ui.toetsBijVenster(S, ev)) return;
    if (S.modus === 'einde') return;
    // De fotomodus (hierboven): alleen zijn eigen toetsen. H of Esc is terug, Enter bewaart een plaatje, de pijltjes
    // kijken. De rest van het spel doet niets; P en de snelheden (js/hud.js) werken wel.
    if (S.foto) {
      if (ev.key === 'h' || ev.key === 'H' || ev.key === 'Escape') zetFoto(false);
      else if (ev.key === 'Enter') bewaarFoto();
      if (ev.key === 'Tab' || ev.key === 'Enter' || SCHUIF[ev.key]) ev.preventDefault();
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
    if (S.modus !== 'verkennen') return;
    // Tab: kies de held (de aanvoerder) en kijk naar hem. Tot 15 okt was het het overzicht (vraag 108, a).
    if (ev.key === 'Tab') {
      ev.preventDefault();
      naarDeHeld();
      return;
    }
    // H: de fotomodus (hierboven).
    if (ev.key === 'h' || ev.key === 'H') {
      zetFoto(true);
      return;
    }
    // De pijltjes schuiven het beeld zolang je ze indrukt (schuifBij), niet de bladzijde.
    if (SCHUIF[ev.key]) {
      ev.preventDefault();
      return;
    }
    // O, V en W: de spelregels, de velden en de wetten (de toets staat bij het venster, js/ui.js),
    // alleen in het nieuwe spel.
    const venster = T.NIEUWE_HUD && T.ui.vensterMetToets(ev.key);
    if (venster) {
      T.ui.wisselVenster(S, venster);
      return;
    }
    // B: het bouwmenu (js/hud.js), net zo — botst nergens mee (CLAUDE.md, "Toetsen"). Nog eens B, Esc of rechtsklik
    // legt een gebouw weer weg.
    if (T.NIEUWE_HUD && (ev.key === 'b' || ev.key === 'B')) {
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
      } else if (S.gekozen) {
        S.gekozen = null; // het briefje van een gebouw (js/gebouwbriefje.js)
      } else {
        T.ui.openMenu(S); // is er niets anders om weg te leggen: het menu (js/menu.js, vraag 48 D)
      }
      return;
    }
    // 1 tot 9: de groepen (hierboven); Ctrl of Shift erbij maakt er een (in de browser neemt Chrome Ctrl+1 zelf).
    const cijfer = /^Digit([1-9])$/.exec(ev.code || '');
    if (cijfer) {
      ev.preventDefault();
      groep(Number(cijfer[1]), ev.ctrlKey || ev.metaKey || ev.shiftKey);
      return;
    }
    // Spatie: kijk naar het laatste bericht met een plek (js/ui.js).
    if (ev.key === ' ') {
      ev.preventDefault();
      T.ui.naarBericht(S);
      return;
    }
  });
  window.addEventListener('resize', formaat);

  // Voor het testen.
  T.debug = {
    // Spel.debug.vlakken = true tekent weer met vlakken in plaats van met de pixel art,
    // om te vergelijken en om te zien of er niets verdwenen is.
    vlakken: false,
    // Waar staat tegel (x, y) nu op het scherm, in css-pixels? Voor echte klikken.
    naarBeeld(x, y) {
      const p = T.naarSchermOp(S.wereld, x, y);
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
    // De paadjes en de lantaarns (js/paden.js; werklijst vraag 108, b en d): hoeveel tegels paadje zijn (van de deuren, en
    // gesleten), waar het meest gelopen wordt, en de lantaarns. ('nacht') doet nu wat de nacht doet: slijten en
    // lantaarns zetten.
    paden(wat) {
      const D = S.dorp;
      const w = D.wereld;
      if (wat === 'nacht') T.tikPadenDag(D);
      const net = T.aangelegdNet(D);
      const P = w.paden || { slijt: {}, gesleten: new Set() };
      const tegel = (k) => {
        const t = T.tegelVanNummer(k);
        return `${t.x},${t.y}`;
      };
      return {
        spelregel: T.PADEN_INSTELLINGEN.paadjes,
        vanDeDeuren: net.filter((v) => v === 2).length,
        gesleten: P.gesleten.size,
        meestGelopen: Object.entries(P.slijt).sort((a, c) => c[1] - a[1]).slice(0, 8).map(([k, n]) => `${tegel(Number(k))}: ${n} per dag`), // geen tekst
        lantaarns: w.voorwerpen.filter((v) => v.soort === 'lantaarn').map((v) => `${v.x},${v.y}${v.vanHetDorp ? '' : ' (kaart)'}`),
      };
    },
    // Lopen tussen anderen (js/lopen.js; werklijst vraag 119): wie er nu onderweg is met een doel, wie daarvan staat te
    // wachten en op wie, en hoeveel wegen en velden de kaart onthoudt.
    lopen() {
      const w = S.wereld;
      const naam = (e) => {
        const p = e.bewoner;
        return p ? T.naamVanBewoner(p) : e.wie || e.soort;
      };
      const wachten = w.wezens
        .filter((e) => e.padDoel && e.pad.length && !e.onderweg && e.gewacht > 0)
        .map((e) => {
          const ander = T.wezenOp(w, e.pad[0].x, e.pad[0].y, e);
          return `${naam(e)} op ${e.tx},${e.ty} wacht ${Math.round(e.gewacht * 10) / 10} s${ander ? ` op ${naam(ander)}` : ''}`; // geen tekst
        });
      return {
        onderweg: w.wezens.filter((e) => e.padDoel && e.pad.length).length,
        wachten,
        onthouden: T.onthoudenVan(w),
      };
    },
    // De boeren op hun land (js/veldwerk.js; werklijst vraag 111): per boer zijn werk van vandaag, wat hij nu doet en
    // waar, hoe ver hij is, hoeveel bosrand hij heeft om te sprokkelen, en wie hem helpt.
    veldwerk() {
      const D = T.dorpHier(S);
      if (!D || !D.kalender) return 'Veldwerk is er alleen in een dorp.'; // geen tekst
      const w = S.wereld;
      const datum = T.datumVanDag(D.kalender.dag);
      const naam = (e) => {
        const p = T.bewonerVan(D, e);
        return p ? T.naamVanBewoner(p) : e.wie || e.soort;
      };
      const nu = (e) => {
        if (e.maait) return `maait op ${e.maait.x},${e.maait.y}`; // geen tekst
        const wt = e.werkt;
        if (wt) return `${wt.soort}${wt.tot == null ? ', op weg' : wt.rust ? ', staat even' : ''} op ${wt.x},${wt.y}`; // geen tekst
        return e.draagt ? 'brengt hout naar huis' : 'niet op zijn land'; // geen tekst
      };
      const boeren = w.wezens.filter((e) => !e.dood && e.werkAkkers && e.werkAkkers.length).map((e) => ({
        boer: naam(e),
        vandaag: T.veldwerkVandaag(D, e, datum) || 'bij zijn boerderij (of de oogst)', // geen tekst
        nu: nu(e),
        waar: `${e.tx},${e.ty}`,
        gedaan: e.veldwerk ? `${e.veldwerk.gedaan} tegels ${e.veldwerk.soort}` : '',
        klaar: e.veldwerk ? e.veldwerk.klaar : {},
        bosrand: (T.bosrandBij(D, e) || []).length,
        helpers: w.wezens.filter((h) => {
          const a = T.helpAnker(D, h);
          return a && a.x === e.tx && a.y === e.ty;
        }).map(naam).join(', '),
        // De dagloners van zijn boerderij (vraag 140), met wat ze nu doen.
        dagloners: (D.bewoners ? D.bewoners.mensen : []).filter((p) => p.dagloner && p.dagloner === (T.bewonerVan(D, e) || {}).huis && p.wezen)
          .map((p) => `${p.naam}: ${p.wezen.draagt === 'schoof' ? 'draagt schoven naar de schuur' : nu(p.wezen)}`).join('; '), // geen tekst
      }));
      return { datum: `${datum.dagVanMaand} ${T.MAANDEN[datum.maand].naam}, ${T.uurTekst(D.kalender.dag)}`, boeren };
    },
    // De beesten in het bos (js/beesten.js; werklijst vraag 116): per groep de soort, hoeveel dieren, waar de leider is en
    // wat de groep wil (thuis, aan de rand, of weg van iemand), zijn hol en zijn plekken aan de rand, en of hij nu wegrent.
    // ('hier'): de aanvoerder staat nu tien tegels van de dichtste groep, net buiten wat ze schuw maakt, om ze te bekijken.
    // ('opnieuw'): de groepen opnieuw, uit het zaad van het land. ('jongen'): elke groep krijgt nu jongen, en wie groot
    // wordt, splitst. ('jacht'): elke roedel jaagt nu op de herten, alsof het winter is en hij honger heeft. ('honger'):
    // elke roedel heeft nu zoveel honger dat hij in het donker naar het dorp komt (zet er de avond bij met
    // Spel.debug.uur(21)). ('schaap'): de eerste roedel neemt nu het dichtste schaap, en de herder zegt het morgen.
    beesten(wat) {
      const D = T.dorpHier(S);
      if (!D || !D.kalender) return 'De beesten zijn er alleen bij een dorp.'; // geen tekst
      if (wat === 'opnieuw') {
        // het wild is van de wereld: opnieuw in elk open stuk van de kaart (js/beesten.js)
        S.wereld.wezens = S.wereld.wezens.filter((e) => !e.beest);
        for (const v of S.wereld.voorwerpen.filter((x) => x.soort === 'hol')) T.haalVoorwerpWeg(S.wereld, v);
        S.wereld.wildStukken = new Set();
        T.zetWildBij(S, S.wereld);
      }
      if (wat === 'jongen' || wat === 'jacht') T.tikBeestenDag(S, D.wereld, Math.floor(D.kalender.dag), { [wat]: true });
      const roedels = T.beestenVan(D).filter(({ G }) => G.soort === 'wolf');
      if (wat === 'honger') for (const { G } of roedels) G.honger = T.BEESTEN_INSTELLINGEN.dreiging.stout;
      if (wat === 'schaap' && roedels.length) {
        const { G, leden } = roedels[0];
        const l = leden.find((e) => e.leider) || leden[0];
        const schapen = S.wereld.wezens.filter((e) => e.dier === 'schaap' && !e.dood);
        const schaap = schapen.sort((a, b) => T.afstand(T.tegelVan(a), T.tegelVan(l)) - T.afstand(T.tegelVan(b), T.tegelVan(l)))[0];
        if (schaap) T.wolvenSlaanToe(S, G, l, { e: schaap, soort: 'schaap' });
      }
      const h = T.tegelVan(S.dorp.aanvoerder);
      const groepen = T.beestenVan(D);
      if (wat === 'hier' && groepen.length) {
        const dichtst = groepen.reduce((a, b) => (T.afstand(T.tegelVan(b.leden[0]), h) < T.afstand(T.tegelVan(a.leden[0]), h) ? b : a));
        const lt = T.tegelVan(dichtst.leden[0]);
        let plek = null;
        for (let r = 10; r <= 16 && !plek; r++) {
          for (let dy = -r; dy <= r && !plek; dy++) {
            for (let dx = -r; dx <= r && !plek; dx++) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) === r && T.isBegaanbaar(S.wereld, lt.x + dx, lt.y + dy, { wezensBlokkeren: true })) plek = { x: lt.x + dx, y: lt.y + dy };
            }
          }
        }
        if (plek) Object.assign(S.dorp.aanvoerder, { x: plek.x, y: plek.y, tx: plek.x, ty: plek.y, pad: [], onderweg: false });
      }
      const nu = T.uurTekst(D.kalender.dag);
      return {
        aan: T.BEESTEN_INSTELLINGEN.aan, uur: nu,
        status: T.wolvenBijHetDorp(D, D.kalender.dag),
        groepen: groepen.map(({ G, leden }) => {
          const l = leden.find((e) => e.leider) || leden[0];
          const lt = T.tegelVan(l);
          return {
            soort: `${leden.length} ${T.BEESTEN[G.soort][leden.length === 1 ? 'naam' : 'meervoud']}`,
            leider: `${lt.x},${lt.y}${l.pad.length ? ` (loopt, nog ${l.pad.length})` : ` (${l.rust})`}, ${T.afstand(lt, T.tegelVan(S.dorp.aanvoerder))} tegels van de aanvoerder`, // geen tekst
            wil: G.weg > D.kalender.dag ? `weg van iemand, naar ${G.vluchtNaar.x},${G.vluchtNaar.y}` : G.doel === 'prooi' ? 'prooi' : T.beestenWillen(S, G), // geen tekst
            thuis: `${G.thuis.x},${G.thuis.y}`,
            rand: G.rand.map((p) => `${p.x},${p.y}`).join(' '),
            rent: leden.some((e) => e.rent),
            ...(G.soort === 'wolf' ? {
              honger: `${(G.honger || 0).toFixed(1)} (jaagt vanaf ${T.BEESTEN_INSTELLINGEN.honger.jagenVanaf}, stout vanaf ${T.BEESTEN_INSTELLINGEN.dreiging.stout})`, // geen tekst
              gevangen: G.gevangen || 0,
              stout: T.wolvenStout(S, G),
              ...(G.prooi ? { prooi: `${G.prooi.soort === 'schaap' ? 'een schaap' : G.prooi.soort === 'aanvoerder' ? 'de aanvoerder' : T.naamVanBewoner(T.bewonerVan(G.prooi.e.dorp, G.prooi.e))}` } : {}), // geen tekst
            } : {}),
            jongen: G.jongenJaar ? `in ${G.jongenJaar}` : 'nog niet', // geen tekst
            ...(G.trektWeg ? { trektWeg: true } : {}),
          };
        }),
        // De jagers (stap 3a): waar hij op jaagt, wat hij schoot, en of hij herten vindt.
        jagers: D.gebouwen.filter((g) => g.soort === 'jager' && g.klaar).map((g) => {
          T.wildVanJager(D, g);
          return {
            hut: `${g.x},${g.y}`,
            jaagt: g.wild === undefined ? 'zijn vlees komt uit het niets (geen beesten)' : `${g.wild ? `op ${g.wild.soort === 'wolf' ? 'de roedel' : 'de herten'} bij ${g.wild.x},${g.wild.y}` : 'geen groep'}${g.zonderHerten ? ', en hij vindt geen hert: alleen klein wild' : ''}`, // geen tekst
            vlees: `${(g.gejaagd || 0).toFixed(1)} van ${T.BEESTEN_INSTELLINGEN.jager.perDier} voor het volgende hert`, // geen tekst
            schoot: g.gevangen || {},
            handen: g.handen,
          };
        }),
        jagerBijDeWolven: T.jagerBijDeWolven(D),
      };
    },
    // Het bos (js/bos.js; werklijst vraag 115): per houthakker zijn boom (en of die in het bos staat, dan plant hij er een
    // boompje naast), hoeveel hout hij er al uit hakte, hoeveel bomen, jonge bomen en boompjes er binnen zijn bereik staan,
    // of hij stilstaat, en wat zijn hand nu doet; en op de kaart de boompjes, de jonge bomen en de stronken die vergaan.
    // ('hak'): elke houthakker hakt zijn boom nu om. ('groei'): elk boompje wordt nu een jonge boom, en elke jonge boom een
    // boom.
    bos(wat) {
      const D = T.dorpHier(S);
      if (!D || !D.kalender) return 'Het bos is er alleen bij een dorp.'; // geen tekst
      const w = S.wereld;
      const B = T.BOS_INSTELLINGEN;
      const hakkers = (D.gebouwen || []).filter((g) => g.klaar && T.GEBOUWEN[g.soort].bos);
      if (wat === 'hak') for (const g of hakkers) if (T.boomVanHouthakker(D, g)) T.houthakkerHakte(D, g, B.houtPerBoom - (g.gehakt || 0));
      if (wat === 'groei') {
        for (const v of w.voorwerpen) if (v.geplant != null) v.geplant -= 2 * (B.boompjeDagen + B.jongeBoomDagen);
        T.tikBosDag(D);
      }
      const telBij = (g) => {
        const f = T.voetVanGebouw(g);
        const uit = { bomen: 0, jongeBomen: 0, boompjes: 0, stronken: 0 };
        for (let y = f.y - B.hakStraal; y < f.y + f.h + B.hakStraal; y++) {
          for (let x = f.x - B.hakStraal; x < f.x + f.b + B.hakStraal; x++) {
            const v = T.voorwerpOp(w, x, y);
            if (!v) continue;
            if (T.NATUUR.bos.telt(w, x, y, v)) uit.bomen++;
            else if (v.soort === 'boompje') uit.boompjes++;
            else if (v.geplant != null) uit.jongeBomen++;
            else if (v.soort === 'boomstronk') uit.stronken++;
          }
        }
        return uit;
      };
      const dag = Math.floor(D.kalender.dag);
      return {
        houthakkers: hakkers.map((g) => {
          const p = D.bewoners && D.bewoners.mensen.find((q) => q.werk === g);
          const e = p && p.wezen;
          const boom = g.boom && T.voorwerpOp(w, g.boom.x, g.boom.y);
          return {
            waar: `${g.x},${g.y}`,
            boom: g.boom ? `${boom ? boom.soort : '?'} op ${g.boom.x},${g.boom.y}${T.isBos(w, g.boom.x, g.boom.y) ? ', in het bos' : ', in de wei'}` : g.boom === null ? 'geen' : 'nog niet gekozen', // geen tekst
            gehakt: `${Math.round((g.gehakt || 0) * 10) / 10} van ${B.houtPerBoom} hout`, // geen tekst
            stil: g.stilWant || null,
            binnenBereik: telBij(g),
            hand: e ? `${T.naamVanBewoner(p)}: ${e.werkt ? `${e.werkt.soort}${e.werkt.tot == null ? ', op weg' : ''} op ${e.werkt.x},${e.werkt.y}` : e.draagt ? 'brengt een bundel naar de schuur' : 'niet aan het hakken'}` : 'niemand', // geen tekst
          };
        }),
        boompjes: w.voorwerpen.filter((v) => v.soort === 'boompje').length,
        jongeBomen: w.voorwerpen.filter((v) => v.geplant != null && v.soort !== 'boompje').length,
        stronken: w.voorwerpen.filter((v) => v.gehaktOp != null).map((v) => `${v.x},${v.y} vergaat op dag ${v.gehaktOp + B.stronkDagen}`).slice(0, 12), // geen tekst
        vandaag: dag,
      };
    },
    // Wie er een praatje maakt (js/praatje.js; werklijst vraag 120): per groepje wie erin staan (en wie nog komt), waar
    // en tot hoe laat, en hoeveel er nu vrij zijn. ('nu'): de twee vrije bekenden die het dichtst bij elkaar staan,
    // beginnen nu een praatje (staan ze verder dan zes tegels uit elkaar, dan zegt het dat).
    praatjes(wat) {
      const D = T.dorpHier(S);
      if (!D || !D.kalender) return 'Praatjes zijn er alleen in een dorp.'; // geen tekst
      const w = S.wereld;
      const dag = D.kalender.dag;
      const deel = T.dagdeelVan(dag, T.isOogstDag(dag));
      const naam = (e) => {
        const p = T.bewonerVan(D, e);
        return p ? T.naamVanBewoner(p) : e.naam || e.soort;
      };
      const vrij = w.wezens.filter((e) => T.kanPraten(S, D, e, deel));
      if (wat === 'nu') {
        const stil = vrij.filter((e) => !e.praatje && !e.onderweg && !e.pad.length);
        let beste = null;
        for (const e of stil) {
          for (const b of stil) {
            if (e === b || !T.kentElkaar(D, T.bewonerVan(D, e), T.bewonerVan(D, b))) continue;
            const a = T.afstand({ x: e.tx, y: e.ty }, { x: b.tx, y: b.ty });
            if (!beste || a < beste.a) beste = { e, b, a };
          }
        }
        if (!beste) return `Er staan nu geen twee vrije bekenden stil (${deel}, ${vrij.length} vrij).`; // geen tekst
        if (beste.a > 6) return `De dichtste twee vrije bekenden, ${naam(beste.e)} en ${naam(beste.b)}, staan ${beste.a} tegels uit elkaar.`; // geen tekst
        if (!T.beginPraatje(D, beste.e, beste.b)) return `${naam(beste.e)} kan niet bij ${naam(beste.b)} komen.`; // geen tekst
      }
      const groepjes = [...T.praatjesOp(w)].map(([g, leden]) => ({
        wie: leden.map((e) => naam(e) + (T.staatErbij(e) ? '' : ' (komt)')).join(', '),
        waar: `${g.plek.x},${g.plek.y}${T.opHetPlein(w, g.plek.x, g.plek.y) ? ' (op het plein)' : ''}`, // geen tekst
        tot: T.uurTekst(g.tot),
      }));
      return { deel, vrij: vrij.length, groepjes };
    },
    // Wie er woont (js/bewoners.js): per bewoner wie hij is, zijn huis, zijn werk, waar hij staat en
    // waar hij nu hoort. Spel.debug.bewoners('herder') zoekt in de tekst, zodat je er één vindt.
    bewoners(zoek) {
      if (!S.dorp.bewoners) return 'Er wonen hier geen bewoners.'; // geen tekst
      const lijst = S.dorp.bewoners.mensen.map((p) => {
        const e = p.wezen;
        const a = e && T.dagAnker(S.dorp, e);
        return {
          wie: p.aanvoerder ? 'de aanvoerder' : p.wie ? `${T.naamVanMens(p.wie)}${T.isBoer(S.dorp, p) ? ' (boer)' : ''}` : T.overBewonerTekst(S.dorp, e, p), // geen tekst
          leeftijd: p.leeftijd, huis: p.huis ? p.huis.huis || `${p.huis.soort} ${p.huis.x},${p.huis.y}` : '-',
          werk: p.werk ? `${p.werk.soort} ${p.werk.x},${p.werk.y}` : '-',
          staat: e ? (e.binnen ? 'binnen' : `${e.tx},${e.ty}`) : p.komt ? 'onderweg hierheen' : '-', // geen tekst
          hoort: a ? `${a.x},${a.y} (${a.binnen ? 'binnen' : 'straal ' + a.straal})` : '-',
        };
      });
      return zoek ? lijst.filter((r) => JSON.stringify(r).includes(zoek)) : lijst;
    },
    // Een nieuw gezin laten komen, zonder op een groeidag te wachten: het komt overdag over de weg
    // (js/bewoners.js). Is het dorp vol, dan zegt het dat er geen plaats is, zoals op een groeidag.
    // Spel.debug.gezin(-4) laat er een wegtrekken, zoals als het dorp ontevreden is.
    gezin(n = 4) {
      if (!S.dorp.bewoners) return 'Er wonen hier geen bewoners.'; // geen tekst
      const plaats = n < 0 ? n : Math.max(0, Math.min(n, (S.dorp.woonruimte || 0) - S.dorp.bevolking));
      if (plaats === 0) return 'Er is geen plaats: bouw eerst een hut of een huis.'; // geen tekst
      const echt = plaats < 0 ? T.wijzigBevolking(S.dorp, plaats, 'vertrek', 'het dorp is niet tevreden genoeg') : T.wijzigBevolking(S.dorp, plaats, 'groei'); // geen tekst
      T.ui.toonBevolking(S.dorp);
      return echt < 0 ? `${-echt} trekken weg.` : `${echt} komen over de weg, overdag vanaf ${T.DAG_INSTELLINGEN.bezoekUur} uur.`; // geen tekst
    },
    // De trede (js/treden.js): hoe ver het gehucht is met een dorp worden. Spel.debug.trede('dorp') maakt er nu
    // een dorp van, met de brief van de heer, zonder dat de eis gehaald is.
    trede(naar) {
      if (naar) T.wordtTrede(S.dorp, naar);
      const doel = T.tredeDoel(S.dorp);
      return { trede: S.dorp.trede, doel: doel ? `${doel.kop}: ${doel.tekst}` : 'geen volgende trede' }; // geen tekst
    },
    // Je dorp op het eiland (js/eiland.js, vraag 117, stap 2): Spel.debug.eiland(5) begint nu een nieuw spel op het eiland
    // van nummer 5, zonder brief; zonder nummer zegt het waar je dorp op het eiland ligt, wat voor plek het is, en waar
    // de wegen je land verlaten.
    eiland(zaad) {
      if (zaad != null) T.nieuwSpel(Number(zaad));
      const w = S.gebieden && S.gebieden.gehucht;
      if (!w || !w.eiland) return 'Dit gehucht ligt niet op het eiland (een proefje, of een oud spel).'; // geen tekst
      const E = T.eilandVan(w.eiland.zaad);
      const dorp = E.plekken.find((p) => p.naam === S.dorp.plek.naam);
      return {
        eiland: w.eiland.zaad,
        dorp: S.dorp.plek.naam,
        plek: dorp ? dorp.aard : null,
        hoek: [w.eiland.x0, w.eiland.y0],
        uitgang: w.overgangen ? w.overgangen.map((o) => [o.x, o.y]) : null,
      };
    },
    // Het proefdorp (T.proefdorp, js/begin.js; ronde 2 van het snoeien, stap 6): Spel.debug.proefdorp(5) speelt het dorp
    // waarop de toetsen spelen, op het eiland van nummer 5 (zonder nummer 2), met de opties van T.proefdorp.maak erbij
    // (Spel.debug.proefdorp(2, { gebouwen: ['herberg'] })). Het wordt stil gebouwd en dan geladen zoals een bewaard spel;
    // de schermafdrukken, de tekenmeting en de samenvatting spelen erop.
    proefdorp(zaad = 2, opties = {}) {
      const gelezen = T.leesSpel(T.bewaarSpel(T.proefdorp.maak({ ...opties, zaad: Number(zaad) }), { nu: 0 }));
      if (!gelezen.gelukt) return gelezen.reden;
      speelGelezen(gelezen);
      const D = S.dorp;
      return `Het proefdorp op het eiland van ${zaad}: ${D.gebouwen.length} gebouwen, ${D.bevolking} mensen.`; // geen tekst
    },
    // De ossenkar (js/kar.js; werklijst C): wat hij doet en wat hij draagt, en wat er op de stapels ligt.
    kar() {
      const D = S.dorp;
      const karren = T.karrenVan(D);
      if (!karren.length) return 'Er rijdt nog geen kar: het kamp staat nog niet, of dit spel begon niet leeg.'; // geen tekst
      return {
        karren: karren.map((e) => ({
          tegel: [e.tx, e.ty], doet: T.karTekst(D, e), lading: e.lading,
          rit: e.rit && { fase: e.rit.fase, naar: e.rit.naar && e.rit.naar.soort, klaarOm: T.uurTekst(e.rit.tot) },
        })),
        stapels: T.stapelsOp(D).map((s) => ({ gebouw: s.g.soort, tegel: [s.x, s.y], wat: s.wat, hoeveel: Math.round(s.hoeveel * 10) / 10 })),
      };
    },
    // Het lege begin (js/begin.js, vraag 152): Spel.debug.begin(5) begint een nieuw spel op het eiland van nummer 5,
    // zonder brief (Spel.debug.begin('nieuw') op een nieuw eiland). Zonder iets zegt het hoe het kamp ervoor staat: waar de
    // kar is, wie er woont, en tot wanneer de heer niets vraagt.
    begin(zaad) {
      if (zaad != null) T.nieuwSpel(zaad === 'nieuw' ? undefined : Number(zaad));
      const D = S.dorp;
      const B = D && D.begin;
      if (!B) return 'Dit spel begon niet leeg (een proefje, of een oud spel van vóór 12 okt).'; // geen tekst
      return {
        kamp: B.kamp,
        kar: { tegel: [B.kar.tx, B.kar.ty], naar: [D.plek.kamp.kar.x, D.plek.kamp.kar.y], nogTegels: B.kar.pad.length },
        aanvoerderLooptMee: B.volgt,
        gezinnenOnderweg: B.gezinnen ? D.bewoners.mensen.filter((p) => p.komt).length : 'wachten op de kar', // geen tekst
        tenten: D.gebouwen.filter((g) => g.soort === 'tent').map((g) => {
          const wie = D.bewoners.mensen.filter((p) => p.huis === g);
          return `${g.tent.vorm} bij (${g.tent.x}, ${g.tent.y}): ${g.huis === 'aanvoerder' ? 'de aanvoerder en zijn gezin' : wie.map((p) => p.naam).join(', ')}`; // geen tekst
        }),
        vuur: T.kampvuurStand(D),
        heerVraagtNiets: `tot ${T.datumVanDag(B.heerVrijTot).tekst}`,
      };
    },
    // De hoogte van het land (js/hoogte.js, vraag 121): of deze kaart hoogte heeft, hoe hoog het hoogste punt is en
    // waar, de richel en zijn helling, en de hoogte waar de aanvoerder staat. Spel.debug.hoogte(5) begint een nieuw spel op
    // land 5 met heuvels (de spelregel "Hoogte" op "Heuvels"), Spel.debug.hoogte('top') zet de aanvoerder op de hoogste plek.
    hoogte(wat) {
      if (typeof wat === 'number') {
        T.zetOptie('hoogte', 'heuvels');
        T.nieuwSpel(wat);
      }
      const w = S.wereld;
      if (!T.heeftHoogte(w)) return 'Deze kaart is vlak (de spelregel "Hoogte" staat op "Vlak", of het is het ontworpen gehucht).'; // geen tekst
      let top = null;
      const vak = T.kaartVak(w);
      for (let y = vak.y; y < vak.y + vak.h; y++) for (let x = vak.x; x < vak.x + vak.b; x++) {
        const h = T.hoogteOp(w, x, y);
        if (!top || h > top.h) top = { x, y, h: Math.round(h) };
      }
      if (wat === 'top') Object.assign(S.dorp.aanvoerder, { x: top.x, y: top.y, tx: top.x, ty: top.y, pad: [], onderweg: false });
      return {
        hoogste: top,
        richel: Object.keys(w.hoogte.niveau).length + ' tegels',
        helling: Object.keys(w.hoogte.hellingen),
        aanvoerder: Math.round(T.hoogteOp(w, S.dorp.aanvoerder.x, S.dorp.aanvoerder.y)),
      };
    },
    // De raad onder het doel (js/raad.js): wat er nu staat, en welke raden nu allemaal gelden, in hun volgorde.
    raad() {
      if (!(S.dorp && S.dorp.plek.plein)) return 'Hier is geen raad: deze kaart heeft geen plein.'; // geen tekst
      const nu = T.raadNu(S.dorp);
      return { nu: nu ? nu.tekst : 'geen', gelden: T.RADEN.filter((r) => r.als(S.dorp)).map((r) => r.id) };
    },
    // De aanvoerder (js/soldaten.js; vraag 170, stap 5): wie het is, en wie het overneemt als hij valt. ('val') laat
    // hem nu vallen, zoals in een gevecht (T.valt): dan neemt een veteraan of de soldaat die het langst dient het over.
    aanvoerder(wat) {
      const D = S.dorp;
      const naam = (e) => (e ? T.naamVanBewoner(T.bewonerVan(D, e)) || e.naam : null);
      if (wat === 'val' && D.aanvoerder) T.valt(S, D, D.aanvoerder, null);
      const p = T.opvolgerVan(D);
      return { aanvoerder: naam(D.aanvoerder), opvolger: p ? T.naamVanBewoner(p) : null, wapen: D.aanvoerder ? T.slagVan(D.aanvoerder).wapen : null };
    },
    // Een tweede dorp op het eiland (werklijst vraag 170, stap 6a; T.dorpErbij, js/gebied.js): op de dichtste andere
    // dorpsplek, met het lege begin. Spel.debug.wissel() maakt jou het volgende dorp, zodat je ze in één browser speelt:
    // wat je ziet, hoort, bouwt en stuurt, is dan van dat dorp (S.dorp; alleen scherm).
    tweedeDorp() {
      if (!S.dorp.plek.naam) return 'Een tweede dorp kan alleen op het eiland.'; // geen tekst
      const D = T.dorpErbij(S);
      const v = (P) => ({ x: P.plek.vak.x + P.plek.vak.b / 2, y: P.plek.vak.y + P.plek.vak.h / 2 });
      return `Een tweede dorp in ${D.plek.naam}, ${Math.round(T.afstand(v(S.dorpen[0]), v(D)))} tegels verder. Spel.debug.wissel() maakt het van jou.`; // geen tekst
    },
    wissel() {
      if (S.dorpen.length < 2) return 'Er is maar één dorp: Spel.debug.tweedeDorp() maakt er een bij.'; // geen tekst
      S.dorp = S.dorpen[(S.dorpen.indexOf(S.dorp) + 1) % S.dorpen.length];
      S.gekozen = null;
      S.groepen = {};
      const m = T.pleinVan(S.dorp) || { x: S.dorp.plek.vak.x + S.dorp.plek.vak.b / 2, y: S.dorp.plek.vak.y + S.dorp.plek.vak.h / 2 };
      const p = T.naarSchermOp(S.wereld, m.x, m.y);
      T.kijkNaar(p.x, p.y);
      T.ui.werkBalkBij(S);
      return `Je speelt nu ${S.dorp.plek.naam} (${S.dorpen.indexOf(S.dorp) + 1} van ${S.dorpen.length}).`; // geen tekst
    },
    // De roverskampen (js/rovers.js; werklijst vraag 170, stap 6a2, c1 en c2): waar ze liggen, hoe ver van je plein, of ze
    // er al staan (hun land is open), en hun bende: wie, en waar hij vandaan kwam. Spel.debug.kampen('erheen'): het land om
    // het dichtste kamp gaat open, het kamp staat er, je kent het (zijn open plek, en de rode stip op de minikaart), en de
    // camera kijkt erheen.
    kampen(wat) {
      const w = S.wereld;
      if (!T.opEiland(w)) return 'Er zijn alleen roverskampen op het eiland.'; // geen tekst
      T.zetRoverskampenBij(S, w);
      const E = T.eilandVan(w.eiland.zaad);
      const m = T.pleinVan(S.dorp) || { x: S.dorp.plek.vak.x + S.dorp.plek.vak.b / 2, y: S.dorp.plek.vak.y + S.dorp.plek.vak.h / 2 };
      const lijst = w.kampen.map((K) => ({ K, ver: Math.round(T.afstand(m, K)) })).sort((a, b) => a.ver - b.ver);
      if (wat === 'erheen' && lijst.length) {
        const { K } = lijst[0];
        const r = T.EILAND_INSTELLINGEN.kampen.open;
        T.openVak(w, { x: K.x - r, y: K.y - r, b: 2 * r + 1, h: 2 * r + 1 });
        T.zetRoverskampenBij(S, w);
        T.kenKring(S.dorp, K.x, K.y, r);
        const p = T.naarSchermOp(w, K.x, K.y);
        T.kijkNaar(p.x, p.y);
      }
      const wie = (K) => K.bende.map((l) => `${l.naam}${l.uit ? ` (uit ${l.uit})` : ''}`).join(', '); // geen tekst
      return lijst.map(({ K, ver }) => `kamp ${K.nr} op (${K.x}, ${K.y}), ${ver} tegels van je plein, ${K.staat ? `staat er, ${K.tenten} van de ${E.kampen[K.nr].tenten.length} tenten` : 'nog niet gezien'}: ${wie(K)}`).join('; '); // geen tekst
    },
    // De rovers (js/rovers.js): wanneer de wilde rovers komen, en de aanval die loopt (wie wegtrok, woont in een roverskamp:
    // Spel.debug.kampen). Spel.debug.rovers(3) laat nu drie wilde rovers komen.
    rovers(wat) {
      const R = S.dorp.rovers || (S.dorp.rovers = T.nieuweRovers());
      if (wat != null && !R.aanval) {
        R.aanval = { soort: 'wild', dag: Math.floor(S.kalender.dag), fase: 'wacht', aantal: Number(wat) || 3, meteen: true };
      }
      const A = R.aanval;
      return {
        wildeOp: R.wildeOp,
        aanval: A ? { soort: A.soort, fase: A.fase, rovers: (A.rovers || []).map((e) => `${e.tx},${e.ty}${e.dood ? ' dood' : ''}`), akker: A.veld } : null,
        // Je mannen in het gevecht (js/gevecht.js): hun leven, hun wapen, en tegen wie ze vechten; en wie er schuilt.
        mannen: T.mannenVan(S.dorp).map((e) => {
          const d = e.volgt || e.doelwit;
          return `${e.naam} (${e.leven}/${e.maxLeven} leven, ${T.slagVan(e).wapen || 'vuist'}${d ? `, tegen de ${d.naam}` : ''})`; // geen tekst
        }),
        gevecht: S.dorp.gevecht,
        schuilen: S.dorp.bewoners.mensen.filter((p) => p.schuilt).map((p) => p.naam),
        soldaten: T.soldatenVan(S.dorp).map((p) => `${p.naam} (${p.soldaat.soort})`),
        wapens: T.wapensInHetDorp(S.dorp),
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
    // De wetten (js/wetten.js): per wet de stand, en wat hij dan doet. Spel.debug.wetten('rantsoen', 'krap')
    // zet er eerst een, zoals het menu (W) dat doet; wat de belasting nog meeneemt, staat erbij.
    wetten(id, stand) {
      if (id) {
        const r = T.zetWet(S.dorp, id, stand);
        if (!r.kan) return r.reden;
      }
      const lijst = T.wettenVanNu(S.dorp).map((w) => {
        const s = T.standVanWet(S.dorp, w);
        return { wet: w, stand: s, doet: T.watDeWetDoet(S.dorp, w, s).map((r) => (r.goed ? '+ ' : '− ') + r.tekst).join(' · ') };
      });
      return { wetten: lijst, belastingRest: S.dorp.wetten ? S.dorp.wetten.belastingRest : 0 };
    },
    // De groei van de huizen (js/behoeften.js, pasHuisGroeiToe; ronde 3 van het snoeien, stap 6): wat het dorp at en hoe
    // tevreden het is, en per huis met mensen wie er woont en hoe het met doorgroeien staat (werklijst vraag 130: wat het
    // gezin rooit, of waarom het niet groeit).
    groei() {
      const D = S.dorp;
      const pct = (x) => `${Math.round(x * 100)}%`;
      const IN = T.BEHOEFTEN_INSTELLINGEN;
      const groei = (g, t) => {
        if (!t.groei) return 'groeit niet door'; // geen tekst
        if (g.groeitNaRooien) return `het gezin rooit ${T.rooiWoordenOp(D, g.kavel)}, tot uiterlijk dag ${g.rooienTot}`; // geen tekst
        if (t.groei.later) return `wacht op ${t.groei.later}`; // geen tekst
        if (t.groei.waarom) return `groeit niet: ${t.groei.waarom}`; // geen tekst
        if (t.groei.wacht) return `wacht op ${Object.entries(t.groei.kosten).map(([w, n]) => `${n} ${w}`).join(', ')}`; // geen tekst
        return `${t.groei.dagen} van ${t.groei.nodig} dagen, vraagt ${t.groei.soorten} soorten${T.groeiRooiPlan(D, g, false) ? ', en dan rooit het gezin eerst' : ''}`; // geen tekst
      };
      return {
        dorp: `${pct(D.behoeften.tevredenheid)} tevreden (groei vanaf ${pct(IN.huisGroeiDrempel)}), at ${(D.behoeften.afwisseling || []).join(', ') || 'niets'}`, // geen tekst
        huizen: D.gebouwen.map((g) => ({ g, t: T.huisToestand(D, g) })).filter((x) => x.t).map(({ g, t }) => ({
          huis: `${T.GEBOUWEN[g.soort].naam} op ${g.x},${g.y}`, wie: t.wie.join(', '), groei: groei(g, t),
        })),
      };
    },
    // De herberg (js/herberg.js): wie er vanavond gaat, hoe ver ze lopen, gisteravond, en het bier.
    // Spel.debug.herberg(30) zet eerst 30 bier in de voorraad.
    herberg(bier) {
      const g = T.herbergVan(S.dorp);
      if (!g) return 'Hier staat geen herberg.'; // geen tekst
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
    // De meiboom en de kerstboom op het plein (js/versiering.js): welke boom er staat, en waar.
    versiering() {
      const V = S.dorp.versiering;
      return V && V.boom ? { boom: V.boom.soort, staat: `${V.boom.x},${V.boom.y}` } : 'Er staat geen boom.'; // geen tekst
    },
    // Het weer (js/weer.js; werklijst vraag 77, stap 2): het weer van vandaag, hoe lang het droog is, het watertekort, de
    // droogte en wat die de oogst kost, de beekjes en de vissers. Spel.debug.weer('regen') zet het weer van vandaag
    // ('zon', 'wolken', 'regen' of 'sneeuw'), ('droogte') maakt het nu droog, ('ernstig') ernstig droog, ('nat') maakt er
    // een eind aan.
    weer(wat, laag) {
      const D = S.dorp;
      if (!T.WEER_INSTELLINGEN.aan) return 'De spelregel "Het weer" staat op "Altijd zon".'; // geen tekst
      if (!D.weer) T.tikWeerDag(D, Math.floor(S.kalender.dag));
      const W = D.weer;
      const I = T.WEER_INSTELLINGEN;
      if (T.WEER_NAMEN[wat]) W.vandaag = wat;
      if (wat === 'sneeuw') W.sneeuw = Math.max(W.sneeuw || 0, typeof laag === 'number' ? laag : 0.8);
      if (wat === 'droogte' || wat === 'ernstig' || wat === 'nat') {
        W.tekort = wat === 'droogte' ? I.droogteVanaf : wat === 'ernstig' ? I.ernstigVanaf : 0;
        W.droog = wat === 'nat' ? 0 : Math.max(W.droog, W.tekort);
        if (wat === 'nat') W.vandaag = 'regen';
        W.beekDroog = T.droogteNiveau(D) > 0;
      }
      T.tikStatussenDag(D, Math.floor(S.kalender.dag));
      T.ui.toonKalender(S);
      return {
        vandaag: T.WEER_NAMEN[W.vandaag], droog: `${W.droog} ${W.droog === 1 ? 'dag' : 'dagen'} geen regen`, tekort: `${W.tekort} (droogte vanaf ${I.droogteVanaf}, ernstig vanaf ${I.ernstigVanaf})`, // geen tekst
        droogte: ['geen', 'droogte', 'ernstige droogte'][T.droogteNiveau(D)], oogst: `${Math.round((1 - T.droogteFactor(D)) * 100)}% minder dit jaar`, // geen tekst
        nat: `dit jaar ${Math.round(T.natVanJaar(D, Math.floor(S.kalender.dag)) * 100)}% van de gewone regen`, // geen tekst
        beekjes: `${T.beekTegels(D.wereld).length} tegels${W.beekDroog ? ', droog' : ''}`,
        sneeuw: `${Math.round((W.sneeuw || 0) * 100)}% van de grond wit`, // geen tekst
        vissers: D.gebouwen.filter((g) => g.soort === 'visser').map((g) => `${g.x},${g.y}: ${Math.round(T.visserWater(D, g) * 100)}% van zijn water`), // geen tekst
      };
    },
    // De bode naar de marskramer (js/bode.js; werklijst vraag 143): of het kan en waarom niet, wie er onderweg is en wanneer
    // de marskramer komt, het gevaar onderweg en wie hem onderschept. Spel.debug.bode('stuur', { graan: 3 }, 2) stuurt hem
    // nu (met twee mannen erbij), ('nu') laat ze nu aankomen, ('open') opent de brief, ('rovers') of ('heer') laat wie
    // onderweg is nu onderscheppen.
    bode(wat, bestelling, mee) {
      const D = S.dorp;
      if (wat === 'stuur') T.stuurBode(D, bestelling || { graan: 3 }, mee || 0);
      if ((wat === 'rovers' || wat === 'heer') && D.bode) D.bode.onderschept = wat;
      if (wat === 'nu' && D.bode) {
        D.bode.komt = Math.floor(S.kalender.dag);
        T.tikBodeDag(D, Math.floor(S.kalender.dag));
      }
      if (wat === 'open') T.ui.toonBrief(D, 'bode');
      const k = T.kanBodeSturen(D);
      const B = D.bode;
      return {
        kan: k.kan, reden: k.reden || null, status: k.status ? k.status.naam : null, winter: k.winter,
        gevaar: T.bodeGevaarTekst(D, 0),
        onderweg: B ? { wie: B.wie.map(T.naamVanBewoner), komt: T.datumVanDag(B.komt).tekst, bestelling: B.bestelling, onderschept: B.onderschept, afloop: B.onderschept === 'rovers' ? ((o) => ({ afgeslagen: o.afgeslagen, dood: o.dood.map(T.naamVanBewoner), gewond: o.gewond.map(T.naamVanBewoner), roverDood: o.roverDood }))(T.bodeOnderweg(D, B)) : null } : null,
        marskramer: D.marskramer ? (D.marskramer.bestelling ? { op: 'bestelling', heeft: D.marskramer.heeft, prijzen: D.marskramer.bestelling } : 'op zijn ronde') : null, // geen tekst
      };
    },
    // De brand (js/brand.js; werklijst vraag 144, 3): het brandgevaar, en welke huizen branden, in puin liggen of op hout
    // wachten. Spel.debug.brand('nu') laat de brand nu beginnen (ook zonder brandgevaar), ('puin') laat wat brandt nu
    // afbranden, ('herbouw') laat wat in puin ligt nu weer opbouwen (als er hout is).
    brand(wat) {
      const D = S.dorp;
      if (wat === 'nu') {
        D.brandKomt = S.kalender.dag;
        T.werkBrandBij(S, D);
        if (!T.brandendeHuizen(D).length) return 'Er is geen woonhuis dat kan branden.'; // geen tekst
      }
      for (const g of T.brandendeHuizen(D)) {
        if (wat === 'puin' && g.brand.fase === 'brandt') {
          g.brand = { fase: 'puin', sinds: S.kalender.dag };
          g.voorwerp.brand = 'puin';
        }
        if (wat === 'herbouw' && g.brand.fase === 'puin') g.brand.sinds -= T.BRAND_INSTELLINGEN.puinDagen + 1;
      }
      if (wat === 'herbouw') T.tikBrandDag(D, Math.floor(S.kalender.dag));
      const niveau = T.brandgevaarNiveau(D);
      return {
        gevaar: ['geen', 'brandgevaar', 'groot brandgevaar'][niveau], // geen tekst
        redKans: `${Math.round(T.redKans(D) * 100)} van de 100`, // geen tekst
        huizen: T.brandendeHuizen(D).map((g) => ({
          huis: `${g.soort} op ${g.x},${g.y}`, fase: g.brand.fase, sinds: T.uurTekst(g.brand.sinds),
          wachtOpHout: !!g.brand.wacht, hout: T.herbouwHout(g),
        })),
      };
    },
    // De koorts (js/koorts.js; werklijst vraag 144, 3): wie er ziek is en tot wanneer, wie het had, en hoe snel ze overgaat.
    // Spel.debug.koorts('nu') laat de koorts nu beginnen (ook zonder kou of een vol dorp).
    koorts(wat) {
      const D = S.dorp;
      if (wat === 'nu' && !D.koorts) T.beginKoorts(D, Math.floor(S.kalender.dag));
      const K = D.koorts;
      return K
        ? {
          niveau: ['geen', 'koorts', 'epidemie'][T.koortsNiveau(D)], sinds: T.datumVanDag(K.sinds).tekst,
          ziek: T.zieken(D).map((p) => `${T.naamVanBewoner(p)} (${p.leeftijd}), tot ${T.datumVanDag(p.ziek).tekst}`), gehad: K.gehad.length,
        }
        : 'Er is geen koorts.'; // geen tekst
    },
    // De kleren naar stand (T.klerenVan in js/bewoners.js; werklijst vraag 149): hoeveel volwassenen arm, gewoon en
    // deftig lopen, en per volwassene wat hij draagt, in welk huis, en welk vel hij draagt.
    kleren() {
      const D = S.dorp;
      const tel = { arm: 0, gewoon: 0, deftig: 0 };
      const mensen = D.bewoners.mensen.filter((p) => p.leeftijd === 'volwassen').map((p) => {
        const kleren = T.klerenVan(p);
        tel[kleren]++;
        const huis = p.huis ? p.huis.soort : 'geen huis'; // geen tekst
        return `${T.naamVanBewoner(p)}: ${kleren} (${huis})${p.wezen ? `, vel ${T.sprites.houding(S, p.wezen)?.naam}` : ''}`;
      });
      const IN = T.BEWONERS_INSTELLINGEN;
      const regel = IN.klerenNaarStand ? 'naar stand' : 'iedereen gewoon'; // geen tekst
      return { regel, ...tel, mensen };
    },
    // De twee bazen (js/bazen.js; werklijst vraag 106): de gunst van de heer en het vertrouwen van het dorp, hoe ze erbij
    // staan, waarom, en of je al gewaarschuwd bent. Spel.debug.bazen('gunst', 15) zet de gunst op 15 (met de
    // waarschuwing als hij onder de grens komt), ('vertrouwen', 0) jaagt je weg als je al gewaarschuwd was.
    bazen(welk, n) {
      const D = S.dorp;
      const b = T.bazenNu(D);
      if (!b) return 'De spelregel "Twee bazen" staat uit, of hier komt geen heer.'; // geen tekst
      if ((welk === 'gunst' || welk === 'vertrouwen') && typeof n === 'number') {
        (welk === 'gunst' ? T.wijzigGunst : T.wijzigVertrouwen)(D, n - b[welk], 'Spel.debug'); // geen tekst
      }
      const nu = T.bazenNu(D) || b;
      return {
        gunst: `${Math.round(nu.gunst)} (${T.bazenStemming(nu.gunst)})`,
        vertrouwen: `${Math.round(nu.vertrouwen)} (${T.bazenStemming(nu.vertrouwen)})`,
        waarom: D.bazen.waarom,
        gewaarschuwd: D.bazen.gewaarschuwd,
        einde: D.einde,
      };
    },
    // De grillen van de heer (js/grillen.js; werklijst vraag 106, stap 2): welke er op je antwoord wacht, welke er waren,
    // en hoe vaak je antwoordde of zweeg. Spel.debug.gril('standbeeld') laat die nu komen, met zijn brief (zonder naam
    // een gelote uit wat kan).
    gril(id) {
      const D = S.dorp;
      if (!T.bazenTellen(D)) return 'De spelregel "Twee bazen" staat uit, of hier komt geen heer.'; // geen tekst
      const G = D.grillen || (D.grillen = T.nieuweGrillen());
      if (id !== undefined) {
        if (id && !T.GRILLEN[id]) return `Die gril bestaat niet. Wel: ${Object.keys(T.GRILLEN).join(', ')}.`; // geen tekst
        const dag = Math.floor(S.kalender.dag);
        const kies = id || Object.keys(T.GRILLEN)[Math.floor(Math.random() * Object.keys(T.GRILLEN).length)];
        G.vraag = { id: kies, dag, uiterlijk: dag + T.GRILLEN_INSTELLINGEN.antwoordBinnen };
        G.geweest[kies] = dag;
        T.ui.toonBrief(D, 'gril');
      }
      const nu = T.grilNu(D);
      return {
        nu: nu ? `${nu.titel}, tot ${T.datumVanDag(nu.uiterlijk).tekst}` : null,
        keuzes: T.grilKeuzes(D).map((k) => `${k.tekst} (${k.kan ? k.prijs : k.waarom})`),
        geweest: Object.entries(G.geweest).map(([g, dag]) => `${g} op ${T.datumVanDag(dag).tekst}`),
        aantal: G.aantal, beantwoord: G.beantwoord, stil: G.stil,
      };
    },
    // Het jaar in het kort (js/einde.js): het jaarboek tot nu en het laatste jaarverslag. Spel.debug.einde('jaarverslag')
    // maakt het verslag nu en toont het. (Het winnen is er sinds 11 okt niet meer.)
    einde(wat) {
      const D = S.dorp;
      const dag = Math.floor(S.kalender.dag);
      if (wat === 'jaarverslag') {
        D.jaarverslag = { dag, regels: T.jaarverslagRegels(D, D.jaarboek || { begin: dag, mensen: D.bevolking, kwamen: 0, stierven: 0, weg: 0, doorgegroeid: 0, geoogst: 0, gemist: {} }, dag) };
        T.ui.toonBrief(D, 'jaarverslag');
      }
      return {
        jaarboek: D.jaarboek,
        laatsteJaarverslag: D.jaarverslag && D.jaarverslag.regels,
      };
    },
    // Opslaan en laden zonder het menu (js/opslaan.js): Spel.debug.opslaan('2') zet het spel op plek 2
    // (zonder plek: 1), Spel.debug.laden('auto') laadt wat er vanzelf bewaard is, en Spel.debug.spellen()
    // zegt wat er op de plekken staat, het nieuwste bovenaan.
    opslaan(plek = '1') {
      const r = T.slaOp(S, String(plek));
      return r.gelukt ? `Opgeslagen op plek ${plek}: ${r.kop.datum}.` : r.reden; // geen tekst
    },
    laden(plek = 'auto') {
      const r = T.laadSpel(String(plek));
      if (r.gelukt && T.ui.titelOpen()) T.ui.sluitTitel(S);
      return r.gelukt ? `Geladen: ${r.kop.datum}.` : r.reden; // geen tekst
    },
    spellen() {
      return T.opgeslagenSpellen().map((s) => `${s.plek}: ${s.kop.naam ? `${s.kop.naam}, ` : ''}${s.kop.datum || '?'}, ${s.kop.bevolking} mensen${s.reden ? ` (${s.reden})` : ''}`);
    },
    // Het slachtvenster nu openen (js/hud.js, T.ui.openSlachten), zonder op 1 slachtmaand te wachten.
    slachten() {
      if (!T.ui.openSlachten) return 'Het slachtvenster is er alleen in het gehucht.'; // geen tekst
      T.ui.openSlachten(S.dorp);
      return T.ui.vensterOpen() === 'slachten' ? 'open' : 'Er is geen vee om te slachten.'; // geen tekst
    },
    // Vee neerzetten om naar te kijken (js/vee.js): Spel.debug.vee('koe', 4) zet vier koeien op de
    // weide met de meeste plaats (een schaap op de heide, als die er is), elk op een vrije tegel en
    // met een eigen zaad (en dus een eigen kleur en een eigen ritme van grazen, staan en liggen).
    // Daar horen ze bij de kudde: ze blijven binnen de weide, geven melk en werpen jongen, en
    // verhuizen mee bij een wissel. Is die weide vol, dan de volgende; te vol mag, dat is ook iets
    // om naar te kijken (minder melk). Zonder weide, of zonder vrije tegel erop, rond een open plek
    // bij de aanvoerder, zoals vóór de weides.
    vee(soort = 'koe', aantal = 1) {
      if (!T.VEE[soort]) return `Dat dier ken ik niet: ${soort}. Er is: ${Object.keys(T.VEE).join(', ')}.`; // geen tekst
      const w = S.wereld;
      const h = S.dorp.aanvoerder;
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
        e.dorp = S.dorp;
        w.wezens.push(e);
        opWeide.push(e);
      }
      const opWeideTekst = opWeide.map((e) => `${e.naam} ${e.vel} op ${e.tx},${e.ty}, op ${e.weide.meent ? 'de heide' : `de weide ${e.weide.naam}`}`); // geen tekst
      if (opWeide.length && T.ui.toonVoorraad) T.ui.toonVoorraad(S.dorp); // de melk bij de kaas in de balk
      if (opWeide.length === aantal) return opWeideTekst;
      aantal -= opWeide.length;
      // Het midden van de kudde: de dichtstbijzijnde tegel, drie of meer stappen van de aanvoerder, met
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
      if (!midden) return opWeide.length ? opWeideTekst : 'Er is geen open stuk grond bij de aanvoerder.'; // geen tekst
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
            e.dorp = S.dorp;
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
      const doek = T.debug.beeld();
      const blob = await new Promise((klaar) => doek.toBlob(klaar, 'image/png')); // geen tekst
      const r = await fetch('/gereedschap/api/schermafdruk/' + encodeURIComponent(naam), { method: 'POST', body: blob }); // geen tekst
      return r.json();
    },
    // Het beeld zoals het nu op het scherm staat, als één 2D-doek (beeldNu, hierboven bij T.tekenBeeld).
    beeld: () => beeldNu(),
    // Wachten tot het beeld echt getekend is (het meten): de browser spaart tekenwerk op tot hij het moet laten zien.
    wacht() {
      if (glZichtbaar) T.gl.wacht();
      else ctx.getImageData(0, 0, 1, 1);
    },
    // Hoeveel milliseconden kost één beeld? Spel.debug.meet() tekent n beelden achter elkaar en
    // geeft het gemiddelde, de mediaan en de slechtste terug. Een beeld hoort ruim onder de 16 ms
    // te blijven (zestig beelden per seconde), het liefst onder de 5, zodat er ruimte overblijft
    // voor een tragere machine.
    // De meter in beeld (F2): beelden per seconde, en wat de regels en het tekenen per beeld kosten.
    meter(aan) {
      return wisselMeter(aan);
    },
    // Welke plaatjes de browser nu vasthoudt (T.sprites.geladen, js/sprites.js; vraag 114, stap 1): samen en per map, in
    // MB uitgepakt (vier bytes per pixel), met de grootste vellen; ('alles') noemt elk vel. `laadt` is wat er nog
    // onderweg is.
    vellen(wat) {
      const lijst = T.sprites.geladen().sort((a, b) => b.mb - a.mb || (a.pad < b.pad ? -1 : 1));
      const mb = (x) => Math.round(x * 10) / 10;
      const som = (l) => mb(l.reduce((s, v) => s + v.mb, 0));
      const perMap = {};
      for (const v of lijst) {
        const map = v.pad.slice(0, v.pad.lastIndexOf('/') + 1);
        (perMap[map] = perMap[map] || []).push(v);
      }
      const noem = (l) => l.map((v) => `${v.pad}: ${v.b}×${v.h}, ${mb(v.mb)} MB`); // geen tekst
      return {
        samen: som(lijst), vellen: lijst.length, laadt: T.sprites.bezig(), mist: T.sprites.mist.slice(),
        perMap: Object.fromEntries(Object.entries(perMap).map(([map, l]) => [map, `${som(l)} MB in ${l.length}`])), // geen tekst
        ...(wat === 'alles' ? { alles: noem(lijst) } : { grootste: noem(lijst.slice(0, 8)) }),
      };
    },
    meet(n) {
      const aantal = n || 120;
      const tijden = [];
      for (let i = 0; i < aantal; i++) {
        const t0 = performance.now();
        T.tekenBeeld();
        tijden.push(performance.now() - t0);
      }
      tijden.sort((a, b) => a - b);
      const som = tijden.reduce((a, b) => a + b, 0);
      const af = (x) => Math.round(x * 100) / 100;
      return {
        venster: `${cssB}×${cssH}`, getekend: `${bw}×${bh}`, zoom: Math.round(S.zoom * 100) / 100, buffer: `${canvas.width}×${canvas.height}`,
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
      if (!q) return `Die quest ken ik niet: ${naam}. Er is: ${Object.keys(T.QUESTS).join(', ') || 'nog niets'}.`; // geen tekst
      if (!fase) return { nu: T.questFase(S, naam) || 'niet begonnen', weg: T.questWegVan(S, naam), fasen: Object.keys(q.fasen) }; // geen tekst
      if (fase === 'uit') {
        delete S.quests[naam];
        delete S.questWeg[naam];
        for (const sleutel of [...S.questBeloond]) if (sleutel.startsWith(`${naam}:`)) S.questBeloond.delete(sleutel);
        T.werkQuestVoorwerpen(S);
        T.werkGeheimenBij(S);
        return `${q.naam}: niet begonnen. De beloning kan weer opnieuw.`; // geen tekst
      }
      if (!q.fasen[fase]) return `"${fase}" is geen fase van ${q.naam}. Er is: ${Object.keys(q.fasen).join(', ')}.`; // geen tekst
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
      T.tekenBeeld();
    },
  };

  formaat();
  T.ui.pasBeeldToe();
  // De pixel art gaat meteen laden; tot hij klaar is tekent het spel zijn vlakken, achter het titelscherm.
  // Een proefje (?kaart=) slaat het titelscherm over.
  T.sprites.laad();
  T.nieuwSpel();
  if (!S.proefje) T.ui.toonTitel(S);
  requestAnimationFrame(lus);
})(globalThis.Spel = globalThis.Spel || {});
