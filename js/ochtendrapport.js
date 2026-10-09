// Het rapport van de raadsman, 's ochtends (werklijst vraag 75, 3a; Marcel, 1 okt: "A Ja dat is goed", en bij het
// nakijken van het plan "a ja b ja c ja"). De dag krijgt fasen, zoals in het concept (ontwerp/concept.md): 's ochtends
// het rapport, 's middags de zitting (3b), 's avonds de herberg (3c). Heb je een raadsman (js/raadsman.js), dan brengt
// hij je elke ochtend een papier: wat er gebeurde, hoe het gaat, of het hout en het eten de winter halen, wat er speelt
// en wat er komt. Zonder raadsman geen rapport: dan ga je zelf rond ("Vroeger moest ik zelf naar de markt").
//
//   - Wat er gebeurde, houdt het dorp bij in een dagboek (D.dagboek, T.schrijfOp): wie er kwam, stierf of wegtrok
//     (T.wijzigBevolking in js/gebouwen.js, de enige weg), wat de boeren uit zichzelf deden (js/akkers.js, js/vee.js),
//     wat de raadsman besliste (js/raadsman.js), wie je zocht en niet sprak (js/voorvallen.js), en welk huis
//     doorgroeide (js/behoeften.js; vraag 87).
//   - Elke nacht, als laatste stap van de dag (T.tikGebouwenDag), maakt de raadsman er het rapport van
//     (T.tikOchtendrapportDag, in D.ochtendrapport), en begint het dagboek opnieuw.
//   - Het rapport zegt wat de balk niet zegt (vraag 75, b): niet wat er ligt, maar hoe het gaat sinds gisteren, hoe
//     lang het hout en het eten de winter halen, en wat de huizen missen en wat helpt (vraag 86, a, en 87). Hoe goed die getallen kloppen, zegt zijn rekenen (T.vaardighedenVan):
//     wie niet kan rekenen, kost je zo echt iets, want de balk verraadt hem niet.
//   - Hij brengt het (vraag 75, a): hij vertrekt zo vroeg dat hij aan je deur staat als je opstaat (T.rapportAnker,
//     voor T.dagAnker in js/dag.js). Ben je bij huis, dan komt hij naar je toe, en sta je stil naast hem, dan geeft hij
//     het (T.werkOchtendrapportBij). Was je er niet vóór het werk begint, dan gaat hij aan het werk, en ligt het klaar
//     onder de knop Rapport (js/brieven.js).
//
// Regels zonder scherm; toetsen in test/ochtendrapport.test.cjs. Het papier is het venster van de brieven
// (js/brieven.js, soort 'rapport'). De spelregel "Het rapport" (js/opties.js) zet het uit: dan is het spel zoals
// vóór 1 okt.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js). Een eerste
  // voorstel van Claude (1 okt).
  T.OCHTENDRAPPORT_INSTELLINGEN = {
    // Of de raadsman een rapport brengt (de spelregel "Het rapport").
    aan: true,
    // Hij vertrekt zo vroeg dat hij aan je deur staat als je opstaat: zijn looptijd, en zoveel uur erbij.
    marge: 0.25,
    // Staat de schout zo dicht bij zijn huis, in tegels, dan komt de raadsman naar hem toe; anders wacht hij aan de
    // deur.
    bijHuis: 5,
    // Zijn rekenen (js/raadsman.js): wie niet kan rekenen, zit er tot zoveel naast (0,3: 30%), elke dag anders.
    slechtNaast: 0.3,
    // Wie het niet bijzonder kan, rondt af op vijf ("zo'n 15"); onder tien telt hij precies.
    afrondenOp: 5,
    telTot: 10,
    // Een rapport dat je niet las, gaat op in het nieuwe: zoveel dingen die gebeurden onthoudt hij, de laatste.
    gebeurdOnthouden: 12,
    // Wat blijft zoals het was, zegt hij niet elke dag (werklijst vraag 76; Marcel: "a ja b ja"): een oorzaak als hij
    // begint of ophoudt, de winter als die zoveel dagen verschuift of omslaat, en zolang het zo blijft, om de zoveel
    // dagen nog eens. Op 1 zegt hij alles elke dag.
    herhaalNa: 7,
    winterVerschil: 10,
    // Wat de huizen missen (vraag 87): zoveel regels per rapport, het zwaarste eerst; wat hij niet zei, zegt hij later.
    wensenPerRapport: 3,
    // Tot deze dag zegt de raad onder het doel dat een raadsman je een rapport brengt, als je er nog geen hebt
    // (vraag 75, c: een nieuw spel begint zonder raadsman, en anders komt een tester het nooit tegen).
    raadTot: 5,
  };
  const IN = () => T.OCHTENDRAPPORT_INSTELLINGEN;

  const dagNu = (D) => Math.floor((D.kalender && D.kalender.dag) || 0);
  const naam = (p) => T.naamVanBewoner(p);
  // Waar de trend over gaat: wat het dorp eet en stookt.
  const TREND = ['graan', 'hout'];

  // ---------------------------------------------------------------------------------------------
  // Het dagboek: wat er gebeurde
  // ---------------------------------------------------------------------------------------------

  // Het dagboek van de dag die begint: wat er dan ligt (voor "sinds gisteren"), en een lege bladzijde.
  function nieuwDagboek(D, dag) {
    const voorraad = {};
    for (const wat of TREND) voorraad[wat] = (D.voorraad && D.voorraad[wat]) || 0;
    return { dag, voorraad, regels: [] };
  }

  // Schrijf op wat er gebeurde, voor het rapport van morgen. `soort`: 'mensen' (wie er kwam, stierf of wegtrok:
  // verschil, reden, waarom en wie, T.wijzigBevolking), 'boeren' (wat ze uit zichzelf deden: tekst), 'besluit' (wat de
  // raadsman besliste: door, titel, antwoord en prijs), 'voorbij' (wie je zocht en niet sprak: wie en titel), 'huis'
  // (een huis groeide door: wie er woont, van, naar en de stand, js/behoeften.js) of 'feest' (het dorp vierde feest:
  // tekst, js/feesten.js).
  T.schrijfOp = function (D, soort, wat) {
    const boek = D.dagboek || (D.dagboek = nieuwDagboek(D, dagNu(D)));
    boek.regels.push({ dag: dagNu(D), soort, ...wat });
  };

  // ---------------------------------------------------------------------------------------------
  // Zijn rekenen
  // ---------------------------------------------------------------------------------------------

  // Zijn getallen, naar zijn rekenen (T.vaardighedenVan, js/raadsman.js): wie kan rekenen, zegt ze precies; wie het
  // niet bijzonder kan, rondt af op afrondenOp, en onder telTot telt hij precies; wie niet kan rekenen, zit er tot
  // slechtNaast naast, en rondt dan af zoals ieder ander. Geloot met de dobbelsteen van het spel (js/boeren.js), vast
  // per dag, zodat de speeltest hetzelfde jaar speelt. Geeft een functie: getal (niet negatief) → { n, tekst }.
  T.rekenaarVan = function (D, p, dag) {
    const kan = T.vaardighedenVan(D, p).rekenen; // 'goed', 'slecht', of niets bijzonders
    const r = T.dobbelsteen((((((D.lot && D.lot.zaad) || 1) * 7919) ^ (dag * 104729)) >>> 0) ^ 0x5eed);
    return (n) => {
      if (kan === 'goed') return { n, tekst: String(n) };
      const m = kan === 'slecht' ? Math.max(0, Math.round(n * (1 + (2 * r() - 1) * IN().slechtNaast))) : n;
      if (m < IN().telTot) return { n: m, tekst: String(m) };
      const rond = Math.round(m / IN().afrondenOp) * IN().afrondenOp;
      return { n: rond, tekst: `zo'n ${rond}` };
    };
  };

  // ---------------------------------------------------------------------------------------------
  // Wat erin staat
  // ---------------------------------------------------------------------------------------------

  const stierf = (een) => (een ? 'is' : 'zijn');

  // Wat er gebeurde, als zin. Wie het zijn, staat in het dagboek zoals js/bewoners.js het zegt: "de oude Jan, vader van
  // Klaas"; een bijstelling sluit met een komma.
  function gebeurdTekst(g, door) {
    if (g.soort === 'mensen') {
      const n = Math.abs(g.verschil);
      const een = n === 1;
      // Zonder bewoners (een toets met een eigen, kleine wereld) alleen hoeveel.
      if (!g.wie && g.verschil > 0) return `Er ${een ? 'kwam één mens' : `kwamen ${n} mensen`} bij.`;
      if (!g.wie) return `Het dorp verloor ${een ? 'één mens' : `${n} mensen`}${g.waarom ? `: ${g.waarom}` : ''}.`;
      const komma = g.wie.includes(',') ? ',' : '';
      if (g.verschil > 0 && g.reden === 'geboorte') return `Geboren: ${g.wie}.`; // js/leven.js
      if (g.verschil > 0) return `Nieuw in het dorp: ${g.wie}.`;
      if (g.reden === 'vertrek') return `${T.hoofdletter(g.wie)}${komma} ${een ? 'trok' : 'trokken'} weg: ${g.waarom || 'niemand weet waarom'}.`;
      if (g.waarom) return `${g.waarom}: ${g.wie}${komma} ${stierf(een)} gestorven.`;
      // Wie in de heervaart sneuvelde (js/heervaart.js), heeft geen waarom: dat zegt de heer zelf.
      if (g.reden === 'gesneuveld') return `${T.hoofdletter(g.wie)}${komma} ${een ? 'sneuvelde' : 'sneuvelden'} voor de heer.`;
      return `${T.hoofdletter(g.wie)}${komma} ${stierf(een)} gestorven.`;
    }
    if (g.soort === 'boeren' || g.soort === 'feest' || g.soort === 'bode' || g.soort === 'brand') return g.tekst;
    // Wat hij besliste toen je weg was: "ik", tenzij het een raadsman van eerder was. Wat hij zei, sluit de zin zelf
    // af, zoals in zijn bericht (js/raadsman.js).
    if (g.soort === 'besluit') return `Over ${g.titel} besliste ${g.door === door ? 'ik' : g.door}: "${g.antwoord}"${g.prijs ? ` (${g.prijs})` : ''}`;
    if (g.soort === 'voorbij') return `${T.hoofdletter(g.wie)} zocht je over ${g.titel}, en sprak je niet.`;
    if (g.soort === 'huis') {
      const stand = T.STANDEN[g.stand] ? `: ${g.wie ? 'ze horen' : 'wie erin woont, hoort'} nu bij de ${T.STANDEN[g.stand].naam}` : '';
      return `${g.wie ? `De ${g.van} van ${g.wie}` : `Een ${g.van}`} is een ${g.naar} geworden${stand}.`;
    }
    return null;
  }

  // Hoe het gaat (vraag 75, b): wat er sinds gisteren bij kwam of af ging, aan graan en hout. De balk zegt wat er ligt;
  // dit zegt het niet. '' als er niets veranderde.
  function hoeHetGaat(D, boek, reken) {
    const delen = [];
    for (const wat of TREND) {
      const toen = boek.voorraad && boek.voorraad[wat];
      if (toen == null) continue;
      const verschil = Math.round(((D.voorraad && D.voorraad[wat]) || 0) - toen);
      const g = verschil ? reken(Math.abs(verschil)) : null;
      if (g && g.n) delen.push(`${g.tekst} ${wat} ${verschil < 0 ? 'minder' : 'meer'}`);
    }
    return delen.length ? `Sinds gisteren is er ${T.opsomming(delen)}.` : '';
  }

  // Wat hij al zei (werklijst vraag 76): zolang het zo blijft, zegt hij het om de herhaalNa dagen nog eens. `oud` is
  // wat je weet (uit het laatste rapport dat je las), `nieuw` wat je weet na dit rapport.
  const nogEens = (dag, m) => dag - m.gezegd >= IN().herhaalNa;

  // De winter, zodra hij in zicht is (T.winterInZicht, js/behoeften.js) of al loopt: of het hout en het eten hem halen
  // (T.houtVoorDeWinter en T.etenVoorDeWinter, js/behoeften.js, zoals de raad). Hij zegt het de eerste keer, als het
  // omslaat (haalt hij hem of niet), als de dag waarop het op is winterVerschil dagen verschuift, en anders om de
  // herhaalNa dagen. Het aantal dagen zegt hij naar zijn rekenen, dus wie niet kan rekenen, zegt misschien dat het de
  // winter haalt terwijl het dat niet doet. Hoe lang de winter is, weet iedereen.
  function winterRegels(D, dag, reken, oud, nieuw) {
    if (!T.winterInZicht(dag)) return [];
    const halen = [];
    const uit = [];
    for (const [id, wat, v] of [['hout', 'het hout', T.houtVoorDeWinter(D, dag)], ['eten', 'het eten', T.etenVoorDeWinter(D, dag)]]) {
      const opDag = dag + v.tot + v.dagen; // de dag waarop het op is, of het eind van de winter
      const m = oud[id];
      if (m && m.haalt === v.haalt && Math.abs(opDag - m.opDag) < IN().winterVerschil && !nogEens(dag, m)) {
        nieuw[id] = m;
        continue;
      }
      nieuw[id] = { opDag, haalt: v.haalt, gezegd: dag };
      const g = reken(v.dagen);
      if (g.n >= v.winter) halen.push(wat);
      else if (v.tot > 0) uit.push(`${T.hoofdletter(wat)} haalt ${g.tekst} van de ${v.winter} dagen van de winter.`);
      else uit.push(`${T.hoofdletter(wat)} is ${g.n < 1 ? 'op' : `over ${g.tekst} ${g.n === 1 ? 'dag' : 'dagen'} op`}, en de winter duurt nog ${v.winter} dagen.`);
    }
    const loopt = T.dagenTotDeWinter(dag) === 0;
    if (halen.length) uit.unshift(`${T.hoofdletter(T.opsomming(halen))} ${halen.length > 1 ? 'halen' : 'haalt'} ${loopt ? 'het eind van de winter' : 'de winter'}.`);
    return uit;
  }

  // Wat er speelt (T.OORZAKEN, js/voorvallen.js): een oorzaak als hij begint ("Er is honger, want het rantsoen is
  // krap."), zolang hij duurt om de herhaalNa dagen ("Er is nog steeds honger, al twaalf dagen: het rantsoen is krap."),
  // en als hij over is ("De honger is voorbij.").
  function oorzaakRegels(D, dag, oud, nieuw) {
    const uit = [];
    const nu = T.oorzakenNu(D, dag);
    // Met niveaus (werklijst vraag 77, stap 2): wordt het erger (honger wordt hongersnood), dan zegt hij het meteen, en
    // wordt het minder ook.
    for (const o of nu) {
      const m = oud[o.id];
      const was = m ? m.niveau || 1 : 0;
      if (!m) {
        uit.push(o.zin);
        nieuw[o.id] = { sinds: dag, gezegd: dag, niveau: o.niveau };
      } else if (o.niveau > was) {
        uit.push(o.zin);
        nieuw[o.id] = { sinds: m.sinds, gezegd: dag, niveau: o.niveau };
      } else if (o.niveau < was) {
        uit.push(`${T.OORZAKEN[o.id].erger.minder}.`);
        nieuw[o.id] = { sinds: m.sinds, gezegd: dag, niveau: o.niveau };
      } else if (nogEens(dag, m)) {
        const nog = o.niveau === 2 ? `Nog steeds ${o.naam.toLowerCase()}` : T.OORZAKEN[o.id].nog;
        uit.push(`${nog}, al ${T.telwoord(dag - m.sinds)} dagen${o.waarom ? `: ${o.waarom}` : ''}.`);
        nieuw[o.id] = { sinds: m.sinds, gezegd: dag, niveau: o.niveau };
      } else nieuw[o.id] = m;
    }
    for (const id of Object.keys(oud)) if (!nu.some((o) => o.id === id)) uit.push(`${T.OORZAKEN[id].voorbij}.`);
    return uit;
  }

  // Wat de huizen missen, en wat helpt (werklijst vraag 86, a, en 87), zoals de raad het zegt (T.watDeHuizenMissen,
  // js/wensen.js), zonder de toets, en ook wat je nu niet kunt doen ("een bakkerij bouw je pas in een dorp"). Als status
  // (vraag 76, en de richtlijn van 1 okt): hij zegt het als het begint of verandert (een huis meer of minder, of wat
  // helpt), zolang het zo blijft om de herhaalNa dagen, en als het ophoudt ("Niemand mist nog een kapel."). Hooguit
  // wensenPerRapport per dag, het zwaarste eerst; wat hij niet zei, zegt hij een volgende dag. Heeft elk huis alles, dan
  // zegt hij dat één keer.
  function wensRegels(D, dag, oud, nieuw) {
    const uit = [];
    const lijst = T.watDeHuizenMissen(D);
    let ruimte = IN().wensenPerRapport;
    for (const x of lijst) {
      const tekst = x.tekst.replace(/ ?\[[^\]]*\]/g, '');
      const m = oud[x.id];
      if (m && m.tekst === tekst && !nogEens(dag, m)) nieuw[x.id] = m;
      else if (ruimte > 0) {
        ruimte--;
        uit.push(tekst);
        nieuw[x.id] = { tekst, gezegd: dag };
      } else if (m) nieuw[x.id] = m; // nog niet gezegd: morgen
    }
    for (const id of Object.keys(oud)) {
      if (id === 'alles' || lijst.some((x) => x.id === id)) continue;
      if (T.WENSEN[id]) uit.push(`Niemand mist nog ${T.WENSEN[id].naam}.`);
    }
    const huizen = (D.gebouwen || []).filter((g) => g.wensen && g.wensen.mensen > 0);
    if (huizen.length && huizen.every((g) => g.wensen.alles)) {
      if (!oud.alles) uit.push('Alle huizen hebben wat ze willen.');
      nieuw.alles = oud.alles || { gezegd: dag };
    }
    return uit;
  }

  // Wat er komt: wie er vandaag komt, en de raden over de inner, de rovers en het goud voor de heer (js/raad.js),
  // zonder de toets erbij.
  const RADEN_DIE_KOMEN = ['inner', 'rovers', 'heerGoud'];
  function watErKomt(D, dag) {
    const uit = [];
    const m = D.marskramer;
    if (m && m.komtOp === dag && !m.weg) uit.push('Vandaag komt de marskramer.');
    if (D.heer && D.heer.bezoek && !D.heer.bezoek.aangekomen) uit.push('Vandaag komt de heer.');
    if (D.inner && D.inner.bezoek && !D.inner.bezoek.aangekomen) uit.push('Vandaag komt de inner.');
    for (const id of RADEN_DIE_KOMEN) {
      const r = T.RADEN.find((x) => x.id === id);
      if (r.als(D)) uit.push(r.tekst(D).replace(/ ?\[[^\]]*\]/g, ''));
    }
    return uit;
  }

  // Wat hij nog niet zei: een leeg geheugen.
  const niksGezegd = () => ({ winter: {}, oorzaken: {}, wensen: {} });

  // Het rapport van vandaag, door raadsman `p`, over wat er gebeurde (`gebeurd`, uit het dagboek) en hoe het ging sinds
  // `boek` begon, met wat je al wist (`basis`, vraag 76): { dag, door, regels, gebeurd, basis, onthoud, gebracht,
  // gelezen }. `regels` zijn de zinnen op het papier: wat er gebeurde, hoe het gaat, de winter, wat er speelt en wat er
  // komt. Op een dag zonder iets bijzonders is het één regel. `onthoud` is wat je weet als je het leest.
  T.maakOchtendrapport = function (D, dag, p, gebeurd, boek, basis = niksGezegd()) {
    const door = naam(p);
    const reken = T.rekenaarVan(D, p, dag);
    const onthoud = niksGezegd();
    const regels = gebeurd.map((g) => gebeurdTekst(g, door)).filter(Boolean);
    const gaat = hoeHetGaat(D, boek, reken);
    const rest = winterRegels(D, dag, reken, basis.winter, onthoud.winter)
      .concat(oorzaakRegels(D, dag, basis.oorzaken, onthoud.oorzaken))
      .concat(wensRegels(D, dag, basis.wensen || {}, onthoud.wensen))
      .concat(watErKomt(D, dag));
    if (!regels.length && !rest.length) regels.push(`Niets bijzonders.${gaat ? ` ${gaat}` : ''}`);
    else regels.push(...(gaat ? [gaat] : []), ...rest);
    return { dag, door, regels, gebeurd, basis, onthoud, gebracht: false, gelezen: false };
  };

  // Elke nacht, als laatste stap van de dag (T.tikGebouwenDag, js/gebouwen.js): het dagboek begint opnieuw, en heeft je
  // dorp een raadsman, dan maakt hij er eerst het rapport van. Een rapport dat je niet las, gaat op in het nieuwe: wat
  // er gebeurde, blijft erin staan tot je het leest (de laatste gebeurdOnthouden), en wat erin stond over de winter en
  // wat er speelt, geldt als niet gezegd. Een ander dorp dan het jouwe brengt niemand een rapport.
  T.tikOchtendrapportDag = function (D, dag) {
    const boek = D.dagboek || nieuwDagboek(D, dag);
    D.dagboek = nieuwDagboek(D, dag);
    const p = IN().aan && !D.ander ? T.raadsmanVan(D) : null;
    const vorig = D.ochtendrapport;
    if (!p) {
      D.ochtendrapport = null;
      return;
    }
    const gelezen = vorig && vorig.gelezen;
    const gebeurd = (vorig && !gelezen ? vorig.gebeurd : []).concat(boek.regels).slice(-IN().gebeurdOnthouden);
    const basis = vorig ? (gelezen ? vorig.onthoud : vorig.basis) : niksGezegd();
    D.ochtendrapport = T.maakOchtendrapport(D, dag, p, gebeurd, boek, basis);
  };

  // Ligt er een rapport dat je nog niet las? Voor de knop Rapport (js/brieven.js).
  T.rapportKlaar = (D) => !!(IN().aan && D.ochtendrapport && !D.ochtendrapport.gelezen);

  // Je leest het (js/brieven.js): het is gebracht en gelezen.
  T.leesRapport = function (D) {
    const R = D.ochtendrapport;
    if (R) R.gebracht = R.gelezen = true;
  };

  // ---------------------------------------------------------------------------------------------
  // Hij brengt het
  // ---------------------------------------------------------------------------------------------

  // De deur van de schout (het huis met huis: 'schout', zoals T.afstandTotHuis in js/dag.js).
  function deurVanSchout(D) {
    const g = (D.gebouwen || []).find((x) => x.huis === 'schout');
    return g ? T.deurVan(D.wereld, g) : null;
  }

  // Moet hij het rapport nu brengen? Er ligt er een van vandaag dat niemand las, er is een raadsman met een poppetje,
  // en het is tussen zijn vertrek (zijn looptijd plus marge vóór het opstaan, zodat hij er staat als je opstaat) en het
  // begin van het werk. Dan { R, p, deur }; anders null.
  function teBrengen(D) {
    const R = D.ochtendrapport;
    if (!IN().aan || !R || R.gebracht || R.gelezen || D.ander || !D.kalender) return null;
    const nu = D.kalender.dag;
    if (Math.floor(nu) !== R.dag) return null;
    const d = T.dagindeling(nu);
    const uur = T.uurVanDag(nu);
    if (uur >= d.werkBegin) return null;
    const p = T.raadsmanVan(D);
    const e = p && p.wezen;
    const deur = e && e.thuis && deurVanSchout(D);
    if (!deur) return null;
    const looptijd = T.looptijdVan(D.wereld, p, e.thuis, { x: deur.x, y: deur.y, straal: 1 }, 'rapport');
    if (uur < d.opstaan - looptijd - IN().marge) return null;
    return { R, p, deur };
  }

  // Staat de schout buiten, bij zijn huis?
  const schoutBijHuis = (D) => !!(D.schout && !D.schout.binnen && !T.schoutIsWeg(D) && T.afstandTotHuis(D) <= IN().bijHuis);

  // Waar de raadsman hoort zolang hij een rapport brengt (voor T.dagAnker, js/dag.js): bij de schout als die buiten bij
  // zijn huis staat, en anders aan zijn deur. Geen raadsman, of niets te brengen: null, en dan geldt de dag.
  T.rapportAnker = function (D, e) {
    if (!e.raadsman) return null;
    const b = teBrengen(D);
    if (!b || b.p.wezen !== e) return null;
    const h = D.schout;
    if (schoutBijHuis(D)) return { x: h.tx, y: h.ty, straal: 1 };
    return { x: b.deur.x, y: b.deur.y, straal: 1 };
  };

  // Elk beeld (T.werkDorpBij, js/dorp.js): staan de raadsman en de schout naast elkaar stil, dan geeft hij het rapport,
  // en gaat het papier open (js/brieven.js). Zolang de schout slaapt of iets anders doet (een gesprek, een venster, een
  // brief), wacht hij.
  T.werkOchtendrapportBij = function (S, D) {
    if (D !== S.dorp) return;
    const b = teBrengen(D);
    if (!b) return;
    const e = b.p.wezen;
    const h = D.schout;
    if (S.modus !== 'verkennen' || S.slaap || !schoutBijHuis(D) || e.binnen || h.onderweg || e.onderweg) return;
    if (T.afstand({ x: h.tx, y: h.ty }, { x: e.tx, y: e.ty }) > 1) return;
    if (T.ui && T.ui.briefOpen && T.ui.briefOpen()) return;
    b.R.gebracht = true;
    if (T.ui && T.ui.toonBrief) T.ui.toonBrief(D, 'rapport');
  };
})(globalThis.Spel = globalThis.Spel || {});
