// De kaarten van de veldslag (vraag 187 en 188, stap 3a; ontwerp/scenario.md, 7; Marcel, 28 okt: "we hebben een aantal
// kleinere skirmish maps nodig. Dit zijn veel kleinere werelden met obstakels die je kunt gebruiken, hoogtes etc.", en
// "niet altijd dezelfde map, ook hierin moet wel variatie mogelijk zijn en uiteindelijk ook ruimte om voor spelers zelf
// maps te maken"). Een kaart is een recept: de opzet ligt hier vast, het zaad van het spel schuift elk ding een stukje
// (`variatie`), en js/eiland.js maakt er een klein eiland van (T.eilandVan met { zaad, recept }).
//
// Een plek is in de maat van het scherm: `a` van links (-1) naar rechts (1), `b` van boven (-1) naar onder (1); het land
// is de ruit |a| + |b| <= 1 (in tegels een vierkant van `maat`). Een straal (`r`) is een deel van de halve maat.
//   maat      het land, in tegels (een vierkant: op het scherm een ruit)
//   spelers   voor hoeveel spelers, met een strook per speler (`stroken`: van a tot a, van b tot b)
//   land      de hoogte van het land (pixels); `glooiing` hoe sterk de fijne glooiing is (0 tot 1); `dal` hoe breed het dal
//             langs de rivier (tegels: vast, en per tegel rivier); `kust` hoe grillig de kust; `bomen` hoe vaak er op het
//             open land een boom staat (per tegel)
//   heuvels   { a, b, r, h }: een heuvel met een vlakke top, h pixels hoog
//   rivier    de punten waar hij doorheen loopt (van zee tot zee), zijn breedte (tegels), hoe diep hij onder het land
//             ligt (pixels), de voorden en de brug (een deel van zijn lengte op het land), en hoe breed een voorde is
//   pas       bij één voorde (welke, kiest het zaad) maken rotsen een smalle doorgang: zo breed, zo lang aan elke oever
//   bos       { a, b, r }: een bos
//
// Gegevens, geen functie, zodat later de editor (scenario.md, 5) een kaart terugschrijft (T.bronBlok); de naam is een zin
// voor de speler (T.tGegevens; npm run teksten leest hem hier).
(function (T) {
  'use strict';

  T.KAARTEN = {
    // The Ford (Marcel, 28 okt: "1. Ja"): een rivier van boven naar onder door het midden, met twee voorden en een brug,
    // een heuvel bij elke strook, bos op de flanken (boven en onder), en rotsen die bij een voorde een smalle doorgang
    // maken. Voor twee spelers, links en rechts.
    ford: {
      naam: 'The Ford',
      maat: 96,
      spelers: 2,
      land: 40,
      glooiing: 0.35,
      dal: [3, 0.5],
      kust: 0.04,
      bomen: 0.012,
      variatie: 0.05,
      heuvels: [{ a: -0.5, b: 0.05, r: 0.3, h: 56 }, { a: 0.5, b: -0.05, r: 0.3, h: 56 }],
      rivier: { punten: [[0.02, -1.25], [-0.12, -0.5], [0.1, 0.05], [-0.08, 0.6], [0.02, 1.25]], breed: 6, diep: 10, voorden: [0.27, 0.74], voordeBreed: 7, brug: 0.5 },
      pas: { breed: 3, lang: 6 },
      bos: [{ a: -0.3, b: -0.6, r: 0.24 }, { a: 0.32, b: -0.58, r: 0.2 }, { a: -0.32, b: 0.58, r: 0.2 }, { a: 0.3, b: 0.6, r: 0.24 }],
      stroken: [{ a: [-0.82, -0.6], b: [-0.15, 0.15] }, { a: [0.6, 0.82], b: [-0.15, 0.15] }],
    },
  };
})(globalThis.Spel = globalThis.Spel || {});
