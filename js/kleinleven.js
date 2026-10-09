// Het kleine leven (werklijst vraag 145, 3; Marcel, 9 okt: "het voelt gewoon wat 'saai' in het dorp", en "Ja, dat zijn
// kleine details die het echt levend maken"): rook uit de schoorstenen, water dat stroomt en glinstert, kippen bij de
// boerderijen, een hond die met zijn baas meeloopt, kinderen die spelen, en was aan de lijn. Alleen beeld: het verandert niets aan de regels van het spel.
// Hier staat wat er is en waar (zonder scherm, dus te toetsen); js/tekenen.js tekent het. De spelregel "Klein leven"; de
// getallen in T.KLEIN_LEVEN_INSTELLINGEN.
(function (T) {
  'use strict';

  T.KLEIN_LEVEN_INSTELLINGEN = {
    // Is er klein leven (de spelregel "Klein leven")?
    aan: true,
    // De rook: uit een huis waar iemand thuis is (T.huizenMetIemandThuis, js/zien.js), zo dik als het vuur brandt: in
    // de winter de hele dag, anders 's ochtends en 's avonds het meest, overdag weinig, 's nachts een smeulend vuurtje. Een
    // hut heeft geen schoorsteen: daar trekt de rook dun door het riet (hut).
    rook: { winter: 1, ochtend: 1, avond: 0.9, werk: 0.25, schaft: 0.5, nacht: 0.2, hut: 0.6 },
    // Het beeld van de rook (pixels op zoom 1): hoeveel pluimpjes, hoe hoog ze stijgen, hoe groot ze worden, hoe ver de
    // wind ze meeneemt, en hoe dicht ze zijn (0 tot 1).
    rookBeeld: { pluimen: 26, hoog: 190, klein: 5, groot: 24, wind: 70, dicht: 0.62 },
    // Het water (Marcel: "vergeet ook niet het water wat mag bewegen 'stromen' etc"): een beek stroomt, met zoveel
    // rimpels per tegel die met de stroom meegaan (snel: tegels per seconde), en stil water (een vijver, een meer)
    // glinstert hier en daar (glinster: hoeveel per tegel, en hoe vaak per seconde er een opkomt).
    water: { rimpels: 3, snel: 0.35, glinster: 0.5, knipper: 0.6 },
    // Kinderen die spelen: een kind (of een kleuter) dat vrij is en een ander kind treft binnen `afstand` tegels, begint
    // met deze kans een spelletje (bij elke stap van het dwalen), tot `groep` kinderen; ze rennen dan om elkaar heen,
    // binnen `straal` tegels van waar het begon, `duur` uur (van, tot), en daarna `rust` uur niet weer. Niet in de regen,
    // en niet op een akker of een weide.
    spelen: { afstand: 4, kans: 0.25, groep: 5, straal: 2, duur: [0.4, 1.2], rust: 1.5 },
    // De kippen: zoveel bij elke boerderij waar iemand woont, en met deze kans is er een haan bij; ze scharrelen
    // binnen `straal` tegels van de deur, lopen elke paar seconden (periode, van en tot) naar een ander plekje (een
    // deel `lopen` van die tijd) en pikken of staan dan. 's Nachts zitten ze in het hok.
    kippen: { perBoerderij: 4, haan: 0.5, straal: 3, periode: [5, 9], lopen: 0.3 },
    // De honden (Marcel: "her en der 1 bij een huis"): een gezin heeft met deze kans een hond, die zijn baas volgt op
    // `achter` tegels, en blaft naar een vreemde die binnen `blaffen` tegels komt.
    honden: { kans: 0.3, achter: 1.3, blaffen: 5 },
  };
  const IN = () => T.KLEIN_LEVEN_INSTELLINGEN;

  // Hoe het water op een tegel beweegt: null (geen water), { stil: true } (een vijver of een meer: het glinstert), of de
  // richting waarin een beek stroomt ({ dx, dy }, een eenheid langs de tegels): langs de kant waarin het water het verst
  // doorloopt, en bergaf als het land hoogte heeft. Per kaart één keer (niet in Spel.S), opnieuw als de kaart verandert.
  const stroming = new WeakMap();
  T.waterOp = function (w, x, y) {
    if (!IN().aan || !w || !w.grond) return null;
    const versie = T.kaartVersie(w);
    let k = stroming.get(w);
    if (!k || k.versie !== versie) stroming.set(w, (k = { versie, tegels: new Map() }));
    const sleutel = y * 100000 + x;
    if (k.tegels.has(sleutel)) return k.tegels.get(sleutel);
    const water = (a, b) => !!(w.grond[b] && w.grond[b][a] && w.grond[b][a].naam === 'water');
    let uit = null;
    if (water(x, y)) {
      if (!T.isBeek(w, x, y)) uit = { stil: true };
      else {
        let langsX = 0;
        let langsY = 0;
        for (let d = 1; d <= 3; d++) {
          langsX += water(x - d, y) + water(x + d, y);
          langsY += water(x, y - d) + water(x, y + d);
        }
        const xas = langsX >= langsY;
        // bergaf, als er hoogte is: van de hoge naar de lage kant
        let teken = 1;
        if (T.heeftHoogte(w)) {
          const a = xas ? T.hoogteOp(w, x - 1, y) : T.hoogteOp(w, x, y - 1);
          const b = xas ? T.hoogteOp(w, x + 1, y) : T.hoogteOp(w, x, y + 1);
          if (a < b) teken = -1;
        }
        uit = xas ? { dx: teken, dy: 0 } : { dx: 0, dy: teken };
      }
    }
    k.tegels.set(sleutel, uit);
    return uit;
  };

  // ── Kinderen die spelen ──
  // Wie in het spel staat, zegt het poppetje zelf, zoals bij een praatje (js/praatje.js): e.spel is het spelletje, een
  // ding dat ze delen, met de plek waar het begon en tot wanneer (een dag van de kalender). Het staat in S.

  // Kan dit kind nu spelen? Een kind of een kleuter, overdag, zonder werk, en niet in de regen.
  T.kanSpelen = function (S, D, e, deel) {
    if (e.dood || e.binnen || e.maait || e.werkt || e.opgeroepen || e.zoektSchout || e.moetNaar || e.vertrekt || e.praatje) return false;
    if (deel !== 'ochtend' && deel !== 'werk' && deel !== 'schaft') return false;
    if (S.gevecht && D.wereld === S.wereld) return false;
    const p = e.bewoner;
    if (!p || p.komt || p.weg || p.werk || p.ziek || (p.leeftijd !== 'kind' && p.leeftijd !== 'kleuter')) return false;
    if (T.helpAnker(D, e)) return false;
    const weer = T.weerVan(D);
    return !(weer && weer.vandaag === 'regen');
  };

  // Bij een stap van het dwalen (T.dwaal, js/verkennen.js): wie speelt, rent naar een andere tegel bij de plek van het
  // spel; wie vrij is en een ander kind treft, begint er soms een. Geeft true als het kind nu speelt.
  T.speel = function (S, w, D, e, deel) {
    if (!IN().aan || !e.bewoner || !D || !D.kalender) return false;
    const P = IN().spelen;
    const dag = D.kalender.dag;
    const sp = e.spel;
    // een vast lot (geen Math.random): per kind en per minuut van het spel
    const minuut = Math.floor(dag * 24 * 60);
    const lot = (kanaal) => T.vastLot(D, minuut * 97 + (e.bewoner.id || 0), kanaal);
    if (sp && (dag >= sp.tot || !T.kanSpelen(S, D, e, deel))) {
      delete e.spel;
      e.speeldTot = dag + P.rust / 24;
      return false;
    }
    if (!sp) {
      if (e.speeldTot > dag || !T.kanSpelen(S, D, e, deel)) return false;
      const ander = w.wezens.find((x) => x !== e && x.bewoner && T.afstand({ x: x.tx, y: x.ty }, { x: e.tx, y: e.ty }) <= P.afstand && (x.spel ? x.spel.wie < P.groep : !(x.speeldTot > dag) && T.kanSpelen(S, D, x, deel)));
      // niet op een akker of een weide: daar groeit wat, en daar wordt gewerkt
      if (!ander || T.veldOp(w, e.tx, e.ty) || lot(5101) >= P.kans) return false;
      if (ander.spel) {
        e.spel = ander.spel;
        e.spel.wie++;
      } else {
        const duur = P.duur[0] + lot(5102) * (P.duur[1] - P.duur[0]);
        e.spel = ander.spel = { plek: { x: Math.round((e.tx + ander.tx) / 2), y: Math.round((e.ty + ander.ty) / 2) }, tot: dag + duur / 24, wie: 2 };
      }
    }
    // rennen: een tegel bij de plek van het spel, een andere dan waar hij staat
    const pl = e.spel.plek;
    const r = P.straal;
    const vrij = [];
    for (let y = pl.y - r; y <= pl.y + r; y++) {
      for (let x = pl.x - r; x <= pl.x + r; x++) {
        if ((x !== e.tx || y !== e.ty) && !T.veldOp(w, x, y) && T.isBegaanbaar(w, x, y, { wezensBlokkeren: true })) vrij.push({ x, y });
      }
    }
    if (!vrij.length) return true;
    const doel = vrij[Math.floor(lot(5103) * vrij.length)];
    const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, doel);
    if (pad && pad.length && pad.length <= 2 * r + 2) T.geefRoute(e, pad, doel);
    e.dwaalTijd = 0.1 + lot(5104) * 0.4;
    return true;
  };

  // ── De kippen en de honden: alleen beeld, uit de tijd en het nummer van het land (niets ervan in Spel.S) ──

  // De plekjes op het erf van een boerderij waar de kippen scharrelen: begaanbaar, geen akker of weide, geen water,
  // binnen `straal` van de deur. Per kaart één keer.
  const erven = new WeakMap();
  function erfVan(w, g) {
    const versie = T.kaartVersie(w);
    let k = erven.get(w);
    if (!k || k.versie !== versie) erven.set(w, (k = { versie, erven: new Map() }));
    if (k.erven.has(g)) return k.erven.get(g);
    const deur = T.deurVan(w, g);
    const r = IN().kippen.straal;
    const tegels = [];
    for (let y = deur.y - r; y <= deur.y + r; y++) {
      for (let x = deur.x - r; x <= deur.x + r; x++) {
        if ((x === deur.x && y === deur.y) || !T.isBegaanbaar(w, x, y) || T.veldOp(w, x, y) || T.waterOp(w, x, y)) continue;
        tegels.push({ x, y });
      }
    }
    k.erven.set(g, tegels);
    return tegels;
  }

  // De kippen die nu buiten zijn: [{ x, y, naam, houding, dx, dy, tijd (hoe lang al in deze houding, s), afgelegd
  // (tegels, voor de pas) }]. `tijd` is de klok van de wereld (S.wereldTijd), zodat ze op elke snelheid even rustig
  // scharrelen en stilstaan als het spel stilstaat.
  T.kippenOp = function (D, w, tijd) {
    if (!IN().aan || !D || !D.bewoners || !D.kalender || !w) return [];
    if (T.dagdeelVan(D.kalender.dag) === 'nacht') return [];
    const K = IN().kippen;
    const uit = [];
    for (const g of D.gebouwen || []) {
      if (g.soort !== 'boerderij' || g.klaar === false || !D.bewoners.mensen.some((p) => p.huis === g)) continue;
      const tegels = erfVan(w, g);
      if (!tegels.length) continue;
      const haan = T.vastLot(D, g.x * 131 + g.y, 5201) < K.haan;
      for (let c = 0; c < K.perBoerderij; c++) {
        const zaad = (g.x * 131 + g.y * 71) * 8 + c;
        const lot = (a, kanaal) => T.vastLot(D, zaad * 9973 + a, kanaal);
        const kleur = haan && c === 0 ? 3 : Math.floor(lot(0, 5202) * 3);
        const periode = K.periode[0] + lot(0, 5203) * (K.periode[1] - K.periode[0]);
        const t = tijd / periode + lot(0, 5204) * 10;
        const n = Math.floor(t);
        const u = t - n;
        const A = tegels[Math.floor(lot(n - 1, 5205) * tegels.length)];
        const B = tegels[Math.floor(lot(n, 5205) * tegels.length)];
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const lang = Math.hypot(dx, dy);
        if (u < K.lopen && lang > 0) {
          const f = u / K.lopen;
          uit.push({ x: A.x + dx * f, y: A.y + dy * f, naam: `kip${kleur}`, houding: 'lopen', dx, dy, tijd: u * periode, afgelegd: lang * f });
        } else {
          const pik = lot(n, 5206) < 0.65;
          uit.push({ x: B.x, y: B.y, naam: `kip${kleur}`, houding: pik ? 'pikken' : 'staan', dx: dx || 1, dy, tijd: (u - K.lopen) * periode, afgelegd: 0 });
        }
      }
    }
    return uit;
  };

  // De honden: [{ gezin, naam, baas, huis }]: een gezin met een hond (uit het lot van het land), en zijn baas, het hoofd van het
  // gezin als dat een poppetje op deze kaart heeft. Waar de hond loopt, rekent js/tekenen.js uit (hij loopt zijn baas
  // achterna); niets ervan staat in Spel.S.
  T.hondenVan = function (D, w) {
    if (!IN().aan || !D || !D.bewoners || !w) return [];
    const gezinnen = new Map();
    for (const p of D.bewoners.mensen) {
      if (!p.wezen || p.weg || p.schout || !w.wezens.includes(p.wezen)) continue;
      const nu = gezinnen.get(p.gezin);
      const rang = !p.hoofd ? 0 : p.leeftijd === 'volwassen' ? 1 : p.leeftijd === 'jong' ? 2 : 9;
      if (rang < 9 && (!nu || rang < nu.rang)) gezinnen.set(p.gezin, { p, rang });
    }
    const uit = [];
    for (const [gezin, { p }] of gezinnen) {
      if (T.vastLot(D, gezin, 5301) >= IN().honden.kans) continue;
      uit.push({ gezin, naam: `hond${Math.floor(T.vastLot(D, gezin, 5302) * 3)}`, baas: p.wezen, huis: p.huis });
    }
    return uit;
  };

  // Een vreemde bij (x, y), binnen r tegels, of null: de marskramer, de heer en de zijnen, rovers, een wolf.
  T.vreemdeBij = function (w, x, y, r) {
    for (const e of w.wezens) {
      if (e.dood) continue;
      const vreemd = e.rover || e.beest === 'wolf' || e.kant === 'monster' || (e.wie && T.MENSEN[e.wie] && T.MENSEN[e.wie].bezoeker);
      if (vreemd && Math.hypot(e.x - x, e.y - y) <= r) return e;
    }
    return null;
  };

  // Welke huizen roken, en hoe dik: [{ g, deur, dik }] (dik van 0 tot 1).
  T.rookUitHuizen = function (D) {
    if (!IN().aan || !D || !D.kalender || !D.bewoners) return [];
    const R = IN().rook;
    const winter = T.datumVanDag(D.kalender.dag).seizoen === 'winter';
    const deel = T.dagdeelVan(D.kalender.dag);
    const vuur = Math.max(winter && deel !== 'nacht' ? R.winter : 0, R[deel] || 0);
    if (!vuur) return [];
    return T.huizenMetIemandThuis(D).map(({ g, deur }) => ({ g, deur, dik: vuur * (g.soort === 'hut' ? R.hut : 1), hut: g.soort === 'hut' }));
  };
})(globalThis.Spel = globalThis.Spel || {});
