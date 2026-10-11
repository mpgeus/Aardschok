// Het licht in het dorp (werklijst vraag 108, d, en 125, C). Dit bestand heette tot 11 okt "het zichtveld en de
// getuigen": wie buiten was, zag de schout verstoppen, en vertelde het in de herberg. Dat is er met "rijk worden en
// arm lijken" uitgegaan (Marcel, 11 okt; vraag 151, optie 1); het licht bleef, want het wordt getekend en de wolven
// kijken ernaar.
//   - het licht in het dorp (T.lichtBronnen): de herberg (T.herbergLicht, js/herberg.js), elke lantaarn op de kaart,
//     die 's avonds brandt, de ramen van de huizen waar iemand thuis is, een feest, een brand, de bode, en de
//     lantaarn van de schout (T.draagtLantaarn). js/tekenen.js tekent er de gloed van;
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
    // De lantaarn van de schout (werklijst vraag 125, C; Marcel, 4 okt: "ook spel. Voegt leuke elementen toe"): buiten,
    // vanaf zo donker (T.lichtVan(dag).nacht), brandt hij, zo ver en zo fel. De wolven blijven aan de rand van zijn
    // licht (js/beesten.js). Sluipen dooft hem (T.wisselSluipen in js/verkennen.js).
    lantaarn: { vanaf: 0.4, straal: 3, sterkte: 0.5 },
  };
  const IN = () => T.ZIEN_INSTELLINGEN;

  // Het licht in het dorp: de herberg, met zijn eigen lantaarn en zijn ramen (T.herbergLicht), elke
  // andere lantaarn op de kaart, die 's avonds brandt, en op een feest het plein (T.feestLicht, js/feesten.js). Wie ze aansteekt, komt later (de koster; spel.md,
  // "lichtbronnen in het dorp"). En de lantaarn van de schout, als hij er een draagt (T.draagtLantaarn, vraag 125, C).
  // Geeft een lijst { x, y, straal, sterkte, soort } (tegels, 0 tot 1; soort is 'herberg', 'lantaarn', 'feest', 'huis'
  // of 'schout', voor de kleur in js/tekenen.js), bij de herberg en de huizen ook met ramenVan en schimmen.
  T.lichtBronnen = function (D) {
    const w = D.wereld;
    const herberg = T.herbergLicht(D).map((b) => ({ ...b, soort: 'herberg' }));
    // De schout, en in het donker de bode en wie meegaat (js/bode.js), met een lantaarn.
    const schout = schoutLicht(D).concat(T.bodeLicht(D));
    if (!w || !D.kalender || !T.dagdeelVan) return herberg.concat(schout);
    const deel = T.dagdeelVan(D.kalender.dag, T.isOogstDag(D.kalender.dag));
    const huizen = huizenLicht(D, deel);
    const brand = T.brandLicht(D); // wat brandt, geeft ook overdag licht (js/brand.js)
    const kamp = T.kampLicht(D); // het kampvuur van het lege begin (js/begin.js)
    if (deel !== 'avond') return herberg.concat(huizen, brand, kamp, schout);
    // De lantaarn naast de deur van de herberg is het licht van de herberg al.
    const vanDeHerberg = (v) => herberg.some((h) => T.afstand(h, v) <= 1);
    const lantaarns = w.voorwerpen
      .filter((v) => v.soort === 'lantaarn' && !vanDeHerberg(v))
      .map((v) => ({ x: v.x, y: v.y, straal: IN().lantaarnStraal, sterkte: IN().lantaarnSterkte, soort: 'lantaarn' }));
    // En op een feest het licht op het plein (js/feesten.js).
    const feest = T.feestLicht(D).map((b) => ({ ...b, soort: 'feest' }));
    return herberg.concat(lantaarns, feest, huizen, brand, kamp, schout);
  };

  // Draagt de schout van dit dorp nu een brandende lantaarn? Buiten, op de kaart van zijn dorp, als het donker genoeg
  // is, en niet als hij hem doofde (sluipen, e.lantaarnUit).
  T.draagtLantaarn = function (D) {
    const h = D.schout;
    if (!h || h.dood || h.binnen || h.lantaarnUit || !D.kalender || T.schoutIsWeg(D)) return false;
    return T.lichtVan(D.kalender.dag).nacht >= IN().lantaarn.vanaf;
  };
  // Zijn licht gaat met hem mee, op zijn plek zoals hij loopt (niet per tegel), met soort 'schout'.
  function schoutLicht(D) {
    if (!T.draagtLantaarn(D)) return [];
    const L = IN().lantaarn;
    return [{ x: D.schout.x, y: D.schout.y, straal: L.straal, sterkte: L.sterkte, soort: 'schout' }];
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
