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
// - is de ander bezig (hij maait, hij praat met de aanvoerder of in een praatje, het is een koe), dan loopt hij er even
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
    // Op het eiland beslaat een veld het vak om het dorp (T.kaartVak) en zoveel tegels eromheen, niet al het land dat je
    // kent: dat groeit met elk stuk dat open gaat (B2b, stap 5). Wie van of naar daarbuiten loopt, zoekt zijn eigen weg.
    veldRand: 32,
    // Door land dat nog dicht is (hieronder): zoveel grove velden (een doel ver weg) onthoudt een kaart, vier bytes per vak
    // van de schets (zo'n 400 kB elk), en zoveel vakken van de grove weg kijkt wie erheen loopt vooruit.
    grofOnthouden: 8,
    grofVooruit: 24,
  };
  const IN = () => T.LOPEN_INSTELLINGEN;

  // ── De weg: alleen over wat vaststaat ──

  // Per kaart de wegen die al gezocht zijn, tot de kaart verandert (T.kaartVersie, js/wereld.js). Geen spelstaat: na het
  // laden zoekt hij ze opnieuw, en vindt dezelfde. Een weg staat er als rij getallen (x, y, x, y, ...), niet als lijst
  // tegels: dat scheelt bij een paar duizend wegen veel geheugen.
  const WEGEN = new WeakMap(); // kaart → { versie, wegen: Map(sleutel → Int16Array of null) }

  // De weg van `van` naar `doel` over wat vaststaat, zonder de starttegel, of null als er geen is. opties: `tot` en
  // `naast` zoals T.zoekPad (js/pad.js), `veld`: het doel is een
  // plek waar velen heen gaan (hieronder, "Naar hetzelfde doel"), en `kar`: de ossenkar, die een weg opzoekt omdat hij er
  // sneller rijdt (T.karKostOp, js/wegen.js; werklijst C, stap 5).
  T.zoekRoute = function (w, van, doel, opties) {
    const o = opties || {};
    const tot = o.tot >= 1 ? Math.floor(o.tot) : 0;
    const naast = !!o.naast;
    // Een man op tocht (`tocht`, js/kiezen.js): ligt zijn doel in land dat nog dicht is, of komt hij er over open land niet,
    // dan de weg van een tocht (hieronder). Een ander komt daar niet.
    if (o.tocht && T.opEiland(w) && (T.tegel(w, doel.x, doel.y) === 'buiten' || !T.kanErKomen(w, van, doel, { tot, naast }))) return tochtRoute(w, van, doel, o);
    const kar = !!o.kar;
    const vv = o.veld && veldVak(w);
    if (o.veld && !kar && !naast && T.inVak(vv, van.x, van.y) && T.inVak(vv, doel.x, doel.y)) {
      if (T.afstand(van, doel) <= tot) return [];
      if (!T.kanErKomen(w, van, doel, { tot })) return null;
      // Loopt de enige weg buiten het vak van het veld om (een meer dat het dorp afsnijdt), dan zoekt hij hem zelf.
      const weg = wegUitVeld(w, veldVan(w, doel, tot), van);
      if (weg || T.openGrootte(w) === 0) return weg;
    }
    const versie = T.kaartVersie(w);
    let m = WEGEN.get(w);
    if (!m || m.versie !== versie || m.wegen.size >= IN().wegenOnthouden) {
      m = { versie, open: T.openGrootte(w), wegen: new Map() };
      WEGEN.set(w, m);
    } else if (m.open !== T.openGrootte(w)) {
      // Er ging land open (js/wereld.js): een weg die er was, blijft goed; wie geen weg had, zoekt opnieuw.
      for (const [k, rij] of m.wegen) if (!rij) m.wegen.delete(k);
      m.open = T.openGrootte(w);
    }
    const wegen = m.wegen;
    const sleutel = `${van.x},${van.y}>${doel.x},${doel.y}|${tot}|${naast ? 1 : 0}${kar ? '|kar' : ''}`;
    if (wegen.has(sleutel)) return alsPad(wegen.get(sleutel));
    const pad = T.kanErKomen(w, van, doel, { tot, naast })
      ? T.zoekPad(van, doel, (x, y) => T.isBegaanbaar(w, x, y), (x, y) => T.isVast(w, x, y), {
        tot, naast, wereld: w, ...(kar ? { kost: (x, y) => T.karKostOp(w, x, y), minKost: T.karKostMin() } : {}),
      })
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
  const VELDEN = new WeakMap(); // kaart → { versie, vak, velden: Map(sleutel → veld), in de volgorde van gebruik }

  // Het vak van de velden: op een kaart uit Tiled de hele kaart, op het eiland het dorp met veldRand eromheen, binnen wat
  // open is (T.loopVak). Eén ding per kaart zolang het niet verandert, zoals T.loopVak.
  const VELDVAK = new WeakMap();
  function veldVak(w) {
    const lv = T.loopVak(w);
    const al = VELDVAK.get(w);
    if (al && al.lv === lv) return al.vak;
    const k = T.kaartVak(w);
    const R = T.openGrootte(w) ? IN().veldRand : 0;
    const x0 = Math.max(lv.x, k.x - R);
    const y0 = Math.max(lv.y, k.y - R);
    const x1 = Math.min(lv.x + lv.b, k.x + k.b + R);
    const y1 = Math.min(lv.y + lv.h, k.y + k.h + R);
    const vak = al && al.vak.x === x0 && al.vak.y === y0 && al.vak.b === x1 - x0 && al.vak.h === y1 - y0 ? al.vak : { x: x0, y: y0, b: x1 - x0, h: y1 - y0 };
    VELDVAK.set(w, { lv, vak });
    return vak;
  }

  function veldVan(w, doel, tot) {
    const versie = T.kaartVersie(w);
    const vak = veldVak(w);
    let m = VELDEN.get(w);
    if (!m || m.versie !== versie || m.vak.x !== vak.x || m.vak.y !== vak.y || m.vak.b !== vak.b || m.vak.h !== vak.h) {
      m = { versie, vak, velden: new Map() };
      VELDEN.set(w, m);
    }
    const sleutel = `${doel.x},${doel.y}|${tot}`;
    let v = m.velden.get(sleutel);
    if (v) m.velden.delete(sleutel); // achteraan: net gevraagd
    else {
      v = nieuwVeld(w, m.vak, doel, tot);
      if (m.velden.size >= IN().veldenOnthouden) m.velden.delete(m.velden.keys().next().value);
    }
    m.velden.set(sleutel, v);
    return v;
  }

  // Een veld begint bij het doel: elke begaanbare tegel binnen `tot` ervan ligt er 0 stappen af. Het veld beslaat zijn
  // vak (veldVak): tegel (x, y) staat op plek (y - vak.y) * vak.b + (x - vak.x). Het raster van wat vaststaat beslaat
  // T.loopVak (js/wereld.js), daar staat dezelfde tegel op (y - lv.y) * lv.b + (x - lv.x).
  function nieuwVeld(w, vak, doel, tot) {
    const afstand = new Uint16Array(vak.b * vak.h).fill(ONBEKEND);
    const rand = [];
    for (let y = doel.y - tot; y <= doel.y + tot; y++) {
      for (let x = doel.x - tot; x <= doel.x + tot; x++) {
        if (!T.inVak(vak, x, y) || !T.isBegaanbaar(w, x, y)) continue;
        afstand[(y - vak.y) * vak.b + (x - vak.x)] = 0;
        rand.push((y - vak.y) * vak.b + (x - vak.x));
      }
    }
    return { doel: { x: doel.x, y: doel.y }, vak, afstand, rand, ring: 0, op: !rand.length };
  }

  // Mag je op tegel j (x, y) staan, en houdt hij een schuine stap om de hoek tegen? Uit het raster van wat vaststaat
  // (js/wereld.js), zonder voor elke buur T.isBegaanbaar te vragen: bij 400 mensen was dat de helft van het zoeken.
  const R = T.RASTER;
  const DX = RICHTINGEN.map((r) => r[0]);
  const DY = RICHTINGEN.map((r) => r[1]);

  // Eén ring verder: de tegels die een stap verder liggen dan de vorige ring. Een schuine stap om een hoek telt niet,
  // zoals bij A*.
  // Binnen het veld rekent het met de plek in het vak (x, y vanaf de hoek van het vak); de kaart krijgt de tegel zelf.
  function groei(w, v) {
    const { b, h, x: x0, y: y0 } = v.vak;
    const raster = T.vastRaster(w);
    const lv = T.loopVak(w);
    const rj = (x, y) => (y + y0 - lv.y) * lv.b + (x + x0 - lv.x); // de plek in het raster van (x, y) in het veld
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
        if (v.afstand[j] !== ONBEKEND || raster[rj(nx, ny)] !== R.VRIJ) continue;
        if (dx && dy && (raster[rj(nx, y)] === R.VAST || raster[rj(x, ny)] === R.VAST)) continue;
        if (w.hoogte && !T.kanStappen(w, x0 + x, y0 + y, x0 + nx, y0 + ny)) continue; // niet door een wand (js/hoogte.js)
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
    const { b, h, x: x0, y: y0 } = v.vak;
    const raster = T.vastRaster(w);
    const lv = T.loopVak(w);
    const uit = [];
    for (let r = 0; r < 8; r++) {
      const dx = DX[r];
      const dy = DY[r];
      const nx = x + dx;
      const ny = y + dy;
      if (nx < x0 || ny < y0 || nx >= x0 + b || ny >= y0 + h) continue;
      const a = v.afstand[(ny - y0) * b + (nx - x0)];
      if (a === ONBEKEND) continue;
      if (dx && dy && (raster[(y - lv.y) * lv.b + (nx - lv.x)] === R.VAST || raster[(ny - lv.y) * lv.b + (x - lv.x)] === R.VAST)) continue;
      if (w.hoogte && !T.kanStappen(w, x, y, nx, ny)) continue;
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

  // Mag b een stap opzij gaan voor wie langs wil? Alleen wie maar wat staat: niet de aanvoerder (hij gaat waar jij hem stuurt), niet wie
  // bezig is (maaien, op zijn land werken, een gesprek), geen dier, geen kar
  // (js/begin.js) en geen monster, en niet wie vecht (js/gevecht.js). Wie een praatje maakt (js/praatje.js), is ook bezig, maar gaat
  // in een smalle doorgang toch even opzij (`ookPraatje`, hieronder).
  T.magOpzij = (S, b, ookPraatje) =>
    !b.dood && !b.binnen && !T.isAanvoerder(S, b) && !b.dier && !b.beest && !b.kar && b.kant !== 'monster' && !b.maait && !b.werkt && b !== S.spreektMet &&
    !b.doelwit && !b.volgt && !b.onderweg && !b.pad.length && (ookPraatje || !b.praatje);

  // Wat doet e, die zijn volgende tegel bezet vindt (js/anim.js)? 'wacht': hij blijft staan, en kijkt het volgende beeld
  // opnieuw. 'verder': hij stapt nu (ze schuiven langs elkaar), of zijn weg is anders (een omweg). 'klaar': hij is er
  // (dichtbij genoeg), of hij geeft het op. `dt`: hoe lang hij dit beeld stond (de tijd van de wereld).
  T.ontwijk = function (S, w, e, volgende, dt) {
    // Is de tegel zelf dicht (iets wat er sinds het zoeken kwam), of heeft hij geen doel (een stap van het dwalen), dan
    // stopt hij: wie hem stuurde, kiest opnieuw.
    if (!e.padDoel) return 'klaar';
    if (!T.isBegaanbaar(w, volgende.x, volgende.y)) return 'klaar';
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
    // Een dier dat volgt (js/beesten.js, volg), met een dier van zijn eigen groep voor zich, zoekt er geen weg omheen: hij
    // staat bij zijn kudde. Loopt de ander, dan wacht hij even; anders, of daarna, is hij er, en kiest de groep de
    // volgende tik opnieuw. Niet in een gevecht (G.vecht, G.aanval): daar beweegt het gevecht hem. (18 okt: zo'n omweg was
    // er tussen de bomen bijna nooit, en zocht hij elke seconde opnieuw, de helft van de tik; `snelheid.md`, G1.)
    if (e.beest && e.groep && !e.leider && ander.groep === e.groep && !e.groep.vecht && !e.groep.aanval) {
      return loopt && e.gewacht < IN().wachtOpLoper ? 'wacht' : 'klaar';
    }
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
    return T.isBegaanbaar(w, e.tx, e.ty);
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
  }

  // b gaat een stap opzij voor e: naar een vrije tegel naast hem, niet op e's weg, liefst zo ver mogelijk ervan, en
  // liever recht opzij dan schuin.
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
      if (!T.kanStappen(w, b.tx, b.ty, x, y)) continue;
      let s = Math.min(...weg.map((t) => T.afstand(t, { x, y })));
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
    const vrij = (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e });
    const vast = (x, y) => T.isVast(w, x, y);
    const van = { x: e.tx, y: e.ty };
    const max = IN().omwegTegels;
    for (let i = 1; i < Math.min(e.pad.length, 5); i++) {
      const t = e.pad[i];
      if (!vrij(t.x, t.y)) continue;
      const stuk = T.zoekPad(van, t, vrij, vast, { max, wereld: w });
      if (stuk && stuk.length && stuk.length <= i + 1 + IN().omwegLanger) {
        e.pad = stuk.concat(e.pad.slice(i + 1));
        return true;
      }
      break;
    }
    const d = e.padDoel;
    if ((d.tot || d.naast) && e.pad.length <= 5) {
      const stuk = T.zoekPad(van, d, vrij, vast, { tot: d.tot, naast: d.naast, max, wereld: w });
      if (stuk && stuk.length) {
        e.pad = stuk;
        return true;
      }
    }
    return false;
  }

  // ── Door land dat nog dicht is (werklijst vraag 170, stap 6a2, c0; Marcel, 17 okt: "Stel je stuurt een soldaat maar de
  // andere kant van de wereld met een klik, dan moet dat kunnen") ──
  //
  // Land dat nog dicht is, bestaat nog niet: het is 'buiten', en A* laat nooit een stuk maken (js/wereld.js). Ligt het
  // doel van een man op tocht daar (of komt hij er over open land niet), dan zoekt hij eerst een grove weg, in de vakken
  // van de schets van het eiland (js/eiland.js, E.vak tegels), en loopt hij naar het verste vak van die weg dat al open is
  // en waar hij kan komen. Daar gaat het land verder open (T.werkStukkenBij), en zoekt hij opnieuw: zijn post vraagt het
  // (T.dagAnker), of zijn tocht (T.werkSturenBij, js/kiezen.js). Zo komt hij over het hele eiland, zonder dat er land
  // gemaakt wordt waar niemand komt. Kan hij er niet komen (water, dicht bos, een ander eiland), dan gaat hij naar het vak waar hij wel kan
  // komen dat er het dichtst bij ligt: zo dicht als het kan.
  //
  // De grove weg kent het land als een verkenner. Waar het open is, weet hij het precies: een vak is te belopen als er
  // een tegel in ligt van het stuk land waar hij op staat (T.eilandOp), dus een dicht bosje of een holte tussen de bomen
  // telt. Waar het nog dicht is, gaat hij af op de schets (grofKost). Gaat er land open, dan weet hij meer, en rekent hij
  // opnieuw. De weg is een veld vanaf het doel, zoals de velden hierboven: per vak hoe ver het ervan af ligt (een stap 10
  // recht en 14 schuin, maal wat het vak kost, zonder een hoek af te snijden), uit het nummer van het eiland en het land
  // dat open is, dus op elke computer hetzelfde. Geen spelstaat: wat opnieuw gerekend wordt, is hetzelfde.
  const GEEN = 0xffffffff;
  const BROEK = 3; // zoveel keer kost een vak broek wat open land kost (grofKost)
  const GROF_KOST = new WeakMap(); // eiland → Uint8Array: wat een stap in het vak kost volgens de schets (0: dicht)
  // kaart → { versie, open, kost: Map(eiland → { kost: Uint8Array, deel: Int32Array }), velden: Map(sleutel → Uint32Array) }
  const GROF = new WeakMap();

  // Wat een stap in vak k kost volgens de schets, of 0 als het dicht is. De zee, een meer en een rivier zijn dicht, en het
  // woud ook: daar staan zoveel bomen (js/eiland.js, I.bomen) dat er geen doorkomen aan is. In het broek staan er minder,
  // en is er soms een doorgang: BROEK keer zo duur. Een weg van het eiland is open (op een weg staan geen bomen, en over
  // smal water ligt een bruggetje), ook waar de schets een rivier, een meer of woud zegt; de zee niet. Zo ook het paadje naar
  // een roverskamp, en de open plek om zijn vuur (js/eiland.js, legKampen). Ligt er toch geen
  // bruggetje (een brede of schuine oversteek), dan leert hij het als het land daar open is.
  function grofKost(E) {
    let kost = GROF_KOST.get(E);
    if (kost) return kost;
    const N = E.n * E.n;
    const woud = T.EILAND_STREKEN.indexOf('woud');
    const broek = T.EILAND_STREKEN.indexOf('broek');
    const nat = (k) => E.zee[k] || E.meer[k] >= 0 || E.rivier[k];
    kost = new Uint8Array(N);
    for (let k = 0; k < N; k++) kost[k] = nat(k) || E.streek[k] === woud ? 0 : E.streek[k] === broek ? BROEK : 1;
    const vakVan = (x, y) => Math.floor(y / E.vak) * E.n + Math.floor(x / E.vak);
    const open = (k) => {
      if (!E.zee[k]) kost[k] = 1;
    };
    // Een weg legt hij vak voor vak, en gaat hij schuin naar het volgende vak, dan ook een vak ernaast: anders sneed hij
    // een hoek af (grofStap), en was de weg daar door het woud dicht.
    for (const weg of [...(E.wegen || []), ...(E.paden || [])]) {
      let vorig = -1;
      for (let i = 1; i < weg.punten.length; i++) {
        const [ax, ay] = weg.punten[i - 1];
        const [bx, by] = weg.punten[i];
        const stappen = Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2) || 1;
        for (let j = 0; j <= stappen; j++) {
          const k = vakVan(ax + ((bx - ax) * j) / stappen, ay + ((by - ay) * j) / stappen);
          if (k === vorig) continue;
          if (vorig >= 0 && k % E.n !== vorig % E.n && Math.floor(k / E.n) !== Math.floor(vorig / E.n)) open(Math.floor(vorig / E.n) * E.n + (k % E.n));
          open(k);
          vorig = k;
        }
      }
    }
    for (const b of E.bruggen || []) for (const t of b.tegels) kost[vakVan(t.x, t.y)] = 1;
    GROF_KOST.set(E, kost);
    return kost;
  }

  // Wat de grove weg van kaart w weet, zolang de kaart en het open land niet veranderen.
  function grofVan(w) {
    const versie = T.kaartVersie(w);
    const open = T.openGrootte(w);
    let g = GROF.get(w);
    if (!g || g.versie !== versie || g.open !== open) GROF.set(w, (g = { versie, open, kost: new Map(), velden: new Map() }));
    return g;
  }

  // Wat een stap in elk vak kost voor wie op eiland `eig` staat: in land dat open is 1 als er een tegel van zijn eiland in
  // ligt en anders 0, in land dat dicht is wat de schets zegt. Met de delen: per vak het nummer van het stuk vakken dat
  // samenhangt (-1 als het dicht is), om te weten waar hij kan komen.
  function kostVoor(w, E, g, eig) {
    if (g.kost.has(eig)) return g.kost.get(eig);
    const kost = grofKost(E).slice();
    const per = T.STUK / E.vak;
    for (const s of w.open) {
      for (let ky = Math.floor(s / 64) * per; ky < (Math.floor(s / 64) + 1) * per && ky < E.n; ky++) {
        for (let kx = (s % 64) * per; kx < ((s % 64) + 1) * per && kx < E.n; kx++) {
          let ja = 0;
          for (let y = ky * E.vak; y < (ky + 1) * E.vak && !ja; y++) {
            for (let x = kx * E.vak; x < (kx + 1) * E.vak; x++) {
              if (T.eilandOp(w, x, y) !== eig) continue;
              ja = 1;
              break;
            }
          }
          kost[ky * E.n + kx] = ja;
        }
      }
    }
    // Buiten de rand van een level (T.stukBinnenRand, js/wereld.js) is er geen land, dus ook geen grove weg: een tocht erheen
    // gaat naar het vak binnen de rand dat het dichtst bij zijn doel ligt (doelVak), en blijft daar staan (Marcel, 24 okt:
    // "Hij loopt tot de rand").
    if (w.rand) {
      for (let k = 0; k < E.n * E.n; k++) if (!T.stukBinnenRand(w, Math.floor((k % E.n) / per), Math.floor(Math.floor(k / E.n) / per))) kost[k] = 0;
    }
    const uit = { kost, deel: delenVan(kost, E.n) };
    g.kost.set(eig, uit);
    return uit;
  }
  // De samenhangende stukken vakken van `kost` (zoals grofStap ze belopen), per vak een nummer, -1 waar het dicht is.
  function delenVan(kost, n) {
    const deel = new Int32Array(n * n).fill(-1);
    const rij = [];
    let nr = 0;
    for (let b = 0; b < n * n; b++) {
      if (!kost[b] || deel[b] >= 0) continue;
      deel[b] = nr;
      rij.push(b);
      while (rij.length) {
        const k = rij.pop();
        for (const [dx, dy] of RICHTINGEN) {
          const j = grofStap(kost, n, k, dx, dy);
          if (j < 0 || deel[j] >= 0) continue;
          deel[j] = nr;
          rij.push(j);
        }
      }
      nr++;
    }
    return deel;
  }
  // Het vak waar hij heen gaat: het doel, of, kan hij daar niet komen (het is dicht, of het hangt niet samen met zijn
  // vak), het vak van zijn deel dat er het dichtst bij ligt (bij gelijk het eerste).
  function doelVak(E, deel, van, doel) {
    if (deel[doel] >= 0 && deel[doel] === deel[van]) return doel;
    const n = E.n;
    const [dx, dy] = [doel % n, Math.floor(doel / n)];
    let beste = -1;
    let bij = Infinity;
    for (let k = 0; k < n * n; k++) {
      if (deel[k] !== deel[van]) continue;
      const a = ((k % n) - dx) ** 2 + (Math.floor(k / n) - dy) ** 2;
      if (a < bij) [beste, bij] = [k, a];
    }
    return beste;
  }

  // Mag je van vak k een stap (dx, dy) zetten: het vak ernaast is open, en schuin ook de twee vakken die de hoek maken.
  function grofStap(kost, n, k, dx, dy) {
    const x = k % n;
    const y = (k - x) / n;
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= n || ny >= n || !kost[ny * n + nx]) return -1;
    if (dx && dy && !(kost[y * n + nx] && kost[ny * n + x])) return -1;
    return ny * n + nx;
  }

  // Het veld naar vak `doel` over `kost`. Dial: een stap kost hooguit 14 maal BROEK, dus zoveel emmers plus één in de
  // rondte.
  function grofVeld(g, kost, E, doel, eig) {
    const sleutel = `${doel}|${eig}`;
    if (g.velden.has(sleutel)) return g.velden.get(sleutel);
    const n = E.n;
    const d = new Uint32Array(n * n).fill(GEEN);
    const rond = 14 * BROEK + 1;
    const emmers = Array.from({ length: rond }, () => []);
    d[doel] = 0;
    emmers[0].push(doel);
    let nog = 1;
    for (let nu = 0; nog > 0; nu++) {
      const emmer = emmers[nu % rond];
      while (emmer.length) {
        const k = emmer.pop();
        nog--;
        if (d[k] !== nu) continue;
        for (const [dx, dy] of RICHTINGEN) {
          const j = grofStap(kost, n, k, dx, dy);
          if (j < 0) continue;
          const nd = nu + (dx && dy ? 14 : 10) * kost[j];
          if (nd >= d[j]) continue;
          d[j] = nd;
          emmers[nd % rond].push(j);
          nog++;
        }
      }
    }
    g.velden.set(sleutel, d);
    if (g.velden.size > IN().grofOnthouden) g.velden.delete(g.velden.keys().next().value);
    return d;
  }

  // Het eiland waar wie op `t` staat op kan stappen (zijn tegel, of een ernaast: wie in een deur staat), of -1.
  function eilandBij(w, t) {
    const eigen = T.eilandOp(w, t.x, t.y);
    if (eigen >= 0) return eigen;
    for (const [dx, dy] of RICHTINGEN) {
      const e = T.eilandOp(w, t.x + dx, t.y + dy);
      if (e >= 0) return e;
    }
    return -1;
  }

  // De tegel van eiland `eig` in vak k die het dichtst bij het midden van het vak ligt (bij gelijk de eerste van boven
  // naar onder), of null.
  function tegelInVak(w, E, k, eig) {
    const x0 = (k % E.n) * E.vak;
    const y0 = Math.floor(k / E.n) * E.vak;
    const m = (E.vak - 1) / 2;
    let beste = null;
    let bij = Infinity;
    for (let y = y0; y < y0 + E.vak; y++) {
      for (let x = x0; x < x0 + E.vak; x++) {
        const a = Math.max(Math.abs(x - x0 - m), Math.abs(y - y0 - m));
        if (a < bij && T.isBegaanbaar(w, x, y) && T.eilandOp(w, x, y) === eig) [beste, bij] = [{ x, y }, a];
      }
    }
    return beste;
  }

  // De weg van een tocht: langs de grove weg naar het verste vak dat open is (hooguit grofVooruit vakken ver), op een
  // tegel van zijn eiland. Leeg als hij daar al staat en het land voor hem nog dicht is (het gaat zo open), null als er
  // geen grove weg is of hij niet verder komt.
  function tochtRoute(w, van, doel, o) {
    if (!T.opKaart(w, doel.x, doel.y)) return null;
    const E = T.eilandVan(w.eiland.zaad);
    const n = E.n;
    const eig = eilandBij(w, van);
    if (eig < 0) return null;
    const g = grofVan(w);
    const { kost, deel } = kostVoor(w, E, g, eig);
    let k = Math.floor(van.y / E.vak) * n + Math.floor(van.x / E.vak);
    if (deel[k] < 0) return null;
    const naar = doelVak(E, deel, k, Math.floor(doel.y / E.vak) * n + Math.floor(doel.x / E.vak));
    const d = grofVeld(g, kost, E, naar, eig);
    const vakken = [k];
    let wacht = false; // het volgende vak van de grove weg is nog dicht
    for (let i = 0; i < IN().grofVooruit && d[k] > 0; i++) {
      let beste = -1;
      for (const [dx, dy] of RICHTINGEN) {
        const j = grofStap(kost, n, k, dx, dy);
        if (j >= 0 && d[j] < (beste < 0 ? d[k] : d[beste])) beste = j;
      }
      if (beste < 0) break;
      if (T.tegel(w, (beste % n) * E.vak, Math.floor(beste / n) * E.vak) === 'buiten') {
        wacht = true;
        break;
      }
      k = beste;
      vakken.push(k);
    }
    for (let i = vakken.length - 1; i >= 0; i--) {
      const t = tegelInVak(w, E, vakken[i], eig);
      if (!t) continue;
      // Staat hij er al: wacht hij op het land voor hem, dan een lege weg; verder dan hier komt hij niet, dan geen.
      if (t.x === van.x && t.y === van.y) return wacht ? [] : null;
      const pad = T.zoekRoute(w, van, t);
      if (pad) return pad;
    }
    return null;
  }

  // De hele grove weg van `van` naar `doel`, voor wie buiten beeld reist (de rovers van een kamp op weg naar een dorp,
  // js/rovers.js; werklijst vraag 170, c3): het midden van elk vak, van het vak van `van` tot dat van het doel, over de
  // schets en het land dat open is, zoals een tocht hem ziet vanaf het eiland van het doel. Null als er geen weg is (dicht,
  // of een ander eiland).
  T.groveWeg = function (w, van, doel) {
    if (!T.opEiland(w) || !T.opKaart(w, doel.x, doel.y)) return null;
    const E = T.eilandVan(w.eiland.zaad);
    const n = E.n;
    const eig = eilandBij(w, doel);
    if (eig < 0) return null;
    const g = grofVan(w);
    const { kost, deel } = kostVoor(w, E, g, eig);
    const naar = Math.floor(doel.y / E.vak) * n + Math.floor(doel.x / E.vak);
    let k = Math.floor(van.y / E.vak) * n + Math.floor(van.x / E.vak);
    if (deel[k] < 0 || deel[k] !== deel[naar]) return null;
    const d = grofVeld(g, kost, E, naar, eig);
    const midden = (v) => ({ x: (v % n) * E.vak + (E.vak >> 1), y: Math.floor(v / n) * E.vak + (E.vak >> 1) });
    const uit = [midden(k)];
    while (d[k] > 0) {
      let beste = -1;
      for (const [dx, dy] of RICHTINGEN) {
        const j = grofStap(kost, n, k, dx, dy);
        if (j >= 0 && d[j] < (beste < 0 ? d[k] : d[beste])) beste = j;
      }
      if (beste < 0) return null;
      k = beste;
      uit.push(midden(k));
    }
    return uit;
  };
})(globalThis.Spel = globalThis.Spel || {});
