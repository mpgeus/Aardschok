// Toont een gesprek uit T.GESPREKKEN (gesprekken.js), knoop voor knoop. Welke tekst en welke
// keuzes er op een knoop gelden, bepaalt gesprek.js; hier staat alleen het scherm: de naam, het
// portret (als dat er is) en de keuzes waar je op kunt klikken of een cijfertoets voor kunt
// gebruiken (T.ui.toonDialoog/kiesKeuze, in ui.js).
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // Het portret staat niet in index.html (dat blijft leeg tot er kunst voor is): dialoog.js zet
  // het er zelf voor, als eerste kind van #dialoog. Bestaat het plaatje niet — nu bijna altijd,
  // want gereedschap/pixelart/portret.cjs rendert nog niet mee naar beelden/ — dan blijft de
  // ruimte ervoor gewoon weg (zie .met-portret in stijl.css). Portretten renderen hoort niet bij
  // dit systeem; dit is alleen de plek waar ze zouden verschijnen.
  let portretEl = null;
  function portret() {
    if (portretEl) return portretEl;
    portretEl = document.createElement('img');
    portretEl.id = 'dialoog-portret';
    portretEl.alt = '';
    portretEl.addEventListener('load', () => $('dialoog').classList.add('met-portret'));
    portretEl.addEventListener('error', () => {
      $('dialoog').classList.remove('met-portret');
      portretEl.removeAttribute('src');
    });
    $('dialoog').insertBefore(portretEl, $('dialoog').firstChild);
    return portretEl;
  }

  function toonPortret(id) {
    const el = portret();
    $('dialoog').classList.remove('met-portret');
    if (id) el.src = `beelden/portretten/${id}.png`;
    else el.removeAttribute('src');
  }

  T.openDialoog = function (S, wie) {
    const wieId = wie.soort;
    const gesprek = T.GESPREKKEN[wieId];
    S.modus = 'dialoog';
    S.held.pad = [];
    // Met wie je praat, staat stil en blijft zichtbaar: hij komt door een boom of de toren heen
    // (js/tekenen.js, doorkijk) en hij dwaalt niet weg midden in het gesprek.
    S.spreektMet = wie || null;
    if (wie) wie.pad = [];
    const toon = (knoopId) => {
      const knoop = T.gesprekKnoop(S, wieId, knoopId);
      toonPortret(gesprek.portret);
      T.ui.toonDialoog(
        T.hoofdletter(gesprek.naam),
        knoop.tekst,
        knoop.keuzes.map((keuze) => ({
          tekst: keuze.zeg,
          kies: () => {
            T.doeGevolg(S, keuze.doe);
            if (keuze.sluit) T.sluitDialoog(S);
            else toon(keuze.naar);
          },
        })),
      );
    };
    toon(gesprek.start);
  };

  T.sluitDialoog = function (S) {
    // Onthoud de leeftijd van dit moment: de motor onder "het dorp ziet je ouder worden"
    // (ontwerp/spreuken.md) is dat de volgende begroeting dit met nu vergelijkt.
    if (S.spreektMet) T.onthoudAfscheid(S, S.spreektMet.soort);
    T.ui.sluitDialoog();
    S.spreektMet = null;
    if (S.modus === 'dialoog') S.modus = 'verkennen';
  };
})(globalThis.Toren = globalThis.Toren || {});
