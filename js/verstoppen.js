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
    // De roddelaar vertelt het in de herberg (Marcel koos het op 27 sep, vraag 38): zijn kelder is pas
    // riskanter als hij er zat terwijl er iets lag (inDeHerberg; js/herberg.js zet g.verteld). Een dorp
    // zonder herberg hoort het toch wel. Zag hij de schout ergens anders iets wegzetten, dan vertelt hij
    // dat ook, en daar vinden ze het dan net zo makkelijk (js/zien.js, stuk 2 van het zichtveld).
    bewoners: {
      roddelaar: { vinden: 2, inDeHerberg: true }, // vertelt het rond
      vrome: { weigert: true }, // bidt ook voor de heer
      woekeraar: { vinden: 0.5, houdt: 0.2 }, // een goede kelder, maar hij houdt een vijfde
      grijsaard: { vinden: 0.25 }, // de oudste weet een oude plek onder de vloer
    },
    // Wat de soldaten vinden, is weg, en elke vondst maakt de inner zoveel argwanender.
    argwaanPerVondst: 0.15,
  };

  const VI = () => T.VERSTOP_INSTELLINGEN;
  const WAT = ['graan', 'goud'];
  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const hoofdletter = (s) => T.hoofdletter(s);
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
  // Niet T.bewonerVan: die naam is van js/bewoners.js (de bewoner van een poppetje). Tot 27 sep heette
  // deze ook zo, en omdat js/bewoners.js later laadt, kreeg de kelder in het spel nooit een bewoner.
  T.bewonerVanGebouw = function (D, g) {
    if (!g || !g.huis || g.huis === 'schout') return null;
    const w = D.wereld;
    return (w && (w.wezens || []).find((e) => e.huis === g.huis && e.wie)) || null;
  };

  const vrouw = (e) => !!(e && T.MENSEN && T.MENSEN[e.wie] && T.MENSEN[e.wie].geslacht === 'vrouw');
  const karakterVan = (e) => (e ? e.karakter || (T.MENSEN && T.MENSEN[e.wie] && T.MENSEN[e.wie].karakter) || null : null);

  // Vertelt deze bewoner in de herberg wat hij weet? Zijn karakter zegt het (inDeHerberg: de
  // roddelaar), als het karakter telt (de optie in de spelregels). Voor wat er in zijn eigen kelder ligt
  // (js/herberg.js), en voor wat hij de schout zag doen (js/zien.js).
  T.vertelInDeHerberg = function (p) {
    const V = VI();
    const k = karakterVan(p && p.wezen) || (p && T.MENSEN && T.MENSEN[p.wie] && T.MENSEN[p.wie].karakter);
    const eigen = V.karakters && k && V.bewoners[k];
    return !!(eigen && eigen.inDeHerberg);
  };

  function plekNaam(g, vanSchout, bewoner) {
    if (g.soort === 'kapel') return 'de kapel';
    if (vanSchout) return 'je eigen kelder';
    if (bewoner) return `de kelder van ${bewoner.naam}`;
    return g.soort === 'boerderij' ? 'de kelder van deze boerderij' : `de kelder van dit ${T.GEBOUWEN[g.soort].naam}`;
  }

  // Kun je in dit gebouw iets verstoppen, en hoe gaat het daar? null als het niet kan: een hut heeft
  // geen kelder, en een gebouw in aanbouw nog niet. Anders { gebouw, naam, plaats, vinden, houdt,
  // wieHoudt, weigert, bewoner, karakter, vanSchout }.
  T.verstopPlekVan = function (D, g) {
    const V = VI();
    const basis = g && V.plekken[g.soort];
    if (!basis || !g.klaar) return null;
    const vanSchout = g.huis === 'schout';
    const bewoner = T.bewonerVanGebouw(D, g);
    const karakter = karakterVan(bewoner);
    const eigen = V.karakters && karakter ? V.bewoners[karakter] || null : null;
    let vinden = vanSchout ? V.vindenBijSchout : basis.vinden;
    // Wat pas telt als het in de herberg verteld is (de roddelaar), telt alleen dan; zonder herberg altijd.
    const heeftHerberg = !!T.herbergVan(D);
    const verteld = g.verteld != null;
    const telt = eigen && (!eigen.inDeHerberg || verteld || !heeftHerberg);
    if (telt && typeof eigen.vinden === 'number') vinden *= eigen.vinden;
    // Vertelde een getuige in de herberg wat hij hier zag (js/zien.js), dan vinden de soldaten het net zo
    // makkelijk als in de kelder van de roddelaar, en één keer: woont de roddelaar hier zelf, dan telde
    // het hierboven al.
    const doorGetuige = !!(V.karakters && g.verteldDoor && !(eigen && eigen.inDeHerberg));
    if (doorGetuige && V.bewoners.roddelaar && typeof V.bewoners.roddelaar.vinden === 'number') vinden *= V.bewoners.roddelaar.vinden;
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
      verteld: !!(eigen && eigen.inDeHerberg && heeftHerberg && verteld),
      inDeHerberg: !!(eigen && eigen.inDeHerberg && heeftHerberg),
      verteldDoor: doorGetuige ? g.verteldDoor : null, // de getuige die het in de herberg vertelde
    };
  };

  T.verstopPlekken = function (D) {
    return (D.gebouwen || []).map((g) => T.verstopPlekVan(D, g)).filter(Boolean);
  };

  // Alles wat nu verstopt ligt: { graan, goud, plekken } (hoeveel plekken er iets in hebben).
  T.verstoptTotaal = function (D) {
    const t = { graan: 0, goud: 0, plekken: 0 };
    for (const g of D.gebouwen || []) {
      const v = g.verstopt;
      if (!v || !(v.graan > 0 || v.goud > 0)) continue;
      t.graan += v.graan || 0;
      t.goud += v.goud || 0;
      t.plekken++;
    }
    return t;
  };

  // Wat het karakter van wie er woont hier betekent, in één zin (het venster, en de muis als hij
  // weigert). Alleen als het karakter telt; anders is het een kelder als alle andere. (Tot 27 sep
  // T.overBewonerTekst, net als de muistekst in js/bewoners.js, en die won.)
  T.overKelderTekst = function (p) {
    const b = p.bewoner;
    if (!b || !VI().karakters || !VI().bewoners[p.karakter]) return '';
    const hij = vrouw(b) ? 'zij' : 'hij';
    const zijn = vrouw(b) ? 'haar' : 'zijn';
    switch (p.karakter) {
      case 'roddelaar':
        if (p.verteld) return `${b.naam} heeft in de herberg al verteld wat hier ligt.`;
        if (p.inDeHerberg) return `${b.naam} weet alles van iedereen, en vertelt het in de herberg.`;
        return `${b.naam} weet alles van iedereen, en vertelt het ook.`;
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
  function wieIsEr(D) {
    const b = D.inner && D.inner.bezoek;
    if (b && !b.weg) return 'de inner';
    const h = D.heer && D.heer.bezoek;
    if (h && !h.weg) return 'de heer';
    return null;
  }
  function nietNu(D) {
    const wie = wieIsEr(D);
    if (wie === 'de inner') return 'De inner is in het dorp. Wie nu graan versjouwt, valt op.';
    if (wie === 'de heer') return 'De heer en zijn soldaten zijn in het dorp.';
    return null;
  }

  // Mag `n` van `wat` (graan of goud) hierheen? { kan, reden } of { kan, komt, houdt, plek }: wat
  // er aankomt, en wat een ander ervan houdt.
  T.kanVerstoppen = function (D, g, wat, n) {
    const p = T.verstopPlekVan(D, g);
    if (!p) return { kan: false, reden: 'Hier kun je niets verstoppen.' };
    if (!WAT.includes(wat)) return { kan: false, reden: `${hoofdletter(wat)} verstop je hier niet.` };
    if (p.weigert) return { kan: false, reden: T.overKelderTekst(p) || 'Wie hier woont, wil er niets van weten.' };
    const stil = nietNu(D);
    if (stil) return { kan: false, reden: stil };
    if (!(n > 0)) return { kan: false, reden: 'Er is niets om weg te zetten.' };
    const heb = (D.voorraad && D.voorraad[wat]) || 0;
    if (heb + 1e-9 < n) return { kan: false, reden: heb >= 1 ? `Zoveel ${wat} heb je niet (${Math.floor(heb)}).` : `Je hebt geen ${wat}.` };
    const komt = n * (1 - p.houdt);
    if (wat === 'graan') {
      const vrij = p.plaats - inhoudVan(g).graan;
      if (komt > vrij + 1e-9) return { kan: false, reden: vrij >= 1 ? `Er past nog maar ${Math.floor(vrij)} graan bij.` : 'Er past geen graan meer bij.' };
    }
    return { kan: true, komt, houdt: n - komt, plek: p };
  };

  T.verstop = function (D, g, wat, n) {
    const k = T.kanVerstoppen(D, g, wat, n);
    if (!k.kan) return k;
    const inhoud = g.verstopt || (g.verstopt = { graan: 0, goud: 0 });
    inhoud[wat] += k.komt;
    // Pas daarna uit de voorraad: die werkt het scherm bij, en dan klopt ook wat er verstopt ligt.
    T.wijzigVoorraad(D, wat, -n);
    return k;
  };

  // Hoeveel je er hoogstens van kunt wegzetten: wat je hebt, en bij graan wat er nog past (met wat
  // een ander ervan houdt erbij). Voor de knop die de kelder vult.
  T.hoeveelVerstoppen = function (D, g, wat) {
    const p = T.verstopPlekVan(D, g);
    if (!p || p.weigert) return 0;
    const heb = Math.floor((D.voorraad && D.voorraad[wat]) || 0);
    if (wat !== 'graan' || p.houdt >= 1) return heb;
    const vrij = p.plaats - inhoudVan(g).graan;
    return Math.max(0, Math.min(heb, Math.floor(vrij / (1 - p.houdt) + 1e-9)));
  };

  T.kanTerughalen = function (D, g, wat, n) {
    if (!T.verstopPlekVan(D, g) && !(inhoudVan(g)[wat] > 0)) return { kan: false, reden: 'Hier ligt niets.' };
    const stil = nietNu(D);
    if (stil) return { kan: false, reden: stil };
    const ligt = inhoudVan(g)[wat] || 0;
    if (ligt < 1e-9) return { kan: false, reden: `Hier ligt geen ${wat}.` };
    if (!(n > 0)) return { kan: false, reden: 'Er is niets om terug te halen.' };
    if (n > ligt + 1e-9) return { kan: false, reden: `Zoveel ligt hier niet (${Math.floor(ligt)}).` };
    return { kan: true, n };
  };

  T.haalTerug = function (D, g, wat, n) {
    const k = T.kanTerughalen(D, g, wat, n);
    if (!k.kan) return k;
    const inhoud = g.verstopt;
    inhoud[wat] = Math.max(0, inhoud[wat] - n);
    if (inhoud[wat] < 1e-9) inhoud[wat] = 0;
    // Is de kelder leeg, dan is wat er in de herberg verteld werd niet meer waar.
    if (!T.inhoudTekst(inhoud)) {
      delete g.verteld;
      delete g.verteldDoor;
    }
    T.wijzigVoorraad(D, wat, n);
    return k;
  };

  // Wat de muis op een gebouw met een plek zegt, en of een klik het venster opent (js/verkennen.js):
  // { tekst, kan, reden }.
  T.verstopHandeling = function (D, p) {
    const inhoud = T.inhoudTekst(inhoudVan(p.gebouw));
    const erin = inhoud ? ` · er ligt ${inhoud}` : '';
    if (p.weigert && !inhoud) {
      return { tekst: `${hoofdletter(p.naam)}: ${p.bewoner.naam} wil er niets van weten`, kan: false, reden: T.overKelderTekst(p) };
    }
    const stil = nietNu(D);
    if (stil) return { tekst: `${hoofdletter(p.naam)}: niet zolang ${wieIsEr(D)} in het dorp is${erin}`, kan: false, reden: stil };
    const kar = VI().karakters && p.karakter && T.KARAKTERS && T.KARAKTERS[p.karakter] ? ` (${T.KARAKTERS[p.karakter].kort})` : '';
    return { tekst: `Verstoppen in ${p.naam}${kar}${erin}`, kan: true };
  };

  // Waar de schout gaat staan om bij een gebouw te komen: een tegel aan de rand van zijn voet die
  // aan een begaanbare tegel grenst waar hij kan komen (T.kanErKomen, js/wereld.js), zo dicht mogelijk
  // bij hem. T.loopNaast loopt dan tot naast die tegel. Tot 3 okt telde ook een kant die aan een
  // ingesloten hoekje grenst (een ander eiland): lag die het dichtst bij, dan zei de klik "Daar kun je
  // niet bij", terwijl de deur openlag (de speeltest van vraag 94). Kan hij nergens komen, dan de
  // dichtste, en zegt de klik dat. Null als er geen is.
  T.randVanGebouw = function (D, g) {
    const w = D.wereld;
    const v = T.voetVanGebouw(g);
    const binnen = (x, y) => x >= v.x && x < v.x + v.b && y >= v.y && y < v.y + v.h;
    const van = D.schout ? { x: D.schout.tx != null ? D.schout.tx : Math.round(D.schout.x), y: D.schout.ty != null ? D.schout.ty : Math.round(D.schout.y) } : { x: v.x, y: v.y };
    let beste = null;
    let bij = Infinity;
    let dichtste = null;
    let dichtsteBij = Infinity;
    for (let y = v.y; y < v.y + v.h; y++) {
      for (let x = v.x; x < v.x + v.b; x++) {
        const buren = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: x + dx, y: y + dy })).filter((t) => !binnen(t.x, t.y) && T.isBegaanbaar(w, t.x, t.y));
        if (!buren.length) continue;
        const a = Math.hypot(x - van.x, y - van.y);
        if (a < dichtsteBij) {
          dichtsteBij = a;
          dichtste = { x, y };
        }
        if (a < bij && buren.some((t) => T.kanErKomen(w, van, t))) {
          bij = a;
          beste = { x, y };
        }
      }
    }
    return beste || dichtste;
  };

  // ---------------------------------------------------------------------------------------------
  // De soldaten zoeken (js/inner.js, T.doorzoekDorp, op Sint-Maarten)
  // ---------------------------------------------------------------------------------------------

  // Een getal 0..1, vast per spel, per dag en per plek (zoals de inner het doet), zodat een toets
  // hetzelfde uitkomt.
  function lot(D, g) {
    const zaad = ((D.lot && D.lot.zaad) || 1) + dagNu(D) * 7919 + g.x * 104729 + g.y * 1299709;
    const x = Math.sin(zaad) * 10000;
    return x - Math.floor(x);
  }

  // Eén plek doorzoeken (p van T.verstopPlekVan): onder de kans van de plek vinden ze wat er ligt, en
  // dat is weg; elke vondst maakt argwanend. Geeft wat ze vonden als tekst ("20 graan in de kelder van
  // Klaas"), of null. `r` (voor een toets) is een getal 0..1 in plaats van het lot. Voor het hele dorp
  // (T.zoekVerstopt) en voor de soldaten die met de schout meelopen (js/doorzoeken.js).
  // Smeedt iemand er stiekem wapens (g.stiekem, js/ondernemers.js), dan vinden ze die ook, en straft de heer.
  T.zoekOpPlek = function (D, p, r) {
    const g = p.gebouw;
    const tekst = T.inhoudTekst(inhoudVan(g));
    if (!tekst && !g.stiekem) return null;
    if ((r != null ? r : lot(D, g)) >= p.vinden) return null;
    const delen = [];
    if (tekst) {
      g.verstopt = { graan: 0, goud: 0 };
      delete g.verteld;
      delete g.verteldDoor;
      if (VI().argwaanPerVondst > 0 && T.zetArgwaan) T.zetArgwaan(D, VI().argwaanPerVondst, 'de soldaten vonden wat je verstopte');
      delen.push(`${tekst} in ${p.naam}`);
      // Twee bazen (js/bazen.js; werklijst vraag 106, c): betrapt. De laatste waarschuwing, of meteen weg.
      T.betrapt(D);
    }
    if (g.stiekem) delen.push(T.verbodenGevonden(D, g));
    if (T.ui && T.ui.toonVoorraad) T.ui.toonVoorraad(D);
    return delen.join(', en ');
  };

  // Het hele dorp, plek voor plek. Geeft wat ze vonden. `getal` (voor een toets) geeft per plek een getal
  // 0..1 in plaats van het lot.
  T.zoekVerstopt = function (D, getal) {
    const gevonden = [];
    for (const p of T.verstopPlekken(D)) {
      const t = T.zoekOpPlek(D, p, getal ? getal(p) : null);
      if (t) gevonden.push(t);
    }
    return gevonden;
  };
})(globalThis.Spel = globalThis.Spel || {});
