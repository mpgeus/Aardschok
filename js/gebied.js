// Gebieden en de overgang ertussen. Een gebied is een kaart die in Tiled getekend is
// (js/kaart.js). Eén aansluiting, twee kanten op: je loopt de ene kaart af en staat op de andere,
// en langs dezelfde weg weer terug. (Tot 25 sep stond de toren van het oude spel hier nog in code,
// naast de kaarten; die ging weg met het oude spel.)
//
// Welke gebieden er zijn, staat nergens opgeschreven: elke kaart is er een (zie T.maakGebieden
// hieronder). Marcel tekent in Tiled, draait npm run kaarten, en de wereld is groter geworden.
//
// De held verhuist mee — met zijn levenspunten en wat hij bij zich heeft — en de
// wereld die hij achterlaat blijft staan: een gedode wolf blijft dood, en een deur die je liet
// openstaan staat er nog open als je terugkomt.
(function (T) {
  'use strict';

  // Elke kaart in kaarten/kaarten.js (T.KAARTEN, gemaakt door npm run kaarten) is vanzelf een
  // gebied, met zijn bestandsnaam als naam. Tekent Marcel kaarten/dorp.tmj, dan werkt
  // `overgang: "dorp"` meteen — er valt niets te registreren, en er hoeft geen code bij. Dat is de
  // hele bedoeling van de editor.

  // De naam die de speler in beeld krijgt, zonder de kaart al in te lezen: de eigenschap "naam"
  // van de map zelf (in Tiled: de eigenschappen van de kaart), anders de bestandsnaam met een
  // hoofdletter — "proefbos" wordt dan "Proefbos".
  function kaartNaam(naam, kaart) {
    for (const p of (kaart && kaart.properties) || []) {
      if (p.name === 'naam' && typeof p.value === 'string' && p.value) return p.value;
    }
    return T.hoofdletter(naam);
  }

  // De lijst opnieuw opbouwen uit T.KAARTEN. Dat gebeurt één keer bij het laden; wie tijdens het
  // spelen een kaart bijzet (Toren.KAARTEN.bos = ...), roept dit daarna zelf nog eens aan.
  T.maakGebieden = function () {
    const g = {};
    for (const naam of Object.keys(T.KAARTEN || {})) {
      // De betekenis (mensen, deuren, doorgangen, aansluitingen) staat in een eigen bestand
      // naast de kaart en komt via T.BETEKENIS binnen; zie ontwerp/kaarten.md, "Tiled tekent
      // alleen nog de grond". Bestaat dat bestand niet, dan is de kaart gewoon wat Tiled heeft.
      g[naam] = { naam: kaartNaam(naam, T.KAARTEN[naam]), maak: () => T.laadKaart(T.KAARTEN[naam], T.BETEKENIS && T.BETEKENIS[naam]) };
    }
    return g;
  };

  T.GEBIEDEN = T.maakGebieden();

  // Het gebied bij deze naam, één keer gemaakt en daarna bewaard in S.gebieden. Geeft null
  // terug als dat gebied niet bestaat; de aanroeper moet dan gewoon doorspelen (zie
  // T.gaNaarGebied), want een kaart die nog niet getekend is, mag het spel niet omgooien.
  T.gebied = function (S, naam) {
    if (!S.gebieden) S.gebieden = {};
    if (!S.gebieden[naam]) {
      const g = T.GEBIEDEN[naam];
      if (!g) return null;
      const w = g.maak();
      w.gebied = naam;
      // Buiten is er één kamer die de hele kaart beslaat (js/kaart.js); die heet naar het gebied,
      // zodat "Het erf" in beeld komt en niet "Buiten".
      if (w.buiten && w.kamers.length === 1) w.kamers[0].naam = g.naam;
      // Een gebied zonder uitgang is een val: daar kom je nooit meer weg. Dat moet hoorbaar zijn
      // zodra het gebeurt, niet pas als een speler vaststaat.
      if (!w.overgangen || !w.overgangen.length) {
        console.error(`Aardschok: gebied "${naam}" heeft geen enkele overgang — je komt er niet meer uit. Zet in Tiled een object met de eigenschap "overgang" op de kaart en draai npm run kaarten.`);
      }
      // En andersom: een overgang die naar een kaart wijst die niet bestaat. Ook dat hoort hier
      // al te klagen, bij het inlezen, en niet pas als een speler er per ongeluk op stapt. Behalve
      // op een proefkaart: het gehucht is er (nog) een, en zijn weg de wereld in leidt sinds de oude
      // kaart weg is (25 sep) bewust nergens heen; daar lopen alleen de marskramer, de heer en de
      // inner over (T.wegInEnUit, js/handel.js).
      for (const o of w.overgangen || []) {
        if (!T.GEBIEDEN[o.naar] && !w.proef) ontbreekt(o.naar, `de kaart "${naam}" wijst er op (${o.x}, ${o.y}) naartoe`);
      }
      S.gebieden[naam] = w;
    }
    return S.gebieden[naam];
  };

  // Eén klacht voor allebei de plekken waar het opvalt, in dezelfde bewoording: wat er ontbreekt
  // en wat Marcel eraan doet.
  function ontbreekt(naar, waar) {
    console.error(`Aardschok: overgang naar "${naar}", maar dat gebied bestaat niet (${waar}). Teken kaarten/${naar}.tmj in Tiled en draai npm run kaarten.`);
  }

  T.overgangOp = function (w, x, y) {
    for (const o of w.overgangen || []) if (o.x === x && o.y === y) return o;
    return null;
  };

  // Een wezen ergens neerzetten: vloeiende plek en tegel tegelijk, en niet meer onderweg.
  function zetNeer(e, x, y) {
    e.x = x;
    e.y = y;
    e.tx = x;
    e.ty = y;
    e.pad = [];
    e.onderweg = false;
    if (e.opKlaar) {
      const k = e.opKlaar;
      e.opKlaar = null;
      k();
    }
  }

  // Waar land je als je uit `vanaf` in `w` aankomt? Bij de overgang die terugwijst naar waar je
  // vandaan komt, op de tegel ernaast (`komt`).
  //
  // Nooit op een overgangstegel: daar zou de volgende stap je meteen weer terugsturen, en dan
  // kaats je heen en weer tussen twee gebieden. Deugt `komt` niet (hij ontbreekt, hij is vast, of
  // hij is zelf een overgang), dan zoeken we een begaanbare buurtegel van de deur die dat niet is.
  // De kaart mag dus slordig getekend zijn; het spel loopt er niet op vast.
  function deugt(w, x, y) {
    return T.isBegaanbaar(w, x, y, { deurenOpenen: true }) && !T.overgangOp(w, x, y);
  }

  T.landingIn = function (w, vanaf) {
    const lijst = w.overgangen || [];
    const o = lijst.find((x) => x.naar === vanaf) || lijst[0];
    if (!o) return { x: Math.floor(w.b / 2), y: Math.floor(w.h / 2) };
    if (o.komt && deugt(w, o.komt.x, o.komt.y)) return { x: o.komt.x, y: o.komt.y };
    // eerst recht ernaast, dan schuin: de eerste die deugt
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      if (deugt(w, o.x + dx, o.y + dy)) {
        console.warn(`T.landingIn: "komt" bij de overgang op (${o.x}, ${o.y}) deugt niet; geland op (${o.x + dx}, ${o.y + dy})`);
        return { x: o.x + dx, y: o.y + dy };
      }
    }
    return { x: o.x, y: o.y }; // niets eromheen deugt: dan maar de deur zelf
  };

  T.gaNaarGebied = function (S, naar) {
    S.naarGebied = null;
    const vanaf = S.wereld && S.wereld.gebied;
    if (naar === vanaf) return;
    const oud = S.wereld;
    const nieuw = T.gebied(S, naar);
    // De kaart is nog niet getekend. Dan gebeurt er niets: je blijft staan waar je staat, want
    // een half aangelegde wereld mag nooit een lopend spel omgooien.
    if (!nieuw) {
      ontbreekt(naar, 'je stapte er net op');
      if (T.ui && T.ui.bericht) T.ui.bericht('Die kant op is nog niets, alleen mist.');
      return;
    }

    // De held verhuist: uit de ene lijst wezens, in de andere.
    if (oud) {
      const i = oud.wezens.indexOf(S.held);
      if (i >= 0) oud.wezens.splice(i, 1);
    }
    if (!nieuw.wezens.includes(S.held)) nieuw.wezens.push(S.held);
    const plek = T.landingIn(nieuw, vanaf);
    zetNeer(S.held, plek.x, plek.y);
    // Hij is hier neergezet, niet naartoe gelopen. Een overgang gaat pas weer af als hij er een
    // keer af is geweest; dat is het tweede slot op de lus (het eerste is landingIn hierboven).
    S.netGeland = { x: plek.x, y: plek.y };

    S.wereld = nieuw;
    // Alles wat bij de vorige plek hoorde, blijft daar: effecten, het bereik en een gevecht dat
    // nog liep.
    S.gevecht = null;
    S.modus = 'verkennen';
    S.bezig = false;
    S.effecten = [];
    S.wachters = [];
    S.bereik = null;
    S.hover = null;
    S.handeling = null;
    S.naLopen = null;
    S.rasterTegels = [];
    S.rasterAlpha = 0;
    S.rasterVan = null;

    const k = T.kamerVan(nieuw, plek.x, plek.y);
    if (k) {
      nieuw.bekend.add(k.id);
      nieuw.huidigeKamer = k.id;
    }
    const d = T.deurOp(nieuw, plek.x, plek.y);
    if (d) T.ontdekBijDeur(nieuw, d);

    // De camera springt mee: hij glijdt normaal achter de held aan, maar over een gebied heen
    // glijden zou een reis door het niets zijn.
    const p = T.naarScherm(S.held.x, S.held.y);
    S.camera = { x: p.x, y: p.y - 24 };
    if (S.grond) S.grond.sleutel = ''; // de grondbuffer opnieuw tekenen (js/tekenen.js)

    // Binnen zegt de kamer waar je bent ("De hal"), buiten heet de enige kamer naar het gebied
    // zelf ("Het erf"): allebei uit dezelfde vraag.
    const naam = (k && k.naam) || (T.GEBIEDEN[naar] && T.GEBIEDEN[naar].naam) || naar;
    T.ui.plek(naam);
    if (S.bezocht) S.bezocht.add(naar);
    return nieuw;
  };

  // Een nieuw spel beginnen op een kaart: het gehucht, of een andere voor een proefje
  // (index.html?kaart=<naam>, zie js/main.js). Geeft true terug als het gelukt is; S.wereld en
  // S.held staan dan klaar. Bestaat de kaart niet, dan false — de aanroeper valt dan terug op het
  // gehucht. Staat er geen "held" op, dan zet het er zelf een neer.
  T.beginOpKaart = function (S, naam) {
    const w = T.gebied(S, naam);
    if (!w) {
      console.warn(`Toren.beginOpKaart: kaart "${naam}" bestaat niet — draai npm run kaarten?`);
      return false;
    }
    S.wereld = w;
    let held = w.wezens.find((e) => e.soort === 'held');
    if (!held) {
      console.warn(`Toren.beginOpKaart: geen "held" op kaart "${naam}", hij begint op (0, 0)`);
      held = T.maakWezen('held', 0, 0);
      w.wezens.push(held);
    }
    // Een schout is geen tovenaar: hij krijgt hier het vel van een gewone dorpeling. `kant`
    // blijft 'held' (die staat al vast sinds T.maakWezen, zie T.WEZENS in js/wereld.js), dus de
    // HUD en de beurtvolgorde blijven gewoon op hem letten; alleen T.sprites.houding kijkt naar
    // `soort` om het plaatje te kiezen (js/sprites.js). Zie ontwerp/werklijst.md, punt 1b.
    held.soort = 'dorpeling';
    // Zijn loopmaat (T.SCHOUT_SNELHEID, js/wereld.js) had hij al: die staat bij de held in
    // T.WEZENS. Van 23 tot 24 sep stond hij hier stil, omdat een 'held' toen op zijn leeftijd liep
    // en zelf snelheid 0 had; dit blijft staan als vangnet voor een held uit een oude kaart.
    held.snelheid = T.SCHOUT_SNELHEID;
    if (held.zaad == null) held.zaad = 1;
    S.held = held;
    zetNeer(held, held.x, held.y);
    // Een klein beginvoorraadje (kaarten/<naam>.betekenis.json, "beginVoorraad") en de gebouwen
    // die al op de kaart staan (js/gebouwen.js) — zodat een dorp niet leeg begint.
    if (w.beginVoorraad && T.zetVoorraad) {
      for (const wat in w.beginVoorraad) T.zetVoorraad(S, wat, w.beginVoorraad[wat]);
    }
    if (T.zetBestaandeGebouwen) T.zetBestaandeGebouwen(S);
    // Wie de boeren zijn en wat ze kunnen, wordt bij elk nieuw spel geloot (js/boeren.js).
    if (T.lootBoeren) T.lootBoeren(S);
    // De beginkudde op de weide(s) die de kaart noemt (js/vee.js), net als de gebouwen hierboven;
    // ná het lot, want het zaad van het spel kiest ook de kleuren van het vee.
    if (T.zetBeginKudde) T.zetBeginKudde(S);
    return true;
  };
})(globalThis.Toren = globalThis.Toren || {});
