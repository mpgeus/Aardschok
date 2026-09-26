// De doorkijk (ontwerp/beeld.md, "Doorkijk"): wie je hoort te zien, zie je ook als er een boom of een
// huis voor staat. Per beeld zoekt T.werkDoorkijkBij welk hoog voorwerp zo iemand bedekt, en zet op dat
// voorwerp hoe ver je erdoorheen kijkt (v.doorkijk, van 0 tot 1). js/tekenen.js tekent het dan:
//   - een boom van de bosrand valt weg;
//   - elk ander hoog voorwerp blijft staan en krijgt een kijkgat (T.tekenKijkgat), een zacht rond
//     venster waarin opnieuw getekend wordt wat erachter ligt;
//   - of, als de spelregels dat zeggen, het hele voorwerp gaat om de andere pixel open, het raster
//     (T.tekenGerasterd).
// Tot 26 sep stond dit midden in js/tekenen.js (vraag 25, D, in ontwerp/werklijst.md).
//
// Buiten staan er dingen die hoger zijn dan een muur binnen: een eik is driehonderd pixels, een huis
// met twee lagen nog meer. Wie erachter loopt, is weg — en wat erger is: een wolf die jou wél ziet,
// zie jij dan niet.
//
// Waarom geen silhouet van de figuur eroverheen: onze pixel art heeft zijn eigen omlijning van één
// pixel en leeft van textuur (ontwerp/beeld.md). Een egale vlek over een boom heen is een tweede
// beeldtaal, en je ziet er niet aan wáár je staat. En waarom een huis niet gewoon half doorzichtig: dat
// zag er bij een rieten dak uit als een geelgroen spook (Marcel, 23 sep 2026).
(function (T) {
  'use strict';

  T.DOORKIJK_INSTELLINGEN = {
    // Hoe je door een hoog voorwerp heen kijkt: 'venster' (het kijkgat) of 'raster'. Marcel wilde
    // allebei als keuze in de spelregels (26 sep, vraag 34; js/opties.js). Het raster mengt in het oog
    // toch een beetje (ontwerp/beeld.md, "De proef"), daarom is het venster de standaard.
    manier: 'venster',
    // Zie je door een huis heen ook iedereen die op het plein staat (T.zichtbaarDoor)? Ook een keuze.
    plein: true,
    tijd: 0.18, // seconden om op en af te lopen, zodat het niet klappert
    hoogGenoeg: 40, // hoger dan dit boven zijn voet: dan kan er iemand achter verdwijnen
    // Het kijkgat is een zachte cirkel rond wie erachter staat. kijkgatOmhoog tilt het midden van die
    // cirkel van zijn voeten naar zijn romp, zodat een heel figuur er ongeveer in past.
    kijkgatStraal: 58,
    kijkgatOmhoog: 28,
    // Hoe groot een vakje van het raster is, in pixels van de kunst: 1 is om de andere pixel. Op het
    // scherm wordt dat afgerond op hele pixels (T.tekenGerasterd).
    rasterCel: 1,
  };

  // Wie je door een hoog voorwerp heen hoort te zien: 'alles' (door een boom en door een huis heen),
  // 'huis' (alleen door een huis heen) of null (dan verdwijnt hij erachter, zoals je verwacht).
  // De schout altijd. Verder wie ertoe doet: wat meevecht, wat je net ontdekt heeft (het
  // uitroepteken), wie je aanspreekt, en de bezoekers, die voor jou komen (de heer, de marskramer, de
  // inner, de soldaten: `bezoeker` in js/mensen.js). En door een huis ook iedereen op het plein, want
  // het plein is het hart van het dorp (Marcel, 26 sep, vraag 34; een keuze in de spelregels). Door een
  // boom niet: dan zaten de vijf eiken op het plein vol gaten zolang de kinderen er spelen. Een wolf die
  // in zijn eentje achter een huis rondscharrelt, maakt het huis niet doorzichtig — dan sta je ervoor
  // en zie je hem wegvallen zonder te weten waarom.
  T.zichtbaarDoor = function (S, e) {
    if (e.binnen) return null; // wie slaapt of binnen is, zie je niet door een dak heen
    if (e === S.schout) return 'alles';
    if (e.dood) return null;
    if (e.alarm > 0) return 'alles';
    if (S.gevecht && S.gevecht.volgorde.includes(e)) return 'alles';
    if (S.overgang && S.overgang.aanleiding === e) return 'alles';
    if (S.spreektMet === e) return 'alles';
    const mens = e.wie && T.MENSEN && T.MENSEN[e.wie];
    if (mens && mens.bezoeker) return 'alles';
    if (T.DOORKIJK_INSTELLINGEN.plein && T.opHetPlein(S.wereld, e.tx, e.ty)) return 'huis';
    return null;
  };

  // De doos die een wezen op het scherm inneemt, ruim genomen: zijn lijf plus wat lucht.
  function wezenDoos(e) {
    const p = T.naarScherm(e.x, e.y);
    const h = T.metSprites() ? T.sprites.hoogte(e.soort) : 52;
    return { x0: p.x - 15, x1: p.x + 15, y0: p.y - h - 6, y1: p.y + 6 };
  }

  // De doos die het beeld van een voorwerp inneemt, rond het midden van zijn eigen tegel. Elke
  // tegel draagt zijn eigen maat (`doos`: links, boven, rechts, onder vanaf het ankerpunt), want
  // een cel is voor alle tegels van een vel even groot maar een bank is geen waslijn. Zonder die
  // maat valt het terug op de cel. Dit gaat op de voettegel en de maat van het beeld, niet op
  // pixels: genoeg om te weten of er iemand achter kan staan.
  function voorwerpDoos(v) {
    const vel = T.TEGELS && T.TEGELS[v.vel];
    const tegel = vel && vel.tiles[v.id];
    if (!vel) return null;
    const a = vel.anker || [Math.round(vel.tegelB / 2), Math.round(vel.tegelH / 2)];
    const d = (tegel && tegel.doos) || [a[0], a[1], vel.tegelB - a[0], vel.tegelH - a[1]];
    if (d[1] < T.DOORKIJK_INSTELLINGEN.hoogGenoeg) return null; // laag spul verbergt niemand
    const p = T.naarScherm(v.x, v.y);
    return { x0: p.x - d[0], x1: p.x + d[2], y0: p.y - d[1], y1: p.y + d[3] };
  }

  const raakt = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

  // Per beeld: welk hoog voorwerp bedekt iemand die je hoort te zien? Bedekken kan alleen als het
  // voorwerp ná hem getekend wordt, dus als hij niet vóór het voorwerp staat: T.staatVoorGebouw
  // (js/tekenen.js), dezelfde vraag als de tekenvolgorde. v.doorkijk loopt dan in `tijd` seconden op
  // naar 1, en weer terug naar 0 als niemand meer bedekt wordt.
  T.werkDoorkijkBij = function (S, dt, voorwerpen) {
    const I = T.DOORKIJK_INSTELLINGEN;
    const doorAlles = [];
    const doorHuis = [];
    for (const e of S.wereld.wezens) {
      const door = T.zichtbaarDoor(S, e);
      if (door) (door === 'alles' ? doorAlles : doorHuis).push({ e, doos: wezenDoos(e) });
    }
    for (const v of voorwerpen) {
      const doos = voorwerpDoos(v);
      const dekkers = [];
      if (doos) {
        const zoek = (kandidaten) => {
          for (const k of kandidaten) {
            if (T.staatVoorGebouw(k.e.tx, k.e.ty, v)) continue; // staat ervóór, verdwijnt niet
            if (raakt(doos, k.doos)) dekkers.push(k.e);
          }
        };
        zoek(doorAlles);
        if (T.isGebouw(v)) zoek(doorHuis);
      }
      // Alleen overschrijven als er nu iemand bedekt wordt: tijdens het wegdoezelen (v.doorkijk
      // loopt terug naar 0) blijft T.tekenKijkgat zo de laatst bekende dekker nog even overtekenen,
      // dezelfde afweging als bosrandOp in js/tekenen.js ("kan alleen vloeiend als het dezelfde
      // blijft").
      if (dekkers.length) v.kijkgat = dekkers;
      const doel = dekkers.length ? 1 : 0;
      const nu = v.doorkijk || 0;
      const stap = I.tijd > 0 ? dt / I.tijd : 1; // tijd 0 (in de werkbank): meteen open en dicht
      v.doorkijk = doel > nu ? Math.min(doel, nu + stap) : Math.max(doel, nu - stap);
    }
  };

  // ---------------------------------------------------------------- het kijkgat

  // Eén klein vlak, hergebruikt over alle kijkgaten en alle beelden heen (net als de grondbuffer in
  // js/tekenen.js): per figuur wordt het opnieuw beschreven en meteen overgeplakt, dus volstaat één.
  let kijkgatCv = null;
  let kijkgatCx = null;
  function kijkgatBuffer(maat) {
    if (!kijkgatCv) {
      kijkgatCv = document.createElement('canvas');
      kijkgatCx = kijkgatCv.getContext('2d');
    }
    if (kijkgatCv.width !== maat || kijkgatCv.height !== maat) {
      kijkgatCv.width = maat;
      kijkgatCv.height = maat;
    }
    return kijkgatCx;
  }

  // Het "kijkgat": een venster in gebouw v, dat e bedekt (tekenVoorwerp in js/tekenen.js). Binnen een
  // zachte cirkel rond zijn romp komt opnieuw wat achter het gebouw ligt: de grond (de grondbuffer,
  // werkGrondBij in js/tekenen.js), en wie daar staat, van achter naar voor. Zo kijk je door het dak
  // heen de straat in. Tot 26 sep kwam alleen de figuur zelf terug, met het dak eromheen, en dan leek
  // hij óp het dak te staan (Marcel: "In al je plaatjes staan er mensen op het dak van huizen").
  // sterkte (0..1) is v.doorkijk, zodat het kijkgat vloeiend in- en uitfaadt.
  T.tekenKijkgat = function (ctx, S, e, sterkte, v) {
    if (typeof document === 'undefined') return;
    const I = T.DOORKIJK_INSTELLINGEN;
    const p = T.naarScherm(e.x, e.y);
    const mx = p.x;
    const my = p.y - I.kijkgatOmhoog;
    const pad = 12;
    const maat = (I.kijkgatStraal + pad) * 2;
    const ox = Math.round(mx - maat / 2);
    const oy = Math.round(my - maat / 2);
    const bx = kijkgatBuffer(maat);
    bx.setTransform(1, 0, 0, 1, 0, 0);
    bx.clearRect(0, 0, maat, maat);
    bx.imageSmoothingEnabled = false;
    bx.setTransform(1, 0, 0, 1, -ox, -oy);
    const grond = S.grond;
    if (grond && grond.canvas) bx.drawImage(grond.canvas, grond.vx, grond.vy);
    const ver = I.kijkgatStraal + 20;
    const erin = S.wereld.wezens.filter((o) => {
      if (o.dood || (o.binnen && !T.deurStap(S, o))) return false;
      if (o !== e && v && T.staatVoorGebouw(o.tx, o.ty, v)) return false;
      const q = T.naarScherm(o.x, o.y);
      return Math.hypot(q.x - mx, q.y - I.kijkgatOmhoog - my) < ver;
    });
    erin.sort((a, b) => a.x + a.y - (b.x + b.y));
    for (const o of erin) T.tekenWezen(bx, S, o);
    bx.setTransform(1, 0, 0, 1, 0, 0);
    bx.globalCompositeOperation = 'destination-in';
    const g = bx.createRadialGradient(mx - ox, my - oy, 0, mx - ox, my - oy, I.kijkgatStraal);
    g.addColorStop(0, `rgba(0,0,0,${sterkte})`);
    g.addColorStop(0.65, `rgba(0,0,0,${sterkte})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    bx.fillStyle = g;
    bx.fillRect(0, 0, maat, maat);
    bx.globalCompositeOperation = 'source-over';
    ctx.drawImage(kijkgatCv, 0, 0, maat, maat, ox, oy, maat, maat);
  };

  // ---------------------------------------------------------------- het raster

  // Het raster (Marcel, 26 sep: "Raster ook als keuze"): het hele voorwerp gaat om de andere pixel
  // open, als een dambord, en door de gaten zie je wat erachter staat. Het voorwerp komt eerst in een
  // los vlak, op de pixels van het doek, en daar gaat het dambord uit. Op de pixels van het doek en
  // niet op die van de kunst: de zoom is vaak geen heel getal (1,67 op een scherm van 1600 breed), en
  // dan zou een dambord in de kunst na het vergroten ongelijke vakjes krijgen, met strepen erdoor.
  // Het dambord hangt wel aan de wereld (het punt 0,0 van de kaart), niet aan het scherm, zodat het
  // meeschuift met het huis als de camera glijdt, in plaats van eroverheen te kruipen.
  let rasterCv = null;
  let rasterCx = null;
  const damborden = new Map(); // per maat van een vakje: een tegeltje van twee bij twee vakjes
  function dambord(cel) {
    let c = damborden.get(cel);
    if (!c) {
      c = document.createElement('canvas');
      c.width = c.height = cel * 2;
      const x = c.getContext('2d');
      x.fillRect(0, 0, cel, cel);
      x.fillRect(cel, cel, cel, cel);
      damborden.set(cel, c);
    }
    return c;
  }

  // Tekent stuk (een cel van een vel, js/sprites.js) met zijn anker op (px, py), zoals
  // T.sprites.teken, maar met het dambord eruit. sterkte (0..1) is v.doorkijk: zo ver staan de gaten
  // open, zodat ook het raster vloeiend in- en uitfaadt.
  T.tekenGerasterd = function (ctx, stuk, px, py, helder, sterkte) {
    if (typeof document === 'undefined') return;
    const m = ctx.getTransform(); // van de vlakte naar de pixels van het doek: zoom en camera
    const x0 = Math.round(px - stuk.ax);
    const y0 = Math.round(py - stuk.ay);
    const dx0 = Math.floor(m.a * x0 + m.e);
    const dy0 = Math.floor(m.d * y0 + m.f);
    const b = Math.ceil(m.a * (x0 + stuk.b) + m.e) - dx0;
    const h = Math.ceil(m.d * (y0 + stuk.h) + m.f) - dy0;
    if (b <= 0 || h <= 0) return;
    if (!rasterCv) {
      rasterCv = document.createElement('canvas');
      rasterCx = rasterCv.getContext('2d');
    }
    if (rasterCv.width < b || rasterCv.height < h) {
      rasterCv.width = Math.max(rasterCv.width, b);
      rasterCv.height = Math.max(rasterCv.height, h);
    }
    const bx = rasterCx;
    bx.setTransform(1, 0, 0, 1, 0, 0);
    bx.clearRect(0, 0, b, h);
    bx.imageSmoothingEnabled = false;
    bx.setTransform(m.a, 0, 0, m.d, m.e - dx0, m.f - dy0);
    T.sprites.teken(bx, stuk, px, py, helder);
    bx.setTransform(1, 0, 0, 1, 0, 0);
    const cel = Math.max(1, Math.round(m.a * T.DOORKIJK_INSTELLINGEN.rasterCel));
    const n = cel * 2;
    const rest = (a) => ((a % n) + n) % n;
    const patroon = bx.createPattern(dambord(cel), 'repeat');
    patroon.setTransform(new DOMMatrix([1, 0, 0, 1, -rest(dx0 - Math.round(m.e)), -rest(dy0 - Math.round(m.f))]));
    bx.globalCompositeOperation = 'destination-out';
    bx.globalAlpha = sterkte;
    bx.fillStyle = patroon;
    bx.fillRect(0, 0, b, h);
    bx.globalCompositeOperation = 'source-over';
    bx.globalAlpha = 1;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(rasterCv, 0, 0, b, h, dx0, dy0, b, h);
    ctx.restore();
  };
})(globalThis.Spel = globalThis.Spel || {});
