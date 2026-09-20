// Een kaart die Marcel in Tiled tekent, inlezen als een gewone wereld. T.laadKaart(kaart) neemt
// een ingelezen .tmj (zie kaarten/kaarten.js, gemaakt door gereedschap/pixelart/naar-kaarten.cjs)
// en geeft terug wat js/wereld.js nu met de hand opschrijft: begaanbaar, vast, voorwerpen,
// wezens, deuren. wereld.js zelf verandert niet mee: T.isBegaanbaar, T.isVast, T.raakt, T.tegel,
// T.deurOp en T.voorwerpOp werken op zo'n ingelezen wereld precies als op T.maakWereld().
//
// Hoe de keten aan elkaar hangt (zie ontwerp/wereld.md § "De kaarten tekenen we in een editor"):
//   dorp.cjs, dorp2.cjs, bomen.cjs  (de kunst)
//     -> npm run tiled   (naar-tiled.cjs)   -> tegels/*.png + tegels/*.tsx + tegels/tegels.js
//   Marcel tekent in Tiled, met die vellen              -> kaarten/*.tmj
//     -> npm run kaarten (naar-kaarten.cjs)              -> kaarten/kaarten.js (T.KAARTEN)
//   T.laadKaart(T.KAARTEN.proef)                         -> een wereld, zoals T.maakWereld()
//
// Eigenschappen die Marcel in Tiled op een TEGEL zet (in de .tsx, geldt voor elk exemplaar, zie
// naar-tiled.cjs): "naam" (de soort), "vast" (of je erdoorheen kunt) en bij een gebouw "beslaat"
// ("6x8": hoeveel tegels de voet inneemt, vanaf de tegel die je aanklikt naar rechtsonder toe).
//
// Eigenschappen die Marcel op een OBJECT zet (per geplaatst exemplaar, in Tiled se "Properties"):
//   wezen      welk wezen hier staat: een naam die T.maakWezen kent ('held' voor de beginplek
//              van de tovenaar, 'wim', 'slijm', 'skelet', later de bosvijanden). Verkeerd
//              gespeld? Dan komt er een waarschuwing op de console en slaan we het object over.
//   zaad       in plaats van "wezen": zet er een gewone dorpeling neer met dit zaad als
//              uiterlijk (zie gereedschap/pixelart/dorpelingen.cjs). Doet niet mee in een
//              gevecht en staat niet in T.WEZENS.
//   staat      dit object is een deur, "open", "dicht" of "opslot" (dezelfde woorden als
//              wereld.js se eigen deuren). Zonder "staat" is een object geen deur.
//   overgang   de naam van de kaart waar je heen gaat als je hier loopt (bijvoorbeeld "bos").
//              T.laadKaart legt dat vast in w.overgangen; er is nu nog niets dat er iets mee
//              doet — dat is aan wie verkennen.js op meerdere kaarten laat werken.
// Een object zonder van deze eigenschappen, maar wel met een tegel uit tegels/ (een boom, een
// huis, een bosje), wordt een voorwerp op zijn eigen tegel plus, bij "beslaat", de tegels
// eromheen — precies zo vast als de tegel zelf zegt.
(function (T) {
  'use strict';

  // De bovenste drie bits van een gid zijn spiegel-/draaivlaggen (Tiled); wissen voor het
  // opzoeken. Bomen en huizen spiegelt Marcel toch niet, maar dit voorkomt een gekke opzoeking
  // mocht hij per ongeluk op de spiegelknop klikken.
  const zonderVlag = (gid) => gid & 0x1fffffff;

  // "../tegels/grond.tsx" (of met \, of zonder ../) wordt "grond": zo vinden we het vel terug in
  // T.TEGELS zonder dat kaart.js zelf paden hoeft te kennen.
  function velNaam(bron) {
    const stuk = String(bron).replace(/\\/g, '/').split('/').pop() || '';
    return stuk.replace(/\.tsx$/i, '');
  }

  // Voor deze ene kaart: elk tileset-blok (firstgid + veelnaam), aflopend op firstgid. Zo is de
  // juiste set voor een gid de eerste waarvoor gid >= firstgid geldt.
  function bouwOpzoeker(kaart) {
    const sets = (kaart.tilesets || [])
      .map((t) => ({ firstgid: t.firstgid || 1, naam: velNaam(t.source || t.name || '') }))
      .sort((a, b) => b.firstgid - a.firstgid);
    return function (gid) {
      const g = zonderVlag(gid);
      if (!g) return null;
      const set = sets.find((s) => g >= s.firstgid);
      const vel = set && T.TEGELS && T.TEGELS[set.naam];
      if (!vel) return null;
      return vel.tiles[g - set.firstgid] || null;
    };
  }

  // Eén keer een soort aan T.VOORWERPEN toevoegen (blokkeert én zichtDicht volgen hier allebei
  // uit "vast": een boom of een gebouw houdt zowel het lopen als het zicht tegen). Staat de
  // soort er al (bijvoorbeeld gewoon uit wereld.js), dan raken we hem niet aan.
  function registreerVoorwerp(naam, vast) {
    if (!T.VOORWERPEN[naam]) T.VOORWERPEN[naam] = { blokkeert: !!vast, zichtDicht: !!vast };
  }

  // Dezelfde vorm als maakWezen in wereld.js (die geldt alleen voor een soort uit T.WEZENS), maar
  // dan voor een gewone dorpeling: geen gevecht, geen levensbalk, hij staat en kijkt. Het zaad
  // bepaalt straks zijn uiterlijk (dorpelingen.cjs).
  function maakDorpeling(zaad, x, y) {
    return {
      soort: 'dorpeling', naam: 'dorpeling', kant: 'neutraal', zaad,
      x, y, tx: x, ty: y, pad: [], onderweg: false, opKlaar: null,
      leven: 0, maxLeven: 0, ap: 0, maxAp: 0, initiatief: 0, snelheid: 1.2, zicht: 0,
      dwaalt: false, aanval: null,
      dwaalTijd: 1 + Math.random() * 2, fase: Math.random() * 6.28,
      dood: false, sterfTijd: 0, uitval: null, flits: 0, alarm: 0, leeftijd: null,
      brandt: 0, apVerlies: 0, afgeleid: null, gelokt: null, vraag: 0, geduwd: false,
      meesterschap: null, kring: null,
    };
  }

  function eigenschappenVan(obj) {
    const e = {};
    for (const p of obj.properties || []) e[p.name] = p.value;
    return e;
  }

  T.laadKaart = function (kaart) {
    const th = kaart.tileheight || 32;
    const b = kaart.width;
    const h = kaart.height;
    const opzoek = bouwOpzoeker(kaart);
    const binnenRaster = (x, y) => x >= 0 && y >= 0 && x < b && y < h;

    const tegels = [];
    for (let y = 0; y < h; y++) tegels.push(new Array(b).fill('buiten'));

    // 1. de tegellagen: grond, en wat er verder vast staat. Elke tile-laag telt mee (niet alleen
    // de eerste), zodat Marcel "vast" ook los van het uiterlijk op een eigen laag kan zetten
    // (ontwerp/wereld.md noemt dat apart naast de grondlaag).
    for (const laag of kaart.layers || []) {
      if (laag.type !== 'tilelayer' || !laag.data) continue;
      const breedte = laag.width || b;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < b; x++) {
          const gid = laag.data[y * breedte + x];
          if (!gid || tegels[y][x] === 'muur') continue; // al vast door een eerdere laag
          const eig = opzoek(gid);
          tegels[y][x] = eig && eig.vast ? 'muur' : 'vloer';
        }
      }
    }

    const deuren = new Map();
    const voorwerpen = [];
    const wezens = [];
    const overgangen = [];

    // 2. de objectlagen: bomen, huizen, deuren, wezens, dorpelingen, overgangen. Zie Tiled se
    // eigen bron (isometricrenderer.cpp, pixelToTileCoords): op een isometrische kaart staat de
    // (x, y) van een object niet in schermpixels maar gewoon delen door de tegelhoogte, voor x
    // én y — dat is iets anders dan de ruit-projectie waarmee het spel zelf tekent (iso.js).
    for (const laag of kaart.layers || []) {
      if (laag.type !== 'objectgroup') continue;
      for (const obj of laag.objects || []) {
        const gx = Math.round(obj.x / th);
        const gy = Math.round(obj.y / th);
        if (!binnenRaster(gx, gy)) {
          console.warn(`T.laadKaart: object "${obj.name || obj.id}" valt buiten de kaart (${gx}, ${gy}), overgeslagen`);
          continue;
        }
        const p = eigenschappenVan(obj);

        if (p.staat !== undefined) {
          tegels[gy][gx] = 'deur';
          deuren.set(gx + ',' + gy, { x: gx, y: gy, staat: p.staat, richting: 'ow' });
          continue;
        }
        if (p.overgang !== undefined) {
          overgangen.push({ x: gx, y: gy, naar: p.overgang });
          continue;
        }
        if (p.wezen !== undefined) {
          try {
            wezens.push(T.maakWezen(p.wezen, gx, gy));
          } catch (e) {
            console.warn(`T.laadKaart: onbekend wezen "${p.wezen}" op (${gx}, ${gy}), overgeslagen`);
          }
          continue;
        }
        if (p.zaad !== undefined) {
          wezens.push(maakDorpeling(p.zaad, gx, gy));
          continue;
        }
        const eig = obj.gid ? opzoek(obj.gid) : null;
        if (!eig) continue; // een leeg object zonder van bovenstaande: niets aan te doen
        registreerVoorwerp(eig.naam, eig.vast);
        const [voetB, voetD] = eig.beslaat || [1, 1];
        for (let dy = 0; dy < voetD; dy++) {
          for (let dx = 0; dx < voetB; dx++) {
            if (!eig.vast || !binnenRaster(gx + dx, gy + dy)) continue;
            tegels[gy + dy][gx + dx] = 'muur';
          }
        }
        voorwerpen.push({ soort: eig.naam, x: gx, y: gy });
      }
    }

    // 3. de deurrichting, net als T.maakWereld in wereld.js: loopt de muur rond de deur van
    // noord naar zuid, dan staat het deurpaneel dwars op x.
    const tegelBij = (x, y) => (binnenRaster(x, y) ? tegels[y][x] : 'buiten');
    for (const d of deuren.values()) if (tegelBij(d.x, d.y - 1) === 'muur') d.richting = 'ns';

    // 4. één kamer die de hele kaart beslaat en van meet af aan bekend is: buiten is geen
    // toren met kamers die je ontdekt. T.isZichtbaar (de mist-van-oorlog) is dus voor een
    // ingelezen kaart altijd "alles gezien"; dat hoort niet bij deze opdracht (T.isBegaanbaar,
    // T.isVast en T.raakt wel, en die vragen niets aan kamers).
    const kamerBuiten = { id: 'buiten', naam: 'Buiten', x1: 0, y1: 0, x2: b - 1, y2: h - 1, vloer: ['#3c5e1e', '#355f22'] };
    const burenKamers = [];
    for (let y = 0; y < h; y++) {
      const rij = [];
      for (let x = 0; x < b; x++) rij.push(['buiten']);
      burenKamers.push(rij);
    }

    return {
      b, h, tegels, deuren, kamers: [kamerBuiten],
      voorwerpen, wezens,
      bekend: new Set(['buiten']), huidigeKamer: 'buiten',
      burenKamers, overgangen,
    };
  };

  // Een kaart ophalen bij naam: eerst het gebundelde T.KAARTEN (kaarten/kaarten.js, werkt ook
  // als index.html los openstaat), anders fetch (voor een kaart die net in Tiled getekend is en
  // nog niet gebundeld is — dat werkt alleen met npm start, niet vanaf file://). Geeft de
  // ingelezen .tmj terug, nog niet T.laadKaart erover heen.
  T.haalKaart = async function (naam) {
    if (T.KAARTEN && T.KAARTEN[naam]) return T.KAARTEN[naam];
    const r = await fetch(`kaarten/${naam}.tmj`);
    if (!r.ok) throw new Error(`T.haalKaart: kaart "${naam}" niet gevonden`);
    return r.json();
  };
})(globalThis.Toren = globalThis.Toren || {});
