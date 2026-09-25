// De akkers: welk stadium het graan heeft op welke dag, hoe de wind per tegel waait, welke vaste
// variant een tegel krijgt, en hoe een boer op en rond zijn eigen akker werkt. Net als js/quest.js
// en js/pad.js zijn dit regels zonder scherm, dus te toetsen (test/akkers.test.cjs). Alleen voor
// het nieuwe spel (?kaart=gehucht, ontwerp/spel.md, "Het eerste proefje"); het getekende gebruik
// staat in js/tekenen.js, het lopen/maaien in js/verkennen.js (T.laatDwalen) en js/main.js. Sinds
// Sint-Maarten (24 sep, ontwerp/spel.md) ook: zaaien kost graan, en wat niet gezaaid kan worden,
// blijft dat jaar ongezaaid (T.zaaiAkkers, T.tikAkkersDag onderaan). Sinds de weides (25 sep,
// ontwerp/spel.md, "Weides met koeien en schapen", stap 1) is elk veld akker, weide of braak, met
// een plan voor volgend jaar en een vruchtbaarheid: zie "Velden" hieronder.
(function (T) {
  'use strict';

  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);

  // Eén tabel, één plek: wanneer welk stadium begint (ontwerp/werklijst.md, punt 1b, "Eén tabel
  // op één plek ... zodat Marcel het makkelijk kan bijstellen"). "gemaaid" dekt ook de stoppels
  // erna: er is geen apart stadium voor, het graan.cjs-vel kent er ook geen. Cyclisch: wat na de
  // laatste ingang komt, geldt tot de eerste ingang van het volgende jaar (zie T.akkerStadium).
  T.AKKER_STADIA = [
    { maand: maandIdx('lentemaand'), dag: 1, stadium: 'geploegd' }, // vroege lente: net geploegd
    { maand: maandIdx('lentemaand'), dag: 11, stadium: 'kiemend' },
    { maand: maandIdx('bloeimaand'), dag: 1, stadium: 'groen' },
    { maand: maandIdx('hooimaand'), dag: 1, stadium: 'rijp' }, // "rijp in hooi- en oogstmaand"
    { maand: maandIdx('herfstmaand'), dag: 1, stadium: 'gemaaid' }, // vangnet: zie T.haalOogstBinnen
  ];

  const dagInJaar = (maand, dag) => maand * T.DAGEN_PER_MAAND + (dag - 1);

  // Een tegel als sleutel in akker.geoogst en akker.ongezaaid (allebei een Set van "x,y").
  //
  // akker.ongezaaid heette tot 25 sep akker.braak: de tegels van een akker waarvoor op 1 lentemaand
  // geen zaaigraan was. Sinds de weides is "braak" een bestemming van een heel veld, dat rust omdat
  // jij het zo koos (T.bestemmingVan hieronder). Twee dingen met één naam liepen door elkaar, dus
  // heet het tekort nu naar wat het is: niet gezaaid.
  const sleutel = (x, y) => x + ',' + y;
  const ongezaaidOp = (akker, x, y) => !!(akker.ongezaaid && akker.ongezaaid.has(sleutel(x, y)));

  // ---------------------------------------------------------------------------------------------
  // Velden: akker, weide of braak (Marcel, 25 sep 2026; ontwerp/spel.md, "Weides met koeien en
  // schapen", stap 1). Elk veld uit het betekenisbestand (js/kaart.js, w.akkers) heeft:
  //   bestemming      wat het dit jaar is: 'akker' (gezaaid en gemaaid), 'weide' (vee graast
  //                   erop, js/vee.js) of 'braak' (het rust);
  //   plan            wat het volgend jaar wordt. De speler kiest het (T.zetPlan), en op 1
  //                   lentemaand wordt het de bestemming (T.wisselVelden), vóór het zaaien. Staand
  //                   graan vertrappen of midden in de zomer zaaien kan dus niet.
  //   vruchtbaarheid  0..1: een akker geeft zijn graan maal dit getal (T.oogstPerTegel).
  // De lijst heet nog w.akkers, zoals vóór 25 sep: de oogst, de inner en de heer kennen hem onder
  // die naam. Een veld zonder bestemming is een akker, zoals elk veld tot 25 sep.
  // ---------------------------------------------------------------------------------------------

  T.BESTEMMINGEN = ['akker', 'weide', 'braak'];

  // Alle getallen van de velden in één blok (ook in de werkbank van de spelregels, js/opties.js).
  // Een eerste gok, uit het voorstel dat Marcel op 25 sep koos.
  T.VELDEN_INSTELLINGEN = {
    // Of het land uitput: een optie in de spelregels ("Vruchtbaarheid"). Uit: elk veld geeft altijd
    // zijn volle graan, en de vruchtbaarheid blijft staan waar hij stond.
    vruchtbaarheid: true,
    // Waar een veld mee begint: vol, zoals elke akker tot 25 sep gaf.
    beginVruchtbaarheid: 1,
    // Op 1 lentemaand, naar wat het veld het jaar ervoor was: een akker put uit, een braak rust, en
    // een weide wordt door het vee gemest (het drieslagstelsel van toen). Zo houdt akker, akker,
    // weide het land vruchtbaar (−0,10 −0,10 +0,20), en akker, akker, braak nét niet (−0,05 per
    // drie jaar).
    akkerPutUit: 0.1,
    braakRust: 0.15,
    weideMest: 0.2,
    // Nooit lager dan dit, en nooit hoger dan 1. Marcel (25 sep): tot 40%. Een uitgeputte akker geeft
    // nog 40% van een volle oogst: wisselen loont, maar vergeten is niet meteen honger.
    laagste: 0.4,
  };
  const VIN = () => T.VELDEN_INSTELLINGEN;

  // Wat een veld dit jaar is, en wat het volgend jaar wordt. Zonder (of met een onbekende)
  // bestemming een akker, en zonder plan blijft het wat het is.
  T.bestemmingVan = (veld) => (veld && T.BESTEMMINGEN.includes(veld.bestemming) ? veld.bestemming : 'akker');
  T.planVan = (veld) => (veld && T.BESTEMMINGEN.includes(veld.plan) ? veld.plan : T.bestemmingVan(veld));
  const isAkker = (veld) => T.bestemmingVan(veld) === 'akker';

  // De vruchtbaarheid die telt: die van het veld, of 1 als het land niet uitput (de optie).
  T.vruchtbaarheidVan = function (veld) {
    if (!VIN().vruchtbaarheid) return 1;
    return veld && typeof veld.vruchtbaarheid === 'number' ? veld.vruchtbaarheid : VIN().beginVruchtbaarheid;
  };

  // Welk veld ligt op tegel (x, y)? Voor een klik op een veld (het venster), of null.
  T.veldOp = function (w, x, y) {
    return ((w && w.akkers) || []).find((a) => x >= a.x && x < a.x + a.b && y >= a.y && y < a.y + a.h) || null;
  };

  // Mag dit veld volgend jaar `bestemming` worden? { kan, reden }: de knop in het venster en de
  // melding lezen hetzelfde antwoord (CLAUDE.md, "Scherm en klik stellen dezelfde vraag"). Het plan
  // mag het hele jaar door veranderen; het gaat pas in op 1 lentemaand. Wordt een weide iets anders,
  // dan moet zijn vee volgend jaar ergens heen: kan dat nergens, dan niet (js/vee.js, T.plaatsVoorVee,
  // met de reden erbij). Zonder vee (of zonder js/vee.js) is er niets om op te letten.
  T.kanBestemming = function (S, veld, bestemming) {
    if (!veld) return { kan: false, reden: 'Daar ligt geen veld.' };
    if (!T.BESTEMMINGEN.includes(bestemming)) return { kan: false, reden: 'Een veld is akker, weide of braak.' };
    if (T.planVan(veld) === bestemming) return { kan: false, reden: `Het wordt volgend jaar al ${bestemming}.` };
    if (T.planVan(veld) === 'weide' && T.plaatsVoorVee) {
      const plaats = T.plaatsVoorVee(S, (v) => (v === veld ? bestemming : T.planVan(v)));
      if (!plaats.past) return { kan: false, reden: plaats.reden };
    }
    return { kan: true, reden: null };
  };

  // Het plan zetten, na dezelfde vraag. Geeft hetzelfde antwoord als T.kanBestemming.
  T.zetPlan = function (S, veld, bestemming) {
    const r = T.kanBestemming(S, veld, bestemming);
    if (r.kan) veld.plan = bestemming;
    return r;
  };

  // De jaarwissel van de velden, op 1 lentemaand vóór het zaaien (T.tikAkkersDag onderaan): eerst
  // verandert de vruchtbaarheid naar wat elk veld het afgelopen jaar was, dan wordt het plan de
  // bestemming, en dan verhuist het vee van een veld dat geen weide meer is naar een weide met
  // plaats (js/vee.js, T.verhuisVee).
  //
  // Is er volgend jaar geen enkele weide meer terwijl er wel vee is (dat laat T.kanBestemming niet
  // toe, maar een plan kan er ook buiten om komen), dan blijven de weides met vee weide: het vee
  // verdwijnt niet omdat een plan niet klopte. Geeft [{ veld, was, wordt, vruchtbaarheid }].
  T.wisselVelden = function (S) {
    const w = S.wereld;
    if (!w || !w.akkers) return [];
    const IN = VIN();
    const vee = T.veeVan ? T.veeVan(S) : [];
    if (vee.length && !w.akkers.some((v) => T.planVan(v) === 'weide')) {
      for (const v of w.akkers) if (vee.some((e) => e.weide === v)) v.plan = 'weide';
      if (T.ui && T.ui.bericht) T.ui.bericht('Er zou geen weide meer zijn, maar het vee moet ergens grazen: de weide blijft weide.', 'gevaar');
    }
    const verslag = [];
    for (const v of w.akkers) {
      const was = T.bestemmingVan(v);
      if (IN.vruchtbaarheid) {
        const erbij = was === 'akker' ? -IN.akkerPutUit : was === 'braak' ? IN.braakRust : IN.weideMest;
        const nu = typeof v.vruchtbaarheid === 'number' ? v.vruchtbaarheid : IN.beginVruchtbaarheid;
        // Afgerond, zodat 0,8 geen 0,7999999 wordt in het venster.
        v.vruchtbaarheid = Math.round(Math.min(1, Math.max(IN.laagste, nu + erbij)) * 1e6) / 1e6;
      }
      v.bestemming = T.planVan(v);
      v.plan = v.bestemming;
      verslag.push({ veld: v, was, wordt: v.bestemming, vruchtbaarheid: v.vruchtbaarheid });
    }
    if (T.verhuisVee) T.verhuisVee(S);
    return verslag;
  };

  // Welk stadium hoort van nature bij deze datum? Dit is het stadium vóórdat een boer ook maar
  // iets deed: tijdens "rijp" bepaalt T.werkOogstBij per tegel of hij al gemaaid is (hij maait
  // vóór het vangnet hierboven aanslaat), en een tegel die niet gezaaid is, groeit niet; zie
  // T.akkerTegelStadium.
  T.akkerStadium = function (maand, dagVanMaand) {
    const nu = dagInJaar(maand, dagVanMaand);
    let gekozen = T.AKKER_STADIA[T.AKKER_STADIA.length - 1].stadium;
    for (const g of T.AKKER_STADIA) {
      if (dagInJaar(g.maand, g.dag) <= nu) gekozen = g.stadium;
    }
    return gekozen;
  };

  // Welke van de N geplante varianten staat er op tegel (x, y)? Vast per tegel (geen geflikker,
  // ontwerp/werklijst.md punt 1b, punt 2) en zonder Math.random, dus hetzelfde bij elke herlaad.
  T.akkerVariant = function (x, y, aantal) {
    if (!aantal) return 0;
    const h = ((x * 374761393 + y * 668265263) ^ (x * 2654435761)) >>> 0;
    return h % aantal;
  };

  // Het windbeeld (0..7) op tegel (x, y), op speeltijd `tijd` (S.tijd, niet de kalender — de wind
  // waait door, ook als het spel stilstaat of het jaar versnelt). Dezelfde vorm als de opdracht
  // 'm geeft: beeld = (tijd·snelheid + x·a + y·b) mod 8. De akkers in het gehucht liggen lang in
  // de y-richting (b=2..3, h=14), dus de golf rolt overlangs (WIND_GOLF_Y); WIND_GOLF_X blijft 0
  // zodat de twee/drie tegels breedte niet los van elkaar knipperen.
  T.WIND_GOLF_TIJD = 1.6; // beelden per seconde: hoe snel de halmen zelf zwaaien
  T.WIND_GOLF_X = 0;
  T.WIND_GOLF_Y = 1; // faseverschuiving per tegel in y, in beelden: één volle golf per 8 tegels
  T.windBeeld = function (tijd, x, y) {
    const t = tijd * T.WIND_GOLF_TIJD + x * T.WIND_GOLF_X + y * T.WIND_GOLF_Y;
    return ((Math.floor(t) % 8) + 8) % 8;
  };

  // Waar dwaalt deze boer nu rond? In het groeiseizoen (kiemend, groen, rijp) op en rond zijn
  // eigen akker (ontwerp/werklijst.md punt 1b, punt 5); anders (geploegd, of het veld is al
  // gemaaid) gewoon bij zijn huis, zoals elke dwalende dorpeling. `e.werkAkkers` komt van
  // T.laadKaart (js/kaart.js): de akkers waarvan `huis` gelijk is aan het `huis` van deze mens.
  // Heeft hij er meer dan één (boer1 en boer3 hebben ook nog een klein stuk onder de es), dan
  // telt voorlopig alleen de eerste mee voor het dwalen — de tweede telt wel gewoon mee voor de
  // groei en de oogst hieronder, hij loopt er alleen niet expliciet naartoe om te dwalen.
  //
  // Moet hij even ergens anders zijn (`moetNaar`: aan de schandpaal op de brink, js/heer.js), dan
  // gaat dat voor alles. Een weide of braak is geen akker om bij te staan: hij neemt de eerste van
  // zijn velden die dit jaar akker is.
  T.wandelAnker = function (e, stadium) {
    if (e.moetNaar) return e.moetNaar;
    const a = e.werkAkkers && e.werkAkkers.find(isAkker);
    if (a && (stadium === 'kiemend' || stadium === 'groen' || stadium === 'rijp')) {
      return { x: a.x + (a.b - 1) / 2, y: a.y + (a.h - 1) / 2, straal: Math.max(a.b, a.h) / 2 + 1 };
    }
    return e.thuis ? { x: e.thuis.x, y: e.thuis.y, straal: e.straal || 3 } : null;
  };

  // Het stadium van precies deze tegel, met de oogst van deze boer erin verrekend: zolang het
  // hele veld nog "rijp" heet, kan een deel al gemaaid zijn omdat T.werkOogstBij daar al langs
  // kwam. Ná het vangnet (basisStadium 'gemaaid') is toch alles gemaaid, dus dan doet het er niet
  // meer toe wat er in `geoogst` staat.
  //
  // Wat dit jaar niet gezaaid is (T.zaaiAkkers hieronder), groeit ook niet: dat blijft het hele
  // jaar kale, geploegde grond. Een weide is 'weide' (gras, met vee erop: js/vee.js), en een braak
  // 'geploegd', tot er een eigen tekening voor braakland is (onkruid); dat is tekenwerk. Zo vraagt
  // js/tekenen.js het per tegel, en hoeft het zelf niets van bestemmingen te weten.
  T.akkerTegelStadium = function (akker, x, y, basisStadium) {
    const bestemming = T.bestemmingVan(akker);
    if (bestemming === 'weide') return 'weide';
    if (bestemming === 'braak' || ongezaaidOp(akker, x, y)) return 'geploegd';
    if (basisStadium === 'rijp' && akker.geoogst && akker.geoogst.has(sleutel(x, y))) return 'gemaaid';
    return basisStadium;
  };

  // Alle tegels van een akker, als lijst {x, y} — voor het zoeken naar de dichtstbijzijnde
  // ongemaaide tegel hieronder, en te toetsen zonder een hele wereld te hoeven opbouwen.
  T.akkerTegels = function (akker) {
    const lijst = [];
    for (let dy = 0; dy < akker.h; dy++) {
      for (let dx = 0; dx < akker.b; dx++) lijst.push({ x: akker.x + dx, y: akker.y + dy });
    }
    return lijst;
  };

  // Hoelang een boer over één tegel doet: iets langer dan één zwaai van de zeis (maaier.cjs:
  // MAAIER_BEELDEN/MAAIER_FPS = 12/8 = 1,5s), zodat de hele slag minstens één keer te zien is.
  // In speeltijd (S.tijd, wall-clock), niet in kalenderdagen — zie ook de opmerking bij T.windBeeld.
  T.OOGST_TEGEL_DUUR = 1.6;

  // Wat één gemaaide tegel oplevert, in S.voorraad.graan, en wat hij aan zaaigraan kost (op 1
  // lentemaand, T.zaaiAkkers hieronder). Maaien is de enige weg waarlangs graan binnenkomt: de
  // boerderij maakt het niet zelf (js/gebouwen.js), anders telde het dubbel. Sinds 25 sep maal de
  // vruchtbaarheid van het veld (T.oogstPerTegel): dit is wat een volle akker geeft.
  //
  // Ter ijking (Marcel koos op 24 sep 2026 "honger", ontwerp/spel.md, "Sint-Maarten"): de akkers
  // van het gehucht zijn 209 tegels, dus 731 graan per jaar. Zaaien kost er 209, de pacht van de
  // heer 105 (js/heer.js), en 25 mensen eten er 450 (T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag).
  // Wie de heer alles in graan geeft, komt dus zo'n 30 tekort; wie de pacht inhoudt, houdt er zo'n
  // 70 over. Bij 3 graan per tegel was er ook honger als je de heer niets gaf, en dan is bedriegen
  // geen uitweg meer, alleen ellende. Tot 24 sep was het 2, zonder zaaien en zonder heer.
  T.GRAAN_PER_TEGEL = 3.5;
  T.ZAAIGRAAN_PER_TEGEL = 1;

  // Wat een boer kan (js/boeren.js: maaien, opbrengst, zaaien), als factor; 1 zonder dat bestand
  // of voor wie gewoon is.
  const factor = (e, soort) => (e && T.boerFactor ? T.boerFactor(e, soort) : 1);

  // Wat één gemaaide tegel van dit veld oplevert: T.GRAAN_PER_TEGEL, maal de vruchtbaarheid van het
  // veld, maal wat zijn boer kan (groene vingers of slordig). Het maaien (T.werkOogstBij), het
  // vangnet (T.haalOogstBinnen) en de inner die schat wat er staat (js/inner.js, zonder boer) vragen
  // het allemaal hier, zodat het nergens anders uitkomt.
  T.oogstPerTegel = (veld, boer) => T.GRAAN_PER_TEGEL * T.vruchtbaarheidVan(veld) * factor(boer, 'opbrengst');

  // De tegels van een akker die nog te maaien zijn: gezaaid, en nog niet gemaaid. Een weide of
  // braak heeft er geen.
  function onbeslistTegels(akker) {
    const open = [];
    if (!isAkker(akker)) return open;
    for (const t of T.akkerTegels(akker)) {
      if (ongezaaidOp(akker, t.x, t.y)) continue; // wat niet gezaaid is, valt ook niet te maaien
      if (!akker.geoogst || !akker.geoogst.has(sleutel(t.x, t.y))) open.push(t);
    }
    return open;
  }
  T.akkerOnbeslistTegels = onbeslistTegels; // ook voor test/akkers.test.cjs

  // Eén stap oogsten, voor elke boer met een akker. Vóór T.laatDwalen aanroepen (js/main.js): wie
  // hier een pad krijgt of aan het maaien is, slaat T.laatDwalen dan vanzelf over (dezelfde
  // voorwaarde `m.pad.length`, plus `m.maait` — zie de aanpassing in js/verkennen.js).
  //
  // Buiten "rijp" gebeurt hier niets (T.wandelAnker regelt dan het gewone dwalen). Wat er na de
  // oogsttijd nog staat, halen de boeren in één keer binnen (T.haalOogstBinnen, op de dag zelf via
  // T.tikAkkersDag); het maaien hier stopt dan vanzelf.
  //
  // Een boer maait al zijn akkers, steeds de tegel die het dichtstbij staat. Tot 24 sep maaide hij
  // alleen de eerste (e.werkAkkers[0]), en rotte het stuk onder de es van boer 1 en boer 3 op het
  // veld: 55 van de 209 tegels.
  T.werkOogstBij = function (S, dt) {
    const w = S.wereld;
    if (!w.akkers || !w.akkers.length) return;
    const datum = T.datumVanDag(S.kalender.dag);
    const basis = T.akkerStadium(datum.maand, datum.dagVanMaand);
    for (const e of w.wezens) {
      if (e.dood || !e.werkAkkers || !e.werkAkkers.length) continue;
      for (const a of e.werkAkkers) if (!a.geoogst) a.geoogst = new Set();
      if (basis !== 'rijp') {
        if (basis === 'geploegd') for (const a of e.werkAkkers) a.geoogst.clear(); // nieuw jaar, weer vers
        e.maait = null;
        e.oogstDoel = null;
        continue;
      }
      if (e.maait) {
        if (S.tijd >= e.maait.tot) {
          e.maait.akker.geoogst.add(sleutel(e.maait.x, e.maait.y));
          if (S.voorraad && T.wijzigVoorraad) T.wijzigVoorraad(S, 'graan', T.oogstPerTegel(e.maait.akker, e));
          e.maait = null;
          e.oogstDoel = null;
        }
        continue;
      }
      if (e.pad && e.pad.length) continue; // onderweg naar zijn doel
      if (e.oogstDoel && e.tx === e.oogstDoel.x && e.ty === e.oogstDoel.y) {
        e.maait = { x: e.tx, y: e.ty, tot: S.tijd + T.OOGST_TEGEL_DUUR * factor(e, 'maaien'), akker: e.oogstDoel.akker };
        continue;
      }
      let doel = null;
      let beste = Infinity;
      for (const a of e.werkAkkers) {
        for (const t of onbeslistTegels(a)) {
          const d = T.afstand({ x: e.tx, y: e.ty }, t);
          if (d < beste) {
            beste = d;
            doel = { x: t.x, y: t.y, akker: a };
          }
        }
      }
      if (!doel) {
        e.oogstDoel = null;
        continue;
      }
      // Staat hij er al (in het groeiseizoen dwaalt hij over zijn akker), dan maait hij meteen.
      // T.zoekPad geeft dan een leeg pad, en tot 25 sep las dit dat als "niet te bereiken": een boer
      // die bij het begin van de oogst op zijn eigen graan stond, begon niet, tot hij er toevallig af
      // dwaalde. De proef van de weides (drie jaar zonder dwalen) liep daardoor twee oogsten mis.
      if (doel.x === e.tx && doel.y === e.ty) {
        e.oogstDoel = doel;
        e.maait = { x: e.tx, y: e.ty, tot: S.tijd + T.OOGST_TEGEL_DUUR * factor(e, 'maaien'), akker: doel.akker };
        continue;
      }
      const pad = T.zoekPad(
        { x: e.tx, y: e.ty },
        doel,
        (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e }),
        (x, y) => T.isVast(w, x, y),
        {},
      );
      if (pad && pad.length) {
        e.pad = pad;
        e.oogstDoel = doel;
      } else {
        e.oogstDoel = null; // niet te bereiken, volgende beurt opnieuw proberen
      }
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Per dag: zaaien op 1 lentemaand, en het vangnet na de oogsttijd. T.tikGebouwenDag
  // (js/gebouwen.js, stap 0) roept T.tikAkkersDag één keer per verstreken kalenderdag aan, net als
  // T.tikBehoeftenDag, dus een kalender die vooruitspringt slaat geen van beide over.
  // ---------------------------------------------------------------------------------------------

  // Wie werkt deze akker? Een levende boer die hem in zijn werkAkkers heeft (js/kaart.js), of null.
  // T.boerVanVeld is dezelfde vraag voor het venster van een veld: van wie is het?
  function boerVan(w, akker) {
    return (w.wezens || []).find((e) => !e.dood && e.werkAkkers && e.werkAkkers.includes(akker)) || null;
  }
  T.boerVanVeld = (S, veld) => (S && S.wereld ? boerVan(S.wereld, veld) : null);

  // Het vangnet (Marcel, 24 sep; ontwerp/spel.md, "Sint-Maarten"): wat op de eerste dag na de
  // oogsttijd nog op het veld staat, halen de boeren alsnog in één keer binnen. Tot 24 sep rotte
  // dat. Omdat het maaien op de klok van het scherm loopt (T.OOGST_TEGEL_DUUR, S.tijd) en de
  // kalender niet, rotte er op 3× veel meer: wie snel speelde, verloor graan zonder het te weten.
  // Nu bepaalt de snelheid alleen nog wánneer het graan binnenkomt, niet hoeveel. Een akker zonder
  // boer rot nog wel: er is niemand om hem binnen te halen. Geeft het aantal tegels terug.
  T.haalOogstBinnen = function (S) {
    const w = S.wereld;
    if (!w || !w.akkers) return 0;
    let tegels = 0;
    let graan = 0;
    for (const akker of w.akkers) {
      const boer = boerVan(w, akker);
      if (!boer) continue;
      if (!akker.geoogst) akker.geoogst = new Set();
      for (const t of onbeslistTegels(akker)) {
        akker.geoogst.add(sleutel(t.x, t.y));
        tegels++;
        graan += T.oogstPerTegel(akker, boer); // vruchtbaar of uitgeput, groene vingers of slordig
      }
    }
    if (tegels && S.voorraad && T.wijzigVoorraad) {
      T.wijzigVoorraad(S, 'graan', graan);
      if (T.ui && T.ui.bericht) T.ui.bericht(`De boeren halen de rest van de oogst binnen: ${Math.round(graan)} graan.`, 'goed');
    }
    return tegels;
  };

  // Zaaien (Marcel, 24 sep: "zaaigoed telt"; ontwerp/spel.md, "Sint-Maarten"): elke akkertegel
  // kost T.ZAAIGRAAN_PER_TEGEL graan uit de voorraad. Wat je de heer gaf, kun je dus niet meer
  // zaaien. Is er te weinig, dan wordt er gezaaid wat kan, naar rato verdeeld over alle akkers
  // (elk gezin een deel), en blijft de rest dit jaar ongezaaid: hij groeit niet, wordt niet gemaaid,
  // en tekent als kale grond (T.akkerTegelStadium). Het ongezaaide stuk is het verste stuk van elke
  // akker, want T.akkerTegels telt vanaf zijn hoek. Alleen wat dit jaar akker is, wordt gezaaid en
  // kost zaaigraan: een weide of braak niet (25 sep). Geeft { tegels, gezaaid, ongezaaid, graan }.
  T.zaaiAkkers = function (S) {
    const w = S.wereld;
    if (!w || !w.akkers || !w.akkers.length) return null;
    // Een nieuw jaar, voor elk veld: de oogst van vorig jaar is vergeten.
    for (const a of w.akkers) {
      a.ongezaaid = new Set();
      if (a.geoogst) a.geoogst.clear();
    }
    const akkers = w.akkers.filter(isAkker);
    // Wat een tegel aan zaaigraan kost, per akker: een zuinige boer zaait met minder, een kwistige
    // met meer (js/boeren.js).
    const per = akkers.map((a) => T.ZAAIGRAAN_PER_TEGEL * factor(boerVan(w, a), 'zaaien'));
    const maat = akkers.map((a) => a.b * a.h);
    const totaal = maat.reduce((n, m) => n + m, 0);
    const nodig = maat.reduce((n, m, i) => n + m * per[i], 0);
    const heb = (S.voorraad && S.voorraad.graan) || 0;
    // Elke akker zijn deel, naar beneden afgerond; wat er dan nog over is, hooguit één tegel per
    // akker erbij, op volgorde, zolang het graan het toelaat.
    const deel = nodig > 0 ? Math.min(1, heb / nodig) : 1;
    const gezaaid = maat.map((m) => Math.floor(m * deel + 1e-9));
    let kost = gezaaid.reduce((n, g, i) => n + g * per[i], 0);
    for (let i = 0; i < maat.length; i++) {
      if (gezaaid[i] < maat[i] && kost + per[i] <= heb + 1e-9) {
        gezaaid[i]++;
        kost += per[i];
      }
    }
    const kan = gezaaid.reduce((n, g) => n + g, 0);
    akkers.forEach((a, i) => {
      T.akkerTegels(a).forEach((t, j) => {
        if (j >= gezaaid[i]) a.ongezaaid.add(sleutel(t.x, t.y));
      });
    });
    if (kost > 0 && S.voorraad && T.wijzigVoorraad) T.wijzigVoorraad(S, 'graan', -kost);
    if (T.ui && T.ui.bericht && totaal > 0) {
      if (kan < totaal) {
        T.ui.bericht(`Er is zaaigraan voor ${kan} van de ${totaal} akkertegels. De rest blijft dit jaar ongezaaid.`, 'gevaar');
      } else {
        T.ui.bericht(`De boeren zaaien: ${Math.round(kost)} graan gaat de grond in.`);
      }
    }
    return { tegels: totaal, gezaaid: kan, ongezaaid: totaal - kan, graan: kost };
  };

  // Zaaien en het vangnet vallen op de dagen uit T.AKKER_STADIA zelf: zaaien bij "geploegd", het
  // vangnet bij "gemaaid". Zo blijft het kloppen als Marcel die tabel bijstelt.
  function stadiumBegin(stadium) {
    const g = T.AKKER_STADIA.find((s) => s.stadium === stadium);
    return dagInJaar(g.maand, g.dag);
  }

  // Het eerste jaar is al gezaaid: het spel begint op 1 lentemaand, net nadat de boeren hun eigen
  // zaaigoed de grond in brachten. Pas vanaf het tweede jaar kost zaaien graan uit de voorraad, en
  // pas dan wisselen de velden (T.wisselVelden): eerst de wissel, dan het zaaien, zodat alleen
  // gezaaid wordt wat dit jaar akker is.
  T.tikAkkersDag = function (S, dag) {
    const w = S.wereld;
    if (!w || !w.akkers || !w.akkers.length) return;
    const d = T.datumVanDag(dag);
    const nu = dagInJaar(d.maand, d.dagVanMaand);
    if (dag >= T.DAGEN_PER_JAAR && nu === stadiumBegin('geploegd')) {
      T.wisselVelden(S);
      T.zaaiAkkers(S);
    }
    if (nu === stadiumBegin('gemaaid')) T.haalOogstBinnen(S);
  };
})(globalThis.Toren = globalThis.Toren || {});
