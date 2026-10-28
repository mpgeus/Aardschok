// De veldslag (vraag 187 en 188, stap 3; ontwerp/scenario.md, 7; Marcel, 23 okt: skirmish zonder economie, en 28 okt:
// "B1, c2, D1, F2, L2, H2, E2"): twee legers op een kleine kaart, zonder huifkar, dorp of jaar, op 1×, tot er één kant
// geen mannen meer heeft of de tijd om is. Hier de regels zonder scherm (test/veldslag.test.cjs).
//
// Stap 3a1: de wereld van een veldslag, een kaart uit een recept (T.KAARTEN, levels/kaarten.js; het eiland maakt
// js/eiland.js). Stap 3a2: het begin, de legers en het eind. Een veldslag is een level (scenario.md, 7: "Een skirmish is
// ook een level"), met `veldslag: { kaart, zaad, legers }` en vaste triggers voor winst en verlies (T.veldslagLevel); T.beginOpEiland
// (js/begin.js) begint hem met T.beginVeldslag. In het spel staat dan S.veldslag: de dag staat stil en de snelheid is 1×
// (js/tijd.js). Stap 3a3: een leger met `veldheer` speelt zelf (js/veldheer.js); zonder keus is dat elk leger behalve
// het eerste.
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank, js/opties.js).
  T.VELDSLAG_INSTELLINGEN = {
    zee: 8, // zoveel tegels zee om het land zijn open en te zien
    dag: 120 + 11 / 24, // de dag en het uur waarop een veldslag speelt, en blijft spelen (1 hooimaand, elf uur)
    // De punten van elke kant in de lobby (js/menu.js; Marcel, 28 okt: "1 ja"): zoveel standaard, van min tot max in
    // stappen van stap. 40 is acht speermannen en vier boogschutters.
    punten: { standaard: 40, min: 20, max: 200, stap: 10 },
    // De tijd van een slag in minuten, de keuzes in de lobby (0 is geen tijd; E2), en welke er eerst staat.
    minuten: [0, 5, 10, 15, 20],
    minutenStandaard: 10,
  };
  const IN = () => T.VELDSLAG_INSTELLINGEN;

  // De wereld van een veldslag op kaart `recept` met zaad `zaad`: een kaart van het eiland van dat recept (T.eilandKaart,
  // js/wereld.js), met het land en een strook zee eromheen open (`zee`), de rand eromheen (w.rand: de camera en de
  // stukken blijven erbinnen), de rotsen van de pas (het eiland legt ze niet zelf: een rots die er een kan staan,
  // zou er in een pas niet zeker staan), en de hoogte van het eiland, altijd (de heuvels horen bij de kaart, ook als de
  // spelregel Hoogte uit staat).
  T.veldslagWereld = function (recept, zaad) {
    const E = T.eilandVan({ zaad, recept });
    const R = E.recept;
    const { vak, rand } = vakVan(R);
    const w = T.eilandKaart(zaad, vak, recept);
    w.naam = T.tGegevens(T.KAARTEN[recept].naam);
    w.rand = rand;
    T.openVak(w, vak);
    const rots = T.opzoekTegelNaam(T.natuurTegel('rots'));
    for (const p of R.rotsen) {
      const er = T.voorwerpOp(w, p.x, p.y);
      if (er) T.haalVoorwerpWeg(w, er);
      const g = T.grondOp(w, p.x, p.y);
      if (T.tegel(w, p.x, p.y) === 'buiten' || (g && T.isWaterGrond(g.naam))) continue;
      T.zetVoorwerp(w, T.maakVoorwerp(rots, p.x, p.y));
      T.zetTegel(w, p.x, p.y, 'muur');
    }
    w.hoogte = { trede: T.HOOGTE_INSTELLINGEN.trede, zaad, b: vak.b, h: vak.h, vlaktes: [], vlakken: [], niveau: {}, hellingen: {}, eiland: { zaad, recept, x0: 0, y0: 0 } };
    return w;
  };

  // Het vak van de kaart van recept R op het eiland (het land en `zee` tegels zee eromheen), en de rand eromheen in
  // stukken (w.rand, T.kaartGrens).
  function vakVan(R) {
    const z = IN().zee;
    const vak = { x: R.x0 - z, y: R.y0 - z, b: R.maat + 2 * z, h: R.maat + 2 * z };
    const S = T.STUK;
    const sx = Math.floor(vak.x / S);
    const sy = Math.floor(vak.y / S);
    return { vak, rand: { sx, sy, b: Math.floor((vak.x + vak.b - 1) / S) - sx + 1, h: Math.floor((vak.y + vak.h - 1) / S) - sy + 1 } };
  }

  // Het plaatje van een kaart in de lobby (js/menu.js): { E, veld, stroken }, het eiland van de kaart, het veld van zijn
  // minikaart (T.minikaartVeld) en het midden van elke strook. Het eiland los gemaakt, niet met T.eilandVan: dat onthoudt
  // er één, en achter het titelscherm ligt het grote eiland, dat het tekenen elk beeld vraagt en dat dan opnieuw gemaakt
  // moest worden.
  T.veldslagPlaatje = function (recept, zaad) {
    const E = T.maakEiland(zaad, recept);
    const R = E.recept;
    const { rand } = vakVan(R);
    const midden = (st) => R.naarTegel((st.a[0] + st.a[1]) / 2, (st.b[0] + st.b[1]) / 2);
    return { E, veld: T.minikaartVeld({ eiland: { zaad, recept }, rand }), stroken: R.stroken.map((st) => { const [x, y] = midden(st); return { x, y }; }) };
  };

  // Een veldslag als level (scenario.md, 7), uit de keuzes: de kaart, het zaad, de legers ({ soorten: { speerman: 6 } } per
  // speler, in de volgorde van de stroken) en de tijd (`minuten`, of geen; Marcel, 28 okt: E2, "instelbaar in de skirmish
  // lobby"). Met de vaste triggers: heeft nog maar één leger mannen (of geen), of is de tijd om, dan is het uit, en wint
  // wie de meeste heeft (T.GEVOLGEN.uitslag, js/scenario.js). Geen trigger vraagt naar één speler, want samen speelt
  // elke computer een ander leger: het doel is van iedereen, en de uitslag is er voor elk leger.
  // Met `punten` koopt een leger met een veldheer en zonder soorten zijn eigen leger bij het begin (T.veldheerKoopt), en
  // kijkt de keuring na dat een speler niet meer kocht dan hij had.
  T.veldslagLevel = function ({ kaart, zaad, punten = null, legers, minuten = null }) {
    const triggers = [
      { id: 'begin', dan: [{ doel: { id: 'slag', tekst: T.t('Defeat the enemy army.'), hoofd: true } }] },
      { id: 'eind', als: [{ legers: { minder: 2 } }], dan: [{ uitslag: true }] },
    ];
    if (minuten) triggers.push({ id: 'tijd', als: [{ seconden: minuten * 60 }], dan: [{ uitslag: true }] });
    const metVeldheer = (l, i) => (l.veldheer != null ? !!l.veldheer : i > 0); // zonder keus: jij het eerste, een veldheer de rest
    const leger = (l, i) => ({ ...(l.soorten ? { soorten: { ...l.soorten } } : {}), veldheer: metVeldheer(l, i) });
    return { veldslag: { kaart, zaad, ...(punten ? { punten } : {}), legers: legers.map(leger) }, triggers };
  };

  // De mannen van een leger (of een dorp) die nog staan: zijn soldaten en veteranen (T.militieVan, js/rovers.js) en zijn
  // held.
  T.legerVan = function (D) {
    const uit = T.militieVan(D);
    if (D.aanvoerder && !D.aanvoerder.dood && !uit.includes(D.aanvoerder)) uit.push(D.aanvoerder);
    return uit;
  };

  // Het begin van een veldslag (T.beginOpEiland, js/begin.js): de wereld van de kaart, de dag die blijft, en per leger een
  // dorp zonder kar, gezinnen of voorraad, met zijn held en zijn soldaten in zijn strook. Het eerste leger is van jou
  // (S.dorp); de andere zijn een ander dorp (D.ander: wat zij zeggen, zie je niet).
  T.beginVeldslag = function (S, L) {
    const V = L.veldslag;
    const w = T.veldslagWereld(V.kaart, V.zaad);
    const R = T.eilandVan(w.eiland).recept;
    S.wereld = w;
    S.veldslag = { kaart: V.kaart, zaad: V.zaad };
    S.kalender.dag = IN().dag;
    S.dorpen = V.legers.map((leger, i) => maakLeger(S, w, R, i, leger, V));
    S.dorp = S.dorpen[0];
    T.startScenario(S, L);
    return S.dorp;
  };

  // Een leger in strook i van het recept: zijn plek (het vak van de strook, en een plein van vijf bij vijf in het midden:
  // daar staat wie geen bevel heeft), zijn held in het midden achter de linie, en zijn soldaten in de linie. Een veldheer
  // zonder soorten koopt ze nu, met de punten van de slag (T.veldheerKoopt, js/veldheer.js), uit het zaad van de slag en
  // zijn strook: zo koopt hij op elke computer hetzelfde, en bij een ander zaad iets anders.
  function maakLeger(S, w, R, i, leger, V) {
    const zaad = V.zaad;
    const st = R.stroken[i];
    const xs = st.hoeken.map((h) => h[0]);
    const ys = st.hoeken.map((h) => h[1]);
    const vak = { x: Math.floor(Math.min(...xs)), y: Math.floor(Math.min(...ys)) };
    vak.b = Math.ceil(Math.max(...xs)) - vak.x + 1;
    vak.h = Math.ceil(Math.max(...ys)) - vak.y + 1;
    const [mx, my] = R.naarTegel((st.a[0] + st.a[1]) / 2, (st.b[0] + st.b[1]) / 2).map(Math.round);
    const plein = [[mx - 2, my - 2], [mx + 2, my - 2], [mx + 2, my + 2], [mx - 2, my + 2]];
    const plek = { ...T.legePlek(w), vak, plein };
    const held = T.maakWezen('aanvoerder', mx, my);
    w.wezens.push(held);
    T.zetAanvoerderKlaar(held, i + 1);
    // een leger met een veldheer is een ander dorp (D.ander: wat het zegt, staat niet op een scherm); een speler niet, ook
    // niet de tweede als jullie samen spelen
    const D = T.nieuwDorp(S, w, held, { plek, zaad: (Math.imul(zaad >>> 0, 31) + i + 1) >>> 0, overvallen: false, ander: !!leger.veldheer });
    D.veldslag = true; // een leger, geen dorp: geen statussen van een dorp (js/statussen.js) en geen raad (js/raad.js)
    let soorten = leger.soorten;
    if (leger.veldheer) {
      D.veldheer = T.nieuweVeldheer(S, i); // de AI van dit leger (js/veldheer.js)
      if (!soorten) {
        const koop = T.veldheerKoopt(V.punten, (Math.imul(zaad >>> 0, 2654435761) + 7919 * (i + 1)) >>> 0);
        D.veldheer.mix = koop.mix;
        soorten = koop.soorten;
      }
    }
    stelOp(D, R, st, soorten || {});
    return D;
  }

  // De opstelling (D1): de mannen in een linie aan de voorkant van de strook, met hun gezicht naar het midden van de kaart,
  // zoals de knop Line ze zet (T.stuurMannen en T.formatiePlekken, js/kiezen.js: wie van dichtbij vecht vooraan, de
  // schutters erachter, en elk zijn post); ze staan er meteen. De held staat achter het midden.
  function stelOp(D, R, st, soorten) {
    const tegel = 1 / (R.half * Math.SQRT2); // zoveel is een tegel in de maat van het scherm, dwars en langs
    const voor = Math.abs(st.a[0]) < Math.abs(st.a[1]) ? st.a[0] : st.a[1];
    const achter = voor === st.a[0] ? st.a[1] : st.a[0];
    const naarAchter = Math.sign(achter - voor);
    const bMidden = (st.b[0] + st.b[1]) / 2;
    const op = (a, b) => {
      const [x, y] = R.naarTegel(a, b).map(Math.round);
      return { x, y };
    };
    const bij = op(achter, bMidden);
    for (const [soort, n] of Object.entries(soorten)) for (let k = 0; k < n; k++) T.zetSoldaatBij(D, soort, bij);
    T.zetHeld(D);
    const ids = D.bewoners.mensen.filter((p) => p.soldaat).map((p) => p.id);
    T.stuurMannen(D, ids, op(voor + naarAchter * 2 * tegel, bMidden));
    for (const e of T.militieVan(D)) if (e.post) Object.assign(e, { x: e.post.x, y: e.post.y, tx: e.post.x, ty: e.post.y, pad: [], onderweg: false, padDoel: null });
    const held = op(voor + naarAchter * (T.VELDHEER_INSTELLINGEN.achterDeLinie + 2) * tegel, bMidden);
    Object.assign(D.aanvoerder, { x: held.x, y: held.y, tx: held.x, ty: held.y, pad: [], onderweg: false });
  }
})(globalThis.Spel = globalThis.Spel || {});
