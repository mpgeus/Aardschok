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
//            als het dorp het kan betalen. Wie nee hoorde, vraagt hetzelfde pas na `naNee` dagen weer.
// Hij komt je zoeken zoals bij een voorval (het voorval 'bouwverzoek', js/voorvallen.js, met de woorden in
// js/gesprekken.js), en zegt wat het het dorp kost. Ja: het gebouw komt er (T.plaatsGebouw, dat de kosten betaalt). Nee:
// het dorp onthoudt het. Ben je weg, dan beslist je raadsman (js/raadsman.js): wat het helpt tegen wat het kost, naar
// zijn karakter.
//
// D.verzoeken: { volgende (de dag waarop er weer een kan komen), nee: { soort: dag }, ja, geweigerd (hoe vaak) }
// Op het voorval (D.voorvallen.lopend.bouw): { soort, x, y, waarom, nut }
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
    // Wat een verzoek de raadsman waard is, als tevredenheid (js/raadsman.js): per zoveel mensen die het missen één punt,
    // tot `nutTot`; het hout of het eten voor de winter en een wachthuis na de rovers wegen `nutTot`, het doel de helft.
    nutPerMensen: 4,
    nutTot: 8,
  };
  const IN = () => T.VERZOEKEN_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const naamVan = (soort) => T.GEBOUWEN[soort].naam;
  const deVan = (soort) => (/huis$|hok$|hof$|^erf$|^gevang$/.test(naamVan(soort)) ? 'het' : 'de');
  const heeftKring = (soort) => T.WENSEN_INSTELLINGEN.kring[soort] != null;
  const wieNaam = (p) => T.naamVanBewoner(p);

  T.nieuweVerzoeken = () => ({ volgende: 0, nee: {}, ja: 0, geweigerd: 0 });
  const verzoekenVan = (D) => D.verzoeken || (D.verzoeken = T.nieuweVerzoeken());

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
  // put, een kapel; js/wensen.js): waar hij de meeste huizen bereikt die er nog geen hebben (T.watDeKringBereikt), bij
  // gelijk spel het dichtst bij `bij`; bereikt hij nergens zo'n huis, dan nergens. De rest: zo dicht mogelijk bij `bij`
  // (een deur), in ringen, op de eerste plek waar het past (T.gebouwPast). Zo zocht de bouwer van de speeltest al
  // (gereedschap/speeltest/speler.js), en die vraagt het nu hier.
  T.plekVoor = function (D, soort, bij) {
    const w = D.wereld;
    if (heeftKring(soort)) {
      const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || T.GEBOUWEN[soort].voet;
      let beste = null;
      for (let y = 0; y < w.tegels.length; y++) {
        for (let x = 0; x < w.tegels[0].length; x++) {
          if (!T.gebouwPast(D, soort, x, y)) continue;
          const zonder = T.watDeKringBereikt(D, soort, { x, y, b: voet.b, h: voet.h }).zonder;
          const d = Math.hypot(x - bij.x, y - bij.y);
          if (zonder > 0 && (!beste || zonder > beste.zonder || (zonder === beste.zonder && d < beste.d))) beste = { x, y, d, zonder };
        }
      }
      return beste && { x: beste.x, y: beste.y };
    }
    for (let r = 3; r < 45; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (T.gebouwPast(D, soort, bij.x + dx, bij.y + dy)) return { x: bij.x + dx, y: bij.y + dy };
        }
      }
    }
    return null;
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

  // Wat het verzoek de raadsman waard is (js/raadsman.js), als tevredenheid: zie nutPerMensen hierboven.
  function nutVan(D, x) {
    if (x.voor === 'doel') return IN().nutTot / 2;
    if (x.mensen == null) return IN().nutTot;
    return Math.min(IN().nutTot, Math.ceil(x.mensen / IN().nutPerMensen));
  }

  // ---------------------------------------------------------------------------------------------
  // Elke dag
  // ---------------------------------------------------------------------------------------------

  // Komt er vandaag iemand iets vragen? Vanuit T.tikVoorvallenDag (js/voorvallen.js), als er niets anders loopt. Het
  // eerste wat het dorp zou willen bouwen (T.watTeBouwen, js/raad.js), dat het kan betalen, waar niet kort geleden nee
  // op kwam, met een plek en iemand die het vraagt. Geeft of er een verzoek begon.
  T.beginBouwverzoek = function (D, dag) {
    if (!IN().mensen || D.ander || !D.bewoners || !D.wereld || !D.wereld.tegels) return false;
    const R = verzoekenVan(D);
    if (dag < (R.volgende || 0)) return false;
    const missen = new Map(T.watDeHuizenMissen(D).filter((x) => x.bouw).map((x) => [x.bouw, x]));
    for (const x of T.watTeBouwen(D)) {
      if (R.nee[x.soort] != null && dag - R.nee[x.soort] < IN().naNee) continue;
      if (!T.kanBetalen(D, T.GEBOUWEN[x.soort].kosten || {})) continue;
      let wie = null;
      let plek = null;
      if (vanIedereen(x.soort)) {
        plek = T.plekVoor(D, x.soort, hartVan(D));
        wie = plek && wieVraagt(D, x.soort, plek, dag);
      } else {
        wie = wieVraagt(D, x.soort, null, dag);
        plek = wie && T.plekVoor(D, x.soort, wie.huis ? T.deurVan(D.wereld, wie.huis) : hartVan(D));
      }
      if (!wie || !plek) continue;
      const mist = missen.get(x.soort);
      const L = T.beginVoorval(D, 'bouwverzoek', wie, null, dag);
      L.bouw = { soort: x.soort, x: plek.x, y: plek.y, waarom: x.waarom, nut: nutVan(D, { mensen: mist ? mist.mensen : null, voor: x.voor }) };
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
  // iemand) op de plek die hij nu zou kiezen. T.plaatsGebouw (js/gebouwen.js) betaalt de kosten. Wie het vroeg, is er de
  // meester.
  T.verzoekToegestaan = function (D, L) {
    const b = L.bouw;
    const wie = L.wie;
    const bij = vanIedereen(b.soort) || !(wie && wie.huis) ? hartVan(D) : T.deurVan(D.wereld, wie.huis);
    const plek = T.gebouwPast(D, b.soort, b.x, b.y) ? b : T.plekVoor(D, b.soort, bij);
    const u = plek ? T.plaatsGebouw(D, b.soort, plek.x, plek.y) : { gelukt: false, reden: 'er is geen plek meer' };
    if (!u.gelukt) {
      T.zeg(D, `${T.hoofdletter(wieNaam(wie))} kan ${deVan(b.soort)} ${naamVan(b.soort)} toch niet bouwen: ${u.reden.replace(/\.$/, '').toLowerCase()}.`);
      return;
    }
    u.instantie.meester = wie;
    verzoekenVan(D).ja++;
    T.zeg(D, `${T.hoofdletter(wieNaam(wie))} begint aan ${deVan(b.soort)} ${naamVan(b.soort)}.`, 'goed');
  };

  // Nee (doe: { weiger: true }): het dorp onthoudt het, en vraagt het pas na naNee dagen weer.
  T.verzoekGeweigerd = function (D, L) {
    const R = verzoekenVan(D);
    R.nee[L.bouw.soort] = dagNu(D);
    R.geweigerd++;
  };

  // Wat een verzoek kost, voor het venster (T.prijsVanKeuze, js/voorvallen.js) en de raadsman: de kosten van het gebouw.
  T.kostenVanVerzoek = (bouw) => T.GEBOUWEN[bouw.soort].kosten || {};

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
  // "14 hout en 8 goud", of "niets"
  T.GESPREK_WOORDEN.kosten = (D) => {
    const L = bouwNu(D);
    const k = L ? T.kostenVanVerzoek(L.bouw) : {};
    return Object.keys(k).length ? T.opsomming(Object.entries(k).map(([wat, n]) => `${n} ${wat}`)) : 'niets';
  };
})(globalThis.Spel = globalThis.Spel || {});
