// Een scenario: de triggers, de gebieden en de doelen van een level (vraag 187, stap 1a; ontwerp/scenario.md, 2).
//
// Een trigger is gegevens, geen functie: { id, aan, keer, als: [...], dan: [...] }. Hij gaat af als alle voorwaarden van
// `als` gelden (voor "of" maak je twee triggers), doet alles van `dan`, en gaat daarna uit; met `keer` gaat hij zo vaak
// af ('altijd': elke keer dat `als` geldt), met `aan: false` begint hij uit (een andere trigger zet hem aan). Elke
// voorwaarde en elk gevolg is een object met één of meer woorden, en `wie`: het dorp waar het om gaat ('speler', of een
// nummer in S.dorpen; zonder wie je eigen dorp). De woorden zijn één taal met de gesprekken: T.VOORWAARDEN en T.GEVOLGEN
// (js/gesprek.js), hier aangevuld.
//
//   T.startScenario(S, {
//     gebieden: { brug: { x: 40, y: 52, b: 4, h: 3 }, bron: { x: 61, y: 30, r: 2 } },   // een rechthoek of een kring
//     triggers: [
//       { id: 'begin', als: [{ dag: 0 }], dan: [{ doel: { id: 'brug', tekst: 'Hold the bridge.', hoofd: true } }] },
//       { id: 'gezien', als: [{ dag: { tussen: [59, 219], lot: 'overval' } }], dan: [{ bericht: { tekst: 'Robbers!', toon: 'gevaar' } }] },
//       { id: 'overval', als: [{ na: { trigger: 'gezien', uren: 24 } }, { uur: 'overdag' }], dan: [{ rovers: { aantal: 3 } }] },
//     ],
//   });
//
// Zo houden de triggers zich aan de afspraken in de code (CLAUDE.md): ze draaien in de tik (T.wereldTik, js/tik.js, na de
// opdrachten en de kalender), één keer per seconde van de wereld, dus elke computer rekent dezelfde trigger op dezelfde
// tik; hun toeval is T.vastLot, getrokken bij het begin; wat ze weten, staat in S.scenario en wordt bewaard; wat ze
// zeggen, gaat langs T.zeg; een gebied is een vak van tegels, en een voorwaarde erop kijkt alleen naar de wezens op de
// kaart van het dorp, nooit over de hele kaart. Een level kan geen functie bevatten, dus het past in een bestand dat een
// bewerker terugschrijft (stap 2 en 4: het level als recept, en de editor).
//
// Nog niet: een level dat een spel maakt (stap 2), het demojaar als triggers (1b), en de woorden die daarbij komen
// (wat dicht is, de punten, een scène). Zonder scherm, en dus getoetst (test/scenario.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank, js/opties.js).
  T.SCENARIO_INSTELLINGEN = {
    // Zo vaak, in seconden van de wereld (een dag is er 300), kijken de triggers of ze afgaan: vaak genoeg voor een
    // checkpoint, en goedkoop.
    elke: 1,
  };
  const IN = () => T.SCENARIO_INSTELLINGEN;
  const elk = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const uurNu = (S) => S.kalender.dag * 24;
  const dagNu = (S) => Math.floor(S.kalender.dag);
  // Het kanaal van T.vastLot (js/weer.js) voor een dag uit het zaad; elke naam zijn eigen getal.
  const LOT_KANAAL = 1470;
  const nummerVan = (naam) => [...String(naam)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

  // ---------------------------------------------------------------------------------------------
  // Beginnen, en elke seconde van de wereld
  // ---------------------------------------------------------------------------------------------

  // Een scenario begint in spel S (een kopie: het level zelf blijft zoals het was). Eerst de keuring: vindt die iets, dan
  // begint het niet, en geeft dit wat er mis is; anders een lege lijst. De dagen uit het zaad worden meteen getrokken
  // (S.scenario.lot), zodat ze vastliggen en te zien zijn.
  T.startScenario = function (S, level) {
    const fout = T.keurScenario(level);
    if (fout.length) return fout;
    const L = JSON.parse(JSON.stringify(level));
    S.scenario = {
      gebieden: L.gebieden || {},
      // Elke trigger met wat hij van zichzelf weet: of hij aan is, hoe vaak hij afging, en wanneer het laatst (in uren
      // van het spel, zoals de kalender: dag × 24).
      triggers: (L.triggers || []).map((t) => ({ ...t, aan: t.aan !== false, keer: t.keer == null ? 1 : t.keer, gedaan: 0, laatst: null })),
      doelen: [], // { id, tekst, hoofd, stand: 'open', 'af' of 'mislukt' }, in de volgorde waarin ze erbij kwamen
      tellers: {},
      lot: {},
      seconde: Math.floor((S.wereldTijd || 0) / IN().elke),
    };
    for (const t of S.scenario.triggers) {
      for (const v of elk(t.als)) {
        if (!v.dag || !v.dag.tussen) continue;
        const [van, tot] = v.dag.tussen;
        const D = T.scenarioDorp(S, v.wie);
        if (S.scenario.lot[v.dag.lot] == null) S.scenario.lot[v.dag.lot] = van + Math.floor(T.vastLot(D, nummerVan(v.dag.lot), LOT_KANAAL) * (tot - van + 1));
      }
    }
    return [];
  };

  // Het dorp van een voorwaarde of een gevolg: `wie` is 'speler' (je eigen dorp, S.dorp; ook zonder wie) of een nummer
  // in S.dorpen. Geeft null als dat dorp er niet is.
  T.scenarioDorp = function (S, wie) {
    if (wie == null || wie === 'speler') return S.dorp;
    return (Number.isInteger(wie) && S.dorpen[wie]) || null;
  };

  // Elke tik (T.wereldTik, js/tik.js): is er een seconde van de wereld om, dan kijkt elke trigger die aan is of hij
  // afgaat, in de volgorde van het level. Wat een trigger aanzet, kijkt in dezelfde ronde al mee als hij verderop staat.
  T.werkScenarioBij = function (S) {
    const sc = S.scenario;
    if (!sc) return;
    const seconde = Math.floor(S.wereldTijd / IN().elke);
    if (seconde === sc.seconde) return;
    sc.seconde = seconde;
    for (const t of sc.triggers) if (t.aan && geldtAlles(S, t.als)) gaAf(S, t);
  };

  const geldtAlles = (S, als) =>
    elk(als).every((v) => {
      const D = T.scenarioDorp(S, v.wie);
      return !!D && T.voorwaardeGeldt(S, D, null, v);
    });

  function gaAf(S, t) {
    t.gedaan += 1;
    t.laatst = uurNu(S);
    if (t.keer !== 'altijd' && t.gedaan >= t.keer) t.aan = false;
    for (const doe of elk(t.dan)) {
      const D = T.scenarioDorp(S, doe.wie);
      if (D) T.doeGevolg(S, D, doe);
    }
  }

  const triggerVan = (S, id) => (S.scenario && S.scenario.triggers.find((t) => t.id === id)) || null;
  const doelVan = (S, id) => (S.scenario && S.scenario.doelen.find((d) => d.id === id)) || null;

  // ---------------------------------------------------------------------------------------------
  // De gebieden
  // ---------------------------------------------------------------------------------------------

  // Een gebied is een rechthoek van tegels ({ x, y, b, h }) of een kring ({ x, y, r }: elke tegel tot r stappen van het
  // midden, zoals T.afstand telt).
  const inGebied = (g, x, y) =>
    g.r != null ? Math.max(Math.abs(x - g.x), Math.abs(y - g.y)) <= g.r : x >= g.x && x < g.x + g.b && y >= g.y && y < g.y + g.h;
  const middenVan = (g) => (g.r != null ? { x: g.x, y: g.y } : { x: g.x + Math.floor(g.b / 2), y: g.y + Math.floor(g.h / 2) });
  const gebiedVan = (S, naam) => (S.scenario && S.scenario.gebieden[naam]) || null;
  // Staan er minstens `aantal` wezens op de kaart van D in gebied g waarvoor `telt` geldt? Alleen wie er staat, niet de
  // tegels; zonder lijst, en klaar zodra het er genoeg zijn (zo'n 10 µs per gebied bij 500 wezens).
  function minstensIn(D, g, aantal, telt) {
    let n = 0;
    for (const e of D.wereld.wezens) if (!e.dood && inGebied(g, e.tx, e.ty) && telt(e) && ++n >= aantal) return true;
    return false;
  }

  // ---------------------------------------------------------------------------------------------
  // De woorden van een voorwaarde (bij die van de gesprekken: vlag en nietVlag, js/gesprek.js)
  // ---------------------------------------------------------------------------------------------

  // Een getal tegen een eis: een getal is "minstens zoveel", { minstens, minder } een stuk (minder: kleiner dan).
  const telt = (n, eis) =>
    typeof eis === 'number' ? n >= eis : (eis.minstens == null || n >= eis.minstens) && (eis.minder == null || n < eis.minder);

  Object.assign(T.VOORWAARDEN, {
    // De dag van het spel (dag 0 is het begin; Sint-Maarten van het eerste jaar is dag 250). Een getal: vanaf die dag;
    // { van, tot }: van tot en met; { tussen: [van, tot], lot: 'naam' }: vanaf een dag daartussen, één keer getrokken uit
    // het zaad van het land, onder die naam (een andere trigger met dezelfde naam krijgt dezelfde dag).
    dag: (S, D, v) => {
      const d = dagNu(S);
      if (typeof v === 'number') return d >= v;
      if (v.tussen) return !!S.scenario && S.scenario.lot[v.lot] != null && d >= S.scenario.lot[v.lot];
      return (v.van == null || d >= v.van) && (v.tot == null || d <= v.tot);
    },
    // Het uur: 'overdag' (de zon is op), 'nacht', of { van, tot } in uren van de dag (over middernacht: { van: 22, tot: 4 }).
    uur: (S, D, v) => {
      const u = T.uurVanDag(S.kalender.dag);
      if (v === 'overdag' || v === 'nacht') {
        const zon = T.zonVan(S.kalender.dag);
        return (u >= zon.op && u < zon.onder) === (v === 'overdag');
      }
      return v.van <= v.tot ? u >= v.van && u < v.tot : u >= v.van || u < v.tot;
    },
    // Zo lang nadat een andere trigger (het laatst) afging: { trigger, uren } of { trigger, dagen }.
    na: (S, D, v) => {
      const t = triggerVan(S, v.trigger);
      return !!t && t.laatst != null && uurNu(S) >= t.laatst + (v.uren || 0) + (v.dagen || 0) * 24;
    },
    // Het dorp: zoveel van een waar in de voorraad ({ graan: 20, hout: { minder: 5 } }), zoveel mensen, zoveel af van een
    // soort gebouw ({ molen: 1 }), minstens een trede ('dorp').
    waar: (S, D, v) => Object.entries(v).every(([wat, eis]) => telt(D.voorraad[wat] || 0, eis)),
    bevolking: (S, D, v) => telt(D.bevolking || 0, v),
    gebouw: (S, D, v) => Object.entries(v).every(([soort, eis]) => telt(D.gebouwen.filter((g) => g.soort === soort && g.klaar).length, eis)),
    trede: (S, D, v) => T.tredeMinstens(D, v),
    // De heer: een woord of een lijstje (allemaal) uit T.heerStand (js/heer.js): 'brief', 'komt', 'staat', 'betaald',
    // 'geweigerd', 'weg'. En de twee bazen (js/bazen.js); zonder die spelregel gelden ze nooit.
    heer: (S, D, v) => {
      const stand = T.heerStand(D);
      return elk(v).every((woord) => stand.includes(woord));
    },
    gunst: (S, D, v) => !!T.bazenNu(D) && telt(T.bazenNu(D).gunst, v),
    vertrouwen: (S, D, v) => !!T.bazenNu(D) && telt(T.bazenNu(D).vertrouwen, v),
    // De kaart (het checkpoint): { gebied, aantal, soort } er staan minstens zoveel (zonder aantal: één) van het dorp in
    // het gebied, van die soort als die er staat ('speerman'); de aanvoerder telt mee. Een gebied zonder vijand van het
    // dorp (T.isVijandVan, js/gevecht.js): leegGebied.
    inGebied: (S, D, v) => {
      const g = gebiedVan(S, v.gebied);
      return !!g && minstensIn(D, g, v.aantal || 1, (e) => T.isVanDorp(D, e) && (!v.soort || e.soort === v.soort));
    },
    leegGebied: (S, D, v) => {
      const g = gebiedVan(S, v);
      return !!g && !minstensIn(D, g, 1, (e) => T.isVijandVan(D, e));
    },
    // Het scenario zelf: een doel ('id': af, of { id: 'mislukt' }), een trigger die afging ('id'), een teller ({ naam: 3 }).
    doel: (S, D, v) =>
      typeof v === 'string' ? !!doelVan(S, v) && doelVan(S, v).stand === 'af' : Object.entries(v).every(([id, stand]) => !!doelVan(S, id) && doelVan(S, id).stand === stand),
    trigger: (S, D, v) => elk(v).every((id) => !!triggerVan(S, id) && triggerVan(S, id).gedaan > 0),
    teller: (S, D, v) => Object.entries(v).every(([naam, eis]) => telt((S.scenario && S.scenario.tellers[naam]) || 0, eis)),
  });

  // ---------------------------------------------------------------------------------------------
  // De woorden van een gevolg (bij die van de gesprekken: zetVlag, wisVlag, handel en heer, js/gesprek.js)
  // ---------------------------------------------------------------------------------------------

  // Een zin uit een level is gegevens (vraag 147): hij gaat naar de taal van nu met T.tGegevens, en `npm run teksten` leest
  // hem later uit de levels.
  Object.assign(T.GEVOLGEN, {
    // Een bericht: een zin, of { tekst, toon, gebied } (toon: 'goed' of 'gevaar'; met een gebied brengt een klik op het
    // bericht de camera erheen, js/ui.js).
    bericht: (S, D, v) => {
      const b = typeof v === 'string' ? { tekst: v } : v;
      const g = b.gebied ? gebiedVan(S, b.gebied) : null;
      T.zeg(D, T.tGegevens(b.tekst), b.toon || '', g ? middenVan(g) : undefined);
    },
    // Een doel: { id, tekst, hoofd } zet het erbij (het hoofddoel staat linksboven, T.doelLinksboven); { id, stand: 'af' }
    // of 'mislukt' zet het af. Een bericht zegt het allebei.
    doel: (S, D, v) => {
      if (!S.scenario) return;
      let d = doelVan(S, v.id);
      if (!d) {
        d = { id: v.id, tekst: v.tekst || '', hoofd: !!v.hoofd, stand: 'open' };
        S.scenario.doelen.push(d);
        if (d.tekst) T.zeg(D, T.t('New goal: {doel}', { doel: T.tGegevens(d.tekst) }));
      }
      if (!v.stand || v.stand === d.stand) return;
      d.stand = v.stand;
      if (d.stand === 'af') T.zeg(D, T.t('Goal reached: {doel}', { doel: T.tGegevens(d.tekst) }), 'goed');
      if (d.stand === 'mislukt') T.zeg(D, T.t('Goal failed: {doel}', { doel: T.tGegevens(d.tekst) }), 'gevaar');
    },
    // Een teller erbij ({ golven: 1 }; min mag), en een trigger aan of uit ('id' of een lijstje).
    teller: (S, D, v) => {
      if (S.scenario) for (const [naam, n] of Object.entries(v)) S.scenario.tellers[naam] = (S.scenario.tellers[naam] || 0) + n;
    },
    triggerAan: (S, D, v) => elk(v).forEach((id) => triggerVan(S, id) && (triggerVan(S, id).aan = true)),
    triggerUit: (S, D, v) => elk(v).forEach((id) => triggerVan(S, id) && (triggerVan(S, id).aan = false)),
    // Geven en nemen: { goud: 50, graan: -10 } (T.wijzigVoorraad).
    waar: (S, D, v) => Object.entries(v).forEach(([wat, n]) => T.wijzigVoorraad(D, wat, n)),
    // Rovers: { aantal, overUren } (T.roversKomen, js/rovers.js), zoals een wilde overval.
    rovers: (S, D, v) => T.roversKomen(D, v.aantal, v.overUren),
    // Het eind: { gewonnen, kop, tekst } (T.spelUit, js/einde.js; het eindscherm in js/hud.js).
    einde: (S, D, v) => T.spelUit(D, { reden: 'scenario', dag: dagNu(S), gewonnen: !!v.gewonnen, kop: v.kop || null, tekst: v.tekst || null }),
  });

  // ---------------------------------------------------------------------------------------------
  // Het vak linksboven
  // ---------------------------------------------------------------------------------------------

  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Wat linksboven staat (js/main.js): in je eigen dorp het hoofddoel van het scenario zolang het open is, anders het doel
  // van de trede (T.tredeDoel, js/treden.js). { kop, tekst, deel }, of null.
  T.doelLinksboven = function (S, D) {
    const hoofd = S.scenario && D === S.dorp ? S.scenario.doelen.find((d) => d.hoofd && d.stand === 'open') : null;
    if (!hoofd) return T.tredeDoel(D);
    return { kop: T.t('Goal'), tekst: veilig(T.tGegevens(hoofd.tekst)), deel: null };
  };

  // ---------------------------------------------------------------------------------------------
  // De keuring
  // ---------------------------------------------------------------------------------------------

  // Wat er mis is met een level, als een lijst zinnen (voor wie het maakt, dus Nederlands, en geen speltekst): een woord
  // dat niemand kent, een gebied, trigger of doel dat er niet is, een dag uit het zaad zonder naam, en een doel dat nooit
  // af kan (geen trigger zet het af). Leeg: het is goed. Zoals T.keurQuests voor de quests tot 23 okt.
  const HEER_WOORDEN = ['brief', 'komt', 'staat', 'betaald', 'geweigerd', 'weg'];
  T.keurScenario = function (level) {
    const fout = [];
    const gebieden = (level && level.gebieden) || {};
    const triggers = (level && level.triggers) || [];
    for (const [naam, g] of Object.entries(gebieden)) {
      const rond = g && [g.x, g.y, g.r].every(Number.isFinite);
      const vierkant = g && [g.x, g.y, g.b, g.h].every(Number.isFinite) && g.b > 0 && g.h > 0;
      if (!rond && !vierkant) fout.push(`gebied ${naam}: geen { x, y, b, h } en geen { x, y, r }`); // geen tekst
    }
    const ids = triggers.map((t) => t.id);
    const lotten = {};
    const doelen = { erbij: new Set(), af: new Set(), genoemd: new Set() };
    const isGebied = (wie, naam) => gebieden[naam] || fout.push(`${wie}: gebied ${naam} is er niet`); // geen tekst
    const isTrigger = (wie, id) => ids.includes(id) || fout.push(`${wie}: trigger ${id} is er niet`); // geen tekst
    triggers.forEach((t, i) => {
      const wie = `trigger ${t.id || i + 1}`; // geen tekst
      if (!t.id) fout.push(`trigger ${i + 1} heeft geen id`); // geen tekst
      else if (ids.indexOf(t.id) !== i) fout.push(`${wie} staat er twee keer`); // geen tekst
      if (!(t.keer == null || t.keer === 'altijd' || (Number.isInteger(t.keer) && t.keer > 0))) fout.push(`${wie}: keer is een getal of 'altijd'`); // geen tekst
      for (const v of elk(t.als)) {
        for (const woord of Object.keys(v)) if (woord !== 'wie' && !T.VOORWAARDEN[woord]) fout.push(`${wie}: de voorwaarde ${woord} bestaat niet`); // geen tekst
        if (v.dag && v.dag.tussen) {
          const [van, tot] = v.dag.tussen;
          if (!v.dag.lot) fout.push(`${wie}: een dag tussen twee heeft een lot (een naam)`); // geen tekst
          else if (lotten[v.dag.lot] && lotten[v.dag.lot] !== `${van}-${tot}`) fout.push(`${wie}: lot ${v.dag.lot} heeft twee keer andere dagen`); // geen tekst
          else lotten[v.dag.lot] = `${van}-${tot}`; // geen tekst
          if (!(van <= tot)) fout.push(`${wie}: de dagen van ${v.dag.lot} lopen achteruit`); // geen tekst
        }
        if (v.uur && typeof v.uur === 'string' && v.uur !== 'overdag' && v.uur !== 'nacht') fout.push(`${wie}: uur is 'overdag', 'nacht' of { van, tot }`); // geen tekst
        if (v.na) isTrigger(wie, v.na.trigger);
        if (v.trigger) elk(v.trigger).forEach((id) => isTrigger(wie, id));
        if (v.heer) for (const w of elk(v.heer)) if (!HEER_WOORDEN.includes(w)) fout.push(`${wie}: de heer kent ${w} niet`); // geen tekst
        if (v.inGebied) isGebied(wie, v.inGebied.gebied);
        if (v.leegGebied) isGebied(wie, v.leegGebied);
        if (v.doel) (typeof v.doel === 'string' ? [v.doel] : Object.keys(v.doel)).forEach((id) => doelen.genoemd.add(id));
      }
      for (const doe of elk(t.dan)) {
        for (const woord of Object.keys(doe)) if (woord !== 'wie' && !T.GEVOLGEN[woord]) fout.push(`${wie}: het gevolg ${woord} bestaat niet`); // geen tekst
        if (doe.bericht && doe.bericht.gebied) isGebied(wie, doe.bericht.gebied);
        for (const id of elk(doe.triggerAan).concat(elk(doe.triggerUit))) isTrigger(wie, id);
        if (doe.doel) {
          if (!doe.doel.id) fout.push(`${wie}: een doel heeft een id`); // geen tekst
          else if (doe.doel.tekst) doelen.erbij.add(doe.doel.id);
          else doelen.genoemd.add(doe.doel.id);
          if (doe.doel.stand === 'af') doelen.af.add(doe.doel.id);
          if (doe.doel.stand && !['af', 'mislukt'].includes(doe.doel.stand)) fout.push(`${wie}: een doel is 'af' of 'mislukt'`); // geen tekst
        }
      }
    });
    for (const id of doelen.genoemd) if (!doelen.erbij.has(id)) fout.push(`doel ${id} komt er nergens bij (een doel met een tekst)`); // geen tekst
    for (const id of doelen.erbij) if (!doelen.af.has(id)) fout.push(`doel ${id} kan nooit af: geen trigger zet het af`); // geen tekst
    return fout;
  };
})(globalThis.Spel = globalThis.Spel || {});
