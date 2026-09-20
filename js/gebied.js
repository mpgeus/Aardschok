// Gebieden en de overgang ertussen. De toren staat in code (js/wereld.js), want zijn kamers zijn
// klein en hangen aan het verhaal; alles wat buiten speelt komt uit een kaart die in Tiled
// getekend is (js/kaart.js). Eén deur, twee kanten op: je loopt de toren uit en staat op je erf,
// je loopt het erf af en staat weer in je hal.
//
// De held verhuist mee — met zijn leeftijd, zijn meesterschap en wat hij bij zich heeft — en de
// wereld die hij achterlaat blijft staan: een gedode wolf blijft dood, en een deur die je liet
// openstaan staat er nog open als je terugkomt.
(function (T) {
  'use strict';

  T.GEBIEDEN = {
    toren: { naam: 'De toren', maak: () => T.maakWereld() },
    erf: { naam: 'Het erf', maak: () => T.laadKaart(T.KAARTEN.erf) },
  };

  // Het gebied bij deze naam, één keer gemaakt en daarna bewaard in S.gebieden.
  T.gebied = function (S, naam) {
    if (!S.gebieden) S.gebieden = {};
    if (!S.gebieden[naam]) {
      const g = T.GEBIEDEN[naam];
      if (!g) throw new Error(`Onbekend gebied: ${naam}`);
      const w = g.maak();
      w.gebied = naam;
      // Buiten is er één kamer die de hele kaart beslaat (js/kaart.js); die heet naar het gebied,
      // zodat "Het erf" in beeld komt en niet "Buiten".
      if (w.buiten && w.kamers.length === 1) w.kamers[0].naam = g.naam;
      // Een gebied zonder uitgang is een val: daar kom je nooit meer weg. Dat moet hoorbaar zijn
      // zodra het gebeurt, niet pas als een speler vaststaat.
      if (!w.overgangen || !w.overgangen.length) {
        console.error(`Aardschok: gebied "${naam}" heeft geen enkele overgang — je komt er niet meer uit. Draai npm run kaart:erf opnieuw.`);
      }
      S.gebieden[naam] = w;
    }
    return S.gebieden[naam];
  };

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
    // Alles wat bij de vorige plek hoorde, blijft daar: dwaallichten, effecten, het bereik, de
    // spreuk in de hand en een gevecht dat nog liep.
    S.gevecht = null;
    S.modus = 'verkennen';
    S.bezig = false;
    S.spreuk = null;
    S.spreukBereik = null;
    S.lichten = [];
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
})(globalThis.Toren = globalThis.Toren || {});
