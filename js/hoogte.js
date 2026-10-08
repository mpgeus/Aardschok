// De hoogte van het land (werklijst vraag 121, stap 1; Marcel, 7 okt: "ik doel ook meer op heuvels in het landschap",
// "Ja maak de plaat met beide", "a ja 32, b hoger, c ja", en "Ik wil dat de akkers mee bollen met de heuvel"; de
// proefplaat is gereedschap/pixelart/hoogte-proef.cjs).
//
// Eén model voor glooiende heuvels én terrassen: elke hoek van een tegel heeft een hoogte, in pixels op het scherm.
// Delen buren hun hoek, dan glooit het; verschillen ze, dan staat er een wand. Zo'n hoogte is de glooiing van het
// hoekpunt (`w.hoogte.glooiing`, een getal per hoekpunt) plus het niveau van de tegel maal een trede van 32 pixels
// (`w.hoogte.niveau`, alleen de tegels die niet 0 zijn). Een helling is een tegel met een eigen niveau per hoek
// (`w.hoogte.hellingen`), schuin tussen twee treden. Een kaart zonder `w.hoogte` is vlak, zoals altijd (het ontworpen
// gehucht, de proefkamers, en elk land met de spelregel "Hoogte" op vlak).
//
// Het zegt hoe hoog iets ligt, voor het tekenen (js/tekenen.js) en de muis (js/main.js), en sinds stap 2 wat dat doet:
// lopen, bouwen, zien en afdekken (onderaan, "wat de hoogte doet"). De maker legt de hoogte (T.legHoogte).
(function (T) {
  'use strict';

  T.HOOGTE_INSTELLINGEN = {
    aan: false, // de spelregel "Hoogte": of de maker heuvels legt
    trede: 32, // een niveau hoger, in pixels (Marcel, 7 okt: "a ja 32")
    // het landschap (Marcel, 7 okt: "De heuvels moeten niet alleen kleine bultjes zijn ... Uiteindelijk wilde ik een map
    // van 2500x2500", en "Waar alles doorloopt"): drie lagen gladde ruis, overal te vragen, ook buiten de kaart
    groot: { hoog: 420, golf: 64 }, // lange heuvelruggen en dalen: hoe hoog van dal tot top (pixels), en hoe breed (tegels)
    midden: { hoog: 110, golf: 20 }, // heuvels daarop
    klein: { hoog: 14, golf: 7 }, // een zachte golving overal
    vlakteVan: 10, // het dorp ligt op een vlakte: tot zoveel tegels van het midden van het plein glooit het nauwelijks ...
    vlakteTot: 32, // ... en vanaf hier loopt het landschap helemaal door
    vrijRond: 6, // in zoveel tegels loopt het van een vlak stuk (een huis met zijn looppad, het water) naar het landschap
    richel: [4.5, 6.5], // de richel bij de rotsen: hoe ver hij reikt
    hellingBreed: 2, // de helling de richel op, in tegels
    oog: 32, // zien (vraag 121, stap 2): hoe hoog het oog is boven de grond, in pixels; een heuvel ertussen houdt het zicht
    verderPer: 64, // ... en wie hoger staat dan wat hij bekijkt, ziet een tegel verder per zoveel pixels (Marcel: twee treden)
    steil: 6, // bouwen (vraag 121, stap 2): steiler dan zoveel pixels per tegel, over de plek met zijn looppad, is te steil
  };
  const IN = () => T.HOOGTE_INSTELLINGEN;

  // De vier hoeken van tegel (x, y): noord, oost, zuid, west (op het scherm boven, rechts, onder, links).
  const HOEK = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
  T.HOOGTE_HOEKEN = HOEK;

  T.heeftHoogte = (w) => !!(w && w.hoogte);

  const sleutel = (x, y) => x + ',' + y;
  function niveauVan(hg, x, y) {
    return hg.niveau[sleutel(x, y)] || 0;
  }
  // De glooiing op hoekpunt (vx, vy), in pixels: het landschap uit het nummer van het land, platter op de vlakte om het
  // dorp, en vlak op de vlakke stukken (een huis met zijn looppad, het water), met een overgang van `vrijRond` tegels.
  // Een rekensom en geen lijst: ook buiten de kaart (het bos eromheen, en straks een groter land), en een bewaard spel
  // hoeft alleen het nummer en de vlakke stukken te onthouden.
  function glooiingOp(hg, vx, vy) {
    const I = IN();
    let h = landOp(hg, vx, vy);
    const d = Math.hypot(vx - hg.midden[0], vy - hg.midden[1]);
    h = hg.dorpHoogte + (h - hg.dorpHoogte) * glad(I.vlakteVan, I.vlakteTot, d);
    // op een vlak stuk precies zijn hoogte; ernaast een overgang naar elk vlak stuk in de buurt
    let naast = null;
    for (const v of hg.vlakken) {
      const dx = Math.max(v.x0 - vx, 0, vx - v.x1);
      const dy = Math.max(v.y0 - vy, 0, vy - v.y1);
      if (dx === 0 && dy === 0) return v.h;
      if (dx >= I.vrijRond || dy >= I.vrijRond) continue;
      (naast || (naast = [])).push([v, Math.hypot(dx, dy)]);
    }
    if (naast) for (const [v, d] of naast) h = v.h + (h - v.h) * glad(0, I.vrijRond, d);
    return h;
  }
  // Het landschap zelf: drie lagen gladde ruis uit het nummer van het land (ook voor de grote plaat,
  // gereedschap/pixelart/landschap-plaat.cjs).
  T.landschapOp = (zaad, vx, vy) => landschapOp(zaad, vx, vy);
  function landschapOp(zaad, vx, vy, alleenGroot) {
    const I = IN();
    const z = (zaad % 9973) * 7.31;
    let h = I.groot.hoog * ruis(vx / I.groot.golf + z, vy / I.groot.golf - z);
    if (alleenGroot) return h;
    h += I.midden.hoog * ruis(vx / I.midden.golf - z * 1.7, vy / I.midden.golf + z * 0.3);
    h += I.klein.hoog * ruis(vx / I.klein.golf + z * 0.9, vy / I.klein.golf + z * 2.3);
    return h;
  }
  function glad(a, b, x) {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // Het land op hoekpunt (vx, vy), voor het dorp erop ligt: op het eiland de hoogte van het eiland (js/eiland.js; vraag
  // 117, 2b: "de bergrug en de dalen"), anders het landschap uit het nummer van het land. `alleenGroot`: alleen de grote
  // glooiing (voor het water; op het eiland ligt het water al op zijn peil).
  function landOp(hg, vx, vy, alleenGroot) {
    return hg.eiland ? eilandOp(hg, vx, vy) : landschapOp(hg.zaad, vx, vy, alleenGroot);
  }

  // De hoogte van hoek k (0 noord, 1 oost, 2 zuid, 3 west) van tegel (x, y), in pixels. Uit een lijst die eens per
  // hoogte wordt uitgerekend (het tekenen vraagt het elk beeld voor duizenden tegels); verandert de hoogte, dan krijgt
  // ze een nieuwe `versie`, en wordt de lijst opnieuw gemaakt.
  // De lijst loopt `RAND` tegels buiten de kaart door, voor het land eromheen dat het spel tekent.
  const RAND = 48;
  const lijsten = new WeakMap();
  function hoekenLijst(hg) {
    let l = lijsten.get(hg);
    if (l && l.versie === (hg.versie || 0)) return l.hoeken;
    const b = hg.b + 2 * RAND;
    const hoeken = new Float64Array(b * (hg.h + 2 * RAND) * 4);
    for (let y = -RAND; y < hg.h + RAND; y++) {
      for (let x = -RAND; x < hg.b + RAND; x++) for (let k = 0; k < 4; k++) hoeken[((y + RAND) * b + x + RAND) * 4 + k] = rekenHoek(hg, x, y, k);
    }
    lijsten.set(hg, { versie: hg.versie || 0, hoeken });
    return hoeken;
  }
  // De hoogte van het eiland op punt (vx, vy) van de kaart (een hoekpunt van tegel (x, y) is (x, y) tot (x + 1, y + 1)):
  // de grond, een meer of een rivier op zijn peil, en de zee op 0. Voor de hoekpunten van de kaart en `RAND` tegels
  // eromheen uit één lijst, eens per hoogte uitgerekend (T.eilandStuk); het eiland komt uit zijn nummer, dus de lijst
  // wordt niet bewaard. Een ander punt (het midden van een huis) vraagt hij het eiland zelf.
  const eilandLijsten = new WeakMap();
  function eilandOp(hg, vx, vy) {
    const { zaad, x0, y0 } = hg.eiland;
    const n = hg.b + 2 * RAND + 1;
    const opRooster = Number.isInteger(vx) && Number.isInteger(vy) && vx >= -RAND && vy >= -RAND && vx <= hg.b + RAND && vy <= hg.h + RAND;
    if (!opRooster) return Math.max(0, T.eilandStuk(T.eilandVan(zaad), x0 + vx - 0.5, y0 + vy - 0.5, 1, 1).hoogte[0]);
    let lijst = eilandLijsten.get(hg);
    if (!lijst) {
      lijst = T.eilandStuk(T.eilandVan(zaad), x0 - RAND - 0.5, y0 - RAND - 0.5, n, hg.h + 2 * RAND + 1).hoogte;
      eilandLijsten.set(hg, lijst);
    }
    return Math.max(0, lijst[(vy + RAND) * n + vx + RAND]);
  }

  T.hoekHoogte = function (w, x, y, k) {
    const hg = w && w.hoogte;
    if (!hg) return 0;
    // het landschap loopt door, ook buiten de kaart
    if (x < -RAND || y < -RAND || x >= hg.b + RAND || y >= hg.h + RAND) return rekenHoek(hg, x, y, k);
    return hoekenLijst(hg)[((y + RAND) * (hg.b + 2 * RAND) + x + RAND) * 4 + k];
  };
  function rekenHoek(hg, x, y, k) {
    const vx = x + (k === 1 || k === 2 ? 1 : 0);
    const vy = y + (k >= 2 ? 1 : 0);
    const helling = hg.hellingen[sleutel(x, y)];
    const niveau = helling ? helling[k] : niveauVan(hg, x, y);
    return glooiingOp(hg, vx, vy) + niveau * hg.trede;
  }
  T.hoekHoogten = (w, x, y) => [T.hoekHoogte(w, x, y, 0), T.hoekHoogte(w, x, y, 1), T.hoekHoogte(w, x, y, 2), T.hoekHoogte(w, x, y, 3)];

  // De hoogte op een punt in de wereld (het midden van tegel (x, y) is (x, y)): op een van de twee driehoeken van zijn
  // tegel (noord-oost-zuid of noord-zuid-west), net als de muis ze ziet (T.naarWereldOp).
  T.hoogteOp = function (w, px, py) {
    if (!w || !w.hoogte) return 0;
    const x = Math.round(px);
    const y = Math.round(py);
    const u = px - (x - 0.5);
    const v = py - (y - 0.5);
    const [n, o, z, ws] = T.hoekHoogten(w, x, y);
    // de lijn van noord (0, 0) naar zuid (1, 1) deelt de tegel: rechts ervan (u > v) de oostdriehoek
    return u >= v ? n + (o - n) * u + (z - o) * v : n + (z - ws) * u + (ws - n) * v;
  };

  // Is tegel (x, y) schuin (niet alle vier de hoeken even hoog)?
  T.isSchuin = function (w, x, y) {
    if (!w || !w.hoogte) return false;
    const hg = w.hoogte;
    if (x < -RAND || y < -RAND || x >= hg.b + RAND || y >= hg.h + RAND) {
      const h = T.hoekHoogten(w, x, y);
      return h[0] !== h[1] || h[1] !== h[2] || h[2] !== h[3];
    }
    const l = hoekenLijst(hg);
    const i = ((y + RAND) * (hg.b + 2 * RAND) + x + RAND) * 4;
    return l[i] !== l[i + 1] || l[i + 1] !== l[i + 2] || l[i + 2] !== l[i + 3];
  };

  // Waar een punt op de grond op het scherm komt: zoals T.naarScherm, maar met de hoogte eraf.
  T.naarSchermOp = function (w, x, y) {
    const p = T.naarScherm(x, y);
    if (w && w.hoogte) p.y -= T.hoogteOp(w, x, y);
    return p;
  };

  // En terug, voor de muis: welke tegel ligt onder schermpunt (sx, sy)? Een tegel op een heuvel ligt hoger in beeld
  // dan T.naarWereld denkt, dus kijkt het van voor naar achter langs de tegels die daar kunnen liggen, en neemt de
  // voorste waarvan de schuine ruit het punt bevat. Geeft een punt in de wereld, zoals T.naarWereld.
  T.naarWereldOp = function (w, sx, sy) {
    const vlak = T.naarWereld(sx, sy);
    if (!w || !w.hoogte) return vlak;
    const hoogst = IN().groot.hoog + IN().midden.hoog + 4 * w.hoogte.trede;
    const stappen = Math.ceil(hoogst / 32) + 2; // een hoogte van 32 pixels is één tegel naar voren (x en y elk +1)
    let beste = null;
    for (let s = -stappen; s <= stappen; s++) { // een dal ligt lager in beeld, een heuvel hoger
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1]]) {
        const x = Math.round(vlak.x) + s + dx;
        const y = Math.round(vlak.y) + s + dy;
        const raak = inRuit(w, x, y, sx, sy);
        if (raak && (!beste || x + y > beste.x + beste.y)) beste = { x, y, u: raak.u, v: raak.v };
      }
    }
    if (!beste) return vlak;
    return { x: beste.x - 0.5 + beste.u, y: beste.y - 0.5 + beste.v };
  };
  // Ligt schermpunt (sx, sy) in de schuine ruit van tegel (x, y)? Dan waar (u, v tussen 0 en 1), anders null.
  function inRuit(w, x, y, sx, sy) {
    const h = T.hoekHoogten(w, x, y);
    const p = HOEK.map(([dx, dy], k) => {
      const q = T.naarScherm(x + dx, y + dy);
      return [q.x, q.y - h[k]];
    });
    // twee driehoeken: noord-oost-zuid en noord-zuid-west, met (u, v) per hoek
    const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (const [a, b, c] of [[0, 1, 2], [0, 2, 3]]) {
      const l = bary(p[a], p[b], p[c], sx, sy);
      if (!l) continue;
      return { u: l[0] * uv[a][0] + l[1] * uv[b][0] + l[2] * uv[c][0], v: l[0] * uv[a][1] + l[1] * uv[b][1] + l[2] * uv[c][1] };
    }
    return null;
  }
  function bary(a, b, c, x, y) {
    const opp = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (Math.abs(opp) < 1e-9) return null;
    const l0 = ((b[0] - x) * (c[1] - y) - (b[1] - y) * (c[0] - x)) / opp;
    const l1 = ((c[0] - x) * (a[1] - y) - (c[1] - y) * (a[0] - x)) / opp;
    const l2 = 1 - l0 - l1;
    const E = -1e-6;
    return l0 >= E && l1 >= E && l2 >= E ? [l0, l1, l2] : null;
  }

  // Hoe licht een schuin vlak is: 1 als het vlak ligt, lichter naar de zon (linksboven op het scherm: in de wereld uit
  // het westen), donkerder ervan af. p, q, r zijn [x, y, hoogte in pixels].
  const ZON = (() => {
    const l = [-0.75, -0.15, 1];
    const n = Math.hypot(...l);
    return l.map((v) => v / n);
  })();
  T.helderheidVanVlak = function (p, q, r) {
    const a = [q[0] - p[0], q[1] - p[1], (q[2] - p[2]) / 32];
    const b = [r[0] - p[0], r[1] - p[1], (r[2] - p[2]) / 32];
    let n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    if (n[2] < 0) n = n.map((v) => -v);
    const d = (n[0] * ZON[0] + n[1] * ZON[1] + n[2] * ZON[2]) / Math.hypot(...n);
    const f = 1 + (d / ZON[2] - 1) * 1.6;
    return f < 0.5 ? 0.5 : f > 1.35 ? 1.35 : f;
  };

  // Hoe licht de grond op hoekpunt (vx, vy) is (1 op een vlak stuk), uit hoe hij daar helt: de hoogte van het hoekpunt is
  // het gemiddelde van de hoeken van de vier tegels die er samenkomen (bij een wand dus de helft van de trede). Voor het
  // licht dat zacht over een tegel verloopt (js/tekenen.js).
  T.lichtOpHoekpunt = function (w, vx, vy) {
    const hp = (px, py) => (T.hoekHoogte(w, px - 1, py - 1, 2) + T.hoekHoogte(w, px, py - 1, 3) + T.hoekHoogte(w, px, py, 0) + T.hoekHoogte(w, px - 1, py, 1)) / 4;
    const hx = (hp(vx + 1, vy) - hp(vx - 1, vy)) / 2;
    const hy = (hp(vx, vy + 1) - hp(vx, vy - 1)) / 2;
    return T.helderheidVanVlak([0, 0, 0], [1, 0, hx], [0, 1, hy]);
  };

  // De wanden van tegel (x, y): aan zijn zuid- en oostkant (de kanten die je ziet), waar hij hoger ligt dan zijn buur.
  // Elk { kant, van: [x, y], tot: [x, y] (de rand in de wereld), boven: [h, h], onder: [h, h], soort }.
  // Een rotswand waar een richel stopt, een begroeide wal elders.
  T.wandenVan = function (w, x, y) {
    if (!w || !w.hoogte) return [];
    const uit = [];
    for (const kant of ['zuid', 'oost']) {
      const nx = kant === 'oost' ? x + 1 : x;
      const ny = kant === 'zuid' ? y + 1 : y;
      if (nx >= w.b || ny >= w.h) continue;
      const [k1, k2] = kant === 'zuid' ? [3, 2] : [1, 2];
      const [b1, b2] = kant === 'zuid' ? [0, 1] : [0, 3];
      const boven = [T.hoekHoogte(w, x, y, k1), T.hoekHoogte(w, x, y, k2)];
      const onder = [T.hoekHoogte(w, nx, ny, b1), T.hoekHoogte(w, nx, ny, b2)];
      if (boven[0] - onder[0] < 0.5 && boven[1] - onder[1] < 0.5) continue;
      const hg = w.hoogte;
      const rots = niveauVan(hg, x, y) > niveauVan(hg, nx, ny) && !hg.hellingen[sleutel(x, y)];
      uit.push({
        kant,
        van: [x + HOEK[k1][0], y + HOEK[k1][1]],
        tot: [x + HOEK[k2][0], y + HOEK[k2][1]],
        boven,
        onder,
        soort: rots ? 'rots' : 'wal',
      });
    }
    return uit;
  };

  // ---------------------------------------------------------------- wat de hoogte doet (vraag 121, stap 2)
  // Marcel, 8 okt: "Akkoord" (op het plan: niet door een wand, wel over een helling; niet bouwen op steile grond; een
  // heuvel houdt het zicht tegen; een heuvel voor iemand dekt hem af; wie hoog staat, ziet verder).

  // Kan wie op tegel (x1, y1) staat een stap zetten naar zijn buur (x2, y2)? Niet door een wand: waar de rand die ze delen
  // aan de ene kant hoger ligt dan aan de andere (een rotswand of een wal, T.wandenVan). Wel over een helling en de
  // glooiing, want daar delen ze hun hoeken. Een schuine stap gaat over het hoekpunt dat ze delen, en om de hoek langs
  // een van de twee tegels ernaast, zoals om een muur (js/pad.js). Op een kaart zonder hoogte altijd.
  T.kanStappen = function (w, x1, y1, x2, y2) {
    if (!w || !w.hoogte) return true;
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx && dy) {
      if (!hoekpuntGelijk(w, x1, y1, x2, y2)) return false;
      return (randOpen(w, x1, y1, x2, y1) && randOpen(w, x2, y1, x2, y2)) || (randOpen(w, x1, y1, x1, y2) && randOpen(w, x1, y2, x2, y2));
    }
    return randOpen(w, x1, y1, x2, y2);
  };
  // De hoeken aan de rand tussen twee buren (recht naast elkaar): [hoek van a, hoek van b] voor elk eind.
  const RAND_HOEKEN = {
    '1,0': [[1, 0], [2, 3]], // b ligt oost van a: a's oost- en zuidhoek tegen b's noord- en westhoek
    '-1,0': [[0, 1], [3, 2]],
    '0,1': [[3, 0], [2, 1]], // b ligt zuid van a: a's west- en zuidhoek tegen b's noord- en oosthoek
    '0,-1': [[0, 3], [1, 2]],
  };
  function randOpen(w, x1, y1, x2, y2) {
    if (x1 === x2 && y1 === y2) return true;
    for (const [ka, kb] of RAND_HOEKEN[(x2 - x1) + ',' + (y2 - y1)]) {
      if (Math.abs(T.hoekHoogte(w, x1, y1, ka) - T.hoekHoogte(w, x2, y2, kb)) >= 0.5) return false;
    }
    return true;
  }
  // Het hoekpunt dat twee schuine buren delen: even hoog aan beide kanten?
  function hoekpuntGelijk(w, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    // de hoek van a naar b toe, en de hoek van b terug
    const hoek = (sx, sy) => (sx < 0 ? (sy < 0 ? 0 : 3) : sy < 0 ? 1 : 2);
    return Math.abs(T.hoekHoogte(w, x1, y1, hoek(dx, dy)) - T.hoekHoogte(w, x2, y2, hoek(-dx, -dy))) < 0.5;
  }

  // Zien (vraag 121, stap 2): ligt er een heuvel (of de rand van een richel) tussen wie kijkt en wat hij ziet? Van oog tot
  // oog (`oog` boven de grond aan beide kanten, zodat het twee kanten op hetzelfde is), en de grond ertussen om de halve
  // tegel. Op een kaart zonder hoogte nooit.
  T.heuvelTussen = function (w, a, b) {
    if (!w || !w.hoogte) return false;
    const oog = IN().oog;
    const ha = T.hoogteOp(w, a.x, a.y) + oog;
    const hb = T.hoogteOp(w, b.x, b.y) + oog;
    const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (T.hoogteOp(w, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t) > ha + (hb - ha) * t) return true;
    }
    return false;
  };
  // Hoeveel verder wie op `van` staat `naar` ziet, omdat hij hoger staat: een tegel per `verderPer` pixels.
  T.verderVanBoven = function (w, van, naar) {
    if (!w || !w.hoogte) return 0;
    return Math.max(0, (T.hoogteOp(w, van.x, van.y) - T.hoogteOp(w, naar.x, naar.y)) / IN().verderPer);
  };

  // Afdekken (vraag 121, stap 2): welke tegels liggen zo hoog dat ze op het scherm iets achter zich afdekken? Een tegel
  // dekt af als zijn rand op het scherm hoger komt dan de voeten van wie op een tegel achter hem staat (tot twee rijen
  // terug), en wel de hoek die recht onder die voeten ligt: links (west) voor wie links erachter staat, de noordhoek
  // voor wie recht erachter staat, rechts (oost) voor wie rechts erachter staat. Dat is de rand van een richel, en een steile helling; de zachte glooiing
  // haalt het nooit. js/tekenen.js tekent zo'n tegel nog eens over wat erachter staat. Eén keer per hoogte (`versie`).
  const dekkerLijsten = new WeakMap();
  T.dektAf = function (w, x, y) {
    const hg = w && w.hoogte;
    if (!hg || x < 0 || y < 0 || x >= hg.b || y >= hg.h) return false;
    let l = dekkerLijsten.get(hg);
    if (!l || l.versie !== (hg.versie || 0)) {
      l = { versie: hg.versie || 0, dekt: new Uint8Array(hg.b * hg.h) };
      const HH = T.naarScherm(1, 0).y; // een halve tegel hoog op het scherm (16)
      const voeten = (bx, by) => (bx + by) * HH - T.hoogteOp(w, bx, by);
      for (let ty = 0; ty < hg.h; ty++) {
        for (let tx = 0; tx < hg.b; tx++) {
          const h = T.hoekHoogten(w, tx, ty);
          // op het scherm: de noordhoek een halve rij terug, oost en west op de rij van de tegel
          const noord = (tx + ty - 1) * HH - h[0];
          const oost = (tx + ty) * HH - h[1];
          const west = (tx + ty) * HH - h[3];
          let dekt = false;
          for (const [i, j, rand] of [[1, 0, west], [0, 1, oost], [1, 1, noord], [2, 1, west], [1, 2, oost], [2, 2, noord]]) {
            if (rand < voeten(tx - i, ty - j) - 2) dekt = true;
          }
          l.dekt[ty * hg.b + tx] = dekt ? 1 : 0;
        }
      }
      dekkerLijsten.set(hg, l);
    }
    return l.dekt[y * hg.b + x] === 1;
  };

  // Bouwen (vraag 121, stap 2): een gebouw komt op vlakke grond. Waar het komt, maakt de bouwer de grond vlak
  // (T.egaliseer): de plek met een looppad eromheen wordt een vlak stuk, zoals de maker de huizen van het begin legt, en
  // het land glooit er in `vrijRond` tegels naartoe. Is het daar te steil (meer dan `steil` pixels per tegel, of een wand
  // of een helling op de plek), dan bouwt niemand er (T.teSteil, in T.waaromPastHetNiet en voor een erf).
  // `plek`: { x, y, b, h }, de voet van het gebouw (of het erf). Het vlakke stuk is de voet met een rand van `rand` tegels,
  // in hoekpunten (tegel (x, y) heeft zijn noordhoek op hoekpunt (x, y), zoals in glooiingOp en de vlakke stukken van de
  // maker).
  const vlakVan = (plek, rand) => ({ x0: plek.x - rand, y0: plek.y - rand, x1: plek.x + plek.b + rand, y1: plek.y + plek.h + rand });
  function hoekpuntenVan(v, doe) {
    for (let vy = v.y0; vy <= v.y1; vy++) for (let vx = v.x0; vx <= v.x1; vx++) doe(vx, vy);
  }
  const randVanPlek = () => Math.max(0, T.GEBOUWEN_INSTELLINGEN.looppad - 1);
  T.teSteil = function (w, plek) {
    if (!w || !w.hoogte) return false;
    const hg = w.hoogte;
    const rand = randVanPlek();
    const niv = niveauVan(hg, plek.x, plek.y);
    for (let y = plek.y - rand; y < plek.y + plek.h + rand; y++) {
      for (let x = plek.x - rand; x < plek.x + plek.b + rand; x++) {
        if (hg.hellingen[sleutel(x, y)] || niveauVan(hg, x, y) !== niv) return true;
      }
    }
    let laag = Infinity;
    let hoog = -Infinity;
    hoekpuntenVan(vlakVan(plek, rand), (vx, vy) => {
      const h = glooiingOp(hg, vx, vy);
      if (h < laag) laag = h;
      if (h > hoog) hoog = h;
    });
    return hoog - laag > IN().steil * (Math.max(plek.b, plek.h) + 2 * rand);
  };
  // Maak de grond onder een nieuw gebouw vlak: op de gemiddelde hoogte van wat er lag. Het nieuwe stuk gaat voor wat er
  // al lag (glooiingOp neemt het eerste vlakke stuk), en raakt geen ander gebouw: daar blijft een looppad tussen
  // (T.looppadOm, js/gebouwen.js), en het stuk is een tegel smaller dan het looppad. `zoalsBij`: een tegel { x, y } waarvan de
  // grond blijft zoals hij ligt (een huis dat doorgroeit, blijft waar het stond). Geeft het vlakke stuk, of null.
  T.egaliseer = function (w, plek, zoalsBij) {
    if (!w || !w.hoogte) return null;
    const hg = w.hoogte;
    const v = vlakVan(plek, randVanPlek());
    let som = 0;
    let n = 0;
    hoekpuntenVan(v, (vx, vy) => {
      som += glooiingOp(hg, vx, vy);
      n++;
    });
    const vlak = { ...v, h: zoalsBij ? glooiingOp(hg, zoalsBij.x, zoalsBij.y) : Math.round(som / n) };
    hg.vlakken.unshift(vlak);
    // de lijst van de hoeken: alleen opnieuw waar het nieuwe stuk iets verandert (de hele lijst kost een seconde)
    const l = lijsten.get(hg);
    const oud = hg.versie || 0;
    hg.versie = oud + 1;
    if (l && l.versie === oud) {
      const r = IN().vrijRond + 1;
      const bl = hg.b + 2 * RAND;
      for (let y = Math.max(-RAND, vlak.y0 - r); y < Math.min(hg.h + RAND, vlak.y1 + r); y++) {
        for (let x = Math.max(-RAND, vlak.x0 - r); x < Math.min(hg.b + RAND, vlak.x1 + r); x++) {
          for (let k = 0; k < 4; k++) l.hoeken[((y + RAND) * bl + x + RAND) * 4 + k] = rekenHoek(hg, x, y, k);
        }
      }
      l.versie = hg.versie;
    }
    return vlak;
  };

  // ---------------------------------------------------------------- de maker legt de hoogte

  // Uit het plan van de maker (js/maker.js): het nummer van het land (het landschap), het dorp op een vlakte, de vlakke
  // stukken (een huis met zijn looppad, het water), en een richel met een rotswand bij de rotsen, met een helling erop.
  // Geeft wat in `w.hoogte` komt: alleen dat, want de glooiing zelf is een rekensom (glooiingOp). `w`: de kaart van het
  // plan, als die er al is: dan komt de helling waar je erop en eraf kunt lopen (vraag 121, stap 2).
  T.legHoogte = function (plan, w) {
    const I = IN();
    const B = plan.b;
    const H = plan.h;
    const r = T.dobbelsteen((Math.imul(plan.zaad >>> 0, 2654435761) ^ 0x9e3779b9) >>> 0);
    const tussen = (a, b) => a + (b - a) * r();
    const cx = plan.plein.reduce((s, p) => s + p[0], 0) / plan.plein.length;
    const cy = plan.plein.reduce((s, p) => s + p[1], 0) / plan.plein.length;
    const hg = { trede: I.trede, zaad: plan.zaad, b: B, h: H, midden: [cx, cy], dorpHoogte: 0, vlakken: [], niveau: {}, hellingen: {} };
    // op het eiland is het land dat van het eiland (vraag 117, 2b)
    if (plan.eiland) hg.eiland = { zaad: plan.eiland.zaad, x0: plan.eiland.x0, y0: plan.eiland.y0 };
    hg.dorpHoogte = Math.round(landOp(hg, cx, cy));
    // de hoogte van een plek zonder de vlakke stukken: daarop komt een vlak stuk te liggen
    const vrijOp = (vx, vy, alleenGroot) => {
      const groot = alleenGroot && !hg.eiland;
      const h = landOp(hg, vx, vy, groot) + (groot ? hg.dorpHoogte - landOp(hg, cx, cy, true) : 0);
      return hg.dorpHoogte + (h - hg.dorpHoogte) * glad(I.vlakteVan, I.vlakteTot, Math.hypot(vx - cx, vy - cy));
    };
    // de huizen, met hun looppad, op de hoogte van hun midden (de hoekpunten van hun tegels)
    // Huizen waarvan het looppad elkaar raakt, liggen samen op één hoogte, anders lag een van beide scheef.
    const lp = T.GEBOUWEN_INSTELLINGEN.looppad;
    const huizen = plan.huizen.map((h) => ({ x0: h.x - lp, y0: h.y - lp, x1: h.x + h.b + lp, y1: h.y + h.d + lp }));
    // het plein ook, op de hoogte van het dorp (een huis dat eraan raakt, komt op dezelfde hoogte)
    const px = plan.plein.map((p) => Math.round(p[0]));
    const py = plan.plein.map((p) => Math.round(p[1]));
    huizen.unshift({ x0: Math.min(...px) - 1, y0: Math.min(...py) - 1, x1: Math.max(...px) + 2, y1: Math.max(...py) + 2, plein: true });
    const groep = huizen.map((_, i) => i);
    const wortel = (i) => (groep[i] === i ? i : (groep[i] = wortel(groep[i])));
    const raken = (a, b) => a.x0 <= b.x1 + 1 && b.x0 <= a.x1 + 1 && a.y0 <= b.y1 + 1 && b.y0 <= a.y1 + 1;
    for (let i = 0; i < huizen.length; i++) for (let j = i + 1; j < huizen.length; j++) if (raken(huizen[i], huizen[j])) groep[wortel(i)] = wortel(j);
    const som = new Map();
    huizen.forEach((v, i) => {
      const g = wortel(i);
      const [t, n] = som.get(g) || [0, 0];
      som.set(g, [t + vrijOp((v.x0 + v.x1) / 2, (v.y0 + v.y1) / 2), n + 1]);
    });
    const metPlein = wortel(0);
    huizen.forEach((v, i) => {
      const [t, n] = som.get(wortel(i));
      v.h = wortel(i) === metPlein ? hg.dorpHoogte : Math.round(t / n);
      delete v.plein;
      hg.vlakken.push(v);
    });
    // het water, in stukken langs een rij hoekpunten, op de hoogte van de grote glooiing (een beek daalt zo met het dal mee)
    for (let vy = 0; vy <= H; vy++) {
      for (let vx = 0; vx <= B; vx++) {
        if (plan.grond[vy][vx] !== 'w') continue;
        let tot = vx;
        while (tot + 1 <= B && plan.grond[vy][tot + 1] === 'w') tot++;
        const v = { x0: vx - 1, y0: vy - 1, x1: tot + 1, y1: vy + 1 };
        v.h = Math.round(vrijOp((vx + tot) / 2, vy, true));
        hg.vlakken.push(v);
        vx = tot;
      }
    }

    // De richel bij de rotsen: niveau 1, met een helling naar het dorp toe; alleen waar geen vlak stuk in de buurt ligt.
    const vrijVanVlak = (vx, vy) => hg.vlakken.every((v) => Math.max(v.x0 - vx, 0, vx - v.x1) >= I.vrijRond || Math.max(v.y0 - vy, 0, vy - v.y1) >= I.vrijRond);
    for (const k of (plan.rotsen || []).slice(0, 2)) {
      const straal = tussen(I.richel[0], I.richel[1]);
      const fase = r() * Math.PI * 2;
      const tegels = [];
      for (let y = Math.floor(k.y - straal - 1); y <= Math.ceil(k.y + straal + 1); y++) {
        for (let x = Math.floor(k.x - straal - 1); x <= Math.ceil(k.x + straal + 1); x++) {
          if (x < 1 || y < 1 || x >= B - 1 || y >= H - 1) continue;
          const hoek = Math.atan2(y - k.y, x - k.x);
          const rr = straal * (0.85 + 0.15 * Math.sin(hoek * 3 + fase));
          if (Math.hypot(x - k.x, y - k.y) > rr) continue;
          if ([[0, 0], [1, 0], [0, 1], [1, 1]].every(([dx, dy]) => vrijVanVlak(x + dx, y + dy))) tegels.push([x, y]);
        }
      }
      if (tegels.length < 12) continue;
      const mag = new Set(tegels.map(([x, y]) => sleutel(x, y)));
      for (const t of mag) hg.niveau[t] = 1;
      // twee keer gladstrijken: een uitsteeksel eraf en een inham dicht, zodat de wand niet rafelt
      for (let ronde = 0; ronde < 2; ronde++) {
        for (const t of mag) {
          const [x, y] = t.split(',').map(Number);
          const buren = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => hg.niveau[sleutel(x + dx, y + dy)]).length;
          if (hg.niveau[t] && buren <= 1) delete hg.niveau[t];
          else if (!hg.niveau[t] && buren >= 3) hg.niveau[t] = 1;
        }
      }
      legHelling(hg.niveau, hg.hellingen, k, cx, cy, I.hellingBreed, B, H, w);
    }
    return hg;
  };

  // De helling de richel op: aan de zuid- of oostkant (de kant die je ziet), het dichtst bij het dorp. Een helling
  // ligt buiten de richel: zijn twee hoeken aan de kant van de richel liggen een trede hoger. Met de kaart erbij (`w`)
  // alleen waar je op de helling kunt staan, en eronder ook: een struik of een boom aan de voet maakte er een doodlopende
  // helling van (land 5).
  function legHelling(niveau, hellingen, k, cx, cy, breed, B, H, w) {
    let beste = null;
    for (const s of Object.keys(niveau)) {
      const [x, y] = s.split(',').map(Number);
      for (const kant of ['zuid', 'oost']) {
        const bx = kant === 'oost' ? x + 1 : x;
        const by = kant === 'zuid' ? y + 1 : y;
        // de helling is `breed` tegels langs de rand; alle moeten naast de richel liggen, en zelf niet op de richel
        const langs = kant === 'zuid' ? [1, 0] : [0, 1];
        let past = true;
        for (let i = 0; i < breed; i++) {
          const hx = bx + langs[0] * i;
          const hy = by + langs[1] * i;
          const rx = x + langs[0] * i;
          const ry = y + langs[1] * i;
          if (hx >= B - 1 || hy >= H - 1 || niveau[hx + ',' + hy] || !niveau[rx + ',' + ry]) past = false;
          // de voet: de tegel eronder
          const vx = kant === 'oost' ? hx + 1 : hx;
          const vy = kant === 'zuid' ? hy + 1 : hy;
          if (w && past && (!T.isBegaanbaar(w, hx, hy) || !T.isBegaanbaar(w, vx, vy) || !T.isBegaanbaar(w, rx, ry))) past = false;
        }
        if (!past) continue;
        const d = Math.hypot(bx - cx, by - cy);
        if (!beste || d < beste.d) beste = { bx, by, kant, langs, d };
      }
    }
    if (!beste) return;
    for (let i = 0; i < breed; i++) {
      const hx = beste.bx + beste.langs[0] * i;
      const hy = beste.by + beste.langs[1] * i;
      // noord, oost, zuid, west: de kant van de richel een trede hoger
      hellingen[hx + ',' + hy] = beste.kant === 'zuid' ? [1, 1, 0, 0] : [1, 0, 0, 1];
    }
  }

  // Gladde ruis tussen -0,5 en 0,5.
  function ruis(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = hasj(xi, yi);
    const b = hasj(xi + 1, yi);
    const c = hasj(xi, yi + 1);
    const d = hasj(xi + 1, yi + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy - 0.5;
  }
  function hasj(x, y) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
})(globalThis.Spel = globalThis.Spel || {});
