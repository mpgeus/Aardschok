// De inner: de man van de heer die in oogstmaand komt tellen (ontwerp/spel.md, "Rijk worden en arm
// lijken: de inner", besloten door Marcel op 24 sep 2026; werklijst punt 6). Twee helften, net als
// js/heer.js:
//   - de regels, zonder scherm (test/inner.test.cjs): wanneer hij komt (T.tikInnerDag), wat hij
//     ziet (T.innerKijkt: in een rechte lijn, tot zoveel tegels, en huizen en schuren houden zijn
//     blik tegen), zijn rapport (T.maakRapport) en zijn argwaan.
//   - zijn komen en gaan als poppetje (T.werkInnerBij): loopt de schout naast hem, dan volgt hij de
//     schout; anders loopt hij zijn eigen ronde, langs wat hij nog niet zag, tot zonsondergang.
// Zijn rapport is de rekening van de heer (js/heer.js, T.eisVanDeHeer): wat hij niet zag, betaal je
// dat jaar niet. Zijn argwaan doet vier dingen: de heer vraagt meer, soldaten doorzoeken het dorp,
// hij komt onverwacht terug, en bij heel hoge argwaan telt het rapport niet meer.
// De schout kan hem bespelen (werklijst punt 4, stuk 2; vraag 42, Marcel, 27 sep): wie met hem praat,
// houdt hem op terwijl de dag doorloopt (afleiden), en voor een geschenk schrijft hij minder op
// (omkopen, T.koopInnerOm), maar met een kans hoort de heer het.
//
// Alleen waar ook de heer komt: een wereld met een plein (js/heer.js). Daarbuiten blijft dit stil.
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
    // Zijn bezoek duurt tot zonsondergang, min zoveel uur (Marcel, 27 sep, vraag 42: hij moet voor
    // donker terug zijn op het kasteel). Wat hij dan nog niet zag, staat niet in zijn rapport. Alleen
    // ziet hij in die tijd het hele gehucht; wie met hem meeloopt, leidt hem langs de lege kant. (Tot
    // 27 sep liep hij 90 stappen, en praten kostte hem niets.)
    wegVoorDonker: 0,
    // Afleiden: wie met hem praat, houdt hem op. Hij staat stil en kijkt niet, en de dag loopt door.
    // Zoveel uur per bezoek; daarna telt hij door, ook als je nog praat.
    praatUren: 3,
    // Staat hij naast een schout die niet verder loopt, dan wacht hij zoveel uur. Daarna telt hij zelf
    // verder, en volgt hij zoveel uur niemand (eigenGang). Anders hield wie stilstond hem net zo op als
    // wie met hem praatte.
    wachtUren: 0.5,
    eigenGang: 1,
    // Loop je zo dichtbij, dan volgt hij jou; loop je verder weg dan volgLos, dan gaat hij zijn eigen
    // ronde weer.
    volgAfstand: 2,
    volgLos: 5,
    // Omkopen (Marcel, 27 sep, vraag 42): in zijn gesprek geef je hem een geschenk (T.koopInnerOm). Per
    // `per` goud schrijft hij `stap` minder op zijn rapport, tot `tot`. Met een kans (`gehoord`) hoort
    // de heer het: dan telt het geschenk op Sint-Maarten als goud in je kist (js/heer.js), en groeit de
    // argwaan met `argwaan` per goud.
    omkopen: { per: 5, stap: 0.1, tot: 0.5, gehoord: 0.2, argwaan: 0.015 },
    // Het graan: van elke gezaaide akkertegel die hij zag, verwacht hij een volle oogst
    // (T.GRAAN_PER_TEGEL). Ziet hij in de schuren en op die velden samen minder dan dit deel daarvan,
    // dan groeit zijn argwaan met wat het scheelt, keer graanArgwaan.
    graanVerwacht: 0.6,
    graanArgwaan: 1,
    // Komt hij onverwacht terug en ligt er dan veel meer graan dan de eerste keer (meer dan dit deel
    // van wat hij verwachtte), dan weet hij genoeg.
    graanErbij: 0.2,
    // Sporen (Marcel, 25 sep: "voor alles"): wat je verstopt, laat sporen na, en klopt een spoor niet
    // met wat hij telde, dan groeit zijn argwaan. 'alles': het graan tegen de velden en het goud
    // tegen wat de marskramer hem vertelt; 'graan': alleen het graan, zoals vóór 25 sep. Een optie.
    sporen: 'alles',
    // Het goud: de marskramer vertelt hem wat hij je sinds Sint-Maarten betaalde en wat jij hem
    // (js/handel.js, T.boekMarskramer). Wat je bij hem overhield, min wat je sindsdien bouwde (dat
    // ziet hij staan), verwacht hij in de kist. Ligt er minder dan dit deel van, dan groeit zijn
    // argwaan met wat het scheelt, keer goudArgwaan. Pas vanaf goudVanaf goud: om een paar munten
    // maakt hij zich niet druk.
    goudVerwacht: 0.6,
    goudArgwaan: 1,
    goudVanaf: 10,
    // Wat de argwaan (0..1) doet (Marcel, 24 sep: alle vier):
    terugkomenVanaf: 0.4, // hij komt onverwacht terug, zoveel dagen na zijn bezoek:
    terugNaDagen: { van: 20, tot: 45 },
    doorzoekenVanaf: 0.5, // op Sint-Maarten doorzoeken de soldaten het dorp
    rapportTeltNietVanaf: 0.8, // de heer vraagt toch naar alles
    toeslag: 0.5, // de heer vraagt zoveel meer bij volle argwaan, en naar rato bij minder
    // Op Sint-Maarten kijkt de heer zelf rond van het plein, zo ver (0: hij kijkt niet). Een gebouw
    // dat hij dan ziet en dat niet in het rapport stond, komt alsnog op de rekening en kost zoveel
    // argwaan: "Wat is DÁT, schout?"
    heerZicht: 6,
    betrapt: 0.15,
    // Hoe ver hij rondkijkt, hangt af van zijn argwaan (Marcel, 25 sep: "Mag wel, maar is afhankelijk
    // van achterdocht"): zonder argwaan kijkt hij niet, en hoe argwanender, hoe verder, tot heerZicht
    // vanaf deze argwaan (0: altijd heerZicht).
    heerZichtVol: 0.5,
    // Na Sint-Maarten blijft er zoveel van zijn argwaan over.
    naSintMaarten: 0.5,
  };

  const IN = () => T.INNER_INSTELLINGEN;
  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  const inJaar = (maand, dag) => maand * T.DAGEN_PER_MAAND + (dag - 1);
  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const uurNu = (D) => (D.kalender ? D.kalender.dag * 24 : 0);
  const sleutel = (x, y) => x + ',' + y;


  T.nieuweInner = function () {
    return {
      argwaan: 0, // 0..1
      waarom: [], // wat hem argwanend maakte, voor de balk
      bezoek: null, // zijn bezoek nu, zie T.innerKomt
      rapport: null, // wat hij dit jaar zag, tot de heer op Sint-Maarten betaald is
      terugOp: null, // de dag waarop hij onverwacht terugkomt
      teruggeweest: false,
      geschenken: 0, // wat je hem dit jaar gaf (T.koopInnerOm), tot Sint-Maarten
      gehoord: 0, // en wat de heer daarvan hoorde
      aantalGeschenken: 0,
    };
  };

  // Waar hij kan komen: een wereld met een plein, net als de heer (js/heer.js). En alleen als de
  // heer de rekening op zijn rapport maakt: ziet de heer alles zelf (de optie in de spelregels,
  // js/opties.js), dan komt er geen inner.
  function magKomen(D) {
    const w = D.wereld;
    const H = T.HEER_INSTELLINGEN;
    return !!(w && (w.heer || w.marskramer)) && (!H || H.rekening === 'rapport');
  }

  // De argwaan bijstellen, tussen 0 en 1, met een reden voor de balk.
  T.zetArgwaan = function (D, erbij, waarom) {
    const I = D.inner || (D.inner = T.nieuweInner());
    I.argwaan = Math.max(0, Math.min(1, I.argwaan + erbij));
    if (waarom && erbij > 0 && !I.waarom.includes(waarom)) I.waarom.push(waarom);
    if (T.ui && T.ui.toonArgwaan) T.ui.toonArgwaan(D);
  };

  // ---------------------------------------------------------------------------------------------
  // Wat hij ziet
  // ---------------------------------------------------------------------------------------------

  // De voet van een gebouw: waar hij staat en hoe groot hij is (T.voetVanGebouw, js/gebouwen.js).
  const voetVan = (g) => T.voetVanGebouw(g);

  // Wat hij kan zien: gebouwen met een tekening (een verstopplek heeft er geen, en die ziet hij dus
  // niet zomaar; zie werklijst punt 6, stap 2).
  function zichtbaarGebouw(g) {
    const soort = T.GEBOUWEN && T.GEBOUWEN[g.soort];
    return !!(soort && soort.tekening);
  }

  // Ziet hij deze tegel van waar hij staat? Binnen zijn zicht, en niets ertussen (T.zietTegel,
  // js/wereld.js: de begin- en eindtegel tellen niet mee, dus een muur zelf zie je wel).
  const ziet = (w, van, x, y, zicht) => T.zietTegel(w, van, { x, y }, zicht);

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
  T.innerKijkt = function (D, van) {
    const b = D.inner && D.inner.bezoek;
    const w = D.wereld;
    if (!b || !w) return [];
    const nieuw = [];
    for (const g of D.gebouwen || []) {
      if (b.gebouwen.has(g) || !zichtbaarGebouw(g) || !zietGebouw(w, van, g, IN().zicht)) continue;
      b.gebouwen.add(g);
      nieuw.push(T.GEBOUWEN[g.soort].naam);
    }
    for (const akker of w.akkers || []) {
      let zag = false;
      for (const t of T.akkerTegels(akker)) {
        const k = sleutel(t.x, t.y);
        if (!b.tegels.has(k) && ziet(w, van, t.x, t.y, IN().zicht)) {
          b.tegels.add(k);
          zag = true;
        }
      }
      // Een akker in het bos die niet in de boeken staat (js/ontginnen.js): die schrijft hij op.
      if (zag && akker.stiekem) T.innerZietBosAkker(D, akker);
    }
    return nieuw;
  };

  // Op Sint-Maarten, als de heer op het plein staat (js/heer.js, T.heerStaatErOp), kijkt hij zelf
  // rond. Wat hij van daar ziet en niet in het rapport van zijn inner stond (gebouwd na zijn
  // bezoek, of wat de inner miste), komt alsnog op de rekening, en elk ding maakt argwanend. Zo
  // klopt zijn brief ook een beetje: "Wat er tot Sint-Maarten bijkomt, zien Wij ook." Alleen wat
  // je van het plein ziet, en hoe ver hangt af van zijn argwaan (T.heerZichtNu). Geeft de namen van
  // wat hij vond.
  T.heerZichtNu = function (D) {
    const argwaan = (D.inner && D.inner.argwaan) || 0;
    const vol = IN().heerZichtVol;
    return IN().heerZicht * (vol > 0 ? Math.min(1, argwaan / vol) : 1);
  };

  T.heerKijktRond = function (D) {
    const I = D.inner;
    const w = D.wereld;
    const plek = w && (w.heer || w.marskramer);
    const H = T.HEER_INSTELLINGEN;
    const zicht = T.heerZichtNu(D);
    if (!I || !I.rapport || !plek || !(H && H.rekening === 'rapport') || !(zicht >= 1)) return [];
    const r = I.rapport;
    const betrapt = [];
    for (const g of D.gebouwen || []) {
      if (r.gezien.has(g) || !zichtbaarGebouw(g) || !zietGebouw(w, plek, g, zicht)) continue;
      r.gezien.add(g);
      r.gebouwen[g.soort] = (r.gebouwen[g.soort] || 0) + 1;
      r.woonruimte += T.GEBOUWEN[g.soort].woonruimte || 0;
      betrapt.push(T.GEBOUWEN[g.soort].naam);
    }
    if (betrapt.length) {
      T.zetArgwaan(D, betrapt.length * IN().betrapt, 'de heer zag op het plein wat niet in het rapport stond');
      T.zeg(D, `"Wat is DÁT, schout?" De heer wijst: ${betrapt.join(', ')}. "Dat staat niet in het rapport van Onze inner. Nu wel."`, 'gevaar');
    }
    return betrapt;
  };

  // Is er nog iets wat hij wil zien? Een gebouw dat hij nog niet zag, of een akker waarvan hij nog
  // minder dan de helft zag. [{ x, y }] van waar het is, of een lege lijst.
  function nogTeZien(D) {
    const b = D.inner.bezoek;
    const doelen = [];
    const overslaan = b.overslaan || new Set();
    for (const g of D.gebouwen || []) {
      if (b.gebouwen.has(g) || !zichtbaarGebouw(g) || overslaan.has(g)) continue;
      const v = voetVan(g);
      doelen.push({ x: v.x + Math.floor(v.b / 2), y: v.y + Math.floor(v.h / 2), gebouw: g });
    }
    for (const akker of (D.wereld && D.wereld.akkers) || []) {
      // Een akker die niet in de boeken staat (stiekem ontgonnen in het bos, js/ontginnen.js), zoekt hij niet: hij weet
      // er niet van.
      if (overslaan.has(akker) || !T.inDeBoeken(akker)) continue;
      const tegels = T.akkerTegels(akker);
      const gezien = tegels.filter((t) => b.tegels.has(sleutel(t.x, t.y))).length;
      if (gezien < tegels.length / 2) doelen.push({ x: akker.x + Math.floor(akker.b / 2), y: akker.y + Math.floor(akker.h / 2), akker });
    }
    return doelen;
  }
  T.innerNogTeZien = (D) => nogTeZien(D);

  // ---------------------------------------------------------------------------------------------
  // Het rapport: wat hij zag, en wat de heer ervan vraagt (js/heer.js)
  // ---------------------------------------------------------------------------------------------

  // Hoeveel minder hij opschrijft (0 tot omkopen.tot): omkopen.stap per omkopen.per goud die je hem
  // dit jaar gaf (T.koopInnerOm).
  T.innerKorting = function (D) {
    const I = D.inner;
    const o = IN().omkopen;
    if (!I || !(I.geschenken > 0) || !(o.per > 0)) return 0;
    return Math.min(o.tot, Math.floor(I.geschenken / o.per + 1e-9) * o.stap);
  };

  // Het rapport van dit bezoek, samen met wat hij eerder dit jaar zag (bij een tweede bezoek).
  //   - wat hij opschreef, en wat de heer dus vraagt (js/heer.js): jaar, gebouwen ({ soort: aantal }),
  //     woonruimte, tegels, graanGezien en goudGezien;
  //   - voor zijn eigen argwaan (T.innerVertrekt): graanNu, graanVerwacht, goudNu en goudVerwacht;
  //   - wat hij onthoudt voor een tweede bezoek: gezien, tegelsGezien, graanGeteld en goudGeteld.
  // Wat hij opschreef, is wat hij zag, tenzij je hem omkocht (korting).
  T.maakRapport = function (D) {
    const I = D.inner;
    const b = I.bezoek;
    const vorig = I.rapport;
    // Wat hij eerder zag eerst, want wat hij weglaat, is wat hij het laatst zag.
    const alle = new Set(vorig && vorig.gezien);
    for (const g of b.gebouwen) alle.add(g);
    // Omgekocht (T.koopInnerOm): van de gebouwen laat hij weg wat hij het laatst zag, en van de
    // akkertegels, het graan en de kist een even groot deel. Wat hij zag, onthoudt hij wel (gezien):
    // de heer ziet op Sint-Maarten dus niets nieuws aan wat hij wegliet, en een tweede bezoek telt
    // het niet dubbel.
    const korting = T.innerKorting(D);
    const opgeschreven = [...alle].slice(0, Math.round(alle.size * (1 - korting)));
    const gebouwen = {};
    let woonruimte = 0;
    for (const g of opgeschreven) {
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
    const datum = T.datumVanDag(dagNu(D));
    const basis = T.akkerStadium(datum.maand, datum.dagVanMaand);
    for (const akker of (D.wereld && D.wereld.akkers) || []) {
      const isAkker = T.bestemmingVan(akker) === 'akker';
      const perTegel = T.oogstPerTegel(akker);
      for (const t of T.akkerTegels(akker)) {
        const k = sleutel(t.x, t.y);
        if (!tegelsGezien.has(k)) continue;
        tegels++;
        if (!isAkker || (akker.ongezaaid && akker.ongezaaid.has(k))) continue;
        verwacht += perTegel;
        const stadium = T.akkerTegelStadium(akker, t.x, t.y, basis);
        if (stadium === 'rijp' || stadium === 'groen' || stadium === 'kiemend') staand += perTegel;
      }
    }
    const nuGezien = staand + ((D.voorraad && D.voorraad.graan) || 0);
    // De kist (Marcel, 25 sep: "hij telt de kist"): het goud dat er nu in ligt. Wat verstopt ligt
    // (js/verstoppen.js), ligt er niet in, en wat je hem gaf ook niet.
    const kist = (D.voorraad && D.voorraad.goud) || 0;
    const graanGeteld = Math.max(nuGezien, (vorig && vorig.graanGeteld) || 0);
    const goudGeteld = Math.max(kist, (vorig && vorig.goudGeteld) || 0);
    return {
      jaar: datum.jaar, gebouwen, woonruimte,
      tegels: Math.round(tegels * (1 - korting)),
      graanGezien: graanGeteld * (1 - korting),
      goudGezien: goudGeteld * (1 - korting),
      graanNu: nuGezien,
      graanVerwacht: Math.max(verwacht, (vorig && vorig.graanVerwacht) || 0),
      // Wat je hem gaf, weet hij: dat is niet weg, dat zit in zijn zak.
      goudNu: kist + (I.geschenken || 0),
      goudVerwacht: goudVerwacht(D, alle),
      gezien: alle, tegelsGezien, graanGeteld, goudGeteld, korting,
    };
  };

  // Hoeveel goud hij in de kist verwacht: wat de marskramer je sinds Sint-Maarten betaalde, min wat
  // jij hem betaalde (js/handel.js, T.boekMarskramer), min wat de gebouwen kostten die hij zag en
  // die sindsdien begonnen zijn: die ziet hij staan, en hij weet wat een huis kost.
  function goudVerwacht(D, gezien) {
    const boek = D.boekMarskramer;
    if (!boek) return 0;
    let verwacht = boek.ontvangen - boek.betaald;
    for (const g of gezien) {
      const soort = T.GEBOUWEN[g.soort];
      if (!soort || !soort.kosten || !soort.kosten.goud) continue;
      const begonnen = (g.klaarOp || 0) - (soort.bouwtijd || 0);
      if (g.voorwerp && begonnen >= boek.sinds) verwacht -= soort.kosten.goud;
    }
    return Math.max(0, verwacht);
  }

  // ---------------------------------------------------------------------------------------------
  // Omkopen (Marcel, 27 sep, vraag 42)
  // ---------------------------------------------------------------------------------------------

  // Een geschenk van `goud`, in zijn gesprek (js/gesprekken.js: doe: { omkopen: 10 }, via
  // T.doeGevolg). Zolang hij telt: daarna is zijn rapport af. Hoe minder hij opschrijft, zegt
  // T.innerKorting; T.maakRapport schrijft het zo op. Met een kans (omkopen.gehoord) hoort de heer het:
  // dan telt het geschenk op Sint-Maarten als goud in je kist (js/heer.js, T.eisVanDeHeer), en groeit
  // de argwaan. Het lot valt meteen, en het bericht zegt het, zodat je weet waar je staat.
  // Geeft { kan, korting, gehoord }.
  T.koopInnerOm = function (D, goud) {
    const I = D.inner;
    const b = I && I.bezoek;
    // Uit eigen zak (js/geld.js, de beurs van de schout; Marcel, 8 okt: "Omkopen uit eigen zak"), of zonder beurzen uit de kas.
    if (!b || b.weg || !(goud > 0) || !T.betaalUitBeurs(D, goud)) return { kan: false, korting: T.innerKorting(D), gehoord: false };
    const o = IN().omkopen;
    I.geschenken = (I.geschenken || 0) + goud;
    I.aantalGeschenken = (I.aantalGeschenken || 0) + 1;
    const korting = T.innerKorting(D);
    if (korting >= o.tot) T.zetVlag(D, 'innerOmgekochtVol');
    const gehoord = willekeurig(D, I.aantalGeschenken) < o.gehoord;
    if (gehoord) {
      I.gehoord = (I.gehoord || 0) + goud;
      T.zetArgwaan(D, goud * o.argwaan, 'hij hoorde dat je zijn inner omkocht');
      // Telt de heer de kist niet (een keuze in de spelregels), dan kost het alleen argwaan.
      const kist = T.HEER_INSTELLINGEN && T.HEER_INSTELLINGEN.kist ? ` Die ${goud} goud telt hij op Sint-Maarten als goud in je kist,` : '';
      T.zeg(D, `De inner steekt het goud niet weg: hij weegt het in zijn hand, waar iedereen bij staat. Dit hoort de heer.${kist}${kist ? ' en' : ' En'} hij vertrouwt je minder.`, 'gevaar');
    }
    if (T.ui && T.ui.toonArgwaan) T.ui.toonArgwaan(D);
    return { kan: true, korting, gehoord };
  };

  // ---------------------------------------------------------------------------------------------
  // De dagen: aankondiging, komst, en onverwacht terug
  // ---------------------------------------------------------------------------------------------

  T.innerKomt = function (D, dag, onverwacht) {
    const I = D.inner || (D.inner = T.nieuweInner());
    I.bezoek = {
      komtOp: dag, onverwacht: !!onverwacht,
      tot: null, // tot wanneer hij blijft (de dag, met het uur achter de komma), zodra hij er is
      gepraat: 0, // hoeveel uur je hem aan de praat hield (afleiden), en of het genoeg was
      uitgepraat: false,
      gebouwen: new Set(), tegels: new Set(), wezen: null, weg: false, laatste: null, volgt: false,
      overslaan: new Set(), // wat hij niet kon bereiken
      aankomst: {
        tekst: onverwacht
          ? 'De inner komt onverwacht terug. Hij wil nog eens kijken.'
          : 'De inner van de heer komt tellen. Loop met hem mee: wat hij ziet, komt in zijn rapport.',
        soort: 'gevaar',
        naarGewoon: true,
      },
    };
    if (T.zetVlag) {
      T.zetVlag(D, 'innerOpBezoek');
      if (onverwacht) T.zetVlag(D, 'innerOnverwacht');
    }
    // Hij komt overdag (js/dag.js, T.bezoekerKomtAan): valt zijn dag 's nachts in, dan zegt het
    // bericht het pas als hij de kaart op loopt (T.werkInnerBij). Zonder wereld om in te lopen (een
    // toets) meteen. Tot 26 sep stond de tijd stil zolang hij er was, omdat meelopen bij een dag van
    // 2,5 seconde weken kostte; sinds de dag duurt zijn bezoek een dag, en loopt de tijd door.
    if (!kanLopen(D)) I.bezoek.meteen = true;
    T.bezoekerKomtAan(D, I.bezoek);
    if (T.ui && T.ui.toonArgwaan) T.ui.toonArgwaan(D);
  };

  // Hij gaat, met zijn rapport: de argwaan om het graan, en een melding.
  T.innerVertrekt = function (D) {
    const I = D.inner;
    const b = I && I.bezoek;
    if (!b || b.weg) return null;
    const eerder = I.rapport;
    const r = T.maakRapport(D);
    I.rapport = r;
    b.weg = true;
    // Minder graan dan zijn velden beloven? Dan groeit zijn argwaan, met wat het scheelt.
    if (r.graanVerwacht > 0) {
      const deel = r.graanNu / r.graanVerwacht;
      if (deel < IN().graanVerwacht) T.zetArgwaan(D, (IN().graanVerwacht - deel) * IN().graanArgwaan, 'hij zag minder graan dan zijn velden beloven');
      // Onverwacht terug, en ineens veel meer graan dan de eerste keer: dan weet hij genoeg.
      if (b.onverwacht && eerder && r.graanNu - eerder.graanNu > IN().graanErbij * r.graanVerwacht) {
        T.zetArgwaan(D, (r.graanNu - eerder.graanNu) / r.graanVerwacht * IN().graanArgwaan, 'er lag ineens meer graan dan de eerste keer');
      }
    }
    // Het goud (Marcel, 25 sep: sporen voor alles): wat de marskramer hem vertelde, tegen de kist.
    if (IN().sporen === 'alles' && r.goudVerwacht >= IN().goudVanaf) {
      const deel = r.goudNu / r.goudVerwacht;
      if (deel < IN().goudVerwacht) T.zetArgwaan(D, (IN().goudVerwacht - deel) * IN().goudArgwaan, 'de marskramer vertelde hem wat hij je betaalde, en je kist was lichter');
    }
    // Bij genoeg argwaan komt hij onverwacht terug, één keer per jaar, ergens vóór Sint-Maarten.
    if (!b.onverwacht && !I.teruggeweest && I.argwaan >= IN().terugkomenVanaf) {
      const { van, tot } = IN().terugNaDagen;
      const dag = dagNu(D);
      const sm = T.SINT_MAARTEN ? volgendeKeer(dag, { maand: T.SINT_MAARTEN.maand, dag: T.SINT_MAARTEN.dag }) : dag + tot + 10;
      const op = dag + van + Math.floor(willekeurig(D) * (tot - van + 1));
      I.terugOp = Math.min(op, sm - 5);
    }
    if (b.onverwacht) I.teruggeweest = true;
    const namen = Object.entries(r.gebouwen).map(([soort, n]) => (n === 1 ? `een ${T.GEBOUWEN[soort].naam}` : `${n} × ${T.GEBOUWEN[soort].naam}`));
    const delen = (namen.length ? namen : ['geen gebouwen']).concat(`${Math.round(r.graanGezien)} graan`);
    if (T.HEER_INSTELLINGEN && T.HEER_INSTELLINGEN.kist) delen.push(`${Math.floor(r.goudGezien)} goud in de kist`);
    const korting = r.korting > 0 ? ` Om je geschenk schreef hij ${Math.round(r.korting * 100)}% minder op dan hij zag.` : '';
    T.zeg(D, `De inner vertrekt. In zijn rapport: ${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}.${korting}`);
    T.wisVlag(D, 'innerOnverwacht');
    // Zijn rapport is af: een geschenk of een praatje verandert er niets meer aan (js/gesprekken.js).
    T.zetVlag(D, 'innerGeteld');
    if (!b.wezen) haalWeg(D);
    if (T.ui && T.ui.toonArgwaan) T.ui.toonArgwaan(D);
    return r;
  };

  function haalWeg(D) {
    const I = D.inner;
    const b = I && I.bezoek;
    if (!b) return;
    if (b.wezen && D.wereld) {
      const i = D.wereld.wezens.indexOf(b.wezen);
      if (i >= 0) D.wereld.wezens.splice(i, 1);
    }
    for (const v of ['innerOpBezoek', 'innerUitgepraat', 'innerGeteld']) T.wisVlag(D, v);
    I.bezoek = null;
  }

  // De eerstvolgende dag ná `dag` met deze datum ({ maand (nummer), dag }).
  function volgendeKeer(dag, datum) {
    const d = T.datumVanDag(dag);
    const verschil = inJaar(datum.maand, datum.dag) - inJaar(d.maand, d.dagVanMaand);
    return Math.floor(dag) + (((verschil % T.DAGEN_PER_JAAR) + T.DAGEN_PER_JAAR) % T.DAGEN_PER_JAAR || T.DAGEN_PER_JAAR);
  }

  // Een getal 0..1, vast per spel, per dag en per vraag `n` (uit het lot van de boeren als dat er is),
  // zodat een toets hetzelfde uitkomt: wanneer hij terugkomt, en of de heer een geschenk hoort.
  function willekeurig(D, n) {
    const zaad = ((D.lot && D.lot.zaad) || 1) + dagNu(D) * 7919 + (n || 0) * 131;
    const x = Math.sin(zaad) * 10000;
    return x - Math.floor(x);
  }

  // Eén dag. Wordt aangeroepen vanuit T.tikGebouwenDag (js/gebouwen.js, stap 0).
  T.tikInnerDag = function (D, dag) {
    if (!magKomen(D) || D.einde) return;
    const I = D.inner || (D.inner = T.nieuweInner());
    const d = T.datumVanDag(dag);
    const komt = inJaar(maandIdx(IN().komt.maand), IN().komt.dag);
    const nu = inJaar(d.maand, d.dagVanMaand);
    const aankondiging = ((komt - IN().aankondiging) % T.DAGEN_PER_JAAR + T.DAGEN_PER_JAAR) % T.DAGEN_PER_JAAR;
    if (IN().aankondiging > 0 && nu === aankondiging && !I.bezoek) {
      const kist = T.HEER_INSTELLINGEN && T.HEER_INSTELLINGEN.kist ? ', de huizen en de kist' : ' en de huizen';
      T.zeg(D, `Over ${IN().aankondiging} dagen komt de inner van de heer tellen: de velden, de schuren${kist}. Wat hij niet mag zien, zet je vóór die tijd weg.`);
    }
    if (nu === komt && !I.bezoek) T.innerKomt(D, dag, false);
    if (I.terugOp != null && dag >= I.terugOp && !I.bezoek) {
      I.terugOp = null;
      T.innerKomt(D, dag, true);
    }
  };

  // Na Sint-Maarten (js/heer.js, T.betaalHeer): het rapport is betaald, en zijn argwaan zakt.
  T.innerNaSintMaarten = function (D) {
    const I = D.inner;
    if (!I) return;
    I.rapport = null;
    I.terugOp = null;
    I.teruggeweest = false;
    I.geschenken = 0;
    I.gehoord = 0;
    T.wisVlag(D, 'innerOmgekochtVol');
    I.argwaan *= IN().naSintMaarten;
    // Wat de marskramer hem vertelt, telt vanaf nu opnieuw (js/handel.js).
    if (T.nieuwBoekMarskramer) D.boekMarskramer = T.nieuwBoekMarskramer(dagNu(D));
    if (I.argwaan < 0.01) {
      I.argwaan = 0;
      I.waarom = [];
    }
    if (T.ui && T.ui.toonArgwaan) T.ui.toonArgwaan(D);
  };

  // Op Sint-Maarten doorzoeken de soldaten het dorp als de argwaan hoog genoeg is (Marcel, 24 sep).
  // Plek voor plek (js/verstoppen.js, T.zoekVerstopt): wat ze vinden, is weg. Geeft wat ze vonden.
  T.doorzoekDorp = function (D) {
    const gevonden = T.zoekVerstopt(D);
    const lijst = gevonden.length > 1 ? `${gevonden.slice(0, -1).join(', ')} en ${gevonden[gevonden.length - 1]}` : gevonden[0];
    T.zeg(D, gevonden.length
      ? `De soldaten van de heer doorzoeken het dorp, en vinden ${lijst}. Dat is weg.`
      : 'De soldaten van de heer doorzoeken het dorp, van de schuren tot de beerput. Ze vinden niets.', 'gevaar');
    return gevonden;
  };

  // ---------------------------------------------------------------------------------------------
  // Zijn komen en gaan in de wereld: elk beeld (js/main.js, werkBij)
  // ---------------------------------------------------------------------------------------------

  function kanLopen(D) {
    return !!(D.wereld && D.wereld.wezens && T.maakMens && T.wegInEnUit(D.wereld) && T.zoekPad);
  }

  // Een vrije tegel waar hij kan staan, zo dicht mogelijk bij (x, y), maar minstens `vanaf` ervan
  // (een gebouw zelf is vast, en op de schout kan hij niet staan). Van de tegels even ver kiest hij
  // die aan zijn eigen kant, zodat hij niet om de schout heen hoeft te lopen.
  function staanBij(D, e, x, y, vanaf) {
    const w = D.wereld;
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

  // Een weg om wat vaststaat; wie er onderweg staat, lost hij onderweg op (js/lopen.js).
  function loopNaar(D, e, doel) {
    const pad = T.zoekRoute(D.wereld, { x: e.tx, y: e.ty }, doel, {});
    if (pad && pad.length) T.geefRoute(e, pad, doel);
    return !!(pad && pad.length);
  }

  // Wie met de schout meeloopt, loopt naast hem: staat hij er niet, of loopt de schout door, dan een
  // nieuw pad naar een vrije tegel naast hem. `opnieuw`: in elk geval een nieuw pad (hij liep nog niet
  // mee). Voor de inner (hieronder), en voor de soldaten van de heer (js/doorzoeken.js).
  T.loopNaastDeSchout = function (D, e, opnieuw) {
    const h = D.schout;
    const afstand = T.afstand({ x: h.tx, y: h.ty }, { x: e.tx, y: e.ty });
    const eind = e.pad[e.pad.length - 1];
    if (opnieuw || (afstand > 1 && !(eind && T.afstand(eind, { x: h.tx, y: h.ty }) <= 1))) {
      e.pad = [];
      const naast = afstand > 1 && staanBij(D, e, h.tx, h.ty, 1);
      if (naast) loopNaar(D, e, naast);
    }
  };

  // Loop naar een vrije tegel zo dicht mogelijk bij (x, y) (op minstens `vanaf`). Geeft of het kan.
  T.loopNaarBij = function (D, e, x, y, vanaf) {
    const plek = staanBij(D, e, x, y, vanaf || 0);
    return !!(plek && loopNaar(D, e, plek));
  };

  // Tot wanneer hij blijft: de eerstvolgende zonsondergang (js/dag.js), min wegVoorDonker, als dag met
  // het uur achter de komma. Roep je hem 's nachts (Spel.debug.inner), dan is dat die van morgen.
  // Zonder kalender (een toets zonder dag) blijft hij tot hij alles zag.
  function totZonsondergang(D) {
    if (!D.kalender) return Infinity;
    const nu = D.kalender.dag;
    for (let d = Math.floor(nu); ; d++) {
      const tot = d + (T.zonVan(d).onder - IN().wegVoorDonker) / 24;
      if (tot > nu) return tot;
    }
  }

  // Praat de schout nog met hem, dan houdt dat gesprek op (js/dialoog.js). Zonder scherm (een toets)
  // staat er niets open.
  function stopGesprek(S, D, e) {
    if (S.modus === 'dialoog' && S.spreektMet === e && T.sluitDialoog) T.sluitDialoog(S);
  }

  T.werkInnerBij = function (S, D) {
    const I = D.inner;
    const b = I && I.bezoek;
    if (!b || !magKomen(D)) return;
    const w = D.wereld;
    // Geen weg de kaart op (of niets om mee te lopen): dan kijkt hij één keer rond vanaf het plein en
    // gaat hij. Anders bleef hij er, en stond de tijd voorgoed stil.
    if (!kanLopen(D)) {
      if (!b.weg) {
        T.innerKijkt(D, w.heer || w.marskramer);
        T.innerVertrekt(D);
      }
      return;
    }
    const uitgang = T.wegInEnUit(w);
    if (!b.wezen) {
      if (b.weg) return;
      // Overdag, vanaf het bezoekuur, met zijn bericht (js/dag.js).
      if (!T.bezoekerKomtAan(D, b)) return;
      const e = T.maakMens('inner', uitgang.x, uitgang.y, 0);
      e.dwaalt = false; // hij loopt waar hij heen wil, niet waar het dwalen hem brengt
      b.wezen = e;
      b.tot = totZonsondergang(D);
      w.wezens.push(e);
      return;
    }
    const e = b.wezen;
    if (b.weg) {
      // Naar de weg, en daar is hij weg.
      if (e.tx === uitgang.x && e.ty === uitgang.y && !e.pad.length && !e.onderweg) haalWeg(D);
      else if (!e.pad.length && !e.onderweg) loopNaar(D, e, uitgang);
      return;
    }
    // De zon gaat onder: hij moet voor donker terug zijn op het kasteel, en gaat met wat hij zag.
    const nu = uurNu(D);
    if (b.tot != null && nu >= b.tot * 24) {
      T.zeg(D, 'De zon gaat onder, en de inner moet voor donker terug zijn op het kasteel.');
      stopGesprek(S, D, e);
      T.innerVertrekt(D);
      return;
    }
    // Afleiden: wie met hem praat, houdt hem op. Hij staat stil en kijkt niet, en de dag loopt door. Tot
    // hij genoeg gepraat heeft (praatUren per bezoek): dan telt hij door, ook als je nog praat.
    if (S.modus === 'dialoog' && S.spreektMet === e && !b.uitgepraat) {
      if (b.praatVan != null) b.gepraat += nu - b.praatVan;
      b.praatVan = nu;
      b.stilSinds = null; // praten is geen wachten
      if (b.gepraat < IN().praatUren) return;
      b.uitgepraat = true;
      T.zetVlag(S, 'innerUitgepraat');
      T.zeg(D, '"Genoeg gepraat, schout. Ik moet tellen, en voor donker terug zijn."');
      stopGesprek(S, D, e);
    }
    b.praatVan = null;
    // Bij elke nieuwe tegel: rondkijken.
    const hier = sleutel(e.tx, e.ty);
    if (hier !== b.laatste) {
      b.laatste = hier;
      b.stilSinds = null;
      const nieuw = T.innerKijkt(D, { x: e.tx, y: e.ty });
      if (nieuw.length) T.zeg(D, `De inner noteert: ${nieuw.join(', ')}.`);
    } else if (b.volgt && !e.onderweg && !e.pad.length) {
      // Naast een schout die niet verder loopt, wacht hij niet eeuwig: daarna telt hij zelf verder, en
      // volgt hij een tijd niemand. In uren op de klok, dus op elke snelheid even lang.
      if (b.stilSinds == null) b.stilSinds = nu;
      else if (nu - b.stilSinds >= IN().wachtUren) {
        b.stilSinds = null;
        b.eigenTot = nu + IN().eigenGang;
        T.zeg(D, 'De inner wacht niet langer op je, en telt zelf verder.');
      }
    }
    const doelen = nogTeZien(D);
    if (!doelen.length) {
      T.innerVertrekt(D);
      return;
    }
    if (e.onderweg) return;
    // Loopt de schout naast hem, dan volgt hij de schout; loopt die weg, of wachtte hij te lang op hem,
    // dan gaat hij zijn eigen gang. Is de schout op reis (js/land.js), dan is er niemand om te volgen.
    const h = T.schoutIsWeg(D) ? null : D.schout;
    const afstand = h ? T.afstand({ x: h.tx, y: h.ty }, { x: e.tx, y: e.ty }) : Infinity;
    const volgde = b.volgt;
    if (b.eigenTot != null && nu < b.eigenTot) b.volgt = false;
    else if (afstand <= IN().volgAfstand) b.volgt = true;
    else if (afstand > IN().volgLos) b.volgt = false;
    // Volgt hij, dan houdt hij de pas van de schout bij: hij draaft erachteraan. Anders zijn eigen maat.
    const eigen = (T.MENSEN && T.MENSEN.inner && T.MENSEN.inner.snelheid) || e.snelheid;
    e.snelheid = b.volgt && h ? Math.max(eigen, T.snelheidVan(h)) : eigen;
    if (b.volgt) {
      // Hij laat zijn eigen ronde los, en loopt naar de schout; loopt die door, dan loopt hij mee
      // naar waar de schout nu is. (Hij staat nu op een tegel, dus zijn pad mag weg.)
      T.loopNaastDeSchout(D, e, !volgde);
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
    // Niet te bereiken (ingesloten, of de weg staat vol): dan slaat hij het over.
    if (!beste || !T.loopNaarBij(D, e, beste.x, beste.y, 0)) b.overslaan.add(beste.gebouw || beste.akker);
  };
})(globalThis.Spel = globalThis.Spel || {});
