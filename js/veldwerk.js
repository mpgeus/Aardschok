// Het veldwerk: wat een boer overdag op zijn land doet (werklijst vraag 111; Marcel, 3 okt: "Ook wil ik dat boeren op
// hun veld aan het werk zijn. Nu hebben ze wel velden, maar lopen ze gewoon random door het dorp. Ze moeten zaaien en
// op het veld bezig zijn."). Tot 5 okt stuurde het dagritme een boer overdag naar de deur van zijn boerderij, en stond
// hij alleen in de oogst op zijn veld (T.werkOogstBij, js/akkers.js). Nu werkt hij overdag op zijn eigen land:
//   - zolang het graan nog moet kiemen (lentemaand, tot de 11e): hij zaait, rij voor rij over zijn akkers;
//   - tot het graan rijp is: hij wiedt en schoffelt, tegel voor tegel, met een rustpoos ertussen;
//   - in het hooi en de oogst maait hij (T.werkOogstBij; dat blijft daar);
//   - in de herfst rijdt hij mest uit op een akker die mest krijgt (T.zetMest), en spit hij wat volgend jaar akker wordt;
//   - in de winter sprokkelt hij aan de bosrand, en brengt hij een bundel hout naar huis;
//   - en ontgint hij heide of bos (js/ontginnen.js), dan werkt hij daar, behalve als hij zaait: op de heide steekt hij
//     plaggen, tegel voor tegel; in het bos hakt hij eerst de bomen om en rooit hij de stronken en de struiken, van naast
//     die tegel, en spit hij de grond daarna om.
// Net zo rooit het hoofd van een nieuw gezin zijn erf, als daar nog bomen, stronken of struiken staan, en een inwoner de
// plek van de werkplaats die hij vroeg (js/bos.js; werklijst vraag 110, e): hij hakt en rooit, en het gezin van wie zijn
// erf rooit, helpt, tot de bouwplaats kan komen. En de houthakker hakt aan zijn boom in het bos, en brengt het hout in
// bundels naar zijn schuur (js/bos.js; vraag 115). En de jager loert in het bos op de groep herten of de roedel waar hij op
// jaagt, en gaat dan terug naar zijn hut (js/beesten.js; vraag 116, stap 3a).
// Wat overblijft (dorsen, het vee, of er is niets te doen), doet hij bij zijn boerderij, zoals tot nu toe: T.dagAnker
// (js/dag.js) stuurt hem daarheen. De boerin en de grote kinderen helpen bij het zaaien en de oogst (T.helpAnker).
//
// De regels veranderen er niet van (vraag 111, c): het zaaien (T.zaaiAkkers), de oogst en het sprokkelen
// (T.sprokkelHout, js/behoeften.js) gaan zoals ze gingen; dit zegt alleen waar de boer is en wat hij doet. Wat hij doet,
// staat op zijn poppetje, en js/sprites.js kiest er het figuur bij (de zaaier, de wieder of de sprokkelaar, vraag 111,
// b; zolang die er niet zijn, zijn eigen vel):
//   e.werkt     { soort, x, y, op, tot, rust }: hij is met dit werk bezig. (x, y) is de tegel waar hij werkt of heen
//               loopt, `op` de tegel waar hij aan werkt als hij ernaast staat (een boom die hij omhakt: daar kijkt hij
//               naar, js/sprites.js), `tot` (de tijd van de wereld, S.wereldTijd) wanneer die tegel af is, of null zolang
//               hij er nog heen loopt, en `rust`: hij staat even (`schaft`: hij schaft op de akker). Wie werkt, dwaalt
//               niet (T.dwaal), praat niet (js/praatje.js) en gaat niet opzij (js/lopen.js). Bij het ontginnen is de
//               soort wat hij nu doet: 'hakken', 'rooien' of 'ontginnen' (plaggen steken, omspitten).
//   e.draagt    'bundel': hij heeft hout geraapt, en draagt het naar huis.
//   e.veldwerk  { soort, i, gedaan, klaar, over }: hoe ver hij is. `i` is zijn tegel in de rij (T.veldwerkTegels),
//               `gedaan` hoeveel hij er van dit werk deed, `klaar` wanneer hij klaar was met zaaien en mesten (het jaar)
//               en met sprokkelen (de dag), en `over` { x, y, werk, uren }: wat de tegel die hij half af had (een plag,
//               een boom, een stronk) nog vraagt.
// Regels zonder scherm, dus te toetsen (test/veldwerk.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js). De tijden in uren van de dag.
  T.VELDWERK_INSTELLINGEN = {
    // Of de boeren op hun land werken. Uit: overdag staan ze bij hun boerderij, zoals tot 5 okt.
    aan: true,
    // Hoe lang hij over een tegel doet, en hoe lang hij daarna even staat.
    zaaien: 0.4,
    wieden: 1.5,
    wiedenRust: 0.5,
    mesten: 0.5,
    spitten: 2,
    spittenRust: 0.5,
    // Plaggen steken op heide die hij ontgint (js/ontginnen.js): zwaar werk, zo'n tegel per werkdag, zodat dertig tegels
    // ongeveer de maand vullen die het duurt. In het bos spit hij zo lang de grond om, en eerst hakt hij een boom om en
    // rooit hij de stobbe (of een struik): samen ruim twee werkdagen per boom, zodat een stuk bos een winter duurt.
    ontginnen: 8,
    hakken: 6,
    rooien: 10,
    ontginnenRust: 0.5,
    // Sprokkelen: zo lang raapt hij hout aan de bosrand, en zo ver van zijn deur zoekt hij die, in tegels. Wat bos is,
    // zegt T.isBos (js/bos.js): minder bomen is een boom tussen de huizen.
    rapen: 3,
    bosrandStraal: 25,
    // Hoe dicht de boerin en de grote kinderen bij de boer blijven als ze helpen, in tegels.
    helpStraal: 2,
  };
  const IN = () => T.VELDWERK_INSTELLINGEN;
  // Een uur van de dag in seconden van de wereld, zoals het maaien rekent (T.oogstTegelDuur, js/akkers.js).
  const uur = () => (T.DAG_LENGTE || 300) / 24;

  // ---------------------------------------------------------------------------------------------
  // Wat hij vandaag doet, en waar
  // ---------------------------------------------------------------------------------------------

  // De tegels van een veld in de volgorde waarin je het afloopt: rij voor rij in de lengte, heen en terug.
  function rijenVan(veld) {
    const lijst = [];
    const inDeLengte = veld.b >= veld.h;
    const lang = inDeLengte ? veld.b : veld.h;
    const rijen = inDeLengte ? veld.h : veld.b;
    for (let r = 0; r < rijen; r++) {
      for (let k = 0; k < lang; k++) {
        const s = r % 2 ? lang - 1 - k : k;
        lijst.push(inDeLengte ? { x: veld.x + s, y: veld.y + r } : { x: veld.x + r, y: veld.y + s });
      }
    }
    return lijst;
  }

  // Op welke velden van hem doet hij dit werk, en op welke tegels ervan? Zaaien en wieden op een akker, waar gezaaid is
  // (T.akkerTegelStadium, js/akkers.js: een tegel zonder zaaigraan blijft kaal); mest uitrijden op een veld dat mest
  // krijgt; spitten op wat volgend jaar akker wordt, behalve een weide waar het vee nog op staat.
  const OP = {
    zaaien: { veld: (v) => T.bestemmingVan(v) === 'akker', tegel: (v, t) => T.akkerTegelStadium(v, t.x, t.y, 'groen') === 'groen' },
    wieden: { veld: (v) => T.bestemmingVan(v) === 'akker', tegel: (v, t) => T.akkerTegelStadium(v, t.x, t.y, 'groen') === 'groen' },
    mesten: { veld: (v) => !!v.mest },
    spitten: { veld: (v) => T.planVan(v) === 'akker' && T.bestemmingVan(v) !== 'weide' && !v.ontginning },
    // Ontginnen: wat hij van de heide of het bos nog niet af heeft (js/ontginnen.js), ook waar een boom, een stronk of een
    // struik staat (`vast`): daar werkt hij van een tegel ernaast.
    ontginnen: { veld: (v) => !!v.ontginning, tegel: (v, t) => !T.isGestoken(v, t.x, t.y), vast: true },
  };

  // De tegels waar hij dit werk doet, in de volgorde waarin hij ze afloopt: veld voor veld, en op een veld rij voor rij.
  T.veldwerkTegels = function (w, e, soort) {
    const op = OP[soort];
    const lijst = [];
    if (!op) return lijst;
    for (const v of e.werkAkkers || []) {
      if (!op.veld(v)) continue;
      for (const t of rijenVan(v)) if ((!op.tegel || op.tegel(v, t)) && (op.vast || T.isBegaanbaar(w, t.x, t.y))) lijst.push(t);
    }
    return lijst;
  };
  // Eén keer per dag uitgerekend: een veld verandert op een dag (het zaaien, de keus van de boeren), niet per beeld, en
  // wat jij vandaag aan een veld verandert, doet hij morgen. Geen spelstaat: na het laden rekent hij het opnieuw uit,
  // en vindt hetzelfde.
  const TEGELS = new WeakMap(); // poppetje → { dag, per: { soort: lijst } }
  function tegelsVan(D, e, soort) {
    // Wat hij ontgint, wordt onder het werk kleiner: dat rekent hij elke keer uit (het zijn er dertig).
    if (soort === 'ontginnen') return T.veldwerkTegels(D.wereld, e, soort);
    const dag = Math.floor(D.kalender.dag);
    let m = TEGELS.get(e);
    if (!m || m.dag !== dag) TEGELS.set(e, (m = { dag, per: {} }));
    return m.per[soort] || (m.per[soort] = T.veldwerkTegels(D.wereld, e, soort));
  }

  // De bosrand bij zijn huis: een tegel aan de rand van een echt stuk bos (T.isBos, js/bos.js; een losse boom tussen de
  // huizen is geen bos), met de bomen achter hem en niet ervoor, en geen gebouw schuin
  // vóór hem: zo zie je hem rapen, en verdwijnt hij niet achter een dak of een boom (wie vóór iets staat, is in dit beeld
  // wie verder naar het zuiden staat, x en y groter). Niet verder dan bosrandStraal van zijn deur, en te bereiken; de
  // dichtste zes, of null als er geen bos in de buurt is. Per kaart onthouden tot de kaart verandert (T.kaartVersie,
  // js/wereld.js), zoals de natuur in js/gebouwen.js. Geen spelstaat.
  const BOSRAND = new WeakMap(); // kaart → { versie, per: Map(deur → lijst of null) }
  function bosrandVan(D, e) {
    const w = D.wereld;
    if (!e.thuis) return null;
    const versie = T.kaartVersie(w);
    let m = BOSRAND.get(w);
    if (!m || m.versie !== versie) BOSRAND.set(w, (m = { versie, per: new Map() }));
    const sleutel = e.thuis.x + ',' + e.thuis.y;
    if (m.per.has(sleutel)) return m.per.get(sleutel);
    const r = IN().bosrandStraal;
    const hoog = w.tegels.length;
    const wijd = w.tegels[0].length;
    const boom = (x, y) => x >= 0 && y >= 0 && x < wijd && y < hoog && T.NATUUR.bos.telt(w, x, y, T.voorwerpOp(w, x, y));
    const voeten = (D.gebouwen || []).map((g) => T.voetVanGebouw(g)).filter(Boolean);
    const gebouwVoor = (x, y) => voeten.some((f) => f.x + f.b > x && f.y + f.h > y && f.x <= x + 6 && f.y <= y + 6);
    const kandidaten = [];
    for (let y = Math.max(0, e.thuis.y - r); y <= Math.min(hoog - 1, e.thuis.y + r); y++) {
      for (let x = Math.max(0, e.thuis.x - r); x <= Math.min(wijd - 1, e.thuis.x + r); x++) {
        if (!T.isBegaanbaar(w, x, y) || T.bijDeur(w, x, y)) continue;
        if (!(boom(x - 1, y) || boom(x, y - 1) || boom(x - 1, y - 1))) continue;
        if (boom(x + 1, y) || boom(x, y + 1) || boom(x + 1, y + 1)) continue;
        if (!T.isBos(w, x, y) || gebouwVoor(x, y)) continue;
        kandidaten.push({ x, y, d: T.afstand(e.thuis, { x, y }) });
      }
    }
    kandidaten.sort((a, b) => a.d - b.d || a.y - b.y || a.x - b.x);
    const lijst = [];
    for (const t of kandidaten) {
      if (lijst.length >= 6) break;
      if (T.kanErKomen(w, e.thuis, t)) lijst.push({ x: t.x, y: t.y });
    }
    const uit = lijst.length ? lijst : null;
    m.per.set(sleutel, uit);
    return uit;
  }
  T.bosrandBij = bosrandVan; // ook voor test/veldwerk.test.cjs en Spel.debug.veldwerk

  // Wat deze boer vandaag op zijn land doet: 'zaaien', 'wieden', 'mesten', 'spitten' of 'sprokkelen', of null: de oogst
  // (dan maait hij, T.werkOogstBij), of er is niets te doen (dan is hij bij zijn boerderij). `datum` is
  // T.datumVanDag(D.kalender.dag).
  T.veldwerkVandaag = function (D, e, datum) {
    if (!IN().aan || !e.werkAkkers || !e.werkAkkers.length) return null;
    const basis = T.akkerStadium(datum.maand, datum.dagVanMaand);
    if (basis === 'rijp' || T.isHooitijd(datum)) return null;
    const klaar = (e.veldwerk && e.veldwerk.klaar) || {};
    const heeft = (soort) => tegelsVan(D, e, soort).length > 0;
    if (basis === 'geploegd' && klaar.zaaien !== datum.jaar && heeft('zaaien')) return 'zaaien';
    // Ontgint hij heide (js/ontginnen.js), dan gaat dat voor het andere werk van het seizoen.
    if (heeft('ontginnen')) return 'ontginnen';
    if (basis === 'geploegd' || basis === 'kiemend' || basis === 'groen') return heeft('wieden') ? 'wieden' : null;
    if (datum.seizoen === 'herfst') {
      if (klaar.mesten !== datum.jaar && heeft('mesten')) return 'mesten';
      return heeft('spitten') ? 'spitten' : null;
    }
    if (datum.seizoen === 'winter' && klaar.sprokkelen !== Math.floor(D.kalender.dag) && bosrandVan(D, e)) return 'sprokkelen';
    // Is het hout geraapt, dan dorst hij in de deur van zijn schuur (vraag 140).
    if (datum.seizoen === 'winter') {
      const p = T.bewonerVan(D, e);
      if (p && p.huis && p.huis.soort === 'boerderij') return 'dorsen';
    }
    return null;
  };

  // ---------------------------------------------------------------------------------------------
  // Elk beeld: aan het werk
  // ---------------------------------------------------------------------------------------------

  // Kan hij nu op zijn land werken? Niet als hij maait (T.werkOogstBij), binnen is, of ergens anders moet zijn: met de
  // schout praten, de schout zoeken met een voorval (js/voorvallen.js), met de militie mee (js/rovers.js), naar de
  // schandpaal (js/heer.js), zijn rapport brengen (js/ochtendrapport.js), wegtrekken of een tijd weg zijn
  // (js/bewoners.js, js/heervaart.js), of midden in een praatje (dat houdt na de schaft vanzelf op, js/praatje.js).
  function magWerken(S, D, e) {
    if (e.maait || e.oogstDoel || e.binnen || e === S.spreektMet || e.zoektSchout || e.opgeroepen || e.moetNaar || e.vertrekt || e.praatje) return false;
    if (T.rapportAnker(D, e) || T.zaakAnker(D, e)) return false; // en niet op de zitting (js/zaak.js)
    const p = T.bewonerVan(D, e);
    return !(p && (p.weg || p.komt || T.blijftThuis(p, D.kalender.dag)));
  }

  // Hij houdt op (de werkdag is om, of hij moet ergens anders zijn). Was hij op weg naar een tegel, dan maakt hij alleen
  // zijn stap af, en neemt het ritme van de dag het over (T.dwaal), zoals na het maaien. Een bundel hout houdt hij: die
  // brengt hij naar huis.
  function stop(e) {
    const wt = e.werkt;
    if (!wt) return;
    if (e.pad.length && e.padDoel && e.padDoel.x === wt.x && e.padDoel.y === wt.y) e.pad = e.onderweg ? [e.pad[0]] : [];
    e.werkt = null;
  }

  // Een plag steken, een boom omhakken of een stronk rooien is meer werk dan een halve dag (IN().ontginnen, en in de
  // winter is een werkdag zes uur): houdt hij op voor hij af is (de schaft, het eind van de werkdag, iemand roept hem),
  // dan onthoudt hij wat die tegel nog vraagt (e.veldwerk.over), en maakt hij hem de volgende keer af.
  const ONTGINWERK = new Set(['ontginnen', 'hakken', 'rooien']);
  function onthoudPlag(e, nu) {
    const wt = e.werkt;
    if (wt && ONTGINWERK.has(wt.soort) && wt.tot != null && !wt.rust && e.veldwerk) {
      const t = wt.op || wt;
      e.veldwerk.over = { x: t.x, y: t.y, werk: wt.soort, uren: Math.max(0, wt.tot - nu) / uur() };
    }
  }

  // De tegel van de rij die het dichtst bij hem ligt: daar begint hij als hij aan nieuw werk begint.
  function dichtsteIn(lijst, e) {
    let beste = 0;
    let afstand = Infinity;
    lijst.forEach((t, i) => {
      const d = T.afstand(t, { x: e.tx, y: e.ty });
      if (d < afstand) {
        afstand = d;
        beste = i;
      }
    });
    return beste;
  }

  // Een tegel verder in zijn rij. Zaaien en mest uitrijden doet hij één keer over al zijn land; wieden en spitten gaan
  // rond tot het seizoen om is.
  function verder(vw, lijst, jaar) {
    vw.gedaan++;
    vw.i = (vw.i + 1) % lijst.length;
    if ((vw.soort === 'zaaien' || vw.soort === 'mesten') && vw.gedaan >= lijst.length) vw.klaar[vw.soort] = jaar;
  }

  // Werk op zijn velden: naar de volgende tegel, daar zijn tijd werken, even staan, en door.
  function opHetLand(S, D, e, vw, nu, datum) {
    const w = D.wereld;
    const lijst = tegelsVan(D, e, vw.soort);
    if (!lijst.length) {
      stop(e);
      return;
    }
    if (vw.soort === 'ontginnen') {
      ontgin(D, e, vw, nu, lijst);
      return;
    }
    const wt = e.werkt;
    if (wt && wt.tot != null) {
      if (nu < wt.tot) return;
      const rust = IN()[vw.soort + 'Rust'] || 0;
      if (!wt.rust && rust > 0) {
        wt.rust = true;
        wt.tot = nu + rust * uur();
        return;
      }
      e.werkt = null;
      verder(vw, lijst, datum.jaar);
      if (vw.klaar[vw.soort] === datum.jaar) return; // klaar: het volgende beeld kiest het volgende werk
    }
    if (e.pad.length) return; // onderweg naar zijn tegel
    if (vw.i == null || vw.i >= lijst.length) vw.i = dichtsteIn(lijst, e);
    const doel = lijst[vw.i];
    if (e.tx === doel.x && e.ty === doel.y) {
      e.werkt = { soort: vw.soort, x: doel.x, y: doel.y, tot: nu + IN()[vw.soort] * uur(), rust: false };
      return;
    }
    // Een weg om wat vaststaat (js/lopen.js). Staat er al iemand op die tegel (wie helpt, een koe, de schout), of komt
    // hij er niet, dan slaat hij hem over.
    const pad = T.wezenOp(w, doel.x, doel.y, e) ? null : T.zoekRoute(w, { x: e.tx, y: e.ty }, doel, {});
    if (pad && pad.length) {
      T.geefRoute(e, pad, doel);
      e.werkt = { soort: vw.soort, x: doel.x, y: doel.y, tot: null, rust: false };
    } else {
      e.werkt = null;
      verder(vw, lijst, datum.jaar);
    }
  }

  // Ontginnen (js/ontginnen.js): wat er op zijn veld in ontginning nog niet af is, rij voor rij. Hij neemt de eerste tegel
  // waar hij nu bij kan (T.volgendeOntginning), werkt er zijn tijd (een boom omhakken, een stronk rooien, of de grond
  // omspitten), staat even, en neemt de volgende. Wat hij niet af krijgt, doen zijn mensen (T.tikOntginnenDag).
  function ontgin(D, e, vw, nu, lijst) {
    const w = D.wereld;
    const wt = e.werkt;
    if (wt && wt.tot != null) {
      if (nu < wt.tot) return;
      if (!wt.rust) {
        klaarMet(D, wt);
        if (IN().ontginnenRust > 0) {
          wt.rust = true;
          wt.tot = nu + IN().ontginnenRust * uur();
          return;
        }
      }
      e.werkt = null;
      return;
    }
    if (e.pad.length) return; // onderweg naar zijn tegel
    const keus = T.volgendeOntginning(w, e, lijst);
    if (!keus) {
      stop(e); // nu kan hij nergens bij (iemand staat ervoor): het volgende beeld kijkt opnieuw
      return;
    }
    const { tegel, staan, werk } = keus;
    const op = staan === tegel ? null : { x: tegel.x, y: tegel.y };
    if (e.tx === staan.x && e.ty === staan.y) {
      let uren = IN()[werk];
      const over = vw.over;
      if (over && over.x === tegel.x && over.y === tegel.y && (over.werk || 'ontginnen') === werk) {
        uren = over.uren;
        delete vw.over;
      }
      e.werkt = { soort: werk, x: staan.x, y: staan.y, op, tot: nu + uren * uur(), rust: false };
      return;
    }
    // Een weg om wat vaststaat (js/lopen.js). Komt hij er toch niet, dan doen zijn mensen het (zoals aan het eind, js/ontginnen.js).
    const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, staan, {});
    if (pad && pad.length) {
      T.geefRoute(e, pad, staan);
      e.werkt = { soort: werk, x: staan.x, y: staan.y, op, tot: null, rust: false };
    } else {
      e.werkt = null;
      klaarMet(D, { soort: werk, x: staan.x, y: staan.y, op });
    }
  }

  // De volgende tegel die hij ontgint, en waar hij daarvoor staat: de eerste van de rij waar hij nu bij kan. Een tegel waar
  // niets op staat, spit hij op de tegel zelf; een boom, een stronk of een struik (T.ontginWerkOp) hakt of rooit hij van een
  // tegel recht ernaast (niet schuin: dan is de stam te ver, en slaat de bijl ernaast, gereedschap/pixelart/werkfiguren.cjs),
  // waar niemand staat en waar hij kan komen. Zo werkt hij van de rand naar binnen. { tegel, staan, werk } of null.
  const NAAST = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  T.volgendeOntginning = function (w, e, lijst) {
    const van = { x: e.tx, y: e.ty };
    const vrij = (x, y) => (x === e.tx && y === e.ty) || (T.isBegaanbaar(w, x, y) && !T.wezenOp(w, x, y, e));
    for (const t of lijst) {
      const werk = T.ontginWerkOp(w, t.x, t.y) || 'ontginnen';
      if (werk === 'ontginnen') {
        if (vrij(t.x, t.y) && T.kanErKomen(w, van, t)) return { tegel: t, staan: t, werk };
        continue;
      }
      for (const [dx, dy] of NAAST) {
        const s = { x: t.x + dx, y: t.y + dy };
        if (vrij(s.x, s.y) && T.kanErKomen(w, van, s)) return { tegel: t, staan: s, werk };
      }
    }
    return null;
  };

  // Een tegel af (js/ontginnen.js): een boom om (het hout naar de schuur, een stronk blijft staan), een stronk of een struik
  // eruit, of de grond omgespit (kale grond, die uit de rij valt).
  function klaarMet(D, wt) {
    if (wt.soort === 'hakken') T.hakBoom(D, wt.op.x, wt.op.y);
    else if (wt.soort === 'rooien') T.rooi(D, wt.op.x, wt.op.y);
    else {
      const veld = T.veldOp(D.wereld, wt.x, wt.y);
      if (veld) T.steekPlag(veld, wt.x, wt.y, D.wereld);
    }
  }

  // Sprokkelen: naar de bosrand (elke dag een ander stuk), daar hout rapen, en met de bundel naar huis. Dan is het
  // voor vandaag gedaan, en is hij bij zijn boerderij.
  function sprokkel(S, D, e, vw, nu) {
    const w = D.wereld;
    const dag = Math.floor(D.kalender.dag);
    const wt = e.werkt;
    if (wt && wt.tot != null) {
      if (nu < wt.tot) return;
      vw.klaar.sprokkelen = dag;
      e.werkt = null;
      const huis = { x: e.thuis.x, y: e.thuis.y, tot: 1 };
      const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, huis, { tot: 1 });
      if (pad && pad.length) T.geefRoute(e, pad, huis);
      return;
    }
    if (e.pad.length) return;
    const rand = bosrandVan(D, e);
    if (!rand) {
      stop(e);
      return;
    }
    let doel = null;
    for (let k = 0; k < rand.length && !doel; k++) {
      const t = rand[(dag + k) % rand.length];
      if ((t.x === e.tx && t.y === e.ty) || !T.wezenOp(w, t.x, t.y, e)) doel = t;
    }
    if (!doel) return;
    if (e.tx === doel.x && e.ty === doel.y) {
      e.werkt = { soort: 'sprokkelen', x: doel.x, y: doel.y, tot: nu + IN().rapen * uur(), rust: false };
      e.draagt = 'bundel';
      return;
    }
    const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, doel, {});
    if (pad && pad.length) {
      T.geefRoute(e, pad, doel);
      e.werkt = { soort: 'sprokkelen', x: doel.x, y: doel.y, tot: null, rust: false };
    } else vw.klaar.sprokkelen = dag; // geen weg: vandaag niet
  }

  // De bewoner van dit poppetje: een nieuw poppetje draagt hem mee, een boer zoeken we op (T.bewonerVan, js/bewoners.js).
  const bewonerVan = (D, e) => e.bewoner || (e.werkAkkers && e.werkAkkers.length ? T.bewonerVan(D, e) : null);

  // Het stuk dat dit poppetje rooit (js/bos.js; werklijst vraag 110, e): het erf van zijn hut als hij het hoofd is van het
  // gezin, of de plek van de werkplaats die hij vroeg (ook een boer die om een put vroeg); of null. Het gezin van wie zijn
  // erf rooit, helpt (T.helpAnker).
  function kavelDieHijRooit(D, e) {
    const g = T.rooitHij(bewonerVan(D, e));
    return g ? g.kavel : null;
  }

  // De houthakker waar dit poppetje werkt, als die een boom heeft om aan te hakken (js/bos.js, g.boom); of null.
  function schuurWaarHijHakt(D, e) {
    const p = bewonerVan(D, e);
    const g = p && p.werk;
    return g && g.klaar && g.boom && T.GEBOUWEN[g.soort].bos && T.BOS_INSTELLINGEN.houthakkerHakt ? g : null;
  }

  // De houthakker aan het werk (js/bos.js; vraag 115): hij hakt aan zijn boom van een tegel recht ernaast, hakUren aan een
  // stuk, en brengt dan een bundel naar de deur van zijn schuur; dan weer terug. Zijn boom valt 's nachts, als hij er
  // genoeg hout uit haalde (T.houthakkerHakte): dat zegt de regel, niet het poppetje.
  function hakHout(S, D, e, vw, nu, g) {
    const w = D.wereld;
    const deur = T.deurVan(w, g);
    const naarDeSchuur = () => {
      const doel = { x: deur.x, y: deur.y, tot: 1 };
      const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, doel, { tot: 1 });
      if (pad && pad.length) T.geefRoute(e, pad, doel);
      else e.draagt = null; // hij komt er niet: dan legt hij hem hier neer
    };
    if (e.draagt === 'bundel') {
      if (e.pad.length) return;
      if (T.afstand(deur, { x: e.tx, y: e.ty }) > 1) {
        naarDeSchuur();
        return;
      }
      e.draagt = null;
    }
    const wt = e.werkt;
    if (wt && wt.tot != null) {
      if (nu < wt.tot) return;
      e.werkt = null;
      e.draagt = 'bundel';
      naarDeSchuur();
      return;
    }
    if (e.pad.length) return; // onderweg naar zijn boom
    // Hakte iemand anders zijn boom vandaag om (wie een erf rooit, een boer die ontgint), dan wacht hij tot morgen: de
    // regel kiest 's nachts een nieuwe (T.boomVanHouthakker).
    if (T.ontginWerkOp(w, g.boom.x, g.boom.y) !== 'hakken') {
      stop(e);
      return;
    }
    const keus = T.volgendeOntginning(w, e, [g.boom]);
    if (!keus) {
      stop(e); // nu kan hij er niet bij (iemand staat ervoor): het volgende beeld kijkt opnieuw
      return;
    }
    const { tegel, staan } = keus;
    if (e.tx === staan.x && e.ty === staan.y) {
      e.werkt = { soort: 'hakken', x: staan.x, y: staan.y, op: { x: tegel.x, y: tegel.y }, tot: nu + T.BOS_INSTELLINGEN.hakUren * uur(), rust: false };
      return;
    }
    const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, staan, {});
    if (pad && pad.length) {
      T.geefRoute(e, pad, staan);
      e.werkt = { soort: 'hakken', x: staan.x, y: staan.y, op: { x: tegel.x, y: tegel.y }, tot: null, rust: false };
    } else stop(e);
  }

  // De jager waar dit poppetje werkt, als die wild heeft om op te jagen (js/beesten.js, g.wild); of null.
  function hutWaarHijJaagt(D, e) {
    const p = T.bewonerVan(D, e);
    const g = p && p.werk;
    return g && g.klaar && g.soort === 'jager' && g.wild ? g : null;
  }

  // Waar de jager loert: op loerAfstand tegels van de leider van zijn groep, aan de kant van zijn hut (net buiten waar
  // de dieren schuw worden, T.BEESTEN_INSTELLINGEN.schuw), op een tegel waar hij kan staan en kan komen; of null.
  function loerPlek(w, e, leider, deur) {
    const L = T.tegelVan(leider);
    const d = Math.hypot(deur.x - L.x, deur.y - L.y) || 1;
    const A = T.BEESTEN_INSTELLINGEN.jager.loerAfstand;
    for (let r = A; r <= A + 4; r++) {
      for (const hoek of [0, 0.4, -0.4, 0.8, -0.8]) {
        const c = Math.cos(hoek);
        const z = Math.sin(hoek);
        const ux = ((deur.x - L.x) * c - (deur.y - L.y) * z) / d;
        const uy = ((deur.x - L.x) * z + (deur.y - L.y) * c) / d;
        const t = { x: Math.round(L.x + ux * r), y: Math.round(L.y + uy * r) };
        if (T.isBegaanbaar(w, t.x, t.y) && T.kanErKomen(w, { x: e.tx, y: e.ty }, t)) return t;
      }
    }
    return null;
  }

  // De jager aan het werk (js/beesten.js; vraag 116, stap 3a): hij loopt het bos in naar de groep waar hij op jaagt,
  // loert er jager.loerUren aan een stuk vanaf jager.loerAfstand tegels, en gaat dan terug naar zijn hut; dan weer
  // erheen. Wat hij schiet, zegt 's nachts de regel (T.jagerJaagde), niet het poppetje.
  function jaag(S, D, e, nu, g) {
    const w = D.wereld;
    const deur = T.deurVan(w, g);
    const wt = e.werkt;
    if (wt && wt.soort === 'naarHuis') {
      if (e.pad.length) return;
      e.werkt = null;
      return;
    }
    if (wt && wt.tot != null) {
      if (nu < wt.tot) return;
      const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, { x: deur.x, y: deur.y, tot: 1 }, { tot: 1 });
      e.werkt = { soort: 'naarHuis', x: deur.x, y: deur.y, tot: null, rust: false };
      if (pad && pad.length) T.geefRoute(e, pad, { x: deur.x, y: deur.y, tot: 1 });
      else e.werkt = null;
      return;
    }
    if (e.pad.length) return; // onderweg naar zijn groep
    const groep = T.beestenVan(D).find(({ G }) => G.thuis.x === g.wild.x && G.thuis.y === g.wild.y);
    const leider = groep && (groep.leden.find((x) => x.leider) || groep.leden[0]);
    if (!leider) {
      stop(e);
      return;
    }
    if (wt && e.tx === wt.x && e.ty === wt.y) {
      e.werkt = { soort: 'loeren', x: wt.x, y: wt.y, op: T.tegelVan(leider), tot: nu + T.BEESTEN_INSTELLINGEN.jager.loerUren * uur(), rust: false };
      return;
    }
    const plek = loerPlek(w, e, leider, deur);
    if (!plek) {
      stop(e);
      return;
    }
    const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, plek, {});
    if (pad && pad.length) {
      T.geefRoute(e, pad, plek);
      e.werkt = { soort: 'loeren', x: plek.x, y: plek.y, op: T.tegelVan(leider), tot: null, rust: false };
    } else if (e.tx === plek.x && e.ty === plek.y) {
      e.werkt = { soort: 'loeren', x: plek.x, y: plek.y, op: T.tegelVan(leider), tot: nu + T.BEESTEN_INSTELLINGEN.jager.loerUren * uur(), rust: false };
    } else stop(e);
  }

  // De wijnboerderij waar dit poppetje woont, als hij daar nu plukt (js/wijngaard.js): in de pluktijd, zolang er volle
  // ranken zijn, of als hij nog een mand naar huis moet brengen; of null. Wie te jong of te oud is om te werken, plukt niet.
  function wijngaardWaarHijPlukt(D, e, dag) {
    const p = T.bewonerVan(D, e);
    const g = p && p.huis;
    if (!g || g.soort !== 'wijnboerderij' || p.weg || !T.LEEFTIJDEN[p.leeftijd] || T.LEEFTIJDEN[p.leeftijd].werkt == null) return null;
    if (e.mand > 0) return g;
    return T.isPluktijd(g, dag) && T.volleRanken(D, g, dag).length ? g : null;
  }

  // Plukken (js/wijngaard.js; vraag 136): naar de dichtste volle rank die niemand anders plukt, van een tegel ernaast,
  // plukUren aan een stuk; de druiven gaan in zijn mand, en is die vol (of is er niets meer te plukken), dan brengt hij
  // hem naar de deur van het huis. Pas dan is de wijn binnen (Marcel, 8 okt: "Alles telt pas als het binnen is").
  function pluk(S, D, e, nu, g) {
    const w = D.wereld;
    const dag = D.kalender.dag;
    const deur = T.deurVan(w, g);
    const hier = { x: e.tx, y: e.ty };
    const binnen = () => {
      T.wijnBinnen(D, e.mand || 0);
      e.mand = 0;
      e.draagt = null;
    };
    const naarHuis = () => {
      e.draagt = 'mand';
      e.werkt = null;
      const doel = { x: deur.x, y: deur.y, tot: 1 };
      const pad = T.zoekRoute(w, hier, doel, { tot: 1 });
      if (pad && pad.length) T.geefRoute(e, pad, doel);
      else if (T.afstand(deur, hier) <= 1) binnen();
      else binnen(); // hij komt er niet: dan brengt hij hem toch binnen, langs een andere weg
    };
    if (e.draagt === 'mand') {
      if (e.pad.length) return;
      if (T.afstand(deur, hier) > 1) naarHuis();
      else binnen();
      return;
    }
    const wt = e.werkt;
    if (wt && wt.soort === 'plukken' && wt.tot != null) {
      if (nu < wt.tot) return;
      const v = T.voorwerpOp(w, wt.op.x, wt.op.y);
      if (v && v.soort === 'wijnrank' && T.rankStand(v, dag) === 'vol') {
        T.plukRank(v, dag);
        e.mand = (e.mand || 0) + 1;
      }
      e.werkt = null;
      if (e.mand >= T.WIJNGAARD_INSTELLINGEN.mand || !T.volleRanken(D, g, dag).length) naarHuis();
      return;
    }
    if (e.pad.length) return; // onderweg naar zijn rank
    const bezet = new Set(w.wezens.filter((o) => o !== e && o.werkt && o.werkt.soort === 'plukken' && o.werkt.op).map((o) => `${o.werkt.op.x},${o.werkt.op.y}`));
    const vol = T.volleRanken(D, g, dag).filter((v) => !bezet.has(`${v.x},${v.y}`)).sort((a, b) => T.afstand(a, hier) - T.afstand(b, hier));
    if (!vol.length) {
      if (e.mand > 0) naarHuis();
      else stop(e);
      return;
    }
    let keus = null;
    const vrij = (x, y) => (x === e.tx && y === e.ty) || (T.isBegaanbaar(w, x, y) && !T.wezenOp(w, x, y, e));
    for (const t of vol.slice(0, 6)) {
      for (const [dx, dy] of NAAST) {
        const st = { x: t.x + dx, y: t.y + dy };
        if (vrij(st.x, st.y) && T.kanErKomen(w, hier, st)) {
          keus = { rank: t, staan: st };
          break;
        }
      }
      if (keus) break;
    }
    if (!keus) {
      stop(e); // nu kan hij er niet bij: het volgende beeld kijkt opnieuw
      return;
    }
    const { rank, staan } = keus;
    const tot = e.tx === staan.x && e.ty === staan.y ? nu + T.WIJNGAARD_INSTELLINGEN.plukUren * uur() : null;
    if (tot == null) {
      const pad = T.zoekRoute(w, hier, staan, {});
      if (!pad || !pad.length) {
        stop(e);
        return;
      }
      T.geefRoute(e, pad, staan);
    }
    e.werkt = { soort: 'plukken', x: staan.x, y: staan.y, op: { x: rank.x, y: rank.y }, tot, rust: false };
  }

  // De oogst binnenhalen (js/akkers.js, T.SCHOVEN_INSTELLINGEN; vraag 140): de akkers waar dit poppetje schoven bindt of
  // naar de schuur draagt, en de boerderij waar ze heen gaan; of null. De boer zelf als hij niets meer te maaien heeft, en
  // de boerin en de grote kinderen van zijn boerderij (zoals T.helpAnker hieronder), zolang er zwad of hokken op zijn
  // akkers staan, of zolang hij nog schoven draagt.
  function oogstVan(D, e) {
    const p = T.bewonerVan(D, e);
    if (!p || !p.huis || p.weg) return null;
    // Een dagloner helpt de boerderij die hem nam (T.kiesDagloners hieronder), zolang hij geen werk heeft.
    if (p.huis.soort !== 'boerderij') {
      const g = !p.werk && T.SCHOVEN_INSTELLINGEN.dagloners && p.dagloner;
      const boer = g && D.gebouwen.includes(g) ? boerVanHuis(D, g) : null;
      if (!boer || (!(e.vracht > 0) && !boer.werkAkkers.some((a) => a.schoven && a.schoven.size))) return null;
      return { akkers: boer.werkAkkers, schuur: g };
    }
    let boer = e.werkAkkers && e.werkAkkers.length ? e : null;
    if (boer) {
      if (e.maait || e.oogstDoel) return null;
    } else {
      if (p.leeftijd !== 'volwassen' && p.leeftijd !== 'jong') return null;
      if (p.werk && p.werk !== p.huis) return null;
      boer = boerVanHuis(D, p.huis);
      if (!boer) return null;
    }
    if (!(e.vracht > 0) && !boer.werkAkkers.some((a) => a.schoven && a.schoven.size)) return null;
    return { akkers: boer.werkAkkers, schuur: p.huis };
  }

  // De dagloners (vraag 140; Marcel, 8 okt: "Dagloners is een goed idee", en "mensen in het dorp"): elke nacht kiest het
  // dorp wie morgen bij welke boerderij helpt binden en dragen (`p.dagloner`). Een boerderij neemt er hulp bij als de oogst
  // er rijp is of er schoven op het veld liggen, tot daglonersPerBoerderij (T.SCHOVEN_INSTELLINGEN); een dagloner is een
  // volwassene of een grote zoon of dochter die niet op een boerderij woont, kan werken (T.kanWerken in js/bewoners.js) en
  // geen werk heeft, en gaat naar de dichtste boerderij met plaats. Krijgt hij werk, dan gaat hij daarheen (oogstVan).
  T.kiesDagloners = function (D, dag) {
    const B = D.bewoners;
    if (!B || !B.mensen) return;
    for (const p of B.mensen) if (p.dagloner) p.dagloner = null;
    const IN = T.SCHOVEN_INSTELLINGEN;
    if (!IN.dagloners || !D.wereld) return;
    const d = T.datumVanDag(dag);
    const rijp = T.akkerStadium(d.maand, d.dagVanMaand) === 'rijp';
    const boerderijen = (D.gebouwen || []).filter((g) => {
      if (g.soort !== 'boerderij' || !g.klaar) return false;
      const boer = boerVanHuis(D, g);
      return boer && boer.werkAkkers.some((a) => (a.schoven && a.schoven.size) || (rijp && T.bestemmingVan(a) === 'akker'));
    });
    if (!boerderijen.length) return;
    const plaats = new Map(boerderijen.map((g) => [g, IN.daglonersPerBoerderij]));
    const deurVan = (g) => T.deurVan(D.wereld, g) || { x: g.x, y: g.y };
    for (const p of B.mensen) {
      if (!p.huis || p.huis.soort === 'boerderij' || p.werk || !p.wezen || p.komt) continue;
      if (p.leeftijd !== 'volwassen' && p.leeftijd !== 'jong') continue;
      if (!T.kanWerken(p)) continue;
      const thuis = deurVan(p.huis);
      let beste = null;
      for (const g of boerderijen) {
        if (!(plaats.get(g) > 0)) continue;
        if (!beste || T.afstand(deurVan(g), thuis) < T.afstand(deurVan(beste), thuis)) beste = g;
      }
      if (!beste) break;
      p.dagloner = beste;
      plaats.set(beste, plaats.get(beste) - 1);
    }
  };

  // Binden en dragen (vraag 140): eerst wat droog in de hokken staat, naar de schuur (perVracht tegels in één keer), dan
  // het zwad binden tot hokken, de dichtste tegel eerst die niemand anders neemt. In de schuur is het graan binnen.
  function haalBinnen(S, D, e, nu, o) {
    const w = D.wereld;
    const dag = D.kalender.dag;
    const deur = T.deurVan(w, o.schuur);
    const hier = { x: e.tx, y: e.ty };
    const inDeSchuur = () => {
      T.haalSchovenBinnen(D, e.vracht || 0);
      e.vracht = 0;
      e.draagt = null;
    };
    const naarDeSchuur = () => {
      e.draagt = 'schoof';
      e.werkt = null;
      const doel = { x: deur.x, y: deur.y, tot: 1 };
      const pad = T.zoekRoute(w, hier, doel, { tot: 1 });
      if (pad && pad.length) T.geefRoute(e, pad, doel);
      else inDeSchuur(); // hij komt er niet, of hij staat er al
    };
    if (e.draagt === 'schoof') {
      if (e.pad.length) return;
      if (T.afstand(deur, hier) > 1) naarDeSchuur();
      else inDeSchuur();
      return;
    }
    const wt = e.werkt;
    if (wt && wt.soort === 'binden' && wt.tot != null) {
      if (nu < wt.tot) return;
      const a = T.veldOp(w, wt.x, wt.y);
      if (a) T.bindSchoof(a, wt.x, wt.y, dag);
      e.werkt = null;
      return;
    }
    if (e.pad.length) return; // onderweg
    const bezet = new Set(w.wezens.filter((x) => x !== e && x.werkt && (x.werkt.soort === 'binden' || x.werkt.soort === 'dragen')).map((x) => `${x.werkt.x},${x.werkt.y}`));
    const lijst = (vraag) => o.akkers.flatMap((a) => vraag(a).map((t) => ({ x: t.x, y: t.y, a })))
      .filter((t) => !bezet.has(`${t.x},${t.y}`))
      .sort((p, q) => T.afstand(p, hier) - T.afstand(q, hier));
    const naar = (t, soort) => {
      if (e.tx === t.x && e.ty === t.y) return true;
      const pad = T.zoekRoute(w, hier, t, {});
      if (pad && pad.length) {
        T.geefRoute(e, pad, t);
        e.werkt = { soort, x: t.x, y: t.y, op: { x: t.x, y: t.y }, tot: null, rust: false };
      } else stop(e);
      return false;
    };
    const droog = lijst((a) => T.droogInHokken(a, dag));
    if (droog.length) {
      const t = droog[0];
      if (!naar(t, 'dragen')) return;
      const mee = droog.filter((d) => d.a === t.a).slice(0, T.SCHOVEN_INSTELLINGEN.perVracht);
      e.vracht = (e.vracht || 0) + T.neemSchoven(t.a, mee);
      naarDeSchuur();
      return;
    }
    const zwad = lijst((a) => T.teBinden(a));
    if (!zwad.length) {
      stop(e);
      return;
    }
    const t = zwad[0];
    if (!naar(t, 'binden')) return;
    e.werkt = { soort: 'binden', x: t.x, y: t.y, op: { x: t.x, y: t.y }, tot: nu + T.SCHOVEN_INSTELLINGEN.bindUren * uur(), rust: false };
  }

  // Dorsen (vraag 140): in de winter, als het hout geraapt is, dorst de boer in de deur van zijn schuur, met zijn vlegel
  // naar buiten. Alleen beeld: het graan is al binnen.
  function dors(S, D, e, nu) {
    const p = T.bewonerVan(D, e);
    const g = p && p.huis;
    if (!g || g.soort !== 'boerderij') {
      stop(e);
      return;
    }
    const deur = T.deurVan(D.wereld, g);
    const wt = e.werkt;
    if (wt && wt.soort === 'dorsen' && wt.tot != null) return;
    if (e.pad.length) return;
    const r = T.voetVanGebouw(g);
    const weg = { x: Math.sign(deur.x - (r.x + r.b / 2 - 0.5)), y: Math.sign(deur.y - (r.y + r.h / 2 - 0.5)) };
    const op = { x: deur.x + weg.x, y: deur.y + weg.y };
    if (e.tx === deur.x && e.ty === deur.y) {
      e.werkt = { soort: 'dorsen', x: deur.x, y: deur.y, op, tot: nu + 24 * uur(), rust: false };
      return;
    }
    const pad = T.zoekRoute(D.wereld, { x: e.tx, y: e.ty }, deur, {});
    if (pad && pad.length) {
      T.geefRoute(e, pad, deur);
      e.werkt = { soort: 'dorsen', x: deur.x, y: deur.y, op, tot: null, rust: false };
    } else stop(e);
  }

  // Elk beeld, na het maaien (T.werkOogstBij) en vóór het dwalen (T.dwaal): elke boer doet zijn werk van vandaag, en wie
  // zijn erf rooit, rooit (met dezelfde bijl en op dezelfde manier als een boer die bos ontgint). Waar je bent vanuit
  // js/main.js, de andere dorpen vanuit T.werkDorpBij (js/dorp.js).
  T.werkVeldwerkBij = function (S, D) {
    const w = D.wereld;
    if (!w || !w.akkers || !w.akkers.length || !D.kalender) return;
    const dag = D.kalender.dag;
    const datum = T.datumVanDag(dag);
    // Gewerkt wordt in de werkuren (js/dag.js), en niet op een hele feestdag (js/feesten.js).
    const deel = T.dagdeelVan(dag, false);
    const werktijd = deel === 'werk' && !T.vrijeDag(D, dag);
    const nu = S.wereldTijd || 0;
    for (const e of w.wezens) {
      if (e.dood) continue;
      const kavel = kavelDieHijRooit(D, e);
      const schuur = kavel ? null : schuurWaarHijHakt(D, e);
      const hut = kavel || schuur ? null : hutWaarHijJaagt(D, e);
      const wijn = kavel || schuur || hut ? null : wijngaardWaarHijPlukt(D, e, dag);
      const oogst = kavel || schuur || hut || wijn ? null : oogstVan(D, e);
      if (!kavel && !schuur && !hut && !wijn && !oogst && (!e.werkAkkers || !e.werkAkkers.length)) continue;
      // Wie hout naar huis bracht, legt het bij zijn deur neer.
      if (e.draagt && !e.pad.length && e.thuis && T.afstand(e.thuis, { x: e.tx, y: e.ty }) <= 1) e.draagt = null;
      // De schaft: brood op de akker (js/dag.js). Wie op zijn land werkt, blijft er staan tot het werk weer begint (wie
      // er net heen liep, komt er nog aan), en neemt dan de volgende tegel.
      if (deel === 'schaft' && e.werkt && !T.vrijeDag(D, dag) && magWerken(S, D, e)) {
        onthoudPlag(e, nu);
        if (e.werkt.tot != null) Object.assign(e.werkt, { rust: true, schaft: true });
        continue;
      }
      if (e.werkt && e.werkt.schaft) {
        delete e.werkt.schaft;
        e.werkt.tot = Math.min(e.werkt.tot, nu);
      }
      const soort = werktijd && magWerken(S, D, e) ? (kavel ? 'rooien' : schuur ? 'hout' : hut ? 'jagen' : wijn ? 'plukken' : oogst ? 'binnenhalen' : T.veldwerkVandaag(D, e, datum)) : null;
      if (!soort) {
        onthoudPlag(e, nu);
        stop(e);
        continue;
      }
      let vw = e.veldwerk;
      if (!vw || vw.soort !== soort) {
        stop(e);
        vw = e.veldwerk = { soort, i: null, gedaan: 0, klaar: (vw && vw.klaar) || {} };
      }
      if (soort === 'sprokkelen') sprokkel(S, D, e, vw, nu);
      else if (soort === 'rooien') ontgin(D, e, vw, nu, T.teRooienOp(D, kavel));
      else if (soort === 'hout') hakHout(S, D, e, vw, nu, schuur);
      else if (soort === 'jagen') jaag(S, D, e, nu, hut);
      else if (soort === 'plukken') pluk(S, D, e, nu, wijn);
      else if (soort === 'binnenhalen') haalBinnen(S, D, e, nu, oogst);
      else if (soort === 'dorsen') dors(S, D, e, nu);
      else opHetLand(S, D, e, vw, nu, datum);
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Wie helpt
  // ---------------------------------------------------------------------------------------------

  // De boer van een boerderij: de bewoner van dat huis met akkers.
  function boerVanHuis(D, g) {
    const q = D.bewoners && D.bewoners.mensen.find((q) => q.huis === g && q.wezen && q.wezen.werkAkkers && q.wezen.werkAkkers.length);
    return q ? q.wezen : null;
  }

  // Helpt dit poppetje nu op het veld (vraag 111, c)? De boerin en de grote kinderen van een boerderij helpen bij het
  // zaaien, de oogst en het ontginnen (vraag 107: een winter in het bos is werk voor het hele gezin): overdag, zolang hun
  // boer op zijn eigen land zaait, maait of ontgint, blijven ze dicht bij hem. Wie
  // ergens anders werkt, gaat daarheen. Het anker voor T.dagAnker (js/dag.js) in de werkuren, of null. Het loopt met de
  // boer mee, dus zonder veld (`veld: false`; een veld is voor een plek waar velen heen gaan, js/lopen.js).
  T.helpAnker = function (D, e) {
    if (e.werkAkkers && e.werkAkkers.length) return null;
    const p = e.bewoner;
    if (!p || !p.huis || p.weg || p.komt) return null;
    if (p.leeftijd !== 'volwassen' && p.leeftijd !== 'jong') return null;
    // Het gezin van wie zijn erf rooit (js/erven.js; werklijst vraag 110, e) helpt net zo: zolang hij hakt of rooit,
    // blijven ze dicht bij hem. Rooit hij waar zijn huis groter wordt (vraag 130), dan helpt wie geen werk heeft.
    if (p.huis.wachtOpRooien || (p.huis.groeitNaRooien && !p.werk)) {
      const hoofd = p.hoofd && p.hoofd.wezen;
      if (!hoofd || hoofd.dood || !hoofd.werkt || !ONTGINWERK.has(hoofd.werkt.soort)) return null;
      return { x: hoofd.tx, y: hoofd.ty, straal: IN().helpStraal, veld: false };
    }
    if (!IN().aan || p.huis.soort !== 'boerderij') return null;
    if (p.werk && p.werk !== p.huis) return null;
    const boer = boerVanHuis(D, p.huis);
    if (!boer || boer.dood || boer.binnen) return null;
    if (!(boer.maait || boer.oogstDoel || (boer.werkt && (boer.werkt.soort === 'zaaien' || ONTGINWERK.has(boer.werkt.soort))))) return null;
    // Wie een boom omhakt, staat ernaast, soms net buiten zijn veld: dan telt de boom.
    const aan = (boer.werkt && boer.werkt.op) || { x: boer.tx, y: boer.ty };
    const v = T.veldOp(D.wereld, aan.x, aan.y);
    if (!v || !boer.werkAkkers.includes(v)) return null;
    return { x: boer.tx, y: boer.ty, straal: IN().helpStraal, veld: false };
  };
})(globalThis.Spel = globalThis.Spel || {});
