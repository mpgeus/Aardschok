// Het kleine leven (werklijst vraag 145, 3; Marcel, 9 okt: "het voelt gewoon wat 'saai' in het dorp", en "Ja, dat zijn
// kleine details die het echt levend maken"): rook uit de schoorstenen, water dat stroomt en glinstert, kippen bij de
// boerderijen, een hond die met zijn baas meeloopt, kinderen die spelen, en was aan de lijn. Alleen beeld: het verandert niets aan de regels van het spel.
// Hier staat wat er is en waar (zonder scherm, dus te toetsen); js/tekenen.js tekent het. De spelregel "Klein leven"; de
// getallen in T.KLEIN_LEVEN_INSTELLINGEN.
(function (T) {
  'use strict';

  T.KLEIN_LEVEN_INSTELLINGEN = {
    // Is er klein leven (de spelregel "Klein leven")?
    aan: true,
    // De rook: uit een huis waar iemand thuis is (T.huizenMetIemandThuis, js/zien.js), zo dik als het vuur brandt: in
    // de winter de hele dag, anders 's ochtends en 's avonds het meest, overdag weinig, 's nachts een smeulend vuurtje. Een
    // hut heeft geen schoorsteen: daar trekt de rook dun door het riet (hut).
    rook: { winter: 1, ochtend: 1, avond: 0.9, werk: 0.25, schaft: 0.5, nacht: 0.2, hut: 0.6 },
    // Het beeld van de rook (pixels op zoom 1): hoeveel pluimpjes, hoe hoog ze stijgen, hoe groot ze worden, hoe ver de
    // wind ze meeneemt, en hoe dicht ze zijn (0 tot 1).
    rookBeeld: { pluimen: 26, hoog: 190, klein: 5, groot: 24, wind: 70, dicht: 0.62 },
    // Het water (Marcel: "vergeet ook niet het water wat mag bewegen 'stromen' etc"): een beek stroomt, met zoveel
    // rimpels per tegel die met de stroom meegaan (snel: tegels per seconde), en stil water (een vijver, een meer)
    // glinstert hier en daar (glinster: hoeveel per tegel, en hoe vaak per seconde er een opkomt).
    water: { rimpels: 3, snel: 0.35, glinster: 0.5, knipper: 0.6 },
  };
  const IN = () => T.KLEIN_LEVEN_INSTELLINGEN;

  // Hoe het water op een tegel beweegt: null (geen water), { stil: true } (een vijver of een meer: het glinstert), of de
  // richting waarin een beek stroomt ({ dx, dy }, een eenheid langs de tegels): langs de kant waarin het water het verst
  // doorloopt, en bergaf als het land hoogte heeft. Per kaart één keer (niet in Spel.S), opnieuw als de kaart verandert.
  const stroming = new WeakMap();
  T.waterOp = function (w, x, y) {
    if (!IN().aan || !w || !w.grond) return null;
    const versie = T.kaartVersie(w);
    let k = stroming.get(w);
    if (!k || k.versie !== versie) stroming.set(w, (k = { versie, tegels: new Map() }));
    const sleutel = y * 100000 + x;
    if (k.tegels.has(sleutel)) return k.tegels.get(sleutel);
    const water = (a, b) => !!(w.grond[b] && w.grond[b][a] && w.grond[b][a].naam === 'water');
    let uit = null;
    if (water(x, y)) {
      if (!T.isBeek(w, x, y)) uit = { stil: true };
      else {
        let langsX = 0;
        let langsY = 0;
        for (let d = 1; d <= 3; d++) {
          langsX += water(x - d, y) + water(x + d, y);
          langsY += water(x, y - d) + water(x, y + d);
        }
        const xas = langsX >= langsY;
        // bergaf, als er hoogte is: van de hoge naar de lage kant
        let teken = 1;
        if (T.heeftHoogte(w)) {
          const a = xas ? T.hoogteOp(w, x - 1, y) : T.hoogteOp(w, x, y - 1);
          const b = xas ? T.hoogteOp(w, x + 1, y) : T.hoogteOp(w, x, y + 1);
          if (a < b) teken = -1;
        }
        uit = xas ? { dx: teken, dy: 0 } : { dx: 0, dy: teken };
      }
    }
    k.tegels.set(sleutel, uit);
    return uit;
  };

  // Welke huizen roken, en hoe dik: [{ g, deur, dik }] (dik van 0 tot 1).
  T.rookUitHuizen = function (D) {
    if (!IN().aan || !D || !D.kalender || !D.bewoners) return [];
    const R = IN().rook;
    const winter = T.datumVanDag(D.kalender.dag).seizoen === 'winter';
    const deel = T.dagdeelVan(D.kalender.dag);
    const vuur = Math.max(winter && deel !== 'nacht' ? R.winter : 0, R[deel] || 0);
    if (!vuur) return [];
    return T.huizenMetIemandThuis(D).map(({ g, deur }) => ({ g, deur, dik: vuur * (g.soort === 'hut' ? R.hut : 1), hut: g.soort === 'hut' }));
  };
})(globalThis.Spel = globalThis.Spel || {});
