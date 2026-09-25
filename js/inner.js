// De inner: de man van de heer die in oogstmaand komt tellen (ontwerp/spel.md, "Rijk worden en arm
// lijken: de inner", besloten door Marcel op 24 sep 2026; werklijst punt 6). Twee helften, net als
// js/heer.js:
//   - de regels, zonder scherm (test/inner.test.cjs): wanneer hij komt (T.tikInnerDag), wat hij
//     ziet (T.innerKijkt: in een rechte lijn, tot zoveel tegels, en huizen en schuren houden zijn
//     blik tegen), zijn rapport (T.maakRapport) en zijn argwaan.
//   - zijn komen en gaan als poppetje (T.werkInnerBij): loopt de schout naast hem, dan volgt hij de
//     schout; anders loopt hij zijn eigen ronde, langs wat hij nog niet zag, tot zijn geduld op is.
// Zijn rapport is de rekening van de heer (js/heer.js, T.eisVanDeHeer): wat hij niet zag, betaal je
// dat jaar niet. Zijn argwaan doet vier dingen: de heer vraagt meer, soldaten doorzoeken het dorp,
// hij komt onverwacht terug, en bij heel hoge argwaan telt het rapport niet meer.
//
// Alleen waar ook de heer komt: een wereld met een brink (js/heer.js). Daarbuiten blijft dit stil.
(function (T) {
  'use strict';

  // Alle getallen in één blok, om samen met Marcel bij te stellen (ook in de werkbank van de
  // spelregels, js/opties.js). Een eerste gok.
  T.INNER_INSTELLINGEN = {
    // Hij komt midden in de oogst, als er op de velden en in de schuren iets te tellen is, en je
    // hoort het zoveel dagen vooraf: tijd om graan weg te zetten.
    komt: { maand: 'oogstmaand', dag: 15 },
    aankondiging: 10,
    // Zo ver kijkt hij, in tegels, in een rechte lijn; huizen en schuren houden zijn blik tegen.
    zicht: 7,
    // Zoveel stappen loopt hij, dan gaat hij met zijn rapport. Alleen ziet hij in die tijd het hele
    // gehucht; wie met hem meeloopt, kan hem langs de lege kant leiden tot zijn geduld op is.
    geduld: 90,
    // Stilstaan (naast een schout die niet verder loopt) kost ook geduld: een stap per zoveel
    // seconden. Iets meer dan lopen, want wachten doet hij niet graag.
    stilPerStap: 0.5,
    // Loop je zo dichtbij, dan volgt hij jou; loop je verder weg dan volgLos, dan gaat hij zijn eigen
    // ronde weer.
    volgAfstand: 2,
    volgLos: 5,
    // Het graan: van elke gezaaide akkertegel die hij zag, verwacht hij een volle oogst
    // (T.GRAAN_PER_TEGEL). Ziet hij in de schuren en op die velden samen minder dan dit deel daarvan,
    // dan groeit zijn argwaan met wat het scheelt, keer graanArgwaan.
    graanVerwacht: 0.6,
    graanArgwaan: 1,
    // Komt hij onverwacht terug en ligt er dan veel meer graan dan de eerste keer (meer dan dit deel
    // van wat hij verwachtte), dan weet hij genoeg.
    graanErbij: 0.2,
    // Wat de argwaan (0..1) doet (Marcel, 24 sep: alle vier):
    terugkomenVanaf: 0.4, // hij komt onverwacht terug, zoveel dagen na zijn bezoek:
    terugNaDagen: { van: 20, tot: 45 },
    doorzoekenVanaf: 0.5, // op Sint-Maarten doorzoeken de soldaten het dorp
    rapportTeltNietVanaf: 0.8, // de heer vraagt toch naar alles
    toeslag: 0.5, // de heer vraagt zoveel meer bij volle argwaan, en naar rato bij minder
    // Op Sint-Maarten kijkt de heer zelf rond van de brink, zo ver (0: hij kijkt niet). Een gebouw
    // dat hij dan ziet en dat niet in het rapport stond, komt alsnog op de rekening en kost zoveel
    // argwaan: "Wat is DÁT, schout?"
    heerZicht: 6,
    betrapt: 0.15,
    // Na Sint-Maarten blijft er zoveel van zijn argwaan over.
    naSintMaarten: 0.5,
  };

  const IN = () => T.INNER_INSTELLINGEN;
  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  const inJaar = (maand, dag) => maand * T.DAGEN_PER_MAAND + (dag - 1);
  const dagNu = (S) => Math.floor(S.kalender ? S.kalender.dag : 0);
  const sleutel = (x, y) => x + ',' + y;

  function bericht(tekst, soort) {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  }

  T.nieuweInner = function () {
    return {
      argwaan: 0, // 0..1
      waarom: [], // wat hem argwanend maakte, voor de balk
      bezoek: null, // zijn bezoek nu, zie T.innerKomt
      rapport: null, // wat hij dit jaar zag, tot de heer op Sint-Maarten betaald is
      terugOp: null, // de dag waarop hij onverwacht terugkomt
      teruggeweest: false,
    };
  };

  // Waar hij kan komen: een wereld met een brink, net als de heer (js/heer.js). En alleen als de
  // heer de rekening op zijn rapport maakt: ziet de heer alles zelf (de optie in de spelregels,
  // js/opties.js), dan komt er geen inner.
  function magKomen(S) {
    const w = S.wereld;
    const H = T.HEER_INSTELLINGEN;
    return !!(w && (w.heer || w.marskramer)) && (!H || H.rekening === 'rapport');
  }

  // De argwaan bijstellen, tussen 0 en 1, met een reden voor de balk.
  T.zetArgwaan = function (S, erbij, waarom) {
    const I = S.inner || (S.inner = T.nieuweInner());
    I.argwaan = Math.max(0, Math.min(1, I.argwaan + erbij));
    if (waarom && erbij > 0 && !I.waarom.includes(waarom)) I.waarom.push(waarom);
    if (T.ui && T.ui.toonArgwaan) T.ui.toonArgwaan(S);
  };

  // ---------------------------------------------------------------------------------------------
  // Wat hij ziet
  // ---------------------------------------------------------------------------------------------

  // De voet van een gebouw: waar hij staat en hoe groot hij is.
  function voetVan(g) {
    if (g.voorwerp && g.voorwerp.beslaat) return { x: g.x, y: g.y, b: g.voorwerp.beslaat[0], h: g.voorwerp.beslaat[1] };
    const v = g.voet || (T.gebouwVoet && T.gebouwVoet(g.soort)) || { b: 1, h: 1 };
    return { x: g.x, y: g.y, b: v.b, h: v.h };
  }

  // Wat hij kan zien: gebouwen met een tekening (een verstopplek heeft er geen, en die ziet hij dus
  // niet zomaar; zie werklijst punt 6, stap 2).
  function zichtbaarGebouw(g) {
    const soort = T.GEBOUWEN && T.GEBOUWEN[g.soort];
    return !!(soort && soort.tekening);
  }

  // Ziet hij deze tegel van waar hij staat? Binnen zijn zicht, en niets ertussen (T.zichtTussen,
  // js/wereld.js: de begin- en eindtegel tellen niet mee, dus een muur zelf zie je wel).
  function ziet(w, van, x, y, zicht) {
    const dx = x - van.x;
    const dy = y - van.y;
    if (dx * dx + dy * dy > zicht * zicht) return false;
    return !w.tegels || T.zichtTussen(w, van, { x, y });
  }

  // Ziet hij een tegel van dit gebouw? Dan ziet hij het gebouw.
  function zietGebouw(w, van, g, zicht) {
    const v = voetVan(g);
    for (let dy = 0; dy < v.h; dy++) {
      for (let dx = 0; dx < v.b; dx++) if (ziet(w, van, v.x + dx, v.y + dy, zicht)) return true;
    }
    return false;
  }

  // Eén keer rondkijken vanaf `van`: wat hij nu ziet, komt in zijn bezoek. Geeft de namen van de
  // gebouwen die hij voor het eerst zag, voor een melding.
  T.innerKijkt = function (S, van) {
    const b = S.inner && S.inner.bezoek;
    const w = S.wereld;
    if (!b || !w) return [];
    const nieuw = [];
    for (const g of S.gebouwen || []) {
      if (b.gebouwen.has(g) || !zichtbaarGebouw(g) || !zietGebouw(w, van, g, IN().zicht)) continue;
      b.gebouwen.add(g);
      nieuw.push(T.GEBOUWEN[g.soort].naam);
    }
    for (const akker of w.akkers || []) {
      for (const t of T.akkerTegels(akker)) {
        const k = sleutel(t.x, t.y);
        if (!b.tegels.has(k) && ziet(w, van, t.x, t.y, IN().zicht)) b.tegels.add(k);
      }
    }
    return nieuw;
  };

  // Op Sint-Maarten, als de heer op de brink staat (js/heer.js, T.heerStaatErOp), kijkt hij zelf
  // rond. Wat hij van daar ziet en niet in het rapport van zijn inner stond (gebouwd na zijn
  // bezoek, of wat de inner miste), komt alsnog op de rekening, en elk ding maakt argwanend. Zo
  // klopt zijn brief ook een beetje: "Wat er tot Sint-Maarten bijkomt, zien Wij ook." Alleen wat
  // je van de brink ziet. Geeft de namen van wat hij vond.
  T.heerKijktRond = function (S) {
    const I = S.inner;
    const w = S.wereld;
    const plek = w && (w.heer || w.marskramer);
    const H = T.HEER_INSTELLINGEN;
    if (!I || !I.rapport || !plek || !(H && H.rekening === 'rapport') || !(IN().heerZicht > 0)) return [];
    const r = I.rapport;
    const betrapt = [];
    for (const g of S.gebouwen || []) {
      if (r.gezien.has(g) || !zichtbaarGebouw(g) || !zietGebouw(w, plek, g, IN().heerZicht)) continue;
      r.gezien.add(g);
      r.gebouwen[g.soort] = (r.gebouwen[g.soort] || 0) + 1;
      r.woonruimte += T.GEBOUWEN[g.soort].woonruimte || 0;
      betrapt.push(T.GEBOUWEN[g.soort].naam);
    }
    if (betrapt.length) {
      T.zetArgwaan(S, betrapt.length * IN().betrapt, 'de heer zag op de brink wat niet in het rapport stond');
      bericht(`"Wat is DÁT, schout?" De heer wijst: ${betrapt.join(', ')}. "Dat staat niet in het rapport van Onze inner. Nu wel."`, 'gevaar');
    }
    return betrapt;
  };

  // Is er nog iets wat hij wil zien? Een gebouw dat hij nog niet zag, of een akker waarvan hij nog
  // minder dan de helft zag. [{ x, y }] van waar het is, of een lege lijst.
  function nogTeZien(S) {
    const b = S.inner.bezoek;
    const doelen = [];
    const overslaan = b.overslaan || new Set();
    for (const g of S.gebouwen || []) {
      if (b.gebouwen.has(g) || !zichtbaarGebouw(g) || overslaan.has(g)) continue;
      const v = voetVan(g);
      doelen.push({ x: v.x + Math.floor(v.b / 2), y: v.y + Math.floor(v.h / 2), gebouw: g });
    }
    for (const akker of (S.wereld && S.wereld.akkers) || []) {
      if (overslaan.has(akker)) continue;
      const tegels = T.akkerTegels(akker);
      const gezien = tegels.filter((t) => b.tegels.has(sleutel(t.x, t.y))).length;
      if (gezien < tegels.length / 2) doelen.push({ x: akker.x + Math.floor(akker.b / 2), y: akker.y + Math.floor(akker.h / 2), akker });
    }
    return doelen;
  }
  T.innerNogTeZien = (S) => nogTeZien(S);

  // ---------------------------------------------------------------------------------------------
  // Het rapport: wat hij zag, en wat de heer ervan vraagt (js/heer.js)
  // ---------------------------------------------------------------------------------------------

  // Het rapport van dit bezoek, samen met wat hij eerder dit jaar zag (bij een tweede bezoek).
  // { jaar, gebouwen: { soort: aantal }, woonruimte, tegels, graanGezien, graanVerwacht }.
  T.maakRapport = function (S) {
    const I = S.inner;
    const b = I.bezoek;
    const vorig = I.rapport;
    const alle = new Set(b.gebouwen);
    if (vorig && vorig.gezien) for (const g of vorig.gezien) alle.add(g);
    const gebouwen = {};
    let woonruimte = 0;
    for (const g of alle) {
      gebouwen[g.soort] = (gebouwen[g.soort] || 0) + 1;
      woonruimte += (T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].woonruimte) || 0;
    }
    // Het graan: wat nog staat op de velden die hij zag (gezaaid en niet gemaaid), en wat er in de
    // schuren ligt (wat je verstopte, ligt daar niet). Hij verwacht van elke gezaaide tegel een
    // volle oogst: wat die tegel geeft (T.oogstPerTegel, js/akkers.js), dus op een uitgeputte akker
    // minder, want dunner graan ziet hij ook staan. Een weide of braak is gezien land (de pacht per
    // akkertegel telt het mee, zoals een braakliggende tegel), maar daar staat geen graan.
    const tegelsGezien = new Set(b.tegels);
    if (vorig && vorig.tegelsGezien) for (const k of vorig.tegelsGezien) tegelsGezien.add(k);
    let tegels = 0;
    let verwacht = 0;
    let staand = 0;
    const datum = T.datumVanDag(dagNu(S));
    const basis = T.akkerStadium ? T.akkerStadium(datum.maand, datum.dagVanMaand) : 'gemaaid';
    for (const akker of (S.wereld && S.wereld.akkers) || []) {
      const isAkker = !T.bestemmingVan || T.bestemmingVan(akker) === 'akker';
      const perTegel = T.oogstPerTegel ? T.oogstPerTegel(akker) : T.GRAAN_PER_TEGEL || 0;
      for (const t of T.akkerTegels(akker)) {
        const k = sleutel(t.x, t.y);
        if (!tegelsGezien.has(k)) continue;
        tegels++;
        if (!isAkker || (akker.ongezaaid && akker.ongezaaid.has(k))) continue;
        verwacht += perTegel;
        const stadium = T.akkerTegelStadium ? T.akkerTegelStadium(akker, t.x, t.y, basis) : basis;
        if (stadium === 'rijp' || stadium === 'groen' || stadium === 'kiemend') staand += perTegel;
      }
    }
    const nuGezien = staand + ((S.voorraad && S.voorraad.graan) || 0);
    return {
      jaar: datum.jaar, gebouwen, woonruimte, tegels,
      graanGezien: Math.max(nuGezien, (vorig && vorig.graanGezien) || 0),
      graanNu: nuGezien,
      graanVerwacht: Math.max(verwacht, (vorig && vorig.graanVerwacht) || 0),
      gezien: alle, tegelsGezien,
    };
  };

  // ---------------------------------------------------------------------------------------------
  // De dagen: aankondiging, komst, en onverwacht terug
  // ---------------------------------------------------------------------------------------------

  T.innerKomt = function (S, dag, onverwacht) {
    const I = S.inner || (S.inner = T.nieuweInner());
    I.bezoek = {
      komtOp: dag, onverwacht: !!onverwacht, geduld: IN().geduld,
      gebouwen: new Set(), tegels: new Set(), wezen: null, weg: false, laatste: null, volgt: false,
      overslaan: new Set(), // wat hij niet kon bereiken
    };
    if (T.zetVlag) {
      T.zetVlag(S, 'innerOpBezoek');
      if (onverwacht) T.zetVlag(S, 'innerOnverwacht');
    }
    bericht(onverwacht
      ? 'De inner komt onverwacht terug. Hij wil nog eens kijken.'
      : 'De inner van de heer komt tellen. Loop met hem mee: wat hij ziet, komt in zijn rapport.', 'gevaar');
    // Een scène: de tijd staat stil zolang hij er is. Lopen kan wel; dat is de scène.
    if (S.kalender && S.kalender.snelheid > 0 && T.zetSnelheid) {
      I.snelheidVoorBezoek = S.kalender.snelheid;
      T.zetSnelheid(S, 0);
    }
    if (T.ui && T.ui.toonArgwaan) T.ui.toonArgwaan(S);
  };

  // Hij gaat, met zijn rapport: de argwaan om het graan, een melding, en de tijd loopt weer.
  T.innerVertrekt = function (S) {
    const I = S.inner;
    const b = I && I.bezoek;
    if (!b || b.weg) return null;
    const eerder = I.rapport;
    const r = T.maakRapport(S);
    I.rapport = r;
    b.weg = true;
    // Minder graan dan zijn velden beloven? Dan groeit zijn argwaan, met wat het scheelt.
    if (r.graanVerwacht > 0) {
      const deel = r.graanNu / r.graanVerwacht;
      if (deel < IN().graanVerwacht) T.zetArgwaan(S, (IN().graanVerwacht - deel) * IN().graanArgwaan, 'hij zag minder graan dan zijn velden beloven');
      // Onverwacht terug, en ineens veel meer graan dan de eerste keer: dan weet hij genoeg.
      if (b.onverwacht && eerder && r.graanNu - eerder.graanNu > IN().graanErbij * r.graanVerwacht) {
        T.zetArgwaan(S, (r.graanNu - eerder.graanNu) / r.graanVerwacht * IN().graanArgwaan, 'er lag ineens meer graan dan de eerste keer');
      }
    }
    // Bij genoeg argwaan komt hij onverwacht terug, één keer per jaar, ergens vóór Sint-Maarten.
    if (!b.onverwacht && !I.teruggeweest && I.argwaan >= IN().terugkomenVanaf) {
      const { van, tot } = IN().terugNaDagen;
      const dag = dagNu(S);
      const sm = T.SINT_MAARTEN ? volgendeKeer(dag, { maand: T.SINT_MAARTEN.maand, dag: T.SINT_MAARTEN.dag }) : dag + tot + 10;
      const op = dag + van + Math.floor(willekeurig(S) * (tot - van + 1));
      I.terugOp = Math.min(op, sm - 5);
    }
    if (b.onverwacht) I.teruggeweest = true;
    const namen = Object.entries(r.gebouwen).map(([soort, n]) => (n === 1 ? `een ${T.GEBOUWEN[soort].naam}` : `${n} × ${T.GEBOUWEN[soort].naam}`));
    bericht(`De inner vertrekt. In zijn rapport: ${namen.join(', ') || 'geen gebouwen'}, en ${Math.round(r.graanGezien)} graan.`);
    if (T.wisVlag) T.wisVlag(S, 'innerOnverwacht');
    // De tijd loopt weer zoals vóór zijn komst, tenzij de speler hem zelf al aanzette.
    if (S.kalender && S.kalender.snelheid === 0 && I.snelheidVoorBezoek && T.zetSnelheid && S.modus !== 'dialoog') {
      T.zetSnelheid(S, I.snelheidVoorBezoek);
    }
    I.snelheidVoorBezoek = null;
    if (!b.wezen) haalWeg(S);
    if (T.ui && T.ui.toonArgwaan) T.ui.toonArgwaan(S);
    return r;
  };

  function haalWeg(S) {
    const I = S.inner;
    const b = I && I.bezoek;
    if (!b) return;
    if (b.wezen && S.wereld) {
      const i = S.wereld.wezens.indexOf(b.wezen);
      if (i >= 0) S.wereld.wezens.splice(i, 1);
    }
    if (T.wisVlag) T.wisVlag(S, 'innerOpBezoek');
    I.bezoek = null;
  }

  // De eerstvolgende dag ná `dag` met deze datum ({ maand (nummer), dag }).
  function volgendeKeer(dag, datum) {
    const d = T.datumVanDag(dag);
    const verschil = inJaar(datum.maand, datum.dag) - inJaar(d.maand, d.dagVanMaand);
    return Math.floor(dag) + (((verschil % T.DAGEN_PER_JAAR) + T.DAGEN_PER_JAAR) % T.DAGEN_PER_JAAR || T.DAGEN_PER_JAAR);
  }

  // Een getal 0..1 voor wanneer hij terugkomt; vast per spel en per dag (uit het lot van de boeren
  // als dat er is), zodat een toets hetzelfde uitkomt.
  function willekeurig(S) {
    const zaad = ((S.lot && S.lot.zaad) || 1) + dagNu(S) * 7919;
    const x = Math.sin(zaad) * 10000;
    return x - Math.floor(x);
  }

  // Eén dag. Wordt aangeroepen vanuit T.tikGebouwenDag (js/gebouwen.js, stap 0).
  T.tikInnerDag = function (S, dag) {
    if (!magKomen(S) || S.einde) return;
    const I = S.inner || (S.inner = T.nieuweInner());
    const d = T.datumVanDag(dag);
    const komt = inJaar(maandIdx(IN().komt.maand), IN().komt.dag);
    const nu = inJaar(d.maand, d.dagVanMaand);
    const aankondiging = ((komt - IN().aankondiging) % T.DAGEN_PER_JAAR + T.DAGEN_PER_JAAR) % T.DAGEN_PER_JAAR;
    if (IN().aankondiging > 0 && nu === aankondiging && !I.bezoek) {
      bericht(`Over ${IN().aankondiging} dagen komt de inner van de heer tellen: de velden, de schuren en de huizen.`);
    }
    if (nu === komt && !I.bezoek) T.innerKomt(S, dag, false);
    if (I.terugOp != null && dag >= I.terugOp && !I.bezoek) {
      I.terugOp = null;
      T.innerKomt(S, dag, true);
    }
  };

  // Na Sint-Maarten (js/heer.js, T.betaalHeer): het rapport is betaald, en zijn argwaan zakt.
  T.innerNaSintMaarten = function (S) {
    const I = S.inner;
    if (!I) return;
    I.rapport = null;
    I.terugOp = null;
    I.teruggeweest = false;
    I.argwaan *= IN().naSintMaarten;
    if (I.argwaan < 0.01) {
      I.argwaan = 0;
      I.waarom = [];
    }
    if (T.ui && T.ui.toonArgwaan) T.ui.toonArgwaan(S);
  };

  // Op Sint-Maarten doorzoeken de soldaten het dorp als de argwaan hoog genoeg is (Marcel, 24 sep).
  // Wat ze vinden, is weg; zolang er nog geen verstopplekken zijn (werklijst punt 6, stap 2),
  // vinden ze niets. Geeft wat ze vonden.
  T.doorzoekDorp = function (S) {
    const gevonden = T.zoekVerstopt ? T.zoekVerstopt(S) : [];
    bericht(gevonden.length
      ? `De soldaten van de heer doorzoeken het dorp, en vinden ${gevonden.join(', ')}.`
      : 'De soldaten van de heer doorzoeken het dorp, van de schuren tot de beerput. Ze vinden niets.', 'gevaar');
    return gevonden;
  };

  // ---------------------------------------------------------------------------------------------
  // Zijn komen en gaan in de wereld: elk beeld (js/main.js, werkBij)
  // ---------------------------------------------------------------------------------------------

  function kanLopen(S) {
    return !!(S.wereld && S.wereld.wezens && T.maakMens && T.wegInEnUit && T.wegInEnUit(S.wereld) && T.zoekPad);
  }

  // Een vrije tegel waar hij kan staan, zo dicht mogelijk bij (x, y), maar minstens `vanaf` ervan
  // (een gebouw zelf is vast, en op de schout kan hij niet staan). Van de tegels even ver kiest hij
  // die aan zijn eigen kant, zodat hij niet om de schout heen hoeft te lopen.
  function staanBij(S, e, x, y, vanaf) {
    const w = S.wereld;
    for (let r = vanaf || 0; r <= 4; r++) {
      let beste = null;
      let bij = Infinity;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (!T.isBegaanbaar(w, x + dx, y + dy, { wezensBlokkeren: true, wie: e })) continue;
          const a = Math.hypot(x + dx - e.tx, y + dy - e.ty);
          if (a < bij) {
            bij = a;
            beste = { x: x + dx, y: y + dy };
          }
        }
      }
      if (beste) return beste;
    }
    return null;
  }

  function loopNaar(S, e, doel) {
    const w = S.wereld;
    const pad = T.zoekPad(
      { x: e.tx, y: e.ty },
      doel,
      (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e }),
      (x, y) => T.isVast(w, x, y),
      {},
    );
    if (pad && pad.length) e.pad = pad;
    return !!(pad && pad.length);
  }

  T.werkInnerBij = function (S) {
    const I = S.inner;
    const b = I && I.bezoek;
    if (!b || !magKomen(S)) return;
    const w = S.wereld;
    // Geen weg de kaart op (of niets om mee te lopen): dan kijkt hij één keer rond vanaf de brink en
    // gaat hij. Anders bleef hij er, en stond de tijd voorgoed stil.
    if (!kanLopen(S)) {
      if (!b.weg) {
        T.innerKijkt(S, w.heer || w.marskramer);
        T.innerVertrekt(S);
      }
      return;
    }
    const uitgang = T.wegInEnUit(w);
    if (!b.wezen) {
      if (b.weg) return;
      const e = T.maakMens('inner', uitgang.x, uitgang.y, 0);
      e.dwaalt = false; // hij loopt waar hij heen wil, niet waar het dwalen hem brengt
      b.wezen = e;
      w.wezens.push(e);
      return;
    }
    const e = b.wezen;
    if (b.weg) {
      // Naar de weg, en daar is hij weg.
      if (e.tx === uitgang.x && e.ty === uitgang.y && !e.pad.length && !e.onderweg) haalWeg(S);
      else if (!e.pad.length && !e.onderweg) loopNaar(S, e, uitgang);
      return;
    }
    if (S.modus === 'dialoog' && S.spreektMet === e) {
      b.stilSinds = null; // wie met hem praat, houdt hem op, en dat telt niet als wachten
      return;
    }
    // Bij elke nieuwe tegel: rondkijken, en een stap van zijn geduld eraf. Staat hij stil, dan
    // kost het wachten ook geduld (stilPerStap).
    const hier = sleutel(e.tx, e.ty);
    if (hier !== b.laatste) {
      if (b.laatste != null) b.geduld--;
      b.laatste = hier;
      b.stilSinds = null;
      const nieuw = T.innerKijkt(S, { x: e.tx, y: e.ty });
      if (nieuw.length) bericht(`De inner noteert: ${nieuw.join(', ')}.`);
    } else if (!e.onderweg && !e.pad.length && typeof S.tijd === 'number') {
      if (b.stilSinds == null) b.stilSinds = S.tijd;
      else if (S.tijd - b.stilSinds >= IN().stilPerStap) {
        b.geduld--;
        b.stilSinds = S.tijd;
      }
    }
    const doelen = nogTeZien(S);
    if (b.geduld <= 0 || !doelen.length) {
      T.innerVertrekt(S);
      return;
    }
    if (e.onderweg) return;
    // Loopt de schout naast hem, dan volgt hij de schout; loopt die weg, dan gaat hij zijn eigen gang.
    const h = S.held;
    const afstand = h ? T.afstand({ x: h.tx, y: h.ty }, { x: e.tx, y: e.ty }) : Infinity;
    const volgde = b.volgt;
    if (afstand <= IN().volgAfstand) b.volgt = true;
    else if (afstand > IN().volgLos) b.volgt = false;
    // Volgt hij, dan houdt hij de pas van de schout bij: hij draaft erachteraan. Anders zijn eigen maat.
    const eigen = (T.MENSEN && T.MENSEN.inner && T.MENSEN.inner.snelheid) || e.snelheid;
    e.snelheid = b.volgt && h ? Math.max(eigen, T.snelheidVan(h)) : eigen;
    if (b.volgt) {
      // Hij laat zijn eigen ronde los, en loopt naar de schout; loopt die door, dan loopt hij mee
      // naar waar de schout nu is. (Hij staat nu op een tegel, dus zijn pad mag weg.)
      const eind = e.pad[e.pad.length - 1];
      if (!volgde || (afstand > 1 && !(eind && T.afstand(eind, { x: h.tx, y: h.ty }) <= 1))) {
        e.pad = [];
        const naast = afstand > 1 && staanBij(S, e, h.tx, h.ty, 1);
        if (naast) loopNaar(S, e, naast);
      }
      return;
    }
    if (volgde) e.pad = []; // de schout liep weg: zijn eigen ronde weer, vanaf hier
    if (e.pad.length) return;
    // Zijn eigen ronde: naar wat het dichtstbij nog te zien is.
    let beste = null;
    let bij = Infinity;
    for (const d of doelen) {
      const a = T.afstand({ x: e.tx, y: e.ty }, d);
      if (a < bij) {
        bij = a;
        beste = d;
      }
    }
    const plek = beste && staanBij(S, e, beste.x, beste.y, 0);
    // Niet te bereiken (ingesloten, of de weg staat vol): dan slaat hij het over.
    if (!plek || !loopNaar(S, e, plek)) b.overslaan.add(beste.gebouw || beste.akker);
  };
})(globalThis.Toren = globalThis.Toren || {});
