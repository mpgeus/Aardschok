// De markt op het plein (werklijst vraag 110, d; Marcel, 5 okt: "Voor nu a1, b tot e ja"), en sinds vraag 127 een levende
// markt die meegroeit met de stad (Marcel, 6 okt: "Grotere stad = grotere markt"; "A ja, B ja, C c1 en c2, D ja, E
// marktdag"). In de speeltest van vier jaar kwam er in geen spel een markt: een eigen gebouw van 6 bij 6 vroeg 12 bij 12
// open grond, en die was op toen er goud was. Zo hield een dorp ook markt: op het plein, met kramen.
//
// - Hoe hij komt (110, d, a1): zoals elk gebouw, een inwoner vraagt het je (js/verzoeken.js), of jij hangt een oproep op.
//   Alleen de plek is het plein, niet een eigen stuk grond: T.plekVoor, T.waaromPastHetNiet en T.plaatsGebouw vragen het
//   hier. Kramen zijn geen huis (`kosten` hieronder, in de werkbank); T.GEBOUWEN.markt.kosten zegt het, naar de spelregel
//   "De markt" ("Op het plein", de standaard, of "Een eigen gebouw", zoals vóór 6 okt).
// - Het marktblok (127, B): twee rijen kramen tegenover elkaar, langs een as van de kaart, met twee tegels looppad ertussen
//   en een mand of kist naast elke kraam (T.marktBlok). Het spel zoekt het langste open stuk plein buiten de kring van het
//   feest (T.feestMidden, js/feesten.js) en weg van de heer en zijn schandpaal (js/heer.js), waar het niemand de weg
//   verspert. Het blok ligt vast zodra de markt komt (`g.blok`), en de rijen vullen zich kraam voor kraam.
// - De kramen (127, a tot c; Marcel: "Misschien verschillende kramen? Ook in afmeting? Voornamelijk lengte"): elke kraam
//   heeft een waar, een vorm (de luifel, het puntdak, het zeil of de kar) en een lengte van één tot drie tegels, geloot
//   naar de waar (`kramen` hieronder, T.kraamVoor).
// - Meegroeien (127, C en d): een tegel toonbank per `perMensen` mensen, minstens `beginTegels` (T.tegelsNodig), elke
//   nacht hooguit één kraam erbij (T.tikMarktDag, vanuit T.tikGebouwenDag). Is het blok vol, dan komen de volgende langs
//   de weg vanaf het plein, met hun toonbank naar de weg: de marktstraat (c2, T.straatPlek). Past een kraam nergens, dan
//   wordt hij een tegel korter. Een groter plein in de maker is c1 (js/maker.js).
// - Vol of leeg (127, A): elke kraam heeft zijn waar (KRAAMWAREN in gereedschap/pixelart/dorp.cjs; `volgorde` hieronder),
//   en ligt vol als het dorp die waar heeft (`waren`: de broodkraam brood, de viskraam vis of vlees), anders staat hij leeg,
//   met de luifel opgerold. Zo zie je op de markt hoe het dorp ervoor staat.
// - De markt staat als gebouw in D.gebouwen (`opHetPlein`, met `kramen`, `manden` en `blok`), zodat de wens van de stenen
//   huizen hem telt (T.plekkenVan, js/wensen.js), maar zonder voet: zijn plek is het midden van het plein.
// Nog niet (127, stap 3): de kooplui achter de kramen, de boodschappen (D) en de marktdag (E). En later de handel met de
// buren (vraag 72): "De markt wordt essentieel voor de handel" (Marcel, 5 okt).
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.MARKT_INSTELLINGEN = {
    // De spelregel "De markt": true, op het plein; false, een eigen gebouw van 6 bij 6 (T.GEBOUWEN.markt).
    opHetPlein: true,
    // Wat de kramen kosten. Een eigen gebouw kost wat T.GEBOUWEN.markt zegt (16 hout, 14 goud).
    kosten: { hout: 8, goud: 6 },
    // Hoe groot de markt is, in tegels toonbank (vraag 127, d; Marcel: "ja eens"): minstens zoveel bij het begin, en
    // daarna een tegel per zoveel mensen in het dorp. Drie korte kramen zijn zo even veel als één lange.
    beginTegels: 6,
    perMensen: 10,
    // Hoe lang een rij van het blok hooguit is, in tegels, en hoeveel tegels er tussen de twee rijen liggen (de rij
    // ertegenover inbegrepen: bij 3 ligt er een looppad van twee tegels tussen).
    rijLengte: 12,
    tussenRijen: 3,
    // Een kraam staat buiten de kring van het feest (T.FEESTEN_INSTELLINGEN.kring, om T.feestMidden), en nog zoveel
    // tegels verder.
    vanHetFeest: 0,
    // Zo ver blijft een kraam van de plek van de heer (en de marskramer), in tegels.
    vanDeHeer: 3,
    // En zo ver van een boom (de eiken op het plein), en niet op een tegel die in ons beeld achter een dak of een kruin
    // valt: zoveel pixels boven zijn achterste hoek reikt een gebouw, en een boom (een tegel is 64 bij 32).
    vanBomen: 2,
    achterDak: 200,
    achterBoom: 110,
    // De marktstraat: zo ver langs de weg vanaf het plein komen er kramen, en zo ver uit elkaar.
    straatTot: 30,
    straatAfstand: 2,
    // Welke waar de kramen hebben, in de volgorde waarin ze komen (de vijfde kraam heeft weer groente), en wat het dorp
    // in zijn voorraad moet hebben om ze vol te leggen.
    volgorde: ['groente', 'brood', 'vis', 'laken', 'potten'],
    // Hoe de kraam van elke waar eruitziet (vraag 127, c; Marcel: "vormen en verdeling ja"): uit welke vormen er een
    // geloot wordt (gereedschap/pixelart/dorp.cjs, KRAAMVORMEN: de luifel, het puntdak, het zeil en de kar), en hoe lang
    // hij is, in tegels (van, tot).
    kramen: {
      groente: { vormen: ['luifel', 'kar', 'puntdak'], lengte: [1, 2] },
      brood: { vormen: ['luifel', 'puntdak', 'zeil'], lengte: [1, 1] },
      vis: { vormen: ['luifel', 'zeil', 'puntdak'], lengte: [2, 3] },
      laken: { vormen: ['luifel', 'puntdak', 'zeil'], lengte: [2, 3] },
      potten: { vormen: ['zeil', 'luifel'], lengte: [1, 2] },
    },
    waren: {
      groente: ['groente', 'eieren', 'kaas', 'graan'],
      brood: ['brood'],
      vis: ['vis', 'vlees'],
      laken: ['laken', 'wol'],
      potten: ['klei', 'vaten', 'gereedschap'],
    },
  };
  const IN = () => T.MARKT_INSTELLINGEN;

  // Wat naast een kraam op de grond staat, per waar, vol of leeg (gereedschap/pixelart/marktkraam.cjs, MANDEN).
  const MANDEN = {
    groente: ['mand appels', 'mand kolen'],
    brood: ['krat brood', 'zak'],
    vis: ['ton graan', 'ton leeg'],
    laken: ['krat wol', 'zak'],
    potten: ['zak', 'ton leeg'],
  };
  const LEGE_MAND = { vis: 'ton leeg', potten: 'ton leeg' };

  // Wat de markt kost, naar de spelregel: de kramen, of een eigen gebouw. Eén plek, zodat elke regel die
  // T.GEBOUWEN.markt.kosten vraagt (het bouwen, het verzoek, de raad, de inner) hetzelfde hoort.
  const eigenKosten = T.GEBOUWEN.markt.kosten;
  Object.defineProperty(T.GEBOUWEN.markt, 'kosten', { enumerable: true, get: () => (IN().opHetPlein ? IN().kosten : eigenKosten) });

  // Komt de markt hier op het plein? Naar de spelregel, en alleen op een kaart met een plein.
  T.marktOpHetPlein = (D) => !!IN().opHetPlein && T.pleinTegels(D.wereld).length > 0;

  const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  const sleutel = (x, y) => `${x},${y}`;
  // De kant waarheen een kraam kijkt, in de richtingen van het beeld (js/sprites.js, T.sprites.richtingVan): +x is ZO, +y
  // is ZW.
  const richtingNaar = (dx, dy) => (dx > 0 ? 'ZO' : dx < 0 ? 'NW' : dy > 0 ? 'ZW' : 'NO');

  // Het midden van het plein: de tegel van het plein het dichtst bij zijn zwaartepunt waar je kunt staan. Daar is de
  // markt als gebouw (zijn "deur", T.deurVan), en daarvandaan rekent een kring (de spelregel "De herberg en de markt").
  T.marktMidden = function (w) {
    const tegels = T.pleinTegels(w);
    if (!tegels.length) return null;
    const m = zwaartepunt(tegels);
    let beste = null;
    // een tegel waar je kunt staan: op land 72022 stond er een bank op het midden (gezien met de grote gebouwen, vraag
    // 114, stap 3, toen dat land anders kwam te liggen)
    for (const t of tegels) {
      const a = Math.hypot(t.x - m.x, t.y - m.y) + (T.isBegaanbaar(w, t.x, t.y) ? 0 : 1e6);
      if (!beste || a < beste.a) beste = { x: t.x, y: t.y, a };
    }
    return { x: beste.x, y: beste.y };
  };
  function zwaartepunt(tegels) {
    return { x: tegels.reduce((s, t) => s + t.x, 0) / tegels.length, y: tegels.reduce((s, t) => s + t.y, 0) / tegels.length };
  }

  // Welke tegels je vanaf `van` bereikt, stap voor stap recht (niet schuin: strenger dan het lopen, js/pad.js), met de
  // tegels in `dicht` als muur. Zo houdt een kraam niemand tegen: wat je eerst bereikte, bereik je nog.
  function bereik(w, van, dicht) {
    const gezien = new Set([sleutel(van.x, van.y)]);
    const rij = [van];
    while (rij.length) {
      const t = rij.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = t.x + dx;
        const y = t.y + dy;
        const k = sleutel(x, y);
        if (gezien.has(k) || dicht.has(k) || !T.isBegaanbaar(w, x, y)) continue;
        gezien.add(k);
        rij.push({ x, y });
      }
    }
    return gezien;
  }
  // Houden deze tegels (dicht erbij, naast wat al dicht is) iemand tegen?
  function houdtTegen(w, van, al, erbij) {
    const voor = bereik(w, van, al);
    const dicht = new Set([...al, ...erbij]);
    const na = bereik(w, van, dicht);
    for (const k of voor) if (!dicht.has(k) && !na.has(k)) return true;
    return false;
  }

  // Wat een kraam in de weg zou staan: een deur, de heer en zijn schandpaal, het feest. `opPlein`: op het plein (het blok)
  // of ernaast (de straat).
  function regels(D) {
    const w = D.wereld;
    const tegels = T.pleinTegels(w);
    const midden = T.feestMidden(w) || zwaartepunt(tegels);
    const heer = w.heer || w.marskramer || null;
    const paal = (w.voorwerpen || []).find((v) => v.soort === 'schandpaal') || (heer ? T.plekVoorDeSchandpaal(D) : null);
    const weg = new Set(paal ? [sleutel(paal.x, paal.y), sleutel(paal.x + 1, paal.y + 1)] : []);
    const deuren = (D.gebouwen || []).filter((g) => !g.opHetPlein).map((g) => T.deurVan(w, g));
    const open = (x, y) => T.isBegaanbaar(w, x, y) && !T.voorwerpOp(w, x, y) && !T.bijDeur(w, x, y)
      && !weg.has(sleutel(x, y)) && !deuren.some((d) => cheb({ x, y }, d) <= 1);
    const feest = T.FEESTEN_INSTELLINGEN.kring + IN().vanHetFeest;
    // de bomen bij het plein (verder weg dekken ze er niets van af)
    const pt = T.pleinTegels(w);
    const [px0, px1, py0, py1] = [Math.min(...pt.map((t) => t.x)) - 6, Math.max(...pt.map((t) => t.x)) + 6, Math.min(...pt.map((t) => t.y)) - 6, Math.max(...pt.map((t) => t.y)) + 6];
    const bomen = (w.voorwerpen || []).filter((v) => v.x >= px0 && v.x <= px1 && v.y >= py0 && v.y <= py1 && T.NATUUR.bos.telt(w, v.x, v.y, v));
    const bijEenBoom = (x, y) => bomen.some((b) => cheb(b, { x, y }) <= IN().vanBomen);
    // Wat in ons beeld achter een gebouw of een boom valt: een tegel die binnen de breedte van zijn voet ligt, achter
    // zijn voorste hoek, en niet hoger dan het dak of de kruin reikt (in pixels van het beeld: x - y keer 32 opzij, x + y
    // keer 16 omlaag).
    const dekkers = [];
    for (const v of w.voorwerpen || []) {
      if (T.isGebouw(v)) dekkers.push({ x0: v.x, y0: v.y, x1: v.x + v.beslaat[0] - 1, y1: v.y + v.beslaat[1] - 1, hoog: IN().achterDak });
    }
    for (const v of bomen) dekkers.push({ x0: v.x, y0: v.y, x1: v.x, y1: v.y, hoog: IN().achterBoom });
    const verborgen = (x, y) => dekkers.some((d) => {
      const sx = (x - y) * 32;
      const sy = (x + y) * 16;
      const voor = (d.x1 + d.y1) * 16 + 16;
      const top = (d.x0 + d.y0) * 16 - d.hoog; // het dak staat boven de hele voet, dus vanaf de achterste hoek
      return x + y < d.x1 + d.y1 && sx >= (d.x0 - d.y1) * 32 - 32 && sx <= (d.x1 - d.y0) * 32 + 32 && sy < voor && sy > top;
    });
    const kraamMag = (x, y) => open(x, y) && cheb({ x, y }, midden) > feest && (!heer || cheb({ x, y }, heer) > IN().vanDeHeer)
      && !bijEenBoom(x, y);
    const nietBijDeHeer = (x, y) => !heer || cheb({ x, y }, heer) > IN().vanDeHeer;
    return { w, midden, open, kraamMag, nietBijDeHeer, verborgen };
  }

  // Het marktblok (vraag 127, B): twee rijen tegenover elkaar, langs een as van de kaart, op het plein, met `tussenRijen -
  // 1` tegels looppad ertussen: { rijen: [{ x, y, ax, ay, richting, lengte, vol }] }, met per rij het begin, de as (+x of
  // +y), waarheen de kramen kijken, hoe lang hij is en hoeveel er al vol is (in tegels). Het blok dat niemand
  // tegenhoudt en waarvan je de meeste tegels ziet (niet achter een dak of een kruin), dan het langste, tot `rijLengte`;
  // bij gelijkspel het verst van het midden van het feest. Puur: zet niets neer.
  T.marktBlok = function (D) {
    const R = regels(D);
    const w = R.w;
    const opPlein = (x, y) => T.opHetPlein(w, x, y);
    const open = (x, y) => opPlein(x, y) && R.open(x, y);
    const kraam = (x, y) => opPlein(x, y) && R.kraamMag(x, y);
    const n = IN().tussenRijen;
    const kandidaten = [];
    for (const [ax, ay] of [[1, 0], [0, 1]]) {
      for (const kant of [1, -1]) {
        const [px, py] = ax ? [0, kant] : [kant, 0];
        for (const t of T.pleinTegels(w)) {
          let lengte = 0;
          for (let k = 0; k < IN().rijLengte; k++) {
            const a = { x: t.x + ax * k, y: t.y + ay * k };
            let pad = true;
            for (let i = 1; i < n; i++) if (!open(a.x + px * i, a.y + py * i)) pad = false;
            if (!pad || !kraam(a.x, a.y) || !kraam(a.x + px * n, a.y + py * n)) break;
            lengte++;
          }
          if (lengte < 2) continue;
          // hoeveel van zijn tegels je ziet: een blok achter een dak is een markt die niemand ziet
          let zicht = 0;
          for (let k = 0; k < lengte; k++) {
            const a = { x: t.x + ax * k, y: t.y + ay * k };
            if (!R.verborgen(a.x, a.y)) zicht++;
            if (!R.verborgen(a.x + px * n, a.y + py * n)) zicht++;
          }
          const midden = { x: t.x + ax * (lengte - 1) / 2 + px * n / 2, y: t.y + ay * (lengte - 1) / 2 + py * n / 2 };
          const rijen = [
            { x: t.x, y: t.y, ax, ay, richting: richtingNaar(px, py), lengte, vol: 0 },
            { x: t.x + px * n, y: t.y + py * n, ax, ay, richting: richtingNaar(-px, -py), lengte, vol: 0 },
          ];
          kandidaten.push({ rijen, zicht, ver: Math.hypot(midden.x - R.midden.x, midden.y - R.midden.y) });
        }
      }
    }
    kandidaten.sort((a, b) => b.zicht - a.zicht || b.rijen[0].lengte - a.rijen[0].lengte || b.ver - a.ver);
    for (const k of kandidaten.slice(0, 40)) {
      const dicht = k.rijen.flatMap((r) => Array.from({ length: r.lengte }, (_, i) => sleutel(r.x + r.ax * i, r.y + r.ay * i)));
      if (!houdtTegen(w, R.midden, new Set(), dicht)) return { rijen: k.rijen };
    }
    return { rijen: [] };
  };

  // De volgende plek in de marktstraat (vraag 127, c2): `lengte` tegels naast de weg die van het plein af loopt, met de
  // toonbank naar de weg, het dichtst bij het plein, niet op een veld, een erf of een pad, en niet te dicht bij een andere
  // kraam. `bezet`: de tegels die al dicht zijn (de kramen en manden die er staan, of nog komen). { x, y, richting,
  // lengte, tegels, mand } of null.
  T.straatPlek = function (D, bezet = new Set(), lengte = 1) {
    const R = regels(D);
    const w = R.w;
    const naast = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const start = [];
    for (const t of T.pleinTegels(w)) {
      for (const [dx, dy] of naast) if (T.opPad(w, t.x + dx, t.y + dy) && !T.opHetPlein(w, t.x + dx, t.y + dy)) start.push({ x: t.x + dx, y: t.y + dy, d: 1 });
    }
    const gezien = new Set(start.map((t) => sleutel(t.x, t.y)));
    const rij = [...start];
    const kan = (x, y) => !T.opHetPlein(w, x, y) && !bezet.has(sleutel(x, y)) && R.open(x, y) && R.nietBijDeHeer(x, y) && !T.waaromNietOpDezeGrond(D, x, y);
    const vrijVanKramen = (x, y) => {
      for (let dy = -IN().straatAfstand + 1; dy < IN().straatAfstand; dy++) {
        for (let dx = -IN().straatAfstand + 1; dx < IN().straatAfstand; dx++) if (bezet.has(sleutel(x + dx, y + dy))) return false;
      }
      return true;
    };
    for (let i = 0; i < rij.length; i++) {
      const p = rij[i];
      for (const [dx, dy] of naast) {
        // de kraam staat op (x, y) en kijkt naar p; de weg loopt langs (rx, ry)
        const [rx, ry] = [Math.abs(dy), Math.abs(dx)];
        for (const terug of [0, lengte - 1]) {
          const x0 = p.x + dx - rx * terug;
          const y0 = p.y + dy - ry * terug;
          const tegels = Array.from({ length: lengte }, (_, k) => ({ x: x0 + rx * k, y: y0 + ry * k }));
          if (!tegels.every((t) => kan(t.x, t.y) && vrijVanKramen(t.x, t.y) && T.opPad(w, t.x - dx, t.y - dy))) continue;
          const m = { x: x0 + rx * lengte, y: y0 + ry * lengte };
          const mand = kan(m.x, m.y) && !T.opPad(w, m.x, m.y) ? m : null;
          const dicht = [...tegels.map((t) => sleutel(t.x, t.y)), ...(mand ? [sleutel(mand.x, mand.y)] : [])];
          if (houdtTegen(w, R.midden, bezet, dicht)) continue;
          return { x: x0, y: y0, richting: richtingNaar(-dx, -dy), lengte, tegels, mand };
        }
      }
      if (p.d >= IN().straatTot) continue;
      for (const [dx, dy] of naast) {
        const x = p.x + dx;
        const y = p.y + dy;
        if (gezien.has(sleutel(x, y)) || !T.opPad(w, x, y) || T.opHetPlein(w, x, y)) continue;
        gezien.add(sleutel(x, y));
        rij.push({ x, y, d: p.d + 1 });
      }
    }
    return null;
  };

  // Hoeveel tegels toonbank het dorp nu wil: een per `perMensen` mensen, minstens `beginTegels`.
  T.tegelsNodig = (D) => Math.max(IN().beginTegels, Math.floor((D.bevolking || 0) / IN().perMensen));
  const tegelsVan = (kramen) => kramen.reduce((s, k) => s + (k.lengte || 1), 0);

  // Heeft het dorp deze waar? Dan ligt zijn kraam vol.
  T.heeftWaar = (D, waar) => (IN().waren[waar] || []).some((wat) => (D.voorraad[wat] || 0) > 0);

  // Welke kraam de zoveelste wordt: de waar op volgorde, de vorm en de lengte geloot uit wat bij die waar hoort, met het
  // zaad van het spel, zodat hetzelfde spel dezelfde markt geeft. { waar, vorm, lengte }
  T.kraamVoor = function (D, nr) {
    const waar = IN().volgorde[nr % IN().volgorde.length];
    const soort = IN().kramen[waar];
    const zaad = (D.lot && D.lot.zaad) || 0;
    const lot = (n) => {
      let h = Math.imul(nr + 1, 2654435761) ^ Math.imul(zaad + n, 40503);
      h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
      return (h % 1000) / 1000;
    };
    const vorm = soort.vormen[Math.floor(lot(1) * soort.vormen.length)];
    const [van, tot] = soort.lengte;
    const lengte = Math.min(vorm === 'kar' ? 2 : 3, van + Math.floor(lot(2) * (tot - van + 1)));
    return { waar, vorm, lengte };
  };

  // Waar de volgende kraam komt, zonder iets neer te zetten: in de rij van het blok met de meeste plaats, en past hij daar
  // niet, langs de straat; past hij nergens, dan een tegel korter. `rijen` en `bezet` worden bijgewerkt alsof hij er
  // staat. { x, y, richting, waar, vorm, lengte, tegels, mand } of null.
  function volgendeKraam(D, rijen, bezet, nr) {
    const w = D.wereld;
    const k = T.kraamVoor(D, nr);
    const vrij = (t) => !bezet.has(sleutel(t.x, t.y)) && T.isBegaanbaar(w, t.x, t.y) && !T.voorwerpOp(w, t.x, t.y);
    for (let lengte = k.lengte; lengte >= 1; lengte--) {
      const rij = rijen.filter((r) => r.lengte - r.vol >= lengte).sort((a, b) => a.vol - b.vol)[0];
      if (rij) {
        const x = rij.x + rij.ax * rij.vol;
        const y = rij.y + rij.ay * rij.vol;
        const tegels = Array.from({ length: lengte }, (_, i) => ({ x: x + rij.ax * i, y: y + rij.ay * i }));
        if (tegels.every(vrij)) {
          const m = { x: x + rij.ax * lengte, y: y + rij.ay * lengte };
          const mand = rij.vol + lengte < rij.lengte && vrij(m) ? m : null;
          rij.vol += lengte + 1;
          for (const t of [...tegels, ...(mand ? [mand] : [])]) bezet.add(sleutel(t.x, t.y));
          return { ...k, lengte, x, y, richting: rij.richting, tegels, mand };
        }
        rij.vol = rij.lengte; // er staat iets in de weg: deze rij is vol
      }
      const s = T.straatPlek(D, bezet, lengte);
      if (s) {
        for (const t of [...s.tegels, ...(s.mand ? [s.mand] : [])]) bezet.add(sleutel(t.x, t.y));
        return { ...k, ...s };
      }
    }
    return null;
  }

  // De eerste kramen, zoals de markt ze zou zetten als hij nu kwam (`beginTegels` toonbank): voor het verzoek (de
  // plekken in goud op de grond) en de vraag of hij kan komen.
  T.kraamPlekken = function (D) {
    const rijen = T.marktBlok(D).rijen.map((r) => ({ ...r }));
    const bezet = new Set();
    const plekken = [];
    while (tegelsVan(plekken) < IN().beginTegels) {
      const p = volgendeKraam(D, rijen, bezet, plekken.length);
      if (!p) break;
      plekken.push(p);
    }
    return plekken;
  };

  // Waarom de markt hier niet op het plein kan, of null: er staat er al een, of de kramen passen niet.
  T.waaromGeenMarktOpHetPlein = function (D) {
    if ((D.gebouwen || []).some((g) => g.soort === 'markt' && g.opHetPlein)) return 'Op het plein staat al een markt.';
    if (tegelsVan(T.kraamPlekken(D)) < IN().beginTegels) return 'Op het plein is geen plaats voor de kramen.';
    return null;
  };

  // Waar de markt komt, voor een verzoek (T.plekVoor, js/verzoeken.js): het midden van het plein, met de kramen erbij, of
  // null als hij er niet kan komen.
  T.marktPlek = function (D) {
    if (T.waaromGeenMarktOpHetPlein(D)) return null;
    return { ...T.marktMidden(D.wereld), kramen: T.kraamPlekken(D) };
  };

  // Een kraam neerzetten op zijn plek, met zijn mand ernaast: vol of leeg naar de voorraad. Een lange kraam beslaat zijn
  // tegels langs de rij (`voet` voor wie erop wil staan, `beslaat` voor de tekenvolgorde). Wie er staat, stapt opzij.
  const langsX = (richting) => richting === 'ZW' || richting === 'NO';
  function zetKraam(D, g, plek) {
    const w = D.wereld;
    const i = g.kramen.length;
    const leeg = !T.heeftWaar(D, plek.waar);
    const [b, h] = langsX(plek.richting) ? [plek.lengte, 1] : [1, plek.lengte];
    const kraam = T.zetVoorwerp(w, {
      soort: 'kraam', x: plek.x, y: plek.y, richting: plek.richting, waar: plek.waar, vorm: plek.vorm, lengte: plek.lengte,
      voet: { dx: 0, dy: 0, b, h }, beslaat: [b, h], leeg, inAanbouw: !g.klaar,
    });
    g.kramen.push(kraam);
    T.stapEraf(D, { x: plek.x, y: plek.y, b, h });
    if (plek.mand) {
      const mand = T.zetVoorwerp(w, { soort: 'mand', x: plek.mand.x, y: plek.mand.y, waar: plek.waar, nr: i, wat: mandVan(plek.waar, i, leeg) });
      g.manden.push(mand);
      T.stapEraf(D, { x: plek.mand.x, y: plek.mand.y, b: 1, h: 1 });
    }
  }
  const mandVan = (waar, nr, leeg) => (leeg ? LEGE_MAND[waar] || 'mand leeg' : MANDEN[waar][Math.floor(nr / IN().volgorde.length) % MANDEN[waar].length]);
  const bezetVan = (g) => new Set([...g.kramen, ...g.manden].flatMap((v) => {
    const f = T.voetVan(v);
    const uit = [];
    for (let y = f.y1; y <= f.y2; y++) for (let x = f.x1; x <= f.x2; x++) uit.push(sleutel(x, y));
    return uit;
  }));

  // De markt op het plein zetten (T.plaatsGebouw, js/gebouwen.js): betalen, het blok vastleggen, en de eerste kramen, in
  // aanbouw tot de markt klaar is (T.tikGebouwenDag). Zelfde antwoord als T.plaatsGebouw: { gelukt, reden, instantie,
  // bericht }.
  T.zetMarktOpHetPlein = function (D) {
    const g = T.GEBOUWEN.markt;
    const reden = T.waaromGeenMarktOpHetPlein(D);
    if (reden) return { gelukt: false, reden };
    if (!T.kanBetalen(D, g.kosten)) return { gelukt: false, reden: 'Daar is de voorraad niet groot genoeg voor.' };
    const blok = T.marktBlok(D);
    T.betaalKosten(D, g.kosten);
    const dag = D.kalender ? Math.floor(D.kalender.dag) : 0;
    const midden = T.marktMidden(D.wereld);
    const klaar = g.bouwtijd <= 0;
    const instantie = { soort: 'markt', x: midden.x, y: midden.y, voet: { b: 1, h: 1 }, tekening: null, klaar, klaarOp: dag + g.bouwtijd, handen: 0, voorwerp: null, opHetPlein: true, kramen: [], manden: [], blok };
    const bezet = new Set();
    while (tegelsVan(instantie.kramen) < IN().beginTegels) {
      const plek = volgendeKraam(D, blok.rijen, bezet, instantie.kramen.length);
      if (!plek) break;
      zetKraam(D, instantie, plek);
    }
    D.gebouwen.push(instantie);
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(D);
    return { gelukt: true, instantie, bericht: `De kramen van de markt komen op het plein (${g.bouwtijd} dag${g.bouwtijd === 1 ? '' : 'en'}).` };
  };

  // Elke nacht (T.tikGebouwenDag): wil het dorp meer toonbank, dan komt er één kraam bij, eerst in het blok, dan langs de
  // straat; en elke kraam ligt vol of staat leeg, naar wat het dorp heeft.
  T.tikMarktDag = function (D) {
    const g = (D.gebouwen || []).find((x) => x.soort === 'markt' && x.opHetPlein);
    if (!g) return;
    if (!g.manden) g.manden = []; // een markt van vóór vraag 127
    if (!g.blok || !g.blok.rijen) g.blok = { rijen: [] };
    if (g.klaar && tegelsVan(g.kramen) < T.tegelsNodig(D)) {
      const plek = volgendeKraam(D, g.blok.rijen, bezetVan(g), g.kramen.length);
      if (plek) zetKraam(D, g, plek);
    }
    for (const k of g.kramen) {
      k.waar = k.waar || 'groente';
      k.leeg = !T.heeftWaar(D, k.waar);
    }
    for (const m of g.manden) {
      const k = g.kramen[m.nr];
      if (k) m.wat = mandVan(k.waar, m.nr, k.leeg);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
