// De boeren: wat ze kunnen, en wie ze zijn, geloot bij elk nieuw spel (Marcel, 24 sep 2026: "Ze
// moeten random eigenschappen hebben. De ene oogst dan wat sneller dan de ander. Etc";
// ontwerp/spel.md, "De boeren krijgen willekeurige eigenschappen").
//   - Wie een boer is, zijn karakter, komt uit de stapel T.KARAKTERS (js/mensen.js), elk met zijn
//     eigen gesprek (js/gesprekken.js, dat heet zoals het karakter).
//   - Wat hij kan (maaien, opbrengst, zaaien) en hoe het dorp hem ziet (aanzien) staat hieronder in
//     T.BOEREN_INSTELLINGEN: per eigenschap de treden, met een kans en wat ze doen. Die getallen
//     staan ook in de werkbank van de spelregels (js/opties.js), en loten of niet is daar een optie.
// T.lootBoeren trekt voor elke boer (een mens met een `karakter` in T.MENSEN) een karakter en zijn
// eigenschappen, uit een zaad, zodat een spel zijn lot houdt; T.pasLotToe zet het op de poppetjes.
// De regels vragen het aan T.boerFactor (js/akkers.js: maaien, opbrengst, zaaien) en T.aanzienVan
// (js/heer.js: de schandpaal), het scherm aan T.overBoer. Zonder dit bestand (een toets die het
// niet laadt) is iedere boer gewoon, en voert hij het gesprek van zijn vaste karakter.
(function (T) {
  'use strict';

  T.BOEREN_INSTELLINGEN = {
    // Loten (Marcel koos het), of vast: de vijf zoals ze geschreven waren (T.MENSEN[id].karakter),
    // en allemaal gewoon. Een optie in de spelregels.
    loten: true,
    // Per eigenschap de treden: hoe je hem ziet ("gewoon" zie je niet), de kans, en wat hij doet.
    //   maaien:    factor op hoe lang een tegel duurt (T.OOGST_TEGEL_DUUR): kleiner is sneller.
    //              Het vangnet haalt toch alles binnen (js/akkers.js), dus dit zegt wánneer het
    //              graan er is, niet hoeveel: het telt vooral in de hongerweken vóór de oogst.
    //   opbrengst: factor op het graan per tegel (T.GRAAN_PER_TEGEL), ook bij het vangnet.
    //   zaaien:    factor op het zaaigraan per tegel (T.ZAAIGRAAN_PER_TEGEL).
    //   aanzien:   wat de schandpaal het dorp aan tevredenheid kost als hij er staat (js/heer.js).
    //              Sommige karakters leggen dit vast (de woekeraar is gehaat).
    maaien: [
      { id: 'snel', naam: 'snelle maaier', kans: 0.25, factor: 0.7 },
      { id: 'gewoon', naam: 'gewoon', kans: 0.5, factor: 1 },
      { id: 'traag', naam: 'trage maaier', kans: 0.25, factor: 1.3 },
    ],
    opbrengst: [
      { id: 'groeneVingers', naam: 'groene vingers', kans: 0.25, factor: 1.15 },
      { id: 'gewoon', naam: 'gewoon', kans: 0.5, factor: 1 },
      { id: 'slordig', naam: 'slordig', kans: 0.25, factor: 0.85 },
    ],
    zaaien: [
      { id: 'zuinig', naam: 'zuinig', kans: 0.25, factor: 0.8 },
      { id: 'gewoon', naam: 'gewoon', kans: 0.5, factor: 1 },
      { id: 'kwistig', naam: 'kwistig', kans: 0.25, factor: 1.2 },
    ],
    aanzien: [
      { id: 'geliefd', naam: 'geliefd', kans: 0.3, schandpaal: 0.3 },
      { id: 'gewoon', naam: 'gewoon', kans: 0.4, schandpaal: 0.15 },
      { id: 'gehaat', naam: 'gehaat', kans: 0.3, schandpaal: 0.05 },
    ],
  };

  const IN = () => T.BOEREN_INSTELLINGEN;
  // De eigenschappen, in de volgorde waarin je ze ziet.
  T.BOER_EIGENSCHAPPEN = ['maaien', 'opbrengst', 'zaaien', 'aanzien'];
  const trede = (soort, id) => (IN()[soort] || []).find((t) => t.id === id) || null;

  // Een eenvoudige dobbelsteen met een zaad (mulberry32): hetzelfde zaad geeft hetzelfde lot.
  function dobbelsteen(zaad) {
    let a = zaad >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Eén trede trekken, naar de kansen.
  function trek(r, treden) {
    const som = treden.reduce((n, t) => n + Math.max(0, t.kans || 0), 0);
    let x = r() * som;
    for (const t of treden) {
      x -= Math.max(0, t.kans || 0);
      if (x < 0) return t.id;
    }
    return treden[treden.length - 1].id;
  }

  // Wie zijn de boeren? De mensen in de wereld met een karakter in T.MENSEN (js/mensen.js).
  const isBoer = (e) => !!(e && e.wie && T.MENSEN && T.MENSEN[e.wie] && T.MENSEN[e.wie].karakter);
  const boerenIn = (S) => ((S.wereld && S.wereld.wezens) || []).filter((e) => isBoer(e) && !e.dood);

  // Het aanzien van een karakter, als dat vastligt, anders dat van de mens als er niet geloot wordt.
  function vastAanzien(id, karakter) {
    const k = T.KARAKTERS && T.KARAKTERS[karakter];
    return (k && k.aanzien) || (T.MENSEN[id] && T.MENSEN[id].aanzien) || 'gewoon';
  }

  // Het lot voor alle boeren in de wereld, uit een zaad (zonder zaad een willekeurig). Wie het
  // krapst zit, trekt eerst: mannen kunnen geen vrouwenkarakter trekken (een weduwe is altijd een
  // boerin), dus zij kiezen eerst uit de karakters die beide kunnen. Geen karakter twee keer.
  T.lootBoeren = function (S, zaad) {
    const z = zaad != null ? zaad : Math.floor(Math.random() * 2147483647);
    const r = dobbelsteen(z);
    const ids = boerenIn(S).map((e) => e.wie).filter((id, i, a) => a.indexOf(id) === i).sort();
    ids.sort((a, b) => (T.MENSEN[a].geslacht === 'vrouw') - (T.MENSEN[b].geslacht === 'vrouw'));
    const vrij = Object.keys(T.KARAKTERS || {});
    const boeren = {};
    for (const id of ids) {
      const g = T.MENSEN[id].geslacht || 'man';
      const kan = vrij.filter((k) => !T.KARAKTERS[k].geslacht || T.KARAKTERS[k].geslacht === g);
      const karakter = kan.length ? kan[Math.floor(r() * kan.length)] : T.MENSEN[id].karakter;
      if (vrij.includes(karakter)) vrij.splice(vrij.indexOf(karakter), 1);
      const eigenschappen = {};
      for (const soort of T.BOER_EIGENSCHAPPEN) eigenschappen[soort] = trek(r, IN()[soort]);
      const vast = T.KARAKTERS[karakter] && T.KARAKTERS[karakter].aanzien;
      if (vast) eigenschappen.aanzien = vast;
      boeren[id] = { karakter, eigenschappen };
    }
    S.lot = { zaad: z, boeren };
    T.pasLotToe(S);
    return S.lot;
  };

  // Het lot op de poppetjes zetten: karakter, eigenschappen, en het gesprek van zijn karakter.
  // Wordt er niet geloot (de optie in de spelregels), dan is iedereen zoals hij geschreven was.
  T.pasLotToe = function (S) {
    for (const e of boerenIn(S)) {
      const m = T.MENSEN[e.wie];
      const uitLot = IN().loten && S.lot && S.lot.boeren && S.lot.boeren[e.wie];
      e.karakter = uitLot ? uitLot.karakter : m.karakter;
      if (uitLot) {
        e.eigenschappen = { ...uitLot.eigenschappen };
      } else {
        e.eigenschappen = {};
        for (const soort of T.BOER_EIGENSCHAPPEN) e.eigenschappen[soort] = 'gewoon';
        e.eigenschappen.aanzien = vastAanzien(e.wie, e.karakter);
      }
      if (T.GESPREKKEN && T.GESPREKKEN[e.karakter]) e.gesprek = e.karakter;
    }
  };

  // Hoeveel keer zo lang (maaien), zoveel graan (opbrengst), zoveel zaaigraan (zaaien): de factor
  // van deze eigenschap bij deze boer. 1 voor wie er geen heeft, of geen boer is.
  T.boerFactor = function (e, soort) {
    const id = e && e.eigenschappen && e.eigenschappen[soort];
    const t = id && trede(soort, id);
    return t && typeof t.factor === 'number' ? t.factor : 1;
  };

  // Wat de schandpaal het dorp kost als hij er staat, naar zijn aanzien; null voor wie geen boer
  // is (die kan er niet aan: de marskramer, de heer zelf).
  T.aanzienVan = function (e) {
    if (!isBoer(e)) return null;
    const id = (e.eigenschappen && e.eigenschappen.aanzien) || vastAanzien(e.wie, e.karakter || T.MENSEN[e.wie].karakter);
    const t = trede('aanzien', id);
    return t ? t.schandpaal : null;
  };

  // Wat je van hem ziet (Marcel koos: meteen, bij de muis, boven het gesprek en bij de
  // schandpaal): { kort: 'weduwe', lang: 'weduwe, met drie kleine kinderen', eigenschappen:
  // ['snelle maaier', 'geliefd'] }. Wat gewoon is, staat er niet bij. null voor wie geen boer is.
  T.overBoer = function (e) {
    if (!isBoer(e)) return null;
    const karakter = e.karakter || T.MENSEN[e.wie].karakter;
    const k = (T.KARAKTERS && T.KARAKTERS[karakter]) || {};
    const eigenschappen = [];
    for (const soort of T.BOER_EIGENSCHAPPEN) {
      const id = e.eigenschappen ? e.eigenschappen[soort] : soort === 'aanzien' ? vastAanzien(e.wie, karakter) : 'gewoon';
      const t = id && id !== 'gewoon' && trede(soort, id);
      if (t) eigenschappen.push(t.naam);
    }
    return { kort: k.kort || karakter, lang: k.lang || '', eigenschappen };
  };

  // Hetzelfde, als één regel: "weduwe, met drie kleine kinderen · snelle maaier · geliefd".
  T.overBoerTekst = function (e, kort) {
    const o = T.overBoer(e);
    if (!o) return '';
    return [kort ? o.kort : o.lang].concat(o.eigenschappen).filter(Boolean).join(' · ');
  };
})(globalThis.Spel = globalThis.Spel || {});
