// Een gebouw in aanbouw: wie eraan werkt, hoe ver het is, en het hoogste punt. Marcel koos op
// 24 sep 2026 (ontwerp/spel.md, "Bouwen kost handen"; ontwerp/beeld.md, "Bouwen: een huis dat
// groeit") dat een gebouw niet meer vanzelf af is als de dagen om zijn:
//
//   - de bouwers komen uit de bevolking, vóór de werkplaatsen: wie bouwt, hakt geen hout;
//   - met een halve ploeg gaat het half zo snel, zonder ploeg ligt het stil;
//   - in de vorst (de wintermaanden) ligt het werk stil;
//   - op het hoogste punt (het dakgebinte staat: fase 3 van de vijf in tegels/bouwfasen.json, met
//     de meiboom op de nok) willen de bouwers pannenbier. Wie het geeft, heeft een tijdje een
//     tevredener dorp; wie niets geeft, een ploeg die mopperend trager werkt tot het af is.
//
// Hoe ver een gebouw is, staat in `voortgang` (0..1) op zijn ingang in S.gebouwen, en ook op zijn
// voorwerp (js/tekenen.js kiest daarmee de bouwfase). De fout van vóór 24 sep, dat een gebouw dat
// laat op de dag werd neergezet fases oversloeg, kan zo niet meer: de voortgang komt uit gedaan
// werk, niet uit de klok.
//
// De regels hebben geen scherm en zijn dus te toetsen (test/bouwen.test.cjs). T.tikGebouwenDag
// (js/gebouwen.js) roept T.tikBouwDag één keer per dag aan. Wat er op het scherm gebeurt, hangt er
// zacht aan: de bouwers als poppetjes (T.werkBouwersBij, elk beeld vanuit js/main.js) en de vraag
// om pannenbier (T.ui.vraag, js/hud.js).
(function (T) {
  'use strict';

  // Getallen om bij te stellen, in één blok (CLAUDE.md). Een eerste gok: nog niet gespeeld.
  T.BOUWEN_INSTELLINGEN = {
    vorst: true, // in de wintermaanden (T.MAANDEN, seizoen "winter") ligt het werk stil
    hoogstePunt: 0.6, // de voortgang waarop het dakgebinte staat: het begin van fase 3 van de vijf
    pannenbierPerBouwer: 1, // bier per bouwer; is er niet genoeg bier, dan een goudstuk per bouwer
    pannenbierWacht: 5, // zo veel dagen wachten de bouwers op antwoord (op 1× ruim tien seconden,
    // de klok staat stil bij pauze); daarna telt het als "niets"
    feestBonus: 0.1, // zoveel tevredenheid erbij na het pannenbier (js/behoeften.js) ...
    feestDagen: 10, // ... zo veel dagen lang
    mopperTempo: 0.75, // zonder pannenbier werkt de ploeg zo veel trager, tot het gebouw af is
    zichtbaar: 3, // hoogstens zo veel bouwers per bouwplaats als poppetje (T.werkBouwersBij)
    slag: 0.55, // waar in de houding 'timmeren' (0..1) de hamer raakt (beeld 5 van 9): dan vliegen de spaanders
  };

  const bericht = (tekst, soort) => {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  };

  // Hoe groot de ploeg is die een soort vraagt: `bouwers` als de soort het zelf zegt, anders naar
  // zijn grootte. De geschatte voet uit T.GEBOUWEN, niet de tekening: een hut leent een tekening van
  // vijf bij zeven, maar het is een hut. Een kippenhok bouwt één man, een hut twee, een huis drie.
  T.ploegVan = function (soort) {
    const g = T.GEBOUWEN[soort];
    if (!g) return 1;
    if (g.bouwers > 0) return g.bouwers;
    const opp = g.voet ? g.voet.b * g.voet.h : 9;
    return opp <= 4 ? 1 : opp <= 16 ? 2 : 3;
  };

  // Heeft deze soort een hoogste punt, een nok waar een meiboom op kan en een ploeg die er een
  // rondje voor verwacht? Wat een tekening uit tegels/gebouwen.tsx leent en met meer dan één man
  // gebouwd wordt. Een moestuin, een put of een schuurtje van het erf niet, en een kippenhok ook
  // niet: pannenbier voor een kippenhok is iets voor een ander spel.
  T.heeftHoogstePunt = function (soort) {
    const g = T.GEBOUWEN[soort];
    return !!(g && g.tekening && g.tekening.startsWith('gebouwen/') && T.ploegVan(soort) >= 2);
  };

  // Welke bouwfase een gebouw met deze voortgang toont. Elk type bouwt op zijn eigen manier
  // (ontwerp/beeld.md, "Bouwen: een huis dat groeit"): zoveel fases als het werk vraagt, en elke
  // fase zo lang als het werk duurt. Die lijst staat bij de tekening in tegels/bouwfasen.json
  // (`fasen`, elk met `vanaf`: de voortgang waarop hij begint). Zonder `vanaf` zijn het gelijke
  // stukken, en zonder lijst vijf gelijke stukken (het oude vel). Daarna is hij af, en tekent
  // js/tekenen.js de gewone tekening.
  T.AANTAL_BOUWFASEN = 5;
  T.bouwFaseIndex = function (voortgang, fasen) {
    const v = Number.isFinite(voortgang) ? voortgang : 0;
    if (fasen && fasen.length && fasen.every((f) => Number.isFinite(f.vanaf))) {
      let i = 0;
      while (i + 1 < fasen.length && fasen[i + 1].vanaf <= v) i++;
      return i;
    }
    const n = fasen && fasen.length ? fasen.length : T.AANTAL_BOUWFASEN;
    return Math.max(0, Math.min(n - 1, Math.floor(v * n)));
  };

  // De fases van een tekening ("dorpshuis1"), als ze er zijn (tegels/bouwfasen.js is in het spel
  // geladen, niet in de toetsen die er niet om vragen).
  T.fasenVan = function (tekeningNaam) {
    const g = tekeningNaam && T.BOUWFASEN && T.BOUWFASEN.fasen && T.BOUWFASEN.fasen[tekeningNaam];
    return g && g.fasen && g.fasen.length ? g.fasen : null;
  };

  // Bij welke voortgang de kap staat en de meiboom op de nok gaat: de fase die bij de tekening als
  // `hoogstePunt` staat, anders T.BOUWEN_INSTELLINGEN.hoogstePunt.
  T.hoogstePuntVan = function (soort) {
    const g = T.GEBOUWEN[soort];
    const naam = g && g.tekening ? g.tekening.split('/').pop() : null;
    const lijst = T.fasenVan(naam);
    const i = lijst && T.BOUWFASEN.fasen[naam].hoogstePunt;
    if (lijst && Number.isInteger(i) && lijst[i]) return Number.isFinite(lijst[i].vanaf) ? lijst[i].vanaf : i / lijst.length;
    return T.BOUWEN_INSTELLINGEN.hoogstePunt;
  };

  // Vriest het op deze dag? Zacht gekoppeld aan js/tijd.js: zonder kalender (een toets die alleen
  // de gebouwen laadt) vriest het nooit.
  T.vriestHet = function (dag) {
    if (!T.BOUWEN_INSTELLINGEN.vorst || !T.datumVanDag) return false;
    return T.datumVanDag(dag).seizoen === 'winter';
  };

  const vandaag = (S) => (S.kalender ? Math.floor(S.kalender.dag) : S.gebouwenDag || 0);

  // Hoe snel deze ploeg vandaag werkt, los van hoe groot hij is: de tevredenheid (T.werkFactor,
  // js/gebouwen.js, dezelfde als voor de werkplaatsen) en het mopperen.
  function tempoVan(S, b) {
    const f = T.werkFactor ? T.werkFactor(S) : 1;
    return b.pannenbier === 'niets' ? f * T.BOUWEN_INSTELLINGEN.mopperTempo : f;
  }

  // Hoeveel van het werk (0..1) er per dag af komt met `bouwers` man.
  function perDag(S, b, bouwers) {
    const soort = T.GEBOUWEN[b.soort];
    const duur = soort.bouwtijd > 0 ? soort.bouwtijd : 1;
    return ((bouwers / T.ploegVan(b.soort)) * tempoVan(S, b)) / duur;
  }

  function maakAf(S, b) {
    b.klaar = true;
    b.voortgang = 1;
    b.bouwers = 0;
    if (b.voorwerp) {
      b.voorwerp.inAanbouw = false;
      b.voorwerp.voortgang = 1;
    }
    // Is hij af voordat iemand op het pannenbier antwoordde, dan is de vraag voorbij.
    if (b.pannenbier === 'gevraagd') {
      b.pannenbier = null;
      if (T.ui && T.ui.sluitVraag) T.ui.sluitVraag(b);
    }
    bericht(`${T.hoofdletter(T.GEBOUWEN[b.soort].naam)} is af.`, 'goed');
  }

  // Eén dag bouwen, op volgorde van neerzetten. `vrij`: hoeveel mensen er vandaag zijn. Geeft terug
  // hoeveel er gebouwd hebben; T.tikGebouwenDag trekt die af voordat de werkplaatsen hun handen
  // krijgen.
  T.tikBouwDag = function (S, dag, vrij) {
    const IN = T.BOUWEN_INSTELLINGEN;
    const vorst = T.vriestHet(dag);
    let aanHetWerk = 0;
    let stilGelegd = 0;
    for (const b of S.gebouwen || []) {
      if (b.klaar) continue;
      if (b.voortgang == null) b.voortgang = 0;
      // Wachtten ze lang genoeg op pannenbier, dan komt er niets meer.
      if (b.pannenbier === 'gevraagd' && dag >= b.pannenbierTot) {
        b.pannenbier = 'niets';
        if (T.ui && T.ui.sluitVraag) T.ui.sluitVraag(b);
        bericht('De bouwers wachtten vergeefs op pannenbier. Ze mopperen, en werken trager tot het af is.', 'gevaar');
      }
      const was = b.bouwers || 0;
      b.bouwers = vorst ? 0 : Math.max(0, Math.min(T.ploegVan(b.soort), vrij - aanHetWerk));
      aanHetWerk += b.bouwers;
      if (!b.bouwers) {
        if (was && vorst) stilGelegd++;
        else if (!vorst && !b.stilGemeld) {
          b.stilGemeld = true;
          bericht(`${T.hoofdletter(T.GEBOUWEN[b.soort].naam)}: niemand is vrij om te bouwen, het werk ligt stil.`, 'gevaar');
        }
        continue;
      }
      b.stilGemeld = false;
      const voor = b.voortgang;
      b.voortgang = Math.min(1, voor + perDag(S, b, b.bouwers));
      if (b.voorwerp) b.voorwerp.voortgang = b.voortgang;
      // (Twaalf keer een twaalfde is in drijvende komma net geen 1; vandaar de marge.)
      if (b.voortgang >= 1 - 1e-9) {
        maakAf(S, b);
        continue;
      }
      const hoogste = T.hoogstePuntVan(b.soort);
      if (voor < hoogste && b.voortgang >= hoogste && !b.pannenbier && T.heeftHoogstePunt(b.soort)) {
        b.pannenbier = 'gevraagd';
        b.pannenbierTot = dag + IN.pannenbierWacht;
        if (T.vraagPannenbier) T.vraagPannenbier(S, b);
      }
    }
    if (stilGelegd) bericht('Het vriest: het bouwen ligt stil tot het dooit.', 'rust');
    return aanHetWerk;
  };

  // ---------------------------------------------------------------------------------------------
  // Het hoogste punt: pannenbier
  // ---------------------------------------------------------------------------------------------

  // Wat het pannenbier kost: bier als dat er genoeg is, anders goud voor een rondje. null als geen
  // van beide toereikt.
  T.pannenbierPrijs = function (S, b) {
    const n = T.ploegVan(b.soort) * T.BOUWEN_INSTELLINGEN.pannenbierPerBouwer;
    const v = S.voorraad || {};
    if ((v.bier || 0) >= n) return { bier: n };
    if ((v.goud || 0) >= n) return { goud: n };
    return null;
  };

  // Het antwoord op de vraag (T.ui.vraag, of een toets): geven (true) of niets (false). Geeft
  // { gelukt, reden } terug, zoals T.plaatsGebouw.
  T.schenkPannenbier = function (S, b, geven) {
    const IN = T.BOUWEN_INSTELLINGEN;
    if (b.pannenbier !== 'gevraagd') return { gelukt: false, reden: 'Daar valt niets meer te schenken.' };
    if (!geven) {
      b.pannenbier = 'niets';
      bericht('Geen pannenbier. De bouwers mopperen, en werken trager tot het af is.', 'gevaar');
      return { gelukt: true };
    }
    const prijs = T.pannenbierPrijs(S, b);
    if (!prijs) return { gelukt: false, reden: 'Er is geen bier, en geen goud voor een rondje.' };
    T.betaalKosten(S, prijs);
    b.pannenbier = 'gegeven';
    // Het dorp drinkt mee: een tijdje tevredener (T.berekenTevredenheid, js/behoeften.js). Een
    // tweede feest vlak na het eerste verlengt het, maar telt niet dubbel.
    S.feest = { tot: vandaag(S) + IN.feestDagen, bonus: IN.feestBonus };
    bericht('Pannenbier! De bouwers drinken op het nieuwe dak, en het dorp drinkt mee.', 'goed');
    return { gelukt: true };
  };

  // De vraag op het scherm (js/hud.js, T.ui.vraag). Knoppen en prijs worden bij elk tekenen opnieuw
  // gevraagd, zodat ze kloppen als de voorraad intussen verandert.
  T.vraagPannenbier = function (S, b) {
    if (!T.ui || !T.ui.vraag) return;
    const prijsTekst = () => {
      const p = T.pannenbierPrijs(S, b);
      return p ? Object.entries(p).map(([wat, n]) => `${n} ${wat}`).join(', ') : null;
    };
    T.ui.vraag({
      sleutel: b,
      kop: `Het hoogste punt: ${T.GEBOUWEN[b.soort].naam}`,
      tekst: 'De meiboom staat op de nok, en de bouwers kijken je aan. Pannenbier?',
      keuzes: [
        {
          tekst: () => (prijsTekst() ? `Schenk pannenbier (${prijsTekst()})` : 'Schenk pannenbier'),
          kan: () => !!T.pannenbierPrijs(S, b),
          waarom: 'Er is geen bier, en geen goud voor een rondje.',
          doe: () => T.schenkPannenbier(S, b, true),
        },
        { tekst: 'Niets', doe: () => T.schenkPannenbier(S, b, false) },
      ],
    });
  };

  // ---------------------------------------------------------------------------------------------
  // Wat de speler ziet: de stand bij de muis, en de bouwers als poppetjes
  // ---------------------------------------------------------------------------------------------

  // Hoe het met een bouwplaats staat, als tekst bij de muis (js/verkennen.js): hoe ver, met hoeveel,
  // hoe lang nog, en waarom het stilligt.
  T.bouwStand = function (S, b) {
    const soort = T.GEBOUWEN[b.soort];
    const ploeg = T.ploegVan(b.soort);
    const pct = Math.floor((b.voortgang || 0) * 100);
    const vorst = T.vriestHet(vandaag(S));
    const tempo = b.bouwers ? perDag(S, b, b.bouwers) : 0;
    const nog = tempo > 0 ? Math.ceil((1 - (b.voortgang || 0)) / tempo) : null;
    const delen = [`${T.hoofdletter(soort.naam)} in aanbouw: ${pct}%`, `${b.bouwers || 0} van ${ploeg} bouwer${ploeg === 1 ? '' : 's'}`];
    if (vorst) delen.push('het vriest');
    else if (!b.bouwers) delen.push('niemand is vrij');
    else if (nog) delen.push(`nog ${nog} dag${nog === 1 ? '' : 'en'}`);
    if (b.pannenbier === 'niets') delen.push('ze mopperen');
    return { pct, bouwers: b.bouwers || 0, ploeg, nogDagen: nog, vorst, tekst: delen.join(' · ') };
  };

  // Het gebouw in aanbouw waar tegel (x, y) onder valt, of null.
  T.bouwplaatsOp = function (S, x, y) {
    for (const b of S.gebouwen || []) {
      if (b.klaar) continue;
      const voet = T.gebouwVoet(b.soort) || { b: 1, h: 1 };
      if (x >= b.x && x < b.x + voet.b && y >= b.y && y < b.y + voet.h) return b;
    }
    return null;
  };

  // De rand om een voet: de tegels waar een bouwer kan staan, de voorkant eerst (daar zie je hem:
  // +x en +y liggen op het scherm vooraan, CLAUDE.md "Opbouw", js/iso.js).
  function randTegels(w, b, voet) {
    const uit = [];
    for (let x = b.x - 1; x <= b.x + voet.b; x++) uit.push({ x, y: b.y - 1 }, { x, y: b.y + voet.h });
    for (let y = b.y; y < b.y + voet.h; y++) uit.push({ x: b.x - 1, y }, { x: b.x + voet.b, y });
    return uit
      .filter((t) => T.isBegaanbaar(w, t.x, t.y, { wezensBlokkeren: true }))
      .sort((p, q) => q.x - b.x + (q.y - b.y) - (p.x - b.x + (p.y - b.y)));
  }

  function zetBouwerNeer(S, b, i) {
    const w = S.wereld;
    const voet = T.gebouwVoet(b.soort) || { b: 1, h: 1 };
    const rand = randTegels(w, b, voet);
    if (!rand.length) return null;
    // Uit elkaar: de i-de bouwer op zijn eigen stuk van de voorkant.
    const t = rand[Math.floor((i * rand.length) / (2 * T.BOUWEN_INSTELLINGEN.zichtbaar)) % rand.length];
    const straal = Math.floor(Math.max(voet.b, voet.h) / 2) + 1;
    // Een gewone dorpeling (T.maakDorpeling, js/mensen.js) met zijn eigen vel als dat er is
    // (js/sprites.js valt anders terug op het vel van zijn zaad), die om het midden van de voet
    // dwaalt (T.laatDwalen, js/verkennen.js) en timmert als hij ernaast stilstaat (T.naarBouwplaats).
    const e = T.maakDorpeling(1000 + ((b.x * 31 + b.y * 17 + i * 7) % 97), t.x, t.y, straal);
    e.soort = 'bouwer';
    e.naam = 'de bouwer';
    e.thuis = { x: b.x + (voet.b - 1) / 2, y: b.y + (voet.h - 1) / 2 };
    // Alleen gewone getallen, geen verwijzing terug naar de bouwplaats: een wezen moet later zonder
    // kringen op te slaan zijn.
    e.bouwVoet = { x: b.x, y: b.y, b: voet.b, h: voet.h };
    w.wezens.push(e);
    return e;
  }

  function haalWeg(w, e) {
    const i = w.wezens.indexOf(e);
    if (i >= 0) w.wezens.splice(i, 1);
  }

  // Zoveel bouwers als er vandaag aan een gebouw werken (hoogstens `zichtbaar`), als poppetje op de
  // bouwplaats. Elk beeld aangeroepen, maar het aantal verandert alleen als er een dag voorbij is,
  // dus meestal is er niets te doen. Gebouwen die al op de kaart stonden, hebben geen voorwerp en
  // dus ook geen bouwplaats.
  T.werkBouwersBij = function (S) {
    const w = S.wereld;
    if (!w || !w.wezens || !S.gebouwen) return;
    for (const b of S.gebouwen) {
      // Alleen in de wereld waar de bouwplaats ligt: loopt de schout een ander gebied in, dan
      // verschijnen de bouwers daar niet op dezelfde plek. Die van hier blijven in hun eigen wereld
      // staan, en zijn er weer als hij terugkomt.
      if (!b.voorwerp || !w.voorwerpen.includes(b.voorwerp)) continue;
      const poppen = b.poppen || (b.poppen = []);
      const wil = b.klaar ? 0 : Math.min(b.bouwers || 0, T.BOUWEN_INSTELLINGEN.zichtbaar);
      while (poppen.length > wil) haalWeg(w, poppen.pop());
      while (poppen.length < wil) {
        const e = zetBouwerNeer(S, b, poppen.length);
        if (!e) break;
        poppen.push(e);
      }
    }
    spaanders(S);
  };

  // Bij elke slag van de hamer een handvol spaanders tegen de muur (js/tekenen.js tekent ze). Alleen
  // als de bouwer zijn eigen vel met de houding 'timmeren' heeft (zonder hamer in de hand zouden ze
  // uit het niets komen), en alleen aan de voorkant van het gebouw, waar je het ziet: een bouwer
  // achter het huis is zelf ook niet te zien. De fase is dezelfde som als in js/sprites.js.
  function spaanders(S) {
    const Sp = T.sprites;
    if (!S.effecten || !Sp || !Sp.heeftHouding || !Sp.heeftHouding('bouwer', 'timmeren')) return;
    const duur = Sp.houdingDuur('bouwer', 'timmeren');
    const slag = T.BOUWEN_INSTELLINGEN.slag;
    for (const b of S.gebouwen) {
      for (const e of b.poppen || []) {
        const r = e.pad.length ? null : T.naarBouwplaats(e);
        if (!r || r.dx > 0 || r.dy > 0) {
          e.slagFase = null;
          continue;
        }
        const fase = ((S.tijd + e.fase) / duur) % 1;
        const was = e.slagFase;
        e.slagFase = fase;
        if (was == null) continue;
        const raak = fase >= was ? was < slag && fase >= slag : was < slag || fase >= slag;
        if (raak) S.effecten.push({ soort: 'spaanders', x: e.x + r.dx * 0.5, y: e.y + r.dy * 0.5, t: 0, duur: 0.5, zaad: Math.random() });
      }
    }
  }

  // Staat deze bouwer naast zijn bouwplaats? Dan de richting ernaartoe ({ dx, dy }, één stap), zodat
  // js/sprites.js hem met zijn gezicht naar de muur laat timmeren; anders null.
  T.naarBouwplaats = function (e) {
    const v = e.bouwVoet;
    if (!v) return null;
    const x = Math.max(v.x, Math.min(v.x + v.b - 1, e.tx));
    const y = Math.max(v.y, Math.min(v.y + v.h - 1, e.ty));
    const dx = x - e.tx;
    const dy = y - e.ty;
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== 1) return null;
    return { dx, dy };
  };
})(globalThis.Toren = globalThis.Toren || {});
