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

  const GEDIMD = 0.58;

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

    const g = werkGrondBij(S, bw, bh, zicht, inBeeld);
    ctx.drawImage(g.canvas, g.vx, g.vy);
    tekenWeides(ctx, S, vak);
    tekenRaster(ctx, S);
    tekenMarkeringen(ctx, S);
    tekenBouwSpook(ctx, S);

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
      // Een gebouw (T.isGebouw: breder of dieper dan één tegel) krijgt `gebouw` mee: alleen dan is
      // één scalair dieptegetal niet genoeg, en zoekt tekenVolgorde zijn plek (zie hieronder).
      lijst.push({ d: diepteVan(v), l: 1, punt: { x: v.x, y: v.y }, gebouw: T.isGebouw(v) ? v : undefined, f: () => tekenVoorwerp(ctx, S, v, helder) });
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
            const variant = T.akkerVariant(x, y, varianten);
            const p = T.naarScherm(x, y);
            if (stadium === 'groen' || stadium === 'rijp') {
              const frame = T.windBeeld(S.tijd, x, y);
              const achter = T.sprites.graanLaag(stadium, variant, 'achter', frame);
              const voor = T.sprites.graanLaag(stadium, variant, 'voor', frame);
              lijst.push({ d: x + y, l: 1, punt: { x, y }, f: () => T.sprites.teken(ctx, achter, p.x, p.y, 1) });
              lijst.push({ d: x + y, l: 2.5, punt: { x, y }, f: () => T.sprites.teken(ctx, voor, p.x, p.y, 1) });
            } else {
              const deel = T.sprites.graanTegel(stadium, variant);
              lijst.push({ d: x + y, l: 1, punt: { x, y }, f: () => T.sprites.teken(ctx, deel, p.x, p.y, 1) });
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
    // Doorkijk: wat de schout of een wezen bedekt, wordt zolang doorzichtig. De tijd komt uit de
    // spelklok, zodat het ook klopt als het spel even stilstaat of vooruitgespoeld wordt.
    const dt = Math.max(0, Math.min(0.1, S.tijd - (S.doorkijkTijd || 0)));
    S.doorkijkTijd = S.tijd;
    T.werkDoorkijkBij(S, dt, zichtbaar);
    // Wie aan de schandpaal staat, krijgt het halsijzer om: een eigen laag ná zijn beeld (l 2,5,
    // zoals de voorlaag van het graan), zodat de band vóór zijn nek komt.
    const aanDePaal = metSprites() && T.aanDePaal ? T.aanDePaal(S) : null;
    for (const e of w.wezens) {
      // Met sprites blijft het laatste beeld van het sterven liggen; met vlakken vervaagt het.
      if (e.dood && e.sterfTijd > 0.8 && !metSprites()) continue;
      if (e.binnen && !deurStap(S, e)) continue; // 's nachts in zijn huis (js/dag.js); net binnen: hij stapt nog de deur in
      if (!inVak(vak, e.tx, e.ty) || !T.isZichtbaar(w, e.tx, e.ty)) continue;
      lijst.push({ d: e.x + e.y, l: e.dood ? 1.5 : 2, punt: { x: e.tx, y: e.ty }, f: () => tekenWezen(ctx, S, e) });
      if (e === aanDePaal) lijst.push({ d: e.x + e.y, l: 2.5, punt: { x: e.tx, y: e.ty }, f: () => tekenHalsijzer(ctx, e) });
    }
    for (const item of tekenVolgorde(lijst)) item.f();
    ctx.restore();

    // De nacht valt over de wereld, maar niet over de zwevende teksten: die komen erna, met dezelfde
    // camera als hierboven.
    tekenNacht(ctx, S, bw, bh);
    ctx.save();
    ctx.translate(Math.round(bw / 2), Math.round(bh / 2));
    ctx.scale(S.zoom, S.zoom);
    ctx.translate(-Math.round(S.camera.x), -Math.round(S.camera.y));
    tekenEffecten(ctx, S);
    ctx.restore();
    tekenVignet(ctx, S, bw, bh);
  };

  // De nacht en de schemering (js/dag.js, T.lichtVan): een donkerblauwe laag over de wereld, lichter
  // rond de schout. Zo zie je 's nachts wat vlak bij je is, en niet wat verder weg gebeurt (Marcel,
  // 26 sep: "Omdat de camera de schout volgt, 'zie' je ook niet alles"). Rond zonsopgang en
  // zonsondergang een warme gloed. Alleen waar een kalender is (het gehucht). Spel.debug.geenNacht =
  // true zet hem uit, om te vergelijken.
  function tekenNacht(ctx, S, bw, bh) {
    if (!S.kalender || !T.lichtVan || (T.debug && T.debug.geenNacht)) return;
    const l = T.lichtVan(S.kalender.dag);
    if (l.gloed > 0.01) {
      ctx.fillStyle = `rgba(255, 150, 70, ${(0.1 * l.gloed).toFixed(3)})`;
      ctx.fillRect(0, 0, bw, bh);
    }
    if (l.donker < 0.01) return;
    // De schout op het scherm, met dezelfde omrekening als de camera in T.tekenScene; het licht
    // valt om zijn lijf, niet om zijn voeten.
    const h = S.schout;
    const p = h ? T.naarScherm(h.x, h.y) : null;
    const sx = p ? Math.round(bw / 2) + (p.x - Math.round(S.camera.x)) * S.zoom : bw / 2;
    const sy = p ? Math.round(bh / 2) + (p.y - 20 - Math.round(S.camera.y)) * S.zoom : bh / 2;
    const tegels = T.DAG_INSTELLINGEN ? T.DAG_INSTELLINGEN.lichtStraal : 5;
    const straal = Math.max(1, tegels * 32 * S.zoom);
    const verloop = ctx.createRadialGradient(sx, sy, straal * 0.25, sx, sy, straal * 1.4);
    verloop.addColorStop(0, `rgba(12, 18, 40, ${(l.donker * 0.35).toFixed(3)})`);
    verloop.addColorStop(1, `rgba(12, 18, 40, ${l.donker.toFixed(3)})`);
    ctx.fillStyle = verloop;
    ctx.fillRect(0, 0, bw, bh);
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
          const p = T.naarScherm(x, y);
          if (!sp) {
            if (!zelf) continue;
            T.ruit(ctx, p.x, p.y, 1);
            ctx.fillStyle = BUITENKLEUR.gras[(x + y) % 2];
            ctx.fill();
            continue;
          }
          const g = w.grond && w.grond[y] && w.grond[y][x];
          const oud = g && T.sprites.grondHoeken(g.vel, g.id);
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
  // dat bijna nooit; met het hele dorp op straat (js/bewoners.js) steeds. Twee gebouwen die elkaar
  // overlappen, gaan op hun som: het achterste eerst.
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
        const rij = it.punt.x - it.punt.y;
        if (rij < links || rij > rechts) continue;
        if (!it.gebouw && staatVoorGebouw(it.punt.x, it.punt.y, v)) eersteErvoor = Math.min(eersteErvoor, i);
        else laatsteErachter = i;
      }
      volgorde.splice(Math.min(laatsteErachter + 1, eersteErvoor), 0, g);
    }
    return volgorde;
  }

  // Ligt deze tegel aan de voorkant (zuid- of oostkant) van een van deze kamers?
  function isVoorrand(kamers, x, y) {
    return kamers.some(
      (k) => (y === k.y2 + 1 && x >= k.x1 - 1 && x <= k.x2 + 1) || (x === k.x2 + 1 && y >= k.y1 - 1 && y <= k.y2 + 1),
    );
  }

  // De kleuren van de grond buiten, voor als de kunst er niet is (of Spel.debug.vlakken aan
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
      const p = T.naarScherm(t.x, t.y);
      T.ruit(ctx, p.x, p.y, 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Het gebouw dat de speler in de hand heeft (S.bouwSoort, het bouwmenu in js/hud.js): zijn hele
  // voet licht op, groen als T.gebouwPast hem daar toestaat, anders rood — dezelfde twee kleuren
  // als tekenMarkeringen voor het looppad gebruikt (licht/rood hieronder).
  function tekenBouwSpook(ctx, S) {
    if (!S.bouwSoort || !S.bouwHover) return;
    // De voet van de tekening die dit gebouw echt krijgt (T.volgendeTekening, js/gebouwen.js).
    const voet = T.gebouwVoet(S.bouwSoort, T.volgendeTekening(S, S.bouwSoort));
    if (!voet) return;
    ctx.fillStyle = S.bouwHover.ok ? 'rgba(134, 196, 111, 0.45)' : 'rgba(224, 96, 79, 0.45)';
    for (let dy = 0; dy < voet.h; dy++) {
      for (let dx = 0; dx < voet.b; dx++) {
        const p = T.naarScherm(S.bouwHover.x + dx, S.bouwHover.y + dy);
        T.ruit(ctx, p.x, p.y, 0.94);
        ctx.fill();
      }
    }
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
        const p = T.naarScherm(x, y);
        T.ruit(ctx, p.x, p.y, 0.86);
        ctx.fill();
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
    const p = T.naarScherm(v.x, v.y);
    const b = v.beslaat || [1, 1];
    const vorm = BUITENVLAK[v.soort];
    if (vorm) {
      const [hex, hoog, breed] = vorm;
      if (hoog > 24) T.blok(ctx, p.x, p.y, 0.08, 0.08, hoog * 0.55, '#5a4632', { helder }); // stam
      T.blok(ctx, p.x, p.y, breed, breed, hoog * 0.6, hex, { helder, basis: hoog > 24 ? hoog * 0.45 : 0 });
      return;
    }
    // een gebouw: een blok zo groot als zijn voet, met zijn midden op het midden van die voet
    const m = T.naarScherm(v.x + (b[0] - 1) / 2, v.y + (b[1] - 1) / 2);
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
      if (hasj(x, y, zaad) < bosrandDichtheid(r)) {
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
    const gebakken = { beeld: c, sx: 0, sy: 0, b: stuk.b, h: stuk.h, ax: stuk.ax, ay: stuk.ay };
    perStap.set(stap, gebakken);
    return gebakken;
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
    const p = T.naarScherm(v.x, v.y);
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
    const p = T.naarScherm(e.x, e.y);
    T.sprites.teken(ctx, deel, p.x, p.y - T.sprites.nekHoogte(e), 1);
  }

  function tekenVoorwerp(ctx, S, v, helder) {
    const p = T.naarScherm(v.x, v.y);
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
        && T.sprites.bouwfase(v.tekeningNaam, T.bouwFaseIndex(S.kalender ? S.kalender.dag : 0, v.klaarOp, v.bouwtijd));
      const alpha = dof * (v.inAanbouw && !fase ? 0.45 : 1);
      if (alpha <= 0.02) return;
      if (alpha < 1) ctx.globalAlpha = alpha;
      const stuk = fase || (metSprites() && T.sprites.buitenAan && T.sprites.buiten(v.vel, v.id, windVoorInstantie(S, v)));
      const raster = stuk && doorkijk > 0.02 && T.DOORKIJK_INSTELLINGEN.manier === 'raster';
      if (raster) T.tekenGerasterd(ctx, stuk, p.x, p.y, helder, doorkijk);
      else if (stuk) T.sprites.teken(ctx, stuk, p.x, p.y, helder);
      else tekenBuitenVlak(ctx, v, helder);
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
      const paal = metSprites() && T.sprites.schandpaal && T.sprites.schandpaal(T.aanDePaal && T.aanDePaal(S) ? 'bezet' : 'leeg');
      if (paal) {
        T.sprites.teken(ctx, paal, p.x, p.y, helder);
        return;
      }
      // Zonder kunst: een stenen trede en een eiken paal.
      T.blok(ctx, p.x, p.y, 0.3, 0.3, 6, '#6f6a62', { helder });
      T.blok(ctx, p.x, p.y, 0.08, 0.08, 80, '#6e4a2a', { helder, basis: 6 });
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
    const p = stap ? T.naarScherm(stap.x, stap.y) : T.naarScherm(e.x, e.y);
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
    if (!e.dood && e.kant === 'monster' && (S.gevecht || e.leven < e.maxLeven)) levensbalk(ctx, cx, top - 9, e);
    if (e.alarm > 0) roep(ctx, '!', cx, top - 14 - Math.abs(Math.sin(e.alarm * 9)) * 4, '#ffd24a');
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
      const p = T.naarScherm(fx.x, fx.y);
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
