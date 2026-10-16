// Gebieden en de overgang ertussen. Een gebied is een kaart die in Tiled getekend is
// (js/kaart.js). Eén aansluiting, twee kanten op: je loopt de ene kaart af en staat op de andere,
// en langs dezelfde weg weer terug. (Tot 25 sep stond de toren van het oude spel hier nog in code,
// naast de kaarten; die ging weg met het oude spel.)
//
// Welke gebieden er zijn, staat nergens opgeschreven: elke kaart is er een (zie T.maakGebieden
// hieronder). Marcel tekent in Tiled, draait npm run kaarten, en de wereld is groter geworden.
//
// De aanvoerder verhuist mee — met zijn levenspunten en wat hij bij zich heeft — en de
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
  // spelen een kaart bijzet (Spel.KAARTEN.bos = ...), roept dit daarna zelf nog eens aan. Je eigen dorp ("gehucht") staat
  // er niet in: dat is geen kaart uit Tiled maar het land van de maker (js/maker.js), dat T.beginOpKaart meegeeft; tot
  // ronde 2 van het snoeien (stap 3c, 12 okt) was het het ontworpen gehucht, kaarten/gehucht.tmj.
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
  // T.gaNaarGebied), want een kaart die nog niet getekend is, mag het spel niet omgooien. Met `maak`
  // komt de wereld ergens anders vandaan dan uit kaarten/: een gehucht van de maker (js/maker.js).
  T.gebied = function (S, naam, maak) {
    if (!S.gebieden) S.gebieden = {};
    if (!S.gebieden[naam]) {
      const g = T.GEBIEDEN[naam];
      if (!g && !maak) return null;
      const w = (maak || g.maak)();
      w.gebied = naam;
      // Buiten is er één kamer die de hele kaart beslaat (js/kaart.js); die heet naar het gebied,
      // zodat "Het erf" in beeld komt en niet "Buiten". Een gemaakte kaart (`maak`) heet naar zichzelf.
      if (w.buiten && w.kamers.length === 1 && g) w.kamers[0].naam = g.naam;
      // Een gebied zonder uitgang is een val: daar kom je nooit meer weg. Dat moet hoorbaar zijn
      // zodra het gebeurt, niet pas als een speler vaststaat.
      if (!w.overgangen || !w.overgangen.length) {
        console.error(`${T.NAAM}: gebied "${naam}" heeft geen enkele overgang — je komt er niet meer uit. Zet in Tiled een object met de eigenschap "overgang" op de kaart en draai npm run kaarten.`); // geen tekst
      }
      // En andersom: een overgang die naar een kaart wijst die niet bestaat. Ook dat hoort hier
      // al te klagen, bij het inlezen, en niet pas als een speler er per ongeluk op stapt. Behalve
      // op een proefkaart: het gehucht is er (nog) een, en zijn weg de wereld in leidt sinds de oude
      // kaart weg is (25 sep) bewust nergens heen; daar lopen alleen de marskramer en de heer
      // over (T.wegInEnUit, js/handel.js).
      for (const o of w.overgangen || []) {
        if (!T.GEBIEDEN[o.naar] && !w.proef) ontbreekt(o.naar, `de kaart "${naam}" wijst er op (${o.x}, ${o.y}) naartoe`); // geen tekst
      }
      S.gebieden[naam] = w;
    }
    return S.gebieden[naam];
  };

  // Eén klacht voor allebei de plekken waar het opvalt, in dezelfde bewoording: wat er ontbreekt
  // en wat Marcel eraan doet.
  function ontbreekt(naar, waar) {
    console.error(`${T.NAAM}: overgang naar "${naar}", maar dat gebied bestaat niet (${waar}). Teken kaarten/${naar}.tmj in Tiled en draai npm run kaarten.`); // geen tekst
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
    if (!o) {
      const vak = T.kaartVak(w);
      return { x: Math.floor(vak.x + vak.b / 2), y: Math.floor(vak.y + vak.h / 2) };
    }
    if (o.komt && deugt(w, o.komt.x, o.komt.y)) return { x: o.komt.x, y: o.komt.y };
    // eerst recht ernaast, dan schuin: de eerste die deugt
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      if (deugt(w, o.x + dx, o.y + dy)) {
        console.warn(`T.landingIn: "komt" bij de overgang op (${o.x}, ${o.y}) deugt niet; geland op (${o.x + dx}, ${o.y + dy})`); // geen tekst
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
      // Op een proefkaart leidt een overgang bewust nergens heen (de weg het gehucht uit, zolang de spelregel "Land" uit
      // staat; hierboven klaagt het daar bij het inlezen ook niet over): dan alleen de mist, en geen fout in de console.
      // De speeltest telde die fout, als zijn aanvoerder de weg af liep.
      const bewust = !!(oud && oud.proef && (oud.overgangen || []).some((o) => o.naar === naar));
      if (!bewust) ontbreekt(naar, 'je stapte er net op'); // geen tekst
      if (T.ui && T.ui.bericht) T.ui.bericht(T.t('There is nothing that way yet, only mist.'));
      return;
    }

    // De aanvoerder verhuist: uit de ene lijst wezens, in de andere.
    if (oud) {
      const i = oud.wezens.indexOf(S.dorp.aanvoerder);
      if (i >= 0) oud.wezens.splice(i, 1);
    }
    if (!nieuw.wezens.includes(S.dorp.aanvoerder)) nieuw.wezens.push(S.dorp.aanvoerder);
    const plek = T.landingIn(nieuw, vanaf);
    zetNeer(S.dorp.aanvoerder, plek.x, plek.y);
    // Hij is hier neergezet, niet naartoe gelopen. Een overgang gaat pas weer af als hij er een
    // keer af is geweest; dat is het tweede slot op de lus (het eerste is landingIn hierboven).
    S.netGeland = { x: plek.x, y: plek.y };

    S.wereld = nieuw;
    // Alles wat bij de vorige plek hoorde, blijft daar: de effecten en wat de muis aanwees.
    S.modus = 'verkennen';
    S.effecten = [];
    S.hover = null;
    S.handeling = null;

    const k = T.kamerVan(nieuw, plek.x, plek.y);
    if (k) {
      nieuw.bekend.add(k.id);
      nieuw.huidigeKamer = k.id;
    }
    const d = T.deurOp(nieuw, plek.x, plek.y);
    if (d) T.ontdekBijDeur(nieuw, d);

    // De camera springt mee: hij glijdt normaal achter de aanvoerder aan, maar over een gebied heen
    // glijden zou een reis door het niets zijn.
    const p = T.naarSchermOp(nieuw, S.dorp.aanvoerder.x, S.dorp.aanvoerder.y);
    S.camera = { x: p.x, y: p.y - 24 };
    S.kijk = { x: S.camera.x, y: S.camera.y };
    if (S.grond) S.grond.sleutel = ''; // de grondbuffer opnieuw tekenen (js/tekenen.js)

    // Binnen zegt de kamer waar je bent ("De hal"), buiten heet de enige kamer naar het gebied
    // zelf ("Het erf"): allebei uit dezelfde vraag.
    const naam = (k && k.naam) || (T.GEBIEDEN[naar] && T.GEBIEDEN[naar].naam) || naar;
    T.ui.plek(naam);
    if (S.bezocht) S.bezocht.add(naar);
    return nieuw;
  };

  // Het land van een nieuw spel (vraag 112, a; Marcel, 3 okt: "Eigenlijk een random map generator per nieuwe game"): het
  // zaad voor de maker, het land dat je bij Nieuw spel koos, of een nieuw. Een zaad is een getal van vijf cijfers, zodat
  // je een land dat je mooi vond, kunt onthouden en opnieuw spelen.
  T.landVoorNieuwSpel = (gekozen) => (gekozen != null ? gekozen : T.nieuwLandZaad());
  T.nieuwLandZaad = () => 1 + Math.floor(Math.random() * T.MAKER_INSTELLINGEN.zaden);

  // Een nieuw spel beginnen op een kaart: je dorp ('gehucht'), of een andere voor een proefje
  // (index.html?kaart=<naam>, zie js/main.js). Geeft true terug als het gelukt is; S.wereld en
  // S.dorp.aanvoerder staan dan klaar. Bestaat de kaart niet, dan false — de aanroeper valt dan terug op het
  // gehucht. Staat er geen "aanvoerder" op, dan zet het er zelf een neer.
  //
  // Voor je dorp legt de maker je land (js/maker.js) uit `makerZaad` (zonder: een nieuw), op het eiland en met het lege
  // begin erop: het land met een open plek voor het plein en het kamp (het enige begin sinds ronde 2 van het snoeien, stap 3,
  // en het enige land sinds stap 6: "Alles wordt door spelers geplaatst"). Welk land een nieuw spel krijgt, zegt
  // T.landVoorNieuwSpel hierboven (vanuit T.nieuwSpel, js/main.js). Het zaad is ook het zaad van het dorp (D.lot.zaad),
  // zodat hetzelfde zaad hetzelfde spel geeft.
  T.beginOpKaart = function (S, naam, makerZaad) {
    const zaad = naam === 'gehucht' ? (makerZaad != null ? makerZaad : T.nieuwLandZaad()) : null;
    const w = T.gebied(S, naam, zaad != null ? () => T.laadGemaaktGehucht(zaad) : null);
    if (!w) {
      console.warn(`Spel.beginOpKaart: kaart "${naam}" bestaat niet — draai npm run kaarten?`); // geen tekst
      return false;
    }
    S.wereld = w;
    let aanvoerder = w.wezens.find((e) => e.soort === 'aanvoerder');
    if (!aanvoerder) {
      console.warn(`Spel.beginOpKaart: geen "aanvoerder" op kaart "${naam}", hij begint op (0, 0)`); // geen tekst
      aanvoerder = T.maakWezen('aanvoerder', 0, 0);
      w.wezens.push(aanvoerder);
    }
    // Zijn soort is 'aanvoerder' en zijn kant 'speler' (T.WEZENS, js/wereld.js). Hij draagt het vel van
    // een gewone dorpeling, en welk, kiest zijn zaad hieronder; dat regelt T.sprites.houding
    // (js/sprites.js). Tot 26 sep kreeg hij hier de soort 'dorpeling' om aan dat vel te komen: een
    // overblijfsel van de tovenaar, die een eigen vel had (ontwerp/werklijst.md, punt 1b en 7e).
    // Zijn loopmaat (T.AANVOERDER_SNELHEID, js/wereld.js) had hij al: die staat bij de aanvoerder in
    // T.WEZENS. Van 23 tot 24 sep stond hij hier stil, omdat de held (toen nog een tovenaar) op
    // zijn leeftijd liep en zelf snelheid 0 had; dit blijft staan als vangnet voor een oude kaart.
    aanvoerder.snelheid = T.AANVOERDER_SNELHEID;
    if (aanvoerder.zaad == null) aanvoerder.zaad = 1;
    zetNeer(aanvoerder, aanvoerder.x, aanvoerder.y);
    // Het dorp op deze kaart, met zijn aanvoerder (js/dorp.js; sinds vraag 170, stap 5 staat hij alleen daar, als
    // S.dorp.aanvoerder): wat er staat, de boeren, het vee en wie er woont. Het is je eigen dorp (S.dorp), en voorlopig
    // het enige.
    S.dorp = T.nieuwDorp(S, w, aanvoerder, { zaad });
    S.dorpen = [S.dorp];
    return true;
  };
})(globalThis.Spel = globalThis.Spel || {});
