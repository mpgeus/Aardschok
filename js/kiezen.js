// Kijken, kiezen en sturen als een god (werklijst vraag 170, stap 1; Marcel, 15 okt: "we gaan toch als 'god' sturen en
// bouwen. Je speelt dus niet meer de schout zelf"). De camera volgt de aanvoerder niet meer (js/main.js), links kies je een
// man, rechts stuur je hem, en een groep onthoud je onder een cijfer. Hier staan de regels zonder scherm, getoetst in
// test/kiezen.test.cjs; het scherm (de muis, het kader, de ring onder de voeten) staat in js/main.js en js/tekenen.js.
//
// Je stuurt alleen je mannen (4a): de held (de aanvoerder van je dorp), de soldaten van het wachthuis en de veteranen van de
// heervaart. Een dorpeling werkt vanzelf; een klik op hem geeft zijn briefje. Wat je kiest, is alleen scherm
// (S.gekozen, T.schermVelden in js/opslaan.js): een gebouw (js/gebouwbriefje.js), één wezen, of een lijst van je mannen.
//
// Een bevel is een opdracht (js/tik.js), met de nummers van de mannen (p.id van hun bewoner) en een plek:
//   - erheen (`stuur`): de plek is zijn post (Marcel: "Een post, tot je terugroept"). Daar staat hij in zijn dienst;
//     daarbuiten slaapt hij thuis, en als zijn dienst begint, gaat hij terug (e.post, en T.bevelAnker in js/dag.js).
//     Krijgt hij het bevel terwijl hij rust, dan blijft hij in dienst tot zijn eigen dienst begint ("De diensten").
//   - een vijand aanvallen (`volg`): hij zit hem na tot hij hem raakt, en slaat (e.volgt; het gevecht, js/gevecht.js,
//     zonder leiband). Is de vijand gevallen of weg, dan is waar hij staat zijn post.
//   - terug (`terug`): de post is weg, en hij gaat weer naar zijn wachthuis (of aan het werk).
//   - een formatie (`formatie`, stap 3): *Line* of *Ring*; wie een post heeft, gaat er meteen zo staan ("De formatie").
//   - een dienst (`dienst`, stap 4): *Day* of *Night* ("De diensten"); en *To arms* op het wachthuis (`teWapen`).
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
    formatie: {
      breedte: 8, // zoveel mannen staan er hooguit naast elkaar in een Line; wie er meer is, staat een rij erachter
      groen: 0.5, // zoveel seconden liggen hun plekken in groen op de grond na een rechtsklik (alleen scherm)
    },
  };
  const IN = () => T.KIEZEN_INSTELLINGEN;

  // ── Wie je kiest ──

  // Is dit een van je mannen in dorp D: de held (de aanvoerder), een soldaat of een veteraan die er is en leeft?
  T.isMan = function (D, e) {
    if (!D || !e || e.dood || e.dorp !== D) return false;
    if (e === D.aanvoerder) return true;
    const p = e.bewoner;
    return !!p && !!(p.soldaat || p.veteraan) && !p.weg && !p.komt && p.wezen === e;
  };
  // Al je mannen in D, de held eerst.
  T.mannenVan = (D) => [D.aanvoerder, ...T.militieVan(D)].filter((e) => T.isMan(D, e));
  // Wie van je mannen nu gekozen is (S.gekozen: één wezen of een lijst; een gebouw telt niet).
  T.gekozenMannen = function (S, D = S.dorp) {
    const g = S.gekozen;
    const lijst = Array.isArray(g) ? g : g && g.tx != null ? [g] : [];
    return lijst.filter((e) => T.isMan(D, e));
  };
  // Van welke soort hij is, voor een dubbelklik (alle van zijn soort) en het briefje: de soort soldaat, een veteraan, of
  // de held.
  T.soortVanMan = (D, e) => (e === D.aanvoerder ? 'held' : e.bewoner.soldaat ? e.bewoner.soldaat.soort : 'veteraan');
  const soortTekst = (D, e) => {
    const s = T.soortVanMan(D, e);
    return s === 'held' ? T.t('the commander') : s === 'veteraan' ? T.t('veteran') : T.soortNaam(s);
  };
  const naamVan = (D, e) => T.hoofdletter(T.naamVanBewoner(T.bewonerVan(D, e)));
  // Wat er bij de muis staat: "Walter · spearman", of "The commander".
  T.manTekst = (D, e) => (e === D.aanvoerder ? naamVan(D, e) : `${naamVan(D, e)} · ${soortTekst(D, e)}`);

  // De nummers van de mannen, voor een opdracht (p.id van hun bewoner), en terug.
  T.nummersVan = (D, mannen) => mannen.map((e) => T.bewonerVan(D, e)).filter(Boolean).map((p) => p.id);
  const mannenMet = (D, wie) =>
    (wie || []).map((id) => D.bewoners.mensen.find((p) => p.id === id)).filter((p) => p && T.isMan(D, p.wezen)).map((p) => p.wezen);

  // ── Wat rechts doet (de muis en de klik vragen hetzelfde, zoals T.handelingVerkennen) ──

  // Is dit een vijand die de mannen van D kunnen aanvallen: een rover, een wolf, een monster, of een mens van een ander
  // dorp (T.isVijandVan, js/gevecht.js)?
  const isVijand = (D, e) => !!e && !e.dood && (e.kant === 'monster' || T.isVijandVan(D, e));
  // Met `mannen` gekozen: wat een rechtsklik op `doel` doet ({ tekst, kan, opdracht, doe }), of null.
  T.handelingSturen = function (S, doel, mannen) {
    if (!doel || !mannen || !mannen.length) return null;
    const D = S.dorp; // je stuurt je eigen mannen, ook bij een ander dorp op dezelfde kaart
    if (!D || D.wereld !== S.wereld) return null;
    const wie = T.nummersVan(D, mannen);
    const geef = (o) => () => T.geefOpdracht(S, o);
    if (doel.wezen && isVijand(D, doel.wezen)) {
      const e = doel.wezen;
      const opdracht = { soort: 'volg', wie, doel: { x: e.tx, y: e.ty, soort: e.soort } };
      return { tekst: T.t('Attack the {wie}', { wie: e.naam }), kan: true, opdracht, doe: geef(opdracht) };
    }
    const x = doel.wezen ? doel.wezen.tx : doel.x;
    const y = doel.wezen ? doel.wezen.ty : doel.y;
    if (!T.kentTegel(S.dorp, x, y)) return { tekst: T.t('You do not know that land'), kan: false, fout: true };
    const opdracht = { soort: 'stuur', wie, naar: { x, y } };
    const tekst = mannen.length === 1 ? T.t('Send {wie} here', { wie: naamVan(D, mannen[0]) }) : T.t('Send {n} men here', { n: mannen.length });
    return { tekst, kan: true, opdracht, doe: geef(opdracht) };
  };

  // ── De formatie (vraag 170, stap 3; Marcel, 16 okt: "A1, B1, C1, D1, E1") ──
  //
  // Wie je samen stuurt, gaat in een formatie staan, op wapen gesorteerd. Een *Line* (`lijn`): rijen dwars op de
  // looprichting, met het midden op de plek waar je klikte; voor wie slaat (hooivork, zwaard, de held), erachter wie
  // steekt (een speer of een piek reikt langs de voorste), een rij verder wie schiet; hooguit `breedte` naast elkaar, en
  // wie er meer is, staat een rij erachter bij zijn soort. Een *Ring* (`ring`): wie slaat en steekt in een kring om de
  // plek, naar buiten kijkend, en wie schiet binnenin. Een soort die er niet is, valt weg; een plek op een boom, een huis
  // of water schuift naar de dichtste vrije tegel.
  //
  // De formatie hoort bij de man (e.formatie; zonder is het een Line): elke troep zijn eigen, en wie je samen stuurt,
  // krijgt die van de meesten. Zijn kijkrichting hoort bij zijn post (post.kijk, een stap van de acht: js/sprites.js
  // draait hem zo als hij op zijn post staat en niet vecht), en de richting van de troep ook (post.richting): van hun
  // midden naar de klik, afgerond op de acht kanten van de figuren. Zo kijkt een rij één kant op (elk naar zijn eigen
  // laatste stap gaf een rij die alle kanten op keek). De held heeft geen post: hij kijkt naar een plek voor zich
  // (e.kijkt).
  // Alleen gewone rekensommen, geen atan2, sin of cos: die kunnen op een andere computer een haar anders uitkomen, en
  // samen spelen (lockstep, js/tik.js) vraagt werelden die letter voor letter gelijk blijven.

  T.FORMATIES = ['lijn', 'ring'];
  const BUREN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  const TAN_22_5 = 0.41421356; // de grens tussen twee van de acht kanten
  const NAAR_DE_CAMERA = { x: 1, y: 1 }; // de richting van wie nog geen richting had (Z in js/sprites.js)

  // In welke rij hij hoort: 0 wie slaat, 1 wie steekt (verder dan ernaast), 2 wie schiet.
  T.rijVan = function (e) {
    const s = T.slagVan(e);
    return s.schiet ? 2 : s.bereik > 1 ? 1 : 0;
  };

  // De formatie van wie je samen stuurt: die van de meesten; bij gelijk de eerste van T.FORMATIES.
  T.formatieVan = function (mannen) {
    let beste = T.FORMATIES[0];
    let meest = 0;
    for (const v of T.FORMATIES) {
      const n = mannen.filter((e) => (e.formatie || 'lijn') === v).length;
      if (n > meest) [beste, meest] = [v, n];
    }
    return beste;
  };

  // Een richting afgerond op de acht stappen van het raster ({ x, y }, elk -1, 0 of 1), of null zonder richting.
  function achtVan(dx, dy) {
    if (!dx && !dy) return null;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    return { x: ax >= ay * TAN_22_5 ? Math.sign(dx) : 0, y: ay >= ax * TAN_22_5 ? Math.sign(dy) : 0 };
  }
  // Een hoek rond, van 0 tot 4, zonder atan2 (de ruithoek): hij stijgt zoals de echte hoek, en dat is genoeg om op te
  // sorteren.
  function ruitHoek(dx, dy) {
    if (dy >= 0) return dx >= 0 ? dy / (dx + dy || 1) : 1 - dx / (dy - dx);
    return dx < 0 ? 2 - dy / (-dx - dy) : 3 + dx / (dx - dy);
  }
  const midden = (tegels) => ({
    x: tegels.reduce((som, t) => som + t.x, 0) / tegels.length,
    y: tegels.reduce((som, t) => som + t.y, 0) / tegels.length,
  });
  // De richting die de troep had (staan ze al waar je ze heen stuurt, of kies je een andere formatie).
  function vorigeRichting(mannen) {
    const met = mannen.find((e) => e.post && e.post.richting);
    return met ? met.post.richting : NAAR_DE_CAMERA;
  }

  // De dichtste vrije tegel bij t (t zelf eerst) waar nog niemand van de formatie staat: begaanbaar, en niet in een
  // gebouw.
  function vrijBij(w, t, bezet) {
    const gezien = new Set([t.x + ',' + t.y]);
    let rand = [t];
    for (let ring = 0; rand.length && ring < 12; ring++) {
      const volgende = [];
      for (const p of rand) {
        if (T.opKaart(w, p.x, p.y) && T.isBegaanbaar(w, p.x, p.y) && !bezet.has(p.x + ',' + p.y)) return p;
        for (const [dx, dy] of BUREN) {
          const k = p.x + dx + ',' + (p.y + dy);
          if (gezien.has(k)) continue;
          gezien.add(k);
          volgende.push({ x: p.x + dx, y: p.y + dy });
        }
      }
      rand = volgende;
    }
    return t;
  }

  // Een Line: per soort (wie slaat, wie steekt, wie schiet) zoveel rijen als nodig, met de middelste rij op `naar`. In
  // een rij staat wie links liep links, zodat niemand kruist.
  function lijnPlekken(mannen, naar, f) {
    const z = { x: -f.y, y: f.x }; // opzij
    const opzij = (e) => (T.tegelVan(e).x - naar.x) * z.x + (T.tegelVan(e).y - naar.y) * z.y;
    const vooruit = (e) => (T.tegelVan(e).x - naar.x) * f.x + (T.tegelVan(e).y - naar.y) * f.y;
    const breedte = Math.max(1, Math.round(IN().formatie.breedte));
    const rijen = [];
    for (const soort of [0, 1, 2]) {
      const wie = mannen.filter((e) => T.rijVan(e) === soort).sort((a, b) => vooruit(b) - vooruit(a));
      for (let i = 0; i < wie.length; i += breedte) rijen.push(wie.slice(i, i + breedte));
    }
    const voor = Math.floor((rijen.length - 1) / 2); // zoveel rijen staan er voor de plek
    const uit = [];
    rijen.forEach((rij, r) => {
      rij.sort((a, b) => opzij(a) - opzij(b)).forEach((e, j) => {
        const k = j - Math.floor((rij.length - 1) / 2);
        const terug = r - voor;
        uit.push({ e, x: naar.x - terug * f.x + k * z.x, y: naar.y - terug * f.y + k * z.y, kijk: { x: f.x, y: f.y } });
      });
    });
    return uit;
  }

  // Een Ring om `naar`: wie slaat en steekt op de kleinste kring waar ze allemaal op passen (met binnenin plaats voor wie
  // schiet), gelijk verdeeld en de eerste in de looprichting, elk naar buiten kijkend; wie schiet binnenin, het midden
  // eerst. Is er niemand die slaat of steekt, dan staan de schutters zelf in de kring.
  function ringPlekken(mannen, naar, f) {
    let buiten = mannen.filter((e) => T.rijVan(e) < 2);
    let binnen = mannen.filter((e) => T.rijVan(e) === 2);
    if (!buiten.length) [buiten, binnen] = [binnen, []];
    if (buiten.length === 1 && !binnen.length) return [{ e: buiten[0], x: naar.x, y: naar.y, kijk: { x: f.x, y: f.y } }];
    const start = ruitHoek(f.x, f.y);
    const hoek = (dx, dy) => (ruitHoek(dx, dy) - start + 4) % 4;
    const hoekVan = (e) => hoek(T.tegelVan(e).x - naar.x, T.tegelVan(e).y - naar.y);
    let kring;
    let kern;
    for (let r = 1; ; r++) {
      kring = [];
      kern = [];
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const d2 = dx * dx + dy * dy;
          if (d2 < (r - 0.5) ** 2) kern.push({ dx, dy, d2 });
          else if (d2 < (r + 0.5) ** 2) kring.push({ dx, dy });
        }
      }
      if (kring.length >= buiten.length && kern.length >= binnen.length) break;
    }
    kring.sort((a, b) => hoek(a.dx, a.dy) - hoek(b.dx, b.dy));
    kern.sort((a, b) => a.d2 - b.d2 || hoek(a.dx, a.dy) - hoek(b.dx, b.dy));
    const uit = [];
    buiten.sort((a, b) => hoekVan(a) - hoekVan(b)).forEach((e, i) => {
      const p = kring[Math.floor((i * kring.length) / buiten.length)];
      uit.push({ e, x: naar.x + p.dx, y: naar.y + p.dy, kijk: achtVan(p.dx, p.dy) });
    });
    binnen.sort((a, b) => hoekVan(a) - hoekVan(b)).forEach((e, i) => {
      const p = kern[i];
      uit.push({ e, x: naar.x + p.dx, y: naar.y + p.dy, kijk: achtVan(p.dx, p.dy) || { x: f.x, y: f.y } });
    });
    return uit;
  }

  // Waar elk van `mannen` komt te staan in hun formatie bij `naar`: { plekken: [{ e, x, y, kijk }], richting }. Zonder
  // `richting` die van hun midden naar `naar`; staan ze er al, dan die ze hadden. Ook voor het scherm (de plekken in groen
  // na een rechtsklik, js/main.js): het verandert niets.
  T.formatiePlekken = function (D, mannen, naar, richting) {
    const m = midden(mannen.map((e) => T.tegelVan(e)));
    const dx = naar.x - m.x;
    const dy = naar.y - m.y;
    const f = richting || (Math.abs(dx) + Math.abs(dy) >= 1 && achtVan(dx, dy)) || vorigeRichting(mannen);
    const plekken = T.formatieVan(mannen) === 'ring' ? ringPlekken(mannen, naar, f) : lijnPlekken(mannen, naar, f);
    const bezet = new Set();
    for (const p of plekken) {
      const t = vrijBij(D.wereld, p, bezet);
      bezet.add(t.x + ',' + t.y);
      p.x = t.x;
      p.y = t.y;
    }
    return { plekken, richting: f };
  };

  // ── De bevelen (T.OPDRACHTEN in js/tik.js) ──

  // Loop naar `doel` (een tegel, of met `naast` ernaast). Wie binnen is, komt eerst naar buiten (het dwalen, js/verkennen.js,
  // dat hij nu meteen doet); wie midden in een stap is, maakt die af. Geeft of er een weg is.
  function loop(D, e, doel, naast) {
    const w = D.wereld;
    if (e.binnen) {
      e.dwaalTijd = 0;
      return true;
    }
    const pad = T.zoekRoute(w, T.tegelVan(e), doel, { naast, deurenOpenen: e === D.aanvoerder });
    if (pad === null) return false;
    T.geefRoute(e, e.onderweg && e.pad[0] ? [e.pad[0], ...pad] : pad, { x: doel.x, y: doel.y, naast });
    return true;
  }

  // Een bevel gaat voor: wie een vijand achterna zat (e.volgt), laat hem gaan.
  function neemBevel(e) {
    delete e.volgt;
  }

  // Erheen (`stuur`): elk naar zijn plek in hun formatie (hierboven), en dat is zijn post. Wie je samen stuurt, krijgt
  // de formatie van de meesten. Wie vocht, laat zijn doel gaan: een bevel erheen is lopen (en daar valt hij aan wat hij
  // ziet, js/gevecht.js). `richting` alleen als de formatie verandert waar ze staan (T.zetFormatie).
  T.stuurMannen = function (D, wie, naar, richting) {
    const mannen = mannenMet(D, wie);
    if (!mannen.length) return;
    const formatie = T.formatieVan(mannen);
    const uit = T.formatiePlekken(D, mannen, naar, richting);
    for (const { e, x, y, kijk } of uit.plekken) {
      neemBevel(e);
      wek(D, e);
      delete e.doelwit;
      delete e.vanaf;
      if (formatie === 'lijn') delete e.formatie;
      else e.formatie = formatie;
      if (e === D.aanvoerder) e.kijkt = { x: x + kijk.x * 4, y: y + kijk.y * 4 };
      else e.post = { x, y, kijk, richting: { x: uit.richting.x, y: uit.richting.y } };
      if (!loop(D, e, { x, y }, false)) T.zeg(D, T.t('{wie} cannot get there.', { wie: naamVan(D, e) }), 'gevaar');
    }
  };

  // Een formatie kiezen (`formatie`, de knoppen Line en Ring op het briefje): hij hoort voortaan bij hen, en wie een post
  // heeft, gaat er meteen zo staan, rond het midden van hun posten en in de richting die ze hadden (de held, zonder post,
  // staat dan mee).
  T.zetFormatie = function (D, wie, formatie) {
    if (!T.FORMATIES.includes(formatie)) return;
    const mannen = mannenMet(D, wie);
    for (const e of mannen) {
      if (formatie === 'lijn') delete e.formatie;
      else e.formatie = formatie;
    }
    if (!mannen.some((e) => e.post)) return;
    const staan = mannen.filter((e) => e.post || e === D.aanvoerder);
    const m = midden(staan.map((e) => e.post || T.tegelVan(e)));
    T.stuurMannen(D, T.nummersVan(D, staan), { x: Math.round(m.x), y: Math.round(m.y) }, vorigeRichting(staan));
  };

  // Een vijand aanvallen (`volg`): de vijand van die soort het dichtst bij waar je klikte. Het gevecht (js/gevecht.js)
  // brengt hem erheen en laat hem slaan.
  T.volgVijand = function (D, wie, doel) {
    const mannen = mannenMet(D, wie);
    let vijand = null;
    let bij = Infinity;
    for (const e of D.wereld.wezens) {
      if (!isVijand(D, e) || e.soort !== doel.soort) continue;
      const a = T.afstand(T.tegelVan(e), doel);
      if (a <= IN().vijandBij && a < bij) {
        vijand = e;
        bij = a;
      }
    }
    if (!vijand) return;
    for (const e of mannen) {
      neemBevel(e);
      wek(D, e);
      delete e.post;
      delete e.doelwit;
      if (e === D.aanvoerder) delete e.kijkt;
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

  // ── De diensten (vraag 170, stap 4; Marcel, 16 okt: "A1, B1, C2, D2") ──
  //
  // Een soldaat heeft een dienst (p.soldaat.dienst: 'nacht', of zonder: de dag, 5a): de dagdienst van het opstaan tot
  // het slapen, de nachtdienst van het slapen tot het opstaan (A1: zo sluiten ze op elkaar aan, en is er altijd
  // iemand). In zijn dienst staat hij op zijn post of bij het wachthuis (T.dagAnker, js/dag.js); daarbuiten slaapt hij
  // thuis, binnen, waar niemand hem slaat en hij niemand. Je kiest het per man (B1), met *Day* en *Night* op het
  // briefje van wie je koos. Een veteraan heeft geen dienst: hij werkt overdag, en zijn post geldt als een dagdienst.
  // De held heeft geen dag. Wie een bevel krijgt terwijl hij rust, of wie zijn wachthuis te wapen roept (*To arms*,
  // C2), staat op en blijft in dienst tot zijn eigen dienst begint (e.wakker); dan is het weer zijn gewone dienst, en
  // rust hij de keer daarna.
  T.DIENSTEN = ['dag', 'nacht'];
  T.dienstVan = (e) => (e.bewoner && e.bewoner.soldaat && e.bewoner.soldaat.dienst) || 'dag';
  // Is het nu zijn eigen dienst? Zonder kalender (een toets) altijd.
  function zijnDienstNu(D, e) {
    if (!D.kalender) return true;
    return (T.dagdeelVan(D.kalender.dag) === 'nacht') === (T.dienstVan(e) === 'nacht');
  }
  // Is hij in dienst: in zijn eigen dienst, of opgestaan voor een bevel of te wapen.
  T.inDienst = (D, e) => !!e.wakker || zijnDienstNu(D, e);
  // Wie rust, staat op (de held rust nooit); wie binnen is, komt meteen naar buiten (het dwalen, js/verkennen.js).
  function wek(D, e) {
    if (e === D.aanvoerder || T.inDienst(D, e)) return false;
    e.wakker = true;
    e.dwaalTijd = 0;
    return true;
  }

  // Een dienst kiezen (`dienst`, de knoppen Day en Night): voor de soldaten onder wie je koos. Wie nu buiten zijn
  // dienst valt, gaat naar huis; wie erin valt, naar zijn post of het wachthuis.
  T.zetDienst = function (D, wie, dienst) {
    if (!T.DIENSTEN.includes(dienst)) return;
    for (const e of mannenMet(D, wie)) {
      const s = e.bewoner && e.bewoner.soldaat;
      if (!s) continue;
      if (dienst === 'dag') delete s.dienst;
      else s.dienst = dienst;
      e.dwaalTijd = 0;
    }
  };

  // Te wapen (`teWapen`, de knop To arms op het briefje van wachthuis g): wie van zijn soldaten rust, staat op. Geeft
  // hoeveel.
  T.roepTeWapen = function (D, g) {
    let n = 0;
    for (const p of T.soldatenVan(D, g)) if (T.isMan(D, p.wezen) && wek(D, p.wezen)) n++;
    return n;
  };

  // Waar een man met een bevel hoort, voor T.dagAnker (js/dag.js): naast de vijand die hij volgt, of op zijn post
  // (alleen in zijn dienst, T.inDienst). Wie geen man meer is (hij legde zijn wapens neer), verliest zijn bevel.
  T.bevelAnker = function (D, e) {
    if (!e.post && !e.volgt) return null;
    if (!T.isMan(D, e)) {
      delete e.post;
      delete e.volgt;
      return null;
    }
    if (e.volgt) return { x: e.volgt.tx, y: e.volgt.ty, straal: 1 };
    if (!T.inDienst(D, e)) return null;
    return { x: e.post.x, y: e.post.y, straal: 0 };
  };

  // Elke tik, in elk dorp (T.werkDorpBij, js/dorp.js): is de vijand die hij aanviel gevallen of weg, dan blijft hij
  // staan (zijn post); wie buiten zijn dienst opstond, is weer gewoon in dienst als die begint (en rust de keer
  // daarna). Erheen lopen en slaan doet het gevecht (js/gevecht.js).
  T.werkSturenBij = function (S, D) {
    if (!D.wereld) return;
    for (const e of T.mannenVan(D)) {
      if (e.wakker && zijnDienstNu(D, e)) delete e.wakker;
      const v = e.volgt;
      if (!v || !(v.dood || !D.wereld.wezens.includes(v))) continue;
      delete e.volgt;
      if (e !== D.aanvoerder) e.post = { x: e.tx, y: e.ty };
    }
  };

  // ── Het briefje van wie je koos (js/huisbriefje.js legt het neer, zoals dat van een gebouw) ──

  const leven = (e, D) => {
    const l = e === D.aanvoerder ? { leven: e.leven, max: e.maxLeven } : T.levenAlsMan(e);
    return T.t('{leven} of {max}', { leven: Math.max(0, Math.ceil(l.leven)), max: l.max });
  };
  // Wat hij nu doet, in een paar woorden.
  function doetNu(D, e) {
    if (e.volgt) return T.t('after the {wie}', { wie: e.volgt.naam });
    if (e.doelwit) return T.t('fighting the {wie}', { wie: e.doelwit.naam });
    if (e.binnen) return e.bewoner && e.bewoner.soldaat && !T.inDienst(D, e) ? T.t('asleep at home') : T.t('at home');
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

  // De knoppen voor hun dienst (stap 4): Day en Night, voor de soldaten onder hen; die ze allemaal hebben, is niet te
  // kiezen. Zonder soldaten (de held, een veteraan) geen.
  const dienstKnoppen = (D, mannen) => {
    const soldaten = mannen.filter((e) => e.bewoner && e.bewoner.soldaat);
    if (!soldaten.length) return null;
    const wie = T.nummersVan(D, soldaten);
    return [
      { tekst: T.t('Day'), uitleg: T.t('On watch from rising to bedtime, asleep at night'), dienst: 'dag' },
      { tekst: T.t('Night'), uitleg: T.t('On watch from bedtime to rising, asleep by day'), dienst: 'nacht' },
    ].map((k) => ({ tekst: k.tekst, uitleg: k.uitleg, kan: !soldaten.every((e) => T.dienstVan(e) === k.dienst), opdracht: { soort: 'dienst', wie, dienst: k.dienst } }));
  };

  // Het briefje van één man: wie hij is, wat hij draagt, zijn leven, zijn dienst, en wat hij doet.
  T.manBriefje = function (D, e) {
    const p = T.bewonerVan(D, e);
    const regels = [T.t('Life: {leven}', { leven: leven(e, D) })];
    const soort = p && p.soldaat ? T.SOLDAAT_SOORTEN[p.soldaat.soort] : null;
    if (soort) regels.push(T.t('Carries: {wat}', { wat: T.opsomming(soort.stukken.map(T.stukNaam)) }));
    const dienst = dienstKnoppen(D, [e]);
    if (dienst) regels.push({ tekst: T.t('Watch'), knoppen: dienst });
    const knop = terugKnop(D, [e]);
    const doet = doetNu(D, e);
    return {
      kop: naamVan(D, e),
      // De held heet al zo; van een ander zegt het zijn soort.
      doet: T.hoofdletter(e === D.aanvoerder ? doet : doet ? `${soortTekst(D, e)} · ${doet}` : soortTekst(D, e)),
      delen: [{ titel: T.t('The man'), regels: knop ? [...regels, { tekst: T.t('His post'), knoppen: [knop] }] : regels }],
    };
  };

  // De knoppen voor hun formatie (stap 3): Line en Ring; die ze nu hebben, is niet te kiezen.
  const formatieKnoppen = (D, mannen) => {
    const nu = T.formatieVan(mannen);
    const wie = T.nummersVan(D, mannen);
    return [
      { tekst: T.t('Line'), uitleg: T.t('In rows: who strikes in front, spears behind them, bows at the back'), formatie: 'lijn' },
      { tekst: T.t('Ring'), uitleg: T.t('In a ring around the spot, facing out, bows in the middle'), formatie: 'ring' },
    ].map((k) => ({ tekst: k.tekst, uitleg: k.uitleg, kan: k.formatie !== nu, opdracht: { soort: 'formatie', wie, formatie: k.formatie } }));
  };

  // Het briefje van meer mannen: hoeveel, wie (bij naam, de eerste briefjeRegels), hun formatie, hun dienst, en
  // terugroepen.
  T.mannenBriefje = function (D, mannen) {
    const n = IN().briefjeRegels;
    const regels = mannen.slice(0, n).map((e) => `${naamVan(D, e)} · ${soortTekst(D, e)} · ${leven(e, D)}`);
    if (mannen.length > n) regels.push(T.t('and {n} more', { n: mannen.length - n }));
    regels.push({ tekst: T.t('Formation'), knoppen: formatieKnoppen(D, mannen) });
    const dienst = dienstKnoppen(D, mannen);
    if (dienst) regels.push({ tekst: T.t('Watch'), knoppen: dienst });
    const knop = terugKnop(D, mannen);
    if (knop) regels.push({ tekst: T.t('Their post'), knoppen: [knop] });
    return { kop: T.t('{n} men', { n: mannen.length }), doet: '', delen: [{ titel: T.t('Chosen'), regels }] };
  };

  // Het briefje van een dorpeling: wie hij is, wat hij doet, en waar hij woont. (Tot vraag 170, stap 5 had de waard er
  // Talk op; het praten is geparkeerd.)
  T.dorpelingBriefje = function (D, e) {
    const p = T.bewonerVan(D, e);
    if (!p) return null;
    const over = T.overBewonerTekst(D, e, p).split(' · ');
    const regels = [];
    if (p.huis) regels.push(T.t('Lives in the {huis}', { huis: (T.GEBOUWEN[p.huis.soort] || {}).naam || p.huis.soort }));
    else regels.push(T.t('No home'));
    return { kop: over[0], doet: over[1] ? T.hoofdletter(over[1]) : '', delen: [{ titel: T.t('The villager'), regels }] };
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
