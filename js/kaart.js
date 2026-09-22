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
//              T.laadKaart legt dat vast in w.overgangen, en js/gebied.js maakt van elke kaart
//              vanzelf een gebied: zodra kaarten/bos.tmj bestaat en npm run kaarten gedraaid is,
//              werkt die overgang, zonder dat er ergens iets geregistreerd hoeft te worden.
//   tekst      (bij een overgang, mag weg) wat er bij de muis staat, bijvoorbeeld "Naar binnen".
//              Zonder staat er "Naar" en de naam van de kaart.
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

  // Voor deze ene kaart: elk tileset-blok (firstgid, veelnaam, en het vel uit T.TEGELS zelf). Een
  // gid hoort bij een vel als hij binnen firstgid .. firstgid + aantal_tegels - 1 valt — niet
  // zomaar "de eerste met firstgid <= gid", want dat gaat mis zodra vellen niet precies achter
  // elkaar liggen (bijvoorbeeld na npm run tiled, als een vel meer of minder tegels heeft
  // gekregen dan toen de kaart voor het laatst in Tiled openstond).
  function bouwOpzoeker(kaart) {
    const sets = (kaart.tilesets || []).map((t) => {
      const naam = velNaam(t.source || t.name || '');
      const vel = T.TEGELS && T.TEGELS[naam];
      return { naam, firstgid: t.firstgid || 1, aantal: vel ? vel.tiles.length : t.tilecount || 0, vel };
    });
    // Geeft { vel, id, eig } terug: uit welk vel de tegel komt, welke hij daar is, en wat erover
    // in de .tsx stond. Het spel heeft vel en id nodig om hem te kunnen tekenen (js/sprites.js).
    return function (gid) {
      const g = zonderVlag(gid);
      if (!g) return null;
      for (const s of sets) {
        const lokaal = g - s.firstgid;
        if (s.vel && lokaal >= 0 && lokaal < s.aantal) {
          const eig = s.vel.tiles[lokaal];
          return eig ? { vel: s.naam, id: lokaal, eig } : null;
        }
      }
      return null;
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
  function maakDorpeling(zaad, x, y, straal) {
    return {
      soort: 'dorpeling', naam: 'dorpeling', kant: 'neutraal', zaad,
      x, y, tx: x, ty: y, pad: [], onderweg: false, opKlaar: null,
      leven: 0, maxLeven: 0, ap: 0, maxAp: 0, initiatief: 0, snelheid: 1.2, zicht: 0,
      // Waar hij hoort en hoe ver hij daarvandaan loopt: de smid bij de smidse, de boerin bij de
      // akker. Zonder straal blijft hij staan waar hij staat. Hij begint nooit een gevecht (hij is
      // neutraal) en telt niet mee in de beurtvolgorde.
      thuis: { x, y }, straal: straal || 0, dwaalt: straal > 0, aanval: null,
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
    const grond = []; // per tegel { vel, id }: welk plaatje eronder ligt, om hem te kunnen tekenen
    for (let y = 0; y < h; y++) {
      tegels.push(new Array(b).fill('buiten'));
      grond.push(new Array(b).fill(null));
    }

    // 1. de tegellagen: grond, en wat er verder vast staat. Elke tile-laag telt mee (niet alleen
    // de eerste), zodat Marcel "vast" ook los van het uiterlijk op een eigen laag kan zetten
    // (ontwerp/wereld.md noemt dat apart naast de grondlaag).
    //
    // De bovenste laag die hier een tegel heeft, wint — over het uiterlijk én over "vast". Dat
    // moet wel: een brug over een beek is precies wat je bovenop het water legt, en water is
    // vast terwijl de brug dat niet is. Eerst hield een vaste tegel eronder de tegel vast,
    // en dan liep je tegen je eigen brug op. (De brugtegels uit rand.tsx tekenen het water er
    // zelf onder, dus het maakt niet uit of Marcel de brug in de grondlaag legt of op een laag
    // erboven; allebei komt het goed.)
    for (const laag of kaart.layers || []) {
      if (laag.type !== 'tilelayer' || !laag.data) continue;
      const breedte = laag.width || b;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < b; x++) {
          const gid = laag.data[y * breedte + x];
          if (!gid) continue;
          const t = opzoek(gid);
          tegels[y][x] = t && t.eig.vast ? 'muur' : 'vloer';
          if (t) grond[y][x] = { vel: t.vel, id: t.id, naam: t.eig.naam };
        }
      }
    }

    const deuren = new Map();
    const voorwerpen = [];
    const questVoorwerpen = []; // wat aan een quest hangt; T.werkQuestVoorwerpen schuift het erin
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
          // "komt" is de tegel waarop je landt als je uit dat andere gebied hierheen komt: één
          // stap van de deur af. Ontbreekt hij, dan blijft hij leeg — en juist niet de
          // overgangstegel zelf: dan zou je landen op de tegel die de overgang afvuurt, en kaats
          // je heen en weer tussen twee gebieden. js/gebied.js zoekt in dat geval zelf een
          // begaanbare buurtegel.
          const k = typeof p.komt === 'string' ? p.komt.split(',').map(Number) : null;
          const komt = k && k.length === 2 && k.every(Number.isFinite) ? { x: k[0], y: k[1] } : null;
          if (!komt) console.warn(`T.laadKaart: overgang naar "${p.overgang}" op (${gx}, ${gy}) zonder "komt"; het spel kiest zelf een tegel ernaast`);
          overgangen.push({ x: gx, y: gy, naar: p.overgang, komt, tekst: typeof p.tekst === 'string' && p.tekst ? p.tekst : null });
          continue;
        }
        if (p.wezen !== undefined) {
          try {
            const e = T.maakWezen(p.wezen, gx, gy);
            // "straal": hoe ver hij van deze plek af dwaalt. Zonder straal blijft hij binnen zijn
            // eigen kamer, en dat is buiten de hele kaart — dus buiten hoor je er een te zetten.
            if (Number(p.straal) > 0) {
              e.thuis = { x: gx, y: gy };
              e.straal = Number(p.straal);
              e.dwaalt = true;
            }
            wezens.push(e);
          } catch (e) {
            console.warn(`T.laadKaart: onbekend wezen "${p.wezen}" op (${gx}, ${gy}), overgeslagen`);
          }
          continue;
        }
        if (p.zaad !== undefined) {
          wezens.push(maakDorpeling(p.zaad, gx, gy, Number(p.straal) || 0));
          continue;
        }
        const t = obj.gid ? opzoek(obj.gid) : null;
        if (!t) continue; // een leeg object zonder van bovenstaande: niets aan te doen
        const eig = t.eig;
        registreerVoorwerp(eig.naam, eig.vast);
        const beslaat = eig.beslaat || [1, 1];
        for (let dy = 0; dy < beslaat[1]; dy++) {
          for (let dx = 0; dx < beslaat[0]; dx++) {
            if (!eig.vast || !binnenRaster(gx + dx, gy + dy)) continue;
            tegels[gy + dy][gx + dx] = 'muur';
          }
        }
        // vel en id erbij, zodat js/tekenen.js het plaatje kan opzoeken zonder de kaart opnieuw
        // te hoeven lezen; beslaat, zodat het sorteren weet hoeveel tegels eronder liggen.
        const v = { soort: eig.naam, x: gx, y: gy, vel: t.vel, id: t.id, beslaat };
        // raak="<naam>": dit ding wacht op een spreuk (js/quests.js, T.RAAKPUNTEN). Het hoort op
        // een tegel waar je bij kunt, want een spreuk vraagt vrij zicht.
        if (p.raak !== undefined) v.raak = String(p.raak);
        // quest="bakker:zoeken": dit ding ligt er alleen zolang die quest in die fase is. Vast
        // kan het niet zijn — dan zou er een muur komen en gaan waar net iemand liep.
        const grendel = p.quest !== undefined && T.questGrendel ? T.questGrendel(String(p.quest)) : null;
        if (grendel && eig.vast) {
          console.warn(`T.laadKaart: "${eig.naam}" op (${gx}, ${gy}) is vast en kan dus niet aan een quest hangen`);
        } else if (grendel) {
          v.grendel = grendel;
          questVoorwerpen.push(v);
          continue;
        }
        voorwerpen.push(v);
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

    // Eigenschappen van de kaart zelf (in Tiled: de eigenschappen van de map). `doof` zegt over
    // hoeveel ringen vanaf de rand het bos naar het donker toe wegdooft, zodat een speler nooit
    // het einde van de plaat ziet (js/tekenen.js).
    const eig = eigenschappenVan(kaart);

    return {
      b, h, tegels, grond, deuren, kamers: [kamerBuiten],
      voorwerpen, questVoorwerpen, wezens,
      bekend: new Set(['buiten']), huidigeKamer: 'buiten',
      burenKamers, overgangen,
      buiten: true, // geen kamers met muren: het spel tekent gras en hoge dingen
      naam: typeof eig.naam === 'string' ? eig.naam : null,
      doof: Number.isFinite(eig.doof) ? eig.doof : 0,
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
