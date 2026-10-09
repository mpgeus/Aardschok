// Het kleine leven (werklijst vraag 145, 3; Marcel, 9 okt: "het voelt gewoon wat 'saai' in het dorp", en "Ja, dat zijn
// kleine details die het echt levend maken"): rook uit de schoorstenen, kippen bij de boerderijen, een hond die met zijn
// baas meeloopt, kinderen die spelen, en was aan de lijn. Alleen beeld: het verandert niets aan de regels van het spel.
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
  };
  const IN = () => T.KLEIN_LEVEN_INSTELLINGEN;

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
