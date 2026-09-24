// Rijk worden en arm lijken: de inner (ontwerp/spel.md, "Rijk worden en arm lijken: de inner";
// werklijst, punt 6 — het tweede proefje). Marcel koos op 24 sep: de inner komt na de oogst, en wat
// hij ziet bepaalt de brief van de heer; je verstopt in een verstopplek; je loopt met hem mee en kiest
// bij elke plek (uitleggen, afleiden, omkopen); en in het rekenboek voor de heer schrijf je de oogst
// die je opgeeft, met een reden.
//
//   oogstmaand       de boeren maaien; wat binnenkomt, telt T.telOogst (js/akkers.js)
//   1 herfstmaand    het rekenboek: wat geef je op? (T.schrijfOp)
//   12 herfstmaand   je hoort dat de inner komt
//   15 herfstmaand   hij komt: een route langs de akkers, de schuur en wat nieuw is (T.beginBezoek,
//                    T.antwoord bij elke plek, T.eindeBezoek); zijn rapport gaat naar de heer
//   11 wijnmaand     de brief van de heer rekent met dat rapport (js/heer.js, T.aanslag)
//
// Regels zonder scherm (test/inner.test.cjs), één keer per dag vanuit T.tikGebouwenDag. Het poppetje
// dat rondloopt en de vragen bij elke plek (T.werkInnerBij), het paneel bij de verstopplek en de vraag
// voor het rekenboek hangen er zacht aan (js/hud.js). Zonder scherm loopt het bezoek in één keer af,
// en zwijgt de schout bij elke plek.
(function (T) {
  'use strict';

  // Getallen om bij te stellen, in één blok (CLAUDE.md). Een eerste gok: nog niet gespeeld.
  T.INNER_INSTELLINGEN = {
    rekenboek: { maand: 'herfstmaand', dag: 1 },
    aankondiging: { maand: 'herfstmaand', dag: 12 },
    bezoek: { maand: 'herfstmaand', dag: 15 },
    beginArgwaan: 20, // een inner is van nature achterdochtig
    vergeten: 0.7, // van een jaar op het volgende blijft er zoveel argwaan over
    // Wat je kunt opgeven, en hoe geloofwaardig die reden is (1: helemaal, 0: niet).
    redenen: [
      { id: 'alles', knop: 'Alles', reden: null, deel: 1, geloof: 1 },
      { id: 'hagel', knop: 'Een vijfde minder: hagel', reden: 'de hagel sloeg een stuk plat', deel: 0.8, geloof: 0.6 },
      { id: 'zwijnen', knop: 'Een derde minder: wilde zwijnen', reden: 'wilde zwijnen zaten in het koren', deel: 0.67, geloof: 0.5 },
      { id: 'nat', knop: 'De helft: een natte zomer', reden: 'het rotte op het veld na een natte zomer', deel: 0.5, geloof: 0.3 },
    ],
    telFout: 0.05, // hij telt de stoppels tot op zoveel na
    argwaanPerTekort: 150, // (geteld − opgegeven) / geteld × dit × (1 − geloof)
    speling: 0.15, // in de schuur mag er zoveel meer of minder liggen dan hij verwacht
    argwaanPerOverschot: 100, // en daarboven: overschot / verwacht × dit (hoogstens 40)
    argwaanTeWeinig: 10, // minder dan de helft van wat hij verwacht: waar is het?
    argwaanPerPronk: 2, // per punt pronk van wat nieuw is, als je minder opgaf dan hij telde
    uitleggen: 0.5, // uitleggen haalt zoveel van de argwaan van die plek weg
    afleiden: 5, // argwaan erbij als je hem wegleidt, en bij elke volgende keer in hetzelfde bezoek 5 meer
    wegblijven: 8, // argwaan erbij als de schout er niet bij is
    omkopen: { basis: 5, perArgwaan: 0.1, erbijPerKeer: 0.5, zakt: 20 },
    vinden: { straal: 3, kans: 0.35, perArgwaan: 0.004, argwaan: 40 },
    verstopRuimte: 60, // zoveel ruimte heeft één verstopplek
    ruimte: { graan: 1, wol: 2, goud: 0.05, ijzer: 1, zout: 0.5 }, // wat één stuk inneemt: goud weinig
    wachten: 4, // zoveel tellen wacht hij bij een plek op de schout
  };

  const IN = () => T.INNER_INSTELLINGEN;
  const bericht = (tekst, soort) => {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  };
  const jaarVan = (dag) => T.datumVanDag(dag).jaar;
  const vandaag = (S) => (S.kalender ? Math.floor(S.kalender.dag) : 0);
  // Een vast getal tussen 0 en 1 uit een paar gehele getallen: hetzelfde spel, dezelfde uitkomst.
  const hashTal = (...n) => {
    let h = 2166136261;
    for (const x of n) h = Math.imul(h ^ (x | 0), 16777619);
    return ((h >>> 0) % 10007) / 10007;
  };

  T.nieuweInner = function () {
    return { argwaan: IN().beginArgwaan, rapport: null, bezoek: null, omgekocht: 0, gezien: [], komtOp: null };
  };

  function inner(S) {
    if (!S.inner) S.inner = T.nieuweInner();
    return S.inner;
  }

  // ---------------------------------------------------------------------------------------------
  // De oogst en het rekenboek
  // ---------------------------------------------------------------------------------------------

  // Wat er binnenkomt van de akkers (js/akkers.js, bij elke gemaaide tegel): het echte boek.
  T.telOogst = function (S, n) {
    if (!S.kalender || !T.datumVanDag) return;
    const j = jaarVan(S.kalender.dag);
    S.oogsten = S.oogsten || {};
    S.oogsten[j] = (S.oogsten[j] || 0) + n;
  };
  T.oogstVan = (S, jaar) => (S.oogsten && S.oogsten[jaar]) || 0;

  // Schrijf in het rekenboek voor de heer wat je opgeeft (een van T.INNER_INSTELLINGEN.redenen).
  T.schrijfOp = function (S, redenId, jaar) {
    const j = jaar != null ? jaar : jaarVan(vandaag(S));
    const r = IN().redenen.find((x) => x.id === redenId) || IN().redenen[0];
    const echt = T.oogstVan(S, j);
    S.rekenboek = S.rekenboek || {};
    S.rekenboek[j] = { echt, opgegeven: Math.round(echt * r.deel), reden: r.id };
    return S.rekenboek[j];
  };

  // ---------------------------------------------------------------------------------------------
  // Verstopplekken
  // ---------------------------------------------------------------------------------------------

  const sleutel = (b) => `${b.x},${b.y}`;
  T.verstopplekken = (S) => (S.gebouwen || []).filter((g) => g.soort === 'verstopplek' && g.klaar);
  T.verstoptIn = (S, b) => (S.verstopt && S.verstopt[sleutel(b)]) || {};
  T.verstopRuimte = function (S, b) {
    const R = IN().ruimte;
    let bezet = 0;
    for (const [wat, n] of Object.entries(T.verstoptIn(S, b))) bezet += n * (R[wat] || 1);
    return { bezet, vrij: Math.max(0, IN().verstopRuimte - bezet), totaal: IN().verstopRuimte };
  };
  // Wat er in een verstopplek mag: wat de inner zou tellen.
  T.VERSTOPBAAR = ['graan', 'wol', 'goud', 'ijzer', 'zout'];

  // Van de voorraad naar de verstopplek: zoveel als je hebt en als er plaats is.
  T.verstop = function (S, b, wat, aantal) {
    if (!T.VERSTOPBAAR.includes(wat)) return { gelukt: false, reden: `${T.hoofdletter(wat)} verstop je niet.` };
    const per = IN().ruimte[wat] || 1;
    const n = Math.min(Math.floor(aantal), Math.floor(S.voorraad[wat] || 0), Math.floor(T.verstopRuimte(S, b).vrij / per + 1e-9));
    if (n <= 0) return { gelukt: false, reden: (S.voorraad[wat] || 0) < 1 ? `Je hebt geen ${wat}.` : 'De verstopplek zit vol.' };
    T.wijzigVoorraad(S, wat, -n);
    S.verstopt = S.verstopt || {};
    const plek = (S.verstopt[sleutel(b)] = S.verstopt[sleutel(b)] || {});
    plek[wat] = (plek[wat] || 0) + n;
    return { gelukt: true, aantal: n };
  };

  // Uit de verstopplek terug in de voorraad.
  T.haalOp = function (S, b, wat, aantal) {
    const plek = T.verstoptIn(S, b);
    const n = Math.min(Math.floor(aantal), plek[wat] || 0);
    if (n <= 0) return { gelukt: false, reden: `Er ligt geen ${wat}.` };
    plek[wat] -= n;
    if (!plek[wat]) delete plek[wat];
    T.wijzigVoorraad(S, wat, n);
    return { gelukt: true, aantal: n };
  };

  // De verstopplek onder tegel (x, y), als hij af is.
  T.verstopplekOp = function (S, x, y) {
    for (const b of T.verstopplekken(S)) {
      const v = T.gebouwVoet(b.soort) || { b: 1, h: 1 };
      if (x >= b.x && x < b.x + v.b && y >= b.y && y < b.y + v.h) return b;
    }
    return null;
  };

  // ---------------------------------------------------------------------------------------------
  // Het bezoek
  // ---------------------------------------------------------------------------------------------

  // Waar hij heen wil: de akkers (de stoppels tellen), de schuur (het graan zien), en wat er sinds
  // zijn vorige bezoek nieuw gebouwd is en het rijkst oogt.
  function routeVan(S) {
    const stops = [];
    const akkers = (S.wereld && S.wereld.akkers) || [];
    if (akkers.length) {
      const a = akkers.reduce((p, q) => (q.b * q.h > p.b * p.h ? q : p));
      stops.push({ soort: 'akkers', x: Math.round(a.x + a.b / 2), y: Math.round(a.y + a.h / 2) });
    }
    // Bij een gebouw staat hij aan de voorkant (+x en +y liggen vooraan in beeld), niet erachter.
    const voor = (g) => {
      const v = T.gebouwVoet(g.soort) || { b: 1, h: 1 };
      return { x: g.x + v.b, y: g.y + v.h };
    };
    const schuur = (S.gebouwen || []).find((g) => g.klaar && g.soort === 'boerderij') || (S.gebouwen || []).find((g) => g.klaar);
    if (schuur) stops.push({ soort: 'schuur', ...voor(schuur), gebouw: schuur });
    const gezien = inner(S).gezien;
    const nieuw = (S.gebouwen || [])
      .filter((g) => g.klaar && g.voorwerp && g.soort !== 'verstopplek' && !gezien.includes(sleutel(g)))
      .sort((p, q) => T.pronkVan(q.soort) - T.pronkVan(p.soort))[0];
    if (nieuw) stops.push({ soort: 'nieuw', ...voor(nieuw), gebouw: nieuw });
    return stops;
  }

  // Wat hij op een plek ziet, en hoeveel argwaan dat hem geeft (nog zonder wat jij zegt).
  T.waarneming = function (S, stop) {
    const I = IN();
    const b = S.inner.bezoek;
    const boek = (S.rekenboek && S.rekenboek[b.jaar]) || null;
    const geteld = b.geteld;
    const opgegeven = boek ? boek.opgegeven : geteld;
    const reden = boek && I.redenen.find((r) => r.id === boek.reden);
    if (stop.soort === 'akkers') {
      const tekort = geteld > 0 ? Math.max(0, (geteld - opgegeven) / geteld) : 0;
      const geloof = reden ? reden.geloof : 1;
      const argwaan = tekort * I.argwaanPerTekort * (1 - geloof);
      const zegt = reden && reden.reden ? `, en dat ${reden.reden}` : '';
      return {
        argwaan,
        tekst: `Hij loopt langs de akkers en telt de stoppels: zo'n ${geteld} graan. In het rekenboek staat ${opgegeven}${zegt}.`,
      };
    }
    if (stop.soort === 'schuur') {
      const gezien = Math.floor(S.voorraad.graan || 0);
      const verwacht = Math.max(1, Math.round(opgegeven - b.gegetenSinds));
      let argwaan = 0;
      let oordeel = 'Het klopt ongeveer met het rekenboek.';
      if (gezien > verwacht * (1 + I.speling)) {
        argwaan = Math.min(40, ((gezien - verwacht) / verwacht) * I.argwaanPerOverschot);
        oordeel = 'Er ligt meer dan u opgaf.';
      } else if (gezien < verwacht * 0.5) {
        argwaan = I.argwaanTeWeinig;
        oordeel = 'Waar is de rest gebleven?';
      }
      return { argwaan, tekst: `In de schuur ligt ${gezien} graan. Hij had er zo'n ${verwacht} verwacht. ${oordeel}` };
    }
    // Iets nieuws, en rijk: past dat bij een dorp dat een slechte oogst opgaf?
    const g = T.GEBOUWEN[stop.gebouw.soort];
    const arm = opgegeven < geteld;
    const argwaan = arm ? T.pronkVan(stop.gebouw.soort) * I.argwaanPerPronk : 0;
    return {
      argwaan,
      tekst: arm
        ? `Hij bekijkt het nieuwe ${g.naam}. "Voor een dorp dat zo weinig oogstte, bouwt u flink."`
        : `Hij bekijkt het nieuwe ${g.naam}. "Mooi. De heer zal het graag horen."`,
    };
  };

  // Wat omkopen hem nu kost: meer naarmate hij argwaniger is, en elk jaar meer.
  T.omkoopPrijs = function (S) {
    const O = IN().omkopen;
    const I = inner(S);
    return Math.ceil((O.basis + I.argwaan * O.perArgwaan) * (1 + O.erbijPerKeer * I.omgekocht));
  };

  // Het bezoek begint: de route, zijn telling van de oogst, en wat er sinds het rekenboek gegeten is.
  T.beginBezoek = function (S, dag) {
    const I = inner(S);
    const jaar = jaarVan(dag);
    I.argwaan *= IN().vergeten; // een jaar later is hij wat vergeten, maar niet alles
    const echt = T.oogstVan(S, jaar);
    const geteld = Math.round(echt * (1 + IN().telFout * (hashTal(jaar, 7) * 2 - 1)));
    const sinds = Math.max(0, dag - dagVan(jaar, IN().rekenboek));
    const eten = (T.GEBOUWEN_INSTELLINGEN && T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag) || 0.05;
    I.bezoek = { jaar, dag, stops: routeVan(S), i: 0, geteld, gegetenSinds: (S.bevolking || 0) * eten * sinds, gevonden: [], afgeleid: 0, argwaanVoor: I.argwaan };
    I.komtOp = null;
    return I.bezoek;
  };

  // De dag van { maand, dag } in dit kalenderjaar, als speldag.
  function dagVan(jaar, doel) {
    const maand = T.MAANDEN.findIndex((m) => m.naam === doel.maand);
    const vanafLouw = (jaar - T.TIJD_START_JAAR) * T.DAGEN_PER_JAAR + maand * T.DAGEN_PER_MAAND + doel.dag - 1;
    return vanafLouw - T.TIJD_START_MAAND * T.DAGEN_PER_MAAND;
  }

  // Afleiden laat hem een plek overslaan, maar niet de akkers: daarvoor komt hij, en een akker kun je
  // niet voor hem verbergen. Kon het wel, dan kostte een lage opgave bijna niets meer (24 sep: de
  // helft opgeven gaf daar +52 argwaan, en afleiden maakte er +5 van).
  const NIET_VAN_DE_AKKERS = 'Van de akkers leid je hem niet weg: daarvoor is hij gekomen.';
  T.kanAfleiden = (stop) => !!stop && stop.soort !== 'akkers';

  // Jouw antwoord bij de plek waar hij nu staat: 'zwijgen', 'uitleggen', 'afleiden', 'omkopen', of
  // 'weg' (de schout was er niet bij). Daarna kijkt hij rond: een verstopplek dichtbij kan hij vinden.
  // Geeft { gelukt, reden } of { gelukt, argwaan, gevonden } terug.
  T.antwoord = function (S, keuze) {
    const I = inner(S);
    const B = I.bezoek;
    if (!B || B.i >= B.stops.length) return { gelukt: false, reden: 'De inner is er niet.' };
    const stop = B.stops[B.i];
    if (keuze === 'afleiden' && !T.kanAfleiden(stop)) return { gelukt: false, reden: NIET_VAN_DE_AKKERS };
    const w = T.waarneming(S, stop);
    const C = IN();
    let erbij = w.argwaan;
    if (keuze === 'omkopen') {
      const prijs = T.omkoopPrijs(S);
      if ((S.voorraad.goud || 0) < prijs) return { gelukt: false, reden: `Hij wil ${prijs} goud zien, en zoveel is er niet.` };
      T.wijzigVoorraad(S, 'goud', -prijs);
      I.omgekocht++;
      erbij -= C.omkopen.zakt;
    } else if (keuze === 'uitleggen') erbij *= 1 - C.uitleggen;
    else if (keuze === 'afleiden') {
      // Hij merkt dat je hem wegleidt, en de tweede keer beter dan de eerste.
      erbij = C.afleiden * (1 + B.afgeleid);
      B.afgeleid++;
    } else if (keuze === 'weg') erbij += C.wegblijven;
    I.argwaan = Math.max(0, Math.min(100, I.argwaan + erbij));
    const gevonden = keuze === 'afleiden' ? [] : zoekRond(S, stop, B.i);
    if (stop.gebouw) I.gezien.push(sleutel(stop.gebouw));
    B.i++;
    return { gelukt: true, argwaan: I.argwaan, gevonden };
  };

  // Kijkt hij om zich heen: een verstopplek binnen `straal` kan hij vinden. Wat erin zit, neemt hij
  // mee voor de heer.
  function zoekRond(S, stop, i) {
    const I = inner(S);
    const V = IN().vinden;
    const uit = [];
    for (const b of T.verstopplekken(S)) {
      if (T.afstand(b, stop) > V.straal + 1) continue;
      const inhoud = T.verstoptIn(S, b);
      if (!Object.keys(inhoud).length) continue; // een lege kuil valt niet op
      if (hashTal(I.bezoek.jaar, i, b.x, b.y) >= V.kans + I.argwaan * V.perArgwaan) continue;
      delete S.verstopt[sleutel(b)];
      I.argwaan = Math.min(100, I.argwaan + V.argwaan);
      I.bezoek.gevonden.push({ x: b.x, y: b.y, inhoud });
      uit.push(inhoud);
    }
    return uit;
  }

  // Het bezoek is voorbij: zijn rapport voor de heer (js/heer.js, T.aanslag, en de brief).
  T.eindeBezoek = function (S) {
    const I = inner(S);
    const B = I.bezoek;
    if (!B) return null;
    const boek = (S.rekenboek && S.rekenboek[B.jaar]) || null;
    I.rapport = {
      jaar: B.jaar,
      argwaan: I.argwaan,
      geteld: B.geteld,
      opgegeven: boek ? boek.opgegeven : B.geteld,
      gevonden: B.gevonden,
    };
    I.bezoek = null;
    return I.rapport;
  };

  // Het rapport van dit kalenderjaar, als de inner er al geweest is (js/heer.js, de brief).
  T.rapportVanDitJaar = function (S) {
    const r = S.inner && S.inner.rapport;
    return r && S.kalender && r.jaar === jaarVan(S.kalender.dag) ? r : null;
  };

  // Hoe argwanend, in woorden (voor de balk en de brief).
  T.argwaanWoord = (a) => (a < 25 ? 'weinig' : a < 50 ? 'enige' : a < 75 ? 'veel' : 'grote');

  // ---------------------------------------------------------------------------------------------
  // De dagen
  // ---------------------------------------------------------------------------------------------

  // Eén dag: het rekenboek, de aankondiging, en het bezoek. Alleen in een dorp met mensen.
  T.tikInnerDag = function (S, dag) {
    if (!(S.bevolking > 0) || !T.datumVanDag || !T.dagenTot) return;
    const I = inner(S);
    const C = IN();
    if (S.heer && S.heer.afgezet) return;
    const jaar = jaarVan(dag);
    if (T.dagenTot(dag, C.rekenboek) === 0 && !(S.rekenboek && S.rekenboek[jaar])) {
      if (T.ui && T.ui.vraag) vraagRekenboek(S, jaar);
      else T.schrijfOp(S, 'alles', jaar);
    }
    if (T.dagenTot(dag, C.aankondiging) === 0) {
      I.komtOp = dag + T.dagenTot(dag, C.bezoek);
      bericht(`De inner van de heer komt over ${I.komtOp - dag} dagen. Hij telt, hij kijkt, en hij onthoudt.`, 'gevaar');
    }
    if (T.dagenTot(dag, C.bezoek) === 0 && !I.bezoek && !(I.rapport && I.rapport.jaar === jaar)) {
      T.beginBezoek(S, dag);
      // Zonder scherm (een toets): in één keer rond, en de schout zwijgt overal.
      if (!(T.ui && T.ui.vraag)) {
        while (I.bezoek.i < I.bezoek.stops.length) T.antwoord(S, 'zwijgen');
        T.eindeBezoek(S);
      }
    }
  };

  function vraagRekenboek(S, jaar) {
    const echt = T.oogstVan(S, jaar);
    T.ui.vraag({
      sleutel: 'rekenboek',
      pauze: true,
      kop: 'Het rekenboek',
      tekst: `De oogst is binnen: ${echt} graan. Wat schrijf je op voor de heer? Het echte getal houd je zelf bij. Wat je minder opgeeft, moet je verstoppen, en de inner komt tellen.`,
      keuzes: IN().redenen.map((r) => ({
        tekst: `${r.knop} (${Math.round(echt * r.deel)})`,
        doe: () => {
          T.schrijfOp(S, r.id, jaar);
          return { gelukt: true };
        },
      })),
    });
  }

  // ---------------------------------------------------------------------------------------------
  // Het poppetje: het dorp in, van plek naar plek, bij elke plek een vraag, en weer weg
  // ---------------------------------------------------------------------------------------------

  function vrijeTegelBij(w, p) {
    for (let r = 0; r < 8; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (T.isBegaanbaar(w, p.x + dx, p.y + dy, { wezensBlokkeren: true })) return { x: p.x + dx, y: p.y + dy };
        }
      }
    }
    return null;
  }
  const ingang = (w) => {
    const o = (w.overgangen || [])[0];
    return o ? { x: o.x, y: o.y } : { x: w.b - 1, y: Math.floor(w.h / 2) };
  };
  function stuurNaar(S, e, doel) {
    const w = S.wereld;
    if (e.volgendePoging && S.tijd < e.volgendePoging) return;
    e.volgendePoging = S.tijd + 1;
    e.pad =
      T.zoekPad({ x: e.tx, y: e.ty }, doel, (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e }), (x, y) => T.isVast(w, x, y), {}) || [];
  }

  // Elk beeld (js/main.js). Zolang hij rondloopt, staat de kalender stil.
  T.werkInnerBij = function (S) {
    // Het paneel van een verstopplek gaat dicht als de schout wegloopt: verstoppen doe je ter plekke.
    const open = T.ui && T.ui.verstopOpen && T.ui.verstopOpen();
    if (open && S.held && T.afstand({ x: S.held.tx, y: S.held.ty }, open) > 4) T.ui.sluitVerstop();
    const I = S.inner;
    const w = S.wereld;
    if (!I || !w || !w.wezens) return;
    const B = I.bezoek;
    if (B && !I.pop) {
      const start = vrijeTegelBij(w, ingang(w));
      if (!start) return;
      const e = T.maakDorpeling(21, start.x, start.y, 0);
      e.soort = 'inner';
      e.naam = 'de inner';
      e.vel = 'dorpsoudste'; // tot hij een eigen vel heeft: een ernstige man
      e.dwaalt = false;
      w.wezens.push(e);
      I.pop = e;
      I.snelheidVoor = S.kalender.snelheid;
      if (S.kalender.snelheid > 0) T.zetSnelheid(S, 0);
      bericht('De inner is er. Loop met hem mee: wie er niet bij is, laat hem alleen kijken.', 'gevaar');
    }
    const e = I.pop;
    if (!e) return;
    if (!w.wezens.includes(e)) {
      I.pop = null;
      return;
    }
    if (B) {
      if (I.wachtOpAntwoord) return;
      if (B.i >= B.stops.length) {
        T.eindeBezoek(S);
        bericht(`De inner vertrekt. Hij heeft ${T.argwaanWoord(I.argwaan)} argwaan, en alles opgeschreven.`, I.argwaan < 50 ? 'rust' : 'gevaar');
        return;
      }
      const stop = B.stops[B.i];
      if (e.doelVoor !== B.i) {
        e.doel = vrijeTegelBij(w, stop);
        e.doelVoor = B.i;
      }
      const doel = e.doel;
      if (!doel) {
        T.antwoord(S, 'weg');
        return;
      }
      if (T.afstand({ x: e.tx, y: e.ty }, doel) > 1) {
        if (!e.pad.length) stuurNaar(S, e, doel);
        e.aangekomen = null;
        return;
      }
      // Aangekomen: is de schout erbij? Dan vraagt hij iets; anders wacht hij even, en kijkt alleen.
      if (e.aangekomen == null) e.aangekomen = S.tijd;
      const schoutErbij = S.held && T.afstand({ x: S.held.tx, y: S.held.ty }, { x: e.tx, y: e.ty }) <= 4;
      if (schoutErbij && T.ui && T.ui.vraag) {
        I.wachtOpAntwoord = true;
        vraagBijPlek(S, stop);
      } else if (S.tijd - e.aangekomen > IN().wachten) {
        const r = T.antwoord(S, 'weg');
        meldGevonden(r);
        bericht('De inner keek alleen rond. Niemand zei iets, en dat viel hem op.', 'gevaar');
        e.aangekomen = null;
      }
      return;
    }
    // Het bezoek is voorbij: terug naar de weg, en daar verdwijnt hij; de kalender loopt weer.
    const uit = vrijeTegelBij(w, ingang(w)) || ingang(w);
    if (T.afstand({ x: e.tx, y: e.ty }, uit) <= 1 && !e.pad.length) {
      w.wezens.splice(w.wezens.indexOf(e), 1);
      I.pop = null;
      if (I.snelheidVoor > 0 && S.kalender.snelheid === 0) T.zetSnelheid(S, I.snelheidVoor);
      return;
    }
    if (!e.pad.length) stuurNaar(S, e, uit);
  };

  function meldGevonden(r) {
    for (const inhoud of (r && r.gevonden) || []) {
      const wat = Object.entries(inhoud).map(([g, n]) => `${n} ${g}`).join(', ');
      bericht(`De inner vindt een verstopplek: ${wat}. Hij neemt het mee voor de heer, en schrijft het op.`, 'gevaar');
    }
  }

  function vraagBijPlek(S, stop) {
    const w = T.waarneming(S, stop);
    const prijs = T.omkoopPrijs(S);
    const klaar = (keuze) => () => {
      const r = T.antwoord(S, keuze);
      if (!r.gelukt) return r;
      S.inner.wachtOpAntwoord = false;
      meldGevonden(r);
      return r;
    };
    T.ui.vraag({
      sleutel: 'inner',
      kop: 'De inner',
      tekst: w.tekst,
      keuzes: [
        { tekst: 'Uitleggen', doe: klaar('uitleggen') },
        { tekst: 'Afleiden', kan: () => T.kanAfleiden(stop), waarom: NIET_VAN_DE_AKKERS, doe: klaar('afleiden') },
        { tekst: `Omkopen (${prijs} goud)`, kan: () => (S.voorraad.goud || 0) >= prijs, waarom: 'Zoveel goud is er niet.', doe: klaar('omkopen') },
        { tekst: 'Zwijgen', doe: klaar('zwijgen') },
      ],
    });
  }
})(globalThis.Toren = globalThis.Toren || {});
