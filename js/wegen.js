// De wegen die jij legt (werklijst C, stap 5; Marcel, 14 okt: "a ja, b ja, c1, d ja, ... f ja"). Een weg is een rij tegels
// waar de ossenkar twee keer zo snel over rijdt (js/kar.js); de mensen lopen er niet sneller over (c1: hun gedeelde velden in
// js/lopen.js tellen elke tegel even zwaar, en dat komt pas als de proef het vraagt).
//
// - Je legt een weg zoals een veld (a): klik het begin en dan het eind, en het spel trekt de kortste weg ertussen, recht en
//   haaks (T.planWeg): schuin raken twee tegels elkaar alleen op een hoek, en dan is het geen band zand. Een stuk weg dat
//   er al ligt, neemt hij graag mee. Je ziet hem voor je klikt (js/main.js, js/tekenen.js).
// - Hij kost alleen werk (b): de bouwers rooien eerst wat in de weg staat (zoals bij een gebouw, T.BOUWEN_INSTELLINGEN), en
//   leggen dan `werkPerTegel` werkdagen per tegel, van het begin naar het eind, zodat je de weg ziet groeien. Een weg in
//   aanleg (`D.wegwerk`) is een bouwplaats zoals een gebouw (js/bouwen.js: wie geen werk heeft, bouwt mee, na de gebouwen);
//   het hout van wat ze rooien, dragen ze zelf naar de opslag (geen stapel: een weg heeft geen deur).
// - Een gelegde weg is een tegel in `w.wegen` (tegelnummers, T.tegelNummer). T.opPad (js/wereld.js) telt hem mee, net als
//   de weg van de kaart (d): daar wordt niet op gebouwd, en de paadjes van de deuren sluiten erop aan (js/paden.js), dat hem
//   ook als zand tekent.
// - Afbreken (e, de knop in het bouwmenu, js/afbreken.js): een tegel weg wordt weer gras (T.haalWegWeg).
// Regels zonder scherm, dus te toetsen (test/wegen.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.WEGEN_INSTELLINGEN = {
    // Zoveel werkdagen kost een tegel weg, na het rooien (Marcel, 14 okt: "b ja"): een weg van 20 tegels is twee werkdagen.
    werkPerTegel: 0.1,
    // Zoveel keer zo snel rijdt de ossenkar over een weg (de weg van de kaart, het plein en wat jij legt; "c1").
    karSneller: 2,
    // Zo lang is een weg die je in één keer legt hooguit, in tegels.
    langst: 60,
    // Een stuk weg dat er al ligt, kost bij het zoeken zoveel als een nieuwe tegel: zo neemt een nieuwe weg het mee.
    alWegKost: 0.5,
  };
  const IN = () => T.WEGEN_INSTELLINGEN;

  // ---------------------------------------------------------------------------------------------
  // De kar op de weg
  // ---------------------------------------------------------------------------------------------

  // Hoe lang de kar over een stap naar tegel (x, y) doet, als deel van een stap over gras: op een weg 1 / karSneller. Eén
  // vraag voor de weg die hij zoekt (T.zoekRoute, js/lopen.js), hoe lang de rit duurt (js/kar.js) en hoe snel je hem ziet
  // rijden (js/anim.js).
  T.karKostOp = (w, x, y) => (T.opPad(w, x, y) ? 1 / IN().karSneller : 1);
  // Het goedkoopste wat een stap kost: voor de schatting van A* (js/pad.js), die nooit meer mag zeggen dan het is.
  T.karKostMin = () => Math.min(1, 1 / IN().karSneller);

  // ---------------------------------------------------------------------------------------------
  // Een weg plannen
  // ---------------------------------------------------------------------------------------------

  // Een tegel van een weg die de bouwers nog leggen (D.wegwerk), of null.
  const IN_AANLEG = new WeakMap(); // weg → Set van tegelnummers
  T.wegKomtOp = function (D, x, y) {
    const n = T.tegelNummer(x, y);
    for (const weg of D.wegwerk || []) {
      let s = IN_AANLEG.get(weg);
      if (!s) IN_AANLEG.set(weg, (s = new Set(weg.plekken.map((t) => T.tegelNummer(t.x, t.y)))));
      if (s.has(n)) return weg;
    }
    return null;
  };

  // Kan er een weg over tegel (x, y)? null als ja (ook als er al een weg ligt), anders de reden. Binnen het bouwbereik, op
  // land dat je kent, niet op een veld, een wijngaard of een gebouw (ook niet een dat er nog komt), en niet op iets vasts
  // (water, een rots); een boom of een struik rooien de bouwers.
  function waaromGeenWegOp(D, x, y) {
    const w = D.wereld;
    const r = { x, y, b: 1, h: 1 };
    const buiten = T.waaromBuitenBouwBereik(D, r) || T.waaromOnbekendLand(D, r);
    if (buiten) return buiten;
    if (T.opPad(w, x, y)) return null;
    if (T.veldOp(w, x, y)) return T.t('There is a field there.');
    if (T.wijngaardOp(D, x, y)) return T.t('There is a vineyard there.');
    const komt = T.bouwplaatsOp(D, x, y);
    if (komt) return T.t('{gebouw} is already coming here.', { gebouw: T.hoofdletter(T.eenNaam(T.GEBOUWEN[komt.soort].naam)) });
    if (T.gebouwOp(D, x, y)) return T.t('There is a building there.');
    if (T.isVast(w, x, y) && !T.ontginWerkOp(w, x, y)) return T.t('A road cannot go there.');
    return null;
  }
  T.waaromGeenWegOp = waaromGeenWegOp;

  // De weg van a naar b, recht en haaks: de tegels van a tot en met b, of null als er geen is. De kortste (een stuk weg dat
  // er al ligt telt voor alWegKost), en van twee even korte die met de minste bochten. Hij zoekt in het vak om a en b met
  // een rand erom, niet over de hele kaart.
  const RAND = 8;
  const DX = [1, 0, -1, 0];
  const DY = [0, 1, 0, -1];
  const BOCHT = 0.01;
  T.trekWeg = function (D, a, b) {
    const w = D.wereld;
    const x0 = Math.min(a.x, b.x) - RAND;
    const y0 = Math.min(a.y, b.y) - RAND;
    const B = Math.abs(a.x - b.x) + 1 + 2 * RAND;
    const H = Math.abs(a.y - b.y) + 1 + 2 * RAND;
    const N = B * H;
    const mag = new Int8Array(N); // 0 nog niet gevraagd, 1 ja, -1 nee
    const magOp = (x, y) => {
      const i = (y - y0) * B + (x - x0);
      if (!mag[i]) mag[i] = waaromGeenWegOp(D, x, y) ? -1 : 1;
      return mag[i] === 1;
    };
    if (!magOp(a.x, a.y) || !magOp(b.x, b.y)) return null;
    const kost = new Float64Array(N * 4).fill(Infinity);
    const van = new Int32Array(N * 4).fill(-1);
    const hoop = []; // [kost, toestand], de goedkoopste bovenaan
    const erbij = (k, s) => {
      hoop.push([k, s]);
      for (let i = hoop.length - 1; i > 0;) {
        const o = (i - 1) >> 1;
        if (hoop[o][0] <= hoop[i][0]) break;
        [hoop[o], hoop[i]] = [hoop[i], hoop[o]];
        i = o;
      }
    };
    const eraf = () => {
      const top = hoop[0];
      const laatste = hoop.pop();
      if (hoop.length) {
        hoop[0] = laatste;
        for (let i = 0; ;) {
          const l = 2 * i + 1;
          const r = l + 1;
          let m = i;
          if (l < hoop.length && hoop[l][0] < hoop[m][0]) m = l;
          if (r < hoop.length && hoop[r][0] < hoop[m][0]) m = r;
          if (m === i) break;
          [hoop[m], hoop[i]] = [hoop[i], hoop[m]];
          i = m;
        }
      }
      return top;
    };
    const ia = (a.y - y0) * B + (a.x - x0);
    for (let r = 0; r < 4; r++) {
      kost[ia * 4 + r] = 0;
      erbij(0, ia * 4 + r);
    }
    const ib = (b.y - y0) * B + (b.x - x0);
    let eind = -1;
    while (hoop.length) {
      const [k, s] = eraf();
      if (k > kost[s]) continue;
      const i = s >> 2;
      if (i === ib) {
        eind = s;
        break;
      }
      const x = x0 + (i % B);
      const y = y0 + Math.floor(i / B);
      for (let r = 0; r < 4; r++) {
        const nx = x + DX[r];
        const ny = y + DY[r];
        if (nx < x0 || ny < y0 || nx >= x0 + B || ny >= y0 + H || !magOp(nx, ny)) continue;
        if (w.hoogte && !T.kanStappen(w, x, y, nx, ny)) continue;
        const j = (ny - y0) * B + (nx - x0);
        const nk = k + (T.opPad(w, nx, ny) ? IN().alWegKost : 1) + (r !== (s & 3) ? BOCHT : 0);
        if (nk < kost[j * 4 + r]) {
          kost[j * 4 + r] = nk;
          van[j * 4 + r] = s;
          erbij(nk, j * 4 + r);
        }
      }
    }
    if (eind < 0) return null;
    const plekken = [];
    for (let s = eind; s >= 0; s = van[s]) {
      const i = s >> 2;
      const t = { x: x0 + (i % B), y: y0 + Math.floor(i / B) };
      const vorige = plekken[0];
      if (!vorige || vorige.x !== t.x || vorige.y !== t.y) plekken.unshift(t);
    }
    return plekken;
  };

  // Een weg van a naar b, zoals hij er zou komen: { tegels, nieuw, werk, rooien, reden }. `tegels` is de hele weg, `nieuw`
  // wat er nog gelegd moet worden (niet wat er al ligt of al komt), `werk` de werkdagen zonder het rooien, en `rooien` de
  // tegels van `nieuw` waar eerst iets weg moet. Een reden als het niet kan. Eén vraag voor de muis (js/main.js) en de klik
  // (T.legWeg).
  T.planWeg = function (D, a, b) {
    const w = D.wereld;
    const leeg = { plekken: [], nieuw: [], werk: 0, rooien: [] };
    const bij = waaromGeenWegOp(D, a.x, a.y) || waaromGeenWegOp(D, b.x, b.y);
    if (bij) return { ...leeg, reden: bij };
    if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + 1 > IN().langst) return { ...leeg, reden: T.t('A road is at most {n} tiles at a time.', { n: IN().langst }) };
    const plekken = T.trekWeg(D, a, b);
    if (!plekken) return { ...leeg, reden: T.t('A road cannot go there.') };
    if (plekken.length > IN().langst) return { ...leeg, plekken, reden: T.t('A road is at most {n} tiles at a time.', { n: IN().langst }) };
    const nieuw = plekken.filter((t) => !T.opPad(w, t.x, t.y) && !T.wegKomtOp(D, t.x, t.y));
    const rooien = nieuw.filter((t) => T.ontginWerkOp(w, t.x, t.y));
    const werk = Math.round(nieuw.length * IN().werkPerTegel * 100) / 100;
    if (plekken.length < 2) return { plekken, nieuw, werk, rooien, reden: T.t('Click where the road begins, then where it ends.') };
    if (!nieuw.length) return { plekken, nieuw, werk, rooien, reden: T.t('There is a road there already.') };
    return { plekken, nieuw, werk, rooien, reden: null };
  };

  // Wat er gerooid wordt, in woorden, zoals bij een gebouw: "3 trees (+15 wood)".
  T.rooiWoordenVanWeg = function (D, plekken) {
    const bomen = plekken.filter((t) => T.ontginWerkOp(D.wereld, t.x, t.y) === 'hakken').length;
    return T.rooiWoorden({ bomen, struiken: plekken.length - bomen }, T.rooiHoutPerBoom(D));
  };

  // Een weg leggen (de tweede klik, js/main.js): de bouwers leggen hem (D.wegwerk), of zonder bouwers (het oude begin) ligt
  // hij er meteen. Geeft { gelukt, weg, bericht } of { gelukt: false, reden }.
  T.legWeg = function (D, a, b) {
    const plan = T.planWeg(D, a, b);
    if (plan.reden) return { gelukt: false, reden: plan.reden };
    if (!T.bouwenMetHanden(D)) {
      for (const t of plan.nieuw) legTegel(D.wereld, t.x, t.y);
      return { gelukt: true, weg: null, bericht: T.t('The road is laid.') };
    }
    const weg = {
      soort: 'weg', plekken: plan.nieuw.map((t) => ({ x: t.x, y: t.y })), af: 0, klaar: false,
      bouw: { werk: plan.werk, gedaan: 0, tegoed: 0, vandaag: 0, hout: 0 },
    };
    (D.wegwerk || (D.wegwerk = [])).push(weg);
    T.nieuweBouwplaats(D, weg);
    const n = plan.nieuw.length;
    const rooien = plan.rooien.length ? ' ' + T.t('The builders first clear {wat}.', { wat: T.rooiWoordenVanWeg(D, plan.rooien) }) : '';
    return { gelukt: true, weg, bericht: T.t('A road of {n|one tile|# tiles}: {werk} workdays, for whoever has no other work.', { n, werk: plan.werk }) + rooien };
  };

  // ---------------------------------------------------------------------------------------------
  // De bouwers aan de weg (js/bouwen.js)
  // ---------------------------------------------------------------------------------------------

  // De tegels die nog gelegd moeten worden, van het begin af.
  T.wegNogTeDoen = (weg) => weg.plekken.slice(weg.af);

  // Werk aan een weg (in werkdagen), tegel voor tegel van het begin af: eerst rooien wat er staat, dan de tegel leggen. Een
  // tegel waar intussen een weg ligt, of waar geen weg meer kan (er kwam iets anders), slaat hij over. Is de laatste tegel
  // gelegd, dan is de weg af. Geeft het werk dat bleef liggen: niets, want een weg wacht nergens op.
  T.werkAanWeg = function (D, weg, werk) {
    const w = D.wereld;
    const B = weg.bouw;
    const R = T.BOUWEN_INSTELLINGEN;
    B.tegoed += werk;
    while (weg.af < weg.plekken.length) {
      const t = weg.plekken[weg.af];
      if (T.opPad(w, t.x, t.y) || waaromGeenWegOp(D, t.x, t.y)) {
        weg.af++;
        continue;
      }
      const rooi = T.ontginWerkOp(w, t.x, t.y);
      if (rooi) {
        const kost = rooi === 'hakken' ? R.rooiBoom : R.rooiStruik;
        if (B.tegoed + 1e-9 < kost) break;
        B.tegoed -= kost;
        if (rooi === 'hakken') B.hout += T.rooiHoutPerBoom(D);
        T.rooiTegel(D, t, null); // zonder gebouw: het hout gaat meteen de opslag in (js/kar.js, T.opStapel)
        continue;
      }
      if (B.tegoed + 1e-9 < IN().werkPerTegel) break;
      B.tegoed -= IN().werkPerTegel;
      B.gedaan = Math.min(B.werk, B.gedaan + IN().werkPerTegel);
      legTegel(w, t.x, t.y);
      weg.af++;
    }
    if (weg.af >= weg.plekken.length) wegIsAf(D, weg);
    return 0;
  };

  function wegIsAf(D, weg) {
    const i = (D.wegwerk || []).indexOf(weg);
    if (i >= 0) D.wegwerk.splice(i, 1);
    weg.klaar = true;
    T.zeg(D, weg.bouw.hout
      ? T.t('The road is finished (+{hout|# log|# logs} from clearing it).', { hout: weg.bouw.hout })
      : T.t('The road is finished.'), 'goed');
  }

  // ---------------------------------------------------------------------------------------------
  // De tegels zelf
  // ---------------------------------------------------------------------------------------------

  function legTegel(w, x, y) {
    (w.wegen || (w.wegen = new Set())).add(T.tegelNummer(x, y));
    T.kaartVeranderd(w, { x1: x, y1: y, x2: x, y2: y });
  }
  T.legWegTegel = legTegel; // voor de toetsen en het proefdorp

  // Is dit een weg die jij legde (niet die van de kaart, en niet het plein)?
  T.opGelegdeWeg = (w, x, y) => !!(w.wegen && w.wegen.has(T.tegelNummer(x, y)));

  // Een tegel weg afbreken (js/afbreken.js): hij wordt weer gras.
  T.haalWegWeg = function (w, x, y) {
    if (!T.opGelegdeWeg(w, x, y)) return false;
    w.wegen.delete(T.tegelNummer(x, y));
    T.kaartVeranderd(w, { x1: x, y1: y, x2: x, y2: y });
    return true;
  };

  // Een weg in aanleg afbreken: wat er nog niet ligt, komt niet; wat er al ligt, blijft liggen.
  T.stopWegwerk = function (D, weg) {
    const i = (D.wegwerk || []).indexOf(weg);
    if (i < 0) return false;
    D.wegwerk.splice(i, 1);
    for (const p of (D.bewoners && D.bewoners.mensen) || []) if (p.bouwt === weg) p.bouwt = null;
    return true;
  };
})(globalThis.Spel = globalThis.Spel || {});
