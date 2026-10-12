// De raadsman (werklijst vraag 64, 65 en 66; Marcel, 30 sep: "A Ja, b Nee, c Nee, wordt automatisch als de schout er
// niet is. D prima"): een van de boeren (T.isBoer, js/boerderij.js), met twee gelote vaardigheden. Is de schout er niet
// als iemand hem met een voorval zoekt (js/voorvallen.js), dan beslist de raadsman, en wat hij kan, telt mee. Wat hij
// besloot, zegt een bericht. Zijn prijs: hij maait trager (T.raadsmanMaait). Regels zonder scherm; toetsen in
// test/raadsman.test.cjs.
//
// "Er niet" is: de schout is niet in het dorp (een ander gebied, straks op reis) als wie hem zoekt, gaat zoeken, of als
// zijn tijd om is. Is hij in het dorp en spreekt hij hem niet op tijd, dan gaat het voorbij, ook met een raadsman
// (werklijst vraag 68, Marcel: "Ja B inderdaad"; met de spelregel "Raadsman" op "Ook als je niet spreekt" beslist hij
// dan toch: nietGesproken hieronder). Je kiest hem in het venster Raadsman (js/raadsmanvenster.js, vraag 67):
// T.raadsmanKandidaten zegt uit wie, T.kiesRaadsman kiest. Staande orders (de heer, de heervaart, de marskramer) komen
// met het land (vraag 66, D).
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js). Een eerste
  // voorstel van Claude (30 sep).
  T.RAADSMAN_INSTELLINGEN = {
    aan: true,
    // Beslist hij ook als de schout in het dorp is, maar wie hem zocht niet op tijd sprak (wie je wegstuurt, laat je
    // aan hem over)? Marcel koos nee (vraag 68, B): alleen als je weg bent. De spelregel "Raadsman" zet het.
    nietGesproken: false,
    // Uit hoeveel boeren je kiest.
    kandidaten: 3,
    // Zijn prijs: zoveel keer zo lang doet hij over een tegel maaien. Het vangnet haalt de oogst toch binnen
    // (js/akkers.js), dus dit zegt wánneer zijn graan er is, niet hoeveel.
    maaien: 1.25,
    // Wat een vaardigheid doet bij wat hij beslist (T.VAARDIGHEDEN hieronder): wie het goed kan, maakt wat slecht
    // uitvalt zoveel minder erg (0,5: de helft) en wat goed uitvalt zoveel beter; wie het slecht kan, andersom.
    vaardigheden: { rechtspreken: 0.5, zwijgen: 0.5, rekenen: 0.25, bouwen: 0.5, vechten: 0.5 },
    // Hoe hij kiest: wat een antwoord hem waard is, per procent tevredenheid (tevreden), per punt gunst van de heer
    // (gunst), per goud (goud), per tien graan, hout, bier, ... (waren), voor iemand het bos in (verban: plus is streng,
    // min is mild), per tien procent kans op een dode (dood), en per gezin erbij (gezin). Het antwoord dat hem het meest
    // waard is, wint. Tot ronde 2 van het snoeien (stap 4, 12 okt) koos elke boer naar zijn geloot karakter (de zanger
    // gul, het heethoofd streng); het lot is weg, dus kiest elke raadsman zo.
    kiest: { tevreden: 1, gunst: 1, goud: 1, waren: 1, verban: 0, dood: 1, gezin: 1 },
  };
  const IN = () => T.RAADSMAN_INSTELLINGEN;

  // De vijf vaardigheden: hoe je ze ziet, goed of slecht, waar ze over gaan (voor het venster, js/raadsmanvenster.js),
  // en op welk deel van een antwoord ze werken.
  T.VAARDIGHEDEN = {
    rechtspreken: { goed: T.t('judges well'), slecht: T.t('judges badly'), waarop: T.t('how content the village is with the verdict'), op: ['tevreden'] },
    zwijgen: { goed: T.t('can hold their tongue'), slecht: T.t('cannot keep a secret'), waarop: T.t('what the lord gets to hear'), op: ['gunst'] },
    rekenen: { goed: T.t('good with figures'), slecht: T.t('bad with figures'), waarop: T.t('what it costs in gold and goods'), op: ['goud', 'graan', 'wol', 'bier', 'ijzer', 'zout', 'vlees', 'vis', 'kaas', 'hooi'] },
    bouwen: { goed: T.t('handy'), slecht: T.t('all thumbs'), waarop: T.t('what it costs in wood'), op: ['hout'] },
    vechten: { goed: T.t('can fight'), slecht: T.t('timid'), waarop: T.t('the chance that someone dies'), op: ['sterfkans'] },
  };

  // Wat goed uitvalt voor het dorp: meer tevredenheid, gunst, goud en waren; en een kans op een dode nooit.
  const goedVoorHetDorp = (wat, n) => (wat === 'sterfkans' ? false : n > 0);
  const WAREN = T.VAARDIGHEDEN.rekenen.op.filter((w) => w !== 'goud').concat('hout');

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const naam = (p) => T.naamVanBewoner(p);
  const hier = (D, p) => !!(D.bewoners && D.bewoners.mensen.includes(p)) && !p.weg && !!p.wezen && !p.wezen.dood;

  // S.raadsman: wat hij besloot, het laatste achteraan: [{ dag, id, door, wie, antwoord, prijs }]. Wíé raadsman is,
  // staat op zijn poppetje (e.raadsman), want daar kijkt ook het maaien naar (T.raadsmanMaait).
  T.nieuweRaadsman = () => ({ besluiten: [] });

  // Hoeveel keer zo lang hij over een tegel maaien doet (js/akkers.js): wie raadsman is, maait trager; dat is zijn prijs.
  T.raadsmanMaait = (e) => (e && e.raadsman && IN().aan ? IN().maaien : 1);

  // De raadsman van nu (een bewoner), of null: geen gekozen, hij is er niet meer, of de spelregel staat uit.
  T.raadsmanVan = function (D) {
    if (!IN().aan || !D.bewoners) return null;
    return D.bewoners.mensen.find((p) => p.wezen && p.wezen.raadsman && hier(D, p)) || null;
  };

  // Uit wie je kiest: zoveel boeren als kandidaten zegt, vast per spel (uit het zaad), zodat een speeltest dezelfde
  // krijgt.
  T.raadsmanKandidaten = function (D) {
    const boeren = D.bewoners ? D.bewoners.mensen.filter((p) => T.isBoer(D, p) && hier(D, p)) : [];
    boeren.sort((a, b) => a.id - b.id);
    const r = T.dobbelsteen(((((D.lot && D.lot.zaad) || 1) * 67) ^ 0x7a5b) >>> 0);
    const uit = [];
    while (boeren.length && uit.length < IN().kandidaten) uit.push(boeren.splice(Math.floor(r() * boeren.length), 1)[0]);
    return uit;
  };

  // Een boer wordt raadsman; wie het was, is het niet meer. Geeft { kan, reden }.
  T.kiesRaadsman = function (D, p) {
    if (!T.isBoer(D, p) || !hier(D, p)) return { kan: false, reden: T.t('Only a farmer who is here can become your advisor.') };
    for (const x of D.bewoners.mensen) if (x.wezen && x !== p) x.wezen.raadsman = false;
    p.wezen.raadsman = true;
    if (!D.raadsman) D.raadsman = T.nieuweRaadsman();
    T.zeg(D, T.t('{wie} is your advisor. When you are away, {naam} decides.', { wie: T.hoofdletter(naam(p)), naam: naam(p) }));
    return { kan: true };
  };

  // Zijn twee vaardigheden, geloot uit de vijf, goed of slecht: { rechtspreken: 'goed', zwijgen: 'slecht' }. Vast per
  // spel en per boer (uit het zaad van het dorp en zijn nummer).
  T.vaardighedenVan = function (D, p) {
    if (!T.isBoer(D, p)) return {};
    const h = Math.imul(p.id, 2654435761) >>> 0;
    const r = T.dobbelsteen(((((D.lot && D.lot.zaad) || 1) * 61) ^ h) >>> 0);
    const vrij = Object.keys(T.VAARDIGHEDEN);
    const uit = {};
    for (let i = 0; i < 2 && vrij.length; i++) {
      const soort = vrij.splice(Math.floor(r() * vrij.length), 1)[0];
      uit[soort] = r() < 0.5 ? 'goed' : 'slecht';
    }
    return uit;
  };

  // Wie hij is en wat hij kan, als één regel: "Alice · judges well · cannot keep a secret". Voor het kiezen, en voor
  // het bericht.
  T.overRaadsmanTekst = function (D, p) {
    const kan = Object.entries(T.vaardighedenVan(D, p)).map(([soort, niveau]) => T.VAARDIGHEDEN[soort][niveau]);
    return [T.hoofdletter(naam(p))].concat(kan).filter(Boolean).join(' · ');
  };

  // ---------------------------------------------------------------------------------------------
  // Hoe hij beslist
  // ---------------------------------------------------------------------------------------------

  // Een antwoord zoals hij het uitvoert: wat hij kan, telt mee (T.VAARDIGHEDEN). Goud en waren blijven hele getallen.
  T.metVaardigheden = function (D, p, doe) {
    const uit = { ...(doe || {}) };
    for (const [soort, niveau] of Object.entries(T.vaardighedenVan(D, p))) {
      const f = IN().vaardigheden[soort] || 0;
      for (const wat of T.VAARDIGHEDEN[soort].op) {
        const n = uit[wat];
        if (typeof n !== 'number' || !n) continue;
        // Goed kunnen en goed uitvallen, of slecht kunnen en slecht uitvallen: dan wordt het groter.
        const groter = goedVoorHetDorp(wat, n) === (niveau === 'goed');
        uit[wat] = Math.round(n * (groter ? 1 + f : 1 - f));
      }
    }
    return uit;
  };

  // Wat een antwoord hem waard is (kiest hierboven).
  function waarde(doe) {
    const t = IN().kiest;
    let n = (t.tevreden || 0) * (doe.tevreden || 0) + (t.gunst || 0) * (doe.gunst || 0) + (t.goud || 0) * (doe.goud || 0);
    for (const wat of WAREN) n += ((t.waren || 0) * (doe[wat] || 0)) / 10;
    for (const soort of Object.keys(T.VEE)) n += (t.waren || 0) * (doe[soort] || 0);
    if (doe.verban) n += t.verban || 0;
    n -= ((t.dood || 0) * (doe.sterfkans || 0)) / 10;
    // De koorts (js/koorts.js): hoe vaker ze overgaat, hoe meer kans op doden; ongeveer een vijfde van een sterfkans.
    if (doe.koorts != null) n -= ((t.dood || 0) * doe.koorts * 0.2) / 10;
    if (doe.brand === 'laat') n -= t.waren || 0; // een huis dat afbrandt, moet weer opgebouwd worden
    n += (t.gezin || 0) * (doe.gezin || 0);
    return n;
  }

  // De antwoorden die hij kan geven: wat het gesprek sluit, en wat naar een knoop gaat, samen met het eerste antwoord
  // daar dat het sluit (de oude die eerst een kan bier wil). Alleen wat je zelf ook zou zien (de vlaggen van het dorp, en
  // van het voorval: js/gesprek.js), zonder je tas: hij beslist zonder jou. [{ zeg, doe }].
  function antwoordenVan(D, id) {
    const g = T.GESPREKKEN[id];
    const uit = [];
    for (const k of T.zichtbareKeuzes(null, D, id, g.knopen[g.start].keuzes)) {
      if (k.sluit) uit.push({ zeg: k.zeg, doe: k.doe || {} });
      else {
        const verder = ((g.knopen[k.naar] || {}).keuzes || []).find((x) => x.sluit);
        if (verder) uit.push({ zeg: k.zeg, doe: { ...(k.doe || {}), ...(verder.doe || {}) } });
      }
    }
    return uit;
  }

  // Welk antwoord hij kiest op het voorval van nu: het meest waard, uit wat er te betalen valt; bij gelijk het eerste.
  // { zeg, doe } (doe met zijn vaardigheden erin), of null.
  T.raadsmanKeuze = function (D, p, id) {
    let beste = null;
    for (const a of antwoordenVan(D, id)) {
      const doe = T.metVaardigheden(D, p, a.doe);
      if (!T.prijsVanKeuze(D, doe).kan) continue;
      const w = waarde(doe);
      if (!beste || w > beste.w) beste = { zeg: a.zeg, doe, w };
    }
    return beste && { zeg: beste.zeg, doe: beste.doe };
  };

  // Het voorval van nu, beslist door de raadsman (js/voorvallen.js: de schout is er niet). Het gevolg gaat zoals bij
  // een antwoord van jou (T.doeGevolg), en een bericht zegt wat hij deed. Geeft of hij het deed.
  T.raadsmanBeslist = function (D) {
    const L = D.voorvallen && D.voorvallen.lopend;
    const p = T.raadsmanVan(D);
    if (!L || !p) return false;
    const keuze = T.raadsmanKeuze(D, p, L.id);
    if (!keuze) return false;
    const prijs = T.prijsVanKeuze(D, keuze.doe).tekst;
    const zeg = T.vulWoordenIn(D, keuze.zeg);
    L.door = p;
    T.doeGevolg(null, D, keuze.doe); // de raadsman beslist zonder jou: niets uit je tas
    if (!D.raadsman) D.raadsman = T.nieuweRaadsman();
    D.raadsman.besluiten.push({ dag: dagNu(D), id: L.id, door: naam(p), wie: naam(L.wie), antwoord: zeg, prijs });
    if (D.raadsman.besluiten.length > 20) D.raadsman.besluiten.shift();
    const titel = T.VOORVALLEN[L.id].titel;
    const waarom = L.oorzaak ? ` ${L.oorzaak.zin}` : ''; // waar het van kwam (js/voorvallen.js, T.oorzaakVan)
    const zin = T.t('{wie}, your advisor, decided on {titel}: "{antwoord}"', { wie: T.hoofdletter(naam(p)), titel, antwoord: zeg });
    T.zeg(D, `${zin}${prijs ? ` (${prijs})` : ''}${waarom}`);
    T.schrijfOp(D, 'besluit', { door: naam(p), titel, antwoord: zeg, prijs }); // voor zijn rapport (js/ochtendrapport.js)
    T.voorvalBeantwoord(D, L.id, p);
    return true;
  };
})(globalThis.Spel = globalThis.Spel || {});
