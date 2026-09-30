// De maker: een gehucht dat elk spel anders ligt (ontwerp/werklijst.md, vraag 69, C; Marcel, 30 sep 2026:
// "De maker nu"). Het buurdorp krijgt er een, en elk spel ligt het anders.
//
// Uit dezelfde delen als het ontworpen gehucht (gereedschap/tiled/maak-gehucht.cjs, en ontwerp/spel.md, "Het
// eerste proefje"): het plein als hart, open en onregelmatig, waar niet gebouwd wordt; het huis van de schout
// erachter, met zijn deur op het zand; de herberg en een paar hutten eromheen; verder naar buiten de
// boerderijen, elk bij zijn velden; de heide met de schaapskooi; de weg met het bruggetje over de beek; en de
// bosrand. Wat vastligt en wat het lot kiest, staat bij elke stap hieronder.
//
// Hij keurt zijn eigen werk (keur hieronder): kan iedereen overal komen, ligt er niet te veel van het plein
// achter een dak, zijn de akkers even groot als in het ontworpen gehucht. Deugt het niet, dan probeert hij het
// met hetzelfde zaad opnieuw, en hetzelfde zaad geeft altijd hetzelfde gehucht.
//
// T.maakGehucht(zaad) legt het plan (de indeling, zonder tegels); T.kaartVanGehucht(plan) maakt er een kaart met een
// betekenisbestand van, in dezelfde vorm als een kaart uit Tiled, zodat het spel een gemaakt gehucht inleest zoals het
// ontworpen gehucht (T.laadKaart, js/kaart.js). Met de spelregel "Je gehucht" op "Elk spel een ander" (vraag 70, C;
// Marcel, 30 sep: "c ja") begint een nieuw spel op een gemaakt gehucht, uit het zaad van dat spel (T.beginOpKaart,
// js/gebied.js). De schets (gereedschap/maker/schets.cjs, npm run maker) tekent plannen als plattegrond.
//
// Hij gebruikt de regels uit js/ zelf: de dobbelsteen (T.dobbelsteen, js/boeren.js), de rand van het plein
// (T.binnenRand, js/wereld.js), de maten en deuren van de tekeningen en de grondtegels (T.TEGELS, tegels/tegels.js).
(function (T) {
  'use strict';

  T.MAKER_INSTELLINGEN = {
    // Legt de maker ook je eigen gehucht? De spelregel "Je gehucht" (js/opties.js) zet dit; het ontworpen gehucht is
    // de standaard.
    eigenGehucht: false,
    b: 76,
    h: 76,
    // Zo vaak probeert hij het met hetzelfde zaad, tot een gehucht deugt.
    pogingen: 120,
    // De bosrand langs een of twee kanten: zo diep, en per rij zo dicht, dunner naar het gehucht toe.
    bosDiep: 7,
    bosDicht: [0.85, 0.7, 0.55, 0.4, 0.28, 0.16, 0.08],
    // Het plein, in halve maten langs u (in beeld naar rechts) en v (naar de camera). Het ontworpen plein is zo'n
    // 10,7 bij 6,2, en 214 tegels.
    pleinBreed: [9.5, 11.5],
    pleinDiep: [5.8, 7],
    pleinTegels: [165, 250],
    // Een dak dekt in ons beeld tot zo'n acht tegels erachter af (ontwerp/spel.md, bij het plein). Van het plein
    // mag niet meer dan dit deel achter een dak liggen: in het ontworpen gehucht, dat Marcel goedkeurde, is dat 23 van
    // de 214 tegels (11%), zo geteld.
    achterDak: 8,
    pleinAchterDak: 0.12,
    // De akkers per boer, even groot als in het ontworpen gehucht (samen 209 tegels, waarvan 30 weide), zodat de
    // oogst en de balans niet verschuiven. Welke boer welke krijgt, kiest het lot.
    akkers: [
      [{ tegels: 42 }, { tegels: 25 }],
      [{ tegels: 28 }, { tegels: 30, bestemming: 'weide' }],
      [{ tegels: 28 }],
      [{ tegels: 28 }],
      [{ tegels: 28 }],
    ],
    // Een akker ligt nooit tegen de rand van de kaart of in de bosrand (maak-gehucht.cjs): zoveel tegels blijven
    // ertussen.
    akkerRand: 3,
    // De meent: de heide waar de schapen samen grazen, zo groot als in het ontworpen gehucht (23 bij 8).
    meent: [[23, 8], [8, 23], [16, 12], [12, 16], [14, 13], [13, 14]],
    // De tekeningen (tegels/huizen.tsx): elke boerderij één keer, en voor de rest een keus.
    tekeningen: {
      schout: ['schoutshuis'],
      herberg: ['herberg1'],
      huis: ['huis1', 'huis5', 'huis2'],
      hut: ['hut1', 'hut2', 'hut3', 'hut4'],
      boerderij: ['boerderij1', 'boerderij2', 'boerderij3', 'boerderij4', 'boerderij5'],
      kooi: ['schuurBlokhut'],
    },
  };
  const IN = () => T.MAKER_INSTELLINGEN;

  // Wat een tegel van de kaart is, terwijl de maker legt. Een gebouw houdt een erf om zich heen vrij, zodat er
  // tussen twee huizen altijd een paar tegels liggen.
  const VRIJ = 0;
  const PLEIN = 1;
  const WEG = 2;
  const WATER = 3;
  const HUIS = 4;
  const ERF = 5;
  const AKKER = 6;
  const MEENT = 7;
  const BOS = 8;

  // Een tekening opzoeken: zijn maat, en waar zijn deur zit (anders het midden van de zuidkant, zoals T.deurVan
  // in js/bewoners.js). `kant` zegt naar welke kant de deur kijkt.
  function tekening(naam) {
    for (const vel of Object.keys(T.TEGELS)) {
      const t = T.TEGELS[vel].tiles.find((x) => x && x.naam === naam);
      if (!t) continue;
      const [b, d] = t.beslaat || [1, 1];
      const deur = t.deur || [Math.floor(b / 2), d];
      const kant = deur[1] >= d ? { x: 0, y: 1 } : deur[0] >= b ? { x: 1, y: 0 } : deur[0] < 0 ? { x: -1, y: 0 } : { x: 0, y: -1 };
      return { naam, vel, b, d, deur, kant };
    }
    throw new Error(`de maker kent geen tekening "${naam}" (tegels/tegels.js)`);
  }

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

  // Welke tegels een dak afdekt: in ons beeld staat de camera aan de kant van +x+y, en een dak dekt de tegels
  // achter zich (kleinere x+y) in dezelfde kolom op het scherm (x−y), tot `achterDak` rijen ver.
  function achterDakVan(huizen, isDoel, B, H) {
    const verborgen = new Set();
    for (const h of huizen) {
      for (let by = h.y; by < h.y + h.d; by++) {
        for (let bx = h.x; bx < h.x + h.b; bx++) {
          for (let k = 1; k <= IN().achterDak; k++) {
            // k rijen dieper (x+y k kleiner), in dezelfde kolom op het scherm of een halve ernaast: van de k stappen
            // terug gaat de helft langs x en de helft langs y
            for (const dx of new Set([Math.floor(k / 2), Math.ceil(k / 2)])) {
              const px = bx - dx;
              const py = by - (k - dx);
              if (px < 0 || py < 0 || px >= B || py >= H) continue;
              if (isDoel(px, py)) verborgen.add(py * B + px);
            }
          }
        }
      }
    }
    return verborgen;
  }

  // Eén poging: een plan, of null met de reden waarom het niet deugde.
  function leg(zaad, poging) {
    const I = IN();
    const B = I.b;
    const H = I.h;
    const r = T.dobbelsteen((Math.imul(zaad >>> 0, 7919) ^ Math.imul(poging + 1, 104729)) >>> 0);
    const tussen = (a, b) => a + (b - a) * r();
    const kies = (lijst) => lijst[Math.floor(r() * lijst.length)];
    const schud = (lijst) => {
      const l = lijst.slice();
      for (let i = l.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [l[i], l[j]] = [l[j], l[i]];
      }
      return l;
    };
    let vak = new Uint8Array(B * H);
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
    // Tellen hoeveel tegels in een vak iets zijn, in één stap: een optelsom over de hele kaart (76 bij 76, dus
    // niets), die pas opnieuw wordt opgeteld als er sinds de vorige keer iets veranderde. Zo kost "past dit huis
    // hier?" even veel voor een hut als voor een akker van veertig tegels.
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
      const sleutel = soorten.join(',');
      let s = sommen.get(sleutel);
      if (!s || s.versie !== versie) {
        s = { versie, tel: optelsom((x, y) => soorten.includes(vak[y * B + x])) };
        sommen.set(sleutel, s);
      }
      return s.tel;
    };
    // Staat er in dit vak (met een rand eromheen) iets van deze soorten?
    const raakt = (x0, y0, b, h, rand, soorten) => somVan(soorten)(x0 - rand, y0 - rand, b + 2 * rand, h + 2 * rand) > 0;

    // ---- 1. Het landschap: waar de weg loopt, waar de beek ligt, en waar het bos ----
    // De weg loopt dwars door het gehucht, van rand tot rand: langs x of langs y. De beek ligt aan één eind ervan,
    // zodat de weg er met een bruggetje overheen gaat, zoals in het ontworpen gehucht. Om het maar één keer op te
    // schrijven, rekent de maker langs de weg (a) en dwars erop (c); xy() zet dat om naar tegels.
    const as = r() < 0.5 ? 'x' : 'y';
    const xy = (a, c) => (as === 'x' ? [a, c] : [c, a]);
    const ac = (x, y) => (as === 'x' ? [x, y] : [y, x]);
    const LANGS = as === 'x' ? B : H;
    const DWARS = as === 'x' ? H : B;
    const beekVooraan = r() < 0.5; // de beek bij a = 0, anders aan de overkant
    const uitgangBijBeek = r() < 0.35; // kom je over het bruggetje binnen, of van de andere kant?
    // Het bos: langs een of twee randen, het liefst aan de achterkant (in beeld boven: y = 0 en x = 0).
    const randen = { noord: 3, west: 3, oost: 1, zuid: 1 };
    const trek = () => {
      let som = 0;
      for (const k in randen) som += randen[k];
      let t = r() * som;
      for (const k in randen) if ((t -= randen[k]) < 0) return k;
      return 'noord';
    };
    const bos = [trek()];
    if (r() < 0.45) {
      delete randen[bos[0]];
      bos.push(trek());
    }
    const bosAfstand = (x, y) => {
      let d = 1e9;
      for (const k of bos) d = Math.min(d, k === 'noord' ? y : k === 'west' ? x : k === 'zuid' ? H - 1 - y : B - 1 - x);
      return d;
    };

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
    if (pleinTegels < I.pleinTegels[0] || pleinTegels > I.pleinTegels[1]) return mis(`het plein is ${pleinTegels} tegels`);
    // Waar de rand van het plein ligt, gezien vanuit zijn midden in een richting (in tegels).
    const randPunt = (dx, dy) => {
      let t = 0;
      while (opPlein(Math.floor(cx + dx * t), Math.floor(cy + dy * t)) && t < 40) t += 0.25;
      return [cx + dx * t, cy + dy * t];
    };

    // ---- 3. De beek, aan één eind van de weg ----
    // Hij kronkelt, maar loopt recht onder het bruggetje door: twee tegels ervandaan begint hij te slingeren, zes
    // tegels ervandaan helemaal (maak-gehucht.cjs).
    const [pa, pc] = ac(cx, cy);
    const beekA = beekVooraan ? tussen(5, 10) : LANGS - 1 - tussen(5, 10);
    const brugC = Math.round(pc + tussen(-5, 5));
    const beekF1 = tussen(0, Math.PI * 2);
    const beekF2 = tussen(0, Math.PI * 2);
    const BEEK_HALF = 1.1;
    const beekMidden = (c) => beekA + (1.6 * Math.sin(c / 6.5 + beekF1) + 0.8 * Math.sin(c / 2.9 + beekF2)) * Math.min(1, Math.max(0, (Math.abs(c - brugC) - 2) / 4));
    const inBeek = (x, y) => {
      const [a, c] = ac(x, y);
      return Math.abs(a - beekMidden(c)) <= BEEK_HALF;
    };
    const naastWater = (x, y) => {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inBeek(x + dx, y + dy)) return true;
      return false;
    };
    // Een tegel is water als een van zijn hoekpunten in de beek ligt; het bruggetje ligt over al die tegels op de
    // rij van de weg.
    const waterTegel = (x, y) => inBeek(x, y) || inBeek(x + 1, y) || inBeek(x, y + 1) || inBeek(x + 1, y + 1);
    for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (waterTegel(x, y)) zet(x, y, WATER);
    const brug = [];
    for (let a = Math.ceil(beekMidden(brugC) - BEEK_HALF) - 1; a <= Math.floor(beekMidden(brugC) + BEEK_HALF); a++) {
      const [x, y] = xy(a, brugC);
      brug.push({ x, y });
    }

    // ---- 4. De weg: van rand tot rand, over het plein, en aan de beekkant over het bruggetje ----
    const richting = (teken) => (as === 'x' ? [teken, 0] : [0, teken]);
    const kantNaar = (teken) => {
      const [rx, ry] = richting(teken);
      const [x, y] = randPunt(rx, ry);
      return ac(x, y);
    };
    const tekenBeek = beekVooraan ? -1 : 1;
    const beekKant = [];
    {
      // van het plein naar de beek: eerst vrij, dan recht op de brug af, en recht erover tot de rand
      const [a0, c0] = kantNaar(tekenBeek);
      const aRand = tekenBeek < 0 ? -1 : LANGS;
      const midA = (a0 + beekA - tekenBeek * 8) / 2;
      beekKant.push([a0, c0], [midA, (c0 + brugC) / 2 + tussen(-1.5, 1.5)], [beekA - tekenBeek * 7, brugC + 0.3], [beekA, brugC + 0.3], [beekA + tekenBeek * 4, brugC + 0.3], [aRand, brugC + 0.3]);
    }
    const andereKant = [];
    {
      const [a0, c0] = kantNaar(-tekenBeek);
      const aRand = tekenBeek < 0 ? LANGS : -1;
      const cRand = Math.max(14, Math.min(DWARS - 14, pc + tussen(-9, 9)));
      andereKant.push([a0, c0]);
      for (const f of [0.35, 0.7]) andereKant.push([a0 + (aRand - a0) * f, c0 + (cRand - c0) * f + tussen(-2.5, 2.5)]);
      andereKant.push([aRand, cRand]);
    }
    const wegen = [beekKant, andereKant].map((l) => vloeiend(l.map(([a, c]) => xy(a, c))));
    const WEG_BREED = 0.75;
    const PAD_BREED = 0.55;
    const paden = [];
    const opWeg = (x, y) => wegen.some((l) => totLijn(l, x, y) < WEG_BREED) || paden.some((l) => totLijn(l, x, y) < PAD_BREED);
    const wegTegel = (x, y) => opWeg(x, y) || opWeg(x + 1, y) || opWeg(x, y + 1) || opWeg(x + 1, y + 1);
    for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (op(x, y) === VRIJ && wegTegel(x, y)) zet(x, y, WEG);
    // De uitgang: waar de weg de kaart verlaat aan de kant waar je binnenkomt, op de tegel die het dichtst bij de
    // weg ligt. Daar opent straks de kaart van het land (js/land.js), en daar komen de marskramer en de heer binnen.
    const uitgangLijn = uitgangBijBeek ? wegen[0] : wegen[1];
    const uitgangA = (uitgangBijBeek ? tekenBeek : -tekenBeek) < 0 ? 0 : LANGS - 1;
    let uitgang = null;
    for (let c = 0; c < DWARS; c++) {
      const [x, y] = xy(uitgangA, c);
      const d = totLijn(uitgangLijn, x + 0.5, y + 0.5);
      if (!uitgang || d < uitgang.d) uitgang = { x, y, d };
    }
    delete uitgang.d;

    // ---- 5. De bosrand: een zone langs de randen, waar straks bomen staan ----
    for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (op(x, y) === VRIJ && bosAfstand(x, y) < I.bosDiep) zet(x, y, BOS);
    // Een akker blijft nog een tegel verder van het bos (maak-gehucht.cjs: "nergens raakt een akker de bosrand").
    const bijBos = optelsom((x, y) => bosAfstand(x, y) < I.bosDiep + 1);

    // ---- Hulp om te bouwen ----
    const huizen = [];
    // Past deze tekening hier? Op vrije grond, niet in een ander erf, een tegel van de weg, het water en de akkers,
    // en de deur zelf op begaanbare grond. Tegen het plein aan mag: de rand van het plein ligt schuin in het raster,
    // en een tegel ertussen hield de deur altijd te ver weg (maak-gehucht.cjs: "zijn deur een tegel hoger, anders
    // raakt het plein zijn hoek").
    const past = (t, x, y) => {
      if (x < 1 || y < 1 || x + t.b > B - 1 || y + t.d > H - 1) return false;
      if (raakt(x, y, t.b, t.d, 0, [PLEIN, WEG, WATER, HUIS, ERF, AKKER, MEENT, BOS])) return false;
      if (raakt(x, y, t.b, t.d, 1, [WEG, WATER, HUIS, AKKER, MEENT])) return false;
      const dx = x + t.deur[0];
      const dy = y + t.deur[1];
      return [VRIJ, PLEIN, WEG, ERF].includes(op(dx, dy)) && [VRIJ, PLEIN, WEG, ERF].includes(op(dx + t.kant.x, dy + t.kant.y));
    };
    const bouw = (t, x, y, meer) => {
      const h = { tekening: t.naam, vel: t.vel, x, y, b: t.b, d: t.d, deur: { x: x + t.deur[0], y: y + t.deur[1] }, kant: t.kant, ...meer };
      for (let yy = y - 2; yy < y + t.d + 2; yy++) {
        for (let xx = x - 2; xx < x + t.b + 2; xx++) if ([VRIJ, BOS].includes(op(xx, yy))) zet(xx, yy, ERF);
      }
      for (let yy = y; yy < y + t.d; yy++) for (let xx = x; xx < x + t.b; xx++) zet(xx, yy, HUIS);
      huizen.push(h);
      return h;
    };
    // Hoe ver een tegel van het plein ligt (in stappen van een koning), tot 6.
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
        if (d >= 6) continue;
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
    // Hoeveel tegels van het plein dit huis in beeld afdekt. Een huis dat verder dan een dak ver vóór het plein
    // staat, dekt niets af; dat hoeft niet geteld.
    let pleinDiepst = 0;
    let pleinVak = { x0: B, y0: H, x1: 0, y1: 0 };
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        if (op(x, y) !== PLEIN) continue;
        pleinDiepst = Math.max(pleinDiepst, x + y);
        pleinVak = { x0: Math.min(pleinVak.x0, x), y0: Math.min(pleinVak.y0, y), x1: Math.max(pleinVak.x1, x), y1: Math.max(pleinVak.y1, y) };
      }
    }
    const pleinSet = (x, y) => op(x, y) === PLEIN;
    const verbergt = (x, y, t) => (x + y - I.achterDak > pleinDiepst ? 0 : achterDakVan([{ x, y, b: t.b, d: t.d }], pleinSet, B, H).size);
    // Waar een huis rond het plein kan staan: binnen zoveel tegels van het plein.
    const rondPlein = (ruim) => ({ x0: Math.max(1, pleinVak.x0 - ruim), y0: Math.max(1, pleinVak.y0 - ruim), x1: Math.min(B - 2, pleinVak.x1 + ruim), y1: Math.min(H - 2, pleinVak.y1 + ruim) });
    // De beste plek voor een tekening, naar een score; het lot kiest uit de beste paar, zodat twee zaden niet op
    // dezelfde plek uitkomen.
    const besteVan = (kandidaten) => {
      if (!kandidaten.length) return null;
      kandidaten.sort((p, q) => q.score - p.score);
      return kandidaten[Math.floor(r() * Math.min(3, kandidaten.length))];
    };
    const hoekVan = (x, y) => Math.atan2(y - cy, x - cx);
    const hoekVerschil = (p, q) => {
      const d = Math.abs(p - q) % (Math.PI * 2);
      return d > Math.PI ? Math.PI * 2 - d : d;
    };

    // ---- 6. Het huis van de schout: aan de achterkant van het plein, met zijn deur bij het plein ----
    // De achterkant is de kant van de rand die het verst van de camera ligt (v kleinst); daar staat het huis in beeld
    // vrij, met het hele plein ervoor. Zijn deur hoeft niet pal aan het plein: het uitgesleten zand loopt van zijn
    // deur het plein op, zoals in het ontworpen gehucht. Pal aan het plein kon alleen aan één kant, want een huis
    // staat recht in het raster en de rand van het plein ligt er schuin in.
    const [achterX, achterY] = randPunt(-Math.SQRT1_2, -Math.SQRT1_2);
    let schoutHuis;
    {
      const t = tekening(I.tekeningen.schout[0]);
      const kandidaten = [];
      const v = rondPlein(10);
      for (let y = v.y0; y <= v.y1; y++) {
        for (let x = v.x0; x <= v.x1; x++) {
          if (!past(t, x, y)) continue;
          const dx = x + t.deur[0];
          const dy = y + t.deur[1];
          if (totPlein(dx, dy) > 3) continue;
          kandidaten.push({ x, y, score: -Math.hypot(dx - achterX, dy - achterY) - totPlein(dx, dy) * 0.5 + tussen(0, 1.5) });
        }
      }
      const k = besteVan(kandidaten);
      if (!k) return mis('geen plek voor het huis van de schout');
      schoutHuis = bouw(t, k.x, k.y, { rol: 'schout', huis: 'schout' });
    }
    // Het zand: het uitgesleten stuk van zijn deur het plein op. De plek van de marskramer (en van de heer op
    // Sint-Maarten) komt erop, zodra de put staat (hieronder, bij stap 12).
    const deurS = schoutHuis.deur;
    let zand;
    let zandMidden;
    {
      const [mx, my] = [cx - deurS.x - 0.5, cy - deurS.y - 0.5];
      const l = Math.hypot(mx, my) || 1;
      const [lx, ly] = [mx / l, my / l]; // van de deur naar het midden van het plein
      const ver = totPlein(deurS.x, deurS.y);
      const lang = ver / 2 + tussen(2.8, 3.6);
      const breed = tussen(3, 3.8);
      zandMidden = [deurS.x + 0.5 + lx * (ver / 2 + 2), deurS.y + 0.5 + ly * (ver / 2 + 2)];
      zand = [];
      for (let i = 0; i < 8; i++) {
        const hoek = (i / 8) * Math.PI * 2 + tussen(-0.2, 0.2);
        const a = Math.cos(hoek) * lang * tussen(0.9, 1.1);
        const b = Math.sin(hoek) * breed * tussen(0.85, 1.1);
        zand.push([Math.round((zandMidden[0] + lx * a - ly * b) * 10) / 10, Math.round((zandMidden[1] + ly * a + lx * b) * 10) / 10]);
      }
    }

    // ---- 7. Om het plein: de herberg, een huis en twee hutten, met hun deur naar het plein ----
    // In het ontworpen gehucht woont er in het huis een jong gezin van dagloners, in de ene hut een oud stel, en de
    // andere is leeg, voor het eerste gezin dat komt (js/bewoners.js, T.zetBeginBewoners). Niet elk huis staat pal aan
    // het plein: de hut in het westen van het ontworpen gehucht staat er acht tegels vanaf, met een pad.
    const voorwerpen = [];
    {
      const hutten = schud(I.tekeningen.hut);
      const rij = [
        { rol: 'herberg', namen: I.tekeningen.herberg, huis: 'herbergierster', totPlein: 3 },
        { rol: 'huis', namen: schud(I.tekeningen.huis), bewoners: 'jongGezin', totPlein: 3 },
        { rol: 'hut', namen: [hutten[0]], bewoners: 'oudStel', totPlein: 5 },
        { rol: 'hut', namen: [hutten[1]], totPlein: 5 },
      ];
      for (const wie of rij) {
        const kandidaten = [];
        const v = rondPlein(14);
        for (const naam of wie.namen) {
          const t = tekening(naam);
          for (let y = v.y0; y <= v.y1; y++) {
            for (let x = v.x0; x <= v.x1; x++) {
              if (!past(t, x, y)) continue;
              const dx = x + t.deur[0];
              const dy = y + t.deur[1];
              const afstand = totPlein(dx, dy);
              if (afstand > wie.totPlein) continue;
              // De deur kijkt naar het plein, niet ervan af.
              const naarPlein = (cx - dx) * t.kant.x + (cy - dy) * t.kant.y;
              if (naarPlein < 0) continue;
              const verborgen = verbergt(x, y, t);
              const hoek = hoekVan(x + t.b / 2, y + t.d / 2);
              const ruimte = Math.min(...huizen.map((h) => hoekVerschil(hoek, hoekVan(h.x + h.b / 2, h.y + h.d / 2))));
              kandidaten.push({ x, y, t, score: -afstand - verborgen * 1.5 + ruimte * 2.5 + tussen(0, 2) });
            }
          }
        }
        const k = besteVan(kandidaten);
        if (!k) return mis(`geen plek voor ${wie.rol === 'herberg' ? 'de herberg' : `een ${wie.rol}`}`);
        const meer = { rol: wie.rol };
        if (wie.huis) meer.huis = wie.huis;
        if (wie.bewoners) meer.bewoners = wie.bewoners;
        const h = bouw(k.t, k.x, k.y, meer);
        if (wie.rol === 'herberg') {
          // de lantaarn naast de deur, en een bankje ernaast (maak-gehucht.cjs)
          const zijX = h.kant.y !== 0 ? 1 : 0;
          const zijY = h.kant.x !== 0 ? 1 : 0;
          voorwerpen.push({ naam: 'lantaarn', x: h.deur.x - zijX, y: h.deur.y - zijY });
          if (op(h.deur.x + zijX, h.deur.y + zijY) !== PLEIN) voorwerpen.push({ naam: 'bankje-y', x: h.deur.x + zijX, y: h.deur.y + zijY });
        }
      }
    }

    // ---- 8. De boerderijen, verder naar buiten, elk bij zijn velden ----
    // Rond het plein verdeeld, elk in een eigen richting; de akkers liggen aan de buitenkant van de boerderij, zodat
    // de velden om het dorp liggen. Elke tekening één keer.
    const akkers = [];
    const vormenVan = (tegels) => {
      const v = [];
      for (let b = 2; b <= tegels; b++) {
        if (tegels % b) continue;
        const h = tegels / b;
        if (h >= 2 && Math.max(b, h) / Math.min(b, h) <= 7) v.push([b, h]);
      }
      return v;
    };
    {
      const start = tussen(0, Math.PI * 2);
      const richtingen = [0, 1, 2, 3, 4].map((i) => start + (i * Math.PI * 2) / 5 + tussen(-0.2, 0.2));
      const verdeling = schud(I.akkers);
      let vrijeTekeningen = I.tekeningen.boerderij.slice();
      const volgorde = schud([0, 1, 2, 3, 4]);
      for (let n = 0; n < volgorde.length; n++) {
        const i = volgorde[n];
        const id = `boer${i + 1}`;
        const hoek = richtingen[i];
        const [ox, oy] = [Math.cos(hoek), Math.sin(hoek)];
        const kandidaten = [];
        for (const naam of vrijeTekeningen) {
          const t = tekening(naam);
          for (let y = 1; y < H; y++) {
            for (let x = 1; x < B; x++) {
              const mx = x + t.b / 2;
              const my = y + t.d / 2;
              const afstand = Math.hypot(mx - cx, my - cy);
              if (afstand < 15 || afstand > 27) continue;
              if (hoekVerschil(Math.atan2(my - cy, mx - cx), hoek) > 0.5) continue;
              if (!past(t, x, y)) continue;
              const dx = x + t.deur[0];
              const dy = y + t.deur[1];
              const naarPlein = ((cx - dx) * t.kant.x + (cy - dy) * t.kant.y) / (Math.hypot(cx - dx, cy - dy) || 1);
              kandidaten.push({ x, y, t, score: -Math.abs(afstand - 20) * 0.4 + naarPlein * 1.5 - verbergt(x, y, t) + tussen(0, 2) });
            }
          }
        }
        kandidaten.sort((p, q) => q.score - p.score);
        // Probeer de beste plekken, tot de akkers van deze boer er ook bij passen. Een akker ligt in vrij land of in
        // het erf van zijn eigen boerderij, een tegel van huizen, wegen, water en het plein, en niet bij het bos.
        let gelukt = false;
        for (const k of kandidaten.slice(0, 12)) {
          const vorig = { vak: vak.slice(), akkers: akkers.length };
          bouw(k.t, k.x, k.y, { rol: 'boerderij', huis: id });
          const fx = k.x + k.t.b / 2;
          const fy = k.y + k.t.d / 2;
          const eigen = { x0: k.x - 2, y0: k.y - 2, x1: k.x + k.t.b + 2, y1: k.y + k.t.d + 2 };
          let allemaal = true;
          for (const veld of verdeling[n]) {
            const opties = [];
            const hard = somVan([PLEIN, WEG, WATER, HUIS, AKKER, MEENT, BOS]);
            const erf = somVan([ERF]);
            const naast = somVan([HUIS, WEG, WATER, PLEIN, MEENT]);
            for (const [b, h] of vormenVan(veld.tegels)) {
              for (let y = Math.max(I.akkerRand, k.y - 18); y + h <= Math.min(H - I.akkerRand, k.y + k.t.d + 18); y++) {
                for (let x = Math.max(I.akkerRand, k.x - 18); x + b <= Math.min(B - I.akkerRand, k.x + k.t.b + 18); x++) {
                  if (hard(x, y, b, h) || naast(x - 1, y - 1, b + 2, h + 2) || bijBos(x, y, b, h)) continue;
                  // Erf erin mag alleen het erf van zijn eigen boerderij zijn.
                  const ex0 = Math.max(x, eigen.x0);
                  const ey0 = Math.max(y, eigen.y0);
                  const ex1 = Math.min(x + b, eigen.x1);
                  const ey1 = Math.min(y + h, eigen.y1);
                  const eigenErf = ex1 > ex0 && ey1 > ey0 ? erf(ex0, ey0, ex1 - ex0, ey1 - ey0) : 0;
                  if (erf(x, y, b, h) !== eigenErf) continue;
                  // Hoe ver het veld van de boerderij ligt, en of het aan de buitenkant ligt.
                  const gatX = Math.max(0, k.x - (x + b), x - (k.x + k.t.b));
                  const gatY = Math.max(0, k.y - (y + h), y - (k.y + k.t.d));
                  const gat = Math.max(gatX, gatY);
                  if (gat > 8) continue;
                  const vmx = x + b / 2;
                  const vmy = y + h / 2;
                  const buiten = (vmx - fx) * ox + (vmy - fy) * oy;
                  if (buiten < -3) continue;
                  if (Math.hypot(vmx - cx, vmy - cy) < 15) continue;
                  const strook = Math.max(b, h) / Math.min(b, h) >= 4 ? 1 : 0;
                  opties.push({ x, y, b, h, score: -gat * 0.6 + buiten * 0.15 + strook + tussen(0, 1.5) });
                }
              }
            }
            const keus = besteVan(opties);
            if (!keus) {
              allemaal = false;
              break;
            }
            for (let yy = keus.y; yy < keus.y + keus.h; yy++) for (let xx = keus.x; xx < keus.x + keus.b; xx++) zet(xx, yy, AKKER);
            const akker = { akker: `akker${akkers.length + 1}`, x: keus.x, y: keus.y, b: keus.b, h: keus.h, huis: id };
            if (veld.bestemming) akker.bestemming = veld.bestemming;
            akkers.push(akker);
          }
          if (!allemaal) {
            // terug naar hoe het was, en de volgende plek proberen
            vak = vorig.vak;
            versie++;
            akkers.length = vorig.akkers;
            huizen.pop();
            continue;
          }
          vrijeTekeningen = vrijeTekeningen.filter((x) => x !== k.t.naam);
          gelukt = true;
          break;
        }
        if (!gelukt) return mis(`geen plek voor de boerderij van ${id} met zijn akkers`);
      }
    }

    // ---- 9. De meent, met de schaapskooi aan zijn noordrand ----
    // De kooi staat met zijn voorkant naar de heide, zodat de schapen vóór de kooi staan (maak-gehucht.cjs).
    let meent;
    {
      const t = tekening(I.tekeningen.kooi[0]);
      const opties = [];
      for (const [b, h] of I.meent) {
        for (let y = 11; y + h <= H - 2; y++) {
          for (let x = 2; x + b <= B - 2; x++) {
            if (raakt(x, y, b, h, 0, [PLEIN, WEG, WATER, HUIS, ERF, AKKER, BOS])) continue;
            if (raakt(x, y, b, h, 1, [PLEIN, WEG, WATER, HUIS, AKKER])) continue;
            // aan de rand van het dorp, voorbij de boerderijen, zoals in het ontworpen gehucht
            const ver = Math.hypot(x + b / 2 - cx, y + h / 2 - cy);
            if (ver < 24) continue;
            for (let kx = x; kx + t.b <= x + b; kx++) {
              const ky = y - t.d - 2;
              if (!past(t, kx, ky)) continue;
              opties.push({ x, y, b, h, kx, ky, score: ver * 0.2 + tussen(0, 2) });
            }
          }
        }
      }
      const k = besteVan(opties);
      if (!k) return mis('geen plek voor de meent met de kooi');
      meent = { meent: 'heide', x: k.x, y: k.y, b: k.b, h: k.h };
      for (let yy = k.y; yy < k.y + k.h; yy++) for (let xx = k.x; xx < k.x + k.b; xx++) zet(xx, yy, MEENT);
      bouw(t, k.kx, k.ky, { rol: 'kooi' });
    }

    // ---- 10. Paden: van een boerderij die ver van de weg ligt, naar de weg of het plein ----
    // Meer paden komen met "Straten en paden" (ontwerp/spel.md): die slijten waar gelopen wordt.
    const loopbaar = (o) => [VRIJ, ERF, BOS, MEENT, WEG, PLEIN].includes(o);
    const zoekPadNaar = (van, doel) => {
      const vorige = new Int32Array(B * H).fill(-1);
      const rij = [van.y * B + van.x];
      vorige[rij[0]] = rij[0];
      for (let i = 0; i < rij.length; i++) {
        const p = rij[i];
        const x = p % B;
        const y = (p - x) / B;
        if (doel(x, y) && i > 0) {
          const pad = [];
          for (let q = p; q !== vorige[q]; q = vorige[q]) pad.push([q % B, Math.floor(q / B)]);
          pad.push([van.x, van.y]);
          return pad.reverse();
        }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (!binnen(nx, ny) || vorige[ny * B + nx] !== -1 || !loopbaar(op(nx, ny))) continue;
          vorige[ny * B + nx] = p;
          rij.push(ny * B + nx);
        }
      }
      return null;
    };
    {
      const boerderijen = huizen.filter((h) => h.rol === 'boerderij');
      const langs = [];
      for (const h of boerderijen) {
        const voor = { x: h.deur.x, y: h.deur.y };
        const pad = zoekPadNaar(voor, (x, y) => op(x, y) === WEG || op(x, y) === PLEIN);
        if (pad && pad.length >= 5) langs.push(pad);
      }
      langs.sort((p, q) => q.length - p.length);
      for (const pad of langs.slice(0, 3)) {
        const steun = pad.filter((_, i) => i % 3 === 0 || i === pad.length - 1).map(([x, y]) => [x + 0.5, y + 0.5]);
        const lijn = vloeiend(steun);
        paden.push(lijn);
        for (const [x, y] of pad) if ([VRIJ, ERF, BOS].includes(op(x, y))) zet(x, y, WEG);
      }
    }

    // ---- 11. De grond per hoekpunt, zoals maak-gehucht.cjs: water wint, dan zandpad, dan heide, en de rest is gras ----
    const inAkker = (x, y) => akkers.some((a) => x >= a.x && x < a.x + a.b && y >= a.y && y < a.y + a.h);
    const opHeide = (x, y) => {
      const m = meent;
      if (x < m.x || x > m.x + m.b || y < m.y || y > m.y + m.h) return false;
      const rand = x === m.x || x === m.x + m.b || y === m.y || y === m.y + m.h;
      return !rand || r() < 0.5;
    };
    const hoeken = [];
    for (let y = 0; y <= H; y++) {
      const rij = [];
      for (let x = 0; x <= B; x++) {
        if (inBeek(x, y)) rij.push('w');
        else if (naastWater(x, y)) rij.push('g');
        else if (opWeg(x, y) || inAkker(x, y) || T.binnenRand(zand, x, y)) rij.push('z');
        else if (opHeide(x, y)) rij.push('h');
        else rij.push('g');
      }
      hoeken.push(rij);
    }
    // Heide grenst alleen aan gras: voor heide naast zandpad of water heeft tegels/rand.tsx geen overgang (net als
    // voor zandpad vlak naast water, hierboven). Zo'n hoekpunt wordt gras.
    for (let y = 0; y <= H; y++) {
      for (let x = 0; x <= B; x++) {
        if (hoeken[y][x] !== 'h') continue;
        let naast = false;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (['z', 'w'].includes((hoeken[y + dy] || [])[x + dx])) naast = true;
        if (naast) hoeken[y][x] = 'g';
      }
    }
    const grond = hoeken.map((rij) => rij.join(''));
    const opGras = (x, y) => [[0, 0], [1, 0], [1, 1], [0, 1]].every(([dx, dy]) => (grond[y + dy] || '')[x + dx] === 'g');

    // ---- 12. Wat er verder staat: de put en de eiken op het plein, bomen, tuinen, en het bos ----
    const bezet = new Set();
    const sleutel = (x, y) => y * B + x;
    for (const h of huizen) for (let yy = h.y; yy < h.y + h.d; yy++) for (let xx = h.x; xx < h.x + h.b; xx++) bezet.add(sleutel(xx, yy));
    const deuren = new Set();
    for (const h of huizen) {
      deuren.add(sleutel(h.deur.x, h.deur.y));
      deuren.add(sleutel(h.deur.x + h.kant.x, h.deur.y + h.kant.y));
    }
    const vrijVoor = (x, y) => binnen(x, y) && !bezet.has(sleutel(x, y)) && !deuren.has(sleutel(x, y));
    const leg1 = (naam, x, y) => {
      voorwerpen.push({ naam, x, y });
      bezet.add(sleutel(x, y));
    };
    for (const v of voorwerpen) bezet.add(sleutel(v.x, v.y));
    // De put op het zand, twee stappen voor de deur van de schout, met de lantaarn ernaast.
    {
      const px = deurS.x + schoutHuis.kant.x * 2;
      const py = deurS.y + schoutHuis.kant.y * 2;
      const vakken = [[px, py], [px + 1, py], [px, py + 1], [px + 1, py + 1]];
      if (!vakken.every(([x, y]) => [PLEIN, ERF, VRIJ].includes(op(x, y)) && vrijVoor(x, y))) return mis('geen plek voor de put');
      voorwerpen.push({ naam: 'put', x: px, y: py, b: 2, d: 2 });
      for (const [x, y] of vakken) bezet.add(sleutel(x, y));
      const lx = deurS.x + schoutHuis.kant.x + (schoutHuis.kant.y ? 1 : 0);
      const ly = deurS.y + schoutHuis.kant.y + (schoutHuis.kant.x ? 1 : 0);
      if (vrijVoor(lx, ly)) leg1('lantaarn', lx, ly);
      if (vrijVoor(schoutHuis.x - 1, schoutHuis.y + schoutHuis.d - 1) && opGras(schoutHuis.x - 1, schoutHuis.y + schoutHuis.d - 1)) leg1('regenton', schoutHuis.x - 1, schoutHuis.y + schoutHuis.d - 1);
    }
    // De plek van de marskramer, waar ook de heer op Sint-Maarten staat: op het zand, zo dicht mogelijk bij zijn
    // midden (in het ontworpen gehucht schuin naast de put, drie stappen voor de deur van de schout).
    let marskramer = null;
    {
      let beste = 1e9;
      for (let y = pleinVak.y0; y <= pleinVak.y1; y++) {
        for (let x = pleinVak.x0; x <= pleinVak.x1; x++) {
          if (op(x, y) !== PLEIN || !vrijVoor(x, y) || !T.binnenRand(zand, x + 0.5, y + 0.5)) continue;
          const d = Math.hypot(x + 0.5 - zandMidden[0], y + 0.5 - zandMidden[1]);
          if (d < beste) {
            beste = d;
            marskramer = { x, y };
          }
        }
      }
      if (!marskramer) return mis('geen plek voor de marskramer op het zand');
    }
    // Vier tot zes oude eiken op het plein, niet op het zand en niet vlak bij de rand, ver genoeg uit elkaar; met
    // een bank onder de eerste.
    {
      const eiken = [];
      const aantal = 4 + Math.floor(r() * 3);
      const opties = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < B; x++) {
          if (op(x, y) !== PLEIN || !vrijVoor(x, y) || T.binnenRand(zand, x + 0.5, y + 0.5)) continue;
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
      if (eiken.length < 3) return mis('te weinig plaats voor eiken op het plein');
      const [bx, by] = eiken[0];
      if (vrijVoor(bx + 1, by + 1) && op(bx + 1, by + 1) === PLEIN) leg1('bank', bx + 1, by + 1);
    }
    // Bij elk huis een appelboom, een paar stukken tuin bij de boerderijen, en een moestuin bij één.
    const TUIN = ['kruidenbed', 'kool', 'prei', 'bonen', 'regenton'];
    const losOpGras = (x, y) => vrijVoor(x, y) && opGras(x, y) && [VRIJ, ERF].includes(op(x, y));
    for (const h of huizen) {
      if (h.rol === 'kooi') continue;
      const opties = [];
      for (let y = h.y - 3; y < h.y + h.d + 3; y++) {
        for (let x = h.x - 3; x < h.x + h.b + 3; x++) {
          const buiten = x < h.x - 1 || y < h.y - 1 || x > h.x + h.b || y > h.y + h.d;
          if (buiten && losOpGras(x, y)) opties.push([x, y]);
        }
      }
      if (opties.length) leg1(h.rol === 'boerderij' || r() < 0.5 ? 'appelboom' : 'eik', ...kies(opties));
      if (h.rol === 'boerderij') {
        const hoekjes = [[h.x - 1, h.y + h.d - 1], [h.x + h.b, h.y + 1], [h.x + h.b, h.y + h.d - 1], [h.x - 1, h.y + 1]];
        for (const [x, y] of schud(hoekjes).slice(0, 2)) if (losOpGras(x, y)) leg1(kies(TUIN), x, y);
      }
    }
    {
      const boerderijen = schud(huizen.filter((h) => h.rol === 'boerderij'));
      const RIJEN = ['kool', 'prei', 'bonen', 'kruidenbed'];
      let klaar = false;
      for (const h of boerderijen) {
        if (klaar) break;
        for (const [x0, y0] of [[h.x + h.b + 1, h.y], [h.x - 4, h.y], [h.x, h.y - 4], [h.x, h.y + h.d + 1]]) {
          const vakken = [];
          for (let y = y0; y < y0 + 3; y++) for (let x = x0; x < x0 + 3; x++) vakken.push([x, y]);
          if (!vakken.every(([x, y]) => losOpGras(x, y))) continue;
          for (let y = y0; y < y0 + 3; y++) {
            const rij = kies(RIJEN);
            for (let x = x0; x < x0 + 3; x++) leg1(rij, x, y);
          }
          klaar = true;
          break;
        }
      }
    }
    // Losse eiken op het land, niet te dicht bij een huis of bij elkaar.
    {
      const eiken = [];
      const aantal = 7 + Math.floor(r() * 5);
      for (let n = 0; n < 400 && eiken.length < aantal; n++) {
        const x = Math.floor(r() * B);
        const y = Math.floor(r() * H);
        if (op(x, y) !== VRIJ || !losOpGras(x, y)) continue;
        if (raakt(x, y, 1, 1, 2, [HUIS, WEG, PLEIN])) continue;
        if (eiken.some(([ex, ey]) => Math.hypot(ex - x, ey - y) < 6)) continue;
        eiken.push([x, y]);
        leg1('eik', x, y);
      }
    }
    // Geknotte wilgen op de oevers, met een ruim gat bij het bruggetje, zodat het water te zien is.
    for (let c = 0; c < DWARS; c++) {
      if (c >= brugC - 2 && c <= brugC + 6) continue;
      const water = [c, c + 1].flatMap((k) => [Math.ceil(beekMidden(k) - BEEK_HALF), Math.floor(beekMidden(k) + BEEK_HALF)]);
      for (const [a, kans] of [[Math.min(...water) - 1, r()], [Math.max(...water) + 1, r()]]) {
        if (kans >= 0.3) continue;
        const [x, y] = xy(a, c);
        if (vrijVoor(x, y) && ![WEG, HUIS, AKKER, MEENT, PLEIN].includes(op(x, y))) leg1('wilg', x, y);
      }
    }
    // Het bos: bomen in de zone langs de randen, dichter naar de rand toe.
    const BOSBOMEN = ['den', 'eik', 'berk', 'den', 'eik'];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        const d = bosAfstand(x, y);
        if (d >= I.bosDiep || op(x, y) !== BOS || !vrijVoor(x, y) || !opGras(x, y)) continue;
        if (r() > I.bosDicht[d]) continue;
        leg1(kies(BOSBOMEN), x, y);
      }
    }

    // ---- 13. Keuren ----
    const plan = {
      zaad, poging, b: B, h: H, grond, plein, zand, marskramer, uitgang, brug, huizen, akkers, meent, voorwerpen,
      wegen, paden, schout: { x: deurS.x, y: deurS.y },
      landschap: { weg: as, beek: beekVooraan ? (as === 'x' ? 'west' : 'noord') : as === 'x' ? 'oost' : 'zuid', bos, uitgangBijBeek },
    };
    const fout = keur(plan);
    if (fout) return mis(fout);
    return plan;
  }

  // Deugt dit gehucht? Geeft de reden terug als het niet deugt, anders null. En het zet de maten erbij (hoe groot
  // het plein is, hoeveel ervan achter een dak ligt, hoe ver elke boer naar zijn akker loopt), voor de schets.
  function keur(plan) {
    const I = IN();
    const B = plan.b;
    const H = plan.h;
    const vast = new Uint8Array(B * H);
    const zetVast = (x, y) => {
      if (x >= 0 && y >= 0 && x < B && y < H) vast[y * B + x] = 1;
    };
    for (const h of plan.huizen) for (let y = h.y; y < h.y + h.d; y++) for (let x = h.x; x < h.x + h.b; x++) zetVast(x, y);
    const VASTE = ['eik', 'appelboom', 'den', 'berk', 'wilg', 'put', 'bank', 'bankje-y', 'regenton'];
    for (const v of plan.voorwerpen) {
      if (!VASTE.includes(v.naam)) continue;
      for (let y = v.y; y < v.y + (v.d || 1); y++) for (let x = v.x; x < v.x + (v.b || 1); x++) zetVast(x, y);
    }
    // Water is vast, behalve waar het bruggetje ligt.
    const brug = new Set(plan.brug.map((p) => p.y * B + p.x));
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        const nat = [[0, 0], [1, 0], [0, 1], [1, 1]].some(([dx, dy]) => plan.grond[y + dy][x + dx] === 'w');
        if (nat && !brug.has(y * B + x)) zetVast(x, y);
      }
    }
    // Hoe ver elke tegel te voet ligt van de deur van de schout.
    const afstand = new Int32Array(B * H).fill(-1);
    const start = plan.schout.y * B + plan.schout.x;
    if (vast[start]) return 'de deur van de schout is vast';
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
    for (const h of plan.huizen) if (!kom(h.deur.x, h.deur.y)) return `de deur van ${h.rol === 'boerderij' ? h.huis : `de ${h.rol}`} is niet te bereiken`;
    if (!kom(plan.uitgang.x, plan.uitgang.y)) return 'de uitgang is niet te bereiken';
    if (!kom(plan.marskramer.x, plan.marskramer.y)) return 'de plek van de marskramer is niet te bereiken';
    const vakVan = (a) => {
      const l = [];
      for (let y = a.y; y < a.y + (a.h || a.d); y++) for (let x = a.x; x < a.x + a.b; x++) l.push([x, y]);
      return l;
    };
    for (const a of plan.akkers) if (!vakVan(a).some(([x, y]) => kom(x, y))) return `${a.akker} is niet te bereiken`;
    if (!vakVan(plan.meent).some(([x, y]) => kom(x, y))) return 'de meent is niet te bereiken';
    // Het plein: niets erop dan de put, de eiken, de bank en een lantaarn, en genoeg ervan in beeld.
    const opPlein = (x, y) => T.binnenRand(plan.plein, x + 0.5, y + 0.5);
    const magOpPlein = ['put', 'eik', 'bank', 'lantaarn'];
    for (const v of plan.voorwerpen) if (!magOpPlein.includes(v.naam) && opPlein(v.x, v.y)) return `er staat een ${v.naam} op het plein`;
    for (const h of plan.huizen) for (const [x, y] of vakVan(h)) if (opPlein(x, y)) return `de ${h.rol} staat op het plein`;
    for (const a of plan.akkers) for (const [x, y] of vakVan(a)) if (opPlein(x, y)) return `${a.akker} ligt op het plein`;
    let pleinTegels = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (opPlein(x, y)) pleinTegels++;
    const achterDak = achterDakVan(plan.huizen, opPlein, B, H).size;
    if (achterDak > pleinTegels * I.pleinAchterDak) return `${achterDak} tegels van het plein liggen achter een dak`;
    // De akkers zijn samen even groot als in het ontworpen gehucht.
    const moet = I.akkers.flat().reduce((n, a) => n + a.tegels, 0);
    const akkerTegels = plan.akkers.reduce((n, a) => n + a.b * a.h, 0);
    if (akkerTegels !== moet) return `de akkers zijn ${akkerTegels} tegels, niet ${moet}`;
    // Van elke deur van een boerderij naar de dichtstbijzijnde tegel van zijn eigen akkers, te voet.
    let deurNaarAkker = 0;
    for (const h of plan.huizen.filter((x) => x.rol === 'boerderij')) {
      const van = new Int32Array(B * H).fill(-1);
      const s = h.deur.y * B + h.deur.x;
      van[s] = 0;
      const q = [s];
      const eigen = new Set(plan.akkers.filter((a) => a.huis === h.huis).flatMap((a) => vakVan(a).map(([x, y]) => y * B + x)));
      let gevonden = -1;
      for (let i = 0; i < q.length && gevonden < 0; i++) {
        const p = q[i];
        if (eigen.has(p)) gevonden = van[p];
        const x = p % B;
        const y = (p - x) / B;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= B || ny >= H) continue;
          const n = ny * B + nx;
          if (vast[n] || van[n] >= 0) continue;
          van[n] = van[p] + 1;
          q.push(n);
        }
      }
      if (gevonden < 0) return `${h.huis} komt niet bij zijn akkers`;
      deurNaarAkker += gevonden;
    }
    plan.maat = { pleinTegels, achterDak, akkerTegels, deurNaarAkker, huizen: plan.huizen.length };
    return null;
  }

  // Een gehucht uit dit zaad: hetzelfde zaad geeft altijd hetzelfde gehucht. Deugt de eerste poging niet, dan
  // probeert hij het opnieuw, tot T.MAKER_INSTELLINGEN.pogingen; `waarom` zegt wat er onderweg misging.
  T.maakGehucht = function (zaad) {
    const waarom = [];
    for (let poging = 0; poging < IN().pogingen; poging++) {
      const plan = leg(zaad, poging);
      if (!plan.mis) {
        plan.waarom = waarom;
        return plan;
      }
      waarom.push(plan.mis);
    }
    throw new Error(`de maker kreeg met zaad ${zaad} geen gehucht dat deugt: ${waarom.slice(-5).join('; ')}`);
  };
  // Voor de schets: hetzelfde keuren op een plan dat niet van de maker komt (het ontworpen gehucht).
  T.keurGehucht = keur;

  // ---------------------------------------------------------------------------------------------
  // Van plan naar kaart: een kaart en een betekenisbestand, zoals Tiled en gereedschap/wereld.html ze maken
  // ---------------------------------------------------------------------------------------------

  // De grondtegels uit tegels/rand.tsx, opgezocht op wat er in hun vier hoeken ligt. Tiled kiest ze met zijn
  // terreinsets; het spel leest hetzelfde uit hun groep: "gras over zandpad: boven+rechts" heeft gras in de hoeken
  // boven en rechts, en zandpad in de andere twee. De hoeken van tegel (x, y) liggen in beeld zo: boven (x, y), rechts
  // (x+1, y), onder (x+1, y+1) en links (x, y+1).
  const HOEKEN = ['boven', 'rechts', 'onder', 'links'];
  const GRONDSOORT = { g: 'gras', w: 'water', z: 'zandpad', h: 'heide' };
  let grondTegels = null;
  function grondIndex() {
    if (grondTegels) return grondTegels;
    const vlak = {};
    const overgang = {};
    const brug = {};
    T.TEGELS.rand.tiles.forEach((t, id) => {
      if (!t || !t.groep) return;
      if (t.groep === 'vlak') (vlak[t.naam] = vlak[t.naam] || []).push(id);
      const o = /^(\S+) over (\S+): (.+)$/.exec(t.groep);
      if (o) {
        const erin = o[3].split('+');
        const sleutel = HOEKEN.map((h) => (erin.includes(h) ? o[1] : o[2])).join(',');
        (overgang[sleutel] = overgang[sleutel] || []).push(id);
      }
      const b = /^brug ([xy]) (begin|midden|eind)$/.exec(t.groep);
      if (b) brug[`${b[1]} ${b[2]}`] = id;
    });
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
  // In welk vel een voorwerp staat, in dezelfde volgorde als maak-gehucht.cjs zoekt: "eik" wordt "bomen/eik".
  const VELLEN = ['bomen', 'begroeiing', 'gebouwen', 'erf', 'tuin', 'huizen'];
  function opNaam(naam) {
    for (const vel of VELLEN) if (T.TEGELS[vel] && T.TEGELS[vel].tiles.some((t) => t && t.naam === naam)) return `${vel}/${naam}`;
    throw new Error(`de maker kent geen voorwerp "${naam}" (tegels/tegels.js)`);
  }

  // Een plan wordt { kaart, betekenis }: de grond als tegellaag, en al het andere op naam in het betekenisbestand
  // (js/kaart.js, "WAT EEN DING BETEKENT"), zoals gereedschap/tiled/maak-gehucht.cjs het ontworpen gehucht schrijft.
  // Wat voor beide gelijk moet zijn (de beginvoorraad, hoeveel mensen er wonen, de naam van de kaart), neemt hij van het
  // ontworpen gehucht, zodat het op één plek staat.
  T.kaartVanGehucht = function (plan) {
    const B = plan.b;
    const H = plan.h;
    const g = grondIndex();
    const data = new Array(B * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        const hoeken = totTwee([plan.grond[y][x], plan.grond[y][x + 1], plan.grond[y + 1][x + 1], plan.grond[y + 1][x]].map((s) => GRONDSOORT[s]));
        const kies = (lijst) => lijst[Math.floor((hash(x, y, 63) * 1e6) % lijst.length)];
        const lijst = new Set(hoeken).size === 1 ? g.vlak[hoeken[0]] : g.overgang[hoeken.join(',')];
        if (!lijst) throw new Error(`de maker heeft geen grondtegel voor ${hoeken.join(', ')} op (${x}, ${y})`);
        data[y * B + x] = 1 + kies(lijst);
      }
    }
    // Het bruggetje over de beek, in de richting van de weg: begin, midden en eind.
    const brug = plan.brug.slice().sort((p, q) => p.x + p.y - (q.x + q.y));
    brug.forEach((p, i) => {
      const deel = i === 0 ? 'begin' : i === brug.length - 1 ? 'eind' : 'midden';
      data[p.y * B + p.x] = 1 + g.brug[`${plan.landschap.weg} ${deel}`];
    });
    const ontworpen = (T.KAARTEN && T.KAARTEN.gehucht) || {};
    const kaart = {
      type: 'map',
      orientation: 'isometric',
      width: B,
      height: H,
      tilewidth: 64,
      tileheight: 32,
      properties: (ontworpen.properties || [{ name: 'naam', type: 'string', value: 'Het gehucht' }]).map((p) => ({ ...p })),
      tilesets: [{ firstgid: 1, source: '../tegels/rand.tsx' }],
      layers: [{ type: 'tilelayer', name: 'grond', width: B, height: H, data }],
    };

    const dingen = [];
    // de tekeningen: de huizen en alles wat er verder staat
    for (const h of plan.huizen) dingen.push({ x: h.x, y: h.y, tegel: `${h.vel}/${h.tekening}` });
    for (const v of plan.voorwerpen) dingen.push({ x: v.x, y: v.y, tegel: opNaam(v.naam) });
    // wie er staat: de schout voor zijn deur, de boeren voor de hunne (met "huis" aan hun akkers), en de herbergierster
    const deurVan = (rol) => plan.huizen.find((h) => h.rol === rol).deur;
    dingen.push({ ...deurVan('schout'), wezen: 'schout' });
    for (const h of plan.huizen.filter((x) => x.rol === 'boerderij')) dingen.push({ ...h.deur, wie: h.huis, straal: 3, huis: h.huis });
    dingen.push({ ...deurVan('herberg'), wie: 'herbergierster', straal: 3, huis: 'herbergierster' });
    // de huizen als gebouw, zodat het dorp niet leeg begint (js/gebouwen.js, T.zetBestaandeGebouwen)
    const SOORT = { schout: 'huis', herberg: 'herberg', huis: 'huis', hut: 'hut', boerderij: 'boerderij', kooi: 'schaapskooi' };
    for (const h of plan.huizen) {
      const d = { gebouw: SOORT[h.rol], x: h.x, y: h.y, b: h.b, h: h.d };
      if (h.huis) d.huis = h.huis;
      if (h.rol !== 'kooi') d.tekening = `${h.vel}/${h.tekening}`;
      if (h.bewoners) d.bewoners = h.bewoners;
      dingen.push(d);
    }
    for (const a of plan.akkers) dingen.push({ ...a });
    dingen.push({ ...plan.meent });
    dingen.push({ ...plan.uitgang, overgang: 'wereld', tekst: 'De weg de wereld in' });

    const eigen = (T.BETEKENIS && T.BETEKENIS.gehucht) || {};
    const betekenis = {
      versie: 1,
      // net als het ontworpen gehucht hangt het nog aan geen andere kaart vast (gereedschap/tiled/maak-gehucht.cjs)
      proef: true,
      uitleg: `Een gehucht van de maker (js/maker.js), uit zaad ${plan.zaad}.`,
      beginVoorraad: { ...(eigen.beginVoorraad || {}) },
      beginBevolking: eigen.beginBevolking,
      marskramer: { ...plan.marskramer },
      plein: plan.plein.map(([x, y]) => [x, y]),
      dingen,
    };
    return { kaart, betekenis };
  };

  // Een gemaakt gehucht als wereld, zoals T.gebied (js/gebied.js) een kaart uit kaarten/ inleest. `maker` zegt uit welk
  // zaad hij komt.
  T.laadGemaaktGehucht = function (zaad) {
    const plan = T.maakGehucht(zaad);
    const { kaart, betekenis } = T.kaartVanGehucht(plan);
    const w = T.laadKaart(kaart, betekenis);
    w.maker = { zaad: plan.zaad, poging: plan.poging };
    return w;
  };
})(globalThis.Spel = globalThis.Spel || {});
