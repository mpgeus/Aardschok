// Gemaakt door gereedschap/pixelart/bouwfasen.cjs — niet met de hand bijwerken.
// Dezelfde inhoud als bouwfasen.json, als script, zodat file:// het ook kan lezen (zie js/sprites.js).
(function (T) {
  T.BOUWFASEN = {
   "_lees_dit": "Vijf bouwfases per gebouw uit tegels/gebouwen.tsx, gemaakt door gereedschap/pixelart/bouwfasen.cjs — niet met de hand bijwerken. Sleutel is de tekeningnaam (T.GEBOUWEN.<soort>.tekening, na \"gebouwen/\"). Per fase (0..4, oplopend in afbouw): x/y/b/h snijdt de cel uit bouwfasen.png, anker is het punt in die cel dat op T.naarScherm(x, y) van de aangeklikte tegel komt — dezelfde achterste-voethoek-afspraak als tegels.json (\"anker\" bij de tsx-vellen), en beslaat is dezelfde tegelmaat als in gebouwen.tsx voor dezelfde tekening. Fase 5 (klaar) staat niet hier: dat is gewoon de bestaande tegel in tegels/gebouwen.png.",
   "breedte": 3395,
   "hoogte": 7945,
   "bestand": "bouwfasen.png",
   "fasen": {
    "dorpKlein2": {
     "gebouw": "hut",
     "beslaat": [
      5,
      7
     ],
     "fasen": [
      {
       "x": 0,
       "y": 0,
       "b": 540,
       "h": 401,
       "anker": [
        364,
        215
       ],
       "naam": "fundering"
      },
      {
       "x": 540,
       "y": 0,
       "b": 540,
       "h": 401,
       "anker": [
        364,
        215
       ],
       "naam": "geraamte"
      },
      {
       "x": 1080,
       "y": 0,
       "b": 540,
       "h": 401,
       "anker": [
        364,
        215
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1620,
       "y": 0,
       "b": 540,
       "h": 401,
       "anker": [
        364,
        215
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2160,
       "y": 0,
       "b": 540,
       "h": 401,
       "anker": [
        364,
        215
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "dorpshuis1": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "fasen": [
      {
       "x": 0,
       "y": 401,
       "b": 551,
       "h": 457,
       "anker": [
        300,
        271
       ],
       "naam": "fundering"
      },
      {
       "x": 551,
       "y": 401,
       "b": 551,
       "h": 457,
       "anker": [
        300,
        271
       ],
       "naam": "geraamte"
      },
      {
       "x": 1102,
       "y": 401,
       "b": 551,
       "h": 457,
       "anker": [
        300,
        271
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1653,
       "y": 401,
       "b": 551,
       "h": 457,
       "anker": [
        300,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2204,
       "y": 401,
       "b": 551,
       "h": 457,
       "anker": [
        300,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "schuur": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "fasen": [
      {
       "x": 0,
       "y": 858,
       "b": 650,
       "h": 441,
       "anker": [
        428,
        207
       ],
       "naam": "fundering"
      },
      {
       "x": 650,
       "y": 858,
       "b": 650,
       "h": 441,
       "anker": [
        428,
        207
       ],
       "naam": "geraamte"
      },
      {
       "x": 1300,
       "y": 858,
       "b": 650,
       "h": 441,
       "anker": [
        428,
        207
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1950,
       "y": 858,
       "b": 650,
       "h": 441,
       "anker": [
        428,
        207
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2600,
       "y": 858,
       "b": 650,
       "h": 441,
       "anker": [
        428,
        207
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "houtschuur": {
     "gebouw": "houthakker",
     "beslaat": [
      3,
      4
     ],
     "fasen": [
      {
       "x": 0,
       "y": 1299,
       "b": 392,
       "h": 255,
       "anker": [
        268,
        149
       ],
       "naam": "fundering"
      },
      {
       "x": 392,
       "y": 1299,
       "b": 392,
       "h": 255,
       "anker": [
        268,
        149
       ],
       "naam": "geraamte"
      },
      {
       "x": 784,
       "y": 1299,
       "b": 392,
       "h": 255,
       "anker": [
        268,
        149
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1176,
       "y": 1299,
       "b": 392,
       "h": 255,
       "anker": [
        268,
        149
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 1568,
       "y": 1299,
       "b": 392,
       "h": 255,
       "anker": [
        268,
        149
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "schuurBlokhut": {
     "gebouw": "schaapskooi",
     "beslaat": [
      5,
      7
     ],
     "fasen": [
      {
       "x": 0,
       "y": 1554,
       "b": 554,
       "h": 377,
       "anker": [
        364,
        191
       ],
       "naam": "fundering"
      },
      {
       "x": 554,
       "y": 1554,
       "b": 554,
       "h": 377,
       "anker": [
        364,
        191
       ],
       "naam": "geraamte"
      },
      {
       "x": 1108,
       "y": 1554,
       "b": 554,
       "h": 377,
       "anker": [
        364,
        191
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1662,
       "y": 1554,
       "b": 554,
       "h": 377,
       "anker": [
        364,
        191
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2216,
       "y": 1554,
       "b": 554,
       "h": 377,
       "anker": [
        364,
        191
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "kippenhok": {
     "gebouw": "kippenhok",
     "beslaat": [
      2,
      2
     ],
     "fasen": [
      {
       "x": 0,
       "y": 1931,
       "b": 289,
       "h": 181,
       "anker": [
        204,
        123
       ],
       "naam": "fundering"
      },
      {
       "x": 289,
       "y": 1931,
       "b": 289,
       "h": 181,
       "anker": [
        204,
        123
       ],
       "naam": "geraamte"
      },
      {
       "x": 578,
       "y": 1931,
       "b": 289,
       "h": 181,
       "anker": [
        204,
        123
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 867,
       "y": 1931,
       "b": 289,
       "h": 181,
       "anker": [
        204,
        123
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 1156,
       "y": 1931,
       "b": 289,
       "h": 181,
       "anker": [
        204,
        123
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "vakwerkhuis": {
     "gebouw": "vakwerkhuis",
     "beslaat": [
      7,
      5
     ],
     "fasen": [
      {
       "x": 0,
       "y": 2112,
       "b": 551,
       "h": 449,
       "anker": [
        300,
        263
       ],
       "naam": "fundering"
      },
      {
       "x": 551,
       "y": 2112,
       "b": 551,
       "h": 449,
       "anker": [
        300,
        263
       ],
       "naam": "geraamte"
      },
      {
       "x": 1102,
       "y": 2112,
       "b": 551,
       "h": 449,
       "anker": [
        300,
        263
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1653,
       "y": 2112,
       "b": 551,
       "h": 449,
       "anker": [
        300,
        263
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2204,
       "y": 2112,
       "b": 551,
       "h": 449,
       "anker": [
        300,
        263
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "stenenHuis": {
     "gebouw": "stenenHuis",
     "beslaat": [
      6,
      8
     ],
     "fasen": [
      {
       "x": 0,
       "y": 2561,
       "b": 604,
       "h": 470,
       "anker": [
        396,
        252
       ],
       "naam": "fundering"
      },
      {
       "x": 604,
       "y": 2561,
       "b": 604,
       "h": 470,
       "anker": [
        396,
        252
       ],
       "naam": "geraamte"
      },
      {
       "x": 1208,
       "y": 2561,
       "b": 604,
       "h": 470,
       "anker": [
        396,
        252
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1812,
       "y": 2561,
       "b": 604,
       "h": 470,
       "anker": [
        396,
        252
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2416,
       "y": 2561,
       "b": 604,
       "h": 470,
       "anker": [
        396,
        252
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "herberg": {
     "gebouw": "herberg",
     "beslaat": [
      9,
      7
     ],
     "fasen": [
      {
       "x": 0,
       "y": 3031,
       "b": 673,
       "h": 614,
       "anker": [
        364,
        364
       ],
       "naam": "fundering"
      },
      {
       "x": 673,
       "y": 3031,
       "b": 673,
       "h": 614,
       "anker": [
        364,
        364
       ],
       "naam": "geraamte"
      },
      {
       "x": 1346,
       "y": 3031,
       "b": 673,
       "h": 614,
       "anker": [
        364,
        364
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 2019,
       "y": 3031,
       "b": 673,
       "h": 614,
       "anker": [
        364,
        364
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2692,
       "y": 3031,
       "b": 673,
       "h": 614,
       "anker": [
        364,
        364
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "smidse": {
     "gebouw": "smidse",
     "beslaat": [
      7,
      5
     ],
     "fasen": [
      {
       "x": 0,
       "y": 3645,
       "b": 540,
       "h": 412,
       "anker": [
        300,
        226
       ],
       "naam": "fundering"
      },
      {
       "x": 540,
       "y": 3645,
       "b": 540,
       "h": 412,
       "anker": [
        300,
        226
       ],
       "naam": "geraamte"
      },
      {
       "x": 1080,
       "y": 3645,
       "b": 540,
       "h": 412,
       "anker": [
        300,
        226
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1620,
       "y": 3645,
       "b": 540,
       "h": 412,
       "anker": [
        300,
        226
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2160,
       "y": 3645,
       "b": 540,
       "h": 412,
       "anker": [
        300,
        226
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "dorpshuis3": {
     "gebouw": "timmerman",
     "beslaat": [
      6,
      8
     ],
     "fasen": [
      {
       "x": 0,
       "y": 4057,
       "b": 615,
       "h": 489,
       "anker": [
        396,
        271
       ],
       "naam": "fundering"
      },
      {
       "x": 615,
       "y": 4057,
       "b": 615,
       "h": 489,
       "anker": [
        396,
        271
       ],
       "naam": "geraamte"
      },
      {
       "x": 1230,
       "y": 4057,
       "b": 615,
       "h": 489,
       "anker": [
        396,
        271
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1845,
       "y": 4057,
       "b": 615,
       "h": 489,
       "anker": [
        396,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2460,
       "y": 4057,
       "b": 615,
       "h": 489,
       "anker": [
        396,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "dorpshuis5": {
     "gebouw": "brouwerij",
     "beslaat": [
      5,
      7
     ],
     "fasen": [
      {
       "x": 0,
       "y": 4546,
       "b": 551,
       "h": 464,
       "anker": [
        364,
        278
       ],
       "naam": "fundering"
      },
      {
       "x": 551,
       "y": 4546,
       "b": 551,
       "h": 464,
       "anker": [
        364,
        278
       ],
       "naam": "geraamte"
      },
      {
       "x": 1102,
       "y": 4546,
       "b": 551,
       "h": 464,
       "anker": [
        364,
        278
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1653,
       "y": 4546,
       "b": 551,
       "h": 464,
       "anker": [
        364,
        278
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2204,
       "y": 4546,
       "b": 551,
       "h": 464,
       "anker": [
        364,
        278
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "dorpKlein1": {
     "gebouw": "dorpKlein1",
     "beslaat": [
      5,
      7
     ],
     "fasen": [
      {
       "x": 0,
       "y": 5010,
       "b": 551,
       "h": 445,
       "anker": [
        364,
        259
       ],
       "naam": "fundering"
      },
      {
       "x": 551,
       "y": 5010,
       "b": 551,
       "h": 445,
       "anker": [
        364,
        259
       ],
       "naam": "geraamte"
      },
      {
       "x": 1102,
       "y": 5010,
       "b": 551,
       "h": 445,
       "anker": [
        364,
        259
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1653,
       "y": 5010,
       "b": 551,
       "h": 445,
       "anker": [
        364,
        259
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2204,
       "y": 5010,
       "b": 551,
       "h": 445,
       "anker": [
        364,
        259
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "dorpKlein3": {
     "gebouw": "dorpKlein3",
     "beslaat": [
      5,
      7
     ],
     "fasen": [
      {
       "x": 0,
       "y": 5455,
       "b": 551,
       "h": 458,
       "anker": [
        364,
        272
       ],
       "naam": "fundering"
      },
      {
       "x": 551,
       "y": 5455,
       "b": 551,
       "h": 458,
       "anker": [
        364,
        272
       ],
       "naam": "geraamte"
      },
      {
       "x": 1102,
       "y": 5455,
       "b": 551,
       "h": 458,
       "anker": [
        364,
        272
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1653,
       "y": 5455,
       "b": 551,
       "h": 458,
       "anker": [
        364,
        272
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2204,
       "y": 5455,
       "b": 551,
       "h": 458,
       "anker": [
        364,
        272
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "dorpGewoon3": {
     "gebouw": "dorpGewoon3",
     "beslaat": [
      6,
      8
     ],
     "fasen": [
      {
       "x": 0,
       "y": 5913,
       "b": 604,
       "h": 468,
       "anker": [
        396,
        250
       ],
       "naam": "fundering"
      },
      {
       "x": 604,
       "y": 5913,
       "b": 604,
       "h": 468,
       "anker": [
        396,
        250
       ],
       "naam": "geraamte"
      },
      {
       "x": 1208,
       "y": 5913,
       "b": 604,
       "h": 468,
       "anker": [
        396,
        250
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1812,
       "y": 5913,
       "b": 604,
       "h": 468,
       "anker": [
        396,
        250
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2416,
       "y": 5913,
       "b": 604,
       "h": 468,
       "anker": [
        396,
        250
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "dorpGewoon4": {
     "gebouw": "dorpGewoon4",
     "beslaat": [
      6,
      8
     ],
     "fasen": [
      {
       "x": 0,
       "y": 6381,
       "b": 615,
       "h": 496,
       "anker": [
        396,
        278
       ],
       "naam": "fundering"
      },
      {
       "x": 615,
       "y": 6381,
       "b": 615,
       "h": 496,
       "anker": [
        396,
        278
       ],
       "naam": "geraamte"
      },
      {
       "x": 1230,
       "y": 6381,
       "b": 615,
       "h": 496,
       "anker": [
        396,
        278
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 1845,
       "y": 6381,
       "b": 615,
       "h": 496,
       "anker": [
        396,
        278
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2460,
       "y": 6381,
       "b": 615,
       "h": 496,
       "anker": [
        396,
        278
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "dorpGroot1": {
     "gebouw": "dorpGroot1",
     "beslaat": [
      7,
      9
     ],
     "fasen": [
      {
       "x": 0,
       "y": 6877,
       "b": 679,
       "h": 560,
       "anker": [
        428,
        310
       ],
       "naam": "fundering"
      },
      {
       "x": 679,
       "y": 6877,
       "b": 679,
       "h": 560,
       "anker": [
        428,
        310
       ],
       "naam": "geraamte"
      },
      {
       "x": 1358,
       "y": 6877,
       "b": 679,
       "h": 560,
       "anker": [
        428,
        310
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 2037,
       "y": 6877,
       "b": 679,
       "h": 560,
       "anker": [
        428,
        310
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2716,
       "y": 6877,
       "b": 679,
       "h": 560,
       "anker": [
        428,
        310
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "dorpGroot2": {
     "gebouw": "dorpGroot2",
     "beslaat": [
      7,
      9
     ],
     "fasen": [
      {
       "x": 0,
       "y": 7437,
       "b": 668,
       "h": 508,
       "anker": [
        428,
        258
       ],
       "naam": "fundering"
      },
      {
       "x": 668,
       "y": 7437,
       "b": 668,
       "h": 508,
       "anker": [
        428,
        258
       ],
       "naam": "geraamte"
      },
      {
       "x": 1336,
       "y": 7437,
       "b": 668,
       "h": 508,
       "anker": [
        428,
        258
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 2004,
       "y": 7437,
       "b": 668,
       "h": 508,
       "anker": [
        428,
        258
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 2672,
       "y": 7437,
       "b": 668,
       "h": 508,
       "anker": [
        428,
        258
       ],
       "naam": "half-gedekt"
      }
     ]
    }
   }
  };
})(globalThis.Spel = globalThis.Spel || {});
