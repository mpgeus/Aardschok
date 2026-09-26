// De verstopplekken: waar de schout graan en goud wegzet voor de inner en de soldaten van de heer
// (Marcel, 25 sep 2026; ontwerp/spel.md, "Marcel koos voor stap 2"; werklijst punt 6, stap 2).
// Geen kuil en geen los gebouw ("Een kuil vind ik niks"), maar plekken die er al zijn: de kelder
// van een huis of een boerderij, en de kapel. Elke plek werkt anders, zodat het een afweging is
// waar je iets neerzet: hoeveel erin past, hoe vaak de soldaten het vinden, en wat het kost. Het bos
// komt in stap 2, samen met de kudde.
//   - Wat verstopt ligt, staat niet in de schuur of de kist (S.voorraad). De inner telt het dus
//     niet (js/inner.js, T.maakRapport), en het dorp eet het ook niet tot je het terughaalt.
//   - Het karakter van wie er woont, telt (een optie in de spelregels): de roddelaar vertelt het
//     rond, de vrome weigert, de woekeraar houdt zijn deel, en de oudste kent een oude plek.
//   - Wat de soldaten vinden (T.zoekVerstopt), is weg. Daar vraagt T.doorzoekDorp (js/inner.js)
//     om op Sint-Maarten, als de argwaan hoog genoeg is.
// Wegzetten doe je ter plekke: de schout loopt erheen (js/verkennen.js) en er gaat een venster
// open (js/hud.js, T.ui.openVerstoppen). Scherm en klik stellen dezelfde vraag (T.kanVerstoppen,
// T.kanTerughalen). Wat er ligt, staat op het gebouw zelf: g.verstopt = { graan, goud }.
(function (T) {
  'use strict';

  // Alle getallen in één blok, ook in de werkbank van de spelregels (js/opties.js). Een eerste gok,
  // zoals Marcel ze in een tabel zag (spel.md).
  T.VERSTOP_INSTELLINGEN = {
    // Per soort gebouw: hoeveel graan erin past, en de kans dat de soldaten het vinden als ze het
    // dorp doorzoeken. Goud past altijd: een pot onder de vloer. `houdt` is het deel van wat je er
    // neerzet dat een ander houdt: de kapelaan een tiende. Een hut heeft geen kelder.
    plekken: {
      huis: { plaats: 40, vinden: 0.3 },
      stenenHuis: { plaats: 60, vinden: 0.3 },
      boerderij: { plaats: 40, vinden: 0.3 },
      kapel: { plaats: 120, vinden: 0.05, houdt: 0.1 },
    },
    // Bij de schout kijken ze eerst: in zijn eigen kelder vinden ze het met deze kans.
    vindenBijSchout: 0.6,
    // Of het karakter van wie er woont telt (een optie), en wat het doet: de kans dat de soldaten
    // het vinden keer `vinden`, en het deel van wat je er neerzet dat hij houdt.
    karakters: true,
    bewoners: {
      roddelaar: { vinden: 2 }, // vertelt het rond
      vrome: { weigert: true }, // bidt ook voor de heer
      woekeraar: { vinden: 0.5, houdt: 0.2 }, // een goede kelder, maar hij houdt een vijfde
      grijsaard: { vinden: 0.25 }, // de oudste weet een oude plek onder de vloer
    },
    // Wat de soldaten vinden, is weg, en elke vondst maakt de inner zoveel argwanender.
    argwaanPerVondst: 0.15,
  };

  const VI = () => T.VERSTOP_INSTELLINGEN;
  const WAT = ['graan', 'goud'];
  const dagNu = (S) => Math.floor(S.kalender ? S.kalender.dag : 0);
  const hoofdletter = (s) => (T.hoofdletter ? T.hoofdletter(s) : s.charAt(0).toUpperCase() + s.slice(1));
  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || '');
  const inhoudVan = (g) => g.verstopt || { graan: 0, goud: 0 };

  // Een deel in woorden: een tiende, een vijfde.
  const DELEN = [[1 / 2, 'de helft'], [1 / 3, 'een derde'], [1 / 4, 'een vierde'], [1 / 5, 'een vijfde'], [1 / 10, 'een tiende']];
  T.deelTekst = function (p) {
    const d = DELEN.find(([w]) => Math.abs(w - p) < 1e-6);
    return d ? d[1] : `${Math.round(p * 100)}%`;
  };

  // Hoe vaak de soldaten het vinden, in woorden. Het venster noemt geen getal: de schout weet het
  // ook niet precies.
  T.vindKansTekst = function (kans) {
    if (kans >= 0.5) return 'vaak';
    if (kans >= 0.2) return 'soms';
    if (kans >= 0.08) return 'zelden';
    return 'bijna nooit';
  };

  // "20 graan en 5 goud", of '' als er niets ligt.
  T.inhoudTekst = function (inhoud) {
    const delen = WAT.filter((wat) => (inhoud[wat] || 0) >= 1).map((wat) => `${Math.floor(inhoud[wat])} ${wat}`);
    return opsomming(delen);
  };

  // ---------------------------------------------------------------------------------------------
  // De plekken
  // ---------------------------------------------------------------------------------------------

  // Wie er woont: de boer met hetzelfde `huis` als de boerderij (uit het betekenisbestand, net als
  // bij een akker; js/kaart.js). Het huis van de schout heet "schout". Een huis dat de speler zelf
  // bouwde, heeft niemand met een naam: daar wonen gewone dorpelingen.
  T.bewonerVan = function (S, g) {
    if (!g || !g.huis || g.huis === 'schout') return null;
    const w = S.wereld;
    return (w && (w.wezens || []).find((e) => e.huis === g.huis && e.wie)) || null;
  };

  const vrouw = (e) => !!(e && T.MENSEN && T.MENSEN[e.wie] && T.MENSEN[e.wie].geslacht === 'vrouw');
  const karakterVan = (e) => (e ? e.karakter || (T.MENSEN && T.MENSEN[e.wie] && T.MENSEN[e.wie].karakter) || null : null);

  function plekNaam(g, vanSchout, bewoner) {
    if (g.soort === 'kapel') return 'de kapel';
    if (vanSchout) return 'je eigen kelder';
    if (bewoner) return `de kelder van ${bewoner.naam}`;
    return g.soort === 'boerderij' ? 'de kelder van deze boerderij' : `de kelder van dit ${T.GEBOUWEN[g.soort].naam}`;
  }

  // Kun je in dit gebouw iets verstoppen, en hoe gaat het daar? null als het niet kan: een hut heeft
  // geen kelder, en een gebouw in aanbouw nog niet. Anders { gebouw, naam, plaats, vinden, houdt,
  // wieHoudt, weigert, bewoner, karakter, vanSchout }.
  T.verstopPlekVan = function (S, g) {
    const V = VI();
    const basis = g && V.plekken[g.soort];
    if (!basis || !g.klaar) return null;
    const vanSchout = g.huis === 'schout';
    const bewoner = T.bewonerVan(S, g);
    const karakter = karakterVan(bewoner);
    const eigen = V.karakters && karakter ? V.bewoners[karakter] || null : null;
    let vinden = vanSchout ? V.vindenBijSchout : basis.vinden;
    if (eigen && typeof eigen.vinden === 'number') vinden *= eigen.vinden;
    const houdtHier = basis.houdt || 0;
    const houdtBewoner = (eigen && eigen.houdt) || 0;
    const houdt = Math.max(houdtHier, houdtBewoner);
    let wieHoudt = null;
    if (houdtBewoner > 0 && houdtBewoner >= houdtHier) wieHoudt = bewoner.naam;
    else if (houdtHier > 0) wieHoudt = g.soort === 'kapel' ? 'de kapelaan' : 'wie er woont';
    return {
      gebouw: g, vanSchout, bewoner, karakter,
      naam: plekNaam(g, vanSchout, bewoner),
      plaats: basis.plaats,
      vinden: Math.max(0, Math.min(1, vinden)),
      houdt: Math.max(0, Math.min(1, houdt)),
      wieHoudt,
      weigert: !!(eigen && eigen.weigert),
    };
  };

  T.verstopPlekken = function (S) {
    return (S.gebouwen || []).map((g) => T.verstopPlekVan(S, g)).filter(Boolean);
  };

  // Alles wat nu verstopt ligt: { graan, goud, plekken } (hoeveel plekken er iets in hebben).
  T.verstoptTotaal = function (S) {
    const t = { graan: 0, goud: 0, plekken: 0 };
    for (const g of S.gebouwen || []) {
      const v = g.verstopt;
      if (!v || !(v.graan > 0 || v.goud > 0)) continue;
      t.graan += v.graan || 0;
      t.goud += v.goud || 0;
      t.plekken++;
    }
    return t;
  };

  // Wat het karakter van wie er woont hier betekent, in één zin (het venster, en de muis als hij
  // weigert). Alleen als het karakter telt; anders is het een kelder als alle andere.
  T.overBewonerTekst = function (p) {
    const b = p.bewoner;
    if (!b || !VI().karakters || !VI().bewoners[p.karakter]) return '';
    const hij = vrouw(b) ? 'zij' : 'hij';
    const zijn = vrouw(b) ? 'haar' : 'zijn';
    switch (p.karakter) {
      case 'roddelaar': return `${b.naam} weet alles van iedereen, en vertelt het ook.`;
      case 'vrome': return `${b.naam} bidt drie keer per dag, en één keer voor de heer: in ${zijn} kelder verstop je niets.`;
      case 'woekeraar': return `${b.naam} leent graan uit tegen woeker. ${hoofdletter(zijn)} kelder is goed, maar ${hij} houdt ${T.deelTekst(p.houdt)} van wat je er neerzet.`;
      case 'grijsaard': return `${b.naam} is de oudste, en weet nog waar ${zijn} vader het graan verstopte toen de vorige heer kwam.`;
      default: return '';
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Wegzetten en terughalen
  // ---------------------------------------------------------------------------------------------

  // Zolang de inner of de heer in het dorp is, sjouw je niets: dat valt op. Het is dus werk voor
  // vóór zijn komst (hij kondigt zich tien dagen vooraf aan), en voor als hij weer weg is. Geeft
  // wie er is ('de inner', 'de heer') of null.
  function wieIsEr(S) {
    const b = S.inner && S.inner.bezoek;
    if (b && !b.weg) return 'de inner';
    const h = S.heer && S.heer.bezoek;
    if (h && !h.weg) return 'de heer';
    return null;
  }
  function nietNu(S) {
    const wie = wieIsEr(S);
    if (wie === 'de inner') return 'De inner is in het dorp. Wie nu graan versjouwt, valt op.';
    if (wie === 'de heer') return 'De heer en zijn soldaten zijn in het dorp.';
    return null;
  }

  // Mag `n` van `wat` (graan of goud) hierheen? { kan, reden } of { kan, komt, houdt, plek }: wat
  // er aankomt, en wat een ander ervan houdt.
  T.kanVerstoppen = function (S, g, wat, n) {
    const p = T.verstopPlekVan(S, g);
    if (!p) return { kan: false, reden: 'Hier kun je niets verstoppen.' };
    if (!WAT.includes(wat)) return { kan: false, reden: `${hoofdletter(wat)} verstop je hier niet.` };
    if (p.weigert) return { kan: false, reden: T.overBewonerTekst(p) || 'Wie hier woont, wil er niets van weten.' };
    const stil = nietNu(S);
    if (stil) return { kan: false, reden: stil };
    if (!(n > 0)) return { kan: false, reden: 'Er is niets om weg te zetten.' };
    const heb = (S.voorraad && S.voorraad[wat]) || 0;
    if (heb + 1e-9 < n) return { kan: false, reden: heb >= 1 ? `Zoveel ${wat} heb je niet (${Math.floor(heb)}).` : `Je hebt geen ${wat}.` };
    const komt = n * (1 - p.houdt);
    if (wat === 'graan') {
      const vrij = p.plaats - inhoudVan(g).graan;
      if (komt > vrij + 1e-9) return { kan: false, reden: vrij >= 1 ? `Er past nog maar ${Math.floor(vrij)} graan bij.` : 'Er past geen graan meer bij.' };
    }
    return { kan: true, komt, houdt: n - komt, plek: p };
  };

  T.verstop = function (S, g, wat, n) {
    const k = T.kanVerstoppen(S, g, wat, n);
    if (!k.kan) return k;
    const inhoud = g.verstopt || (g.verstopt = { graan: 0, goud: 0 });
    inhoud[wat] += k.komt;
    // Pas daarna uit de voorraad: die werkt het scherm bij, en dan klopt ook wat er verstopt ligt.
    T.wijzigVoorraad(S, wat, -n);
    return k;
  };

  // Hoeveel je er hoogstens van kunt wegzetten: wat je hebt, en bij graan wat er nog past (met wat
  // een ander ervan houdt erbij). Voor de knop die de kelder vult.
  T.hoeveelVerstoppen = function (S, g, wat) {
    const p = T.verstopPlekVan(S, g);
    if (!p || p.weigert) return 0;
    const heb = Math.floor((S.voorraad && S.voorraad[wat]) || 0);
    if (wat !== 'graan' || p.houdt >= 1) return heb;
    const vrij = p.plaats - inhoudVan(g).graan;
    return Math.max(0, Math.min(heb, Math.floor(vrij / (1 - p.houdt) + 1e-9)));
  };

  T.kanTerughalen = function (S, g, wat, n) {
    if (!T.verstopPlekVan(S, g) && !(inhoudVan(g)[wat] > 0)) return { kan: false, reden: 'Hier ligt niets.' };
    const stil = nietNu(S);
    if (stil) return { kan: false, reden: stil };
    const ligt = inhoudVan(g)[wat] || 0;
    if (ligt < 1e-9) return { kan: false, reden: `Hier ligt geen ${wat}.` };
    if (!(n > 0)) return { kan: false, reden: 'Er is niets om terug te halen.' };
    if (n > ligt + 1e-9) return { kan: false, reden: `Zoveel ligt hier niet (${Math.floor(ligt)}).` };
    return { kan: true, n };
  };

  T.haalTerug = function (S, g, wat, n) {
    const k = T.kanTerughalen(S, g, wat, n);
    if (!k.kan) return k;
    const inhoud = g.verstopt;
    inhoud[wat] = Math.max(0, inhoud[wat] - n);
    if (inhoud[wat] < 1e-9) inhoud[wat] = 0;
    T.wijzigVoorraad(S, wat, n);
    return k;
  };

  // Wat de muis op een gebouw met een plek zegt, en of een klik het venster opent (js/verkennen.js):
  // { tekst, kan, reden }.
  T.verstopHandeling = function (S, p) {
    const inhoud = T.inhoudTekst(inhoudVan(p.gebouw));
    const erin = inhoud ? ` · er ligt ${inhoud}` : '';
    if (p.weigert && !inhoud) {
      return { tekst: `${hoofdletter(p.naam)}: ${p.bewoner.naam} wil er niets van weten`, kan: false, reden: T.overBewonerTekst(p) };
    }
    const stil = nietNu(S);
    if (stil) return { tekst: `${hoofdletter(p.naam)}: niet zolang ${wieIsEr(S)} in het dorp is${erin}`, kan: false, reden: stil };
    const kar = VI().karakters && p.karakter && T.KARAKTERS && T.KARAKTERS[p.karakter] ? ` (${T.KARAKTERS[p.karakter].kort})` : '';
    return { tekst: `Verstoppen in ${p.naam}${kar}${erin}`, kan: true };
  };

  // Waar de schout gaat staan om bij een gebouw te komen: een tegel aan de rand van zijn voet die
  // aan een begaanbare tegel grenst, zo dicht mogelijk bij hem. T.loopNaast loopt dan tot naast
  // die tegel. Null als er geen is.
  T.randVanGebouw = function (S, g) {
    const w = S.wereld;
    const v = g.voorwerp && g.voorwerp.beslaat
      ? { x: g.x, y: g.y, b: g.voorwerp.beslaat[0], h: g.voorwerp.beslaat[1] }
      : { x: g.x, y: g.y, ...(g.voet || (T.gebouwVoet && T.gebouwVoet(g.soort)) || { b: 1, h: 1 }) };
    const binnen = (x, y) => x >= v.x && x < v.x + v.b && y >= v.y && y < v.y + v.h;
    const van = S.schout ? { x: S.schout.tx != null ? S.schout.tx : Math.round(S.schout.x), y: S.schout.ty != null ? S.schout.ty : Math.round(S.schout.y) } : { x: v.x, y: v.y };
    let beste = null;
    let bij = Infinity;
    for (let y = v.y; y < v.y + v.h; y++) {
      for (let x = v.x; x < v.x + v.b; x++) {
        const bereikbaar = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !binnen(x + dx, y + dy) && T.isBegaanbaar(w, x + dx, y + dy));
        if (!bereikbaar) continue;
        const a = Math.hypot(x - van.x, y - van.y);
        if (a < bij) {
          bij = a;
          beste = { x, y };
        }
      }
    }
    return beste;
  };

  // ---------------------------------------------------------------------------------------------
  // De soldaten zoeken (js/inner.js, T.doorzoekDorp, op Sint-Maarten)
  // ---------------------------------------------------------------------------------------------

  // Een getal 0..1, vast per spel, per dag en per plek (zoals de inner het doet), zodat een toets
  // hetzelfde uitkomt.
  function lot(S, g) {
    const zaad = ((S.lot && S.lot.zaad) || 1) + dagNu(S) * 7919 + g.x * 104729 + g.y * 1299709;
    const x = Math.sin(zaad) * 10000;
    return x - Math.floor(x);
  }

  // Plek voor plek: wat ze vinden, is weg, en elke vondst maakt argwanend. Geeft wat ze vonden, als
  // tekst ("20 graan in de kelder van Klaas"). `getal` (voor een toets) geeft per plek een getal
  // 0..1 in plaats van het lot: onder de kans van de plek vinden ze het.
  T.zoekVerstopt = function (S, getal) {
    const gevonden = [];
    for (const p of T.verstopPlekken(S)) {
      const g = p.gebouw;
      const tekst = T.inhoudTekst(inhoudVan(g));
      if (!tekst) continue;
      const r = getal ? getal(p) : lot(S, g);
      if (r >= p.vinden) continue;
      gevonden.push(`${tekst} in ${p.naam}`);
      g.verstopt = { graan: 0, goud: 0 };
      if (VI().argwaanPerVondst > 0 && T.zetArgwaan) T.zetArgwaan(S, VI().argwaanPerVondst, 'de soldaten vonden wat je verstopte');
    }
    if (gevonden.length && T.ui && T.ui.toonVoorraad) T.ui.toonVoorraad(S);
    return gevonden;
  };
})(globalThis.Spel = globalThis.Spel || {});
