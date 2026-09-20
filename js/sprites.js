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
  const beelden = new Map(); // bestandsnaam → Image
  let gegevens = null;
  let belofte = null;

  const S = {
    aan: false, // staan alle vellen klaar? Zo niet, tekent het spel zijn vlakken.
    mist: [], // wat er niet geladen kon worden, om in de console te zien
  };
  T.sprites = S;

  // ---------------------------------------------------------------- laden

  function laadBeeld(bestand) {
    return new Promise((klaar) => {
      const img = new Image();
      img.onload = () => {
        beelden.set(bestand, img);
        klaar(true);
      };
      img.onerror = () => {
        S.mist.push(bestand);
        klaar(false);
      };
      img.src = MAP + bestand;
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
      const lijst = [gegevens.muren.bestand, gegevens.vloeren.bestand, gegevens.voorwerpen.bestand];
      for (const f of Object.values(gegevens.figuren)) {
        for (const h of Object.values(f.houdingen)) lijst.push('figuren/' + h.bestand);
      }
      const uitslag = await Promise.all(lijst.map(laadBeeld));
      S.aan = uitslag.every(Boolean);
      if (!S.aan) console.warn('Aardschok: sprites ontbreken, het spel tekent vlakken.', S.mist);
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
    return stuk('figuren/' + h.bestand, beeld * cel[0], rij * cel[1], cel[0], cel[1], h.anker || f.anker);
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
  const HOOG = { tovenaar: 90, wim: 66, skelet: 78, slijm: 28 };
  S.figuurNaam = (soort) => (soort === 'held' ? 'tovenaar' : soort);
  S.hoogte = (soort) => HOOG[S.figuurNaam(soort)] || 60;

  // ---------------------------------------------------------------- vloeren, muren, voorwerpen

  // Een vloer is een lap van twee bij twee tegels, zodat de steen niet elke tegel herhaalt.
  // Het spel knipt er per tegel een ruit uit; `dx`/`dy` zeggen welke van de vier.
  S.tegel = function (soort, x, y) {
    if (!gegevens) return null;
    const v = gegevens.vloeren;
    const k = v.soorten[soort];
    if (k == null) return null;
    const deel = stuk(v.bestand, k * v.cel[0], 0, v.cel[0], v.cel[1], v.anker);
    if (!deel) return null;
    // welke tegel van de lap: zo sluit het steenverband tussen de tegels op elkaar aan
    const a = ((x % 2) + 2) % 2;
    const b = ((y % 2) + 2) % 2;
    deel.ax += (a - b) * T.HB;
    deel.ay += (a + b) * T.HH;
    return deel;
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
    return stuk(m.bestand, kol * m.cel[0], r * m.cel[1], m.cel[0], m.cel[1], m.anker);
  };

  S.muurSoorten = () => (gegevens ? gegevens.muren.kolommen : []);
  S.laagHoogte = () => (gegevens ? gegevens.muren.laagHoogte : 22);

  S.voorwerp = function (naam) {
    if (!gegevens) return null;
    const v = gegevens.voorwerpen;
    const i = v.namen.indexOf(naam);
    if (i < 0) return null;
    return stuk(v.bestand, i * v.cel[0], 0, v.cel[0], v.cel[1], v.anker);
  };

  // ---------------------------------------------------------------- de houding van een wezen

  // Wat doet dit wezen nu? Alles komt uit de spelstaat zelf, zodat er geen tweede boekhouding
  // ontstaat die uit de pas kan lopen: `dood` en `sterfTijd` zijn sterven, `flits` is net
  // geraakt, `uitval` is uithalen, en een pad betekent lopen. Alleen toveren is niet aan één
  // veld te zien: dat blijkt uit de jaren die de held erbij krijgt (T.verouder), en juist
  // vóór de schicht vertrekt.
  //
  // Wat wél wordt onthouden, staat in `e.beeldStand`: hoe ver de voeten gelopen hebben (zodat
  // de pas niet glijdt) en welke klap of spreuk nog aan het spelen is.
  function stand(e) {
    if (!e.beeldStand) {
      e.beeldStand = { afgelegd: 0, x: e.x, y: e.y, richting: 'Z', eenmalig: null, tot: 0, begin: 0, leeftijd: e.leeftijd, flits: 0 };
    }
    return e.beeldStand;
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
  // `naam` is het figuur op het vel; de held heet daar tovenaar.
  S.houding = function (spel, e) {
    const naam = S.figuurNaam(e.soort);
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
    // zijn afgelopen, ook als het spel intussen alweer verder is.
    const zet = (houding) => {
      const duur = S.houdingDuur(naam, houding);
      if (!duur) return;
      st.eenmalig = houding;
      st.tot = spel.tijd + duur;
      st.begin = spel.tijd;
    };
    if (e.uitval) {
      if (st.uitval !== e.uitval) {
        st.uitval = e.uitval;
        zet(S.heeftHouding(naam, 'slaan') ? 'slaan' : 'aanval');
      }
    } else st.uitval = null;
    if (e.leeftijd != null && e.leeftijd > st.leeftijd && !e.flits && !e.dood) zet('spreuk');
    if (e.leeftijd != null) st.leeftijd = e.leeftijd;
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
    // Stilstaan: ademen, elk wezen in zijn eigen tempo (e.fase). Wim veegt ondertussen de
    // trap, zoals hij veertig jaar deed, en in een gesprek praat hij.
    const rust = naam === 'wim' ? (spel.modus === 'dialoog' ? 'praten' : 'vegen') : 'staan';
    const staan = f.houdingen[rust] ? rust : f.houdingen.staan ? 'staan' : Object.keys(f.houdingen)[0];
    const duur = S.houdingDuur(naam, staan) || 1;
    return { naam, houding: staan, richting: st.richting, fase: ((spel.tijd + e.fase) / duur) % 1 };
  };

  // Het beeld dat bij die houding hoort, in één stap.
  S.wezen = function (spel, e) {
    const h = S.houding(spel, e);
    return h ? S.figuur(h.naam, h.houding, h.richting, h.fase) : null;
  };
})(globalThis.Toren = globalThis.Toren || {});
