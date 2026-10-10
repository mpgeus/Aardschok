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
  let zoomVenster = 1; // de zoom die bij het venster hoort (formaat); het overzicht zoomt verder uit
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
  // zonder brief, en wordt nooit opgeslagen (S.proefje; js/opslaan.js). Het land zegt de spelregel "Je gehucht"
  // (T.landVoorNieuwSpel, js/gebied.js); met `makerZaad` is het het gehucht van de maker uit dat zaad, ook zonder de
  // spelregel (het land dat je bij Nieuw spel koos, js/menu.js; Spel.debug.gehucht).
  T.nieuwSpel = function (makerZaad) {
    for (const k of Object.keys(S)) if (k !== 'zoom') delete S[k];
    S.zoom = zoomVenster; // ook als het vorige spel in het overzicht stond
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
    const proefje = !!BEGIN_KAART && T.beginOpKaart(S, BEGIN_KAART);
    if (!proefje) T.beginOpKaart(S, 'gehucht', makerZaad != null ? makerZaad : T.landVoorNieuwSpel()); // zet S.wereld en S.schout
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
    const g = S.gebieden && S.gebieden.gehucht;
    const gemaakt = !!(g && g.maker);
    const opEiland = !!(g && g.eiland);
    if (S.proefje || (gemaakt === !!T.MAKER_INSTELLINGEN.eigenGehucht && opEiland === !!T.MAKER_INSTELLINGEN.opEiland)) return false;
    T.nieuwSpel();
    return true;
  };

  function zetCameraOpSchout() {
    const p = T.naarSchermOp(S.wereld, S.schout.x, S.schout.y);
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
    zoomVenster = Math.max(1, Math.min(2, Math.min(bw / 900, bh / 540)));
    S.zoom = S.overzicht ? S.overzicht.zoom : zoomVenster;
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
      if (e.dood || e.binnen || e === S.schout || !T.isZichtbaar(w, e.tx, e.ty)) continue;
      const p = T.naarSchermOp(S.wereld, e.x, e.y);
      const hoog = hoogteVan(e);
      if (sx > p.x - 17 && sx < p.x + 17 && sy > p.y - hoog && sy < p.y + 9) {
        kandidaten.push({ d: e.x + e.y + 0.01, wezen: e, x: e.tx, y: e.ty });
      }
    }
    for (const v of w.voorwerpen) {
      const hoog = voorwerpHoogte(v);
      if (!hoog || !T.isZichtbaar(w, v.x, v.y)) continue;
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
    const f = T.naarWereldOp(S.wereld, sx, sy);
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
    // Met een erf in de hand: welke put en kapel een huis hier zou halen (2c, vraag 100, c).
    const rechthoek = voet && { x, y, b: voet.b, h: voet.h };
    const kring = voet && (T.GEBOUWEN[S.bouwSoort].erf ? T.erfKringTekst(S.dorp, rechthoek) : T.kringTekst(S.dorp, S.bouwSoort, rechthoek));
    // En op een erf: wat er eerst gerooid moet, en of het in het bos van de heer ligt (js/erven.js; vraag 110, e).
    const rooien = voet && T.GEBOUWEN[S.bouwSoort].erf ? T.rooiTekst(S.dorp, rechthoek) : null;
    const tekst = [kring, rooien].filter(Boolean).join(' ');
    if (reden) T.ui.tooltip(reden, S.muis.x, S.muis.y, true);
    else if (tekst) T.ui.tooltip(tekst, S.muis.x, S.muis.y);
    else T.ui.verbergTooltip();
    S.hover = null;
    S.handeling = null;
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
    // In een gevecht bestuur je wie van jouw kant aan de beurt is: de schout, of een man van de militie.
    const actief = S.modus === 'verkennen' || (S.modus === 'gevecht' && !S.bezig && T.spelerAanDeBeurt(S));
    if (!S.muis || !actief) {
      S.hover = null;
      S.handeling = null;
      T.ui.verbergTooltip();
      T.ui.verbergHuisbriefje();
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
    werkHuisbriefjeBij();
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
    const p = T.naarSchermOp(S.wereld, mx + 4 * Math.cos(hoek), my + 4 * Math.sin(hoek));
    return { x: p.x, y: p.y - 24 };
  }
  T.titelCamera = titelCamera;

  // In een gevecht kijkt de camera naar wie van jouw kant aan de beurt is (de schout, of een man van de
  // militie) en de vijanden die nog staan.
  function cameraDoel() {
    if (S.overzicht) return S.overzicht.doel;
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
      const p = T.naarSchermOp(S.wereld, e.x, e.y);
      x += p.x;
      y += p.y;
    }
    return { x: x / lijst.length, y: y / lijst.length - 24 };
  }

  // Het overzicht (werklijst vraag 108, a; Marcel, 3 okt: "108 a tab", op "we hebben misschien toch een overview modus
  // nodig. Dus dat we wisselen tussen volgen van de speler en een overview"). Tab tilt de camera van de schout af en zoomt
  // uit, zodat je over je dorp kijkt en plant: slepen of de pijltjes schuiven het beeld, het wiel zoomt. Wat je doet, doet
  // de schout nog altijd: een klik op iemand of ergens heen, en hij loopt erheen (het poppetje blijft de manier waarop je
  // bestuurt; geen god boven het dorp, commercieel.md). Tab, of een klik op de schout, brengt je terug. Een gevecht ook.
  // Alleen scherm: S.overzicht staat in T.schermVelden (js/opslaan.js), en wordt niet bewaard.
  const OVERZICHT = {
    zoom: [0.5, 0.35], // waar Tab heen zoomt, en verder uit met het wiel (dichterbij gaat tot de zoom van het venster)
    stap: 64, // zoveel schermpixels per druk op een pijltje
    sleepVanaf: 6, // zoveel pixels moet de muis bewegen voor het slepen is in plaats van een klik
  };
  // De fotomodus (werklijst vraag 146, e; Marcel, 1 okt: een "goed idee voor de Steam pagina", en 10 okt: `H`, met een
  // regel in het menu, `Enter` bewaart een plaatje, en zoomen tot twee keer dichterbij). H haalt alles van het beeld: de
  // html erover (body.foto in stijl.css) en wat op het doek ui is (S.foto in js/tekenen.js). De camera gaat los zoals in
  // het overzicht, waarvan hij het slepen, de pijltjes en het wiel leent. Een klik doet niets, het spel loopt door (P zet
  // het stil), en wat je nodig hebt (een venster, een brief, een gesprek, een gevecht) haalt je eruit. H of Esc brengt je
  // terug waar je was: bij de schout, of in het overzicht. Alleen scherm: S.foto staat in T.schermVelden (js/opslaan.js).
  const FOTO = {
    zoom: [2, 1.5, 1, 0.75, 0.5], // maal de zoom van het venster; verder uit tot het overzicht (OVERZICHT.zoom)
  };
  const zoomStanden = () =>
    S.foto
      ? [...new Set([...FOTO.zoom.map((z) => z * zoomVenster), ...OVERZICHT.zoom])].sort((a, b) => b - a)
      : [zoomVenster, ...OVERZICHT.zoom];
  const fotoKan = () =>
    S.modus === 'verkennen' && !T.ui.vensterOpen() && !T.ui.briefOpen() && !T.ui.titelOpen() && !T.ui.menuOpen() && !T.ui.terugOpen();
  function zetFoto(aan = !S.foto) {
    if (aan === !!S.foto || (aan && !fotoKan())) return false;
    if (aan) {
      S.bouwSoort = null; // een gebouw dat nog aan de muis hing, ligt weer weg, zoals bij het menu
      S.bouwMenuOpen = false;
      T.ui.toonBouwmenu(S);
      S.foto = { inOverzicht: !!S.overzicht };
      if (!S.overzicht) S.overzicht = { doel: { x: S.camera.x, y: S.camera.y }, zoom: S.zoom };
    } else {
      const inOverzicht = S.foto.inOverzicht;
      S.foto = null;
      if (!inOverzicht) wisselOverzicht(false);
      else S.zoom = S.overzicht.zoom = Math.min(S.overzicht.zoom, zoomVenster);
    }
    document.body.classList.toggle('foto', aan);
    T.ui.toonOverzicht(S);
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
    }, 'image/png');
  }
  function wisselOverzicht(aan = !S.overzicht) {
    if (aan && S.modus !== 'verkennen') return;
    S.overzicht = aan ? { doel: { x: S.camera.x, y: S.camera.y }, zoom: OVERZICHT.zoom[0] } : null;
    S.zoom = aan ? S.overzicht.zoom : zoomVenster;
    T.ui.toonOverzicht(S);
  }
  T.wisselOverzicht = wisselOverzicht;
  // Het beeld schuiven, in schermpixels: wat je sleept of met de pijltjes duwt, meteen, zonder na te glijden.
  function schuifOverzicht(dx, dy) {
    S.overzicht.doel.x += dx / S.zoom;
    S.overzicht.doel.y += dy / S.zoom;
    S.camera.x = S.overzicht.doel.x;
    S.camera.y = S.overzicht.doel.y;
  }
  // Een stand verder uit (+1) of dichterbij (-1), met het wiel: de eerste stand voorbij de zoom van nu (die na de
  // fotomodus ook een stand van de foto kan zijn).
  function zoomOverzicht(richting) {
    const z = zoomStanden();
    const nu = S.overzicht.zoom;
    const volgende = richting > 0 ? z.find((s) => s < nu - 1e-6) : z.filter((s) => s > nu + 1e-6).pop();
    if (volgende != null) S.zoom = S.overzicht.zoom = volgende;
  }
  // Staat de muis op het lijf van de schout (met dezelfde maten als zoekDoel)?
  function opDeSchout(mx, my) {
    const { x: sx, y: sy } = naarVlak(mx, my);
    const p = T.naarSchermOp(S.wereld, S.schout.x, S.schout.y);
    return sx > p.x - 17 && sx < p.x + 17 && sy > p.y - hoogteVan(S.schout) && sy < p.y + 9;
  }
  const SCHUIF = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  let slepen = null; // { x, y, bewogen }: de muis ging omlaag in het overzicht

  // De raad onder het doel (js/raad.js) rekent met de groei en de winter, en dat hoeft niet elk beeld: om de halve
  // seconde is genoeg. Hij verandert niets, en is alleen scherm, dus hij staat niet in S.
  const RAAD_ELKE = 0.5;
  let raadNu = null;
  let raadOp = -Infinity;

  function werkBij(dt) {
    // Een resize-gebeurtenis komt niet altijd (een tabblad dat verborgen opstartte, heeft
    // eerst geen maat), dus kijkt de lus zelf of het venster veranderd is.
    if (window.innerWidth !== cssB || window.innerHeight !== cssH) formaat();
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
    // Na de laatste trede: iedereen een jaar gelukkig (js/einde.js), en is het gewonnen, dan het eindscherm.
    const doelNu = T.questDoel(S) || T.tredeDoel(S.dorp) || T.eindDoel(S.dorp);
    T.werkEindeBij(S);
    if (!(S.tijd - raadOp < RAAD_ELKE) || S.tijd < raadOp) {
      raadNu = T.raadNu(S.dorp);
      raadOp = S.tijd;
    }
    T.ui.opdracht(doelNu && doelNu.tekst, doelNu && doelNu.kop, raadNu && raadNu.tekst, doelNu && doelNu.deel);
    // Ook op reis (js/land.js, de kaart van het land) gaat het dorp zijn gang: er wordt gemaaid en gedwaald.
    if (S.modus === 'verkennen' || S.modus === 'land') {
      // Vóór T.laatDwalen: wie hier een pad krijgt, aan het maaien slaat (T.werkOogstBij, js/akkers.js) of op zijn land
      // werkt (T.werkVeldwerkBij, js/veldwerk.js; alleen het nieuwe spel: S.wereld.akkers is er anders niet), staat voor
      // T.laatDwalen al "bezig" (m.pad.length, m.maait of m.werkt) en dwaalt deze beurt niet ook nog weg.
      const hier = T.dorpHier(S); // het dorp waar je bent; de andere werken in T.werkDorpBij (js/dorp.js)
      if (hier) {
        T.werkOogstBij(S, hier, dtWereld);
        T.werkVeldwerkBij(S, hier);
        T.werkBeestenBij(S, hier); // de wolven en de herten in het bos (js/beesten.js)
      }
      T.laatDwalen(S, dtWereld);
      const m = S.modus === 'verkennen' && T.zoekOntdekking(S);
      if (m) T.startGevecht(S, m, false);
    }
    if (S.modus === 'overgang' && S.wereld.wezens.every((e) => !e.pad.length)) T.beginGevecht(S);
    const doelAlpha = S.modus === 'gevecht' ? 1 : 0;
    S.rasterAlpha += (doelAlpha - S.rasterAlpha) * Math.min(1, dt * 5);
    // Wat je nodig hebt (een venster, een brief, een gesprek, een gevecht), haalt je uit de fotomodus.
    if (S.foto && !fotoKan()) zetFoto(false);
    // Een gevecht begint: dan terug naar de schout, want het gevecht wil je zien.
    if (S.overzicht && (S.modus === 'overgang' || S.modus === 'gevecht')) wisselOverzicht(false);
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
      el.className = 'paneel verborgen';
      document.body.appendChild(el);
    }
    meter = aan ? { sinds: performance.now(), beelden: 0, regels: 0, tekenen: 0, traagst: 0 } : null;
    el.classList.toggle('verborgen', !aan);
    return aan;
  }
  function meetBeeld(nu, regels, tekenen) {
    const m = meter;
    if (m.vorig != null) m.traagst = Math.max(m.traagst, nu - m.vorig);
    m.vorig = nu;
    m.beelden++;
    m.regels += regels;
    m.tekenen += tekenen;
    const duur = performance.now() - m.sinds;
    if (duur < 1000) return;
    const ms = (x) => (Math.round(x * 10) / 10).toLocaleString('nl-NL');
    document.getElementById('meter').textContent =
      `${Math.round((m.beelden * 1000) / duur)} beelden/s · regels ${ms(m.regels / m.beelden)} ms · tekenen ${ms(m.tekenen / m.beelden)} ms · traagste beeld ${ms(m.traagst)} ms · ${glZichtbaar ? 'met de videokaart' : 'zonder videokaart'}`;
    Object.assign(m, { sinds: performance.now(), beelden: 0, regels: 0, tekenen: 0, traagst: 0 });
  }

  canvas.addEventListener('mousedown', (ev) => {
    slepen = ev.button === 0 && S.overzicht ? { x: ev.clientX, y: ev.clientY, bewogen: false } : null;
  });
  canvas.addEventListener('mousemove', (ev) => {
    S.muis = { x: ev.clientX, y: ev.clientY };
    // Slepen in het overzicht schuift het beeld (pas na een paar pixels: anders is het een klik).
    if (!slepen || !S.overzicht) return;
    if (!(ev.buttons & 1)) {
      slepen = null;
      return;
    }
    const dx = ev.clientX - slepen.x;
    const dy = ev.clientY - slepen.y;
    if (!slepen.bewogen && Math.hypot(dx, dy) < OVERZICHT.sleepVanaf) return;
    slepen.bewogen = true;
    schuifOverzicht(-dx / perPunt, -dy / perPunt);
    slepen.x = ev.clientX;
    slepen.y = ev.clientY;
  });
  canvas.addEventListener('wheel', (ev) => {
    if (!S.overzicht) return;
    ev.preventDefault();
    zoomOverzicht(ev.deltaY > 0 ? 1 : -1);
  }, { passive: false });
  canvas.addEventListener('mouseleave', () => {
    S.muis = null;
  });
  canvas.addEventListener('click', (ev) => {
    S.muis = { x: ev.clientX, y: ev.clientY };
    // Na het slepen is het loslaten geen klik; in het overzicht brengt een klik op de schout je terug.
    const gesleept = slepen && slepen.bewogen;
    slepen = null;
    if (gesleept) return;
    if (S.foto) return; // in de fotomodus doet een klik niets
    if (S.overzicht && opDeSchout(ev.clientX, ev.clientY)) {
      wisselOverzicht(false);
      return;
    }
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
    // F2: de meter (hierboven), altijd, ook als er een venster openstaat.
    if (ev.key === 'F2') {
      ev.preventDefault();
      wisselMeter();
      return;
    }
    // Een venster (js/ui.js; de marskramer, de heer, het slachten, verstoppen, de spelregels, de velden, de wetten, de
    // raadsman): zolang het open is, ligt de rest stil. Esc sluit het, en de toets van een ander venster of B gaat er
    // meteen heen (hieronder); wat precies, zegt T.ui.toetsBijVenster.
    if (T.ui.toetsBijVenster(S, ev)) return;
    if (S.modus === 'einde') return;
    // De fotomodus (hierboven): alleen zijn eigen toetsen. H of Esc is terug, Enter bewaart een plaatje, de pijltjes
    // kijken. De rest van het spel doet niets; P en de snelheden (js/hud.js) werken wel.
    if (S.foto) {
      if (ev.key === 'h' || ev.key === 'H' || ev.key === 'Escape') zetFoto(false);
      else if (ev.key === 'Enter') bewaarFoto();
      else if (SCHUIF[ev.key]) schuifOverzicht(SCHUIF[ev.key][0] * OVERZICHT.stap, SCHUIF[ev.key][1] * OVERZICHT.stap);
      if (ev.key === 'Tab' || ev.key === 'Enter' || SCHUIF[ev.key]) ev.preventDefault();
      return;
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
    // Tab: het overzicht (werklijst vraag 108, a), alleen bij het rondlopen; in het overzicht schuiven de pijltjes het beeld.
    if (ev.key === 'Tab') {
      ev.preventDefault();
      if (S.modus === 'verkennen') wisselOverzicht();
      return;
    }
    // H: de fotomodus (hierboven), alleen bij het rondlopen.
    if ((ev.key === 'h' || ev.key === 'H') && S.modus === 'verkennen') {
      zetFoto(true);
      return;
    }
    if (S.overzicht && SCHUIF[ev.key]) {
      ev.preventDefault();
      schuifOverzicht(SCHUIF[ev.key][0] * OVERZICHT.stap, SCHUIF[ev.key][1] * OVERZICHT.stap);
      return;
    }
    // O, V, W en R: de spelregels, de velden, de wetten en je raadsman (de toets staat bij het venster, js/ui.js),
    // alleen in het nieuwe spel en alleen bij het rondlopen.
    const venster = T.NIEUWE_HUD && S.modus === 'verkennen' && T.ui.vensterMetToets(ev.key);
    if (venster) {
      T.ui.wisselVenster(S, venster);
      return;
    }
    // B: het bouwmenu (js/hud.js), net zo — botst nergens mee (CLAUDE.md, "Toetsen"). Nog eens B, Esc of rechtsklik
    // legt een gebouw weer weg.
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
    // De paadjes en de lantaarns (js/paden.js; werklijst vraag 108, b en d): hoeveel tegels paadje zijn (van de deuren, en
    // gesleten), waar het meest gelopen wordt, en de lantaarns. ('nacht') doet nu wat de nacht doet: slijten en
    // lantaarns zetten.
    paden(wat) {
      const D = S.dorp;
      const w = D.wereld;
      if (wat === 'nacht') T.tikPadenDag(D);
      const b = w.tegels[0].length;
      const net = T.aangelegdNet(D);
      const P = w.paden || { slijt: {}, gesleten: new Set() };
      const tegel = (k) => `${k % b},${Math.floor(k / b)}`;
      return {
        spelregel: T.PADEN_INSTELLINGEN.paadjes,
        vanDeDeuren: net.filter((v) => v === 2).length,
        gesleten: P.gesleten.size,
        meestGelopen: Object.entries(P.slijt).sort((a, c) => c[1] - a[1]).slice(0, 8).map(([k, n]) => `${tegel(Number(k))}: ${n} per dag`),
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
          return `${naam(e)} op ${e.tx},${e.ty} wacht ${Math.round(e.gewacht * 10) / 10} s${ander ? ` op ${naam(ander)}` : ''}`;
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
      if (!D || !D.kalender) return 'Veldwerk is er alleen in een dorp.';
      const w = S.wereld;
      const datum = T.datumVanDag(D.kalender.dag);
      const naam = (e) => {
        const p = T.bewonerVan(D, e);
        return p ? T.naamVanBewoner(p) : e.wie || e.soort;
      };
      const nu = (e) => {
        if (e.maait) return `maait op ${e.maait.x},${e.maait.y}`;
        const wt = e.werkt;
        if (wt) return `${wt.soort}${wt.tot == null ? ', op weg' : wt.rust ? ', staat even' : ''} op ${wt.x},${wt.y}`;
        return e.draagt ? 'brengt hout naar huis' : 'niet op zijn land';
      };
      const boeren = w.wezens.filter((e) => !e.dood && e.werkAkkers && e.werkAkkers.length).map((e) => ({
        boer: naam(e),
        vandaag: T.veldwerkVandaag(D, e, datum) || 'bij zijn boerderij (of de oogst)',
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
          .map((p) => `${p.naam}: ${p.wezen.draagt === 'schoof' ? 'draagt schoven naar de schuur' : nu(p.wezen)}`).join('; '),
      }));
      return { datum: `${datum.dagVanMaand} ${T.MAANDEN[datum.maand].naam}, ${T.uurTekst(D.kalender.dag)}`, boeren };
    },
    // Ontginnen (js/ontginnen.js; werklijst vraag 107): of het dorp graan tekortkomt, welk stuk heide en welk stuk bos
    // elke boer zou vragen (en of de inner dat stuk bos van zijn ronde ziet), hoeveel stukken er al van de meent af gingen
    // en wat het volgende aan vertrouwen kost, wat er nu ontgonnen wordt en hoe ver, welke akkers stiekem in het bos liggen
    // (en of de inner ze zag, of er een spoor heen loopt), en wanneer er weer een verzoek kan komen. ('nu') laat het
    // verzoek nu komen, ook zonder tekort.
    ontginnen(wat) {
      const D = T.dorpHier(S);
      if (!D || !D.kalender) return 'Ontginnen kan alleen in een dorp.';
      const w = S.wereld;
      const dag = Math.floor(D.kalender.dag);
      if (wat === 'nu') {
        const echt = T.graanTekort;
        T.graanTekort = () => true;
        const st = D.ontginnen;
        D.ontginnen = { gevraagd: null, klaar: null, gezocht: null };
        try {
          if (!T.beginOntginverzoek(D, dag)) return 'Er is geen boer met een stuk vrije heide of bos, of er loopt al een voorval.';
        } finally {
          T.graanTekort = echt;
          if (st) Object.assign(D.ontginnen, st);
        }
      }
      const boeren = w.wezens.filter((e) => !e.dood && e.werkAkkers && e.werkAkkers.length);
      const stuk = (p) => p && `${p.x},${p.y} ${p.b}x${p.h}`;
      return {
        graanTekort: T.graanTekort(D),
        wieZouVragen: boeren.map((e) => {
          const bos = T.bosPlekVoor(D, e);
          return { boer: e.naam, heide: stuk(T.ontginPlekVoor(D, e)), bos: bos && `${stuk(bos)}, ${bos.bomen} bomen, ${bos.verborgen ? 'de inner ziet het niet' : 'de inner ziet het'}` };
        }),
        vanDeMeent: `${T.ontgonnenStukken(w)} stukken; het volgende kost ${T.ontginVertrouwen(D)} vertrouwen`,
        inOntginning: T.inOntginning(w).map((v) => ({
          veld: v.naam, waar: stuk(v), op: v.ontginning.op, af: `${v.ontginning.gestoken.size} van ${v.b * v.h}`,
          bomen: T.akkerTegels(v).filter((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken').length,
          klaarOp: v.ontginning.tot - dag + ' dagen',
        })),
        stiekem: w.akkers.filter((v) => v.stiekem).map((v) => ({
          veld: v.naam, waar: stuk(v), sinds: v.stiekem.sinds, innerZag: v.stiekem.gezien,
          spoor: T.spoorNaar(D, v), soldatenVinden: { elkJaar: T.vindKansVanBosAkker(D, v, false), heelDorp: T.vindKansVanBosAkker(D, v, true) },
        })),
        staat: D.ontginnen || null,
      };
    },
    // De beesten in het bos (js/beesten.js; werklijst vraag 116): per groep de soort, hoeveel dieren, waar de leider is en
    // wat de groep wil (thuis, aan de rand, of weg van iemand), zijn hol en zijn plekken aan de rand, en of hij nu wegrent.
    // ('hier'): de schout staat nu tien tegels van de dichtste groep, net buiten wat ze schuw maakt, om ze te bekijken.
    // ('opnieuw'): de groepen opnieuw, uit het zaad van het land. ('jongen'): elke groep krijgt nu jongen, en wie groot
    // wordt, splitst. ('jacht'): elke roedel jaagt nu op de herten, alsof het winter is en hij honger heeft. ('honger'):
    // elke roedel heeft nu zoveel honger dat hij in het donker naar het dorp komt (zet er de avond bij met
    // Spel.debug.uur(21)). ('schaap'): de eerste roedel neemt nu het dichtste schaap, en de herder zegt het morgen.
    beesten(wat) {
      const D = T.dorpHier(S);
      if (!D || !D.kalender) return 'De beesten zijn er alleen bij een dorp.';
      if (wat === 'opnieuw') {
        S.wereld.wezens = S.wereld.wezens.filter((e) => !e.beest);
        T.zetBeesten(D);
      }
      if (wat === 'jongen' || wat === 'jacht') T.tikBeestenDag(D, Math.floor(D.kalender.dag), { [wat]: true });
      const roedels = T.beestenVan(D).filter(({ G }) => G.soort === 'wolf');
      if (wat === 'honger') for (const { G } of roedels) G.honger = T.BEESTEN_INSTELLINGEN.dreiging.stout;
      if (wat === 'schaap' && roedels.length) {
        const { G, leden } = roedels[0];
        const l = leden.find((e) => e.leider) || leden[0];
        const schapen = S.wereld.wezens.filter((e) => e.dier === 'schaap' && !e.dood);
        const schaap = schapen.sort((a, b) => T.afstand(T.tegelVan(a), T.tegelVan(l)) - T.afstand(T.tegelVan(b), T.tegelVan(l)))[0];
        if (schaap) T.wolvenSlaanToe(S, D, G, l, { e: schaap, soort: 'schaap' });
      }
      const h = T.tegelVan(S.schout);
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
        if (plek) Object.assign(S.schout, { x: plek.x, y: plek.y, tx: plek.x, ty: plek.y, pad: [], onderweg: false });
      }
      const nu = T.uurTekst(D.kalender.dag);
      return {
        aan: T.BEESTEN_INSTELLINGEN.aan, uur: nu, hek: !!(D.beesten && D.beesten.hek),
        status: T.wolvenBijHetDorp(D, D.kalender.dag),
        groepen: groepen.map(({ G, leden }) => {
          const l = leden.find((e) => e.leider) || leden[0];
          const lt = T.tegelVan(l);
          return {
            soort: `${leden.length} ${T.BEESTEN[G.soort][leden.length === 1 ? 'naam' : 'meervoud']}`,
            leider: `${lt.x},${lt.y}${l.pad.length ? ` (loopt, nog ${l.pad.length})` : ` (${l.rust})`}, ${T.afstand(lt, T.tegelVan(S.schout))} tegels van de schout`,
            wil: G.weg > D.kalender.dag ? `weg van iemand, naar ${G.vluchtNaar.x},${G.vluchtNaar.y}` : G.doel === 'prooi' ? 'prooi' : T.beestenWillen(D, G),
            thuis: `${G.thuis.x},${G.thuis.y}`,
            rand: G.rand.map((p) => `${p.x},${p.y}`).join(' '),
            rent: leden.some((e) => e.rent),
            ...(G.soort === 'wolf' ? {
              honger: `${(G.honger || 0).toFixed(1)} (jaagt vanaf ${T.BEESTEN_INSTELLINGEN.honger.jagenVanaf}, stout vanaf ${T.BEESTEN_INSTELLINGEN.dreiging.stout})`,
              gevangen: G.gevangen || 0,
              stout: T.wolvenStout(D, G),
              ...(G.prooi ? { prooi: `${G.prooi.soort === 'schaap' ? 'een schaap' : G.prooi.soort === 'schout' ? 'de schout' : T.naamVanBewoner(T.bewonerVan(D, G.prooi.e))}` } : {}),
            } : {}),
            jongen: G.jongenJaar ? `in ${G.jongenJaar}` : 'nog niet',
            ...(G.trektWeg ? { trektWeg: true } : {}),
          };
        }),
        // De jagers (stap 3a): waar hij op jaagt, wat hij schoot, en of hij herten vindt.
        jagers: D.gebouwen.filter((g) => g.soort === 'jager' && g.klaar).map((g) => {
          T.wildVanJager(D, g);
          return {
            hut: `${g.x},${g.y}`,
            jaagt: g.wild === undefined ? 'zijn vlees komt uit het niets (geen beesten)' : `${g.wild ? `op ${g.wild.soort === 'wolf' ? 'de roedel' : 'de herten'} bij ${g.wild.x},${g.wild.y}` : 'geen groep'}${g.zonderHerten ? ', en hij vindt geen hert: alleen klein wild' : ''}`,
            vlees: `${(g.gejaagd || 0).toFixed(1)} van ${T.BEESTEN_INSTELLINGEN.jager.perDier} voor het volgende hert`,
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
      if (!D || !D.kalender) return 'Het bos is er alleen bij een dorp.';
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
        aan: B.houthakkerHakt,
        houthakkers: hakkers.map((g) => {
          const p = D.bewoners && D.bewoners.mensen.find((q) => q.werk === g);
          const e = p && p.wezen;
          const boom = g.boom && T.voorwerpOp(w, g.boom.x, g.boom.y);
          return {
            waar: `${g.x},${g.y}`,
            boom: g.boom ? `${boom ? boom.soort : '?'} op ${g.boom.x},${g.boom.y}${T.isBos(w, g.boom.x, g.boom.y) ? ', in het bos' : ', in de wei'}` : g.boom === null ? 'geen' : 'nog niet gekozen',
            gehakt: `${Math.round((g.gehakt || 0) * 10) / 10} van ${B.houtPerBoom} hout`,
            stil: g.stilWant || null,
            binnenBereik: telBij(g),
            hand: e ? `${T.naamVanBewoner(p)}: ${e.werkt ? `${e.werkt.soort}${e.werkt.tot == null ? ', op weg' : ''} op ${e.werkt.x},${e.werkt.y}` : e.draagt ? 'brengt een bundel naar de schuur' : 'niet aan het hakken'}` : 'niemand',
          };
        }),
        boompjes: w.voorwerpen.filter((v) => v.soort === 'boompje').length,
        jongeBomen: w.voorwerpen.filter((v) => v.geplant != null && v.soort !== 'boompje').length,
        stronken: w.voorwerpen.filter((v) => v.gehaktOp != null).map((v) => `${v.x},${v.y} vergaat op dag ${v.gehaktOp + B.stronkDagen}`).slice(0, 12),
        vandaag: dag,
      };
    },
    // Wie er een praatje maakt (js/praatje.js; werklijst vraag 120): per groepje wie erin staan (en wie nog komt), waar
    // en tot hoe laat, en hoeveel er nu vrij zijn. ('nu'): de twee vrije bekenden die het dichtst bij elkaar staan,
    // beginnen nu een praatje (staan ze verder dan zes tegels uit elkaar, dan zegt het dat).
    praatjes(wat) {
      const D = T.dorpHier(S);
      if (!D || !D.kalender) return 'Praatjes zijn er alleen in een dorp.';
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
        if (!beste) return `Er staan nu geen twee vrije bekenden stil (${deel}, ${vrij.length} vrij).`;
        if (beste.a > 6) return `De dichtste twee vrije bekenden, ${naam(beste.e)} en ${naam(beste.b)}, staan ${beste.a} tegels uit elkaar.`;
        if (!T.beginPraatje(D, beste.e, beste.b)) return `${naam(beste.e)} kan niet bij ${naam(beste.b)} komen.`;
      }
      const groepjes = [...T.praatjesOp(w)].map(([g, leden]) => ({
        wie: leden.map((e) => naam(e) + (T.staatErbij(e) ? '' : ' (komt)')).join(', '),
        waar: `${g.plek.x},${g.plek.y}${T.opHetPlein(w, g.plek.x, g.plek.y) ? ' (op het plein)' : ''}`,
        tot: T.uurTekst(g.tot),
      }));
      return { deel, vrij: vrij.length, groepjes };
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
    // maker", zonder brief; zo kun je een zaad bekijken zonder de spelregel om te zetten. Het is het land van de maker
    // zonder het eiland, zoals op die pagina, ook nu een nieuw spel het eiland maakt (vraag 117): de vaste
    // schermafdrukken, de tekenmeting en de samenvatting spelen op land 5 van de maker (Spel.debug.eiland(5) voor het
    // eiland).
    gehucht(zaad) {
      if (zaad != null) {
        const opEiland = T.MAKER_INSTELLINGEN.opEiland;
        T.MAKER_INSTELLINGEN.opEiland = false;
        try {
          T.nieuwSpel(Number(zaad));
        } finally {
          T.MAKER_INSTELLINGEN.opEiland = opEiland;
        }
      }
      const w = S.gebieden && S.gebieden.gehucht;
      const stijl = w && w.stijl ? `, in de bouwstijl ${w.stijl} (js/bouwstijl.js)` : '';
      if (w && w.eiland) return `Een gehucht op het eiland van ${w.eiland.zaad}, in ${w.eiland.dorp}${stijl} (Spel.debug.eiland()).`;
      return w && w.maker ? `Een gehucht van de maker, uit zaad ${w.maker.zaad}${stijl}.` : 'Het ontworpen gehucht.';
    },
    // Je dorp op het eiland (js/eiland.js, vraag 117, stap 2): Spel.debug.eiland(5) begint nu een nieuw spel op het eiland
    // van nummer 5, zonder brief (en zet de spelregel "Je gehucht" terug op het eiland, als een toets hem omzette);
    // zonder nummer zegt het waar je dorp op het eiland ligt, wat voor plek het is, en waar de wegen je land verlaten.
    eiland(zaad) {
      if (zaad != null) {
        T.zetOptie('gehucht', 'eiland');
        T.nieuwSpel(Number(zaad));
      }
      const w = S.gebieden && S.gebieden.gehucht;
      if (!w || !w.eiland) return 'Dit gehucht ligt niet op het eiland (de spelregel "Je gehucht" staat niet op "Op het eiland").';
      const E = T.eilandVan(w.eiland.zaad);
      const dorp = E.plekken.find((p) => p.naam === w.eiland.dorp);
      return {
        eiland: w.eiland.zaad,
        dorp: w.eiland.dorp,
        plek: dorp ? dorp.aard : null,
        hoek: [w.eiland.x0, w.eiland.y0],
        uitgang: w.overgangen ? w.overgangen.map((o) => [o.x, o.y]) : null,
      };
    },
    // De hoogte van het land (js/hoogte.js, vraag 121): of deze kaart hoogte heeft, hoe hoog het hoogste punt is en
    // waar, de richel en zijn helling, en de hoogte waar de schout staat. Spel.debug.hoogte(5) begint een nieuw spel op
    // land 5 met heuvels (de spelregel "Hoogte" op "Heuvels"), Spel.debug.hoogte('top') zet de schout op de hoogste plek.
    hoogte(wat) {
      if (typeof wat === 'number') {
        T.zetOptie('hoogte', 'heuvels');
        T.nieuwSpel(wat);
      }
      const w = S.wereld;
      if (!T.heeftHoogte(w)) return 'Deze kaart is vlak (de spelregel "Hoogte" staat op "Vlak", of het is het ontworpen gehucht).';
      let top = null;
      for (let y = 0; y < w.h; y++) for (let x = 0; x < w.b; x++) {
        const h = T.hoogteOp(w, x, y);
        if (!top || h > top.h) top = { x, y, h: Math.round(h) };
      }
      if (wat === 'top') Object.assign(S.schout, { x: top.x, y: top.y, tx: top.x, ty: top.y, pad: [], onderweg: false });
      return {
        hoogste: top,
        richel: Object.keys(w.hoogte.niveau).length + ' tegels',
        helling: Object.keys(w.hoogte.hellingen),
        schout: Math.round(T.hoogteOp(w, S.schout.x, S.schout.y)),
      };
    },
    // De raad onder het doel (js/raad.js): wat er nu staat, en welke raden nu allemaal gelden, in hun volgorde.
    raad() {
      if (!(S.wereld && S.wereld.plein)) return 'Hier is geen raad: deze kaart heeft geen plein.';
      const nu = T.raadNu(S.dorp);
      return { nu: nu ? nu.tekst : 'geen', gelden: T.RADEN.filter((r) => r.als(S.dorp)).map((r) => r.id) };
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
        // Ook een voorval dat de beesten zelf beginnen ('wolven', js/beesten.js); dan zonder dat de wolven echt iets namen.
        const oud = { vervolg: v.vervolg, als: v.als, pauze: v.pauze, zelf: v.zelf };
        Object.assign(v, { vervolg: false, als: undefined, pauze: 0, zelf: v.zelf === true });
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
    // De graanzak (js/zaak.js; vraag 128): wie het nam en wie verdacht wordt, de fase, het spoor, wat je weet, de zitting
    // en hoe het afliep. ('nu') laat de zak nu verdwijnen, en de boer zoekt je meteen; ('zitting') maakt vandaag de dag
    // van de zitting (zet er het uur bij met Spel.debug.uur(13)); ('boek') laat de inner het boek nu voorlezen.
    zaak(wat) {
      const D = S.dorp;
      const dag = Math.floor(S.kalender.dag);
      if (!D.voorvallen) D.voorvallen = T.nieuweVoorvallen();
      const V = D.voorvallen;
      if (wat === 'nu' && !D.zaak) {
        if (V.lopend) T.voorvalBeantwoord(D, V.lopend.id);
        if (!T.beginZaak(D, dag)) return 'Het dorp heeft de mensen er nog niet voor: een vader met een kind, en een boerderij.';
        T.beginVoorval(D, 'graanzak', D.zaak.aanklager, D.zaak.verdachte, dag).vanaf = S.kalender.dag;
      }
      if (wat === 'zitting' && D.zaak && D.zaak.fase !== 'af') {
        if (D.zaak.fase === 'gestolen') {
          T.zaakGevolg(S, D, { zaak: 'zitting' });
          T.voorvalBeantwoord(D, 'graanzak');
        }
        if (V.lopend && V.lopend.id !== 'zitting') T.voorvalBeantwoord(D, V.lopend.id);
        D.zaak.zitting = dag;
        T.tikZaakDag(D, dag);
      }
      if (wat === 'boek') T.heerLeestHetBoek(D);
      const Z = D.zaak;
      if (!Z) return { zaak: null, mensen: T.mensenVoorDeZaak(D, dag) ? 'het dorp heeft ze' : 'het dorp heeft ze nog niet' };
      const naam = (p) => (p ? T.naamVanBewoner(p) : null);
      return {
        fase: Z.fase,
        verdwenen: T.datumVanDag(Z.dag).tekst,
        dader: naam(Z.dader), kind: naam(Z.ziek), aanklager: naam(Z.aanklager), verdachte: naam(Z.verdachte), buur: naam(Z.buur),
        spoor: Z.spoor.map((t) => `${t.x},${t.y}`).join(' '),
        weet: Z.weet.map((w) => w.id),
        zitting: Z.zitting != null ? T.datumVanDag(Z.zitting).tekst : null,
        uitkomst: Z.uitkomst,
        boek: Z.boek,
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
    // wil, met ✓ of ✗ (een goed dat maar deels gedekt is, met hoeveel), en hoe het met doorgroeien staat (werklijst vraag
    // 130: wat het gezin rooit, of waarom het niet groeit); daarboven het dorp per stand, en wat er gemist wordt.
    // Spel.debug.wensen('dorpelingen') laat alleen die stand zien.
    wensen(stand) {
      const b = T.berekenTevredenheid(S.dorp, Math.floor(S.kalender.dag));
      if (!b.wensen) return `Geen wensen per huis: het dorp rekent als geheel (${Math.round(b.tevredenheid * 100)}%).`;
      const pct = (x) => `${Math.round(x * 100)}%`;
      const wie = (g) => S.dorp.bewoners.mensen.filter((p) => p.huis === g).map((p) => p.naam || T.naamVanMens(p.wie)).join(', ');
      const huizen = (n) => (n === 1 ? 'één huis' : `${n} huizen`);
      const groei = (g) => {
        if (!T.GEBOUWEN[g.soort].wordt) return null;
        if (g.groeitNaRooien) return `het gezin rooit ${T.rooiWoordenOp(S.dorp, g.kavel)}, tot uiterlijk dag ${g.rooienTot}`;
        const waarom = T.waaromGroeitHetNiet(S.dorp, g);
        if (waarom) return `groeit niet: ${waarom}`;
        return `${g.groeiDagen || 0} van ${T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen} dagen alles${T.groeiRooiPlan(S.dorp, g, false) ? ', en dan rooit het gezin eerst' : ''}`;
      };
      return {
        dorp: pct(b.tevredenheid),
        standen: Object.fromEntries(Object.entries(b.wensen.standen).map(([s, x]) => [s, `${pct(x.tevredenheid)}, ${x.mensen} mensen, alles in ${x.alles} van ${huizen(x.huizen)}`])),
        gemist: b.wensen.gemist.map((m) => `${m.naam}: ${huizen(m.huizen)}, ${m.mensen} mensen`),
        huizen: b.wensen.huizen.filter((h) => !stand || h.stand === stand).map((h) => ({
          huis: `${T.GEBOUWEN[h.g.soort].naam} op ${h.g.x},${h.g.y}`, stand: h.stand, wie: wie(h.g), tevreden: pct(h.tevredenheid),
          wil: Object.entries(h.heeft).map(([id, x]) => `${T.WENSEN[id].naam} ${x >= 1 - 1e-9 ? '✓' : x > 0 ? `✗ (${pct(x)})` : '✗'}`).join(' · '),
          groei: groei(h.g),
        })),
      };
    },
    erven() {
      return (S.dorp.erven || []).map((e) => {
        const hut = e.hut;
        const wie = hut && S.dorp.bewoners ? S.dorp.bewoners.mensen.filter((p) => p.huis === hut).map((p) => p.naam) : [];
        const vrij = T.hutPastOpErf(S.dorp, e) ? 'vrij' : 'vrij, maar er past geen hut meer op (vraag 110, f)';
        const rooien = hut && hut.wachtOpRooien ? `het gezin rooit nog ${T.teRooienOp(S.dorp, hut.kavel).length} tegels, tot uiterlijk dag ${hut.rooienTot}` : null;
        const staat = !hut ? vrij : rooien || (hut.wachtOpHout ? 'wacht op hout' : hut.klaar ? `een ${T.GEBOUWEN[hut.soort].naam}` : `in aanbouw, klaar op dag ${hut.klaarOp}`);
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
      return { deur: `${deur.x},${deur.y}`, bier: Math.floor(S.dorp.voorraad.bier || 0), apartVoorDeHuizen: T.bierApart(S.dorp), vanavond, gisteravond: S.dorp.herberg && S.dorp.herberg.gisteravond, tekst: T.gebouwToestand(S.dorp, g) };
    },
    // De feesten (js/feesten.js): welk feest er komt of nu is, waar het dorp staat, de boom op het plein (de meiboom of de
    // kerstboom), en wat er gevierd werd. Spel.debug.feest('oogstfeest') laat het vandaag beginnen, de hele dag;
    // ('meiboom', 'avond') alleen vanavond, en ('kerstboom') zet de kerstboom en viert vanavond kerstavond. Zet er de tijd
    // bij met Spel.debug.uur(10) (overdag) of (20) (de avond).
    feest(id, hoe) {
      const D = S.dorp;
      if (id) {
        if (!T.FEESTEN[id]) return `Er is geen feest "${id}". Er zijn: ${Object.keys(T.FEESTEN).join(', ')}.`;
        if (!T.FEESTEN_INSTELLINGEN.vieren) return 'De spelregel Feesten staat op "Alleen de stemming".';
        const f = T.zetFeest(D, id, hoe || 'dag', S.kalender.dag);
        if (f.dag !== Math.floor(S.kalender.dag)) {
          f.dag = Math.floor(S.kalender.dag);
          T.feestBegint(D, f);
        }
      }
      const F = D.feesten || T.nieuweFeesten();
      const f = F.komt;
      const naam = (x) => T.FEESTEN[x.id].naam;
      return {
        komt: f ? { feest: naam(f), op: T.datumVanDag(f.dag).tekst, heel: f.heel, midden: f.midden && `${f.midden.x},${f.midden.y}`, nu: !!T.feestOp(D, S.kalender.dag) } : null,
        boom: F.boom ? { soort: F.boom.soort || 'meiboom', staat: `${F.boom.x},${F.boom.y}`, tot: T.datumVanDag(F.boom.tot).tekst } : null,
        gevierd: F.gevierd.map((g) => `${naam(g)}, ${T.datumVanDag(g.dag).tekst}${g.heel ? ', de hele dag' : ', de avond'}`),
        vrij: T.vrijeDag(D, S.kalender.dag),
      };
    },
    // De verzoeken (js/verzoeken.js; werklijst vraag 103): wat het dorp nu zou willen bouwen en waarom, wie er nu om vraagt
    // en waar, je oproepen, en waar je nee op zei. Spel.debug.verzoek('nu') laat het eerste nu vragen (wie het vraagt,
    // zoekt je meteen); ('oproep', 'weverij') hangt een oproep op of haalt hem weg; ('jij') of ('mensen') zet de spelregel
    // "Wie bouwt".
    verzoek(wat, soort) {
      const D = S.dorp;
      if (wat === 'oproep') return T.doeOproep(D, soort);
      if (wat === 'jij' || wat === 'mensen') T.VERZOEKEN_INSTELLINGEN.mensen = wat === 'mensen';
      if (wat === 'nu') {
        const V = D.voorvallen || (D.voorvallen = T.nieuweVoorvallen());
        if (V.lopend) T.voorvalBeantwoord(D, V.lopend.id);
        if (D.verzoeken) D.verzoeken.volgende = 0;
        const dag = Math.floor(S.kalender.dag);
        if (!T.beginBouwverzoek(D, dag)) return 'Er is nu niets wat iemand wil bouwen (en kan betalen).';
        V.lopend.vanaf = S.kalender.dag;
      }
      const L = D.voorvallen && D.voorvallen.lopend;
      const R = D.verzoeken || T.nieuweVerzoeken();
      return {
        wieBouwt: T.VERZOEKEN_INSTELLINGEN.mensen ? 'de mensen' : 'jij',
        watTeBouwen: T.watTeBouwen(D).map((x) => `${x.soort}: ${x.waarom}`),
        nu: L && L.bouw ? `${T.naamVanBewoner(L.wie)} wil een ${T.GEBOUWEN[L.bouw.soort].naam} op ${L.bouw.x},${L.bouw.y}: "${T.vulWoordenIn(D, T.GESPREKKEN[L.id].knopen.begin.tekst[0].zeg)}"` : null,
        volgende: R.volgende,
        oproepen: (R.oproepen || []).map((o) => `${o.soort}, sinds ${T.datumVanDag(o.dag).tekst}`),
        nee: Object.entries(R.nee).map(([s2, dag]) => `${s2} op ${T.datumVanDag(dag).tekst}`),
        ja: R.ja,
        meesters: (D.gebouwen || []).filter((g) => g.meester).map((g) => `${T.GEBOUWEN[g.soort].naam}: ${T.naamVanBewoner(g.meester)}`),
      };
    },
    // De ondernemers (js/ondernemers.js; werklijst vraag 104): wie wat wil beginnen, of hij het nu zou vragen, wat hij
    // onthoudt (nee, ja), en de wapens in het dorp. Spel.debug.ondernemers('wapens') laat de eerste die wapens wil het nu
    // vragen, alsof de rovers net kwamen (in een dorp: Spel.debug.trede('dorp')); ('herberg') de eerste die een tweede
    // herberg wil (vanaf T.ONDERNEMERS_INSTELLINGEN.herberg.vanaf mensen).
    ondernemers(wat) {
      const D = S.dorp;
      const dag = Math.floor(S.kalender.dag);
      const mensen = (D.bewoners ? D.bewoners.mensen : []).filter((p) => T.ondernemingVan(D, p));
      const eerste = (wil) => mensen.find((p) => T.ondernemingVan(D, p) === wil);
      const o = T.ONDERNEMINGEN[wat];
      if (o) {
        if (!eerste(wat)) return `Niemand in dit dorp wil dat (een ander zaad geeft andere ondernemers).`;
        if (!T.magGebouwd(D, o.soort)) return `Een ${T.GEBOUWEN[o.soort].naam} mag pas in een ${T.GEBOUWEN[o.soort].trede}: Spel.debug.trede('${T.GEBOUWEN[o.soort].trede}').`;
        if (wat === 'wapens') (D.rovers || (D.rovers = T.nieuweRovers())).laatsteAanval = dag;
        if (!o.wil(D, dag, eerste(wat))) return 'Hij wil het nu niet (de herberg: pas vanaf T.ONDERNEMERS_INSTELLINGEN.herberg.vanaf mensen, met één herberg).';
        const V = D.voorvallen || (D.voorvallen = T.nieuweVoorvallen());
        if (V.lopend) T.voorvalBeantwoord(D, V.lopend.id);
        if (D.verzoeken) {
          D.verzoeken.volgende = 0;
          delete D.verzoeken.nee[o.soort];
        }
        if (!T.beginBouwverzoek(D, dag) || V.lopend.bouw.eigen !== wat) return 'Er kwam iets anders tussen, of het dorp kan het niet betalen.';
        V.lopend.vanaf = S.kalender.dag;
      }
      const E = (D.verzoeken && D.verzoeken.eigen) || {};
      return {
        ondernemers: mensen.map((p) => {
          const wil = T.ondernemingVan(D, p);
          const o = T.ONDERNEMINGEN[wil];
          const e = E[p.id];
          const nu = !T.magGebouwd(D, o.soort) ? `pas in een ${T.GEBOUWEN[o.soort].trede}` : o.wil(D, dag, p) ? 'zou het nu vragen' : 'wil het nu niet';
          const onthoudt = e ? `, ${e.nee}× nee${e.ja != null ? `, ja op ${T.datumVanDag(e.ja).tekst}` : ''}` : '';
          return `${T.naamVanBewoner(p)} (${p.huis ? T.GEBOUWEN[p.huis.soort].naam : 'zonder huis'}): ${wil}, ${nu}${onthoudt}`;
        }),
        wapens: T.wapensInHetDorp(D),
        herbergen: T.herbergenVan(D).map((g) => `${g.x},${g.y}${g.meester ? ` (${T.naamVanBewoner(g.meester)})` : ''}${g.weigert && S.kalender.dag < g.weigert.tot ? `: ${g.weigert.waarom}, tot ${T.datumVanDag(g.weigert.tot).tekst}` : ''}`),
      };
    },
    // Het weer (js/weer.js; werklijst vraag 77, stap 2): het weer van vandaag, hoe lang het droog is, het watertekort, de
    // droogte en wat die de oogst kost, de beekjes en de vissers. Spel.debug.weer('regen') zet het weer van vandaag
    // ('zon', 'wolken', 'regen' of 'sneeuw'), ('droogte') maakt het nu droog, ('ernstig') ernstig droog, ('nat') maakt er
    // een eind aan.
    weer(wat, laag) {
      const D = S.dorp;
      if (!T.WEER_INSTELLINGEN.aan) return 'De spelregel "Het weer" staat op "Altijd zon".';
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
        vandaag: T.WEER_NAMEN[W.vandaag], droog: `${W.droog} ${W.droog === 1 ? 'dag' : 'dagen'} geen regen`, tekort: `${W.tekort} (droogte vanaf ${I.droogteVanaf}, ernstig vanaf ${I.ernstigVanaf})`,
        droogte: ['geen', 'droogte', 'ernstige droogte'][T.droogteNiveau(D)], oogst: `${Math.round((1 - T.droogteFactor(D)) * 100)}% minder dit jaar`,
        nat: `dit jaar ${Math.round(T.natVanJaar(D, Math.floor(S.kalender.dag)) * 100)}% van de gewone regen`,
        beekjes: `${T.beekTegels(D.wereld).length} tegels${W.beekDroog ? ', droog' : ''}`,
        sneeuw: `${Math.round((W.sneeuw || 0) * 100)}% van de grond wit`,
        vissers: D.gebouwen.filter((g) => g.soort === 'visser').map((g) => `${g.x},${g.y}: ${Math.round(T.visserWater(D, g) * 100)}% van zijn water`),
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
        marskramer: D.marskramer ? (D.marskramer.bestelling ? { op: 'bestelling', heeft: D.marskramer.heeft, prijzen: D.marskramer.bestelling } : 'op zijn ronde') : null,
      };
    },
    // De brand (js/brand.js; werklijst vraag 144, 3): het brandgevaar, en welke huizen branden, in puin liggen of op hout
    // wachten. Spel.debug.brand('nu') laat de brand nu beginnen (zoals Spel.debug.voorval('brand')), ('puin') laat wat
    // brandt nu afbranden, ('herbouw') laat wat in puin ligt nu weer opbouwen (als er hout is).
    brand(wat) {
      const D = S.dorp;
      if (wat === 'nu') {
        const r = this.voorval('brand');
        if (typeof r === 'string') return r;
        T.werkBrandBij(S, D);
      }
      for (const g of T.brandendeHuizen(D)) {
        if (wat === 'puin' && g.brand.fase === 'brandt') g.brand.sinds -= T.BRAND_INSTELLINGEN.brandUren / 24 + 0.01;
        if (wat === 'puin') g.brand.antwoord = null;
        if (wat === 'herbouw' && g.brand.fase === 'puin') g.brand.sinds -= T.BRAND_INSTELLINGEN.puinDagen + 1;
      }
      if (wat === 'puin') T.werkBrandBij(S, D);
      if (wat === 'herbouw') T.tikBrandDag(D, Math.floor(S.kalender.dag));
      const niveau = T.brandgevaarNiveau(D);
      return {
        gevaar: ['geen', 'brandgevaar', 'groot brandgevaar'][niveau],
        redKans: `${Math.round(T.redKans(D) * 100)} van de 100`,
        huizen: T.brandendeHuizen(D).map((g) => ({
          huis: `${g.soort} op ${g.x},${g.y}`, fase: g.brand.fase, sinds: T.uurTekst(g.brand.sinds), antwoord: g.brand.antwoord || null,
          wachtOpHout: !!g.brand.wacht, hout: T.herbouwHout(g),
        })),
      };
    },
    // De koorts (js/koorts.js; werklijst vraag 144, 3): wie er ziek is en tot wanneer, wie het had, en hoe snel ze overgaat.
    // Spel.debug.koorts('nu') laat de koorts nu beginnen (het voorval, en de nacht erna).
    koorts(wat) {
      const D = S.dorp;
      if (wat === 'nu') {
        const r = this.voorval('ziekte');
        if (typeof r === 'string') return r;
        T.tikKoortsDag(D, Math.floor(S.kalender.dag));
      }
      const K = D.koorts;
      return K
        ? {
          niveau: ['geen', 'koorts', 'epidemie'][T.koortsNiveau(D)], sinds: T.datumVanDag(K.sinds).tekst, maat: K.maat,
          ziek: T.zieken(D).map((p) => `${T.naamVanBewoner(p)} (${p.leeftijd}), tot ${T.datumVanDag(p.ziek).tekst}`), gehad: K.gehad.length,
        }
        : 'Er is geen koorts.';
    },
    // De twee bazen (js/bazen.js; werklijst vraag 106): de gunst van de heer en het vertrouwen van het dorp, hoe ze erbij
    // staan, waarom, en of je al gewaarschuwd bent. Spel.debug.bazen('gunst', 15) zet de gunst op 15 (met de
    // waarschuwing als hij onder de grens komt), ('vertrouwen', 0) jaagt je weg als je al gewaarschuwd was.
    bazen(welk, n) {
      const D = S.dorp;
      const b = T.bazenNu(D);
      if (!b) return 'De spelregel "Twee bazen" staat uit, of hier komt geen heer.';
      if ((welk === 'gunst' || welk === 'vertrouwen') && typeof n === 'number') {
        (welk === 'gunst' ? T.wijzigGunst : T.wijzigVertrouwen)(D, n - b[welk], 'Spel.debug');
      }
      const nu = T.bazenNu(D) || b;
      return {
        gunst: `${Math.round(nu.gunst)} (${T.bazenStemming(nu.gunst)})`,
        vertrouwen: `${Math.round(nu.vertrouwen)} (${T.bazenStemming(nu.vertrouwen)})`,
        waarom: D.bazen.waarom,
        gewaarschuwd: D.bazen.gewaarschuwd,
        betrapt: T.BAZEN_INSTELLINGEN.betrapt,
        einde: D.einde,
      };
    },
    // De grillen van de heer (js/grillen.js; werklijst vraag 106, stap 2): welke er op je antwoord wacht, welke er waren,
    // en hoe vaak je antwoordde of zweeg. Spel.debug.gril('standbeeld') laat die nu komen, met zijn brief (zonder naam
    // een gelote uit wat kan).
    gril(id) {
      const D = S.dorp;
      if (!T.bazenTellen(D)) return 'De spelregel "Twee bazen" staat uit, of hier komt geen heer.';
      const G = D.grillen || (D.grillen = T.nieuweGrillen());
      if (id !== undefined) {
        if (id && !T.GRILLEN[id]) return `Die gril bestaat niet. Wel: ${Object.keys(T.GRILLEN).join(', ')}.`;
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
    // Het eind (js/einde.js): het doel, hoeveel dagen op rij iedereen gelukkig is, en het jaarboek tot nu.
    // Spel.debug.einde('winst') zet de teller op één dag voor het eind (de volgende nacht wint het, als iedereen dan
    // gelukkig is); ('gewonnen') wint nu, met het feest en het eindscherm; ('jaarverslag') maakt het verslag nu en
    // toont het.
    einde(wat) {
      const D = S.dorp;
      const dag = Math.floor(S.kalender.dag);
      const E = D.eind || (D.eind = { dagen: 0, beste: 0, gewonnen: null });
      if (wat === 'winst') E.dagen = T.EINDE_INSTELLINGEN.dagen - 1;
      if (wat === 'gewonnen' && !E.gewonnen) {
        E.dagen = T.EINDE_INSTELLINGEN.dagen;
        E.gewonnen = { dag, getoond: false };
        T.vierVandaag(D, 'stad', dag);
      }
      if (wat === 'jaarverslag') {
        D.jaarverslag = { dag, regels: T.jaarverslagRegels(D, D.jaarboek || { begin: dag, mensen: D.bevolking, kwamen: 0, stierven: 0, weg: 0, doorgegroeid: 0, gelukkig: 0, gemist: {} }, dag) };
        T.ui.toonBrief(D, 'jaarverslag');
      }
      return {
        doel: T.eindDoel(D) || `eerst nog een trede: ${T.volgendeTrede(D)}`,
        iedereenGelukkig: T.iedereenGelukkig(D),
        dagenOpRij: `${E.dagen} van ${T.EINDE_INSTELLINGEN.dagen} (de langste reeks: ${E.beste})${E.mis ? `, staat ${E.mis} ${E.mis === 1 ? 'dag' : 'dagen'} stil (er mogen ${T.EINDE_INSTELLINGEN.magMissen})` : ''}`,
        gewonnen: E.gewonnen && `${T.datumVanDag(E.gewonnen.dag).tekst}${E.gewonnen.getoond ? ', getoond' : ''}`,
        jaarboek: D.jaarboek,
        laatsteJaarverslag: D.jaarverslag && D.jaarverslag.regels,
      };
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
      return T.ui.vensterOpen() === 'slachten' ? 'open' : 'Er is geen vee om te slachten.';
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
      const doek = T.debug.beeld();
      const blob = await new Promise((klaar) => doek.toBlob(klaar, 'image/png'));
      const r = await fetch('/gereedschap/api/schermafdruk/' + encodeURIComponent(naam), { method: 'POST', body: blob });
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
      const noem = (l) => l.map((v) => `${v.pad}: ${v.b}×${v.h}, ${mb(v.mb)} MB`);
      return {
        samen: som(lijst), vellen: lijst.length, laadt: T.sprites.bezig(), mist: T.sprites.mist.slice(),
        perMap: Object.fromEntries(Object.entries(perMap).map(([map, l]) => [map, `${som(l)} MB in ${l.length}`])),
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
      T.tekenBeeld();
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
