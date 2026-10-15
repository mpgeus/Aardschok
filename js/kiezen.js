// Kijken, kiezen en sturen als een god (werklijst vraag 170, stap 1; Marcel, 15 okt: "we gaan toch als 'god' sturen en
// bouwen. Je speelt dus niet meer de schout zelf"). De camera volgt de schout niet meer (js/main.js), links kies je een
// man, rechts stuur je hem, en een groep onthoud je onder een cijfer. Hier staan de regels zonder scherm, getoetst in
// test/kiezen.test.cjs; het scherm (de muis, het kader, de ring onder de voeten) staat in js/main.js en js/tekenen.js.
//
// Je stuurt alleen je mannen (4a): de held (de schout van je dorp), de soldaten van het wachthuis en de veteranen van de
// heervaart. Een dorpeling werkt vanzelf; een klik op hem geeft zijn briefje. Wat je kiest, is alleen scherm
// (S.gekozen, T.schermVelden in js/opslaan.js): een gebouw (js/gebouwbriefje.js), één wezen, of een lijst van je mannen.
//
// Een bevel is een opdracht (js/tik.js), met de nummers van de mannen (p.id van hun bewoner) en een plek:
//   - erheen (`stuur`): de plek is zijn post (Marcel: "Een post, tot je terugroept"). Daar staat hij van het opstaan tot
//     het slapen; 's nachts slaapt hij thuis, en 's ochtends gaat hij terug (e.post, en T.bevelAnker in js/dag.js). Krijgt
//     hij het bevel 's nachts, dan blijft hij die nacht op zijn post (post.wakker). In stap 4 wordt het zijn dienst.
//   - een vijand aanvallen (`volg`): hij zit hem na tot hij hem raakt, en slaat (e.volgt; het gevecht, js/gevecht.js,
//     zonder leiband). Is de vijand gevallen of weg, dan is waar hij staat zijn post.
//   - terug (`terug`): de post is weg, en hij gaat weer naar zijn wachthuis (of aan het werk).
// De held heeft geen dag om naar terug te gaan: hij blijft waar je hem neerzet.
(function (T) {
  'use strict';

  T.KIEZEN_INSTELLINGEN = {
    camera: {
      rand: 8, // zo dicht bij de rand van het scherm (in pixels) schuift de muis het beeld; 0 zet het uit
      snelheid: 900, // zoveel pixels van het beeld per seconde schuiven de pijltjes en de rand
    },
    vijandBij: 3, // een vijand die je aanwijst, zoekt het bevel binnen zoveel tegels van waar je klikte
    briefjeRegels: 8, // zoveel mannen staan er bij naam op het briefje van meer gekozen mannen
  };
  const IN = () => T.KIEZEN_INSTELLINGEN;

  // ── Wie je kiest ──

  // Is dit een van je mannen in dorp D: de held (de schout), een soldaat of een veteraan die er is en leeft?
  T.isMan = function (D, e) {
    if (!D || !e || e.dood) return false;
    if (e === D.schout) return true;
    const p = e.bewoner;
    return !!p && !!(p.soldaat || p.veteraan) && !p.weg && !p.komt && p.wezen === e;
  };
  // Al je mannen in D, de held eerst.
  T.mannenVan = (D) => [D.schout, ...T.militieVan(D)].filter((e) => T.isMan(D, e));
  // Wie van je mannen nu gekozen is (S.gekozen: één wezen of een lijst; een gebouw telt niet).
  T.gekozenMannen = function (S, D = S.dorp) {
    const g = S.gekozen;
    const lijst = Array.isArray(g) ? g : g && g.tx != null ? [g] : [];
    return lijst.filter((e) => T.isMan(D, e));
  };
  // Van welke soort hij is, voor een dubbelklik (alle van zijn soort) en het briefje: de soort soldaat, een veteraan, of
  // de held.
  T.soortVanMan = (D, e) => (e === D.schout ? 'held' : e.bewoner.soldaat ? e.bewoner.soldaat.soort : 'veteraan');
  const soortTekst = (D, e) => {
    const s = T.soortVanMan(D, e);
    return s === 'held' ? T.t('the reeve') : s === 'veteraan' ? T.t('veteran') : T.soortNaam(s);
  };
  const naamVan = (D, e) => T.hoofdletter(T.naamVanBewoner(T.bewonerVan(D, e)));
  // Wat er bij de muis staat: "Walter · spearman", of "The reeve".
  T.manTekst = (D, e) => (e === D.schout ? naamVan(D, e) : `${naamVan(D, e)} · ${soortTekst(D, e)}`);

  // De nummers van de mannen, voor een opdracht (p.id van hun bewoner), en terug.
  T.nummersVan = (D, mannen) => mannen.map((e) => T.bewonerVan(D, e)).filter(Boolean).map((p) => p.id);
  const mannenMet = (D, wie) =>
    (wie || []).map((id) => D.bewoners.mensen.find((p) => p.id === id)).filter((p) => p && T.isMan(D, p.wezen)).map((p) => p.wezen);

  // ── Wat rechts doet (de muis en de klik vragen hetzelfde, zoals T.handelingVerkennen) ──

  // Is dit een vijand die je kunt aanvallen: een rover, een wolf, een monster?
  const isVijand = (e) => !!e && !e.dood && e.kant === 'monster';
  // Met `mannen` gekozen: wat een rechtsklik op `doel` doet ({ tekst, kan, opdracht, doe }), of null.
  T.handelingSturen = function (S, doel, mannen) {
    if (!doel || !mannen || !mannen.length) return null;
    const D = T.dorpHier(S);
    if (!D || D !== S.dorp) return null;
    const wie = T.nummersVan(D, mannen);
    const geef = (o) => () => T.geefOpdracht(S, o);
    if (doel.wezen && isVijand(doel.wezen)) {
      const e = doel.wezen;
      const opdracht = { soort: 'volg', wie, doel: { x: e.tx, y: e.ty, soort: e.soort } };
      return { tekst: T.t('Attack the {wie}', { wie: e.naam }), kan: true, opdracht, doe: geef(opdracht) };
    }
    const x = doel.wezen ? doel.wezen.tx : doel.x;
    const y = doel.wezen ? doel.wezen.ty : doel.y;
    if (!T.kentTegel(S.wereld, x, y)) return { tekst: T.t('You do not know that land'), kan: false, fout: true };
    const opdracht = { soort: 'stuur', wie, naar: { x, y } };
    const tekst = mannen.length === 1 ? T.t('Send {wie} here', { wie: naamVan(D, mannen[0]) }) : T.t('Send {n} men here', { n: mannen.length });
    return { tekst, kan: true, opdracht, doe: geef(opdracht) };
  };

  // ── De bevelen (T.OPDRACHTEN in js/tik.js) ──

  // De vrije tegels rond `naar`, het dichtst eerst, waar `n` mannen kunnen staan: begaanbaar, en niet in een gebouw.
  // Kan er op `naar` zelf niemand staan (een huis, water), dan de dichtste tegels eromheen.
  function plekkenRond(w, naar, n) {
    const uit = [];
    const gezien = new Set([naar.x + ',' + naar.y]);
    let rand = [naar];
    for (let ring = 0; uit.length < n && rand.length && ring < 12; ring++) {
      const volgende = [];
      for (const t of rand) {
        if (T.opKaart(w, t.x, t.y) && T.isBegaanbaar(w, t.x, t.y)) uit.push(t);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
          const k = t.x + dx + ',' + (t.y + dy);
          if (gezien.has(k)) continue;
          gezien.add(k);
          volgende.push({ x: t.x + dx, y: t.y + dy });
        }
      }
      rand = volgende;
    }
    return uit.slice(0, n);
  }

  // Loop naar `doel` (een tegel, of met `naast` ernaast). Wie binnen is, komt eerst naar buiten (het dwalen, js/verkennen.js,
  // dat hij nu meteen doet); wie midden in een stap is, maakt die af. Geeft of er een weg is.
  function loop(D, e, doel, naast) {
    const w = D.wereld;
    if (e.binnen) {
      e.dwaalTijd = 0;
      return true;
    }
    const pad = T.zoekRoute(w, T.tegelVan(e), doel, { naast, deurenOpenen: e === D.schout });
    if (pad === null) return false;
    T.geefRoute(e, e.onderweg && e.pad[0] ? [e.pad[0], ...pad] : pad, { x: doel.x, y: doel.y, naast });
    return true;
  }

  // Wie meeliep met de schout bij een aanval (js/rovers.js), volgt nu jouw bevel.
  function neemBevel(e) {
    if (e.opgeroepen) T.laatGaan(e);
    delete e.volgt;
  }

  // Erheen (`stuur`): de dichtste man naar de dichtste plek, en dat is zijn post. Wie vocht, laat zijn doel gaan: een bevel
  // erheen is lopen (en daar valt hij aan wat hij ziet, js/gevecht.js).
  T.stuurMannen = function (D, wie, naar) {
    const mannen = mannenMet(D, wie);
    if (!mannen.length) return;
    const plekken = plekkenRond(D.wereld, naar, mannen.length);
    const opAfstand = mannen.slice().sort((a, b) => T.afstand(T.tegelVan(a), naar) - T.afstand(T.tegelVan(b), naar));
    const nacht = D.kalender && T.dagdeelVan(D.kalender.dag) === 'nacht';
    opAfstand.forEach((e, i) => {
      const plek = plekken[i] || plekken[plekken.length - 1] || naar;
      neemBevel(e);
      delete e.doelwit;
      delete e.vanaf;
      if (e !== D.schout) e.post = nacht ? { x: plek.x, y: plek.y, wakker: true } : { x: plek.x, y: plek.y };
      if (!loop(D, e, plek, false)) T.zeg(D, T.t('{wie} cannot get there.', { wie: naamVan(D, e) }), 'gevaar');
    });
  };

  // Een vijand aanvallen (`volg`): de vijand van die soort het dichtst bij waar je klikte. Het gevecht (js/gevecht.js)
  // brengt hem erheen en laat hem slaan.
  T.volgVijand = function (D, wie, doel) {
    const mannen = mannenMet(D, wie);
    let vijand = null;
    let bij = Infinity;
    for (const e of D.wereld.wezens) {
      if (!isVijand(e) || e.soort !== doel.soort) continue;
      const a = T.afstand(T.tegelVan(e), doel);
      if (a <= IN().vijandBij && a < bij) {
        vijand = e;
        bij = a;
      }
    }
    if (!vijand) return;
    for (const e of mannen) {
      neemBevel(e);
      delete e.post;
      delete e.doelwit;
      e.volgt = vijand;
      loop(D, e, T.tegelVan(vijand), true);
    }
  };

  // Terug (`terug`): de post is weg; een soldaat gaat weer naar zijn wachthuis, een veteraan aan het werk.
  T.roepTerug = function (D, wie) {
    for (const e of mannenMet(D, wie)) {
      delete e.post;
      delete e.volgt;
      delete e.doelwit;
      delete e.vanaf;
      if (!e.onderweg) e.pad = [];
      e.dwaalTijd = 0;
    }
  };

  // Waar een man met een bevel hoort, voor T.dagAnker (js/dag.js): naast de vijand die hij volgt, of op zijn post (niet
  // 's nachts, tenzij hij die nacht zijn bevel kreeg). Wie geen man meer is (hij legde zijn wapens neer), verliest zijn
  // bevel.
  T.bevelAnker = function (D, e) {
    if (!e.post && !e.volgt) return null;
    if (!T.isMan(D, e)) {
      delete e.post;
      delete e.volgt;
      return null;
    }
    if (e.volgt) return { x: e.volgt.tx, y: e.volgt.ty, straal: 1 };
    if (!e.post.wakker && D.kalender && T.dagdeelVan(D.kalender.dag) === 'nacht') return null;
    return { x: e.post.x, y: e.post.y, straal: 0 };
  };

  // Elke tik, in elk dorp (T.werkDorpBij, js/dorp.js): is de vijand die hij aanviel gevallen of weg, dan blijft hij staan
  // (zijn post); wie 's nachts een bevel kreeg, slaapt de volgende nacht weer thuis. Erheen lopen en slaan doet het gevecht
  // (js/gevecht.js).
  T.werkSturenBij = function (S, D) {
    if (!D.wereld) return;
    const nacht = D.kalender && T.dagdeelVan(D.kalender.dag) === 'nacht';
    for (const e of T.mannenVan(D)) {
      if (e.post && e.post.wakker && !nacht) delete e.post.wakker;
      const v = e.volgt;
      if (!v || !(v.dood || !D.wereld.wezens.includes(v))) continue;
      delete e.volgt;
      if (e !== D.schout) e.post = { x: e.tx, y: e.ty };
    }
  };

  // ── Het briefje van wie je koos (js/huisbriefje.js legt het neer, zoals dat van een gebouw) ──

  const leven = (e, D) => {
    const l = e === D.schout ? { leven: e.leven, max: e.maxLeven } : T.levenAlsMan(e);
    return T.t('{leven} of {max}', { leven: Math.max(0, Math.ceil(l.leven)), max: l.max });
  };
  // Wat hij nu doet, in een paar woorden.
  function doetNu(D, e) {
    if (e.volgt) return T.t('after the {wie}', { wie: e.volgt.naam });
    if (e.doelwit) return T.t('fighting the {wie}', { wie: e.doelwit.naam });
    if (e.opgeroepen) return T.t('with the reeve');
    if (e.binnen) return T.t('at home');
    if (e.post) return e.onderweg || e.pad.length ? T.t('on his way to his post') : T.t('at his post');
    if (e.onderweg || e.pad.length) return T.t('on his way');
    const p = e.bewoner;
    if (p && p.soldaat) return T.t('at the guardhouse');
    return '';
  }
  // De knop om terug te roepen, voor wie een post heeft of een vijand volgt.
  const terugKnop = (D, mannen) => {
    const met = mannen.filter((e) => e.post || e.volgt);
    if (!met.length) return null;
    const soldaten = met.every((e) => e.bewoner && e.bewoner.soldaat);
    return {
      tekst: soldaten ? T.t('Back to the guardhouse') : T.t('Back to their day'),
      uitleg: T.t('The post is gone: they go back to what they did'),
      kan: true,
      opdracht: { soort: 'terug', wie: T.nummersVan(D, met) },
    };
  };

  // Het briefje van één man: wie hij is, wat hij draagt, zijn leven, en wat hij doet.
  T.manBriefje = function (D, e) {
    const p = T.bewonerVan(D, e);
    const regels = [T.t('Life: {leven}', { leven: leven(e, D) })];
    const soort = p && p.soldaat ? T.SOLDAAT_SOORTEN[p.soldaat.soort] : null;
    if (soort) regels.push(T.t('Carries: {wat}', { wat: T.opsomming(soort.stukken.map(T.stukNaam)) }));
    const knop = terugKnop(D, [e]);
    const doet = doetNu(D, e);
    return {
      kop: naamVan(D, e),
      // De held heet al zo; van een ander zegt het zijn soort.
      doet: T.hoofdletter(e === D.schout ? doet : doet ? `${soortTekst(D, e)} · ${doet}` : soortTekst(D, e)),
      delen: [{ titel: T.t('The man'), regels: knop ? [...regels, { tekst: T.t('His post'), knoppen: [knop] }] : regels }],
    };
  };

  // Het briefje van meer mannen: hoeveel, wie (bij naam, de eerste briefjeRegels), en terugroepen.
  T.mannenBriefje = function (D, mannen) {
    const n = IN().briefjeRegels;
    const regels = mannen.slice(0, n).map((e) => `${naamVan(D, e)} · ${soortTekst(D, e)} · ${leven(e, D)}`);
    if (mannen.length > n) regels.push(T.t('and {n} more', { n: mannen.length - n }));
    const knop = terugKnop(D, mannen);
    if (knop) regels.push({ tekst: T.t('Their post'), knoppen: [knop] });
    return { kop: T.t('{n} men', { n: mannen.length }), doet: '', delen: [{ titel: T.t('Chosen'), regels }] };
  };

  // Het briefje van een dorpeling: wie hij is, wat hij doet, waar hij woont, en praten als hij iets te zeggen heeft (een
  // voorval, of de waard); het gesprek gaat dan meteen open, zonder dat de held erheen loopt (tot stap 5).
  T.dorpelingBriefje = function (D, e) {
    const p = T.bewonerVan(D, e);
    if (!p) return null;
    const over = T.overBewonerTekst(D, e, p).split(' · ');
    const regels = [];
    if (p.huis) regels.push(T.t('Lives in the {huis}', { huis: (T.GEBOUWEN[p.huis.soort] || {}).naam || p.huis.soort }));
    else regels.push(T.t('No home'));
    const gesprek = T.gesprekBij(D, e);
    if (gesprek) regels.push({ tekst: gesprek.tekst, knoppen: [{ tekst: T.t('Talk'), uitleg: gesprek.tekst, kan: true, gesprek: { id: gesprek.id } }] });
    return { kop: over[0], doet: over[1] ? T.hoofdletter(over[1]) : '', delen: [{ titel: T.t('The villager'), regels }] };
  };

  // Heeft hij iets te zeggen: de waard (js/herberg.js). Geeft { id, tekst }.
  T.gesprekBij = function (D, e) {
    const p = T.bewonerVan(D, e);
    if (p && p.werk && p.werk.soort === 'herberg') return { id: 'waard', tekst: T.t('About last night at the inn') };
    return null;
  };

  // Het briefje van wat je koos (S.gekozen), als het een wezen is of een lijst: { D, briefje, wie }, of null.
  T.gekozenBriefje = function (S) {
    const g = S.gekozen;
    if (!g || (!Array.isArray(g) && g.tx == null)) return null;
    const D = S.dorp;
    const mannen = T.gekozenMannen(S, D);
    if (mannen.length > 1) return { D, briefje: T.mannenBriefje(D, mannen), wie: null };
    if (mannen.length === 1) return { D, briefje: T.manBriefje(D, mannen[0]), wie: mannen[0] };
    if (Array.isArray(g) || g.dood || !D.wereld.wezens.includes(g)) return null;
    const briefje = T.dorpelingBriefje(D, g);
    return briefje ? { D, briefje, wie: g } : null;
  };
})(globalThis.Spel = globalThis.Spel || {});
