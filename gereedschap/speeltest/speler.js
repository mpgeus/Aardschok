// De speler van de speeltest (gereedschap/speeltest/speeltest.cjs; werklijst, vraag 45). Dit bestand draait
// in de bladzijde, naast het spel zoals index.html het laadt, en speelt één jaar: van het titelscherm en de
// benoemingsbrief (1 lentemaand) tot 1 grasmaand van het jaar erna, zodat de winter en het zaaien erin zitten.
//
// De proef met opslaan (speeltest.cjs --opslaan; werklijst, vraag 48): de speler slaat op een dag op, via het
// menu zoals een mens, en stopt; speeltest.cjs herlaadt de bladzijde, en de speler gaat verder met Verder op
// het titelscherm. Hetzelfde jaar zonder opslaan trekt op dat moment het lot opnieuw, net als het herladen jaar
// na het laden, zodat allebei vanaf daar hetzelfde lot hebben: dan moet het jaar precies zo aflopen.
//
// De speler doet wat een speler doet, met dezelfde klik: hij loopt erheen (T.handelingVerkennen, de klik
// op een tegel, een gebouw of een mens) en drukt op de knoppen van het venster dat dan opengaat. Alleen
// waar een knop een gesprek opent (de heer), roept hij hetzelfde gevolg aan als die keuze in het gesprek
// (T.doeGevolg). Verstoppen en de soldaten leiden deden de spelers tot 11 okt ook; dat ging eruit, met de inner
// (vraag 151).
//
// Wat er gebeurt, schrijft hij op zonder het te veranderen: een paar regels van het spel krijgen een
// luisteraar (luister, onderaan), en elke eerste van de maand een stand.
//
// Er speelt één speler: de kolonist (hieronder, met zijn keuzes in kolonist.js; werklijst B, 1f), die het lege begin op het
// eiland van zijn zaad speelt. Tot 12 okt speelden ook braaf, slim, bouwer en sluw, op het gehucht dat er al was; dat begin
// bestaat niet meer (ronde 2 van het snoeien, stap 5).
//
// Hij schrijft ook een graanboek (vraag 94, d): per jaar waar het graan bleef (luister, onderaan), en per jaar
// hoeveel dagen er geen bier of brood was, hoeveel soorten het dorp at en hoeveel huizen groeiden (boekhouding). Het jaar
// erop is alleen de eerste maand.
(function (T) {
  'use strict';

  const JAAR = 360;
  // Tot 1 grasmaand van het jaar erna; met `jaren` (speeltest.cjs --jaren 2) zoveel jaren (C, stap 6: twee eilanden spelen
  // door tot het dorp er is).
  let EIND = JAAR + 30;
  const STAP = 0.25; // schermseconden per stap; op 30× ruim een half uur

  let boek = null; // wat er gebeurde, voor speeltest.cjs
  const bezig = {}; // welk venster de speler zelf openhoudt (de heer): dat sluit beantwoord() niet

  const S = () => T.S;
  const D = () => T.S.dorp; // je eigen dorp (js/dorp.js)
  const dagNu = () => S().kalender.dag;
  const datum = (d = dagNu()) => T.datumVanDag(d).tekst;
  const heel = (x) => Math.round(x * 10) / 10;

  function daad(tekst) {
    boek.daden.push({ dag: heel(dagNu()), datum: datum(), tekst });
  }

  function klik(selector) {
    const b = document.querySelector(selector);
    if (!b || b.disabled) return false;
    b.click();
    return true;
  }

  // ── De tijd laten lopen ────────────────────────────────────────────────────────────────────────
  // Elke stap: eerst wat vanzelf openging beantwoorden (de brief, het slachten), dan de snelheid, dan
  // de tijd, en dan de boekhouding van een nieuwe dag. Tijdens het bezoek van de heer op 3× (het spel zet hem dan
  // zelf op 1×), zodat naar hem toe lopen fijn genoeg gaat; anders op 30×.
  async function stap(sec = STAP) {
    beantwoord();
    const h = D().heer && D().heer.bezoek;
    const scène = h && !h.weg && h.wezens && h.wezens.length;
    const snelheid = scène ? 3 : 30;
    if (S().kalender.snelheid !== snelheid) T.zetSnelheid(S(), snelheid);
    await T.debug.stap(sec);
    beantwoord();
    boekhouding();
  }

  async function wachtTot(voorwaarde, maxUren, sec = 0.05) {
    const tot = dagNu() + maxUren / 24;
    for (let i = 0; i < 20000; i++) {
      if (voorwaarde()) return true;
      if (dagNu() >= tot || D().einde) return false;
      await stap(sec);
    }
    return false;
  }

  // Een gril van de heer (js/grillen.js; werklijst vraag 106, stap 2): de kolonist weegt de heer tegen het dorp, en redt wie
  // het dichtst bij de grens zit (js/bazen.js), zoals de slimme en de sluwe speler deden. Geeft de keuze (een getal), of null
  // als er niets kan.
  function grilAntwoord(s) {
    const g = T.grilNu(s.dorp);
    if (!g) return null;
    const keuzes = T.grilKeuzes(s.dorp);
    const doe = (i) => T.GRILLEN[g.id].keuzes[i].doe;
    const BAAS = ['gunst', 'vertrouwen'];
    const kost = (i) => Object.entries(doe(i)).reduce((n, [w, x]) => n + (x < 0 && !BAAS.includes(w) ? -x * (w === 'goud' ? 1 : 0.2) : 0), 0);
    const gunst = (i) => doe(i).gunst || 0;
    const vertrouwen = (i) => doe(i).vertrouwen || 0;
    const kan = keuzes.map((k, i) => i).filter((i) => keuzes[i].kan);
    if (!kan.length) return null;
    const beste = (score) => kan.reduce((a, i) => (score(i) > score(a) ? i : a), kan[0]);
    const b = T.bazenNu(s.dorp) || { gunst: 50, vertrouwen: 50 };
    if (b.gunst < 30) return beste(gunst);
    if (b.vertrouwen < 30) return beste(vertrouwen);
    return beste((i) => gunst(i) + vertrouwen(i) - kost(i) / 5);
  }

  // Wat vanzelf opengaat: de brief van de heer (1 wijnmaand) en het slachten (1 slachtmaand). De brief
  // lees je en sluit je; bij het slachten neem je het voorstel van het spel (zo weinig als kan, zodat
  // het hooi de winter haalt). Een venster dat de speler niet zelf openhoudt, gaat dicht.
  function beantwoord() {
    const s = S();
    // Wacht er een gril, en is er geen brief open, dan opent hij hem met de knop Brief, zoals een mens.
    if (T.grilNu(s.dorp) && !T.ui.briefOpen() && s.modus === 'verkennen') T.ui.toonBrief(s.dorp, 'gril');
    // Een gril van de heer: antwoorden, en opschrijven wat hij koos (js/grillen.js; vraag 106).
    if (T.ui.briefOpen() && document.querySelector('#brief').dataset.soort === 'gril') {
      const g = T.grilNu(s.dorp);
      const i = grilAntwoord(s);
      if (g && i != null) {
        const k = T.grilKeuzes(s.dorp)[i];
        (boek.grillen = boek.grillen || []).push({ datum: datum(), id: g.id, antwoord: k.tekst, prijs: k.prijs });
        if (!klik(`#brief [data-actie="gril${i}"]`)) T.ui.sluitBrief(s);
      } else if (!klik('#brief [data-actie="sluit"]')) T.ui.sluitBrief(s);
    }
    // De waarschuwing van de heer (js/bazen.js): opschrijven, en lezen.
    if (T.ui.briefOpen() && document.querySelector('#brief').dataset.soort === 'waarschuwing') {
      (boek.waarschuwingen = boek.waarschuwingen || []).push({ datum: datum(), wie: 'de heer', waarom: (s.dorp.bazen.brief && s.dorp.bazen.brief.waarom) || '' });
      if (!klik('#brief [data-actie="sluit"]')) T.ui.sluitBrief(s);
    }
    // De brief van de heer bij een trede (js/treden.js): als het gehucht een dorp is, verder als dorp, en bij marktrecht
    // aan het werk. Wanneer, schrijft de luisteraar op wordtTrede op.
    if (T.ui.briefOpen() && T.GEBOUW_TREDEN.includes(document.querySelector('#brief').dataset.soort)) {
      if (!klik('#brief .heer-geef-knop')) T.ui.sluitBrief(s);
    }
    // De heervaart (js/heervaart.js; in een dorp, op 1 hooimaand): de speler stuurt ze, en schrijft op wat de heer
    // vroeg.
    if (T.ui.briefOpen() && document.querySelector('#brief [data-actie="stuur"]')) {
      const v = s.dorp.heervaart && s.dorp.heervaart.vraag;
      if (v) (boek.heervaart = boek.heervaart || []).push({ dag: heel(s.kalender.dag), datum: datum(), mannen: v.wie.length, goud: v.goud });
      if (!klik('#brief [data-actie="stuur"]')) T.ui.sluitBrief(s);
    }
    // Het jaar in het kort (1 lentemaand, js/einde.js): de speler schrijft het op, en leest door. Het is geen brief van de
    // heer.
    if (T.ui.briefOpen() && document.querySelector('#brief').dataset.soort === 'jaarverslag') {
      if (s.dorp.jaarverslag) (boek.jaarverslagen = boek.jaarverslagen || []).push({ datum: datum(), regels: s.dorp.jaarverslag.regels.slice() });
      if (!klik('#brief [data-actie="sluit"]')) T.ui.sluitBrief(s);
    }
    if (T.ui.briefOpen()) {
      if (s.kalender.dag > 1) boek.brief = { dag: heel(s.kalender.dag), datum: datum(), eis: eisKort(T.eisVanDeHeer(s.dorp)) };
      if (!klik('#brief [data-actie="sluit"]')) T.ui.sluitBrief(s);
    }
    if (T.ui.vensterOpen() === 'slachten') {
      if (!klik('#slachten [data-actie="slacht"]')) klik('#slachten [data-actie="sluit"]');
      if (T.ui.vensterOpen() === 'slachten') T.ui.sluitSlachten(s);
    }
    if (s.modus === 'handel' && !bezig.handel) T.ui.sluitHandel(s.dorp);
    if (s.modus === 'heer' && !bezig.heer) T.ui.sluitHeer(s);
    if (s.modus === 'dialoog') T.sluitDialoog(s);
    if (s.modus === 'velden') T.ui.sluitVelden(s);
    if (s.modus === 'wetten') T.ui.sluitWetten(s);
    if (s.modus === 'spelregels') T.ui.sluitSpelregels(s);
    vecht();
  }

  // Een gevecht (rovers, js/rovers.js; het gevecht in real time, js/gevecht.js; werklijst vraag 170, stap 2): er komt
  // niemand vanzelf, dus zoals een speler stuurt hij zijn soldaten op de vijand af die het dichtst bij het wachthuis staat
  // (rechts op een vijand, T.handelingSturen in js/kiezen.js; alleen wie nog niets volgt), en roept hij ze terug als er
  // geen vijand meer is. De held laat hij thuis: valt hij, dan is het spel uit.
  function vecht() {
    const s = S();
    if (s.modus !== 'verkennen') return;
    const D = s.dorp;
    const mannen = T.mannenVan(D).filter((e) => e !== D.aanvoerder && !e.binnen);
    if (!mannen.length) return;
    const vijanden = D.wereld.wezens.filter(T.isVijandig);
    if (!vijanden.length) {
      const terug = mannen.filter((e) => e.post || e.volgt);
      if (terug.length) T.geefOpdracht(s, { soort: 'terug', wie: T.nummersVan(D, terug) });
      return;
    }
    const vrij = mannen.filter((e) => !e.volgt);
    if (!vrij.length) return;
    const bij = T.tegelVan(vrij[0]);
    const m = vijanden.sort((a, b) => T.afstand(T.tegelVan(a), bij) - T.afstand(T.tegelVan(b), bij))[0];
    const r = T.handelingSturen(s, { wezen: m, x: m.tx, y: m.ty }, vrij);
    if (r && r.kan && r.doe) r.doe();
  }

  // ── De heer betalen ───────────────────────────────────────────────────────────────────────────
  // Een klik op hem opent het venster (vraag 170, stap 5: het praten is geparkeerd), met de knop "Alles wat hij vraagt".
  async function betaal() {
    const s = S();
    const heer = s.dorp.heer.bezoek.wezens && s.dorp.heer.bezoek.wezens[0];
    const h = heer && T.handelingVerkennen(s, { wezen: heer, x: heer.x, y: heer.y });
    bezig.heer = true;
    if (h && h.doe) h.doe();
    if (s.modus !== 'heer') {
      bezig.heer = false;
      daad('kan de heer niet betalen: het venster ging niet open');
      return;
    }
    if (!klik('#heer [data-actie="betaal"]')) daad('kan niet betalen: de knop staat uit');
    // De schandpaal: de aanvoerder zelf, als dat mag (het dorp neemt het hem niet kwalijk).
    if (s.dorp.heer.bezoek && s.dorp.heer.bezoek.schandpaal) {
      if (!klik('#heer .paal-keuze[data-wie="aanvoerder"]')) klik('#heer .paal-keuze');
    }
    if (s.modus === 'heer') T.ui.sluitHeer(s);
    bezig.heer = false;
  }

  // ── De spelers ──────────────────────────────────────────────────────────────────────────────────
  const eenKeer = new Set();
  const nuEenKeer = (naam) => (eenKeer.has(naam) ? false : (eenKeer.add(naam), true));
  // De heer staat op het plein en wacht ("De heer staat op het plein en wacht op je").
  const heerOpHetPlein = () => T.heerWacht(D()) && D().heer.bezoek.staat;

  // De kolonist (werklijst B, 1f; Marcel, 12 okt: "a1, b1, c1, d ja"): het lege begin, met de keuzes van kolonist.js, één
  // keer per dag, zoals de toets in test/begin.test.cjs; de heer geeft hij alles wat hij vraagt. Wat er
  // vastloopt, schrijft hij op in boek.eersteJaar (eersteJaar hieronder): "zonder fouten" is dat niets vastloopt (b1).
  let kolonistDag = null;
  const nieuwEersteJaar = () => ({ gebouwd: [], wacht: {}, kampLeeg: null, inTent: null, onderweg: [], werktNiet: [], honger: 0, kou: 0, graan: {}, hout: {}, planken: {}, soorten: {}, soldaten: { eerste: null, nu: 0 } });
  function kolonist() {
    return {
      async begin() {
        kolonistDag = null;
        gezet.length = 0;
        onderwegSinds.clear();
        boek.eersteJaar = nieuwEersteJaar();
        boek.kar = nieuweKar();
      },
      async elkeStap() {
        // Na het herladen van de proef met opslaan begint zijn boekhouding opnieuw (begin() komt dan niet); wat hij
        // beslist, leest hij uit het spel (T.kolonistDag), dus dat loopt door.
        if (!boek.eersteJaar) boek.eersteJaar = nieuwEersteJaar();
        if (!boek.kar) boek.kar = nieuweKar();
        const s = S();
        const dag = Math.floor(dagNu());
        if (dag !== kolonistDag) {
          kolonistDag = dag;
          for (const d of T.kolonistDag(s.dorp, dag)) {
            // Wat hij wil maar nog niet kan betalen: hoeveel dagen, en een daad op de eerste dag van het wachten.
            if (d.wacht) {
              const w = boek.eersteJaar.wacht[d.soort] || (boek.eersteJaar.wacht[d.soort] = { dagen: 0, op: d.reden, laatst: null });
              if (w.laatst !== dag - 1) daad(d.tekst);
              Object.assign(w, { dagen: w.dagen + 1, op: d.reden, laatst: dag });
              continue;
            }
            boek.gebouwd.push({ dag: heel(dagNu()), datum: datum(), soort: d.soort, gelukt: d.gelukt, reden: d.reden || null });
            daad(d.tekst);
            if (d.instantie) gezet.push({ g: d.instantie, soort: d.soort, gezet: dag, af: null, laatst: dag, werk: 0, stil: 0 });
          }
          eersteJaar(dag);
          karDag(dag);
        }
        if (heerOpHetPlein() && nuEenKeer('betaal')) await betaal();
      },
    };
  }

  // Wat de kolonist neerzette (gezet), en per dag wat er vastloopt: een bouwplaats waar het werk stilstaat (de langste
  // reeks dagen), wie na een dag nog naar zijn huis onderweg is (p.komt), een werkplaats die af is maar niet werkt zonder
  // dat het spel zegt waarom (zoals een houthakker wiens man de hele dag onderweg is), wie er op 1 wintermaand nog in een
  // tent woont, en de dagen met honger en kou (T.OORZAKEN, js/statussen.js). Het graan en het hout op een paar dagen, en
  // per aantal soorten eten hoeveel dagen (vraag 154).
  const gezet = [];
  const onderwegSinds = new Map();
  const DAGEN_GRAAN = { 'voor de oogst': 120, 'na de oogst': 180, 'de winter': 270, 'de lente': JAAR };
  function eersteJaar(dag) {
    const E = boek.eersteJaar;
    const s = S();
    for (const x of gezet) {
      if (x.af != null) continue;
      if (x.g.klaar) {
        x.af = dag;
        E.gebouwd.push({ soort: x.soort, gezet: x.gezet, af: dag, stil: x.stil });
        continue;
      }
      const werk = x.g.bouw ? x.g.bouw.gedaan + x.g.bouw.tegoed : 0;
      if (werk > x.werk + 1e-9) {
        x.werk = werk;
        x.laatst = dag;
      }
      x.stil = Math.max(x.stil, dag - x.laatst);
    }
    if (E.kampLeeg == null && s.dorp.begin.kamp === 'weg') E.kampLeeg = dag;
    // De soldaten (vraag 159): de dag van de eerste, en hoeveel er nu zijn.
    E.soldaten.nu = T.soldatenVan(s.dorp).length;
    if (E.soldaten.nu && E.soldaten.eerste == null) E.soldaten.eerste = dag;
    if (dag === 9 * T.DAGEN_PER_MAAND) E.inTent = s.dorp.bewoners.mensen.filter((p) => p.huis && p.huis.soort === 'tent').length;
    for (const p of s.dorp.bewoners.mensen) {
      if (!p.komt) {
        onderwegSinds.delete(p);
        continue;
      }
      if (!onderwegSinds.has(p)) onderwegSinds.set(p, dag);
      const dagen = dag - onderwegSinds.get(p);
      if (dagen < 2) continue;
      const o = E.onderweg.find((x) => x.naam === p.naam);
      if (o) o.dagen = Math.max(o.dagen, dagen);
      else E.onderweg.push({ naam: p.naam, dagen });
    }
    for (const g of s.dorp.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !soort || !soort.maakt || !(soort.handen > 0) || g.werkte > 0 || g.stilWant) continue;
      const w = E.werktNiet.find((x) => x.soort === g.soort && x.x === g.x && x.y === g.y);
      if (w) w.dagen++;
      else E.werktNiet.push({ soort: g.soort, x: g.x, y: g.y, dagen: 1 });
    }
    if (T.OORZAKEN.honger.speelt(s.dorp, dag)) E.honger++;
    if (T.OORZAKEN.kou.speelt(s.dorp, dag)) E.kou++;
    // De afwisseling (vraag 154): hoeveel dagen het dorp hoeveel soorten at.
    const soorten = ((s.dorp.behoeften && s.dorp.behoeften.afwisseling) || []).length;
    E.soorten[soorten] = (E.soorten[soorten] || 0) + 1;
    for (const [naam, d] of Object.entries(DAGEN_GRAAN)) {
      if (dag !== d) continue;
      E.graan[naam] = Math.round(s.dorp.voorraad.graan || 0);
      E.hout[naam] = Math.round(s.dorp.voorraad.hout || 0);
      E.planken[naam] = Math.round(s.dorp.voorraad.planken || 0);
    }
    if (dag < 160) E.graan.laagst = Math.min(E.graan.laagst == null ? Infinity : E.graan.laagst, Math.round(s.dorp.voorraad.graan || 0));
  }

  // Het vervoer (werklijst C, stap 6; Marcel, 15 okt; de dragers sinds vraag 184): wat elke kar en de dragers samen doen,
  // hoeveel ze vervoeren, hoe groot de stapels worden en wat er op hen wacht. Gemeten in de speeltest, niet in het spel:
  // elk beeld, na T.werkKarBij (js/kar.js), kijkt dit naar elke kar en elke drager. Een stuk van een rit duurt minstens
  // een kwartier (het laden), een beeld op 30× een paar minuten, dus elk stuk komt langs. Per kar, en voor de dragers samen
  // (hun werktijd is die van allemaal opgeteld, dus "bezig" is wat een drager gemiddeld bezig was):
  //   werktijd   de dagen werktijd die hij er was (T.dagindeling: van werkBegin tot werkEind, zoals de kar zelf rekent)
  //   vol, leeg  daarvan rijdend met en zonder lading; laden: laden, lossen, inladen en afladen; de rest stond hij stil
  //   overwerk   een rit die na de werktijd nog doorliep
  //   halen, brengen, opgehaald, vervoerd
  //              de ritten die eindigden (lossen met lading, afladen), wat hij van de stapels haalde, en alles per waar
  //   maanden    per maand de werktijd en wat hij bezig was
  // En voor het dorp: elk half uur wat er op alle stapels ligt (gemiddeld en het meest) en de grootste stapel per soort
  // gebouw; elke ochtend de stapels die vol zijn, de bouwplaatsen die op de kar wachten (T.wachtOpHout), de werkplaatsen
  // die iets missen dat met de kar komt (g.tekort, en of de opslag het wel had), en de dag waarop het dorp een dorp werd.
  const RIJDEN = new Set(['heen', 'terug', 'opslag', 'brengen']);
  const somVan = (o) => Object.values(o || {}).reduce((n, x) => n + x, 0);
  const nieuweKar = () => ({ karren: [], dragers: null, stapels: {}, opDeStapels: { som: 0, keer: 0, meest: 0 }, dagen: 0, vol: {}, bouwWacht: 0, tekort: {}, dorp: null });
  const nieuwVervoer = (thuis, t) => ({ thuis, vanaf: Math.floor(t), werktijd: 0, vol: 0, leeg: 0, laden: 0, overwerk: 0, halen: 0, brengen: 0, opgehaald: 0, vervoerd: {}, maanden: {} });
  // per kar of drager het stuk van de rit dat hij het laatst zag, en wanneer (niet in het boek: v.rit kent zijn gebouw)
  const laatsteRit = new WeakMap();
  const laatsteT = new WeakMap();
  const werkKarBij = T.werkKarBij;
  T.werkKarBij = function (s, d) {
    werkKarBij(s, d);
    if (boek && boek.kar && d === D()) meetKar(d);
  };
  function meetKar(d) {
    const K = boek.kar;
    const t = d.kalender.dag;
    const vervoerders = T.karrenVan(d).map((e, i) => [e, K.karren[i] || (K.karren[i] = nieuwVervoer(d.gebouwen.includes(e.thuis) ? e.thuis.soort : 'raadhuis', t))]);
    const dragers = T.dragersVan(d).filter((p) => p.vervoer);
    if (dragers.length) {
      const k = K.dragers || (K.dragers = { ...nieuwVervoer('dragers', t), mensen: 0 });
      k.mensen = Math.max(k.mensen, dragers.length);
      for (const p of dragers) vervoerders.push([p.vervoer, k]);
    }
    for (const [e, k] of vervoerders) {
      const R = e.rit;
      if (R && R !== laatsteRit.get(e)) {
        // een nieuw stuk van een rit (js/kar.js begint elk stuk met een nieuw e.rit)
        laatsteRit.set(e, R);
        if (R.fase === 'lossen' && somVan(e.lading) > 0) {
          k.halen++;
          k.opgehaald += somVan(e.lading);
          for (const wat in e.lading) k.vervoerd[wat] = (k.vervoerd[wat] || 0) + e.lading[wat];
        }
        if (R.fase === 'afladen') {
          k.brengen++;
          k.vervoerd[R.wat] = (k.vervoerd[R.wat] || 0) + R.n;
        }
      }
      const dt = laatsteT.has(e) ? t - laatsteT.get(e) : 0;
      laatsteT.set(e, t);
      k.t = t;
      if (!(dt > 0) || dt > 1) continue; // (wie een tijd niet droeg, telt pas weer vanaf nu)
      const w = T.dagindeling(t);
      const uur = (t - Math.floor(t)) * 24;
      const wat = !R ? null : RIJDEN.has(R.fase) ? (somVan(e.lading) > 0 ? 'vol' : 'leeg') : 'laden';
      if (uur >= w.werkBegin && uur < w.werkEind) {
        k.werktijd += dt;
        if (wat) k[wat] += dt;
        const m = k.maanden[Math.floor(t / T.DAGEN_PER_MAAND)] || (k.maanden[Math.floor(t / T.DAGEN_PER_MAAND)] = { werktijd: 0, bezig: 0 });
        m.werktijd += dt;
        if (wat) m.bezig += dt;
      } else if (wat) k.overwerk += dt;
    }
    const half = Math.floor(t * 48);
    if (half === K.half || !T.metVervoer(d)) return;
    K.half = half;
    let n = 0;
    for (const g of d.gebouwen) {
      const op = T.stapelVan(g);
      if (!(op > 0)) continue;
      n += op;
      K.stapels[g.soort] = Math.max(K.stapels[g.soort] || 0, op);
    }
    K.opDeStapels.som += n;
    K.opDeStapels.keer++;
    K.opDeStapels.meest = Math.max(K.opDeStapels.meest, n);
  }
  function karDag(dag) {
    const K = boek.kar;
    const d = D();
    if (!K.dorp && T.tredeMinstens(d, 'dorp')) K.dorp = dag;
    if (!T.metVervoer(d)) return;
    K.dagen++;
    const vol = T.KAR_INSTELLINGEN.stapelVol - 1e-6;
    for (const g of d.gebouwen) {
      if (T.stapelVan(g) >= vol) K.vol[g.soort] = (K.vol[g.soort] || 0) + 1;
      if (T.wachtOpHout(g)) K.bouwWacht++;
      if (g.klaar && g.tekort && T.gaatMetVervoer(d, g.tekort)) {
        const x = K.tekort[g.soort] || (K.tekort[g.soort] = { wat: g.tekort, dagen: 0, metVoorraad: 0 });
        x.dagen++;
        if ((d.voorraad[g.tekort] || 0) >= T.KAR_INSTELLINGEN.lading) x.metVoorraad++;
      }
    }
  }

  const SPELERS = { kolonist: kolonist() };

  // ── Opschrijven wat er gebeurt ──────────────────────────────────────────────────────────────────
  function eisKort(eis) {
    return Object.fromEntries(eis.volgorde.map((w) => [w, eis.per[w]]));
  }

  function tel() {
    const s = S();
    const marktNu = (s) => {
      const g = s.dorp.gebouwen.find((x) => x.soort === 'markt' && x.opHetPlein);
      if (!g) return null;
      return { kramen: g.kramen.length, leeg: g.kramen.filter((k) => k.leeg).length, straat: g.kramen.filter((k) => !T.opHetPlein(s.dorp.wereld, k.x, k.y)).length, blok: (g.blok || []).length };
    };
    const houthakkers = s.dorp.gebouwen.filter((g) => g.soort === 'houthakker');
    return {
      dag: Math.floor(s.kalender.dag), datum: datum(),
      graan: Math.round(s.dorp.voorraad.graan || 0), goud: Math.round(s.dorp.voorraad.goud || 0), hout: Math.round(s.dorp.voorraad.hout || 0),
      vlees: Math.round(s.dorp.voorraad.vlees || 0), kaas: Math.round(s.dorp.voorraad.kaas || 0), hooi: Math.round(s.dorp.voorraad.hooi || 0),
      bevolking: s.dorp.bevolking,
      tevredenheid: heel(s.dorp.behoeften.tevredenheid * 100) / 100,
      // Wat het dorp at (de afwisseling, js/behoeften.js), en hoeveel woningen er van elke soort staan (wat er doorgroeide:
      // op de afwisseling, ronde 3 van het snoeien, stap 6).
      afwisseling: (s.dorp.behoeften.afwisseling || []).slice(),
      woningen: Object.fromEntries(['hut', 'huis', 'stenenHuis', 'woontoren'].map((soort) => [soort, s.dorp.gebouwen.filter((g) => g.soort === soort && g.huis !== 'aanvoerder').length])),
      // Welke huizen op bouwstof wachten, zoals de raad het zegt (T.bouwstofRaad, js/raad.js).
      bouwstof: T.bouwstofRaad(s.dorp),
      houthakkers: houthakkers.map((g) => ({ klaar: !!g.klaar, handen: g.handen || 0 })),
      // De twee bazen (js/bazen.js; vraag 106): de gunst van de heer en het vertrouwen van het dorp.
      bazen: T.bazenNu(s.dorp),
      // De markt (js/markt.js; vraag 127): hoeveel kramen, waarvan leeg en langs de straat, en hoe groot het blok is.
      markt: marktNu(s),
      // De huizen die door kunnen groeien maar het niet doen, en waarom (T.waaromGroeitHetNiet, js/behoeften.js; vraag 130).
      groeitNiet: s.dorp.gebouwen.map((g) => ({ g, waarom: T.waaromGroeitHetNiet(s.dorp, g) })).filter((x) => x.waarom)
        .map(({ g, waarom }) => ({ soort: g.soort, x: g.x, y: g.y, waarom })),
    };
  }

  let laatsteDag = -1;
  function boekhouding() {
    const d = Math.floor(dagNu());
    if (d === laatsteDag) return;
    laatsteDag = d;
    if (T.datumVanDag(d).dagVanMaand === 1) boek.maanden.push(tel());
    // Per jaar (vraag 94, d): op hoeveel dagen er geen bier of brood was (als er een herberg of een bakkerij staat), hoeveel
    // soorten het dorp at (gemiddeld over de dagen; de afwisseling, js/behoeften.js), en welk deel van de huizen die door
    // kunnen groeien, die dag een dag verder kwam (g.groeiDagen; ronde 3 van het snoeien, stap 6). En de druk om eten
    // (vraag 95, Marcel: "er moet altijd druk zijn om voldoende eten"): op hoeveel dagen er te weinig eten was (wat de balk
    // als honger zegt, D.behoeften.mist), het dorp zei dat het eten de winter niet haalt (T.watDeWinterNietHaalt), en er
    // geen graan meer lag boven het zaaigraan.
    if (!D().behoeften) return;
    const g = boek.geluk[Math.floor(d / JAAR)] || (boek.geluk[Math.floor(d / JAAR)] = { dagen: 0, soorten: 0, groei: 0, zonderBier: 0, zonderBrood: 0, honger: 0, etenWinter: 0, graanOp: 0 });
    const staat = (soort) => D().gebouwen.some((x) => x.soort === soort && x.klaar);
    const groeien = D().gebouwen.map((x) => T.huisToestand(D(), x)).filter((t) => t && t.groei && !t.groei.later);
    g.dagen++;
    g.soorten += (D().behoeften.afwisseling || []).length;
    g.groei += groeien.length ? groeien.filter((t) => t.groei.dagen > 0).length / groeien.length : 0;
    if (staat('herberg') && (D().voorraad.bier || 0) < 1) g.zonderBier++;
    if (staat('bakkerij') && (D().voorraad.brood || 0) < 1) g.zonderBrood++;
    if ((D().behoeften.mist || []).includes('food')) g.honger++;
    if (T.watDeWinterNietHaalt(D(), d).includes('eten')) g.etenWinter++;
    if ((D().voorraad.graan || 0) - T.zaaigraanApart(D(), d) < 1) g.graanOp++;
  }

  // Luisteraars op de regels die iets doen wat telt. Ze roepen de regel zelf aan en schrijven daarna op;
  // ze veranderen niets.
  function luister() {
    const s = S();
    const na = (naam, f) => {
      const oud = T[naam];
      T[naam] = function (...a) {
        const voor = f.voor ? f.voor(...a) : null;
        const r = oud.apply(this, a);
        try {
          f(r, voor, ...a);
        } catch (e) {
          boek.luisterFouten.push(`${naam}: ${e.message}`);
        }
        return r;
      };
    };
    // Het graanboek (werklijst vraag 94, d): per jaar waar het graan bleef. Elke verandering van het graan in je eigen dorp
    // (T.wijzigVoorraad) gaat naar de regel die er dan mee bezig is (de binnenste van deze lijst), en wat een werkplaats
    // neemt naar zijn soort: T.maaktTot vraagt het vlak voor hij neemt (js/gebouwen.js, T.tikGebouwenDag). Wat nergens
    // onder valt, is anders.
    const bezigMet = [];
    let werkSoort = null;
    const BRONNEN = [
      ['werkOogstBij', 'oogst'], ['haalOogstBinnen', 'oogst'], ['zaaiAkkers', 'zaaien'], ['zaaiNa', 'zaaien'],
      ['eetVandaag', 'gegeten'], ['koop', 'gekocht'], ['verkoop', 'verkocht'], ['betaalHeer', 'heer'],
      ['tikHeerDag', 'soldaten'], ['werkRoversBij', 'rovers'], ['tikRoversDag', 'rovers'],
      ['tikGebouwenDag', 'werk'],
    ];
    for (const [naam, waar] of BRONNEN) {
      const oud = T[naam];
      T[naam] = function () {
        bezigMet.push(waar);
        try {
          return oud.apply(this, arguments);
        } finally {
          bezigMet.pop();
        }
      };
    }
    const maaktTot = T.maaktTot;
    T.maaktTot = function (soort) {
      werkSoort = soort && soort.naam;
      return maaktTot.apply(this, arguments);
    };
    const wijzig = T.wijzigVoorraad;
    T.wijzigVoorraad = function (D_, wat) {
      if (wat !== 'graan' || D_ !== s.dorp) return wijzig.apply(this, arguments);
      const voor = D_.voorraad.graan || 0;
      const r = wijzig.apply(this, arguments);
      let waar = bezigMet[bezigMet.length - 1] || 'anders';
      if (waar === 'werk') waar = werkSoort || 'werk';
      const j = Math.floor(s.kalender.dag / JAAR);
      const b = boek.graan[j] || (boek.graan[j] = {});
      b[waar] = (b[waar] || 0) + ((D_.voorraad.graan || 0) - voor);
      return r;
    };
    const bericht = T.ui.bericht;
    T.ui.bericht = function (tekst, soort) {
      if (tekst) boek.berichten.push({ dag: heel(s.kalender.dag), datum: datum(), tekst, soort: soort || '' });
      return bericht.apply(this, arguments);
    };
    na('wijzigBevolking', (r, voor, S_, verschil, reden, waarom) => {
      boek.bevolking.push({ dag: heel(s.kalender.dag), datum: datum(), verschil, reden: reden || '', waarom: waarom || '' });
    });
    // Het bosboek (werklijst vraag 115; stap 4 van vraag 110, e): per jaar hoeveel houthakkers er stonden en hoeveel hout
    // ze uit hun bomen haalden (js/bos.js), hoeveel bomen er omgingen en waarvoor (de houthakker, wie zijn plek rooit, wie
    // ontgint), hoeveel boompjes er geplant werden, een jonge boom werden en een boom, hoeveel dagen een houthakker
    // stilstond zonder boom (opgeteld over de houthakkers), en aan het eind van het jaar wat er stond: op de kaart, en
    // binnen het bereik van de houthakkers.
    const bosJaar = () => {
      const j = Math.floor(s.kalender.dag / JAAR);
      return boek.bos[j] || (boek.bos[j] = { houthakkers: 0, hout: 0, om: {}, geplant: 0, jong: 0, volgroeid: 0, stil: 0, eind: null });
    };
    const inStuk = (r, x, y) => !!r && x >= r.x && x < r.x + r.b && y >= r.y && y < r.y + r.h;
    let hakt = 0;
    let groeit = 0;
    const houthakker = (r, voor, D_, g, hout) => {
      hakt--;
      if (D_ === s.dorp && hout > 0) bosJaar().hout += hout;
    };
    houthakker.voor = () => { hakt++; };
    na('houthakkerHakte', houthakker);
    const groei = () => { groeit--; };
    groei.voor = () => { groeit++; };
    na('tikBosDag', groei);
    na('velBoom', (r, voor, D_, x, y) => {
      if (!r || D_ !== s.dorp) return;
      const veld = T.veldOp(D_.wereld, x, y);
      const wie = hakt > 0 ? 'houthakker'
        : (D_.gebouwen || []).some((g) => g.wachtOpRooien && inStuk(g.kavel, x, y)) ? 'rooien' : 'anders';
      const b = bosJaar();
      b.om[wie] = (b.om[wie] || 0) + 1;
    });
    na('zetVoorwerp', (r, voor, w_, v) => {
      if (!v || w_ !== s.dorp.wereld) return;
      if (v.soort === 'boompje') bosJaar().geplant++;
      else if (groeit > 0 && v.geplant != null) bosJaar().jong++;
      else if (groeit > 0 && T.NATUUR.bos.telt(w_, v.x, v.y, v)) bosJaar().volgroeid++;
    });
    const bosStand = (D_, hakkers) => {
      const w_ = D_.wereld;
      const r = T.BOS_INSTELLINGEN.hakStraal;
      const stukken = hakkers.map((g) => {
        const f = T.voetVanGebouw(g);
        return { x: f.x - r, y: f.y - r, b: f.b + 2 * r, h: f.h + 2 * r };
      });
      const kaart = { bomen: 0, jong: 0, boompjes: 0, stronken: 0 };
      const bij = { bomen: 0, jong: 0, boompjes: 0 };
      for (const v of T.voorwerpenIn(w_, T.kaartVak(w_))) {
        const wat = T.NATUUR.bos.telt(w_, v.x, v.y, v) ? 'bomen' : v.soort === 'boompje' ? 'boompjes' : v.geplant != null ? 'jong' : v.soort === 'boomstronk' ? 'stronken' : null;
        if (!wat) continue;
        kaart[wat]++;
        if (wat !== 'stronken' && stukken.some((st) => inStuk(st, v.x, v.y))) bij[wat]++;
      }
      return { ...kaart, bij };
    };
    na('tikGebouwenDag', (r, voor, D_) => {
      if (D_ !== s.dorp) return;
      const b = bosJaar();
      const hakkers = (D_.gebouwen || []).filter((g) => g.klaar && T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].bos);
      b.houthakkers = Math.max(b.houthakkers, hakkers.length);
      b.stil += hakkers.filter((g) => g.boom === null).length;
      b.eind = bosStand(D_, hakkers);
    });
    const betaal = (r, voor, S_, geef) => {
      boek.heer = {
        dag: heel(s.kalender.dag), datum: datum(),
        vroeg: voor, gaf: Object.assign({}, geef), deel: r.deel, straf: r.straf || 'geen', tekst: r.tekst || '', kan: r.kan,
      };
    };
    betaal.voor = () => eisKort(T.eisVanDeHeer(s.dorp));
    na('betaalHeer', betaal);
    // Van gehucht tot dorp, en tot marktrecht (js/treden.js): op welke dag, en met hoeveel mensen.
    na('wordtTrede', (r, voor, S_, trede) => {
      if (!boek[trede]) boek[trede] = { trede, dag: heel(s.kalender.dag), datum: datum(), mensen: s.dorp.bevolking };
    });
  }

  function eind() {
    const s = S();
    let tegels = 0;
    let ongezaaid = 0;
    for (const a of s.wereld.akkers || []) {
      if (T.bestemmingVan(a) !== 'akker') continue;
      tegels += T.akkerTegels(a).length;
      ongezaaid += a.ongezaaid ? a.ongezaaid.size : 0;
    }
    return Object.assign(tel(), {
      tekst: s.dorp.einde ? `${{ leeg: 'het dorp leeg', verjaagd: 'weggejaagd door het dorp' }[s.dorp.einde.reden] || 'het ambt kwijt'} op ${datum()}` : `het jaar uit, tot ${datum()}`,
      ambtKwijt: !!s.dorp.einde && s.dorp.einde.reden === 'ambt',
      dorpLeeg: !!s.dorp.einde && s.dorp.einde.reden === 'leeg',
      // De twee bazen (js/bazen.js; vraag 106): waar ze eindigden, hoe laag ze kwamen, de waarschuwingen, waarom je weg
      // moest, en wat de speler op de grillen van de heer antwoordde (js/grillen.js).
      bazen: T.bazenNu(s.dorp) ? {
        nu: T.bazenNu(s.dorp),
        laagst: {
          gunst: Math.min(...boek.maanden.map((m) => (m.bazen ? m.bazen.gunst : 100)), T.bazenNu(s.dorp).gunst),
          vertrouwen: Math.min(...boek.maanden.map((m) => (m.bazen ? m.bazen.vertrouwen : 100)), T.bazenNu(s.dorp).vertrouwen),
        },
        waarschuwingen: s.dorp.bazen.waarschuwingen ? s.dorp.bazen.waarschuwingen.gunst + s.dorp.bazen.waarschuwingen.vertrouwen : 0,
        weg: s.dorp.einde && s.dorp.einde.reden !== 'leeg' ? { reden: s.dorp.einde.reden, waarom: s.dorp.einde.waarom || null } : null,
        grillen: s.dorp.grillen ? { aantal: s.dorp.grillen.aantal, beantwoord: s.dorp.grillen.beantwoord, stil: s.dorp.grillen.stil } : null,
        antwoorden: (boek.grillen || []).map((g) => `${g.datum}: ${g.id}, ${g.antwoord}`),
        laatst: { gunst: s.dorp.bazen.waarom.gunst.slice(), vertrouwen: s.dorp.bazen.waarom.vertrouwen.slice() },
      } : null,
      jaarverslagen: boek.jaarverslagen || [],
      // De rovers (js/rovers.js): hoe vaak ze kwamen, hoe vaak ze verslagen werden, en wat ze meenamen.
      rovers: {
        kwamen: boek.berichten.filter((b) => /^Robbers are coming\./.test(b.tekst)).length,
        verslagen: boek.berichten.filter((b) => b.tekst === 'The robbers are defeated.').length,
        roofden: boek.berichten.filter((b) => /^The robbers make off/.test(b.tekst)).map((b) => `${b.datum}: ${b.tekst}`),
        gesneuveld: boek.bevolking.filter((b) => b.reden === 'gesneuveld').length,
      },
      akkertegels: tegels, ongezaaid,
      jaren: s.dorp.heer.jaren,
    });
  }

  function winter() {
    const w = { doden: 0, kou: 0, honger: 0, beide: 0, weg: 0, erbij: 0 };
    for (const b of boek.bevolking) {
      if (b.verschil > 0) w.erbij += b.verschil;
      else if (b.reden === 'winter') {
        w.doden -= b.verschil;
        if (/wood and the food/.test(b.waarom)) w.beide -= b.verschil;
        else if (/wood/.test(b.waarom)) w.kou -= b.verschil;
        else w.honger -= b.verschil;
      } else if (b.reden !== 'gesneuveld') w.weg -= b.verschil; // wie tegen de rovers viel, trok niet weg
    }
    w.waarschuwingen = boek.berichten.filter((b) => /winter/i.test(b.tekst) && /lasts? |will run out|has run out/.test(b.tekst)).map((b) => `${b.datum}: ${b.tekst}`);
    return w;
  }

  // Hetzelfde lot als speeltest.cjs vóór het laden zet (mulberry32), opnieuw vanaf het zaad. De browser
  // tekent vóór het jaar begint al een paar beelden, en hoeveel dat er zijn, verschilt per keer; elk
  // beeld kan het lot aanspreken. Opnieuw beginnen bij het begin van het jaar maakt hetzelfde zaad
  // hetzelfde jaar. (De boeren zijn dan al geloot, bij het laden, en dat ging nog wel altijd gelijk.)
  function zaai(z) {
    let s = z >>> 0;
    Math.random = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Het lot vanaf het moment van opslaan, in het jaar dat opslaat en herlaadt en in hetzelfde jaar zonder.
  const zaaiNaHetOpslaan = (zaad) => zaai(Math.imul(zaad, 40503) ^ 0x0b5a7e);

  T.speeltest = {
    // opslaan: { dag, bewaar }: op de eerste stille stap vanaf die dag opslaan en stoppen (bewaar), of alleen
    // het lot opnieuw trekken (hetzelfde jaar zonder opslaan). verder: { eenKeer }: na het herladen verder
    // met Verder op het titelscherm, met wat de speler al één keer deed.
    async speel({ speler, zaad, opslaan = null, verder = null, jaren = 1 }) {
      EIND = JAAR * jaren + 30;
      if (!verder) {
        zaai(Math.imul(zaad, 2654435761) ^ 0x5eed);
        // En de klok van het scherm op nul: of een koe ligt of graast, hangt ervan af (T.rustVanDier,
        // js/vee.js), en een liggende koe staat een ander anders in de weg dan een grazende.
        T.S.tijd = 0;
      }
      boek = {
        speler, zaad, berichten: [], bevolking: [], daden: [], maanden: [], gebouwd: [],
        heer: null, brief: null, luisterFouten: [], dorp: null, marktrecht: null, graan: [], geluk: [],
        bos: [], jaren,
      };
      const s = S();
      luister();
      // Tekenen hoeft niet: de regels hangen er niet van af (de toetsen draaien ze ook zonder scherm), en
      // het scheelt driekwart van de tijd. De lus van de browser zelf tekent niet tussendoor, want dit
      // hele jaar wacht nooit op de browser (T.debug.stap, js/main.js).
      T.tekenScene = () => {};
      if (verder) {
        // Het titelscherm: Verder laadt het nieuwste spel, dat de speler net zelf opsloeg (js/menu.js).
        if (!klik('#menu [data-actie="verder"]')) throw new Error('er staat geen Verder op het titelscherm');
        for (const naam of verder.eenKeer) eenKeer.add(naam);
        zaaiNaHetOpslaan(zaad);
      } else {
        // Het titelscherm: een nieuw spel (js/menu.js), met de naam die het voorstelt (vraag 60). Dan de
        // benoemingsbrief: lezen, en aan het werk.
        if (!klik('#menu [data-actie="nieuw"]')) throw new Error('er staat geen Nieuw spel op het titelscherm');
        if (!klik('#menu [data-actie="begin"]')) throw new Error('er staat geen Begin onder de naam van het dorp');
        if (!klik('#brief .heer-geef-knop') && T.ui.briefOpen()) T.ui.sluitBrief(s);
      }
      T.zetSnelheid(s, 30);
      boek.spelZaad = s.dorp.lot.zaad;
      boek.begin = tel(); // de eerste van de maand zelf schrijft de boekhouding op, bij de eerste stap
      const P = SPELERS[speler];
      if (P.begin && !verder) await P.begin();
      for (let i = 0; i < 800000 && dagNu() < EIND && !s.dorp.einde && s.modus !== 'dood'; i++) {
        if (opslaan && !opslaan.gedaan && dagNu() >= opslaan.dag && !T.waaromNietOpslaan(s)) {
          opslaan.gedaan = true;
          if (opslaan.bewaar) {
            // Zoals een speler: het menu, Opslaan, plek 1, en weer spelen. Dan stopt dit deel van het jaar.
            klik('#menu-knop');
            klik('#menu [data-actie="opslaan"]');
            klik('#menu [data-actie="bewaar"][data-plek="1"]');
            klik('#menu [data-actie="ja"]');
            const melding = (document.querySelector('#menu .menu-melding') || {}).textContent || '';
            klik('#menu [data-actie="verder"]');
            return { speler, zaad, opgeslagen: { dag: heel(dagNu()), datum: datum(), melding, eenKeer: [...eenKeer] } };
          }
          zaaiNaHetOpslaan(zaad);
        }
        await stap();
        await P.elkeStap();
      }
      boek.eind = eind();
      boek.winter = winter();
      // Voor de proef met opslaan: het hele spel aan het eind, om twee jaren letter voor letter te vergelijken.
      if (opslaan || verder) boek.eindStaat = T.bewaarSpel(s, { plek: 'eind', nu: 0 });
      return JSON.parse(JSON.stringify(boek));
    },
  };
})(globalThis.Spel);
