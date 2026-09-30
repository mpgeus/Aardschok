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

  // Stilstaan, maar niet halverwege een stap: wie onderweg is, maakt zijn lopende stap af (zoals
  // bij het begin van een gevecht). Een leeg pad midden in een stap bleef hangen: de beweging
  // (js/anim.js) kijkt alleen naar het pad, en de inner (js/inner.js) wacht tot hij niet meer
  // onderweg is, dus die stond na een gesprek voorgoed stil.
  const staStil = (e) => {
    e.pad = e.onderweg && e.pad[0] ? [e.pad[0]] : [];
  };

  // `gesprekId`: een ander gesprek dan het zijne, zoals een voorval (js/voorvallen.js) dat hij je komt vertellen.
  T.openDialoog = function (S, wie, gesprekId) {
    // Het gesprek speelt in het dorp waar je bent (js/dorp.js), en buiten een dorp in dat van jezelf.
    const D = T.dorpHier(S) || S.dorp;
    const wieId = gesprekId || T.gesprekIdVan(wie);
    const gesprek = T.GESPREKKEN[wieId];
    const voorval = !!T.VOORVALLEN[wieId];
    S.modus = 'dialoog';
    // Een voorval is een keuze met een prijs: de tijd staat stil tot je kiest, zoals bij een brief. Een gewoon gesprek
    // laat de dag doorlopen (wie de inner aan de praat houdt, houdt hem op: js/inner.js).
    if (voorval) T.houdTijdStil(S, 'voorval');
    staStil(S.schout);
    // Met wie je praat, staat stil en blijft zichtbaar: hij komt door een boom of een huis heen
    // (js/doorkijk.js) en hij dwaalt niet weg midden in het gesprek.
    S.spreektMet = wie || null;
    if (wie) staStil(wie);
    const toon = (knoopId) => {
      const knoop = T.gesprekKnoop(S, D, wieId, knoopId);
      toonPortret(gesprek.portret);
      // Een boer voert het gesprek van zijn karakter (js/boeren.js), maar heet zoals hij heet:
      // Aaltje, en niet "de weduwe". Onder zijn naam staat wie hij is en wat hij kan; bij een voorval ook
      // bij een gewone bewoner (js/bewoners.js). De naam van een voorval is {wie}: die vult het spel in.
      const over = T.overBoerTekst(wie) || (voorval ? T.overBewonerTekst(D, wie) : '');
      T.ui.toonDialoog(
        T.hoofdletter(over && wie.naam ? wie.naam : T.vulWoordenIn(D, gesprek.naam)),
        knoop.tekst,
        knoop.keuzes.map((keuze) => {
          // Wat het kost of oplevert, zegt het venster vooraf; wat er niet is, kun je niet geven.
          const prijs = T.prijsVanKeuze(D, keuze.doe);
          return {
            tekst: T.vulWoordenIn(D, keuze.zeg),
            prijs: prijs.tekst,
            kan: prijs.kan,
            waarom: prijs.waarom,
            kies: () => {
              T.doeGevolg(S, D, keuze.doe);
              if (keuze.sluit) {
                T.voorvalBeantwoord(D, wieId);
                T.sluitDialoog(S);
              } else toon(keuze.naar);
            },
          };
        }),
        over,
      );
    };
    toon(gesprek.start);
  };

  T.sluitDialoog = function (S) {
    T.ui.sluitDialoog();
    S.spreektMet = null;
    if (S.modus === 'dialoog') S.modus = 'verkennen';
    T.laatTijdGaan(S, 'voorval');
  };

  // Iemand spreekt de schout aan met een voorval (js/voorvallen.js, T.werkVoorvallenBij): de regels zeggen wanneer,
  // en het scherm opent het gesprek.
  T.ui.spreekAan = (S, wie, gesprekId) => T.openDialoog(S, wie, gesprekId);
})(globalThis.Spel = globalThis.Spel || {});
