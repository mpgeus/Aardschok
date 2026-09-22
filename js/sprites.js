// De sprites: de HD-pixel art uit `beelden/` klaarzetten en per beeld het juiste plaatje
// aanwijzen. Deze laag weet niets van het spel; hij weet alleen wat er op de vellen staat.
//
// Een vel is een raster van cellen: een rij per kijkrichting (Z ZW W NW N NO O ZO), een kolom
// per beeld van de animatie. Bij elk vel hoort een anker: het punt in de cel dat op het midden
// van de tegel hoort te liggen. Alles is gerenderd in dezelfde projectie als het spel (een
// tegel is 64 bij 32), dus tekenen is niets meer dan het anker op T.naarScherm leggen.
//
// Laden gaat met Image en niets anders: geen getImageData, want dat besmet het canvas zodra
// index.html los wordt geopend (file://). De beschrijving komt uit beelden/beschrijving.js
// (een gewoon script, werkt overal) en anders uit beschrijving.json via fetch.
(function (T) {
  'use strict';

  const MAP = 'beelden/';
  const beelden = new Map(); // pad → Image
  let gegevens = null;
  let belofte = null;

  const S = {
    aan: false, // staan alle vellen van binnen klaar? Zo niet, tekent het spel zijn vlakken.
    buitenAan: false, // en die van buiten (tegels/, gemaakt door npm run tiled)
    effectenAan: false, // en de spreukeffecten (beelden/effecten/, gemaakt door effecten-export.cjs)
    mist: [], // wat er niet geladen kon worden, om in de console te zien
  };
  T.sprites = S;

  // ---------------------------------------------------------------- laden

  // `pad` is het pad vanaf index.html. De vellen van binnen staan in beelden/, die van buiten in
  // tegels/ (daar maakt npm run tiled ze, voor Tiled én voor het spel: het zijn dezelfde
  // plaatjes, in dezelfde projectie, met hetzelfde ankerpunt).
  function laadBeeld(pad) {
    return new Promise((klaar) => {
      const img = new Image();
      img.onload = () => {
        beelden.set(pad, img);
        klaar(true);
      };
      img.onerror = () => {
        S.mist.push(pad);
        klaar(false);
      };
      img.src = pad;
    });
  }

  async function haalGegevens() {
    if (T.BEELDEN) return T.BEELDEN; // beschrijving.js, ook vanaf file://
    try {
      const r = await fetch(MAP + 'beschrijving.json');
      if (r.ok) return await r.json();
    } catch (e) {
      /* file:// laat fetch niet toe; dan had beschrijving.js er moeten zijn */
    }
    return null;
  }

  S.laad = function () {
    if (belofte) return belofte;
    belofte = (async () => {
      gegevens = await haalGegevens();
      if (!gegevens) {
        S.mist.push('beschrijving');
        return false;
      }
      const vellen = [gegevens.muren.bestand, gegevens.vloeren.bestand, gegevens.voorwerpen.bestand];
      if (gegevens.trap) vellen.push(gegevens.trap.bestand);
      const lijst = vellen.map((f) => MAP + f);
      for (const f of Object.values(gegevens.figuren)) {
        for (const h of Object.values(f.houdingen)) lijst.push(MAP + 'figuren/' + h.bestand);
      }
      // De vellen van buiten staan los: gaat daar iets mis, dan tekent het spel buiten vlakken
      // en binnen nog gewoon zijn pixel art. De spreukeffecten ook: zonder die vellen tekent het
      // spel de spreuken zoals vroeger.
      const buiten = [...new Set(Object.values(T.TEGELS || {}).map((v) => v.bestand).filter(Boolean))];
      const effectVellen = T.EFFECTEN ? [...new Set(Object.values(T.EFFECTEN.vellen).map((v) => MAP + 'effecten/' + v.bestand))] : [];
      const [uitslag, uitBuiten, uitEffecten] = await Promise.all([
        Promise.all(lijst.map(laadBeeld)), Promise.all(buiten.map(laadBeeld)), Promise.all(effectVellen.map(laadBeeld)),
      ]);
      S.aan = uitslag.every(Boolean);
      S.buitenAan = buiten.length > 0 && uitBuiten.every(Boolean);
      S.effectenAan = effectVellen.length > 0 && uitEffecten.every(Boolean);
      if (S.aan) snijVloeren();
      if (!S.aan || !S.buitenAan) console.warn('Aardschok: sprites ontbreken, het spel tekent daar vlakken.', S.mist);
      return S.aan;
    })();
    return belofte;
  };

  S.gereed = () => S.laad();

  // ---------------------------------------------------------------- stukken van een vel

  // Een stuk is één cel: welk beeld, waar het staat, en waar het anker ligt.
  const stuk = (bestand, sx, sy, b, h, anker) => {
    const img = beelden.get(bestand);
    if (!img) return null;
    return { beeld: img, sx, sy, b, h, ax: anker[0], ay: anker[1] };
  };

  // Stukken die elk beeld opnieuw gevraagd worden (elke grastegel, elke boom in beeld), maar nooit
  // veranderen: één keer uitrekenen en bewaren. Anders maakt het tekenen honderden objectjes per
  // beeld die de opruimer daarna weer moet weghalen.
  const bewaard = new Map();
  function onthoud(sleutel, maak) {
    if (bewaard.has(sleutel)) return bewaard.get(sleutel);
    const s = maak();
    if (s) bewaard.set(sleutel, s);
    return s;
  }

  // Tekent een stuk met zijn anker op (px, py), afgerond op hele pixels van het vlak zelf:
  // zo blijven de pixels van de pixel art op elkaar liggen. helder onder 1 dimt (een kamer
  // waar je niet bent).
  S.teken = function (ctx, deel, px, py, helder) {
    if (!deel) return;
    const h = helder == null ? 1 : helder;
    if (h < 1) {
      ctx.save();
      ctx.filter = `brightness(${h})`;
    }
    ctx.drawImage(deel.beeld, deel.sx, deel.sy, deel.b, deel.h, Math.round(px - deel.ax), Math.round(py - deel.ay), deel.b, deel.h);
    if (h < 1) ctx.restore();
  };

  // ---------------------------------------------------------------- figuren

  // Van een stap over het raster naar een kijkrichting. Op het scherm ligt +x rechtsonder
  // (zuidoost) en +y linksonder (zuidwest), dus de namen zijn die van het beeld, niet die
  // van de plattegrond.
  const GRADEN = { ZO: 0, Z: 45, ZW: 90, W: 135, NW: 180, N: 225, NO: 270, O: 315 };
  S.richtingVan = function (dx, dy) {
    if (!dx && !dy) return 'Z';
    const g = (Math.round((Math.atan2(dy, dx) * 180) / Math.PI / 45) * 45 + 360) % 360;
    for (const [naam, graden] of Object.entries(GRADEN)) if (graden === g) return naam;
    return 'Z';
  };

  S.figuurGegevens = (naam) => (gegevens && gegevens.figuren[naam]) || null;

  // Het beeld van een figuur. `fase` loopt van 0 tot 1 door de houding heen; een houding die
  // niet herhaalt, blijft op zijn laatste beeld staan.
  S.figuur = function (naam, houding, richting, fase) {
    const f = S.figuurGegevens(naam);
    if (!f) return null;
    const h = f.houdingen[houding] || f.houdingen.staan;
    if (!h) return null;
    const cel = h.cel || f.cel;
    const rij = Math.max(0, f.richtingen.indexOf(richting));
    let beeld = Math.floor((h.herhaal ? ((fase % 1) + 1) % 1 : Math.min(0.999999, Math.max(0, fase))) * h.beelden);
    beeld = Math.max(0, Math.min(h.beelden - 1, beeld));
    return stuk(MAP + 'figuren/' + h.bestand, beeld * cel[0], rij * cel[1], cel[0], cel[1], h.anker || f.anker);
  };

  // Hoe lang een houding duurt, in seconden.
  S.houdingDuur = function (naam, houding) {
    const f = S.figuurGegevens(naam);
    const h = f && f.houdingen[houding];
    return h ? h.beelden / h.fps : 0;
  };

  S.heeftHouding = function (naam, houding) {
    const f = S.figuurGegevens(naam);
    return !!(f && f.houdingen[houding]);
  };

  // Hoe hoog een figuur boven zijn tegel uitsteekt: waar zijn hoofd zit, voor de levensbalk,
  // het uitroepteken en het aanwijzen met de muis. De cel is hoger dan de figuur (er moet een
  // zwaard in de lucht in passen), dus dit is gemeten aan het vel zelf, op de houding staan.
  const HOOG = { tovenaar: 90, wim: 66, skelet: 78, slijm: 28, wolf: 46 };
  S.figuurNaam = (soort) => (soort === 'held' ? 'tovenaar' : soort);
  S.hoogte = (soort) => HOOG[S.figuurNaam(soort)] || 60;

  // Een gewone dorpeling deelt één soort ("dorpeling", zie js/kaart.js) maar heeft meerdere
  // vellen (dorpeling0, dorpeling1, ...); zijn zaad kiest welk, zodat hetzelfde zaad altijd
  // hetzelfde uiterlijk geeft (ontwerp/wereld.md, "Een flink dorp"). Puur, dus apart te toetsen.
  S.dorpelingVariant = (zaad, aantal) => (aantal ? ((zaad % aantal) + aantal) % aantal : 0);
  // Het aantal varianten volgt uit wat er echt gerenderd is (dorpeling0, dorpeling1, ...), zodat
  // fase B er zonder codewijziging hier meer bij kan zetten.
  function dorpelingVel(zaad) {
    let n = 0;
    while (S.figuurGegevens('dorpeling' + n)) n++;
    return n ? 'dorpeling' + S.dorpelingVariant(zaad, n) : null;
  }

  // ---------------------------------------------------------------- vloeren, muren, voorwerpen

  // Een vloer is een lap van twee bij twee tegels, zodat de steen niet elke tegel herhaalt. Er
  // moet per tegel een ruit uit geknipt worden — en knippen (save, pad, clip, restore) is in een
  // browser een van de duurste dingen die je per beeld kunt doen. Dus knippen we één keer bij het
  // laden: per soort vier kant-en-klare tegels op een eigen vlakje, net zoals naar-tiled.cjs de
  // stempels van vier bij vier vooraf in losse tegels snijdt. Daarna is tekenen niets meer dan
  // drawImage.
  //
  // Het vlakje is een tikje ruimer dan 64×32 en de ruit een tikje ruimer dan een tegel: dan
  // overlappen twee buren elkaar met een halve pixel en blijft er geen haarlijn tussen staan.
  const VLOER_B = 66;
  const VLOER_H = 34;
  const VLOER_ANKER = [33, 17];
  const vloertegels = new Map(); // "soort,a,b" → stuk
  function snijVloeren() {
    if (!gegevens || typeof document === 'undefined') return;
    const v = gegevens.vloeren;
    const bron = beelden.get(MAP + v.bestand);
    if (!bron) return;
    for (const [soort, k] of Object.entries(v.soorten)) {
      for (let b = 0; b < 2; b++) {
        for (let a = 0; a < 2; a++) {
          const c = document.createElement('canvas');
          c.width = VLOER_B;
          c.height = VLOER_H;
          const cx = c.getContext('2d');
          cx.imageSmoothingEnabled = false;
          T.ruit(cx, VLOER_ANKER[0], VLOER_ANKER[1], 1.04);
          cx.clip();
          // Het anker van de lap ligt op het midden van tegel (0, 0); voor tegel (a, b) van de
          // lap schuift dat een halve ruit op, zodat het verband tussen de tegels doorloopt.
          const ax = v.anker[0] + (a - b) * T.HB;
          const ay = v.anker[1] + (a + b) * T.HH;
          cx.drawImage(bron, k * v.cel[0], 0, v.cel[0], v.cel[1], Math.round(VLOER_ANKER[0] - ax), Math.round(VLOER_ANKER[1] - ay), v.cel[0], v.cel[1]);
          vloertegels.set(`${soort},${a},${b}`, { beeld: c, sx: 0, sy: 0, b: VLOER_B, h: VLOER_H, ax: VLOER_ANKER[0], ay: VLOER_ANKER[1] });
        }
      }
    }
  }

  S.tegel = function (soort, x, y) {
    const a = ((x % 2) + 2) % 2;
    const b = ((y % 2) + 2) % 2;
    return vloertegels.get(`${soort},${a},${b}`) || null;
  };

  // ---------------------------------------------------------------- buiten (tegels/)
  //
  // De vellen die npm run tiled maakt: gras en paden, bomen en begroeiing, de gebouwen, de toren
  // en wat er op het erf staat. Ze staan in dezelfde projectie als alles hierboven, en tegels.js
  // (T.TEGELS) draagt per vel het ankerpunt: het punt in een cel dat op het midden van de tegel
  // hoort te liggen. Tekenen is dus ook hier niets meer dan het anker op T.naarScherm leggen.
  // -------------------------------------------------------------- wind
  //
  // Eén windwaarde voor de hele wereld (S.wind, T.windWaarde in js/main.js) buigt de was, de
  // boomkruinen, de struiken en het gras — zie ontwerp/beeld.md, "Eén wind door alles heen". De
  // sprites blijven stilstaande beelden: bij het laden verschuiven we een beeld in horizontale
  // plakken, boven meer dan onder, zodat een boom buigt in plaats van schuift. Dat levert een
  // handvol voorgebakken standen op (WIND_STANDEN); tekenen blijft daarna gewoon één drawImage,
  // er wordt niets per beeld uitgerekend.
  //
  // Hoeveel een soort meebeweegt (in bronpixels, aan de bovenkant van het beeld): 0 is niets
  // (een schuur, een muur, een rots), hoger buigt verder mee. Een boom een beetje, een doek
  // veel; wat hier niet in staat, staat stil.
  const WIND_GEWICHT = {
    eik: 4, herfstEik: 4, den: 3, berk: 5, wilg: 6, appelboom: 4, dodeBoom: 1,
    struik: 3, bessenStruik: 3, varen: 4, grasPol: 4, hoogGras: 5, bloemen: 4,
    waslijn: 10,
  };
  const WIND_STANDEN = 5; // een handvol standen: sterk terug .. stil .. sterk mee
  const WIND_PLAK = 4; // hoogte van een plak in bronpixels, alleen bij het bakken

  // Bakt één stand van een windend beeld: in plakken van WIND_PLAK hoog, elke plak verder opzij
  // naarmate hij hoger in het beeld staat (kwadratisch, zodat de voet stilstaat en de kruin het
  // meest buigt). Dit gebeurt alleen bij het laden, één keer per (vel, id, stand).
  function bakWindStand(bestand, sx, sy, b, h, anker, gewicht, stand) {
    const bron = beelden.get(bestand);
    if (!bron || typeof document === 'undefined') return stuk(bestand, sx, sy, b, h, anker);
    const midden = (WIND_STANDEN - 1) / 2;
    const uitslag = midden ? ((stand - midden) / midden) * gewicht : 0;
    const c = document.createElement('canvas');
    c.width = b;
    c.height = h;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    for (let y = 0; y < h; y += WIND_PLAK) {
      const ph = Math.min(WIND_PLAK, h - y);
      const t = 1 - y / h; // 1 boven aan het beeld, bijna 0 onderaan
      const dx = Math.round(uitslag * t * t);
      cx.drawImage(bron, sx, sy + y, b, ph, dx, y, b, ph);
    }
    return { beeld: c, sx: 0, sy: 0, b, h, ax: anker[0], ay: anker[1] };
  }

  // `wind`, als meegegeven, is de windwaarde voor dít voorwerp (-1..1, T.windWaarde in
  // js/main.js). Weegt de soort niets mee (of wordt geen windwaarde meegegeven), dan gewoon het
  // stilstaande beeld — precies zoals voorheen.
  S.buiten = function (velNaam, id, wind) {
    const v = T.TEGELS && T.TEGELS[velNaam];
    if (!v || !v.bestand || id == null) return null;
    const kol = v.kolommen || v.tiles.length;
    const anker = v.anker || [Math.round(v.tegelB / 2), Math.round(v.tegelH / 2)];
    const tegel = v.tiles[id];
    const gewicht = wind != null && tegel && WIND_GEWICHT[tegel.naam];
    if (!gewicht) {
      return onthoud(`buiten,${velNaam},${id}`, () => stuk(v.bestand, (id % kol) * v.tegelB, Math.floor(id / kol) * v.tegelH, v.tegelB, v.tegelH, anker));
    }
    const midden = (WIND_STANDEN - 1) / 2;
    const w = Math.max(-1, Math.min(1, wind));
    const stand = Math.max(0, Math.min(WIND_STANDEN - 1, Math.round(midden + w * midden)));
    return onthoud(`buitenwind,${velNaam},${id},${stand}`, () =>
      bakWindStand(v.bestand, (id % kol) * v.tegelB, Math.floor(id / kol) * v.tegelH, v.tegelB, v.tegelH, anker, gewicht, stand));
  };

  // Hoe hoog steekt dit ding boven zijn tegel uit? Voor het aanwijzen met de muis. Het ankerpunt
  // is de voet, dus wat erboven zit is precies het stuk cel boven het anker.
  S.buitenHoogte = function (velNaam) {
    const v = T.TEGELS && T.TEGELS[velNaam];
    if (!v) return 0;
    return (v.anker || [0, 0])[1];
  };

  // Een muurstuk. `west` is waar of niet: een westmuur kijkt naar het zuidoosten, een
  // noordmuur naar het zuidwesten. Het anker is de tegel vóór de muur.
  S.muur = function (soort, west) {
    if (!gegevens) return null;
    const m = gegevens.muren;
    const k = m.kolommen.indexOf(soort);
    const r = m.rijen.indexOf(soort === 'laag' ? 'laag' : west ? 'west' : 'noord');
    if (r < 0) return null;
    const kol = soort === 'laag' ? 0 : k;
    if (kol < 0) return null;
    return stuk(MAP + m.bestand, kol * m.cel[0], r * m.cel[1], m.cel[0], m.cel[1], m.anker);
  };

  S.muurSoorten = () => (gegevens ? gegevens.muren.kolommen : []);
  S.laagHoogte = () => (gegevens ? gegevens.muren.laagHoogte : 22);

  S.voorwerp = function (naam) {
    if (!gegevens) return null;
    const v = gegevens.voorwerpen;
    const i = v.namen.indexOf(naam);
    if (i < 0) return null;
    return stuk(MAP + v.bestand, i * v.cel[0], 0, v.cel[0], v.cel[1], v.anker);
  };

  // De spiraaltrap: een rij per soort (`trap` omhoog, `trapgat` in de vloer), een kolom per
  // staat (ingestort, provisorisch, hersteld). Het anker is de tegel waar het voorwerp op staat;
  // de trap zelf beslaat drie bij drie tegels en reikt vanaf die tegel naar achteren.
  S.trap = function (soort, staat) {
    if (!gegevens || !gegevens.trap) return null;
    const t = gegevens.trap;
    const r = t.soorten.indexOf(soort);
    const k = t.staten.indexOf(staat || 'hersteld');
    if (r < 0 || k < 0) return null;
    return stuk(MAP + t.bestand, k * t.cel[0], r * t.cel[1], t.cel[0], t.cel[1], t.anker);
  };

  // ---------------------------------------------------------------- spreukeffecten
  //
  // De vellen uit beelden/effecten/ (effecten-export.cjs): een rij per variant (een richting, een
  // maat, gespiegeld), een kolom per beeld. T.EFFECTEN (beelden/effecten/effecten.js) beschrijft
  // ze, en weet ook waar op een figuur de bol van zijn staf en zijn gezicht zitten: gemeten op de
  // vellen van de figuren zelf, per richting en per beeld.
  const effecten = () => T.EFFECTEN || null;

  S.effectVel = (naam) => (effecten() && effecten().vellen[naam]) || null;
  S.effectRamp = (naam) => (effecten() && effecten().rampen[naam]) || null;

  // Eén cel van een effect. Een vel kan per rij een eigen anker hebben (gespiegeld).
  S.effect = function (naam, beeld, rij) {
    const v = S.effectVel(naam);
    if (!v) return null;
    const r = rij || 0;
    const k = Math.max(0, Math.min(v.beelden - 1, beeld | 0));
    const anker = (v.ankers && v.ankers[r]) || v.anker;
    return onthoud(`effect,${naam},${r},${k}`, () => stuk(MAP + 'effecten/' + v.bestand, k * v.cel[0], r * v.cel[1], v.cel[0], v.cel[1], anker));
  };

  // Waar zit de bol op de staf van dit wezen, nu, in het beeld dat net getekend is? [dx, dy]
  // vanaf zijn voeten, of null (geen staf, of nog niet getekend). Een houding waarin de bol niet
  // gemeten is (lopen, slaan), valt terug op staan.
  S.bron = function (e) {
    const l = e.beeldStand && e.beeldStand.laatste;
    const b = l && effecten() && effecten().bronnen[l.naam];
    if (!b) return null;
    const meting = b[l.houding] ? b[l.houding][l.richting] : b.staan && b.staan[l.richting];
    if (!meting) return null;
    return meting[b[l.houding] ? Math.min(meting.length - 1, l.beeld) : 0] || meting.find(Boolean) || null;
  };

  // Waar zit zijn gezicht, in de richting waarin hij nu kijkt? [dx, dy] vanaf zijn voeten, of null.
  S.hoofd = function (e) {
    const h = effecten() && effecten().hoofden[S.figuurNaam(e.soort)];
    const richting = e.beeldStand ? e.beeldStand.richting : 'Z';
    return (h && h[richting]) || null;
  };

  // ---------------------------------------------------------------- de houding van een wezen

  // Wat doet dit wezen nu? Alles komt uit de spelstaat zelf, zodat er geen tweede boekhouding
  // ontstaat die uit de pas kan lopen: `dood` en `sterfTijd` zijn sterven, `flits` is net
  // geraakt, `uitval` is uithalen, `tovert` is toveren (de worp, T.worp in js/toveren.js), en
  // een pad betekent lopen.
  //
  // Wat wél wordt onthouden, staat in `e.beeldStand`: hoe ver de voeten gelopen hebben (zodat
  // de pas niet glijdt), welke klap of spreuk nog aan het spelen is, en het laatst getekende
  // beeld (voor de bol op de staf, zie S.bron).
  function stand(e) {
    if (!e.beeldStand) {
      e.beeldStand = { afgelegd: 0, x: e.x, y: e.y, richting: 'Z', eenmalig: null, tot: 0, begin: 0, flits: 0, laatste: null };
    }
    return e.beeldStand;
  }

  // Een spreuk die net bij dit wezen vertrekt zonder worp (een scène die meteen een schicht laat
  // vliegen): de vlucht in de spelstaat die op zijn tegel begint en nog maar net onderweg is.
  function nieuweVlucht(spel, e, st) {
    for (const fx of spel.effecten || []) {
      if ((fx.soort !== 'schicht' && fx.soort !== 'wind') || fx.t > 0.25 || fx === st.vlucht) continue;
      if (fx.van.x === e.tx && fx.van.y === e.ty) {
        st.vlucht = fx;
        return fx;
      }
    }
    return null;
  }

  // De tovenaar loopt naar zijn leeftijd: kwiek op zijn 84e, schuifelend op zijn 99e.
  function loopHouding(naam, e) {
    if (!S.heeftHouding(naam, 'lopen') && e.leeftijd != null) {
      const j = T.jaren(e.leeftijd);
      return j >= 96 ? 'lopen-99' : j >= 88 ? 'lopen-92' : 'lopen-84';
    }
    return 'lopen';
  }

  // De houding van dit wezen op dit moment: { naam, houding, richting, fase }.
  // `naam` is het figuur op het vel; de held heet daar tovenaar, een gewone dorpeling zijn zaad.
  S.houding = function (spel, e) {
    const naam = e.soort === 'dorpeling' ? dorpelingVel(e.zaad || 0) : S.figuurNaam(e.soort);
    const f = S.figuurGegevens(naam);
    if (!f) return null;
    const st = stand(e);
    const dx = e.x - st.x;
    const dy = e.y - st.y;
    st.afgelegd += Math.hypot(dx, dy);
    st.x = e.x;
    st.y = e.y;

    // Kijkrichting: onderweg naar de volgende tegel kijken, anders blijven staan zoals je stond.
    if (e.pad && e.pad.length) st.richting = S.richtingVan(e.pad[0].x - e.x, e.pad[0].y - e.y);
    else if (dx || dy) st.richting = S.richtingVan(dx, dy);
    if (e.uitval) st.richting = S.richtingVan(e.uitval.doel.x - e.x, e.uitval.doel.y - e.y);

    // Eenmalige houdingen: uithalen, toveren, geraakt worden. Ze worden vastgehouden tot ze
    // zijn afgelopen, ook als het spel intussen alweer verder is. `begin`: wanneer het in de
    // spelstaat begon, als dat bekend is (een worp) — dan klopt het beeld ook als er een tijd
    // niet getekend werd.
    const zet = (houding, begin) => {
      const duur = S.houdingDuur(naam, houding);
      if (!duur) return;
      st.eenmalig = houding;
      st.begin = begin == null ? spel.tijd : Math.min(spel.tijd, begin);
      st.tot = st.begin + duur;
    };
    if (e.uitval) {
      if (st.uitval !== e.uitval) {
        st.uitval = e.uitval;
        zet(S.heeftHouding(naam, 'slaan') ? 'slaan' : 'aanval');
      }
    } else st.uitval = null;
    // Toveren: de worp zet `tovert` op de tovenaar. Hij draait naar zijn doel en heft de staf;
    // de bol vlamt op (beeld 3 van de houding) precies als de spreuk loskomt. Wie tovert zonder
    // worp, heft zijn staf op het moment dat de spreuk bij hem vertrekt.
    if (e.tovert) {
      if (st.tovert !== e.tovert) {
        st.tovert = e.tovert;
        zet('spreuk', e.tovert.begin);
      }
      const doel = e.tovert.doel;
      if (doel && spel.tijd < e.tovert.begin + 0.6 && (doel.x !== e.x || doel.y !== e.y)) st.richting = S.richtingVan(doel.x - e.x, doel.y - e.y);
    } else {
      st.tovert = null;
      const vlucht = !e.dood && S.heeftHouding(naam, 'spreuk') ? nieuweVlucht(spel, e, st) : null;
      if (vlucht) {
        zet('spreuk', spel.tijd - Math.max(0, vlucht.t));
        if (vlucht.naar.x !== e.x || vlucht.naar.y !== e.y) st.richting = S.richtingVan(vlucht.naar.x - e.x, vlucht.naar.y - e.y);
      }
    }
    // flits springt bij een klap naar 0,3 en telt daarna af: gaat hij omhoog, dan is het een
    // nieuwe klap. (Vergelijken met een optelsom van tijd en flits gaat mis op de laatste bit.)
    if (e.flits > (st.flits || 0) && !e.dood) zet('geraakt');
    st.flits = e.flits;

    if (e.dood) {
      const duur = S.houdingDuur(naam, 'sterven') || 0.8;
      return { naam, houding: 'sterven', richting: st.richting, fase: Math.min(1, e.sterfTijd / duur) };
    }
    if (st.eenmalig && spel.tijd < st.tot) {
      const duur = S.houdingDuur(naam, st.eenmalig);
      return { naam, houding: st.eenmalig, richting: st.richting, fase: (spel.tijd - st.begin) / duur };
    }
    st.eenmalig = null;
    if (e.pad && e.pad.length) {
      const houding = loopHouding(naam, e);
      const h = f.houdingen[houding];
      // Twee passen per cyclus: zo schuift de voet op de grond precies mee met het spel en
      // glijdt hij niet. `stap` staat in het vel beschreven, in tegels per pas.
      const cyclus = 2 * ((h && h.stap) || 0.8);
      return { naam, houding, richting: st.richting, fase: (st.afgelegd / cyclus) % 1 };
    }
    // Stilstaan: ademen, elk wezen in zijn eigen tempo (e.fase). Wim veegt ondertussen, en in een
    // gesprek praat hij. In een scène (js/regie.js) praat hij als hij aan het woord is, en staat
    // hij anders stil: niemand veegt terwijl zijn meester sterft.
    const wimRust = () => {
      if (spel.spreektMet === e) return 'praten'; // in een gesprek of een scène (S.spreektMet)
      return spel.modus === 'regie' ? 'staan' : 'vegen';
    };
    const rust = naam === 'wim' ? wimRust() : 'staan';
    const staan = f.houdingen[rust] ? rust : f.houdingen.staan ? 'staan' : Object.keys(f.houdingen)[0];
    const duur = S.houdingDuur(naam, staan) || 1;
    return { naam, houding: staan, richting: st.richting, fase: ((spel.tijd + e.fase) / duur) % 1 };
  };

  // Het beeld dat bij die houding hoort, in één stap. Welk beeld het werd, onthoudt het wezen
  // (beeldStand.laatste): de bol op de staf zit in elk beeld ergens anders.
  S.wezen = function (spel, e) {
    const h = S.houding(spel, e);
    if (!h) return null;
    const f = S.figuurGegevens(h.naam);
    const hd = f && (f.houdingen[h.houding] || f.houdingen.staan);
    const fase = hd && hd.herhaal ? ((h.fase % 1) + 1) % 1 : Math.min(0.999999, Math.max(0, h.fase));
    const l = e.beeldStand.laatste || (e.beeldStand.laatste = {});
    l.naam = h.naam;
    l.houding = h.houding;
    l.richting = h.richting;
    l.beeld = hd ? Math.floor(fase * hd.beelden) : 0;
    return S.figuur(h.naam, h.houding, h.richting, h.fase);
  };
})(globalThis.Toren = globalThis.Toren || {});
