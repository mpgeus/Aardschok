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
// Wat hier staat, verandert de regels nog niet (dat is stap 2: lopen, zien, bouwen): het zegt alleen hoe hoog iets
// ligt, voor het tekenen (js/tekenen.js) en de muis (js/main.js). De maker legt de hoogte (T.legHoogte).
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
    let h = landschapOp(hg.zaad, vx, vy);
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

  // ---------------------------------------------------------------- de maker legt de hoogte

  // Uit het plan van de maker (js/maker.js): het nummer van het land (het landschap), het dorp op een vlakte, de vlakke
  // stukken (een huis met zijn looppad, het water), en een richel met een rotswand bij de rotsen, met een helling erop.
  // Geeft wat in `w.hoogte` komt: alleen dat, want de glooiing zelf is een rekensom (glooiingOp).
  T.legHoogte = function (plan) {
    const I = IN();
    const B = plan.b;
    const H = plan.h;
    const r = T.dobbelsteen((Math.imul(plan.zaad >>> 0, 2654435761) ^ 0x9e3779b9) >>> 0);
    const tussen = (a, b) => a + (b - a) * r();
    const cx = plan.plein.reduce((s, p) => s + p[0], 0) / plan.plein.length;
    const cy = plan.plein.reduce((s, p) => s + p[1], 0) / plan.plein.length;
    const hg = { trede: I.trede, zaad: plan.zaad, b: B, h: H, midden: [cx, cy], dorpHoogte: 0, vlakken: [], niveau: {}, hellingen: {} };
    hg.dorpHoogte = Math.round(landschapOp(plan.zaad, cx, cy));
    // de hoogte van een plek zonder de vlakke stukken: daarop komt een vlak stuk te liggen
    const vrijOp = (vx, vy, alleenGroot) => {
      const h = landschapOp(plan.zaad, vx, vy, alleenGroot) + (alleenGroot ? hg.dorpHoogte - landschapOp(plan.zaad, cx, cy, true) : 0);
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
      legHelling(hg.niveau, hg.hellingen, k, cx, cy, I.hellingBreed, B, H);
    }
    return hg;
  };

  // De helling de richel op: aan de zuid- of oostkant (de kant die je ziet), het dichtst bij het dorp. Een helling
  // ligt buiten de richel: zijn twee hoeken aan de kant van de richel liggen een trede hoger.
  function legHelling(niveau, hellingen, k, cx, cy, breed, B, H) {
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
