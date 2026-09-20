// De spreuken van de meester: wat ze kosten, wat ze doen, en hoe ze beter worden als je ze
// gebruikt. Hier staan alleen regels, zonder scherm, zodat alles in Node te toetsen is. Wat je
// ziet als je tovert, staat in toveren.js.
//
// Twee assen, één munt: tijd. De leeftijd bepaalt welke kring van spreuken open is (leeftijd.js),
// het gebruik hoe goed je een spreuk beheerst. Een spreuk telt alleen als hij iets doet: raken,
// duwen, een deur dichtgooien, een monster weglokken. In de lucht toveren om te oefenen telt
// niet. En geen trede maakt een spreuk ooit goedkoper in jaren.
(function (T) {
  'use strict';

  // Na veertig jaar is alles roestig. vanaf: na hoe vaak raak.
  T.TREDEN = [
    { id: 'roestig', naam: 'Roestig', vanaf: 0 },
    { id: 'vertrouwd', naam: 'Vertrouwd', vanaf: 3 },
    { id: 'geoefend', naam: 'Geoefend', vanaf: 8 },
    { id: 'meesterlijk', naam: 'Meesterlijk', vanaf: 15 },
    { id: 'legendarisch', naam: 'Legendarisch', vanaf: 25 },
  ];

  // Per spreuk: de kring, de toets, de kleur (voor de knop en het bereik op de vloer), wat hij
  // als Roestige spreuk kan (basis) en wat elke trede daaraan verandert (zet). De treden
  // stapelen: wie Geoefend is, heeft ook wat Vertrouwd gaf. De namen staan met een kleine
  // letter, want ze staan bijna altijd midden in een zin.
  //
  // ap: actiepunten in een gevecht. maanden: wat hij kost aan leven. gevecht, buiten: of je hem
  // in en buiten een gevecht kunt gebruiken.
  T.SPREUKEN = {
    vuurschicht: {
      naam: 'vuurschicht', kring: 1, toets: '2', kleur: '#ff9646',
      uitleg: 'Vuur op een monster dat je ziet. Alleen in een gevecht.',
      basis: { ap: 5, maanden: 12, bereik: 6, schade: [5, 8], brandt: 0, doorboort: false, gevecht: true, buiten: false },
      treden: {
        vertrouwd: { tekst: 'bereik 7', zet: { bereik: 7 } },
        geoefend: { tekst: 'het doel brandt na, 1 schade aan het begin van zijn beurt', zet: { brandt: 1 } },
        meesterlijk: { tekst: '4 actiepunten', zet: { ap: 4 } },
        legendarisch: { tekst: 'hij vliegt door zijn doel heen, naar het volgende monster op de lijn', zet: { doorboort: true } },
      },
    },
    dwaallicht: {
      naam: 'dwaallicht', kring: 1, toets: '3', kleur: '#96dcff',
      uitleg: 'Een lichtje dat je ergens heen stuurt. Een dwalend monster dat het ziet, gaat kijken.',
      basis: { ap: 2, maanden: 1, bereik: 6, duur: 8, nablijven: 0, gevecht: false, buiten: true },
      treden: {
        vertrouwd: { tekst: 'het vliegt 3 tegels verder', zet: { bereik: 9 } },
        geoefend: { tekst: 'het blijft twee keer zo lang hangen', zet: { duur: 16 } },
        meesterlijk: { tekst: 'monsters blijven nog even kijken als het uit is', zet: { nablijven: 4 } },
        legendarisch: { tekst: 'ook in een gevecht, voor 1 actiepunt', zet: { gevecht: true, ap: 1 } },
      },
    },
    windstoot: {
      naam: 'windstoot', kring: 1, toets: '4', kleur: '#d7e8f5',
      uitleg: 'Duwt in een gevecht een monster van je af, of gooit van afstand een open deur dicht.',
      basis: { ap: 3, maanden: 3, bereik: 3, deurBereik: 4, duwt: 2, apVerlies: 0, breed: false, gevecht: true, buiten: true },
      treden: {
        vertrouwd: { tekst: 'hij duwt 3 tegels', zet: { duwt: 3 } },
        geoefend: { tekst: 'wie geduwd wordt, heeft zijn volgende beurt 2 actiepunten minder', zet: { apVerlies: 2 } },
        meesterlijk: { tekst: 'hij duwt ook wie er links en rechts naast het doel staat', zet: { breed: true } },
        legendarisch: { tekst: '2 actiepunten', zet: { ap: 2 } },
      },
    },
  };
  T.SPREUK_VOLGORDE = Object.keys(T.SPREUKEN);

  // Welke trede hoort bij zo vaak raak?
  T.tredeVoor = function (aantal) {
    let t = 0;
    for (let i = 1; i < T.TREDEN.length; i++) if (aantal >= T.TREDEN[i].vanaf) t = i;
    return t;
  };

  // Het meesterschap staat per held: held.meesterschap = { vuurschicht: 4, ... }.
  T.gebruik = (held, id) => (held.meesterschap && held.meesterschap[id]) || 0;
  T.trede = (held, id) => T.tredeVoor(T.gebruik(held, id));

  // Wat de spreuk nu kan: de basis, met daarop elke trede tot en met de huidige.
  T.spreuk = function (held, id) {
    const s = T.SPREUKEN[id];
    const trede = T.trede(held, id);
    const r = Object.assign({ id, naam: s.naam, kring: s.kring, toets: s.toets, kleur: s.kleur, trede }, s.basis);
    for (let i = 1; i <= trede; i++) Object.assign(r, s.treden[T.TREDEN[i].id].zet);
    // Nooit goedkoper in jaren, wat een trede ook zegt. Dat is de kernregel.
    r.maanden = s.basis.maanden;
    return r;
  };

  // Een spreuk deed iets: tel hem. Stijgt hij daarmee een trede, dan geeft dit die trede terug,
  // met wat hij erbij krijgt. Anders null.
  T.telGebruik = function (held, id) {
    if (!held.meesterschap) held.meesterschap = {};
    const voor = T.trede(held, id);
    held.meesterschap[id] = T.gebruik(held, id) + 1;
    const na = T.trede(held, id);
    if (na === voor) return null;
    return { trede: na, naam: T.TREDEN[na].naam, tekst: T.SPREUKEN[id].treden[T.TREDEN[na].id].tekst };
  };

  // Hoe ver ben je op weg naar de volgende trede? binnen van nodig keer raak. Voor de stippen
  // onder de spreuk.
  T.voortgang = function (held, id) {
    const aantal = T.gebruik(held, id);
    const trede = T.tredeVoor(aantal);
    const nu = T.TREDEN[trede];
    const hoger = T.TREDEN[trede + 1];
    if (!hoger) return { aantal, trede, naam: nu.naam, binnen: 0, nodig: 0, volgende: null };
    return {
      aantal, trede, naam: nu.naam,
      binnen: aantal - nu.vanaf,
      nodig: hoger.vanaf - nu.vanaf,
      volgende: { naam: hoger.naam, nog: hoger.vanaf - aantal, tekst: T.SPREUKEN[id].treden[hoger.id].tekst },
    };
  };

  // Welke kring is open? Wat ooit open ging, blijft open (held.kring, bijgehouden in T.verouder).
  T.kringVan = (held) => Math.max(held.kring || 0, T.kringVoorLeeftijd(held.leeftijd));
  T.kentSpreuk = (held, id) => T.SPREUKEN[id].kring <= T.kringVan(held);

  // De vuurschicht wordt sterker met de jaren: +1 schade per vijf jaar boven de tachtig.
  T.schichtSchade = (held) => T.SPREUKEN.vuurschicht.basis.schade.map((n) => n + T.magieBonus(held.leeftijd));

  // De tegels op een rechte lijn van a naar b, zonder a. Dezelfde stappen als bij zicht
  // (Bresenham), zodat een spreuk vliegt waar je kijkt.
  function lijn(a, b) {
    const tegels = [];
    let x = a.x;
    let y = a.y;
    const dx = Math.abs(b.x - x);
    const dy = -Math.abs(b.y - y);
    const sx = x < b.x ? 1 : -1;
    const sy = y < b.y ? 1 : -1;
    let fout = dx + dy;
    while (x !== b.x || y !== b.y) {
      const f2 = 2 * fout;
      if (f2 >= dy) { fout += dy; x += sx; }
      if (f2 <= dx) { fout += dx; y += sy; }
      tegels.push({ x, y });
    }
    return tegels;
  }

  // Alle tegels binnen `bereik` stappen waar iets heen kan vliegen: vloer en open deuren die je
  // kent en vanaf `van` ziet. Het bereik van een spreuk op de vloer.
  T.tegelsInZicht = function (w, van, bereik) {
    const lijst = [];
    for (let y = van.y - bereik; y <= van.y + bereik; y++) {
      for (let x = van.x - bereik; x <= van.x + bereik; x++) {
        if (x === van.x && y === van.y) continue;
        if (!T.isZichtbaar(w, x, y) || !T.isBegaanbaar(w, x, y)) continue;
        if (T.zichtTussen(w, van, { x, y })) lijst.push({ x, y });
      }
    }
    return lijst;
  };

  // ── Vuurschicht ──

  // Vanaf Legendarisch vliegt een vuurschicht door zijn doel heen. Welk monster staat daarachter
  // op dezelfde lijn, binnen het bereik en zonder muur, dichte deur of kist ertussen?
  // kandidaten: wie je mag raken (in een gevecht: wie meedoet).
  T.volgendOpLijn = function (w, van, doel, bereik, kandidaten) {
    const dx = doel.x - van.x;
    const dy = doel.y - van.y;
    const stap = Math.max(Math.abs(dx), Math.abs(dy));
    if (!stap) return null;
    // De lijn door het doel heen doortrekken tot voorbij het bereik. Een punt dat precies op de
    // lijn ligt (het doel), raakt Bresenham altijd.
    const k = Math.ceil(bereik / stap) + 1;
    const voorbij = T.afstand(van, doel);
    for (const t of lijn(van, { x: van.x + dx * k, y: van.y + dy * k })) {
      const a = T.afstand(van, t);
      if (a <= voorbij) continue;
      if (a > bereik) return null;
      const m = kandidaten.find((e) => !e.dood && e.tx === t.x && e.ty === t.y);
      if (m) return m;
      if (T.blokkeertZicht(w, t.x, t.y)) return null;
    }
    return null;
  };

  // ── Windstoot ──

  // De richting van a naar b, afgerond op de dichtstbijzijnde van de acht windrichtingen. Zo
  // duwt een windstoot een wezen recht van de held af.
  T.richtingVan = function (a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (!dx && !dy) return { x: 0, y: 0 };
    const hoek = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
    return { x: Math.round(Math.cos(hoek)) || 0, y: Math.round(Math.sin(hoek)) || 0 };
  };

  // De wind duwt monsters. Wim houdt zich vast aan zijn bezem.
  T.isDuwbaar = (e) => !!e && !e.dood && e.kant === 'monster';

  // Waar komt een wezen terecht als de wind het n tegels in richting r duwt? Het stopt eerder bij
  // een muur, een dichte deur, een kist, een ander wezen of de rand van de wereld. Een schuine
  // duw gaat, net als lopen, niet om een muurhoek heen. Geeft de tegels die het aflegt, zonder
  // de tegel waar het begint; bezetting telt op tx/ty.
  T.duwPad = function (w, e, r, n) {
    const pad = [];
    if (!r.x && !r.y) return pad;
    let x = e.tx;
    let y = e.ty;
    for (let i = 0; i < n; i++) {
      const nx = x + r.x;
      const ny = y + r.y;
      if (!T.isBegaanbaar(w, nx, ny, { wezensBlokkeren: true, wie: e })) break;
      if (r.x && r.y && (T.isVast(w, nx, y) || T.isVast(w, x, ny))) break;
      pad.push({ x: nx, y: ny });
      x = nx;
      y = ny;
    }
    return pad;
  };

  // Wie een windstoot op dit monster wegblaast, en over welk pad. Vanaf Meesterlijk raakt hij
  // een rij van drie: ook wie er links en rechts naast het doel staat, dwars op de duwrichting,
  // gaat dezelfde kant op. Die rijen lopen naast elkaar, dus niemand staat een ander in de weg.
  T.windstootDuwen = function (w, held, doel, eig) {
    const r = T.richtingVan(T.tegelVan(held), T.tegelVan(doel));
    const wezens = [doel];
    if (eig.breed) {
      for (const d of [{ x: -r.y, y: r.x }, { x: r.y, y: -r.x }]) {
        const e = T.wezenOp(w, doel.tx + d.x, doel.ty + d.y, held);
        if (T.isDuwbaar(e)) wezens.push(e);
      }
    }
    return wezens.map((e) => ({ wezen: e, pad: T.duwPad(w, e, r, eig.duwt) }));
  };

  // ── Dwaallicht ──

  // Ziet dit monster het licht? Zoals het de held ziet: binnen zijn zicht, en niets ertussen.
  T.zietLicht = function (w, m, l) {
    if (m.dood || m.kant !== 'monster') return false;
    const p = T.tegelVan(m);
    return T.afstand(p, l) <= m.zicht && T.zichtTussen(w, p, l);
  };

  // Buiten een gevecht gaat alleen een monster dat dwaalt op een licht af. Een wacht blijft staan.
  T.lokt = (w, m, l) => !!m.dwaalt && T.zietLicht(w, m, l);

  // De weg van een monster naar het licht: erheen, of ernaast als daar al iemand staat. Monsters
  // openen geen deuren. Geeft null als het er niet kan komen.
  T.lokPad = function (w, m, l) {
    const mag = (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: m });
    const vast = (x, y) => T.isVast(w, x, y);
    const doel = { x: l.x, y: l.y };
    return T.zoekPad(T.tegelVan(m), doel, mag, vast) || T.zoekPad(T.tegelVan(m), doel, mag, vast, { naast: true });
  };
})(globalThis.Toren = globalThis.Toren || {});
