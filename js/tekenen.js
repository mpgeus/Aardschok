// Het beeld. Eerst alle vloeren, dan het gevechtsraster en de markeringen daarop, dan muren,
// deuren, voorwerpen en wezens van achter naar voor, en als laatste de effecten. De muren aan
// de voorkant van de kamer waar de held staat, worden laag getekend: zo kijk je de kamer in,
// zoals bij een poppenhuis. Kamers waar je niet bent, staan gedimd; kamers waar je nooit
// geweest bent, blijven donker.
//
// Er zijn twee manieren van tekenen. Staat de pixel art klaar (`beelden/`, zie js/sprites.js),
// dan komt alles wat de kunst dekt uit de vellen: vloeren, muren, deuren, voorwerpen, wezens,
// en de spreukeffecten (beelden/effecten/, zie "spreukeffecten in pixels" onderaan). Wat er niet
// in zit — het raster, het bereik, de richtlijn, de zwevende teksten en de pilaar — blijft
// getekend met vlakken. Met `Toren.debug.vlakken = true` gaat alles terug naar vlakken, om te
// vergelijken.
(function (T) {
  'use strict';

  const GEDIMD = 0.58;
  const HOOFD = '#e9c6a0';

  const metSprites = () => !!(T.sprites && T.sprites.aan) && !(T.debug && T.debug.vlakken);

  // Welke vloer ligt er in welke kamer? De hal en het trappenhuis hebben de zandvloer uit
  // kamers.cjs, de voorraadkamer de houten. Een deur krijgt de vloer van een kamer ernaast.
  const VLOERSOORT = { hal: 'zand', opslag: 'hout', trap: 'zand' };
  function vloerSoort(w, x, y) {
    const k = T.kamerVan(w, x, y);
    if (k) return VLOERSOORT[k.id] || 'zand';
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const b = T.kamerVan(w, x + dx, y + dy);
      if (b) return VLOERSOORT[b.id] || 'zand';
    }
    return 'zand';
  }

  // Een vast getal per tegel, zodat dezelfde muur elke keer dezelfde scheur heeft.
  const ruis = (x, y) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 1000;

  // ---------------------------------------------------------------- wat er in beeld is
  //
  // Binnen is de wereld twintig bij zestien tegels: dan kost het niets om alles elk beeld af te
  // lopen. Het erf is vier keer zo groot, en het bos en het dorp worden groter. Dus tekent het
  // spel alleen wat in beeld staat.
  //
  // De marges eromheen zijn er voor wat boven zijn eigen tegel uitsteekt: een boom is bijna
  // driehonderd pixels hoog en driehonderdvijftig breed, dus een boom wiens tegel net onder de
  // onderrand ligt, hangt nog wel in beeld.
  const MARGE = { links: 200, rechts: 200, boven: 80, onder: 320 };

  // De rechthoek die in beeld is, in de vlakte waarop getekend wordt (dus vóór het zoomen).
  function zichtVlak(S, bw, bh) {
    const halfB = bw / 2 / S.zoom;
    const halfH = bh / 2 / S.zoom;
    const cx = Math.round(S.camera.x);
    const cy = Math.round(S.camera.y);
    return { x0: cx - halfB, y0: cy - halfH, x1: cx + halfB, y1: cy + halfH };
  }

  // Welke tegels kunnen in die rechthoek iets tekenen? De ruit-projectie draait het raster, dus
  // nemen we de vier hoeken van de (opgerekte) rechthoek en het vak daaromheen.
  //
  // `marge` (in tegels) rekt de grens op waarop dat vak wordt afgeknipt: 0 (de gewone vloeren en
  // voorwerpen, die niet voorbij de kaart bestaan) knipt precies op de kaart, zoals altijd; de
  // bosrand hieronder telt zelf zoveel ringen mee als hij diep is.
  function tegelsIn(w, r, marge) {
    const m = marge || 0;
    const hoeken = [
      [r.x0 - MARGE.links, r.y0 - MARGE.boven],
      [r.x1 + MARGE.rechts, r.y0 - MARGE.boven],
      [r.x0 - MARGE.links, r.y1 + MARGE.onder],
      [r.x1 + MARGE.rechts, r.y1 + MARGE.onder],
    ];
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const [sx, sy] of hoeken) {
      const t = T.naarWereld(sx, sy);
      x0 = Math.min(x0, t.x);
      x1 = Math.max(x1, t.x);
      y0 = Math.min(y0, t.y);
      y1 = Math.max(y1, t.y);
    }
    return {
      x0: Math.max(-m, Math.floor(x0)),
      y0: Math.max(-m, Math.floor(y0)),
      x1: Math.min(w.b - 1 + m, Math.ceil(x1)),
      y1: Math.min(w.h - 1 + m, Math.ceil(y1)),
    };
  }
  const inVak = (v, x, y) => x >= v.x0 && x <= v.x1 && y >= v.y0 && y <= v.y1;

  // ---------------------------------------------------------------- de grond, één keer getekend
  //
  // De grond verandert alleen als de camera verschuift of als er iets zichtbaar wordt; de rest van
  // het beeld verandert elk beeld. Dus tekenen we de grond naar een eigen vlak dat een stuk ruimer
  // is dan het venster, en plakken die er daarna in één keer op. Pas als de camera buiten die rand
  // komt (of als er iets anders verandert), wordt hij opnieuw getekend.
  const BUFFERRAND = 192; // hoeveel ruimer dan het venster, in vlak-pixels

  function grondSleutel(S) {
    const w = S.wereld;
    const g = S.gevecht ? S.gevecht.kamers.size : -1;
    return `${w.gebied}|${w.huidigeKamer}|${w.bekend.size}|${g}|${metSprites() ? 1 : 0}|${Math.round(S.zoom * 100)}`;
  }

  function werkGrondBij(S, bw, bh, zicht, inBeeld) {
    if (!S.grond) S.grond = { canvas: null, ctx: null, vx: 0, vy: 0, b: 0, h: 0, sleutel: '' };
    const g = S.grond;
    const b = Math.ceil(bw / S.zoom) + BUFFERRAND * 2;
    const h = Math.ceil(bh / S.zoom) + BUFFERRAND * 2;
    const past = g.canvas && g.b === b && g.h === h && zicht.x0 >= g.vx && zicht.y0 >= g.vy && zicht.x1 <= g.vx + b && zicht.y1 <= g.vy + h;
    const sleutel = grondSleutel(S);
    if (past && sleutel === g.sleutel) return g;
    if (!g.canvas || g.b !== b || g.h !== h) {
      g.canvas = document.createElement('canvas');
      g.canvas.width = b;
      g.canvas.height = h;
      g.ctx = g.canvas.getContext('2d');
      g.b = b;
      g.h = h;
    }
    g.vx = Math.round((zicht.x0 + zicht.x1) / 2 - b / 2);
    g.vy = Math.round((zicht.y0 + zicht.y1) / 2 - h / 2);
    g.sleutel = sleutel;
    const c = g.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, b, h);
    c.setTransform(1, 0, 0, 1, -g.vx, -g.vy);
    c.imageSmoothingEnabled = false;
    tekenVloeren(c, S, inBeeld, tegelsIn(S.wereld, { x0: g.vx, y0: g.vy, x1: g.vx + b, y1: g.vy + h }));
    return g;
  }

  T.tekenScene = function (ctx, S, bw, bh) {
    const w = S.wereld;
    if (effectenAan()) werkNaklankBij(S);
    // Buiten is het niets de nacht tussen de bomen, binnen het donker om de kamer heen.
    ctx.fillStyle = w.buiten ? '#0e1310' : '#0c0b0a';
    ctx.fillRect(0, 0, bw, bh);
    ctx.save();
    // Dezelfde afronding als naarVlak in main.js, anders wijst de muis net naast de tegel.
    ctx.translate(Math.round(bw / 2), Math.round(bh / 2));
    ctx.scale(S.zoom, S.zoom);
    ctx.translate(-Math.round(S.camera.x), -Math.round(S.camera.y));
    // Pixel art wordt vergroot, nooit uitgesmeerd.
    ctx.imageSmoothingEnabled = false;

    const inBeeld = (id) => id === w.huidigeKamer || (!!S.gevecht && S.gevecht.kamers.has(id));
    // Opengewerkt: de kamer van de held, en in een gevecht elke kamer waarin gevochten wordt.
    const open = w.kamers.filter((k) => inBeeld(k.id));
    const zicht = zichtVlak(S, bw, bh);
    const vak = tegelsIn(w, zicht);

    const g = werkGrondBij(S, bw, bh, zicht, inBeeld);
    ctx.drawImage(g.canvas, g.vx, g.vy);
    tekenRaster(ctx, S);
    tekenMarkeringen(ctx, S);
    if (effectenAan()) tekenVloerlicht(ctx, S);

    const lijst = [];
    // Buiten zijn er geen muren: wat daar "muur" heet, is de voet van een boom of een gebouw, en
    // dat tekent zichzelf als voorwerp.
    if (!w.buiten) {
      for (let y = vak.y0; y <= vak.y1; y++) {
        for (let x = vak.x0; x <= vak.x1; x++) {
          if (T.tegel(w, x, y) !== 'muur' || !T.isZichtbaar(w, x, y)) continue;
          const laag = isVoorrand(open, x, y);
          const helder = w.burenKamers[y][x].some(inBeeld) ? 1 : GEDIMD;
          lijst.push({ d: x + y, l: 0, punt: { x, y }, f: () => tekenMuur(ctx, w, x, y, laag, helder) });
        }
      }
    }
    for (const deur of w.deuren.values()) {
      if (!inVak(vak, deur.x, deur.y) || !T.isZichtbaar(w, deur.x, deur.y)) continue;
      const laag = isVoorrand(open, deur.x, deur.y);
      const helder = w.burenKamers[deur.y][deur.x].some(inBeeld) ? 1 : GEDIMD;
      lijst.push({ d: deur.x + deur.y, l: 1, punt: { x: deur.x, y: deur.y }, f: () => tekenDeur(ctx, deur, laag, helder) });
    }
    const zichtbaar = [];
    for (const v of w.voorwerpen) {
      if (!inVak(vak, v.x, v.y) || !T.isZichtbaar(w, v.x, v.y)) continue;
      zichtbaar.push(v);
      const k = T.kamerVan(w, v.x, v.y);
      const helder = k && inBeeld(k.id) ? 1 : GEDIMD;
      // Een gebouw (breder of dieper dan één tegel) krijgt `gebouw` mee: alleen dan is één
      // scalair dieptegetal niet genoeg en beslist vergelijkDiepte per paar (zie hieronder).
      const groot = v.beslaat && (v.beslaat[0] > 1 || v.beslaat[1] > 1);
      lijst.push({ d: diepteVan(v), l: 1, punt: { x: v.x, y: v.y }, gebouw: groot ? v : undefined, f: () => tekenVoorwerp(ctx, S, v, helder) });
    }
    // Het bos om de kaart heen (zie "het bos om de kaart heen" hieronder): dezelfde uitgebreide
    // vak-berekening als tegelsIn, maar met ringen vóórbij de rand in plaats van eraan afgeknipt.
    // Doet mee in `zichtbaar`, zodat een boom die de held bedekt net als elk ander hoog voorwerp
    // wegdooft (werkDoorkijkBij hieronder), en in `lijst`, zodat de gewone dieptesortering hem
    // netjes voor of achter de held zet.
    if (w.buiten) {
      const randVak = tegelsIn(w, zicht, BOSRAND_DIEP);
      for (let y = randVak.y0; y <= randVak.y1; y++) {
        for (let x = randVak.x0; x <= randVak.x1; x++) {
          if (x >= 0 && y >= 0 && x < w.b && y < w.h) continue; // dat hoort al bij de kaart zelf
          const v = bosrandOp(w, x, y);
          if (!v) continue;
          zichtbaar.push(v);
          // Het item in de tekenlijst hangt aan v zelf en wordt maar één keer gemaakt: v zelf
          // staat toch al vast in de cache van bosrandOp, dus hoeft dit sluiting-en-object-paar
          // niet elk beeld opnieuw. Bij honderden bomen in een hoek scheelt dat veel afval voor de
          // opruimer. ctx en S liggen zelf ook vast (één canvas, één spelstaat, heel de sessie).
          if (!v.item) v.item = { d: v.x + v.y, l: 1, punt: { x: v.x, y: v.y }, f: () => tekenBosrandBoom(ctx, S, v) };
          lijst.push(v.item);
        }
      }
    }
    // Doorkijk: wat de held of een wezen bedekt, wordt zolang doorzichtig. De tijd komt uit de
    // spelklok, zodat het ook klopt als het spel even stilstaat of vooruitgespoeld wordt.
    const dt = Math.max(0, Math.min(0.1, S.tijd - (S.doorkijkTijd || 0)));
    S.doorkijkTijd = S.tijd;
    werkDoorkijkBij(S, dt, zichtbaar);
    for (const e of w.wezens) {
      // Met sprites blijft het laatste beeld van het sterven liggen; met vlakken vervaagt het.
      if (e.dood && e.sterfTijd > 0.8 && !metSprites()) continue;
      if (!inVak(vak, e.tx, e.ty) || !T.isZichtbaar(w, e.tx, e.ty)) continue;
      lijst.push({ d: e.x + e.y, l: e.dood ? 1.5 : 2, punt: { x: e.tx, y: e.ty }, f: () => tekenWezen(ctx, S, e) });
    }
    // Dwaallichten zweven: ze horen in dezelfde rij van voor naar achter, anders schijnen ze
    // dwars door een muur die ervoor staat.
    for (const l of S.lichten) {
      if (!T.isZichtbaar(w, l.x, l.y)) continue;
      lijst.push({ d: l.x + l.y + 0.02, l: 3, punt: { x: l.x, y: l.y }, f: () => tekenLicht(ctx, S, l, 1) });
    }
    lijst.sort((a, b) => vergelijkDiepte(a, b) || a.l - b.l);
    for (const item of lijst) item.f();

    tekenEffecten(ctx, S);
    ctx.restore();
    tekenVignet(ctx, S, bw, bh);
  };

  // Op welke tegel plant een voorwerp zich in bij het sorteren van achter naar voor? Een boom
  // staat op één tegel, maar een huis of de toren beslaat er meer (`beslaat`, vanaf zijn achterste
  // hoek naar rechtsonder). Dan telt zijn vóórste hoek: alles wat daarvoor langs loopt, hoort er
  // overheen getekend te worden, en wie erachter staat verdwijnt erachter.
  T.diepteVan = diepteVan;
  function diepteVan(v) {
    const b = v.beslaat || [1, 1];
    return v.x + (b[0] - 1) + v.y + (b[1] - 1);
  }

  // Eén getal per gebouw volstaat niet om het tegen een los ding (een wezen, een dwaallicht, een
  // boom) te sorteren: `diepteVan` telt de vóórste hoek, maar wie recht ten zuiden of ten oosten
  // van een brede voet staat, kan een lagere som hebben dan die hoek en toch vóór het hele gebouw
  // staan. Daarom hier de vraag die wél voor elke tegel klopt: staat (x, y) ten zuiden of ten
  // oosten van de rechthoek die v beslaat (van v.x, v.y naar rechtsonder)? Dan staat hij ervóór,
  // anders erachter. Dezelfde vraag stelt werkDoorkijkBij hieronder — dat was eerst een tweede,
  // net iets andere som, en dat was precies de fout.
  T.staatVoorGebouw = staatVoorGebouw;
  function staatVoorGebouw(x, y, v) {
    const b = v.beslaat || [1, 1];
    return x > v.x + b[0] - 1 || y > v.y + b[1] - 1;
  }

  // De sortering van de tekenlijst: voor twee gewone dingen (twee wezens, twee losse voorwerpen)
  // blijft de oude som `x + y` de maat, precies als voorheen. Draagt precies één kant `gebouw`
  // (een voet groter dan één tegel), dan beslist staatVoorGebouw per paar in plaats van twee
  // sommen tegen elkaar te leggen — twee gebouwen tegen elkaar (zeldzaam, komt in dit spel niet
  // voor) vallen terug op de oude som.
  function vergelijkDiepte(a, b) {
    if (a.gebouw && !b.gebouw) return staatVoorGebouw(b.punt.x, b.punt.y, a.gebouw) ? -1 : 1;
    if (b.gebouw && !a.gebouw) return staatVoorGebouw(a.punt.x, a.punt.y, b.gebouw) ? 1 : -1;
    return a.d - b.d;
  }

  // ---------------------------------------------------------------- doorkijk
  //
  // Buiten staan er dingen die hoger zijn dan een muur binnen: een eik is driehonderd pixels,
  // de toren bijna zevenhonderd. Wie erachter loopt, is weg — en wat erger is: een wolf die jou
  // wél ziet, zie jij dan niet. Dus wordt alles wat de held of een wezen bedekt zolang
  // doorzichtig.
  //
  // Waarom doorzichtig en niet het silhouet van de figuur eroverheen: onze pixel art heeft zijn
  // eigen omlijning van één pixel en leeft van textuur (ontwerp/beeld.md). Een egale vlek over
  // een boom heen is een tweede beeldtaal, en je ziet er niet aan wáár je staat. Een boom die
  // half wegvalt laat de tovenaar én de boom zien, en dat is ook wat Fallout en Baldur's Gate
  // doen. De toren is het zwaarste geval; die krijgt daarom een tikje meer doorkijk dan de rest.
  const DOORKIJK = 0.4;
  const DOORKIJK_TOREN = 0.3;
  // De bosrand (zie "het bos om de kaart heen" verderop) staat op een hoek van de kaart soms met
  // twee dichte randen tegelijk om de held heen, en dan bedekken tien, twintig bomen hem
  // allemaal tegelijk. Doorzichtigheid stapelt vermenigvuldigend (twee bomen op 0.4 laten samen
  // nog maar 0.16 van de held zien, bij twintig is dat allang niets meer), dus een kleine waarde
  // zoals bij de toren lost dat niet op — hoe laag ook, met genoeg bomen erbovenop verdwijnt hij
  // toch. Eén los ding (de toren) mag zichtbaar blijven doorschemeren; een heel woud aan
  // verwisselbare achtergrondbomen niet: die vallen daarom helemaal weg zolang ze de held
  // bedekken, in plaats van te vervagen.
  const BOSRAND_DOORKIJK = 0;
  const DOORKIJK_TIJD = 0.18; // seconden om op en af te lopen, zodat het niet klappert
  const HOOG_GENOEG = 40; // hoger dan dit boven zijn voet: dan kan er iemand achter verdwijnen

  // De doos die een wezen op het scherm inneemt, ruim genomen: zijn lijf plus wat lucht.
  function wezenDoos(e) {
    const p = T.naarScherm(e.x, e.y);
    const h = metSprites() ? T.sprites.hoogte(e.soort) : 52;
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
    if (d[1] < HOOG_GENOEG) return null; // laag spul verbergt niemand
    const p = T.naarScherm(v.x, v.y);
    return { x0: p.x - d[0], x1: p.x + d[2], y0: p.y - d[1], y1: p.y + d[3] };
  }

  const raakt = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

  // Per beeld: welk hoog voorwerp bedekt iemand die je hoort te zien? Alleen voorwerpen die ná
  // dat wezen getekend worden kunnen hem verbergen, en dat weten we al uit de diepte.
  // Wie moet er door een boom of een toren heen te zien zijn? De held altijd. Verder alleen wie er
  // toe doet op dit moment: wat meevecht, wat je net ontdekt heeft (het uitroepteken), en wie je
  // aanspreekt. Een wolf die in zijn eentje achter de toren rondscharrelt hoeft de toren niet
  // doorzichtig te maken — dan sta je ervoor en zie je hem wegvallen zonder te weten waarom.
  function teltMee(S, e) {
    if (e === S.held) return true;
    if (e.dood) return false;
    if (e.alarm > 0) return true;
    if (S.gevecht && S.gevecht.volgorde.includes(e)) return true;
    if (S.overgang && S.overgang.aanleiding === e) return true;
    return S.spreektMet === e;
  }

  function werkDoorkijkBij(S, dt, voorwerpen) {
    const w = S.wereld;
    const wezens = [];
    for (const e of w.wezens) {
      if (!teltMee(S, e)) continue;
      wezens.push({ tx: e.tx, ty: e.ty, doos: wezenDoos(e) });
    }
    for (const v of voorwerpen) {
      const doos = voorwerpDoos(v);
      let bedekt = false;
      if (doos) {
        // Bedekken kan alleen als dít voorwerp ná het wezen getekend wordt, dus als het wezen niet
        // vóór het gebouw staat — staatVoorGebouw hierboven, dezelfde vraag als de tekenvolgorde.
        for (const e of wezens) {
          if (staatVoorGebouw(e.tx, e.ty, v)) continue; // dat wezen staat ervóór, dus verdwijnt er niet achter
          if (raakt(doos, e.doos)) {
            bedekt = true;
            break;
          }
        }
      }
      const doel = bedekt ? (v.bosrand ? BOSRAND_DOORKIJK : v.soort === 'toren' ? DOORKIJK_TOREN : DOORKIJK) : 1;
      const nu = v.doorkijk == null ? 1 : v.doorkijk;
      const stap = dt / DOORKIJK_TIJD;
      v.doorkijk = doel > nu ? Math.min(doel, nu + stap) : Math.max(doel, nu - stap);
    }
  }

  // Ligt deze tegel aan de voorkant (zuid- of oostkant) van een van deze kamers?
  function isVoorrand(kamers, x, y) {
    return kamers.some(
      (k) => (y === k.y2 + 1 && x >= k.x1 - 1 && x <= k.x2 + 1) || (x === k.x2 + 1 && y >= k.y1 - 1 && y <= k.y2 + 1),
    );
  }

  // De kleuren van de grond buiten, voor als de kunst er niet is (of Toren.debug.vlakken aan
  // staat): gras, een zandpad, kasseien, water.
  const BUITENKLEUR = {
    gras: ['#3f6323', '#395d20'],
    zandpad: ['#7a6238', '#735c33'],
    kasseien: ['#6d6a64', '#65625c'],
    water: ['#2d4f6e', '#284a6a'],
  };

  // Buiten houdt de kaart ergens op, en op een breed scherm kijk je op de hoek van het beeld
  // zestien tegels ver: je ziet dus altijd voorbij de rand. Een speler hoort nooit het einde van
  // de plaat te zien, dus dooft het bos naar de rand toe weg tot het niet meer van de donkere
  // achtergrond te onderscheiden is — dezelfde truc als nevel() in erf-scene.cjs en dorp.cjs, die
  // op de plaat de rand van het erf in het bos laat verdwijnen. De kaart zegt zelf over hoeveel
  // ringen dat gaat (`doof`), zodat daar niet op twee plekken een getal staat.
  //
  // De kromme is kwadratisch: dichtbij de rand gaat het snel naar zwart, en naar het erf toe loopt
  // hij zachtjes vol. Zo valt de overgang naar de echte achtergrond nergens op.
  function randDof(w, x, y) {
    const ringen = w.doof || 0;
    if (!w.buiten || !ringen) return 1;
    const d = Math.min(x, y, w.b - 1 - x, w.h - 1 - y);
    if (d >= ringen) return 1;
    const t = (d + 0.5) / ringen;
    return Math.max(0.02, t * t);
  }

  function tekenVloeren(ctx, S, inBeeld, vak) {
    const w = S.wereld;
    const sp = metSprites();
    const buiten = !!w.buiten;
    for (let y = vak.y0; y <= vak.y1; y++) {
      for (let x = vak.x0; x <= vak.x1; x++) {
        const t = T.tegel(w, x, y);
        // Buiten ligt er ook gras onder een boom of een huis (die tegel heet "muur"): het
        // plaatje van de boom laat het gras eromheen zien.
        if (t === 'buiten' || (!buiten && t !== 'vloer' && t !== 'deur') || !T.isZichtbaar(w, x, y)) continue;
        const p = T.naarScherm(x, y);
        const g = buiten && w.grond && w.grond[y] ? w.grond[y][x] : null;
        let hex;
        let helder;
        if (buiten) {
          const kleur = BUITENKLEUR[g && g.naam] || BUITENKLEUR.gras;
          hex = kleur[(x + y) % 2];
          helder = 1; // buiten is er geen kamer waar je niet bent
        } else if (t === 'vloer') {
          const k = T.kamerVan(w, x, y);
          hex = k.vloer[(x + y) % 2];
          helder = inBeeld(k.id) ? 1 : GEDIMD;
        } else {
          hex = '#5b4c3c';
          helder = w.burenKamers[y][x].some(inBeeld) ? 1 : GEDIMD;
        }
        // De tegels zijn al klaargeknipt (js/sprites.js snijdt de vloerlappen bij het laden, en
        // de grond van buiten komt per tegel uit de stempel van vier bij vier), dus hier is
        // tekenen niets meer dan één drawImage.
        // Naar de rand van de kaart toe wordt het donker. Dat gaat met doorzichtigheid en niet
        // met een filter: een filter per tegel is in een browser duur, en hieronder ligt toch
        // het donker van de achtergrond.
        const dof = buiten ? randDof(w, x, y) : 1;
        if (dof <= 0) continue;
        if (dof < 1) ctx.globalAlpha = dof;
        const deel = sp && (g ? T.sprites.buiten(g.vel, g.id) : !buiten && T.sprites.tegel(vloerSoort(w, x, y), x, y));
        if (deel) {
          T.sprites.teken(ctx, deel, p.x, p.y, helder);
          if (dof < 1) ctx.globalAlpha = 1;
          continue;
        }
        const vlek = 0.95 + ((x * 73 + y * 151) % 11) / 100; // een tikje verschil per tegel
        T.ruit(ctx, p.x, p.y, 1);
        ctx.fillStyle = T.rgb(T.kleur(hex), helder * vlek);
        ctx.fill();
        if (dof < 1) ctx.globalAlpha = 1;
        // Binnen tekent het raster de voegen tussen de stenen; buiten hoort het gras juist
        // nergens een raster te laten zien.
        if (!buiten) {
          ctx.strokeStyle = 'rgba(0,0,0,0.24)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // Het raster rolt uit vanaf de plek van de held, als een rimpeling over de vloer, en
  // vervaagt weer als het gevecht voorbij is.
  function tekenRaster(ctx, S) {
    if (S.rasterAlpha < 0.01 || !S.rasterTegels.length) return;
    const van = S.rasterVan || T.tegelVan(S.held);
    const verstreken = S.tijd - S.rasterStart;
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 230, 190, 0.42)';
    ctx.lineWidth = 1;
    for (const t of S.rasterTegels) {
      if (!T.isZichtbaar(S.wereld, t.x, t.y)) continue;
      const golf = S.modus === 'gevecht' ? Math.min(1, Math.max(0, verstreken * 16 - Math.hypot(t.x - van.x, t.y - van.y))) : 1;
      if (golf <= 0) continue;
      ctx.globalAlpha = S.rasterAlpha * golf;
      const p = T.naarScherm(t.x, t.y);
      T.ruit(ctx, p.x, p.y, 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  function tekenMarkeringen(ctx, S) {
    const h = S.handeling;
    const licht = 'rgba(250, 240, 210, 0.9)';
    const rood = 'rgba(224, 96, 79, 0.9)';

    // Bereik: waar de held deze beurt nog kan komen. Met een spreuk in de hand loop je niet,
    // dan licht het bereik van de spreuk op.
    if (S.bereik && S.modus === 'gevecht' && !S.bezig && !S.spreuk) {
      ctx.fillStyle = 'rgba(111, 160, 230, 0.17)';
      for (const k of S.bereik.keys()) {
        const [x, y] = k.split(',').map(Number);
        const p = T.naarScherm(x, y);
        T.ruit(ctx, p.x, p.y, 0.86);
        ctx.fill();
      }
    }

    // Waar de gekozen spreuk bij kan, in zijn eigen kleur; open deuren binnen bereik van een
    // windstoot krijgen een randje.
    const sb = S.spreukBereik;
    if (sb) {
      const kleur = T.kleur(sb.kleur);
      ctx.fillStyle = T.rgb(kleur, 1, 0.12);
      for (const t of sb.tegels) {
        const p = T.naarScherm(t.x, t.y);
        T.ruit(ctx, p.x, p.y, 0.86);
        ctx.fill();
      }
      ctx.strokeStyle = T.rgb(kleur, 1, 0.75);
      ctx.lineWidth = 1.5;
      for (const d of sb.deuren) {
        const p = T.naarScherm(d.x, d.y);
        T.ruit(ctx, p.x, p.y, 0.88);
        ctx.stroke();
      }
    }

    // Het pad dat een klik zou lopen.
    if (h && h.pad && h.pad.length) {
      const kleur = h.kan === false ? rood : licht;
      ctx.fillStyle = kleur;
      for (const t of h.pad) {
        const p = T.naarScherm(t.x, t.y);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const laatste = h.pad[h.pad.length - 1];
      const p = T.naarScherm(laatste.x, laatste.y);
      T.ruit(ctx, p.x, p.y, 0.82);
      ctx.strokeStyle = kleur;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // De lijn van een spreuk, over de vloer naar het doel. Gaat de schicht door het eerste doel
    // heen (Legendarisch), dan loopt de lijn door naar het tweede.
    if (h && h.lijn) {
      const punten = [T.naarScherm(S.held.x, S.held.y), T.naarScherm(h.lijn.x, h.lijn.y)];
      if (h.tweede) punten.push(T.naarScherm(h.tweede.x, h.tweede.y));
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = h.kan === false ? rood : T.rgb(T.kleur(h.kleur || '#ffaa50'), 1, 0.95);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(punten[0].x, punten[0].y);
      for (const p of punten.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.restore();
      if (h.tweede) {
        const p = punten[2];
        ctx.strokeStyle = rood;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 20, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Waar een windstoot de wezens heen blaast: stippen over het pad en een ruit waar ze
    // terechtkomen.
    if (h && h.duw) {
      ctx.fillStyle = 'rgba(225, 240, 255, 0.85)';
      ctx.strokeStyle = 'rgba(225, 240, 255, 0.85)';
      ctx.lineWidth = 2;
      for (const d of h.duw) {
        for (const t of d.pad) {
          const p = T.naarScherm(t.x, t.y);
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 3.5, 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (!d.pad.length) continue;
        const eind = d.pad[d.pad.length - 1];
        const p = T.naarScherm(eind.x, eind.y);
        T.ruit(ctx, p.x, p.y, 0.82);
        ctx.stroke();
      }
    }

    // Een dwaallicht dat er nog niet is: het bolletje als voorproefje, en een ring om ieder die
    // erop af zou komen.
    if (h && h.licht) {
      tekenLicht(ctx, S, { x: h.licht.x, y: h.licht.y, van: null, begin: 0, vlucht: 0, tot: Infinity, nablijven: 0 }, 0.5);
      ctx.strokeStyle = 'rgba(150, 220, 255, 0.85)';
      ctx.lineWidth = 2;
      for (const m of h.gelokt || []) {
        const p = T.naarScherm(m.x, m.y);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 19, 9.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Wat er onder de muis ligt.
    const doel = S.hover;
    if (!doel || !(S.modus === 'verkennen' || S.modus === 'gevecht')) return;
    if (doel.wezen || doel.voorwerp) {
      const e = doel.wezen || doel.voorwerp;
      const p = T.naarScherm(e.x, e.y);
      ctx.strokeStyle = doel.wezen && doel.wezen.kant === 'monster' ? rood : 'rgba(250, 240, 210, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 20, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (h && !(h.pad && h.pad.length)) {
      const p = T.naarScherm(doel.x, doel.y);
      T.ruit(ctx, p.x, p.y, 0.9);
      ctx.strokeStyle = h.fout || h.kan === false ? rood : 'rgba(250, 240, 210, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const isRuimte = (w, x, y) => {
    const t = T.tegel(w, x, y);
    return t === 'vloer' || t === 'deur';
  };

  // Wat hangt er aan deze muur? Vast per tegel, zodat een kamer er elke keer hetzelfde
  // uitziet. Een raam alleen waar er buiten achter ligt; verder hier en daar een scheur, en
  // spaarzaam een lamp, een wandkleed of een rek.
  function muurDeco(w, x, y, west) {
    const buiten = T.tegel(w, west ? x - 1 : x, west ? y : y - 1) === 'buiten';
    const r = ruis(x, y);
    if (buiten && r % 6 === 0) return 'raam';
    if (r % 23 === 0) return 'lamp';
    if (r % 19 === 0) return 'wandkleed';
    if (r % 17 === 0) return 'rek';
    if (r % 7 === 0) return 'scheur';
    return 'muur';
  }

  // Een muur van sprites. Een muurstuk is een halve tegel dik, zoals in kamers.cjs, dus
  // krijgt elke muurtegel er twee achter elkaar: dan is de tegel vol en klopt de bovenkant.
  // Het voorste stuk draagt de versiering, want dat is de kant die de kamer in kijkt. Ligt er
  // ook een kamer ten oosten, dan komt daar een westmuurstuk overheen.
  function tekenMuurSprites(ctx, w, x, y, laag, helder) {
    if (laag) {
      const stomp = T.sprites.muur('laag');
      if (!stomp) return false;
      const p = T.naarScherm(x, y);
      T.sprites.teken(ctx, stomp, p.x, p.y, helder);
      return true;
    }
    const vlak = T.sprites.muur('muur', false);
    if (!vlak) return false;
    const achter = T.naarScherm(x, y + 0.5);
    T.sprites.teken(ctx, vlak, achter.x, achter.y, helder);
    const voor = T.naarScherm(x, y + 1);
    const naarKamer = isRuimte(w, x, y + 1);
    T.sprites.teken(ctx, (naarKamer && T.sprites.muur(muurDeco(w, x, y, false), false)) || vlak, voor.x, voor.y, helder);
    if (isRuimte(w, x + 1, y)) {
      const soort = muurDeco(w, x, y, true);
      const zij = soort !== 'muur' && T.sprites.muur(soort, true);
      if (zij) {
        const o = T.naarScherm(x + 1, y);
        T.sprites.teken(ctx, zij, o.x, o.y, helder);
      }
    }
    return true;
  }

  function tekenMuur(ctx, w, x, y, laag, helder) {
    if (metSprites() && tekenMuurSprites(ctx, w, x, y, laag, helder)) return;
    const p = T.naarScherm(x, y);
    const hoogte = laag ? T.MUUR_LAAG : T.MUUR_HOOG;
    T.blok(ctx, p.x, p.y, 0.5, 0.5, hoogte, '#7b7368', { helder });
    if (laag) return;
    // twee voegen, zodat het steen wordt en geen karton
    ctx.strokeStyle = 'rgba(0,0,0,0.16)';
    ctx.lineWidth = 1;
    for (const z of [21, 42]) {
      const a = T.blokPunt(p.x, p.y, -0.5, 0.5, z);
      const b = T.blokPunt(p.x, p.y, 0.5, 0.5, z);
      const c = T.blokPunt(p.x, p.y, 0.5, -0.5, z);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.stroke();
    }
  }

  // Een deur van sprites: dezelfde muurstukken, met een deur, een slot of een doorgang erin.
  // Een open deur is een doorgang zonder stuk erachter, anders kijk je tegen steen aan.
  // Het lage stompje van de voorrand blijft met vlakken: daar hoort een slot op te kunnen.
  function tekenDeurSprites(ctx, d, laag, helder) {
    if (laag) return false;
    const west = d.richting === 'ns'; // de muur loopt van noord naar zuid: de deur kijkt naar het oosten
    const deel = T.sprites.muur(d.staat === 'open' ? 'doorgang' : d.staat === 'opslot' ? 'slot' : 'deur', west);
    if (!deel) return false;
    if (d.staat !== 'open') {
      const achter = T.sprites.muur('muur', west);
      const a = west ? T.naarScherm(d.x + 0.5, d.y) : T.naarScherm(d.x, d.y + 0.5);
      if (achter) T.sprites.teken(ctx, achter, a.x, a.y, helder);
    }
    const b = west ? T.naarScherm(d.x + 1, d.y) : T.naarScherm(d.x, d.y + 1);
    T.sprites.teken(ctx, deel, b.x, b.y, helder);
    return true;
  }

  function tekenDeur(ctx, d, laag, helder) {
    if (metSprites() && tekenDeurSprites(ctx, d, laag, helder)) return;
    const p = T.naarScherm(d.x, d.y);
    const ns = d.richting === 'ns'; // de muur loopt van noord naar zuid: het paneel is dun in x
    // Een laag stompje naast een lage muur van sprites moet even hoog zijn als die muur.
    const laagH = metSprites() ? T.sprites.laagHoogte() : T.MUUR_LAAG;
    const muurHoogte = laag ? laagH : T.MUUR_HOOG;
    const steen = '#6f675c';
    if (d.staat === 'open') {
      for (const s of [-0.4, 0.4]) {
        const q = ns ? T.naarScherm(d.x, d.y + s) : T.naarScherm(d.x + s, d.y);
        T.blok(ctx, q.x, q.y, ns ? 0.5 : 0.1, ns ? 0.1 : 0.5, muurHoogte, steen, { helder });
      }
      if (!laag) T.blok(ctx, p.x, p.y, 0.5, 0.5, 12, steen, { helder, basis: muurHoogte - 12 });
      return;
    }
    const fx = ns ? 0.14 : 0.5;
    const fy = ns ? 0.5 : 0.14;
    const hoogte = laag ? laagH : 54;
    T.blok(ctx, p.x, p.y, fx, fy, hoogte, d.staat === 'opslot' ? '#6b4526' : '#7d5431', { helder });
    if (laag) {
      // ook een lage deur laat zien dat hij op slot zit
      if (d.staat === 'opslot') {
        rondje(ctx, p.x, p.y - hoogte, 4.5, '#e2b64a');
        rondje(ctx, p.x, p.y - hoogte + 0.5, 1.7, '#2a2016');
      }
      return;
    }
    // planken, en bij een deur op slot ijzeren banden en een slot
    const punt = (a, z) => (ns ? T.blokPunt(p.x, p.y, fx, a, z) : T.blokPunt(p.x, p.y, a, fy, z));
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    for (const a of [-0.25, 0, 0.25]) {
      const b = punt(a, 0);
      const c = punt(a, hoogte);
      ctx.beginPath();
      ctx.moveTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.stroke();
    }
    if (d.staat === 'opslot') {
      ctx.strokeStyle = 'rgba(38, 38, 42, 0.95)';
      ctx.lineWidth = 3;
      for (const z of [13, 41]) {
        const b = punt(-0.5, z);
        const c = punt(0.5, z);
        ctx.beginPath();
        ctx.moveTo(b[0], b[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.stroke();
      }
      const s = punt(0.2, 27);
      rondje(ctx, s[0], s[1], 4.2, '#e2b64a');
      rondje(ctx, s[0], s[1] + 0.5, 1.6, '#2a2016');
    }
  }

  // Wat buiten op de grond staat en geen eigen tekening met vlakken heeft: een boom is een stam
  // met een kruin, een gebouw een blok zo groot als zijn voet. Genoeg om te zien waar je niet
  // langs kunt, en om met Toren.debug.vlakken te kunnen vergelijken.
  const BUITENVLAK = {
    eik: ['#4a7030', 46, 0.30], herfstEik: ['#a9632a', 46, 0.30], den: ['#2f5734', 54, 0.26],
    berk: ['#6f9a45', 40, 0.22], dodeBoom: ['#6b5a44', 44, 0.20], wilg: ['#5d7f3c', 42, 0.32],
    appelboom: ['#4f7a33', 38, 0.30], struik: ['#3d6329', 18, 0.30], bessenStruik: ['#3a5f2c', 16, 0.30],
    varen: ['#476b2c', 10, 0.26], grasPol: ['#4e7430', 8, 0.22], hoogGras: ['#577d33', 14, 0.22],
    bloemen: ['#6d8a3c', 8, 0.24], paddenstoelen: ['#9a7250', 6, 0.16], boomstronk: ['#6a5238', 12, 0.26],
    rots: ['#77736c', 20, 0.30], kleineRots: ['#7d7973', 10, 0.20],
  };

  function tekenBuitenVlak(ctx, v, helder) {
    const p = T.naarScherm(v.x, v.y);
    const b = v.beslaat || [1, 1];
    const vorm = BUITENVLAK[v.soort];
    if (vorm) {
      const [hex, hoog, breed] = vorm;
      if (hoog > 24) T.blok(ctx, p.x, p.y, 0.08, 0.08, hoog * 0.55, '#5a4632', { helder }); // stam
      T.blok(ctx, p.x, p.y, breed, breed, hoog * 0.6, hex, { helder, basis: hoog > 24 ? hoog * 0.45 : 0 });
      return;
    }
    // een gebouw of de toren: een blok zo groot als zijn voet, met zijn midden op het midden
    // van die voet
    const m = T.naarScherm(v.x + (b[0] - 1) / 2, v.y + (b[1] - 1) / 2);
    const hoog = v.soort === 'toren' ? 260 : Math.max(40, 26 * Math.max(b[0], b[1]));
    T.blok(ctx, m.x, m.y, b[0] / 2, b[1] / 2, hoog, v.soort === 'toren' ? '#7b7486' : '#8a6f4e', { helder });
  }

  // Elk voorwerp buigt op zijn eigen moment mee met de wind, anders wappert het hele erf als één
  // vlag: een vaste verschuiving in de tijd uit zijn eigen plek op de kaart (dezelfde soort som
  // als de vlek in tekenVloeren hierboven). T.windWaarde (js/main.js) is de ene golf waar alles
  // aan hangt; hier alleen op een ander moment bemonsterd. Weegt de soort van dit voorwerp niets
  // mee, dan doet sprites.buiten er toch niets mee (zie WIND_GEWICHT daar).
  function windVoorInstantie(S, v) {
    const fase = ((v.x * 137 + v.y * 251) % 97) / 97 * 23;
    const w = T.windWaarde(S.tijd + fase);
    // een windstoot die hier net langskwam, buigt het extra mee (zie windstootOp)
    return nk.lijst.length ? Math.max(-1, Math.min(1, w + windstootOp(S, v.x, v.y))) : w;
  }

  // ---------------------------------------------------------------- het bos om de kaart heen
  //
  // Buiten de kaart stond tot nu toe niets: de camera hield daarom een marge aan tot de rand (de
  // oude begrensCamera in js/main.js), en op een kleine kaart liep de held zo ver uit het midden
  // dat hij onder het paneel verdween (Marcel, 21 sep 2026). De camera volgt de held nu altijd
  // (js/main.js); in de plaats van die marge staat hier een bosrand, zodat er nooit leegte te
  // zien is. Het dorp ligt toch al aan het bos (ontwerp/wereld.md), dus dat klopt ook verhalend.
  //
  // Drie regels uit ontwerp/beeld.md gelden hier samen:
  // - "Waar je loopt, staat niets" / "dichte begroeiing hoort aan de rand, waar je niet komt"
  //   (Wat je niet kunt zien, kun je niet spelen): de bosrand ligt allemaal buiten w.b/w.h, en
  //   daar wijst T.isBegaanbaar hem toch al af — er is geen aparte blokkade voor nodig.
  // - "Per zaad anders, en vast": elke tegel krijgt zijn boom (of geen boom) via een hasj van
  //   zijn eigen (x, y) en de naam van het gebied, dus dezelfde kaart geeft altijd hetzelfde bos,
  //   en het dorp en het erf krijgen niet toevallig precies dezelfde plek.
  // - "gedithered, geen zachte gloed": verder van de kaart dunt het bos uit doordat een tegel via
  //   die hasj kán overslaan (een echte, harde keuze per tegel — dat IS dither), niet doordat een
  //   boom doorzichtiger wordt. Wat wél verdonkert, is de kleur zelf (`helder`, dezelfde
  //   dim-techniek als een kamer waar je niet bent), nooit de doorzichtigheid. Voorbij de diepte
  //   waar de dichtheid nul wordt, tekent deze code niets meer: de donkere achtergrond die
  //   T.tekenScene daar al neerzet, is dan zelf het bos, dus het houdt nergens hard op.
  const BOSRAND_SOORTEN = ['eik', 'herfstEik', 'den', 'berk', 'wilg', 'appelboom', 'dodeBoom', 'struik', 'bessenStruik'];
  const BOSRAND_DICHT = 2; // ringen die helemaal vol staan, vlak tegen de kaart aan
  const BOSRAND_DIEP = 16; // ringen waarna er niets meer bij komt
  const BOSRAND_HELDER_MIN = 0.32;

  // Welke (vel, id)-paren in tegels/bomen.png en tegels/begroeiing.png een boom of struik zijn:
  // op naam opgezocht in T.TEGELS, niet op een vast nummer. De pixel-art-gereedschap maakt die
  // vellen opnieuw aan (npm run pixelart), en dan kan de volgorde erin verschuiven.
  let bosrandVellen = null;
  function bosrandVellenOpbouwen() {
    const r = [];
    for (const velNaam of ['bomen', 'begroeiing']) {
      const vel = T.TEGELS && T.TEGELS[velNaam];
      if (!vel) continue;
      vel.tiles.forEach((tegel, id) => {
        if (tegel && BOSRAND_SOORTEN.includes(tegel.naam)) r.push({ vel: velNaam, id, soort: tegel.naam });
      });
    }
    bosrandVellen = r;
  }

  // Hoeveel ringen deze tegel buiten de kaart ligt (1 = er direct tegenaan, schuin telt ook als
  // één ring — dezelfde maat als T.afstand, maar dan tot de rechthoek van de kaart in plaats van
  // tot een punt). Binnen de kaart, of op de rand zelf, is dit 0.
  function bosrandRing(w, x, y) {
    return Math.max(0, -x, -y, x - (w.b - 1), y - (w.h - 1));
  }

  // Eén geheel getal uit de naam van het gebied, zodat het dorp en het erf niet toevallig
  // hetzelfde bos krijgen.
  function bosrandZaad(w) {
    let h = 0;
    const naam = w.gebied || '';
    for (let i = 0; i < naam.length; i++) h = (h * 131 + naam.charCodeAt(i)) | 0;
    return h;
  }

  // Kwadratisch uitdunnen, maar dan aflopend in plaats van oplopend zoals randDof hierboven: vlak
  // voorbij de dichte ring valt de kans snel terug, en daarna vlakt het af naar bijna niets. Dat
  // is ook waarom dit betaalbaar blijft — de meeste tegels in bereik vallen af, in plaats van dat
  // de dichtheid tot ver in de ringen hoog blijft — en het oogt hetzelfde: vlak bij de kaart dicht
  // bos, verderop merk je het aflopen niet doordat het daar toch al bijna donker is.
  function bosrandVorm(r) {
    if (r <= BOSRAND_DICHT) return 1;
    const t = Math.min(1, (r - BOSRAND_DICHT) / (BOSRAND_DIEP - BOSRAND_DICHT));
    return (1 - t) * (1 - t);
  }
  const bosrandDichtheid = bosrandVorm;
  const bosrandHelder = (r) => 1 - (1 - BOSRAND_HELDER_MIN) * (1 - bosrandVorm(r));

  // Eén tegel in de bosrand: welke boom of struik er staat (of niets, als de dichtheid op deze
  // plek een gat dithert), voor eens en altijd berekend en bewaard op de wereld zelf. Dat bewaren
  // is niet (alleen) voor de snelheid: werkDoorkijkBij hieronder laat een boom vervagen als hij de
  // held bedekt, en dat kan alleen vloeiend als het van beeld op beeld hetzelfde object blijft.
  const bosrandPerWereld = new WeakMap();
  function bosrandOp(w, x, y) {
    let cache = bosrandPerWereld.get(w);
    if (!cache) bosrandPerWereld.set(w, (cache = new Map()));
    const sleutel = x + ',' + y;
    if (cache.has(sleutel)) return cache.get(sleutel);
    const r = bosrandRing(w, x, y);
    let v = null;
    if (r >= 1 && r <= BOSRAND_DIEP) {
      const zaad = bosrandZaad(w);
      if (hasj(x, y, zaad) < bosrandDichtheid(r)) {
        if (!bosrandVellen) bosrandVellenOpbouwen();
        if (bosrandVellen.length) {
          const keuze = bosrandVellen[Math.floor(hasj(x, y, zaad + 1) * bosrandVellen.length)];
          v = { soort: keuze.soort, vel: keuze.vel, id: keuze.id, x, y, beslaat: [1, 1], r, bosrand: true };
        }
      }
    }
    cache.set(sleutel, v);
    return v;
  }

  // Elke boom hier donkerder tekenen met ctx.filter (zoals T.sprites.teken doet voor een gedimde
  // kamer) kan met een enkele boom, maar niet met de paar honderd die in een hoek tegelijk in
  // beeld staan: canvasfilter is op wisselende beelden een van de duurste dingen die een browser
  // per tekening kan doen, en bij drie-, vierhonderd keer per beeld op zoveel verschillende
  // plaatjes tegelijk kwam daar op sommige beelden een piek van een halve seconde uit — gemeten
  // met Toren.debug.meet op een hoek van het dorp, ruim boven de 16 ms die één beeld hoort te
  // kosten. Dus wordt hier, net als bij de windbuiging hierboven, één keer per plaatje-en-stap
  // gebakken (BOSRAND_HELDER_STAPPEN stuks) in plaats van elke tekening opnieuw gefilterd: de
  // stap wordt op het plaatje zelf donkerder gemaakt en daarna is tekenen weer gewoon drawImage.
  const BOSRAND_HELDER_STAPPEN = 6;
  const bosrandGedimdPerStuk = new WeakMap(); // stuk → Map(stap → alvast donkerder gebakken stuk)
  function bosrandGedimd(stuk, helder) {
    if (!stuk || helder >= 0.999 || typeof document === 'undefined') return stuk;
    let perStap = bosrandGedimdPerStuk.get(stuk);
    if (!perStap) bosrandGedimdPerStuk.set(stuk, (perStap = new Map()));
    const stap = Math.max(0, Math.min(BOSRAND_HELDER_STAPPEN - 1, Math.round(helder * (BOSRAND_HELDER_STAPPEN - 1))));
    const bestaand = perStap.get(stap);
    if (bestaand) return bestaand;
    const c = document.createElement('canvas');
    c.width = stuk.b;
    c.height = stuk.h;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.filter = `brightness(${stap / (BOSRAND_HELDER_STAPPEN - 1)})`;
    cx.drawImage(stuk.beeld, stuk.sx, stuk.sy, stuk.b, stuk.h, 0, 0, stuk.b, stuk.h);
    const gebakken = { beeld: c, sx: 0, sy: 0, b: stuk.b, h: stuk.h, ax: stuk.ax, ay: stuk.ay };
    perStap.set(stap, gebakken);
    return gebakken;
  }

  // Tekent één boom of struik van de bosrand: hetzelfde plaatje en dezelfde windbuiging als
  // gewone buitenversiering (tekenVoorwerp hieronder), maar met bosrandHelder in plaats van
  // randDof — dat laatste is voor het verbleken van bestaande kaartversiering vlak bij háár eigen
  // rand (w.doof, door Marcel per kaart gezet) en is hier niet aan de orde.
  function tekenBosrandBoom(ctx, S, v) {
    const doorkijk = v.doorkijk == null ? 1 : v.doorkijk;
    if (doorkijk <= 0.02) return; // helemaal weggevallen: dan is er niets te tekenen
    const p = T.naarScherm(v.x, v.y);
    if (doorkijk < 1) ctx.globalAlpha = doorkijk;
    const helder = bosrandHelder(v.r);
    const ruw = metSprites() && T.sprites.buitenAan && T.sprites.buiten(v.vel, v.id, windVoorInstantie(S, v));
    // Het donkerder maken zit al in het plaatje (bosrandGedimd); T.sprites.teken hoeft dus geen
    // ctx.filter meer aan te zetten, vandaar de 1 hier.
    if (ruw) T.sprites.teken(ctx, bosrandGedimd(ruw, helder), p.x, p.y, 1);
    else tekenBuitenVlak(ctx, v, helder);
    if (doorkijk < 1) ctx.globalAlpha = 1;
  }

  function tekenVoorwerp(ctx, S, v, helder) {
    const p = T.naarScherm(v.x, v.y);
    // Buiten komt het plaatje uit de tegelvellen (tegels/, zie js/sprites.js): een boom, een
    // struik, een gebouw, de toren. Het anker van de cel is de voet, dus hij valt precies op het
    // midden van zijn eigen tegel.
    if (v.vel) {
      // dof: hoe ver van de rand van de kaart. doorkijk: staat er iemand achter?
      const alpha = randDof(S.wereld, v.x, v.y) * (v.doorkijk == null ? 1 : v.doorkijk);
      if (alpha <= 0.02) return;
      if (alpha < 1) ctx.globalAlpha = alpha;
      const stuk = metSprites() && T.sprites.buitenAan && T.sprites.buiten(v.vel, v.id, windVoorInstantie(S, v));
      if (stuk) {
        T.sprites.teken(ctx, stuk, p.x, p.y, helder);
        if (effectenAan() && nk.lijst.length) overlaag(ctx, stuk, p.x, p.y, kleur('vuur', 5), flitsOp(S, v.x, v.y));
      } else tekenBuitenVlak(ctx, v, helder);
      if (alpha < 1) ctx.globalAlpha = 1;
      return;
    }
    // De trap heeft een eigen vel, met een cel per staat (ingestort, provisorisch, hersteld).
    if (v.soort === 'trap' || v.soort === 'trapgat') {
      const spiraal = metSprites() && T.sprites.trap && T.sprites.trap(v.soort, v.staat);
      if (spiraal) {
        T.sprites.teken(ctx, spiraal, p.x, p.y, helder);
        return;
      }
    }
    // De pilaar staat nog niet in de kunst; die blijft vlakken.
    const deel = metSprites() && T.sprites.voorwerp(v.soort);
    if (deel) {
      if (v.soort === 'sleutel') {
        // De sleutel zweeft en glimt, anders zie je hem niet liggen.
        gloed(ctx, p.x, p.y - 6, 16, 'rgba(226, 182, 74,', 0.3);
        T.sprites.teken(ctx, deel, p.x, p.y - 8 - Math.sin(S.tijd * 3) * 3, helder);
        return;
      }
      T.sprites.teken(ctx, deel, p.x, p.y, helder);
      if (effectenAan() && nk.lijst.length) overlaag(ctx, deel, p.x, p.y, kleur('vuur', 5), flitsOp(S, v.x, v.y));
      if (v.soort === 'fontein' && !S.fonteinLeeg) {
        // Het water blijft bewegen: een rimpel over de kom en een druppel in de straal. Een lege
        // fontein (de meester dronk de laatste slok, js/tutorial.js) staat stil.
        const golf = (Math.sin(S.tijd * 2.2) + 1) / 2;
        ctx.strokeStyle = `rgba(200, 230, 255, ${0.18 + golf * 0.22})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - 14, 7 + golf * 8, 3.5 + golf * 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        rondje(ctx, p.x, p.y - 34 + Math.sin(S.tijd * 5) * 1.5, 1.6, 'rgba(210, 238, 255, 0.85)');
      }
      return;
    }
    if (v.soort === 'kist') {
      T.blok(ctx, p.x, p.y, 0.34, 0.34, 28, '#8a5a2c', { helder });
      T.blok(ctx, p.x, p.y, 0.36, 0.36, 4, '#6e4622', { helder, basis: 28 });
      return;
    }
    // Wat de tutorial neerzet (js/tutorial.js): een ton, wat er van een ton over is, en een zak.
    if (v.soort === 'ton') {
      T.blok(ctx, p.x, p.y, 0.26, 0.26, 30, '#7a5230', { helder });
      return;
    }
    if (v.soort === 'puin') {
      T.blok(ctx, p.x, p.y, 0.3, 0.3, 3, '#6e4622', { helder });
      return;
    }
    if (v.soort === 'zak') {
      T.blok(ctx, p.x, p.y, 0.22, 0.22, 16, '#b99a64', { helder });
      return;
    }
    if (v.soort === 'pilaar') {
      T.blok(ctx, p.x, p.y, 0.32, 0.32, 8, '#6f6a62', { helder });
      T.blok(ctx, p.x, p.y, 0.22, 0.22, 74, '#8d877d', { helder, basis: 8 });
      T.blok(ctx, p.x, p.y, 0.32, 0.32, 8, '#6f6a62', { helder, basis: 82 });
      return;
    }
    if (v.soort === 'fontein') {
      T.blok(ctx, p.x, p.y, 0.42, 0.42, 16, '#8a8478', { helder });
      T.ruit(ctx, p.x, p.y - 16, 0.64);
      ctx.fillStyle = T.rgb(T.kleur(S.fonteinLeeg ? '#5d574d' : '#3f7fc2'), helder);
      ctx.fill();
      if (S.fonteinLeeg) {
        T.blok(ctx, p.x, p.y, 0.07, 0.07, 14, '#9c968a', { helder, basis: 16 });
        return;
      }
      const golf = (Math.sin(S.tijd * 2.2) + 1) / 2;
      ctx.strokeStyle = `rgba(200, 230, 255, ${0.25 + golf * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 16, 8 + golf * 10, 4 + golf * 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      T.blok(ctx, p.x, p.y, 0.07, 0.07, 14, '#9c968a', { helder, basis: 16 });
      rondje(ctx, p.x, p.y - 32 + Math.sin(S.tijd * 5) * 1.5, 2.2, 'rgba(190, 225, 255, 0.9)');
      return;
    }
    if (v.soort === 'trap') {
      // treden die naar achteren oplopen, met een gloed boven: daar is de uitgang
      for (let i = 2; i >= 0; i--) {
        const o = T.naarScherm(v.x - 0.13 * i, v.y - 0.13 * i);
        T.blok(ctx, o.x, o.y, 0.45 - 0.13 * i, 0.45 - 0.13 * i, 12 * (i + 1), '#7d776d', { helder });
      }
      const top = T.naarScherm(v.x - 0.26, v.y - 0.26);
      gloed(ctx, top.x, top.y - 40, 26, 'rgba(255, 214, 120,', 0.35 + Math.sin(S.tijd * 2) * 0.1);
      return;
    }
    if (v.soort === 'trapgat') {
      // een gat in de vloer: een donkere ruit met een lichte rand eromheen
      T.ruit(ctx, p.x, p.y, 1.9);
      ctx.fillStyle = T.rgb(T.kleur('#6f6a62'), helder);
      ctx.fill();
      T.ruit(ctx, p.x, p.y, 1.55);
      ctx.fillStyle = 'rgba(10, 8, 14, 0.92)';
      ctx.fill();
      return;
    }
    if (v.soort === 'sleutel') {
      const z = 13 + Math.sin(S.tijd * 3) * 3;
      gloed(ctx, p.x, p.y, 16, 'rgba(226, 182, 74,', 0.3);
      const kx = p.x - 5;
      const ky = p.y - z;
      ctx.strokeStyle = '#e8c04e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(kx, ky, 4.5, 0, Math.PI * 2);
      ctx.moveTo(kx + 4.5, ky);
      ctx.lineTo(kx + 15, ky);
      ctx.moveTo(kx + 11, ky);
      ctx.lineTo(kx + 11, ky + 4);
      ctx.moveTo(kx + 14.5, ky);
      ctx.lineTo(kx + 14.5, ky + 3);
      ctx.stroke();
    }
  }

  const TEKENAARS = {
    // De meester wordt zichtbaar ouder: de baard groeit, de rug buigt, de hoedpunt zakt.
    // Zo zie je aan de figuur zelf hoeveel tijd er nog is, niet alleen aan de balk.
    held(ctx, cx, cy, bob, e, S) {
      const ouder = Math.min(1, Math.max(0, (e.leeftijd - T.STARTLEEFTIJD) / (T.EINDLEEFTIJD - T.STARTLEEFTIJD)));
      const krom = ouder * 4; // hoofd schuift naar voren en omlaag
      const sluip = S.sluipen && !S.gevecht ? 5 : 0; // ineengedoken
      if (sluip) ctx.globalAlpha *= 0.8;
      const lijf = 24 + bob - sluip - ouder * 3;
      T.blok(ctx, cx, cy, 0.2, 0.2, lijf, '#3f6fb7'); // gewaad
      const hx = cx + krom;
      const hy = cy - lijf - 7 + krom * 0.5;
      rondje(ctx, hx, hy, 7, HOOFD);
      rondje(ctx, hx - 2.5, hy - 1, 1.1, '#2b2118');
      rondje(ctx, hx + 2.5, hy - 1, 1.1, '#2b2118');
      ctx.fillStyle = '#ece8dd'; // baard
      ctx.beginPath();
      ctx.moveTo(hx - 6, hy + 1.5);
      ctx.lineTo(hx + 6, hy + 1.5);
      ctx.lineTo(hx + 1, hy + 15 + ouder * 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#233f7a'; // punthoed, waarvan de punt steeds verder omzakt
      ctx.beginPath();
      ctx.ellipse(hx, hy - 5, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(hx - 8, hy - 5);
      ctx.lineTo(hx + 8, hy - 5);
      ctx.lineTo(hx + 4 + ouder * 10, hy - 28 + ouder * 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8b6b3d'; // staf
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + 13, cy + 2);
      ctx.lineTo(cx + 13, cy - 44);
      ctx.stroke();
      // hoe ouder, hoe sterker de magie: de gloed op de staf groeit mee
      gloed(ctx, cx + 13, cy - 47, 8 + T.magieBonus(e.leeftijd) * 3, 'rgba(255, 214, 110,', 0.9);
      rondje(ctx, cx + 13, cy - 47, 2.8, '#fff0b0');
      return hy - 28;
    },

    wim(ctx, cx, cy, bob) {
      ctx.strokeStyle = '#9a7a4a'; // bezem
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + 1);
      ctx.lineTo(cx - 11, cy - 40);
      ctx.stroke();
      ctx.fillStyle = '#c9a55a';
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy + 4);
      ctx.lineTo(cx - 8, cy + 4);
      ctx.lineTo(cx - 13.5, cy - 8);
      ctx.closePath();
      ctx.fill();
      T.blok(ctx, cx, cy, 0.19, 0.19, 22 + bob, '#7a5a3a'); // stofjas
      const hy = cy - 22 - bob - 7;
      rondje(ctx, cx, hy, 7, '#e3bf98');
      rondje(ctx, cx - 2.5, hy - 1, 1.1, '#2b2118');
      rondje(ctx, cx + 2.5, hy - 1, 1.1, '#2b2118');
      ctx.fillStyle = '#cfcac0'; // snor
      ctx.beginPath();
      ctx.ellipse(cx, hy + 3, 5, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3d4a5a'; // pet met klep
      ctx.beginPath();
      ctx.ellipse(cx, hy - 5, 8.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 4, hy - 3.5, 6, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      return hy - 9;
    },

    slijm(ctx, cx, cy, bob, e, S) {
      const s = Math.sin(S.tijd * 4 + e.fase);
      const rb = 17 * (1 + s * 0.07);
      const rh = 14 * (1 - s * 0.07);
      ctx.fillStyle = '#4e9a3e';
      ctx.beginPath();
      ctx.ellipse(cx, cy - rh * 0.5, rb, rh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath();
      ctx.ellipse(cx - 6, cy - rh * 0.95, 5, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
      rondje(ctx, cx - 5, cy - rh * 0.6, 3.3, '#f4f1e6');
      rondje(ctx, cx + 5, cy - rh * 0.6, 3.3, '#f4f1e6');
      rondje(ctx, cx - 4.3, cy - rh * 0.57, 1.5, '#1b1b1b');
      rondje(ctx, cx + 5.7, cy - rh * 0.57, 1.5, '#1b1b1b');
      return cy - rh * 1.5;
    },

    skelet(ctx, cx, cy, bob) {
      ctx.strokeStyle = '#b9c0c8'; // zwaard
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy - 9);
      ctx.lineTo(cx + 21, cy - 40);
      ctx.stroke();
      ctx.strokeStyle = '#6b5a3a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 12);
      ctx.lineTo(cx + 16, cy - 9);
      ctx.stroke();
      T.blok(ctx, cx, cy, 0.17, 0.17, 23 + bob, '#cfc8b3');
      ctx.strokeStyle = 'rgba(60, 50, 40, 0.55)'; // ribben
      ctx.lineWidth = 1.2;
      for (const z of [9, 14, 19]) {
        const a = T.blokPunt(cx, cy, -0.17, 0.17, z + bob);
        const b = T.blokPunt(cx, cy, 0.17, 0.17, z + bob);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
      const hy = cy - 23 - bob - 8;
      rondje(ctx, cx, hy, 7.5, '#e7e1cf');
      rondje(ctx, cx - 2.8, hy - 0.5, 2.1, '#1c1a17');
      rondje(ctx, cx + 2.8, hy - 0.5, 2.1, '#1c1a17');
      rondje(ctx, cx - 2.8, hy - 0.5, 0.8, '#e0604f');
      rondje(ctx, cx + 2.8, hy - 0.5, 0.8, '#e0604f');
      ctx.strokeStyle = 'rgba(40, 30, 20, 0.6)'; // tanden
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 3, hy + 4);
      ctx.lineTo(cx + 3, hy + 4);
      ctx.stroke();
      return hy - 9;
    },
    // Laag en lang, met de kop vooruit: een wolf is geen mens op vier poten.
    wolf(ctx, cx, cy, bob) {
      T.blok(ctx, cx, cy, 0.3, 0.16, 15 + bob, '#6f6a63'); // romp
      const hy = cy - 15 - bob - 6;
      rondje(ctx, cx + 9, hy + 2, 5.5, '#7d7770'); // kop
      ctx.fillStyle = '#5c574f'; // snuit
      ctx.beginPath();
      ctx.moveTo(cx + 13, hy + 1);
      ctx.lineTo(cx + 21, hy + 4);
      ctx.lineTo(cx + 13, hy + 6);
      ctx.closePath();
      ctx.fill();
      rondje(ctx, cx + 10, hy + 1, 1.2, '#e8c24a'); // gele ogen
      ctx.fillStyle = '#5c574f'; // staart
      ctx.beginPath();
      ctx.moveTo(cx - 9, hy + 6);
      ctx.lineTo(cx - 19, hy - 1);
      ctx.lineTo(cx - 17, hy + 6);
      ctx.closePath();
      ctx.fill();
      return hy - 6;
    },
  };

  // Een dwaallicht: een bolletje dat zacht op en neer deint, met vonkjes eromheen en een
  // schijnsel op de vloer. Onderweg van de staf naar zijn plek maakt het een boogje. dekking
  // onder 1: het voorproefje onder de muis.
  function tekenLicht(ctx, S, l, dekking) {
    if (effectenAan()) {
      tekenDwaallicht(ctx, S, l, dekking);
      return;
    }
    const vliegt = l.van && l.vlucht ? Math.min(1, (S.tijd - l.begin) / l.vlucht) : 1;
    const x = l.van ? l.van.x + (l.x - l.van.x) * vliegt : l.x;
    const y = l.van ? l.van.y + (l.y - l.van.y) * vliegt : l.y;
    const p = T.naarScherm(x, y);
    const deining = Math.sin(S.tijd * 2.4 + l.begin * 3) * 3;
    const hoog = 30 + deining + (1 - vliegt) * 16 + Math.sin(vliegt * Math.PI) * 14;
    // Het dooft in de laatste seconde uit, zodat je ziet aankomen dat je tijd op is.
    const rest = l.tot === Infinity ? 9 : l.tot - S.tijd;
    const a = Math.max(0, Math.min(1, Math.min(rest, (S.tijd - l.begin) * 6, 1))) * dekking;
    if (a <= 0) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(1, 0.5);
    gloed(ctx, 0, 0, 40, 'rgba(150, 215, 255,', 0.3 * a);
    ctx.restore();
    gloed(ctx, p.x, p.y - hoog, 17, 'rgba(165, 225, 255,', 0.8 * a);
    rondje(ctx, p.x, p.y - hoog, 3.4, `rgba(240, 250, 255, ${a})`);
    for (let i = 0; i < 3; i++) {
      const hoek = S.tijd * 2.2 + i * 2.09;
      rondje(ctx, p.x + Math.cos(hoek) * 10, p.y - hoog - 2 + Math.sin(hoek) * 4, 1.3, `rgba(200, 240, 255, ${0.75 * a})`);
    }
  }

  // Brandt het na van een vuurschicht: vlammetjes die flakkeren tot zijn volgende beurt. Met de
  // effecten zijn het drie gerenderde vlammetjes, elk op een eigen moment in hun flakkering.
  function tekenVlammen(ctx, S, cx, cy, top) {
    if (effectenAan()) {
      for (let i = 0; i < 3; i++) {
        const beeld = Math.floor(S.tijd * 10 + i * 1.7) % 4;
        T.sprites.teken(ctx, effect('vlammetje', beeld), cx + (i - 1) * 8, (cy + top) / 2 + 12 - (i === 1 ? 7 : 0));
      }
      return;
    }
    for (let i = 0; i < 3; i++) {
      const fl = (Math.sin(S.tijd * 11 + i * 2.3) + 1) / 2;
      const x = cx + (i - 1) * 7;
      const y = (cy + top) / 2 + 4 - fl * 5 - (i === 1 ? 6 : 0);
      gloed(ctx, x, y, 8 + fl * 3, 'rgba(255, 140, 50,', 0.5);
      rondje(ctx, x, y, 1.8 + fl, '#ffd27a');
    }
  }

  function tekenWezen(ctx, S, e) {
    const p = T.naarScherm(e.x, e.y);
    let cx = p.x;
    let cy = p.y;
    if (e.uitval) {
      const q = T.naarScherm(e.uitval.doel.x, e.uitval.doel.y);
      const k = e.uitval.t < 0.5 ? e.uitval.t * 2 : (1 - e.uitval.t) * 2;
      cx += (q.x - p.x) * 0.32 * k;
      cy += (q.y - p.y) * 0.32 * k;
    }
    // Met sprites speelt het vel de houding af (staan, lopen, uithalen, geraakt, sterven);
    // met vlakken blijft het bij een huppelpas en een vervagend lijk.
    const deel = metSprites() ? T.sprites.wezen(S, e) : null;
    ctx.save();
    if (e.dood && !deel) {
      ctx.globalAlpha = Math.max(0, 1 - e.sterfTijd / 0.8);
      cy += e.sterfTijd * 10;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.32)'; // schaduw
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    const bob = Math.sin(S.tijd * 2.6 + e.fase) * 1.3;
    // Wie geduwd wordt, schuift weg: geen huppelpas.
    const huppel = !deel && e.onderweg && !e.geduwd ? Math.abs(Math.sin(S.tijd * 14)) * 2.5 : 0;
    let top;
    if (deel) {
      // Sluipen heeft nog geen eigen houding: de held doet het in het halfdonker.
      if (e === S.held && S.sluipen && !S.gevecht) ctx.globalAlpha *= 0.8;
      T.sprites.teken(ctx, deel, cx, cy);
      top = cy - T.sprites.hoogte(e.soort);
      if (effectenAan()) {
        // de schaduw van ouderdom (als hij net voor een spreuk betaalde), de flits van een
        // inslag vlakbij, en een klap
        tekenSluier(ctx, S, deel, cx, cy, e);
        if (nk.lijst.length) overlaag(ctx, deel, cx, cy, kleur('vuur', 5), flitsOp(S, e.x, e.y));
        if (e.flits > 0) overlaag(ctx, deel, cx, cy, kleur('rood', 7), e.flits > 0.18 ? 0.5 : 0.25);
      }
    } else {
      // Een wezen uit een kaart kan een soort hebben waar nog geen kunst bij is (een dorpeling
      // heeft nog geen loopvellen). Dan tekenen we Wim: er staat iemand, en één zo'n figuur legt
      // niet het hele beeld plat.
      const teken = TEKENAARS[e.soort] || TEKENAARS.wim;
      top = teken(ctx, cx, cy - huppel, bob, e, S);
    }
    if (e.brandt > 0 && !e.dood) tekenVlammen(ctx, S, cx, cy - huppel, top);
    if (e.flits > 0 && !(deel && effectenAan())) {
      ctx.fillStyle = `rgba(255, 70, 50, ${Math.min(0.55, e.flits * 2)})`;
      ctx.beginPath();
      ctx.ellipse(cx, (cy + top) / 2, 15, (cy - top) / 2 + 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (!e.dood && e.kant === 'monster' && (S.gevecht || e.leven < e.maxLeven)) levensbalk(ctx, cx, top - 9, e);
    if (e.alarm > 0) roep(ctx, '!', cx, top - 14 - Math.abs(Math.sin(e.alarm * 9)) * 4, '#ffd24a');
    // Een vraagteken: dit monster heeft iets gezien wat de held niet is.
    else if (e.vraag > 0) roep(ctx, '?', cx, top - 14 - Math.abs(Math.sin(e.vraag * 7)) * 3, '#bfe6ff');
  }

  function roep(ctx, teken, cx, y, kleur) {
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.strokeText(teken, cx, y);
    ctx.fillStyle = kleur;
    ctx.fillText(teken, cx, y);
  }

  function levensbalk(ctx, cx, y, e) {
    const b = 30;
    const f = e.leven / e.maxLeven;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(cx - b / 2 - 1, y - 1, b + 2, 6);
    ctx.fillStyle = f > 0.5 ? '#86c46f' : f > 0.25 ? '#e2b64a' : '#e0604f';
    ctx.fillRect(cx - b / 2, y, b * f, 4);
  }

  function tekenEffecten(ctx, S) {
    // Met de vellen van de effecten: de spreuken als pixel art (zie hieronder). Dan blijven hier
    // alleen de zwevende getallen over, en die komen erbovenop: het jaar uit de zucht.
    const pixels = effectenAan();
    if (pixels) tekenSpreukeffecten(ctx, S);
    for (const fx of S.effecten) {
      const f = fx.t / fx.duur;
      if (fx.t < 0) continue; // een tekst die nog even wacht
      if (pixels && fx.soort !== 'tekst') continue;
      if (fx.soort === 'tekst') {
        const p = T.naarScherm(fx.x, fx.y);
        if (pixels) p.x += opzijVoorZucht(S, fx);
        const y = p.y - 64 - f * 30;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - f * f);
        ctx.font = 'bold 18px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0,0,0,0.75)';
        ctx.strokeText(fx.tekst, p.x, y);
        ctx.fillStyle = fx.kleur;
        ctx.fillText(fx.tekst, p.x, y);
        ctx.restore();
      } else if (fx.soort === 'schicht') {
        for (let i = 4; i >= 0; i--) {
          const g = Math.max(0, f - i * 0.05);
          const p = T.naarScherm(fx.van.x + (fx.naar.x - fx.van.x) * g, fx.van.y + (fx.naar.y - fx.van.y) * g);
          if (i === 0) {
            gloed(ctx, p.x, p.y - 24, 16, 'rgba(255, 150, 60,', 0.95);
            rondje(ctx, p.x, p.y - 24, 4.5, '#fff1b8');
          } else {
            rondje(ctx, p.x, p.y - 24, 4.5 - i * 0.7, `rgba(255, 170, 80, ${0.5 - i * 0.09})`);
          }
        }
      } else if (fx.soort === 'knal') {
        const p = T.naarScherm(fx.x, fx.y);
        ctx.strokeStyle = `rgba(255, 170, 80, ${1 - f})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - 20, 8 + f * 26, 4 + f * 13, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (fx.soort === 'wind') {
        // Drie lichte strepen die naast elkaar naar het doel waaien.
        const a = T.naarScherm(fx.van.x, fx.van.y);
        const b = T.naarScherm(fx.naar.x, fx.naar.y);
        const lang = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const dx = -(b.y - a.y) / lang;
        const dy = (b.x - a.x) / lang;
        for (let i = 0; i < 3; i++) {
          const kop = Math.min(1, f * 1.25 - i * 0.08);
          if (kop <= 0) continue;
          const staart = Math.max(0, kop - 0.4);
          const zij = (i - 1) * 8;
          const z = 20 + i * 6;
          ctx.strokeStyle = `rgba(228, 242, 255, ${0.65 - i * 0.16})`;
          ctx.lineWidth = 2.5 - i * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x + (b.x - a.x) * staart + dx * zij, a.y + (b.y - a.y) * staart + dy * zij - z);
          ctx.lineTo(a.x + (b.x - a.x) * kop + dx * zij, a.y + (b.y - a.y) * kop + dy * zij - z);
          ctx.stroke();
        }
      } else if (fx.soort === 'vlaag') {
        const p = T.naarScherm(fx.x, fx.y);
        ctx.strokeStyle = `rgba(228, 242, 255, ${0.8 * (1 - f)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - 16, 10 + f * 24, 5 + f * 12, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // ---------------------------------------------------------------- spreukeffecten in pixels
  //
  // Staan de vellen van de effecten klaar (beelden/effecten/, zie js/sprites.js), dan tekent het
  // spel de spreuken als pixel art, in drie tijden: de worp (de spreuk groeit in de bol van de
  // staf), de vlucht, en de inslag. Wat een vorm heeft, is vooraf gerenderd (de kop van een
  // vuurschicht, de inslag, het dwaallicht, stofjes, de zucht; gereedschap/pixelart/effecten.cjs).
  // Wat van de plek afhangt — een staart die de kop achterlaat, vonken, slierten wind — zijn losse
  // pixels, in dezelfde rampen, op hele pixels. Nooit een zachte gloed: licht is een dambord in
  // de kleur van het licht, zoals op de vloer onder een inslag.
  //
  // En de prijs: wie ouder wordt zonder dat hij geraakt is (T.verouder zonder klap), heeft
  // betaald voor een spreuk. Op dat moment trekt er een schaduw van ouderdom over hem heen, van
  // zijn voeten naar zijn hoofd, en stijgt er een grijze zucht uit hem op die vervliegt. Hoe groter
  // de prijs, hoe groter de zucht. Dat geldt voor iedereen met een leeftijd — de held, de meester,
  // Wim in een scène — want het hangt aan de leeftijd zelf, niet aan wie de spreuk uitsprak.
  //
  // Alles is een functie van de speltijd sinds het begon, zodat het ook klopt als het spel
  // vooruitgespoeld wordt. Er wordt alleen bijgehouden wat nog naklinkt (`nk`): de spelstaat kent
  // alleen de vlucht zelf, en die is weg zodra hij aankomt.
  const effectenAan = () => metSprites() && !!T.sprites.effectenAan;

  // Een vast toevalsgetal (0..1) uit drie gehele getallen, voor deeltjes die elk beeld op
  // dezelfde plek moeten uitkomen.
  function hasj(a, b, c) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const kleur = (ramp, stap) => {
    const r = T.sprites.effectRamp(ramp);
    return r ? r[Math.max(0, Math.min(r.length - 1, stap))] : '#ffffff';
  };
  const effect = (naam, beeld, rij) => T.sprites.effect(naam, beeld, rij);
  const duurVan = (naam) => {
    const v = T.sprites.effectVel(naam);
    return v ? v.beelden / v.fps : 0;
  };

  // Losse pixels, per kleur verzameld: zo wordt een kleur maar één keer per beeld gezet. `maat`:
  // 1 of 2 pixels in het vierkant.
  const stippen = new Map(); // kleur → [x, y, maat, x, y, maat, ...]
  function stip(x, y, k, maat) {
    let l = stippen.get(k);
    if (!l) stippen.set(k, (l = []));
    l.push(Math.round(x), Math.round(y), maat || 1);
  }
  function tekenStippen(ctx) {
    for (const [k, l] of stippen) {
      if (!l.length) continue;
      ctx.fillStyle = k;
      for (let i = 0; i < l.length; i += 3) ctx.fillRect(l[i], l[i + 1], l[i + 2], l[i + 2]);
      l.length = 0;
    }
  }

  // ---- een laag over een figuur: de schaduw van ouderdom, een lichtflits, een klap
  //
  // Een dambord in één kleur, alleen op de pixels van de figuur zelf (en alleen tussen de rijen
  // `van` en `tot` van zijn cel). Het dambord ligt vast op het raster van de wereld, zodat het
  // niet kruipt. Dichtheid 0,5 is om de pixel, 0,25 om de twee.
  const laag = { canvas: null, ctx: null, patronen: new Map() };
  const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function patroon(k, dichtheid) {
    const sleutel = `${k}|${dichtheid}`;
    if (laag.patronen.has(sleutel)) return laag.patronen.get(sleutel);
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 4;
    const cx = c.getContext('2d');
    cx.fillStyle = k;
    for (let i = 0; i < 16; i++) if ((BAYER4[i] + 0.5) / 16 < dichtheid) cx.fillRect(i & 3, i >> 2, 1, 1);
    const p = laag.ctx.createPattern(c, 'repeat');
    laag.patronen.set(sleutel, p);
    return p;
  }
  function overlaag(ctx, deel, px, py, k, dichtheid, van, tot) {
    if (!deel || dichtheid <= 0) return;
    if (!laag.canvas) {
      laag.canvas = document.createElement('canvas');
      laag.canvas.width = 192;
      laag.canvas.height = 192;
      laag.ctx = laag.canvas.getContext('2d');
    }
    // een boom of een gebouw buiten is groter dan een figuur: dan groeit het vlak mee
    if (deel.b > laag.canvas.width || deel.h > laag.canvas.height) {
      laag.canvas.width = Math.max(laag.canvas.width, deel.b);
      laag.canvas.height = Math.max(laag.canvas.height, deel.h);
    }
    const ox = Math.round(px - deel.ax);
    const oy = Math.round(py - deel.ay);
    const a = Math.max(0, van == null ? 0 : van);
    const b = Math.min(deel.h, tot == null ? deel.h : tot);
    if (b <= a) return;
    const c = laag.ctx;
    c.globalCompositeOperation = 'copy';
    c.drawImage(deel.beeld, deel.sx, deel.sy, deel.b, deel.h, 0, 0, deel.b, deel.h);
    c.globalCompositeOperation = 'source-in';
    const p = patroon(k, dichtheid);
    p.setTransform(new DOMMatrix([1, 0, 0, 1, -(((ox % 4) + 4) % 4), -(((oy % 4) + 4) % 4)]));
    c.fillStyle = p;
    c.fillRect(0, a, deel.b, b - a);
    c.globalCompositeOperation = 'source-over';
    ctx.drawImage(laag.canvas, 0, 0, deel.b, deel.h, ox, oy, deel.b, deel.h);
  }

  // ---- wat er naklinkt

  const nk = { S: null, tijd: -1, lijst: [], gezien: new WeakSet(), stand: new WeakMap() };

  // Een wezen op een tegel, levend of anders dood (de eerste schicht van een doorboring vertrekt
  // vanuit een monster dat misschien net gevallen is).
  function wezenOpTegel(w, x, y) {
    let dood = null;
    for (const e of w.wezens) {
      if (e.tx !== x || e.ty !== y) continue;
      if (!e.dood) return e;
      dood = e;
    }
    return dood;
  }

  // Waar een spreuk bij een wezen vertrekt: uit de bol op zijn staf als hij die heeft (gemeten op
  // zijn vel, in het beeld van nu), en anders uit zijn hand, een stukje naar het doel toe.
  function bronPunt(e, naarTegel) {
    const p = T.naarScherm(e.x, e.y);
    const b = T.sprites.bron(e);
    if (b) return { x: p.x + b[0], y: p.y + b[1] };
    const q = T.naarScherm(naarTegel.x, naarTegel.y);
    const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: p.x + ((q.x - p.x) / d) * 8, y: p.y - Math.round(T.sprites.hoogte(e.soort) * 0.55) };
  }
  // Waar een spreuk aankomt: midden op het lijf van wie er staat, halverwege een deur, of net
  // boven de vloer.
  function doelPunt(S, tegel) {
    const p = T.naarScherm(tegel.x, tegel.y);
    const e = wezenOpTegel(S.wereld, tegel.x, tegel.y);
    if (e) {
      const q = T.naarScherm(e.x, e.y);
      return { x: q.x, y: q.y - Math.round(T.sprites.hoogte(e.soort) * 0.5) };
    }
    return { x: p.x, y: p.y - (T.deurOp(S.wereld, tegel.x, tegel.y) ? 40 : 22) };
  }

  function maakVlucht(S, fx, geboren) {
    const wie = wezenOpTegel(S.wereld, fx.van.x, fx.van.y);
    const vuur = fx.soort === 'schicht';
    const van = wie ? bronPunt(wie, fx.naar) : (() => {
      const p = T.naarScherm(fx.van.x, fx.van.y);
      return { x: p.x, y: p.y - 30 };
    })();
    return {
      soort: vuur ? 'vuurvlucht' : 'windvlucht', geboren, vlucht: fx.duur,
      duur: fx.duur + (vuur ? 0.3 : 1.4),
      van, naar: doelPunt(S, fx.naar),
      tegelVan: { x: fx.van.x, y: fx.van.y }, tegelNaar: { x: fx.naar.x, y: fx.naar.y },
      grondVan: T.naarScherm(fx.van.x, fx.van.y), grondNaar: T.naarScherm(fx.naar.x, fx.naar.y),
      zaad: Math.floor(geboren * 1000), buiten: !!S.wereld.buiten,
    };
  }

  // Een inslag of vlaag komt waar de vlucht aankwam die daar net landde, op lijfhoogte.
  function aankomst(soort, x, y) {
    for (let i = nk.lijst.length - 1; i >= 0; i--) {
      const n = nk.lijst[i];
      if (n.soort === soort && n.tegelNaar.x === x && n.tegelNaar.y === y) return n.naar;
    }
    const q = T.naarScherm(x, y);
    return { x: q.x, y: q.y - 24 };
  }

  // De prijs. Hoe groter, hoe groter de zucht, hoe langer de schaduw over hem heen trekt, en
  // vanaf een half jaar stijgen er kleinere zuchten naast op. De zucht krult met de wind mee.
  // De adem gaat naar voren, de kant op waar hij kijkt, en stijgt dan op: zo trekt hij langs
  // zijn gezicht in plaats van eroverheen.
  const VOORUIT = { Z: 0, ZW: -1, W: -1, NW: -1, N: 0, NO: 1, O: 1, ZO: 1 };
  function maakZucht(S, e, maanden, geboren) {
    const p = T.naarScherm(e.x, e.y);
    const hoofd = T.sprites.hoofd(e) || [0, -Math.round(T.sprites.hoogte(e.soort) * 0.62)];
    const vooruit = VOORUIT[e.beeldStand ? e.beeldStand.richting : 'Z'] || 0;
    const maat = maanden <= 1 ? 'klein' : maanden <= 4 ? 'middel' : 'groot';
    const extra = Math.min(3, Math.floor(maanden / 6));
    const zaad = Math.floor(geboren * 1000);
    // hij krult met de wind mee; waait er niets, dan de kant op waar hij kijkt
    const links = S.wind < -0.05 || (Math.abs(S.wind) <= 0.05 && vooruit < 0);
    return {
      soort: 'zucht', wie: e, maanden, maat, geboren, extra, zaad,
      duur: Math.max(duurVan('zucht-' + maat), extra ? 0.2 * extra + duurVan('zucht-klein') : 0),
      sluier: Math.min(0.62, 0.26 + 0.03 * maanden),
      x: p.x + hoofd[0] + vooruit * 7, y: p.y + hoofd[1] - 5,
      // rij: variant a of b, en gespiegeld als hij naar links krult
      rij: (hasj(zaad, 3, 5) < 0.5 ? 0 : 2) + (links ? 1 : 0),
      links,
    };
  }

  // Het getal dat T.verouder boven een zuchtend hoofd zet, schuift opzij, naar de kant waar de
  // zucht niet heen krult: dan lees je allebei, het getal en wat het kostte.
  function opzijVoorZucht(S, fx) {
    for (const n of nk.lijst) {
      if (n.soort === 'zucht' && n.wie.x === fx.x && n.wie.y === fx.y && S.tijd - n.geboren < 2) return n.links ? 20 : -20;
    }
    return 0;
  }

  // Aan het begin van elk beeld: wat is er nieuw in de spelstaat, en wie werd er ouder?
  function werkNaklankBij(S) {
    if (nk.S !== S || S.tijd < nk.tijd) {
      nk.S = S;
      nk.lijst = [];
      nk.gezien = new WeakSet();
      nk.stand = new WeakMap();
    }
    nk.tijd = S.tijd;
    for (const fx of S.effecten) {
      if (nk.gezien.has(fx)) continue;
      nk.gezien.add(fx);
      const geboren = S.tijd - Math.max(0, fx.t);
      if (fx.soort === 'schicht' || fx.soort === 'wind') nk.lijst.push(maakVlucht(S, fx, geboren));
      else if (fx.soort === 'knal') {
        nk.lijst.push({
          soort: 'inslag', geboren, duur: 0.62, p: aankomst('vuurvlucht', fx.x, fx.y),
          tegel: { x: fx.x, y: fx.y }, grond: T.naarScherm(fx.x, fx.y), zaad: Math.floor(geboren * 1000),
        });
      } else if (fx.soort === 'vlaag') {
        nk.lijst.push({
          soort: 'vlaag', geboren, duur: 0.9, p: aankomst('windvlucht', fx.x, fx.y),
          grond: T.naarScherm(fx.x, fx.y), zaad: Math.floor(geboren * 1000),
        });
      }
    }
    // Ouder geworden zonder klap: dat was een spreuk. Het moment staat in het getal dat
    // T.verouder boven zijn hoofd zette (een tekst op zijn plek die net begon).
    for (const e of S.wereld.wezens) {
      if (e.leeftijd == null) continue;
      const st = nk.stand.get(e);
      const flits = e.flits || 0;
      if (!st) {
        nk.stand.set(e, { leeftijd: e.leeftijd, flits });
        continue;
      }
      if (e.leeftijd > st.leeftijd && !(flits > st.flits)) {
        const getal = S.effecten.find((fx) => fx.soort === 'tekst' && fx.x === e.x && fx.y === e.y && fx.t >= 0 && fx.t < 0.5);
        nk.lijst.push(maakZucht(S, e, e.leeftijd - st.leeftijd, S.tijd - (getal ? getal.t : 0)));
      }
      st.leeftijd = e.leeftijd;
      st.flits = flits;
    }
    if (nk.lijst.some((n) => S.tijd - n.geboren >= n.duur)) nk.lijst = nk.lijst.filter((n) => S.tijd - n.geboren < n.duur);
  }

  // ---- de worp: wat er in de bol groeit

  function tekenWorp(ctx, S, e) {
    const t = e.tovert;
    const a = S.tijd - t.begin;
    if (a < 0 || a > t.duur + 0.03) return;
    const f = Math.min(1, a / t.duur);
    const p = T.naarScherm(e.x, e.y);
    const b = T.sprites.bron(e);
    const hoogte = T.sprites.hoogte(e.soort);
    const bron = b ? { x: p.x + b[0], y: p.y + b[1] } : { x: p.x, y: p.y - Math.round(hoogte * 0.6) };
    // Zijn tijd gaat erin: grijze vlokjes die uit zijn lijf losraken en naar de bol worden
    // gezogen, waar ze opgaan in wat daar groeit. Hoe duurder de spreuk, hoe meer.
    const n = Math.min(10, 2 + Math.round(t.maanden / 2));
    for (let i = 0; i < n; i++) {
      const start = 0.45 * hasj(i, 7, 51);
      const g = (f - start) / (1 - start);
      if (g <= 0 || g >= 1) continue;
      const bx = p.x + (hasj(i, 7, 52) - 0.5) * 22;
      const by = p.y - hoogte * (0.3 + 0.35 * hasj(i, 7, 53));
      const plek = (h) => {
        const s = h * h * (3 - 2 * h);
        return [bx + (bron.x - bx) * s + Math.sin(h * Math.PI) * (hasj(i, 7, 54) - 0.5) * 18, by + (bron.y - by) * s];
      };
      const [x, y] = plek(g);
      const [sx, sy] = plek(Math.max(0, g - 0.12));
      stip(sx, sy, kleur('baard', 2));
      stip(x - 0.5, y - 0.5, kleur('baard', g < 0.6 ? 4 : 6), 2);
    }
    if (t.spreuk === 'vuurschicht') T.sprites.teken(ctx, effect('vuuropbouw', Math.floor(f * 5.99)), bron.x, bron.y);
    else if (t.spreuk === 'dwaallicht') T.sprites.teken(ctx, effect('dwaallicht', Math.floor(f * 3.99), 1), bron.x, bron.y);
    else {
      // de lucht draait naar de bol toe
      for (let i = 0; i < 7; i++) {
        const r = 22 * (1 - f) + 3;
        const hoek = i * 0.9 + f * 9 + hasj(i, 3, 61) * 6;
        for (let j = 0; j < 3; j++) {
          const h = hoek - j * 0.22;
          stip(bron.x + Math.cos(h) * r, bron.y + Math.sin(h) * r * 0.7, kleur('water', 7 - j));
        }
      }
    }
    tekenStippen(ctx);
  }

  // ---- de vlucht

  function richtingVan(n) {
    const hoek = Math.atan2(n.naar.y - n.van.y, n.naar.x - n.van.x);
    return ((Math.round(hoek / (Math.PI / 8)) % 16) + 16) % 16;
  }
  const langs = (n, g) => ({ x: n.van.x + (n.naar.x - n.van.x) * g, y: n.van.y + (n.naar.y - n.van.y) * g });

  function tekenVuurvlucht(ctx, S, n) {
    const a = S.tijd - n.geboren;
    // De staart: vonken die de kop achterlaat, die stijgen, met de wind meedrijven en afkoelen van
    // wit naar donkerrood.
    const elk = 1 / 170;
    const leven = 0.26;
    const tot = Math.min(a, n.vlucht);
    for (let k = Math.max(0, Math.floor((a - leven * 1.3) / elk)); k * elk <= tot; k++) {
      const b = a - k * elk;
      const eigen = leven * (0.7 + 0.6 * hasj(k, n.zaad, 1));
      if (b < 0 || b > eigen) continue;
      const q = langs(n, (k * elk) / n.vlucht);
      const x = q.x + (hasj(k, n.zaad, 2) - 0.5) * 4 + S.wind * 10 * b;
      const y = q.y + (hasj(k, n.zaad, 3) - 0.5) * 4 - 18 * b;
      // vlak achter de kop nog dik en heet, verderop losse vonkjes
      stip(x, y, kleur('vuur', Math.max(1, 7 - Math.floor((b / eigen) * 7))), b < 0.05 ? 2 : 1);
    }
    tekenStippen(ctx);
    if (a < n.vlucht) {
      const q = langs(n, a / n.vlucht);
      T.sprites.teken(ctx, effect('vuurkop', Math.floor(a * 16) % 4, richtingVan(n)), q.x, q.y);
    }
    // het loslaten, in de bol
    if (a < 0.15) T.sprites.teken(ctx, effect('loslaten', Math.floor(a * 20)), n.van.x, n.van.y);
  }

  // Een windstoot die je ziet gaan: slierten die golvend naar het doel waaien, stof dat van de
  // vloer opwaait waar hij langskomt, en buiten blaadjes die hij meeneemt en daarna aan de wind
  // van de wereld overlaat.
  function tekenWindvlucht(ctx, S, n) {
    const a = S.tijd - n.geboren;
    const gx = n.grondNaar.x - n.grondVan.x;
    const gy = n.grondNaar.y - n.grondVan.y;
    const glang = Math.hypot(gx, gy) || 1;
    // De baan: uit de bol duikt hij omlaag en scheert dan over de vloer naar zijn doel, zoals een
    // vlaag die je met je staf wegslaat — niet recht als een schicht.
    const hoogVan = n.grondVan.y - n.van.y;
    const hoogNaar = n.grondNaar.y - n.naar.y;
    const pad = (g) => {
      const d = Math.pow(1 - Math.min(1, g), 3);
      return { x: n.grondVan.x + gx * g + (n.van.x - n.grondVan.x) * d, y: n.grondVan.y + gy * g - (hoogNaar + (hoogVan - hoogNaar) * d) };
    };
    const nx = -gy / glang;
    const ny = gx / glang;
    const baan = glang + (hoogVan - hoogNaar) * 0.8; // ongeveer hoe lang de baan in pixels is
    for (let s = 0; s < 6; s++) {
      const kop = (a / n.vlucht) * (1 + 0.25 * hasj(s, n.zaad, 21)) - 0.07 * s;
      if (kop <= 0) continue;
      const stappen = Math.round(16 + 12 * hasj(s, n.zaad, 22));
      const zij = (s - 2.5) * 4;
      const golf = 2 + 2 * hasj(s, n.zaad, 23);
      for (let j = 0; j <= stappen; j++) {
        const g = kop - j / baan;
        if (g < 0 || g > 1.25) continue;
        const t = j / stappen;
        if (t > 0.55 && j & 1) continue; // de staart dunt uit, om de pixel
        const z = zij + Math.sin(g * baan * 0.16 + s * 1.7 - a * 10) * golf;
        const q = pad(g);
        stip(q.x + nx * z, q.y + ny * z * 0.5, kleur('water', t < 0.18 ? 7 : t < 0.55 ? 6 : 5), t < 0.12 ? 2 : 1);
      }
    }
    tekenStippen(ctx);
    const stofDuur = duurVan('stofje');
    const aantal = Math.min(8, 3 + Math.floor(glang / 24));
    for (let i = 0; i < aantal; i++) {
      const u = (i + 0.3 + 0.4 * hasj(i, n.zaad, 31)) / aantal;
      const b = a - u * n.vlucht;
      if (b < 0 || b >= stofDuur) continue;
      const x = n.grondVan.x + gx * u + (hasj(i, n.zaad, 32) - 0.5) * 12 + b * ((gx / glang) * 22 + S.wind * 12);
      const y = n.grondVan.y + gy * u + (hasj(i, n.zaad, 33) - 0.5) * 6 + b * (gy / glang) * 22;
      T.sprites.teken(ctx, effect('stofje', Math.floor((b / stofDuur) * 6), i & 1), x, y);
    }
    if (n.buiten) {
      for (let i = 0; i < 5; i++) {
        const u = 0.15 + 0.75 * hasj(i, n.zaad, 41);
        const b = a - u * n.vlucht;
        if (b < 0 || b > 1.3) continue;
        const weg = 1 - Math.exp(-b * 3.2);
        const x = n.grondVan.x + gx * u + (gx / glang) * 44 * weg + S.wind * 34 * b * b;
        const y = n.grondVan.y + gy * u + (gy / glang) * 22 * weg - (42 * b - 26 * b * b) * (0.7 + 0.6 * hasj(i, n.zaad, 42));
        T.sprites.teken(ctx, effect('blad', (Math.floor(b * 10) + i) % 4, i & 1), x, y);
      }
    }
  }

  // Waar de windstoot aankomt: de lucht krult om het doel heen, en er waait stof op.
  function tekenVlaag(ctx, S, n) {
    const a = S.tijd - n.geboren;
    if (a < 0.4) {
      const r = 9 + a * 55;
      for (let s = 0; s < 3; s++) {
        const begin = s * 2.1 + a * 11;
        for (let j = 0; j < 9; j++) {
          const h = begin - j * 0.13;
          const t = j / 9;
          if (t > 0.5 && j & 1) continue;
          stip(n.p.x + Math.cos(h) * r, n.p.y + Math.sin(h) * r * 0.55, kleur('water', t < 0.25 ? 7 : 6));
        }
      }
      tekenStippen(ctx);
    }
    const stofDuur = duurVan('stofje');
    for (let i = 0; i < 3; i++) {
      const b = a - 0.05 * i;
      if (b < 0 || b >= stofDuur) continue;
      const kant = i - 1;
      T.sprites.teken(ctx, effect('stofje', Math.floor((b / stofDuur) * 6), i & 1), n.grond.x + kant * (8 + b * 26), n.grond.y + 2 - b * 6);
    }
  }

  // ---- de inslag

  function tekenInslag(ctx, S, n) {
    const a = S.tijd - n.geboren;
    const beeld = Math.floor(a * 22);
    if (beeld < 8) T.sprites.teken(ctx, effect('inslag', beeld), n.p.x, n.p.y);
    // Vonken: ze spatten weg, vallen, en koelen af. Elk laat één pixel spoor achter.
    for (let i = 0; i < 14; i++) {
      const leven = 0.3 + 0.3 * hasj(i, n.zaad, 11);
      if (a > leven) continue;
      const hoek = hasj(i, n.zaad, 12) * Math.PI * 2;
      const v = 55 + 75 * hasj(i, n.zaad, 13);
      const vx = Math.cos(hoek) * v;
      const vy = Math.sin(hoek) * v * 0.6 - 50;
      const plek = (t) => [n.p.x + vx * t, n.p.y + vy * t + 190 * t * t];
      const stap = Math.max(2, 7 - Math.floor((a / leven) * 6));
      const [x, y] = plek(a);
      stip(x, y, kleur('vuur', stap), a < leven * 0.4 ? 2 : 1);
      const [x2, y2] = plek(Math.max(0, a - 1 / 60));
      if (Math.round(x2) !== Math.round(x) || Math.round(y2) !== Math.round(y)) stip(x2, y2, kleur('vuur', stap - 2));
    }
    tekenStippen(ctx);
  }

  // Hoe fel valt de flits van een inslag op iets op tegel (x, y)? Een dichtheid voor het dambord.
  function flitsOp(S, x, y) {
    let d = 0;
    for (const n of nk.lijst) {
      if (n.soort !== 'inslag') continue;
      const a = S.tijd - n.geboren;
      if (a >= 0.24) continue;
      const afstand = Math.hypot(x - n.tegel.x, y - n.tegel.y);
      if (afstand > 2.2) continue;
      const trap = (a < 0.08 ? 0 : a < 0.16 ? 1 : 2) + (afstand > 1.2 ? 1 : 0);
      d = Math.max(d, [0.25, 0.125, 0.0625, 0][trap]);
    }
    return d;
  }

  // ---- de zucht

  function tekenZucht(ctx, S, n) {
    const a = S.tijd - n.geboren;
    const drijf = (b) => S.wind * 9 * b * b; // de wind neemt hem mee, eerst weinig, dan meer
    const vel = 'zucht-' + n.maat;
    const d = duurVan(vel);
    if (a < d) T.sprites.teken(ctx, effect(vel, Math.floor(a * T.sprites.effectVel(vel).fps), n.rij), n.x + drijf(a), n.y);
    const dk = duurVan('zucht-klein');
    for (let k = 0; k < n.extra; k++) {
      const b = a - 0.2 * (k + 1);
      if (b < 0 || b >= dk) continue;
      const kant = k % 2 ? 1 : -1;
      const rij = (hasj(n.zaad, k, 7) < 0.5 ? 0 : 2) + (S.wind < 0 ? 1 : 0);
      T.sprites.teken(ctx, effect('zucht-klein', Math.floor(b * T.sprites.effectVel('zucht-klein').fps), rij), n.x + kant * (8 + 4 * k) + drijf(b), n.y + 6 + 3 * k);
    }
  }

  // De schaduw van ouderdom trekt over hem heen: een band grijs die van zijn voeten naar zijn
  // hoofd schuift, met een dichte kern en ijle randen.
  function zuchtVan(e) {
    for (let i = nk.lijst.length - 1; i >= 0; i--) if (nk.lijst[i].soort === 'zucht' && nk.lijst[i].wie === e) return nk.lijst[i];
    return null;
  }
  function tekenSluier(ctx, S, deel, cx, cy, e) {
    const z = zuchtVan(e);
    if (!z) return;
    const a = S.tijd - z.geboren;
    if (a < 0 || a >= z.sluier) return;
    const hoog = T.sprites.hoogte(e.soort) + 4;
    const band = hoog * (z.maanden >= 6 ? 0.5 : 0.34);
    const midden = deel.ay - (a / z.sluier) * (hoog + band) + band / 2;
    const grijs = kleur('baard', 2);
    overlaag(ctx, deel, cx, cy, grijs, 0.25, Math.round(midden - band / 2), Math.round(midden + band / 2));
    if (z.maanden >= 3) overlaag(ctx, deel, cx, cy, grijs, 0.5, Math.round(midden - band / 5), Math.round(midden + band / 5));
  }

  // ---- het dwaallicht

  // Waar hangt het licht nu? Onderweg maakt het een boogje, vanuit de bol op de staf.
  function lichtPlek(S, l) {
    const vliegt = l.van && l.vlucht ? Math.min(1, (S.tijd - l.begin) / l.vlucht) : 1;
    const x = l.van ? l.van.x + (l.x - l.van.x) * vliegt : l.x;
    const y = l.van ? l.van.y + (l.y - l.van.y) * vliegt : l.y;
    const p = T.naarScherm(x, y);
    const deining = Math.round(Math.sin(S.tijd * 2.4 + l.begin * 3) * 3);
    const b = l.wie && vliegt < 1 ? T.sprites.bron(l.wie) : null;
    const start = b ? -b[1] : 46;
    const zacht = vliegt * vliegt * (3 - 2 * vliegt);
    const hoog = Math.round(start + (30 - start) * zacht + Math.sin(vliegt * Math.PI) * 14) + deining;
    return { x: Math.round(p.x), y: Math.round(p.y), hoog, vliegt };
  }

  function tekenDwaallicht(ctx, S, l, dekking) {
    const rest = l.tot === Infinity ? 9 : l.tot - S.tijd;
    if (rest <= 0) return;
    // In de laatste seconde knippert het, steeds sneller: je ziet je tijd opraken. Geen vervagen.
    if (rest < 1 && Math.floor(S.tijd * (5 + (1 - rest) * 16)) % 2) return;
    const plek = lichtPlek(S, l);
    const oy = plek.y - plek.hoog;
    if (dekking < 1) ctx.globalAlpha = dekking;
    const beeld = Math.floor(S.tijd * 10 + l.begin * 7) % 8;
    T.sprites.teken(ctx, effect('dwaallicht', beeld, 0), plek.x, oy);
    // Stipjes die eromheen draaien en knipperen.
    for (let i = 0; i < 3; i++) {
      if (hasj(Math.floor(S.tijd * 8), i, 71) < 0.25) continue;
      const hoek = S.tijd * 2.2 + i * 2.09;
      stip(plek.x + Math.cos(hoek) * 10, oy - 1 + Math.sin(hoek) * 4, kleur('water', i ? 6 : 7));
    }
    // Lokt het iemand, dan roept het: een kring die telkens van het licht wegdeint.
    const w = S.wereld;
    const lokt = dekking >= 1 && w.wezens.some((m) => !m.dood && (m.gelokt === l || (m.afgeleid && m.afgeleid.x === l.x && m.afgeleid.y === l.y)));
    if (lokt) {
      const f = ((S.tijd - l.begin) % 1.2) / 0.55;
      if (f < 1) {
        const r = 6 + f * 13;
        for (let i = 0; i < 12; i++) {
          const h = (i / 12) * Math.PI * 2 + f;
          stip(plek.x + Math.cos(h) * r, oy + Math.sin(h) * r * 0.7, kleur('water', f < 0.5 ? 6 : 5));
        }
      }
    }
    tekenStippen(ctx);
    if (dekking < 1) ctx.globalAlpha = 1;
  }

  // ---- licht op de vloer, onder alles wat erop staat

  function tekenVloerlicht(ctx, S) {
    for (const n of nk.lijst) {
      if (n.soort !== 'inslag') continue;
      const a = S.tijd - n.geboren;
      if (a < 0.24) T.sprites.teken(ctx, effect('lichtpoel-vuur', a < 0.07 ? 0 : a < 0.15 ? 1 : 2), n.grond.x, n.grond.y);
    }
    for (const l of S.lichten) {
      if (!T.isZichtbaar(S.wereld, l.x, l.y)) continue;
      const rest = l.tot === Infinity ? 9 : l.tot - S.tijd;
      if (rest <= 0) continue;
      const plek = lichtPlek(S, l);
      const dip = Math.floor(S.tijd * 10 + l.begin * 7) % 8;
      T.sprites.teken(ctx, effect('lichtpoel-water', dip === 3 || dip === 6 || rest < 1 ? 1 : 0), plek.x, plek.y);
    }
  }

  // ---- de windstoot laat de wereld meewaaien
  //
  // Een boom, een struik of de was langs de baan van een windstoot buigt even mee, zodra de vlaag
  // er langskomt: een duw bovenop de wind van de wereld, in de richting waarin hij waait.
  function windstootOp(S, x, y) {
    let duw = 0;
    for (const n of nk.lijst) {
      if (n.soort !== 'windvlucht') continue;
      const dx = n.tegelNaar.x - n.tegelVan.x;
      const dy = n.tegelNaar.y - n.tegelVan.y;
      const l2 = dx * dx + dy * dy || 1;
      const u = Math.max(0, Math.min(1.3, ((x - n.tegelVan.x) * dx + (y - n.tegelVan.y) * dy) / l2));
      const afstand = Math.hypot(x - (n.tegelVan.x + dx * u), y - (n.tegelVan.y + dy * u));
      if (afstand > 2) continue;
      const b = S.tijd - (n.geboren + u * n.vlucht);
      if (b < 0 || b > 1) continue;
      duw += Math.sign(n.grondNaar.x - n.grondVan.x || 1) * 1.8 * (1 - b) * (1 - b) * (1 - afstand / 2);
    }
    return duw;
  }

  // ---- alles samen, in de effectenlaag

  function tekenSpreukeffecten(ctx, S) {
    for (const e of S.wereld.wezens) if (e.tovert && T.isZichtbaar(S.wereld, e.tx, e.ty)) tekenWorp(ctx, S, e);
    for (const n of nk.lijst) {
      if (n.soort === 'vuurvlucht') tekenVuurvlucht(ctx, S, n);
      else if (n.soort === 'windvlucht') tekenWindvlucht(ctx, S, n);
      else if (n.soort === 'inslag') tekenInslag(ctx, S, n);
      else if (n.soort === 'vlaag') tekenVlaag(ctx, S, n);
    }
    for (const n of nk.lijst) if (n.soort === 'zucht') tekenZucht(ctx, S, n);
  }

  // Donkere randen; in een gevecht kleuren ze een fractie rood mee.
  function tekenVignet(ctx, S, bw, bh) {
    const g = ctx.createRadialGradient(bw / 2, bh / 2, Math.min(bw, bh) * 0.32, bw / 2, bh / 2, Math.max(bw, bh) * 0.75);
    const r = Math.round(45 * S.rasterAlpha);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(${r},0,0,0.6)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, bw, bh);
  }

  function rondje(ctx, x, y, r, kleur) {
    ctx.fillStyle = kleur;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // prefix is bijvoorbeeld 'rgba(255, 214, 110,' — de dekking komt erachter.
  function gloed(ctx, x, y, r, prefix, dekking) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, prefix + dekking + ')');
    g.addColorStop(1, prefix + '0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
})(globalThis.Toren = globalThis.Toren || {});
