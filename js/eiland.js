// Het eiland: de kaartenmaker (ontwerp/werklijst.md, vraag 117; Marcel, 7 okt: "Uiteindelijk wil ik een random map
// generator met alles", en 8 okt: "Ik wil 1 aaneengesloten landschap", "B 1", en "Grijs is goed, en ja begin met de plaat").
//
// Eén eiland van 2500 bij 2500 tegels uit één nummer, gemaakt zoals een schilder werkt: eerst met grove streken waar de
// zee, de bergrug en de rivieren komen, dan elk blaadje. Het is één landschap; de schets zie je nooit.
// - De schets (T.maakEiland): het eiland in vakken van 8 bij 8 tegels, met wat het hele eiland moet kennen: waar het
//   water heen stroomt (rivieren die in zee uitkomen, meren in de kommen), de plekken voor de dorpen, het kasteel en de
//   stad, en de wegen ertussen. Uit het nummer, en niet bewaard: hetzelfde nummer maakt hem opnieuw.
// - Het detail (T.eilandStuk): per tegel een rekensom uit het nummer en de schets: de hoogte (met de dalen die de rivieren
//   uitslijten), het water, de wegen, de streek en de bomen. Voor elk stuk te vragen, zodat het spel later het land maakt
//   aan de rand van de mist (vraag 117: "de mist en een kaart die meegroeit").
//
// Alleen optellen, vermenigvuldigen, delen, wortels en afronden, geen sinus, macht of hypot: zo maakt elke browser uit
// hetzelfde nummer hetzelfde eiland.
//
// Het spel gebruikt het nog niet (dat is stap 2: je land komt van het eiland); nu tekent alleen de plaat ermee
// (gereedschap/pixelart/eiland-plaat.cjs). De hoogte is in pixels, zoals in js/hoogte.js (een trede is 32); de zee ligt
// op 0. Een tegel (x, y) ligt met x naar rechtsonder en y naar linksonder in beeld, dus de camera kijkt vanaf de kant waar
// x en y groot zijn.
(function (T) {
  'use strict';

  T.EILAND_INSTELLINGEN = {
    maat: 2500, // tegels, van kust tot kust (Marcel, 4 okt: "2500x2500 is goed")
    vak: 8, // een vak van de schets, in tegels
    // De kust: hoe ver het land reikt (in delen van de halve maat), hoe grillig met baaien en kapen, hoe verbogen, hoe
    // langgerekt het eiland mag zijn, en hoe grillig de kustlijn op de maat van tegels. Op de eerste `strand` landheid
    // (een paar tegels) loopt het land `helling` keer zo snel op: het strand.
    kust: { straal: 0.74, grillig: 0.34, verbogen: 0.22, rek: [1, 1.4], fijn: 0.012, strand: 0.01, helling: 900, zee: 700 },
    laagland: 240, // zo hoog loopt het land van de kust naar binnen op (pixels, bij volle landheid)
    vrijeKust: 0.16, // tot deze landheid (zo'n tachtig tegels van de kust) komen de heuvels en bergen pas op
    // De bergrug (Marcel, 8 okt: "B 1"): hoe lang (deel van het eiland), hoe breed (tegels van de kam tot de voet), hoe
    // hoog (pixels), hoe verbogen, en zijn passen: hoe diep (deel van de hoogte) en hoe breed (deel van zijn lengte).
    bergrug: { lengte: [0.6, 0.85], breed: [180, 250], hoog: 1250, verbogen: 110, passen: [2, 3], pasDiepte: [0.6, 0.78], pasBreed: [0.035, 0.055] },
    // De heuvels: hoe hoog, hoe breed een heuvel (tegels), en hoe groot de streken zijn waar het heuvelt of vlak blijft.
    heuvels: { hoog: 430, golf: 320, streek: 1000 },
    // De fijne glooiing, zoals die van js/hoogte.js (midden en klein), maar als gradiënt-ruis.
    fijn: { midden: { hoog: 46, golf: 26 }, klein: { hoog: 9, golf: 7 } },
    // Het water: zoveel vakken regen komen samen voor er een rivier stroomt, hoe breed hij dan wordt (tegels, met de wortel
    // van zijn water), hoe breed zijn dal (tegels: vast en per tegel rivier), en hoe hij slingert.
    rivier: { vanaf: 320, breed: [1, 0.07], dal: [14, 4], bochten: [1.5, 0.9], golf: [36, 5] },
    // De meren: van alle kommen worden alleen de grootste een meer (zo diep en zo groot minstens, en zoveel per eiland);
    // door de rest slijt de rivier zich een weg naar buiten, zoals in een echt landschap.
    // Een meer staat niet hoger dan `maxDiepte` boven zijn bodem, en niet breder dan `maxVakken`: anders staat het lager,
    // en slijt de rivier zijn uitloop tot daar.
    meer: { diepte: 3, minDiepte: 24, minVakken: 4, aantal: 7, maxDiepte: 70, maxVakken: 900 },
    // De streken: de zes wildernissen van de landkaart (js/land.js) en de kust (Marcel, 8 okt: "D Nee voor nu prima").
    streek: {
      duinen: 70, // tot zoveel tegels van de zee liggen duinen, waar de ruis ze legt
      rots: { helling: 11, vanaf: 420, hoogte: 900 }, // hoger, of steiler (pixels per tegel) boven `vanaf`: rots
      veen: 0.77, // zo nat, en vlak en laag: veen
      broek: 0.56, // zo nat, langs een rivier of meer: broek
      zand: 0.56, // zo zandig, en droog: heide (en het zandigst en droogst: het zand)
      woud: 0.5, // boven deze bosrijkheid: woud
    },
    // Hoe vaak er een boom op een tegel staat, per streek.
    bomen: { woud: 0.6, broek: 0.38, kampen: 0.05, heide: 0.025, veen: 0.03, duinen: 0.012, zand: 0.006, rots: 0.03 },
    // De plekken: hoeveel dorpen (een per speler, tot zes, en een paar die zichzelf besturen; vraag 61 en 63), hoe ver ze
    // minstens uit elkaar liggen (tegels), en wat een dorp nodig heeft om te groeien (vraag 117, C; Marcel: "moeilijke
    // plek mag ook, kunnen we als hard modus later doen?"): vlak binnen `vlakStraal` tegels, droog binnen `droog`,
    // niet te hoog, water binnen `water`, minstens een deel `open` land voor akkers, en naar de camera toe niet hoger dan
    // `camera` pixels binnen `cameraVer` tegels.
    plekken: { dorpen: 8, afstand: 430, vlak: 46, vlakStraal: 40, droog: 24, hoogst: 460, water: 80, open: 0.25, camera: 150, cameraVer: 96 },
    // De wegen: wat een stap kost (een vak = 1), en hoeveel goedkoper een bestaande weg is.
    wegen: {
      helling: [0.5, 0.08], // per pixel per tegel, en in het kwadraat
      streek: { woud: 0.6, veen: 1.2, broek: 1.0, rots: 2.5, duinen: 0.4, zand: 0.2, heide: 0.1, strand: 0.3, kampen: 0 },
      brug: [6, 0.8], // een rivier oversteken: vast, en per tegel breedte
      langsRivier: 3, // een vak met een rivier erin volgen
      bestaand: 0.35, // een vak waar al een weg ligt
      breed: 1.2, // halve breedte op de tegels
    },
  };
  const IN = () => T.EILAND_INSTELLINGEN;

  // De streken, op volgorde: een tegel heeft er één (T.eilandStuk). Het water ook, zodat één getal per tegel volstaat.
  T.EILAND_STREKEN = ['zee', 'meer', 'rivier', 'strand', 'duinen', 'kampen', 'woud', 'heide', 'zand', 'veen', 'broek', 'rots'];
  const S = {};
  T.EILAND_STREKEN.forEach((naam, i) => (S[naam] = i));
  const GEEN = 255; // geen water

  // ---- ruis -------------------------------------------------------------------------------------------------------

  // Gradiënt-ruis op een driehoeksrooster (simplex), tussen -1 en 1: geen hokjes zoals de waarde-ruis van js/hoogte.js.
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const R2 = Math.SQRT1_2;
  const GRAD = [1, 0, -1, 0, 0, 1, 0, -1, R2, R2, -R2, R2, R2, -R2, -R2, -R2];
  function hasj(i, j, z) {
    let h = Math.imul(i | 0, 374761393) ^ Math.imul(j | 0, 668265263) ^ Math.imul(z | 0, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1103515245);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function hoekje(i, j, x, y, z) {
    let t = 0.5 - x * x - y * y;
    if (t <= 0) return 0;
    const g = (hasj(i, j, z) & 7) * 2;
    t *= t;
    return t * t * (GRAD[g] * x + GRAD[g + 1] * y);
  }
  function simplex(x, y, z) {
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - i + t;
    const y0 = y - j + t;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = 1 - i1;
    return 70 * (hoekje(i, j, x0, y0, z) + hoekje(i + i1, j + j1, x0 - i1 + G2, y0 - j1 + G2, z) + hoekje(i + 1, j + 1, x0 - 1 + 2 * G2, y0 - 1 + 2 * G2, z));
  }
  // Een paar lagen ruis op elkaar, elke laag twee keer zo fijn, half zo hoog en een kwart slag anders gedraaid (een
  // driehoek van 3, 4 en 5), zodat er geen raster en geen voorkeursrichting overblijft. Ongeveer tussen -1 en 1.
  function lagen(x, y, z, n) {
    let som = 0;
    let amp = 1;
    let totaal = 0;
    for (let k = 0; k < n; k++) {
      som += amp * simplex(x, y, z + k * 1013);
      totaal += amp;
      const nx = 0.8 * x - 0.6 * y;
      y = (0.6 * x + 0.8 * y) * 2.03 - 9.7;
      x = nx * 2.03 + 17.1;
      amp *= 0.5;
    }
    return som / totaal;
  }
  // Richels: de kammen van de ruis, scherp bovenaan, zoals bergen (tussen 0 en 1). Een fijnere laag telt vooral op een kam.
  function richels(x, y, z, n) {
    let som = 0;
    let amp = 1;
    let totaal = 0;
    let gewicht = 1;
    for (let k = 0; k < n; k++) {
      let r = 1 - Math.abs(simplex(x, y, z + k * 977));
      r *= r * gewicht;
      gewicht = r < 1 ? r : 1;
      som += amp * r;
      totaal += amp;
      const nx = 0.8 * x - 0.6 * y;
      y = (0.6 * x + 0.8 * y) * 2.03 + 5.3;
      x = nx * 2.03 - 3.9;
      amp *= 0.5;
    }
    return som / totaal;
  }
  function glad(a, b, x) {
    const t = x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a);
    return t * t * (3 - 2 * t);
  }
  const tussenIn = (a, b, t) => a + (b - a) * t;
  // Een getal per tegel tussen 0 en 1, vast bij de plek (voor de bomen).
  const lot = (x, y, z) => hasj(x, y, z) / 4294967296;

  // ---- de vorm ------------------------------------------------------------------------------------------------------

  // Wat het lot bij een nieuw eiland kiest: de lange as, hoe langgerekt, en de bergrug met zijn passen.
  function kiesVorm(E, r) {
    const I = IN();
    const z = (E.zaad % 100003) * 7 + 1;
    let ax = r() * 2 - 1;
    let ay = r() * 2 - 1;
    const l = Math.sqrt(ax * ax + ay * ay) || 1;
    ax /= l;
    ay /= l;
    const rek = tussenIn(I.kust.rek[0], I.kust.rek[1], r());
    // de bergrug: langs de lange as, iets opzij, met een bocht
    const B = I.bergrug;
    const half = E.maat / 2;
    const reik = half * I.kust.straal * rek; // zo ver reikt het eiland langs zijn lange as
    const lengte = 2 * reik * tussenIn(B.lengte[0], B.lengte[1], r());
    const opzij = (r() * 2 - 1) * 0.22 * half * I.kust.straal;
    const bocht = (r() * 2 - 1) * 0.28 * lengte;
    // een beetje gedraaid ten opzichte van de lange as
    const draai = (r() * 2 - 1) * 0.25;
    let rx = ax - draai * ay;
    let ry = ay + draai * ax;
    const rl = Math.sqrt(rx * rx + ry * ry);
    rx /= rl;
    ry /= rl;
    const mx = half - ry * opzij;
    const my = half + rx * opzij;
    const P0 = [mx - rx * lengte / 2, my - ry * lengte / 2];
    const P2 = [mx + rx * lengte / 2, my + ry * lengte / 2];
    const P1 = [mx - ry * bocht, my + rx * bocht];
    const rug = [];
    for (let k = 0; k <= 64; k++) {
      const t = k / 64;
      const a = (1 - t) * (1 - t);
      const b = 2 * (1 - t) * t;
      const c = t * t;
      rug.push([a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1]]);
    }
    const passen = [];
    const aantal = B.passen[0] + Math.floor(r() * (B.passen[1] - B.passen[0] + 1));
    for (let k = 0; k < aantal; k++) {
      // gespreid over de rug, niet aan de uiteinden
      const t = 0.18 + 0.64 * (k + 0.2 + 0.6 * r()) / aantal;
      passen.push({ t, diepte: tussenIn(B.pasDiepte[0], B.pasDiepte[1], r()), breed: tussenIn(B.pasBreed[0], B.pasBreed[1], r()) });
    }
    E.vorm = { z, ax, ay, rek, rug, rugBreed: tussenIn(B.breed[0], B.breed[1], r()), passen };
  }

  // De landheid op tegel (x, y): boven 0 is land, onder 0 zee. Ruw 1 in het midden van het eiland, en in de buurt van de
  // kust zo'n 0,002 per tegel.
  function landheid(E, x, y) {
    const K = IN().kust;
    const V = E.vorm;
    const z = V.z;
    const half = E.maat / 2;
    const u = (x - half) / half;
    const v = (y - half) / half;
    const wu = u + K.verbogen * lagen(u * 1.3 + 3.1, v * 1.3 - 7.7, z + 11, 3);
    const wv = v + K.verbogen * lagen(u * 1.3 - 5.3, v * 1.3 + 2.9, z + 23, 3);
    const la = (wu * V.ax + wv * V.ay) / V.rek;
    const dw = -wu * V.ay + wv * V.ax;
    let c = 1 - (la * la + dw * dw) / (K.straal * K.straal);
    c += K.grillig * lagen(u * 2.2 + 1.7, v * 2.2 + 8.3, z + 37, 5);
    c += K.fijn * lagen(x / 45 + 0.3, y / 45 - 0.6, z + 41, 3);
    // aan de rand van het vierkant altijd zee: water rondom (Marcel, 4 okt), zacht en met afgeronde hoeken, zodat de kust
    // nergens langs de rand loopt
    const u2 = u * u;
    const v2 = v * v;
    const rand = Math.sqrt(Math.sqrt(u2 * u2 + v2 * v2));
    if (rand > 0.78) c -= 2.5 * glad(0.78, 1, rand);
    return c;
  }

  // Ligt tegel (x, y) aan de zee: in een vak van de zee of ernaast? Wat onder de zee ligt maar er niet aan, is land.
  function aanZee(E, x, y) {
    const vx = Math.floor(x / E.vak);
    const vy = Math.floor(y / E.vak);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const mx = vx + dx;
        const my = vy + dy;
        if (mx < 0 || my < 0 || mx >= E.n || my >= E.n || E.zee[my * E.n + mx]) return true;
      }
    }
    return false;
  }
  const LAAG = 0.02; // de landheid van een kom onder de zee midden in het land: laag en vlak

  // De bergen op tegel (x, y): de rug langs zijn kam, met richels, smaller en lager bij de passen en aan de uiteinden.
  function bergen(E, x, y) {
    const B = IN().bergrug;
    const V = E.vorm;
    const d = tussenVak(E, E.rugAfstand, x, y);
    const t = tussenVak(E, E.rugLangs, x, y);
    const breed = V.rugBreed * (0.8 + 0.25 * simplex(t * 5 + 0.5, 3.3, V.z + 67));
    if (d >= breed) return 0;
    let pas = glad(0, 0.12, t) * glad(0, 0.12, 1 - t);
    for (const p of V.passen) {
      const q = (t - p.t) / p.breed;
      if (q > -1 && q < 1) {
        const b = 1 - q * q;
        pas *= 1 - p.diepte * b * b;
      }
    }
    if (pas <= 0) return 0;
    const m = 1 - glad(0, breed, d);
    const piek = 0.45 + 0.55 * richels(x / 150 + 1.9, y / 150 - 3.7, V.z + 61, 5);
    return B.hoog * m * m * pas * piek;
  }

  // De grove hoogte op tegel (x, y) in pixels, zonder de fijne glooiing en de dalen: het strand, het land dat naar binnen
  // oploopt, de heuvels en de bergen. `c` is de landheid (landheid hierboven), om niet twee keer te rekenen.
  function grof(E, x, y, c) {
    const I = IN();
    const K = I.kust;
    if (c <= 0) return c * K.zee;
    const z = E.vorm.z;
    const H = I.heuvels;
    let h = I.laagland * (c < 0.8 ? c : 0.8);
    h += H.hoog * heuveligOp(z, x, y) * (0.5 + 0.5 * lagen(x / H.golf + 9.1, y / H.golf + 4.4, z + 81, 5));
    h += bergen(E, x, y);
    return (c < K.strand ? c : K.strand) * K.helling + h * glad(0, I.vrijeKust, c);
  }
  // Waar het heuvelt (1) en waar het land vlak blijft (0): grote streken.
  function heuveligOp(z, x, y) {
    const s = IN().heuvels.streek;
    return glad(-0.35, 0.45, lagen(x / s + 5.5, y / s - 2.5, z + 71, 3));
  }
  // De fijne glooiing (zoals midden en klein in js/hoogte.js), zwakker waar het vlak is.
  function fijn(z, x, y, heuvelig) {
    const F = IN().fijn;
    return (0.3 + 0.7 * heuvelig) * (F.midden.hoog * simplex(x / F.midden.golf + 0.7, y / F.midden.golf - 4.1, z + 111)) + F.klein.hoog * simplex(x / F.klein.golf + 2.2, y / F.klein.golf + 6.6, z + 113);
  }

  // ---- de schets ----------------------------------------------------------------------------------------------------

  // Een veld per vak, tussen de middens van de vakken in gelezen.
  function tussenVak(E, veld, x, y) {
    const n = E.n;
    let fx = (x - E.vak / 2) / E.vak;
    let fy = (y - E.vak / 2) / E.vak;
    if (fx < 0) fx = 0;
    else if (fx > n - 1.000001) fx = n - 1.000001;
    if (fy < 0) fy = 0;
    else if (fy > n - 1.000001) fy = n - 1.000001;
    const i = Math.floor(fx);
    const j = Math.floor(fy);
    const tx = fx - i;
    const ty = fy - j;
    const k = j * n + i;
    const a = veld[k];
    const b = veld[k + 1];
    const c = veld[k + n];
    const d = veld[k + n + 1];
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  }
  const middenVan = (E, k) => [(k % E.n) * E.vak + E.vak / 2, Math.floor(k / E.n) * E.vak + E.vak / 2];

  // Een binaire hoop op getallen, voor het water, de afstanden en de wegen van de schets (honderdduizend vakken).
  function nieuweHoop() {
    return { s: new Float64Array(1024), w: new Int32Array(1024), n: 0 };
  }
  function erbij(H, s, w) {
    if (H.n === H.s.length) {
      const s2 = new Float64Array(H.n * 2);
      const w2 = new Int32Array(H.n * 2);
      s2.set(H.s);
      w2.set(H.w);
      H.s = s2;
      H.w = w2;
    }
    let i = H.n++;
    while (i > 0) {
      const o = (i - 1) >> 1;
      if (H.s[o] <= s) break;
      H.s[i] = H.s[o];
      H.w[i] = H.w[o];
      i = o;
    }
    H.s[i] = s;
    H.w[i] = w;
  }
  function eraf(H) {
    const w = H.w[0];
    H.laatste = H.s[0];
    const n = --H.n;
    const s = H.s[n];
    const v = H.w[n];
    let i = 0;
    for (;;) {
      let k = 2 * i + 1;
      if (k >= n) break;
      if (k + 1 < n && H.s[k + 1] < H.s[k]) k++;
      if (H.s[k] >= s) break;
      H.s[i] = H.s[k];
      H.w[i] = H.w[k];
      i = k;
    }
    H.s[i] = s;
    H.w[i] = v;
    return w;
  }
  const BUREN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  // Afstand in tegels vanaf de vakken in `bronnen` (een vak, de afstand erheen, en wat het meedraagt), zo ver als `tot`.
  // Wat een bron meedraagt (een waterpeil, een breedte) gaat mee naar wie hij het dichtst bij is.
  function afstandVanaf(E, bronnen, tot, magDoor) {
    const N = E.n * E.n;
    const d = new Float32Array(N).fill(1e9);
    const van = new Int32Array(N).fill(-1);
    const H = nieuweHoop();
    for (const [k, a, i] of bronnen) {
      if (a < d[k]) {
        d[k] = a;
        van[k] = i;
        erbij(H, a, k);
      }
    }
    const n = E.n;
    const stap = E.vak;
    while (H.n) {
      const k = eraf(H);
      if (H.laatste > d[k]) continue;
      if (d[k] > tot) break;
      const x = k % n;
      const y = (k - x) / n;
      for (const [dx, dy] of BUREN) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const b = ny * n + nx;
        if (magDoor && !magDoor(b)) continue;
        const nd = d[k] + (dx && dy ? stap * Math.SQRT2 : stap);
        if (nd < d[b]) {
          d[b] = nd;
          van[b] = van[k];
          erbij(H, nd, b);
        }
      }
    }
    return { d, van };
  }

  // De bergrug als afstand tot zijn kam (en hoe ver langs de kam), per vak, met de kam een beetje verbogen.
  function legRug(E) {
    const B = IN().bergrug;
    const V = E.vorm;
    const N = E.n * E.n;
    E.rugAfstand = new Float32Array(N);
    E.rugLangs = new Float32Array(N);
    const rug = V.rug;
    // wat verder dan dit van de rug ligt, krijgt geen berg (de breedte, de bocht in de kam, en ruim)
    const ver = IN().bergrug.breed[1] * 1.3 + B.verbogen * 1.5;
    let bx0 = Infinity;
    let bx1 = -Infinity;
    let by0 = Infinity;
    let by1 = -Infinity;
    for (const [x, y] of rug) {
      bx0 = Math.min(bx0, x - ver);
      bx1 = Math.max(bx1, x + ver);
      by0 = Math.min(by0, y - ver);
      by1 = Math.max(by1, y + ver);
    }
    for (let k = 0; k < N; k++) {
      const [px0, py0] = middenVan(E, k);
      if (px0 < bx0 || px0 > bx1 || py0 < by0 || py0 > by1) {
        E.rugAfstand[k] = 1e6;
        E.rugLangs[k] = 0.5;
        continue;
      }
      const px = px0 + B.verbogen * lagen(px0 / 420 + 1.1, py0 / 420 - 2.3, V.z + 91, 2);
      const py = py0 + B.verbogen * lagen(px0 / 420 - 6.1, py0 / 420 + 4.7, V.z + 93, 2);
      let best = 1e18;
      let langs = 0;
      for (let s = 0; s < rug.length - 1; s++) {
        const [ax, ay] = rug[s];
        const bx = rug[s + 1][0] - ax;
        const by = rug[s + 1][1] - ay;
        let u = ((px - ax) * bx + (py - ay) * by) / (bx * bx + by * by);
        u = u < 0 ? 0 : u > 1 ? 1 : u;
        const dx = px - ax - u * bx;
        const dy = py - ay - u * by;
        const dd = dx * dx + dy * dy;
        if (dd < best) {
          best = dd;
          langs = (s + u) / (rug.length - 1);
        }
      }
      E.rugAfstand[k] = Math.sqrt(best);
      E.rugLangs[k] = langs;
    }
  }

  // De hoogte en de landheid per vak (in het midden), de zee (wat aan de rand vastzit), en het hoofdland.
  function legLand(E) {
    const N = E.n * E.n;
    E.landheid = new Float32Array(N);
    E.hoogte = new Float32Array(N);
    for (let k = 0; k < N; k++) {
      const [x, y] = middenVan(E, k);
      const c = landheid(E, x, y);
      E.landheid[k] = c;
      E.hoogte[k] = grof(E, x, y, c);
    }
    // de zee: water dat aan de rand van het vierkant vastzit (een kom onder 0 midden in het land wordt een meer)
    const n = E.n;
    E.zee = new Uint8Array(N);
    const rij = [];
    for (let k = 0; k < N; k++) {
      const x = k % n;
      const y = (k - x) / n;
      if ((x === 0 || y === 0 || x === n - 1 || y === n - 1) && E.landheid[k] <= 0) {
        E.zee[k] = 1;
        rij.push(k);
      }
    }
    while (rij.length) {
      const k = rij.pop();
      const x = k % n;
      const y = (k - x) / n;
      for (const [dx, dy] of BUREN) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const b = ny * n + nx;
        if (!E.zee[b] && E.landheid[b] <= 0) {
          E.zee[b] = 1;
          rij.push(b);
        }
      }
    }
    // een kom onder de zee midden in het land is geen zee, maar laag, vlak land (en wordt hij diep genoeg, een meer)
    for (let k = 0; k < N; k++) {
      if (!E.zee[k] && E.landheid[k] <= 0) {
        E.landheid[k] = LAAG;
        E.hoogte[k] = grof(E, ...middenVan(E, k), LAAG);
      }
    }
    // het hoofdland: het grootste stuk land (de eilandjes ervoor tellen niet mee voor de plekken en de wegen)
    E.hoofdland = new Uint8Array(N);
    const stuk = new Int32Array(N).fill(-1);
    let grootste = -1;
    let grootte = 0;
    for (let k0 = 0; k0 < N; k0++) {
      if (E.zee[k0] || stuk[k0] >= 0) continue;
      stuk[k0] = k0;
      const rij2 = [k0];
      let tel = 0;
      while (rij2.length) {
        const k = rij2.pop();
        tel++;
        const x = k % n;
        const y = (k - x) / n;
        for (const [dx, dy] of BUREN) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
          const b = ny * n + nx;
          if (!E.zee[b] && stuk[b] < 0) {
            stuk[b] = k0;
            rij2.push(b);
          }
        }
      }
      if (tel > grootte) {
        grootte = tel;
        grootste = k0;
      }
    }
    for (let k = 0; k < N; k++) if (stuk[k] === grootste) E.hoofdland[k] = 1;
  }

  // Waar het water heen stroomt: vanaf de zee het land in, steeds het laagste vak eerst (priority-flood), zodat elk vak
  // een weg naar zee heeft, en een kom volloopt tot hij overloopt: een meer. Dan de regen van elk vak naar beneden
  // opgeteld: waar genoeg samenkomt, stroomt een rivier.
  function legWater(E) {
    const I = IN();
    const n = E.n;
    const N = n * n;
    E.peil = new Float32Array(N);
    E.afwaarts = new Int32Array(N).fill(-1);
    const volgorde = new Int32Array(N);
    let vi = 0;
    const gezien = new Uint8Array(N);
    const H = nieuweHoop();
    for (let k = 0; k < N; k++) {
      if (E.zee[k]) {
        gezien[k] = 1;
        E.peil[k] = E.hoogte[k];
        erbij(H, E.peil[k], k);
      }
    }
    while (H.n) {
      const k = eraf(H);
      volgorde[vi++] = k;
      const x = k % n;
      const y = (k - x) / n;
      for (const [dx, dy] of BUREN) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const b = ny * n + nx;
        if (gezien[b]) continue;
        gezien[b] = 1;
        const p = E.peil[k] + 0.01;
        E.peil[b] = E.hoogte[b] > p ? E.hoogte[b] : p;
        E.afwaarts[b] = k;
        erbij(H, E.peil[b], b);
      }
    }
    // de regen, van boven naar beneden opgeteld (in de bergen regent het meer)
    E.afvoer = new Float32Array(N);
    for (let q = vi - 1; q >= 0; q--) {
      const k = volgorde[q];
      if (E.zee[k]) continue;
      E.afvoer[k] += 1 + Math.max(0, E.hoogte[k]) / 700;
      const a = E.afwaarts[k];
      if (a >= 0) E.afvoer[a] += E.afvoer[k];
    }
    // de kommen: waar het water boven de grond zou staan, met hun peil (het hoogste: waar het overloopt), hun diepte en
    // hoe groot ze zijn
    const kom = new Int32Array(N).fill(-1);
    const kommen = [];
    for (let k0 = 0; k0 < N; k0++) {
      if (E.zee[k0] || kom[k0] >= 0 || E.peil[k0] - E.hoogte[k0] <= I.meer.diepte) continue;
      const id = kommen.length;
      const K = { id, peil: -1e9, diepte: 0, vakken: [] };
      kommen.push(K);
      kom[k0] = id;
      const rij = [k0];
      while (rij.length) {
        const k = rij.pop();
        K.vakken.push(k);
        if (E.peil[k] > K.peil) K.peil = E.peil[k];
        if (E.peil[k] - E.hoogte[k] > K.diepte) K.diepte = E.peil[k] - E.hoogte[k];
        const x = k % n;
        const y = (k - x) / n;
        for (const [dx, dy] of BUREN) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
          const b = ny * n + nx;
          if (!E.zee[b] && kom[b] < 0 && E.peil[b] - E.hoogte[b] > I.meer.diepte) {
            kom[b] = id;
            rij.push(b);
          }
        }
      }
    }
    E.kom = kom;
    // alleen de grootste kommen worden een meer, en een te diep of te groot meer staat lager
    const meren = kommen.filter((K) => K.diepte >= I.meer.minDiepte && K.vakken.length >= I.meer.minVakken);
    meren.sort((a, b) => b.diepte * Math.sqrt(b.vakken.length) - a.diepte * Math.sqrt(a.vakken.length) || a.id - b.id);
    E.meer = new Int32Array(N).fill(-1);
    E.meren = meren.slice(0, I.meer.aantal).map((K, id) => {
      const hoogten = K.vakken.map((k) => E.hoogte[k]).sort((a, b) => a - b);
      let peil = K.peil;
      if (hoogten.length > I.meer.maxVakken) peil = Math.min(peil, hoogten[I.meer.maxVakken]);
      peil = Math.min(peil, hoogten[0] + I.meer.maxDiepte);
      let vakken = 0;
      for (const k of K.vakken) {
        if (E.hoogte[k] < peil) {
          E.meer[k] = id;
          vakken++;
        }
      }
      return { peil, kom: K.id, vakken, diepte: peil - hoogten[0] };
    });
    // het peil van het stromende water: in een meer zijn peil, en verder nooit hoger dan wat erboven stroomt, zodat een
    // rivier zich door de rand van een kom slijt in plaats van hem te vullen
    E.stroomPeil = new Float32Array(N);
    for (let k = 0; k < N; k++) E.stroomPeil[k] = E.zee[k] ? 0 : E.meer[k] >= 0 ? E.meren[E.meer[k]].peil : E.hoogte[k];
    for (let q = vi - 1; q >= 0; q--) {
      const k = volgorde[q];
      const a = E.afwaarts[k];
      if (E.zee[k] || a < 0 || E.zee[a] || E.meer[a] >= 0) continue;
      if (E.stroomPeil[k] < E.stroomPeil[a]) E.stroomPeil[a] = E.stroomPeil[k];
    }
    // en nooit lager dan waar het heen stroomt: boven een meer staat het water minstens op het peil van het meer
    for (let q = 0; q < vi; q++) {
      const k = volgorde[q];
      const a = E.afwaarts[k];
      if (E.zee[k] || a < 0 || E.zee[a]) continue;
      if (E.stroomPeil[k] < E.stroomPeil[a]) E.stroomPeil[k] = E.stroomPeil[a];
    }
  }

  // De rivieren: van elke bron of samenvloeiing tot de volgende, als lijn door de middens van de vakken, glad gemaakt
  // (met vaste uiteinden, zodat een zijrivier op de rivier blijft uitkomen) en slingerend. Elk punt: x, y, breedte, peil.
  function legRivieren(E) {
    const I = IN();
    const R = I.rivier;
    const n = E.n;
    const N = n * n;
    const isRivier = (k) => !E.zee[k] && E.afvoer[k] >= R.vanaf;
    const boven = new Uint8Array(N);
    for (let k = 0; k < N; k++) if (isRivier(k) && E.afwaarts[k] >= 0) boven[E.afwaarts[k]]++;
    E.rivier = new Uint8Array(N);
    for (let k = 0; k < N; k++) if (isRivier(k)) E.rivier[k] = 1;
    const breedte = (k) => R.breed[0] + R.breed[1] * (Math.sqrt(E.afvoer[k]) - Math.sqrt(R.vanaf));
    E.rivieren = [];
    for (let k0 = 0; k0 < N; k0++) {
      if (!isRivier(k0) || boven[k0] === 1) continue; // begin bij een bron of een samenvloeiing
      const ketting = [k0];
      let k = E.afwaarts[k0];
      while (k >= 0 && isRivier(k) && boven[k] === 1) {
        ketting.push(k);
        k = E.afwaarts[k];
      }
      if (k >= 0) ketting.push(k); // de samenvloeiing of de zee
      const laatste = ketting[ketting.length - 1];
      let punten = ketting.map((v) => {
        const [x, y] = middenVan(E, v);
        const w = breedte(E.zee[v] ? ketting[ketting.length - 2] : v);
        return [x, y, w, E.stroomPeil[v]];
      });
      if (E.zee[laatste] && punten.length >= 2) {
        // tot ver genoeg in zee, zodat de monding niet op het strand stopt
        const a = punten[punten.length - 2];
        const b = punten[punten.length - 1];
        punten[punten.length - 1] = [b[0] + (b[0] - a[0]) * 0.5, b[1] + (b[1] - a[1]) * 0.5, b[2], 0];
      }
      for (let r = 0; r < 3; r++) punten = chaikin(punten);
      punten = slinger(E, punten);
      E.rivieren.push({ punten, zee: !!E.zee[laatste] });
    }
    E.rivierIndex = indexVan(E, E.rivieren, (p) => p[2] / 2 + 1.5);
  }
  // Glad maken: elke hoek afsnijden, de uiteinden blijven (Chaikin). Een punt is [x, y, ...] en alles wordt gemengd.
  function chaikin(punten) {
    if (punten.length < 3) return punten;
    const uit = [punten[0]];
    for (let i = 0; i < punten.length - 1; i++) {
      const a = punten[i];
      const b = punten[i + 1];
      uit.push(a.map((v, j) => 0.75 * v + 0.25 * b[j]));
      uit.push(a.map((v, j) => 0.25 * v + 0.75 * b[j]));
    }
    uit.push(punten[punten.length - 1]);
    return uit;
  }
  // Laat een rivier slingeren: elk punt dwars opzij, naar ruis langs de rivier, breder bij een brede rivier, en niet bij
  // de uiteinden.
  function slinger(E, punten) {
    const R = IN().rivier;
    if (punten.length < 3) return punten;
    let s = 0;
    const lengtes = [0];
    for (let i = 1; i < punten.length; i++) {
      const dx = punten[i][0] - punten[i - 1][0];
      const dy = punten[i][1] - punten[i - 1][1];
      s += Math.sqrt(dx * dx + dy * dy);
      lengtes.push(s);
    }
    const totaal = s;
    const z = E.vorm.z + 131;
    const zout = punten[0][0] * 0.37 + punten[0][1] * 0.11;
    return punten.map((p, i) => {
      if (i === 0 || i === punten.length - 1) return p;
      const a = punten[i - 1];
      const b = punten[i + 1];
      let tx = b[0] - a[0];
      let ty = b[1] - a[1];
      const tl = Math.sqrt(tx * tx + ty * ty) || 1;
      tx /= tl;
      ty /= tl;
      const golf = R.golf[0] + R.golf[1] * p[2];
      const amp = (R.bochten[0] + R.bochten[1] * p[2]) * glad(0, 25, lengtes[i]) * glad(0, 25, totaal - lengtes[i]);
      const o = amp * simplex(lengtes[i] / golf + zout, 0.5, z);
      return [p[0] - ty * o, p[1] + tx * o, ...p.slice(2)];
    });
  }

  // Per vak de stukken lijn (van rivieren of wegen) die er dichtbij komen, om per tegel snel de dichtste te vinden.
  function indexVan(E, lijnen, marge) {
    const n = E.n;
    const N = n * n;
    const lijst = [];
    const tel = new Int32Array(N + 1);
    const vakkenVan = (a, b) => {
      const m = Math.max(marge(a), marge(b));
      const x0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - m) / E.vak));
      const x1 = Math.min(n - 1, Math.floor((Math.max(a[0], b[0]) + m) / E.vak));
      const y0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - m) / E.vak));
      const y1 = Math.min(n - 1, Math.floor((Math.max(a[1], b[1]) + m) / E.vak));
      return [x0, x1, y0, y1];
    };
    for (const l of lijnen) {
      for (let i = 0; i < l.punten.length - 1; i++) {
        const [x0, x1, y0, y1] = vakkenVan(l.punten[i], l.punten[i + 1]);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tel[y * n + x + 1]++;
      }
    }
    for (let k = 0; k < N; k++) tel[k + 1] += tel[k];
    const plek = tel.slice();
    const stukken = new Int32Array(tel[N] * 2);
    for (let li = 0; li < lijnen.length; li++) {
      const l = lijnen[li];
      for (let i = 0; i < l.punten.length - 1; i++) {
        const [x0, x1, y0, y1] = vakkenVan(l.punten[i], l.punten[i + 1]);
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            const p = plek[y * n + x]++;
            stukken[p * 2] = li;
            stukken[p * 2 + 1] = i;
          }
        }
      }
      lijst.push(l);
    }
    return { begin: tel, stukken, lijnen };
  }
  // De dichtste lijn bij (x, y) uit een index: de afstand, en de waarden van de lijn daar (breedte, peil), in `uit`.
  function dichtsteLijn(E, index, x, y, uit) {
    const vx = Math.floor(x / E.vak);
    const vy = Math.floor(y / E.vak);
    uit.d = 1e9;
    if (vx < 0 || vy < 0 || vx >= E.n || vy >= E.n) return uit;
    const k = vy * E.n + vx;
    for (let p = index.begin[k]; p < index.begin[k + 1]; p++) {
      const l = index.lijnen[index.stukken[p * 2]].punten;
      const i = index.stukken[p * 2 + 1];
      const a = l[i];
      const b = l[i + 1];
      const bx = b[0] - a[0];
      const by = b[1] - a[1];
      const ll = bx * bx + by * by;
      let u = ll > 0 ? ((x - a[0]) * bx + (y - a[1]) * by) / ll : 0;
      u = u < 0 ? 0 : u > 1 ? 1 : u;
      const dx = x - a[0] - u * bx;
      const dy = y - a[1] - u * by;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < uit.d) {
        uit.d = d;
        uit.breed = a.length > 2 ? a[2] + (b[2] - a[2]) * u : 0;
        uit.peil = a.length > 3 ? a[3] + (b[3] - a[3]) * u : 0;
      }
    }
    return uit;
  }

  // De dalen van de rivieren en de afstanden die de streken en de plekken nodig hebben, per vak: hoe ver de rivier is
  // (met zijn peil en breedte), hoe ver de zee, en hoe ver zoet water (een rivier of een meer).
  function legAfstanden(E) {
    const n = E.n;
    const N = n * n;
    // de rivieren: elk punt zegt de vakken om zich heen hoe ver het is
    const bronnen = [];
    const peilen = [];
    for (const l of E.rivieren) {
      for (const p of l.punten) {
        const x = Math.floor(p[0] / E.vak);
        const y = Math.floor(p[1] / E.vak);
        if (x < 0 || y < 0 || x >= n || y >= n) continue;
        const [mx, my] = middenVan(E, y * n + x);
        const ex = mx - p[0];
        const ey = my - p[1];
        bronnen.push([y * n + x, Math.sqrt(ex * ex + ey * ey), peilen.length]);
        peilen.push(p);
      }
    }
    const r = afstandVanaf(E, bronnen, 140);
    E.rivierAfstand = r.d;
    E.rivierPeil = new Float32Array(N);
    E.rivierBreed = new Float32Array(N);
    for (let k = 0; k < N; k++) {
      const p = r.van[k] >= 0 ? peilen[r.van[k]] : null;
      E.rivierPeil[k] = p ? p[3] : E.hoogte[k];
      E.rivierBreed[k] = p ? p[2] : 1;
      if (E.rivierAfstand[k] > 400) E.rivierAfstand[k] = 400;
    }
    const zee = [];
    const zoet = [];
    for (let k = 0; k < N; k++) {
      if (E.zee[k]) zee.push([k, 0, 0]);
      if (E.meer[k] >= 0 || E.rivier[k]) zoet.push([k, 0, 0]);
    }
    // zo ver kijken de streken (de duinen, het natte land) en de plekken (water in de buurt)
    const VER = 200;
    E.zeeAfstand = afstandVanaf(E, zee, VER).d;
    E.zoetAfstand = afstandVanaf(E, zoet, VER).d;
    for (let k = 0; k < N; k++) {
      if (E.zeeAfstand[k] > VER) E.zeeAfstand[k] = VER;
      if (E.zoetAfstand[k] > VER) E.zoetAfstand[k] = VER;
    }
  }

  // ---- het detail: de tegels ----------------------------------------------------------------------------------------

  // Alles wat een tegel is, voor een rechthoek: de hoogte (pixels), de streek (een getal uit T.EILAND_STREKEN), de weg
  // (1 een weg, 2 een brug), en of er een boom staat. Een stuk krijgt een rand van één tegel extra voor de helling.
  T.eilandStuk = function (E, x0, y0, b, h, stap = 1) {
    const I = IN();
    const ST = I.streek;
    const z = E.vorm.z;
    const B = b + 2;
    const HH = h + 2;
    const hoog = new Float32Array(B * HH);
    const water = new Uint8Array(B * HH).fill(GEEN);
    const land = new Float32Array(B * HH); // de landheid
    const nabij = new Float32Array(B * HH); // het peil van de rivier of het meer in de buurt (of -1e9)
    const rv = { d: 0, breed: 0, peil: 0 };
    for (let yy = 0; yy < HH; yy++) {
      for (let xx = 0; xx < B; xx++) {
        const x = x0 + (xx - 1) * stap;
        const y = y0 + (yy - 1) * stap;
        const i = yy * B + xx;
        let c = landheid(E, x, y);
        nabij[i] = -1e9;
        if (c <= 0) {
          if (aanZee(E, x, y)) {
            land[i] = c;
            hoog[i] = c * I.kust.zee;
            water[i] = S.zee;
            continue;
          }
          c = LAAG; // een kom onder de zee midden in het land (zie legLand)
        }
        land[i] = c;
        let g = grof(E, x, y, c);
        // het dal van de rivier: de grond zakt naar het peil van de rivier, met een vlakke vloer langs het water
        const dr = tussenVak(E, E.rivierAfstand, x, y);
        if (dr < 200) {
          const pr = tussenVak(E, E.rivierPeil, x, y);
          const wr = tussenVak(E, E.rivierBreed, x, y);
          const vloer = wr / 2 + 3;
          const f = glad(vloer, vloer + I.rivier.dal[0] + I.rivier.dal[1] * wr, dr);
          const gedaald = pr + 2 + (g - pr - 2) * f;
          if (gedaald < g) g = gedaald;
        }
        // de rivier zelf
        dichtsteLijn(E, E.rivierIndex, x, y, rv);
        const inRivier = rv.d < rv.breed / 2;
        if (rv.d < rv.breed / 2 + 8) nabij[i] = rv.peil;
        // een meer: waar de grond onder het peil van een meer in de buurt ligt
        const vx = Math.floor(x / E.vak);
        const vy = Math.floor(y / E.vak);
        let meerPeil = -1e9;
        const eigen = vx >= 0 && vy >= 0 && vx < E.n && vy < E.n ? vy * E.n + vx : -1;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const mx = vx + dx;
            const my = vy + dy;
            if (mx < 0 || my < 0 || mx >= E.n || my >= E.n) continue;
            const m = E.meer[my * E.n + mx];
            if (m < 0 || E.meren[m].peil <= meerPeil || eigen < 0) continue;
            // alleen in zijn eigen kom, of op de rand eromheen (ook waar het water er maar net boven zou staan), niet
            // voorbij de plek waar het meer overloopt
            const M = E.meren[m];
            if (E.kom[eigen] === M.kom || (E.kom[eigen] < 0 && E.hoogte[eigen] >= M.peil - I.meer.diepte - 1)) meerPeil = M.peil;
          }
        }
        if (meerPeil > nabij[i]) nabij[i] = meerPeil;
        if (g < meerPeil) {
          hoog[i] = meerPeil;
          water[i] = S.meer;
          continue;
        }
        if (inRivier) {
          hoog[i] = rv.peil;
          water[i] = S.rivier;
          continue;
        }
        // de fijne glooiing, die bij het water en de kust wegzakt
        let f = glad(0, I.vrijeKust, c);
        if (nabij[i] > -1e8) f *= glad(0, 30, g - nabij[i]);
        hoog[i] = g + f * fijn(z, x, y, heuveligOp(z, x, y));
      }
    }
    // de streek, de weg en de bomen
    const hoogte = new Float32Array(b * h);
    const streek = new Uint8Array(b * h);
    const weg = new Uint8Array(b * h);
    const boom = new Uint8Array(b * h);
    const wv = { d: 0 };
    const BO = I.bomen;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < b; xx++) {
        const x = x0 + xx * stap;
        const y = y0 + yy * stap;
        const i = (yy + 1) * B + xx + 1;
        const o = yy * b + xx;
        const hg = hoog[i];
        hoogte[o] = hg;
        dichtsteLijn(E, E.wegIndex, x, y, wv);
        if (wv.d < I.wegen.breed * (stap > 1 ? stap * 0.6 : 1)) weg[o] = water[i] !== GEEN ? 2 : 1;
        if (water[i] !== GEEN) {
          streek[o] = water[i];
          continue;
        }
        const gx = (hoog[i + 1] - hoog[i - 1]) / (2 * stap);
        const gy = (hoog[i + B] - hoog[i - B]) / (2 * stap);
        const helling = Math.sqrt(gx * gx + gy * gy);
        const s = streekOp(E, x, y, hg, helling, land[i], nabij[i], ST, z);
        streek[o] = s;
        const kans = BO[T.EILAND_STREKEN[s]] || 0;
        if (!weg[o] && kans > 0) {
          // in de kampen staan de bomen in bosjes en houtwallen
          let k = kans;
          if (s === S.kampen) k += 0.5 * glad(0.35, 0.6, simplex(x / 14 + 3.3, y / 14 - 1.4, z + 151));
          if (lot(x, y, z + 157) < k) boom[o] = 1;
        }
      }
    }
    return { x0, y0, b, h, hoogte, streek, weg, boom };
  };

  // De streek van een landtegel, uit hoe hoog, steil, nat en zandig het er is (vraag 117, D: de zes wildernissen van de
  // landkaart en de kust).
  function streekOp(E, x, y, hg, helling, c, waterPeil, ST, z) {
    const rafel = 0.035 * simplex(x / 9 + 0.5, y / 9 + 1.5, z + 161); // grillige grenzen
    const duin = simplex(x / 260 + 4.4, y / 260 - 8.8, z + 163);
    // het strand: de eerste tegels van de kust (aan zee, niet in een laagte midden in het land)
    const zeeAf = tussenVak(E, E.zeeAfstand, x, y);
    if (c < 0.004 + 0.004 * (duin + 1) + rafel * 0.05 && zeeAf < 24) return S.strand;
    if (zeeAf < ST.duinen * glad(-0.1, 0.5, duin) + 40 * rafel && hg < 90) return S.duinen;
    const R = ST.rots;
    if (hg > R.hoogte + 140 * simplex(x / 70, y / 70, z + 167) || (hg > R.vanaf && helling > R.helling + 30 * rafel)) return S.rots;
    const zoetAf = tussenVak(E, E.zoetAfstand, x, y);
    const vlakLaag = (1 - glad(40, 280, hg)) * (1 - glad(0.6, 3.5, helling));
    const nat = 0.4 + 0.35 * (1 - glad(0, 140, zoetAf)) + 0.3 * vlakLaag + 0.3 * lagen(x / 300 + 2.2, y / 300 + 7.7, z + 171, 3) + rafel;
    // het broek: in de natte, vlakke laagte langs het water, niet langs elke beek
    if (waterPeil > -1e8 && hg - waterPeil < 10 + 30 * vlakLaag && nat + 0.25 * vlakLaag > ST.broek + 0.2) return S.broek;
    if (nat > ST.veen && helling < 1.5 && hg < 320) return S.veen;
    const zandig = 0.5 + 0.5 * lagen(x / 480 - 3.1, y / 480 + 1.3, z + 173, 3) + 0.15 * glad(120, 420, hg) + rafel;
    if (zandig > ST.zand && nat < 0.62) return zandig > ST.zand + 0.17 && nat < 0.5 ? S.zand : S.heide;
    const bos = 0.5 + 0.5 * lagen(x / 260 + 6.6, y / 260 - 5.5, z + 179, 3) + 0.3 * glad(150, 650, hg) + 0.15 * glad(1, 5, helling) - 0.2 * (1 - glad(0, 90, zoetAf)) + rafel;
    if (bos > ST.woud) return S.woud;
    return S.kampen;
  }

  // ---- de streek per vak, de plekken en de wegen ---------------------------------------------------------------------

  // De streek in het midden van elk vak (voor de plekken en wat een weg kost).
  function legStreken(E) {
    const n = E.n;
    const N = n * n;
    E.streek = new Uint8Array(N);
    const ST = IN().streek;
    const z = E.vorm.z;
    for (let k = 0; k < N; k++) {
      if (E.zee[k]) {
        E.streek[k] = S.zee;
        continue;
      }
      if (E.meer[k] >= 0) {
        E.streek[k] = S.meer;
        continue;
      }
      const x = k % n;
      const y = (k - x) / n;
      const h = E.hoogte[k];
      const hx = (E.hoogte[y * n + Math.min(n - 1, x + 1)] - E.hoogte[y * n + Math.max(0, x - 1)]) / (2 * E.vak);
      const hy = (E.hoogte[Math.min(n - 1, y + 1) * n + x] - E.hoogte[Math.max(0, y - 1) * n + x]) / (2 * E.vak);
      const [mx, my] = middenVan(E, k);
      const peil = E.rivierAfstand[k] < 20 ? E.rivierPeil[k] : -1e9;
      E.streek[k] = streekOp(E, mx, my, h, Math.sqrt(hx * hx + hy * hy), E.landheid[k], peil, ST, z);
    }
  }

  // De plekken: het kasteel van de heer op een heuvel (vraag 126), de stad aan de monding van de grootste rivier, en de
  // dorpen, ver genoeg uit elkaar, elk op een plek waar een dorp kan groeien (vraag 117, C). Jouw dorp kiest het lot.
  function legPlekken(E, r) {
    const P = IN().plekken;
    const n = E.n;
    const N = n * n;
    const v = E.vak;
    const isNat = (k) => E.zee[k] || E.meer[k] >= 0 || E.rivier[k];
    const binnen = (x, y) => x >= 0 && y >= 0 && x < n && y < n;
    const vlakStraal = Math.round(P.vlakStraal / v);
    const droog = Math.round(P.droog / v);
    // het midden van het hoofdland
    let sx = 0;
    let sy = 0;
    let sn = 0;
    for (let k = 0; k < N; k++) {
      if (!E.hoofdland[k]) continue;
      const [x, y] = middenVan(E, k);
      sx += x;
      sy += y;
      sn++;
    }
    const midden = [sx / sn, sy / sn];
    const straal = Math.sqrt(sn * v * v / Math.PI);
    // hoe goed een vak is voor een dorp (of -1)
    E.geschikt = new Float32Array(N).fill(-1);
    for (let k = 0; k < N; k++) {
      if (!E.hoofdland[k] || isNat(k) || E.hoogte[k] > P.hoogst) continue;
      const x = k % n;
      const y = (k - x) / n;
      const h = E.hoogte[k];
      let ok = true;
      let hobbel = 0;
      let bos = 0;
      let open = 0;
      let tel = 0;
      for (let dy = -vlakStraal; dy <= vlakStraal && ok; dy++) {
        for (let dx = -vlakStraal; dx <= vlakStraal; dx++) {
          if (dx * dx + dy * dy > vlakStraal * vlakStraal) continue;
          if (!binnen(x + dx, y + dy)) {
            ok = false;
            break;
          }
          const b = (y + dy) * n + x + dx;
          if (isNat(b)) {
            // dichtbij geen water, verder weg mag het (een dorp aan de kust of de rivier), en dan telt het niet als hobbel
            if (Math.abs(dx) <= droog && Math.abs(dy) <= droog) {
              ok = false;
              break;
            }
            continue;
          }
          const d = Math.abs(E.hoogte[b] - h);
          if (d > hobbel) hobbel = d;
          tel++;
          const s = E.streek[b];
          if (s === S.woud) bos++;
          if (s === S.kampen || s === S.heide) open++;
        }
      }
      if (!ok || hobbel > P.vlak) continue;
      // geen berg tussen het dorp en de camera (die kijkt vanaf de kant waar x en y groot zijn; vraag 124)
      const ver = Math.round(P.cameraVer / v);
      for (let s = 1; s <= ver && ok; s++) {
        for (let o = -1; o <= 1; o++) {
          const cx = x + s + o;
          const cy = y + s - o;
          if (!binnen(cx, cy)) continue;
          if (E.hoogte[cy * n + cx] - h > P.camera) ok = false;
        }
      }
      if (!ok) continue;
      const water = Math.min(E.zoetAfstand[k], E.zeeAfstand[k]);
      if (water > P.water) continue;
      // grond voor akkers: open land (de kampen of de heide), en bos in de buurt
      if (open / tel < P.open) continue;
      E.geschikt[k] = 1 - hobbel / P.vlak * 0.4 + 0.4 * (1 - water / P.water) + 0.6 * Math.min(1, bos / tel * 3) + 0.4 * open / tel;
    }
    const plekken = [];
    const afstand2 = (a, x, y) => (a.x - x) * (a.x - x) + (a.y - y) * (a.y - y);
    // het kasteel: op een heuvel die boven zijn omgeving uitsteekt, niet ver van het midden
    let best = -1;
    let bestScore = -1e9;
    for (let k = 0; k < N; k++) {
      if (!E.hoofdland[k] || isNat(k)) continue;
      const h = E.hoogte[k];
      if (h < 160 || h > 760) continue;
      const x = k % n;
      const y = (k - x) / n;
      let som = 0;
      let tel = 0;
      let top = 0;
      let nat = false;
      for (let dy = -10; dy <= 10; dy += 2) {
        for (let dx = -10; dx <= 10; dx += 2) {
          if (!binnen(x + dx, y + dy)) continue;
          const b = (y + dy) * n + x + dx;
          som += E.hoogte[b];
          tel++;
          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            top = Math.max(top, Math.abs(E.hoogte[b] - h));
            if (isNat(b)) nat = true;
          }
        }
      }
      if (nat || top > 40) continue;
      const [mx, my] = middenVan(E, k);
      const uitMidden = Math.sqrt(afstand2({ x: mx, y: my }, midden[0], midden[1])) / straal;
      const score = (h - som / tel) / 60 - 2.5 * uitMidden + 0.4 * lot(x, y, E.vorm.z + 181);
      if (score > bestScore) {
        bestScore = score;
        best = k;
      }
    }
    if (best >= 0) {
      const [x, y] = middenVan(E, best);
      plekken.push({ soort: 'kasteel', x, y });
    }
    // de stad: aan de monding van de grootste rivier, met droog land ernaast
    let monding = -1;
    for (let k = 0; k < N; k++) if (E.zee[k] && E.afvoer[k] > 0 && (monding < 0 || E.afvoer[k] > E.afvoer[monding])) monding = k;
    if (monding >= 0) {
      const mx0 = monding % n;
      const my0 = (monding - mx0) / n;
      let stad = -1;
      let stadScore = -1e9;
      for (let dy = -8; dy <= 8; dy++) {
        for (let dx = -8; dx <= 8; dx++) {
          const x = mx0 + dx;
          const y = my0 + dy;
          if (!binnen(x, y)) continue;
          const k = y * n + x;
          if (!E.hoofdland[k] || isNat(k)) continue;
          let hobbel = 0;
          let nat = false;
          for (let ey = -2; ey <= 2; ey++) {
            for (let ex = -2; ex <= 2; ex++) {
              if (!binnen(x + ex, y + ey)) continue;
              const b = (y + ey) * n + x + ex;
              hobbel = Math.max(hobbel, Math.abs(E.hoogte[b] - E.hoogte[k]));
              if (Math.abs(ex) <= 1 && Math.abs(ey) <= 1 && E.rivier[b]) nat = true;
            }
          }
          if (nat) continue;
          const score = -Math.sqrt(dx * dx + dy * dy) - hobbel / 15;
          if (score > stadScore) {
            stadScore = score;
            stad = k;
          }
        }
      }
      if (stad >= 0) {
        const [x, y] = middenVan(E, stad);
        plekken.push({ soort: 'stad', x, y });
      }
    }
    // de dorpen: steeds de beste plek die ver genoeg van de rest ligt
    const kandidaten = [];
    for (let k = 0; k < N; k++) if (E.geschikt[k] >= 0) kandidaten.push(k);
    kandidaten.sort((a, b) => E.geschikt[b] - E.geschikt[a] || a - b);
    let afstand = P.afstand;
    const dorpen = [];
    while (dorpen.length < P.dorpen && afstand > P.afstand * 0.4) {
      for (const k of kandidaten) {
        if (dorpen.length >= P.dorpen) break;
        const [x, y] = middenVan(E, k);
        if (plekken.some((p) => afstand2(p, x, y) < afstand * afstand)) continue;
        const dorp = { soort: 'dorp', x, y, aard: aardVan(E, k) };
        plekken.push(dorp);
        dorpen.push(dorp);
      }
      afstand *= 0.85;
    }
    // namen, en jouw dorp
    const namen = (T.DORPSNAMEN || []).slice();
    for (let i = namen.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [namen[i], namen[j]] = [namen[j], namen[i]];
    }
    dorpen.forEach((d, i) => (d.naam = namen[i] || 'Dorp ' + (i + 1)));
    if (dorpen.length) dorpen[Math.floor(r() * dorpen.length)].jij = true;
    E.plekken = plekken;
  }
  // Wat voor plek een dorp is: aan de kust, aan een rivier, op de heide, aan de bosrand, of in de kampen.
  function aardVan(E, k) {
    if (E.zeeAfstand[k] <= 64) return 'kust';
    if (E.zoetAfstand[k] <= 48) return 'rivier';
    const n = E.n;
    const x = k % n;
    const y = (k - x) / n;
    const tel = {};
    let alle = 0;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        if (x + dx < 0 || y + dy < 0 || x + dx >= n || y + dy >= n) continue;
        const s = T.EILAND_STREKEN[E.streek[(y + dy) * n + x + dx]];
        tel[s] = (tel[s] || 0) + 1;
        alle++;
      }
    }
    if (((tel.heide || 0) + (tel.zand || 0)) / alle > 0.35) return 'heide';
    if ((tel.woud || 0) / alle > 0.2) return 'bosrand';
    return 'kampen';
  }

  // De wegen: van het kasteel naar de stad en naar elk dorp (zijn wegen; de heer en de inner komen erover), en van elk
  // dorp naar zijn buur. Een weg zoekt de dalen en de passen, steekt een rivier over waar hij smal is, en loopt mee met
  // een weg die er al ligt. Wat samen loopt, wordt één weg: de wegen zijn lijnen tussen de kruisingen.
  function legWegen(E) {
    const W = IN().wegen;
    const n = E.n;
    const N = n * n;
    const opWeg = new Uint8Array(N);
    const stukken = new Set();
    const kosten = (a, b, schuin) => {
      if (E.zee[b] || E.meer[b] >= 0) return Infinity;
      const dh = Math.abs(E.hoogte[b] - E.hoogte[a]) / (E.vak * (schuin ? Math.SQRT2 : 1));
      let c = (schuin ? Math.SQRT2 : 1) * (1 + W.helling[0] * dh + W.helling[1] * dh * dh);
      c += W.streek[T.EILAND_STREKEN[E.streek[b]]] || 0;
      if (E.rivier[b]) c += E.rivier[a] ? W.langsRivier : W.brug[0] + W.brug[1] * E.rivierBreed[b];
      if (E.hoogte[b] > 700) c += (E.hoogte[b] - 700) / 100;
      return opWeg[b] ? c * W.bestaand : c;
    };
    const vakVan = (p) => Math.min(n - 1, Math.floor(p.y / E.vak)) * n + Math.min(n - 1, Math.floor(p.x / E.vak));
    const afstand2 = (a, x, y) => (a.x - x) * (a.x - x) + (a.y - y) * (a.y - y);
    const zoek = (van, naar) => {
      const g = new Float64Array(N).fill(Infinity);
      const terug = new Int32Array(N).fill(-1);
      const H = nieuweHoop();
      const nx0 = naar % n;
      const ny0 = (naar - nx0) / n;
      const schat = (k) => {
        const x = k % n;
        const y = (k - x) / n;
        const dx = x - nx0;
        const dy = y - ny0;
        return Math.sqrt(dx * dx + dy * dy) * W.bestaand;
      };
      g[van] = 0;
      erbij(H, schat(van), van);
      while (H.n) {
        const k = eraf(H);
        if (k === naar) break;
        if (H.laatste > g[k] + schat(k) + 1e-9) continue;
        const x = k % n;
        const y = (k - x) / n;
        for (const [dx, dy] of BUREN) {
          const bx = x + dx;
          const by = y + dy;
          if (bx < 0 || by < 0 || bx >= n || by >= n) continue;
          const b = by * n + bx;
          const ng = g[k] + kosten(k, b, dx && dy);
          if (ng < g[b]) {
            g[b] = ng;
            terug[b] = k;
            erbij(H, ng + schat(b), b);
          }
        }
      }
      if (terug[naar] < 0 && naar !== van) return null;
      const pad = [naar];
      while (pad[pad.length - 1] !== van) pad.push(terug[pad[pad.length - 1]]);
      return pad.reverse();
    };
    const leg = (pad) => {
      if (!pad) return;
      for (let i = 0; i < pad.length; i++) {
        opWeg[pad[i]] = 1;
        if (i) stukken.add(pad[i - 1] < pad[i] ? pad[i - 1] + ',' + pad[i] : pad[i] + ',' + pad[i - 1]);
      }
    };
    const kasteel = E.plekken.find((p) => p.soort === 'kasteel');
    const stad = E.plekken.find((p) => p.soort === 'stad');
    const dorpen = E.plekken.filter((p) => p.soort === 'dorp');
    if (kasteel) {
      const k = vakVan(kasteel);
      const doelen = [stad, ...dorpen].filter(Boolean);
      doelen.sort((a, b) => afstand2(a, kasteel.x, kasteel.y) - afstand2(b, kasteel.x, kasteel.y));
      for (const d of doelen) leg(zoek(k, vakVan(d)));
    }
    // elk dorp naar zijn dichtste buur
    for (const d of dorpen) {
      let buur = null;
      for (const e of dorpen) if (e !== d && (!buur || afstand2(e, d.x, d.y) < afstand2(buur, d.x, d.y))) buur = e;
      if (buur) leg(zoek(vakVan(d), vakVan(buur)));
    }
    // de lijnen tussen de kruisingen
    const buren = new Map();
    for (const s of stukken) {
      const [a, b] = s.split(',').map(Number);
      if (!buren.has(a)) buren.set(a, []);
      if (!buren.has(b)) buren.set(b, []);
      buren.get(a).push(b);
      buren.get(b).push(a);
    }
    const plekVakken = new Set(E.plekken.map(vakVan));
    const isKnoop = (k) => buren.get(k).length !== 2 || plekVakken.has(k);
    const gedaan = new Set();
    const lijnen = [];
    const loop = (a, b) => {
      const ketting = [a, b];
      gedaan.add(a < b ? a + ',' + b : b + ',' + a);
      let vorige = a;
      let nu = b;
      while (!isKnoop(nu)) {
        const volgende = buren.get(nu).find((x) => x !== vorige);
        const s = nu < volgende ? nu + ',' + volgende : volgende + ',' + nu;
        if (gedaan.has(s)) break;
        gedaan.add(s);
        ketting.push(volgende);
        vorige = nu;
        nu = volgende;
      }
      let punten = ketting.map((k) => middenVan(E, k));
      for (let i = 0; i < 2; i++) punten = chaikin(punten);
      lijnen.push({ punten });
    };
    const knopen = [...buren.keys()].sort((a, b) => a - b);
    for (const a of knopen) {
      if (!isKnoop(a)) continue;
      for (const b of buren.get(a)) if (!gedaan.has(a < b ? a + ',' + b : b + ',' + a)) loop(a, b);
    }
    for (const a of knopen) for (const b of buren.get(a)) if (!gedaan.has(a < b ? a + ',' + b : b + ',' + a)) loop(a, b);
    E.wegen = lijnen;
    E.wegIndex = indexVan(E, lijnen, () => W.breed + 1);
  }

  // ---- je land op het eiland (stap 2) --------------------------------------------------------------------------------

  // Het land van b bij h tegels om een plek van het eiland, voor de maker (js/maker.js, vraag 117, stap 2): per tegel de
  // streek, de bomen en de weg, per hoekpunt de streek (de grond van de maker gaat per hoekpunt), en waar de wegen van
  // het eiland het land verlaten (`uitgangen`, op de rand van het land; die naar het kasteel heeft `kasteel`). Tegel
  // (x, y) van het land is tegel (x0 + x, y0 + y) van het eiland, en zijn hoekpunt (x, y) ligt een halve tegel
  // linksboven het midden ervan.
  T.landVanEiland = function (E, plek, b, h) {
    const x0 = Math.round(plek.x) - Math.floor(b / 2);
    const y0 = Math.round(plek.y) - Math.floor(h / 2);
    const tegels = T.eilandStuk(E, x0, y0, b, h);
    const hoeken = T.eilandStuk(E, x0 - 0.5, y0 - 0.5, b + 1, h + 1);
    // waar een weg van het eiland de rand van het land kruist
    const uit = [];
    const binnen = (q) => q[0] >= x0 - 0.5 && q[0] < x0 + b - 0.5 && q[1] >= y0 - 0.5 && q[1] < y0 + h - 0.5;
    for (const w of E.wegen) {
      for (let i = 0; i < w.punten.length - 1; i++) {
        const a = w.punten[i];
        const c = w.punten[i + 1];
        if (binnen(a) === binnen(c)) continue;
        const [p, q] = binnen(a) ? [a, c] : [c, a];
        // het punt op de rand: zo ver van binnen naar buiten als het nog binnen is
        let t0 = 0;
        let t1 = 1;
        for (let k = 0; k < 30; k++) {
          const t = (t0 + t1) / 2;
          if (binnen([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t])) t0 = t;
          else t1 = t;
        }
        const x = Math.min(b - 1, Math.max(0, Math.round(p[0] + (q[0] - p[0]) * t0 - x0)));
        const y = Math.min(h - 1, Math.max(0, Math.round(p[1] + (q[1] - p[1]) * t0 - y0)));
        if (!uit.some((u) => Math.abs(u.x - x) + Math.abs(u.y - y) < 8)) uit.push({ x, y });
      }
    }
    // welke naar het kasteel gaat: die het meest zijn kant op wijst
    const kasteel = E.plekken.find((q) => q.soort === 'kasteel');
    if (kasteel && uit.length) {
      const kx = kasteel.x - (x0 + b / 2);
      const ky = kasteel.y - (y0 + h / 2);
      const kl = Math.sqrt(kx * kx + ky * ky) || 1;
      let beste = null;
      let besteHoek = -2;
      for (const u of uit) {
        const ux = u.x - b / 2;
        const uy = u.y - h / 2;
        const ul = Math.sqrt(ux * ux + uy * uy) || 1;
        const cos = (ux * kx + uy * ky) / (ul * kl);
        if (cos > besteHoek) {
          besteHoek = cos;
          beste = u;
        }
      }
      beste.kasteel = true;
    }
    const naam = (lijst, i) => T.EILAND_STREKEN[lijst[i]];
    return {
      zaad: E.zaad,
      x0,
      y0,
      b,
      h,
      // de streek op tegel (x, y) of hoekpunt (x, y), als naam; buiten het land null
      streek: (x, y) => (x >= 0 && y >= 0 && x < b && y < h ? naam(tegels.streek, y * b + x) : null),
      hoek: (x, y) => (x >= 0 && y >= 0 && x <= b && y <= h ? naam(hoeken.streek, y * (b + 1) + x) : null),
      boom: (x, y) => x >= 0 && y >= 0 && x < b && y < h && tegels.boom[y * b + x] === 1,
      uitgangen: uit,
    };
  };

  // Het eiland van een nummer, één keer gemaakt zolang er naar hetzelfde nummer gevraagd wordt (het is uit het nummer
  // te maken, dus het hoeft niet in Spel.S).
  let laatsteEiland = null;
  T.eilandVan = function (zaad) {
    if (!laatsteEiland || laatsteEiland.zaad !== zaad) laatsteEiland = T.maakEiland(zaad);
    return laatsteEiland;
  };

  // ---- het eiland ---------------------------------------------------------------------------------------------------

  // Het eiland van nummer `zaad`: de schets, met alles wat het hele eiland moet kennen. Wat het per tegel is, vraag je
  // daarna aan T.eilandStuk. `E.tijd` zegt hoeveel milliseconden het kostte, en `E.tijden` per stap (voor de plaat, vraag 113).
  T.maakEiland = function (zaad) {
    const I = IN();
    const begin = Date.now();
    const E = { zaad, maat: I.maat, vak: I.vak, n: Math.ceil(I.maat / I.vak) };
    const r = T.dobbelsteen(zaad * 7919 + 17);
    E.tijden = {};
    const doe = (naam, f) => {
      const t = Date.now();
      f();
      E.tijden[naam] = Date.now() - t;
    };
    kiesVorm(E, r);
    doe('bergrug', () => legRug(E));
    doe('land', () => legLand(E));
    doe('water', () => legWater(E));
    doe('rivieren', () => legRivieren(E));
    doe('afstanden', () => legAfstanden(E));
    doe('streken', () => legStreken(E));
    doe('plekken', () => legPlekken(E, r));
    doe('wegen', () => legWegen(E));
    E.tijd = Date.now() - begin;
    return E;
  };
})(globalThis.Spel = globalThis.Spel || {});
