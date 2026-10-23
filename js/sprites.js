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
  const TEGELMAP = 'tegels/';
  const beelden = new Map(); // pad → Image
  let geladenNr = 0; // hoeveel beelden er klaar zijn met laden (wat een voorwerp onthoudt, S.tekeningVan, geldt tot er een bij komt)
  let gegevens = null;
  let belofte = null;

  const S = {
    aan: false, // staan alle vellen van binnen klaar? Zo niet, tekent het spel zijn vlakken.
    buitenAan: false, // en die van buiten (tegels/, gemaakt door npm run tiled)
    mist: [], // wat er niet geladen kon worden, om in de console te zien
  };
  T.sprites = S;

  // ---------------------------------------------------------------- laden

  // `pad` is het pad vanaf index.html. De vellen van binnen staan in beelden/, die van buiten in
  // tegels/ (daar maakt npm run tiled ze, voor Tiled én voor het spel: het zijn dezelfde
  // plaatjes, in dezelfde projectie, met hetzelfde ankerpunt). Niet wachten op img.decode(): dat
  // wacht in Chromium tot de bladzijde een beeld tekent, en in een verborgen tabblad komt dat niet
  // (vraag 114, 2a). Een ingepakt vel is klein genoeg om bij het eerste beeld uit te pakken.
  function laadBeeld(pad) {
    return new Promise((klaar) => {
      const img = new Image();
      img.onload = () => {
        beelden.set(pad, img);
        geladenNr++;
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
      const r = await fetch(MAP + 'beschrijving.json'); // geen tekst
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
      if (gegevens.graan) vellen.push(gegevens.graan.bestand);
      if (gegevens.schandpaal) vellen.push(gegevens.schandpaal.bestand);
      if (gegevens.meiboom) vellen.push(gegevens.meiboom.bestand);
      if (gegevens.kerstboom) vellen.push(gegevens.kerstboom.bestand);
      if (gegevens.pestbos) vellen.push(gegevens.pestbos.bestand);
      if (gegevens.stapels) vellen.push(gegevens.stapels.bestand);
      if (gegevens.hol) vellen.push(gegevens.hol.bestand);
      if (gegevens.lantaarn) vellen.push(gegevens.lantaarn.bestand);
      if (gegevens.wijnrank) vellen.push(gegevens.wijnrank.bestand);
      // De kramen en de manden van de markt laden pas als er een getekend wordt (S.kraam, S.mand): zo'n 24 MB.
      if (gegevens.tekens) vellen.push(gegevens.tekens.bestand);
      // De figuren laden hier niet: een figuur komt pas als zijn wezen op de kaart staat (S.laadWatErStaat, vraag 114,
      // stap 1b).
      const lijst = vellen.map((f) => MAP + f);
      // De vellen van buiten staan los: gaat daar iets mis, dan tekent het spel buiten vlakken
      // en binnen nog gewoon zijn pixel art. De bouwfasen laden hier niet: elk gebouw heeft zijn
      // eigen vel, dat pas komt als er een in aanbouw staat (S.bouwfase hieronder); en de huizen
      // en de gebouwen ook niet: die hebben een bestand per tekening, dat pas komt als hij op de
      // kaart staat (S.laadWatErStaat). (Tot 25 sep laadde hier ook beelden/effecten/, de
      // spreukeffecten van het oude spel.)
      // De vellen van de bomen in het jaar laden pas in hun seizoen (S.zetSeizoen).
      const buiten = [...new Set(Object.values(T.TEGELS || {}).filter((v) => !v.seizoen).map((v) => v.bestand).filter(Boolean))];
      const [uitslag, uitBuiten] = await Promise.all([Promise.all(lijst.map(laadBeeld)), Promise.all(buiten.map(laadBeeld))]);
      S.aan = uitslag.every(Boolean);
      S.buitenAan = buiten.length > 0 && uitBuiten.every(Boolean);
      if (S.aan) snijVloeren();
      if (!S.aan || !S.buitenAan) console.warn(`${T.NAAM}: sprites ontbreken, het spel tekent daar vlakken.`, S.mist); // geen tekst
      return S.aan;
    })();
    return belofte;
  };

  S.gereed = () => S.laad();

  // Een vel dat pas geladen wordt als het nodig is (de bouwfasen van één gebouw): de eerste vraag zet
  // het laden in gang, en tot het er is, is het antwoord nee. Lukt het niet, dan probeert het niet
  // elk beeld opnieuw.
  const laden = new Map(); // pad → 'laadt' of 'mist'
  function laadAlsNodig(pad) {
    if (beelden.has(pad)) return true;
    if (!laden.has(pad) && typeof Image !== 'undefined') {
      laden.set(pad, 'laadt');
      laadBeeld(pad).then((gelukt) => (gelukt ? laden.delete(pad) : laden.set(pad, 'mist')));
    }
    return false;
  }
  // Hoeveel vellen er nog onderweg zijn, voor wie wil wachten tot alles er is (een proef met schermafdrukken).
  S.bezig = () => [...laden.values()].filter((s) => s === 'laadt').length;

  // Een vel per tekening (vraag 114, stap 1; Marcel, 4 okt: "A ja B ja"): de huizen en de gebouwen hebben elke tekening
  // in een eigen bestand (tegels/huizen/, tegels/gebouwen/; `bestand` per tegel in T.TEGELS), en dat laadt pas als hij
  // op de kaart staat. Zo kost een tekening die er niet staat niets, hoeveel het er ook zijn. Het eigen bestand van een
  // tegel, of null als hij op een gedeeld vel staat:
  const eigenBestand = (velNaam, id) => {
    const v = T.TEGELS && T.TEGELS[velNaam];
    const t = v && v.perTekening && id != null && v.tiles[id];
    return (t && t.bestand) || null;
  };
  // De figuren net zo (vraag 114, stap 1b; Marcel: "C meteen erna"): een figuur laadt pas als zijn wezen op de kaart
  // staat, met al zijn houdingen tegelijk (staan, lopen, slaan, ...). Welke figuur een wezen draagt, zegt figuurNu
  // hieronder (bij S.houding).
  const figurenGevraagd = new Set();
  function laadFiguur(naam) {
    if (figurenGevraagd.has(naam)) return;
    const f = S.figuurGegevens(naam);
    if (!f) return;
    figurenGevraagd.add(naam);
    for (const h of Object.values(f.houdingen)) laadAlsNodig(MAP + 'figuren/' + h.bestand);
  }
  // Alles wat op een kaart staat vast laden (js/tekenen.js vraagt het bij een andere kaart, en als er iets op veranderde:
  // een nieuw gebouw, een huis dat doorgroeit, iemand die erbij kwam), zodat het er is voor het in beeld komt: de
  // tekeningen met een eigen bestand, en de figuren van wie er staat; wie maait, leent de maaier (een boerin de maaister).
  // De vellen van het andere werk op het land (js/veldwerk.js) laden pas als hij eraan begint: tot dan houdt hij zijn
  // vorige beeld (js/tekenen.js), en zo laadt een kaart niet bij het begin al het werk van het hele jaar.
  S.laadWatErStaat = function (w) {
    for (const v of w.voorwerpen) {
      const bestand = v.vel && eigenBestand(v.vel, v.id);
      if (bestand) laadAlsNodig(bestand);
    }
    for (const e of w.wezens) {
      laadFiguur(eigenFiguur(e));
      if (e.werkAkkers && e.werkAkkers.length) laadFiguur(S.maaierVan(e));
    }
  };
  // Wacht deze tekening nog op zijn eigen bestand? Dan tekent js/tekenen.js wat er daarnet stond, of niets; ontbreekt het
  // bestand echt, dan niet meer (en tekent het een vlak, zoals zonder sprites).
  S.wachtOp = function (velNaam, id) {
    const bestand = eigenBestand(velNaam, id);
    return !!bestand && !beelden.has(bestand) && laden.get(bestand) !== 'mist';
  };
  // En laadt de figuur die dit wezen nu draagt nog? Dan net zo: wat er daarnet stond, of nog niemand.
  S.laadtWezen = function (e) {
    const f = S.figuurGegevens(figuurNu(e));
    return !!f && Object.values(f.houdingen).some((h) => laden.get(MAP + 'figuren/' + h.bestand) === 'laadt');
  };

  // Wat de browser nu aan vellen vasthoudt (Spel.debug.vellen, vraag 114, stap 1): elk geladen vel met zijn maat en wat
  // het uitgepakt kost, vier bytes per pixel, zoals een browser een plaatje in zijn geheugen houdt. Wat nog laadt of
  // mist, staat er niet in, en wat het spel zelf uit een vel bakt (de wind, de vloertegels) ook niet.
  S.geladen = () => [...beelden].map(([pad, img]) => {
    const b = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    return { pad, b, h, mb: (b * h * 4) / 1e6 };
  });

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
    laadFiguur(naam); // als hij er nog niet is (vraag 114, stap 1b); tot dan is het antwoord null
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
  const HOOG = { skelet: 78, slijm: 28, wolf: 46, marskramer: 66, koe: 48, schaap: 30, hert: 62 };
  S.figuurNaam = (soort) => soort;
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
          c.versie = 1; // eens getekend, blijft hij zo (js/gl.js)
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
  // De vellen die npm run tiled maakt: gras en paden, bomen en begroeiing, de gebouwen, de huizen
  // en wat er op het erf staat. Ze staan in dezelfde projectie als alles hierboven, en tegels.js
  // (T.TEGELS) zegt waar elke tegel op zijn vel staat en waar zijn ankerpunt ligt: het punt dat op
  // het midden van de tegel hoort te liggen (S.celVan). Tekenen is dus ook hier niets meer dan het
  // anker op T.naarScherm leggen.
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
  // veel; wat hier niet in staat, staat stil. Een boom of een struik zegt het zelf (`wind` in T.BOMEN, js/wereld.js).
  const WIND_GEWICHT = {
    varen: 4, grasPol: 4, hoogGras: 5, bloemen: 4,
    klaproos: 4, korenbloem: 4, brandnetel: 3, distel: 3, lisdodde: 5,
    waslijn: 10,
  };
  const windGewicht = (naam) => WIND_GEWICHT[naam] || (T.BOMEN[naam] && T.BOMEN[naam].wind) || 0;
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
    // Zo ver buigt de top opzij: daar moet aan beide kanten plaats voor zijn, want een ingepakte
    // tekening (vraag 114, 2a) is strak gesneden, en dan viel een buigende kruin over de rand.
    const rand = Math.ceil(Math.abs(uitslag));
    const c = document.createElement('canvas');
    c.width = b + 2 * rand;
    c.height = h;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    for (let y = 0; y < h; y += WIND_PLAK) {
      const ph = Math.min(WIND_PLAK, h - y);
      const t = 1 - y / h; // 1 boven aan het beeld, bijna 0 onderaan
      const dx = Math.round(uitslag * t * t);
      cx.drawImage(bron, sx, sy + y, b, ph, rand + dx, y, b, ph);
    }
    c.versie = 1; // eens getekend, blijft hij zo (js/gl.js)
    return { beeld: c, sx: 0, sy: 0, b: b + 2 * rand, h, ax: anker[0] + rand, ay: anker[1] };
  }

  // Een stuk in een kleur gezet, met dezelfde vorm en hetzelfde anker: het spookbeeld van een gebouw dat niet past
  // (js/tekenen.js, tekenBouwGhost; vraag 179). De kaart kent alleen helderheid en grijs (js/gl.js), dus een eigen doek,
  // één keer per stuk en kleur. Zonder scherm (de toetsen) het stuk zelf.
  const inKleur = new WeakMap(); // stuk → { kleur → stuk }
  S.inKleur = function (deel, kleur) {
    if (!deel || typeof document === 'undefined') return deel;
    const per = inKleur.get(deel) || {};
    inKleur.set(deel, per);
    if (per[kleur]) return per[kleur];
    const c = document.createElement('canvas');
    c.width = deel.b;
    c.height = deel.h;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(deel.beeld, deel.sx, deel.sy, deel.b, deel.h, 0, 0, deel.b, deel.h);
    cx.globalCompositeOperation = 'source-atop';
    cx.fillStyle = kleur;
    cx.fillRect(0, 0, deel.b, deel.h);
    c.versie = 1; // eens getekend, blijft hij zo (js/gl.js)
    per[kleur] = { beeld: c, sx: 0, sy: 0, b: deel.b, h: deel.h, ax: deel.ax, ay: deel.ay };
    return per[kleur];
  };

  // Een plaatje verkleind in een vak van b bij h op doek cx, nooit groter dan het is, onderaan in het midden: voor de
  // plaatjes van het bouwmenu (js/hud.js; vraag 179, C2). Verkleinen mag zacht, het is geen pixel van de wereld.
  S.verkleind = function (cx, beeld, sx, sy, cb, ch, b, h) {
    const f = Math.min(1, b / cb, h / ch);
    cx.imageSmoothingEnabled = f < 1;
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(beeld, sx, sy, cb, ch, Math.round((b - cb * f) / 2), Math.round(h - ch * f), Math.round(cb * f), Math.round(ch * f));
  };
  // Een klein plaatje van een tekening, voor het bouwmenu: zijn hele cel verkleind in een doek van b bij h (S.verkleind),
  // één keer per tekening en maat. Een tekening met een eigen bestand laadt dat los van de vellen hierboven, en het beeld
  // gaat daarna weer weg: het spel houdt vast wat op de kaart staat, niet alles wat je kunt bouwen. Null zolang het laadt
  // (of als het ontbreekt); `klaar(doek)` hoort het als het er is.
  const voorbeelden = new Map(); // sleutel → { doek, wacht }
  S.voorbeeld = function (velNaam, id, b, h, klaar) {
    if (typeof document === 'undefined') return null;
    const sleutel = `${velNaam},${id},${b},${h}`;
    const er = voorbeelden.get(sleutel);
    if (er && er.doek) return er.doek;
    if (er) {
      if (klaar && er.wacht) er.wacht.push(klaar);
      return null;
    }
    const v = T.TEGELS && T.TEGELS[velNaam];
    const plek = S.celVan(velNaam, id);
    const pad = plek && (eigenBestand(velNaam, id) || (v && v.bestand));
    if (!pad) return null;
    const w = { doek: null, wacht: klaar ? [klaar] : [] };
    voorbeelden.set(sleutel, w);
    const maak = (beeld) => {
      const c = document.createElement('canvas');
      c.width = b;
      c.height = h;
      const [sx, sy, cb, ch] = plek.cel;
      S.verkleind(c.getContext('2d'), beeld, sx, sy, cb, ch, b, h);
      w.doek = c;
      for (const k of w.wacht.splice(0)) k(c);
    };
    if (beelden.has(pad)) maak(beelden.get(pad));
    else {
      const img = new Image();
      img.onload = () => maak(img);
      img.onerror = () => (w.wacht = null); // het ontbreekt: niet opnieuw proberen
      img.src = pad;
    }
    return w.doek;
  };

  // Waar tegel `id` op zijn vel staat: { cel: [x, y, b, h], anker: [ax, ay] }, met het anker binnen
  // de cel. Een ingepakt vel (alles behalve de grond; gereedschap/pixelart/inpakken.cjs, vraag 114,
  // 2a) zegt het per tegel; een raster (de grond, waar Tiled mee schildert) heeft één celmaat en
  // één anker, en dan volgt de plek uit de kolommen. null als er op die plek niets getekend staat.
  S.celVan = function (velNaam, id) {
    const v = T.TEGELS && T.TEGELS[velNaam];
    const t = v && id != null && v.tiles[id];
    if (!t) return null;
    if (v.ingepakt) return t.cel ? { cel: t.cel, anker: t.anker } : null;
    const kol = v.kolommen || v.tiles.length;
    return {
      cel: [(id % kol) * v.tegelB, Math.floor(id / kol) * v.tegelH, v.tegelB, v.tegelH],
      anker: v.anker || [Math.round(v.tegelB / 2), Math.round(v.tegelH / 2)],
    };
  };

  // Welke tekening een voorwerp op de kaart krijgt, als { vel, id } (vraag 148): een boom heeft op zijn vel meer
  // tekeningen, met de naam van zijn soort en een `vorm` (gereedschap/pixelart/naar-tiled.cjs), en welke het wordt, zegt
  // zijn tegel ("elke boom anders", a). Zo verandert er in het spel niets (een voorwerp heeft het nummer van de eerste,
  // v.id), en past een bewaard spel. Wat maar één tekening heeft, houdt de zijne. En in een ander seizoen dan de zomer de
  // tekening van dat seizoen (b): het vel "<vel>-<seizoen>" (bomen-herfst, ...) heeft hem op hetzelfde nummer, of niet,
  // als hij in dat seizoen niet anders is (een spar in de herfst). Met `zomer` altijd die van de zomer (wat plat is,
  // js/tekenen.js, mag niet van het seizoen afhangen).
  const VORMEN = new Map(); // per vel: het nummer van de eerste tekening van een soort -> alle nummers
  function vormenVan(velNaam, id) {
    const v = T.TEGELS && T.TEGELS[velNaam];
    if (!v) return null;
    let per = VORMEN.get(v);
    if (!per) {
      per = new Map();
      const eerste = new Map();
      v.tiles.forEach((t, i) => {
        if (!t || !t.naam) return;
        if (!t.vorm) {
          if (!eerste.has(t.naam)) eerste.set(t.naam, i);
          return;
        }
        const e = eerste.get(t.naam);
        if (e == null) return;
        if (!per.has(e)) per.set(e, [e]);
        per.get(e).push(i);
      });
      VORMEN.set(v, per);
    }
    return per.get(id) || null;
  }
  function tekeningNu(v, zomer) {
    const vormen = v.vel != null && vormenVan(v.vel, v.id);
    let id = v.id;
    if (vormen) {
      // goed gemengd, anders staan buren in een patroon
      let h = (Math.imul(v.x | 0, 374761393) + Math.imul(v.y | 0, 668265263)) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      id = vormen[((h ^ (h >>> 16)) >>> 0) % vormen.length];
    }
    if (!zomer && seizoenNu !== 'zomer') {
      const s = T.TEGELS[`${v.vel}-${seizoenNu}`];
      if (s && beelden.has(s.bestand) && s.tiles[id] && s.tiles[id].cel) return { vel: `${v.vel}-${seizoenNu}`, id };
    }
    return { vel: v.vel, id };
  }
  S.tekeningVan = function (v, zomer = false) {
    const o = onthoudVoorwerp(v);
    return zomer ? o.zomer || (o.zomer = tekeningNu(v, true)) : o.t;
  };
  // Wat het tekenen verder over een voorwerp onthoudt, staat er ook op (vraag 178, A2): `plat` (isPlat in js/tekenen.js) en
  // zijn plek op het scherm (`grond`, plekVan), opnieuw zodra de rest van onthoudVoorwerp opnieuw gaat.
  S.onthouden = (v) => onthoudVoorwerp(v);

  // Wat een voorwerp tekent, onthouden op het voorwerp zelf (`v.getekend`, alleen scherm: SCHERM_SLEUTELS in
  // js/opslaan.js): zijn tekening (ook die van de zomer), het gewicht van de wind op die tekening, het stuk stil en per
  // stand in de wind (S.buitenVan), en de doos van zijn beeld (S.doosVan). Elk beeld vragen duizenden bomen het opnieuw,
  // en het opzoeken (de vorm, het seizoen, de cel, de sleutel van onthoud) was in Firefox 9% van het tekenen (17 okt, een
  // profiel van Marcel); een WeakMap opzoeken kostte daar zelf nog bijna een ms per beeld. Opnieuw als het voorwerp een
  // andere tekening of plek kreeg, als het seizoen anders is, en als er een beeld bij kwam: tot het vel van een seizoen er
  // is, staan de bomen in de zomer. Een stuk dat er nog niet is (een huis waarvan het bestand nog laadt), onthoudt het niet.
  function onthoudVoorwerp(v) {
    let o = v.getekend;
    if (!o || o.vel !== v.vel || o.id !== v.id || o.x !== v.x || o.y !== v.y || o.seizoen !== seizoenNu || o.geladen !== geladenNr) {
      const t = tekeningNu(v, false);
      const vel = T.TEGELS && T.TEGELS[t.vel];
      const tegel = vel && vel.tiles[t.id];
      o = { vel: v.vel, id: v.id, x: v.x, y: v.y, seizoen: seizoenNu, geladen: geladenNr, t, zomer: null, wind: tegel ? windGewicht(tegel.naam) : 0, stil: null, standen: [], doos: undefined, plat: undefined, grond: null, grondKaart: null, grondVersie: 0 };
      v.getekend = o;
    }
    return o;
  }

  // De doos van het beeld van een voorwerp vanaf zijn anker, [links, boven, rechts, onder] in pixels van de kunst: de maat
  // van zijn tekening (`doos` in tegels/tegels.js), of anders zijn cel; null als hij geen plek op een vel heeft. Voor de
  // doorkijk (js/doorkijk.js), die het elk beeld vraagt voor alles in beeld.
  S.doosVan = function (v) {
    const o = onthoudVoorwerp(v);
    if (o.doos !== undefined) return o.doos;
    const vel = T.TEGELS && T.TEGELS[o.t.vel];
    const tegel = vel && vel.tiles[o.t.id];
    const plek = S.celVan(o.t.vel, o.t.id);
    const a = plek && plek.anker;
    o.doos = !plek ? null : (tegel && tegel.doos) || [a[0], a[1], plek.cel[2] - a[0], plek.cel[3] - a[1]];
    return o.doos;
  };

  // Het seizoen van de bomen (T.boomSeizoen in js/bos.js; js/tekenen.js zegt het elk beeld). Het vel van een seizoen laadt
  // pas als het seizoen er is, en tot het er is, staan ze in de zomer: zo staat er nooit een gat.
  let seizoenNu = 'zomer';
  S.zetSeizoen = function (seizoen) {
    seizoenNu = seizoen;
    for (const v of Object.values(T.TEGELS || {})) if (v.seizoen === seizoen) laadAlsNodig(v.bestand);
  };
  // Het seizoen waarin de bomen en het groen eronder nu echt getekend worden: dat van nu als zijn vellen er zijn (de bomen
  // en de begroeiing), anders de zomer. Voor wat het in een buffer legt (het groen dat plat in de grond ligt, het bos om
  // de kaart ver uitgezoomd): dat moet opnieuw als dit verandert.
  S.seizoenVanDeBomen = () => {
    if (seizoenNu === 'zomer' || !T.TEGELS) return 'zomer';
    const vellen = Object.values(T.TEGELS).filter((v) => v.seizoen === seizoenNu);
    return vellen.length && vellen.every((v) => beelden.has(v.bestand)) ? seizoenNu : 'zomer';
  };

  // `wind`, als meegegeven, is de windwaarde voor dít voorwerp (-1..1, T.windWaarde in
  // js/main.js). Weegt de soort niets mee (of wordt geen windwaarde meegegeven), dan gewoon het
  // stilstaande beeld — precies zoals voorheen. Een tekening met een eigen bestand (een huis, een
  // gebouw) laadt de eerste keer dat hij gevraagd wordt, en tot hij er is, is het antwoord null.
  S.buiten = function (velNaam, id, wind) {
    const v = T.TEGELS && T.TEGELS[velNaam];
    const eigen = v && eigenBestand(velNaam, id);
    const bestand = eigen || (v && v.bestand);
    const plek = bestand && S.celVan(velNaam, id);
    if (!plek || (eigen && !laadAlsNodig(eigen))) return null;
    const [x, y, b, h] = plek.cel;
    const gewicht = wind != null && windGewicht(v.tiles[id].naam);
    if (!gewicht) return onthoud(`buiten,${velNaam},${id}`, () => stuk(bestand, x, y, b, h, plek.anker));
    const stand = standVan(wind);
    return onthoud(`buitenwind,${velNaam},${id},${stand}`, () => bakWindStand(bestand, x, y, b, h, plek.anker, gewicht, stand));
  };
  // Een windwaarde (-1..1) als stand: 0 is sterk terug, WIND_STANDEN - 1 sterk mee.
  function standVan(wind) {
    const midden = (WIND_STANDEN - 1) / 2;
    return Math.max(0, Math.min(WIND_STANDEN - 1, Math.round(midden + Math.max(-1, Math.min(1, wind)) * midden)));
  }
  // Voor de vaste rijen in js/tekenen.js (vraag 178, B2): de stand bij een windwaarde, en hoeveel beelden er geladen zijn
  // (komt er een bij, dan kan de tekening van een boom anders zijn, zie onthoudVoorwerp).
  S.windStand = standVan;
  S.geladenNr = () => geladenNr;

  // Het plaatje van een voorwerp op de kaart, in zijn vorm en zijn seizoen (S.tekeningVan), zoals het onthouden is.
  S.buitenVan = function (v, wind) {
    const o = onthoudVoorwerp(v);
    if (wind == null || !o.wind) return o.stil || (o.stil = S.buiten(o.t.vel, o.t.id));
    const stand = standVan(wind);
    return o.standen[stand] || (o.standen[stand] = S.buiten(o.t.vel, o.t.id, wind));
  };

  // Hoe hoog steekt dit ding boven zijn tegel uit? Voor het aanwijzen met de muis. Het ankerpunt
  // is de voet, dus wat erboven zit is precies het stuk cel boven het anker.
  S.buitenHoogte = function (velNaam, id) {
    const plek = S.celVan(velNaam, id);
    return plek ? plek.anker[1] : 0;
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

  // De schandpaal (js/heer.js, gereedschap/pixelart/schandpaal.cjs): één rij met drie delen. `leeg`
  // (het halsijzer hangt open tegen de paal) en `bezet` (de ketting loopt naar wie ervoor staat)
  // hebben hun anker op de tegel van de paal; `halsijzer` komt over wie eraan staat heen, en zijn
  // anker is het midden van de halsband: dat hoort op zijn nek (S.nekHoogte).
  S.schandpaal = function (deel) {
    if (!gegevens || !gegevens.schandpaal) return null;
    const t = gegevens.schandpaal;
    const i = t.delen.indexOf(deel);
    if (i < 0) return null;
    return stuk(MAP + t.bestand, i * t.cel[0], 0, t.cel[0], t.cel[1], deel === 'halsijzer' ? t.halsAnker : t.anker);
  };

  // Hoe hoog boven zijn voeten de halsband om de nek van dit wezen komt, in pixels. Gemeten op de
  // vellen van wie aan de paal kan (de boer en de boerin: schandpaal.cjs). Voor een ander vel: die
  // van de boer.
  S.nekHoogte = function (e) {
    const t = gegevens && gegevens.schandpaal;
    if (!t) return 0;
    const l = e.beeldStand && e.beeldStand.laatste;
    const naam = (l && l.naam) || e.vel || S.figuurNaam(e.soort);
    const lijf = naam.replace(/-u\d+(-arm|-deftig)?$/, ''); // een uiterlijk (boer-u7, vraag 145; ook in andere kleren, boer-u7-deftig, vraag 149) heeft de nek van zijn lijf
    return t.nek[naam] != null ? t.nek[naam] : t.nek[lijf] != null ? t.nek[lijf] : t.nek.standaard;
  };

  // De meiboom op het plein (js/versiering.js, gereedschap/pixelart/meiboom.cjs): één tekening, met het anker op de
  // grond in het midden van de tegel. Null als het vel er niet is.
  S.meiboom = function () {
    if (!gegevens || !gegevens.meiboom) return null;
    const t = gegevens.meiboom;
    return stuk(MAP + t.bestand, 0, 0, t.cel[0], t.cel[1], t.anker);
  };

  // De kerstboom op het plein (js/versiering.js; gereedschap/pixelart/naar-spel.cjs, uit `kerstboom` in bomen.cjs): één
  // tekening, zoals de meiboom. Null als het vel er niet is.
  S.kerstboom = function () {
    if (!gegevens || !gegevens.kerstboom) return null;
    const t = gegevens.kerstboom;
    return stuk(MAP + t.bestand, 0, 0, t.cel[0], t.cel[1], t.anker);
  };

  // De pestbos naast de deur van een huis met een zieke (js/koorts.js, gereedschap/pixelart/pestbos.cjs): één tekening.
  // Null als het vel er niet is.
  S.pestbos = function () {
    if (!gegevens || !gegevens.pestbos) return null;
    const t = gegevens.pestbos;
    return stuk(MAP + t.bestand, 0, 0, t.cel[0], t.cel[1], t.anker);
  };

  // Een stapel naast een deur, die de ossenkar nog moet halen (js/kar.js, gereedschap/pixelart/stapels.cjs): een rij per
  // waar, een kolom per maat; `vol` van 0 tot 1 kiest klein, half of vol. Null als het vel of de waar er niet is.
  S.stapel = function (wat, vol) {
    const t = gegevens && gegevens.stapels;
    const rij = t ? t.waren.indexOf(wat) : -1;
    if (rij < 0) return null;
    const kolom = Math.min(t.maten.length - 1, Math.floor(Math.max(0, vol) * t.maten.length));
    return stuk(MAP + t.bestand, kolom * t.cel[0], rij * t.cel[1], t.cel[0], t.cel[1], t.anker);
  };
  // Wat geen eigen stapel heeft, ligt in de manden, kratten, zakken en tonnen van de markt (werklijst C, stap 3; Marcel,
  // 14 okt: "d ja"): welke bij welke waar; de rest in zakken. Planken liggen op de houtstapel.
  const IN_DE_MAND = {
    groente: 'mand kolen', eieren: 'mand leeg', brood: 'krat brood', // geen tekst
    wol: 'krat wol', laken: 'krat wol', huiden: 'krat wol', leer: 'krat wol', riet: 'krat wol', // geen tekst
    vlees: 'ton leeg', vis: 'ton leeg', bier: 'ton leeg', wijn: 'ton leeg', vaten: 'ton leeg', // geen tekst
    graan: 'zak', meel: 'zak', hooi: 'zak',
  };
  const EIGEN_STAPEL = { planken: 'hout', klei: 'steen', kalk: 'steen' };
  // De stukken van een stapel om te tekenen: [{ deel, dx, dy }] (in beeldpunten vanaf de tegel), of [] zonder vel. Een
  // eigen stapel is één tekening; manden één, twee of drie naast elkaar, naar hoe vol hij is.
  S.stapelDelen = function (wat, vol) {
    const eigen = S.stapel(EIGEN_STAPEL[wat] || wat, vol);
    if (eigen) return [{ deel: eigen, dx: 0, dy: 0 }];
    const mand = S.mand(IN_DE_MAND[wat] || 'zak');
    if (!mand) return [];
    const plekken = [[0, 0], [-11, -4], [10, -5]];
    const n = Math.min(plekken.length, 1 + Math.floor(Math.max(0, vol) * plekken.length));
    // de achterste eerst, zodat de voorste ervoor staat
    return plekken.slice(0, n).sort((a, b) => a[1] - b[1]).map(([dx, dy]) => ({ deel: mand, dx, dy }));
  };

  // Het hol van een roedel wolven (js/beesten.js, gereedschap/pixelart/hol.cjs): één tekening, zoals de meiboom, met het
  // anker op de grond in het midden van de tegel. Null als het vel er niet is.
  S.hol = function () {
    if (!gegevens || !gegevens.hol) return null;
    const t = gegevens.hol;
    return stuk(MAP + t.bestand, 0, 0, t.cel[0], t.cel[1], t.anker);
  };

  // De lantaarn in de hand van een groepsleider of de aanvoerder (js/tekenen.js, tekenLantaarn;
  // gereedschap/pixelart/lantaarn.cjs; werklijst vraag 171): een rij per stand van het schommelen (`scheef`: -1 de
  // onderkant naar links, 0 recht, 1 naar rechts), een kolom per beeld van de vlam, met het anker waar de hand het hengsel
  // vasthoudt; `laag` is 'heel' (de lantaarn) of 'gloed' (alleen het hoorn en de vlam). Null als het vel er niet is.
  S.lantaarn = function (vlam, scheef, laag = 'heel') {
    const t = gegevens && gegevens.lantaarn;
    if (!t) return null;
    const rij = Math.max(0, t.lagen.indexOf(laag)) * t.standen.length + Math.max(0, t.standen.indexOf(scheef));
    return stuk(MAP + t.bestand, (vlam % t.vlammen) * t.cel[0], rij * t.cel[1], t.cel[0], t.cel[1], t.anker);
  };
  // Waar de hand zit die de lantaarn draagt, in het beeld dat dit wezen het laatst kreeg (e.beeldStand.laatste, S.wezen):
  // [dx, dy, scheef] tegen het anker van zijn vel (beelden/handen.js, T.HANDEN, van lantaarn.cjs --handen), of null als
  // zijn vel of zijn houding er geen heeft.
  S.handVan = function (e) {
    const l = e.beeldStand && e.beeldStand.laatste;
    const H = T.HANDEN;
    if (!l || !H || H.vellen[l.naam] == null) return null;
    const rij = H.sets[H.vellen[l.naam]][l.houding];
    const beelden = rij && rij[H.richtingen.indexOf(l.richting)];
    return (beelden && beelden[l.beeld]) || null;
  };

  // Een wijnrank (js/wijngaard.js, gereedschap/pixelart/wijnrank.cjs; vraag 136): een rij per stand ('kaal', 'blad', 'vol',
  // 'leeg'), een kolom per variant, één tegel van een rij langs de x-as, met het anker op de grond in het midden van de
  // tegel. Null als het vel er niet is.
  S.wijnrank = function (stand, variant) {
    if (!gegevens || !gegevens.wijnrank) return null;
    const t = gegevens.wijnrank;
    const rij = Math.max(0, t.standen.indexOf(stand));
    return stuk(MAP + t.bestand, ((variant || 0) % t.varianten) * t.cel[0], rij * t.cel[1], t.cel[0], t.cel[1], t.anker);
  };

  // Een kraam van de markt (js/markt.js, gereedschap/pixelart/marktkraam.cjs; vraag 127): per waar ('groente', 'brood',
  // ...), vorm ('luifel', 'puntdak', 'zeil', 'kar') en lengte een rij cellen, vol en leeg, van elke kant waarheen hij
  // kijkt ('ZO', 'ZW', 'NW', 'NO'), met het anker op de grond in het midden van zijn eerste tegel. Bestaat die soort niet
  // op het vel, dan de eerste van dezelfde waar. Null als het vel er niet is.
  S.kraam = function (waar, vorm, lengte, leeg, richting) {
    if (!gegevens || !gegevens.marktkraam || !gegevens.marktkraam.soorten) return null;
    const t = gegevens.marktkraam;
    let rij = t.soorten.indexOf(`${waar}/${vorm}/${lengte}`);
    if (rij < 0) rij = Math.max(0, t.soorten.findIndex((s) => s.startsWith(`${waar}/`)));
    const r = Math.max(0, t.richtingen.indexOf(richting));
    const kol = (leeg ? t.richtingen.length : 0) + r;
    if (!laadAlsNodig(MAP + t.bestand)) return null;
    return stuk(MAP + t.bestand, kol * t.cel[0], rij * t.cel[1], t.cel[0], t.cel[1], t.anker);
  };
  // Een mand, kist, zak of ton naast een kraam ('mand appels', 'ton leeg', ...). Null als het vel er niet is.
  S.mand = function (naam) {
    const m = gegevens && gegevens.marktkraam && gegevens.marktkraam.manden;
    if (!m) return null;
    const i = m.namen.indexOf(naam);
    if (i < 0 || !laadAlsNodig(MAP + m.bestand)) return null;
    return stuk(MAP + m.bestand, i * m.cel[0], 0, m.cel[0], m.cel[1], m.anker);
  };

  // Het kamp van het lege begin (gereedschap/pixelart/kamp.cjs; js/begin.js): de tent, de bruine tent, de tent van een
  // roverskamp (js/rovers.js) of het afdak
  // (`vorm`, de rijen), met zijn opening naar ZO, ZW, NW of NO (de kolommen). Null als het vel er niet is.
  S.kamp = function (vorm, richting) {
    const t = gegevens && gegevens.kamp;
    if (!t || !laadAlsNodig(MAP + t.bestand)) return null;
    const rij = Math.max(0, t.soorten.indexOf(vorm));
    const kol = Math.max(0, t.richtingen.indexOf(richting));
    return stuk(MAP + t.bestand, kol * t.cel[0], rij * t.cel[1], t.cel[0], t.cel[1], t.anker);
  };
  // Het kampvuur: het brandt (acht beelden, op `tijd` in seconden), het smeult, of het is uit; een cel per beeld, en dan
  // een per stand.
  S.kampvuur = function (stand, tijd) {
    const t = gegevens && gegevens.kamp && gegevens.kamp.vuur;
    if (!t || !laadAlsNodig(MAP + t.bestand)) return null;
    const kol = stand === 'brandt' ? Math.floor((tijd || 0) * t.fps) % t.beelden : t.beelden + Math.max(0, t.standen.indexOf(stand) - 1);
    return stuk(MAP + t.bestand, kol * t.cel[0], 0, t.cel[0], t.cel[1], t.anker);
  };

  // ---------------------------------------------------------------- bouwfasen (tegels/bouwfasen/<tekening>.png, bouwfasen.js)
  //
  // Een gebouw in aanbouw: vijf fases tussen "net begonnen" en de afgewerkte tekening
  // (gereedschap/pixelart/bouwfasen.cjs, ontwerp/werklijst.md punt 2b). `tekeningNaam` is dezelfde
  // naam als T.GEBOUWEN.<soort>.tekening na "gebouwen/" (js/gebouwen.js zet 'm op het voorwerp),
  // `faseIndex` komt uit T.bouwFaseIndex (ook js/gebouwen.js). Elk gebouw heeft zijn eigen vel, dat
  // pas laadt als er een in aanbouw staat (vraag 114, 2a: alle fases samen waren 271 MB). Tot het er
  // is, en voor een gebouw zonder fases (kapel, watermolen, put, ...), geeft dit null, en tekent
  // tekenVoorwerp (js/tekenen.js) de afgewerkte tekening bleker, zoals vóór er fases waren.
  S.bouwfase = function (tekeningNaam, faseIndex) {
    const g = T.BOUWFASEN && tekeningNaam && T.BOUWFASEN.fasen[tekeningNaam];
    if (!g || !g.fasen.length) return null;
    const pad = TEGELMAP + g.bestand;
    if (!laadAlsNodig(pad)) return null;
    const i = Math.max(0, Math.min(g.fasen.length - 1, faseIndex));
    const f = g.fasen[i];
    return onthoud(`bouwfase,${tekeningNaam},${i}`, () => stuk(pad, f.x, f.y, f.b, f.h, f.anker));
  };

  // ---------------------------------------------------------------- sneeuw op de daken (tegels/daksneeuw/<naam>.png, daksneeuw.js)
  //
  // De sneeuw op een huis van de huizenbouwer (vraag 144, 4b): drie lagen per jonge tekening, een beetje, half en dik
  // (gereedschap/pixelart/huizen.cjs, schrijfDaksneeuw), elk een eigen plaatje dat pas laadt als die laag er ligt. Tot het
  // er is, of zonder sneeuw voor deze tekening, geeft dit null. Het anker is dat van het huis: js/tekenen.js legt hem erover.
  S.daksneeuw = function (naam, laag) {
    const lagen = T.DAKSNEEUW && naam && T.DAKSNEEUW.lagen[naam];
    const c = lagen && lagen[laag];
    if (!c) return null;
    const pad = TEGELMAP + c.bestand;
    if (!laadAlsNodig(pad)) return null;
    return onthoud(`daksneeuw,${naam},${laag}`, () => stuk(pad, 0, 0, c.b, c.h, c.anker));
  };

  // ---------------------------------------------------------------- brandfasen (tegels/brandfasen/<naam>.png, brandfasen.js)
  //
  // Een huis dat brandt of afbrandde (js/brand.js, T.brandfaseVan; vraag 144, 3): de fasen uit het huis zelf gesneden
  // (gereedschap/pixelart/ruines.cjs spel), op een eigen vel dat pas laadt als het brandt; van ingestort twee varianten,
  // en welke een huis krijgt, zegt `variant` (zijn plek). Tot het vel er is, of voor een huis zonder fasen, null.
  S.brandfase = function (naam, fase, variant = 0) {
    const g = T.BRANDFASEN && naam && T.BRANDFASEN.fasen[naam];
    if (!g) return null;
    const welk = fase === 'ingestort' && variant % 2 ? 'ingestort2' : fase;
    const i = g.fasen.findIndex((f) => f && f.naam === welk);
    if (i < 0) return null;
    const pad = TEGELMAP + g.bestand;
    if (!laadAlsNodig(pad)) return null;
    const f = g.fasen[i];
    return onthoud(`brandfase,${naam},${i}`, () => stuk(pad, f.x, f.y, f.b, f.h, f.anker));
  };

  // ---------------------------------------------------------------- gras op een weide
  //
  // Een weide (js/akkers.js, bestemming 'weide') ligt op de kale akkergrond van de kaart; het spel
  // legt er gewone grastegels overheen, dezelfde als de kaart zelf voor gras gebruikt: de vlakke
  // grastegels van het vel "rand" (gereedschap/tiled/maak-gehucht.cjs, VLAK.gras), of anders de
  // stempel van vier bij vier uit het vel "grond". Welke van de varianten, ligt per tegel vast
  // (T.akkerVariant), zodat het gras niet flikkert. Een eigen weide met bloemen is later tekenwerk.
  let grasIds = null;
  function grasVel() {
    if (grasIds) return grasIds;
    for (const velNaam of ['rand', 'grond']) {
      const v = T.TEGELS && T.TEGELS[velNaam];
      if (!v || !v.bestand) continue;
      const ids = [];
      v.tiles.forEach((t, id) => {
        if (t && t.naam === 'gras' && (t.groep === 'vlak' || t.groep === 'stempel')) ids.push(id);
      });
      if (ids.length) return (grasIds = { velNaam, ids });
    }
    return (grasIds = { velNaam: null, ids: [] });
  }

  S.grasTegel = function (x, y) {
    const g = grasVel();
    if (!g.ids.length) return null;
    return S.buiten(g.velNaam, g.ids[T.akkerVariant(x, y, g.ids.length)]);
  };

  // De rand van een weide. De grond van de kaart is een terreinset met hoeken: elke tegel zegt in
  // zijn groep welke soort er op zijn vier hoeken ligt. "gras over zandpad: boven+rechts" is gras op
  // de noord- en de oosthoek en zandpad op de andere twee (maak-gehucht.cjs, terreinGid). Zo loopt
  // de kale grond van een akker een halve tegel door op de tegels eromheen; wordt het veld weide,
  // dan moet die rand mee gras worden, anders ligt er een zandpad langs twee kanten. js/tekenen.js
  // zegt welke hoeken nu gras zijn (S.grondHoeken, dan aangepast), en hier komt de tegel bij die
  // precies die hoeken heeft (S.grondMetHoeken), of null als het vel hem niet heeft.
  const HOEKEN = ['boven', 'rechts', 'onder', 'links']; // noord, oost, zuid, west: zo staan ze in de groep
  const hoekenVan = new Map(); // "vel,id" → [n, o, z, w], of null
  const tegelsMetHoeken = new Map(); // vel → Map("vlak:gras" of de groep zelf → [id])

  S.grondHoeken = function (velNaam, id) {
    const sleutel = velNaam + ',' + id;
    if (hoekenVan.has(sleutel)) return hoekenVan.get(sleutel);
    const v = T.TEGELS && T.TEGELS[velNaam];
    const t = v && v.tiles[id];
    let hoeken = null;
    if (t && t.groep === 'vlak' && t.naam) hoeken = [t.naam, t.naam, t.naam, t.naam];
    const m = t && /^(\S+) over (\S+): (\S+)$/.exec(t.groep || '');
    if (m) {
      const boven = m[3].split('+');
      hoeken = HOEKEN.map((h) => (boven.includes(h) ? m[1] : m[2]));
    }
    hoekenVan.set(sleutel, hoeken);
    return hoeken;
  };

  // Eerst in het vel van de kaart zelf, dan in de andere vellen met grond: de grond van het eiland (tegels/kust.png:
  // de zee, het strand, het veen, het broek) staat naast die van rand, en een tegel aan de rand van de kaart of onder
  // een weide kan van het ene vel zijn terwijl zijn buur op het andere ligt (werklijst vraag 117, B van 2a).
  const GROND_VELLEN = ['rand', 'kust'];
  S.grondMetHoeken = function (velNaam, hoeken, x, y) {
    for (const vel of [velNaam, ...GROND_VELLEN.filter((v) => v !== velNaam)]) {
      const tegel = grondMetHoekenIn(vel, hoeken, x, y);
      if (tegel) return tegel;
    }
    return null;
  };
  function grondMetHoekenIn(velNaam, hoeken, x, y) {
    let index = tegelsMetHoeken.get(velNaam);
    if (!index) {
      index = new Map();
      const v = T.TEGELS && T.TEGELS[velNaam];
      if (v && v.bestand) {
        v.tiles.forEach((t, id) => {
          if (!t || !t.groep) return;
          const sleutel = t.groep === 'vlak' ? `vlak:${t.naam}` : t.groep;
          if (!index.has(sleutel)) index.set(sleutel, []);
          index.get(sleutel).push(id);
        });
      }
      tegelsMetHoeken.set(velNaam, index);
    }
    const soorten = [...new Set(hoeken)];
    let ids = null;
    if (soorten.length === 1) ids = index.get(`vlak:${soorten[0]}`);
    else if (soorten.length === 2) {
      // De set heet naar één van de twee ("gras over zandpad"); probeer beide kanten.
      for (const [a, b] of [soorten, [soorten[1], soorten[0]]]) {
        ids = index.get(`${a} over ${b}: ${HOEKEN.filter((h, i) => hoeken[i] === a).join('+')}`);
        if (ids) break;
      }
    }
    if (!ids || !ids.length) return null;
    return S.buiten(velNaam, ids[T.akkerVariant(x, y, ids.length)]);
  }

  // ---------------------------------------------------------------- de bruggen (gereedschap/pixelart/bruggen-vel.cjs)
  //
  // Een brug van het eiland (js/eiland.js, legBruggen) is drie tegels breed en van elke lengte. Het vel heeft hem in
  // stukken van één tegel, in drie lagen (0: het dek, 1: wat ervóór boven het wegdek uitsteekt, 2: wat erachter), geknipt
  // uit een paar hele bruggen (de monsters); welk stuk waar hoort, zegt S.brugMonster. Het vel laadt pas als er een brug in
  // beeld komt.
  let brugIndex = null; // 'naam as monster i k laag' → [sx, sy, b, h, ax, ay, voeten], uit de regels van de beschrijving
  // De bogen van een stenen brug over L tegels, zoals de tekening ze legt (bruggen.cjs, bogen): twee tegels per boog, bij
  // een oneven lengte in het midden één van drie, over één tegel een klein boogje. [van, tot] in tegels.
  function bogen(L) {
    if (L <= 1) return [[0, 1]];
    const uit = [];
    const drie = L % 2;
    const paren = (L - 3 * drie) / 2;
    let a = 0;
    for (let i = 0; i < Math.floor(paren / 2); i++, a += 2) uit.push([a, a + 2]);
    if (drie) uit.push([a, (a += 3)]);
    while (a < L) uit.push([a, (a += 2)]);
    return uit;
  }
  // Welk monster, en welke tegel daarin, op tegel i (van -1, het eerste landhoofd, tot L) van een brug. Een stenen brug van
  // 1, 2, 3, 5 of 9 tegels is een monster zelf; een andere komt uit eenheden van één boog: het begin (het landhoofd en de
  // eerste boog), de bogen ertussen en het eind (de laatste boog en het landhoofd), uit L9, en het begin uit L5 als de
  // eerste boog drie tegels is. Een naad tussen twee eenheden valt midden op een pijler. Een schuine stenen brug heeft een
  // boog per stap, en komt uit L1 of L3. Een jukbrug komt uit L3 (twee stukken met een juk om en om, het laatste zonder),
  // een boogbrug is er heel.
  S.brugMonster = function (soort, L, i, schuin = false) {
    if (soort === 'juk') return ['L3', i < 0 ? -1 : i === L ? 3 : i === L - 1 ? 2 : i % 2];
    if (soort === 'boog' || L === 1 || (!schuin && [2, 3, 5, 9].includes(L))) return ['L' + L, i];
    // schuin een boog per stap, met een pijler tussen elke twee: het begin, een stap ertussen en het eind, uit L3
    if (schuin) return ['L3', i < 0 ? -1 : i === L ? 3 : i === 0 ? 0 : i === L - 1 ? 2 : 1];
    const bg = bogen(L);
    if (i === L) return ['L9', 9];
    const j = i < 0 ? 0 : bg.findIndex(([v, t]) => i >= v && i < t);
    const [v, t] = bg[j];
    if (j === 0) return [t - v === 3 ? 'L5' : 'L9', i];
    if (j === bg.length - 1) return ['L9', 7 + i - v];
    return ['L9', (t - v === 3 ? 2 : 5) + i - v];
  };
  // Een houten boogbrug zonder monster (langer dan de tekening ze heeft) wordt een jukbrug.
  const brugSoort = (g, brug) => (brug.soort === 'boog' && !g.stukken.boog[brug.as]['L' + brug.L] ? 'juk' : brug.soort);
  // Het stuk van een brug op tegel i (langs) en k (de rij) in laag 0, 1 of 2, met de steen van een stenen brug
  // ('veldsteen', 'zandsteen' of 'baksteen'); null als het er (nog) niet is, of als die laag daar leeg is.
  S.brugStuk = function (brug, steen, i, k, laag) {
    const g = gegevens && gegevens.bruggen;
    if (!g || !laadAlsNodig(MAP + g.bestand)) return null;
    if (!brugIndex) {
      brugIndex = new Map();
      for (const [naam, perAs] of Object.entries(g.stukken)) {
        for (const [as, perMonster] of Object.entries(perAs)) {
          for (const [m, lijst] of Object.entries(perMonster)) {
            for (const regel of lijst) {
              const delen = regel.split(' ');
              const [si, sk, sl, ...r] = delen.slice(0, 9).map(Number);
              // de voeten van de pijlers in het dek (bruggen-vel.cjs, voetenVan): [x, b, ys, yd] binnen het stuk
              r.push(delen[9] ? delen[9].split(';').map((v) => v.split(',').map(Number)) : null);
              brugIndex.set(`${naam} ${as} ${m} ${si} ${sk} ${sl}`, r);
            }
          }
        }
      }
    }
    const soort = brugSoort(g, brug);
    const [m, mi] = S.brugMonster(soort, brug.L, i, T.brugSchuin(brug));
    const sleutel = `${soort === 'steen' ? `steen-${steen}` : soort} ${brug.as} ${m} ${mi} ${k} ${laag}`;
    const r = brugIndex.get(sleutel);
    return r ? onthoud(`brug ${sleutel}`, () => brugStukMetVoeten(stuk(MAP + g.bestand, r[0], r[1], r[2], r[3], [r[4], r[5]]), r[6])) : null;
  };
  const brugStukMetVoeten = (deel, voeten) => deel && Object.assign(deel, { voeten });
  // Hoe hoog het wegdek van een brug ligt (pixels boven het maaiveld) op a stappen langs de brug vanaf de rand van zijn
  // eerste stap water (van -1 tot L + 1), zoals de tekening het heeft (bruggen.cjs, dekOp): een landhoofd loopt op in een
  // S-bocht, een boogbrug buigt, zonder knik. Een stap is een tegel, schuin √2. Zonder de beschrijving 0.
  const sBocht = (t) => t * t * (3 - 2 * t);
  S.brugDek = function (brug, a) {
    const g = gegevens && gegevens.bruggen;
    if (!g) return 0;
    const m = g.maten;
    const soort = brugSoort(g, brug);
    const dek = m.dek[soort];
    if (a < 0) return m.aanloop + (dek - m.aanloop) * sBocht(Math.min(1, Math.max(0, a + 1)));
    if (a > brug.L) return m.aanloop + (dek - m.aanloop) * sBocht(Math.min(1, Math.max(0, brug.L + 1 - a)));
    if (soort !== 'boog') return dek;
    const stap = brug.as === 'zn' || brug.as === 'wo' ? Math.SQRT2 : 1;
    return dek + (m.bult[0] + m.bult[1] * brug.L * stap) * Math.sin((Math.PI * a) / brug.L) ** 2;
  };

  // ---------------------------------------------------------------- het graan (gereedschap/pixelart/graan-vel.cjs)
  //
  // Een vel met per stadium een eigen band: geploegd/kiemend/gemaaid hebben alleen varianten
  // (S.graanTegel), groen/rijp ook windbeelden en een achter/voorlaag om een wezen tussenin te
  // zetten (S.graanLaag; js/tekenen.js roept 'm twee keer aan, vóór en ná het wezen). Welk
  // stadium en welke variant een tegel heeft, weet js/akkers.js (T.akkerStadium, T.akkerVariant,
  // T.windBeeld) — hier wordt alleen het plaatje erbij gezocht.
  S.graanVarianten = () => (gegevens && gegevens.graan ? gegevens.graan.varianten : 0);

  S.graanTegel = function (stadium, variant) {
    const g = gegevens && gegevens.graan;
    const st = g && g.stadia[stadium];
    if (!st) return null;
    const v = ((variant % g.varianten) + g.varianten) % g.varianten;
    return onthoud(`graan,${stadium},${v}`, () => stuk(MAP + g.bestand, v * st.cel[0], st.y0, st.cel[0], st.cel[1], st.anker));
  };

  S.graanLaag = function (stadium, variant, laag, frame) {
    const g = gegevens && gegevens.graan;
    const st = g && g.stadia[stadium];
    if (!st || !st.frames) return null;
    const v = ((variant % g.varianten) + g.varianten) % g.varianten;
    const f = ((frame % st.frames) + st.frames) % st.frames;
    const kol = (laag === 'voor' ? st.frames : 0) + f;
    return onthoud(`graan,${stadium},${v},${laag},${f}`, () => stuk(MAP + g.bestand, kol * st.cel[0], st.y0 + v * st.cel[1], st.cel[0], st.cel[1], st.anker));
  };

  // ---------------------------------------------------------------- de houding van een wezen

  // Wat doet dit wezen nu? Alles komt uit de spelstaat zelf, zodat er geen tweede boekhouding
  // ontstaat die uit de pas kan lopen: `dood` en `sterfTijd` zijn sterven, `flits` is net
  // geraakt, `uitval` is uithalen, en een pad betekent lopen.
  //
  // Wat wél wordt onthouden, staat in `e.beeldStand`: hoe ver de voeten gelopen hebben (zodat
  // de pas niet glijdt), welke klap nog aan het spelen is, en het laatst getekende beeld.
  function stand(e) {
    if (!e.beeldStand) {
      // Wie nog geen stap zette, kijkt naar het zuiden, of naar de kant die hij meekreeg (een dier,
      // js/vee.js: anders begint een kudde allemaal dezelfde kant op te kijken).
      const richting = e.beginRichting || 'Z';
      e.beeldStand = { afgelegd: 0, x: e.x, y: e.y, richting, eenmalig: null, tot: 0, begin: 0, flits: 0, laatste: null };
    }
    return e.beeldStand;
  }

  // Welke figuur een wezen draagt. De aanvoerder draagt het vel van een gewone dorpeling, net als de
  // menigte; welk, kiest zijn zaad. (Tot 25 sep was hij de tovenaar van het oude spel.) Wie nog geen
  // eigen vel heeft, mag er een lenen (T.MENSEN, vel: 'boer'): zo lopen de vijf boeren van het
  // gehucht rond op het vel van de boer en de boerin. Zie ontwerp/werklijst.md, fase B2b. (Tot ronde 2
  // van het snoeien droeg een boer met een karakter dat op zijn lijf, boer-zanger.) Een dier
  // (js/vee.js) heeft geen vel onder zijn soort, maar een per kleur: `vel` is koe0, koe1 of koe2.
  // Een bewoner met een uiterlijk (vraag 145; T.kiesUiterlijk in js/bewoners.js) draagt het vel van dat uiterlijk
  // (boer-u7, meisje-u3), als het er is; anders het vel van zijn leeftijd. Een soldaat draagt het vel van zijn soort
  // (speerman; van de generator, ontwerp/beelden-van-de-generator.md), als dat er is.
  function eigenFiguur(e) {
    const soldaat = e.bewoner && e.bewoner.soldaat && e.bewoner.soldaat.soort;
    if (soldaat && S.figuurGegevens(soldaat)) return soldaat;
    const alsDorpeling = e.soort === 'dorpeling' || e.soort === 'aanvoerder';
    const naam = alsDorpeling ? dorpelingVel(e.zaad || 0) : S.figuurNaam(e.soort);
    if (S.figuurGegevens(naam) || !e.vel) return naam;
    // Alleen een bewoner heeft een uiterlijk.
    const eigen = e.bewoner ? S.inKleren(e, S.figuurVanUiterlijk(e, T.UITERLIJK_LIJF[e.vel])) : null;
    return eigen || e.vel;
  }
  // Het vel van een uiterlijk in de kleren van zijn stand (vraag 149; T.klerenVan in js/bewoners.js): boer-u7-arm of
  // boerin-u3-deftig, als dat vel er is; anders zijn gewone. Alleen staand en lopend: het werk gaat in de gewone kleren.
  S.inKleren = (e, naam) => {
    const trap = naam ? T.klerenVan(e.bewoner) : 'gewoon';
    return trap !== 'gewoon' && S.figuurGegevens(`${naam}-${trap}`) ? `${naam}-${trap}` : naam;
  };
  // Het vel van het uiterlijk van een bewoner, met deze naam ervoor (een lijf als boer, of een werk als zaaier), of
  // null als hij geen uiterlijk heeft of dat vel er niet is.
  S.figuurVanUiterlijk = (e, voor) => {
    const p = e.bewoner;
    if (!voor || !p || p.uiterlijk == null) return null;
    const naam = `${voor}-u${p.uiterlijk}`;
    return S.figuurGegevens(naam) ? naam : null;
  };
  // En wat hij nu draagt: een boer die aan het maaien is (T.werkOogstBij, js/akkers.js) leent
  // zolang het vel van de maaier in plaats van zijn eigen boer/boerin-vel — maar alleen als dat vel
  // er ook echt is, anders blijft hij gewoon zichzelf staan (geen kunst mist dan nooit iemand helemaal).
  //
  // Zo ook wie op zijn land werkt (e.werkt, js/veldwerk.js; werklijst vraag 111, b): de zaaier, de wieder (ook voor
  // spitten en mest uitrijden) of de sprokkelaar met zijn bundel hout. Zolang hij met dat werk bezig is, ook op weg naar
  // de volgende tegel of even rustend, draagt hij het vel van het werk, zodat hij niet bij elke tegel van kleren wisselt;
  // naar het bos loopt hij nog met lege handen, en met de bundel op zijn rug weer naar huis (e.draagt). Mist het vel of
  // de houding die hij nu nodig heeft, dan blijft hij zichzelf.
  //
  // Een boerin (vel `boerin`) draagt het werkvel van een vrouw: de maaister, de zaaister, de wiedster of de
  // sprokkelaarster (werklijst vraag 111; Marcel, 5 okt: "b ja"), en zolang dat er niet is, dat van de man.
  const WERKFIGUREN = {
    zaaien: { figuur: 'zaaier', houding: 'zaaien' },
    wieden: { figuur: 'wieder', houding: 'wieden' },
    spitten: { figuur: 'wieder', houding: 'wieden' },
    mesten: { figuur: 'wieder', houding: 'wieden' },
    // In het bos (js/veldwerk.js, vraag 107, f): een boom omhakken en een stronk rooien, met de bijl.
    hakken: { figuur: 'hakker', houding: 'hakken' },
    rooien: { figuur: 'hakker', houding: 'hakken' },
    // Meebouwen (js/bouwen.js, vraag 152, 1d): tot er een bouwer met een hamer is om te tekenen, met de bijl; en het
    // egaliseren (vraag 182), tot er een graver met een schop is, met de schoffel van de wieder.
    bouwen: { figuur: 'hakker', houding: 'hakken' },
    egaliseren: { figuur: 'wieder', houding: 'wieden' },
    sprokkelen: { figuur: 'sprokkelaar', houding: 'rapen' },
    // In de wijngaard (js/wijngaard.js, vraag 136): plukken met de mand aan de arm, en met de volle mand naar huis.
    plukken: { figuur: 'plukker', houding: 'plukken' },
    // De oogst binnenhalen (js/veldwerk.js, vraag 140): het zwad binden, naar de hokken lopen om ze te dragen, en in de
    // winter dorsen in de deur van de schuur.
    binden: { figuur: 'binder', houding: 'binden' },
    dragen: { figuur: 'binder', houding: 'lopen' },
    dorsen: { figuur: 'dorser', houding: 'dorsen' },
    // Aan de zaagbok van de zagerij (js/veldwerk.js, vraag 168): de spanzaag heen en weer.
    zagen: { figuur: 'zager', houding: 'zagen' },
  };
  // Wat hij draagt, en welk vel daarbij hoort als hij niet aan het werk is (onderweg naar huis of de schuur).
  const DRAAGT = { bundel: 'sprokkelaar', mand: 'plukker', schoof: 'drager' };
  const WERKVELLEN = ['maaier', 'zaaier', 'wieder', 'sprokkelaar', 'hakker', 'plukker', 'binder', 'drager', 'dorser', 'zager'];
  const VAN_EEN_VROUW = {
    maaier: 'maaister', zaaier: 'zaaister', wieder: 'wiedster', sprokkelaar: 'sprokkelaarster', hakker: 'hakster',
    plukker: 'plukster', binder: 'binster', drager: 'draagster', dorser: 'dorster', zager: 'zaagster',
  };
  // Een vrouw: een boerin (vel `boerin`), of een bewoner die een vrouw is (js/bewoners.js, e.bewoner).
  const isVrouw = (e) => e.vel === 'boerin' || !!(e.bewoner && e.bewoner.geslacht === 'vrouw');
  // Wie een uiterlijk heeft en volwassen is, werkt in dat uiterlijk (zaaier-u7; vraag 145), als dat vel er is.
  const werkVelVan = (e, naam) => {
    const gewoon = isVrouw(e) && S.figuurGegevens(VAN_EEN_VROUW[naam]) ? VAN_EEN_VROUW[naam] : naam;
    const volwassen = e.bewoner && e.bewoner.leeftijd === 'volwassen';
    return (volwassen && S.figuurVanUiterlijk(e, gewoon)) || gewoon;
  };
  // Het vel waarmee deze boer of boerin maait (ook voor test/vellen.test.cjs).
  S.maaierVan = (e) => werkVelVan(e, 'maaier');
  function werkFiguur(e) {
    const wf = e.werkt ? WERKFIGUREN[e.werkt.soort] : null;
    const bundel = e.draagt === 'bundel';
    const vel = wf && (wf.figuur !== 'sprokkelaar' || bundel) ? wf.figuur : DRAAGT[e.draagt] || null;
    const naam = vel && werkVelVan(e, vel);
    if (!naam || !S.figuurGegevens(naam)) return null;
    const houding = e.pad && e.pad.length ? 'lopen' : wf && e.werkt.tot != null && !e.werkt.rust ? wf.houding : 'staan';
    return S.heeftHouding(naam, houding) ? { naam, houding } : null;
  }
  const figuurNu = (e) => {
    const maaier = e.maait && werkVelVan(e, 'maaier');
    if (maaier && S.figuurGegevens(maaier)) return maaier;
    const werk = werkFiguur(e);
    return werk ? werk.naam : eigenFiguur(e);
  };

  // De houding van dit wezen op dit moment: { naam, houding, richting, fase }. `naam` is het figuur
  // op het vel (figuurNu).
  S.houding = function (spel, e) {
    const naam = figuurNu(e);
    const f = S.figuurGegevens(naam);
    if (!f) return null;
    const st = stand(e);
    const dx = e.x - st.x;
    const dy = e.y - st.y;
    st.afgelegd += Math.hypot(dx, dy);
    st.x = e.x;
    st.y = e.y;

    // Kijkrichting: onderweg naar de volgende tegel kijken, anders blijven staan zoals je stond —
    // of, wie een vaste kant op moet kijken zolang hij stilstaat (`e.kijkt`: aan de schandpaal met
    // zijn rug naar de paal, js/heer.js), die kant op. `e.kijkt` kan ook een plek zijn: wie een praatje
    // maakt, kijkt naar de anderen (js/praatje.js). Wie naast zijn werk staat (een boom die hij omhakt,
    // e.werkt.op, js/veldwerk.js), kijkt ernaar. Een soldaat op zijn post kijkt de kant van zijn formatie op
    // (post.kijk, js/kiezen.js), behalve als hij vecht: dan houdt hij de kant van zijn laatste slag.
    if (e.pad && e.pad.length) st.richting = S.richtingVan(e.pad[0].x - e.x, e.pad[0].y - e.y);
    else if (dx || dy) st.richting = S.richtingVan(dx, dy);
    else if (e.werkt && e.werkt.op) st.richting = S.richtingVan(e.werkt.op.x - e.x, e.werkt.op.y - e.y);
    else if (e.post && e.post.kijk && !e.doelwit && e.tx === e.post.x && e.ty === e.post.y) st.richting = S.richtingVan(e.post.kijk.x, e.post.kijk.y);
    else if (typeof e.kijkt === 'string') st.richting = e.kijkt;
    else if (e.kijkt && typeof e.kijkt === 'object' && !e.doelwit && (e.kijkt.x !== e.x || e.kijkt.y !== e.y)) st.richting = S.richtingVan(e.kijkt.x - e.x, e.kijkt.y - e.y);
    if (e.uitval) st.richting = S.richtingVan(e.uitval.doel.x - e.x, e.uitval.doel.y - e.y);

    // Eenmalige houdingen: uithalen en geraakt worden. Ze worden vastgehouden tot ze zijn
    // afgelopen, ook als het spel intussen alweer verder is.
    const zet = (houding) => {
      const duur = S.houdingDuur(naam, houding);
      if (!duur) return;
      st.eenmalig = houding;
      st.begin = spel.tijd;
      st.tot = st.begin + duur;
    };
    if (e.uitval) {
      if (st.uitval !== e.uitval) {
        st.uitval = e.uitval;
        zet(S.heeftHouding(naam, 'slaan') ? 'slaan' : 'aanval');
      }
    } else st.uitval = null;
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
    // Maaien is geen eenmalige houding (zoals slaan) maar een lus, zolang T.werkOogstBij
    // (js/akkers.js) deze tegel nog bezig is: dezelfde manier van doorlopen als het zo-meteen
    // stilstaan hieronder, alleen met de houding 'maaien' in plaats van 'staan'.
    if (e.maait && naam === werkVelVan(e, 'maaier') && S.heeftHouding(naam, 'maaien')) {
      const duur = S.houdingDuur(naam, 'maaien') || 1;
      return { naam, houding: 'maaien', richting: st.richting, fase: ((spel.tijd + e.fase) / duur) % 1 };
    }
    // Het werk op zijn land (zaaien, wieden, hout rapen) is net zo'n lus; lopen en staan gaan hieronder zoals altijd.
    const werk = e.werkt && werkFiguur(e);
    if (werk && werk.naam === naam && werk.houding !== 'lopen' && werk.houding !== 'staan') {
      const duur = S.houdingDuur(naam, werk.houding) || 1;
      return { naam, houding: werk.houding, richting: st.richting, fase: ((spel.tijd + e.fase) / duur) % 1 };
    }
    if (e.pad && e.pad.length) {
      // Een hert dat vlucht (js/beesten.js), rent in sprongen, als zijn vel het kan.
      const houding = e.rent && f.houdingen.rennen ? 'rennen' : 'lopen';
      const h = f.houdingen[houding];
      // Twee passen per cyclus: zo schuift de voet op de grond precies mee met het spel en
      // glijdt hij niet. `stap` staat in het vel beschreven, in tegels per pas.
      const cyclus = 2 * ((h && h.stap) || 0.8);
      return { naam, houding, richting: st.richting, fase: (st.afgelegd / cyclus) % 1 };
    }
    // Stilstaan: ademen, elk wezen in zijn eigen tempo (e.fase).
    // Een dier (js/vee.js) graast, staat te herkauwen of ligt. Wat het nu doet, komt uit de tijd en
    // zijn zaad (T.rustVanDier), niet uit een worp per beeld: zo flikkert het niet, en gaat niet de
    // hele kudde tegelijk liggen.
    // Het wild (js/beesten.js) zegt het zelf: thuis ligt het, aan de bosrand graast een hert of kijkt het om zich heen.
    const rust = e.dier && T.rustVanDier ? T.rustVanDier(e, spel.tijd) : (e.beest && e.rust) || 'staan';
    const staan = f.houdingen[rust] ? rust : f.houdingen.staan ? 'staan' : Object.keys(f.houdingen)[0];
    const duur = S.houdingDuur(naam, staan) || 1;
    return { naam, houding: staan, richting: st.richting, fase: ((spel.tijd + e.fase) / duur) % 1 };
  };

  // Het beeld dat bij die houding hoort, in één stap. Welk beeld het werd, onthoudt het wezen
  // (beeldStand.laatste): de halsband van de schandpaal zit in elk beeld ergens anders.
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
})(globalThis.Spel = globalThis.Spel || {});
