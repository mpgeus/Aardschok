'use strict';
// Het dorp van de zichtproef (vraag 176): een extreem dichte straat, in tegels om het midden, in de stand van het spel
// (de camera vanuit het zuidoosten). Een straat van twee tegels breed langs y = 0 en 1, met aan elke kant een rij huizen
// zonder ruimte ertussen, de deuren naar de straat; aan de zuidkant (vóór de straat, dus tussen de camera en de straat)
// één steeg naar het zuiden. Elk gebouw heeft een eigen tekening, zodat de proef per gebouw het platte plaatje kan
// onderschuiven (plat.cjs). Een gebouw zegt zijn soort, zijn tekening en de achterste tegel van zijn voet.
const MIDDEN = { x: -4, y: 0 };
const DORP = {
  gebouwen: [
    // de noordkant: achter de straat, de deuren naar het zuiden
    { naam: 'huis aan de noordkant', soort: 'huis', tekening: 'planken-huis7-spanen-z', x: -26, y: -7 },
    { naam: 'hut aan de noordkant', soort: 'hut', tekening: 'planken-hut1-spanen-z', x: -17, y: -4 },
    { naam: 'woontoren', soort: 'woontoren', tekening: 'planken-woontoren-pannen-z', x: -11, y: -5 },
    { naam: 'stenen huis aan de noordkant', soort: 'stenenHuis', tekening: 'planken-steen8-pannen-z', x: -6, y: -7 },
    { naam: 'tweede hut aan de noordkant', soort: 'hut', tekening: 'planken-hut3-spanen-z', x: 3, y: -4 },
    { naam: 'huis met leien', soort: 'huis', tekening: 'planken-huis9-leien-z', x: 9, y: -7 },
    // de zuidkant: vóór de straat, de deuren naar het noorden
    { naam: 'herberg', soort: 'herberg', tekening: 'planken-herberg1-spanen-n', x: -26, y: 2 },
    { naam: 'huis aan de zuidkant', soort: 'huis', tekening: 'planken-huis8-spanen-n', x: -15, y: 2 },
    { naam: 'stenen huis aan de zuidkant', soort: 'stenenHuis', tekening: 'planken-steen7-leien-n', x: -5, y: 2 },
    { naam: 'hut aan de zuidkant', soort: 'hut', tekening: 'planken-hut4-spanen-n', x: 4, y: 2 },
    { naam: 'stenen toren', soort: 'woontoren', tekening: 'planken-woontoren-baksteen-n', x: 10, y: 2 },
  ],
  // De straat (twee tegels breed, tot een pleintje in het oosten), en de steeg tussen het huis en het stenen huis aan
  // de zuidkant.
  weg: [
    ...Array.from({ length: 48 }, (_, i) => ({ x: -28 + i, y: 0 })),
    ...Array.from({ length: 48 }, (_, i) => ({ x: -28 + i, y: 1 })),
    ...Array.from({ length: 8 }, (_, i) => ({ x: -6, y: 2 + i })),
  ],
  // Een boom: zijn soort, en welke van zijn tekeningen (zoals in de cameraproef).
  bomen: [
    { soort: 'eik', id: 16, x: -20, y: -10 }, { soort: 'linde', id: 39, x: -2, y: -11 }, { soort: 'beuk', id: 35, x: 13, y: -10 },
    { soort: 'eik', id: 17, x: 22, y: -3 }, { soort: 'linde', id: 39, x: 23, y: 8 }, { soort: 'berk', id: 24, x: -10, y: 11 },
  ],
  // Zes inwoners: waar ze staan en waar ze naar kijken. De eerste is wie C kiest.
  mensen: [
    { naam: 'in de straat, voor het stenen huis', x: -3, y: 1, kijkt: { x: -9, y: 1 } },
    { naam: 'naast de deur van de woontoren', x: -8, y: 0, kijkt: { x: -9, y: -3 } },
    { naam: 'in de steeg', x: -6, y: 6, kijkt: { x: -6, y: 0 } },
    { naam: 'achter de hut aan de noordkant', x: -15, y: -6, kijkt: { x: -15, y: -12 } },
    { naam: 'op de achterplaats', x: 5, y: -7, kijkt: { x: 9, y: -7 } },
    { naam: 'op het pleintje', x: 19, y: 1, kijkt: { x: 14, y: 1 } },
  ],
};
const tekeningen = () => DORP.gebouwen.map((g) => g.tekening);

module.exports = { MIDDEN, DORP, tekeningen };
