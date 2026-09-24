// Handel: de marskramer (ontwerp/spel.md, "Handel: de marskramer, ook heler"; werklijst, punt 4).
// IJzer, zout en steen heeft het gehucht niet; die komen van hem. Hij komt om de paar weken (niet
// in de winter), staat een paar dagen bij de brink, en jij loopt erheen om te handelen. Hij koopt
// ook wat je over hebt, met een buidel die niet bodemloos is, en hoe meer je van hetzelfde
// verkoopt, hoe minder hij ervoor geeft.
//
// En hij is heler (Marcel koos het op 24 sep): hij koopt ook stil, zonder vragen, voor minder. Wat
// stil gaat, staat niet in de boeken, en munten zijn kleiner dan graan, dus makkelijker te
// verstoppen. Maar hij kletst. Dat laatste krijgt pas betekenis bij punt 6, de inner met zijn
// argwaan; hier wordt alvast bijgehouden wat er open en wat er stil ging (S.handel.boek).
//
// Regels zonder scherm (test/handel.test.cjs): wanneer hij komt en gaat (T.tikHandelDag, één keer
// per dag vanuit T.tikGebouwenDag), wat hij vraagt en biedt, kopen en verkopen. Het poppetje dat
// het gehucht in en uit loopt (T.werkMarskramerBij, elk beeld vanuit js/main.js) en het
// handelspaneel (js/hud.js, T.ui.openHandel) hangen er zacht aan.
(function (T) {
  'use strict';

  // Getallen om bij te stellen, in één blok (CLAUDE.md). Een eerste gok: nog niet gespeeld.
  T.HANDEL_INSTELLINGEN = {
    eersteBezoek: 6, // zijn eerste bezoek, in de eerste lente, zodat je hem leert kennen
    tussenpoos: 24, // dagen tussen twee bezoeken ...
    spreiding: 5, // ... plus of min zoveel, vast per bezoek: hetzelfde spel, dezelfde kramer
    blijft: 4, // zoveel dagen staat hij in het gehucht
    buidel: 40, // zoveel goud heeft hij bij zich om in te kopen
    stilFactor: 0.6, // stil verkocht: hij betaalt zoveel van zijn gewone prijs
    daling: 0.1, // per `bulk` stuks die je hem van één goed verkoopt, zakt zijn prijs zoveel ...
    bodem: 0.35, // ... tot hoogstens hier (van de gewone prijs), en dat voor de rest van zijn bezoek
  };

  // Wat hij verkoopt: prijs per stuk in goud, en hoeveel hij per bezoek bij zich heeft.
  T.MARSKRAMER_WAREN = {
    ijzer: { prijs: 4, stuks: 6, uitleg: 'Voor de smidse: zonder ijzer valt die stil.' },
    zout: { prijs: 2, stuks: 10, uitleg: 'Om vis en vlees de winter door te helpen.' },
    steen: { prijs: 1, stuks: 30, uitleg: 'Voor wat van steen gebouwd wordt.' },
  };

  // Wat hij koopt: wat hij gewoonlijk geeft (goud per stuk), en `bulk`: hoeveel stuks hij ervan
  // wil voordat zijn prijs merkbaar zakt (van graan neemt hij een zak, van wol een baal).
  T.MARSKRAMER_KOOPT = {
    graan: { prijs: 0.25, bulk: 10 },
    wol: { prijs: 1.5, bulk: 2 },
    eieren: { prijs: 0.3, bulk: 5 },
    hout: { prijs: 0.3, bulk: 10 },
    groente: { prijs: 0.3, bulk: 5 },
    vis: { prijs: 0.4, bulk: 5 },
    vlees: { prijs: 0.6, bulk: 5 },
    huiden: { prijs: 1, bulk: 2 },
    riet: { prijs: 0.2, bulk: 10 },
    klei: { prijs: 0.2, bulk: 10 },
  };

  const bericht = (tekst, soort) => {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  };
  const vandaag = (S) => (S.kalender ? Math.floor(S.kalender.dag) : 0);
  const winter = (dag) => !!(T.datumVanDag && T.datumVanDag(dag).seizoen === 'winter');

  T.nieuweHandel = function () {
    return { volgendBezoek: T.HANDEL_INSTELLINGEN.eersteBezoek, bezoeken: 0, boek: [] };
  };

  // Wanneer hij na bezoek `n` terugkomt: de tussenpoos, en een vaste afwijking per bezoek.
  function volgendBezoek(dag, n) {
    const IN = T.HANDEL_INSTELLINGEN;
    const breed = 2 * IN.spreiding + 1;
    return dag + IN.tussenpoos + (((n * 7919) % breed) - IN.spreiding);
  }

  // Is hij er nu, om mee te handelen?
  T.marskramerIsEr = (S) => !!(S.marskramer && S.marskramer.aanwezig);

  // Eén dag: komt hij, of gaat hij? Alleen in een dorp met mensen (in het oude spel blijft
  // S.bevolking 0, en daar komt geen marskramer). In de winter wacht hij tot het dooit.
  T.tikHandelDag = function (S, dag) {
    if (!(S.bevolking > 0)) return;
    if (!S.handel) S.handel = T.nieuweHandel();
    const H = S.handel;
    const IN = T.HANDEL_INSTELLINGEN;
    const m = S.marskramer;
    if (m && m.aanwezig && dag >= m.vertrekOp) {
      m.aanwezig = false;
      H.volgendBezoek = volgendBezoek(dag, H.bezoeken);
      if (T.ui && T.ui.sluitHandel) T.ui.sluitHandel();
      bericht('De marskramer trekt verder. Over een week of drie komt hij terug.', 'rust');
      return;
    }
    if (T.marskramerIsEr(S) || dag < H.volgendBezoek || winter(dag)) return;
    H.bezoeken++;
    const waren = {};
    for (const [goed, w] of Object.entries(T.MARSKRAMER_WAREN)) waren[goed] = w.stuks;
    S.marskramer = {
      aanwezig: true, bezoek: H.bezoeken, komtOp: dag, vertrekOp: dag + IN.blijft,
      buidel: IN.buidel, waren, gekocht: {},
      pop: m && m.pop && !m.aanwezig ? m.pop : null, // loopt de vorige nog weg, dan keert hij om
    };
    bericht('De marskramer is in het gehucht. Hij staat een paar dagen bij de brink.', 'goed');
  };

  // Wat hij geeft voor `aantal` stuks van `goed`, nu, met wat hij er dit bezoek al van kocht. Elke
  // `bulk` stuks zakt zijn prijs met `daling`, tot de bodem; stil is het `stilFactor` daarvan.
  T.marskramerBod = function (S, goed, aantal, stil) {
    const k = T.MARSKRAMER_KOOPT[goed];
    if (!k || !(aantal > 0)) return 0;
    const IN = T.HANDEL_INSTELLINGEN;
    const al = (S.marskramer && S.marskramer.gekocht[goed]) || 0;
    let som = 0;
    for (let i = 0; i < aantal; i++) som += k.prijs * Math.max(IN.bodem, 1 - (IN.daling * (al + i)) / k.bulk);
    return som * (stil ? IN.stilFactor : 1);
  };

  function boek(S, regel) {
    if (!S.handel) S.handel = T.nieuweHandel();
    S.handel.boek.push({ dag: vandaag(S), ...regel });
  }

  // Jij verkoopt hem `aantal` stuks (of minder: wat je hebt, en wat zijn buidel toelaat). `stil`:
  // zonder vragen, voor minder, en niet in de boeken. Geeft { gelukt, reden } of { gelukt, aantal,
  // goud } terug, zoals T.plaatsGebouw.
  T.verkoopAanMarskramer = function (S, goed, aantal, stil) {
    const m = S.marskramer;
    if (!T.marskramerIsEr(S)) return { gelukt: false, reden: 'De marskramer is er niet.' };
    if (!T.MARSKRAMER_KOOPT[goed]) return { gelukt: false, reden: `Voor ${goed} heeft hij geen belangstelling.` };
    let n = Math.min(Math.floor(aantal), Math.floor(S.voorraad[goed] || 0));
    if (n <= 0) return { gelukt: false, reden: `Je hebt geen ${goed} om te verkopen.` };
    while (n > 0 && T.marskramerBod(S, goed, n, stil) > m.buidel + 1e-9) n--;
    if (n <= 0) return { gelukt: false, reden: 'Zijn buidel is leeg.' };
    const goud = T.marskramerBod(S, goed, n, stil);
    T.wijzigVoorraad(S, goed, -n);
    T.wijzigVoorraad(S, 'goud', goud);
    m.buidel -= goud;
    m.gekocht[goed] = (m.gekocht[goed] || 0) + n;
    boek(S, { goed, aantal: -n, goud, stil: !!stil });
    return { gelukt: true, aantal: n, goud };
  };

  // Jij koopt van hem: zoveel als hij heeft en jij kunt betalen.
  T.koopVanMarskramer = function (S, goed, aantal) {
    const m = S.marskramer;
    if (!T.marskramerIsEr(S)) return { gelukt: false, reden: 'De marskramer is er niet.' };
    const w = T.MARSKRAMER_WAREN[goed];
    if (!w) return { gelukt: false, reden: `${T.hoofdletter(goed)} heeft hij niet.` };
    let n = Math.min(Math.floor(aantal), m.waren[goed] || 0);
    if (n <= 0) return { gelukt: false, reden: `Zijn ${goed} is op.` };
    n = Math.min(n, Math.floor((S.voorraad.goud || 0) / w.prijs + 1e-9));
    if (n <= 0) return { gelukt: false, reden: 'Daar heb je het goud niet voor.' };
    const goud = n * w.prijs;
    T.wijzigVoorraad(S, 'goud', -goud);
    T.wijzigVoorraad(S, goed, n);
    m.waren[goed] -= n;
    m.buidel += goud;
    boek(S, { goed, aantal: n, goud: -goud, stil: false });
    return { gelukt: true, aantal: n, goud };
  };

  // Wat er in de boeken staat, en wat er stil ging: de optelling van S.handel.boek. Voor het
  // rekenboek van punt 6; nu alleen voor het handelspaneel en de toetsen.
  T.handelTotaal = function (S) {
    const t = { open: 0, stil: 0 };
    for (const r of (S.handel && S.handel.boek) || []) if (r.goud > 0) t[r.stil ? 'stil' : 'open'] += r.goud;
    return t;
  };

  // ---------------------------------------------------------------------------------------------
  // Het poppetje: het gehucht in, bij de brink staan, en weer weg
  // ---------------------------------------------------------------------------------------------

  // Waar hij het gehucht in komt: de weg de wereld in (de eerste overgang op de kaart), en anders
  // de rand van de kaart. Waar hij gaat staan: bij de put op de brink, en anders in het midden.
  function ingang(w) {
    const o = (w.overgangen || [])[0];
    return o ? { x: o.x, y: o.y } : { x: w.b - 1, y: Math.floor(w.h / 2) };
  }
  function standplaats(w) {
    const put = (w.voorwerpen || []).find((v) => v.soort === 'put');
    return put ? { x: put.x + 2, y: put.y + 2 } : { x: Math.floor(w.b / 2), y: Math.floor(w.h / 2) };
  }
  // De dichtstbijzijnde tegel bij `p` waar hij kan staan.
  function vrijeTegelBij(w, p) {
    for (let r = 0; r < 8; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (T.isBegaanbaar(w, p.x + dx, p.y + dy, { wezensBlokkeren: true })) return { x: p.x + dx, y: p.y + dy };
        }
      }
    }
    return null;
  }
  // Waar hij binnenkomt en waar hij gaat staan, als vrije tegels (ook voor de toetsen: kan hij er
  // op de echte kaart wel komen?).
  T.marskramerPlekken = (w) => ({ ingang: vrijeTegelBij(w, ingang(w)), standplaats: vrijeTegelBij(w, standplaats(w)) });

  // Een pad zoeken kost wat; kan hij er niet komen (iemand staat in de weg), dan pas over een
  // seconde opnieuw proberen, niet elk beeld.
  function stuurNaar(S, w, e, doel) {
    if (e.volgendePoging && S.tijd < e.volgendePoging) return;
    e.volgendePoging = S.tijd + 1;
    const pad = T.zoekPad(
      { x: e.tx, y: e.ty },
      doel,
      (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e }),
      (x, y) => T.isVast(w, x, y),
      {},
    );
    e.pad = pad || [];
  }

  // Elk beeld (js/main.js): het poppetje volgt S.marskramer. Komt hij, dan verschijnt hij op de weg
  // en loopt naar de brink; daar scharrelt hij wat rond; gaat hij, dan loopt hij terug en verdwijnt.
  // Loopt de speler weg terwijl het handelspaneel open is, dan gaat het dicht.
  T.werkMarskramerBij = function (S) {
    const m = S.marskramer;
    const w = S.wereld;
    if (!m || !w || !w.wezens) return;
    // Hij komt in de wereld waar hij aankwam (het gehucht). Loopt de schout een ander gebied in,
    // dan staat de marskramer daar niet op dezelfde plek.
    if (!m.wereld) m.wereld = w;
    if (m.wereld !== w) return;
    if (m.pop && !w.wezens.includes(m.pop)) m.pop = null;
    if (m.aanwezig && !m.pop) {
      const start = vrijeTegelBij(w, ingang(w));
      if (!start) return;
      const e = T.maakMens ? T.maakMens('marskramer', start.x, start.y, 0) : T.maakDorpeling(3, start.x, start.y, 0);
      e.handelaar = true;
      e.dwaalt = false;
      e.doel = vrijeTegelBij(w, standplaats(w));
      w.wezens.push(e);
      m.pop = e;
    }
    const e = m.pop;
    if (!e) return;
    if (m.aanwezig) {
      // Nog onderweg naar de brink (of van zijn pad geduwd): opnieuw sturen als hij stilstaat.
      if (!e.dwaalt && !e.pad.length && e.doel) {
        if (T.afstand({ x: e.tx, y: e.ty }, e.doel) <= 1) {
          e.dwaalt = true;
          e.thuis = { x: e.tx, y: e.ty };
          e.straal = 1;
        } else stuurNaar(S, w, e, e.doel);
      }
    } else {
      // Hij gaat: terug naar de weg, en daar verdwijnt hij.
      const uit = vrijeTegelBij(w, ingang(w)) || ingang(w);
      e.dwaalt = false;
      if (T.afstand({ x: e.tx, y: e.ty }, uit) <= 1 && !e.pad.length) {
        const i = w.wezens.indexOf(e);
        if (i >= 0) w.wezens.splice(i, 1);
        m.pop = null;
        S.marskramer = null;
        return;
      }
      if (!e.pad.length) stuurNaar(S, w, e, uit);
    }
    if (T.ui && T.ui.handelOpen && T.ui.handelOpen() && S.held && T.afstand({ x: S.held.tx, y: S.held.ty }, { x: e.tx, y: e.ty }) > 3) {
      T.ui.sluitHandel();
    }
  };
})(globalThis.Toren = globalThis.Toren || {});
