// De doorkijk (ontwerp/beeld.md, "Doorkijk"): wie je hoort te zien, zie je ook als er een boom of een
// huis voor staat. Per beeld zoekt T.werkDoorkijkBij welk hoog voorwerp zo iemand bedekt. Een boom van
// de bosrand valt dan weg; elk ander hoog voorwerp blijft staan en krijgt een kijkgat
// (T.tekenKijkgat), een zacht rond venster waarin opnieuw getekend wordt wat erachter ligt.
// js/tekenen.js vraagt het allebei aan: T.werkDoorkijkBij voor het beeld, T.tekenKijkgat na het
// tekenen van het voorwerp. Tot 26 sep stond dit midden in js/tekenen.js (vraag 25, D, in
// ontwerp/werklijst.md).
//
// Buiten staan er dingen die hoger zijn dan een muur binnen: een eik is driehonderd pixels, een huis
// met twee lagen nog meer. Wie erachter loopt, is weg — en wat erger is: een wolf die jou wél ziet,
// zie jij dan niet. Dus wordt alles wat de schout of een wezen bedekt zolang doorzichtig.
//
// Waarom doorzichtig en niet het silhouet van de figuur eroverheen: onze pixel art heeft zijn eigen
// omlijning van één pixel en leeft van textuur (ontwerp/beeld.md). Een egale vlek over een boom heen
// is een tweede beeldtaal, en je ziet er niet aan wáár je staat. Een boom die half wegvalt laat de
// schout én de boom zien, en dat is ook wat Fallout en Baldur's Gate doen.
(function (T) {
  'use strict';

  T.DOORKIJK_INSTELLINGEN = {
    // Hoe ver v.doorkijk zakt als het voorwerp iemand bedekt (1 is gewoon). Een gebouw of boom vervaagt
    // daar niet meer door, maar krijgt een kijkgat, even sterk als hij gezakt is.
    dekking: 0.4,
    // De bosrand (zie "het bos om de kaart heen" in js/tekenen.js) staat op een hoek van de kaart soms
    // met twee dichte randen tegelijk om de schout heen, en dan bedekken tien, twintig bomen hem
    // allemaal tegelijk. Doorzichtigheid stapelt vermenigvuldigend (twee bomen op 0.4 laten samen nog
    // maar 0.16 van de schout zien, bij twintig is dat allang niets meer), dus een kleine waarde lost
    // dat niet op — hoe laag ook, met genoeg bomen erbovenop verdwijnt hij toch. Eén los ding mag
    // zichtbaar blijven doorschemeren; een heel woud aan verwisselbare achtergrondbomen niet: die
    // vallen daarom helemaal weg zolang ze de schout bedekken, in plaats van te vervagen.
    bosrandDekking: 0,
    tijd: 0.18, // seconden om op en af te lopen, zodat het niet klappert
    hoogGenoeg: 40, // hoger dan dit boven zijn voet: dan kan er iemand achter verdwijnen
    // Een gebouw (geen bosrand) vervaagt niet meer als geheel: dat zag er bij een rieten dak uit als
    // een doorzichtig geelgroen spook (Marcel, 23 sep 2026). In plaats daarvan blijft het huis gewoon
    // staan en tekenen we wie erachter loopt nog eens overheen, door een zachte cirkel — een kijkgat.
    // kijkgatOmhoog tilt het midden van die cirkel van zijn voeten naar zijn romp, zodat een heel
    // figuur er ongeveer in past.
    kijkgatStraal: 58,
    kijkgatOmhoog: 28,
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

  // Per beeld: welk hoog voorwerp bedekt iemand die je hoort te zien? Alleen voorwerpen die ná
  // dat wezen getekend worden kunnen hem verbergen, en dat weten we al uit de diepte.
  // Wie moet er door een boom of een huis heen te zien zijn? De schout altijd. Verder alleen wie er
  // toe doet op dit moment: wat meevecht, wat je net ontdekt heeft (het uitroepteken), en wie je
  // aanspreekt. Een wolf die in zijn eentje achter een huis rondscharrelt hoeft het huis niet
  // doorzichtig te maken — dan sta je ervoor en zie je hem wegvallen zonder te weten waarom.
  function teltMee(S, e) {
    if (e.binnen) return false; // wie slaapt of binnen is, zie je niet door een dak heen
    if (e === S.schout) return true;
    if (e.dood) return false;
    if (e.alarm > 0) return true;
    if (S.gevecht && S.gevecht.volgorde.includes(e)) return true;
    if (S.overgang && S.overgang.aanleiding === e) return true;
    return S.spreektMet === e;
  }

  T.werkDoorkijkBij = function (S, dt, voorwerpen) {
    const I = T.DOORKIJK_INSTELLINGEN;
    const w = S.wereld;
    const wezens = [];
    for (const e of w.wezens) {
      if (!teltMee(S, e)) continue;
      wezens.push({ e, tx: e.tx, ty: e.ty, doos: wezenDoos(e) });
    }
    for (const v of voorwerpen) {
      const doos = voorwerpDoos(v);
      let bedekt = false;
      const dekkers = [];
      if (doos) {
        // Bedekken kan alleen als dít voorwerp ná het wezen getekend wordt, dus als het wezen niet
        // vóór het gebouw staat — T.staatVoorGebouw (js/tekenen.js), dezelfde vraag als de
        // tekenvolgorde.
        for (const kandidaat of wezens) {
          if (T.staatVoorGebouw(kandidaat.tx, kandidaat.ty, v)) continue; // staat ervóór, verdwijnt niet
          if (raakt(doos, kandidaat.doos)) {
            bedekt = true;
            dekkers.push(kandidaat.e);
          }
        }
      }
      // Alleen overschrijven als er nu iemand bedekt wordt: tijdens het wegdoezelen (v.doorkijk
      // loopt terug naar 1) blijft T.tekenKijkgat zo de laatst bekende dekker nog even overtekenen,
      // dezelfde afweging als bosrandOp in js/tekenen.js ("kan alleen vloeiend als het dezelfde
      // blijft").
      if (dekkers.length) v.kijkgat = dekkers;
      const doel = bedekt ? (v.bosrand ? I.bosrandDekking : I.dekking) : 1;
      const nu = v.doorkijk == null ? 1 : v.doorkijk;
      const stap = dt / I.tijd;
      v.doorkijk = doel > nu ? Math.min(doel, nu + stap) : Math.max(doel, nu - stap);
    }
  };

  // Eén klein vlak, hergebruikt over alle kijkgaten en alle beelden heen (net als de grondbuffer in
  // js/tekenen.js): er staat maar zelden meer dan één figuur tegelijk in een kijkgat, dus volstaat
  // één canvas dat per figuur opnieuw beschreven en meteen overgeplakt wordt.
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
  // sterkte (0..1) is hoever v.doorkijk al opgelopen is naar zijn doel, zodat het kijkgat net zo
  // vloeiend in- en uitfaadt als de oude doorzichtigheid deed.
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
})(globalThis.Spel = globalThis.Spel || {});
