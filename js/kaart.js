// De tegels op naam: van "bomen/eik" of een nummer naar het plaatje in tegels/ (T.TEGELS, tegels/tegels.js) en wat
// het vel erover zegt ("naam", "vast", bij een gebouw "beslaat"). Het eiland (js/wereld.js), de maker (js/maker.js) en
// wie een gebouw neerzet (js/gebouwen.js) zoeken hier hun tekening op.
//
// De keten: de kunst (gereedschap/pixelart/) -> npm run tiled (naar-tiled.cjs) -> tegels/*.png en tegels/tegels.js.
// Een tegelnummer (gid) telt per vel vanaf de eerste tegel, zoals Tiled het las: tot 23 okt (ronde 4 van het snoeien,
// ontwerp/snoeien.md) las dit bestand ook de kaarten die Marcel in Tiled tekende (kaarten/, T.laadKaart, met hun
// mensen, deuren en overgangen); die gingen weg, en git bewaart ze.
(function (T) {
  'use strict';

  // Een tekening op naam: "bomen/eik", het vel en de naam uit tegels/, en { vel, id, eig } terug. Op naam en niet op
  // nummer, want npm run tiled verschuift de nummers zodra een vel groter wordt, en een naam niet. Zonder vel ervoor
  // ("eik") zoeken we alle vellen af.
  function opzoekNaam(wat) {
    const deel = String(wat).split('/');
    const naam = deel.pop();
    const velnaam = deel.pop();
    const vellen = velnaam ? [velnaam] : Object.keys(T.TEGELS || {});
    for (const v of vellen) {
      const vel = T.TEGELS && T.TEGELS[v];
      if (!vel) continue;
      const id = vel.tiles.findIndex((t) => t && t.naam === naam);
      if (id >= 0) return { vel: v, id, eig: vel.tiles[id] };
    }
    console.warn(`T.opzoekTegelNaam: tegel "${wat}" bestaat niet in tegels/ — draai npm run tiled, of kijk de naam na`); // geen tekst
    return null;
  }
  // Onder meer js/gebouwen.js, voor een gebouw dat de speler zelf neerzet (T.plaatsGebouw).
  T.opzoekTegelNaam = opzoekNaam;

  // Eén keer een soort aan T.VOORWERPEN toevoegen (blokkeert én zichtDicht volgen hier allebei
  // uit "vast": een boom of een gebouw houdt zowel het lopen als het zicht tegen). Staat de
  // soort er al (bijvoorbeeld gewoon uit wereld.js), dan raken we hem niet aan.
  function registreerVoorwerp(naam, vast) {
    if (!T.VOORWERPEN[naam]) T.VOORWERPEN[naam] = { blokkeert: !!vast, zichtDicht: !!vast };
  }

  // Een voorwerp uit een tegel ({ vel, id, eig }, van T.opzoekTegelNaam) op tegel (x, y): vel en id erbij, zodat
  // js/tekenen.js het plaatje kan opzoeken, en beslaat, zodat het sorteren weet hoeveel tegels eronder liggen. Eén
  // manier, voor een stuk van het eiland (js/wereld.js) en voor de maker (js/maker.js).
  T.maakVoorwerp = function (t, x, y) {
    registreerVoorwerp(t.eig.naam, t.eig.vast);
    return { soort: t.eig.naam, x, y, vel: t.vel, id: t.id, beslaat: t.eig.beslaat || [1, 1] };
  };

  // De grond van het eiland (js/wereld.js, B2b): de grondtegels van het vel 'rand' vanaf 1, en die van 'kust' erachter
  // (T.KUST_GID), zoals de maker ze nummert (js/maker.js). Eén ding per soort tegel ({ vel, id, naam, vast }), gedeeld
  // door elke kaart van het eiland, zodat het opslaan het één keer schrijft en daarna een verwijzing (js/opslaan.js).
  T.KUST_GID = () => 1 + T.TEGELS.rand.tiles.length;
  const eilandGrond = new Map();
  T.grondVanGid = function (gid) {
    let g = eilandGrond.get(gid);
    if (g === undefined) {
      const kust = gid >= T.KUST_GID();
      const vel = kust ? 'kust' : 'rand'; // geen tekst
      const id = gid - (kust ? T.KUST_GID() : 1);
      const eig = id >= 0 ? T.TEGELS[vel].tiles[id] : null;
      g = eig ? { vel, id, naam: eig.naam, vast: !!eig.vast } : null;
      eilandGrond.set(gid, g);
    }
    return g;
  };

  // Kent het spel de soort van dit voorwerp? Zo niet, dan meldt hij hem aan zoals hij erbij kwam: een gebouw blokkeert
  // altijd (T.registreerGebouwSoort, js/gebouwen.js), en wat uit een tegelvel komt (het eiland, de maker, een lantaarn),
  // zoals het vel zegt. Voor een bewaard spel in een verse bladzijde (T.zetSpel, js/opslaan.js): die kent alleen de
  // soorten van wat ze zelf neerzette, niet een gebouw uit het spel of iets van een ander land van de maker.
  T.kenSoortVan = function (v) {
    if (!v || !v.soort || T.VOORWERPEN[v.soort]) return;
    if (v.soort.startsWith('gebouw:')) {
      T.registreerGebouwSoort(v.soort);
      return;
    }
    const vel = T.TEGELS && T.TEGELS[v.vel];
    const eig = vel && vel.tiles && vel.tiles[v.id];
    if (eig) registreerVoorwerp(v.soort, eig.vast);
  };
})(globalThis.Spel = globalThis.Spel || {});
