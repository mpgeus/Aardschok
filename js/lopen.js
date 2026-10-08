// Lopen tussen anderen (werklijst vraag 119, D; Marcel, 4 okt: "Je kunt nu eenmaal niet over iemand heen").
//
// Een weg zoeken gaat alleen over wat vaststaat: muren, huizen, bomen, water (T.zoekRoute). Wie er staat, telt daarbij
// niet. Tot 4 okt wel (iedereen als muur): daardoor was elke zoektocht uniek en niets te onthouden, mislukte er een als
// er iemand in een deur stond (vandaar de rem, vraag 88), en kon er geen weg voor velen tegelijk komen (vraag 119, A).
// Nu hangt een weg alleen van de kaart af, en onthoudt de kaart hem tot hij verandert: van huis naar werk is elke dag
// dezelfde weg.
//
// Wie onderweg een ander op zijn volgende tegel treft, lost het daar op, zoals mensen dat doen (T.ontwijk):
// - komen ze recht op elkaar af, dan schuiven ze langs elkaar (ze ruilen van tegel);
// - loopt de ander door, dan wacht hij even;
// - staat de ander maar wat (hij dwaalt), dan gaat die een stap opzij;
// - is de ander bezig (hij maait, hij praat met de schout of in een praatje, het is een koe), dan loopt hij er even
//   omheen, en staat er in een smalle doorgang een praatje, dan gaat er een even opzij;
// - en lukt dat niet, dan wacht hij, tot zijn geduld op is: dan geeft hij het op, en zoekt het later opnieuw.
// Zijn ze allebei vrij en kennen ze elkaar, dan blijven ze soms staan voor een praatje (js/praatje.js).
// Een gevecht doet hier niet aan mee: daar telt elke tegel, en plant iedereen om de anderen heen (js/gevecht.js). Een
// monster gaat voor niemand opzij.
(function (T) {
  'use strict';

  // Wie geen weg vindt naar waar hij hoort (zijn deur, zijn werk, de put), probeerde het tot 2 okt elke paar seconden
  // opnieuw, en liet A* zo telkens de hele kaart afzoeken: bij de bouwer van de speeltest, met een dichtgebouwde deur,
  // 4.000 keer per tien dagen (werklijst vraag 88). Marcel (2 okt): "kun je toch na 2x falen om route te vinden
  // overslaan?". Dus: na zoveel keer na elkaar geen weg wacht hij zo lang (een uur, als deel van een dag) voor hij het
  // opnieuw probeert. Niet voor altijd: een weg die nu dicht is, kan morgen open zijn.
  // De tijden om te wachten zijn seconden van de wereld (js/tijd.js): een stap duurt er zo'n driekwart, een dag 300.
  T.LOPEN_INSTELLINGEN = {
    geenWegKeer: 2,
    geenWegWacht: 1 / 24,
    // Zo vaak per beeld (per kaart) zoekt iemand een weg naar waar hij hoort. 's Ochtends en 's avonds gaan veel mensen
    // tegelijk op weg, en in een dorp van 200 waren dat 15 tot 28 zoektochten in één beeld (30 à 40 ms; npm run grootte,
    // 3 okt). Wie na deze grens komt, vertrekt een beeld later: op 30× een halve seconde van de wereld.
    zoekPerBeeld: 8,
    // Zo lang wacht hij op wie voor hem loopt, voor hij er omheen gaat.
    wachtOpLoper: 1.5,
    // Zo lang wacht hij hooguit op een plek die bezet blijft (zo'n veertig minuten van de dag); dan geeft hij het op.
    geduld: 8,
    // Een omweg om iemand heen is kort: A* bekijkt hooguit zoveel tegels, en de omweg is hooguit zoveel stappen langer.
    omwegTegels: 80,
    omwegLanger: 4,
    // Lukt een omweg niet, dan zoekt hij pas zo lang daarna weer een.
    omwegOpnieuw: 1,
    // Zoveel wegen onthoudt een kaart; daarboven begint hij opnieuw.
    wegenOnthouden: 4000,
    // Zoveel velden (een plek waar velen heen gaan) onthoudt een kaart; daarboven vergeet hij het veld dat het langst
    // niet gevraagd is. Een veld is twee bytes per tegel: op een kaart van 160 bij 160 is dat 50 kB.
    veldenOnthouden: 64,
  };
  const IN = () => T.LOPEN_INSTELLINGEN;

  // ── De weg: alleen over wat vaststaat ──

  // Per kaart de wegen die al gezocht zijn, tot de kaart verandert (T.kaartVersie, js/wereld.js). Geen spelstaat: na het
  // laden zoekt hij ze opnieuw, en vindt dezelfde. Een weg staat er als rij getallen (x, y, x, y, ...), niet als lijst
  // tegels: dat scheelt bij een paar duizend wegen veel geheugen.
  const WEGEN = new WeakMap(); // kaart → { versie, wegen: Map(sleutel → Int16Array of null) }

  // De weg van `van` naar `doel` over wat vaststaat, zonder de starttegel, of null als er geen is. opties: `tot` en
  // `naast` zoals T.zoekPad (js/pad.js), `deurenOpenen` (de schout duwt een dichte deur open), en `veld`: het doel is een
  // plek waar velen heen gaan (hieronder, "Naar hetzelfde doel").
  T.zoekRoute = function (w, van, doel, opties) {
    const o = opties || {};
    const tot = o.tot >= 1 ? Math.floor(o.tot) : 0;
    const naast = !!o.naast;
    const open = !!o.deurenOpenen;
    // Een kaart met deuren (de proefkamers) onthoudt niets: een deur gaat open en dicht zonder dat de kaart verandert.
    const onthoudt = !(w.deuren && w.deuren.size);
    if (o.veld && !naast && onthoudt) {
      if (T.afstand(van, doel) <= tot) return [];
      return T.kanErKomen(w, van, doel, { tot }) ? wegUitVeld(w, veldVan(w, doel, tot, open), van) : null;
    }
    let wegen = null;
    if (onthoudt) {
      const versie = T.kaartVersie(w);
      let m = WEGEN.get(w);
      if (!m || m.versie !== versie || m.wegen.size >= IN().wegenOnthouden) {
        m = { versie, wegen: new Map() };
        WEGEN.set(w, m);
      }
      wegen = m.wegen;
    }
    const sleutel = `${van.x},${van.y}>${doel.x},${doel.y}|${tot}|${naast ? 1 : 0}|${open ? 1 : 0}`;
    if (wegen && wegen.has(sleutel)) return alsPad(wegen.get(sleutel));
    const pad = T.kanErKomen(w, van, doel, { tot, naast })
      ? T.zoekPad(van, doel, (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: open }), (x, y) => T.isVast(w, x, y), { tot, naast })
      : null;
    if (wegen) wegen.set(sleutel, alsRij(pad));
    return pad;
  };
  function alsRij(pad) {
    if (!pad) return null;
    const rij = new Int16Array(pad.length * 2);
    pad.forEach((t, i) => {
      rij[2 * i] = t.x;
      rij[2 * i + 1] = t.y;
    });
    return rij;
  }
  function alsPad(rij) {
    if (!rij) return null;
    const pad = new Array(rij.length / 2);
    for (let i = 0; i < pad.length; i++) pad[i] = { x: rij[2 * i], y: rij[2 * i + 1] };
    return pad;
  }

  // ── Naar hetzelfde doel: een veld (vraag 119, A) ──
  //
  // Waar velen heen gaan (de put, de herberg, het plein, hun werk, hun deur), en dat elke dag van een andere tegel, daar
  // zoekt niet ieder zijn eigen weg. De kaart rekent vanaf het doel naar buiten uit hoeveel stappen elke tegel ervan af
  // ligt (een veld, ring voor ring), en wie erheen wil, loopt van zijn tegel steeds naar een buur die een stap dichterbij
  // ligt; van wie even dichtbij liggen, de buur die het meest in de richting van het doel ligt. Het veld groeit maar zo
  // ver als nodig: tot de verste die er tot nu toe heen wilde. Het blijft tot de kaart verandert, en wie het langst niet
  // gevraagd is, gaat eruit (veldenOnthouden). Geen spelstaat: een veld is alleen uit de kaart, dus een veld dat opnieuw
  // gerekend wordt, geeft dezelfde wegen.
  const ONBEKEND = 0xffff;
  const RICHTINGEN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]; // zoals js/pad.js
  const VELDEN = new WeakMap(); // kaart → { versie, b, h, velden: Map(sleutel → veld), in de volgorde van gebruik }

  function veldVan(w, doel, tot, open) {
    const versie = T.kaartVersie(w);
    let m = VELDEN.get(w);
    if (!m || m.versie !== versie || m.b !== w.b || m.h !== w.h) {
      m = { versie, b: w.b, h: w.h, velden: new Map() };
      VELDEN.set(w, m);
    }
    const sleutel = `${doel.x},${doel.y}|${tot}|${open ? 1 : 0}`;
    let v = m.velden.get(sleutel);
    if (v) m.velden.delete(sleutel); // achteraan: net gevraagd
    else {
      v = nieuwVeld(w, doel, tot, open);
      if (m.velden.size >= IN().veldenOnthouden) m.velden.delete(m.velden.keys().next().value);
    }
    m.velden.set(sleutel, v);
    return v;
  }

  // Een veld begint bij het doel: elke begaanbare tegel binnen `tot` ervan ligt er 0 stappen af.
  function nieuwVeld(w, doel, tot, open) {
    const afstand = new Uint16Array(w.b * w.h).fill(ONBEKEND);
    const rand = [];
    for (let y = doel.y - tot; y <= doel.y + tot; y++) {
      for (let x = doel.x - tot; x <= doel.x + tot; x++) {
        if (x < 0 || y < 0 || x >= w.b || y >= w.h || !T.isBegaanbaar(w, x, y, { deurenOpenen: open })) continue;
        afstand[y * w.b + x] = 0;
        rand.push(y * w.b + x);
      }
    }
    return { doel: { x: doel.x, y: doel.y }, open, afstand, rand, ring: 0, op: !rand.length };
  }

  // Mag je op tegel j (x, y) staan, en houdt hij een schuine stap om de hoek tegen? Uit het raster van wat vaststaat
  // (js/wereld.js), zonder voor elke buur T.isBegaanbaar te vragen: bij 400 mensen was dat de helft van het zoeken. Een
  // deur vraagt het nog aan de deur.
  const R = T.RASTER;
  const DX = RICHTINGEN.map((r) => r[0]);
  const DY = RICHTINGEN.map((r) => r[1]);
  function vrijOp(w, raster, j, x, y, open) {
    const g = raster[j];
    return g === R.VRIJ || (g === R.DEUR && T.isBegaanbaar(w, x, y, { deurenOpenen: open }));
  }
  function vastOp(w, raster, j, x, y) {
    const g = raster[j];
    return g === R.VAST || (g === R.DEUR && T.isVast(w, x, y));
  }

  // Eén ring verder: de tegels die een stap verder liggen dan de vorige ring. Een schuine stap om een hoek telt niet,
  // zoals bij A*.
  function groei(w, v) {
    const b = w.b;
    const h = w.h;
    const raster = T.vastRaster(w);
    const d = v.ring + 1;
    const volgende = [];
    for (const i of v.rand) {
      const x = i % b;
      const y = (i - x) / b;
      for (let r = 0; r < 8; r++) {
        const dx = DX[r];
        const dy = DY[r];
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= b || ny >= h) continue;
        const j = ny * b + nx;
        if (v.afstand[j] !== ONBEKEND || !vrijOp(w, raster, j, nx, ny, v.open)) continue;
        if (dx && dy && (vastOp(w, raster, y * b + nx, nx, y) || vastOp(w, raster, ny * b + x, x, ny))) continue;
        v.afstand[j] = d;
        volgende.push(j);
      }
    }
    v.ring = d;
    v.rand = volgende;
    if (!volgende.length) v.op = true;
  }

  // De buren van (x, y) waar je heen kunt stappen en die het veld al kent, met hun afstand.
  function burenInVeld(w, v, x, y) {
    const b = w.b;
    const raster = T.vastRaster(w);
    const uit = [];
    for (let r = 0; r < 8; r++) {
      const dx = DX[r];
      const dy = DY[r];
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= b || ny >= w.h) continue;
      const a = v.afstand[ny * b + nx];
      if (a === ONBEKEND) continue;
      if (dx && dy && (vastOp(w, raster, y * b + nx, nx, y) || vastOp(w, raster, ny * b + x, x, ny))) continue;
      uit.push({ x: nx, y: ny, a, r });
    }
    return uit;
  }
  // Van de buren die even ver liggen: die het meest in de richting van het doel ligt, dan de vaste volgorde.
  function beste(v, buren) {
    let b = null;
    for (const t of buren) {
      if (!b || t.a < b.a) {
        b = t;
        continue;
      }
      if (t.a > b.a) continue;
      const dt = (t.x - v.doel.x) ** 2 + (t.y - v.doel.y) ** 2;
      const db = (b.x - v.doel.x) ** 2 + (b.y - v.doel.y) ** 2;
      if (dt < db || (dt === db && t.r < b.r)) b = t;
    }
    return b;
  }

  // De weg van `van` naar het doel van het veld: eerst groeit het veld tot het een buur van `van` kent, dan loopt hij
  // steeds een stap dichterbij. `van` zelf mag vast zijn (wie in zijn deur staat), zoals bij A*.
  function wegUitVeld(w, v, van) {
    let buren = burenInVeld(w, v, van.x, van.y);
    while (!buren.length && !v.op) {
      groei(w, v);
      buren = burenInVeld(w, v, van.x, van.y);
    }
    let t = beste(v, buren);
    if (!t) return null;
    const pad = [{ x: t.x, y: t.y }];
    while (t.a > 0) {
      t = beste(v, burenInVeld(w, v, t.x, t.y).filter((n) => n.a === t.a - 1));
      pad.push({ x: t.x, y: t.y });
    }
    return pad;
  }

  // Hoeveel wegen en velden deze kaart nu onthoudt (Spel.debug.lopen, en de meting in gereedschap/grootte/).
  T.onthoudenVan = function (w) {
    const v = VELDEN.get(w);
    const r = WEGEN.get(w);
    const versie = T.kaartVersie(w);
    return { wegen: r && r.versie === versie ? r.wegen.size : 0, velden: v && v.versie === versie ? v.velden.size : 0 };
  };

  // Geef e een weg en zijn doel: met het doel weet hij onderweg of hij er al is (`tot`, `naast`), en lost hij op wie er
  // in de weg staat (T.ontwijk hieronder). Wie een weg krijgt zonder doel (een stap van het dwalen, een gevecht), doet
  // dat niet: staat er iemand, dan stopt hij, zoals vroeger.
  T.geefRoute = function (e, pad, doel) {
    e.pad = pad;
    e.padDoel = { x: doel.x, y: doel.y, tot: doel.tot || 0, naast: !!doel.naast };
    e.gewacht = 0;
  };

  // ── Onderweg: wie er in de weg staat ──

  // Mag b een stap opzij gaan voor wie langs wil? Alleen wie maar wat staat: niet de schout (dat ben jij), niet wie
  // bezig is (maaien, op zijn land werken, een gesprek, de schout zoeken met een voorval), geen dier en geen monster, en
  // niet in een gevecht. Wie een praatje maakt (js/praatje.js), is ook bezig, maar gaat in een smalle doorgang toch even
  // opzij (`ookPraatje`, hieronder).
  T.magOpzij = (S, b, ookPraatje) =>
    !b.dood && !b.binnen && b !== S.schout && !b.dier && !b.beest && b.kant !== 'monster' && !b.maait && !b.werkt && b !== S.spreektMet &&
    !b.zoektSchout && !S.gevecht && !b.onderweg && !b.pad.length && (ookPraatje || !b.praatje);

  // Wat doet e, die zijn volgende tegel bezet vindt (js/anim.js)? 'wacht': hij blijft staan, en kijkt het volgende beeld
  // opnieuw. 'verder': hij stapt nu (ze schuiven langs elkaar), of zijn weg is anders (een omweg). 'klaar': hij is er
  // (dichtbij genoeg), of hij geeft het op. `dt`: hoe lang hij dit beeld stond (de tijd van de wereld).
  T.ontwijk = function (S, w, e, volgende, dt) {
    // Is de tegel zelf dicht (een deur, iets wat er sinds het zoeken kwam), of heeft hij geen doel (een stap van het
    // dwalen, een gevecht), dan stopt hij: wie hem stuurde, kiest opnieuw.
    if (!e.padDoel || (S.gevecht && w === S.wereld)) return 'klaar';
    if (!T.isBegaanbaar(w, volgende.x, volgende.y, { deurenOpenen: e === S.schout })) return 'klaar';
    const ander = T.wezenOp(w, volgende.x, volgende.y, e);
    if (!ander) return 'verder';
    // Zijn ze allebei vrij en kennen ze elkaar, dan blijven ze staan voor een praatje (js/praatje.js; vraag 120, d).
    if (T.praatjeOnderweg && T.praatjeOnderweg(S, w, e, ander)) return e.pad.length ? 'verder' : 'klaar';
    if (!e.gewacht) e.omwegBij = 0; // net een stap gezet: een omweg mag meteen weer
    e.gewacht = (e.gewacht || 0) + dt;
    const laatste = e.pad.length === 1;
    // Is hij er al dichtbij genoeg (zijn doel is een plek met een straal, of naast iemand), dan is hij er.
    if (laatste && erIs(w, e)) return 'klaar';
    // Ze komen op elkaar af (de ander wil terug, de kant op waar e vandaan komt), of na even wachten dwars: ze schuiven
    // langs elkaar.
    if (tegenOver(w, e, ander, volgende, e.gewacht >= IN().wachtOpLoper) && magRuilen(S, w, e, ander)) {
      ruil(S, w, e, ander, volgende);
      return 'verder';
    }
    // Het wild (js/beesten.js): staat er voor de leider van een groep een dier van zijn eigen groep in de weg, dan ruilen
    // ze van plaats, en een ander dier na even wachten ook. Anders wacht hij achter zijn eigen roedel, want een wolf gaat
    // voor niemand opzij. Wie volgt, ruilt niet met hem: dan duwden de anderen hem bij elk beeld een tegel opzij.
    if (e.leider && e.groep && ander.beest && !ander.onderweg && (ander.groep === e.groep || e.gewacht >= IN().wachtOpLoper) && T.isBegaanbaar(w, e.tx, e.ty)) {
      ruil(S, w, e, ander, volgende);
      return 'verder';
    }
    // De ander loopt door: even wachten.
    const loopt = ander.onderweg || ander.pad.length > 0;
    if (loopt && e.gewacht < IN().wachtOpLoper) return 'wacht';
    // De ander staat maar wat: hij gaat een stap opzij, en kan dat niet (hij staat in een drukte), dan ruilen ze van
    // plaats ("mag ik erlangs?").
    if (!loopt && T.magOpzij(S, ander)) {
      if (stapOpzij(w, ander, e)) return 'wacht';
      if (magRuilen(S, w, e, ander)) {
        ruil(S, w, e, ander, volgende);
        return 'verder';
      }
    }
    // Staat er op zijn laatste tegel iemand die blijft staan, dan stopt hij ernaast; anders loopt hij eromheen.
    if (laatste && !loopt && !(e.padDoel.tot || e.padDoel.naast)) return 'klaar';
    // Een omweg zoeken kost wat; lukt het niet, dan pas na een tel weer.
    if (e.gewacht >= (e.omwegBij || 0)) {
      if (omweg(S, w, e)) return 'verder';
      e.omwegBij = e.gewacht + IN().omwegOpnieuw;
      // Geen omweg om een praatje heen (een smalle doorgang): dan gaat er een even opzij, of ruilen ze van plaats. Na zijn
      // stap loopt hij terug naar zijn groepje (js/praatje.js).
      if (!loopt && ander.praatje && T.magOpzij(S, ander, true)) {
        if (stapOpzij(w, ander, e)) return 'wacht';
        if (magRuilen(S, w, e, ander)) {
          ruil(S, w, e, ander, volgende);
          return 'verder';
        }
      }
    }
    return e.gewacht < IN().geduld ? 'wacht' : 'klaar';
  };

  // Is e dichtbij genoeg bij zijn doel: binnen de straal (`tot`), of naast het doel (`naast`)?
  function erIs(w, e) {
    const d = e.padDoel;
    const hier = { x: e.tx, y: e.ty };
    if (d.naast) return T.raakt(w, hier, d);
    return d.tot > 0 && T.afstand(hier, d) <= d.tot;
  }

  // Lopen ze elkaar tegemoet? De ander staat (hij wacht), en zijn volgende stap gaat de andere kant op dan die van e: recht
  // terug naar e's tegel, of schuin terug, naast e. Met `dwars` ook als hij dwars wil (in een drukte, na even wachten).
  // Zo schuiven in een drukte waar mensen meer kanten op willen telkens twee langs elkaar; wie dezelfde kant op wil,
  // wacht op wie voor hem loopt. Na het ruilen moet de ander vanaf e's tegel zijn volgende stap kunnen zetten.
  function tegenOver(w, e, ander, volgende, dwars) {
    if (ander.onderweg || !ander.pad.length) return false;
    const n = ander.pad[0];
    const richting = (volgende.x - e.tx) * (n.x - volgende.x) + (volgende.y - e.ty) * (n.y - volgende.y);
    if (!(richting < 0 || (dwars && richting === 0))) return false;
    return (n.x === e.tx && n.y === e.ty) || T.raakt(w, { x: e.tx, y: e.ty }, n);
  }
  // Langs elkaar schuiven kan tussen twee die lopen, niet met een monster (een rover), en ook de ander moet op e's tegel
  // mogen staan.
  function magRuilen(S, w, e, ander) {
    if (ander.dood || ander.maait || (ander.werkt && !ander.pad.length) || ander.kant === 'monster' || e.kant === 'monster') return false;
    return T.isBegaanbaar(w, e.tx, e.ty, { deurenOpenen: ander === S.schout });
  }
  // Ze ruilen van tegel. Wilde de ander niet recht naar e's tegel maar ernaast, dan gaat hij eerst naar e's tegel en dan
  // verder: zijn volgende tegel ligt daar altijd naast (tegenOver). Stond hij maar wat, dan staat hij daarna op e's tegel.
  function ruil(S, w, e, ander, volgende) {
    const oud = { x: e.tx, y: e.ty };
    if (!ander.pad.length) ander.padDoel = null;
    if (!ander.pad.length || ander.pad[0].x !== oud.x || ander.pad[0].y !== oud.y) ander.pad.unshift(oud);
    e.onderweg = true;
    e.tx = volgende.x;
    e.ty = volgende.y;
    ander.onderweg = true;
    ander.tx = oud.x;
    ander.ty = oud.y;
    ander.gewacht = 0;
    if (w === S.wereld) T.bijStapBegin(S, ander, oud);
  }

  // b gaat een stap opzij voor e: naar een vrije tegel naast hem, niet op e's weg, liefst zo ver mogelijk ervan, niet
  // voor een deur en liever recht opzij dan schuin.
  const BUREN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function stapOpzij(w, b, e) {
    const weg = [{ x: e.tx, y: e.ty }, ...e.pad.slice(0, 4)];
    let beste = null;
    let score = -Infinity;
    for (const [dx, dy] of BUREN) {
      const x = b.tx + dx;
      const y = b.ty + dy;
      if (weg.some((t) => t.x === x && t.y === y)) continue;
      if (!T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: b })) continue;
      if (dx && dy && (T.isVast(w, b.tx + dx, b.ty) || T.isVast(w, b.tx, b.ty + dy))) continue;
      let s = Math.min(...weg.map((t) => T.afstand(t, { x, y })));
      if (T.bijDeur(w, x, y)) s -= 10;
      if (dx && dy) s -= 0.5;
      if (s > score) {
        score = s;
        beste = { x, y };
      }
    }
    if (!beste) return false;
    b.pad = [beste];
    b.padDoel = null;
    return true;
  }

  // Een korte omweg om wie er staat: terug op zijn eigen weg een paar tegels verder, op de eerste die vrij is; of, is
  // zijn doel een plek met een straal of naast iemand, naar een andere vrije tegel daar. Met de anderen als muur, zoals
  // vroeger, maar alleen hier, kort (omwegTegels).
  function omweg(S, w, e) {
    const vrij = (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: e === S.schout, wezensBlokkeren: true, wie: e });
    const vast = (x, y) => T.isVast(w, x, y);
    const van = { x: e.tx, y: e.ty };
    const max = IN().omwegTegels;
    for (let i = 1; i < Math.min(e.pad.length, 5); i++) {
      const t = e.pad[i];
      if (!vrij(t.x, t.y)) continue;
      const stuk = T.zoekPad(van, t, vrij, vast, { max });
      if (stuk && stuk.length && stuk.length <= i + 1 + IN().omwegLanger) {
        e.pad = stuk.concat(e.pad.slice(i + 1));
        return true;
      }
      break;
    }
    const d = e.padDoel;
    if ((d.tot || d.naast) && e.pad.length <= 5) {
      const stuk = T.zoekPad(van, d, vrij, vast, { tot: d.tot, naast: d.naast, max });
      if (stuk && stuk.length) {
        e.pad = stuk;
        return true;
      }
    }
    return false;
  }
})(globalThis.Spel = globalThis.Spel || {});
