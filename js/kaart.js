// Een kaart inlezen als een gewone wereld. T.laadKaart(kaart, betekenis) neemt de grond die
// Marcel in Tiled tekende én de betekenis die in gereedschap/wereld.html gelegd is, en geeft
// terug wat js/wereld.js voor de toren met de hand opschrijft: begaanbaar, vast, voorwerpen,
// wezens, deuren. wereld.js zelf verandert niet mee: T.isBegaanbaar, T.isVast, T.raakt, T.tegel,
// T.deurOp en T.voorwerpOp werken op zo'n ingelezen wereld precies als op T.maakWereld().
//
// Hoe de keten aan elkaar hangt (zie ontwerp/kaarten.md, "Tiled tekent alleen nog de grond"):
//   dorp.cjs, dorp2.cjs, bomen.cjs  (de kunst)
//     -> npm run tiled   (naar-tiled.cjs)   -> tegels/*.png + tegels/*.tsx + tegels/tegels.js
//   Marcel tekent de grond in Tiled                     -> kaarten/<naam>.tmj
//   en legt de betekenis in gereedschap/wereld.html     -> kaarten/<naam>.betekenis.json
//     -> npm run kaarten (naar-kaarten.cjs)              -> kaarten/kaarten.js
//                                                           (T.KAARTEN en T.BETEKENIS)
//   T.laadKaart(T.KAARTEN.proef, T.BETEKENIS.proef)      -> een wereld, zoals T.maakWereld()
//
// Eigenschappen die in Tiled op een TEGEL staan (in de .tsx, geldt voor elk exemplaar, zie
// naar-tiled.cjs): "naam" (de soort), "vast" (of je erdoorheen kunt) en bij een gebouw "beslaat"
// ("6x8": hoeveel tegels de voet inneemt, vanaf de tegel die je aanklikt naar rechtsonder toe).
//
// WAT EEN DING BETEKENT. Eén ding in kaarten/<naam>.betekenis.json is een gewoon vakje met x en y
// en daarnaast één van deze velden. Dezelfde namen gelden voor een object dat nog in Tiled staat
// (als eigenschap), want er is maar één stel regels dat ze uitlegt — deze:
//   wie        één mens uit T.MENSEN (js/mensen.js): "bakker", "koster". Dat is de gewone manier
//              om iemand neer te zetten die een naam heeft — wie hij is, hoe hij eruitziet en wat
//              hij zegt staat daar op één plek, en de kaart zegt alleen waar hij staat.
//   wezen      welk wezen hier staat: een naam die T.maakWezen kent ('held' voor de beginplek
//              van de tovenaar, 'wim', 'slijm', 'bakker', de bosvijanden). Verkeerd gespeld?
//              Dan komt er een waarschuwing op de console en slaan we het ding over.
//   zaad       in plaats van "wezen": een gewone dorpeling met dit zaad als uiterlijk (zie
//              gereedschap/pixelart/dorpelingen.cjs). Doet niet mee in een gevecht en staat niet
//              in T.WEZENS.
//   straal     (bij een wezen of een dorpeling) hoe ver hij van deze plek af dwaalt. Zonder
//              straal blijft hij staan waar hij staat.
//   gesprek    (bij een wezen of een dorpeling, mag weg) welk gesprek hij voert. Normaal is dat
//              zijn soort, maar negentien dorpelingen delen er één ("dorpeling"), en die hoeven
//              niet allemaal hetzelfde te zeggen. Zie T.gesprekIdVan in js/gesprek.js.
//   staat      dit is een deur: "open", "dicht", "opslot" (dezelfde woorden als wereld.js se
//              eigen deuren) of "geheim".
//   als        (bij staat: "geheim") wanneer de doorgang er is: { vlag: 'x' } of
//              { quest: 'bakker', fase: 'terug' }, dezelfde vorm als overal. Zolang dat niet
//              geldt is de tegel gewoon wat eronder ligt — muur — en is er geen deur. Zie
//              T.werkGeheimenBij in js/quest.js.
//   overgang   de naam van de kaart waar je heen gaat als je hier loopt (bijvoorbeeld "bos").
//              T.laadKaart legt dat vast in w.overgangen, en js/gebied.js maakt van elke kaart
//              vanzelf een gebied: zodra kaarten/bos.tmj bestaat en npm run kaarten gedraaid is,
//              werkt die overgang, zonder dat er ergens iets geregistreerd hoeft te worden.
//   komt       (bij een overgang) de tegel waarop je landt als je van de andere kant komt, als
//              { x, y } of als "12,7".
//   tekst      (bij een overgang, mag weg) wat er bij de muis staat, bijvoorbeeld "Naar binnen".
//              Zonder staat er "Naar" en de naam van de kaart.
//   tegel      een voorwerp: "bomen/eik", het vel en de naam uit tegels/. Op naam en niet op
//              nummer, want npm run tiled verschuift de nummers en een naam niet. Het wordt een
//              voorwerp op zijn eigen tegel plus, bij "beslaat", de tegels eromheen — precies zo
//              vast als de tegel zelf zegt. In Tiled is dat een object met een gid.
//   raak       dit ding wacht op een spreuk (T.RAAKPUNTEN, js/quests.js).
//   quest      "bakker:zoeken": dit ding ligt er alleen zolang die quest in die fase staat.
//   akker      een naam ("akker1"): dit is geen los vakje maar een hele strook, x/y de
//              linkerbovenhoek en b/h de maat in tegels (net als "beslaat" bij een gebouw), en
//              "huis" welk huis (een vrije naam, bijvoorbeeld "boer1") hem bewerkt. Zolang er
//              geen graantegels zijn (gereedschap/pixelart/graan*.cjs) is de grond zelf gewoon
//              zandpad, getekend in de .tmj; dit ding zegt alleen wát er ligt en van wie. Zie
//              gereedschap/tiled/maak-gehucht.cjs en ontwerp/werklijst.md, punt 1b.
//
// En op het betekenisbestand zelf: "proef": true zegt dat de kaart alleen voor de toetsen bestaat
// en in het spel niet meetelt.
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

  // Hetzelfde als bouwOpzoeker, maar dan op naam: "bomen/eik" in plaats van een gid. Zo staat een
  // voorwerp in kaarten/<naam>.betekenis.json op naam, en maakt het niet uit dat npm run tiled de
  // nummers verschuift zodra een vel groter wordt. Zonder vel ervoor ("eik") zoeken we alle
  // vellen af; dat is handig met de hand, maar het gereedschap schrijft altijd vel én naam.
  function opzoekNaam(wat) {
    const deel = String(wat).split('/');
    const naam = deel.pop();
    const velnaam = deel.pop();
    const vellen = velnaam ? [velnaam] : Object.keys(T.TEGELS || {});
    for (const v of vellen) {
      const vel = T.TEGELS && T.TEGELS[v];
      if (!vel) continue;
      const id = vel.tiles.findIndex((t) => t && t.naam === naam);
      if (id >= 0) return { vel: v, id, eig: vel.tiles[id] };
    }
    console.warn(`T.laadKaart: tegel "${wat}" bestaat niet in tegels/ — draai npm run tiled, of kijk de naam na`);
    return null;
  }

  // Een tegel als "12,7" (zoals Tiled hem als tekst opslaat) of als { x, y } (zoals het
  // betekenisbestand hem schrijft). Alles anders is niets.
  function leesTegel(waarde) {
    if (waarde && typeof waarde === 'object' && Number.isFinite(waarde.x) && Number.isFinite(waarde.y)) {
      return { x: waarde.x, y: waarde.y };
    }
    const k = typeof waarde === 'string' ? waarde.split(',').map(Number) : null;
    return k && k.length === 2 && k.every(Number.isFinite) ? { x: k[0], y: k[1] } : null;
  }

  // Eén keer een soort aan T.VOORWERPEN toevoegen (blokkeert én zichtDicht volgen hier allebei
  // uit "vast": een boom of een gebouw houdt zowel het lopen als het zicht tegen). Staat de
  // soort er al (bijvoorbeeld gewoon uit wereld.js), dan raken we hem niet aan.
  function registreerVoorwerp(naam, vast) {
    if (!T.VOORWERPEN[naam]) T.VOORWERPEN[naam] = { blokkeert: !!vast, zichtDicht: !!vast };
  }

  function eigenschappenVan(obj) {
    const e = {};
    for (const p of obj.properties || []) e[p.name] = p.value;
    return e;
  }

  T.laadKaart = function (kaart, betekenis) {
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
    const geheimen = []; // deuren die er pas zijn als je ervan hoort; zie T.werkGeheimenBij
    const voorwerpen = [];
    const questVoorwerpen = []; // wat aan een quest hangt; T.werkQuestVoorwerpen schuift het erin
    const wezens = [];
    const overgangen = [];
    const akkers = []; // strokens land, geen vakjes; zie "akker" hierboven

    // 2. alles wat op de grond staat: bomen, huizen, deuren, wezens, dorpelingen, overgangen.
    // Dat komt uit twee bronnen, en allebei belanden ze in dezelfde `zetNeer` hieronder:
    //
    //   - de objectlagen van de .tmj, zoals Marcel ze in Tiled neerzette. Zie Tiled se eigen bron
    //     (isometricrenderer.cpp, pixelToTileCoords): op een isometrische kaart staat de (x, y)
    //     van een object niet in schermpixels maar gewoon delen door de tegelhoogte, voor x én y
    //     — dat is iets anders dan de ruit-projectie waarmee het spel zelf tekent (iso.js).
    //   - `kaarten/<naam>.betekenis.json`, het bestand van gereedschap/wereld.html (zie
    //     ontwerp/kaarten.md, "Tiled tekent alleen nog de grond"). Daar staat een ding als gewone
    //     velden — `{ x, y, wezen: 'bakker', straal: 3 }` — met dezelfde namen als de
    //     eigenschappen in Tiled, zodat er maar één stel regels is dat ze uitlegt. Een voorwerp
    //     staat er op naam ("bomen/eik") in plaats van op gid, want gids schuiven zodra
    //     npm run tiled een vel groter maakt en een naam niet.
    function zetNeer(p, gx, gy, t, waar) {
      if (!binnenRaster(gx, gy)) {
        console.warn(`T.laadKaart: ${waar} valt buiten de kaart (${gx}, ${gy}), overgeslagen`);
        return;
      }
      if (p.staat !== undefined) {
        // Een geheime doorgang ziet eruit als muur tot zijn vlag staat (ontwerp/kaarten.md,
        // "Geheim is: je hoort ervan"). Zolang dat niet zo is, laten we de tegel zoals hij is —
        // dus muur, want daar staat een huis of een rots — en komt er geen deur in de lijst.
        // T.werkGeheimenBij (js/wereld.js) zet hem er alsnog in zodra de vlag komt.
        if (p.staat === 'geheim') {
          geheimen.push({ x: gx, y: gy, staat: 'dicht', richting: 'ow', geheim: true, als: p.als || null });
          return;
        }
        tegels[gy][gx] = 'deur';
        deuren.set(gx + ',' + gy, { x: gx, y: gy, staat: p.staat, richting: 'ow' });
        return;
      }
      if (p.overgang !== undefined) {
        // "komt" is de tegel waarop je landt als je uit dat andere gebied hierheen komt: één
        // stap van de deur af. Ontbreekt hij, dan blijft hij leeg — en juist niet de
        // overgangstegel zelf: dan zou je landen op de tegel die de overgang afvuurt, en kaats
        // je heen en weer tussen twee gebieden. js/gebied.js zoekt in dat geval zelf een
        // begaanbare buurtegel.
        const komt = leesTegel(p.komt);
        if (!komt) console.warn(`T.laadKaart: overgang naar "${p.overgang}" op (${gx}, ${gy}) zonder "komt"; het spel kiest zelf een tegel ernaast`);
        overgangen.push({ x: gx, y: gy, naar: p.overgang, komt, tekst: typeof p.tekst === 'string' && p.tekst ? p.tekst : null });
        return;
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
          // Een eigen gesprek, los van de soort: zo praten twee smeden niet per se hetzelfde.
          if (p.gesprek) e.gesprek = String(p.gesprek);
          wezens.push(e);
        } catch (e) {
          console.warn(`T.laadKaart: onbekend wezen "${p.wezen}" op (${gx}, ${gy}), overgeslagen`);
        }
        return;
      }
      if (p.wie !== undefined) {
        // Eén mens uit T.MENSEN (js/mensen.js). De kaart zegt alleen waar hij staat; wie hij is,
        // hoe hij eruitziet en wat hij zegt staat daar, op één plek.
        try {
          wezens.push(T.maakMens(String(p.wie), gx, gy, Number(p.straal)));
        } catch (e) {
          console.warn(`T.laadKaart: onbekende mens "${p.wie}" op (${gx}, ${gy}), overgeslagen`);
        }
        return;
      }
      if (p.zaad !== undefined) {
        wezens.push(T.maakDorpeling(p.zaad, gx, gy, Number(p.straal) || 0, p.gesprek ? String(p.gesprek) : null));
        return;
      }
      if (p.akker !== undefined) {
        // Geen vakje maar een hele strook; de grond zelf staat al in de .tmj (kale zandgrond
        // zolang er geen graantegels zijn), dit is alleen de betekenis erbij. Zie "akker"
        // hierboven.
        akkers.push({
          naam: String(p.akker), x: gx, y: gy,
          b: Number(p.b) || 1, h: Number(p.h) || 1,
          huis: p.huis !== undefined ? String(p.huis) : null,
        });
        return;
      }
      if (!t) return; // een leeg object zonder van bovenstaande: niets aan te doen
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
        return;
      }
      voorwerpen.push(v);
    }

    for (const laag of kaart.layers || []) {
      if (laag.type !== 'objectgroup') continue;
      for (const obj of laag.objects || []) {
        zetNeer(eigenschappenVan(obj), Math.round(obj.x / th), Math.round(obj.y / th), obj.gid ? opzoek(obj.gid) : null, `object "${obj.name || obj.id}"`);
      }
    }
    for (const ding of (betekenis && betekenis.dingen) || []) {
      zetNeer(ding, Math.round(ding.x), Math.round(ding.y), ding.tegel ? opzoekNaam(ding.tegel) : null, `"${ding.tegel || ding.wezen || ding.overgang || ding.staat || 'ding'}" uit het betekenisbestand`);
    }

    // 3. de deurrichting, net als T.maakWereld in wereld.js: loopt de muur rond de deur van
    // noord naar zuid, dan staat het deurpaneel dwars op x.
    const tegelBij = (x, y) => (binnenRaster(x, y) ? tegels[y][x] : 'buiten');
    for (const d of deuren.values()) if (tegelBij(d.x, d.y - 1) === 'muur') d.richting = 'ns';
    // En de geheime doorgangen, die nog niet in `deuren` staan: hun richting, en wat er op hun
    // tegel stond voordat er een deur in kwam — een rots, een huismuur — zodat T.werkGeheimenBij
    // hem weer terug kan zetten als de vlag toch niet (meer) staat.
    for (const g of geheimen) {
      g.onder = tegelBij(g.x, g.y);
      if (tegelBij(g.x, g.y - 1) === 'muur') g.richting = 'ns';
    }

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
      b, h, tegels, grond, deuren, geheimen, kamers: [kamerBuiten],
      voorwerpen, questVoorwerpen, wezens,
      bekend: new Set(['buiten']), huidigeKamer: 'buiten',
      burenKamers, overgangen, akkers,
      buiten: true, // geen kamers met muren: het spel tekent gras en hoge dingen
      naam: typeof eig.naam === 'string' ? eig.naam : null,
      // "proef": true in het betekenisbestand zegt dat deze kaart alleen voor de toetsen bestaat
      // en in het spel niet meetelt. De keuring laat zo'n kaart met rust waar het om het spel als
      // geheel gaat (een aansluiting die maar één kant heeft, bijvoorbeeld).
      proef: !!(betekenis && betekenis.proef),
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
