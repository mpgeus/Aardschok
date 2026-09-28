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
// op een tegel, een gebouw of een mens) en drukt op de knoppen van het venster dat dan opengaat. Zo tellen
// de getuigen zoals in het spel (die bepaalt het venster van de plek, js/hud.js), en ziet de inner wat hij
// ziet waar hij echt loopt. Alleen waar een knop een gesprek opent (de heer, de marskramer) of een
// geschenk geeft, roept hij hetzelfde gevolg aan als die keuze in het gesprek (T.doeGevolg).
//
// Wat er gebeurt, schrijft hij op zonder het te veranderen: een paar regels van het spel krijgen een
// luisteraar (luister, onderaan), en elke eerste van de maand een stand.
//
// De vier spelers (Marcel koos ze bij vraag 45):
//   braaf   geeft de heer alles wat hij vraagt;
//   lui30   zet 30% van het graan en het goud weg, overdag, in de kelders die het dichtst bij zijn: de dag
//           vóór de inner komt en op 1 slachtmaand. Hij loopt niet mee en haalt niets terug (zoals B van
//           27 sep);
//   lui60   hetzelfde met 60% (zoals C van 27 sep);
//   slim    zet 60% weg, 's nachts als niemand kijkt en niet bij de roddelaar, bouwt een kapel, praat met
//           de inner en geeft hem 10 goud, loopt met hem waar hij niets nieuws ziet, leidt de soldaten langs
//           lege kelders, verkoopt graan als het goud voor de heer tekortschiet, betaalt de heer 90% (dan
//           merkt hij niets), en haalt na Sint-Maarten alles terug.
// Alle vier luisteren naar de winter: zegt het dorp dat het hout de winter niet haalt, dan bouwen ze een
// houthakker.
(function (T) {
  'use strict';

  const EIND = 390; // 1 grasmaand van het tweede jaar
  const STAP = 0.25; // schermseconden per stap; op 30× ruim een half uur
  const DAG_INNER = 164; // 15 oogstmaand
  const DAG_HEER = 250; // 11 slachtmaand, Sint-Maarten
  const DAG_SLACHT = 240; // 1 slachtmaand

  let boek = null; // wat er gebeurde, voor speeltest.cjs
  const bezig = {}; // welk venster de speler zelf openhoudt: dat sluit beantwoord() niet

  const S = () => T.S;
  const dagNu = () => S().kalender.dag;
  const uurNu = () => (dagNu() % 1) * 24;
  const datum = (d = dagNu()) => T.datumVanDag(d).tekst;
  const heel = (x) => Math.round(x * 10) / 10;
  const argwaan = () => (S().inner && S().inner.argwaan) || 0; // S.inner komt pas als hij er voor het eerst toe doet

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
  // de tijd, en dan de boekhouding van een nieuwe dag. Tijdens het bezoek van de inner en de heer op 3×
  // (het spel zet hem dan zelf op 1×), zodat meelopen fijn genoeg gaat; anders op 30×.
  async function stap(sec = STAP) {
    beantwoord();
    const b = S().inner && S().inner.bezoek;
    const h = S().heer && S().heer.bezoek;
    const scène = (b && b.wezen && !b.weg) || (h && !h.weg && h.wezens && h.wezens.length);
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
      if (dagNu() >= tot || S().einde) return false;
      await stap(sec);
    }
    return false;
  }

  async function wachtUren(uren) {
    const tot = dagNu() + uren / 24;
    await wachtTot(() => dagNu() >= tot, uren + 1, STAP);
  }

  // Wat vanzelf opengaat: de brief van de heer (1 wijnmaand) en het slachten (1 slachtmaand). De brief
  // lees je en sluit je; bij het slachten neem je het voorstel van het spel (zo weinig als kan, zodat
  // het hooi de winter haalt). Een venster dat de speler niet zelf openhoudt, gaat dicht.
  function beantwoord() {
    const s = S();
    if (T.ui.briefOpen()) {
      if (s.kalender.dag > 1) boek.brief = { dag: heel(s.kalender.dag), datum: datum(), eis: eisKort(T.eisVanDeHeer(s)) };
      if (!klik('#brief [data-actie="sluit"]')) T.ui.sluitBrief(s);
    }
    if (T.ui.slachtenOpen()) {
      if (!klik('#slachten [data-actie="slacht"]')) klik('#slachten [data-actie="sluit"]');
      if (T.ui.slachtenOpen()) T.ui.sluitSlachten(s);
    }
    if (s.modus === 'verstoppen' && !bezig.verstoppen) T.ui.sluitVerstoppen(s);
    if (s.modus === 'handel' && !bezig.handel) T.ui.sluitHandel(s);
    if (s.modus === 'heer' && !bezig.heer) T.ui.sluitHeer(s);
    if (s.modus === 'dialoog' && !bezig.praten) T.sluitDialoog(s);
    if (s.modus === 'velden') T.ui.sluitVelden(s);
    if (s.modus === 'spelregels') T.ui.sluitSpelregels(s);
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

  // Een tegel naast een gebouw, buiten zijn voet: daar kun je staan zonder het gebouw aan te klikken.
  function naastGebouw(g, van) {
    const w = S().wereld;
    const v = T.voetVanGebouw(g);
    const binnen = (x, y) => x >= v.x && x < v.x + v.b && y >= v.y && y < v.y + v.h;
    let beste = null;
    let bij = Infinity;
    for (let y = v.y - 1; y <= v.y + v.h; y++) {
      for (let x = v.x - 1; x <= v.x + v.b; x++) {
        if (binnen(x, y) || !T.isBegaanbaar(w, x, y) || T.gebouwOp(S(), x, y)) continue;
        const a = Math.hypot(x - van.x, y - van.y);
        if (a < bij) {
          bij = a;
          beste = { x, y };
        }
      }
    }
    return beste;
  }

  const schoutTegel = () => T.tegelVan(S().schout);

  // Hoe ver een tegel van de rand van een gebouw ligt (zoals de soldaten het meten, js/doorzoeken.js).
  function afstandTot(g, x, y) {
    const v = T.voetVanGebouw(g);
    return Math.max(Math.max(v.x - x, 0, x - (v.x + v.b - 1)), Math.max(v.y - y, 0, y - (v.y + v.h - 1)));
  }

  // ── Verstoppen en terughalen, met de knoppen van het venster ──────────────────────────────────────
  function plekken() {
    return T.verstopPlekken(S()).map((p) => Object.assign({}, p, { ligt: p.gebouw.verstopt || { graan: 0, goud: 0 } }));
  }

  // Loop naar de plek (een klik op het gebouw) en wacht tot het venster opengaat. Lukt het niet, dan
  // staat in `waarom` wat er aan de hand was.
  let waarom = '';
  async function openPlek(g) {
    const kan = T.verstopHandeling(S(), T.verstopPlekVan(S(), g));
    if (!kan.kan) {
      waarom = kan.reden || kan.tekst;
      return false;
    }
    bezig.verstoppen = true;
    const v = T.voetVanGebouw(g);
    const h = T.handelingVerkennen(S(), { x: v.x, y: v.y });
    const voor = boek.berichten.length;
    const kwam = await klikOp({ x: v.x, y: v.y }, 6, () => S().modus === 'verstoppen');
    if (S().modus !== 'verstoppen') {
      const rand = T.randVanGebouw(S(), g);
      const nieuw = boek.berichten.slice(voor).map((b) => b.tekst).join(' / ');
      waarom = `${h ? h.tekst : 'geen klik'}; ${kwam ? 'hij kwam aan' : 'hij kwam niet aan'} op ${JSON.stringify(schoutTegel())}, de rand is ${JSON.stringify(rand)}, modus ${S().modus}${nieuw ? `; ${nieuw}` : ''}`;
      bezig.verstoppen = false;
      return false;
    }
    return true;
  }

  function sluitPlek() {
    if (!klik('#verstoppen [data-actie="sluit"]')) T.ui.sluitVerstoppen(S());
    bezig.verstoppen = false;
  }

  // "Zet 10 weg" (graan) of "Zet 5 weg" (goud), zo vaak als nodig: wat een speler ook doet.
  function zetWeg(wat, n) {
    const stapje = wat === 'graan' ? 10 : 5;
    let gedaan = 0;
    for (let i = 0; i < 200 && gedaan + stapje <= n; i++) {
      if (!klik(`#verstoppen button[data-actie="weg"][data-wat="${wat}"][data-n="${stapje}"]`)) break;
      gedaan += stapje;
    }
    return gedaan;
  }

  // "Alles terug".
  function haalAllesTerug(wat) {
    const knoppen = [...document.querySelectorAll(`#verstoppen button[data-actie="terug"][data-wat="${wat}"]`)];
    const alles = knoppen.sort((a, b) => Number(b.dataset.n) - Number(a.dataset.n))[0];
    const n = alles ? Number(alles.dataset.n) : 0;
    if (!alles || alles.disabled || !(n > 0)) return 0;
    alles.click();
    return n;
  }

  // Een plan uitvoeren: [{ p, graan, goud }]. Met `stil` wacht de speler tot niemand kijkt (zoals het
  // venster zegt, T.getuigenVan), een uur per keer, hooguit `stil` keer.
  async function voerUit(plan, stil = 0) {
    let graan = 0;
    let goud = 0;
    for (const { p, graan: gr, goud: go } of plan) {
      let open = await openPlek(p.gebouw);
      for (let i = 0; open && i < stil && T.getuigenVan(S(), p.gebouw).length; i++) {
        sluitPlek();
        await wachtUren(1);
        open = await openPlek(p.gebouw);
      }
      if (!open) {
        daad(`kon niet bij ${p.naam} (${waarom})`);
        continue;
      }
      const kijkers = T.getuigenVan(S(), p.gebouw).length;
      const a = zetWeg('graan', gr);
      const b = zetWeg('goud', go);
      sluitPlek();
      graan += a;
      goud += b;
      daad(`zet ${a} graan en ${b} goud weg bij ${p.naam}${kijkers ? `, en ${kijkers} zag het` : ''}`);
    }
    return { graan, goud };
  }

  async function haalAllesOp(stil = 0) {
    for (const p of plekken().filter((q) => q.ligt.graan > 0 || q.ligt.goud > 0)) {
      let open = await openPlek(p.gebouw);
      for (let i = 0; open && i < stil && T.getuigenVan(S(), p.gebouw).length; i++) {
        sluitPlek();
        await wachtUren(1);
        open = await openPlek(p.gebouw);
      }
      if (!open) {
        daad(`kon niet bij ${p.naam} om terug te halen (${waarom})`);
        continue;
      }
      const a = haalAllesTerug('graan');
      const b = haalAllesTerug('goud');
      sluitPlek();
      daad(`haalt ${Math.round(a)} graan en ${Math.round(b)} goud terug bij ${p.naam}`);
    }
  }

  // Verdeel graan en goud over plekken in deze volgorde: graan tot de kelder vol is, goud in de eerste.
  function verdeel(lijst, graan, goud) {
    const plan = [];
    let restGraan = graan;
    let restGoud = goud;
    for (const p of lijst) {
      if (restGraan <= 0 && restGoud <= 0) break;
      const ruimte = Math.max(0, Math.floor((p.plaats - (p.ligt.graan || 0)) / 10) * 10);
      const gr = Math.min(restGraan, ruimte);
      const go = restGoud;
      if (gr > 0 || go > 0) plan.push({ p, graan: gr, goud: go });
      restGraan -= gr;
      restGoud -= go;
    }
    return plan;
  }

  const deelVan = (wat, deel) => {
    const stapje = wat === 'graan' ? 10 : 5;
    return Math.floor(((S().voorraad[wat] || 0) * deel) / stapje) * stapje;
  };

  // ── Bouwen ──────────────────────────────────────────────────────────────────────────────────────
  function huisVanDeSchout() {
    return plekken().find((p) => p.vanSchout);
  }

  // Waar het past, zo dicht mogelijk bij de deur van de schout (zoals het bouwmenu: T.gebouwPast).
  function bouw(soort) {
    const s = S();
    const huis = huisVanDeSchout();
    const midden = huis ? T.deurVan(s.wereld, huis.gebouw) : schoutTegel();
    for (let r = 3; r < 45; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = midden.x + dx;
          const y = midden.y + dy;
          if (!T.gebouwPast(s, soort, x, y)) continue;
          const u = T.plaatsGebouw(s, soort, x, y);
          boek.gebouwd.push({ dag: heel(dagNu()), datum: datum(), soort, gelukt: u.gelukt, reden: u.reden || null });
          daad(u.gelukt ? `bouwt een ${soort}` : `wil een ${soort} bouwen, maar: ${u.reden}`);
          return u.gelukt;
        }
      }
    }
    daad(`vindt geen plek voor een ${soort}`);
    return false;
  }

  // De winter: zegt het dorp dat het hout hem niet haalt, dan een houthakker (alle vier de spelers).
  let gelezen = 0;
  function luisterNaarDeWinter() {
    for (; gelezen < boek.berichten.length; gelezen++) {
      const b = boek.berichten[gelezen];
      if (/Het hout haalt \d+ van de \d+ dagen/.test(b.tekst)) bouw('houthakker');
    }
  }

  // ── De heer betalen ───────────────────────────────────────────────────────────────────────────
  // Naar hem toe (zijn gesprek), en dan het venster, zoals de keuze in zijn gesprek het opent. Met
  // `deel` 1 de knop "Alles wat hij vraagt"; met 0,9 schuift de speler tot het venster 90% zegt.
  async function betaal(deel) {
    const s = S();
    const heer = s.heer.bezoek.wezens && s.heer.bezoek.wezens[0];
    if (heer) {
      bezig.praten = true;
      await klikOp({ wezen: heer }, 3, () => S().modus === 'dialoog');
      bezig.praten = false;
    }
    T.sluitDialoog(s);
    bezig.heer = true;
    T.doeGevolg(s, { heer: true });
    if (s.modus !== 'heer') {
      bezig.heer = false;
      daad('kan de heer niet betalen: het venster ging niet open');
      return;
    }
    const eis = T.eisVanDeHeer(s);
    if (deel < 1) {
      const geef = {};
      for (const wat of eis.volgorde) {
        const heb = Math.floor(s.voorraad[wat] || 0);
        geef[wat] = Math.min(heb, wat === 'goud' ? Math.ceil(deel * (eis.per.goud || 0)) : Math.ceil(deel * eis.per[wat]));
      }
      // Tekort aan iets anders: goud neemt hij in de plaats, tot het venster 90% zegt.
      for (let i = 0; i < 500 && T.gevolgVanBetaling(s, geef, eis).deel < deel - 1e-9 && geef.goud < Math.floor(s.voorraad.goud || 0); i++) geef.goud++;
      for (const wat of eis.volgorde) {
        const schuif = document.querySelector(`#heer input[type="range"][data-wat="${wat}"]`);
        if (!schuif) continue;
        schuif.value = String(geef[wat]);
        schuif.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    if (!klik('#heer [data-actie="betaal"]')) daad('kan niet betalen: de knop staat uit');
    // De schandpaal: de schout zelf, als dat mag (het dorp neemt het hem niet kwalijk).
    if (s.heer.bezoek && s.heer.bezoek.schandpaal) {
      if (!klik('#heer .paal-keuze[data-wie="schout"]')) klik('#heer .paal-keuze');
    }
    if (s.modus === 'heer') T.ui.sluitHeer(s);
    bezig.heer = false;
  }

  // ── De inner bespelen (de slimme speler) ─────────────────────────────────────────────────────────
  // Wat de inner van tegel (x, y) voor het eerst zou zien: een gebouw telt als tien akkertegels. Met
  // dezelfde regels als hij kijkt (js/inner.js: T.zietTegel, zijn zicht, en alleen gebouwen met een
  // tekening).
  function nieuwVoorDeInner(x, y) {
    const s = S();
    const b = s.inner.bezoek;
    const w = s.wereld;
    const zicht = T.INNER_INSTELLINGEN.zicht;
    const van = { x, y };
    let n = 0;
    for (const g of s.gebouwen) {
      if (b.gebouwen.has(g) || !(T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].tekening)) continue;
      const v = T.voetVanGebouw(g);
      if (Math.max(v.x - x, x - (v.x + v.b), v.y - y, y - (v.y + v.h)) > zicht) continue;
      let ziet = false;
      for (let ty = v.y; ty < v.y + v.h && !ziet; ty++) for (let tx = v.x; tx < v.x + v.b && !ziet; tx++) ziet = T.zietTegel(w, van, { x: tx, y: ty }, zicht);
      if (ziet) n += 10;
    }
    for (const akker of w.akkers || []) {
      for (const t of T.akkerTegels(akker)) {
        if (Math.abs(t.x - x) > zicht || Math.abs(t.y - y) > zicht) continue;
        if (!b.tegels.has(t.x + ',' + t.y) && T.zietTegel(w, van, t, zicht)) n += 1;
      }
    }
    return n;
  }

  // Twee tegels in de buurt waartussen de inner niets nieuws ziet, ook niet vlak ernaast (hij loopt naast
  // de schout). Geeft [a, b], of de twee die het minst laten zien.
  function blindePlekken() {
    const w = S().wereld;
    const h = schoutTegel();
    const score = new Map();
    const k = (x, y) => x + ',' + y;
    for (let y = h.y - 14; y <= h.y + 14; y++) {
      for (let x = h.x - 14; x <= h.x + 14; x++) if (T.isBegaanbaar(w, x, y) && !T.gebouwOp(S(), x, y)) score.set(k(x, y), nieuwVoorDeInner(x, y));
    }
    const rond = (x, y) => {
      let m = score.get(k(x, y));
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) m = Math.max(m, score.has(k(x + dx, y + dy)) ? score.get(k(x + dx, y + dy)) : 0);
      return m;
    };
    const lijst = [...score.keys()].map((s) => {
      const [x, y] = s.split(',').map(Number);
      return { x, y, n: rond(x, y), a: T.afstand(h, { x, y }) };
    });
    lijst.sort((p, q) => p.n - q.n || p.a - q.a);
    const a = lijst[0];
    const b = lijst.find((p) => p.n <= a.n && T.afstand(a, p) >= 5 && T.afstand(a, p) <= 9) || lijst.find((p) => T.afstand(a, p) >= 4);
    return { a, b };
  }

  async function bespeelDeInner() {
    const s = S();
    await wachtTot(() => s.inner && s.inner.bezoek, 12, STAP);
    const b = s.inner && s.inner.bezoek;
    if (!b) {
      daad('de inner kwam niet');
      return;
    }
    // Wachten waar hij binnenkomt: bij de weg, een paar tegels het dorp in.
    const weg = T.wegInEnUit(s.wereld);
    const wacht = weg && [[0, -3], [-3, 0], [3, 0], [0, 3], [2, -2], [-2, 2]].map(([dx, dy]) => ({ x: weg.x + dx, y: weg.y + dy })).find((t) => T.isBegaanbaar(s.wereld, t.x, t.y));
    if (wacht) await klikOp(wacht);
    daad('wacht bij de weg op de inner');
    await wachtTot(() => b.wezen || b.weg, 12, STAP);
    if (!b.wezen || b.weg) return;
    // Praten: zolang het gesprek openstaat, staat hij stil en kijkt hij niet, en de dag loopt door.
    bezig.praten = true;
    await klikOp({ wezen: b.wezen }, 3, () => s.modus === 'dialoog' || b.weg);
    if (s.modus === 'dialoog') {
      daad('praat met de inner');
      await wachtTot(() => b.uitgepraat || s.modus !== 'dialoog' || b.weg, 5, STAP);
    }
    bezig.praten = false;
    T.sluitDialoog(s);
    boek.inner.gepraatUren = heel(b.gepraat || 0);
    // Het geschenk, zoals de keuze in zijn gesprek (doe: { omkopen: 10 }); is er geen 10, dan 5.
    const geschenk = [10, 5].find((n) => (s.voorraad.goud || 0) >= n);
    if (geschenk && !b.weg) {
      T.doeGevolg(s, { omkopen: geschenk });
      daad(`geeft de inner ${geschenk} goud`);
    } else daad('heeft geen goud voor een geschenk');
    // Meelopen waar hij niets nieuws ziet, heen en weer, tot hij gaat.
    const { a, b: c } = blindePlekken();
    daad(`loopt met de inner heen en weer bij ${a.x},${a.y} (daar ziet hij ${a.n} nieuw)`);
    for (let ronde = 0; ronde < 80 && !b.weg && !s.einde; ronde++) {
      const e = b.wezen;
      if (e && T.afstand(schoutTegel(), T.tegelVan(e)) > 2) await klikOp({ x: e.tx, y: e.ty }, 1);
      await klikOp({ x: a.x, y: a.y }, 2);
      if (b.weg) break;
      await klikOp({ x: c.x, y: c.y }, 2);
    }
  }

  // ── De soldaten leiden (de slimme speler) ────────────────────────────────────────────────────────
  // Hij houdt drie plekken leeg: zijn eigen kelder (daar kijken ze het eerst), die van de roddelaar en
  // die van de vrome (die weigert toch), en vult aan met de plekken die het dichtst bij zijn huis staan.
  function legePlekken() {
    const huis = huisVanDeSchout();
    const van = huis ? T.deurVan(S().wereld, huis.gebouw) : schoutTegel();
    const alle = plekken().filter((p) => p.gebouw.soort !== 'kapel');
    const leeg = alle.filter((p) => p.vanSchout || p.karakter === 'roddelaar' || p.weigert);
    const rest = alle.filter((p) => !leeg.includes(p)).sort((p, q) => T.afstand(van, T.deurVan(S().wereld, p.gebouw)) - T.afstand(van, T.deurVan(S().wereld, q.gebouw)));
    while (leeg.length < 3 && rest.length) leeg.push(rest.shift());
    return leeg.map((p) => p.gebouw);
  }

  // Hoeveel volle plekken een pad vlak passeert (drie tegels, want de soldaten lopen naast hem).
  function volLangs(pad) {
    const vol = plekken().filter((p) => p.ligt.graan > 0 || p.ligt.goud > 0);
    return vol.filter((p) => pad.some((t) => afstandTot(p.gebouw, t.x, t.y) <= 3)).length;
  }

  async function leidDeSoldaten() {
    const s = S();
    const leeg = legePlekken();
    boek.soldaten.leeg = leeg.map((g) => T.verstopPlekVan(s, g).naam);
    // Vooraf naast de eerste lege plek staan.
    const eerst = naastGebouw(leeg[0], schoutTegel());
    if (eerst) await klikOp(eerst);
    await wachtTot(() => (s.heer.bezoek && (s.heer.bezoek.zoeken || s.heer.bezoek.weg)) || boek.soldaten.hetHeleDorp, 14, STAP);
    const z = s.heer.bezoek && s.heer.bezoek.zoeken;
    if (!z || z.klaar || z.heerKiest) return;
    await wachtTot(() => z.sinds != null || z.klaar, 4, STAP);
    for (let i = 0; i < 6 && !z.klaar; i++) {
      const nog = leeg.filter((g) => !z.gedaan.includes(g));
      if (!nog.length) break;
      // De volgende lege plek waar het pad het minst langs volle plekken gaat.
      let keuze = null;
      for (const g of nog) {
        const doel = naastGebouw(g, schoutTegel());
        if (!doel) continue;
        const h = T.handelingVerkennen(s, doel);
        if (!h || !h.doe) continue;
        h.doe();
        const pad = [schoutTegel(), ...s.schout.pad];
        const vol = volLangs(pad);
        s.schout.pad = s.schout.onderweg && s.schout.pad[0] ? [s.schout.pad[0]] : [];
        if (!keuze || vol < keuze.vol || (vol === keuze.vol && pad.length < keuze.lengte)) keuze = { g, doel, vol, lengte: pad.length };
      }
      if (!keuze) break;
      if (keuze.vol) daad(`leidt de soldaten naar ${T.verstopPlekVan(s, keuze.g).naam}, langs ${keuze.vol} volle plek(ken)`);
      await klikOp(keuze.doel, 2);
      await wachtTot(() => z.gedaan.includes(keuze.g) || z.klaar, 1, STAP);
    }
  }

  // ── Graan verkopen voor het goud van de heer (de slimme speler) ─────────────────────────────────
  async function verkoopVoorDeHeer() {
    const s = S();
    const m = s.marskramer;
    const eis = T.eisVanDeHeer(s);
    const nodig = Math.ceil(0.9 * (eis.per.goud || 0)) + 2 - Math.floor(s.voorraad.goud || 0);
    if (nodig <= 0) return;
    const eet = T.etenVoorDeWinter(s, s.kalender.dag).eet || 0;
    const reserve = Math.ceil(0.9 * (eis.per.graan || 0)) + Math.ceil(eet * (DAG_HEER - s.kalender.dag)) + 20;
    const prijs = T.HANDEL_INSTELLINGEN.koopt.graan.prijs[m.bezoek];
    const pakken = Math.min(Math.ceil(nodig / prijs), Math.floor(((s.voorraad.graan || 0) - reserve) / T.HANDEL_INSTELLINGEN.koopt.graan.per));
    if (pakken <= 0) {
      daad(`zou graan verkopen voor ${nodig} goud, maar het graan is nodig`);
      return;
    }
    bezig.praten = true;
    await klikOp({ wezen: m.wezen }, 3, () => s.modus === 'dialoog');
    bezig.praten = false;
    T.sluitDialoog(s);
    bezig.handel = true;
    T.doeGevolg(s, { handel: true });
    let verkocht = 0;
    for (let i = 0; i < pakken; i++) if (klik('#handel button[data-actie="verkoop"][data-wat="graan"][data-n="1"]')) verkocht++;
    if (!klik('#handel [data-actie="sluit"]')) T.ui.sluitHandel(s);
    bezig.handel = false;
    daad(`verkoopt ${verkocht * T.HANDEL_INSTELLINGEN.koopt.graan.per} graan aan de marskramer, voor ${verkocht * prijs} goud`);
  }

  // ── De spelers ──────────────────────────────────────────────────────────────────────────────────
  const eenKeer = new Set();
  const nuEenKeer = (naam) => (eenKeer.has(naam) ? false : (eenKeer.add(naam), true));
  const dagIs = (d, vanaf = 0) => Math.floor(dagNu()) === d && uurNu() >= vanaf;
  // De heer staat op het plein en wacht ("De heer staat op het plein en wacht op je"). Wie hem eerder
  // betaalt, op de weg, krijgt geen soldaten over de vloer (opmerkingen.md, 28 sep): dat doet geen van
  // de spelers, zodat het zoeken meetelt zoals het bedoeld is.
  const heerOpHetPlein = () => T.heerWacht(S()) && S().heer.bezoek.staat;

  function lui(deel) {
    const verstop = async () => {
      const van = schoutTegel();
      const lijst = plekken().filter((p) => !p.weigert).sort((p, q) => T.afstand(van, T.randVanGebouw(S(), p.gebouw)) - T.afstand(van, T.randVanGebouw(S(), q.gebouw)));
      const r = await voerUit(verdeel(lijst, deelVan('graan', deel), deelVan('goud', deel)));
      boek.verstopt.push({ dag: heel(dagNu()), datum: datum(), graan: r.graan, goud: r.goud });
    };
    return {
      async elkeStap() {
        luisterNaarDeWinter();
        if (dagIs(DAG_INNER - 1, 10) && nuEenKeer('verstop1')) await verstop();
        if (dagIs(DAG_SLACHT, 10) && nuEenKeer('verstop2')) await verstop();
        if (heerOpHetPlein() && nuEenKeer('betaal')) await betaal(1);
      },
    };
  }

  const SPELERS = {
    braaf: {
      async elkeStap() {
        luisterNaarDeWinter();
        if (heerOpHetPlein() && nuEenKeer('betaal')) await betaal(1);
      },
    },
    lui30: lui(0.3),
    lui60: lui(0.6),
    slim: {
      async begin() {
        bouw('kapel');
      },
      async elkeStap() {
        const s = S();
        luisterNaarDeWinter();
        // De nacht vóór de dag vóór de inner: 60% weg, waar niemand kijkt, niet waar hij de soldaten heen
        // leidt. Niet de laatste nacht: vanaf middernacht van zijn dag telt het spel hem al als in het dorp,
        // en dan sjouw je niets meer (T.verstopHandeling, js/verstoppen.js; opmerkingen.md, 28 sep).
        if (dagIs(DAG_INNER - 2, 23) && nuEenKeer('verstop')) {
          const leeg = legePlekken();
          const lijst = plekken().filter((p) => !p.weigert && !leeg.includes(p.gebouw));
          const rang = (p) => (p.gebouw.soort === 'kapel' ? 1 : 0) + (p.houdt > 0 ? p.houdt * 5 : 0) + p.vinden;
          lijst.sort((p, q) => rang(p) - rang(q));
          const r = await voerUit(verdeel(lijst, deelVan('graan', 0.6), deelVan('goud', 0.6)), 2);
          boek.verstopt.push({ dag: heel(dagNu()), datum: datum(), graan: r.graan, goud: r.goud });
        }
        if (dagIs(DAG_INNER, 6) && nuEenKeer('inner')) await bespeelDeInner();
        const m = s.marskramer;
        if (m && !m.weg && m.staat && m.bezoek === 2 && nuEenKeer('handel')) await verkoopVoorDeHeer();
        if (dagIs(DAG_HEER, 6) && nuEenKeer('soldaten')) await leidDeSoldaten();
        const z = s.heer && s.heer.bezoek && s.heer.bezoek.zoeken;
        if (heerOpHetPlein() && (!z || z.klaar || z.heerKiest || eenKeer.has('soldaten')) && nuEenKeer('betaal')) await betaal(0.9);
        // Na Sint-Maarten, als de heer weg is: 's nachts alles terug.
        const weg = !(s.heer && s.heer.bezoek);
        if (dagNu() > DAG_HEER && weg && (uurNu() >= 23 || uurNu() < 3) && eenKeer.has('betaal') && nuEenKeer('terug')) await haalAllesOp(2);
      },
    },
  };

  // ── Opschrijven wat er gebeurt ──────────────────────────────────────────────────────────────────
  function eisKort(eis) {
    return Object.fromEntries(eis.volgorde.map((w) => [w, eis.per[w]]));
  }

  function tel() {
    const s = S();
    const v = T.verstoptTotaal(s);
    const houthakkers = s.gebouwen.filter((g) => g.soort === 'houthakker');
    return {
      dag: Math.floor(s.kalender.dag), datum: datum(),
      graan: Math.round(s.voorraad.graan || 0), goud: Math.round(s.voorraad.goud || 0), hout: Math.round(s.voorraad.hout || 0),
      vlees: Math.round(s.voorraad.vlees || 0), kaas: Math.round(s.voorraad.kaas || 0), hooi: Math.round(s.voorraad.hooi || 0),
      verstopt: { graan: Math.round(v.graan), goud: Math.round(v.goud) },
      bevolking: s.bevolking,
      tevredenheid: heel(s.behoeften.tevredenheid * 100) / 100,
      argwaan: heel(argwaan() * 100) / 100,
      houthakkers: houthakkers.map((g) => ({ klaar: !!g.klaar, handen: g.handen || 0 })),
    };
  }

  let laatsteDag = -1;
  function boekhouding() {
    const d = Math.floor(dagNu());
    if (d === laatsteDag) return;
    laatsteDag = d;
    if (T.datumVanDag(d).dagVanMaand === 1) boek.maanden.push(tel());
    if (d === DAG_HEER + 3) boek.argwaan.opSintMaarten = argwaan();
    if (d === DAG_HEER + 4) boek.naSintMaarten = tel(); // hoe rijk het dorp is als de heer weg is
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
    const bericht = T.ui.bericht;
    T.ui.bericht = function (tekst, soort) {
      if (tekst) boek.berichten.push({ dag: heel(s.kalender.dag), datum: datum(), tekst, soort: soort || '' });
      return bericht.apply(this, arguments);
    };
    na('wijzigBevolking', (r, voor, S_, verschil, reden, waarom) => {
      boek.bevolking.push({ dag: heel(s.kalender.dag), datum: datum(), verschil, reden: reden || '', waarom: waarom || '' });
    });
    const zoek = (r, voor, S_, p) => {
      boek.soldaten.beurten.push({ dag: heel(s.kalender.dag), plek: p.naam, lag: voor, gevonden: r || null });
    };
    zoek.voor = (S_, p) => Object.assign({}, p.gebouw.verstopt || { graan: 0, goud: 0 });
    na('zoekOpPlek', zoek);
    na('werdGezien', (r, voor, S_, g, handeling, wat, n) => {
      boek.getuigen.push({ dag: heel(s.kalender.dag), datum: datum(), plek: T.verstopPlekVan(s, g).naam, handeling, wat, n, wie: (r && r.bericht) || '' });
    });
    na('koopInnerOm', (r, voor, S_, goud) => {
      boek.inner.geschenken.push({ dag: heel(s.kalender.dag), goud, kan: !!(r && r.kan), gehoord: !!(r && r.gehoord) });
    });
    na('maakRapport', (r) => {
      const v = T.verstoptTotaal(s);
      const tegels = (s.wereld.akkers || []).reduce((n, a) => n + T.akkerTegels(a).length, 0);
      boek.inner.rapport = {
        dag: heel(s.kalender.dag), datum: datum(),
        gebouwen: Array.isArray(r.gebouwen) ? r.gebouwen.length : r.gebouwen,
        gebouwenInHetDorp: s.gebouwen.filter((g) => T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].tekening).length,
        tegels: r.tegels, tegelsInHetDorp: tegels,
        graanGezien: Math.round(r.graanGezien), graanVerwacht: Math.round(r.graanVerwacht), goudGezien: Math.round(r.goudGezien),
        korting: r.korting,
        werkelijk: { graan: Math.round(s.voorraad.graan || 0), goud: Math.round(s.voorraad.goud || 0), verstoptGraan: Math.round(v.graan), verstoptGoud: Math.round(v.goud) },
      };
      boek.argwaan.naInner = argwaan();
    });
    const betaal = (r, voor, S_, geef) => {
      boek.heer = {
        dag: heel(s.kalender.dag), datum: datum(),
        vroeg: voor, gaf: Object.assign({}, geef), deel: r.deel, straf: r.straf || 'geen', tekst: r.tekst || '', kan: r.kan,
        argwaan: argwaan(),
      };
    };
    betaal.voor = () => eisKort(T.eisVanDeHeer(s));
    na('betaalHeer', betaal);
    na('beginDoorzoeken', (r) => {
      if (r) boek.soldaten.zoeken = r; // het werk van de soldaten, dat tijdens het zoeken bijgewerkt wordt
    });
    na('doorzoekDorp', () => {
      boek.soldaten.hetHeleDorp = true;
    });
  }

  function eind() {
    const s = S();
    const v = T.verstoptTotaal(s);
    let tegels = 0;
    let ongezaaid = 0;
    for (const a of s.wereld.akkers || []) {
      if (T.bestemmingVan(a) !== 'akker') continue;
      tegels += T.akkerTegels(a).length;
      ongezaaid += a.ongezaaid ? a.ongezaaid.size : 0;
    }
    return Object.assign(tel(), {
      tekst: s.einde ? `het ambt kwijt op ${datum()}` : `het jaar uit, tot ${datum()}`,
      ambtKwijt: !!s.einde,
      akkertegels: tegels, ongezaaid,
      jaren: s.heer.jaren,
      verstoptPerPlek: plekken().filter((p) => p.ligt.graan > 0 || p.ligt.goud > 0).map((p) => ({ plek: p.naam, graan: Math.round(p.ligt.graan), goud: Math.round(p.ligt.goud) })),
      getuigenPerPlek: plekken().filter((p) => (p.gebouw.getuigen || []).length).map((p) => ({ plek: p.naam, getuigen: p.gebouw.getuigen.length, verteldDoor: p.gebouw.verteldDoor || null })),
    });
  }

  function winter() {
    const w = { doden: 0, kou: 0, honger: 0, beide: 0, weg: 0, erbij: 0 };
    for (const b of boek.bevolking) {
      if (b.verschil > 0) w.erbij += b.verschil;
      else if (b.reden === 'winter') {
        w.doden -= b.verschil;
        if (/hout en het eten/.test(b.waarom)) w.beide -= b.verschil;
        else if (/hout/.test(b.waarom)) w.kou -= b.verschil;
        else w.honger -= b.verschil;
      } else w.weg -= b.verschil;
    }
    w.waarschuwingen = boek.berichten.filter((b) => /winter/i.test(b.tekst) && /haalt|halen|is over|op, en de winter/.test(b.tekst)).map((b) => `${b.datum}: ${b.tekst}`);
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
    async speel({ speler, zaad, opslaan = null, verder = null }) {
      if (!verder) {
        zaai(Math.imul(zaad, 2654435761) ^ 0x5eed);
        // En de klok van het scherm op nul: of een koe ligt of graast, hangt ervan af (T.rustVanDier,
        // js/vee.js), en een liggende koe staat een ander anders in de weg dan een grazende.
        T.S.tijd = 0;
      }
      boek = {
        speler, zaad, berichten: [], bevolking: [], daden: [], maanden: [], gebouwd: [], getuigen: [], verstopt: [],
        inner: { geschenken: [], gepraatUren: 0, rapport: null },
        soldaten: { beurten: [], zoeken: null, hetHeleDorp: false, leeg: null },
        argwaan: { naInner: null, opSintMaarten: null }, heer: null, brief: null, naSintMaarten: null, luisterFouten: [],
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
        // Het titelscherm: een nieuw spel (js/menu.js). Dan de benoemingsbrief: lezen, en aan het werk.
        if (!klik('#menu [data-actie="nieuw"]')) throw new Error('er staat geen Nieuw spel op het titelscherm');
        if (!klik('#brief .heer-geef-knop') && T.ui.briefOpen()) T.ui.sluitBrief(s);
      }
      T.zetSnelheid(s, 30);
      boek.spelZaad = s.lot.zaad;
      boek.boeren = Object.fromEntries(Object.entries(s.lot.boeren).map(([id, b]) => [id, b.karakter]));
      boek.begin = tel(); // de eerste van de maand zelf schrijft de boekhouding op, bij de eerste stap
      const P = SPELERS[speler];
      if (P.begin && !verder) await P.begin();
      for (let i = 0; i < 400000 && dagNu() < EIND && !s.einde; i++) {
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
      const z = boek.soldaten.zoeken;
      boek.soldaten = {
        leeg: boek.soldaten.leeg, hetHeleDorp: boek.soldaten.hetHeleDorp, beurten: boek.soldaten.beurten,
        nodig: z ? z.nodig : null, heerKiest: z ? z.heerKiest : null, zelf: z ? z.zelf : null,
        gedaan: z ? z.gedaan.map((g) => T.verstopPlekVan(s, g).naam) : [],
        gevonden: boek.soldaten.beurten.filter((b) => b.gevonden).map((b) => ({ tekst: b.gevonden, graan: Math.round(b.lag.graan || 0), goud: Math.round(b.lag.goud || 0) })),
      };
      boek.eind = eind();
      boek.winter = winter();
      // Voor de proef met opslaan: het hele spel aan het eind, om twee jaren letter voor letter te vergelijken.
      if (opslaan || verder) boek.eindStaat = T.bewaarSpel(s, { plek: 'eind', nu: 0 });
      return JSON.parse(JSON.stringify(boek));
    },
  };
})(globalThis.Spel);
