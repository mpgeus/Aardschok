// De nieuwe speerman in het echte spel, alleen in deze browser en alleen tot je de bladzijde opnieuw laadt (vraag 192): de vellen van
// de stijlpijplijn voor staan en lopen in plaats van die in beelden/figuren. Aanvallen, geraakt worden en sterven zijn nog de oude. Op de
// bladzijde van het spel, vóór je een spel begint, in de console:
//
//   const s = document.createElement('script'); s.src = 'gereedschap/blender/stijl/inspel.js'; document.head.append(s);
//
// Niets blijvends in het spel zonder Marcel (skill modelleren). Daarna kan het demojaar beginnen: Spel.stijlDemo().
(function () {
  'use strict';
  const T = globalThis.Spel;
  const WEB = globalThis.STIJL_VELLEN || 'gereedschap/pixelart/uit/stijl/vellen/';
  T.stijlKlaar = (async function () {
    const f = T.sprites.figuurGegevens('speerman');
    for (const houding of ['staan', 'lopen']) {
      const g = await (await fetch(`${WEB}speerman-${houding}.json`)).json();
      // de sprites zoeken in beelden/figuren/: vandaar omhoog naar de uitvoer
      f.houdingen[houding] = { ...f.houdingen[houding], bestand: `../../${WEB}${g.bestand}`, beelden: g.beelden, fps: g.fps, herhaal: true, cel: g.cel, anker: g.anker };
      if (g.stap) f.houdingen[houding].stap = g.stap;
    }
    return Object.keys(f.houdingen);
  })();
  T.stijlDemo = async function () {
    await T.stijlKlaar;
    T.ui.sluitTitel(T.S);
    T.beginOpEiland(T.S, 5, T.LEVELS.demojaar);
    T.debug.geenNacht = true;
    T.debug.geenMist = true;
    return T.soldatenVan(T.S.dorp).map((p) => p.soldaat.soort);
  };
})();
