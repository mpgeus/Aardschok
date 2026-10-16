// Het licht in het dorp (werklijst vraag 108, d, en 125, C). Dit bestand heette tot 11 okt "het zichtveld en de
// getuigen": wie buiten was, zag de schout verstoppen, en vertelde het in de herberg. Dat is er met "rijk worden en
// arm lijken" uitgegaan (Marcel, 11 okt; vraag 151, optie 1); het licht bleef, want het wordt getekend en de wolven
// kijken ernaar.
//   - het licht in het dorp (T.lichtBronnen): de herberg (T.herbergLicht, js/herberg.js), elke lantaarn op de kaart,
//     die 's avonds brandt, de ramen van de huizen waar iemand thuis is, een feest, een brand en de bode.
//     js/tekenen.js tekent er de gloed van;
//   - de huizen waar iemand thuis is (T.huizenMetIemandThuis): voor de ramen en de rook uit de schoorsteen.
(function (T) {
  'use strict';

  T.ZIEN_INSTELLINGEN = {
    // Een lantaarn op de kaart brandt 's avonds, zo ver (tegels) en zo fel (0 tot 1, voor de gloed in
    // js/tekenen.js).
    lantaarnStraal: 3,
    lantaarnSterkte: 0.45,
    // Een huis waar 's avonds (en 's morgens vroeg) iemand thuis is, heeft zijn ramen aan (werklijst vraag 108, d): een
    // klein licht bij de deur, zo ver en zo fel.
    huisStraal: 1.5,
    huisSterkte: 0.22,
    // De lantaarn die iemand draagt (T.draagtLicht, hieronder: de bode en wie meegaat, de aanvoerder en de groepsleiders;
    // vraag 125, C, en 171): buiten, vanaf zo donker (T.lichtVan(dag).nacht), brandt hij, zo ver (tegels: de wolven vallen
    // niemand daarbinnen aan) en zo fel. Op het scherm is zijn plas kleiner, `beeldStraal` (Marcel, 16 okt, L3: met de
    // straal van 3 lag het licht als een waas over wie hem draagt, want die staat altijd in het felste midden).
    lantaarn: { vanaf: 0.4, straal: 3, beeldStraal: 1.5, sterkte: 0.35 },
  };
  const IN = () => T.ZIEN_INSTELLINGEN;

  // Het licht in het dorp: de herberg, met zijn eigen lantaarn en zijn ramen (T.herbergLicht), elke
  // andere lantaarn op de kaart, die 's avonds brandt, en de kaarsjes van de kerstboom (T.versieringLicht,
  // js/versiering.js). Wie ze aansteekt, komt later (de koster; spel.md,
  // "lichtbronnen in het dorp"). En de lantaarns die iemand draagt (T.draagtLicht).
  // Geeft een lijst { x, y, straal, sterkte, soort } (tegels, 0 tot 1; soort is 'herberg', 'lantaarn', 'kaars', 'huis'
  // of 'drager', voor de kleur in js/tekenen.js), bij de herberg en de huizen ook met ramenVan en schimmen, en bij een
  // drager met beeldStraal: zo ver ziet zijn licht eruit (js/tekenen.js), kleiner dan zijn straal.
  T.lichtBronnen = function (D) {
    const w = D.wereld;
    const herberg = T.herbergLicht(D).map((b) => ({ ...b, soort: 'herberg' }));
    // In het donker wie een lantaarn draagt (hieronder).
    const dragers = dragersLicht(D);
    if (!w || !D.kalender || !T.dagdeelVan) return herberg.concat(dragers);
    const deel = T.dagdeelVan(D.kalender.dag, T.isOogstDag(D.kalender.dag));
    const huizen = huizenLicht(D, deel);
    const brand = T.brandLicht(D); // wat brandt, geeft ook overdag licht (js/brand.js)
    const kamp = T.kampLicht(D); // het kampvuur van het lege begin (js/begin.js)
    if (deel !== 'avond') return herberg.concat(huizen, brand, kamp, dragers);
    // De lantaarn naast de deur van de herberg is het licht van de herberg al.
    const vanDeHerberg = (v) => herberg.some((h) => T.afstand(h, v) <= 1);
    const lantaarns = w.voorwerpen
      .filter((v) => v.soort === 'lantaarn' && !vanDeHerberg(v))
      .map((v) => ({ x: v.x, y: v.y, straal: IN().lantaarnStraal, sterkte: IN().lantaarnSterkte, soort: 'lantaarn' }));
    // En de kaarsjes van de kerstboom (js/versiering.js).
    const kaarsen = T.versieringLicht(D).map((b) => ({ ...b, soort: 'kaars' }));
    return herberg.concat(lantaarns, kaarsen, huizen, brand, kamp, dragers);
  };

  // Wie een lantaarn draagt, en hij brandt nu: de bode en wie meegaat (T.bodeDragers, js/bode.js), de aanvoerder en de
  // leider van elke groep soldaten (T.lantaarnDragers, js/soldaten.js; vraag 171). Buiten, op de kaart van zijn dorp, als het
  // donker genoeg is. Zijn licht gaat met hem mee, op zijn plek zoals hij loopt (niet per tegel), met soort 'drager'.
  T.draagtLicht = (D, e) => !!e && !e.dood && !e.binnen && !!D.kalender && !!D.wereld && D.wereld.wezens.includes(e) &&
    T.lichtVan(D.kalender.dag).nacht >= IN().lantaarn.vanaf && (T.bodeDragers(D).includes(e) || T.lantaarnDragers(D).includes(e));
  // Wie er nu een brandende lantaarn draagt: voor zijn licht (hieronder) en voor het lantaarntje in zijn hand
  // (js/tekenen.js, tekenLantaarn).
  T.lichtDragers = function (D) {
    if (!D.kalender || !D.wereld || T.lichtVan(D.kalender.dag).nacht < IN().lantaarn.vanaf) return [];
    return [...new Set([...T.bodeDragers(D), ...T.lantaarnDragers(D)])].filter((e) => T.draagtLicht(D, e));
  };
  function dragersLicht(D) {
    const L = IN().lantaarn;
    return T.lichtDragers(D).map((e) => ({ x: e.x, y: e.y, straal: L.straal, beeldStraal: L.beeldStraal, sterkte: L.sterkte, soort: 'drager' }));
  }

  // De ramen van de huizen (werklijst vraag 108, d; Marcel, 3 okt: "Lantaarns voor in de avond etc."): 's avonds en 's
  // morgens vroeg brandt er licht in een huis waar iemand thuis is, binnen of op zijn erf, en niet als ze allemaal in de
  // herberg zitten, op het feest zijn of weg. Met de ramen van de tekening (ramenVan; js/tekenen.js tekent ze, zoals die
  // van de herberg) en een klein licht bij de deur. De herberg heeft zijn eigen licht (T.herbergLicht), en een huis dat
  // nog gebouwd wordt, heeft nog geen ramen.
  function huizenLicht(D, deel) {
    if ((deel !== 'avond' && deel !== 'ochtend') || !D.bewoners) return [];
    return T.huizenMetIemandThuis(D).map(({ g, deur }) => ({ x: deur.x, y: deur.y, straal: IN().huisStraal, sterkte: IN().huisSterkte, ramenVan: g, schimmen: 0, soort: 'huis' }));
  }

  // De huizen waar iemand thuis is, binnen of op zijn erf: [{ g, deur }]. Niet de herberg, niet wat nog gebouwd wordt of
  // brandt. Voor het licht in de ramen (hierboven) en de rook uit de schoorsteen (js/tekenen.js; vraag 145, 3).
  T.huizenMetIemandThuis = function (D) {
    if (!D.bewoners) return [];
    const w = D.wereld;
    const herbergen = new Set(T.herbergenVan(D));
    const straal = T.DAG_INSTELLINGEN.erfStraal + 2;
    const deuren = new Map();
    const uit = [];
    for (const p of D.bewoners.mensen) {
      const g = p.huis;
      const e = p.wezen;
      if (!g || g.klaar === false || herbergen.has(g) || p.weg || !e || e.dood || (g.voorwerp && g.voorwerp.brand)) continue;
      if (deuren.has(g) && deuren.get(g).aan) continue;
      if (!deuren.has(g)) deuren.set(g, { deur: T.deurVan(w, g), aan: false });
      const huis = deuren.get(g);
      const deur = huis.deur;
      const thuis = e.binnen
        ? !!(e.deur && e.deur.x === deur.x && e.deur.y === deur.y)
        : T.afstand({ x: e.tx, y: e.ty }, deur) <= straal;
      if (!thuis) continue;
      huis.aan = true;
      uit.push({ g, deur });
    }
    return uit;
  };
})(globalThis.Spel = globalThis.Spel || {});
