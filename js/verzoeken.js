// De verzoeken: het dorp bouwt zelf, en vraagt het je (werklijst vraag 103; Marcel, 3 okt: "De inwoners bouwen zelf een
// weverij etc. Ze vragen alleen toestemming om te bouwen. Jij beslist niet wie welk ambacht start natuurlijk ... Zo groeit
// de stad zelf, door de mensen. Jij bepaalt alleen de richting?", en "103 a b c ja d ook verzoek e ja").
//
// Met de spelregel "Wie bouwt" op "De mensen" (de standaard) staat in het bouwmenu alleen nog het erf (T.inBouwmenu,
// js/gebouwen.js). Wat het dorp mist, vraagt een inwoner je: wat de raad je anders liet bouwen (T.watTeBouwen, js/raad.js:
// het hout en het eten voor de winter, een wachthuis na de rovers, de bouwstof en de wensen van de huizen, en wat het doel
// vraagt).
//   wie      een put of een kapel vraagt iemand uit een huis dat hem dan bereikt, namens de buurt; de rest iemand zonder
//            werk, of anders iemand die geen boer is. Hij wordt er de meester (g.meester), en werkt er als eerste
//            (js/bewoners.js).
//   waar     de plek die hij koos (T.plekVoor): een plek met een kring (een put, een kapel) waar hij de meeste huizen
//            bereikt die er nog geen hebben; een werkplaats zo dicht mogelijk bij zijn huis; wat van het hele dorp is (de
//            markt, het wachthuis) zo dicht mogelijk bij het huis van de schout.
//   wanneer  om de `elke` dagen, als er niets anders loopt (het gaat vóór een geloot voorval, js/voorvallen.js), en alleen
//            als het dorp het kan betalen. Wie nee hoorde, vraagt hetzelfde pas na `naNee` dagen weer, en na een ja komt
//            hetzelfde pas na `naJa` dagen weer.
// Hij komt je zoeken zoals bij een voorval (het voorval 'bouwverzoek', js/voorvallen.js, met de woorden in
// js/gesprekken.js), en zegt wat het het dorp kost. Ja: het gebouw komt er (T.plaatsGebouw, dat de kosten betaalt). Nee:
// het dorp onthoudt het. Ben je weg, dan beslist je raadsman (js/raadsman.js): wat het helpt tegen wat het kost, naar
// zijn karakter.
//
// Jij bepaalt de richting met een oproep op het plein (T.doeOproep; vraag 103, c): "Het dorp zoekt een weverij", met een
// premie uit de kist voor wie het bouwt. Wat erop staat, vraagt iemand je als eerste, ook wat niemand nog mist (een
// schaapskooi voor de wol van later). Daarna wat een ondernemer uit zichzelf wil (js/ondernemers.js; vraag 104), met zijn
// eigen woorden (een eigen voorval, zoals 'wapenverzoek'), en dan wat het dorp mist.
//
// D.verzoeken: { volgende (de dag waarop er weer een kan komen), nee: { soort: dag }, laatst: { soort: dag van het laatste
//              ja }, ja, geweigerd (hoe vaak), oproepen: [{ soort, dag }], eigen (js/ondernemers.js) }
// Op het voorval (D.voorvallen.lopend.bouw): { soort, x, y, waarom, voor (waarvoor: T.watTeBouwen, of 'eigen'), nut,
// premie (bij een oproep), eigen (wat een ondernemer wil: 'wapens') }
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.VERZOEKEN_INSTELLINGEN = {
    // De spelregel "Wie bouwt": true, de mensen vragen het je; false, jij bouwt met het bouwmenu (zoals vóór 3 okt).
    mensen: true,
    // Om de zoveel dagen kan er een verzoek komen.
    elke: 4,
    // Wie nee hoorde, vraagt hetzelfde pas na zoveel dagen weer.
    naNee: 30,
    // En wie ja hoorde ook: zo komt er niet elke vier dagen een jager bij zolang het eten de winter niet haalt (de tweede
    // speeltest van vraag 103: 25 jagers in vier maanden). De bouwer van de speeltest nam er hooguit één per maand. Een
    // oproep van jou wacht er niet op.
    naJa: 30,
    // Een oproep op het plein (stap 2): wie bouwt wat erop staat, krijgt deze premie in goud uit de kist, bovenop wat het
    // gebouw kost.
    premie: 5,
    // Wat een verzoek de raadsman waard is, als tevredenheid (js/raadsman.js): per zoveel mensen die het missen één punt,
    // tot `nutTot`; het hout of het eten voor de winter en een wachthuis na de rovers wegen `nutTot`, het doel de helft.
    nutPerMensen: 4,
    nutTot: 8,
  };
  const IN = () => T.VERZOEKEN_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const naamVan = (soort) => T.GEBOUWEN[soort].naam;
  const deVan = (soort) => (/huis$|hok$|hof$|^erf$|^gevang$/.test(naamVan(soort)) ? 'het' : 'de');
  // "de wapenmaker", "het schuttershof": ook voor js/ondernemers.js.
  T.metLidwoord = (soort) => `${deVan(soort)} ${naamVan(soort)}`;
  const heeftKring = (soort) => T.WENSEN_INSTELLINGEN.kring[soort] != null;
  const wieNaam = (p) => T.naamVanBewoner(p);

  T.nieuweVerzoeken = () => ({ volgende: 0, nee: {}, laatst: {}, ja: 0, geweigerd: 0, oproepen: [], eigen: {} });
  const verzoekenVan = (D) => {
    const R = D.verzoeken || (D.verzoeken = T.nieuweVerzoeken());
    if (!R.oproepen) R.oproepen = []; // een spel van vóór de oproepen
    if (!R.laatst) R.laatst = {};
    if (!R.eigen) R.eigen = {}; // en van vóór de ondernemers
    return R;
  };

  // ---------------------------------------------------------------------------------------------
  // Waar het komt
  // ---------------------------------------------------------------------------------------------

  // Het hart van het dorp: de deur van het huis van de schout, en anders het midden van de kaart.
  function hartVan(D) {
    const huis = (D.gebouwen || []).find((g) => g.huis === 'schout');
    if (huis) return T.deurVan(D.wereld, huis);
    return { x: Math.floor(D.wereld.tegels[0].length / 2), y: Math.floor(D.wereld.tegels.length / 2) };
  }

  // Waar een gebouw van deze soort komt, zoals wie het wil bouwen het kiest: { x, y }, of null. Een plek met een kring (een
  // put, een kapel; js/wensen.js): waar hij de meeste huizen bereikt die er nog geen hebben (T.kringTeller, een hut op een
  // erf ook met het huis dat hij wordt: anders is hij zijn put kwijt als hij groeit; werklijst vraag 117, 2d), bij
  // gelijk spel het dichtst bij `bij` (met `zonder`: hoeveel); bereikt hij nergens zo'n huis, dan nergens. De rest: zo
  // dicht mogelijk bij `bij`
  // (een deur), in ringen, op de eerste plek waar het past (T.gebouwPast). Zo zocht de bouwer van de speeltest al
  // (gereedschap/speeltest/speler.js), en die vraagt het nu hier. Met een looppad rondom, zoals elk gebouw
  // (T.GEBOUWEN_INSTELLINGEN.looppad, js/gebouwen.js; Marcel, 3 okt: "Nee ik wil 3 tegels").
  // Tijdens het zoeken staat iedereen stil (T.iedereenStil, js/wereld.js): wie er op een tegel staat, vraagt het dan in
  // één stap, voor elke tegel van de kaart.
  // Een huis of boerderij van een bouwstijl keert daar zijn deur naar de weg (T.keerNaarDeWeg, js/bouwstijl.js).
  T.plekVoor = function (D, soort, bij) {
    T.iedereenStil(true);
    try {
      const plek = zoekPlek(D, soort, bij) || zoekPlekOmTeRooien(D, soort, bij);
      if (plek) T.keerNaarDeWeg(D, soort, plek.x, plek.y);
      return plek;
    } finally {
      T.iedereenStil(false);
    }
  };
  function zoekPlek(D, soort, bij) {
    const w = D.wereld;
    // De markt op het plein (js/markt.js): het midden van het plein, met de kramen.
    if (soort === 'markt' && T.marktOpHetPlein(D)) return T.marktPlek(D);
    if (heeftKring(soort)) {
      const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || T.GEBOUWEN[soort].voet;
      const kring = T.kringTeller(D, soort, true);
      let beste = null;
      for (let y = 0; y < w.tegels.length; y++) {
        for (let x = 0; x < w.tegels[0].length; x++) {
          // Eerst wat de plek bereikt (tellen), en alleen als hij beter is dan de beste tot nu toe, of hij past (duur).
          const zonder = kring({ x, y, b: voet.b, h: voet.h }).zonder;
          const d = Math.hypot(x - bij.x, y - bij.y);
          if (!(zonder > 0) || (beste && (zonder < beste.zonder || (zonder === beste.zonder && d >= beste.d)))) continue;
          if (T.gebouwPast(D, soort, x, y)) beste = { x, y, d, zonder };
        }
      }
      return beste && { x: beste.x, y: beste.y, zonder: beste.zonder };
    }
    // Wat bij de natuur hoort (een jager bij het bos, een visser aan het water; `bij` in js/gebouwen.js), zoekt over de
    // hele kaart: het bos kan verder liggen dan 44 tegels van wie het vraagt. Op een land van de maker van 100 bij 100
    // vroeg zo nooit iemand om een jager, en at het dorp zijn zaaigraan op (de speeltest van 4 okt; vraag 112). Eerst de
    // vraag of de natuur er ligt: die kost één stap (T.natuurBij), gebouwPast veel meer.
    const g = T.GEBOUWEN[soort];
    const natuur = g.bij ? T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || g.voet : null;
    const tot = natuur ? Math.max(45, w.tegels.length, w.tegels[0].length) : 45;
    const probeer = (x, y) => (!natuur || !T.waaromNietBijDeNatuur(D, soort, { x, y, b: natuur.b, h: natuur.h })) && T.gebouwPast(D, soort, x, y);
    // ring na ring om `bij`, en in elke ring van boven naar onder en van links naar rechts
    for (let r = 3; r < tot; r++) {
      for (let dy = -r; dy <= r; dy++) {
        const rand = Math.abs(dy) === r;
        for (let dx = -r; dx <= r; dx += rand ? 1 : 2 * r) {
          if (probeer(bij.x + dx, bij.y + dy)) return { x: bij.x + dx, y: bij.y + dy };
        }
      }
    }
    return null;
  }

  // Geen open grond meer (werklijst vraag 110, e; Marcel, 6 okt: "A ja B ja"): dan een plek waar wie het vraagt eerst
  // rooit (een boom, een stronk, een struik, onder de voet en in het looppad), met zo weinig mogelijk bomen, en dan het
  // dichtst bij `bij`. Wat bij de natuur hoort, zoekt over de hele kaart, de rest binnen 45 tegels, zoals hierboven.
  // Een plek met een kring (een put, een kapel) moet net als hierboven de huizen bereiken die er nog geen hebben, de
  // meeste eerst, en zoekt dus ook over de hele kaart: in de speeltest van 6 okt kwam er anders elke maand een put bij het
  // hart van het dorp, terwijl de hut die erom vroeg er niets aan had (op 72022 48 putten in vier jaar).
  // Eerst wat er op elke plek te rooien staat (één stap per plek, T.watTeRooien), dan van de beste plek af of hij past.
  // Geeft { x, y, rooien: het stuk dat eerst vrij moet }, of null.
  function zoekPlekOmTeRooien(D, soort, bij) {
    const w = D.wereld;
    const g = T.GEBOUWEN[soort];
    if (!g || g.erf || soort === 'markt') return null;
    const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || g.voet;
    const kring = heeftKring(soort) ? T.kringTeller(D, soort, true) : null;
    const tot = g.bij || kring ? Math.max(45, w.tegels.length, w.tegels[0].length) : 45;
    const plekken = [];
    for (let y = Math.max(0, bij.y - tot); y < Math.min(w.tegels.length, bij.y + tot); y++) {
      for (let x = Math.max(0, bij.x - tot); x < Math.min(w.tegels[0].length, bij.x + tot); x++) {
        const zonder = kring ? kring({ x, y, b: voet.b, h: voet.h }).zonder : 0;
        if (kring && !(zonder > 0)) continue;
        const kavel = T.kavelVan(D, x, y, voet);
        const wat = T.watTeRooien(D, kavel);
        if (wat.bomen || wat.struiken) plekken.push({ x, y, kavel, zonder, bomen: wat.bomen, d: Math.hypot(x - bij.x, y - bij.y) });
      }
    }
    plekken.sort((a, b) => b.zonder - a.zonder || a.bomen - b.bomen || a.d - b.d);
    const plek = plekken.find((p) => !T.waaromPastHetNiet(D, soort, p.x, p.y, null, p.kavel));
    return plek ? { x: plek.x, y: plek.y, rooien: plek.kavel } : null;
  }
  T.plekOmTeRooien = zoekPlekOmTeRooien; // ook voor test/rooien.test.cjs

  // Kan hier een gebouw van deze soort komen (met `voet` zijn voet), op open grond of nadat wie het vraagt er rooit, zoals
  // hierboven? Wie er nu staat, telt niet: die is morgen weg. Voor de plekken waar nog een put kan komen (T.kringGrond,
  // js/wensen.js).
  T.kanHierKomen = function (D, soort, x, y, voet) {
    if (!T.waaromPastHetNiet(D, soort, x, y, null, null, false)) return true;
    const kavel = T.kavelVan(D, x, y, voet);
    const wat = T.watTeRooien(D, kavel);
    return !!(wat.bomen || wat.struiken) && !T.waaromPastHetNiet(D, soort, x, y, null, kavel, false);
  };

  // Een werkplaats komt bij het huis van wie hem vraagt; wat van iedereen is (een plek met een kring, en wat geen handen
  // heeft of het hele dorp dient: de markt, het wachthuis), bij het hart van het dorp.
  const vanIedereen = (soort) => heeftKring(soort) || !T.GEBOUWEN[soort].handen || T.WENSEN_INSTELLINGEN.kring[soort] === null || soort === 'wachthuis';

  // ---------------------------------------------------------------------------------------------
  // Wie het vraagt
  // ---------------------------------------------------------------------------------------------

  // Een volwassene die je kan komen zoeken (T.kanJeKomenZoeken, js/voorvallen.js), geloot met het lot van de dag, zodat de
  // speeltest met hetzelfde zaad hetzelfde jaar speelt. Voor een plek met een kring iemand uit een huis dat hem dan
  // bereikt (namens de buurt); voor de rest iemand zonder werk, of anders iemand die geen boer is.
  function wieVraagt(D, soort, plek, dag) {
    const kunnen = D.bewoners.mensen.filter((p) => p.leeftijd === 'volwassen' && T.kanJeKomenZoeken(D, p));
    let lijst = [];
    if (heeftKring(soort) && plek) {
      const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || T.GEBOUWEN[soort].voet;
      const rect = { x: plek.x, y: plek.y, b: voet.b, h: voet.h };
      lijst = kunnen.filter((p) => p.huis && p.huis.wensen && T.inDeKring(T.voetVanGebouw(p.huis), rect, T.WENSEN_INSTELLINGEN.kring[soort]));
    } else {
      lijst = kunnen.filter((p) => !p.werk && !T.isBoer(p.wezen));
      if (!lijst.length) lijst = kunnen.filter((p) => !T.isBoer(p.wezen));
    }
    if (!lijst.length) lijst = kunnen;
    return lijst.length ? lijst[Math.floor(T.lotVanDeDag(D, dag, 53) * lijst.length)] : null;
  }

  // Wat het verzoek de raadsman waard is (js/raadsman.js), als tevredenheid: zie nutPerMensen hierboven. Wat jij op het
  // plein liet hangen, weegt het zwaarst.
  function nutVan(D, x) {
    if (x.voor === 'oproep') return IN().nutTot;
    if (x.voor === 'eigen') return T.ONDERNEMERS_INSTELLINGEN.nut;
    if (x.voor === 'doel') return IN().nutTot / 2;
    if (x.mensen == null) return IN().nutTot;
    return Math.min(IN().nutTot, Math.ceil(x.mensen / IN().nutPerMensen));
  }

  // ---------------------------------------------------------------------------------------------
  // Elke dag
  // ---------------------------------------------------------------------------------------------

  // Wat er gevraagd kan worden, in volgorde: eerst je oproepen, dan wat een ondernemer uit zichzelf wil
  // (T.eigenVerzoeken, js/ondernemers.js), dan wat het dorp zou willen bouwen (T.watTeBouwen, js/raad.js).
  // [{ soort, waarom, voor, premie, wie (wie het vraagt, als dat vastligt), voorval, wil }]
  function watTeVragen(D, dag) {
    const R = verzoekenVan(D);
    const bouwt = (soort) => (D.gebouwen || []).some((g) => g.soort === soort && !g.klaar);
    const oproepen = R.oproepen.filter((o) => T.magGebouwd(D, o.soort) && !bouwt(o.soort))
      .map((o) => ({ soort: o.soort, waarom: `Op het plein hangt je oproep, met een premie van ${IN().premie} goud.`, voor: 'oproep', premie: IN().premie }));
    const eigen = T.eigenVerzoeken(D, dag).filter((x) => !R.oproepen.some((o) => o.soort === x.soort));
    return oproepen.concat(eigen, T.watTeBouwen(D).filter((x) => !R.oproepen.some((o) => o.soort === x.soort)));
  }

  // Komt er vandaag iemand iets vragen? Vanuit T.tikVoorvallenDag (js/voorvallen.js), als er niets anders loopt. Het
  // eerste wat er gevraagd kan worden (je oproepen, dan wat het dorp mist), dat het dorp kan betalen, waar niet kort
  // geleden nee op kwam, met een plek en iemand die het vraagt. Geeft of er een verzoek begon.
  T.beginBouwverzoek = function (D, dag) {
    if (!IN().mensen || D.ander || !D.bewoners || !D.wereld || !D.wereld.tegels) return false;
    const R = verzoekenVan(D);
    if (dag < (R.volgende || 0)) return false;
    const missen = new Map(T.watDeHuizenMissen(D).filter((x) => x.bouw).map((x) => [x.bouw, x]));
    for (const x of watTeVragen(D, dag)) {
      if (R.nee[x.soort] != null && dag - R.nee[x.soort] < IN().naNee) continue;
      if (x.voor !== 'oproep' && R.laatst[x.soort] != null && dag - R.laatst[x.soort] < IN().naJa) continue;
      if (!T.kanBetalen(D, T.kostenVanVerzoek(x))) continue;
      let wie = null;
      let plek = null;
      if (x.wie) {
        // Een ondernemer vraagt het zelf, voor naast zijn huis.
        wie = T.kanJeKomenZoeken(D, x.wie) ? x.wie : null;
        plek = wie && T.plekVoor(D, x.soort, wie.huis ? T.deurVan(D.wereld, wie.huis) : hartVan(D));
      } else if (vanIedereen(x.soort)) {
        plek = T.plekVoor(D, x.soort, hartVan(D));
        wie = plek && wieVraagt(D, x.soort, plek, dag);
      } else {
        wie = wieVraagt(D, x.soort, null, dag);
        plek = wie && T.plekVoor(D, x.soort, wie.huis ? T.deurVan(D.wereld, wie.huis) : hartVan(D));
      }
      if (!wie || !plek) continue;
      const mist = missen.get(x.soort);
      const L = T.beginVoorval(D, x.voorval || 'bouwverzoek', wie, null, dag);
      L.bouw = { soort: x.soort, x: plek.x, y: plek.y, waarom: x.waarom, voor: x.voor, nut: nutVan(D, { mensen: mist ? mist.mensen : null, voor: x.voor }) };
      if (x.premie) L.bouw.premie = x.premie;
      if (x.wil) L.bouw.eigen = x.wil;
      if (plek.kramen) L.bouw.kramen = plek.kramen; // de markt op het plein: waar de kramen komen, in goud (js/tekenen.js)
      // Geen open grond: wie het vraagt, rooit de plek eerst (js/bos.js), en in het bos van de heer kost dat zijn gunst.
      if (plek.rooien) Object.assign(L.bouw, { rooien: plek.rooien, bos: T.inHetBosVanDeHeer(D, plek.rooien) });
      R.volgende = dag + IN().elke;
      return true;
    }
    R.volgende = dag + 1;
    return false;
  };

  // ---------------------------------------------------------------------------------------------
  // Het antwoord
  // ---------------------------------------------------------------------------------------------

  // Ja (doe: { bouw: true }, js/voorvallen.js): het gebouw komt er, op zijn plek, of als die intussen bezet is (er staat
  // iemand) op de plek die hij nu zou kiezen. T.plaatsGebouw (js/gebouwen.js) betaalt de kosten, en de premie van een
  // oproep gaat erbij; de oproep hangt er dan niet meer. Wie het vroeg, is er de meester.
  T.verzoekToegestaan = function (D, L) {
    const b = L.bouw;
    const wie = L.wie;
    const bij = (vanIedereen(b.soort) && !b.eigen) || !(wie && wie.huis) ? hartVan(D) : T.deurVan(D.wereld, wie.huis);
    // Zijn plek, of als die intussen bezet is, de plek die hij nu zou kiezen; moest hij eerst rooien en is dat nog zo, dan
    // wacht het gebouw daarop (js/bos.js).
    const past = b.rooien ? !T.waaromPastHetNiet(D, b.soort, b.x, b.y, null, b.rooien) : T.gebouwPast(D, b.soort, b.x, b.y);
    const plek = past ? b : T.plekVoor(D, b.soort, bij);
    const rooien = plek && (plek === b ? b.rooien : plek.rooien);
    const u = plek ? T.plaatsGebouw(D, b.soort, plek.x, plek.y, rooien || null) : { gelukt: false, reden: 'er is geen plek meer' };
    if (!u.gelukt) {
      T.zeg(D, `${T.hoofdletter(wieNaam(wie))} kan ${deVan(b.soort)} ${naamVan(b.soort)} toch niet bouwen: ${u.reden.replace(/\.$/, '').toLowerCase()}.`);
      return;
    }
    u.instantie.meester = wie;
    if (u.instantie.wachtOpRooien) wie.rooit = u.instantie;
    // In het bos van de heer kost het zijn gunst (js/bos.js), zoals de prijs onder ja zei (T.prijsVanKeuze,
    // js/voorvallen.js): de plek waar hij om vroeg. Tussen de vraag en het antwoord kan er een boompje een boom zijn
    // geworden, of de plek verschoven; in de speeltest van 6 okt kostte ja zo 5 gunst die de prijs niet noemde.
    if (b.bos) T.wijzigGunst(D, -T.ONTGINNEN_INSTELLINGEN.gunst, 'Een werkplaats in zijn bos');
    const R = verzoekenVan(D);
    R.ja++;
    R.laatst[b.soort] = dagNu(D);
    if (b.premie) {
      T.wijzigVoorraad(D, 'goud', -b.premie);
      R.oproepen = R.oproepen.filter((o) => o.soort !== b.soort);
    }
    if (b.eigen) T.eigenToegestaan(D, L);
    const eerst = u.instantie.wachtOpRooien ? `rooit eerst de plek voor ${deVan(b.soort)} ${naamVan(b.soort)}` : `begint aan ${deVan(b.soort)} ${naamVan(b.soort)}`;
    T.zeg(D, `${T.hoofdletter(wieNaam(wie))} ${eerst}.`, 'goed');
  };

  // Nee (doe: { weiger: true }): het dorp onthoudt het, en vraagt het pas na naNee dagen weer. Een ondernemer onthoudt
  // het zelf ook (js/ondernemers.js).
  T.verzoekGeweigerd = function (D, L) {
    const R = verzoekenVan(D);
    R.nee[L.bouw.soort] = dagNu(D);
    R.geweigerd++;
    if (L.bouw.eigen) T.eigenGeweigerd(D, L);
  };

  // Wat een verzoek kost, voor het venster (T.prijsVanKeuze, js/voorvallen.js) en de raadsman: de kosten van het gebouw,
  // en bij een oproep de premie in goud erbij.
  T.kostenVanVerzoek = function (bouw) {
    const k = { ...(T.GEBOUWEN[bouw.soort].kosten || {}) };
    if (bouw.premie) k.goud = (k.goud || 0) + bouw.premie;
    return k;
  };

  // ---------------------------------------------------------------------------------------------
  // De oproepen (stap 2; vraag 103, c)
  // ---------------------------------------------------------------------------------------------

  // Een oproep op het plein: "Het dorp zoekt een weverij", met een premie uit de kist voor wie het bouwt (betaald bij ja).
  // Hangt er al een voor deze soort, dan haal je hem weg. Geeft wat het bericht zegt.
  T.doeOproep = function (D, soort) {
    const R = verzoekenVan(D);
    if (R.oproepen.some((o) => o.soort === soort)) {
      R.oproepen = R.oproepen.filter((o) => o.soort !== soort);
      return `Je haalt je oproep weg: het dorp zoekt geen ${naamVan(soort)} meer.`;
    }
    if (!T.magGebouwd(D, soort)) return `Een ${naamVan(soort)} mag hier nog niet.`;
    R.oproepen.push({ soort, dag: dagNu(D) });
    return `Op het plein hangt je oproep: het dorp zoekt een ${naamVan(soort)}, met een premie van ${IN().premie} goud.`;
  };

  // De oproep voor deze soort, of null.
  T.oproepVoor = (D, soort) => ((D.verzoeken && D.verzoeken.oproepen) || []).find((o) => o.soort === soort) || null;

  // Wat de raad erbij zegt over deze soort (js/raad.js): wie je er nu om vraagt, of dat je er kort geleden nee op zei.
  // Met een spatie ervoor, of leeg.
  T.verzoekZin = function (D, soort) {
    const L = D.voorvallen && D.voorvallen.lopend;
    if (L && L.bouw && L.bouw.soort === soort) return ` ${T.hoofdletter(wieNaam(L.wie))} vraagt je erom.`;
    const nee = D.verzoeken && D.verzoeken.nee[soort];
    if (nee != null && dagNu(D) - nee < IN().naNee) return ` Je zei er nee tegen.`;
    return '';
  };

  // ---------------------------------------------------------------------------------------------
  // De woorden (js/gesprekken.js, het gesprek 'bouwverzoek'; T.vulWoordenIn, js/gesprek.js)
  // ---------------------------------------------------------------------------------------------

  const bouwNu = (D) => {
    const L = D.voorvallen && D.voorvallen.lopend;
    return L && L.bouw ? L : null;
  };

  // Waar het komt, zoals hij het zegt: naast zijn huis, of bij het gebouw dat er het dichtst bij staat en geen woning is.
  function plekTekst(D, L) {
    const b = L.bouw;
    if (b.kramen) return 'op het plein';
    // Geen open grond (js/bos.js): waar, en wat hij er eerst rooit.
    if (b.rooien) {
      const wat = T.rooiWoorden(T.watTeRooien(D, b.rooien));
      return `${plaatsTekst(D, L)}, waar ik eerst ${wat} rooi${b.bos ? ', in het bos van de heer' : ''}`;
    }
    return plaatsTekst(D, L);
  }
  // Waar het komt, zonder wat er gerooid wordt.
  function plaatsTekst(D, L) {
    const b = L.bouw;
    const deur = L.wie.huis && T.deurVan(D.wereld, L.wie.huis);
    if (deur && Math.hypot(b.x - deur.x, b.y - deur.y) <= 8) return 'naast mijn huis';
    let beste = null;
    for (const g of D.gebouwen || []) {
      if (!g.klaar || T.standVan(g)) continue;
      const v = T.voetVanGebouw(g);
      const d = Math.hypot(b.x - (v.x + v.b / 2), b.y - (v.y + v.h / 2));
      if (!beste || d < beste.d) beste = { g, d };
    }
    if (!beste) return 'aan de rand van het dorp';
    if (beste.g.huis === 'schout') return 'bij jouw huis';
    return `bij ${deVan(beste.g.soort)} ${naamVan(beste.g.soort)}`;
  }

  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  // "ik wil" of, voor een put of een kapel, "de buurt wil"
  T.GESPREK_WOORDEN.wil = (D) => {
    const L = bouwNu(D);
    return L && heeftKring(L.bouw.soort) ? 'de buurt wil' : 'ik wil';
  };
  // "een weverij"
  T.GESPREK_WOORDEN.gebouw = (D) => {
    const L = bouwNu(D);
    return L ? `een ${naamVan(L.bouw.soort)}` : 'iets';
  };
  // "naast mijn huis", "bij de herberg"
  T.GESPREK_WOORDEN.plek = (D) => {
    const L = bouwNu(D);
    return L ? plekTekst(D, L) : 'hier';
  };
  // wat er gemist wordt, een hele zin: "Tien stenen huizen willen laken."
  T.GESPREK_WOORDEN.waarom = (D) => {
    const L = bouwNu(D);
    return L ? L.bouw.waarom : '';
  };
  // "14 hout en 8 goud", of "niets"; bij een oproep met de premie erin
  T.GESPREK_WOORDEN.kosten = (D) => {
    const L = bouwNu(D);
    const k = L ? T.kostenVanVerzoek(L.bouw) : {};
    const wat = Object.keys(k).length ? T.opsomming(Object.entries(k).map(([w, n]) => `${n} ${w}`)) : 'niets';
    return L && L.bouw.premie ? `${wat}, met de premie` : wat;
  };
})(globalThis.Spel = globalThis.Spel || {});
