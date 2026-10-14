// De minikaart (werklijst vraag 165; Marcel, 14 okt: "Vergeet mn minimal niet", en op de vragen: "Onder in de ui zoals bij
// age of Empires", "Het hele eiland"): het hele eiland in het klein, rechtsonder in de balk (js/balk.js), als een ruit
// die net zo ligt als het beeld. Hier de regels zonder scherm (test/minikaart.test.cjs): het beeld van het eiland, een
// pixel per vak van `stap` bij `stap` tegels, uit js/eiland.js in de kleuren van de plaat (en dezelfde kleuren gebruikt
// gereedschap/pixelart/eiland-plaat.cjs), en wat je kent (js/mist.js), per vak. Het tekenen, het kader van de camera en
// de klik staan in js/balk.js, want dat bestand is alleen scherm.
//
// Het beeld wordt in stukken gemaakt (`rijenPerKeer` rijen per beeld van het spel, T.maakMinikaart vanuit js/balk.js), zodat het maken
// niet hapert: het hele eiland in één keer kost zo'n 0,15 s. Het hoort bij het nummer van het eiland, en wordt niet
// bewaard: hetzelfde nummer maakt het opnieuw.
(function (T) {
  'use strict';

  T.MINIKAART_INSTELLINGEN = {
    // Een pixel van de minikaart is een vak van zoveel bij zoveel tegels; een stuk van de mist (64) is een heel aantal vakken.
    stap: 8,
    rijenPerKeer: 6, // zoveel rijen van het beeld per keer (een rij kost zo'n 1 ms)
    msPerBeeld: 4, // en zo lang per beeld van het spel, tot het af is
    // Levendig (Marcel, 14 okt: "Ik bedoelde meer vibrant"): het beeld zoveel verzadigder en helderder dan de plaat.
    verzadiging: 1.4,
    helderheid: 1.1,
    // Wat je niet kent, ligt onder een donkere tint: je ziet de vorm van het eiland, niet wat er is. Hoe dik (1 is dicht),
    // en de kleur.
    onbekend: 0.35,
    nevel: [18, 14, 10],
    // Geen ruit (Marcel: "een echte gefeatherde rand(om) dus dat je geen ruit meer overhoud"), en een lijn van 1 pixel
    // eromheen ("Het gaat toch wat teveel op in het land"): de zee loopt tot zoveel vakken uit de kust, waar hij van heel
    // naar zeeBijOmtrek doorzichtig wordt; daar ligt de lijn (`omtrek`, zijn kleur); daarbuiten vervaagt hij in zeeVervaagt
    // vakken tot niets, rafelig met zoveel ruis, in vlekken van zoveel vakken.
    zeeTotOmtrek: 18,
    zeeBijOmtrek: 0.6,
    zeeVervaagt: 9,
    rafel: 0.35,
    rafelVlek: 5,
    omtrek: [44, 29, 18, 0.95],
    // De kleuren van de streken (in het spel worden het tegels), de zee van ondiep naar diep, en de weg en de brug.
    kleur: {
      meer: [64, 112, 158],
      rivier: [70, 122, 170],
      strand: [230, 216, 172],
      duinen: [204, 198, 150],
      kampen: [132, 164, 84],
      woud: [52, 92, 46],
      heide: [138, 106, 116],
      zand: [214, 198, 150],
      veen: [106, 88, 66],
      broek: [76, 110, 86],
      rots: [150, 144, 136],
    },
    zeeOndiep: [104, 158, 192],
    zeeDiep: [32, 62, 108],
    weg: [226, 190, 124],
    brug: [124, 86, 48],
    bomen: 0.78, // waar bomen staan, zoveel donkerder
  };
  const IN = () => T.MINIKAART_INSTELLINGEN;

  // De kleur van één punt van het eiland: de streek in zijn kleur, met het licht van de zon zoals in het spel
  // (T.helderheidVanVlak) uit de hoogte ernaast, de weg, en de bomen wat donkerder. `D` is een stuk van T.eilandStuk, `o`
  // het punt erin, `b` en `h` zijn maat, `stap` hoeveel tegels er tussen twee punten liggen.
  T.minikaartKleur = function (D, o, b, h, stap) {
    const I = IN();
    const s = T.EILAND_STREKEN[D.streek[o]];
    const hg = D.hoogte[o];
    let k;
    if (s === 'zee') {
      const d = Math.min(1, -hg / 300);
      k = I.zeeOndiep.map((c, i) => c + (I.zeeDiep[i] - c) * d);
    } else if (s === 'meer' || s === 'rivier') {
      k = I.kleur[s];
    } else {
      const x = o % b;
      const y = (o - x) / b;
      const hx = ((x + 1 < b ? D.hoogte[o + 1] : hg) - (x > 0 ? D.hoogte[o - 1] : hg)) / 2;
      const hy = ((y + 1 < h ? D.hoogte[o + b] : hg) - (y > 0 ? D.hoogte[o - b] : hg)) / 2;
      const f = T.helderheidVanVlak([0, 0, 0], [stap, 0, hx], [0, stap, hy]);
      k = (I.kleur[s] || I.kleur.kampen).map((c) => c * f);
    }
    if (D.weg[o]) k = D.weg[o] === 2 ? I.brug : I.weg;
    else if (D.boom[o] && s !== 'zee') k = k.map((c) => c * I.bomen);
    return k;
  };

  // Een kleur levendiger maken: verzadigder (weg van zijn grijs) en helderder.
  function levendig(k) {
    const I = IN();
    const grijs = 0.299 * k[0] + 0.587 * k[1] + 0.114 * k[2];
    return k.map((c) => (grijs + (c - grijs) * I.verzadiging) * I.helderheid);
  }

  // Het beeld van eiland E, in wording: { n, rgba, zee, binnen, klaar } met n bij n pixels (n = de maat van het eiland
  // gedeeld door stap, naar boven), `zee` 1 waar het zee is, en als het af is `binnen` 1 binnen de lijn om het eiland
  // (het land, en de zee tot zeeTotOmtrek vakken uit de kust). Eén per nummer.
  const BEELDEN = new Map();
  T.minikaartBeeld = function (E) {
    let m = BEELDEN.get(E);
    if (!m) {
      const n = Math.ceil(T.EILAND_INSTELLINGEN.maat / IN().stap);
      m = { n, rgba: new Uint8ClampedArray(n * n * 4), zee: new Uint8Array(n * n), binnen: null, klaar: 0 };
      BEELDEN.set(E, m);
    }
    return m;
  };

  // Ruis van 0 tot 1 die zacht verloopt, in vlekken van `vlek` pixels (waarde-ruis, bilineair), voor de rafelige rand.
  const hash = (x, y) => {
    const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
  };
  function zachteRuis(x, y, vlek) {
    const gx = x / vlek;
    const gy = y / vlek;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const fx = gx - x0;
    const fy = gy - y0;
    const boven = hash(x0, y0) * (1 - fx) + hash(x0 + 1, y0) * fx;
    const onder = hash(x0, y0 + 1) * (1 - fx) + hash(x0 + 1, y0 + 1) * fx;
    return boven * (1 - fy) + onder * fy;
  }

  // Hoe ver elk punt van het land ligt, in vakken, rond gemeten (een afstandskaart in twee gangen met stappen van 1 en
  // √2, zodat de lijn om het eiland niet hoekig wordt).
  function afstandTotLand(m) {
    const n = m.n;
    const d = new Float32Array(n * n);
    for (let i = 0; i < n * n; i++) d[i] = m.zee[i] ? Infinity : 0;
    const R = Math.SQRT2;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const i = y * n + x;
        if (x > 0) d[i] = Math.min(d[i], d[i - 1] + 1);
        if (y > 0) {
          d[i] = Math.min(d[i], d[i - n] + 1);
          if (x > 0) d[i] = Math.min(d[i], d[i - n - 1] + R);
          if (x < n - 1) d[i] = Math.min(d[i], d[i - n + 1] + R);
        }
      }
    }
    for (let y = n - 1; y >= 0; y--) {
      for (let x = n - 1; x >= 0; x--) {
        const i = y * n + x;
        if (x < n - 1) d[i] = Math.min(d[i], d[i + 1] + 1);
        if (y < n - 1) {
          d[i] = Math.min(d[i], d[i + n] + 1);
          if (x < n - 1) d[i] = Math.min(d[i], d[i + n + 1] + R);
          if (x > 0) d[i] = Math.min(d[i], d[i + n - 1] + R);
        }
      }
    }
    return d;
  }

  // Als het beeld af is: hoe doorzichtig elk punt van de zee is, uit zijn afstand tot het land. Tot de lijn (zeeTotOmtrek)
  // van heel naar zeeBijOmtrek, daarbuiten in zeeVervaagt vakken tot niets, rafelig; vlak bij de rand van het vierkant
  // altijd niets, zodat daar nooit een rechte lijn staat. Zo blijft er geen ruit over, maar een eiland met een lijn erom.
  function vervaagDeZee(m) {
    const I = IN();
    const n = m.n;
    const afstand = afstandTotLand(m);
    m.binnen = new Uint8Array(n * n);
    for (let i = 0; i < n * n; i++) {
      const x = i % n;
      const y = (i - x) / n;
      const d = afstand[i];
      if (d <= I.zeeTotOmtrek && Math.min(x, y, n - 1 - x, n - 1 - y) > 0) m.binnen[i] = 1;
      if (!m.zee[i]) continue;
      let a;
      if (d <= I.zeeTotOmtrek) a = 1 - (1 - I.zeeBijOmtrek) * (d / I.zeeTotOmtrek);
      else a = I.zeeBijOmtrek * (1 - (d - I.zeeTotOmtrek) / I.zeeVervaagt + (zachteRuis(x, y, I.rafelVlek) - 0.5) * 2 * I.rafel);
      const rand = Math.min(1, Math.min(x, y, n - 1 - x, n - 1 - y) / I.rafelVlek);
      m.rgba[i * 4 + 3] = Math.round(255 * Math.max(0, Math.min(1, a * rand)));
    }
  }

  // Maak het beeld van E verder, `rijen` rijen (zonder: alles). Geeft true als het af is. Elke rij is een stuk van
  // T.eilandStuk, met een rij erboven en eronder voor het licht.
  T.maakMinikaart = function (E, rijen = Infinity) {
    const m = T.minikaartBeeld(E);
    if (m.klaar >= m.n) return true;
    const stap = IN().stap;
    const van = m.klaar;
    const tot = Math.min(m.n, van + rijen);
    const boven = van > 0 ? 1 : 0;
    const onder = tot < m.n ? 1 : 0;
    const h = tot - van + boven + onder;
    const D = T.eilandStuk(E, stap / 2, (van - boven) * stap + stap / 2, m.n, h, stap);
    for (let y = boven; y < h - onder; y++) {
      for (let x = 0; x < m.n; x++) {
        const o = y * m.n + x;
        const k = levendig(T.minikaartKleur(D, o, m.n, h, stap));
        const i = (van + y - boven) * m.n + x;
        const zee = T.EILAND_STREKEN[D.streek[o]] === 'zee';
        m.zee[i] = zee ? 1 : 0;
        m.rgba[i * 4] = k[0];
        m.rgba[i * 4 + 1] = k[1];
        m.rgba[i * 4 + 2] = k[2];
        m.rgba[i * 4 + 3] = zee ? 0 : 255; // de zee komt erbij als het beeld af is (vervaagDeZee)
      }
    }
    m.klaar = tot;
    if (m.klaar >= m.n) vervaagDeZee(m);
    return m.klaar >= m.n;
  };

  // Wat je kent, per vak: een Uint8Array van n bij n, 1 waar je minstens één tegel van het vak kent (js/mist.js, w.gekend:
  // per stuk van 64 bij 64 een rij bits, twee getallen van 32 per rij, of true als je het hele stuk kent).
  T.minikaartGekend = function (w) {
    const stap = IN().stap;
    const n = Math.ceil(T.EILAND_INSTELLINGEN.maat / stap);
    const uit = new Uint8Array(n * n);
    const STUK = 64;
    const per = STUK / stap; // vakken per stuk, in elke richting
    for (const [nummer, rij] of w.gekend || []) {
      const sx = nummer % 64;
      const sy = Math.floor(nummer / 64);
      for (let by = 0; by < per; by++) {
        for (let bx = 0; bx < per; bx++) {
          const vx = sx * per + bx;
          const vy = sy * per + by;
          if (vx >= n || vy >= n) continue;
          let ja = rij === true;
          if (!ja) {
            // de bits van dit vak: stap kolommen vanaf bx * stap, in het getal van die kolom
            const lx = bx * stap;
            const masker = (2 ** stap - 1) * 2 ** (lx & 31);
            for (let ly = by * stap; ly < (by + 1) * stap && !ja; ly++) ja = ((rij[ly * 2 + (lx >> 5)] >>> 0) & masker) !== 0;
          }
          if (ja) uit[vy * n + vx] = 1;
        }
      }
    }
    return uit;
  };

  // Van tegel (x, y) naar een punt op de minikaart van `breed` pixels breed (de ruit is half zo hoog), en terug: de
  // minikaart ligt zoals het beeld (T.naarScherm, js/iso.js), met tegel (0, 0) bovenaan.
  T.minikaartPunt = function (x, y, breed) {
    const s = breed / (2 * T.EILAND_INSTELLINGEN.maat);
    return { x: breed / 2 + (x - y) * s, y: (x + y) * s / 2 };
  };
  T.minikaartTegel = function (mx, my, breed) {
    const s = breed / (2 * T.EILAND_INSTELLINGEN.maat);
    const a = (mx - breed / 2) / s; // x - y
    const b = (2 * my) / s; // x + y
    return { x: (a + b) / 2, y: (b - a) / 2 };
  };
})(globalThis.Spel = globalThis.Spel || {});
