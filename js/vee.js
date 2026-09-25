// Het vee: koeien en schapen, op één plek.
//
// Marcel wil weides met koeien en schapen (25 sep 2026; ontwerp/spel.md, "Weides met koeien en
// schapen"). Hij koos: eerst de dieren tekenen, dan de regels. Bovenaan dus wat een dier is, en hoe
// je er een neerzet dat rond zijn plek graast, staat, loopt en ligt. De kunst komt uit
// gereedschap/pixelart/vee.cjs (koe0..2, schaap0..2 in beelden/), en js/sprites.js kiest per beeld
// de houding (T.rustVanDier hieronder).
//
// Daaronder de regels van stap 1 (spel.md, "Uitwerking in drie stappen"), zonder scherm en dus te
// toetsen (test/vee.test.cjs): het vee hoort bij een weide (een veld met bestemming 'weide',
// js/akkers.js), heeft daar plaats nodig, geeft van grasmaand tot wijnmaand melk, en werpt in
// grasmaand jongen zolang er plaats is. Wat het dorp van de melk niet op dezelfde dag eet, wordt
// kaas (js/behoeften.js, T.eetVandaag). Nog niet: hooi en slachten (stap 2), en de inner die de
// kudde telt en de marskramer die vee koopt en verkoopt (stap 3).
(function (T) {
  'use strict';

  // Alle getallen van de regels in één blok (ook in de werkbank van de spelregels, js/opties.js).
  // Een eerste gok, uit het voorstel dat Marcel op 25 sep koos; nog niet door hem bijgesteld.
  T.VEE_INSTELLINGEN = {
    // Zoveel tegels weide heeft één dier nodig. Staan er meer op een weide dan er passen, dan geven
    // de koeien daar naar verhouding minder melk, en werpt er niemand jongen.
    plaats: { koe: 4, schaap: 2 },
    // Een koe geeft elke dag melk voor zoveel mensen (zoals in Lords of the Realm 2, waar een portie
    // kaas er vijf voedt), van grasmaand tot en met wijnmaand. In graan gerekend is dat zoveel keer
    // T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag. Melk houdt niet: wat het dorp er die dag niet van
    // eet, wordt kaas.
    melkVoorMensen: 5,
    melk: { van: 'grasmaand', tot: 'wijnmaand' },
    // Van melk naar kaas: zoveel van wat de melk voedt, blijft over in de kaas (de wei gaat eraf).
    // Kaas telt in dezelfde maat als graan: één kaas voedt zoveel als één graan.
    melkNaarKaas: 0.5,
    // Of de kudde vanzelf groeit: een optie in de spelregels ("Het vee"). Op de dag hieronder werpt
    // elk dier van minstens een jaar oud met zijn kans een jong, zolang er op zijn weide plaats is.
    groeit: true,
    werpen: { maand: 'grasmaand', dag: 1 },
    kansOpJong: { koe: 0.5, schaap: 0.7 },
    // Waar het gehucht mee begint, op de weide(s) die de kaart noemt (T.zetBeginKudde).
    beginKudde: { koe: 3, schaap: 8 },
  };
  const IN = () => T.VEE_INSTELLINGEN;

  // ── Vorm van één soort ──
  //
  //   T.VEE.<soort> = {
  //     naam:     'koe',        // bij de muis: "Een koe"
  //     meervoud: 'koeien',
  //     snelheid: 0.9,          // tegels per seconde; moet gelijk zijn aan SNELHEID in
  //                             // gereedschap/pixelart/vee.cjs, anders glijden de voeten
  //     straal:   4,            // hoe ver het van zijn plek af dwaalt
  //     kleuren:  3,            // hoeveel vellen er zijn: koe0, koe1, koe2 (het zaad kiest er een)
  //     pauze:    [6, 16],      // seconden stilstaan tussen twee stappen: vee loopt weinig
  //     rust:     { grazen, liggen, blok },  // zie T.rustVanDier
  //   }
  T.VEE = {
    // roodbruin, zwart en zwartbont; een koe kuiert
    koe: {
      naam: 'koe', meervoud: 'koeien', snelheid: 0.9, straal: 4, kleuren: 3, pauze: [6, 16],
      rust: { grazen: 0.6, liggen: 0.15, blok: 12 },
    },
    // vuilwit, bruin, en een met een zwarte kop; een schaap trippelt iets vlotter, en graast meer
    schaap: {
      naam: 'schaap', meervoud: 'schapen', snelheid: 1.1, straal: 3, kleuren: 3, pauze: [4, 12],
      rust: { grazen: 0.7, liggen: 0.1, blok: 9 },
    },
  };

  // Een vast getal in [0, 1) uit drie gehele getallen: dezelfde invoer geeft altijd hetzelfde getal
  // (dezelfde menging als de hash in gereedschap/pixelart/kern.cjs). Zo kan het spel elk beeld
  // opnieuw vragen wat een dier doet, zonder iets te onthouden en zonder Math.random.
  function lot(a, b, c) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  T.lotVanDier = lot;

  // Welke kleur krijgt een dier met dit zaad? Het zaad kiest een van de vellen, zoals bij een gewone
  // dorpeling (S.dorpelingVariant in js/sprites.js): hetzelfde zaad geeft altijd dezelfde koe.
  T.dierKleur = function (soort, zaad) {
    const n = (T.VEE[soort] && T.VEE[soort].kleuren) || 1;
    const z = Math.floor(zaad) || 0;
    return ((z % n) + n) % n;
  };

  const RICHTINGEN = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO'];
  const PERIODE = 6; // blokken in een periode waarin het dier al of niet een tijd gaat liggen

  // Wat doet een dier dat stilstaat, op tijd t (seconden: S.tijd)? Meestal grazen, soms staan te
  // herkauwen, en af en toe een tijd liggen: 'grazen', 'staan' of 'liggen'.
  //
  // De tijd is verdeeld in blokken; elk dier heeft een eigen bloklengte (80 tot 120 procent van
  // `rust.blok`) en een eigen begin, allebei uit zijn zaad, zodat de kudde niet op hetzelfde moment
  // omslaat. Elk blok loot met het zaad of het dier graast of staat. Liggen duurt langer: per
  // periode van zes blokken loot het dier of het gaat liggen, en zo ja voor twee tot vier blokken
  // achter elkaar. Gemiddeld ligt het zo `rust.liggen` van de tijd, en graast het `rust.grazen`.
  // Omdat alles uit de tijd en het zaad komt, flikkert het niet, en gaat niet de hele kudde
  // tegelijk liggen: elk dier loot voor zich.
  T.rustVanDier = function (e, t) {
    const r = T.VEE[e.soort].rust;
    const zaad = Math.floor(e.zaad) || 0;
    const blok = r.blok * (0.8 + 0.4 * lot(zaad, 1, 11));
    const k = Math.floor(Math.max(0, t) / blok + lot(zaad, 2, 11) * PERIODE);
    const periode = Math.floor(k / PERIODE);
    const inPeriode = k - periode * PERIODE;
    // gemiddeld drie blokken van de zes: zo vaak een periode waarin het ligt, dat het samen `liggen` is
    if (lot(zaad, periode, 13) < (r.liggen * PERIODE) / 3) {
      const lang = 2 + Math.floor(lot(zaad, periode, 14) * 3);
      const begin = Math.floor(lot(zaad, periode, 15) * (PERIODE - lang + 1));
      if (inPeriode >= begin && inPeriode < begin + lang) return 'liggen';
    }
    return lot(zaad, k, 12) < r.grazen / (1 - r.liggen) ? 'grazen' : 'staan';
  };

  // Een dier neerzetten: een wezen dat neutraal is, niet vecht en rond zijn plek dwaalt. Dezelfde
  // vorm als een gewone dorpeling (T.maakDorpeling, js/mensen.js), zodat alles wat met wezens
  // omgaat er vanzelf mee overweg kan; wat een dier anders maakt, staat erbij:
  //   dier          zijn soort, en het teken dat het een dier is (js/verkennen.js en js/sprites.js
  //                 vragen erom: het praat niet, en het graast in plaats van te staan)
  //   kleur, vel    welke kleur het zaad koos, en dus welk vel (koe0..2, schaap0..2)
  //   pauze         hoe lang het stilstaat tussen twee stappen (T.laatDwalen)
  //   beginRichting de kant waarop het kijkt voordat het een stap zet, zodat een kudde niet
  //                 allemaal dezelfde kant op begint te kijken
  // Alles wat per dier verschilt, komt uit het zaad, niet uit Math.random: hetzelfde zaad geeft
  // hetzelfde dier, dat op dezelfde momenten gaat liggen.
  T.maakDier = function (soort, x, y, zaad) {
    const v = T.VEE[soort];
    if (!v) throw new Error(`onbekend dier "${soort}"`);
    const z = Math.floor(zaad) || 0;
    const e = T.maakDorpeling(z, x, y, v.straal, null);
    const kleur = T.dierKleur(soort, z);
    e.soort = soort;
    e.naam = v.naam;
    e.dier = soort;
    e.kleur = kleur;
    e.vel = soort + kleur;
    e.snelheid = v.snelheid;
    e.pauze = v.pauze.slice();
    e.dwaalTijd = v.pauze[0] + lot(z, 3, 11) * (v.pauze[1] - v.pauze[0]);
    e.fase = lot(z, 4, 11) * 2 * Math.PI;
    e.beginRichting = RICHTINGEN[Math.floor(lot(z, 5, 11) * RICHTINGEN.length)];
    return e;
  };

  // ---------------------------------------------------------------------------------------------
  // De regels: het vee op de weide (stap 1)
  // ---------------------------------------------------------------------------------------------

  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  const isWeide = (veld) => !!veld && (T.bestemmingVan ? T.bestemmingVan(veld) : veld.bestemming || 'akker') === 'weide';
  const weidesVan = (w) => ((w && w.akkers) || []).filter(isWeide);
  const tegelsVan = (veld) => veld.b * veld.h;
  // Hoeveel plaats een dier (of een soort) nodig heeft.
  const plaatsVan = (e) => IN().plaats[typeof e === 'string' ? e : e.dier] || 0;
  // Een kalf is nog geen koe: wie dit spel geboren is, melkt en werpt pas als het een jaar oud is.
  const volwassen = (e, dag) => e.geboren == null || dag - e.geboren >= T.DAGEN_PER_JAAR;
  const etenPerMens = () => (T.GEBOUWEN_INSTELLINGEN ? T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag : 0);
  const spelZaad = (S) => (S.lot && S.lot.zaad) || 1;

  function bericht(tekst, soort) {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  }

  // "3 koeien en 8 schapen", "1 koe", "geen vee".
  function telKudde(dieren) {
    const delen = [];
    for (const [soort, v] of Object.entries(T.VEE)) {
      const n = dieren.filter((e) => (typeof e === 'string' ? e : e.dier) === soort).length;
      if (n) delen.push(`${n} ${n === 1 ? v.naam : v.meervoud}`);
    }
    if (!delen.length) return 'geen vee';
    return delen.length === 1 ? delen[0] : `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}`;
  }
  const tegelsTekst = (n) => `${n} ${n === 1 ? 'tegel' : 'tegels'}`;

  // Wat het spel van het vee onthoudt, naast de dieren zelf (die staan als wezens in de wereld, met
  // e.weide): de melk van vandaag, en hoeveel dieren het spel al een zaad gaf.
  T.nieuwVee = () => ({ melk: 0, zaden: 0 });

  // Alle levende dieren in de wereld, en die van één weide. Een dier hoort bij de weide in e.weide:
  // het veld zelf (een van w.akkers), zodat het scherm ziet binnen welke rechthoek het dwaalt.
  T.veeVan = (S) => ((S && S.wereld && S.wereld.wezens) || []).filter((e) => e.dier && !e.dood);
  T.dierenOp = (S, veld) => T.veeVan(S).filter((e) => e.weide === veld);

  // Hoe het ervoor staat op een weide, voor het venster en voor de regels hieronder:
  // { tegels, nodig, vrij, vol, koeien, schapen }. `nodig` is wat zijn dieren aan plaats nodig
  // hebben, `vrij` wat er over is (onder nul: te vol), en `vol` de factor voor de melk: 1 zolang ze
  // passen, en naar verhouding minder als het te vol is (30 tegels voor 40 nodig geeft 0,75).
  T.weideStand = function (S, veld) {
    const dieren = T.dierenOp(S, veld);
    const tegels = tegelsVan(veld);
    const nodig = dieren.reduce((n, e) => n + plaatsVan(e), 0);
    return {
      tegels, nodig, vrij: tegels - nodig,
      vol: nodig > tegels ? tegels / nodig : 1,
      koeien: dieren.filter((e) => e.dier === 'koe').length,
      schapen: dieren.filter((e) => e.dier === 'schaap').length,
    };
  };

  // Een dier bij een weide zetten. Het dwaalt dan binnen de rechthoek van e.weide, en loopt na een
  // wissel vanzelf naar zijn nieuwe weide (js/verkennen.js, T.dwaalTegelsOpWeide en T.wegNaarWeide).
  // Een plek en een straal rond het midden krijgt het er ook bij, zoals elk dwalend wezen: voor wie
  // daarnaar kijkt (gereedschap/wereld.html tekent de dwaalstraal), niet meer voor het dwalen zelf.
  T.zetOpWeide = function (e, veld) {
    e.weide = veld;
    e.thuis = { x: veld.x + (veld.b - 1) / 2, y: veld.y + (veld.h - 1) / 2 };
    e.straal = Math.max(1, Math.floor(Math.min(veld.b, veld.h) / 2));
    return e;
  };

  // Een tegel op de weide waar nog niemand staat, zo dicht mogelijk bij `bij` (of het midden).
  function vrijeTegel(S, veld, bij) {
    const bezet = new Set(((S.wereld && S.wereld.wezens) || []).filter((e) => !e.dood).map((e) => e.tx + ',' + e.ty));
    const doel = bij || { x: veld.x + (veld.b - 1) / 2, y: veld.y + (veld.h - 1) / 2 };
    let beste = null;
    let afstand = Infinity;
    for (let y = veld.y; y < veld.y + veld.h; y++) {
      for (let x = veld.x; x < veld.x + veld.b; x++) {
        if (bezet.has(x + ',' + y)) continue;
        const d = Math.abs(x - doel.x) + Math.abs(y - doel.y);
        if (d < afstand) {
          afstand = d;
          beste = { x, y };
        }
      }
    }
    return beste || { x: Math.round(doel.x), y: Math.round(doel.y) };
  }

  // Elk dier een eigen zaad (zijn kleur, zijn ritme), uit het zaad van het spel en een teller: zo
  // krijgt hetzelfde spel dezelfde kudde, en een ander spel een andere.
  function nieuwZaad(S) {
    const V = S.vee || (S.vee = T.nieuwVee());
    V.zaden = (V.zaden || 0) + 1;
    return 1 + Math.floor(lot(spelZaad(S), V.zaden, 17) * 2147483646);
  }

  // Zet elk dier (of elke soort) op een weide: de grootste eerst, elk op de weide met de meeste
  // vrije plaats waar het past. `vrij` is een Map weide → vrije tegels, en loopt mee. Met `teVol`
  // komt wie nergens past toch op de weide met de meeste plaats (die wordt dan te vol); zonder
  // blijft hij over. Geeft een Map dier → weide.
  function verdeel(dieren, vrij, teVol) {
    const plek = new Map();
    for (const e of dieren.slice().sort((a, b) => plaatsVan(b) - plaatsVan(a))) {
      let beste = null;
      for (const [v, n] of vrij) {
        if ((teVol || n >= plaatsVan(e)) && (beste === null || n > vrij.get(beste))) beste = v;
      }
      if (beste === null) continue;
      plek.set(e, beste);
      vrij.set(beste, vrij.get(beste) - plaatsVan(e));
    }
    return plek;
  }

  // Past het vee, als elk veld wordt wat plan(veld) zegt? Wie nu op een veld staat dat dan geen weide
  // is, moet naar een weide met plaats; wie blijft, houdt zijn plaats. T.kanBestemming (js/akkers.js)
  // vraagt het vooraf, met het plan voor volgend jaar; T.verhuisVee doet op 1 lentemaand dezelfde
  // verdeling echt. Een dier zonder weide (Toren.debug.vee zet ze los bij de schout) telt niet mee.
  // { past, reden, moeten: [dier], plek: Map(dier → weide), vrij: Map(weide → vrij) }.
  T.plaatsVoorVee = function (S, plan) {
    const weides = ((S.wereld && S.wereld.akkers) || []).filter((v) => plan(v) === 'weide');
    const dieren = T.veeVan(S).filter((e) => e.weide);
    const vrij = new Map(weides.map((v) => [v, tegelsVan(v)]));
    for (const e of dieren) if (vrij.has(e.weide)) vrij.set(e.weide, vrij.get(e.weide) - plaatsVan(e));
    const moeten = dieren.filter((e) => !vrij.has(e.weide));
    const vrijVooraf = [...vrij.values()].reduce((n, x) => n + Math.max(0, x), 0);
    const plek = verdeel(moeten, vrij, false);
    if (plek.size === moeten.length) return { past: true, reden: null, moeten, plek, vrij };
    const nodig = moeten.reduce((n, e) => n + plaatsVan(e), 0);
    const een = moeten.length === 1;
    const reden = weides.length
      ? `Dan is er te weinig weide: ${telKudde(moeten)} ${een ? 'moet' : 'moeten'} ergens anders grazen ` +
        `en ${een ? 'heeft' : 'hebben'} ${tegelsTekst(nodig)} nodig, ` +
        `en op de andere weides ${vrijVooraf === 1 ? 'is' : 'zijn'} nog ${tegelsTekst(vrijVooraf)} vrij.`
      : `Dan is er volgend jaar geen weide meer voor ${telKudde(moeten)}. Maak eerst een ander veld weide.`;
    return { past: false, reden, moeten, plek, vrij };
  };

  // Op 1 lentemaand, na de wissel van de velden (js/akkers.js, T.wisselVelden): wie op een veld staat
  // dat geen weide meer is, gaat naar een weide met plaats. Past niet iedereen (de kudde groeide na
  // het plan), dan gaat de rest naar de weide met de meeste plaats, ook al wordt die te vol: dan
  // geeft het vee daar minder melk en werpt het geen jongen, tot je meer weide maakt. Zonder enige
  // weide blijft het staan waar het stond. Geeft de dieren die verhuisden.
  T.verhuisVee = function (S) {
    const r = T.plaatsVoorVee(S, (v) => (T.bestemmingVan ? T.bestemmingVan(v) : v.bestemming));
    if (!r.moeten.length) return [];
    const teVol = verdeel(r.moeten.filter((e) => !r.plek.has(e)), r.vrij, true);
    const verhuisd = [];
    for (const [e, v] of [...r.plek, ...teVol]) {
      T.zetOpWeide(e, v);
      verhuisd.push(e);
    }
    if (teVol.size) {
      const wie = telKudde([...teVol.keys()]);
      bericht(`Er is te weinig weide: ${wie} ${teVol.size === 1 ? 'staat' : 'staan'} te krap, en de koeien daar geven minder melk.`, 'gevaar');
    } else if (verhuisd.length) {
      bericht(`Het vee gaat naar zijn nieuwe weide: ${telKudde(verhuisd)}.`);
    }
    return verhuisd;
  };

  // Het begin: de beginkudde op de weide(s) die de kaart noemt (js/kaart.js; in het gehucht het blok
  // van Klaas, akker6). T.beginOpKaart (js/gebied.js) roept dit aan, net als T.zetBestaandeGebouwen,
  // ná het lot van de boeren, want het zaad van het spel kiest ook de kleuren van het vee. Zonder
  // weide geen vee. Over de weide verspreid, niet op een kluitje. Geeft de dieren.
  T.zetBeginKudde = function (S) {
    const w = S.wereld;
    const weides = weidesVan(w);
    if (!weides.length) return [];
    const soorten = [];
    for (const soort of Object.keys(T.VEE)) for (let i = 0; i < (IN().beginKudde[soort] || 0); i++) soorten.push(soort);
    const vrij = new Map(weides.map((v) => [v, tegelsVan(v) - T.weideStand(S, v).nodig]));
    const plek = verdeel(soorten.map((soort) => ({ dier: soort })), vrij, true);
    const dieren = [];
    for (const veld of weides) {
      const hier = [...plek].filter(([, v]) => v === veld).map(([d]) => d.dier);
      hier.forEach((soort, k) => {
        const n = tegelsVan(veld);
        const i = Math.floor(((k + 0.5) * n) / hier.length);
        const t = vrijeTegel(S, veld, { x: veld.x + (i % veld.b), y: veld.y + Math.floor(i / veld.b) });
        const e = T.zetOpWeide(T.maakDier(soort, t.x, t.y, nieuwZaad(S)), veld);
        w.wezens.push(e);
        dieren.push(e);
      });
    }
    return dieren;
  };

  // ── De melk ──

  // Is het vandaag melktijd (van grasmaand tot en met wijnmaand)?
  function melkTijd(dag) {
    const m = T.datumVanDag(dag).maand;
    const van = maandIdx(IN().melk.van);
    const tot = maandIdx(IN().melk.tot);
    return van <= tot ? m >= van && m <= tot : m >= van || m <= tot;
  }

  // De melk van één dag, in graan gerekend (wat het dorp ervan kan eten): elke volwassen koe op een
  // weide geeft melk voor IN().melkVoorMensen mensen, maal hoe vol haar weide is. Buiten de melktijd
  // niets.
  T.melkVanDag = function (S, dag) {
    if (!melkTijd(dag)) return 0;
    const perKoe = IN().melkVoorMensen * etenPerMens();
    const vol = new Map();
    let melk = 0;
    for (const e of T.veeVan(S)) {
      if (e.dier !== 'koe' || !isWeide(e.weide) || !volwassen(e, dag)) continue;
      if (!vol.has(e.weide)) vol.set(e.weide, T.weideStand(S, e.weide).vol);
      melk += perKoe * vol.get(e.weide);
    }
    return melk;
  };

  // Hoeveel melk het dorp van dag `van` tot (niet met) dag `tot` zal drinken, met de kudde en de
  // monden van nu: elke dag hooguit wat het nodig heeft, want de rest wordt kaas. Voor het venster
  // van de heer (js/heer.js, T.heerVooruitzicht): wat je overhoudt tot de oogst.
  T.verwachteMelk = function (S, van, tot) {
    const nodig = (S.bevolking || 0) * etenPerMens();
    let som = 0;
    for (let d = Math.floor(van); d < tot; d++) som += Math.min(nodig, T.melkVanDag(S, d));
    return som;
  };

  // ── De jongen ──

  // Op 1 grasmaand werpt elk volwassen dier met zijn kans (IN().kansOpJong) een jong, zolang er op
  // zijn weide plaats is (Marcel, 25 sep: "de kudde groeit in de lente als er plaats is"). Het jong
  // blijft bij zijn moeder. Het lot komt uit het zaad van het spel (S.lot.zaad, js/boeren.js), het
  // jaar en het dier zelf, niet uit Math.random: hetzelfde spel werpt elk jaar dezelfde jongen, en
  // een toets komt vast uit. Wie het laagst loot, werpt het eerst, zodat bij krappe plaats niet
  // altijd dezelfde soort voorgaat. Geeft de nieuwe dieren.
  T.werpJongen = function (S, dag) {
    const w = S.wereld;
    const jaar = T.datumVanDag(dag).jaar;
    const nieuw = [];
    let geenPlaats = 0;
    for (const veld of weidesVan(w)) {
      const moeders = T.dierenOp(S, veld)
        .filter((e) => volwassen(e, dag))
        .map((e) => ({ e, lot: lot(spelZaad(S), jaar, Math.floor(e.zaad) || 0) }))
        .filter((m) => m.lot < (IN().kansOpJong[m.e.dier] || 0))
        .sort((a, b) => a.lot - b.lot);
      let vrij = T.weideStand(S, veld).vrij;
      for (const { e } of moeders) {
        if (vrij < plaatsVan(e)) {
          geenPlaats++;
          continue;
        }
        const t = vrijeTegel(S, veld, { x: e.tx, y: e.ty });
        const jong = T.zetOpWeide(T.maakDier(e.dier, t.x, t.y, nieuwZaad(S)), veld);
        jong.geboren = dag;
        w.wezens.push(jong);
        vrij -= plaatsVan(e);
        nieuw.push(jong);
      }
    }
    const kalveren = nieuw.filter((e) => e.dier === 'koe').length;
    const lammeren = nieuw.length - kalveren;
    const wat = [];
    if (kalveren) wat.push(`${kalveren} ${kalveren === 1 ? 'kalf' : 'kalveren'}`);
    if (lammeren) wat.push(`${lammeren} ${lammeren === 1 ? 'lam' : 'lammeren'}`);
    const meer = geenPlaats ? ' Meer paste er niet op de weide.' : '';
    if (wat.length) bericht(`Het is grasmaand: er ${nieuw.length === 1 ? 'is' : 'zijn'} ${wat.join(' en ')} geboren.${meer}`, 'goed');
    else if (geenPlaats) bericht('Het is grasmaand, maar op de weide is geen plaats voor jongen.');
    return nieuw;
  };

  // ── Elke dag ──

  // Eén dag, vanuit T.tikGebouwenDag (js/gebouwen.js, stap 0): ná de akkers (op 1 lentemaand
  // verhuist daar het vee naar zijn nieuwe weide) en vóór de behoeften, want het dorp eet de melk
  // van vandaag als eerste (js/behoeften.js, T.eetVandaag). Op 1 grasmaand eerst de jongen, dan de
  // melk. S.vee.melk is de melk van vandaag; wat er na het eten van over is, wordt kaas.
  T.tikVeeDag = function (S, dag) {
    const V = S.vee || (S.vee = T.nieuwVee());
    V.melk = 0;
    if (!T.veeVan(S).length) return;
    const d = T.datumVanDag(dag);
    const werpen = IN().werpen;
    if (IN().groeit && d.maand === maandIdx(werpen.maand) && d.dagVanMaand === werpen.dag) T.werpJongen(S, dag);
    V.melk = T.melkVanDag(S, dag);
  };
})(globalThis.Toren = globalThis.Toren || {});
