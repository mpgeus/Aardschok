// De maker: het land van een nieuw spel (ontwerp/werklijst.md, vraag 69, C; Marcel, 30 sep 2026: "De maker nu"). Elk spel
// ligt het land anders, uit het zaad van dat spel.
//
// Sinds ronde 2 van het snoeien (stap 6, 12 okt; Marcel: "Alles wordt door spelers geplaatst") legt hij alleen nog het land
// zelf, op het eiland (js/eiland.js), en sinds B2b (13 okt; Marcel: "Het eiland, overal") alleen nog het menselijke: het
// land, de grond, de wegen, de bomen en het groen komen van het eiland (T.landStuk hieronder), en de maker maakt er de open
// plek voor het plein bij, op dat plein de plek van het kamp waar de kar stopt (js/begin.js), de plek van de marskramer,
// een paar eiken en een rotspartij voor de steengroeve. Geen huizen, boerderijen, akkers, herberg, meent, put of bank: dat
// bouwt de speler. Tot dan legde hij ook het dorp dat er al was, een land zonder eiland, en zijn eigen bomen, wegen en
// bruggetjes; ze staan in git.
//
// Hij keurt zijn eigen werk (keur hieronder): kan iedereen overal komen, staat er niets op het plein dat er niet hoort, en
// heeft het plein een marktplek (T.planOpEiland).
// Deugt het niet, dan probeert hij het met hetzelfde zaad opnieuw, en hetzelfde zaad geeft altijd hetzelfde land.
//
// T.maakGehucht(zaad, land) legt het plan (de indeling, zonder tegels) op een stuk van het eiland, T.planOpEiland(zaad) kiest
// dat stuk (jouw plek, anders die van een ander dorp), en T.laadGemaaktGehucht(zaad) maakt er een kaart van het eiland van
// (T.eilandKaart, js/wereld.js), met alleen wat de maker anders legde dan het eiland. Een nieuw spel begint zo (T.beginOpKaart, js/gebied.js). De schets
// (gereedschap/maker/schets.cjs, npm run maker) tekent plannen als plattegrond.
//
// Hij gebruikt de regels uit js/ zelf: de dobbelsteen (T.dobbelsteen, js/dorp.js), de rand van het plein
// (T.binnenRand, js/wereld.js) en de grondtegels (T.TEGELS, tegels/tegels.js).
(function (T) {
  'use strict';

  T.MAKER_INSTELLINGEN = {
    // Het lege begin (vraag 152; js/begin.js): de maker legt alleen het land met een open plek die het plein wordt; zo ver
    // om het plein is het open (tegels), en verder staat het bos van het eiland (Marcel, 11 okt: "Klein, bos dichtbij").
    leegRand: 2,
    // Zo ver om het land zijn de stukken van het eiland open bij een nieuw spel (tegels; js/wereld.js, T.openVak): zo ver
    // zie je het land om je dorp. In B2c wordt het de kring die je bij het begin kent.
    zicht: 16,
    // Uit zoveel zaden kiest een nieuw spel zijn land: een getal van vijf cijfers, om te onthouden.
    zaden: 99999,
    // Hoe groot het land is (vraag 112, b; Marcel, 3 okt: "Alles moet denk ik ook wijder opgezet worden").
    b: 100,
    h: 100,
    // Zo vaak probeert hij het met hetzelfde zaad, tot een plan deugt.
    pogingen: 120,
    // Een tweede dorp op het eiland (werklijst vraag 170, stap 6a; Marcel, 16 okt: "A1"): op de dichtste andere dorpsplek
    // die minstens zoveel tegels van het eerste ligt (T.legDorpOpKaart). De plekken op een eiland liggen 430 tot 2100
    // tegels uit elkaar, dus dit is de ondergrens voor een eiland waar ze dichter liggen.
    anderDorp: 200,
    // Een plein waar de twee rijen van de marktplek (js/markt.js) korter zijn dan dit, deugt niet: tussen het kamp, het
    // feest en de eiken blijft er dan bijna geen markt over (B2b, 13 okt: op het land van het eiland kregen eiland 8 en 9
    // rijen van twee). Alleen op het eiland (T.planOpEiland), want de marktplek vraagt de kaart.
    marktRij: 3,
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
      // Op het eiland (T.landStuk, B2b): in de wei per vak van zoveel bij zoveel tegels hooguit één losse boom, en per
      // groter vak hooguit één groepje struiken, elk met deze kans. Zo staan ze uit elkaar, en is elk vak los te maken.
      losseBomen: { vak: 8, kans: 0.3 },
      struikgroepjes: { vak: 12, kans: 0.25 },
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

  // De grond op een hoekpunt van het eiland, uit zijn streek (js/eiland.js): de zee ('e'), het water van een meer of een
  // rivier ('w'), de heide ('h'), het strand, de duinen en het zand ('s', strand), het veen ('v'), het broek ('b'), en de
  // rest gras ('g'). Het strand, het veen, het broek en de zee hebben eigen tegels (tegels/kust.png; werklijst vraag 117,
  // B van 2a). Zo legt het eiland zijn grond (T.landStuk).
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
  function andereBoom(soort, x, y, waar, k = hash(x, y, 821)) {
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
    // Het land zoals het eiland het heeft (T.landStuk, via land.stuk): de grond per hoekpunt, wat elke tegel is (vrij,
    // weg, water, bos), en wat er groeit. De maker legt er alleen het menselijke over (B2b; Marcel, 13 okt: "Het eiland,
    // overal"): het plein, open gemaakt, het kamp, de plek van de marskramer, de eiken op het plein en de rotspartij.
    const st = land.stuk;
    const lx = (x) => x - land.x0; // van het eiland naar het land
    const ly = (y) => y - land.y0;
    for (let i = 0; i < B * H; i++) vak[i] = st.soort[i];
    const letterOp = (x, y) => st.hoek[y * (B + 1) + x];

    // ---- 1. Het plein: in het midden, groot, open en onregelmatig ----
    // Getekend in (u, v) rond zijn midden, zoals de schets "Het plein als hart": u loopt in beeld naar rechts, v naar
    // de camera. Een ellips die golft en een beetje scheef staat. Het water blijft water.
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
        if (!opPlein(x, y)) continue;
        pleinTegels++;
        if (op(x, y) !== WATER) zet(x, y, PLEIN);
      }
    }
    if (pleinTegels < I.pleinTegels[0] || pleinTegels > I.pleinTegels[1]) return mis(`het plein is ${pleinTegels} tegels`); // geen tekst

    // ---- 2. Het water en de wegen: die van het eiland ----
    // Een hoekpunt is nat waar het eiland water is: de zee, een meer of een rivier. De wegen zijn die van het eiland
    // (Marcel, 13 okt: "Die van het eiland"), met zijn bruggetjes; de uitgang is waar de weg naar het kasteel het land
    // verlaat, of anders een andere weg.
    const nat = (x, y) => x >= 0 && y >= 0 && x <= B && y <= H && isNat(letterOp(x, y));
    const naastWater = (x, y) => {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (nat(x + dx, y + dy)) return true;
      return false;
    };
    const bruggen = land.bruggen;
    const brug = bruggen.flatMap((b) => b.tegels);
    let uitgang = null;
    for (const u of [...land.uitgangen.filter((u) => u.kasteel), ...land.uitgangen.filter((u) => !u.kasteel)]) {
      // de tegel aan de rand waar de weg begint, en is die nat, dan de dichtste droge ernaast langs de rand
      const langsY = u.x === 0 || u.x === B - 1;
      for (let d = 0; d <= 12 && !uitgang; d++) {
        for (const t of [d, -d]) {
          const x = langsY ? u.x : u.x + t;
          const y = langsY ? u.y + t : u.y;
          if (!uitgang && binnen(x, y) && op(x, y) !== WATER) uitgang = { x, y };
        }
      }
      if (uitgang) break;
    }
    if (!uitgang) return mis('geen weg van het eiland uit het land'); // geen tekst

    // Hoeveel tegels in een vak rots van het eiland zijn, zodat de rotspartijen liever daar komen.
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

    // ---- 3. Het plein open: wat het nodig heeft, is gerooid ----
    // Het plein met `leegRand` tegels eromheen (vraag 152; Marcel, 11 okt: "Klein, bos dichtbij"), zodat het bos er vlak
    // omheen staat: daar is geen bos meer, en de grond is gras (weiden en tuinen), behalve het water en de weg. De weg van
    // het eiland houdt op aan de rand van het plein (hij loopt naar het midden van het dorp): op het plein is het gras.
    const inKern = (x, y) => totPlein(Math.floor(x), Math.floor(y)) <= I.leegRand;
    for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (op(x, y) === BOS && inKern(x + 0.5, y + 0.5)) zet(x, y, VRIJ);
    const binnenPlein = (x, y) => op(x - 1, y - 1) === PLEIN && op(x, y - 1) === PLEIN && op(x - 1, y) === PLEIN && op(x, y) === PLEIN;
    const hoeken = [];
    for (let y = 0; y <= H; y++) {
      const rij = [];
      for (let x = 0; x <= B; x++) {
        const l = letterOp(x, y);
        rij.push(inKern(x, y) && !isNat(l) && (l !== 'z' || binnenPlein(x, y)) && !naastWater(x, y) ? 'g' : l);
      }
      hoeken.push(rij);
    }
    // Wat niet naast elkaar kan liggen (T.passendeGrond), zoals in T.landStuk: elke ronde kijkt naar de vorige.
    for (let ronde = 0; ronde < 4; ronde++) {
      const vorige = hoeken.map((rij) => rij.slice());
      let geweken = false;
      for (let y = 0; y <= H; y++) {
        for (let x = 0; x <= B; x++) {
          const buren = [];
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && (vorige[y + dy] || [])[x + dx]) buren.push(vorige[y + dy][x + dx]);
          const l = T.passendeGrond(vorige[y][x], buren);
          if (l !== vorige[y][x]) {
            hoeken[y][x] = l;
            geweken = true;
          }
        }
      }
      if (!geweken) break;
    }
    const grond = hoeken.map((rij) => rij.join(''));
    const opGras = (x, y) => [[0, 0], [1, 0], [1, 1], [0, 1]].every(([dx, dy]) => GROEIT.has((grond[y + dy] || '')[x + dx]));

    // ---- 4. Wat er staat: wat het eiland heeft, behalve op het plein, en geen boom of struik vlak eromheen ----
    const sleutel = (x, y) => y * B + x;
    const natuur = new Map(); // wat het eiland hier heeft en blijft staan, per tegel
    const gerooid = []; // wat het eiland hier heeft en weg moet
    for (const d of st.dingen) {
      const x = lx(d.x);
      const y = ly(d.y);
      if (op(x, y) === PLEIN || (inKern(x + 0.5, y + 0.5) && isVastNaam(d.naam))) gerooid.push({ x, y, naam: d.naam });
      else natuur.set(sleutel(x, y), { naam: d.naam, x, y });
    }
    const gelegd = []; // wat de maker erbij legt
    const bezet = new Set(); // waar de maker iets legt, of het kamp komt
    const vrijVoor = (x, y) => binnen(x, y) && !bezet.has(sleutel(x, y));
    const rooi = (x, y) => {
      const d = natuur.get(sleutel(x, y));
      if (!d) return;
      natuur.delete(sleutel(x, y));
      gerooid.push(d);
    };
    // wat voor plek dit is, voor de nieuwe soorten (andereBoom)
    const plekVoorBoom = (x, y) =>
      op(x, y) === PLEIN ? 'plein'
        : raakt(x, y, 1, 1, 1, [WATER]) ? 'water'
          : PLEK_VAN_STREEK[land.streek(x, y)] === 'heide' ? 'heide'
            : op(x, y) === BOS ? 'bos'
              : raakt(x, y, 1, 1, 4, [WEG]) ? 'weg'
                : 'wei';
    const leg1 = (naam, x, y) => {
      rooi(x, y);
      gelegd.push({ naam: KAN_ANDERS.has(naam) ? andereBoom(naam, x, y, plekVoorBoom(x, y)) : naam, x, y });
      bezet.add(sleutel(x, y));
    };

    // ---- 5. Het kamp op het plein, en de plek van de marskramer ----
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

    // ---- 6. Vier tot zes oude eiken op het plein ----
    // Niet vlak bij het kamp, ver genoeg uit elkaar. Het kamp staat midden op het plein, en er zijn er zoveel als er passen.
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

    // ---- 7. Een of twee rotspartijen, het liefst aan de rand van het bos, ver van het plein ----
    // Daar komt de steengroeve (vraag 112, c). Een kern van grote rotsen, en kleine eromheen; wat het eiland daar heeft,
    // maakt plaats.
    const rotsen = [];
    {
      // Bij elke rotspartij een plek voor de steengroeve, die het bos en de struiken vrijlaten: zijn voet, met genoeg grote
      // rotsen binnen zijn bereik, en het looppad rondom (`voet` en `bij` van de steengroeve in js/gebouwen.js, en
      // T.GEBOUWEN_INSTELLINGEN.looppad). Zonder die plek groeide het bos er soms helemaal omheen, en kon een land geen
      // steen hakken (4 okt: land 3 en 5).
      const SG = T.GEBOUWEN.steengroeve;
      const lp = T.GEBOUWEN_INSTELLINGEN.looppad;
      let groeven = 0;
      const houdGroeveVrij = (k) => {
        let beste = null;
        for (let gy = k.y - 12; gy <= k.y + 12; gy++) {
          for (let gx = k.x - 12; gx <= k.x + 12; gx++) {
            const s = SG.bij.straal;
            const rots = gelegd.filter((v) => v.naam === 'rots' && v.x >= gx - s && v.x < gx + SG.voet.b + s && v.y >= gy - s && v.y < gy + SG.voet.h + s).length;
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
          for (let x = beste.gx - lp; x < beste.gx + SG.voet.b + lp; x++) {
            if (natuur.has(sleutel(x, y)) && isVastNaam(natuur.get(sleutel(x, y)).naam)) rooi(x, y);
            bezet.add(sleutel(x, y));
          }
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
    }

    // ---- 8. Keuren ----
    delete kamp.bezet;
    const plan = {
      zaad, poging, stijl, b: B, h: H, grond, plein, marskramer, uitgang, brug, bruggen, rotsen,
      // alles wat er staat (wat het eiland heeft en blijft staan, en wat de maker legde), wat de maker erbij legde, en wat
      // er van het eiland weg moest: de kaart van het eiland (T.laadGemaaktGehucht) neemt alleen het verschil over
      voorwerpen: [...natuur.values(), ...gelegd], gelegd, gerooid,
      // js/hoogte.js legt een vlak stuk onder elk huis van het plan: er staan er geen meer, het zijn de huizen van de speler
      huizen: [],
      aanvoerder: { ...kamp.plekken[0].deur }, kamp, eiland: { zaad: land.zaad, x0: land.x0, y0: land.y0 },
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
    // Hoe ver elke tegel te voet ligt van de tent van de aanvoerder.
    const afstand = new Int32Array(B * H).fill(-1);
    const start = plan.aanvoerder.y * B + plan.aanvoerder.x;
    if (vast[start]) return 'de tent van de aanvoerder is vast'; // geen tekst
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
  // misging. Zonder `land` is er geen land: kies het stuk met T.planOpEiland. `ookKeuren(plan)` keurt een plan dat deugt
  // nog verder, met de reden als het niet deugt, of null.
  T.maakGehucht = function (zaad, land, pogingen = IN().pogingen, ookKeuren = null) {
    if (!land) throw new Error('de maker legt alleen een land op het eiland: geef een `land` (T.landVanEiland), of vraag T.planOpEiland(zaad)'); // geen tekst
    const waarom = [];
    for (let poging = 0; poging < pogingen; poging++) {
      const plan = leg(zaad, poging, land);
      const mis = plan.mis || (ookKeuren && ookKeuren(plan));
      if (!mis) {
        plan.waarom = waarom;
        return plan;
      }
      waarom.push(mis);
    }
    const tel = {};
    for (const w of waarom) tel[w] = (tel[w] || 0) + 1;
    const vaakst = Object.entries(tel).sort((a, b) => b[1] - a[1]).slice(0, 5);
    throw new Error(`de maker kreeg met zaad ${zaad} geen land dat deugt: ${vaakst.map(([w, n]) => (n > 1 ? `${w} (${n} keer)` : w)).join('; ')}`); // geen tekst
  };
  // Voor de toetsen: een plan keuren.
  T.keurGehucht = keur;

  // ---------------------------------------------------------------------------------------------
  // De grondtegels: welke tegel bij vier hoekpunten hoort, en wat er staat op naam
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
  let grondTegels = null;
  function grondIndex() {
    if (grondTegels) return grondTegels;
    const vlak = {};
    const overgang = {};
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
      });
      for (const n of Object.keys(vlakVan)) if (!vlak[n]) vlak[n] = vlakVan[n];
      for (const k of Object.keys(overgangVan)) if (!overgang[k]) overgang[k] = overgangVan[k];
    };
    leesVel('rand', 1);
    if (T.TEGELS.kust) leesVel('kust', T.KUST_GID());
    return (grondTegels = { vlak, overgang });
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
  // Voor de grondtegels van het eiland (grondTegel).
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

  // De tekening van wat er op het eiland groeit (T.landStuk geeft een naam, "eik"), in hetzelfde vel als de maker hem legt:
  // "bomen/eik". Voor de stukken van een kaart van het eiland (js/wereld.js).
  T.natuurTegel = (naam) => opNaam(naam);

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

  // Het plan op het eiland van dit nummer (vraag 117, stap 2): op jouw plek (js/eiland.js), en lukt het daar niet, dan
  // op de plek van een ander dorp, in een vaste volgorde, zodat hetzelfde nummer hetzelfde spel geeft. Per plek minder
  // pogingen dan op een land van de maker, want een andere plek is er wel. Een plan deugt hier pas als zijn plein een
  // marktplek heeft met rijen van `marktRij` (daarvoor maakt hij de kaart al, en die bewaart hij voor
  // T.laadGemaaktGehucht). Met `bij` (een dorpsplek, { x, y }) een plan voor een dorp naast een ander (vraag 170, stap
  // 6a): op de dichtste andere plek die minstens `anderDorp` tegels weg ligt, niet op een plek uit `niet` (hun namen).
  T.planOpEiland = function (zaad, { bij = null, niet = [] } = {}) {
    const E = T.eilandVan(zaad);
    const dorpen = E.plekken.filter((p) => p.soort === 'dorp');
    const af = (p) => Math.hypot(p.x - bij.x, p.y - bij.y);
    const volgorde = bij
      ? dorpen.filter((p) => !niet.includes(p.naam) && af(p) >= IN().anderDorp).sort((a, b) => af(a) - af(b))
      : [...dorpen.filter((d) => d.jij), ...dorpen.filter((d) => !d.jij)];
    const waarom = [];
    for (const p of volgorde) {
      const land = T.landVanEiland(E, p, IN().b, IN().h);
      const metMarkt = (plan) => {
        plan.eiland.dorp = p.naam;
        plan.stuk = land.stuk; // het land van het eiland zelf, voor het verschil (wereldVanPlan)
        const w = wereldVanPlan(plan);
        const rij = w.plekken[0].markt.rijen[0];
        if (!rij || rij.lengte < IN().marktRij) return `de marktplek heeft rijen van ${rij ? rij.lengte : 0}`; // geen tekst
        WERELD.set(plan, w);
        return null;
      };
      try {
        return T.maakGehucht(zaad, land, 30, metMarkt);
      } catch (e) {
        waarom.push(`${p.naam}: ${e.message}`);
      }
    }
    throw new Error(`geen land op het eiland van ${zaad}: ${waarom.join('; ')}`); // geen tekst
  };

  // ---- Het land van een stuk van het eiland (B2b, vraag 117, stap 3; ontwerp/kaarten.md, "Het hele eiland") ----
  // De grond en wat er groeit op b bij h tegels van het eiland vanaf tegel (x0, y0), alleen uit het nummer en de plek: wat
  // het eiland heeft (js/eiland.js) met de regels van de maker erop (het water, de weg, de grond van de streek, wat niet
  // naast elkaar kan liggen, het bos, de bomen, de rotsen en het groen), elk lot uit de plek van zijn tegel (lotOp) en
  // nooit uit een dobbelsteen die doorloopt. Zo is een stuk hetzelfde in welke volgorde je het maakt, en passen twee
  // stukken aan hun naad (test/landstuk.test.cjs). Het rekent STUK_MARGE tegels om het stuk mee, want wat een tegel wordt,
  // hangt af van wat er tot zo ver omheen ligt: de grond wijkt tot vier hoekpunten ver, en een boom kijkt vier tegels ver
  // naar een weg. Het menselijke (het plein, de wegen ernaartoe, het kamp) legt de maker erover. Eén zuivere functie, zodat
  // een worker het later kan overnemen (Marcel, 13 okt: "eerst meten is goed").
  // Geeft { x0, y0, b, h, hoek, grond, soort, dingen }: de grond per hoekpunt als letter (GRONDSOORT), hoekpunt (vx, vy)
  // op plek (vy - y0) * (b + 1) + (vx - x0); per tegel het nummer van zijn grondtegel (een gid: rand vanaf 1, kust erachter)
  // en wat hij is (VRIJ, WEG, WATER of BOS, zoals in de maker), tegel (x, y) op plek (y - y0) * b + (x - x0); en wat er
  // staat, als { naam, x, y }.
  const STUK_MARGE = 8;
  // Een getal van 0 tot 1 per tegel, per eiland (z) en per soort lot (zout).
  function lotOp(z, x, y, zout) {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(zout, 2246822519) + Math.imul(z, 3266489917)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  T.landStuk = function (E, x0, y0, b, h) {
    const G = IN().groei;
    const M = STUK_MARGE;
    const lot = (x, y, zout) => lotOp(E.zaad, x, y, zout);
    // Het rekenvak: het stuk met de marge eromheen, in tegels (B bij H, vanaf X0, Y0) en in hoekpunten (N bij H + 1).
    const X0 = x0 - M;
    const Y0 = y0 - M;
    const B = b + 2 * M;
    const H = h + 2 * M;
    const N = B + 1;
    const tegels = T.eilandStuk(E, X0, Y0, B, H);
    const punten = T.eilandStuk(E, X0 - 0.5, Y0 - 0.5, N, H + 1);
    const binnen = (x, y) => x >= X0 && y >= Y0 && x < X0 + B && y < Y0 + H;
    const ti = (x, y) => (y - Y0) * B + (x - X0);
    const hoekBinnen = (vx, vy) => vx >= X0 && vy >= Y0 && vx <= X0 + B && vy <= Y0 + H;
    const hi = (vx, vy) => (vy - Y0) * N + (vx - X0);
    const streek = (x, y) => T.EILAND_STREKEN[tegels.streek[ti(x, y)]];

    // De grond per hoekpunt: het water wint, wat ernaast ligt is gras, dan de weg van het eiland (zandpad), en de rest de
    // grond van de streek; daarna wijkt wat niet naast elkaar kan liggen (T.passendeGrond), zoals de maker (stap 6).
    // Elke ronde kijkt naar de vorige, niet naar wat in dezelfde ronde al week, zodat het niet van de volgorde afhangt.
    const nat = new Uint8Array(N * (H + 1));
    for (let i = 0; i < nat.length; i++) if (isNat(T.grondVanStreek(T.EILAND_STREKEN[punten.streek[i]]))) nat[i] = 1;
    const natOp = (vx, vy) => hoekBinnen(vx, vy) && nat[hi(vx, vy)] === 1;
    let letter = new Array(N * (H + 1));
    for (let vy = Y0; vy <= Y0 + H; vy++) {
      for (let vx = X0; vx <= X0 + B; vx++) {
        const i = hi(vx, vy);
        let naast = false;
        for (let dy = -1; dy <= 1 && !naast; dy++) for (let dx = -1; dx <= 1; dx++) if (natOp(vx + dx, vy + dy)) naast = true;
        letter[i] = nat[i] ? T.grondVanStreek(T.EILAND_STREKEN[punten.streek[i]]) : naast ? 'g' : punten.weg[i] ? 'z' : T.grondVanStreek(T.EILAND_STREKEN[punten.streek[i]]);
      }
    }
    for (let ronde = 0; ronde < 4; ronde++) {
      const vorige = letter.slice();
      let geweken = false;
      for (let vy = Y0; vy <= Y0 + H; vy++) {
        for (let vx = X0; vx <= X0 + B; vx++) {
          const buren = [];
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && hoekBinnen(vx + dx, vy + dy)) buren.push(vorige[hi(vx + dx, vy + dy)]);
          const i = hi(vx, vy);
          const l = T.passendeGrond(vorige[i], buren);
          if (l !== vorige[i]) {
            letter[i] = l;
            geweken = true;
          }
        }
      }
      if (!geweken) break; // dan wijkt er in de rondes erna ook niets meer
    }
    const opGras = (x, y) => GROEIT.has(letter[hi(x, y)]) && GROEIT.has(letter[hi(x + 1, y)]) && GROEIT.has(letter[hi(x + 1, y + 1)]) && GROEIT.has(letter[hi(x, y + 1)]);

    // Wat een tegel is: water (een hoekpunt is nat), weg (een hoekpunt ligt aan de weg), bos (waar het eiland woud,
    // broek of een boom heeft, niet vlak naast de weg), of vrij (stap 3 tot 5 van de maker).
    const soort = new Uint8Array(B * H);
    const isWeg = new Uint8Array(B * H);
    const isWater = new Uint8Array(B * H);
    for (let y = Y0; y < Y0 + H; y++) {
      for (let x = X0; x < X0 + B; x++) {
        const hoeken = [hi(x, y), hi(x + 1, y), hi(x, y + 1), hi(x + 1, y + 1)];
        const t = ti(x, y);
        if (hoeken.some((i) => nat[i])) soort[t] = WATER;
        else if (hoeken.some((i) => punten.weg[i])) soort[t] = WEG;
        isWeg[t] = soort[t] === WEG ? 1 : 0;
        isWater[t] = soort[t] === WATER ? 1 : 0;
      }
    }
    // Ligt er binnen r tegels iets van deze soort (een vierkant om de tegel)?
    // Eerst langs de rij, dan langs de kolom.
    const verbreed = (bron, r) => {
      const rij = new Uint8Array(B * H);
      const uit = new Uint8Array(B * H);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < B; x++) {
          for (let d = Math.max(-r, -x); d <= r && x + d < B; d++) if (bron[y * B + x + d]) rij[y * B + x] = 1;
        }
      }
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < B; x++) {
          for (let d = Math.max(-r, -y); d <= r && y + d < H; d++) if (rij[(y + d) * B + x]) uit[y * B + x] = 1;
        }
      }
      return uit;
    };
    const wegBij1 = verbreed(isWeg, 1);
    for (let y = Y0; y < Y0 + H; y++) {
      for (let x = X0; x < X0 + B; x++) {
        const t = ti(x, y);
        if (soort[t] !== VRIJ || wegBij1[t]) continue;
        const s = streek(x, y);
        if (s === 'woud' || s === 'broek' || tegels.boom[t]) soort[t] = BOS;
      }
    }
    const wegBij2 = verbreed(isWeg, 2);
    const wegBij4 = verbreed(isWeg, 4);
    const waterBij1 = verbreed(isWater, 1);
    const isBos = new Uint8Array(B * H);
    for (let t = 0; t < B * H; t++) isBos[t] = soort[t] === BOS ? 1 : 0;
    const bosBij1 = verbreed(isBos, 1);
    const natOfWeg = new Uint8Array(B * H);
    for (let t = 0; t < B * H; t++) natOfWeg[t] = isWeg[t] || isWater[t];
    const natOfWegBij3 = verbreed(natOfWeg, 3);
    const plekVoorBoom = (x, y) => {
      const t = ti(x, y);
      return waterBij1[t] ? 'water' : PLEK_VAN_STREEK[streek(x, y)] === 'heide' ? 'heide' : soort[t] === BOS ? 'bos' : wegBij4[t] ? 'weg' : 'wei';
    };

    // Wat er staat, één ding per tegel, in de volgorde van de maker (stap 7): de rotsen van het eiland, de bomen van het
    // bos, losse bomen en groepjes struiken in de wei, en dan wat er verder groeit.
    const ding = new Array(B * H).fill(null);
    // Op een brug van het eiland (js/eiland.js, legBruggen) en zijn landhoofden staat niets: geen boom, geen waterlelie.
    const leg = (naam, x, y) => {
      if (E.brugOp.has(y * E.maat + x)) return;
      ding[ti(x, y)] = KAN_ANDERS.has(naam) ? andereBoom(naam, x, y, plekVoorBoom(x, y), lot(x, y, 821)) : naam;
    };
    const losOpGras = (x, y) => binnen(x, y) && !ding[ti(x, y)] && soort[ti(x, y)] === VRIJ && opGras(x, y);
    for (let y = Y0; y < Y0 + H; y++) {
      for (let x = X0; x < X0 + B; x++) {
        const t = ti(x, y);
        if (soort[t] === VRIJ && streek(x, y) === 'rots' && opGras(x, y)) {
          const l = lot(x, y, 811);
          if (l < 0.55) leg(l < 0.3 ? 'rots' : 'kleineRots', x, y);
        } else if (soort[t] === BOS && tegels.boom[t] && opGras(x, y)) {
          let k = 0;
          leg(boomOpEiland(streek(x, y), () => lot(x, y, 801 + k++)), x, y);
        }
      }
    }
    // Per vak een plek, en het lot of daar iets staat; een vak dat buiten het rekenvak valt, telt niet.
    const perVak = (vak, zout, doe) => {
      for (let vy = Math.floor(Y0 / vak); vy * vak < Y0 + H; vy++) {
        for (let vx = Math.floor(X0 / vak); vx * vak < X0 + B; vx++) {
          if (lot(vx, vy, zout) >= doe.kans) continue;
          const x = vx * vak + Math.floor(lot(vx, vy, zout + 1) * vak);
          const y = vy * vak + Math.floor(lot(vx, vy, zout + 2) * vak);
          if (binnen(x, y)) doe.leg(x, y);
        }
      }
    };
    perVak(G.losseBomen.vak, 831, {
      kans: G.losseBomen.kans,
      leg: (x, y) => {
        if (losOpGras(x, y) && !wegBij2[ti(x, y)]) leg(lot(x, y, 834) < 0.75 ? 'eik' : 'berk', x, y);
      },
    });
    // Een groepje kiest zijn tegels zonder naar de andere groepjes te kijken, en willen er twee dezelfde tegel, dan krijgt
    // de eerste hem en zoekt de tweede niet verder: anders hangt een groepje aan zijn buren, en die weer aan de hunne.
    const RONDOM = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    const struiken = [];
    perVak(G.struikgroepjes.vak, 841, {
      kans: G.struikgroepjes.kans,
      leg: (x, y) => {
        if (soort[ti(x, y)] !== VRIJ || natOfWegBij3[ti(x, y)]) return;
        let aantal = 2 + Math.floor(lot(x, y, 844) * 4);
        const volgorde = RONDOM.map(([dx, dy]) => [x + dx, y + dy, lot(x + dx, y + dy, 845)]).sort((p, q) => p[2] - q[2]);
        for (const [sx, sy] of volgorde) {
          if (aantal <= 0) break;
          if (!losOpGras(sx, sy)) continue;
          struiken.push([sx, sy]);
          aantal--;
        }
      },
    });
    for (const [x, y] of struiken) if (!ding[ti(x, y)]) leg(lot(x, y, 847) < 0.75 ? 'struik' : 'bessenStruik', x, y);
    // Wat er verder groeit, op een tegel waar nog niets staat: onder de bomen en in het bos varens en struiken, in de wei
    // graspollen en bloemen (in plekken, uit een gladde ruis), hoog gras langs het water en in het veen, en op de hei wat
    // graspollen; en dan het groen eronder (de heide, de oever, het water, de bosrand).
    const isBoom = new Uint8Array(B * H);
    for (let t = 0; t < B * H; t++) isBoom[t] = ding[t] && T.BOMEN[ding[t]] && !T.BOMEN[ding[t]].struik ? 1 : 0;
    const onderBoom = verbreed(isBoom, 2);
    const glad = (t) => t * t * (3 - 2 * t);
    const bloemRuis = (x, y) => {
      const fx = x / 9;
      const fy = y / 9;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const tx = glad(fx - ix);
      const ty = glad(fy - iy);
      const v = (a, c) => lot(a, c, 861);
      const boven = v(ix, iy) + (v(ix + 1, iy) - v(ix, iy)) * tx;
      const onder = v(ix, iy + 1) + (v(ix + 1, iy + 1) - v(ix, iy + 1)) * tx;
      return boven + (onder - boven) * ty;
    };
    const bijWater = (x, y) => {
      for (let dy = -1; dy <= 2; dy++) for (let dx = -1; dx <= 2; dx++) if (natOp(x + dx, y + dy)) return true;
      return false;
    };
    const trek = (kansen, t) => {
      for (const naam in kansen) if ((t -= kansen[naam]) < 0) return naam;
      return null;
    };
    for (let y = Y0; y < Y0 + H; y++) {
      for (let x = X0; x < X0 + B; x++) {
        const t = ti(x, y);
        if (ding[t]) continue;
        const o = soort[t];
        const s = streek(x, y);
        let naam = null;
        if (o === VRIJ && s === 'heide') naam = trek(G.heide, lot(x, y, 871));
        else if ((o !== VRIJ && o !== BOS) || !opGras(x, y)) naam = null;
        else if (o === VRIJ && (s === 'veen' || s === 'broek') && lot(x, y, 872) < 0.2) naam = 'hoogGras';
        else if (o === BOS || onderBoom[t]) naam = trek(G.bos, lot(x, y, 873));
        else if (bijWater(x, y) && lot(x, y, 874) < G.oever.hoogGras) naam = 'hoogGras';
        else if (bloemRuis(x, y) > G.bloemen[0] && lot(x, y, 875) < G.bloemen[1]) naam = 'bloemen';
        else naam = trek(G.weide, lot(x, y, 876));
        if (!naam) {
          if (o === WATER) naam = s !== 'zee' ? trek(G.waterGroen, lot(x, y, 951)) : null;
          else if (o === VRIJ && s === 'heide') naam = trek(G.heideGroen, lot(x, y, 952));
          else if ((o !== VRIJ && o !== BOS) || !opGras(x, y)) naam = null;
          else if (bijWater(x, y)) naam = trek(G.oeverGroen, lot(x, y, 954));
          else if (o === VRIJ && bosBij1[t]) naam = trek(G.bosrand, lot(x, y, 955));
        }
        if (naam) leg(naam, x, y);
      }
    }

    // Wat het stuk zelf is: de hoekpunten, de grondtegels en de dingen binnen het stuk. Onder een brug van het eiland
    // blijft het water water; de brug zelf tekent js/tekenen.js erover.
    const hoek = new Array((b + 1) * (h + 1));
    for (let vy = y0; vy <= y0 + h; vy++) for (let vx = x0; vx <= x0 + b; vx++) hoek[(vy - y0) * (b + 1) + (vx - x0)] = letter[hi(vx, vy)];
    const grond = new Uint16Array(b * h);
    const soorten = new Uint8Array(b * h);
    const dingen = [];
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + b; x++) {
        const i = (y - y0) * b + (x - x0);
        grond[i] = grondTegel(E, x, y, [letter[hi(x, y)], letter[hi(x + 1, y)], letter[hi(x + 1, y + 1)], letter[hi(x, y + 1)]]);
        soorten[i] = soort[ti(x, y)];
        const d = ding[ti(x, y)];
        if (d) dingen.push({ naam: d, x, y });
      }
    }
    return { x0, y0, b, h, hoek, grond, soort: soorten, dingen };
  };
  // De grondtegel (een gid) van tegel (x, y) van het eiland met deze vier hoekpunten (boven, rechts, onder, links; als
  // letter), met een vaste keus uit de varianten per tegel. Voor T.landStuk, en voor de maker als hij de grond van zijn
  // plein erover legt (T.laadGemaaktGehucht).
  function grondTegel(E, x, y, letters) {
    const hoeken = T.grondTegelHoeken(letters.map((l) => GRONDSOORT[l]));
    const g = grondIndex();
    const lijst = new Set(hoeken).size === 1 ? g.vlak[hoeken[0]] : g.overgang[hoeken.join(',')];
    if (!lijst) throw new Error(`het eiland heeft geen grondtegel voor ${hoeken.join(', ')} op (${x}, ${y})`); // geen tekst
    return lijst[Math.floor(lotOp(E.zaad, x, y, 63) * lijst.length)];
  }

  // Het land van de maker als wereld (T.gebied, js/gebied.js): een kaart van het eiland (T.eilandKaart, js/wereld.js; B2b),
  // met het plan erover. De kaart neemt alleen over wat de maker anders legde dan het eiland: de grond van het plein
  // (w.grondAnders), wat er van het eiland weg moest (w.gerooid), en wat hij erbij legde (de eiken, de rotsen). Alles in
  // de tegels van het eiland. Het is het lege begin van een nieuw spel: het land met een open plek voor het plein en het
  // kamp erop. Open zijn de stukken om het land, tot `zicht` tegels erbuiten.
  T.laadGemaaktGehucht = function (zaad) {
    const plan = T.planOpEiland(zaad);
    const w = WERELD.get(plan) || wereldVanPlan(plan);
    WERELD.delete(plan);
    return w;
  };

  // Nog een dorp op kaart w van het eiland (werklijst vraag 170, stap 6a; Marcel, 16 okt: "A1"): op de dichtste andere
  // dorpsplek bij `bij` die minstens `anderDorp` tegels weg ligt, en niet op een plek uit `niet`. Het plan komt op de
  // kaart zoals bij het eerste dorp (legPlanOp, hieronder), met zijn marktplek; de keuring deed dat op een eigen kaart
  // (T.planOpEiland), en die gaat weg. Geeft { plek, aanvoerder }: de plek voor T.nieuwDorp (js/dorp.js), en zijn
  // aanvoerder, die al op de kaart staat.
  T.legDorpOpKaart = function (w, { bij, niet = [] }) {
    const plan = T.planOpEiland(w.eiland.zaad, { bij, niet });
    WERELD.delete(plan);
    const uit = legPlanOp(w, plan);
    uit.plek.markt = T.zoekMarktPlek({ wereld: w, plek: uit.plek });
    return uit;
  };
  // De kaart die T.planOpEiland voor zijn keuring maakte, bij het plan: een spel krijgt hem, zonder hem opnieuw te maken.
  const WERELD = new WeakMap();
  function wereldVanPlan(plan) {
    const { x0, y0 } = plan.eiland;
    const w = T.eilandKaart(plan.eiland.zaad, { x: x0, y: y0, b: plan.b, h: plan.h });
    w.naam = T.t('The hamlet');
    w.proef = true; // het hangt nog aan geen andere kaart vast: de weg de wereld in leidt nergens heen (js/gebied.js)
    const { plek } = legPlanOp(w, plan);
    w.maker = { zaad: plan.zaad, poging: plan.poging };
    if (plan.stijl) w.stijl = plan.stijl;
    if (T.HOOGTE_INSTELLINGEN.aan) w.hoogte = T.legHoogte(plan, w); // de spelregel "Hoogte" (js/hoogte.js)
    plek.markt = T.zoekMarktPlek({ wereld: w, plek }); // de marktplek op het plein (js/markt.js; Marcel, 12 okt: "Plein krijgt plaatsen")
    return w;
  }

  // Een plan op kaart w van het eiland: wat de maker anders legde dan het eiland (de grond, wat er weg moest, wat hij
  // erbij legde), de stukken eromheen open, de plek van het dorp (D.plek, T.legePlek in js/wereld.js: zijn land, het
  // plein, de plek van de marskramer, het kamp en de weg de wereld in), en de aanvoerder bij zijn tent in het kamp
  // (js/begin.js zet hem bij de kar aan de rand). Het vak van de kaart (T.kaartVak) groeit om het land van het dorp.
  // Geeft { plek, aanvoerder }; de marktplek zoekt de aanroeper.
  function legPlanOp(w, plan) {
    const E = T.eilandVan(plan.eiland.zaad);
    const { x0, y0 } = plan.eiland;
    const B = plan.b;
    const H = plan.h;
    const st = plan.stuk;
    // de grond: waar de vier hoekpunten van een tegel anders zijn dan die van het eiland (onder een brug blijft die van het
    // eiland)
    const nr = (x, y) => T.tegelNummer(x0 + x, y0 + y);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        const hoeken = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
        if (hoeken.every(([vx, vy]) => plan.grond[vy][vx] === st.hoek[vy * (B + 1) + vx]) || E.brugOp.has((y0 + y) * E.maat + x0 + x)) continue;
        w.grondAnders.set(nr(x, y), grondTegel(E, x0 + x, y0 + y, hoeken.map(([vx, vy]) => plan.grond[vy][vx])));
      }
    }
    for (const d of plan.gerooid) w.gerooid.add(nr(d.x, d.y));
    const D = IN().zicht;
    T.openVak(w, { x: x0 - D, y: y0 - D, b: B + 2 * D, h: H + 2 * D });
    for (const d of plan.gelegd) {
      const t = T.opzoekTegelNaam(opNaam(d.naam));
      T.zetVoorwerp(w, T.maakVoorwerp(t, x0 + d.x, y0 + d.y));
      if (t.eig.vast) T.zetTegel(w, x0 + d.x, y0 + d.y, 'muur');
    }
    const op = (p) => ({ ...p, x: x0 + p.x, y: y0 + p.y });
    const k = plan.kamp;
    const plek = {
      naam: plan.eiland.dorp || null, vak: { x: x0, y: y0, b: B, h: H },
      plein: plan.plein.map(([x, y]) => [x0 + x, y0 + y]), marskramer: op(plan.marskramer), heer: null,
      kamp: { vuur: op(k.vuur), kar: op(k.kar), straal: k.straal, plekken: k.plekken.map((p) => ({ ...op(p), voet: op(p.voet), deur: op(p.deur) })) },
      markt: null, uitgang: { x: x0 + plan.uitgang.x, y: y0 + plan.uitgang.y },
    };
    w.plekken.push(plek);
    w.pleinen.push(plek.plein);
    const aanvoerder = T.maakWezen('aanvoerder', x0 + plan.aanvoerder.x, y0 + plan.aanvoerder.y);
    w.wezens.push(aanvoerder);
    w.overgangen.push({ ...op(plan.uitgang), naar: 'wereld', komt: null, tekst: T.t('The road into the world') });
    const v = w.vak;
    const [vx0, vy0] = [Math.min(v.x, x0), Math.min(v.y, y0)];
    w.vak = { x: vx0, y: vy0, b: Math.max(v.x + v.b, x0 + B) - vx0, h: Math.max(v.y + v.h, y0 + H) - vy0 };
    return { plek, aanvoerder };
  }
})(globalThis.Spel = globalThis.Spel || {});
