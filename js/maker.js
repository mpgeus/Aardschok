// De maker: het land van een nieuw spel (ontwerp/werklijst.md, vraag 69, C; Marcel, 30 sep 2026: "De maker nu"). Elk spel
// ligt het land anders, uit het zaad van dat spel.
//
// Sinds ronde 2 van het snoeien (stap 6, 12 okt; Marcel: "Alles wordt door spelers geplaatst") legt hij alleen nog het land
// zelf, op het eiland (js/eiland.js): het water, de heide, de rotsen, het bos en de wegen komen van het eiland, en de maker
// maakt er de open plek voor het plein bij, en op dat plein de plek van het kamp waar de kar stopt (js/begin.js). Geen
// huizen, boerderijen, akkers, herberg, meent, put of bank: dat bouwt de speler. Tot dan legde hij ook het dorp dat er al was,
// en een land zonder eiland; ze staan in git.
//
// Hij keurt zijn eigen werk (keur hieronder): kan iedereen overal komen, en staat er niets op het plein dat er niet hoort.
// Deugt het niet, dan probeert hij het met hetzelfde zaad opnieuw, en hetzelfde zaad geeft altijd hetzelfde land.
//
// T.maakGehucht(zaad, land) legt het plan (de indeling, zonder tegels) op een stuk van het eiland, T.planOpEiland(zaad) kiest
// dat stuk (jouw plek, anders die van een ander dorp), en T.kaartVanGehucht(plan) maakt er een kaart met een betekenisbestand
// van, in dezelfde vorm als een kaart uit Tiled, zodat het spel het land inleest zoals een kaart (T.laadKaart, js/kaart.js).
// T.laadGemaaktGehucht(zaad) doet alles in één keer. Een nieuw spel begint zo (T.beginOpKaart, js/gebied.js). De schets
// (gereedschap/maker/schets.cjs, npm run maker) tekent plannen als plattegrond.
//
// Hij gebruikt de regels uit js/ zelf: de dobbelsteen (T.dobbelsteen, js/dorp.js), de rand van het plein
// (T.binnenRand, js/wereld.js) en de grondtegels (T.TEGELS, tegels/tegels.js).
(function (T) {
  'use strict';

  T.MAKER_INSTELLINGEN = {
    // Op het eiland: een bruggetje is hooguit zo lang (tegels water) en kost zoveel stappen extra, zodat een weg liever om
    // het water heen loopt.
    eilandBrug: { lang: 7, kost: 12 },
    // Het lege begin (vraag 152; js/begin.js): de maker legt alleen het land met een open plek die het plein wordt; zo ver
    // om het plein is het open (tegels), en verder staat het bos van het eiland (Marcel, 11 okt: "Klein, bos dichtbij").
    leegRand: 2,
    // Zo ver om de kaart weet de rand wat het eiland er heeft (tegels; T.randVanHetEiland): zo ver tekent js/tekenen.js
    // het bos om de kaart.
    eilandRand: 16,
    // Uit zoveel zaden kiest een nieuw spel zijn land: een getal van vijf cijfers, om te onthouden.
    zaden: 99999,
    // Hoe groot het land is (vraag 112, b; Marcel, 3 okt: "Alles moet denk ik ook wijder opgezet worden").
    b: 100,
    h: 100,
    // Zo vaak probeert hij het met hetzelfde zaad, tot een plan deugt.
    pogingen: 120,
    // Losse bomen en groepjes struiken in de wei.
    losseBomen: [14, 22],
    struikgroepjes: [5, 9],
    // Een of twee rotspartijen (de tweede met deze kans): waar de steengroeve komt.
    rotsen: 0.55,
    // Wat er op een vrije tegel groeit, per soort plek (de kans per tegel). Een weide krijgt bloemen en hoog gras in
    // plekken, waar de ruis boven de grens komt.
    groei: {
      bos: { varen: 0.16, struik: 0.035, bessenStruik: 0.012, paddenstoelen: 0.03, boomstronk: 0.018, grasPol: 0.04 },
      weide: { grasPol: 0.03, struik: 0.005, kleineRots: 0.004 },
      bloemen: [0.62, 0.16],
      // hoog gras alleen aan het water, als riet: in de wei stond het als dorre stokjes
      oever: { hoogGras: 0.3 },
      heide: { grasPol: 0.035, kleineRots: 0.008 },
      // Het groen eronder (vraag 148, stap 3; Marcel, 11 okt: "duidelijk", en de heide paars): op de heide, aan het water,
      // op het water (niet in zee) en aan de bosrand. De kans per vrije tegel, met een vaste keus per tegel.
      heideGroen: { heide: 0.3, distel: 0.03, brem: 0.015 },
      oeverGroen: { lisdodde: 0.12 },
      waterGroen: { waterlelie: 0.07 },
      bosrand: { braam: 0.06 },
    },
    // Het plein, in halve maten langs u (in beeld naar rechts) en v (naar de camera).
    // Sinds vraag 127, c1 (Marcel, 6 okt: "Desnoods moeten we de afmeting van het plein aanpassen en groter maken, zodat
    // deze kan meegroeien met de afmeting van de stad") groter, met ruimte voor de markt: zo'n 260 tot 300 tegels. Eerst
    // was het 290 tot 380, maar dat kostte bouwgrond (de speeltest van 6 okt; Marcel: "plein iets kleiner").
    pleinBreed: [11.5, 12.5],
    pleinDiep: [7, 7.6],
    pleinTegels: [230, 330],
    // De eiken staan alleen achter deze lijn, in delen van de diepte van het plein vanaf zijn midden (0 is het midden, 1
    // de voorste rand): de voorkant blijft vrij voor de markt (js/markt.js, vraag 127, c1).
    eikenTot: 0.15,
  };
  const IN = () => T.MAKER_INSTELLINGEN;

  // Wat een tegel van de kaart is, terwijl de maker legt.
  const VRIJ = 0;
  const PLEIN = 1;
  const WEG = 2;
  const WATER = 3;
  const BOS = 4;

  // Een vloeiende lijn door steunpunten (Catmull-Rom), als veel korte rechte stukjes, en de afstand van een punt
  // tot zo'n lijn: dezelfde als in maak-gehucht.cjs, zodat een weg hier net zo slingert.
  function vloeiend(punten, stappen = 8) {
    const P = [punten[0], ...punten, punten[punten.length - 1]];
    const uit = [];
    for (let i = 1; i + 2 < P.length; i++) {
      for (let s = 0; s < stappen; s++) {
        const t = s / stappen;
        const f = (a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
        uit.push([f(P[i - 1][0], P[i][0], P[i + 1][0], P[i + 2][0]), f(P[i - 1][1], P[i][1], P[i + 1][1], P[i + 2][1])]);
      }
    }
    uit.push(punten[punten.length - 1]);
    return uit;
  }
  function totLijn(punten, x, y) {
    let d = 1e9;
    for (let i = 0; i + 1 < punten.length; i++) {
      const [ax, ay] = punten[i];
      const [bx, by] = punten[i + 1];
      const vx = bx - ax;
      const vy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1)));
      d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t));
    }
    return d;
  }

  // De grond op een hoekpunt van het eiland, uit zijn streek (js/eiland.js): de zee ('e'), het water van een meer of een
  // rivier ('w'), de heide ('h'), het strand, de duinen en het zand ('s', strand), het veen ('v'), het broek ('b'), en de
  // rest gras ('g'). Het strand, het veen, het broek en de zee hebben eigen tegels (tegels/kust.png; werklijst vraag 117,
  // B van 2a). De maker legt zo de grond van je land (stap 11), en de rand om de kaart die van het eiland eromheen
  // (T.randVanHetEiland).
  const GROND_VAN_STREEK = { zee: 'e', meer: 'w', rivier: 'w', heide: 'h', strand: 's', duinen: 's', zand: 's', veen: 'v', broek: 'b' };
  T.grondVanStreek = (s) => GROND_VAN_STREEK[s] || 'g';
  // Is deze grond water (de zee, een meer, een rivier)?
  const isNat = (l) => l === 'w' || l === 'e';

  // Welke grondsoorten samen in één tegel kunnen liggen: voor zo'n paar heeft tegels/rand.tsx of kust.tsx een tegel. Op
  // een hoekpunt dat naast een buur ligt waarmee het dat niet kan, wijkt de zwakke (T.passendeGrond): naast de zee wordt
  // het strand, anders gras. Het water, de zee, een weg of akker (zandpad) en de kasseien blijven liggen.
  const GROND_PAREN = new Set(['gz', 'gk', 'kz', 'gw', 'gh', 'es', 'gs', 'hs', 'gv', 'bg', 'ew']);
  T.grondPaar = (a, b) => a === b || GROND_PAREN.has(a < b ? a + b : b + a);
  T.passendeGrond = function (l, buren) {
    if ('wezk'.includes(l) || buren.every((m) => T.grondPaar(l, m))) return l;
    return buren.includes('e') ? 's' : 'g';
  };
  // Waar groeit wat op gras groeit (een boom, een struik, een rots): gras, en het veen en het broek, die tot 8 okt gras
  // waren; zo staan de bomen op het eiland waar ze stonden.
  const GROEIT = new Set(['g', 'v', 'b']);

  // Welke boom er staat waar het eiland een boom heeft: in het broek vaak een wilg, hier en daar een dode boom, en verder
  // dennen, eiken en berken. `toeval` geeft een getal van 0 tot 1: de maker loot, de rand om de kaart neemt een vaste
  // keus per tegel.
  const BOSBOMEN = ['den', 'eik', 'berk', 'den', 'eik'];
  function boomOpEiland(streek, toeval) {
    if (streek === 'broek' && toeval() < 0.5) return 'wilg';
    return toeval() < 0.03 ? 'dodeBoom' : BOSBOMEN[Math.floor(toeval() * BOSBOMEN.length)];
  }

  // De nieuwe soorten (vraag 148, a; Marcel, 9 okt: "Ja goed idee"): waar de maker een eik, een den, een wilg of een
  // struik legt, maakt een vaste keus per tegel (`hash`) er soms een soort van die bij de plek past, zonder het lot te
  // raken, zodat hij verder legt wat hij legde: op het plein een linde, aan het water een knotwilg of een els, op de heide
  // en het zand een grove den, in het bos een beuk en een hazelaar, langs de weg een populier, en in de wei een meidoorn.
  // Per plek, per soort: [andere soort, kans].
  const ANDERE_BOMEN = {
    plein: { eik: [['linde', 0.5]] },
    water: { wilg: [['knotwilg', 0.5], ['els', 0.3]], eik: [['els', 0.4]], berk: [['els', 0.4]] },
    heide: { den: [['groveDen', 0.8]], eik: [['groveDen', 0.3]], berk: [['groveDen', 0.3]] },
    bos: { eik: [['beuk', 0.35], ['linde', 0.05]], struik: [['hazelaar', 0.3]] },
    weg: { eik: [['populier', 0.6]], berk: [['populier', 0.4]] },
    wei: { eik: [['beuk', 0.15], ['linde', 0.15]], struik: [['meidoorn', 0.25], ['hazelaar', 0.1]] },
  };
  function andereBoom(soort, x, y, waar) {
    let k = hash(x, y, 821);
    for (const [ander, kans] of (ANDERE_BOMEN[waar] || {})[soort] || []) if ((k -= kans) < 0) return ander;
    return soort;
  }
  const KAN_ANDERS = new Set(Object.values(ANDERE_BOMEN).flatMap(Object.keys));
  // Wat voor plek een streek van het eiland is, voor ANDERE_BOMEN.
  const PLEK_VAN_STREEK = { woud: 'bos', kampen: 'bos', heide: 'heide', zand: 'heide', duinen: 'heide', broek: 'water', veen: 'water' };

  // Eén poging: een plan, of null met de reden waarom het niet deugde. `land` is het stuk van het eiland om jouw plek
  // (T.landVanEiland, js/eiland.js): zie bij elke stap wat daarvan komt en wat de maker erbij legt.
  function leg(zaad, poging, land) {
    const I = IN();
    const B = I.b;
    const H = I.h;
    // De bouwstijl van dit land (js/bouwstijl.js), uit zijn nummer: de huizen die jij bouwt komen in die stijl, elk in zijn
    // vier standen, zodat een huis zijn deur ook vóór het plein ernaartoe kan keren (Marcel, 4 okt, vraag 114: "D ja").
    const stijl = T.stijlVoorLand(zaad);
    const r = T.dobbelsteen((Math.imul(zaad >>> 0, 7919) ^ Math.imul(poging + 1, 104729)) >>> 0);
    const tussen = (a, b) => a + (b - a) * r();
    const schud = (lijst) => {
      const l = lijst.slice();
      for (let i = l.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [l[i], l[j]] = [l[j], l[i]];
      }
      return l;
    };
    const vak = new Uint8Array(B * H);
    let versie = 0; // gaat omhoog bij elke verandering, zodat de optelsommen hieronder weten wanneer ze opnieuw moeten
    const binnen = (x, y) => x >= 0 && y >= 0 && x < B && y < H;
    const op = (x, y) => (binnen(x, y) ? vak[y * B + x] : -1);
    const zet = (x, y, code) => {
      if (binnen(x, y)) {
        vak[y * B + x] = code;
        versie++;
      }
    };
    const mis = (waarom) => ({ mis: waarom });
    // Tellen hoeveel tegels in een vak iets zijn, in één stap: een optelsom over de hele kaart (100 bij 100, dus
    // niets), die pas opnieuw wordt opgeteld als er sinds de vorige keer iets veranderde. Zo kost "ligt hier iets van
    // dit?" even veel voor een tegel als voor een vak van honderd.
    const optelsom = (telt) => {
      const s = new Int32Array((B + 1) * (H + 1));
      for (let y = 0; y < H; y++) {
        let rij = 0;
        for (let x = 0; x < B; x++) {
          if (telt(x, y)) rij++;
          s[(y + 1) * (B + 1) + x + 1] = s[y * (B + 1) + x + 1] + rij;
        }
      }
      return (x0, y0, b, h) => {
        const x1 = Math.max(0, x0);
        const y1 = Math.max(0, y0);
        const x2 = Math.min(B, x0 + b);
        const y2 = Math.min(H, y0 + h);
        if (x2 <= x1 || y2 <= y1) return 0;
        return s[y2 * (B + 1) + x2] - s[y1 * (B + 1) + x2] - s[y2 * (B + 1) + x1] + s[y1 * (B + 1) + x1];
      };
    };
    const sommen = new Map();
    const somVan = (soorten) => {
      let masker = 0; // de soorten als bits, zodat zoeken en tellen niets hoeft te maken
      for (const s of soorten) masker |= 1 << s;
      let s = sommen.get(masker);
      if (!s || s.versie !== versie) {
        s = { versie, tel: optelsom((x, y) => (masker >> vak[y * B + x]) & 1) };
        sommen.set(masker, s);
      }
      return s.tel;
    };
    // Staat er in dit vak (met een rand eromheen) iets van deze soorten?
    const raakt = (x0, y0, b, h, rand, soorten) => somVan(soorten)(x0 - rand, y0 - rand, b + 2 * rand, h + 2 * rand) > 0;
    // Ruis: een glad veld van 0 tot 1 uit het zaad, dat over zo'n `maat` tegels golft (willekeurige waarden op een
    // rooster, glad ertussen). Voor de plekken waar de bloemen staan.
    const ruis = (maat) => {
      const nb = Math.ceil(B / maat) + 3;
      const nh = Math.ceil(H / maat) + 3;
      const rooster = new Float32Array(nb * nh);
      for (let i = 0; i < rooster.length; i++) rooster[i] = r();
      const glad = (t) => t * t * (3 - 2 * t);
      const v = (a, b) => rooster[Math.min(nh - 1, Math.max(0, b)) * nb + Math.min(nb - 1, Math.max(0, a))];
      return (x, y) => {
        const fx = x / maat + 1;
        const fy = y / maat + 1;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const tx = glad(fx - ix);
        const ty = glad(fy - iy);
        const boven = v(ix, iy) + (v(ix + 1, iy) - v(ix, iy)) * tx;
        const onder = v(ix, iy + 1) + (v(ix + 1, iy + 1) - v(ix, iy + 1)) * tx;
        return boven + (onder - boven) * ty;
      };
    };

    // ---- 1. Trekkingen die niets meer leggen ----
    // Tot ronde 2 van het snoeien (stap 6, 12 okt) koos de maker hier ook de as van de weg van rand tot rand, de kant van de
    // beek en van de uitgang, de randen van het bos en de ruis voor zijn inhammen en open plekken, en iets verderop de
    // beek zelf: voor een land zonder eiland en voor het dorp dat er al was. Het eiland doet dat nu. Maar elke trekking
    // zet de dobbelsteen een stap verder, en alles erna (het plein, het kamp, de bomen en het groen) hangt aan die
    // volgorde: haal je ze weg, dan ligt elk land, ook dat van een spel dat is bewaard, anders. Daarom worden ze nog
    // getrokken, en niet gebruikt.
    const gooiWeg = (aantal) => {
      for (let i = 0; i < aantal; i++) r();
    };
    gooiWeg(4); // de as van de weg, de kant van de beek, de kant van de uitgang, en de eerste rand van het bos
    if (r() < 0.45) gooiWeg(1); // en soms een tweede rand
    ruis(13); // de inhammen van het bos
    ruis(7); // en de open plekken erin

    // ---- 2. Het plein: in het midden, groot, open en onregelmatig ----
    // Getekend in (u, v) rond zijn midden, zoals de schets "Het plein als hart": u loopt in beeld naar rechts, v naar
    // de camera. Een ellips die golft en een beetje scheef staat.
    const cx = B / 2 + tussen(-4, 4);
    const cy = H / 2 + tussen(-4, 4);
    const naarTegel = (u, v) => [Math.round((cx + (u + v) * Math.SQRT1_2) * 10) / 10, Math.round((cy + (v - u) * Math.SQRT1_2) * 10) / 10];
    const pb = tussen(I.pleinBreed[0], I.pleinBreed[1]);
    const pd = tussen(I.pleinDiep[0], I.pleinDiep[1]);
    const scheef = tussen(-0.3, 0.3);
    const golf1 = tussen(0, Math.PI * 2);
    const golf2 = tussen(0, Math.PI * 2);
    const plein = [];
    for (let i = 0; i < 15; i++) {
      const hoek = (i / 15) * Math.PI * 2 + tussen(-0.12, 0.12);
      const g = 1 + 0.12 * Math.sin(hoek * 2 + golf1) + 0.08 * Math.sin(hoek * 3 + golf2) + tussen(-0.05, 0.05);
      const u0 = Math.cos(hoek) * pb * g;
      const v0 = Math.sin(hoek) * pd * g;
      plein.push(naarTegel(u0 * Math.cos(scheef) - v0 * Math.sin(scheef), u0 * Math.sin(scheef) + v0 * Math.cos(scheef)));
    }
    const opPlein = (x, y) => T.binnenRand(plein, x + 0.5, y + 0.5);
    let pleinTegels = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        if (opPlein(x, y)) {
          zet(x, y, PLEIN);
          pleinTegels++;
        }
      }
    }
    if (pleinTegels < I.pleinTegels[0] || pleinTegels > I.pleinTegels[1]) return mis(`het plein is ${pleinTegels} tegels`); // geen tekst

    // ---- 3. Het water: dat van het eiland ----
    gooiWeg(4); // (hier trok de maker de beek, zie stap 1)
    // Een hoekpunt is nat waar het eiland water is: de zee, een meer of een rivier. Een tegel is water als een van zijn
    // hoekpunten nat is; een bruggetje ligt over zulke tegels.
    const natHoeken = new Uint8Array((B + 1) * (H + 1));
    for (let y = 0; y <= H; y++) for (let x = 0; x <= B; x++) if (isNat(T.grondVanStreek(land.hoek(x, y)))) natHoeken[y * (B + 1) + x] = 1;
    const nat = (x, y) => x >= 0 && y >= 0 && x <= B && y <= H && natHoeken[y * (B + 1) + x] === 1;
    const naastWater = (x, y) => {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (nat(x + dx, y + dy)) return true;
      return false;
    };
    const waterTegel = (x, y) => nat(x, y) || nat(x + 1, y) || nat(x, y + 1) || nat(x + 1, y + 1);
    for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (waterTegel(x, y)) zet(x, y, WATER);
    const brug = []; // alle tegels van de bruggetjes
    const bruggen = []; // elk bruggetje met zijn richting, { as, tegels }

    // ---- 4. De wegen: die van het eiland door je land (vraag 117, stap 2) ----
    // Van elke plek waar een weg van het eiland je land verlaat (land.uitgangen), naar het plein: om het water heen, en
    // waar het smal is eroverheen met een recht bruggetje; door het bos en het veen liever niet. De uitgang is waar de weg
    // naar het kasteel gaat.
    const wegenOpEiland = () => {
      const KOST = { woud: 0.6, broek: 0.8, veen: 0.8, heide: 0.1 };
      const RICHTING = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const isWater = (x, y) => op(x, y) === WATER;
      const midden = (q) => [(q % B) + 0.5, Math.floor(q / B) + 0.5];
      const schat = (x, y) => Math.max(0, Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - 10);
      const zoek = (start) => {
        const g = new Float64Array(B * H).fill(Infinity);
        const terug = new Int32Array(B * H).fill(-1);
        const over = new Int8Array(B * H).fill(-1); // met welk bruggetje je er kwam (de richting), anders -1
        const hoop = [];
        const duw = (f, k) => {
          hoop.push([f, k]);
          for (let i = hoop.length - 1; i > 0; ) {
            const o = (i - 1) >> 1;
            if (hoop[o][0] <= hoop[i][0]) break;
            [hoop[o], hoop[i]] = [hoop[i], hoop[o]];
            i = o;
          }
        };
        const pak = () => {
          const top = hoop[0];
          const laatste = hoop.pop();
          if (hoop.length) {
            hoop[0] = laatste;
            for (let i = 0; ; ) {
              const a = 2 * i + 1;
              let k = i;
              if (a < hoop.length && hoop[a][0] < hoop[k][0]) k = a;
              if (a + 1 < hoop.length && hoop[a + 1][0] < hoop[k][0]) k = a + 1;
              if (k === i) break;
              [hoop[i], hoop[k]] = [hoop[k], hoop[i]];
              i = k;
            }
          }
          return top;
        };
        const naar = (k, q, kost, brugRichting) => {
          const ng = g[k] + kost;
          if (ng >= g[q]) return;
          g[q] = ng;
          terug[q] = k;
          over[q] = brugRichting;
          duw(ng + schat(q % B, Math.floor(q / B)), q);
        };
        const s0 = start.y * B + start.x;
        g[s0] = 0;
        duw(schat(start.x, start.y), s0);
        let doel = -1;
        while (hoop.length) {
          const [f, k] = pak();
          const x = k % B;
          const y = (k - x) / B;
          if (f > g[k] + schat(x, y) + 1e-9) continue;
          if (op(x, y) === PLEIN) {
            doel = k;
            break;
          }
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if ((!dx && !dy) || !binnen(nx, ny) || isWater(nx, ny)) continue;
              if (dx && dy && (isWater(x + dx, y) || isWater(x, y + dy))) continue;
              naar(k, ny * B + nx, (dx && dy ? Math.SQRT2 : 1) + (KOST[land.streek(nx, ny)] || 0), -1);
            }
          }
          // een bruggetje: recht over het water, als het smal is
          for (let r = 0; r < 4; r++) {
            const [dx, dy] = RICHTING[r];
            let n = 0;
            while (n <= I.eilandBrug.lang && isWater(x + dx * (n + 1), y + dy * (n + 1))) n++;
            const nx = x + dx * (n + 1);
            const ny = y + dy * (n + 1);
            if (n === 0 || n > I.eilandBrug.lang || !binnen(nx, ny) || isWater(nx, ny)) continue;
            naar(k, ny * B + nx, n + 1 + I.eilandBrug.kost, r);
          }
        }
        if (doel < 0) return null;
        const pad = [];
        for (let q = doel; q >= 0; q = terug[q]) pad.push(q);
        return { pad: pad.reverse(), over };
      };
      const lijnen = [];
      let uit = null;
      const gezien = new Set(); // de tegels van de bruggetjes die er al liggen
      for (const u of land.uitgangen) {
        // de tegel aan de rand waar de weg begint, en is die nat, dan de dichtste droge ernaast langs de rand
        const langsY = u.x === 0 || u.x === B - 1;
        let start = null;
        for (let d = 0; d <= 12 && !start; d++) {
          for (const t of [d, -d]) {
            const x = langsY ? u.x : u.x + t;
            const y = langsY ? u.y + t : u.y;
            if (!start && binnen(x, y) && !isWater(x, y)) start = { x, y };
          }
        }
        if (!start) continue;
        const z = zoek(start);
        if (!z) continue;
        // de lijn van de weg: de kaart uit aan de rand, dan om de paar tegels een steunpunt, en recht over een bruggetje
        const [sx, sy] = midden(z.pad[0]);
        const steun = [[sx + (start.x === 0 ? -1.5 : start.x === B - 1 ? 1.5 : 0), sy + (start.y === 0 ? -1.5 : start.y === H - 1 ? 1.5 : 0)]];
        let naBrug = null;
        for (let i = 0; i < z.pad.length; i++) {
          const q = z.pad[i];
          const volgende = z.pad[i + 1];
          if (volgende != null && z.over[volgende] >= 0) {
            const [dx, dy] = RICHTING[z.over[volgende]];
            const [x1, y1] = midden(q);
            const [x2, y2] = midden(volgende);
            // recht op het bruggetje af, en recht erover; wat er vlak voor lag, valt weg
            while (steun.length > 1 && Math.hypot(steun[steun.length - 1][0] - x1, steun[steun.length - 1][1] - y1) < 2.5) steun.pop();
            steun.push([x1 - dx * 2, y1 - dy * 2], [x1, y1], [x2, y2], [x2 + dx * 2, y2 + dy * 2]);
            const tegels = [];
            for (let t = 1; Math.floor(x1) + dx * t !== Math.floor(x2) || Math.floor(y1) + dy * t !== Math.floor(y2); t++) tegels.push({ x: Math.floor(x1) + dx * t, y: Math.floor(y1) + dy * t });
            if (!gezien.has(tegels[0].x + ',' + tegels[0].y)) {
              for (const t of tegels) {
                gezien.add(t.x + ',' + t.y);
                brug.push(t);
              }
              bruggen.push({ as: dx ? 'x' : 'y', tegels });
            }
            naBrug = [x2, y2];
            i++;
            continue;
          }
          const [mx, my] = midden(q);
          if (naBrug && Math.hypot(mx - naBrug[0], my - naBrug[1]) < 3.5) continue;
          if (i % 3 === 0 || i === z.pad.length - 1) steun.push([mx, my]);
        }
        lijnen.push(vloeiend(steun));
        if (!uit || u.kasteel) uit = { x: start.x, y: start.y };
      }
      if (!lijnen.length) return { mis: 'geen weg van het eiland naar het plein' }; // geen tekst
      return { wegen: lijnen, uitgang: uit };
    };
    const WEG_BREED = 0.75;
    // Welke hoekpunten binnen `breed` van een van deze lijnen liggen, in één keer: per stukje lijn alleen de hoekpunten
    // eromheen. (Per hoekpunt de hele lijn aflopen kostte de helft van de tijd van de maker.)
    const langsLijnen = (lijnen, breed) => {
      const bij = new Uint8Array((B + 1) * (H + 1));
      for (const l of lijnen) {
        for (let i = 0; i + 1 < l.length; i++) {
          const stuk = [l[i], l[i + 1]];
          const x0 = Math.max(0, Math.floor(Math.min(l[i][0], l[i + 1][0]) - breed));
          const x1 = Math.min(B, Math.ceil(Math.max(l[i][0], l[i + 1][0]) + breed));
          const y0 = Math.max(0, Math.floor(Math.min(l[i][1], l[i + 1][1]) - breed));
          const y1 = Math.min(H, Math.ceil(Math.max(l[i][1], l[i + 1][1]) + breed));
          for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) if (!bij[y * (B + 1) + x] && totLijn(stuk, x, y) < breed) bij[y * (B + 1) + x] = 1;
          }
        }
      }
      return (x, y) => x >= 0 && y >= 0 && x <= B && y <= H && bij[y * (B + 1) + x] === 1;
    };
    const aangelegd = wegenOpEiland();
    if (aangelegd.mis) return mis(aangelegd.mis);
    const wegen = aangelegd.wegen;
    const uitgang = aangelegd.uitgang;
    const opWeg = langsLijnen(wegen, WEG_BREED);
    const wegTegel = (x, y) => opWeg(x, y) || opWeg(x + 1, y) || opWeg(x, y + 1) || opWeg(x + 1, y + 1);
    for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (op(x, y) === VRIJ && wegTegel(x, y)) zet(x, y, WEG);

    // Hoeveel tegels in een vak rots van het eiland zijn, zodat de rotspartijen liever daar komen (stap 12).
    const eilandRots = optelsom((x, y) => land.streek(x, y) === 'rots');
    // Hoe ver een tegel van het plein ligt (in stappen van een koning), tot 12.
    const pleinAfstand = new Uint8Array(B * H).fill(99);
    {
      const rij = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < B; x++) {
          if (op(x, y) === PLEIN) {
            pleinAfstand[y * B + x] = 0;
            rij.push([x, y]);
          }
        }
      }
      for (let i = 0; i < rij.length; i++) {
        const [x, y] = rij[i];
        const d = pleinAfstand[y * B + x];
        if (d >= 12) continue;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (binnen(nx, ny) && pleinAfstand[ny * B + nx] > d + 1) {
              pleinAfstand[ny * B + nx] = d + 1;
              rij.push([nx, ny]);
            }
          }
        }
      }
    }
    const totPlein = (x, y) => (binnen(x, y) ? pleinAfstand[y * B + x] : 99);
    // Het vak om het plein, voor het kamp en de marskramer.
    let pleinVak = { x0: B, y0: H, x1: 0, y1: 0 };
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        if (op(x, y) !== PLEIN) continue;
        pleinVak = { x0: Math.min(pleinVak.x0, x), y0: Math.min(pleinVak.y0, y), x1: Math.max(pleinVak.x1, x), y1: Math.max(pleinVak.y1, y) };
      }
    }
    // De beste plek uit een lijst kandidaten, naar een score; het lot kiest uit de beste paar, zodat twee zaden niet op
    // dezelfde plek uitkomen.
    const besteVan = (kandidaten) => {
      if (!kandidaten.length) return null;
      kandidaten.sort((p, q) => q.score - p.score);
      return kandidaten[Math.floor(r() * Math.min(3, kandidaten.length))];
    };

    // ---- 5. Het bos van het eiland, om het open plein ----
    // Wat het plein nodig heeft, is gerooid: het plein met `leegRand` tegels eromheen (vraag 152; Marcel, 11 okt: "Klein, bos
    // dichtbij"), zodat het bos er vlak omheen staat. De rest is bos waar het eiland bos is, en een boom waar het eiland er
    // een heeft (een bosje in de kampen), maar niet vlak naast een weg of het plein.
    const inKern = (x, y) => totPlein(Math.floor(x), Math.floor(y)) <= I.leegRand;
    {
      const gebouwd = somVan([WEG, PLEIN]);
      const bos = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < B; x++) {
          if (op(x, y) !== VRIJ || inKern(x + 0.5, y + 0.5) || gebouwd(x - 1, y - 1, 3, 3)) continue;
          const s = land.streek(x, y);
          if (s === 'woud' || s === 'broek' || land.boom(x, y)) bos.push([x, y]);
        }
      }
      for (const [x, y] of bos) zet(x, y, BOS);
    }

    // ---- 6. De grond per hoekpunt: water wint, dan zandpad, en de rest is die van het eiland ----
    // De grond van het eiland (T.grondVanStreek; het water heeft `nat` hierboven al), en in de kern gras: weiden en tuinen.
    const grondOpEiland = (x, y) => (inKern(x, y) ? 'g' : T.grondVanStreek(land.hoek(x, y)));
    const hoeken = [];
    for (let y = 0; y <= H; y++) {
      const rij = [];
      for (let x = 0; x <= B; x++) {
        if (nat(x, y)) rij.push(T.grondVanStreek(land.hoek(x, y)) === 'e' ? 'e' : 'w'); // de zee, of ander water
        else if (naastWater(x, y)) rij.push('g');
        else if (opWeg(x, y)) rij.push('z');
        else rij.push(grondOpEiland(x, y));
      }
      hoeken.push(rij);
    }
    // Wat niet naast elkaar kan liggen (T.passendeGrond): heide grenst alleen aan gras en strand, het strand aan de zee,
    // gras en heide, het veen en het broek alleen aan gras (net als zandpad vlak naast water, hierboven). Zo'n hoekpunt
    // wordt gras, of naast de zee strand; tot er niets meer wijkt.
    for (let ronde = 0; ronde < 4; ronde++) {
      let geweken = false;
      for (let y = 0; y <= H; y++) {
        for (let x = 0; x <= B; x++) {
          const buren = [];
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && (hoeken[y + dy] || [])[x + dx]) buren.push(hoeken[y + dy][x + dx]);
          const l = T.passendeGrond(hoeken[y][x], buren);
          if (l !== hoeken[y][x]) {
            hoeken[y][x] = l;
            geweken = true;
          }
        }
      }
      if (!geweken) break;
    }
    const grond = hoeken.map((rij) => rij.join(''));
    const opGras = (x, y) => [[0, 0], [1, 0], [1, 1], [0, 1]].every(([dx, dy]) => GROEIT.has((grond[y + dy] || '')[x + dx]));

    // ---- 7. Wat er verder staat: het kamp op het plein, de eiken, bomen, struiken, rotsen en het groen ----
    const voorwerpen = [];
    const bezet = new Set();
    const sleutel = (x, y) => y * B + x;
    const vrijVoor = (x, y) => binnen(x, y) && !bezet.has(sleutel(x, y));
    // wat voor plek dit is, voor de nieuwe soorten (andereBoom)
    const plekVoorBoom = (x, y) =>
      op(x, y) === PLEIN ? 'plein'
        : raakt(x, y, 1, 1, 1, [WATER]) ? 'water'
          : PLEK_VAN_STREEK[land.streek(x, y)] === 'heide' ? 'heide'
            : op(x, y) === BOS ? 'bos'
              : raakt(x, y, 1, 1, 4, [WEG]) ? 'weg'
                : 'wei';
    const leg1 = (naam, x, y) => {
      voorwerpen.push({ naam: KAN_ANDERS.has(naam) ? andereBoom(naam, x, y, plekVoorBoom(x, y)) : naam, x, y });
      bezet.add(sleutel(x, y));
    };
    // Het kamp op het plein, waar de kar stopt (js/begin.js zet het op), en de plek van de marskramer waar de weg naar de
    // uitgang het plein raakt. Een put of een lantaarn is er nog niet.
    // Waar het kamp komt (T.BEGIN_INSTELLINGEN.kamp): het vuur zo dicht mogelijk bij het midden van het plein, met de tenten
    // en de afdakken eromheen, elk met de tegel achter zich en zijn opening ervoor, en de plek van de kar, allemaal vrij
    // op het plein. Het kamp zelf zet js/begin.js op als de kar er is.
    const kampOpHetPlein = () => {
      const K = T.BEGIN_INSTELLINGEN.kamp;
      const RICHTING = { ZO: [1, 0], ZW: [0, 1], NW: [-1, 0], NO: [0, -1] };
      const vrij = (x, y) => op(x, y) === PLEIN && vrijVoor(x, y) && opGras(x, y);
      const kandidaten = [];
      for (let vy = pleinVak.y0; vy <= pleinVak.y1; vy++) {
        for (let vx = pleinVak.x0; vx <= pleinVak.x1; vx++) {
          const plekken = K.plekken.map((p) => {
            const [rx, ry] = RICHTING[p.open];
            const x = vx + p.dx;
            const y = vy + p.dy;
            // de tegel van de tent zelf, en de tegel erachter (weg van de opening)
            const voet = { x: Math.min(x, x - rx), y: Math.min(y, y - ry), b: rx ? 2 : 1, h: ry ? 2 : 1 };
            return { x, y, open: p.open, vorm: p.vorm, voet, deur: { x: x + rx, y: y + ry } };
          });
          const kar = { x: vx + K.kar.dx, y: vy + K.kar.dy };
          const tegels = [{ x: vx, y: vy }];
          for (const p of plekken) {
            for (let y = p.voet.y; y < p.voet.y + p.voet.h; y++) for (let x = p.voet.x; x < p.voet.x + p.voet.b; x++) tegels.push({ x, y });
            tegels.push(p.deur);
          }
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) tegels.push({ x: kar.x + dx, y: kar.y + dy });
          if (!tegels.every((t) => vrij(t.x, t.y))) continue;
          const straal = Math.max(...tegels.map((t) => Math.hypot(t.x - vx, t.y - vy)));
          kandidaten.push({ x: vx, y: vy, plekken, kar, straal, tegels, score: -Math.hypot(vx + 0.5 - cx, vy + 0.5 - cy) + tussen(0, 1.5) });
        }
      }
      const k = besteVan(kandidaten);
      return k ? { vuur: { x: k.x, y: k.y }, plekken: k.plekken, kar: k.kar, straal: Math.ceil(k.straal), bezet: k.tegels } : null;
    };
    const kamp = kampOpHetPlein();
    if (!kamp) return mis('geen plek voor het kamp op het plein'); // geen tekst
    for (const t of kamp.bezet) bezet.add(sleutel(t.x, t.y));
    // Ligt (x, y) binnen `rand` tegels van het kamp?
    const bijHetKamp = (x, y, rand) => kamp.bezet.some((t) => Math.abs(t.x - x) <= rand && Math.abs(t.y - y) <= rand);
    // De plek van de marskramer, waar ook de heer op Sint-Maarten staat: op het plein, waar de weg het plein raakt, zo
    // dicht mogelijk bij de uitgang, en niet in het kamp.
    let marskramer = null;
    {
      let beste = 1e9;
      for (let y = pleinVak.y0; y <= pleinVak.y1; y++) {
        for (let x = pleinVak.x0; x <= pleinVak.x1; x++) {
          if (op(x, y) !== PLEIN || !vrijVoor(x, y) || !raakt(x, y, 1, 1, 1, [WEG])) continue;
          if (bijHetKamp(x, y, 2)) continue;
          const d = Math.hypot(x - uitgang.x, y - uitgang.y);
          if (d < beste) {
            beste = d;
            marskramer = { x, y };
          }
        }
      }
      if (!marskramer) return mis('geen plek voor de marskramer aan de weg'); // geen tekst
    }
    // Vier tot zes oude eiken op het plein, niet vlak bij het kamp, ver genoeg uit elkaar. Het kamp staat midden op het
    // plein, en er zijn er zoveel als er passen.
    {
      const eiken = [];
      const aantal = 4 + Math.floor(r() * 3);
      const opties = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < B; x++) {
          if (op(x, y) !== PLEIN || !vrijVoor(x, y) || bijHetKamp(x, y, 2)) continue;
          // de voorkant van het plein (naar de camera) blijft vrij voor de markt
          if ((x + 0.5 - cx + (y + 0.5 - cy)) * Math.SQRT1_2 > I.eikenTot * pd) continue;
          let rondom = true;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (op(x + dx, y + dy) !== PLEIN) rondom = false;
          if (rondom) opties.push([x, y]);
        }
      }
      for (const [x, y] of schud(opties)) {
        if (eiken.length >= aantal) break;
        if (eiken.some(([ex, ey]) => Math.hypot(ex - x, ey - y) < 4.5)) continue;
        if (Math.hypot(marskramer.x - x, marskramer.y - y) < 3) continue;
        eiken.push([x, y]);
        leg1('eik', x, y);
      }
    }
    const losOpGras = (x, y) => vrijVoor(x, y) && opGras(x, y) && op(x, y) === VRIJ;
    // Losse bomen op het land, niet te dicht bij een weg of bij elkaar: vooral eiken.
    {
      const bomen = [];
      const aantal = I.losseBomen[0] + Math.floor(r() * (I.losseBomen[1] - I.losseBomen[0] + 1));
      for (let n = 0; n < 600 && bomen.length < aantal; n++) {
        const x = Math.floor(r() * B);
        const y = Math.floor(r() * H);
        if (op(x, y) !== VRIJ || !losOpGras(x, y)) continue;
        if (raakt(x, y, 1, 1, 2, [WEG, PLEIN])) continue;
        if (bomen.some(([ex, ey]) => Math.hypot(ex - x, ey - y) < 6)) continue;
        bomen.push([x, y]);
        leg1(r() < 0.75 ? 'eik' : 'berk', x, y);
      }
    }
    // Groepjes struiken in de wei: twee tot vijf bij elkaar.
    {
      const aantal = I.struikgroepjes[0] + Math.floor(r() * (I.struikgroepjes[1] - I.struikgroepjes[0] + 1));
      let gelegd = 0;
      for (let n = 0; n < 400 && gelegd < aantal; n++) {
        const x = 2 + Math.floor(r() * (B - 4));
        const y = 2 + Math.floor(r() * (H - 4));
        if (op(x, y) !== VRIJ || raakt(x - 1, y - 1, 3, 3, 2, [WEG, PLEIN, WATER])) continue;
        gelegd++;
        let struiken = 2 + Math.floor(r() * 4);
        for (const [dx, dy] of schud([[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]])) {
          if (struiken <= 0) break;
          if (op(x + dx, y + dy) !== VRIJ || !losOpGras(x + dx, y + dy)) continue;
          leg1(r() < 0.75 ? 'struik' : 'bessenStruik', x + dx, y + dy);
          struiken--;
        }
      }
    }
    // Een of twee rotspartijen, het liefst aan de rand van het bos, ver van het plein: daar komt de steengroeve (vraag
    // 112, c). Een kern van grote rotsen, en kleine eromheen.
    const rotsen = [];
    {
      // Bij elke rotspartij een plek voor de steengroeve, die het bos en de struiken daarna vrijlaten: zijn voet, met
      // genoeg grote rotsen binnen zijn bereik, en het looppad rondom (`voet` en `bij` van de steengroeve in
      // js/gebouwen.js, en T.GEBOUWEN_INSTELLINGEN.looppad). Zonder die plek groeide het bos er soms helemaal omheen, en
      // kon een land geen steen hakken (4 okt: land 3 en 5, nadat de bouwstijl het toeval van de maker veranderde).
      const SG = T.GEBOUWEN.steengroeve;
      const lp = T.GEBOUWEN_INSTELLINGEN.looppad;
      let groeven = 0;
      const houdGroeveVrij = (k) => {
        let beste = null;
        for (let gy = k.y - 12; gy <= k.y + 12; gy++) {
          for (let gx = k.x - 12; gx <= k.x + 12; gx++) {
            const s = SG.bij.straal;
            const rots = voorwerpen.filter((v) => v.naam === 'rots' && v.x >= gx - s && v.x < gx + SG.voet.b + s && v.y >= gy - s && v.y < gy + SG.voet.h + s).length;
            if (rots < SG.bij.minstens) continue;
            let past = true;
            for (let y = gy - lp; y < gy + SG.voet.h + lp && past; y++) {
              for (let x = gx - lp; x < gx + SG.voet.b + lp && past; x++) {
                const opVoet = x >= gx && y >= gy && x < gx + SG.voet.b && y < gy + SG.voet.h;
                if (!vrijVoor(x, y) || ![VRIJ, BOS].includes(op(x, y)) || (opVoet && !opGras(x, y))) past = false;
              }
            }
            const d = Math.hypot(gx - cx, gy - cy);
            if (past && (!beste || d < beste.d)) beste = { gx, gy, d };
          }
        }
        if (!beste) return;
        groeven++;
        for (let y = beste.gy - lp; y < beste.gy + SG.voet.h + lp; y++) {
          for (let x = beste.gx - lp; x < beste.gx + SG.voet.b + lp; x++) bezet.add(sleutel(x, y));
        }
      };
      const aantal = 1 + (r() < I.rotsen ? 1 : 0);
      const opties = [];
      const grasSom = optelsom((x, y) => opGras(x, y));
      for (let y = 5; y < H - 5; y++) {
        for (let x = 5; x < B - 5; x++) {
          // ze mogen ook in het bos: daar is het bos van het eiland, en open land is er soms niet
          if (![VRIJ, BOS].includes(op(x, y)) || Math.hypot(x - cx, y - cy) < 22) continue;
          if (raakt(x - 3, y - 3, 7, 7, 1, [WEG, PLEIN, WATER])) continue;
          if (grasSom(x - 5, y - 5, 11, 11) < 90) continue; // op de heide en het zand passen geen rotsen
          // in het open, en het liefst vlak voor het bos, zodat je ze ziet
          const bosrand = raakt(x - 3, y - 3, 7, 7, 3, [BOS]) ? 2 : 0;
          const optie = { x, y, score: bosrand + tussen(0, 2) };
          if (eilandRots(x - 6, y - 6, 13, 13)) optie.score += 2;
          opties.push(optie);
        }
      }
      for (let n = 0; n < aantal; n++) {
        const k = besteVan(opties.filter((o) => rotsen.every((p) => Math.hypot(o.x - p.x, o.y - p.y) > 25)));
        if (!k) break;
        rotsen.push({ x: k.x, y: k.y });
        const rond = [];
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) rond.push([k.x + dx, k.y + dy, Math.hypot(dx, dy) + tussen(0, 1.2)]);
        rond.sort((p, q) => p[2] - q[2]);
        let groot = 3 + Math.floor(r() * 4);
        let klein = 5 + Math.floor(r() * 6);
        for (const [x, y, d] of rond) {
          if (!vrijVoor(x, y) || !opGras(x, y) || ![VRIJ, BOS].includes(op(x, y))) continue;
          if (groot > 0 && d < 2.6) {
            leg1('rots', x, y);
            groot--;
          } else if (klein > 0 && d < 5 && r() < 0.5) {
            leg1('kleineRots', x, y);
            klein--;
          }
        }
        houdGroeveVrij(k);
      }
      if (!rotsen.length) return mis('geen plek voor de rotsen'); // geen tekst
      if (!groeven) return mis('geen plek voor de steengroeve bij de rotsen'); // geen tekst
      // de rotsen van het eiland
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < B - 1; x++) {
          if (land.streek(x, y) !== 'rots' || op(x, y) !== VRIJ || !vrijVoor(x, y) || !opGras(x, y)) continue;
          const t = r();
          if (t < 0.3) leg1('rots', x, y);
          else if (t < 0.55) leg1('kleineRots', x, y);
        }
      }
    }
    // Het bos: een boom waar het eiland er een heeft.
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        if (op(x, y) !== BOS || !vrijVoor(x, y) || !opGras(x, y)) continue;
        if (land.boom(x, y)) leg1(boomOpEiland(land.streek(x, y), r), x, y);
      }
    }
    // Wat er verder groeit (vraag 112, c; Marcel: "Her en der wat foliage, bomen, stenen, water"): varens en struiken
    // in het bos en onder de bomen, graspollen, bloemen en hoog gras in de wei (in plekken, uit een ruis), hoog gras langs
    // het water, en wat graspollen op de hei. Alleen op vrije grond.
    {
      const G = I.groei;
      const onderBoom = new Uint8Array(B * H);
      for (const v of voorwerpen) {
        if (!T.BOMEN[v.naam] || T.BOMEN[v.naam].struik) continue;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (binnen(v.x + dx, v.y + dy)) onderBoom[(v.y + dy) * B + v.x + dx] = 1;
      }
      const bloemRuis = ruis(9);
      // aan het water: een hoekpunt van de tegel ernaast is nat
      const bijWater = (x, y) => {
        for (let dy = -1; dy <= 2; dy++) for (let dx = -1; dx <= 2; dx++) if (nat(x + dx, y + dy)) return true;
        return false;
      };
      const trek = (kansen) => {
        let t = r();
        for (const naam in kansen) if ((t -= kansen[naam]) < 0) return naam;
        return null;
      };
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < B - 1; x++) {
          if (!vrijVoor(x, y)) continue;
          const o = op(x, y);
          let naam = null;
          if (o === VRIJ && land.streek(x, y) === 'heide') naam = trek(G.heide);
          else if (![VRIJ, BOS].includes(o) || !opGras(x, y)) continue;
          else if (o === VRIJ && ['veen', 'broek'].includes(land.streek(x, y)) && r() < 0.2) naam = 'hoogGras';
          else if (o === BOS || onderBoom[y * B + x]) naam = trek(G.bos);
          else if (bijWater(x, y) && r() < G.oever.hoogGras) naam = 'hoogGras';
          else if (bloemRuis(x, y) > G.bloemen[0] && r() < G.bloemen[1]) naam = 'bloemen';
          else naam = trek(G.weide);
          if (naam) leg1(naam, x, y);
        }
      }
      // Het groen eronder (vraag 148, stap 3): met een vaste keus per tegel (hash), niet met het lot (r), zodat de maker
      // verder legt wat hij legde. Elke plek een eigen zout.
      const vasteKeus = (kansen, x, y, zout) => {
        let t = hash(x, y, zout);
        for (const naam in kansen) if ((t -= kansen[naam]) < 0) return naam;
        return null;
      };
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < B - 1; x++) {
          if (!vrijVoor(x, y)) continue;
          const o = op(x, y);
          let naam = null;
          if (o === WATER) naam = land.streek(x, y) !== 'zee' ? vasteKeus(G.waterGroen, x, y, 951) : null;
          else if (o === VRIJ && land.streek(x, y) === 'heide') naam = vasteKeus(G.heideGroen, x, y, 952);
          else if (![VRIJ, BOS].includes(o) || !opGras(x, y)) continue;
          else if (bijWater(x, y)) naam = vasteKeus(G.oeverGroen, x, y, 954);
          else if (o === VRIJ && raakt(x, y, 1, 1, 1, [BOS])) naam = vasteKeus(G.bosrand, x, y, 955);
          if (naam) leg1(naam, x, y);
        }
      }
    }

    // ---- 8. Keuren ----
    delete kamp.bezet;
    const plan = {
      zaad, poging, stijl, b: B, h: H, grond, plein, marskramer, uitgang, brug, bruggen, voorwerpen, rotsen, wegen,
      // js/hoogte.js legt een vlak stuk onder elk huis van het plan: er staan er geen meer, het zijn de huizen van de speler
      huizen: [],
      schout: { ...kamp.plekken[0].deur }, kamp, eiland: { zaad: land.zaad, x0: land.x0, y0: land.y0 },
    };
    const fout = keur(plan);
    if (fout) return mis(fout);
    return plan;
  }

  // Deugt dit plan? Geeft de reden terug als het niet deugt, anders null. En het zet de maten erbij (hoe groot het plein
  // is), voor de schets.
  function keur(plan) {
    const B = plan.b;
    const H = plan.h;
    const vast = new Uint8Array(B * H);
    const zetVast = (x, y) => {
      if (x >= 0 && y >= 0 && x < B && y < H) vast[y * B + x] = 1;
    };
    for (const v of plan.voorwerpen) {
      if (!isVastNaam(v.naam)) continue;
      for (let y = v.y; y < v.y + (v.d || 1); y++) for (let x = v.x; x < v.x + (v.b || 1); x++) zetVast(x, y);
    }
    // Water is vast, behalve waar het bruggetje ligt.
    const brug = new Set(plan.brug.map((p) => p.y * B + p.x));
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        const nat = [[0, 0], [1, 0], [0, 1], [1, 1]].some(([dx, dy]) => isNat(plan.grond[y + dy][x + dx]));
        if (nat && !brug.has(y * B + x)) zetVast(x, y);
      }
    }
    // Hoe ver elke tegel te voet ligt van de tent van de schout.
    const afstand = new Int32Array(B * H).fill(-1);
    const start = plan.schout.y * B + plan.schout.x;
    if (vast[start]) return 'de tent van de schout is vast'; // geen tekst
    afstand[start] = 0;
    const rij = [start];
    for (let i = 0; i < rij.length; i++) {
      const p = rij[i];
      const x = p % B;
      const y = (p - x) / B;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= B || ny >= H) continue;
        const q = ny * B + nx;
        if (vast[q] || afstand[q] >= 0) continue;
        afstand[q] = afstand[p] + 1;
        rij.push(q);
      }
    }
    const kom = (x, y) => x >= 0 && y >= 0 && x < B && y < H && afstand[y * B + x] >= 0;
    if (!kom(plan.uitgang.x, plan.uitgang.y)) return 'de uitgang is niet te bereiken'; // geen tekst
    if (!kom(plan.marskramer.x, plan.marskramer.y)) return 'de plek van de marskramer is niet te bereiken'; // geen tekst
    if (!plan.kamp.plekken.every((p) => kom(p.deur.x, p.deur.y))) return 'een tent in het kamp is niet te bereiken'; // geen tekst
    if (!kom(plan.kamp.kar.x, plan.kamp.kar.y)) return 'de plek van de kar is niet te bereiken'; // geen tekst
    // Het plein: niets erop dan de eiken. Een eik kan ook een linde zijn, of aan de rand een andere soort die een eik werd
    // (ANDERE_BOMEN).
    const opPlein = (x, y) => T.binnenRand(plan.plein, x + 0.5, y + 0.5);
    const magOpPlein = ['eik', ...Object.values(ANDERE_BOMEN).flatMap((p) => (p.eik || []).map(([s]) => s))];
    for (const v of plan.voorwerpen) if (!magOpPlein.includes(v.naam) && opPlein(v.x, v.y)) return `er staat een ${v.naam} op het plein`; // geen tekst
    let pleinTegels = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (opPlein(x, y)) pleinTegels++;
    plan.maat = { pleinTegels };
    return null;
  }

  // Het land uit dit zaad op dit stuk van het eiland (`land`, T.landVanEiland, js/eiland.js): hetzelfde zaad geeft altijd
  // hetzelfde land. Het is het lege land van vraag 152: het plein en de plek van het kamp, zonder huizen of akkers. Deugt de
  // eerste poging niet, dan probeert hij het opnieuw, tot T.MAKER_INSTELLINGEN.pogingen; `waarom` zegt wat er onderweg
  // misging. Zonder `land` is er geen land: kies het stuk met T.planOpEiland.
  T.maakGehucht = function (zaad, land, pogingen = IN().pogingen) {
    if (!land) throw new Error('de maker legt alleen een land op het eiland: geef een `land` (T.landVanEiland), of vraag T.planOpEiland(zaad)'); // geen tekst
    const waarom = [];
    for (let poging = 0; poging < pogingen; poging++) {
      const plan = leg(zaad, poging, land);
      if (!plan.mis) {
        plan.waarom = waarom;
        return plan;
      }
      waarom.push(plan.mis);
    }
    const tel = {};
    for (const w of waarom) tel[w] = (tel[w] || 0) + 1;
    const vaakst = Object.entries(tel).sort((a, b) => b[1] - a[1]).slice(0, 5);
    throw new Error(`de maker kreeg met zaad ${zaad} geen land dat deugt: ${vaakst.map(([w, n]) => (n > 1 ? `${w} (${n} keer)` : w)).join('; ')}`); // geen tekst
  };
  // Voor de toetsen: een plan keuren.
  T.keurGehucht = keur;

  // ---------------------------------------------------------------------------------------------
  // Van plan naar kaart: een kaart en een betekenisbestand, zoals Tiled en gereedschap/wereld.html ze maken
  // ---------------------------------------------------------------------------------------------

  // De grondtegels uit tegels/rand.tsx, en wat daar niet in staat uit tegels/kust.tsx (de zee, het strand, het veen
  // en het broek; werklijst vraag 117, B van 2a), opgezocht op wat er in hun vier hoeken ligt. Tiled kiest ze met zijn
  // terreinsets; het spel leest hetzelfde uit hun groep: "gras over zandpad: boven+rechts" heeft gras in de hoeken
  // boven en rechts, en zandpad in de andere twee. De hoeken van tegel (x, y) liggen in beeld zo: boven (x, y), rechts
  // (x+1, y), onder (x+1, y+1) en links (x, y+1). Een tegel staat er als zijn nummer in de kaart (gid): rand vanaf 1,
  // kust erachter (KUST_GID), en een kaart noemt kust alleen als hij er een tegel van heeft.
  const HOEKEN = ['boven', 'rechts', 'onder', 'links'];
  const GRONDSOORT = { g: 'gras', w: 'water', z: 'zandpad', h: 'heide', k: 'kasseien', e: 'zee', s: 'strand', v: 'veen', b: 'broek' };
  const LETTER = Object.fromEntries(Object.entries(GRONDSOORT).map(([l, naam]) => [naam, l])); // en terug: 'gras' is 'g'
  const KUST_GID = () => 1 + T.TEGELS.rand.tiles.length;
  let grondTegels = null;
  function grondIndex() {
    if (grondTegels) return grondTegels;
    const vlak = {};
    const overgang = {};
    const brug = {};
    const leesVel = (vel, eerste) => {
      // wat rand al heeft, neemt kust niet over: zo blijft een land zonder het eiland tegel voor tegel hetzelfde
      const vlakVan = {};
      const overgangVan = {};
      T.TEGELS[vel].tiles.forEach((t, id) => {
        if (!t || !t.groep) return;
        if (t.groep === 'vlak') (vlakVan[t.naam] = vlakVan[t.naam] || []).push(eerste + id);
        const o = /^(\S+) over (\S+): (.+)$/.exec(t.groep);
        if (o) {
          const erin = o[3].split('+');
          const sleutel = HOEKEN.map((h) => (erin.includes(h) ? o[1] : o[2])).join(',');
          (overgangVan[sleutel] = overgangVan[sleutel] || []).push(eerste + id);
        }
        const b = /^brug ([xy]) (begin|midden|eind)$/.exec(t.groep);
        if (b) brug[`${b[1]} ${b[2]}`] = eerste + id;
      });
      for (const n of Object.keys(vlakVan)) if (!vlak[n]) vlak[n] = vlakVan[n];
      for (const k of Object.keys(overgangVan)) if (!overgang[k]) overgang[k] = overgangVan[k];
    };
    leesVel('rand', 1);
    if (T.TEGELS.kust) leesVel('kust', KUST_GID());
    return (grondTegels = { vlak, overgang, brug });
  }
  // Een vaste keus uit een paar varianten, per tegel (dezelfde als in maak-gehucht.cjs).
  function hash(x, y, zout) {
    let h = (x * 374761393 + y * 668265263 + zout * 2654435761) >>> 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  // Drie soorten in één tegel kan geen tegel tekenen: dan telt alleen wat er het meest ligt (maak-gehucht.cjs).
  function totTwee(soorten) {
    const tel = {};
    for (const s of soorten) tel[s] = (tel[s] || 0) + 1;
    const volgorde = Object.keys(tel).sort((p, q) => tel[q] - tel[p]);
    if (volgorde.length <= 2) return soorten;
    return soorten.map((s) => (s === volgorde[0] || s === volgorde[1] ? s : volgorde[0]));
  }
  // De grond in de vier hoeken van een tegel ('gras', 'zee', ...), zo dat er een grondtegel voor is: van drie soorten
  // twee (totTwee), en van een paar zonder tegel (T.grondPaar; waar een rivier in zee komt) één, wat er het meest ligt.
  // Voor de kaart (T.kaartVanGehucht) en het eiland om de kaart (js/tekenen.js).
  T.grondTegelHoeken = function (soorten) {
    const twee = totTwee(soorten);
    const [a, b] = [...new Set(twee)];
    if (!b || T.grondPaar(LETTER[a], LETTER[b])) return twee;
    const meest = twee.filter((s) => s === a).length >= twee.filter((s) => s === b).length ? a : b;
    return twee.map(() => meest);
  };
  // In welk vel een voorwerp staat, in dezelfde volgorde als maak-gehucht.cjs zoekt: "eik" wordt "bomen/eik".
  const VELLEN = ['bomen', 'begroeiing', 'gebouwen', 'erf', 'tuin', 'huizen'];
  function opNaam(naam) {
    for (const vel of VELLEN) if (T.TEGELS[vel] && T.TEGELS[vel].tiles.some((t) => t && t.naam === naam)) return `${vel}/${naam}`;
    throw new Error(`de maker kent geen voorwerp "${naam}" (tegels/tegels.js)`); // geen tekst
  }

  // Staat een voorwerp met deze naam in de weg (`vast` in tegels/tegels.js)? Een boom, een struik, een rots en de put
  // wel; een varen, een graspol en een kool niet.
  const VAST = {};
  function isVastNaam(naam) {
    if (!(naam in VAST)) {
      const [vel, kaal] = opNaam(naam).split('/');
      VAST[naam] = !!T.TEGELS[vel].tiles.find((t) => t && t.naam === kaal).vast;
    }
    return VAST[naam];
  }

  // Een plan wordt { kaart, betekenis }: de grond als tegellaag, en al het andere op naam in het betekenisbestand
  // (js/kaart.js, "WAT EEN DING BETEKENT"), zoals Tiled een kaart schrijft.
  T.kaartVanGehucht = function (plan) {
    const B = plan.b;
    const H = plan.h;
    const g = grondIndex();
    const data = new Array(B * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        const soorten = [plan.grond[y][x], plan.grond[y][x + 1], plan.grond[y + 1][x + 1], plan.grond[y + 1][x]].map((s) => GRONDSOORT[s]);
        const hoeken = T.grondTegelHoeken(soorten);
        // waar een paar zonder tegel één soort werd (de monding van een rivier in zee), telt plan.grondNaden het
        if (new Set(hoeken).size < new Set(totTwee(soorten)).size) plan.grondNaden = (plan.grondNaden || 0) + 1;
        const kies = (lijst) => lijst[Math.floor((hash(x, y, 63) * 1e6) % lijst.length)];
        const lijst = new Set(hoeken).size === 1 ? g.vlak[hoeken[0]] : g.overgang[hoeken.join(',')];
        if (!lijst) throw new Error(`de maker heeft geen grondtegel voor ${hoeken.join(', ')} op (${x}, ${y})`); // geen tekst
        data[y * B + x] = kies(lijst);
      }
    }
    // De bruggetjes over het water, elk in zijn eigen richting (plan.bruggen): begin, midden en eind.
    for (const b of plan.bruggen) {
      const brug = b.tegels.slice().sort((p, q) => p.x + p.y - (q.x + q.y));
      brug.forEach((p, i) => {
        const deel = i === 0 ? 'begin' : i === brug.length - 1 ? 'eind' : 'midden';
        data[p.y * B + p.x] = g.brug[`${b.as} ${deel}`];
      });
    }
    const kaart = {
      type: 'map',
      orientation: 'isometric',
      width: B,
      height: H,
      tilewidth: 64,
      tileheight: 32,
      properties: [{ name: 'naam', type: 'string', value: T.t('The hamlet') }, { name: 'doof', type: 'int', value: 6 }],
      tilesets: [{ firstgid: 1, source: '../tegels/rand.tsx' }, ...(data.some((gid) => gid >= KUST_GID()) ? [{ firstgid: KUST_GID(), source: '../tegels/kust.tsx' }] : [])], // geen tekst
      layers: [{ type: 'tilelayer', name: 'grond', width: B, height: H, data }],
    };

    const dingen = [];
    // de tekeningen: alles wat er staat (bomen, struiken, rotsen, groen)
    for (const v of plan.voorwerpen) dingen.push({ x: v.x, y: v.y, tegel: opNaam(v.naam) });
    // wie er staat: alleen de schout, bij zijn tent in het kamp (js/begin.js zet hem bij de kar aan de rand)
    dingen.push({ ...plan.schout, wezen: 'schout' });
    dingen.push({ ...plan.uitgang, overgang: 'wereld', tekst: T.t('The road into the world') });

    const betekenis = {
      versie: 1,
      // het hangt nog aan geen andere kaart vast: de weg de wereld in leidt nergens heen (js/gebied.js)
      proef: true,
      uitleg: `Een gehucht van de maker (js/maker.js), uit zaad ${plan.zaad}.`, // geen tekst
      marskramer: { ...plan.marskramer },
      plein: plan.plein.map(([x, y]) => [x, y]),
      dingen,
    };
    return { kaart, betekenis };
  };

  // Het plan op het eiland van dit nummer (vraag 117, stap 2): op jouw plek (js/eiland.js), en lukt het daar niet, dan
  // op de plek van een ander dorp, in een vaste volgorde, zodat hetzelfde nummer hetzelfde spel geeft. Per plek minder
  // pogingen dan op een land van de maker, want een andere plek is er wel.
  T.planOpEiland = function (zaad) {
    const E = T.eilandVan(zaad);
    const dorpen = E.plekken.filter((p) => p.soort === 'dorp');
    const waarom = [];
    for (const p of [...dorpen.filter((d) => d.jij), ...dorpen.filter((d) => !d.jij)]) {
      const land = T.landVanEiland(E, p, IN().b, IN().h);
      try {
        const plan = T.maakGehucht(zaad, land, 30);
        plan.eiland.dorp = p.naam;
        return plan;
      } catch (e) {
        waarom.push(`${p.naam}: ${e.message}`);
      }
    }
    throw new Error(`geen land op het eiland van ${zaad}: ${waarom.join('; ')}`); // geen tekst
  };

  // ---- Het eiland om je land (vraag 117, stap 2b) ----
  // Buiten de kaart loopt het eiland door (Marcel, 8 okt: "A ja"), zoals de maker het binnen legt (stap 11 en 12): het
  // water is water, wat ernaast ligt gras, de weg van het eiland zandpad, en verder de grond van zijn streek
  // (T.grondVanStreek), met de heide alleen naast gras; een boom waar het eiland er een heeft, en de rotsen van het
  // eiland, allebei op gras. Aan de naad past de rand zich aan de kaart aan: wat er niet naast kan liggen (water naast
  // haar zandpad, zandpad naast haar heide), wordt gras (of naast de zee strand), want voor zo'n paar heeft
  // tegels/rand.tsx of kust.tsx geen tegel (T.grondPaar). Alleen om
  // te tekenen (js/tekenen.js: het land en het bos om de kaart); het komt uit het nummer van het eiland, dus het staat
  // niet in Spel.S, en het wordt één keer per kaart uitgerekend.
  const RAND = new WeakMap();
  T.randVanHetEiland = function (w) {
    let rand = RAND.get(w);
    if (rand) return rand;
    const D = IN().eilandRand;
    const vak = T.kaartVak(w);
    const B = vak.b;
    const H = vak.h;
    const nb = B + 2 * D; // het stuk eiland in tegels, vanaf (-D, -D)
    const nh = H + 2 * D;
    const n = nb + 1; // en in hoekpunten
    const E = T.eilandVan(w.eiland.zaad);
    const tegels = T.eilandStuk(E, w.eiland.x0 - D, w.eiland.y0 - D, nb, nh);
    const punten = T.eilandStuk(E, w.eiland.x0 - D - 0.5, w.eiland.y0 - D - 0.5, n, nh + 1);
    const hi = (vx, vy) => (vy + D) * n + vx + D; // hoekpunt (vx, vy), met (0, 0) de hoek van de kaart
    const opKaart = (vx, vy) => vx >= 0 && vy >= 0 && vx <= B && vy <= H;
    const inStuk = (vx, vy) => vx >= -D && vy >= -D && vx <= B + D && vy <= H + D;
    const hoek = new Array(n * (nh + 1)).fill(null);
    // Ligt er naast hoekpunt (vx, vy) iets waarvoor `test` ja zegt (met of die buur op de kaart ligt)?
    const eenBuur = (vx, vy, test) => {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if ((!dx && !dy) || !inStuk(vx + dx, vy + dy)) continue;
          const l = hoek[hi(vx + dx, vy + dy)];
          if (l && test(l, opKaart(vx + dx, vy + dy))) return true;
        }
      }
      return false;
    };
    // de grond van de buren van hoekpunt (vx, vy); met `alleenKaart` alleen die op de kaart
    const burenVan = (vx, vy, alleenKaart = false) => {
      const uit = [];
      eenBuur(vx, vy, (l, kaart) => {
        if (kaart || !alleenKaart) uit.push(l);
        return false;
      });
      return uit;
    };
    // de rand van de kaart zelf: wat er ligt (alleen die raakt de hoekpunten erbuiten)
    const vanKaart = (vx, vy) => {
      hoek[hi(vx, vy)] = LETTER[T.sprites.grondHoekOp(w, vx, vy)] || 'g';
    };
    for (let vx = 0; vx <= B; vx++) {
      vanKaart(vx, 0);
      vanKaart(vx, H);
    }
    for (let vy = 0; vy <= H; vy++) {
      vanKaart(0, vy);
      vanKaart(B, vy);
    }
    const buiten = []; // de hoekpunten om de kaart
    for (let vy = -D; vy <= H + D; vy++) for (let vx = -D; vx <= B + D; vx++) if (!opKaart(vx, vy)) buiten.push(hi(vx, vy), vx, vy);
    const elk = (f) => {
      for (let k = 0; k < buiten.length; k += 3) f(buiten[k], buiten[k + 1], buiten[k + 2]);
    };
    const streek = (i) => T.EILAND_STREKEN[punten.streek[i]];
    // eerst het water (de zee, een meer, een rivier); wat ernaast ligt, is gras; dan de weg, en de grond van de streek
    elk((i) => {
      const l = T.grondVanStreek(streek(i));
      if (isNat(l)) hoek[i] = l;
    });
    elk((i, vx, vy) => {
      if (!isNat(hoek[i])) hoek[i] = eenBuur(vx, vy, isNat) ? 'g' : punten.weg[i] ? 'z' : T.grondVanStreek(streek(i));
    });
    // de naad: wat niet naast de rand van de kaart kan liggen, wijkt, naast de zee voor strand en anders voor gras; en
    // kan wat er dan ligt niet aan de zee grenzen (gras, veen), dan wijkt de zee ernaast voor strand, want de kaart wijkt
    // niet
    elk((i, vx, vy) => {
      const kaart = burenVan(vx, vy, true);
      if (!kaart.length) return;
      if (!kaart.every((m) => T.grondPaar(hoek[i], m))) hoek[i] = eenBuur(vx, vy, (l) => l === 'e') && kaart.every((m) => T.grondPaar('s', m)) ? 's' : 'g';
      if (T.grondPaar(hoek[i], 'e')) return;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const j = hi(vx + dx, vy + dy);
          if (inStuk(vx + dx, vy + dy) && !opKaart(vx + dx, vy + dy) && hoek[j] === 'e') hoek[j] = 's';
        }
      }
    });
    // en dan wijkt wat niet naast elkaar kan liggen, zoals in de maker (stap 11): de heide grenst alleen aan gras en
    // strand, het strand aan de zee, enzovoort (T.passendeGrond)
    for (let ronde = 0; ronde < 4; ronde++) {
      let geweken = false;
      elk((i, vx, vy) => {
        const l = T.passendeGrond(hoek[i], burenVan(vx, vy));
        if (l !== hoek[i]) {
          hoek[i] = l;
          geweken = true;
        }
      });
      if (!geweken) break;
    }
    // de bomen en de rotsen, op gras (stap 12; ook op het veen en het broek)
    const ding = new Array(nb * nh).fill(null);
    const opGras = (x, y) => [hi(x, y), hi(x + 1, y), hi(x + 1, y + 1), hi(x, y + 1)].every((i) => GROEIT.has(hoek[i]));
    for (let y = -D; y < H + D; y++) {
      for (let x = -D; x < B + D; x++) {
        if ((x >= 0 && y >= 0 && x < B && y < H) || !opGras(x, y)) continue;
        const t = (y + D) * nb + x + D;
        const s = T.EILAND_STREKEN[tegels.streek[t]];
        let k = 0;
        if (tegels.boom[t]) ding[t] = andereBoom(boomOpEiland(s, () => hash(x, y, 801 + k++)), x, y, PLEK_VAN_STREEK[s] || 'wei');
        else if (s === 'rots') {
          const lot = hash(x, y, 811);
          ding[t] = lot < 0.3 ? 'rots' : lot < 0.55 ? 'kleineRots' : null;
        }
      }
    }
    rand = {
      diep: D,
      // de grond op hoekpunt (vx, vy) om de kaart ('gras', 'water', 'zandpad', 'heide', 'zee', 'strand', 'veen' of
      // 'broek'); op de kaart, en verder dan
      // `diep`, null
      hoek: (vx, vy) => (opKaart(vx, vy) || !inStuk(vx, vy) ? null : GRONDSOORT[hoek[hi(vx, vy)]]),
      // wat er op tegel (x, y) om de kaart staat: een boom of een rots (de naam van zijn tekening), of null
      voorwerp: (x, y) => (x < -D || y < -D || x >= B + D || y >= H + D ? null : ding[(y + D) * nb + x + D]),
    };
    RAND.set(w, rand);
    return rand;
  };

  // Het land van de maker als wereld, zoals T.gebied (js/gebied.js) een kaart uit kaarten/ inleest. `maker` zegt uit welk
  // zaad hij komt. Het is het lege begin van een nieuw spel: het land met een open plek voor het plein en het kamp erop.
  T.laadGemaaktGehucht = function (zaad) {
    const plan = T.planOpEiland(zaad);
    const { kaart, betekenis } = T.kaartVanGehucht(plan);
    const w = T.laadKaart(kaart, betekenis);
    w.maker = { zaad: plan.zaad, poging: plan.poging };
    w.eiland = plan.eiland; // waar op het eiland (js/eiland.js), voor de rand om de kaart
    if (plan.stijl) w.stijl = plan.stijl;
    w.kamp = plan.kamp; // waar het kamp komt (js/begin.js)
    if (T.HOOGTE_INSTELLINGEN.aan) w.hoogte = T.legHoogte(plan, w); // de spelregel "Hoogte" (js/hoogte.js)
    w.markt = T.zoekMarktPlek(w); // de marktplek op het plein (js/markt.js; Marcel, 12 okt: "Plein krijgt plaatsen")
    return w;
  };
})(globalThis.Spel = globalThis.Spel || {});
