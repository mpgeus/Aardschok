// De soldaten doorzoeken het dorp (werklijst punt 4, stuk 1; vraag 41; ontwerp/spel.md, "Rijk worden en
// arm lijken: de inner", deel 1b). Marcel (25 sep): "Ja ook onder de 40% anders is dit altijd veilig.
// Soldaten laten zoeken op 2 of 3 plekken is een goed idee. En als ze er vlak langs lopen. Misschien kun
// je zelf de route bepalen, maar soms wil de heer zelf kiezen. Het risico is dan dat ze iets vinden."
//
// Op Sint-Maarten, als de heer op het plein staat (js/heer.js, T.heerStaatErOp):
//   - is zijn argwaan hoog genoeg (INNER_INSTELLINGEN.doorzoekenVanaf), dan doorzoeken ze het hele dorp
//     in één keer, zoals altijd (T.doorzoekDorp, js/inner.js);
//   - anders zoeken ze op twee of drie plekken (T.beginDoorzoeken). De schout loopt voor, de soldaten lopen
//     met hem mee (T.loopNaastDeSchout, zoals de inner), en doorzoeken elke plek die hij of zij vlak
//     passeren terwijl ze bij hem zijn: zijn route (Marcel, vraag 41, A). Leidt hij ze niet genoeg langs, dan kiezen ze na een
//     paar uur zelf, zijn eigen kelder eerst. Zo vaak als de argwaan van de heer kiest hij zelf, en dan
//     wat het rijkst oogt (B). Wie ze langs lege plekken leidt, is ze kwijt voor ze iets vinden.
// Wat ze vinden, is weg (T.zoekOpPlek, js/verstoppen.js). Zolang de heer er is, sjouw je niets
// (T.kanVerstoppen), dus leeghalen als ze er al zijn, kan niet. Gaat de heer weg voor ze klaar zijn,
// dan doorzoeken ze de rest nog voor ze gaan.
(function (T) {
  'use strict';

  T.DOORZOEKEN_INSTELLINGEN = {
    // Op hoeveel plekken ze zoeken, van minst tot meest: het lot kiest.
    minst: 2,
    meest: 3,
    // Hoe dicht de schout of een soldaat langs een gebouw moet lopen om het te doorzoeken, in tegels van
    // zijn rand.
    vlakLangs: 2,
    // Hoe dicht hij bij de schout moet zijn: alleen dan telt een plek die hij passeert als de route van
    // de schout (onderweg naar hem toe niet).
    bijDeSchout: 3,
    // Zoveel uur (op de klok van het spel) lopen ze met de schout mee, vanaf dat ze bij hem zijn; daarna
    // kiezen ze zelf. Komen ze niet bij hem, dan na twee keer zo lang na het begin.
    wachtUren: 2,
  };
  const IN = () => T.DOORZOEKEN_INSTELLINGEN;

  function bericht(tekst, soort) {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  }
  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || '');
  const GETAL = ['geen', 'één', 'twee', 'drie', 'vier', 'vijf'];
  const uurNu = (D) => (D.kalender ? D.kalender.dag * 24 : 0);

  // Een getal 0..1, vast per spel, per dag en per vraag (`n`), zodat een toets hetzelfde uitkomt.
  function lot(D, n) {
    const dag = D.kalender ? Math.floor(D.kalender.dag) : 0;
    return T.dobbelsteen(((D.lot && D.lot.zaad) || 1) * 31 + dag * 7919 + n)();
  }

  // Hoe ver een tegel van de rand van een gebouw ligt, in tegels (0: erop).
  function afstandTot(g, x, y) {
    const v = T.voetVanGebouw(g);
    const dx = Math.max(v.x - x, 0, x - (v.x + v.b - 1));
    const dy = Math.max(v.y - y, 0, y - (v.y + v.h - 1));
    return Math.max(dx, dy);
  }

  // De plekken in de volgorde waarin de soldaten ze zelf kiezen, of de heer: de kelder van de schout
  // eerst, dan wat het rijkst oogt (het grootste gebouw), en de kapel als laatste (gewijde grond). Zonder
  // de plekken die al gedaan zijn.
  function volgorde(D, gedaan) {
    const waarde = (p) => {
      if (p.vanSchout) return Infinity;
      if (p.gebouw.soort === 'kapel') return -1;
      const v = T.voetVanGebouw(p.gebouw);
      return v.b * v.h;
    };
    return T.verstopPlekken(D).filter((p) => !gedaan.includes(p.gebouw)).sort((a, b) => waarde(b) - waarde(a));
  }

  const soldatenVan = (b) => (b.wezens || []).filter((e) => e.wie === 'soldaat');

  // De heer staat op het plein, en zijn argwaan is niet hoog genoeg voor het hele dorp: zijn soldaten
  // zoeken op twee of drie plekken. Geeft wat ze gaan doen (S.heer.bezoek.zoeken), of null.
  T.beginDoorzoeken = function (D) {
    const b = D.heer && D.heer.bezoek;
    if (!b || b.zoeken) return null;
    const I = IN();
    const plekken = T.verstopPlekken(D);
    const nodig = Math.min(plekken.length, I.minst + Math.floor(lot(D, 1) * (I.meest - I.minst + 1)));
    const argwaan = (D.inner && D.inner.argwaan) || 0;
    const heerKiest = lot(D, 2) < argwaan;
    const z = { nodig, gedaan: [], gevonden: [], begin: uurNu(D), sinds: null, heerKiest, zelf: false, klaar: nodig === 0 };
    b.zoeken = z;
    if (z.klaar) return z;
    if (heerKiest) {
      z.doelen = volgorde(D, []).slice(0, nodig).map((p) => p.gebouw);
      const namen = z.doelen.map((g) => T.verstopPlekVan(D, g).naam);
      bericht(`De heer wijst zelf aan waar zijn soldaten zoeken: ${opsomming(namen)}.`, 'gevaar');
    } else {
      bericht(`De heer laat het dorp doorzoeken, op ${GETAL[nodig] || nodig} plekken. Zijn soldaten lopen met je mee: waar je ze vlak langs leidt, zoeken ze.`, 'gevaar');
    }
    return z;
  };

  // Eén plek doorzoeken, en zeggen wat het werd.
  function doorzoek(D, z, p) {
    z.gedaan.push(p.gebouw);
    const lag = T.inhoudTekst(p.gebouw.verstopt || { graan: 0, goud: 0 });
    const vond = T.zoekOpPlek(D, p);
    if (vond) z.gevonden.push(vond);
    if (vond) bericht(`De soldaten doorzoeken ${p.naam}, en vinden ${lag}. Dat is weg.`, 'gevaar');
    else bericht(`De soldaten doorzoeken ${p.naam}, en vinden niets.`);
  }

  // Klaar: de soldaten gaan terug naar de heer, op hun eigen maat.
  function klaar(D, z, soldaten, heer) {
    z.klaar = true;
    soldaten.forEach((s, i) => {
      s.dwaalt = true;
      s.loopMee = false;
      s.pad = s.onderweg && s.pad[0] ? [s.pad[0]] : [];
      s.snelheid = (T.MENSEN && T.MENSEN.soldaat && T.MENSEN.soldaat.snelheid) || s.snelheid;
      if (heer) s.thuis = { x: heer.tx + (i ? 1 : -1), y: heer.ty + 1 };
    });
  }

  // Elk beeld (js/main.js, werkBij): de soldaten lopen mee of naar hun doel, en doorzoeken wat ze vlak
  // passeren.
  T.werkDoorzoekenBij = function (D) {
    const b = D.heer && D.heer.bezoek;
    const z = b && b.zoeken;
    if (!z || z.klaar) return;
    const soldaten = soldatenVan(b);
    const heer = b.wezens && b.wezens[0];
    // Gaat de heer weg voor ze klaar zijn (hij is betaald, of neemt het zelf), dan doorzoeken ze de rest
    // nog voor ze gaan, in hun eigen volgorde.
    if (b.weg || !soldaten.length) {
      const rest = volgorde(D, z.gedaan).slice(0, z.nodig - z.gedaan.length);
      if (rest.length) bericht(`Voor ze gaan, doorzoeken de soldaten nog ${opsomming(rest.map((p) => p.naam))}.`, 'gevaar');
      for (const p of rest) doorzoek(D, z, p);
      klaar(D, z, soldaten, null);
      return;
    }
    const h = D.schout;
    // Wat ze vlak passeren: een doel als ze er een hebben, anders de route van de schout, zolang ze bij hem
    // zijn (wat hij of zij vlak passeren).
    for (const s of soldaten) {
      // Is de schout op reis (js/land.js), dan is hij bij niemand: ze wachten tot de heer gaat, en zoeken dan zelf.
      const bijHem = !T.schoutIsWeg(D) && T.afstand({ x: h.tx, y: h.ty }, { x: s.tx, y: s.ty }) <= IN().bijDeSchout;
      if (bijHem && z.sinds == null) z.sinds = uurNu(D); // vanaf nu telt het wachten
      for (const p of T.verstopPlekken(D)) {
        if (z.gedaan.includes(p.gebouw)) continue;
        const vlak = z.doelen
          ? z.doelen.includes(p.gebouw) && afstandTot(p.gebouw, s.tx, s.ty) <= IN().vlakLangs
          : bijHem && Math.min(afstandTot(p.gebouw, s.tx, s.ty), afstandTot(p.gebouw, h.tx, h.ty)) <= IN().vlakLangs;
        if (!vlak) continue;
        doorzoek(D, z, p);
        if (z.gedaan.length >= z.nodig) {
          bericht('De soldaten zijn klaar met zoeken, en gaan terug naar de heer.');
          klaar(D, z, soldaten, heer);
          return;
        }
      }
    }
    // Te lang gewacht: ze kiezen zelf, de kelder van de schout eerst.
    const gewacht = z.sinds != null ? uurNu(D) - z.sinds >= IN().wachtUren : uurNu(D) - z.begin >= 2 * IN().wachtUren;
    if (!z.doelen && gewacht) {
      z.doelen = volgorde(D, z.gedaan).slice(0, z.nodig - z.gedaan.length).map((p) => p.gebouw);
      z.zelf = true;
      bericht(`De soldaten wachten niet langer, en zoeken zelf: ${opsomming(z.doelen.map((g) => T.verstopPlekVan(D, g).naam))}.`, 'gevaar');
    }
    // Lopen: naar hun doel, of met de schout mee, en houden zijn pas bij.
    for (const s of soldaten) {
      s.dwaalt = false;
      if (s.onderweg) continue;
      if (z.doelen) {
        const doel = z.doelen.find((g) => !z.gedaan.includes(g));
        if (!doel) continue;
        if (s.pad.length) continue;
        const deur = T.deurVan(D.wereld, doel);
        // Niet te bereiken: dan slaan ze die over, en nemen ze de volgende in hun volgorde.
        if (!T.loopNaarBij(D, s, deur.x, deur.y, 0)) {
          z.doelen = z.doelen.filter((g) => g !== doel);
          const volgende = volgorde(D, z.gedaan.concat(z.doelen, [doel]))[0];
          if (volgende) z.doelen.push(volgende.gebouw);
        }
      } else {
        const eigen = (T.MENSEN && T.MENSEN.soldaat && T.MENSEN.soldaat.snelheid) || s.snelheid;
        s.snelheid = Math.max(eigen, T.snelheidVan(h));
        T.loopNaastDeSchout(D, s, !s.loopMee);
        s.loopMee = true;
      }
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
