// Het beeld. Eerst de grond, dan de markeringen daarop, dan voorwerpen en wezens van achter naar voor, en als laatste
// de effecten. (Tot 23 okt ook de kamers van de proefkamers, met hun muren en deuren, gedimd waar je niet was; ronde 4
// van het snoeien.)
//
// Er zijn twee manieren van tekenen. Staat de pixel art klaar (`beelden/`, zie js/sprites.js),
// dan komt alles wat de kunst dekt uit de vellen: de grond, voorwerpen, wezens,
// en de flits van een klap (zie "een laag over een figuur" onderaan). Wat er niet in zit — het
// raster, het bereik en de zwevende teksten — blijft
// getekend met vlakken. Met `Spel.debug.vlakken = true` gaat alles terug naar vlakken, om te
// vergelijken.
(function (T) {
  'use strict';

  // Wat ui is op het doek (de tegel onder de muis, de levensbalken, de zwevende tekst), staat er niet in de fotomodus
  // (js/main.js) en niet in een scène (js/regie.js).
  const zonderUi = (S) => !!(S.foto || S.regie);

  // De hoogte van het land (werklijst vraag 121, js/hoogte.js): wat op de grond staat, komt op het scherm met de hoogte
  // van de grond eraf. kaartNu is de kaart die getekend wordt (T.tekenScene zet hem); zonder hoogte is opGrond precies
  // T.naarScherm, dus een vlakke kaart tekent pixel voor pixel als vroeger.
  let kaartNu = null;
  let zoomNu = 1; // voor wat ver uitgezoomd grover mag (het graan op een helling)
  const opGrond = (x, y) => T.naarSchermOp(kaartNu, x, y);
  // en de grond zelf, ook onder een brug (de grondtegels, het water)
  const opMaaiveld = (x, y) => T.naarSchermGrond(kaartNu, x, y);
  // De plek van een voorwerp met een tekening, onthouden op het voorwerp (T.sprites.onthouden, vraag 178, A2): het staat
  // stil, en elk beeld vragen duizenden bomen hem twee keer (de schaduw en het plaatje). Opnieuw als het voorwerp ergens
  // anders staat (onthoudVoorwerp), op een andere kaart, of als de hoogte een nieuwe versie kreeg (T.egaliseer).
  function plekVan(v) {
    if (!v.vel) return opGrond(v.x, v.y);
    const o = T.sprites.onthouden(v);
    const versie = kaartNu && kaartNu.hoogte ? kaartNu.hoogte.versie || 0 : -1;
    if (o.grond && o.grondKaart === kaartNu && o.grondVersie === versie) return o.grond;
    o.grond = opGrond(v.x, v.y);
    o.grondKaart = kaartNu;
    o.grondVersie = versie;
    return o.grond;
  }

  // Hoe het beeld getekend wordt (werklijst vraag 123). `tussenbuffer`: op een groot scherm tekent het spel op de
  // grootste hele deling van het scherm die nog minstens zo groot is, en vergroot de browser het (formaat in
  // js/main.js); op 4K is dat 1920 bij 1080 maal twee.
  // `videokaart`: tekenen met WebGL (js/gl.js), of met het 2D-doek van de browser; de spelregel "Tekenen".
  // De rest is van de speler, onder Settings (vraag 172b; js/instellingen.js, de opties in js/opties.js): het venster in
  // Electron (`venster` 'vol' of 'venster', met `vensterMaat`), hoeveel beelden per seconde (0 is zo snel als het scherm;
  // de spellus in js/main.js), de meter (F2), en de helderheid van de wereld (een filter op het doek, js/main.js).
  T.TEKENEN_INSTELLINGEN = {
    tussenbuffer: { b: 1920, h: 1080 },
    videokaart: true,
    ookOpDeProcessor: false, // alleen voor de proeven zonder videokaart (js/gl.js)
    venster: 'vol',
    vensterMaat: [1600, 900],
    beeldenPerSeconde: 0,
    meter: false,
    helderheid: 1,
    // Een proef (werklijst R, vraag 183, 2a1; Marcel, 20 okt: "ik twijfel of de huizen 'te groot' zijn"): zo groot tekent
    // het spel een gebouw, rond het midden van zijn voet; 1 is de tekening. Alleen voor het oog: de voet, de deur en het
    // looppad blijven. Het debugvenster (D) wisselt 1, 0,8 en 0,65. Gaat eruit als Marcel gekozen heeft.
    gebouwMaat: 1,
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
      kaars: { r: 255, g: 158, b: 76 },
      drager: { r: 255, g: 196, b: 120 },
      brand: { r: 255, g: 128, b: 48 },
      kampvuur: { r: 255, g: 150, b: 64 }, // vraag 175: zonder kleur was het wit
    },
    // Een vlam flakkert: zoveel van zijn sterkte op en neer, zo snel; een raam half zo veel.
    flakkeren: 0.14,
    flakkerSnelheid: 1,
    // De schaduwen van de zon (vraag 125, B; de spelregel "Schaduwen"): hoe donker, en de kleur ervan.
    zonneschaduw: true,
    schaduw: { sterkte: 0.42, r: 18, g: 22, b: 44 },
  };

  const metSprites = () => !!(T.sprites && T.sprites.aan) && !(T.debug && T.debug.vlakken);
  T.metSprites = metSprites; // ook voor js/doorkijk.js

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

  // Hoort voorwerp v in de tekenlijst (vraag 178, A1)? Niet als het in het zwart staat (wat mistOverLijst toch weggooit:
  // de tegel die het dorp niet kent, van een gebouw het midden), en niet als zijn beeld met zijn schaduw rechthoek r niet
  // raakt: zijn cel op het vel (T.sprites.celVan; niet de doos van de doorkijk, die is krapper), de schaduw zo ver als de
  // cel hoog is (zoals js/gl.js hem legt), met de hoogte van het vak en een rand voor de wind en een brug. Het vak is een
  // rechthoek in tegels om het schuine beeld: ver uitgezoomd lagen er 14.564 dingen in, 4.815 buiten beeld en 6.710 in
  // het zwart, en die kregen allemaal eerst het werk voor de lijst. Zonder cel (geen tekening), in aanbouw of brandend
  // (een ander plaatje) telt het altijd.
  const TEL_RAND = 48;
  function voorwerpTelt(S, w, r, vak) {
    const D = metMist(w) ? S.dorp : null;
    const hb = T.hoogteIn(w, vak.x0, vak.y0, vak.x1, vak.y1);
    // hoe ver een schaduw reikt per pixel hoogte, zoals tekenZonneschaduw hem legt
    let sx = 0;
    let sy = 0;
    const L = T.LICHT_INSTELLINGEN;
    if (L.zonneschaduw && S.kalender) {
      const z = T.zonStand(S.kalender.dag);
      if (z.sterkte > 0.01) {
        sx = Math.abs(((z.x - z.y) / Math.SQRT2) * z.lengte);
        sy = Math.abs(((z.x + z.y) / (2 * Math.SQRT2)) * z.lengte);
      }
    }
    const sprites = metSprites();
    return (v) => {
      if (D) {
        const p = T.isGebouw(v) ? { x: Math.round(v.x + (v.beslaat[0] - 1) / 2), y: Math.round(v.y + (v.beslaat[1] - 1) / 2) } : v;
        if (!T.kentTegel(D, p.x, p.y)) return false;
      }
      if (!sprites || !v.vel || v.inAanbouw || v.brand) return true;
      const t = T.sprites.tekeningVan(v);
      const plek = T.sprites.celVan(t.vel, t.id);
      if (!plek) return true;
      const [ax, ay] = plek.anker;
      const h = plek.cel[3];
      const p = T.naarScherm(v.x, v.y);
      const ex = sx * h + TEL_RAND;
      const ey = sy * h + TEL_RAND;
      return p.x - ax + plek.cel[2] + ex >= r.x0 && p.x - ax - ex <= r.x1 && p.y - hb.laag - ay + h + ey >= r.y0 && p.y - hb.hoog - ay - ey <= r.y1;
    };
  }

  // ---------------------------------------------------------------- de vaste rijen (vraag 178, B1 en B2)
  //
  // Ver uitgezoomd ging zo'n 80% van de tijd van de processor naar de bomen en het groen (18 okt gemeten op 35%: 7,1 ms per
  // beeld, en zonder hen 1,5): elk beeld elk ding in de lijst, uitzoeken of het telt, sorteren, en per ding een plaatje.
  // Met de videokaart staan ze nu per stuk land (T.STUK bij T.STUK tegels) één keer op de kaart, een vaste rij (js/gl.js,
  // tekenVast), en per beeld is het één opdracht per stuk. Wat per beeld anders is, beslist de kaart zelf (Marcel, 18 okt:
  // "Misschien zoveel mogelijk offloaden naar gpu"): de stand in de wind (de stand per fase van windVoorInstantie, 97
  // getallen per beeld), of een tegel zwart, grijs of helder is in de mist (vasteMist: een getal per tegel), de schaduw
  // (dezelfde rij, scheef) en wat ervoor staat: een dieptebuffer (B1), met als diepte de sleutel van het sorteren
  // (diepteVanItem): de som x + y, en bij een gelijke som de volgorde waarin T.voorwerpenIn ze gaf (het stuk, en daarin de
  // rij). De kunst heeft alleen helemaal dichte of doorzichtige pixels (gemeten 17 okt), dus de kaart kan het per pixel
  // beslissen. Wat los blijft (de mensen, de gebouwen, de akkers, wat niet van het eiland is), sorteert zoals altijd en
  // toetst tegen die diepte, zonder hem te schrijven: onderling houdt het de volgorde van de lijst.
  // Een boom blijft in de lijst als hij een gebouw kan raken (tekenVolgorde zoekt de plek van een gebouw tussen wat ermee
  // overlapt, en dat is geen getal), als zijn tekening niet op de stapel van js/gl.js past, en zolang iemand door hem
  // heen kijkt (v.doorkijk: dan valt hij uit zijn rij, vasteMist). Zonder videokaart blijft alles in de lijst.
  const DIEPTE_STAP = 0.3; // wat op dezelfde som vóór of na de bomen komt (diepteVanItem)
  const DIEPTE_STUK = 0.2; // de volgorde van de stukken en hun rijen bij een gelijke som, samen minder dan dit
  const VAST_PER = 8; // per boom: zijn anker (pixels vanaf het stuk), zijn tegel in het stuk, zijn tekening, zijn fase
  const WIND_FASEN = 97; // zoals windVoorInstantie
  const STANDEN = 5; // de standen in de wind (js/sprites.js)
  const GEBOUW_RAND = 16; // pixels om wat een gebouw beslaat
  const vasteKaarten = new WeakMap(); // kaart → de vaste rijen (vastVan)
  let vastLaatst = null; // van de kaart van het vorige beeld: een andere kaart, en die van deze gaan van de kaart
  let vastWerk = new Float32Array(VAST_PER * 64 * 64); // een rij terwijl hij gemaakt wordt

  function vastVan(w) {
    let V = vasteKaarten.get(w);
    if (!V) {
      V = {
        tabel: { nummers: new Map(), data: new Float32Array(STANDEN * 8 * 64), n: 0, doos: [], maxDoos: [0, 0, 0, 0], vies: false },
        stukken: new Map(), metDoorkijk: new Set(), basis: null, perTegel: null, wind: new Float32Array(100), kaart: T.kaartVersie(w),
      };
      vasteKaarten.set(w, V);
    }
    if (vastLaatst && vastLaatst !== V) {
      for (const e of vastLaatst.stukken.values()) T.gl.weg(e.rij);
      vastLaatst.stukken.clear();
    }
    vastLaatst = V;
    return V;
  }
  // Een stuk als doek van zijn eigen maat met versie 1, zodat het op de stapel van js/gl.js kan: een stand in de wind is
  // dat al; wat stilstaat, is een stuk van een vel, en een vel is te groot.
  function losBeeld(stuk) {
    const c = stuk.beeld;
    if (c.versie === 1 && !stuk.sx && !stuk.sy && c.width === stuk.b && c.height === stuk.h) return c;
    if (!stuk.los) {
      const l = document.createElement('canvas');
      l.width = stuk.b;
      l.height = stuk.h;
      l.getContext('2d').drawImage(c, stuk.sx, stuk.sy, stuk.b, stuk.h, 0, 0, stuk.b, stuk.h);
      l.versie = 1;
      stuk.los = l;
    }
    return stuk.los;
  }
  // Het nummer van de tekening van voorwerp v in de tabel (VERT_VAST in js/gl.js), -1 als hij niet vast kan (een stand
  // past niet op de stapel), of -2 als het nog niet kan (zijn vel laadt nog). Per stand in de wind acht getallen: zijn plek
  // op de stapel (u0, v0, u1, v1), zijn laag en zijn anker; zonder wind vijf keer wat stilstaat, zoals T.sprites.buitenVan.
  // tabel.doos: per tekening hoe ver hij links, boven, rechts en onder zijn anker reikt, in een van zijn standen.
  function tekeningNr(V, v) {
    const o = T.sprites.onthouden(v);
    const sleutel = o.t.vel + ',' + o.t.id;
    const tab = V.tabel;
    const al = tab.nummers.get(sleutel);
    if (al !== undefined) return al;
    const midden = (STANDEN - 1) / 2;
    const standen = [];
    for (let k = 0; k < STANDEN; k++) {
      const stuk = o.wind ? T.sprites.buiten(o.t.vel, o.t.id, (k - midden) / midden) : T.sprites.buiten(o.t.vel, o.t.id);
      if (!stuk) return -2;
      standen.push(stuk);
    }
    const plekken = standen.map((stuk) => T.gl.opDeStapel(losBeeld(stuk)));
    if (plekken.some((q) => !q)) {
      tab.nummers.set(sleutel, -1);
      return -1;
    }
    const nr = tab.n++;
    if (tab.data.length < tab.n * STANDEN * 8) {
      const d = new Float32Array(tab.data.length * 2);
      d.set(tab.data);
      tab.data = d;
    }
    const doos = [-Infinity, -Infinity, -Infinity, -Infinity];
    standen.forEach((stuk, k) => {
      const q = plekken[k];
      tab.data.set([q.x / q.maat, q.y / q.maat, (q.x + stuk.b) / q.maat, (q.y + stuk.h) / q.maat, q.laag, stuk.ax, stuk.ay, 0], (nr * STANDEN + k) * 8);
      [stuk.ax, stuk.ay, stuk.b - stuk.ax, stuk.h - stuk.ay].forEach((a, i) => (doos[i] = Math.max(doos[i], a)));
    });
    tab.doos[nr] = doos;
    doos.forEach((a, i) => (tab.maxDoos[i] = Math.max(tab.maxDoos[i], a)));
    tab.nummers.set(sleutel, nr);
    tab.vies = true;
    return nr;
  }
  // Mag voorwerp v in een vaste rij? Iets van het eiland met een tekening, dat niet anders getekend wordt dan als zijn
  // plaatje (geen gebouw, geen eigen bestand per tekening).
  function magVast(w, v) {
    if (!v.natuur || !v.vel || v.inAanbouw || v.brand || T.isGebouw(v)) return false;
    const vel = T.TEGELS && T.TEGELS[v.vel];
    return !!vel && !vel.perTekening && v.vel !== 'huizen' && T.isZichtbaar(w, v.x, v.y);
  }
  const raaktVak = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  // Wat een gebouw op het scherm kan beslaan (pixels van de vlakte, [x0, y0, x1, y1]): zijn tekening (T.sprites.doosVan) en
  // zijn voet, met een rand.
  function gebouwVak(v) {
    const p = plekVan(v);
    const b = v.beslaat || [1, 1];
    const til = p.y - T.naarScherm(v.x, v.y).y; // de hoogte van het land, op het scherm
    const links = T.naarScherm(v.x, v.y + b[1] - 1).x - 32;
    const rechts = T.naarScherm(v.x + b[0] - 1, v.y).x + 32;
    const onder = T.naarScherm(v.x + b[0] - 1, v.y + b[1] - 1).y + til + 16;
    const d = v.vel ? T.sprites.doosVan(v) : null;
    const R = GEBOUW_RAND;
    if (!d) return [links - R, p.y - 400 - R, rechts + R, onder + R];
    return [Math.min(links, p.x - d[0]) - R, Math.min(p.y - 16, p.y - d[1]) - R, Math.max(rechts, p.x + d[2]) + R, Math.max(onder, p.y + d[3]) + R];
  }
  // Een getal voor de gebouwen die vak r raken: is het anders, dan moet het stuk opnieuw.
  function gebouwSleutel(gebouwen, r) {
    let h = 0;
    for (const g of gebouwen) if (raaktVak(g, r)) for (let i = 0; i < 4; i++) h = (Math.imul(h, 31) + Math.round(g[i])) | 0;
    return h;
  }
  // De vaste rij van stuk s (T.stukOpen): wat erin kan, in de volgorde van de lijst (rij na rij), en wat in de lijst blijft
  // (dyn, ook rij na rij). Een boom die een gebouw kan raken, blijft in de lijst.
  function bouwStuk(V, w, s, gebouwen, sleutel) {
    const Z = T.STUK;
    const ref = T.naarScherm(s.x0, s.y0);
    const soort = new Int32Array(Z * Z); // 0 niets, -1 de lijst, anders 1 + het nummer van zijn tekening
    const plek = new Float64Array(Z * Z * 2);
    const vak = [Infinity, Infinity, -Infinity, -Infinity];
    let laadt = false;
    for (let i = 0; i < Z * Z; i++) {
      const v = s.op[i];
      if (!v || isGebakken(w, v)) continue;
      const nr = magVast(w, v) ? tekeningNr(V, v) : -1;
      if (nr === -2) laadt = true;
      if (nr < 0) {
        soort[i] = -1;
        continue;
      }
      const p = plekVan(v);
      const ax = Math.round(p.x);
      const ay = Math.round(p.y);
      const d = V.tabel.doos[nr];
      vak[0] = Math.min(vak[0], ax - d[0]);
      vak[1] = Math.min(vak[1], ay - d[1]);
      vak[2] = Math.max(vak[2], ax + d[2]);
      vak[3] = Math.max(vak[3], ay + d[3]);
      soort[i] = nr + 1;
      plek[2 * i] = ax;
      plek[2 * i + 1] = ay;
    }
    const dichtbij = gebouwen.filter((g) => raaktVak(g, vak));
    const vlag = new Uint8Array(Z * Z);
    const dyn = [];
    let n = 0;
    for (let i = 0; i < Z * Z; i++) {
      if (!soort[i]) continue;
      const v = s.op[i];
      if (soort[i] > 0) {
        const nr = soort[i] - 1;
        const d = V.tabel.doos[nr];
        const ax = plek[2 * i];
        const ay = plek[2 * i + 1];
        if (!dichtbij.length || !dichtbij.some((g) => raaktVak(g, [ax - d[0], ay - d[1], ax + d[2], ay + d[3]]))) {
          const j = n * VAST_PER;
          vastWerk[j] = ax - ref.x;
          vastWerk[j + 1] = ay - ref.y;
          vastWerk[j + 2] = v.x - s.x0;
          vastWerk[j + 3] = v.y - s.y0;
          vastWerk[j + 4] = nr;
          vastWerk[j + 5] = (v.x * 137 + v.y * 251) % WIND_FASEN;
          n++;
          vlag[i] = 1;
          continue;
        }
      }
      dyn.push(v);
    }
    return {
      s, ref, vlag, dyn, n, rij: T.gl.vasteRij(vastWerk, n), vak, gebouwen: gebouwSleutel(gebouwen, vak), sleutel,
      geladen: T.sprites.geladenNr(), laadt, vies: false,
    };
  }
  // Is v een boom in een vaste rij?
  function isVast(V, v) {
    const Z = T.STUK;
    const e = V.stukken.get(T.stukVan(v.x, v.y));
    const i = (v.y - (e ? e.s.y0 : 0)) * Z + v.x - (e ? e.s.x0 : 0);
    return !!e && e.vlag[i] === 1 && e.s.op[i] === v;
  }
  // De bomen van de vaste rijen die iemand met doos `doos` (js/doorkijk.js) kunnen bedekken: wiens tekening hem raakt,
  // met de hoogte van het land erbij.
  function bomenBij(V, w, doos, hb, uit) {
    const m = V.tabel.maxDoos;
    const Z = T.STUK;
    const hoeken = [[doos.x0 - m[2], doos.y0 - m[3]], [doos.x1 + m[0], doos.y0 - m[3]], [doos.x0 - m[2], doos.y1 + m[1] + hb], [doos.x1 + m[0], doos.y1 + m[1] + hb]];
    let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const [sx, sy] of hoeken) {
      const t = T.naarWereld(sx, sy);
      x0 = Math.min(x0, t.x);
      x1 = Math.max(x1, t.x);
      y0 = Math.min(y0, t.y);
      y1 = Math.max(y1, t.y);
    }
    for (let y = Math.max(0, Math.floor(y0) - 1); y <= Math.ceil(y1) + 1; y++) {
      for (let x = Math.max(0, Math.floor(x0) - 1); x <= Math.ceil(x1) + 1; x++) {
        const e = V.stukken.get(T.stukVan(x, y));
        if (!e) continue;
        const i = (y - e.s.y0) * Z + x - e.s.x0;
        if (e.vlag[i]) uit.add(e.s.op[i]);
      }
    }
  }
  // De mist per tegel voor de vaste rijen (VERT_VAST in js/gl.js): 0 tekent niet (wat het dorp niet kent, buiten het vak,
  // en wie nu door de lijst gaat: `weg`), 128 in het grijs (gekend, maar niemand kijkt nu), 255 helder; zoals voorwerpTelt
  // en mistOverLijst het per ding beslissen. Wat het dorp kent, alleen opnieuw als het vak verschoof of er land bij kwam,
  // zoals mistMasker; wie er nu kijkt (T.wieKijken), elk beeld.
  function vasteMist(V, S, w, vak, weg) {
    const D = S.dorp;
    const mist = metMist(w);
    const x0 = Math.floor(vak.x0 / MIST_STAP) * MIST_STAP;
    const y0 = Math.floor(vak.y0 / MIST_STAP) * MIST_STAP;
    const b = Math.ceil((vak.x1 + 1) / MIST_STAP) * MIST_STAP - x0;
    const h = Math.ceil((vak.y1 + 1) / MIST_STAP) * MIST_STAP - y0;
    const sleutel = [x0, y0, b, h, mist ? T.mistVersie(D) : -1].join('|');
    let B = V.basis;
    if (!B || B.sleutel !== sleutel) {
      const data = new Uint8Array(b * h);
      for (let j = 0; j < h; j++) for (let i = 0; i < b; i++) data[j * b + i] = !mist ? 255 : T.kentTegel(D, x0 + i, y0 + j) ? 128 : 0;
      B = V.basis = { sleutel, data };
      V.perTegel = new Uint8Array(b * h);
    }
    const t = V.perTegel;
    t.set(B.data);
    // buiten het vak niets, zoals T.voorwerpenIn
    for (let j = 0; j < h; j++) {
      const y = y0 + j;
      if (y < vak.y0 || y > vak.y1) t.fill(0, j * b, (j + 1) * b);
      else {
        if (vak.x0 > x0) t.fill(0, j * b, j * b + vak.x0 - x0);
        if (vak.x1 < x0 + b - 1) t.fill(0, j * b + vak.x1 + 1 - x0, (j + 1) * b);
      }
    }
    if (mist) {
      for (const z of T.wieKijken(D)) {
        const cx = Math.round(z.x);
        const cy = Math.round(z.y);
        const R = Math.floor(z.r);
        for (let dy = -R; dy <= R; dy++) {
          const j = cy + dy - y0;
          if (j < 0 || j >= h) continue;
          for (let dx = -R; dx <= R; dx++) {
            const i = cx + dx - x0;
            if (i < 0 || i >= b || dx * dx + dy * dy > z.r * z.r) continue;
            if (t[j * b + i]) t[j * b + i] = 255;
          }
        }
      }
    }
    for (const v of weg) {
      const i = v.x - x0;
      const j = v.y - y0;
      if (i >= 0 && j >= 0 && i < b && j < h) t[j * b + i] = 0;
    }
    return { perTegel: t, x0, y0, b, h };
  }
  // De vaste rijen van dit beeld, of null (zonder videokaart, binnen, of niet op het eiland): per stuk in het vak zijn rij
  // (opnieuw gemaakt als er iets veranderde), de stand voor js/gl.js, en wat er voor de lijst overblijft: `voorwerpen`
  // (zoals T.voorwerpenIn ze gaf, zonder de bomen van de rijen, en met wie daar nu door de lijst moet), `vroeg` (die
  // kregen hun doorkijk al), en per voorwerp van het eiland zijn plaats in de volgorde (`sub`, diepteVanItem).
  function vasteRijenVoor(ctx, S, w, vak, dt) {
    if (!ctx.tekenVast || !metSprites() || !T.sprites.buitenAan || !T.opEiland(w)) return null;
    const V = vastVan(w);
    const Z = T.STUK;
    const hoogte = w.hoogte ? w.hoogte.versie || 0 : -1;
    const sleutel = [T.sprites.seizoenVanDeBomen(), hoogte].join('|');
    const kaart = T.kaartVersie(w);
    if (kaart !== V.kaart) {
      const plekken = T.kaartPlekkenSinds(w, V.kaart);
      for (const e of V.stukken.values()) {
        const [x0, y0] = [e.s.x0, e.s.y0];
        if (!plekken || plekken.some((q) => !q || (q.x2 >= x0 - 1 && q.x1 <= x0 + Z && q.y2 >= y0 - 1 && q.y1 <= y0 + Z))) e.vies = true;
      }
      V.kaart = kaart;
    }
    const gebouwen = [];
    for (const v of w.voorwerpen) if (T.isGebouw(v)) gebouwen.push(gebouwVak(v));
    const geladen = T.sprites.geladenNr();
    const zicht = []; // { e, nr, rang }
    let later = 0; // wat alleen opnieuw moet omdat er een beeld bij kwam: één per beeld
    for (const nr of w.open) {
      const x0 = (nr % 64) * Z;
      const y0 = Math.floor(nr / 64) * Z;
      if (x0 > vak.x1 || y0 > vak.y1 || x0 + Z <= vak.x0 || y0 + Z <= vak.y0) continue;
      const s = T.stukOpen(w, nr);
      let e = V.stukken.get(nr);
      const nodig = !e || e.s !== s || e.vies || e.sleutel !== sleutel || e.gebouwen !== gebouwSleutel(gebouwen, e.vak);
      if (nodig || (e.geladen !== geladen && !later++)) {
        if (e) T.gl.weg(e.rij);
        e = bouwStuk(V, w, s, gebouwen, sleutel);
        V.stukken.set(nr, e);
      }
      zicht.push({ e, nr, rang: zicht.length });
    }
    if (V.tabel.vies) {
      T.gl.vasteTabel(V.tabel.data, V.tabel.n * STANDEN * 2);
      V.tabel.vies = false;
    }
    // de doorkijk van de bomen in de rijen: wie iemand kan bedekken die je hoort te zien, en wie nog openstaat
    const kandidaten = T.doorkijkKandidaten(S);
    const vroeg = new Set();
    for (const v of V.metDoorkijk) if (isVast(V, v)) vroeg.add(v);
    if (kandidaten.doorAlles.length) {
      const hb = T.hoogteIn(w, vak.x0, vak.y0, vak.x1, vak.y1).hoog;
      for (const k of kandidaten.doorAlles) bomenBij(V, w, k.doos, Math.max(0, hb), vroeg);
    }
    const metDoorkijk = [...vroeg];
    if (metDoorkijk.length) T.werkDoorkijkBij(S, dt, metDoorkijk, kandidaten);
    V.metDoorkijk = new Set(metDoorkijk.filter((v) => v.doorkijk > 0));
    const door = metDoorkijk.filter((v) => v.doorkijk > 0.02); // die gaan door de lijst (tekenVoorwerp, met het kijkgat)
    const mist = vasteMist(V, S, w, vak, door);
    // wat er voor de lijst overblijft, in de volgorde van T.voorwerpenIn: eerst wat iemand zette, dan per stuk rij na rij
    const voorwerpen = (w.voorwerpen || []).filter((v) => inVak(vak, v.x, v.y));
    const stap = DIEPTE_STUK / Math.max(1, zicht.length * Z);
    const sub = new Map();
    const plekIn = (e, v) => (v.y - e.s.y0) * Z + v.x - e.s.x0;
    for (const { e, nr, rang } of zicht) {
      const erbij = door.filter((v) => T.stukVan(v.x, v.y) === nr).sort((a, b) => plekIn(e, a) - plekIn(e, b));
      let k = 0;
      const zet = (v) => {
        if (!inVak(vak, v.x, v.y)) return;
        voorwerpen.push(v);
        sub.set(v, (rang * Z + v.y - e.s.y0) * stap);
      };
      for (const v of e.dyn) {
        while (k < erbij.length && plekIn(e, erbij[k]) < plekIn(e, v)) zet(erbij[k++]);
        zet(v);
      }
      while (k < erbij.length) zet(erbij[k++]);
    }
    for (let k = 0; k < WIND_FASEN; k++) V.wind[k] = T.sprites.windStand(T.windWaarde(S.tijd + (k / WIND_FASEN) * 23));
    const M = T.MIST_INSTELLINGEN;
    const d0 = vak.x0 + vak.y0 - 2;
    const stukken = [];
    for (const { e, rang } of zicht) {
      if (e.rij) stukken.push({ rij: e.rij, px: e.ref.x, py: e.ref.y, tx: e.s.x0 - mist.x0, ty: e.s.y0 - mist.y0, som: e.s.x0 + e.s.y0 - d0, rang });
    }
    return {
      stukken,
      stand: { wind: V.wind, perTegel: mist.perTegel, b: mist.b, h: mist.h, grijs: [M.ontkleurd, 1 - M.donker], d0, schaal: 2 / (vak.x1 + vak.y1 + 2 - d0), stap },
      voorwerpen, vroeg, sub, kandidaten,
      // staat er op tegel (x, y) een boom van een rij die getekend wordt? (heuvelsErvoor)
      staatOp(x, y) {
        const e = V.stukken.get(T.stukVan(x, y));
        const i = x - mist.x0;
        const j = y - mist.y0;
        return !!e && e.vlag[(y - e.s.y0) * Z + x - e.s.x0] === 1 && i >= 0 && j >= 0 && i < mist.b && j < mist.h && mist.perTegel[j * mist.b + i] > 0;
      },
    };
  }
  // De sleutel van het sorteren als diepte (js/gl.js, Doek.diepte), zoals de bomen van de vaste rijen hem hebben: hun som
  // x + y, plus hun plaats in de volgorde (`sub`, minder dan DIEPTE_STUK). Een ander voorwerp van het eiland net zo; wat
  // tekenVolgorde op dezelfde som eerder zet (een kleinere laag l, en met l 1 een deur en wat iemand zette: die komen
  // eerder in de lijst), DIEPTE_STAP ervoor, de rest erna; een som die geen geheel getal is (wie loopt), tussen twee
  // sommen in, want de bomen staan op hele.
  function diepteVanItem(item, vast) {
    const d = item.d;
    const v = item.voorwerp;
    if (v) {
      const sub = vast.sub.get(v);
      if (sub !== undefined) return d + sub;
    }
    if (d !== Math.floor(d)) return Math.floor(d) + 0.5;
    if (item.l < 1 || (item.l === 1 && v)) return d - DIEPTE_STAP;
    return d + DIEPTE_STAP;
  }

  // Welke tegels kunnen in die rechthoek iets tekenen? De ruit-projectie draait het raster, dus
  // nemen we de vier hoeken van de (opgerekte) rechthoek en het vak daaromheen.
  //
  // Het vak wordt afgeknipt op waar de kaart tegels kan hebben (T.kaartGrens: op het eiland het hele eiland).
  function tegelsIn(w, r, rand = MARGE) {
    const m = 0;
    const kaartvak = T.kaartGrens(w);
    const hoeken = [
      [r.x0 - rand.links, r.y0 - rand.boven],
      [r.x1 + rand.rechts, r.y0 - rand.boven],
      [r.x0 - rand.links, r.y1 + rand.onder],
      [r.x1 + rand.rechts, r.y1 + rand.onder],
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
      x0: Math.max(kaartvak.x - m, Math.floor(x0)),
      y0: Math.max(kaartvak.y - m, Math.floor(y0)),
      x1: Math.min(kaartvak.x + kaartvak.b - 1 + m, Math.ceil(x1)),
      y1: Math.min(kaartvak.y + kaartvak.h - 1 + m, Math.ceil(y1)),
    };
  }
  const inVak = (v, x, y) => x >= v.x0 && x <= v.x1 && y >= v.y0 && y <= v.y1;

  // ---------------------------------------------------------------- de grond, één keer getekend
  //
  // De grond verandert alleen als de camera verschuift of als er iets zichtbaar wordt; de rest van
  // het beeld verandert elk beeld. Dus tekenen we de grond één keer, en plakken hem er daarna elk beeld in één keer op.
  //
  // In stukken (Marcel, 9 okt: "Als je sleept op het beeld, dan zakt hij naar 20fps"): vierkanten van STUK pixels van
  // de buffer, die aan de wereld vastzitten. Wat in beeld komt, wordt getekend; wat ver uit beeld raakt, gaat terug in
  // een voorraad doeken. Tot 9 okt was het één buffer, 192 vlak-pixels ruimer dan het venster, en kwam de camera
  // daarbuiten, dan ging hij helemaal opnieuw: ver uitgezoomd 60 à 80 ms (de hele grond van het scherm, en dan als één
  // groot plaatje naar de videokaart), en slepend elke paar beelden. Nu tekent het slepen alleen de stukken aan de rand,
  // en gaan alleen die naar de videokaart. De pixels van alle stukken liggen op één raster, dus twee stukken sluiten
  // precies op elkaar aan, ook als een stuk op een halve pixel van het scherm begint: de videokaart tekent een pixel van
  // het ene of van het andere, en Chrome tekent een recht geplaatst plaatje zonder zachte rand. (Een pixel overlap gaf
  // in de half doorzichtige grond aan de rand van het land een donker kruis op elke hoek.)
  const STUK = 512;
  // Ver uitgezoomd (minder dan een pixel per vlak-pixel) valt tussen twee verkleinde grondtegels hier en daar een pixel
  // die geen van beide raakt, en hoeveel, hangt af van waar het raster van de stukken valt: zoveel pixel verschoven vielen
  // er op eiland 5 het minst (2569 op 0,35, de oude buffer 2100 tot 2800, en zonder verschuiving 4400). Van dichtbij
  // niet: dan ligt de grond pixel voor pixel zoals in de oude buffer.
  const faseVan = (k) => (k < 1 ? 0.75 : 0);
  // Wat er op een tegel in de grond ligt, steekt zo ver buiten zijn midden uit (vlak-pixels, met de hoogte apart: zie
  // tegelsVoorStuk): een grondtegel, iets plats. Een stuk tekent de tegels die zo dichtbij liggen.
  const GRONDRAND = { links: 48, rechts: 48, boven: 48, onder: 64 };

  function grondSleutel(S) {
    const w = S.wereld;
    // De droge beekjes (js/weer.js) liggen in de grond: vallen ze droog of komen ze terug, dan opnieuw.
    const D = T.dorpHier(S);
    const beek = D && D.weer && D.weer.beekDroog ? 1 : 0;
    // Het groen dat plat op de grond ligt, ligt erin: met een ander seizoen (de bomen en de begroeiing, vraag 148) ook
    // opnieuw.
    const bomen = metSprites() ? T.sprites.seizoenVanDeBomen() : '';
    // Wat er op de kaart veranderde (een gevelde boom, een gebouw) en waar het zand van de paadjes anders werd, tekent
    // werkGrondBij alleen daar opnieuw (vergeetVeranderdeKaart); de keuze voor de paadjes zelf tekent alles opnieuw.
    const paadjes = T.PADEN_INSTELLINGEN ? T.PADEN_INSTELLINGEN.paadjes : '';
    return `${metSprites() ? 1 : 0}|${Math.round(S.zoom * 100)}|${paadjes}|${platVan(w).versie}|${beek}|${sneeuwStap(S)}|${bomen}`;
  }

  // Wat plat op de grond groeit (een graspol, bloemen, een varen, paddenstoelen, een kleine steen, een rij kool; vraag
  // 112): niet in de weg, en zo laag dat het niemand bedekt. Het ligt in de buffer van de grond, zodat het per beeld niets
  // kost; op een land van de maker zijn het er een paar honderd. Wat plat is, zegt de tekening zelf (tegels/tegels.js):
  // niet vast, één tegel, en niet hoger dan PLAT_HOOG pixels boven zijn voet.
  const PLAT_HOOG = 24;
  // Onthouden op het voorwerp (T.sprites.onthouden, vraag 178, A2): isGebakken vraagt het elk beeld voor alles in beeld.
  function isPlat(v) {
    const vel = v.vel && T.TEGELS && T.TEGELS[v.vel];
    if (!vel) return false;
    const o = T.sprites.onthouden(v);
    if (o.plat === undefined) {
      const t = vel.tiles[T.sprites.tekeningVan(v, true).id];
      o.plat = !!(t && !t.vast && !t.beslaat && t.doos && t.doos[1] <= PLAT_HOOG);
    }
    return o.plat;
  }
  // Per wereld de platte voorwerpen, bijgewerkt als de kaart veranderde (T.kaartVersie, js/wereld.js). Weet de kaart waar
  // (T.kaartPlekkenSinds), dan alleen op die plekken, en blijft `versie` gelijk: werkGrondBij tekent die plekken zelf
  // opnieuw (vergeetVeranderdeKaart). Anders alles opnieuw gezocht, en gaat `versie` alleen omhoog als de lijst echt
  // anders werd, want alleen dan hoeft alle grond opnieuw. Ging er op het eiland land open (T.openGrootte), dan komt het
  // platte spul van de nieuwe stukken erbij zonder dat de versie omhoog gaat: werkGrondBij tekent dan alleen dat land
  // opnieuw (Marcel, 13 okt: "Alles per stuk").
  const PLAT = new WeakMap();
  function platVan(w) {
    const kaart = T.kaartVersie(w);
    const open = T.openGrootte(w);
    let p = PLAT.get(w);
    if (p && p.kaart === kaart && p.open === open) return p;
    const plekken = p && (p.kaart === kaart ? [] : T.kaartPlekkenSinds(w, p.kaart));
    if (p && plekken) {
      const op = (v) => plekken.some((r) => v.x >= r.x1 && v.x <= r.x2 && v.y >= r.y1 && v.y <= r.y2);
      const lijst = plekken.length ? p.lijst.filter((v) => !op(v)) : p.lijst.slice();
      const gehad = new Set();
      for (const r of plekken) {
        for (const v of T.voorwerpenIn(w, { x: r.x1, y: r.y1, b: r.x2 - r.x1 + 1, h: r.y2 - r.y1 + 1 })) {
          if (op(v) && !gehad.has(v) && isPlat(v)) lijst.push(v);
          gehad.add(v);
        }
      }
      if (p.open !== open) for (const r of T.nieuweStukken(w, p.stukken)) lijst.push(...T.voorwerpenIn(w, r).filter(isPlat));
      p = { ...p, kaart, open, stukken: new Set(w.open || []), lijst };
      PLAT.set(w, p);
      return p;
    }
    const lijst = T.voorwerpenIn(w, T.kaartGrens(w)).filter(isPlat);
    const zelfde = p && p.lijst.length === lijst.length && p.lijst.every((v, i) => v === lijst[i]);
    p = { kaart, open, stukken: new Set(w.open || []), lijst, versie: p ? p.versie + (zelfde ? 0 : 1) : 0 };
    PLAT.set(w, p);
    return p;
  }
  const isGebakken = (w, v) => isPlat(v);
  // Ligt er op tegel (x, y) een paadje (js/paden.js)? Daar is het platte spul weggelopen.
  function opPaadjeVan(w, paden) {
    if (!paden) return () => false;
    const kaartvak = T.kaartVak(w);
    const bv = kaartvak.b + 1; // de hoekpunten, zoals T.zandHoeken ze legt
    return (x, y) => {
      const k = (y - kaartvak.y) * bv + x - kaartvak.x;
      return T.inVak(kaartvak, x, y) && !!(paden.zand[k] || paden.zand[k + 1] || paden.zand[k + bv] || paden.zand[k + bv + 1]);
    };
  }
  // De volgorde van het platte spul: van achter naar voor.
  const platVolgorde = (a, b) => a.x + a.y - (b.x + b.y) || a.y - b.y;
  // Het platte spul in het gebied van een buffer, van achter naar voor; niet op een paadje.
  function tekenPlatIn(c, S, vak) {
    const w = S.wereld;
    const opPaadje = opPaadjeVan(w, zandVan(S));
    const lijst = platVan(w).lijst.filter((v) => inVak(vak, v.x, v.y) && vak.binnen(v.x, v.y) && !opPaadje(v.x, v.y));
    lijst.sort(platVolgorde);
    for (const v of lijst) {
      const p = opGrond(v.x, v.y);
      const stuk = metSprites() && T.sprites.buitenAan && T.sprites.buitenVan(v, 0);
      if (stuk) T.sprites.teken(c, stuk, p.x, p.y, 1);
    }
  }

  // De paadjes van het dorp dat hier ligt (js/paden.js): ze liggen in de grond, dus verandert er een, dan wordt de grond
  // opnieuw getekend.
  function zandVan(S) {
    const D = T.dorpHier(S);
    return D && D.gebouwen ? { D, zand: T.zandHoeken(D) } : null;
  }

  // Ver uitgezoomd (het overzicht, js/main.js, vraag 108, a) wordt de grond niet op de maat van de vlakte bewaard
  // maar op die van het scherm (`k`, de zoom maal de pixels per css-pixel). Tot B2b (13 okt) ging ook het bos om de kaart
  // in een buffer (in het overzicht 2100 van de 2600 tekenopdrachten per beeld, 13 beelden per seconde, gemeten op 3 okt);
  // nu is het eiland de kaart, en zijn die bomen echte bomen. Of het overzicht dan weer te traag wordt, meet B2b, stap 5.
  const BAK_ZOOM = 0.75;
  // De pixels per vlakte-pixel van de buffers: 1 van dichtbij, minder ver uitgezoomd.
  const bufferSchaal = (S, dpr) => (S.zoom < BAK_ZOOM ? Math.min(1, S.zoom * dpr) : 1);

  // De tegels die in rechthoek r van de vlakte iets tekenen, met de hoogte erbij (js/hoogte.js): een tegel ligt zoveel
  // hoger op het scherm dan zijn plek op de vlakte, dus het vak gaat zo ver omlaag als de hoogste grond die daar ligt, en
  // begint zo ver lager als de laagste. Die hoogte komt uit het vak zelf (T.hoogteIn), dus het groeit tot het past: een
  // berg naast het dorp maakt het vak om het dorp niet groter (vraag 174, stap b1; tot dan was het de hoogte om de
  // kaart, en daarbuiten 0).
  function tegelsMetHoogte(w, r, rand = MARGE) {
    let b = null;
    for (let keer = 0; ; keer++) {
      const vak = tegelsIn(w, b ? { x0: r.x0, y0: r.y0 + b.laag, x1: r.x1, y1: r.y1 + b.hoog } : r, rand);
      if (!T.heeftHoogte(w)) return vak;
      const nb = T.hoogteIn(w, vak.x0, vak.y0, vak.x1, vak.y1);
      if ((b && nb.hoog <= b.hoog && nb.laag >= b.laag) || keer >= 8) return vak;
      b = b ? { hoog: Math.max(b.hoog, nb.hoog), laag: Math.min(b.laag, nb.laag) } : nb;
    }
  }

  // De tegels die in rechthoek r van de vlakte iets tekenen, als wat erop ligt zo ver (`rand`, zoals MARGE) buiten zijn
  // midden uitsteekt: het vak eromheen (tegelsMetHoogte), en `binnen(x, y)` per tegel, op waar hij echt
  // getekend wordt. Het vak van een kleine rechthoek staat in de ruit van het raster scheef; zonder `binnen` tekende
  // elk stuk van de grond twee keer zoveel tegels als erin vallen.
  function tegelsVoorStuk(w, r, rand) {
    const vak = tegelsMetHoogte(w, r, rand);
    const heuvels = T.heeftHoogte(w);
    vak.binnen = (x, y) => {
      const p = T.naarScherm(x, y);
      if (p.x < r.x0 - rand.links || p.x > r.x1 + rand.rechts) return false;
      if (!heuvels) return p.y >= r.y0 - rand.boven && p.y <= r.y1 + rand.onder;
      // Met hoogte: van zijn hoogste hoek tot onder aan zijn wanden, die naar de hoeken van de tegels ten zuiden en oosten
      // lopen (T.wandenVan); een tegel aan een richel hangt zo een eind onder zijn midden.
      let hoogst = -Infinity;
      let laagst = Infinity;
      for (const [i, j] of [[0, 0], [1, 0], [0, 1]]) {
        for (const h of T.hoekHoogten(w, x + i, y + j)) {
          if (h > hoogst) hoogst = h;
          if (h < laagst) laagst = h;
        }
      }
      return p.y - hoogst <= r.y1 + rand.onder && p.y - laagst >= r.y0 - rand.boven;
    };
    return vak;
  }

  // Een buffer in stukken (de grond, en ver uitgezoomd het bos ervóór): { k, fase, sleutel, stukken, vrij }, met k de
  // pixels per vlak-pixel (de pixel van de buffer op vlak-pixel v is v maal k plus fase). Met een andere sleutel of schaal begint hij opnieuw. Dan legt hij elk stuk dat rechthoek r (de
  // vlakte) raakt en er nog niet is, met teken(c, rechthoek van het stuk) op een doek met de stand van dat stuk, en wat
  // meer dan een stuk buiten r ligt, gaat terug in de voorraad doeken. teken zegt of het iets tekende: een leeg stuk
  // houdt geen doek.
  const VOORRAAD = 16; // zoveel lege doeken bewaart een buffer hooguit (elk een megabyte)
  // Spreiden (Marcel, 18 okt: "Doe eerst het spreiden: de nieuwe stukken een of twee per beeld"; snelheid.md,
  // "Gemeten"): moet alles in beeld opnieuw op hetzelfde land (`spreid`: een stap met het wiel, een ander seizoen, de
  // sneeuw, de beek), dan blijft het oude beeld (buf.vorig) staan waar nog geen nieuw stuk ligt (buf.gaten,
  // tekenVorig), en komen de nieuwe er per beeld bij: het eerste altijd, het tweede als het eerste minder dan `ms` kostte.
  // Tot dan was dat één beeld van 83 à 100 ms (vlak) of 300 (met heuvels) op 0,35. Een schermafdruk, een foto en
  // Spel.debug.stap tekenen alles in één keer (T.tekenHeel).
  const SPREID = { stukken: 2, ms: 8 };
  let heel = false; // alleen scherm
  function werkStukkenBij(buf, sleutel, k, r, teken, spreid = false) {
    if (buf.sleutel !== sleutel || buf.k !== k) {
      // Liep het spreiden nog, dan blijft het oude beeld (dat is heel), en gaat wat er van het nieuwe al lag.
      if (spreid && !buf.vorig && buf.stukken.size) {
        buf.vorig = { k: buf.k, fase: buf.fase, stukken: buf.stukken };
        buf.stukken = new Map();
        buf.oud = null;
        buf.vuil = null;
      } else leegBuffer(buf);
      if (!spreid) leegVorig(buf);
      buf.sleutel = sleutel;
      buf.k = k;
      buf.fase = faseVan(k);
    }
    const f = buf.fase;
    const i0 = Math.floor((r.x0 * k + f) / STUK);
    const i1 = Math.floor((r.x1 * k + f) / STUK);
    const j0 = Math.floor((r.y0 * k + f) / STUK);
    const j1 = Math.floor((r.y1 * k + f) / STUK);
    for (const [sl, s] of buf.stukken) {
      if (s.i >= i0 - 1 && s.i <= i1 + 1 && s.j >= j0 - 1 && s.j <= j1 + 1) continue;
      if (s.canvas) buf.vrij.push(s.canvas);
      buf.stukken.delete(sl);
    }
    const gaten = [];
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) if (!buf.stukken.has(i + ',' + j)) gaten.push({ i, j });
    }
    if (buf.vorig && !heel) {
      ordenGaten(buf, gaten, r);
      const t0 = performance.now();
      for (let n = 0; gaten.length && (n === 0 || (n < SPREID.stukken && performance.now() - t0 < SPREID.ms)); n++) {
        const g = gaten.shift();
        tekenBufferStuk(buf, g.i, g.j, teken);
      }
    } else {
      for (const g of gaten.splice(0)) tekenBufferStuk(buf, g.i, g.j, teken);
    }
    buf.gaten = gaten;
    if (!gaten.length) leegVorig(buf);
    if (buf.vrij.length > VOORRAAD) buf.vrij.length = VOORRAAD;
  }
  // Het oude beeld weg (zijn doeken terug in de voorraad): het nieuwe ligt er helemaal.
  function leegVorig(buf) {
    if (!buf.vorig) return;
    for (const s of buf.vorig.stukken.values()) if (s.canvas) buf.vrij.push(s.canvas);
    buf.vorig = null;
  }
  // Eerst wat het oude beeld niet bedekt (de rand na een stap uit), dan van het midden van het beeld naar buiten.
  function ordenGaten(buf, gaten, r) {
    const m = STUK / buf.k;
    const cx = (r.x0 + r.x1) / 2;
    const cy = (r.y0 + r.y1) / 2;
    for (const g of gaten) {
      const x = (g.i * STUK - buf.fase) / buf.k;
      const y = (g.j * STUK - buf.fase) / buf.k;
      g.open = bedekt(buf.vorig, Math.max(x, r.x0), Math.max(y, r.y0), Math.min(x + m, r.x1), Math.min(y + m, r.y1)) ? 0 : 1;
      g.d = (x + m / 2 - cx) ** 2 + (y + m / 2 - cy) ** 2;
    }
    gaten.sort((a, b) => b.open - a.open || a.d - b.d);
  }
  // Of de stukken van buffer v rechthoek x0, y0 tot x1, y1 van de vlakte helemaal bedekken (een leeg stuk ook: daar is
  // niets).
  function bedekt(v, x0, y0, x1, y1) {
    const i1 = Math.ceil((x1 * v.k + v.fase) / STUK) - 1;
    const j1 = Math.ceil((y1 * v.k + v.fase) / STUK) - 1;
    for (let j = Math.floor((y0 * v.k + v.fase) / STUK); j <= j1; j++) {
      for (let i = Math.floor((x0 * v.k + v.fase) / STUK); i <= i1; i++) if (!v.stukken.has(i + ',' + j)) return false;
    }
    return true;
  }
  // Alles in één beeld, zonder spreiden: voor een schermafdruk, een foto en Spel.debug.stap (js/main.js).
  T.tekenHeel = function (f) {
    const was = heel;
    heel = true;
    try {
      return f();
    } finally {
      heel = was;
    }
  };
  // Of de grond nog gespreid binnenkomt (Spel.debug.meetGrond).
  T.grondBezig = (S) => (grondOpDeKaartNu ? !!(grondLaatst && grondLaatst.wacht) : !!(S.grond && S.grond.vorig));
  // Alle stukken weg (hun doeken terug in de voorraad), ook wat nog opnieuw moest.
  function leegBuffer(buf) {
    for (const s of buf.stukken.values()) if (s.canvas) buf.vrij.push(s.canvas);
    buf.stukken.clear();
    buf.oud = null;
    buf.vuil = null;
  }
  // Teken stuk (i, j) van de buffer (opnieuw); een oud doek gaat terug in de voorraad.
  function tekenBufferStuk(buf, i, j, teken) {
    const { k, fase: f } = buf;
    const sl = i + ',' + j;
    const oud = buf.stukken.get(sl);
    const canvas = stukDoek(buf);
    const c = canvas.getContext('2d');
    c.setTransform(k, 0, 0, k, f - i * STUK, f - j * STUK);
    c.imageSmoothingEnabled = false;
    const iets = teken(c, { x0: (i * STUK - f) / k, y0: (j * STUK - f) / k, x1: ((i + 1) * STUK - f) / k, y1: ((j + 1) * STUK - f) / k });
    if (!iets) buf.vrij.push(canvas);
    if (oud && oud.canvas) buf.vrij.push(oud.canvas);
    buf.stukken.set(sl, { i, j, canvas: iets ? canvas : null });
  }
  // Teken van stuk s alleen het deel `vak` (een rechthoek in de vlakte) opnieuw, op hele pixels van zijn doek: op een los
  // doek (deelDoek) in precies de stand van het stuk (even groot, hetzelfde begin), en dan één op één op zijn plek. Wat
  // erbuiten ligt, blijft. Een gevelde boom raakt zo een paar tegels; tot 17 okt tekende hij een heel stuk van 512 bij
  // 512 opnieuw, en op 30× met de bouwers in het bos haperde dat om de paar beelden. teken tekent alles wat dat deel
  // raakt, in dezelfde volgorde en op dezelfde pixels als voor het hele stuk, dus komen er dezelfde pixels. Niet met clip
  // op het doek zelf, en niet op een kleiner of verschoven doek: ver uitgezoomd (k kleiner dan 1, BAK_ZOOM) rondt de
  // browser een verkleind plaatje dan net anders af, en het licht op de hellingen (een vloeiend vergroot plaatje) ook.
  let deelDoek = null;
  function tekenBufferDeel(buf, s, vak, teken) {
    const { k, fase: f } = buf;
    const ox = s.i * STUK - f; // het doek begint op pixel ox, oy van de buffer
    const oy = s.j * STUK - f;
    const x0 = Math.max(0, Math.floor(vak.x0 * k - ox));
    const y0 = Math.max(0, Math.floor(vak.y0 * k - oy));
    const x1 = Math.min(STUK, Math.ceil(vak.x1 * k - ox));
    const y1 = Math.min(STUK, Math.ceil(vak.y1 * k - oy));
    const b = x1 - x0;
    const h = y1 - y0;
    if (b <= 0 || h <= 0) return;
    if (!deelDoek) {
      deelDoek = document.createElement('canvas');
      deelDoek.width = STUK;
      deelDoek.height = STUK;
    }
    const d = deelDoek.getContext('2d');
    d.setTransform(1, 0, 0, 1, 0, 0);
    d.clearRect(x0, y0, b, h);
    d.setTransform(k, 0, 0, k, -ox, -oy);
    d.imageSmoothingEnabled = false;
    teken(d, { x0: (x0 + ox) / k, y0: (y0 + oy) / k, x1: (x1 + ox) / k, y1: (y1 + oy) / k });
    const c = s.canvas.getContext('2d');
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(x0, y0, b, h);
    c.drawImage(deelDoek, x0, y0, b, h, x0, y0, b, h);
    c.restore();
    s.canvas.versie = (s.canvas.versie || 0) + 1; // js/gl.js stuurt hem opnieuw naar de kaart
  }
  // Een leeg doek voor een stuk, uit de voorraad als er een is. Een doek dat opnieuw beschreven wordt, krijgt een nieuwe
  // versie: dan stuurt js/gl.js het opnieuw naar de kaart.
  function stukDoek(buf) {
    const oud = buf.vrij.pop();
    if (oud) {
      oud.versie = (oud.versie || 0) + 1;
      const c = oud.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, oud.width, oud.height);
      return oud;
    }
    const nieuw = document.createElement('canvas');
    nieuw.width = STUK;
    nieuw.height = STUK;
    nieuw.versie = 1;
    return nieuw;
  }
  // De stukken van buffer buf die rechthoek r van de vlakte raken (zonder r: alle), op hun plek, in de stand van ctx.
  // De stukken die rechthoek r raken (alle zonder r); met `vlakken` alleen binnen die vierhoeken (tekenTegelOpnieuw).
  function tekenStukken(ctx, buf, r, vlakken) {
    if (!buf) return;
    if (buf.vorig && buf.gaten && buf.gaten.length) tekenVorig(ctx, buf, r, vlakken);
    const m = STUK / buf.k;
    for (const s of buf.stukken.values()) {
      if (!s.canvas) continue;
      const x = (s.i * STUK - buf.fase) / buf.k;
      const y = (s.j * STUK - buf.fase) / buf.k;
      if (r && (x > r.x1 || y > r.y1 || x + m < r.x0 || y + m < r.y0)) continue;
      if (vlakken) ctx.tekenUitgeknipt(s.canvas, x, y, m, m, vlakken);
      else ctx.drawImage(s.canvas, x, y, m, m);
    }
  }
  // Het oude beeld (buf.vorig, werkStukkenBij), geschaald, alleen in de gaten waar nog geen nieuw stuk ligt: zo komt de
  // half doorzichtige rand aan de kust niet dubbel. Met `vlakken` (tekenTegelOpnieuw) binnen die vierhoeken.
  function tekenVorig(ctx, buf, r, vlakken) {
    const v = buf.vorig;
    const m = STUK / buf.k;
    const knip = vlakken || buf.gaten.map((g) => {
      const x = (g.i * STUK - buf.fase) / buf.k;
      const y = (g.j * STUK - buf.fase) / buf.k;
      return [x, y, x + m, y, x + m, y + m, x, y + m];
    });
    const metKaart = !!ctx.tekenUitgeknipt;
    if (!metKaart) {
      ctx.save();
      ctx.beginPath();
      for (const q of knip) {
        ctx.moveTo(q[0], q[1]);
        for (let i = 2; i < q.length; i += 2) ctx.lineTo(q[i], q[i + 1]);
        ctx.closePath();
      }
      ctx.clip();
    }
    const vm = STUK / v.k;
    for (const s of v.stukken.values()) {
      if (!s.canvas) continue;
      const x = (s.i * STUK - v.fase) / v.k;
      const y = (s.j * STUK - v.fase) / v.k;
      if (r && (x > r.x1 || y > r.y1 || x + vm < r.x0 || y + vm < r.y0)) continue;
      if (metKaart) ctx.tekenUitgeknipt(s.canvas, x, y, vm, vm, knip);
      else ctx.drawImage(s.canvas, x, y, vm, vm);
    }
    if (!metKaart) ctx.restore();
  }
  // Voor het kijkgat (js/doorkijk.js) en het meten: de grond die rechthoek r raakt.
  T.tekenGrondStukken = (ctx, S, r) => tekenStukken(ctx, S.grond, r);

  function werkGrondBij(S, zicht, dpr) {
    if (!S.grond) S.grond = { k: 1, fase: 0, sleutel: '', stukken: new Map(), vrij: [] };
    const k = bufferSchaal(S, dpr);
    vergeetNieuwLand(S.grond, S.wereld);
    vergeetVeranderdeKaart(S.grond, S);
    const teken = (c, r) => tekenGrondIn(c, S, r);
    const buf = S.grond;
    // Hetzelfde land als het vorige beeld: dan komt de nieuwe grond gespreid (werkStukkenBij).
    const w = S.wereld;
    const zelfde = buf.w === w;
    buf.w = w;
    werkStukkenBij(buf, grondSleutel(S) + '|' + k, k, zicht, teken, zelfde);
    // van wat nieuw land raakt, één per beeld opnieuw; tot dan staat er wat er stond. Van een stuk met een doek alleen
    // het deel dat veranderde (tekenBufferDeel); een leeg stuk heeft geen doek, en komt heel opnieuw.
    const oud = buf.oud && buf.oud.find((sl) => buf.stukken.has(sl));
    if (oud) {
      buf.oud = buf.oud.filter((sl) => sl !== oud);
      const s = buf.stukken.get(oud);
      const vak = buf.vuil && buf.vuil.get(oud);
      if (buf.vuil) buf.vuil.delete(oud);
      if (s.canvas && vak) tekenBufferDeel(buf, s, vak, teken);
      else tekenBufferStuk(buf, s.i, s.j, teken);
    } else {
      buf.oud = null;
      buf.vuil = null;
    }
    return buf;
  }
  // Ging er op het eiland land open (js/wereld.js), dan alleen de stukken van de buffer die dat land raken opnieuw, één
  // per beeld (buf.oud); het land eromheen blijft staan.
  function vergeetNieuwLand(buf, w) {
    const open = T.openGrootte(w);
    if (buf.land && buf.land.w === w && buf.land.open !== open) for (const r of T.nieuweStukken(w, buf.land.stukken)) markeerOud(buf, w, r);
    if (!buf.land || buf.land.w !== w || buf.land.open !== open) buf.land = { w, open, stukken: new Set(w.open || []) };
  }
  // Veranderde de kaart (een gevelde boom, een gebouw, een veld: T.kaartPlekkenSinds in js/wereld.js), dan net zo alleen
  // de stukken rond die plekken opnieuw, met een tegel erom (de grond van een tegel loopt over in die van zijn buren);
  // weet de kaart niet waar, dan alles. En werd het zand van de paadjes ergens anders (T.zandHoeken, js/paden.js), dan
  // de stukken rond die hoekpunten. Tot 13 okt tekende elke verandering alle grond in beeld opnieuw (49 ms in plaats
  // van 11).
  function vergeetVeranderdeKaart(buf, S) {
    const w = S.wereld;
    const kaart = T.kaartVersie(w);
    if (buf.kaart && buf.kaart.w === w && buf.kaart.versie !== kaart) {
      const plekken = T.kaartPlekkenSinds(w, buf.kaart.versie);
      if (!plekken) leegBuffer(buf);
      else for (const p of plekken) markeerOud(buf, w, { x: p.x1 - 1, y: p.y1 - 1, b: p.x2 - p.x1 + 3, h: p.y2 - p.y1 + 3 });
    }
    buf.kaart = { w, versie: kaart };
    // Kwam er een vlak stuk bij (T.egaliseer, js/hoogte.js), dan de grond waar de glooiing anders werd, tot `vrijRond`
    // tegels om het gebouw, en het licht nog twee tegels verder (T.lichtOpHoekpunt kijkt zo ver); tot vraag 174, stap b1
    // alleen de voet van het gebouw, en lag er een ring grond op de oude hoogte.
    const hg = w.hoogte || null;
    if (buf.hoogte && buf.hoogte.hg !== hg) leegBuffer(buf);
    else if (hg && buf.hoogte && buf.hoogte.versie !== (hg.versie || 0)) {
      const plekken = T.hoogtePlekkenSinds(w, buf.hoogte.versie);
      if (!plekken) leegBuffer(buf);
      else for (const p of plekken) markeerOud(buf, w, { x: p.x1 - 2, y: p.y1 - 2, b: p.x2 - p.x1 + 5, h: p.y2 - p.y1 + 5 });
    }
    buf.hoogte = { hg, versie: hg ? hg.versie || 0 : 0 };
    const paden = zandVan(S);
    const zand = paden ? paden.zand : null;
    if (zand === buf.zand) return;
    if (buf.zand && zand && buf.zand.length === zand.length) {
      const vak = T.kaartVak(w);
      const bv = vak.b + 1; // de hoekpunten, zoals T.zandHoeken ze legt
      for (let k = 0; k < zand.length; k++) {
        if (zand[k] !== buf.zand[k]) markeerOud(buf, w, { x: vak.x + (k % bv) - 1, y: vak.y + Math.floor(k / bv) - 1, b: 2, h: 2 });
      }
    } else if (buf.stukken.size) leegBuffer(buf);
    buf.zand = zand;
  }
  // De stukken van de buffer die rechthoek r van tegels raken, opnieuw, één per beeld (buf.oud). In het vlak van het
  // scherm is r een ruit (T.naarScherm), met de rand van de grond (GRONDRAND), wat erop staat (PLAT_HOOG) en de hoogte erbij.
  function markeerOud(buf, w, r) {
    const { hoog, laag } = T.hoogteIn(w, r.x - 1, r.y - 1, r.x + r.b + 1, r.y + r.h + 1); // met de wanden van de buren
    const hoeken = [[r.x, r.y], [r.x + r.b, r.y], [r.x, r.y + r.h], [r.x + r.b, r.y + r.h]].map(([x, y]) => T.naarScherm(x, y));
    const x0 = Math.min(...hoeken.map((p) => p.x)) - GRONDRAND.rechts;
    const x1 = Math.max(...hoeken.map((p) => p.x)) + GRONDRAND.links;
    const y0 = Math.min(...hoeken.map((p) => p.y)) - GRONDRAND.onder - PLAT_HOOG - hoog;
    const y1 = Math.max(...hoeken.map((p) => p.y)) + GRONDRAND.boven - laag;
    for (const [sl, s] of buf.stukken) {
      const sx0 = (s.i * STUK - buf.fase) / buf.k;
      const sy0 = (s.j * STUK - buf.fase) / buf.k;
      if (sx0 > x1 || sy0 > y1 || sx0 + STUK / buf.k < x0 || sy0 + STUK / buf.k < y0) continue;
      if (!buf.oud) buf.oud = [];
      if (!buf.oud.includes(sl)) buf.oud.push(sl);
      // en welk deel van dat stuk, samen met wat er al vuil was (tekenBufferDeel)
      if (!buf.vuil) buf.vuil = new Map();
      const was = buf.vuil.get(sl);
      buf.vuil.set(sl, was ? { x0: Math.min(was.x0, x0), y0: Math.min(was.y0, y0), x1: Math.max(was.x1, x1), y1: Math.max(was.y1, y1) } : { x0, y0, x1, y1 });
    }
  }

  // Alles wat in de buffer van de grond ligt, in rechthoek r van de vlakte.
  function tekenGrondIn(c, S, r) {
    const om = tegelsIn(S.wereld, r); // ligt er hier iets van de kaart?
    if (om.x0 > om.x1 || om.y0 > om.y1) return false;
    const vak = tegelsVoorStuk(S.wereld, r, GRONDRAND);
    tekenVloeren(c, S, vak);
    tekenDrogeBeek(c, S, vak);
    tekenPlatIn(c, S, vak);
    return true;
  }

  // ---- de grond op de kaart (de renderproef van de grond: ontwerp/snelheid.md, "Het plan voor de renderproef van de
  // grond"; Marcel, 18 okt: "A: ver uitgezoomd mag anders zijn als het er even goed uitziet", en na stap 4: "dit wordt de
  // nieuwe standaard"). Met de videokaart tekent die de grond zelf; de buffer hierboven (werkGrondBij) is er dan alleen
  // nog voor zonder videokaart, en voor als het op de kaart niet kan (een vel op de stapel, de stapel vol). Per stuk land (T.STUK bij T.STUK tegels) een vaste rij met een instantie per grondtegel, rij na
  // rij, en de kaart tekent ze elk beeld meteen op de zoom (Doek.tekenGrond, js/gl.js): een stap met het wiel kost dan
  // niets. Een instantie is GROND_PER getallen (zetGrond): waar de tekening links boven begint (in pixels van de vlakte
  // vanaf het stuk), waar ze in haar bron staat, haar maat, de bron, de soort (T.gl.GROND_SOORT: een vel van de grond,
  // een plaatje op de stapel, de sneeuw met a en f van sneeuwVanTegel op de plek van de bron, een wand, of een tegel die
  // afdekt), de hoogte van de vier hoeken van de tegel, het anker en de sleutel van de diepte. Met heuvels (stap 4;
  // Marcel, 18 okt: "optie A en akkoord") van achter naar voor zoals de oude grond (tegelVolgorde), elke tegel op zijn
  // vlak met het licht van zijn stuk erin (maakLichtStuk, zacht gelezen: geen naadje meer), dan zijn wanden, dan zijn
  // sneeuw; en een tegel die iets achter zich afdekt (T.dekkersIn), schrijft zijn diepte op de kaart in een eigen rij
  // (e.dek), met de sleutel waarmee heuvelsErvoor hem anders in de lijst zet. Wat erop ligt (stap 3) komt zoals in de
  // oude grond (tekenGrondIn): de sneeuw van een tegel meteen na zijn vloer, als er sneeuw ligt, en hoeveel rekent de
  // kaart zelf (sneeuwOpDeKaart), zodat een andere stand sneeuw niets opnieuw maakt; dan de droge beek, één rij voor de
  // hele beek (bouwBeek); dan het platte groen, per stuk een tweede rij, die bij een ander seizoen alleen zelf opnieuw
  // komt, gespreid (bouwPlat, SPREID). Eerst de vloer van alle stukken, dan de beek, dan het groen: anders tekent de vloer
  // van een volgend stuk over wat over de rand van een stuk steekt. Een stuk opnieuw als het open ging, als de kaart er veranderde, als het zand van de paadjes of de beek er anders
  // werd, en één per beeld als er een vel bij kwam, of als de sneeuw kwam of helemaal weg is (dan heeft het de sneeuw wel
  // of niet in zijn rij); in T.tekenHeel alles meteen.
  const GROND_PER = 16;
  const VLAK = [0, 0, 0, 0]; // de hoeken van een tegel zonder hoogte
  const GROND_HOOGUIT = 48; // zoveel stukken blijven er hooguit op de kaart
  const grondKaarten = new WeakMap(); // wereld → { stukken: Map(nr → e), vellen, kaart, zand, hoogte, droog, plat, beek, vol, wacht }; alleen scherm
  let grondLaatst = null;
  let grondOpDeKaartNu = false; // tekende het vorige beeld de grond op de kaart (T.grondBezig)
  let beeldTeller = 0;
  let grondWerk = new Float32Array(GROND_PER * 64 * 64 * 2); // een rij terwijl hij gemaakt wordt (met sneeuw twee per tegel)
  function grondVan(w) {
    let G = grondKaarten.get(w);
    if (!G) {
      G = { stukken: new Map(), vellen: [], kaart: T.kaartVersie(w), zand: null, hoogte: null, droog: null, plat: null, beek: null, vol: false, wacht: 0 };
      grondKaarten.set(w, G);
    }
    if (grondLaatst && grondLaatst !== G) {
      for (const e of grondLaatst.stukken.values()) grondStukWeg(e, null);
      grondLaatst.stukken.clear();
      if (grondLaatst.beek) T.gl.weg(grondLaatst.beek.rij);
      grondLaatst.beek = null;
    }
    grondLaatst = G;
    return G;
  }
  // Markeer de stukken die rechthoek q van tegels raken (met een tegel erom) als vies; zonder q alle.
  function grondVies(G, q) {
    const Z = T.STUK;
    for (const e of G.stukken.values()) {
      if (!q || (q.x2 >= e.x0 - 1 && q.x1 <= e.x0 + Z && q.y2 >= e.y0 - 1 && q.y1 <= e.y0 + Z)) e.vies = true;
    }
  }
  // Instantie n van de rij die gemaakt wordt (grondWerk, dat groeit als het vol is), zoals VERT_GROND in js/gl.js hem
  // leest: links boven (x, y), de plek in de bron (sx, sy), de maat (b, h), de bron, de soort, de hoeken van de tegel,
  // het anker (ax, ay) en de sleutel van de diepte. De soort komt uit T.gl.GROND_SOORT, gelezen als de rij gemaakt wordt
  // (een bladzijde van het gereedschap laadt js/gl.js niet).
  function zetGrond(n, x, y, sx, sy, b, h, bron, soort, hoeken, ax, ay, sleutel) {
    const i = n * GROND_PER;
    if (i + GROND_PER > grondWerk.length) {
      const d = new Float32Array(grondWerk.length * 2);
      d.set(grondWerk);
      grondWerk = d;
    }
    grondWerk[i] = x;
    grondWerk[i + 1] = y;
    grondWerk[i + 2] = sx;
    grondWerk[i + 3] = sy;
    grondWerk[i + 4] = b;
    grondWerk[i + 5] = h;
    grondWerk[i + 6] = bron;
    grondWerk[i + 7] = soort;
    grondWerk.set(hoeken, i + 8);
    grondWerk[i + 12] = ax;
    grondWerk[i + 13] = ay;
    grondWerk[i + 14] = sleutel;
    grondWerk[i + 15] = 0;
  }
  // De wanden van tegel (x, y) als instanties vanaf plaats n (zoals tekenWanden), met de sleutel van hun diepte; geeft de
  // volgende plaats, of -1 als een textuur niet op de stapel past.
  function zetWanden(n, w, x, y, o, sleutel) {
    for (const wand of T.wandenVan(w, x, y)) {
      const q = T.gl.opDeStapel(wandTextuur(wand.soort, wand.kant));
      if (!q) return -1;
      const s1 = T.naarScherm(wand.van[0], wand.van[1]);
      const { u0, hA, hB } = wandMaten(wand);
      const kant = wand.kant === 'zuid' ? 1 : -1;
      zetGrond(n++, s1.x - o.x, s1.y - o.y, q.x, q.y, u0, kant, q.laag, T.gl.GROND_SOORT.WAND, [...wand.boven, ...wand.onder], hB, hA, sleutel);
    }
    return n;
  }
  // De grond van stuk s: de vloer, met heuvels de wanden van elke tegel erna, en (als `sneeuw`) de sneeuw van elke tegel
  // meteen na zijn vloer, zoals tekenVloeren; met heuvels ook het licht van het stuk en de rij van wat afdekt.
  function bouwGrondStuk(G, w, s, paden, droog, sneeuw) {
    const Z = T.STUK;
    const o = T.naarScherm(s.x0, s.y0);
    const hoog = T.heeftHoogte(w);
    let n = 0;
    for (const [x, y] of tegelVolgorde({ x0: s.x0, y0: s.y0, x1: s.x0 + Z - 1, y1: s.y0 + Z - 1 }, hoog)) {
      if (!T.isZichtbaar(w, x, y)) continue;
      const g = T.grondOp(w, x, y);
      if (!g) continue;
      const metPad = hoekenVanGrond(g, x, y, paden, droog);
      const deel = (metPad && T.sprites.grondMetHoeken(g.vel, metPad, x, y)) || T.sprites.buiten(g.vel, g.id);
      if (!deel) continue;
      let vel = G.vellen.indexOf(deel.beeld);
      if (vel < 0) vel = G.vellen.push(deel.beeld) - 1;
      const p = T.naarScherm(x, y);
      const h = hoog ? T.hoekHoogten(w, x, y) : VLAK;
      zetGrond(n++, Math.round(p.x - deel.ax) - o.x, Math.round(p.y - deel.ay) - o.y, deel.sx, deel.sy, deel.b, deel.h, vel, T.gl.GROND_SOORT.VEL, h, deel.ax, deel.ay, 0);
      if (hoog && (n = zetWanden(n, w, x, y, o, 0)) < 0) return null;
      const t = sneeuw && sneeuwVanTegel(x, y, metPad || T.sprites.grondHoeken(g.vel, g.id) || (g.naam ? [g.naam, g.naam, g.naam, g.naam] : null));
      if (t) zetGrond(n++, Math.round(p.x) - 32 - o.x, Math.round(p.y) - 16 - o.y, t[0], t[1], 64, 32, 0, T.gl.GROND_SOORT.SNEEUW, h, 32, 16, 0);
    }
    const rij = n ? T.gl.vasteRij(grondWerk, n, GROND_PER) : null;
    // wat afdekt: zijn ruit en zijn wanden, alleen in de diepte (VERT_GROND), met de sleutel van heuvelsErvoor (x + y,
    // DIEPTE_STAP ervoor, zoals diepteVanItem een ding op een halve laag geeft), vanaf de som van de eerste tegel
    let k = 0;
    if (hoog) {
      T.dekkersIn(w, s.x0, s.y0, s.x0 + Z - 1, s.y0 + Z - 1, (x, y) => {
        if (k < 0) return;
        const p = T.naarScherm(x, y);
        const sleutel = x - s.x0 + y - s.y0 - DIEPTE_STAP;
        zetGrond(k++, p.x - o.x, p.y - o.y, 0, 0, 0, 0, 0, T.gl.GROND_SOORT.DEK, T.hoekHoogten(w, x, y), 0, 0, sleutel);
        k = zetWanden(k, w, x, y, o, sleutel);
      });
      if (k < 0) {
        T.gl.weg(rij);
        return null;
      }
    }
    // wat het stuk op het scherm kan beslaan (het kijkgat, Doek.tekenGrondGat): de ruit van het stuk, met de hoogte, de
    // rand van een tegel en wat er plat op ligt
    const { hoog: boven, laag: onder } = T.hoogteIn(w, s.x0 - 1, s.y0 - 1, s.x0 + Z, s.y0 + Z);
    const R = GRONDRAND.links + PLAT_HOOG + 132;
    const vak = [o.x - Z * 32 - R, o.y - R - boven, o.x + Z * 32 + R, o.y + Z * 32 + R - Math.min(0, onder)];
    return {
      s, x0: s.x0, y0: s.y0, px: o.x, py: o.y, rij, plat: null, dek: k ? T.gl.vasteRij(grondWerk, k, GROND_PER) : null,
      licht: hoog ? lichtStukVan(w, Math.floor(s.x0 / Z), Math.floor(s.y0 / Z)).canvas : null, vak, vies: false,
    };
  }
  // Stuk e van de kaart; zijn licht ook, tenzij het nieuwe stuk (of null) hetzelfde heeft.
  function grondStukWeg(e, nieuw) {
    T.gl.weg(e.rij);
    T.gl.weg(e.plat);
    T.gl.weg(e.dek);
    if (e.licht && !(nieuw && nieuw.licht === e.licht)) T.gl.wegZacht(e.licht);
  }
  // Het platte groen per stuk land, van achter naar voor (platVolgorde), opnieuw als platVan een nieuwe lijst gaf.
  function platPerStuk(G, w) {
    const p = platVan(w);
    if (G.plat && G.plat.p === p) return G.plat;
    const per = new Map();
    for (const v of p.lijst) {
      const nr = T.stukVan(v.x, v.y);
      if (!per.has(nr)) per.set(nr, []);
      per.get(nr).push(v);
    }
    for (const l of per.values()) l.sort(platVolgorde);
    G.plat = { p, per };
    return G.plat;
  }
  // Het platte groen van stuk e als rij, elk als plaatje op de stapel (losBeeld), niet op een paadje, zoals
  // tekenPlatIn. Een tekening die nog laadt, komt als er een beeld bij kwam (e.geladen); past er een niet op de stapel,
  // dan tekent de oude grond (G.vol).
  function bouwPlat(G, e, lijst, opPaadje) {
    let n = 0;
    for (const v of lijst) {
      if (opPaadje(v.x, v.y)) continue;
      const stuk = T.sprites.buitenAan && T.sprites.buitenVan(v, 0);
      if (!stuk) continue;
      const q = T.gl.opDeStapel(losBeeld(stuk));
      if (!q) {
        G.vol = true;
        return null;
      }
      const p = opGrond(v.x, v.y);
      zetGrond(n++, Math.round(p.x - stuk.ax) - e.px, Math.round(p.y - stuk.ay) - e.py, q.x, q.y, stuk.b, stuk.h, q.laag, T.gl.GROND_SOORT.STAPEL, VLAK, 0, 0, 0);
    }
    return n ? T.gl.vasteRij(grondWerk, n, GROND_PER) : null;
  }
  // De droge beek (beekStukjes) als één rij, vanaf zijn eerste tegel (zo blijven de getallen klein genoeg voor de kaart),
  // met de vlakjes in een kleur op de stapel (kleurVlak): { rij, px, py }, met rij null als hij niet droog is.
  function bouwBeek(G, S, w) {
    const D = T.dorpHier(S);
    const tegels = D && D.weer && D.weer.beekDroog ? T.beekTegels(w).filter((t) => T.staatDroog(D, t.x, t.y)) : [];
    if (!tegels.length) return { rij: null, px: 0, py: 0 };
    const o = T.naarScherm(tegels[0].x, tegels[0].y);
    let n = 0;
    const vlak = (kleur, x, y, b, h) => {
      const q = T.gl.opDeStapel(kleurVlak(kleur));
      if (q) zetGrond(n++, x - o.x, y - o.y, q.x, q.y, b, h, q.laag, T.gl.GROND_SOORT.STAPEL, VLAK, 0, 0, 0);
      else G.vol = true;
    };
    for (const t of tegels) beekStukjes(t, vlak);
    return { rij: n ? T.gl.vasteRij(grondWerk, n, GROND_PER) : null, px: o.x, py: o.y };
  }
  const kleurVlakken = new Map(); // kleur → een doek van 4 bij 4 in die kleur, voor de stapel (bouwBeek); alleen scherm
  function kleurVlak(kleur) {
    let c = kleurVlakken.get(kleur);
    if (!c) {
      c = document.createElement('canvas');
      c.width = 4;
      c.height = 4;
      const k = c.getContext('2d');
      k.fillStyle = kleur;
      k.fillRect(0, 0, 4, 4);
      c.versie = 1; // eens getekend, blijft hij zo (js/gl.js)
      kleurVlakken.set(kleur, c);
    }
    return c;
  }
  // Hoeveel sneeuw er ligt, voor de kaart (VERT_GROND in js/gl.js): `laag` de laag maal 1,15 (sneeuwDek; zonder sneeuw zo
  // laag dat er niets komt), en `tabel` per stand (1 tot SNEEUW_STAPPEN) waar zijn tegel (sneeuwTegel) op de stapel staat:
  // x, y, laag en een 0. Null als een tegel daar niet kan.
  let sneeuwStapel = null;
  function sneeuwOpDeKaart(laag) {
    if (!sneeuwStapel) {
      const tabel = new Float32Array((SNEEUW_STAPPEN + 1) * 4);
      for (let k = 1; k <= SNEEUW_STAPPEN; k++) {
        const q = T.gl.opDeStapel(sneeuwTegel(k));
        if (!q) return null;
        tabel.set([q.x, q.y, q.laag, 0], k * 4);
      }
      sneeuwStapel = tabel;
    }
    return { laag: laag > 0 ? laag * 1.15 : -1, tabel: sneeuwStapel };
  }
  // Het kijkgat (T.tekenKijkgat, js/doorkijk.js): ligt de grond van dit beeld op de kaart, dan tekent de kaart hem zelf
  // in de cirkel rond (x, y), want de buffer van de oude grond wordt dan niet bijgewerkt. False als dat niet zo is.
  T.grondInHetGat = (ctx, x, y, r, sterkte) => grondOpDeKaartNu && !!ctx.tekenGrondGat && ctx.tekenGrondGat(x, y, r, sterkte);
  // Tekent de grond in vak (tegels) als vaste rijen; false als het niet kan (dan de oude grond).
  function tekenGrondOpDeKaart(ctx, S, w, vak) {
    if (!ctx.tekenGrond || !metSprites() || !T.sprites.buitenAan || !T.opEiland(w)) return false;
    const G = grondVan(w);
    if (G.vol) return false;
    const Z = T.STUK;
    const kaart = T.kaartVersie(w);
    if (kaart !== G.kaart) {
      const plekken = T.kaartPlekkenSinds(w, G.kaart);
      if (!plekken) grondVies(G, null);
      else for (const q of plekken) grondVies(G, q);
      G.kaart = kaart;
    }
    const paden = zandVan(S);
    const zand = paden ? paden.zand : null;
    if (zand !== G.zand) {
      if (G.zand && zand && G.zand.length === zand.length) {
        const kv = T.kaartVak(w);
        const bv = kv.b + 1; // de hoekpunten, zoals T.zandHoeken ze legt
        for (let k = 0; k < zand.length; k++) {
          if (zand[k] === G.zand[k]) continue;
          const x = kv.x + (k % bv);
          const y = kv.y + Math.floor(k / bv);
          grondVies(G, { x1: x - 1, y1: y - 1, x2: x, y2: y });
        }
      } else grondVies(G, null);
      G.zand = zand;
    }
    // Kwam er een vlak stuk bij (T.egaliseer, js/hoogte.js), dan de stukken waar de glooiing anders werd, en het licht nog
    // twee tegels verder (T.lichtOpHoekpunt kijkt zo ver), zoals vergeetVeranderdeKaart.
    const hg = w.hoogte || null;
    if (G.hoogte && G.hoogte.hg !== hg) grondVies(G, null);
    else if (hg && G.hoogte && G.hoogte.versie !== (hg.versie || 0)) {
      const plekken = T.hoogtePlekkenSinds(w, G.hoogte.versie);
      if (!plekken) grondVies(G, null);
      else for (const q of plekken) grondVies(G, { x1: q.x1 - 2, y1: q.y1 - 2, x2: q.x2 + 2, y2: q.y2 + 2 });
    }
    G.hoogte = { hg, versie: hg ? hg.versie || 0 : 0 };
    // Valt de beek droog of komt hij terug, dan alleen de stukken om de beek: een tegel krijgt een bedding als een
    // tegel ernaast beek is (T.hoekenDroog, js/weer.js).
    const droog = droogVan(paden);
    if (!!droog !== G.droog) {
      for (const t of T.beekTegels(w)) grondVies(G, { x1: t.x - 1, y1: t.y - 1, x2: t.x + 1, y2: t.y + 1 });
      G.droog = !!droog;
    }
    const sneeuw = sneeuwLaag(S);
    const metSneeuw = sneeuw > 0;
    const plat = platPerStuk(G, w);
    const platSleutel = `${T.sprites.seizoenVanDeBomen()}|${plat.p.versie}`;
    const opPaadje = opPaadjeVan(w, paden);
    const geladen = T.sprites.geladenNr();
    const stukken = [];
    const platten = [];
    const dekken = [];
    let later = 0; // wat een paar beelden kan wachten: één per beeld, behalve in T.tekenHeel
    let platGedaan = 0;
    let platBegin = 0;
    let platWacht = 0;
    for (const nr of [...w.open].sort((a, b) => a - b)) {
      const x0 = (nr % 64) * Z;
      const y0 = Math.floor(nr / 64) * Z;
      if (x0 > vak.x1 || y0 > vak.y1 || x0 + Z <= vak.x0 || y0 + Z <= vak.y0) continue;
      const s = T.stukOpen(w, nr);
      let e = G.stukken.get(nr);
      const nodig = !e || e.s !== s || e.vies;
      const zacht = !!e && (e.geladen !== geladen || e.sneeuw !== metSneeuw);
      if (nodig || (zacht && (heel || !later++))) {
        const nieuw = bouwGrondStuk(G, w, s, paden, droog, metSneeuw);
        if (e) grondStukWeg(e, nieuw);
        if (!nieuw) {
          G.vol = true; // een wand past niet op de stapel: dan de oude grond
          G.stukken.delete(nr);
          return false;
        }
        e = Object.assign(nieuw, { geladen, sneeuw: metSneeuw, platSleutel: null });
        G.stukken.set(nr, e);
      }
      // Het groen van een nieuw stuk meteen; dat van een ander seizoen gespreid, zoals de oude grond (SPREID): een stuk
      // per beeld, en een tweede als het eerste vlot ging (op het proefdorp kostte het in één beeld 17 tot 50 ms).
      if (e.platSleutel !== platSleutel) {
        const nieuw = e.platSleutel === null;
        if (heel || nieuw || !platGedaan || (platGedaan < SPREID.stukken && performance.now() - platBegin < SPREID.ms)) {
          if (!nieuw && !platGedaan++) platBegin = performance.now();
          T.gl.weg(e.plat);
          e.plat = bouwPlat(G, e, plat.per.get(nr) || [], opPaadje);
          e.platSleutel = platSleutel;
        } else platWacht++;
      }
      e.beeld = beeldTeller;
      if (e.rij) stukken.push(e);
      if (e.plat) platten.push({ rij: e.plat, px: e.px, py: e.py, vak: e.vak });
      if (e.dek) dekken.push({ rij: e.dek, px: e.px, py: e.py, som: e.s.x0 + e.s.y0 });
    }
    G.wacht = Math.max(0, later - 1) + platWacht; // T.grondBezig
    const beekSleutel = `${droog ? 1 : 0}|${kaart}`;
    if (!G.beek || G.beek.sleutel !== beekSleutel) {
      if (G.beek) T.gl.weg(G.beek.rij);
      G.beek = { ...bouwBeek(G, S, w), sleutel: beekSleutel };
    }
    // wat lang buiten beeld is, gaat van de kaart (een stuk is 256 kB, met sneeuw 512)
    if (G.stukken.size > GROND_HOOGUIT) {
      for (const [nr, e] of G.stukken) {
        if (e.beeld === beeldTeller) continue;
        grondStukWeg(e, null);
        G.stukken.delete(nr);
      }
    }
    beeldTeller++;
    const opDeKaart = sneeuwOpDeKaart(sneeuw);
    if (G.vol || !opDeKaart) return false;
    const heuvels = T.heeftHoogte(w) ? { schaal: SCHUIN_GROTER, dekken } : null;
    return ctx.tekenGrond(stukken.concat(G.beek.rij ? [G.beek] : [], platten), G.vellen, opDeKaart, heuvels);
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
    // het seizoen van de bomen (vraag 148, stap 2): T.sprites tekent elke boom dan in zijn seizoen. Spel.debug.bomen =
    // 'herfst' laat ze zien in een seizoen naar keus.
    if (metSprites()) T.sprites.zetSeizoen((T.debug && T.debug.bomen) || T.boomSeizoen(S));
    const dpr = ctx.getTransform().a || 1; // pixels per css-pixel (js/main.js, formaat)
    // Het dorp dat hier ligt (js/dorp.js), of geen.
    const D = T.dorpHier(S);
    // Wat er niet is, is de nacht tussen de bomen.
    ctx.fillStyle = '#0e1310';
    ctx.fillRect(0, 0, bw, bh);
    ctx.save();
    // Dezelfde afronding als naarVlak in main.js, anders wijst de muis net naast de tegel.
    ctx.translate(Math.round(bw / 2), Math.round(bh / 2));
    ctx.scale(S.zoom, S.zoom);
    ctx.translate(-Math.round(S.camera.x), -Math.round(S.camera.y));
    // Pixel art wordt vergroot, nooit uitgesmeerd.
    ctx.imageSmoothingEnabled = false;

    const zicht = zichtVlak(S, bw, bh);
    const vak = tegelsMetHoogte(w, zicht); // met de hoogte: een tegel onder het beeld kan op een heuvel erin liggen

    const opDeKaart = tekenGrondOpDeKaart(ctx, S, w, vak);
    grondOpDeKaartNu = opDeKaart;
    const g = opDeKaart ? S.grond : werkGrondBij(S, zicht, dpr); // heuvelsErvoor gebruikt hem ook
    if (!opDeKaart) tekenStukken(ctx, g, zicht);
    tekenWaterLeven(ctx, S, w, vak);
    tekenWeides(ctx, S, vak);

    // Wat "muur" heet, is de voet van een boom of een gebouw, en dat tekent zichzelf als voorwerp.
    const lijst = [];
    const zichtbaar = [];
    const kijkgaten = new Map(); // voorwerp → de kijkgaten die erna komen (voorsteKijkgaten, hieronder)
    Object.assign(beeldNu, { ctx, S, kijkgaten });
    grijzeItems.clear(); // mistOverLijst vult hem opnieuw
    // Doorkijk: wat de aanvoerder of een wezen bedekt, wordt zolang doorzichtig. De tijd komt uit de
    // spelklok, zodat het ook klopt als het spel even stilstaat of vooruitgespoeld wordt.
    const dt = Math.max(0, Math.min(0.1, S.tijd - (S.doorkijkTijd || 0)));
    S.doorkijkTijd = S.tijd;
    const telt = voorwerpTelt(S, w, zicht, vak);
    // de bomen en het groen in vaste rijen op de videokaart (vraag 178, B1 en B2), en de rest zoals altijd
    const vast = vasteRijenVoor(ctx, S, w, vak, dt);
    const voorwerpen = vast ? vast.voorwerpen : T.voorwerpenIn(w, { x: vak.x0, y: vak.y0, b: vak.x1 - vak.x0 + 1, h: vak.y1 - vak.y0 + 1 });
    for (const v of voorwerpen) {
      const vroeg = vast && vast.vroeg.has(v); // zijn doorkijk liep al (vasteRijenVoor)
      if (!telt(v)) {
        if (v.doorkijk && !vroeg) zichtbaar.push(v); // half open: de doorkijk sluit hem nog, ook buiten beeld
        continue;
      }
      if (!T.isZichtbaar(w, v.x, v.y) || isGebakken(w, v)) continue;
      if (!vroeg) zichtbaar.push(v);
      // Een gebouw (T.isGebouw: breder of dieper dan één tegel) krijgt `gebouw` mee: alleen dan is
      // één scalair dieptegetal niet genoeg, en zoekt tekenVolgorde zijn plek (zie hieronder). Zijn punt is hijzelf.
      lijst.push({ d: diepteVan(v), l: 1, punt: v, gebouw: T.isGebouw(v) ? v : undefined, voorwerp: v, helder: 1, f: tekenVoorwerpItem });
    }
    // De akkers (alleen het nieuwe spel, ?kaart=gehucht — ontwerp/werklijst.md punt 1b): welk
    // stadium en welke variant een tegel heeft, weet js/akkers.js (T.akkerStadium e.a.); hier
    // wordt alleen getekend, en alleen wat in beeld staat (vak, net als de muren-loop hierboven —
    // "Performance: teken alleen wat in beeld is"). Groen en rijp wuiven en staan als twee lagen
    // in de tekenlijst, met dezelfde diepte `d` als het wezen dat er misschien op staat maar een
    // lagere/hogere `l`: eerst de achterlaag (l 1, vóór een wezen l 2), dan via de gewone
    // sortering het wezen zelf, dan de voorlaag (l 2,5) erover — zo lijkt een boer tot zijn
    // middel in het graan te staan. De andere drie stadia zijn plat genoeg voor één laag. Zonder
    // sprites blijft een akker gewoon de kale zandgrond die er al ligt, en zonder kalender ook.
    if (w.akkers && w.akkers.length && metSprites() && S.kalender) {
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
    // De bruggen van het eiland (js/eiland.js, legBruggen; gereedschap/pixelart/bruggen-vel.cjs): per tegel drie lagen. Het
    // dek (het wegdek, de zijkant, de bogen) is de grond van wie erop staat: het komt zoveel tegels eerder als het hoog ligt
    // (een pixel hoger ligt op het scherm een zestiende som x + y verder naar achter), zodat een ossenkar die over twee
    // tegels reikt er niet in zakt (Marcel, 17 okt: "de ossenkar lijkt nog in de brug te zakken"). De borstwering aan de
    // overkant (l 1) en die aan de kant van de kijker (l 2,5) staan zoals het graan om wie erop loopt (l 2). Een stuk ligt
    // met zijn anker op de grond van zijn tegel (opMaaiveld), niet op het wegdek (opGrond, T.naarSchermOp). Met hoogte ligt
    // de brug vlak op zijn basis (T.brugBasis, js/hoogte.js; vraag 174, stap b3): een stuk boven het water zoveel hoger
    // (T.brugOpTil), en zijn pijlers lopen door tot het water (tekenBrugStuk).
    if (metSprites() && T.opEiland(w)) {
      const steen = steenVanLand(w);
      for (const [n, brug] of T.eilandVan(w.eiland.zaad).bruggen.entries()) {
        const R = T.brugRijen(brug);
        const hoeken = [[-1, 0], [-1, R - 1], [brug.L, 0], [brug.L, R - 1]].map(([i, k]) => T.brugTegel(brug, i, k));
        const xs = hoeken.map((t) => t[0]);
        const ys = hoeken.map((t) => t[1]);
        if (Math.max(...xs) < vak.x0 || Math.min(...xs) > vak.x1 || Math.max(...ys) < vak.y0 || Math.min(...ys) > vak.y1) continue;
        for (let i = -1; i <= brug.L; i++) {
          for (let k = 0; k < R; k++) {
            const [x, y] = T.brugTegel(brug, i, k);
            if (!inVak(vak, x, y) || !T.isZichtbaar(w, x, y)) continue;
            const p = opMaaiveld(x, y);
            const til = T.brugOpTil(w, n, x, y);
            const dek = T.dekOp(w, x, y) / 16;
            for (const [laag, d, l] of [[0, x + y - dek, 0.5], [1, x + y, 2.5], [2, x + y, 1]]) {
              const deel = T.sprites.brugStuk(brug, brug.stad ? 'baksteen' : steen, i, k, laag);
              if (deel) lijst.push({ d, l, punt: { x, y }, zonderSchaduw: true, f: () => tekenBrugStuk(ctx, deel, p.x, p.y - til, til) });
            }
          }
        }
      }
    }
    T.werkDoorkijkBij(S, dt, zichtbaar, vast ? vast.kandidaten : undefined);
    // Wie aan de schandpaal staat, krijgt het halsijzer om: een eigen laag ná zijn beeld (l 2,5,
    // zoals de voorlaag van het graan), zodat de band vóór zijn nek komt.
    const aanDePaal = metSprites() && D && T.aanDePaal ? T.aanDePaal(D) : null;
    // Wie er nu een brandende lantaarn draagt, voor tekenWezen (tekenLantaarn), één keer per beeld.
    lantaarnsNu = new Set(metSprites() && D && !(T.debug && T.debug.geenNacht) ? T.lichtDragers(D) : []);
    for (const e of w.wezens) {
      // Met sprites blijft het laatste beeld van het sterven liggen; met vlakken vervaagt het.
      if (e.dood && e.sterfTijd > 0.8 && !metSprites()) continue;
      if (e.binnen && !deurStap(S, e)) continue; // 's nachts in zijn huis (js/dag.js); net binnen: hij stapt nog de deur in
      if (!inVak(vak, e.tx, e.ty) || !T.isZichtbaar(w, e.tx, e.ty)) continue;
      lijst.push({ d: e.x + e.y, l: e.dood ? 1.5 : 2, punt: { x: e.tx, y: e.ty }, wezen: e, f: () => tekenWezen(ctx, S, e) });
      if (e === aanDePaal) lijst.push({ d: e.x + e.y, l: 2.5, punt: { x: e.tx, y: e.ty }, wezen: e, f: () => tekenHalsijzer(ctx, e) });
    }
    kleinLevenInLijst(ctx, S, w, D, vak, lijst);
    stapelsInLijst(ctx, S, w, D, vak, lijst);
    kampBuitInLijst(ctx, S, w, vak, lijst);
    palissadeInLijst(ctx, S, w, vak, lijst);
    aankledingInLijst(ctx, S, w, vak, lijst);
    heuvelsErvoor(ctx, S, vak, lijst, g, vast, opDeKaart); // een heuvel voor iemand dekt hem af (js/hoogte.js; vraag 121, stap 2)
    mistOverLijst(ctx, S, w, lijst); // in het zwart niets, in het grijs grijs en zonder wie er loopt (B2c, js/mist.js)
    // Ramen die branden: meteen na hun gebouw gaat er een gat in het doek waar ze zitten, dat na de
    // nacht licht wordt (brandendeRamen, hieronder).
    const ramen = gebouwenPlat(S) ? [] : brandendeRamen(S); // plat zijn er geen ramen (tekenVoorwerp)
    const metSchaduw = tekenZonneschaduw(ctx, S);
    // De mist over de grond (B2c, js/mist.js), na de schaduwen (anders vallen die over het zwart) en vóór wat ui is (het
    // pad naar een tegel in het zwart moet je zien); wat erop staat, kreeg hem in mistOverLijst.
    tekenMist(ctx, S.dorp, w, vak);
    // Wat ui is op het doek, niet in de fotomodus (js/main.js, werklijst vraag 146, e) en een scène (js/regie.js): de tegel onder de
    // muis en het pad, een gebouw aan de muis, de plek van een verzoek, het spoor, de rand van de
    // jacht, de tekens bij de deur, de zwevende tekst, en boven een wezen zijn uitroepteken en levensbalk.
    // De wolkjes, de lantaarn en de ogen van de wolven blijven: die horen bij de wereld (Marcel, 10 okt).
    if (!zonderUi(S)) {
      tekenMarkeringen(ctx, S);
      tekenBouwBereik(ctx, S, vak);
      tekenMarktPlek(ctx, S);
      tekenRooiPlaatsen(ctx, S);
      tekenBouwSpook(ctx, S);
      tekenStuurPlekken(ctx, S);
      tekenKlikTeken(ctx, S);
    }
    const volgorde = tekenVolgorde(lijst);
    voorsteKijkgaten(volgorde, kijkgaten);
    // De lantaarns die hierna een gat krijgen (tekenLantaarn).
    lantaarnGaten = { doek: ctx, gaten: [], wacht: [] };
    // eerst de vaste rijen, met hun diepte; wat de lijst daarna tekent, toetst ertegen (diepteVanItem)
    if (vast) ctx.tekenVast(vast.stukken, vast.stand);
    for (const item of volgorde) {
      if (vast) ctx.diepte = diepteVanItem(item, vast);
      if (metSchaduw) ctx.werptSchaduw = !item.zonderSchaduw;
      tekenItem(item);
      if (metSchaduw) ctx.werptSchaduw = false;
      for (const r of ramen) if (isTekeningVan(item, r.g)) ponsRamen(ctx, r);
    }
    if (vast) ctx.diepte = null;
    if (!gebouwenPlat(S)) tekenSchoorsteenRook(ctx, S); // plat zijn er geen schoorstenen (tekenVoorwerp)
    tekenRook(ctx, S);
    if (!zonderUi(S)) tekenBouwGhost(ctx, S); // het gebouw in de hand, boven op alles
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
    vulLantaarns(ctx);
    tekenOgen(ctx, S);
    tekenVuur(ctx, S);
    tekenWolkjes(ctx, S);
    if (!zonderUi(S)) tekenEffecten(ctx, S);
    ctx.restore();
    tekenVignet(ctx, S, bw, bh);
  };

  // Het kijkgat (js/doorkijk.js) om wie achter hoge voorwerpen staat, één per wezen: na het voorste voorwerp dat hem
  // bedekt, zo ver open als het verst openstaande (v.doorkijk). Zo'n gat tekent alles erachter opnieuw, dus wat een
  // voorwerp ervoor tekende, valt er toch onder weg. Tot 13 okt tekende elk voorwerp zijn eigen gat: in een bos stonden
  // er 20 tot 30 bomen voor de aanvoerder, elk beeld hetzelfde gat, en zonder videokaart kostte dat zo'n 16 ms per beeld
  // (Marcel: "Dat is prima"; alleen de zachte rand gaat iets minder open door de bomen erachter). Vult kijkgaten:
  // voorwerp → [{ e, sterkte }], in de volgorde van tekenen.
  T.voorsteKijkgaten = voorsteKijkgaten; // ook voor test/doorkijk.test.cjs
  function voorsteKijkgaten(volgorde, kijkgaten) {
    const per = new Map(); // wezen → { v: het voorste voorwerp tot nu toe, sterkte }
    for (const item of volgorde) {
      const v = item.voorwerp;
      if (!v || !v.kijkgat || !(v.doorkijk > 0.02)) continue;
      for (const e of v.kijkgat) {
        const was = per.get(e);
        per.set(e, { v, sterkte: Math.max(v.doorkijk, was ? was.sterkte : 0) });
      }
    }
    for (const [e, { v, sterkte }] of per) {
      if (!kijkgaten.has(v)) kijkgaten.set(v, []);
      kijkgaten.get(v).push({ e, sterkte });
    }
  }

  // Een stuk van een brug op (x, y), `til` pixels hoger dan de grond van zijn tegel (T.brugOpTil): in het dek trekt het de
  // onderste rij van elke voet (js/sprites.js, deel.voeten; gereedschap/pixelart/bruggen-vel.cjs, voetenVan) zoveel omlaag,
  // zodat een pijler, een juk of de zijkant van een landhoofd weer tot het water reikt. Met de steen of het hout van de
  // tekening zelf, en zonder render erbij (Marcel, 17 okt: "Toch B2: de brug op de oevers, met de pijlers in code verlengd").
  function tekenBrugStuk(ctx, deel, x, y, til) {
    T.sprites.teken(ctx, deel, x, y, 1);
    if (!deel.voeten || til < 0.5) return;
    const [x0, y0] = [Math.round(x - deel.ax), Math.round(y - deel.ay)];
    const h = Math.round(til) + 1;
    for (const [vx, b, ys, yd] of deel.voeten) ctx.drawImage(deel.beeld, deel.sx + vx, deel.sy + ys, b, 1, x0 + vx, y0 + yd, b, h);
  }

  // Een heuvel voor iemand dekt hem af (werklijst vraag 121, stap 2; Marcel, 8 okt: "Akkoord"). De grond ligt als één
  // buffer onder alles (werkGrondBij), dus wie achter de rand van een richel staat, stond er bovenop. Een tegel die
  // afdekt (T.dektAf, js/hoogte.js) komt daarom nog een keer in de tekenlijst, op zijn eigen diepte en vóór wat er op hem
  // staat: zijn stuk van de grondbuffer, uitgeknipt op zijn vlak en zijn wanden. Alleen als er achter hem iets staat. Wie
  // je hoort te zien (T.zichtbaarDoor, js/doorkijk.js, zoals de aanvoerder), krijgt er het kijkgat van de doorkijk bij, na de
  // voorste tegel die hem afdekt, net als achter een huis. Ligt de grond op de kaart (`dekt`), dan dekt de kaart zelf af:
  // wat afdekt, schreef zijn diepte (bouwGrondStuk), en de lijst toetst daartegen; dan komt alleen het kijkgat erin.
  const ACHTER = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2]];
  const tegelNr = (x, y) => (y + 32768) * 65536 + x + 32768; // een tegel als getal, voor een Set of een Map
  function heuvelsErvoor(ctx, S, vak, lijst, g, vast, dekt) {
    const w = S.wereld;
    if (!w.hoogte) return;
    const kaartvak = T.kaartGrens(w);
    const dekkers = []; // x, y, x, y, ...
    const x0 = Math.max(kaartvak.x, vak.x0);
    const y0 = Math.max(kaartvak.y, vak.y0);
    T.dekkersIn(w, x0, y0, Math.min(kaartvak.x + kaartvak.b - 1, vak.x1), Math.min(kaartvak.y + kaartvak.h - 1, vak.y1), (x, y) => dekkers.push(x, y));
    if (!dekkers.length) return;
    // Eerst de tegels achter de dekkers (in beeld een paar tientallen), dan van de tekenlijst (duizenden) alleen die: alles
    // in een Set kostte 0,9 ms per beeld (vraag 174, c).
    const achter = new Set();
    for (let k = 0; k < dekkers.length; k += 2) for (const [i, j] of ACHTER) achter.add(tegelNr(dekkers[k] - i, dekkers[k + 1] - j));
    const staat = new Set(); // de tegels achter een dekker waar iets op staat dat getekend wordt
    for (const it of lijst) {
      if (!it.punt) continue;
      const n = tegelNr(it.punt.x, it.punt.y);
      if (achter.has(n)) staat.add(n);
    }
    // en de bomen van de vaste rijen (vraag 178, B2), die niet in de lijst staan
    if (vast) for (const n of achter) if (!staat.has(n) && vast.staatOp((n % 65536) - 32768, Math.floor(n / 65536) - 32768)) staat.add(n);
    let wezensOp = null; // tegel achter een dekker → de wezens die erop staan
    let kijkgaten = null; // wezen → het item van de voorste tegel die hem afdekt
    for (let k = 0; k < dekkers.length; k += 2) {
      const x = dekkers[k];
      const y = dekkers[k + 1];
      if (!ACHTER.some(([i, j]) => staat.has(tegelNr(x - i, y - j)))) continue;
      const item = { d: x + y, l: 0.5, punt: { x, y }, zonderSchaduw: true, f: dekt ? () => {} : () => tekenTegelOpnieuw(ctx, w, x, y, g) };
      if (!dekt) lijst.push(item);
      if (!wezensOp) {
        wezensOp = new Map();
        for (const e of w.wezens) {
          const n = tegelNr(e.tx, e.ty);
          if (!achter.has(n)) continue;
          if (!wezensOp.has(n)) wezensOp.set(n, []);
          wezensOp.get(n).push(e);
        }
      }
      for (const [i, j] of ACHTER) {
        for (const e of wezensOp.get(tegelNr(x - i, y - j)) || []) {
          if (T.zichtbaarDoor(S, e) !== 'alles') continue;
          kijkgaten = kijkgaten || new Map();
          const was = kijkgaten.get(e);
          if (!was || was.d < item.d) kijkgaten.set(e, item);
        }
      }
    }
    if (kijkgaten) {
      const erbij = new Set();
      for (const [e, item] of kijkgaten) {
        const teken = item.f;
        item.f = () => {
          teken();
          T.tekenKijkgat(ctx, S, e, 1, null);
        };
        if (dekt && !erbij.has(item)) lijst.push(item);
        erbij.add(item);
      }
    }
  }
  // Het stuk van de grondbuffer op tegel (x, y): zijn schuine vlak, en zijn wanden aan de zuid- en oostkant, elk een
  // vierhoek. Met de videokaart als driehoeken (js/gl.js, tekenUitgeknipt; vraag 174, c: met een knip ging elke tegel
  // over het kladdoek, ver uitgezoomd zo'n 3,5 miljoen pixels per beeld), zonder met een knip.
  function tekenTegelOpnieuw(ctx, w, x, y, g) {
    const h = T.hoekHoogten(w, x, y);
    const vlak = [];
    T.HOOGTE_HOEKEN.forEach(([dx, dy], k) => {
      const p = T.naarScherm(x + dx, y + dy);
      vlak.push(p.x, p.y - h[k]);
    });
    const vlakken = [vlak];
    for (const wand of T.wandenVan(w, x, y)) {
      const s1 = T.naarScherm(wand.van[0], wand.van[1]);
      const s2 = T.naarScherm(wand.tot[0], wand.tot[1]);
      vlakken.push([s1.x, s1.y - wand.boven[0], s2.x, s2.y - wand.boven[1], s2.x, s2.y - wand.onder[1], s1.x, s1.y - wand.onder[0]]);
    }
    const r = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }; // wat de vlakken beslaan: alleen die stukken
    for (const v of vlakken) {
      for (let i = 0; i < 8; i += 2) {
        r.x0 = Math.min(r.x0, v[i]);
        r.y0 = Math.min(r.y0, v[i + 1]);
        r.x1 = Math.max(r.x1, v[i]);
        r.y1 = Math.max(r.y1, v[i + 1]);
      }
    }
    if (ctx.tekenUitgeknipt) {
      tekenStukken(ctx, g, r, vlakken);
      return;
    }
    ctx.save();
    ctx.beginPath();
    for (const v of vlakken) {
      ctx.moveTo(v[0], v[1]);
      for (let i = 2; i < 8; i += 2) ctx.lineTo(v[i], v[i + 1]);
      ctx.closePath();
    }
    ctx.clip();
    tekenStukken(ctx, g, r);
    ctx.restore();
  }

  // De mist (B2c, js/mist.js; Marcel, 13 okt: "A2", donkerder en ontkleurd): zwart wat je niet kent, grijs wat je kent
  // maar nu niet ziet, en helder waar je mensen en je gebouwen kijken. Over de grond gaat één masker met een pixel per
  // tegel, schuin op de grond gelegd zoals het licht van de hellingen (lichtStukVan): zo loopt de rand vanzelf zacht over
  // een tegel uit. Met de videokaart heeft het masker twee helften naast elkaar, links hoeveel kleur eruit gaat en rechts
  // hoeveel donkerder, en doet ctx.tekenMist (js/gl.js) beide in één keer. Zonder videokaart kostten twee schuine lagen
  // over het hele scherm 50 ms per beeld (13 okt: van 33 naar 16 beelden per seconde, het ontkleuren met 'saturation'
  // alleen 33 ms), dus daar is het één laag (eerst naar het grijs, dan donkerder, per tegel in één kleur), eerst op een
  // klein doek recht op het scherm en dan opgeschaald (MIST_KLEIN; lopend op 30× 30 beelden per seconde, zonder mist 32).
  // Daar is het grijs grijzer in plaats van ontkleurd, zoals de nacht zonder videokaart de eenvoudige laag bleef (Marcel,
  // 4 okt: "zonder videokaart wordt er bijna niet meer gespeeld"). Wat op de grond staat, krijgt het grijs naar de tegel
  // waar het staat (mistOverLijst), anders werd een hoge boom aan de rand half grijs. Op een kaart met hoogte ligt het
  // masker op de grond, met een net per stuk (mistNetVan; vraag 174, stap b4).
  // Spel.debug.geenMist = true zet de mist in het beeld uit, om te vergelijken (de regels blijven).
  const MIST_STAP = 16; // het masker beslaat een vak op een veelvoud hiervan, zodat het niet bij elke stap nieuw is
  const MIST_KIER = 2; // pixels tussen de twee helften, zodat het uitsmeren de ene niet in de andere trekt
  const MIST_KLEIN = 4; // zonder videokaart: het kleine doek is zoveel keer kleiner dan het scherm
  const mistMaskers = new WeakMap(); // dorp → { sleutel, basis, werk, x0, y0, b, h, n }; met de videokaart { sleutel, gekend, versie, kijkers, x0, y0, b, h }
  const metMist = (w) => T.opEiland(w) && !(T.debug && T.debug.geenMist);
  // De kleur van een tegel van het masker, [r, g, b, a] (0..255): met de videokaart de twee helften (ontkleuren, donker),
  // zonder één (zie hierboven): wat het doek eronder c maakt tot c·(1 − a) + kleur·a, zoals eerst een grijs over c met
  // `ontkleurd`, dan het zwart met `donker`.
  function mistKleuren(kaart, kent) {
    const M = T.MIST_INSTELLINGEN;
    const Z = M.zwart;
    if (!kent) return kaart ? [[128, 128, 128, 255], [...Z, 255]] : [[...Z, 255]];
    const [o, d] = [M.ontkleurd, M.donker];
    if (kaart) return [[128, 128, 128, Math.round(o * 255)], [...Z, Math.round(d * 255)]];
    const a = 1 - (1 - o) * (1 - d);
    return [[...Z.map((z) => Math.round((128 * o * (1 - d) + z * d) / a)), Math.round(a * 255)]];
  }
  // De mist van dorp D (je eigen, S.dorp) over kaart w.
  function mistMasker(D, w, vak, kaart) {
    const M = T.MIST_INSTELLINGEN;
    const x0 = Math.floor(vak.x0 / MIST_STAP) * MIST_STAP;
    const y0 = Math.floor(vak.y0 / MIST_STAP) * MIST_STAP;
    const b = Math.ceil((vak.x1 + 1) / MIST_STAP) * MIST_STAP - x0;
    const h = Math.ceil((vak.y1 + 1) / MIST_STAP) * MIST_STAP - y0;
    if (kaart) return mistOpDeKaart(D, M, x0, y0, b, h);
    let m = mistMaskers.get(D);
    // wat je kent: alleen opnieuw als er land bij kwam, het vak verschoof of een getal in de werkbank veranderde
    const sleutel = [x0, y0, b, h, T.mistVersie(D), M.ontkleurd, M.donker, M.zwart.join(), kaart].join('|');
    if (!m || m.sleutel !== sleutel) {
      const n = kaart ? 2 : 1; // zoveel helften naast elkaar
      const B = n * b + (n - 1) * MIST_KIER;
      if (!m || !m.basis) mistMaskers.set(D, (m = { basis: document.createElement('canvas'), werk: document.createElement('canvas') }));
      for (const c of [m.basis, m.werk]) {
        if (c.width !== B) c.width = B;
        if (c.height !== h) c.height = h;
      }
      const k = m.basis.getContext('2d');
      const beeld = k.createImageData(B, h);
      const d = beeld.data;
      const kleuren = [mistKleuren(kaart, false), mistKleuren(kaart, true)];
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < b; i++) {
          const kl = kleuren[T.kentTegel(D, x0 + i, y0 + j) ? 1 : 0];
          for (let helft = 0; helft < n; helft++) d.set(kl[helft], (j * B + helft * (b + MIST_KIER) + i) * 4);
        }
      }
      k.putImageData(beeld, 0, 0);
      Object.assign(m, { sleutel, x0, y0, b, h, n });
    }
    // waar je nu kijkt: elk beeld, op de plek waar ze staan (niet afgerond, zodat de kring meeglijdt)
    const k = m.werk.getContext('2d');
    k.globalCompositeOperation = 'copy';
    k.drawImage(m.basis, 0, 0);
    k.globalCompositeOperation = 'destination-out';
    for (const z of T.wieKijken(D)) {
      const r0 = Math.max(0, z.r - M.rand / 2);
      const r1 = z.r + M.rand / 2;
      const cx = z.x - x0 + 0.5;
      const cy = z.y - y0 + 0.5;
      if (cx + r1 < 0 || cy + r1 < 0 || cx - r1 > b || cy - r1 > h) continue;
      for (let helft = 0; helft < m.n; helft++) {
        const naast = helft * (b + MIST_KIER);
        const g = k.createRadialGradient(cx + naast, cy, r0, cx + naast, cy, r1);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        k.save();
        k.beginPath();
        k.rect(naast, 0, b, h);
        k.clip();
        k.fillStyle = g;
        k.fillRect(cx + naast - r1, cy - r1, 2 * r1, 2 * r1);
        k.restore();
      }
    }
    k.globalCompositeOperation = 'source-over';
    return m;
  }
  // Met de videokaart (vraag 178, Marcel: "Regen en mist doen maar"): wat je kent als getallen, per tegel twee (hoeveel
  // kleur eruit gaat, hoeveel donkerder; de alpha van mistKleuren), alleen opnieuw als de sleutel verandert, en per beeld
  // wie er kijkt: per kijker vier getallen (het midden in pixels van het masker, met de halve tegel, en de twee stralen
  // van de zachte rand). De kaart maakt er zelf het masker van (js/gl.js, mistWerk), zoals hierboven het doek met een
  // verloop per kijker: tot 18 okt hier elk beeld, met het doek erna naar de kaart.
  function mistOpDeKaart(D, M, x0, y0, b, h) {
    let m = mistMaskers.get(D);
    const sleutel = [x0, y0, b, h, T.mistVersie(D), M.ontkleurd, M.donker, M.zwart.join(), 'kaart'].join('|');
    if (!m || m.sleutel !== sleutel) {
      const gekend = m && m.gekend && m.gekend.length === b * h * 4 ? m.gekend : new Uint8Array(b * h * 4);
      const kleuren = [mistKleuren(true, false), mistKleuren(true, true)];
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < b; i++) {
          const kl = kleuren[T.kentTegel(D, x0 + i, y0 + j) ? 1 : 0];
          const p = (j * b + i) * 4;
          gekend[p] = kl[0][3];
          gekend[p + 1] = kl[1][3];
          gekend[p + 3] = 255;
        }
      }
      m = { sleutel, gekend, versie: (m && m.versie ? m.versie : 0) + 1, kijkers: m && m.kijkers ? m.kijkers : new Float32Array(64), x0, y0, b, h, n: 0 };
      mistMaskers.set(D, m);
    }
    let n = 0;
    for (const z of T.wieKijken(D)) {
      const r0 = Math.max(0, z.r - M.rand / 2);
      const r1 = z.r + M.rand / 2;
      const cx = z.x - x0 + 0.5;
      const cy = z.y - y0 + 0.5;
      if (cx + r1 < 0 || cy + r1 < 0 || cx - r1 > b || cy - r1 > h) continue;
      if (m.kijkers.length < (n + 1) * 4) {
        const k = new Float32Array(m.kijkers.length * 2);
        k.set(m.kijkers);
        m.kijkers = k;
      }
      m.kijkers.set([cx, cy, r0, r1], n * 4);
      n++;
    }
    m.n = n;
    return m;
  }
  let mistKlein = null; // het kleine doek zonder videokaart
  // Het net van de mist (vraag 174, stap b4; Marcel: "M2"): per stuk van T.STUK een punt op het midden van elke tegel
  // van het stuk en de rij en kolom erna (65 bij 65, zodat de stukken op elkaar aansluiten), op zijn hoogte, als [x, y
  // op de vlakte van het scherm, x, y van de tegel]. Zo ligt het masker op de grond, ook op een heuvel; zonder hoogte
  // ligt het net plat, en is het beeld wat het was.
  const mistNetten = new WeakMap();
  const mistNetVan = (w, sx, sy) => perStukVanDeHoogte(mistNetten, w, sx, sy, 1, maakMistNet);
  function maakMistNet(w, x0, y0) {
    const n = T.STUK + 1;
    const punten = new Float32Array(n * n * 4);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const p = T.naarSchermGrond(w, x0 + i, y0 + j);
        punten.set([p.x, p.y, x0 + i, y0 + j], (j * n + i) * 4);
      }
    }
    return punten;
  }
  // De stukken van het net onder vak (tegels), van achter naar voren (js/gl.js tekent wat voor ligt het laatst).
  function mistNetOnder(w, vak) {
    const Z = T.STUK;
    const stukken = [];
    for (let sy = Math.floor((vak.y0 - 1) / Z); sy <= Math.floor(vak.y1 / Z); sy++) {
      for (let sx = Math.floor((vak.x0 - 1) / Z); sx <= Math.floor(vak.x1 / Z); sx++) stukken.push(mistNetVan(w, sx, sy));
    }
    return stukken;
  }
  function tekenMist(ctx, D, w, vak) {
    if (!metMist(w)) return;
    const kaart = !!ctx.tekenMist;
    const m = mistMasker(D, w, vak, kaart);
    if (kaart) {
      ctx.tekenMist(m, T.MIST_INSTELLINGEN.zwart, { x0: m.x0, y0: m.y0, stukken: mistNetOnder(w, vak) });
      return;
    }
    const p = T.naarScherm(m.x0 - 0.5, m.y0 - 0.5);
    const st = ctx.getTransform();
    const [B, H] = [Math.ceil(ctx.canvas.width / MIST_KLEIN), Math.ceil(ctx.canvas.height / MIST_KLEIN)];
    if (!mistKlein) mistKlein = document.createElement('canvas');
    if (mistKlein.width !== B) mistKlein.width = B;
    if (mistKlein.height !== H) mistKlein.height = H;
    const k = mistKlein.getContext('2d');
    k.setTransform(1, 0, 0, 1, 0, 0);
    k.clearRect(0, 0, B, H);
    const f = 1 / MIST_KLEIN;
    k.setTransform(st.a * f, st.b * f, st.c * f, st.d * f, st.e * f, st.f * f);
    k.imageSmoothingEnabled = true;
    if (T.heeftHoogte(w)) mistPerVierkant(k, w, m, vak);
    else {
      k.translate(p.x, p.y);
      k.transform(32, 16, -32, 16, 0, 0);
      k.drawImage(m.werk, 0, 0, m.b, m.h, 0, 0, m.b, m.h);
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // zonder uitsmeren: het kleine doek is al zacht, en uitgesmeerd opschalen kostte nog 6 beelden per seconde (13 okt)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mistKlein, 0, 0, B, H, 0, 0, B * MIST_KLEIN, H * MIST_KLEIN);
    ctx.restore();
  }
  // Zonder videokaart, met hoogte (vraag 174, stap b4; Marcel: "M2", en "Iedere laptop of apparaat, handheld etc. heeft
  // een APU of GPU"): elk vierkant tussen de middens van vier tegels van het net apart, van het masker op zijn plek
  // (een tikje ruimer, zodat er geen naad tussen valt). Het klopt, maar kost een plaatje per tegel in beeld.
  function mistPerVierkant(k, w, m, vak) {
    const Z = T.STUK;
    const n = Z + 1;
    for (const punten of mistNetOnder(w, vak)) {
      const [x0, y0] = [punten[2], punten[3]];
      for (let j = 0; j < Z; j++) {
        const y = y0 + j;
        if (y < vak.y0 - 1 || y > vak.y1 || y < m.y0 || y >= m.y0 + m.h - 1) continue;
        for (let i = 0; i < Z; i++) {
          const x = x0 + i;
          if (x < vak.x0 - 1 || x > vak.x1 || x < m.x0 || x >= m.x0 + m.b - 1) continue;
          const a = (j * n + i) * 4;
          const b = a + 4;
          const c = a + n * 4;
          k.save();
          k.transform(punten[b] - punten[a], punten[b + 1] - punten[a + 1], punten[c] - punten[a], punten[c + 1] - punten[a + 1], punten[a], punten[a + 1]);
          k.drawImage(m.werk, x - m.x0 + 0.5, y - m.y0 + 0.5, 1, 1, -0.02, -0.02, 1.04, 1.04);
          k.restore();
        }
      }
    }
  }
  // Wat op de grond staat, naar de tegel waar het staat (een gebouw: het midden van zijn voet): op land dat je niet kent
  // niets, en waar je nu niet kijkt grijs, zonder wie er loopt (een beest, een rover, een bezoeker; je eigen mensen zie
  // je altijd). Haalt weg wat niet getekend wordt, ook voor de schaduwen. Met de videokaart is het grijs een filter op
  // het doek (js/gl.js kent grayscale); zonder kost een filter bij elk plaatje een bewerking van het hele vel (een vel met
  // bomen is 2000 bij 1400; 13 okt liep het beeld daar op vast), dus tekent het daar een grijze kopie van het stukje
  // (grijsStuk).
  function mistOverLijst(ctx, S, w, lijst) {
    if (!metMist(w)) return;
    const M = T.MIST_INSTELLINGEN;
    const filter = `grayscale(${M.ontkleurd}) brightness(${1 - M.donker})`; // geen tekst
    inHetGrijs = ctx.tekenMist
      ? (item) => {
        ctx.filter = filter;
        item.f();
        ctx.filter = 'none';
      }
      : (item) => {
        ctx.drawImage = function (bron, ...a) {
          const [sx, sy, sw, sh, ...rest] = a.length === 8 ? a : [0, 0, bron.naturalWidth || bron.width, bron.naturalHeight || bron.height, ...a];
          const op = rest.length === 2 ? [...rest, sw, sh] : rest;
          const stuk = grijsStuk(bron, sx, sy, sw, sh, filter);
          return stuk ? CanvasRenderingContext2D.prototype.drawImage.call(this, stuk, 0, 0, stuk.width, stuk.height, ...op)
            : CanvasRenderingContext2D.prototype.drawImage.call(this, bron, ...a);
        };
        try {
          item.f();
        } finally {
          delete ctx.drawImage;
        }
      };
    let n = 0;
    for (const item of lijst) {
      const v = item.gebouw;
      const p = v ? { x: Math.round(v.x + ((v.beslaat ? v.beslaat[0] : 1) - 1) / 2), y: Math.round(v.y + ((v.beslaat ? v.beslaat[1] : 1) - 1) / 2) } : item.punt;
      if (p && !T.zietNu(S.dorp, p.x, p.y)) {
        if (!T.kentTegel(S.dorp, p.x, p.y) || (item.wezen && !T.isVanDorp(S.dorp, item.wezen))) continue;
        grijzeItems.add(item); // tekenItem tekent hem in het grijs
      }
      lijst[n++] = item;
    }
    lijst.length = n;
  }
  // Een item van de tekenlijst tekenen: zijn f, in het grijs als mistOverLijst dat zei (grijzeItems en inHetGrijs, elk
  // beeld opnieuw gezet). Tot 17 okt pakte de mist elk item in een eigen functietje in, elk beeld; ver uitgezoomd
  // duizenden. Niet met een vlag op het item: een eigenschap die er later bij komt, geeft de items van de lijst zoveel
  // vormen dat het sorteren (tekenVolgorde) in Chromium twee keer zo traag werd.
  const grijzeItems = new Set();
  let inHetGrijs = null;
  function tekenItem(item) {
    if (grijzeItems.has(item)) inHetGrijs(item);
    else item.f();
  }
  // Een voorwerp in de tekenlijst tekent zich met één gedeelde functie (this is het item: zijn voorwerp en hoe helder), en
  // niet met een eigen functietje per voorwerp per beeld. beeldNu: het doek, het spel en de kijkgaten van dit beeld
  // (T.tekenScene zet ze).
  const beeldNu = { ctx: null, S: null, kijkgaten: null };
  function tekenVoorwerpItem() {
    tekenVoorwerp(beeldNu.ctx, beeldNu.S, this.voorwerp, this.helder, beeldNu.kijkgaten.get(this.voorwerp));
  }

  // Een grijze kopie van een stukje van een plaatje (zonder videokaart, mistOverLijst), één keer gemaakt: eerst het stukje
  // los, dan met het filter, zodat het filter alleen dat stukje bewerkt. Een doek dat elke keer anders is (zonder
  // `versie`) krijgt er geen. Samen hooguit GRIJS_PIXELS pixels (vier bytes elk), dan begint het opnieuw.
  const GRIJS_PIXELS = 16e6;
  let grijzeStukken = new WeakMap(); // bron → Map(stukje → doek)
  let grijsPixels = 0;
  let grijsFilter = null;
  function grijsStuk(bron, sx, sy, sw, sh, filter) {
    const doek = typeof HTMLCanvasElement !== 'undefined' && bron instanceof HTMLCanvasElement;
    if (doek && bron.versie === undefined) return null;
    if (filter !== grijsFilter || grijsPixels > GRIJS_PIXELS) [grijzeStukken, grijsPixels, grijsFilter] = [new WeakMap(), 0, filter];
    [sx, sy, sw, sh] = [Math.round(sx), Math.round(sy), Math.max(1, Math.round(sw)), Math.max(1, Math.round(sh))];
    let per = grijzeStukken.get(bron);
    if (!per) grijzeStukken.set(bron, (per = new Map()));
    const sleutel = sx + ',' + sy + ',' + sw + ',' + sh + (doek ? ',' + bron.versie : '');
    let c = per.get(sleutel);
    if (!c) {
      const los = document.createElement('canvas');
      los.width = sw;
      los.height = sh;
      los.getContext('2d').drawImage(bron, sx, sy, sw, sh, 0, 0, sw, sh);
      c = document.createElement('canvas');
      c.width = sw;
      c.height = sh;
      const k = c.getContext('2d');
      k.filter = filter;
      k.drawImage(los, 0, 0);
      per.set(sleutel, c);
      grijsPixels += sw * sh;
    }
    return c;
  }

  // De nacht en de schemering (js/dag.js, T.lichtVan): een donkerblauwe laag over de wereld, lichter
  // rond de aanvoerder. Zo zie je 's nachts wat vlak bij je is, en niet wat verder weg gebeurt (Marcel,
  // 26 sep: "Omdat de camera de schout volgt, 'zie' je ook niet alles"). Rond zonsopgang en
  // zonsondergang een warme gloed. Alleen waar een kalender is (het gehucht). Spel.debug.geenNacht =
  // true zet hem uit, om te vergelijken.
  //
  // Met de videokaart (werklijst vraag 125, A) is het licht een lichtkaart: de kleur van het uur over het hele beeld,
  // met per lamp een warme plas erbij, en daarmee wordt de wereld vermenigvuldigd (js/gl.js, tekenLichtkaart). Zonder
  // videokaart blijft het de donkere laag van hiervoor (Marcel, 4 okt: "zonder videokaart wordt er bijna niet meer
  // gespeeld"), met de lampen als gloed erbij.
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
  // staat en een schaduw heeft, als silhouet scheef over de grond vanaf zijn onderrand, in de richting en de lengte die de
  // zon zegt (T.zonStand in js/dag.js). De silhouetten worden één vlak, zodat twee schaduwen over elkaar niet donkerder
  // zijn, en dat gaat over de grond, onder alles wat erop staat. Alleen met de videokaart, buiten, en met de spelregel
  // "Schaduwen" op "Met de zon". De plaatjes van het spel hebben geen schaduw op de grond (de bouwer snijdt ze zonder);
  // alleen onder een figuur ligt het ovaaltje van tekenWezen, als de plek waar hij staat. Sinds 18 okt (vraag 178, B3)
  // maakt js/gl.js de silhouetten uit de plaatjes van de lijst zelf (schaduwHier): hier komt het masker, en elk item
  // zegt bij het tekenen of het een schaduw werpt (ctx.werptSchaduw). Tot dan tekende dit de hele lijst een tweede keer.
  // Geeft true als er schaduwen zijn.
  function tekenZonneschaduw(ctx, S) {
    const L = T.LICHT_INSTELLINGEN;
    if (!L.zonneschaduw || !ctx.schaduwHier || !S.kalender || !metSprites()) return false;
    const z = T.zonStand(S.kalender.dag);
    if (z.sterkte <= 0.01) return false;
    // Een richting over de grond, op het scherm: een tegel is 64 breed en 32 hoog, dus de y gaat half mee.
    const sx = ((z.x - z.y) / Math.SQRT2) * z.lengte;
    const sy = ((z.x + z.y) / (2 * Math.SQRT2)) * z.lengte;
    const k = L.schaduw;
    return ctx.schaduwHier(sx, sy, k.sterkte * z.sterkte, [k.r / 255, k.g / 255, k.b / 255]);
  }

  // De lampen die nu branden, als plassen licht op het scherm: { x, y, rx, ry, k: [r, g, b] }, met k wat de lamp in het
  // midden erbij doet (vraag 125, A). Een vlam flakkert, elk in zijn eigen ritme uit zijn plek, op de klok van het scherm.
  // Hoe ver een lichtbron er op het scherm uitziet (tegels): zijn beeldStraal als hij er een heeft (de lantaarn die iemand
  // draagt, js/zien.js), anders zijn straal.
  const getekendeStraal = (b) => (b.beeldStraal != null ? b.beeldStraal : b.straal);
  function lichtenInBeeld(S, bw, bh) {
    const D = T.dorpHier(S);
    const nacht = nachtVan(S);
    if (!D || nacht <= 0.01) return [];
    const L = T.LICHT_INSTELLINGEN;
    const bronnen = T.lichtBronnen(D);
    const uit = [];
    for (const b of bronnen) {
      const q = opGrond(b.x, b.y);
      const x = Math.round(bw / 2) + (q.x - Math.round(S.camera.x)) * S.zoom;
      const y = Math.round(bh / 2) + (q.y - L.boven - Math.round(S.camera.y)) * S.zoom;
      const rx = Math.max(1, getekendeStraal(b) * L.breedte * S.zoom);
      const ry = rx * L.hoogte;
      if (x + rx < 0 || y + ry < 0 || x - rx > bw || y - ry > bh) continue;
      const kleur = L.kleuren[b.soort] || { r: 255, g: 255, b: 255 };
      // Flakkeren: twee golven door elkaar, met een fase uit de plek, zodat de lampen niet samen knipperen.
      const fase = ((Math.sin(b.x * 12.9898 + b.y * 78.233) * 43758.5453) % 1) * Math.PI * 2;
      const t = S.tijd * L.flakkerSnelheid;
      const golf = 0.6 * Math.sin(t * 7.1 + fase) + 0.4 * Math.sin(t * 12.7 + fase * 2.3);
      const flakker = b.soort === 'huis' ? L.flakkeren / 2 : b.soort === 'brand' ? L.flakkeren * 3 : L.flakkeren;
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
    // De aanvoerder op het scherm, met dezelfde omrekening als de camera in T.tekenScene; het licht
    // valt om zijn lijf, niet om zijn voeten.
    const h = S.dorp.aanvoerder;
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
      const r = Math.max(1, getekendeStraal(b) * 32 * S.zoom);
      const gloed = ctx.createRadialGradient(lx, ly, 0, lx, ly, r);
      gloed.addColorStop(0, `rgba(255, 186, 104, ${(b.sterkte * nacht).toFixed(3)})`);
      gloed.addColorStop(1, 'rgba(255, 186, 104, 0)');
      ctx.fillStyle = gloed;
      ctx.fillRect(lx - r, ly - r, 2 * r, 2 * r);
    }
  }

  // Het weer hier (js/weer.js): 'zon', 'wolken', 'regen' of 'sneeuw', of null binnen, in het gereedschap of zonder weer.
  function weerHier(S) {
    if (!S.wereld || (T.debug && T.debug.geenNacht)) return null;
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
  // beeld; de wind trekt ze een beetje schuin. Vlakken, geen lijnen: dat tekent de videokaart zelf (js/gl.js). Wat vaststaat
  // per druppel (vijf getallen uit beeldLot), één keer uitgerekend (lotjes), en met de videokaart gaan alle vlakjes in één
  // keer (vlakjes in js/gl.js; vraag 178, Marcel: "Regen en mist doen maar"): tot 18 okt per druppel vijf keer een sinus
  // en een fillRect, ver uitgezoomd 0,3 ms per beeld. Waar hij nu valt, blijft het beeld uitrekenen: in de shader is de
  // klok na een uur spelen te grof, en dan haperen de druppels.
  const lotjes = [[], [], [], [], [], []]; // per k van beeldLot(i, k): de waarde voor druppel i
  let neerslagVlakken = new Float64Array(4 * 1600); // Float64: dezelfde getallen als fillRect
  function lotVan(k, i) {
    const l = lotjes[k];
    while (l.length <= i) l.push(beeldLot(l.length, k));
    return l[i];
  }
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
    if (neerslagVlakken.length < n * 4) neerslagVlakken = new Float64Array(n * 4);
    const v = neerslagVlakken;
    lotVan(5, n);
    for (let k = 1; k < 5; k++) lotVan(k, n);
    for (let i = 0; i < n; i++) {
      const snel = (regen ? B.valRegen : B.valSneeuw) * (0.75 + 0.5 * lotjes[3][i]);
      const y = ((lotjes[2][i] * H + t * snel) % H) - lengte;
      const opzij = regen ? t * snel * B.wind : t * B.windSneeuw + Math.sin(t * 0.9 + i) * 10;
      const x = ((((lotjes[1][i] * W + opzij) % W) + W) % W) - 20;
      const m = regen ? 0 : lotjes[5][i] < 0.35 ? 4 : 3;
      v[4 * i] = x;
      v[4 * i + 1] = y;
      v[4 * i + 2] = regen ? 1.5 : m;
      v[4 * i + 3] = regen ? lengte * (0.7 + 0.6 * lotjes[4][i]) : m;
    }
    if (ctx.vlakjes) ctx.vlakjes(v, n);
    else for (let i = 0; i < n; i++) ctx.fillRect(v[4 * i], v[4 * i + 1], v[4 * i + 2], v[4 * i + 3]);
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
  // Hoeveel sneeuw er op tegel (x, y) kan liggen, met `hoeken` de soorten op zijn vier hoeken: [a, f], waarmee er bij
  // een laag sneeuw van `laag` zoveel ligt als sneeuwDek zegt, of null op water. De ruis rekent de processor (beeldLot
  // rekent in 64 bits); de grond op de kaart geeft a en f per tegel mee, en de kaart rekent zelf hoeveel (VERT_GROND in
  // js/gl.js, dezelfde som), zodat een andere stand sneeuw daar niets opnieuw maakt.
  function sneeuwVanTegel(x, y, hoeken) {
    const water = hoeken ? hoeken.filter((h) => T.isWaterGrond(h)).length : 0;
    if (water >= 2) return null;
    const pad = hoeken ? hoeken.filter((h) => h === 'zandpad').length / 4 : 0;
    return [(sneeuwRuis(x, y) - 0.5) * 0.6, (1 - 0.45 * pad) * (water ? 0.6 : 1)];
  }
  const sneeuwDek = (laag, t) => Math.max(0, Math.min(1, laag * 1.15 + t[0])) * t[1];
  // De sneeuw op één tegel (vanuit tekenVloeren).
  function tekenSneeuwOp(c, w, x, y, laag, hoeken) {
    if (laag <= 0 || !metSprites()) return;
    const t = sneeuwVanTegel(x, y, hoeken);
    if (!t) return;
    const stap = Math.round(sneeuwDek(laag, t) * SNEEUW_STAPPEN);
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
    const vlak = (kleur, x, y, b, h) => {
      c.fillStyle = kleur;
      c.fillRect(x, y, b, h);
    };
    for (const t of T.beekTegels(S.wereld)) {
      if (!inVak(vak, t.x, t.y) || !vak.binnen(t.x, t.y) || !T.staatDroog(D, t.x, t.y)) continue;
      beekStukjes(t, vlak);
    }
  }
  // De barsten en keien van de droge beek op tegel t (tekenDrogeBeek, en de grond op de kaart), als vlakjes
  // vlak(kleur, x, y, b, h) in hele pixels van de vlakte: op vaste plekken in het midden van de tegel (niet op de rand,
  // waar het gras begint).
  function beekStukjes(t, vlak) {
    const B = T.WEER_INSTELLINGEN.beeld;
    const p = opGrond(t.x, t.y);
    for (let i = 0; i < 9; i++) {
      const u = (beeldLot(t.x * 7 + i, t.y * 3) - 0.5) * 0.7;
      const v = (beeldLot(t.x * 5 + i, t.y * 11) - 0.5) * 0.7;
      const x = p.x + (u - v) * 64;
      const y = p.y + (u + v) * 32;
      if (i < 6) {
        // Een barst: een paar pixels schuin, langs de tegel.
        const l = 4 + Math.round(beeldLot(i, t.x) * 6);
        const op = beeldLot(t.y, i) < 0.5 ? 1 : -1;
        for (let s = 0; s < l; s += 2) vlak(B.barstKleur, Math.round(x + s), Math.round(y + (op * s) / 2), 2, 1);
      } else vlak(B.keiKleur, Math.round(x), Math.round(y), 3, 2);
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
          const g = T.grondOp(w, x, y);
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

  // De hoeken van grondtegel g op (x, y) als er een paadje of een droge beek over loopt, of null: dan is het de tegel
  // zelf (tekenVloeren, en de grond op de kaart). Een paadje (js/paden.js) maakt de hoeken die gras waren zand, met de
  // tegel uit hetzelfde vel die die hoeken heeft; een droge beek (js/weer.js) maakt de hoeken die water waren zandpad:
  // een bedding, met het gras eromheen.
  function hoekenVanGrond(g, x, y, paden, droog) {
    let metPad = paden && g ? T.hoekenMetPaden(paden.D, paden.zand, x, y, T.sprites.grondHoeken(g.vel, g.id)) : null;
    if (droog && g) metPad = T.hoekenDroog(droog, x, y, metPad || T.sprites.grondHoeken(g.vel, g.id)) || metPad;
    return metPad;
  }
  // De droge beek van het dorp hier, of null (tekenVloeren, de grond op de kaart).
  const droogVan = (paden) => (paden && paden.D.weer && paden.D.weer.beekDroog ? paden.D : null);

  function tekenVloeren(ctx, S, vak) {
    const w = S.wereld;
    const sp = metSprites();
    const paden = zandVan(S);
    const droog = droogVan(paden);
    const hoog = T.heeftHoogte(w);
    const sneeuw = sneeuwLaag(S);
    for (const [x, y] of tegelVolgorde(vak, hoog)) {
      if (!vak.binnen(x, y)) continue; // een stuk van de grond (tegelsVoorStuk)
      // Er ligt ook gras onder een boom of een huis (die tegel heet "muur"): het plaatje van de boom laat het gras
      // eromheen zien.
      if (!T.isZichtbaar(w, x, y)) continue;
      const p = opMaaiveld(x, y);
      const g = T.grondOp(w, x, y);
      const kleur = BUITENKLEUR[g && g.naam] || BUITENKLEUR.gras;
      let hex = kleur[(x + y) % 2];
      // De grond komt per tegel uit de stempel van vier bij vier, dus hier is tekenen niets meer dan één drawImage.
      const metPad = hoekenVanGrond(g, x, y, paden, droog);
      if (metPad && !sp && metPad.every((soort) => soort === 'zandpad')) hex = BUITENKLEUR.zandpad[(x + y) % 2];
      const deel = sp && g && ((metPad && T.sprites.grondMetHoeken(g.vel, metPad, x, y)) || T.sprites.buiten(g.vel, g.id));
      if (deel) {
        if (hoog) {
          tekenGrondMetLicht(ctx, w, deel, x, y);
          tekenWanden(ctx, w, x, y);
        } else T.sprites.teken(ctx, deel, p.x, p.y, 1);
        if (sneeuw) tekenSneeuwOp(ctx, w, x, y, sneeuw, metPad || T.sprites.grondHoeken(g.vel, g.id) || (g.naam ? [g.naam, g.naam, g.naam, g.naam] : null));
        continue;
      }
      const vlek = 0.95 + ((x * 73 + y * 151) % 11) / 100; // een tikje verschil per tegel
      T.ruit(ctx, p.x, p.y, 1);
      ctx.fillStyle = T.rgb(T.kleur(hex), vlek);
      ctx.fill();
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
  // De steen van het land, voor een stenen brug: die van de huizen in zijn stijl (gereedschap/pixelart/huizen.cjs,
  // STIJLEN): zandsteen bij oker en roze, anders veldsteen.
  function steenVanLand(w) {
    return w.stijl === 'oker' || w.stijl === 'roze' ? 'zandsteen' : 'veldsteen';
  }

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
  const SCHUIN_GROTER = 1.04; // zoveel groter op zijn vlak (ook de grond op de kaart, VERT_GROND)
  function tekenSchuineTegel(ctx, w, deel, x, y) {
    ctx.save();
    opTegelVlak(ctx, w, x, y);
    ctx.scale(SCHUIN_GROTER, SCHUIN_GROTER);
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

  // Wat per stuk van T.STUK uit de hoogte volgt (het licht hieronder, het net van de mist): eens gemaakt met `maak(w, x0,
  // y0)` (het stuk dat op tegel (x0, y0) begint, met zijn punten tot x0 + T.STUK), en kwam er een vlak stuk bij
  // (T.egaliseer), dan alleen opnieuw waar de glooiing anders werd (T.hoogtePlekkenSinds), tot `rand` tegels verder.
  // `cache` is een WeakMap per soort; zonder hoogte hoort het bij de kaart.
  function perStukVanDeHoogte(cache, w, sx, sy, rand, maak) {
    const Z = T.STUK;
    const sleutel = w.hoogte || w;
    const versie = w.hoogte ? w.hoogte.versie || 0 : 0;
    let c = cache.get(sleutel);
    if (c && c.versie !== versie) {
      const plekken = T.hoogtePlekkenSinds(w, c.versie);
      if (!plekken) c = null;
      else {
        for (const p of plekken) {
          for (const [n, l] of c.stukken) {
            if (p.x1 - rand <= l.x0 + Z && p.x2 + rand >= l.x0 - 1 && p.y1 - rand <= l.y0 + Z && p.y2 + rand >= l.y0 - 1) c.stukken.delete(n);
          }
        }
        c.versie = versie;
      }
    }
    if (!c) cache.set(sleutel, (c = { versie, stukken: new Map() }));
    const n = (sx + 1024) * 4096 + (sy + 1024);
    let uit = c.stukken.get(n);
    if (!uit) c.stukken.set(n, (uit = maak(w, sx * Z, sy * Z)));
    return uit;
  }

  // Het licht op de grond (vraag 121): lichter naar de zon, donkerder ervan af, zacht verlopend over elke tegel. Per
  // stuk van T.STUK (64) een klein plaatje met een pixel per hoekpunt (T.lichtOpHoekpunt), 65 bij 65, gemaakt als de grond
  // van dat stuk voor het eerst getekend wordt; per tegel komt het stukje tussen zijn vier hoekpunten vloeiend uitgerekt
  // over de tegel (zoals de grond zelf op het vlak van de tegel). Zo verloopt het licht van tegel tot tegel zonder
  // trapjes, ook over de rand van een stuk (de hoekpunten op de rand staan in allebei). Kwam er een vlak stuk bij
  // (T.egaliseer), dan alleen de plaatjes waar de glooiing anders werd, met de twee tegels die het licht verder kijkt
  // (T.hoogtePlekkenSinds). Tot vraag 174, stap b1 was het één plaatje om de kaart, helemaal opnieuw bij elk gebouw, en
  // daarbuiten geen licht.
  const lichtStukken = new WeakMap();
  const lichtStukVan = (w, sx, sy) => perStukVanDeHoogte(lichtStukken, w, sx, sy, 2, maakLichtStuk);
  function maakLichtStuk(w, x0, y0) {
    const Z = T.STUK;
    const canvas = document.createElement('canvas');
    canvas.width = Z + 1;
    canvas.height = Z + 1;
    const k = canvas.getContext('2d');
    const beeld = k.createImageData(canvas.width, canvas.height);
    for (let py = 0; py < canvas.height; py++) {
      for (let px = 0; px < canvas.width; px++) {
        const f = T.lichtOpHoekpunt(w, x0 + px, y0 + py);
        const o = (py * canvas.width + px) * 4;
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
    return { canvas, x0, y0 };
  }
  // Een grondtegel op een kaart met hoogte: eerst het licht in de tegel zelf (op een kladje: de tegel, en daarop het licht,
  // alleen waar de tegel is), dan de belichte tegel op het vlak van de tegel. Zo valt er tussen twee tegels geen naad
  // in het licht: ze overlappen een tikje, maar dat is grond over grond.
  let tegelKlad = null;
  // Het licht in de tegel zelf bakken (een kladje per tegel) gaf geen naadjes, maar maakte het tekenen van de grond tien
  // keer zo duur (gemeten op 7 okt); het licht als laag over de tegel laat een haarfijn naadje, en kost één plaatje.
  const lichtInDeTegel = false;
  function tekenGrondMetLicht(ctx, w, deel, x, y) {
    const licht = lichtStukVan(w, Math.floor(x / T.STUK), Math.floor(y / T.STUK));
    const [lx, ly] = [x - licht.x0 + 0.5, y - licht.y0 + 0.5]; // tussen de pixels van zijn vier hoekpunten
    if (!lichtInDeTegel) {
      tekenSchuineTegel(ctx, w, deel, x, y);
      ctx.save();
      opTegelVlak(ctx, w, x, y);
      ctx.transform(32, 16, -32, 16, 0, 0); // van de wereld (een tegel is 1 bij 1) naar het scherm
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(licht.canvas, lx, ly, 1, 1, -0.5, -0.5, 1, 1);
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
    k.drawImage(licht.canvas, lx, ly, 1, 1, -0.5, -0.5, 1, 1);
    k.restore();
    k.globalCompositeOperation = 'source-over';
    ctx.save();
    opTegelVlak(ctx, w, x, y);
    ctx.scale(SCHUIN_GROTER, SCHUIN_GROTER);
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
      const { u0, hA, hB } = wandMaten(wand);
      const ta = [u0, 0];
      const tb = [u0 + 32, 0];
      const tc = [u0 + 32, hB];
      const td = [u0, hA];
      driehoekUitPlaatje(ctx, tex, 0, 0, WAND_B, WAND_H, [ta, tb, tc], [A, B, C]);
      driehoekUitPlaatje(ctx, tex, 0, 0, WAND_B, WAND_H, [ta, tc, td], [A, C, Dp]);
    }
  }

  // Waar wand `wand` in zijn textuur begint (u0), en hoe ver hij aan zijn begin en zijn eind naar onder loopt (hA, hB):
  // voor tekenWanden, en de grond op de kaart (zetWanden).
  function wandMaten(wand) {
    const u0 = (Math.round((wand.van[0] * 7 + wand.van[1] * 13) * 32) % (WAND_B - 40) + (WAND_B - 40)) % (WAND_B - 40);
    const hA = Math.max(0.01, Math.min(WAND_H - 1, wand.boven[0] - wand.onder[0]));
    const hB = Math.max(0.01, Math.min(WAND_H - 1, wand.boven[1] - wand.onder[1]));
    return { u0, hA, hB };
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
    c.versie = 1; // eens getekend, blijft hij zo: dan kan hij op de stapel (js/gl.js)
    wandTexturen.set(sl, c);
    return c;
  }

  // Het bouwbereik van het lege begin (js/begin.js; vraag 152, 1d), zolang het bouwmenu open is of je bouwt: een zachte
  // gloed op de grond waar je kunt bouwen, die in de laatste twee tegels uitdooft. Geen lijn (Marcel, 11 okt: "Ik wil geen
  // 'grens'"). Per sterkte één pad, zodat het duizenden tegels in drie keer vult.
  const BEREIK_GLOED = [0.07, 0.14, 0.21];
  function tekenBouwBereik(ctx, S, vak) {
    if (!(S.bouwSoort || S.bouwMenuOpen)) return;
    const B = T.bouwBereikVan(S.dorp); // bouwen doe je in je eigen dorp (het bouwmenu, js/hud.js)
    if (!B) return;
    const paden = BEREIK_GLOED.map(() => new Path2D());
    const x0 = Math.max(B.x0, vak.x0);
    const y0 = Math.max(B.y0, vak.y0);
    const x1 = Math.min(B.x0 + B.b - 1, vak.x1);
    const y1 = Math.min(B.y0 + B.h - 1, vak.y1);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const rand = B.straal - T.afstandInBouwBereik(B, x, y);
        if (!(rand >= 0)) continue;
        const p = opGrond(x, y);
        const pad = paden[rand < 1 ? 0 : rand < 2 ? 1 : 2];
        pad.moveTo(p.x, p.y - T.HH);
        pad.lineTo(p.x + T.HB, p.y);
        pad.lineTo(p.x, p.y + T.HH);
        pad.lineTo(p.x - T.HB, p.y);
        pad.closePath();
      }
    }
    BEREIK_GLOED.forEach((a, i) => {
      ctx.fillStyle = `rgba(240, 225, 170, ${a})`;
      ctx.fill(paden[i]);
    });
  }

  // De marktplek op het plein (js/markt.js; ronde 2 van het snoeien, stap 6; Marcel, 12 okt: "In het bouwmenu"), zolang
  // het bouwmenu open is of je bouwt, en er nog geen markt staat: in zacht goud, zoals een plek waar iets komt, zodat je
  // ziet waar de kramen komen en waarom een huis er niet tegenaan mag. Met de markt in de hand is hij het gebouw aan de
  // muis (tekenBouwSpook).
  function tekenMarktPlek(ctx, S) {
    const D = S.dorp;
    if (!(S.bouwSoort || S.bouwMenuOpen) || S.bouwSoort === 'markt' || !D || D.gebouwen.some((g) => g.soort === 'markt')) return;
    ctx.fillStyle = 'rgba(226, 182, 74, 0.38)';
    for (const t of T.marktTegels(D)) {
      const p = opGrond(t.x, t.y);
      T.ruit(ctx, p.x, p.y, 0.94);
      ctx.fill();
    }
  }

  // Een bouwplaats van het lege begin die de bouwers nog rooien (js/bouwen.js): het gebouw staat nog niet op de kaart, dus
  // ligt zijn voet er in goud, zoals de plek van een verzoek, zodat je ziet waar het komt.
  function tekenRooiPlaatsen(ctx, S) {
    const D = S.dorp;
    if (!D || !D.begin) return;
    ctx.fillStyle = 'rgba(226, 182, 74, 0.3)';
    // en een weg die de bouwers nog leggen (js/wegen.js): de tegels die er nog niet liggen
    for (const weg of D.wegwerk || []) {
      for (const t of T.wegNogTeDoen(weg)) {
        const p = opGrond(t.x, t.y);
        T.ruit(ctx, p.x, p.y, 0.94);
        ctx.fill();
      }
    }
    for (const g of D.gebouwen) {
      // ook een veld dat de bouwers nog ploegen of planten (js/boerderij.js): het heeft geen tekening tot het land is
      if (!g.bouw || !(g.wachtOpRooien || T.isVeldSoort(g.soort))) continue;
      const r = T.voetVanGebouw(g);
      for (let dy = 0; dy < r.h; dy++) {
        for (let dx = 0; dx < r.b; dx++) {
          const p = opGrond(r.x + dx, r.y + dy);
          T.ruit(ctx, p.x, p.y, 0.94);
          ctx.fill();
        }
      }
    }
  }

  // Het gebouw dat de speler in de hand heeft (S.bouwSoort, het bouwmenu in js/hud.js): zijn hele
  // voet licht op, groen als T.gebouwPast hem daar toestaat, anders rood — dezelfde twee kleuren
  // als tekenMarkeringen voor het looppad gebruikt (licht/rood hieronder).
  function tekenBouwSpook(ctx, S) {
    if (!S.bouwSoort || !S.bouwHover) return;
    // De voet van de tekening die dit gebouw echt krijgt (T.volgendeTekening, js/gebouwen.js), of de rechthoek van het veld
    // dat je trekt (js/main.js, js/boerderij.js).
    const veld = S.bouwHover.veld;
    ctx.fillStyle = S.bouwHover.ok ? 'rgba(134, 196, 111, 0.45)' : 'rgba(224, 96, 79, 0.45)';
    // Een weg (js/wegen.js): zijn tegels; afbreken (js/afbreken.js): wat een klik afbreekt.
    const plekken = S.bouwHover.plekken || (S.bouwHover.afbreken && S.bouwHover.afbreken.plekken);
    if (plekken || S.bouwSoort === 'afbreken') {
      if (S.bouwSoort === 'afbreken') ctx.fillStyle = S.bouwHover.ok ? 'rgba(224, 96, 79, 0.5)' : 'rgba(150, 150, 150, 0.35)';
      for (const t of plekken || [{ x: S.bouwHover.x, y: S.bouwHover.y }]) {
        const p = opGrond(t.x, t.y);
        T.ruit(ctx, p.x, p.y, 0.94);
        ctx.fill();
      }
      return;
    }
    // De markt komt op zijn plek op het plein, waar je ook wijst (js/markt.js): die plek licht op.
    if (S.bouwSoort === 'markt') {
      for (const t of T.marktTegels(S.dorp)) {
        const p = opGrond(t.x, t.y);
        T.ruit(ctx, p.x, p.y, 0.94);
        ctx.fill();
      }
      return;
    }
    // met de deur naar de kant die je met R koos (S.bouwHover.tekening, js/main.js): dan draait de voet mee
    const voet = veld || T.gebouwVoet(S.bouwSoort, S.bouwHover.tekening || T.volgendeTekening(S.dorp, S.bouwSoort));
    if (!voet) return;
    for (let dy = 0; dy < voet.h; dy++) {
      for (let dx = 0; dx < voet.b; dx++) {
        const p = opGrond(S.bouwHover.x + dx, S.bouwHover.y + dy);
        T.ruit(ctx, p.x, p.y, 0.94);
        ctx.fill();
      }
    }
  }

  // Het gebouw in de hand zelf (vraag 179, A1; Marcel, 18 okt: "Ik wil een "ghost" zien van het gebouw dat ik wil
  // plaatsen"): de tekening die er echt komt (S.bouwHover.tekening, T.bouwTekening in js/gebouwen.js: in de stijl en met
  // het dak van nu, en de deur naar de kant van R), half doorzichtig boven op alles, zodat geen boom of huis hem verbergt;
  // past hij niet, dan in het rood (T.sprites.inKleur). Na de lijst: de voet legt tekenBouwSpook eronder. Zolang zijn
  // bestand nog laadt (js/sprites.js), alleen de voet; de markt heeft geen tekening aan de muis, wel zijn plek.
  const GHOST = { alpha: 0.6, rood: 'rgba(224, 96, 79, 0.5)' };
  function tekenBouwGhost(ctx, S) {
    const h = S.bouwHover;
    if (!S.bouwSoort || S.bouwSoort === 'markt' || !h || !h.tekening || !metSprites()) return;
    const opz = T.opzoekTegelNaam(h.tekening);
    const stuk = opz && T.sprites.buiten(opz.vel, opz.id);
    if (!stuk) return;
    const p = opGrond(h.x, h.y);
    ctx.globalAlpha = GHOST.alpha;
    T.sprites.teken(ctx, h.ok ? stuk : T.sprites.inKleur(stuk, GHOST.rood), p.x, p.y);
    ctx.globalAlpha = 1;
  }

  // Waar je mannen gaan staan, na een rechtsklik (S.stuurPlekken, js/main.js; vraag 170, stap 3, E1): hun plekken in hun
  // vorm in groen op de grond, zoals een weg in de hand, en in een halve seconde vervagen ze.
  function tekenStuurPlekken(ctx, S) {
    const s = S.stuurPlekken;
    if (!s) return;
    const over = s.tot - S.tijd;
    if (over <= 0) {
      S.stuurPlekken = null;
      return;
    }
    ctx.fillStyle = `rgba(134, 196, 111, ${(0.5 * Math.min(1, over / T.KIEZEN_INSTELLINGEN.formatie.groen)).toFixed(3)})`;
    for (const t of s.plekken) {
      const p = opGrond(t.x, t.y);
      T.ruit(ctx, p.x, p.y, 0.94);
      ctx.fill();
    }
  }

  // Waar je met rechts klikte (S.klikTeken, js/main.js; vraag 191, S3): een ring op de grond die in `teken` seconden
  // krimpt en vervaagt, licht bij erheen en rood bij een vijand, zodat je meteen ziet dat de klik aankwam.
  function tekenKlikTeken(ctx, S) {
    const k = S.klikTeken;
    if (!k) return;
    const over = (k.tot - S.tijd) / T.KIEZEN_INSTELLINGEN.teken;
    if (!(over > 0)) {
      S.klikTeken = null;
      return;
    }
    const p = opGrond(k.x, k.y);
    const r = 8 + 14 * over;
    ctx.strokeStyle = k.aanval ? `rgba(224, 96, 79, ${over.toFixed(3)})` : `rgba(250, 240, 210, ${over.toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r, r / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function tekenMarkeringen(ctx, S) {
    const h = S.handeling;
    const licht = 'rgba(250, 240, 210, 0.9)';
    const rood = 'rgba(224, 96, 79, 0.9)';

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
    if (!doel || S.modus !== 'verkennen') return;
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

  // Wat buiten op de grond staat en geen eigen tekening met vlakken heeft: een boom is een stam
  // met een kruin, een gebouw een blok zo groot als zijn voet. Genoeg om te zien waar je niet
  // langs kunt, en om met Spel.debug.vlakken te kunnen vergelijken. Een boom of een struik zegt het zelf (`vlak` in
  // T.BOMEN, js/wereld.js).
  const BUITENVLAK = {
    varen: ['#476b2c', 10, 0.26], grasPol: ['#4e7430', 8, 0.22], hoogGras: ['#577d33', 14, 0.22],
    bloemen: ['#6d8a3c', 8, 0.24], paddenstoelen: ['#9a7250', 6, 0.16], boomstronk: ['#6a5238', 12, 0.26],
    rots: ['#77736c', 20, 0.30], kleineRots: ['#7d7973', 10, 0.20],
    klaproos: ['#b8402c', 10, 0.2], korenbloem: ['#4a6cb0', 10, 0.2], brandnetel: ['#3f6a2a', 14, 0.24],
    heide: ['#7a4f8a', 6, 0.26], distel: ['#7c5a8c', 14, 0.18], lisdodde: ['#55743a', 22, 0.2], waterlelie: ['#3f6a34', 2, 0.3],
  };

  function tekenBuitenVlak(ctx, v, helder) {
    const p = opGrond(v.x, v.y);
    const b = v.beslaat || [1, 1];
    const vorm = BUITENVLAK[v.soort] || (T.BOMEN[v.soort] && T.BOMEN[v.soort].vlak);
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
  // de standen van een voorwerp. Zie ontwerp/beeld.md, "Eén wind door alles heen".
  T.windWaarde = function (tijd) {
    const golf = Math.sin(tijd * 0.31) * 0.4 + Math.sin(tijd * 0.13 + 1.3) * 0.3;
    const vlaag = Math.max(0, Math.sin(tijd * 0.085 + 0.7)) ** 4 * 0.5;
    return Math.max(-1, Math.min(1, golf + vlaag));
  };

  function windVoorInstantie(S, v) {
    const fase = ((v.x * 137 + v.y * 251) % 97) / 97 * 23;
    return T.windWaarde(S.tijd + fase);
  }

  // De ruïne van een afgebrand huis (js/brand.js; vraag 144, 3; Marcel: "huizen die 'afgefikt' zijn als art"): de bouwfase
  // van zijn tekening zonder dak (puinFase, de balken), zwart geblakerd; een tekening zonder bouwfasen wordt zelf zwart.
  // Eén keer gebakken per tekening.
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

  // Wat een huis laat zien dat brandt of afbrandde (vraag 144, 3): de fase van het afbranden van zijn tekening
  // (T.brandfaseVan, js/brand.js; T.sprites.brandfase), met de variant van ingestort naar zijn plek; zonder fasen (een
  // gebouw dat niet van de huizenbouwer is) afgebrand de ruïne van vroeger (puinVan), en brandend het huis zelf (null).
  function brandBeeldVan(S, v) {
    const D = T.dorpHier(S);
    const g = D && D.gebouwen && D.gebouwen.find((x) => x.voorwerp === v);
    const fase = g && T.brandfaseVan(D, g);
    if (fase && v.tekeningNaam && T.BRANDFASEN && T.BRANDFASEN.fasen[v.tekeningNaam]) return T.sprites.brandfase(v.tekeningNaam, fase, g.x + g.y);
    return v.brand === 'puin' ? puinVan(v) : null;
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

  // Het water dat leeft (T.waterOp, js/kleinleven.js; vraag 145, 3), op de grond, vóór alles wat erop staat: een beek
  // stroomt, met lichte rimpels die met de stroom meegaan en aan de randen van een tegel weer opkomen; stil water glinstert
  // hier en daar even. Een beek die droog staat (js/weer.js), stroomt niet.
  function tekenWaterLeven(ctx, S, w, vak) {
    if (!T.KLEIN_LEVEN_INSTELLINGEN.aan || !metSprites()) return;
    const B = T.KLEIN_LEVEN_INSTELLINGEN.water;
    const D = T.dorpHier(S);
    const t = S.tijd || 0;
    for (const { x, y, s } of waterIn(w, vak)) {
      const k = y * 977 + x;
      if (s.stil) {
        // een glinstering die opkomt en weer gaat, op een vaste plek per tegel
        for (let i = 0; i < Math.ceil(B.glinster * 2); i++) {
          const fel = Math.max(0, Math.sin(t * B.knipper * 6.283 + beeldLot(k + i, 61) * 40)) ** 6;
          if (fel < 0.05 || beeldLot(k + i, 62) > B.glinster) continue;
          const p = opMaaiveld(x - 0.5 + beeldLot(k + i, 63), y - 0.5 + beeldLot(k + i, 64));
          ctx.fillStyle = `rgba(230, 244, 255, ${(0.75 * fel).toFixed(3)})`;
          ctx.fillRect(Math.round(p.x) - 2, Math.round(p.y), 5, 1);
          ctx.fillRect(Math.round(p.x), Math.round(p.y) - 1, 1, 3);
        }
        continue;
      }
      if (D && T.staatDroog(D, x, y)) continue;
      // rimpels die met de stroom meedrijven: elke rimpel een eigen dwarsplek, en zijn plek langs de stroom schuift
      for (let i = 0; i < B.rimpels; i++) {
        const langs = (t * B.snel + beeldLot(k + i, 65)) % 1;
        const dwars = 0.2 + 0.6 * beeldLot(k + i, 66);
        const u = s.dx ? (s.dx > 0 ? langs : 1 - langs) : dwars;
        const v = s.dy ? (s.dy > 0 ? langs : 1 - langs) : dwars;
        const p = opMaaiveld(x - 0.5 + u, y - 0.5 + v);
        const a = 0.5 * Math.sin(langs * Math.PI); // komt op en vervaagt binnen de tegel
        ctx.fillStyle = `rgba(214, 236, 250, ${a.toFixed(3)})`;
        // een streepje dwars op de stroom: op het scherm schuin, zoals de tegel ligt
        const lang = 5;
        const sx = s.dx ? -1 : 1;
        for (let j = -lang / 2; j < lang / 2; j++) ctx.fillRect(Math.round(p.x + j * 2 * sx * 0.5), Math.round(p.y + j * 0.5), 2, 1);
      }
    }
  }
  // De tegels met water in vak ({ x, y, s: T.waterOp }), rij voor rij: per kaart onthouden zolang het vak, de kaart en
  // het open land dezelfde zijn (alleen scherm). Ver uitgezoomd liep het water elk beeld zo'n 10.000 tegels af (17 okt,
  // een profiel van Marcel); of een beek droog staat, vraagt tekenWaterLeven wel elk beeld. Het eiland verandert zijn
  // water niet als de kaart verandert (T.waterOp, js/kleinleven.js), dus daar telt de kaart niet mee.
  const waterInVak = new WeakMap();
  function waterIn(w, vak) {
    const kaartvak = T.kaartGrens(w);
    const x0 = Math.max(kaartvak.x, vak.x0);
    const y0 = Math.max(kaartvak.y, vak.y0);
    const x1 = Math.min(kaartvak.x + kaartvak.b - 1, vak.x1);
    const y1 = Math.min(kaartvak.y + kaartvak.h - 1, vak.y1);
    const sleutel = `${x0},${y0},${x1},${y1},${T.opEiland(w) ? '' : T.kaartVersie(w)},${T.openGrootte(w)}`;
    const oud = waterInVak.get(w);
    if (oud && oud.sleutel === sleutel) return oud.tegels;
    const tegels = [];
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const s = T.waterOp(w, x, y);
        if (s) tegels.push({ x, y, s });
      }
    }
    waterInVak.set(w, { sleutel, tegels });
    return tegels;
  }

  // De rook uit de schoorsteen van een huis waar iemand thuis is (T.rookUitHuizen, js/kleinleven.js; vraag 145, 3), vóór
  // de nacht: pluimpjes die opstijgen, groter en doorzichtiger worden en met de wind meedrijven. Uit de top van de
  // schoorsteen, zoals de tekening zegt (`schoorsteen` in tegels.js, vanaf de hoek van de tekening, net als de ramen), of
  // bij een hut, die er geen heeft, dun en breed uit de nok (`nok`). Een tekening zonder die plek rookt niet: liever geen
  // rook dan rook uit een muur.
  function tekenSchoorsteenRook(ctx, S) {
    const D = T.dorpHier(S);
    if (!D || !metSprites()) return;
    const B = T.KLEIN_LEVEN_INSTELLINGEN.rookBeeld;
    const t = S.tijd || 0;
    for (const r of T.rookUitHuizen(D)) {
      const g = r.g;
      const opz = g.tekening && T.opzoekTegelNaam(g.tekening);
      const eig = opz && opz.eig;
      const plek = eig && (eig.schoorsteen || eig.nok);
      if (!plek) continue;
      const nok = !eig.schoorsteen;
      const hoek = opGrond(g.x, g.y);
      const bron = { x: hoek.x + plek[0], y: hoek.y + plek[1] };
      const voet = T.voetVanGebouw(g);
      const breed = nok ? (voet.b + voet.h) * 6 : 4;
      const n = Math.round(B.pluimen * r.dik);
      const zaad = g.x * 31 + g.y * 17;
      for (let i = 0; i < n; i++) {
        const k = zaad + i;
        const leeftijd = (t * (0.1 + 0.05 * beeldLot(k, 91)) + beeldLot(k, 92)) % 1;
        const x = bron.x + (beeldLot(k, 93) - 0.5) * breed + leeftijd ** 1.6 * B.wind + Math.sin(t * 0.8 + k) * 3 * leeftijd;
        const y = bron.y - leeftijd * B.hoog * (nok ? 0.6 : 1);
        const m = Math.round(B.klein + (B.groot - B.klein) * leeftijd);
        const a = B.dicht * r.dik * (1 - leeftijd) * Math.min(1, leeftijd * 6);
        const c = Math.round(205 - 40 * leeftijd);
        ctx.fillStyle = `rgba(${c}, ${c}, ${c + 4}, ${a.toFixed(3)})`;
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

  // Een gebouw op T.TEKENEN_INSTELLINGEN.gebouwMaat (de proef van vraag 183, 2a1): kleiner rond het midden van zijn voet
  // (v.beslaat, vanaf zijn tegel achteraan), net als T.sprites.teken; op 1, en voor wat geen voet heeft, gewoon dat.
  function tekenOpMaat(ctx, deel, p, v, helder) {
    const f = T.TEKENEN_INSTELLINGEN.gebouwMaat;
    if (f === 1 || !v.beslaat) return T.sprites.teken(ctx, deel, p.x, p.y, helder);
    const db = (v.beslaat[0] - 1) / 2;
    const dh = (v.beslaat[1] - 1) / 2;
    const mx = p.x + (db - dh) * T.HB;
    const my = p.y + (db + dh) * T.HH;
    const h = helder == null ? 1 : helder;
    if (h < 1) {
      ctx.save();
      ctx.filter = `brightness(${h})`;
    }
    ctx.drawImage(deel.beeld, deel.sx, deel.sy, deel.b, deel.h, Math.round(mx + (p.x - deel.ax - mx) * f),
      Math.round(my + (p.y - deel.ay - my) * f), Math.round(deel.b * f), Math.round(deel.h * f));
    if (h < 1) ctx.restore();
  }

  // Staan de gebouwen plat (F, js/main.js; vraag 176, 4b)? Niet in een scène (js/regie.js): die toont het dorp zoals het is.
  const gebouwenPlat = (S) => !!S.gebouwenPlat && S.modus !== 'scene';

  // gaten: de kijkgaten die na dit voorwerp komen (voorsteKijkgaten), of niets.
  function tekenVoorwerp(ctx, S, v, helder, gaten) {
    const p = plekVan(v);
    // Buiten komt het plaatje uit de tegelvellen (tegels/, zie js/sprites.js): een boom, een
    // struik, een gebouw. Het anker van de cel is de voet, dus hij valt precies op het
    // midden van zijn eigen tegel.
    if (v.vel) {
      // De gebouwen plat (F, js/main.js; vraag 176, 4b): een huis van de huizenbouwer tekent zijn platte tekening, op zijn
      // plek en in zijn volgorde (T.sprites.platVan), zonder doorkijk en sneeuw op het dak (de ramen en de rook slaat het
      // beeld zelf over, bij brandendeRamen en tekenSchoorsteenRook); een bouwplaats is zijn fundering, de eerste fase. Wat
      // brandt, blijft zoals het is: dat moet je zien. Tot de platte tekening er is, staat er het gewone huis.
      const plat = gebouwenPlat(S) && metSprites();
      // In aanbouw (js/gebouwen.js, T.plaatsGebouw): heeft dit gebouw fases in tegels/bouwfasen.png
      // (T.bouwFaseIndex kiest welke, op hoe ver de bouwtijd is), dan die — anders (kapel,
      // watermolen, put, ...) net als voorheen gewoon bleker tot hij klaar is, zonder er een
      // tweede tekening voor nodig te hebben.
      const fase = v.inAanbouw && v.tekeningNaam && T.bouwFaseIndex && metSprites() && T.sprites.bouwfase
        && T.sprites.bouwfase(v.tekeningNaam, plat ? 0 : T.bouwFaseIndex(S.kalender ? S.kalender.dag : 0, v.klaarOp, v.bouwtijd, v.vanFase || 0, v.voortgang));
      // Wat brandt of afbrandde (js/brand.js): de fase van het afbranden (brandBeeldVan hieronder).
      const puin = v.brand && metSprites() ? brandBeeldVan(S, v) : null;
      const platStuk = plat && !puin && !fase && v.vel === 'huizen' ? T.sprites.platVan(v) : null;
      // doorkijk: staat er iemand achter die je hoort te zien (js/doorkijk.js)? Dan gaat het voorwerp
      // om de andere pixel open (het raster), of het blijft staan en krijgt na het tekenen een
      // kijkgat op wie erachter staat (het venster): wat de spelregels zeggen. Plat is er niets achter te zien.
      const doorkijk = platStuk ? 0 : v.doorkijk || 0;
      const alpha = v.inAanbouw && !fase ? 0.45 : 1;
      if (alpha <= 0.02) return;
      if (alpha < 1) ctx.globalAlpha = alpha;
      const plaatjes = metSprites() && T.sprites.buitenAan;
      let stuk = puin || fase || platStuk || (plaatjes && T.sprites.buitenVan(v, windVoorInstantie(S, v)));
      // Een huis of een gebouw heeft een eigen bestand, dat pas laadt als hij op de kaart staat (js/sprites.js; vraag
      // 114, stap 1). Laadt het nog, dan wat er daarnet stond (een huis dat net doorgroeide), en anders niets: een vlak
      // alleen als het plaatje echt ontbreekt.
      const wacht = !stuk && plaatjes && T.sprites.wachtOp(v.vel, v.id);
      if (wacht) stuk = vorigBeeld.get(v) || null;
      else if (stuk && (T.TEGELS[v.vel] || {}).perTekening) vorigBeeld.set(v, stuk);
      const raster = stuk && doorkijk > 0.02 && T.DOORKIJK_INSTELLINGEN.manier === 'raster';
      if (raster) T.tekenGerasterd(ctx, stuk, p.x, p.y, helder, doorkijk);
      else if (stuk) tekenOpMaat(ctx, stuk, p, v, helder);
      else if (!wacht) tekenBuitenVlak(ctx, v, helder);
      // De sneeuw op het dak (vraag 144, 4b): de laag die bij de sneeuw op de grond past, over het huis heen; niet op wat
      // brandt of in aanbouw is. Een oud huis draagt de sneeuw van zijn jonge tekening (dezelfde vorm).
      const dakSneeuw = stuk && !puin && !fase && !platStuk && !v.brand && v.vel === 'huizen' ? T.dakSneeuwLaag(sneeuwLaag(S)) : -1;
      const sneeuwStuk = dakSneeuw >= 0 && T.sprites.daksneeuw(T.jongeTekeningVan(v), dakSneeuw);
      if (sneeuwStuk && raster) T.tekenGerasterd(ctx, sneeuwStuk, p.x, p.y, helder, doorkijk);
      else if (sneeuwStuk) tekenOpMaat(ctx, sneeuwStuk, p, v, helder);
      if (alpha < 1) ctx.globalAlpha = 1;
      if (!raster && gaten && !platStuk) {
        // Het kijkgat werpt geen schaduw (js/gl.js, werptSchaduw): wie erachter staat, heeft zijn eigen.
        const werpt = ctx.werptSchaduw;
        if (werpt) ctx.werptSchaduw = false;
        for (const { e, sterkte } of gaten) T.tekenKijkgat(ctx, S, e, sterkte, v);
        if (werpt) ctx.werptSchaduw = true;
      }
      return;
    }
    if (v.soort === 'tent') {
      // Een tent of een afdak in het kamp van het lege begin (js/begin.js; werklijst vraag 152), of een tent van een
      // roverskamp (js/rovers.js), met zijn opening naar het vuur. Zonder kunst: een blok linnen, of van takken.
      const tent = metSprites() && T.sprites.kamp(v.vorm, v.richting);
      if (tent) T.sprites.teken(ctx, tent, p.x, p.y, helder);
      else T.blok(ctx, p.x, p.y, 0.4, 0.4, 24, v.vorm === 'afdak' ? '#6b4f33' : '#d8cfae', { helder });
      return;
    }
    // De tegels van de palissade om een rovershol houden alleen tegen (js/rovers.js, zetPalissade); de palen zelf staan elk
    // op hun eigen plek op de cirkel (palissadeInLijst).
    if (v.soort === 'palissade') return;
    if (v.soort === 'kampvuur') {
      // Het kampvuur in het midden van het kamp (js/begin.js): het brandt als de mensen op zijn, en smeult als ze werken of
      // slapen (T.kampvuurStand); dat van een roverskamp (js/rovers.js) brandt als het donker is. Zonder kunst: een kring
      // stenen met een gloed.
      const D = T.dorpHier(S);
      const stand = v.kamp != null ? T.roverskampVuur(S.kalender.dag, T.kampVan(S.wereld, v)) : (D && T.kampvuurStand(D)) || 'uit';
      const vuur = metSprites() && T.sprites.kampvuur(stand, S.tijd);
      if (vuur) T.sprites.teken(ctx, vuur, p.x, p.y, helder);
      else T.blok(ctx, p.x, p.y, 0.3, 0.3, 4, stand === 'brandt' ? '#e0782a' : '#6f6a62', { helder });
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
      // De meiboom (js/versiering.js): een berk met een kroon, een krans en linten. Zonder kunst: een witte paal met een
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
    if (v.soort === 'kerstboom') {
      // De kerstboom (js/versiering.js): een spar met appels, strosterren, kaarsjes en een ster. Zonder kunst: een groene
      // kegel van drie blokken.
      const boom = metSprites() && T.sprites.kerstboom();
      if (boom) {
        T.sprites.teken(ctx, boom, p.x, p.y, helder);
        return;
      }
      T.blok(ctx, p.x, p.y, 0.06, 0.06, 20, '#5a3a22', { helder });
      [[0.4, 20], [0.3, 60], [0.18, 100]].forEach(([r, basis]) => T.blok(ctx, p.x, p.y, r, r, 50, '#2f5a2a', { helder, basis }));
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
  }

  const TEKENAARS = {
    // Een mens: iedereen die geen eigen vlaktekening heeft (de aanvoerder, een boer, een dorpeling).
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
  // ligt een halve tegel achter de tegel ervoor, in de gevel. Zonder deur (de aanvoerder die gaat slapen)
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

  // Het kleine leven (vraag 145, 3; js/kleinleven.js): de kippen op het erf van een boerderij en de honden bij hun baas,
  // in de tekenlijst zoals een wezen. Alleen beeld: waar ze zijn, komt uit de tijd en het lot (de kippen), of loopt hier
  // achter de baas aan (de honden, in `honden`, niet in Spel.S: na het laden staat een hond weer naast zijn baas).
  const honden = new WeakMap();
  let hondenTijd = 0;
  function kleinLevenInLijst(ctx, S, w, D, vak, lijst) {
    if (!D || !metSprites()) return;
    for (const k of T.kippenOp(D, w, S.wereldTijd)) {
      const tx = Math.round(k.x);
      const ty = Math.round(k.y);
      if (!inVak(vak, tx, ty) || !T.isZichtbaar(w, tx, ty)) continue;
      const f = T.sprites.figuurGegevens(k.naam);
      const h = f && f.houdingen[k.houding];
      if (!h) continue;
      const fase = k.houding === 'lopen' ? k.afgelegd / (2 * (h.stap || 0.3)) : (k.tijd * h.fps) / h.beelden;
      const deel = T.sprites.figuur(k.naam, k.houding, T.sprites.richtingVan(k.dx, k.dy), fase);
      if (deel) lijst.push({ d: k.x + k.y, l: 2, punt: { x: tx, y: ty }, f: () => tekenKlein(ctx, deel, k.x, k.y, 5) });
    }
    for (const l of T.wasVan(D, w)) {
      const mx = (l.van.x + l.tot.x) / 2;
      const my = (l.van.y + l.tot.y) / 2;
      if (!inVak(vak, Math.round(mx), Math.round(my)) || !T.isZichtbaar(w, Math.round(mx), Math.round(my))) continue;
      lijst.push({ d: mx + my, l: 1, punt: { x: Math.round(mx), y: Math.round(my) }, f: () => tekenWas(ctx, S, l) });
    }
    // De pestbos (js/koorts.js): een bos stro aan een paal naast de deur van een huis met een zieke.
    const bos = T.sprites.pestbos();
    for (const b of bos ? T.pestbossen(D, w) : []) {
      const tx = Math.round(b.x);
      const ty = Math.round(b.y);
      if (!inVak(vak, tx, ty) || !T.isZichtbaar(w, tx, ty)) continue;
      lijst.push({ d: b.x + b.y, l: 1, punt: { x: tx, y: ty }, f: () => tekenKlein(ctx, bos, b.x, b.y, 4) });
    }
    // De honden: een stap achter hun baas aan, op de klok van de wereld; is de baas binnen, dan ligt de hond bij de deur.
    const H = T.KLEIN_LEVEN_INSTELLINGEN.honden;
    const dt = Math.max(0, Math.min(0.25, S.wereldTijd - hondenTijd));
    hondenTijd = S.wereldTijd;
    for (const hd of T.hondenVan(D, w)) {
      const e = hd.baas;
      const deur = e.binnen && hd.huis ? T.deurVan(w, hd.huis) : null;
      const doel = deur ? { x: deur.x + 0.6, y: deur.y + 0.4 } : { x: e.x, y: e.y };
      let st = honden.get(e);
      if (!st || Math.hypot(st.x - doel.x, st.y - doel.y) > 10) {
        // Hij begint naast zijn baas (niet onder hem), aan een kant uit het lot van het gezin.
        const a = T.vastLot(D, hd.gezin, 5303) * Math.PI * 2;
        const r = deur ? 0 : H.achter;
        honden.set(e, (st = { x: doel.x + Math.cos(a) * r, y: doel.y + Math.sin(a) * r, afgelegd: 0, dx: -Math.cos(a), dy: -Math.sin(a), tijd: 0 }));
      }
      const afstand = Math.hypot(doel.x - st.x, doel.y - st.y);
      const blijf = deur ? 0 : H.achter;
      const vreemde = !deur && T.vreemdeBij(w, st.x, st.y, H.blaffen);
      let houding = 'staan';
      if (vreemde) {
        houding = 'blaffen';
        st.dx = vreemde.x - st.x;
        st.dy = vreemde.y - st.y;
      } else if (afstand > blijf + 0.15) {
        // Hoe verder achter, hoe harder hij loopt, tot hij een draf heeft.
        const v = Math.min(3.5, 1 + (afstand - blijf) * 1.8);
        const stap = Math.min(afstand - blijf, v * dt);
        st.dx = (doel.x - st.x) / afstand;
        st.dy = (doel.y - st.y) / afstand;
        st.x += st.dx * stap;
        st.y += st.dy * stap;
        st.afgelegd += stap;
        houding = 'lopen';
      }
      if (houding !== st.houding) st.tijd = 0;
      st.houding = houding;
      st.tijd += dt;
      const tx = Math.round(st.x);
      const ty = Math.round(st.y);
      if (!inVak(vak, tx, ty) || !T.isZichtbaar(w, tx, ty)) continue;
      const f = T.sprites.figuurGegevens(hd.naam);
      const h = f && f.houdingen[houding];
      if (!h) continue;
      const fase = houding === 'lopen' ? st.afgelegd / (2 * (h.stap || 1)) : (st.tijd * h.fps) / h.beelden;
      const deel = T.sprites.figuur(hd.naam, houding, T.sprites.richtingVan(st.dx, st.dy), fase);
      const x = st.x;
      const y = st.y;
      if (deel) lijst.push({ d: x + y, l: 2, punt: { x: tx, y: ty }, f: () => tekenKlein(ctx, deel, x, y, 10) });
    }
  }
  // De was aan de lijn: twee palen, een touw dat doorhangt, en de stukken eraan, kolom voor kolom op hele pixels (zoals
  // de pixel art), die wapperen: elk stuk golft in zijn eigen ritme op de klok van het scherm.
  const WAS_MAAT = { hemd: [17, 19], laken: [22, 26], broek: [14, 24], doek: [12, 13] };
  const PAAL = 50;
  function tekenWas(ctx, S, l) {
    const a = opGrond(l.van.x, l.van.y);
    const b = opGrond(l.tot.x, l.tot.y);
    const kleur = (k, f) => `rgb(${Math.round(k[0] * f)},${Math.round(k[1] * f)},${Math.round(k[2] * f)})`;
    const paal = (p) => {
      ctx.fillStyle = 'rgb(84,58,36)';
      ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - PAAL - 2, 2, PAAL + 2);
      ctx.fillStyle = 'rgb(128,92,58)';
      ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - PAAL - 2, 1, PAAL + 2);
    };
    paal(a);
    const n = Math.max(1, Math.round(Math.abs(b.x - a.x)));
    const touw = (t) => a.y - PAAL + (b.y - a.y) * t + 5 * 4 * t * (1 - t);
    ctx.fillStyle = 'rgb(52,44,36)';
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      ctx.fillRect(Math.round(a.x + (b.x - a.x) * t), Math.round(touw(t)), 1, 1);
    }
    const ruimte = n / l.stukken.length - 2;
    for (const st of l.stukken) {
      const [b0, h0] = WAS_MAAT[st.soort];
      const breed = Math.max(4, Math.min(b0, Math.floor(ruimte)));
      const midden = Math.round(st.op * n);
      for (let c = 0; c < breed; c++) {
        const u = c / (breed - 1);
        const i = midden - Math.floor(breed / 2) + c;
        const t = i / n;
        const x = Math.round(a.x + (b.x - a.x) * t);
        const y = Math.round(touw(t));
        let h = h0;
        if (st.soort === 'hemd' && (u < 0.25 || u > 0.75)) h = Math.round(h0 * 0.55); // de mouwen
        if (st.soort === 'broek' && Math.abs(u - 0.5) < 0.12) h = Math.round(h0 * 0.35); // tussen de pijpen
        h += Math.round(1.3 * Math.sin(S.tijd * 3.1 + st.zaad + u * 4));
        const rand = c === 0 || c === breed - 1 ? 0.7 : 1; // een donkere rand, zoals om de pixel art
        const licht = rand * (0.88 + 0.12 * Math.sin(S.tijd * 2.3 + st.zaad * 1.7 + u * 6)) * (1.08 - 0.14 * u);
        ctx.fillStyle = kleur(st.kleur, licht);
        ctx.fillRect(x, y + 1, 1, h);
        ctx.fillStyle = kleur(st.kleur, licht * 0.72); // de omslag over het touw en de zoom
        ctx.fillRect(x, y, 1, 1);
        ctx.fillRect(x, y + h, 1, 1);
      }
      // de knijpers
      ctx.fillStyle = 'rgb(112,84,52)';
      for (const c of [0, breed - 1]) {
        const t = (midden - Math.floor(breed / 2) + c) / n;
        ctx.fillRect(Math.round(a.x + (b.x - a.x) * t), Math.round(touw(t)) - 1, 2, 3);
      }
    }
    paal(b);
  }

  // De stapels naast de deuren (js/kar.js): wat een gebouw maakte en de ossenkar nog moet halen, klein, half of vol; hout
  // en steen als hoop, de rest in manden, kratten, zakken en tonnen (T.sprites.stapelDelen). Zonder kunst: een blok, zo
  // hoog als hij vol is.
  function stapelsInLijst(ctx, S, w, D, vak, lijst) {
    if (!D || !T.metVervoer(D)) return;
    for (const s of T.stapelsOp(D)) stapelInLijst(ctx, w, vak, lijst, s);
  }
  // De buit in een roverskamp (T.roverskampenBuit, js/rovers.js): een hoop naast het vuur, klein, middel of groot
  // (T.sprites.buit); zolang dat vel laadt, of zonder kunst, als een losse stapel.
  function kampBuitInLijst(ctx, S, w, vak, lijst) {
    for (const s of T.roverskampenBuit(w)) {
      const hoop = metSprites() ? T.sprites.buit(s.maat) : null;
      if (!hoop) {
        stapelInLijst(ctx, w, vak, lijst, s);
        continue;
      }
      if (!inVak(vak, s.x, s.y) || !T.isZichtbaar(w, s.x, s.y)) continue;
      lijst.push({ d: s.x + s.y, l: 1, punt: { x: s.x, y: s.y }, f: () => {
        const p = opGrond(s.x, s.y);
        T.sprites.teken(ctx, hoop, p.x, p.y);
      } });
    }
  }
  // De palissade om een rovershol (T.palissadeVan, js/rovers.js): elke paal op zijn eigen plek op de cirkel, met zijn soort
  // en zijn richting (T.sprites.palissade), en de balk van de poort over wie eronder loopt. Zonder kunst: een hoge, smalle
  // paal.
  function palissadeInLijst(ctx, S, w, vak, lijst) {
    for (const K of w.kampen || []) {
      for (const q of T.palissadeVan(w, K)) {
        const tx = Math.round(q.x);
        const ty = Math.round(q.y);
        if (!inVak(vak, tx, ty) || !T.isZichtbaar(w, tx, ty)) continue;
        lijst.push({
          d: q.x + q.y + (q.boven ? 1 : 0), l: 1, punt: { x: tx, y: ty }, f: () => {
            const p = opGrond(q.x, q.y);
            const deel = metSprites() ? T.sprites.palissade(q.rij, q.richting) : null;
            if (deel) T.sprites.teken(ctx, deel, p.x, p.y);
            else if (q.rij !== 'gat' && q.rij !== 'balk') T.blok(ctx, p.x, p.y, 0.1, 0.1, 60, '#6f665a');
          },
        });
      }
    }
  }

  // De aankleding van de roverskampen (K.spullen, js/rovers.js): elk ding op zijn plek, met zijn voorkant naar het vuur
  // (T.sprites.aankleding); wat plat op de grond ligt (modder, stro, een slaapvel), onder wie erop staat. Zonder kunst: een
  // klein blok.
  const OP_DE_GROND = new Set(['modderplas', 'stro', 'slaapvel']);
  function aankledingInLijst(ctx, S, w, vak, lijst) {
    for (const K of w.kampen || []) {
      if (!K.staat || !K.spullen) continue;
      for (const q of K.spullen) {
        const tx = Math.round(q.x);
        const ty = Math.round(q.y);
        if (!inVak(vak, tx, ty) || !T.isZichtbaar(w, tx, ty)) continue;
        lijst.push({
          d: q.x + q.y, l: OP_DE_GROND.has(q.soort) ? 0 : 1, punt: { x: tx, y: ty }, f: () => {
            const p = opGrond(q.x, q.y);
            const deel = metSprites() ? T.sprites.aankleding(q.soort, q.richting) : null;
            if (deel) T.sprites.teken(ctx, deel, p.x, p.y);
            else if (!OP_DE_GROND.has(q.soort)) T.blok(ctx, p.x, p.y, 0.2, 0.2, 8, '#6b5a44');
          },
        });
      }
    }
  }

  // Eén stapel s ({ x, y, wat, vol }), als hij in het vak ligt en te zien is.
  function stapelInLijst(ctx, w, vak, lijst, s) {
    if (!inVak(vak, s.x, s.y) || !T.isZichtbaar(w, s.x, s.y)) return;
    const delen = metSprites() ? T.sprites.stapelDelen(s.wat, s.vol) : [];
    lijst.push({
      d: s.x + s.y, l: 1, punt: { x: s.x, y: s.y }, f: () => {
        const p = opGrond(s.x, s.y);
        if (delen.length) for (const d of delen) T.sprites.teken(ctx, d.deel, p.x + d.dx, p.y + d.dy);
        else T.blok(ctx, p.x, p.y, 0.3, 0.2, 4 + 14 * Math.min(1, s.vol), '#8a6a3c');
      },
    });
  }

  function tekenKlein(ctx, deel, x, y, schaduw) {
    const p = opGrond(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, schaduw, schaduw / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    T.sprites.teken(ctx, deel, p.x, p.y);
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
    // Wie je koos (js/kiezen.js; werklijst vraag 170, stap 1): een ring om zijn voeten, in goud voor je mannen en licht
    // voor een dorpeling. Niet in de fotomodus.
    const g = S.gekozen;
    if (!S.foto && g && (g === e || (Array.isArray(g) && g.includes(e)))) {
      ctx.strokeStyle = T.isMan(S.dorp, e) ? '#e2b64a' : 'rgba(243, 227, 184, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 17, 8.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    const bob = Math.sin(S.tijd * 2.6 + e.fase) * 1.3;
    const huppel = !deel && e.onderweg ? Math.abs(Math.sin(S.tijd * 14)) * 2.5 : 0;
    let top;
    if (deel) {
      T.sprites.teken(ctx, deel, cx, cy);
      if (lantaarnsNu.has(e)) tekenLantaarn(ctx, S, e, cx, cy);
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
    if (zonderUi(S)) return; // de levensbalk en het uitroepteken zijn ui (tekenScene)
    // Wie vecht, draagt zijn levensbalk (js/gevecht.js), en wie geraakt is; een rover altijd (js/rovers.js): hij draagt
    // het vel van een gewone dorpeling, en zo zie je dat hij geen dorpeling is.
    if (!e.dood && e.maxLeven > 0 && (e.doelwit || e.volgt || e.leven < e.maxLeven || e.rover)) levensbalk(ctx, cx, top - 9, e);
    if (e.alarm > 0) roep(ctx, '!', cx, top - 14 - Math.abs(Math.sin(e.alarm * 9)) * 4, '#ffd24a');
    // Wie de wolven aanvallen, roept om hulp (js/beesten.js): een rood uitroepteken dat sneller springt.
    else if (e.roeptOmHulp) roep(ctx, '!', cx, top - 12 - Math.abs(Math.sin(S.tijd * 8)) * 4, '#ff6a50');
  }

  // Het wolkje boven wie een praatje maakt (js/praatje.js; werklijst vraag 120, b; Marcel, 4 okt: "120 a b c ja"): leeg,
  // met drie puntjes, om de beurt boven wie er praat, met een stilte tussen de beurten. Waar ze het over hebben, komt er
  // later in (met de mensen aan het werk). Na de nacht getekend, zodat je het ook in het donker ziet. Wie
  // er praat, komt uit de klok van het scherm en het zaad van het groepje: het is geen spelstaat. Het gereedschap kent
  // de praatjes niet.
  const BEURT = 2.2; // seconden per beurt, op het scherm
  const PRATEN = 0.75; // zo'n deel van een beurt staat het wolkje er; dan een stilte
  // De ogen van de wolven, 's nachts (js/beesten.js; werklijst vraag 116, Marcel: "Rode ogen uit het duister"): ná de
  // nacht getekend, zodat ze oplichten waar de wolf zelf zwart is, ook achter een boom. Waar ze in elk beeld zitten,
  // staat in beelden/ogen.js (T.OGEN, gemaakt door gereedschap/pixelart/ogen.cjs: twee van voren, een van opzij, geen
  // van achteren); welk beeld de wolf nu heeft, onthoudt hij zelf (e.beeldStand.laatste, js/sprites.js). Ver uitgezoomd
  // blijven ze even groot op het scherm, en af en toe knippert hij.
  const OOG_RICHTINGEN = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO']; // geen tekst
  function tekenOgen(ctx, S) {
    if (!S.kalender || !T.OGEN || !metSprites() || (T.debug && T.debug.geenNacht)) return;
    const sterk = Math.min(1, (T.lichtVan(S.kalender.dag).nacht - 0.35) / 0.4);
    if (sterk <= 0) return;
    const k = 1 / Math.min(1, Math.max(0.3, S.zoom));
    for (const e of S.wereld.wezens) {
      if (!e.beest || e.dood || !e.beeldStand || !e.beeldStand.laatste || !T.zieJeWezen(S, e)) continue;
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

  // De lantaarn van een groepsleider en de aanvoerder (js/soldaten.js, T.lantaarnDragers; werklijst vraag 171): het
  // lantaarntje in zijn hand, alleen als hij brandt (T.lichtDragers, js/zien.js: buiten in het donker; Marcel, 16 okt, E1).
  // Direct na zijn figuur, in tekenWezen, zodat een dak of een boom ervoor hem met zijn drager bedekt, en het kijkgat
  // (js/doorkijk.js) hem met zijn drager terugtekent. Het hoorn en de vlam gloeien, zoals de ramen: meteen gaat er een gat
  // in het doek waar ze zitten (wat er later voor komt, vult het weer), daar valt de nacht niet in, en na de nacht komen ze
  // erin terug (vulLantaarns). Een kijkgat tekent op een eigen doek: dan komt het gat erna (T.ponsLantaarns). Met een klein
  // waasje eromheen. Waar de hand zit en hoe scheef hij bij het lopen hangt (B1), staat per vel in beelden/handen.js
  // (T.sprites.handVan; gereedschap/pixelart/lantaarn.cjs --handen), en de vlam flakkert op de klok van het scherm. Een vel
  // zonder handen (een werkvel, of nog niet gerenderd) krijgt geen lantaarntje: zijn licht blijft.
  // Alleen scherm, elk beeld opnieuw (tekenScene): wie een lantaarn draagt, en de gaten in het doek.
  let lantaarnsNu = new Set();
  let lantaarnGaten = { doek: null, gaten: [], wacht: [] };
  const LANTAARN_WAAS = { onder: 8, straal: 10, sterkte: 0.32 }; // pixels onder de hand, pixels, 0 tot 1
  function vulLantaarns(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over'; // alleen in wat er van de gaten over is
    for (const g of lantaarnGaten.gaten) T.sprites.teken(ctx, g.deel, g.x, g.y);
    ctx.restore();
    lantaarnGaten = { doek: null, gaten: [], wacht: [] };
  }
  function ponsLantaarn(ctx, gat) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    T.sprites.teken(ctx, gat.deel, gat.x, gat.y);
    ctx.restore();
    lantaarnGaten.gaten.push(gat);
  }
  // Na een kijkgat (js/doorkijk.js, T.tekenKijkgat): de lantaarns die erin kwamen, krijgen nu hun gat in het doek.
  T.ponsLantaarns = function (ctx) {
    if (ctx === lantaarnGaten.doek) for (const gat of lantaarnGaten.wacht) ponsLantaarn(ctx, gat);
    lantaarnGaten.wacht = [];
  };
  function tekenLantaarn(ctx, S, e, cx, cy) {
    const hand = T.sprites.handVan(e);
    if (!hand) return;
    const vlam = Math.sin(S.tijd * 9 + e.fase * 5) + Math.sin(S.tijd * 23 + e.fase) > 0 ? 1 : 0;
    const deel = T.sprites.lantaarn(vlam, hand[2]);
    if (!deel) return;
    // zoals het figuur (T.sprites.teken rondt zijn hoek af): de hand op de pixel van zijn vel
    const hx = Math.round(cx) + hand[0];
    const hy = Math.round(cy) + hand[1];
    const W = LANTAARN_WAAS;
    const gloed = ctx.createRadialGradient(hx, hy + W.onder, 0, hx, hy + W.onder, W.straal);
    gloed.addColorStop(0, `rgba(255,200,120,${W.sterkte})`);
    gloed.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = gloed;
    ctx.beginPath();
    ctx.arc(hx, hy + W.onder, W.straal, 0, Math.PI * 2);
    ctx.fill();
    T.sprites.teken(ctx, deel, hx, hy);
    const hoorn = lantaarnGaten.doek && T.sprites.lantaarn(vlam, hand[2], 'gloed');
    if (!hoorn) return;
    const gat = { deel: hoorn, x: hx, y: hy };
    if (ctx === lantaarnGaten.doek) ponsLantaarn(ctx, gat);
    else lantaarnGaten.wacht.push(gat); // in een kijkgat
  }

  function tekenWolkjes(ctx, S) {
    const D = T.dorpHier(S);
    if (!T.praatjesOp || (D && D.gevecht)) return;
    const w = S.wereld;
    for (const [g, leden] of T.praatjesOp(w)) {
      // Met wie jij praat, praat niet met hen.
      const erbij = leden.filter((e) => T.staatErbij(e) && e !== S.spreektMet && T.isZichtbaar(w, e.tx, e.ty) && T.zieJeWezen(S, e));
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
    ctx.font = 'bold 24px Georgia, serif'; // geen tekst
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

  // De zwevende getallen: de schade van een klap, boven het hoofd van wie hem kreeg. En een pijl of een bout die vliegt
  // (T.anim.pijl, js/anim.js): een korte streep van de schutter naar zijn doel, op borsthoogte.
  function tekenEffecten(ctx, S) {
    for (const fx of S.effecten) {
      const f = fx.t / fx.duur;
      if (fx.soort === 'pijl') {
        tekenPijl(ctx, fx, f);
        continue;
      }
      if (fx.t < 0 || fx.soort !== 'tekst') continue; // een tekst die nog even wacht
      const p = opGrond(fx.x, fx.y);
      const y = p.y - 64 - f * 30;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - f * f);
      ctx.font = 'bold 18px Georgia, serif'; // geen tekst
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      ctx.strokeText(fx.tekst, p.x, y);
      ctx.fillStyle = fx.kleur;
      ctx.fillText(fx.tekst, p.x, y);
      ctx.restore();
    }
  }

  function tekenPijl(ctx, fx, f) {
    const a = opGrond(fx.van.x, fx.van.y);
    const b = opGrond(fx.naar.x, fx.naar.y);
    const lang = 10; // pixels
    const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const x = a.x + (b.x - a.x) * f;
    const y = a.y + (b.y - a.y) * f - 22 - Math.sin(f * Math.PI) * 8; // op borsthoogte, met een kleine boog
    ctx.save();
    ctx.strokeStyle = 'rgba(60, 40, 22, 0.95)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - ((b.x - a.x) / d) * lang, y - ((b.y - a.y) / d) * lang);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
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

  // Donkere randen; in een gevecht (js/gevecht.js) kleuren ze een fractie rood mee (S.gevechtGloed, js/main.js).
  function tekenVignet(ctx, S, bw, bh) {
    const g = ctx.createRadialGradient(bw / 2, bh / 2, Math.min(bw, bh) * 0.32, bw / 2, bh / 2, Math.max(bw, bh) * 0.75);
    const r = Math.round(45 * S.gevechtGloed);
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
})(globalThis.Spel = globalThis.Spel || {});
