// Het beeld. Eerst alle vloeren, dan het gevechtsraster en de markeringen daarop, dan muren,
// deuren, voorwerpen en wezens van achter naar voor, en als laatste de effecten. De muren aan
// de voorkant van de kamer waar de schout staat, worden laag getekend: zo kijk je de kamer in,
// zoals bij een poppenhuis. Kamers waar je niet bent, staan gedimd; kamers waar je nooit
// geweest bent, blijven donker.
//
// Er zijn twee manieren van tekenen. Staat de pixel art klaar (`beelden/`, zie js/sprites.js),
// dan komt alles wat de kunst dekt uit de vellen: vloeren, muren, deuren, voorwerpen, wezens,
// en de flits van een klap (zie "een laag over een figuur" onderaan). Wat er niet in zit — het
// raster, het bereik, de zwevende teksten en de pilaar — blijft
// getekend met vlakken. Met `Spel.debug.vlakken = true` gaat alles terug naar vlakken, om te
// vergelijken.
(function (T) {
  'use strict';

  // De hoogte van het land (werklijst vraag 121, js/hoogte.js): wat op de grond staat, komt op het scherm met de hoogte
  // van de grond eraf. kaartNu is de kaart die getekend wordt (T.tekenScene zet hem); zonder hoogte is opGrond precies
  // T.naarScherm, dus een vlakke kaart tekent pixel voor pixel als vroeger.
  let kaartNu = null;
  let zoomNu = 1; // voor wat ver uitgezoomd grover mag (het graan op een helling)
  const opGrond = (x, y) => T.naarSchermOp(kaartNu, x, y);

  const GEDIMD = 0.58;

  // Hoe het beeld getekend wordt (werklijst vraag 123). `tussenbuffer`: op een groot scherm tekent het spel op de
  // grootste hele deling van het scherm die nog minstens zo groot is, en vergroot de browser het (formaat in
  // js/main.js); op 4K is dat 1920 bij 1080 maal twee.
  // `videokaart`: tekenen met WebGL (js/gl.js), of met het 2D-doek van de browser; de spelregel "Tekenen".
  T.TEKENEN_INSTELLINGEN = {
    tussenbuffer: { b: 1920, h: 1080 },
    videokaart: true,
    ookOpDeProcessor: false, // alleen voor de proeven zonder videokaart (js/gl.js)
  };

  // Het licht met de videokaart (werklijst vraag 125, A; tekenNacht hieronder, js/gl.js): de kleur van het uur
  // (T.lichtKleurVan in js/dag.js) en per lamp een warme plas licht erbij, en daarmee wordt de wereld vermenigvuldigd.
  T.LICHT_INSTELLINGEN = {
    // Hoeveel een lamp in het midden van zijn plas erbij doet: zijn sterkte (js/zien.js) maal dit. Boven 1 maakt een
    // lamp een muur lichter dan overdag (tot twee keer).
    kracht: 2.4,
    // Hoe breed een plas is: de straal van de bron (tegels) maal dit, in pixels op zoom 1; en hoe hoog, tegen de breedte.
    breedte: 44,
    hoogte: 0.7,
    // Het midden van de plas, zoveel pixels boven de voet van de lamp (op zoom 1).
    boven: 12,
    // De kleur van een lamp, per soort (T.lichtBronnen in js/zien.js); 255 is wit.
    kleuren: {
      lantaarn: { r: 255, g: 176, b: 92 },
      herberg: { r: 255, g: 166, b: 80 },
      huis: { r: 255, g: 192, b: 112 },
      feest: { r: 255, g: 158, b: 76 },
      schout: { r: 255, g: 196, b: 120 },
      brand: { r: 255, g: 128, b: 48 },
    },
    // Een vlam flakkert: zoveel van zijn sterkte op en neer, zo snel; een raam half zo veel.
    flakkeren: 0.14,
    flakkerSnelheid: 1,
    // Zonder lantaarn (wie sluipt) zie je 's nachts nog net om je heen: een zwak licht zonder kleur (tegels, 0 tot 1).
    ogen: { straal: 2.5, sterkte: 0.2 },
    // De schaduwen van de zon (vraag 125, B; de spelregel "Schaduwen"): hoe donker, en de kleur ervan.
    zonneschaduw: true,
    schaduw: { sterkte: 0.42, r: 18, g: 22, b: 44 },
  };

  const metSprites = () => !!(T.sprites && T.sprites.aan) && !(T.debug && T.debug.vlakken);
  T.metSprites = metSprites; // ook voor js/doorkijk.js

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
    // De droge beekjes (js/weer.js) liggen in de grond: vallen ze droog of komen ze terug, dan opnieuw.
    const D = T.dorpHier(S);
    const beek = D && D.weer && D.weer.beekDroog ? 1 : 0;
    return `${w.gebied}|${w.huidigeKamer}|${w.bekend.size}|${g}|${metSprites() ? 1 : 0}|${Math.round(S.zoom * 100)}|${padVersie(S)}|${platVan(w).versie}|${beek}|${sneeuwStap(S)}`;
  }

  // Wat plat op de grond groeit (een graspol, bloemen, een varen, paddenstoelen, een kleine steen, een rij kool; vraag
  // 112): niet in de weg, en zo laag dat het niemand bedekt. Het ligt in de buffer van de grond, zodat het per beeld niets
  // kost; op een land van de maker zijn het er een paar honderd. Wat plat is, zegt de tekening zelf (tegels/tegels.js):
  // niet vast, één tegel, en niet hoger dan PLAT_HOOG pixels boven zijn voet.
  const PLAT_HOOG = 24;
  function isPlat(v) {
    const vel = v.vel && T.TEGELS && T.TEGELS[v.vel];
    const t = vel && vel.tiles[v.id];
    return !!(t && !t.vast && !t.beslaat && t.doos && t.doos[1] <= PLAT_HOOG);
  }
  // Per wereld de platte voorwerpen, opnieuw gezocht als de kaart veranderde (T.kaartVersie, js/wereld.js); `versie` gaat
  // alleen omhoog als die lijst echt anders werd, want alleen dan hoeft de grond opnieuw.
  const PLAT = new WeakMap();
  function platVan(w) {
    const kaart = T.kaartVersie(w);
    let p = PLAT.get(w);
    if (p && p.kaart === kaart) return p;
    const lijst = w.buiten ? (w.voorwerpen || []).filter(isPlat) : [];
    const zelfde = p && p.lijst.length === lijst.length && p.lijst.every((v, i) => v === lijst[i]);
    p = { kaart, lijst, versie: p ? p.versie + (zelfde ? 0 : 1) : 0 };
    PLAT.set(w, p);
    return p;
  }
  const isGebakken = (w, v) => !!w.buiten && isPlat(v);
  // Het platte spul in het gebied van een buffer, van achter naar voor; niet op een paadje (js/paden.js), want daar
  // is het weggelopen.
  function tekenPlatIn(c, S, vak) {
    const w = S.wereld;
    const paden = zandVan(S);
    const bv = paden ? w.tegels[0].length + 1 : 0; // de hoekpunten, zoals T.zandHoeken ze legt
    const opPaadje = (x, y) => paden && (paden.zand[y * bv + x] || paden.zand[y * bv + x + 1] || paden.zand[(y + 1) * bv + x] || paden.zand[(y + 1) * bv + x + 1]);
    const lijst = platVan(w).lijst.filter((v) => v.x >= vak.x0 && v.x <= vak.x1 && v.y >= vak.y0 && v.y <= vak.y1 && !opPaadje(v.x, v.y));
    lijst.sort((a, b) => a.x + a.y - (b.x + b.y) || a.y - b.y);
    for (const v of lijst) {
      const p = opGrond(v.x, v.y);
      const dof = randDof(w, v.x, v.y);
      const stuk = metSprites() && T.sprites.buitenAan && T.sprites.buiten(v.vel, v.id, 0);
      if (!stuk || dof <= 0.02) continue;
      if (dof < 1) c.globalAlpha = dof;
      T.sprites.teken(c, stuk, p.x, p.y, 1);
      if (dof < 1) c.globalAlpha = 1;
    }
  }

  // De paadjes van het dorp dat hier ligt (js/paden.js): ze liggen in de grond, dus verandert er een, dan wordt de grond
  // opnieuw getekend. Het gereedschap (gereedschap/wereld.html) laadt js/paden.js niet, en tekent dan alleen de kaart.
  function zandVan(S) {
    const D = T.dorpHier(S);
    return D && D.gebouwen && T.zandHoeken ? { D, zand: T.zandHoeken(D) } : null;
  }
  function padVersie(S) {
    const D = T.dorpHier(S);
    return D && D.gebouwen && T.padVersie ? T.padVersie(D) : '';
  }

  // Ver uitgezoomd (het overzicht, js/main.js, vraag 108, a) wordt de grond niet op de maat van de vlakte bewaard
  // maar op die van het scherm (`k`, de zoom maal de pixels per css-pixel), en gaat het bos om de kaart heen mee in
  // een buffer in plaats van dat elke boom elk beeld opnieuw getekend wordt. Gemeten op 3 okt (Marcel: "Als de
  // performance slecht is, hebben we niks"): in het overzicht waren 2100 van de 2600 tekenopdrachten per beeld bomen
  // van de bosrand, en het spel haalde 13 beelden per seconde. Wat ten noorden en westen van de kaart staat, ligt
  // achter alles op de kaart en gaat in de buffer van de grond; wat ten zuiden en oosten staat, ligt ervóór en gaat in
  // een tweede buffer die na alles komt (bosVoorBij). Dat is dezelfde volgorde als de tekenlijst geeft. Van dichtbij
  // blijft het zoals het was: dan buigt het bos in de wind, en valt een boom weg als hij de schout bedekt.
  const BAK_ZOOM = 0.75;
  const bosGebakken = (S) => !!S.wereld.buiten && S.zoom < BAK_ZOOM;
  // De pixels per vlakte-pixel van de buffers: 1 van dichtbij, minder ver uitgezoomd.
  const bufferSchaal = (S, dpr) => (S.zoom < BAK_ZOOM ? Math.min(1, S.zoom * dpr) : 1);

  function nieuweBuffer(buf, b, h, k) {
    const pb = Math.ceil(b * k);
    const ph = Math.ceil(h * k);
    // Een buffer die opnieuw getekend wordt, krijgt een nieuwe versie: dan stuurt js/gl.js hem opnieuw naar de kaart.
    if (buf.canvas) buf.canvas.versie = (buf.canvas.versie || 0) + 1;
    if (!buf.canvas || buf.canvas.width !== pb || buf.canvas.height !== ph) {
      buf.canvas = document.createElement('canvas');
      buf.canvas.versie = 1;
      buf.canvas.width = pb;
      buf.canvas.height = ph;
      buf.ctx = buf.canvas.getContext('2d');
    }
    buf.b = b;
    buf.h = h;
    buf.k = k;
  }

  function werkGrondBij(S, bw, bh, zicht, inBeeld, dpr) {
    if (!S.grond) S.grond = { canvas: null, ctx: null, vx: 0, vy: 0, b: 0, h: 0, k: 1, sleutel: '' };
    const g = S.grond;
    const b = Math.ceil(bw / S.zoom) + BUFFERRAND * 2;
    const h = Math.ceil(bh / S.zoom) + BUFFERRAND * 2;
    const k = bufferSchaal(S, dpr);
    const past = g.canvas && g.b === b && g.h === h && g.k === k && zicht.x0 >= g.vx && zicht.y0 >= g.vy && zicht.x1 <= g.vx + b && zicht.y1 <= g.vy + h;
    const sleutel = grondSleutel(S) + '|' + k;
    if (past && sleutel === g.sleutel) return g;
    nieuweBuffer(g, b, h, k);
    g.vx = Math.round((zicht.x0 + zicht.x1) / 2 - b / 2);
    g.vy = Math.round((zicht.y0 + zicht.y1) / 2 - h / 2);
    g.sleutel = sleutel;
    const c = g.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, g.canvas.width, g.canvas.height);
    c.setTransform(k, 0, 0, k, -g.vx * k, -g.vy * k);
    c.imageSmoothingEnabled = false;
    const vak = tegelsIn(S.wereld, { x0: g.vx, y0: g.vy, x1: g.vx + b, y1: g.vy + h });
    if (S.wereld.buiten) tekenBuitenGrond(c, S, g);
    tekenVloeren(c, S, inBeeld, vak);
    if (S.wereld.buiten) tekenDrogeBeek(c, S, vak);
    if (S.wereld.buiten) tekenPlatIn(c, S, vak);
    if (bosGebakken(S)) for (const v of bosrandIn(S, g)) if (bosAchter(S.wereld, v)) tekenGebakkenBoom(c, v);
    S.bosVoor = null; // het bos ervóór hoort bij deze grond: het wordt opnieuw gelegd (bosVoorBij)
    return g;
  }

  // De bosrand in het gebied van een buffer, van achter naar voor, zoals de tekenlijst hem zou zetten.
  function bosrandIn(S, g) {
    const w = S.wereld;
    const vak = tegelsIn(w, { x0: g.vx, y0: g.vy, x1: g.vx + g.b, y1: g.vy + g.h }, BOSRAND_DIEP);
    const lijst = [];
    for (let y = vak.y0; y <= vak.y1; y++) {
      for (let x = vak.x0; x <= vak.x1; x++) {
        if (x >= 0 && y >= 0 && x < w.b && y < w.h) continue;
        const v = bosrandOp(w, x, y);
        if (v) lijst.push(v);
      }
    }
    return lijst.sort((a, c) => a.x + a.y - (c.x + c.y) || a.y - c.y);
  }

  // Ligt deze boom van de bosrand achter alles op de kaart? Ten noorden of westen ervan wel, ten zuiden of oosten
  // niet; in een hoek links of rechts in beeld naar de diepte van de hoek van de kaart ernaast.
  function bosAchter(w, v) {
    const noordWest = v.x < 0 || v.y < 0;
    const zuidOost = v.x >= w.b || v.y >= w.h;
    if (noordWest !== zuidOost) return noordWest;
    return v.x + v.y < (v.x >= w.b ? w.b - 1 : w.h - 1);
  }

  // Eén boom van de bosrand in een buffer: zoals tekenBosrandBoom, zonder wind en zonder doorkijk.
  function tekenGebakkenBoom(c, v) {
    const p = opGrond(v.x, v.y);
    const helder = bosrandHelder(v.r);
    const ruw = metSprites() && T.sprites.buitenAan && T.sprites.buiten(v.vel, v.id, 0);
    if (ruw) T.sprites.teken(c, bosrandGedimd(ruw, helder), p.x, p.y, 1);
    else tekenBuitenVlak(c, v, helder);
  }

  // Het bos ten zuiden en oosten van de kaart, in een buffer over hetzelfde gebied als de grond (hierboven).
  function bosVoorBij(S, g) {
    if (S.bosVoor && S.bosVoor.sleutel === g.sleutel && S.bosVoor.vx === g.vx && S.bosVoor.vy === g.vy) return S.bosVoor;
    const buf = S.bosVoor && S.bosVoor.canvas ? S.bosVoor : { canvas: null, ctx: null };
    nieuweBuffer(buf, g.b, g.h, g.k);
    buf.vx = g.vx;
    buf.vy = g.vy;
    buf.sleutel = g.sleutel;
    const c = buf.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, buf.canvas.width, buf.canvas.height);
    c.setTransform(g.k, 0, 0, g.k, -g.vx * g.k, -g.vy * g.k);
    c.imageSmoothingEnabled = false;
    for (const v of bosrandIn(S, g)) if (!bosAchter(S.wereld, v)) tekenGebakkenBoom(c, v);
    S.bosVoor = buf;
    return buf;
  }

  // Wat er op een kaart staat met een eigen bestand (de huizen en de gebouwen, js/sprites.js; vraag 114, stap 1), en de
  // figuren van wie er staat (stap 1b), vast laden: bij een andere kaart, als er iets op veranderde (T.kaartVersie,
  // js/wereld.js), en als er iemand bij kwam of wegging. Per kaart de stand waarvoor dat gebeurde; alleen scherm.
  const geladenVoor = new WeakMap();
  function laadWatErStaat(w) {
    const versie = `${T.kaartVersie(w)}|${w.wezens.length}`;
    if (geladenVoor.get(w) === versie) return;
    geladenVoor.set(w, versie);
    T.sprites.laadWatErStaat(w);
  }

  T.tekenScene = function (ctx, S, bw, bh) {
    const w = S.wereld;
    kaartNu = w;
    zoomNu = S.zoom;
    if (metSprites()) laadWatErStaat(w);
    const dpr = ctx.getTransform().a || 1; // pixels per css-pixel (js/main.js, formaat)
    // Het dorp dat hier ligt (js/dorp.js), of geen: een ander gebied, of het gereedschap.
    const D = T.dorpHier(S);
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
    // Opengewerkt: de kamer van de schout, en in een gevecht elke kamer waarin gevochten wordt.
    const open = w.kamers.filter((k) => inBeeld(k.id));
    const zicht = zichtVlak(S, bw, bh);
    const vak = tegelsIn(w, zicht);

    const g = werkGrondBij(S, bw, bh, zicht, inBeeld, dpr);
    // Op zijn eigen maat (de breedte van het doek gedeeld door zijn schaal), niet op g.b bij g.h: het doek is naar boven
    // afgerond, en dan werd hij ver uitgezoomd een fractie verkleind, met een kolom pixels die wegviel (vraag 123).
    ctx.drawImage(g.canvas, g.vx, g.vy, g.canvas.width / g.k, g.canvas.height / g.k);
    const gebakken = bosGebakken(S);
    tekenWeides(ctx, S, vak);
    tekenRaster(ctx, S);
    tekenMarkeringen(ctx, S);
    tekenBouwSpook(ctx, S);
    tekenVerzoekPlek(ctx, S);
    tekenSpoor(ctx, S);

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
      if (!inVak(vak, v.x, v.y) || !T.isZichtbaar(w, v.x, v.y) || isGebakken(w, v)) continue;
      zichtbaar.push(v);
      const k = T.kamerVan(w, v.x, v.y);
      const helder = k && inBeeld(k.id) ? 1 : GEDIMD;
      // Een gebouw (T.isGebouw: breder of dieper dan één tegel) krijgt `gebouw` mee: alleen dan is
      // één scalair dieptegetal niet genoeg, en zoekt tekenVolgorde zijn plek (zie hieronder).
      lijst.push({ d: diepteVan(v), l: 1, punt: { x: v.x, y: v.y }, gebouw: T.isGebouw(v) ? v : undefined, f: () => tekenVoorwerp(ctx, S, v, helder) });
    }
    // De paaltjes op de hoeken van een vrij erf (js/erven.js): ze staan in de weg van niemand, maar
    // worden als een voorwerp op hun tegel getekend, zodat wie ervoor loopt ervoor staat.
    for (const erf of (D && D.erven) || []) {
      for (const t of T.paaltjesVan(erf)) {
        if (!inVak(vak, t.x, t.y) || !T.isZichtbaar(w, t.x, t.y)) continue;
        lijst.push({ d: t.x + t.y, l: 1, punt: { x: t.x, y: t.y }, f: () => tekenPaaltje(ctx, t.x, t.y) });
      }
    }
    // De akkers (alleen het nieuwe spel, ?kaart=gehucht — ontwerp/werklijst.md punt 1b): welk
    // stadium en welke variant een tegel heeft, weet js/akkers.js (T.akkerStadium e.a.); hier
    // wordt alleen getekend, en alleen wat in beeld staat (vak, net als de muren-loop hierboven —
    // "Performance: teken alleen wat in beeld is"). Groen en rijp wuiven en staan als twee lagen
    // in de tekenlijst, met dezelfde diepte `d` als het wezen dat er misschien op staat maar een
    // lagere/hogere `l`: eerst de achterlaag (l 1, vóór een wezen l 2), dan via de gewone
    // sortering het wezen zelf, dan de voorlaag (l 2,5) erover — zo lijkt een boer tot zijn
    // middel in het graan te staan. De andere drie stadia zijn plat genoeg voor één laag. Zonder
    // sprites blijft een akker gewoon de kale zandgrond die er al ligt.
    if (w.akkers && w.akkers.length && metSprites()) {
      const datum = T.datumVanDag(S.kalender.dag);
      const basis = T.akkerStadium(datum.maand, datum.dagVanMaand);
      const varianten = T.sprites.graanVarianten();
      for (const akker of w.akkers) {
        const ax0 = Math.max(vak.x0, akker.x);
        const ay0 = Math.max(vak.y0, akker.y);
        const ax1 = Math.min(vak.x1, akker.x + akker.b - 1);
        const ay1 = Math.min(vak.y1, akker.y + akker.h - 1);
        for (let y = ay0; y <= ay1; y++) {
          for (let x = ax0; x <= ax1; x++) {
            if (!T.isZichtbaar(w, x, y)) continue;
            const stadium = T.akkerTegelStadium(akker, x, y, basis);
            if (stadium === 'weide') continue; // dat is gras, al getekend (tekenWeides hieronder)
            if (stadium === 'heide' || stadium === 'bos') continue; // nog niet ontgonnen (js/ontginnen.js): wat er al ligt
            const variant = T.akkerVariant(x, y, varianten);
            const p = opGrond(x, y);
            if (stadium === 'groen' || stadium === 'rijp') {
              const frame = T.windBeeld(S.tijd, x, y);
              const achter = T.sprites.graanLaag(stadium, variant, 'achter', frame);
              const voor = T.sprites.graanLaag(stadium, variant, 'voor', frame);
              lijst.push({ d: x + y, l: 1, punt: { x, y }, zonderSchaduw: true, f: () => tekenGraan(ctx, w, achter, x, y, p) });
              lijst.push({ d: x + y, l: 2.5, punt: { x, y }, zonderSchaduw: true, f: () => tekenGraan(ctx, w, voor, x, y, p) });
            } else {
              const deel = T.sprites.graanTegel(stadium, variant);
              const sneeuw = sneeuwLaag(S); // op een kale akker blijft de sneeuw liggen
              lijst.push({ d: x + y, l: 1, punt: { x, y }, zonderSchaduw: true, f: () => {
                tekenGraan(ctx, w, deel, x, y, p);
                if (sneeuw) tekenSneeuwOp(ctx, w, x, y, sneeuw, null);
              } });
            }
          }
        }
      }
    }
    // Het bos om de kaart heen (zie "het bos om de kaart heen" hieronder): dezelfde uitgebreide
    // vak-berekening als tegelsIn, maar met ringen vóórbij de rand in plaats van eraan afgeknipt.
    // Doet mee in `zichtbaar`, zodat een boom die de schout bedekt net als elk ander hoog voorwerp
    // wegdooft (T.werkDoorkijkBij, js/doorkijk.js), en in `lijst`, zodat de gewone dieptesortering
    // hem netjes voor of achter de schout zet.
    if (w.buiten && !gebakken) {
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
    // Doorkijk: wat de schout of een wezen bedekt, wordt zolang doorzichtig. De tijd komt uit de
    // spelklok, zodat het ook klopt als het spel even stilstaat of vooruitgespoeld wordt.
    const dt = Math.max(0, Math.min(0.1, S.tijd - (S.doorkijkTijd || 0)));
    S.doorkijkTijd = S.tijd;
    T.werkDoorkijkBij(S, dt, zichtbaar);
    // Wie aan de schandpaal staat, krijgt het halsijzer om: een eigen laag ná zijn beeld (l 2,5,
    // zoals de voorlaag van het graan), zodat de band vóór zijn nek komt.
    const aanDePaal = metSprites() && D && T.aanDePaal ? T.aanDePaal(D) : null;
    for (const e of w.wezens) {
      // Met sprites blijft het laatste beeld van het sterven liggen; met vlakken vervaagt het.
      if (e.dood && e.sterfTijd > 0.8 && !metSprites()) continue;
      if (e.binnen && !deurStap(S, e)) continue; // 's nachts in zijn huis (js/dag.js); net binnen: hij stapt nog de deur in
      if (!inVak(vak, e.tx, e.ty) || !T.isZichtbaar(w, e.tx, e.ty)) continue;
      lijst.push({ d: e.x + e.y, l: e.dood ? 1.5 : 2, punt: { x: e.tx, y: e.ty }, f: () => tekenWezen(ctx, S, e) });
      if (e === aanDePaal) lijst.push({ d: e.x + e.y, l: 2.5, punt: { x: e.tx, y: e.ty }, f: () => tekenHalsijzer(ctx, e) });
    }
    heuvelsErvoor(ctx, S, vak, lijst, g); // een heuvel voor iemand dekt hem af (js/hoogte.js; vraag 121, stap 2)
    // Ramen die branden: meteen na hun gebouw gaat er een gat in het doek waar ze zitten, dat na de
    // nacht licht wordt (brandendeRamen, hieronder).
    const ramen = brandendeRamen(S);
    tekenZonneschaduw(ctx, S, lijst);
    for (const item of tekenVolgorde(lijst)) {
      item.f();
      for (const r of ramen) if (isTekeningVan(item, r.g)) ponsRamen(ctx, r);
    }
    // Ver uitgezoomd: het bos ten zuiden en oosten van de kaart, uit zijn buffer (werkGrondBij hierboven).
    if (gebakken) {
      const voor = bosVoorBij(S, g);
      ctx.drawImage(voor.canvas, voor.vx, voor.vy, voor.canvas.width / g.k, voor.canvas.height / g.k);
    }
    tekenOntginRand(ctx, S);
    tekenJachtRand(ctx, S);
    tekenRook(ctx, S);
    ctx.restore();

    // De nacht valt over de wereld, maar niet over de zwevende teksten: die komen erna, met dezelfde
    // camera als hierboven. Ertussen gaan de ramen aan.
    tekenNacht(ctx, S, bw, bh);
    tekenNeerslag(ctx, S, bw, bh);
    ctx.save();
    ctx.translate(Math.round(bw / 2), Math.round(bh / 2));
    ctx.scale(S.zoom, S.zoom);
    ctx.translate(-Math.round(S.camera.x), -Math.round(S.camera.y));
    for (const r of ramen) vulRamen(ctx, S, r);
    tekenOgen(ctx, S);
    tekenVuur(ctx, S);
    tekenHuisTekens(ctx, S);
    tekenOogjes(ctx, S);
    tekenWolkjes(ctx, S);
    tekenEffecten(ctx, S);
    ctx.restore();
    tekenVignet(ctx, S, bw, bh);
  };

  // Een heuvel voor iemand dekt hem af (werklijst vraag 121, stap 2; Marcel, 8 okt: "Akkoord"). De grond ligt als één
  // buffer onder alles (werkGrondBij), dus wie achter de rand van een richel staat, stond er bovenop. Een tegel die
  // afdekt (T.dektAf, js/hoogte.js) komt daarom nog een keer in de tekenlijst, op zijn eigen diepte en vóór wat er op hem
  // staat: zijn stuk van de grondbuffer, uitgeknipt op zijn vlak en zijn wanden. Alleen als er achter hem iets staat. Wie
  // je hoort te zien (T.zichtbaarDoor, js/doorkijk.js, zoals de schout), krijgt er het kijkgat van de doorkijk bij, na de
  // voorste tegel die hem afdekt, net als achter een huis.
  const ACHTER = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2]];
  function heuvelsErvoor(ctx, S, vak, lijst, g) {
    const w = S.wereld;
    if (!w.hoogte) return;
    let staat = null; // de tegels waar iets op staat dat getekend wordt
    let kijkgaten = null; // wezen → het item van de voorste tegel die hem afdekt
    for (let y = Math.max(0, vak.y0); y <= Math.min(w.h - 1, vak.y1); y++) {
      for (let x = Math.max(0, vak.x0); x <= Math.min(w.b - 1, vak.x1); x++) {
        if (!T.dektAf(w, x, y)) continue;
        if (!staat) {
          staat = new Set();
          for (const it of lijst) if (it.punt) staat.add(it.punt.x + ',' + it.punt.y);
        }
        if (!ACHTER.some(([i, j]) => staat.has(x - i + ',' + (y - j)))) continue;
        const item = { d: x + y, l: 0.5, punt: { x, y }, zonderSchaduw: true, f: () => tekenTegelOpnieuw(ctx, w, x, y, g) };
        lijst.push(item);
        for (const e of w.wezens) {
          if (!ACHTER.some(([i, j]) => e.tx === x - i && e.ty === y - j) || T.zichtbaarDoor(S, e) !== 'alles') continue;
          kijkgaten = kijkgaten || new Map();
          const was = kijkgaten.get(e);
          if (!was || was.d < item.d) kijkgaten.set(e, item);
        }
      }
    }
    if (kijkgaten) {
      for (const [e, item] of kijkgaten) {
        const teken = item.f;
        item.f = () => {
          teken();
          T.tekenKijkgat(ctx, S, e, 1, null);
        };
      }
    }
  }
  // Het stuk van de grondbuffer op tegel (x, y): zijn schuine vlak, en zijn wanden aan de zuid- en oostkant.
  function tekenTegelOpnieuw(ctx, w, x, y, g) {
    const h = T.hoekHoogten(w, x, y);
    ctx.save();
    ctx.beginPath();
    T.HOOGTE_HOEKEN.forEach(([dx, dy], k) => {
      const p = T.naarScherm(x + dx, y + dy);
      if (k) ctx.lineTo(p.x, p.y - h[k]);
      else ctx.moveTo(p.x, p.y - h[k]);
    });
    ctx.closePath();
    for (const wand of T.wandenVan(w, x, y)) {
      const s1 = T.naarScherm(wand.van[0], wand.van[1]);
      const s2 = T.naarScherm(wand.tot[0], wand.tot[1]);
      ctx.moveTo(s1.x, s1.y - wand.boven[0]);
      ctx.lineTo(s2.x, s2.y - wand.boven[1]);
      ctx.lineTo(s2.x, s2.y - wand.onder[1]);
      ctx.lineTo(s1.x, s1.y - wand.onder[0]);
      ctx.closePath();
    }
    ctx.clip();
    ctx.drawImage(g.canvas, g.vx, g.vy, g.canvas.width / g.k, g.canvas.height / g.k);
    ctx.restore();
  }

  // De nacht en de schemering (js/dag.js, T.lichtVan): een donkerblauwe laag over de wereld, lichter
  // rond de schout. Zo zie je 's nachts wat vlak bij je is, en niet wat verder weg gebeurt (Marcel,
  // 26 sep: "Omdat de camera de schout volgt, 'zie' je ook niet alles"). Rond zonsopgang en
  // zonsondergang een warme gloed. Alleen waar een kalender is (het gehucht). Spel.debug.geenNacht =
  // true zet hem uit, om te vergelijken.
  //
  // Met de videokaart (werklijst vraag 125, A) is het licht een lichtkaart: de kleur van het uur over het hele beeld,
  // met per lamp een warme plas erbij, en daarmee wordt de wereld vermenigvuldigd (js/gl.js, tekenLichtkaart). Zonder
  // videokaart blijft het de donkere laag van hiervoor (Marcel, 4 okt: "zonder videokaart wordt er bijna niet meer
  // gespeeld"), met de lantaarn van de schout als gloed erbij.
  function tekenNacht(ctx, S, bw, bh) {
    if (!S.kalender || !T.lichtVan || (T.debug && T.debug.geenNacht)) return;
    // Het weer (js/weer.js; vraag 82, c, en Marcel, 4 okt: "A"): de kleur van het uur maal die van het weer, grijzer als
    // het regent of bewolkt is.
    const weer = weerHier(S);
    const tint = weer ? T.WEER_INSTELLINGEN.beeld.tint[weer] : null;
    if (ctx.tekenLichtkaart) {
      const k = T.lichtKleurVan(S.kalender.dag);
      ctx.tekenLichtkaart(tint ? k.map((v, i) => v * tint[i]) : k, lichtenInBeeld(S, bw, bh));
      return;
    }
    ctx.save();
    // Alleen over wat er getekend is: waar een raam brandt, zit nog een gat in het doek (ponsRamen
    // hieronder), en daar valt de nacht niet in. Op de rest is dit hetzelfde als gewoon eroverheen.
    ctx.globalCompositeOperation = 'source-atop';
    // Zonder videokaart is het weer een grijze waas over de wereld.
    const waas = weer ? T.WEER_INSTELLINGEN.beeld.waas[weer] : 0;
    if (waas > 0) {
      ctx.fillStyle = `rgba(48, 56, 72, ${waas})`;
      ctx.fillRect(0, 0, bw, bh);
    }
    tekenNachtLagen(ctx, S, bw, bh);
    ctx.restore();
  }

  // De schaduwen van de zon (werklijst vraag 125, B, de proefplaat; Marcel, 4 okt: "B graag"): alles wat in de tekenlijst
  // staat, nog een keer, als silhouet scheef over de grond vanaf zijn onderrand (js/gl.js, beginSchaduw), in de richting
  // en de lengte die de zon zegt (T.zonStand in js/dag.js). De silhouetten worden één vlak, zodat twee schaduwen over
  // elkaar niet donkerder zijn, en dat gaat over de grond, onder alles wat erop staat. Alleen met de videokaart, buiten, en
  // met de spelregel "Schaduwen" op "Met de zon". De plaatjes van het spel hebben geen schaduw op de grond (de bouwer
  // snijdt ze zonder); alleen onder een figuur ligt het ovaaltje van tekenWezen, als de plek waar hij staat.
  function tekenZonneschaduw(ctx, S, lijst) {
    const L = T.LICHT_INSTELLINGEN;
    if (!L.zonneschaduw || !ctx.beginSchaduw || !S.kalender || !S.wereld.buiten || !metSprites()) return;
    const z = T.zonStand(S.kalender.dag);
    if (z.sterkte <= 0.01) return;
    // Een richting over de grond, op het scherm: een tegel is 64 breed en 32 hoog, dus de y gaat half mee.
    const sx = ((z.x - z.y) / Math.SQRT2) * z.lengte;
    const sy = ((z.x + z.y) / (2 * Math.SQRT2)) * z.lengte;
    ctx.beginSchaduw(sx, sy);
    for (const item of lijst) if (!item.zonderSchaduw) item.f();
    const k = L.schaduw;
    ctx.eindSchaduw(k.sterkte * z.sterkte, [k.r / 255, k.g / 255, k.b / 255]);
  }

  // De lampen die nu branden, als plassen licht op het scherm: { x, y, rx, ry, k: [r, g, b] }, met k wat de lamp in het
  // midden erbij doet (vraag 125, A). Een vlam flakkert, elk in zijn eigen ritme uit zijn plek, op de klok van het scherm.
  // Zonder lantaarn krijgt de schout 's nachts een zwak licht zonder kleur, zodat je nog net ziet waar je loopt.
  function lichtenInBeeld(S, bw, bh) {
    const D = T.dorpHier(S);
    const nacht = nachtVan(S);
    if (!D || nacht <= 0.01) return [];
    const L = T.LICHT_INSTELLINGEN;
    const bronnen = T.lichtBronnen(D).slice();
    const h = S.schout;
    if (h && D.schout === h && !h.binnen && !h.dood && !T.draagtLantaarn(D) && !T.schoutIsWeg(D)) {
      bronnen.push({ x: h.x, y: h.y, straal: L.ogen.straal, sterkte: L.ogen.sterkte, soort: 'ogen' });
    }
    const uit = [];
    for (const b of bronnen) {
      const q = opGrond(b.x, b.y);
      const x = Math.round(bw / 2) + (q.x - Math.round(S.camera.x)) * S.zoom;
      const y = Math.round(bh / 2) + (q.y - L.boven - Math.round(S.camera.y)) * S.zoom;
      const rx = Math.max(1, b.straal * L.breedte * S.zoom);
      const ry = rx * L.hoogte;
      if (x + rx < 0 || y + ry < 0 || x - rx > bw || y - ry > bh) continue;
      const kleur = L.kleuren[b.soort] || { r: 255, g: 255, b: 255 };
      // Flakkeren: twee golven door elkaar, met een fase uit de plek, zodat de lampen niet samen knipperen.
      const fase = ((Math.sin(b.x * 12.9898 + b.y * 78.233) * 43758.5453) % 1) * Math.PI * 2;
      const t = S.tijd * L.flakkerSnelheid;
      const golf = 0.6 * Math.sin(t * 7.1 + fase) + 0.4 * Math.sin(t * 12.7 + fase * 2.3);
      const flakker = b.soort === 'ogen' ? 0 : b.soort === 'huis' ? L.flakkeren / 2 : b.soort === 'brand' ? L.flakkeren * 3 : L.flakkeren;
      const n = b.sterkte * L.kracht * nacht * (1 + flakker * golf);
      uit.push({ x, y, rx, ry, k: [(kleur.r / 255) * n, (kleur.g / 255) * n, (kleur.b / 255) * n] });
    }
    return uit;
  }
  function tekenNachtLagen(ctx, S, bw, bh) {
    const l = T.lichtVan(S.kalender.dag);
    if (l.gloed > 0.01) {
      ctx.fillStyle = `rgba(255, 150, 70, ${(0.1 * l.gloed).toFixed(3)})`;
      ctx.fillRect(0, 0, bw, bh);
    }
    if (l.donker < 0.01) return;
    // De schout op het scherm, met dezelfde omrekening als de camera in T.tekenScene; het licht
    // valt om zijn lijf, niet om zijn voeten.
    const h = S.schout;
    const p = h ? opGrond(h.x, h.y) : null;
    const sx = p ? Math.round(bw / 2) + (p.x - Math.round(S.camera.x)) * S.zoom : bw / 2;
    const sy = p ? Math.round(bh / 2) + (p.y - 20 - Math.round(S.camera.y)) * S.zoom : bh / 2;
    const tegels = T.DAG_INSTELLINGEN ? T.DAG_INSTELLINGEN.lichtStraal : 5;
    const straal = Math.max(1, tegels * 32 * S.zoom);
    const verloop = ctx.createRadialGradient(sx, sy, straal * 0.25, sx, sy, straal * 1.4);
    verloop.addColorStop(0, `rgba(12, 18, 40, ${(l.donker * 0.35).toFixed(3)})`);
    verloop.addColorStop(1, `rgba(12, 18, 40, ${l.donker.toFixed(3)})`);
    ctx.fillStyle = verloop;
    ctx.fillRect(0, 0, bw, bh);
    // Warm licht in het donker (js/zien.js, T.lichtBronnen): de lantaarns op de kaart, 's avonds, en de
    // herberg, warmer naarmate er meer gasten binnen zitten (js/herberg.js, T.herbergLicht). Zo zie je
    // van ver waar het dorp 's avonds is, en waar je gezien wordt. De ramen van de herberg branden ook
    // (brandendeRamen hieronder).
    const nacht = nachtVan(S); // vol als het nacht is, zwakker in de schemering
    const D = T.dorpHier(S);
    for (const b of T.lichtBronnen && D ? T.lichtBronnen(D) : []) {
      const q = opGrond(b.x, b.y);
      const lx = Math.round(bw / 2) + (q.x - Math.round(S.camera.x)) * S.zoom;
      const ly = Math.round(bh / 2) + (q.y - 24 - Math.round(S.camera.y)) * S.zoom;
      const r = Math.max(1, b.straal * 32 * S.zoom);
      const gloed = ctx.createRadialGradient(lx, ly, 0, lx, ly, r);
      gloed.addColorStop(0, `rgba(255, 186, 104, ${(b.sterkte * nacht).toFixed(3)})`);
      gloed.addColorStop(1, 'rgba(255, 186, 104, 0)');
      ctx.fillStyle = gloed;
      ctx.fillRect(lx - r, ly - r, 2 * r, 2 * r);
    }
  }

  // Het weer hier (js/weer.js): 'zon', 'wolken', 'regen' of 'sneeuw', of null binnen, in het gereedschap of zonder weer.
  function weerHier(S) {
    if (!S.wereld || !S.wereld.buiten || (T.debug && T.debug.geenNacht)) return null;
    const W = T.weerVan(T.dorpHier(S));
    return W ? W.vandaag : null;
  }

  // Een getal van 0 tot 1 uit twee getallen, alleen voor het beeld (de regen en de beek; geen regel).
  const beeldLot = (a, b) => {
    const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };

  // Regen en sneeuw (Marcel, 9 okt: "Ook in beeld"): strepen en vlokjes over het hele beeld, op de klok van het scherm
  // (S.tijd), zodat het op 30× niet harder regent. Elke druppel heeft een vaste plek uit zijn nummer, en valt door het
  // beeld; de wind trekt ze een beetje schuin. Vlakken, geen lijnen: dat tekent de videokaart zelf (js/gl.js).
  function tekenNeerslag(ctx, S, bw, bh) {
    const weer = weerHier(S);
    if (weer !== 'regen' && weer !== 'sneeuw') return;
    const B = T.WEER_INSTELLINGEN.beeld;
    const regen = weer === 'regen';
    const n = Math.min(B.hooguit, Math.round(((bw * bh) / 10000) * (regen ? B.druppels : B.vlokken)));
    const t = S.tijd || 0;
    const lengte = regen ? B.druppelLengte : 0;
    const H = bh + lengte + 8;
    const W = bw + 40;
    ctx.save();
    ctx.fillStyle = regen ? B.regenKleur : B.sneeuwKleur;
    for (let i = 0; i < n; i++) {
      const snel = (regen ? B.valRegen : B.valSneeuw) * (0.75 + 0.5 * beeldLot(i, 3));
      const y = ((beeldLot(i, 2) * H + t * snel) % H) - lengte;
      const opzij = regen ? t * snel * B.wind : t * B.windSneeuw + Math.sin(t * 0.9 + i) * 10;
      const x = ((((beeldLot(i, 1) * W + opzij) % W) + W) % W) - 20;
      if (regen) ctx.fillRect(x, y, 1.5, lengte * (0.7 + 0.6 * beeldLot(i, 4)));
      else {
        const m = beeldLot(i, 5) < 0.35 ? 4 : 3;
        ctx.fillRect(x, y, m, m);
      }
    }
    ctx.restore();
  }

  // Sneeuw op de grond (js/weer.js, D.weer.sneeuw; vraag 144, 4): per tegel, op het vlak van de tegel, een sneeuwlaag uit
  // blokjes van twee pixels, die dichter wordt naarmate er meer ligt: eerst plukjes, dan helemaal wit. Elk blokje heeft
  // een vaste drempel (sneeuwDrempel: zachte ruis die over de tegel heen doorloopt, plus wat toeval), dus elk niveau bevat
  // het vorige, en tegels met een ander niveau lopen in elkaar over. Hoeveel er op een tegel ligt, verloopt zacht over
  // het land (sneeuwRuis); op een paadje minder, en op water niets.
  const SNEEUW_STAPPEN = 16;
  const sneeuwTegels = [];
  // De ruis is periodiek over de tegel (in tegelcoördinaten u, v van 0 tot 1, op een rooster van vier), zodat hij aan de
  // rand van de ene tegel verdergaat in de volgende.
  function sneeuwDrempel(x, y) {
    const sx = (x + 1 - 32) / 32;
    const sy = (y + 1 - 16) / 16;
    const u = (((sx + sy) / 2 + 0.5) % 1 + 1) % 1;
    const v = (((sy - sx) / 2 + 0.5) % 1 + 1) % 1;
    const N = 4;
    const gu = Math.floor(u * N);
    const gv = Math.floor(v * N);
    const fu = u * N - gu;
    const fv = v * N - gv;
    const zacht = (t) => t * t * (3 - 2 * t);
    const r = (a, b) => beeldLot(((a % N) + N) % N + 101, ((b % N) + N) % N + 211);
    const boven = r(gu, gv) + (r(gu + 1, gv) - r(gu, gv)) * zacht(fu);
    const onder = r(gu, gv + 1) + (r(gu + 1, gv + 1) - r(gu, gv + 1)) * zacht(fu);
    const ruis = boven + (onder - boven) * zacht(fv);
    return 0.62 * ruis + 0.38 * beeldLot(x >> 1, (y >> 1) + 57);
  }
  function sneeuwTegel(stap) {
    if (sneeuwTegels[stap]) return sneeuwTegels[stap];
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 32;
    const k = c.getContext('2d');
    const beeld = k.createImageData(64, 32);
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 64; x++) {
        if (Math.abs(x + 0.5 - 32) / 32 + Math.abs(y + 0.5 - 16) / 16 > 1) continue;
        const bx = x >> 1;
        const by = y >> 1;
        if (sneeuwDrempel(bx << 1, by << 1) * SNEEUW_STAPPEN >= stap) continue;
        // twee tinten wit, en hier en daar een blauwige schaduw, op vaste plekken
        const schaduw = beeldLot(bx * 3 + (by % 7), by * 5 + (bx % 5)) < 0.18;
        const i = (y * 64 + x) * 4;
        beeld.data[i] = schaduw ? 214 : 240;
        beeld.data[i + 1] = schaduw ? 224 : 244;
        beeld.data[i + 2] = schaduw ? 238 : 250;
        beeld.data[i + 3] = 255;
      }
    }
    k.putImageData(beeld, 0, 0);
    c.versie = 1; // eens getekend, blijft hij zo (js/gl.js)
    return (sneeuwTegels[stap] = c);
  }
  // Hoeveel sneeuw er hier ligt, van 0 tot 1, of 0 zonder dorp of weer.
  function sneeuwLaag(S) {
    const D = T.dorpHier(S);
    return (D && D.weer && T.WEER_INSTELLINGEN.aan && D.weer.sneeuw) || 0;
  }
  const sneeuwStap = (S) => Math.round(sneeuwLaag(S) * SNEEUW_STAPPEN);
  // Zacht verlopend over het land: waar de wind hem neerlegt en waar niet (waardenruis over vakken van zes tegels).
  function sneeuwRuis(x, y) {
    const gx = Math.floor(x / 6);
    const gy = Math.floor(y / 6);
    const fx = x / 6 - gx;
    const fy = y / 6 - gy;
    const r = (a, b) => beeldLot(a * 13 + 7, b * 29 + 3);
    const boven = r(gx, gy) * (1 - fx) + r(gx + 1, gy) * fx;
    const onder = r(gx, gy + 1) * (1 - fx) + r(gx + 1, gy + 1) * fx;
    return boven * (1 - fy) + onder * fy;
  }
  // De sneeuw op één tegel (vanuit tekenVloeren en tekenBuitenGrond): `hoeken` zijn de soorten op zijn vier hoeken.
  function tekenSneeuwOp(c, w, x, y, laag, hoeken) {
    if (laag <= 0 || !metSprites()) return;
    const water = hoeken ? hoeken.filter((h) => T.isWaterGrond(h)).length : 0;
    if (water >= 2) return;
    const pad = hoeken ? hoeken.filter((h) => h === 'zandpad').length / 4 : 0;
    const dek = Math.max(0, Math.min(1, laag * 1.15 + (sneeuwRuis(x, y) - 0.5) * 0.6)) * (1 - 0.45 * pad) * (water ? 0.6 : 1);
    const stap = Math.round(dek * SNEEUW_STAPPEN);
    if (stap <= 0) return;
    const tegel = sneeuwTegel(stap);
    if (T.heeftHoogte(w)) {
      c.save();
      opTegelVlak(c, w, x, y);
      c.drawImage(tegel, -32, -16);
      c.restore();
    } else {
      const m = T.naarScherm(x, y);
      c.drawImage(tegel, Math.round(m.x) - 32, Math.round(m.y) - 16);
    }
  }

  // De droge beekjes (js/weer.js, T.staatDroog; Marcel, 9 okt: "Ja kleine beekjes ook"): de bedding zelf is zandpad
  // (T.hoekenDroog, in tekenVloeren), en hier komen er barsten en keien op, in de buffer van de grond, zodat je ziet dat
  // het een droge beek is en geen pad.
  function tekenDrogeBeek(c, S, vak) {
    const D = T.dorpHier(S);
    if (!D || !D.weer || !D.weer.beekDroog) return;
    const B = T.WEER_INSTELLINGEN.beeld;
    for (const t of T.beekTegels(S.wereld)) {
      if (!inVak(vak, t.x, t.y) || !T.staatDroog(D, t.x, t.y)) continue;
      const p = opGrond(t.x, t.y);
      // Barsten en keien, op vaste plekken in het midden van de tegel (niet op de rand, waar het gras begint).
      for (let i = 0; i < 9; i++) {
        const u = (beeldLot(t.x * 7 + i, t.y * 3) - 0.5) * 0.7;
        const v = (beeldLot(t.x * 5 + i, t.y * 11) - 0.5) * 0.7;
        const x = p.x + (u - v) * 64;
        const y = p.y + (u + v) * 32;
        if (i < 6) {
          // Een barst: een paar pixels schuin, langs de tegel.
          c.fillStyle = B.barstKleur;
          const l = 4 + Math.round(beeldLot(i, t.x) * 6);
          const op = beeldLot(t.y, i) < 0.5 ? 1 : -1;
          for (let s = 0; s < l; s += 2) c.fillRect(Math.round(x + s), Math.round(y + (op * s) / 2), 2, 1);
        } else {
          c.fillStyle = B.keiKleur;
          c.fillRect(Math.round(x), Math.round(y), 3, 2);
        }
      }
    }
  }

  // Hoe donker het is, van 0 (dag) tot 1 (volle nacht; T.lichtVan in js/dag.js); 0 zonder kalender, of
  // als de nacht uit staat.
  function nachtVan(S) {
    if (!S.kalender || !T.lichtVan || (T.debug && T.debug.geenNacht)) return 0;
    return T.lichtVan(S.kalender.dag).nacht;
  }

  // Ramen die 's avonds branden (js/herberg.js, T.herbergLicht; Marcel, 27 sep: "Misschien een raam
  // waar je mensen doorheen ziet"): elk ruitje warm geel, en in zoveel ramen als er gasten zijn een
  // schim, een hoofd en schouders die een beetje heen en weer gaan. De ruitjes komen van de
  // huizenbouwer (tegels.json, "ramen" bij de tekening; gereedschap/pixelart/huizen.cjs), in pixels
  // vanaf het anker van de tekening, dat op zijn achterste tegel valt.
  //
  // Wat vóór het gebouw staat, moet de ramen afdekken, en de nacht mag er niet overheen. Daarom gaat
  // het in drie stappen, met een gat in het doek: meteen nadat het gebouw getekend is, gaan de ruitjes
  // eruit (ponsRamen); alles wat daarna komt en ervoor staat, tekent het gat weer dicht; de nacht valt
  // alleen op wat er getekend is (tekenNacht, 'source-atop'); en wat er dan nog van het gat over is,
  // wordt licht (vulRamen). Zo tekent niets twee keer, en dekt een boom of een dak ervoor het raam af.
  // Hoe fel: in de schemering nog zwak, 's nachts bijna vol, en dan zie je nog net het glas.
  function brandendeRamen(S) {
    const nacht = nachtVan(S);
    const D = T.dorpHier(S);
    if (nacht <= 0.02 || !T.lichtBronnen || !D || !metSprites()) return [];
    const uit = [];
    for (const b of T.lichtBronnen(D)) {
      const g = b.ramenVan;
      const opz = g && g.tekening && T.opzoekTegelNaam(g.tekening);
      const ramen = opz && opz.eig && opz.eig.ramen;
      if (ramen && ramen.length) uit.push({ g, ramen, schimmen: b.schimmen || 0, fel: 0.9 * nacht, hoek: opGrond(g.x, g.y) });
    }
    return uit;
  }
  const isTekeningVan = (item, g) => !!(item.gebouw && item.gebouw.x === g.x && item.gebouw.y === g.y);
  // Een ruitje is zijn omtrek, [x, y, x, y, ...] vanaf de hoek van de tekening.
  function ruitPad(ctx, hoek, ruit) {
    ctx.moveTo(hoek.x + ruit[0], hoek.y + ruit[1]);
    for (let i = 2; i < ruit.length; i += 2) ctx.lineTo(hoek.x + ruit[i], hoek.y + ruit[i + 1]);
    ctx.closePath();
  }
  // Waar de rechte lijn omhoog door x een ruitje snijdt: [boven, onder]. Naast het ruitje: zijn rand.
  function snedeVan(ruit, x) {
    const xs = ruit.filter((_, k) => k % 2 === 0);
    const lx = Math.max(Math.min(...xs), Math.min(Math.max(...xs), x));
    let boven = Infinity;
    let onder = -Infinity;
    for (let k = 0; k < ruit.length; k += 2) {
      const [x1, y1, x2, y2] = [ruit[k], ruit[k + 1], ruit[(k + 2) % ruit.length], ruit[(k + 3) % ruit.length]];
      if (lx < Math.min(x1, x2) || lx > Math.max(x1, x2)) continue;
      const ys = x1 === x2 ? [y1, y2] : [y1 + ((y2 - y1) * (lx - x1)) / (x2 - x1)];
      boven = Math.min(boven, ...ys);
      onder = Math.max(onder, ...ys);
    }
    return [boven, onder];
  }
  function ponsRamen(ctx, r) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0, 0, 0, ${r.fel.toFixed(3)})`;
    ctx.beginPath();
    for (const raam of r.ramen) for (const ruit of raam) ruitPad(ctx, r.hoek, ruit);
    ctx.fill();
    ctx.restore();
  }
  // 'destination-over' tekent alleen waar het doek nog open is, dus in wat er van de gaten over is:
  // eerst de schimmen, dan het licht erachter.
  const SCHIM = 'rgba(34, 20, 12, 0.88)';
  const RAAMLICHT = 'rgb(255, 200, 118)';
  function vulRamen(ctx, S, r) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    // Welke ramen een schim krijgen: vast per raam (anders springen ze), zoveel als er gasten zijn.
    const volgorde = r.ramen.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % 11) - ((b * 7 + 3) % 11));
    for (const i of volgorde.slice(0, Math.min(r.schimmen, r.ramen.length))) {
      const raam = r.ramen[i];
      const xs = raam.flatMap((q) => q.filter((_, k) => k % 2 === 0));
      const b = Math.max(...xs) - Math.min(...xs);
      const mx = (Math.min(...xs) + Math.max(...xs)) / 2 + Math.sin(S.tijd * 0.8 + i * 1.7) * b * 0.15;
      const cx = r.hoek.x + mx;
      // Boven- en onderkant van het raam recht boven de schim: een raam in een muur loopt schuin, een
      // mens staat rechtop.
      let boven = Infinity;
      let onder = -Infinity;
      for (const q of raam) {
        const [t, o] = snedeVan(q, mx);
        boven = Math.min(boven, r.hoek.y + t);
        onder = Math.max(onder, r.hoek.y + o);
      }
      const h = onder - boven;
      if (b < 4 || h < 5) continue; // te klein voor een mens
      ctx.save();
      ctx.beginPath();
      for (const ruit of raam) ruitPad(ctx, r.hoek, ruit);
      ctx.clip(); // een schim blijft in zijn eigen raam
      ctx.fillStyle = SCHIM;
      ctx.beginPath();
      ctx.arc(cx, boven + h * 0.45, Math.max(1.5, Math.min(b * 0.2, h * 0.15)), 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, onder + h * 0.08, b * 0.38, h * 0.4, 0, Math.PI, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = RAAMLICHT;
    ctx.beginPath();
    for (const raam of r.ramen) for (const ruit of raam) ruitPad(ctx, r.hoek, ruit);
    ctx.fill();
    ctx.restore();
  }

  // Gras op een weide (js/akkers.js: T.akkerTegelStadium geeft 'weide'; spel.md, "Weides met koeien
  // en schapen"). De kaart heeft onder elk veld kale akkergrond; een weide krijgt daar gewone
  // grastegels overheen. Dat gebeurt meteen na de grond en vóór alles wat erop staat, en niet in de
  // tekenlijst zoals het graan: een koe is ruim twee tegels lang, en een grastegel die in de lijst
  // ná haar kwam, schilderde haar kop weg. Het gras is plat, dus er hoeft niets voor of achter.
  //
  // De grond van de kaart legt de soort op de hoeken van de tegels (T.sprites.grondHoeken): hoek
  // (x, y) is de noordhoek van tegel (x, y), en een veld zet zandpad op zijn hoeken van x tot x+b-1
  // en y tot y+h-1 (gereedschap/tiled/maak-gehucht.cjs, soortOp en terreinGid). Daardoor loopt de
  // kale grond een halve tegel door op de rij en de kolom vóór het veld. Hier worden precies die
  // hoeken weer gras, en krijgt elke tegel die er een raakt de tegel die bij zijn nieuwe hoeken
  // hoort: zo ziet een weide eruit alsof de kaart daar altijd gras had, ook naast een akker (die
  // houdt dan zijn eigen rand). Zonder kunst een groene ruit, zoals het gras van de kaart.
  function tekenWeides(ctx, S, vak) {
    const w = S.wereld;
    if (!w.akkers || !w.akkers.length || !T.bestemmingVan) return;
    const weides = w.akkers.filter((v) => T.bestemmingVan(v) === 'weide');
    if (!weides.length) return;
    const sp = metSprites();
    const paden = zandVan(S);
    const sneeuw = sneeuwLaag(S);
    const opWeide = (x, y) => weides.some((v) => x >= v.x && x < v.x + v.b && y >= v.y && y < v.y + v.h);
    const HOEK = [[0, 0], [1, 0], [1, 1], [0, 1]]; // noord, oost, zuid, west, vanaf (x, y)
    const gehad = new Set();
    for (const v of weides) {
      const x0 = Math.max(vak.x0, v.x - 1);
      const y0 = Math.max(vak.y0, v.y - 1);
      const x1 = Math.min(vak.x1, v.x + v.b - 1);
      const y1 = Math.min(vak.y1, v.y + v.h - 1);
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const sleutel = x + ',' + y;
          if (gehad.has(sleutel) || !T.isZichtbaar(w, x, y)) continue;
          gehad.add(sleutel);
          const zelf = opWeide(x, y);
          const p = opGrond(x, y);
          if (!sp) {
            if (!zelf) continue;
            T.ruit(ctx, p.x, p.y, 1);
            ctx.fillStyle = BUITENKLEUR.gras[(x + y) % 2];
            ctx.fill();
            continue;
          }
          const g = w.grond && w.grond[y] && w.grond[y][x];
          const kaart = g && T.sprites.grondHoeken(g.vel, g.id);
          // Met de paadjes erin (js/paden.js), zoals de grond eronder getekend is.
          const oud = (paden && kaart && T.hoekenMetPaden(paden.D, paden.zand, x, y, kaart)) || kaart;
          let deel = null;
          if (oud) {
            const nieuw = oud.map((soort, i) => (opWeide(x + HOEK[i][0], y + HOEK[i][1]) ? 'gras' : soort));
            if (nieuw.every((soort, i) => soort === oud[i])) continue; // deze tegel verandert niet
            deel = T.sprites.grondMetHoeken(g.vel, nieuw, x, y);
          }
          // Een tegel buiten de terreinset (of een hoek die het vel niet kent): op de weide zelf dan
          // gewoon gras, en daarbuiten blijft hij zoals de kaart hem legde.
          if (!deel && zelf) deel = T.sprites.grasTegel(x, y);
          if (deel) T.sprites.teken(ctx, deel, p.x, p.y, 1);
          if (deel && sneeuw) tekenSneeuwOp(ctx, w, x, y, sneeuw, null); // ook op de weide (de grond eronder heeft hem al)
        }
      }
    }
  }

  // Op welke tegel plant een voorwerp zich in bij het sorteren van achter naar voor? Een boom
  // staat op één tegel, maar een huis beslaat er meer (`beslaat`, vanaf zijn achterste
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
  // anders erachter. Dezelfde vraag stelt T.werkDoorkijkBij (js/doorkijk.js) — dat was eerst een
  // tweede, net iets andere som, en dat was precies de fout.
  T.staatVoorGebouw = staatVoorGebouw;
  function staatVoorGebouw(x, y, v) {
    const b = v.beslaat || [1, 1];
    return x > v.x + b[0] - 1 || y > v.y + b[1] - 1;
  }

  // Is dit voorwerp een gebouw (een huis, een boerderij, een hut)? Dan beslaat het meer dan één tegel;
  // een boom staat op één. De tekenvolgorde vraagt het, en de doorkijk (js/doorkijk.js): door een huis
  // zie je meer mensen dan door een boom.
  T.isGebouw = (v) => !!(v.beslaat && (v.beslaat[0] > 1 || v.beslaat[1] > 1));

  // De tekenlijst op volgorde, van achter naar voor. Gewone dingen (wezens, bomen, het graan) gaan
  // op de oude som `x + y`, en bij gelijke som op hun laag `l`. Een gebouw (`gebouw`: een voet
  // groter dan één tegel) komt daartussen op de plek die klopt voor alles wat er op het scherm mee
  // overlapt, dus op dezelfde schuine rijen x − y: ná wat erachter staat, vóór wat ervóór staat
  // (staatVoorGebouw). Wat er niet mee overlapt, kan het niet bedekken, en telt dus niet mee.
  //
  // Tot 26 sep deed één sort dat met een vergelijking per paar (een huis tegen een wezen per paar,
  // twee wezens op de som), maar zo'n vergelijking is niet eenduidig, en dan zet het sorteren soms
  // iets verkeerd: iemand die achter een huis liep, stond dan bovenop het dak. Met vijf boeren zag je
  // dat bijna nooit; met het hele dorp op straat (js/bewoners.js) steeds. Twee gebouwen die op dezelfde schuine rijen
  // staan, gaan op hun hele voet (gebouwVoorGebouw): wie helemaal ten zuiden of ten oosten van de ander staat, ervóór.
  // Tot 3 okt telde van het andere gebouw alleen zijn achterste hoek (`punt`): lag die buiten de rijen, dan zag het
  // het niet, en zo kwam een lange kapel (5 bij 10) over de hut ten zuiden ervan heen (Marcel, 3 okt: "komen op een
  // laag vóór de rest te staan"). En alleen de som klopt ook niet: een lang gebouw kan een grotere som hebben dan wat er
  // ten zuiden van staat.
  T.tekenVolgorde = tekenVolgorde;
  function tekenVolgorde(lijst) {
    const volgorde = lijst.filter((it) => !it.gebouw).sort((a, b) => a.d - b.d || a.l - b.l);
    const gebouwen = lijst.filter((it) => it.gebouw).sort((a, b) => a.d - b.d);
    for (const g of gebouwen) {
      const v = g.gebouw;
      const b = v.beslaat || [1, 1];
      // De schuine rijen die het gebouw beslaat, met één erbij aan elke kant voor de breedte van een
      // figuur.
      const links = v.x - (v.y + b[1] - 1) - 1;
      const rechts = v.x + b[0] - 1 - v.y + 1;
      let laatsteErachter = -1;
      let eersteErvoor = volgorde.length;
      for (let i = 0; i < volgorde.length; i++) {
        const it = volgorde[i];
        if (it.gebouw) {
          // Een ander gebouw: deelt het een schuine rij met dit gebouw (zonder de tegel speling voor een figuur)?
          const w = it.gebouw;
          const c = w.beslaat || [1, 1];
          if (w.x + c[0] - 1 - w.y < links + 1 || w.x - (w.y + c[1] - 1) > rechts - 1) continue;
          if (gebouwVoorGebouw(w, v)) eersteErvoor = Math.min(eersteErvoor, i);
          else laatsteErachter = i;
          continue;
        }
        const rij = it.punt.x - it.punt.y;
        if (rij < links || rij > rechts) continue;
        if (staatVoorGebouw(it.punt.x, it.punt.y, v)) eersteErvoor = Math.min(eersteErvoor, i);
        else laatsteErachter = i;
      }
      volgorde.splice(Math.min(laatsteErachter + 1, eersteErvoor), 0, g);
    }
    return volgorde;
  }

  // Staat gebouw a helemaal vóór gebouw b: ten zuiden of ten oosten van zijn hele voet? Twee voeten overlappen niet, dus
  // op dezelfde schuine rijen is het altijd het een of het ander.
  T.gebouwVoorGebouw = gebouwVoorGebouw;
  function gebouwVoorGebouw(a, b) {
    const c = b.beslaat || [1, 1];
    return a.x > b.x + c[0] - 1 || a.y > b.y + c[1] - 1;
  }

  // Ligt deze tegel aan de voorkant (zuid- of oostkant) van een van deze kamers?
  function isVoorrand(kamers, x, y) {
    return kamers.some(
      (k) => (y === k.y2 + 1 && x >= k.x1 - 1 && x <= k.x2 + 1) || (x === k.x2 + 1 && y >= k.y1 - 1 && y <= k.y2 + 1),
    );
  }

  // De kleuren van de grond buiten, voor als de kunst er niet is (of Spel.debug.vlakken aan
  // staat): gras, een zandpad, kasseien, water, en de grond van het eiland (gemeten op tegels/kust.png).
  const BUITENKLEUR = {
    gras: ['#3f6323', '#395d20'],
    zandpad: ['#7a6238', '#735c33'],
    kasseien: ['#6d6a64', '#65625c'],
    water: ['#2d4f6e', '#284a6a'],
    heide: ['#5a5d38', '#545734'],
    zee: ['#2c4456', '#283f51'],
    strand: ['#d0ab77', '#c8a370'],
    veen: ['#403320', '#3a2e1c'],
    broek: ['#446836', '#3f6232'],
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
    if (Math.min(x, y, w.b - 1 - x, w.h - 1 - y) >= ringen) return 1;
    // Alleen naar een kant waar bos staat (Marcel, 4 okt: "Alleen aan de kant van het bos"): daar loopt de kaart over in
    // het donkere bos erbuiten. Aan een open kant loopt het land door (tekenBuitenGrond), en vervaagt er niets.
    const rb = randBos(w);
    const cx = Math.max(0, Math.min(w.b - 1, x));
    const cy = Math.max(0, Math.min(w.h - 1, y));
    let dof = 1;
    const vervaag = (d, bos) => {
      if (d >= ringen || bos <= 0) return;
      const t = (d + 0.5) / ringen;
      dof = Math.min(dof, 1 - (1 - Math.max(0.02, t * t)) * bos);
    };
    vervaag(y, rb.noord[cx]);
    vervaag(x, rb.west[cy]);
    vervaag(w.h - 1 - y, rb.zuid[cx]);
    vervaag(w.b - 1 - x, rb.oost[cy]);
    return dof;
  }

  // Hoe bebost de rand van de kaart is, per plek langs elke kant (0 open land, 1 bos): uit de bomen in een strook vlak
  // binnen de rand. Het bos om de kaart heen volgt het bos erbinnen (Marcel, 4 okt: "Ik denk dat we het niet moeten
  // afbakenen met die bomen vierkant er omheen. Alleen aan de kant van het bos"). Eén keer per kaart.
  const RAND_BOS = new WeakMap();
  const RANDBOS_DIEP = 6; // zo diep kijkt hij de kaart in
  const RANDBOS_BREED = 2; // en zoveel tegels opzij, om het glad te houden
  const BOMEN_VOOR_DE_RAND = new Set(['eik', 'herfstEik', 'den', 'berk', 'wilg', 'dodeBoom']);
  function randBos(w) {
    let rb = RAND_BOS.get(w);
    if (rb) return rb;
    const b = w.b;
    const h = w.h;
    const boom = new Uint8Array(b * h);
    for (const v of w.voorwerpen || []) if (BOMEN_VOOR_DE_RAND.has(v.soort) && v.x >= 0 && v.y >= 0 && v.x < b && v.y < h) boom[v.y * b + v.x] = 1;
    const deel = (x0, y0, x1, y1) => {
      let n = 0;
      let t = 0;
      for (let y = Math.max(0, y0); y <= Math.min(h - 1, y1); y++) {
        for (let x = Math.max(0, x0); x <= Math.min(b - 1, x1); x++) {
          t++;
          n += boom[y * b + x];
        }
      }
      return t ? n / t : 0;
    };
    // een strook met zo'n kwart bomen of meer is bos; met een enkele losse boom is het open land
    const bos = (f) => Math.max(0, Math.min(1, (f - 0.1) / 0.25));
    const D = RANDBOS_DIEP;
    const R = RANDBOS_BREED;
    rb = { noord: new Float32Array(b), zuid: new Float32Array(b), west: new Float32Array(h), oost: new Float32Array(h) };
    for (let x = 0; x < b; x++) {
      rb.noord[x] = bos(deel(x - R, 0, x + R, D - 1));
      rb.zuid[x] = bos(deel(x - R, h - D, x + R, h - 1));
    }
    for (let y = 0; y < h; y++) {
      rb.west[y] = bos(deel(0, y - R, D - 1, y + R));
      rb.oost[y] = bos(deel(b - D, y - R, b - 1, y + R));
    }
    RAND_BOS.set(w, rb);
    return rb;
  }
  // Hoeveel bos er buiten de kaart staat op (x, y): dat van de kant (of in een hoek de twee kanten) waar hij ligt.
  function bosBuiten(w, x, y) {
    const rb = randBos(w);
    const cx = Math.max(0, Math.min(w.b - 1, x));
    const cy = Math.max(0, Math.min(w.h - 1, y));
    let f = 0;
    if (y < 0) f = Math.max(f, rb.noord[cx]);
    if (y >= w.h) f = Math.max(f, rb.zuid[cx]);
    if (x < 0) f = Math.max(f, rb.west[cy]);
    if (x >= w.b) f = Math.max(f, rb.oost[cy]);
    return f;
  }

  // ---- Het land buiten een open kant (Marcel, 4 okt) ----
  // Waar de kaart aan open land grenst, loopt de grond door: elke hoek buiten de kaart neemt de soort van de dichtstbijzijnde
  // hoek op de rand over (zo lopen de weg en de beek rechtdoor de kaart uit), en ring na ring wordt het donkerder en
  // dunner, gedithered zoals het bos (ontwerp/beeld.md), tot het donker van de achtergrond. Onder het bos blijft het donker.
  // Op het eiland loopt het eiland zelf door (vraag 117, 2b): de grond die het er heeft (T.randVanHetEiland in
  // js/maker.js), ook onder het bos.
  const BUITENGROND_DIEP = 10; // zoveel ringen ver
  const BUITENGROND_VOL = 4; // tot hier ligt elke tegel er
  function randHoek(w, vx, vy) {
    const eiland = w.eiland && T.randVanHetEiland(w).hoek(vx, vy);
    if (eiland) return eiland;
    return T.sprites.grondHoekOp(w, Math.max(0, Math.min(w.b, vx)), Math.max(0, Math.min(w.h, vy))) || 'gras';
  }
  function tekenBuitenGrond(c, S, g) {
    const w = S.wereld;
    if (!metSprites() || !w.grond) return;
    const vel = (w.grond[0] && w.grond[0][0] && w.grond[0][0].vel) || 'rand';
    const zaad = bosrandZaad(w) + 7;
    const sneeuw = sneeuwLaag(S);
    const vak = tegelsIn(w, { x0: g.vx, y0: g.vy, x1: g.vx + g.b, y1: g.vy + g.h }, BUITENGROND_DIEP);
    for (let y = vak.y0; y <= vak.y1; y++) {
      for (let x = vak.x0; x <= vak.x1; x++) {
        if (x >= 0 && y >= 0 && x < w.b && y < w.h) continue;
        const r = bosrandRing(w, x, y);
        if (r > BUITENGROND_DIEP) continue;
        const dicht = r <= BUITENGROND_VOL ? 1 : 1 - (r - BUITENGROND_VOL) / (BUITENGROND_DIEP - BUITENGROND_VOL + 1);
        if (hasj(x, y, zaad) >= dicht * (1 - (w.eiland ? 0 : bosBuiten(w, x, y)))) continue;
        const hoeken = [randHoek(w, x, y), randHoek(w, x + 1, y), randHoek(w, x + 1, y + 1), randHoek(w, x, y + 1)];
        // op het eiland kunnen er drie soorten in een tegel liggen (gras, heide en strand): dan zoals op de kaart
        const deel = T.sprites.grondMetHoeken(vel, w.eiland ? T.grondTegelHoeken(hoeken) : hoeken, x, y) || T.sprites.grasTegel(x, y);
        if (!deel) continue;
        const p = opGrond(x, y);
        // elke tegel een eigen stapje donkerder of lichter, zodat het donker geen strepen langs de rand legt
        const rij = Math.max(0, r + (hasj(x, y, zaad + 1) - 0.5) * 2.5);
        const gedimd = bosrandGedimd(deel, bosrandHelder(rij));
        // het landschap loopt door buiten de kaart (vraag 121)
        if (T.heeftHoogte(w)) tekenGrondMetLicht(c, w, gedimd, x, y);
        else T.sprites.teken(c, gedimd, p.x, p.y, 1);
        tekenSneeuwOp(c, w, x, y, sneeuw, hoeken);
      }
    }
  }

  function tekenVloeren(ctx, S, inBeeld, vak) {
    const w = S.wereld;
    const sp = metSprites();
    const buiten = !!w.buiten;
    const paden = buiten ? zandVan(S) : null;
    const droog = paden && paden.D.weer && paden.D.weer.beekDroog ? paden.D : null;
    const hoog = T.heeftHoogte(w);
    const sneeuw = buiten ? sneeuwLaag(S) : 0;
    for (const [x, y] of tegelVolgorde(vak, hoog)) {
      {
        const t = T.tegel(w, x, y);
        // Buiten ligt er ook gras onder een boom of een huis (die tegel heet "muur"): het
        // plaatje van de boom laat het gras eromheen zien.
        if (t === 'buiten' || (!buiten && t !== 'vloer' && t !== 'deur') || !T.isZichtbaar(w, x, y)) continue;
        const p = opGrond(x, y);
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
        // Een paadje (js/paden.js) maakt de hoeken die gras waren zand, met de tegel uit hetzelfde vel die die hoeken heeft.
        let metPad = paden && g ? T.hoekenMetPaden(paden.D, paden.zand, x, y, T.sprites.grondHoeken(g.vel, g.id)) : null;
        // Een droge beek (js/weer.js) maakt de hoeken die water waren zandpad: een bedding, met het gras eromheen.
        if (droog && g) metPad = T.hoekenDroog(droog, x, y, metPad || T.sprites.grondHoeken(g.vel, g.id)) || metPad;
        if (metPad && !sp && metPad.every((soort) => soort === 'zandpad')) hex = BUITENKLEUR.zandpad[(x + y) % 2];
        const deel = sp && ((metPad && T.sprites.grondMetHoeken(g.vel, metPad, x, y)) || (g ? T.sprites.buiten(g.vel, g.id) : !buiten && T.sprites.tegel(vloerSoort(w, x, y), x, y)));
        if (deel) {
          if (hoog) {
            tekenGrondMetLicht(ctx, w, deel, x, y);
            tekenWanden(ctx, w, x, y);
          } else T.sprites.teken(ctx, deel, p.x, p.y, helder);
          if (sneeuw && g) tekenSneeuwOp(ctx, w, x, y, sneeuw, metPad || T.sprites.grondHoeken(g.vel, g.id) || (g.naam ? [g.naam, g.naam, g.naam, g.naam] : null));
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

  // Het graan op een akker (vraag 121; Marcel, 7 okt: "Ik wil dat de akkers mee bollen met de heuvel", en bij het eerste
  // beeld: "De akkers sluiten nog niet zo mooi aan"). Een graanplaatje is breder dan zijn tegel, dus één scheve
  // transformatie per tegel sloot niet aan op die van de buren. Nu in smalle stroken van boven naar onder: elke strook
  // schuift en rekt zo dat hij de hoogte van de grond zelf volgt (T.hoogteOp, die over de hele kaart doorloopt), dus
  // twee plaatjes die elkaar overlappen, liggen daar precies op elkaar. Alleen de hoogte verschuift: de halmen blijven
  // rechtop.
  const GRAAN_STROOK = 8; // pixels breed
  const GRAAN_STUK = 20; // pixels hoog: zo ver kan de hoogte langs een strook recht genomen worden
  function tekenGraan(ctx, w, deel, x, y, p) {
    if (!deel) return;
    if (!T.isSchuin(w, x, y)) return T.sprites.teken(ctx, deel, p.x, p.y, 1);
    const m = T.naarScherm(x, y);
    const mx = Math.round(m.x);
    const my = Math.round(m.y);
    // ver uitgezoomd grovere stukjes: op het scherm blijven ze even klein
    const strook = Math.round(GRAAN_STROOK / Math.min(1, zoomNu));
    const stuk = Math.round(GRAAN_STUK / Math.min(1, zoomNu));
    for (let s0 = 0; s0 < deel.b; s0 += strook) {
      const sb = Math.min(strook, deel.b - s0);
      const u = s0 - deel.ax + sb / 2; // het midden van de strook, vanaf het midden van de tegel
      // de hoogte van de grond onder een punt van deze kolom, v pixels onder het midden van de tegel
      const op = (v) => T.hoogteOp(w, x + (u / 32 + v / 16) / 2, y + (v / 16 - u / 32) / 2);
      let v0 = -deel.ay;
      let h0 = op(v0);
      for (let r0 = 0; r0 < deel.h; r0 += stuk) {
        const rh = Math.min(stuk, deel.h - r0);
        const v1 = v0 + rh;
        const h1 = op(v1);
        const k = (h1 - h0) / rh;
        ctx.save();
        ctx.translate(mx + s0 - deel.ax, my);
        ctx.transform(1, 0, 0, 1 - k, 0, k * v0 - h0);
        ctx.drawImage(deel.beeld, deel.sx + s0, deel.sy + r0, sb, rh, 0, v0, sb, rh);
        ctx.restore();
        v0 = v1;
        h0 = h1;
      }
    }
  }

  // De tegels van een vak, in de volgorde waarin ze getekend worden: rij na rij, of met hoogte van achter naar voren
  // (een heuvel vooraan gaat over wat erachter ligt).
  function tegelVolgorde(vak, hoog) {
    const uit = [];
    for (let y = vak.y0; y <= vak.y1; y++) for (let x = vak.x0; x <= vak.x1; x++) uit.push([x, y]);
    if (hoog) uit.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[0] - b[0]);
    return uit;
  }

  // Een grondtegel op een schuine plek (vraag 121): één scheve transformatie legt de vlakke tegel op het vlak dat het
  // best bij zijn vier hoeken past, een tikje groter zodat er tussen twee tegels geen naad valt. Geen nieuwe kunst en geen
  // knip (gemeten op 7 okt: met twee geknipte driehoeken per tegel duurde de grond in het overzicht vier keer zo lang).
  function tekenSchuineTegel(ctx, w, deel, x, y) {
    ctx.save();
    opTegelVlak(ctx, w, x, y);
    ctx.scale(1.04, 1.04);
    T.sprites.teken(ctx, deel, 0, 0, 1);
    ctx.restore();
  }
  // Zet het doek op het vlak van tegel (x, y): (0, 0) is zijn midden, en een punt (u, v) op het scherm van een vlakke
  // tegel schuift omhoog met de hoogte van het vlak door zijn vier hoeken daar.
  function opTegelVlak(ctx, w, x, y) {
    const [hN, hO, hZ, hW] = T.hoekHoogten(w, x, y);
    const m = T.naarScherm(x, y);
    ctx.translate(m.x, m.y);
    ctx.transform(1, -(hO - hW) / 64, 0, 1 - (hZ - hN) / 32, 0, -(hN + hO + hZ + hW) / 4);
  }

  // Het licht op de grond (vraag 121): lichter naar de zon, donkerder ervan af, zacht verlopend over elke tegel. Per
  // kaart één klein plaatje met een pixel per hoekpunt (T.lichtOpHoekpunt), met een rand erbuiten voor het land om de
  // kaart; per tegel komt het stukje tussen zijn vier hoekpunten vloeiend uitgerekt over de tegel (zoals de grond zelf
  // op het vlak van de tegel). Zo verloopt het licht van tegel tot tegel zonder trapjes.
  const LICHT_RAND = 24;
  const lichtKaarten = new WeakMap();
  function lichtKaartVan(w) {
    const hg = w.hoogte;
    const bestaand = lichtKaarten.get(hg);
    if (bestaand && bestaand.versie === (hg.versie || 0)) return bestaand.canvas;
    const R = LICHT_RAND;
    const c = document.createElement('canvas');
    c.width = w.b + 1 + 2 * R;
    c.height = w.h + 1 + 2 * R;
    const k = c.getContext('2d');
    const beeld = k.createImageData(c.width, c.height);
    for (let py = 0; py < c.height; py++) {
      for (let px = 0; px < c.width; px++) {
        const f = T.lichtOpHoekpunt(w, px - R, py - R);
        const o = (py * c.width + px) * 4;
        if (f < 1) {
          beeld.data[o] = 20;
          beeld.data[o + 1] = 16;
          beeld.data[o + 2] = 32;
          beeld.data[o + 3] = Math.round(Math.min(1, (1 - f) * 0.95) * 255);
        } else {
          beeld.data[o] = 255;
          beeld.data[o + 1] = 244;
          beeld.data[o + 2] = 214;
          beeld.data[o + 3] = Math.round(Math.min(1, (f - 1) * 0.45) * 255);
        }
      }
    }
    k.putImageData(beeld, 0, 0);
    lichtKaarten.set(hg, { versie: hg.versie || 0, canvas: c });
    return c;
  }
  // Een grondtegel op een kaart met hoogte: eerst het licht in de tegel zelf (op een kladje: de tegel, en daarop het licht,
  // alleen waar de tegel is), dan de belichte tegel op het vlak van de tegel. Zo valt er tussen twee tegels geen naad
  // in het licht: ze overlappen een tikje, maar dat is grond over grond.
  let tegelKlad = null;
  // Het licht in de tegel zelf bakken (een kladje per tegel) gaf geen naadjes, maar maakte het tekenen van de grond tien
  // keer zo duur (gemeten op 7 okt); het licht als laag over de tegel laat een haarfijn naadje, en kost één plaatje.
  const lichtInDeTegel = false;
  function tekenGrondMetLicht(ctx, w, deel, x, y) {
    const R = LICHT_RAND;
    if (x < -R || y < -R || x > w.b + R - 1 || y > w.h + R - 1) return tekenSchuineTegel(ctx, w, deel, x, y);
    if (!lichtInDeTegel) {
      tekenSchuineTegel(ctx, w, deel, x, y);
      ctx.save();
      opTegelVlak(ctx, w, x, y);
      ctx.transform(32, 16, -32, 16, 0, 0); // van de wereld (een tegel is 1 bij 1) naar het scherm
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(lichtKaartVan(w), x + R + 0.5, y + R + 0.5, 1, 1, -0.5, -0.5, 1, 1);
      ctx.restore();
      return;
    }
    if (!tegelKlad) {
      tegelKlad = document.createElement('canvas');
      tegelKlad.width = 128;
      tegelKlad.height = 64;
    }
    const k = tegelKlad.getContext('2d');
    k.clearRect(0, 0, tegelKlad.width, tegelKlad.height);
    k.globalCompositeOperation = 'source-over';
    k.imageSmoothingEnabled = false;
    k.drawImage(deel.beeld, deel.sx, deel.sy, deel.b, deel.h, 0, 0, deel.b, deel.h);
    k.globalCompositeOperation = 'source-atop';
    k.save();
    k.translate(deel.ax, deel.ay);
    k.transform(32, 16, -32, 16, 0, 0); // van de wereld (een tegel is 1 bij 1) naar de tegel
    k.imageSmoothingEnabled = true;
    k.drawImage(lichtKaartVan(w), x + R + 0.5, y + R + 0.5, 1, 1, -0.5, -0.5, 1, 1);
    k.restore();
    k.globalCompositeOperation = 'source-over';
    ctx.save();
    opTegelVlak(ctx, w, x, y);
    ctx.scale(1.04, 1.04);
    ctx.drawImage(tegelKlad, 0, 0, deel.b, deel.h, -deel.ax, -deel.ay, deel.b, deel.h);
    ctx.restore();
  }

  // Een driehoek uit een plaatje op een driehoek op het doek: t zijn drie punten in het plaatje (vanaf sx, sy), p drie
  // punten op het doek. Geknipt op de driehoek, een halve pixel ruimer, zodat er tussen twee driehoeken geen naad valt.
  // `erna(ctx, vak)` tekent nog iets binnen dezelfde knip (vak: [x0, y0, x1, y1] om de driehoek).
  function driehoekUitPlaatje(ctx, beeld, sx, sy, sb, sh, t, p, erna) {
    const [[u0, v0], [u1, v1], [u2, v2]] = t;
    const [[x0, y0], [x1, y1], [x2, y2]] = p;
    const d = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0);
    if (Math.abs(d) < 1e-6) return;
    const a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / d;
    const c = ((u1 - u0) * (x2 - x0) - (u2 - u0) * (x1 - x0)) / d;
    const b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / d;
    const dd = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / d;
    const mx = (x0 + x1 + x2) / 3;
    const my = (y0 + y1 + y2) / 3;
    ctx.save();
    ctx.beginPath();
    p.forEach(([x, y], i) => {
      const l = Math.hypot(x - mx, y - my) || 1;
      const q = [x + ((x - mx) / l) * 0.7, y + ((y - my) / l) * 0.7];
      if (i === 0) ctx.moveTo(q[0], q[1]);
      else ctx.lineTo(q[0], q[1]);
    });
    ctx.closePath();
    ctx.clip();
    ctx.save();
    ctx.transform(a, b, c, dd, x0 - a * u0 - c * v0, y0 - b * u0 - dd * v0);
    ctx.drawImage(beeld, sx, sy, sb, sh, 0, 0, sb, sh);
    ctx.restore();
    if (erna) erna(ctx, [Math.min(x0, x1, x2) - 2, Math.min(y0, y1, y2) - 2, Math.max(x0, x1, x2) + 2, Math.max(y0, y1, y2) + 2]);
    ctx.restore();
  }

  // De wanden van een tegel (T.wandenVan: aan zijn zuid- en oostkant, waar hij hoger ligt dan zijn buur): een
  // rotswand of een begroeide wal, uit een textuur die eens gemaakt wordt (wandTextuur), met de grasrand bovenaan.
  function tekenWanden(ctx, w, x, y) {
    for (const wand of T.wandenVan(w, x, y)) {
      const s1 = T.naarScherm(wand.van[0], wand.van[1]);
      const s2 = T.naarScherm(wand.tot[0], wand.tot[1]);
      const A = [s1.x, s1.y - wand.boven[0]];
      const B = [s2.x, s2.y - wand.boven[1]];
      const C = [s2.x, s2.y - wand.onder[1]];
      const Dp = [s1.x, s1.y - wand.onder[0]];
      const tex = wandTextuur(wand.soort, wand.kant);
      const u0 = (Math.round((wand.van[0] * 7 + wand.van[1] * 13) * 32) % (WAND_B - 40) + (WAND_B - 40)) % (WAND_B - 40);
      const hA = Math.min(WAND_H - 1, wand.boven[0] - wand.onder[0]);
      const hB = Math.min(WAND_H - 1, wand.boven[1] - wand.onder[1]);
      const ta = [u0, 0];
      const tb = [u0 + 32, 0];
      const tc = [u0 + 32, Math.max(0.01, hB)];
      const td = [u0, Math.max(0.01, hA)];
      driehoekUitPlaatje(ctx, tex, 0, 0, WAND_B, WAND_H, [ta, tb, tc], [A, B, C]);
      driehoekUitPlaatje(ctx, tex, 0, 0, WAND_B, WAND_H, [ta, tc, td], [A, C, Dp]);
    }
  }

  // De textuur van een wand, per soort en kant, eens gemaakt: lagen steen met voegen voor een rotswand, aarde met
  // wortels voor een wal, en bovenaan een rand gras die over de rand hangt; de oostkant ligt verder uit de zon, zoals de
  // muren van een huis (dezelfde kleuren als de proefplaat, gereedschap/pixelart/hoogte-proef.cjs).
  const WAND_B = 256;
  const WAND_H = 320;
  const wandTexturen = new Map();
  function wandTextuur(soort, kant) {
    const sl = soort + ',' + kant;
    if (wandTexturen.has(sl)) return wandTexturen.get(sl);
    const c = document.createElement('canvas');
    c.width = WAND_B;
    c.height = WAND_H;
    const k = c.getContext('2d');
    const beeld = k.createImageData(WAND_B, WAND_H);
    const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
    const ROTS = ['#5b5650', '#77716a', '#948d84', '#b0a89c'].map(hex);
    const AARDE = ['#3e2c1e', '#5a3f29', '#735237', '#8a6744'].map(hex);
    const GRAS = ['#3d5a26', '#567a33', '#6f9440'].map(hex);
    const zij = kant === 'oost' ? 0.72 : 0.9;
    const ruis = (x, y) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const fx = x - xi;
      const fy = y - yi;
      const a = hasj(xi, yi, 3);
      const b = hasj(xi + 1, yi, 3);
      const cc = hasj(xi, yi + 1, 3);
      const d = hasj(xi + 1, yi + 1, 3);
      const sx = fx * fx * (3 - 2 * fx);
      const sy = fy * fy * (3 - 2 * fy);
      return a + (b - a) * sx + (cc - a) * sy + (a - b - cc + d) * sx * sy;
    };
    const klem = (n, a, b) => (n < a ? a : n > b ? b : n);
    for (let v = 0; v < WAND_H; v++) {
      for (let u = 0; u < WAND_B; u++) {
        const r = ruis(u * 0.18, v * 0.18);
        const grasDiep = (soort === 'rots' ? 2.5 : 4.5) + 3 * ruis(u * 0.35, 7.3) + (hasj(u, 91, 5) < 0.33 ? 2 : 0);
        let kleur;
        if (v < grasDiep) {
          kleur = GRAS[klem(Math.floor((1 - v / grasDiep) * 2.99 + (r - 0.5)), 0, 2)];
        } else if (soort === 'rots') {
          const lv = v / 7 + ruis(u * 0.05, 1.7) * 1.2;
          const laag = Math.floor(lv);
          const breed = 10 + Math.floor(hasj(laag, 5, 7) * 9);
          const blok = Math.floor((u + laag * 13) / breed);
          const voeg = lv % 1 < 0.12 || (u + laag * 13) % breed < 1;
          let tint = 1 + (hasj(blok, laag, 9) - 0.5) * 0.25 + (r - 0.5) * 0.35;
          if (voeg) tint *= 0.6;
          if (v > 2 && v < 4.5) tint *= 0.8;
          kleur = ROTS[klem(Math.floor(tint * 2.2), 0, 3)];
        } else {
          let tint = 1 + (r - 0.5) * 0.5;
          if (Math.abs(Math.sin(u * 0.09 + v * 0.21 + ruis(u * 0.12, v * 0.12) * 3)) < 0.05 && v < 14) tint = 0.5;
          if (v > grasDiep && v < grasDiep + 2) tint *= 0.75;
          kleur = hasj(u >> 1, v >> 1, 11) < 1 / 61 ? ROTS[2] : AARDE[klem(Math.floor(tint * 2.2), 0, 3)];
        }
        const o = (v * WAND_B + u) * 4;
        beeld.data[o] = kleur[0] * zij;
        beeld.data[o + 1] = kleur[1] * zij;
        beeld.data[o + 2] = kleur[2] * zij;
        beeld.data[o + 3] = 255;
      }
    }
    k.putImageData(beeld, 0, 0);
    wandTexturen.set(sl, c);
    return c;
  }

  // Het raster rolt uit vanaf de plek van de schout, als een rimpeling over de vloer, en
  // vervaagt weer als het gevecht voorbij is.
  function tekenRaster(ctx, S) {
    if (S.rasterAlpha < 0.01 || !S.rasterTegels.length) return;
    const van = S.rasterVan || T.tegelVan(S.schout);
    const verstreken = S.tijd - S.rasterStart;
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 230, 190, 0.42)';
    ctx.lineWidth = 1;
    for (const t of S.rasterTegels) {
      if (!T.isZichtbaar(S.wereld, t.x, t.y)) continue;
      const golf = S.modus === 'gevecht' ? Math.min(1, Math.max(0, verstreken * 16 - Math.hypot(t.x - van.x, t.y - van.y))) : 1;
      if (golf <= 0) continue;
      ctx.globalAlpha = S.rasterAlpha * golf;
      const p = opGrond(t.x, t.y);
      T.ruit(ctx, p.x, p.y, 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Een paaltje op de hoek van een vrij erf (js/erven.js, T.paaltjesVan): de kunst als die er is
  // (gereedschap/pixelart/paaltje.cjs), anders een dun houten paaltje in vlakken.
  function tekenPaaltje(ctx, x, y) {
    const p = opGrond(x, y);
    const deel = metSprites() && T.sprites.paaltje && T.sprites.paaltje();
    if (deel) T.sprites.teken(ctx, deel, p.x, p.y, 1);
    else T.blok(ctx, p.x, p.y, 0.05, 0.05, 18, '#8a6a42', { helder: 1 });
  }

  // De randen van de erven (js/erven.js), zolang het bouwmenu open is of je bouwt: zo zie je waar ze
  // liggen en welke vrij zijn (licht) of bewoond (gedempt). Een lijn langs de buitenkant, op de grond.
  function tekenErfRanden(ctx, S) {
    const erven = S.dorp && S.dorp.erven; // bouwen doe je in je eigen dorp (het bouwmenu, js/hud.js)
    if (!(S.bouwSoort || S.bouwMenuOpen) || !(erven && erven.length)) return;
    ctx.save();
    ctx.lineWidth = 2;
    for (const erf of erven) {
      ctx.strokeStyle = erf.hut ? 'rgba(230, 220, 190, 0.35)' : 'rgba(240, 225, 170, 0.85)';
      tekenRand(ctx, erf);
    }
    ctx.restore();
  }

  // Het gebouw dat de speler in de hand heeft (S.bouwSoort, het bouwmenu in js/hud.js): zijn hele
  // voet licht op, groen als T.gebouwPast hem daar toestaat, anders rood — dezelfde twee kleuren
  // als tekenMarkeringen voor het looppad gebruikt (licht/rood hieronder). Met een erf in de hand op
  // een vrij erf licht dat erf op: een klik haalt het weg (js/main.js).
  function tekenBouwSpook(ctx, S) {
    tekenErfRanden(ctx, S);
    if (!S.bouwSoort || !S.bouwHover) return;
    const weg = S.bouwHover.weghalen;
    if (weg) {
      ctx.fillStyle = 'rgba(224, 96, 79, 0.35)';
      for (let dy = 0; dy < weg.h; dy++) {
        for (let dx = 0; dx < weg.b; dx++) {
          const p = opGrond(weg.x + dx, weg.y + dy);
          T.ruit(ctx, p.x, p.y, 0.94);
          ctx.fill();
        }
      }
      return;
    }
    // De voet van de tekening die dit gebouw echt krijgt (T.volgendeTekening, js/gebouwen.js).
    const voet = T.gebouwVoet(S.bouwSoort, T.volgendeTekening(S.dorp, S.bouwSoort));
    if (!voet) return;
    ctx.fillStyle = S.bouwHover.ok ? 'rgba(134, 196, 111, 0.45)' : 'rgba(224, 96, 79, 0.45)';
    for (let dy = 0; dy < voet.h; dy++) {
      for (let dx = 0; dx < voet.b; dx++) {
        const p = opGrond(S.bouwHover.x + dx, S.bouwHover.y + dy);
        T.ruit(ctx, p.x, p.y, 0.94);
        ctx.fill();
      }
    }
    tekenKring(ctx, S, S.bouwSoort, { x: S.bouwHover.x, y: S.bouwHover.y, b: voet.b, h: voet.h });
  }

  // De rand van land om te ontginnen (js/ontginnen.js; werklijst vraag 107), bovenop alles: in het bos staan de bomen over
  // het goud op de grond heen (tekenVerzoekPlek), en dan zag je niet welk stuk hij bedoelt.
  function tekenOntginRand(ctx, S) {
    const D = T.dorpHier(S);
    const L = D && D.voorvallen && D.voorvallen.lopend;
    if (!L || !L.ontgin || S.bouwSoort) return;
    for (const stuk of [L.ontgin.heide, L.ontgin.bos]) {
      if (!stuk) continue;
      const hoeken = [[0, 0], [stuk.b, 0], [stuk.b, stuk.h], [0, stuk.h]].map(([dx, dy]) => opGrond(stuk.x + dx - 0.5, stuk.y + dy - 0.5));
      ctx.beginPath();
      hoeken.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = 'rgba(226, 182, 74, 0.16)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(240, 200, 96, 0.9)';
      ctx.lineWidth = 2 / S.zoom;
      ctx.stroke();
    }
  }

  // Het hol waar de jacht op de wolven heen gaat (js/beesten.js; werklijst vraag 116, stap 3b): zolang de jacht loopt, een
  // ruit van vijf bij vijf tegels in goud om het hol, bovenop het bos, zodat je hem tussen de bomen vindt.
  const JACHT_RAND = 2;
  function tekenJachtRand(ctx, S) {
    const hol = T.holVanDeJacht && T.holVanDeJacht(T.dorpHier(S)); // gereedschap/wereld.html laadt de beesten niet
    if (!hol) return;
    const r = JACHT_RAND + 0.5;
    const hoeken = [[-r, -r], [r, -r], [r, r], [-r, r]].map(([dx, dy]) => opGrond(hol.x + dx, hol.y + dy));
    ctx.beginPath();
    hoeken.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = 'rgba(226, 182, 74, 0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 200, 96, 0.9)';
    ctx.lineWidth = 2 / S.zoom;
    ctx.stroke();
  }

  // De plek van een bouwverzoek (js/verzoeken.js; werklijst vraag 103): zolang iemand je erom vraagt, ligt de voet van
  // wat hij wil bouwen er in goud, met de kring erbij als het een put of een kapel is. Zo kun je gaan kijken waar het
  // komt voor je ja zegt.
  // Het spoor van de graanzak (js/zaak.js): hoopjes gemorst graan op de grond, van de schuur naar de deur van wie het
  // nam. Te zien voor wie kijkt; wat het betekent, weet de schout pas als hij erbij staat (T.werkZaakBij).
  // gereedschap/wereld.html laadt de zaak niet.
  const KORRELS = [[-14, -3], [-9, 4], [8, -5], [13, 2], [-3, 7], [4, 6], [-12, 1], [11, -1]];
  function tekenSpoor(ctx, S) {
    const D = T.dorpHier(S);
    const Z = D && D.zaak;
    if (!Z || !Z.spoor || !Z.spoor.length) return;
    for (const t of Z.spoor) {
      const p = opGrond(t.x, t.y);
      const x = Math.round(p.x);
      const y = Math.round(p.y);
      // Een hoopje in het midden, met een schaduw eronder, en losse korrels eromheen.
      ctx.fillStyle = 'rgba(70, 48, 20, 0.55)';
      ctx.fillRect(x - 6, y, 13, 3);
      ctx.fillStyle = 'rgb(196, 158, 78)';
      ctx.fillRect(x - 5, y - 2, 11, 3);
      ctx.fillStyle = 'rgb(232, 204, 128)';
      ctx.fillRect(x - 3, y - 3, 6, 2);
      KORRELS.forEach(([dx, dy], i) => {
        ctx.fillStyle = i % 2 ? 'rgb(214, 180, 100)' : 'rgb(170, 132, 62)';
        ctx.fillRect(x + dx, y + dy, 3, 2);
      });
    }
  }

  function tekenVerzoekPlek(ctx, S) {
    const D = T.dorpHier(S);
    const L = D && D.voorvallen && D.voorvallen.lopend;
    // Land om te ontginnen (js/ontginnen.js): het stuk heide en het stuk bos in goud, zonder kring.
    if (L && L.ontgin && !S.bouwSoort) {
      ctx.fillStyle = 'rgba(226, 182, 74, 0.42)';
      for (const stuk of [L.ontgin.heide, L.ontgin.bos]) {
        if (!stuk) continue;
        for (let dy = 0; dy < stuk.h; dy++) {
          for (let dx = 0; dx < stuk.b; dx++) {
            const p = opGrond(stuk.x + dx, stuk.y + dy);
            T.ruit(ctx, p.x, p.y, 0.94);
            ctx.fill();
          }
        }
      }
      return;
    }
    if (!L || !L.bouw || S.bouwSoort) return;
    const b = L.bouw;
    if (b.kramen) {
      // De markt op het plein (js/markt.js): waar de kramen komen.
      ctx.fillStyle = 'rgba(226, 182, 74, 0.42)';
      for (const k of b.kramen) {
        for (const t of k.tegels || [k]) {
          const p = opGrond(t.x, t.y);
          T.ruit(ctx, p.x, p.y, 0.94);
          ctx.fill();
        }
      }
      return;
    }
    const voet = T.gebouwVoet(b.soort, T.volgendeTekening(D, b.soort)) || T.GEBOUWEN[b.soort].voet;
    if (!voet) return;
    ctx.fillStyle = 'rgba(226, 182, 74, 0.42)';
    for (let dy = 0; dy < voet.h; dy++) {
      for (let dx = 0; dx < voet.b; dx++) {
        const p = opGrond(b.x + dx, b.y + dy);
        T.ruit(ctx, p.x, p.y, 0.94);
        ctx.fill();
      }
    }
    tekenKring(ctx, S, b.soort, { x: b.x, y: b.y, b: voet.b, h: voet.h });
  }

  // Een rechthoek van tegels { x, y, b, h } als lijn langs de buitenkant, op de grond (zoals de erven hierboven).
  function tekenRand(ctx, r) {
    const hoeken = [
      opGrond(r.x - 0.5, r.y - 0.5), opGrond(r.x + r.b - 0.5, r.y - 0.5),
      opGrond(r.x + r.b - 0.5, r.y + r.h - 0.5), opGrond(r.x - 0.5, r.y + r.h - 0.5),
    ];
    ctx.beginPath();
    hoeken.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.closePath();
    ctx.stroke();
  }

  // De kring om een plek die een huis in de buurt wil (js/wensen.js; werklijst vraag 80, B): met een put, een kapel, de
  // herberg of een markt in de hand zie je hoe ver hij reikt, en welke huizen die hem willen erin vallen (hun voet licht
  // op) en welke niet (gedempt). Een kring van tegels is op het scherm een platte ellips.
  function tekenKring(ctx, S, soort, plek) {
    const straal = T.WENSEN_INSTELLINGEN.kring[soort];
    const wens = Object.keys(T.WENSEN).find((id) => T.WENSEN[id].plek === soort);
    if (!straal || !wens) return;
    const m = { x: plek.x + plek.b / 2 - 0.5, y: plek.y + plek.h / 2 - 0.5 };
    const c = opGrond(m.x, m.y);
    const d = straal / Math.SQRT2;
    const ax = Math.abs(T.naarScherm(m.x + d, m.y - d).x - T.naarScherm(m.x, m.y).x);
    const ay = Math.abs(T.naarScherm(m.x + d, m.y + d).y - T.naarScherm(m.x, m.y).y);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, ax, ay, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240, 225, 170, 0.07)';
    ctx.fill();
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(240, 225, 170, 0.75)';
    ctx.stroke();
    ctx.setLineDash([]);
    for (const g of S.dorp.gebouwen) {
      const stand = T.standVan(g);
      if (!stand || !T.wensenVanStand(stand).includes(wens)) continue;
      const r = T.voetVanGebouw(g);
      ctx.strokeStyle = T.inDeKring(r, plek, straal) ? 'rgba(160, 225, 130, 0.95)' : 'rgba(240, 225, 170, 0.3)';
      tekenRand(ctx, r);
    }
    ctx.restore();
  }

  function tekenMarkeringen(ctx, S) {
    const h = S.handeling;
    const licht = 'rgba(250, 240, 210, 0.9)';
    const rood = 'rgba(224, 96, 79, 0.9)';

    // Bereik: waar de schout deze beurt nog kan komen.
    if (S.bereik && S.modus === 'gevecht' && !S.bezig) {
      ctx.fillStyle = 'rgba(111, 160, 230, 0.17)';
      for (const k of S.bereik.keys()) {
        const [x, y] = k.split(',').map(Number);
        const p = opGrond(x, y);
        T.ruit(ctx, p.x, p.y, 0.86);
        ctx.fill();
      }
    }

    // Het pad dat een klik zou lopen.
    if (h && h.pad && h.pad.length) {
      const kleur = h.kan === false ? rood : licht;
      ctx.fillStyle = kleur;
      for (const t of h.pad) {
        const p = opGrond(t.x, t.y);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const laatste = h.pad[h.pad.length - 1];
      const p = opGrond(laatste.x, laatste.y);
      T.ruit(ctx, p.x, p.y, 0.82);
      ctx.strokeStyle = kleur;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Wat er onder de muis ligt.
    const doel = S.hover;
    if (!doel || !(S.modus === 'verkennen' || S.modus === 'gevecht')) return;
    if (doel.wezen || doel.voorwerp) {
      const e = doel.wezen || doel.voorwerp;
      const p = opGrond(e.x, e.y);
      ctx.strokeStyle = doel.wezen && doel.wezen.kant === 'monster' ? rood : 'rgba(250, 240, 210, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 20, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (h && !(h.pad && h.pad.length)) {
      const p = opGrond(doel.x, doel.y);
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
      const p = opGrond(x, y);
      T.sprites.teken(ctx, stomp, p.x, p.y, helder);
      return true;
    }
    const vlak = T.sprites.muur('muur', false);
    if (!vlak) return false;
    const achter = opGrond(x, y + 0.5);
    T.sprites.teken(ctx, vlak, achter.x, achter.y, helder);
    const voor = opGrond(x, y + 1);
    const naarKamer = isRuimte(w, x, y + 1);
    T.sprites.teken(ctx, (naarKamer && T.sprites.muur(muurDeco(w, x, y, false), false)) || vlak, voor.x, voor.y, helder);
    if (isRuimte(w, x + 1, y)) {
      const soort = muurDeco(w, x, y, true);
      const zij = soort !== 'muur' && T.sprites.muur(soort, true);
      if (zij) {
        const o = opGrond(x + 1, y);
        T.sprites.teken(ctx, zij, o.x, o.y, helder);
      }
    }
    return true;
  }

  function tekenMuur(ctx, w, x, y, laag, helder) {
    if (metSprites() && tekenMuurSprites(ctx, w, x, y, laag, helder)) return;
    const p = opGrond(x, y);
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
      const a = west ? opGrond(d.x + 0.5, d.y) : opGrond(d.x, d.y + 0.5);
      if (achter) T.sprites.teken(ctx, achter, a.x, a.y, helder);
    }
    const b = west ? opGrond(d.x + 1, d.y) : opGrond(d.x, d.y + 1);
    T.sprites.teken(ctx, deel, b.x, b.y, helder);
    return true;
  }

  function tekenDeur(ctx, d, laag, helder) {
    if (metSprites() && tekenDeurSprites(ctx, d, laag, helder)) return;
    const p = opGrond(d.x, d.y);
    const ns = d.richting === 'ns'; // de muur loopt van noord naar zuid: het paneel is dun in x
    // Een laag stompje naast een lage muur van sprites moet even hoog zijn als die muur.
    const laagH = metSprites() ? T.sprites.laagHoogte() : T.MUUR_LAAG;
    const muurHoogte = laag ? laagH : T.MUUR_HOOG;
    const steen = '#6f675c';
    if (d.staat === 'open') {
      for (const s of [-0.4, 0.4]) {
        const q = ns ? opGrond(d.x, d.y + s) : opGrond(d.x + s, d.y);
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
  // langs kunt, en om met Spel.debug.vlakken te kunnen vergelijken.
  const BUITENVLAK = {
    eik: ['#4a7030', 46, 0.30], herfstEik: ['#a9632a', 46, 0.30], den: ['#2f5734', 54, 0.26],
    berk: ['#6f9a45', 40, 0.22], dodeBoom: ['#6b5a44', 44, 0.20], wilg: ['#5d7f3c', 42, 0.32],
    appelboom: ['#4f7a33', 38, 0.30], struik: ['#3d6329', 18, 0.30], bessenStruik: ['#3a5f2c', 16, 0.30],
    varen: ['#476b2c', 10, 0.26], grasPol: ['#4e7430', 8, 0.22], hoogGras: ['#577d33', 14, 0.22],
    bloemen: ['#6d8a3c', 8, 0.24], paddenstoelen: ['#9a7250', 6, 0.16], boomstronk: ['#6a5238', 12, 0.26],
    rots: ['#77736c', 20, 0.30], kleineRots: ['#7d7973', 10, 0.20],
  };

  function tekenBuitenVlak(ctx, v, helder) {
    const p = opGrond(v.x, v.y);
    const b = v.beslaat || [1, 1];
    const vorm = BUITENVLAK[v.soort];
    if (vorm) {
      const [hex, hoog, breed] = vorm;
      if (hoog > 24) T.blok(ctx, p.x, p.y, 0.08, 0.08, hoog * 0.55, '#5a4632', { helder }); // stam
      T.blok(ctx, p.x, p.y, breed, breed, hoog * 0.6, hex, { helder, basis: hoog > 24 ? hoog * 0.45 : 0 });
      return;
    }
    // een gebouw: een blok zo groot als zijn voet, met zijn midden op het midden van die voet
    const m = opGrond(v.x + (b[0] - 1) / 2, v.y + (b[1] - 1) / 2);
    const hoog = Math.max(40, 26 * Math.max(b[0], b[1]));
    T.blok(ctx, m.x, m.y, b[0] / 2, b[1] / 2, hoog, '#8a6f4e', { helder });
  }

  // Elk voorwerp buigt op zijn eigen moment mee met de wind, anders wappert het hele erf als één
  // vlag: een vaste verschuiving in de tijd uit zijn eigen plek op de kaart (dezelfde soort som
  // als de vlek in tekenVloeren hierboven). T.windWaarde hieronder is de ene golf waar alles aan
  // hangt; hier alleen op een ander moment bemonsterd. Weegt de soort van dit voorwerp niets mee,
  // dan doet sprites.buiten er toch niets mee (zie WIND_GEWICHT daar).
  //
  // Eén windwaarde voor de hele wereld, ergens tussen -1 en 1: hoe hard en naar welke kant. Twee
  // golven op een verhouding die niet deelt (dus het herhaalt niet merkbaar) plus af en toe een
  // vlaag erbovenop, zodat het als weer leest en niet als een speeltje. js/sprites.js bakt hierop
  // de standen van een voorwerp. Zie ontwerp/beeld.md, "Eén wind door alles heen". Stond in
  // js/main.js; staat hier omdat gereedschap/wereld.html tekent zonder de spellus erbij te laden.
  T.windWaarde = function (tijd) {
    const golf = Math.sin(tijd * 0.31) * 0.4 + Math.sin(tijd * 0.13 + 1.3) * 0.3;
    const vlaag = Math.max(0, Math.sin(tijd * 0.085 + 0.7)) ** 4 * 0.5;
    return Math.max(-1, Math.min(1, golf + vlaag));
  };

  function windVoorInstantie(S, v) {
    const fase = ((v.x * 137 + v.y * 251) % 97) / 97 * 23;
    return T.windWaarde(S.tijd + fase);
  }

  // ---------------------------------------------------------------- het bos om de kaart heen
  //
  // Buiten de kaart stond tot nu toe niets: de camera hield daarom een marge aan tot de rand (de
  // oude begrensCamera in js/main.js), en op een kleine kaart liep de schout zo ver uit het midden
  // dat hij onder het paneel verdween (Marcel, 21 sep 2026). De camera volgt de schout nu altijd
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
  // herfstEik is de oranje-rode herfstvariant van de eik (gereedschap/pixelart/bomen.cjs); in het
  // gehucht staat de kalender op lente (js/tijd.js, S.kalender), dus daar hoort geen herfstboom te
  // staan (Marcel, 23 sep 2026). Seizoenen die bomen écht laten verkleuren komen later; dit is de
  // plek waar dat dan aan S.kalender.seizoen moet gaan hangen in plaats van aan de gebiedsnaam.
  const HERFST_SOORTEN = ['herfstEik'];
  const BOSRAND_GEBIEDEN_ZONDER_HERFST = ['gehucht'];
  const BOSRAND_DICHT = 2; // ringen die helemaal vol staan, vlak tegen de kaart aan
  const BOSRAND_DIEP = 16; // ringen waarna er niets meer bij komt
  const BOSRAND_HELDER_MIN = 0.32;
  const BOSRAND_OPEN = 0.05; // zoveel van het bos staat er buiten een open kant: een losse boom hier en daar

  // Welke (vel, id)-paren in tegels/bomen.png en tegels/begroeiing.png een boom of struik zijn:
  // op naam opgezocht in T.TEGELS, niet op een vast nummer. De pixel-art-gereedschap maakt die
  // vellen opnieuw aan (npm run pixelart), en dan kan de volgorde erin verschuiven. Twee lijsten
  // (met en zonder herfstvarianten), want welke van de twee een gebied krijgt hangt af van het
  // gebied zelf (zie bosrandOp hieronder) en dat kan per wereld verschillen.
  const bosrandVellenPerSoort = {};
  function bosrandVellenOpbouwen(metHerfst) {
    const r = [];
    for (const velNaam of ['bomen', 'begroeiing']) {
      const vel = T.TEGELS && T.TEGELS[velNaam];
      if (!vel) continue;
      vel.tiles.forEach((tegel, id) => {
        if (!tegel || !BOSRAND_SOORTEN.includes(tegel.naam)) return;
        if (!metHerfst && HERFST_SOORTEN.includes(tegel.naam)) return;
        r.push({ vel: velNaam, id, soort: tegel.naam });
      });
    }
    return r;
  }

  // De tekeningen van een boom of een rots, op naam, in tegels/bomen.png en tegels/begroeiing.png: voor wat het eiland
  // om de kaart heeft (bosrandOp).
  const tekeningenPerNaam = {};
  function tekeningenVan(naam) {
    if (!tekeningenPerNaam[naam]) {
      const r = [];
      for (const velNaam of ['bomen', 'begroeiing']) {
        const vel = T.TEGELS && T.TEGELS[velNaam];
        if (!vel) continue;
        vel.tiles.forEach((t, id) => {
          if (t && t.naam === naam) r.push({ vel: velNaam, id });
        });
      }
      tekeningenPerNaam[naam] = r;
    }
    return tekeningenPerNaam[naam];
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
  // is niet (alleen) voor de snelheid: T.werkDoorkijkBij (js/doorkijk.js) laat een boom vervagen
  // als hij de schout bedekt, en dat kan alleen vloeiend als het van beeld op beeld hetzelfde object
  // blijft.
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
      if (w.eiland) {
        // op het eiland: wat het eiland er heeft, een boom of een rots (js/maker.js, vraag 117, 2b), naar buiten dunner
        const soort = T.randVanHetEiland(w).voorwerp(x, y);
        const keuzes = soort ? tekeningenVan(soort) : [];
        if (keuzes.length && hasj(x, y, zaad) < bosrandDichtheid(r)) {
          const keuze = keuzes[Math.floor(hasj(x, y, zaad + 1) * keuzes.length)];
          v = { soort, vel: keuze.vel, id: keuze.id, x, y, beslaat: [1, 1], r, bosrand: true };
        }
      } else if (hasj(x, y, zaad) < bosrandDichtheid(r) * Math.max(BOSRAND_OPEN, bosBuiten(w, x, y))) {
        // alleen aan de kant van het bos; in het open land erbuiten hier en daar een boom (Marcel, 4 okt)
        const metHerfst = !BOSRAND_GEBIEDEN_ZONDER_HERFST.includes(w.gebied);
        const soort = metHerfst ? 'met' : 'zonder';
        if (!bosrandVellenPerSoort[soort]) bosrandVellenPerSoort[soort] = bosrandVellenOpbouwen(metHerfst);
        const bosrandVellen = bosrandVellenPerSoort[soort];
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
  // met Spel.debug.meet op een hoek van het dorp, ruim boven de 16 ms die één beeld hoort te
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
    c.versie = 1; // eens getekend, blijft hij zo (js/gl.js)
    const gebakken = { beeld: c, sx: 0, sy: 0, b: stuk.b, h: stuk.h, ax: stuk.ax, ay: stuk.ay };
    perStap.set(stap, gebakken);
    return gebakken;
  }

  // De ruïne van een afgebrand huis (js/brand.js; vraag 144, 3; Marcel: "huizen die 'afgefikt' zijn als art"): de bouwfase
  // van zijn tekening zonder dak (puinFase, de balken), zwart geblakerd; een tekening zonder bouwfasen wordt zelf zwart.
  // Eén keer gebakken per tekening, zoals bosrandGedimd hierboven.
  const verkoold = new Map();
  function puinVan(v) {
    if (typeof document === 'undefined') return null;
    const fase = v.tekeningNaam && T.sprites.bouwfase(v.tekeningNaam, T.BRAND_INSTELLINGEN.puinFase);
    // Heeft hij bouwfasen, maar is hun vel nog niet geladen (js/sprites.js), dan nog even het huis zelf.
    if (!fase && v.tekeningNaam && T.BOUWFASEN && T.BOUWFASEN.fasen[v.tekeningNaam]) return null;
    const stuk = fase || T.sprites.buiten(v.vel, v.id);
    if (!stuk) return null;
    const sleutel = fase ? `fase:${v.tekeningNaam}` : `huis:${v.vel}:${v.id}`;
    const bestaand = verkoold.get(sleutel);
    if (bestaand) return bestaand;
    const c = document.createElement('canvas');
    c.width = stuk.b;
    c.height = stuk.h;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(stuk.beeld, stuk.sx, stuk.sy, stuk.b, stuk.h, 0, 0, stuk.b, stuk.h);
    cx.globalCompositeOperation = 'source-atop';
    cx.fillStyle = T.BRAND_INSTELLINGEN.beeld.verkool;
    cx.fillRect(0, 0, stuk.b, stuk.h);
    // Hier en daar as: grijze vlekjes, op vaste plekken.
    cx.fillStyle = 'rgba(120, 112, 104, 0.55)';
    for (let i = 0; i < (stuk.b * stuk.h) / 900; i++) cx.fillRect(Math.floor(beeldLot(i, 61) * stuk.b), Math.floor(beeldLot(i, 62) * stuk.h), 2, 2);
    c.versie = 1; // eens getekend, blijft hij zo (js/gl.js)
    const gebakken = { beeld: c, sx: 0, sy: 0, b: stuk.b, h: stuk.h, ax: stuk.ax, ay: stuk.ay };
    verkoold.set(sleutel, gebakken);
    return gebakken;
  }

  // Waar een huis dat brandt of smeult op het scherm staat: het midden van zijn voet, hoe breed (pixels), en hoe hoog zijn
  // dak (het anker van zijn tekening).
  function brandPlekken(S) {
    const D = T.dorpHier(S);
    if (!D || !D.gebouwen) return [];
    const uit = [];
    for (const g of T.brandendeHuizen(D)) {
      const v = g.voorwerp;
      if (!v || !T.smeult(D, g)) continue;
      const voet = T.voetVanGebouw(g);
      const p = opGrond(voet.x + voet.b / 2 - 0.5, voet.y + voet.h / 2 - 0.5);
      const stuk = metSprites() && T.sprites.buiten(v.vel, v.id);
      const hoog = stuk ? Math.min(stuk.ay, 180) : 70;
      uit.push({ g, p, voet, breed: (voet.b + voet.h) * 15, hoog: g.brand.fase === 'brandt' ? hoog : hoog * 0.45, brandt: g.brand.fase === 'brandt' });
    }
    return uit;
  }

  // De rook van wat brandt en smeult, vóór de nacht (dus 's nachts donker): dikke grijze wolken die opstijgen, groter en
  // lichter worden en met de wind meedrijven, uit vierkanten zoals de regen, zodat de videokaart ze zelf tekent.
  function tekenRook(ctx, S) {
    const B = T.BRAND_INSTELLINGEN.beeld;
    const t = S.tijd || 0;
    for (const b of brandPlekken(S)) {
      const n = b.brandt ? B.rook : Math.round(B.rook / 4);
      for (let i = 0; i < n; i++) {
        const leeftijd = (t * (0.07 + 0.04 * beeldLot(i, 71)) + beeldLot(i, 72)) % 1;
        const x = b.p.x + (beeldLot(i, 73) - 0.5) * b.breed * 0.5 + leeftijd * leeftijd * 140 + Math.sin(t * 0.7 + i) * 6;
        const y = b.p.y - b.hoog * 0.7 - leeftijd * B.rookHoog;
        const m = Math.round((b.brandt ? 16 : 8) + leeftijd * (b.brandt ? 46 : 22));
        const a = (b.brandt ? 0.55 : 0.32) * (1 - leeftijd) * Math.min(1, leeftijd * 5);
        const grijs = Math.round(44 + 60 * leeftijd);
        ctx.fillStyle = `rgba(${grijs}, ${grijs - 3}, ${grijs - 6}, ${a.toFixed(3)})`;
        ctx.fillRect(Math.round(x - m / 2), Math.round(y - m / 2), m, m);
      }
    }
  }

  // De vlammen, ná de nacht (een vuur is ook in het donker fel): een gloed over het huis, tongen van vuur over het dak die
  // op en neer gaan (geel aan de voet, oranje, rode punten), en vonken die opstijgen; op het puin dat nog smeult, sintels.
  // Alles uit vierkanten, in pixels zoals de rest van het beeld.
  const VUUR = [[255, 244, 170], [255, 214, 90], [255, 158, 40], [236, 96, 24], [178, 44, 18]];
  function tekenVuur(ctx, S) {
    const B = T.BRAND_INSTELLINGEN.beeld;
    const t = S.tijd || 0;
    for (const b of brandPlekken(S)) {
      if (!b.brandt) {
        for (let i = 0; i < B.sintels; i++) {
          const gloed = 0.5 + 0.5 * Math.sin(t * (2 + beeldLot(i, 81) * 3) + i);
          ctx.fillStyle = `rgba(255, ${Math.round(90 + 60 * gloed)}, 30, ${(0.35 + 0.5 * gloed).toFixed(3)})`;
          const x = b.p.x + (beeldLot(i, 82) - 0.5) * b.breed * 0.8;
          const y = b.p.y - beeldLot(i, 83) * b.hoog;
          ctx.fillRect(Math.round(x), Math.round(y), 4, 3);
        }
        continue;
      }
      const midden = b.p.y - b.hoog * 0.6;
      const r = b.breed * 0.75;
      const gloed = ctx.createRadialGradient(b.p.x, midden, 0, b.p.x, midden, r);
      gloed.addColorStop(0, `rgba(255, 140, 50, ${(0.42 + 0.08 * Math.sin(t * 9)).toFixed(3)})`);
      gloed.addColorStop(0.6, 'rgba(255, 110, 40, 0.16)');
      gloed.addColorStop(1, 'rgba(255, 90, 30, 0)');
      ctx.fillStyle = gloed;
      ctx.fillRect(b.p.x - r, midden - r, r * 2, r * 2);
      // De tongen: elk een stapel vierkanten, onderaan breed, naar boven smaller, die flakkert in hoogte en opzij, op vaste
      // plekken over het hele dak: een punt op de voet van het huis, zo hoog als het dak daar is (het hoogst in het midden).
      const px = 4;
      const tongen = Math.max(B.tongen, Math.min(24, Math.round((b.voet.b * b.voet.h) / 3)));
      for (let k = 0; k < tongen; k++) {
        const fx = 0.15 + 0.7 * beeldLot(k, 98);
        const fy = 0.15 + 0.7 * beeldLot(k, 99);
        const q = opGrond(b.voet.x + fx * b.voet.b - 0.5, b.voet.y + fy * b.voet.h - 0.5);
        const midden = 1 - Math.max(Math.abs(fx - 0.5), Math.abs(fy - 0.5)) * 2;
        const voetX = q.x;
        const voetY = q.y - b.hoog * (0.35 + 0.45 * midden);
        const hoog = B.vlamHoog * (0.45 + 0.35 * beeldLot(k, 95) + 0.2 * Math.sin(t * (5 + k) + k * 1.7));
        for (let y = 0; y < hoog; y += px) {
          const f = y / hoog;
          const breed = Math.round((1 - f) * (14 + 10 * beeldLot(k, 96)) / px) * px;
          if (breed < px) break;
          const opzij = Math.sin(t * 7 + k + f * 4) * 6 * f;
          const c = VUUR[Math.min(VUUR.length - 1, Math.floor(f * VUUR.length + 0.5 * beeldLot(k * 31 + y, 97)))];
          ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${(0.92 - 0.35 * f).toFixed(3)})`;
          ctx.fillRect(Math.round((voetX + opzij - breed / 2) / px) * px, Math.round((voetY - y) / px) * px, breed, px);
        }
      }
      // De vonken.
      for (let i = 0; i < B.vlammen; i++) {
        const leeftijd = (t * (0.9 + 0.8 * beeldLot(i, 91)) + beeldLot(i, 92)) % 1;
        const u = beeldLot(i, 93) - 0.5;
        const x = b.p.x + u * b.breed * 0.6 * (1 - 0.3 * leeftijd) + Math.sin(t * 6 + i) * 5 * leeftijd;
        const y = b.p.y - b.hoog * (0.35 + 0.45 * beeldLot(i, 94)) - leeftijd * B.vlamHoog * 1.4;
        const m = Math.max(2, Math.round(7 * (1 - leeftijd)));
        const c = VUUR[Math.min(VUUR.length - 1, Math.floor(leeftijd * VUUR.length))];
        ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${(0.95 * (1 - leeftijd * 0.7)).toFixed(3)})`;
        ctx.fillRect(Math.round(x - m / 2), Math.round(y - m / 2), m, m);
      }
    }
  }

  // Tekent één boom of struik van de bosrand: hetzelfde plaatje en dezelfde windbuiging als
  // gewone buitenversiering (tekenVoorwerp hieronder), maar met bosrandHelder in plaats van
  // randDof — dat laatste is voor het verbleken van bestaande kaartversiering vlak bij háár eigen
  // rand (w.doof, door Marcel per kaart gezet) en is hier niet aan de orde.
  //
  // Bedekt hij de schout (T.werkDoorkijkBij, js/doorkijk.js), dan valt hij helemaal weg, in plaats van
  // een kijkgat te krijgen of te vervagen. De bosrand staat op een hoek van de kaart soms met twee dichte
  // randen tegelijk om de schout heen, en dan bedekken tien, twintig bomen hem allemaal tegelijk.
  // Doorzichtigheid stapelt vermenigvuldigend (twee bomen op 0.4 laten samen nog maar 0.16 van de
  // schout zien, bij twintig is dat allang niets meer), dus een kleine waarde lost dat niet op. Eén los
  // ding mag doorschemeren; een heel woud aan verwisselbare achtergrondbomen niet.
  function tekenBosrandBoom(ctx, S, v) {
    const zicht = 1 - (v.doorkijk || 0);
    if (zicht <= 0.02) return; // helemaal weggevallen: dan is er niets te tekenen
    const p = opGrond(v.x, v.y);
    if (zicht < 1) ctx.globalAlpha = zicht;
    const helder = bosrandHelder(v.r);
    const ruw = metSprites() && T.sprites.buitenAan && T.sprites.buiten(v.vel, v.id, windVoorInstantie(S, v));
    // Het donkerder maken zit al in het plaatje (bosrandGedimd); T.sprites.teken hoeft dus geen
    // ctx.filter meer aan te zetten, vandaar de 1 hier.
    if (ruw) T.sprites.teken(ctx, bosrandGedimd(ruw, helder), p.x, p.y, 1);
    else tekenBuitenVlak(ctx, v, helder);
    if (zicht < 1) ctx.globalAlpha = 1;
  }

  // Het halsijzer om de nek van wie aan de schandpaal staat (js/heer.js, T.aanDePaal): het anker van
  // de cel is het midden van de band, en dat komt zo hoog boven zijn voeten als zijn vel zijn nek
  // heeft (T.sprites.nekHoogte).
  function tekenHalsijzer(ctx, e) {
    const deel = T.sprites.schandpaal && T.sprites.schandpaal('halsijzer');
    if (!deel) return;
    const p = opGrond(e.x, e.y);
    T.sprites.teken(ctx, deel, p.x, p.y - T.sprites.nekHoogte(e), 1);
  }

  // Per huis, gebouw of wezen het plaatje dat er het laatst stond, voor zolang een nieuw plaatje laadt (tekenVoorwerp,
  // tekenWezen). Alleen scherm, en weg met het voorwerp of het wezen.
  const vorigBeeld = new WeakMap();

  function tekenVoorwerp(ctx, S, v, helder) {
    const p = opGrond(v.x, v.y);
    // Buiten komt het plaatje uit de tegelvellen (tegels/, zie js/sprites.js): een boom, een
    // struik, een gebouw. Het anker van de cel is de voet, dus hij valt precies op het
    // midden van zijn eigen tegel.
    if (v.vel) {
      // dof: hoe ver van de rand van de kaart — dat vervaagt nog altijd het hele voorwerp.
      // doorkijk: staat er iemand achter die je hoort te zien (js/doorkijk.js)? Dan gaat het voorwerp
      // om de andere pixel open (het raster), of het blijft staan en krijgt na het tekenen een
      // kijkgat op wie erachter staat (het venster): wat de spelregels zeggen.
      const dof = randDof(S.wereld, v.x, v.y);
      const doorkijk = v.doorkijk || 0;
      // In aanbouw (js/gebouwen.js, T.plaatsGebouw): heeft dit gebouw fases in tegels/bouwfasen.png
      // (T.bouwFaseIndex kiest welke, op hoe ver de bouwtijd is), dan die — anders (kapel,
      // watermolen, put, ...) net als voorheen gewoon bleker tot hij klaar is, zonder er een
      // tweede tekening voor nodig te hebben.
      const fase = v.inAanbouw && v.tekeningNaam && T.bouwFaseIndex && metSprites() && T.sprites.bouwfase
        && T.sprites.bouwfase(v.tekeningNaam, T.bouwFaseIndex(S.kalender ? S.kalender.dag : 0, v.klaarOp, v.bouwtijd, v.vanFase || 0));
      // Afgebrand (js/brand.js): de ruïne, een bouwfase zonder dak, verkoold.
      const puin = v.brand === 'puin' && metSprites() ? puinVan(v) : null;
      const alpha = dof * (v.inAanbouw && !fase ? 0.45 : 1);
      if (alpha <= 0.02) return;
      if (alpha < 1) ctx.globalAlpha = alpha;
      const plaatjes = metSprites() && T.sprites.buitenAan;
      let stuk = puin || fase || (plaatjes && T.sprites.buiten(v.vel, v.id, windVoorInstantie(S, v)));
      // Een huis of een gebouw heeft een eigen bestand, dat pas laadt als hij op de kaart staat (js/sprites.js; vraag
      // 114, stap 1). Laadt het nog, dan wat er daarnet stond (een huis dat net doorgroeide), en anders niets: een vlak
      // alleen als het plaatje echt ontbreekt.
      const wacht = !stuk && plaatjes && T.sprites.wachtOp(v.vel, v.id);
      if (wacht) stuk = vorigBeeld.get(v) || null;
      else if (stuk && (T.TEGELS[v.vel] || {}).perTekening) vorigBeeld.set(v, stuk);
      const raster = stuk && doorkijk > 0.02 && T.DOORKIJK_INSTELLINGEN.manier === 'raster';
      if (raster) T.tekenGerasterd(ctx, stuk, p.x, p.y, helder, doorkijk);
      else if (stuk) T.sprites.teken(ctx, stuk, p.x, p.y, helder);
      else if (!wacht) tekenBuitenVlak(ctx, v, helder);
      if (alpha < 1) ctx.globalAlpha = 1;
      if (!raster && doorkijk > 0.02 && v.kijkgat) for (const e of v.kijkgat) T.tekenKijkgat(ctx, S, e, doorkijk, v);
      return;
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
      if (v.soort === 'fontein' && !S.fonteinLeeg) {
        // Het water blijft bewegen: een rimpel over de kom en een druppel in de straal. Een lege
        // fontein (je nam zelf de laatste slok) staat stil.
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
    if (v.soort === 'schandpaal') {
      // De schandpaal (js/heer.js): leeg, met het halsijzer open tegen de paal, of bezet, met de
      // ketting naar wie ervoor staat (T.aanDePaal); diens halsijzer komt ná hem (tekenHalsijzer).
      const D = T.dorpHier(S);
      const paal = metSprites() && T.sprites.schandpaal && T.sprites.schandpaal(T.aanDePaal && D && T.aanDePaal(D) ? 'bezet' : 'leeg');
      if (paal) {
        T.sprites.teken(ctx, paal, p.x, p.y, helder);
        return;
      }
      // Zonder kunst: een stenen trede en een eiken paal.
      T.blok(ctx, p.x, p.y, 0.3, 0.3, 6, '#6f6a62', { helder });
      T.blok(ctx, p.x, p.y, 0.08, 0.08, 80, '#6e4a2a', { helder, basis: 6 });
      return;
    }
    if (v.soort === 'meiboom') {
      // De meiboom (js/feesten.js): een berk met een kroon, een krans en linten. Zonder kunst: een witte paal met een
      // groene kroon.
      const boom = metSprites() && T.sprites.meiboom && T.sprites.meiboom();
      if (boom) {
        T.sprites.teken(ctx, boom, p.x, p.y, helder);
        return;
      }
      T.blok(ctx, p.x, p.y, 0.05, 0.05, 140, '#e6e2da', { helder });
      T.blok(ctx, p.x, p.y, 0.16, 0.16, 16, '#5d8a34', { helder, basis: 140 });
      return;
    }
    if (v.soort === 'hol') {
      // Het hol van een roedel wolven (js/beesten.js): een kuil onder een omgevallen boom, met botten ervoor. Zonder kunst:
      // een donkere kuil met een omgevallen stam erachter.
      const hol = metSprites() && T.sprites.hol();
      if (hol) {
        T.sprites.teken(ctx, hol, p.x, p.y, helder);
        return;
      }
      T.blok(ctx, p.x, p.y, 0.3, 0.3, 2, '#1c1410', { helder });
      T.blok(ctx, p.x, p.y, 0.5, 0.1, 10, '#5e4a36', { helder, basis: 2 });
      return;
    }
    if (v.soort === 'wijnrank') {
      // Een wijnrank (js/wijngaard.js; vraag 136): kaal, blad, vol met trossen of leeg, naar de maand en of hij geplukt
      // is. Zonder kunst: een paal met een groen (of blauw, als hij vol hangt) blok.
      const stand = T.rankStand(v, S.kalender.dag);
      const rank = metSprites() && T.sprites.wijnrank && T.sprites.wijnrank(stand, v.variant);
      if (rank) {
        T.sprites.teken(ctx, rank, p.x, p.y, helder);
        return;
      }
      T.blok(ctx, p.x, p.y, 0.05, 0.05, 40, '#6b4a2e', { helder });
      if (stand !== 'kaal') T.blok(ctx, p.x, p.y, 0.4, 0.12, 22, stand === 'vol' ? '#3b2f6b' : stand === 'leeg' ? '#b98a2e' : '#4f7d2e', { helder, basis: 12 });
      return;
    }
    if (v.soort === 'kraam') {
      // Een kraam van de markt op het plein (js/markt.js; werklijst vraag 110, d): een toonbank met een gestreepte luifel,
      // naar het midden van het plein. In aanbouw bleker, zoals een gebouw zonder bouwfasen. Zonder kunst: een toonbank
      // en een rode luifel op palen.
      if (v.inAanbouw) ctx.globalAlpha = 0.45;
      const kraam = metSprites() && T.sprites.kraam && T.sprites.kraam(v.waar || 'groente', v.vorm || 'luifel', v.lengte || 1, v.leeg, v.richting);
      if (kraam) T.sprites.teken(ctx, kraam, p.x, p.y, helder);
      else {
        const [b, h] = v.beslaat || [1, 1];
        for (let i = 0; i < Math.max(b, h); i++) {
          const q = opGrond(v.x + (b > 1 ? i : 0), v.y + (h > 1 ? i : 0));
          T.blok(ctx, q.x, q.y, 0.34, 0.34, 14, '#7a5532', { helder });
          T.blok(ctx, q.x, q.y, 0.04, 0.04, 22, '#5e4128', { helder, basis: 14 });
          if (!v.leeg) T.blok(ctx, q.x, q.y, 0.42, 0.42, 3, '#b8432f', { helder, basis: 36 });
        }
      }
      ctx.globalAlpha = 1;
      return;
    }
    if (v.soort === 'mand') {
      // Een mand, kist, zak of ton naast een kraam (js/markt.js). Zonder kunst: een rieten blokje.
      const mand = metSprites() && T.sprites.mand && T.sprites.mand(v.wat);
      if (mand) T.sprites.teken(ctx, mand, p.x, p.y, helder);
      else T.blok(ctx, p.x, p.y, 0.18, 0.18, 10, '#a08850', { helder });
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
    // Een mens: iedereen die geen eigen vlaktekening heeft (de schout, een boer, een dorpeling).
    // Het was tot 25 sep Wim, de knecht uit het oude spel, zonder zijn bezem.
    mens(ctx, cx, cy, bob) {
      T.blok(ctx, cx, cy, 0.19, 0.19, 22 + bob, '#7a5a3a'); // jas
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

  // Naar binnen en naar buiten (js/verkennen.js zet e.deurSinds en e.deur): in DEUR_TIJD seconden
  // stapt hij de deur in en vervaagt hij, of komt hij eruit en wordt hij weer helder. De deur zelf
  // ligt een halve tegel achter de tegel ervoor, in de gevel. Zonder deur (de schout die gaat slapen)
  // vervaagt hij waar hij staat. Alleen voor het scherm: in de regels is hij meteen binnen.
  const DEUR_TIJD = 0.6;
  T.deurStap = deurStap; // ook voor het kijkgat (js/doorkijk.js)
  function deurStap(S, e) {
    if (e.deurSinds == null) return null;
    const t = (S.tijd - e.deurSinds) / DEUR_TIJD;
    if (!(t >= 0 && t < 1)) return null;
    const erin = e.binnen ? t : 1 - t; // hoe ver hij de deur in is: 0 buiten, 1 binnen
    const d = e.deur;
    return {
      x: d ? e.x + (d.x - e.x) * erin : e.x,
      y: d ? e.y + (d.y - 0.5 - e.y) * erin : e.y,
      alpha: 1 - erin,
    };
  }

  T.tekenWezen = tekenWezen; // ook voor het kijkgat (js/doorkijk.js)
  function tekenWezen(ctx, S, e) {
    const stap = deurStap(S, e);
    const p = stap ? opGrond(stap.x, stap.y) : opGrond(e.x, e.y);
    let cx = p.x;
    let cy = p.y;
    if (e.uitval) {
      const q = opGrond(e.uitval.doel.x, e.uitval.doel.y);
      const k = e.uitval.t < 0.5 ? e.uitval.t * 2 : (1 - e.uitval.t) * 2;
      cx += (q.x - p.x) * 0.32 * k;
      cy += (q.y - p.y) * 0.32 * k;
    }
    // Met sprites speelt het vel de houding af (staan, lopen, uithalen, geraakt, sterven);
    // met vlakken blijft het bij een huppelpas en een vervagend lijk.
    let deel = metSprites() ? T.sprites.wezen(S, e) : null;
    // Een figuur laadt pas als zijn wezen op de kaart komt (js/sprites.js; vraag 114, stap 1b). Laadt hij nog, dan het beeld
    // van daarnet (een kind dat opgroeit, een boer die gaat maaien), en anders staat er nog niemand.
    if (deel) vorigBeeld.set(e, deel);
    else if (metSprites() && T.sprites.laadtWezen(e)) {
      deel = vorigBeeld.get(e);
      if (!deel) return;
    }
    ctx.save();
    if (stap) ctx.globalAlpha *= stap.alpha;
    if (e.dood && !deel) {
      ctx.globalAlpha = Math.max(0, 1 - e.sterfTijd / 0.8);
      cy += e.sterfTijd * 10;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.32)'; // schaduw
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    const bob = Math.sin(S.tijd * 2.6 + e.fase) * 1.3;
    const huppel = !deel && e.onderweg ? Math.abs(Math.sin(S.tijd * 14)) * 2.5 : 0;
    let top;
    if (deel) {
      // Sluipen heeft nog geen eigen houding: de schout doet het in het halfdonker.
      if (e === S.schout && S.sluipen && !S.gevecht) ctx.globalAlpha *= 0.8;
      T.sprites.teken(ctx, deel, cx, cy);
      top = cy - T.sprites.hoogte(e.soort);
      // een klap: een rood dambord over de figuur
      if (e.flits > 0) overlaag(ctx, deel, cx, cy, KLAP_KLEUR, e.flits > 0.18 ? 0.5 : 0.25);
    } else {
      // Een wezen uit een kaart kan een soort hebben waar nog geen kunst bij is. Dan tekenen we een
      // gewone mens: er staat iemand, en één zo'n figuur legt niet het hele beeld plat.
      const teken = TEKENAARS[e.soort] || TEKENAARS.mens;
      top = teken(ctx, cx, cy - huppel, bob, e, S);
    }
    if (e.flits > 0 && !deel) {
      ctx.fillStyle = `rgba(255, 70, 50, ${Math.min(0.55, e.flits * 2)})`;
      ctx.beginPath();
      ctx.ellipse(cx, (cy + top) / 2, 15, (cy - top) / 2 + 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Een vijand draagt zijn levensbalk in een gevecht, of als hij geraakt is; een rover altijd (js/rovers.js): hij
    // draagt het vel van een gewone dorpeling, en zo zie je dat hij geen dorpeling is.
    if (!e.dood && e.kant === 'monster' && (S.gevecht || e.leven < e.maxLeven || e.rover)) levensbalk(ctx, cx, top - 9, e);
    if (e.alarm > 0) roep(ctx, '!', cx, top - 14 - Math.abs(Math.sin(e.alarm * 9)) * 4, '#ffd24a');
    // Wie de schout zoekt met een voorval (js/voorvallen.js): een uitroepteken dat zacht op en neer gaat.
    else if (e.zoektSchout && !e.binnen) roep(ctx, '!', cx, top - 12 - Math.abs(Math.sin(S.tijd * 3)) * 3, '#f3e2a4');
    // Wie de wolven aanvallen, roept om hulp (js/beesten.js): een rood uitroepteken dat sneller springt.
    else if (e.roeptOmHulp) roep(ctx, '!', cx, top - 12 - Math.abs(Math.sin(S.tijd * 8)) * 4, '#ff6a50');
  }

  // Het teken bij de deur van een huis dat iets mist (2c, werklijst vraag 100; js/wensen.js, T.tekenVanHuis): een
  // papiertje aan een spijker met wat het als eerste mist. Na de nacht getekend, zoals het oogje, zodat je het ook in het
  // donker ziet. Alleen in het dorp dat hier ligt; zonder de kunst niet, en het gereedschap kent de wensen niet.
  function tekenHuisTekens(ctx, S) {
    const D = T.dorpHier(S);
    if (!D || !T.tekenVanHuis || !T.deurVan || !metSprites() || !T.sprites.huisTeken) return;
    for (const g of D.gebouwen || []) {
      const naam = T.tekenVanHuis(g);
      const deel = naam && T.sprites.huisTeken(naam);
      if (!deel) continue;
      const deur = T.deurVan(S.wereld, g);
      const p = opGrond(deur.x, deur.y);
      T.sprites.teken(ctx, deel, p.x, p.y - 66, 1); // boven hoofdhoogte, zodat het bij het huis hoort en niet bij wie ervoor staat
    }
  }

  // Het oogje boven een getuige (js/zien.js, T.werdGezien): hij zag je iets wegzetten of terughalen
  // (Marcel, vraag 40, A: je ziet het meteen). Na de nacht getekend, zodat je het ook in het donker
  // ziet, en het vervaagt in zijn laatste seconde.
  function tekenOogjes(ctx, S) {
    for (const e of S.wereld.wezens) {
      const over = (e.oogje || 0) - S.tijd;
      if (over <= 0 || e.binnen) continue;
      const p = opGrond(e.x, e.y);
      const hoogte = metSprites() ? T.sprites.hoogte(e.soort) : 52;
      const cx = p.x;
      const cy = p.y - hoogte - 16 - Math.abs(Math.sin(S.tijd * 3)) * 2;
      ctx.save();
      ctx.globalAlpha = Math.min(1, over);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      const amandel = () => {
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy);
        ctx.quadraticCurveTo(cx, cy - 9, cx + 10, cy);
        ctx.quadraticCurveTo(cx, cy + 9, cx - 10, cy);
        ctx.closePath();
      };
      amandel();
      ctx.stroke();
      ctx.fillStyle = '#f4ecd6';
      ctx.fill();
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Het wolkje boven wie een praatje maakt (js/praatje.js; werklijst vraag 120, b; Marcel, 4 okt: "120 a b c ja"): leeg,
  // met drie puntjes, om de beurt boven wie er praat, met een stilte tussen de beurten. Waar ze het over hebben, komt er
  // later in (met de mensen aan het werk). Na de nacht getekend, zoals het oogje, zodat je het ook in het donker ziet. Wie
  // er praat, komt uit de klok van het scherm en het zaad van het groepje: het is geen spelstaat. Het gereedschap kent
  // de praatjes niet.
  const BEURT = 2.2; // seconden per beurt, op het scherm
  const PRATEN = 0.75; // zo'n deel van een beurt staat het wolkje er; dan een stilte
  // De ogen van de wolven, 's nachts (js/beesten.js; werklijst vraag 116, Marcel: "Rode ogen uit het duister"): ná de
  // nacht getekend, zodat ze oplichten waar de wolf zelf zwart is, ook achter een boom. Waar ze in elk beeld zitten,
  // staat in beelden/ogen.js (T.OGEN, gemaakt door gereedschap/pixelart/ogen.cjs: twee van voren, een van opzij, geen
  // van achteren); welk beeld de wolf nu heeft, onthoudt hij zelf (e.beeldStand.laatste, js/sprites.js). Ver uitgezoomd
  // blijven ze even groot op het scherm, en af en toe knippert hij.
  const OOG_RICHTINGEN = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO'];
  function tekenOgen(ctx, S) {
    if (!S.kalender || !T.OGEN || !metSprites() || (T.debug && T.debug.geenNacht)) return;
    const sterk = Math.min(1, (T.lichtVan(S.kalender.dag).nacht - 0.35) / 0.4);
    if (sterk <= 0) return;
    const k = 1 / Math.min(1, Math.max(0.3, S.zoom));
    for (const e of S.wereld.wezens) {
      if (!e.beest || e.dood || !e.beeldStand || !e.beeldStand.laatste) continue;
      const l = e.beeldStand.laatste;
      const rij = T.OGEN[l.naam] && T.OGEN[l.naam][l.houding] && T.OGEN[l.naam][l.houding][OOG_RICHTINGEN.indexOf(l.richting)];
      const ogen = rij && rij[l.beeld];
      if (!ogen || !ogen.length) continue;
      if ((S.tijd + e.fase * 3) % (5 + (e.fase % 2)) < 0.14) continue;
      const p = opGrond(e.x, e.y);
      for (const [dx, dy] of ogen) {
        const x = p.x + dx;
        const y = p.y + dy;
        const r = 6 * k;
        const gloed = ctx.createRadialGradient(x, y, 0, x, y, r);
        gloed.addColorStop(0, `rgba(255,30,20,${0.75 * sterk})`);
        gloed.addColorStop(0.35, `rgba(220,20,10,${0.35 * sterk})`);
        gloed.addColorStop(1, 'rgba(200,0,0,0)');
        ctx.fillStyle = gloed;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,${Math.round(70 + 60 * sterk)},60,${sterk})`;
        ctx.fillRect(x - 0.9 * k, y - 0.9 * k, 1.8 * k, 1.8 * k);
      }
    }
  }

  function tekenWolkjes(ctx, S) {
    if (!T.praatjesOp || S.gevecht) return;
    const w = S.wereld;
    for (const [g, leden] of T.praatjesOp(w)) {
      // Met wie jij praat, praat niet met hen.
      const erbij = leden.filter((e) => T.staatErbij(e) && e !== S.spreektMet && T.isZichtbaar(w, e.tx, e.ty));
      const n = erbij.length;
      if (n < 2) continue;
      const t = S.tijd / BEURT + (g.zaad % 10) / 10;
      const beurt = Math.floor(t);
      const deel = t - beurt;
      if (deel > PRATEN) continue;
      // Om en om met twee; met drie of vier steeds een ander, nooit twee keer achter elkaar dezelfde.
      const i = n === 2 ? (beurt + g.zaad) % 2 : (beurt + g.zaad + Math.floor(beurt / n)) % n;
      wolkje(ctx, erbij[i], Math.min(1, deel / 0.08, (PRATEN - deel) / 0.08));
    }
  }

  function wolkje(ctx, e, alpha) {
    const p = opGrond(e.x, e.y);
    const hoogte = metSprites() ? T.sprites.hoogte(e.soort) : 52;
    const b = 22;
    const h = 13;
    const r = 6;
    const x0 = p.x + 6 - b / 2;
    const y0 = p.y - hoogte - 8 - h;
    const vorm = () => {
      ctx.beginPath();
      ctx.moveTo(x0 + r, y0);
      ctx.arcTo(x0 + b, y0, x0 + b, y0 + h, r);
      ctx.arcTo(x0 + b, y0 + h, x0, y0 + h, r);
      ctx.arcTo(x0, y0 + h, x0, y0, r);
      ctx.arcTo(x0, y0, x0 + b, y0, r);
      ctx.closePath();
    };
    // Het staartje wijst naar wie er praat.
    const staart = () => {
      ctx.beginPath();
      ctx.moveTo(x0 + 5, y0 + h - 1);
      ctx.lineTo(p.x - 1, y0 + h + 6);
      ctx.lineTo(x0 + 11, y0 + h - 1);
      ctx.closePath();
    };
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillStyle = '#f4ecd6';
    // Eerst beide randen, dan beide vlakken: zo valt de rand tussen het wolkje en zijn staartje weg.
    vorm();
    ctx.stroke();
    staart();
    ctx.stroke();
    vorm();
    ctx.fill();
    staart();
    ctx.fill();
    ctx.fillStyle = '#3a2a1a';
    for (const dx of [-5.5, 0, 5.5]) {
      ctx.beginPath();
      ctx.arc(x0 + b / 2 + dx, y0 + h / 2, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
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

  // De zwevende getallen: de schade van een klap, boven het hoofd van wie hem kreeg.
  function tekenEffecten(ctx, S) {
    for (const fx of S.effecten) {
      const f = fx.t / fx.duur;
      if (fx.t < 0 || fx.soort !== 'tekst') continue; // een tekst die nog even wacht
      const p = opGrond(fx.x, fx.y);
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
    }
  }

  // ---------------------------------------------------------------- een laag over een figuur
  //
  // Een figuur die een klap krijgt, krijgt een rood dambord over zich heen. De kleur kwam uit de
  // rood-ramp van de spreukeffecten (beelden/effecten/, stap 7); die vellen gingen op 25 sep weg met
  // het oude spel, net als de spreuken zelf, en de kleur staat nu hier.
  const KLAP_KLEUR = '#ee865e';

  // Een vast toevalsgetal (0..1) uit drie gehele getallen, voor deeltjes die elk beeld op
  // dezelfde plek moeten uitkomen.
  function hasj(a, b, c) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

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
})(globalThis.Spel = globalThis.Spel || {});
