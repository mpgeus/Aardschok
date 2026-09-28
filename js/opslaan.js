// Opslaan en laden (werklijst punt 3, vraag 48; Marcel, 28 sep: "Auto opslaan, maar ook zelf kunnen kiezen.
// Er moet ook een menu komen titel scherm etc", en op het plan: "A ja B ja C ja D ja"). Het spel slaat elke
// ochtend vanzelf op, op één plek die steeds overschreven wordt, en de speler heeft er vijf van zichzelf.
// Het titelscherm, het menu en de lijst met plekken staan in js/menu.js; hier staan de regels, zonder scherm
// en dus getoetst (test/opslaan.test.cjs).
//
// Wat er bewaard wordt: heel Spel.S, behalve wat alleen scherm is (T.schermVelden hieronder). Gemeten op
// 28 sep: alles wat het spel onthoudt, zit in S, en er zit geen functie in. Wel verzamelingen (Set, Map) en
// zo'n 140 plekken waar het ene het andere aanwijst: een bewoner zijn poppetje, zijn huis en zijn werk,
// S.wereld het gebied in S.gebieden, S.schout een wezen in die wereld. Gewone JSON verliest dat allemaal:
// een Set wordt {}, en wat twee keer wordt aangewezen, komt terug als twee losse kopieën. Daarom schrijft
// T.bewaarSpel alles wat vaker wordt aangewezen één keer uit, met een nummer, en daarna alleen dat nummer;
// T.herstelSpel legt de draden terug. Zo hoeft geen regel te zeggen wat hij bewaart, en vergeet niemand iets
// als er iets bijkomt. Een spel is zo'n 380 kB (vier vijfde daarvan is de kaart zelf), en het wegschrijven
// kost een paar ms.
//
// Waar het blijft: achter één functie, T.opslagPlek (ontwerp/verpakken.md, "Wat we tot die tijd niet mogen
// breken", 3). In de browser is dat de opslag van de browser; in de verpakking voor Steam wordt het een
// bestand, en dan verandert alleen die functie.
(function (T) {
  'use strict';

  T.OPSLAAN_INSTELLINGEN = {
    // Past een bewaard spel niet meer bij het spel, omdat de vorm van S veranderde, dan gaat dit getal
    // omhoog: het menu zegt dan dat een ouder spel niet meer te laden is, in plaats van een spel dat
    // halverwege stukloopt. Een veld erbij is geen reden, want dat krijgt bij het laden de waarde van een
    // nieuw spel (T.herstelSpel). Wel: een veld dat anders gaat heten, of iets anders gaat betekenen.
    versie: 1,
    eigenPlekken: 5, // naast de ene die vanzelf gaat (vraag 48 B)
  };
  const IN = () => T.OPSLAAN_INSTELLINGEN;

  // ── Wat alleen scherm is ──

  // Dit gaat niet mee, en krijgt bij het laden, en bij een nieuw spel (T.nieuwSpel in js/main.js), deze
  // waarde. De camera en de zoom gaan ook niet mee: die zet js/main.js zelf.
  T.schermVelden = () => ({
    grond: null, // de buffer waar de grond op staat (js/tekenen.js)
    hover: null, // wat onder de muis is, en wat een klik daar zou doen
    bouwHover: null,
    handeling: null,
    effecten: [], // wat nu beweegt: een flits, zwevende tekst
    wachters: [], // een beurt die op een beweging wacht (js/anim.js)
    rasterAlpha: 0, // het raster van een gevecht, dat in- en uitfaadt
    rasterTegels: [],
    rasterStart: 0,
    rasterVan: null,
    bereik: null,
    bouwSoort: null, // het bouwmenu (js/hud.js)
    bouwMenuOpen: false,
    naLopen: null, // wat er gebeurt als de schout er is, zoals een venster dat opengaat
    spreektMet: null, // een gesprek dat openstaat
  });
  const NIET_MEE = new Set([...Object.keys(T.schermVelden()), 'camera', 'zoom']);

  // ── Van S naar tekst, en terug ──
  //
  // Gewone JSON, met een paar knopen erbij, elk een object met een sleutel die met $ begint:
  //   {"$id": 3, "$o": {...}}  een object dat vaker wordt aangewezen, hier voor het eerst; net zo
  //                             {"$id": 3, "$a": [...]} voor een lijst, en "$set" of "$map"
  //   {"$r": 3}                 elke volgende keer dat hetzelfde ding wordt aangewezen
  //   {"$set": [...]}           een Set die maar één keer voorkomt; {"$map": [[sleutel, waarde], ...]} net zo
  //   {"$n": "Infinity"}        een getal dat JSON niet kent (ook -Infinity en NaN)
  //   {"$u": 1}                 undefined in een lijst (JSON maakt er null van)
  // Een gewoon object dat zelf een sleutel met $ heeft, gaat als {"$o": {...}}, zodat niets verward raakt.
  // Een functie gaat niet mee. Iets wat geen gewoon object, lijst, Set of Map is (een canvas) ook niet, en
  // dat komt in `overgeslagen`: zo ziet een toets het als er iets in S kwam dat niet te bewaren is.

  const isGewoon = (v) => {
    const p = Object.getPrototypeOf(v);
    return p === Object.prototype || p === null;
  };
  const soortVan = (v) => (Array.isArray(v) ? 'a' : v instanceof Set ? 'set' : v instanceof Map ? 'map' : isGewoon(v) ? 'o' : null);

  function codeer(wortel, overgeslagen) {
    // Eerst tellen: wat wordt vaker dan één keer aangewezen? Alleen dat krijgt een nummer.
    const keer = new Map();
    const tel = (v) => {
      if (!v || typeof v !== 'object' || !soortVan(v)) return;
      const n = (keer.get(v) || 0) + 1;
      keer.set(v, n);
      if (n > 1) return;
      if (Array.isArray(v)) for (let i = 0; i < v.length; i++) tel(v[i]);
      else if (v instanceof Set) for (const x of v) tel(x);
      else if (v instanceof Map) {
        for (const [k, x] of v) {
          tel(k);
          tel(x);
        }
      }
      else for (const k of Object.keys(v)) tel(v[k]);
    };
    tel(wortel);

    const nummer = new Map();
    let volgend = 0;
    // Een waarde in een lijst: wat niet mee kan, wordt {"$u": 1}, zodat de rest op zijn plaats blijft.
    const inLijst = (v, pad) => {
      const w = schrijf(v, pad);
      return w === undefined ? { $u: 1 } : w;
    };
    function schrijf(v, pad) {
      if (v === undefined || typeof v === 'function') return undefined;
      if (typeof v === 'number') return Number.isFinite(v) ? v : { $n: String(v) };
      if (v === null || typeof v !== 'object') return v;
      const soort = soortVan(v);
      if (!soort) {
        overgeslagen.push(pad);
        return undefined;
      }
      if (nummer.has(v)) return { $r: nummer.get(v) };
      const gedeeld = keer.get(v) > 1;
      const id = gedeeld ? volgend++ : null;
      if (gedeeld) nummer.set(v, id); // vóór wat erin zit: zo kan het ook naar zichzelf wijzen
      if (soort === 'a') {
        const a = [];
        for (let i = 0; i < v.length; i++) a.push(inLijst(v[i], `${pad}[${i}]`));
        return gedeeld ? { $id: id, $a: a } : a;
      }
      if (soort === 'set') {
        const s = [...v].map((x, i) => inLijst(x, `${pad}{${i}}`));
        return gedeeld ? { $id: id, $set: s } : { $set: s };
      }
      if (soort === 'map') {
        const m = [...v].map(([k, x]) => [inLijst(k, `${pad}<>`), inLijst(x, `${pad}<${String(k)}>`)]);
        return gedeeld ? { $id: id, $map: m } : { $map: m };
      }
      const o = {};
      let dollar = false;
      for (const k of Object.keys(v)) {
        const w = schrijf(v[k], `${pad}.${k}`);
        if (w !== undefined) o[k] = w;
        if (k[0] === '$') dollar = true;
      }
      if (gedeeld) return { $id: id, $o: o };
      return dollar ? { $o: o } : o;
    }
    return schrijf(wortel, 'S');
  }

  function decodeer(wortel) {
    const ding = new Map();
    function lees(k) {
      if (k === null || typeof k !== 'object') return k;
      if (Array.isArray(k)) return k.map(lees);
      if ('$r' in k) {
        if (!ding.has(k.$r)) throw new Error(`verwijzing naar ${k.$r} vóór het ding zelf`);
        return ding.get(k.$r);
      }
      if ('$u' in k) return undefined;
      if ('$n' in k) return Number(k.$n);
      if ('$a' in k) {
        const a = [];
        if ('$id' in k) ding.set(k.$id, a);
        for (const x of k.$a) a.push(lees(x));
        return a;
      }
      if ('$set' in k) {
        const s = new Set();
        if ('$id' in k) ding.set(k.$id, s);
        for (const x of k.$set) s.add(lees(x));
        return s;
      }
      if ('$map' in k) {
        const m = new Map();
        if ('$id' in k) ding.set(k.$id, m);
        for (const [a, b] of k.$map) m.set(lees(a), lees(b));
        return m;
      }
      const o = {};
      if ('$id' in k) ding.set(k.$id, o);
      const bron = '$o' in k ? k.$o : k;
      for (const s of Object.keys(bron)) o[s] = lees(bron[s]);
      return o;
    }
    return lees(wortel);
  }

  // ── Een spel bewaren en herstellen ──

  // Wat een plek in de lijst zegt, zonder het hele spel te lezen (js/menu.js): de dag in het spel, het deel
  // van de dag, hoeveel mensen er wonen, en wanneer je opsloeg.
  function kopVan(S, plek, nu) {
    const dag = S.kalender.dag;
    return {
      plek,
      dag,
      datum: T.datumVanDag(dag).tekst,
      dagdeel: T.dagdeelVan(dag),
      bevolking: S.bevolking || 0,
      bewaardOm: nu,
    };
  }

  // Het hele spel als tekst, met zijn kop. `overgeslagen` (een lijst) vangt wat niet mee kon; `nu` is wanneer,
  // in echte tijd (Date.now(); een toets geeft een vaste).
  function bewaar(S, plek, nu, overgeslagen) {
    const staat = {};
    for (const k of Object.keys(S)) if (!NIET_MEE.has(k)) staat[k] = S[k];
    const kop = kopVan(S, plek, nu);
    // Wat de tijd nu stilzet (het menu waaruit je opslaat), zet een geladen spel niet meer stil.
    const k = S.kalender;
    const had = 'stil' in k;
    const stil = k.stil;
    if (had) k.stil = [];
    try {
      return { kop, tekst: JSON.stringify({ versie: IN().versie, kop, staat: codeer(staat, overgeslagen) }) };
    } finally {
      if (had) k.stil = stil;
      else delete k.stil;
    }
  }
  T.bewaarSpel = (S, { plek = 'auto', nu = Date.now(), overgeslagen = [] } = {}) => bewaar(S, plek, nu, overgeslagen).tekst;

  // Een bewaard spel lezen, nog zonder iets te veranderen: { gelukt, staat, kop } of { gelukt: false, reden }.
  // Zo weet wie laadt vooraf of het lukt, en raakt niemand zijn spel kwijt aan een kapot bestand.
  T.leesSpel = function (tekst) {
    const bewaard = leesTekst(tekst);
    if (bewaard.reden) return { gelukt: false, reden: bewaard.reden };
    try {
      return { gelukt: true, staat: decodeer(bewaard.staat), kop: bewaard.kop };
    } catch (e) {
      return { gelukt: false, reden: 'Dit spel is beschadigd.' };
    }
  };

  // Een gelezen spel in S, bovenop wat er al is: js/main.js begint daarvoor een nieuw spel, zodat wat er sinds
  // het bewaren in het spel bij kwam, de waarde van een nieuw spel heeft. Wat alleen scherm is, begint opnieuw.
  T.zetSpel = function (S, gelezen) {
    Object.assign(S, gelezen.staat, T.schermVelden());
  };

  // Allebei in één keer. Lukt het niet, dan blijft S zoals het was.
  T.herstelSpel = function (S, tekst) {
    const gelezen = T.leesSpel(tekst);
    if (!gelezen.gelukt) return gelezen;
    T.zetSpel(S, gelezen);
    return { gelukt: true, kop: gelezen.kop };
  };

  function leesTekst(tekst) {
    let bewaard = null;
    try {
      bewaard = JSON.parse(tekst);
    } catch (e) {
      return { reden: 'Dit spel is beschadigd.' };
    }
    if (!bewaard || typeof bewaard !== 'object' || !bewaard.staat) return { reden: 'Dit spel is beschadigd.' };
    if (bewaard.versie !== IN().versie) return { reden: `Dit spel is bewaard in een andere versie van ${T.NAAM}, en past niet meer.` };
    return bewaard;
  }

  // ── Wanneer ──

  // Kan er nu opgeslagen worden? null als het kan, anders waarom niet. Alleen als er niets openstaat en niets
  // halverwege is: dan klopt een bewaard spel ook weer als je het laadt. Het menu, waaruit je zelf opslaat,
  // telt niet als venster; het titelscherm wel, want daarachter wacht een spel dat nog niet begonnen is.
  T.waaromNietOpslaan = function (S) {
    if (!S || !S.kalender || !S.wereld) return 'Er is nog geen spel.';
    // Een proefje (?kaart=, js/main.js) is geen spel: het mag het spel van de speler niet overschrijven.
    if (S.proefje) return 'Een proefje wordt niet opgeslagen.';
    if (S.einde || S.modus === 'einde') return 'Het spel is uit.';
    if (S.gevecht || S.overgang || S.modus === 'gevecht' || S.modus === 'overgang') return 'In een gevecht kan dat niet.';
    if (S.modus !== 'verkennen' || (S.kalender.stil || []).some((r) => r !== 'menu')) return 'Sluit eerst het venster.';
    if ((S.wachters && S.wachters.length) || S.naarGebied) return 'Wacht even: er beweegt nog iets.';
    return null;
  };

  // Vanzelf opslaan (vraag 48 A): elke ochtend, zodra de mensen opstaan (T.dagindeling, js/dag.js; dan wordt
  // ook wie sliep wakker), op de plek 'auto', die steeds overschreven wordt. Staat er dan een venster open, dan
  // zodra het dicht is. S.vanzelfBewaard onthoudt de dag, en gaat zelf mee in wat bewaard wordt: een geladen
  // spel slaat die ochtend niet nog eens op. Elk beeld (js/main.js). Geeft wat T.slaOp gaf, of null als het
  // nu niet aan de beurt was.
  T.werkOpslaanBij = function (S) {
    const k = S && S.kalender;
    if (!k) return null;
    const dag = Math.floor(k.dag);
    if (S.vanzelfBewaard === dag || T.uurVanDag(k.dag) < T.dagindeling(dag).opstaan) return null;
    if (S.slaap || T.waaromNietOpslaan(S)) return null;
    S.vanzelfBewaard = dag;
    return T.slaOp(S, 'auto');
  };

  // ── De plekken ──

  // Achter één functie: waar het spel iets bewaart. In de browser de opslag van de browser; kan dat niet (een
  // privévenster, een toets zonder browser), dan null, en dan wordt er niets bewaard. Een toets geeft er een
  // eigen (T.gebruikOpslagPlek), en de verpakking voor Steam straks een bestand.
  let eigenPlek = null;
  T.gebruikOpslagPlek = (plek) => {
    eigenPlek = plek;
  };
  T.opslagPlek = function () {
    if (eigenPlek) return eigenPlek;
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch (e) {
      return null;
    }
  };

  // De plekken: eerst die van het spel zelf, dan de eigen, van 1 tot en met 5.
  T.opslagPlekken = () => ['auto', ...Array.from({ length: IN().eigenPlekken }, (_, i) => String(i + 1))];
  const sleutel = (plek) => `${T.OPSLAG_SLEUTEL}.spel.${plek}`;
  // De kop staat er apart naast, zodat de lijst in het menu niet zes hele spellen hoeft te lezen.
  const kopSleutel = (plek) => `${sleutel(plek)}.kop`;

  function lees(s) {
    const p = T.opslagPlek();
    try {
      return p ? p.getItem(s) : null;
    } catch (e) {
      return null;
    }
  }

  // Het spel op deze plek zetten. Geeft { gelukt, kop } of { gelukt: false, reden }.
  let gewaarschuwd = false;
  T.slaOp = function (S, plek, nu = Date.now()) {
    if (!T.opslagPlekken().includes(plek)) return { gelukt: false, reden: `Er is geen plek ${plek}.` };
    const waarom = T.waaromNietOpslaan(S);
    if (waarom) return { gelukt: false, reden: waarom };
    const p = T.opslagPlek();
    if (!p) return { gelukt: false, reden: 'Deze browser bewaart niets (een privévenster?).' };
    const overgeslagen = [];
    const { tekst, kop } = bewaar(S, plek, nu, overgeslagen);
    // Kwam er iets in S dat niet te bewaren is (een canvas, een beeld), dan zegt de console het, één keer.
    if (overgeslagen.length && !gewaarschuwd) {
      gewaarschuwd = true;
      console.warn(`${T.NAAM}: niet bewaard, want het is geen gewoon gegeven: ${overgeslagen.slice(0, 5).join(', ')}`);
    }
    try {
      p.setItem(sleutel(plek), tekst);
      p.setItem(kopSleutel(plek), JSON.stringify({ versie: IN().versie, kop }));
    } catch (e) {
      return { gelukt: false, reden: 'De opslag van de browser is vol.' };
    }
    return { gelukt: true, kop };
  };

  // Wat er op de plekken staat, het nieuwste bovenaan (vraag 48 B): per plek { plek, kop }, met `reden` erbij
  // als het niet meer te laden is. Lege plekken staan er niet in.
  T.opgeslagenSpellen = function () {
    const lijst = [];
    for (const plek of T.opslagPlekken()) {
      const tekst = lees(kopSleutel(plek));
      if (!tekst) continue;
      let k = null;
      try {
        k = JSON.parse(tekst);
      } catch (e) {
        k = null;
      }
      if (!k || !k.kop) lijst.push({ plek, kop: { plek, bewaardOm: 0 }, reden: 'Dit spel is beschadigd.' });
      else if (k.versie !== IN().versie) lijst.push({ plek, kop: k.kop, reden: `Bewaard in een andere versie van ${T.NAAM}.` });
      else lijst.push({ plek, kop: k.kop });
    }
    return lijst.sort((a, b) => (b.kop.bewaardOm || 0) - (a.kop.bewaardOm || 0));
  };

  // Het nieuwste spel dat nog te laden is, voor "Verder" op het titelscherm; of null.
  T.nieuwsteSpel = () => T.opgeslagenSpellen().find((s) => !s.reden) || null;

  // Het spel op deze plek lezen (T.leesSpel); js/main.js zet het daarna met T.zetSpel in een nieuw spel.
  T.leesVanPlek = function (plek) {
    const tekst = lees(sleutel(plek));
    if (!tekst) return { gelukt: false, reden: 'Op deze plek staat geen spel.' };
    return T.leesSpel(tekst);
  };
})(globalThis.Spel = globalThis.Spel || {});
