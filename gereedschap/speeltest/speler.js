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
// waar een knop een gesprek opent (de heer, de marskramer), roept hij hetzelfde gevolg aan als die keuze
// in het gesprek (T.doeGevolg). Verstoppen en de soldaten leiden deden de spelers tot 11 okt ook; dat ging eruit, met
// de inner (vraag 151).
//
// Wat er gebeurt, schrijft hij op zonder het te veranderen: een paar regels van het spel krijgen een
// luisteraar (luister, onderaan), en elke eerste van de maand een stand.
//
// De twee spelers van vraag 45 (Marcel koos er toen vier; lui 30% en lui 60% verstopten alleen graan en goud, en
// zijn er sinds 11 okt uit):
//   braaf   geeft de heer alles wat hij vraagt;
//   slim    bouwt een kapel, verkoopt graan als het goud voor de heer tekortschiet, en betaalt de heer 90%.
// Beide luisteren naar de winter: zegt het dorp dat het hout de winter niet haalt, dan bouwen ze een
// houthakker.
//
// En een vijfde, voor de proef "van gehucht tot dorp" (werklijst, vraag 58, A; Marcel, 29 sep: "A Ja goed idee"):
//   bouwer  doet wat het doel vraagt (js/treden.js), twee jaar lang: hij houdt steeds één erf vrij, neemt Vreemden
//           welkom aan, bouwt wat het doel aan gebouwen vraagt zodra het goud en het hout er zijn (sinds 2 okt, vraag
//           90, niets meer: een trede komt met de dorpelingen), een houthakker als het
//           dorp zegt dat het hout de winter niet haalt, verkoopt de marskramer graan als het goud tekortschiet (en
//           houdt wat het dorp tot de lente eet, het zaaigraan en het graan van de heer), koopt in de lente zaaigraan
//           als er akkers kaal liggen (sinds 1 okt, vraag 79), bouwt een jager als het eten de winter niet haalt
//           (hooguit één per maand; vraag 81), en betaalt de heer alles. Hij loopt de rovers niet
//           achterna. Sinds 2 okt (vraag 86, b, en 87, D) volgt hij ook de wensen, zoals de raad ze zegt
//           (T.watDeHuizenMissen): een put of een kapel waar hij de meeste huizen zonder bereikt, een visser of een
//           jager voor vlees of vis, en een houthakker of een steengroeve als een huis op bouwstof wacht, hooguit één
//           per maand; en een houthakker vóór een nieuw erf, als er nog geen staat. Bij de marskramer verkoopt hij ook
//           graan voor het goud van zijn volgende wens (vraag 89, c). Sinds vraag 90, D kent de raad de ketens, en
//           de bouwer dus ook: een bakkerij en een molen voor brood, en een molen als de bakkerij geen meel heeft.
//           Sinds vraag 91, a volgt hij ook wat de raad over goud zegt: zegt die dat de belasting goud brengt, dan
//           neemt hij hem aan (W), en hij bouwt de eerste wens die hij kan betalen, in plaats van op de eerste te
//           wachten. Sinds vraag 95, b wijst hij een erf aan waar het huis de herberg, een markt, een kapel en een put in
//           zijn kring heeft (bouwErf), en niet meer gewoon zo dicht mogelijk bij zijn eigen deur. Sinds vraag 96, b bouwt
//           hij een keten in één keer: een bakkerij en een molen samen. Sinds vraag 99, c koopt hij laken bij de
//           marskramer als de ambachtslieden het tot zijn volgende bezoek tekortkomen, met het goud dat hij niet nodig
//           heeft voor zijn volgende wens. Sinds vraag 132, B koopt hij in de herfst het zout dat vis en vlees de winter
//           door laat komen (T.visEnVleesVoorDeWinter).
// En een zesde (werklijst vraag 93, a, en 94; Marcel, 2 okt: "De bouwer mag alles er aan doen, totale vrijheid"):
//   sluw    de bouwer, maar hij geeft de heer 90% van wat hij vraagt, elk jaar zoals de slimme speler (het
//           verstoppen van graan en goud, en de soldaten langs lege kelders leiden, deed hij tot 11 okt ook).
//           Haalt het eten de winter niet, dan zet hij het rantsoen op krap (tot 1 grasmaand), en haalt het hout hem niet,
//           dan neemt hij Houtkap aan.
// Wie twee jaar speelt, krijgt een graanboek (vraag 94, d): per jaar waar het graan bleef (luister, onderaan), en per jaar
// hoeveel dagen er geen bier of brood was en hoeveel huizen alles hadden (boekhouding).
// Van elke speler schrijft hij op waarom er op een groeidag geen gezin kwam (T.waaromGeenGezin, js/gebouwen.js),
// op welke dag het gehucht een dorp werd en marktrecht kreeg, en welke raad er elke dag onder het doel stond
// (js/raad.js).
(function (T) {
  'use strict';

  const EIND = 390; // 1 grasmaand van het tweede jaar; wie twee jaar speelt (jaren: 2), een jaar later
  const JAAR = 360;
  const STAP = 0.25; // schermseconden per stap; op 30× ruim een half uur
  const DAG_HEER = 250; // 11 slachtmaand, Sint-Maarten

  let boek = null; // wat er gebeurde, voor speeltest.cjs
  const bezig = {}; // welk venster de speler zelf openhoudt: dat sluit beantwoord() niet
  const geboekt = new WeakSet(); // de voorvallen die al in het boek staan
  // Staat het gesprek van een voorval open (js/voorvallen.js): praat de schout met wie hem zocht?
  const voorvalOpen = (s) => s.modus === 'dialoog' && !!(s.dorp.voorvallen && s.dorp.voorvallen.lopend) && s.spreektMet === s.dorp.voorvallen.lopend.wie.wezen;
  // Wat een antwoord kost, zoals het venster het onder het antwoord zet (T.prijsVanKeuze in js/voorvallen.js).
  const prijsVan = (b) => (b.querySelector('.dialoog-prijs') || {}).textContent || '';
  // Haalt het dorp de winter nog als dit eraf gaat (T.etenVoorDeWinter, T.houtVoorDeWinter in js/behoeften.js)? Even
  // uitrekenen met minder in de schuur, en de schuur weer terug.
  function haaltHetNog(s, wat, n) {
    const oud = s.dorp.voorraad[wat] || 0;
    s.dorp.voorraad[wat] = oud - n;
    const dag = Math.floor(s.kalender.dag);
    const haalt = (wat === 'hout' ? T.houtVoorDeWinter(s.dorp, dag) : T.etenVoorDeWinter(s.dorp, dag)).haalt;
    s.dorp.voorraad[wat] = oud;
    return haalt;
  }
  // Een verstandig antwoord: niemand het bos in (wie het bos in gaat, komt terug als rover, en deze spelers lopen de
  // rovers niet achterna), en geen graan of hout dat de winter nodig heeft.
  function verstandig(s, prijs) {
    if (/het bos in/.test(prijs)) return false;
    for (const wat of ['graan', 'hout']) {
      const m = new RegExp(`−(\\d+) ${wat}`).exec(prijs);
      if (m && !haaltHetNog(s, wat, Number(m[1]))) return false;
    }
    return true;
  }

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

  // Een wet in een stand zetten zoals een speler: het menu (W), de knop op de kaart van de wet, en het menu weer dicht.
  // Zegt of de wet nu in die stand staat.
  function zetWet(wet, stand) {
    const s = S();
    T.ui.openWetten(s);
    klik(`#wetten button[data-wet="${wet}"][data-stand="${stand}"]`);
    if (!klik('#wetten [data-actie="sluit"]')) T.ui.sluitWetten(s);
    return T.standVanWet(s.dorp, wet) === stand;
  }
  const neemWetAan = (wet) => zetWet(wet, 'aangenomen');

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
      if (dagNu() >= tot || D().einde || S().modus === 'dood') return false;
      await stap(sec);
    }
    return false;
  }

  // Wat vanzelf opengaat: de brief van de heer (1 wijnmaand) en het slachten (1 slachtmaand). De brief
  // lees je en sluit je; bij het slachten neem je het voorstel van het spel (zo weinig als kan, zodat
  // het hooi de winter haalt). Een venster dat de speler niet zelf openhoudt, gaat dicht.
  // Welke soort regel er in een rapport staat (js/ochtendrapport.js), voor de telling hierboven.
  const RAPPORT_SOORTEN = [
    ['stil', /^Niets bijzonders/],
    ['nieuw', /^Nieuw in het dorp/],
    ['gestorven', /gestorven\.$|sneuvelde/],
    ['weg', / weg: /],
    ['boeren', /de boeren/],
    ['besluit', /^Over .* besliste/],
    ['nietGesproken', /zocht je over/],
    ['sindsGisteren', /^Sinds gisteren/],
    ['nogSteeds', /nog steeds/],
    ['voorbij', /voorbij\.$| meer in de huizen\.$| ontevreden meer\.$|^Er is weer plaats/],
    ['winter', /winter/],
    ['honger', /^Er is honger/],
    ['kou', /^Het is koud/],
    ['vol', /^De huizen zitten vol/],
    ['onvrede', /^Het dorp is ontevreden/],
    ['komt', /^Vandaag komt|^De rovers|^De heer wil/],
  ];

  // Een gril van de heer (js/grillen.js; werklijst vraag 106, stap 2): elke speler antwoordt naar zijn aard. De brave
  // geeft hem wat hij wil; de bouwer ook, als het de winter niet kost (zoals bij een voorval); de slimme en de sluwe wegen de heer tegen het dorp, en redden wie het dichtst bij de
  // grens zit (js/bazen.js). Geeft de keuze (een getal), of null als er niets kan.
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
    if (boek.speler === 'braaf') return kan[0];
    if (boek.speler === 'bouwer') {
      const goed = kan.find((i) => verstandig(s, keuzes[i].prijs));
      return goed != null ? goed : beste((i) => -kost(i));
    }
    if (b.gunst < 30) return beste(gunst);
    if (b.vertrouwen < 30) return beste(vertrouwen);
    return beste((i) => gunst(i) + vertrouwen(i) - kost(i) / 5);
  }

  function beantwoord() {
    const s = S();
    // Wacht er een gril, en is er geen brief open (het rapport kwam ertussen), dan opent hij hem met de knop Brief, zoals
    // een mens.
    if (T.grilNu(s.dorp) && !T.ui.briefOpen() && s.modus === 'verkennen') T.ui.toonBrief(s.dorp, 'gril');
    // Een gril van de heer: antwoorden naar zijn aard, en opschrijven wat hij koos (js/grillen.js; vraag 106).
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
    // Het rapport van de raadsman ('s ochtends, js/ochtendrapport.js): lezen en dicht, en geen brief van de heer. De
    // speler telt hoe vaak hij het kreeg, hoe vaak het "Niets bijzonders" was en welke soort regels erin stonden, en
    // schrijft de eerste vijf op die iets zeiden, zodat de uitslag laat zien wat erin staat.
    if (T.ui.briefOpen() && document.querySelector('#brief').dataset.soort === 'rapport') {
      const R = s.dorp.ochtendrapport;
      const r = boek.rapporten || (boek.rapporten = { gelezen: 0, stil: 0, soorten: {}, voorbeelden: [] });
      r.gelezen++;
      if (R && /^Niets bijzonders/.test(R.regels[0])) r.stil++;
      else if (R && r.voorbeelden.length < 5) r.voorbeelden.push({ datum: datum(), door: R.door, regels: R.regels.slice() });
      for (const regel of (R && R.regels) || []) {
        const soort = RAPPORT_SOORTEN.find(([, re]) => re.test(regel));
        const naam = soort ? soort[0] : 'anders';
        r.soorten[naam] = (r.soorten[naam] || 0) + 1;
      }
      if (!klik('#brief [data-actie="sluit"]')) T.ui.sluitBrief(s);
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
    // Een voorval (js/voorvallen.js): wie de schout zoekt, spreekt hem aan. Elke speler leest de prijs onder de
    // antwoorden en kiest het eerste verstandige (hieronder), met de knop zoals een mens, en anders het eerste dat kan;
    // heeft het gesprek nog een knoop, dan daar weer.
    for (let i = 0; i < 4 && voorvalOpen(s); i++) {
      const L = s.dorp.voorvallen.lopend;
      const knoppen = [...document.querySelectorAll('#dialoog-keuzes button')].filter((b) => !b.disabled);
      // Een bouwverzoek (js/verzoeken.js; werklijst vraag 103): ja als het kan, zoals de bouwer bouwde wat de raad zei,
      // ook als het hout voor de winter krap is (daar waarschuwt de raad voor, en dan vraagt iemand een houthakker); kan
      // het niet, dan nee. Een gewoon voorval: het eerste verstandige antwoord.
      // Een werkplaats die eerst in het bos van de heer rooit (js/bos.js; werklijst vraag 110, e) kost zijn gunst, dus ja
      // zolang de baas die het kost daarna op 30 of meer staat (de grens die de slimme ook bij een gril houdt). In de
      // speeltest van 6 okt zei de bouwer op 62707 met 5 gunst nog ja tegen een jager in het bos, en was hij zijn ambt kwijt.
      const verzoek = L.bouw;
      const magJa = (b) => {
        const bazen = T.bazenNu(s.dorp);
        if (!(L.bouw && L.bouw.bos) || !bazen) return true;
        const v = /vertrouwen van het dorp −(\d+)/.exec(prijsVan(b));
        const g = /gunst van de heer −(\d+)/.exec(prijsVan(b));
        return (!v || bazen.vertrouwen - Number(v[1]) >= 30) && (!g || bazen.gunst - Number(g[1]) >= 30);
      };
      const tekst = (b) => b.textContent.replace(/^\d/, '');
      const ja = !verzoek ? null : knoppen.find((b) => /^Ja/.test(tekst(b)) && magJa(b));
      const knop = verzoek ? ja || knoppen.find((b) => /^Nee/.test(tekst(b))) || knoppen[0] : knoppen.find((b) => verstandig(s, prijsVan(b))) || knoppen[0];
      if (!knop) break;
      const antwoord = knop.textContent.replace(/^\d/, '');
      if (!geboekt.has(L)) {
        geboekt.add(L);
        boek.voorvallen.push({ dag: heel(s.kalender.dag), datum: datum(), id: L.id, wie: T.naamVanBewoner(L.wie), antwoord, bouw: L.bouw ? L.bouw.soort : undefined });
      }
      const bouw = L.bouw && L.bouw.soort;
      const voor = s.dorp.gebouwen.length;
      knop.click();
      // Een bouwverzoek (js/verzoeken.js; werklijst vraag 103): wat er zo gebouwd werd, telt als gebouwd, zoals toen de
      // speler het zelf deed.
      if (bouw && /^Ja/.test(antwoord)) {
        const gelukt = s.dorp.gebouwen.length > voor;
        boek.gebouwd.push({ dag: heel(dagNu()), datum: datum(), soort: bouw, gelukt, reden: gelukt ? null : 'geen plek of geen bouwstof', door: 'verzoek' });
        daad(`zegt ja tegen ${T.naamVanBewoner(L.wie)}: een ${bouw}`);
      } else if (bouw) daad(`zegt nee tegen ${T.naamVanBewoner(L.wie)}: een ${bouw}`);
    }
    if (s.modus === 'raadsman' && !bezig.raadsman) T.ui.sluitRaadsman(s);
    if (s.modus === 'handel' && !bezig.handel) T.ui.sluitHandel(s.dorp);
    if (s.modus === 'heer' && !bezig.heer) T.ui.sluitHeer(s);
    if (s.modus === 'dialoog' && !bezig.praten) T.sluitDialoog(s);
    if (s.modus === 'velden') T.ui.sluitVelden(s);
    if (s.modus === 'wetten') T.ui.sluitWetten(s);
    if (s.modus === 'spelregels') T.ui.sluitSpelregels(s);
    vecht();
  }

  // Een gevecht (rovers, js/rovers.js; werklijst vraag 55): wie van jouw kant aan de beurt is, slaat de rover die
  // hij kan halen; anders loopt hij er zo ver heen als zijn punten reiken; en kan hij niets, dan eindigt hij zijn
  // beurt. Zo verdedigt elke speler zijn dorp, met de schout en de mannen van het wachthuis. Het gaat, zoals een
  // speler, via dezelfde vraag als de klik (T.handelingGevecht, js/gevecht.js).
  function vecht() {
    const s = S();
    if (s.modus !== 'gevecht' || s.bezig || !T.spelerAanDeBeurt(s)) return;
    const v = T.aanDeBeurt(s);
    const bij = (m) => T.afstand(T.tegelVan(m), T.tegelVan(v));
    const vijanden = s.gevecht.monsters.filter((m) => !m.dood).sort((a, b) => bij(a) - bij(b));
    for (const m of vijanden) {
      const h = T.handelingGevecht(s, { wezen: m, x: m.tx, y: m.ty });
      if (h && h.doe && h.kan !== false) return h.doe();
      if (h && h.pad && h.pad.length && v.ap > 0) {
        const t = h.pad[Math.min(v.ap, h.pad.length) - 1];
        const lopen = T.handelingGevecht(s, { x: t.x, y: t.y });
        if (lopen && lopen.doe && lopen.kan !== false) return lopen.doe();
      }
    }
    T.eindeBeurt(s);
  }

  // ── Lopen en klikken ────────────────────────────────────────────────────────────────────────────
  // Een klik op `doel` ({x, y} of {wezen}), en wachten tot de schout er is. Staat er iemand op de
  // volgende tegel, dan blijft hij staan en is de klik weg (js/anim.js); dan klikt hij opnieuw, zoals
  // een speler doet. `gelukt` zegt wanneer het goed ging (het venster is open, het gesprek loopt);
  // anders: hij staat erop of ernaast. Geeft of het lukte.
  async function klikOp(doel, maxUren = 6, gelukt = null) {
    const tot = dagNu() + maxUren / 24;
    let klaar = false;
    for (let poging = 0; poging < 8 && !klaar; poging++) {
      // Midden in een gevecht (rovers) klikt een speler niet om ergens heen te lopen: de muis doet dan alleen het
      // gevecht (js/main.js). Eerst het gevecht uit, dat vecht() hierboven voert.
      if (S().modus !== 'verkennen') await wachtTot(() => S().modus === 'verkennen', 24);
      if (S().modus !== 'verkennen') return false;
      const h = T.handelingVerkennen(S(), doel);
      if (!h || !h.doe) return false;
      h.doe();
      await wachtTot(() => !S().schout.pad.length && !S().schout.onderweg, Math.max(0.1, (tot - dagNu()) * 24));
      klaar = gelukt ? gelukt() : T.afstand(schoutTegel(), doel.wezen ? T.tegelVan(doel.wezen) : doel) <= 1;
      if (dagNu() >= tot) break;
      if (!klaar) await stap(0.05); // even wachten tot wie in de weg stond, doorloopt
    }
    return klaar;
  }

  const schoutTegel = () => T.tegelVan(S().schout);

  // ── Bouwen ──────────────────────────────────────────────────────────────────────────────────────
  const huisVanDeSchout = () => D().gebouwen.find((g) => g.huis === 'schout');

  // Waar het past, zoals een inwoner die het vraagt het kiest (T.plekVoor, js/verzoeken.js): een put of een kapel waar hij
  // de meeste huizen bereikt die er nog geen hebben (zoals een speler die met de put in de hand kijkt wat de muis zegt),
  // de rest zo dicht mogelijk bij de deur van de schout. Vragen de mensen het je (de spelregel "Wie bouwt"; werklijst
  // vraag 103), dan bouwt de speler zelf niets: dan komt het als verzoek, en zegt hij ja of nee (de voorvallen, in
  // beantwoord hierboven).
  function bouw(soort) {
    if (T.VERZOEKEN_INSTELLINGEN.mensen) return false;
    const s = S();
    const huis = huisVanDeSchout();
    const midden = huis ? T.deurVan(s.wereld, huis) : schoutTegel();
    const kring = T.WENSEN_INSTELLINGEN.kring[soort] != null;
    const plek = T.plekVoor(s.dorp, soort, midden);
    if (!plek) {
      daad(kring ? `vindt geen plek waar een ${soort} iemand helpt` : `vindt geen plek voor een ${soort}`);
      return false;
    }
    const u = T.plaatsGebouw(s.dorp, soort, plek.x, plek.y);
    boek.gebouwd.push({ dag: heel(dagNu()), datum: datum(), soort, gelukt: u.gelukt, reden: u.reden || null });
    const voor = kring ? ` voor ${plek.zonder === 1 ? 'één huis' : `${plek.zonder} huizen`}` : '';
    daad(u.gelukt ? `bouwt een ${soort}${voor}` : `wil een ${soort} bouwen, maar: ${u.reden}`);
    return u.gelukt;
  }

  // Een erf (werklijst vraag 95, b): waar het huis dat erop komt, de plekken die de huizen willen in zijn kring heeft
  // (T.inDeKring, js/wensen.js), zoals een speler die met het erf in de hand naar de kringen kijkt: eerst de herberg (een
  // tweede vond in de speeltest van vraag 94 geen plek meer), dan een markt, een kapel en een put. Het huis komt ergens op
  // het erf, dus telt het midden van het erf, met 2 tegels speling. Van de plekken waar een erf past, die met de beste
  // kringen; bij gelijk spel het dichtst bij de deur van de schout, zoals bouw(). Tot 3 okt kwam een erf gewoon zo dicht
  // mogelijk bij de schout, en misten een paar huizen het hele tweede jaar de herberg of een markt. Sinds 6 okt mag een erf
  // op struiken en bomen (vraag 110, e): hij legt het liever niet in het bos van de heer (dat kost zijn gunst), en bij
  // gelijke kringen liever waar minder te rooien is.
  const KRINGEN_VAN_EEN_ERF = [['herberg', 8], ['markt', 4], ['kapel', 2], ['put', 1]];
  function bouwErf() {
    const s = S();
    const huis = huisVanDeSchout();
    const midden = huis ? T.deurVan(s.wereld, huis) : schoutTegel();
    const maat = T.erfMaat();
    // Een plek zonder kring (de herberg en de markt sinds vraag 96, a: één voor het hele dorp) telt overal.
    const straalVan = (soort) => (T.WENSEN_INSTELLINGEN.kring[soort] == null ? null : T.WENSEN_INSTELLINGEN.kring[soort] - 2);
    const plekken = KRINGEN_VAN_EEN_ERF.map(([soort, telt]) => ({ soort, telt, er: T.plekkenVan(s.dorp, soort), straal: straalVan(soort) }));
    let beste = null;
    for (let y = 0; y < s.wereld.tegels.length; y++) {
      for (let x = 0; x < s.wereld.tegels[0].length; x++) {
        if (!T.gebouwPast(s.dorp, 'erf', x, y)) continue;
        const erf = { x, y, b: maat.b, h: maat.h };
        const bos = T.inHetBosVanDeHeer(s.dorp, erf) ? 1 : 0;
        if (beste && bos > beste.bos) continue;
        const kringen = plekken.filter((p) => p.er.some((r) => T.inDeKring(erf, r, p.straal)));
        const n = kringen.reduce((som, p) => som + p.telt, 0);
        const rooien = T.teRooienOp(s.dorp, T.kavelVanErf(s.dorp, erf)).length;
        const d = Math.hypot(x - midden.x, y - midden.y);
        const beter = !beste || bos < beste.bos || n > beste.n || (n === beste.n && (rooien < beste.rooien || (rooien === beste.rooien && d < beste.d)));
        if (beter) beste = { x, y, n, d, kringen, bos, rooien };
      }
    }
    if (!beste) {
      daad('vindt geen plek voor een erf');
      return false;
    }
    const u = T.plaatsGebouw(s.dorp, 'erf', beste.x, beste.y);
    boek.gebouwd.push({ dag: heel(dagNu()), datum: datum(), soort: 'erf', gelukt: u.gelukt, reden: u.reden || null });
    const bij = beste.kringen.map((p) => (p.soort === 'herberg' ? 'de herberg' : `een ${p.soort}`));
    const rooi = beste.bos ? ', in het bos van de heer' : beste.rooien ? `, waar het gezin eerst ${beste.rooien} tegels rooit` : '';
    daad(u.gelukt ? `wijst een erf aan${bij.length ? ` binnen de kring van ${bij.join(', ')}` : ', buiten elke kring'}${rooi}` : `wil een erf aanwijzen, maar: ${u.reden}`);
    return u.gelukt;
  }

  // De winter: zegt het dorp dat het hout hem niet haalt, dan een houthakker (alle vier de spelers).
  let gelezen = 0;
  function luisterNaarDeWinter() {
    for (; gelezen < boek.berichten.length; gelezen++) {
      const b = boek.berichten[gelezen];
      if (/The wood lasts \d+ of the \d+ days/.test(b.tekst)) bouw('houthakker');
    }
  }

  // ── De heer betalen ───────────────────────────────────────────────────────────────────────────
  // Naar hem toe (zijn gesprek), en dan het venster, zoals de keuze in zijn gesprek het opent. Met
  // `deel` 1 de knop "Alles wat hij vraagt"; met 0,9 schuift de speler tot het venster 90% zegt.
  async function betaal(deel) {
    const s = S();
    const heer = s.dorp.heer.bezoek.wezens && s.dorp.heer.bezoek.wezens[0];
    if (heer) {
      bezig.praten = true;
      await klikOp({ wezen: heer }, 3, () => S().modus === 'dialoog');
      bezig.praten = false;
    }
    T.sluitDialoog(s);
    bezig.heer = true;
    T.doeGevolg(s, s.dorp, { heer: true });
    if (s.modus !== 'heer') {
      bezig.heer = false;
      daad('kan de heer niet betalen: het venster ging niet open');
      return;
    }
    const eis = T.eisVanDeHeer(s.dorp);
    if (deel < 1) {
      const geef = {};
      for (const wat of eis.volgorde) {
        const heb = Math.floor(s.dorp.voorraad[wat] || 0);
        geef[wat] = Math.min(heb, wat === 'goud' ? Math.ceil(deel * (eis.per.goud || 0)) : Math.ceil(deel * eis.per[wat]));
      }
      // Tekort aan iets anders: goud neemt hij in de plaats, tot het venster 90% zegt.
      for (let i = 0; i < 500 && T.gevolgVanBetaling(s.dorp, geef, eis).deel < deel - 1e-9 && geef.goud < Math.floor(s.dorp.voorraad.goud || 0); i++) geef.goud++;
      for (const wat of eis.volgorde) {
        const schuif = document.querySelector(`#heer input[type="range"][data-wat="${wat}"]`);
        if (!schuif) continue;
        schuif.value = String(geef[wat]);
        schuif.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    if (!klik('#heer [data-actie="betaal"]')) daad('kan niet betalen: de knop staat uit');
    // De schandpaal: de schout zelf, als dat mag (het dorp neemt het hem niet kwalijk).
    if (s.dorp.heer.bezoek && s.dorp.heer.bezoek.schandpaal) {
      if (!klik('#heer .paal-keuze[data-wie="schout"]')) klik('#heer .paal-keuze');
    }
    if (s.modus === 'heer') T.ui.sluitHeer(s);
    bezig.heer = false;
  }

  // ── Graan verkopen voor het goud van de heer (de slimme speler) ─────────────────────────────────
  async function verkoopVoorDeHeer() {
    const s = S();
    const m = s.dorp.marskramer;
    const eis = T.eisVanDeHeer(s.dorp);
    const nodig = Math.ceil(0.9 * (eis.per.goud || 0)) + 2 - Math.floor(s.dorp.voorraad.goud || 0);
    if (nodig <= 0) return;
    const eet = T.etenVoorDeWinter(s.dorp, s.kalender.dag).eet || 0;
    const reserve = Math.ceil(0.9 * (eis.per.graan || 0)) + Math.ceil(eet * (DAG_HEER - s.kalender.dag)) + 20;
    const prijs = T.HANDEL_INSTELLINGEN.koopt.graan.prijs[m.bezoek];
    const pakken = Math.min(Math.ceil(nodig / prijs), Math.floor(((s.dorp.voorraad.graan || 0) - reserve) / T.HANDEL_INSTELLINGEN.koopt.graan.per));
    if (pakken <= 0) {
      daad(`zou graan verkopen voor ${nodig} goud, maar het graan is nodig`);
      return;
    }
    await verkoopGraan(pakken, prijs);
  }

  // Naar de marskramer (zijn gesprek), dan het handelsvenster, zoals de keuze in zijn gesprek het opent, en zoveel
  // pakken graan verkopen als hij wil hebben, tot `pakken`.
  // Naar de marskramer, zijn gesprek, het handelsvenster open, `doe` erin, en weer dicht, zoals een speler.
  async function handelMet(doe) {
    const s = S();
    bezig.praten = true;
    await klikOp({ wezen: s.dorp.marskramer.wezen }, 3, () => s.modus === 'dialoog');
    bezig.praten = false;
    T.sluitDialoog(s);
    bezig.handel = true;
    T.doeGevolg(s, s.dorp, { handel: true });
    const uit = doe();
    if (!klik('#handel [data-actie="sluit"]')) T.ui.sluitHandel(s.dorp);
    bezig.handel = false;
    return uit;
  }

  // Zoveel keer op een knop van het handelsvenster: kopen of verkopen, één pak per klik. Geeft hoe vaak het lukte.
  const klikHandel = (actie, wat, keer) => {
    let gelukt = 0;
    for (let i = 0; i < keer; i++) if (klik(`#handel button[data-actie="${actie}"][data-wat="${wat}"][data-n="1"]`)) gelukt++;
    return gelukt;
  };

  async function verkoopGraan(pakken, prijs) {
    const verkocht = await handelMet(() => klikHandel('verkoop', 'graan', pakken));
    daad(`verkoopt ${verkocht * T.HANDEL_INSTELLINGEN.koopt.graan.per} graan aan de marskramer, voor ${verkocht * prijs} goud`);
  }

  // Zaaigraan, in de lente (js/handel.js; werklijst vraag 79, stap 1): de boeren zaaien het na (T.zaaiNa, js/akkers.js).
  async function koopGraan(pakken, prijs) {
    const gekocht = await handelMet(() => klikHandel('koop', 'graan', pakken));
    daad(`koopt ${gekocht * T.HANDEL_INSTELLINGEN.verkoopt.graan.per} zaaigraan van de marskramer, voor ${gekocht * prijs} goud`);
  }

  // Hoeveel akkertegels er kaal liggen en na te zaaien zijn (T.zaaiNa, js/akkers.js): niet gezaaid, en niet vertrapt.
  function kaleTegels() {
    let n = 0;
    for (const a of S().wereld.akkers || []) {
      if (T.bestemmingVan(a) !== 'akker' || !a.ongezaaid) continue;
      for (const k of a.ongezaaid) if (!(a.vertrapt && a.vertrapt.has(k))) n++;
    }
    return n;
  }

  // ── De spelers ──────────────────────────────────────────────────────────────────────────────────
  const eenKeer = new Set();
  const nuEenKeer = (naam) => (eenKeer.has(naam) ? false : (eenKeer.add(naam), true));
  // De heer staat op het plein en wacht ("De heer staat op het plein en wacht op je").
  const heerOpHetPlein = () => T.heerWacht(D()) && D().heer.bezoek.staat;

  // Hoeveel akkertegels er op 1 lentemaand gezaaid worden, elk met T.ZAAIGRAAN_PER_TEGEL graan (js/akkers.js).
  function akkerTegels() {
    let n = 0;
    for (const a of S().wereld.akkers || []) if (T.bestemmingVan(a) === 'akker') n += T.akkerTegels(a).length;
    return n;
  }

  // De bouwer (vraag 58, A): wat het doel vraagt, van gehucht tot dorp, twee jaar lang, zoals in het plan. Een
  // tweede versie die ook deed wat de raad zei (29 sep, zaad 1), bouwde elke tien dagen een jager zolang de raad
  // zei dat het eten de winter niet haalde (negen in louwmaand), kwam nooit aan de smidse toe (twee goud te kort,
  // en het graan had het dorp zelf nodig), en was zo traag dat twee jaar niet in een uur pasten.
  // Met `sluw` is het de sluwe bouwer (vraag 93, a, en 94): zie bedrieg() hieronder.
  function bouwer(sluw = false) {
    const wil = ['kapel', 'smidse']; // wat hij nog wil bouwen, in deze volgorde; een houthakker gaat voor
    const betaald = new Set(); // de jaren waarin hij de heer betaalde
    const deelVoorDeHeer = sluw ? 0.9 : 1; // wat hij de heer geeft van wat die vraagt
    let gelezenWinter = 0;
    let erfNietVoor = 0; // paste een erf nergens, dan zoekt hij pas een maand later opnieuw
    let jagerNietVoor = 0; // een jager hooguit één keer per maand
    let wensNietVoor = 0; // een bouwwerk voor de wensen hooguit één keer per maand (vraag 87, D)
    let belastingNietVoor = 0; // de raad over de belasting: één keer per dag gelezen, en na een mislukking een maand niet
    let houthakkerNietVoor = 0; // paste een houthakker nergens, dan zoekt hij pas een maand later opnieuw
    const jaar = () => Math.floor(dagNu() / JAAR);
    const kosten = (soort) => T.GEBOUWEN[soort].kosten;
    // Zegt het dorp dat het hout de winter niet haalt, dan wil hij eerst een houthakker (ook als het goud er nog
    // niet is: dan verkoopt hij graan, en bouwt hij hem zodra het kan).
    function luisterNaarDeWinterBouwer() {
      for (; gelezenWinter < boek.berichten.length; gelezenWinter++) {
        if (/The wood lasts \d+ of the \d+ days/.test(boek.berichten[gelezenWinter].tekst) && !wil.includes('houthakker')) wil.unshift('houthakker');
      }
    }
    // Het goud dat hij nodig heeft: voor de heer (als hij hem dit jaar nog niet betaalde), voor wat hij als eerste wil
    // bouwen, en voor zijn volgende wens (werklijst vraag 89, c: zonder die verkocht hij te weinig, en kwam de smidse er
    // bij twee van de drie zaden niet).
    function goudNodig() {
      const heer = betaald.has(jaar()) ? 0 : Math.ceil(deelVoorDeHeer * (T.eisVanDeHeer(D()).per.goud || 0));
      const wens = T.watDeHuizenMissen(D()).find((w) => w.kan);
      return heer + (wil.length ? kosten(wil[0]).goud || 0 : 0) + (wens ? kosten(wens.bouw).goud || 0 : 0);
    }
    // Het graan dat hij kan missen: wat er ligt, min wat het dorp tot 1 lentemaand eet, het zaaigraan, het graan
    // van de heer (als hij nog niet betaald is), en 20 over.
    function graanOver() {
      const s = S();
      const dag = s.kalender.dag;
      const eet = T.etenVoorDeWinter(s.dorp, dag).eet || 0;
      const heer = betaald.has(jaar()) ? 0 : Math.ceil(deelVoorDeHeer * (T.eisVanDeHeer(s.dorp).per.graan || 0));
      return (s.dorp.voorraad.graan || 0) - eet * ((jaar() + 1) * JAAR - dag) - akkerTegels() * T.ZAAIGRAAN_PER_TEGEL - heer - 20;
    }
    // De sluwe bouwer geeft de heer 90%, elk jaar zoals de slimme speler (werklijst vraag 94). `d` is de dag van het spel,
    // `j` het jaar (0 is het eerste).
    async function bedrieg() {
      const s = S();
      const d = Math.floor(dagNu());
      const j = jaar();
      const begin = j * JAAR; // 1 lentemaand van dit jaar
      // Sint-Maarten: de heer 90%.
      if (heerOpHetPlein() && nuEenKeer(`betaal${j}`)) {
        await betaal(deelVoorDeHeer);
        betaald.add(j);
      }
      // a. Het rantsoen krap als het eten de winter niet haalt, en op 1 grasmaand weer gewoon; Houtkap als het hout de
      // winter niet haalt. Eén keer per dag.
      if (nuEenKeer(`wetten${d}`)) {
        const haaltNiet = T.watDeWinterNietHaalt(s.dorp, d);
        if (haaltNiet.includes('eten') && T.standVanWet(s.dorp, 'rantsoen') === 'gewoon' && zetWet('rantsoen', 'krap')) daad('zet het rantsoen op krap, want het eten haalt de winter niet');
        if (d === begin + 30 && T.standVanWet(s.dorp, 'rantsoen') === 'krap' && zetWet('rantsoen', 'gewoon')) daad('zet het rantsoen weer op gewoon, want het is 1 grasmaand');
        if (haaltNiet.includes('hout') && T.standVanWet(s.dorp, 'houtkap') !== 'aangenomen' && neemWetAan('houtkap')) daad('neemt Houtkap in het bos van de heer aan, want het hout haalt de winter niet');
      }
    }
    // Liggen er in de lente akkers kaal, omdat er op 1 lentemaand geen zaaigraan was, dan koopt hij zaaigraan van de
    // marskramer, zoveel als zijn goud toelaat: zonder zaaien geen oogst, en dat gaat voor wat hij wil bouwen.
    async function koopZaaigraan() {
      const g = T.HANDEL_INSTELLINGEN.verkoopt.graan;
      const m = D().marskramer;
      const kaal = kaleTegels();
      if (!g || !kaal || !((m.heeft && m.heeft.graan) || 0)) return;
      const prijs = g.prijs[m.bezoek];
      const pakken = Math.min(m.heeft.graan, Math.ceil((kaal * T.ZAAIGRAAN_PER_TEGEL) / g.per), Math.floor((D().voorraad.goud || 0) / prijs));
      if (pakken <= 0) {
        daad(`zou zaaigraan kopen voor ${kaal} kale akkertegels, maar heeft het goud niet`);
        return;
      }
      await koopGraan(pakken, prijs);
    }
    // De wensen (werklijst vraag 86, b, en 87, D): het eerste wat de raad over de huizen zegt waar je iets aan kunt doen
    // (T.watDeHuizenMissen, js/wensen.js) en dat hij kan betalen; hooguit één per maand, zodat er hout overblijft voor
    // de hutten. Een put of een kapel komt waar hij de meeste huizen zonder bereikt. Tot vraag 91, a wachtte hij op de
    // eerste, ook als hij die niet kon betalen: dan kwam er een maand lang ook geen put voor 6 hout die erachter stond.
    // Een keten bouwt hij in één keer (vraag 96, b): zegt de raad "bouw een bakkerij en een molen", dan allebei, als hij ze
    // samen kan betalen (`ook`, T.watDeHuizenMissen); anders wacht hij ermee, want een bakkerij zonder molen bakt niets. In de
    // speeltest van vraag 95 kwam de bakkerij steeds vóór de molen, een keer een half jaar eerder.
    const ketenKosten = (w) => [w.bouw, ...(w.ook || [])].reduce((som, soort) => {
      for (const [wat, n] of Object.entries(kosten(soort))) som[wat] = (som[wat] || 0) + n;
      return som;
    }, {});
    function volgDeWensen() {
      const s = S();
      if (dagNu() < wensNietVoor) return;
      const x = T.watDeHuizenMissen(s.dorp).find((w) => w.kan && T.kanBetalen(s.dorp, ketenKosten(w)));
      if (!x) return;
      wensNietVoor = dagNu() + 30;
      for (const soort of [x.bouw, ...(x.ook || [])]) {
        bouw(soort);
      }
    }
    // Laken (werklijst vraag 99, c): in een dorp verkoopt de marskramer het. Wat de ambachtslieden tot zijn volgende
    // bezoek gebruiken (zo'n 120 dagen), min wat er ligt, koopt hij, met het goud dat over is na zijn volgende wens.
    async function koopLaken() {
      const w = T.HANDEL_INSTELLINGEN.verkoopt.laken;
      const m = D().marskramer;
      if (!w || !((m.heeft && m.heeft.laken) || 0)) return;
      const st = D().behoeften && D().behoeften.standen;
      const ambacht = st && st.ambachtslieden ? st.ambachtslieden.mensen : 0;
      const nodig = Math.ceil(ambacht * T.WENSEN_INSTELLINGEN.perMens.laken * 120 - (D().voorraad.laken || 0));
      if (nodig <= 0) return;
      const prijs = w.prijs[m.bezoek];
      const pakken = Math.min(m.heeft.laken, Math.ceil(nodig / w.per), Math.floor((Math.floor(D().voorraad.goud || 0) - goudNodig()) / prijs));
      if (pakken <= 0) {
        daad(`zou ${nodig} laken kopen van de marskramer, maar heeft het goud niet`);
        return;
      }
      const gekocht = await handelMet(() => klikHandel('koop', 'laken', pakken));
      daad(`koopt ${gekocht * w.per} laken van de marskramer, voor ${gekocht * prijs} goud`);
    }
    // Zout (werklijst vraag 132, B): zegt het dorp dat vis en vlees de winter alleen gezouten halen
    // (T.visEnVleesVoorDeWinter, js/behoeften.js), dan koopt hij het zout dat erbij moet, met het goud dat hij niet nodig
    // heeft voor de heer en zijn volgende wens.
    async function koopZout() {
      const w = T.HANDEL_INSTELLINGEN.verkoopt.zout;
      const m = D().marskramer;
      const v = T.visEnVleesVoorDeWinter(D(), dagNu());
      if (!w || !v || !(v.zout > 0) || !((m.heeft && m.heeft.zout) || 0)) return;
      const prijs = w.prijs[m.bezoek];
      const stuks = Math.min(m.heeft.zout, v.zout, Math.floor((Math.floor(D().voorraad.goud || 0) - goudNodig()) / prijs));
      if (stuks <= 0) {
        daad(`zou ${v.zout} zout kopen van de marskramer, maar heeft het goud niet`);
        return;
      }
      const gekocht = await handelMet(() => klikHandel('koop', 'zout', stuks));
      daad(`koopt ${gekocht} zout van de marskramer, voor ${gekocht * prijs} goud, voor vis en vlees in de winter`);
    }
    async function verkoop() {
      const s = S();
      const nodig = goudNodig() - Math.floor(s.dorp.voorraad.goud || 0);
      if (nodig <= 0) return;
      const prijs = T.HANDEL_INSTELLINGEN.koopt.graan.prijs[s.dorp.marskramer.bezoek];
      const pakken = Math.min(Math.ceil(nodig / prijs), Math.floor(graanOver() / T.HANDEL_INSTELLINGEN.koopt.graan.per));
      if (pakken <= 0) {
        daad(`zou graan verkopen voor ${nodig} goud, maar het graan is nodig`);
        return;
      }
      await verkoopGraan(pakken, prijs);
    }
    return {
      jaren: 2,
      async begin() {
        // Vreemden welkom, met het menu (W) en de knop op de kaart van de wet, zoals een speler.
        const s = S();
        daad(neemWetAan('vreemden') ? 'neemt Vreemden welkom aan' : 'kan Vreemden welkom niet aannemen');
        // Een raadsman, met de knop in de balk (R) zoals een speler: de eerste van de drie. Hij beslist alleen als de
        // schout weg is (vraag 68, B), en de bouwer blijft in het dorp: de voorvallen beantwoordt hij zelf.
        klik('#raadsman-knop');
        if (!klik('#raadsman button[data-wie]')) daad('kan geen raadsman kiezen');
        if (!klik('#raadsman [data-actie="sluit"]') && T.ui.vensterOpen() === 'raadsman') T.ui.sluitRaadsman(s);
        const r = T.raadsmanVan(s.dorp);
        if (r) daad(`kiest als raadsman: ${T.overRaadsmanTekst(s.dorp, r)}`);
      },
      async elkeStap() {
        const s = S();
        luisterNaarDeWinterBouwer();
        // Zegt de raad dat de belasting goud brengt (als er goud mist voor een wens of voor het doel), dan neemt hij hem
        // aan, zoals een speler die de raad volgt (werklijst vraag 91, a). Eén keer per dag kijken is genoeg.
        if (dagNu() >= belastingNietVoor && T.standVanWet(s.dorp, 'belasting') !== 'aangenomen') {
          belastingNietVoor = Math.floor(dagNu()) + 1;
          const r = T.raadNu(s.dorp);
          if (r && /belasting \[W\]/.test(r.tekst)) {
            if (neemWetAan('belasting')) daad(`neemt de belasting aan, want de raad zegt: "${r.tekst}"`);
            else {
              daad('kan de belasting niet aannemen');
              belastingNietVoor = Math.floor(dagNu()) + 30;
            }
          }
        }
        // Haalt het eten de winter niet, dan een jager, hooguit één per maand (werklijst vraag 81, b): zoals een speler die
        // de raad volgt ("een jager [B] schiet 1 vlees per dag"), en niet negen in louwmaand, zoals de bouwer van 29 sep.
        if (dagNu() >= jagerNietVoor && T.watDeWinterNietHaalt(s.dorp, Math.floor(dagNu())).includes('eten') && T.kanBetalen(s.dorp, kosten('jager'))) {
          jagerNietVoor = dagNu() + 30;
          bouw('jager');
        }
        // Een houthakker vóór een nieuw erf, als er nog geen staat (vraag 86, b): elke hut kost 8 hout, en een bouwplaats
        // neemt het hout zodra het er is; zo kwam de houthakker er bij zaad 2 nooit (de speeltest van 1 okt).
        const houthakker = s.dorp.gebouwen.some((g) => g.soort === 'houthakker');
        if (!houthakker && !wil.includes('houthakker') && dagNu() >= houthakkerNietVoor) wil.unshift('houthakker');
        // Steeds één erf vrij, binnen de kringen (vraag 95, b). Vragen de mensen het je (vraag 103), dan zonder op een
        // houthakker te wachten: een hut die op hout wacht, is wat de houthakker laat vragen (T.watTeBouwen, js/raad.js).
        const erfMag = houthakker || T.VERZOEKEN_INSTELLINGEN.mensen;
        // Een vrij erf waar geen hut meer op past, telt niet (T.bruikbareErven; vraag 110, f).
        if (erfMag && !T.bruikbareErven(s.dorp).length && dagNu() >= erfNietVoor && !bouwErf()) erfNietVoor = dagNu() + 30;
        // Bouwen wat hij wil, zodra het goud en het hout er zijn; een kapel waar hij de meeste huizen bereikt. Wat het doel
        // vraagt en er al staat (een kapel voor de wensen), hoeft niet meer.
        while (wil.length && wil[0] !== 'houthakker' && !T.doelGebouwen(s.dorp).includes(wil[0])) wil.shift();
        while (wil.length && T.kanBetalen(s.dorp, kosten(wil[0]))) {
          const soort = wil.shift();
          const gelukt = bouw(soort);
          if (!gelukt && soort === 'houthakker') houthakkerNietVoor = dagNu() + 30;
        }
        volgDeWensen();
        const m = s.dorp.marskramer;
        if (m && !m.weg && m.staat && nuEenKeer(`handel${jaar()}-${m.bezoek}`)) {
          await koopZaaigraan();
          await koopLaken();
          await koopZout();
          await verkoop();
        }
        if (sluw) await bedrieg();
        else if (heerOpHetPlein() && nuEenKeer(`betaal${jaar()}`)) {
          await betaal(1);
          betaald.add(jaar());
        }
      },
    };
  }

  const SPELERS = {
    bouwer: bouwer(),
    sluw: bouwer(true),
    braaf: {
      async elkeStap() {
        luisterNaarDeWinter();
        if (heerOpHetPlein() && nuEenKeer('betaal')) await betaal(1);
      },
    },
    slim: {
      async begin() {
        bouw('kapel');
      },
      async elkeStap() {
        const s = S();
        luisterNaarDeWinter();
        const m = s.dorp.marskramer;
        if (m && !m.weg && m.staat && m.bezoek === 2 && nuEenKeer('handel')) await verkoopVoorDeHeer();
        if (heerOpHetPlein() && nuEenKeer('betaal')) await betaal(0.9);
      },
    },
  };

  // ── Opschrijven wat er gebeurt ──────────────────────────────────────────────────────────────────
  function eisKort(eis) {
    return Object.fromEntries(eis.volgorde.map((w) => [w, eis.per[w]]));
  }

  // Het hart van het dorp, waar een verzoek zijn plek zoekt: de deur van het huis van de schout (zoals hartVan in
  // js/verzoeken.js).
  function hartVanHetDorp() {
    const s = S();
    const huis = s.dorp.gebouwen.find((g) => g.huis === 'schout');
    return huis ? T.deurVan(s.wereld, huis) : { x: Math.floor(s.wereld.tegels[0].length / 2), y: Math.floor(s.wereld.tegels.length / 2) };
  }

  // Wat er in het looppad om de plek van de hut op een erf staat (zoals T.looppadOm het nakijkt), geteld per soort: een
  // gebouw, een voorwerp, de plek van het huis op een ander erf, of iets anders wat niet te belopen is. Leeg als hij past.
  function watStaatOmDeHut(D, e) {
    const p = e.plan;
    if (!p) return { 'geen plan': 1 };
    const w = D.wereld;
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    const r = { x: e.x + p.dx, y: e.y + p.dy, b: p.b, h: p.h };
    const uit = {};
    for (let y = r.y - n; y < r.y + r.h + n; y++) {
      for (let x = r.x - n; x < r.x + r.b + n; x++) {
        if ((x >= r.x && x < r.x + r.b && y >= r.y && y < r.y + r.h) || x < 0 || y < 0 || x >= w.tegels[0].length || y >= w.tegels.length) continue;
        let wat = null;
        if (T.huisPlekOp(D, x, y, e)) wat = 'de plek van een huis op een ander erf';
        else if (!T.isBegaanbaar(w, x, y, { deurenOpenen: true })) {
          const g = T.gebouwOp(D, x, y);
          const v = T.voorwerpOp(w, x, y);
          wat = g ? g.soort : v ? v.soort : 'iets vasts';
        }
        if (wat) uit[wat] = (uit[wat] || 0) + 1;
      }
    }
    return uit;
  }

  // De gebouwen in het looppad om de plek van de hut op een erf: waar ze staan, hun voet, of ze zelf op een erf staan, en
  // hoeveel van hun tegels op dit erf liggen.
  function gebouwenOmDeHut(D, e) {
    const p = e.plan;
    if (!p) return [];
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    const r = { x: e.x + p.dx - n, y: e.y + p.dy - n, b: p.b + 2 * n, h: p.h + 2 * n };
    const binnen = (x, y, q) => x >= q.x && x < q.x + q.b && y >= q.y && y < q.y + q.h;
    const uit = [];
    for (const g of D.gebouwen || []) {
      // De voet zoals T.gebouwOp (js/gebouwen.js) hem leest: wat het voorwerp beslaat, anders de voet van het gebouw.
      const w = g.voorwerp;
      const v = w && w.beslaat ? { x: w.x, y: w.y, b: w.beslaat[0], h: w.beslaat[1] } : g.voet ? { x: g.x, y: g.y, b: g.voet.b, h: g.voet.h } : null;
      if (!v) continue;
      let inRing = 0;
      let opErf = 0;
      for (let dy = 0; dy < v.h; dy++) {
        for (let dx = 0; dx < v.b; dx++) {
          if (binnen(v.x + dx, v.y + dy, r)) inRing++;
          if (binnen(v.x + dx, v.y + dy, e)) opErf++;
        }
      }
      if (inRing) uit.push({ soort: g.soort, tekening: g.tekening, ...v, inRing, opDitErf: opErf, eigenErf: g.erf ? { x: g.erf.x, y: g.erf.y } : null });
    }
    return uit;
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
      // De wensen per huis (js/wensen.js; werklijst vraag 85): per stand hoe tevreden, met hoeveel mensen en hoeveel
      // huizen alles hebben, en hoeveel woningen er van elke soort staan (wat er doorgroeide).
      standen: s.dorp.behoeften.standen ? Object.fromEntries(Object.entries(s.dorp.behoeften.standen).map(([k, x]) => [k, { mensen: x.mensen, huizen: x.huizen, alles: x.alles, tevreden: heel(x.tevredenheid * 100) / 100 }])) : null,
      woningen: Object.fromEntries(['hut', 'huis', 'stenenHuis'].map((soort) => [soort, s.dorp.gebouwen.filter((g) => g.soort === soort && g.huis !== 'schout').length])),
      // Wat de huizen missen, zoals de raad en het rapport het zeggen (T.watDeHuizenMissen, js/wensen.js; vraag 87).
      missen: T.watDeHuizenMissen(s.dorp).slice(0, 5).map((x) => x.tekst),
      // Wat het dorp zou willen bouwen (T.watTeBouwen, js/raad.js), en of het te betalen is en er plek voor is bij het hart
      // van het dorp (T.plekVoor, js/verzoeken.js): zo zie je waarom er geen verzoek komt (werklijst vraag 107, stap 3).
      wilBouwen: T.watTeBouwen(s.dorp).slice(0, 4).map((x) => ({ soort: x.soort, betalen: T.kanBetalen(s.dorp, T.GEBOUWEN[x.soort].kosten || {}), plek: !!T.plekVoor(s.dorp, x.soort, hartVanHetDorp()) })),
      houthakkers: houthakkers.map((g) => ({ klaar: !!g.klaar, handen: g.handen || 0 })),
      // De twee bazen (js/bazen.js; vraag 106): de gunst van de heer en het vertrouwen van het dorp.
      bazen: T.bazenNu(s.dorp),
      // De markt (js/markt.js; vraag 127): hoeveel kramen, waarvan leeg en langs de straat, en hoe groot het blok is.
      markt: marktNu(s),
      // De huizen die alles hebben maar niet doorgroeien, en waarom (T.waaromGroeitHetNiet, js/behoeften.js; vraag 130):
      // de winst vraagt stenen huizen.
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
    // Welke raad er onder het doel stond (js/raad.js, vraag 58, B): hoeveel dagen, en wanneer voor het eerst.
    const r = T.raadNu(D());
    if (r) {
      const b = boek.raad[r.id] || (boek.raad[r.id] = { dagen: 0, eerst: datum(d) });
      b.dagen++;
    }
    if (d === DAG_HEER + 4) boek.naSintMaarten = tel(); // hoe rijk het dorp is als de heer weg is
    // Per jaar (vraag 94, d): op hoeveel dagen er geen bier of brood was (als er een herberg of een bakkerij staat), en
    // sinds vraag 99, d geen laken (als er ambachtslieden zijn), hoeveel
    // huizen alles hadden (gemiddeld over de dagen) en op hoeveel dagen allemaal. En de langste reeks dagen dat alle huizen
    // alles hadden. En de druk om eten (vraag 95, Marcel: "er moet altijd druk zijn om voldoende eten"):
    // op hoeveel dagen er te weinig eten was (wat de balk als honger zegt, D.behoeften.mist), het dorp zei dat het eten de
    // winter niet haalt (T.watDeWinterNietHaalt), en er geen graan meer lag boven het zaaigraan.
    const st = D().behoeften && D().behoeften.standen;
    if (!st) return;
    const g = boek.geluk[Math.floor(d / JAAR)] || (boek.geluk[Math.floor(d / JAAR)] = { dagen: 0, alles: 0, allemaal: 0, zonderBier: 0, zonderBrood: 0, zonderLaken: 0, honger: 0, etenWinter: 0, graanOp: 0 });
    const huizen = Object.values(st).reduce((n, x) => n + x.huizen, 0);
    const alles = Object.values(st).reduce((n, x) => n + x.alles, 0);
    const staat = (soort) => D().gebouwen.some((x) => x.soort === soort && x.klaar);
    const allemaal = huizen > 0 && alles === huizen;
    g.dagen++;
    g.alles += huizen ? alles / huizen : 0;
    if (allemaal) g.allemaal++;
    if (staat('herberg') && (D().voorraad.bier || 0) < 1) g.zonderBier++;
    if (staat('bakkerij') && (D().voorraad.brood || 0) < 1) g.zonderBrood++;
    if (st.ambachtslieden && st.ambachtslieden.mensen > 0 && (D().voorraad.laken || 0) < 1) g.zonderLaken++;
    if ((D().behoeften.mist || []).includes('food')) g.honger++;
    if (T.watDeWinterNietHaalt(D(), d).includes('eten')) g.etenWinter++;
    if ((D().voorraad.graan || 0) - T.zaaigraanApart(D(), d) < 1) g.graanOp++;
    boek.reeks.nu = allemaal ? boek.reeks.nu + 1 : 0;
    boek.reeks.langste = Math.max(boek.reeks.langste, boek.reeks.nu);
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
      ['tikHeerDag', 'soldaten'], ['werkRoversBij', 'rovers'], ['tikRoversDag', 'rovers'], ['voorvalGevolg', 'voorvallen'],
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
        : (D_.gebouwen || []).some((g) => g.wachtOpRooien && inStuk(g.kavel, x, y)) ? 'rooien'
          : veld && veld.ontginning ? 'ontginnen' : 'anders';
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
      for (const v of w_.voorwerpen) {
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
      boek.heerJaren.push(boek.heer); // wie twee jaar speelt, betaalt twee keer
    };
    betaal.voor = () => eisKort(T.eisVanDeHeer(s.dorp));
    na('betaalHeer', betaal);
    // Van gehucht tot dorp, en tot marktrecht (js/treden.js): op welke dag, en met hoeveel mensen.
    na('wordtTrede', (r, voor, S_, trede) => {
      if (!boek[trede]) boek[trede] = { trede, dag: heel(s.kalender.dag), datum: datum(), mensen: s.dorp.bevolking };
    });
    // Op elke groeidag: waarom er geen gezin kwam, zoals de groei het zelf vraagt (T.waaromGeenGezin, stap 4 van
    // T.tikGebouwenDag, js/gebouwen.js). Alleen wat die dag in de groei gevraagd wordt, telt: de raad linksboven
    // vraagt het ook.
    let groeidag = null;
    const tik = T.tikGebouwenDag;
    T.tikGebouwenDag = function (S_, dag) {
      groeidag = dag;
      try {
        return tik.apply(this, arguments);
      } finally {
        groeidag = null;
      }
    };
    na('waaromGeenGezin', (r) => {
      if (groeidag == null) return;
      boek.groei.push({ dag: groeidag, datum: datum(groeidag), waarom: r.slice(), mensen: s.dorp.bevolking, woonruimte: T.telWoonruimte(s.dorp), vrijeErven: T.vrijeErven(s.dorp).length });
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
      tekst: s.dorp.einde ? `${{ leeg: 'het dorp leeg', verjaagd: 'weggejaagd door het dorp' }[s.dorp.einde.reden] || 'het ambt kwijt'} op ${datum()}` : s.modus === 'dood' ? `gevallen op ${datum()}` : `het jaar uit, tot ${datum()}`,
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
      gevallen: s.modus === 'dood',
      // De rovers (js/rovers.js): hoe vaak ze kwamen, hoe vaak ze verslagen werden, en wat ze meenamen.
      rovers: {
        kwamen: boek.berichten.filter((b) => /^Robbers are coming\./.test(b.tekst)).length,
        verslagen: boek.berichten.filter((b) => b.tekst === 'De rovers zijn verslagen.').length,
        roofden: boek.berichten.filter((b) => /gaan ervandoor/.test(b.tekst)).map((b) => `${b.datum}: ${b.tekst}`),
        gesneuveld: boek.bevolking.filter((b) => b.reden === 'gesneuveld').length,
      },
      akkertegels: tegels, ongezaaid,
      jaren: s.dorp.heer.jaren,
      // De ondernemers (js/ondernemers.js; vraag 104): wat ze vroegen en wat de speler zei, en wat ervan kwam.
      ondernemers: {
        vroegen: boek.voorvallen.filter((v) => v.id === 'wapenverzoek' || v.id === 'herbergverzoek')
          .map((v) => `${v.datum}: ${v.wie}, ${v.id === 'wapenverzoek' ? 'wapens' : 'een tweede herberg'}: ${v.antwoord}`),
        berichten: boek.berichten.filter((b) => /Een tweede herberg, schout|vat bier|keer nee van de schout/.test(b.tekst))
          .map((b) => `${b.datum}: ${b.tekst}`),
        wapens: T.wapensInHetDorp(s.dorp),
        herbergen: T.herbergenVan(s.dorp).length,
      },
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
    // `jaren` (npm run speeltest -- --jaren 4): zoveel jaren voor wie er meer dan één speelt (de bouwers), in plaats
    // van twee; voor de speeltest naar de winst (werklijst vraag 102, e).
    async speel({ speler, zaad, opslaan = null, verder = null, jaren = null }) {
      if (!verder) {
        zaai(Math.imul(zaad, 2654435761) ^ 0x5eed);
        // En de klok van het scherm op nul: of een koe ligt of graast, hangt ervan af (T.rustVanDier,
        // js/vee.js), en een liggende koe staat een ander anders in de weg dan een grazende.
        T.S.tijd = 0;
      }
      boek = {
        speler, zaad, berichten: [], bevolking: [], daden: [], maanden: [], gebouwd: [],
        heer: null, brief: null, naSintMaarten: null, luisterFouten: [],
        heerJaren: [], dorp: null, marktrecht: null, groei: [], raad: {}, voorvallen: [],
        jaren: jaren && (SPELERS[speler].jaren || 1) > 1 ? jaren : (SPELERS[speler].jaren || 1), graan: [], geluk: [],
        reeks: { nu: 0, langste: 0 }, bos: [],
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
      // Op welk gehucht: het ontworpen, of een van de maker (uit het zaad van het spel; js/maker.js).
      boek.gehucht = s.gebieden.gehucht && s.gebieden.gehucht.eiland ? 'op het eiland' : s.gebieden.gehucht && s.gebieden.gehucht.maker ? 'van de maker' : 'ontworpen';
      boek.boeren = Object.fromEntries(Object.entries(s.dorp.lot.boeren).map(([id, b]) => [id, b.karakter]));
      boek.begin = tel(); // de eerste van de maand zelf schrijft de boekhouding op, bij de eerste stap
      const P = SPELERS[speler];
      const eindDag = EIND + JAAR * (boek.jaren - 1);
      if (P.begin && !verder) await P.begin();
      for (let i = 0; i < 800000 && dagNu() < eindDag && !s.dorp.einde && s.modus !== 'dood'; i++) {
        if (opslaan && !opslaan.gedaan && dagNu() >= opslaan.dag && !T.waaromNietOpslaan(s) && !s.slaap) {
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
      // De vrije erven aan het eind, en wat er in het looppad om de plek van hun hut staat (T.looppadOm, js/gebouwen.js):
      // een erf dat vrij heet maar waar geen hut meer op past, houdt de groei tegen (werklijst vraag 107, stap 3).
      boek.vrijeErven = T.vrijeErven(s.dorp).map((e) => ({ x: e.x, y: e.y, b: e.b, h: e.h, plan: e.plan && { dx: e.plan.dx, dy: e.plan.dy, b: e.plan.b, h: e.plan.h }, inDeWeg: watStaatOmDeHut(s.dorp, e), gebouwen: gebouwenOmDeHut(s.dorp, e) }));
      // De raadsman (js/raadsman.js): wie het was, en hoeveel voorvallen hij besliste.
      const rm = T.raadsmanVan(s.dorp);
      boek.raadsman = rm ? { over: T.overRaadsmanTekst(s.dorp, rm), door: (s.dorp.voorvallen && s.dorp.voorvallen.doorRaadsman) || 0, laatste: ((s.dorp.raadsman && s.dorp.raadsman.besluiten) || []).slice(-5) } : null;
      // Voor de proef met opslaan: het hele spel aan het eind, om twee jaren letter voor letter te vergelijken.
      if (opslaan || verder) boek.eindStaat = T.bewaarSpel(s, { plek: 'eind', nu: 0 });
      return JSON.parse(JSON.stringify(boek));
    },
  };
})(globalThis.Spel);
