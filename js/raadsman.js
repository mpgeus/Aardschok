// De raadsman (werklijst vraag 64, 65 en 66; Marcel, 30 sep: "A Ja, b Nee, c Nee, wordt automatisch als de schout er
// niet is. D prima"): een van de boeren, met zijn karakter en zijn aanzien (js/boeren.js), en twee gelote vaardigheden
// erbij. Is de schout er niet als iemand hem met een voorval zoekt (js/voorvallen.js), dan beslist de raadsman: naar
// zijn karakter, en wat hij kan, telt mee. Wat hij besloot, zegt een bericht. Zijn prijs: hij maait trager
// (T.boerFactor in js/boeren.js). Regels zonder scherm; toetsen in test/raadsman.test.cjs.
//
// "Er niet" is: de schout is niet in het dorp als wie hem zoekt, gaat zoeken, of hij sprak hem niet op tijd (na
// zoektDagen). Hoe je hem kiest, is nog open (werklijst vraag 67): T.raadsmanKandidaten zegt uit wie, T.kiesRaadsman
// kiest. Staande orders (de heer, de heervaart, de marskramer) komen met het land (vraag 66, D).
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js). Een eerste
  // voorstel van Claude (30 sep).
  T.RAADSMAN_INSTELLINGEN = {
    aan: true,
    // Uit hoeveel boeren je kiest.
    kandidaten: 3,
    // Zijn prijs: zoveel keer zo lang doet hij over een tegel maaien. Het vangnet haalt de oogst toch binnen
    // (js/akkers.js), dus dit zegt wánneer zijn graan er is, niet hoeveel.
    maaien: 1.25,
    // Wat een vaardigheid doet bij wat hij beslist (T.VAARDIGHEDEN hieronder): wie het goed kan, maakt wat slecht
    // uitvalt zoveel minder erg (0,5: de helft) en wat goed uitvalt zoveel beter; wie het slecht kan, andersom.
    vaardigheden: { rechtspreken: 0.5, zwijgen: 0.5, rekenen: 0.25, bouwen: 0.5, vechten: 0.5 },
    // Hoe hij kiest, naar zijn karakter (T.KARAKTERS in js/mensen.js): wat een antwoord hem waard is, per procent
    // tevredenheid (tevreden), per procent argwaan van de inner (argwaan), per goud (goud), per tien graan, hout,
    // bier, ... (waren), voor iemand het bos in (verban: plus is streng, min is mild), per tien procent kans op een
    // dode (dood), en per gezin erbij (gezin). Het antwoord dat hem het meest waard is, wint.
    karakters: {
      zanger: { tevreden: 2, argwaan: 0.3, goud: 1, waren: 0.3, verban: -3, dood: 1, gezin: 1 },
      weduwe: { tevreden: 1, argwaan: 1, goud: 2, waren: 2, verban: -4, dood: 2, gezin: 1 },
      woekeraar: { tevreden: 0.3, argwaan: 1, goud: 4, waren: 1, verban: 2, dood: 0.5, gezin: 0 },
      vroedvrouw: { tevreden: 1, argwaan: 1, goud: 1, waren: 1, verban: -2, dood: 4, gezin: 2 },
      heethoofd: { tevreden: 1, argwaan: 0.3, goud: 1, waren: 0.5, verban: 5, dood: 0.5, gezin: 0 },
      vrome: { tevreden: 1, argwaan: 1, goud: 2, waren: 1, verban: -3, dood: 0.2, gezin: 1 },
      roddelaar: { tevreden: 1.5, argwaan: 0.3, goud: 1, waren: 1, verban: 1, dood: 1, gezin: 1 },
      grijsaard: { tevreden: 1, argwaan: 3, goud: 1, waren: 1, verban: 0, dood: 1, gezin: 1 },
      nieuwkomer: { tevreden: 1, argwaan: 1, goud: 1, waren: 1, verban: -4, dood: 1, gezin: 5 },
      drinker: { tevreden: 1.5, argwaan: 0.5, goud: 1, waren: 0.3, verban: 0, dood: 1, gezin: 1 },
    },
    // Wie geen karakter heeft (een boer zoals hij geschreven was), kiest zo.
    gewoon: { tevreden: 1, argwaan: 1, goud: 1, waren: 1, verban: 0, dood: 1, gezin: 1 },
  };
  const IN = () => T.RAADSMAN_INSTELLINGEN;

  // De vijf vaardigheden: hoe je ze ziet, goed of slecht, waar ze over gaan (voor het venster, js/raadsmanvenster.js),
  // en op welk deel van een antwoord ze werken.
  T.VAARDIGHEDEN = {
    rechtspreken: { goed: 'spreekt goed recht', slecht: 'spreekt slecht recht', waarop: 'hoe tevreden het dorp is met zijn vonnis', op: ['tevreden'] },
    zwijgen: { goed: 'kan zwijgen', slecht: 'kan niets voor zich houden', waarop: 'wat de inner te horen krijgt', op: ['argwaan'] },
    rekenen: { goed: 'kan rekenen', slecht: 'kan niet rekenen', waarop: 'wat het kost aan goud en waren', op: ['goud', 'graan', 'wol', 'bier', 'ijzer', 'zout', 'vlees', 'vis', 'kaas', 'hooi'] },
    bouwen: { goed: 'kan bouwen', slecht: 'heeft twee linkerhanden', waarop: 'wat het kost aan hout', op: ['hout'] },
    vechten: { goed: 'kan vechten', slecht: 'is bang', waarop: 'de kans dat er iemand sterft', op: ['sterfkans'] },
  };

  // Hoe elk karakter beslist, in een paar woorden, voor het venster: wat de neigingen hierboven (karakters) zeggen.
  T.RAADSMAN_NEIGINGEN = {
    zanger: 'gul: een feest is nooit te groot, en de heer mag het horen',
    weduwe: 'zuinig en mild: niemand het bos in, en een klein feest',
    woekeraar: 'op het geld: een boete gaat in de kist',
    vroedvrouw: 'zorgzaam: liever niemand dood, wat het ook kost',
    heethoofd: 'streng: wie steelt, moet het bos in',
    vrome: 'vroom: bidden helpt ook, en niemand het bos in',
    roddelaar: 'praat graag, ook met de inner',
    grijsaard: 'voorzichtig: de heer moet tevreden zijn',
    nieuwkomer: 'gastvrij: vreemdelingen zijn welkom, en niemand het bos in',
    drinker: 'gezellig: het dorp moet blij zijn, het kost wat het kost',
  };
  // Wat goed uitvalt voor het dorp: meer tevredenheid, goud en waren; minder argwaan; en een kans op een dode nooit.
  const goedVoorHetDorp = (wat, n) => (wat === 'argwaan' ? n < 0 : wat === 'sterfkans' ? false : n > 0);
  const WAREN = T.VAARDIGHEDEN.rekenen.op.filter((w) => w !== 'goud').concat('hout');

  const dagNu = (S) => Math.floor(S.kalender ? S.kalender.dag : 0);
  const bericht = (tekst, soort) => {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  };
  const naam = (p) => T.naamVanBewoner(p);
  const isBoer = (p) => !!p && T.isBoer(p.wezen);
  const hier = (S, p) => !!(S.bewoners && S.bewoners.mensen.includes(p)) && !p.weg && !!p.wezen && !p.wezen.dood;

  // S.raadsman: wat hij besloot, het laatste achteraan: [{ dag, id, door, wie, antwoord, prijs }]. Wíé raadsman is,
  // staat op zijn poppetje (e.raadsman), want daar kijkt ook het maaien naar (T.boerFactor).
  T.nieuweRaadsman = () => ({ besluiten: [] });

  // De raadsman van nu (een bewoner), of null: geen gekozen, hij is er niet meer, of de spelregel staat uit.
  T.raadsmanVan = function (S) {
    if (!IN().aan || !S.bewoners) return null;
    return S.bewoners.mensen.find((p) => p.wezen && p.wezen.raadsman && hier(S, p)) || null;
  };

  // Uit wie je kiest: zoveel boeren als kandidaten zegt, vast per spel (uit het zaad), zodat een speeltest dezelfde
  // krijgt.
  T.raadsmanKandidaten = function (S) {
    const boeren = S.bewoners ? S.bewoners.mensen.filter((p) => isBoer(p) && hier(S, p)) : [];
    boeren.sort((a, b) => (a.wie < b.wie ? -1 : a.wie > b.wie ? 1 : 0));
    const r = T.dobbelsteen(((((S.lot && S.lot.zaad) || 1) * 67) ^ 0x7a5b) >>> 0);
    const uit = [];
    while (boeren.length && uit.length < IN().kandidaten) uit.push(boeren.splice(Math.floor(r() * boeren.length), 1)[0]);
    return uit;
  };

  // Een boer wordt raadsman; wie het was, is het niet meer. Geeft { kan, reden }.
  T.kiesRaadsman = function (S, p) {
    if (!isBoer(p) || !hier(S, p)) return { kan: false, reden: 'Alleen een boer die hier is, kan raadsman worden.' };
    for (const x of S.bewoners.mensen) if (x.wezen && x !== p) x.wezen.raadsman = false;
    p.wezen.raadsman = true;
    if (!S.raadsman) S.raadsman = T.nieuweRaadsman();
    bericht(`${T.hoofdletter(naam(p))} is je raadsman. Ben je er niet, dan beslist ${naam(p)}.`);
    return { kan: true };
  };

  // Zijn twee vaardigheden, geloot uit de vijf, goed of slecht: { rechtspreken: 'goed', zwijgen: 'slecht' }. Vast per
  // spel en per boer (uit het zaad en zijn naam), zonder dat het lot van de boeren (js/boeren.js) verandert. Wordt er
  // niet geloot (de spelregels), dan kan niemand iets bijzonders.
  T.vaardighedenVan = function (S, p) {
    if (!isBoer(p) || !T.BOEREN_INSTELLINGEN.loten) return {};
    let h = 0;
    for (const c of p.wie) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const r = T.dobbelsteen(((((S.lot && S.lot.zaad) || 1) * 61) ^ h) >>> 0);
    const vrij = Object.keys(T.VAARDIGHEDEN);
    const uit = {};
    for (let i = 0; i < 2 && vrij.length; i++) {
      const soort = vrij.splice(Math.floor(r() * vrij.length), 1)[0];
      uit[soort] = r() < 0.5 ? 'goed' : 'slecht';
    }
    return uit;
  };

  // Wie hij is en wat hij kan, als één regel: "Aaltje · weduwe · geliefd · spreekt goed recht · kan niets voor zich
  // houden". Voor het kiezen, en voor het bericht.
  T.overRaadsmanTekst = function (S, p) {
    const over = T.overBoer(p.wezen);
    const kan = Object.entries(T.vaardighedenVan(S, p)).map(([soort, niveau]) => T.VAARDIGHEDEN[soort][niveau]);
    return [T.hoofdletter(naam(p)), over && over.kort].concat((over && over.eigenschappen) || [], kan).filter(Boolean).join(' · ');
  };

  // ---------------------------------------------------------------------------------------------
  // Hoe hij beslist
  // ---------------------------------------------------------------------------------------------

  // Een antwoord zoals hij het uitvoert: wat hij kan, telt mee (T.VAARDIGHEDEN). Goud en waren blijven hele getallen.
  T.metVaardigheden = function (S, p, doe) {
    const uit = { ...(doe || {}) };
    for (const [soort, niveau] of Object.entries(T.vaardighedenVan(S, p))) {
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

  // Wat een antwoord hem waard is, naar zijn karakter (karakters hierboven).
  function waarde(p, doe) {
    const t = IN().karakters[p.wezen.karakter] || IN().gewoon;
    let n = (t.tevreden || 0) * (doe.tevreden || 0) - (t.argwaan || 0) * (doe.argwaan || 0) + (t.goud || 0) * (doe.goud || 0);
    for (const wat of WAREN) n += ((t.waren || 0) * (doe[wat] || 0)) / 10;
    for (const soort of Object.keys(T.VEE)) n += (t.waren || 0) * (doe[soort] || 0);
    if (doe.verban) n += t.verban || 0;
    n -= ((t.dood || 0) * (doe.sterfkans || 0)) / 10;
    n += (t.gezin || 0) * (doe.gezin || 0);
    return n;
  }

  // De antwoorden die hij kan geven: wat het gesprek sluit, en wat naar een knoop gaat, samen met het eerste antwoord
  // daar dat het sluit (de oude die eerst een kan bier wil). [{ zeg, doe }].
  function antwoordenVan(id) {
    const g = T.GESPREKKEN[id];
    const uit = [];
    for (const k of g.knopen[g.start].keuzes) {
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
  T.raadsmanKeuze = function (S, p, id) {
    let beste = null;
    for (const a of antwoordenVan(id)) {
      const doe = T.metVaardigheden(S, p, a.doe);
      if (!T.prijsVanKeuze(S, doe).kan) continue;
      const w = waarde(p, doe);
      if (!beste || w > beste.w) beste = { zeg: a.zeg, doe, w };
    }
    return beste && { zeg: beste.zeg, doe: beste.doe };
  };

  // Het voorval van nu, beslist door de raadsman (js/voorvallen.js: de schout is er niet). Het gevolg gaat zoals bij
  // een antwoord van jou (T.doeGevolg), en een bericht zegt wat hij deed. Geeft of hij het deed.
  T.raadsmanBeslist = function (S) {
    const L = S.voorvallen && S.voorvallen.lopend;
    const p = T.raadsmanVan(S);
    if (!L || !p) return false;
    const keuze = T.raadsmanKeuze(S, p, L.id);
    if (!keuze) return false;
    const prijs = T.prijsVanKeuze(S, keuze.doe).tekst;
    const zeg = T.vulWoordenIn(S, keuze.zeg);
    L.door = p;
    T.doeGevolg(S, keuze.doe);
    if (!S.raadsman) S.raadsman = T.nieuweRaadsman();
    S.raadsman.besluiten.push({ dag: dagNu(S), id: L.id, door: naam(p), wie: naam(L.wie), antwoord: zeg, prijs });
    if (S.raadsman.besluiten.length > 20) S.raadsman.besluiten.shift();
    const titel = T.VOORVALLEN[L.id].titel;
    bericht(`${T.hoofdletter(naam(p))}, je raadsman, besliste over ${titel}: "${zeg}"${prijs ? ` (${prijs})` : ''}`);
    T.voorvalBeantwoord(S, L.id, p);
    return true;
  };
})(globalThis.Spel = globalThis.Spel || {});
